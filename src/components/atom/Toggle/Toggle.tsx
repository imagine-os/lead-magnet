import './Toggle.css';
export interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean; id?: string }
/** Switch with a visible label. Native button role=switch. */
export function Toggle({ checked, onChange, label, description, disabled, id }: ToggleProps) {
  return (<label className={`toggle ${disabled ? 'is-disabled' : ''}`}>
    <button type="button" id={id} role="switch" aria-checked={checked} disabled={disabled} className="toggle-track" onClick={() => onChange(!checked)}><span className="toggle-thumb" /></button>
    <span className="toggle-text"><span className="toggle-label">{label}</span>{description && <span className="toggle-desc xs muted">{description}</span>}</span>
  </label>);
}
