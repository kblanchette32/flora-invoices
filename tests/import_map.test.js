// Checks for matching an old sheet's columns by heading. Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const { normHeading_, mapColumns_, mergeTable_ } = require("../src/import_map.gs");

test("headings match despite case, spacing, punctuation and (notes)", () => {
  assert.strictEqual(normHeading_("Product Fee (automatic)"), normHeading_("product  fee"));
  assert.strictEqual(normHeading_("Payout % Override"), normHeading_("payout override"));
});

test("columns are matched by name even when the old sheet orders them differently", () => {
  const m = mapColumns_(["Name", "Active?", "Email"], ["Email", "", "Name", "Active?", "Old notes"]);
  assert.deepStrictEqual(m.map, [2, 3, 0]);
  assert.deepStrictEqual(m.missing, []);
  assert.deepStrictEqual(m.unused, ["Old notes"]);
});

test("a heading the old sheet doesn't have is reported, not guessed", () => {
  const m = mapColumns_(["Name", "Type"], ["Name"]);
  assert.deepStrictEqual(m.map, [0, -1]);
  assert.deepStrictEqual(m.missing, ["Type"]);
});

test("merging keeps this version's formulas where the old sheet had none, and counts real rows", () => {
  const newRows = [["", "", 0], ["", "", 0], ["", "", 0]];
  const newF = [["", "", "=X1"], ["", "", "=X2"], ["", "", "=X3"]];
  const oldRows = [["Avery", "avery@example.com", ""], ["Blake", "", 12], ["", "", ""]];
  const oldF = [["", "", ""], ["", "", ""], ["", "", ""]];
  const r = mergeTable_(newRows, newF, oldRows, oldF, [0, 1, 2]);
  assert.deepStrictEqual(r.values, [["Avery", "avery@example.com", "=X1"], ["Blake", "", 12], ["", "", "=X3"]]);
  assert.strictEqual(r.rowsWithData, 2);
});

test("an unmatched column keeps what this sheet already has", () => {
  const r = mergeTable_([["", "Practitioner"]], [["", ""]], [["Avery"]], [[""]], [0, -1]);
  assert.deepStrictEqual(r.values, [["Avery", "Practitioner"]]);
});
