import { createDemoIsoDate } from "@/shared/config/demo";

export function deriveProductIndexedAt(id: number): string {
  const monthIndex = (id * 11) % 12;
  const day = ((id * 7) % 27) + 1;

  return createDemoIsoDate(monthIndex, day);
}

export function getDiscountedUnitPrice(
  price: number,
  discountPercentage: number,
): number {
  return price * (1 - discountPercentage / 100);
}

export function isOutOfStock(stock: number): boolean {
  return stock === 0;
}

export function isLowStock(stock: number): boolean {
  return stock > 0 && stock <= 10;
}
