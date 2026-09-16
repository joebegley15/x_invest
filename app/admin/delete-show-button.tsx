"use client";

import { deleteShow } from "./actions";

export function DeleteShowButton({ showId, showName }: { showId: number; showName: string }) {
  return (
    <form
      action={deleteShow}
      onSubmit={(e) => {
        if (!confirm(`Delete "${showName}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={showId} />
      <button
        type="submit"
        className="rounded-lg border border-vote-out px-3 py-1.5 font-display text-xs uppercase tracking-[0.02em] text-vote-out transition-colors hover:bg-vote-out hover:text-navy"
      >
        Delete
      </button>
    </form>
  );
}
