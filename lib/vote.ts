export type VoteValue = "neutral" | "red" | "green";

export function toggleVote(current: VoteValue, tapped: "red" | "green"): VoteValue {
  return current === tapped ? "neutral" : tapped;
}

export function voteWord(value: VoteValue): "In" | "Out" | null {
  if (value === "green") return "In";
  if (value === "red") return "Out";
  return null;
}
