import { describe, expect, it } from "vitest";

import {
  makeProductDto,
  makeProductsResponse,
} from "@/test/fixtures/dummyjson";

import { productsResponseSchema } from "../api/schema";
import { mapProductsResponse } from "./map";
import { runProductListPipeline } from "./pipeline";

const products = mapProductsResponse(
  productsResponseSchema.parse(
    makeProductsResponse([
      makeProductDto({ id: 21 }),
      makeProductDto({ id: 11 }),
      makeProductDto({
        id: 3,
        title: "Desk Lamp",
        description: "Warm light",
        category: "home-decoration",
        brand: "Glow",
        price: 35,
        rating: 3.8,
        stock: 20,
      }),
    ]),
  ),
).items;

describe("runProductListPipeline", () => {
  it("combines full-text, category, price and rating filters with a stable tie-break", () => {
    const result = runProductListPipeline(products, {
      query: " MECHANICAL ",
      categories: ["ELECTRONICS"],
      minPrice: 120,
      maxPrice: 120,
      minRating: 4.5,
      sortBy: "price",
      direction: "desc",
      page: 2,
      pageSize: 1,
    });

    expect(result.filtered.map((product) => product.id)).toEqual([11, 21]);
    expect(result.items[0]?.id).toBe(21);
  });

  it("returns no items when AND filters conflict", () => {
    expect(
      runProductListPipeline(products, {
        categories: ["electronics"],
        maxPrice: 100,
      }),
    ).toMatchObject({ items: [], total: 0, totalPages: 0 });
  });

  it("falls back to the Products pagination defaults for non-finite inputs", () => {
    expect(
      runProductListPipeline(products, {
        page: Number.POSITIVE_INFINITY,
        pageSize: Number.NaN,
      }),
    ).toMatchObject({ page: 1, pageSize: 12, total: 3, totalPages: 1 });
  });
});
