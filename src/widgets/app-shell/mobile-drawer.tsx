"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { Button } from "@/shared/ui/button";

import { AppNavigation } from "./app-navigation";

interface MobileDrawerProps {
  onClose: () => void;
  open: boolean;
  trigger: HTMLButtonElement | null;
}

export function MobileDrawer({ onClose, open, trigger }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("button, a")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [onClose, open, trigger]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        aria-label={t("common.closeMenu")}
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <div
        aria-label={t("common.menu")}
        aria-modal="true"
        className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-border bg-surface shadow-xl"
        ref={panelRef}
        role="dialog"
      >
        <Button
          aria-label={t("common.closeMenu")}
          className="absolute right-3 top-2.5 z-10 size-11 px-0"
          onClick={onClose}
          variant="ghost"
        >
          <X aria-hidden="true" className="size-5" />
        </Button>
        <AppNavigation onNavigate={onClose} />
      </div>
    </div>
  );
}
