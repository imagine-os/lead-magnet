# Kanban

Mirrors the `tasks` table (`src/data/seed/plan.ts`, rendered at `/#/plan`). One card per line; codes and D-/P- refs inline. Moved in the same turn as the work.

## Backlog
- T48 Realtime presence + concurrent editing (Fable 5.1, after T44; P-14) - A-01 / A-04 already re-render from `subscribe`, natural first screens; lane moves on K-01 next
- T55 Sub-industry in the engine: `guessStack()` weights `sub[].extra_tools`, S-02 profile editor + S-01 filter by sub-industry (Opus 5, after T52; D-122 landed the intake question in 0023)
- T57 ES-native voice intents pass: Spanish intents authored per action where a page is Spanish-first, `test:voice` extended (Sonnet 5, after T46; D-099)
- T58 `npm run qa:dpad --strict` in the a11y matrix: every built route reachable by arrows only, no unreached primary CTA (Sonnet 5, after T47 + T32; D-124)
- T59 Admin follow-ups: A-01 / A-03 adopt `DateRange` (needs an `all` option), `Stat` delta on the conversion tiles, A-02 lists recorded `promote_variant` rows so a recorded recommendation cannot be lost (Opus 5, after T53; changelog 0020 requests 4, 6, 7)
- T60 Demo depth pass: department workspace, document editor, full calendar view, the two unwired quick actions - the "os-demo, a later pass" Placeholders (Opus 5, after T13; changelog 0021)
- Regenerate `public/frames/**` (`npm run frames`) whenever the OS demo's look changes, and `public/og/*.jpg` (`npm run og`) when the social card does - a QA step after every demo / landing pass, budget <= 5 MB together
- Re-read every ops-manual chapter after each phase-4 delivery (a chapter states what is real, and that changes when a provider is wired); capture M-0x screenshots each pass
- a11y residue named in `docs/qa/a11y-report.md` (colour-contrast inside decorative mini-OS compositions, D-08 preview iframes) - re-check after the next landing pass; re-run `qa:responsive`, `qa:a11y`, `qa:dpad`, `i18n:check`, screenshots (A-01, A-03, C-01..C-07, L-01..L-05, HUB-01 changed in pass 3) and `npm run frames` (the 390 phone tour now shows the stacked agenda) - the pass-3 QA sweep
- Component requests still open after pass 3 (foundation, Fable 5.1; each one card):
  - `DataTable` sort control in card mode (< 768): `sortLabels?: { asc, desc }` + a `Select` above the cards when any column is sortable (0017 leftover)
  - `Select` combobox / search for long lists (`Combobox`, listbox + typeahead)
  - `DeviceMockup`: contain the laptop base bleed; `fit` prop (container-type wrapper) + caption slot; `PhoneFrame` fit mode
  - `Chip` `tone` (ghost / dashed) for unknown intake fields
  - `ViewportFrame` caption / error state for a route that may 404
  - `Placeholder` `className` passthrough (C-04 composer targets `.placeholder.is-block` today)
  - `Icon` reading the `--scale` band itself (`size="sm|md|lg"`) so `useDemoScale()` can go; `Badge` sizes follow `--scale`
  - Shared `prospectById` guard ("no prospect with that id") component
  - Promote the demo's people switcher (prospect roles) into the library if a second module needs it
  - `MODEL_TONE` fifth entry when `MODELS` gains a fifth name (the `violet` hue is ready, D-096)
  - `Prose` / `Lede` type component for public pages
  - Shared `print.css` / `printable` shell flag for future documents
  - `recommendations.source_hash` so an identical suggestion recorded twice is provably identical
  - `plan.syncBuildPlan`: write lanes back into `docs/build-plan.md` + `docs/kanban.md` (K-01 Placeholder)
  - `dev.confirm` action so a voice / WebMCP caller can answer a `ConfirmDialog` by intent ("confirm" / "cancel")
  - Hold-to-talk on a TV remote's mic button once a remote adapter exists (after T47 hardware)

## Awaiting Justin
- T40 Image generation provider wiring: needs provider + key (S-04, Opus 5)
- T42 Real booking provider Cal.com / Calendly (B-01, Opus 5) - seam: `src/engine/slots.ts` `slotGrid` + the `bookings` insert
- T43 LLM enricher for intake + copy: needs model + key (S-02, Fable 5.1)
- T44 Supabase provider + auth (Fable 5.1) - `recommendations` and the `bookings` contact columns are in `supabase/schema.sql`
- T51 Stripe purchase flow (W-03, Opus 5) - lands on the W-03 checkout Placeholder
- T56 Comms provider: calls, email, SMS, WhatsApp on one number (C-04 C-06 S-05, Opus 5, after T44) - needs provider + keys; `demo.reply` / `demo.invite` / `studio.sendTouch` are Placeholders that name it
- T54 Static prerender of `/p/<slug>` for crawler-visible OG tags (L-01 L-06, Opus 5) - blocked on D-080
- Decisions marked `proposed` in `decisions.md`: D-011 default archetype, D-013 14-day expiry, D-014 price bands, D-015 fonts, D-024..D-028, D-032, D-034, D-039, D-041, D-042, D-043, D-049, D-050, and from pass 2 D-056..D-075, D-077..D-083 (studio tiers and A/B, WebMCP surface, ops manual, annotations weighting, frames, i18n loanwords, a11y scan posture), and from pass 3 D-093..D-108, D-110..D-120 (sortable tables, `useConfirm`, prospect tone, violet hue, `Stat.delta`, `DateRange`; voice matcher, never auto-listen, palette as voice screen, DesktopShell spatial scope; role share links, honest expiry, no invented logos, audit toggle; A/B sample gate, per-slug readout, recorded promotion, date-range vocabulary, seeded splits; stacked agenda, share this view, honest `by`, `useDemoScale`; sub-industries, module augmentation)
- D-106 sample testimonial on the proof section: keep (still labelled "Sample, not a customer") or cut - the one fabricated sentence left on a landing page (landing pass 3)
- D-108 arrow-key spatial navigation on public landing pages: at every width (shipped, matches the hub and the demo) or only at >= 1920 so arrow keys keep scrolling a long page on a laptop (landing pass 3)
- The five `> DECISION NEEDED:` blocks in the ops manual (M-01 collects them): calendar provider, automatic vs on-demand AI enrichment, A/B on one slug vs two links, which sending provider first, paid single-role pilot as a standard next step
- T50 Company OS wiring: blocked until Justin says so (D-016)

## Doing
- (empty: the pass-3 QA sweep and the final pass pick up from the Backlog)

## Done
- T22 Integration pass 3 - v0.4.0: sortable tables on A-03 / A-05 / K-02 / S-01, `--scale` in Avatar / Button icon / Chip, `Tabs` containment, `--stat-value-size`, `mic` / `link` icons, lime chart tokens, spatial hook on every shell, sub-industry intake, objections in `composePage()`, `SEED_VERSION` 4, decisions D-093..D-124, docs 0017..0023 (Fable 5.1, 2026-09-19, changelog 0023)
- T46 Voice controller over actions - `matchPhrase` + `test:voice` (18 checks), `useVoice`, `CommandPalette` on every shell, `hub.openCommands` / `hub.voiceListen` (Fable 5.1, 2026-09-19, changelog 0018)
- T47 D-pad / remote spatial navigation - `DesktopShell` scope with per-axis arrow ownership, Escape parks focus, `npm run qa:dpad` rehearsal; landing L-01..L-05, booking, website, proposal, no-access hooked (Fable 5.1 + landing Opus 5, 2026-09-19, changelogs 0018 / 0019 / 0023)
- T52 Catalog pass 2 - 24 sub-industries across 9 industries, `price_reviewed` on every tool, 2 coverage checks, `docs/reference/catalog.md` via `npm run catalog:doc` (Sonnet 5, 2026-09-19, changelog 0022)
- T53 A/B readout on A-01 - per-slug readout on one shared scale, 30-session / 10 % gate, `promote_variant` recommendation, date range, A-03 variant column + filter, seeded splits (Opus 5, 2026-09-19, changelog 0020)
- Landing pass 3 (L-01..L-05) - role share links, `<ExpiryLine>`, reversible audit, objections, checkable proof, touch exit intent, 10-foot type (Opus 5, 2026-09-19, changelog 0019)
- OS demo pass 3 (C-01..C-07) - stacked agenda under 600 px (the pass-2 calendar overflow card, closed: 0 px past the viewport at 360 / 390), Share this view + clipboard fallback, 10-foot pass, honest placeholders (Opus 5, 2026-09-19, changelog 0021)
- Component requests closed in pass 3 (Fable 5.1, 2026-09-19, changelog 0017): `DataTable` sortable headers + `aria-sort` + `srOnlyHeader`; `Button` / `Card` / `Stat` `tone="prospect"`; `Stat` `delta` + sparkline + estimate + `ReactNode` hint; `DateRange`; `Select` `groups`; `Field` action slot; `useConfirm` / `ConfirmDialog`; `Placeholder` over a `Link`; `Badge` `violet` + `outline`
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
