# proposal - R-01 client proposal view (T16)

version: 0.1.0
date: 2026-09-18
prompt: 0001
intent: Replace the R-01 stub with the client proposal view Justin asked every project bundle to ship: the full stack for one prospect - what they get, what it replaces, who gets a view, how it runs, the price and the next step - themed to the prospect and printable as a document.
decision: (1) every number on the proposal comes from the engine, never typed (R-R01, leaning on D-014 proposed bands); (2) the proposal is a document first - a print stylesheet hides chrome, breaks between sections and forces black on white (R-R02); (3) device compositions are drawn, not iframed, so the page prints and stays legible from 360 px to 4K; (4) stored `stack_guesses` win, but a prospect with none still gets a proposal from `guessStack()` on the fly; (5) Accept proposal is a `Placeholder` (e-sign, later pass) rather than a fake signature flow.
rejected: iframing the live demo into the device frames (unprintable, slow, unreadable at small sizes); a PDF export dependency (the browser's own print is the document, no new dependency and no D- row needed); hard-coding the price band copy (breaks the moment D-014 is decided); an accept flow that only toasts without being marked as a placeholder (P-09).
files: src/modules/proposal/index.ts, src/modules/proposal/specs.ts, src/modules/proposal/ProposalPage.tsx, src/modules/proposal/proposal.css, src/rules/proposal.ts, docs/pages/R-01.md
codes: R-01 (stub -> built)

## What changed
- `/proposal/:prospectId` is a real page: cover (business, prepared for, date, band, Imagine wordmark), what you get (seven OS surfaces + a phone / laptop / TV composition of their OS), what it replaces (four stats + the stack table with struck-through costs), who gets a view (every business and life role from `deriveRoleViews`), how it runs (six dependency-bound phases), price (band, why, what is included), next steps (book, accept, print, open the demo).
- Themed with `prospectStyle(prospect.style.palette, prospect.style.font)` on the page root; the module CSS only reads `--lp-*` (D-018).
- Print stylesheet (R-R02): toolbar and CTA row hidden, one section per printed page with `break-inside: avoid`, black text on white, device compositions kept as the only colour.
- Tracking: `view` on mount, `section_view` per section through an IntersectionObserver (`trackOnce`), `cta_click` for print / book / demo, all carrying `prospect_id` and the live `page_id`.
- Unknown or removed prospect renders an `EmptyState` with a way back to the hub instead of a blank page.
- Strings EN + ES (`proposal.*`): headlines, labels and CTAs are written in both; the long section bodies are English with Spanish supplied where it was safe to write - flagged for the T30 Spanish pass.
- New rules `R-R01` (engine numbers only) and `R-R02` (printable) in `src/rules/proposal.ts`.

## New and changed contracts
- Actions (`R-01`): `proposal.print` (`proposal.read`), `proposal.accept` (Placeholder), `proposal.bookCall` (`booking.create`), `proposal.openDemo` (`demo.open`). The last two are new next to the stub's two; both were controls on the page and P-05 requires an entry for each.
- No schema, seed or provider change: the page reads `prospects`, `stack_guesses` and `pages` through the existing hooks and writes only `events`.

## Requests to foundation
- `DeviceMockup` could take an optional `fit` prop (a `container-type: size` wrapper) - both this module and `website` had to add their own wrapper element inside the frame to size drawn content with container queries. Small, shared, and it would remove a div from every caller.
- `Stat` has no way to mark a value as an estimate; proposals and the website both want a "proposed / estimate" affordance that is not a separate paragraph.
- A shared `print.css` (or a `printable` flag on the shell) would help: R-01 will not be the last printable document (statements of work, ops manual chapters).

## Proposed decisions
| id | decision | source | status |
| --- | --- | --- | --- |
| D-0xx | **The client proposal is a printable document**: R-01 prints from the browser (no PDF dependency) - chrome hidden, one section per page, black text on white; any future document surface follows the same pattern. | T16 proposal module | proposed |
| D-0xx | **Proposal numbers are engine-only** (R-R01): no price, cost or saving may be typed into a proposal page; changing D-014 changes every proposal with no page edit. | T16 proposal module | proposed |
| D-014 | (existing, still proposed) the page shows the band copy and, in dev mode, states that $249 / $499 / $899 are placeholders until Justin sets pricing. | engine stack.ts | needs Justin |

## Proposed surfaces.md rows
- 1.1 Route manifest: `public` row - R-01 `/proposal/:prospectId` moves from planned to **built**; built count +1.
- 1.4 Actions: add `proposal.print`, `proposal.accept`, `proposal.bookCall`, `proposal.openDemo` (page R-01).
- 2 Planned: note that printing is the document surface today and an e-sign provider (Accept proposal) is still unwired.

## Kanban moves
- T16 (proposal half): backlog -> done - R-01 built, page doc written, rules added. Model: Opus 5.
- Screenshots for R-01 (390 / 1280, light + dark) still belong to the screenshot pass (T31).
