# Components pass 3 (foundation): sortable DataTable, ConfirmDialog, DateRange, Stat deltas, prospect tones

version: 0.4.0
date: 2026-09-19
prompt: 0004
intent: Close the open "Component requests" cards from the pass-2 kanban at the root of the library (not per page), backwards compatible with every existing call site, so module workers in pass 3 adopt shared contracts instead of hand-rolling sort headers, confirm modals, date filters, delta tiles and prospect colour overrides.
decision: (1) sorting lives in `DataTable` as a 44 px button filling the th with `aria-sort` on the th, controlled (`sort` + `onSort`) or uncontrolled (`defaultSort`, client-side by `accessor ?? row[key]`); (2) destructive confirms are one promise-based `useConfirm()` over a single `ConfirmDialog` hosted by `ConfirmProvider` in App.tsx, built on `Modal` (which now has a unique title id per instance, `closeLabel`, `className`); (3) prospect theming is a `tone="prospect"` on Button / Card / Stat reading `--lp-*` with `--color-*` fallbacks, so the landing / demo / proposal `.lp .btn-*` / `.stat` overrides can be deleted in a later module pass; (4) `Stat.delta` always renders arrow + signed number + optional label, colour only reinforces; the sparkline is `aria-hidden` with a sr-only text alternative; (5) the fifth model hue is a real token pair (`--color-violet`, `--color-violet-bg`, 7.2:1 light / 8:1 dark) exposed as `Badge tone="violet"`, and `MODEL_TONE` maps to it the day `MODELS` gains a fifth name (schema + plan decision, not a foundation one); (6) `DateRange` derives the active preset from the value (a URL-restored range still highlights 30 d) and exports `isoDay / shiftDay / lastDays` so pages and seeds compute the same ranges; (7) `Placeholder` cancels navigation on a wrapped `Link` / `<a>` with preventDefault + stopPropagation and keeps the element a focusable link (href, role) so the a11y tree still says "link".
rejected: a separate `SortableTable` organism (two tables = two card modes to keep in sync); `window.confirm()` (not themed, not bilingual, not 44 px, not in the actions manifest); a `ProspectButton` component (every variant would be duplicated; a tone on the one button is one class); inventing a fifth model name to fill `MODEL_TONE` (product / routing decision for Justin, the hue is ready); a combobox / search Select (needs a listbox pattern with typeahead - separate card, see leftovers); sorting in card mode (< 768) via an extra Select (needs "ascending / descending" strings; deferred, noted in the meta a11y list).
files: src/design/tokens.ts + src/styles/tokens.css (violet pair), src/components/organism/DataTable/{DataTable.tsx,DataTable.css,DataTable.meta.ts}, src/components/organism/Modal/{Modal.tsx,Modal.meta.ts} (useId title, closeLabel, className), src/components/organism/ConfirmDialog/{ConfirmDialog.tsx,ConfirmDialog.css,ConfirmDialog.meta.ts} (new), src/components/molecule/DateRange/{DateRange.tsx,DateRange.css,DateRange.meta.ts} (new), src/components/molecule/Field/{Field.tsx,Field.css,Field.meta.ts}, src/components/molecule/Stat/{Stat.tsx,Stat.css,Stat.meta.ts}, src/components/molecule/Card/{Card.tsx,Card.css,Card.meta.ts}, src/components/atom/Button/{Button.tsx,Button.css,Button.meta.ts} (forwardRef + tone), src/components/atom/Badge/{Badge.tsx,Badge.css,Badge.meta.ts}, src/components/atom/Select/{Select.tsx,Select.meta.ts}, src/components/atom/Placeholder/{Placeholder.tsx,Placeholder.css,Placeholder.meta.ts}, src/app/App.tsx (ConfirmProvider inside ToastProvider), docs/pages/D-02.md, docs/changelog/_pending/components.md
codes: D-02 (every new prop has a live usage) · all pages using DataTable, Button, Card, Stat, Field, Badge, Select, Placeholder, Modal (no call-site change required; 17 DataTable call sites, 20 Stat hint call sites and every Modal keep compiling)

## What changed

- **DataTable**: `Column.sortable`, `Column.accessor`, `Column.srOnlyHeader`; props `sort`, `onSort`, `defaultSort`, `clientSort`; exports `SortState`, `SortDir`, `SortValue`, `compareValues()`, `sortRows()`. The th becomes one 44 px (`--h-thead`) button with an aria-hidden glyph (both-arrows / up / down), `aria-sort="ascending|descending"` on the active th. Null / undefined / empty sort last; numbers numeric; strings `localeCompare` numeric + base sensitivity; stable (original index breaks ties). Row-link overlay (D-088) untouched; `srOnlyHeader` cells drop their label in card mode and right-align the action. Root now uses `componentAttr()`.
- **Modal**: `aria-labelledby` id is `useId()` per instance (two dialogs on one page no longer share `#modal-title`), `closeLabel` (default "Close"; landing already passes its string), `className` on the dialog.
- **ConfirmDialog** (organism, new): `ConfirmDialog`, `ConfirmProvider`, `useConfirm()`; Cancel / Cancelar and Close / Cerrar by current language, other labels are module strings; danger tone = red confirm button + red title; focus lands on Cancel; Esc / backdrop / Cancel resolve `false`; a second `confirm()` while one is open resolves the first `false`. Mounted in `App.tsx` inside `ToastProvider`.
- **Field**: `action?: ReactNode` rendered in a flex row beside the control (`.field-row` / `.field-action`, 44 px); the child still gets id / aria-describedby / invalid / required.
- **Badge**: tones `violet` (new token pair) and `outline` (transparent, 1 px currentColor inset ring). Root uses `componentAttr()`.
- **Stat**: `hint: ReactNode` (was string), `size="sm"`, `align`, `delta` (`value`, `label?`, `direction?`, `good?: 'up'|'down'`, `format?`), `spark: number[]` + `sparkLabel`, `estimate: string` (dashed tile + dashed badge beside the label, italic value), `tone="prospect"`. Exports `sparkPath()`.
- **Placeholder**: a `Link` / `<a>` child keeps href + role, gets `role="link"` fallback and 44 px box; click / Enter / Space show the toast and cancel navigation and bubbling. Buttons unchanged. Root uses `componentAttr()`.
- **DateRange** (molecule, new): presets (default 7d / 30d / 90d, numeric labels) + Custom in a `SegmentedControl`, two native date inputs in real labels; `inputsOnCustomOnly`, `today` anchor, `size`. Helpers `isoDay()`, `shiftDay()`, `lastDays()`.
- **Select**: `groups?: { label, options, disabled? }[]` as `<optgroup>`; `options` is now optional (default `[]`), rendered before groups.
- **Button**: `forwardRef` (ref reaches the `<button>`), `tone="prospect"` (`.btn-prospect` recolours primary / accent / secondary / outline / ghost / link from `--lp-primary`, `--lp-accent`, `--lp-on-primary`, `--lp-on-accent`, `--lp-surface`, `--lp-text`, `--lp-bg`, each with its `--color-*` fallback). **Card**: `tone="prospect"`. **Stat**: `tone="prospect"`.
- **Tokens**: `status.light/dark.violet + violetBg` -> `--color-violet`, `--color-violet-bg` (regenerated `tokens.css`).
- Gallery (D-02): every new prop has a live usage in its meta (uncontrolled + controlled sort, sr-only action column, useConfirm demo, Field action slot, violet / outline badges, Stat delta / spark / estimate / sizes / prospect, Placeholder over Link and anchor, DateRange md + sm, Select groups, Button and Card prospect tone). No new page buttons, so the D-02 spec actions are unchanged.

## New and changed contracts

```ts
// DataTable
export type SortDir = 'asc' | 'desc';
export interface SortState { key: string; dir: SortDir }
export type SortValue = string | number | boolean | null | undefined;
export interface Column<T> { key: string; header: string; render?: (row: T) => ReactNode; width?: string; align?: 'left' | 'right'; hideOnCard?: boolean; sortable?: boolean; accessor?: (row: T) => SortValue; srOnlyHeader?: boolean }
export interface DataTableProps<T extends { id: string }> { columns: Column<T>[]; rows: T[]; caption: string; onRowClick?: (row: T) => void; rowHref?: (row: T) => string; empty?: { title: string; body?: string }; dense?: boolean; sort?: SortState; onSort?: (sort: SortState) => void; defaultSort?: SortState; clientSort?: boolean }
export function compareValues(a: SortValue, b: SortValue): number;
export function sortRows<T>(rows: T[], columns: Column<T>[], sort: SortState | undefined): T[];
// Controlled: parent orders rows (or passes clientSort). Uncontrolled: defaultSort + the table sorts. onSort fires in both modes.

// Modal
export interface ModalProps { open: boolean; onClose: () => void; title: string; children?: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg'; closeLabel?: string; className?: string }

// ConfirmDialog (src/components/organism/ConfirmDialog/ConfirmDialog.tsx)
export interface ConfirmOptions { title: string; body?: ReactNode; confirmLabel: string; cancelLabel?: string; tone?: 'default' | 'danger' }
export interface ConfirmDialogProps extends ConfirmOptions { open: boolean; onResolve: (ok: boolean) => void }
export function ConfirmProvider({ children }: { children: ReactNode }): JSX.Element;   // mounted in App.tsx
export function useConfirm(): (o: ConfirmOptions) => Promise<boolean>;
// const confirm = useConfirm(); const ok = await confirm({ title: t('studio.expire_q'), body: t('studio.expire_body'), confirmLabel: t('studio.expire_now'), tone: 'danger' }); if (!ok) return;

// Field
export interface FieldProps { label: string; hint?: string; error?: string; required?: boolean; children?: ReactNode; inline?: boolean; action?: ReactNode }

// Badge
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'accent' | 'ink' | 'violet' | 'outline';

// Stat
export type StatTone = 'default' | 'success' | 'warn' | 'danger' | 'accent' | 'prospect';
export interface StatDelta { value: number; label?: string; direction?: 'up' | 'down' | 'flat'; good?: 'up' | 'down'; format?: (v: number) => string }
export interface StatProps { label: string; value: ReactNode; hint?: ReactNode; tone?: StatTone; size?: 'sm' | 'md' | 'lg'; align?: 'start' | 'center' | 'end'; delta?: StatDelta; spark?: number[]; sparkLabel?: string; estimate?: string }
export function sparkPath(values: number[], w?: number, h?: number): string;

// Placeholder: unchanged props; children may be <Link to> / <a href> (navigation cancelled, toast shown)

// DateRange (src/components/molecule/DateRange/DateRange.tsx)
export interface DateRangeValue { from: string; to: string }          // YYYY-MM-DD inclusive
export interface DateRangePreset { days: number; label: string }
export interface DateRangeProps { value: DateRangeValue; onChange: (v: DateRangeValue) => void; label: string; labels: { from: string; to: string; custom: string }; presets?: DateRangePreset[]; today?: string; size?: 'sm' | 'md'; inputsOnCustomOnly?: boolean }
export const isoDay: (d?: Date) => string; export const shiftDay: (iso: string, days: number) => string; export const lastDays: (days: number, today?: string) => DateRangeValue;

// Select
export interface SelectGroup { label: string; options: SelectOption[]; disabled?: boolean }
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> { options?: SelectOption[]; groups?: SelectGroup[]; invalid?: boolean; placeholder?: string }

// Button (now forwardRef<HTMLButtonElement, ButtonProps>)
export type ButtonTone = 'default' | 'prospect';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; size?: ButtonSize; icon?: IconName; iconRight?: IconName; loading?: boolean; block?: boolean; children?: ReactNode; tone?: ButtonTone }

// Card
export type CardTone = 'surface' | 'tint' | 'ink' | 'prospect';

// Tokens: --color-violet, --color-violet-bg (light #6D28D9 / #EFE9FD, dark #C4B5FD / #2E1F5E)
```

Adoption notes for module workers: A-03 / A-05 / K-02 replace their own header sort with `sortable` + `onSort` (K-02 `ListPage` can keep its `sortCol` / `dir` state and pass `sort={{ key: sortCol, dir }}`); S-03 "Expire now" uses `useConfirm` with `tone: 'danger'`; landing / demo / proposal may switch to `tone="prospect"` and then delete `.lp .btn-*` / `.lp .stat*` / `.lp .card` overrides in `landing.css` (they still work as-is); A-01 / A-03 filters take `DateRange` with `labels` from module strings; `Stat.hint` accepts a Link or Badge.

## Requests to foundation

Leftovers from the kanban "Component requests" list, not in this pass (each stays a card):
- Sort control for `DataTable` card mode (< 768): needs "ascending / descending" label props; proposal: `sortLabels?: { asc: string; desc: string }` + a `Select` above the cards when any column is sortable.
- `Select` combobox / search for long lists (listbox + typeahead pattern; separate component `Combobox`).
- `DeviceMockup` fit / caption, `PhoneFrame` fit mode; `ViewportFrame` caption / error state; `Chip` ghost / dashed tone; `Prose` / `Lede`; `prospectById` guard; demo people switcher promotion; shared `print.css`; `recommendations.source_hash`; `plan.syncBuildPlan` (not component work).
- `MODEL_TONE` fifth entry: waits for a fifth name in `MODELS` (`src/data/schema/core.ts`); the hue (`violet`) is ready.

## Proposed decisions

| D-093 | 2026-09-19 | **Sorting is a `DataTable` concern, not a page's**: `Column.sortable` turns the th into one 44 px button carrying `aria-sort`; controlled (`sort` + `onSort`) or uncontrolled (`defaultSort`, client-side by `accessor ?? row[key]`, stable, nulls last). Rejected: a separate `SortableTable` (two card modes to keep in sync) and page-level header buttons (K-02's were not 44 px and had no `aria-sort`). | T22 foundation pass 3, kanban component requests | proposed |
| D-094 | 2026-09-19 | **Destructive confirms are `useConfirm()`**: one promise-based `ConfirmDialog` hosted by `ConfirmProvider` in App.tsx, Cancel / Cerrar by language, module strings for title / body / confirm label, `tone: 'danger'` for irreversible actions, focus on Cancel. Rejected: `window.confirm()` (not themed, not bilingual, not 44 px, invisible to the actions manifest) and per-page Modals (S-03 and A-05 would each own one). | T22, S-03 request | proposed |
| D-095 | 2026-09-19 | **Prospect theming of library components is `tone="prospect"`** on Button, Card and Stat reading `--lp-*` with `--color-*` fallbacks (`--lp-on-primary` / `--lp-on-accent` from `readableOn()`, D-087), so modules stop overriding `.btn-*` / `.stat` / `.card` under `.lp`. Rejected: `ProspectButton` etc. (every variant duplicated) and pages forking tokens (P-02). | T22, landing / demo / proposal request | proposed |
| D-096 | 2026-09-19 | **The fifth model hue is a token pair, not a fifth model**: `--color-violet` / `--color-violet-bg` (7.2:1 light, 8:1 dark) as `Badge tone="violet"`; `MODEL_TONE` maps to it when Justin adds a fifth name to `MODELS`. Rejected: inventing a model name in the schema to fill the map. | T22, plan request | proposed |
| D-097 | 2026-09-19 | **`Stat.delta` is never colour alone**: arrow glyph + signed number + optional label, `good: 'up'|'down'` decides which direction is success (costs go down); sparklines are `aria-hidden` SVG with a sr-only "first -> last" or `sparkLabel`. Rejected: colour-only chevrons and a chart library for eight-point sparklines. | T22, A-03 request, P-03 | proposed |
| D-098 | 2026-09-19 | **`DateRange` derives the active preset from the value** (7 / 30 / 90 days ending `today`, inclusive) instead of storing a preset key, so a range restored from a URL or a seed still highlights its preset; `lastDays()` is the one place that computes it. Rejected: `{ preset: '30d' } | { from, to }` union values (two shapes for every consumer). | T22, A-01 / A-03 / plan / studio request | proposed |

## Proposed surfaces.md rows

- §1.1 (routes): no change.
- §1.2 (DataProvider): no change.
- New reference row under a "Shared UI contracts" note (or `docs/reference/house-pattern.md`): `useConfirm()` (`src/components/organism/ConfirmDialog`) is the destructive-confirm surface; `DataTable` `sort` / `onSort` is the sort contract; `DateRange` `{ from, to }` ISO dates is the date-filter contract (`lastDays()` shared with seeds). Component count 38 -> 40 (ConfirmDialog, DateRange).
- §1.6 (WebMCP / actions): no new action ids (gallery demos live inside metas, D-02 spec unchanged). Voice note: a confirm dialog's two answers are Cancel / <confirmLabel>; a future `dev.confirm` action could resolve it by intent ("confirm" / "cancel") - queued with T46.

## Kanban moves

Close (Backlog "Component requests" -> Done, foundation, Fable 5.1, 2026-09-19):
- `DataTable`: sortable headers + `aria-sort`, `srOnlyHeader` for action columns
- `Button` / `Card` / `Stat` `tone="prospect"` reading `--lp-*` with `--color-*` fallback
- `Stat`: `delta` + optional sparkline; estimate / "proposed" affordance; `ReactNode` hint
- Shared date-range control (7 / 30 / 90 days, custom) -> `DateRange`
- `Select`: `optgroup` support (combobox / search stays open as its own card)
- `Field` action slot without cloning into a wrapper
- `useConfirm` / destructive-confirm pattern -> `ConfirmDialog` + `ConfirmProvider` + `useConfirm()`
- `Placeholder` that can wrap a `Link`
- `Badge` tone for a fifth model hue (`violet`; `MODEL_TONE` entry waits for a fifth `MODELS` name)

Stay open: `Select` combobox / search; `DeviceMockup` / `PhoneFrame` fit + caption; `Chip` ghost / dashed tone; `ViewportFrame` caption / error; `prospectById` guard; people switcher promotion; `Prose` / `Lede`; `print.css`; `recommendations.source_hash`; `plan.syncBuildPlan`; new card: `DataTable` sort control in card mode.

Note for the integrator: during this pass another worker ran `git stash` on the shared tree (stash@{0}, 19:30 UTC) which took these 15 tracked component edits with it; they were restored from that stash with `git checkout stash@{0} -- <files>`. The stash still holds landing / engine files that belong to other workers; do not drop it before they have recovered theirs.

Model: Fable 5.1

## Integration note (0023)
Numbered by the pass-3 integration (Fable 5.1). Decisions recorded as D-093..D-098 (proposed). Adopted at the root in the same pass: sortable headers on A-03, A-05, K-02 and S-01 (`srOnlyHeader` on the action columns); `Avatar` sizes, the `Button` icon and interactive `Chip` boxes follow `--scale`; `Tabs` keeps its horizontal scroller inside its host (`max-width: 100 %; min-width: 0`); `Stat` exposes `--stat-value-size` and landing sets it in its three TV bands instead of overriding `.stat-value`; `Icon` gains `mic` and `link`; `--lime-700` / `--lime-650` join the ramp for `PairedBarChart`. Component count 38 -> 42 (ConfirmDialog, DateRange, CommandPalette, PairedBarChart).
