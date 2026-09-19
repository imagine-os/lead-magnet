import { forwardRef, type SelectHTMLAttributes } from 'react';
import '../Input/Input.css';
import './Select.css';
export interface SelectOption { value: string; label: string; disabled?: boolean }
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> { options: SelectOption[]; invalid?: boolean; placeholder?: string }
/** Native <select> styled with tokens (keyboard, touch and screen readers for free). */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ options, invalid, placeholder, className = '', ...rest }, ref) {
  return (<select ref={ref} data-component="Select" className={`select ${invalid ? 'is-invalid' : ''} ${className}`} aria-invalid={invalid || undefined} {...rest}>
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {options.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
  </select>);
});
