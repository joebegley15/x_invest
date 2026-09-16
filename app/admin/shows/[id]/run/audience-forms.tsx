"use client";

import { useActionState, useState } from "react";
import { saveAudienceBonus, confirmWinner } from "./actions";
import { AUDIENCE_BONUS_MAX_PER_CONTESTANT, AUDIENCE_BONUS_TOTAL, validateAudienceBonusPoints } from "@/lib/scoring";

type Contestant = { id: number; startupName: string; audienceBonusPoints: number };

export function AudienceBonusForm({ showId, contestants }: { showId: number; contestants: Contestant[] }) {
  const [state, action, pending] = useActionState(saveAudienceBonus, undefined);
  const [points, setPoints] = useState<Map<number, number>>(
    new Map(contestants.map((c) => [c.id, c.audienceBonusPoints]))
  );

  const error = validateAudienceBonusPoints(contestants.map((c) => points.get(c.id) ?? 0));
  const total = contestants.reduce((sum, c) => sum + (points.get(c.id) ?? 0), 0);

  function handleChange(contestantId: number, raw: string) {
    const value = raw === "" ? 0 : Number(raw);
    setPoints((prev) => {
      const next = new Map(prev);
      next.set(contestantId, Number.isFinite(value) ? value : 0);
      return next;
    });
  }

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="showId" value={showId} />
      <div className="flex flex-col gap-2">
        {contestants.map((c) => (
          <label key={c.id} className="flex items-center gap-3 font-serif text-sm text-ice">
            <span className="w-40">{c.startupName}</span>
            <input
              type="number"
              min={0}
              max={AUDIENCE_BONUS_MAX_PER_CONTESTANT}
              name={`points-${c.id}`}
              value={points.get(c.id) ?? 0}
              onChange={(e) => handleChange(c.id, e.target.value)}
              className="w-20 rounded border border-line bg-navy px-2 py-1 text-ice focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </label>
        ))}
      </div>
      <p className="mt-3 font-serif text-sm text-lavender">
        Total: {total} of {AUDIENCE_BONUS_TOTAL}
      </p>
      {error && <p className="mt-1 text-sm text-vote-out">{error}</p>}
      {state?.error && <p className="mt-2 text-sm text-vote-out">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || Boolean(error)}
        className="mt-4 rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save audience bonus"}
      </button>
    </form>
  );
}

export function ConfirmWinnerForm({
  showId,
  contestant,
  label,
}: {
  showId: number;
  contestant: { id: number; startupName: string };
  label: string;
}) {
  const [state, action, pending] = useActionState(confirmWinner, undefined);
  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="showId" value={showId} />
      <input type="hidden" name="contestantId" value={contestant.id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
      >
        {pending ? "Confirming..." : label}
      </button>
      {state?.error && <p className="mt-2 text-sm text-vote-out">{state.error}</p>}
    </form>
  );
}
