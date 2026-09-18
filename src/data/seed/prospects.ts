/** Three fictional prospects with full profiles, stack guesses from the engine, one live page each, events and one touch each. */
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
      life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'vet partner'], business_roles: ['owner', 'manager', 'front desk', 'handler', 'groomer'], known_tools: ['Gingr', 'Square'], confidence: computeConfidence([...KNOWN, 'known_tools', 'website']), fields_known: [...KNOWN, 'known_tools', 'website'], notes: 'Met at the Austin small business meetup. Posts daily report cards on Instagram from her phone.' },
    { ...base, id: 'pro_daniel', first_name: 'Daniel', last_name: 'Ortiz', business_name: 'Sonrisa Dental Miami', industry: 'dental', city: 'Miami', lang: 'es', website: 'https://sonrisadental.demo', team_size: 22, locations: 2, revenue_band: '1m_5m', warmth: 'cold', source: 'cold_email',
      style: { palette: { primary: '#0E7C86', accent: '#7FD1AE', bg: '#F3FAFA', surface: '#FFFFFF', text: '#0F2A2E' }, tone: 'clean', font: 'humanist', imagery: ['bright operatory', 'Miami light', 'two storefronts'] },
      life_roles: ['owner', 'spouse/partner', 'kids', 'accountant', 'practice consultant'], business_roles: ['owner dentist', 'office manager', 'front office', 'hygienist', 'associate dentist', 'billing'], known_tools: [], confidence: computeConfidence(KNOWN.filter((k) => k !== 'style')), fields_known: KNOWN.filter((k) => k !== 'style'), notes: 'Two locations (Brickell, Coral Gables). Spanish-first team. Website mentions Dentrix in a job post.' },
    { ...base, id: 'pro_priya', first_name: 'Priya', last_name: 'Raman', business_name: 'Highline Hospitality Group', industry: 'restaurant', city: 'Denver', lang: 'en', website: 'https://highlinehg.demo', team_size: 64, locations: 3, revenue_band: '5m_plus', warmth: 'hot', source: 'referral',
      style: { palette: { primary: '#1F1B2E', accent: '#D4A853', bg: '#FAF7F0', surface: '#FFFFFF', text: '#1F1B2E' }, tone: 'luxury', font: 'serif', imagery: ['golden-hour dining room', 'copper bar', 'mountain skyline'] },
      life_roles: ['owner', 'spouse/partner', 'accountant', 'investor'], business_roles: ['owner', 'general manager', 'chef', 'shift lead', 'host', 'events manager'], known_tools: ['Toast POS', '7shifts', 'OpenTable', 'Tripleseat'], confidence: computeConfidence([...KNOWN, 'known_tools', 'website', 'revenue_band']), fields_known: [...KNOWN, 'known_tools', 'website', 'revenue_band'], notes: 'Referred by a shared investor. Three concepts, opening a fourth in spring. Wants one dashboard on the office TV.' },
  ];
  ctx.ids.prospects = prospects.map((p) => p.id);
  const slugs: Record<string, string> = { pro_maya: 'paws-and-play-austin', pro_daniel: 'sonrisa-dental-miami', pro_priya: 'highline-hospitality-denver' };
  for (const p of prospects) {
    add('prospects', p);
    const guesses = guessStack(p);
    guesses.forEach((g, i) => add('stack_guesses', { id: `sg_${p.id.slice(4)}_${i}`, prospect_id: p.id, ...g }));
    const archetype = pickArchetype(p)[0].archetype;
    const pageId = `pg_${p.id.slice(4)}`;
    const model = composePage(p, archetype, { pageId, slug: slugs[p.id], guesses, expiresAt: iso(addDays(now, 11)) });
    add('pages', { id: pageId, prospect_id: p.id, archetype, slug: slugs[p.id], variant: 'A', status: 'live', published_at: iso(addDays(now, -3)), expires_at: iso(addDays(now, 11)), model });
    imagePrompts(p).forEach((ip, i) => add('assets', { id: `as_${p.id.slice(4)}_${i}`, prospect_id: p.id, kind: ip.kind, prompt: ip.prompt, status: 'queued', url: null, provider: null }));
    add('touches', { id: `tch_${p.id.slice(4)}`, prospect_id: p.id, channel: p.source === 'cold_email' ? 'cold_email' : p.source === 'linkedin' ? 'linkedin_dm' : 'warm_intro', subject: p.lang === 'es' ? `Ya construimos el sistema de ${p.business_name}` : `We already built ${p.business_name}'s operating system`, body_preview: p.lang === 'es' ? `${p.first_name}, un enlace de 14 días con tu OS en vivo...` : `${p.first_name}, a 14-day link with your OS live, themed to ${p.business_name}...`, sent_at: iso(addDays(now, -3)), opened_at: iso(addDays(now, -2)), clicked_at: p.warmth === 'cold' ? null : iso(addDays(now, -2)), page_id: pageId, status: p.warmth === 'cold' ? 'opened' : 'clicked' });
    // a handful of sessions of events per page
    const sessions = p.warmth === 'hot' ? 3 : p.warmth === 'warm' ? 2 : 1;
    let n = 0;
    for (let sIdx = 0; sIdx < sessions; sIdx++) {
      const sid = `s_seed_${p.id.slice(4)}_${sIdx}`;
      const t0 = addDays(now, -2 + sIdx * 0.5);
      const ev = (type: string, meta: Record<string, unknown>, mins: number) => add('events', { id: `ev_${p.id.slice(4)}_${n++}`, page_id: pageId, prospect_id: p.id, session_id: sid, type, meta, ts: new Date(t0.getTime() + mins * 60000).toISOString() });
      ev('outreach_open', { channel: 'email' }, -30);
      ev('view', { archetype, lang: p.lang }, 0);
      for (const sec of model.sections) ev('section_view', { section: sec.kind, seconds: r.int(4, sec.kind === 'savings_stack' ? 40 : 18) }, 1);
      ev('scroll_depth', { depth: r.pick([0.5, 0.75, 1]) }, 2);
      if (p.warmth !== 'cold' || sIdx > 0) { ev('cta_click', { cta: 'primary' }, 3); ev('demo_open', { role: p.business_roles[0] }, 3); ev('demo_role_switch', { role: p.life_roles[1] }, 5); }
      if (p.warmth === 'hot' && sIdx === 2) { ev('booking_started', {}, 8); ev('booking_confirmed', { slot: iso(addDays(now, 2)) }, 9); }
      if (p.warmth === 'cold') ev('exit_intent', {}, 2);
    }
    if (p.warmth === 'hot') add('bookings', { id: `bk_${p.id.slice(4)}`, prospect_id: p.id, page_id: pageId, slot: iso(addDays(now, 2)), duration_min: 15, status: 'confirmed', notes: 'Wants the GM and the accountant on the call.' });
  }
  add('feedback', { id: 'fb_seed_1', user_id: 'usr_strategist', user_name: 'Nora Vale', role: 'strategist', page_code: 'HUB-01', route: '/', kind: 'idea', text: 'Show the savings number on each prospect card in the hub.', element_path: null, component: 'Card', viewport: '1280', theme: 'light', status: 'new', triage: null, triage_note: null, decision_ref: null, owner_reply: null });
}
