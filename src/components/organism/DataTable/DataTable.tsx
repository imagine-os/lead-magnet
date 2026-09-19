import type { ReactNode } from 'react';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './DataTable.css';
export interface Column<T> { key: string; header: string; render?: (row: T) => ReactNode; width?: string; align?: 'left' | 'right'; hideOnCard?: boolean }
export interface DataTableProps<T extends { id: string }> { columns: Column<T>[]; rows: T[]; caption: string; onRowClick?: (row: T) => void; rowHref?: (row: T) => string; empty?: { title: string; body?: string }; dense?: boolean }
/** The one table. Real <table> with caption; rows become stacked cards under 768 px (labels from headers). */
export function DataTable<T extends { id: string }>({ columns, rows, caption, onRowClick, rowHref, empty, dense }: DataTableProps<T>) {
  if (!rows.length) return <EmptyState icon="table" title={empty?.title ?? 'Nothing here yet'} body={empty?.body} />;
  const cell = (c: Column<T>, r: T) => (c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? ''));
  return (<div data-component="DataTable" className={`dt-wrap ${dense ? 'is-dense' : ''}`}><table className="dt"><caption className="sr-only">{caption}</caption>
    <thead><tr>{columns.map((c) => <th key={c.key} scope="col" style={{ width: c.width, textAlign: c.align }}>{c.header}</th>)}</tr></thead>
    <tbody>{rows.map((r) => <tr key={r.id} className={onRowClick || rowHref ? 'is-clickable' : ''} onClick={onRowClick ? () => onRowClick(r) : undefined}>{columns.map((c, i) => <td key={c.key} data-label={c.header} className={c.hideOnCard ? 'hide-card' : ''} style={{ textAlign: c.align }}>{i === 0 && rowHref ? <a href={`#${rowHref(r)}`} className="dt-rowlink">{cell(c, r)}</a> : cell(c, r)}</td>)}</tr>)}</tbody>
  </table></div>);
}
