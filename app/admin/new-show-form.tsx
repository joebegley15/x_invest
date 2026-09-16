"use client";

import { useActionState } from "react";
import { createShow } from "./actions";

export function NewShowForm() {
  const [state, formAction, pending] = useActionState(createShow, undefined);

  return (
    <form action={formAction} className="mt-4 flex max-w-sm flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          placeholder="Show name"
          required
          className="flex-1 rounded-lg border border-line bg-navy px-3 py-2 text-ice placeholder:text-lavender focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-vote-out">{state.error}</p>}
    </form>
  );
}
