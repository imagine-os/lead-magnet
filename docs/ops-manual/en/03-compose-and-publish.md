---
title: Compose and publish
role: strategist
part: III
version: 0.3.0
updated: 2026-09-19
summary: Choosing an archetype, previewing the real page, the 14-day rule, slugs that never move, and running variants.
---

# Compose and publish

Composing is not writing. Every copy field on every section is already resolved in English and Spanish from the profile. Your job is to pick the **shape** of the page and to check that what the engine wrote is true.

## The four archetypes

{{archetypes}}

The scores above are computed live for the seeded prospects, with the reasons the engine gives. The shapes themselves:

**The Reveal** (`/p/:slug`) — the default. Opens on "we already built it", reveals their OS on phone, laptop and TV, then the savings stack, role views, proof, FAQ, CTA band, inline booking. Best for most cold and warm traffic. Risk: it is long, so it needs the motion to carry it.

**The Savings Audit** (`/p/:slug/audit`) — opens on money: what they pay now, per tool, crossed out. The prospect confirms or rejects each tool and the counter moves. Best for cold, price-sensitive owners and for low-confidence profiles, because the page collects the research for you. Risk: if your guesses are wrong and not correctable, it reads like an invoice.

**The Walkthrough** (`/p/:slug/story`) — "this is Tuesday at your business, next week", one scene per role from 7:10 to 21:00. Best for warm relationship and service businesses with many roles. Risk: it dies if the story drags.

**The Letter** (`/p/:slug/letter`) — a short personal note over their branded app, then straight to the CTA. Best for hot, referred, high-ticket. Risk: too little proof for anyone cold. **Only use it when a human has actually spoken to them.**

The composer ranks all four and shows the reasons. Follow the ranking unless you know something the engine does not — and if you do know something it does not, that belongs in the profile, not in your head.

[screenshot: S-03 — The composer: archetype ranking, variant, live preview, publish]

## Preview the real page

The preview in the composer is not a re-render of the sections inside the studio. It is **the actual public route in a frame**, at 390 and at 1280. There is exactly one renderer for a landing page, and it is the landing page.

Check three things every time:

1. **Above the fold at 390.** Their name, their business, their palette, their city — visible before any scroll. If the hero could be anyone's, go back to the profile.
2. **The savings number.** Read it out loud as a sentence. If it is not believable for a business that size, a stack guess is wrong.
3. **The role views.** The life roles especially. If "accountant" and "partner" are not there, you missed the line that surprises people.

Then switch the language toggle and read the Spanish. Every archetype is bilingual by construction, and a Spanish-first prospect opens their page in Spanish automatically — but composed Spanish still deserves a human eye.

## Publish, and the 14-day rule

Publish stamps `published_at = now` and `expires_at = now + 14 days`.

The expiry is real. The page says how long it is live, the countdown is honest, and when it expires the page is replaced by an expired state that still offers a call. We do not use fake scarcity, because it is the one thing that, if caught, costs you the whole relationship. Fourteen days is also a true statement about us: we build these for one person at a time, and we cannot host everyone's forever.

The **slug is frozen** by the first publish. Republishing recomposes the model and keeps the URL, so a link you sent in an email never breaks. If you need a genuinely different page for the same prospect, that is a variant, not a new slug.

Expiring keeps the composed snapshot, so the page doc, the analytics and the proposal still resolve after expiry. Nothing is deleted.

## Snapshots, not live recomposition

A published page stores the composed model as a snapshot. The landing page **renders that snapshot**; it never recomputes from the profile at view time. Two consequences worth remembering:

- Editing the profile after publishing does **not** change the live page. Republish to push your edits.
- A page from last week still renders exactly as the prospect saw it, which is what makes the analytics honest.

## Variants

The variant field is a plain letter, A by default. Publish A, publish B against it, and compare in analytics. Two tests are worth running first:

- **Reveal versus Audit on cold traffic.** The hypothesis is that money opens colder doors than craft does.
- **Reveal versus Walkthrough on warm service businesses.** The hypothesis is that a day-in-the-life beats a product tour once they already know us.

Both are hypotheses. Neither has been measured yet, and nobody should present them as results.

> DECISION NEEDED: Do variants A and B split traffic on the same slug, or do they live on separate links given to separate segments? Same-slug splitting needs a server; separate links can ship today.

## Before you send the link

- Preview at 390 and 1280, in both languages.
- Savings number believable, stack guesses defensible.
- Life roles present.
- Expiry date correct and visible on the page.
- The demo opens from the page in one click, with no form in the way.
- Book a slot yourself once, to make sure the inline calendar works for this prospect's timezone.
