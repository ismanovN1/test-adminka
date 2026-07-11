# AI delivery control plane

This folder converts the original frontend assignment into an implementation system that remains consistent across multiple Codex chats.

## Authority order

When instructions differ, use this order:

1. The user's latest explicit instruction.
2. The original Russian assignment in `docs/Тестовое задание на позицию Frontend Developer (React _ Next.js).md`.
3. `01_PRODUCT_SPEC.md` for clarified product behavior and scope.
4. `02_TECHNICAL_SPEC.md` for architecture and data semantics.
5. `03_UI_UX_SPEC.md` for interaction and presentation details.
6. `DECISIONS.md` for approved deviations made during implementation.
7. The current phase text and its execution prompt.

Lower-level documents may clarify ambiguity but may not cancel an explicit higher-level requirement. A new user decision must be captured in `DECISIONS.md` and the affected specs.

## Document map

| File | Purpose | Mutation policy |
|---|---|---|
| `AGENTS.md` | Global operating rules for every Codex session | Change only when workflow rules change |
| Original assignment | Employer's source requirements | Immutable |
| `00_TZ_ANALYSIS.md` | Source analysis, gaps, risk register, traceability | Stable; update only when source/scope changes |
| `01_PRODUCT_SPEC.md` | Scope, feature behavior, acceptance criteria | Frozen before Phase 1 unless the user changes scope |
| `02_TECHNICAL_SPEC.md` | Stack, architecture, API/domain contracts | Change only with a recorded decision |
| `03_UI_UX_SPEC.md` | Design direction, responsive behavior, states, a11y | Change only with a recorded decision |
| `04_EXECUTION_PLAN.md` | Ordered phases and quality gates | Check off through `STATUS.md`, not by rewriting phase scope |
| `05_CODEX_PROMPTS.md` | Copy/paste prompts for fresh chats | Stable; select the next prompt only |
| `06_QA_CHECKLIST.md` | Final functional and non-functional verification | Record results in `STATUS.md` |
| `FOYDALANISH_UZ.md` | User-facing Uzbek workflow guide | Stable; update when workflow changes |
| `STATUS.md` | Live single source of truth for progress and handoff | Update at the end of every implementation chat |
| `DECISIONS.md` | Append-only architecture/product decision log | Append only; do not rewrite history |

## Recommended operating model

Use one chat per phase from `04_EXECUTION_PLAN.md`. The same chat may continue when context is healthy, but it must still close the phase with the required quality gate and `STATUS.md` update. A fresh chat must begin with the matching prompt from `05_CODEX_PROMPTS.md`.

For a single uninterrupted Codex run, `05_CODEX_PROMPTS.md` also contains a one-session orchestrator prompt. It still treats the ten phase gates as hard checkpoints. The phased-chat model remains recommended because it gives reviewable context and cheaper repair when one gate fails.

The phases must run sequentially. This is deliberate: shell, data contracts, and primitives become stable before feature pages depend on them. Parallel review is safe; parallel edits to the same tree are not.

## How the managing user or agent controls the work

1. Open `STATUS.md` and confirm exactly one phase is marked `NEXT` or `IN PROGRESS`.
2. Start a new Codex chat with the matching prompt from `05_CODEX_PROMPTS.md`.
3. Let the implementation agent inspect and implement; do not paste a second phase into the same active task.
4. Compare its final message with the new `STATUS.md` handoff.
5. If checks passed, start the next phase. If not, rerun the same phase with the repair prompt.
6. After Phase 9, use the Phase 10 final audit prompt. Completion requires the release gate in `06_QA_CHECKLIST.md`, not merely all pages existing.

## Scope boundary

The goal is a polished, production-minded test assignment, not a production backend. The app demonstrates architecture, data-heavy UI, accessibility, error handling, and performance using public read-only data. Authentication, a database, real CRUD persistence, billing, PWA, and a full component library are outside the committed scope unless the user explicitly adds them.

## Why the original TZ needed clarification

The source assignment leaves several implementation-changing details undefined:

- DummyJSON carts have no order date or order status.
- User status is not supplied.
- “Latest” registrations/products/orders have no creation timestamps.
- Monthly revenue therefore cannot be derived literally.
- The order's customer must be joined through `cart.userId`.
- The sample project tree mixes App Router with a legacy `pages/` directory.
- It mentions the Posts API but defines no Posts feature.
- The former REST Countries v3 endpoint is deprecated; the current API may require credentials.
- Search/filter/sort ownership (remote versus local) and CSV export scope are not defined.

The specs below freeze these choices so separate chats cannot produce incompatible implementations.

## External API references checked during planning

- [DummyJSON users](https://dummyjson.com/docs/users)
- [DummyJSON products](https://dummyjson.com/docs/products)
- [DummyJSON carts](https://dummyjson.com/docs/carts)
- [DummyJSON posts](https://dummyjson.com/docs/posts)
- [REST Countries](https://restcountries.com/)

These are references, not reasons to bypass the runtime validation and fallback rules in the technical spec.
