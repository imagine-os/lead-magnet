import './ProgressBar.css';
export interface ProgressBarProps { value: number; max?: number; label: string; showValue?: boolean; tone?: 'primary' | 'success' | 'warn' | 'accent'; size?: 'sm' | 'md' }
/** Horizontal progress with an accessible label; value text shown by default. */
export function ProgressBar({ value, max = 100, label, showValue = true, tone = 'primary', size = 'md' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (<div className={`progress progress-${size}`}><div className="progress-head xs"><span>{label}</span>{showValue && <span className="muted">{Math.round(pct)}%</span>}</div>
    <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max}><div className={`progress-fill progress-${tone}`} style={{ width: `${pct}%` }} /></div></div>);
}
