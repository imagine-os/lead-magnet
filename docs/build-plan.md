# Build plan

_The first deliverable. Tasks are bound by dependencies, not calendar days. The same tasks are seeded in `src/data/seed/plan.ts` (`tasks` table) and rendered by the K- module at `/#/plan` (Kanban, list, timeline with dependency edges)._

## Phases

| Phase | What | Model | Status |
| --- | --- | --- | --- |
| 0 | Foundation: scaffold, tokens, shell, data seam, components, engine, hub + dev tools + canvas, stubs, docs | Fable 5.1 | done (2026-09-18) |
| 1 | Modules in parallel (six workers on one branch, module contract in `CLAUDE.md`) | Opus 5 | done (2026-09-18, changelogs 0002..0008) |
| 2 | Integration: build green, code review, decisions, surfaces, push | Fable 5.1 | done (2026-09-19, v0.2.0, changelog 0009) |
| 3 | Polish passes: Spanish fill, screenshots, responsive + a11y matrix, ops manual | Sonnet 5 / Opus 5 | T31 / T32 doing (partial sweeps by T20), T30 / T33 backlog |
| 4 | Providers and platform: image gen, video-on-scroll, booking, LLM enricher, Supabase, WebMCP, voice, d-pad, realtime, annotations, Company OS, Stripe | mixed; several await Justin | backlog / awaiting_justin |

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
| `manual` | M-01..M-05 | ops manual chapters EN/ES | Opus 5 | T33 backlog (the last stubs) |

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
| T30 | Spanish fill pass | i18n | - | Sonnet 5 | 3 | T20 | backlog |
| T31 | Screenshots at 7 widths, light/dark | qa | - | Sonnet 5 | 3 | T20 | doing (T20: 15 codes at 390 / 1280) |
| T32 | Responsive + a11y QA matrix | qa | - | Sonnet 5 | 3 | T20 | doing (T20: responsive matrix run) |
| T33 | Ops manual chapters EN/ES | manual | M-01..M-05 | Opus 5 | 3 | T20 | backlog |
| T40 | Image generation provider wiring (prompts -> images) | assets | S-04 | Opus 5 | 4 | T11 | awaiting_justin (provider + key) |
| T41 | Video-on-scroll frame sequences from generated assets | landing | L-01 L-03 | Opus 5 | 4 | T40 | backlog |
| T42 | Real booking provider (Cal.com / Calendly) | booking | B-01 | Opus 5 | 4 | T14 | awaiting_justin |
| T43 | LLM enricher for intake + copy | engine | S-02 | Fable 5.1 | 4 | T11 | awaiting_justin (model + key) |
| T44 | Supabase provider + auth | data | - | Fable 5.1 | 4 | T20 | awaiting_justin |
| T45 | WebMCP tools generated from the actions manifest | actions | D-04 | Fable 5.1 | 4 | T20 | backlog |
| T46 | Voice controller over actions | a11y | - | Fable 5.1 | 4 | T45 | backlog |
| T47 | D-pad / remote spatial navigation | a11y | - | Opus 5 | 4 | T20 | backlog |
| T48 | Realtime presence + concurrent editing | data | - | Fable 5.1 | 4 | T44 | backlog |
| T49 | Annotation pins on page + triage doc | annotations | D-09 | Opus 5 | 4 | T20 | backlog |
| T50 | Company OS wiring | integration | - | Fable 5.1 | 4 | T44 | blocked (until Justin says so) |
| T51 | Stripe purchase flow | website | W-03 | Opus 5 | 4 | T16 | awaiting_justin |

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
