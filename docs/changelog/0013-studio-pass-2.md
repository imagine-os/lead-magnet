# 0013 - Studio pass 2: conversational intake, A/B variants, catalog depth (S-01..S-03 + engine)

version: 0.3.0
date: 2026-09-19
prompt: 0003
intent: Make the workbench better at the two things it exists for - knowing the prospect and testing the page. Deepen the industry catalog from 10 to 22 real industries with plausible stacks and prices, make `guessStack()` honest about seats, sites, duplicates and how sure it is; turn the S-02 intake from a four-field form into a conversation with a transcript and a rule-based "paste facts" reader; let S-03 run a real A/B test by publishing a second live page on the same slug; and give S-01 a strip that says what to look at next plus a one-click duplicate for demos.
decision: (1) the catalog is the product's knowledge - 22 industries, each with departments, business and life roles, a priced stack, pains, KPIs and motifs in EN + ES, and `IndustryKey` widened to match; (2) `guessStack()` emits at most one row per category **and** one row per replacement module, never the same tool twice, scales per-seat prices by `paidSeats()` and per-site prices by `paidLocations()`, and labels every row `likely` or `possible` via `stackTier()` (derived from confidence, never stored); (3) the intake asks one question at a time with the reason it matters and the confidence it would add, and every answer appends an `intake_turns` row naming its source (manual / rule / llm) - R-S06; (4) pasted text is read by pure rules and **proposed** with the words that produced it, never applied (R-S05), and the LLM path stays a Placeholder (T43); (5) an A/B test is two live `pages` rows on one slug, each with its own archetype and snapshot, addressable with `#/p/<slug>?variant=B` (R-S04); (6) duplicating a prospect copies the profile and leaves the page, events and bookings behind (R-S07).
rejected: storing the tier on `stack_guesses` (it is a function of confidence; a column would drift and would mean editing the foundation's `core.ts`); an LLM call behind "Ask the AI" (T43 is not wired - the rule enricher is what is real, and it says so); auto-applying extracted facts (fastest and wrongest: a hallucinated city ships a wrong page); more than two variants (the playbook says test one thing at a time, and three live rows makes every number noisy); a wizard or a modal for the intake (it must stay re-enterable and order-free); a separate "variants" page (the split belongs next to the archetype that is being tested); a new library component for the chat bubbles (module markup + module CSS until a second surface needs it).
files: src/engine/catalog/industries.ts, src/engine/stack.ts, src/engine/types.ts, src/engine/index.ts, scripts/test-engine.mjs, src/data/schema/studio.ts (new), src/data/seed/studio.ts (new), src/rules/studio.ts, src/modules/studio/{IntakeChat.tsx,extract.ts,fields.ts} (new), src/modules/studio/{ProspectsPage.tsx,ProspectProfilePage.tsx,ComposePage.tsx,lib.ts,specs.ts,index.ts,studio.css}, docs/pages/S-01.md, docs/pages/S-02.md, docs/pages/S-03.md
codes: S-01 S-02 S-03 (built -> built, reworked)

## What changed

- **Industry catalog 10 -> 22** (`src/engine/catalog/industries.ts`). New: chiropractic / physio, veterinary, coffee shop & bakery, landscaping, cleaning, property management, insurance agency, accounting firm, wedding & event planning, tattoo studio, daycare / preschool, photography studio. Each carries 4-6 departments, 5-6 business roles, 5 life roles, a 6-8 product stack with 2026 list prices and per-seat / per-location flags, 3 pains, 3 KPIs with sample numbers, 4 image motifs and a verb phrase - all EN + ES. HVAC / plumbing stays inside `home_services` rather than becoming a near-duplicate.
- **`CATALOG_TOOLS` / `CATALOG_TOOL_NAMES`** - a de-duplicated index of every tool the catalog knows, sorted longest-name-first so "Square for Restaurants" matches before "Square". This is what the paste-facts reader matches against.
- **Smarter `guessStack()`** - one product per category (a confirmed competitor wins), then **one row per `replaced_by` module**, so a confirmed tool knocks out the other products we would replace with the same module and we never bill a prospect twice for one replacement; never the same tool twice even when the industry list and the common list overlap; per-seat prices scale with `paidSeats()`, per-site prices with `paidLocations()`; rare products (prevalence < 0.3) are only guessed for teams of 15+; rejected rows never return; `known_tools` and confirmed rows come back with confidence 1.
- **Confidence tiers** - `stackTier(guess)` returns `likely` (confirmed, or confidence >= `TIER_MIN_LIKELY` = 0.5) or `possible`. S-02 shows it as a badge next to each guess. Derived, never stored.
- **S-02 conversational intake** (`IntakeChat.tsx`) - a transcript of everything answered so far (question, answer, who produced it, confidence after), then exactly one current question with the reason it matters, the confidence points it would add and its weight; one-tap suggestion chips from the industry catalog for tool and role questions; Save, Skip (and "bring the skipped ones back"), "Ask the AI" (the rule enricher, recorded as `source: rule`) and "Research it for me" (Placeholder, T43). The stack confirm / reject, roles, style editor and notes are unchanged.
- **Paste facts** (`extract.ts`, R-S05) - a Textarea takes website copy, a job post or call notes; pure rules propose city, team size, locations, catalog tools, the language of the copy and the website, each with the words that produced it and a sentence on why it matters. Apply writes it through the same `answer()` path (source `rule`); Dismiss drops it. Nothing is ever applied on its own.
- **`intake_turns` table** (`src/data/schema/studio.ts`, R-S06) - append-only: `prospect_id, field, question, answer, source (manual | rule | llm), confidence_after, ts`. Seeded with a short transcript per demo prospect (`src/data/seed/studio.ts`, order 1).
- **S-03 variant B publishing** (R-S04) - a "Variants on this slug" card shows A and B side by side with archetype, status, published date, days left, the forced path, open / copy / expire, or a publish button when that side does not exist yet. The variant picker is a SegmentedControl; publish, republish, expire and copy-link all act on the selected variant; each variant gets its own `composePage()` snapshot written to its own row. A warning appears when both live variants use the same archetype.
- **S-01 summary strip** - prospects with the cold / warm / hot split (chips double as filters), live pages plus how many slugs are running a split, bookings within a week either side of today, the live page expiring first with a jump into its composer, and the average-confidence bar.
- **S-01 duplicate as new prospect** (R-S07) - copies the person, business, roles, style, known tools and `fields_known` under "<business> (copy)", re-guesses the stack and lands on S-02. Pages, events, bookings, touches and assets stay with the original.
- **Rules** - R-S04 (two live variants per slug), R-S05 (facts are proposed, never applied), R-S06 (every answer is a transcript turn), R-S07 (duplicate copies the profile, never the page) in `src/rules/studio.ts`.
- **Strings** - ~90 new keys in EN and ES, including one `studio.effect_<field>` sentence for every `FIELD_WEIGHTS` key (what answering it changes) and the variant / transcript / proposal vocabulary.
- **Engine checks 11 -> 18** (`scripts/test-engine.mjs`, appended): catalog completeness and bilingual content for all 23 keys, a usable stack and a real savings story for each of the 12 new industries, one-row-per-replacement / no-duplicate-tool across every industry, a confirmed tool knocking out its competitor, seat and site scaling, tier boundaries, and rejected / confirmed round-trips.

## New and changed contracts

- `src/engine/types.ts`: `IndustryKey` widened by 12 keys, and a new `StackTier = 'likely' | 'possible'`. **This is a foundation file** - it was touched because `INDUSTRIES` is the only `Record<IndustryKey, Industry>` and the catalog cannot grow without it. Nothing else in the tree keys a record by `IndustryKey` (checked).
- `src/engine/index.ts`: now also exports `CATALOG_TOOLS`, `CATALOG_TOOL_NAMES`, `paidLocations`, `itemCost`, `stackTier`, `TIER_MIN_LIKELY`, `RARE_PREVALENCE`, `POSSIBLE_MIN_TEAM`. Additive only.
- `guessStack()` output can be **shorter** than before for the same prospect when two catalog products shared a `replaced_by`; seeded savings numbers move accordingly. No stored data changes shape.
- New table `intake_turns` (group `prospects`). `SEED_VERSION` does not need a bump: `MockProvider` already rebuilds a stored db that is missing a table.
- `src/modules/studio/lib.ts` adds `VARIANTS`, `VariantLabel`, `normalizeVariant()`, `variantRows()`, `liveVariantCount()`, `publicPathWithVariant()`, `publicUrlWithVariant()`, `studioSummary()`. `livePageOf()` now prefers the **variant A** live row when a slug runs a split - callers that want "the" page are unchanged.
- `src/modules/studio/fields.ts` is the one place that maps an intake field to its control, its coercion, its catalog suggestions and its confidence gain.
- Landing owns the session split and `?variant=A|B`; the studio only writes the rows and hands out the forced links. The two sides were verified together: `#/p/paws-and-play-austin?variant=B` renders.

## Requests to foundation

1. **`DataTable`'s row link swallows every other control in the row.** `.dt-rowlink::after { position: absolute; inset: 0 }` covers the whole `tr`, so a per-row button is unclickable by mouse, touch or pen (keyboard still reaches it) - a P-03 break for any table with an action column. S-01 works around it with a `.st-rowact { position: relative; z-index: 1 }` wrapper. The atom should either exclude the last cell from the overlay or grow a documented `actions` column.
2. **Touch targets under 44 px in three library atoms** (measured on S-01 / S-02, every width): `Chip`'s remove button is 24 px tall, `Toggle`'s track is 26 px, and `DataTable`'s row link is 17 px. P-03 asks for 44 px.
3. **`Field` still clones `required` / `invalid` into a single child**, so the intake keeps its Save button beside the Field rather than inside it. A `Field` with an `action` slot would let the chat put "Save" on the same line as the control without a wrapper class.
4. **No chat / transcript primitive in the library.** The intake bubbles are module markup today. If a second surface needs a transcript (the manual's annotations thread is close), it should become `components/molecule/Thread`.
5. **`Badge` has no `tier` / outline variant**, so likely vs possible is carried by `tone="info"` vs `tone="neutral"`. An outline variant would read better next to the status badge.
6. **`IndustryKey` should be derived from the catalog** (`typeof INDUSTRIES` keys) so a module worker can add an industry without touching `src/engine/types.ts`.

## Proposed decisions

| id | date | decision | source | status |
| --- | --- | --- | --- | --- |
| D-056 | 2026-09-19 | **Stack guesses carry a `likely` / `possible` tier derived from confidence** (`>= 0.5` is likely; a confirmed tool is always likely). The tier is computed, never stored, so it can be retuned without a migration. | studio 0.3.0, engine | proposed |
| D-057 | 2026-09-19 | **One guessed line per replacement module.** If two catalog products would be replaced by the same module, only the most likely one is billed - the savings number must never double-count a replacement. | studio 0.3.0, engine | proposed |
| D-058 | 2026-09-19 | **Rare products (prevalence < 0.3) are not guessed for teams under 15.** Below that we ask in the intake instead of inventing a line item. | studio 0.3.0, engine | proposed |
| D-059 | 2026-09-19 | **Pasted facts are proposals with evidence, never writes** (R-S05). The extractor is pure rules; the LLM path stays a Placeholder until T43. | studio 0.3.0, P-09 | proposed |
| D-060 | 2026-09-19 | **Every intake answer is recorded as an `intake_turns` row with its source** (R-S06), so a rule-filled profile can always be told apart from a confirmed one. | studio 0.3.0, P-09 | proposed |
| D-061 | 2026-09-19 | **An A/B test is exactly two live `pages` rows on one slug (A and B)**, each with its own archetype and snapshot; `?variant=` forces a side and variant A is "the" page for everything else (R-S04). | studio 0.3.0, playbook 10 | proposed |
| D-062 | 2026-09-19 | **Duplicating a prospect copies the profile and never the page, events or bookings** (R-S07), so a demo copy can never show someone else's traffic as its own. | studio 0.3.0 | proposed |
| D-063 | 2026-09-19 | **The industry catalog is a product asset, not sample data**: 22 industries with real product names and list prices, EN + ES, checked by `npm run test:engine`. Prices are reviewed every pass and dated in this changelog. | studio 0.3.0 | proposed |

## Proposed surfaces.md rows

New table (section: data model / tables):

| Table | Group | Written by | Read by |
| --- | --- | --- | --- |
| `intake_turns` | prospects | S-02 (`IntakeChat` via `ProspectProfilePage.recordTurn`) | S-02, A-01 (how a profile was built) |

New engine exports (section: engine API):

| Export | Signature | Notes |
| --- | --- | --- |
| `stackTier` | `(g: { confidence, status }) => 'likely' \| 'possible'` | D-056 |
| `itemCost` | `(item: StackItem, p: { team_size, locations }) => number` | seat / site scaling |
| `paidLocations` | `(p: { locations }) => number` | mirror of `paidSeats` |
| `CATALOG_TOOLS` | `{ tool, category, replaced_by, industries }[]` | longest name first |
| `CATALOG_TOOL_NAMES` | `string[]` | paste-facts matcher |
| `TIER_MIN_LIKELY` / `RARE_PREVALENCE` / `POSSIBLE_MIN_TEAM` | `0.5` / `0.3` / `15` | tuning constants |

New actions (WebMCP surface / voice vocabulary) - 9:

| Action id | Page | Intent | Permission |
| --- | --- | --- | --- |
| `studio.duplicateProspect` | S-01 | duplicate prospect {name} as a new prospect | `prospects.write` |
| `studio.skipQuestion` | S-02 | skip this question and ask the next one | - |
| `studio.pasteFacts` | S-02 | paste {text} into the facts box | `prospects.write` |
| `studio.extractFacts` | S-02 | extract the facts from the pasted text | `prospects.write` |
| `studio.applyFact` | S-02 | apply the proposed {fact} | `prospects.write` |
| `studio.dismissFact` | S-02 | dismiss the proposed {fact} | - |
| `studio.publishVariant` | S-03 | publish variant {variant} as the {archetype} page | `pages.publish` |
| `studio.expireVariant` | S-03 | expire variant {variant} | `pages.publish` |
| `studio.copyVariantLink` | S-03 | copy the link that forces variant {variant} | - |

New rules: R-S04, R-S05, R-S06, R-S07 (`src/rules/studio.ts`).

## Kanban moves

- **T11 Studio** - add a 0.3.0 pass note: catalog depth, conversational intake, A/B variants, S-01 summary + duplicate. Stays `done`.
- **T43 LLM enrichment** - unchanged (`awaiting_justin` / backlog), but it now has two live seams: `Enricher` (unchanged) and the paste-facts extractor, which an LLM would replace behind the same "propose, never apply" contract.
- **New card proposed - "Catalog pass 2"**: sub-industries (e.g. orthodontics under dental), per-industry pricing review dates, and the remaining industries Justin named (boutique fitness as its own key if it should split from `gym_wellness`). Model: Sonnet 5 (mechanical fill against the existing shape).
- **New card proposed - "A/B readout"**: A-01 should show the two variants of a slug side by side with their own funnels now that the rows exist. Model: Opus 5.

## Verification

- `npm run typecheck` - green (whole tree).
- `npm run test:engine` - 18 checks pass (was 11).
- Playwright (Chromium at `/opt/pw-browsers`, dev server, EN and ES, 2026-09-19):
  - S-01: summary strip renders (warmth split, live pages, bookings this week = 1, next expiring); duplicate creates a fourth prospect and lands on its S-02.
  - S-02: transcript shows the seeded turns; answering two questions advances the queue and grows the transcript (2 -> 4 turns), confidence reaches 90 %, 12 tier badges on the stack; pasting a paragraph proposes 5 facts (city, team size, locations, known tools, language) and Apply writes one turn and updates the prospect (`city = Coral Gables`) while the rest stay proposals.
  - S-03: two variant cards; publishing B gives "2 live" and the split badge; the rows are `A/reveal/live` and `B/walkthrough/live`, both with a model snapshot on the same slug; `#/p/paws-and-play-austin?variant=B` renders the public page.
  - No console or page errors; no horizontal scroll at 390, 768, 1280 or 2560 in either language; no raw string keys in either language.
- Not run (integrator): `npm run build`, screenshots.
