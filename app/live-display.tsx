"use client";

import { useEffect, useState } from "react";
import { fetchPublicState } from "./actions";
import type { PublicState } from "@/lib/public-state";

const colorClasses: Record<"neutral" | "red" | "yellow", string> = {
  neutral: "border-zinc-700 bg-zinc-900",
  red: "border-red-600 bg-red-500",
  yellow: "border-yellow-500 bg-yellow-400",
};

export function LiveDisplay({ initialState }: { initialState: PublicState }) {
  const [state, setState] = useState<PublicState>(initialState);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPublicState().then(setState).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (state.phase === "no-show") {
    return <Message text="No show running" />;
  }

  if (state.phase === "no-contestant") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black p-8 text-center">
        <h1 className="text-5xl font-bold text-zinc-100">{state.showName}</h1>
        <p className="text-3xl text-zinc-400">Waiting to begin</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-black p-8 text-center">
      <h1 className="text-4xl font-bold text-zinc-100 sm:text-5xl">{state.showName}</h1>
      <p className="text-5xl font-extrabold text-white sm:text-6xl">{state.contestantName}</p>
      <div className="flex flex-row flex-wrap items-start justify-center gap-8">
        {state.judges.map((j) => (
          <div key={j.id} className="flex flex-col items-center gap-4">
            <span className="text-2xl font-semibold text-zinc-200 sm:text-3xl">{j.name}</span>
            <div
              className={`h-40 w-40 rounded-2xl border-8 transition-colors sm:h-56 sm:w-56 ${colorClasses[j.vote]}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-8 text-center text-4xl font-semibold text-zinc-300">
      {text}
    </div>
  );
}
