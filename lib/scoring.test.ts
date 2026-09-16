import assert from "node:assert/strict";
import {
  judgePointsByContestant,
  computeScores,
  findOverallWinner,
  computeAudienceBonus,
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

run("single audience favorite gets +2, everyone else 0, no runoff", () => {
  const votes = new Map([
    [1, 10],
    [2, 5],
    [3, 2],
  ]);
  const result = computeAudienceBonus(votes);
  assert.equal(result.needsRunoff, false);
  assert.deepEqual(result.leaders, [1]);
  assert.equal(result.bonusByContestant.get(1), 2);
  assert.equal(result.bonusByContestant.get(2), 0);
  assert.equal(result.bonusByContestant.get(3), 0);
});

run("two-way tie splits +1 each, no runoff", () => {
  const votes = new Map([
    [1, 10],
    [2, 10],
    [3, 2],
  ]);
  const result = computeAudienceBonus(votes);
  assert.equal(result.needsRunoff, false);
  assert.equal(result.bonusByContestant.get(1), 1);
  assert.equal(result.bonusByContestant.get(2), 1);
  assert.equal(result.bonusByContestant.get(3), 0);
});

run("three-way tie needs a runoff, no bonus assigned yet", () => {
  const votes = new Map([
    [1, 10],
    [2, 10],
    [3, 10],
  ]);
  const result = computeAudienceBonus(votes);
  assert.equal(result.needsRunoff, true);
  assert.deepEqual([...result.leaders].sort(), [1, 2, 3]);
  assert.equal(result.bonusByContestant.get(1), 0);
  assert.equal(result.bonusByContestant.get(2), 0);
  assert.equal(result.bonusByContestant.get(3), 0);
});

run("admin's runoff pick awards the full +2 to the chosen contestant", () => {
  const bonus = applyRunoffWinner([1, 2, 3], 2);
  assert.equal(bonus.get(1), 0);
  assert.equal(bonus.get(2), 2);
  assert.equal(bonus.get(3), 0);
  assert.equal(validateFinalAudienceBonus([...bonus.values()]), null);
});

run("a two-way audience split can create an overall tie", () => {
  const judgePoints = new Map([
    [1, 3],
    [2, 2],
    [3, 2],
  ]);
  const audienceVotes = new Map([
    [1, 1],
    [2, 8],
    [3, 8],
  ]);
  const bonusResult = computeAudienceBonus(audienceVotes);
  assert.equal(bonusResult.needsRunoff, false);
  assert.equal(bonusResult.bonusByContestant.get(2), 1);
  assert.equal(bonusResult.bonusByContestant.get(3), 1);

  const scores = computeScores([1, 2, 3], judgePoints, bonusResult.bonusByContestant);
  const overall = findOverallWinner(scores);
  assert.equal(overall.winnerId, null);
  assert.deepEqual([...overall.tied].sort(), [1, 2, 3]);
});

run("judgePointsByContestant only counts green votes", () => {
  const points = judgePointsByContestant([
    { contestantId: 1, value: "green" },
    { contestantId: 1, value: "green" },
    { contestantId: 1, value: "red" },
    { contestantId: 2, value: "neutral" },
  ]);
  assert.equal(points.get(1), 2);
  assert.equal(points.get(2) ?? 0, 0);
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
