# 0008 - Proposal (R-01) and website (W-01..W-03), T16

Two modules, one worker (Opus 5), two local commits kept as they were made (`b8afcc2` proposal, `276f47e` website after the trailer normalisation to `Claude Opus 5` on integration).

---

# proposal - R-01 client proposal view (T16)
version: 0.2.0 (shipped in the 0.2.0 integration pass; module work dated 2026-09-18)
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

---

# website - W-01..W-03 Imagine's own website (T16)
version: 0.2.0 (shipped in the 0.2.0 integration pass; module work dated 2026-09-18)
date: 2026-09-18
prompt: 0001
intent: Replace the W-01..W-03 stubs with Imagine's public website for this offer - home, how it works, pricing + purchase flow - in our brand, at agency quality, from 360 px to a 4K TV, with the samples all opening live and the purchase flow stopping honestly where Stripe is not wired.
decision: (1) prices and savings on the site come only from the engine bands (R-W01); (2) every sample links to a real seeded page, so the public site can never show a dead example (R-W02); (3) the site carries its own chrome (nav + footer) because public pages own their chrome - no DesktopShell; (4) the hero shows one live phone (a scaled same-origin iframe of the real landing page) plus drawn previews of the same business on laptop and TV, rather than three iframes; (5) the checkout is a `Placeholder` (Stripe, T51) that still records `form_submit`, so intent is measured even though payment is not taken; (6) the "what is not wired yet" list is honest but dev-mode only.
rejected: three live iframes in the hero (three nested app boots, unreadable at device scale, slow on a phone); screenshots of the product (they go stale and contradict "nothing here is a screenshot"); a fake checkout form that collects a card (dishonest and against P-09); an accordion FAQ (hover / click to reveal adds nothing here and costs a keyboard interaction); a new marketing colour palette (P-02: one design system, tokens only).
files: src/modules/website/index.ts, src/modules/website/specs.ts, src/modules/website/SiteChrome.tsx, src/modules/website/HomePage.tsx, src/modules/website/HowPage.tsx, src/modules/website/PricingPage.tsx, src/modules/website/SamplePreview.tsx, src/modules/website/website.css, src/rules/website.ts, docs/pages/W-01.md, docs/pages/W-02.md, docs/pages/W-03.md
codes: W-01 W-02 W-03 (stubs -> built)

## What changed
- **W-01 `/site`**: hero ("An operating system, already built for you") with a sample switcher, a live `PhoneFrame` of the sample's landing page and drawn laptop / TV previews of their OS; three-step promise; savings proof averaged across the seeded systems; sample grid (page, demo, proposal per business); pricing teaser at engine prices; CTA band.
- **W-02 `/site/how`**: the six-step loop (intake, stack guess, compose, demo, book, adapt) mirroring the engine functions; an inline SVG engine diagram with the adapt -> compose loop, titled and described for screen readers; six always-open FAQ cards; a dev-mode list of the six things that are not wired yet, each with its task id.
- **W-03 `/site/pricing`**: three bands from `PRICE_MONTHLY` with the fitting band marked; a savings calculator (industry, team size, locations) that builds a synthetic prospect and runs `guessStack()` + `savings()`; the guessed stack as a table; Choose plan records `form_submit` and opens the checkout card, whose payment button is a `Placeholder` (Stripe, T51).
- `SiteChrome`: skip link, sticky nav (three pages + "See the hub" + EN/ES), footer. 44 px targets, visible focus, nothing hover-only, `prefers-reduced-motion` respected on the scroll-to-checkout.
- `SamplePreview`: a drawn, themed mini-OS for the device frames, sized with container queries so it is legible in a small laptop frame and on a 4K TV.
- Strings EN + ES (`site.*`): headlines, nav, CTAs, band names and FAQ questions in both; longer bodies are English with Spanish written where it was safe - flagged for the T30 Spanish pass.
- New rules `R-W01` (engine prices only) and `R-W02` (samples link to real pages) in `src/rules/website.ts`.

## New and changed contracts
- Actions: `site.showSample`, `site.seeSample`, `site.openDemo` (W-01); `site.startPurchase`, `site.seeSample` (W-02); `site.choosePlan`, `site.calcSavings`, `site.checkout` (W-03). `site.showSample`, `site.openDemo` and `site.calcSavings` are new next to the stubs - each is a real control on the page (P-05).
- New event usage: `form_submit` is written by the public site (band + calculator inputs) with no prospect or page id; the admin funnel (A-01) should expect `prospect_id = null` rows.
- No schema, seed or provider change. The calculator's prospect is synthetic and never stored.

## Requests to foundation
- `DeviceMockup` could take a `fit` prop that adds the `container-type: size` wrapper (the proposal module needs the same thing) and an optional `caption` slot.
- `PhoneFrame` takes a fixed `scale`; a `fit` mode (scale to the container like `ViewportFrame`) would let marketing pages use it fluidly instead of at a hand-picked scale.
- `SegmentedControl` at its default size renders 42 px tall, 2 px under the P-03 touch floor (`--h-control` minus its border?); it is the only control on the website that misses the floor and a module may not patch a component's CSS.
- A `Prose`/`Lede` text component (or type utility classes beyond `.small` / `.md`) - both website pages hand-rolled `.site-lede` sizes that other public pages will want.
- `Stat` could accept a `ReactNode` hint so a band name can carry a badge ("proposed") without a second line of copy.

## Proposed decisions
| id | decision | source | status |
| --- | --- | --- | --- |
| D-0xx | **The public website is a module like any other** (`src/modules/website`, public surface, own chrome, library components only) rather than a separate static site. | T16 website module | proposed |
| D-0xx | **Public prices come only from the engine bands** (R-W01), and dev mode labels them as proposed while D-014 is unconfirmed. | T16 website module | proposed |
| D-0xx | **Purchase intent is recorded before payment exists**: Choose plan writes a `form_submit` event with the band and the calculator inputs; the checkout button stays a marked `Placeholder` until T51. | T16 website module | proposed |
| D-014 | (existing, still proposed) $249 / $499 / $899 bands drive W-01 and W-03. | engine stack.ts | needs Justin |

## Proposed surfaces.md rows
- 1.1 Route manifest: `public` row - W-01 `/site`, W-02 `/site/how`, W-03 `/site/pricing` move from planned to **built**; built count +3.
- 1.4 Actions: add `site.showSample`, `site.seeSample`, `site.openDemo`, `site.startPurchase`, `site.choosePlan`, `site.calcSavings`, `site.checkout`.
- 1.x Tracking: note `form_submit` from W-03 with `{ step: 'choose_plan', band, industry, team, locations }` and no prospect id.
- 2 Planned: Stripe checkout (T51) is the only unwired surface reachable from the website; the checkout placeholder is where it lands.

## Kanban moves
- T16 (website half): backlog -> done - W-01, W-02, W-03 built, page docs written, rules added. Model: Opus 5.
- Screenshots for W-01..W-03 (390 / 1280, light + dark) belong to the screenshot pass (T31); the Spanish fill of the long bodies belongs to T30.

## Integration notes (T20, Fable 5.1, 2026-09-19)
- Both commits contained only their own module files and page docs; kept, trailers normalised.
- `SegmentedControl` raised to the 44 px floor (`.seg-item` 44 px, `md` = `--h-control-sm`), as the website module asked (P-03).
- Requests: `DeviceMockup` `fit` / caption, `PhoneFrame` fit mode, `Stat` estimate / ReactNode hint, `Prose` / `Lede` type component, shared `print.css` -> Backlog cards in `docs/kanban.md`.
- R-01 and W-01 screenshots captured (changelog 0009).
