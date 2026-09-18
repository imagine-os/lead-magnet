# Pending changelogs

Module workers write `docs/changelog/_pending/<module>.md` (same header keys as a numbered changelog: version, date, prompt, intent, decision, rejected, files, codes; then `## What changed`, `## New and changed contracts`, `## Requests to foundation`, `## Proposed decisions`, `## Proposed surfaces.md rows`, `## Kanban moves`).

The integrator (T20) numbers them into `docs/changelog/NNNN-<module>.md`, applies the proposed rows to `decisions.md`, `surfaces.md` and `kanban.md`, and deletes the pending file. Numbered files are append-only.
