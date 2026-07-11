import type { Metadata } from "next";

import { AnalyticsWorkflow } from "@/widgets/analytics/analytics-workflow";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return <AnalyticsWorkflow />;
}
