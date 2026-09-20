# Build plan

_The first deliverable. Tasks are bound by dependencies, not calendar days. The same tasks are seeded in `src/data/seed/plan.ts` (`tasks` table) and rendered by the K- module at `/#/plan` (Kanban, list, timeline with dependency edges)._

## Phases

| Phase | What | Model | Status |
| --- | --- | --- | --- |
| 0 | Foundation: scaffold, tokens, shell, data seam, components, engine, hub + dev tools + canvas, stubs, docs | Fable 5.1 | done (2026-09-18) |
| 1 | Modules in parallel (six workers on one branch, module contract in `CLAUDE.md`) | Opus 5 | done (2026-09-18, changelogs 0002..0008) |
| 2 | Integration: build green, code review, decisions, surfaces, push | Fable 5.1 | done (2026-09-19, v0.2.0, changelog 0009) |
| 3 | Polish passes: Spanish fill, screenshots, responsive + a11y matrix, ops manual, integration pass 2 | Sonnet 5 / Opus 5 / Fable 5.1 | done (2026-09-19, v0.3.0, changelogs 0010..0016); reruns after every phase-4 delivery |
| 4 | Providers and platform: image gen, video-on-scroll, booking, LLM enricher, Supabase, WebMCP, voice, d-pad, realtime, annotations, Company OS, Stripe | mixed; several await Justin | pass 3 (2026-09-19, v0.4.0, changelogs 0017..0023): T41 (lite), T45, T46, T47, T49, T52, T53, T22 done; reference items pass (2026-09-20, v0.5.0, changelogs 0024..0026): T55, T62 done; T48, T57, T58, T59, T60, T61, T63 backlog; T40, T42, T43, T44, T51, T54, T56, T64 await Justin; T50 blocked |

## Modules x codes x model

| Module (folder) | Codes | Scope | Model | Task |
| --- | --- | --- | --- | --- |
| `hub` | HUB-01, HUB-02 | testing hub, no-access | Fable 5.1 | T06 done |
| `dev` | D-01..D-09 | routes, components, tables, actions, rules, docs, canvas, QA preview, feedback inbox | Fable 5.1 | T06 done |
| `_stubs` | every planned code | PageStub per code | Fable 5.1 | T06 done |
| `plan` | K-01..K-04 | Kanban, list, timeline with dependency edges, task detail | Opus 5 | T10 done |
| `studio` | S-01..S-05 | prospects, profile + AI intake, composer, assets, outreach composer | Opus 5 | T11 done |
| `landing` | L-01..L-05 | Reveal / Audit / Walkthrough / Letter archetypes, sections, tracking, expired | Opus 5 | T12 done |
| `os-demo` | C-01..C-07 | tailored OS demo with role views, departments, comms, money, life, settings | Opus 5 | T13 done |
| `booking` | B-01, B-02 | book a call, confirmed | Opus 5 | T14 done |
| `admin` | A-01..A-05 | funnel, prospect timeline, events, outreach board, bookings | Opus 5 | T15 done |
| `proposal` + `website` | R-01, W-01..W-03 | client proposal view; our website home, how it works, pricing + purchase | Opus 5 | T16 done |
| `manual` | M-01..M-05 | ops manual chapters EN/ES | Opus 5 | T33 done (changelog 0011) |

## Tasks

| Id | Title | Module | Codes | Model | Phase | Depends on | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Repo scaffold + Pages deploy | foundation | - | Fable 5.1 | 0 | - | done |
| T02 | Design tokens, theme, prospect palette override | design | - | Fable 5.1 | 0 | T01 | done |
| T03 | App shell, registry, roles/session, i18n, data seam | app | HUB-02 | Fable 5.1 | 0 | T01 | done |
| T04 | Component library core with metas | components | D-02 | Fable 5.1 | 0 | T02, T03 | done |
| T05 | Personalization engine (catalog, stack guess, savings, role views, archetype picker, composer, intake) | engine | - | Fable 5.1 | 0 | T03 | done |
| T06 | Hub, dev tools, page canvas, stubs for every code | hub/dev | HUB-01 D-01..D-09 | Fable 5.1 | 0 | T04 | done |
| T07 | Docs skeleton, prompt log, decisions, kanban, plan seed | docs | - | Fable 5.1 | 0 | T01 | done |
| T10 | Plan viewer: Kanban, list, timeline with dependency edges | plan | K-01..K-04 | Opus 5 | 1 | T06, T07 | done |
| T11 | Studio: prospects, AI intake, composer, assets, outreach composer | studio | S-01..S-05 | Opus 5 | 1 | T05, T06 | done |
| T12 | Landing archetypes Reveal/Audit/Walkthrough/Letter + sections + tracking | landing | L-01..L-05 | Opus 5 | 1 | T05, T06 | done |
| T13 | Tailored OS demo with role views | os-demo | C-01..C-07 | Opus 5 | 1 | T05, T06 | done |
| T14 | Booking flow | booking | B-01 B-02 | Opus 5 | 1 | T06 | done |
| T15 | Analytics, events, outreach board, bookings admin | admin | A-01..A-05 | Opus 5 | 1 | T06 | done |
| T16 | Client proposal view + our website and pricing flow | proposal/website | R-01 W-01..W-03 | Opus 5 | 1 | T05, T06 | done |
| T20 | Integration, build green, code review, decisions, push | integration | - | Fable 5.1 | 2 | T10..T16 | done |
| T30 | Spanish fill pass | i18n | - | Sonnet 5 | 3 | T20 | done (`npm run i18n:check`, changelog 0015) |
| T31 | Screenshots at 7 widths, light/dark | qa | - | Sonnet 5 | 3 | T20 | done (every code 390 / 1280, key pages 7 widths + dark, changelog 0016) |
| T32 | Responsive + a11y QA matrix | qa | - | Sonnet 5 | 3 | T20 | done (`qa:responsive` + `qa:a11y`, fixes in changelog 0016) |
| T33 | Ops manual chapters EN/ES | manual | M-01..M-05 | Opus 5 | 3 | T20 | done (changelog 0011) |
| T21 | Integration pass 2: contrast tokens, 44 px targets, phone demo chrome, `data-component`, docs, v0.3.0 | integration | - | Fable 5.1 | 3 | T30 T31 T32 T33 T41 T45 T49 | done (changelog 0016) |
| T40 | Image generation provider wiring (prompts -> images) | assets | S-04 | Opus 5 | 4 | T11 | awaiting_justin (provider + key) |
| T41 | Video-on-scroll frame sequences from the live OS demo (T41-lite) | landing | L-01 L-03 | Opus 5 | 4 | T13 | done (`npm run frames`, D-077, changelog 0014) |
| T42 | Real booking provider (Cal.com / Calendly) | booking | B-01 | Opus 5 | 4 | T14 | awaiting_justin |
| T43 | LLM enricher for intake + copy | engine | S-02 | Fable 5.1 | 4 | T11 | awaiting_justin (model + key) |
| T44 | Supabase provider + auth | data | - | Fable 5.1 | 4 | T20 | awaiting_justin |
| T45 | WebMCP tools generated from the actions manifest | actions | D-04 | Fable 5.1 | 4 | T20 | done (136 tools, CLI, changelog 0010) |
| T46 | Voice controller over actions | a11y | HUB-01 | Fable 5.1 | 4 | T45 | done (`matchPhrase`, `test:voice` 18 checks, `CommandPalette`, changelog 0018) |
| T47 | D-pad / remote spatial navigation | a11y | - | Fable 5.1 | 4 | T20 | done (every shell hooked, `qa:dpad` rehearsal; changelogs 0018 / 0019 / 0023) |
| T48 | Realtime presence + concurrent editing | data | - | Fable 5.1 | 4 | T44 | backlog |
| T49 | Annotation pins on page + triage doc | annotations | D-09 | Opus 5 | 4 | T20 | done (changelog 0012) |
| T50 | Company OS wiring | integration | - | Fable 5.1 | 4 | T44 | blocked (until Justin says so) |
| T51 | Stripe purchase flow | website | W-03 | Opus 5 | 4 | T16 | awaiting_justin |
| T52 | Catalog pass 2: sub-industries, price review dates, the industries Justin named | engine | S-02 | Sonnet 5 | 4 | T11 | done (24 sub-industries, `price_reviewed`, 2 checks, `catalog:doc`; changelog 0022) |
| T53 | A/B readout: both live variants of a slug side by side on A-01 | admin | A-01 A-03 | Opus 5 | 4 | T15 | done (per-slug readout, sample gate, `promote_variant`, date range; changelog 0020) |
| T54 | Static prerender of `/p/<slug>` for crawler-visible OG tags | landing | L-01 L-06 | Opus 5 | 4 | T12 | awaiting_justin (D-080) |
| T22 | Integration pass 3: sortable tables, `--scale` in the library, spatial hook on every shell, sub-industry intake, objections in `composePage()`, docs, v0.4.0 | integration | - | Fable 5.1 | 4 | T46 T47 T52 T53 | done (changelog 0023) |
| T55 | Sub-industry in the engine: `guessStack()` draws from `candidateStack(p)`, `industryFor(p)` in role views / composer / image prompts / enricher, `meter` widgets, three reference sub-industries, six seeded prospects | engine | S-02 C-01..C-07 L-01..L-04 | Fable 5.1 | 4 | T52 | done (changelog 0024; D-129..D-135; the studio half moved to T61) |
| T56 | Comms provider: calls, email, SMS, WhatsApp on one number | os-demo | C-04 C-06 S-05 | Opus 5 | 4 | T44 | awaiting_justin (provider + keys) |
| T57 | ES-native voice intents pass | a11y | - | Sonnet 5 | 4 | T46 | backlog |
| T58 | `qa:dpad --strict` in the a11y matrix | qa | - | Sonnet 5 | 4 | T47 T32 | backlog (D-124) |
| T59 | Admin follow-ups: `DateRange` on A-01 / A-03, `Stat` delta tiles, A-02 lists recorded `promote_variant` rows | admin | A-01 A-02 A-03 | Opus 5 | 4 | T53 | backlog (changelog 0020 requests 4, 6, 7) |
| T60 | Demo depth pass: department workspace, document editor, full calendar, unwired quick actions | os-demo | C-02 C-03 C-06 | Opus 5 | 4 | T13 | backlog (changelog 0021) |
| T61 | Studio sub-industry surfaces: S-01 filter by sub-industry, S-02 profile editor shows the sub's depth (departments, KPIs, meter) read-only under the select | studio | S-01 S-02 | Opus 5 | 4 | T55 | backlog (the studio half of the old T55; changelog 0024 request 4) |
| T62 | `Meter` molecule; `WidgetCard` and `MiniOs` adopt it; `DemoShell`, `HeroReveal`, `OgCard` read `industryFor(prospect)`; one KPI per department on C-03; lead roles lead with the gauge | os-demo / landing / components | C-01 C-02 C-03 L-01 L-03 L-06 D-02 | Opus 5 | 4 | T55 | done (changelog 0025; D-136..D-139) |
| T63 | Engine follow-ups from CTL's replacement map: `StackGuess.kind: replaced \| partly` + `seam` sentence rendered in `savings_stack` and `stack_audit`; `departments[].kpi?` index only if a sub ever has fewer KPIs than departments | engine / landing | L-01 L-02 | Fable 5.1 | 4 | T55 | backlog (D-135) |
| T64 | Catalog price review of the 14 reference-pass tools: every `price_source_note` starting "Estimate" gets a real list-price check and a new `price_reviewed` date | engine | S-02 | Sonnet 5 | 4 | T55 | awaiting_justin (confirm or replace the 14 estimates, D-130) |

## Definition of done (per task)
`npm run typecheck` clean (module workers) / `npm run build` green (integrator); every page has a spec with actions and a page doc; every unfinished control is a `Placeholder`; strings via `useT()`; `docs/changelog/_pending/<module>.md` written; kanban / decisions / surfaces rows proposed; screenshots at 390 + 1280 for built pages; the `platform-principles.md` checklist ticked.

## Dependency rules
- A task starts when every `depends_on` is `done`; calendar days are not a dependency.
- Phase 1 modules run in parallel on one branch under the module contract; only the integrator (T20) touches shared files and pushes.
- `awaiting_justin` tasks are designed for now (interfaces, placeholders) and wired when Justin provides the provider / key / go-ahead.
- Repeated passes are expected: T30..T33 rerun after every phase 4 delivery.

## Integration outcome
_Filled by T20 (Fable 5.1, 2026-09-19, changelog 0009)._

- Seven modules merged on one branch under the module contract; no shared file was touched by a module worker (the proposal / website worker's two local commits held only its own files).
- Cross-module contracts resolved: one slot generator in `src/engine/slots.ts` (landing preview = subset of the B-01 grid, `?slot=` honoured even outside the grid), `bookings` contact columns, unique role-view slugs in the demo, `useActions` handlers reading the latest render, `I18nProvider` page defaults (a prospect page opens in the prospect's language).
- Component fixes from the requests: `Placeholder` no longer leaks `label` to the DOM, `Tabs` only points `aria-controls` at the rendered panel, `SegmentedControl` meets the 44 px floor. The rest of the requests are Backlog cards in `docs/kanban.md`.
- Gates: `npm run typecheck`, `npm run test:engine` (11 checks) and `npm run build` green; code review (medium) findings fixed; screenshots for 15 key codes at 390 / 1280; the 7-width responsive matrix in `docs/qa/responsive-report.md`.
- v0.2.0: 50 routes, 45 built, 5 stubs (M-01..M-05), 10 tables, 38 rules, 37 components, 175 declared action rows (117 ids), 31 tasks (15 done, 2 doing, 8 backlog, 5 awaiting Justin, 1 blocked). Decisions D-024..D-055 appended; the `proposed` ones need Justin.
- Next passes: T30 Spanish fill, T31 full screenshot sweep, T32 a11y matrix, T33 ops manual; T40..T51 as Justin provides providers / keys / go-aheads.

## Integration pass 2 outcome
_Filled by T21 (Fable 5.1, 2026-09-19, changelog 0016)._

- Phase 3 closed: T30 (`npm run i18n:check`), T31 (every built code at 390 / 1280, key pages at 7 widths + dark), T32 (`npm run qa:responsive` + `npm run qa:a11y`), T33 (ops manual M-01..M-05 EN / ES). Phase 4 started: T41-lite frames from the live demo, T45 WebMCP surface (136 tools) + actions CLI, T49 annotation pins; T47 spatial navigation on the hub and the demo shell.
- Cross-module fixes at the root: text / status token ladder >= 4.5:1 on both themes, `--lp-on-primary` computed per palette, DataTable row-link overlay that no longer swallows row controls, 44 px boxes on every small control, the OS demo's phone chrome at 109 px (was 291), `data-component` on all 38 component roots, `IndustryKey` derived from the catalog, `.modal-foot` wraps, `hub.tv_hint` in the hub strings.
- v0.3.0: 51 routes (all built), 11 tables, 47 rules, 38 components, 136 unique action ids (210 declared rows), 18 engine checks, 35 tasks (23 done, 1 doing, 4 backlog, 6 awaiting Justin, 1 blocked). Decisions D-056..D-092 appended (integration rows decided, module rows proposed).
- Next passes: T46 voice controller over the generated vocabulary, T47 spatial navigation on the remaining shells, T52 / T53 studio + admin follow-ups; T40, T42, T43, T44, T51, T54 as Justin provides providers / keys / go-aheads; rerun T30..T33 after every phase-4 delivery.

## Integration pass 3 outcome
_Filled by T22 (Fable 5.1, 2026-09-19, changelog 0023)._

- Phase 4 advanced: T46 voice controller (`matchPhrase` over the generated vocabulary, `CommandPalette` on every shell, never auto-listens), T47 spatial navigation on every shell with `npm run qa:dpad` as the rehearsal, T52 catalog pass 2 (24 sub-industries, dated prices, coverage checks), T53 A/B readout on A-01 with a stated sample gate; landing and OS demo pass 3; nine component-request cards closed at the root of the library.
- Cross-module fixes at the root: `DataTable` sortable headers adopted on A-03 / A-05 / K-02 / S-01; `Avatar`, `Button` icon and `Chip` follow `--scale`; `Tabs` stays inside its host; `Stat` `--stat-value-size`; `mic` / `link` icons; `--lime-700` / `--lime-650` chart tokens; `data-spatial="skip"` on the D-07 canvas and the landing role strip; the spatial hook on B-01, B-02, L-05, W-01..W-03, R-01, HUB-02; the intake asks the sub-industry (engine + S-02); the four switching objections composed for every archetype; `SEED_VERSION` 4; `npm run sql` caught up (`intake_turns`, `promote_variant`).
- v0.4.0: 51 routes (all built), 11 tables, 51 rules, 42 components, 144 unique action ids / WebMCP tools (230 declared rows after the pass-3 review put `landing.toggleFaq` on L-02..L-04; 227 at the integration commit), 21 engine checks, 20 voice checks, 42 tasks (28 done, 0 doing, 6 backlog, 7 awaiting Justin, 1 blocked). Decisions D-093..D-124 appended (module rows proposed, D-109 and the integration rows D-121..D-124 decided).
- Next: the pass-3 QA sweep (`qa:responsive`, `qa:a11y`, `qa:dpad`, `i18n:check`, screenshots, `npm run frames`), then T55, T57, T58, T59, T60 from the backlog; T40, T42, T43, T44, T51, T54, T56 as Justin provides providers / keys / go-aheads.

## Reference items outcome
_Filled by the reference items pass (Fable 5.1 study + engine + integration, Opus 5 demo depth; 2026-09-20, changelogs 0024..0026)._

- Justin's three real systems (Hoy OS, CTL OS, Petrock) were studied read-only into `docs/reference/reference-systems.md` (roles, departments, KPIs, tables, tools replaced, design systems) and mapped to three new sub-industries - `pet_care/dog_hotel_spa`, `law_firm/tenant_law`, `gym_wellness/wellness_club` - instead of rewriting the industry-level entries (D-129, D-132); no human `hospitality` key until a human-hospitality prospect exists.
- T55 closed in the engine: `industryFor(p)` resolves the sub's depth (departments, KPIs, pains, motifs, roles, capacity meter) and returns the very same industry object when there is nothing to apply, so Maya's, Daniel's and Priya's pages are byte-identical; `guessStack()` draws from `candidateStack(p)`; `WidgetKind` gains `meter`; 14 tools enter the catalog as dated estimates (114 -> 128 distinct tools, 24 -> 27 sub-industries); three fictional prospects (Camila's dog hotel, Alicia's tenant-law firm, Valeria's Spanish-first wellness club) are seeded with pages, guesses, assets, events and a booking; `SEED_VERSION` 5; engine checks 21 -> 26.
- T62 closed in the renderers: the `Meter` molecule (43rd component, `role="meter"`, host-sized through `--meter-*`), the demo shell, hero and OG card read `industryFor(prospect)`, C-03 shows one KPI per department, a lead role's home leads with the gauge.
- Integration: frames regenerated for six prospects with the new `--stride` flag so `public/frames` + `public/og` stay under 5 MB, OG cards for the three new slugs, the responsive and a11y matrices re-run on the changed codes, ops-manual chapter 02 updated in both languages, decisions D-129..D-139 (proposed) and the integration rows appended, v0.5.0.
- Next: T61 (studio sub-industry surfaces), T63 (replacement-map seam), T64 (price review of the 14 estimates, needs Justin), then T57..T60 from the backlog; a human-hospitality industry key only when Justin names a real hotel prospect.
