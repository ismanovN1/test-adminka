"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/button";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeControl() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div aria-hidden="true" className="h-11 w-full max-w-80" />;
  }

  return (
    <div
      aria-label="Color theme"
      className="grid w-full max-w-80 grid-cols-3 gap-1 rounded-2xl border border-border bg-muted/60 p-1"
      role="group"
    >
      {themeOptions.map(({ value, label, icon: Icon }) => (
        <Button
          aria-label={`${label} theme`}
          aria-pressed={theme === value}
          className="px-2"
          key={value}
          onClick={() => setTheme(value)}
          variant={theme === value ? "secondary" : "ghost"}
        >
          <Icon aria-hidden="true" className="size-4" />
          <span className="hidden min-[420px]:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}
