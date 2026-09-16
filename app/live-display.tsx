"use client";

import { useEffect, useState } from "react";
import { fetchPublicState } from "./actions";
import type { PublicState } from "@/lib/public-state";
import { Scoreboard } from "./scoreboard";
import { Starfield } from "./components/starfield";
import { IceStrip } from "./components/ice-strip";
import { ShowTitle } from "./components/show-title";
import { Label } from "./components/label";
import { VoteBox } from "./components/vote-box";

export function LiveDisplay({ initialState }: { initialState: PublicState }) {
  const [state, setState] = useState<PublicState>(initialState);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPublicState().then(setState).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (state.phase === "no-show") {
    return (
      <Shell>
        <ShowTitle size="lg" />
        <p className="font-serif text-xl text-ice sm:text-2xl">The show will begin soon.</p>
      </Shell>
    );
  }

  if (state.phase === "no-contestant") {
    return (
      <Shell>
        <ShowTitle size="lg" name={state.showName} />
        <Label className="text-xl sm:text-2xl">Starting soon</Label>
      </Shell>
    );
  }

  if (state.phase === "audience") {
    return (
      <Shell>
        <ShowTitle size="lg" name={state.showName} />
        <Label className="text-xl sm:text-2xl">Audience vote</Label>
        <div className="flex flex-col items-center gap-4">
          {state.contestants.map((c) => (
            <span
              key={c.id}
              className="font-display uppercase tracking-[0.02em] text-white"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              {c.startupName}
            </span>
          ))}
        </div>
      </Shell>
    );
  }

  if (state.phase === "complete") {
    return (
      <Shell>
        <Scoreboard
          showName={state.showName}
          rows={state.rows}
          winnerContestantId={state.winnerContestantId}
          titleSize="lg"
        />
      </Shell>
    );
  }

  const greenlights = state.judges.filter((j) => j.vote === "green").length;
  const showGreenlights = state.status === "revealed";

  return (
    <Shell>
      <ShowTitle size="lg" name={state.showName} />
      <Label className="text-xl sm:text-2xl">
        Founder {state.contestantPosition} of {state.totalContestants}
      </Label>
      <p
        className="font-display uppercase tracking-[0.02em] text-white"
        style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
      >
        {state.contestantName}
      </p>
      <div className="flex w-full max-w-5xl flex-row flex-wrap items-start justify-center gap-8">
        {state.judges.map((j) => (
          <div key={j.id} className="flex w-40 flex-col items-center gap-3 sm:w-56">
            <span className="font-display uppercase tracking-[0.02em] text-ice">{j.name}</span>
            <VoteBox vote={j.vote} status={state.status} size="lg" />
          </div>
        ))}
      </div>
      {showGreenlights && (
        <p className="font-display uppercase tracking-[0.02em] text-gold" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>
          {greenlights} {greenlights === 1 ? "Greenlight" : "Greenlights"}
        </p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-navy">
      <Starfield />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center sm:gap-8 sm:px-8">
        {children}
      </div>
      <IceStrip />
    </div>
  );
}
