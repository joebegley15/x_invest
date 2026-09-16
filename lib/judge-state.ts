import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shows, judges, contestants, judgeVotes } from "@/lib/schema";
import type { VoteValue } from "./vote";

export type JudgeState =
  | { phase: "no-show" }
  | { phase: "not-judge" }
  | { phase: "no-contestant" }
  | {
      phase: "contestant";
      judgeId: number;
      contestantId: number;
      contestantName: string;
      status: "waiting" | "voting" | "revealed";
      vote: VoteValue;
    };

export async function getJudgeState(slug: string): Promise<JudgeState> {
  const [show] = await db.select().from(shows).where(eq(shows.status, "live"));
  if (!show) return { phase: "no-show" };

  const [judge] = await db
    .select()
    .from(judges)
    .where(and(eq(judges.showId, show.id), eq(judges.slug, slug)));
  if (!judge) return { phase: "not-judge" };

  if (!show.currentContestantId) return { phase: "no-contestant" };

  const [contestant] = await db
    .select()
    .from(contestants)
    .where(eq(contestants.id, show.currentContestantId));
  if (!contestant) return { phase: "no-contestant" };

  const [voteRow] = await db
    .select()
    .from(judgeVotes)
    .where(and(eq(judgeVotes.judgeId, judge.id), eq(judgeVotes.contestantId, contestant.id)));

  return {
    phase: "contestant",
    judgeId: judge.id,
    contestantId: contestant.id,
    contestantName: contestant.startupName,
    status: contestant.status,
    vote: voteRow?.value ?? "neutral",
  };
}
