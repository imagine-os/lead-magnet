# Surfaces: routes, data, scripts, MCP / CLI / API

Update this file in the same turn as any change to a route, DataProvider method, npm script, action or API (module workers propose rows in `docs/changelog/_pending/<module>.md`).

## 1. What exists today

### 1.1 Route manifest
Published at runtime as `window.__leadmagnet = { routes: [{ path, code, surface, status: 'built' | 'stub', roles, spec }], version }` and saved by `npm run screenshots` to `docs/screenshots/routes.json`. Browse at `/#/dev` (D-01) and `/#/dev/canvas` (D-07).

| Surface | Codes | Built today |
| --- | --- | --- |
| public | HUB-01 `/`, HUB-02 `/no-access`, L-01..L-05 `/p/:slug[...]` (`/audit`, `/story`, `/letter`, `/expired`), B-01 B-02 `/book/:prospectId[...]` (`?slot=<ISO>` deep link from a landing page, any valid instant honoured), W-01..W-03 `/site[...]`, R-01 `/proposal/:prospectId` | all 13 |
| demo | C-01..C-07 `/demo/:prospectId[...]` (`/role/:slug`, `/departments`, `/comms`, `/money`, `/life`, `/settings`; role slugs unique per view, a colliding life role is `life-<slug>`) | all 7 |
| studio | S-01..S-05 `/studio[...]` (`/prospects/:id`, `/compose`, `/assets`, `/outreach`) | all 5 |
| admin | A-01..A-05 `/admin[...]` (`/prospects/:id`, `/events`, `/outreach`, `/bookings`) | all 5 |
| plan | K-01..K-04 `/plan[...]` (`/list`, `/timeline?focus=<task>`, `/tasks/:id`) | all 4 |
| dev | D-01 `/dev`, D-02 `/dev/components`, D-03 `/dev/tables[/:table]`, D-04 `/dev/actions`, D-05 `/dev/rules`, D-07 `/dev/canvas`, D-08 `/dev/qa`, D-09 `/dev/feedback` | all |
| docs | D-06 `/docs`, `/docs/pages/:code` | D-06 |
| manual | M-01..M-05 `/manual[...]` | - (T33) |

50 routes, 45 built, 5 stubs (v0.2.0).

### 1.2 Data: DataProvider
`src/data/provider.ts`; `MockProvider` today (`SEED_VERSION` 2). Tables (10): prospects, stack_guesses, pages, events, bookings (+ `contact_name`, `contact_email`, `contact_phone` since 0.2.0), assets, touches, tasks, feedback, recommendations (A-02 is its only writer). Tables written from the product now: `tasks` (K-01 / K-04 `status`, `done_at`), `pages` (S-03, A-02), `prospects` / `stack_guesses` (S-02, L-02), `bookings` (B-01 insert, A-05 status), `touches` (S-05, A-04), `assets` (S-04), `recommendations` (A-02), `events` (every page via `track()`).

| Method | Signature | Notes |
| --- | --- | --- |
| list | `list<T>(table, query?: { where, orderBy, limit, offset }): Promise<T[]>` | `where` values may be arrays (IN) |
| get | `get<T>(table, id): Promise<T \| null>` | |
| insert | `insert<T>(table, row: Partial<T>): Promise<T>` | adds `id, created_at, updated_at` |
| update | `update<T>(table, id, patch): Promise<T>` | bumps `updated_at` |
| remove | `remove(table, id): Promise<void>` | |
| subscribe | `subscribe(table \| '*', cb: (e: ChangeEvent) => void): () => void` | `insert \| update \| remove \| reset`; cross-tab via `storage` |
| peek? | `peek<T>(table, query?): T[]` | synchronous snapshot (mock only) |
| reset? | `reset(): Promise<void>` | reseed (mock only) |

Hooks: `useData()`, `useTable(name, query?)`, `useRow(name, id)`. Tracking: `track(type, meta, ctx)` -> `events` (W-03 writes `form_submit` with no prospect id; A-01 expects `prospect_id = null` rows).

Engine (pure, `src/engine`, `npm run test:engine` 11 checks): `guessStack, savings, deriveRoleViews, pickArchetype, composePage, imagePrompts, nextQuestions, applyAnswer, adaptFromEvents` plus **`slots`** since 0.2.0: `tzForProspect(p)`, `slotGrid(prospectId, tz, from?, days?)`, `previewSlots(grid, perDay?)`, `withRequested(grid, iso)`, `findSlot`, `slotInWords`, `dayLabel`, `timeLabel`, `zonedInstant`, `DURATION_MIN`. The landing `booking_inline` section, B-01 / B-02 and A-05 all import from here (D-051); T42 replaces `slotGrid` and the `bookings` insert only.

### 1.3 npm scripts (the CLI today)
| Script | What | Flags |
| --- | --- | --- |
| `dev` | vite dev server :5173 | |
| `build` | tokens -> `tsc --noEmit` -> `vite build` | |
| `preview` | serve `dist/` :4173 | |
| `typecheck` | `tsc --noEmit` (module workers run only this) | |
| `tokens` | `tokens.ts` -> `src/styles/tokens.css` | |
| `sql` | schema -> `supabase/schema.sql` + `docs/data-model.md` | |
| `test:engine` | pure engine checks (esbuild bundle) | |
| `screenshots` | Playwright captures to `docs/screenshots/<CODE>/` + `routes.json` | `--codes=`, `--only=`, `--widths=`, `--dark`, `--label=`, `--smoke`, `--port=` |
| `qa:responsive` | 7-width x 2-theme matrix -> `docs/qa/responsive-report.{md,json}` | `--codes=`, `--only=`, `--widths=`, `--themes=`, `--port=` |
| (node) `scripts/gen-page-docs.mjs` | page doc skeletons from `routes.json` | `--force` |

### 1.4 Actions manifest (the WebMCP surface and the voice vocabulary, P-05 / D-008)
Every route's `spec.actions` (`id, label, intent, permission?, params?`), published in `window.__leadmagnet.routes[].spec.actions`, browsable and runnable at `/#/dev/actions`. Handlers are registered while a page is mounted with `useActions(code, map)` and always read the latest render (D-053). 175 declared rows across 50 routes, 117 unique ids (an id shared by several pages, e.g. `booking.openDemo`, is one tool with several hosts).

| Prefix | Pages | Unique ids | Ids |
| --- | --- | --- | --- |
| `admin.*` | A-01, A-02, A-03, A-04, A-05 | 13 | `applyRecommendation`, `clearEventFilters`, `dismissRecommendation`, `filterEvents`, `filterFunnel`, `filterOutreach`, `moveTouch`, `openEventMeta`, `openFor`, `openProspect`, `openStudio`, `recordRecommendation`, `setBookingStatus` |
| `booking.*` | B-01, B-02 | 7 | `addToCalendar`, `clearSlot`, `confirm`, `openDemo`, `openPage`, `pickSlot`, `setLang` |
| `demo.*` | C-01, C-02, C-03, C-04, C-05, C-06, C-07 | 14 | `bookCall`, `filterChannel`, `goto`, `invite`, `openDepartment`, `openLifeRole`, `openPayment`, `openRole`, `openThread`, `openWidget`, `quickAction`, `reply`, `saveWorkspace`, `switchRole` |
| `dev.*` | D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09 | 15 | `canvasFit`, `canvasOpen`, `canvasThumbnails`, `canvasZoomIn`, `canvasZoomOut`, `filterRoutes`, `filterRules`, `openDoc`, `openTable`, `pickTier`, `previewRoute`, `resetDb`, `runAction`, `setFeedbackStatus`, `triageFeedback` |
| `hub.*` | HUB-01, HUB-02 | 7 | `openSurface`, `resetDemoData`, `setLang`, `signInAs`, `switchUser`, `toggleDevMode`, `toggleTheme` |
| `landing.*` | L-01, L-02, L-03, L-04, L-05 | 13 | `bookCall`, `confirmTool`, `goToStep`, `openDemo`, `pickSlot`, `playLetter`, `rejectTool`, `requestRefresh`, `saveWorkspace`, `seeCaseStudy`, `setLang`, `toggleFaq`, `viewRole` |
| `plan.*` | K-01, K-02, K-03, K-04 | 8 | `filter`, `focusTask`, `moveTask`, `openTask`, `setStatus`, `sortList`, `syncBuildPlan`, `zoomGraph` |
| `proposal.*` | R-01 | 4 | `accept`, `bookCall`, `openDemo`, `print` |
| `site.*` | W-01, W-02, W-03 | 7 | `calcSavings`, `checkout`, `choosePlan`, `openDemo`, `seeSample`, `showSample`, `startPurchase` |
| `studio.*` | S-01, S-02, S-03, S-04, S-05 | 29 | `addRole`, `answerQuestion`, `approveAsset`, `confirmTool`, `copyPageLink`, `createProspect`, `draftTouch`, `expirePage`, `fillGaps`, `filterProspects`, `generateAsset`, `markTouchSent`, `newProspect`, `openCompose`, `openProspect`, `overrideConfidence`, `pickArchetype`, `pickChannel`, `pickTemplate`, `publishPage`, `rejectAsset`, `rejectTool`, `removeRole`, `runEnricher`, `saveNotes`, `savePrompt`, `sendTouch`, `setStyle`, `setVariant` |

Placeholders in the manifest (declared, not wired): `studio.generateAsset` (T40), `studio.sendTouch`, `studio.runEnricher` (T43), `booking.addToCalendar` (T42), `site.checkout` (T51), `proposal.accept` (e-sign), `plan.syncBuildPlan` (T20 follow-up), `demo.reply` / `demo.invite` / two quick actions (comms provider, T44), `landing.seeCaseStudy` / `landing.playLetter` (content pass).

### 1.5 HTTP API
None.

### 1.6 MCP / WebMCP
None yet. Section 1.4 is the surface WebMCP tools will be generated from (T45).

## 2. Planned
### 2.1 Actions manifest -> WebMCP tools (T45)
All 45 built pages are addressable (the five admin pages, the demo, the studio and the plan joined in 0.2.0). One tool per action: `name = id`, `description = intent`, `inputSchema` from `params`, permission via `can()`; handlers are the same `registerActions` functions pages already register. Voice (T46) speaks the same intents.
### 2.2 CLI
`lm prospects list`, `lm compose <prospectId> --archetype`, `lm publish`, `lm events tail` over the same DataProvider once Supabase (T44) exists.
### 2.3 Realtime / presence (T48)
`subscribe` becomes a Supabase channel; presence rows for concurrent editing in the studio. A-01 and A-04 already re-render from `subscribe`, so they are the natural first realtime screens; K-01 lane moves next.
### 2.4 Providers behind seams
Booking (T42): `src/engine/slots.ts` `slotGrid` + the B-01 `bookings` insert are the only two things a real provider replaces. Stripe (T51): the W-03 checkout `Placeholder`. E-sign: R-01 `proposal.accept`. Comms send / payroll / invite / export / brand edit in the demo: `Placeholder`s pointing at T42 / T51 / T44 / T40. Printing is the document surface today (R-01).

### 2.5 Annotations API (T49)
`feedback` rows readable / writable by agents through the provider; pins rendered from `element_path`.

## 3. Change log of this file
- 2026-09-18 · prompt 0001 · created with the foundation manifest (50 routes), DataProvider, scripts.
- 2026-09-19 · prompt 0001 (T20 integration, changelog 0009) · 45 / 50 routes built (plan, studio, landing, os-demo, booking, admin, proposal, website); `recommendations` table + `bookings` contact columns (10 tables, `SEED_VERSION` 2); engine `slots` module; actions manifest section 1.4 (175 rows / 117 ids); `?slot=` and role-slug contracts; provider seams in 2.4.
