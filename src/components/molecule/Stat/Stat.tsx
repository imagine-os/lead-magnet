import type { ReactNode } from 'react';
import './Stat.css';
export interface StatProps { label: string; value: ReactNode; hint?: string; tone?: 'default' | 'success' | 'warn' | 'danger' | 'accent'; size?: 'md' | 'lg' }
/** KPI tile: label, big value, optional hint. */
export function Stat({ label, value, hint, tone = 'default', size = 'md' }: StatProps) {
  return <div className={`stat stat-${tone} stat-${size}`}><div className="stat-label eyebrow">{label}</div><div className="stat-value font-display">{value}</div>{hint && <div className="stat-hint xs muted">{hint}</div>}</div>;
}
