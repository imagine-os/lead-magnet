/** The development plan as data (mirrors docs/build-plan.md). Tasks are bound by dependencies, not calendar days. */
import type { SeedCtx } from './index';
import type { TaskRow } from '../schema/core';
export const order = 1;
type T = [string, string, string, string, TaskRow['model'], number, string[], TaskRow['status'], string?];
export const PLAN: T[] = [
  ['T01', 'Repo scaffold + Pages deploy', 'foundation', '', 'Fable 5.1', 0, [], 'done'],
  ['T02', 'Design tokens, theme, prospect palette override', 'design', '', 'Fable 5.1', 0, ['T01'], 'done'],
  ['T03', 'App shell, registry, roles/session, i18n, data seam', 'app', 'HUB-02', 'Fable 5.1', 0, ['T01'], 'done'],
  ['T04', 'Component library core with metas', 'components', 'D-02', 'Fable 5.1', 0, ['T02', 'T03'], 'done'],
  ['T05', 'Personalization engine (catalog, stack guess, savings, role views, archetype picker, composer, intake)', 'engine', '', 'Fable 5.1', 0, ['T03'], 'done'],
  ['T06', 'Hub, dev tools, page canvas, stubs for every code', 'hub/dev', 'HUB-01 D-01 D-02 D-03 D-04 D-05 D-06 D-07 D-08 D-09', 'Fable 5.1', 0, ['T04'], 'done'],
  ['T07', 'Docs skeleton, prompt log, decisions, kanban, plan seed', 'docs', '', 'Fable 5.1', 0, ['T01'], 'done'],
  ['T10', 'Plan viewer: Kanban, list, timeline with dependency edges', 'plan', 'K-01 K-02 K-03 K-04', 'Opus 5', 1, ['T06', 'T07'], 'backlog'],
  ['T11', 'Studio: prospects, AI intake, composer, assets, outreach composer', 'studio', 'S-01 S-02 S-03 S-04 S-05', 'Opus 5', 1, ['T05', 'T06'], 'backlog'],
  ['T12', 'Landing archetypes Reveal/Audit/Walkthrough/Letter + sections + tracking', 'landing', 'L-01 L-02 L-03 L-04 L-05', 'Opus 5', 1, ['T05', 'T06'], 'backlog'],
  ['T13', 'Tailored OS demo with role views', 'os-demo', 'C-01 C-02 C-03 C-04 C-05 C-06 C-07', 'Opus 5', 1, ['T05', 'T06'], 'backlog'],
  ['T14', 'Booking flow', 'booking', 'B-01 B-02', 'Opus 5', 1, ['T06'], 'backlog'],
  ['T15', 'Analytics, events, outreach board, bookings admin', 'admin', 'A-01 A-02 A-03 A-04 A-05', 'Opus 5', 1, ['T06'], 'backlog'],
  ['T16', 'Client proposal view + our website and pricing flow', 'proposal/website', 'R-01 W-01 W-02 W-03', 'Opus 5', 1, ['T05', 'T06'], 'backlog'],
  ['T20', 'Integration, build green, code review, decisions, push', 'integration', '', 'Fable 5.1', 2, ['T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16'], 'backlog'],
  ['T30', 'Spanish fill pass', 'i18n', '', 'Sonnet 5', 3, ['T20'], 'backlog'],
  ['T31', 'Screenshots at 7 widths, light/dark', 'qa', '', 'Sonnet 5', 3, ['T20'], 'backlog'],
  ['T32', 'Responsive + a11y QA matrix', 'qa', '', 'Sonnet 5', 3, ['T20'], 'backlog'],
  ['T33', 'Ops manual chapters EN/ES', 'manual', 'M-01 M-02 M-03 M-04 M-05', 'Opus 5', 3, ['T20'], 'backlog'],
  ['T40', 'Image generation provider wiring (prompts -> images)', 'assets', 'S-04', 'Opus 5', 4, ['T11'], 'awaiting_justin', 'needs provider + key'],
  ['T41', 'Video-on-scroll frame sequences from generated assets', 'landing', 'L-01 L-03', 'Opus 5', 4, ['T40'], 'backlog'],
  ['T42', 'Real booking provider (Cal.com/Calendly)', 'booking', 'B-01', 'Opus 5', 4, ['T14'], 'awaiting_justin'],
  ['T43', 'LLM enricher for intake + copy', 'engine', 'S-02', 'Fable 5.1', 4, ['T11'], 'awaiting_justin', 'model + key'],
  ['T44', 'Supabase provider + auth', 'data', '', 'Fable 5.1', 4, ['T20'], 'awaiting_justin'],
  ['T45', 'WebMCP tools generated from the actions manifest', 'actions', 'D-04', 'Fable 5.1', 4, ['T20'], 'backlog'],
  ['T46', 'Voice controller over actions', 'a11y', '', 'Fable 5.1', 4, ['T45'], 'backlog'],
  ['T47', 'D-pad / remote spatial navigation', 'a11y', '', 'Opus 5', 4, ['T20'], 'backlog'],
  ['T48', 'Realtime presence + concurrent editing', 'data', '', 'Fable 5.1', 4, ['T44'], 'backlog'],
  ['T49', 'Annotation pins on page + triage doc', 'annotations', 'D-09', 'Opus 5', 4, ['T20'], 'backlog'],
  ['T50', 'Company OS wiring', 'integration', '', 'Fable 5.1', 4, ['T44'], 'blocked', 'until Justin says so'],
  ['T51', 'Stripe purchase flow', 'website', 'W-03', 'Opus 5', 4, ['T16'], 'awaiting_justin'],
];
export function seed(ctx: SeedCtx) {
  for (const [id, title, module, codes, model, phase, depends_on, status, notes] of PLAN) ctx.add('tasks', { id, title, module, codes: codes ? codes.split(' ') : [], model, phase, depends_on, status, owner: model === 'Justin' ? 'Justin' : model, notes: notes ?? '', done_at: status === 'done' ? ctx.now.toISOString() : null });
}
