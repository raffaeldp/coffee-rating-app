"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Photo } from "@/app/photo";

type Coffee = { id: number; name: string; photo: string | null };

// Coffees loaded on this Machine, most recent first: the first is the Current Coffee (pre-selected).
// Shows 3, then 5 more per "show more" click, client-side so the rest of the form isn't lost.
export function CoffeePicker({ coffees }: { coffees: Coffee[] }) {
  const t = useTranslations("rate");
  const [shown, setShown] = useState(3);
  const more = Math.min(5, coffees.length - shown);
  return (
    <fieldset className="pick">
      <legend>{t("coffee")}</legend>
      {coffees.slice(0, shown).map((c, i) => (
        <div key={c.id}>
          <input type="radio" name="coffee" id={`c${c.id}`} value={c.id} defaultChecked={i === 0} required />
          <label htmlFor={`c${c.id}`}>
            <Photo src={c.photo} zoom={false} />
            <strong className="grow">{c.name}</strong>
            {i === 0 && <span className="tag">{t("inMachine")}</span>}
          </label>
        </div>
      ))}
      {more > 0 && (
        <button type="button" className="link" onClick={() => setShown(shown + 5)}>
          {t("showMore", { count: more })}
        </button>
      )}
    </fieldset>
  );
}
