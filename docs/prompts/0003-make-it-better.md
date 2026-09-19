# 0003 - Make it better and better

date: 2026-09-19 01:18 UTC · from: Justin Massion via Slack #lead-magnets (thread of prompt 0001) · surface: all · follows: 0002

## Prompt (verbatim)

Make it better and better

## Response

Pass 2 of Lead Magnet, shipped as **v0.3.0** (changelogs 0010..0016). Read as "finish phase 3, open phase 4, and raise the floor everywhere the first pass had left it low".

**What shipped**

- **Ops manual** (T33, M-01..M-05, Opus 5, changelog 0011): five chapters in English and Spanish as markdown under `docs/ops-manual/<lang>/`, rendered in-app; every number comes from a live-data directive, never typed (R-M01); five `> DECISION NEEDED:` blocks collected on M-01 for Justin.
- **Control surface** (T45 + T47 groundwork, Fable 5.1, changelog 0010): one WebMCP tool per action id generated from the manifest (136 tools), `window.__leadmagnet.runAction`, the `npm run actions -- list | export | run` CLI, D-04's run modal, `docs/reference/control.md` + the exported manifest and voice vocabulary; arrow-key / gamepad spatial navigation on the hub and the OS demo.
- **Annotations** (T49, Opus 5, changelog 0012): testers annotate the element itself; every pin records the selector, the exact library component, viewport, theme, role; D-09 refuses `done` without a triage reason (R-F01) and weighs the author (R-F02).
- **Studio pass 2** (Opus 5, changelog 0013): conversational intake that records every answer as an `intake_turns` row, paste-facts extraction that proposes and never writes, likely / possible stack tiers, A/B variants as two live `pages` rows on one slug, a 22-industry catalog with real products and prices.
- **Landing pass 2** (T41-lite, Opus 5, changelog 0014): video-on-scroll is now real frames of the running demo (`npm run frames`), A/B bucketing by session, per-page meta and a social card (L-06, `npm run og`).
- **Spanish audit + accessibility scan** (T30, T32, Sonnet 5, changelog 0015): `npm run i18n:check` (3 real gaps fixed, 33 documented loanwords left), `npm run qa:a11y` (axe WCAG 2.1 AA + a keyboard walk on every built route).
- **Integration pass 2** (T21, Fable 5.1, changelog 0016): the cross-module fixes at the root - contrast tokens, computed `--lp-on-primary`, DataTable row-link overlay, 44 px targets, the OS demo's phone chrome (291 -> 109 px), `data-component` on all 38 component roots, `IndustryKey` from the catalog, `hub.tv_hint`; decisions D-056..D-092; screenshots for every code; both QA matrices green.

**Gates at push**: `npm run build` green; 18 engine checks; `npm run i18n:check` 33 flags (all documented, landing 0); `npm run qa:responsive` 714 cells / 0 failing; `npm run qa:a11y` 0 axe violations, 0 focus failures, 0 hit-target failures (from 2034 / 87 / 775 at the sweep's first run); code review (medium) on the diff: 4 low findings, all accepted trade-offs recorded in changelog 0016.

**Model**: Fable 5.1 planned, integrated, reviewed and wrote the control layer; Opus 5 built the manual, annotations, studio and landing modules; Sonnet 5 ran the Spanish audit and the accessibility scan. Every commit names its model.
