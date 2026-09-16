import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { shows, judges, contestants, judgeVotes } from "@/lib/schema";
import { getScoreboard, type ScoreboardRow } from "@/lib/results";
import type { VoteValue } from "./vote";

export type PublicState =
  | { phase: "no-show" }
  | { phase: "no-contestant"; showName: string }
  | {
      phase: "contestant";
      showName: string;
      contestantName: string;
      contestantPosition: number;
      totalContestants: number;
      status: "waiting" | "voting" | "revealed";
      judges: { id: number; name: string; vote: VoteValue }[];
    }
  | {
      phase: "audience";
      showName: string;
      contestants: { id: number; startupName: string; audienceBonusPoints: number }[];
    }
  | { phase: "complete"; showName: string; rows: ScoreboardRow[]; winnerContestantId: number | null };

export async function getPublicState(): Promise<PublicState> {
  const [inProgress] = await db.select().from(shows).where(inArray(shows.status, ["live", "audience"]));
  const [mostRecentComplete] = inProgress
    ? []
    : await db.select().from(shows).where(eq(shows.status, "complete")).orderBy(desc(shows.id)).limit(1);
  const show = inProgress ?? mostRecentComplete;
  if (!show) return { phase: "no-show" };

  if (show.status === "audience") {
    const showContestants = await db
      .select({
        id: contestants.id,
        startupName: contestants.startupName,
        audienceBonusPoints: contestants.audienceBonusPoints,
      })
      .from(contestants)
      .where(eq(contestants.showId, show.id))
      .orderBy(contestants.position);
    return { phase: "audience", showName: show.name, contestants: showContestants };
  }

  if (show.status === "complete") {
    const scoreboard = await getScoreboard(show.id);
    return {
      phase: "complete",
      showName: show.name,
      rows: scoreboard?.rows ?? [],
      winnerContestantId: show.winnerContestantId,
    };
  }

  if (!show.currentContestantId) return { phase: "no-contestant", showName: show.name };

  const [contestant] = await db
    .select()
    .from(contestants)
    .where(eq(contestants.id, show.currentContestantId));
  if (!contestant) return { phase: "no-contestant", showName: show.name };

  const showJudges = await db
    .select()
    .from(judges)
    .where(eq(judges.showId, show.id))
    .orderBy(judges.id);

  const totalContestants = await db
    .select({ id: contestants.id })
    .from(contestants)
    .where(eq(contestants.showId, show.id));

  const votingStarted = contestant.status !== "waiting";

  const voteByJudge = votingStarted
    ? new Map(
        (
          await db
            .select()
            .from(judgeVotes)
            .where(eq(judgeVotes.contestantId, contestant.id))
        ).map((v) => [v.judgeId, v.value])
      )
    : new Map<number, VoteValue>();

  return {
    phase: "contestant",
    showName: show.name,
    contestantName: contestant.startupName,
    contestantPosition: contestant.position,
    totalContestants: totalContestants.length,
    status: contestant.status,
    judges: showJudges.map((j) => ({
      id: j.id,
      name: j.name,
      vote: voteByJudge.get(j.id) ?? "neutral",
    })),
  };
}
