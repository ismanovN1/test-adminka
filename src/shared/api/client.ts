import axios, { type AxiosInstance } from "axios";
import type { ZodType } from "zod";

import { publicEnv } from "@/shared/config/env";

import { normalizeAppError } from "./errors";

export const API_TIMEOUT_MS = 10_000;

export function createApiClient(): AxiosInstance {
  return axios.create({
    baseURL: publicEnv.NEXT_PUBLIC_DUMMYJSON_BASE_URL,
    headers: { Accept: "application/json" },
    timeout: API_TIMEOUT_MS,
  });
}

export const apiClient = createApiClient();

export async function getValidated<T>(
  path: string,
  schema: ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  try {
    const response = await apiClient.get<unknown>(path, { signal });
    return schema.parse(response.data);
  } catch (error) {
    throw normalizeAppError(error);
  }
}
