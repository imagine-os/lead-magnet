import { useId } from 'react';
import { componentAttr } from '../../../design/meta';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { Input } from '../../atom/Input/Input';
import './DateRange.css';
/** ISO calendar dates (YYYY-MM-DD), inclusive. */
export interface DateRangeValue { from: string; to: string }
export interface DateRangePreset { days: number; /** Visible label, e.g. "7 days" / "7 días" (numeric default "7d") */ label: string }
export interface DateRangeProps {
  value: DateRangeValue; onChange: (v: DateRangeValue) => void;
  /** Group label (aria) */
  label: string;
  /** Labels for the two inputs and the custom segment (module strings) */
  labels: { from: string; to: string; custom: string };
  /** Default 7 / 30 / 90 with numeric labels */
  presets?: DateRangePreset[];
  /** Anchor for the presets (default: today, local calendar) */
  today?: string;
  size?: 'sm' | 'md';
  /** Hide the from / to inputs until "custom" is picked (default: always shown) */
  inputsOnCustomOnly?: boolean;
}
export const isoDay = (d: Date = new Date()): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const shiftDay = (iso: string, days: number): string => { const [y, m, d] = iso.split('-').map(Number); const dt = new Date(y, m - 1, d + days); return isoDay(dt); };
/** { from, to } for the last `days` days ending today (inclusive), so a 7-day preset is today and the six days before it. */
export const lastDays = (days: number, today: string = isoDay()): DateRangeValue => ({ from: shiftDay(today, -(days - 1)), to: today });
const DEFAULT_PRESETS: DateRangePreset[] = [{ days: 7, label: '7d' }, { days: 30, label: '30d' }, { days: 90, label: '90d' }];
/** Presets + custom from / to. The active segment is derived from the value, so a URL-restored range still highlights its preset. */
export function DateRange({ value, onChange, label, labels, presets = DEFAULT_PRESETS, today = isoDay(), size = 'md', inputsOnCustomOnly }: DateRangeProps) {
  const id = useId();
  const active = presets.find((p) => { const r = lastDays(p.days, today); return r.from === value.from && r.to === value.to; });
  const seg = active ? String(active.days) : 'custom';
  const invalid = !!value.from && !!value.to && value.from > value.to;
  const showInputs = !inputsOnCustomOnly || seg === 'custom';
  return (<div {...componentAttr('DateRange')} className={`daterange daterange-${size}`} role="group" aria-label={label}>
    <SegmentedControl label={label} size={size} value={seg} onChange={(v) => { if (v === 'custom') return; onChange(lastDays(Number(v), today)); }} options={[...presets.map((p) => ({ value: String(p.days), label: p.label })), { value: 'custom', label: labels.custom }]} />
    {showInputs && <div className="daterange-inputs">
      <label className="daterange-field"><span className="field-label">{labels.from}</span><Input id={`${id}-from`} type="date" value={value.from} max={value.to || undefined} invalid={invalid} onChange={(e) => onChange({ ...value, from: e.target.value })} /></label>
      <label className="daterange-field"><span className="field-label">{labels.to}</span><Input id={`${id}-to`} type="date" value={value.to} min={value.from || undefined} invalid={invalid} onChange={(e) => onChange({ ...value, to: e.target.value })} /></label>
    </div>}
  </div>);
}
