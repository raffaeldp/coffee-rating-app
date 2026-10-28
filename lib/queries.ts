import { notFound } from "next/navigation";
import { desc, eq, max } from "drizzle-orm";
import { db } from "./db";
import { coffees, loads } from "./schema";
import { machineByToken } from "./machines";

export function machineOr404(token: string) {
  return machineByToken(token) ?? notFound();
}

// Coffees ever loaded on this machine, most recently loaded first. The first one is the Current Coffee.
export function loadedCoffees(machine: string) {
  return db
    .select({
      id: coffees.id,
      name: coffees.name,
      description: coffees.description,
      photo: coffees.photo,
      lastLoaded: max(loads.createdAt).mapWith(loads.createdAt),
    })
    .from(loads)
    .innerJoin(coffees, eq(loads.coffeeId, coffees.id))
    .where(eq(loads.machine, machine))
    .groupBy(coffees.id)
    .orderBy(desc(max(loads.id)))
    .all();
}

export function currentCoffee(machine: string) {
  return db
    .select({ id: coffees.id, name: coffees.name, description: coffees.description, photo: coffees.photo })
    .from(loads)
    .innerJoin(coffees, eq(loads.coffeeId, coffees.id))
    .where(eq(loads.machine, machine))
    .orderBy(desc(loads.id))
    .limit(1)
    .get();
}
