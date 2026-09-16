import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { shows, contestants, judgeVotes } from "@/lib/schema";
import { judgePointsByContestant, computeScores, type ContestantScore } from "@/lib/scoring";

export type ScoreboardRow = ContestantScore & { startupName: string };

export type Scoreboard = {
  showId: number;
  showName: string;
  status: "setup" | "live" | "audience" | "complete";
  winnerContestantId: number | null;
  rows: ScoreboardRow[];
};

export async function getScoreboard(showId: number): Promise<Scoreboard | null> {
  const [show] = await db.select().from(shows).where(eq(shows.id, showId));
  if (!show) return null;

  const showContestants = await db
    .select()
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
  const scores = computeScores(contestantIds, judgePoints, audienceBonus);
  const byId = new Map(showContestants.map((c) => [c.id, c.startupName]));

  const rows = scores
    .map((s) => ({ ...s, startupName: byId.get(s.contestantId) ?? "" }))
    .sort((a, b) => b.total - a.total);

  return {
    showId: show.id,
    showName: show.name,
    status: show.status,
    winnerContestantId: show.winnerContestantId,
    rows,
  };
}
