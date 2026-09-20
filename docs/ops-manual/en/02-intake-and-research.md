---
title: Intake and research
role: strategist
part: II
version: 0.5.0
updated: 2026-09-20
summary: Creating a prospect, running the adaptive intake, raising confidence, and confirming the tool stack before you compose anything.
---

# Intake and research

The page writes itself from the profile. So the profile is the work.

A weak profile produces a page that could be anyone's, and a page that could be anyone's converts like anyone's. Twenty minutes of research is the difference between "we already built your operating system" and a template with a logo dropped in.

## Create the prospect

Studio home lists every prospect with warmth, confidence, live page, last event and booking state. "New prospect" needs almost nothing: a first name, a business name, a city and an industry. On save the system immediately does three things for you:

1. Pulls the **roles** for that industry out of the catalog (a dental practice gets owner dentist, office manager, front office, hygienist, billing; a restaurant group gets GM, chef, shift lead, host, events).
2. Runs **`guessStack()`** and writes a stack guess row per category with a monthly price.
3. Lands you on the profile, where the intake is already asking its first question.

Pick the industry carefully. It is the single heaviest field, and it seeds the roles, the pains, the KPIs and the imagery motifs that every downstream section reads. When the catalog gives that industry a sub-industry with its own depth — a dog hotel under pet care, a tenant-law firm under law firms, a wellness club under gyms — the sub-industry takes over that seeding: its departments, KPIs, pains, roles and capacity meter are what the demo, the role views and the hero show, and its tools are guessed first (a dog hotel is asked about PetLinx and Squarespace; a nine-person daycare is not). The three seeded examples are Fetch & Stay Dog Hotel, Renters' Shield Law and Raíz Wellness Club; open any of them in the demo to see the difference the sub-industry makes.

[screenshot: S-02 — The prospect profile: confidence meter, intake, stack, roles, style]

## The adaptive intake

The intake is not a form. It is a loop that asks the **heaviest unknown field first** and recomputes confidence after every answer. You can answer in any order, leave and come back, and answer the same field again later with something better.

Field weights, highest first: industry, business name, first name, sub-industry (when the catalog has one for this industry), team size, known tools, locations, business roles, life roles, style, warmth. Confidence is the weighted share of what we know, from 0 to 1. Sub-industry only asks when the industry actually branches (a dental practice, not a car wash), and for prospects where it does not apply it drops out of the denominator entirely, so their confidence bar is never held back by a question that was never theirs to answer.

Three habits make this fast:

- **Answer from evidence, not assumption.** Their website's careers page names their software more often than their homepage does. A job post that says "Dentrix experience required" is worth more than a guess.
- **Life roles are the surprise.** Business roles are obvious. The line that makes owners sit up is a view for their partner, their kids, their accountant, their coach. Ask who else touches this business, and write it down.
- **Style is research, not taste.** Take the palette off their real signage, their van, their Instagram grid. Five colours: primary, accent, background, surface, text. Get the primary right and the page looks like them at a glance.

### The confidence gate

Publishing is blocked below **30 % confidence** unless you explicitly turn the override on, and turning it on is recorded. This is not bureaucracy — a page composed from three known fields is worse than no page, because it burns the one chance you get with that prospect.

Where you usually are:

- **Under 30 %** — you have a name and a city. Keep researching.
- **30–60 %** — publishable for a cold audit page, where the prospect corrects your guesses for you and the page still works if some are wrong.
- **Over 60 %** — publishable for any archetype, including the reveal and the personal letter.

The intake is also the honest place to say what we do not know. "Enrich with AI" — reading their website and socials for palette, tone, tools and people — is designed and visible but **not wired**. It is a placeholder that says so. The rule-based enricher that fills roles from the industry catalog is real and runs today.

## Confirming the stack

Below the intake, the guessed stack is a list of tools with monthly prices and a confidence per row. Each row has three states:

- **guessed** — our estimate, priced by seats and locations.
- **confirmed** — you have evidence they pay for it. The row locks and the price becomes theirs, not ours.
- **rejected** — they do not use it. The row leaves the savings maths entirely.

The savings totals update live as you confirm and reject. This matters for one reason: on the audit archetype the prospect sees these numbers and can correct them, and **a number they can correct beats a number they must believe**. A wrong guess left in the list makes the whole page feel like an invoice from a stranger. A guess they correct makes the page feel like a conversation.

Confirm what you can prove, reject what they told you, and leave the honest guesses as guesses.

## What you are aiming for before you compose

- Industry, business name, first name, city — certain.
- Team size and locations — right to within a person or two, because they drive the price band and the role views.
- At least two tools confirmed or rejected.
- Business roles and life roles listed in the words they would use.
- A palette taken from something real.
- Warmth set honestly: cold if nobody has spoken to them, warm if they know us, hot if a human has already had a conversation.

Warmth decides the archetype more than anything else, so do not round it up out of optimism.

{{kpi:intake}}

> DECISION NEEDED: How much of the LLM enrichment should run automatically on prospect creation versus only when the strategist asks? Automatic is faster; on-demand keeps the research honest and the costs predictable.
