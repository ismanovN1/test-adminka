import { describe, expect, it } from "vitest";

import { defaultLocale, isAppLocale } from "./config";

describe("locale config", () => {
  it("accepts only supported locales", () => {
    expect(isAppLocale("ru")).toBe(true);
    expect(isAppLocale("en")).toBe(true);
    expect(isAppLocale("uz")).toBe(false);
    expect(isAppLocale(undefined)).toBe(false);
  });

  it("keeps Russian as the default locale", () => {
    expect(defaultLocale).toBe("ru");
  });
});
