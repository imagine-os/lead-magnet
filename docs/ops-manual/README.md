# Ops manual source (`docs/ops-manual/`)

The chapters rendered at `/#/manual` (M-01..M-05). Markdown here is the **source**; the app is the reader.

```
docs/ops-manual/
  README.md          <- this file
  en/NN-slug.md      <- English chapter
  es/NN-slug.md      <- Spanish chapter, SAME filename (R-M02)
```

## Front matter (mandatory six keys)

```yaml
---
title: How Lead Magnet works
role: everyone          # who the chapter is written for
part: I                 # I..VII, the order in the manual
version: 0.3.0          # app version this chapter was last true for
updated: 2026-09-19
summary: One sentence shown in the chapter list and the switcher.
---
```

A chapter without all six keys still renders, but M-01 flags it.

## Chapters and routes

| File | Code | Route | Part |
| --- | --- | --- | --- |
| `01-how-lead-magnet-works.md` | M-01 | `/manual` | I |
| `02-intake-and-research.md` | M-02 | `/manual/intake` | II |
| `03-compose-and-publish.md` | M-03 | `/manual/compose` | III |
| `04-outreach-and-follow-up.md` | M-04 | `/manual/outreach` | IV |
| `05-walkthrough-calls-and-the-proposal.md` | M-05 | `/manual/calls` | V |

Adding a chapter: drop `NN-slug.md` in **both** `en/` and `es/`, then add a route in `src/modules/manual/index.ts` with the next `M-NN` code and a page doc in `docs/pages/`. A chapter present in only one language is listed as a translation gap on M-01 (R-M02).

## Live-data directives (R-M01)

**A number the system owns is never typed into a chapter.** Write the directive on its own line and the reader renders it live from the running app:

| Directive | Renders |
| --- | --- |
| `{{stats}}` | routes / built / stubs / tables / rules / components / chapters |
| `{{routes:<surface>}}` | the route table for one surface (`manual`, `studio`, `admin`, `plan`, `public`, `demo`, `dev`, `docs`) |
| `{{roles}}` | roles with their permission counts |
| `{{prospects}}` | the seeded prospects with warmth, confidence, live page |
| `{{archetypes}}` | the four archetypes scored live by `pickArchetype()` with reasons |
| `{{pricebands}}` | `priceBand()` thresholds and `PRICE_MONTHLY` |
| `{{channels}}` | outreach channels with touches sent / opened / clicked |
| `{{kpi:<name>}}` | a KPI row: `funnel`, `intake`, `outreach`, `calls` |

Figures: `[screenshot: CODE — caption]` renders `docs/screenshots/CODE/1280.jpg` when it exists, and a dashed placeholder naming the missing shot when it does not.

Open questions: a blockquote beginning `> DECISION NEEDED:` (or `> DECISIÓN PENDIENTE:`) renders inline as an open-decision callout **and** is collected on M-01 under "Open decisions". That list is the manual's half of the "Awaiting Justin" lane.

## Rules

- **R-M01** — live numbers only via directives; never type a count, price or route into prose.
- **R-M02** — every `en/` chapter has an `es/` chapter with the same filename; Spanish is a faithful translation, not a stub.
