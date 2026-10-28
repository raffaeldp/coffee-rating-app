export const DRINKS = [
  "espresso",
  "ristretto",
  "lungo",
  "americano",
  "cappuccino",
  "latte",
  "latte_macchiato",
  "flat_white",
  "macchiato",
] as const;
export type Drink = (typeof DRINKS)[number];

export type Machine = { slug: string; name: string; token: string; drinks: Drink[] };

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
      if (!DRINKS.includes(d)) throw new Error(`MACHINES: unknown drink "${d}" (known: ${DRINKS.join(", ")})`);
    }
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
