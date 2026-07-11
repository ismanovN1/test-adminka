export type OrderStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  image: string;
}

export interface OrderLine {
  productId: number;
  title: string;
  thumbnail: string;
  unitPrice: number;
  quantity: number;
  grossTotal: number;
  discountPercentage: number;
  discountedTotal: number;
}

export interface Order {
  id: number;
  customerId: number;
  customer: UserSummary | null;
  lines: OrderLine[];
  totalProducts: number;
  totalQuantity: number;
  grossTotal: number;
  discountedTotal: number;
  status: OrderStatus;
  placedAt: string;
}

export interface OrderDataset {
  items: Order[];
  total: number;
}
