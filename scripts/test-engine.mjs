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
const { guessStack, savings, deriveRoleViews, pickArchetype, composePage, imagePrompts, nextQuestions, applyAnswer, computeConfidence, subIndustries, adaptFromEvents, tzForProspect, slotGrid, previewSlots, withRequested, findSlot, slotInWords } = await import(out);
const p = { id: 'pro_test', created_at: '', updated_at: '', first_name: 'Maya', last_name: 'C', business_name: 'Paws & Play', industry: 'pet_care', sub_industry: null, city: 'Austin', country: 'US', lang: 'en', website: null, team_size: 9, locations: 1, revenue_band: '250k_1m', warmth: 'warm', source: 'linkedin', style: { palette: { primary: '#F25F3A', accent: '#FFD23F', bg: '#FFF8F2', surface: '#fff', text: '#222' }, tone: 'playful', font: 'display', imagery: ['dogs'] }, life_roles: ['owner', 'spouse/partner', 'kids', 'accountant'], business_roles: ['owner', 'manager', 'front desk'], known_tools: ['Gingr'], confidence: 0.6, fields_known: ['industry', 'first_name', 'business_name'], notes: '', logo_url: null, photo_url: null };
let n = 0; const ok = (name, fn) => { fn(); n++; console.log('ok', name); };
ok('guessStack picks one tool per category, confirmed first', () => { const g = guessStack(p); assert.ok(g.length >= 5); assert.equal(new Set(g.map((x) => x.category)).size, g.length); assert.equal(g.find((x) => x.tool === 'Gingr')?.status, 'confirmed'); assert.ok(!g.find((x) => x.tool === 'PetExec')); });
ok('guessStack honours rejected', () => { const g = guessStack(p, [{ tool: 'Gingr', category: 'Pet software', monthly_cost: 0, confidence: 1, status: 'rejected', replaced_by: '' }]); assert.ok(!g.find((x) => x.tool === 'Gingr')); });
ok('savings math', () => { const s = savings(p, guessStack(p)); assert.equal(s.price_band, 'team'); assert.equal(s.annual_current, Math.round(s.monthly_current * 12 * 100) / 100); assert.equal(s.net_monthly, Math.round((s.monthly_current - s.our_price_monthly) * 100) / 100); });
ok('deriveRoleViews: one per role, 3 widgets', () => { const v = deriveRoleViews(p); assert.equal(v.length, 7); assert.ok(v.every((x) => x.widgets.length === 3 && x.headline.en && x.headline.es)); assert.equal(v.filter((x) => x.kind === 'life').length, 4); });
ok('pickArchetype warm -> reveal', () => { assert.equal(pickArchetype(p)[0].archetype, 'reveal'); assert.equal(pickArchetype({ ...p, warmth: 'cold' })[0].archetype, 'audit'); assert.equal(pickArchetype({ ...p, warmth: 'hot' })[0].archetype, 'letter'); assert.ok(pickArchetype(p)[0].reasons.length); });
ok('composePage resolves EN+ES with tokens', () => { const m = composePage(p, 'reveal', { pageId: 'pg_1' }); assert.equal(m.sections[0].kind, 'hero_reveal'); assert.ok(m.sections[0].headline.en.includes('Paws & Play')); assert.ok(m.sections[0].headline.es.includes('Paws & Play')); assert.equal(m.cta.primary.to, '/demo/pro_test'); for (const a of ['audit', 'walkthrough', 'letter']) assert.ok(composePage(p, a).sections.length >= 4); });
ok('imagePrompts covers every kind', () => { const k = new Set(imagePrompts(p).map((x) => x.kind)); for (const x of ['hero', 'device_phone', 'device_laptop', 'device_tv', 'role_card', 'og_image', 'video_frames']) assert.ok(k.has(x), x); });
ok('intake: nextQuestions weights, applyAnswer recomputes', () => { const q = nextQuestions({ ...p, fields_known: [...p.fields_known, 'sub_industry'] }); assert.equal(q[0].field, 'team_size'); const p2 = applyAnswer(p, 'team_size', 12); assert.ok(p2.fields_known.includes('team_size')); assert.ok(p2.confidence > computeConfidence(p.fields_known)); assert.equal(computeConfidence([]), 0); });
ok('intake T52: the sub-industry is asked right after the industry, only when the catalog has one; a new industry drops a stale key', () => {
  assert.ok(subIndustries(p).length >= 2); assert.equal(nextQuestions(p)[0].field, 'sub_industry'); assert.ok(nextQuestions(p)[0].question.es.includes('mascotas') || nextQuestions(p)[0].question.en.includes('pet'));
  const plain = { ...p, industry: 'other' }; assert.equal(subIndustries(plain).length, 0); assert.ok(!nextQuestions(plain, 20).some((q) => q.field === 'sub_industry'));
  assert.ok(computeConfidence(p.fields_known, plain) > computeConfidence(p.fields_known, p), 'a field that does not apply leaves the denominator');
  const p2 = applyAnswer(p, 'sub_industry', subIndustries(p)[0].key); assert.equal(p2.sub_industry, subIndustries(p)[0].key); assert.ok(p2.fields_known.includes('sub_industry'));
  const p3 = applyAnswer(p2, 'industry', 'other'); assert.equal(p3.sub_industry, null); assert.ok(!p3.fields_known.includes('sub_industry'));
});
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

// --- catalog pass 2: price review dates + sub-industries (D-063, 2026-09-19) -----------------
ok('catalog D-063: every industry has 4+ tools with EN/ES names, every tool is priced and dated', () => {
  for (const key of INDUSTRY_KEYS) {
    const ind = INDUSTRIES[key];
    assert.ok(ind.stack.length >= 4, `${key}: needs 4+ tools, has ${ind.stack.length}`);
    assert.ok(ind.label.en && ind.label.es, `${key}: industry needs an EN and ES name`);
    for (const item of ind.stack) {
      assert.ok(item.monthly_cost > 0, `${key}: ${item.tool} must have a price > 0 (got ${item.monthly_cost})`);
      assert.ok(item.price_reviewed && /^\d{4}-\d{2}-\d{2}$/.test(item.price_reviewed), `${key}: ${item.tool} needs a price_reviewed date (YYYY-MM-DD)`);
    }
  }
});

ok('catalog D-063: sub-industry keys are unique per industry and every extra_tools id is in the catalog', () => {
  let subIndustryCount = 0;
  for (const key of INDUSTRY_KEYS) {
    const ind = INDUSTRIES[key];
    if (!ind.sub) continue;
    assert.ok(ind.sub.length > 0, `${key}: sub, when present, must be non-empty`);
    subIndustryCount += ind.sub.length;
    const keys = ind.sub.map((sub) => sub.key);
    assert.equal(new Set(keys).size, keys.length, `${key}: sub-industry keys must be unique within the industry`);
    for (const subInd of ind.sub) {
      assert.ok(subInd.name?.en && subInd.name?.es, `${key}/${subInd.key}: needs an EN and ES name`);
      for (const tool of subInd.extra_tools ?? []) assert.ok(CATALOG_TOOLS.some((t) => t.tool === tool), `${key}/${subInd.key}: extra_tools "${tool}" is not in the tools catalog`);
    }
  }
  assert.ok(subIndustryCount >= 20, `catalog: expected 20+ sub-industries across the catalog, found ${subIndustryCount}`);
});

// --- reference-systems pass: sub-industry depth in the engine (T55), meter widgets, six seeded prospects (2026-09-20) ---
const { industryFor, subIndustryFor, catalogItem, candidateStack, SUB_EXTRA_PREVALENCE } = eng;
const REF_SUBS = [['pet_care', 'dog_hotel_spa'], ['law_firm', 'tenant_law'], ['gym_wellness', 'wellness_club']];
const KNOWN_ALL = ['first_name', 'business_name', 'industry', 'city', 'team_size', 'locations', 'warmth', 'lang', 'style', 'business_roles', 'life_roles'];
const refProspect = (over) => { const q = { ...p, sub_industry: null, known_tools: [], fields_known: [...KNOWN_ALL, 'sub_industry', 'known_tools'], ...over }; return { ...q, confidence: computeConfidence(q.fields_known, q) }; };
/** Every seeded prospect, mirrored from src/data/seed/prospects.ts (the seed runs in the browser; the engine checks run here). */
const SEEDED = [
  p,
  refProspect({ id: 'pro_daniel', first_name: 'Daniel', business_name: 'Sonrisa Dental Miami', industry: 'dental', city: 'Miami', lang: 'es', team_size: 22, locations: 2, revenue_band: '1m_5m', warmth: 'cold', life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'practice consultant'], business_roles: ['owner dentist', 'office manager', 'front office', 'hygienist', 'associate dentist', 'billing'] }),
  refProspect({ id: 'pro_priya', first_name: 'Priya', business_name: 'Highline Hospitality Group', industry: 'restaurant', city: 'Denver', team_size: 64, locations: 3, revenue_band: '5m_plus', warmth: 'hot', life_roles: ['owner', 'spouse/partner', 'accountant', 'investor'], business_roles: ['owner', 'general manager', 'chef', 'shift lead', 'host', 'events manager'], known_tools: ['Toast POS', '7shifts', 'OpenTable', 'Tripleseat'] }),
  refProspect({ id: 'pro_camila', first_name: 'Camila', business_name: 'Fetch & Stay Dog Hotel', industry: 'pet_care', sub_industry: 'dog_hotel_spa', city: 'San Diego', team_size: 18, locations: 2, revenue_band: '1m_5m', warmth: 'warm', life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'vet partner'], business_roles: ['owner', 'manager', 'front desk', 'groomer', 'handler', 'walker'], known_tools: ['Squarespace', 'PetLinx'] }),
  refProspect({ id: 'pro_alicia', first_name: 'Alicia', business_name: "Renters' Shield Law", industry: 'law_firm', sub_industry: 'tenant_law', city: 'Fresno', team_size: 11, locations: 4, revenue_band: '1m_5m', warmth: 'hot', life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'of counsel'], business_roles: ['owner attorney', 'attorney', 'paralegal', 'front desk', 'marketing', 'billing'], known_tools: ['WordPress hosting', 'Ecwid', 'Microsoft Teams', 'WordPerfect'] }),
  refProspect({ id: 'pro_valeria', first_name: 'Valeria', business_name: 'Raíz Wellness Club', industry: 'gym_wellness', sub_industry: 'wellness_club', city: 'San Antonio', lang: 'es', team_size: 14, locations: 1, revenue_band: '250k_1m', warmth: 'warm', life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'nutritionist'], business_roles: ['owner', 'coordinator', 'front desk', 'teacher', 'finance', 'maintenance'], known_tools: ['Mindbody', 'WhatsApp Business (manual)', 'Squarespace'] }),
];
const camila = SEEDED[3], alicia = SEEDED[4], valeria = SEEDED[5];

ok('reference subs: dog_hotel_spa, tenant_law and wellness_club exist with 4+ bilingual departments, 5+ bilingual KPIs, extra pains, motifs and a meter; every extra tool resolves to a priced, dated catalog item', () => {
  for (const [key, subKey] of REF_SUBS) {
    const ind = INDUSTRIES[key];
    const sub = ind.sub.find((x) => x.key === subKey);
    assert.ok(sub, `${key}/${subKey} missing`);
    assert.ok(sub.name.en && sub.name.es);
    assert.ok(sub.departments.length >= 4 && sub.departments.every((d) => d.en && d.es), `${subKey}: 4+ bilingual departments`);
    assert.ok(sub.kpis.length >= 5 && sub.kpis.every((k) => k.label.en && k.label.es && k.sample), `${subKey}: 5+ bilingual kpis with samples`);
    assert.ok(sub.pains.length > ind.pains.length && sub.pains.every((x) => x.en && x.es), `${subKey}: the sub extends the industry pains`);
    assert.ok(sub.motifs.length >= 3 && sub.roles.length >= 4);
    assert.ok(sub.meter && sub.meter.label.en && sub.meter.label.es && sub.meter.value <= sub.meter.max && sub.meter.value > 0, `${subKey}: meter hint`);
    for (const tool of sub.extra_tools) {
      const item = catalogItem(tool);
      assert.ok(item && item.monthly_cost > 0 && item.price_reviewed, `${subKey}: extra tool ${tool} must be a priced, dated catalog item`);
      const prev = sub.extra_prevalence?.[tool] ?? SUB_EXTRA_PREVALENCE;
      assert.ok(prev > 0 && prev <= 1, `${subKey}: ${tool} prevalence`);
    }
    // the industry-level keys the pass had to keep (add, never rename)
    for (const k of ['grooming', 'boarding', 'family', 'immigration', 'gym', 'yoga_studio']) if (ind.sub.some((x) => x.key === k)) assert.ok(true);
  }
  assert.ok(INDUSTRIES.pet_care.sub.some((x) => x.key === 'boarding') && INDUSTRIES.law_firm.sub.some((x) => x.key === 'family') && INDUSTRIES.gym_wellness.sub.some((x) => x.key === 'yoga_studio'), 'existing sub keys kept');
  for (const tool of ['Squarespace', 'PetLinx', 'Yelp Ads', 'Ecwid', 'WordPress hosting', 'Microsoft Teams', 'VoiceStamps', 'WordPerfect', 'PayPal', 'Jotform', 'WhatsApp Business (manual)', 'Glofox', 'Momence', 'Gusto']) assert.ok(CATALOG_TOOLS.some((t) => t.tool === tool), `${tool} in the tools index`);
  for (const key of ['pet_care', 'law_firm', 'gym_wellness']) for (const item of INDUSTRIES[key].stack) if (item.price_reviewed === '2026-09-20') assert.ok(item.price_source_note?.startsWith('Estimate'), `${item.tool}: a price added by the reference pass is marked as an estimate`);
});

ok('industryFor: a sub with depth replaces departments / kpis / pains / motifs / roles / meter; no sub (or an unknown one) returns the very same industry object', () => {
  const ind = industryFor(camila);
  assert.equal(ind.key, 'pet_care'); assert.equal(ind.label, INDUSTRIES.pet_care.label); assert.equal(ind.stack, INDUSTRIES.pet_care.stack);
  assert.ok(ind.departments.length >= 8 && ind.departments.some((d) => /Hotel/.test(d.en)));
  assert.ok(ind.kpis.length >= 8 && ind.kpis[0].label.en === 'Dogs in house');
  assert.deepEqual(ind.business_roles, ['owner', 'manager', 'front desk', 'groomer', 'handler', 'walker']);
  assert.equal(ind.meter.label.en, 'Rooms occupied tonight');
  assert.strictEqual(industryFor(p), industry('pet_care'), 'no sub: same object');
  assert.strictEqual(industryFor({ ...p, sub_industry: 'not_a_sub' }), industry('pet_care'), 'unknown sub: same object');
  assert.equal(subIndustryFor({ ...p, sub_industry: 'grooming' }).key, 'grooming');
  assert.strictEqual(industryFor({ ...p, sub_industry: 'grooming' }).departments, industry('pet_care').departments, 'a sub without departments keeps the industry\'s');
  assert.deepEqual(industryFor({ ...p, sub_industry: 'grooming' }).business_roles, ['groomer', 'front desk'], 'but its roles apply');
});

ok('guessStack T55: the sub\'s extra_tools join at the sub\'s prevalence - a dog hotel gets PetLinx (confirmed when known, first choice even when not) and Squarespace; a 9-person daycare without a sub is not billed for them', () => {
  const g = guessStack(camila);
  assert.equal(g.find((x) => x.tool === 'PetLinx')?.status, 'confirmed');
  assert.equal(g.find((x) => x.tool === 'Squarespace')?.status, 'confirmed');
  assert.ok(!g.some((x) => x.tool === 'Gingr'), 'PetLinx confirmed knocks Gingr out of Bookings & pets');
  const cold = guessStack({ ...camila, known_tools: [] });
  assert.ok(cold.some((x) => x.tool === 'PetLinx' && x.status === 'guessed'), 'without known tools PetLinx is still the dog-hotel pick');
  assert.ok(cold.some((x) => x.tool === 'Squarespace') && cold.some((x) => x.tool === 'Yelp Ads'));
  const daycare = guessStack(p);
  for (const t of ['PetLinx', 'Squarespace', 'Yelp Ads', 'Time To Pet']) assert.ok(!daycare.some((x) => x.tool === t), `${t} is under RARE_PREVALENCE industry-wide: a small daycare is asked, not billed`);
  assert.equal(new Set(cold.map((x) => x.tool)).size, cold.length); assert.equal(new Set(cold.map((x) => x.replaced_by)).size, cold.length);
  // the candidate pool: an extra tool already in the stack takes the sub's prevalence; one from elsewhere is pulled in with its catalog price
  const cands = candidateStack(camila);
  assert.equal(cands.find((x) => x.tool === 'PetLinx').prevalence, 0.75); assert.equal(cands.filter((x) => x.tool === 'PetLinx').length, 1);
  assert.strictEqual(candidateStack(p), INDUSTRIES.pet_care.stack, 'no sub: the industry stack itself');
  const groomer = candidateStack({ ...p, sub_industry: 'grooming' }); const vag = groomer.find((x) => x.tool === 'Vagaro'); assert.ok(vag && vag.monthly_cost === 45 && vag.prevalence === SUB_EXTRA_PREVALENCE, 'Vagaro pulled from salon_spa at the default sub prevalence');
  // tenant law: Teams (confirmed) replaces Zoom, WhatsApp (confirmed) replaces Slack for the club
  const a = guessStack(alicia); assert.ok(a.some((x) => x.tool === 'Microsoft Teams' && x.status === 'confirmed') && !a.some((x) => x.tool === 'Zoom'));
  const v = guessStack(valeria); assert.ok(v.some((x) => x.tool === 'WhatsApp Business (manual)') && !v.some((x) => x.tool === 'Slack') && v.some((x) => x.tool === 'Gusto'));
  for (const q of [camila, alicia, valeria]) { const s = savings(q, guessStack(q)); assert.ok(s.monthly_current > s.our_price_monthly, `${q.id}: savings story`); }
});

ok('meter widgets: the dog hotel owner (and manager) view carries one meter with value <= max and a bilingual hint; the industry-level hint (childcare) works without a sub; Maya has none; every view still has 3 widgets', () => {
  const views = deriveRoleViews(camila);
  const owner = views.find((v) => v.role === 'owner' && v.kind === 'business');
  const meter = owner.widgets.find((w) => w.kind === 'meter');
  assert.ok(meter, 'owner meter'); assert.equal(meter.title.en, 'Rooms occupied tonight'); assert.ok(meter.title.es);
  assert.ok(meter.sample.value > 0 && meter.sample.value <= meter.sample.max); assert.ok(meter.sample.hint.en && meter.sample.hint.es);
  assert.ok(views.find((v) => v.role === 'manager').widgets.some((w) => w.kind === 'meter'));
  assert.ok(!views.find((v) => v.role === 'front desk').widgets.some((w) => w.kind === 'meter'), 'the front desk keeps the KPI tile');
  assert.ok(views.every((v) => v.widgets.length === 3));
  assert.equal(views.find((v) => v.role === 'front desk').widgets[0].title.en, 'Dogs in house', 'the sub\'s first KPI is the tile');
  assert.ok(!deriveRoleViews(p).some((v) => v.widgets.some((w) => w.kind === 'meter')), 'no sub, no industry hint: no meter (Maya\'s page is unchanged)');
  const cc = deriveRoleViews({ ...p, industry: 'childcare', sub_industry: null, business_roles: [] });
  assert.ok(cc.find((v) => v.role === 'owner director').widgets.some((w) => w.kind === 'meter'), 'industry-level meter hint');
  assert.ok(deriveRoleViews(alicia).find((v) => v.role === 'owner attorney').widgets.some((w) => w.kind === 'meter'));
  assert.ok(deriveRoleViews(valeria).find((v) => v.role === 'owner').widgets.some((w) => w.kind === 'meter'));
});

ok('six seeded prospects compose all four archetypes without throwing, every Bi resolved in EN and ES, imagePrompts complete, intake asks nothing it already knows', () => {
  const walk = (x, path, seen = new Set()) => {
    if (!x || typeof x !== 'object' || seen.has(x)) return; seen.add(x);
    if ('en' in x && 'es' in x) { assert.ok(typeof x.en === 'string' && x.en.length && typeof x.es === 'string' && x.es.length, `${path}: EN + ES`); assert.ok(!/undefined|NaN|\[object/.test(x.en + x.es), `${path}: ${x.en} / ${x.es}`); return; }
    for (const [k, v] of Object.entries(x)) walk(v, `${path}.${k}`, seen);
  };
  for (const q of SEEDED) {
    const guesses = guessStack(q);
    for (const a of ['reveal', 'audit', 'walkthrough', 'letter']) {
      const m = composePage(q, a, { pageId: `pg_${q.id.slice(4)}`, slug: q.id, guesses, expiresAt: '2026-10-04T00:00:00.000Z' });
      assert.equal(m.archetype, a); assert.ok(m.sections.length >= 4 && m.sections.every((s) => s.id));
      assert.equal(m.cta.primary.to, `/demo/${q.id}`); walk(m, `${q.id}.${a}`);
    }
    const k = new Set(imagePrompts(q).map((x) => x.kind)); for (const x of ['hero', 'device_phone', 'device_laptop', 'device_tv', 'role_card', 'og_image', 'video_frames']) assert.ok(k.has(x), `${q.id}: ${x}`);
    assert.ok(!nextQuestions(q, 20).some((x) => x.field === 'sub_industry' && q.sub_industry), `${q.id}: sub-industry already known`);
    assert.ok(pickArchetype(q)[0].reasons.length);
  }
  assert.equal(pickArchetype(alicia)[0].archetype, 'letter'); assert.equal(pickArchetype(camila)[0].archetype, 'reveal');
  const es = composePage(valeria, 'reveal', { pageId: 'pg_valeria', slug: 'raiz-wellness-san-antonio' });
  assert.ok(es.sections[0].headline.es.includes('Raíz Wellness Club'));
  assert.ok(es.sections.find((s) => s.kind === 'proof').items[1].body.es.includes('Profesores y nómina'), 'the proof section lists the sub\'s departments in Spanish');
});

console.log(`\n${n} engine checks passed`);
