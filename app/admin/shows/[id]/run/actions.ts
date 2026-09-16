"use server";

import { and, eq, gt, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { shows, contestants, judgeVotes } from "@/lib/schema";
import { judgePointsByContestant, computeScores, findOverallWinner, validateAudienceBonusPoints } from "@/lib/scoring";

export type ActionState = { error?: string } | undefined;

async function findShow(id: number) {
  const [show] = await db.select().from(shows).where(eq(shows.id, id));
  return show ?? null;
}

async function scoreContestants(showId: number) {
  const showContestants = await db
    .select({ id: contestants.id, audienceBonusPoints: contestants.audienceBonusPoints })
    .from(contestants)
    .where(eq(contestants.showId, showId))
    .orderBy(contestants.position);
  const contestantIds = showContestants.map((c) => c.id);

  const votes = contestantIds.length
    ? await db
        .select({ contestantId: judgeVotes.contestantId, value: judgeVotes.value })
        .from(judgeVotes)
        .where(inArray(judgeVotes.contestantId, contestantIds))
    : [];

  const judgePoints = judgePointsByContestant(votes);
  const audienceBonus = new Map(showContestants.map((c) => [c.id, c.audienceBonusPoints]));
  return computeScores(contestantIds, judgePoints, audienceBonus);
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

  await db.update(shows).set({ status: "audience" }).where(eq(shows.id, showId));

  revalidatePath(`/admin/shows/${showId}/run`);
  return undefined;
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
  return undefined;
}
