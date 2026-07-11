import type { Metadata } from "next";

import { SettingsWorkflow } from "@/features/settings/ui/settings-workflow";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsWorkflow />;
}
