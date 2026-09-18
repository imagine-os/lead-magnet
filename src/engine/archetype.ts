import type { Archetype, ArchetypeScore, Prospect, Signals } from './types';
import { ARCHETYPES } from '../data/schema/core';

/**
 * Scoring rules from docs/reference/conversion-playbook.md:
 * warmth cold -> A 3, B 4; warm -> A 4, C 3; hot -> D 4, A 3; revenue_band low or many guessed tools -> +2 B;
 * team_size >= 15 or many roles -> +1 C; confidence < 0.4 -> +1 B (audit collects data); lang es -> no change.
 * Signals from a live page (adaptFromEvents) can nudge further. Returns archetypes ranked, with reasons.
 */
export function pickArchetype(p: Prospect, signals: Signals = {}): ArchetypeScore[] {
  const s: Record<Archetype, ArchetypeScore> = Object.fromEntries(ARCHETYPES.map((a) => [a, { archetype: a, score: 0, reasons: [] as string[] }])) as unknown as Record<Archetype, ArchetypeScore>;
  const add = (a: Archetype, n: number, why: string) => { s[a].score += n; s[a].reasons.push(`${n > 0 ? '+' : ''}${n} ${why}`); };
  if (p.warmth === 'cold') { add('reveal', 3, 'cold traffic: the reveal still opens strong'); add('audit', 4, 'cold traffic: lead with money'); }
  if (p.warmth === 'warm') { add('reveal', 4, 'warm: they already know us, show the thing'); add('walkthrough', 3, 'warm: a day-in-the-life story lands'); }
  if (p.warmth === 'hot') { add('letter', 4, 'hot: a short personal letter over their app'); add('reveal', 3, 'hot: reveal as fallback'); }
  const many = (signals.guessedTools ?? 0) >= 7;
  if (p.revenue_band === 'lt250k' || many) add('audit', 2, p.revenue_band === 'lt250k' ? 'low revenue band: price sensitive' : 'many guessed tools: the crossed-out list is the hook');
  const roles = (p.business_roles?.length ?? 0) + (p.life_roles?.length ?? 0);
  if (p.team_size >= 15 || roles >= 8) add('walkthrough', 1, 'big team or many roles: each role gets a scene');
  if (p.confidence < 0.4) add('audit', 1, 'low confidence: the audit collects self-reported data');
  if (signals.dwellSavings && signals.dwellSavings > 20) add('audit', 2, 'long dwell on savings');
  if (signals.exitWithoutCta) add('letter', 1, 'exit without CTA: try the personal note');
  if (signals.scrollDepth != null && signals.scrollDepth < 0.3) add('letter', 1, 'shallow scroll: shorter page');
  return Object.values(s).sort((a, b) => b.score - a.score || ARCHETYPES.indexOf(a.archetype) - ARCHETYPES.indexOf(b.archetype));
}
export const defaultArchetype: Archetype = 'reveal';
