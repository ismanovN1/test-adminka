import { describe, expect, it } from "vitest";

import { getActiveNavigation } from "./navigation";

describe("getActiveNavigation", () => {
  it.each([
    ["/", "dashboard"],
    ["/users", "users"],
    ["/users/42", "users"],
    ["/products", "products"],
    ["/orders", "orders"],
    ["/analytics", "analytics"],
    ["/settings", "settings"],
  ])("maps %s to %s", (pathname, key) => {
    expect(getActiveNavigation(pathname)?.key).toBe(key);
  });

  it("does not mark dashboard active for an unknown route", () => {
    expect(getActiveNavigation("/missing")).toBeUndefined();
  });
});
