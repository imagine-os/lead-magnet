# Platform principles (P-01..P-15, binding)

Adapted from the imagine-os house pattern (Petrock) for Lead Magnet on 2026-09-18. Each principle says what is true _Today_ (v0.1.0 foundation) and what is _Queued_. Ids are append-only.

## P-01 Phone to 4K TV
Every page works at 360, 390, 768, 1280, 1920, 2560 and 3840. Body text is at least 16 px at 1920 and above; type and spacing scale up per width band through `--scale` on `:root` (1.125 at >= 1920, 1.5 at >= 2560, 2.25 at 3840), never per page. Focus rings and selection states are visible from across a room (3 px ring, high-contrast token, never colour alone). Nothing is pinned to a 390 or 1440 design width; centred max-width layouts are fine, tiny centred layouts on a TV are not.
_Today:_ `--scale` bands in `tokens.ts`; `.container` 1280 / `.container-wide` 1680; `spec.checkedAt` records widths verified; `npm run qa:responsive` covers all seven widths. _Queued:_ T31 / T32 fill `docs/qa` and `checkedAt` for every page.

## P-02 One design system, tokens only
`src/design/tokens.ts` is the single source; `tokens.css` is generated. Components use tokens only; pages use components only. Prospect theming overrides `--lp-*` custom properties on a page root, never the tokens.
_Today:_ Imagine ink / electric palette, light + dark, `prospectStyle()`. _Queued:_ per-prospect font loading beyond the four families.

## P-03 Inputs now: keyboard, mouse, trackpad, touch, pen
Every interactive element is reachable and operable by keyboard in a sensible focus order with a visible focus state (never `outline: none` without a replacement). Touch targets are at least 44 x 44 px. Hover is never the only affordance: anything shown on hover is also shown on focus and reachable on touch (`@media (pointer: coarse)`). No drag-only interaction: drag and drop always has a click / keyboard alternative.
_Today:_ `:focus-visible` 3 px ring; Button 44 / 48 / 56; Placeholder and Tooltip show on focus; canvas D-07 pans with arrows and scrollbars as well as drag. _Queued:_ a11y scan in QA (T32).

## P-04 Inputs next: remote / gamepad d-pad, voice
Never design against them: one obvious primary action per screen, no focus traps, spatial focus order that makes sense on a grid, every action addressable by an intent phrase.
_Today:_ actions carry `intent`; layouts are grids. _Queued:_ `useSpatialNav` (T47), voice controller over actions (T46).

## P-05 Actions manifest
A page's buttons, menu items and form submits are its actions (`PageSpec.actions: ActionDef[]` with `id, label, intent, permission?, params?`). A new button without an action entry is incomplete; removing a button removes its entry in the same commit. While mounted the page registers handlers on the actions bus; `/#/dev/actions` lists every action with page, permission and handler-live. The manifest is the WebMCP surface (one tool per action) and the voice vocabulary. Actions are idempotent, take ids not screen positions, return a readable result.
_Today:_ `src/actions`, D-04, every spec has actions. _Queued:_ WebMCP tools generated from the manifest (T45).

## P-06 Roles and permissions
Pages call `can(permission)`; permissions are strings mapped per role; role guards stay real, only identity is mocked (`RoleSwitcher`, view-as, dev mode for super_admin only).
_Today:_ five roles, thirteen permissions. _Queued:_ Supabase auth (T44).

## P-07 Component library is a first-class asset
`src/components/<tier>/<Name>/` with `defineMeta` and at least one usage; `/#/dev/components` renders all. Never hand-roll a table, button, input, modal or card inside a page.
_Today:_ 36 components. _Queued:_ D-02 gap matrix (usedBy vs spec.components).

## P-08 Annotations on the product
Testers comment, request and report bugs from the product itself (`FeedbackButton` -> `feedback` rows with kind, element_path, component, viewport, theme). Agents triage from the store: read `status = new`, decide fix vs ask by author weight and kind, write `triage`, `triage_note`, `decision_ref` before changing anything, then fix the same turn with docs or set `status = waiting` and add to open questions.
_Today:_ FeedbackButton on staff pages, D-09 inbox with triage fields. _Queued:_ pins on the page + `docs/reference/annotations-triage.md` (T49).

## P-09 Placeholders, never silent controls
Any UI that does not work yet uses `Placeholder`: tooltip on hover and focus ("Not wired yet: <what it will do>"), toast on activation, dashed outline + badge always visible in dev mode, `data-placeholder` attribute. `spec.notes` names the module that will build the real thing.
_Today:_ Placeholder atom; PageStub uses it for every declared action. _Queued:_ QA count of placeholders per page.

## P-10 Surfaces documented every pass
`docs/reference/surfaces.md` records routes, DataProvider, npm scripts, HTTP API, MCP / WebMCP: what exists and what is planned. Updated in the same turn as any change.
_Today:_ 1.1..1.5 + 2 Planned. _Queued:_ CLI (T45), realtime (T48).

## P-11 Docs same turn, memory always current
Every prompt (verbatim), reply, changelog, decision, kanban move and page doc lands in the repo in the same turn as the work. `docs/README.md` is the start-here map. Numbered files are append-only.
_Today:_ prompt 0001, changelog 0001, kanban, decisions, page docs for every code. _Queued:_ nothing; this is a habit.

## P-12 Hub: view as any role, dev mode on / off
Each project ships website, customer (prospect) app, staff dashboards, docs, ops manual, dev tools and a testing hub; until real auth, view as any role with dev mode on / off. Demo simulator: PhoneFrame + ViewportFrame; page canvas with zoom laying out every page.
_Today:_ HUB-01, D-07 canvas, D-08 QA preview. _Queued:_ role home pages as modules land.

## P-13 English and Spanish from the start
`useT()` with `{ en, es? }`; `LangToggle` on every surface; engine copy carries `{ en, es }`. Spanish fill is a pass (Sonnet-class), never a blocker.
_Today:_ hub, engine sections bilingual. _Queued:_ T30 Spanish fill.

## P-14 Multiplayer-ready data
Expect realtime data, presence, concurrent editing with conflict handling and online / offline logic. Not first pass, but ids, `updated_at` and provider-based state from day one: writes by id through the provider, lists re-render from `subscribe`, no in-memory-only shared state.
_Today:_ MockProvider with change events and cross-tab `storage` sync. _Queued:_ Supabase (T44), presence (T48).

## P-15 Conversion is the product
The demo is the lead magnet and is never gated; one primary CTA repeated, one secondary with the calendar inline; loss aversion with a concrete number; personalization above the fold; proof that it is theirs; speed and motion; sticky CTA and exit intent; honest urgency; track everything. `docs/reference/conversion-playbook.md` is the reasoning; `pickArchetype` is the code.
_Today:_ engine + playbook + rules R-C01..R-C06. _Queued:_ landing module (T12), A/B on cold traffic.

## Checklist for a change (paste into your turn)

- [ ] Works at 360 / 390 / 768 / 1280 / 1920 (+ 2560 / 3840 for key pages); `spec.checkedAt` updated (P-01)
- [ ] Keyboard order and visible focus; 44 px targets; nothing hover-only or drag-only (P-03)
- [ ] `spec.actions` lists every button / submit with intent and permission; handlers registered while mounted (P-05)
- [ ] Library components only; new component has a meta with a usage (P-07)
- [ ] Every non-working control uses `Placeholder` (P-09)
- [ ] `docs/reference/surfaces.md` updated (or a proposed row in `_pending`) if a route, action, provider method or script changed (P-10)
- [ ] Page doc, changelog (or `_pending`), kanban, decisions, prompt log, screenshots in the same turn (P-11)
- [ ] Strings through `useT()` with `es` where known; engine copy `{ en, es }` (P-13)
- [ ] No in-memory-only shared state; writes by id through the provider; tracking via `track()` (P-14, P-15)
