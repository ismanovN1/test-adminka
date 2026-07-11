export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  brand: string | null;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
  indexedAt: string;
}

export interface ProductDataset {
  items: Product[];
  total: number;
}
