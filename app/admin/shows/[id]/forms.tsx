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
        className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "Starting..." : "Start show"}
      </button>
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export function ShowNameForm({ showId, initialName }: { showId: number; initialName: string }) {
  const [state, formAction, pending] = useActionState(updateShowName, undefined);

  return (
    <form action={formAction} className="mt-4 flex max-w-md flex-col gap-2">
      <input type="hidden" name="showId" value={showId} />
      <label htmlFor="name" className="text-sm font-medium">
        Show name
      </label>
      <div className="flex gap-2">
        <input
          id="name"
          name="name"
          defaultValue={initialName}
          required
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
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
        className="rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm read-only:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:read-only:bg-zinc-900"
      />
      {!readOnly && (
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? "Saving..." : "Save judges"}
        </button>
      )}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
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
        className="rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm read-only:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:read-only:bg-zinc-900"
      />
      {!readOnly && (
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? "Saving..." : "Save contestants"}
        </button>
      )}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
