import { describe, expect, it } from "vitest";

import {
  defaultProductsQueryState,
  parseProductsQueryState,
  serializeProductsQueryState,
  withProductsQueryPatch,
} from "./query-state";

describe("products query state", () => {
  it("sanitizes invalid numeric and enum values", () => {
    const state = parseProductsQueryState(
      new URLSearchParams("page=-1&pageSize=13&sort=nope&minPrice=-2&maxPrice=x&minRating=5"),
    );
    expect(state).toEqual(defaultProductsQueryState);
  });

  it("round-trips meaningful state and omits defaults", () => {
    const state = parseProductsQueryState(
      new URLSearchParams(
        "q=phone&page=2&pageSize=24&sort=price&order=desc&category=beauty&minPrice=10&maxPrice=90&minRating=4.5",
      ),
    );
    expect(parseProductsQueryState(new URLSearchParams(serializeProductsQueryState(state)))).toEqual(state);
    expect(serializeProductsQueryState(defaultProductsQueryState)).toBe("");
  });

  it("resets pagination when list controls change", () => {
    expect(withProductsQueryPatch({ ...defaultProductsQueryState, page: 4 }, { query: "x" }).page).toBe(1);
  });
});
