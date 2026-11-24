// Quick checks for the C4 bouncer's date logic. Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const { parsePeriodInput_, fridayOnOrBefore_ } = require("../src/period_guard.gs");

const today = new Date(2026, 10, 22);  // Sun Nov 22, 2026
const ymd = (d) => d && [d.getFullYear(), d.getMonth() + 1, d.getDate()].join("-");
const parse = (v) => { const r = parsePeriodInput_(v, today); return r && ymd(r.date); };

test("Friday snapping: every day of the pay week maps to its Friday", () => {
  for (let day = 20; day <= 26; day++) assert.strictEqual(ymd(fridayOnOrBefore_(new Date(2026, 10, day))), "2026-11-20");
  assert.strictEqual(ymd(fridayOnOrBefore_(new Date(2026, 10, 27))), "2026-11-27");
});

test("text dates a user might type or paste", () => {
  assert.strictEqual(parse("11/20/2026"), "2026-11-20");
  assert.strictEqual(parse(" 11-20-26 "), "2026-11-20");
  assert.strictEqual(parse("2026-11-20"), "2026-11-20");
  assert.strictEqual(parse("Nov 20"), "2026-11-20");
  assert.strictEqual(parse("November 20th, 2026"), "2026-11-20");
  assert.strictEqual(parse("20 Nov 2026"), "2026-11-20");
  assert.strictEqual(parse("Fri Nov 20"), "2026-11-20");
  assert.strictEqual(parse("11/20"), "2026-11-20");
  assert.strictEqual(parse("11.20.2026"), "2026-11-20");
});

test("day-first is only used when month-first is impossible, and is flagged", () => {
  const r = parsePeriodInput_("20/11/2026", today);
  assert.strictEqual(ymd(r.date), "2026-11-20");
  assert.strictEqual(r.swapped, true);
  assert.strictEqual(parse("05/11/2026"), "2026-5-11");  // ambiguous: month-first, caught by the 3-week note
});

test("real dates and pasted serial numbers", () => {
  assert.strictEqual(parse(new Date(2026, 10, 24)), "2026-11-24");
  assert.strictEqual(parse(46346), "2026-11-20");
});

test("missing year picks the closest one", () => {
  const jan = new Date(2027, 0, 3);
  assert.strictEqual(ymd(parsePeriodInput_("Dec 30", jan).date), "2026-12-30");
});

test("junk is refused, so the last good Friday gets put back", () => {
  for (const v of ["", "next friday", "abc", "13/13/2026", "2/31/2026", 5, null, "#VALUE!"]) assert.strictEqual(parse(v), null, String(v));
});
