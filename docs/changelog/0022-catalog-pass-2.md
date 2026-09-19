# Catalog pass 2: sub-industries, price review dates, coverage checks (T52, D-063)

version: 0.4.0
date: 2026-09-19
prompt: 0004
intent: Turn the industry catalog into a maintained product asset per D-063 rather than a one-time fill: add sub-industries for the industries where a business's shape changes its stack, date every list price as reviewed, and add engine checks so a future pass cannot silently regress the catalog (a missing price, an untranslated name, a dangling sub-industry reference).
decision: (1) sub-industries live as an optional `Industry.sub: SubIndustry[]` (`{ key, name: { en, es }, extra_tools?, roles? }`), added for the 9 industries where the business type changes the stack (restaurant, dental, gym_wellness, home_services, salon_spa, law_firm, auto_shop, pet_care, real_estate) - additive only, every existing `IndustryKey` and shape is unchanged; `sub[].key` is what `Prospect.sub_industry` will store once S-02 asks for it (D-063 follow-up, see Requests to foundation); (2) every `StackItem` now carries `price_reviewed: '2026-09-19'` (set once, in the `s()` factory, so it can't be forgotten) and an optional `price_source_note` for the handful of products whose real pricing model is not a flat monthly fee; (3) `StackItem.price_reviewed` / `price_source_note` and `Industry.sub` are added via a `declare module '../types'` augmentation inside `industries.ts`, not by editing `src/engine/types.ts` - a catalog worker's contract is `src/engine/catalog/**` only, and TypeScript's declaration merging lets one file extend a shared interface without touching the foundation file that defines it; (4) four list prices that were `$0` (CareCredit portal, Gympass listing, Fresha x2) are repriced to a small plausible paid-tier estimate with a `price_source_note` explaining the real free/commission-based model, so "list price" stays a number the savings math can use and the new `price > 0` coverage check holds without an exception list; (5) two new `test:engine` checks (18 -> 20) enforce the five D-063 coverage rules going forward.
rejected: putting `price_reviewed` / `sub` on `src/engine/types.ts` directly (fastest, but out of a catalog worker's file contract and it is not this pass's only concern - the module-augmentation pattern keeps the boundary real and is reusable by the next catalog pass); leaving the four `$0` products as-is with an exception carve-out in the coverage check (an unbounded exception list is how coverage checks rot - a priced, noted estimate is honest about being an estimate, which the file's own header comment already says every number in it is); one sub-industry list shared across all 22 industries (most industries do not bend by sub-type - forcing `sub` everywhere would mean inventing distinctions nobody asked for, e.g. "general childcare" vs nothing); storing `sub` as a flat `string[]` of keys (a bare key can't carry a bilingual name or extra tools, and S-02's suggestion chips need both).
files: src/engine/catalog/industries.ts, scripts/test-engine.mjs, scripts/gen-catalog-doc.mjs (new), docs/reference/catalog.md (new, generated), docs/changelog/_pending/catalog.md (new)
codes: S-02

## What changed

- **Sub-industries** (`src/engine/catalog/industries.ts`) - 24 sub-industries added across 9 industries: `restaurant` (quick_service, full_service, food_truck), `dental` (general, ortho), `gym_wellness` (gym, yoga_studio, personal_training), `home_services` (hvac, plumbing, electrical), `salon_spa` (hair, nails, spa), `law_firm` (family, immigration, small_business), `auto_shop` (repair, detailing), `pet_care` (grooming, boarding, pet_transport_vet_partner), `real_estate` (agent_team, property_management_arm). Each carries an EN + ES name, an optional list of `extra_tools` (checked against the global tools index) and optional `roles`. The other 13 industries plus `other` are unchanged - most business types in this catalog do not bend by sub-type.
- **Price review dates** - every `StackItem` in every industry's `stack` (and the shared `COMMON` list) now carries `price_reviewed: '2026-09-19'`, set once in the `s()` factory so a future item can't be added without one. All ~114 distinct tools / 352 stack listings reviewed for plausibility against 2026 pricing; only four needed a change (all were placeholder `$0` list prices for products whose real cost is not a flat subscription):
  | Tool (industry) | Before | After | Why |
  | --- | --- | --- | --- |
  | CareCredit portal (dental) | $0 | $19 | CareCredit charges the practice per-transaction merchant fees, not a subscription; $19 approximates the typical bundled patient-financing portal/admin fee other practice-management add-ons charge, so the line is not a free-looking $0. |
  | Gympass listing (gym_wellness) | $0 | $49 | Gympass/Wellhub pays the gym per visit rather than charging a subscription; $49 stands in for the minimal fixed participation/kiosk cost. |
  | Fresha (salon_spa) | $0 | $15 | Fresha's core booking calendar is free (they monetize via payment processing); $15 approximates the optional "Fresha Plus" add-on tier. |
  | Fresha (tattoo) | $0 | $15 | Same product, same note, priced consistently across both industries that list it. |

  Every other list price (Dentrix $450, ServiceTitan $398/seat, kvCORE $499, Backblaze $9, ...) was checked against plausible 2026 vendor pricing and left as-is - nothing else was implausible enough to change.
- **Coverage checks** (`scripts/test-engine.mjs`, 18 -> 20 checks) - two new blocks enforce the five D-063 rules: every industry has 4+ tools and a bilingual (EN + ES) name; every tool's `monthly_cost > 0` and has a `price_reviewed` date matching `YYYY-MM-DD`; every industry's `sub[].key` list has no duplicates; every `sub[].extra_tools` id resolves to a real entry in `CATALOG_TOOLS` (the same index the S-02 paste-facts matcher uses, so a typo'd extra tool fails the build the same way a typo'd catalog tool would).
- **`docs/reference/catalog.md`** (new) - a generated reference: every industry with its EN/ES name, its sub-industries table (key, names, extra tools, roles) when it has one, and its full priced stack sorted by price with category, replaces-module, prevalence, review date and source note. Built by `scripts/gen-catalog-doc.mjs` (new, `node --experimental-strip-types scripts/gen-catalog-doc.mjs`, no build step - it imports `industries.ts` directly the way `gen-tokens.mjs` imports `tokens.ts`) so the doc can never drift from the code between passes; the file's own header says not to hand-edit it. Proposed as npm script `catalog:doc` below.

## New and changed contracts

- `SubIndustry` (new, exported from `src/engine/catalog/industries.ts`): `{ key: string; name: { en: string; es: string }; extra_tools?: string[]; roles?: string[] }`. `key` is stable once shipped - it is the value `Prospect.sub_industry` will hold (see Requests to foundation).
- `Industry.sub?: SubIndustry[]` and `StackItem.price_reviewed?: string` / `StackItem.price_source_note?: string` - both added by declaration merging (`declare module '../types'`) inside `industries.ts`, not by editing `src/engine/types.ts`. Every existing reader of `Industry` / `StackItem` (the engine, S-01/S-02/S-03, the landing pages) is unaffected: both fields are optional and additive. A future pass touching `src/engine/types.ts` directly should fold these declarations in as real interface members if the augmentation ever feels awkward to extend further - it was chosen here specifically to respect this pass's file contract, not because it is the permanent home for these fields.
- `CATALOG_TOOLS` / `CATALOG_TOOL_NAMES` (unchanged shape) now also index the repriced tools; nothing keyed by tool name changes ranking or matching behavior (`Fresha` and `CareCredit portal` did not change name, category or `replaced_by`, only `monthly_cost` and the two new optional fields).
- No `Prospect` / schema change: `sub_industry: string | null` already exists on `ProspectRow` (unused until now) and needs no migration to start holding a `sub[].key` value.

## Requests to foundation

1. **S-02's intake should ask the sub-industry right after the industry, and `nextQuestions()` should weight it.** `Prospect.sub_industry` has existed since the 0.3.0 catalog pass but nothing ever asks for it or reads `INDUSTRIES[key].sub`. Once an industry has `sub`, the intake's next question after "what industry" should offer its `sub` entries as suggestion chips (the same pattern `fields.ts` already uses for tool/role chips), and `guessStack()` could use `sub[].extra_tools` to raise the confidence of those tools' guesses the way `known_tools` does today. This is an S-02 module change (`src/modules/studio/fields.ts`, `src/engine/intake.ts`'s `FIELD_WEIGHTS`), out of a catalog worker's file contract.
2. **`npm run catalog:doc` is not yet a package.json script.** `scripts/gen-catalog-doc.mjs` runs today as `node --experimental-strip-types scripts/gen-catalog-doc.mjs`; adding the `catalog:doc` row to `package.json`'s `scripts` (proposed below) needs a foundation edit since module/catalog workers cannot touch `package.json`.

## Proposed decisions

| id | date | decision | source | status |
| --- | --- | --- | --- | --- |
| D-119 | 2026-09-19 | **Sub-industries are additive, per-industry, and only where the business type changes the stack** (`Industry.sub?: SubIndustry[]`, D-063 follow-up). A `sub[].key` is stable once shipped - it is what `Prospect.sub_industry` stores - so a later pass may add sub-industries to a new industry but never rename or remove one that exists. Not every industry needs `sub`; most of this catalog's 22 do not bend by sub-type. | catalog 0.4.0, engine | proposed |
| D-120 | 2026-09-19 | **A catalog worker extends `src/engine/types.ts`'s shared interfaces (`Industry`, `StackItem`) by TypeScript module augmentation inside `catalog/industries.ts`, not by editing the foundation file**, when the addition is additive and optional. Keeps the module contract (`src/engine/catalog/**` only) real without blocking the catalog from growing new per-item fields like `price_reviewed`. | catalog 0.4.0 | proposed |

## Proposed surfaces.md rows

New npm script (section 1.3):

| Script | What | Flags |
| --- | --- | --- |
| `catalog:doc` | regenerates `docs/reference/catalog.md` from `src/engine/catalog/industries.ts` (industries x sub-industries x tools x prices x review dates) | |

Engine line (section 1.1, catalog note) update: "`npm run test:engine` 18 checks" -> "20 checks" (D-063 coverage: 4+ tools + bilingual name per industry, price > 0 + `price_reviewed` per tool, unique sub-industry keys, `extra_tools` resolve in `CATALOG_TOOLS`).

## Kanban moves

- **T52 Catalog pass 2** - move to `done`. Sub-industries (24 across 9 industries), price review dates (`price_reviewed` on every tool, 4 prices corrected and documented above), 2 new coverage checks (18 -> 20), `docs/reference/catalog.md` generated reference. Model: Sonnet 5 (mechanical fill + coverage checks against the existing catalog shape, as scoped).
- **New card proposed - "S-02 sub-industry question"**: wire the intake to ask `sub_industry` after `industry` using `INDUSTRIES[key].sub` as suggestion chips, and let `guessStack()` weight `sub[].extra_tools`. Depends on T52. Model: Opus 5 (touches `fields.ts` / `intake.ts` logic, not mechanical).

## Integration note (0023)
Numbered by the pass-3 integration (Fable 5.1). The two proposed rows were numbered D-119 / D-120 (D-064 / D-065 already exist from pass 2). Request 1 done in the engine (D-122): `FIELD_WEIGHTS.sub_industry` (0.85, asked right after the industry), `nextQuestions()` skips it when the catalog lists no `sub` for the industry, `computeConfidence(fields_known, p?)` leaves a non-applicable field out of the denominator, `applyAnswer(p, 'industry', ...)` drops a sub-industry the new industry does not list, `subIndustries(p)` is exported; S-02's `IntakeChat` offers the catalog's `sub` entries as a `Select` (`fieldOptions(field, t, bi, p)`). Engine checks 20 -> 21. `guessStack()` weighting `sub[].extra_tools` is kanban card T55. Request 2 done: `npm run catalog:doc` is in `package.json`.
