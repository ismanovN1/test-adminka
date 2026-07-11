"use client";

import { Compass } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Card } from "@/shared/ui/card";

export default function NotFound() {
  const t = useTranslations();

  return (
    <Card className="mx-auto max-w-2xl text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary-subtle text-primary-subtle-foreground">
        <Compass aria-hidden="true" className="size-6" />
      </span>
      <p className="mt-5 font-mono text-sm font-semibold text-primary">404</p>
      <h2 className="mt-2 text-2xl font-semibold">{t("errors.notFoundTitle")}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        {t("errors.notFoundDescription")}
      </p>
      <Link
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        href="/"
      >
        {t("common.backToDashboard")}
      </Link>
    </Card>
  );
}
