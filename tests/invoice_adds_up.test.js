// The invoice's Payout column must add up exactly to Net payout. Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs"), vm = require("vm"), path = require("path");
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/html_invoice.gs"), "utf8"), ctx);

const fmt = { dayShort: () => "Fri", long: () => "Friday", year: () => "2026" };
const cents = (s) => Math.round(Number(String(s).replace(/[^0-9.]/g, "")) * 100);

test("Payout rows (bookings plus travel lines) sum to Net payout", () => {
  // The same per-row formula the script uses, on a week with every kind of amount in it.
  const pct = 0.4;
  const mk = (price, linen, product, conv, grat, eventName) => {
    const facilityFee = price * pct;
    return { date: new Date(2026, 0, 9), service: "S", price, facilityFee, linenFee: linen, productFee: product,
      convenience: conv, gratAmt: grat, eventName, payout: price - facilityFee - product - linen + conv + grat };
  };
  const items = [mk(90, 3, 0, 0, 15, ""), mk(80, 3, 4, 0, 10, ""), mk(90, 0, 0, 10, 0, "Fair"), mk(90, 0, 0, 10, 0, "Fair")];
  const eventTotals = { Fair: { travel: 50, convenience: 20, count: 2, services: ["S", "S"] } };
  const sum = (f) => items.reduce((s, i) => s + f(i), 0);
  const gross = sum((i) => i.price), facility = sum((i) => i.facilityFee), product = sum((i) => i.productFee);
  const linen = sum((i) => i.linenFee), grat = sum((i) => i.gratAmt);
  const net = gross - facility - product - linen + 50 + 20 + grat;   // the script's Net payout formula

  const d = ctx.invoiceHtmlData_("Flora", "", "Avery", new Date(2026, 0, 9), new Date(2026, 0, 15), items,
    pct, gross, facility, product, 1, 4, linen, 2, 3, eventTotals, grat, net, fmt, "");
  const rows = d.regular.concat(...d.events.map((e) => e.rows));
  assert.strictEqual(rows.reduce((s, r) => s + cents(r.payout), 0), Math.round(net * 100));
  assert.strictEqual(cents(d.net), Math.round(net * 100));
  assert.ok(d.events[0].rows.some((r) => r.service === "Travel (once for this event)"));
});
