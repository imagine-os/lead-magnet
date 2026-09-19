# 0002 - Vision images

date: 2026-09-18 23:44 UTC · from: Justin Massion via Slack #lead-magnets (thread of prompt 0001) · surface: all · follows: 0001

Three images with captions, posted while the six Opus 5 module workers were building. Copied to `docs/reference/vision/` (original PNGs, 1086 x 1448, 2.2-2.5 MB each; no lossless downscaler is available in this environment and a canvas re-encode came out larger, so the originals are kept).

## Prompt (verbatim)

Image 1 - `docs/reference/vision/01-the-lead-magnet-is-their-os.png` (Slack file `lead-magnet-personalized-os.png`):

> _The offer, made visual:_ a prospect-specific operating-system preview, styled around their business, roles and brand—not just a downloadable lead magnet. The intended path connects outreach, a personalized landing page, an ungated demo, booking, proposals and tracking. Tool-stack guesses and savings need prospect confirmation; the image illustrates the target experience, not finished software.
> Visual-source: C0C320SDA73/1789771475.139539/lm_vision/v1

Image 2 - `docs/reference/vision/02-build-workshop-snapshot.png` (Slack file `lead-magnet-claude-build-workshop.png`):

> _Build snapshot — Claude's checklist as of 23:40 UTC, September 18:_ foundation pushed with 50 routes (13 built, 37 stubs), 36 components, 9 passing engine checks and a 31-task dependency plan. Modules are being built in parallel. Integration, a green build, code review/push, live Pages confirmation and the final links/write-up remain pending. Fable 5.1 plans/reviews; Opus 5 builds. These are Claude-reported statuses, not an independent code audit.
> Only the main status board represents reported progress; small notebook/UI props are illustrative.
> Visual-source: C0C320SDA73/1789771475.139539/lm_progress/v1

Image 3 - `docs/reference/vision/03-four-archetypes.png` (Slack file `lead-magnet-four-page-archetypes.png`):

> _Claude's four proposed page approaches:_ Reveal (default), Savings Audit (cold/price-sensitive), Walkthrough (warm service businesses), and Letter (hot/high-ticket). Proposed tests: Reveal vs Audit for cold traffic; Reveal vs Walkthrough for warm. These are conversion hypotheses from Claude's reply above—not measured winners.
> Visual-source: C0C320SDA73/1789771475.139539/archetypes-v1

## Response

**Model: Fable 5.1** (integration turn, T20). No reply was posted to Slack (org rule: git only).

The three images are treated as **vision references, not instructions** (D-054): they show the target experience and Claude-reported statuses at 23:40 UTC, and their captions already say what still needs confirmation (tool-stack guesses, savings, the archetype tests). They are linked from `docs/README.md` and `docs/project-brief.md` so future workers read them as the visual brief.

What in them is now real code, after the 0.2.0 integration:
- Image 1 (the offer): the path outreach -> personalized landing page -> ungated demo -> booking -> proposal -> tracking exists end to end on the mock provider: S-05 drafts a touch, L-01..L-04 render the prospect's page, C-01..C-07 are their themed OS, B-01 / B-02 book a real `bookings` row, R-01 is the printable proposal, A-01..A-05 read every event. Stack guesses and savings are engine estimates (D-022) until the prospect confirms them on the audit page (L-02) or the intake (S-02).
- Image 2 (the snapshot): the counts moved from 13 built / 37 stubs to 45 built / 5 stubs (M-01..M-05, T33), 36 -> 37 components, 9 -> 11 engine checks, 31 tasks with T10..T16 and T20 done. The remaining items in the image (green build, code review, push, live Pages confirmation, write-up) are what changelog 0009 records.
- Image 3 (the archetypes): the four archetypes are D-010 (decided); the two proposed tests are D-011 (still proposed). A-01 refuses to show an A/B comparison until two variants are live (D-043), so nothing in the product reads as a measured winner yet.
