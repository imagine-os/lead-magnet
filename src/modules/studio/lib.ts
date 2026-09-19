import type { Archetype, PageRow, ProspectRow, ProspectStyle } from '../../data/schema/core';
import { INDUSTRIES, INDUSTRY_KEYS, industry, slugify, type Bi } from '../../engine';

/** Neutral starting palette for a brand-new prospect (overwritten in the S-02 style editor). */
export const DEFAULT_PALETTE: ProspectStyle['palette'] = { primary: '#3B4CF5', accent: '#9BE15D', bg: '#F7F8FC', surface: '#FFFFFF', text: '#151529' };
export const defaultStyle = (): ProspectStyle => ({ palette: { ...DEFAULT_PALETTE }, tone: 'clean', font: 'display', imagery: [] });

export const fullName = (p: Pick<ProspectRow, 'first_name' | 'last_name'>) => `${p.first_name} ${p.last_name}`.trim();
export const industryOptions = (bi: (v: Bi | string) => string) => INDUSTRY_KEYS.map((k) => ({ value: k, label: bi(INDUSTRIES[k].label) }));
export const industryLabel = (key: string, bi: (v: Bi | string) => string) => bi(industry(key).label);

/** The public route each archetype renders on (the landing module owns these paths). */
export const ARCHETYPE_PATH: Record<Archetype, (slug: string) => string> = {
  reveal: (s) => `/p/${s}`, audit: (s) => `/p/${s}/audit`, walkthrough: (s) => `/p/${s}/story`, letter: (s) => `/p/${s}/letter`,
};
export const publicPath = (archetype: Archetype, slug: string) => ARCHETYPE_PATH[archetype](slug);
export const publicUrl = (archetype: Archetype, slug: string) => `${window.location.origin}${window.location.pathname}${window.location.search}#${publicPath(archetype, slug)}`;

/** The slug a page would get: the existing row wins so a published link never moves. */
export const slugFor = (p: ProspectRow, page?: PageRow | null) => page?.slug ?? slugify(`${p.business_name}-${p.city}`);

/**
 * The page that represents a prospect: the live one, else the most recently published / created.
 * With an A/B split there can be two live rows on one slug, so variant A wins for anything that needs "the" page.
 */
export function livePageOf(pages: PageRow[], prospectId: string): PageRow | null {
  const mine = pages.filter((x) => x.prospect_id === prospectId);
  if (!mine.length) return null;
  const live = mine.filter((x) => x.status === 'live');
  if (live.length) return live.find((x) => (x.variant || 'A').toUpperCase() === 'A') ?? live[0];
  return [...mine].sort((a, b) => String(b.published_at ?? b.created_at).localeCompare(String(a.published_at ?? a.created_at)))[0];
}

/** The A/B labels a slug can carry. Two live rows on one slug is the split the landing module reads (R-S04). */
export const VARIANTS = ['A', 'B'] as const;
export type VariantLabel = (typeof VARIANTS)[number];
export const normalizeVariant = (v: string | null | undefined): VariantLabel => ((v ?? 'A').trim().toUpperCase() === 'B' ? 'B' : 'A');
/** Every page row for this prospect on this slug, keyed by variant (A first). */
export function variantRows(pages: PageRow[], prospectId: string, slug: string): { variant: VariantLabel; row: PageRow | null }[] {
  const mine = pages.filter((x) => x.prospect_id === prospectId && x.slug === slug);
  return VARIANTS.map((variant) => ({ variant, row: mine.find((x) => normalizeVariant(x.variant) === variant) ?? null }));
}
export const liveVariantCount = (pages: PageRow[], prospectId: string, slug: string) => variantRows(pages, prospectId, slug).filter((v) => v.row?.status === 'live').length;
/** A link that forces one side of the split: the query lives inside the hash so HashRouter sees it. */
export const publicPathWithVariant = (archetype: Archetype, slug: string, variant: VariantLabel) => `${publicPath(archetype, slug)}?variant=${variant}`;
export const publicUrlWithVariant = (archetype: Archetype, slug: string, variant: VariantLabel) => `${window.location.origin}${window.location.pathname}${window.location.search}#${publicPathWithVariant(archetype, slug, variant)}`;

export const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
export const pct = (n: number) => `${Math.round(n * 100)}%`;
export const daysLeft = (iso: string | null) => (iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000) : null);
export function shortTime(iso: string | null | undefined, lang: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', { hour: 'numeric', minute: '2-digit' });
}
export const parseList = (s: string): string[] => s.split(',').map((x) => x.trim()).filter(Boolean);

/** The strip at the top of S-01: what the strategist should look at next. */
export interface StudioSummary { total: number; byWarmth: Record<string, number>; livePages: number; splitPages: number; bookingsThisWeek: number; nextExpiring: { page: PageRow; days: number } | null; avgConfidence: number }
export function studioSummary(prospects: ProspectRow[], pages: PageRow[], bookings: { slot: string; status: string }[], now = new Date()): StudioSummary {
  const byWarmth: Record<string, number> = { cold: 0, warm: 0, hot: 0 };
  for (const p of prospects) byWarmth[p.warmth] = (byWarmth[p.warmth] ?? 0) + 1;
  const live = pages.filter((x) => x.status === 'live');
  const bySlug = new Map<string, number>();
  for (const x of live) bySlug.set(x.slug, (bySlug.get(x.slug) ?? 0) + 1);
  const weekAgo = now.getTime() - 7 * 86400000;
  const weekAhead = now.getTime() + 7 * 86400000;
  const bookingsThisWeek = bookings.filter((b) => { const t = new Date(b.slot).getTime(); return !Number.isNaN(t) && t >= weekAgo && t <= weekAhead && b.status !== 'cancelled'; }).length;
  const expiring = live.filter((x) => x.expires_at).sort((a, b) => String(a.expires_at).localeCompare(String(b.expires_at)))[0] ?? null;
  return {
    total: prospects.length, byWarmth,
    livePages: live.length,
    splitPages: [...bySlug.values()].filter((n) => n > 1).length,
    bookingsThisWeek,
    nextExpiring: expiring ? { page: expiring, days: daysLeft(expiring.expires_at) ?? 0 } : null,
    avgConfidence: prospects.length ? prospects.reduce((s, p) => s + p.confidence, 0) / prospects.length : 0,
  };
}
