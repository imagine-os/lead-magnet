import type { CSSProperties } from 'react';
import { componentAttr } from '../../../design/meta';
import './Meter.css';

export interface MeterProps {
  /** Current reading. Clamped into 0..max, so a bad snapshot can never draw past the track. */
  value: number;
  /** Capacity. Anything under 1 is treated as 1, so the fill is always defined. */
  max: number;
  /** Already-localised label (the caller resolves EN / ES). */
  label: string;
  /** Already-localised unit, read after the capacity: "50 / 58 rooms". */
  unit?: string;
  /** Already-localised line under the bar. */
  hint?: string;
  size?: 'sm' | 'md';
  /** `prospect` reads the page's --lp-* properties with token fallbacks (the themed demo and the landing mockups). */
  tone?: 'default' | 'prospect';
  /** Fraction at which the bar reads as near capacity (default 0.9). */
  warnAt?: number;
  /** Already-localised text shown at or past `warnAt`; the number and the percentage are always there, so colour is never the only signal. */
  warnLabel?: string;
  className?: string;
  /** Host sizing only: --meter-value-size / --meter-text-size / --meter-track-h (a mini-OS mockup shrinks the whole gauge). */
  style?: CSSProperties;
}

/**
 * Capacity gauge: rooms occupied tonight, caseload vs capacity, mats booked. A KPI tile answers "how many"; a meter
 * answers "how many out of how many", which is the number hotels, clinics, studios and firms actually run on
 * (reference-systems.md §3.3). The value, the capacity and the percentage are all text, the bar only reinforces them.
 */
export function Meter({ value, max, label, unit, hint, size = 'md', tone = 'default', warnAt = 0.9, warnLabel, className = '', style }: MeterProps) {
  const cap = Math.max(1, Math.round(max) || 1);
  const v = Math.max(0, Math.min(cap, Number.isFinite(value) ? value : 0));
  const ratio = v / cap;
  const pct = Math.round(ratio * 100);
  const warn = ratio >= warnAt;
  const reading = `${v} / ${cap}${unit ? ` ${unit}` : ''}`;
  return (
    <div {...componentAttr('Meter')} className={`meter meter-${size} meter-${tone} ${warn ? 'is-warn' : ''} ${className}`} style={style}>
      <div className="meter-head">
        <span className="meter-label eyebrow">{label}</span>
        {warn && warnLabel && <span className="meter-warn">{warnLabel}</span>}
      </div>
      <div className="meter-valuerow">
        <span className="meter-value font-display">{v}</span>
        <span className="meter-max">/ {cap}{unit ? ` ${unit}` : ''}</span>
        <span className="meter-pct">{pct}%</span>
      </div>
      <div className="meter-track" role="meter" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={cap} aria-valuetext={`${reading} · ${pct}%`}>
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
      {hint && <div className="meter-hint">{hint}</div>}
    </div>
  );
}
