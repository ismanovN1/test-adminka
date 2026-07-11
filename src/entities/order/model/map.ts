import type { User } from "@/entities/user";

import type { CartDto, CartsResponseDto } from "../api/schema";
import { deriveOrderPlacedAt, deriveOrderStatus } from "./derive";
import type { Order, OrderDataset, UserSummary } from "./types";

function toUserSummary(user: User | undefined): UserSummary | null {
  return user
    ? {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        image: user.image,
      }
    : null;
}

export function mapOrder(dto: CartDto, usersById: ReadonlyMap<number, User>): Order {
  return {
    id: dto.id,
    customerId: dto.userId,
    customer: toUserSummary(usersById.get(dto.userId)),
    lines: dto.products.map((line) => ({
      productId: line.id,
      title: line.title,
      thumbnail: line.thumbnail,
      unitPrice: line.price,
      quantity: line.quantity,
      grossTotal: line.total,
      discountPercentage: line.discountPercentage,
      discountedTotal: line.discountedTotal,
    })),
    totalProducts: dto.totalProducts,
    totalQuantity: dto.totalQuantity,
    grossTotal: dto.total,
    discountedTotal: dto.discountedTotal,
    status: deriveOrderStatus(dto.id),
    placedAt: deriveOrderPlacedAt(dto.id, dto.userId),
  };
}

export function mapCartsResponse(
  dto: CartsResponseDto,
  users: readonly User[],
): OrderDataset {
  const usersById = new Map(users.map((user) => [user.id, user]));

  return {
    items: dto.carts.map((cart) => mapOrder(cart, usersById)),
    total: dto.total,
  };
}
