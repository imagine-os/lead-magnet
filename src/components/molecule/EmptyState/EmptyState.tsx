import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './EmptyState.css';
export interface EmptyStateProps { icon?: IconName; title: string; body?: string; action?: ReactNode }
export function EmptyState({ icon = 'sparkles', title, body, action }: EmptyStateProps) {
  return <div className="empty"><div className="empty-icon"><Icon name={icon} size={28} /></div><h3>{title}</h3>{body && <p className="muted small">{body}</p>}{action && <div className="empty-action">{action}</div>}</div>;
}
