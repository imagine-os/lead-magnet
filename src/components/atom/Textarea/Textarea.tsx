import { forwardRef, type TextareaHTMLAttributes } from 'react';
import '../Input/Input.css';
import './Textarea.css';
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { invalid?: boolean }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, className = '', rows = 4, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={`textarea ${invalid ? 'is-invalid' : ''} ${className}`} aria-invalid={invalid || undefined} {...rest} />;
});
