import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Bi, Lang, StringTable } from './types';

interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, string | number>) => string; bi: (v: Bi | string) => string; /** Pages call `useDefaultLang(prospect.lang)`; this is the plumbing. */ setPageDefault: (l: Lang | null) => void; /** True once the viewer pressed EN / ES (stored); false while the language is a default. */ chosen: boolean }
const Ctx = createContext<I18nCtx | null>(null);
export const LANG_KEY = 'leadmagnet.lang';
const readStored = (): Lang | null => { try { const v = localStorage.getItem(LANG_KEY); return v === 'es' || v === 'en' ? v : null; } catch { return null; } };

/**
 * English is primary; Spanish falls back to English per key. The effective language is: the viewer's explicit choice
 * (EN / ES toggle, persisted) > the page's default (a prospect page passes `prospects.lang` via `useDefaultLang`) > en.
 * Only explicit toggles are stored, so a Spanish-first prospect opens their page in Spanish until they say otherwise.
 */
export function I18nProvider({ tables, children }: { tables: StringTable[]; children: ReactNode }) {
  const [stored, setStored] = useState<Lang | null>(readStored);
  const [pageDefault, setPageDefault] = useState<Lang | null>(null);
  const lang: Lang = stored ?? pageDefault ?? 'en';
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const merged = useMemo(() => Object.assign({}, ...tables) as StringTable, [tables]);
  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const e = merged[key];
    let s = e == null ? key : typeof e === 'string' ? e : (lang === 'es' && e.es) || e.en;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    return s;
  }, [merged, lang]);
  const bi = useCallback((v: Bi | string) => (typeof v === 'string' ? v : (lang === 'es' && v.es) || v.en), [lang]);
  const setLang = useCallback((l: Lang) => { setStored(l); try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ } }, []);
  const value = useMemo(() => ({ lang, setLang, t, bi, setPageDefault, chosen: stored != null }), [lang, setLang, t, bi, stored]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useI18n(): I18nCtx { const v = useContext(Ctx); if (!v) throw new Error('useI18n outside I18nProvider'); return v; }
export const useT = () => useI18n().t;
/** A prospect page opens in the prospect's language when the viewer has not chosen one; cleared when the page unmounts. */
export function useDefaultLang(lang: Lang | null | undefined) {
  const { setPageDefault } = useI18n();
  useEffect(() => { setPageDefault(lang ?? null); return () => setPageDefault(null); }, [lang, setPageDefault]);
}
