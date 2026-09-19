import { defineSpec, type ActionDef, type PageSpec } from '../../specs/types';
import type { Role } from '../../auth/roles';
import { STAFF_ROLES } from '../../auth/roles';

export const MANUAL_ROLES: Role[] = STAFF_ROLES;

const openChapter: ActionDef = { id: 'manual.openChapter', label: 'Open chapter', intent: 'open the {chapter} chapter of the ops manual', params: { chapter: 'string' } };
const printChapter: ActionDef = { id: 'manual.print', label: 'Print', intent: 'print this chapter of the ops manual' };
const nextChapter: ActionDef = { id: 'manual.nextChapter', label: 'Next chapter', intent: 'go to the next chapter' };
const prevChapter: ActionDef = { id: 'manual.prevChapter', label: 'Previous chapter', intent: 'go to the previous chapter' };

const base = {
  roles: MANUAL_ROLES,
  data: ['prospects', 'pages', 'events', 'touches', 'bookings', 'docs/ops-manual/**'],
  integrations: ['react-markdown', 'docs/screenshots (Vite asset glob)'],
  logic: [
    'the chapter body is markdown in docs/ops-manual/<lang>/NN-slug.md; the app never stores chapter prose',
    'language follows the app toggle; a missing es/ chapter falls back to en and the header says so (R-M02)',
    'live-data directives on their own line render from the running app, never from typed prose (R-M01)',
    '[screenshot: CODE — caption] resolves docs/screenshots/CODE/1280.jpg, else a dashed placeholder naming the file',
    '> DECISION NEEDED: blocks render inline and are collected on M-01',
  ],
  components: ['Card', 'Badge', 'Button', 'Select', 'Stat', 'DataTable', 'EmptyState'],
  rules: ['R-M01', 'R-M02'],
  states: ['loading', 'chapter', 'no translation (en fallback)', 'missing chapter', 'print'],
  checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840],
};

const chapter = (code: string, name: string, purpose: string, extra: string[]): PageSpec => defineSpec({
  ...base, code, name, purpose, tone: 'list',
  layout: ['chapter head (code, part, title, summary, provenance)', 'switcher + language + prev / next + print', 'chapter body (prose, live blocks, figures, decisions)', 'prev / next footer'],
  logic: [...base.logic, ...extra],
  actions: [openChapter, nextChapter, prevChapter, printChapter],
});

export const specs: Record<string, PageSpec> = {
  home: defineSpec({
    ...base, code: 'M-01', name: 'Ops manual home', tone: 'home',
    purpose: 'How we run Lead Magnet. The chapter index with part, role and summary; every open decision collected from every chapter; the manual health (translation coverage, front-matter completeness); and chapter I rendered in place, with a "read the whole manual" mode that prints as one document.',
    layout: ['chapter head', 'switcher + language + print', 'chapter index cards', 'open decisions', 'manual health', 'chapter I (or the whole manual)'],
    logic: [...base.logic, 'open decisions are parsed from every chapter of the current language, not a hand-kept list', 'translation gaps and unrouted chapter files are surfaced as warnings (R-M02)', 'read-all renders every chapter in part order so one print gives the whole manual'],
    actions: [openChapter, printChapter, { id: 'manual.readAll', label: 'Read the whole manual', intent: 'show the whole ops manual as one page', params: { on: 'string' } }, { id: 'manual.listDecisions', label: 'List open decisions', intent: 'list the open decisions in the ops manual' }],
  }),
  intake: chapter('M-02', 'Chapter: intake & research', 'How to research a prospect and run the adaptive intake: creating the prospect, the weighted question loop, the 30 % confidence gate, and confirming or rejecting the guessed tool stack before composing anything.', ['the intake KPI block reads live prospect confidence and engine savings']),
  compose: chapter('M-03', 'Chapter: compose & publish', 'Choosing an archetype from the live ranking, previewing the real public route, the 14-day expiry rule, frozen slugs, snapshots versus recomposition, and running A/B variants honestly.', ['the archetype block scores the seeded prospects with pickArchetype() and shows the engine reasons']),
  outreach: chapter('M-04', 'Chapter: outreach & follow-up', 'Which channel fits which prospect, the four-sentence message, the fourteen-day behaviour-driven cadence, sending honestly while the transport is a placeholder, and reading the funnel without lying to yourself.', ['the channel block counts real touches per channel; the funnel KPIs read tracked events']),
  calls: chapter('M-05', 'Chapter: walkthrough calls', 'The fifteen-minute walkthrough minute by minute, the five objections and their answers, printing the proposal, and what has to be written back into the profile the same day.', ['the price band block reads priceBand() and PRICE_MONTHLY so nobody quotes from memory']),
};
