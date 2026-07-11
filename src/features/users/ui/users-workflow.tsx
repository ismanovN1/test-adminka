"use client";

import Image from "next/image";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { usePreferencesStore } from "@/features/preferences/preferences-store";
import {
  defaultUsersQueryState,
  parseUsersQueryState,
  serializeUsersQueryState,
  userPageSizes,
  userStatuses,
  withUsersQueryPatch,
  type UsersQueryState,
} from "@/features/users/model/query-state";
import {
  makeUsersCsv,
  makeUsersCsvFileName,
  runUserListPipeline,
  useUsersQuery,
  type User,
  type UserSortField,
  type UserStatus,
} from "@/entities/user";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";

const sortableColumnMap: Partial<Record<string, UserSortField>> = {
  name: "name",
  email: "email",
  company: "company",
  country: "country",
  status: "status",
};

const visibleColumnLabels = [
  "avatar",
  "name",
  "email",
  "phone",
  "company",
  "country",
  "status",
  "actions",
] as const;

function statusBadgeClass(status: UserStatus): string {
  if (status === "active") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "away") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
}

function getUniqueOptions(users: readonly User[], field: "country" | "department") {
  return [...new Set(users.map((user) => user[field]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" }),
  );
}

function UserAvatar({ size, user }: { size: 36 | 72; user: User }) {
  const [failed, setFailed] = useState(false);
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  if (failed || !user.image) {
    return (
      <span
        aria-hidden="true"
        className="grid shrink-0 place-items-center rounded-2xl bg-primary-subtle font-semibold text-primary-subtle-foreground"
        style={{ height: size, width: size }}
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      alt=""
      className="shrink-0 rounded-2xl bg-muted object-cover"
      height={size}
      onError={() => setFailed(true)}
      src={user.image}
      width={size}
    />
  );
}

function UsersSkeleton() {
  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-full lg:w-40" />
        <Skeleton className="h-11 w-full lg:w-40" />
        <Skeleton className="h-11 w-full lg:w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton className="h-14 w-full" key={index} />
        ))}
      </div>
    </Card>
  );
}

function EmptyState({
  actionLabel,
  description,
  onAction,
  title,
}: {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  title: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-primary-subtle p-3 text-primary-subtle-foreground">
        <Filter aria-hidden="true" className="size-6" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("users.states");

  return (
    <Card className="flex flex-col items-start gap-4 border-rose-500/30">
      <div>
        <h2 className="text-lg font-semibold">{t("errorTitle")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("errorDescription")}
        </p>
      </div>
      <Button onClick={onRetry}>
        <RefreshCw aria-hidden="true" className="size-4" />
        {t("retry")}
      </Button>
    </Card>
  );
}

export function UsersWorkflow() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useUsersQuery();
  const parsedState = useMemo(
    () => parseUsersQueryState(searchParams),
    [searchParams],
  );
  const [searchDraft, setSearchDraft] = useState(parsedState.query);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columnVisibility = usePreferencesStore(
    (state) => state.usersTableColumnVisibility,
  );
  const setColumnVisibility = usePreferencesStore(
    (state) => state.setUsersTableColumnVisibility,
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setSearchDraft(parsedState.query);
  }, [parsedState.query]);

  const replaceState = useCallback(
    (nextState: UsersQueryState) => {
      const serialized = serializeUsersQueryState(nextState);
      router.replace(serialized ? `${pathname}?${serialized}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (searchDraft !== parsedState.query) {
        replaceState(
          withUsersQueryPatch(parsedState, { query: searchDraft.trim() }),
        );
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [parsedState, replaceState, searchDraft]);

  const users = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const countries = useMemo(() => getUniqueOptions(users, "country"), [users]);
  const departments = useMemo(() => getUniqueOptions(users, "department"), [users]);
  const result = useMemo(
    () =>
      runUserListPipeline(users, {
        query: parsedState.query,
        statuses: parsedState.statuses,
        countries: parsedState.countries,
        departments: parsedState.departments,
        sortBy: parsedState.sortBy,
        direction: parsedState.direction,
        page: parsedState.page,
        pageSize: parsedState.pageSize,
      }),
    [parsedState, users],
  );

  useEffect(() => {
    if (result.page !== parsedState.page) {
      replaceState(withUsersQueryPatch(parsedState, { page: result.page }, false));
    }
  }, [parsedState, replaceState, result.page]);

  const updateState = useCallback(
    (patch: Partial<UsersQueryState>, resetPage = true) => {
      replaceState(withUsersQueryPatch(parsedState, patch, resetPage));
    },
    [parsedState, replaceState],
  );

  const clearFilters = useCallback(() => {
    setSearchDraft("");
    replaceState(defaultUsersQueryState);
  }, [replaceState]);

  const hasActiveFilters =
    parsedState.query !== "" ||
    parsedState.statuses.length > 0 ||
    parsedState.countries.length > 0 ||
    parsedState.departments.length > 0 ||
    parsedState.sortBy !== defaultUsersQueryState.sortBy ||
    parsedState.direction !== defaultUsersQueryState.direction ||
    parsedState.pageSize !== defaultUsersQueryState.pageSize;
  const advancedFilterCount =
    parsedState.statuses.length +
    parsedState.countries.length +
    parsedState.departments.length;

  const exportCsv = useCallback(() => {
    const csv = makeUsersCsv(result.filtered);
    const url = window.URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = makeUsersCsvFileName();
    link.hidden = true;
    document.body.append(link);
    link.click();
    window.setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(url);
    }, 0);
  }, [result.filtered]);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "select",
        enableHiding: false,
        header: ({ table }) => (
          <input
            aria-label={t("users.table.selectPage")}
            checked={table.getIsAllPageRowsSelected()}
            className="size-4 rounded border-input accent-primary"
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            type="checkbox"
          />
        ),
        cell: ({ row }) => (
          <input
            aria-label={t("users.table.selectRow", {
              name: row.original.fullName,
            })}
            checked={row.getIsSelected()}
            className="size-4 rounded border-input accent-primary"
            onChange={row.getToggleSelectedHandler()}
            type="checkbox"
          />
        ),
      },
      {
        id: "avatar",
        header: t("users.table.avatar"),
        cell: ({ row }) => (
          <UserAvatar size={36} user={row.original} />
        ),
      },
      {
        id: "name",
        accessorKey: "fullName",
        enableHiding: false,
        header: t("users.table.name"),
        cell: ({ row }) => (
          <div className="min-w-44">
            <p className="font-medium text-foreground">{row.original.fullName}</p>
            <p className="text-xs text-muted-foreground">{row.original.role}</p>
          </div>
        ),
      },
      {
        id: "email",
        accessorKey: "email",
        header: t("users.table.email"),
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: t("users.table.phone"),
      },
      {
        id: "company",
        accessorKey: "companyName",
        header: t("users.table.company"),
        cell: ({ row }) => (
          <div className="min-w-48">
            <p>{row.original.companyName}</p>
            <p className="text-xs text-muted-foreground">{row.original.department}</p>
          </div>
        ),
      },
      {
        id: "country",
        accessorKey: "country",
        header: t("users.table.country"),
      },
      {
        id: "status",
        accessorKey: "status",
        header: t("users.table.status"),
        cell: ({ row }) => (
          <Badge className={statusBadgeClass(row.original.status)}>
            {t(`users.status.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        header: t("users.table.actions"),
        cell: ({ row }) => (
          <Button
            aria-label={t("users.table.openDetails", {
              name: row.original.fullName,
            })}
            className="size-10 px-0"
            onClick={() => setSelectedUser(row.original)}
            variant="ghost"
          >
            <Eye aria-hidden="true" className="size-4" />
          </Button>
        ),
      },
    ],
    [t],
  );

  const table = useReactTable({
    data: result.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(columnVisibility) : updater;
      setColumnVisibility(next as Record<string, boolean>);
    },
    state: {
      rowSelection,
      columnVisibility: columnVisibility as VisibilityState,
    },
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  if (query.isPending) {
    return <UsersSkeleton />;
  }

  if (query.isError && !query.data) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        description={t("users.states.remoteEmptyDescription")}
        title={t("users.states.remoteEmptyTitle")}
      />
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="users-workflow-title">
      <div className="sr-only" aria-live="polite" id="users-workflow-title">
        {t("users.results", { count: result.total })}
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
            {t("users.toolbar.search")}
            <span className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-10"
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder={t("users.toolbar.searchPlaceholder")}
                value={searchDraft}
              />
            </span>
          </label>

          <details className="rounded-2xl border border-border bg-background p-3 xl:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-focus">
              <span className="inline-flex items-center gap-2">
                <Filter aria-hidden="true" className="size-4" />
                {t("users.toolbar.filters")}
              </span>
              <Badge>{advancedFilterCount}</Badge>
            </summary>
            <div className="mt-3 grid gap-3">
              <UsersFilterControls
                countries={countries}
                departments={departments}
                parsedState={parsedState}
                updateState={updateState}
              />
            </div>
          </details>

          <UsersFilterControls
            className="hidden xl:flex"
            countries={countries}
            departments={departments}
            parsedState={parsedState}
            updateState={updateState}
          />

          <details className="group relative">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium shadow-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-focus">
              <Settings2 aria-hidden="true" className="size-4" />
              {t("users.toolbar.columns")}
              <ChevronDown
                aria-hidden="true"
                className="size-4 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-border bg-surface p-3 shadow-lg">
              {visibleColumnLabels.map((columnId) => {
                const column = table.getColumn(columnId);

                if (!column) {
                  return null;
                }

                return (
                  <label
                    className="flex min-h-10 items-center gap-3 rounded-xl px-2 text-sm hover:bg-muted"
                    key={columnId}
                  >
                    <input
                      checked={column.getIsVisible()}
                      className="size-4 accent-primary"
                      disabled={!column.getCanHide()}
                      onChange={column.getToggleVisibilityHandler()}
                      type="checkbox"
                    />
                    {t(`users.table.${columnId}`)}
                  </label>
                );
              })}
            </div>
          </details>

          <Button
            disabled={result.filtered.length === 0}
            onClick={exportCsv}
            variant="secondary"
          >
            <Download aria-hidden="true" className="size-4" />
            {t("users.toolbar.export")}
          </Button>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("users.toolbar.active")}:</span>
            {parsedState.query ? (
              <FilterChip
                label={t("users.toolbar.queryChip", { value: parsedState.query })}
                onRemove={() => {
                  setSearchDraft("");
                  updateState({ query: "" });
                }}
              />
            ) : null}
            {parsedState.statuses.map((status) => (
              <FilterChip
                key={status}
                label={t("users.toolbar.statusChip", {
                  value: t(`users.status.${status}`),
                })}
                onRemove={() => updateState({ statuses: [] })}
              />
            ))}
            {parsedState.countries.map((country) => (
              <FilterChip
                key={country}
                label={t("users.toolbar.countryChip", { value: country })}
                onRemove={() => updateState({ countries: [] })}
              />
            ))}
            {parsedState.departments.map((department) => (
              <FilterChip
                key={department}
                label={t("users.toolbar.departmentChip", { value: department })}
                onRemove={() => updateState({ departments: [] })}
              />
            ))}
            <Button className="min-h-9 px-3" onClick={clearFilters} variant="ghost">
              {t("users.toolbar.clearAll")}
            </Button>
          </div>
        ) : null}

        {selectedCount > 0 ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary-subtle p-3 text-sm text-primary-subtle-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>{t("users.selection.selected", { count: selectedCount })}</span>
            <Button
              className="self-start sm:self-auto"
              onClick={() => setRowSelection({})}
              variant="secondary"
            >
              {t("users.selection.clear")}
            </Button>
          </div>
        ) : null}
      </Card>

      {query.isFetching ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
          {t("users.states.refreshing")}
        </p>
      ) : null}

      {result.total === 0 ? (
        <EmptyState
          actionLabel={t("users.states.clearFilters")}
          description={t("users.states.filteredEmptyDescription")}
          onAction={clearFilters}
          title={t("users.states.filteredEmptyTitle")}
        />
      ) : (
        <Card className="p-0">
          <div
            aria-label={t("users.table.scrollRegion")}
            className="overflow-x-auto"
            tabIndex={0}
          >
            <table className="w-full min-w-[62rem] border-collapse text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr className="border-b border-border" key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const sortField = sortableColumnMap[header.column.id];
                      const isSorted = parsedState.sortBy === sortField;
                      const ariaSort = !sortField
                        ? undefined
                        : isSorted
                          ? parsedState.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none";

                      return (
                        <th
                          aria-sort={ariaSort}
                          className={cn(
                            "bg-surface px-4 py-3 text-left font-semibold text-muted-foreground",
                            header.column.id === "name" &&
                              "sticky left-0 z-10 shadow-[1px_0_0_var(--border)]",
                          )}
                          key={header.id}
                          scope="col"
                        >
                          {sortField ? (
                            <button
                              className="inline-flex items-center gap-1 rounded-lg outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus"
                              onClick={() =>
                                updateState({
                                  sortBy: sortField,
                                  direction:
                                    isSorted && parsedState.direction === "asc"
                                      ? "desc"
                                      : "asc",
                                })
                              }
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              <ChevronDown
                                aria-hidden="true"
                                className={cn(
                                  "size-4",
                                  isSorted &&
                                    parsedState.direction === "asc" &&
                                    "rotate-180",
                                )}
                              />
                            </button>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    className="border-b border-border/70 last:border-0 hover:bg-muted/50"
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        className={cn(
                          "px-4 py-3 align-middle",
                          cell.column.id === "name" &&
                            "sticky left-0 z-10 bg-surface shadow-[1px_0_0_var(--border)]",
                        )}
                        key={cell.id}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          {t("users.pagination.range", {
            from: result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1,
            to: Math.min(result.page * result.pageSize, result.total),
            total: result.total,
          })}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-muted-foreground">{t("users.pagination.pageSize")}</span>
            <select
              className="min-h-11 rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onChange={(event) =>
                updateState({
                  pageSize: Number(event.target.value) as UsersQueryState["pageSize"],
                })
              }
              value={parsedState.pageSize}
            >
              {userPageSizes.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </label>
          <Button
            aria-label={t("users.pagination.previous")}
            className="size-11 px-0"
            disabled={result.page <= 1}
            onClick={() => updateState({ page: result.page - 1 }, false)}
            variant="secondary"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
          <span className="min-w-24 text-center tabular-nums text-muted-foreground">
            {t("users.pagination.page", {
              page: result.page,
              totalPages: result.totalPages,
            })}
          </span>
          <Button
            aria-label={t("users.pagination.next")}
            className="size-11 px-0"
            disabled={result.page >= result.totalPages}
            onClick={() => updateState({ page: result.page + 1 }, false)}
            variant="secondary"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>

      <UserDetailsDialog onClose={() => setSelectedUser(null)} user={selectedUser} />
    </section>
  );
}

function UsersFilterControls({
  className,
  countries,
  departments,
  parsedState,
  updateState,
}: {
  className?: string;
  countries: readonly string[];
  departments: readonly string[];
  parsedState: UsersQueryState;
  updateState: (patch: Partial<UsersQueryState>, resetPage?: boolean) => void;
}) {
  const t = useTranslations();

  return (
    <div className={cn("contents xl:items-end xl:gap-3", className)}>
      <FilterSelect
        label={t("users.toolbar.status")}
        onChange={(value) =>
          updateState({ statuses: value ? [value as UserStatus] : [] })
        }
        options={userStatuses.map((status) => ({
          label: t(`users.status.${status}`),
          value: status,
        }))}
        value={parsedState.statuses[0] ?? ""}
      />
      <FilterSelect
        label={t("users.toolbar.country")}
        onChange={(value) => updateState({ countries: value ? [value] : [] })}
        options={countries.map((country) => ({ label: country, value: country }))}
        value={parsedState.countries[0] ?? ""}
      />
      <FilterSelect
        label={t("users.toolbar.department")}
        onChange={(value) =>
          updateState({ departments: value ? [value] : [] })
        }
        options={departments.map((department) => ({
          label: department,
          value: department,
        }))}
        value={parsedState.departments[0] ?? ""}
      />
    </div>
  );
}

function FilterSelect({
  label,
  className,
  onChange,
  options,
  value,
}: {
  label: string;
  className?: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  const t = useTranslations("users.toolbar");

  return (
    <label className={cn("flex w-full flex-col gap-1 text-sm font-medium xl:w-44", className)}>
      {label}
      <select
        className="min-h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{t("all")}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Backspace") {
      onRemove();
    }
  };

  return (
    <button
      className="inline-flex min-h-9 items-center gap-2 rounded-full bg-muted px-3 text-sm outline-none hover:bg-primary-subtle focus-visible:ring-2 focus-visible:ring-focus"
      onClick={onRemove}
      onKeyDown={handleKeyDown}
      type="button"
    >
      {label}
      <X aria-hidden="true" className="size-3.5" />
    </button>
  );
}

function UserDetailsDialog({
  onClose,
  user,
}: {
  onClose: () => void;
  user: User | null;
}) {
  const t = useTranslations();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const activeElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    closeButtonRef.current?.focus();

    return () => {
      activeElement?.focus();
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable?.[0];
        const last = focusable?.[focusable.length - 1];

        if (!first || !last) {
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, user]);

  if (!user) {
    return null;
  }

  return (
    <div
      aria-labelledby="user-details-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6"
      role="dialog"
    >
      <div aria-hidden="true" className="absolute inset-0" onMouseDown={onClose} />
      <div
        className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-surface p-6 shadow-2xl sm:rounded-3xl"
        ref={dialogRef}
      >
        <Button
          aria-label={t("users.details.close")}
          className="absolute right-4 top-4 size-11 px-0"
          onClick={onClose}
          ref={closeButtonRef}
          variant="ghost"
        >
          <X aria-hidden="true" className="size-5" />
        </Button>
        <div className="flex items-start gap-4 pr-12">
          <UserAvatar size={72} user={user} />
          <div>
            <Badge className={statusBadgeClass(user.status)}>
              {t(`users.status.${user.status}`)}
            </Badge>
            <h2 className="mt-3 text-2xl font-semibold" id="user-details-title">
              {user.fullName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{user.role}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            [t("users.details.email"), user.email],
            [t("users.details.phone"), user.phone],
            [t("users.details.company"), user.companyName],
            [t("users.details.department"), user.department],
            [t("users.details.country"), user.country],
            [t("users.details.indexedAt"), new Date(user.indexedAt).toLocaleDateString()],
          ].map(([label, value]) => (
            <div className="rounded-2xl bg-muted p-4" key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          {t("users.details.demoNote")}
        </p>
      </div>
    </div>
  );
}
