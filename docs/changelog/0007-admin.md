# 0007 - Admin & analytics module (T15)

version: 0.2.0 (shipped in the 0.2.0 integration pass; module work dated 2026-09-18)
date: 2026-09-18
prompt: 0001
intent: Replace the A-01..A-05 stubs with the staff analytics surface: one funnel vocabulary with an accessible chart, a per-prospect timeline that merges every touch, event and booking and records the engine's recommendations before applying them, the raw events log with a JSON viewer, the outreach board and the bookings list - all reading and writing real rows through the provider.
decision: (1) a funnel stage counts DISTINCT sessions, not raw events, and `src/modules/admin/funnel.ts` is the single implementation every breakdown shares (R-A01); (2) an A/B comparison is withheld until two variants are live, and the page says which variants exist instead of implying a winner (R-A02); (3) a recommendation is written to a new `recommendations` table as `proposed` before any page row changes, then flipped to `applied` / `dismissed` with `decided_by` and `decided_at` (R-A03); (4) the funnel chart is an ordinal single-hue ramp whose light and dark steps were validated (monotone lightness, step gaps, light-end contrast) rather than eyeballed, with every label, value and percentage as text and a table view in a disclosure; (5) the outreach board moves with a `Select`, never a drag, and collects `scheduled` / `bounced` in an "other" column so no touch disappears.
rejected: Counting raw events per stage - one chatty page inflates `view` past `outreach_open` and the funnel stops being a funnel; a charting dependency (Recharts / d3) - one ordinal bar chart is ~30 lines of inline SVG with percentage widths and no dependency, and every dependency needs a decisions row; a dual-axis "sessions and conversion rate" chart - two scales on one axis is the classic misread, so rates live in the KPI row and the percentage column; drag-and-drop on the outreach board - drag-only breaks keyboard, touch and the coming remote (P-03, P-04); applying a recommendation straight from the on-screen suggestion - P-08 requires the decision recorded first; a rainbow palette for the five stages - the stages are ordinal, so one hue with monotone lightness steps is the only correct encoding.
files: src/modules/admin/index.ts, src/modules/admin/specs.ts, src/modules/admin/FunnelPage.tsx, src/modules/admin/ProspectTimelinePage.tsx, src/modules/admin/EventsPage.tsx, src/modules/admin/OutreachBoardPage.tsx, src/modules/admin/BookingsPage.tsx, src/modules/admin/funnel.ts, src/modules/admin/timeline.ts, src/modules/admin/admin.css, src/components/molecule/FunnelChart/{FunnelChart.tsx,FunnelChart.css,FunnelChart.meta.ts}, src/data/schema/admin.ts, src/data/seed/admin.ts, src/rules/admin.ts, docs/pages/A-01.md, docs/pages/A-02.md, docs/pages/A-03.md, docs/pages/A-04.md, docs/pages/A-05.md
codes: A-01 A-02 A-03 A-04 A-05 (stub -> built)

## What changed
- **A-01 `/admin` funnel overview** - archetype and warmth `Chip` filters; a seven-tile KPI row (prospects, live pages, page views, demo opens, bookings, view→demo, demo→booking); the five stages as a `FunnelChart` with a `DataTable` table view; the same five stages by archetype and by warmth; A/B by `pages.variant` guarded by R-A02; the last twelve events with icons, summaries and prospect links.
- **A-02 `/admin/prospects/:id` prospect timeline** - header with the prospect's own primary colour, confidence bar and shortcuts (studio, demo, page, booking); `adaptFromEvents(page, events, prospect)` as recommendation cards showing kind, target, reason, score and recorded state with Apply / Record / Dismiss; the merged timeline of every `touches`, `events` and `bookings` row, newest first, with type icons, meta summaries, session ids and status badges. Applying a `switch_archetype` recommendation recomposes `pages.model` with `composePage()` (real stack guesses passed in) and writes `archetype` + `model` by id; the other three kinds are `Placeholder`s (by T12 / T11) while Record and Dismiss stay real.
- **A-03 `/admin/events` events log** - four `Select` filters (type, page, session, prospect) AND-combined, a dense `DataTable` newest-first, and a `Drawer` with the pretty-printed `meta` JSON plus ids; both the row click and a Raw button open it, so nothing is hover-only.
- **A-04 `/admin/outreach` outreach board** - channel filter; columns draft / sent / opened / clicked / replied / other; touch cards with channel icon, warmth, subject, body preview, prospect and page links, timestamps, and a "Move to" `Select` gated by `can('prospects.write')`. Moving forward stamps the missing `sent_at` / `opened_at` / `clicked_at` and never clears an earlier stamp.
- **A-05 `/admin/bookings`** - counts, upcoming and past tables, the slot rendered with the booking module's `slotInWords()` in the prospect's timezone and the current language (the same string the prospect saw on B-02), and a status `Select` writing by id.
- **New component `FunnelChart` (molecule)** with meta and a usage: ordinal one-hue ramp, horizontal bars on a shared hairline baseline, 16 px thick, 4 px rounded data-end and a squared baseline end, per-bar `<title>` for pointer hover, `aria-hidden` SVG with all numbers as text, and a table view slot.
- **New table `recommendations`** (`src/data/schema/admin.ts`) + two seeded rows (`src/data/seed/admin.ts`, order 5): one `proposed`, one `dismissed`, so both states are visible on first load.
- **`src/rules/admin.ts`** - R-A01 funnel vocabulary, R-A02 A/B needs both variants, R-A03 record before apply.
- Every control is an `ActionDef` registered with `useActions`; handlers read the latest render through a ref. Strings are EN + ES (`admin.*`, 120 keys); the four booking status labels are reused from the `booking.*` table.

## New and changed contracts
- **Routes** (replacing stubs at the same paths, surface `admin`, `STAFF_ROLES`, stub nav entries kept): `/admin` (A-01, nav Funnel / chart / 1), `/admin/prospects/:id` (A-02, no nav), `/admin/events` (A-03, nav Events / list / 2), `/admin/outreach` (A-04, nav Outreach / mail / 3), `/admin/bookings` (A-05, nav Bookings / calendar / 4).
- **New table `recommendations`** (group `pages`): `prospect_id -> prospects`, `page_id -> pages`, `kind enum(switch_archetype|add_section|shorten|ask)`, `to_archetype enum(archetypes) null`, `section text null`, `reason text`, `score numeric`, `status enum(proposed|applied|dismissed)`, `decided_by text`, `decided_at timestamptz null`, `note text`. Regenerate `supabase/schema.sql` and `docs/data-model.md` with `npm run sql`.
- **Actions** (new in the manifest): `admin.filterFunnel {archetype,warmth}`, `admin.openProspect {prospect}`, `admin.openStudio` (A-01); `admin.applyRecommendation {n}`, `admin.recordRecommendation {n,note}`, `admin.dismissRecommendation {n}`, `admin.openFor {surface}` (A-02); `admin.filterEvents {type,page,session,prospect}`, `admin.clearEventFilters`, `admin.openEventMeta {id}` (A-03); `admin.moveTouch {touch,status}`, `admin.filterOutreach {channel}` (A-04); `admin.setBookingStatus {id,status}` (A-05). The four stub ids (`admin.filterFunnel`, `admin.applyRecommendation`, `admin.moveTouch`, `admin.setBookingStatus`) keep their ids and intents; `admin.filterFunnel` gained a `warmth` param.
- **Module API** `src/modules/admin/funnel.ts` (pure): `FUNNEL_STAGES`, `STAGE_KEY`, `countSessions(events)`, `groupSessions(events, keyOf)`, `rate`, `pctLabel`, `isFunnelStage`. `src/modules/admin/timeline.ts`: `EVENT_ICON`, `CHANNEL_ICON`, `when(iso)`, `eventSummary(event)`, `buildTimeline(events, touches, bookings)`.
- **Component library** +1: `FunnelChart` (molecule, `usedBy: ['A-01']`).
- **Cross-module import**: A-05 imports `tzForProspect` / `slotInWords` from `src/modules/booking/slots.ts` so a slot never reads differently to staff and to the prospect. Both modules land in the same pass; if they are ever split, that helper should move to `src/engine` or a shared util - **integrator's call**.

## Requests to foundation
1. **Bump `SEED_VERSION`.** The new `recommendations` table means an existing `leadmagnet.db.v1` payload fails `MockProvider.load()`'s table check and reseeds automatically (rows a person created are carried over by `carryOver()`), but bumping `SEED_VERSION` makes that intentional rather than incidental.
2. **`docs/data-model.md` and `supabase/schema.sql` need regenerating** (`npm run sql`) for `recommendations`.
3. **`Stat` has no delta / sparkline slot.** The two conversion tiles carry a hint line instead of a signed delta versus a previous period. When the funnel gets a date range (below), `Stat` will want `delta` and an optional 12-point sparkline.
4. **No date-range control exists.** A-01 and A-03 currently read all events. A shared range control (7 / 30 / 90 days, custom) belongs in the library, not in this module - it is needed by the plan and studio surfaces too.
5. **`DataTable` has no column sort.** A-03 is fixed to newest-first and A-05 to slot order. Sorting is the obvious next want on both.
6. **`bookings` contact columns** - see the booking module's request; A-05 shows `notes` in a "Who and what" column until then.
7. **`recommendations` could carry `source_hash`** so the same suggestion recorded twice is provably identical. Today identity is `kind|to|section` per page, which is enough for the four current kinds.

## Proposed decisions
| # | Date | Decision | Source | Status |
| --- | --- | --- | --- | --- |
| D-0xx | 2026-09-18 | **A funnel stage counts distinct sessions**, not raw events, and `FUNNEL_STAGES` (`outreach_open -> view -> demo_open -> booking_started -> booking_confirmed`) is the only stage vocabulary; every breakdown (archetype, warmth, variant) shares the same counting code. | R-A01, prompt 0001 T15 | proposed |
| D-0xx | 2026-09-18 | **A/B is not shown until two variants are live**; the page names the live variants instead of implying a winner, and rates are always shown with their session counts. | R-A02, P-15 | proposed |
| D-0xx | 2026-09-18 | **Engine recommendations are rows before they are actions**: new `recommendations` table, written as `proposed` with reason, score and decider before any page changes, then `applied` / `dismissed` with `decided_at`. Nothing changes a live page on the strength of an on-screen suggestion alone. | R-A03, P-08, P-11 | proposed |
| D-0xx | 2026-09-18 | **Charts are hand-built inline SVG against the token ramps, with no charting dependency**: ordinal data gets one hue with monotone lightness steps validated per theme; categorical data would get the fixed slot order; never a dual axis; every value is also text and every chart has a table view. | dataviz method, P-02 | proposed |
| D-0xx | 2026-09-18 | **Board columns are moved with a `Select`, never a drag** (draft / sent / opened / clicked / replied, with `scheduled` and `bounced` collected in "other" so no row disappears). | P-03, P-04 | proposed |

## Proposed surfaces.md rows
- §1.1 Route manifest, `admin` row: mark **A-01..A-05 built**; built count +5, stub count -5.
- §1.2 Data: add `recommendations` to the table list (10 tables) and note that A-02 is its only writer today.
- §1.4 Actions: add the thirteen `admin.*` actions above with page code, intent and permission.
- §2 Planned: T45 (WebMCP) gains five more addressable pages; T48 (realtime / presence) should note that A-01 and A-04 already re-render from `subscribe`, so they are the natural first realtime screens.

## Kanban moves
- **T15 admin & analytics module (A-01..A-05)** - `doing` -> `done` (model: Opus 5). Build green: `npm run typecheck` clean.
- **T31 screenshots** - A-01..A-05 added to the queue (not captured this pass).
- **T44 Supabase** - note added: `recommendations` is in the generated schema; A-02's writes are already `insert` / `update` by id.

## Integration notes (T20, Fable 5.1, 2026-09-19)
- `SEED_VERSION` bumped to 2 (`recommendations` + `bookings` contact columns); `npm run sql` regenerated `supabase/schema.sql` (10 tables) and `docs/data-model.md`.
- A-05 imports `slotInWords` / `tzForProspect` from `src/engine/slots.ts` (the cross-module import the module flagged is resolved: the helper lives in the engine now) and shows the new contact columns ("Who": name, mailto, tel) next to the note.
- Requests: `Stat` delta / sparkline, shared date-range control, `DataTable` column sort, `recommendations.source_hash` -> Backlog cards. A-01 screenshots captured.
