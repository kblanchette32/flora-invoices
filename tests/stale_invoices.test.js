// Checks for spotting stale invoice PDFs in a week's folder. Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs"), vm = require("vm"), path = require("path");

// staleInvoiceFiles_ lives in payout_tools.js, which has no module.exports; load it in a sandbox.
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/payout_tools.gs"), "utf8"), ctx);
const stale = (files, names) => ctx.staleInvoiceFiles_(files, names, "11-20-2026");

test("an invoice for someone with no bookings this run is stale", () => {
  const r = stale(["Avery - Invoice - 11-20-2026.pdf", "Blake - Invoice - 11-20-2026.pdf"], ["Avery"]);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(r)), [{ file: "Blake - Invoice - 11-20-2026.pdf", name: "Blake" }]);
});

test("summaries, other weeks and other files are never touched", () => {
  const r = stale(["Review Summary - 11-20-2026.pdf", "Business Totals - 11-20-2026.pdf",
    "Casey - Invoice - 11-13-2026.pdf", "notes.txt", " - Invoice - 11-20-2026.pdf"], []);
  assert.deepStrictEqual(r.length, 0);
});

test("a duplicate stale name is listed once", () => {
  const r = stale(["Dee - Invoice - 11-20-2026.pdf", "Dee - Invoice - 11-20-2026.pdf"], []);
  assert.strictEqual(r.length, 1);
});
