# QA

Generated reports live here; do not edit by hand.

| File | Written by | What |
| --- | --- | --- |
| `responsive-report.md` / `.json` | `npm run qa:responsive` | Every route x 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840 x light / dark. Fail = horizontal scroll, console error, text < 12 px, blank page. |
| `../screenshots/<CODE>/<width>[-dark].jpg` + `routes.json` | `npm run screenshots` | Page screenshots and the served route manifest. |

Interactive equivalents: `/#/dev/qa` (D-08, side-by-side ViewportFrames), `/#/dev/canvas` (D-07, every page with live thumbnails).

Run order: `npm run build` first (both scripts start `vite preview` on the built `dist/`). Chromium is preinstalled at `/opt/pw-browsers`; never run `playwright install`. External requests are blocked so the scripts work behind the proxy.

Phase 3 (T31, T32, Sonnet 5) fills this folder for every page after integration.
