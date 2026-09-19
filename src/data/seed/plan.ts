/** The development plan as data (mirrors docs/build-plan.md). Tasks are bound by dependencies, not calendar days. */
import type { SeedCtx } from './index';
import type { TaskRow } from '../schema/core';
export const order = 1;
type T = [string, string, string, string, TaskRow['model'], number, string[], TaskRow['status'], string?, string?];
/** done_at per task (ISO date); defaults to the foundation day for T0x and the integration day for the rest. */
const DONE_FOUNDATION = '2026-09-18T23:00:00.000Z'; const DONE_INTEGRATION = '2026-09-19T00:00:00.000Z';
export const PLAN: T[] = [
  ['T01', 'Repo scaffold + Pages deploy', 'foundation', '', 'Fable 5.1', 0, [], 'done'],
  ['T02', 'Design tokens, theme, prospect palette override', 'design', '', 'Fable 5.1', 0, ['T01'], 'done'],
  ['T03', 'App shell, registry, roles/session, i18n, data seam', 'app', 'HUB-02', 'Fable 5.1', 0, ['T01'], 'done'],
  ['T04', 'Component library core with metas', 'components', 'D-02', 'Fable 5.1', 0, ['T02', 'T03'], 'done'],
  ['T05', 'Personalization engine (catalog, stack guess, savings, role views, archetype picker, composer, intake)', 'engine', '', 'Fable 5.1', 0, ['T03'], 'done'],
  ['T06', 'Hub, dev tools, page canvas, stubs for every code', 'hub/dev', 'HUB-01 D-01 D-02 D-03 D-04 D-05 D-06 D-07 D-08 D-09', 'Fable 5.1', 0, ['T04'], 'done'],
  ['T07', 'Docs skeleton, prompt log, decisions, kanban, plan seed', 'docs', '', 'Fable 5.1', 0, ['T01'], 'done'],
  ['T10', 'Plan viewer: Kanban, list, timeline with dependency edges', 'plan', 'K-01 K-02 K-03 K-04', 'Opus 5', 1, ['T06', 'T07'], 'done'],
  ['T11', 'Studio: prospects, AI intake, composer, assets, outreach composer', 'studio', 'S-01 S-02 S-03 S-04 S-05', 'Opus 5', 1, ['T05', 'T06'], 'done'],
  ['T12', 'Landing archetypes Reveal/Audit/Walkthrough/Letter + sections + tracking', 'landing', 'L-01 L-02 L-03 L-04 L-05', 'Opus 5', 1, ['T05', 'T06'], 'done'],
  ['T13', 'Tailored OS demo with role views', 'os-demo', 'C-01 C-02 C-03 C-04 C-05 C-06 C-07', 'Opus 5', 1, ['T05', 'T06'], 'done'],
  ['T14', 'Booking flow', 'booking', 'B-01 B-02', 'Opus 5', 1, ['T06'], 'done'],
  ['T15', 'Analytics, events, outreach board, bookings admin', 'admin', 'A-01 A-02 A-03 A-04 A-05', 'Opus 5', 1, ['T06'], 'done'],
  ['T16', 'Client proposal view + our website and pricing flow', 'proposal/website', 'R-01 W-01 W-02 W-03', 'Opus 5', 1, ['T05', 'T06'], 'done'],
  ['T20', 'Integration, build green, code review, decisions, push', 'integration', '', 'Fable 5.1', 2, ['T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16'], 'done'],
  ['T21', 'Integration pass 2: contrast tokens, 44 px targets, phone demo chrome, data-component, docs, v0.3.0', 'integration', '', 'Fable 5.1', 3, ['T30', 'T31', 'T32', 'T33', 'T41', 'T45', 'T49'], 'done', 'changelog 0016: axe serious 2034 -> residue named in docs/qa/a11y-report.md, focus and hit-target walks green, frames regenerated with the compact demo bar'],
  ['T30', 'Spanish fill pass', 'i18n', '', 'Sonnet 5', 3, ['T20'], 'done', 'npm run i18n:check audits every table; 33 flags left on purpose (loanwords, cognates, proper nouns), landing has 0 gaps (changelog 0015)'],
  ['T31', 'Screenshots at 7 widths, light/dark', 'qa', '', 'Sonnet 5', 3, ['T20'], 'done', 'every built code at 390 / 1280 (dev mode on for D- codes), dark for HUB-01 L-01 C-01 K-01 A-01 M-01, the 7-width set for HUB-01 L-01 C-01 K-03 W-01 M-01 (changelog 0016); rerun after every pass'],
  ['T32', 'Responsive + a11y QA matrix', 'qa', '', 'Sonnet 5', 3, ['T20'], 'done', 'npm run qa:responsive (7 widths x 2 themes) and npm run qa:a11y (axe WCAG 2.1 AA + keyboard walk) on every built route; findings fixed at the root in changelog 0016, residue named in docs/qa/a11y-report.md'],
  ['T33', 'Ops manual chapters EN/ES', 'manual', 'M-01 M-02 M-03 M-04 M-05', 'Opus 5', 3, ['T20'], 'done', 'five chapters in docs/ops-manual/<lang>/ with live-data directives (R-M01) and a faithful Spanish mirror (R-M02), changelog 0011'],
  ['T40', 'Image generation provider wiring (prompts -> images)', 'assets', 'S-04', 'Opus 5', 4, ['T11'], 'awaiting_justin', 'needs provider + key'],
  ['T41', 'Video-on-scroll frame sequences from the live OS demo (T41-lite)', 'landing', 'L-01 L-03', 'Opus 5', 4, ['T13'], 'done', 'npm run frames walks the real demo and commits public/frames/<prospectId>/ (D-077); generated hero / role imagery stays under T40'],
  ['T42', 'Real booking provider (Cal.com/Calendly)', 'booking', 'B-01', 'Opus 5', 4, ['T14'], 'awaiting_justin'],
  ['T43', 'LLM enricher for intake + copy', 'engine', 'S-02', 'Fable 5.1', 4, ['T11'], 'awaiting_justin', 'model + key'],
  ['T44', 'Supabase provider + auth', 'data', '', 'Fable 5.1', 4, ['T20'], 'awaiting_justin'],
  ['T45', 'WebMCP tools generated from the actions manifest', 'actions', 'D-04', 'Fable 5.1', 4, ['T20'], 'done', '136 tools, npm run actions CLI, docs/reference/{control.md, actions-manifest.json, voice-vocabulary.json}, D-04 run modal (changelog 0010)'],
  ['T46', 'Voice controller over actions', 'a11y', 'HUB-01', 'Fable 5.1', 4, ['T45'], 'done', 'matchPhrase over the generated vocabulary (npm run test:voice, 18 checks), useVoice (never auto-listens), CommandPalette on every shell (Ctrl/Cmd+K + visible buttons), hub.openCommands / hub.voiceListen (changelog 0018; D-099..D-101)', '2026-09-19T20:00:00.000Z'],
  ['T47', 'D-pad / remote spatial navigation', 'a11y', '', 'Fable 5.1', 4, ['T20'], 'done', 'useSpatialNav + useGamepadNav on every shell: hub, demo, DesktopShell (per-axis arrow ownership, Escape parks focus), landing L-01..L-05, booking, website, proposal, no-access; npm run qa:dpad rehearsal -> docs/qa/dpad-report.md (changelogs 0018, 0019, 0023; D-102, D-124); --strict in the a11y matrix is T58', '2026-09-19T20:00:00.000Z'],
  ['T48', 'Realtime presence + concurrent editing', 'data', '', 'Fable 5.1', 4, ['T44'], 'backlog'],
  ['T49', 'Annotation pins on page + triage doc', 'annotations', 'D-09', 'Opus 5', 4, ['T20'], 'done', 'AnnotationLayer on every route, element_path + exact data-component, R-F01..R-F03 enforced in D-09, docs/reference/annotations-triage.md (changelog 0012)'],
  ['T50', 'Company OS wiring', 'integration', '', 'Fable 5.1', 4, ['T44'], 'blocked', 'until Justin says so'],
  ['T51', 'Stripe purchase flow', 'website', 'W-03', 'Opus 5', 4, ['T16'], 'awaiting_justin'],
  ['T52', 'Catalog pass 2: sub-industries, per-industry price review dates, the industries Justin named', 'engine', 'S-02', 'Sonnet 5', 4, ['T11'], 'done', '24 sub-industries across 9 industries, price_reviewed on every tool (4 prices corrected), 2 coverage checks, docs/reference/catalog.md generated by npm run catalog:doc (changelog 0022; D-119, D-120); the intake asks the sub-industry since changelog 0023 (D-122)', '2026-09-19T20:00:00.000Z'],
  ['T53', 'A/B readout: A-01 shows the two live variants of a slug side by side with their own funnels', 'admin', 'A-01 A-03', 'Opus 5', 4, ['T15'], 'done', 'per-slug readout on one shared scale (PairedBarChart), 30-session / 10 % lift gate before any side is called ahead (R-A04), promote_variant recommendation row, 7 / 30 / 90 / all date range, A-03 variant column + filter, seeded splits (changelog 0020; D-110..D-114)', '2026-09-19T20:00:00.000Z'],
  ['T54', 'Static prerender of /p/<slug> for crawler-visible OG tags', 'landing', 'L-01 L-06', 'Opus 5', 4, ['T12'], 'awaiting_justin', 'blocked on D-080 (proposed)'],
  ['T22', 'Integration pass 3: sortable tables, --scale in the library, spatial hook on every shell, sub-industry intake, objections in composePage, docs, v0.4.0', 'integration', '', 'Fable 5.1', 4, ['T46', 'T47', 'T52', 'T53'], 'done', 'changelog 0023: cross-module requests from 0017..0022 fixed at the root, decisions D-093..D-124, SEED_VERSION 4, actions manifest 144 tools / 230 rows', '2026-09-19T21:00:00.000Z'],
  ['T55', 'Sub-industry in the engine: guessStack() weights sub[].extra_tools, S-02 profile editor and S-01 filter by sub-industry', 'engine', 'S-01 S-02', 'Opus 5', 4, ['T52'], 'backlog', 'the intake question and applyAnswer() landed in changelog 0023 (D-122); this card is the stack-guess weighting and the studio surfaces'],
  ['T56', 'Comms provider: calls, email, SMS, WhatsApp on one number behind the C-04 / C-06 composers and the S-05 send', 'os-demo', 'C-04 C-06 S-05', 'Opus 5', 4, ['T44'], 'awaiting_justin', 'provider + keys; today demo.reply / demo.invite / studio.sendTouch are Placeholders that name this card'],
  ['T57', 'ES-native voice intents pass: author Spanish intents per action instead of folding ES onto the EN template', 'a11y', '', 'Sonnet 5', 4, ['T46'], 'backlog', 'matchPhrase already canonicalises ~400 ES forms; this pass adds native phrasing where a page is Spanish-first and extends test:voice'],
  ['T58', 'qa:dpad --strict in the a11y matrix: every built route reachable by arrows only, no unreached primary CTA', 'qa', '', 'Sonnet 5', 4, ['T47', 'T32'], 'backlog', 'the hook is on every shell since changelog 0023 (D-124); make the rehearsal a gate and re-check the D-07 / K-03 skip regions'],
  ['T59', 'Admin follow-ups: A-01 / A-03 adopt DateRange (with an all option), Stat delta on the conversion tiles, A-02 lists recorded promote_variant rows', 'admin', 'A-01 A-02 A-03', 'Opus 5', 4, ['T53'], 'backlog', 'requests 4, 6, 7 of changelog 0020; D-113'],
  ['T60', 'Demo depth pass: department workspace, document editor, full calendar view, the two unwired quick actions', 'os-demo', 'C-02 C-03 C-06', 'Opus 5', 4, ['T13'], 'backlog', 'the "os-demo, a later pass" Placeholders in changelog 0021'],
];
export function seed(ctx: SeedCtx) {
  for (const [id, title, module, codes, model, phase, depends_on, status, notes, done_at] of PLAN) ctx.add('tasks', { id, title, module, codes: codes ? codes.split(' ') : [], model, phase, depends_on, status, owner: model === 'Justin' ? 'Justin' : model, notes: notes ?? '', done_at: status === 'done' ? (done_at ?? (phase === 0 ? DONE_FOUNDATION : DONE_INTEGRATION)) : null });
}
