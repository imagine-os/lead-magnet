# Responsive QA report

generated: 2026-09-19T21:16:16.642Z
routes: 51
widths: 360, 390, 768, 1280, 1920, 2560, 3840
themes: light, dark
cells: 714
failing_cells: 0

_Written by `npm run qa:responsive`. Fail = horizontal scroll, console error, visible text under 12 px, or a blank page. Runs as the super admin with dev mode off._

## Matrix (light / dark)

| Code | Route | 360 | 390 | 768 | 1280 | 1920 | 2560 | 3840 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `L-01` | `/p/:slug` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `L-02` | `/p/:slug/audit` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `L-03` | `/p/:slug/story` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `L-04` | `/p/:slug/letter` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `L-05` | `/p/:slug/expired` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-01` | `/demo/:prospectId` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-02` | `/demo/:prospectId/role/:role` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-03` | `/demo/:prospectId/departments` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-04` | `/demo/:prospectId/comms` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-05` | `/demo/:prospectId/money` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-06` | `/demo/:prospectId/life` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-07` | `/demo/:prospectId/settings` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `B-01` | `/book/:prospectId` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `B-02` | `/book/:prospectId/confirmed` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `S-01` | `/studio` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `S-02` | `/studio/prospects/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `S-03` | `/studio/prospects/:id/compose` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `S-04` | `/studio/prospects/:id/assets` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `S-05` | `/studio/prospects/:id/outreach` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-01` | `/admin` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-02` | `/admin/prospects/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-03` | `/admin/events` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-04` | `/admin/outreach` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-05` | `/admin/bookings` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `K-01` | `/plan` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `K-02` | `/plan/list` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `K-03` | `/plan/timeline` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `K-04` | `/plan/tasks/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `W-01` | `/site` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `W-02` | `/site/how` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `W-03` | `/site/pricing` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `R-01` | `/proposal/:prospectId` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-01` | `/manual` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-02` | `/manual/intake` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-03` | `/manual/compose` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-04` | `/manual/outreach` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-05` | `/manual/calls` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-01` | `/dev` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-02` | `/dev/components` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-03` | `/dev/tables` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-03` | `/dev/tables/:table` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-04` | `/dev/actions` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-05` | `/dev/rules` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-06` | `/docs` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-06` | `/docs/pages/:code` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-07` | `/dev/canvas` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-08` | `/dev/qa` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-09` | `/dev/feedback` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `HUB-01` | `/` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `HUB-02` | `/no-access` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `L-06` | `/og/:slug` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
