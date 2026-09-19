/** One place that knows which control an intake field deserves, how to read its value back, and what answering it changes. */
import { FIELD_WEIGHTS, computeConfidence, industry, type Bi } from '../../engine';
import { FONTS, LANGS, REVENUE_BANDS, TONES, WARMTH, type ProspectRow } from '../../data/schema/core';
import { industryOptions } from './lib';

export type Editor = 'text' | 'number' | 'list' | 'select' | 'style';
export const LIST_FIELDS = ['known_tools', 'business_roles', 'life_roles'];
export const NUMBER_FIELDS = ['team_size', 'locations'];
export const SELECT_FIELDS = ['industry', 'warmth', 'lang', 'revenue_band'];

export const editorFor = (field: string): Editor => (field === 'style' ? 'style' : NUMBER_FIELDS.includes(field) ? 'number' : LIST_FIELDS.includes(field) ? 'list' : SELECT_FIELDS.includes(field) ? 'select' : 'text');
export const coerce = (field: string, raw: string): unknown => (NUMBER_FIELDS.includes(field) ? Math.max(0, Number(raw) || 0) : LIST_FIELDS.includes(field) ? raw.split(',').map((x) => x.trim()).filter(Boolean) : raw.trim());
/** How an answer reads in the transcript. */
export const displayValue = (value: unknown): string => (Array.isArray(value) ? value.join(', ') : typeof value === 'object' && value ? JSON.stringify(value) : String(value ?? ''));

export function fieldOptions(field: string, t: (k: string, v?: Record<string, string | number>) => string, bi: (v: Bi | string) => string): { value: string; label: string }[] {
  if (field === 'industry') return industryOptions(bi);
  if (field === 'warmth') return WARMTH.map((w) => ({ value: w, label: t(`studio.warmth_${w}`) }));
  if (field === 'lang') return LANGS.map((l) => ({ value: l, label: l === 'es' ? 'Español' : 'English' }));
  if (field === 'revenue_band') return REVENUE_BANDS.map((r) => ({ value: r, label: t(`studio.band_${r}`) }));
  if (field === 'tone') return TONES.map((x) => ({ value: x, label: t(`studio.tone_${x}`) }));
  if (field === 'font') return FONTS.map((x) => ({ value: x, label: t(`studio.font_${x}`) }));
  return [];
}

/** Ready-made answers from the industry catalog, so the common case is one tap instead of typing. */
export function suggestionsFor(field: string, p: ProspectRow): string[] {
  const ind = industry(p.industry);
  const have = new Set<string>((field === 'known_tools' ? p.known_tools : field === 'business_roles' ? p.business_roles : field === 'life_roles' ? p.life_roles : []) ?? []);
  const pool = field === 'known_tools' ? ind.stack.map((x) => x.tool) : field === 'business_roles' ? ind.business_roles : field === 'life_roles' ? ind.life_roles : [];
  return pool.filter((x) => !have.has(x)).slice(0, 8);
}

/** Confidence points an answer to this field would add right now (R-E03). */
export const confidenceGain = (p: ProspectRow, field: string): number => Math.round((computeConfidence([...(p.fields_known ?? []), field]) - p.confidence) * 100);
/** The heaviest unanswered field is asked first; this is the share of the whole profile it carries. */
export const fieldWeight = (field: string): number => FIELD_WEIGHTS[field]?.weight ?? 0;
