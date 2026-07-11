import axios from "axios";
import { ZodError } from "zod";

export type AppErrorKind =
  | "network"
  | "timeout"
  | "http"
  | "validation"
  | "unknown";

export interface AppError {
  kind: AppErrorKind;
  message: string;
  status?: number;
  retryable: boolean;
}

export function isAppError(error: unknown): error is AppError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as Partial<AppError>;
  const kinds: readonly AppErrorKind[] = [
    "network",
    "timeout",
    "http",
    "validation",
    "unknown",
  ];

  return (
    candidate.kind !== undefined &&
    kinds.includes(candidate.kind) &&
    typeof candidate.message === "string" &&
    typeof candidate.retryable === "boolean" &&
    (candidate.status === undefined || typeof candidate.status === "number")
  );
}

export function normalizeAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return {
      kind: "validation",
      message: "The server returned data in an unexpected format.",
      retryable: false,
    };
  }

  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_CANCELED") {
      return {
        kind: "network",
        message: "The request was cancelled.",
        retryable: false,
      };
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return {
        kind: "timeout",
        message: "The request took too long. Please try again.",
        retryable: true,
      };
    }

    if (!error.response) {
      return {
        kind: "network",
        message: "A network connection could not be established.",
        retryable: true,
      };
    }

    const status = error.response.status;

    return {
      kind: "http",
      message: "The service could not complete the request.",
      status,
      retryable: status >= 500,
    };
  }

  return {
    kind: "unknown",
    message: "An unexpected error occurred.",
    retryable: false,
  };
}
