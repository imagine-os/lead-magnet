import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './Sidebar.css';
export interface SidebarItem { to: string; label: string; icon: IconName; code: string; end?: boolean }
export interface SidebarGroup { key: string; label: string; icon: string; items: SidebarItem[] }
export interface SidebarProps { groups: SidebarGroup[]; header?: ReactNode; footer?: ReactNode; showCodes?: boolean; onNavigate?: () => void }
/** Grouped navigation; groups are <details> so keyboard collapse works with no JS. */
export function Sidebar({ groups, header, footer, showCodes, onNavigate }: SidebarProps) {
  return (<nav data-component="Sidebar" className="sidebar" aria-label="Main">
    {header && <div className="sidebar-head">{header}</div>}
    <div className="sidebar-groups">{groups.map((g) => <details key={g.key} className="sidebar-group" open><summary className="sidebar-group-title"><Icon name={(g.icon as IconName) ?? 'folder'} size={16} /><span>{g.label}</span><Icon name="chevron-down" size={14} className="sidebar-chev" /></summary>
      <ul>{g.items.map((it) => <li key={it.to}><NavLink to={it.to} end={it.end} className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`} onClick={onNavigate}><Icon name={it.icon} size={18} /><span className="sidebar-label">{it.label}</span>{showCodes && <code className="sidebar-code">{it.code}</code>}</NavLink></li>)}</ul></details>)}</div>
    {footer && <div className="sidebar-foot">{footer}</div>}
  </nav>);
}
