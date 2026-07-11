import {
  compareText,
  normalizeSearchTerm,
  paginate,
  sortWithIdTieBreak,
  type ListPage,
  type SortDirection,
} from "@/shared/lib/list-pipeline";

import type { User, UserStatus } from "./types";

export type UserSortField =
  | "id"
  | "name"
  | "email"
  | "company"
  | "country"
  | "status";

export interface UserListOptions {
  query?: string;
  statuses?: readonly UserStatus[];
  countries?: readonly string[];
  departments?: readonly string[];
  sortBy?: UserSortField;
  direction?: SortDirection;
  page?: number;
  pageSize?: number;
}

const userComparators: Record<UserSortField, (left: User, right: User) => number> = {
  id: (left, right) => left.id - right.id,
  name: (left, right) => compareText(left.fullName, right.fullName),
  email: (left, right) => compareText(left.email, right.email),
  company: (left, right) => compareText(left.companyName, right.companyName),
  country: (left, right) => compareText(left.country, right.country),
  status: (left, right) => compareText(left.status, right.status),
};

function normalizedSet(values: readonly string[] | undefined): Set<string> {
  return new Set(values?.map(normalizeSearchTerm) ?? []);
}

export function runUserListPipeline(
  users: readonly User[],
  options: UserListOptions = {},
): ListPage<User> {
  const query = normalizeSearchTerm(options.query);
  const statuses = normalizedSet(options.statuses);
  const countries = normalizedSet(options.countries);
  const departments = normalizedSet(options.departments);

  const filtered = users.filter((user) => {
    const searchable = [
      user.fullName,
      user.email,
      user.phone,
      user.companyName,
      user.country,
    ].map(normalizeSearchTerm);

    return (
      (query === "" || searchable.some((value) => value.includes(query))) &&
      (statuses.size === 0 || statuses.has(user.status)) &&
      (countries.size === 0 || countries.has(normalizeSearchTerm(user.country))) &&
      (departments.size === 0 || departments.has(normalizeSearchTerm(user.department)))
    );
  });

  const sorted = sortWithIdTieBreak(
    filtered,
    userComparators[options.sortBy ?? "id"],
    options.direction ?? "asc",
  );

  return paginate(sorted, options.page ?? 1, options.pageSize ?? 10, 10);
}
