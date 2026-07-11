"use client";

import { useQuery } from "@tanstack/react-query";

import { productQueryOptions } from "./query";

export function useProductsQuery() {
  return useQuery(productQueryOptions());
}
