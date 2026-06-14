const test = require("node:test");
const assert = require("node:assert");

const { calculateXP, calculateCalories } = require("../src/services/gamificationService");

const cases = [
  [{ category: "running", distance_km: 10, duration_min: 40 }, 70, 167, 584],
  [{ category: "running", distance_km: 10, duration_min: 70 }, 70, 204, 677],
  [{ category: "cycling", distance_km: 10, duration_min: 40 }, 70, 153, 187],
  [{ category: "yoga-vinyasa", duration_min: 45 }, 70, 101, 210]
];

test("auto XP and calorie calculations match track_daily formula examples", async () => {
  for (const [workout, weightKg, expectedXp, expectedCalories] of cases) {
    assert.strictEqual(await calculateXP(workout), expectedXp);
    assert.strictEqual(calculateCalories(workout, weightKg), expectedCalories);
  }
});
