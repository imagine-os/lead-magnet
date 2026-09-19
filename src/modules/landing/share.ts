/**
 * Per-role share links (playbook 5, pass 3). The surprise of the role section is that the groomer, the accountant and
 * the spouse each get their own screen - and the cheapest way to turn that surprise into a second visitor is to let
 * the prospect forward the exact view that person cares about, not the whole page.
 *
 * The URL is the demo route the OS module already owns (`/#/demo/:prospectId/role/:slug`), built absolute from the
 * asset base so it survives the GitHub Pages sub-path and a HashRouter. Nothing is written and nothing is shortened:
 * a link we cannot resolve later is a link we cannot honour.
 */
import { assetBase } from './hooks';

/**
 * Absolute, pasteable link to one role's demo view. `assetBase()` is app-relative (`/` in dev, `/lead-magnet/` on
 * Pages), so it is resolved against the current location first - a share link that starts with a slash is useless the
 * moment it leaves this tab.
 */
export function roleShareUrl(prospectId: string, slug: string): string {
  const rel = assetBase();
  let base = rel;
  try { base = new URL(rel, window.location.href).href; } catch { /* no window (SSR / tests): keep the relative base */ }
  if (!base.endsWith('/')) base += '/';
  return `${base}#/demo/${prospectId}/role/${slug}`;
}

/**
 * Copy with the async clipboard API. Returns false whenever it is unavailable or refused (insecure context, Safari
 * without a user gesture, a denied permission) - the caller then shows the link in a focused, selected field, which
 * is the visible fallback rather than a silent failure. No `execCommand` hack: it lies about success on iOS.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* denied or unavailable: the field below is the fallback */ }
  return false;
}
