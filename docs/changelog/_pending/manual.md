# manual (M-01..M-05)

version: 0.3.0
date: 2026-09-19
prompt: 0003
intent: Build the ops manual (T33) as a real manual and not a placeholder: five chapters written for this product in English and Spanish, living as markdown in `docs/ops-manual/`, rendered by a reader that pulls every number the system owns out of the running app - so a chapter states judgement and method, and the app states the counts, prices, routes, scores and KPIs. Replaces the last five stub routes.
decision: (1) chapters are markdown in the repo, never prose in TSX - the manual is a document we edit as a document, and `docs/ops-manual/<lang>/NN-slug.md` is the only source; (2) **a number the system owns is never typed into a chapter** (R-M01): eight live-data directives render from `getRoutes()`, the schema, the rules registry, the component library, the engine and the seeded tables, so a chapter cannot go stale when a route or a price band changes; (3) English and Spanish are a filename pair, Spanish is a faithful translation, and a missing mirror falls back to English and *says so* rather than silently showing English (R-M02); (4) chapter files are imported lazily so each chapter is its own chunk and the manual never weighs on another surface's first paint; (5) `> DECISION NEEDED:` blocks render inline **and** are collected on M-01, making the manual's open questions a live list instead of a doc someone has to remember to update; (6) M-01 is both the table of contents and Part I, with a "read the whole manual" mode so one print produces the complete document.
rejected: prose in TSX with `useT()` keys (a manual is a document; a 400-line chapter as string keys is unreadable and unreviewable); eager-globbing the chapters like D-06 does (five chapters in every bundle for a surface most sessions never open); MDX (a new dependency, and directives keep the markdown readable in a plain editor and in the D-06 docs viewer); a `LiveBlock` that evaluates arbitrary expressions (a fixed, documented directive vocabulary is auditable - an unknown directive renders a visible warning instead of failing quietly); hand-written numbers with a "last checked" date (this is exactly the staleness P-11 exists to prevent); a separate `/manual/decisions` route (M-01 already loads every chapter, and one fewer route is one fewer place to look).
files: docs/ops-manual/{README.md,en/01-how-lead-magnet-works.md,en/02-intake-and-research.md,en/03-compose-and-publish.md,en/04-outreach-and-follow-up.md,en/05-walkthrough-calls-and-the-proposal.md,es/(same five filenames)}, src/modules/manual/{index.ts,specs.ts,chapters.ts,LiveBlock.tsx,ChapterView.tsx,ChapterNav.tsx,ChapterPage.tsx,ManualHome.tsx,manual.css}, src/rules/manual.ts, docs/pages/M-01.md..M-05.md
codes: M-01 M-02 M-03 M-04 M-05 (stub -> built)

## What changed

- **M-01 `/manual`** - chapter index (code, part, title, summary, role, updated); **open decisions** parsed from every chapter with a link back to the chapter; **manual health** (chapters, translated, front-matter completeness, open decisions) that names gaps rather than only counting them; Part I rendered in place; a "read the whole manual" toggle that renders all five chapters in part order for one print.
- **M-02..M-05 `/manual/{intake,compose,outreach,calls}`** - one chapter each: chapter head with the six front-matter keys as provenance, sticky switcher + prev / next + print, the body, and a prev / next footer naming the neighbouring chapters.
- **Five chapters, EN + ES** - I how Lead Magnet works (the ten-step funnel, who does what, an honest real-vs-mock list, the rules that never bend); II intake and research (creating a prospect, the weighted question loop, the 30 % gate and what each band is publishable as, confirming the stack); III compose and publish (the four archetypes and their risks, previewing the real route, the 14-day rule, frozen slugs, snapshots, variants as hypotheses not results); IV outreach and follow-up (six channels, the four-sentence message, a behaviour-driven fourteen-day cadence, sending honestly while the transport is a placeholder, how to read each funnel step); V walkthrough calls (a minute-by-minute fifteen-minute script, five objections with answers, printing the proposal, what gets written back the same day).
- **Live-data directives (R-M01)** - `{{stats}}`, `{{routes:<surface>}}`, `{{roles}}`, `{{prospects}}`, `{{archetypes}}`, `{{pricebands}}`, `{{channels}}`, `{{kpi:funnel|intake|outreach|calls}}`. `{{archetypes}}` runs `pickArchetype()` over the seeded prospects and shows the engine's own reasons; `{{pricebands}}` reads `priceBand()` and `PRICE_MONTHLY`, so nobody quotes a price from memory.
- **Figures** - `[screenshot: CODE — caption]` resolves `docs/screenshots/CODE/1280.jpg` through a Vite asset glob, or renders a dashed frame naming the missing file. HUB-01, S-02, S-03 and R-01 are referenced today.
- **`src/rules/manual.ts`** - R-M01 (live numbers only via directives), R-M02 (Spanish mirror required).
- **`docs/ops-manual/README.md`** - front matter contract, the chapter-to-route table, the full directive vocabulary and how to add a chapter.
- No new components: Card, Badge, Button, Select, Stat, DataTable, EmptyState only.

## New and changed contracts

- `docs/ops-manual/<lang>/NN-slug.md` is the chapter source. Front matter keys `title, role, part, version, updated, summary` are mandatory; missing keys render in the chapter header rather than failing.
- `src/modules/manual/chapters.ts` exports `MANUAL_CHAPTERS` (code -> slug -> route), `parseSegments()`, `loadChapter()`, `loadAll()`, `translationGaps()`, `unroutedSlugs()`. Adding a chapter = two markdown files + one row in `MANUAL_CHAPTERS` + one route; a file with no row is reported on M-01 instead of disappearing.
- Directive vocabulary is closed and documented. A new directive is a case in `src/modules/manual/LiveBlock.tsx` **and** a row in `docs/ops-manual/README.md`.
- `docs/screenshots/*/1280.jpg` is now imported by the app (asset glob), so those files ship in `dist/assets`. Deleting a screenshot directory breaks nothing - the figure degrades to a dashed placeholder.

## Requests to foundation

1. **`docs/screenshots` has no `M-0x` shots yet.** The page docs reference `../screenshots/M-01/390.jpg` etc. Please include the manual routes in the T31 screenshot sweep.
2. **`DataTable` has no compact / caption-visible mode.** Live blocks render their own `<figcaption>` above the table and the table's own caption stays `sr-only`, which means the accessible name is duplicated. A `captionVisible?: boolean` would let the block drop its figcaption.
3. **`Stat` has no `align` or `size="sm"`.** Seven stat tiles in a live block are taller than the surrounding prose needs; a small size would keep a `{{stats}}` block from dominating a chapter.
4. **A shared `prose` scale for long-form reading.** `.prose` is tuned for doc viewers; the manual caps line length at 72ch in its own CSS. If another long-form surface appears, that belongs in `global.css`.
5. **`react-markdown` renders no heading ids**, so a chapter cannot be deep-linked to a section. A slugging plugin (`rehype-slug`) would need a decision row; the manual does not need it yet.

## Proposed decisions

| id | date | decision | source | status |
| --- | --- | --- | --- | --- |
| D-0xx | 2026-09-19 | **Ops manual chapters live as markdown in `docs/ops-manual/<lang>/NN-slug.md`, not as strings in TSX.** The app is the reader; the repo is the source. Front matter carries the mandatory six keys (`title, role, part, version, updated, summary`). Rejected: prose in `useT()` keys (unreviewable), MDX (a dependency, and unreadable in the D-06 viewer). | T33, house pattern (Hoy chapter front matter) | proposed |
| D-0xx | 2026-09-19 | **R-M01: a number the system owns is never typed into a chapter.** Counts, routes, roles, prices, archetype scores and KPIs appear only as live-data directives rendered from the running app. Prose may explain a number, never state it. Rejected: hand-written numbers with a "last checked" date. | T33, P-11 | proposed |
| D-0xx | 2026-09-19 | **R-M02: every chapter is an `en` / `es` filename pair, and Spanish is a faithful translation, not a stub.** A missing mirror falls back to English, shows an "English fallback" badge and is listed on M-01. Rejected: shipping English-only chapters and treating Spanish as a later pass (P-13 says from the start). | T33, P-13 | proposed |
| D-0xx | 2026-09-19 | **`> DECISION NEEDED:` in a chapter is the manual's half of "Awaiting Justin".** Blocks render inline and are collected on M-01; five are open today (calendar provider, automatic vs on-demand AI enrichment, A/B on one slug vs two links, which sending provider first, paid single-role pilot as a standard next step). | T33, house pattern | proposed |

## Proposed surfaces.md rows

`### 1.1 Route manifest` - the five `manual` routes move from stub to built:

| Route | Code | Surface | Roles |
| --- | --- | --- | --- |
| `/manual` | M-01 | manual | staff |
| `/manual/intake` | M-02 | manual | staff |
| `/manual/compose` | M-03 | manual | staff |
| `/manual/outreach` | M-04 | manual | staff |
| `/manual/calls` | M-05 | manual | staff |

Actions manifest (§2.1, WebMCP vocabulary):

| id | page | intent | permission |
| --- | --- | --- | --- |
| `manual.openChapter` | M-01..M-05 | open the {chapter} chapter of the ops manual | - |
| `manual.nextChapter` | M-02..M-05 | go to the next chapter | - |
| `manual.prevChapter` | M-02..M-05 | go to the previous chapter | - |
| `manual.print` | M-01..M-05 | print this chapter of the ops manual | - |
| `manual.readAll` | M-01 | show the whole ops manual as one page | - |
| `manual.listDecisions` | M-01 | list the open decisions in the ops manual | - |

Rules registry (D-05): `R-M01`, `R-M02` added by `src/rules/manual.ts`. No new DataProvider methods, npm scripts or tables.

## Kanban moves

- **T33 Ops manual chapters EN/ES (M-01..M-05, Opus 5, after T20)** - backlog -> **done**.
- Follow-ups to add: capture M-01..M-05 screenshots in T31; re-read every chapter after each phase-4 delivery (a chapter states what is real, and that changes when a provider is wired); add the five open decisions to "Awaiting Justin".

## Verification

- `npm run typecheck` green for every file in this change set.
- Headless Chromium against `npm run dev`: `/manual` renders 7 live blocks (5 of them live tables), 5 index cards, 6 decision callouts (1 inline in Part I + 5 collected) and 1 resolved figure; `/manual/compose` renders its archetype block with live scores; switching the header toggle to ES re-renders the chapter from `es/` ("Componer y publicar"). No console errors.
- Horizontal overflow at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840: **0 px at every width**. Body type scales 14 -> 18 -> 24 -> 36 px across the `--scale` bands.
- Dark mode checked on M-04.
