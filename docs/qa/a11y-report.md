# Accessibility QA report

generated: 2026-09-19T02:40:26.702Z
server: preview
routes: 51 (built only)
widths: 390, 1280
theme: light, role: super admin, dev mode: off

_Written by `npm run qa:a11y`. axe-core tags: wcag2a, wcag2aa, wcag21a, wcag21aa. Keyboard walk: Tab through the first 40 focusable elements per route, checking a visible focus ring (computed outline or box-shadow) and a 44x44 hit target. Inline text (a span or link rendered inline, or a text-only link) is exempt from the target size (WCAG 2.5.8 inline exception). When Tab lands in a same-origin iframe the ring is read on the element focused inside the frame, because Chromium never matches iframe:focus; a frame whose document has nothing focused (an unloaded lazy thumbnail) is counted as focused-frame, not as a failure. SVG g controls are judged on their own outline, so the plan graph nodes carry a real ring._

## Totals

- axe violation instances: **0** by impact: none
- focus-ring failures (no visible indicator on Tab): **0**
- hit-target failures (< 44x44, not inline text): **0**

## Top rules

| rule | impact | routes hit | node instances |
| --- | --- | --- | --- |

## Per-route

| Code | Route | 390px violations | 1280px violations | 390px focus/target fails | 1280px focus/target fails |
| --- | --- | --- | --- | --- | --- |
| `L-01` | `/p/:slug` | 0 | 0 | 0/0 | 0/0 |
| `L-02` | `/p/:slug/audit` | 0 | 0 | 0/0 | 0/0 |
| `L-03` | `/p/:slug/story` | 0 | 0 | 0/0 | 0/0 |
| `L-04` | `/p/:slug/letter` | 0 | 0 | 0/0 | 0/0 |
| `L-05` | `/p/:slug/expired` | 0 | 0 | 0/0 | 0/0 |
| `C-01` | `/demo/:prospectId` | 0 | 0 | 0/0 | 0/0 |
| `C-02` | `/demo/:prospectId/role/:role` | 0 | 0 | 0/0 | 0/0 |
| `C-03` | `/demo/:prospectId/departments` | 0 | 0 | 0/0 | 0/0 |
| `C-04` | `/demo/:prospectId/comms` | 0 | 0 | 0/0 | 0/0 |
| `C-05` | `/demo/:prospectId/money` | 0 | 0 | 0/0 | 0/0 |
| `C-06` | `/demo/:prospectId/life` | 0 | 0 | 0/0 | 0/0 |
| `C-07` | `/demo/:prospectId/settings` | 0 | 0 | 0/0 | 0/0 |
| `B-01` | `/book/:prospectId` | 0 | 0 | 0/0 | 0/0 |
| `B-02` | `/book/:prospectId/confirmed` | 0 | 0 | 0/0 | 0/0 |
| `S-01` | `/studio` | 0 | 0 | 0/0 | 0/0 |
| `S-02` | `/studio/prospects/:id` | 0 | 0 | 0/0 | 0/0 |
| `S-03` | `/studio/prospects/:id/compose` | 0 | 0 | 0/0 | 0/0 |
| `S-04` | `/studio/prospects/:id/assets` | 0 | 0 | 0/0 | 0/0 |
| `S-05` | `/studio/prospects/:id/outreach` | 0 | 0 | 0/0 | 0/0 |
| `A-01` | `/admin` | 0 | 0 | 0/0 | 0/0 |
| `A-02` | `/admin/prospects/:id` | 0 | 0 | 0/0 | 0/0 |
| `A-03` | `/admin/events` | 0 | 0 | 0/0 | 0/0 |
| `A-04` | `/admin/outreach` | 0 | 0 | 0/0 | 0/0 |
| `A-05` | `/admin/bookings` | 0 | 0 | 0/0 | 0/0 |
| `K-01` | `/plan` | 0 | 0 | 0/0 | 0/0 |
| `K-02` | `/plan/list` | 0 | 0 | 0/0 | 0/0 |
| `K-03` | `/plan/timeline` | 0 | 0 | 0/0 | 0/0 |
| `K-04` | `/plan/tasks/:id` | 0 | 0 | 0/0 | 0/0 |
| `W-01` | `/site` | 0 | 0 | 0/0 | 0/0 |
| `W-02` | `/site/how` | 0 | 0 | 0/0 | 0/0 |
| `W-03` | `/site/pricing` | 0 | 0 | 0/0 | 0/0 |
| `R-01` | `/proposal/:prospectId` | 0 | 0 | 0/0 | 0/0 |
| `M-01` | `/manual` | 0 | 0 | 0/0 | 0/0 |
| `M-02` | `/manual/intake` | 0 | 0 | 0/0 | 0/0 |
| `M-03` | `/manual/compose` | 0 | 0 | 0/0 | 0/0 |
| `M-04` | `/manual/outreach` | 0 | 0 | 0/0 | 0/0 |
| `M-05` | `/manual/calls` | 0 | 0 | 0/0 | 0/0 |
| `D-01` | `/dev` | 0 | 0 | 0/0 | 0/0 |
| `D-02` | `/dev/components` | 0 | 0 | 0/0 | 0/0 |
| `D-03` | `/dev/tables` | 0 | 0 | 0/0 | 0/0 |
| `D-03` | `/dev/tables/:table` | 0 | 0 | 0/0 | 0/0 |
| `D-04` | `/dev/actions` | 0 | 0 | 0/0 | 0/0 |
| `D-05` | `/dev/rules` | 0 | 0 | 0/0 | 0/0 |
| `D-06` | `/docs` | 0 | 0 | 0/0 | 0/0 |
| `D-06` | `/docs/pages/:code` | 0 | 0 | 0/0 | 0/0 |
| `D-07` | `/dev/canvas` | 0 | 0 | 0/0 | 0/0 |
| `D-08` | `/dev/qa` | 0 | 0 | 0/0 | 0/0 |
| `D-09` | `/dev/feedback` | 0 | 0 | 0/0 | 0/0 |
| `HUB-01` | `/` | 0 | 0 | 0/0 | 0/0 |
| `HUB-02` | `/no-access` | 0 | 0 | 0/0 | 0/0 |
| `L-06` | `/og/:slug` | 0 | 0 | 0/0 | 0/0 |
