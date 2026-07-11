import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ImgHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Order } from "@/entities/order";

import { OrdersWorkflow } from "./orders-workflow";

const replace = vi.fn();
const order: Order = {
  id: 42,
  customerId: 999,
  customer: null,
  lines: [{ productId: 1, title: "Keyboard", thumbnail: "https://dummyjson.com/a.png", unitPrice: 100, quantity: 2, grossTotal: 200, discountPercentage: 10, discountedTotal: 180 }],
  totalProducts: 1,
  totalQuantity: 2,
  grossTotal: 200,
  discountedTotal: 180,
  status: "shipped",
  placedAt: "2025-04-12T12:00:00.000Z",
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/orders",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => createElement("img", { alt: props.alt, src: props.src }),
}));
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, string | number>) => `${namespace ? `${namespace}.` : ""}${key}${values ? ` ${Object.values(values).join(" ")}` : ""}`,
}));
vi.mock("@/entities/order", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/order")>();
  return { ...actual, useOrdersQuery: () => ({ data: { items: [order], total: 1 }, isError: false, isFetching: false, isPending: false, refetch: vi.fn() }) };
});

describe("OrdersWorkflow", () => {
  beforeEach(() => { replace.mockReset(); vi.useFakeTimers(); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("debounces order search into URL state", () => {
    render(createElement(OrdersWorkflow));
    fireEvent.change(screen.getByLabelText("orders.toolbar.search"), { target: { value: "Keyboard" } });
    act(() => vi.advanceTimersByTime(300));
    expect(replace).toHaveBeenCalledWith("/orders?q=Keyboard", { scroll: false });
  });

  it("renders a missing customer safely and shows transparent totals", () => {
    render(createElement(OrdersWorkflow));
    expect(screen.getByText("orders.unknownCustomer")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("orders.table.detailsFor #ORD-0042"));
    expect(screen.getByRole("dialog")).toHaveTextContent("Keyboard");
    expect(screen.getByRole("dialog")).toHaveTextContent("$180.00");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
