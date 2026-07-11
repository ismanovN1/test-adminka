import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ImgHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mapProductsResponse } from "@/entities/product/model/map";
import { productsResponseSchema } from "@/entities/product/api/schema";
import { makeProductDto, makeProductsResponse } from "@/test/fixtures/dummyjson";

import { ProductsWorkflow } from "./products-workflow";

const replace = vi.fn();
let queryMode: "data" | "error" = "data";
const refetchProducts = vi.fn(async () => {
  queryMode = "data";
});
const products = mapProductsResponse(
  productsResponseSchema.parse(
    makeProductsResponse([
      makeProductDto({ id: 1, title: "Desk Lamp", category: "home-decoration" }),
      makeProductDto({ id: 2, title: "Phone", category: "smartphones" }),
    ]),
  ),
).items;

vi.mock("next/navigation", () => ({
  usePathname: () => "/products",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) =>
    createElement("img", { alt: props.alt, onError: props.onError, src: props.src }),
}));
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations:
    (namespace?: string) =>
    (key: string, values?: Record<string, string | number>) =>
      `${namespace ? `${namespace}.` : ""}${key}${values ? ` ${Object.values(values).join(" ")}` : ""}`,
}));
vi.mock("@/entities/product", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/product")>();
  return {
    ...actual,
    useProductsQuery: () => ({
      data: queryMode === "data" ? { items: products, total: products.length } : undefined,
      isError: queryMode === "error",
      isFetching: false,
      isPending: false,
      refetch: refetchProducts,
    }),
  };
});

describe("ProductsWorkflow", () => {
  beforeEach(() => {
    replace.mockReset();
    refetchProducts.mockClear();
    queryMode = "data";
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("debounces catalog search into URL state", () => {
    render(createElement(ProductsWorkflow));
    fireEvent.change(screen.getByLabelText("products.toolbar.search"), { target: { value: "Phone" } });
    act(() => vi.advanceTimersByTime(300));
    expect(replace).toHaveBeenCalledWith("/products?q=Phone", { scroll: false });
  });

  it("opens and escapes from product details", () => {
    render(createElement(ProductsWorkflow));
    fireEvent.click(screen.getByLabelText("products.card.detailsFor Desk Lamp"));
    expect(screen.getByRole("dialog")).toHaveTextContent("Desk Lamp");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("replaces a failed product image without breaking its card", () => {
    render(createElement(ProductsWorkflow));
    fireEvent.error(screen.getByAltText("Desk Lamp"));
    expect(screen.queryByAltText("Desk Lamp")).not.toBeInTheDocument();
    expect(screen.getByText("Desk Lamp", { selector: "h2" })).toBeInTheDocument();
  });

  it("recovers after a simulated retryable query failure", () => {
    queryMode = "error";
    const view = render(createElement(ProductsWorkflow));
    expect(screen.getByText("products.states.errorTitle")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "products.states.retry" }));
    expect(refetchProducts).toHaveBeenCalledOnce();
    view.rerender(createElement(ProductsWorkflow));
    expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
  });
});
