"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/button";

const themes = ["light", "dark", "system"] as const;
type Theme = (typeof themes)[number];

const icons = { light: Sun, dark: Moon, system: Monitor };

function isTheme(value: string | undefined): value is Theme {
  return themes.some((theme) => theme === value);
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations();

  useEffect(() => setMounted(true), []);

  const currentTheme = isTheme(theme) ? theme : "system";
  const Icon = icons[currentTheme];

  if (!mounted) {
    return <span aria-hidden="true" className="block size-11 shrink-0" />;
  }

  function cycleTheme() {
    const index = themes.indexOf(currentTheme);
    setTheme(themes[(index + 1) % themes.length]);
  }

  return (
    <Button
      aria-label={t("theme.current", { theme: t(`theme.${currentTheme}`) })}
      className="size-11 shrink-0 px-0"
      onClick={cycleTheme}
      title={t("common.changeTheme")}
      variant="ghost"
    >
      <Icon aria-hidden="true" className="size-5" />
    </Button>
  );
}
