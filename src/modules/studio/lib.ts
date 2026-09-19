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

/** The page that represents a prospect: the live one, else the most recently published / created. */
export function livePageOf(pages: PageRow[], prospectId: string): PageRow | null {
  const mine = pages.filter((x) => x.prospect_id === prospectId);
  if (!mine.length) return null;
  return mine.find((x) => x.status === 'live') ?? [...mine].sort((a, b) => String(b.published_at ?? b.created_at).localeCompare(String(a.published_at ?? a.created_at)))[0];
}

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
