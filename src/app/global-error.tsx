"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ru">
      <body>
        <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
          <div className="max-w-lg rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold">Не удалось загрузить приложение</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Application failed to load. Обновите страницу или повторите попытку.
            </p>
            <button
              className="mt-6 min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
              onClick={reset}
              type="button"
            >
              Повторить · Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
