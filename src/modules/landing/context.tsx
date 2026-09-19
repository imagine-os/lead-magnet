/**
 * One context for a live landing page: the resolved prospect + page + PageModel snapshot, the live stack guesses,
 * the tracking context and the two CTAs every section shares (R-C02: one primary, one secondary, everywhere).
 *
 * Tracking goes through `track` / `trackOnce` here rather than the bare `src/tracking` helpers, because every event a
 * landing page emits must carry `{ variant, page_id, archetype, slug }` in its meta - that is what lets A-01 compare
 * variant A against variant B without joining back to the `pages` table.
 */
import { createContext, useContext, type ReactNode } from 'react';
import type { EventType, PageRow, ProspectRow, StackGuessRow } from '../../data/schema/core';
import type { PageModel, Savings } from '../../engine/types';
import type { TrackCtx } from '../../tracking';

export interface LandingCtx {
  pageCode: string;
  page: PageRow;
  prospect: ProspectRow;
  model: PageModel;
  /** Live rows (the prospect corrects them in the audit); the model snapshot is the fallback. */
  guesses: StackGuessRow[];
  /** Savings recomputed from the live guesses; the sticky CTA and the hero both show the same number. */
  savings: Savings;
  trackCtx: TrackCtx;
  /** Every live `pages` row for this slug (A/B); length > 1 means a test is running. */
  variants: PageRow[];
  /** Base meta stamped onto every event: variant, page_id, archetype, slug. */
  eventMeta: Record<string, unknown>;
  /** track() with the base meta already merged. */
  track: (type: EventType, meta?: Record<string, unknown>) => void;
  /** trackOnce() with the base meta already merged. */
  trackOnce: (key: string, type: EventType, meta?: Record<string, unknown>) => void;
  /** Primary CTA: open the demo. `from` is the section id, for cta_click meta. */
  openDemo: (from: string) => void;
  /** Open the demo already switched to one role view (`/demo/:id/role/:slug`); `all` disambiguates a colliding life role. */
  openRole: (from: string, view: { role: string; kind: string }, all?: readonly { role: string; kind: string }[]) => void;
  /** Secondary CTA: book a 15-min walkthrough; `slot` deep-links the booking module's slot grid. */
  bookCall: (from: string, slot?: string) => void;
  /** "Save your workspace" modal - only at the moment of value, never before the demo (R-C01). */
  saveWorkspace: (from: string) => void;
}

const Ctx = createContext<LandingCtx | null>(null);
export function LandingProvider({ value, children }: { value: LandingCtx; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useLanding(): LandingCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLanding outside LandingProvider');
  return v;
}
