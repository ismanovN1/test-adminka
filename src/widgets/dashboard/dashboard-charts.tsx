"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import type { MonthlyOrderMetric, NamedValue, TopProductMetric } from "@/entities/analytics";
import { Card } from "@/shared/ui/card";

const colors = ["var(--primary)", "var(--success)", "#f59e0b", "#e11d48", "#0ea5e9", "#8b5cf6"];

export interface DashboardChartsProps {
  monthly: MonthlyOrderMetric[];
  orderStatuses: NamedValue[];
  countries: NamedValue[];
  categories: NamedValue[];
  topProducts: TopProductMetric[];
}

export default function DashboardCharts(props: DashboardChartsProps) {
  const t = useTranslations("dashboard.charts");
  const locale = useLocale();
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2025, index, 1)))), [locale]);
  const currency = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }), [locale]);
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const monthly = props.monthly.map((item) => ({ ...item, month: months[item.monthIndex] }));

  return <div className="grid gap-4 xl:grid-cols-2">
    <ChartCard className="xl:col-span-2" description={t("revenueDescription")} summary={t("revenueSummary", { value: currency.format(Math.max(...props.monthly.map((item) => item.revenue), 0)) })} title={t("revenueTitle")}>
      <ResponsiveContainer height="100%" width="100%"><AreaChart data={monthly} margin={{ left: 4, right: 12, top: 8 }}><defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} /><stop offset="95%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} /><YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(value) => currency.format(Number(value))} width={72} /><Tooltip formatter={(value) => currency.format(Number(value))} labelStyle={{ color: "var(--foreground)" }} contentStyle={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: 12 }} /><Area dataKey="revenue" fill="url(#revenue-fill)" name={t("revenueSeries")} stroke="var(--primary)" strokeWidth={2} type="monotone" /></AreaChart></ResponsiveContainer>
    </ChartCard>
    <ChartCard description={t("statusDescription")} summary={namedSummary(props.orderStatuses, number, t("emptySummary"))} title={t("statusTitle")}>
      <ResponsiveContainer height="100%" width="100%"><BarChart data={props.orderStatuses} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} /><XAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} type="number" /><YAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} type="category" width={82} /><Tooltip contentStyle={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: 12 }} /><Bar dataKey="value" fill="var(--primary)" name={t("ordersSeries")} radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer>
    </ChartCard>
    <ChartCard description={t("countryDescription")} summary={namedSummary(props.countries, number, t("emptySummary"))} title={t("countryTitle")}>
      <Donut data={props.countries} />
    </ChartCard>
    <ChartCard description={t("categoryDescription")} summary={namedSummary(props.categories, number, t("emptySummary"))} title={t("categoryTitle")}>
      <Donut data={props.categories} />
    </ChartCard>
    <ChartCard description={t("productsDescription")} summary={props.topProducts[0] ? `${props.topProducts[0].title}: ${number.format(props.topProducts[0].quantity)}` : t("emptySummary")} title={t("productsTitle")}>
      <ResponsiveContainer height="100%" width="100%"><BarChart data={props.topProducts.slice(0, 5)} layout="vertical" margin={{ left: 8, right: 12 }}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} /><XAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} type="number" /><YAxis dataKey="title" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value) => String(value).slice(0, 18)} type="category" width={120} /><Tooltip formatter={(value) => number.format(Number(value))} contentStyle={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: 12 }} /><Bar dataKey="quantity" fill="var(--success)" name={t("quantitySeries")} radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer>
    </ChartCard>
  </div>;
}

function Donut({ data }: { data: NamedValue[] }) {
  return <ResponsiveContainer height="100%" width="100%"><PieChart><Pie data={data} dataKey="value" innerRadius="48%" nameKey="name" outerRadius="76%" paddingAngle={2}>{data.map((item, index) => <Cell fill={colors[index % colors.length]} key={item.name} />)}</Pie><Tooltip contentStyle={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: 12 }} /></PieChart></ResponsiveContainer>;
}

function ChartCard({ children, className = "", description, summary, title }: { children: React.ReactNode; className?: string; description: string; summary: string; title: string }) {
  return <Card className={`${className} min-w-0`}><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p><div aria-label={title} className="mt-4 h-72 min-w-0" role="img">{children}</div><p className="sr-only">{summary}</p></Card>;
}

function namedSummary(data: NamedValue[], formatter: Intl.NumberFormat, empty: string) {
  return data[0] ? `${data[0].name}: ${formatter.format(data[0].value)}` : empty;
}
