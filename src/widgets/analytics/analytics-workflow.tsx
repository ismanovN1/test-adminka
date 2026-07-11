"use client";

import dynamic from "next/dynamic";
import { CircleDollarSign, RefreshCw, ShoppingCart, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { selectCommerceSummary, selectCumulativeUsers, selectMonthlyOrderMetrics, selectPopularCategories, selectTopNWithOther, selectTopSellingProducts, selectUsersByCountry } from "@/entities/analytics";
import { useOrdersQuery } from "@/entities/order";
import { useProductsQuery } from "@/entities/product";
import { useUsersQuery } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

const AnalyticsCharts = dynamic(() => import("./analytics-charts"), { ssr: false, loading: () => <ChartsSkeleton /> });

export function AnalyticsWorkflow() {
  const t = useTranslations("analytics");
  const locale = useLocale();
  const usersQuery = useUsersQuery(); const productsQuery = useProductsQuery(); const ordersQuery = useOrdersQuery();
  const pending = usersQuery.isPending || productsQuery.isPending || ordersQuery.isPending;
  const hasError = usersQuery.isError || productsQuery.isError || ordersQuery.isError;
  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data?.items]);
  const products = useMemo(() => productsQuery.data?.items ?? [], [productsQuery.data?.items]);
  const orders = useMemo(() => ordersQuery.data?.items ?? [], [ordersQuery.data?.items]);
  const summary = useMemo(() => selectCommerceSummary({ userTotal: usersQuery.data?.total ?? 0, productTotal: productsQuery.data?.total ?? 0, orderTotal: ordersQuery.data?.total ?? 0, products, orders }), [orders, ordersQuery.data?.total, products, productsQuery.data?.total, usersQuery.data?.total]);
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const currency = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }), [locale]);
  const refresh = () => void Promise.all([usersQuery.refetch(), productsQuery.refetch(), ordersQuery.refetch()]);

  if (pending) return <AnalyticsSkeleton />;
  if (hasError && !usersQuery.data && !productsQuery.data && !ordersQuery.data) return <Card className="space-y-4 border-rose-500/30"><h2 className="text-lg font-semibold">{t("states.errorTitle")}</h2><p className="text-sm text-muted-foreground">{t("states.errorDescription")}</p><Button onClick={refresh}><RefreshCw className="size-4" />{t("states.retry")}</Button></Card>;

  const other = t("charts.other");
  return <div className="space-y-5">
    {(usersQuery.isFetching || productsQuery.isFetching || ordersQuery.isFetching) ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw className="size-4 animate-spin motion-reduce:animate-none" />{t("states.refreshing")}</p> : null}
    {hasError ? <Card className="flex flex-col gap-3 border-amber-500/30 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">{t("states.partialError")}</p><Button onClick={refresh} variant="secondary">{t("states.retry")}</Button></Card> : null}
    <section aria-label={t("summaryLabel")} className="grid gap-4 sm:grid-cols-3">{[
      { key: "revenue", icon: CircleDollarSign, value: currency.format(summary.totalRevenue) },
      { key: "orders", icon: ShoppingCart, value: number.format(summary.totalOrders) },
      { key: "users", icon: Users, value: number.format(summary.totalUsers) },
    ].map(({ icon: Icon, key, value }) => <Card key={key}><div className="flex items-center justify-between gap-3"><div><p className="text-sm text-muted-foreground">{t(`summary.${key}`)}</p><p className="mt-2 font-mono text-2xl font-semibold tabular-nums" data-analytics-summary={key}>{value}</p></div><span className="rounded-xl bg-primary-subtle p-2 text-primary-subtle-foreground"><Icon className="size-5" /></span></div></Card>)}</section>
    <AnalyticsCharts categories={selectTopNWithOther(selectPopularCategories(orders, products), 8, other)} countries={selectTopNWithOther(selectUsersByCountry(users), 8, other)} cumulativeUsers={selectCumulativeUsers(users)} monthly={selectMonthlyOrderMetrics(orders)} topProducts={selectTopSellingProducts(orders)} />
  </div>;
}

function AnalyticsSkeleton() { return <div className="space-y-5" aria-busy="true"><div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton className="h-28" key={index} />)}</div><ChartsSkeleton /></div>; }
function ChartsSkeleton() { return <div className="grid gap-5 xl:grid-cols-2"><Skeleton className="h-96 xl:col-span-2" />{Array.from({ length: 4 }, (_, index) => <Skeleton className="h-96" key={index} />)}</div>; }
