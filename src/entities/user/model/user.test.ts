import { describe, expect, it } from "vitest";

import { makeUserDto, makeUsersResponse } from "@/test/fixtures/dummyjson";

import { usersResponseSchema } from "../api/schema";
import { deriveUserIndexedAt, deriveUserStatus } from "./derive";
import { mapUsersResponse } from "./map";

describe("user boundary and deterministic fields", () => {
  it("parses a documented response and maps a normalized user", () => {
    const parsed = usersResponseSchema.parse(makeUsersResponse());
    const result = mapUsersResponse(parsed);

    expect(result).toEqual({
      total: 1,
      items: [
        expect.objectContaining({
          id: 4,
          fullName: "Ada Lovelace",
          companyName: "Analytical Engines",
          department: "Engineering",
          country: "United Kingdom",
          status: "active",
          indexedAt: "2025-09-26T12:00:00.000Z",
        }),
      ],
    });
  });

  it("tolerates documented optional presentation fields and normalizes blank country", () => {
    const fixture = makeUsersResponse([
      {
        id: 2,
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace@example.com",
        company: { name: "", department: "" },
        address: { country: " " },
      },
    ]);
    const result = mapUsersResponse(usersResponseSchema.parse(fixture));

    expect(result.items[0]).toMatchObject({
      phone: "",
      image: "",
      role: "",
      country: "Unknown",
    });
  });

  it.each([
    [{ ...makeUserDto(), id: 0 }],
    [{ ...makeUserDto(), email: "not-an-email" }],
    [{ ...makeUserDto(), firstName: "" }],
    [{ ...makeUserDto(), firstName: "   " }],
    [{ ...makeUserDto(), lastName: "\t\n" }],
  ])("rejects malformed critical user fields", (user) => {
    expect(() => usersResponseSchema.parse(makeUsersResponse([user]))).toThrow();
  });

  it("evaluates all user status boundaries in canonical order", () => {
    expect([10, 11, 12, 13, 14].map(deriveUserStatus)).toEqual([
      "inactive",
      "inactive",
      "away",
      "away",
      "active",
    ]);
    expect(deriveUserIndexedAt(0)).toBe("2025-01-01T12:00:00.000Z");
    expect(deriveUserIndexedAt(11)).toBe("2025-08-09T12:00:00.000Z");
  });
});
