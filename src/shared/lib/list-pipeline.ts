export type SortDirection = "asc" | "desc";

export interface ListPage<T> {
  items: T[];
  filtered: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function normalizeSearchTerm(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase() ?? "";
}

export function compareText(left: string, right: string): number {
  return left.localeCompare(right, "en", { sensitivity: "base" });
}

export function sortWithIdTieBreak<T extends { id: number }>(
  items: readonly T[],
  compare: (left: T, right: T) => number,
  direction: SortDirection,
): T[] {
  return [...items].sort((left, right) => {
    const result = compare(left, right);

    if (result !== 0) {
      return direction === "asc" ? result : -result;
    }

    return left.id - right.id;
  });
}

export function paginate<T>(
  filtered: readonly T[],
  requestedPage: number,
  requestedPageSize: number,
  fallbackPageSize = 10,
): ListPage<T> {
  const safeFallbackPageSize = Number.isFinite(fallbackPageSize)
    ? Math.max(1, Math.trunc(fallbackPageSize))
    : 1;
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.max(1, Math.trunc(requestedPageSize))
    : safeFallbackPageSize;
  const requestedPageNumber = Number.isFinite(requestedPage)
    ? Math.max(1, Math.trunc(requestedPage))
    : 1;
  const total = filtered.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const page = totalPages === 0 ? 1 : Math.min(requestedPageNumber, totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    filtered: [...filtered],
    page,
    pageSize,
    total,
    totalPages,
  };
}
