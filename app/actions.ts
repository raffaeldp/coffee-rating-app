"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db, uploadDir } from "@/lib/db";
import { coffees, loads, ratings } from "@/lib/schema";
import { machineOr404 } from "@/lib/queries";
import { LOCALES } from "@/i18n/request";
import { NOTES, SCALES } from "@/lib/tasting";
import type { Drink } from "@/lib/machines";

const MAX_PHOTO = 2 * 1024 * 1024;

export async function setLocale(formData: FormData) {
  const locale = String(formData.get("locale"));
  if (LOCALES.includes(locale as never)) {
    (await cookies()).set("locale", locale, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
}

const text = (formData: FormData, key: string, max: number) => {
  const v = String(formData.get(key) ?? "").trim();
  if (v.length > max) throw new Error(`${key} too long`);
  return v;
};

// 1–5, or null when the optional question was skipped
const scale = (formData: FormData, key: string) => {
  const v = formData.get(key);
  if (!v) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error(`invalid ${key}`);
  return n;
};

export async function loadCoffee(token: string, coffeeId: number) {
  const machine = machineOr404(token);
  if (!db.select({ id: coffees.id }).from(coffees).where(eq(coffees.id, coffeeId)).get()) throw new Error("unknown coffee");
  db.insert(loads).values({ machine: machine.slug, coffeeId }).run();
  redirect(`/m/${token}`);
}

export async function saveCoffee(token: string, id: number | null, formData: FormData) {
  const machine = machineOr404(token);
  const name = text(formData, "name", 100);
  if (!name) throw new Error("name required");
  const description = text(formData, "description", 1000);

  let photo: string | undefined;
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    if (file.type !== "image/jpeg" || file.size > MAX_PHOTO) throw new Error("photo must be a JPEG under 2 MB");
    photo = `${randomUUID()}.jpg`;
    await fs.writeFile(path.join(uploadDir, photo), Buffer.from(await file.arrayBuffer()));
  }

  if (id) {
    db.update(coffees).set({ name, description, ...(photo && { photo }) }).where(eq(coffees.id, id)).run();
  } else {
    const created = db.insert(coffees).values({ name, description, photo }).returning({ id: coffees.id }).get();
    db.insert(loads).values({ machine: machine.slug, coffeeId: created.id }).run();
  }
  redirect(`/m/${token}`);
}

export async function rate(token: string, formData: FormData) {
  const machine = machineOr404(token);
  const coffeeId = Number(formData.get("coffee"));
  const wasLoaded = db
    .select({ id: loads.id })
    .from(loads)
    .where(and(eq(loads.machine, machine.slug), eq(loads.coffeeId, coffeeId)))
    .get();
  if (!wasLoaded) throw new Error("coffee never loaded on this machine");

  const drink = String(formData.get("drink"));
  if (!machine.drinks.includes(drink as Drink)) throw new Error("invalid drink");
  const stars = scale(formData, "stars");
  if (!stars) throw new Error("stars required");

  const notes = formData.getAll("notes").map(String);
  if (notes.some((n) => !NOTES.includes(n as never))) throw new Error("invalid note");
  const again = formData.get("again");

  db.insert(ratings)
    .values({
      machine: machine.slug,
      coffeeId,
      drink,
      stars,
      ...Object.fromEntries(SCALES.map((s) => [s, scale(formData, s)])),
      notes: notes.length ? notes : null,
      again: again === "yes" ? true : again === "no" ? false : null,
      comment: text(formData, "comment", 1000) || null,
      name: text(formData, "name", 50) || null,
    })
    .run();
  redirect(`/m/${token}?thanks=1`);
}
