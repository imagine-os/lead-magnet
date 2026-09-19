import { defineTables, type BaseRow, type ColumnDef } from './types.ts';
import { ARCHETYPES } from './core.ts';

const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });
const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });
const num = (name: string, description?: string): ColumnDef => ({ name, type: 'numeric', description });
const en = (name: string, values: readonly string[], nullable = false): ColumnDef => ({ name, type: 'enum', enum: values, nullable });
const ts = (name: string, nullable = false): ColumnDef => ({ name, type: 'timestamptz', nullable });

/** The four engine kinds (adaptFromEvents) plus `promote_variant`, which A-01's A/B readout records for a winning side. */
export const RECOMMENDATION_KINDS = ['switch_archetype', 'add_section', 'shorten', 'ask', 'promote_variant'] as const;
export const RECOMMENDATION_STATUS = ['proposed', 'applied', 'dismissed'] as const;
export type RecommendationKind = (typeof RECOMMENDATION_KINDS)[number];
export type RecommendationStatus = (typeof RECOMMENDATION_STATUS)[number];

/** One engine recommendation (adaptFromEvents) as a row, so R-A03 can require it recorded before anything is applied. */
export interface RecommendationRow extends BaseRow {
  prospect_id: string; page_id: string; kind: RecommendationKind; to_archetype: string | null; section: string | null;
  reason: string; score: number; status: RecommendationStatus; decided_by: string; decided_at: string | null; note: string;
}

export const tables = defineTables([
  { name: 'recommendations', label: 'Page recommendations', description: 'What adaptFromEvents() suggested for a page, recorded before it is applied (R-A03): kind, target archetype or section, the reason, the score and who decided. A-02 writes the engine kinds and A-01 writes promote_variant when an A/B side is ahead past the minimum sample; nothing is applied from a row alone.', group: 'pages', titleColumn: 'reason', source: 'A-02, engine adaptFromEvents()', access: ['strategist read/write', 'analyst read'],
    columns: [ref('prospect_id', 'prospects'), ref('page_id', 'pages'), en('kind', RECOMMENDATION_KINDS), en('to_archetype', ARCHETYPES, true), text('section', true, 'Section kind for add_section'), text('reason'), num('score', 'Engine score, higher first'), en('status', RECOMMENDATION_STATUS), text('decided_by', false, 'Demo user id or role that decided'), ts('decided_at', true), text('note')] },
]);
