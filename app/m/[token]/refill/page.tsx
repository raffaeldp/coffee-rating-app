import Link from "next/link";
import { asc, like } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { coffees } from "@/lib/schema";
import { currentCoffee, machineOr404 } from "@/lib/queries";
import { loadCoffee } from "@/app/actions";
import { Photo } from "@/app/photo";

export default async function Refill({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { token } = await params;
  const { q = "" } = await searchParams;
  const machine = machineOr404(token);
  const current = currentCoffee(machine.slug);
  const list = db
    .select()
    .from(coffees)
    .where(q ? like(coffees.name, `%${q}%`) : undefined)
    .orderBy(asc(coffees.name))
    .all();
  const t = await getTranslations();
  return (
    <>
      <Link href={`/m/${token}`}>{t("common.back")}</Link>
      <h1>{t("refill.title")}</h1>
      <Link className="btn" href={`/m/${token}/coffee/new`}>+ {t("refill.new")}</Link>
      <form className="row" style={{ margin: "16px 0" }}>
        <input type="search" name="q" defaultValue={q} placeholder={t("refill.search")} aria-label={t("refill.search")} />
        <button className="btn inline secondary">{t("refill.searchButton")}</button>
      </form>
      {list.length === 0 && <p className="muted">{t("refill.none")}</p>}
      {list.map((c) => (
        <div key={c.id} className="card row">
          <Photo src={c.photo} />
          <div className="grow">
            <strong>{c.name}</strong>
            {c.id === current?.id && <span className="muted"> · {t("refill.current")}</span>}
            <div>
              <Link className="small" href={`/m/${token}/coffee/${c.id}`}>{t("refill.edit")}</Link>
            </div>
          </div>
          <form action={loadCoffee.bind(null, token, c.id)}>
            <button className="btn inline">{t("refill.load")}</button>
          </form>
        </div>
      ))}
    </>
  );
}
