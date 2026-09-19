/**
 * One context for a live landing page: the resolved prospect + page + PageModel snapshot, the live stack guesses,
 * the tracking context and the two CTAs every section shares (R-C02: one primary, one secondary, everywhere).
 */
import { createContext, useContext, type ReactNode } from 'react';
import type { PageRow, ProspectRow, StackGuessRow } from '../../data/schema/core';
import type { PageModel } from '../../engine/types';
import type { TrackCtx } from '../../tracking';

export interface LandingCtx {
  pageCode: string;
  page: PageRow;
  prospect: ProspectRow;
  model: PageModel;
  /** Live rows (the prospect corrects them in the audit); the model snapshot is the fallback. */
  guesses: StackGuessRow[];
  trackCtx: TrackCtx;
  /** Primary CTA: open the demo. `from` is the section id, for cta_click meta. */
  openDemo: (from: string) => void;
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
