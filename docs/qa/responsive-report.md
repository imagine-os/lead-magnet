# Responsive QA report

generated: 2026-09-20T22:01:35.543Z
routes: 14
widths: 360, 390, 768, 1280, 1920, 2560, 3840
themes: light, dark
cells: 196
failing_cells: 0

_Written by `npm run qa:responsive`. Fail = horizontal scroll, console error, visible text under 12 px, or a blank page. Runs as the super admin with dev mode off._

## Matrix (light / dark)

| Code | Route | 360 | 390 | 768 | 1280 | 1920 | 2560 | 3840 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `L-01` | `/p/:slug` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `L-02` | `/p/:slug/audit` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `L-03` | `/p/:slug/story` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `L-04` | `/p/:slug/letter` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-01` | `/demo/:prospectId` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-02` | `/demo/:prospectId/role/:role` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-03` | `/demo/:prospectId/departments` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-04` | `/demo/:prospectId/comms` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-05` | `/demo/:prospectId/money` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-06` | `/demo/:prospectId/life` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-07` | `/demo/:prospectId/settings` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `S-01` | `/studio` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `S-02` | `/studio/prospects/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-02` | `/dev/components` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
