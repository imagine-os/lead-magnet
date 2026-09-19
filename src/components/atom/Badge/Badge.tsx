import type { ReactNode } from 'react';
import './Badge.css';
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'accent' | 'ink';
export interface BadgeProps { tone?: BadgeTone; size?: 'sm' | 'md'; children?: ReactNode; className?: string; /** Lifecycle status key: colours from --status-<key>-fg/bg tokens */ status?: string }
/** Small pill for statuses, counts and codes. `status` maps lifecycle keys (built, stub, live, done...) to their hue tokens. */
export function Badge({ tone = 'neutral', size = 'md', children, className = '', status }: BadgeProps) {
  const style = status ? { color: `var(--status-${status}-fg, var(--color-text))`, background: `var(--status-${status}-bg, var(--color-surface-3))` } : undefined;
  return <span data-component="Badge" className={`badge badge-${tone} badge-${size} ${className}`} style={style}>{children}</span>;
}
