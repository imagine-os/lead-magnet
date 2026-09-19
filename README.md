# Lead Magnet

**Hyper-personalized landing pages whose lead magnet is a pre-built, fully themed operations system for one prospect.** From what we know about a prospect (business, style, life, the roles of the people around them) we guess their software stack and what they can cut, derive departments and roles, compose the highest-converting landing page, show their OS live, and push them to the next stage: open the demo or book a call. Outreach, proposal and content connect to it; everything is tracked; as the AI intake learns more, the page adapts.

- **Live:** https://imagine-os.github.io/lead-magnet/ (GitHub Pages, Actions source; deploys on every push to `main`)
- **Start here:** `/#/` (HUB-01 testing hub) then `docs/README.md`, `CLAUDE.md`, `docs/build-plan.md`
- **Version:** 0.4.0 (pass 3: voice controller + command palette, d-pad on every shell, A/B readout, sub-industry catalog + intake, landing and demo pass 3, nine component requests closed)

## What is in the box (v0.4.0)

| Count | Note |
| --- | --- |
| 51 routes · 51 built · 0 stubs | every planned page code is registered (`src/modules/_stubs`) and built; L-06 `/og/:slug` is the hidden social-card route |
| 11 tables | prospects, stack_guesses, pages, events, bookings (with contact columns), assets, touches, tasks, feedback, recommendations, intake_turns |
| 42 components | `src/components/<tier>/<Name>/` with metas at `/#/dev/components`; every root carries `data-component="<Name>"` so annotation pins name the real component; `CommandPalette`, `ConfirmDialog`, `DateRange`, `PairedBarChart` since 0.4.0 |
| 51 rules | `/#/dev/rules` (core R-C / R-P / R-E + plan R-K, studio R-S, landing R-L, demo R-D, booking R-B, admin R-A, proposal R-R, website R-W) |
| 227 declared actions (144 unique ids = 144 WebMCP tools) | `/#/dev/actions`, the WebMCP surface and the voice vocabulary (`CommandPalette`, Ctrl/Cmd+K, typed or spoken); `npm run actions -- list | export | run`; handlers read the latest render |
| 21 engine checks + 18 voice checks | `npm run test:engine` (engine, catalog coverage, sub-industry intake, the shared slot generator), `npm run test:voice` (the phrase matcher over the exported vocabulary) |
| 3 seeded prospects | dog daycare (Austin, en, warm), two-location dental (Miami, es, cold), restaurant group (Denver, en, hot); one live page each plus a live variant B on two slugs with seeded sessions, stack guesses, assets, events, touches |
| 4 archetypes | Reveal / Savings Audit / Walkthrough / Letter, `docs/reference/conversion-playbook.md` |
| 42 plan tasks | `/#/plan` (Kanban, list, dependency graph, task detail) and `docs/build-plan.md`: 28 done, 0 doing, 6 backlog, 7 awaiting Justin, 1 blocked |

Counts come from the hub footer; re-measure when you change them.

## Run

```bash
npm install                 # fonts ship via @fontsource (offline)
npm run dev                 # http://localhost:5173/#/
npm run build               # tokens -> tsc --noEmit -> vite build (green before every push)
npm run test:engine         # pure engine checks
npm run test:voice          # pure voice-matcher checks over the exported vocabulary
npm run sql                 # supabase/schema.sql + docs/data-model.md
npm run screenshots -- --codes=HUB-01,D-07   # after build; docs/screenshots/<CODE>/<width>.jpg
npm run qa:responsive       # after build; docs/qa/responsive-report.{md,json}
npm run qa:dpad             # after build; arrow-keys-only walk -> docs/qa/dpad-report.{md,json}
```

Node 22 (`--experimental-strip-types` for `.mjs` scripts importing `.ts`). Chromium is preinstalled at `/opt/pw-browsers`; never run `playwright install`.

## Map

`src/engine` (pure personalization: catalog, stack guess, savings, role views, archetype picker, composer, image prompts, adaptive intake, booking slots) · `src/modules/*` (pages; each exports `{ routes, strings }`) · `src/data` (DataProvider seam, MockProvider, schema, seed) · `src/components` (library) · `src/design` (tokens) · `src/actions` (actions bus = WebMCP surface) · `src/tracking` (`track()`) · `docs/` (prompts, changelog, decisions, kanban, pages, reference).

Rules for agents: `CLAUDE.md`. Models: Fable 5.1 (foundation, integration, shared code, control layer), Opus 5 (the modules and their passes), Sonnet 5 (mechanical passes: Spanish fill, QA matrices, catalog fill).
