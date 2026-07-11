import { ArrowRight, CheckCircle2, Layers3 } from "lucide-react";

import { ThemeControl } from "@/features/theme/theme-control";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";

const foundationItems = [
  "Next.js 15 App Router",
  "Strict TypeScript",
  "Semantic theme tokens",
  "TanStack Query provider",
];

export default function Home() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,var(--color-primary-glow),transparent_68%)]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Layers3 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="font-semibold tracking-tight">Nexa Admin</p>
              <p className="text-sm text-muted-foreground">Foundation preview</p>
            </div>
          </div>
          <ThemeControl />
        </header>

        <section className="grid items-start gap-6 py-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:py-14">
          <div className="max-w-3xl">
            <Badge>Phase 1</Badge>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              A clear foundation for the analytics workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              The provider boundary, design tokens, accessibility baseline, and
              reusable UI primitives are ready. Product features intentionally
              begin in later phases.
            </p>
          </div>

          <Card className="p-3 sm:p-4">
            <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
              <p className="text-sm font-medium text-muted-foreground">
                Foundation status
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">
                4 / 4
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full rounded-full bg-primary" />
              </div>
            </div>
            <ul className="grid gap-1 p-2 pt-3" role="list">
              {foundationItems.map((item) => (
                <li
                  className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm"
                  key={item}
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4 shrink-0 text-success"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <footer className="flex flex-col gap-3 border-t border-border py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Dashboard features are outside this bootstrap phase.</p>
          <p className="inline-flex items-center gap-2 font-medium text-foreground">
            Foundation ready
            <ArrowRight aria-hidden="true" className="size-4" />
          </p>
        </footer>
      </div>
    </main>
  );
}
