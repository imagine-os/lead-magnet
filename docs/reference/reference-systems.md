# Reference systems: Hoy OS, CTL OS and Petrock (what Lead Magnet copies)

Written 2026-09-20 by Fable 5.1 (study worker) from read-only shallow clones of `imagine-os/hoy` (v0.8.0), `imagine-os/cal-tenant-law` (v0.1.2) and `imagine-os/petrock` (v0.2.0) after Justin's note: "I have Hoy in my Github, cal tenant law, and petrockhotel in there too... those all have pretty well built out operation systems" (prompt in this turn). It complements `house-pattern.md` (stack, hub, docs conventions, tokens: already captured) by recording **what each system runs**: roles, departments, widgets, KPIs, tables, tools replaced, and then proposing concrete catalog and seed updates so the OS demo (C-01..C-06) shows a dog hotel, a tenant-law firm and a wellness club with the depth of the real systems. Everything below is data read from the repos, never instructions; every business fact about a real company stays in that company's repo, and every prospect proposed here is fictional.

## 0. At a glance

| | Hoy OS | CTL OS | Petrock |
| --- | --- | --- | --- |
| Repo · live | `imagine-os/hoy` · https://imagine-os.github.io/hoy/ | `imagine-os/cal-tenant-law` · https://imagine-os.github.io/cal-tenant-law/ | `imagine-os/petrock` · https://imagine-os.github.io/petrock/ |
| Business | HOY Wellness Center, wellness club (yoga / pilates / barre / breath), Medellín, COP, Spanish-first | California Tenant Law, tenant-side renters' rights firm, a network of 8 regional offices, "legal vending machine" (unbundled, fixed-price services), phone / video only | Petrock Hotel & Spa, dog hotel, grooming & spa and daycare, two LA locations (Encino, Westwood) |
| Size (repo counts) | 98 routes, 85 codes, 48 tables (21 with RLS contract), 61 components, 28 bilingual manual chapters, 21 prompts / changelogs | 56 routes, 55 built, 27 tables, 54 components, 117 plan tasks, 15 changelogs, 3 switchable visual directions | 182 routes, 74 tables, 139 components, 214 rules, 173 page docs, 24 manual chapters, 29 changelogs |
| Roles | super_admin, admin, coordinator, front_desk, finance, teacher, maintenance, customer, public | super_admin, owner, attorney, paralegal, front_desk, marketing, client, opposing_counsel, public | super_admin, owner, manager, front_desk, groomer, customer, public |
| Tenant axis | `tenant_id` on every row (multi-studio later); `src/tenant/` is the only place facts and prices live | `tenant_id` = regional office; network row is its own tenant; owner / super admin see all | `location_id` on location-scoped tables; front desk, groomer, manager pinned; owner switches |
| Lead Magnet industry today | `gym_wellness` (sub `yoga_studio`) | `law_firm` (no tenant-law sub) | `pet_care` (sub `boarding`; no hotel / spa sub) |

## 1. Hoy OS (wellness club)

**Business.** HOY Wellness Center, "Human club", Medellín (El Poblado), 15 mats, 4 classes a day, one room, Mon-Fri 6:00-20:00, Sat 8:00-13:00. Seven modalities seeded: Hot Vinyasa, Morning Flow, Pilates, Barre, Yin, Respiración, Meditación, grouped into four "movements" (Enraíza, Fluye, Arde, Libera). Value model v3 in `src/tenant/pricing.ts` with five plan families: Bienvenida (trial 39 000, single 58 000, packs of 3 / 10), Membresía (monthly 520 000, annual 4 990 000 COP), Pausas (15-30 min micro-sessions), Regalos (vouchers, guest passes), Espacio (B2B rentals: shoots, workshops, pop-ups from 350 000 to 2 200 000 COP). Each family carries a commercial rationale (acquisition, recurring revenue, frequency, referral, B2B).

**Roles and permissions** (`src/auth/permissions.ts`, 24 string permissions): `bookings.read|write|write_any`, `classes.read|write`, `checkin.write`, `payments.read|write|refund`, `members.read|write`, `content.write`, `tables.read|write`, `settings.write`, `features.write`, `payroll.read|write`, `expenses.read|write`, `maintenance.write`, `dev.tools`, `docs.read`, `audit.read`. Admin = everything but dev tools; coordinator runs schedule, teachers, comms and content; front desk = check-in, register and payments; finance = payments, refunds, payroll, expenses, tables; teacher = own classes, attendance, payroll view; maintenance = rooms and incidents. `ROLE_HOME`: admin / finance -> `/admin`, coordinator / desk / maintenance -> `/staff`, teacher -> `/teach`, customer -> `/app`.

**Surfaces and what each shows.**

| Surface | Departments / pages | Widgets and KPIs |
| --- | --- | --- |
| Admin M-01 dashboard | Members, revenue, occupancy, arrivals | `StatTile` x4: **Active members**, **Revenue 30 days**, **Occupancy 7 days** (booked / capacity), **Arrivals today**; a 7-day occupancy bar chart |
| Staff S-01 home | Front desk | **Arrivals today**, **Open shifts**, **On waitlist**, **Unread messages** (hint "in N conversations"); "Recent messages" card; quick actions (check-in, register & pay, open inbox) |
| S-06 inbox, M-06 CRM | CRM & WhatsApp | Two-pane inbox (unread first, filters Todos · No leídos · WhatsApp · Email), WhatsApp-style thread (member left, studio right, automations dashed, emails as cards, internal notes, bookings / payments / consents as system lines), composer WhatsApp · Email · Nota; the top-bar bell counts unread inbound |
| Teacher S-01..S-03 | Teaching | **Classes today**, **Taught this month**, **Estimated payroll**; attendance, notes, ratings, payroll statement read from the finance run |
| M-09 finance (+a/b/c) | Money | **Revenue**, **Pending**, **Refunded**, **Via Wompi**; **Balance of the period = Revenue − Payroll − Expenses**; payroll runs per teacher (monthly or biweekly, rate card by modality), expenses ledger with fixed-expense templates, DIAN invoices |
| M-02a..d content | Content & brand | Articles, FAQ, events, media library with 12 artwork "slots" the studio still owes |
| M-08a..f settings, M-10 integrations | System | Decisions-as-settings (contact identity with "confirmed" switch, payroll cadence, content decisions); one card per integration (Wompi, WhatsApp Business, email, DIAN, maps, Supabase) with a `simulated -> configured -> connected` chip |
| Customer app C-01..C-26 | Members | Home + intention, schedule, class, checkout, booking, waitlist, plans, passes, credits, history, profile, rules, FAQ, invite, gift, teachers, events, notifications, account & data (consents, export, delete request) |
| Website W-01..W-09 | Public | Home, about & philosophy, classes, class essay, modalities, schedule, teachers, plans with the value model explained, contact with a map slot, legal, public account-deletion |
| Ops manual K-03 | 7 parts, 28 chapters | I HOY (who we are, classes, value model) · II Daily operation (reception & check-in, classes & schedules, teachers, room / heat / maintenance, incidents & emergencies, training checklists) · III Customers & plans (sales, pauses & gifts, space B2B, CRM & WhatsApp) · IV Money (payments & till, invoicing & DIAN, payroll & payouts) · V Content & brand · VI Legal & policies · VII System (roles, tables, integrations, glossary). Live `{{directive}}` blocks read prices, hours, policies, tables and KPIs from the app |

**Data tables (48).** Core: `tenants, users, user_roles, profiles, settings, feature_flags, audit_log, page_layouts, docs_entries`. Operation: `modalities, class_templates, class_sessions, rooms, bookings, waitlist, teachers, intentions, events, event_rsvps, reviews`. Commerce: `plans, memberships, credits, payments, payment_methods, invoices (DIAN cufe), gift_cards, invites, special_charges, space_bookings`. Money out: `payroll_runs, payroll_lines, expense_templates, expenses`. Comms: `message_log` (the unified record: direction, source, subject, body, read receipts, external id), `wa_templates, email_templates, automations, notifications, notification_prefs`. Content / legal: `content_articles, faq_entries, media_assets, legal_documents, legal_acceptances, consents, deletion_requests, integrations`. Every row: `id, tenant_id, created_at, updated_at`.

**Tools it replaces.** The repo names the *integrations it will use* (Wompi payments and payouts, WhatsApp Business Cloud API, an email sender, DIAN e-invoicing provider, maps, Supabase), not a list of vendors the studio pays today; the hub and manual replace "the studio's spreadsheets, WhatsApp groups and a booking app" implicitly (memberships, credits, waitlist, check-in, payroll, expenses, CMS, emails, automations, CRM, legal library, media). No vendor prices in the repo. Lead Magnet's `gym_wellness` stack (Mindbody 279, Mariana Tek 350, Trainerize 90, plus COMMON) is the right family; see the proposal for what to add.

**Design system.** Brand palette lifted from the brand manual: cream `#F1E7D2`, light yellow `#F7F3B2`, deep blue `#35597D`, mid blue `#5F85B1`, ink `#1C2E42`, sand `#E7DCC6`, paper `#FBF7EF`; Inter (headings) + DM Sans (body); 4-pt spacing grid; radii 4 / 8 / 11 / 16 / 18 / 24 / 32 / 34; canvas Depth and Texture layers as CSS shadows and repeating gradients; four movement hues; light / dark; `data-skin=wireframe`. `StatTile` never wraps its value (measured fit); the desktop phone frame is a CSS container.

**Docs conventions.** `docs/rules/documentation.md`: prompt verbatim with the exact heading `## Response`; changelog header lines `version / date / prompt / intent / decision / rejected / files` then body naming codes; kanban with one lane per module and Backlog / Doing / Done columns; screenshots ES + EN x 390 + 1280, light + dark for key pages; `ROADMAP.md` §E lists the owner's 27 pending decisions and §F what is still mocked; manual is Spanish-first with an English mirror of the same file names; `/#/manual/decisions` auto-lists `> DECISIÓN PENDIENTE` callouts.

**What Lead Magnet should copy from Hoy.**
1. The **unified inbox** shape for the demo's Comms page (C-04): conversations unread first, one thread across WhatsApp / email / notes / system lines, a bell that counts unread inbound. Our `threadsFor()` already fakes six threads; the department view should add "Recent messages" as a widget kind the role home can show.
2. **Decisions-as-settings**: values the owner has not confirmed carry a `pending` label instead of a fake fact. For the demo: any KPI we derive from the catalog rather than the prospect's real data should read "sample" (we already have `demo.kpi_hint`; keep it honest).
3. **Balance = Revenue − Payroll − Expenses** as the money page's headline, with revenue "via <processor>" as a share tile.
4. The **value-model** framing (families with a commercial role) for a wellness prospect's plans section on the landing page.
5. `hoursSentence()`: hours as one derived sentence per language, never typed twice.

## 2. CTL OS (California Tenant Law)

**Business.** Tenant-side-only landlord-tenant practice since 1980, "serving all 58 counties by phone and video", a **network of eight regional offices** (Riverside / Inland Empire, Downtown LA, San Fernando Valley, Long Beach / OC, San Diego, Sacramento, Bay Area, San Luis Obispo) under one banner. Sells **unbundled, fixed-price services** ("like a legal vending machine"): initial consultation $165 / 30 min, follow-up $165, "I just got this paperwork, now what?" $100, situation evaluation $200, case evaluation $400, quick question $50, letters $300 / $600, hotline $60 per 10 minutes, ongoing work $330 / hour, court appearance min. $330, 800-series top-up SKUs $50-$2 000; 96 store products scraped live with `verified: false`. Educate-first funnel: free videos -> intake form -> paid consultation. Signature asset: the **Unlawful Detainer Game Board** (ten phases: start, quash, demurrer, default, discovery, summary judgment, trial, appeal, removal, outcomes) which is the spine of the data model (every case has a board position; templates, SKUs, deadlines and lessons bind to nodes).

**Roles and permissions** (`src/auth/permissions.ts`, 54 permissions): `cases.read|read_own|write|assign|close`, `documents.read|read_own|write|sign`, `deadlines.read|write`, `clients.read|write`, `intake.write`, `consultations.read|book|write`, `hearings.read|write`, `board.read|play`, `store.read|buy|write`, `payments.read|write|refund`, `messages.read|write`, `marketing.read|write`, `site.publish`, `opposition.read|write`, `projects.read|write`, `staff.read|write`, `roles.write`, `tenants.write`, `settings.write`, `rules.write`, `reports.read|financial`, `feedback.write|read|triage`, `manual.read`, `docs.read`, `tables.read|write`, `dev.tools`, `actions.run`, `audit.read`. Attorney = paralegal set + assign, close, sign, opposition, reports; client = own case, own documents, book consultations, play the board, buy from the store; opposing counsel = `opposition.*` and `documents.read_own` only. `ROLE_HOME`: owner `/owner`, attorney `/counsel`, paralegal `/assist`, front desk `/desk`, marketing `/marketing`, client `/app`, opposing counsel `/opposition`.

**Departments** (`proposalData.ts` DEPARTMENTS, the feature matrix's rows; 52 features): Front desk · Legal team · Discovery · Documents & pleadings · Client learning · Owner & finance · Marketing · Operations manual · Opposing counsel. Staff side menu groups: Overview, Intake & consultations, Cases, Deadlines & hearings, Documents & filings, Game board, Clients, Opposing counsel, Store & payments, Messages & hotline, Marketing, Reports, Projects & plan, Settings, Ops manual.

**Role homes and KPIs.**

| Home | `StatTile` row | Sections |
| --- | --- | --- |
| O-01 owner | **Late items** (late-work radar), **Open cases**, **Paid**, **Due** | Late-work radar by person; caseload by attorney; revenue by SKU; revenue by office (bars against max); network offices table (attorneys, cases, late, paid, due); **intake conversion this month** (intakes -> scheduled, %); office filter action `owner.filterOffice` |
| F-01 front desk | **Consults today**, **Intake queue**, **Payments pending**, **Calls to return** (Placeholder) | Today's consultations (mark held), new intakes (review), unpaid invoices, schedule / book consult / new intake actions |
| L-01 attorney | **Active cases**, **Running late**, **Deadlines this week**, **Docs to review** | My cases with board square and county, next hearings, discovery due, approve / assign actions |
| S-01 paralegal | **Open assignments**, **Late items**, **Filings due**, **Uploads to file** | Assignments by status (todo / in progress / blocked / done), documents to prepare from templates per node |
| C-01 client | On the board (position + what happened + what next), **Pay next** / total due, **Watch next**, my deadlines in plain language, my binder (documents, what is missing), messages, hotline | PhoneShell; C-02 binder, C-03 learn (video curriculum with watched state), C-04 pay |
| X-01 opposing counsel | Documents served with acknowledgement, meet-and-confer log, scoped to one case | |
| GB-01..03 board | Interactive 2D board, "where am I" case mode, cost / if-then overlay | 45 squares carry real cost bands from the SKU catalog |

**Data tables (27).** Core: `tenants (network + offices), users, feedback, page_layouts, presence, actions_log`. Ops: `cases (status intake / active / on_hold / won / lost / settled / closed; attorney, paralegal, desk ids; stage_node_id), deadlines, assignments (document / filing / call / review / upload), consultations (initial / followup / hotline; phone / teams / video), intakes, documents (template / filed / evidence / upload; served_to), invoices (SKU, due / paid / refunded), lessons, lesson_progress, service_events, meet_confer`. Board: `board_positions, board_moves, board_node_meta`. Catalog: `service_categories, services (SKUs)`. Plan: `plan_lanes, plan_passes, plan_tasks`. Manual: `manual_progress`. Assets: `illustrations`. Every row: `id, tenant_id, created_at, updated_at, version`.

**Tools it replaces** (`REPLACEMENTS` in `proposalData.ts`, rendered on P-03 "Replaces"; evidence flag per row: indexed / inferred / client). No vendor subscription prices are stated in the repo; the firm's own service prices are.

| Today | Kind | Replaced by |
| --- | --- | --- |
| WordPress + `cms.` subdomain + legacy `.htm` pages | replaced | Public site module, city pages from data, EN + ES |
| Ecwid store (~40-96 SKUs by stage, 800-series top-ups) | replaced | Store by board stage on the same catalog the templates and cost roadmap read |
| PayPal and card checkout | partly | Checkout and receipts inside the case, real time tracking; Stripe stays behind the seam |
| Microsoft Teams | replaced | In-app video: schedule, join, record, transcribe, summarise onto the case timeline |
| VoiceStamps hotline billing ($60 / 10 min deposit) | replaced | Telephone through the comms seam: click to call, minutes metered, notes on the case, one bill |
| Online scheduler (vendor not identified) | replaced | Scheduling against attorney availability across the network |
| Intake forms provider (vendor not identified) | replaced | Intake as records: queue, convert to client + case in one action |
| YouTube-hosted curriculum | partly | Lessons mapped to board stages with watched state; YouTube stays for reach |
| WordPerfect pleading paper | replaced | Template catalog per node, assembly, browser pleading-paper editor with PDF / DOCX, realtime co-editing |
| Separate email and SMS tools | replaced | One `message_log`, one inbox |
| Spreadsheets for deadlines, assignments and revenue | replaced | Deadline engine (every rule cites a statute row), assignments, owner radar |
| No client portal, no CRM, no project management | replaced | Client app, CRM, PM viewer |

**Design system.** Three switchable directions on one component set (`data-brand`): **Clear sky** (default: paper `#F7F1E6`, ink navy `#0B1730` / `#1F3B6E`, sky accent `#3E9BE0`, one amber CTA `#E1891C`; Source Serif 4 display + Source Sans 3), **Board game** (felt green, cardstock, the poster's KEY hues; Bricolage Grotesque display), **Courthouse** (near-black ink, warm off-white, one vermilion accent, hairlines). `--scale` bands at 2560 and 3840, `--fs-floor` 16 px from 1920, 3 px focus ring, hairlines and tinted shadows instead of grey borders, radii 10 / 16 / 24, 44 px buttons; amber is used for exactly one primary action per screen.

**Docs conventions.** `docs/README.md` reading order: map -> `platform-principles.md` -> `CLAUDE.md` -> `build-plan.md` -> `kanban.md` -> `decisions.md` -> `plan/tasks.json`. Decisions table `# | Date | Decision | Source | Status` with `binding (Justin <date>)` / `proposed (needs Justin)` / `superseded`. `plan/tasks.json` is the PM viewer's source (ticks, not days; `T-nnn` stable forever); `kanban.md` mirrors it and the viewer flags mismatches in dev mode. Ops manual English source, `es/` mirror, nine parts with planned chapter numbers per part (10-13, 20-23, 30-39 ...), `## In person` / `## In CTL OS` in every chapter, `{{pricing:...}}` live blocks. `docs/legal/` statute index with `verified_on`, append-only law-change log; nothing is legal advice until verified. Firm facts carry `evidence: scraped-live`, `verified: false`. Worktree-per-module build with a fixed integration order (D-033).

**What Lead Magnet should copy from CTL.**
1. The **late-work radar** as the owner's first widget: late items by person, by office. Our `deriveRoleViews()` gives owners a "This month vs last" chart; a "Running late" list is the more honest owner KPI for any multi-person business.
2. **Revenue by SKU / by location** tables (a `table` widget with a bar-against-max column) instead of a single revenue number for prospects with `locations > 1`.
3. The **replacement map row shape**: `today, evidence (indexed | inferred | client), kind (replaced | partly), doesToday, pain, replacement, seam?`. Our `StackGuess` has `status: guessed | confirmed | rejected`; adding `kind: replaced | partly` and a `seam` sentence ("Stripe stays behind the seam") makes the savings stack (`savings_stack` section) more credible when a tool is kept.
4. **Client-facing plain-language KPIs**: "What comes next", "What to pay next", "What to watch next". For the demo's customer-facing role views (C-05 life page and any `customer` role) these beat generic tiles.
5. `evidence` and `verified` flags on every scraped fact: S-02's paste-facts extractor should store where a fact came from, so a landing page never states an unverified vendor as truth.
6. Three switchable **visual directions** on one component set is exactly what `prospectStyle()` does per prospect; CTL proves the tokens-only approach holds for a whole system, including a serif display face.

## 3. Petrock (dog hotel and spa)

**Business.** Petrock Hotel & Spa (est. 2011), music-themed penthouses and suites, grooming & spa (one service: Gold / Platinum / Diamond packages priced by size S / M / L / XL / Giant, e.g. Gold $50-$135, Platinum $65-$150, Diamond $85-$185; all grooming prices include a $12 sanitation fee), daycare (full day $45 at 6 h+, half $35, play hour $15, walk $12), training. Two locations with different hours and capacities (Encino: 12 penthouses, 42 suites, 20 daycare, 2 grooming stations; Westwood: 20 / 16 / 15 / 2). Room rates seeded Penthouse $120 / $135, Suite $85 / $95 plus seasonal uplift; multi-dog and long-stay discounts (5 / 7.5 / 10 % at 7 / 14 / 21 nights paid in full); card fee 3.89 %; tax 2 %. Vaccines: Rabies, DHPP, Bordetella required; Lepto, Influenza recommended; bookings stay `pending_vaccines` until staff verify. Booking lifecycle: `requested -> pending_vaccines -> confirmed -> checked_in -> checked_out` plus `cancelled`, `no_show`. Website is Squarespace; legacy desk screenshots show PetLinx; reservations today by phone / SMS / email (no online booking engine surfaced).

**Roles and permissions** (`src/auth/permissions.ts`, 42 permissions): `bookings.read|write|write_any|status|cancel|delete`, `appointments.read|write`, `daycare.write`, `customers.read|write|delete`, `pets.read|write`, `vaccines.verify`, `payments.read|write|refund`, `discounts.apply`, `cash_drawer.open`, `invoices.write`, `employees.read|write`, `roles.write`, `pricing.write`, `settings.write`, `locations.write`, `rules.write`, `reports.read|financial|employees|export`, `messages.read|write`, `reviews.moderate`, `feedback.write|read`, `approvals.grant`, `tables.read|write`, `dev.tools`, `docs.read`, `audit.read`. Manager = front desk + cancel, delete, refund, discounts, employees, reports, moderate, **approvals.grant** (PIN approvals). Staff PIN login (A-00); manager-gated transitions open `PinApprovalModal` which writes an `approvals` row first. `ROLE_HOME`: owner / super `/admin`, manager / desk `/desk`, groomer `/desk/grooming`, customer `/app`.

**Departments** (side-menu groups): Overview, Hotel reservations, Grooming & Spa, Daycare, People & pets, Vaccines, Payments & invoices, Messages & reviews, Reports, Settings, Extras (walking, tasks, education), Ops manual.

**Dashboards and KPIs.**

| Page | `StatTile` row | Other widgets |
| --- | --- | --- |
| A-01 owner dashboard (location-scoped) | **Revenue today** (hint: this month), **Dogs in house** (hint: N arriving · N departing), **Grooms today** (hint: N daycare), **Needs attention** (pending vaccines + new feedback + pending reviews) | Occupancy meters per room type, daycare and grooming (groomers x 8 slots); today's schedule list; attention list; revenue chart by range |
| F-01 front desk today | **Arriving**, **Departing**, **In house**, **Daycare**, **Pending vaccines**, **Balance due**, **Grooming & Spa** | Day buckets, reservations table, timeline (rooms x days), kanban board by status |
| Reports (A / F-62) | **Total booked**, **Avg occupancy (14 d)**, **Bookings in range**, **Groomers**, **Customers**; **Collected**, **Card fee collected**, **Tax collected**, **Outstanding balances**; **Occupied tonight** (n / capacity), **Room-nights in period**, **Average stay**, **Arrivals in period**; **Hotel bookings** (hint nights), **Grooming appointments**, **Daycare days** (hint dogs) | Funnel by status; per-groomer and per-customer tables |
| Grooming day (F-30) | Groomer columns, appointment kanban, agenda | |
| Extras | Walking (planned / done), Tasks (open), Education (**Chapters for my role**, **Active staff here**), Reviews moderation (**Waiting for moderation**) | |
| Customer app C-01..C-84 | Home, pets, add-pet wizard, vaccines per pet (upload proof, status), hotel flow (pets, share room, room type, dates, medical questionnaire, estimate, deposit or full, confirmation), grooming (package by size, add-ons, time, pay), daycare, bookings & invoices, chat with the front desk, notifications, settings incl. account deletion | |

**Data tables (74).** Core: `users, roles, permissions, employees (pin_hash), locations, capacities, room_types, rooms, settings, lookup_values, holidays, working_hours, audit_log, approvals, feedback, page_layouts, legal_documents`. Customers: `customers, customer_profiles, customer_notes, emergency_contacts, pets, pet_profiles, pet_lookups, vets, vaccine_types, vaccine_records, auth_credentials, auth_codes, auth_events, account_deletion_requests`. Bookings: `bookings, booking_pets, booking_services, booking_pet_care, booking_events, booking_change_requests, appointments, appointment_extras, grooming_orders, daycare_bookings, daycare_booking_pets, walks, tasks`. Pricing (engine reads only tables): `rates, seasons, discounts, fees, taxes, packages, addons, daycare_pricing, services`. Money: `invoices, payments, payment_methods, providers`. Comms: `conversations, conversation_assignments, messages, chat_quick_replies, notifications, notification_prefs, reviews, site_inquiries, site_faqs, faq_items, support_requests`. Quality: `qa_runs, perf_budgets, backups, routes, pages, rules, training_completions`. Every row `id, created_at, updated_at` (+ `location_id` when location-scoped).

**Tools it replaces.** From the brief and site digest: **Squarespace** (website, "rebuild later if appropriate"), **PetLinx** desktop (legacy booking screenshots in the design drop), phone / SMS / email reservations with no online engine, card payments (Stripe planned behind `PaymentProvider`). No vendor prices in the repo (petrockhotel.com was unreachable from the build environment; facts are "publicly indexed", D-187). Lead Magnet's `pet_care` stack (Gingr 165, PetExec 129, Homebase 24.95, Square 60 + COMMON) covers the family; see the proposal for the hotel-specific additions.

**Design system.** Rebuilt from Figma: brand purple `#552583` ramp (25..800), accent `#E79DD1`, second brand `sunset` as proof that a brand is one map entry; neutrals ramp with named Figma values (desk canvas `#F4F0FF`, lists `#F4F6FA`, forms `#EEF2F5`); status hues incl. booking-lifecycle hues per status; Open Sans body + Be Vietnam Pro display; radii 8 / 10 / 4; 4-pt grid; light + dark (dark derived). Full responsive matrix 360-3840 with `checkedAt` per spec; TV widths verified on key pages first.

**Docs conventions.** As `house-pattern.md` §3 (Petrock is its main source): `docs/README.md` map, brief, decisions (217 rows, `decided / pending / superseded`), kanban, prompts / changelog with the header-lines format, `figma/` (screen catalog as the source of truth for screens), `design/` (tokens draft, fidelity audit and composites), `data/entities-from-designs.md`, `rules/business-rules-from-designs.md` (seed of the rules registry, `R-xxx` ids with status requested / in dev / implemented), `reference/` digests incl. `surfaces.md`, `pages/<CODE>.md` (172), screenshots per code, `ops-manual/en/` 24 chapters (welcome, front desk daily ops, check-in / out, vaccine verification, hotel reservations and the lifecycle, grooming agenda, daycare day, PIN approvals, payments / invoices / refunds, messages / notifications / reviews, manager duties, owner settings and pricing, roles / permissions / locations, reports, staff feedback and the rules registry, glossary and data tables, website and customer app, walks / tasks / education, ... owner control panel, quality tools).

**What Lead Magnet should copy from Petrock.**
1. **Location-scoped everything** for `locations > 1` prospects: front desk pinned to one location, owner switches, "current location always in the top bar". Our demo shell could show a location chip whenever `prospect.locations > 1`.
2. The **"Needs attention" composite tile** (pending verifications + new feedback + pending reviews) as the fourth owner KPI, with the hint spelling out the parts.
3. **Occupancy meters per resource type** (room type, daycare spots, groomer slots) as a widget kind: a `meter` (value / max / hint) is what hotels, studios and clinics all need and our `WidgetKind` lacks.
4. **Day buckets** (arriving / departing / in house) as the front-desk "Today" strip for any stay-based business.
5. **Pricing only from tables** and a **booking lifecycle vocabulary** (`StatusBadge`, never another set of words): the demo's Money page should use one status vocabulary for payments (`paid / pending / failed` already).
6. **PIN approvals** as the pattern for "manager approves in place": a nice differentiator sentence for the landing page's proof section for any business with a front desk.

## 4. The catalog item shape (what a proposal has to fit)

`src/engine/catalog/industries.ts` (23 industries, 114 tools). Adding or extending an industry is a property in `DEFS`; nothing else changes (`IndustryKey = keyof typeof DEFS`).

```ts
interface Industry {
  key: IndustryKey; label: Bi;
  departments: Bi[];                       // C-03 renders one column per department; KPI i % kpis.length, 2-3 people, 3 open items from pains
  business_roles: string[];                // deriveRoleViews(): one RoleView per role (max 6), 3 widgets each; regex on the role name picks chart / chat
  life_roles: string[];                    // max 5; regex picks the family / accountant / advisor widget set
  stack: StackItem[];                      // guessStack() + savings(); s(tool, category, monthly_cost, replaced_by, prevalence, { per_seat?, per_location?, price_reviewed, price_source_note })
  pains: Bi[];                             // "Needs attention" lists, thread subjects, department open items
  kpis: { label: Bi; sample: string }[];   // kpi widget, today strip (k[0], k[1]), department stat
  motifs: string[]; verbs: Bi;             // image prompts, headline verb
  sub?: SubIndustry[];                     // { key, name: Bi, extra_tools?: string[], roles?: string[] } - D-063
}
```

Consumption today: `sample.ts` builds the week (`<department> block`, `<kpi> review`), threads (pains), today strip (kpis 0-1) and quick actions from these fields; `DepartmentsPage.tsx` uses `departments`, `kpis`, `pains` and `business_roles`; `roles.ts` uses `business_roles`, `life_roles`, `kpis`, `pains`. **`sub[].extra_tools` and `sub[].roles` are declared but not read anywhere outside the catalog yet** (only `intake.ts` reads `sub[].key` for the S-02 question); plan task T55 is the engine work. So a sub-industry proposal below changes what S-02 offers and what the prospect stores now, and what the demo shows only once T55 lands (or the seeded prospect sets `business_roles` explicitly, which `deriveRoleViews()` already honours).

Prospect fields a seed needs (`ProspectRow`): `first_name, last_name, business_name, industry, sub_industry, city, country, lang (en|es), website, team_size, locations, revenue_band (lt250k|250k_1m|1m_5m|5m_plus), warmth (cold|warm|hot), source (cold_email|linkedin|referral|event|inbound), style { palette {primary, accent, bg, surface, text}, tone (bold|warm|clean|luxury|playful), font (display|humanist|serif|mono), imagery[] }, life_roles, business_roles, known_tools, confidence, fields_known, notes`.

## 5. Proposed item updates

All proposed; none applied (this worker may only write this file). Catalog edits belong to a catalog worker (`src/engine/catalog/**`), seed edits to `src/data/seed/prospects.ts`, and the decision rows to `docs/decisions.md` as `proposed (needs Justin)`.

### 5.1 Industry mapping

| System | Industry key | Sub-industry | Why |
| --- | --- | --- | --- |
| Petrock | `pet_care` | **new** `dog_hotel_spa` "Dog hotel & spa (boarding, grooming, daycare)" / "Hotel y spa para perros" | A dog hotel is pet care with a hotel's operations (rooms, nights, occupancy, day buckets), not human hospitality. Adding a human `hospitality` key would misfile Petrock; if a human hotel prospect ever appears, that is a separate industry with its own stack (PMS, channel manager). Proposed decision row: "Dog hotels live under `pet_care` as sub `dog_hotel_spa`; no `hospitality` key until a human-hospitality prospect exists." |
| CTL | `law_firm` | **new** `tenant_law` "Tenant / landlord-tenant law" / "Derecho de inquilinos" | The existing subs are family, immigration, small business. Tenant law is stage-driven (eviction procedure), fixed-price and phone / video first, so its tools, roles and KPIs differ from a billable-hour practice. |
| Hoy | `gym_wellness` | **new** `wellness_club` "Wellness club (yoga, pilates, breath, memberships)" / "Club de bienestar" | `yoga_studio` exists but Hoy is a multi-modality club with memberships, credits, pauses, gifts and B2B space rental, a coordinator and a finance role, and payroll per class. |

Rule kept: sub keys are additive and never renamed once shipped (D-063).

### 5.2 Catalog diffs

Prices marked **(repo)** come from the reference repo; prices marked **(est.)** are Lead Magnet plausible 2026 list prices, USD / month, to be reviewed on the catalog pass with `price_reviewed` and a `price_source_note` where the fee is not a flat subscription. Every new tool must be added to the industry's `stack` (not only to `extra_tools`), because `CATALOG_TOOL_NAMES` is built from `stack` and `extra_tools` are validated against it.

**`pet_care`** (Petrock depth)

| Field | Today | Proposed |
| --- | --- | --- |
| departments | Front desk, Daycare floor, Grooming, Boarding, Marketing, Money | Front desk · **Hotel (rooms & stays)** · Grooming & Spa · Daycare · **People & pets (vaccines)** · **Payments & invoices** · **Messages & reviews** · Marketing |
| business_roles | owner, manager, front desk, handler, groomer | owner, **manager (approvals)**, front desk, groomer, **handler / daycare attendant**, **walker / trainer** (cap 6 in the demo) |
| life_roles | owner, spouse/partner, kids, accountant, vet partner | unchanged |
| kpis | Dogs in today 42 · Occupancy 86% · Vaccines expiring 7 | **Dogs in house** 38 · **Arriving / departing today** 9 / 6 · **Occupancy tonight** 86% · **Grooms today** 11 · **Pending vaccines** 7 · **Balance due** $2,140 · **Revenue today** $3,480 · **Average stay** 3.4 nights |
| pains | vaccine records by hand; double bookings; report cards from personal phones | keep three + **"Manager approvals by phone call"** · **"Two locations, two spreadsheets"** · **"Photos and nightly updates sent by hand"** |
| stack additions | Gingr, PetExec, Homebase, Square + COMMON | + `Squarespace` (Website, **23** est., replaced by "Website") **(repo names the vendor)** · + `PetLinx` (Pet software, **69** est. per location, replaced by "Bookings & pets", prevalence 0.15) **(repo names the vendor)** · + `Time To Pet` or `Kennel Connection` optional (Pet software, ~**45-99** est., prevalence 0.1) · + `Yelp Ads` (Reviews & ads, **150** est., replaced by "Reviews", prevalence 0.3, note "ad budget, not a subscription") |
| sub | grooming, boarding, pet_transport_vet_partner | + `dog_hotel_spa` `{ extra_tools: ['Gingr', 'PetLinx', 'Squarespace'], roles: ['manager', 'front desk', 'groomer', 'handler'] }` |
| motifs | happy dogs mid-play, sunlit play yard, grooming table, report card on a phone | + "music-themed suite with a bed and a TV", "nightly photo update", "front desk with two location chips" |

**`law_firm`** (CTL depth)

| Field | Today | Proposed |
| --- | --- | --- |
| departments | Intake, Matters, Billing, Documents, Marketing | Front desk & intake · **Cases (by stage)** · **Deadlines & hearings** · **Discovery & the binder** · Documents & pleadings · **Client learning** · Owner & finance · Marketing · **Opposing counsel** (cap: the demo board renders all; nine columns wrap on phone, fine) |
| business_roles | managing partner, associate, paralegal, intake, billing | owner attorney, **attorney**, paralegal, front desk, **marketing**, **billing** |
| life_roles | owner, spouse/partner, kids, accountant, of counsel | unchanged |
| kpis | Open matters 73 · Unbilled hours 118 · Intake this week 22 | **Open cases** 73 · **Late items** 9 · **Deadlines this week** 14 · **Consults today** 6 · **Intake queue** 11 · **Intake conversion this month** 41% · **Paid / due this month** $18,480 / $3,960 · **Docs to review** 5 |
| pains | intake calls not logged; unbilled hours; documents from old templates | keep + **"Deadlines tracked in a spreadsheet"** · **"Five tools between the form and the consultation"** · **"Pleadings hand-drafted on numbered paper"** · **"No idea what the client watched before the call"** |
| stack additions | Clio 129/seat, MyCase 89/seat, Lawmatics 199, LawPay 19 + COMMON | + `Ecwid` (Online store, **35** est., replaced by "Store & payments", prevalence 0.1 industry-wide, 0.8 for tenant_law) **(repo)** · + `WordPress hosting` (Website, **30** est., "Website", 0.5) **(repo)** · + `Microsoft Teams` (Video calls, **4** est. per seat, "Calls & video", 0.4) **(repo)** · + `VoiceStamps` (Pay-per-call billing, **30** est., "Calls", 0.05, note "per-call vendor; flat stand-in") **(repo)** · + `Jotform` (Forms, **39** est., "Intake", 0.35) · + `WordPerfect` (Word processor, **0**, "Documents", 0.05, note "one-time licence; the cost is the hours, not the fee") **(repo)** · + `PayPal` (Payments, **0**, "Payments", 0.4, note "per-transaction, ~3.5 %; no subscription") **(repo)**. COMMON already brings DocuSign, Zoom, RingCentral, Calendly. |
| sub | family, immigration, small_business | + `tenant_law` `{ extra_tools: ['Ecwid', 'Microsoft Teams', 'WordPerfect', 'VoiceStamps'], roles: ['attorney', 'paralegal', 'front desk'] }` |
| motifs | quiet office library, partner reviewing on a tablet, matter timeline, signature ceremony | + "eviction game board on a wall screen", "client on a phone reading what comes next", "numbered pleading paper on a monitor" |

**`gym_wellness`** (Hoy depth)

| Field | Today | Proposed |
| --- | --- | --- |
| departments | Front desk, Coaching, Memberships, Classes, Marketing | Front desk & check-in · Classes & schedule · **Teachers & payroll** · Memberships & plans · **CRM & WhatsApp** · **Money (payments, invoices, expenses)** · Content & brand · **Room & maintenance** |
| business_roles | owner, studio manager, coach, front desk, sales | owner, **coordinator**, front desk, **teacher**, **finance**, **maintenance** (cap 6) |
| life_roles | owner, spouse/partner, kids, accountant, nutritionist | unchanged |
| kpis | Active members 512 · Class fill 78% · At-risk this week 19 | **Active members** 312 · **Occupancy 7 days** 78% · **Arrivals today** 46 · **On waitlist** 9 · **Unread messages** 6 · **Revenue 30 days** $41,200 · **Estimated payroll** $9,800 · **Balance of the period** $18,400 |
| pains | members churn silently; waitlists by text; coaches on a separate app | keep + **"Teacher payroll computed in a spreadsheet"** · **"WhatsApp threads live on one phone"** · **"Prices typed in three places"** |
| stack additions | Mindbody 279, Mariana Tek 350, Trainerize 90, Gympass listing 49 + COMMON | + `WhatsApp Business (manual)` (Messaging, **0**, "Chat", 0.7, note "free app; the cost is the phone it lives on") · + `Glofox` (Studio software, **110** est., "Members & classes", 0.2) · + `Momence` (Studio software, **99** est., "Members & classes", 0.15) · + `Squarespace` (Website, **23** est., "Website", 0.4; shared with pet_care) · + `Gusto` (Payroll, **40** est. + 6 / seat, "Payroll", 0.35, `per_seat`) |
| sub | gym, yoga_studio, personal_training | + `wellness_club` `{ extra_tools: ['Mindbody', 'Glofox', 'WhatsApp Business (manual)'], roles: ['coordinator', 'front desk', 'teacher', 'finance'] }` |
| motifs | sunrise class, coach with tablet, member check-in screen, community wall | + "cream and deep-blue studio at 6 am", "teacher's payroll statement on a phone", "WhatsApp inbox on the front-desk screen" |

**Engine follow-ups the diffs imply** (for the plan, not this doc): (a) T55: `guessStack()` weights `sub[].extra_tools`, `deriveRoleViews()` prefers `sub[].roles`; (b) new `WidgetKind` `meter` (value / max / hint) for occupancy; (c) a department may name its own KPI indices instead of `i % kpis.length` (a `departments[].kpi?: number` field, additive); (d) `StackGuess.kind: 'replaced' | 'partly'` + optional `seam` sentence for the savings stack (CTL's replacement-map shape).

### 5.3 Proposed seeded prospects (fictional; ids `pro_camila`, `pro_alicia`, `pro_valeria`)

None of these is Petrock, CTL or HOY; names, cities, palettes and numbers are invented so the demo shows the *shape* of each system without stating facts about a real company.

| Field | Dog hotel (Petrock-style) | Tenant-law firm (CTL-style) | Wellness club (Hoy-style) |
| --- | --- | --- | --- |
| id · name | `pro_camila` · Camila Reyes | `pro_alicia` · Alicia Navarro | `pro_valeria` · Valeria Mendoza |
| business_name · slug | Fetch & Stay Dog Hotel · `fetch-and-stay-san-diego` | Renters' Shield Law · `renters-shield-law-fresno` | Raíz Wellness Club · `raiz-wellness-san-antonio` |
| industry · sub_industry | `pet_care` · `dog_hotel_spa` | `law_firm` · `tenant_law` | `gym_wellness` · `wellness_club` |
| city · country · lang | San Diego · US · en | Fresno · US · en (Spanish-speaking clients; ES fill matters) | San Antonio · US · es |
| team_size · locations · revenue_band | 18 · 2 · `1m_5m` | 11 · 4 (network of offices) · `1m_5m` | 14 · 1 · `250k_1m` |
| warmth · source | warm · event | hot · referral | warm · inbound |
| style.palette | primary `#3F2B96` indigo, accent `#F2A93B`, bg `#F7F5FF`, surface `#FFFFFF`, text `#1E1B2E` | primary `#1B4332` deep green, accent `#D9A441` gold, bg `#F6F4EE`, surface `#FFFFFF`, text `#12261C` | primary `#2F4858` slate blue, accent `#E4B363` sand, bg `#FAF6EE`, surface `#FFFFFF`, text `#1F2A33` |
| tone · font | playful · display | clean · serif | warm · humanist |
| imagery | "music-themed suite with a TV", "nightly photo update on a phone", "two storefronts, two hours boards" | "eviction game board on a wall screen", "client reading what comes next on a phone", "numbered pleading paper on a monitor" | "cream studio at sunrise", "teacher's payroll statement", "WhatsApp inbox at the front desk" |
| business_roles | owner, manager, front desk, groomer, handler, walker | owner attorney, attorney, paralegal, front desk, marketing, billing | owner, coordinator, front desk, teacher, finance, maintenance |
| life_roles | owner, spouse/partner, kids, accountant, vet partner | owner, spouse/partner, kids, accountant, of counsel | owner, spouse/partner, kids, accountant, nutritionist |
| known_tools | Squarespace, PetLinx | WordPress hosting, Ecwid, Microsoft Teams, WordPerfect | Mindbody, WhatsApp Business (manual), Squarespace |
| fields_known | KNOWN + known_tools, website, revenue_band | KNOWN + known_tools, website, revenue_band | KNOWN + known_tools |
| notes | "Two locations; front desk should only see its own; owner wants both on one screen. Vaccines chased by text today; managers approve refunds by phone call." | "Fixed-price services by eviction stage; consultations by phone / video only; deadlines in a spreadsheet; pleadings in WordPerfect; wants clients to see what comes next and what to pay next." | "Spanish-first team; memberships plus class packs; teacher payroll per class in a spreadsheet; WhatsApp on one phone; wants the studio's numbers on the front-desk screen." |

Each seed follows `prospects.ts`: `guessStack` -> `stack_guesses`, `pickArchetype`, `composePage` -> `pages` (status live, 14-day expiry), `imagePrompts` -> `assets`, one `touches` row, 1-3 sessions of events, a booking for the hot one. Adding three prospects to the seed changes core seed shape, so `SEED_VERSION` in `MockProvider.ts` must be bumped (D-0xx in the catalog worker's `_pending`).

### 5.4 Proposed decision rows (for `docs/decisions.md`, status `proposed (needs Justin)`)

1. Dog hotels are `pet_care` sub `dog_hotel_spa`; no human `hospitality` key until a human-hospitality prospect exists.
2. Sub-industries `tenant_law` and `wellness_club` added; tools named by the reference repos (Squarespace, PetLinx, Ecwid, WordPress hosting, Microsoft Teams, VoiceStamps, WordPerfect, PayPal, WhatsApp Business) enter the catalog with `price_source_note` where the fee is not a subscription; every price is a Lead Magnet estimate until the catalog pass reviews it.
3. Three more seeded prospects (`pro_camila`, `pro_alicia`, `pro_valeria`) so the OS demo shows a dog hotel, a tenant-law firm and a wellness club; the three existing prospects stay.
4. Widget kind `meter` and department-level KPI index are additive engine changes; `StackGuess.kind` + `seam` adopted from CTL's replacement map.

## Resumen en español

Este documento resume los tres sistemas operativos reales de imagine-os (Hoy OS: club de bienestar en Medellín; CTL OS: bufete de derecho de inquilinos en California con ocho oficinas; Petrock: hotel y spa para perros en Los Ángeles) tal como están en sus repos: roles y permisos, departamentos, tableros y KPIs, tablas, herramientas que reemplazan, sistema de diseño y convenciones de documentación. Termina con propuestas concretas para Lead Magnet: mapear cada sistema a una sub-industria del catálogo (`pet_care/dog_hotel_spa`, `law_firm/tenant_law`, `gym_wellness/wellness_club`), ampliar departamentos, roles, KPIs, dolores y herramientas con la profundidad de los sistemas reales, y sembrar tres prospectos ficticios (hotel para perros, bufete de inquilinos, club de bienestar) para que el demo del OS muestre esa profundidad. Todo es propuesta; nada se aplicó en este turno. Modelo: Fable 5.1.
