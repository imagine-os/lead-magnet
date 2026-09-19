import type { ReactNode } from 'react';
import { componentAttr } from '../../../design/meta';
import './Badge.css';
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'accent' | 'ink' | 'violet' | 'outline';
export interface BadgeProps { tone?: BadgeTone; size?: 'sm' | 'md'; children?: ReactNode; className?: string; /** Lifecycle status key: colours from --status-<key>-fg/bg tokens */ status?: string }
/** Small pill for statuses, counts and codes. `status` maps lifecycle keys (built, stub, live, done...) to their hue tokens.
 * `violet` is the fifth model hue (MODEL_TONE gets it when MODELS gains a fifth name); `outline` is the bordered, transparent tier. */
export function Badge({ tone = 'neutral', size = 'md', children, className = '', status }: BadgeProps) {
  const style = status ? { color: `var(--status-${status}-fg, var(--color-text))`, background: `var(--status-${status}-bg, var(--color-surface-3))` } : undefined;
  return <span {...componentAttr('Badge')} className={`badge badge-${tone} badge-${size} ${className}`} style={style}>{children}</span>;
}
