import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Order } from "@/entities/order";
import type { Product } from "@/entities/product";
import type { User } from "@/entities/user";

import { DashboardWorkflow } from "./dashboard-workflow";

const user = (id: number): User => ({ id, firstName: "Ada", lastName: "Lovelace", fullName: `Ada ${id}`, email: `ada${id}@example.com`, phone: "1", image: "", role: "admin", companyName: "Nexa", department: "Research", country: "UK", status: "active", indexedAt: "2025-01-01T12:00:00.000Z" });
const product: Product = { id: 1, title: "Keyboard", description: "", category: "electronics", brand: null, price: 100, discountPercentage: 20, rating: 4.5, stock: 5, thumbnail: "", images: [], indexedAt: "2025-01-01T12:00:00.000Z" };
const order: Order = { id: 1, customerId: 1, customer: { id: 1, fullName: "Ada 1", email: "ada1@example.com", image: "" }, lines: [{ productId: 1, title: "Keyboard", thumbnail: "", unitPrice: 100, quantity: 1, grossTotal: 100, discountPercentage: 20, discountedTotal: 80 }], totalProducts: 1, totalQuantity: 1, grossTotal: 100, discountedTotal: 80, status: "delivered", placedAt: "2025-01-01T12:00:00.000Z" };
const query = <T,>(data: T) => ({ data, isPending: false, isError: false, isFetching: false, refetch: vi.fn() });

vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("next-intl", () => ({
  useLocale: () => "en-US",
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, string | number>) => `${namespace ? `${namespace}.` : ""}${key}${values ? ` ${Object.values(values).join(" ")}` : ""}`,
}));
vi.mock("@/entities/user", () => ({ useUsersQuery: () => query({ items: [user(1), user(2)], total: 2 }) }));
vi.mock("@/entities/product", () => ({ useProductsQuery: () => query({ items: [product], total: 1 }) }));
vi.mock("@/entities/order", () => ({ useOrdersQuery: () => query({ items: [order], total: 1 }) }));

describe("DashboardWorkflow", () => {
  afterEach(cleanup);

  it("displays canonical aggregates from controlled datasets", () => {
    render(createElement(DashboardWorkflow));
    expect(screen.getByText("2", { selector: "[data-kpi='users']" })).toBeInTheDocument();
    expect(screen.getByText("1", { selector: "[data-kpi='products']" })).toBeInTheDocument();
    expect(screen.getByText("1", { selector: "[data-kpi='orders']" })).toBeInTheDocument();
    expect(screen.getByText("$80.00", { selector: "[data-kpi='revenue']" })).toBeInTheDocument();
    expect(screen.getByText("4.5", { selector: "[data-kpi='rating']" })).toBeInTheDocument();
    expect(screen.getByText("1", { selector: "[data-kpi='lowStock']" })).toBeInTheDocument();
  });
});
