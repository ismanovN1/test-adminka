# Release QA checklist

Record evidence and failures in `STATUS.md`. A checked box requires actual verification; code inspection alone is not a substitute for browser behavior.

## A. Repository and build — mandatory

- [ ] `pnpm install --frozen-lockfile` succeeds in a clean environment.
- [ ] `pnpm lint` succeeds with no ignored new violations.
- [ ] `pnpm typecheck` succeeds.
- [ ] `pnpm test:run` succeeds and reports the actual test count.
- [ ] `pnpm build` succeeds.
- [ ] Playwright/smoke tests succeed if configured; otherwise the manual replacement is recorded.
- [ ] No secrets, `.env.local`, build output, debug dumps, or accidental large files are tracked.
- [ ] No `console.log`, `debugger`, stale TODO/FIXME, dead placeholder route, or unused dependency remains.

## B. Data correctness — mandatory

- [ ] KPI totals use complete datasets, not the first API page.
- [ ] Revenue uses `discountedTotal`; formatting does not change calculation precision.
- [ ] Average rating and low-stock definitions match the technical spec.
- [ ] User/order status and demo dates match deterministic formulas.
- [ ] Monthly charts emit all 12 ordered months with zero fill.
- [ ] Top products/categories use sold quantity from order lines.
- [ ] Customer joins are correct and missing customers are safe.
- [ ] Dashboard and Analytics show the same shared metrics for the same data.
- [ ] A malformed API payload becomes a controlled validation error.
- [ ] No random or wall-clock-derived demo data changes between reloads.

## C. Routes and functionality — mandatory

- [ ] `/` has six KPIs, required charts, and three activity groups.
- [ ] `/users` search/filter/sort/paginate/select/columns/details/export all work in combination.
- [ ] Users CSV contains the filtered/sorted pre-pagination result and safely escapes cells.
- [ ] `/products` combined search/category/price/rating/sort/pagination and details work.
- [ ] `/orders` search/status/date/sort/pagination/details work, including product line lists.
- [ ] `/analytics` contains the required measures and Line/Area/Bar/Pie-or-Donut coverage.
- [ ] `/settings` theme/language/notifications/profile/reset work and persist as specified.
- [ ] Unknown route renders the branded 404 and returns safely.
- [ ] Retry recovers after a simulated retryable query failure.
- [ ] Direct reload on every route works.
- [ ] Browser Back/Forward restores meaningful URL-backed list state.

## D. Async and edge states — mandatory

- [ ] First load shows layout-matching skeletons.
- [ ] Background refresh preserves data and communicates progress subtly.
- [ ] Genuine empty data and filtered zero-results have different useful states.
- [ ] Network, timeout, HTTP, validation, and unknown failures have safe copy.
- [ ] Partial user/order data and failed images do not crash or break layout.
- [ ] No hydration warnings, unhandled rejections, infinite retries, or error reset loops.

## E. Responsive and visual — mandatory

- [ ] Every route checked at 360×800, 768×1024, and 1440×900.
- [ ] Every route spot-checked in Light and Dark; full matrix for Dashboard, a table route, and Settings.
- [ ] No page-level horizontal overflow at 360; intentional table scrolling is contained.
- [ ] Navigation modes, filter sheets, dialogs, tooltips, and charts fit their viewport.
- [ ] Text, values, axes, badges, and controls do not clip or overlap.
- [ ] Images keep stable geometry and show a fallback when broken.
- [ ] Empty/loading/error layouts do not cause severe layout shift.

## F. Accessibility — mandatory

- [ ] Skip link works and one logical `h1` exists on each page.
- [ ] All interactive flows can be completed with keyboard only.
- [ ] Focus is visible in both themes and never hidden behind overlays.
- [ ] Drawer/dialog/sheet traps focus, closes with Escape, and restores focus.
- [ ] Icon buttons, checkboxes, inputs, charts, and pagination have accessible names.
- [ ] Sort state, selected rows, validation errors, and async feedback are announced appropriately.
- [ ] Color is not the only status signal and normal text/UI contrast meets WCAG AA.
- [ ] At 200% zoom, functionality and reading order remain usable.
- [ ] Reduced-motion preference removes non-essential motion.
- [ ] Automated accessibility scan is clean if configured; manual limitations are recorded.

## G. Performance and quality — mandatory unless tooling unavailable

- [ ] Recharts and non-critical heavy UI are not needlessly included in every route's initial client bundle.
- [ ] Product/user images use optimized sizing/lazy behavior without layout shift.
- [ ] Search is debounced and stale requests are cancelled.
- [ ] Server data exists only in Query cache, not duplicated in Zustand.
- [ ] Derived selectors do not rerun pathologically on ordinary renders.
- [ ] No unjustified virtualization or premature memoization complexity.
- [ ] Browser console has no happy-path errors or warnings.
- [ ] Network panel shows no obvious request waterfall/duplicate query bug.
- [ ] Any Lighthouse/bundle measurements reported are actual measurements with environment noted.

## H. Documentation and handoff — mandatory

- [ ] README includes prerequisites, install/run/build/test commands, env variables, and deployment notes.
- [ ] README explains stack, directory structure, data flow, architecture rationale, and state ownership.
- [ ] README discloses synthetic status/date rules, REST Countries fallback, Posts non-use, and public API limitations.
- [ ] README documents language/theme behavior, testing scope, and known limitations.
- [ ] `.env.example`, `.gitignore`, lockfile, and package scripts are accurate.
- [ ] `STATUS.md` final handoff matches reproducible state and lists any remaining P2 issue.
- [ ] `DECISIONS.md` contains every material deviation from the frozen specs.

## Severity policy

- **P0:** data loss/security exposure/app cannot run — release blocked.
- **P1:** required feature missing, wrong canonical metric, route crash, major a11y/responsive failure — release blocked.
- **P2:** localized defect with workaround or moderate polish issue — fix if feasible; otherwise document.
- **P3:** minor cosmetic or optional enhancement — may be documented without blocking.
