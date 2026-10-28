import Link from "next/link";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { getFormatter, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { coffees, loads, ratings } from "@/lib/schema";
import { loadedCoffees, machineOr404 } from "@/lib/queries";
import { summarize } from "@/lib/stats";
import { SCALES } from "@/lib/tasting";
import { drinkLabel } from "@/lib/machines";
import { Photo } from "@/app/photo";

const Bar = ({ value, max = 5 }: { value: number; max?: number }) => (
  <div className="bar">
    <span style={{ width: `${(value / max) * 100}%` }} />
  </div>
);

export default async function Dashboard({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const machine = machineOr404(token);
  const list = loadedCoffees(machine.slug);
  const stats = summarize(db.select().from(ratings).where(eq(ratings.machine, machine.slug)).all());
  const names = new Map(list.map((c) => [c.id, c.name]));
  const comments = db
    .select()
    .from(ratings)
    .where(and(eq(ratings.machine, machine.slug), isNotNull(ratings.comment)))
    .orderBy(desc(ratings.id))
    .limit(20)
    .all();
  const timeline = db
    .select({ id: loads.id, at: loads.createdAt, name: coffees.name })
    .from(loads)
    .innerJoin(coffees, eq(loads.coffeeId, coffees.id))
    .where(eq(loads.machine, machine.slug))
    .orderBy(desc(loads.id))
    .limit(50)
    .all();
  const t = await getTranslations();
  const format = await getFormatter();
  const date = (d: Date) => format.dateTime(d, { dateStyle: "medium" });

  return (
    <>
      <Link href={`/m/${token}`}>{t("common.back")}</Link>
      <h1>
        {t("dashboard.title")} · {machine.name}
      </h1>
      {list.length === 0 && <p className="muted">{t("dashboard.empty")}</p>}

      {list.map((c) => {
        const s = stats.get(c.id);
        const notes = Object.entries(s?.notes ?? {}).sort((a, b) => b[1] - a[1]);
        return (
          <section key={c.id} className="card">
            <div className="row">
              <Photo src={c.photo} />
              <div className="grow">
                <strong>{c.name}</strong>
                <div>
                  {s && <span className="star-text">★ {s.stars.toFixed(1)} </span>}
                  {s ? (
                    <Link href={`/m/${token}/dashboard/${c.id}`}>{t("dashboard.ratings", { count: s.count })}</Link>
                  ) : (
                    <span className="muted">{t("dashboard.ratings", { count: 0 })}</span>
                  )}
                </div>
                <div className="muted small">{t("dashboard.lastLoaded", { date: date(c.lastLoaded) })}</div>
              </div>
            </div>
            {c.description && <p className="small">{c.description}</p>}
            {s && (
              <>
                <h3>{t("dashboard.byDrink")}</h3>
                <div className="kv">
                  {Object.entries(s.byDrink).map(([drink, d]) => (
                    <Row key={drink} label={`${drinkLabel(t, drink)} (${d.count})`} value={d.stars} />
                  ))}
                </div>
                {SCALES.some((k) => s.scales[k] != null) && (
                  <>
                    <h3>{t("dashboard.tasting")}</h3>
                    <div className="kv">
                      {SCALES.map((k) => s.scales[k] != null && <Row key={k} label={t(`tasting.${k}.label`)} value={s.scales[k]} />)}
                    </div>
                  </>
                )}
                {notes.length > 0 && (
                  <p className="small">
                    <strong>{t("dashboard.notes")} </strong>
                    {notes.map(([n, count]) => `${t(`tasting.notes.items.${n}`)} (${count})`).join(", ")}
                  </p>
                )}
                {s.again.yes + s.again.no > 0 && <p className="small">{t("dashboard.again", s.again)}</p>}
              </>
            )}
          </section>
        );
      })}

      {comments.length > 0 && (
        <>
          <h2>{t("dashboard.comments")}</h2>
          <ul className="plain">
            {comments.map((r) => (
              <li key={r.id}>
                “{r.comment}”
                <div className="muted small">
                  {r.name ?? t("common.anonymous")} · {names.get(r.coffeeId)} · {drinkLabel(t, r.drink)} ·{" "}
                  <span className="star-text">{"★".repeat(r.stars)}</span> · {date(r.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {timeline.length > 0 && (
        <>
          <h2>{t("dashboard.timeline")}</h2>
          <ul className="plain">
            {timeline.map((l) => (
              <li key={l.id}>
                <span className="muted">{date(l.at)}</span> · {l.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <>
      <span>{label}</span>
      <Bar value={value} />
      <span>{value.toFixed(1)}</span>
    </>
  );
}
