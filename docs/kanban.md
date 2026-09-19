# Kanban

Mirrors the `tasks` table (`src/data/seed/plan.ts`, rendered at `/#/plan`). One card per line; codes and D-/P- refs inline. Moved in the same turn as the work.

## Backlog
- T46 Voice controller over actions (Fable 5.1, after T45; P-04) - its vocabulary exists (`docs/reference/voice-vocabulary.json`, 136 tools), the listener / matcher does not
- T48 Realtime presence + concurrent editing (Fable 5.1, after T44; P-14) - A-01 / A-04 already re-render from `subscribe`, natural first screens; lane moves on K-01 next
- T52 Catalog pass 2: sub-industries, per-industry price review dates, the industries Justin named (Sonnet 5, after T11; D-063)
- T53 A/B readout on A-01: the two live variants of a slug side by side with their own funnels (Opus 5, after T15; D-061 / D-078)
- Regenerate `public/frames/**` (`npm run frames`) whenever the OS demo's look changes, and `public/og/*.jpg` (`npm run og`) when the social card does - a QA step after every demo / landing pass, budget <= 5 MB together
- Re-read every ops-manual chapter after each phase-4 delivery (a chapter states what is real, and that changes when a provider is wired); capture M-0x screenshots each pass
- OS demo calendar widget (`.dw-week` / `.dw-day`) overflows by 25 px at 360; widen the day columns' minimum or stack under 400 px (found by the pass-2 integration, not fixed: os-demo module)
- a11y residue named in `docs/qa/a11y-report.md` (colour-contrast inside decorative mini-OS compositions, D-08 preview iframes) - re-check after the next landing pass
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
- T54 Static prerender of `/p/<slug>` for crawler-visible OG tags (L-01 L-06, Opus 5) - blocked on D-080
- Decisions marked `proposed` in `decisions.md`: D-011 default archetype, D-013 14-day expiry, D-014 price bands, D-015 fonts, D-024..D-028, D-032, D-034, D-039, D-041, D-042, D-043, D-049, D-050, and from pass 2 D-056..D-075, D-077..D-083 (studio tiers and A/B, WebMCP surface, ops manual, annotations weighting, frames, i18n loanwords, a11y scan posture)
- The five `> DECISION NEEDED:` blocks in the ops manual (M-01 collects them): calendar provider, automatic vs on-demand AI enrichment, A/B on one slug vs two links, which sending provider first, paid single-role pilot as a standard next step
- T50 Company OS wiring: blocked until Justin says so (D-016)

## Doing
- T47 D-pad / remote spatial navigation (Fable 5.1; P-04) - `useSpatialNav` + `useGamepadNav` live on HUB-01 and the demo shell, K-03 graph is `data-spatial="skip"` (changelog 0010); remaining: DesktopShell pages, landing pages, a remote rehearsal in the a11y matrix

## Done
- T21 Integration pass 2 - v0.3.0: contrast tokens, 44 px targets, phone demo chrome, `data-component` on every root, decisions D-056..D-092, docs, push (Fable 5.1, 2026-09-19, changelog 0016)
- T30 Spanish fill pass - `npm run i18n:check`, 3 real gaps fixed, 33 flags left on purpose and listed (Sonnet 5, 2026-09-19, changelog 0015)
- T31 Screenshots - every built code at 390 / 1280, dark for the six key pages, the 7-width set for HUB-01 L-01 C-01 K-03 W-01 M-01 (Sonnet 5 script, Fable 5.1 run, 2026-09-19, changelog 0016)
- T32 Responsive + a11y QA matrix - `npm run qa:responsive` + `npm run qa:a11y` on every built route, fixes at the root in 0016 (Sonnet 5 scan, Fable 5.1 fixes, 2026-09-19, changelogs 0015 / 0016)
- T33 Ops manual chapters EN/ES with live-data directives (M-01..M-05, Opus 5, 2026-09-19, changelog 0011)
- T41 Video-on-scroll frame sequences from the live OS demo, T41-lite (L-01 L-03 L-06, Opus 5, 2026-09-19, changelog 0014; D-077)
- T45 WebMCP tools generated from the actions manifest - 136 tools, actions CLI, D-04 run modal (Fable 5.1, 2026-09-19, changelog 0010)
- T49 Annotation pins on the element + enforced triage (D-09, Opus 5, 2026-09-19, changelog 0012)
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
- T04 Component library core with metas, 36 components (D-02, Fable 5.1, 2026-09-18); 38 since 0.3.0, every root tagged `data-component`
- T05 Personalization engine with 9 unit checks (`npm run test:engine`) (Fable 5.1, 2026-09-18)
- T06 Hub, dev tools D-01..D-09, page canvas D-07, stubs for every code (HUB-01, Fable 5.1, 2026-09-18)
- T07 Docs skeleton, prompt 0001, changelog 0001, decisions, kanban, plan seed (Fable 5.1, 2026-09-18)
