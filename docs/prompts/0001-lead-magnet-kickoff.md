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
