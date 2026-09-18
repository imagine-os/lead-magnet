# Surfaces: routes, data, scripts, MCP / CLI / API

Update this file in the same turn as any change to a route, DataProvider method, npm script, action or API (module workers propose rows in `docs/changelog/_pending/<module>.md`).

## 1. What exists today

### 1.1 Route manifest
Published at runtime as `window.__leadmagnet = { routes: [{ path, code, surface, status: 'built' | 'stub', roles, spec }], version }` and saved by `npm run screenshots` to `docs/screenshots/routes.json`. Browse at `/#/dev` (D-01) and `/#/dev/canvas` (D-07).

| Surface | Codes | Built today |
| --- | --- | --- |
| public | HUB-01 `/`, HUB-02 `/no-access`, L-01..L-05 `/p/:slug[...]`, B-01 B-02 `/book/:prospectId[...]`, W-01..W-03 `/site[...]`, R-01 `/proposal/:prospectId` | HUB-01, HUB-02 |
| demo | C-01..C-07 `/demo/:prospectId[...]` | - |
| studio | S-01..S-05 `/studio[...]` | - |
| admin | A-01..A-05 `/admin[...]` | - |
| plan | K-01..K-04 `/plan[...]` | - |
| dev | D-01 `/dev`, D-02 `/dev/components`, D-03 `/dev/tables[/:table]`, D-04 `/dev/actions`, D-05 `/dev/rules`, D-07 `/dev/canvas`, D-08 `/dev/qa`, D-09 `/dev/feedback` | all |
| docs | D-06 `/docs`, `/docs/pages/:code` | D-06 |
| manual | M-01..M-05 `/manual[...]` | - |

50 routes, 13 built, 37 stubs (v0.1.0).

### 1.2 Data: DataProvider
`src/data/provider.ts`; `MockProvider` today.

| Method | Signature | Notes |
| --- | --- | --- |
| list | `list<T>(table, query?: { where, orderBy, limit, offset }): Promise<T[]>` | `where` values may be arrays (IN) |
| get | `get<T>(table, id): Promise<T \| null>` | |
| insert | `insert<T>(table, row: Partial<T>): Promise<T>` | adds `id, created_at, updated_at` |
| update | `update<T>(table, id, patch): Promise<T>` | bumps `updated_at` |
| remove | `remove(table, id): Promise<void>` | |
| subscribe | `subscribe(table \| '*', cb: (e: ChangeEvent) => void): () => void` | `insert \| update \| remove \| reset`; cross-tab via `storage` |
| peek? | `peek<T>(table, query?): T[]` | synchronous snapshot (mock only) |
| reset? | `reset(): Promise<void>` | reseed (mock only) |

Hooks: `useData()`, `useTable(name, query?)`, `useRow(name, id)`. Tracking: `track(type, meta, ctx)` -> `events`.

### 1.3 npm scripts (the CLI today)
| Script | What | Flags |
| --- | --- | --- |
| `dev` | vite dev server :5173 | |
| `build` | tokens -> `tsc --noEmit` -> `vite build` | |
| `preview` | serve `dist/` :4173 | |
| `typecheck` | `tsc --noEmit` (module workers run only this) | |
| `tokens` | `tokens.ts` -> `src/styles/tokens.css` | |
| `sql` | schema -> `supabase/schema.sql` + `docs/data-model.md` | |
| `test:engine` | pure engine checks (esbuild bundle) | |
| `screenshots` | Playwright captures to `docs/screenshots/<CODE>/` + `routes.json` | `--codes=`, `--only=`, `--widths=`, `--dark`, `--label=`, `--smoke`, `--port=` |
| `qa:responsive` | 7-width x 2-theme matrix -> `docs/qa/responsive-report.{md,json}` | `--codes=`, `--only=`, `--widths=`, `--themes=`, `--port=` |
| (node) `scripts/gen-page-docs.mjs` | page doc skeletons from `routes.json` | `--force` |

### 1.4 HTTP API
None.

### 1.5 MCP / WebMCP
None yet. The actions manifest (`spec.actions` on every route, `/#/dev/actions`) is the surface WebMCP tools will be generated from.

## 2. Planned
### 2.1 Actions manifest -> WebMCP tools (T45)
One tool per action: `name = id`, `description = intent`, `inputSchema` from `params`, permission via `can()`; handlers are the same `registerActions` functions pages already register. Voice (T46) speaks the same intents.
### 2.2 CLI
`lm prospects list`, `lm compose <prospectId> --archetype`, `lm publish`, `lm events tail` over the same DataProvider once Supabase (T44) exists.
### 2.3 Realtime / presence (T48)
`subscribe` becomes a Supabase channel; presence rows for concurrent editing in the studio.
### 2.4 Annotations API (T49)
`feedback` rows readable / writable by agents through the provider; pins rendered from `element_path`.

## 3. Change log of this file
- 2026-09-18 · prompt 0001 · created with the foundation manifest (50 routes), DataProvider, scripts.
