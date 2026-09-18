import { useEffect, useRef, type ReactNode } from 'react';
import { IconButton } from '../../atom/IconButton/IconButton';
import './Modal.css';
export interface ModalProps { open: boolean; onClose: () => void; title: string; children?: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' }
/** Native <dialog> modal: Esc closes, focus moves inside, backdrop click closes. Full-screen sheet under 600 px. */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  useEffect(() => { const d = ref.current; if (!d) return; const onCancel = (e: Event) => { e.preventDefault(); onClose(); }; d.addEventListener('cancel', onCancel); return () => d.removeEventListener('cancel', onCancel); }, [onClose]);
  return (<dialog ref={ref} className={`modal modal-${size}`} aria-labelledby="modal-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal-box"><header className="modal-head"><h2 id="modal-title">{title}</h2><IconButton icon="close" label="Close" onClick={onClose} /></header><div className="modal-body">{children}</div>{footer && <footer className="modal-foot">{footer}</footer>}</div>
  </dialog>);
}
