import type { Metadata } from "next";

import { OrdersWorkflow } from "@/features/orders/ui/orders-workflow";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return <OrdersWorkflow />;
}
