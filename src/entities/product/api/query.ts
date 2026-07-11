import { queryOptions } from "@tanstack/react-query";

import { getValidated } from "@/shared/api/client";

import { mapProductsResponse } from "../model/map";
import { productsResponseSchema } from "./schema";

export const productQueryKeys = {
  all: ["products"] as const,
  full: () => [...productQueryKeys.all, "full"] as const,
};

export async function fetchProducts(signal?: AbortSignal) {
  const dto = await getValidated(
    "/products?limit=0",
    productsResponseSchema,
    signal,
  );
  return mapProductsResponse(dto);
}

export function productQueryOptions() {
  return queryOptions({
    queryKey: productQueryKeys.full(),
    queryFn: ({ signal }) => fetchProducts(signal),
  });
}
