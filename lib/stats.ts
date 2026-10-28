import { SCALES, type Scale } from "./tasting.ts";

type RatingRow = {
  coffeeId: number;
  drink: string;
  stars: number;
  notes: string[] | null;
  again: boolean | null;
} & Record<Scale, number | null>;

export type CoffeeStats = {
  count: number;
  stars: number;
  byDrink: Record<string, { count: number; stars: number }>;
  scales: Record<Scale, number | null>;
  notes: Record<string, number>;
  again: { yes: number; no: number };
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

// ponytail: aggregates in JS over one machine's ratings; move to SQL GROUP BY if that ever gets slow
export function summarize(rows: RatingRow[]): Map<number, CoffeeStats> {
  const groups = Map.groupBy(rows, (r) => r.coffeeId);
  const out = new Map<number, CoffeeStats>();
  for (const [coffeeId, rs] of groups) {
    const byDrink: CoffeeStats["byDrink"] = {};
    for (const [drink, ds] of Map.groupBy(rs, (r) => r.drink)) {
      byDrink[drink] = { count: ds.length, stars: avg(ds.map((r) => r.stars))! };
    }
    const scales = Object.fromEntries(
      SCALES.map((s) => [s, avg(rs.flatMap((r) => (r[s] == null ? [] : [r[s]])))]),
    ) as CoffeeStats["scales"];
    const notes: Record<string, number> = {};
    for (const n of rs.flatMap((r) => r.notes ?? [])) notes[n] = (notes[n] ?? 0) + 1;
    out.set(coffeeId, {
      count: rs.length,
      stars: avg(rs.map((r) => r.stars))!,
      byDrink,
      scales,
      notes,
      again: { yes: rs.filter((r) => r.again === true).length, no: rs.filter((r) => r.again === false).length },
    });
  }
  return out;
}
