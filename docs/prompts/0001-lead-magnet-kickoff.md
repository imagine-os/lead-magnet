# 0001 - Lead Magnet kickoff

date: 2026-09-18 22:44 UTC · from: Justin Massion via Slack #lead-magnets · surface: all · follows: none (first prompt)

## Prompt (verbatim)

Let's build a template site for the greatest lead magnets ever.

Essentially our lead magnet is a pre-done-for-you operation system completely themed to you and what we know about you, your business, your style, your life, and so on, depending on who we show it to. Every role of the people in their life is able to have their own view into it and, of course, it is multi-platform and so on.

What really makes this special is that we are coming to them with something already made, already styled, already custom, that brings so much value and saves them so much money because they can start cutting all their old software. Once we know who we're talking about, we will automatically be able to guess what software they might be using, what they can cut, and so on, as well as identify the departments, the things, features, and more that are required.

Consider that this is a platform for generating landing pages, which will be connected to the platform for generating the proposals, the content, and anything that gets their attention from the cold outreach in the first place or warm outreach if possible. We need to be able to track everything through the system.

We will be using the best image generators a lot in order to create really cool things to get their attention in a completely custom way. We can also use things like video on scroll and other great features on the landing page.

The main thing here is that the landing page for the amazing lead magnet needs to get them to the next stage, which is into the demo or into booking a call with us. Really really focus on what's going to convert the highest. Give me a couple options for different types of pages that you think will convert the highest based on what we're offering. I can give you more examples of what the actual content will look like.

I really want you to build in a way that, as we learn who the audience is and gather some information about them through an AI methodology, you'll be able to custom adapt accordingly. With the exact thing that's going to be the highest possible conversion of the lead magnet itself (which in most cases is going to be some kind of software that's totally tailored to them and blows them out of the water, blows them away, and shows that we can do everything all in one for the first time ever)

lead-magnet is an empty repo for you. and its set to github actions for pages.

## Response

**Model: Fable 5.1** (foundation, architecture, shared code). Six Opus 5 module workers follow in parallel; Sonnet 5 runs the polish passes.

This turn built the foundation of `imagine-os/lead-magnet` (v0.1.0), live at https://imagine-os.github.io/lead-magnet/ after the Pages workflow runs:

1. **Development plan first** (`docs/build-plan.md` + `tasks` table, 31 tasks T01..T51, model per task, dependencies not dates). The K- plan viewer (Kanban / list / timeline) is stubbed and assigned to T10.
2. **Conversion reasoning** in `docs/reference/conversion-playbook.md`: the offer, nine highest-converting principles, and four page archetypes: **A. The Reveal** (default), **B. The Savings Audit** (cold / price-sensitive; captures data as they correct the list), **C. The Walkthrough** (warm, relationship businesses: a day in the life), **D. The Letter** (hot / high-ticket). `pickArchetype()` scores them per prospect and `adaptFromEvents()` recommends changes from tracking.
3. **Personalization engine** (`src/engine`, pure, 9 unit checks): industry catalog (10 + other, real tools and prices), `guessStack`, `savings`, `deriveRoleViews` (every business and life role gets 3 themed widgets), `composePage` (EN + ES copy resolved), `imagePrompts` (hero, phone / laptop / TV, role cards, OG, video frames), adaptive intake (`nextQuestions`, `applyAnswer`, `Enricher` seam with the LLM as a Placeholder).
4. **Platform**: tokens with light / dark and 10-foot `--scale` bands, per-prospect `--lp-*` theming, roles / permissions / session, i18n, `DataProvider` + MockProvider with 9 tables, actions bus (WebMCP surface), `track()`, 36 library components (incl. `Placeholder`, `DeviceMockup`, `PhoneFrame`, `ViewportFrame`, `FeedbackButton`), hub HUB-01 / HUB-02, dev tools D-01..D-09 including the **page canvas D-07** (zoom, pan, live thumbnails), stubs for all 37 planned pages (50 routes), 3 fictional seeded prospects with live pages, events and touches.
5. **Docs**: README, CLAUDE.md (module contract for the parallel workers), platform principles, project brief, decisions D-001..D-023 (D-011, D-013, D-014, D-015 `proposed` for Justin), kanban, this prompt, changelog 0001, page docs for every code, surfaces, house pattern, company-os, data model.

Not wired yet (by design, Placeholders + interfaces): image generation (T40), video-on-scroll (T41), booking provider (T42), LLM enricher (T43), Supabase (T44), Stripe (T51), Company OS (T50, blocked until Justin says so).

Justin's examples of real content are welcome next: they feed the catalog copy, the section templates and the image prompts.

### Outcome of the full turn (updated 2026-09-19 by T20, Fable 5.1)

**Models:** Fable 5.1 built the foundation (v0.1.0) and did the integration (v0.2.0); six Opus 5 workers built the seven modules in parallel under the module contract; Sonnet 5 runs T30..T32 next.

Shipped in v0.2.0 (changelogs 0002..0009), live at https://imagine-os.github.io/lead-magnet/ after the Pages workflow:
- **Plan viewer** K-01..K-04 (T10): Kanban with Select + lane buttons, list, dependency graph (phases as columns, critical path 8), task detail; only `status` / `done_at` editable (D-024..D-027).
- **Studio** S-01..S-05 (T11): prospects + create flow, adaptive intake (`nextQuestions` / `applyAnswer`), composer with archetype ranking, 30 % publish gate, 14-day publish, real-route preview, image-prompt board, outreach composer with 13 EN + ES templates (D-028..D-031).
- **Landing archetypes** L-01..L-05 (T12): Reveal / Savings Audit / Walkthrough / Letter + expired, every section kind rendered, sticky CTA, exit intent, save-your-workspace at the moment of value, full tracking; the URL archetype wins (D-032); pages open in the prospect's language (D-034).
- **The lead magnet itself** C-01..C-07 (T13): the prospect's themed OS with a view per business and life role (URL state, unique slugs), departments, unified inbox, money, life, settings (D-036..D-038).
- **Booking** B-01 / B-02 (T14): 15-minute slots in the prospect's timezone, real `bookings` rows with contact columns, `?slot=` deep links from the landing calendar honoured exactly (D-039..D-041, D-051, D-052).
- **Admin** A-01..A-05 (T15): session-counted funnel with an accessible SVG chart, prospect timeline with recorded recommendations (`recommendations` table), events log, outreach board, bookings (D-042..D-046).
- **Proposal + website** R-01, W-01..W-03 (T16): printable client proposal, our public site and pricing with engine-only numbers and a Stripe Placeholder (D-047..D-050).
- **Integration** (T20): shared slot engine, contact columns, `useActions` latest-render handlers, I18n page defaults, component fixes, 32 decisions, surfaces, screenshots for 15 key codes, the 7-width responsive matrix, version 0.2.0.

Counts: 50 routes (45 built, 5 stubs: the ops manual M-01..M-05), 10 tables, 38 rules, 37 components, 175 declared action rows, 11 engine checks, 31 tasks (15 done). Justin's three vision images are recorded in prompt 0002 as references.

Still not wired (by design, Placeholders + seams): image generation (T40), video-on-scroll (T41), booking provider (T42), LLM enricher (T43), Supabase (T44), Stripe (T51), Company OS (T50). Decisions marked `proposed` in `docs/decisions.md` are waiting for Justin.

