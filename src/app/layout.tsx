import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { getAppLocale, getAppMessages } from "@/shared/i18n/server";
import { AppShell } from "@/widgets/app-shell/app-shell";

import { AppProviders } from "./providers/app-providers";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Test Admin",
    template: "%s · Test Admin",
  },
  description: "Responsive commerce analytics administration interface.",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getAppLocale();
  const messages = getAppMessages(locale);

  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable}`}
      lang={locale}
      suppressHydrationWarning
    >
      <body>
        <AppProviders locale={locale} messages={messages}>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
