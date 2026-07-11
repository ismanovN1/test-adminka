import type { Metadata } from "next";

import { DashboardWorkflow } from "@/widgets/dashboard/dashboard-workflow";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <DashboardWorkflow />;
}
