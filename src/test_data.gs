// =====================================================================================
// TEST BOOKINGS  (for trying the steps out; remove before sharing the sheet)
//
// Flora · Tools > Add test bookings fills empty Transactions rows with made-up bookings for the
// pay week in Invoices C4, using the real practitioners and services already on the sheet.
// Every test booking's Client Name starts with TEST_CLIENT_PREFIX, which is how
// Clear test bookings finds them again: it never touches any other row.
// =====================================================================================

const TEST_CLIENT_PREFIX = "TEST · ";
const TEST_BOOKING_COUNT = 14;

function menuAddTestBookings() { runStep_("Add test bookings", addTestBookings); }
function menuClearTestBookings() { runStep_("Clear test bookings", clearTestBookings); }

// confirmed: true after the Flora Yes button.
function addTestBookings(confirmed) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const txn = ss.getSheetByName(TXN_SHEET);
  const range = getPeriodRange_(ss.getSheetByName(INVOICES_SHEET), ui);
  if (!range) return;

  // Active practitioners and the services each one offers, straight from the sheet.
  const prac = ss.getSheetByName(PRACTITIONERS_SHEET)
    .getRange(PRAC_FIRST_ROW, 1, PRAC_LAST_ROW - PRAC_FIRST_ROW + 1, 2).getValues()
    .filter(function (r) { return r[0] && isYes_(r[1]); })
    .map(function (r) { return String(r[0]); });
  const svc = ss.getSheetByName(SERVICES_SHEET)
    .getRange(SERVICES_FIRST_ROW, 1, SERVICES_LAST_ROW - SERVICES_FIRST_ROW + 1, 2).getValues();
  const people = prac.map(function (name) {
    return { name: name, services: svc.filter(function (r) { return r[0] === name && r[1]; }).map(function (r) { return r[1]; }) };
  }).filter(function (p) { return p.services.length; });
  if (!people.length) {
    floraAlert_("No test bookings added: no active practitioner has a service on the Services tab yet.", "warn");
    return;
  }

  const rows = planTestBookings_(people, range.periodStart, TEST_BOOKING_COUNT);

  // Goes after the last row that has anything typed in it, so nothing is overwritten.
  const n = TXN_LAST_ROW - TXN_FIRST_ROW + 1;
  const typed = txn.getRange(TXN_FIRST_ROW, 1, n, TXN_INPUT_COLS).getValues();
  let last = -1;
  typed.forEach(function (r, i) { if (r.some(function (v) { return v !== ""; })) last = i; });
  const first = TXN_FIRST_ROW + last + 1;
  if (first + rows.length - 1 > TXN_LAST_ROW) {
    floraAlert_("No test bookings added: Transactions only has " + (TXN_LAST_ROW - first + 1) + " empty rows at the bottom, and this needs " + rows.length + ".", "warn");
    return;
  }

  if (!confirmed) {
    floraConfirm_("Test bookings", { tone: "info", headline: "Add test bookings?",
      body:
    "This adds " + rows.length + " made-up bookings for " + fmtDate(range.periodStart) + " to " + fmtDate(range.periodEnd) +
    " on Transactions rows " + first + " to " + (first + rows.length - 1) + ", using your real practitioners and services.\n\n" +
    "Each one's Client Name starts with \"" + TEST_CLIENT_PREFIX.trim() + "\", so Flora · Tools > Clear test bookings removes exactly these. " +
    "Nothing is emailed by adding them.",
      yes: "Add them", no: "Not now", action: "addTests" });
    return;
  }

  txn.getRange(first, 1, rows.length, TXN_INPUT_COLS).setValues(rows.map(function (r) { return r.main; }));
  txn.getRange(first, 1, rows.length, 1).setNumberFormat("mm/dd/yyyy");
  txn.getRange(first, TXN_RARE_COL, rows.length, TXN_RARE_COLS).setValues(rows.map(function (r) { return r.rare; }));
  for (let row = first; row < first + rows.length; row++) setServiceDropdownForRow(txn, row);

  floraAlert_(rows.length + " test bookings added (rows " + first + " to " + (first + rows.length - 1) + "). " +
    "A few are comped, have the linen fee removed or a custom price, so those show up on the invoices too.\n\n" +
    "Before sharing the sheet, run Flora · Tools > Clear test bookings.", "good");
}

// confirmed: true after the Flora Yes button.
function clearTestBookings(confirmed) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const txn = ss.getSheetByName(TXN_SHEET);
  const n = TXN_LAST_ROW - TXN_FIRST_ROW + 1;
  const clients = txn.getRange(TXN_FIRST_ROW, 4, n, 1).getValues();
  const hits = [];
  clients.forEach(function (r, i) { if (String(r[0]).indexOf(TEST_CLIENT_PREFIX) === 0) hits.push(TXN_FIRST_ROW + i); });
  if (!hits.length) {
    floraAlert_("No test bookings found. (Test bookings have a Client Name starting with \"" + TEST_CLIENT_PREFIX.trim() + "\".)", "warn");
    return;
  }
  if (!confirmed) {
    floraConfirm_("Test bookings", { tone: "warn", headline: "Clear test bookings?",
      body:
    "This clears " + hits.length + " test booking(s) on Transactions (rows " + hits[0] + " to " + hits[hits.length - 1] + "). " +
    "Only rows whose Client Name starts with \"" + TEST_CLIENT_PREFIX.trim() + "\" are touched; real bookings stay.\n\n" +
    "Invoice PDFs, summaries or Send Log rows made from them are not removed; delete those from Drive or the Send Log yourself.",
      yes: "Clear them", no: "Not now", action: "clearTests", danger: true });
    return;
  }

  hits.forEach(function (row) {
    txn.getRange(row, 1, 1, TXN_INPUT_COLS).clearContent();
    txn.getRange(row, TXN_RARE_COL, 1, TXN_RARE_COLS).clearContent();
    setServiceDropdownForRow(txn, row);
  });
  floraAlert_(hits.length + " test booking(s) cleared.", "good");
}

// ---------------------------------------------------------------- pure helper (no Google calls)

// A fixed, varied week of bookings: spread over all seven days, rotating practitioners and their
// services, some gratuities, and one each of comped, linen fee removed and custom price.
// Returns [{main: [date, practitioner, service, client, gratuity], rare: [noLinen, comped, event, customPrice]}].
function planTestBookings_(people, periodStart, count) {
  const tips = [0, 10, 15, 20, 0, 12.5, 25];
  const out = [];
  for (let i = 0; i < count; i++) {
    const p = people[i % people.length];
    const service = p.services[Math.floor(i / people.length) % p.services.length];
    const date = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate() + (i % 7));
    const client = TEST_CLIENT_PREFIX + "Client " + (i + 1 < 10 ? "0" : "") + (i + 1);
    out.push({
      main: [date, p.name, service, client, tips[i % tips.length]],
      rare: [i === 5 ? "Y" : "", i === 3 ? "Y" : "", "", i === 8 ? 99 : ""]
    });
  }
  return out;
}

if (typeof module !== "undefined") module.exports = { planTestBookings_: planTestBookings_, TEST_CLIENT_PREFIX: TEST_CLIENT_PREFIX };
