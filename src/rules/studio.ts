import type { Rule } from './index';

/** R-S01: a page below this confidence needs an explicit override before it can go live. */
export const MIN_PUBLISH_CONFIDENCE = 0.3;
/** R-S02: honest urgency - a published workspace lives 14 days (D-013, proposed). */
export const PAGE_TTL_DAYS = 14;
export const expiresAtFrom = (published: Date = new Date()): string => new Date(published.getTime() + PAGE_TTL_DAYS * 86400000).toISOString();

export const rules: Rule[] = [
  { id: 'R-S01', title: 'Publishing needs 30 % confidence or an explicit override', description: 'A page composed from a profile we barely know is worse than no page: publish is blocked under confidence 0.3 unless the strategist turns the override on, and the override is recorded in the toast and the page doc.', category: 'studio', status: 'implemented', pages: ['S-03', 'S-02'], source: 'conversion-playbook 4 + P-09 honesty', implementedIn: 'src/modules/studio/ComposePage.tsx publish()' },
  { id: 'R-S02', title: 'Pages expire 14 days after publish', description: 'publish sets published_at = now and expires_at = now + 14 days; expire sets status expired and keeps the PageModel snapshot so the page doc and analytics still resolve. Matches R-C05 on the landing side (D-013, proposed).', category: 'studio', status: 'implemented', pages: ['S-03', 'S-01', 'L-01', 'L-05'], source: 'conversion-playbook 8, D-013 (proposed)', implementedIn: 'src/rules/studio.ts PAGE_TTL_DAYS' },
  { id: 'R-S03', title: 'Every studio write goes through update by id', description: 'No in-memory-only edits: intake answers, tool confirmations, roles, style, asset status and touches all write through useData().update(table, id, patch) (or insert), so a realtime provider swaps in without touching a page (P-14, P-15).', category: 'studio', status: 'implemented', pages: ['S-01', 'S-02', 'S-03', 'S-04', 'S-05'], source: 'house pattern, P-14', implementedIn: 'src/modules/studio/*' },
];
