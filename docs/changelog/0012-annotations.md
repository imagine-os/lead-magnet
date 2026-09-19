# 0012 - Annotations: element-level pins and enforced triage (T49, D-09)

version: 0.3.0
date: 2026-09-19
prompt: 0003
intent: Finish P-08 (T49): let a tester annotate the product **on the element**, not in a spreadsheet, and make the agent triage workflow a rule the inbox enforces rather than a habit someone remembers. Pins on every page, the element path and component recorded automatically, and `status = done` refused until the reason for the change is on the row.
decision: (1) the annotation layer is mounted **once**, by `DevTools`, so it is on every route without any page opting in - and it shows itself for dev mode **or** `feedback.read`, so a staff tester without dev mode can still annotate; (2) `element_path` is a short, deliberately boring selector that stops at the nearest `id` or `[data-component]` and skips state classes, because a long brittle chain re-anchors worse than a short imprecise one; (3) a pin whose element is gone is **listed, not drawn** - a stale pin floating over a control is exactly the failure R-F03 forbids; (4) annotate mode highlights the element under the pointer **and** under focus via a `data-annot-target` attribute set in JS, so the mode is keyboard-complete and never hover-only; (5) R-F01 is enforced in code: `status = done` is refused while `triage` or `decision_ref` is empty, with a toast naming the rule; (6) author weight (`binding | request | signal`) and the suggested triage live in `src/rules/annotations.ts`, so the inbox, the pin thread and `docs/reference/annotations-triage.md` cannot drift; (7) no `screenshot_url` column - image capture is not wired (T40), and a column that is always null is worse than no column.
rejected: a `<canvas>` overlay or absolute coordinates (breaks on every reflow and every viewport - pins must anchor to an element, not a point); storing a full DOM path from `html` (re-anchors worse, and any layout change orphans every pin); editing every existing component to add `data-component` (forbidden by the module contract, and a 36-component sweep belongs to foundation - a class-hint table plus an exported `componentAttr()` helper bridges it); a separate `annotations` table (the `feedback` columns P-08 planned were already in `core.ts`; splitting would fork the inbox); auto-applying the suggested triage (R-F01 exists so a human or an agent states a reason, not so a heuristic states one); intercepting clicks whenever the layer is mounted (annotate mode is opt-in, announced and Escape-able - R-F03).
files: src/components/organism/AnnotationLayer/{AnnotationLayer.tsx,AnnotationLayer.meta.ts,AnnotationLayer.css,elementPath.ts}, src/modules/annotations/index.ts, src/rules/annotations.ts, src/modules/dev/FeedbackPage.tsx (granted), src/dev/DevTools.tsx (granted, minimal), docs/reference/annotations-triage.md, docs/pages/D-09.md
codes: D-09 (extended), T49

## What changed

- **`AnnotationLayer` (new organism, with meta + two usages)** - a floating "Annotate" toggle (44 px, `aria-pressed`) and a pin counter that opens a drawer. Annotate mode: click any element, or Tab to it and press Enter; Escape leaves. A modal collects kind and text and writes a `feedback` row with `element_path`, `component`, `viewport`, `theme`, `page_code`, `route`, role and user. Existing rows for the page render as numbered dots anchored to their element, re-measured on resize, on scroll and on a 1 s tick; clicking a pin opens the thread (text, context, author weight, triage, note, decision_ref, owner_reply) and `feedback.read` users can set triage and status from there.
- **`elementPath.ts`** - `stableSelector()` (stops at the nearest `id` / `[data-component]`, drops `is-*` / `has-*` and hashed classes, `:nth-of-type` only on collision, max 6 levels), `nearestComponent()` (attribute, then a 24-entry root-class hint table, then the tag), `resolveElement()` (never throws on a bad selector), and `componentAttr(name)` for new components to spread.
- **`DevTools.tsx` (granted, minimal)** - the layer is mounted for every route and the dev-mode gate now wraps only the `SpecChip` + `InspectorPanel`, so a strategist with `feedback.read` and no dev mode still gets pins. One-line import, one restructured return.
- **D-09 rebuilt around triage** - a KPI row (total, new, waiting on Justin, triaged / total), kind and page filters beside the status tabs, new columns (**component**, **element**, **viewport + theme**, **author weight**), and a triage panel that shows the suggested triage *with its reason*, a link to the page the row came from, and a one-click "Needs Justin" (`triage = ask`, `status = waiting`). **R-F01 is enforced**: `done` is refused without `triage` and `decision_ref`. Everything is bilingual through `useT()`.
- **`src/modules/annotations/index.ts`** - a routeless module that exists only to contribute its string table (a globally mounted component has no module of its own to hang keys on). ~80 keys, EN + ES.
- **`src/rules/annotations.ts`** - R-F01 (record triage before changing anything), R-F02 (author weight), R-F03 (pins never block the page), plus `authorWeight()` and `suggestedTriage()` used by the inbox and the pin thread.
- **`docs/reference/annotations-triage.md`** - how an annotation is filed, what each column is derived from, the five-step agent workflow, the three rules, the store shape, and what is still missing.

## New and changed contracts

- `src/rules/annotations.ts` exports `authorWeight(role): 'binding' | 'request' | 'signal'` and `suggestedTriage(role, kind)`. Anything that decides what to do with a feedback row should import these rather than re-deriving the policy.
- `componentAttr(name)` from `src/components/organism/AnnotationLayer/elementPath.ts`: spread onto a **new** component's root so pins name it precisely instead of guessing from a class.
- `body[data-annotating="true"]` and `[data-annot-target]` are reserved while annotate mode is on. A component that sets its own `outline` on hover will be overridden by the target outline (it is `!important`); nothing else is affected.
- `feedback` schema unchanged. `element_path` and `component` are now written for real on every row filed from a pin.
- D-09 registers two handlers whose `ActionDef`s are **not yet in `src/modules/dev/specs.ts`** (a shared file this worker may not edit). See the first request below - until they are added, `/#/dev/actions` will show two live handlers with no declared action, which is a P-05 gap, not an intentional one.

## Requests to foundation

1. **Add two rows to the `D-09` spec in `src/modules/dev/specs.ts`** (exact text, paste into `actions`):
   ```ts
   { id: 'dev.needsJustin', label: 'Needs Justin', intent: 'send feedback {id} to Justin', params: { id: 'id' }, permission: 'feedback.read' },
   { id: 'dev.filterFeedback', label: 'Filter', intent: 'show {kind} feedback on {page} that is {status}', params: { kind: 'enum:all|comment|request|bug|idea|question|praise', status: 'enum:all|new|seen|waiting|done', page: 'string' }, permission: 'feedback.read' },
   ```
   Also worth adding to that spec: `rules: ['R-F01', 'R-F02', 'R-F03']`, `components: [... 'Card', 'Field', 'Stat', 'Toast']`, and `checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840]`.
2. **`data-component="<Name>"` on every library component root.** This is the one change that makes `element_path` and `component` exact instead of heuristic. Today `nearestComponent()` falls back to a hand-kept class-hint table (`dt-wrap -> DataTable`, `card -> Card`, …) that has to be updated whenever a component's root class changes and guesses wrong for generic roots. Spreading `componentAttr(name)` (or just adding the attribute) on each of the 36 component roots removes the table entirely; the layer prefers the attribute already.
3. **`FeedbackButton` should record `element_path: null` explicitly and reuse `nearestComponent`** for its optional component field, so page-level and element-level rows are comparable in the inbox. It currently asks the tester to type a component name.
4. **`Modal` has no `size="sm"` visual for a two-field form**; the filing modal is wider than it needs at 1280+.
5. **No `useConfirm`** (already requested by `studio`): "Needs Justin" is a one-click state change with no undo.
6. **Pins are scoped to `page_code`.** An "every annotation in the product" view belongs on the D-07 canvas; worth a card.

## Proposed decisions

| id | date | decision | source | status |
| --- | --- | --- | --- | --- |
| D-072 | 2026-09-19 | **Annotations anchor to an element, never to a coordinate.** `element_path` is a short selector that stops at the nearest `id` / `[data-component]`; a pin whose element is gone is listed in the drawer, never drawn at a stale position (R-F03). Rejected: canvas overlays and absolute coordinates (break on every reflow and every viewport). | T49, P-08 | proposed |
| D-073 | 2026-09-19 | **R-F01 is enforced in code, not by habit**: D-09 refuses `status = done` while `triage` or `decision_ref` is empty. An agent records why before it changes anything. | T49, P-08 house-pattern workflow | proposed |
| D-074 | 2026-09-19 | **R-F02 author weight**: Justin / super admin binding, staff tester request, prospect / guest signal - with kind cutting across it (a reproducible bug is fixed whoever files it). Encoded once in `src/rules/annotations.ts` and shown per row; a suggestion, never an autopilot. | T49, house pattern | proposed |
| D-075 | 2026-09-19 | **No `screenshot_url` on `feedback`** (the P-08 sketch had one): browser screenshot capture is not wired (T40), and `element_path` + `viewport` + `theme` has been enough to reproduce. Revisit when the image provider lands. | T49 | proposed |
| D-076 | 2026-09-19 | **`data-component` on component roots is foundation work**, not a module worker's: the AnnotationLayer prefers the attribute and falls back to a class-hint table until the sweep happens. | T49, module contract | proposed |

## Proposed surfaces.md rows

`### 2.4 Annotations API` - move from "Planned" to "partly built": the store, the element-level capture and the triage vocabulary exist; the HTTP/MCP surface does not. Actions manifest rows for §2.1:

| id | page | intent | permission |
| --- | --- | --- | --- |
| `dev.triageFeedback` | D-09 | triage feedback {id} as {triage} | `feedback.read` |
| `dev.setFeedbackStatus` | D-09 | mark feedback {id} {status} | `feedback.read` |
| `dev.needsJustin` | D-09 | send feedback {id} to Justin | `feedback.read` |
| `dev.filterFeedback` | D-09 | show {kind} feedback on {page} that is {status} | `feedback.read` |

Rules registry (D-05): `R-F01`, `R-F02`, `R-F03` added by `src/rules/annotations.ts`. Component library: `AnnotationLayer` (organism) added. No new tables, DataProvider methods or npm scripts.

## Kanban moves

- **T49 Annotation pins on page + triage doc (D-09, Opus 5, after T20; P-08)** - backlog -> **done**.
- Follow-ups to add: the `data-component` sweep (request 2); the two D-09 spec rows (request 1); a `feedback_comments` table for real threads with T48; an all-pins view on D-07; capture a D-09 screenshot in T31.

## Verification

- `npm run typecheck` green for every file in this change set.
- Headless Chromium against `npm run dev`: on `/#/studio` the toggle measures 106 x 44; annotate mode sets `data-annotating`; clicking a card records `Card · #main > div.container.container-wide > div.card.card-p-sm:nth-of-type(2) > div.grid.grid-4`; filing writes the row and the pin appears; **the pin re-anchors after a full reload** from the stored selector; the drawer reports "1 pinned on the page, 0 whose element is gone"; the keyboard path (focus an element, press Enter) opens the modal on `Button`.
- R-F01 guard: setting status to `done` on an untriaged row leaves the row at `new` and pushes "Triage first (R-F01)"; after `triage = fix` and `decision_ref = D-057`, `done` sticks.
- D-09 columns verified: Kind | Text | Page | Component | Element | Viewport | From | Weight | Triage | Status.
- 44 px targets at every width; toggle 44 x 44 at 360 / 390 (label hidden), 237 x 49 at 3840. No console errors.
