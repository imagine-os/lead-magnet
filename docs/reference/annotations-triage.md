# Annotations and the agent triage workflow

_Written 2026-09-19 (prompt 0003) by Opus 5 for T49. The workflow below is the one the house pattern records for Hoy / Petrock, made concrete for Lead Magnet. Binding via **P-08** and rules **R-F01..R-F03** (`src/rules/annotations.ts`)._

Testers do not file bugs in a spreadsheet. They file them **on the product, on the element**, and an agent triages from the store. That only works if two things are true: every annotation carries enough context to act on without asking, and no agent ever changes anything before recording why.

## 1. How an annotation is filed

Two entry points write the same `feedback` row:

| Entry point | Where | What it captures |
| --- | --- | --- |
| `FeedbackButton` (organism) | mounted by `DesktopShell` on staff pages | page-level: kind, text, component (typed), viewport, theme |
| `AnnotationLayer` (organism, T49) | mounted by `src/dev/DevTools.tsx` on **every** route | element-level: everything above plus `element_path` and the resolved `component` |

The layer shows itself when **dev mode is on** or the viewer **`can('feedback.read')`**. The "Annotate" toggle (44 px, keyboard reachable, `aria-pressed`) enters annotate mode:

- **Mouse / touch / pen:** click any element.
- **Keyboard:** Tab to any focusable element and press Enter. Escape leaves the mode.
- The element under the pointer **or under focus** is outlined via a `data-annot-target` attribute set in JS, so the affordance is never hover-only (P-03).

A small modal collects `kind` (`comment | request | bug | idea | question | praise`) and the text. The row is written with:

| Column | How it is derived |
| --- | --- |
| `element_path` | `stableSelector()` - a short chain that stops at the nearest `id` or `[data-component]`, drops state classes (`is-*`, `has-*`), and adds `:nth-of-type` only when siblings collide |
| `component` | `nearestComponent()` - the nearest `[data-component]` value, else a root-class hint (`.dt-wrap` -> `DataTable`, `.card` -> `Card`, …), else the tag name |
| `viewport` | `window.innerWidth` at the moment of filing |
| `theme` | light / dark from `useTheme()` |
| `page_code`, `route` | the current route's spec code and path |
| `user_id`, `user_name`, `role` | the session, real role guard, mocked identity |
| `status` | `new` |

Existing rows for the page come back as **numbered pins** anchored to their element, re-measured on resize, on scroll and every second. A pin whose element no longer exists is **not** drawn at a stale position: it is listed in the side drawer and marked "element gone" (R-F03). The layer itself is pointer-transparent, so it can never cover a control.

## 2. The triage workflow (agents)

Run this from `/#/dev/feedback` (D-09). **In this order. Step 3 before step 4, always (R-F01).**

1. **Read `status = new`.** Filter by kind and page when a pass is scoped to one surface.
2. **Weigh the author (R-F02).**

   | Author | Weight | What it means |
   | --- | --- | --- |
   | Justin / `super_admin` | **binding** | what he annotates is the work |
   | staff tester (`strategist`, `analyst`) | **request** | they propose; Justin decides scope |
   | prospect / guest | **signal** | one is data; three of the same is a finding |

   Kind cuts across it: a reproducible **bug** is fixed whoever filed it, and a **question** is answered rather than triaged. D-09 shows the suggested triage and its reason per row (`suggestedTriage()`), as a prompt, not an autopilot.
3. **Write the triage on the row before touching anything:** `triage` (`fix | ask | later | wontfix`), `triage_note` (one sentence: what you will do and why), `decision_ref` (`D-nnn` or the changelog number that will carry the change). The inbox refuses `status = done` while `triage` or `decision_ref` is empty and says so in a toast - a change with no recorded reason is the failure mode this rule exists to prevent.
4. **Then act, in the same turn:**
   - `fix` -> make the change, update the page doc and the changelog, set `status = done` with the `decision_ref` pointing at them.
   - `ask` -> "Needs Justin" (one button: `triage = ask`, `status = waiting`), add the question to the kanban "Awaiting Justin" lane and to the chapter's open decisions if it belongs in the manual.
   - `later` -> a kanban card with the row id in its notes, `status = seen`.
   - `wontfix` -> `owner_reply` explaining it, `status = done`. Never silently.
5. **Reply to the author** in `owner_reply` whenever the answer is not obvious from the product itself.

## 3. Rules

| Rule | Statement |
| --- | --- |
| **R-F01** | Record `triage`, `triage_note` and `decision_ref` **before** changing anything; `done` is refused without them; Justin's decisions go to `waiting`, never resolved silently. |
| **R-F02** | Author weight decides fix versus ask: owner binding, staff request, prospect / guest signal - with kind cutting across it. |
| **R-F03** | Pins never block the page: the layer is pointer-transparent, annotate mode is opt-in, announced and exits on Escape, and an orphaned pin is listed rather than drawn. |

## 4. Store shape

`feedback` (`src/data/schema/core.ts`) - unchanged by T49; the annotation columns planned in P-08 were already there and are now written for real:

`user_id, user_name, role, page_code, route, kind, text, element_path, component, viewport, theme, status (new|seen|waiting|done), triage (fix|ask|later|wontfix), triage_note, decision_ref, owner_reply` plus the base `id, created_at, updated_at`.

`screenshot_url` from the P-08 sketch is **not** added: capturing a screenshot in the browser needs a provider we have not wired (T40), and a column that is always null is worse than no column. The element path plus viewport plus theme has been enough to reproduce every annotation so far.

## 5. What is still missing

- **`data-component` on library components.** Until every component root carries it, `nearestComponent()` falls back to a class-hint table in `src/components/organism/AnnotationLayer/elementPath.ts`. That table is a stopgap: it has to be kept in step with component CSS by hand, and it guesses wrong for a component with a generic root class. Requested of foundation; `componentAttr(name)` is exported for new components to spread today.
- **Threads.** A row carries one `owner_reply`, not a conversation. A real thread needs its own table (`feedback_comments`) and lands with realtime (T48).
- **Annotations API.** `docs/reference/surfaces.md` §2.4 already plans it; the actions `dev.triageFeedback`, `dev.setFeedbackStatus`, `dev.needsJustin` and `dev.filterFeedback` are the vocabulary it should expose.
- **Cross-page pin index.** Pins are scoped to the current `page_code`; a "every pin in the product" canvas belongs on D-07.
