# Lead Magnet

**Hyper-personalized landing pages whose lead magnet is a pre-built, fully themed operations system for one prospect.** From what we know about a prospect (business, style, life, the roles of the people around them) we guess their software stack and what they can cut, derive departments and roles, compose the highest-converting landing page, show their OS live, and push them to the next stage: open the demo or book a call. Outreach, proposal and content connect to it; everything is tracked; as the AI intake learns more, the page adapts.

- **Live:** https://imagine-os.github.io/lead-magnet/ (GitHub Pages, Actions source; deploys on every push to `main`)
- **Start here:** `/#/` (HUB-01 testing hub) then `docs/README.md`, `CLAUDE.md`, `docs/build-plan.md`
- **Version:** 0.2.0 (first full pass: foundation + seven modules + integration)

## What is in the box (v0.2.0)

| Count | Note |
| --- | --- |
| 50 routes · 45 built · 5 stubs | every planned page code is registered (`src/modules/_stubs`); only the ops manual M-01..M-05 (T33) is still a stub |
| 10 tables | prospects, stack_guesses, pages, events, bookings (with contact columns), assets, touches, tasks, feedback, recommendations |
| 37 components | `src/components/<tier>/<Name>/` with metas at `/#/dev/components` (+ `FunnelChart`) |
| 38 rules | `/#/dev/rules` (core R-C / R-P / R-E + plan R-K, studio R-S, landing R-L, demo R-D, booking R-B, admin R-A, proposal R-R, website R-W) |
| 175 declared actions (117 unique ids) | `/#/dev/actions`, the WebMCP surface; handlers read the latest render |
| 11 engine checks | `npm run test:engine` (engine + the shared slot generator) |
| 3 seeded prospects | dog daycare (Austin, en, warm), two-location dental (Miami, es, cold), restaurant group (Denver, en, hot); one live page each, stack guesses, assets, events, touches |
| 4 archetypes | Reveal / Savings Audit / Walkthrough / Letter, `docs/reference/conversion-playbook.md` |
| 31 plan tasks | `/#/plan` (Kanban, list, dependency graph, task detail) and `docs/build-plan.md`: 15 done, 2 doing, 8 backlog, 5 awaiting Justin, 1 blocked |

Counts come from the hub footer; re-measure when you change them.

## Run

```bash
npm install                 # fonts ship via @fontsource (offline)
npm run dev                 # http://localhost:5173/#/
npm run build               # tokens -> tsc --noEmit -> vite build (green before every push)
npm run test:engine         # pure engine checks
npm run sql                 # supabase/schema.sql + docs/data-model.md
npm run screenshots -- --codes=HUB-01,D-07   # after build; docs/screenshots/<CODE>/<width>.jpg
npm run qa:responsive       # after build; docs/qa/responsive-report.{md,json}
```

Node 22 (`--experimental-strip-types` for `.mjs` scripts importing `.ts`). Chromium is preinstalled at `/opt/pw-browsers`; never run `playwright install`.

## Map

`src/engine` (pure personalization: catalog, stack guess, savings, role views, archetype picker, composer, image prompts, adaptive intake, booking slots) · `src/modules/*` (pages; each exports `{ routes, strings }`) · `src/data` (DataProvider seam, MockProvider, schema, seed) · `src/components` (library) · `src/design` (tokens) · `src/actions` (actions bus = WebMCP surface) · `src/tracking` (`track()`) · `docs/` (prompts, changelog, decisions, kanban, pages, reference).

Rules for agents: `CLAUDE.md`. Models: Fable 5.1 (foundation, integration, shared code), Opus 5 (the seven modules).
