import { describe, expect, it } from "vitest";

import {
  defaultUsersQueryState,
  parseUsersQueryState,
  serializeUsersQueryState,
  withUsersQueryPatch,
} from "./query-state";

describe("users query state", () => {
  it("sanitizes invalid URL values to defaults", () => {
    const state = parseUsersQueryState(
      new URLSearchParams(
        "q=%20Ada%20&page=-4&pageSize=999&sort=bad&order=sideways&status=active&status=missing&country=&department=Engineering",
      ),
    );

    expect(state).toEqual({
      ...defaultUsersQueryState,
      query: "Ada",
      statuses: ["active"],
      departments: ["Engineering"],
    });
  });

  it("serializes only meaningful non-default values", () => {
    expect(
      serializeUsersQueryState({
        ...defaultUsersQueryState,
        page: 3,
        pageSize: 20,
        sortBy: "name",
        direction: "desc",
        statuses: ["away"],
        countries: ["United States"],
      }),
    ).toBe("page=3&pageSize=20&sort=name&order=desc&status=away&country=United+States");
  });

  it("resets pagination when filters change", () => {
    expect(
      withUsersQueryPatch(
        { ...defaultUsersQueryState, page: 4 },
        { countries: ["Canada"] },
      ).page,
    ).toBe(1);
    expect(
      withUsersQueryPatch({ ...defaultUsersQueryState, page: 4 }, { page: 2 }, false)
        .page,
    ).toBe(2);
  });
});
