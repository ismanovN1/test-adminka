import { z } from "zod";

const cartLineDtoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  total: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100),
  discountedTotal: z.number().nonnegative(),
  thumbnail: z.string().default(""),
});

const cartDtoSchema = z.object({
  id: z.number().int().positive(),
  products: z.array(cartLineDtoSchema),
  total: z.number().nonnegative(),
  discountedTotal: z.number().nonnegative(),
  userId: z.number().int().positive(),
  totalProducts: z.number().int().nonnegative(),
  totalQuantity: z.number().int().nonnegative(),
});

export const cartsResponseSchema = z.object({
  carts: z.array(cartDtoSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

export type CartDto = z.infer<typeof cartDtoSchema>;
export type CartsResponseDto = z.infer<typeof cartsResponseSchema>;
