/** A short intake transcript per seeded prospect, so S-02 opens with a conversation already in progress rather than an empty panel. */
import type { SeedCtx } from './index';
import { addDays, iso } from './rng';

export const order = 1;

export function seed(ctx: SeedCtx) {
  const { add, now } = ctx;
  const turn = (id: string, prospect_id: string, field: string, question: string, answer: string, source: 'manual' | 'rule' | 'llm', confidence_after: number, daysAgo: number) =>
    add('intake_turns', { id, prospect_id, field, question, answer, source, confidence_after, ts: iso(addDays(now, -daysAgo)) });

  turn('it_maya_1', 'pro_maya', 'team_size', 'How many people work at Paws & Play Austin?', '9', 'manual', 0.54, 12);
  turn('it_maya_2', 'pro_maya', 'known_tools', 'Which software do they pay for today?', 'Gingr, Square', 'manual', 0.62, 12);
  turn('it_maya_3', 'pro_maya', 'business_roles', 'Which roles exist in the business?', 'owner, manager, front desk, handler, groomer', 'rule', 0.68, 11);

  turn('it_daniel_1', 'pro_daniel', 'locations', '¿Cuántas sedes?', '2', 'manual', 0.49, 10);
  turn('it_daniel_2', 'pro_daniel', 'life_roles', '¿Quién más en su vida querría una vista (pareja, hijos, contador)?', 'owner, spouse/partner, kids, accountant, practice consultant', 'rule', 0.56, 10);

  turn('it_priya_1', 'pro_priya', 'revenue_band', 'Rough revenue band?', '5m_plus', 'manual', 0.66, 9);
  turn('it_priya_2', 'pro_priya', 'known_tools', 'Which software do they pay for today?', 'Toast POS, 7shifts, OpenTable, Tripleseat', 'manual', 0.74, 9);
}
