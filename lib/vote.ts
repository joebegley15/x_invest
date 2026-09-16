export type VoteValue = "neutral" | "red" | "yellow";

export function nextVoteValue(value: VoteValue): VoteValue {
  if (value === "neutral") return "red";
  if (value === "red") return "yellow";
  return "neutral";
}
