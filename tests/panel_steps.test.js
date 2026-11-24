// Checks for the panel's step ticks (pure helpers only). Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const { parseStepsDone_, recordStep_, stepsFor_ } = require("../src/panel.gs");

test("ticks a step for the right week without touching others", () => {
  let all = recordStep_({}, "11/20/2026", "1", 8);
  all = recordStep_(all, "11/20/2026", "3b", 8);
  all = recordStep_(all, "11/13/2026", "4", 8);
  assert.deepStrictEqual(stepsFor_(all, "11/20/2026"), { "1": true, "2": false, "3": false, "3b": true, "4": false, "5": false });
  assert.strictEqual(stepsFor_(all, "11/13/2026")["4"], true);
  assert.strictEqual(stepsFor_(all, "11/27/2026")["1"], false);
});

test("keeps only the newest weeks, by date not by text order", () => {
  let all = {};
  ["01/02/2026", "12/25/2026", "06/05/2026", "11/20/2026"].forEach((k) => { all = recordStep_(all, k, "1", 2); });
  assert.deepStrictEqual(Object.keys(all).sort(), ["11/20/2026", "12/25/2026"]);
});

test("doesn't change the object it was given", () => {
  const before = { "11/20/2026": { "1": true } };
  recordStep_(before, "11/20/2026", "2", 8);
  assert.deepStrictEqual(before, { "11/20/2026": { "1": true } });
});

test("bad or missing stored data reads as nothing done", () => {
  for (const raw of [null, "", "not json", "[1,2]", "42"]) assert.deepStrictEqual(parseStepsDone_(raw), {}, String(raw));
});
