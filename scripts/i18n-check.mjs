// Spanish fill audit (T30). Lists every string-table key whose `es` is missing or identical to `en`, grouped by
// module, ignoring proper nouns / codes / URLs / numbers / pure placeholders. Exits non-zero with --strict.
// Usage: npm run i18n:check [-- --strict] [-- --json] [-- --module=studio]
//
// Loads each src/modules/<name>/index.ts the same way scripts/actions.mjs loads routes: bundled with esbuild
// (bare Node can't resolve .tsx/.css imports), then reads its exported `strings` table. Every bilingual string lives in a
// module table (the a11y layer's TV hint moved into `hub.tv_hint` in 0.3.0), so there is nothing outside the loop.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { build } from 'esbuild';

const ROOT = new URL('../', import.meta.url);
const args = process.argv.slice(2);
const arg = (name, def = '') => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const STRICT = args.includes('--strict');
const JSON_OUT = args.includes('--json');
const ONLY_MODULE = arg('module');

// --- proper nouns / codes / URLs / numbers that are legitimately identical in en and es ---
const PAGE_CODE = /^(L|C|B|S|A|K|W|R|M|D|HUB)-\d{2}[a-z]?$/;
const PROPER_NOUNS = new Set([
  'Lead Magnet', 'GitHub', 'GitHub Pages', 'Stripe', 'Supabase', 'Slack', 'WhatsApp', 'Zoom', 'Google', 'Playset',
  'Company OS', 'Fable', 'Claude', 'Opus', 'Sonnet', 'Haiku', 'Anthropic', 'Vite', 'React', 'TypeScript',
]);

function isExempt(en) {
  const t = String(en).trim();
  if (!t) return true;
  if (/^https?:\/\//i.test(t)) return true; // URL
  if (/^[\w.+-]+@[\w.-]+\.\w+$/.test(t)) return true; // email
  if (PAGE_CODE.test(t)) return true; // page code like K-01, L-01a
  if (/^-?[\d.,]+%?$/.test(t)) return true; // pure number / percentage
  if (/^\$?[\d.,]+[kKmM]?(\s*-\s*\$?[\d.,]+[kKmM]?)?\+?$/.test(t)) return true; // currency band, e.g. "$250k - $1M", "$5M+"
  if (/^\{[\w]+\}$/.test(t)) return true; // a lone placeholder, nothing to translate
  if (PROPER_NOUNS.has(t)) return true;
  if (/^[A-Z]{2,6}$/.test(t)) return true; // acronym (SEO, CTA, ROI, API, URL...)
  return false;
}

/** Bundles one entry file with esbuild so bare Node can import it (css/asset imports become no-ops), returns its exports. */
async function loadModule(entryPath) {
  const r = await build({
    entryPoints: [entryPath], bundle: true, format: 'esm', platform: 'node', write: false, jsx: 'automatic', logLevel: 'silent',
    loader: { '.css': 'empty', '.svg': 'empty', '.png': 'empty', '.jpg': 'empty', '.webp': 'empty', '.woff2': 'empty', '.md': 'text' },
    define: { 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true', 'import.meta.env.MODE': '"production"', __APP_VERSION__: '"0.0.0"' },
    banner: { js: 'import.meta.glob = () => ({});\nglobalThis.window ??= undefined;' },
  });
  const url = `data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString('base64')}`;
  return import(url);
}

/** A table entry is `string | { en, es? }`. Plain strings are language-neutral (used as-is by useT/bi) and never flagged. */
function auditTable(table) {
  const gaps = [];
  for (const [key, entry] of Object.entries(table ?? {})) {
    if (typeof entry === 'string') continue;
    if (!entry || typeof entry.en !== 'string') continue;
    const { en, es } = entry;
    if (isExempt(en)) continue;
    if (es == null || es === '') gaps.push({ key, en, reason: 'missing' });
    else if (es === en) gaps.push({ key, en, reason: 'identical' });
  }
  return gaps;
}

async function main() {
  const modDir = new URL('src/modules/', ROOT);
  const names = readdirSync(modDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(new URL(`${d.name}/index.ts`, modDir)))
    .map((d) => d.name).sort()
    .filter((n) => !ONLY_MODULE || n === ONLY_MODULE);

  const groups = [];
  for (const name of names) {
    const mod = await loadModule(new URL(`${name}/index.ts`, modDir).pathname);
    const table = mod.strings ?? {};
    const total = Object.values(table).filter((e) => typeof e !== 'string').length;
    groups.push({ module: name, total, gaps: auditTable(table) });
  }

  const totalGaps = groups.reduce((n, g) => n + g.gaps.length, 0);
  if (JSON_OUT) {
    console.log(JSON.stringify({ generatedAt: new Date().toISOString(), groups, totalGaps }, null, 1));
  } else {
    for (const g of groups) {
      console.log(`${g.module.padEnd(12)} ${String(g.gaps.length).padStart(3)} / ${g.total} bilingual keys missing or untranslated`);
      for (const gap of g.gaps) console.log(`  ${gap.reason === 'missing' ? 'missing' : 'same  '}  ${gap.key}  "${gap.en}"`);
    }
    console.log(`\n${totalGaps} total gaps across ${groups.length} tables${STRICT ? ' (--strict)' : ''}`);
  }
  process.exit(STRICT && totalGaps > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
