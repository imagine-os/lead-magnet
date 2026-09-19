# Kanban

Mirrors the `tasks` table (`src/data/seed/plan.ts`, rendered at `/#/plan`). One card per line; codes and D-/P- refs inline. Moved in the same turn as the work.

## Backlog
- T30 Spanish fill pass (Sonnet 5, after T20; P-13) - native pass on landing exit-intent / urgency lines, proposal + website long bodies, demo sample content
- T33 Ops manual chapters EN/ES (M-01..M-05, Opus 5, after T20) - the last five stub routes
- T41 Video-on-scroll frame sequences (L-01 L-03, Opus 5, after T40) - seam is `useScrollFrames(count)` in `src/modules/landing/hooks.ts`
- T45 WebMCP tools generated from the actions manifest (D-04, Fable 5.1, after T20; P-05) - 175 declared action rows (117 unique ids), handlers now read the latest render (D-053)
- T46 Voice controller over actions (Fable 5.1, after T45; P-04)
- T47 D-pad / remote spatial navigation (Opus 5, after T20; P-04)
- T48 Realtime presence + concurrent editing (Fable 5.1, after T44; P-14) - A-01 / A-04 already re-render from `subscribe`, natural first screens; lane moves on K-01 next
- T49 Annotation pins on page + triage doc (D-09, Opus 5, after T20; P-08)
- Component requests from the module pass (foundation, Fable 5.1; each one card):
  - `DataTable`: sortable headers (`headerNode` / `sortable` + `aria-sort`), column sort on A-03 / A-05 / K-02; `srOnlyHeader` for action columns
  - `Button` / `Card` / `Stat` `tone="prospect"` reading `--lp-*` with `--color-*` fallback (would remove the landing / demo / proposal overrides)
  - `Stat`: `delta` + optional sparkline; estimate / "proposed" affordance; `ReactNode` hint
  - Shared date-range control (7 / 30 / 90 days, custom) for A-01, A-03, plan and studio
  - `DeviceMockup`: contain the laptop base bleed; `fit` prop (container-type wrapper) + caption slot; `PhoneFrame` fit mode
  - `Select`: `optgroup` support; combobox / search for long lists
  - `Chip` `tone` (ghost / dashed) for unknown intake fields
  - `Field` action slot (button beside the input) without cloning into a wrapper
  - `useConfirm` / destructive-confirm pattern (S-03 "Expire now")
  - `Placeholder` that can wrap a `Link`
  - `ViewportFrame` caption / error state for a route that may 404
  - Shared `prospectById` guard ("no prospect with that id") component
  - Promote the demo's people switcher (prospect roles) into the library if a second module needs it
  - `Badge` tone for a fifth model hue (`MODEL_TONE`)
  - `Prose` / `Lede` type component for public pages
  - Shared `print.css` / `printable` shell flag for future documents
  - `recommendations.source_hash` so an identical suggestion recorded twice is provably identical
  - `plan.syncBuildPlan`: write lanes back into `docs/build-plan.md` + `docs/kanban.md` (K-01 Placeholder)

## Awaiting Justin
- T40 Image generation provider wiring: needs provider + key (S-04, Opus 5)
- T42 Real booking provider Cal.com / Calendly (B-01, Opus 5) - seam: `src/engine/slots.ts` `slotGrid` + the `bookings` insert
- T43 LLM enricher for intake + copy: needs model + key (S-02, Fable 5.1)
- T44 Supabase provider + auth (Fable 5.1) - `recommendations` and the `bookings` contact columns are in `supabase/schema.sql`
- T51 Stripe purchase flow (W-03, Opus 5) - lands on the W-03 checkout Placeholder
- Decisions marked `proposed` in `decisions.md`: D-011 default archetype, D-013 14-day expiry, D-014 price bands, D-015 fonts, D-024..D-028, D-032, D-034, D-039, D-041, D-042, D-043, D-049, D-050
- T50 Company OS wiring: blocked until Justin says so (D-016)

## Doing
- T31 Screenshots at 7 widths, light/dark (Sonnet 5) - T20 captured 15 key codes at 390 / 1280 (dark for HUB-01, L-01, C-01, K-01, A-01); the full 7-width sweep for every code remains
- T32 Responsive + a11y QA matrix (Sonnet 5) - T20 ran the 7-width responsive matrix on every route (`docs/qa/responsive-report.md`); keyboard / axe a11y matrix remains

## Done
- T20 Integration, build green, code review, decisions, surfaces, push - v0.2.0 (Fable 5.1, 2026-09-19, changelog 0009)
- T16 Client proposal view + our website and pricing flow (R-01 W-01..W-03, Opus 5, 2026-09-18, changelog 0008)
- T15 Analytics, events, outreach board, bookings admin (A-01..A-05, Opus 5, 2026-09-18, changelog 0007)
- T14 Booking flow (B-01 B-02, Opus 5, 2026-09-18, changelog 0006)
- T13 Tailored OS demo with role views (C-01..C-07, Opus 5, 2026-09-18, changelog 0005)
- T12 Landing archetypes Reveal / Audit / Walkthrough / Letter + sections + tracking (L-01..L-05, Opus 5, 2026-09-18, changelog 0004)
- T11 Studio: prospects, AI intake, composer, assets, outreach composer (S-01..S-05, Opus 5, 2026-09-18, changelog 0003)
- T10 Plan viewer: Kanban, list, timeline with dependency edges (K-01..K-04, Opus 5, 2026-09-18, changelog 0002)
- T01 Repo scaffold + Pages deploy (Fable 5.1, 2026-09-18, changelog 0001)
- T02 Design tokens, theme, prospect palette override (Fable 5.1, 2026-09-18)
- T03 App shell, registry, roles/session, i18n, data seam (HUB-02, Fable 5.1, 2026-09-18)
- T04 Component library core with metas, 36 components (D-02, Fable 5.1, 2026-09-18)
- T05 Personalization engine with 9 unit checks (`npm run test:engine`) (Fable 5.1, 2026-09-18)
- T06 Hub, dev tools D-01..D-09, page canvas D-07, stubs for every code (HUB-01, Fable 5.1, 2026-09-18)
- T07 Docs skeleton, prompt 0001, changelog 0001, decisions, kanban, plan seed (Fable 5.1, 2026-09-18)
