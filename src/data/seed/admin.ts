/** One recorded recommendation per cold prospect page, so A-02 shows the recorded / applied states from the first load (R-A03). */
import type { SeedCtx } from './index';
import { addDays, iso } from './rng';

export const order = 5;

export function seed(ctx: SeedCtx) {
  const { add, now } = ctx;
  add('recommendations', { id: 'rec_daniel_letter', prospect_id: 'pro_daniel', page_id: 'pg_daniel', kind: 'add_section', to_archetype: null, section: 'letter', reason: 'exit intent with no CTA click: add a short personal letter above the CTA band', score: 3, status: 'proposed', decided_by: 'usr_strategist', decided_at: null, note: '' });
  add('recommendations', { id: 'rec_maya_audit', prospect_id: 'pro_maya', page_id: 'pg_maya', kind: 'switch_archetype', to_archetype: 'audit', section: null, reason: 'long dwell on the savings stack: let her correct the tool list herself', score: 4, status: 'dismissed', decided_by: 'usr_strategist', decided_at: iso(addDays(now, -1)), note: 'Warm and playful; keep the reveal for now.' });
}
