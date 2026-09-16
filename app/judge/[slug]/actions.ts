"use server";

import { and, eq } from "drizzle-orm";
import { requireJudge } from "@/lib/access";
import { db } from "@/lib/db";
import { judges, shows, contestants, judgeVotes } from "@/lib/schema";
import { getJudgeState, type JudgeState } from "@/lib/judge-state";
import { toggleVote } from "@/lib/vote";

export async function fetchJudgeState(slug: string): Promise<JudgeState> {
  await requireJudge();
  return getJudgeState(slug);
}

export async function castVote(
  slug: string,
  judgeId: number,
  contestantId: number,
  tapped: "red" | "yellow"
): Promise<JudgeState> {
  await requireJudge();

  if (
    !slug ||
    !Number.isInteger(judgeId) ||
    !Number.isInteger(contestantId) ||
    (tapped !== "red" && tapped !== "yellow")
  ) {
    throw new Error("Invalid vote request.");
  }

  const [judge] = await db.select().from(judges).where(eq(judges.id, judgeId));
  if (!judge || judge.slug !== slug) throw new Error("Judge not found.");

  const [show] = await db.select().from(shows).where(eq(shows.id, judge.showId));
  if (!show || show.status !== "live" || show.currentContestantId !== contestantId) {
    throw new Error("Voting has moved on.");
  }

  const [contestant] = await db.select().from(contestants).where(eq(contestants.id, contestantId));
  if (!contestant || contestant.status !== "voting") {
    throw new Error("Voting is not open for this contestant.");
  }

  const [existing] = await db
    .select()
    .from(judgeVotes)
    .where(and(eq(judgeVotes.judgeId, judgeId), eq(judgeVotes.contestantId, contestantId)));

  const value = toggleVote(existing?.value ?? "neutral", tapped);

  if (existing) {
    await db.update(judgeVotes).set({ value, updatedAt: new Date() }).where(eq(judgeVotes.id, existing.id));
  } else {
    await db.insert(judgeVotes).values({ showId: judge.showId, judgeId, contestantId, value });
  }

  return getJudgeState(slug);
}
