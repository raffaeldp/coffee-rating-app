// Drink keys with FR/EN names in messages/*.json. Any other drink name is shown as written.
export const TRANSLATED_DRINKS = [
  "espresso",
  "ristretto",
  "lungo",
  "americano",
  "cappuccino",
  "latte",
  "latte_macchiato",
  "flat_white",
  "macchiato",
];

export type Machine = { slug: string; name: string; token: string; drinks: string[] };

// Parses and validates the MACHINES env var. Throws on anything wrong so the app fails at startup.
export function parseMachines(json: string | undefined): Machine[] {
  if (!json) throw new Error("MACHINES env var is missing");
  const list = JSON.parse(json);
  if (!Array.isArray(list) || list.length === 0) throw new Error("MACHINES must be a non-empty JSON array");
  const seen = new Set<string>();
  for (const m of list) {
    for (const key of ["slug", "name", "token"]) {
      if (typeof m[key] !== "string" || !m[key]) throw new Error(`MACHINES: "${key}" missing in ${JSON.stringify(m)}`);
    }
    if (m.token.length < 16) throw new Error(`MACHINES: token of "${m.slug}" must be at least 16 characters`);
    if (!Array.isArray(m.drinks) || m.drinks.length === 0) throw new Error(`MACHINES: "${m.slug}" needs drinks`);
    for (const d of m.drinks) {
      if (typeof d !== "string" || !d.trim() || d.length > 50) {
        throw new Error(`MACHINES: drink ${JSON.stringify(d)} of "${m.slug}" must be a non-empty name (max 50 chars)`);
      }
    }
    if (new Set(m.drinks).size !== m.drinks.length) throw new Error(`MACHINES: duplicate drink in "${m.slug}"`);
    for (const id of [`slug:${m.slug}`, `token:${m.token}`]) {
      if (seen.has(id)) throw new Error(`MACHINES: duplicate ${id.split(":")[0]} for "${m.slug}"`);
      seen.add(id);
    }
  }
  return list;
}

let machines: Machine[] | undefined;

export function getMachines() {
  return (machines ??= parseMachines(process.env.MACHINES));
}

export function machineByToken(token: string) {
  return getMachines().find((m) => m.token === token);
}

export function drinkLabel(t: (key: string) => string, drink: string) {
  return TRANSLATED_DRINKS.includes(drink) ? t(`drinks.${drink}`) : drink;
}
