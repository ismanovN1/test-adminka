import { describe, expect, it } from "vitest";

import { defaultOrdersQueryState, parseOrdersQueryState, serializeOrdersQueryState, withOrdersQueryPatch } from "./query-state";

describe("orders query state", () => {
  it("sanitizes invalid values", () => {
    expect(parseOrdersQueryState(new URLSearchParams("page=0&pageSize=9&sort=no&status=lost&from=nope&to=2025-14-99"))).toEqual(defaultOrdersQueryState);
  });

  it("round-trips valid shareable state", () => {
    const state = parseOrdersQueryState(new URLSearchParams("q=alice&page=2&pageSize=20&sort=total&order=asc&status=shipped&from=2025-01-01&to=2025-12-31"));
    expect(parseOrdersQueryState(new URLSearchParams(serializeOrdersQueryState(state)))).toEqual(state);
  });

  it("resets page for filter changes", () => {
    expect(withOrdersQueryPatch({ ...defaultOrdersQueryState, page: 3 }, { status: "delivered" }).page).toBe(1);
  });
});
