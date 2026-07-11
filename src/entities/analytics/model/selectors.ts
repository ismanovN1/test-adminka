import type { Order, OrderStatus } from "@/entities/order";
import type { Product } from "@/entities/product";
import type { User } from "@/entities/user";

export interface NamedValue {
  name: string;
  value: number;
}

export interface MonthlyOrderMetric {
  monthIndex: number;
  orderCount: number;
  revenue: number;
}

export interface MonthlyUserMetric {
  monthIndex: number;
  newUsers: number;
  cumulativeUsers: number;
}

export interface TopProductMetric {
  productId: number;
  title: string;
  quantity: number;
  revenue: number;
}

export interface CommerceSummary {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageProductRating: number | null;
  lowStockProducts: number;
}

export function selectTotalRevenue(orders: readonly Order[]): number {
  return orders.reduce((total, order) => total + order.discountedTotal, 0);
}

export function selectAverageProductRating(
  products: readonly Product[],
): number | null {
  if (products.length === 0) {
    return null;
  }

  return (
    products.reduce((total, product) => total + product.rating, 0) /
    products.length
  );
}

export function selectCommerceSummary(input: {
  userTotal: number;
  productTotal: number;
  orderTotal: number;
  products: readonly Product[];
  orders: readonly Order[];
}): CommerceSummary {
  return {
    totalUsers: input.userTotal,
    totalProducts: input.productTotal,
    totalOrders: input.orderTotal,
    totalRevenue: selectTotalRevenue(input.orders),
    averageProductRating: selectAverageProductRating(input.products),
    lowStockProducts: input.products.filter((product) => product.stock <= 10).length,
  };
}

export function selectTopSellingProducts(
  orders: readonly Order[],
): TopProductMetric[] {
  const grouped = new Map<number, TopProductMetric>();

  for (const order of orders) {
    for (const line of order.lines) {
      const current = grouped.get(line.productId);

      if (current) {
        current.quantity += line.quantity;
        current.revenue += line.discountedTotal;
      } else {
        grouped.set(line.productId, {
          productId: line.productId,
          title: line.title,
          quantity: line.quantity,
          revenue: line.discountedTotal,
        });
      }
    }
  }

  return [...grouped.values()].sort(
    (left, right) =>
      right.quantity - left.quantity || left.productId - right.productId,
  );
}

export function selectPopularCategories(
  orders: readonly Order[],
  products: readonly Product[],
): NamedValue[] {
  const categoriesByProductId = new Map(
    products.map((product) => [product.id, product.category.trim() || "Unknown"]),
  );
  const grouped = new Map<string, number>();

  for (const order of orders) {
    for (const line of order.lines) {
      const category = categoriesByProductId.get(line.productId) ?? "Unknown";
      grouped.set(category, (grouped.get(category) ?? 0) + line.quantity);
    }
  }

  return toSortedNamedValues(grouped);
}

export function selectUsersByCountry(users: readonly User[]): NamedValue[] {
  const grouped = new Map<string, number>();

  for (const user of users) {
    const country = user.country.trim() || "Unknown";
    grouped.set(country, (grouped.get(country) ?? 0) + 1);
  }

  return toSortedNamedValues(grouped);
}

export function selectProductCatalogByCategory(
  products: readonly Product[],
): NamedValue[] {
  const grouped = new Map<string, number>();

  for (const product of products) {
    const category = product.category.trim() || "Unknown";
    grouped.set(category, (grouped.get(category) ?? 0) + 1);
  }

  return toSortedNamedValues(grouped);
}

export function selectOrdersByStatus(orders: readonly Order[]): NamedValue[] {
  const statuses: readonly OrderStatus[] = [
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return statuses.map((status) => ({
    name: status,
    value: orders.filter((order) => order.status === status).length,
  }));
}

export function selectMonthlyOrderMetrics(
  orders: readonly Order[],
): MonthlyOrderMetric[] {
  const months = Array.from({ length: 12 }, (_, monthIndex) => ({
    monthIndex,
    orderCount: 0,
    revenue: 0,
  }));

  for (const order of orders) {
    const monthIndex = new Date(order.placedAt).getUTCMonth();
    const metric = months[monthIndex];

    if (metric) {
      metric.orderCount += 1;
      metric.revenue += order.discountedTotal;
    }
  }

  return months;
}

export function selectCumulativeUsers(
  users: readonly User[],
): MonthlyUserMetric[] {
  const monthlyCounts = Array.from({ length: 12 }, () => 0);

  for (const user of users) {
    const monthIndex = new Date(user.indexedAt).getUTCMonth();

    if (monthlyCounts[monthIndex] !== undefined) {
      monthlyCounts[monthIndex] += 1;
    }
  }

  let cumulativeUsers = 0;

  return monthlyCounts.map((newUsers, monthIndex) => {
    cumulativeUsers += newUsers;
    return { monthIndex, newUsers, cumulativeUsers };
  });
}

export function selectTopNWithOther(
  values: readonly NamedValue[],
  limit = 5,
  otherName = "Other",
): NamedValue[] {
  const safeLimit = Math.max(0, Math.trunc(limit));
  const sorted = [...values].sort(
    (left, right) =>
      right.value - left.value || left.name.localeCompare(right.name, "en"),
  );
  const top = sorted.slice(0, safeLimit);
  const otherValue = sorted
    .slice(safeLimit)
    .reduce((total, item) => total + item.value, 0);

  return otherValue > 0
    ? [...top, { name: otherName, value: otherValue }]
    : top;
}

export function selectRecentlyIndexed<T extends { id: number }>(
  items: readonly T[],
  limit = 5,
): T[] {
  const safeLimit = Math.max(0, Math.trunc(limit));

  return [...items].sort((left, right) => right.id - left.id).slice(0, safeLimit);
}

function toSortedNamedValues(grouped: ReadonlyMap<string, number>): NamedValue[] {
  return [...grouped.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort(
      (left, right) =>
        right.value - left.value || left.name.localeCompare(right.name, "en"),
    );
}
