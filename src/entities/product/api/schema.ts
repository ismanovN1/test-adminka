import { z } from "zod";

const productDtoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1),
  description: z.string().default(""),
  category: z.string().trim().min(1),
  brand: z.string().min(1).optional(),
  price: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100),
  rating: z.number().min(0).max(5),
  stock: z.number().int().nonnegative(),
  thumbnail: z.string().default(""),
  images: z.array(z.string()).default([]),
});

export const productsResponseSchema = z.object({
  products: z.array(productDtoSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

export type ProductDto = z.infer<typeof productDtoSchema>;
export type ProductsResponseDto = z.infer<typeof productsResponseSchema>;
