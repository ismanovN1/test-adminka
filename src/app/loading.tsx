"use client";

import { useTranslations } from "next-intl";

import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {
  const t = useTranslations("loading");

  return (
    <div aria-busy="true" aria-label={t("label")} className="grid gap-4">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <span className="sr-only">{t("label")}</span>
    </div>
  );
}
