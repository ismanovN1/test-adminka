import type { CartDto } from "@/entities/order/api/schema";
import type { ProductDto } from "@/entities/product/api/schema";
import type { UserDto } from "@/entities/user/api/schema";

export function makeUserDto(overrides: Partial<UserDto> = {}): UserDto {
  return {
    id: 4,
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "+1 555 0100",
    image: "https://cdn.example.com/ada.png",
    role: "admin",
    company: { name: "Analytical Engines", department: "Engineering" },
    address: { country: "United Kingdom" },
    ...overrides,
  };
}

export function makeProductDto(
  overrides: Partial<ProductDto> = {},
): ProductDto {
  return {
    id: 11,
    title: "Precision Keyboard",
    description: "Low-profile mechanical keyboard",
    category: "electronics",
    brand: "Nexa",
    price: 120,
    discountPercentage: 10,
    rating: 4.5,
    stock: 8,
    thumbnail: "https://cdn.example.com/keyboard.png",
    images: ["https://cdn.example.com/keyboard-detail.png"],
    ...overrides,
  };
}

export function makeCartDto(overrides: Partial<CartDto> = {}): CartDto {
  return {
    id: 7,
    products: [
      {
        id: 11,
        title: "Precision Keyboard",
        price: 120,
        quantity: 2,
        total: 240,
        discountPercentage: 10,
        discountedTotal: 216,
        thumbnail: "https://cdn.example.com/keyboard.png",
      },
    ],
    total: 240,
    discountedTotal: 216,
    userId: 4,
    totalProducts: 1,
    totalQuantity: 2,
    ...overrides,
  };
}

export function makeUsersResponse(users: readonly unknown[] = [makeUserDto()]) {
  return { users: [...users], total: users.length, skip: 0, limit: 0 };
}

export function makeProductsResponse(products = [makeProductDto()]) {
  return { products, total: products.length, skip: 0, limit: 0 };
}

export function makeCartsResponse(carts = [makeCartDto()]) {
  return { carts, total: carts.length, skip: 0, limit: 0 };
}
