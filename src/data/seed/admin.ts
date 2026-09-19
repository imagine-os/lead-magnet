/**
 * Admin seed: the recorded recommendations A-02 shows from the first load (R-A03), plus two live A/B splits so the
 * A-01 readout has something real to read (T53).
 *
 * The splits are the two honest states of an A/B: Priya's slug has passed the minimum sample and variant B is clearly
 * ahead (so the promote-B recommendation hook is reachable), Daniel's is a fresh split far below it (so "not enough
 * data" is on screen too). Maya's slug stays single-variant on purpose - it is the QA default for /p/:slug. The traffic is seeded `events` rows exactly as `track()` writes them - page_id, prospect_id,
 * session_id and a meta carrying { variant, archetype, slug }, the same meta the landing page stamps - so every number
 * on A-01 comes from the same counting code as real traffic. These are tracked sessions, not `bookings` rows: the
 * bookings list stays what prospects actually booked on B-01.
 */
import type { SeedCtx } from './index';
import type { Archetype, PageRow, ProspectRow } from '../schema/core';
import { composePage, guessStack } from '../../engine';
import { addDays, iso } from './rng';

export const order = 5;

/** How many sessions of one side reached each stage. The stages nest: a demo session also viewed and opened outreach. */
interface SideSpec { outreach: number; views: number; demos: number; started: number; confirmed: number }

export function seed(ctx: SeedCtx) {
  const { add, now, db } = ctx;
  add('recommendations', { id: 'rec_daniel_letter', prospect_id: 'pro_daniel', page_id: 'pg_daniel', kind: 'add_section', to_archetype: null, section: 'letter', reason: 'exit intent with no CTA click: add a short personal letter above the CTA band', score: 3, status: 'proposed', decided_by: 'usr_strategist', decided_at: null, note: '' });
  add('recommendations', { id: 'rec_maya_audit', prospect_id: 'pro_maya', page_id: 'pg_maya', kind: 'switch_archetype', to_archetype: 'audit', section: null, reason: 'long dwell on the savings stack: let her correct the tool list herself', score: 4, status: 'dismissed', decided_by: 'usr_strategist', decided_at: iso(addDays(now, -1)), note: 'Warm and playful; keep the reveal for now.' });

  const prospects = (db.prospects ?? []) as unknown as ProspectRow[];
  const pages = (db.pages ?? []) as unknown as PageRow[];
  const expiresAt = iso(addDays(now, 11));

  /** Variant B beside the seeded variant A: same slug, a DIFFERENT archetype, its own composed snapshot (D-061). */
  function publishB(pageIdA: string, pageIdB: string, prefer: Archetype[]): PageRow | null {
    const a = pages.find((x) => x.id === pageIdA);
    const p = a ? prospects.find((x) => x.id === a.prospect_id) : undefined;
    if (!a || !p) return null;
    const archetype = prefer.find((k) => k !== a.archetype) ?? 'letter';
    const model = composePage(p, archetype, { pageId: pageIdB, slug: a.slug, guesses: guessStack(p), expiresAt });
    return add('pages', { id: pageIdB, prospect_id: p.id, archetype, slug: a.slug, variant: 'B', status: 'live', published_at: a.published_at, expires_at: expiresAt, model }) as unknown as PageRow;
  }

  /** Sessions for one side, spread across the three days since the split went live, written exactly as track() writes. */
  function traffic(tag: string, page: PageRow | null | undefined, s: SideSpec) {
    if (!page) return;
    const v = (page.variant || 'A').toUpperCase();
    const meta = { variant: v, archetype: page.archetype, slug: page.slug };
    let n = 0;
    for (let i = 0; i < s.outreach; i++) {
      const sid = `s_ab_${tag}_${v.toLowerCase()}_${String(i).padStart(2, '0')}`;
      const at = (mins: number) => iso(new Date(addDays(now, -3).getTime() + ((i + 1) / (s.outreach + 1)) * 3 * 86400000 + mins * 60000));
      const ev = (type: string, extra: Record<string, unknown>, mins: number) =>
        add('events', { id: `ev_ab_${tag}_${v.toLowerCase()}_${n++}`, page_id: page.id, prospect_id: page.prospect_id, session_id: sid, type, meta: { ...meta, ...extra }, ts: at(mins) });
      ev('outreach_open', { channel: 'email' }, 0);
      if (i >= s.views) continue;
      ev('view', { lang: 'en' }, 3);
      if (i >= s.demos) continue;
      ev('cta_click', { cta: 'primary' }, 5);
      ev('demo_open', { role: 'owner' }, 5);
      if (i >= s.started) continue;
      ev('booking_started', {}, 9);
      if (i >= s.confirmed) continue;
      ev('booking_confirmed', { slot: iso(addDays(now, 3)) }, 11);
    }
  }
  const pageA = (id: string) => pages.find((x) => x.id === id) ?? null;

  // Priya: the split that has the sample. B converts view -> demo far better than A, so the promote-B hook is reachable.
  // (Deliberately NOT Maya's slug: `paws-and-play-austin` is the QA / screenshot default for /p/:slug, and a second live
  //  row there would make the landing shots flip between archetypes with the visitor hash.)
  const priyaB = publishB('pg_priya', 'pg_priya_b', ['audit', 'walkthrough', 'letter']);
  traffic('priya', pageA('pg_priya'), { outreach: 38, views: 34, demos: 12, started: 5, confirmed: 2 });
  traffic('priya', priyaB, { outreach: 39, views: 36, demos: 19, started: 8, confirmed: 5 });

  // Daniel: a split that just started - nowhere near the minimum sample, so "not enough data" is on screen too (R-A04).
  const danielB = publishB('pg_daniel', 'pg_daniel_b', ['letter', 'audit', 'reveal']);
  traffic('daniel', pageA('pg_daniel'), { outreach: 9, views: 8, demos: 2, started: 1, confirmed: 0 });
  traffic('daniel', danielB, { outreach: 8, views: 7, demos: 3, started: 1, confirmed: 1 });
}
