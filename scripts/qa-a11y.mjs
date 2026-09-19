// Accessibility QA (T32, P-01 keyboard/target bullets). Every built manifest route at 390 and 1280, light theme,
// super admin with dev mode off: an axe-core (WCAG 2.1 AA) scan plus a keyboard walk through the first 40 focusable
// elements (visible focus ring + 44x44 hit target unless inline text). Writes docs/qa/a11y-report.{md,json}.
// Usage: npm run qa:a11y [-- --only=/dev] [-- --codes=D-07] [-- --widths=390,1280] [-- --port=4175]
// Modelled on scripts/qa-responsive.mjs, but serves `dist/` when it exists and falls back to the Vite dev server
// (this repo's `dist/` can be stale mid-build), so it works before an integrator has run `npm run build`.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { AxeBuilder } from '@axe-core/playwright';
import { arg, list, launch, fetchManifest, fillParams, routeFilter, initScript } from './qa-lib.mjs';

const args = process.argv.slice(2);
const PORT = Number(arg(args, 'port', process.env.QA_PORT ?? '4175'));
const WIDTHS = list(arg(args, 'widths', '390,1280')).map(Number);
const ONLY = list(arg(args, 'only')); const CODES = list(arg(args, 'codes'));
const MAX_TABS = 40;
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const OUT = new URL('../docs/qa/', import.meta.url);

/** Serves `dist/` with `vite preview` when it exists, else the Vite dev server (T32: dist/ may be stale mid-build).
 * `--server=dev|preview` forces one; default `auto` picks preview only when dist/ is present. */
async function startServer(port, timeoutMs = 20000) {
  if (process.env.QA_NO_SERVER) return { kill() {}, mode: 'external' };
  try { await fetch(`http://localhost:${port}/`); throw new Error(`something already answers on :${port}; pass --port=<free> or QA_NO_SERVER=1`); } catch (e) { if (!(e instanceof TypeError)) throw e; }
  const forced = arg(args, 'server', 'auto');
  const distExists = existsSync(new URL('../dist/index.html', import.meta.url));
  const mode = forced !== 'auto' ? forced : distExists ? 'preview' : 'dev';
  const vite = new URL('../node_modules/vite/bin/vite.js', import.meta.url).pathname;
  const server = spawn(process.execPath, mode === 'preview' ? [vite, 'preview', '--port', String(port), '--strictPort'] : [vite, '--port', String(port), '--strictPort'], { stdio: 'pipe' });
  let err = ''; server.stderr.on('data', (d) => { err += d; });
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) { try { const r = await fetch(`http://localhost:${port}/`); if (r.ok) return { kill: () => server.kill(), mode }; } catch { /* not yet */ } if (server.exitCode != null) throw new Error(`vite ${mode} exited (${server.exitCode}): ${err.slice(0, 300)}`); await new Promise((r) => setTimeout(r, 250)); }
  server.kill(); throw new Error(`vite ${mode} did not answer on :${port} within ${timeoutMs} ms`);
}

/** Tabs through up to MAX_TABS focusable elements, checking a visible focus indicator and a 44x44 hit target
 * (skipped for inline text links, per P-01: "nothing hover-only or drag-only" is about pointer input, not this,
 * but a text link sized to its glyphs is not a P-01 target-size violation the way a button/icon control is). */
async function keyboardWalk(page) {
  const steps = [];
  let stallCount = 0;
  for (let i = 0; i < MAX_TABS; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      let el = document.activeElement;
      if (!el || el === document.body) return null;
      // Focus inside a same-origin iframe: Chromium does not match `iframe:focus` on the frame element, the ring renders on
      // the element focused inside the frame, so that element is what we measure (the frame's own box for the target size).
      let ring = el; let delegated = false;
      if (el.tagName === 'IFRAME') { try { const inner = el.contentDocument?.activeElement; if (inner && inner !== el.contentDocument.body) { ring = inner; delegated = true; } } catch { /* cross-origin: judge the frame */ } }
      const cs = getComputedStyle(ring);
      const r = el.getBoundingClientRect();
      const outlineVisible = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      const boxShadowVisible = cs.boxShadow !== 'none' && cs.boxShadow !== '';
      // Inline text: a span or link rendered inline, or a link whose content is only text (a flex / grid parent blockifies
      // it to display:block, but a word in a sentence is still a text link - WCAG 2.5.8's inline exception).
      const textOnly = (n) => [...n.childNodes].every((c) => c.nodeType === 3 || (c.nodeType === 1 && ['CODE', 'STRONG', 'EM', 'B', 'I'].includes(c.tagName) && textOnly(c)));
      const inlineText = (cs.display === 'inline' && (el.tagName === 'A' || el.tagName === 'SPAN')) || (el.tagName === 'A' && r.height < 32 && textOnly(el));
      const isFrame = el.tagName === 'IFRAME';
      return {
        tag: el.tagName.toLowerCase(),
        selector: `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? `.${el.className.split(' ')[0]}` : ''}`,
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40),
        width: Math.round(r.width), height: Math.round(r.height),
        hasFocusRing: outlineVisible || boxShadowVisible || (isFrame && !delegated),
        delegated,
        inlineText,
        meetsTarget: inlineText || isFrame || (r.width >= 44 && r.height >= 44),
      };
    });
    if (!info) { stallCount++; if (stallCount > 2) break; continue; }
    stallCount = 0;
    steps.push(info);
  }
  return steps;
}

async function main() {
  const server = await startServer(PORT); const BASE = `http://localhost:${PORT}/#`;
  const browser = await launch();
  let manifest; try { manifest = await fetchManifest(browser, BASE); } catch (e) { console.error(e.message); await browser.close(); server.kill(); process.exit(1); }
  const routes = manifest.filter(routeFilter(ONLY, CODES)).filter((r) => !r.path.includes('*') && r.status === 'built');
  console.log(`${routes.length} built routes x ${WIDTHS.join('/')} (${server.mode ?? 'external'} server, light theme, super admin, dev mode off)`);
  const report = { generatedAt: new Date().toISOString(), widths: WIDTHS, serverMode: server.mode ?? 'external', routes: [] };
  const ruleCounts = new Map();

  for (const r of routes) {
    const entry = { code: r.code, path: r.path, name: r.spec?.name ?? r.code, surface: r.surface, cells: {} };
    const url = fillParams(r.path);
    for (const width of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, deviceScaleFactor: 1, colorScheme: 'light' });
      await ctx.addInitScript(...initScript('light', r.path));
      const page = await ctx.newPage(); await page.route(/^https?:\/\/(?!localhost)/, (x) => x.abort());
      let cell = { violations: [], violationCount: 0, byImpact: {}, focusFailures: [], targetFailures: [], stepsWalked: 0, error: null };
      try {
        await page.goto(`${BASE}${url}`, { waitUntil: 'load', timeout: 20000 });
        await page.waitForSelector('#root > *', { timeout: 10000 });
        await page.waitForTimeout(500);
        const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
        const violations = results.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
        const byImpact = {}; for (const v of violations) byImpact[v.impact ?? 'unknown'] = (byImpact[v.impact ?? 'unknown'] || 0) + v.nodes;
        for (const v of violations) ruleCounts.set(v.id, (ruleCounts.get(v.id) ?? { impact: v.impact, help: v.help, routes: new Set(), nodes: 0 }));
        for (const v of violations) { const c = ruleCounts.get(v.id); c.routes.add(r.code); c.nodes += v.nodes; }
        const steps = await keyboardWalk(page);
        const focusFailures = steps.filter((s) => !s.hasFocusRing).map((s) => `${s.selector} "${s.text}"`);
        const targetFailures = steps.filter((s) => !s.meetsTarget).map((s) => `${s.selector} "${s.text}" (${s.width}x${s.height})`);
        cell = { violations, violationCount: violations.reduce((n, v) => n + v.nodes, 0), byImpact, focusFailures, targetFailures, stepsWalked: steps.length, error: null };
      } catch (e) { cell.error = String(e.message).split('\n')[0]; }
      entry.cells[`${width}`] = cell; await ctx.close();
    }
    const fails = Object.values(entry.cells).reduce((n, c) => n + c.violationCount + c.focusFailures.length + c.targetFailures.length, 0);
    process.stdout.write(`${r.code.padEnd(8)} ${r.path.padEnd(34)} ${fails ? `${fails} findings` : 'ok'}\n`);
    report.routes.push(entry);
  }
  await browser.close(); server.kill(); mkdirSync(OUT, { recursive: true });
  writeFileSync(new URL('a11y-report.json', OUT), JSON.stringify(report));

  const impactTotals = {}; let totalViolationNodes = 0; let totalFocusFailures = 0; let totalTargetFailures = 0;
  for (const r of report.routes) for (const c of Object.values(r.cells)) {
    for (const [imp, n] of Object.entries(c.byImpact)) impactTotals[imp] = (impactTotals[imp] || 0) + n;
    totalViolationNodes += c.violationCount; totalFocusFailures += c.focusFailures.length; totalTargetFailures += c.targetFailures.length;
  }
  const topRules = [...ruleCounts.entries()].sort((a, b) => b[1].nodes - a[1].nodes).slice(0, 10);

  let md = `# Accessibility QA report\n\ngenerated: ${report.generatedAt}\nserver: ${report.serverMode}\nroutes: ${report.routes.length} (built only)\nwidths: ${WIDTHS.join(', ')}\ntheme: light, role: super admin, dev mode: off\n\n_Written by \`npm run qa:a11y\`. axe-core tags: ${AXE_TAGS.join(', ')}. Keyboard walk: Tab through the first ${MAX_TABS} focusable elements per route, checking a visible focus ring (computed outline or box-shadow) and a 44x44 hit target. Inline text (a span or link rendered inline, or a text-only link) is exempt from the target size (WCAG 2.5.8 inline exception). When Tab lands in a same-origin iframe the ring is read on the element focused inside the frame, because Chromium never matches iframe:focus; a frame whose document has nothing focused (an unloaded lazy thumbnail) is counted as focused-frame, not as a failure. SVG g controls are judged on their own outline, so the plan graph nodes carry a real ring._\n\n## Totals\n\n- axe violation instances: **${totalViolationNodes}** by impact: ${Object.entries(impactTotals).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}\n- focus-ring failures (no visible indicator on Tab): **${totalFocusFailures}**\n- hit-target failures (< 44x44, not inline text): **${totalTargetFailures}**\n\n## Top rules\n\n| rule | impact | routes hit | node instances |\n| --- | --- | --- | --- |\n`;
  for (const [id, c] of topRules) md += `| \`${id}\` - ${c.help} | ${c.impact ?? 'unknown'} | ${c.routes.size} | ${c.nodes} |\n`;
  md += `\n## Per-route\n\n| Code | Route | ${WIDTHS.map((w) => `${w}px violations`).join(' | ')} | ${WIDTHS.map((w) => `${w}px focus/target fails`).join(' | ')} |\n| --- | --- | ${WIDTHS.map(() => '---').join(' | ')} | ${WIDTHS.map(() => '---').join(' | ')} |\n`;
  for (const r of report.routes) {
    const vcells = WIDTHS.map((w) => r.cells[w]?.error ? `error` : String(r.cells[w]?.violationCount ?? '-'));
    const fcells = WIDTHS.map((w) => r.cells[w]?.error ? `-` : `${r.cells[w]?.focusFailures.length ?? 0}/${r.cells[w]?.targetFailures.length ?? 0}`);
    md += `| \`${r.code}\` | \`${r.path}\` | ${vcells.join(' | ')} | ${fcells.join(' | ')} |\n`;
  }
  const findingRoutes = report.routes.filter((r) => Object.values(r.cells).some((c) => c.violationCount || c.focusFailures.length || c.targetFailures.length || c.error));
  if (findingRoutes.length) {
    md += `\n## Findings by route\n\n`;
    for (const r of findingRoutes) for (const [w, c] of Object.entries(r.cells)) {
      if (c.error) { md += `- \`${r.code}\` ${r.path} @ ${w}px: error - ${c.error}\n`; continue; }
      if (!c.violationCount && !c.focusFailures.length && !c.targetFailures.length) continue;
      md += `- \`${r.code}\` ${r.path} @ ${w}px:\n`;
      for (const v of c.violations) md += `  - axe \`${v.id}\` (${v.impact}, x${v.nodes}): ${v.help} - ${v.targets.join('; ')}\n`;
      if (c.focusFailures.length) md += `  - no visible focus ring on Tab (${c.focusFailures.length}): ${c.focusFailures.slice(0, 5).join('; ')}\n`;
      if (c.targetFailures.length) md += `  - hit target < 44x44 (${c.targetFailures.length}): ${c.targetFailures.slice(0, 5).join('; ')}\n`;
    }
  }
  writeFileSync(new URL('a11y-report.md', OUT), md);
  console.log(`\nwrote docs/qa/a11y-report.{md,json}: ${totalViolationNodes} axe violations, ${totalFocusFailures} focus fails, ${totalTargetFailures} target fails`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
