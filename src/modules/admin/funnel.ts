/**
 * The one funnel vocabulary (R-A01). Pure: every breakdown on A-01 and the timeline on A-02 read these helpers,
 * so archetype, warmth and variant views can never disagree about what a stage means.
 * A stage is counted as DISTINCT SESSIONS, not raw events: one session that fires six section_views is one viewer.
 */
import type { EventRow, EventType } from '../../data/schema/core';

export const FUNNEL_STAGES = ['outreach_open', 'view', 'demo_open', 'booking_started', 'booking_confirmed'] as const;
export type FunnelStageKey = (typeof FUNNEL_STAGES)[number];
export type StageCounts = Record<FunnelStageKey, number>;
/** i18n key per stage; the admin module owns these strings. */
export const STAGE_KEY: Record<FunnelStageKey, string> = { outreach_open: 'admin.stage_outreach_open', view: 'admin.stage_view', demo_open: 'admin.stage_demo_open', booking_started: 'admin.stage_booking_started', booking_confirmed: 'admin.stage_booking_confirmed' };
const IN_FUNNEL = new Set<string>(FUNNEL_STAGES);
export const isFunnelStage = (t: EventType): t is FunnelStageKey => IN_FUNNEL.has(t);
export const emptyCounts = (): StageCounts => ({ outreach_open: 0, view: 0, demo_open: 0, booking_started: 0, booking_confirmed: 0 });

/** Distinct sessions that reached each stage. */
export function countSessions(events: EventRow[]): StageCounts {
  const sets: Record<FunnelStageKey, Set<string>> = { outreach_open: new Set(), view: new Set(), demo_open: new Set(), booking_started: new Set(), booking_confirmed: new Set() };
  for (const e of events) if (isFunnelStage(e.type)) sets[e.type].add(e.session_id);
  return { outreach_open: sets.outreach_open.size, view: sets.view.size, demo_open: sets.demo_open.size, booking_started: sets.booking_started.size, booking_confirmed: sets.booking_confirmed.size };
}
/** Same counts, split by any key derived from the event (archetype, warmth, variant). Rows with a null key are dropped. */
export function groupSessions<K extends string>(events: EventRow[], keyOf: (e: EventRow) => K | null | undefined): { key: K; counts: StageCounts }[] {
  const byKey = new Map<K, EventRow[]>();
  for (const e of events) { const k = keyOf(e); if (k == null) continue; const list = byKey.get(k); if (list) list.push(e); else byKey.set(k, [e]); }
  return [...byKey.entries()].map(([key, list]) => ({ key, counts: countSessions(list) })).sort((a, b) => b.counts.view - a.counts.view || String(a.key).localeCompare(String(b.key)));
}
/** Share of `from` that reached `to`, 0..1. Never divides by zero. */
export const rate = (to: number, from: number): number => (from > 0 ? to / from : 0);
export const pctLabel = (to: number, from: number): string => (from > 0 ? `${Math.round(rate(to, from) * 1000) / 10} %` : '—');
export const total = (c: StageCounts): number => FUNNEL_STAGES.reduce((s, k) => s + c[k], 0);
