import { defineTables, type BaseRow, type ColumnDef } from './types.ts';

const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });
const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });
const num = (name: string, description?: string): ColumnDef => ({ name, type: 'numeric', description });
const en = (name: string, values: readonly string[], nullable = false): ColumnDef => ({ name, type: 'enum', enum: values, nullable });
const ts = (name: string, nullable = false): ColumnDef => ({ name, type: 'timestamptz', nullable });

/** Who produced an intake answer: the strategist typed it, the rule enricher derived it, or (T43) an LLM proposed it. */
export const INTAKE_SOURCES = ['manual', 'rule', 'llm'] as const;
export type IntakeSource = (typeof INTAKE_SOURCES)[number];

/** One question-and-answer in the S-02 conversational intake, kept so the transcript survives a reload and A-01 can read how a profile was built. */
export interface IntakeTurnRow extends BaseRow {
  prospect_id: string; field: string; question: string; answer: string; source: IntakeSource; confidence_after: number; ts: string;
}

export const tables = defineTables([
  { name: 'intake_turns', label: 'Intake transcript', description: 'The conversational intake on S-02, one row per answered question: the field, the question as it was asked, the answer as it was saved, who produced it (strategist, rule enricher or LLM) and the confidence right after. Append-only; the profile itself lives on prospects.', group: 'prospects', titleColumn: 'question', source: 'S-02 conversational intake', access: ['strategist read/write', 'analyst read'],
    columns: [ref('prospect_id', 'prospects'), text('field', false, 'FIELD_WEIGHTS key the answer filled'), text('question', false, 'The question as it was asked, in the strategist’s language'), text('answer', false, 'The answer as saved (arrays are comma-joined)'), en('source', INTAKE_SOURCES), num('confidence_after', 'prospects.confidence right after this turn (0..1)'), ts('ts')] },
]);
