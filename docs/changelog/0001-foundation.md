# 0001 - Foundation

version: 0.1.0
date: 2026-09-18
prompt: 0001
intent: "Let's build a template site for the greatest lead magnets ever" - the foundation every module builds on, plus the plan and the conversion reasoning Justin asked for.
decision: (1) Petrock-shaped stack and hub pattern (D-001, D-002); (2) page codes L/C/B/S/A/K/W/R/M/D/HUB (D-003); (3) five roles with string permissions (D-004); (4) airtight module contract for six parallel Opus 5 workers (D-005); (5) pure shared engine with unit checks (D-006); (6) MockProvider seam (D-007); (7) actions manifest as WebMCP surface (D-008); (8) one events table (D-009); (9) four archetypes from a shared Section union (D-010); (10) plan as data (D-020); (11) in-app page canvas (D-021).
rejected: Next.js static export (house pattern is Vite + HashRouter); Google Fonts (proxy, external requests); computing personalization inside landing components (untestable); static exported canvas HTML (manifest is live); a test runner dependency (esbuild already ships with Vite).
files: package.json, vite.config.ts, tsconfig.json, index.html, .github/workflows/pages.yml, scripts/*, src/**, supabase/schema.sql, docs/**
codes: HUB-01 HUB-02 D-01 D-02 D-03 D-04 D-05 D-06 D-07 D-08 D-09 (built); L-01..L-05 C-01..C-07 B-01 B-02 S-01..S-05 A-01..A-05 K-01..K-04 W-01..W-03 R-01 M-01..M-05 (stubs)

## What changed
- Repo scaffold, Vite 5 / React 18 / TS strict, GitHub Pages workflow, `base: './'`, version 0.1.0.
- `src/design/tokens.ts` -> generated `tokens.css`: Imagine ink / electric palette, light + dark, `--scale` bands at 1920 / 2560 / 3840, `prospectStyle()` for per-prospect `--lp-*` theming.
- App shell: registry globbing `src/modules/*/index.ts` (built beats stub), `RequireRole` + shell + `ErrorBoundary` per route, `window.__leadmagnet` manifest, `DesktopShell` (sidebar -> drawer under 900).
- Auth: roles, permissions, demo users, `SessionProvider` (`can`, `hasRole`, `switchUser`, view-as, dev mode).
- Data seam: `DataProvider`, `MockProvider` (`leadmagnet.db.v1`), hooks, `defineTables` with 9 core tables, seeds (3 prospects, guesses, pages, assets, events, touches, bookings, feedback, 31 tasks), `npm run sql`.
- Engine: catalog of 11 industries, `guessStack`, `savings`, `deriveRoleViews`, `pickArchetype`, `composePage`, `imagePrompts`, intake (`nextQuestions`, `applyAnswer`, `adaptFromEvents`, `Enricher`). `npm run test:engine` (9 checks).
- Actions bus + tracking helper.
- 36 components with metas; `Placeholder` per P-09; `DeviceMockup` phone / laptop / TV.
- Modules: `hub` (HUB-01, HUB-02), `dev` (D-01..D-09 incl. the page canvas), `_stubs` (every planned code, 37 stubs).
- Scripts: tokens, sql, gen-page-docs, screenshots, qa-responsive (7 widths), test-engine.
- Docs: README, CLAUDE.md, docs/README, platform-principles, project-brief, build-plan, decisions D-001..D-023, kanban, prompt 0001, page docs for every code, surfaces, conversion-playbook, house-pattern, company-os, data-model, qa/README.

## New and changed contracts
- `PageSpec.actions: ActionDef[]` is required; `defineSpec()` validates the code regex.
- `RouteDef.surface` in `public | demo | studio | admin | plan | dev | docs | manual`.
- `SeedCtx.ids.prospects = ['pro_maya', 'pro_daniel', 'pro_priya']`; page ids `pg_maya, pg_daniel, pg_priya`; slugs `paws-and-play-austin, sonrisa-dental-miami, highline-hospitality-denver`.
- `track(type, meta, { page_id, prospect_id })`; `useActions(code, handlers)`.
- Engine function signatures: see `CLAUDE.md` "Engine contract".

## Screenshots
`docs/screenshots/HUB-01/{390,1280}.jpg`, `docs/screenshots/D-07/{390,1280}.jpg`, `docs/screenshots/L-01/{390,1280}.jpg` (stub) - pipeline proof; T31 covers every page.

## Verification
`npm run build` green (tokens -> tsc -> vite); `npm run test:engine` 9 / 9; `npm run screenshots -- --codes=HUB-01,D-07,L-01` no console errors.
