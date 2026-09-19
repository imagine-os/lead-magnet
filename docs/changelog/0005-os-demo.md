# 0005 - os-demo - the lead magnet itself (T13, C-01..C-07)

version: 0.2.0 (shipped in the 0.2.0 integration pass; module work dated 2026-09-18)
date: 2026-09-18
prompt: 0001
intent: Replace the C-01..C-07 stubs with the prospect's operating system: already built, already themed to them, with a view for every role in their business and in their life, on phone, desktop and a 4K TV, in EN and ES, and never gated by a form.
decision: (1) the demo owns its chrome (no DesktopShell) because it must read as the prospect's product, not as our admin tool; (2) the prospect palette is applied once on the demo root, where `prospectStyle()`'s `--lp-*` are mapped onto the semantic tokens the library components already read, so `Card` / `Button` / `DataTable` become theirs without a fork and without touching `tokens.ts` (R-D01, P-02); (3) the active role lives in the URL (`/demo/:id/role/:slug`) so a role switch is shareable, bookmarkable and back-button-able, and `demo_role_switch` is deduped at module scope so the C-01 -> C-02 route change is not double-counted; (4) sample content (week events, threads, payments, people) is deterministic, seeded from the prospect id, so screenshots and QA runs are stable and two prospects in one industry still read differently; (5) three new rules R-D01..R-D03.
rejected: a form or email wall before the demo (breaks R-C01 / R-D03 - the pair is persistent but unobtrusive and only opens a modal at the moment of value); nesting the seven pages under one parent route (the registry matches stubs by exact path, so each page mounts the shell itself); a chart library for the role-home chart (inline SVG with a text alternative, no dependency, no hover-only data); random sample data (unstable screenshots); new library components for the shell (module-local chrome instead, so no component meta is owed and no shared file is touched).
files: src/modules/os-demo/{index.ts,specs.ts,DemoShell.tsx,RoleHomePage.tsx,DepartmentsPage.tsx,CommsPage.tsx,MoneyPage.tsx,LifePage.tsx,SettingsPage.tsx,widgets.tsx,sample.ts,people.ts,demo.css}, src/rules/os-demo.ts, docs/pages/C-01.md..C-07.md, docs/changelog/_pending/os-demo.md
codes: C-01 C-02 C-03 C-04 C-05 C-06 C-07 (stub -> built)

## What changed
- **C-01 shell + role home.** Own chrome: sticky top bar with the business name as wordmark, a demo role switcher listing every business and life role from `deriveRoleViews(prospect)` (these are the prospect's people, not our app roles), `LangToggle`, and a persistent "Book a walkthrough" + "Save your workspace" pair. Sidebar at >= 900 px, six-item bottom nav below, wider frame / sidebar / widget columns at >= 1920 on top of the `--scale` bands. Unknown prospect id renders an `EmptyState` with a link to the hub.
- **C-02 role home.** Bilingual headline, chips for the other people in the business, a "today" strip built from the industry KPIs, four quick actions (two navigate, two are `Placeholder`s), and the role's widgets rendered by kind: kpi -> `Stat`, list -> card rows, calendar -> a week strip of industry-themed events, chat -> thread list, table -> `DataTable`, chart -> inline SVG bars with a trend line and a text alternative, doc -> document card.
- **C-03 departments board.** One column per department from the industry catalog with a KPI, seeded people and the open items from the industry's pains.
- **C-04 comms inbox.** Channel tabs (all / calls / email / SMS / WhatsApp) with counts, a keyboard-complete thread list, a thread pane, and a composer that is an honest `Placeholder` for the comms provider.
- **C-05 money.** Live `stack_guesses` crossed out with the module that replaces each tool, `savings()` stats (stack today, this workspace, net per year), a savings curve, a payments `DataTable` and payroll as a Stripe `Placeholder`.
- **C-06 life.** Partner, kids, accountant, coach as people who each open their own role home; shared week calendar, shared lists, family chat.
- **C-07 settings.** Roles table (business + life) with a permission summary, brand swatches with hex and typeface, language, export and invite `Placeholder`s.
- **Tracking.** `demo_open` once per session, `demo_role_switch` on every real role change, `section_view` per demo page (and per comms channel), `cta_click` for save / book, `form_submit` when the save modal is submitted - all with `{ prospect_id, page_id }`, the page id read from the prospect's live `pages` row.
- **Rules.** `src/rules/os-demo.ts`: R-D01 always themed from the prospect palette, R-D02 every business + life role gets a view, R-D03 the demo never asks for data before value.
- **Strings.** ~120 keys under `demo.*` with EN + ES; the sample content (threads, lists, calendar titles, chat) is bilingual at source through `Bi` objects rather than English-only fill.

## New and changed contracts
- Routes `/demo/:prospectId`, `/demo/:prospectId/role/:role`, `/demo/:prospectId/departments|comms|money|life|settings` are now built (surface `demo`, all roles).
- Role slug in the URL: lowercase, non-alphanumerics to `-` (`front desk` -> `front-desk`, `spouse/partner` -> `spouse-partner`). An unknown slug falls back to the first business role.
- New actions on the manifest: `demo.goto`, `demo.quickAction`, `demo.openDepartment`, `demo.filterChannel`, `demo.openThread`, `demo.openPayment`, `demo.openLifeRole`, `demo.openRole` (plus the stub ids `demo.switchRole`, `demo.saveWorkspace`, `demo.bookCall`, `demo.openWidget`, `demo.reply`, `demo.invite`, all now live).
- No schema or seed change: the module reads `prospects`, `pages` and `stack_guesses` and writes only `events`.

## Requests to foundation
1. `Placeholder` renders its `button` prop by spreading `{ ...button }` onto `Button`, so a stray `label` attribute reaches the DOM. A `Placeholder` variant that takes `label` separately (or strips it) would remove the React attribute warning for every module.
2. `Tabs` renders `aria-controls="panel-<id>"` for every tab, but only the active panel exists in the DOM; an `aria-controls` only on the selected tab (or a `panels` prop) would be strictly valid.
3. `RoleSwitcher` is our five app roles, so the demo needed its own switcher for the prospect's people. If a second module needs it, promote the demo's `Select`-based people switcher into a library component with a meta.
4. `Select` has no `optgroup` support; role groups are currently prefixed into the label ("Business · Owner"). An `optgroup`-capable `Select` would read better at 10 feet and for screen readers.
5. B-01 `/book/:prospectId` is still a stub; "Book a walkthrough" routes there and will land on the stub until T14.

## Proposed decisions
| id | decision | rationale | rejected | status |
| --- | --- | --- | --- | --- |
| D-0xx | The OS demo owns its chrome and maps `--lp-*` onto the semantic tokens on its root | The demo must read as the prospect's product; mapping rather than forking keeps one design system (P-02) and gets every library component themed for free | forking components per prospect; a second token file | proposed |
| D-0xx | The demo's active role is URL state (`/role/:slug`), not component state | Shareable, bookmarkable, back-button-able, and it makes `demo_role_switch` a real funnel signal | a dropdown with local state | proposed |
| D-0xx | Demo sample content is deterministic, seeded from the prospect id | Stable screenshots and QA diffs; two prospects in one industry still differ | random generation at render | proposed |

## Proposed surfaces.md rows
| Surface | Entry | What |
| --- | --- | --- |
| Routes | `/demo/:prospectId` | C-01 OS demo shell + default role home (built) |
| Routes | `/demo/:prospectId/role/:role` | C-02 role home for one business or life role (built) |
| Routes | `/demo/:prospectId/departments` | C-03 departments board (built) |
| Routes | `/demo/:prospectId/comms` | C-04 unified inbox (built) |
| Routes | `/demo/:prospectId/money` | C-05 money, savings, payments, payroll (built) |
| Routes | `/demo/:prospectId/life` | C-06 family / life view (built) |
| Routes | `/demo/:prospectId/settings` | C-07 settings and roles (built) |
| MCP / WebMCP | `demo.*` | 13 actions across C-01..C-07: switchRole, goto, saveWorkspace, bookCall, openWidget, quickAction, openDepartment, filterChannel, openThread, reply, openPayment, openLifeRole, openRole, invite |
| Planned | comms send, payroll, invite, CSV export, brand edit | `Placeholder`s pointing at T42 / T51 / T44 / T40 |

## Kanban moves
- T13 `os-demo` (Opus 5): doing -> done. C-01..C-07 stub -> built.
- T31 screenshots: add C-01..C-07 (no images captured yet; page docs point at the paths).

## Integration notes (T20, Fable 5.1, 2026-09-19)
- **Duplicate React keys fixed at the cause**: `owner` is both a business role and a life role, so the role `Select` (value = role name), the RoleHome chips (`key={x.role}`) and the C-07 roles table (`id: v.role`) collided. `people.ts` now exports `viewSlug(view, views)` (business keeps the bare slug, a colliding life view becomes `life-<slug>`), `findView(views, slug)` and `viewKey(view)`; `DemoShell` exposes `goView(view)` next to `goRole(name)`. `/demo/pro_maya/role/life-owner` now opens the owner's own life view, which was unreachable before.
- **Language default**: `DemoShell` calls `useDefaultLang(prospect.lang)`.
- `Placeholder` no longer spreads `label` onto the DOM; `Tabs` sets `aria-controls` only on the selected tab (both fixed in the components).
- Requests: promote the people switcher, `Select` optgroups -> Backlog cards. C-01 / C-02 screenshots captured.
