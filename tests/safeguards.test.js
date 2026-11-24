// Checks for spotting bookings that changed after the PDFs were made. Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const { resultsFingerprint_, fingerprintChanges_ } = require("../src/safeguards.gs");

const made = resultsFingerprint_([{ name: "Avery", txnCount: 3, netAmount: 210 }, { name: "Blake", txnCount: 1, netAmount: 85 }]);

test("nothing changed: nothing reported", () => {
  const now = resultsFingerprint_([{ name: "Blake", txnCount: 1, netAmount: 85.0 }, { name: "Avery", txnCount: 3, netAmount: 210 }]);
  assert.deepStrictEqual(fingerprintChanges_(made, now), []);
});

test("a changed amount, a new practitioner and a removed one are all named", () => {
  const now = resultsFingerprint_([{ name: "Avery", txnCount: 3, netAmount: 215 }, { name: "Casey", txnCount: 1, netAmount: 60 }]);
  assert.deepStrictEqual(fingerprintChanges_(made, now), ["Avery", "Blake", "Casey"]);
});

const { findDuplicateBookings_ } = require("../src/safeguards.gs");

test("bookings entered twice are found; different clients or dates aren't", () => {
  const d = new Date(2026, 10, 20);
  const rows = [
    [d, "Avery", "Facial", "Client 01", ""],
    [d, "Avery", "Facial", "Client 02", ""],
    [d, "avery ", "Facial", "client 01", 10],   // same booking, different spacing and capitals
    [new Date(2026, 10, 21), "Avery", "Facial", "Client 01", ""],
    [d, "Blake", "Facial", "", ""],             // no client name: not judged
    [d, "Blake", "Facial", "", ""]
  ];
  assert.deepStrictEqual(findDuplicateBookings_(rows, 5), [[5, 7]]);
});
