import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ThemeName } from './tokens';

interface ThemeCtx { theme: ThemeName; setTheme: (t: ThemeName) => void; toggleTheme: () => void }
const Ctx = createContext<ThemeCtx | null>(null);
export const THEME_KEY = 'leadmagnet.theme';

function read(): ThemeName {
  try { const raw = localStorage.getItem(THEME_KEY); if (raw === 'dark' || raw === 'light') return raw; } catch { /* storage unavailable */ }
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Sets data-theme on <html> and persists it. Tokens do the rest. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(read);
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ } }, [theme]);
  const setTheme = useCallback((t: ThemeName) => setThemeState(t), []);
  const value = useMemo<ThemeCtx>(() => ({ theme, setTheme, toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light') }), [theme, setTheme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useTheme(): ThemeCtx { const v = useContext(Ctx); if (!v) throw new Error('useTheme outside ThemeProvider'); return v; }
