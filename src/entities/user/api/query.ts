import { queryOptions } from "@tanstack/react-query";

import { getValidated } from "@/shared/api/client";

import { mapUsersResponse } from "../model/map";
import { usersResponseSchema } from "./schema";

export const userQueryKeys = {
  all: ["users"] as const,
  full: () => [...userQueryKeys.all, "full"] as const,
};

export async function fetchUsers(signal?: AbortSignal) {
  const dto = await getValidated("/users?limit=0", usersResponseSchema, signal);
  return mapUsersResponse(dto);
}

export function userQueryOptions() {
  return queryOptions({
    queryKey: userQueryKeys.full(),
    queryFn: ({ signal }) => fetchUsers(signal),
  });
}
