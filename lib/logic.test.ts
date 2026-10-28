import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMachines } from "./machines.ts";
import { sortCoffees, summarize } from "./stats.ts";
import { isValidStars } from "./tasting.ts";

const machine = { slug: "a", name: "A", token: "0123456789abcdef", drinks: ["espresso"] };

test("parseMachines accepts valid config, including free drink names", () => {
  assert.equal(parseMachines(JSON.stringify([machine]))[0].slug, "a");
  assert.deepEqual(parseMachines(JSON.stringify([{ ...machine, drinks: ["café", "chocolat chaud"] }]))[0].drinks, ["café", "chocolat chaud"]);
});

test("parseMachines rejects bad config", () => {
  assert.throws(() => parseMachines(undefined));
  assert.throws(() => parseMachines("[]"));
  assert.throws(() => parseMachines(JSON.stringify([{ ...machine, drinks: ["  "] }])), /non-empty/);
  assert.throws(() => parseMachines(JSON.stringify([{ ...machine, drinks: ["café", "café"] }])), /duplicate drink/);
  assert.throws(() => parseMachines(JSON.stringify([{ ...machine, token: "short" }])), /16/);
  assert.throws(() => parseMachines(JSON.stringify([machine, { ...machine, slug: "b" }])), /duplicate token/);
});

test("summarize aggregates per coffee, ignoring unanswered questions", () => {
  const base = { intensity: null, bitterness: null, acidity: null, body: null, notes: null, again: null, sugar: null };
  const s = summarize([
    { ...base, coffeeId: 1, drink: "espresso", stars: 4, intensity: 5, notes: ["nutty"], again: true, sugar: true },
    { ...base, coffeeId: 1, drink: "espresso", stars: 2, notes: ["nutty", "burnt"], again: false, sugar: false },
    { ...base, coffeeId: 1, drink: "lungo", stars: 3, intensity: 3 },
    { ...base, coffeeId: 2, drink: "lungo", stars: 4.5 },
    { ...base, coffeeId: 2, drink: "lungo", stars: 3.5 },
  ]);
  const c1 = s.get(1)!;
  assert.equal(c1.count, 3);
  assert.equal(c1.stars, 3);
  assert.deepEqual(c1.byDrink, { espresso: { count: 2, stars: 3 }, lungo: { count: 1, stars: 3 } });
  assert.equal(c1.scales.intensity, 4);
  assert.equal(c1.scales.body, null);
  assert.deepEqual(c1.notes, { nutty: 2, burnt: 1 });
  assert.deepEqual(c1.again, { yes: 1, no: 1 });
  assert.deepEqual(c1.sugar, { yes: 1, no: 1 }); // the third rating has sugar: null (old rating), counted in neither
  assert.equal(s.get(2)!.stars, 4); // average of half stars
});

test("isValidStars accepts half-star steps from 0.5 to 5 only", () => {
  for (const n of [0.5, 1, 3.5, 5]) assert.ok(isValidStars(n), String(n));
  for (const n of [0, 0.25, 3.3, 5.5, NaN]) assert.ok(!isValidStars(n), String(n));
});

test("sortCoffees orders by rating (unrated last), date or name", () => {
  const d = (day: number) => new Date(2026, 0, day);
  const list = [
    { id: 1, name: "Éthiopie", lastLoaded: d(3) },
    { id: 2, name: "arabica", lastLoaded: d(1) },
    { id: 3, name: "Zèbre", lastLoaded: d(2) },
    { id: 4, name: "Brésil", lastLoaded: d(4) },
  ];
  const base = { drink: "espresso", intensity: null, bitterness: null, acidity: null, body: null, notes: null, again: null, sugar: null };
  const stats = summarize([
    { ...base, coffeeId: 1, stars: 3.5 },
    { ...base, coffeeId: 2, stars: 4.5 },
    { ...base, coffeeId: 3, stars: 3.5 },
    { ...base, coffeeId: 3, stars: 3.5 },
  ]);
  const ids = (sort: "rating" | "date" | "name") => sortCoffees(list, stats, sort, "fr").map((c) => c.id);
  assert.deepEqual(ids("rating"), [2, 3, 1, 4]); // 3 beats 1 on count; 4 has no rating
  assert.deepEqual(ids("date"), [4, 1, 3, 2]);
  assert.deepEqual(ids("name"), [2, 4, 1, 3]); // case and accents ignored
});
