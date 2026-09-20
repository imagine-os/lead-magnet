# Accessibility QA report

generated: 2026-09-20T22:05:22.816Z
server: preview
routes: 6 (built only)
widths: 390, 1280
theme: light, role: super admin, dev mode: off

_Written by `npm run qa:a11y`. axe-core tags: wcag2a, wcag2aa, wcag21a, wcag21aa. Keyboard walk: Tab through the first 40 focusable elements per route, checking a visible focus ring (computed outline or box-shadow) and a 44x44 hit target. Inline text (a span or link rendered inline, or a text-only link) is exempt from the target size (WCAG 2.5.8 inline exception). When Tab lands in a same-origin iframe the ring is read on the element focused inside the frame, because Chromium never matches iframe:focus; a frame whose document has nothing focused (an unloaded lazy thumbnail) is counted as focused-frame, not as a failure. SVG g controls are judged on their own outline, so the plan graph nodes carry a real ring. Boot = the first non-dialog child of #root (the command palette's closed dialog is mounted on every route); axe and the walk run after the page has settled (same-origin iframes booted, reveal-pending sections revealed, finite animations and transitions finished, capped at 4 s), so a section mid-fade is never measured; target sizes are read to 0.1 px, so a 44 px control offset by a fractional transform counts as 44. Residue rule (pass 3, D-125): colour-contrast nodes reported INSIDE a same-origin preview iframe whose landing sections are mid-reveal (S-03 and W-01 preview frames: the sections' 1.2 s reveal fallback runs on the frame's own throttled timers and the fade can still be under way when axe reads the frame) are checker timing, not a page defect - the same nodes pass on their own route (L-01..L-04) and in a standalone probe six seconds after load. They are counted in the totals and named per route below; a contrast node on the host page itself, or inside a frame that has finished revealing, is a real finding._

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
| `L-04` | `/p/:slug/letter` | 0 | 0 | 0/0 | 0/0 |
| `C-01` | `/demo/:prospectId` | 0 | 0 | 0/0 | 0/0 |
| `C-02` | `/demo/:prospectId/role/:role` | 0 | 0 | 0/0 | 0/0 |
| `C-03` | `/demo/:prospectId/departments` | 0 | 0 | 0/0 | 0/0 |
| `D-02` | `/dev/components` | 0 | 0 | 0/0 | 0/0 |
