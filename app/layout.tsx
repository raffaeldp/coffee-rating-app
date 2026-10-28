import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { setLocale } from "./actions";
import { LOCALES } from "@/i18n/request";
import "./globals.css";

export const metadata: Metadata = { title: "Coffee rating", robots: { index: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getTranslations("common");
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <header className="top">
            <span>☕ {t("app")}</span>
            <form action={setLocale} className="lang">
              {LOCALES.map((l) => (
                <button key={l} name="locale" value={l} aria-pressed={l === locale}>
                  {l.toUpperCase()}
                </button>
              ))}
            </form>
          </header>
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
