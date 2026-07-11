import { cookies } from "next/headers";

import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";
import {
  defaultLocale,
  isAppLocale,
  localeCookieName,
  type AppLocale,
} from "./config";

const messages = { en, ru } as const;

export async function getAppLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  return isAppLocale(cookieLocale) ? cookieLocale : defaultLocale;
}

export function getAppMessages(locale: AppLocale) {
  return messages[locale];
}
