import assert from "node:assert/strict";
import {
  yayPoints,
  favoritePoints,
  totalPoints,
  audiencePoints,
  computeScores,
  findOverallWinner,
  applyRunoffWinner,
  validateFinalAudienceBonus,
} from "./scoring";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

run("clear winner: leader well ahead gets all 2, no runoff", () => {
  const result = audiencePoints(new Map([[1, 600], [2, 300], [3, 100]]));
  assert.equal(result.needsRunoff, false);
  assert.equal(result.pointsByContestant.get(1), 2);
  assert.equal(result.pointsByContestant.get(2), 0);
  assert.equal(result.pointsByContestant.get(3), 0);
});

run("gap of exactly 2 points splits 1 and 1", () => {
  // 400 / 1000 = 40%, 380 / 1000 = 38%, third is far behind
  const result = audiencePoints(new Map([[1, 400], [2, 380], [3, 220]]));
  assert.equal(result.needsRunoff, false);
  assert.equal(result.pointsByContestant.get(1), 1);
  assert.equal(result.pointsByContestant.get(2), 1);
  assert.equal(result.pointsByContestant.get(3), 0);
});

run("gap of 2.1 points does not split", () => {
  // 40.0% vs 37.9%
  const result = audiencePoints(new Map([[1, 400], [2, 379], [3, 221]]));
  assert.equal(result.needsRunoff, false);
  assert.equal(result.pointsByContestant.get(1), 2);
  assert.equal(result.pointsByContestant.get(2), 0);
  assert.equal(result.pointsByContestant.get(3), 0);
});

run("exact tie for first between two startups splits", () => {
  const result = audiencePoints(new Map([[1, 10], [2, 10], [3, 2]]));
  assert.equal(result.needsRunoff, false);
  assert.equal(result.pointsByContestant.get(1), 1);
  assert.equal(result.pointsByContestant.get(2), 1);
  assert.equal(result.pointsByContestant.get(3), 0);
});

run("three startups within 2 points of the leader need a runoff, nothing awarded yet", () => {
  // 34.0%, 33.5%, 32.5%: all within 2 points of the leader
  const result = audiencePoints(new Map([[1, 340], [2, 335], [3, 325]]));
  assert.equal(result.needsRunoff, true);
  assert.equal(result.pointsByContestant.get(1), 0);
  assert.equal(result.pointsByContestant.get(2), 0);
  assert.equal(result.pointsByContestant.get(3), 0);
});

run("third startup outside 2 points of the leader still splits the top two", () => {
  // 38.0%, 37.0%, 25.0%: second is 1 point back, third is well outside
  const result = audiencePoints(new Map([[1, 380], [2, 370], [3, 250]]));
  assert.equal(result.needsRunoff, false);
  assert.equal(result.pointsByContestant.get(1), 1);
  assert.equal(result.pointsByContestant.get(2), 1);
  assert.equal(result.pointsByContestant.get(3), 0);
});

run("zero votes cast: nobody is awarded and no runoff", () => {
  const result = audiencePoints(new Map([[1, 0], [2, 0], [3, 0]]));
  assert.equal(result.needsRunoff, false);
  assert.deepEqual([...result.pointsByContestant.values()], [0, 0, 0]);
  assert.equal(audiencePoints(new Map()).needsRunoff, false);
});

run("admin's runoff pick awards the full 2 to the chosen contestant", () => {
  const bonus = applyRunoffWinner([1, 2, 3], 2);
  assert.equal(bonus.get(1), 0);
  assert.equal(bonus.get(2), 2);
  assert.equal(bonus.get(3), 0);
  assert.equal(validateFinalAudienceBonus([...bonus.values()]), null);
});

run("yayPoints counts only green votes for that contestant", () => {
  const votes = [
    { contestantId: 1, value: "green" as const },
    { contestantId: 1, value: "green" as const },
    { contestantId: 1, value: "red" as const },
    { contestantId: 2, value: "neutral" as const },
    { contestantId: 2, value: "green" as const },
  ];
  assert.equal(yayPoints(1, votes), 2);
  assert.equal(yayPoints(2, votes), 1);
  assert.equal(yayPoints(3, votes), 0);
});

run("favoritePoints counts matching picks and ignores null", () => {
  assert.equal(favoritePoints(1, [1, 1, null]), 2);
  assert.equal(favoritePoints(2, [1, 1, null]), 0);
  assert.equal(favoritePoints(1, []), 0);
});

run("a judge can favorite a founder they voted OUT on", () => {
  const votes = [{ contestantId: 1, value: "red" as const }];
  const audience = new Map([[1, 0]]);
  assert.equal(totalPoints(1, votes, [1], audience), 1);
});

run("totalPoints sums yay, favorite and audience, max 8 with three judges", () => {
  const votes = [
    { contestantId: 1, value: "green" as const },
    { contestantId: 1, value: "green" as const },
    { contestantId: 1, value: "green" as const },
  ];
  const audience = new Map([[1, 2]]);
  assert.equal(totalPoints(1, votes, [1, 1, 1], audience), 8);
  assert.equal(totalPoints(1, votes, [1, null, 2], new Map([[1, 1]])), 5);
});

run("a two-way audience split can create an overall tie", () => {
  const votes = [
    { contestantId: 1, value: "green" as const },
    { contestantId: 1, value: "green" as const },
    { contestantId: 1, value: "green" as const },
    { contestantId: 2, value: "green" as const },
    { contestantId: 2, value: "green" as const },
    { contestantId: 3, value: "green" as const },
    { contestantId: 3, value: "green" as const },
  ];
  const favorites = [null, null, null];
  const audience = audiencePoints(new Map([[1, 1], [2, 8], [3, 8]]));
  assert.equal(audience.pointsByContestant.get(2), 1);
  assert.equal(audience.pointsByContestant.get(3), 1);

  const scores = computeScores([1, 2, 3], votes, favorites, audience.pointsByContestant);
  assert.deepEqual(scores.map((s) => s.total), [3, 3, 3]);
  const overall = findOverallWinner(scores);
  assert.equal(overall.winnerId, null);
  assert.deepEqual([...overall.tied].sort(), [1, 2, 3]);
});

run("computeScores fills all three columns", () => {
  const votes = [
    { contestantId: 1, value: "green" as const },
    { contestantId: 2, value: "green" as const },
  ];
  const [a, b] = computeScores([1, 2], votes, [2, 2, 1], new Map([[1, 2]]));
  assert.deepEqual(a, { contestantId: 1, yayPoints: 1, favoritePoints: 1, audienceBonus: 2, total: 4 });
  assert.deepEqual(b, { contestantId: 2, yayPoints: 1, favoritePoints: 2, audienceBonus: 0, total: 3 });
});

run("validateFinalAudienceBonus rejects malformed distributions", () => {
  assert.equal(validateFinalAudienceBonus([2, 0, 0]), null);
  assert.equal(validateFinalAudienceBonus([1, 1, 0]), null);
  assert.equal(validateFinalAudienceBonus([0, 0, 0]), null);
  assert.notEqual(validateFinalAudienceBonus([2, 1, 0]), null);
  assert.notEqual(validateFinalAudienceBonus([1, 1, 1]), null);
  assert.notEqual(validateFinalAudienceBonus([2, 2, 0]), null);
});

if (process.exitCode) {
  console.error("\nScoring tests failed.");
} else {
  console.log("\nAll scoring tests passed.");
}
