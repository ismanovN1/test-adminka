"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Eye, ImageOff, RefreshCw, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { runOrderListPipeline, useOrdersQuery, type Order, type OrderLine, type OrderStatus } from "@/entities/order";
import {
  defaultOrdersQueryState,
  orderPageSizes,
  orderStatuses,
  parseOrdersQueryState,
  serializeOrdersQueryState,
  withOrdersQueryPatch,
  type OrdersQueryState,
} from "@/features/orders/model/query-state";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";

function orderLabel(id: number) {
  return `#ORD-${String(id).padStart(4, "0")}`;
}

function statusClass(status: OrderStatus) {
  if (status === "delivered") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (status === "shipped") return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  if (status === "processing") return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
}

function OrdersSkeleton() {
  return <Card className="space-y-4" aria-busy="true"><div className="grid gap-3 lg:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <Skeleton className="h-11" key={index} />)}</div>{Array.from({ length: 8 }, (_, index) => <Skeleton className="h-16" key={index} />)}</Card>;
}

export function OrdersWorkflow() {
  const t = useTranslations("orders");
  const locale = useLocale();
  const query = useOrdersQuery();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const state = useMemo(() => parseOrdersQueryState(params), [params]);
  const [searchDraft, setSearchDraft] = useState(state.query);
  const [selected, setSelected] = useState<Order | null>(null);
  const currency = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }), [locale]);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }), [locale]);

  const replaceState = useCallback((next: OrdersQueryState) => {
    const serialized = serializeOrdersQueryState(next);
    router.replace(serialized ? `${pathname}?${serialized}` : pathname, { scroll: false });
  }, [pathname, router]);
  const updateState = useCallback((patch: Partial<OrdersQueryState>, resetPage = true) => replaceState(withOrdersQueryPatch(state, patch, resetPage)), [replaceState, state]);

  useEffect(() => setSearchDraft(state.query), [state.query]);
  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (searchDraft.trim() !== state.query) updateState({ query: searchDraft.trim() });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchDraft, state.query, updateState]);

  const orders = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const result = useMemo(() => runOrderListPipeline(orders, {
    query: state.query,
    statuses: state.status ? [state.status] : [],
    from: state.from || undefined,
    to: state.to || undefined,
    sortBy: state.sortBy,
    direction: state.direction,
    page: state.page,
    pageSize: state.pageSize,
  }), [orders, state]);
  useEffect(() => {
    if (result.page !== state.page) updateState({ page: result.page }, false);
  }, [result.page, state.page, updateState]);

  const invalidRange = state.from !== "" && state.to !== "" && state.from > state.to;
  const clearFilters = () => { setSearchDraft(""); replaceState(defaultOrdersQueryState); };
  const hasFilters = serializeOrdersQueryState({ ...state, page: 1 }) !== "";

  if (query.isPending) return <OrdersSkeleton />;
  if (query.isError && !query.data) return <StateCard action={<Button onClick={() => void query.refetch()}><RefreshCw className="size-4" />{t("states.retry")}</Button>} description={t("states.errorDescription")} title={t("states.errorTitle")} />;
  if (orders.length === 0) return <StateCard description={t("states.remoteEmptyDescription")} title={t("states.remoteEmptyTitle")} />;

  return <section className="space-y-4" aria-label={t("label")}>
    <p aria-live="polite" className="sr-only">{t("results", { count: invalidRange ? 0 : result.total })}</p>
    <Card className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 xl:items-end">
        <label className="flex flex-col gap-1 text-sm font-medium xl:col-span-2">{t("toolbar.search")}<span className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" onChange={(event) => setSearchDraft(event.target.value)} placeholder={t("toolbar.searchPlaceholder")} value={searchDraft} /></span></label>
        <Select label={t("toolbar.status")} onChange={(value) => updateState({ status: value as OrdersQueryState["status"] })} value={state.status}><option value="">{t("toolbar.all")}</option>{orderStatuses.map((status) => <option key={status} value={status}>{t(`status.${status}`)}</option>)}</Select>
        <label className="flex flex-col gap-1 text-sm font-medium">{t("toolbar.from")}<Input max="2025-12-31" min="2025-01-01" onChange={(event) => updateState({ from: event.target.value })} type="date" value={state.from} /></label>
        <label className="flex flex-col gap-1 text-sm font-medium">{t("toolbar.to")}<Input max="2025-12-31" min="2025-01-01" onChange={(event) => updateState({ to: event.target.value })} type="date" value={state.to} /></label>
        <Select label={t("toolbar.sort")} onChange={(value) => { const [sortBy, direction] = value.split(":") as [OrdersQueryState["sortBy"], OrdersQueryState["direction"]]; updateState({ sortBy, direction }); }} value={`${state.sortBy}:${state.direction}`}>
          {(["id:desc", "id:asc", "customer:asc", "quantity:desc", "total:desc", "total:asc", "status:asc", "date:desc", "date:asc"] as const).map((option) => <option key={option} value={option}>{t(`sort.${option.replace(":", "_")}`)}</option>)}
        </Select>
      </div>
      {invalidRange ? <p className="text-sm text-rose-600" role="alert">{t("toolbar.dateError")}</p> : null}
      {hasFilters ? <Button onClick={clearFilters} variant="ghost"><X className="size-4" />{t("toolbar.clear")}</Button> : null}
    </Card>

    {query.isFetching ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw className="size-4 animate-spin motion-reduce:animate-none" />{t("states.refreshing")}</p> : null}

    {invalidRange || result.total === 0 ? <StateCard action={<Button onClick={clearFilters} variant="secondary">{t("states.clearFilters")}</Button>} description={invalidRange ? t("states.invalidRangeDescription") : t("states.filteredEmptyDescription")} title={t("states.filteredEmptyTitle")} /> : <Card className="p-0"><div aria-label={t("table.scroll")} className="overflow-x-auto" tabIndex={0}><table className="w-full min-w-[68rem] border-collapse text-sm"><thead><tr className="border-b border-border text-left text-muted-foreground"><th className="px-4 py-3" scope="col">{t("table.order")}</th><th className="px-4 py-3" scope="col">{t("table.customer")}</th><th className="px-4 py-3" scope="col">{t("table.products")}</th><th className="px-4 py-3 text-right" scope="col">{t("table.quantity")}</th><th className="px-4 py-3 text-right" scope="col">{t("table.total")}</th><th className="px-4 py-3" scope="col">{t("table.status")}</th><th className="px-4 py-3" scope="col">{t("table.date")}</th><th className="px-4 py-3" scope="col">{t("table.actions")}</th></tr></thead><tbody>{result.items.map((order) => <tr className="border-b border-border/70 last:border-0 hover:bg-muted/50" key={order.id}><td className="px-4 py-3 font-mono font-medium">{orderLabel(order.id)}</td><td className="px-4 py-3"><p className="font-medium">{order.customer?.fullName ?? t("unknownCustomer")}</p><p className="text-xs text-muted-foreground">{order.customer?.email ?? t("missingJoin")}</p></td><td className="max-w-72 px-4 py-3"><p className="line-clamp-1">{order.lines.slice(0, 2).map((line) => line.title).join(", ") || t("noLines")}</p>{order.lines.length > 2 ? <p className="text-xs text-muted-foreground">{t("moreLines", { count: order.lines.length - 2 })}</p> : null}</td><td className="px-4 py-3 text-right font-mono tabular-nums">{order.totalQuantity}</td><td className="px-4 py-3 text-right font-mono font-medium tabular-nums">{currency.format(order.discountedTotal)}</td><td className="px-4 py-3"><Badge className={statusClass(order.status)}>{t(`status.${order.status}`)}</Badge></td><td className="px-4 py-3">{dateFormatter.format(new Date(order.placedAt))}</td><td className="px-4 py-3"><Button aria-label={t("table.detailsFor", { id: orderLabel(order.id) })} className="size-11 px-0" onClick={() => setSelected(order)} variant="ghost"><Eye className="size-4" /></Button></td></tr>)}</tbody></table></div></Card>}

    <Pagination result={result} state={state} updateState={updateState} />
    <OrderDialog currency={currency} dateFormatter={dateFormatter} onClose={() => setSelected(null)} order={selected} />
  </section>;
}

function Select({ children, label, onChange, value }: { children: ReactNode; label: string; onChange: (value: string) => void; value: string | number }) {
  return <label className="flex flex-col gap-1 text-sm font-medium">{label}<select className="min-h-11 min-w-0 rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-focus" onChange={(event) => onChange(event.target.value)} value={value}>{children}</select></label>;
}

function StateCard({ action, description, title }: { action?: ReactNode; description: string; title: string }) {
  return <Card className="flex flex-col items-center py-12 text-center"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</Card>;
}

function Pagination({ result, state, updateState }: { result: ReturnType<typeof runOrderListPipeline>; state: OrdersQueryState; updateState: (patch: Partial<OrdersQueryState>, resetPage?: boolean) => void }) {
  const t = useTranslations("orders.pagination");
  return <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-muted-foreground">{t("range", { from: result.total ? (result.page - 1) * result.pageSize + 1 : 0, to: Math.min(result.page * result.pageSize, result.total), total: result.total })}</p><div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 whitespace-nowrap text-muted-foreground"><span>{t("pageSize")}</span><select aria-label={t("pageSize")} className="min-h-11 rounded-xl border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus" value={state.pageSize} onChange={(event) => updateState({ pageSize: Number(event.target.value) as OrdersQueryState["pageSize"] })}>{orderPageSizes.map((size) => <option key={size}>{size}</option>)}</select></label><div className="flex items-center gap-2"><Button aria-label={t("previous")} className="size-11 px-0" disabled={result.page <= 1} onClick={() => updateState({ page: result.page - 1 }, false)} variant="secondary"><ChevronLeft aria-hidden="true" className="size-4" /></Button><span className="min-w-24 text-center tabular-nums text-muted-foreground">{t("page", { page: result.page, totalPages: result.totalPages })}</span><Button aria-label={t("next")} className="size-11 px-0" disabled={result.page >= result.totalPages} onClick={() => updateState({ page: result.page + 1 }, false)} variant="secondary"><ChevronRight aria-hidden="true" className="size-4" /></Button></div></div></div>;
}

function LineImage({ line }: { line: OrderLine }) {
  const [failed, setFailed] = useState(false);
  if (failed || !line.thumbnail) return <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><ImageOff className="size-5" /></div>;
  return <Image alt="" className="size-14 rounded-xl bg-muted object-contain" height={56} onError={() => setFailed(true)} src={line.thumbnail} width={56} />;
}

function OrderDialog({ currency, dateFormatter, onClose, order }: { currency: Intl.NumberFormat; dateFormatter: Intl.DateTimeFormat; onClose: () => void; order: Order | null }) {
  const t = useTranslations("orders.details");
  const ordersT = useTranslations("orders");
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!order) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const keydown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const controls = rootRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      const first = controls?.[0]; const last = controls?.[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [onClose, order]);
  if (!order) return null;
  return <div aria-labelledby="order-dialog-title" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center sm:p-6" role="dialog"><button aria-label={t("close")} className="absolute inset-0 cursor-default" onClick={onClose} tabIndex={-1} /><div className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-border bg-surface p-6 shadow-2xl sm:rounded-3xl" ref={rootRef}><Button aria-label={t("close")} className="absolute right-4 top-4 size-11 px-0" onClick={onClose} ref={closeRef} variant="ghost"><X className="size-5" /></Button><div className="pr-14"><Badge className={statusClass(order.status)}>{ordersT(`status.${order.status}`)}</Badge><h2 className="mt-3 text-2xl font-semibold" id="order-dialog-title">{orderLabel(order.id)}</h2><p className="mt-1 text-sm text-muted-foreground">{order.customer?.fullName ?? t("unknownCustomer")} · {dateFormatter.format(new Date(order.placedAt))}</p></div><div className="mt-6 space-y-3">{order.lines.length === 0 ? <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">{t("noLines")}</p> : order.lines.map((line) => <div className="grid grid-cols-[3.5rem_1fr] gap-3 rounded-2xl border border-border p-3 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center" key={line.productId}><LineImage line={line} /><div><p className="font-medium">{line.title}</p><p className="text-sm text-muted-foreground">{t("lineMeta", { quantity: line.quantity, price: currency.format(line.unitPrice), discount: line.discountPercentage.toFixed(1) })}</p></div><p className="col-start-2 font-mono font-semibold tabular-nums sm:col-auto">{currency.format(line.discountedTotal)}</p></div>)}</div><dl className="mt-6 grid gap-3 sm:grid-cols-3">{[[t("quantity"), String(order.totalQuantity)], [t("gross"), currency.format(order.grossTotal)], [t("discounted"), currency.format(order.discountedTotal)]].map(([label, value]) => <div className="rounded-2xl bg-muted p-4" key={label}><dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 font-mono font-semibold tabular-nums">{value}</dd></div>)}</dl><p className="mt-5 text-sm leading-6 text-muted-foreground">{t("demoNote")}</p></div></div>;
}
