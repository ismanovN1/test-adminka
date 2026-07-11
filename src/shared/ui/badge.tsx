import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-primary-subtle px-2.5 py-1 text-xs font-semibold text-primary-subtle-foreground",
        className,
      )}
      {...props}
    />
  );
}
