# D-pad / remote rehearsal report

generated: 2026-09-19T20:02:26.419Z
server: external
routes: 51 (built only)
width: 1920 (16:9), theme: light, role: super admin, dev mode: off, max steps per route: 400

_Written by `npm run qa:dpad`. Arrow keys only, breadth-first from nothing focused: every element reached is left with Up / Down / Left / Right. Candidates follow the hook's own rule (visible, enabled, not under `[data-spatial="skip"]`, not an iframe). "NO HOOK" = the first arrow focused nothing (no `useSpatialNav` on that shell yet). Dead end = an element from which no arrow moves while the page has more than one candidate. Primary CTA = `.btn-primary`, `.btn-accent`, `[data-cta="primary"]`. Back = Backspace from the first element went one hash level up (`up`), stayed (`stay`: a root route) or was skipped because the element is a text field. Arrow owner = a native select / text field the d-pad cannot leave with an arrow (Escape parks focus, then the next arrow moves on; Tab also works). Coverage is bounded by the step budget: a route marked (budget) has more elements than the walk visited, not necessarily unreachable ones. A page that re-renders while the walk changes its state (a radiogroup reacting to Left / Right) can produce a one-off dead end: re-check those by hand before filing._

## Totals

- routes with the d-pad hook: **42 / 51** (no hook: L-05, B-01, B-02, W-01, W-02, W-03, R-01, HUB-02, L-06)
- primary CTAs never reached by arrows: **10**
- dead ends (d-pad traps): **3**
- arrow-owning controls met (select / text field, leave with Escape or Tab): 96
- routes that hit the 400-step budget: A-04, K-01, K-02, M-01, D-04, D-05
- average coverage (reachable / candidates): **55%**
- page errors: 0 · console errors: 0

## Per route

| code | route | hook | reachable / candidates | primaries reached | dead ends | owners | back | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| L-01 | `/p/paws-and-play-austin` | yes | 47 / 67 (70%) | 4 / 4 | 0 | 0 | stay |  |
| L-02 | `/p/paws-and-play-austin/audit` | yes | 65 / 85 (76%) | 6 / 6 | 0 | 0 | stay |  |
| L-03 | `/p/paws-and-play-austin/story` | yes | 41 / 61 (67%) | 4 / 4 | 0 | 0 | stay |  |
| L-04 | `/p/paws-and-play-austin/letter` | yes | 26 / 28 (93%) | 4 / 4 | 0 | 0 | stay |  |
| L-05 | `/p/paws-and-play-austin/expired` | **no** | 0 / 10 (0%) | 0 / 2 | 0 | 0 | - | unreached CTA "Book a call"; unreached CTA "Request a fresh workspace" |
| C-01 | `/demo/pro_maya` | yes | 24 / 30 (80%) | 1 / 1 | 0 | 1 | up | owner Select "Business · OwnerBusiness" |
| C-02 | `/demo/pro_maya/role/owner` | yes | 27 / 30 (90%) | 1 / 1 | 0 | 1 | up | owner Select "Business · OwnerBusiness" |
| C-03 | `/demo/pro_maya/departments` | yes | 6 / 28 (21%) | 1 / 1 | 0 | 1 | up | owner Select "Business · OwnerBusiness" |
| C-04 | `/demo/pro_maya/comms` | yes | 7 / 25 (28%) | 2 / 2 | 0 | 1 | up | owner Select "Business · OwnerBusiness" |
| C-05 | `/demo/pro_maya/money` | yes | 5 / 17 (29%) | 2 / 2 | 0 | 1 | up | owner Select "Business · OwnerBusiness" |
| C-06 | `/demo/pro_maya/life` | yes | 6 / 26 (23%) | 2 / 2 | 0 | 1 | up | owner Select "Business · OwnerBusiness" |
| C-07 | `/demo/pro_maya/settings` | yes | 5 / 32 (16%) | 2 / 2 | 0 | 1 | up | owner Select "Business · OwnerBusiness" |
| B-01 | `/book/pro_maya` | **no** | 0 / 75 (0%) | 0 / 0 | 0 | 0 | - |  |
| B-02 | `/book/pro_maya/confirmed` | **no** | 0 / 4 (0%) | 0 / 1 | 0 | 0 | - | unreached CTA "Pick a time" |
| S-01 | `/studio` | yes | 32 / 38 (84%) | 1 / 1 | 0 | 1 | up | owner Select "Industry" |
| S-02 | `/studio/prospects/pro_maya` | yes | 43 / 81 (53%) | 5 / 5 | 0 | 4 | up | owner Select "Choose…Under $250k$250k "; owner Select "BoldWarmCleanLuxuryPlayf"; owner Select "DisplayHumanistSerifMono" |
| S-03 | `/studio/prospects/pro_maya/compose` | yes | 39 / 41 (95%) | 3 / 3 | 0 | 0 | up |  |
| S-04 | `/studio/prospects/pro_maya/assets` | yes | 33 / 70 (47%) | 12 / 12 | 0 | 4 | up | owner Textarea "Cinematic hero image for"; owner Textarea "Portrait-orientation car"; owner Textarea "Phone screen mockup of a" |
| S-05 | `/studio/prospects/pro_maya/outreach` | yes | 33 / 35 (94%) | 4 / 4 | 0 | 2 | up | owner Textarea "Maya - we built Paws & P"; owner Select "Channel" |
| A-01 | `/admin` | yes | 48 / 55 (87%) | 1 / 1 | 0 | 1 | up | owner Select "highline-hospitality-den" |
| A-02 | `/admin/prospects/pro_maya` | yes | 26 / 32 (81%) | 0 / 0 | 0 | 0 | up |  |
| A-03 | `/admin/events` | yes | 24 / 713 (3%) | 0 / 0 | 0 | 4 | up | owner Select "Alls_ab_daniel_a_00s_ab_"; owner Select "AllPaws & Play AustinSon"; owner Select "AllVariant AVariant B" |
| A-04 | `/admin/outreach` | yes | 25 / 31 (81%) (budget) | 0 / 0 | 0 | 37 | up | owner Select "DraftScheduledSentOpened"; owner Select "DraftScheduledSentOpened"; owner Select "DraftScheduledSentOpened" |
| A-05 | `/admin/bookings` | yes | 21 / 25 (84%) | 0 / 0 | 0 | 7 | up | owner Select "Set status"; owner Select "Set status"; owner Select "Set status" |
| K-01 | `/plan` | yes | 89 / 235 (38%) (budget) | 0 / 0 | 0 | 12 | up | owner Select "Status of T50"; owner Select "Status of T01"; owner Select "Status of T40" |
| K-02 | `/plan/list` | yes | 102 / 138 (74%) (budget) | 0 / 0 | 0 | 0 | up |  |
| K-03 | `/plan/timeline` | yes | 37 / 39 (95%) | 0 / 0 | 0 | 0 | up |  |
| K-04 | `/plan/tasks/pro_maya` | yes | 21 / 23 (91%) | 1 / 1 | 0 | 0 | up |  |
| W-01 | `/site` | **no** | 0 / 42 (0%) | 0 / 2 | 0 | 0 | - | unreached CTA "Get yours"; unreached CTA "Get yours" |
| W-02 | `/site/how` | **no** | 0 / 17 (0%) | 0 / 1 | 0 | 0 | - | unreached CTA "Get yours" |
| W-03 | `/site/pricing` | **no** | 0 / 21 (0%) | 0 / 1 | 0 | 0 | - | unreached CTA "Choose plan" |
| R-01 | `/proposal/pro_maya` | **no** | 0 / 11 (0%) | 0 / 2 | 0 | 0 | - | unreached CTA "Book the walkthrough"; unreached CTA "Accept proposal" |
| M-01 | `/manual` | yes | 24 / 41 (59%) (budget) | 0 / 0 | 0 | 8 | up | owner Select "I · How Lead Magnet work"; owner Select "I · How Lead Magnet work"; owner Select "I · How Lead Magnet work" |
| M-02 | `/manual/intake` | yes | 21 / 23 (91%) | 0 / 0 | 0 | 1 | up | owner Select "I · How Lead Magnet work" |
| M-03 | `/manual/compose` | yes | 20 / 23 (87%) | 0 / 0 | 0 | 1 | up | owner Select "I · How Lead Magnet work" |
| M-04 | `/manual/outreach` | yes | 20 / 23 (87%) | 0 / 0 | 0 | 1 | up | owner Select "I · How Lead Magnet work" |
| M-05 | `/manual/calls` | yes | 19 / 21 (90%) | 0 / 0 | 0 | 1 | up | owner Select "I · How Lead Magnet work" |
| D-01 | `/dev` | yes | 82 / 84 (98%) | 0 / 0 | 0 | 0 | up |  |
| D-02 | `/dev/components` | yes | 46 / 159 (29%) | 8 / 8 | 0 | 0 | up |  |
| D-03 | `/dev/tables` | yes | 31 / 33 (94%) | 0 / 0 | 0 | 0 | up |  |
| D-03 | `/dev/tables/prospects` | yes | 31 / 33 (94%) | 0 / 0 | 0 | 0 | up |  |
| D-04 | `/dev/actions` | yes | 102 / 476 (21%) (budget) | 0 / 0 | 0 | 0 | up |  |
| D-05 | `/dev/rules` | yes | 106 / 172 (62%) (budget) | 0 / 0 | 0 | 0 | up |  |
| D-06 | `/docs` | yes | 24 / 27 (89%) | 0 / 0 | 0 | 0 | up |  |
| D-06 | `/docs/pages/HUB-01` | yes | 20 / 72 (28%) | 0 / 0 | 0 | 0 | up |  |
| D-07 | `/dev/canvas` | yes | 9 / 191 (5%) | 0 / 0 | 3 | 0 | up | dead end DesktopShell "Page canvas. Zoom with plus and minus, fit with 0, pan with "; dead end DesktopShell "C-05Load live thumbnail"; dead end DesktopShell "Money/demo/:prospectId/moneyTheir crossed-out stack with the" |
| D-08 | `/dev/qa` | yes | 27 / 29 (93%) | 0 / 0 | 0 | 1 | up | owner Select "A-01 · Funnel overviewA-" |
| D-09 | `/dev/feedback` | yes | 21 / 24 (88%) | 0 / 0 | 0 | 1 | up | owner Select "allcommentrequestbugidea" |
| HUB-01 | `/` | yes | 53 / 64 (83%) | 3 / 3 | 0 | 3 | stay | owner Select "Myself (super admin)Stra"; owner Select "Justin (super admin) · S"; owner Select "Myself (super admin)Stra" |
| HUB-02 | `/no-access` | **no** | 0 / 9 (0%) | 0 / 0 | 0 | 0 | - |  |
| L-06 | `/og/paws-and-play-austin` | **no** | 0 / 4 (0%) | 0 / 1 | 0 | 0 | - | unreached CTA "Open the page" |

## Console errors

none
