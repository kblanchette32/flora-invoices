// Checks for the screen-fit layout choice (pure helpers only). Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const { layoutFor_, widthsFor_, LAYOUTS_ } = require("../src/layout.gs");

const sum = (a) => a.reduce((x, y) => x + y, 0);

test("narrow windows get the compact layout, wide or unknown ones the roomy one", () => {
  assert.strictEqual(layoutFor_(1280), "compact");
  assert.strictEqual(layoutFor_(1440), "compact");
  assert.strictEqual(layoutFor_(1920), "roomy");
  for (const unknown of [0, undefined, null, "", "abc", -5]) assert.strictEqual(layoutFor_(unknown), "roomy", String(unknown));
});

test("compact widths leave room for the 300px panel on a 1440px laptop", () => {
  assert.ok(sum(widthsFor_("invoices", "compact")) <= 940);
  assert.ok(sum(widthsFor_("startHere", "compact")) <= 940);
});

test("both layouts keep the same number of columns", () => {
  for (const which of Object.keys(LAYOUTS_)) {
    assert.strictEqual(LAYOUTS_[which].roomy.length, LAYOUTS_[which].compact.length, which);
  }
  assert.strictEqual(widthsFor_("invoices", "anything else"), LAYOUTS_.invoices.roomy);
});
