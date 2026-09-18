import { forwardRef, type InputHTMLAttributes } from 'react';
import './Input.css';
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { invalid?: boolean }
/** Text input, 48 px tall. Use inside Field for label + hint + error. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, className = '', ...rest }, ref) {
  return <input ref={ref} className={`input ${invalid ? 'is-invalid' : ''} ${className}`} aria-invalid={invalid || undefined} {...rest} />;
});
