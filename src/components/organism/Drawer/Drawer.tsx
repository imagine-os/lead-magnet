import { useEffect, type ReactNode } from 'react';
import { IconButton } from '../../atom/IconButton/IconButton';
import './Drawer.css';
export interface DrawerProps { open: boolean; onClose: () => void; title: string; children?: ReactNode; side?: 'right' | 'left'; width?: number }
/** Side panel over the page (inspector, filters). Esc closes; scrim click closes. */
export function Drawer({ open, onClose, title, children, side = 'right', width = 420 }: DrawerProps) {
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [open, onClose]);
  if (!open) return null;
  return (<div className="drawer-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <aside className={`drawer drawer-${side}`} role="dialog" aria-modal="true" aria-label={title} style={{ width: `min(${width}px, 100vw)` }}>
      <header className="drawer-head"><h2>{title}</h2><IconButton icon="close" label="Close" onClick={onClose} /></header><div className="drawer-body">{children}</div>
    </aside></div>);
}
