import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contestants } from "@/lib/schema";
import { findOverallWinner } from "@/lib/scoring";
import { getScoreboard } from "@/lib/results";
import { AudienceBonusForm, ConfirmWinnerForm } from "./audience-forms";

const audienceBonusClasses: Record<number, string> = {
  1: "text-lavender font-semibold",
  2: "text-gold font-semibold",
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
      <div className="mt-8 rounded-xl border border-line bg-panel p-6">
        <h2 className="font-display text-xl uppercase tracking-[0.02em] text-white">
          Audience vote
        </h2>
        <p className="mt-1 font-serif text-sm text-lavender">
          Award 2 points based on the audience response. If the top startup leads the second by more
          than 2 percentage points, it gets both. If the gap is 2 points or less, the top two get 1 each.
          If three or more are within 2 points of the leader, run a runoff and give the winner both.
        </p>
        <AudienceBonusForm showId={showId} contestants={showContestants} />
      </div>
    );
  }

  const scores = (await getScoreboard(showId))?.rows ?? [];
  const overall = findOverallWinner(scores);
  const byId = new Map(showContestants.map((c) => [c.id, c]));
  const awarded = scores.filter((s) => s.audienceBonus > 0);
  const splitSummary =
    awarded.length >= 2
      ? `Audience points split: ${awarded.map((s) => `${byId.get(s.contestantId)?.startupName} +${s.audienceBonus}`).join(", ")}.`
      : awarded.length === 1
        ? `Audience points not split: ${byId.get(awarded[0].contestantId)?.startupName} gets all ${awarded[0].audienceBonus}.`
        : "No audience points awarded.";

  return (
    <div className="mt-8 rounded-xl border border-line bg-panel p-6">
      <h2 className="font-display text-xl uppercase tracking-[0.02em] text-white">
        Overall results
      </h2>
      <p className="mt-2 font-serif text-sm text-gold">{splitSummary}</p>
      <ul className="mt-3 flex flex-col gap-1 font-serif text-sm text-ice">
        {scores.map((s) => (
          <li key={s.contestantId}>
            {byId.get(s.contestantId)?.startupName}: {s.yayPoints} yay + {s.favoritePoints} favorite +{" "}
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
          <p className="font-serif text-sm text-lavender">Tied for the win. Pick the winner:</p>
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
