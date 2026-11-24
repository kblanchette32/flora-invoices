// Checks for how the records tabs show each column. Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs"), vm = require("vm"), path = require("path");

const ctx = {};
vm.createContext(ctx);
vm.runInContext(["payout_tools.gs", "records_style.gs"].map((f) => fs.readFileSync(path.join(__dirname, "../src", f), "utf8")
  .replace(/if \(typeof module[^\n]*\n?/g, "")).join("\n;\n"), ctx);
const st = (h, send) => ctx.recordsColumnStyle_(h, send);
const money = vm.runInContext("CURRENCY_FMT", ctx);

test("dates and times read like dates", () => {
  assert.strictEqual(st("Period Start").format, "ddd mmm d, yyyy");
  assert.strictEqual(st("Date of Service").format, "ddd mmm d, yyyy");
  assert.strictEqual(st("Archived On").format, "mmm d, yyyy h:mm am/pm");
});

test("money columns get the money format; Y/N question columns don't", () => {
  for (const h of ["Price", "Product Fee", "Linen Fee", "Gratuity", "Facility Fee", "Travel Fee", "Event Service Fee", "Net to Practitioner",
    "Comped Value", "Custom Price", "Product Fees", "Event Fees", "Comped", "Gross Revenue", "Net Amount"]) assert.strictEqual(st(h).format, money, h);
  for (const h of ["Remove Linen Fee?", "Comped?"]) { assert.strictEqual(st(h).format, "", h); assert.strictEqual(st(h).align, "center", h); }
});

test("Send Log's Period Start stays text, because sending matches on it", () => {
  assert.strictEqual(st("Period Start", true).format, "");
  assert.strictEqual(st("Sent On", true).format, "mmm d, yyyy h:mm am/pm");
});
