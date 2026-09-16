"use client";

import { useEffect, useState } from "react";
import type { PublicState } from "@/lib/public-state";
import { Scoreboard } from "./scoreboard";
import { Starfield } from "./components/starfield";
import { IceStrip } from "./components/ice-strip";
import { ShowTitle } from "./components/show-title";
import { Label } from "./components/label";
import SummitFlag from "./components/SummitFlag";

export function LiveDisplay({ initialState }: { initialState: PublicState }) {
  const [state, setState] = useState<PublicState>(initialState);

  console.log(state);

  useEffect(() => {
    const source = new EventSource("/api/live-state");
    source.onmessage = (event) => {
      try {
        setState(JSON.parse(event.data));
      } catch {}
    };
    return () => source.close();
  }, []);

  if (state.phase === "no-show") {
    return (
      <Shell>
        <ShowTitle size="lg" />
        <p className="font-serif text-lg text-ice sm:text-xl">The show will begin soon.</p>
      </Shell>
    );
  }

  if (state.phase === "no-contestant") {
    return (
      <Shell>
        <ShowTitle size="lg" name={state.showName} />
        <Label className="text-lg sm:text-xl">Starting soon</Label>
      </Shell>
    );
  }

  if (state.phase === "audience") {
    return (
      <Shell>
        <ShowTitle size="lg" name={state.showName} />
        <Label className="text-lg sm:text-xl">Audience vote</Label>
        <div className="flex flex-col items-center gap-2">
          {state.contestants.map((c) => (
            <span
              key={c.id}
              className="font-display uppercase tracking-[0.02em] text-white"
              style={{ fontSize: "clamp(1.5rem, 6vmin, 4rem)" }}
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

  return (
    <Shell>
      <ShowTitle size="lg" name={state.showName} />
      <Label className="text-lg sm:text-xl">
        Founder {state.contestantPosition} of {state.totalContestants}
      </Label>
      <p
        className="font-display uppercase tracking-[0.02em] text-white"
        style={{ fontSize: "clamp(2rem, 9vmin, 6rem)" }}
      >
        {state.contestantName}
      </p>
      <div
        className="flex w-full max-w-5xl flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-center sm:gap-6"
        style={{ fontSize: "clamp(1rem, 4vmin, 2.5rem)" }}
      >
        {state.judges.map((j) => (
          <div
            key={j.id}
            className="flex w-40 min-w-0 flex-col items-center gap-1.5 sm:w-auto sm:flex-1"
            style={{ maxWidth: "clamp(120px, 28vmin, 300px)" }}
          >
            <span className="font-display uppercase tracking-[0.02em] text-ice">{j.name}</span>
            <SummitFlag vote={j.vote} judgeName={j.name} />
          </div>
        ))}
      </div>
      <p className="font-display uppercase tracking-[0.02em] text-gold" style={{ fontSize: "clamp(1rem, 3.5vmin, 2.5rem)" }}>
        {greenlights} {greenlights === 1 ? "Greenlight" : "Greenlights"}
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-navy">
      <Starfield />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-4 text-center sm:gap-4 sm:px-8">
        {children}
      </div>
      <IceStrip />
    </div>
  );
}
