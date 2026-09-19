import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { componentAttr } from '../../../design/meta';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atom/Button/Button';
import './ConfirmDialog.css';

export interface ConfirmOptions {
  title: string; body?: ReactNode;
  /** Visible label of the confirming button (module string, e.g. t('studio.expire_now')) */
  confirmLabel: string;
  /** Default: Cancel / Cancelar by current language */
  cancelLabel?: string;
  /** `danger` = destructive: red confirm button, cancel takes focus first */
  tone?: 'default' | 'danger';
}
export interface ConfirmDialogProps extends ConfirmOptions { open: boolean; onResolve: (ok: boolean) => void }
const CANCEL = { en: 'Cancel', es: 'Cancelar' } as const;
const CLOSE = { en: 'Close', es: 'Cerrar' } as const;

/** Modal with one question and two answers. Focus lands on Cancel (the safe answer); Esc and backdrop resolve false. */
export function ConfirmDialog({ open, onResolve, title, body, confirmLabel, cancelLabel, tone = 'default' }: ConfirmDialogProps) {
  const { lang } = useI18n();
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Modal (the child) has already called showModal() by the time this effect runs, so the safe answer can take focus.
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);
  const close = useCallback(() => onResolve(false), [onResolve]);
  return (<Modal open={open} onClose={close} title={title} size="sm" closeLabel={CLOSE[lang]} className={`confirm confirm-${tone}`}
    footer={<><Button ref={cancelRef} variant="outline" onClick={close}>{cancelLabel ?? CANCEL[lang]}</Button><Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={() => onResolve(true)}>{confirmLabel}</Button></>}>
    <div {...componentAttr('ConfirmDialog')} className="confirm-body">{body}</div>
  </Modal>);
}

type Pending = { options: ConfirmOptions; resolve: (ok: boolean) => void };
const Ctx = createContext<((o: ConfirmOptions) => Promise<boolean>) | null>(null);
/** Mount once (App.tsx). Hosts the single ConfirmDialog that `useConfirm()` drives. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const last = useRef<ConfirmOptions | null>(null);
  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => {
    setPending((prev) => { prev?.resolve(false); last.current = options; return { options, resolve }; });
  }), []);
  const onResolve = useCallback((ok: boolean) => { setPending((prev) => { prev?.resolve(ok); return null; }); }, []);
  const shown = pending?.options ?? last.current;
  const value = useMemo(() => confirm, [confirm]);
  return (<Ctx.Provider value={value}>{children}
    {shown && <ConfirmDialog open={!!pending} onResolve={onResolve} {...shown} />}
  </Ctx.Provider>);
}
/** `const ok = await confirm({ title, body, confirmLabel, tone: 'danger' })` - resolves false on cancel, Esc or backdrop. */
export function useConfirm(): (o: ConfirmOptions) => Promise<boolean> { const v = useContext(Ctx); if (!v) throw new Error('useConfirm outside ConfirmProvider'); return v; }
