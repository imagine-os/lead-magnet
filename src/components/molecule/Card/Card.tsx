import type { HTMLAttributes, ReactNode } from 'react';
import { componentAttr } from '../../../design/meta';
import './Card.css';
export type CardTone = 'surface' | 'tint' | 'ink' | 'prospect';
export interface CardProps extends HTMLAttributes<HTMLDivElement> { padding?: 'none' | 'sm' | 'md' | 'lg'; /** `prospect` paints the card from the page's --lp-* properties with --color-* fallbacks. */ tone?: CardTone; interactive?: boolean; children?: ReactNode }
/** Surface container. `interactive` adds hover lift and expects the caller to make the content focusable (Link/button). */
export function Card({ padding = 'md', tone = 'surface', interactive, className = '', children, ...rest }: CardProps) {
  return <div {...componentAttr('Card')} className={`card card-p-${padding} card-${tone} ${interactive ? 'is-interactive' : ''} ${className}`} {...rest}>{children}</div>;
}
