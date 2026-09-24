"use client";

import { resetShow } from "./actions";

export function ResetShowButton({ showId }: { showId: number }) {
  return (
    <form
      action={resetShow}
      onSubmit={(e) => {
        if (!confirm("Are you sure? This action cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="showId" value={showId} />
      <button
        type="submit"
        className="rounded-lg border border-vote-out px-4 py-2 font-display uppercase tracking-[0.02em] text-vote-out transition-colors hover:bg-vote-out hover:text-navy"
      >
        Reset show
      </button>
    </form>
  );
}
