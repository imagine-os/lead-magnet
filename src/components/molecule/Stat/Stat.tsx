import type { ReactNode } from 'react';
import { componentAttr } from '../../../design/meta';
import './Stat.css';
export type StatTone = 'default' | 'success' | 'warn' | 'danger' | 'accent' | 'prospect';
export interface StatDelta {
  /** Change vs the previous period, in the value's own unit (or points). Sign is shown with the number. */
  value: number;
  /** e.g. "vs last 30 days" (module string) */
  label?: string;
  /** Default: from the sign of `value` */
  direction?: 'up' | 'down' | 'flat';
  /** Which direction is the good one (colours it success); default `up`. Costs and bounces set `down`. */
  good?: 'up' | 'down';
  /** Default: `+12` / `-3` / `0` */
  format?: (v: number) => string;
}
export interface StatProps {
  label: string; value: ReactNode;
  /** Any node (was string): link, Badge, formatted text */
  hint?: ReactNode;
  tone?: StatTone; size?: 'sm' | 'md' | 'lg'; align?: 'start' | 'center' | 'end';
  delta?: StatDelta;
  /** Inline sparkline (last N values, left to right). aria-hidden with a text alternative. */
  spark?: number[];
  /** Text alternative for the sparkline; default "first -> last" */
  sparkLabel?: string;
  /** Marks the value as an estimate / proposal: dashed tile + this badge text (module string, e.g. "estimate" / "propuesto") */
  estimate?: string;
}
const dirOf = (d: StatDelta): 'up' | 'down' | 'flat' => d.direction ?? (d.value > 0 ? 'up' : d.value < 0 ? 'down' : 'flat');
const ARROW = { up: '↑', down: '↓', flat: '→' } as const;
/** Sparkline path: values normalised into a 80 x 24 box, 2 px inset so the stroke is never clipped. */
export function sparkPath(values: number[], w = 80, h = 24): string {
  if (values.length < 2) return '';
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(2 + (i / (values.length - 1)) * (w - 4)).toFixed(1)} ${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`).join(' ');
}
/** KPI tile: label, big value, optional delta (colour + arrow + signed number, never colour alone), sparkline, hint. */
export function Stat({ label, value, hint, tone = 'default', size = 'md', align = 'start', delta, spark, sparkLabel, estimate }: StatProps) {
  const dir = delta ? dirOf(delta) : undefined;
  const good = delta ? (dir === 'flat' ? 'flat' : dir === (delta.good ?? 'up') ? 'good' : 'bad') : undefined;
  const fmt = delta?.format ?? ((v: number) => (v > 0 ? `+${v}` : String(v)));
  return (<div {...componentAttr('Stat')} className={`stat stat-${tone} stat-${size} stat-align-${align} ${estimate ? 'is-estimate' : ''}`}>
    <div className="stat-label eyebrow">{label}{estimate && <span className="stat-estimate">{estimate}</span>}</div>
    <div className="stat-valuerow">
      <div className="stat-value font-display">{value}</div>
      {spark && spark.length > 1 && <span className="stat-spark"><svg width="80" height="24" viewBox="0 0 80 24" aria-hidden="true" focusable="false"><path d={sparkPath(spark)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><span className="sr-only">{sparkLabel ?? `${spark[0]} → ${spark[spark.length - 1]}`}</span></span>}
    </div>
    {delta && dir && <div className={`stat-delta xs is-${good}`}><span className="stat-delta-arrow" aria-hidden="true">{ARROW[dir]}</span><span className="stat-delta-value">{fmt(delta.value)}</span>{delta.label && <span className="stat-delta-label muted">{delta.label}</span>}</div>}
    {hint && <div className="stat-hint xs muted">{hint}</div>}
  </div>);
}
