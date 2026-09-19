// Social cards: screenshots L-06 (/#/og/:slug) at exactly 1200x630 to public/og/<slug>.jpg, which the landing pages
// point og:image at. The card is a real themed page built from the published PageModel, so it can never drift from
// the page it previews the way a hand-drawn image would.
//
// Usage: npm run og [-- --slugs=paws-and-play-austin] [-- --quality=82] [-- --port=4178]
// Chromium is preinstalled at /opt/pw-browsers; never run `playwright install`. External requests are blocked.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { arg, list, startPreview, launch, NOISE, initScript } from './qa-lib.mjs';

const args = process.argv.slice(2);
const SLUGS = list(arg(args, 'slugs'));
const QUALITY = Number(arg(args, 'quality', '82'));
const PORT = Number(arg(args, 'port', process.env.QA_PORT ?? '4178'));
const BASE = `http://localhost:${PORT}/#`;
const ROOT = new URL('../', import.meta.url);
const OUT = new URL('public/og/', ROOT);

async function main() {
  if (!existsSync(new URL('dist/index.html', ROOT))) {
    console.log('dist/ missing - building first...');
    execFileSync('npm', ['run', 'build'], { cwd: ROOT.pathname, stdio: 'inherit' });
  }
  mkdirSync(OUT, { recursive: true });
  const server = await startPreview(PORT);
  const browser = await launch();
  const problems = [];
  try {
    // Slugs come from the seeded database the app itself holds, never from a list kept in sync by hand.
    let slugs = SLUGS;
    if (!slugs.length) {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
      await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForFunction(() => !!localStorage.getItem('leadmagnet.db.v1'), null, { timeout: 15000 });
      slugs = await page.evaluate(() => JSON.parse(localStorage.getItem('leadmagnet.db.v1')).db.pages.map((p) => p.slug));
      slugs = [...new Set(slugs)];
      await ctx.close();
    }
    console.log(`${slugs.length} cards · 1200x630 · q${QUALITY}`);
    for (const slug of slugs) {
      // 1240x760 leaves .og-fit at scale 1, so the element is captured at its true 1200x630.
      const ctx = await browser.newContext({ viewport: { width: 1240, height: 760 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      await ctx.addInitScript(...initScript('light', '/', { devMode: false }));
      const page = await ctx.newPage();
      await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errors.push(m.text()); });
      try {
        await page.goto(`${BASE}/og/${slug}`, { waitUntil: 'load', timeout: 20000 });
        const card = await page.waitForSelector('.og-card', { timeout: 10000 });
        await page.waitForTimeout(700);
        const file = new URL(`${slug}.jpg`, OUT);
        await card.screenshot({ path: file.pathname, type: 'jpeg', quality: QUALITY });
        console.log(`  ${slug.padEnd(30)} ${Math.round(statSync(file).size / 1024)} KB`);
      } catch (e) { errors.push(String(e.message).split('\n')[0]); }
      if (errors.length) problems.push({ slug, errors: [...new Set(errors)].slice(0, 3) });
      await ctx.close();
    }
  } finally { await browser.close(); server.kill(); }
  if (problems.length) { console.log('\nPROBLEMS:'); for (const p of problems) console.log(`  ${p.slug}`, p.errors.join(' | ')); } else console.log('\nno console errors');
  process.exit(problems.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
