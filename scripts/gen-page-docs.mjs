// Writes docs/pages/<CODE>.md skeletons from the served route manifest (docs/screenshots/routes.json) using _TEMPLATE.md.
// Usage: npm run screenshots (writes routes.json) then node scripts/gen-page-docs.mjs [--force]. Existing files are kept unless --force.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const force = process.argv.includes('--force');
const routes = JSON.parse(readFileSync(new URL('../docs/screenshots/routes.json', import.meta.url), 'utf8'));
const tpl = readFileSync(new URL('../docs/pages/_TEMPLATE.md', import.meta.url), 'utf8');
const MODULE = (code) => ({ L: 'landing', C: 'os-demo', B: 'booking', S: 'studio', A: 'admin', K: 'plan', W: 'website', R: 'proposal', M: 'manual', D: 'dev', HUB: 'hub' })[code.split('-')[0]] ?? '?';
const seen = new Set(); let n = 0;
for (const r of routes) {
  if (seen.has(r.code)) continue; seen.add(r.code);
  const f = new URL(`../docs/pages/${r.code}.md`, import.meta.url);
  if (existsSync(f) && !force) continue;
  const s = r.spec;
  let md = tpl.replace(/<Page name>/g, s.name).replace(/<CODE>/g, r.code).replace('/<path>', r.path).replace('<role, role>', r.roles.join(', ')).replace('stub | built', r.status).replace('<module folder>', MODULE(r.code));
  md = md.replace('One paragraph: who uses this page and what they achieve.', s.purpose);
  md = md.replace('1. Section name - what it shows / does', s.layout.map((l, i) => `${i + 1}. ${l}`).join('\n') || '1. (to be specified)');
  md = md.replace('| `table` | read | |', s.data.length ? s.data.map((t) => `| \`${t}\` | read | |`).join('\n') : '| — | | no tables |');
  md = md.replace('| `module.verb` | "phrase a person would say" | `permission.string` |', s.actions.length ? s.actions.map((a) => `| \`${a.id}\` | "${a.intent}" | ${a.permission ? `\`${a.permission}\`` : 'any'} |`).join('\n') : '| — | | no actions declared yet |');
  md = md.replace('- `R-xxx` - how the page implements or displays it', (s.rules ?? []).map((x) => `- \`${x}\``).join('\n') || '- none yet');
  md = md.replace('- Calculations, transitions, validations in plain words.', s.logic.map((x) => `- ${x}`).join('\n') || '- (to be specified)');
  md = md.replace('Library components used (must exist in `/#/dev/components`).', s.components.join(', ') || '(none listed)');
  md = md.replace('What is real today, what is mocked (image generation, LLM, booking provider, payments), what changes when Supabase lands.', r.status === 'stub' ? `Stub (PageStub). ${(s.notes ?? []).join(' ')}` : 'Built on the MockProvider (localStorage). Real data lands with Supabase (T44).');
  md = md.replace('Checked at: 360, 390, 768, 1280, 1920, 2560, 3840. Notes on degradation.', s.checkedAt?.length ? `Checked at: ${s.checkedAt.join(', ')}.` : 'Not checked yet.');
  md = md.replace('- `docs/changelog/NNNN-...md`', '- `docs/changelog/0001-foundation.md`');
  writeFileSync(f, md); n++;
}
console.log(`wrote ${n} page docs`);
