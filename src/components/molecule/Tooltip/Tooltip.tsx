import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from 'react';
import './Tooltip.css';
export interface TooltipProps { text: string; children?: ReactNode; side?: 'top' | 'bottom' }
/** Shows on hover AND focus (P-03). Child gets aria-describedby. */
export function Tooltip({ text, children, side = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false); const id = useId();
  const child = isValidElement(children) ? cloneElement(children as ReactElement<Record<string, unknown>>, { 'aria-describedby': id, onMouseEnter: () => setShow(true), onMouseLeave: () => setShow(false), onFocus: () => setShow(true), onBlur: () => setShow(false) }) : children;
  return <span className="tip-wrap">{child}<span role="tooltip" id={id} className={`tip tip-${side} ${show ? 'is-show' : ''}`}>{text}</span></span>;
}
