import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date());

export const coffees = sqliteTable("coffees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  photo: text("photo"),
  createdAt: createdAt(),
});

export const loads = sqliteTable("loads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  machine: text("machine").notNull(),
  coffeeId: integer("coffee_id")
    .notNull()
    .references(() => coffees.id),
  createdAt: createdAt(),
});

export const ratings = sqliteTable("ratings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  machine: text("machine").notNull(),
  coffeeId: integer("coffee_id")
    .notNull()
    .references(() => coffees.id),
  drink: text("drink").notNull(),
  stars: real("stars").notNull(), // 0.5 to 5 in steps of 0.5
  intensity: integer("intensity"),
  bitterness: integer("bitterness"),
  acidity: integer("acidity"),
  body: integer("body"),
  notes: text("notes", { mode: "json" }).$type<string[]>(),
  again: integer("again", { mode: "boolean" }),
  sugar: integer("sugar", { mode: "boolean" }),
  comment: text("comment"),
  name: text("name"),
  createdAt: createdAt(),
});

export type Rating = typeof ratings.$inferSelect;
