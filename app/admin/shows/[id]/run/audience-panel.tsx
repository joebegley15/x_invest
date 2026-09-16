import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { contestants, judgeVotes } from "@/lib/schema";
import { judgePointsByContestant, computeScores, findOverallWinner } from "@/lib/scoring";
import { AudienceBonusForm, ConfirmWinnerForm } from "./audience-forms";

const audienceBonusClasses: Record<number, string> = {
  1: "text-yellow-600 dark:text-yellow-400 font-semibold",
  2: "text-green-600 dark:text-green-400 font-semibold",
};

export async function AudiencePanel({
  showId,
  audienceBonusConfirmed,
}: {
  showId: number;
  audienceBonusConfirmed: boolean;
}) {
  const showContestants = await db
    .select({ id: contestants.id, startupName: contestants.startupName, audienceBonusPoints: contestants.audienceBonusPoints })
    .from(contestants)
    .where(eq(contestants.showId, showId))
    .orderBy(contestants.position);

  if (!audienceBonusConfirmed) {
    return (
      <div className="mt-8 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-xl font-semibold">Audience vote</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Split 2 points across the startups based on the audience response.
        </p>
        <AudienceBonusForm showId={showId} contestants={showContestants} />
      </div>
    );
  }

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
  const overall = findOverallWinner(scores);
  const byId = new Map(showContestants.map((c) => [c.id, c]));

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h2 className="text-xl font-semibold">Overall results</h2>
      <ul className="mt-3 flex flex-col gap-1 text-sm">
        {scores.map((s) => (
          <li key={s.contestantId}>
            {byId.get(s.contestantId)?.startupName}: {s.judgePoints} judge +{" "}
            <span className={audienceBonusClasses[s.audienceBonus] ?? ""}>{s.audienceBonus}</span>{" "}
            audience = {s.total}
          </li>
        ))}
      </ul>

      {overall.winnerId !== null ? (
        <ConfirmWinnerForm
          showId={showId}
          contestant={byId.get(overall.winnerId)!}
          label={`Confirm winner: ${byId.get(overall.winnerId)!.startupName}`}
        />
      ) : (
        <div className="mt-4">
          <p className="text-sm text-zinc-500">
            Tied for the win. Pick the winner:
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {overall.tied.map((id) => {
              const contestant = byId.get(id)!;
              return (
                <ConfirmWinnerForm
                  key={id}
                  showId={showId}
                  contestant={contestant}
                  label={`Declare winner: ${contestant.startupName}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
