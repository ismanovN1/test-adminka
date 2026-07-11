import type { ProductDto, ProductsResponseDto } from "../api/schema";
import { deriveProductIndexedAt } from "./derive";
import type { Product, ProductDataset } from "./types";

export function mapProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    title: dto.title.trim(),
    description: dto.description,
    category: dto.category.trim(),
    brand: dto.brand?.trim() || null,
    price: dto.price,
    discountPercentage: dto.discountPercentage,
    rating: dto.rating,
    stock: dto.stock,
    thumbnail: dto.thumbnail,
    images: dto.images,
    indexedAt: deriveProductIndexedAt(dto.id),
  };
}

export function mapProductsResponse(dto: ProductsResponseDto): ProductDataset {
  return {
    items: dto.products.map(mapProduct),
    total: dto.total,
  };
}
