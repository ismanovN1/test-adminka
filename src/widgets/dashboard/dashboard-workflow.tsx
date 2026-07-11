"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Boxes, CircleDollarSign, PackageSearch, RefreshCw, ShoppingCart, Star, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  selectCommerceSummary,
  selectMonthlyOrderMetrics,
  selectOrdersByStatus,
  selectProductCatalogByCategory,
  selectRecentlyIndexed,
  selectTopNWithOther,
  selectTopSellingProducts,
  selectUsersByCountry,
} from "@/entities/analytics";
import { useOrdersQuery } from "@/entities/order";
import { useProductsQuery } from "@/entities/product";
import { useUsersQuery } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

const DashboardCharts = dynamic(() => import("./dashboard-charts"), { ssr: false, loading: () => <ChartsSkeleton /> });

export function DashboardWorkflow() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const usersQuery = useUsersQuery();
  const productsQuery = useProductsQuery();
  const ordersQuery = useOrdersQuery();
  const pending = usersQuery.isPending || productsQuery.isPending || ordersQuery.isPending;
  const hasError = usersQuery.isError || productsQuery.isError || ordersQuery.isError;
  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data?.items]);
  const products = useMemo(() => productsQuery.data?.items ?? [], [productsQuery.data?.items]);
  const orders = useMemo(() => ordersQuery.data?.items ?? [], [ordersQuery.data?.items]);
  const summary = useMemo(() => selectCommerceSummary({ userTotal: usersQuery.data?.total ?? 0, productTotal: productsQuery.data?.total ?? 0, orderTotal: ordersQuery.data?.total ?? 0, products, orders }), [orders, ordersQuery.data?.total, products, productsQuery.data?.total, usersQuery.data?.total]);
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const currency = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }), [locale]);
  const refresh = () => void Promise.all([usersQuery.refetch(), productsQuery.refetch(), ordersQuery.refetch()]);

  if (pending) return <DashboardSkeleton />;
  if (hasError && !usersQuery.data && !productsQuery.data && !ordersQuery.data) return <Card className="space-y-4 border-rose-500/30"><h2 className="text-lg font-semibold">{t("states.errorTitle")}</h2><p className="text-sm text-muted-foreground">{t("states.errorDescription")}</p><Button onClick={refresh}><RefreshCw className="size-4" />{t("states.retry")}</Button></Card>;

  const other = t("charts.other");
  const chartProps = {
    monthly: selectMonthlyOrderMetrics(orders),
    orderStatuses: selectOrdersByStatus(orders).map((item) => ({ ...item, name: t(`status.${item.name}`) })),
    countries: selectTopNWithOther(selectUsersByCountry(users), 5, other),
    categories: selectTopNWithOther(selectProductCatalogByCategory(products), 5, other),
    topProducts: selectTopSellingProducts(orders),
  };
  const kpis = [
    { key: "users", icon: Users, value: number.format(summary.totalUsers) },
    { key: "products", icon: Boxes, value: number.format(summary.totalProducts) },
    { key: "orders", icon: ShoppingCart, value: number.format(summary.totalOrders) },
    { key: "revenue", icon: CircleDollarSign, value: currency.format(summary.totalRevenue) },
    { key: "rating", icon: Star, value: summary.averageProductRating?.toFixed(1) ?? "—" },
    { key: "lowStock", icon: PackageSearch, value: number.format(summary.lowStockProducts) },
  ] as const;

  return <div className="space-y-5">
    {(usersQuery.isFetching || productsQuery.isFetching || ordersQuery.isFetching) ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw className="size-4 animate-spin motion-reduce:animate-none" />{t("states.refreshing")}</p> : null}
    {hasError ? <Card className="flex flex-col gap-3 border-amber-500/30 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">{t("states.partialError")}</p><Button onClick={refresh} variant="secondary">{t("states.retry")}</Button></Card> : null}
    <section aria-label={t("kpiLabel")} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{kpis.map(({ icon: Icon, key, value }) => <Card className="relative min-w-0" key={key}><span className="absolute right-5 top-5 shrink-0 rounded-xl bg-primary-subtle p-2 text-primary-subtle-foreground"><Icon className="size-5" /></span><div className="min-w-0"><p className="pr-12 text-sm text-muted-foreground">{t(`kpis.${key}.label`)}</p><p className="mt-2 whitespace-nowrap font-mono text-lg font-semibold tabular-nums" data-kpi={key}>{value}</p></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{t(`kpis.${key}.context`)}</p></Card>)}</section>
    <DashboardCharts {...chartProps} />
    <section aria-label={t("activity.label")} className="grid gap-4 lg:grid-cols-3"><ActivityCard href="/users" items={selectRecentlyIndexed(users, 5).map((user) => ({ id: user.id, primary: user.fullName, secondary: user.email }))} title={t("activity.users")} /><ActivityCard href="/products" items={selectRecentlyIndexed(products, 5).map((product) => ({ id: product.id, primary: product.title, secondary: product.category }))} title={t("activity.products")} /><ActivityCard href="/orders" items={selectRecentlyIndexed(orders, 5).map((order) => ({ id: order.id, primary: `#ORD-${String(order.id).padStart(4, "0")}`, secondary: order.customer?.fullName ?? t("activity.unknown") }))} title={t("activity.orders")} /></section>
    <p className="text-xs text-muted-foreground">{t("activity.demoNote")}</p>
  </div>;
}

function ActivityCard({ href, items, title }: { href: string; items: { id: number; primary: string; secondary: string }[]; title: string }) {
  const t = useTranslations("dashboard.activity");
  return <Card><div className="flex items-center justify-between"><h2 className="font-semibold">{title}</h2><Link className="text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus" href={href}>{t("viewAll")}</Link></div><ul className="mt-4 divide-y divide-border">{items.map((item) => <li className="py-3 first:pt-0 last:pb-0" key={item.id}><p className="line-clamp-1 text-sm font-medium">{item.primary}</p><p className="line-clamp-1 text-xs text-muted-foreground">{item.secondary}</p></li>)}</ul></Card>;
}

function DashboardSkeleton() { return <div className="space-y-5" aria-busy="true"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <Skeleton className="h-32" key={index} />)}</div><ChartsSkeleton /></div>; }
function ChartsSkeleton() { return <div className="grid gap-4 xl:grid-cols-2"><Skeleton className="h-80 xl:col-span-2" /><Skeleton className="h-80" /><Skeleton className="h-80" /><Skeleton className="h-80" /><Skeleton className="h-80" /></div>; }
