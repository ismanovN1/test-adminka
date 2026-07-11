import type { Metadata } from "next";

import { ProductsWorkflow } from "@/features/products/ui/products-workflow";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return <ProductsWorkflow />;
}
