// Shared helpers for scripts/screenshots.mjs and qa-responsive.mjs: preview server, chromium, manifest, params.
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { chromium } from 'playwright';
export const arg = (args, name, def = '') => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
export const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
export function findChromium() { try { const dir = readdirSync('/opt/pw-browsers').find((d) => /^chromium-\d+/.test(d)); if (dir) return `/opt/pw-browsers/${dir}/chrome-linux/chrome`; } catch { /* fall through */ } return process.env.CHROMIUM_PATH; }
/** Starts `vite preview` on `port` and resolves once it answers. QA_NO_SERVER=1 reuses a running one. */
export async function startPreview(port, timeoutMs = 20000) {
  if (process.env.QA_NO_SERVER) return { kill() {} };
  try { await fetch(`http://localhost:${port}/`); throw new Error(`something already answers on :${port}; pass --port=<free> or QA_NO_SERVER=1`); } catch (e) { if (!(e instanceof TypeError)) throw e; }
  const server = spawn(process.execPath, [new URL('../node_modules/vite/bin/vite.js', import.meta.url).pathname, 'preview', '--port', String(port), '--strictPort'], { stdio: 'pipe' });
  let err = ''; server.stderr.on('data', (d) => { err += d; });
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) { try { const r = await fetch(`http://localhost:${port}/`); if (r.ok) return { kill: () => server.kill() }; } catch { /* not yet */ } if (server.exitCode != null) throw new Error(`vite preview exited (${server.exitCode}): ${err.slice(0, 300)} - run npm run build first?`); await new Promise((r) => setTimeout(r, 250)); }
  server.kill(); throw new Error(`vite preview did not answer on :${port} within ${timeoutMs} ms`);
}
export async function launch() { return chromium.launch({ executablePath: findChromium(), args: ['--no-sandbox'] }); }
/** Reads window.__leadmagnet.routes with retries; de-duplicated by path. */
export async function fetchManifest(browser, base, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) { const ctx = await browser.newContext(); try { const page = await ctx.newPage(); await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort()); await page.goto(`${base}/`, { waitUntil: 'load', timeout: 20000 }); await page.waitForFunction(() => window.__leadmagnet?.routes?.length > 0, null, { timeout: 15000 }); const routes = await page.evaluate(() => window.__leadmagnet.routes); return routes.filter((r, k, a) => a.findIndex((x) => x.path === r.path) === k); } catch (e) { last = e; await new Promise((r) => setTimeout(r, 1000)); } finally { await ctx.close(); } }
  throw new Error(`could not read the route manifest after ${attempts} attempts: ${last?.message}`);
}
export const PARAMS = { ':slug': 'paws-and-play-austin', ':prospectId': 'pro_maya', ':id': 'pro_maya', ':role': 'owner', ':table': 'prospects', ':code': 'HUB-01', '*': '' };
export const fillParams = (path) => path.replace(/:\w+|\*/g, (p) => PARAMS[p] ?? 'x').replace(/\/$/, '') || '/';
export const routeFilter = (only, codes) => (r) => (!only.length || only.some((p) => (p.endsWith('$') ? r.path === p.slice(0, -1) : r.path === p || r.path.startsWith(p.endsWith('/') ? p : `${p}/`)))) && (!codes.length || codes.includes(r.code));
export const NOISE = /Failed to load resource|ERR_CERT|net::|favicon/;
/** Init script: theme + session (super admin, dev mode off unless asked). */
export function initScript(theme, _path = '/', opts = {}) {
  return [([th, uid, dev]) => { localStorage.setItem('leadmagnet.theme', th); localStorage.setItem('leadmagnet.session', JSON.stringify({ userId: uid, devMode: dev, viewAs: null })); localStorage.setItem('leadmagnet.lang', 'en'); }, [theme, opts.userId ?? 'usr_super', opts.devMode ?? false]];
}
