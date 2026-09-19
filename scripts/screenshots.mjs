// Captures routes at 390 and 1280 (light; + dark for key pages) to docs/screenshots/<CODE>/<width>[-dark][-<label>].jpg and writes routes.json.
// Usage: npm run build && npm run screenshots [-- --codes=HUB-01,D-07] [-- --only=/dev] [-- --widths=390,1280] [-- --dark] [-- --dev=on|off] [-- --label=before] [-- --smoke] [-- --port=4173]
// Chromium is preinstalled at /opt/pw-browsers; never run `playwright install`. External requests are blocked (works behind the proxy).
import { mkdirSync, writeFileSync } from 'node:fs';
import { arg, list, startPreview, launch, fetchManifest, fillParams, routeFilter, NOISE, initScript } from './qa-lib.mjs';
const args = process.argv.slice(2);
const SMOKE = args.includes('--smoke'); const ALL_DARK = args.includes('--dark');
const ONLY = list(arg(args, 'only')); const CODES = list(arg(args, 'codes')); const LABEL = arg(args, 'label'); const QUALITY = Number(arg(args, 'quality', '72'));
// Dev mode (SpecChips, placeholder badges) only on the D- dev-tool pages unless --dev=on / --dev=off forces it: product screenshots show the product.
const DEV = arg(args, 'dev', 'auto'); const devFor = (code) => (DEV === 'on' ? true : DEV === 'off' ? false : code.startsWith('D-'));
const WIDTHS = SMOKE ? [1280] : list(arg(args, 'widths', '390,1280')).map(Number);
const PORT = Number(arg(args, 'port', process.env.QA_PORT ?? '4173')); const BASE = `http://localhost:${PORT}/#`;
const KEY_PAGES = new Set(['HUB-01', 'D-01', 'D-02', 'D-07', 'L-01', 'C-01', 'K-01', 'S-01', 'A-01']);
const fileName = (w, theme, label = '') => `${w}${theme === 'dark' ? '-dark' : ''}${label ? `-${label}` : ''}.jpg`;
async function main() {
  const server = await startPreview(PORT); const browser = await launch();
  let manifest; try { manifest = await fetchManifest(browser, BASE); } catch (e) { console.error(e.message); await browser.close(); server.kill(); process.exit(1); }
  mkdirSync(new URL('../docs/screenshots/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../docs/screenshots/routes.json', import.meta.url), JSON.stringify(manifest, null, 1));
  const list_ = manifest.filter(routeFilter(ONLY, CODES)).filter((r) => !r.path.includes('*'));
  const problems = []; const seen = new Set(); let captured = 0;
  console.log(`${list_.length} routes · ${WIDTHS.join('/')} px${SMOKE ? ' · smoke' : ''}`);
  for (const { path, code } of list_) {
    if (seen.has(code)) continue; seen.add(code);
    const url = fillParams(path);
    for (const width of WIDTHS) for (const theme of !SMOKE && (ALL_DARK || KEY_PAGES.has(code)) ? ['light', 'dark'] : ['light']) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 800 }, deviceScaleFactor: 1 });
      await ctx.addInitScript(...initScript(theme, path, { devMode: devFor(code) }));
      const page = await ctx.newPage(); await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
      const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errors.push(m.text()); });
      try { await page.goto(`${BASE}${url}`, { waitUntil: 'load', timeout: 20000 }); await page.waitForSelector('#root > *', { timeout: 10000 }); await page.waitForTimeout(width >= 600 ? 1700 : 700); // full-page shots wait for the landing reveal fallback (1.2 s)
        if (!SMOKE) { const dir = new URL(`../docs/screenshots/${code}/`, import.meta.url); mkdirSync(dir, { recursive: true }); await page.screenshot({ path: new URL(fileName(width, theme, LABEL), dir).pathname, fullPage: width >= 600, type: 'jpeg', quality: QUALITY }); captured++; }
      } catch (e) { errors.push(String(e.message).split('\n')[0]); }
      if (errors.length) problems.push({ path, width, theme, errors: [...new Set(errors)].slice(0, 3) });
      await ctx.close();
    }
    process.stdout.write(`${code.padEnd(8)} ${path}\n`);
  }
  await browser.close(); server.kill();
  if (problems.length) { console.log('\nPROBLEMS:'); for (const p of problems) console.log(`  ${p.path} [${p.width}/${p.theme}]`, p.errors.join(' | ')); } else console.log(`\nno console errors${SMOKE ? '' : ` · ${captured} files`}`);
  process.exit(problems.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
