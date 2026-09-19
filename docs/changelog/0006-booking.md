# 0006 - Booking module (T14)

version: 0.2.0 (shipped in the 0.2.0 integration pass; module work dated 2026-09-18)
date: 2026-09-18
prompt: 0001
intent: Replace the B-01 / B-02 stubs with a working 15-minute booking flow on the mock table: slot first, details second, real `bookings` rows and real `booking_started` / `booking_confirmed` events, themed to the prospect and bilingual, so the funnel has a real bottom before a provider is wired (T42).
decision: (1) slot before details, enforced by a disabled fieldset rather than a hidden one (R-B01); (2) 15 minutes is the only duration and it is written on the row (R-B02); (3) availability is a deterministic FNV-1a hash of prospect id + day + time, not random, so the grid never shifts between renders, tabs or machines; (4) timezone is guessed from `prospects.city` and resolved with a two-pass `Intl` offset, so DST is correct with no date library; (5) contact details go into `bookings.notes` until the table gets real contact columns; (6) "Add to calendar" is a `Placeholder` (T42), never a fake download.
rejected: A date library (`date-fns-tz`, `luxon`) - `Intl.DateTimeFormat.formatToParts` gives DST-correct offsets in ~20 lines and every dependency needs a decisions row; `Math.random()` availability - it re-rolls on every render and makes screenshots and QA non-reproducible; gating the calendar behind the form - breaks R-C01; storing the picked slot only in component state - breaks P-14, so the row is inserted and B-02 reads it back by id; a single scrolling column of 196 slot buttons on desktop - the seven-day grid reads as a week.
files: src/modules/booking/index.ts, src/modules/booking/specs.ts, src/modules/booking/BookPage.tsx, src/modules/booking/ConfirmedPage.tsx, src/modules/booking/slots.ts, src/modules/booking/useNarrow.ts, src/modules/booking/booking.css, src/rules/booking.ts, docs/pages/B-01.md, docs/pages/B-02.md
codes: B-01 B-02 (stub -> built)

## What changed
- **B-01 `/book/:prospectId`** - public, own slim chrome (business wordmark linking to their landing page, timezone abbreviation, `LangToggle`), page root themed with `prospectStyle(prospect.style.palette, prospect.style.font)`.
  - Seven-day slot grid from tomorrow, 09:00-17:00 in the prospect's timezone, 15-minute steps, lunch hour blocked, weekends shown as closed. Above 900 px all seven days are columns; below it a `Chip` row picks the day and the times fill an auto-fit grid. One DOM, one set of focus targets (a local `useNarrow` hook, not duplicated markup).
  - `?slot=<iso>` preselects when that slot is still free and selects the day that contains it.
  - Details form (`Field` + `Input` + `Textarea`): name and email required, phone and note optional; the whole fieldset is `disabled` with "Pick a time above and this opens up" until a slot exists (R-B01).
  - Confirm inserts `bookings { status: 'requested', duration_min: 15, slot, page_id, notes }` and navigates to B-02 with `?booking=<id>`.
  - Tracking: `booking_started` once per session on the first pick (`trackOnce`), `booking_confirmed` on confirm with `{ slot, duration_min, booking_id }`, both with `page_id` from the prospect's live page.
  - Dev-mode note (super admin only) explains that availability is mocked and that T42 wires the provider behind the same shape.
- **B-02 `/book/:prospectId/confirmed`** - reads the row by `?booking=` (else the newest for that prospect), says the slot in words in the prospect's timezone and the current language, lists what happens next, offers the demo and their landing page, shows the booking reference. "Add to calendar" is a `Placeholder` (will: .ics plus provider link; by: T42).
- **`src/rules/booking.ts`** - R-B01 slot before details, R-B02 fifteen minutes default, R-B03 writes by id.
- Both specs carry every control as an `ActionDef` and register handlers with `useActions`; handlers read the latest render through a ref so a bus / WebMCP / voice call behaves exactly like a click.
- Strings are EN + ES for every visible string (P-13); no English in JSX.

## New and changed contracts
- **Routes** (replacing stubs at the same paths): `/book/:prospectId` (B-01, surface `public`, all roles), `/book/:prospectId/confirmed` (B-02, surface `public`, all roles).
- **Actions** (new in the manifest): `booking.pickSlot {slot}`, `booking.clearSlot`, `booking.confirm`, `booking.setLang {lang}`, `booking.openDemo` (B-01); `booking.addToCalendar`, `booking.openDemo`, `booking.openPage`, `booking.setLang {lang}` (B-02). The two stub ids (`booking.pickSlot`, `booking.confirm`, `booking.addToCalendar`) keep their ids and intents.
- **Module API** `src/modules/booking/slots.ts` (pure, importable by other modules - A-05 already uses it): `tzForProspect(p)`, `slotGrid(prospectId, tz, from?, days?)`, `findSlot(grid, iso)`, `zonedInstant(tz, y, m, d, h, min)`, `slotInWords(iso, tz, lang)`, `dayLabel`, `timeLabel`, `DURATION_MIN = 15`.
- **Strings** namespace `booking.*` (48 keys, EN + ES) including `booking.status_requested|confirmed|cancelled|completed`, which A-05 reuses.
- No new tables, no schema change, no seed change.

## Requests to foundation
1. **`bookings` needs contact columns.** B-01 collects name, email and optional phone, and today they are concatenated into `notes` so nothing is lost. Please add `contact_name text`, `contact_email text`, `contact_phone text null` to the `bookings` table (and to `supabase/schema.sql` via `npm run sql`); the page will write them directly and drop the concatenation. Until then A-05 shows `notes` in a "Who and what" column.
2. **`Select` has no combobox / search**, so the day picker is `Chip`s rather than a dropdown. No change needed now; noting it in case a longer horizon than 7 days is wanted.
3. **`Placeholder` cannot wrap a `Link`**, only a control. B-02's "Add to calendar" is therefore a `Button` inside `Placeholder` (correct today, since the real thing is a download, not a route).
4. **`SEED_VERSION` is not bumped by this module** (no seed change), but see the admin module's request: its new table forces a reseed for existing browsers.

## Proposed decisions
| # | Date | Decision | Source | Status |
| --- | --- | --- | --- | --- |
| D-0xx | 2026-09-18 | **Booking is 15 minutes, slot before details, mock availability until T42**: `bookings` rows are real from day one (status `requested`), availability is a deterministic hash so QA and screenshots are reproducible, and the provider (Cal.com / Calendly) is swapped in behind `slots.ts` without touching the pages. | prompt 0001 T14, R-B01..R-B03 | proposed |
| D-0xx | 2026-09-18 | **Prospect timezone is guessed from `prospects.city`** with a city -> IANA map, country fallback, then `America/New_York`, resolved DST-correct through `Intl` with no date dependency. A wrong guess is visible (the abbreviation is printed next to every time) and correctable by fixing the city. | src/modules/booking/slots.ts | proposed |
| D-0xx | 2026-09-18 | **Working hours for walkthroughs are 09:00-17:00 local, Monday to Friday, lunch hour blocked.** Justin to confirm, since this is our availability, not the prospect's. | prompt 0001 T14 | proposed |

## Proposed surfaces.md rows
- §1.1 Route manifest, `public` row: mark **B-01, B-02 built**; built count +2, stub count -2.
- §1.1: add `/book/:prospectId?slot=<iso>` as a documented query parameter (deep link from a landing page CTA).
- §1.4 Actions: add the nine `booking.*` actions above with page code, intent and permission.
- §2 Planned: T42 "booking provider" now has a concrete seam - `src/modules/booking/slots.ts` (`SlotGrid`, `Slot`) and the `bookings` insert; only those two are replaced.

## Kanban moves
- **T14 booking module (B-01, B-02)** - `doing` -> `done` (model: Opus 5). Build green: `npm run typecheck` clean.
- **T42 booking provider** - note added: seam is `slots.ts` + the `bookings` insert; B-01 keeps working unchanged if the provider is unavailable.
- **T31 screenshots** - B-01 and B-02 added to the queue (not captured this pass).

## Integration notes (T20, Fable 5.1, 2026-09-19)
- **`slots.ts` moved to `src/engine/slots.ts`** (pure; exported from `src/engine`): `tzForProspect`, `slotGrid`, `findSlot`, `slotInWords`, `dayLabel`, `timeLabel`, `zonedInstant`, plus new `normalizeSlotIso`, `withRequested(grid, iso)` and `previewSlots(grid, perDay)`. B-01, B-02, A-05 and the landing `booking_inline` section import from there. Two engine checks cover it (`npm run test:engine`, 11 checks).
- **`?slot=` contract**: B-01 preselects any valid instant. A slot outside the generated grid (or generated as busy) is appended to its day, marked `requested` (dashed outline + label), never silently swapped.
- **Contact columns**: `bookings.contact_name`, `contact_email`, `contact_phone` (nullable) added to `src/data/schema/core.ts`; B-01 writes them and keeps only the free-text note in `notes`; A-05 shows a "Who" column with mailto / tel links. `SEED_VERSION` bumped to 2; `supabase/schema.sql` and `docs/data-model.md` regenerated.
- Requests: `Select` combobox, `Placeholder` around a `Link` -> Backlog cards. B-01 screenshots captured.
