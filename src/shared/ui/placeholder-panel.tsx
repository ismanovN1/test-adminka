"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/shared/ui/card";

export function PlaceholderPanel() {
  const t = useTranslations("pages");

  return (
    <Card className="relative overflow-hidden p-0">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-subtle text-primary-subtle-foreground">
            <CheckCircle2 aria-hidden="true" className="size-5" />
          </span>
          <h2 className="mt-5 text-xl font-semibold tracking-tight">{t("placeholderTitle")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t("placeholderDescription")}
          </p>
        </div>
        <ArrowRight aria-hidden="true" className="hidden size-6 text-muted-foreground lg:block" />
      </div>
    </Card>
  );
}
