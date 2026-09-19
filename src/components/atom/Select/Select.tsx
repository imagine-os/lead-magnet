import { forwardRef, type SelectHTMLAttributes } from 'react';
import { componentAttr } from '../../../design/meta';
import '../Input/Input.css';
import './Select.css';
export interface SelectOption { value: string; label: string; disabled?: boolean }
export interface SelectGroup { label: string; options: SelectOption[]; disabled?: boolean }
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> { /** Flat options (rendered before any groups) */ options?: SelectOption[]; /** <optgroup> sections */ groups?: SelectGroup[]; invalid?: boolean; placeholder?: string }
/** Native <select> styled with tokens (keyboard, touch and screen readers for free). */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ options = [], groups, invalid, placeholder, className = '', ...rest }, ref) {
  const opt = (o: SelectOption) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>;
  return (<select ref={ref} {...componentAttr('Select')} className={`select ${invalid ? 'is-invalid' : ''} ${className}`} aria-invalid={invalid || undefined} {...rest}>
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {options.map(opt)}
    {groups?.map((g) => <optgroup key={g.label} label={g.label} disabled={g.disabled}>{g.options.map(opt)}</optgroup>)}
  </select>);
});
