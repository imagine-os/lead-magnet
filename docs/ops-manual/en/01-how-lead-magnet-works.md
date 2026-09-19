---
title: How Lead Magnet works
role: everyone
part: I
version: 0.4.0
updated: 2026-09-19
summary: The funnel end to end, who does what, and an honest list of what is real today versus what is still mock.
---

# How Lead Magnet works

Most agencies send a deck. We send a **working operations system with the prospect's name on it**. Before the first call, the prospect can open a landing page themed to their brand, click into a live demo of their own workspace, see what their current tool stack costs them per year, and book a fifteen-minute walkthrough — all without filling in a form.

The lead magnet is not a PDF. The lead magnet is the product, pre-built for one person.

## The funnel, in order

1. **Research** — a strategist creates a prospect row from whatever they have (a name, a business, a city). The intake asks for the heaviest unknown first and raises a confidence score answer by answer.
2. **Guess the stack** — the engine names the software the business almost certainly pays for, with a monthly price per tool, and what module of ours replaces it.
3. **Compose** — the engine ranks four page archetypes for this prospect and composes the page in English and Spanish at once. The strategist picks, previews at phone and laptop width, and publishes.
4. **Publish for 14 days** — the page goes live on a slug that never moves, with an honest expiry date printed on the page.
5. **Reach out** — one message on the channel that fits, pointing at that page. Opens and clicks come back into the funnel.
6. **They open it** — hero with their name, the savings number, a view for every role in their business *and their life*, and one primary call to action: open the demo.
7. **They play with the demo** — never gated. Role switching, departments, money, comms, their life view.
8. **They book** — the calendar is inline on the page, not a link out to someone else's booking tool.
9. **The walkthrough call** — fifteen minutes, their screen, their data, ending on the proposal.
10. **Adapt** — every section view, scroll depth, CTA click and role switch is tracked, and the engine turns that into a recommendation: switch archetype, shorten the page, ask more questions.

Chapters II to V are that funnel in detail. Chapter II covers steps 1 and 2, chapter III covers 3 and 4, chapter IV covers 5, 6 and 10, and chapter V covers 8 and 9.

[screenshot: HUB-01 — The hub: every surface in the product from one screen]

## Who does what

The product ships five roles. Permissions are strings, and every page asks for a permission rather than comparing role names, so adding a role never means rewriting a page.

{{roles}}

In practice: the **strategist** lives in the Studio (research, compose, publish, outreach). The **analyst** lives in Analytics (the funnel, events, bookings) and can read but not publish. The **super admin** is us, with dev mode on. The **prospect** only ever sees their landing page, their demo, the booking form and the proposal. **Guest** is the public website.

Until real authentication lands, you can become any of them: role switcher on the hub, dev mode toggle for the super admin.

## Every surface in the product

These are live routes read from the running app, not a list somebody typed:

{{stats}}

The ops manual you are reading is its own surface:

{{routes:manual}}

The strategist's surfaces:

{{routes:studio}}

## The three prospects in the demo data

Everything in this manual can be practised against seeded, fictional prospects. They are chosen to be different from each other on purpose: warmth, language, team size, and therefore archetype.

{{prospects}}

Maya is warm and English-first with a small team. Daniel is cold, Spanish-first, two locations. Priya is hot, referred, sixty-plus staff across three concepts. If a change works for all three, it works.

## What is real and what is mock

Being honest about this is a rule, not a courtesy. Anything that does not work yet is wrapped in a placeholder that says so on hover, on focus and on click — never a silent button.

**Real today:** the personalization engine (stack guesses, savings, role views, archetype scoring, page composition in both languages), all four landing archetypes, the OS demo, booking with a real slot grid, the studio end to end, analytics over real tracked events (including the A/B readout on A-01), the plan, the proposal, the docs, this manual, the actions bus with a command palette and voice control over every action, arrow-key and gamepad d-pad navigation on every shell, English/Spanish everywhere, and the design system.

**Mock today:** identity (users are demo rows, not accounts), the data store (a local mock provider in the browser, so your changes live in your browser only), image and video generation, LLM enrichment of a prospect from their website, sending outreach on a real channel, the calendar provider behind bookings, and payments.

**What changes when the backend lands:** the data provider swaps behind the same interface, so pages do not change. Every write already goes through `update(table, id, patch)` by id, and every row already carries `id` and `updated_at`, which is what makes realtime and concurrent editing possible later.

> DECISION NEEDED: Which calendar provider backs the inline booking slots when we stop mocking them? The slot grid, timezone handling and confirmation flow are built; only the provider is missing.

## The rules that never bend

- The demo is **never** behind a form.
- One primary call to action, repeated; one secondary with the calendar inline.
- The expiry date is real. We never show a fake countdown.
- A number the system owns is never typed into a chapter of this manual. It is pulled live. That is why the tables above cannot go stale.
- Every button in the product is a named action with an intent phrase, so the same vocabulary works for a mouse, a keyboard, a touch or pen surface, a remote's d-pad and a voice command, all through the same actions bus.

## Pricing bands

Our own price is derived from team size and locations, never quoted from memory:

{{pricebands}}

## Reading the funnel at a glance

{{kpi:funnel}}
