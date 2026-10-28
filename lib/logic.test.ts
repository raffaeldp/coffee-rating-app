import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMachines } from "./machines.ts";
import { summarize } from "./stats.ts";

const machine = { slug: "a", name: "A", token: "0123456789abcdef", drinks: ["espresso"] };

test("parseMachines accepts valid config", () => {
  assert.equal(parseMachines(JSON.stringify([machine]))[0].slug, "a");
});

test("parseMachines rejects bad config", () => {
  assert.throws(() => parseMachines(undefined));
  assert.throws(() => parseMachines("[]"));
  assert.throws(() => parseMachines(JSON.stringify([{ ...machine, drinks: ["tea"] }])), /unknown drink/);
  assert.throws(() => parseMachines(JSON.stringify([{ ...machine, token: "short" }])), /16/);
  assert.throws(() => parseMachines(JSON.stringify([machine, { ...machine, slug: "b" }])), /duplicate token/);
});

test("summarize aggregates per coffee, ignoring unanswered questions", () => {
  const base = { intensity: null, bitterness: null, acidity: null, body: null, notes: null, again: null };
  const s = summarize([
    { ...base, coffeeId: 1, drink: "espresso", stars: 4, intensity: 5, notes: ["nutty"], again: true },
    { ...base, coffeeId: 1, drink: "espresso", stars: 2, notes: ["nutty", "burnt"], again: false },
    { ...base, coffeeId: 1, drink: "lungo", stars: 3, intensity: 3 },
    { ...base, coffeeId: 2, drink: "lungo", stars: 5 },
  ]);
  const c1 = s.get(1)!;
  assert.equal(c1.count, 3);
  assert.equal(c1.stars, 3);
  assert.deepEqual(c1.byDrink, { espresso: { count: 2, stars: 3 }, lungo: { count: 1, stars: 3 } });
  assert.equal(c1.scales.intensity, 4);
  assert.equal(c1.scales.body, null);
  assert.deepEqual(c1.notes, { nutty: 2, burnt: 1 });
  assert.deepEqual(c1.again, { yes: 1, no: 1 });
  assert.equal(s.get(2)!.stars, 5);
});
