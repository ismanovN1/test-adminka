# Project status and session handoff

Last updated: 2026-07-11 17:34 +05
Lifecycle: **IMPLEMENTING**
Current owner: root managing agent
Active phase: none
Next phase: **Phase 5 — Products workflow**

## Phase board

| Phase | State | Evidence summary |
|---|---|---|
| 1. Bootstrap and foundations | COMPLETE | Automated gate passed; 360/1440 light/dark browser matrix passed |
| 2. API/domain/analytics truth | COMPLETE | Repaired review findings; Axios/Zod/domain/selectors gate passed with 62 tests |
| 3. Shell/navigation/i18n | COMPLETE | Responsive shell, persisted locale/theme/sidebar, route boundaries, 72 tests, and browser matrix passed |
| 4. Users | COMPLETE | Users table workflow, URL state, CSV contract, 79 tests, build, and browser QA passed |
| 5. Products | NEXT | Phase 4 gate complete |
| 6. Orders | PENDING | — |
| 7. Dashboard | PENDING | — |
| 8. Analytics | PENDING | — |
| 9. Settings/resilience | PENDING | — |
| 10. Final audit/release | PENDING | — |

Allowed states: `PENDING`, `NEXT`, `IN PROGRESS`, `BLOCKED`, `COMPLETE`.

## Current repository facts

- The original assignment exists and remains intentionally unchanged (SHA-256 `fec912ae940deab9832ee5749b1cf414b232cbac0e03c441bb981870aba3aa0e`).
- A Next.js `15.5.20` App Router application now uses strict TypeScript, Tailwind CSS 4, `src/`, the `@/*` alias, pnpm, and the approved dependency set.
- The root provider boundary supplies the shared TanStack Query policy and Light/Dark/System theme behavior; Phase 2 entity hooks now consume that policy through centralized full-dataset query options.
- Semantic theme tokens, Geist fonts, core UI primitives, normalized error shape, validated public environment default, Vitest, Testing Library, and official Next.js ESLint rules are configured.
- Git history is initialized. The completed Phase 1–2 state is preserved as a baseline commit; each later phase receives one focused commit only after its gate passes.
- Live planning checks observed that DummyJSON resources support complete loads through `limit=0` and currently contain only hundreds of rows; runtime code must never hardcode observed counts.
- The legacy REST Countries v3.1 call returned a deprecation response during planning. Core functionality therefore uses DummyJSON country strings with optional server-only v5 enrichment.

## Known forward risks

- Theme + i18n + Zustand persistence can create hydration mismatches if ownership is duplicated.
- Chart bundle size and small-screen label collisions require real browser checks.
- DummyJSON can change payload values/counts; Zod schemas must tolerate documented optionality without becoming meaningless `unknown` passthroughs.
- Public API availability means error and retry states are part of the primary product behavior.

## Most recent completed work

Phase 4 — Users workflow:

- replaced the `/users` placeholder with a full client workflow backed by the existing TanStack Query full-users dataset and canonical `runUserListPipeline`;
- added URL-backed Users query state for `q`, `page`, `pageSize`, `sort`, `order`, `status`, `country`, and `department`, including sanitation of invalid values and page reset on search/filter/sort/page-size changes;
- implemented a responsive TanStack Table with selection, select-current-page, clear-selection bulk bar, sortable headers with `aria-sort`, persisted column visibility, non-hideable name column, pagination, and a contained horizontal scroller with sticky identity column;
- added mobile advanced filter disclosure, active filter chips, clear-all behavior, background refresh indicator, first-load skeleton, remote empty, filtered empty, and query error/retry states;
- added accessible read-only user details dialog with deterministic demo-field note, initial focus, Tab loop, Escape close, backdrop close, and focus restoration;
- added CSV export helpers matching the canonical contract: UTF-8 BOM, stable English headers, quote/CR/LF escaping, spreadsheet formula-injection defense, local-date filename, and export from the filtered/sorted result before pagination;
- added Russian and English Users copy and status labels;
- added focused tests for Users URL query sanitation, CSV contract/filename, and critical search/dialog interactions;
- added `@vitejs/plugin-react` as a dev-only dependency to run TSX interaction tests without changing the Next.js TypeScript JSX setting; recorded as ADR-011;
- changed only Users workflow/support, localized Users messages, the existing preferences store for Users column visibility, Vitest test support, ADR/status docs, and lockfile/package metadata. Products, Orders, Dashboard, Analytics, Settings, and canonical formulas were not implemented or changed.

## Verification from most recent session

- Authoritative sequential gate `pnpm lint && pnpm typecheck && pnpm test:run && pnpm build` — PASS.
- `pnpm lint` — PASS, zero warnings/errors.
- `pnpm typecheck` — PASS, strict TypeScript emitted no errors.
- `pnpm test:run` — PASS, 16 test files and 79 tests.
- `pnpm build` — PASS on Next.js `15.5.20`; `/users` compiled at 44.9 kB route size and 200 kB first-load JS, with all seven app routes plus `/_not-found` generated.
- Browser 360×800 — PASS; `/users` loaded 208 live users, no document/body overflow, 10 paginated rows, search visible, mobile “Фильтры” trigger visible, filter disclosure opened native selects, and table overflow was contained in the labeled scroller.
- Browser 768×1024 — PASS; `/users` loaded 208 users, no document/body overflow, 10 paginated rows, and table overflow remained contained.
- Browser 1440×900 — PASS; `/users` loaded 208 users, no document/body overflow, 10 paginated rows, desktop table fit without contained overflow, export button was visible/enabled, and dark-mode rendering was intact.
- Browser URL/filter/sort — PASS; typing `Emily` debounced to `?q=Emily`, showed the active search chip, and filtered to two rows; selecting status `away` produced `?q=Emily&status=away` and one matching row; clicking the name header produced `?sort=name`, changed row order, and set `aria-sort="ascending"`.
- Browser empty state — PASS; `/users?q=definitely-no-user` showed “Ничего не найдено,” announced 0 results, and exposed “Сбросить фильтры.”
- Browser selection/columns/details — PASS; select-current-page checked 10 visible rows and showed the selected bulk bar; hiding “Телефон” removed that column while keeping “ФИО”; opening a user details dialog focused Close, Tab stayed inside the dialog, Escape closed it, and focus returned to the triggering row action.
- Browser theme/console — PASS; toggling from dark mode changed the page out of dark class with Users content intact and no overflow; browser console warnings/errors were empty for exercised Users flows.
- Browser CSV — PARTIAL PRACTICAL EVIDENCE; export button was visible and enabled, and implementation/tests verify the blob/BOM/filename/filtered-sorted contract. Chrome automation did not emit a `download` event for the blob URL, so no downloaded file was captured in browser QA.
- Scope/diff audit — PASS; no `src/pages`, source `any`, disabled lint rules, TODO/FIXME/debug/console artifacts, local storage inspection code, random/current-time synthesis beyond the approved local-date CSV filename, secrets, or later feature workflows found.
- Original assignment integrity — PASS; SHA-256 remains `fec912ae940deab9832ee5749b1cf414b232cbac0e03c441bb981870aba3aa0e`.

## Open issues/blockers

- Git history begins after Phases 1–2 were already complete, so those two phases share one documented baseline commit rather than separate historical commits.
- Route metadata titles are meaningful but static English strings; full locale-aware metadata can be considered in the release audit if required, while all visible shell and boundary copy is localized now.
- Products, Orders, Dashboard, Analytics, and Settings intentionally remain placeholder-only until their owning phases.
- Public API availability and future payload drift remain runtime risks by design; later feature phases must surface the existing normalized failures.
- CSV browser download event was not observable through Chrome automation for the blob URL; the CSV contract is covered by unit tests and the export button path is implemented, but no downloaded file artifact was captured during browser QA.

## Decisions made

- ADR-011 — Add Vite React plugin for component interaction tests.

## Required next action

Use the **Phase 5 prompt — Products** from `docs/ai/05_CODEX_PROMPTS.md`.

---

## End-of-session handoff template

Every implementation session replaces the sections from “Most recent completed work” through “Required next action” and updates the header/phase board. Keep earlier durable choices in `DECISIONS.md`; do not turn this file into an unbounded activity log.

```text
Last updated: <ISO local date/time>
Lifecycle: <IMPLEMENTING | BLOCKED | RELEASE CANDIDATE>
Current owner: <chat/agent description>
Active phase: <phase or none>
Next phase: <phase or none>

Most recent completed work:
- concrete behavior delivered
- important files/areas changed

Verification:
- exact command — PASS/FAIL (count or key output)
- browser viewport/theme/flow — PASS/FAIL
- anything not run and why

Open issues/blockers:
- severity, reproduction, likely owner

Decisions made:
- ADR id or “none”

Required next action:
- exact next phase or repair prompt
```
