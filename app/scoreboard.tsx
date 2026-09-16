import type { ScoreboardRow } from "@/lib/results";

const audienceBonusClasses: Record<number, string> = {
  1: "text-yellow-600 dark:text-yellow-400 font-semibold",
  2: "text-green-600 dark:text-green-400 font-semibold",
};

export function Scoreboard({
  rows,
  winnerContestantId,
}: {
  rows: ScoreboardRow[];
  winnerContestantId: number | null;
}) {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-3 font-medium">Startup</th>
            <th className="px-4 py-3 font-medium">Judge points</th>
            <th className="px-4 py-3 font-medium">Audience bonus</th>
            <th className="px-4 py-3 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isWinner = row.contestantId === winnerContestantId;
            return (
              <tr
                key={row.contestantId}
                className={`border-t border-zinc-200 dark:border-zinc-800 ${
                  isWinner ? "bg-yellow-50 dark:bg-yellow-500/10" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  {row.startupName}
                  {isWinner && (
                    <span className="ml-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-yellow-950">
                      Winner
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{row.judgePoints}</td>
                <td className={`px-4 py-3 ${audienceBonusClasses[row.audienceBonus] ?? ""}`}>
                  {row.audienceBonus}
                </td>
                <td className="px-4 py-3 font-semibold">{row.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
