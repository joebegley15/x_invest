"use client";

import { useActionState } from "react";
import { updateShowName, startShow, saveJudges, saveContestants } from "./actions";

export function StartShowForm({ showId }: { showId: number }) {
  const [state, formAction, pending] = useActionState(startShow, undefined);

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="showId" value={showId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
      >
        {pending ? "Starting..." : "Start show"}
      </button>
      {state?.error && <p className="mt-2 text-sm text-vote-out">{state.error}</p>}
    </form>
  );
}

export function ShowNameForm({ showId, initialName }: { showId: number; initialName: string }) {
  const [state, formAction, pending] = useActionState(updateShowName, undefined);

  return (
    <form action={formAction} className="mt-4 flex max-w-md flex-col gap-2">
      <input type="hidden" name="showId" value={showId} />
      <label htmlFor="name" className="font-serif text-sm text-lavender">
        Show name
      </label>
      <div className="flex gap-2">
        <input
          id="name"
          name="name"
          defaultValue={initialName}
          required
          className="flex-1 rounded-lg border border-line bg-navy px-3 py-2 text-ice focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-vote-out">{state.error}</p>}
    </form>
  );
}

export function JudgesForm({
  showId,
  initialText,
  readOnly,
}: {
  showId: number;
  initialText: string;
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveJudges, undefined);

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2">
      <input type="hidden" name="showId" value={showId} />
      <textarea
        name="judges"
        defaultValue={initialText}
        readOnly={readOnly}
        rows={6}
        placeholder="One judge name per line"
        className="rounded-lg border border-line bg-navy px-3 py-2 font-mono text-sm text-ice read-only:opacity-60 focus:outline-none focus:ring-2 focus:ring-gold"
      />
      {!readOnly && (
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save judges"}
        </button>
      )}
      {state?.error && <p className="text-sm text-vote-out">{state.error}</p>}
    </form>
  );
}

export function ContestantsForm({
  showId,
  initialText,
  readOnly,
}: {
  showId: number;
  initialText: string;
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveContestants, undefined);

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2">
      <input type="hidden" name="showId" value={showId} />
      <textarea
        name="contestants"
        defaultValue={initialText}
        readOnly={readOnly}
        rows={8}
        placeholder="One startup name per line, in running order"
        className="rounded-lg border border-line bg-navy px-3 py-2 font-mono text-sm text-ice read-only:opacity-60 focus:outline-none focus:ring-2 focus:ring-gold"
      />
      {!readOnly && (
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-gold px-4 py-2 font-display uppercase tracking-[0.02em] text-navy disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save contestants"}
        </button>
      )}
      {state?.error && <p className="text-sm text-vote-out">{state.error}</p>}
    </form>
  );
}
