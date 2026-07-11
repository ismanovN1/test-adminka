"use client";

import { useTranslations } from "next-intl";

import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {
  const t = useTranslations("loading");

  return (
    <div aria-busy="true" aria-label={t("label")} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton className="h-28 w-full rounded-2xl" key={index} />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
      <span className="sr-only">{t("label")}</span>
    </div>
  );
}
