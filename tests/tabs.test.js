// Checks for the tab order plan (pure helper only). Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const { planTabOrder_, TAB_GROUPS_, TAB_HIDDEN_ } = require("../src/tabs.gs");

test("groups come first in order, unknown tabs keep their order after them", () => {
  const now = ["Full manual", "Settings", "Archive", "My notes", "Transactions", "Calculations", "Invoices", "Old stuff", "Services"];
  const plan = planTabOrder_(now, TAB_GROUPS_, TAB_HIDDEN_);
  assert.deepStrictEqual(plan.visible, ["Transactions", "Invoices", "Services", "Settings", "Full manual", "Archive", "My notes", "Old stuff"]);
  assert.deepStrictEqual(plan.extra, ["My notes", "Old stuff"]);
  assert.deepStrictEqual(plan.hide, ["Calculations"]);
});

test("tabs that don't exist are simply skipped", () => {
  const plan = planTabOrder_(["Invoices"], TAB_GROUPS_, TAB_HIDDEN_);
  assert.deepStrictEqual(plan, { visible: ["Invoices"], hide: [], extra: [] });
});

test("a hidden-list tab is never also in the visible order", () => {
  const plan = planTabOrder_(["Square Import", "Transactions"], TAB_GROUPS_, TAB_HIDDEN_);
  assert.ok(!plan.visible.includes("Square Import"));
  assert.deepStrictEqual(plan.hide, ["Square Import"]);
});
