import type { Bi } from '../i18n/types';
import type { ProspectRow, Archetype as A, Warmth, RevenueBand } from '../data/schema/core';
export type { Bi };
export type Prospect = ProspectRow;
export type Archetype = A;
export type { Warmth, RevenueBand };

export type IndustryKey = 'pet_care' | 'dental' | 'restaurant' | 'gym_wellness' | 'real_estate' | 'law_firm' | 'salon_spa' | 'home_services' | 'auto_shop' | 'med_spa' | 'other';
export interface StackItem { tool: string; category: string; monthly_cost: number; replaced_by: string; /** 0..1 how common in this industry */ prevalence: number; /** cost scales with seats */ per_seat?: boolean; /** cost scales with locations */ per_location?: boolean }
export interface Industry {
  key: IndustryKey; label: Bi; departments: Bi[]; business_roles: string[]; life_roles: string[]; stack: StackItem[]; pains: Bi[]; kpis: { label: Bi; sample: string }[]; motifs: string[]; verbs: Bi;
}
export interface StackGuess { tool: string; category: string; monthly_cost: number; confidence: number; status: 'guessed' | 'confirmed' | 'rejected'; replaced_by: string }
export interface Savings { monthly_current: number; annual_current: number; tools_cut: number; our_price_monthly: number; price_band: 'starter' | 'team' | 'multi'; net_monthly: number; net_annual: number; items: StackGuess[] }

export type WidgetKind = 'kpi' | 'list' | 'calendar' | 'chat' | 'table' | 'chart' | 'doc';
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
