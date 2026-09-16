"use server";

import { and, eq, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows, contestants } from "@/lib/schema";

export type ActionState = { error?: string } | undefined;

async function findShow(id: number) {
  const [show] = await db.select().from(shows).where(eq(shows.id, id));
  return show ?? null;
}

function parseIds(formData: FormData) {
  return {
    showId: Number(formData.get("showId")),
    contestantId: Number(formData.get("contestantId")),
  };
}

export async function openVoting(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const { showId, contestantId } = parseIds(formData);
  if (!Number.isInteger(showId) || !Number.isInteger(contestantId)) return { error: "Invalid request." };

  const show = await findShow(showId);
  if (!show) return { error: "Show not found." };
  if (show.status !== "live" || show.currentContestantId !== contestantId) {
    return { error: "This contestant is not currently on stage." };
  }

  const [contestant] = await db.select().from(contestants).where(eq(contestants.id, contestantId));
  if (!contestant || contestant.status !== "waiting") {
    return { error: "Voting can only be opened from the waiting state." };
  }

  await db.update(contestants).set({ status: "voting" }).where(eq(contestants.id, contestantId));
  revalidatePath(`/admin/shows/${showId}/run`);
  return undefined;
}

export async function revealVotes(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const { showId, contestantId } = parseIds(formData);
  if (!Number.isInteger(showId) || !Number.isInteger(contestantId)) return { error: "Invalid request." };

  const show = await findShow(showId);
  if (!show) return { error: "Show not found." };
  if (show.status !== "live" || show.currentContestantId !== contestantId) {
    return { error: "This contestant is not currently on stage." };
  }

  const [contestant] = await db.select().from(contestants).where(eq(contestants.id, contestantId));
  if (!contestant || contestant.status !== "voting") {
    return { error: "Votes can only be revealed once voting is open." };
  }

  await db.update(contestants).set({ status: "revealed" }).where(eq(contestants.id, contestantId));
  revalidatePath(`/admin/shows/${showId}/run`);
  return undefined;
}

export async function reopenVoting(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const { showId, contestantId } = parseIds(formData);
  if (!Number.isInteger(showId) || !Number.isInteger(contestantId)) return { error: "Invalid request." };

  const show = await findShow(showId);
  if (!show) return { error: "Show not found." };
  if (show.status !== "live" || show.currentContestantId !== contestantId) {
    return { error: "This contestant is not currently on stage." };
  }

  const [contestant] = await db.select().from(contestants).where(eq(contestants.id, contestantId));
  if (!contestant || contestant.status !== "revealed") {
    return { error: "Voting can only be reopened after a reveal." };
  }

  await db.update(contestants).set({ status: "voting" }).where(eq(contestants.id, contestantId));
  revalidatePath(`/admin/shows/${showId}/run`);
  return undefined;
}

export async function nextContestant(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const showId = Number(formData.get("showId"));
  if (!Number.isInteger(showId)) return { error: "Invalid show." };

  const show = await findShow(showId);
  if (!show) return { error: "Show not found." };
  if (show.status !== "live" || !show.currentContestantId) {
    return { error: "The show is not currently running." };
  }

  const [current] = await db.select().from(contestants).where(eq(contestants.id, show.currentContestantId));
  if (!current || current.status !== "revealed") {
    return { error: "Reveal the current contestant's votes before moving on." };
  }

  const [next] = await db
    .select()
    .from(contestants)
    .where(and(eq(contestants.showId, showId), gt(contestants.position, current.position)))
    .orderBy(contestants.position)
    .limit(1);

  if (!next) return { error: "There is no next contestant." };

  await db.update(shows).set({ currentContestantId: next.id }).where(eq(shows.id, showId));
  revalidatePath(`/admin/shows/${showId}/run`);
  return undefined;
}
