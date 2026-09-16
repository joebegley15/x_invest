export type VoteValue = "neutral" | "red" | "yellow";

export function toggleVote(current: VoteValue, tapped: "red" | "yellow"): VoteValue {
  return current === tapped ? "neutral" : tapped;
}
