import type { Metadata } from "next";

import { UsersWorkflow } from "@/features/users/ui/users-workflow";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage() {
  return <UsersWorkflow />;
}
