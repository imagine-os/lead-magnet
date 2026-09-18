# Conversion playbook

_The reasoning behind the landing pages. `pickArchetype()` in `src/engine/archetype.ts` is the code version of the scoring below; rules R-C01..R-C06 in `src/rules/core.ts` bind the principles to pages. Written 2026-09-18 (prompt 0001) by Fable 5.1; expand as Justin shares real content._

## The offer
We arrive with something **already built, already styled, already custom**: an operations system themed to the prospect (their business, their palette, their city, their people), with a view for every role in their business and in their life, on phone, laptop and the TV in the back office. It **saves them money** because it replaces the tool stack they pay for today, and it is the first time one system does everything. The demo _is_ the lead magnet.

## Highest-converting principles for this offer
1. **The demo is the lead magnet, so never gate it behind a form.** Ask for name / email at the moment of value ("save your workspace"), not before. Every field before the demo costs more than it captures; we already know who they are.
2. **One primary CTA repeated, one secondary.** Primary "Open your demo" (top, after savings, in the CTA band, sticky on mobile). Secondary "Book a 15-min walkthrough" with the calendar **inline**, never a link-out to Calendly.
3. **Loss aversion with a concrete number.** Their guessed tool stack with prices crossed out and the annual savings counting up. A number they can correct beats a number they must believe.
4. **Personalization visible above the fold.** Their name, business, palette, city and their real roles, before any scroll. If the hero could be anyone's, it converts like anyone's.
5. **Proof that it is theirs.** Role views for the people in their life (partner, kids, accountant, coach) and their business (front desk, manager, groomer). "Every role of the people in their life gets their own view" is the line that surprises.
6. **Speed and motion.** Static build, scroll-driven reveal of their OS on phone / laptop / TV frames, video-on-scroll frame sequences from generated assets. Motion is the thing screenshots cannot fake.
7. **Sticky CTA bar on mobile; exit intent -> book a call.** The second chance is the calendar, not a discount.
8. **Honest urgency.** "Your workspace is live for 14 days." Real expiry (D-013 proposed), shown plainly, never a fake countdown.
9. **Track every section.** view, section_view (with seconds), scroll_depth, cta_click, demo_open, demo_role_switch, booking_started, booking_confirmed, form_submit, exit_intent, outreach_open, outreach_click. `adaptFromEvents()` turns this into recommendations.

## The four archetypes
| | A. The Reveal (default) | B. The Savings Audit | C. The Walkthrough | D. The Letter |
| --- | --- | --- | --- | --- |
| Opening line | "We already built <Business>'s operating system." | "<Business> is paying about $X a month for tools that do not talk to each other." | "This is Tuesday at <Business>, next week." | "<First name>," (a short personal note from us over their branded app) |
| Order | hero reveal on devices -> savings stack -> role views -> proof -> FAQ -> CTA band -> inline booking | money hero -> stack audit (they confirm / reject tools, counter updates) -> savings -> role views -> proof -> CTA -> booking | story hero -> walkthrough steps (scroll-driven, one scene per role, 7:10 to 21:00) -> role views -> savings -> "Make it next Tuesday" -> booking | letter -> hero reveal behind it -> CTA band -> booking |
| Best for | most cold + warm traffic | cold, price-sensitive, owner / finance minds; low confidence (it collects self-reported data as they interact) | warm, relationship / service businesses, bigger teams with many roles | hot, high-ticket warm, referrals |
| Risk | long; needs strong motion | can feel like an invoice if the guesses are wrong (so make them correctable) | needs good role copy; slow if the story drags | too little proof for cold |
| Route | `/p/:slug` (L-01) | `/p/:slug/audit` (L-02) | `/p/:slug/story` (L-03) | `/p/:slug/letter` (L-04) |

All four are composed by `composePage(prospect, archetype)` from one `Section` union (`hero_reveal, savings_stack, role_views, walkthrough_steps, stack_audit, proof, letter, faq, cta_band, booking_inline`) so sections can be reordered, A/B tested and mixed (e.g. `adaptFromEvents` may add a `letter` above the CTA band on a Reveal page that sees exit intent without a click).

## `pickArchetype` scoring
| Signal | Effect |
| --- | --- |
| warmth cold | A +3, B +4 |
| warmth warm | A +4, C +3 |
| warmth hot | D +4, A +3 |
| revenue_band `lt250k` **or** >= 7 guessed tools | B +2 |
| team_size >= 15 **or** >= 8 roles (business + life) | C +1 |
| confidence < 0.4 | B +1 (the audit collects data) |
| lang es | no change (every archetype is bilingual) |
| live signals: > 20 s average dwell on savings | B +2 |
| live signals: exit intent with no CTA click | D +1 |
| live signals: scroll depth < 30 % | D +1 (shorter page) |

Ties break in the order A, B, C, D. **Recommendation:** A as the platform default; A/B test B against it on cold traffic (D-011 proposed); switch to C for warm service businesses when the walkthrough copy is strong; D only when a human has spoken to them.

## The adaptive loop (AI methodology)
1. **Intake** (`nextQuestions`): ask the heaviest unknown field first (industry 1.0, business name .95, first name .9, team size .8, known tools .8, locations .7, roles .7 / .65, style .6, warmth .6 ...). `applyAnswer` recomputes `confidence` = weighted share of known fields.
2. **Enrich** (`Enricher`): `RuleEnricher` fills roles from the industry catalog today; the LLM enricher (T43) will read their website / socials for palette, tone, tools and people behind the same interface.
3. **Guess** (`guessStack`, `savings`): one product per category, scaled by seats and locations, confirmed tools locked, rejected removed.
4. **Compose** (`pickArchetype`, `composePage`): rank archetypes, compose the page with every copy field resolved in EN and ES, publish a `pages.model` snapshot for 14 days.
5. **Show** (L-, C-): the page and the live demo, themed via `--lp-*`.
6. **Track** (`track`): every section, CTA, role switch and booking.
7. **Adapt** (`adaptFromEvents`): recommendations (switch archetype, add section, shorten, ask more) surface in the studio composer and the admin timeline; the strategist accepts with one click, publishing variant B.

## What Justin's examples will change
Real content examples feed: the catalog copy (pains, KPIs, motifs per industry), the section templates (headline formulas), the letter voice, and the image prompts. Keep them in `docs/reference/content-examples.md` when they arrive (prompt-logged), and bump `SEED_VERSION` when the seeded pages recompose.
