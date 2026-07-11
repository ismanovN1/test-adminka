import { describe, expect, it } from "vitest";

import { usersResponseSchema } from "../api/schema";
import { mapUsersResponse } from "./map";
import { runUserListPipeline } from "./pipeline";
import { makeUserDto, makeUsersResponse } from "@/test/fixtures/dummyjson";

const users = mapUsersResponse(
  usersResponseSchema.parse(
    makeUsersResponse([
      makeUserDto({ id: 14 }),
      makeUserDto({ id: 4 }),
      makeUserDto({
        id: 2,
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace@example.com",
        company: { name: "Navy", department: "Research" },
        address: { country: "United States" },
      }),
    ]),
  ),
).items;

describe("runUserListPipeline", () => {
  it("combines normalized search and AND filters before stable sort and pagination", () => {
    const result = runUserListPipeline(users, {
      query: "  ANALYTICAL ",
      statuses: ["active"],
      countries: ["united kingdom"],
      departments: ["ENGINEERING"],
      sortBy: "company",
      direction: "desc",
      page: 2,
      pageSize: 1,
    });

    expect(result.filtered.map((user) => user.id)).toEqual([4, 14]);
    expect(result.items.map((user) => user.id)).toEqual([14]);
    expect(result).toMatchObject({ page: 2, pageSize: 1, total: 2, totalPages: 2 });
  });

  it("searches phone/email and returns an explicit empty page safely", () => {
    expect(runUserListPipeline(users, { query: "555 0100" }).total).toBe(3);
    expect(
      runUserListPipeline(users, { query: "missing", page: 99, pageSize: 0 }),
    ).toMatchObject({ items: [], filtered: [], page: 1, pageSize: 1, total: 0, totalPages: 0 });
  });

  it("falls back to the Users pagination defaults for non-finite inputs", () => {
    expect(
      runUserListPipeline(users, { page: Number.NaN, pageSize: Number.POSITIVE_INFINITY }),
    ).toMatchObject({ page: 1, pageSize: 10, total: 3, totalPages: 1 });
  });
});
