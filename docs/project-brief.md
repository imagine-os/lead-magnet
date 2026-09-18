# Project brief: Lead Magnet

**Client:** Imagine (our own product; Justin Massion). **Repo:** `imagine-os/lead-magnet`. **Live:** https://imagine-os.github.io/lead-magnet/. **Kickoff:** prompt `docs/prompts/0001-lead-magnet-kickoff.md` (2026-09-18).

## What it is
A platform that generates hyper-personalized landing pages whose lead magnet is a pre-built, fully themed operations system for a specific prospect: their business, their style, their life, every role of the people around them, multi-platform. From what we know about a prospect we guess their current software stack, what they can cut and save, their departments, roles and required features; then we compose the highest-converting landing page for them, show them their OS live (demo), and push them to the next stage: open the demo or book a call. It connects to outreach (cold / warm), proposal generation and content, and tracks everything. Image generation and scroll-driven video / reveals are first-class (image generation itself is not wired: placeholders + prompts). As the AI intake learns more about the audience, the engine adapts the page.

## Scope of v0.1.0 (foundation, this turn)
Repo scaffold + Pages deploy; design tokens + prospect palette override; app shell, registry, roles, i18n, data seam; component library (36); personalization engine; hub + 9 dev tools incl. the page canvas; stubs for every planned code (50 routes, 13 built); plan seed (31 tasks); docs.

## Surfaces and codes
`L-` landing pages · `C-` prospect OS demo · `B-` booking · `S-` studio · `A-` admin / analytics / outreach · `K-` plan (PM viewer) · `W-` our website + purchase flow · `R-` client proposal · `M-` ops manual · `D-` dev tools + docs · `HUB-` hub. Full map: `/#/dev/canvas` and `docs/build-plan.md`.

## Data layer
`DataProvider` seam (`list, get, insert, update, remove, subscribe`), `MockProvider` on localStorage today; Supabase (DB + Auth) later (T44); Stripe later (T51); Company OS reference only (D-016). Nine core tables (`docs/data-model.md`).

## Reference repos (shapes, never domain content)
`imagine-os/petrock` (primary), `imagine-os/hoy`, `imagine-os/graph-gallery`, `imagine-os/claude-tag-portfolio`. Digest: `docs/reference/house-pattern.md`.

## Org rules that shape this repo
GitHub repos + Pages, git only (no PRs, no Slack posts from agents); docs same turn; model routing (Fable for judgment / architecture / shared code, Opus 5 for modules / pages, Sonnet 5 for mechanical passes); phone to 4K; inputs now / next; actions registry; components managed in-product; annotations; placeholders; surfaces.md; hub pattern; EN + ES; multiplayer-ready; Company OS at 2027+ strength but not wired.
