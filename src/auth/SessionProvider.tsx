import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ROLES, type Role } from './roles';
import { demoUserById, demoUserByRole, type DemoUser } from './demoUsers';
import { roleCan, type Permission } from './permissions';

interface SessionState { userId: string; devMode: boolean; viewAs: Role | null }
export type SessionUser = DemoUser;
interface SessionCtx {
  user: SessionUser; role: Role; isSuperAdmin: boolean; devMode: boolean; viewAs: Role | null;
  switchUser: (idOrRole: string | Role) => void; signOut: () => void; setDevMode: (on: boolean) => void; setViewAs: (role: Role | null) => void;
  can: (permission: Permission) => boolean; hasRole: (roles: Role[]) => boolean;
}
const Ctx = createContext<SessionCtx | null>(null);
export const SESSION_KEY = 'leadmagnet.session';
const DEFAULT: SessionState = { userId: 'usr_super', devMode: false, viewAs: null };
const isRole = (s: string): s is Role => (ROLES as readonly string[]).includes(s);

function read(): SessionState {
  try { const raw = localStorage.getItem(SESSION_KEY); if (raw) { const s = JSON.parse(raw); if (typeof s.userId === 'string' && s.userId) return { ...DEFAULT, ...s }; } } catch { /* ignore */ }
  return DEFAULT;
}

/** { userId, devMode, viewAs } in localStorage. Effective role = viewAs when the super admin is viewing as someone. Dev mode only for super_admin. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(read);
  useEffect(() => { try { localStorage.setItem(SESSION_KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);
  const user = demoUserById(state.userId) ?? demoUserByRole('guest');
  const isSuperAdmin = user.role === 'super_admin';
  const role: Role = isSuperAdmin && state.viewAs ? state.viewAs : user.role;
  const devMode = isSuperAdmin && state.devMode;
  const switchUser = useCallback((idOrRole: string) => {
    const d = demoUserById(idOrRole) ?? (isRole(idOrRole) ? demoUserByRole(idOrRole) : undefined);
    setState((s) => ({ userId: d?.id ?? 'usr_guest', viewAs: null, devMode: d?.role === 'super_admin' ? s.devMode : false }));
  }, []);
  const signOut = useCallback(() => setState({ userId: 'usr_guest', devMode: false, viewAs: null }), []);
  const setDevMode = useCallback((on: boolean) => setState((s) => ({ ...s, devMode: on })), []);
  const setViewAs = useCallback((viewAs: Role | null) => setState((s) => ({ ...s, viewAs })), []);
  const can = useCallback((p: Permission) => roleCan(role, p), [role]);
  const hasRole = useCallback((roles: Role[]) => roles.includes('guest') || roles.includes(role) || (isSuperAdmin && !state.viewAs), [role, isSuperAdmin, state.viewAs]);
  const value = useMemo<SessionCtx>(() => ({ user, role, isSuperAdmin, devMode, viewAs: isSuperAdmin ? state.viewAs : null, switchUser, signOut, setDevMode, setViewAs, can, hasRole }), [user, role, isSuperAdmin, devMode, state.viewAs, switchUser, signOut, setDevMode, setViewAs, can, hasRole]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useSession(): SessionCtx { const v = useContext(Ctx); if (!v) throw new Error('useSession outside SessionProvider'); return v; }
