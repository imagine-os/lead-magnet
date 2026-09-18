/** Table definitions shaped like the future Postgres schema (Supabase). Every table gets id, created_at, updated_at. supabase/schema.sql and docs/data-model.md are generated (npm run sql). */
export type ColumnType = 'uuid' | 'text' | 'int' | 'numeric' | 'money' | 'bool' | 'timestamptz' | 'date' | 'json' | 'enum';
export interface ColumnDef { name: string; type: ColumnType; nullable?: boolean; references?: string; enum?: readonly string[]; description?: string; wide?: boolean }
export type TableGroup = 'prospects' | 'pages' | 'tracking' | 'outreach' | 'plan' | 'system';
export const TABLE_GROUPS: { id: TableGroup; label: string }[] = [
  { id: 'prospects', label: 'Prospects & stack' }, { id: 'pages', label: 'Pages, assets & bookings' }, { id: 'tracking', label: 'Tracking' }, { id: 'outreach', label: 'Outreach' }, { id: 'plan', label: 'Plan (PM)' }, { id: 'system', label: 'System & feedback' },
];
export interface TableDef { name: string; label: string; description: string; group: TableGroup; columns: ColumnDef[]; titleColumn?: string; access?: string[]; source?: string }
export const BASE_COLUMNS: ColumnDef[] = [{ name: 'id', type: 'uuid', description: 'Primary key' }, { name: 'created_at', type: 'timestamptz' }, { name: 'updated_at', type: 'timestamptz' }];
export const baseColumns = (_t: TableDef): ColumnDef[] => BASE_COLUMNS;
export const allColumns = (t: TableDef): ColumnDef[] => [...BASE_COLUMNS, ...t.columns];
export interface BaseRow { id: string; created_at: string; updated_at: string; [key: string]: unknown }
export const defineTables = (tables: TableDef[]): TableDef[] => tables;
