"use client";

import { useEffect, useState, useTransition } from "react";
import { castVote, fetchJudgeState } from "./actions";
import type { JudgeState } from "@/lib/judge-state";

export function JudgeVoting({ slug, initialState }: { slug: string; initialState: JudgeState }) {
  const [state, setState] = useState<JudgeState>(initialState);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchJudgeState(slug).then(setState).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, [slug]);

  if (state.phase === "no-show") {
    return <Message text="No show is live right now." />;
  }
  if (state.phase === "not-judge") {
    return <Message text="You are not listed as a judge for this show." />;
  }
  if (state.phase === "no-contestant") {
    return <Message text="Waiting for the show to start." />;
  }

  const clickable = state.status === "voting";

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black p-6 text-center">
      <p className="text-xl text-zinc-300">{state.contestantName}</p>
      <p className="text-sm uppercase tracking-wide text-zinc-500">
        {state.status === "waiting" && "Get ready"}
        {state.status === "voting" && "Tap to vote"}
        {state.status === "revealed" && "Locked in"}
      </p>
      <div className="flex w-full max-w-xl flex-row gap-4">
        <button
          type="button"
          onClick={() => handleTap("red")}
          disabled={!clickable}
          aria-pressed={state.vote === "red"}
          className={`h-40 flex-1 rounded-2xl bg-red-600 text-2xl font-bold text-white transition-opacity ${
            state.vote === "red" ? "border-8 border-white" : "border-8 border-transparent"
          } ${clickable ? "" : "opacity-60"}`}
        >
          RED
        </button>
        <button
          type="button"
          onClick={() => handleTap("green")}
          disabled={!clickable}
          aria-pressed={state.vote === "green"}
          className={`h-40 flex-1 rounded-2xl bg-[#4fbf85] text-2xl font-bold text-white transition-opacity ${
            state.vote === "green" ? "border-8 border-white" : "border-8 border-transparent"
          } ${clickable ? "" : "opacity-60"}`}
        >
          GREEN
        </button>
      </div>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6 text-center text-xl text-zinc-300">
      {text}
    </div>
  );
}
