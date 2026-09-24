import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shows, judges, contestants, judgeVotes } from "@/lib/schema";
import type { VoteValue } from "./vote";

export type FavoriteOption = { id: number; position: number; startupName: string };

export type JudgeState =
  | { phase: "no-show" }
  | { phase: "not-judge"; showName: string }
  | { phase: "no-contestant"; showName: string; judgeName: string }
  | {
      phase: "favorites";
      judgeId: number;
      showName: string;
      judgeName: string;
      contestants: FavoriteOption[];
      pickedContestantId: number | null;
      locked: boolean;
    }
  | {
      phase: "contestant";
      judgeId: number;
      showName: string;
      judgeName: string;
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
  if (!judge) return { phase: "not-judge", showName: show.name };

  if (show.favoritesOpenedAt) {
    const options = await db
      .select({ id: contestants.id, position: contestants.position, startupName: contestants.startupName })
      .from(contestants)
      .where(eq(contestants.showId, show.id))
      .orderBy(contestants.position);
    return {
      phase: "favorites",
      judgeId: judge.id,
      showName: show.name,
      judgeName: judge.name,
      contestants: options,
      pickedContestantId: judge.favoriteContestantId,
      locked: show.favoritesRevealedAt !== null,
    };
  }

  if (!show.currentContestantId) return { phase: "no-contestant", showName: show.name, judgeName: judge.name };

  const [contestant] = await db
    .select()
    .from(contestants)
    .where(eq(contestants.id, show.currentContestantId));
  if (!contestant) return { phase: "no-contestant", showName: show.name, judgeName: judge.name };

  const [voteRow] = await db
    .select()
    .from(judgeVotes)
    .where(and(eq(judgeVotes.judgeId, judge.id), eq(judgeVotes.contestantId, contestant.id)));

  return {
    phase: "contestant",
    judgeId: judge.id,
    showName: show.name,
    judgeName: judge.name,
    contestantId: contestant.id,
    contestantName: contestant.startupName,
    status: contestant.status,
    vote: voteRow?.value ?? "neutral",
  };
}
