// Checks for the test-bookings plan (pure helper only). Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const { planTestBookings_, TEST_CLIENT_PREFIX } = require("../src/test_data.gs");

const people = [
  { name: "Sample Practitioner", services: ["60 Minute Massage", "Facial"] },
  { name: "Staff Test", services: ["90 Minute Massage"] }
];
const start = new Date(2026, 10, 20);  // Fri Nov 20, 2026
const rows = planTestBookings_(people, start, 14);

test("14 bookings, every date inside the Fri-Thu pay week", () => {
  assert.strictEqual(rows.length, 14);
  const end = new Date(2026, 10, 26);
  for (const r of rows) assert.ok(r.main[0] >= start && r.main[0] <= end, String(r.main[0]));
  assert.strictEqual(new Set(rows.map((r) => r.main[0].getDate())).size, 7);
});

test("each booking uses one of that practitioner's own services", () => {
  for (const r of rows) {
    const p = people.find((x) => x.name === r.main[1]);
    assert.ok(p.services.includes(r.main[2]), r.main.join(" | "));
  }
});

test("every client is marked as a test, so Clear finds exactly these", () => {
  for (const r of rows) assert.ok(r.main[3].startsWith(TEST_CLIENT_PREFIX));
});

test("one comped, one linen removed, one custom price", () => {
  assert.strictEqual(rows.filter((r) => r.rare[1] === "Y").length, 1);
  assert.strictEqual(rows.filter((r) => r.rare[0] === "Y").length, 1);
  assert.strictEqual(rows.filter((r) => r.rare[3] === 99).length, 1);
});
