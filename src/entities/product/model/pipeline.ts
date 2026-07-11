import {
  compareText,
  normalizeSearchTerm,
  paginate,
  sortWithIdTieBreak,
  type ListPage,
  type SortDirection,
} from "@/shared/lib/list-pipeline";

import type { Product } from "./types";

export type ProductSortField =
  | "id"
  | "title"
  | "price"
  | "rating"
  | "discount"
  | "stock";

export interface ProductListOptions {
  query?: string;
  categories?: readonly string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: ProductSortField;
  direction?: SortDirection;
  page?: number;
  pageSize?: number;
}

const productComparators: Record<
  ProductSortField,
  (left: Product, right: Product) => number
> = {
  id: (left, right) => left.id - right.id,
  title: (left, right) => compareText(left.title, right.title),
  price: (left, right) => left.price - right.price,
  rating: (left, right) => left.rating - right.rating,
  discount: (left, right) => left.discountPercentage - right.discountPercentage,
  stock: (left, right) => left.stock - right.stock,
};

export function runProductListPipeline(
  products: readonly Product[],
  options: ProductListOptions = {},
): ListPage<Product> {
  const query = normalizeSearchTerm(options.query);
  const categories = new Set(
    options.categories?.map(normalizeSearchTerm) ?? [],
  );

  const filtered = products.filter((product) => {
    const searchable = [
      product.title,
      product.description,
      product.brand ?? "",
      product.category,
    ].map(normalizeSearchTerm);

    return (
      (query === "" || searchable.some((value) => value.includes(query))) &&
      (categories.size === 0 || categories.has(normalizeSearchTerm(product.category))) &&
      (options.minPrice === undefined || product.price >= options.minPrice) &&
      (options.maxPrice === undefined || product.price <= options.maxPrice) &&
      (options.minRating === undefined || product.rating >= options.minRating)
    );
  });

  const sorted = sortWithIdTieBreak(
    filtered,
    productComparators[options.sortBy ?? "id"],
    options.direction ?? "asc",
  );

  return paginate(sorted, options.page ?? 1, options.pageSize ?? 12, 12);
}
