"use server";

import { and, desc, eq, gt, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows, contestants, judges } from "@/lib/schema";
import { findOverallWinner, validateAudienceBonusPoints } from "@/lib/scoring";
import { getScoreboard } from "@/lib/results";
import { broadcastLiveState } from "@/lib/live-broadcast";

export type ActionState = { error?: string } | undefined;

async function findShow(id: number) {
  const [show] = await db.select().from(shows).where(eq(shows.id, id));
  return show ?? null;
}

async function scoreContestants(showId: number) {
  const scoreboard = await getScoreboard(showId);
  return scoreboard?.rows ?? [];
}

/** True when this contestant is the last one in the running order. */
async function isLastContestant(showId: number, position: number) {
  const [later] = await db
    .select({ id: contestants.id })
    .from(contestants)
    .where(and(eq(contestants.showId, showId), gt(contestants.position, position)))
    .limit(1);
  return !later;
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
  await broadcastLiveState();
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
  await broadcastLiveState();
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
  if (show.favoritesOpenedAt) {
    return { error: "Favorite voting has started. Step back before reopening founder voting." };
  }

  await db.update(contestants).set({ status: "voting" }).where(eq(contestants.id, contestantId));
  revalidatePath(`/admin/shows/${showId}/run`);
  await broadcastLiveState();
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
  await broadcastLiveState();
  return undefined;
}

export async function moveToAudience(_prev: ActionState, formData: FormData): Promise<ActionState> {
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
    return { error: "Reveal the current contestant's votes before moving to the audience vote." };
  }

  const [next] = await db
    .select()
    .from(contestants)
    .where(and(eq(contestants.showId, showId), gt(contestants.position, current.position)))
    .orderBy(contestants.position)
    .limit(1);
  if (next) return { error: "There are more contestants left." };
  if (!show.favoritesRevealedAt) return { error: "Reveal the judges' favorites before moving to the audience vote." };

  await db.update(shows).set({ status: "audience" }).where(eq(shows.id, showId));

  revalidatePath(`/admin/shows/${showId}/run`);
  await broadcastLiveState();
  return undefined;
}

export async function openFavorites(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const showId = Number(formData.get("showId"));
  if (!Number.isInteger(showId)) return { error: "Invalid show." };

  const show = await findShow(showId);
  if (!show) return { error: "Show not found." };
  if (show.status !== "live" || !show.currentContestantId) {
    return { error: "The show is not currently running." };
  }
  if (show.favoritesOpenedAt) return { error: "Favorite voting is already open." };

  const [current] = await db.select().from(contestants).where(eq(contestants.id, show.currentContestantId));
  if (!current || current.status !== "revealed" || !(await isLastContestant(showId, current.position))) {
    return { error: "Reveal the last founder's votes before opening favorite voting." };
  }

  await db.update(shows).set({ favoritesOpenedAt: new Date(), favoritesRevealedAt: null }).where(eq(shows.id, showId));
  revalidatePath(`/admin/shows/${showId}/run`);
  await broadcastLiveState();
  return undefined;
}

export async function revealFavorites(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const showId = Number(formData.get("showId"));
  if (!Number.isInteger(showId)) return { error: "Invalid show." };

  const show = await findShow(showId);
  if (!show) return { error: "Show not found." };
  if (show.status !== "live") return { error: "The show is not currently running." };
  if (!show.favoritesOpenedAt) return { error: "Open favorite voting first." };
  if (show.favoritesRevealedAt) return { error: "Favorites are already revealed." };

  await db.update(shows).set({ favoritesRevealedAt: new Date() }).where(eq(shows.id, showId));
  revalidatePath(`/admin/shows/${showId}/run`);
  await broadcastLiveState();
  return undefined;
}

/** Live count of judges who have picked. Deliberately returns counts only, never who picked whom. */
export async function getFavoritesProgress(showId: number): Promise<{ picked: number; total: number }> {
  await requireAdmin();
  if (!Number.isInteger(showId)) return { picked: 0, total: 0 };

  const rows = await db
    .select({ picked: judges.favoriteContestantId })
    .from(judges)
    .where(eq(judges.showId, showId));
  return { picked: rows.filter((r) => r.picked !== null).length, total: rows.length };
}

export async function saveAudienceBonus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const showId = Number(formData.get("showId"));
  if (!Number.isInteger(showId)) return { error: "Invalid show." };

  const show = await findShow(showId);
  if (!show) return { error: "Show not found." };
  if (show.status !== "audience") return { error: "The show is not in the audience vote phase." };

  const showContestants = await db
    .select({ id: contestants.id })
    .from(contestants)
    .where(eq(contestants.showId, showId))
    .orderBy(contestants.position);

  const entries = showContestants.map((c) => ({
    id: c.id,
    points: Number(formData.get(`points-${c.id}`)),
  }));

  const error = validateAudienceBonusPoints(entries.map((e) => e.points));
  if (error) return { error };

  for (const entry of entries) {
    await db.update(contestants).set({ audienceBonusPoints: entry.points }).where(eq(contestants.id, entry.id));
  }
  await db.update(shows).set({ audienceBonusConfirmed: true }).where(eq(shows.id, showId));

  revalidatePath(`/admin/shows/${showId}/run`);
  return undefined;
}

export async function stepBack(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const showId = Number(formData.get("showId"));
  if (!Number.isInteger(showId)) return { error: "Invalid show." };

  const show = await findShow(showId);
  if (!show) return { error: "Show not found." };

  if (show.status === "complete") {
    await db.update(shows).set({ winnerContestantId: null, status: "audience" }).where(eq(shows.id, showId));
    revalidatePath(`/admin/shows/${showId}/run`);
    await broadcastLiveState();
    return undefined;
  }

  if (show.status === "audience") {
    if (show.audienceBonusConfirmed) {
      await db.update(shows).set({ audienceBonusConfirmed: false }).where(eq(shows.id, showId));
    } else {
      await db.update(shows).set({ status: "live" }).where(eq(shows.id, showId));
    }
    revalidatePath(`/admin/shows/${showId}/run`);
    await broadcastLiveState();
    return undefined;
  }

  if (show.status === "live") {
    if (!show.currentContestantId) return { error: "This is already the first step." };

    if (show.favoritesRevealedAt || show.favoritesOpenedAt) {
      await db
        .update(shows)
        .set(show.favoritesRevealedAt ? { favoritesRevealedAt: null } : { favoritesOpenedAt: null })
        .where(eq(shows.id, showId));
      revalidatePath(`/admin/shows/${showId}/run`);
      await broadcastLiveState();
      return undefined;
    }

    const [current] = await db.select().from(contestants).where(eq(contestants.id, show.currentContestantId));
    if (!current) return { error: "This is already the first step." };

    if (current.status === "revealed") {
      await db.update(contestants).set({ status: "voting" }).where(eq(contestants.id, current.id));
    } else if (current.status === "voting") {
      await db.update(contestants).set({ status: "waiting" }).where(eq(contestants.id, current.id));
    } else {
      const [prev] = await db
        .select()
        .from(contestants)
        .where(and(eq(contestants.showId, showId), lt(contestants.position, current.position)))
        .orderBy(desc(contestants.position))
        .limit(1);
      if (!prev) return { error: "This is already the first step." };
      await db.update(shows).set({ currentContestantId: prev.id }).where(eq(shows.id, showId));
    }

    revalidatePath(`/admin/shows/${showId}/run`);
    await broadcastLiveState();
    return undefined;
  }

  return { error: "This is already the first step." };
}

export async function confirmWinner(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const { showId, contestantId } = parseIds(formData);
  if (!Number.isInteger(showId) || !Number.isInteger(contestantId)) return { error: "Invalid request." };

  const show = await findShow(showId);
  if (!show) return { error: "Show not found." };
  if (show.status !== "audience" || !show.audienceBonusConfirmed) {
    return { error: "Confirm the audience bonus before confirming the winner." };
  }
  if (show.winnerContestantId !== null) return { error: "The winner has already been confirmed." };

  const scores = await scoreContestants(showId);
  const overall = findOverallWinner(scores);
  const isLeader = overall.winnerId === contestantId || overall.tied.includes(contestantId);
  if (!isLeader) return { error: "This startup is not tied or leading for the win." };

  await db
    .update(shows)
    .set({ winnerContestantId: contestantId, status: "complete" })
    .where(eq(shows.id, showId));
  revalidatePath(`/admin/shows/${showId}/run`);
  await broadcastLiveState();
  return undefined;
}
