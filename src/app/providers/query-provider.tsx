"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { normalizeAppError } from "@/shared/api/errors";

const FIVE_MINUTES = 5 * 60 * 1_000;
const THIRTY_MINUTES = 30 * 60 * 1_000;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: THIRTY_MINUTES,
        retry: (failureCount, error) =>
          failureCount < 1 && normalizeAppError(error).retryable,
        retryDelay: (attemptIndex) => Math.min(1_000 * 2 ** attemptIndex, 3_000),
        staleTime: FIVE_MINUTES,
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
