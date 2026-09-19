// Remote / d-pad rehearsal (T47, P-04). Every built manifest route at 1920, light theme, super admin, dev mode off:
// starting with nothing focused, the script explores the page with ARROW KEYS ONLY (breadth-first: from every element it
// reaches it presses Up / Down / Left / Right and records where focus lands), then reports per route
//   - reachable focusables vs. the spatial candidates on the page (the hook's own `focusables()` rule: visible, enabled,
//     not under [data-spatial="skip"] and not an iframe),
//   - primary CTAs (.btn-primary / .btn-accent / [data-cta="primary"]) that arrows never reached,
//   - dead ends: an element from which no arrow moves focus while the page has more than one candidate. A native select or
//     text field owns its arrows by design (the hook leaves them alone; Escape parks focus so the next arrow moves on), so those
//     are listed as "arrow owners", everything else is a real d-pad trap,
//   - pages where the first arrow does nothing (no spatial hook mounted on that shell yet),
//   - Backspace from the first focused element: did the hash go one level up (or stay on a root)?
// Writes docs/qa/dpad-report.{md,json}. Report only (exit 0) unless --strict.
// Usage: npm run qa:dpad [-- --only=/studio] [-- --codes=HUB-01,K-01] [-- --width=1920] [-- --port=5177] [-- --server=dev|preview|auto] [-- --max-steps=400] [-- --strict]
// Serving: reuses whatever answers on --port (QA_NO_SERVER=1 forces reuse), else `vite preview` when dist/ exists, else the Vite dev server.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { arg, list, launch, fetchManifest, fillParams, routeFilter, initScript, NOISE } from './qa-lib.mjs';

const args = process.argv.slice(2);
const PORT = Number(arg(args, 'port', process.env.QA_PORT ?? '5177'));
const WIDTH = Number(arg(args, 'width', '1920'));
const ONLY = list(arg(args, 'only')); const CODES = list(arg(args, 'codes'));
const MAX_STEPS = Number(arg(args, 'max-steps', '400'));
const STRICT = args.includes('--strict');
const OUT = new URL('../docs/qa/', import.meta.url);
const ARROWS = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];

async function startServer(port, timeoutMs = 25000) {
  try { await fetch(`http://localhost:${port}/`); return { kill() {}, mode: 'external' }; } catch (e) { if (!(e instanceof TypeError)) throw e; }
  if (process.env.QA_NO_SERVER) throw new Error(`QA_NO_SERVER=1 but nothing answers on :${port}`);
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

/** Browser-side: a stable key + description for the focused element, and the spatial candidate set (mirrors src/a11y/spatial.ts focusables). */
const PAGE_FNS = `
  window.__dpad = {
    els: [], // identity-stable keys: a page that re-renders during the walk must not shift them
    key(el) { if (!el || el === document.body) return null; let i = this.els.indexOf(el); if (i < 0) { this.els.push(el); i = this.els.length - 1; } return i; },
    // a React re-render can replace a node while the walk runs: find the equivalent element again by tag + component + text
    refocus(k) { let el = this.els[k]; if (el && !el.isConnected) { const d = this.describe(el); el = [...document.querySelectorAll(el.tagName)].find((x) => { const y = this.describe(x); return y && y.comp === d.comp && y.text === d.text; }) || null; if (el) this.els[k] = el; } if (!el) return 'gone'; el.focus({ preventScroll: false }); return document.activeElement === el; },
    describe(el) { if (!el || el === document.body) return null; const cs = getComputedStyle(el); const comp = el.closest('[data-component]')?.getAttribute('data-component') ?? ''; const text = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').trim().replace(/\\s+/g, ' ').slice(0, 60); const r = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), comp, text, primary: el.matches('.btn-primary, .btn-accent, [data-cta="primary"]') || !!el.querySelector(':scope > .btn-primary, :scope > .btn-accent'), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow !== 'none' && cs.boxShadow !== '') }; },
    candidates() { const out = []; for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]')) { if (el.tabIndex < 0 || el.disabled || el.getAttribute('aria-disabled') === 'true') continue; if (el.tagName === 'IFRAME' || el.closest('[data-spatial="skip"]')) continue; const r = el.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0) || getComputedStyle(el).visibility === 'hidden' || el.closest('[hidden], [aria-hidden="true"], [inert]')) continue; out.push(el); } return out; },
    primaries() { return [...document.querySelectorAll('.btn-primary, .btn-accent, [data-cta="primary"]')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.disabled && el.getAttribute('aria-disabled') !== 'true' && el.getAttribute('aria-busy') !== 'true' && !el.closest('[data-spatial="skip"], [hidden], [aria-hidden="true"]'); }); },
    // a CTA counts as reached when the arrows landed on it, on the link wrapping it, or on the button inside it
    snapshot() { const c = this.candidates(); const p = this.primaries(); return { candidates: c.length, candidateKeys: c.map((el) => this.key(el)), primaries: p.map((el) => ({ keys: [el, el.closest('a[href]'), el.querySelector('a[href], button')].filter(Boolean).map((x) => this.key(x)), ...this.describe(el) })) }; },
    active() { const el = document.activeElement; const info = this.describe(el); if (info) info.inSkip = !!el.closest('[data-spatial="skip"]'); return { key: this.key(el), info }; },
  };`;

async function rehearse(page, route) {
  await page.evaluate(PAGE_FNS);
  const snap = await page.evaluate(() => window.__dpad.snapshot());
  const visited = new Map(); // key -> info
  const edges = []; const deadEnds = []; let steps = 0; let firstArrowMoved = null; let stale = 0;
  await page.evaluate(() => { document.activeElement?.blur?.(); });
  await page.keyboard.press('ArrowDown'); steps++;
  let start = await page.evaluate(() => window.__dpad.active());
  firstArrowMoved = start.key != null && start.key >= 0;
  if (!firstArrowMoved) { await page.keyboard.press('ArrowRight'); steps++; start = await page.evaluate(() => window.__dpad.active()); firstArrowMoved = start.key != null && start.key >= 0; }
  const queue = [];
  if (firstArrowMoved) { visited.set(start.key, start.info); queue.push(start.key); }
  while (queue.length && steps < MAX_STEPS) {
    const from = queue.shift();
    let moved = 0;
    for (const dir of ARROWS) {
      if (steps >= MAX_STEPS) break;
      // re-focus the source element by index so every arrow starts from the same place
      const ok = await page.evaluate((k) => window.__dpad.refocus(k), from);
      if (ok !== true) { stale++; moved = -1; break; } // the node is gone or refuses focus (disabled meanwhile): not a dead end, a stale entry
      await page.keyboard.press(dir); steps++;
      const to = await page.evaluate(() => window.__dpad.active());
      if (to.key != null && to.key >= 0 && to.key !== from) { moved++; edges.push({ from, dir, to: to.key }); if (!visited.has(to.key)) { visited.set(to.key, to.info); queue.push(to.key); } }
    }
    if (moved === 0 && snap.candidates > 1 && !visited.get(from)?.inSkip) deadEnds.push({ key: from, ...visited.get(from) }); // inside [data-spatial="skip"] the page owns the arrows: not a trap of the hook
  }
  // Backspace from the first element: one hash level up or stay on a root
  let back = null;
  if (firstArrowMoved) {
    const before = await page.evaluate(() => location.hash);
    await page.evaluate((k) => window.__dpad.refocus(k), start.key);
    const info = visited.get(start.key);
    if (info && !['input', 'select', 'textarea'].includes(info.tag)) { await page.keyboard.press('Backspace'); await page.waitForTimeout(250); const after = await page.evaluate(() => location.hash); back = { before, after, moved: before !== after }; }
    else back = { before, after: before, moved: false, skipped: 'first element is a text field' };
  }
  // the walk itself can change UI state (a radiogroup reacts to Left / Right): judge against what exists both before and after
  const end = await page.evaluate(() => window.__dpad.snapshot());
  const candidateSet = new Set(snap.candidateKeys);
  const reachable = [...visited.keys()].filter((k) => candidateSet.has(k)).length;
  const endKeys = new Set(end.primaries.flatMap((p) => p.keys));
  const unreachedPrimaries = snap.primaries.filter((p) => !p.keys.some((k) => visited.has(k)) && p.keys.some((k) => endKeys.has(k)));
  const owner = (d) => ['select', 'input', 'textarea'].includes(d.tag);
  return { route: route.path, code: route.code, surface: route.surface, candidates: snap.candidates, reachable, coverage: snap.candidates ? Math.round((reachable / snap.candidates) * 100) : 100, budgetExhausted: steps >= MAX_STEPS, primaries: snap.primaries.length, unreachedPrimaries: unreachedPrimaries.map((p) => ({ text: p.text, comp: p.comp, x: p.x, y: p.y })), deadEnds: deadEnds.filter((d) => !owner(d)).map((d) => ({ text: d.text, comp: d.comp, tag: d.tag })), arrowOwners: deadEnds.filter(owner).map((d) => ({ text: d.text, comp: d.comp, tag: d.tag })), hookMounted: firstArrowMoved, back, steps, stale, edges: edges.length };
}

async function main() {
  const server = await startServer(PORT);
  const base = `http://localhost:${PORT}`;
  const browser = await launch();
  const results = []; const consoleErrors = {};
  try {
    const manifest = await fetchManifest(browser, base);
    const routes = manifest.filter((r) => r.status === 'built').filter(routeFilter(ONLY, CODES));
    console.log(`qa:dpad · ${routes.length} routes · ${WIDTH} px · server ${server.mode} on :${PORT}`);
    for (const r of routes) {
      const ctx = await browser.newContext({ viewport: { width: WIDTH, height: Math.round(WIDTH * 9 / 16) }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.route(/^https?:\/\/(?!localhost)/, (x) => x.abort());
      page.on('pageerror', (e) => { (consoleErrors[r.code] ??= []).push(String(e.message)); });
      page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) (consoleErrors[r.code] ??= []).push(m.text()); });
      const [fn, initArgs] = initScript('light', r.path); await page.addInitScript(fn, initArgs);
      const path = fillParams(r.path);
      try {
        await page.goto(`${base}/#${path}`, { waitUntil: 'load', timeout: 20000 });
        await page.waitForFunction(() => window.__leadmagnet?.routes?.length > 0, null, { timeout: 15000 });
        await page.waitForTimeout(600);
        const res = await rehearse(page, { ...r, path });
        results.push(res);
        console.log(`${r.code.padEnd(7)} ${path.padEnd(34)} ${res.hookMounted ? 'd-pad' : 'NO HOOK'}  ${String(res.reachable).padStart(3)}/${String(res.candidates).padEnd(3)} ${String(res.coverage).padStart(3)}%  primaries ${res.primaries - res.unreachedPrimaries.length}/${res.primaries}  dead ends ${res.deadEnds.length}  owners ${res.arrowOwners.length}${res.stale ? `  stale ${res.stale}` : ''}  back ${res.back ? (res.back.moved ? 'up' : res.back.skipped ? 'skip' : 'stay') : '-'}${res.budgetExhausted ? '  (budget)' : ''}`);
      } catch (e) { results.push({ route: path, code: r.code, surface: r.surface, error: String(e.message).slice(0, 200) }); console.log(`${r.code.padEnd(7)} ${path.padEnd(34)} ERROR ${String(e.message).slice(0, 120)}`); }
      finally { await ctx.close(); }
    }
  } finally { await browser.close(); server.kill(); }
  mkdirSync(OUT, { recursive: true });
  const ok = results.filter((r) => !r.error);
  const totals = { routes: results.length, hookMounted: ok.filter((r) => r.hookMounted).length, noHook: ok.filter((r) => !r.hookMounted).map((r) => r.code), unreachedPrimaries: ok.reduce((n, r) => n + r.unreachedPrimaries.length, 0), deadEnds: ok.reduce((n, r) => n + r.deadEnds.length, 0), arrowOwners: ok.reduce((n, r) => n + r.arrowOwners.length, 0), budgetExhausted: ok.filter((r) => r.budgetExhausted).map((r) => r.code), avgCoverage: ok.length ? Math.round(ok.reduce((n, r) => n + r.coverage, 0) / ok.length) : 0, errors: results.filter((r) => r.error).length, consoleErrors: Object.values(consoleErrors).reduce((n, l) => n + l.length, 0) };
  const generated = new Date().toISOString();
  writeFileSync(new URL('dpad-report.json', OUT), `${JSON.stringify({ generated, width: WIDTH, server: server.mode, maxSteps: MAX_STEPS, totals, results, consoleErrors }, null, 1)}\n`);
  const md = [`# D-pad / remote rehearsal report`, '', `generated: ${generated}`, `server: ${server.mode}`, `routes: ${results.length} (built only)`, `width: ${WIDTH} (16:9), theme: light, role: super admin, dev mode: off, max steps per route: ${MAX_STEPS}`, '',
    `_Written by \`npm run qa:dpad\`. Arrow keys only, breadth-first from nothing focused: every element reached is left with Up / Down / Left / Right. Candidates follow the hook's own rule (visible, enabled, not under \`[data-spatial="skip"]\`, not an iframe). "NO HOOK" = the first arrow focused nothing (no \`useSpatialNav\` on that shell yet). Dead end = an element from which no arrow moves while the page has more than one candidate. Primary CTA = \`.btn-primary\`, \`.btn-accent\`, \`[data-cta="primary"]\`. Back = Backspace from the first element went one hash level up (\`up\`), stayed (\`stay\`: a root route) or was skipped because the element is a text field. Arrow owner = a native select / text field the d-pad cannot leave with an arrow (Escape parks focus, then the next arrow moves on; Tab also works). Coverage is bounded by the step budget: a route marked (budget) has more elements than the walk visited, not necessarily unreachable ones. A page that re-renders while the walk changes its state (a radiogroup reacting to Left / Right) can produce a one-off dead end: re-check those by hand before filing._`, '',
    '## Totals', '', `- routes with the d-pad hook: **${totals.hookMounted} / ${totals.routes}**${totals.noHook.length ? ` (no hook: ${totals.noHook.join(', ')})` : ''}`, `- primary CTAs never reached by arrows: **${totals.unreachedPrimaries}**`, `- dead ends (d-pad traps): **${totals.deadEnds}**`, `- arrow-owning controls met (select / text field, leave with Escape or Tab): ${totals.arrowOwners}`, `- routes that hit the ${MAX_STEPS}-step budget: ${totals.budgetExhausted.length ? totals.budgetExhausted.join(', ') : 'none'}`, `- average coverage (reachable / candidates): **${totals.avgCoverage}%**`, `- page errors: ${totals.errors} · console errors: ${totals.consoleErrors}`, '',
    '## Per route', '', '| code | route | hook | reachable / candidates | primaries reached | dead ends | owners | back | notes |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...results.map((r) => r.error ? `| ${r.code} | \`${r.route}\` | ERROR | | | | | | ${r.error} |` : `| ${r.code} | \`${r.route}\` | ${r.hookMounted ? 'yes' : '**no**'} | ${r.reachable} / ${r.candidates} (${r.coverage}%)${r.budgetExhausted ? ' (budget)' : ''} | ${r.primaries - r.unreachedPrimaries.length} / ${r.primaries} | ${r.deadEnds.length} | ${r.arrowOwners.length} | ${r.back ? (r.back.moved ? 'up' : r.back.skipped ? 'skip' : 'stay') : '-'} | ${[...r.unreachedPrimaries.map((p) => `unreached CTA "${p.text}"`), ...r.deadEnds.map((d) => `dead end ${d.comp || d.tag} "${d.text}"`), ...r.arrowOwners.slice(0, 3).map((d) => `owner ${d.comp || d.tag} "${d.text.slice(0, 24)}"`)].filter(Boolean).join('; ')} |`),
    '', '## Console errors', '', ...(Object.keys(consoleErrors).length ? Object.entries(consoleErrors).map(([c, l]) => `- ${c}: ${[...new Set(l)].slice(0, 3).join(' · ')}`) : ['none']), ''].join('\n');
  writeFileSync(new URL('dpad-report.md', OUT), md);
  console.log(`\nhook ${totals.hookMounted}/${totals.routes} · unreached primaries ${totals.unreachedPrimaries} · dead ends ${totals.deadEnds} · avg coverage ${totals.avgCoverage}% -> docs/qa/dpad-report.{md,json}`);
  if (STRICT && (totals.unreachedPrimaries || totals.deadEnds || totals.errors)) process.exit(1);
}
main().catch((e) => { console.error(e); process.exit(1); });
