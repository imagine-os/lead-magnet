# OS demo depth: the `Meter` molecule, the resolved industry in the demo and the landing hero (T62)

version: 0.5.0
date: 2026-09-20
prompt: 0005
intent: Justin: "update the items, I have Hoy in my Github, cal tenant law, and petrockhotel in there too... those all have pretty well built out operation systems". The engine worker landed the depth (three sub-industries, the `meter` widget kind, three seeded prospects) and left the renderers at the minimum; this pass is requests 1-3 of `0024-reference-items.md`: the demo and the landing pages now show that depth - a dog hotel's eight departments and its occupancy gauge, a tenant-law firm's nine and its caseload, a wellness club's eight and its mats.
decision: (1) the gauge is a library molecule, `Meter` (value / max / label / unit / hint, `role="meter"`, sizes sm / md, `tone="prospect"`), used by the C-02 widget card and by `MiniOs` in the landing device mockups, not two ad-hoc renderings of the same idea; (2) `DemoShell`, `HeroReveal` and `OgCard` read `industryFor(prospect)`, so every surface that says "your departments" says the same words as the engine; (3) C-03 gives each department the KPI at its own index (`kpis[i]`, wrapping only past the end) and rotates the open items, because eight KPIs per sub were being collapsed into three repeated numbers; (4) an owner / manager of a business with a capacity resource leads with the meter - first widget and first item of the today strip - the way Petrock's owner dashboard and Hoy's admin home open the day.
rejected: keeping `Stat` + `ProgressBar` as the meter body (two components, two labels, a percentage with no capacity, and `role="progressbar"` claims progress towards completion where a gauge reports a level); restyling the library `Meter` from `landing.css` for the 9 px mini OS (the landing module may not own another component's CSS, and the hosts differ) - instead the component exposes `--meter-value-size / --meter-text-size / --meter-track-h` with token defaults, the precedent `Stat` set with `--stat-value-size`; a fourth "near capacity" colour-only state (the reading and the percentage are always text, and `warnLabel` is a word, not a hue); showing the engine's `hint` under the bar in the widget card ("50 of 58 rooms" is the value row read twice - the card keeps the KPI tile's "live in your workspace" line); a `departments[].kpi?: number` index in the catalog (D-135 deferred it; `kpis[i]` needs no schema change and gives the same result for all three subs); making `DemoShell`'s wordmark say the sub-industry name instead of the industry label (it would change the three original prospects' chrome and every screenshot of it for no new information).
files: src/components/molecule/Meter/Meter.tsx (new), src/components/molecule/Meter/Meter.css (new), src/components/molecule/Meter/Meter.meta.ts (new), src/modules/os-demo/widgets.tsx, src/modules/os-demo/DemoShell.tsx, src/modules/os-demo/DepartmentsPage.tsx, src/modules/os-demo/sample.ts, src/modules/os-demo/people.ts, src/modules/os-demo/specs.ts, src/modules/os-demo/index.ts, src/modules/landing/sections/HeroReveal.tsx, src/modules/landing/sections/MiniOs.tsx, src/modules/landing/OgCard.tsx, docs/pages/C-01.md, docs/pages/C-02.md, docs/pages/C-03.md, docs/changelog/0025-os-demo-depth.md (new)
codes: C-01 C-02 C-03 L-01 L-03 L-06

## What changed

### `Meter` (new molecule, `src/components/molecule/Meter/`)

The capacity gauge the library did not have (request 2). Label, value, capacity, unit, percentage and a bar; `componentAttr('Meter')` on the root; CSS tokens only; one meta with three usages (three businesses, sizes / empty / full, `tone="prospect"`).

- **Never colour alone.** The value, the capacity + unit and the percentage are all text. At or past `warnAt` (default 0.9) the fill and the percentage turn `--color-warn` *and* the optional `warnLabel` word appears; the demo passes `demo.near_capacity` ("near capacity" / "casi al tope").
- **A11y.** `role="meter"` on the track with `aria-label`, `aria-valuenow / valuemin / valuemax` and `aria-valuetext="50 / 58 rooms · 86%"`. Nothing hover-only, nothing interactive, nothing to focus.
- **10-foot.** The track height is `calc(10px * var(--scale))` (6 px at `size="sm"`) and the value uses the type scale: measured 32 px at 360 / 390 / 768, 36 px at 1920, 48 px at 2560, 72 px at 3840, track 10 -> 22.5 px.
- **Two hosts, one component.** `tone="prospect"` reads `--lp-primary / --lp-surface / --lp-text / --lp-bg / --lp-font-display` with `--color-*` fallbacks. The mini OS runs on an 8-11 px em scale, so it sizes the gauge through the host properties `--meter-value-size / --meter-text-size / --meter-track-h` instead of restyling `.meter-*` from the landing module.
- Clamping stays in the component as well as in `asMeter`: `max < 1` becomes 1, `value` is clamped into `0..max`, a non-finite value reads 0.

### C-01 / C-02 role home

- `DemoShell` calls `industryFor(prospect)`; `Demo.ind` is now the industry as this prospect experiences it, so `todayFor`, `weekFor`, `threadsFor`, `peopleFor` and the departments board all follow the sub with no other change.
- `widgets.tsx`: the `meter` branch is `<Meter tone="prospect" …>` (was `Stat` + `ProgressBar`); `asMeter()` now also returns the sample's `unit` ("50 / 58 rooms").
- `sample.ts` `todayFor`: for a role matching `/owner|partner|director|manager/` where the resolved industry declares a meter, the strip leads with it and keeps four items - `Rooms occupied tonight 50 / 58 · Dogs in house 38 · Unread messages 7 · On shift Lucía +2`. Every other prospect's strip is unchanged.
- `sample.ts` `threadsFor` and the new `people.ts` `bizRoles(p, ind)`: sample staff come from the prospect's own roles, falling back to the resolved industry's (a hotel's handlers and walkers, a firm's paralegals) instead of an empty list.

### C-03 departments board

- One KPI per department: `kpis[i]`, wrapping only past the end (the dog hotel's eight departments take its eight KPIs; the firm's ninth column wraps to the first). Was `kpis[i % len]`, which showed three numbers over nine columns.
- Open items rotate through the resolved pains plus two house items, so no two adjacent columns read the same.
- No CSS change was needed: `.demo-board` is already `auto-fit, minmax(276px, 1fr)`.

### L-01 / L-03 / L-06 landing

- `HeroReveal` and `OgCard` read `industryFor(prospect)` (the hero's "still true this week" fact and the OG card's industry line now follow the sub).
- `MiniOs` renders the `meter` widget with the library `Meter` (`size="sm"`, `tone="prospect"`, mini host sizing) instead of its inline value / max line, and drops the duplicate `lp-w-title` for that kind - a meter carries its own label, and the same words twice in a 9 px box is noise.

### Measured (dev server, chromium, no console errors on any route)

| Route | 390 | 1280 | Notes |
| --- | --- | --- | --- |
| `/#/demo/pro_camila` | overflow 0 | overflow 0 | meter "50 / 58 rooms · 86%", today strip leads with it, 11 role options (owner, manager, front desk, groomer, handler, walker + 5 life) |
| `/#/demo/pro_camila/departments` | 1 column | 3 columns | 8 columns: Front desk / Dogs in house 38 · Hotel / Arriving-departing 9 / 6 · Grooming & Spa / Occupancy 86% · Daycare / Grooms 11 · People & pets / Pending vaccines 7 · Payments / Balance due $2,140 · Messages / Revenue today $3,480 · Marketing / Average stay 3.4 |
| `/#/demo/pro_alicia` | overflow 0 | overflow 0 | meter "73 / 90 cases · 81%"; roles owner attorney, attorney, paralegal, front desk, marketing, billing |
| `/#/demo/pro_alicia/departments` | 1 column | 3 columns | 9 columns, each with its own KPI (open cases 73, late items 9, deadlines 14, consults 6, intake queue 11, conversion 41%, paid / due $18,480 / $3,960, docs to review 5, then wrap) |
| `/#/demo/pro_valeria` (ES) | overflow 0 | overflow 0 | `lang="es"`, meter "TAPETES RESERVADOS, PRÓXIMA CLASE 12 / 15 tapetes · 80%", hint and strip in Spanish |
| `/#/demo/pro_valeria/departments` | 1 column | 3 columns | 8 columns, own KPI each |
| `/#/p/fetch-and-stay-san-diego` | overflow 0 | overflow 0 | hero devices show the meter in the phone, laptop and TV mockups |
| `/#/p/renters-shield-law-fresno/letter` | overflow 0 | overflow 0 | one meter in the letter's mockup |
| `/#/p/raiz-wellness-san-antonio` | overflow 0 | overflow 0 | two meters |

Also checked 360 / 768 / 1920 / 2560 / 3840 on C-01 and C-03 (no overflow; board 1 / 2 / 4 / 4 / 4 columns) and light + dark at 390 / 1280 on all nine routes. The only elements past the viewport at 390 are the landing role-view rail's cards, which sit in a horizontal scroller and measure identically on the unchanged `paws-and-play-austin` page (pre-existing, not from this pass). `scripts/frames.mjs` selectors (`.demo-role select option`, `a[href*="/role/"]`, `.demo-main`) are untouched.

### Gates

`npm run typecheck` clean; `npm run test:engine` 26 / 26. `vite build` left to the integrator (module workers do not build).

## New and changed contracts (Meter props)

```ts
interface MeterProps {
  value: number;            // clamped into 0..max; non-finite reads 0
  max: number;              // < 1 is treated as 1
  label: string;            // already localised by the caller
  unit?: string;            // read after the capacity: "50 / 58 rooms"
  hint?: string;            // line under the bar
  size?: 'sm' | 'md';       // default 'md'
  tone?: 'default' | 'prospect';  // 'prospect' reads --lp-* with --color-* fallbacks
  warnAt?: number;          // default 0.9
  warnLabel?: string;       // shown at or past warnAt (already localised)
  className?: string;
  style?: CSSProperties;    // host sizing only: --meter-value-size / --meter-text-size / --meter-track-h
}
```

- `os-demo/widgets.tsx` `asMeter(sample)` now returns `{ value, max, unit?, hint? }` (was `{ value, max, hint? }`); `Bi` fields, resolved by the caller.
- `os-demo/people.ts` new export `bizRoles(p, ind): string[]` - the prospect's business roles, falling back to the resolved industry's.
- New module string `demo.near_capacity` ("near capacity" / "casi al tope"). No new route, no new action, no new table, no new npm script.

## Requests to foundation

1. **Library page (D-01 / `/#/dev/components`)**: `Meter` is globbed by `src/design/library.ts` automatically; its meta lists `usedBy: C-01, C-02, L-01, L-03, L-06`. No shared file was touched.
2. **QA (existing card)**: the frames and OG jobs should re-run for the three new prospects now that the mockups contain a meter; `pro_camila` at 360 and 3840 is the meter fixture, `pro_alicia`'s departments board the nine-column one.
3. **Screenshots**: C-02 (owner view with the meter) and C-03 (nine columns) for `pro_alicia` and `pro_camila`; the C-01 / C-02 / C-03 page docs point at this changelog.
4. **Studio (T61)**: the S-02 profile editor's read-only sub-industry chips can use the same `Meter` for the sub's capacity hint.
5. **Engine, small**: `MeterSample.unit` is now rendered; when a future sub declares a meter without a unit the card reads "50 / 58" and stays correct, so no change is required - noting it so nobody "fixes" the optional field away.

## Proposed decisions

| # | Decision | Rejected alternative |
| --- | --- | --- |
| D-136 (proposed) | **A capacity reading is a `Meter`, never a `ProgressBar`.** `ProgressBar` reports progress towards completion (spec completeness, plan done); a meter reports a level inside a range (rooms tonight, caseload, mats) and carries `role="meter"`, the capacity and the unit. Both stay in the library with one job each. | Adding a `max` + `unit` variant to `ProgressBar` (one component with two semantics and the wrong ARIA role for half its uses); leaving the interim `Stat` + `ProgressBar` pair (two labels, a percentage with no capacity). |
| D-137 (proposed) | **A lead role's home leads with the capacity gauge**: for `/owner\|partner\|director\|manager/` where the resolved industry declares a `meter`, it is the first widget and the first item of the today strip. | Keeping the first KPI first and the meter second (Petrock's owner dashboard and Hoy's admin home both open on the gauge; the number a person opens the day on belongs at the top); showing both the meter and the KPI it replaced (four widgets per view, which every check and both renderers assume is three). |
| D-138 (proposed) | **A component is sized by its host through named custom properties** (`--meter-value-size / --meter-text-size / --meter-track-h`, as `Stat` already does with `--stat-value-size`), never by a page's CSS reaching into `.meter-*`. | Letting `landing.css` restyle the component for the mini OS (breaks "CSS only in the component's file" and the module contract); a third `size="xs"` on the component for one host at one em scale. |
| D-139 (proposed) | **C-03 shows each department its own KPI** (`kpis[i]`, wrapping only past the end) and rotates the open items per column. | `kpis[i % len]` (three numbers over nine columns); waiting for the deferred `departments[].kpi?: number` index (D-135) before showing the sub's eight KPIs at all. |

## Proposed surfaces.md rows

- Components paragraph: new molecule `Meter` (value / max / label / unit / hint, `size` sm / md, `tone` prospect, `warnAt` / `warnLabel`, `role="meter"`, host sizing via `--meter-value-size / --meter-text-size / --meter-track-h`), used by C-01, C-02 and the landing device mockups (L-01, L-03, L-06). Library count +1.
- Demo paragraph: C-01 / C-02 / C-03 read `industryFor(prospect)`; the `meter` widget renders as a `Meter`; a lead role's today strip leads with the capacity reading; C-03 shows one KPI per department.
- Landing paragraph: `HeroReveal` and `OgCard` read `industryFor(prospect)`; `MiniOs` renders `meter` widgets with the library `Meter`.
- Changelog line: `2026-09-20 · prompt 0005 (reference systems, v0.5.0) · this changelog: Meter molecule, the demo and the landing hero read industryFor(prospect), one KPI per department on C-03, lead roles lead with the gauge.`

## Kanban moves

- **T62 -> Done** (Opus 5, 2026-09-20): `Meter` component + `WidgetCard` and `MiniOs` adopt it; `DemoShell`, `HeroReveal`, `OgCard` read `industryFor(prospect)`; the `departments[].kpi?` index was not needed - `kpis[i]` covers all three subs, so that half of the card closes with D-139 instead of a schema change (D-135's index stays deferred for a sub whose KPIs are fewer than its departments).
- QA card (existing): add "regenerate frames / OG for `pro_camila`, `pro_alicia`, `pro_valeria` now that the mockups contain a meter"; screenshots C-02 (meter) and C-03 (nine columns).

Model: Opus 5.

## Integration note (0026)
Numbered by the reference items integration (Fable 5.1, 2026-09-20). The proposed rows kept their numbers, D-136..D-139. Request 1: `Meter` is on D-02 (43 components); request 2 done (frames regenerated for all six prospects at `--stride=2`, the meter is in the phone and laptop tours of `pro_camila`, `pro_alicia`, `pro_valeria`); request 3 done for the codes in the screenshot set (C-01..C-03 at 390 / 1280 with the default prospect; the script has no prospect flag, so the new prospects' C-02 / C-03 captures are a kanban card); request 4 is T61; request 5 noted in the engine contract. T62 -> Done in the kanban and the plan seed.
