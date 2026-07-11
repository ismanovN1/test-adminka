import { queryOptions } from "@tanstack/react-query";

import { fetchUsers, userQueryOptions } from "@/entities/user/api/query";
import { getValidated } from "@/shared/api/client";

import { mapCartsResponse } from "../model/map";
import { cartsResponseSchema } from "./schema";

export const orderQueryKeys = {
  all: ["orders"] as const,
  full: () => [...orderQueryKeys.all, "full"] as const,
};

export async function fetchOrders(signal?: AbortSignal) {
  const [dto, users] = await Promise.all([
    getValidated("/carts?limit=0", cartsResponseSchema, signal),
    fetchUsers(signal),
  ]);

  return mapCartsResponse(dto, users.items);
}

export function orderQueryOptions() {
  return queryOptions({
    queryKey: orderQueryKeys.full(),
    queryFn: async ({ client, signal }) => {
      const [dto, users] = await Promise.all([
        getValidated("/carts?limit=0", cartsResponseSchema, signal),
        client.ensureQueryData(userQueryOptions()),
      ]);

      return mapCartsResponse(dto, users.items);
    },
  });
}
