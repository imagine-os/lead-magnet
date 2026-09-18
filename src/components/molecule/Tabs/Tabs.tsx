import type { ReactNode } from 'react';
import './Tabs.css';
export interface TabDef<T extends string> { id: T; label: string; count?: number; icon?: ReactNode }
export interface TabsProps<T extends string> { tabs: TabDef<T>[]; value: T; onChange: (id: T) => void; label: string }
/** Horizontal tabs (role=tablist, arrow keys). Panels are rendered by the caller with role=tabpanel. */
export function Tabs<T extends string>({ tabs, value, onChange, label }: TabsProps<T>) {
  const onKey = (e: React.KeyboardEvent, i: number) => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); onChange(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length].id); };
  return (<div className="tabs" role="tablist" aria-label={label}>
    {tabs.map((t, i) => <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={t.id === value} aria-controls={`panel-${t.id}`} tabIndex={t.id === value ? 0 : -1} className={`tab ${t.id === value ? 'is-active' : ''}`} onClick={() => onChange(t.id)} onKeyDown={(e) => onKey(e, i)}>{t.icon}{t.label}{t.count != null && <span className="tab-count">{t.count}</span>}</button>)}
  </div>);
}
