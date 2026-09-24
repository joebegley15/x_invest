import type { ScoreboardRow } from "@/lib/results";
import { ShowTitle } from "./components/show-title";
import { Label } from "./components/label";

export function Scoreboard({
  showName,
  rows,
  winnerContestantId,
  titleSize = "sm",
  showTitle = true,
}: {
  showName?: string;
  rows: ScoreboardRow[];
  winnerContestantId: number | null;
  titleSize?: "lg" | "sm";
  showTitle?: boolean;
}) {
  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      {showTitle && (
        <>
          <ShowTitle size={titleSize} name={showName} />
          <p className="font-serif text-base text-ice sm:text-lg">Final results</p>
        </>
      )}

      <div className="grid w-full grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,1fr)] gap-2 px-2">
        <Label className="text-xs sm:text-sm">Startup</Label>
        <Label className="text-center text-xs sm:text-sm">Yays</Label>
        <Label className="text-center text-xs sm:text-sm">Favorites</Label>
        <Label className="text-center text-xs sm:text-sm">Audience</Label>
        <Label className="text-center text-xs sm:text-sm">Total</Label>
      </div>

      <div className="flex w-full flex-col gap-1.5">
        {rows.map((row) => {
          const isWinner = row.contestantId === winnerContestantId;
          return (
            <div
              key={row.contestantId}
              className={`grid grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-2 rounded-xl border px-3 py-2 sm:px-4 ${
                isWinner ? "border-gold bg-gold" : "border-line bg-transparent"
              }`}
            >
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span
                  className={`font-display uppercase tracking-[0.02em] ${
                    isWinner ? "text-navy" : "text-white"
                  }`}
                >
                  {row.startupName}
                </span>
                {isWinner && (
                  <span className="rounded-full bg-navy px-2 py-0.5 font-display text-xs uppercase tracking-[0.02em] text-gold">
                    Winner
                  </span>
                )}
              </div>
              <span className={`text-center font-display ${isWinner ? "text-navy" : "text-ice"}`}>
                {row.yayPoints}
              </span>
              <span className={`text-center font-display ${isWinner ? "text-navy" : "text-ice"}`}>
                {row.favoritePoints}
              </span>
              <span className={`text-center font-display ${isWinner ? "text-navy" : "text-ice"}`}>
                {row.audienceBonus}
              </span>
              <span
                className={`text-center font-display text-lg ${isWinner ? "text-navy" : "text-ice"}`}
              >
                {row.total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
