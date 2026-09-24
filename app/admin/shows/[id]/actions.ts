"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows, judges, contestants, judgeVotes } from "@/lib/schema";
import { slugifyJudge } from "@/lib/slug";
import { broadcastLiveState } from "@/lib/live-broadcast";

export type ActionState = { error?: string } | undefined;

async function findShow(id: number) {
  const [show] = await db.select().from(shows).where(eq(shows.id, id));
  return show ?? null;
}

export async function updateShowName(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = Number(formData.get("showId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!Number.isInteger(id)) return { error: "Invalid show." };
  if (!name) return { error: "Name is required." };

  const show = await findShow(id);
  if (!show) return { error: "Show not found." };

  await db.update(shows).set({ name }).where(eq(shows.id, id));
  revalidatePath(`/admin/shows/${id}`);
  return undefined;
}

export async function startShow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = Number(formData.get("showId"));
  if (!Number.isInteger(id)) return { error: "Invalid show." };

  const show = await findShow(id);
  if (!show) return { error: "Show not found." };
  if (show.status !== "setup") redirect(`/admin/shows/${id}/run`);

  const [first] = await db
    .select()
    .from(contestants)
    .where(eq(contestants.showId, id))
    .orderBy(contestants.position)
    .limit(1);
  if (!first) return { error: "Add at least one contestant before starting the show." };

  await db.update(shows).set({ status: "live", currentContestantId: first.id }).where(eq(shows.id, id));
  redirect(`/admin/shows/${id}/run`);
}

export async function saveJudges(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = Number(formData.get("showId"));
  if (!Number.isInteger(id)) return { error: "Invalid show." };

  const show = await findShow(id);
  if (!show) return { error: "Show not found." };
  if (show.status !== "setup") {
    return { error: "Judges can only be edited while the show is in setup." };
  }

  const raw = String(formData.get("judges") ?? "");
  const names = raw
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);

  const seenSlugs = new Map<string, string>();
  for (const name of names) {
    const slug = slugifyJudge(name);
    if (!slug) return { error: `"${name}" does not produce a valid slug.` };
    const clash = seenSlugs.get(slug);
    if (clash) {
      return { error: `"${clash}" and "${name}" both produce the slug "${slug}". Use distinct names.` };
    }
    seenSlugs.set(slug, name);
  }

  await db.delete(judges).where(eq(judges.showId, id));
  if (names.length > 0) {
    await db.insert(judges).values(names.map((name) => ({ showId: id, name, slug: slugifyJudge(name) })));
  }

  revalidatePath(`/admin/shows/${id}`);
  return undefined;
}

export async function resetShow(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("showId"));
  if (!Number.isInteger(id)) return;

  const show = await findShow(id);
  if (!show) return;

  await db.delete(judgeVotes).where(eq(judgeVotes.showId, id));
  await db.update(judges).set({ favoriteContestantId: null }).where(eq(judges.showId, id));
  await db
    .update(contestants)
    .set({ status: "waiting", audienceBonusPoints: 0 })
    .where(eq(contestants.showId, id));
  await db
    .update(shows)
    .set({
      status: "setup",
      currentContestantId: null,
      audienceBonusConfirmed: false,
      winnerContestantId: null,
      favoritesOpenedAt: null,
      favoritesRevealedAt: null,
    })
    .where(eq(shows.id, id));

  revalidatePath(`/admin/shows/${id}`);
  revalidatePath(`/admin/shows/${id}/run`);
  await broadcastLiveState();
  redirect(`/admin/shows/${id}`);
}

export async function saveContestants(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = Number(formData.get("showId"));
  if (!Number.isInteger(id)) return { error: "Invalid show." };

  const show = await findShow(id);
  if (!show) return { error: "Show not found." };
  if (show.status !== "setup") {
    return { error: "Contestants can only be edited while the show is in setup." };
  }

  const raw = String(formData.get("contestants") ?? "");
  const names = raw
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);

  await db.delete(contestants).where(eq(contestants.showId, id));
  if (names.length > 0) {
    await db.insert(contestants).values(
      names.map((startupName, index) => ({ showId: id, startupName, position: index + 1 }))
    );
  }

  revalidatePath(`/admin/shows/${id}`);
  return undefined;
}
