import { AxiosError, AxiosHeaders, CanceledError } from "axios";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { normalizeAppError } from "./errors";

describe("normalizeAppError", () => {
  it("marks server failures as retryable HTTP errors", () => {
    const response = {
      status: 503,
      statusText: "Service Unavailable",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: null,
    };
    const error = new AxiosError(
      "request failed",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      response,
    );

    expect(normalizeAppError(error)).toMatchObject({
      kind: "http",
      status: 503,
      retryable: true,
    });
  });

  it.each([408, 429])(
    "does not retry HTTP %i because every 4xx is terminal",
    (status) => {
      const response = {
        status,
        statusText: "Client Error",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: null,
      };

      expect(
        normalizeAppError(
          new AxiosError(
            "request failed",
            "ERR_BAD_REQUEST",
            undefined,
            undefined,
            response,
          ),
        ),
      ).toMatchObject({ kind: "http", status, retryable: false });
    },
  );

  it("does not retry invalid remote data", () => {
    const result = z.object({ id: z.number() }).safeParse({ id: "1" });

    if (result.success) {
      throw new Error("Fixture must produce a validation error");
    }

    expect(normalizeAppError(result.error)).toMatchObject({
      kind: "validation",
      retryable: false,
    });
  });

  it("classifies timeouts, cancellations, ordinary networks and client HTTP failures", () => {
    expect(
      normalizeAppError(new AxiosError("timeout", "ECONNABORTED")),
    ).toMatchObject({ kind: "timeout", retryable: true });
    expect(normalizeAppError(new CanceledError())).toMatchObject({
      kind: "network",
      retryable: false,
    });
    expect(normalizeAppError(new AxiosError("offline", "ERR_NETWORK"))).toMatchObject({
      kind: "network",
      retryable: true,
    });

    const response = {
      status: 404,
      statusText: "Not Found",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: null,
    };
    expect(
      normalizeAppError(
        new AxiosError("missing", "ERR_BAD_REQUEST", undefined, undefined, response),
      ),
    ).toMatchObject({ kind: "http", status: 404, retryable: false });
  });

  it("preserves an already normalized serializable error", () => {
    const appError = {
      kind: "validation" as const,
      message: "invalid",
      retryable: false,
    };

    expect(normalizeAppError(appError)).toBe(appError);
  });
});
