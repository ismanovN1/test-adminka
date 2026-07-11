# Product specification — Analytics Dashboard

Status: **FROZEN BASELINE**  
Product name: **Test Admin**  
Default locale: **Russian (`ru`)**  
Secondary locale: **English (`en`)**

## 1. Product outcome

Build a credible responsive SaaS analytics dashboard that lets an operations manager understand commerce performance and explore users, products, and orders. It must feel like one coherent product, not a collection of demo pages.

Success means:

- all required routes and states work at desktop, tablet, and mobile widths;
- data semantics stay consistent across KPI cards, charts, tables, and CSV exports;
- every public-API request has loading, empty, recoverable error, and retry behavior;
- the project demonstrates deliberate architecture, TypeScript boundaries, accessibility, and focused performance work;
- a reviewer can clone, install, run, and understand decisions from the README.

## 2. Routes and navigation

| Route | Nav label | Required outcome |
|---|---|---|
| `/` | Dashboard | KPIs, trend summaries, charts, and recent activity |
| `/users` | Users | Full user data table workflow and CSV export |
| `/products` | Products | Filterable/sortable/paginated product catalog |
| `/orders` | Orders | Filterable/sortable/paginated order list with customer joins |
| `/analytics` | Analytics | Deeper multi-chart commerce and audience analysis |
| `/settings` | Settings | Theme, language, notifications, and profile form |
| unmatched | — | Branded 404 with a route back to Dashboard |

Global shell: desktop sidebar, tablet compact sidebar, mobile drawer, top bar, breadcrumb/page title, theme-aware content, and accessible skip link.

## 3. Dashboard acceptance criteria

### KPIs

Display exactly these six cards from the normalized full datasets:

1. Total users = API `users.total`.
2. Total products = API `products.total`.
3. Total orders = API `carts.total`.
4. Total revenue = sum of cart `discountedTotal`, formatted as USD.
5. Average product rating = arithmetic mean of all product ratings, one decimal.
6. Low-stock products = count where `stock <= 10`.

Each card has a label, value, icon, concise context text, skeleton, and no fabricated percentage delta. If a meaningful derived comparison is shown, its formula must be documented and shared with Analytics.

### Charts

Dashboard contains:

- monthly revenue: area or line chart using deterministic demo order dates;
- orders by status: bar or donut chart;
- users by country: top countries plus “Other”;
- products by category: top categories plus “Other”;
- top products: horizontal bar chart ranked by cart item quantity.

Charts must have accessible names, visible legends/tooltips where useful, locale-aware number formatting, theme-safe colors, and an understandable non-chart fallback/summary for screen-reader users.

### Recent activity

Show three compact lists: recently indexed users, products, and orders. “Recent” means descending source ID because the APIs do not provide creation timestamps. The UI must not claim these are real timestamps. A small “Demo data” hint is acceptable.

## 4. Users acceptance criteria

Desktop/tablet table columns:

- selection checkbox, avatar, full name, email, phone, company, country, derived status, actions.

Required behavior:

- debounced, case-insensitive search across full name, email, phone, company, and country;
- sortable name, email, company, country, and status columns;
- filters for status, country, and company department;
- pagination with page size options 10, 20, and 50;
- row selection, select visible page, and a clear-selection action;
- column visibility menu; name cannot be hidden;
- CSV export of the **current filtered and sorted result**, not only the visible page; UTF-8 BOM and escaped values;
- row action opens an accessible read-only details sheet/dialog; no fake destructive actions;
- zero-result empty state preserves filter controls and offers “Clear filters.”

Mobile may use a horizontally scrollable table with a sticky identity column or an equivalent card/list presentation. It must preserve search, filtering, pagination, details, and selection clarity.

## 5. Products acceptance criteria

Each row/card shows image, title, category, price, discount, rating, and stock. Required behavior:

- debounced search by title, description, brand, and category;
- multi/single category filter with an explicit clear option;
- validated min/max price filter where min cannot exceed max;
- minimum rating filter (All, 3+, 4+, 4.5+);
- sorting by title, price, rating, discount, and stock;
- pagination with 12, 24, and 48 items;
- low-stock and out-of-stock treatments that do not rely only on color;
- product details in an accessible sheet/dialog;
- stable image aspect ratio, lazy images, and useful alt text.

## 6. Orders acceptance criteria

An order is a normalized DummyJSON cart. Each row/card shows order ID, joined customer, product preview, total quantity, discounted total, derived status, and derived demo date.

Required behavior:

- debounced search by order ID, customer name/email, and product title;
- filters for derived status and a valid demo date range;
- sorting by ID, customer, quantity, total, status, and demo date;
- pagination with 10, 20, and 50 items;
- expanded details or accessible sheet/dialog with every line item, quantity, price, discount, line total, and order summary;
- missing customer joins render “Unknown customer” safely and never crash;
- status and date are explicitly derived demo fields, not server truth.

## 7. Analytics acceptance criteria

Analytics must add depth rather than duplicate the Dashboard layout. It includes:

- monthly revenue and order count in a combined or coordinated trend view;
- cumulative user count by deterministic demo month;
- popular categories ranked by sold quantity, not merely catalog count;
- users by country;
- top-selling products by quantity, with revenue available in tooltip or secondary text;
- at least Line, Area, Bar, and Pie/Donut chart types across the page;
- short text insight beside each major chart stating what the chart represents, without invented causal claims.

All analytics derive from the same selectors used by Dashboard. No page-specific alternative formulas.

## 8. Settings acceptance criteria

- Theme: Light, Dark, System; applied immediately and persisted.
- Language: Russian and English; persisted and reflected across nav, core page labels, states, table controls, form validation, and formatting.
- Notifications: email, product alerts, order alerts; local demo preferences persisted through Zustand.
- Profile: avatar preview or initials, first name, last name, email, and role; React Hook Form + Zod; submit shows a clearly local-only success toast.
- Reset preferences requires confirmation.

## 9. Cross-cutting states

Every route that depends on remote data has:

- layout-matching skeleton during first load;
- subtle background refresh indicator without replacing usable data;
- contextual empty state;
- contextual error state with Retry;
- safe handling of partial join data;
- no unhandled promise rejection or blank page.

Application-level requirements: branded `not-found`, route-level `error.tsx`, root/global error fallback where supported, and offline/network copy that distinguishes a network problem from an empty dataset.

## 10. Responsive and accessibility outcomes

- Supported widths: 360 px mobile minimum, 768 px tablet, 1280+ desktop.
- No accidental horizontal page overflow at 360 px; intentional table scrollers are labeled and contained.
- All operations are keyboard accessible and have visible focus.
- Icon-only buttons have accessible names.
- Dialog/sheet focus is trapped, initial focus is sensible, Escape closes, focus returns to trigger.
- Table headers communicate sort state; selection checkboxes have row-specific labels.
- Form fields have labels, descriptions where useful, and associated errors.
- Color contrast meets WCAG AA for normal text and UI state is never communicated by color alone.
- Respect `prefers-reduced-motion`.

## 11. Explicit non-goals

- Authentication/authorization.
- A real backend/database or persistent remote CRUD.
- Editing/deleting users, products, or orders.
- Real-time updates, WebSockets, billing, or multi-tenancy.
- PWA/offline cache, maps, and a Posts page.
- Virtualization when paginated result sizes remain small. It may be added only after measurement and a recorded decision.
- Pixel-perfect imitation of a specific commercial dashboard.

## 12. Product definition of done

The product is done only when all route criteria pass, the final checklist in `06_QA_CHECKLIST.md` is completed, there are no known P0/P1 defects, production build succeeds, and README accurately documents setup, architecture, assumptions, demo-derived fields, and limitations.
