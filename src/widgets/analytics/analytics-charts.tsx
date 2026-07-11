"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, type ReactNode } from "react";

import type { MonthlyOrderMetric, MonthlyUserMetric, NamedValue, TopProductMetric } from "@/entities/analytics";
import { Card } from "@/shared/ui/card";

const colors = ["var(--primary)", "var(--success)", "#f59e0b", "#e11d48", "#0ea5e9", "#8b5cf6", "#14b8a6", "#f97316", "#64748b"];

export interface AnalyticsChartsProps {
  monthly: MonthlyOrderMetric[];
  cumulativeUsers: MonthlyUserMetric[];
  categories: NamedValue[];
  countries: NamedValue[];
  topProducts: TopProductMetric[];
}

export default function AnalyticsCharts({ categories, countries, cumulativeUsers, monthly, topProducts }: AnalyticsChartsProps) {
  const t = useTranslations("analytics.charts");
  const locale = useLocale();
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2025, index, 1)))), [locale]);
  const currency = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }), [locale]);
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const trend = monthly.map((item) => ({ ...item, month: months[item.monthIndex] }));
  const users = cumulativeUsers.map((item) => ({ ...item, month: months[item.monthIndex] }));

  return <div className="grid gap-5 xl:grid-cols-2">
    <ChartCard className="xl:col-span-2" description={t("trend.description")} insight={t("trend.insight")} summary={t("trend.summary", { revenue: currency.format(Math.max(...monthly.map((item) => item.revenue), 0)), orders: number.format(Math.max(...monthly.map((item) => item.orderCount), 0)) })} title={t("trend.title")}>
      <ResponsiveContainer height="100%" width="100%"><ComposedChart data={trend} margin={{ left: 4, right: 12, top: 8 }}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} /><YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value) => currency.format(Number(value))} width={72} yAxisId="revenue" /><YAxis allowDecimals={false} orientation="right" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={32} yAxisId="orders" /><Tooltip formatter={(value, name) => name === t("trend.orders") ? number.format(Number(value)) : currency.format(Number(value))} contentStyle={tooltipStyle} /><Area dataKey="revenue" fill="var(--primary-glow)" name={t("trend.revenue")} stroke="var(--primary)" strokeWidth={2} type="monotone" yAxisId="revenue" /><Line dataKey="orderCount" dot={false} name={t("trend.orders")} stroke="var(--success)" strokeWidth={2} type="monotone" yAxisId="orders" /></ComposedChart></ResponsiveContainer>
    </ChartCard>
    <ChartCard description={t("users.description")} insight={t("users.insight")} summary={users.at(-1) ? t("users.summary", { value: number.format(users.at(-1)?.cumulativeUsers ?? 0) }) : t("empty")} title={t("users.title")}>
      <ResponsiveContainer height="100%" width="100%"><LineChart data={users} margin={{ left: 4, right: 12, top: 8 }}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={38} /><Tooltip formatter={(value) => number.format(Number(value))} contentStyle={tooltipStyle} /><Line dataKey="cumulativeUsers" dot={false} name={t("users.series")} stroke="var(--primary)" strokeWidth={3} type="monotone" /></LineChart></ResponsiveContainer>
    </ChartCard>
    <ChartCard description={t("categories.description")} insight={t("categories.insight")} summary={leadingSummary(categories, number, t("empty"))} title={t("categories.title")}>
      <ResponsiveContainer height="100%" width="100%"><BarChart data={categories} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} /><XAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} type="number" /><YAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(value) => String(value).slice(0, 16)} type="category" width={112} /><Tooltip formatter={(value) => number.format(Number(value))} contentStyle={tooltipStyle} /><Bar dataKey="value" fill="var(--success)" name={t("categories.series")} radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer>
    </ChartCard>
    <ChartCard description={t("countries.description")} insight={t("countries.insight")} summary={leadingSummary(countries, number, t("empty"))} title={t("countries.title")}>
      <ResponsiveContainer height="100%" width="100%"><PieChart><Pie data={countries} dataKey="value" innerRadius="45%" nameKey="name" outerRadius="75%" paddingAngle={2}>{countries.map((item, index) => <Cell fill={colors[index % colors.length]} key={item.name} />)}</Pie><Tooltip formatter={(value) => number.format(Number(value))} contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer>
    </ChartCard>
    <ChartCard description={t("products.description")} insight={t("products.insight")} summary={topProducts[0] ? `${topProducts[0].title}: ${number.format(topProducts[0].quantity)}, ${currency.format(topProducts[0].revenue)}` : t("empty")} title={t("products.title")}>
      <ResponsiveContainer height="100%" width="100%"><BarChart data={topProducts.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} /><XAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} type="number" /><YAxis dataKey="title" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(value) => String(value).slice(0, 16)} type="category" width={112} /><Tooltip formatter={(value, name, item) => name === t("products.quantity") ? number.format(Number(value)) : currency.format(Number(item.payload.revenue))} contentStyle={tooltipStyle} /><Bar dataKey="quantity" fill="var(--primary)" name={t("products.quantity")} radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer>
    </ChartCard>
  </div>;
}

const tooltipStyle = { background: "var(--surface)", borderColor: "var(--border)", borderRadius: 12 };

function ChartCard({ children, className = "", description, insight, summary, title }: { children: ReactNode; className?: string; description: string; insight: string; summary: string; title: string }) {
  return <Card className={`${className} min-w-0`}><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p><div aria-label={title} className="mt-4 h-80 min-w-0" role="img">{children}</div><p className="mt-3 rounded-xl bg-muted p-3 text-sm leading-6 text-muted-foreground">{insight}</p><p className="sr-only">{summary}</p></Card>;
}

function leadingSummary(values: NamedValue[], number: Intl.NumberFormat, empty: string) {
  return values[0] ? `${values[0].name}: ${number.format(values[0].value)}` : empty;
}
