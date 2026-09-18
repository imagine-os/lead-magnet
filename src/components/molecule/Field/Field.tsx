import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import './Field.css';
export interface FieldProps { label: string; hint?: string; error?: string; required?: boolean; children?: ReactNode; inline?: boolean }
/** Label + control + hint / error. Injects id / aria-describedby into the single child control. */
export function Field({ label, hint, error, required, children, inline }: FieldProps) {
  const id = useId(); const hintId = `${id}-hint`; const errId = `${id}-err`;
  const child = isValidElement(children) ? cloneElement(children as ReactElement<Record<string, unknown>>, { id, 'aria-describedby': [hint ? hintId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined, invalid: error ? true : (children as ReactElement<Record<string, unknown>>).props.invalid, required }) : children;
  return (<div className={`field ${inline ? 'is-inline' : ''} ${error ? 'has-error' : ''}`}>
    <label htmlFor={id} className="field-label">{label}{required && <span className="field-req" aria-hidden> *</span>}</label>
    {child}
    {hint && !error && <div id={hintId} className="field-hint xs muted">{hint}</div>}
    {error && <div id={errId} className="field-error xs" role="alert">{error}</div>}
  </div>);
}
