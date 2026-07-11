import { describe, expect, it } from "vitest";

import { usersResponseSchema } from "../api/schema";
import { makeUsersCsv, makeUsersCsvFileName } from "./csv";
import { mapUsersResponse } from "./map";
import { makeUserDto, makeUsersResponse } from "@/test/fixtures/dummyjson";

describe("users CSV export", () => {
  it("uses the canonical header order, BOM, escaping, and formula defense", () => {
    const users = mapUsersResponse(
      usersResponseSchema.parse(
        makeUsersResponse([
          makeUserDto({
            id: 2,
            firstName: "=Ada",
            lastName: 'Love"lace',
            email: "ada@example.com",
            phone: "+1 555 0100",
            company: { name: "Analytical, Engines", department: "@Research" },
            address: { country: "United Kingdom" },
          }),
        ]),
      ),
    ).items;

    expect(makeUsersCsv(users)).toBe(
      "\uFEFFID,Full Name,Email,Phone,Company,Department,Country,Status\r\n" +
        "2,\"'=Ada Love\"\"lace\",ada@example.com,'+1 555 0100,\"Analytical, Engines\",'@Research,United Kingdom,away\r\n",
    );
  });

  it("builds a local-date file name", () => {
    expect(makeUsersCsvFileName(new Date(2025, 6, 9))).toBe("users-2025-07-09.csv");
  });
});
