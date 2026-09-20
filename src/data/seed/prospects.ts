/**
 * Six fictional prospects with full profiles, stack guesses from the engine, one live page each, events and one touch each.
 * Maya, Daniel and Priya are the originals (their pages are the QA / screenshot defaults and stay byte-stable). Camila, Alicia and Valeria
 * (reference-systems.md §5.3) carry the depth of the three real imagine-os systems - a dog hotel, a tenant-law firm, a wellness club -
 * through their sub-industries; none of them is Petrock, CTL or HOY, every name, city, palette and number is invented.
 */
import type { SeedCtx } from './index';
import type { ProspectRow } from '../schema/core';
import { guessStack, composePage, pickArchetype, imagePrompts, computeConfidence } from '../../engine';
import { addDays, iso } from './rng';

export const order = 0;
const KNOWN = ['first_name', 'business_name', 'industry', 'city', 'team_size', 'locations', 'warmth', 'lang', 'style', 'business_roles', 'life_roles'];

export function seed(ctx: SeedCtx) {
  const { add, now, r } = ctx;
  const base = { created_at: iso(addDays(now, -12)), updated_at: iso(addDays(now, -1)), country: 'US', sub_industry: null, logo_url: null, photo_url: null };
  const prospects: ProspectRow[] = [
    { ...base, id: 'pro_maya', first_name: 'Maya', last_name: 'Castillo', business_name: 'Paws & Play Austin', industry: 'pet_care', city: 'Austin', lang: 'en', website: 'https://pawsandplay.demo', team_size: 9, locations: 1, revenue_band: '250k_1m', warmth: 'warm', source: 'linkedin',
      style: { palette: { primary: '#F25F3A', accent: '#FFD23F', bg: '#FFF8F2', surface: '#FFFFFF', text: '#2A1A14' }, tone: 'playful', font: 'display', imagery: ['golden hour play yard', 'happy medium dogs', 'hand-painted signage'] },
      life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'vet partner'], business_roles: ['owner', 'manager', 'front desk', 'handler', 'groomer'], known_tools: ['Gingr', 'Square'], confidence: computeConfidence([...KNOWN, 'known_tools', 'website'], { industry: 'pet_care' }), fields_known: [...KNOWN, 'known_tools', 'website'], notes: 'Met at the Austin small business meetup. Posts daily report cards on Instagram from her phone.' },
    { ...base, id: 'pro_daniel', first_name: 'Daniel', last_name: 'Ortiz', business_name: 'Sonrisa Dental Miami', industry: 'dental', city: 'Miami', lang: 'es', website: 'https://sonrisadental.demo', team_size: 22, locations: 2, revenue_band: '1m_5m', warmth: 'cold', source: 'cold_email',
      style: { palette: { primary: '#0E7C86', accent: '#7FD1AE', bg: '#F3FAFA', surface: '#FFFFFF', text: '#0F2A2E' }, tone: 'clean', font: 'humanist', imagery: ['bright operatory', 'Miami light', 'two storefronts'] },
      life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'practice consultant'], business_roles: ['owner dentist', 'office manager', 'front office', 'hygienist', 'associate dentist', 'billing'], known_tools: [], confidence: computeConfidence(KNOWN.filter((k) => k !== 'style'), { industry: 'dental' }), fields_known: KNOWN.filter((k) => k !== 'style'), notes: 'Two locations (Brickell, Coral Gables). Spanish-first team. Website mentions Dentrix in a job post.' },
    { ...base, id: 'pro_priya', first_name: 'Priya', last_name: 'Raman', business_name: 'Highline Hospitality Group', industry: 'restaurant', city: 'Denver', lang: 'en', website: 'https://highlinehg.demo', team_size: 64, locations: 3, revenue_band: '5m_plus', warmth: 'hot', source: 'referral',
      style: { palette: { primary: '#1F1B2E', accent: '#D4A853', bg: '#FAF7F0', surface: '#FFFFFF', text: '#1F1B2E' }, tone: 'luxury', font: 'serif', imagery: ['golden-hour dining room', 'copper bar', 'mountain skyline'] },
      life_roles: ['owner', 'spouse/partner', 'accountant', 'investor'], business_roles: ['owner', 'general manager', 'chef', 'shift lead', 'host', 'events manager'], known_tools: ['Toast POS', '7shifts', 'OpenTable', 'Tripleseat'], confidence: computeConfidence([...KNOWN, 'known_tools', 'website', 'revenue_band'], { industry: 'restaurant' }), fields_known: [...KNOWN, 'known_tools', 'website', 'revenue_band'], notes: 'Referred by a shared investor. Three concepts, opening a fourth in spring. Wants one dashboard on the office TV.' },
    // --- reference-systems pass (2026-09-20): the shape of Petrock, CTL and Hoy as three fictional prospects ---
    { ...base, created_at: iso(addDays(now, -2)), id: 'pro_camila', first_name: 'Camila', last_name: 'Reyes', business_name: 'Fetch & Stay Dog Hotel', industry: 'pet_care', sub_industry: 'dog_hotel_spa', city: 'San Diego', lang: 'en', website: 'https://fetchandstay.demo', team_size: 18, locations: 2, revenue_band: '1m_5m', warmth: 'warm', source: 'event',
      style: { palette: { primary: '#3F2B96', accent: '#F2A93B', bg: '#F7F5FF', surface: '#FFFFFF', text: '#1E1B2E' }, tone: 'playful', font: 'display', imagery: ['music-themed suite with a TV', 'nightly photo update on a phone', 'two storefronts, two hours boards'] },
      life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'vet partner'], business_roles: ['owner', 'manager', 'front desk', 'groomer', 'handler', 'walker'], known_tools: ['Squarespace', 'PetLinx'], confidence: computeConfidence([...KNOWN, 'sub_industry', 'known_tools', 'website', 'revenue_band'], { industry: 'pet_care' }), fields_known: [...KNOWN, 'sub_industry', 'known_tools', 'website', 'revenue_band'], notes: 'Two locations; front desk should only see its own; owner wants both on one screen. Vaccines chased by text today; managers approve refunds by phone call.' },
    { ...base, created_at: iso(addDays(now, -2)), id: 'pro_alicia', first_name: 'Alicia', last_name: 'Navarro', business_name: "Renters' Shield Law", industry: 'law_firm', sub_industry: 'tenant_law', city: 'Fresno', lang: 'en', website: 'https://rentersshield.demo', team_size: 11, locations: 4, revenue_band: '1m_5m', warmth: 'hot', source: 'referral',
      style: { palette: { primary: '#1B4332', accent: '#D9A441', bg: '#F6F4EE', surface: '#FFFFFF', text: '#12261C' }, tone: 'clean', font: 'serif', imagery: ['eviction game board on a wall screen', 'client reading what comes next on a phone', 'numbered pleading paper on a monitor'] },
      life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'of counsel'], business_roles: ['owner attorney', 'attorney', 'paralegal', 'front desk', 'marketing', 'billing'], known_tools: ['WordPress hosting', 'Ecwid', 'Microsoft Teams', 'WordPerfect'], confidence: computeConfidence([...KNOWN, 'sub_industry', 'known_tools', 'website', 'revenue_band'], { industry: 'law_firm' }), fields_known: [...KNOWN, 'sub_industry', 'known_tools', 'website', 'revenue_band'], notes: 'Fixed-price services by eviction stage; consultations by phone / video only; deadlines in a spreadsheet; pleadings in WordPerfect; wants clients to see what comes next and what to pay next. Spanish-speaking clients: the ES fill matters.' },
    { ...base, created_at: iso(addDays(now, -2)), id: 'pro_valeria', first_name: 'Valeria', last_name: 'Mendoza', business_name: 'Raíz Wellness Club', industry: 'gym_wellness', sub_industry: 'wellness_club', city: 'San Antonio', lang: 'es', website: null, team_size: 14, locations: 1, revenue_band: '250k_1m', warmth: 'warm', source: 'inbound',
      style: { palette: { primary: '#2F4858', accent: '#E4B363', bg: '#FAF6EE', surface: '#FFFFFF', text: '#1F2A33' }, tone: 'warm', font: 'humanist', imagery: ['cream studio at sunrise', "teacher's payroll statement", 'WhatsApp inbox at the front desk'] },
      life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'nutritionist'], business_roles: ['owner', 'coordinator', 'front desk', 'teacher', 'finance', 'maintenance'], known_tools: ['Mindbody', 'WhatsApp Business (manual)', 'Squarespace'], confidence: computeConfidence([...KNOWN, 'sub_industry', 'known_tools'], { industry: 'gym_wellness' }), fields_known: [...KNOWN, 'sub_industry', 'known_tools'], notes: 'Spanish-first team; memberships plus class packs; teacher payroll per class in a spreadsheet; WhatsApp on one phone; wants the studio\'s numbers on the front-desk screen.' },
  ];
  ctx.ids.prospects = prospects.map((p) => p.id);
  const slugs: Record<string, string> = { pro_maya: 'paws-and-play-austin', pro_daniel: 'sonrisa-dental-miami', pro_priya: 'highline-hospitality-denver', pro_camila: 'fetch-and-stay-san-diego', pro_alicia: 'renters-shield-law-fresno', pro_valeria: 'raiz-wellness-san-antonio' };
  /** Page timing: the originals went live three days ago (11 days left); the reference-pass three went live yesterday and run the full 14 days from the seed. */
  const live = (p: ProspectRow) => (p.created_at === base.created_at ? { published: -3, expires: 11, firstVisit: -2 } : { published: -1, expires: 14, firstVisit: -0.8 });
  for (const p of prospects) {
    add('prospects', p);
    const guesses = guessStack(p);
    guesses.forEach((g, i) => add('stack_guesses', { id: `sg_${p.id.slice(4)}_${i}`, prospect_id: p.id, ...g }));
    const archetype = pickArchetype(p)[0].archetype;
    const pageId = `pg_${p.id.slice(4)}`;
    const when = live(p);
    const model = composePage(p, archetype, { pageId, slug: slugs[p.id], guesses, expiresAt: iso(addDays(now, when.expires)) });
    add('pages', { id: pageId, prospect_id: p.id, archetype, slug: slugs[p.id], variant: 'A', status: 'live', published_at: iso(addDays(now, when.published)), expires_at: iso(addDays(now, when.expires)), model });
    imagePrompts(p).forEach((ip, i) => add('assets', { id: `as_${p.id.slice(4)}_${i}`, prospect_id: p.id, kind: ip.kind, prompt: ip.prompt, status: 'queued', url: null, provider: null }));
    add('touches', { id: `tch_${p.id.slice(4)}`, prospect_id: p.id, channel: p.source === 'cold_email' ? 'cold_email' : p.source === 'linkedin' ? 'linkedin_dm' : 'warm_intro', subject: p.lang === 'es' ? `Ya construimos el sistema de ${p.business_name}` : `We already built ${p.business_name}'s operating system`, body_preview: p.lang === 'es' ? `${p.first_name}, un enlace de 14 días con tu OS en vivo...` : `${p.first_name}, a 14-day link with your OS live, themed to ${p.business_name}...`, sent_at: iso(addDays(now, when.published)), opened_at: iso(addDays(now, when.firstVisit)), clicked_at: p.warmth === 'cold' ? null : iso(addDays(now, when.firstVisit)), page_id: pageId, status: p.warmth === 'cold' ? 'opened' : 'clicked' });
    // a handful of sessions of events per page
    const sessions = p.warmth === 'hot' ? 3 : p.warmth === 'warm' ? 2 : 1;
    let n = 0;
    for (let sIdx = 0; sIdx < sessions; sIdx++) {
      const sid = `s_seed_${p.id.slice(4)}_${sIdx}`;
      const t0 = addDays(now, when.firstVisit + sIdx * (when.firstVisit < -1 ? 0.5 : 0.25));
      const ev = (type: string, meta: Record<string, unknown>, mins: number) => add('events', { id: `ev_${p.id.slice(4)}_${n++}`, page_id: pageId, prospect_id: p.id, session_id: sid, type, meta, ts: new Date(t0.getTime() + mins * 60000).toISOString() });
      ev('outreach_open', { channel: 'email' }, -30);
      ev('view', { archetype, lang: p.lang }, 0);
      for (const sec of model.sections) ev('section_view', { section: sec.kind, seconds: r.int(4, sec.kind === 'savings_stack' ? 40 : 18) }, 1);
      ev('scroll_depth', { depth: r.pick([0.5, 0.75, 1]) }, 2);
      if (p.warmth !== 'cold' || sIdx > 0) { ev('cta_click', { cta: 'primary' }, 3); ev('demo_open', { role: p.business_roles[0] }, 3); ev('demo_role_switch', { role: p.life_roles[1] }, 5); }
      if (p.warmth === 'hot' && sIdx === 2) { ev('booking_started', {}, 8); ev('booking_confirmed', { slot: iso(addDays(now, 2)) }, 9); }
      if (p.warmth === 'cold') ev('exit_intent', {}, 2);
    }
    if (p.warmth === 'hot') add('bookings', { id: `bk_${p.id.slice(4)}`, prospect_id: p.id, page_id: pageId, slot: iso(addDays(now, 2)), duration_min: 15, status: 'confirmed', contact_name: `${p.first_name} ${p.last_name}`, contact_email: `${p.first_name.toLowerCase()}@example.com`, contact_phone: null, notes: p.id === 'pro_alicia' ? 'Wants the paralegal on the call; asks whether clients can see the eviction stage and what to pay next.' : 'Wants the GM and the accountant on the call.' });
  }
  add('feedback', { id: 'fb_seed_1', user_id: 'usr_strategist', user_name: 'Nora Vale', role: 'strategist', page_code: 'HUB-01', route: '/', kind: 'idea', text: 'Show the savings number on each prospect card in the hub.', element_path: null, component: 'Card', viewport: '1280', theme: 'light', status: 'new', triage: null, triage_note: null, decision_ref: null, owner_reply: null });
}
