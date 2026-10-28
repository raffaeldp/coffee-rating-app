import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { currentCoffee, machineOr404 } from "@/lib/queries";
import { Photo } from "@/app/photo";

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ thanks?: string }>;
}) {
  const { token } = await params;
  const { thanks } = await searchParams;
  const machine = machineOr404(token);
  const current = currentCoffee(machine.slug);
  const t = await getTranslations();
  return (
    <>
      <h1>{machine.name}</h1>
      {thanks && <p className="banner">{t("rate.thanks")}</p>}
      <div className="card row">
        {current && <Photo src={current.photo} />}
        <div className="grow">
          <div className="muted">{t("home.current")}</div>
          <strong>{current?.name ?? t("home.none")}</strong>
        </div>
      </div>
      <div className="stack">
        <Link className="btn" href={`/m/${token}/rate`}>{t("home.rate")}</Link>
        <Link className="btn secondary" href={`/m/${token}/refill`}>{t("home.refill")}</Link>
        <Link className="btn secondary" href={`/m/${token}/dashboard`}>{t("home.dashboard")}</Link>
        <Link className="muted small" href={`/m/${token}/qr`}>{t("home.qr")}</Link>
      </div>
    </>
  );
}
