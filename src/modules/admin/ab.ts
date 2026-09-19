/**
 * The A/B readout (A-01). An A/B test is exactly two live `pages` rows on one slug, variant A and variant B,
 * each with its own archetype and snapshot (D-061); the visitor is bucketed by hash(session + slug) (D-078).
 * Everything here is pure and counts through `./funnel` (R-A01), so the A/B numbers can never disagree with the
 * funnel above them. Nothing here calls a side ahead below the minimum sample (R-A04).
 */
import type { EventRow, PageRow } from '../../data/schema/core';
import { FUNNEL_STAGES, countSessions, emptyCounts, rate, type FunnelStageKey, type StageCounts } from './funnel';

/** Distinct `view` sessions each side needs before any side is called ahead. Proposed as a decision this pass. */
export const AB_MIN_SESSIONS = 30;
/** Relative lift the leader needs on top of the sample, so a two-point wobble is not a "winner". */
export const AB_MIN_LIFT = 0.1;
/** The compared metric: the page's own job. Bookings are shown but never decide - they are far too sparse per page. */
export const AB_METRIC: { from: FunnelStageKey; to: FunnelStageKey } = { from: 'view', to: 'demo_open' };

export const VARIANTS = ['A', 'B'] as const;
export type VariantLabel = (typeof VARIANTS)[number];
/** The studio writes 'A' / 'B'; anything else is read as A so a hand-edited row can never vanish from the readout. */
export const normalizeVariant = (v: string | null | undefined): VariantLabel => ((v ?? 'A').trim().toUpperCase() === 'B' ? 'B' : 'A');

/** The variant an event belongs to: the `pages` row it points at, else the `variant` the landing page stamped in meta. */
export function variantOfEvent(e: EventRow, pageById: Record<string, PageRow | undefined>): VariantLabel | null {
  const row = e.page_id ? pageById[e.page_id] : undefined;
  if (row) return normalizeVariant(row.variant);
  const m = (e.meta ?? {}) as Record<string, unknown>;
  return typeof m.variant === 'string' && m.variant.trim() ? normalizeVariant(m.variant) : null;
}

export interface AbSlug { slug: string; prospect_id: string; pages: PageRow[] }
/** Every slug that is actually running a split right now: two or more live rows with two distinct variants. */
export function abSlugs(pages: PageRow[]): AbSlug[] {
  const bySlug = new Map<string, PageRow[]>();
  for (const p of pages) { if (p.status !== 'live') continue; const list = bySlug.get(p.slug); if (list) list.push(p); else bySlug.set(p.slug, [p]); }
  return [...bySlug.entries()]
    .filter(([, rows]) => new Set(rows.map((r) => normalizeVariant(r.variant))).size >= 2)
    .map(([slug, rows]) => ({ slug, prospect_id: rows[0].prospect_id, pages: [...rows].sort((a, b) => normalizeVariant(a.variant).localeCompare(normalizeVariant(b.variant))) }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export interface VariantReadout {
  variant: VariantLabel; page: PageRow; counts: StageCounts;
  /** Distinct sessions that produced any event on this page (not only funnel stages). */
  sessions: number;
  liveSince: string | null;
  /** The compared metric for this side, 0..1, and the two counts behind it (R-A02: never a rate on its own). */
  metric: { value: number; to: number; from: number };
}
export type AbVerdict = 'not_enough' | 'too_close' | 'leader';
export interface AbReadoutModel {
  slug: string; prospect_id: string; sides: VariantReadout[];
  verdict: AbVerdict; leader: VariantLabel | null; lift: number;
  minSessions: number; minLift: number;
  /** The side with fewer `view` sessions - what the "not enough data" line has to report honestly. */
  smallestSample: number;
}

const distinctSessions = (events: EventRow[]) => new Set(events.map((e) => e.session_id)).size;

/** One slug's readout: both sides counted with the shared funnel code, then a verdict that stays honest below the sample. */
export function abReadout(slug: string, pages: PageRow[], events: EventRow[]): AbReadoutModel | null {
  const entry = abSlugs(pages).find((s) => s.slug === slug);
  if (!entry) return null;
  const firstOf = (v: VariantLabel) => entry.pages.find((p) => normalizeVariant(p.variant) === v);
  const sides: VariantReadout[] = [];
  for (const v of VARIANTS) {
    const page = firstOf(v);
    if (!page) continue;
    const mine = events.filter((e) => e.page_id === page.id);
    const counts = mine.length ? countSessions(mine) : emptyCounts();
    sides.push({ variant: v, page, counts, sessions: distinctSessions(mine), liveSince: page.published_at, metric: { value: rate(counts[AB_METRIC.to], counts[AB_METRIC.from]), to: counts[AB_METRIC.to], from: counts[AB_METRIC.from] } });
  }
  const a = sides.find((s) => s.variant === 'A');
  const b = sides.find((s) => s.variant === 'B');
  const smallestSample = Math.min(...sides.map((s) => s.metric.from));
  let verdict: AbVerdict = 'not_enough'; let leader: VariantLabel | null = null; let lift = 0;
  if (a && b && smallestSample >= AB_MIN_SESSIONS) {
    const hi = a.metric.value >= b.metric.value ? a : b;
    const lo = hi === a ? b : a;
    lift = lo.metric.value > 0 ? hi.metric.value / lo.metric.value - 1 : hi.metric.value > 0 ? 1 : 0;
    if (lift >= AB_MIN_LIFT) { verdict = 'leader'; leader = hi.variant; } else verdict = 'too_close';
  }
  return { slug, prospect_id: entry.prospect_id, sides, verdict, leader, lift, minSessions: AB_MIN_SESSIONS, minLift: AB_MIN_LIFT, smallestSample: Number.isFinite(smallestSample) ? smallestSample : 0 };
}

/** R-A02: a rate is never shown without the two counts under it. */
export const rateWithCounts = (to: number, from: number): string => (from > 0 ? `${Math.round(rate(to, from) * 1000) / 10} % (${to} / ${from})` : `— (0 / 0)`);
/** Signed percentage-point difference between two rates, for the comparison column. */
export function ppDiff(aTo: number, aFrom: number, bTo: number, bFrom: number): string {
  if (aFrom === 0 || bFrom === 0) return '—';
  const d = Math.round((rate(bTo, bFrom) - rate(aTo, aFrom)) * 1000) / 10;
  return `${d > 0 ? '+' : ''}${d} pp`;
}
/** The stage list in the one order (R-A01), ready for a chart or a table. */
export const stagesOf = (counts: StageCounts) => FUNNEL_STAGES.map((k) => ({ key: k, value: counts[k] }));
