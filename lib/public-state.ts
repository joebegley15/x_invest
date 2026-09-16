import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shows, judges, contestants, judgeVotes } from "@/lib/schema";
import type { VoteValue } from "./vote";

export type PublicState =
  | { phase: "no-show" }
  | { phase: "no-contestant"; showName: string }
  | {
      phase: "contestant";
      showName: string;
      contestantName: string;
      status: "waiting" | "voting" | "revealed";
      judges: { id: number; name: string; vote: VoteValue }[];
    };

export async function getPublicState(): Promise<PublicState> {
  const [show] = await db.select().from(shows).where(eq(shows.status, "live"));
  if (!show) return { phase: "no-show" };

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
    status: contestant.status,
    judges: showJudges.map((j) => ({
      id: j.id,
      name: j.name,
      vote: voteByJudge.get(j.id) ?? "neutral",
    })),
  };
}
