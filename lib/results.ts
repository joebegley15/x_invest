import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { shows, contestants, judges, judgeVotes } from "@/lib/schema";
import { computeScores, type ContestantScore } from "@/lib/scoring";

export type ScoreboardRow = ContestantScore & { startupName: string; position: number };

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

  const favorites = (
    await db.select({ favoriteContestantId: judges.favoriteContestantId }).from(judges).where(eq(judges.showId, showId))
  ).map((j) => j.favoriteContestantId);

  const audienceBonus = new Map(showContestants.map((c) => [c.id, c.audienceBonusPoints]));
  const scores = computeScores(contestantIds, votes, favorites, audienceBonus);
  const byId = new Map(showContestants.map((c) => [c.id, c]));

  const rows = scores
    .map((s) => ({
      ...s,
      startupName: byId.get(s.contestantId)?.startupName ?? "",
      position: byId.get(s.contestantId)?.position ?? 0,
    }))
    .sort((a, b) => b.total - a.total || a.position - b.position);

  return {
    showId: show.id,
    showName: show.name,
    status: show.status,
    winnerContestantId: show.winnerContestantId,
    rows,
  };
}
