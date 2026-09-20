# QA

Generated reports live here; do not edit by hand.

| File | Written by | What |
| --- | --- | --- |
| `responsive-report.md` / `.json` | `npm run qa:responsive` | Every route x 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840 x light / dark. Fail = horizontal scroll, console error, text < 12 px, blank page. |
| `a11y-report.md` / `.json` | `npm run qa:a11y` | Every built route x 390 / 1280: axe-core WCAG 2.1 AA violations plus a 40-step keyboard walk (visible focus ring, 44 px hit target; inline text and iframes handled as the report header says). |
| `dpad-report.md` / `.json` | `npm run qa:dpad` | Every built route at 1920, arrow keys only, breadth-first from nothing focused: reachable / candidates, primary CTAs never reached, dead ends vs arrow-owning controls, Backspace behaviour, routes without the hook. Advisory until `--strict` becomes a gate (T58). |
| `../screenshots/<CODE>/<width>[-dark].jpg` + `routes.json` | `npm run screenshots` | Page screenshots and the served route manifest. |

Interactive equivalents: `/#/dev/qa` (D-08, side-by-side ViewportFrames), `/#/dev/canvas` (D-07, every page with live thumbnails).

Run order: `npm run build` first (both scripts start `vite preview` on the built `dist/`). Boot rule (D-125): every script waits for `#root > *:not(dialog)` - the command palette's closed `<dialog>` is the first child of `#root` on every route and is not a page. `qa:a11y` also waits for the page to settle (same-origin iframes booted, finite animations / transitions finished, 4 s cap) and reads hit targets to 0.1 px; both rules are printed in its report header. Run the matrices one at a time: three Chromiums in parallel starve the reveal transitions and produce mid-fade false positives even with the settle wait. Chromium is preinstalled at `/opt/pw-browsers`; never run `playwright install`. External requests are blocked so the scripts work behind the proxy.

Phase 3 (T31, T32) filled this folder in v0.3.0: every built code at 390 / 1280, the 7-width set for the key pages, the responsive matrix and the a11y report; v0.4.0 added the d-pad rehearsal (T47) and the pass-3 sweep re-ran all four on the v0.4.0 build (changelog 0023 "Sweeps": 714 / 0; a11y 0 focus / 0 hit-target with the S-03 / W-01 preview-frame contrast residue judged in its header; 49 / 51 hooked). Re-run all four after every pass. Known fixture limit: `qa:dpad` reports B-02 as NO HOOK because the default `pro_maya` has no booking row (kanban card). v0.5.0 (changelog 0026) re-ran `qa:responsive` and `qa:a11y` on the codes the reference items pass touched (C-01..C-07, L-01..L-04, S-01, S-02, D-02) and regenerated frames for six prospects: `npm run frames -- --stride=2 --quality=55 --desk-quality=38` is the setting that keeps `public/frames` + `public/og` under 5 MB with six prospects (`--stride=N` keeps every Nth scroll step of each tour stop); `pro_camila` is the meter fixture and `pro_alicia`'s departments board the nine-column one.
