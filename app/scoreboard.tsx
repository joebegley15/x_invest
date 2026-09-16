import type { ScoreboardRow } from "@/lib/results";
import { ShowTitle } from "./components/show-title";
import { Label } from "./components/label";

export function Scoreboard({
  showName,
  rows,
  winnerContestantId,
  titleSize = "sm",
}: {
  showName?: string;
  rows: ScoreboardRow[];
  winnerContestantId: number | null;
  titleSize?: "lg" | "sm";
}) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      <ShowTitle size={titleSize} name={showName} />
      <p className="font-serif text-lg text-ice sm:text-xl">Final results</p>

      <div className="grid w-full grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-2">
        <Label className="text-xs sm:text-sm">Startup</Label>
        <Label className="text-center text-xs sm:text-sm">Judges</Label>
        <Label className="text-center text-xs sm:text-sm">Audience</Label>
        <Label className="text-center text-xs sm:text-sm">Total</Label>
      </div>

      <div className="flex w-full flex-col gap-3">
        {rows.map((row) => {
          const isWinner = row.contestantId === winnerContestantId;
          return (
            <div
              key={row.contestantId}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 rounded-xl border px-3 py-3 sm:px-4 ${
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
                {row.judgePoints}
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
