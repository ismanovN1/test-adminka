"use client";

import { useQuery } from "@tanstack/react-query";

import { userQueryOptions } from "./query";

export function useUsersQuery() {
  return useQuery(userQueryOptions());
}
