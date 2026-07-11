import type { ProductSortField } from "@/entities/product";
import type { SortDirection } from "@/shared/lib/list-pipeline";

export const productPageSizes = [12, 24, 48] as const;
export const productRatingOptions = [0, 3, 4, 4.5] as const;
export const productSortFields = [
  "id",
  "title",
  "price",
  "rating",
  "discount",
  "stock",
] as const satisfies readonly ProductSortField[];

export interface ProductsQueryState {
  query: string;
  page: number;
  pageSize: (typeof productPageSizes)[number];
  sortBy: ProductSortField;
  direction: SortDirection;
  category: string;
  minPrice?: number;
  maxPrice?: number;
  minRating: (typeof productRatingOptions)[number];
}

export const defaultProductsQueryState: ProductsQueryState = {
  query: "",
  page: 1,
  pageSize: 12,
  sortBy: "id",
  direction: "asc",
  category: "",
  minRating: 0,
};

function isOneOf<T extends string | number>(
  values: readonly T[],
  value: string | number,
): value is T {
  return values.includes(value as T);
}

function positiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return value !== null && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
}

function nonNegativeNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function parseProductsQueryState(params: URLSearchParams): ProductsQueryState {
  const pageSize = positiveInteger(params.get("pageSize"), 12);
  const sort = params.get("sort") ?? "id";
  const rating = Number(params.get("minRating") ?? 0);
  const minPrice = nonNegativeNumber(params.get("minPrice"));
  const maxPrice = nonNegativeNumber(params.get("maxPrice"));

  return {
    query: params.get("q")?.trim() ?? "",
    page: positiveInteger(params.get("page"), 1),
    pageSize: isOneOf(productPageSizes, pageSize) ? pageSize : 12,
    sortBy: isOneOf(productSortFields, sort) ? sort : "id",
    direction: params.get("order") === "desc" ? "desc" : "asc",
    category: params.get("category")?.trim() ?? "",
    minPrice,
    maxPrice,
    minRating: isOneOf(productRatingOptions, rating) ? rating : 0,
  };
}

export function serializeProductsQueryState(state: ProductsQueryState): string {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query.trim());
  if (state.page !== 1) params.set("page", String(state.page));
  if (state.pageSize !== 12) params.set("pageSize", String(state.pageSize));
  if (state.sortBy !== "id") params.set("sort", state.sortBy);
  if (state.direction !== "asc") params.set("order", state.direction);
  if (state.category) params.set("category", state.category);
  if (state.minPrice !== undefined) params.set("minPrice", String(state.minPrice));
  if (state.maxPrice !== undefined) params.set("maxPrice", String(state.maxPrice));
  if (state.minRating !== 0) params.set("minRating", String(state.minRating));
  return params.toString();
}

export function withProductsQueryPatch(
  state: ProductsQueryState,
  patch: Partial<ProductsQueryState>,
  resetPage = true,
): ProductsQueryState {
  return { ...state, ...patch, page: resetPage ? 1 : patch.page ?? state.page };
}

