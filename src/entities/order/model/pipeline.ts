import {
  compareText,
  normalizeSearchTerm,
  paginate,
  sortWithIdTieBreak,
  type ListPage,
  type SortDirection,
} from "@/shared/lib/list-pipeline";

import type { Order, OrderStatus } from "./types";

export type OrderSortField =
  | "id"
  | "customer"
  | "quantity"
  | "total"
  | "status"
  | "date";

export interface OrderListOptions {
  query?: string;
  statuses?: readonly OrderStatus[];
  from?: string;
  to?: string;
  sortBy?: OrderSortField;
  direction?: SortDirection;
  page?: number;
  pageSize?: number;
}

const orderComparators: Record<OrderSortField, (left: Order, right: Order) => number> = {
  id: (left, right) => left.id - right.id,
  customer: (left, right) =>
    compareText(left.customer?.fullName ?? "", right.customer?.fullName ?? ""),
  quantity: (left, right) => left.totalQuantity - right.totalQuantity,
  total: (left, right) => left.discountedTotal - right.discountedTotal,
  status: (left, right) => compareText(left.status, right.status),
  date: (left, right) => left.placedAt.localeCompare(right.placedAt),
};

export function runOrderListPipeline(
  orders: readonly Order[],
  options: OrderListOptions = {},
): ListPage<Order> {
  const query = normalizeSearchTerm(options.query);
  const statuses = new Set(options.statuses ?? []);
  const from = parseDateBoundary(
    options.from,
    Number.NEGATIVE_INFINITY,
    false,
  );
  const to = parseDateBoundary(options.to, Number.POSITIVE_INFINITY, true);

  const filtered = orders.filter((order) => {
    const searchable = [
      String(order.id),
      `#ord-${String(order.id).padStart(4, "0")}`,
      order.customer?.fullName ?? "",
      order.customer?.email ?? "",
      ...order.lines.map((line) => line.title),
    ].map(normalizeSearchTerm);
    const placedAt = Date.parse(order.placedAt);

    return (
      (query === "" || searchable.some((value) => value.includes(query))) &&
      (statuses.size === 0 || statuses.has(order.status)) &&
      placedAt >= from &&
      placedAt <= to
    );
  });

  const sorted = sortWithIdTieBreak(
    filtered,
    orderComparators[options.sortBy ?? "id"],
    options.direction ?? "asc",
  );

  return paginate(sorted, options.page ?? 1, options.pageSize ?? 10, 10);
}

function parseDateBoundary(
  value: string | undefined,
  fallback: number,
  endOfDay: boolean,
): number {
  if (!value) {
    return fallback;
  }

  const timestamp = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? Date.parse(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`)
    : Date.parse(value);

  return Number.isNaN(timestamp) ? fallback : timestamp;
}
