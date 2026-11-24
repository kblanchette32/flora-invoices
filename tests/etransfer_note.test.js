// Checks for the e-Transfer message text. Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs"), vm = require("vm"), path = require("path");

const ctx = {
  Utilities: { formatDate: (d) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getDate() },
  Session: { getScriptTimeZone: () => "America/Winnipeg" }
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/payout_tools.gs"), "utf8"), ctx);
const note = (grat) => ctx.buildETransferNote_(
  { lineItems: [{ service: "Facial" }], gratuityTotal: grat, eventFeesTotal: 0, netAmount: 60, txnCount: 1 },
  new Date(2026, 10, 20), new Date(2026, 10, 26), "Flora").text;

test("says No gratuity when there is none", () => {
  assert.strictEqual(note(0), "Flora payout Nov 20 to Nov 26: 1 x Facial. No gratuity. Total $60.00.");
});

test("names the gratuity when there is one", () => {
  assert.match(note(15), /Gratuity \$15\.00\. Total/);
  assert.doesNotMatch(note(15), /No gratuity/);
});
