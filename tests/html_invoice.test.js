// Checks for the HTML invoice. Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const { buildInvoiceHtml_, invoiceHtmlData_, money_, bandNameSize_ } = require("../src/html_invoice.gs");

const fmt = {
  dayShort: (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getDate(),
  long: (d) => ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()] + ", " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getDate(),
  year: (d) => String(d.getFullYear())
};
const item = { date: new Date(2026, 10, 20), service: "Facial", price: 100, facilityFee: 40, linenFee: 3, productFee: 10, convenience: 0, gratAmt: 15, payout: 62 };
const data = invoiceHtmlData_("Flora", "1 Main St\nAnytown", "Avery <b>", new Date(2026, 10, 20), new Date(2026, 10, 26), [item],
  0.40, 100, 40, 10, 1, 10, 3, 1, 3, {}, 15, 62, fmt, "Avery - Invoice - 11-20-2026.pdf");
const html = buildInvoiceHtml_(data);

test("money format", () => { assert.strictEqual(money_(1234.5), "$1,234.50"); assert.strictEqual(money_(0), "$0.00"); });

test("names are escaped, never read as HTML", () => {
  assert.ok(html.includes("Avery &lt;b&gt;"));
  assert.ok(!html.includes("Avery <b>"));
});

test("the requested parts are there, and the dropped ones are gone", () => {
  for (const s of ["PAYOUT INVOICE", "PRACTITIONER", "PAY PERIOD", "BOOKINGS", "NET PAYOUT", "sent by e-transfer", "SERVICES", "SUMMARY",
    "Net payout", "Questions about this invoice? Reply to the email it came with.", "Avery - Invoice - 11-20-2026.pdf"]) assert.ok(html.includes(s), s);
  for (const s of ["INVOICE OF SERVICES RENDERED", "For your own records", "Services, less fees"]) assert.ok(!html.includes(s), s);
  assert.ok(html.includes("1 Main St<br>Anytown"));
  assert.ok(!/display:\s*(flex|grid)/.test(html), "no flex/grid, which Google's PDF converter doesn't handle");
});

test("wording and labels match the spec", () => {
  assert.strictEqual(data.periodLong, "Friday, Nov 20 to Thursday, Nov 26, 2026");
  assert.strictEqual(data.bookingsLabel, "1 service");
  assert.strictEqual(data.regular[0].date, "Fri Nov 20");
  assert.strictEqual(data.regular[0].productNote, "less $10.00 product fee");
  assert.strictEqual(data.regular[0].facility, "−$40.00");
  assert.strictEqual(data.regular[0].gratuity, "+$15.00");
  assert.deepStrictEqual(data.ledger.map((l) => l[0]), ["Services", "Facility fee (40%)", "Linen fee, 1 × $3.00", "Product fee, 1 × $10.00", "Gratuity"]);
  assert.strictEqual(data.ledger[4][2], "plus");
});

test("a zero fee shows a dash", () => {
  const d = invoiceHtmlData_("Flora", "", "Blake", new Date(2026, 10, 20), new Date(2026, 10, 26),
    [Object.assign({}, item, { linenFee: 0, productFee: 0, gratAmt: 0 })], 0.40, 100, 40, 0, 0, 0, 0, 0, 0, {}, 0, 60, fmt, "");
  assert.strictEqual(d.regular[0].linen, "—");
  assert.strictEqual(d.regular[0].gratuity, "—");
  assert.strictEqual(d.regular[0].productNote, "");
  assert.deepStrictEqual(d.ledger.map((l) => l[0]), ["Services", "Facility fee (40%)"]);
});

test("a long business name shrinks to stay on one line", () => {
  assert.strictEqual(bandNameSize_("Flora"), 34);
  assert.ok(bandNameSize_("Sample Wellness and Massage Therapy Collective") < 24);
});
