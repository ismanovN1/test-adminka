# Test Admin

Test Admin is a responsive commerce analytics dashboard built as a Frontend Developer test assignment. It presents one coherent read-only SaaS-style workflow across Dashboard, Users, Products, Orders, Analytics, and Settings while keeping public API data validated and deterministic.

## Requirements

- Node.js 20.9 or newer
- pnpm 10.32.1 or a compatible pnpm 10 release

## Run locally

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The public API URL already has a safe default, so `.env.local` is optional for the core experience.

Production and quality commands:

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
pnpm start
```

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_DUMMYJSON_BASE_URL` | No | DummyJSON base URL; validated HTTPS default is `https://dummyjson.com`. |
| `REST_COUNTRIES_API_KEY` | No | Reserved for optional server-only country enrichment. Core country analytics never require it. |

Never expose a private country API key through a `NEXT_PUBLIC_*` variable.

## Technology

- Next.js 15 App Router, React 19, strict TypeScript, Tailwind CSS 4
- TanStack Query for remote server state and cancellation-aware caching
- Axios plus Zod for transport and runtime payload validation
- Zustand for the narrow persisted UI-preferences schema
- React Hook Form plus Zod for the local profile form
- TanStack Table for the advanced Users workflow
- Recharts for dynamically loaded Dashboard and Analytics visualizations
- next-intl and next-themes for Russian/English and Light/Dark/System behavior
- Vitest and Testing Library for deterministic unit and interaction tests

## Routes and behavior

- `/` — six canonical KPIs, five chart stories, and indexed activity lists.
- `/users` — full-dataset search/filter/sort, pagination, selection, column visibility, details, and safe CSV export.
- `/products` — catalog search, category/price/rating filters, sorting, pagination, stock semantics, image fallback, and details.
- `/orders` — customer joins, derived demo status/date, search/filter/sort/pagination, and complete line-item details.
- `/analytics` — coordinated revenue/orders, cumulative users, sold categories, countries, and top products using Line, Area, Bar, and Pie/Donut charts.
- `/settings` — persisted theme/language/notifications, locally validated profile feedback, and confirmed preference reset.
- Unknown routes — localized branded 404 with a safe return path.

Every query-driven workflow includes a geometry-matching first-load skeleton, background refresh feedback, distinct remote/filtered empty states, normalized error copy, and retry.

## Architecture

The project uses a pragmatic Feature-Sliced dependency direction:

```text
src/
  app/       routes, providers, loading/error/not-found boundaries
  widgets/   page-scale Dashboard, Analytics, and application shell compositions
  features/  user intentions: filters, export, settings, preferences
  entities/  user, product, order, and analytics contracts/selectors
  shared/    API client, configuration, i18n, generic helpers, UI primitives
  test/      shared fixtures and test setup
messages/    complete ru/en application copy
```

Imports flow from `app` toward `shared`; domain formulas stay in entities rather than route components. App Router is the only router.

### Data flow and state ownership

DummyJSON resources are requested with `limit=0`, parsed at the Axios/Zod boundary, normalized once, and cached in TanStack Query for five minutes. The datasets are only hundreds of records, so pure local selectors apply combined search/filter/sort across the complete resource and paginate last. This makes composed filters and pre-pagination CSV export correct without unjustified virtualization.

- TanStack Query owns all remote users/products/orders.
- URL search parameters own shareable list state.
- Zustand persists only sidebar state, Users column visibility, and notification preferences.
- next-themes owns theme; the next-intl cookie owns locale.
- Ephemeral dialogs and profile form fields remain local component/form state.

## Deterministic demo semantics

DummyJSON does not provide the required user/order statuses or creation dates. The app never uses random render-time data:

- User status: IDs ending in 0–1 are inactive, 2–3 are away, and the rest are active.
- Order status: divisible by 10 → cancelled; otherwise divisible by 4 → processing; otherwise divisible by 3 → shipped; otherwise delivered.
- All demo dates use fixed UTC year 2025 and the documented ID/user-ID formulas in `docs/ai/02_TECHNICAL_SPEC.md`.
- Indexed activity sorts by descending source ID and does not claim real chronology.

Canonical commerce definitions:

- Revenue is the sum of order `discountedTotal`.
- Average rating is the arithmetic mean of all normalized product ratings.
- The low-stock KPI counts `stock <= 10`, including zero; product badges distinguish zero from low stock.
- Top products and popular categories use sold cart-line quantity, not rating or catalog count.
- Monthly selectors always emit all 12 months with zero fill.

Dashboard and Analytics consume these same selectors, so shared measures cannot drift by page.

## Internationalization, theme, and accessibility

Russian is the default locale and English is the complete secondary locale. Switching language preserves the current unprefixed route and meaningful query state. Dates, counts, and USD currency use locale-aware formatters. Theme supports Light, Dark, and System and persists through `next-themes`.

The UI includes a skip link, semantic landmarks/headings, visible focus, keyboard-operable toolbars and pagination, labeled chart regions with text summaries, labeled intentional table scrollers, focus-trapped dialogs with Escape and trigger restoration, associated form errors, reduced-motion handling, and text-backed status states.

## Testing and verification

The deterministic test suite covers DTO validation/normalization, derived statuses/dates, aggregates, zero-filled months, sold-category/product ranking, list pipelines, URL sanitation, CSV escaping/formula defense, profile validation, error retry, and critical Users/Products/Orders/Settings interactions.

Playwright is not configured in this repository. Release verification therefore uses automated unit/component checks plus recorded manual Chrome checks at 360×800, 768×1024, and 1440×900 in light and dark modes. Exact outcomes are maintained in `docs/ai/STATUS.md`.

## Public data and limitations

- Runtime data comes from [DummyJSON](https://dummyjson.com/). Public API availability, latency, and future payload changes remain external constraints; validation failures become controlled UI errors.
- The assignment referenced REST Countries, but its legacy v3 endpoint is deprecated. Core country distribution uses DummyJSON address strings. Optional current enrichment would be server-only and must fall back safely.
- The assignment also listed Posts without defining a Posts product feature. The app intentionally makes no unused Posts request.
- This is a read-only frontend demonstration: there is no authentication, database, remote CRUD, billing, realtime channel, PWA/offline cache, or real profile mutation.
- Settings and notification changes are local browser preferences. Reset does not affect remote data.

## Deployment

The application can be deployed as a standard Next.js 15 project on Vercel or another Node.js 20.9+ host. Configure the environment variables from `.env.example`, run `pnpm build`, and serve with `pnpm start`. No secret is required for the core deployment.

## Documentation

The immutable source assignment is in `docs/Тестовое задание на позицию Frontend Developer (React _ Next.js).md`. Product, technical, UI/UX, execution, decisions, QA, and final handoff records live in `docs/ai/`.
