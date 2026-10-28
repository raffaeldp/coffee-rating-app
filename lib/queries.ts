import { notFound } from "next/navigation";
import { desc, eq, max } from "drizzle-orm";
import { db } from "./db";
import { coffees, loads } from "./schema";
import { machineByToken } from "./machines";

// Pages an edit can return to, relative to /m/<token>/. Whitelisted so the redirect can't leave the machine.
const BACK = /^(refill|dashboard(\/\d+)?)$/;
export const backPath = (token: string, back: string | undefined) =>
  `/m/${token}${back && BACK.test(back) ? `/${back}` : ""}`;

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
    .orderBy(desc(max(loads.createdAt)), desc(max(loads.id)))
    .all();
}

export function currentCoffee(machine: string) {
  return db
    .select({ id: coffees.id, name: coffees.name, description: coffees.description, photo: coffees.photo })
    .from(loads)
    .innerJoin(coffees, eq(loads.coffeeId, coffees.id))
    .where(eq(loads.machine, machine))
    .orderBy(desc(loads.createdAt), desc(loads.id))
    .limit(1)
    .get();
}
