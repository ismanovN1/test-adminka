import { createDemoIsoDate } from "@/shared/config/demo";

import type { UserStatus } from "./types";

export function deriveUserStatus(id: number): UserStatus {
  const remainder = id % 10;

  if (remainder === 0 || remainder === 1) {
    return "inactive";
  }

  if (remainder === 2 || remainder === 3) {
    return "away";
  }

  return "active";
}

export function deriveUserIndexedAt(id: number): string {
  const monthIndex = (id * 5) % 12;
  const day = ((id * 13) % 27) + 1;

  return createDemoIsoDate(monthIndex, day);
}
