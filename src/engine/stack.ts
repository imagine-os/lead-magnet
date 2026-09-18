import type { Prospect, StackGuess, Savings } from './types';
import { industry } from './catalog/industries';

const round = (n: number) => Math.round(n * 100) / 100;
/** Seats we assume pay for per-seat tools: roughly half the team, at least 2. */
export const paidSeats = (p: Pick<Prospect, 'team_size'>) => Math.max(2, Math.round(p.team_size * 0.5));

/**
 * Catalog stack scaled by team_size / locations, minus rejected tools; confirmed known_tools get confidence 1.
 * Tools with prevalence under 0.3 are only included when the team is bigger (they are the "second choice" products).
 */
export function guessStack(p: Prospect, existing: StackGuess[] = []): StackGuess[] {
  const ind = industry(p.industry);
  const rejected = new Set(existing.filter((g) => g.status === 'rejected').map((g) => g.tool));
  const confirmed = new Set([...existing.filter((g) => g.status === 'confirmed').map((g) => g.tool), ...(p.known_tools ?? [])]);
  const seats = paidSeats(p);
  const out: StackGuess[] = [];
  // pick one product per category among competitors: the highest prevalence, unless a competitor is confirmed
  const byCategory = new Map<string, typeof ind.stack>();
  for (const item of ind.stack) { if (!byCategory.has(item.category)) byCategory.set(item.category, []); byCategory.get(item.category)!.push(item); }
  for (const [, items] of byCategory) {
    const pick = items.find((i) => confirmed.has(i.tool)) ?? [...items].sort((a, b) => b.prevalence - a.prevalence)[0];
    if (!pick || rejected.has(pick.tool)) continue;
    const isConfirmed = confirmed.has(pick.tool);
    if (!isConfirmed && pick.prevalence < 0.3 && p.team_size < 15) continue;
    let cost = pick.monthly_cost;
    if (pick.per_seat) cost *= seats;
    if (pick.per_location) cost *= Math.max(1, p.locations);
    const confidence = isConfirmed ? 1 : round(Math.min(0.95, pick.prevalence * (0.6 + 0.4 * p.confidence)));
    out.push({ tool: pick.tool, category: pick.category, monthly_cost: round(cost), confidence, status: isConfirmed ? 'confirmed' : 'guessed', replaced_by: pick.replaced_by });
  }
  return out.sort((a, b) => b.monthly_cost - a.monthly_cost);
}

/** Our price band (proposed, D-014): starter <= 5 people / 1 location, team <= 25, multi otherwise. */
export function priceBand(p: Pick<Prospect, 'team_size' | 'locations'>): Savings['price_band'] { return p.locations > 1 || p.team_size > 25 ? 'multi' : p.team_size > 5 ? 'team' : 'starter'; }
export const PRICE_MONTHLY: Record<Savings['price_band'], number> = { starter: 249, team: 499, multi: 899 };

export function savings(p: Prospect, guesses: StackGuess[]): Savings {
  const items = guesses.filter((g) => g.status !== 'rejected');
  const monthly_current = round(items.reduce((s, g) => s + g.monthly_cost, 0));
  const band = priceBand(p);
  const our = PRICE_MONTHLY[band];
  return { monthly_current, annual_current: round(monthly_current * 12), tools_cut: items.length, our_price_monthly: our, price_band: band, net_monthly: round(monthly_current - our), net_annual: round((monthly_current - our) * 12), items };
}
