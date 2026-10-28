import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export const LOCALES = ["fr", "en"] as const;

export default getRequestConfig(async () => {
  const cookie = (await cookies()).get("locale")?.value;
  // ponytail: first Accept-Language entry only; full q-value negotiation if more locales are added
  const browser = (await headers()).get("accept-language")?.slice(0, 2);
  const locale = [cookie, browser].find((l) => LOCALES.includes(l as never)) ?? "fr";
  return { locale, timeZone: process.env.TZ ?? "Europe/Paris", messages: (await import(`../messages/${locale}.json`)).default };
});
