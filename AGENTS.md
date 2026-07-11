# Codex agent operating contract

This repository is developed as a sequence of controlled Codex sessions. Read this file before touching code.

## Mandatory reading order

1. `docs/Тестовое задание на позицию Frontend Developer (React _ Next.js).md` — original assignment; never edit it.
2. `docs/ai/00_TZ_ANALYSIS.md` — gap analysis, risk register, and requirement traceability.
3. `docs/ai/README.md` — control-plane index and authority rules.
4. `docs/ai/01_PRODUCT_SPEC.md` — frozen product scope and acceptance criteria.
5. `docs/ai/02_TECHNICAL_SPEC.md` — architecture, domain rules, and data contracts.
6. `docs/ai/03_UI_UX_SPEC.md` — visual, responsive, accessibility, and state requirements.
7. `docs/ai/STATUS.md` — current phase, known issues, and the previous session handoff.
8. The exact phase in `docs/ai/04_EXECUTION_PLAN.md` assigned by the user.

Read `docs/ai/DECISIONS.md` whenever a decision affects architecture, dependencies, data semantics, scope, or another phase.

## Non-negotiable rules

- Work only on the currently assigned phase. Do not opportunistically implement a later phase.
- Phases are sequential. Do not run two code-writing sessions against the same working tree at the same time.
- Inspect the working tree before editing. Preserve user changes and previous phase work.
- The App Router is the only router. Do not create a legacy `pages/` directory.
- Keep server state in TanStack Query. Use Zustand only for client UI/preferences state. Use URL search params for shareable list state.
- Validate external API payloads at the boundary with Zod. Never let raw remote DTOs leak into UI components.
- Never invent random data at render time. All synthetic status/date analytics must use the deterministic rules in `02_TECHNICAL_SPEC.md` and be labeled as demo-derived where relevant.
- Avoid `any`, silent catches, disabled lint rules, placeholder TODOs, dead code, and duplicated business logic.
- Do not add packages, change architecture, rename routes, or reinterpret metrics without recording the reason in `docs/ai/DECISIONS.md`.
- Do not commit unless the user explicitly asks. Never discard unrelated working-tree changes.
- A phase is not complete merely because the UI renders. Its acceptance checks and relevant automated checks must pass.

## Required end-of-session protocol

Before ending every implementation session:

1. Run the checks required by that phase.
2. Re-read the diff for scope drift, debug artifacts, secrets, accessibility regressions, and accidental edits.
3. Update `docs/ai/STATUS.md` with completed work, files changed, checks and exact outcomes, open issues, and the next phase.
4. Update `docs/ai/DECISIONS.md` only if a durable decision was made.
5. Stop if a required check fails. Record the failure honestly; never mark the phase complete.

The final chat response must match the handoff written to `STATUS.md` and include: outcome, verification, remaining risk, and the next phase/prompt.

## Escalation

If documents conflict, use the authority order in `docs/ai/README.md`. If the conflict cannot be resolved without changing an explicit assignment requirement, stop and ask the user. Do not silently choose.
