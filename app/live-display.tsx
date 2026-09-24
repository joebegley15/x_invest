"use client";

import { useEffect, useState } from "react";
import type { PublicState } from "@/lib/public-state";
import { Scoreboard } from "./scoreboard";
import { Stage } from "./components/stage";
import SummitFlag from "./components/SummitFlag";
import { AudienceCard } from "./components/audience-card";
import { FavoriteCard } from "./components/favorite-card";

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
      <Stage>
        <Centered>
          <p className="font-serif text-lg text-ice sm:text-xl">The show will begin soon.</p>
        </Centered>
      </Stage>
    );
  }

  if (state.phase === "no-contestant") {
    return <Stage showName={state.showName} label="Starting soon" />;
  }

  if (state.phase === "favorites") {
    return (
      <Stage showName={state.showName} label="Judge favorites" itemCount={state.contestants.length}>
        <Centered>
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {state.contestants.map((c) => (
              <FavoriteCard key={c.contestantId} data={c} revealed={state.revealed} />
            ))}
          </div>
        </Centered>
      </Stage>
    );
  }

  if (state.phase === "audience") {
    const mode = state.bonusConfirmed ? "bonus" : "vote";
    return (
      <Stage
        showName={state.showName}
        label={mode === "bonus" ? "Audience bonus" : "Audience vote"}
        itemCount={state.contestants.length}
      >
        <Centered>
          <div key={mode} className="flex items-center justify-center gap-4 sm:gap-6">
            {state.contestants.map((c) => (
              <AudienceCard key={c.contestantId} data={c} mode={mode} />
            ))}
          </div>
        </Centered>
      </Stage>
    );
  }

  if (state.phase === "complete") {
    return (
      <Stage showName={state.showName} label="Final results">
        <Centered>
          <Scoreboard
            rows={state.rows}
            winnerContestantId={state.winnerContestantId}
            showTitle={false}
          />
        </Centered>
      </Stage>
    );
  }

  const greenlights = state.judges.filter((j) => j.vote === "green").length;

  return (
    <Stage
      showName={state.showName}
      label={`Founder ${state.contestantPosition} of ${state.totalContestants}`}
      itemCount={state.judges.length}
    >
      <Centered>
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
      </Centered>
    </Stage>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center sm:gap-4">
      {children}
    </div>
  );
}
