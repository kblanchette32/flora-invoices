// Checks for the report PDFs' HTML. Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs"), vm = require("vm"), path = require("path");

const ctx = {};
vm.createContext(ctx);
vm.runInContext(["html_invoice.gs", "html_reports.gs"].map((f) => fs.readFileSync(path.join(__dirname, "../src", f), "utf8")
  .replace(/if \(typeof module[^\n]*\n?/g, "")).join("\n;\n"), ctx);

const computed = { results: [
  { name: "Avery", txnCount: 2, grossTotal: 200, compedTotal: 0, facilityFeeTotal: 80, linenTotal: 3, productFeeTotal: 10, eventFeesTotal: 0, gratuityTotal: 15, netAmount: 122 }
], skipped: [], outOfPeriod: 0, mismatches: [] };
const r = { businessName: "Flora", businessAddress: "", periodLong: "Friday, Nov 20 to Thursday, Nov 26, 2026", prepared: "November 22, 2026",
  fileName: "x.pdf", computed, bookings: [{ date: new Date(2026, 10, 20), practitioner: "Avery <i>", client: "C", service: "Facial", price: 100, gratuity: 15, notes: [] }],
  fmtDay: () => "Fri Nov 20" };

test("review summary: same style parts, totals right, names escaped", () => {
  const h = ctx.buildReviewSummaryHtml_(r);
  for (const s of ["PAYROLL REVIEW SUMMARY", "TO PAY OUT", "$122.00", "TOTALS BY PRACTITIONER", "ALL BOOKINGS THIS WEEK", "x.pdf"]) assert.ok(h.includes(s), s);
  assert.ok(h.includes("Avery &lt;i&gt;"));
  assert.ok(!/display:\s*(flex|grid)/.test(h));
});

test("business totals: keeps = brought in minus paid out, and it balances", () => {
  const h = ctx.buildBusinessTotalsHtml_(r);
  // brought in 200 + 15 = 215, paid out 122, keeps 93 = fees 80 + 3 + 10 - 0
  assert.ok(h.includes("BUSINESS KEEPS") && h.includes("$93.00"));
  assert.ok(h.includes("Balanced: brought in minus paid out equals fees minus comps."));
});
