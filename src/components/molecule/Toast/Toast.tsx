import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../atom/Icon/Icon';
import './Toast.css';
export interface ToastItem { id: number; tone: 'info' | 'success' | 'warn' | 'danger'; title: string; body?: string }
interface ToastCtx { push: (t: Omit<ToastItem, 'id'>) => void; dismiss: (id: number) => void }
const Ctx = createContext<ToastCtx | null>(null);
/** Bottom-centre stack, 5 s auto dismiss, role=status. Wrap the app once. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const n = useRef(0);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const push = useCallback((t: Omit<ToastItem, 'id'>) => { const id = ++n.current; setItems((l) => [...l.slice(-3), { ...t, id }]); window.setTimeout(() => dismiss(id), 5000); }, [dismiss]);
  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);
  return (<Ctx.Provider value={value}>{children}
    <div className="toasts" role="status" aria-live="polite">{items.map((t) => <div key={t.id} data-component="Toast" className={`toast toast-${t.tone}`}><Icon name={t.tone === 'success' ? 'check' : t.tone === 'danger' ? 'alert' : 'info'} size={18} /><div className="toast-text"><strong>{t.title}</strong>{t.body && <div className="xs">{t.body}</div>}</div><button type="button" className="toast-x" aria-label="Dismiss" onClick={() => dismiss(t.id)}><Icon name="close" size={16} /></button></div>)}</div>
  </Ctx.Provider>);
}
export function useToast(): ToastCtx { const v = useContext(Ctx); if (!v) throw new Error('useToast outside ToastProvider'); return v; }
/** Marker component so the library lists Toast with a usage. */
export function Toast({ tone = 'info', title, body }: Omit<ToastItem, 'id'>) { return <div data-component="Toast" className={`toast toast-${tone} toast-static`}><Icon name={tone === 'success' ? 'check' : 'info'} size={18} /><div className="toast-text"><strong>{title}</strong>{body && <div className="xs">{body}</div>}</div></div>; }
