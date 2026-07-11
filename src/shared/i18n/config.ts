export const locales = ["ru", "en"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "ru";
export const localeCookieName = "NEXT_LOCALE";

export function isAppLocale(value: string | undefined): value is AppLocale {
  return locales.some((locale) => locale === value);
}
