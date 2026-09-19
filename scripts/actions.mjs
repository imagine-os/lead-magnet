// The actions CLI (T45, docs/reference/control.md). Run: npm run actions -- <command>
//   list [--page CODE] [--json]                 every action (one row per unique id) with pages, permission, params, voice phrase
//   export                                      docs/reference/actions-manifest.json + docs/reference/voice-vocabulary.json from the compiled specs
//   run <action.id> [--param k=v ...] [--as <role>] [--port N] [--json]
//                                               Playwright: serves dist/ (or reuses a server on --port), opens the hub as <role>,
//                                               calls window.__leadmagnet.runAction(id, params), prints the result, exits 1 on ok:false
// Specs are TypeScript next to .tsx pages, so the manifest is bundled with esbuild (a Vite dependency); the pure schema helpers are
// imported straight from src/actions/schema.ts under Node 22 --experimental-strip-types like the other scripts.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';
import { arg, launch, startPreview, initScript } from './qa-lib.mjs';
const { buildToolSpecs, buildVocabulary } = await import('../src/actions/schema.ts');

const ROOT = new URL('../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', ROOT), 'utf8'));
const args = process.argv.slice(2);
const cmd = args[0];
const JSON_OUT = args.includes('--json');
const ROLE_USER = { super_admin: 'usr_super', strategist: 'usr_strategist', analyst: 'usr_analyst', prospect: 'usr_prospect', guest: 'usr_guest' };

/** Bundles every src/modules/<name>/index.ts (tsx + css) and applies the registry's built-beats-stub rule, without a browser. */
async function loadRoutes() {
  const modDir = new URL('src/modules/', ROOT);
  const names = readdirSync(modDir, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(new URL(`${d.name}/index.ts`, modDir))).map((d) => d.name).sort(); // same set as the registry's import.meta.glob
  const contents = `${names.map((n, i) => `import * as m${i} from '${new URL(`${n}/index.ts`, modDir).pathname}';`).join('\n')}
import { PageStub } from '${new URL('src/components/template/PageStub/PageStub.tsx', ROOT).pathname}';
export const modules = [${names.map((n, i) => `{ name: '${n}', routes: m${i}.routes ?? [] }`).join(', ')}];
export const isStub = (el) => !!el && typeof el === 'object' && el.type === PageStub;`;
  const r = await build({
    stdin: { contents, resolveDir: modDir.pathname, loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, jsx: 'automatic', logLevel: 'silent',
    loader: { '.css': 'empty', '.svg': 'empty', '.png': 'empty', '.jpg': 'empty', '.webp': 'empty', '.woff2': 'empty', '.md': 'text' },
    define: { 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true', 'import.meta.env.MODE': '"production"', __APP_VERSION__: JSON.stringify(pkg.version) },
    banner: { js: 'import.meta.glob = () => ({});\nglobalThis.window ??= undefined;' },
  });
  const url = `data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString('base64')}`;
  const { modules, isStub } = await import(url);
  const byPath = new Map();
  for (const m of modules) for (const route of m.routes) {
    const prev = byPath.get(route.path);
    if (!prev || (isStub(prev.element) && !isStub(route.element))) byPath.set(route.path, route);
  }
  return [...byPath.values()].map((r) => ({ path: r.path, code: r.spec.code, surface: r.surface, status: isStub(r.element) ? 'stub' : 'built', roles: r.roles, spec: r.spec }));
}

async function list() {
  const page = arg(args, 'page');
  const routes = await loadRoutes();
  const tools = buildToolSpecs(routes).filter((t) => !page || t.hosts.some((h) => h.code === page));
  if (JSON_OUT) { console.log(JSON.stringify(tools, null, 1)); return; }
  const w = Math.max(...tools.map((t) => t.name.length));
  for (const t of tools) console.log(`${t.name.padEnd(w)}  ${t.hosts.map((h) => h.code).join(',').padEnd(22)} ${(t.permission ?? 'any').padEnd(16)} "${t.intent}"${Object.keys(t.params).length ? `  {${Object.entries(t.params).map(([k, v]) => `${k}: ${v}`).join(', ')}}` : ''}`);
  console.log(`\n${tools.length} tools · ${routes.reduce((n, r) => n + r.spec.actions.length, 0)} declared rows · ${routes.length} routes · v${pkg.version}`);
}

async function exportJson() {
  const routes = await loadRoutes();
  const tools = buildToolSpecs(routes);
  const generated = new Date().toISOString().slice(0, 10);
  const manifest = { $schema: 'https://json-schema.org/draft/2020-12/schema', title: 'Lead Magnet actions manifest', version: pkg.version, generated, source: 'scripts/actions.mjs export (compiled PageSpec.actions)', routes: routes.length, declared: routes.reduce((n, r) => n + r.spec.actions.length, 0), tools: tools.map((t) => ({ name: t.name, description: t.description, label: t.label, intent: t.intent, permission: t.permission ?? null, inputSchema: t.inputSchema, hosts: t.hosts })) };
  const vocab = { title: 'Lead Magnet voice vocabulary', version: pkg.version, generated, note: 'Intent phrase -> action id with param slots ({slot} in the phrase). The voice controller (T46) matches a spoken phrase to one entry and calls window.__leadmagnet.runAction(action, slots).', phrases: buildVocabulary(tools).map((v) => ({ ...v, permission: v.permission ?? null })) };
  writeFileSync(new URL('docs/reference/actions-manifest.json', ROOT), `${JSON.stringify(manifest, null, 1)}\n`);
  writeFileSync(new URL('docs/reference/voice-vocabulary.json', ROOT), `${JSON.stringify(vocab, null, 1)}\n`);
  console.log(`wrote docs/reference/actions-manifest.json (${tools.length} tools) and docs/reference/voice-vocabulary.json (${vocab.phrases.length} phrases)`);
}

async function run() {
  const id = args[1];
  if (!id || id.startsWith('--')) { console.error('usage: npm run actions -- run <action.id> [--param k=v ...] [--as <role>] [--port N] [--json]'); process.exit(2); }
  const params = {};
  for (let i = 0; i < args.length; i++) if (args[i] === '--param' && args[i + 1]) { const [k, ...v] = args[++i].split('='); params[k] = v.join('='); } else if (args[i].startsWith('--param=')) { const [k, ...v] = args[i].slice(8).split('='); params[k] = v.join('='); }
  const role = arg(args, 'as', 'super_admin');
  const userId = ROLE_USER[role]; if (!userId) { console.error(`unknown role "${role}"; one of ${Object.keys(ROLE_USER).join(', ')}`); process.exit(2); }
  const port = Number(arg(args, 'port', process.env.QA_PORT ?? '4173'));
  let reuse = false; try { await fetch(`http://localhost:${port}/`); reuse = true; } catch { /* nothing there: serve dist/ */ }
  if (reuse) process.env.QA_NO_SERVER = '1';
  const server = await startPreview(port);
  const browser = await launch();
  let result; const errors = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await ctx.addInitScript(...initScript('light', '/', { userId, devMode: false }));
    const page = await ctx.newPage(); await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://localhost:${port}/#/`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForFunction(() => window.__leadmagnet?.tools?.length > 0 && typeof window.__leadmagnet.runAction === 'function', null, { timeout: 15000 });
    result = await page.evaluate(([aid, p]) => window.__leadmagnet.runAction(aid, p), [id, params]);
    await page.waitForTimeout(300); // let provider writes settle (localStorage)
    result.route = await page.evaluate(() => window.location.hash);
    await ctx.close();
  } catch (e) { result = { ok: false, message: String(e.message).split('\n')[0] }; }
  await browser.close(); server.kill();
  if (errors.length) result.pageErrors = errors;
  if (JSON_OUT) console.log(JSON.stringify(result, null, 1));
  else { console.log(`${result.ok ? 'ok ' : 'FAIL'} ${id} as ${role}${result.deduped ? ' (deduped)' : ''}\n  ${result.message}${result.route ? `\n  route ${result.route}` : ''}`); if (result.data !== undefined) console.log(`  data ${JSON.stringify(result.data)}`); if (errors.length) console.log(`  page errors: ${errors.join(' | ')}`); }
  process.exit(result.ok ? 0 : 1);
}

const commands = { list, export: exportJson, run };
if (!commands[cmd]) { console.error(`usage: npm run actions -- list [--page CODE] [--json] | export | run <action.id> [--param k=v ...] [--as <role>]`); process.exit(2); }
commands[cmd]().catch((e) => { console.error(e); process.exit(1); });
