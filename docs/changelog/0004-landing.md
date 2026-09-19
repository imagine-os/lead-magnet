# 0004 - landing (T12) - L-01..L-05

version: 0.2.0 (shipped in the 0.2.0 integration pass; module work dated 2026-09-18)
date: 2026-09-18
prompt: 0001
intent: Build the four landing archetypes and the expired page as the product they are: pages that look like a top-tier agency made them for one business, themed to that prospect, with the conversion mechanics from `docs/reference/conversion-playbook.md` wired to real data and real events.
decision: (1) one `LandingPage` component serves L-01..L-04 and the route's archetype wins over the snapshot, recomposing only when they differ, so all four variants work for every slug (R-L01); (2) one renderer per `Section` kind behind an exhaustive switch, so a new kind in the engine fails the build instead of silently rendering nothing; (3) all motion lives inside `prefers-reduced-motion: no-preference` and every scroll-driven interaction has a button equivalent (R-L02, R-L03); (4) the hero reveal is driven by a `useScrollFrames(count)` hook that maps scroll progress to a frame index, so T41's generated frame sequences replace the CSS transform without touching the section; (5) the audit writes `stack_guesses.status` by id through the provider rather than holding local state, so one corrected list feeds the page, the studio and the analytics (R-L06); (6) the inline calendar deep-links `/book/:prospectId?slot=` instead of writing, so the booking module keeps one source of truth; (7) the expired page renders in place of the landing page rather than redirecting (R-C05).
rejected: recomputing the model on every render (the snapshot is the contract, and a page that recomputes cannot be A/B tested or replayed); a scroll-jacking pinned story (breaks keyboards, remotes and reduced motion - the story is sticky, not hijacked); `overflow: hidden` to contain the device frames (it breaks `position: sticky`; `overflow-x: clip` does not); redefining `--color-*` tokens per prospect to theme the library components (that is forking the design system - the page paints the components through `--lp-*` instead, and a `tone="prospect"` on Button / Card is requested below); a fabricated testimonial or logo wall (labelled a sample instead); gating the demo behind the email form (R-C01); a countdown timer (the real `expires_at` in days and as a date).
files: src/modules/landing/{index.ts,specs.ts,LandingPage.tsx,ExpiredPage.tsx,context.tsx,usePageModel.ts,hooks.ts,format.ts,landing.css}, src/modules/landing/sections/{index.tsx,SectionShell.tsx,HeroReveal.tsx,SavingsStack.tsx,RoleViews.tsx,WalkthroughSteps.tsx,StackAudit.tsx,Proof.tsx,Letter.tsx,Faq.tsx,CtaBand.tsx,BookingInline.tsx,MiniOs.tsx}, src/rules/landing.ts, docs/pages/L-01..L-05.md
codes: L-01 L-02 L-03 L-04 L-05 (stub -> built)

## What changed

- **Five routes replaced** at the stub paths: `/p/:slug` (L-01 reveal), `/p/:slug/audit` (L-02), `/p/:slug/story` (L-03), `/p/:slug/letter` (L-04), `/p/:slug/expired` (L-05). Public surface, no shell: each page renders its own slim top bar (business-name wordmark, `LangToggle`, primary CTA) and footer, and `prospectStyle(palette, font)` on the page root themes the whole tree through `--lp-*`.
- **A renderer for every `Section` kind** in `src/modules/landing/sections/`: `hero_reveal` (three DeviceMockups holding a live themed mini OS, revealed by scroll progress), `savings_stack` (prices struck through on arrival, count-up of the net annual saving, "N tools you can cancel"), `role_views` (a card per business and life role with its three widgets; snap carousel under 768, grid above, arrow keys / Home / End / prev / next), `walkthrough_steps` (sticky stage, progress rail, prev / next), `stack_audit` (Yes / No per tool, live counter, real writes), `proof` (prospect facts plus an honestly-labelled sample quote and logo strip), `letter` (with a voice-note Placeholder), `faq`, `cta_band` (honest urgency from `expires_at`), `booking_inline` (7-day slot grid deep-linking B-01).
- **Conversion mechanics** on every live page: sticky CTA bar on phones once the hero scrolls away; exit intent once per session (pointer leaving through the top on a fine pointer, back gesture or 45 s idle on a coarse one) offering the call; "save your workspace" (name + email) only after a demo open in this session or a long press on the sticky CTA; the honest urgency line built from the real `expires_at`.
- **Tracking** (R-C06): `view` on mount, one `section_view` per section, `scroll_depth` at 25 / 50 / 75 / 100, `cta_click` with the cta id and the section, `demo_open`, `booking_started`, `exit_intent`, and `form_submit` for both the audit answers and the save-workspace form - all with `{ page_id, prospect_id }`.
- **Theme independence**: a prospect's palette is a light surface whatever theme the app is in, so `landing.css` repaints the library controls the pages use (outline buttons, icon buttons, inputs, field labels, badges, the modal box) from `--lp-*`. No `--color-*` token is redefined per prospect (P-02); see request 1 below for the variant that would remove the block.
- **`src/rules/landing.ts`**: R-L01..R-L06. The conversion principles R-C01..R-C06 already exist in `src/rules/core.ts` and were **not** duplicated; see the proposed status change below.
- **Docs**: `docs/pages/L-01..L-05.md` rewritten from stubs to `status: built`, each with its sections, data, actions, rules, logic, real-vs-mock and responsive notes.

## New and changed contracts

- `useScrollFrames(count)` (`src/modules/landing/hooks.ts`) returns `{ ref, frame, frames, progress, reduced }` - the video-on-scroll seam for T41. Also exported: `usePrefersReducedMotion`, `useInView`, `useCountUp`, `useViewTracking`, `useExitIntent`, `useLiveActions`, `useScrollTo`.
- `usePageModel(slug, archetype)` returns `loading | missing | expired | live`, plus `isExpired(page)` and `daysLeft(expiresAt)`; `LandingCtx` (`context.tsx`) is what every section reads.
- `BookingInline.nextSevenDays(from?)` is deterministic (three slots a day at 9:30 / 13:00 / 16:30 local, starting tomorrow). **B-01 must generate the same grid**, or the slot a prospect picks here will not exist there. If the booking module has its own generator, it wins - point this hook at it in the integration pass.
- Landing pages deep-link `/book/:prospectId?slot=<ISO>`; B-01 should pre-select that slot and, if it is gone, say so rather than silently picking another.
- `useLiveActions(pageCode, map)` wraps `useActions` so handlers registered once always see the latest closure. Several sections register handlers under the page's code; each cleans up only its own ids.
- Session flags (per tab): `leadmagnet.demoOpened`, `leadmagnet.workspaceSaved`, `leadmagnet.exitintent`.

## Requests to foundation

1. **`Button` and `Card` need a prospect tone.** Landing pages currently paint them with `.lp .lp-btn-primary { background: var(--lp-primary) }` and `.lp .card { background: var(--lp-surface) }` in `landing.css`, because the components read `--color-*` and the alternative (redefining `--color-primary` on the page root) would fork the tokens per prospect. A `tone="prospect"` variant on `Button`, `Card` and `Stat` that reads `--lp-*` with a `--color-*` fallback would let the landing and demo modules drop those overrides. Same need will hit C-01 and R-01.
2. **`DeviceMockup`'s laptop base bleeds 4 % either side** (`.device-base { margin: 0 -4% }`), which overflows a full-width container; `overflow-x: clip` on the section absorbs it today. Worth containing inside the component.
3. **Page language should be able to default to `prospect.lang`.** `useI18n` initialises from `localStorage` with no "viewer has not chosen" signal, so a Spanish-first prospect (Daniel) still gets an English page until they press ES. A nullable stored value, or an `initialLang` prop on `I18nProvider`, would fix it without a landing-side hack. Proposed decision below.
4. **`docs/screenshots/L-01/*.jpg` are stale** (PageStub shots from the foundation). T31 should recapture L-01..L-05 light + dark; module workers cannot write to `docs/screenshots`.

## Proposed decisions

- **D-0xx (proposed): the archetype in the URL wins over the snapshot.** `/p/:slug/audit` renders the audit archetype even when the published page is a reveal, by recomposing from the same inputs. Keeps all four variants demoable for every prospect and makes A/B links trivial; the cost is that a recomposed variant is not the exact bytes a strategist published. Alternative rejected: only the published archetype is reachable, other paths redirect.
- **D-0xx (proposed): `R-C05` moves from `in_dev` to `implemented`.** Expired and unknown slugs now render L-05 in place. `src/rules/core.ts` is a foundation file, so this pass did not edit it.
- **D-0xx (proposed): a landing page opens in the prospect's language.** On the first visit to `/p/:slug` with no stored preference, set the language from `prospects.lang` (Daniel's page opens in Spanish); the toggle still wins forever after. Needs request 3 above.
- **D-0xx (proposed): inline slot grid = three slots a day, 9:30 / 13:00 / 16:30 local, next seven days from tomorrow.** Deliberately coarse and deterministic until a real calendar is wired (T50); B-01 must match it.

## Proposed surfaces.md rows

| Surface | Row |
| --- | --- |
| 1.1 Routes | `/p/:slug` L-01 reveal landing · public · built (landing) |
| 1.1 Routes | `/p/:slug/audit` L-02 savings audit landing · public · built (landing) |
| 1.1 Routes | `/p/:slug/story` L-03 walkthrough landing · public · built (landing) |
| 1.1 Routes | `/p/:slug/letter` L-04 letter landing · public · built (landing) |
| 1.1 Routes | `/p/:slug/expired` L-05 expired / unknown workspace · public · built (landing); also rendered in place of L-01..L-04 for an expired or unknown slug |
| 1.1 Routes | `/book/:prospectId?slot=<ISO>` - query parameter now produced by the landing pages' inline calendar (consumed by B-01) |
| 2 MCP / WebMCP (planned) | 13 landing actions: `landing.openDemo`, `landing.bookCall`, `landing.saveWorkspace`, `landing.setLang`, `landing.viewRole`, `landing.goToStep`, `landing.toggleFaq`, `landing.pickSlot`, `landing.confirmTool`, `landing.rejectTool`, `landing.requestRefresh`, `landing.seeCaseStudy` (Placeholder), `landing.playLetter` (Placeholder) |

## Kanban moves

- **T12 landing (Opus 5): doing -> done.** L-01..L-05 built, `npm run typecheck` green, all seven widths verified with no horizontal overflow and no body text under 12 px.
- **T31 screenshots**: add "recapture L-01..L-05 (the committed L-01 shots are of the old stub)".
- **T41 video-on-scroll**: unblocked - `useScrollFrames(count)` is the seam; swap the CSS transform for `frames[frame]` in `HeroReveal`.
- **T14 booking**: note the `?slot=` contract and the shared 7-day grid shape.
- **T30 Spanish fill**: the landing module ships `es` for all 60 of its strings; engine copy is already bilingual. Worth a native pass on the exit-intent and urgency lines.

## Integration notes (T20, Fable 5.1, 2026-09-19)
- **Slot contract resolved**: `BookingInline.nextSevenDays` (9:30 / 13:00 / 16:30 local) is gone. The section now renders `previewSlots(slotGrid(prospect.id, tzForProspect(prospect)))` from `src/engine/slots.ts`, three free slots per open day in the prospect's timezone, so every slot it offers exists on B-01 (engine check `slots: preview is a subset`). The proposed "three slots a day at 9:30 / 13:00 / 16:30" decision was therefore **not** adopted; D-052 records the shared generator instead.
- **Language default**: `I18nProvider` gained `useDefaultLang(lang)`; `LiveLanding` calls it with `prospect.lang`, so Daniel's page opens in Spanish until the viewer presses EN / ES (only explicit toggles persist). D-034 (proposed, product behaviour).
- `useLiveActions` is now an alias of `useActions` (which calls the latest render's handler itself).
- `R-C05` moved to `implemented` in `src/rules/core.ts`.
- Duplicate-key report: the landing routes (`/p/:slug`, `/audit`, `/story`, `/letter`) render with no React key warning for all three seeded prospects (verified in the dev build with Playwright); the duplicates were in the OS demo (see 0005).
- Requests: `Button` / `Card` / `Stat` `tone="prospect"`, `DeviceMockup` base bleed -> Backlog cards. L-01..L-04 screenshots recaptured (the L-01 stub shots were replaced).
