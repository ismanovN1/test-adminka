import { describe, expect, it } from "vitest";

import { profileSchema } from "./profile-schema";

describe("profileSchema", () => {
  it("trims and accepts a valid local profile", () => {
    expect(profileSchema.parse({ firstName: " Ada ", lastName: " Lovelace ", email: "ada@example.com", role: "Administrator" })).toEqual({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", role: "Administrator" });
  });

  it.each([
    { firstName: "", lastName: "Lovelace", email: "ada@example.com", role: "Admin" },
    { firstName: "Ada", lastName: "", email: "ada@example.com", role: "Admin" },
    { firstName: "Ada", lastName: "Lovelace", email: "invalid", role: "Admin" },
    { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", role: "" },
  ])("rejects invalid profile input: %o", (value) => {
    expect(profileSchema.safeParse(value).success).toBe(false);
  });
});
