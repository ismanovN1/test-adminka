"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations();

  return (
    <Card className="mx-auto max-w-2xl text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary-subtle text-primary-subtle-foreground">
        <AlertTriangle aria-hidden="true" className="size-6" />
      </span>
      <h2 className="mt-5 text-xl font-semibold">{t("errors.routeTitle")}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        {t("errors.routeDescription")}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={reset}>{t("common.retry")}</Button>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-focus"
          href="/"
        >
          {t("common.backToDashboard")}
        </Link>
      </div>
    </Card>
  );
}
