"use client";

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import type { AppLocale } from "@/shared/i18n/config";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

interface AppProvidersProps {
  children: ReactNode;
  locale: AppLocale;
  messages: Record<string, unknown>;
}

export function AppProviders({ children, locale, messages }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        <QueryProvider>{children}</QueryProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
