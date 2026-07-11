# Technical specification

Status: **FROZEN BASELINE**

## 1. Required stack and approved additions

Core:

- Next.js 15.x, App Router, React, TypeScript strict mode
- Tailwind CSS
- TanStack Query and Axios
- Zustand
- React Hook Form and Zod

Approved supporting libraries:

- Recharts for charts
- TanStack Table for the Users and Orders table state
- next-intl for `ru`/`en`
- next-themes for Light/Dark/System behavior
- Lucide React for icons
- `clsx` + `tailwind-merge` for class composition
- Sonner or one equivalent accessible toast layer
- Vitest + Testing Library for focused unit/component tests
- Playwright for critical smoke flows if the environment allows browser installation

Do not install a broad UI framework. Build a small app-specific primitive layer. New dependencies require an ADR entry.

Use one package manager and its lockfile; default is `pnpm`. Target Node.js 20.9+ and record the actual engine in `package.json`/README.

## 2. Directory architecture

Use a pragmatic Feature-Sliced layout without empty ceremonial layers:

```text
src/
  app/                 # routes, layouts, providers, error/not-found boundaries
  widgets/             # page-scale composed sections: sidebar, topbar, KPI grid, chart panels
  features/            # user intentions: filters, export, theme/language/profile settings
  entities/
    user/               # User model, schemas, queries, selectors, entity UI
    product/
    order/
  shared/
    api/                # Axios clients and transport helpers
    config/             # env and constants
    i18n/               # routing/messages/format helpers
    lib/                # generic pure helpers
    ui/                 # reusable primitives and state components
  test/                 # global test setup/factories where shared
messages/
  ru.json
  en.json
```

Rules:

- Imports flow `app -> widgets -> features -> entities -> shared`; lower layers never import higher layers.
- Public barrels are allowed at slice boundaries, not as giant repository-wide barrels.
- Domain-specific logic belongs with its entity, never in `shared`.
- Route files compose and orchestrate; they do not contain data formulas or large markup trees.
- Use `@/*` alias to `src/*`.
- Add `'use client'` only at the smallest interactive boundary.
- Do not create `src/pages`, root `components`, root `services`, or root `utils` duplicates.

## 3. Rendering and server-state strategy

- Use App Router server pages/layouts for route composition and metadata.
- Use a single client Query Provider. Prefer server prefetch + `HydrationBoundary` for primary page datasets when it remains simple; otherwise document why a route begins with a client query skeleton.
- Query keys come from centralized factories per entity and include all request inputs.
- Default query policy: `staleTime` 5 minutes, `gcTime` 30 minutes, one retry for ordinary failures, no retry for 4xx, exponential delay capped at 3 seconds.
- Preserve previous data during pagination/filter transitions where applicable and expose a background refreshing state.
- Cancel obsolete search requests with `AbortSignal` forwarded through Axios.
- Remote server data never enters Zustand.

## 4. API strategy

### Base endpoints

```text
NEXT_PUBLIC_DUMMYJSON_BASE_URL=https://dummyjson.com
REST_COUNTRIES_API_KEY=optional, server-only
```

`NEXT_PUBLIC_DUMMYJSON_BASE_URL` must have a validated safe default. Never expose `REST_COUNTRIES_API_KEY` to the client.

### Dataset ownership

DummyJSON currently supports `limit`, `skip`, search, and basic sort, but does not support every required combined filter. The committed strategy is:

1. Load each required full resource with `limit=0` once per query cache window.
2. Parse it with a strict-enough Zod DTO schema that tolerates documented optional fields.
3. Map to normalized domain models.
4. Apply combined search/filter/sort selectors locally over the complete normalized set.
5. Paginate the derived result last.

This makes filters and CSV export correct across the whole dataset. The dataset is only a few hundred records, so virtualization is not justified. Document this trade-off in README. Selectors must be pure and tested; expensive aggregate selectors may be memoized.

### REST Countries decision

The linked legacy public v3 endpoint is deprecated. Core app behavior must not require a new API key:

- country names and distribution come from `user.address.country` in DummyJSON;
- optional country enrichment may run only through a server-side adapter when `REST_COUNTRIES_API_KEY` exists;
- failure or absence of that key must silently fall back to the DummyJSON country name (while unexpected development errors may be logged);
- no country flag is required for acceptance;
- do not call the legacy `/v3.1` endpoint.

### Posts decision

There is no Posts route or posts requirement in the original app structure. Do not fetch Posts merely to claim API usage. Posts remain an explicit non-goal unless the user adds a product requirement.

### Error normalization

Map Axios/Zod failures into a serializable `AppError` shape:

```ts
type AppErrorKind = 'network' | 'timeout' | 'http' | 'validation' | 'unknown';

interface AppError {
  kind: AppErrorKind;
  message: string;
  status?: number;
  retryable: boolean;
}
```

UI copy must not expose raw stack traces or transport internals.

## 5. Domain contracts and canonical formulas

Money is stored as numeric USD from the source and formatted only at the UI boundary. Aggregates avoid premature rounding; round to two decimals for display/export. IDs remain numbers in domain models and strings only in labels such as `#ORD-0042`.

### User

```ts
type UserStatus = 'active' | 'away' | 'inactive';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  image: string;
  role: string;
  companyName: string;
  department: string;
  country: string;
  status: UserStatus;
  indexedAt: string; // deterministic demo ISO date
}
```

Canonical derived status:

```text
id % 10 in {0, 1} -> inactive
id % 10 in {2, 3} -> away
otherwise          -> active
```

### Product

Keep at least: `id`, `title`, `description`, `category`, optional `brand`, `price`, `discountPercentage`, `rating`, `stock`, `thumbnail`, `images`.

Definitions:

```text
out of stock = stock === 0
low stock    = stock > 0 && stock <= 10
discounted unit price = price * (1 - discountPercentage / 100)
```

The low-stock KPI in the original wording counts all `stock <= 10`, including zero. The product badge distinguishes zero from low stock.

### Order

```ts
type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderLine {
  productId: number;
  title: string;
  thumbnail: string;
  unitPrice: number;
  quantity: number;
  grossTotal: number;
  discountPercentage: number;
  discountedTotal: number;
}

interface Order {
  id: number;
  customerId: number;
  customer: UserSummary | null;
  lines: OrderLine[];
  totalProducts: number;
  totalQuantity: number;
  grossTotal: number;
  discountedTotal: number;
  status: OrderStatus;
  placedAt: string; // deterministic demo ISO date
}
```

Canonical status:

```text
id % 10 === 0 -> cancelled
id % 4 === 0  -> processing
id % 3 === 0  -> shipped
otherwise     -> delivered
```

Evaluate the rules in the shown order.

### Deterministic demo dates

Source APIs do not provide the required dates. All date-like analytics use a fixed demo calendar year so results and screenshots do not change with wall-clock time.

```text
DEMO_YEAR = 2025
order month index = (order.id * 7 + order.userId * 3) % 12
order day         = ((order.id * 11) % 27) + 1
user month index  = (user.id * 5) % 12
user day          = ((user.id * 13) % 27) + 1
product month     = (product.id * 11) % 12
product day       = ((product.id * 7) % 27) + 1
```

Construct UTC dates with `Date.UTC(DEMO_YEAR, monthIndex, day, 12, 0, 0)`. Keep helpers pure and test boundary IDs. UI labels these as demo/indexed dates where dates are exposed.

### Canonical aggregate selectors

- Revenue = `sum(order.discountedTotal)`.
- Average rating = `sum(product.rating) / product count`; return `null` for empty.
- Top-selling product quantity = sum of matching order-line `quantity` grouped by `productId`.
- Top-selling product revenue = sum of line `discountedTotal` grouped by `productId`.
- Popular category = sold quantity grouped by the current product catalog's `category`; unknown IDs group under `Unknown`.
- Users by country = user count grouped by normalized country string; blank values group under `Unknown`.
- Monthly order count/revenue = group normalized orders by `placedAt` month, always emitting all 12 months with zero fill.
- Cumulative users = running total of monthly counts in month order.
- “Top N + Other” = sort descending, take N, sum all remaining into one localized `Other` bucket. Default N is 5 for compact dashboard charts and 8 for Analytics.

Do not implement competing versions of these formulas in page components.

## 6. Search, filter, sort, paginate order

For every list:

1. Normalize the query (trim, Unicode-aware lowercase).
2. Apply text search.
3. Apply all active filters with AND semantics.
4. Apply a stable sort, using source ID ascending as the final tie-breaker.
5. Export from this full result when requested.
6. Paginate last.

Shareable state belongs in URL query parameters:

```text
q, page, pageSize, sort, order, status, country, department,
category, minPrice, maxPrice, minRating, from, to
```

Omit defaults from the URL. Invalid values are sanitized to defaults, not allowed to crash a route. Reset `page=1` whenever search/filter/sort/page size changes.

Column visibility and current row selection are UI state and need not be in the URL. Persist column visibility per table in Zustand/local storage. Do not persist selected rows.

## 7. CSV contract

- File name: `users-YYYY-MM-DD.csv` using the local calendar date.
- UTF-8 with BOM for spreadsheet compatibility.
- Header order: `ID, Full Name, Email, Phone, Company, Department, Country, Status` localized only if tests remain stable; English headers are acceptable and preferred.
- Escape quotes by doubling; wrap fields containing comma, quote, CR, or LF in quotes.
- Formula-injection defense: prefix cells beginning with `=`, `+`, `-`, or `@` with a single quote.
- Export filtered/sorted rows before pagination.
- Revoke generated object URLs after download.

## 8. Client UI state

One small persisted Zustand preferences store may contain:

- sidebar collapsed state;
- theme preference if needed to coordinate with `next-themes` (avoid two sources of truth);
- locale preference only if not fully owned by next-intl routing/cookie;
- notification preferences;
- users-table column visibility.

Use a versioned persisted schema with safe defaults and hydration-safe rendering. Ephemeral dialogs, filter values, server data, and form fields do not belong in the store.

## 9. Internationalization

- All user-visible app strings live in `messages/ru.json` and `messages/en.json`, except API content and formatted IDs.
- Translation keys are semantic and nested by shared/page feature, not English sentences.
- Missing keys fail loudly in development and fall back safely in production.
- Use locale formatters for dates, numbers, currency, and pluralization.
- Keep routes unprefixed unless Phase 3 proves locale-prefixed routing materially simpler. Language switching must preserve the current page and meaningful query state.

## 10. Testing strategy

Required focused tests:

- Zod DTO parsing and normalization for one valid fixture plus malformed critical fields;
- deterministic user/order status and demo date derivation;
- revenue, average rating, monthly zero-fill, top-product/category selectors;
- list pipeline: combined search + filters + stable sort + pagination;
- CSV escaping and formula-injection defense;
- settings/profile Zod schema;
- at least one error/retry state component test;
- one critical browser smoke path per major route when Playwright is available.

Tests use fixtures/factories and do not depend on live public APIs.

## 11. Security and resilience

- Validate environment values and remote payloads.
- No secrets in `NEXT_PUBLIC_*`, source, fixtures, logs, screenshots, or docs.
- External links use safe target/rel behavior.
- Treat API text as text; never render remote HTML.
- Image host configuration is allowlisted to the required DummyJSON/CDN domains; render a local fallback on failure.
- Add request timeout (10 seconds recommended) and useful error classification.
- No error boundary should create an infinite retry/reset loop.

## 12. Performance budget and evidence

- Initial route JavaScript should stay deliberate: dynamically import Recharts panels and non-critical dialogs where beneficial.
- Use `next/image` with correct `sizes`; avoid layout shift.
- Debounce list text search 250–350 ms; do not debounce button/select filters.
- Avoid copying entire datasets into multiple stores.
- Memoize derived aggregate work at selector/composition boundaries, not every trivial component.
- Prefer pagination over virtualization for these dataset sizes.
- Production build must pass. Capture Lighthouse or browser-performance observations in the final status if tooling is available; do not fabricate scores.
