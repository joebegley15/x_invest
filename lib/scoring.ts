export type VoteValue = "neutral" | "red" | "green";

export type JudgeVote = { contestantId: number; value: VoteValue };

export const AUDIENCE_BONUS_TOTAL = 2;
export const AUDIENCE_BONUS_MAX_PER_CONTESTANT = 2;

export type TieResult = { winnerId: number | null; tied: number[] };

export type ContestantScore = {
  contestantId: number;
  yayPoints: number;
  favoritePoints: number;
  audienceBonus: number;
  total: number;
};

/** One point per judge who voted IN (green) on this contestant. */
export function yayPoints(contestantId: number, votes: JudgeVote[]): number {
  return votes.filter((v) => v.contestantId === contestantId && v.value === "green").length;
}

/** One point per judge whose favorite pick is this contestant. Null means no pick. */
export function favoritePoints(contestantId: number, favoriteContestantIds: (number | null)[]): number {
  return favoriteContestantIds.filter((id) => id === contestantId).length;
}

export function totalPoints(
  contestantId: number,
  votes: JudgeVote[],
  favoriteContestantIds: (number | null)[],
  audienceByContestant: Map<number, number>
): number {
  return (
    yayPoints(contestantId, votes) +
    favoritePoints(contestantId, favoriteContestantIds) +
    (audienceByContestant.get(contestantId) ?? 0)
  );
}

export function validateAudienceBonusPoints(points: number[]): string | null {
  if (points.some((p) => !Number.isInteger(p) || p < 0 || p > AUDIENCE_BONUS_MAX_PER_CONTESTANT)) {
    return `Each startup can receive between 0 and ${AUDIENCE_BONUS_MAX_PER_CONTESTANT} audience points.`;
  }
  const total = points.reduce((sum, p) => sum + p, 0);
  if (total !== AUDIENCE_BONUS_TOTAL) {
    return `Audience points must add up to ${AUDIENCE_BONUS_TOTAL} in total.`;
  }
  return null;
}

function findMax(items: { id: number; value: number }[]): TieResult {
  if (items.length === 0) return { winnerId: null, tied: [] };
  const max = Math.max(...items.map((i) => i.value));
  const tied = items.filter((i) => i.value === max).map((i) => i.id);
  return tied.length === 1 ? { winnerId: tied[0], tied: [] } : { winnerId: null, tied };
}

export function computeScores(
  contestantIds: number[],
  votes: JudgeVote[],
  favoriteContestantIds: (number | null)[],
  audienceByContestant: Map<number, number>
): ContestantScore[] {
  return contestantIds.map((contestantId) => ({
    contestantId,
    yayPoints: yayPoints(contestantId, votes),
    favoritePoints: favoritePoints(contestantId, favoriteContestantIds),
    audienceBonus: audienceByContestant.get(contestantId) ?? 0,
    total: totalPoints(contestantId, votes, favoriteContestantIds, audienceByContestant),
  }));
}

export function findOverallWinner(scores: ContestantScore[]): TieResult {
  return findMax(scores.map((s) => ({ id: s.contestantId, value: s.total })));
}

/** A startup this close to the leader (in percentage points of all audience votes) counts as tied with it. */
export const AUDIENCE_SPLIT_MARGIN_PCT = 2;

export type AudiencePointsResult = {
  pointsByContestant: Map<number, number>;
  needsRunoff: boolean;
};

/**
 * Audience points from per-contestant vote totals for one round.
 * - Leader ahead of second by more than the margin: leader gets all 2.
 * - Gap at or under the margin: top two get 1 each.
 * - Three or more within the margin of the leader: nobody is awarded yet, needsRunoff is true.
 * - No votes cast: nobody is awarded.
 * Gaps are compared as integers (gap * 100 <= margin * total) so an exact 2 point gap never
 * trips over floating point.
 */
export function audiencePoints(voteTotals: Map<number, number>): AudiencePointsResult {
  const pointsByContestant = new Map<number, number>();
  for (const id of voteTotals.keys()) pointsByContestant.set(id, 0);

  const totalVotes = [...voteTotals.values()].reduce((sum, n) => sum + n, 0);
  if (totalVotes <= 0) return { pointsByContestant, needsRunoff: false };

  const ranked = [...voteTotals.entries()].sort((a, b) => b[1] - a[1]);
  const [leaderId, leaderVotes] = ranked[0];
  const withinMargin = ranked.filter(
    ([, count]) => (leaderVotes - count) * 100 <= AUDIENCE_SPLIT_MARGIN_PCT * totalVotes
  );

  if (withinMargin.length >= 3) return { pointsByContestant, needsRunoff: true };
  if (withinMargin.length === 2) {
    pointsByContestant.set(withinMargin[0][0], AUDIENCE_BONUS_TOTAL / 2);
    pointsByContestant.set(withinMargin[1][0], AUDIENCE_BONUS_TOTAL / 2);
    return { pointsByContestant, needsRunoff: false };
  }
  pointsByContestant.set(leaderId, AUDIENCE_BONUS_TOTAL);
  return { pointsByContestant, needsRunoff: false };
}

export function applyRunoffWinner(contestantIds: number[], winnerId: number): Map<number, number> {
  return new Map(contestantIds.map((id) => [id, id === winnerId ? AUDIENCE_BONUS_TOTAL : 0]));
}

export function validateFinalAudienceBonus(points: number[]): string | null {
  if (points.some((p) => !Number.isInteger(p) || p < 0 || p > AUDIENCE_BONUS_MAX_PER_CONTESTANT)) {
    return `Each startup can receive between 0 and ${AUDIENCE_BONUS_MAX_PER_CONTESTANT} audience points.`;
  }
  const total = points.reduce((sum, p) => sum + p, 0);
  if (total !== 0 && total !== AUDIENCE_BONUS_TOTAL) {
    return `Audience points must add up to ${AUDIENCE_BONUS_TOTAL} in total, or be unassigned.`;
  }
  return null;
}
