// Dev only: adds sample Coffees, Loads and Ratings for the first machine in MACHINES.
// Appends to the existing data (nothing is deleted). Run with `pnpm db:seed`.
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { coffees, loads, ratings } from "../lib/schema.ts";

if (process.env.NODE_ENV === "production") throw new Error("seed is for development only");
const machine = JSON.parse(process.env.MACHINES ?? "[]")[0];
if (!machine) throw new Error("MACHINES is empty: copy .env.example to .env first");

const db = drizzle(new Database(path.join(process.env.DATA_DIR ?? "./data", "coffee.db")));
migrate(db, { migrationsFolder: "drizzle" });

// deterministic pseudo-random, so every run produces the same kind of data
let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];
const maybe = <T,>(p: number, v: () => T) => (rand() < p ? v() : null);
const DAY = 24 * 60 * 60 * 1000;

const SAMPLES = [
  ["Lavazza Qualità Rossa", "Arabica et robusta, notes de chocolat, torréfaction moyenne."],
  ["Illy Classico", "100 % arabica, doux et équilibré, notes de caramel."],
  ["Segafredo Intermezzo", "Corsé, crème épaisse, idéal en espresso."],
  ["Carte Noire Espresso N°9", "Intense, notes grillées."],
  ["Kimbo Aroma Gold", "Napolitain, 100 % arabica, rond et aromatique."],
  ["Café Richard Perle Noire", "Torréfaction lente, notes de cacao."],
  ["Starbucks Espresso Roast", "Torréfaction foncée, notes caramélisées."],
  ["Malongo Pure Origine Éthiopie", "Fruité et floral, acidité vive."],
  ["Lavazza Crema e Gusto", "Robusta majoritaire, corps puissant."],
  ["Pellini Top Arabica", "Doux, notes de fruits secs."],
  ["L'Or Espresso Onyx", "Très intense, amertume marquée."],
  ["Dallmayr Crema d'Oro", "Arabica d'Amérique du Sud, onctueux."],
] as const;
const NAMES = ["Ana", "Lucas", "Inès", "Hugo", "Chloé", "Mehdi", "Sarah", "Tom"];
const COMMENTS = [
  "Très bon, rien à redire.",
  "Un peu trop amer à mon goût.",
  "Parfait le matin.",
  "Manque de corps.",
  "Excellent en lungo !",
  "Bof, je préférais le précédent.",
  "Belle crème, bon équilibre.",
  "Trop acide pour moi.",
];
const NOTES = ["chocolate", "nutty", "fruity", "caramel", "floral", "burnt"];

// One Load every ~5 days going back in time; each Coffee is rated while it is in the machine.
const start = Date.now() - SAMPLES.length * 5 * DAY;
let rated = 0;
SAMPLES.forEach(([name, description], i) => {
  const { id } = db.insert(coffees).values({ name, description, createdAt: new Date(start + i * 5 * DAY) }).returning({ id: coffees.id }).get();
  const loadedAt = start + i * 5 * DAY;
  db.insert(loads).values({ machine: machine.slug, coffeeId: id, createdAt: new Date(loadedAt) }).run();
  const quality = 1 + rand() * 4; // each Coffee has its own "true" level so averages differ
  const count = 2 + Math.floor(rand() * 9);
  for (let n = 0; n < count; n++) {
    const stars = Math.min(5, Math.max(0.5, Math.round((quality + (rand() - 0.5) * 2) * 2) / 2)); // half-star steps
    const scale = () => 1 + Math.floor(rand() * 5);
    db.insert(ratings)
      .values({
        machine: machine.slug,
        coffeeId: id,
        drink: pick(machine.drinks as string[]),
        stars,
        intensity: maybe(0.7, scale),
        bitterness: maybe(0.6, scale),
        acidity: maybe(0.5, scale),
        body: maybe(0.5, scale),
        notes: maybe(0.6, () => [...new Set([pick(NOTES), pick(NOTES)])]),
        again: maybe(0.7, () => stars >= 3),
        sugar: rand() < 0.3,
        comment: maybe(0.4, () => pick(COMMENTS)),
        name: maybe(0.6, () => pick(NAMES)),
        createdAt: new Date(Math.min(Date.now(), loadedAt + rand() * 5 * DAY)),
      })
      .run();
    rated++;
  }
});
console.log(`Seeded ${SAMPLES.length} coffees and ${rated} ratings on machine "${machine.slug}".`);
