/**
 * Resolves /p/:slug to a live page. Reads the `pages` row by slug, checks status + expires_at (R-C05: an expired or
 * unknown slug renders L-05, never a 404), and hands back the `pages.model` snapshot - landing pages render the
 * snapshot, they never recompute it. The one exception: when the URL asks for a different archetype than the snapshot
 * was composed with (all four variants are reachable for every slug), we recompose that archetype from the same inputs.
 */
import { useMemo } from 'react';
import { useTable } from '../../data/DataContext';
import type { Archetype, PageRow, ProspectRow, StackGuessRow } from '../../data/schema/core';
import { composePage } from '../../engine';
import type { PageModel } from '../../engine/types';

export type PageState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'expired'; page: PageRow; prospect: ProspectRow | null }
  | { status: 'live'; page: PageRow; prospect: ProspectRow; model: PageModel; guesses: StackGuessRow[] };

export const isExpired = (page: Pick<PageRow, 'status' | 'expires_at'>, now = Date.now()): boolean =>
  page.status === 'expired' || (page.expires_at != null && Date.parse(page.expires_at) <= now);

export function usePageModel(slug: string | undefined, archetype: Archetype): PageState {
  const { rows: pages, loading: pagesLoading } = useTable<PageRow>('pages', slug ? { where: { slug } } : { where: { slug: '\u0000none' } });
  const { rows: prospects, loading: prospectsLoading } = useTable<ProspectRow>('prospects');
  const { rows: allGuesses } = useTable<StackGuessRow>('stack_guesses');
  const page = pages[0] ?? null;
  const prospect = page ? prospects.find((p) => p.id === page.prospect_id) ?? null : null;
  const guesses = useMemo(() => (prospect ? allGuesses.filter((g) => g.prospect_id === prospect.id) : []), [allGuesses, prospect]);

  const model = useMemo<PageModel | null>(() => {
    if (!page || !prospect) return null;
    const snapshot = page.model as PageModel | null;
    if (snapshot && snapshot.archetype === archetype) return snapshot;
    return composePage(prospect, archetype, { pageId: page.id, slug: page.slug, guesses, expiresAt: page.expires_at });
  }, [page, prospect, archetype, guesses]);

  if (!slug) return { status: 'missing' };
  if (pagesLoading || prospectsLoading) return { status: 'loading' };
  if (!page) return { status: 'missing' };
  if (isExpired(page) || !prospect || !model) return { status: 'expired', page, prospect };
  return { status: 'live', page, prospect, model, guesses };
}

/** Days left on the 14-day workspace, for the honest urgency line (R-C04). Null when there is no expiry. */
export function daysLeft(expiresAt: string | null | undefined, now = Date.now()): number | null {
  if (!expiresAt) return null;
  const ms = Date.parse(expiresAt) - now;
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / 86400000));
}
