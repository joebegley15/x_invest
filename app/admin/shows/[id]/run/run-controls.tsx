"use client";

import { useActionState } from "react";
import { openVoting, revealVotes, nextContestant } from "./actions";

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
}: {
  showId: number;
  contestant: Contestant;
  judges: Judge[];
  votes: Vote[];
}) {
  const [openState, openAction, openPending] = useActionState(openVoting, undefined);
  const [revealState, revealAction, revealPending] = useActionState(revealVotes, undefined);
  const [nextState, nextAction, nextPending] = useActionState(nextContestant, undefined);

  const voteByJudge = new Map(votes.map((v) => [v.judgeId, v.value]));
  const points = votes.filter((v) => v.value === "yellow").length;

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h2 className="text-xl font-semibold">{contestant.startupName}</h2>
      <p className="mt-1 text-sm text-zinc-500">Status: {contestant.status}</p>

      {contestant.status === "waiting" && (
        <form action={openAction} className="mt-4">
          <input type="hidden" name="showId" value={showId} />
          <input type="hidden" name="contestantId" value={contestant.id} />
          <button
            type="submit"
            disabled={openPending}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {openPending ? "Opening..." : "Open voting"}
          </button>
          {openState?.error && <p className="mt-2 text-sm text-red-600">{openState.error}</p>}
        </form>
      )}

      {contestant.status === "voting" && (
        <form action={revealAction} className="mt-4">
          <input type="hidden" name="showId" value={showId} />
          <input type="hidden" name="contestantId" value={contestant.id} />
          <button
            type="submit"
            disabled={revealPending}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {revealPending ? "Revealing..." : "Reveal votes"}
          </button>
          {revealState?.error && <p className="mt-2 text-sm text-red-600">{revealState.error}</p>}
        </form>
      )}

      {contestant.status === "revealed" && (
        <>
          <div className="mt-4">
            <p className="font-medium">Points: {points}</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {judges.map((j) => (
                <li key={j.id}>
                  {j.name}: {voteByJudge.get(j.id) ?? "neutral"}
                </li>
              ))}
            </ul>
          </div>
          <form action={nextAction} className="mt-4">
            <input type="hidden" name="showId" value={showId} />
            <button
              type="submit"
              disabled={nextPending}
              className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {nextPending ? "Advancing..." : "Next contestant"}
            </button>
            {nextState?.error && <p className="mt-2 text-sm text-red-600">{nextState.error}</p>}
          </form>
        </>
      )}
    </div>
  );
}
