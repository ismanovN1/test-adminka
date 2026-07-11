# Codex prompts for sequential chats

For a fresh phase chat, copy the Controller prompt and exactly one matching phase prompt. Do not paste multiple phase prompts at once. The single-session orchestrator is the alternative when one chat owns the whole build.

## Controller prompt (optional first message in every fresh chat)

```text
You are the implementation owner for one controlled phase of this repository. Work autonomously but strictly within scope.

Before editing, read AGENTS.md and every document it requires, then inspect docs/ai/STATUS.md, git status, existing scripts, tests, and the relevant implementation. The original Russian assignment is immutable. Follow the authority order in docs/ai/README.md. Do not commit, do not discard unrelated changes, and do not start a later phase.

Mark the assigned phase IN PROGRESS in STATUS.md, implement it end to end, run its full quality gate, inspect the changed UI when relevant, review the diff, and write an honest handoff to STATUS.md. Mark COMPLETE only when all required checks pass. Your final response must state outcome, exact verification, remaining risk, and the next phase.
```

## Single-session orchestrator prompt (alternative)

Use this only when one Codex chat has enough context/time to own the entire build. It does not remove phase boundaries.

```text
Own the complete implementation described by this repository's AI control plane. Start by reading AGENTS.md and every required document, the immutable original Russian assignment, docs/ai/STATUS.md, and the working tree.

Execute Phases 1 through 10 from docs/ai/04_EXECUTION_PLAN.md strictly in order. For each phase: mark it IN PROGRESS, implement only that phase, run its complete quality gate, inspect UI behavior where required, review the diff, and update STATUS.md. Continue automatically to the next phase only when the current phase is COMPLETE. Never hide a failed check, weaken a requirement/test, change canonical formulas, or discard unrelated work. Record every durable deviation in DECISIONS.md. Do not commit unless explicitly asked.

If a phase is genuinely blocked, stop at that phase with exact reproduction, completed safe work, and a repair handoff; do not skip ahead. At Phase 10, execute every mandatory item in docs/ai/06_QA_CHECKLIST.md and finish README. Your final response must state the release outcome, exact command/browser evidence, residual risks, and where STATUS.md records the handoff.
```

## Phase 1 prompt — Bootstrap

```text
Execute Phase 1 — Bootstrap and foundations from docs/ai/04_EXECUTION_PLAN.md. Use the Controller protocol above. Establish a minimal, production-minded Next.js 15 foundation and shared primitives only; do not implement Dashboard or feature pages. Resolve setup issues rather than skipping checks. End with the Phase 1 gate and STATUS.md handoff.
```

## Phase 2 prompt — Data/domain

```text
Execute Phase 2 — API, domain models, and deterministic analytics from docs/ai/04_EXECUTION_PLAN.md. Use the Controller protocol. Treat docs/ai/02_TECHNICAL_SPEC.md formulas and DTO boundaries as immutable contracts. Build and test the shared data layer; do not put feature formulas into pages and do not build full page UIs. End with the Phase 2 gate and STATUS.md handoff.
```

## Phase 3 prompt — Shell/i18n

```text
Execute Phase 3 — App shell, navigation, responsive layout, and i18n from docs/ai/04_EXECUTION_PLAN.md. Use the Controller protocol. Build the coherent responsive shell, locale/theme behavior, route placeholders, and baseline app boundaries. Do not implement feature workflows. Verify real browser behavior at the required widths and end with the gate plus STATUS.md handoff.
```

## Phase 4 prompt — Users

```text
Execute Phase 4 — Users workflow from docs/ai/04_EXECUTION_PLAN.md. Use the Controller protocol. Implement every Users criterion in docs/ai/01_PRODUCT_SPEC.md against the canonical selectors and CSV contract. Preserve URL state semantics, accessibility, all async/empty states, and responsive behavior. Do not start Products. End with the full gate and STATUS.md handoff.
```

## Phase 5 prompt — Products

```text
Execute Phase 5 — Products workflow from docs/ai/04_EXECUTION_PLAN.md. Use the Controller protocol. Implement every Products criterion, including combined validated filters, image fallbacks, details, states, i18n, responsiveness, and tests. Reuse existing primitives without broad refactors. Do not start Orders. End with the full gate and STATUS.md handoff.
```

## Phase 6 prompt — Orders

```text
Execute Phase 6 — Orders workflow from docs/ai/04_EXECUTION_PLAN.md. Use the Controller protocol. Implement every Orders criterion using the canonical join/status/date/total rules. Exercise missing joins and empty data explicitly. Do not start Dashboard. End with the full gate and STATUS.md handoff.
```

## Phase 7 prompt — Dashboard

```text
Execute Phase 7 — Dashboard from docs/ai/04_EXECUTION_PLAN.md. Use the Controller protocol. Build the six KPI, five chart stories, and three activity groups exclusively from shared canonical selectors. Keep synthetic semantics honest, charts accessible/responsive, and multi-query errors recoverable. Do not start Analytics. End with the full gate and STATUS.md handoff.
```

## Phase 8 prompt — Analytics

```text
Execute Phase 8 — Analytics from docs/ai/04_EXECUTION_PLAN.md. Use the Controller protocol. Add deeper analysis using shared selectors and chart infrastructure, including all required chart types, zero-filled months, Top N + Other, insights, states, and responsive/a11y behavior. Confirm shared numbers agree with Dashboard. End with the full gate and STATUS.md handoff.
```

## Phase 9 prompt — Settings/resilience

```text
Execute Phase 9 — Settings and resilience from docs/ai/04_EXECUTION_PLAN.md. Use the Controller protocol. Complete theme/language/notification/profile preferences and all application-level loading, 404, error, retry, network, and accessibility behaviors. Test persistence and hydration. Do not begin release polishing beyond issues found in this phase. End with the full gate and STATUS.md handoff.
```

## Phase 10 prompt — Final audit

```text
Execute Phase 10 — Final audit, documentation, and release candidate from docs/ai/04_EXECUTION_PLAN.md. Use the Controller protocol and docs/ai/06_QA_CHECKLIST.md as a release gate. Verify the complete user journey in a real browser, run all checks, fix in-scope defects, remove debug/dead artifacts, and finish README. Do not claim unmeasured Lighthouse scores or unchecked accessibility. Set RELEASE CANDIDATE only if every mandatory gate passes, then write the final STATUS.md handoff.
```

## Repair prompt

```text
Repair the currently incomplete phase shown in docs/ai/STATUS.md. First read AGENTS.md and all required specs, then reproduce every recorded failure rather than trusting the previous explanation. Fix root causes without weakening tests, changing canonical data formulas, or expanding scope. Run the entire phase gate plus regressions, inspect the diff, and update STATUS.md honestly. Do not advance to the next phase unless the current one fully passes.
```

## Reviewer-only prompt

Use this in a separate read-only review chat when a managing agent wants independent verification without competing edits.

```text
Review the phase just marked COMPLETE in docs/ai/STATUS.md. Do not edit files. Read AGENTS.md, the original assignment, specs, phase gate, status handoff, and full working-tree diff. Check for missed requirements, conflicting data semantics, architecture boundary violations, accessibility/responsive gaps, weak or misleading tests, and false verification claims. Run read-only checks if useful. Report findings by severity with exact file/line references and say whether the phase gate is credible. If there are no findings, state what evidence you checked and residual risks.
```

## Managing-agent acceptance rule

The managing agent accepts a phase only when:

- implementation scope matches the phase;
- `STATUS.md` and actual diff agree;
- command results are reproducible;
- UI claims are backed by browser inspection where required;
- no unresolved P0/P1 review finding exists.

If rejected, use the Repair prompt on the same phase. Never ask the next phase to clean up a known blocker from the previous one.
