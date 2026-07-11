import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Order } from "@/entities/order";
import type { Product } from "@/entities/product";
import type { User } from "@/entities/user";

import { AnalyticsWorkflow } from "./analytics-workflow";

const users: User[] = [{ id: 1, firstName: "Ada", lastName: "Lovelace", fullName: "Ada Lovelace", email: "ada@example.com", phone: "1", image: "", role: "admin", companyName: "Nexa", department: "Research", country: "UK", status: "active", indexedAt: "2025-01-01T12:00:00.000Z" }];
const products: Product[] = [{ id: 1, title: "Keyboard", description: "", category: "electronics", brand: null, price: 100, discountPercentage: 20, rating: 4.5, stock: 5, thumbnail: "", images: [], indexedAt: "2025-01-01T12:00:00.000Z" }];
const orders: Order[] = [{ id: 1, customerId: 1, customer: { id: 1, fullName: "Ada Lovelace", email: "ada@example.com", image: "" }, lines: [{ productId: 1, title: "Keyboard", thumbnail: "", unitPrice: 100, quantity: 1, grossTotal: 100, discountPercentage: 20, discountedTotal: 80 }], totalProducts: 1, totalQuantity: 1, grossTotal: 100, discountedTotal: 80, status: "delivered", placedAt: "2025-01-01T12:00:00.000Z" }];
const query = <T,>(data: T) => ({ data, isPending: false, isError: false, isFetching: false, refetch: vi.fn() });

vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("next-intl", () => ({ useLocale: () => "en-US", useTranslations: (namespace?: string) => (key: string) => `${namespace ? `${namespace}.` : ""}${key}` }));
vi.mock("@/entities/user", () => ({ useUsersQuery: () => query({ items: users, total: users.length }) }));
vi.mock("@/entities/product", () => ({ useProductsQuery: () => query({ items: products, total: products.length }) }));
vi.mock("@/entities/order", () => ({ useOrdersQuery: () => query({ items: orders, total: orders.length }) }));

describe("AnalyticsWorkflow", () => {
  afterEach(cleanup);
  it("agrees with dashboard canonical shared totals", () => {
    render(createElement(AnalyticsWorkflow));
    expect(screen.getByText("$80.00", { selector: "[data-analytics-summary='revenue']" })).toBeInTheDocument();
    expect(screen.getByText("1", { selector: "[data-analytics-summary='orders']" })).toBeInTheDocument();
    expect(screen.getByText("1", { selector: "[data-analytics-summary='users']" })).toBeInTheDocument();
  });
});
