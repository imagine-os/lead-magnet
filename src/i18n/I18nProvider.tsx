import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Bi, Lang, StringTable } from './types';

interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, string | number>) => string; bi: (v: Bi | string) => string }
const Ctx = createContext<I18nCtx | null>(null);
export const LANG_KEY = 'leadmagnet.lang';

export function I18nProvider({ tables, children }: { tables: StringTable[]; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => { try { return localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'en'; } catch { return 'en'; } });
  useEffect(() => { try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ } document.documentElement.lang = lang; }, [lang]);
  const merged = useMemo(() => Object.assign({}, ...tables) as StringTable, [tables]);
  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const e = merged[key];
    let s = e == null ? key : typeof e === 'string' ? e : (lang === 'es' && e.es) || e.en;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    return s;
  }, [merged, lang]);
  const bi = useCallback((v: Bi | string) => (typeof v === 'string' ? v : (lang === 'es' && v.es) || v.en), [lang]);
  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const value = useMemo(() => ({ lang, setLang, t, bi }), [lang, setLang, t, bi]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useI18n(): I18nCtx { const v = useContext(Ctx); if (!v) throw new Error('useI18n outside I18nProvider'); return v; }
export const useT = () => useI18n().t;
