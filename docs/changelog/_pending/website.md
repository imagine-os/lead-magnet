# website - W-01..W-03 Imagine's own website (T16)

version: 0.1.0
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
