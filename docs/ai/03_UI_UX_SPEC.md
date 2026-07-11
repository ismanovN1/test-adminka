# UI/UX specification

Status: **FROZEN BASELINE**

## 1. Design direction

Create a calm, information-dense B2B dashboard: crisp hierarchy, generous but efficient spacing, restrained color, and strong scanning behavior. Avoid the generic “AI-generated landing page” look: no decorative hero, excessive gradients, glassmorphism everywhere, giant headings, or animation without purpose.

Visual character:

- neutral slate/stone surfaces;
- indigo as the primary action and data-series anchor;
- emerald/amber/rose only for semantic positive/warning/critical states;
- subtle one-pixel borders and low-elevation shadows;
- 12–16 px control/card radii, consistent across the product;
- tabular numerals for KPIs, money, quantities, and IDs;
- one sans-serif family loaded through `next/font`; no more than two weights per common screen.

Use semantic design tokens through CSS variables for both themes. Components consume tokens, not raw repeated hex values.

## 2. Layout system

- Desktop `>= 1280`: 256 px sidebar (72 px collapsed), sticky top bar, content max width around 1600 px.
- Tablet `768–1279`: collapsed icon rail or drawer, two-column cards where space permits.
- Mobile `360–767`: top bar with menu, drawer navigation, one-column cards, compact page padding.
- Page spacing: approximately 16 px mobile, 24 px tablet, 24–32 px desktop.
- KPI grid: 1 column narrow mobile, 2 columns mobile/tablet, 3 or 6 columns wide desktop depending readable minimum width.
- Charts must not be placed in containers narrower than their meaningful labels; stack instead.

The content layout must not shift when the sidebar collapses. Main content owns its scrolling; overlays lock background scroll.

## 3. Shell behavior

Sidebar contains brand, six primary nav items, collapse control, and compact user/profile entry. Active route has a visible shape plus text/icon change that works in both themes. Mobile drawer closes on navigation and Escape.

Top bar contains mobile menu trigger, contextual page title/breadcrumb, optional global refresh indicator, theme shortcut, notification affordance, and profile/settings link. Non-functional icons are forbidden; every visible control must perform a real scoped action.

Use a skip link to `main`. Set meaningful route metadata and one `h1` per page.

## 4. Components and states

Build a small consistent primitive set before pages diverge:

- Button variants: primary, secondary, ghost, destructive only if genuinely needed.
- IconButton with required accessible label and tooltip for unfamiliar icons.
- Input, SearchInput, Select, Checkbox, Switch, Badge, Avatar.
- Card, PageHeader, Toolbar, Pagination.
- Dialog/Sheet, DropdownMenu.
- Skeleton, EmptyState, ErrorState.
- Table primitives with sort button and responsive scroll shell.
- ChartCard with title, description, loading/empty/error/content slots.

Use touch targets of at least 44×44 px on mobile. Disabled controls remain legible and communicate disabled state to assistive tech.

## 5. Data tables and filter UX

- Keep search, primary filters, column settings, and export in a single responsive toolbar.
- Active filters appear as removable chips or an equally clear summary; show “Clear all” when any filter differs from default.
- On mobile, keep search visible and move advanced filters into a sheet. Show an active filter count on its trigger.
- Headers remain readable; numeric columns align right.
- Sorting is triggered by a button inside the header, with `aria-sort` on the header.
- Selected-row bulk bar appears only when rows are selected. It may offer “Clear selection” and CSV export of the normal filtered set; do not invent delete actions.
- Pagination states show current range and total filtered results. Disable impossible Previous/Next actions.
- Empty after filtering differs from empty remote dataset.

## 6. Chart UX

- Each series has a stable semantic token and does not change color across pages.
- Do not rely solely on color; combine position, labels, legend, or stroke patterns where possible.
- Tooltips format currency/count/date by locale and never show raw floating-point noise.
- Axis labels do not overlap at 360 px; reduce ticks or switch layout.
- Pie/donut charts show no more than Top N + Other.
- Animate only initial entry subtly and disable/reduce under `prefers-reduced-motion`.
- Provide a visually hidden summary or adjacent short insight containing chart name, measure, and leading category/value.

## 7. Loading, empty, error, and feedback

Skeletons mirror final geometry and use restrained motion. Do not show a full-page spinner for ordinary content queries.

Error state includes:

- plain-language title;
- short context-specific explanation;
- Retry button when retryable;
- safe navigation option for route-level failures.

Empty state includes what is empty and the next useful action. A zero-result filter state offers Clear filters. A genuine empty API result does not pretend filters caused it.

Toasts are reserved for completed user actions (CSV started, preferences saved, profile saved) and failures not already shown inline. Toasts never replace form errors.

## 8. Content style

- Russian copy is clear and concise, not machine-literal; English conveys the same meaning.
- Avoid claiming live, real-time, actual growth, or chronological recency when data is synthetic.
- Use “demo date/status” in details/help text, not on every dense cell.
- IDs use `#ORD-0001`; categories may be humanized from slugs.
- Currency is USD because the source data is USD-like and no exchange-rate API is in scope.
- Never show raw `undefined`, empty punctuation, or broken image icons.

## 9. Accessibility verification targets

- Keyboard path: sidebar/drawer, toolbar, filters, sort, table rows/actions, pagination, dialogs, settings forms.
- Visible focus in light and dark modes.
- Logical heading order and landmarks.
- Live region for result count changes and asynchronous success/failure when appropriate.
- Dialog title/description and restored trigger focus.
- Error summary or focus to first invalid field on profile submit.
- 200% zoom remains usable; text does not overlap or disappear.
- Reduced motion, high-contrast-safe focus, and WCAG AA color contrast.

## 10. Visual QA matrix

At minimum inspect these viewport/theme combinations before release:

| Viewport | Light | Dark | Key risk |
|---|---:|---:|---|
| 360×800 | Yes | Yes | overflow, drawer, filter sheet, chart labels |
| 768×1024 | Yes | Yes | sidebar mode, two-column wrapping, tables |
| 1440×900 | Yes | Yes | density, max width, chart grid, hover/focus |

Capture screenshots only if the tooling exists. Never claim visual QA from code inspection alone.
