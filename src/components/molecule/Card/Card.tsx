import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';
export interface CardProps extends HTMLAttributes<HTMLDivElement> { padding?: 'none' | 'sm' | 'md' | 'lg'; tone?: 'surface' | 'tint' | 'ink'; interactive?: boolean; children?: ReactNode }
/** Surface container. `interactive` adds hover lift and expects the caller to make the content focusable (Link/button). */
export function Card({ padding = 'md', tone = 'surface', interactive, className = '', children, ...rest }: CardProps) {
  return <div data-component="Card" className={`card card-p-${padding} card-${tone} ${interactive ? 'is-interactive' : ''} ${className}`} {...rest}>{children}</div>;
}
