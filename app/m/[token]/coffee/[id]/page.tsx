import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { coffees } from "@/lib/schema";
import { backPath, machineOr404 } from "@/lib/queries";
import { saveCoffee } from "@/app/actions";
import { CoffeeForm } from "./coffee-form";

// id is "new" to create a Coffee (which also loads it), or a Coffee id to edit it.
// ?back=dashboard|dashboard/<id>|refill is where to return after saving (edit only; a new Coffee returns home).
export default async function CoffeePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string; id: string }>;
  searchParams: Promise<{ back?: string }>;
}) {
  const { token, id } = await params;
  const { back = "refill" } = await searchParams;
  machineOr404(token);
  const coffee = id === "new" ? null : (db.select().from(coffees).where(eq(coffees.id, Number(id))).get() ?? notFound());
  const t = await getTranslations();
  return (
    <>
      <Link href={backPath(token, back)}>{t("common.back")}</Link>
      <h1>{coffee ? t("refill.editTitle") : t("refill.new")}</h1>
      <CoffeeForm action={saveCoffee.bind(null, token, coffee?.id ?? null, coffee ? back : undefined)} coffee={coffee} />
    </>
  );
}
