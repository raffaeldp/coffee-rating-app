"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SORTS, type Sort } from "@/lib/stats";

// Changing the order reloads the dashboard with ?sort=…, so the choice is in the URL (shareable, survives refresh).
export function SortSelect({ value }: { value: Sort }) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  return (
    <label className="sort">
      <span className="muted small">{t("sort")}</span>
      <select value={value} onChange={(e) => router.replace(`?sort=${e.target.value}`, { scroll: false })}>
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {t(`sorts.${s}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
