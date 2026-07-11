import type { SortDirection } from "@/shared/lib/list-pipeline";
import type { UserSortField, UserStatus } from "@/entities/user";

export const userPageSizes = [10, 20, 50] as const;
export const userStatuses = ["active", "away", "inactive"] as const satisfies readonly UserStatus[];
export const userSortFields = [
  "id",
  "name",
  "email",
  "company",
  "country",
  "status",
] as const satisfies readonly UserSortField[];

export interface UsersQueryState {
  query: string;
  page: number;
  pageSize: (typeof userPageSizes)[number];
  sortBy: UserSortField;
  direction: SortDirection;
  statuses: UserStatus[];
  countries: string[];
  departments: string[];
}

export const defaultUsersQueryState: UsersQueryState = {
  query: "",
  page: 1,
  pageSize: 10,
  sortBy: "id",
  direction: "asc",
  statuses: [],
  countries: [],
  departments: [],
};

function hasValue<T extends string>(values: readonly T[], value: string): value is T {
  return values.includes(value as T);
}

function hasNumberValue<T extends number>(values: readonly T[], value: number): value is T {
  return values.includes(value as T);
}

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (value === null) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseMultiValue(searchParams: URLSearchParams, key: string): string[] {
  const values = [
    ...searchParams.getAll(key),
    ...(searchParams.get(key)?.split(",") ?? []),
  ];

  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function parseUsersQueryState(searchParams: URLSearchParams): UsersQueryState {
  const pageSize = parsePositiveInteger(
    searchParams.get("pageSize"),
    defaultUsersQueryState.pageSize,
  );
  const sort = searchParams.get("sort") ?? defaultUsersQueryState.sortBy;
  const direction = searchParams.get("order") ?? defaultUsersQueryState.direction;

  return {
    query: searchParams.get("q")?.trim() ?? defaultUsersQueryState.query,
    page: parsePositiveInteger(searchParams.get("page"), defaultUsersQueryState.page),
    pageSize: hasNumberValue(userPageSizes, pageSize)
      ? pageSize
      : defaultUsersQueryState.pageSize,
    sortBy: hasValue(userSortFields, sort) ? sort : defaultUsersQueryState.sortBy,
    direction: direction === "desc" ? "desc" : "asc",
    statuses: parseMultiValue(searchParams, "status").filter((status): status is UserStatus =>
      hasValue(userStatuses, status),
    ),
    countries: parseMultiValue(searchParams, "country"),
    departments: parseMultiValue(searchParams, "department"),
  };
}

export function serializeUsersQueryState(state: UsersQueryState): string {
  const params = new URLSearchParams();

  if (state.query.trim() !== defaultUsersQueryState.query) {
    params.set("q", state.query.trim());
  }

  if (state.page !== defaultUsersQueryState.page) {
    params.set("page", String(state.page));
  }

  if (state.pageSize !== defaultUsersQueryState.pageSize) {
    params.set("pageSize", String(state.pageSize));
  }

  if (state.sortBy !== defaultUsersQueryState.sortBy) {
    params.set("sort", state.sortBy);
  }

  if (state.direction !== defaultUsersQueryState.direction) {
    params.set("order", state.direction);
  }

  state.statuses.forEach((status) => params.append("status", status));
  state.countries.forEach((country) => params.append("country", country));
  state.departments.forEach((department) => params.append("department", department));

  return params.toString();
}

export function withUsersQueryPatch(
  state: UsersQueryState,
  patch: Partial<UsersQueryState>,
  resetPage = true,
): UsersQueryState {
  return {
    ...state,
    ...patch,
    page: resetPage ? 1 : patch.page ?? state.page,
  };
}
