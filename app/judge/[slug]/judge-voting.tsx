"use client";

import { useEffect, useState, useTransition } from "react";
import { castVote, fetchJudgeState } from "./actions";
import type { JudgeState } from "@/lib/judge-state";

const labels: Record<"neutral" | "red" | "yellow", string> = {
  neutral: "Tap to vote",
  red: "RED",
  yellow: "YELLOW",
};

const colorClasses: Record<"neutral" | "red" | "yellow", string> = {
  neutral: "bg-zinc-700 text-zinc-100",
  red: "bg-red-600 text-white",
  yellow: "bg-yellow-400 text-zinc-900",
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

  function handleClick() {
    if (!clickable || state.phase !== "contestant") return;
    const { judgeId, contestantId } = state;
    startTransition(async () => {
      try {
        const next = await castVote(slug, judgeId, contestantId);
        setState(next);
      } catch {
        // A stale click; the next poll will resync the button.
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black p-6 text-center">
      <p className="text-xl text-zinc-300">{state.contestantName}</p>
      <button
        type="button"
        onClick={handleClick}
        disabled={!clickable}
        className={`h-64 w-64 max-w-[80vw] rounded-full text-2xl font-bold transition-colors ${colorClasses[state.vote]} ${
          clickable ? "" : "opacity-60"
        }`}
      >
        {state.status === "waiting" && "Get ready"}
        {state.status === "voting" && labels[state.vote]}
        {state.status === "revealed" && "Locked in"}
      </button>
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
