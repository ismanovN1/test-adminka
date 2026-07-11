import type { OrderSortField, OrderStatus } from "@/entities/order";
import type { SortDirection } from "@/shared/lib/list-pipeline";

export const orderPageSizes = [10, 20, 50] as const;
export const orderStatuses = ["processing", "shipped", "delivered", "cancelled"] as const satisfies readonly OrderStatus[];
export const orderSortFields = ["id", "customer", "quantity", "total", "status", "date"] as const satisfies readonly OrderSortField[];

export interface OrdersQueryState {
  query: string;
  page: number;
  pageSize: (typeof orderPageSizes)[number];
  sortBy: OrderSortField;
  direction: SortDirection;
  status: OrderStatus | "";
  from: string;
  to: string;
}

export const defaultOrdersQueryState: OrdersQueryState = {
  query: "",
  page: 1,
  pageSize: 10,
  sortBy: "id",
  direction: "desc",
  status: "",
  from: "",
  to: "",
};

function includes<T extends string | number>(values: readonly T[], value: string | number): value is T {
  return values.includes(value as T);
}

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return value !== null && Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function date(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ? value : "";
}

export function parseOrdersQueryState(params: URLSearchParams): OrdersQueryState {
  const pageSize = positiveInteger(params.get("pageSize"), 10);
  const sort = params.get("sort") ?? "id";
  const status = params.get("status") ?? "";
  return {
    query: params.get("q")?.trim() ?? "",
    page: positiveInteger(params.get("page"), 1),
    pageSize: includes(orderPageSizes, pageSize) ? pageSize : 10,
    sortBy: includes(orderSortFields, sort) ? sort : "id",
    direction: params.get("order") === "asc" ? "asc" : "desc",
    status: includes(orderStatuses, status) ? status : "",
    from: date(params.get("from")),
    to: date(params.get("to")),
  };
}

export function serializeOrdersQueryState(state: OrdersQueryState) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query.trim());
  if (state.page !== 1) params.set("page", String(state.page));
  if (state.pageSize !== 10) params.set("pageSize", String(state.pageSize));
  if (state.sortBy !== "id") params.set("sort", state.sortBy);
  if (state.direction !== "desc") params.set("order", state.direction);
  if (state.status) params.set("status", state.status);
  if (state.from) params.set("from", state.from);
  if (state.to) params.set("to", state.to);
  return params.toString();
}

export function withOrdersQueryPatch(state: OrdersQueryState, patch: Partial<OrdersQueryState>, resetPage = true): OrdersQueryState {
  return { ...state, ...patch, page: resetPage ? 1 : patch.page ?? state.page };
}

