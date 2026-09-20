// Real video-on-scroll frames (T41-lite): walks the LIVE OS demo for each seeded prospect and writes a JPEG frame
// sequence the landing hero and the walkthrough archetype scrub through, instead of an illustration of one.
//
// Output (static, committed): public/frames/<prospectId>/NN.jpg      phone tour, 390x844, ~24 frames
//                             public/frames/<prospectId>/desk-NN.jpg desktop tour, 1280x800, 12 frames
//                             public/frames/<prospectId>/index.json  { count, desk_count, labels, bytes, ... }
// The landing module reads index.json; when it is missing the sections fall back to the live <MiniOs> composition,
// so this script is an enhancement, never a dependency.
//
// Usage: npm run frames [-- --ids=pro_maya,pro_daniel] [-- --quality=68] [-- --desk-quality=58] [-- --stride=2] [-- --port=4179]
// --stride=N keeps every Nth scroll step of each stop (always the first), so the frame count follows the budget
// (public/frames + public/og <= 5 MB together) when the seeded roster grows; the landing reads count / desk_count from index.json.
// Chromium is preinstalled at /opt/pw-browsers; never run `playwright install`. External requests are blocked.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { arg, list, startPreview, launch, NOISE, initScript } from './qa-lib.mjs';

const args = process.argv.slice(2);
const IDS = list(arg(args, 'ids'));
const QUALITY = Number(arg(args, 'quality', '78'));
const DESK_QUALITY = Number(arg(args, 'desk-quality', '52'));
const STRIDE = Math.max(1, Number(arg(args, 'stride', '1')) || 1);
const PORT = Number(arg(args, 'port', process.env.QA_PORT ?? '4179'));
const BASE = `http://localhost:${PORT}/#`;
const ROOT = new URL('../', import.meta.url);
const OUT = new URL('public/frames/', ROOT);

/** The phone tour: role home, two other roles, then every department of the OS, with small scroll steps. 24 frames. */
const PHONE_TOUR = [
  { stop: 'home', label: 'Your role home', scroll: [0, 260, 620, 1000] },
  { stop: 'role1', label: 'A second role', scroll: [0, 320, 700] },
  { stop: 'role2', label: 'A third role', scroll: [0, 320, 700] },
  { stop: 'departments', label: 'Departments', scroll: [0, 300, 650, 1000] },
  { stop: 'comms', label: 'One inbox', scroll: [0, 280, 560, 840] },
  { stop: 'money', label: 'Money', scroll: [0, 320, 700] },
  { stop: 'life', label: 'Life', scroll: [0, 300, 640] },
];
/** The laptop tour: the same journey, two frames a stop. 12 frames. */
const DESK_TOUR = [
  { stop: 'home', label: 'Your role home', scroll: [0, 520] },
  { stop: 'role1', label: 'A second role', scroll: [0, 520] },
  { stop: 'departments', label: 'Departments', scroll: [0, 620] },
  { stop: 'comms', label: 'One inbox', scroll: [0, 520] },
  { stop: 'money', label: 'Money', scroll: [0, 620] },
  { stop: 'life', label: 'Life', scroll: [0, 520] },
];

const pad = (n) => String(n).padStart(2, '0');
const kb = (n) => `${Math.round(n / 1024)} KB`;

/** Reads the seeded MockProvider database out of the running app (localStorage), so ids and slugs are never hard-coded. */
async function readDb(browser) {
  const ctx = await browser.newContext();
  try {
    const page = await ctx.newPage();
    await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
    await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForFunction(() => !!localStorage.getItem('leadmagnet.db.v1'), null, { timeout: 15000 });
    return await page.evaluate(() => JSON.parse(localStorage.getItem('leadmagnet.db.v1')).db);
  } finally { await ctx.close(); }
}

/** The role-view slugs of a demo, read from the role switcher the demo itself renders (never recomputed here). */
async function roleSlugs(page) {
  const fromSelect = await page.evaluate(() =>
    [...document.querySelectorAll('.demo-role select option, select option')].map((o) => o.value).filter(Boolean));
  const fromLinks = await page.evaluate(() =>
    [...document.querySelectorAll('a[href*="/role/"]')].map((a) => (a.getAttribute('href') || '').split('/role/')[1]).filter(Boolean));
  return [...new Set([...fromSelect, ...fromLinks])];
}

const urlFor = (id, stop, roles) =>
  stop === 'home' ? `/demo/${id}/role/${roles[0] ?? 'owner'}`
    : stop === 'role1' ? `/demo/${id}/role/${roles[1] ?? roles[0] ?? 'owner'}`
      : stop === 'role2' ? `/demo/${id}/role/${roles[2] ?? roles[1] ?? roles[0] ?? 'owner'}`
        : `/demo/${id}/${stop}`;

async function scrollTo(page, y) {
  await page.evaluate((target) => {
    let best = document.scrollingElement || document.documentElement;
    for (const el of document.querySelectorAll('.demo-main, main')) if (el.scrollHeight > el.clientHeight + 24) best = el;
    const max = Math.max(0, best.scrollHeight - best.clientHeight);
    const y = Math.min(target, max);
    window.scrollTo(0, y);
    if (best !== document.scrollingElement) best.scrollTop = y;
  }, y);
}

/** Walks one tour and writes its frames; returns { labels, bytes, files }. */
async function walk(browser, { id, roles, tour, viewport, prefix, quality, dir }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.addInitScript(...initScript('light', '/', { devMode: false }));
  const page = await ctx.newPage();
  await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errors.push(m.text()); });

  const labels = []; let bytes = 0; let n = 0;
  for (const step of tour) {
    await page.goto(`${BASE}${urlFor(id, step.stop, roles)}`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForSelector('#root > *:not(dialog)', { timeout: 10000 });
    await page.waitForTimeout(420);
    for (const y of step.scroll.filter((_, i) => i % STRIDE === 0)) {
      await scrollTo(page, y);
      await page.waitForTimeout(190);
      const file = new URL(`${prefix}${pad(n)}.jpg`, dir);
      await page.screenshot({ path: file.pathname, type: 'jpeg', quality });
      bytes += statSync(file).size;
      labels.push(step.label);
      n++;
    }
  }
  await ctx.close();
  return { labels, bytes, count: n, errors: [...new Set(errors)].slice(0, 3) };
}

async function main() {
  if (!existsSync(new URL('dist/index.html', ROOT))) {
    console.log('dist/ missing - building first...');
    execFileSync('npm', ['run', 'build'], { cwd: ROOT.pathname, stdio: 'inherit' });
  }
  const server = await startPreview(PORT);
  const browser = await launch();
  let total = 0; const problems = [];
  try {
    const db = await readDb(browser);
    const ids = IDS.length ? IDS : db.prospects.map((p) => p.id);
    const kept = (tour) => tour.reduce((a, s) => a + s.scroll.filter((_, i) => i % STRIDE === 0).length, 0);
    console.log(`${ids.length} prospects · phone ${kept(PHONE_TOUR)} frames q${QUALITY} · desk ${kept(DESK_TOUR)} frames q${DESK_QUALITY}${STRIDE > 1 ? ` · stride ${STRIDE}` : ''}`);
    for (const id of ids) {
      const dir = new URL(`${id}/`, OUT);
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });
      // One throwaway page to read the role slugs the demo itself publishes.
      const probeCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await probeCtx.addInitScript(...initScript('light', '/', { devMode: false }));
      const probe = await probeCtx.newPage();
      await probe.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
      await probe.goto(`${BASE}/demo/${id}`, { waitUntil: 'load', timeout: 20000 });
      await probe.waitForSelector('#root > *:not(dialog)', { timeout: 10000 });
      await probe.waitForTimeout(400);
      const roles = await roleSlugs(probe);
      await probeCtx.close();

      const phone = await walk(browser, { id, roles, tour: PHONE_TOUR, viewport: { width: 390, height: 844 }, prefix: '', quality: QUALITY, dir });
      const desk = await walk(browser, { id, roles, tour: DESK_TOUR, viewport: { width: 1280, height: 800 }, prefix: 'desk-', quality: DESK_QUALITY, dir });
      if (phone.errors.length || desk.errors.length) problems.push({ id, errors: [...phone.errors, ...desk.errors] });

      const index = {
        prospect_id: id, generated_at: new Date().toISOString(), roles: roles.slice(0, 3),
        count: phone.count, width: 390, height: 844, labels: phone.labels,
        desk_count: desk.count, desk_width: 1280, desk_height: 800, desk_labels: desk.labels,
        bytes: phone.bytes + desk.bytes,
      };
      writeFileSync(new URL('index.json', dir), `${JSON.stringify(index, null, 1)}\n`);
      total += index.bytes;
      console.log(`  ${id.padEnd(12)} ${phone.count} phone (${kb(phone.bytes)}) + ${desk.count} desk (${kb(desk.bytes)}) = ${kb(index.bytes)}  roles: ${roles.slice(0, 3).join(', ')}`);
    }
  } finally { await browser.close(); server.kill(); }
  const files = readdirSync(OUT, { recursive: true }).length;
  console.log(`\n${files} files · ${(total / 1048576).toFixed(2)} MB total`);
  if (problems.length) { console.log('PROBLEMS:'); for (const p of problems) console.log(` ${p.id}`, p.errors.join(' | ')); }
  process.exit(problems.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
