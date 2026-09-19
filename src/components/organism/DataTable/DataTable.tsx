import { useState, type ReactNode } from 'react';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import { componentAttr } from '../../../design/meta';
import './DataTable.css';
export type SortDir = 'asc' | 'desc';
export interface SortState { key: string; dir: SortDir }
export type SortValue = string | number | boolean | null | undefined;
export interface Column<T> {
  key: string; header: string; render?: (row: T) => ReactNode; width?: string; align?: 'left' | 'right'; hideOnCard?: boolean;
  /** Header becomes a 44 px sort button; the th carries aria-sort while active. */
  sortable?: boolean;
  /** Value to sort by (default: row[key]). Numbers sort numerically, strings by localeCompare, null / undefined last. */
  accessor?: (row: T) => SortValue;
  /** Header text is kept for screen readers and card labels but hidden visually (action columns). */
  srOnlyHeader?: boolean;
}
export interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]; rows: T[]; caption: string; onRowClick?: (row: T) => void; rowHref?: (row: T) => string; empty?: { title: string; body?: string }; dense?: boolean;
  /** Controlled sort. When set, the parent orders `rows` unless `clientSort` is true. */
  sort?: SortState;
  /** Called on every header activation (same key toggles asc / desc, a new key starts asc). */
  onSort?: (sort: SortState) => void;
  /** Uncontrolled initial sort; the table sorts client-side. */
  defaultSort?: SortState;
  /** Force client-side sorting even when `sort` is controlled. */
  clientSort?: boolean;
}
const rank = (v: SortValue): 0 | 1 => (v === null || v === undefined || v === '' ? 1 : 0);
export function compareValues(a: SortValue, b: SortValue): number {
  const ra = rank(a), rb = rank(b); if (ra !== rb) return ra - rb; if (ra === 1) return 0;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}
/** Sorts a copy of `rows` by a column (exported so a page can reuse the same comparator for derived lists). */
export function sortRows<T>(rows: T[], columns: Column<T>[], sort: SortState | undefined): T[] {
  if (!sort) return rows;
  const col = columns.find((c) => c.key === sort.key); if (!col) return rows;
  const get = col.accessor ?? ((r: T) => (r as Record<string, unknown>)[col.key] as SortValue);
  const sign = sort.dir === 'desc' ? -1 : 1;
  return rows.map((r, i) => ({ r, i })).sort((x, y) => compareValues(get(x.r), get(y.r)) * sign || x.i - y.i).map((x) => x.r);
}
/** The one table. Real <table> with caption; rows become stacked cards under 768 px (labels from headers). */
export function DataTable<T extends { id: string }>({ columns, rows, caption, onRowClick, rowHref, empty, dense, sort, onSort, defaultSort, clientSort }: DataTableProps<T>) {
  const [own, setOwn] = useState<SortState | undefined>(defaultSort);
  const controlled = sort !== undefined;
  const active = controlled ? sort : own;
  const ordered = !controlled || clientSort ? sortRows(rows, columns, active) : rows;
  const toggle = (key: string) => { const next: SortState = active?.key === key ? { key, dir: active.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }; if (!controlled) setOwn(next); onSort?.(next); };
  if (!rows.length) return <EmptyState icon="table" title={empty?.title ?? 'Nothing here yet'} body={empty?.body} />;
  const cell = (c: Column<T>, r: T) => (c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? ''));
  const head = (c: Column<T>) => {
    const text = c.srOnlyHeader ? <span className="sr-only">{c.header}</span> : c.header;
    if (!c.sortable) return text;
    const dir = active?.key === c.key ? active.dir : undefined;
    return (<button type="button" className={`dt-sort ${dir ? 'is-active' : ''}`} data-dir={dir ?? 'none'} onClick={() => toggle(c.key)}>{text}<svg className="dt-sort-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir === 'desc' ? 'M6 9l6 6 6-6' : dir === 'asc' ? 'M6 15l6-6 6 6' : 'M8 9l4-4 4 4M8 15l4 4 4-4'} /></svg></button>);
  };
  return (<div {...componentAttr('DataTable')} className={`dt-wrap ${dense ? 'is-dense' : ''}`}><table className="dt"><caption className="sr-only">{caption}</caption>
    <thead><tr>{columns.map((c) => <th key={c.key} scope="col" className={`${c.sortable ? 'is-sortable' : ''} ${c.srOnlyHeader ? 'is-sr' : ''}`} aria-sort={c.sortable && active?.key === c.key ? (active.dir === 'asc' ? 'ascending' : 'descending') : undefined} style={{ width: c.width, textAlign: c.align }}>{head(c)}</th>)}</tr></thead>
    <tbody>{ordered.map((r) => <tr key={r.id} className={onRowClick || rowHref ? 'is-clickable' : ''} onClick={onRowClick ? () => onRowClick(r) : undefined}>{columns.map((c, i) => <td key={c.key} data-label={c.header} className={`${c.hideOnCard ? 'hide-card' : ''} ${c.srOnlyHeader ? 'no-label' : ''}`} style={{ textAlign: c.align }}>{i === 0 && rowHref ? <a href={`#${rowHref(r)}`} className="dt-rowlink">{cell(c, r)}</a> : cell(c, r)}</td>)}</tr>)}</tbody>
  </table></div>);
}
