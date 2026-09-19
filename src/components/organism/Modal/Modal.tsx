import { useEffect, useId, useRef, type ReactNode } from 'react';
import { componentAttr } from '../../../design/meta';
import { IconButton } from '../../atom/IconButton/IconButton';
import './Modal.css';
export interface ModalProps { open: boolean; onClose: () => void; title: string; children?: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg'; /** Accessible label of the close button (default EN) */ closeLabel?: string; /** Extra classes on the dialog element */ className?: string }
/** Native <dialog> modal: Esc closes, focus moves inside, backdrop click closes. Full-screen sheet under 600 px. */
export function Modal({ open, onClose, title, children, footer, size = 'md', closeLabel = 'Close', className = '' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  useEffect(() => { const d = ref.current; if (!d) return; const onCancel = (e: Event) => { e.preventDefault(); onClose(); }; d.addEventListener('cancel', onCancel); return () => d.removeEventListener('cancel', onCancel); }, [onClose]);
  return (<dialog ref={ref} {...componentAttr('Modal')} role="dialog" aria-modal="true" className={`modal modal-${size} ${className}`} aria-labelledby={titleId} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal-box"><header className="modal-head"><h2 id={titleId}>{title}</h2><IconButton icon="close" label={closeLabel} onClick={onClose} /></header><div className="modal-body">{children}</div>{footer && <footer className="modal-foot">{footer}</footer>}</div>
  </dialog>);
}
