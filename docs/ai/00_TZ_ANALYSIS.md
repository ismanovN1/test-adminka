# Original TZ analysis and traceability

Analyzed source: `docs/Тестовое задание на позицию Frontend Developer (React _ Next.js).md`  
Analysis date: 2026-07-11  
Outcome: **implementable after the clarifications frozen in this control plane**

## 1. Executive assessment

The assignment is a strong senior-leaning frontend exercise: it tests architecture, data-heavy interaction, charts, error handling, responsiveness, accessibility, and documentation rather than a single CRUD screen. Its breadth is larger than a typical 10–15 hour polished delivery, especially with two themes, i18n, six routes, multiple chart types, advanced tables, complete async states, tests, and performance work.

The main delivery risk is not React complexity; it is inconsistent interpretation. Several required business concepts do not exist in the proposed APIs. If different sessions invent their own dates, statuses, totals, filter ownership, or folder structure, the app can look finished while contradicting itself. This documentation therefore freezes domain formulas first and orders implementation around dependencies.

Recommended execution: use the ten sequential gates in `04_EXECUTION_PLAN.md`. One long Codex chat may execute multiple phases, but it must close each phase gate and update `STATUS.md` before continuing. Separate fresh chats are safer for context size and review.

## 2. What the source TZ defines well

- Clear mandatory technology stack.
- Concrete route/feature inventory.
- Specific table columns and interactions for Users.
- Specific product and order presentation requirements.
- Explicit loading, empty, error, retry, 404/500, and Error Boundary expectations.
- Explicit responsive, performance, accessibility, code quality, Git, and README evaluation areas.
- Freedom to choose a scalable architecture and add relevant public APIs/libraries.

## 3. Gaps and frozen resolutions

| Source ambiguity/gap | Why it matters | Frozen resolution | Canonical location |
|---|---|---|---|
| Carts have no dates | Monthly revenue and latest orders cannot be literal | Fixed 2025 deterministic UTC date formula | Technical spec §5 |
| Carts have no status | Orders filtering/status chart undefined | Deterministic four-status formula | Technical spec §5 |
| Users have no status | Required Users column/filter undefined | Deterministic active/away/inactive formula | Technical spec §5 |
| Users/products have no created timestamp | “Latest” can vary by agent | Sort by descending source ID; call it indexed/demo data | Product spec §3 |
| Cart has only `userId` | Customer UI can trigger N+1 or inconsistent joins | Load full users once; normalized join; nullable customer | Technical spec §5 |
| Revenue can mean gross or discounted | KPIs can disagree | Sum order `discountedTotal` everywhere | Product/technical specs |
| Popular can mean rating/catalog count/sales | Charts can disagree | Product/category popularity uses sold quantity from cart lines | Technical spec §5 |
| Low stock threshold unspecified | KPI count can drift | `stock <= 10`; product badge distinguishes zero | Technical spec §5 |
| API filters cannot compose all UI requirements | Server/client behavior and CSV can be wrong | Full cached dataset, local pure pipeline, paginate last | Technical spec §4/6 |
| CSV export scope unspecified | Visible page versus full result differs | Filtered + sorted result before pagination | Product/technical specs |
| REST Countries legacy endpoint deprecated | Clone-and-run may require a secret or fail | DummyJSON country is core; optional server-only current enrichment | Technical spec §4, ADR-005 |
| Posts API has no product feature | Forced usage creates irrelevant UI/network | Do not use until a feature is approved | Technical spec §4, ADR-006 |
| Example structure mixes `app` and `pages` | Architecture may duplicate routing | App Router only; pragmatic FSD | Technical spec §2 |
| Theme/language choices unspecified | Separate chats choose incompatible libraries/locales | Light/Dark/System; Russian + English | Product spec §8, ADR-007 |
| Virtualization phrased as optional | Pagination + virtualization may be overbuilt | Paginate; virtualize only after measurement | ADR-008 |
| Settings profile persistence unclear | Fake backend behavior can mislead | Local-only validated save with clear toast | Product spec §8 |

## 4. Scope priority

### Must ship

- Next.js 15 App Router and all mandatory libraries used for their proper responsibilities.
- Dashboard, Users, Products, Orders, Analytics, Settings, 404/error handling.
- Every original list operation and chart family.
- Light/Dark/System, Russian/English.
- Loading/empty/error/retry on all query-driven screens.
- Desktop/tablet/mobile usability and keyboard/accessibility baseline.
- Clean build, strict types, targeted tests, README, `.gitignore`, coherent structure.

### Should ship

- TanStack Table, next-intl, Recharts, focused browser smoke tests.
- Dynamic chart loading, image optimization, background refresh, polished detail sheets.
- Persisted UI preferences and complete CSV safety.

### Could ship only after release gate

- Extra chart toggles/date ranges beyond specified demo year.
- Optional REST Countries metadata/flags when a valid key exists.
- Framer Motion micro-interactions backed by reduced-motion behavior.
- PWA or virtualization after measurement.

### Must not be added without scope approval

- Authentication, real CRUD/database, billing, Posts page, maps, live notifications, WebSocket/realtime simulation, extra admin modules.

## 5. Requirement-to-phase traceability

| Requirement group | Owning phase | Regression owners |
|---|---:|---|
| Toolchain, strict TypeScript, Tailwind, providers, primitives | 1 | 3–10 |
| Axios, Query, Zod DTOs, normalized entities, formulas | 2 | 4–10 |
| FSD/App Router architecture | 1–3 | 10 |
| Responsive shell, navigation, theme baseline, i18n | 3 | 4–10 |
| Users advanced table and CSV | 4 | 10 |
| Products filters/list/details | 5 | 10 |
| Orders joins/status/date/details | 6 | 7–10 |
| Dashboard KPIs/charts/activity | 7 | 8, 10 |
| Analytics chart types/insights | 8 | 10 |
| Settings forms/preferences | 9 | 10 |
| Loading/empty/query error states | 2 + each feature | 9–10 |
| 404/route/global boundaries | 3, 9 | 10 |
| Accessibility/responsiveness | Every UI phase | 10 |
| Lazy loading/images/memoization evidence | 5, 7, 8 | 10 |
| README/Git hygiene/final audit | 10 | — |

## 6. Risk register

| Risk | Likelihood | Impact | Prevention/evidence |
|---|---:|---:|---|
| Agents use different metric formulas | High | High | Canonical selectors + unit tests in Phase 2 |
| Scaffolder installs Next major newer than 15 | High | High | Pin 15.x and verify lockfile/build in Phase 1 |
| Public API changes/outage | Medium | High | Zod boundary, normalized errors, retry, fixture tests |
| Theme/locale/store hydration mismatch | Medium | High | Single ownership, hydration-safe store, browser reload checks |
| Table URL/local state loops | Medium | Medium | Sanitized query schema, reset-page rules, interaction tests |
| Chart labels fail on mobile/dark | High | Medium | fixed viewport/theme matrix and accessible summaries |
| Bundle grows from charts/UI packages | Medium | Medium | small primitive layer, dynamic chart boundaries, final inspection |
| “Demo” values presented as factual trends | Medium | High | content rules, fixed formulas, no fabricated deltas/causality |
| Ten phases create process overhead | Medium | Low | same chat may continue after a clean gate; status remains mandatory |

## 7. Time/scope judgment

A hand-built polished implementation of every baseline criterion is likely beyond the source's 10–15 hour recommendation for one human, particularly with full two-locale copy, robust chart accessibility, browser tests, and exhaustive responsive QA. The AI workflow keeps the full target but protects quality through gates. If a hard time limit is later imposed, reduce only optional enhancements in the “Could ship” list; do not drop original mandatory functionality, deterministic correctness, accessibility fundamentals, or release checks silently.

## 8. Acceptance principle

The project is judged by demonstrable behavior and consistent data, not by file count. A phase may have elegant code and still fail if its state handling, mobile layout, keyboard path, or metric semantics are unverified. `06_QA_CHECKLIST.md` is therefore the final definition of evidence.
