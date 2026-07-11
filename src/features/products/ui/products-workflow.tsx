"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  ImageOff,
  RefreshCw,
  Search,
  Star,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  runProductListPipeline,
  useProductsQuery,
  type Product,
} from "@/entities/product";
import {
  defaultProductsQueryState,
  parseProductsQueryState,
  productPageSizes,
  productRatingOptions,
  serializeProductsQueryState,
  withProductsQueryPatch,
  type ProductsQueryState,
} from "@/features/products/model/query-state";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";

function ProductImage({ product, fill = false, priority = false }: { product: Product; fill?: boolean; priority?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed || !product.thumbnail) {
    return (
      <div className="flex h-full min-h-40 w-full items-center justify-center bg-muted text-muted-foreground">
        <ImageOff aria-hidden="true" className="size-8" />
        <span className="sr-only">{product.title}</span>
      </div>
    );
  }

  return fill ? (
    <Image
      alt={product.title}
      className="object-contain p-4"
      fill
      onError={() => setFailed(true)}
      priority={priority}
      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
      src={product.thumbnail}
    />
  ) : (
    <Image
      alt={product.title}
      className="rounded-2xl bg-muted object-contain"
      height={160}
      onError={() => setFailed(true)}
      priority={priority}
      src={product.thumbnail}
      width={160}
    />
  );
}

function ProductsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Card className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton className="h-11" key={index} />
        ))}
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Card className="space-y-4 p-0 pb-5" key={index}>
            <Skeleton className="aspect-[4/3] rounded-b-none" />
            <Skeleton className="mx-5 h-5" />
            <Skeleton className="mx-5 h-12" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ProductsWorkflow() {
  const t = useTranslations("products");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const query = useProductsQuery();
  const state = useMemo(() => parseProductsQueryState(params), [params]);
  const [searchDraft, setSearchDraft] = useState(state.query);
  const [priceDraft, setPriceDraft] = useState({
    min: state.minPrice?.toString() ?? "",
    max: state.maxPrice?.toString() ?? "",
  });
  const [selected, setSelected] = useState<Product | null>(null);

  const replaceState = useCallback(
    (next: ProductsQueryState) => {
      const serialized = serializeProductsQueryState(next);
      router.replace(serialized ? `${pathname}?${serialized}` : pathname, { scroll: false });
    },
    [pathname, router],
  );
  const updateState = useCallback(
    (patch: Partial<ProductsQueryState>, resetPage = true) =>
      replaceState(withProductsQueryPatch(state, patch, resetPage)),
    [replaceState, state],
  );

  useEffect(() => setSearchDraft(state.query), [state.query]);
  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (searchDraft.trim() !== state.query) updateState({ query: searchDraft.trim() });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchDraft, state.query, updateState]);

  const products = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products],
  );
  const result = useMemo(
    () =>
      runProductListPipeline(products, {
        query: state.query,
        categories: state.category ? [state.category] : [],
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
        minRating: state.minRating || undefined,
        sortBy: state.sortBy,
        direction: state.direction,
        page: state.page,
        pageSize: state.pageSize,
      }),
    [products, state],
  );

  useEffect(() => {
    if (result.page !== state.page) updateState({ page: result.page }, false);
  }, [result.page, state.page, updateState]);

  const invalidPrice =
    priceDraft.min !== "" &&
    priceDraft.max !== "" &&
    Number(priceDraft.min) > Number(priceDraft.max);
  const applyPrice = () => {
    if (invalidPrice) return;
    updateState({
      minPrice: priceDraft.min === "" ? undefined : Number(priceDraft.min),
      maxPrice: priceDraft.max === "" ? undefined : Number(priceDraft.max),
    });
  };
  const clearFilters = () => {
    setSearchDraft("");
    setPriceDraft({ min: "", max: "" });
    replaceState(defaultProductsQueryState);
  };
  const hasFilters = serializeProductsQueryState({ ...state, page: 1 }) !== "";
  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }),
    [locale],
  );

  if (query.isPending) return <ProductsSkeleton />;
  if (query.isError && !query.data) {
    return (
      <StateCard
        action={<Button onClick={() => void query.refetch()}><RefreshCw className="size-4" />{t("states.retry")}</Button>}
        description={t("states.errorDescription")}
        title={t("states.errorTitle")}
      />
    );
  }
  if (products.length === 0) {
    return <StateCard description={t("states.remoteEmptyDescription")} title={t("states.remoteEmptyTitle")} />;
  }

  return (
    <section className="space-y-4" aria-label={t("label")}>
      <p className="sr-only" aria-live="polite">{t("results", { count: result.total })}</p>
      <Card className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-6 xl:items-end">
          <label className="flex flex-col gap-1 text-sm font-medium xl:col-span-2">
            {t("toolbar.search")}
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder={t("toolbar.searchPlaceholder")} />
            </span>
          </label>
          <Select label={t("toolbar.category")} value={state.category} onChange={(value) => updateState({ category: value })}>
            <option value="">{t("toolbar.all")}</option>
            {categories.map((category) => <option key={category} value={category}>{humanize(category)}</option>)}
          </Select>
          <Select label={t("toolbar.rating")} value={state.minRating} onChange={(value) => updateState({ minRating: Number(value) as ProductsQueryState["minRating"] })}>
            {productRatingOptions.map((rating) => <option key={rating} value={rating}>{rating === 0 ? t("toolbar.all") : t("toolbar.ratingAtLeast", { rating })}</option>)}
          </Select>
          <Select label={t("toolbar.sort")} value={`${state.sortBy}:${state.direction}`} onChange={(value) => {
            const [sortBy, direction] = value.split(":") as [ProductsQueryState["sortBy"], ProductsQueryState["direction"]];
            updateState({ sortBy, direction });
          }}>
            {(["id:asc", "title:asc", "title:desc", "price:asc", "price:desc", "rating:desc", "discount:desc", "stock:asc"] as const).map((option) => <option key={option} value={option}>{t(`sort.${option.replace(":", "_")}`)}</option>)}
          </Select>
          <details className="relative mt-[1.625rem] min-w-0">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <span className="inline-flex items-center gap-2"><Filter className="size-4" />{t("toolbar.price")}</span>
            </summary>
            <div className="absolute right-0 z-20 mt-2 grid w-full gap-2 rounded-xl border border-border bg-surface p-3 shadow-lg">
              <Input aria-label={t("toolbar.minPrice")} min="0" onChange={(event) => setPriceDraft((draft) => ({ ...draft, min: event.target.value }))} placeholder={t("toolbar.minPrice")} type="number" value={priceDraft.min} />
              <Input aria-label={t("toolbar.maxPrice")} min="0" onChange={(event) => setPriceDraft((draft) => ({ ...draft, max: event.target.value }))} placeholder={t("toolbar.maxPrice")} type="number" value={priceDraft.max} />
              {invalidPrice ? <p className="text-xs text-rose-600" role="alert">{t("toolbar.priceError")}</p> : null}
              <Button disabled={invalidPrice} onClick={applyPrice} variant="secondary">{t("toolbar.apply")}</Button>
            </div>
          </details>
        </div>
        {hasFilters ? <Button onClick={clearFilters} variant="ghost"><X className="size-4" />{t("toolbar.clear")}</Button> : null}
      </Card>

      {query.isFetching ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw className="size-4 animate-spin motion-reduce:animate-none" />{t("states.refreshing")}</p> : null}

      {result.total === 0 ? (
        <StateCard action={<Button onClick={clearFilters} variant="secondary">{t("states.clearFilters")}</Button>} description={t("states.filteredEmptyDescription")} title={t("states.filteredEmptyTitle")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {result.items.map((product, index) => (
            <Card className="group flex min-w-0 flex-col overflow-hidden p-0" key={product.id}>
              <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-muted"><ProductImage fill priority={index === 0} product={product} /></div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-2">
                  <Badge>{humanize(product.category)}</Badge>
                  {product.discountPercentage > 0 ? <Badge className="bg-primary-subtle text-primary-subtle-foreground">-{product.discountPercentage.toFixed(0)}%</Badge> : null}
                  <StockBadge product={product} />
                </div>
                <h2 className="mt-3 line-clamp-2 font-semibold">{product.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                  <div><p className="font-mono text-lg font-semibold tabular-nums">{currency.format(product.price)}</p><p className="flex items-center gap-1 text-sm text-muted-foreground"><Star className="size-4 fill-amber-400 text-amber-500" />{product.rating.toFixed(1)}</p></div>
                  <Button aria-label={t("card.detailsFor", { title: product.title })} className="size-11 px-0" onClick={() => setSelected(product)} variant="secondary"><Eye className="size-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination state={state} result={result} updateState={updateState} />
      <ProductDialog currency={currency} onClose={() => setSelected(null)} product={selected} />
    </section>
  );
}

function Select({ children, label, onChange, value }: { children: ReactNode; label: string; onChange: (value: string) => void; value: string | number }) {
  return <label className="flex flex-col gap-1 text-sm font-medium">{label}<select className="min-h-11 min-w-0 rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-focus" value={value} onChange={(event) => onChange(event.target.value)}>{children}</select></label>;
}

function humanize(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StockBadge({ product }: { product: Product }) {
  const t = useTranslations("products.stock");
  if (product.stock === 0) return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300">{t("out")}</Badge>;
  if (product.stock <= 10) return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">{t("low", { count: product.stock })}</Badge>;
  return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">{t("in", { count: product.stock })}</Badge>;
}

function StateCard({ action, description, title }: { action?: ReactNode; description: string; title: string }) {
  return <Card className="flex flex-col items-center py-12 text-center"><Filter className="size-7 text-primary" /><h2 className="mt-4 text-lg font-semibold">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</Card>;
}

function Pagination({ result, state, updateState }: { result: ReturnType<typeof runProductListPipeline>; state: ProductsQueryState; updateState: (patch: Partial<ProductsQueryState>, resetPage?: boolean) => void }) {
  const t = useTranslations("products.pagination");
  return <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-muted-foreground">{t("range", { from: result.total ? (result.page - 1) * result.pageSize + 1 : 0, to: Math.min(result.page * result.pageSize, result.total), total: result.total })}</p><div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 whitespace-nowrap text-muted-foreground"><span>{t("pageSize")}</span><select aria-label={t("pageSize")} className="min-h-11 rounded-xl border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus" value={state.pageSize} onChange={(event) => updateState({ pageSize: Number(event.target.value) as ProductsQueryState["pageSize"] })}>{productPageSizes.map((size) => <option key={size}>{size}</option>)}</select></label><div className="flex items-center gap-2"><Button aria-label={t("previous")} className="size-11 px-0" disabled={result.page <= 1} onClick={() => updateState({ page: result.page - 1 }, false)} variant="secondary"><ChevronLeft aria-hidden="true" className="size-4" /></Button><span className="min-w-24 text-center tabular-nums text-muted-foreground">{t("page", { page: result.page, totalPages: result.totalPages })}</span><Button aria-label={t("next")} className="size-11 px-0" disabled={result.page >= result.totalPages} onClick={() => updateState({ page: result.page + 1 }, false)} variant="secondary"><ChevronRight aria-hidden="true" className="size-4" /></Button></div></div></div>;
}

function ProductDialog({ currency, onClose, product }: { currency: Intl.NumberFormat; onClose: () => void; product: Product | null }) {
  const t = useTranslations("products.details");
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!product) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const keydown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      const first = controls?.[0];
      const last = controls?.[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [onClose, product]);
  if (!product) return null;
  return <div aria-labelledby="product-dialog-title" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center sm:p-6" role="dialog"><button aria-label={t("close")} className="absolute inset-0 cursor-default" onClick={onClose} tabIndex={-1} /><div className="relative max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-border bg-surface p-6 shadow-2xl sm:rounded-3xl" ref={dialogRef}><Button aria-label={t("close")} className="absolute right-4 top-4 z-10 size-11 px-0" onClick={onClose} ref={closeRef} variant="ghost"><X className="size-5" /></Button><div className="grid gap-6 sm:grid-cols-[10rem_1fr]"><ProductImage product={product} /><div className="pr-12"><div className="flex flex-wrap gap-2"><Badge>{humanize(product.category)}</Badge><StockBadge product={product} /></div><h2 className="mt-3 text-2xl font-semibold" id="product-dialog-title">{product.title}</h2><p className="mt-2 leading-6 text-muted-foreground">{product.description}</p></div></div><dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[t("price"), currency.format(product.price)], [t("discount"), `${product.discountPercentage.toFixed(1)}%`], [t("rating"), product.rating.toFixed(1)], [t("stock"), String(product.stock)], [t("brand"), product.brand ?? t("unknown")], [t("indexed"), new Date(product.indexedAt).toLocaleDateString()]].map(([label, value]) => <div className="rounded-2xl bg-muted p-4" key={label}><dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl><p className="mt-5 text-sm text-muted-foreground">{t("note")}</p></div></div>;
}
