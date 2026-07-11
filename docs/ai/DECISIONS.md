# Decision log

This is an append-only log. New decisions receive the next number. Do not rewrite accepted history; supersede it with a new entry that links the old one.

## ADR-001 — Use sequential phase ownership

- Date: 2026-07-11
- Status: Accepted
- Context: Multiple independent chats can otherwise reinterpret requirements or overwrite shared foundations.
- Decision: Ten sequential quality-gated phases, one code-writing owner at a time, with mandatory `STATUS.md` handoff.
- Consequence: Slight process overhead; much lower architecture drift and easier review/repair.

## ADR-002 — Pragmatic Feature-Sliced architecture with App Router only

- Date: 2026-07-11
- Status: Accepted
- Context: The original example mixes App Router and `pages/` plus several overlapping common folders.
- Decision: Use `app/widgets/features/entities/shared`; create slices only when they hold real code. No legacy `pages/` directory.
- Consequence: Clear dependency direction without empty ceremony or duplicate helper folders.

## ADR-003 — Full-dataset cached queries with local combined selectors

- Date: 2026-07-11
- Status: Accepted
- Context: DummyJSON supports pagination/search/basic sort but not all required combined filters; datasets are only a few hundred records.
- Decision: Request `limit=0`, validate/map once per cache window, apply pure local search/filter/sort, then paginate. Export comes before pagination.
- Consequence: Correct combined results and analytics; not a claim of infinite-scale backend behavior. README must disclose trade-off.

## ADR-004 — Deterministic demo status and date semantics

- Date: 2026-07-11
- Status: Accepted
- Context: Required order/user statuses, monthly charts, and “latest” views are absent from source fields.
- Decision: Use the fixed formulas and 2025 UTC demo calendar in `02_TECHNICAL_SPEC.md`. Recent/indexed lists sort by ID. Never use random or current-time synthesis.
- Consequence: Stable tests/screenshots and consistent charts, with honest demo labels.

## ADR-005 — REST Countries is optional enrichment

- Date: 2026-07-11
- Status: Accepted
- Context: The assignment links REST Countries as open API, but its legacy v3 endpoint is deprecated and current access may require credentials. DummyJSON already supplies a country string.
- Decision: Core country distribution uses `user.address.country`. Optional current REST Countries enrichment is server-only behind `REST_COUNTRIES_API_KEY`; absence/failure falls back safely. Never call v3.1.
- Consequence: Zero-secret clone-and-run experience; country flags are optional rather than a runtime failure point.

## ADR-006 — Do not use Posts without a product feature

- Date: 2026-07-11
- Status: Accepted
- Context: The source names a Posts API but defines no Posts page, widget, or metric.
- Decision: Do not fetch unused posts. Add only after a user-approved requirement and recorded decision.
- Consequence: Less irrelevant traffic/code and a transparent README assumption.

## ADR-007 — Russian default with complete English secondary locale

- Date: 2026-07-11
- Status: Accepted
- Context: The assignment is Russian and explicitly requires language switching but does not name languages.
- Decision: Ship `ru` default and `en` secondary via next-intl; retain unprefixed routes unless implementation proves a recorded alternative necessary.
- Consequence: Clear acceptance target and localized formatting/copy.

## ADR-008 — Pagination instead of virtualization

- Date: 2026-07-11
- Status: Accepted
- Context: The assignment says virtualization “when necessary,” while each normalized resource is small and all lists are paginated.
- Decision: Do not add virtualization without a measured problem.
- Consequence: Lower complexity, better table accessibility, and no conflicting scroll/pagination model.

## ADR-009 — Pin the Phase 1 runtime and bridge Next 15 ESLint config

- Date: 2026-07-11
- Status: Accepted
- Context: The assignment requires Next.js 15 while current scaffolders select a newer major. Next.js 15.5 also publishes its recommended ESLint rules in the legacy shareable-config format, whereas this project uses ESLint 9 flat config.
- Decision: Pin `next` and `eslint-config-next` to patched release `15.5.20`, pair them with patched React `19.1.8`, and add `@eslint/eslintrc` as a direct development dependency solely to adapt the official Next.js rules through `FlatCompat`.
- Consequence: Installs remain on the required and patched major line, lint uses the official Next.js rules without legacy project configuration, and a future Next major upgrade should remove the bridge when its native flat config is adopted.

## ADR-010 — Quality-gated Git history per phase

- Date: 2026-07-11
- Status: Accepted
- Context: Phases 1 and 2 were completed before the workspace had Git metadata, while the assignment expects meaningful implementation history and the user explicitly authorized ongoing commits.
- Decision: Initialize Git with one documented Phase 1–2 baseline, then create one focused commit after each later phase passes its full gate and its `STATUS.md` handoff is accurate. Failed or incomplete phases are not committed as complete.
- Consequence: Reviewers get a readable phase-level history. Phases 1 and 2 cannot be reconstructed as separate historical commits and are transparently grouped in the baseline.

## New decision template

```text
## ADR-<NNN> — <title>

- Date: <YYYY-MM-DD>
- Status: Proposed | Accepted | Superseded by ADR-...
- Context: <problem and constraints>
- Decision: <one clear choice>
- Consequence: <trade-offs, affected phases/files>
```
