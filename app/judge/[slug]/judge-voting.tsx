"use client";

import { useEffect, useState, useTransition } from "react";
import { castVote, fetchJudgeState } from "./actions";
import type { JudgeState } from "@/lib/judge-state";
import { Starfield } from "@/app/components/starfield";
import { ShowTitle } from "@/app/components/show-title";
import { Label } from "@/app/components/label";

const statusLine: Record<"neutral" | "red" | "green", string> = {
  neutral: "No vote yet",
  red: "You voted out",
  green: "You voted in",
};

export function JudgeVoting({ slug, initialState }: { slug: string; initialState: JudgeState }) {
  const [state, setState] = useState<JudgeState>(initialState);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchJudgeState(slug).then(setState).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, [slug]);

  if (state.phase === "no-show" || state.phase === "not-judge") {
    return (
      <Shell showName={state.phase === "not-judge" ? state.showName : undefined}>
        <p className="font-serif text-lg text-ice">
          Hang tight. Voting opens when the show starts.
        </p>
      </Shell>
    );
  }

  if (state.phase === "no-contestant") {
    return (
      <Shell showName={state.showName} judgeName={state.judgeName}>
        <p className="font-serif text-lg text-ice">Voting opens soon.</p>
      </Shell>
    );
  }

  const clickable = state.status === "voting";
  const locked = state.status === "revealed";

  function handleTap(tapped: "red" | "green") {
    if (!clickable || state.phase !== "contestant") return;
    const { judgeId, contestantId } = state;
    startTransition(async () => {
      try {
        const next = await castVote(slug, judgeId, contestantId, tapped);
        setState(next);
      } catch {
        // A stale click; the next poll will resync the buttons.
      }
    });
  }

  if (state.status === "waiting") {
    return (
      <Shell showName={state.showName} judgeName={state.judgeName}>
        <Label className="text-sm">Now pitching</Label>
        <p className="font-display text-3xl uppercase tracking-[0.02em] text-white sm:text-4xl">
          {state.contestantName}
        </p>
        <p className="font-serif text-lg text-ice">Voting opens soon.</p>
      </Shell>
    );
  }

  const selectedRed = state.vote === "red";
  const selectedGreen = state.vote === "green";
  const noneSelected = state.vote === "neutral";

  return (
    <Shell showName={state.showName} judgeName={state.judgeName}>
      <Label className="text-sm">Now pitching</Label>
      <p className="font-display text-3xl uppercase tracking-[0.02em] text-white sm:text-4xl">
        {state.contestantName}
      </p>
      <p className="font-serif text-lg text-ice">{statusLine[state.vote]}</p>

      <div className="flex w-full max-w-xl flex-row gap-4">
        <button
          type="button"
          onClick={() => handleTap("red")}
          disabled={!clickable}
          aria-pressed={selectedRed}
          aria-label="Vote out"
          className={`h-40 flex-1 rounded-2xl border-[5px] bg-vote-out font-display text-3xl uppercase tracking-[0.02em] text-navy transition-transform duration-150 active:scale-95 motion-reduce:transition-none ${
            selectedRed
              ? "border-white opacity-100"
              : noneSelected
                ? "border-transparent opacity-100"
                : "border-transparent opacity-45"
          }`}
        >
          Out
        </button>
        <button
          type="button"
          onClick={() => handleTap("green")}
          disabled={!clickable}
          aria-pressed={selectedGreen}
          aria-label="Vote in"
          className={`h-40 flex-1 rounded-2xl border-[5px] bg-vote-in font-display text-3xl uppercase tracking-[0.02em] text-navy transition-transform duration-150 active:scale-95 motion-reduce:transition-none ${
            selectedGreen
              ? "border-white opacity-100"
              : noneSelected
                ? "border-transparent opacity-100"
                : "border-transparent opacity-45"
          }`}
        >
          In
        </button>
      </div>

      <p className="font-serif text-sm text-lavender">
        {locked ? "Your vote is locked." : "Votes lock when Joe counts down."}
      </p>
    </Shell>
  );
}

function Shell({
  showName,
  judgeName,
  children,
}: {
  showName?: string;
  judgeName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-navy">
      <Starfield />
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-4">
        <ShowTitle size="sm" name={showName} />
        {judgeName && <Label className="text-xs">Judge {judgeName}</Label>}
      </div>
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-10 text-center">
        {children}
      </div>
    </div>
  );
}
