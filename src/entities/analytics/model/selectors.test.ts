import { describe, expect, it } from "vitest";

import type { Order } from "@/entities/order";
import type { Product } from "@/entities/product";
import type { User } from "@/entities/user";

import {
  selectAverageProductRating,
  selectCommerceSummary,
  selectCumulativeUsers,
  selectMonthlyOrderMetrics,
  selectOrdersByStatus,
  selectPopularCategories,
  selectProductCatalogByCategory,
  selectRecentlyIndexed,
  selectTopNWithOther,
  selectTopSellingProducts,
  selectTotalRevenue,
  selectUsersByCountry,
} from "./selectors";

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: 1,
    title: "Keyboard",
    description: "",
    category: "electronics",
    brand: null,
    price: 100,
    discountPercentage: 0,
    rating: 4,
    stock: 0,
    thumbnail: "",
    images: [],
    indexedAt: "2025-01-01T12:00:00.000Z",
    ...overrides,
  };
}

function makeUser(overrides: Partial<User>): User {
  return {
    id: 1,
    firstName: "Ada",
    lastName: "Lovelace",
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    phone: "",
    image: "",
    role: "",
    companyName: "",
    department: "",
    country: "United States",
    status: "inactive",
    indexedAt: "2025-01-01T12:00:00.000Z",
    ...overrides,
  };
}

function makeOrder(overrides: Partial<Order>): Order {
  return {
    id: 1,
    customerId: 1,
    customer: null,
    lines: [],
    totalProducts: 0,
    totalQuantity: 0,
    grossTotal: 0,
    discountedTotal: 0,
    status: "delivered",
    placedAt: "2025-01-01T12:00:00.000Z",
    ...overrides,
  };
}

const products = [
  makeProduct({ id: 1, category: "electronics", rating: 4, stock: 0 }),
  makeProduct({ id: 2, category: "home", rating: 2, stock: 10 }),
];

const orders = [
  makeOrder({
    id: 1,
    discountedTotal: 100,
    lines: [
      {
        productId: 1,
        title: "Keyboard",
        thumbnail: "",
        unitPrice: 40,
        quantity: 2,
        grossTotal: 80,
        discountPercentage: 0,
        discountedTotal: 80,
      },
      {
        productId: 9,
        title: "Unknown item",
        thumbnail: "",
        unitPrice: 20,
        quantity: 1,
        grossTotal: 20,
        discountPercentage: 0,
        discountedTotal: 20,
      },
    ],
  }),
  makeOrder({
    id: 2,
    discountedTotal: 50,
    status: "cancelled",
    placedAt: "2025-03-15T12:00:00.000Z",
    lines: [
      {
        productId: 1,
        title: "Keyboard",
        thumbnail: "",
        unitPrice: 40,
        quantity: 1,
        grossTotal: 40,
        discountPercentage: 0,
        discountedTotal: 40,
      },
      {
        productId: 2,
        title: "Lamp",
        thumbnail: "",
        unitPrice: 4,
        quantity: 3,
        grossTotal: 12,
        discountPercentage: 10,
        discountedTotal: 10,
      },
    ],
  }),
];

describe("canonical analytics selectors", () => {
  it("computes revenue, average rating, low-stock KPI and source totals", () => {
    expect(selectTotalRevenue(orders)).toBe(150);
    expect(selectAverageProductRating(products)).toBe(3);
    expect(
      selectCommerceSummary({
        userTotal: 200,
        productTotal: 300,
        orderTotal: 50,
        products,
        orders,
      }),
    ).toEqual({
      totalUsers: 200,
      totalProducts: 300,
      totalOrders: 50,
      totalRevenue: 150,
      averageProductRating: 3,
      lowStockProducts: 2,
    });
  });

  it("returns safe empty aggregates", () => {
    expect(selectTotalRevenue([])).toBe(0);
    expect(selectAverageProductRating([])).toBeNull();
    expect(selectTopSellingProducts([])).toEqual([]);
    expect(selectPopularCategories([], [])).toEqual([]);
    expect(selectUsersByCountry([])).toEqual([]);
    expect(selectMonthlyOrderMetrics([])).toHaveLength(12);
    expect(selectMonthlyOrderMetrics([]).every((month) => month.revenue === 0)).toBe(true);
  });

  it("groups product sales by quantity and revenue with deterministic ties", () => {
    expect(selectTopSellingProducts(orders)).toEqual([
      { productId: 1, title: "Keyboard", quantity: 3, revenue: 120 },
      { productId: 2, title: "Lamp", quantity: 3, revenue: 10 },
      { productId: 9, title: "Unknown item", quantity: 1, revenue: 20 },
    ]);
  });

  it("groups sold quantity by current catalog category and preserves unknown ids", () => {
    expect(selectPopularCategories(orders, products)).toEqual([
      { name: "electronics", value: 3 },
      { name: "home", value: 3 },
      { name: "Unknown", value: 1 },
    ]);
    expect(selectProductCatalogByCategory(products)).toEqual([
      { name: "electronics", value: 1 },
      { name: "home", value: 1 },
    ]);
  });

  it("groups normalized countries and blank values under Unknown", () => {
    const users = [
      makeUser({ id: 1 }),
      makeUser({ id: 2 }),
      makeUser({ id: 3, country: " " }),
    ];

    expect(selectUsersByCountry(users)).toEqual([
      { name: "United States", value: 2 },
      { name: "Unknown", value: 1 },
    ]);
  });

  it("always emits 12 UTC months and zero-fills order gaps", () => {
    const months = selectMonthlyOrderMetrics(orders);

    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ monthIndex: 0, orderCount: 1, revenue: 100 });
    expect(months[1]).toEqual({ monthIndex: 1, orderCount: 0, revenue: 0 });
    expect(months[2]).toEqual({ monthIndex: 2, orderCount: 1, revenue: 50 });
  });

  it("builds cumulative user counts in calendar order", () => {
    const users = [
      makeUser({ id: 1, indexedAt: "2025-01-01T12:00:00.000Z" }),
      makeUser({ id: 2, indexedAt: "2025-03-01T12:00:00.000Z" }),
      makeUser({ id: 3, indexedAt: "2025-03-15T12:00:00.000Z" }),
    ];
    const months = selectCumulativeUsers(users);

    expect(months.slice(0, 4)).toEqual([
      { monthIndex: 0, newUsers: 1, cumulativeUsers: 1 },
      { monthIndex: 1, newUsers: 0, cumulativeUsers: 1 },
      { monthIndex: 2, newUsers: 2, cumulativeUsers: 3 },
      { monthIndex: 3, newUsers: 0, cumulativeUsers: 3 },
    ]);
    expect(months[11]?.cumulativeUsers).toBe(3);
  });

  it("produces fixed order-status buckets and Top N plus Other", () => {
    expect(selectOrdersByStatus(orders)).toEqual([
      { name: "processing", value: 0 },
      { name: "shipped", value: 0 },
      { name: "delivered", value: 1 },
      { name: "cancelled", value: 1 },
    ]);
    expect(
      selectTopNWithOther(
        [
          { name: "A", value: 5 },
          { name: "B", value: 4 },
          { name: "C", value: 3 },
        ],
        2,
        "Остальные",
      ),
    ).toEqual([
      { name: "A", value: 5 },
      { name: "B", value: 4 },
      { name: "Остальные", value: 3 },
    ]);
    expect(selectTopNWithOther([], -1)).toEqual([]);
  });

  it("selects recent demo records by descending source id without mutating input", () => {
    const source = [{ id: 1 }, { id: 9 }, { id: 4 }];

    expect(selectRecentlyIndexed(source, 2)).toEqual([{ id: 9 }, { id: 4 }]);
    expect(source.map((item) => item.id)).toEqual([1, 9, 4]);
    expect(selectRecentlyIndexed(source, 0)).toEqual([]);
  });
});
