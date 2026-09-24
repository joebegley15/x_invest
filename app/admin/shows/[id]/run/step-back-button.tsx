"use client";

import { useActionState } from "react";
import { stepBack } from "./actions";

export function StepBackButton({ showId }: { showId: number }) {
  const [state, action, pending] = useActionState(stepBack, undefined);

  return (
    <form action={action}>
      <input type="hidden" name="showId" value={showId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-line px-4 py-2 font-display uppercase tracking-[0.02em] text-ice disabled:opacity-50"
      >
        {pending ? "Stepping back..." : "Step back"}
      </button>
      {state?.error && <p className="mt-2 text-sm text-vote-out">{state.error}</p>}
    </form>
  );
}
