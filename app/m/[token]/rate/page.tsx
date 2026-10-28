import { Fragment } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { loadedCoffees, machineOr404 } from "@/lib/queries";
import { NOTES, SCALES } from "@/lib/tasting";
import { drinkLabel } from "@/lib/machines";
import { rate } from "@/app/actions";
import { CoffeePicker } from "./coffee-picker";

export default async function Rate({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const machine = machineOr404(token);
  const coffees = loadedCoffees(machine.slug);
  const t = await getTranslations();

  if (coffees.length === 0) {
    return (
      <>
        <Link href={`/m/${token}`}>{t("common.back")}</Link>
        <p>{t("rate.noCoffee")}</p>
        <Link className="btn" href={`/m/${token}/refill`}>{t("rate.goRefill")}</Link>
      </>
    );
  }

  const help = (key: string) => (
    <details className="help">
      <summary>{t("rate.whatIsIt")}</summary>
      <p>{t(`tasting.${key}.help`)}</p>
    </details>
  );

  return (
    <>
      <Link href={`/m/${token}`}>{t("common.back")}</Link>
      <h1>{t("rate.title")}</h1>
      <form action={rate.bind(null, token)}>
        <CoffeePicker coffees={coffees.map(({ id, name, photo }) => ({ id, name, photo }))} />

        <fieldset className="chips">
          <legend>{t("rate.drink")}</legend>
          {machine.drinks.map((d, i) => (
            <span key={d}>
              <input type="radio" name="drink" id={`d-${i}`} value={d} required />
              <label htmlFor={`d-${i}`}>{drinkLabel(t, d)}</label>
            </span>
          ))}
        </fieldset>

        <fieldset className="chips">
          <legend>{t("rate.sugar")}</legend>
          {(["yes", "no"] as const).map((v) => (
            <span key={v}>
              <input type="radio" name="sugar" id={`sugar-${v}`} value={v} defaultChecked={v === "no"} />
              <label htmlFor={`sugar-${v}`}>{t(`common.${v}`)}</label>
            </span>
          ))}
        </fieldset>

        <fieldset>
          <legend>{t("rate.stars")}</legend>
          <div className="stars">
            {[5, 4, 3, 2, 1].map((n) => (
              <Fragment key={n}>
                <input type="radio" name="stars" id={`s${n}`} value={n} required />
                <label htmlFor={`s${n}`} aria-label={`${n}/5`}>★</label>
              </Fragment>
            ))}
          </div>
        </fieldset>

        <h2>
          {t("rate.tasting")} <span className="muted">· {t("rate.optional")}</span>
        </h2>

        {SCALES.map((s) => (
          <fieldset key={s}>
            <legend>{t(`tasting.${s}.label`)}</legend>
            {help(s)}
            <div className="chips">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n}>
                  <input type="radio" name={s} id={`${s}${n}`} value={n} />
                  <label htmlFor={`${s}${n}`}>{n}</label>
                </span>
              ))}
            </div>
            <div className="scale-ends">
              <span>{t(`tasting.${s}.low`)}</span>
              <span>{t(`tasting.${s}.high`)}</span>
            </div>
          </fieldset>
        ))}

        <fieldset>
          <legend>{t("tasting.notes.label")}</legend>
          {help("notes")}
          <div className="chips">
            {NOTES.map((n) => (
              <span key={n}>
                <input type="checkbox" name="notes" id={`n-${n}`} value={n} />
                <label htmlFor={`n-${n}`}>{t(`tasting.notes.items.${n}`)}</label>
              </span>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{t("tasting.again.label")}</legend>
          {help("again")}
          <div className="chips">
            {(["yes", "no"] as const).map((v) => (
              <span key={v}>
                <input type="radio" name="again" id={`a-${v}`} value={v} />
                <label htmlFor={`a-${v}`}>{t(`tasting.again.${v}`)}</label>
              </span>
            ))}
          </div>
        </fieldset>

        <label className="field" htmlFor="comment">
          {t("rate.comment")} <span className="muted">· {t("rate.optional")}</span>
        </label>
        <textarea id="comment" name="comment" rows={3} maxLength={1000} />
        <label className="field" htmlFor="name">
          {t("rate.name")} <span className="muted">· {t("rate.optional")}</span>
        </label>
        <input id="name" name="name" type="text" maxLength={50} autoComplete="given-name" />
        <p>
          <button className="btn">{t("rate.submit")}</button>
        </p>
      </form>
    </>
  );
}
