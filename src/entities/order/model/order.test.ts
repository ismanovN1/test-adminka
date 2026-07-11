import { describe, expect, it } from "vitest";

import { mapUsersResponse } from "@/entities/user";
import { usersResponseSchema } from "@/entities/user/api/schema";
import {
  makeCartDto,
  makeCartsResponse,
  makeUserDto,
  makeUsersResponse,
} from "@/test/fixtures/dummyjson";

import { cartsResponseSchema } from "../api/schema";
import { deriveOrderPlacedAt, deriveOrderStatus } from "./derive";
import { mapCartsResponse } from "./map";

describe("order boundary, joins, and deterministic fields", () => {
  const users = mapUsersResponse(
    usersResponseSchema.parse(makeUsersResponse()),
  ).items;

  it("maps every cart line and joins its customer once", () => {
    const result = mapCartsResponse(
      cartsResponseSchema.parse(makeCartsResponse()),
      users,
    );

    expect(result.items[0]).toMatchObject({
      id: 7,
      customerId: 4,
      customer: {
        id: 4,
        fullName: "Ada Lovelace",
        email: "ada@example.com",
      },
      totalProducts: 1,
      totalQuantity: 2,
      grossTotal: 240,
      discountedTotal: 216,
      status: "delivered",
      placedAt: "2025-02-24T12:00:00.000Z",
    });
    expect(result.items[0]?.lines[0]).toEqual({
      productId: 11,
      title: "Precision Keyboard",
      thumbnail: "https://cdn.example.com/keyboard.png",
      unitPrice: 120,
      quantity: 2,
      grossTotal: 240,
      discountPercentage: 10,
      discountedTotal: 216,
    });
  });

  it("returns a nullable customer for a failed join and safely maps empty lines", () => {
    const dto = cartsResponseSchema.parse(
      makeCartsResponse([
        makeCartDto({
          id: 8,
          userId: 999,
          products: [],
          total: 0,
          discountedTotal: 0,
          totalProducts: 0,
          totalQuantity: 0,
        }),
      ]),
    );
    const order = mapCartsResponse(dto, users).items[0];

    expect(order).toMatchObject({ customer: null, lines: [] });
  });

  it.each([
    makeCartDto({ id: 0 }),
    makeCartDto({ userId: 0 }),
    makeCartDto({ totalQuantity: -1 }),
    makeCartDto({
      products: [
        {
          ...makeCartDto().products[0]!,
          quantity: -1,
        },
      ],
    }),
    makeCartDto({
      products: [
        {
          ...makeCartDto().products[0]!,
          title: "   ",
        },
      ],
    }),
  ])("rejects malformed critical cart fields", (cart) => {
    expect(() => cartsResponseSchema.parse(makeCartsResponse([cart]))).toThrow();
  });

  it("evaluates overlapping status rules in the required order", () => {
    expect([10, 20, 8, 12, 9, 7].map(deriveOrderStatus)).toEqual([
      "cancelled",
      "cancelled",
      "processing",
      "processing",
      "shipped",
      "delivered",
    ]);
    expect(deriveOrderPlacedAt(0, 0)).toBe("2025-01-01T12:00:00.000Z");
    expect(deriveOrderPlacedAt(7, 4)).toBe("2025-02-24T12:00:00.000Z");
  });

  it("does not confuse a duplicate name with the customer id join", () => {
    const duplicate = mapUsersResponse(
      usersResponseSchema.parse(
        makeUsersResponse([makeUserDto(), makeUserDto({ id: 14 })]),
      ),
    ).items;

    expect(
      mapCartsResponse(
        cartsResponseSchema.parse(makeCartsResponse()),
        duplicate,
      ).items[0]?.customer?.id,
    ).toBe(4);
  });
});
