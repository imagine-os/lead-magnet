# Landing pass 3: forwardable role views, honest expiry everywhere, a reversible audit and 10-foot type (L-01..L-05)

version: 0.4.0
date: 2026-09-19
prompt: 0004
intent: Raise conversion on the four archetypes and the expired page by fixing the playbook principles that were still half-kept. The prospect is rarely the only decision-maker, so every role view is now a link they can forward ("Send the manager the manager's view"). The honest-expiry promise existed in one band and nowhere else, so it now sits beside every CTA as a date, never a countdown. The audit asked for corrections it would not let you take back. The proof section leaned on five invented logo marks. The FAQ never answered the objection that actually kills the deal - "cutting software we already depend on is risky". And on a wall-mounted TV the page was a desktop page slightly enlarged, because the type clamps stopped growing at 1920.
decision: (1) a shared role link is the **existing demo route** (`/#/demo/:prospectId/role/:slug`) copied verbatim, with no shortener, no redirect and no new row - a link a prospect forwards has to still resolve in a month, and a tracked redirect we have nothing to serve from would be a promise we cannot keep; (2) the copy is best-effort and the link is shown in a selected read-only field **whether or not the clipboard accepted it**, so a refused clipboard (Safari without a gesture, an insecure origin) leaves the viewer one Ctrl/Cmd+C away instead of a button that did nothing; (3) honest expiry becomes one component, `<ExpiryLine>`, used under the hero, in the CTA band, under the booking grid, in the letter and in the sticky bar, so the five places can never disagree - and a page with no `expires_at` says so rather than inventing fourteen days; (4) pressing the answer a stack row already carries returns it to `guessed`, because a correction flow you cannot correct stops people answering at all; (5) the five invented logo marks are gone, replaced by three claims the viewer can check in the next two minutes (the demo is the running product, the stack is theirs to cross out, the page really comes down on that date) - the only kind of proof we have earned; (6) the switching objections live in the module strings table rather than `composePage()`, because the engine is outside a module worker's contract - moving them in is the request to foundation below; (7) the 10-foot fix removes caps rather than adding sizes: at 1920 `.lp-h1` was pinned at 68px * --scale (76px) while its own `5.6vw` term already wanted 107px, so each band now raises the ceiling to what the page was already asking for; (8) `useSpatialNav` is wired the way HUB-01 and the OS demo wire it (root ref + `useGamepadNav`), with one override - `onBack` returns to the top of the page, because a public landing page has no level above it and the default would walk the hash up to a route that does not exist.
rejected: a share sheet via `navigator.share` (it is a phone-only API, it silently does nothing on most desktops, and it cannot show the link it did not send); a shortened or tracked share URL (nothing to serve redirects from, and a dead link is worse than an untracked one); pre-filled mailto: / WhatsApp buttons (they guess the channel and the words, and they cannot be translated honestly without knowing who the recipient is); a countdown timer next to the CTAs (the deadline is a fact about our process, and a ticking clock turns an honest one into a pressure device - playbook 8); a red "expires soon" bar (same, plus it fights the prospect's palette); a separate "reset" button per audit row (a third 44 px target per line on a phone, when pressing the active answer is the gesture people already try); keeping the sample logo strip because it was labelled (a labelled fake is still a fake, and the admin rule is explicit); deleting the sample testimonial in the same pass (it is labelled, it is one line, and removing it is Justin's call - proposed below); putting the objections in `composePage()` (outside the module contract this pass); gating `useSpatialNav` to >= 1920 so arrow keys keep scrolling a long page on a laptop (it would make the landing pages the only ones in the app that behave differently, so it is proposed as a decision instead of done quietly).
files: src/modules/landing/{LandingPage.tsx,ExpiredPage.tsx,hooks.ts,index.ts,specs.ts,share.ts,landing.css}, src/modules/landing/sections/{ExpiryLine.tsx,RoleViews.tsx,CtaBand.tsx,HeroReveal.tsx,BookingInline.tsx,Letter.tsx,SavingsStack.tsx,StackAudit.tsx,Faq.tsx,Proof.tsx}, src/rules/landing.ts, docs/pages/L-01..L-05.md
codes: L-01 L-02 L-03 L-04 L-05 (pass 3)

## What changed

- **Per-role share links (L-01, L-02, L-03).** Every role card now carries "Send the &lt;role&gt; view" beside "Try it as
  &lt;role&gt;". It copies `<assetBase()>#/demo/<prospectId>/role/<slug>` - the same deep link the card's own CTA opens -
  with the async clipboard API, and then shows the link in a focused, selected, read-only field either way: on success
  the field is the confirmation ("Copied. Paste it to your Manager"), on refusal it is the fallback ("press Ctrl / Cmd
  + C"). Tracked as `cta_click { cta: 'share_role', role, role_kind, copied }`. New action `landing.shareRole`
  (`intent: copy the link to the {role} view`, `permission: demo.open`), live on every page that renders `role_views`,
  so the voice / WebMCP surface can say "send the groomer's view". New helper `src/modules/landing/share.ts`; new rule
  R-L07.
- **Honest expiry beside every CTA (all five pages).** New `<ExpiryLine>` renders the real `pages.expires_at` as
  "Live until September 30 - 11 days left. No countdown, no pressure: that is just when we take it down." It sits
  under the hero CTAs, under the letter's CTAs, under the booking grid, and (as the existing badge line) in the CTA
  band; the phone sticky bar appends "live 11 more days" to the savings number. No timer anywhere. A row with no
  `expires_at` falls back to the composed line in the band and renders nothing in the quiet slots. L-05 now says the
  date the page actually came down ("It came down on September 8, exactly when the page said it would"). New rule
  R-L08.
- **L-05 leads with the second chance.** The booking CTA moved out of the form's button row into its own block above
  it ("The faster way back in" + "Fifteen minutes on a call and we rebuild it live with you"), it navigates through
  the same handler the live pages use (`cta_click` + `booking_started`, previously the action returned a string and
  only the `<Link>` worked), and L-05 emits a `view` event like every other page. The request form is unchanged and
  still writes a real `feedback` row.
- **The audit is reversible and says what it does (L-02).** Pressing the answer a row already carries returns it to
  `guessed` (`form_submit` with `undo: true`), the active answer's tooltip says so, unanswered rows carry an "Our
  guess" badge instead of nothing, and a line under the heading explains the mechanic before the first tap: "Tap No
  and the tool leaves your stack and the savings number drops. Tap the same answer again to undo it. Nothing is saved
  to us." The side panel adds "N lines you told us were wrong are already out of the number above." New action
  `landing.resetTool`.
- **The savings number is correctable from every archetype (L-01, L-03).** "These numbers wrong? Fix them" beside the
  savings CTA moves to `/p/:slug/audit`, where every line is correctable (playbook 3: a number they can correct beats
  a number they must believe). Hidden on L-02, where the rows are already on the page. New action
  `landing.correctStack`, tracked as `cta_click { cta: 'correct_stack' }`.
- **Proof, minus the invented logos (L-01, L-02).** The five placeholder logo marks are gone. In their place: "Three
  things you can check in the next two minutes" - open the demo and click anything (it is the running product), cross
  out any of the N tools we guessed (the number follows you, not us), this page really comes down on &lt;date&gt;. The
  sample quote stays, still labelled "Sample, not a customer", and `landing.seeCaseStudy` stays a Placeholder.
- **The objections nobody says out loud (L-01).** Four questions appended to the composed FAQ, all versions of
  "cutting software we already depend on is risky": annual contracts (the saving starts at renewal; cross out what you
  cannot cancel and the number recalculates), data in a dropped tool (you export before anything is cancelled;
  automatic import is **not built**, and we say so), something breaking (we never cancel anything - you do, one
  department at a time, and the old system is your undo button), and the team not learning another system (they learn
  one instead of six, and each person only sees their own view - send them the link above).
- **Exit intent on touch (all four live pages).** Alongside the back gesture and the 45 s idle timer, a **fast flick
  back up the page** now counts as intent: sampled on scroll, armed only past a quarter of the page, and needing two
  consecutive samples above 1400 px/s so re-reading the hero never triggers it. Still once per session, still the
  calendar and never a discount, still nothing hover-only (P-03).
- **Spatial navigation (all four live pages).** `useSpatialNav(rootRef)` + `useGamepadNav(spatial)` on the page root,
  the same wiring HUB-01 and the OS demo use: arrow keys, a TV remote d-pad and a gamepad reach every control, Enter
  activates, Back returns to the top of the page. Role cards keep their own Left / Right (they `preventDefault`, and
  the hook ignores an already-handled key), inputs keep their arrows, and an open dialog turns the hook off. New rule
  R-L09.
- **10-foot type (P-01).** New `@media (min-width: 1920px)` band and type in the 2560 / 3840 bands: the headline now
  renders 32 / 43 / 68 / **108 / 143 / 176** px at 360 / 768 / 1280 / 1920 / 2560 / 3840 instead of stopping at 76 px
  from 1920 up, and the savings `Stat` value, the running total, the lede, the facts, the expiry line and the
  checkable-proof list scale with it. Measured in a real browser at all seven widths: **no horizontal overflow at any
  width** (`documentElement.scrollWidth - clientWidth == 0`) and nothing under 12 px.
- **Two strings that were English-only.** The Modal close button now takes `closeLabel`, so both landing modals close
  in the viewer's language.

## New and changed contracts

- `src/modules/landing/share.ts` (new): `roleShareUrl(prospectId, slug)` -> absolute `#/demo/:id/role/:slug`;
  `copyText(text)` -> `Promise<boolean>`, false whenever the clipboard is unavailable or refused (never throws).
- `src/modules/landing/sections/ExpiryLine.tsx` (new): `<ExpiryLine tone="quiet" | "band" fallback?={string} />` and
  `useExpiry()` -> `{ days, date } | null`. Every expiry string on a landing page comes from here.
- `useExitIntent(onFire, enabled)` (unchanged signature): adds the coarse-pointer flick-up path.
- New actions on the landing specs: `landing.shareRole`, `landing.correctStack`, `landing.resetTool`.
- New rules: `R-L07` (role links + visible copy fallback), `R-L08` (expiry is a date, never a countdown),
  `R-L09` (driveable without a pointer).
- No engine, schema, provider or shared-component change. `npm run frames` selectors (`.demo-role select option`,
  `a[href*="/role/"]`, `.demo-main`) are untouched - they read the demo module, not the landing DOM.

## Requests to foundation

1. **A `link` (or `share`) icon in `Icon`.** The share button borrows `copy`, which is right for the gesture but not
   for the object. One path, no API change.
2. **Move the four switching objections into `composePage()`** (`src/engine/compose.ts`), as extra `faq` items for
   every archetype rather than L-01 only, so the studio can edit them per prospect and the audit / walkthrough /
   letter pages get them too. They are written and translated in `src/modules/landing/index.ts` under
   `landing.obj_*_q` / `_a`; lifting them is a copy-paste plus a `Bi` wrap.
3. **A `faq` section on the audit and walkthrough orders.** Today only `reveal` composes one, so the pages that carry
   the most price pressure answer the fewest objections.
4. **`Stat` could take the display size from a CSS custom property.** Landing overrides `.lp .stat-lg .stat-value` in
   four media bands to keep the savings number legible from ten feet; a `--stat-value-size` hook would make that one
   line instead of four.
5. **Pre-existing, not ours:** `src/modules/admin/AbReadout.tsx` does not typecheck (three errors around
   `promote_variant` not being in the recommendation union). `npm run typecheck` is clean for every landing file.

## Proposed decisions

| # | Decision | Rejected alternative |
| --- | --- | --- |
| D-103 | A forwarded role link is the plain demo deep link (`/#/demo/:id/role/:slug`), never a shortened or tracked redirect. We measure the copy (`cta_click { cta: share_role }`), not the open. | A tracked short link: we have nothing to serve redirects from (T44), and a share link that 404s in a month costs more than the attribution is worth. |
| D-104 | Expiry is stated as a date plus days remaining, in every CTA neighbourhood, and never as a countdown timer. | A live countdown (higher measured urgency, but it turns an honest deadline into a pressure device and invites a fake one the day a page has no expiry). |
| D-105 | Remove the five placeholder logo marks and replace them with three claims the viewer can verify on the page itself. | Keeping the labelled sample strip (it read as "we have customers we cannot name", which is a claim we have not earned). |
| D-106 | Keep the sample testimonial for now, still labelled "Sample, not a customer" - **Justin to confirm or cut.** | Removing it in this pass (it is the one remaining fabricated sentence on the page; we did not want to make that call unilaterally). |
| D-107 | An audit answer is a toggle: pressing the active answer returns the row to our guess. | A separate undo control per row (a third target per line on a phone). |
| D-108 | Arrow-key spatial navigation is enabled on public landing pages at every width, matching HUB-01 and the OS demo. | Enabling it only at >= 1920 (`useViewportAtLeast`), which would keep arrow keys scrolling a long marketing page on a laptop but make the landing pages the only ones in the app with a different rule. Worth a decision either way. |
| D-109 | The switching objections ship in the module strings table this pass, and move into `composePage()` next. | Waiting for the engine change (the FAQ would have kept answering none of the objections that end deals). |

## Proposed surfaces.md rows

| Surface | Id / route | Intent | Permission |
| --- | --- | --- | --- |
| Action | `landing.shareRole` | copy the link to the {role} view | `demo.open` |
| Action | `landing.correctStack` | let me correct the tools you guessed | `demo.open` |
| Action | `landing.resetTool` | undo my answer about {tool} | — |

(No new routes, no new npm scripts, no DataProvider change.)

## Kanban moves

- Landing pass 3 (L-01..L-05) -> **done**.
- New card: *Move the landing objections + a `faq` section into `composePage()` for every archetype* (engine, Fable) -> backlog.
- New card: *`link` icon in the component library* (foundation, Sonnet 5) -> backlog.
- New card (awaiting Justin): *D-106 - cut or keep the sample testimonial on the proof section* -> awaiting_justin.
- New card (awaiting Justin): *D-108 - should arrow-key spatial nav be limited to the TV bands on long public pages?* -> awaiting_justin.

## Integration note (0023)
Numbered by the pass-3 integration (Fable 5.1). Decisions recorded as D-103..D-109; D-106 (sample testimonial) and D-108 (arrow-key spatial nav on public pages at every width) are on the "Awaiting Justin" list; D-109 was carried out in the same pass: the four switching objections now live in `composePage()` as `faq` items and every archetype composes a `faq` section (audit and walkthrough before the CTA band, letter between the hero and the band), so `Faq.tsx` renders the PageModel only and the `landing.obj_*` strings are gone. Request 1 (`link` icon) done, request 4 (`--stat-value-size`) done, request 5 (AbReadout) was fixed by the admin worker before the merge. L-05 now mounts `useSpatialNav` like L-01..L-04.
