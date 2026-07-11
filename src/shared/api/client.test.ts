import { AxiosHeaders, CanceledError, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { makeUsersResponse } from "@/test/fixtures/dummyjson";

import { API_TIMEOUT_MS, apiClient, createApiClient, getValidated } from "./client";

function response(data: unknown): AxiosResponse<unknown> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}

describe("DummyJSON API client", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses the validated base URL, JSON accept header, and ten-second timeout", () => {
    const client = createApiClient();

    expect(client.defaults.baseURL).toBe("https://dummyjson.com");
    expect(client.defaults.timeout).toBe(API_TIMEOUT_MS);
    expect(client.defaults.headers.Accept).toBe("application/json");
  });

  it("forwards AbortSignal and returns only validated data", async () => {
    const controller = new AbortController();
    const get = vi
      .spyOn(apiClient, "get")
      .mockResolvedValue(response(makeUsersResponse()));
    const schema = z.object({ users: z.array(z.object({ id: z.number() })) });

    const result = await getValidated("/users?limit=0", schema, controller.signal);

    expect(result.users[0]?.id).toBe(4);
    expect(get).toHaveBeenCalledWith("/users?limit=0", {
      signal: controller.signal,
    });
  });

  it("normalizes malformed payloads as non-retryable validation errors", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue(response({ users: "broken" }));

    await expect(
      getValidated("/users?limit=0", z.object({ users: z.array(z.object({})) })),
    ).rejects.toEqual({
      kind: "validation",
      message: "The server returned data in an unexpected format.",
      retryable: false,
    });
  });

  it("normalizes request cancellation without making it retryable", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValue(new CanceledError("aborted"));

    await expect(
      getValidated("/users?limit=0", z.object({})),
    ).rejects.toEqual({
      kind: "network",
      message: "The request was cancelled.",
      retryable: false,
    });
  });
});
