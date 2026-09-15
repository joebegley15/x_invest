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
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? "Creating..." : "Create"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
