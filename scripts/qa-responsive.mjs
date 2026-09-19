// Responsive QA (P-01): every manifest route at 360/390/768/1280/1920/2560/3840, light + dark. Fails on horizontal scroll, console error, text < 12 px, blank page.
// Writes docs/qa/responsive-report.{md,json}. Usage: npm run build && npm run qa:responsive [-- --only=/dev] [-- --codes=D-07] [-- --widths=360,1280] [-- --themes=light] [-- --port=4174]
import { mkdirSync, writeFileSync } from 'node:fs';
import { arg, list, startPreview, launch, fetchManifest, fillParams, routeFilter, NOISE, initScript } from './qa-lib.mjs';
const args = process.argv.slice(2);
const PORT = Number(arg(args, 'port', process.env.QA_PORT ?? '4174'));
const WIDTHS = list(arg(args, 'widths', '360,390,768,1280,1920,2560,3840')).map(Number);
const THEMES = list(arg(args, 'themes', 'light,dark')); const ONLY = list(arg(args, 'only')); const CODES = list(arg(args, 'codes'));
const BASE = `http://localhost:${PORT}/#`; const OUT = new URL('../docs/qa/', import.meta.url);
const scan = (w) => {
  const de = document.documentElement; const hscroll = de.scrollWidth > w + 1;
  const offenders = hscroll ? [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > w + 1 && el.getClientRects().length).slice(0, 5).map((el) => ({ selector: `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''}`, right: Math.round(el.getBoundingClientRect().right) })) : [];
  const small = []; for (const el of document.querySelectorAll('body *')) { if (!el.childNodes.length) continue; const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); if (!hasText) continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue; const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; const fs = parseFloat(cs.fontSize); if (fs < 12 && !el.closest('[aria-hidden="true"]')) small.push(`${el.tagName.toLowerCase()} ${fs}px "${el.textContent.trim().slice(0, 30)}"`); }
  const blank = !document.querySelector('#root > *') || document.body.innerText.trim().length < 5;
  return { hscroll, scrollWidth: de.scrollWidth, offenders, smallText: small.length, smallTextSamples: small.slice(0, 5), blank, hash: location.hash };
};
async function main() {
  const server = await startPreview(PORT); const browser = await launch();
  let manifest; try { manifest = await fetchManifest(browser, BASE); } catch (e) { console.error(e.message); await browser.close(); server.kill(); process.exit(1); }
  const routes = manifest.filter(routeFilter(ONLY, CODES)).filter((r) => !r.path.includes('*'));
  console.log(`${routes.length} routes x ${WIDTHS.join('/')} x ${THEMES.join('+')}`);
  const report = { generatedAt: new Date().toISOString(), widths: WIDTHS, themes: THEMES, routes: [] };
  const isFail = (c) => c.hscroll || c.errors.length || c.smallText > 0 || c.blank;
  for (const r of routes) {
    const entry = { code: r.code, path: r.path, name: r.spec?.name ?? r.code, surface: r.surface, status: r.status, cells: {} }; const url = fillParams(r.path);
    for (const width of WIDTHS) for (const theme of THEMES) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, deviceScaleFactor: 1 }); await ctx.addInitScript(...initScript(theme, r.path));
      const page = await ctx.newPage(); await page.route(/^https?:\/\/(?!localhost)/, (x) => x.abort());
      const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errors.push(m.text()); });
      let cell = { hscroll: false, scrollWidth: 0, offenders: [], smallText: 0, smallTextSamples: [], blank: false, redirectedTo: null, errors: [] };
      try { await page.goto(`${BASE}${url}`, { waitUntil: 'load', timeout: 20000 }); await page.waitForSelector('#root > *:not(dialog)', { timeout: 10000 }); await page.waitForTimeout(500); const res = await page.evaluate(scan, width); const landed = res.hash.replace(/^#/, '').split('?')[0].replace(/\/$/, '') || '/'; delete res.hash; cell = { ...res, redirectedTo: landed !== url ? landed : null, errors: [...new Set(errors)].slice(0, 5) }; } catch (e) { cell.errors = [String(e.message).split('\n')[0]]; }
      entry.cells[`${width}-${theme}`] = cell; await ctx.close();
    }
    const fails = Object.values(entry.cells).filter(isFail).length; process.stdout.write(`${r.code.padEnd(8)} ${r.path.padEnd(34)} ${fails ? `FAIL x${fails}` : 'ok'}\n`); report.routes.push(entry);
  }
  await browser.close(); server.kill(); mkdirSync(OUT, { recursive: true });
  writeFileSync(new URL('responsive-report.json', OUT), JSON.stringify(report));
  const cells = report.routes.flatMap((r) => Object.entries(r.cells)); const failing = cells.filter(([, c]) => isFail(c));
  let md = `# Responsive QA report\n\ngenerated: ${report.generatedAt}\nroutes: ${report.routes.length}\nwidths: ${WIDTHS.join(', ')}\nthemes: ${THEMES.join(', ')}\ncells: ${cells.length}\nfailing_cells: ${failing.length}\n\n_Written by \`npm run qa:responsive\`. Fail = horizontal scroll, console error, visible text under 12 px, or a blank page. Runs as the super admin with dev mode off._\n\n## Matrix (${THEMES.join(' / ')})\n\n| Code | Route | ${WIDTHS.join(' | ')} |\n| --- | --- | ${WIDTHS.map(() => '---').join(' | ')} |\n`;
  const mark = (c) => (!c ? '·' : isFail(c) ? `FAIL${c.hscroll ? ` ${c.scrollWidth}px` : ''}${c.errors.length ? ' err' : ''}${c.smallText ? ` small${c.smallText}` : ''}${c.blank ? ' blank' : ''}` : 'ok');
  for (const r of report.routes) md += `| \`${r.code}\` | \`${r.path}\` | ${WIDTHS.map((w) => THEMES.map((t) => mark(r.cells[`${w}-${t}`])).join(' / ')).join(' | ')} |\n`;
  if (failing.length) { md += `\n## Failing cells\n\n`; for (const r of report.routes) for (const [k, c] of Object.entries(r.cells)) if (isFail(c)) md += `- \`${r.code}\` ${r.path} @ ${k}: ${c.hscroll ? `scrollWidth ${c.scrollWidth}; offenders: ${c.offenders.map((o) => `${o.selector} (${o.right}px)`).join(', ') || 'none'}` : ''}${c.errors.length ? ` errors: ${c.errors.join(' | ')}` : ''}${c.smallText ? ` small text x${c.smallText}: ${c.smallTextSamples.join('; ')}` : ''}${c.blank ? ' blank page' : ''}\n`; }
  writeFileSync(new URL('responsive-report.md', OUT), md);
  console.log(`\nwrote docs/qa/responsive-report.{md,json}: ${cells.length} cells, ${failing.length} failing`);
  process.exit(failing.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
