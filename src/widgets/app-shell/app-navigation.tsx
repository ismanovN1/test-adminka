"use client";

import { Layers3 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/cn";

import { navigationItems } from "./navigation";

interface AppNavigationProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function AppNavigation({ collapsed = false, onNavigate }: AppNavigationProps) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn("flex h-16 shrink-0 items-center gap-3 px-4", collapsed && "justify-center px-2")}>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Layers3 aria-hidden="true" className="size-5" />
        </span>
        {!collapsed && <span className="font-semibold tracking-tight">{t("common.appName")}</span>}
      </div>

      <nav aria-label={t("common.menu")} className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="grid gap-1" role="list">
          {navigationItems.map(({ href, icon: Icon, key }) => {
            const active = href === "/" ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus",
                    active
                      ? "bg-primary-subtle text-primary-subtle-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2",
                  )}
                  href={href}
                  onClick={onNavigate}
                  title={collapsed ? t(`nav.${key}`) : undefined}
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0" />
                  {!collapsed && <span>{t(`nav.${key}`)}</span>}
                  {collapsed && <span className="sr-only">{t(`nav.${key}`)}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Link
        className={cn(
          "m-3 flex min-h-14 items-center gap-3 rounded-xl border border-border p-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-focus",
          collapsed && "justify-center",
        )}
        href="/settings"
        onClick={onNavigate}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-subtle text-sm font-semibold text-primary-subtle-foreground">NA</span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">Test Admin</span>
            <span className="block truncate text-xs text-muted-foreground">{t("common.adminRole")}</span>
          </span>
        )}
        {collapsed && <span className="sr-only">{t("common.profile")}</span>}
      </Link>
    </div>
  );
}
