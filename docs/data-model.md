# Data model

_Generated from `src/data/schema/*.ts` by `npm run sql`. The TypeScript files are the source of truth; `supabase/schema.sql` is the Postgres draft; this page is the human view. Browse live rows at `/#/dev/tables` (D-03)._

## Principles
- **Same interface, two providers.** Pages call `useData()` / `useTable()` / `useRow()` (`DataProvider`: list, get, insert, update, remove, subscribe). `MockProvider` (localStorage `leadmagnet.db.v1`) today; `SupabaseProvider` later (T44). Swap is one line in `src/data/DataContext.tsx`.
- **Every table has `id, created_at, updated_at`.** Writes go by id through the provider; lists re-render from `subscribe` (multiplayer-ready, P-14).
- **The engine is pure.** `stack_guesses`, `pages.model` and `assets.prompt` are outputs of `src/engine` functions from a `prospects` row; regenerate, do not hand-edit.
- **Tracking is one table.** Every interaction is an `events` row written by `src/tracking/track()`.

## Tables (11)

### Prospects & stack

#### `intake_turns`
The conversational intake on S-02, one row per answered question: the field, the question as it was asked, the answer as it was saved, who produced it (strategist, rule enricher or LLM) and the confidence right after. Append-only; the profile itself lives on prospects.  
_Source: S-02 conversational intake_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `prospect_id` | uuid | -> `prospects`  |
| `field` | text | FIELD_WEIGHTS key the answer filled |
| `question` | text | The question as it was asked, in the strategist’s language |
| `answer` | text | The answer as saved (arrays are comma-joined) |
| `source` | enum (manual \| rule \| llm) |  |
| `confidence_after` | numeric | prospects.confidence right after this turn (0..1) |
| `ts` | timestamptz |  |

**Access:** strategist read/write; analyst read

#### `prospects`
One row per person we are building a lead magnet for: business, style, life and business roles, what we know and how confident we are.  
_Source: prompt 0001_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `first_name` | text |  |
| `last_name` | text |  |
| `business_name` | text |  |
| `industry` | text | Key in src/engine/catalog/industries.ts |
| `sub_industry` | text, null |  |
| `city` | text |  |
| `country` | text |  |
| `lang` | enum (en \| es) |  |
| `website` | text, null |  |
| `team_size` | int |  |
| `locations` | int |  |
| `revenue_band` | enum (lt250k \| 250k_1m \| 1m_5m \| 5m_plus) |  |
| `warmth` | enum (cold \| warm \| hot) |  |
| `source` | enum (cold_email \| linkedin \| referral \| event \| inbound) |  |
| `style` | json | { palette {primary, accent, bg, surface, text}, tone, font, imagery[] } |
| `life_roles` | json | e.g. owner, spouse/partner, kids, accountant, coach |
| `business_roles` | json | e.g. owner, manager, front desk |
| `known_tools` | json | Confirmed tools (names) |
| `confidence` | numeric | 0..1 how much we know |
| `fields_known` | json | Field names we have confirmed |
| `notes` | text |  |
| `logo_url` | text, null |  |
| `photo_url` | text, null |  |

**Access:** strategist read/write; analyst read; prospect reads own row through the page

#### `stack_guesses`
Software we think the prospect pays for, with monthly cost, confidence and what replaces it in their OS. Confirmed / rejected by the audit archetype and intake.  
_Source: engine guessStack()_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `prospect_id` | uuid | -> `prospects`  |
| `tool` | text |  |
| `category` | text |  |
| `monthly_cost` | money | USD / month |
| `confidence` | numeric |  |
| `status` | enum (guessed \| confirmed \| rejected) |  |
| `replaced_by` | text | Our module name |

### Pages, assets & bookings

#### `assets`
Image / video prompts per prospect and their generation status. Provider not wired yet (T40).  
_Source: engine imagePrompts()_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `prospect_id` | uuid | -> `prospects`  |
| `kind` | enum (hero \| device_phone \| device_laptop \| device_tv \| role_card \| og_image \| video_frames) |  |
| `prompt` | text |  |
| `status` | enum (queued \| generated \| approved \| rejected) |  |
| `url` | text, null |  |
| `provider` | text, null |  |

#### `bookings`
Walkthrough calls requested from a landing page or the demo.  
_Source: B-01_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `prospect_id` | uuid | -> `prospects`  |
| `page_id` | uuid, null | -> `pages`  |
| `slot` | timestamptz |  |
| `duration_min` | int |  |
| `status` | enum (requested \| confirmed \| cancelled \| completed) |  |
| `contact_name` | text | Name given on B-01 |
| `contact_email` | text | Where the call link goes |
| `contact_phone` | text, null |  |
| `notes` | text | What the prospect wrote in the booking form |

#### `pages`
A composed landing page for a prospect: archetype, slug, variant (A/B), status and the PageModel snapshot the page renders.  
_Source: engine composePage()_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `prospect_id` | uuid | -> `prospects`  |
| `archetype` | enum (reveal \| audit \| walkthrough \| letter) |  |
| `slug` | text |  |
| `variant` | text |  |
| `status` | enum (draft \| live \| expired) |  |
| `published_at` | timestamptz, null |  |
| `expires_at` | timestamptz, null |  |
| `model` | json | PageModel snapshot |

#### `recommendations`
What adaptFromEvents() suggested for a page, recorded before it is applied (R-A03): kind, target archetype or section, the reason, the score and who decided. A-02 writes the engine kinds and A-01 writes promote_variant when an A/B side is ahead past the minimum sample; nothing is applied from a row alone.  
_Source: A-02, engine adaptFromEvents()_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `prospect_id` | uuid | -> `prospects`  |
| `page_id` | uuid | -> `pages`  |
| `kind` | enum (switch_archetype \| add_section \| shorten \| ask \| promote_variant) |  |
| `to_archetype` | enum (reveal \| audit \| walkthrough \| letter), null |  |
| `section` | text, null | Section kind for add_section |
| `reason` | text |  |
| `score` | numeric | Engine score, higher first |
| `status` | enum (proposed \| applied \| dismissed) |  |
| `decided_by` | text | Demo user id or role that decided |
| `decided_at` | timestamptz, null |  |
| `note` | text |  |

**Access:** strategist read/write; analyst read

### Tracking

#### `events`
Every tracked interaction on landing pages, demos, bookings and outreach. Written by src/tracking/track().  
_Source: playbook principle 9_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `page_id` | uuid, null | -> `pages`  |
| `prospect_id` | uuid, null | -> `prospects`  |
| `session_id` | text |  |
| `type` | enum (view \| section_view \| scroll_depth \| cta_click \| demo_open \| demo_role_switch \| booking_started \| booking_confirmed \| form_submit \| exit_intent \| outreach_open \| outreach_click) |  |
| `meta` | json |  |
| `ts` | timestamptz |  |

### Outreach

#### `touches`
Cold / warm outreach messages that point at a page; opens and clicks feed the funnel.  
_Source: S-05, A-04_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `prospect_id` | uuid | -> `prospects`  |
| `channel` | enum (cold_email \| linkedin_dm \| whatsapp \| sms \| call \| warm_intro) |  |
| `subject` | text |  |
| `body_preview` | text |  |
| `sent_at` | timestamptz, null |  |
| `opened_at` | timestamptz, null |  |
| `clicked_at` | timestamptz, null |  |
| `page_id` | uuid, null | -> `pages`  |
| `status` | enum (draft \| scheduled \| sent \| opened \| clicked \| replied \| bounced) |  |

### Plan (PM)

#### `tasks`
The development plan: tasks bound by dependencies (not calendar days), each naming its model. Rendered by the K- module.  
_Source: docs/build-plan.md_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `title` | text |  |
| `module` | text |  |
| `codes` | json | Page codes |
| `model` | enum (Fable 5.1 \| Opus 5 \| Sonnet 5 \| Justin) |  |
| `phase` | int |  |
| `depends_on` | json | Task ids |
| `status` | enum (backlog \| doing \| done \| blocked \| awaiting_justin) |  |
| `owner` | text |  |
| `notes` | text |  |
| `done_at` | timestamptz, null |  |

### System & feedback

#### `feedback`
Testers comment, request and report bugs on the product itself; agents triage from here and record the decision before changing anything.  
_Source: P-08_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | text |  |
| `user_name` | text |  |
| `role` | text |  |
| `page_code` | text |  |
| `route` | text |  |
| `kind` | enum (comment \| request \| bug \| idea \| question \| praise) |  |
| `text` | text |  |
| `element_path` | text, null |  |
| `component` | text, null |  |
| `viewport` | text, null |  |
| `theme` | text, null |  |
| `status` | enum (new \| seen \| waiting \| done) |  |
| `triage` | enum (fix \| ask \| later \| wontfix), null |  |
| `triage_note` | text, null |  |
| `decision_ref` | text, null |  |
| `owner_reply` | text, null |  |

## Adding a table (module contract)
1. Add a `TableDef` + typed row interface to `src/data/schema/<module>.ts` (`index.ts` globs it; never edit index).
2. Seed it in `src/data/seed/<module>.ts` (exports `seed(ctx)`; `ctx.ids.prospects` holds the seeded prospect ids).
3. `npm run sql` regenerates `supabase/schema.sql` and this file (the integrator runs it; note it in your `_pending` changelog).
4. Reference it in the page's `PageSpec.data` so the inspector links to it.
