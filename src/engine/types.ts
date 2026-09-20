import type { Bi } from '../i18n/types';
import type { ProspectRow, Archetype as A, Warmth, RevenueBand } from '../data/schema/core';
export type { Bi };
export type Prospect = ProspectRow;
export type Archetype = A;
export type { Warmth, RevenueBand };

/** Keys of the catalog in src/engine/catalog/industries.ts (`keyof typeof DEFS`): adding an industry there is the whole change. */
export type { IndustryKey } from './catalog/industries';
import type { IndustryKey } from './catalog/industries';
export interface StackItem {
  tool: string; category: string; monthly_cost: number; replaced_by: string; /** 0..1 how common in this industry */ prevalence: number; /** cost scales with seats */ per_seat?: boolean; /** cost scales with locations */ per_location?: boolean;
  /** ISO date this list price was last checked for plausibility (D-063). */ price_reviewed?: string;
  /** Why the price is what it is, when it is not a plain monthly subscription fee (D-063). */ price_source_note?: string;
}
export interface Kpi { label: Bi; sample: string }
/** A capacity-shaped number the role home shows as a gauge (rooms tonight, mats booked, caseload): the per-industry hint that makes `deriveRoleViews()` emit a `meter` widget instead of a regex on English KPI labels (reference-systems.md §3.3). */
export interface MeterHint { label: Bi; value: number; max: number; unit?: Bi }
/**
 * A narrower business type within an industry (D-063, reference-systems.md §5). `key` is what `Prospect.sub_industry` stores - additive only, never rename a key once it ships.
 * `extra_tools` are catalog tool names guessed in addition to the industry's stack at `extra_prevalence[tool]` (default `SUB_EXTRA_PREVALENCE`); `roles`, `departments`, `kpis`, `pains`, `motifs` and `meter`, when given, replace the industry's own in `industryFor(p)` so a dog hotel's demo shows rooms and vaccines, not a generic daycare.
 */
export interface SubIndustry { key: string; name: Bi; extra_tools?: string[]; extra_prevalence?: Record<string, number>; roles?: string[]; departments?: Bi[]; kpis?: Kpi[]; pains?: Bi[]; motifs?: string[]; meter?: MeterHint }
export interface Industry {
  key: IndustryKey; label: Bi; departments: Bi[]; business_roles: string[]; life_roles: string[]; stack: StackItem[]; pains: Bi[]; kpis: Kpi[]; motifs: string[]; verbs: Bi;
  /** Narrower business types within this industry (e.g. quick service vs full service). Optional: most industries do not need it. */ sub?: SubIndustry[];
  /** Capacity gauge for the owner / manager home when the industry has one obvious resource (rooms, chairs, seats). A sub-industry's `meter` wins. */ meter?: MeterHint;
}
/** How sure we are before the prospect says anything: likely = we would bet on it, possible = plausible for the industry (D-056 proposed). Derived from confidence, never stored. */
export type StackTier = 'likely' | 'possible';
export interface StackGuess { tool: string; category: string; monthly_cost: number; confidence: number; status: 'guessed' | 'confirmed' | 'rejected'; replaced_by: string }
export interface Savings { monthly_current: number; annual_current: number; tools_cut: number; our_price_monthly: number; price_band: 'starter' | 'team' | 'multi'; net_monthly: number; net_annual: number; items: StackGuess[] }

export type WidgetKind = 'kpi' | 'list' | 'calendar' | 'chat' | 'table' | 'chart' | 'doc' | 'meter';
/** `sample` of a `meter` widget: value against a maximum, both numbers, with an optional unit and a one-line hint (Petrock's occupancy meters, Hoy's occupancy 7 days). Renderers clamp `value / max` to 0..1. */
export interface MeterSample { value: number; max: number; unit?: Bi; hint?: Bi }
export interface Widget { id: string; title: Bi; kind: WidgetKind; sample: unknown }
export interface RoleView { role: string; kind: 'business' | 'life'; headline: Bi; widgets: Widget[] }

export interface CtaDef { label: Bi; to: string }
export interface PageModel { archetype: Archetype; prospectId: string; slug: string; palette: Prospect['style']['palette']; tone: Prospect['style']['tone']; font: Prospect['style']['font']; sections: Section[]; cta: { primary: CtaDef; secondary: CtaDef }; tracking: { pageId: string }; expiresAt: string | null }

export type Section =
  | { kind: 'hero_reveal'; id: string; eyebrow: Bi; headline: Bi; sub: Bi; devices: ('phone' | 'laptop' | 'tv')[]; businessName: string; city: string }
  | { kind: 'savings_stack'; id: string; headline: Bi; sub: Bi; savings: Savings; editable: boolean }
  | { kind: 'role_views'; id: string; headline: Bi; sub: Bi; views: RoleView[] }
  | { kind: 'walkthrough_steps'; id: string; headline: Bi; steps: { time: string; role: string; title: Bi; body: Bi }[] }
  | { kind: 'stack_audit'; id: string; headline: Bi; sub: Bi; guesses: StackGuess[]; confirmLabel: Bi; rejectLabel: Bi }
  | { kind: 'proof'; id: string; headline: Bi; items: { title: Bi; body: Bi }[] }
  | { kind: 'letter'; id: string; greeting: Bi; paragraphs: Bi[]; signoff: Bi; from: string }
  | { kind: 'faq'; id: string; headline: Bi; items: { q: Bi; a: Bi }[] }
  | { kind: 'cta_band'; id: string; headline: Bi; sub: Bi; urgency: Bi }
  | { kind: 'booking_inline'; id: string; headline: Bi; sub: Bi; durationMin: number };

export interface ArchetypeScore { archetype: Archetype; score: number; reasons: string[] }
export interface Signals { /** seconds spent on the savings section */ dwellSavings?: number; exitWithoutCta?: boolean; scrollDepth?: number; guessedTools?: number }
