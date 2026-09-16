import type { VoteValue } from "@/lib/vote";

const colorClasses: Record<VoteValue, string> = {
  neutral: "bg-panel border-line",
  red: "bg-vote-out border-vote-out",
  green: "bg-vote-in border-vote-in",
};

export function VoteBox({
  vote,
  status,
  size = "lg",
}: {
  vote: VoteValue;
  status: "waiting" | "voting" | "revealed";
  size?: "lg" | "sm";
}) {
  const revealed = status === "revealed";
  const label = revealed ? (vote === "green" ? "IN" : vote === "red" ? "OUT" : null) : null;

  return (
    <div
      className={`flex items-center justify-center rounded-2xl border-2 transition-colors duration-300 motion-reduce:transition-none ${
        size === "lg" ? "h-[220px] w-full" : "h-14 w-20 rounded-lg"
      } ${colorClasses[vote]}`}
    >
      {label && (
        <span
          className={`font-display uppercase tracking-[0.02em] text-navy ${
            size === "lg" ? "text-5xl" : "text-base"
          }`}
        >
          {label}
        </span>
      )}
      {!revealed && status === "waiting" && size === "lg" && (
        <span className="font-display text-sm uppercase tracking-[0.02em] text-lavender">
          Waiting
        </span>
      )}
    </div>
  );
}
