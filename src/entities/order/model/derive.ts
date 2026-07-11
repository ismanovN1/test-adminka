import { createDemoIsoDate } from "@/shared/config/demo";

import type { OrderStatus } from "./types";

export function deriveOrderStatus(id: number): OrderStatus {
  if (id % 10 === 0) {
    return "cancelled";
  }

  if (id % 4 === 0) {
    return "processing";
  }

  if (id % 3 === 0) {
    return "shipped";
  }

  return "delivered";
}

export function deriveOrderPlacedAt(id: number, userId: number): string {
  const monthIndex = (id * 7 + userId * 3) % 12;
  const day = ((id * 11) % 27) + 1;

  return createDemoIsoDate(monthIndex, day);
}
