import { test } from "node:test";
import assert from "node:assert/strict";
import { ATTRIBUTION, isDefaultName, nameAt, withAttribution } from "./rename.ts";

test("withAttribution keeps the athlete's description and adds the line once", () => {
  assert.equal(withAttribution(null), ATTRIBUTION);
  assert.equal(withAttribution(""), ATTRIBUTION);
  assert.equal(withAttribution("Legs felt great\n"), `Legs felt great\n\n${ATTRIBUTION}`);
  assert.equal(withAttribution(`Hi\n\n${ATTRIBUTION}`), `Hi\n\n${ATTRIBUTION}`);
});

test("detects Strava default names", () => {
  for (const n of ["Morning Run", "Lunch Ride", "Evening E-Bike Ride", "Night Walk", "Afternoon Weight Training"])
    assert.ok(isDefaultName(n), n);
  for (const n of ["Morning Run with Sam", "Long run 🏃", "Run", "Tuesday Morning Run", "Morning Run 2"])
    assert.ok(!isDefaultName(n), n);
});

test("nameAt goes in order and wraps", () => {
  assert.equal(nameAt([], 0), null);
  assert.deepEqual([0, 1, 2, 3].map((i) => nameAt(["a", "b", "c"], i)), ["a", "b", "c", "a"]);
});
