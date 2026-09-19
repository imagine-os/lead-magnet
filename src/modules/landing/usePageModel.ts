/**
 * Resolves /p/:slug to a live page. Reads the `pages` rows by slug, checks status + expires_at (R-C05: an expired or
 * unknown slug renders L-05, never a 404), and hands back the `pages.model` snapshot - landing pages render the
 * snapshot, they never recompute it. The one exception: when the URL asks for a different archetype than the snapshot
 * was composed with (all four variants are reachable for every slug), we recompose that archetype from the same inputs.
 *
 * A/B (D-078 proposed): a slug may have more than one live `pages` row - the studio publishes variant B beside A, with
 * its own archetype and its own model. Which one a visitor sees is decided by hashing their tracking session id, so it
 * is stable for the whole visit (and across reloads in that tab) without a cookie, a server or a random flip that
 * would make the events uncomparable. `?variant=A|B` forces one, which is what the studio preview links use.
 */
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { Archetype, PageRow, ProspectRow, StackGuessRow } from '../../data/schema/core';
import { composePage } from '../../engine';
import type { PageModel } from '../../engine/types';
import { sessionId } from '../../tracking';

export type PageState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'expired'; page: PageRow; prospect: ProspectRow | null }
  | { status: 'live'; page: PageRow; prospect: ProspectRow; model: PageModel; guesses: StackGuessRow[]; /** Every live row for this slug, so the page can say how many variants are running. */ variants: PageRow[]; /** True when `?variant=` decided it instead of the visitor hash. */ forced: boolean };

export const isExpired = (page: Pick<PageRow, 'status' | 'expires_at'>, now = Date.now()): boolean =>
  page.status === 'expired' || (page.expires_at != null && Date.parse(page.expires_at) <= now);

/** Small stable string hash (FNV-1a). The same visitor always lands on the same variant. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

/**
 * Deterministic variant choice. Candidates are sorted by variant then id so the bucket does not move when the studio
 * republishes a row, and the hash includes the slug so one visitor is not pushed into "always B" on every page.
 */
export function pickPageVariant(rows: PageRow[], visitorKey: string, forced?: string | null): { page: PageRow | null; forced: boolean } {
  const candidates = [...rows].sort((a, b) => a.variant.localeCompare(b.variant) || a.id.localeCompare(b.id));
  if (!candidates.length) return { page: null, forced: false };
  if (forced) {
    const want = forced.trim().toLowerCase();
    const hit = candidates.find((p) => p.variant.toLowerCase() === want) ?? (want === 'a' ? candidates[0] : null);
    if (hit) return { page: hit, forced: true };
  }
  if (candidates.length === 1) return { page: candidates[0], forced: false };
  return { page: candidates[hashString(`${visitorKey}|${candidates[0].slug}`) % candidates.length], forced: false };
}

/** `?variant=B` from the hash route's query, falling back to a real query string (a link pasted without the hash). */
export function useForcedVariant(): string | null {
  const { search } = useLocation();
  return useMemo(() => {
    const inHash = new URLSearchParams(search).get('variant');
    if (inHash) return inHash;
    try { return new URLSearchParams(window.location.search).get('variant'); } catch { return null; }
  }, [search]);
}

export function usePageModel(slug: string | undefined, archetype: Archetype, followRow = false): PageState {
  const { rows: pages, loading: pagesLoading } = useTable<PageRow>('pages', slug ? { where: { slug } } : { where: { slug: '\u0000none' } });
  const { rows: prospects, loading: prospectsLoading } = useTable<ProspectRow>('prospects');
  const { rows: allGuesses } = useTable<StackGuessRow>('stack_guesses');
  const forcedVariant = useForcedVariant();

  // Live rows first; if every row for the slug is expired we still need one to render L-05 with their palette.
  const live = useMemo(() => pages.filter((p) => !isExpired(p)), [pages]);
  const chosen = useMemo(() => pickPageVariant(live, sessionId(), forcedVariant), [live, forcedVariant]);
  const page = chosen.page ?? pages[0] ?? null;
  const prospect = page ? prospects.find((p) => p.id === page.prospect_id) ?? null : null;
  const guesses = useMemo(() => (prospect ? allGuesses.filter((g) => g.prospect_id === prospect.id) : []), [allGuesses, prospect]);

  const model = useMemo<PageModel | null>(() => {
    if (!page || !prospect) return null;
    // `/p/:slug` follows whatever the strategist published for this row (so variant B may be a different archetype);
    // an explicit path (`/audit`, `/story`, `/letter`) always wins over the snapshot.
    const want = followRow ? page.archetype : archetype;
    const snapshot = page.model as PageModel | null;
    if (snapshot && snapshot.archetype === want) return snapshot;
    return composePage(prospect, want, { pageId: page.id, slug: page.slug, guesses, expiresAt: page.expires_at });
  }, [page, prospect, archetype, followRow, guesses]);

  if (!slug) return { status: 'missing' };
  if (pagesLoading || prospectsLoading) return { status: 'loading' };
  if (!page) return { status: 'missing' };
  if (isExpired(page) || !prospect || !model) return { status: 'expired', page, prospect };
  return { status: 'live', page, prospect, model, guesses, variants: live, forced: chosen.forced };
}

/** Days left on the 14-day workspace, for the honest urgency line (R-C04). Null when there is no expiry. */
export function daysLeft(expiresAt: string | null | undefined, now = Date.now()): number | null {
  if (!expiresAt) return null;
  const ms = Date.parse(expiresAt) - now;
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / 86400000));
}
