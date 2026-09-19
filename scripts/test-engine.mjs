// Unit checks for the pure engine (no browser). Run: npm run test:engine
import assert from 'node:assert/strict';
// Bundle the engine with esbuild (a Vite dependency) so extension-less TS imports resolve under Node.
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const out = join(mkdtempSync(join(tmpdir(), 'lm-engine-')), 'engine.mjs');
const r = await build({ entryPoints: [new URL('../src/engine/index.ts', import.meta.url).pathname], bundle: true, format: 'esm', platform: 'node', write: false, define: { 'import.meta.env.DEV': 'false' } });
writeFileSync(out, r.outputFiles[0].text);
const { guessStack, savings, deriveRoleViews, pickArchetype, composePage, imagePrompts, nextQuestions, applyAnswer, computeConfidence, adaptFromEvents, tzForProspect, slotGrid, previewSlots, withRequested, findSlot, slotInWords } = await import(out);
const p = { id: 'pro_test', created_at: '', updated_at: '', first_name: 'Maya', last_name: 'C', business_name: 'Paws & Play', industry: 'pet_care', sub_industry: null, city: 'Austin', country: 'US', lang: 'en', website: null, team_size: 9, locations: 1, revenue_band: '250k_1m', warmth: 'warm', source: 'linkedin', style: { palette: { primary: '#F25F3A', accent: '#FFD23F', bg: '#FFF8F2', surface: '#fff', text: '#222' }, tone: 'playful', font: 'display', imagery: ['dogs'] }, life_roles: ['owner', 'spouse/partner', 'kids', 'accountant'], business_roles: ['owner', 'manager', 'front desk'], known_tools: ['Gingr'], confidence: 0.6, fields_known: ['industry', 'first_name', 'business_name'], notes: '', logo_url: null, photo_url: null };
let n = 0; const ok = (name, fn) => { fn(); n++; console.log('ok', name); };
ok('guessStack picks one tool per category, confirmed first', () => { const g = guessStack(p); assert.ok(g.length >= 5); assert.equal(new Set(g.map((x) => x.category)).size, g.length); assert.equal(g.find((x) => x.tool === 'Gingr')?.status, 'confirmed'); assert.ok(!g.find((x) => x.tool === 'PetExec')); });
ok('guessStack honours rejected', () => { const g = guessStack(p, [{ tool: 'Gingr', category: 'Pet software', monthly_cost: 0, confidence: 1, status: 'rejected', replaced_by: '' }]); assert.ok(!g.find((x) => x.tool === 'Gingr')); });
ok('savings math', () => { const s = savings(p, guessStack(p)); assert.equal(s.price_band, 'team'); assert.equal(s.annual_current, Math.round(s.monthly_current * 12 * 100) / 100); assert.equal(s.net_monthly, Math.round((s.monthly_current - s.our_price_monthly) * 100) / 100); });
ok('deriveRoleViews: one per role, 3 widgets', () => { const v = deriveRoleViews(p); assert.equal(v.length, 7); assert.ok(v.every((x) => x.widgets.length === 3 && x.headline.en && x.headline.es)); assert.equal(v.filter((x) => x.kind === 'life').length, 4); });
ok('pickArchetype warm -> reveal', () => { assert.equal(pickArchetype(p)[0].archetype, 'reveal'); assert.equal(pickArchetype({ ...p, warmth: 'cold' })[0].archetype, 'audit'); assert.equal(pickArchetype({ ...p, warmth: 'hot' })[0].archetype, 'letter'); assert.ok(pickArchetype(p)[0].reasons.length); });
ok('composePage resolves EN+ES with tokens', () => { const m = composePage(p, 'reveal', { pageId: 'pg_1' }); assert.equal(m.sections[0].kind, 'hero_reveal'); assert.ok(m.sections[0].headline.en.includes('Paws & Play')); assert.ok(m.sections[0].headline.es.includes('Paws & Play')); assert.equal(m.cta.primary.to, '/demo/pro_test'); for (const a of ['audit', 'walkthrough', 'letter']) assert.ok(composePage(p, a).sections.length >= 4); });
ok('imagePrompts covers every kind', () => { const k = new Set(imagePrompts(p).map((x) => x.kind)); for (const x of ['hero', 'device_phone', 'device_laptop', 'device_tv', 'role_card', 'og_image', 'video_frames']) assert.ok(k.has(x), x); });
ok('intake: nextQuestions weights, applyAnswer recomputes', () => { const q = nextQuestions(p); assert.equal(q[0].field, 'team_size'); const p2 = applyAnswer(p, 'team_size', 12); assert.ok(p2.fields_known.includes('team_size')); assert.ok(p2.confidence > computeConfidence(p.fields_known)); assert.equal(computeConfidence([]), 0); });
ok('adaptFromEvents recommends', () => { const page = { id: 'pg_1', archetype: 'reveal', prospect_id: p.id }; const ev = (type, meta, s = 's1') => ({ id: Math.random().toString(), page_id: 'pg_1', session_id: s, type, meta, ts: '' }); const recs = adaptFromEvents(page, [ev('view', {}), ev('section_view', { section: 'savings_stack', seconds: 45 }), ev('exit_intent', {})], p); assert.ok(recs.some((r) => r.kind === 'add_section' && r.section === 'letter')); assert.ok(recs.some((r) => r.section === 'stack_audit')); });
ok('slots: one deterministic grid per prospect, preview is a subset, timezone from city', () => { const tz = tzForProspect({ city: 'Austin', country: 'US' }); assert.equal(tz.id, 'America/Chicago'); const from = new Date('2026-09-19T12:00:00Z'); const a = slotGrid('pro_test', tz, from); const b = slotGrid('pro_test', tz, from); assert.deepEqual(a, b); assert.equal(a.days.length, 7); assert.ok(a.days.filter((d) => !d.closed).every((d) => d.slots.some((s) => s.available))); const all = new Set(a.days.flatMap((d) => d.slots.filter((s) => s.available).map((s) => s.iso))); const pv = previewSlots(a); assert.ok(pv.some((d) => d.slots.length === 3)); for (const d of pv) for (const s of d.slots) assert.ok(all.has(s.iso), `preview slot ${s.iso} missing from B-01 grid`); assert.notDeepEqual(slotGrid('pro_other', tz, from).days.map((d) => d.slots.map((s) => s.available)), a.days.map((d) => d.slots.map((s) => s.available))); });
ok('slots: ?slot= is honoured even outside the grid (marked requested), words are bilingual', () => { const tz = tzForProspect({ city: 'Miami', country: 'US' }); const from = new Date('2026-09-19T12:00:00Z'); const g = slotGrid('pro_test', tz, from); const odd = '2026-09-22T13:07:00.000Z'; assert.equal(findSlot(g, odd), null); const g2 = withRequested(g, odd); const s = findSlot(g2, odd); assert.ok(s && s.requested); assert.equal(g2.days.flatMap((d) => d.slots).length, g.days.flatMap((d) => d.slots).length + 1); const busy = g.days.flatMap((d) => d.slots).find((x) => !x.available); const g3 = withRequested(g, busy.iso); assert.ok(findSlot(g3, busy.iso)?.requested); assert.equal(withRequested(g, 'not-a-date'), g); assert.match(slotInWords(odd, tz, 'en'), /at .* ET$/); assert.match(slotInWords(odd, tz, 'es'), / a las /); });

// --- catalog depth + smarter guessStack (studio pass, 2026-09-19) -----------------------------------------------
const eng = await import(out);
const { INDUSTRIES, INDUSTRY_KEYS, CATALOG_TOOLS, stackTier, itemCost, paidSeats, paidLocations, TIER_MIN_LIKELY, RARE_PREVALENCE, POSSIBLE_MIN_TEAM, industry } = eng;
const withIndustry = (key, extra = {}) => ({ ...p, industry: key, known_tools: [], ...extra });

ok('catalog: 20+ industries, every one complete and bilingual', () => {
  assert.ok(INDUSTRY_KEYS.length >= 21, `expected 20 industries + other, got ${INDUSTRY_KEYS.length}`);
  for (const key of INDUSTRY_KEYS) {
    const ind = INDUSTRIES[key];
    assert.equal(ind.key, key, `${key}: key mismatch`);
    for (const b of [ind.label, ind.verbs]) { assert.ok(b.en && b.es, `${key}: label/verbs need en + es`); }
    assert.ok(ind.departments.length >= 4 && ind.departments.every((d) => d.en && d.es), `${key}: 4+ bilingual departments`);
    assert.ok(ind.business_roles.length >= 3 && ind.life_roles.length >= 4, `${key}: roles`);
    assert.ok(ind.pains.length >= 2 && ind.pains.every((x) => x.en && x.es), `${key}: bilingual pains`);
    assert.ok(ind.kpis.length >= 2 && ind.kpis.every((x) => x.label.en && x.label.es && x.sample), `${key}: bilingual kpis with samples`);
    assert.ok(ind.motifs.length >= 3, `${key}: motifs`);
    assert.ok(ind.stack.length >= 5, `${key}: stack`);
    for (const item of ind.stack) {
      assert.ok(item.tool && item.category && item.replaced_by, `${key}: ${item.tool} needs category + replaced_by`);
      assert.ok(item.monthly_cost >= 0 && item.monthly_cost < 2000, `${key}: ${item.tool} price ${item.monthly_cost} is not plausible`);
      assert.ok(item.prevalence > 0 && item.prevalence <= 1, `${key}: ${item.tool} prevalence`);
    }
    assert.equal(new Set(ind.stack.map((x) => x.tool)).size, ind.stack.length, `${key}: a tool is listed twice`);
  }
  assert.ok(CATALOG_TOOLS.length >= 60, `catalog tool index: ${CATALOG_TOOLS.length}`);
  for (let i = 1; i < CATALOG_TOOLS.length; i++) assert.ok(CATALOG_TOOLS[i - 1].tool.length >= CATALOG_TOOLS[i].tool.length, 'CATALOG_TOOLS must be longest-first for the paste-facts matcher');
  assert.equal(industry('not_a_real_industry').key, 'other');
});

ok('catalog: every new industry guesses a usable stack and composes a page', () => {
  const added = ['chiropractic', 'veterinary', 'coffee_shop', 'landscaping', 'cleaning', 'property_mgmt', 'insurance', 'accounting', 'event_planning', 'tattoo', 'childcare', 'photography'];
  for (const key of added) {
    assert.ok(INDUSTRY_KEYS.includes(key), `${key} missing from the catalog`);
    const prospect = withIndustry(key);
    const g = guessStack(prospect);
    assert.ok(g.length >= 5, `${key}: only ${g.length} guesses`);
    const s = savings(prospect, g);
    assert.ok(s.monthly_current > s.our_price_monthly, `${key}: no savings story ($${s.monthly_current} vs $${s.our_price_monthly})`);
    const m = composePage(prospect, 'audit', { pageId: 'pg_x' });
    assert.ok(m.sections.length >= 4 && m.sections.every((sec) => sec.id), `${key}: compose`);
    assert.equal(deriveRoleViews(prospect).length, prospect.business_roles.length + prospect.life_roles.length);
  }
});

ok('guessStack: one row per replacement, never the same tool twice', () => {
  for (const key of INDUSTRY_KEYS) {
    const g = guessStack(withIndustry(key, { team_size: 40, locations: 3, confidence: 0.9 }));
    assert.equal(new Set(g.map((x) => x.tool)).size, g.length, `${key}: duplicate tool`);
    assert.equal(new Set(g.map((x) => x.replaced_by)).size, g.length, `${key}: two tools replaced by the same module`);
    assert.equal(new Set(g.map((x) => x.category)).size, g.length, `${key}: two tools in one category`);
  }
});

ok('guessStack: a confirmed tool drops every other guess we would replace with the same module', () => {
  const base = withIndustry('cleaning', { team_size: 30 });
  const before = guessStack(base);
  assert.ok(before.some((x) => x.replaced_by === 'Jobs & dispatch'));
  const confirmedOther = guessStack({ ...base, known_tools: ['ZenMaid'] });
  const teamRows = confirmedOther.filter((x) => x.replaced_by === 'Jobs & dispatch');
  assert.equal(teamRows.length, 1);
  assert.equal(teamRows[0].tool, 'ZenMaid');
  assert.equal(teamRows[0].status, 'confirmed');
  assert.equal(teamRows[0].confidence, 1);
  assert.ok(!confirmedOther.some((x) => x.tool === 'Jobber'), 'the competitor should be gone, not doubled up');
});

ok('guessStack: seats scale per_seat tools, locations scale per_location tools', () => {
  const small = withIndustry('childcare', { team_size: 4, locations: 1 });
  const big = { ...small, team_size: 40, locations: 4 };
  const seat = (g) => g.find((x) => x.tool === 'Google Workspace');
  const site = (g) => g.find((x) => x.tool === 'Brightwheel');
  const gs = guessStack(small), gb = guessStack(big);
  assert.equal(seat(gs).monthly_cost, 14 * paidSeats(small));
  assert.equal(seat(gb).monthly_cost, 14 * paidSeats(big));
  assert.equal(site(gs).monthly_cost, 199 * paidLocations(small));
  assert.equal(site(gb).monthly_cost, 199 * paidLocations(big));
  assert.ok(savings(big, gb).monthly_current > savings(small, gs).monthly_current * 2);
  assert.equal(itemCost({ tool: 't', category: 'c', replaced_by: 'r', prevalence: 1, monthly_cost: 10, per_seat: true, per_location: true }, big), 10 * paidSeats(big) * paidLocations(big));
});

ok('guessStack: likely vs possible tiers, and rare tools are not invented for a small team', () => {
  const small = withIndustry('photography', { team_size: 3, locations: 1, confidence: 0.5 });
  const gs = guessStack(small);
  assert.ok(gs.every((x) => stackTier(x) === 'likely' || stackTier(x) === 'possible'));
  assert.ok(gs.every((x) => (stackTier(x) === 'likely') === (x.status === 'confirmed' || x.confidence >= TIER_MIN_LIKELY)));
  const rare = INDUSTRIES.photography.stack.filter((x) => x.prevalence < RARE_PREVALENCE).map((x) => x.tool);
  for (const tool of rare) assert.ok(!gs.some((x) => x.tool === tool), `${tool} is rare: do not guess it for a team of 3`);
  const big = guessStack({ ...small, team_size: POSSIBLE_MIN_TEAM + 5 });
  assert.ok(big.length >= gs.length, 'a bigger team may carry more of the catalog');
  assert.equal(stackTier({ confidence: 0.1, status: 'confirmed' }), 'likely');
  assert.equal(stackTier({ confidence: 0.49, status: 'guessed' }), 'possible');
});

ok('guessStack: rejected stays rejected and confirmed survives a re-guess', () => {
  const prospect = withIndustry('veterinary', { team_size: 20, locations: 2 });
  const first = guessStack(prospect);
  const drop = first[0];
  const second = guessStack(prospect, [{ ...drop, status: 'rejected' }]);
  assert.ok(!second.some((x) => x.tool === drop.tool));
  const third = guessStack(prospect, [{ ...first[1], status: 'confirmed' }, { ...drop, status: 'rejected' }]);
  assert.equal(third.find((x) => x.tool === first[1].tool)?.status, 'confirmed');
  assert.ok(!third.some((x) => x.tool === drop.tool));
  assert.equal(savings(prospect, [...second, { ...drop, status: 'rejected' }]).items.length, second.length);
});

console.log(`\n${n} engine checks passed`);
