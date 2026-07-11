"use client";

import { useQuery } from "@tanstack/react-query";

import { orderQueryOptions } from "./query";

export function useOrdersQuery() {
  return useQuery(orderQueryOptions());
}
