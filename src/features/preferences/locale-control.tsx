"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  localeCookieName,
  type AppLocale,
} from "@/shared/i18n/config";
import { Button } from "@/shared/ui/button";

export function LocaleControl() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const nextLocale: AppLocale = locale === "ru" ? "en" : "ru";

  function changeLocale() {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale;
    startTransition(() => router.refresh());
  }

  return (
    <Button
      aria-label={t("locale.current", { locale: t(`locale.${locale}`) })}
      className="relative size-11 shrink-0 px-0"
      disabled={isPending}
      onClick={changeLocale}
      title={t("common.changeLanguage")}
      variant="ghost"
    >
      <Languages aria-hidden="true" className="size-5" />
      <span
        aria-hidden="true"
        className="absolute right-0.5 top-0.5 rounded-full bg-primary px-1 py-px text-[9px] font-bold leading-3 text-primary-foreground"
      >
        {locale.toUpperCase()}
      </span>
      <span className="sr-only">{t(`locale.${nextLocale}`)}</span>
    </Button>
  );
}
