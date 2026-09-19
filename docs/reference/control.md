# Control model: actions -> WebMCP tools -> CLI -> voice

_T45 (WebMCP) and the P-04 groundwork (T47 spatial navigation), 2026-09-19, Fable 5.1. Binding principles: P-04, P-05. Related: `surfaces.md` §1.3 / §1.6, `docs/pages/D-04.md`._

One page declares its actions once; everything that can drive the product reads that one declaration.

```
PageSpec.actions (ActionDef: id, label, intent, permission?, params?)      <- the page's buttons, menu items, form submits
   |  useActions(code, { id: handler })  while the page is mounted           <- the actions bus, src/actions/index.ts
   v
window.__leadmagnet.routes[].spec.actions                                    <- the manifest (D-01, D-04)
   |  src/actions/webmcp.ts  syncTools()  one tool per unique action id
   v
window.__leadmagnet.tools[]  +  window.__leadmagnet.runAction(id, params)    <- always present (Playwright, CLI, voice)
navigator.modelContext.registerTool(tool)                                    <- when the browser has WebMCP (feature-detected)
   |
   +-- npm run actions -- list | export | run <id>                            <- the CLI, scripts/actions.mjs
   +-- docs/reference/actions-manifest.json, voice-vocabulary.json          <- static exports of the same data
   +-- voice controller (T46, queued): phrase -> vocabulary entry -> runAction(action, slots)
   +-- remote / gamepad d-pad (T47): moves focus between the same buttons, Enter activates them
```

## 1. Declaring actions (what a page author does)
Nothing new. Every button, menu item and form submit on a page is an `ActionDef` in its `PageSpec.actions` (`id: '<module>.<verb>'`, `label`, `intent` = the phrase a person would say with `{slots}`, `permission?` = the string the page calls `can()` with, `params?` = `string | number | id | date | enum:a|b`). While mounted the page calls `useActions(code, { '<id>': handler })`; handlers take ids, never screen positions, and return something readable (an object; `{ ok, id, status }` is the house shape). That is the whole contract: the tool, the CLI verb, the voice phrase and the D-04 row are generated from it. A button without an entry is incomplete; removing a button removes its entry in the same commit (P-05).

## 2. WebMCP tools (`src/actions/webmcp.ts`)
- **One tool per unique action id.** `name = id`, `description = "<intent> — "<label>" on <codes> (needs <permission> | any role)"`, `inputSchema` = JSON Schema built from `params` (`string`/`id` -> string, `number` -> number, `date` -> string `format: date-time`, `enum:a|b` -> string enum; every slot optional because handlers default what the speaker left out; `additionalProperties: false`). An id declared by several pages (`booking.openDemo`, `demo.goto`, ...) is one tool with several `hosts`.
- **`execute(params)`** does, in order: (a) `can(permission)` for the current session (`"plan.setStatus" needs plan.edit; the current role (guest) does not have it`); (b) validate `params` against the schema; (c) if no handler is live, pick a host page the role may open (parameterless path first, then one whose params the call supplies), fill `:slug` / `:prospectId` / `:id` / `:role` / `:table` / `:code` from `params` or the first seeded row (`pages[0].slug`, `prospects[0].id`, `tasks[0].id` under `/plan`), navigate, and wait up to 4 s for the page to register; (d) `run(id, params)` and return `{ ok, message, data?, deduped? }` - `message` is a sentence, `data` is the handler's return value.
- **Registration.** At app start and whenever the live handler set changes (`onActionsChange`), `ControlBridge` (mounted once in `App.tsx` inside the router) calls `syncTools(manifest)`: tools are rebuilt, `live` refreshed, and registered with `navigator.modelContext.registerTool` when that function exists - once per name (the proposal throws on duplicates), with `annotations: { pages, permission, label }` and an `execute` that wraps the result as `{ content: [{ type: 'text', text }], structuredContent }`. No API present -> nothing is registered and nothing breaks: `window.__leadmagnet.tools`, `.vocabulary`, `.runAction()` and `.webmcp` (`{ available, registered: 'navigator' | 'window', count, live, updatedAt }`) are always published. `provideContext` / `clearContext` are deliberately not used (they clear other scripts' tools and were dropped from the 2026 revision of the proposal).
- **Idempotency rule.** Handlers may be non-idempotent (a status write, a booking insert). The surface guards them: an identical `(id, stableHash(params))` within **1.5 s** returns the first call's result with `deduped: true` instead of running the handler again (a double-tap on a remote, a repeated voice phrase, an agent retry). Two calls with different params, or the same call after the window, both run. Handlers should still be written idempotently where the data allows (set a status, do not toggle it); the guard is the safety net, not the design.
- **Bridge.** `installControlBridge({ can, role, navigate, currentPath, resolveParam, canOpen })` is what the React tree lends the bus; nothing in `src/actions` imports React context directly, so the same surface can run under a different shell later.

## 3. CLI (`npm run actions -- <command>`, `scripts/actions.mjs`)
| Command | What | Notes |
| --- | --- | --- |
| `list [--page CODE] [--json]` | every tool: id, pages, permission, intent, params | built from the compiled specs (esbuild bundles `src/modules/*/index.ts`, built beats stub like the registry); no browser |
| `export` | writes `docs/reference/actions-manifest.json` (tools with schemas and hosts) and `docs/reference/voice-vocabulary.json` (phrase -> action with slots) | run after any action change; commit both |
| `run <action.id> [--param k=v ...] [--as <role>] [--port N] [--json]` | Playwright: serves `dist/` on 4173 (or reuses whatever answers on `--port`, e.g. a `vite` dev server), opens the hub as `<role>` (`super_admin` default), calls `window.__leadmagnet.runAction(id, params)`, prints the result and the route it ended on, exits 1 on `ok: false` | Chromium from `/opt/pw-browsers`; external requests blocked |

Examples that were run headless on 2026-09-19: `npm run actions -- list` (119 tools / 179 declared rows / 51 routes), `npm run actions -- run plan.setStatus --param task=T45 --param status=doing --port=5199` -> `ok · ran plan.setStatus (opened K-04 /plan/tasks/T45) · data {"ok":true,"id":"T45","status":"doing"}`, then the same with `status=backlog` to revert. Each CLI run is a fresh browser context, so the mock database it writes is that context's localStorage; against Supabase (T44) the write is real.

From Playwright or the browser console the entry point is the same: `await window.__leadmagnet.runAction('demo.goto', { section: 'money' })` navigates to C-01 for the first prospect and switches the section.

## 4. Voice vocabulary (T46, queued)
`docs/reference/voice-vocabulary.json` (and `window.__leadmagnet.vocabulary`) is `[{ phrase, action, slots, pages, permission }]` straight from `intent` and `params`. The controller to build: listen -> match a phrase (slot values fill `{task}`, `{status}`, ...) -> `runAction(action, slots)` -> read `message` back. The page's own `Placeholder` rule applies until it exists: no microphone button ships before the controller does.

## 5. Remote / gamepad d-pad (T47 groundwork, `src/a11y`)
- `useSpatialNav(ref)` on a container: arrow keys move focus to the nearest focusable element in that direction (distance along the axis + twice the orthogonal gap; same row / column wins; **no wrap** - an edge stays put), Enter / Space activate custom focusables (native buttons and links keep their native activation; Space on a link clicks it), Backspace / Escape go one hash level up (`/demo/x/comms` -> `/demo/x`; `onBack` overrides). It is active only while focus is inside the container or nothing is focused, and never inside `input`, `select`, `textarea`, `contenteditable`, sliders / listboxes / combos / menus / grids / trees / tablists / radiogroups, iframes, anything under `[data-spatial="skip"]`, or while a modal dialog is open. Tab order is untouched. Returns `{ move, activate, back }` so other input adapters drive the same handlers.
- `useGamepadNav(controls)`: d-pad (buttons 12-15) and left stick (dead zone 0.6, repeat 220 ms) -> `move`, A (0) -> `activate`, B (1) -> `back`; polls `navigator.getGamepads()` on animation frames only while a gamepad is connected and the document has focus; no Gamepad API -> no listeners.
- Wired on HUB-01 (`HubPage.tsx`, one hook call + `ref`) and the demo shell (`DemoShell.tsx`, C-01..C-07). The hub footer shows a bilingual "TV mode" hint at >= 1920 (`useViewportAtLeast(1920)`, `TV_HINT` via `bi()`).
- A page that owns its arrows (K-03 graph pans with them) should mark that region `data-spatial="skip"` when the hook reaches it; today the hook is only mounted on the hub and the demo.

## 6. Adding a page or an action: the checklist
1. Add the `ActionDef` to the spec and the handler to `useActions`; run `npm run typecheck`.
2. `npm run actions -- list --page <CODE>` shows the tool; `npm run actions -- export` refreshes the two JSON files (commit them).
3. Open `/#/dev/actions` (D-04): the row shows "live" on its page, "opens page" elsewhere; "Run" opens the params form generated from the schema and shows the voice phrase and the JSON Schema.
4. `surfaces.md` §1.4 counts and this file's examples if the shape changed (P-10).
