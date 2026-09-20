import type { Prospect, StackGuess, StackTier, Savings, StackItem } from './types';
import { industry, subIndustryFor, catalogItem } from './catalog/industries';

const round = (n: number) => Math.round(n * 100) / 100;
/** Seats we assume pay for per-seat tools: roughly half the team, at least 2. */
export const paidSeats = (p: Pick<Prospect, 'team_size'>) => Math.max(2, Math.round(p.team_size * 0.5));
/** Per-location tools are billed per site; a single-site business still pays once. */
export const paidLocations = (p: Pick<Prospect, 'locations'>) => Math.max(1, p.locations || 1);

/** Above this confidence a guess is "likely" (we would bet on it); below it is "possible" (plausible for the industry). D-056 proposed. */
export const TIER_MIN_LIKELY = 0.5;
export const stackTier = (g: Pick<StackGuess, 'confidence' | 'status'>): StackTier => (g.status === 'confirmed' || g.confidence >= TIER_MIN_LIKELY ? 'likely' : 'possible');
/** Prevalence under this is a "second choice" product in its industry. */
export const RARE_PREVALENCE = 0.3;
/** A rare product is only guessed for a team this size; below it we would rather ask than invent a line item. */
export const POSSIBLE_MIN_TEAM = 15;
/** Prevalence a sub-industry's `extra_tools` entry gets when the sub does not say (`extra_prevalence`): common in that kind of business, not certain. */
export const SUB_EXTRA_PREVALENCE = 0.6;

/**
 * The catalog items a prospect's stack guess is drawn from (T55): the industry's stack, with the sub-industry's `extra_tools` on top.
 * An extra tool already in the industry's stack takes the sub's prevalence (the sub knows better: Ecwid is 0.1 for law firms, 0.8 for tenant law); one from another industry is pulled in at the sub's prevalence with its catalog price. No sub, or a sub without extras: the industry's stack, untouched.
 */
export function candidateStack(p: Pick<Prospect, 'industry' | 'sub_industry'>): StackItem[] {
  const ind = industry(p.industry);
  const sub = subIndustryFor(p);
  if (!sub?.extra_tools?.length) return ind.stack;
  const out = [...ind.stack];
  for (const tool of sub.extra_tools) {
    const prevalence = sub.extra_prevalence?.[tool] ?? SUB_EXTRA_PREVALENCE;
    const at = out.findIndex((x) => x.tool === tool);
    if (at >= 0) { out[at] = { ...out[at], prevalence }; continue; }
    const item = catalogItem(tool);
    if (item) out.push({ ...item, prevalence });
  }
  return out;
}

/** What a catalog item costs this prospect: seat-based tools scale with the paying seats, site-based tools with the locations. */
export function itemCost(item: StackItem, p: Pick<Prospect, 'team_size' | 'locations'>): number {
  let cost = item.monthly_cost;
  if (item.per_seat) cost *= paidSeats(p);
  if (item.per_location) cost *= paidLocations(p);
  return round(cost);
}

/**
 * The stack we think a prospect pays for, from the industry catalog.
 *
 * - one product per category: a competitor the prospect confirmed wins, otherwise the most common one;
 * - one product per replacement: we never bill them twice for the module that would replace it, and a confirmed tool
 *   knocks out every other guess we would replace with the same module ("drop what they already told us");
 * - never the same tool twice, even when two industries or the common list both carry it;
 * - seat-based prices scale with `team_size`, site-based prices with `locations`;
 * - every guess carries a tier: `likely` at or above TIER_MIN_LIKELY confidence, `possible` below it (stackTier());
 * - a rare product (prevalence under RARE_PREVALENCE) is only guessed for teams of POSSIBLE_MIN_TEAM+ - a small shop
 *   gets asked in the intake instead of billed for a tool we invented;
 * - rows the prospect rejected never come back, and `known_tools` / previously confirmed rows come back as confirmed
 *   with confidence 1;
 * - a sub-industry's `extra_tools` join the candidates at the sub's prevalence (candidateStack(), T55), so a dog hotel is
 *   guessed PetLinx and Squarespace where a generic daycare is asked.
 */
export function guessStack(p: Prospect, existing: StackGuess[] = []): StackGuess[] {
  const ind = { stack: candidateStack(p) };
  const rejected = new Set(existing.filter((g) => g.status === 'rejected').map((g) => g.tool));
  const confirmed = new Set([...existing.filter((g) => g.status === 'confirmed').map((g) => g.tool), ...(p.known_tools ?? [])]);
  const out: StackGuess[] = [];
  const seenTool = new Set<string>();
  const seenReplacement = new Set<string>();

  // one candidate per category: a confirmed competitor wins, else the most common product
  const byCategory = new Map<string, StackItem[]>();
  for (const item of ind.stack) {
    if (seenTool.has(item.tool)) continue; // never the same tool twice (catalog + COMMON overlap)
    seenTool.add(item.tool);
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }
  const picks: StackItem[] = [];
  for (const [, items] of byCategory) {
    const pick = items.find((i) => confirmed.has(i.tool)) ?? [...items].sort((a, b) => b.prevalence - a.prevalence)[0];
    if (pick) picks.push(pick);
  }
  // confirmed first, then by prevalence: the winner of a replacement clash is the one we are surest about
  picks.sort((a, b) => Number(confirmed.has(b.tool)) - Number(confirmed.has(a.tool)) || b.prevalence - a.prevalence);

  for (const pick of picks) {
    if (rejected.has(pick.tool)) continue;
    if (seenReplacement.has(pick.replaced_by)) continue; // one line item per module we would replace
    const isConfirmed = confirmed.has(pick.tool);
    if (!isConfirmed && pick.prevalence < RARE_PREVALENCE && p.team_size < POSSIBLE_MIN_TEAM) continue; // ask instead of inventing
    const confidence = isConfirmed ? 1 : round(Math.min(0.95, pick.prevalence * (0.6 + 0.4 * p.confidence)));
    seenReplacement.add(pick.replaced_by);
    out.push({ tool: pick.tool, category: pick.category, monthly_cost: itemCost(pick, p), confidence, status: isConfirmed ? 'confirmed' : 'guessed', replaced_by: pick.replaced_by });
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
