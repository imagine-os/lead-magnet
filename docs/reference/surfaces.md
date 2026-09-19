# Surfaces: routes, data, scripts, MCP / CLI / API

Update this file in the same turn as any change to a route, DataProvider method, npm script, action or API (module workers propose rows in `docs/changelog/_pending/<module>.md`).

## 1. What exists today

### 1.1 Route manifest
Published at runtime as `window.__leadmagnet = { routes: [{ path, code, surface, status: 'built' | 'stub', roles, spec }], version, tools, vocabulary, runAction(id, params), webmcp }` (the last four from `src/actions/webmcp.ts`, see §1.6 and `control.md`) and saved by `npm run screenshots` to `docs/screenshots/routes.json`. Browse at `/#/dev` (D-01) and `/#/dev/canvas` (D-07).

| Surface | Codes | Built today |
| --- | --- | --- |
| public | HUB-01 `/`, HUB-02 `/no-access`, L-01..L-05 `/p/:slug[...]` (`/audit`, `/story`, `/letter`, `/expired`; `?variant=A\|B` forces an A/B side), L-06 `/og/:slug` (hidden 1200x630 social card, source of `public/og/<slug>.jpg`), B-01 B-02 `/book/:prospectId[...]` (`?slot=<ISO>` deep link from a landing page, any valid instant honoured), W-01..W-03 `/site[...]`, R-01 `/proposal/:prospectId` | all 13 |
| demo | C-01..C-07 `/demo/:prospectId[...]` (`/role/:slug`, `/departments`, `/comms`, `/money`, `/life`, `/settings`; role slugs unique per view, a colliding life role is `life-<slug>`) | all 7 |
| studio | S-01..S-05 `/studio[...]` (`/prospects/:id`, `/compose`, `/assets`, `/outreach`) | all 5 |
| admin | A-01..A-05 `/admin[...]` (`/prospects/:id`, `/events`, `/outreach`, `/bookings`) | all 5 |
| plan | K-01..K-04 `/plan[...]` (`/list`, `/timeline?focus=<task>`, `/tasks/:id`) | all 4 |
| dev | D-01 `/dev`, D-02 `/dev/components`, D-03 `/dev/tables[/:table]`, D-04 `/dev/actions`, D-05 `/dev/rules`, D-07 `/dev/canvas`, D-08 `/dev/qa`, D-09 `/dev/feedback` | all |
| docs | D-06 `/docs`, `/docs/pages/:code` | D-06 |
| manual | M-01..M-05 `/manual[...]` (`/intake`, `/compose`, `/outreach`, `/calls`; chapters from `docs/ops-manual/<lang>/`) | all 5 |

51 routes, 51 built, 0 stubs (v0.3.0). `public/frames/<prospectId>/` (video-on-scroll JPEG sequences from `npm run frames`) and `public/og/*.jpg` are the static assets the public pages read; together <= 5 MB.

### 1.2 Data: DataProvider
`src/data/provider.ts`; `MockProvider` today (`SEED_VERSION` 3: 0.3.0 reseeds stale browsers, rows a person created are carried over). Tables (11): prospects, stack_guesses, pages, events, bookings (+ `contact_name`, `contact_email`, `contact_phone` since 0.2.0), assets, touches, tasks, feedback, recommendations, **`intake_turns`** (since 0.3.0: every intake answer with its source - S-02 `IntakeChat` writes it, S-02 / A-01 read it) (A-02 is its only writer). Tables written from the product now: `tasks` (K-01 / K-04 `status`, `done_at`), `pages` (S-03, A-02), `prospects` / `stack_guesses` (S-02, L-02), `bookings` (B-01 insert, A-05 status), `touches` (S-05, A-04), `assets` (S-04), `recommendations` (A-02), `events` (every page via `track()`).

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

Engine (pure, `src/engine`, `npm run test:engine` 18 checks): `guessStack, savings, deriveRoleViews, pickArchetype, composePage, imagePrompts, nextQuestions, applyAnswer, adaptFromEvents`, since 0.3.0 `stackTier` (likely / possible, D-056), `itemCost`, `paidLocations`, `CATALOG_TOOLS`, `CATALOG_TOOL_NAMES`, `INDUSTRY_KEYS` (`IndustryKey` is `keyof` the catalog, so adding an industry is one property in `catalog/industries.ts`), tuning constants `TIER_MIN_LIKELY / RARE_PREVALENCE / POSSIBLE_MIN_TEAM` plus **`slots`** since 0.2.0: `tzForProspect(p)`, `slotGrid(prospectId, tz, from?, days?)`, `previewSlots(grid, perDay?)`, `withRequested(grid, iso)`, `findSlot`, `slotInWords`, `dayLabel`, `timeLabel`, `zonedInstant`, `DURATION_MIN`. The landing `booking_inline` section, B-01 / B-02 and A-05 all import from here (D-051); T42 replaces `slotGrid` and the `bookings` insert only.

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
| `actions` | the actions CLI (`control.md` §3): `list` every WebMCP tool from the compiled specs, `export` -> `docs/reference/actions-manifest.json` + `voice-vocabulary.json`, `run <action.id>` through Playwright against `dist/` or a running server, exit 1 on `ok: false` | `list [--page CODE] [--json]`, `export`, `run <id> [--param k=v ...] [--as <role>] [--port N] [--json]` |
| `frames` | walks the live OS demo per seeded prospect and writes `public/frames/<prospectId>/{NN.jpg, desk-NN.jpg, index.json}` (24 phone + 12 desktop frames); the landing hero and walkthrough scrub them (D-077) | `--ids=`, `--quality=`, `--desk-quality=`, `--port=` |
| `og` | screenshots L-06 at 1200x630 to `public/og/<slug>.jpg` | `--slugs=`, `--quality=`, `--port=` |
| `i18n:check` | every string-table key whose `es` is missing or identical to `en`, grouped by module (proper nouns, codes, URLs, numbers exempt) | `--strict` (exit 1 on any gap), `--json`, `--module=` |
| `qa:a11y` | axe-core WCAG 2.1 AA + a 40-step keyboard walk (focus ring, 44 px target) on every built route at 390 / 1280 -> `docs/qa/a11y-report.{md,json}` | `--only=`, `--codes=`, `--widths=`, `--server=dev\|preview\|auto`, `--port=` |
| (node) `scripts/gen-page-docs.mjs` | page doc skeletons from `routes.json` | `--force` |

### 1.4 Actions manifest (the WebMCP surface and the voice vocabulary, P-05 / D-008)
Every route's `spec.actions` (`id, label, intent, permission?, params?`), published in `window.__leadmagnet.routes[].spec.actions`, browsable and runnable at `/#/dev/actions` (D-04: WebMCP status, per-action Run with a params form from the JSON Schema, voice phrase). Handlers are registered while a page is mounted with `useActions(code, map)` and always read the latest render (D-053). 179 declared rows across 51 routes, 119 unique ids on 2026-09-19 (`npm run actions -- list`; the T20 count was 175 / 50 / 117); an id shared by several pages, e.g. `booking.openDemo`, is one tool with several hosts. Static export: `docs/reference/actions-manifest.json`, `docs/reference/voice-vocabulary.json` (`npm run actions -- export`).

| Prefix | Pages | Unique ids | Ids |
| --- | --- | --- | --- |
| `admin.*` | A-01, A-02, A-03, A-04, A-05 | 13 | `applyRecommendation`, `clearEventFilters`, `dismissRecommendation`, `filterEvents`, `filterFunnel`, `filterOutreach`, `moveTouch`, `openEventMeta`, `openFor`, `openProspect`, `openStudio`, `recordRecommendation`, `setBookingStatus` |
| `booking.*` | B-01, B-02 | 7 | `addToCalendar`, `clearSlot`, `confirm`, `openDemo`, `openPage`, `pickSlot`, `setLang` |
| `demo.*` | C-01, C-02, C-03, C-04, C-05, C-06, C-07 | 14 | `bookCall`, `filterChannel`, `goto`, `invite`, `openDepartment`, `openLifeRole`, `openPayment`, `openRole`, `openThread`, `openWidget`, `quickAction`, `reply`, `saveWorkspace`, `switchRole` |
| `dev.*` | D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09 | 17 | `canvasFit`, `canvasOpen`, `canvasThumbnails`, `canvasZoomIn`, `canvasZoomOut`, `filterFeedback`, `filterRoutes`, `filterRules`, `needsJustin`, `openDoc`, `openTable`, `pickTier`, `previewRoute`, `resetDb`, `runAction`, `setFeedbackStatus`, `triageFeedback` |
| `hub.*` | HUB-01, HUB-02 | 7 | `openSurface`, `resetDemoData`, `setLang`, `signInAs`, `switchUser`, `toggleDevMode`, `toggleTheme` |
| `landing.*` | L-01, L-02, L-03, L-04, L-05, L-06 | 15 | `bookCall`, `confirmTool`, `goToStep`, `openDemo`, `openPage`, `pickSlot`, `playLetter`, `rejectTool`, `requestRefresh`, `saveWorkspace`, `seeCaseStudy`, `setLang`, `toggleFaq`, `tryAsRole`, `viewRole` |
| `manual.*` | M-01, M-02, M-03, M-04, M-05 | 6 | `listDecisions`, `nextChapter`, `openChapter`, `prevChapter`, `print`, `readAll` |
| `plan.*` | K-01, K-02, K-03, K-04 | 8 | `filter`, `focusTask`, `moveTask`, `openTask`, `setStatus`, `sortList`, `syncBuildPlan`, `zoomGraph` |
| `proposal.*` | R-01 | 4 | `accept`, `bookCall`, `openDemo`, `print` |
| `site.*` | W-01, W-02, W-03 | 7 | `calcSavings`, `checkout`, `choosePlan`, `openDemo`, `seeSample`, `showSample`, `startPurchase` |
| `studio.*` | S-01, S-02, S-03, S-04, S-05 | 38 | `addRole`, `answerQuestion`, `applyFact`, `approveAsset`, `confirmTool`, `copyPageLink`, `copyVariantLink`, `createProspect`, `dismissFact`, `draftTouch`, `duplicateProspect`, `expirePage`, `expireVariant`, `extractFacts`, `fillGaps`, `filterProspects`, `generateAsset`, `markTouchSent`, `newProspect`, `openCompose`, `openProspect`, `overrideConfidence`, `pasteFacts`, `pickArchetype`, `pickChannel`, `pickTemplate`, `publishPage`, `publishVariant`, `rejectAsset`, `rejectTool`, `removeRole`, `runEnricher`, `saveNotes`, `savePrompt`, `sendTouch`, `setStyle`, `setVariant`, `skipQuestion` |

Placeholders in the manifest (declared, not wired): `studio.generateAsset` (T40), `studio.sendTouch`, `studio.runEnricher` (T43), `booking.addToCalendar` (T42), `site.checkout` (T51), `proposal.accept` (e-sign), `plan.syncBuildPlan` (T20 follow-up), `demo.reply` / `demo.invite` / two quick actions (comms provider, T44), `landing.seeCaseStudy` / `landing.playLetter` (content pass).

### 1.5 HTTP API
None.

### 1.6 MCP / WebMCP
**Yes: one tool per unique action id, generated at runtime from §1.4 (136 tools on 2026-09-19, v0.3.0).** `src/actions/webmcp.ts` (`syncTools`, `runAction`, `webmcpStatus`) + `src/app/ControlBridge.tsx`: `name = id`, `description = intent + label + pages + permission`, `inputSchema` from `params`, `execute` = `can(permission)` -> validate -> open the host page if the handler is not live (route params from the call or the first seeded row) -> `run(id, params)` -> `{ ok, message, data?, deduped? }`. Registered through `navigator.modelContext.registerTool` when the browser has WebMCP (feature-detected, once per name); always exposed as `window.__leadmagnet.tools` / `.runAction()` / `.vocabulary` / `.webmcp` for Playwright, the CLI and voice. Idempotency guard: an identical `(id, params)` within 1.5 s returns the first result (`deduped: true`). Details and the checklist for a new action: `control.md`. No remote MCP server yet (a Node MCP server over the same manifest is a follow-up once Supabase exists, so a tool call can write real rows without a browser).

## 2. Planned
### 2.1 Actions manifest -> WebMCP tools (T45) - shipped, see §1.6
Remaining: a Node MCP server (stdio) over `actions-manifest.json` that drives a headless page or, after T44, the provider directly; `unregisterTool` on route changes if the proposal's duplicate-name rule ever bites (today names are stable per build).
### 2.2 CLI
`npm run actions -- list | export | run` exists (§1.3). Still planned: `lm prospects list`, `lm compose <prospectId> --archetype`, `lm publish`, `lm events tail` over the same DataProvider once Supabase (T44) exists.
### 2.2a Voice controller (T46, queued)
Phrase -> `voice-vocabulary.json` entry -> `window.__leadmagnet.runAction(action, slots)`; the vocabulary is generated, the listener / matcher is not. Remote / gamepad d-pad (T47): `src/a11y/useSpatialNav` + `useGamepadNav` are on HUB-01 and C-01..C-07; the remaining shells (DesktopShell pages, landing pages) queue behind a `data-spatial="skip"` pass on K-03.
### 2.3 Realtime / presence (T48)
`subscribe` becomes a Supabase channel; presence rows for concurrent editing in the studio. A-01 and A-04 already re-render from `subscribe`, so they are the natural first realtime screens; K-01 lane moves next.
### 2.4 Providers behind seams
Booking (T42): `src/engine/slots.ts` `slotGrid` + the B-01 `bookings` insert are the only two things a real provider replaces. Stripe (T51): the W-03 checkout `Placeholder`. E-sign: R-01 `proposal.accept`. Comms send / payroll / invite / export / brand edit in the demo: `Placeholder`s pointing at T42 / T51 / T44 / T40. Printing is the document surface today (R-01).

### 2.5 Annotations API (T49)
`feedback` rows readable / writable by agents through the provider; pins rendered from `element_path`.

## 3. Change log of this file
- 2026-09-18 · prompt 0001 · created with the foundation manifest (50 routes), DataProvider, scripts.
- 2026-09-19 · prompt 0001 (T20 integration, changelog 0009) · 45 / 50 routes built (plan, studio, landing, os-demo, booking, admin, proposal, website); `recommendations` table + `bookings` contact columns (10 tables, `SEED_VERSION` 2); engine `slots` module; actions manifest section 1.4 (175 rows / 117 ids); `?slot=` and role-slug contracts; provider seams in 2.4.
- 2026-09-19 · prompt 0003 (T45 + T47 groundwork, changelog 0010) · §1.1 `window.__leadmagnet` gains `tools`, `vocabulary`, `runAction`, `webmcp`; §1.3 `actions` script (list / export / run); §1.4 counts 179 / 51 / 119 + static exports; §1.6 WebMCP tools exist (119 generated at runtime, `navigator.modelContext` feature-detected, window fallback always); §2.1 / 2.2 updated, 2.2a voice controller queued; new `control.md`.
- 2026-09-19 · prompt 0003 (integration pass 2, v0.3.0, changelog 0016) · 51 / 51 routes built (manual M-01..M-05, hidden L-06); `intake_turns` table (11 tables, `SEED_VERSION` 3); engine 18 checks + `stackTier`, `itemCost`, `paidLocations`, catalog exports; scripts `frames`, `og`, `i18n:check`, `qa:a11y`; §1.4 regenerated from `npm run actions -- list --json`: 136 unique ids / 136 tools across studio (+9), landing (`tryAsRole`, `openPage`), manual (6), dev (`needsJustin`, `filterFeedback`, `runAction` params); every library component root carries `data-component`.
