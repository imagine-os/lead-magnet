import type { Prospect, Signals, Archetype } from './types';
import type { EventRow, PageRow } from '../data/schema/core';
import { pickArchetype } from './archetype';

/** How much each field changes the page (0..1). The intake asks for the highest-weight unknown first. */
export const FIELD_WEIGHTS: Record<string, { weight: number; question: { en: string; es: string } }> = {
  industry: { weight: 1.0, question: { en: 'What kind of business is {business}?', es: '¿Qué tipo de negocio es {business}?' } },
  business_name: { weight: 0.95, question: { en: 'What is the business called?', es: '¿Cómo se llama el negocio?' } },
  first_name: { weight: 0.9, question: { en: 'Who are we talking to (first name)?', es: '¿Con quién hablamos (nombre)?' } },
  team_size: { weight: 0.8, question: { en: 'How many people work at {business}?', es: '¿Cuántas personas trabajan en {business}?' } },
  known_tools: { weight: 0.8, question: { en: 'Which software do they pay for today?', es: '¿Qué software pagan hoy?' } },
  locations: { weight: 0.7, question: { en: 'How many locations?', es: '¿Cuántas sedes?' } },
  business_roles: { weight: 0.7, question: { en: 'Which roles exist in the business?', es: '¿Qué roles hay en el negocio?' } },
  life_roles: { weight: 0.65, question: { en: 'Who else is in their life that would want a view (partner, kids, accountant)?', es: '¿Quién más en su vida querría una vista (pareja, hijos, contador)?' } },
  style: { weight: 0.6, question: { en: 'Brand colours and tone (from their site or socials)?', es: '¿Colores y tono de marca?' } },
  warmth: { weight: 0.6, question: { en: 'Cold, warm or hot?', es: '¿Frío, tibio o caliente?' } },
  revenue_band: { weight: 0.5, question: { en: 'Rough revenue band?', es: '¿Rango de ingresos aproximado?' } },
  city: { weight: 0.45, question: { en: 'Which city?', es: '¿Qué ciudad?' } },
  lang: { weight: 0.4, question: { en: 'English or Spanish?', es: '¿Inglés o español?' } },
  website: { weight: 0.3, question: { en: 'Website URL?', es: '¿Sitio web?' } },
  photo_url: { weight: 0.2, question: { en: 'A photo of them or the storefront?', es: '¿Una foto de la persona o del local?' } },
};

export interface NextQuestion { field: string; weight: number; question: { en: string; es: string } }
/** Highest-value unknown fields first. */
export function nextQuestions(p: Prospect, limit = 3): NextQuestion[] {
  const known = new Set(p.fields_known ?? []);
  return Object.entries(FIELD_WEIGHTS).filter(([f]) => !known.has(f)).map(([field, v]) => ({ field, weight: v.weight, question: { en: v.question.en.replace('{business}', p.business_name || 'the business'), es: v.question.es.replace('{business}', p.business_name || 'el negocio') } })).sort((a, b) => b.weight - a.weight).slice(0, limit);
}
/** Confidence = weighted share of known fields. */
export function computeConfidence(fields_known: string[]): number {
  const total = Object.values(FIELD_WEIGHTS).reduce((s, v) => s + v.weight, 0);
  const got = fields_known.reduce((s, f) => s + (FIELD_WEIGHTS[f]?.weight ?? 0), 0);
  return Math.round((got / total) * 100) / 100;
}
/** Returns an updated prospect with the field set, fields_known extended and confidence recomputed (pure). */
export function applyAnswer<K extends keyof Prospect>(p: Prospect, field: K, value: Prospect[K]): Prospect {
  const fields_known = Array.from(new Set([...(p.fields_known ?? []), String(field)]));
  return { ...p, [field]: value, fields_known, confidence: computeConfidence(fields_known) };
}

export interface Recommendation { kind: 'switch_archetype' | 'add_section' | 'shorten' | 'ask'; to?: Archetype; section?: string; reason: string; score: number }
/** Reads a page's events and recommends changes (e.g. long dwell on savings -> switch to audit; exit without CTA -> add letter). */
export function adaptFromEvents(page: PageRow, events: EventRow[], prospect: Prospect): Recommendation[] {
  const mine = events.filter((e) => e.page_id === page.id);
  const sessions = new Set(mine.map((e) => e.session_id)).size || 1;
  const dwell = mine.filter((e) => e.type === 'section_view' && (e.meta as { section?: string }).section === 'savings_stack').reduce((s, e) => s + Number((e.meta as { seconds?: number }).seconds ?? 0), 0) / sessions;
  const ctaClicks = mine.filter((e) => e.type === 'cta_click' || e.type === 'demo_open' || e.type === 'booking_started').length;
  const exits = mine.filter((e) => e.type === 'exit_intent').length;
  const depth = mine.filter((e) => e.type === 'scroll_depth').reduce((m, e) => Math.max(m, Number((e.meta as { depth?: number }).depth ?? 0)), 0);
  const signals: Signals = { dwellSavings: dwell, exitWithoutCta: exits > 0 && ctaClicks === 0, scrollDepth: mine.length ? depth : undefined };
  const ranked = pickArchetype(prospect, signals);
  const recs: Recommendation[] = [];
  if (ranked[0].archetype !== page.archetype && mine.length >= 3) recs.push({ kind: 'switch_archetype', to: ranked[0].archetype, reason: `events favour ${ranked[0].archetype}: ${ranked[0].reasons.slice(-2).join('; ')}`, score: ranked[0].score });
  if (signals.exitWithoutCta) recs.push({ kind: 'add_section', section: 'letter', reason: 'exit intent with no CTA click: add a short personal letter above the CTA band', score: 3 });
  if (dwell > 20 && page.archetype !== 'audit') recs.push({ kind: 'add_section', section: 'stack_audit', reason: `average ${Math.round(dwell)} s on savings: let them correct the tool list`, score: 2 });
  if (signals.scrollDepth != null && signals.scrollDepth < 0.3 && mine.length >= 3) recs.push({ kind: 'shorten', reason: 'most sessions stop above 30 % scroll: move the CTA band up, cut proof', score: 2 });
  if (prospect.confidence < 0.5) recs.push({ kind: 'ask', reason: `confidence ${Math.round(prospect.confidence * 100)} %: run intake before the next variant`, score: 1 });
  return recs.sort((a, b) => b.score - a.score);
}

/** The LLM seam. RuleEnricher is the default (pure rules); an LLM enricher lands in T43 behind the same interface. */
export interface Enricher { readonly name: string; readonly wired: boolean; enrich(p: Prospect, hints?: Record<string, unknown>): Promise<Partial<Prospect>>; }
export class RuleEnricher implements Enricher {
  readonly name = 'rules'; readonly wired = true;
  async enrich(p: Prospect): Promise<Partial<Prospect>> {
    const { industry } = await import('./catalog/industries');
    const ind = industry(p.industry);
    const patch: Partial<Prospect> = {};
    if (!p.business_roles?.length) patch.business_roles = ind.business_roles.slice(0, Math.max(2, Math.min(6, Math.ceil(p.team_size / 3))));
    if (!p.life_roles?.length) patch.life_roles = ind.life_roles.slice(0, 4);
    return patch;
  }
}
/** Placeholder: not wired yet. Returns nothing and says so, so the UI can show the Placeholder state. */
export class LlmEnricher implements Enricher {
  readonly name = 'llm'; readonly wired = false;
  async enrich(): Promise<Partial<Prospect>> { return {}; }
}
export const defaultEnricher: Enricher = new RuleEnricher();
