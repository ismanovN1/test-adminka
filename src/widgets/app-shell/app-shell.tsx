"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { LocaleControl } from "@/features/preferences/locale-control";
import { usePreferencesStore } from "@/features/preferences/preferences-store";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

import { AppNavigation } from "./app-navigation";
import { MobileDrawer } from "./mobile-drawer";
import { getActiveNavigation } from "./navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const t = useTranslations();
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = usePreferencesStore((state) => state.setSidebarCollapsed);
  const active = getActiveNavigation(pathname);
  const pageTitle = active ? t(`nav.${active.key}`) : t("errors.notFoundTitle");
  const pageDescription = active
    ? t(`pages.${active.key}.description`)
    : t("errors.notFoundDescription");
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="flex h-dvh min-h-[32rem] overflow-hidden bg-background">
      <a
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground outline-none transition-transform focus:translate-y-0 focus:ring-2 focus:ring-focus focus:ring-offset-2"
        href="#main-content"
      >
        {t("common.skipToContent")}
      </a>

      <aside className="hidden w-[4.5rem] shrink-0 border-r border-border bg-surface md:flex xl:hidden">
        <AppNavigation collapsed />
      </aside>
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-surface transition-[width] duration-200 motion-reduce:transition-none xl:flex",
          sidebarCollapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div className="relative flex w-full">
          <AppNavigation collapsed={sidebarCollapsed} />
          <Button
            aria-label={
              sidebarCollapsed
                ? t("common.expandSidebar")
                : t("common.collapseSidebar")
            }
            className="absolute -right-[1.375rem] top-[4.75rem] z-10 size-11 rounded-full px-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            variant="secondary"
          >
            {sidebarCollapsed ? (
              <ChevronRight aria-hidden="true" className="size-4" />
            ) : (
              <ChevronLeft aria-hidden="true" className="size-4" />
            )}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Button
            aria-label={t("common.openMenu")}
            className="size-11 px-0 md:hidden"
            onClick={() => setDrawerOpen(true)}
            ref={menuTriggerRef}
            variant="ghost"
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold sm:text-base">{pageTitle}</h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">{pageDescription}</p>
          </div>
          <LocaleControl />
          <ThemeToggle />
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto" id="main-content" tabIndex={-1}>
          <div className="mx-auto w-full max-w-[100rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <MobileDrawer
        onClose={closeDrawer}
        open={drawerOpen}
        trigger={menuTriggerRef.current}
      />
    </div>
  );
}
