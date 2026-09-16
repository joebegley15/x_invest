"use client";

import { useActionState } from "react";
import { openVoting, revealVotes, reopenVoting, nextContestant, moveToAudience } from "./actions";
import SummitFlag from "@/app/components/SummitFlag";
import type { VoteValue } from "@/lib/vote";

type Contestant = {
  id: number;
  startupName: string;
  status: "waiting" | "voting" | "revealed";
};

type Judge = { id: number; name: string };
type Vote = { judgeId: number; value: string };

export function RunControls({
  showId,
  contestant,
  judges,
  votes,
  isLastContestant,
}: {
  showId: number;
  contestant: Contestant;
  judges: Judge[];
  votes: Vote[];
  isLastContestant: boolean;
}) {
  const [openState, openAction, openPending] = useActionState(openVoting, undefined);
  const [revealState, revealAction, revealPending] = useActionState(revealVotes, undefined);
  const [reopenState, reopenAction, reopenPending] = useActionState(reopenVoting, undefined);
  const [nextState, nextAction, nextPending] = useActionState(nextContestant, undefined);
  const [audienceState, audienceAction, audiencePending] = useActionState(moveToAudience, undefined);

  const voteByJudge = new Map(votes.map((v) => [v.judgeId, v.value]));
  const points = votes.filter((v) => v.value === "green").length;

  return (
    <div className="mt-8 rounded-xl border border-line bg-panel p-6">
      <h2 className="font-display text-xl uppercase tracking-[0.02em] text-white">
        {contestant.startupName}
      </h2>
      <p className="mt-1 font-serif text-sm text-lavender">Status: {contestant.status}</p>

      {contestant.status === "waiting" && (
        <form action={openAction} className="mt-4">
          <input type="hidden" name="showId" value={showId} />
          <input type="hidden" name="contestantId" value={contestant.id} />
          <button
            type="submit"
            disabled={openPending}
            className="rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
          >
            {openPending ? "Opening..." : "Open voting"}
          </button>
          {openState?.error && <p className="mt-2 text-sm text-vote-out">{openState.error}</p>}
        </form>
      )}

      {contestant.status === "voting" && (
        <form action={revealAction} className="mt-4">
          <input type="hidden" name="showId" value={showId} />
          <input type="hidden" name="contestantId" value={contestant.id} />
          <button
            type="submit"
            disabled={revealPending}
            className="rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
          >
            {revealPending ? "Revealing..." : "Reveal votes"}
          </button>
          {revealState?.error && <p className="mt-2 text-sm text-vote-out">{revealState.error}</p>}
        </form>
      )}

      {contestant.status === "revealed" && (
        <>
          <div className="mt-4">
            <p className="font-display uppercase tracking-[0.02em] text-gold">
              Points: {points}
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              {judges.map((j) => (
                <div key={j.id} className="flex w-24 flex-col items-center gap-2">
                  <span className="font-display text-xs uppercase tracking-[0.02em] text-ice">
                    {j.name}
                  </span>
                  <SummitFlag
                    vote={(voteByJudge.get(j.id) as VoteValue) ?? "neutral"}
                    judgeName={j.name}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-start gap-3">
            <form action={reopenAction}>
              <input type="hidden" name="showId" value={showId} />
              <input type="hidden" name="contestantId" value={contestant.id} />
              <button
                type="submit"
                disabled={reopenPending}
                className="rounded-lg border border-line px-4 py-2 font-display uppercase tracking-[0.02em] text-ice disabled:opacity-50"
              >
                {reopenPending ? "Reopening..." : "Reopen voting"}
              </button>
              {reopenState?.error && <p className="mt-2 text-sm text-vote-out">{reopenState.error}</p>}
            </form>

            {isLastContestant ? (
              <form action={audienceAction}>
                <input type="hidden" name="showId" value={showId} />
                <button
                  type="submit"
                  disabled={audiencePending}
                  className="rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
                >
                  {audiencePending ? "Moving..." : "Move to audience vote"}
                </button>
                {audienceState?.error && <p className="mt-2 text-sm text-vote-out">{audienceState.error}</p>}
              </form>
            ) : (
              <form action={nextAction}>
                <input type="hidden" name="showId" value={showId} />
                <button
                  type="submit"
                  disabled={nextPending}
                  className="rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
                >
                  {nextPending ? "Advancing..." : "Next contestant"}
                </button>
                {nextState?.error && <p className="mt-2 text-sm text-vote-out">{nextState.error}</p>}
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
