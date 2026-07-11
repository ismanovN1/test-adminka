import { describe, expect, it } from "vitest";

import { usersResponseSchema } from "@/entities/user/api/schema";
import { mapUsersResponse } from "@/entities/user/model/map";
import {
  makeCartDto,
  makeCartsResponse,
  makeUserDto,
  makeUsersResponse,
} from "@/test/fixtures/dummyjson";

import { cartsResponseSchema } from "../api/schema";
import { mapCartsResponse } from "./map";
import { runOrderListPipeline } from "./pipeline";

const users = mapUsersResponse(
  usersResponseSchema.parse(
    makeUsersResponse([
      makeUserDto(),
      makeUserDto({
        id: 5,
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace@example.com",
      }),
    ]),
  ),
).items;

const orders = mapCartsResponse(
  cartsResponseSchema.parse(
    makeCartsResponse([
      makeCartDto({ id: 17 }),
      makeCartDto({ id: 7 }),
      makeCartDto({
        id: 8,
        userId: 5,
        products: [
          {
            ...makeCartDto().products[0]!,
            id: 30,
            title: "Desk Lamp",
          },
        ],
        discountedTotal: 50,
      }),
    ]),
  ),
  users,
).items;

describe("runOrderListPipeline", () => {
  it("combines customer/product search, status and inclusive date filters", () => {
    const result = runOrderListPipeline(orders, {
      query: "keyboard",
      statuses: ["delivered"],
      from: "2025-02-24",
      to: "2025-12-26",
      sortBy: "total",
      direction: "desc",
      page: 2,
      pageSize: 1,
    });

    expect(result.filtered.map((order) => order.id)).toEqual([7, 17]);
    expect(result.items[0]?.id).toBe(17);
  });

  it("finds formatted ids and safely ignores invalid date boundaries", () => {
    expect(runOrderListPipeline(orders, { query: "#ORD-0008" }).items[0]?.id).toBe(8);
    expect(runOrderListPipeline(orders, { from: "invalid", to: "invalid" }).total).toBe(3);
  });

  it("handles missing-customer search and empty input without crashing", () => {
    const missingJoin = mapCartsResponse(
      cartsResponseSchema.parse(
        makeCartsResponse([makeCartDto({ userId: 999 })]),
      ),
      users,
    ).items;

    expect(runOrderListPipeline(missingJoin, { query: "keyboard" }).total).toBe(1);
    expect(runOrderListPipeline([], { page: 9 })).toMatchObject({
      items: [],
      page: 1,
      total: 0,
      totalPages: 0,
    });
  });

  it("falls back to the Orders pagination defaults for non-finite inputs", () => {
    expect(
      runOrderListPipeline(orders, {
        page: Number.NEGATIVE_INFINITY,
        pageSize: Number.POSITIVE_INFINITY,
      }),
    ).toMatchObject({ page: 1, pageSize: 10, total: 3, totalPages: 1 });
  });
});
