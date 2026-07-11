# Sequential execution plan

This plan uses ten narrow phases. A capable Codex session may complete consecutive phases, but it must close and verify each gate before starting the next. Never run implementation phases concurrently in the same working tree.

## Universal phase protocol

### Start

1. Read all files required by `AGENTS.md`, especially current `STATUS.md`.
2. Inspect `git status`, existing files, package scripts, and relevant tests.
3. Confirm the expected previous phase is complete. If not, repair it or stop and report the mismatch.
4. Mark the current phase `IN PROGRESS` in `STATUS.md` before material edits.

### Work

- Implement only the phase scope and its directly necessary support code.
- Keep the app runnable; use fixtures for tests, not live network calls.
- Record durable deviations in `DECISIONS.md` as they occur.
- Do not rewrite completed feature code merely for personal style.

### Close

1. Run phase checks and relevant regression checks.
2. Inspect the app at the required viewport(s) when a UI changed.
3. Review the entire diff.
4. Update `STATUS.md` using its handoff template.
5. Mark the phase `COMPLETE` only when its gate passes; set the next phase to `NEXT`.

## Phase 1 — Bootstrap and foundations

Goal: create a healthy Next.js 15 application and reusable visual foundation.

Scope:

- initialize Next.js 15.x App Router, strict TypeScript, Tailwind, `src/`, `@/*`, pnpm lockfile;
- install required/approved dependencies from the technical spec;
- add scripts for `dev`, `build`, `start`, `lint`, `typecheck`, `test`, and `test:run`; add Playwright scripts only if configured;
- configure ESLint, formatter if chosen, Vitest/Testing Library, env example, Next image hosts, base metadata;
- implement semantic light/dark CSS tokens and core primitives needed by later pages;
- implement Query provider and error normalization skeleton without feature queries;
- add a minimal home route proving providers/tokens work; do not build Dashboard yet.

Gate:

- `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, and `pnpm build` pass;
- no legacy `pages/`, no `any`, no placeholder dependency bloat;
- light and dark base page render at 360 and 1440 widths without overflow.

## Phase 2 — API, domain models, and deterministic analytics

Goal: establish the single data truth that all pages consume.

Scope:

- Axios client with timeout, abort support, base URL, and normalized errors;
- DTO Zod schemas and mapping for users, products, carts/orders;
- normalized domain types and deterministic status/date helpers;
- query-key factories and query functions/hooks for complete datasets;
- pure list pipelines and aggregate selectors defined in the technical spec;
- unit tests with local fixtures for parsing, mapping, dates/statuses, aggregation, filters, stable sort, and pagination;
- dev-only diagnostics that remain safe; no full feature UI.

Gate:

- all required data tests pass and contain boundary/empty cases;
- no page duplicates formulas or consumes raw DTOs;
- a malformed critical payload produces a normalized validation error;
- lint, typecheck, tests, and build pass.

## Phase 3 — App shell, navigation, responsive layout, and i18n

Goal: deliver the coherent product shell used by every route.

Scope:

- configure `ru` and `en` messages and locale persistence/switching;
- implement desktop sidebar/collapsed state, tablet behavior, mobile drawer, top bar, page header, skip link;
- add all six navigation destinations with correct active state and route placeholders;
- integrate Light/Dark/System without hydration mismatch;
- responsive shell at 360, 768, and 1440 widths;
- meaningful route metadata and baseline loading/error/not-found primitives;
- keyboard and screen-reader behavior for navigation/drawer.

Gate:

- all routes navigate without full reload or console error;
- locale/theme persist and switching preserves current route;
- mobile drawer traps/restores focus and closes correctly;
- no page overflow at target widths;
- lint, typecheck, tests, and build pass.

## Phase 4 — Users workflow

Goal: complete the most capable data table to commercial quality.

Scope:

- Users toolbar, URL-backed search/filter/sort/page state, active filter summary;
- TanStack Table columns, selection, column visibility persistence, pagination;
- responsive presentation and accessible user detail sheet/dialog;
- CSV export per canonical contract;
- skeleton, background refresh, remote empty, filtered empty, error/retry;
- i18n coverage and tests for query-state sanitation/CSV/critical interactions.

Gate:

- every Users acceptance criterion in product spec passes;
- combined filters operate on full dataset and pagination resets correctly;
- exported rows match filtered/sorted result before pagination;
- keyboard, 360/768/1440, light/dark spot checks pass;
- lint, typecheck, tests, and build pass.

## Phase 5 — Products workflow

Goal: deliver a polished responsive product catalog/list.

Scope:

- URL-backed search, category, validated price, rating, sort, and pagination;
- responsive list/grid/table presentation chosen consistently with UI spec;
- stock and discount semantics, optimized/fallback images;
- accessible product details sheet/dialog;
- full loading/empty/error/retry and background refresh states;
- focused selector/form/interaction tests and complete translations.

Gate:

- all Product acceptance criteria pass, including combined filters and price validation;
- no broken image/layout shift in representative items;
- 360/768/1440 and keyboard checks pass;
- lint, typecheck, tests, and build pass.

## Phase 6 — Orders workflow

Goal: make carts read as credible, transparent demo orders.

Scope:

- join carts to users once in entity mapping/composition;
- URL-backed search, status/date filters, stable sort, pagination;
- derived status/date labels and accessible order details with all line items;
- safe missing-customer behavior;
- full loading/empty/error/retry and background refresh states;
- tests for joins, derived filters, date bounds, and detail calculations.

Gate:

- all Orders acceptance criteria pass;
- order totals/status/date match canonical functions used elsewhere;
- missing joins and empty line arrays do not crash;
- 360/768/1440 and keyboard checks pass;
- lint, typecheck, tests, and build pass.

## Phase 7 — Dashboard

Goal: create a fast, high-signal overview from shared selectors.

Scope:

- six KPI cards with correct formulas and states;
- five required chart stories using reusable lazy chart primitives;
- three recent/indexed activity sections;
- coordinated loading/partial error behavior across datasets;
- chart accessibility summaries, responsive tick/legend behavior, i18n;
- tests that assert displayed aggregates from controlled fixtures.

Gate:

- every Dashboard criterion passes and values agree with entities/selectors;
- charts remain readable at 360, 768, 1440 in light/dark;
- no fabricated deltas or false “live/real-time” claims;
- lint, typecheck, tests, and build pass.

## Phase 8 — Analytics

Goal: deliver a deeper analysis page without formula or layout duplication.

Scope:

- revenue/order trend, cumulative users, popular sold categories, country distribution, top products;
- Line, Area, Bar, and Pie/Donut types across the page;
- Top N + Other, zero-filled months, locale formatting, textual insights;
- reuse chart wrappers/selectors and dynamically load heavy visual sections where beneficial;
- loading/empty/error/retry, responsive/a11y states, controlled aggregate tests.

Gate:

- Analytics and Dashboard agree for shared measures;
- every chart has accessible labeling/summary and useful empty behavior;
- no page-level business formula duplication;
- target viewport/theme checks, lint, typecheck, tests, and build pass.

## Phase 9 — Settings and resilience

Goal: complete preferences/forms and application-wide failure handling.

Scope:

- Theme, Language, Notifications, and Profile sections;
- Zustand versioned persistence only for approved preferences;
- React Hook Form + Zod profile validation and local-only success feedback;
- confirmation for reset preferences;
- polished route `loading.tsx`, `error.tsx`, root/global error where supported, 404, shared query error/retry and offline/network messaging;
- check focus management, hydration, refresh persistence, reduced motion, 200% zoom.

Gate:

- every Settings and cross-cutting state criterion passes;
- no server data or form fields leak into global state;
- simulated network/validation errors are recoverable;
- a11y-focused tests plus lint, typecheck, tests, and build pass.

## Phase 10 — Final audit, documentation, and release candidate

Goal: prove the complete assignment is review-ready.

Scope:

- execute `06_QA_CHECKLIST.md` end to end and record evidence honestly;
- run full lint/typecheck/test/build and Playwright if configured;
- run browser console/network/keyboard/responsive/light-dark review on every route;
- remove debug logs, TODOs, stale placeholders, unused files/deps, broken links, and inconsistent copy;
- audit bundle/image/chart behavior and record measured findings only;
- finish README: setup, env, scripts, tech, structure, architecture rationale, data assumptions/formulas, i18n, testing, limitations;
- ensure `.gitignore`, `.env.example`, lockfile, and license/attribution notes as appropriate;
- do not perform broad redesigns unless a release-blocking issue requires it.

Release gate:

- all mandatory checklist items pass;
- no P0/P1 defects; any P2 limitation is documented;
- clean production build, no browser console errors on happy paths;
- `STATUS.md` says `RELEASE CANDIDATE` and contains final exact command results.

## Repair phase protocol

If a phase gate fails, keep that phase `IN PROGRESS` or `BLOCKED`, record the exact failure, and start the next chat with the repair prompt in `05_CODEX_PROMPTS.md`. Do not move forward by weakening a test, deleting a requirement, or changing a formula unless the underlying spec is explicitly revised.
