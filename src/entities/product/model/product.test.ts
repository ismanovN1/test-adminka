import { describe, expect, it } from "vitest";

import {
  makeProductDto,
  makeProductsResponse,
} from "@/test/fixtures/dummyjson";

import { productsResponseSchema } from "../api/schema";
import {
  deriveProductIndexedAt,
  getDiscountedUnitPrice,
  isLowStock,
  isOutOfStock,
} from "./derive";
import { mapProductsResponse } from "./map";

describe("product boundary and deterministic fields", () => {
  it("parses and maps complete products without leaking DTO metadata", () => {
    const result = mapProductsResponse(
      productsResponseSchema.parse(makeProductsResponse()),
    );

    expect(result.items[0]).toEqual({
      id: 11,
      title: "Precision Keyboard",
      description: "Low-profile mechanical keyboard",
      category: "electronics",
      brand: "Nexa",
      price: 120,
      discountPercentage: 10,
      rating: 4.5,
      stock: 8,
      thumbnail: "https://cdn.example.com/keyboard.png",
      images: ["https://cdn.example.com/keyboard-detail.png"],
      indexedAt: "2025-02-24T12:00:00.000Z",
    });
  });

  it.each([undefined, null])("accepts numeric boundaries and a missing brand (%s)", (brand) => {
    const dto = makeProductDto({
      brand,
      discountPercentage: 100,
      rating: 5,
      stock: 0,
    });
    const product = mapProductsResponse(
      productsResponseSchema.parse(makeProductsResponse([dto])),
    ).items[0];

    expect(product).toMatchObject({ brand: null, stock: 0 });
    expect(getDiscountedUnitPrice(120, 100)).toBe(0);
    expect(isOutOfStock(0)).toBe(true);
    expect(isLowStock(0)).toBe(false);
    expect(isLowStock(10)).toBe(true);
    expect(isLowStock(11)).toBe(false);
  });

  it.each([
    { id: -1 },
    { price: -0.01 },
    { rating: 5.1 },
    { stock: -1 },
    { discountPercentage: 101 },
    { title: "   " },
    { category: "\t\n" },
  ])("rejects malformed critical product fields: %o", (override) => {
    expect(() =>
      productsResponseSchema.parse(
        makeProductsResponse([makeProductDto(override)]),
      ),
    ).toThrow();
  });

  it("derives the fixed product demo date at boundary ids", () => {
    expect(deriveProductIndexedAt(0)).toBe("2025-01-01T12:00:00.000Z");
    expect(deriveProductIndexedAt(12)).toBe("2025-01-04T12:00:00.000Z");
  });
});
