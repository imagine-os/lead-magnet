# 0003 - Studio (S-01..S-05)

version: 0.2.0 (shipped in the 0.2.0 integration pass; module work dated 2026-09-18)
date: 2026-09-18
prompt: 0001
intent: Build the strategist's workbench (T11): the prospects list with a real create flow, the adaptive AI intake that raises confidence answer by answer, the page composer with the archetype ranking and the 14-day publish, the image-prompt board, and the outreach composer - so a prospect can go from "a name in a spreadsheet" to "a published, themed workspace with a message pointing at it" without leaving the app.
decision: (1) the intake is the confidence loop, not a form - `nextQuestions()` renders as fields and `applyAnswer()` is the only write path (R-S03); (2) publishing is gated at 30 % confidence with an explicit, recorded override (R-S01); (3) pages expire 14 days after publish and expiry keeps the snapshot (R-S02, D-013 proposed); (4) the composer previews the *real* public route in a ViewportFrame rather than re-rendering sections in the studio, so the studio never becomes a second renderer; (5) the slug is frozen by the existing page row so a published link never moves; (6) outreach ships 13 templates across 6 channels in EN + ES with prospect tokens, and sending stays a Placeholder while "mark as sent" keeps the demo funnel honest.
rejected: a wizard (one step per field) - the intake must stay re-enterable and order-free; recomputing the PageModel at render time on the landing side - `pages.model` is the snapshot (D-010); a rich-text editor for outreach - plain text is what these channels actually send, and it keeps tokens visible; auto-generating images on first visit - the provider is not wired (D-017), so a Placeholder is the honest control; a drag-and-drop role editor - P-03 forbids drag-only interactions.
files: src/modules/studio/{index.ts,specs.ts,lib.ts,templates.ts,ProspectNav.tsx,ProspectsPage.tsx,ProspectProfilePage.tsx,ComposePage.tsx,AssetsPage.tsx,OutreachPage.tsx,studio.css}, src/rules/studio.ts, docs/pages/S-01.md..S-05.md, docs/changelog/_pending/studio.md
codes: S-01 S-02 S-03 S-04 S-05 (stub -> built)

## What changed

- **S-01 `/studio`** - prospects with warmth, confidence bar, live page (archetype + status + days left), last event and booking status; warmth / industry / live-page filters; a KPI row; a "New prospect" Modal that inserts the row with industry-catalog roles and the default palette, inserts `guessStack()` rows, and lands on the intake.
- **S-02 `/studio/prospects/:id`** - palette swatches and tone header, confidence meter, what-we-know vs unknown, the adaptive intake (up to four highest-weight unknowns, one control per field type), stack guesses with confirm / reject and live savings totals, a roles editor, a style editor with five colour pickers and a themed mini preview, research notes, the rule enricher, and "Enrich with AI" as a Placeholder (T43).
- **S-03 `/studio/prospects/:id/compose`** - the four archetypes as cards with score bars and the reasons from `pickArchetype()`, a SegmentedControl picker, an A/B variant field, the real public route previewed at 390 and 1280 in `ViewportFrame`, publish / republish / expire, copy link, and the R-S01 confidence gate with an override toggle.
- **S-04 `/studio/prospects/:id/assets`** - `imagePrompts()` materialised as `assets` rows on first visit, grouped by kind, each prompt editable with its aspect and notes, status counts, approve / reject, and Generate as a Placeholder (T40).
- **S-05 `/studio/prospects/:id/outreach`** - 13 templates across cold email, LinkedIn DM, WhatsApp, SMS, call script and warm intro, EN + ES, tokens filled from the profile, `savings()` and the live page URL; editable subject and body; a preview; Draft inserts a `touches` row; Send is a Placeholder; "Mark as sent" writes `sent_at` for the demo funnel; touch history table.
- **`src/rules/studio.ts`** - R-S01 (publish gate), R-S02 (14-day expiry, exporting `PAGE_TTL_DAYS`, `MIN_PUBLISH_CONFIDENCE`, `expiresAtFrom()`), R-S03 (every write by id).
- Strings: 200+ keys in EN and ES (`studio.*`), including every enum label (warmth, archetype, page / asset status, booking, source, channel, touch status, guess status, tone, font, revenue band, palette slot, asset kind, intake field).
- No new components: the pages are built from the existing library (DataTable, Modal, Card, Field, Input, Select, Textarea, Toggle, Chip, Badge, Button, ProgressBar, Stat, SegmentedControl, ViewportFrame, Placeholder, EmptyState, Avatar, Toast).

## New and changed contracts

- Route paths unchanged from `_stubs`; the five studio stubs are replaced in place (registry: built beats stub).
- `src/rules/studio.ts` exports `MIN_PUBLISH_CONFIDENCE = 0.3`, `PAGE_TTL_DAYS = 14`, `expiresAtFrom(published?: Date): string` - other modules (landing L-05, admin A-02) should import these rather than re-hardcoding 14.
- `src/modules/studio/lib.ts` exports `ARCHETYPE_PATH` / `publicPath(archetype, slug)` / `publicUrl(...)` - the single place that knows which public route each archetype renders on. **If the landing module changes those paths, change them here too.**
- First publish writes `pages` twice (insert, then update with the composed `model`) because the `PageModel` snapshot embeds its own page id.
- `assets` rows for a prospect are created lazily by S-04 from `imagePrompts()` when none exist.

## Requests to foundation

1. **`ViewportFrame` needs a `title` / caption override for a route that may 404.** Today a preview of an unpublished slug shows whatever the landing route renders. A `state` or `onError` hook (or just a documented "the frame shows the app, not a guarantee") would let S-03 label the frame honestly.
2. **`DataTable` cannot mark a column header as decorative.** The action column needs a visible header for `th` semantics; a `srOnlyHeader?: boolean` would keep the table honest without a visually empty heading.
3. **`Chip` has no `tone`.** S-02 marks unknown fields with a dashed border through a module class; a `tone="ghost"` (or `variant`) on the atom would remove that override.
4. **`Field` clones `required` / `invalid` into its single child**, so a wrapper element cannot be the child. S-02 therefore puts the Save button beside the Field rather than inside it. A `Field` with an `action` slot would read better.
5. **No `useConfirm` / destructive-confirm pattern.** "Expire now" is a one-click destructive action today; a confirm affordance in the library would be safer.
6. **A shared `prospectById` guard** (the "no prospect with that id" state) is repeated in four studio pages; if another module needs it, it belongs in the library.

## Proposed decisions

| id | date | decision | source | status |
| --- | --- | --- | --- | --- |
| D-024 | 2026-09-18 | **Publishing needs 30 % confidence or an explicit override** (R-S01). A page composed from a profile we barely know reads as spam; the override is deliberate and surfaced in the toast. | studio T11 | proposed |
| D-025 | 2026-09-18 | **The studio never renders landing sections itself**: S-03 previews the real public route in a same-origin frame, so there is exactly one renderer per archetype. | studio T11 | proposed |
| D-026 | 2026-09-18 | **A published slug is frozen**: republishing reuses `pages.slug`; only the first publish derives it from `slugify(business-city)`. | studio T11 | proposed |
| D-027 | 2026-09-18 | **Outreach sending stays unwired; "mark as sent" is an explicit demo action** that says so in its toast, so the funnel numbers are never silently fake. | studio T11, D-017 | proposed |
| (confirm) | | **D-013 (pages expire 14 days after publish)** is now implemented in code as `PAGE_TTL_DAYS` - it needs Justin's confirmation to move from proposed to decided. | conversion playbook 8 | awaiting Justin |

## Proposed surfaces.md rows

Route manifest (section 1.1) - the studio row becomes built:

| Surface | Codes | Built today |
| --- | --- | --- |
| studio | S-01 `/studio`, S-02 `/studio/prospects/:id`, S-03 `/studio/prospects/:id/compose`, S-04 `/studio/prospects/:id/assets`, S-05 `/studio/prospects/:id/outreach` | all five |

Actions (WebMCP surface / voice vocabulary) - 29 new actions:

| Action id | Page | Intent | Permission |
| --- | --- | --- | --- |
| `studio.newProspect` | S-01 | create a prospect | `prospects.write` |
| `studio.createProspect` | S-01 | create {business} in {industry} | `prospects.write` |
| `studio.filterProspects` | S-01 | show {warmth} prospects in {industry} | - |
| `studio.openProspect` | S-01 | open prospect {name} | - |
| `studio.answerQuestion` | S-02 | answer {field} with {value} | `prospects.write` |
| `studio.confirmTool` | S-02 | confirm {tool} | `prospects.write` |
| `studio.rejectTool` | S-02 | reject {tool} | `prospects.write` |
| `studio.addRole` | S-02 | add the {role} {kind} role | `prospects.write` |
| `studio.removeRole` | S-02 | remove the {role} {kind} role | `prospects.write` |
| `studio.setStyle` | S-02 | set {key} to {value} | `prospects.write` |
| `studio.saveNotes` | S-02 | save the research notes | `prospects.write` |
| `studio.fillGaps` | S-02 | fill the obvious gaps with the rule enricher | `prospects.write` |
| `studio.runEnricher` | S-02 | enrich this prospect | `prospects.write` |
| `studio.openCompose` | S-02 | compose the page | `pages.publish` |
| `studio.pickArchetype` | S-03 | use the {archetype} archetype | `pages.publish` |
| `studio.setVariant` | S-03 | set the variant to {variant} | `pages.publish` |
| `studio.overrideConfidence` | S-03 | publish anyway under 30 % confidence | `pages.publish` |
| `studio.publishPage` | S-03 | publish the page | `pages.publish` |
| `studio.expirePage` | S-03 | expire the page | `pages.publish` |
| `studio.copyPageLink` | S-03 | copy the public link | - |
| `studio.generateAsset` | S-04 | generate the {kind} image | - (Placeholder) |
| `studio.savePrompt` | S-04 | save the prompt for {asset} | `prospects.write` |
| `studio.approveAsset` | S-04 | approve {asset} | `prospects.write` |
| `studio.rejectAsset` | S-04 | reject {asset} | `prospects.write` |
| `studio.pickChannel` | S-05 | write a {channel} message | - |
| `studio.pickTemplate` | S-05 | use the {template} template | - |
| `studio.draftTouch` | S-05 | draft a {channel} message | `prospects.write` |
| `studio.sendTouch` | S-05 | send the message | - (Placeholder) |
| `studio.markTouchSent` | S-05 | mark {touch} as sent | `prospects.write` |

Rules registry (D-05): `R-S01`, `R-S02`, `R-S03` added by `src/rules/studio.ts`.

No new DataProvider methods, npm scripts or tables.

## Kanban moves

- **T11 Studio: prospects, AI intake, composer, assets, outreach composer (S-01..S-05, Opus 5)** - doing -> done.
- Follow-ups to add: capture S-01..S-05 screenshots in T31; wire the LLM enricher into the S-02 button in T43; wire the image provider into S-04 Generate in T40; wire a channel provider into S-05 Send.

## Verification

- `npm run typecheck` green (studio files compile; no unused locals).
- Runtime smoke (headless Chromium against `npm run dev`): all five routes render; create-prospect inserts the row plus 13 stack guesses and navigates to the intake; answering an intake question raises confidence; the composer shows four ranked archetypes and two live preview frames; S-04 materialises 11 prompts with 11 Placeholder-wrapped Generate buttons; S-05 fills every token and drafts a touch row. No studio-originated console errors.
- Horizontal overflow checked at 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840: 0 px at every width on every studio route.

## Integration notes (T20, Fable 5.1, 2026-09-19)
- Merged as-is. The proposed D-024..D-027 in this file were renumbered on merge to D-028..D-031 (the plan module's rows took D-024..D-027; numbered rows are never renumbered once in `decisions.md`).
- Requests (ViewportFrame caption, `DataTable` sr-only header, `Chip` tone, `Field` action slot, `useConfirm`, shared `prospectById` guard) -> Backlog cards in `docs/kanban.md`.
- `PAGE_TTL_DAYS` / `expiresAtFrom` are the one source of the 14-day rule; `R-C05` in `src/rules/core.ts` is now `implemented` (D-034). Screenshots S-02 / S-03 captured.
