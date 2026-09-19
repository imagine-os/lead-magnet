import './SegmentedControl.css';
export interface SegmentedOption<T extends string> { value: T; label: string; disabled?: boolean }
export interface SegmentedControlProps<T extends string> { options: SegmentedOption<T>[]; value: T; onChange: (v: T) => void; label: string; size?: 'sm' | 'md' }
/** Radio-group-like control (role=radiogroup, arrow keys move). */
export function SegmentedControl<T extends string>({ options, value, onChange, label, size = 'md' }: SegmentedControlProps<T>) {
  const onKey = (e: React.KeyboardEvent, i: number) => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); const d = e.key === 'ArrowRight' ? 1 : -1; const next = options[(i + d + options.length) % options.length]; onChange(next.value); };
  return (<div data-component="SegmentedControl" className={`seg seg-${size}`} role="radiogroup" aria-label={label}>
    {options.map((o, i) => <button key={o.value} type="button" role="radio" aria-checked={o.value === value} tabIndex={o.value === value ? 0 : -1} disabled={o.disabled} className={`seg-item ${o.value === value ? 'is-active' : ''}`} onClick={() => onChange(o.value)} onKeyDown={(e) => onKey(e, i)}>{o.label}</button>)}
  </div>);
}
