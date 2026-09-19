// Unit checks for the pure voice / phrase matcher (src/a11y/voice.ts) against the exported vocabulary. No browser.
// Run: npm run test:voice
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const out = join(mkdtempSync(join(tmpdir(), 'lm-voice-')), 'voice.mjs');
const r = await build({ entryPoints: [new URL('../src/a11y/voice.ts', import.meta.url).pathname], bundle: true, format: 'esm', platform: 'node', write: false });
writeFileSync(out, r.outputFiles[0].text);
const { matchPhrase, normalize, canonicalize, fillPhrase, routeIds, routeIdFor, quoted } = await import(out);
const vocab = JSON.parse(readFileSync(new URL('../docs/reference/voice-vocabulary.json', import.meta.url), 'utf8')).phrases;
assert.ok(vocab.length >= 100, `vocabulary has ${vocab.length} phrases`);

let n = 0; const ok = (name, fn) => { fn(); n++; console.log('ok', name); };
const top = (phrase, opts) => matchPhrase(phrase, vocab, opts)[0];
const expectTop = (phrase, action, opts, params) => { const m = top(phrase, opts); assert.ok(m, `"${phrase}" matched nothing`); assert.equal(m.action, action, `"${phrase}" -> ${m.action} (wanted ${action}); next: ${matchPhrase(phrase, vocab, opts).slice(0, 3).map((x) => `${x.action}:${x.score}`).join(', ')}`); if (params) for (const [k, v] of Object.entries(params)) assert.equal(m.params[k], v, `"${phrase}" slot ${k} = ${JSON.stringify(m.params[k])} (wanted ${JSON.stringify(v)})`); return m; };

ok('normalize strips case, accents and punctuation but keeps ids', () => { assert.equal(normalize('Ábre la Página, ¡por favor! pro_maya T45'), 'abre la pagina por favor pro_maya t45'); assert.deepEqual(quoted('open prospect "Paws & Play" now'), ['Paws & Play']); assert.deepEqual(routeIds('/studio/prospects/pro_maya'), ['pro_maya']); assert.deepEqual(routeIds('#/plan/tasks/T45?x=1'), ['T45']); });
ok('canonicalize folds ES and EN synonyms onto the intent wording', () => { assert.deepEqual(canonicalize('cambia a modo oscuro'), ['switch', 'a', 'dark', 'mode']); assert.deepEqual(canonicalize('go to the studio'), ['open', 'the', 'studio']); assert.deepEqual(canonicalize('switch to dark mode'), ['switch', 'to', 'dark', 'mode']); });
ok('EN: exact intent wins', () => { const m = expectTop('switch to dark mode', 'hub.toggleTheme'); assert.equal(m.coverage, 1); });
ok('EN: synonyms and filler; an identical phrase on two pages is a tie broken by the page on screen', () => { expectTop('please change to dark mode now', 'hub.toggleTheme'); const tie = matchPhrase('reset the demo database', vocab).slice(0, 2).map((m) => m.action).sort(); assert.deepEqual(tie, ['dev.resetDb', 'hub.resetDemoData']); expectTop('reset the demo database', 'hub.resetDemoData', { page: 'HUB-01' }); expectTop('reset the demo database', 'dev.resetDb', { page: 'D-03' }); });
ok('ES: same action from Spanish', () => { expectTop('cambia a modo oscuro', 'hub.toggleTheme', { lang: 'es' }); expectTop('reinicia la base de datos del demo', 'hub.resetDemoData', { lang: 'es', page: 'HUB-01' }); });
ok('slots: enum + id from "set {task} to {status}"', () => { const m = expectTop('set T45 to doing', 'plan.setStatus', {}, { task: 'T45', status: 'doing' }); assert.deepEqual(m.missing, []); assert.equal(m.phraseFilled, 'set T45 to doing'); });
ok('slots: ES enum words ("hecha" -> done) and id', () => { expectTop('pon la tarea T46 como hecha', 'plan.setStatus', { lang: 'es' }, { task: 'T46', status: 'done' }); });
ok('slots: number words', () => { expectTop('apply recommendation two', 'admin.applyRecommendation', {}, { n: 2 }); expectTop('aplica la recomendacion 3', 'admin.applyRecommendation', { lang: 'es' }, { n: 3 }); });
ok('slots: free text surface', () => { expectTop('open the studio', 'hub.openSurface', { page: 'HUB-01' }, { surface: 'studio' }); });
ok('slots: quoted string fills a string slot', () => { const m = matchPhrase('open prospect "Paws & Play"', vocab).find((x) => x.action === 'studio.openProspect'); assert.ok(m, 'studio.openProspect not in results'); assert.equal(m.params.name, 'Paws & Play'); assert.equal(m.sources.name, 'quoted'); });
ok('slots: id from the current route when the speaker says "this"', () => { const m = matchPhrase('open the timeline for this prospect', vocab, { route: '/studio/prospects/pro_maya' }).find((x) => x.action === 'admin.openProspect'); assert.ok(m); assert.equal(m.params.prospect, 'pro_maya'); assert.equal(m.sources.prospect, 'route'); });
ok('slots: the route id is picked by kind, never by position (review pass 3, finding 1)', () => { assert.equal(routeIdFor('prospect', ['pro_maya', 'front-of-house']), 'pro_maya'); assert.equal(routeIdFor('page', ['pro_maya', 'pg_maya']), 'pg_maya'); assert.equal(routeIdFor('prospect', ['pro_maya', 'pg_maya']), 'pro_maya'); assert.equal(routeIdFor('task', ['T45']), 'T45'); assert.equal(routeIdFor('prospect', ['T45']), null); assert.equal(routeIdFor('id', ['pro_maya', 'ev_1']), 'ev_1'); const m = matchPhrase('open the timeline for this prospect', vocab, { route: '/demo/pro_maya/role/front-of-house' }).find((x) => x.action === 'admin.openProspect'); assert.ok(m); assert.equal(m.params.prospect, 'pro_maya'); const pg = matchPhrase('open the timeline for this prospect', vocab, { route: '/studio/prospects/pro_maya/pages/pg_maya' }).find((x) => x.action === 'admin.openProspect'); assert.equal(pg.params.prospect, 'pro_maya'); });
ok('quoted: an apostrophe is not an opening quote (review pass 3, finding 4)', () => { assert.deepEqual(quoted("open Maya's page as 'owner'"), ['owner']); assert.deepEqual(quoted("Daniel's view"), []); assert.deepEqual(quoted('open «Paws & Play» and \'x\''), ['Paws & Play', 'x']); const m = matchPhrase("open prospect 'Paws & Play'", vocab).find((x) => x.action === 'studio.openProspect'); assert.equal(m.params.name, 'Paws & Play'); });
ok('page bonus re-ranks a tie', () => { const a = matchPhrase('reset the demo database', vocab, { page: 'D-03' }); const b = matchPhrase('reset the demo database', vocab, { page: 'HUB-01' }); assert.ok(a[0].score >= a[1].score); assert.equal(b[0].action, 'hub.resetDemoData'); assert.ok(b[0].onPage); const onD05 = a.find((x) => x.onPage); assert.ok(onD05 && onD05.score > a.find((x) => !x.onPage).score); });
ok('live bonus', () => { const m = matchPhrase('switch to dark mode', vocab, { live: (id) => id === 'hub.toggleTheme' })[0]; assert.ok(m.live && m.score > matchPhrase('switch to dark mode', vocab)[0].score); });
ok('missing slots are reported', () => { const m = expectTop('move the task', 'plan.moveTask'); assert.ok(m.missing.includes('status') || m.missing.includes('task')); });
ok('nonsense matches nothing, empty matches nothing', () => { assert.deepEqual(matchPhrase('purple elephant tango', vocab), []); assert.deepEqual(matchPhrase('   ', vocab), []); });
ok('limit and threshold are honoured', () => { assert.ok(matchPhrase('open', vocab, { limit: 3 }).length <= 3); assert.equal(matchPhrase('open', vocab, { threshold: 2 }).length, 0); });
ok('fillPhrase substitutes found slots and keeps the rest', () => { assert.equal(fillPhrase('set {task} to {status}', { task: 'T1' }), 'set T1 to {status}'); });
ok('the palette actions are in the vocabulary', () => { for (const id of ['hub.openCommands', 'hub.voiceListen']) assert.ok(vocab.some((v) => v.action === id), `${id} missing: run npm run actions -- export`); expectTop('open the command palette', 'hub.openCommands'); expectTop('escucha un comando de voz', 'hub.voiceListen', { lang: 'es' }); });
console.log(`\n${n} voice checks passed · ${vocab.length} phrases`);
