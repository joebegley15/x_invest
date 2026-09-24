import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { shows, judges, contestants, judgeVotes } from "@/lib/schema";
import { getScoreboard, type ScoreboardRow } from "@/lib/results";
import { favoritePoints } from "@/lib/scoring";
import type { VoteValue } from "./vote";

export type AudienceCardState = {
  contestantId: number;
  position: number;
  startupName: string;
  yayPoints: number;
  favoritePoints: number;
  totalJudges: number;
  audienceBonus: number;
  total: number;
};

export type FavoriteCardState = {
  contestantId: number;
  position: number;
  startupName: string;
  /** Always 0 until favorites are revealed, so the public payload never leaks who picked whom. */
  favorites: number;
};

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
  | { phase: "favorites"; showName: string; revealed: boolean; contestants: FavoriteCardState[] }
  | {
      phase: "audience";
      showName: string;
      bonusConfirmed: boolean;
      contestants: AudienceCardState[];
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
    const scoreboard = await getScoreboard(show.id);
    const rows = [...(scoreboard?.rows ?? [])].sort((x, y) => x.position - y.position);

    const showJudges = await db
      .select({ id: judges.id })
      .from(judges)
      .where(eq(judges.showId, show.id));

    return {
      phase: "audience",
      showName: show.name,
      bonusConfirmed: show.audienceBonusConfirmed,
      contestants: rows.map((r) => ({
        contestantId: r.contestantId,
        position: r.position,
        startupName: r.startupName,
        yayPoints: r.yayPoints,
        favoritePoints: r.favoritePoints,
        totalJudges: showJudges.length,
        audienceBonus: r.audienceBonus,
        total: r.total,
      })),
    };
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

  if (show.favoritesOpenedAt) {
    const showContestants = await db
      .select()
      .from(contestants)
      .where(eq(contestants.showId, show.id))
      .orderBy(contestants.position);
    const revealed = show.favoritesRevealedAt !== null;
    const picks = revealed
      ? (await db.select({ favoriteContestantId: judges.favoriteContestantId }).from(judges).where(eq(judges.showId, show.id))).map(
          (j) => j.favoriteContestantId
        )
      : [];

    return {
      phase: "favorites",
      showName: show.name,
      revealed,
      contestants: showContestants.map((c) => ({
        contestantId: c.id,
        position: c.position,
        startupName: c.startupName,
        favorites: favoritePoints(c.id, picks),
      })),
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
