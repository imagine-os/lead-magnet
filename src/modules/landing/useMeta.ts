/**
 * Per-page document metadata: the title, the description and the Open Graph tags a link preview reads.
 *
 * Honest limitation (recorded in the changelog): these are set at runtime, and a HashRouter page lives at
 * `/#/p/<slug>`, so a crawler that does not run JavaScript sees `index.html`'s tags for every prospect. The fix is a
 * static prerender of `/p/<slug>` at build time (proposed as a later task); until then this still gets the right
 * title into the tab, the history, the bookmark and every preview that executes the page.
 */
import { useEffect } from 'react';
import type { Lang } from '../../i18n/types';
import { assetBase } from './hooks';

export interface PageMeta { title: string; description: string; image?: string | null; url?: string | null }

/** The absolute URL of a file in `public/` (og:image must be absolute for every scraper). */
export function publicUrl(path: string): string {
  try { return new URL(path, new URL(assetBase(), window.location.href)).href; } catch { return path; }
}

function setTag(attr: 'name' | 'property', key: string, content: string): () => void {
  const head = document.head;
  let el = head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  const created = !el;
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); head.appendChild(el); }
  const before = el.getAttribute('content');
  el.setAttribute('content', content);
  return () => {
    if (!el) return;
    if (created) el.remove();
    else if (before != null) el.setAttribute('content', before);
  };
}

/** Sets title + description + og/twitter tags while the page is mounted and puts back what was there on unmount. */
export function usePageMeta(meta: PageMeta | null) {
  const { title, description, image, url } = meta ?? {};
  useEffect(() => {
    if (!title || !description) return;
    const prevTitle = document.title;
    document.title = title;
    const undo = [
      setTag('name', 'description', description),
      setTag('property', 'og:title', title),
      setTag('property', 'og:description', description),
      setTag('property', 'og:type', 'website'),
      setTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary'),
      setTag('name', 'twitter:title', title),
      setTag('name', 'twitter:description', description),
      ...(image ? [setTag('property', 'og:image', image), setTag('name', 'twitter:image', image)] : []),
      ...(url ? [setTag('property', 'og:url', url)] : []),
    ];
    return () => { document.title = prevTitle; for (const f of undo) f(); };
  }, [title, description, image, url]);
}

/** The landing title / description for one prospect, in the viewer's language. */
export function pageMetaFor(p: { business_name: string; city: string; first_name: string }, lang: Lang, savingsAnnual: number, toolsCut: number): PageMeta {
  const money = `$${Math.round(savingsAnnual).toLocaleString(lang === 'es' ? 'es-MX' : 'en-US')}`;
  return lang === 'es'
    ? { title: `El sistema operativo de ${p.business_name}, ya construido`, description: `Ya construimos el sistema operativo de ${p.business_name} en ${p.city}: una vista para cada rol, y reemplaza ${toolsCut} herramientas que pagan hoy (${money} al año). Ábrelo, sin formularios.` }
    : { title: `${p.business_name}'s operating system, already built`, description: `We already built ${p.business_name}'s operating system in ${p.city}: a view for every role, replacing the ${toolsCut} tools they pay for today (${money} a year). Open it - no form.` };
}
