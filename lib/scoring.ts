export type VoteValue = "neutral" | "red" | "green";

export type JudgeVote = { contestantId: number; value: VoteValue };

export const AUDIENCE_BONUS_TOTAL = 2;
export const AUDIENCE_BONUS_MAX_PER_CONTESTANT = 2;

export type TieResult = { winnerId: number | null; tied: number[] };

export type ContestantScore = {
  contestantId: number;
  judgePoints: number;
  audienceBonus: number;
  total: number;
};

export function judgePointsByContestant(votes: JudgeVote[]): Map<number, number> {
  const points = new Map<number, number>();
  for (const v of votes) {
    if (v.value !== "green") continue;
    points.set(v.contestantId, (points.get(v.contestantId) ?? 0) + 1);
  }
  return points;
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
  judgePoints: Map<number, number>,
  audienceBonus: Map<number, number>
): ContestantScore[] {
  return contestantIds.map((contestantId) => {
    const judgePointsForContestant = judgePoints.get(contestantId) ?? 0;
    const audienceBonusForContestant = audienceBonus.get(contestantId) ?? 0;
    return {
      contestantId,
      judgePoints: judgePointsForContestant,
      audienceBonus: audienceBonusForContestant,
      total: judgePointsForContestant + audienceBonusForContestant,
    };
  });
}

export function findOverallWinner(scores: ContestantScore[]): TieResult {
  return findMax(scores.map((s) => ({ id: s.contestantId, value: s.total })));
}
