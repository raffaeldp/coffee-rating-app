import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getFormatter, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { ratings } from "@/lib/schema";
import { loadedCoffees, machineOr404 } from "@/lib/queries";
import { drinkLabel } from "@/lib/machines";
import { SCALES } from "@/lib/tasting";
import { Photo } from "@/app/photo";
import { EditLink } from "@/app/edit-link";

// Every Rating of one Coffee on this Machine, newest first
export default async function CoffeeRatings({ params }: { params: Promise<{ token: string; coffee: string }> }) {
  const { token, coffee: coffeeId } = await params;
  const machine = machineOr404(token);
  const coffee = loadedCoffees(machine.slug).find((c) => c.id === Number(coffeeId)) ?? notFound();
  const list = db
    .select()
    .from(ratings)
    .where(and(eq(ratings.machine, machine.slug), eq(ratings.coffeeId, coffee.id)))
    .orderBy(desc(ratings.id))
    .all();
  const t = await getTranslations();
  const format = await getFormatter();

  return (
    <>
      <Link href={`/m/${token}/dashboard`}>{t("common.back")}</Link>
      <div className="row" style={{ margin: "8px 0 16px" }}>
        <Photo src={coffee.photo} />
        <div className="grow">
          <h1 style={{ margin: 0 }}>{coffee.name}</h1>
          <span className="muted">{t("dashboard.ratings", { count: list.length })}</span>
        </div>
        <EditLink token={token} coffeeId={coffee.id} back={`dashboard/${coffee.id}`} label={t("refill.edit")} />
      </div>

      {list.map((r) => {
        const answers = [
          ...(r.sugar == null ? [] : [t(r.sugar ? "rate.withSugar" : "rate.noSugar")]),
          ...SCALES.flatMap((s) => (r[s] == null ? [] : [`${t(`tasting.${s}.label`)} ${r[s]}/5`])),
          ...(r.notes ?? []).map((n) => t(`tasting.notes.items.${n}`)),
          ...(r.again == null ? [] : [`${t("tasting.again.label")} ${t(`tasting.again.${r.again ? "yes" : "no"}`)}`]),
        ];
        return (
          <section key={r.id} className="card">
            <div>
              <span className="star-text">{"★".repeat(r.stars)}</span>
              <span className="muted">{"★".repeat(5 - r.stars)}</span> · <strong>{drinkLabel(t, r.drink)}</strong>
            </div>
            <div className="muted small">
              {r.name ?? t("common.anonymous")} · {format.dateTime(r.createdAt, { dateStyle: "medium", timeStyle: "short" })}
            </div>
            {answers.length > 0 && <p className="small">{answers.join(" · ")}</p>}
            {r.comment && <p>“{r.comment}”</p>}
          </section>
        );
      })}
    </>
  );
}
