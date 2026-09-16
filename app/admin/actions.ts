"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows } from "@/lib/schema";
import { slugifyShow } from "@/lib/slug";

export type ActionState = { error?: string } | undefined;

export async function createShow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const base = slugifyShow(name) || "show";
  let slug = base;
  let suffix = 2;
  while (true) {
    const [existing] = await db.select({ id: shows.id }).from(shows).where(eq(shows.slug, slug));
    if (!existing) break;
    slug = `${base}-${suffix++}`;
  }

  const [show] = await db.insert(shows).values({ name, slug }).returning({ id: shows.id });
  redirect(`/admin/shows/${show.id}`);
}

export async function deleteShow(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  await db.delete(shows).where(eq(shows.id, id));
  redirect("/admin");
}
