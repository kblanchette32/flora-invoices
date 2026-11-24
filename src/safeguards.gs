// =====================================================================================
// SAFEGUARDS BETWEEN STEPS
//
// - Out-of-date PDFs: when invoices (step 2) or the manager summary (step 3) are made, a short
//   fingerprint of each practitioner's bookings and net is remembered for that week. Sending (step 4)
//   or emailing the summary (3b) first checks nothing has changed since; if it has, it says who and
//   asks for the PDFs to be made again, so an outdated invoice can't go out.
// - Test bookings: counted so Send and Start next week can warn that they're included.
// - E-Transfers tab: emptied by Start next week, so last week's payments can't be mistaken for this week's.
// =====================================================================================

const INVOICE_PRINT_KEY = "INVOICE_FINGERPRINT";
const SUMMARY_PRINT_KEY = "SUMMARY_FINGERPRINT";

// { name: "bookings|net" } for every practitioner on the invoices. Pure.
function resultsFingerprint_(results) {
  const out = {};
  results.forEach(function (r) { out[String(r.name)] = r.txnCount + "|" + Number(r.netAmount || 0).toFixed(2); });
  return out;
}

// Names whose bookings or net differ between two fingerprints (added, removed or changed). Pure.
function fingerprintChanges_(before, now) {
  const names = {};
  Object.keys(before).concat(Object.keys(now)).forEach(function (n) { if (before[n] !== now[n]) names[n] = true; });
  return Object.keys(names).sort();
}

function rememberPrint_(key, periodStart, results, onlyName) {
  try {
    const props = PropertiesService.getDocumentProperties();
    const week = fmtDate(periodStart);
    let stored = {};
    try { stored = JSON.parse(props.getProperty(key) || "{}"); } catch (ignore) { stored = {}; }
    const print = resultsFingerprint_(results);
    if (onlyName) {  // redo one practitioner: only their entry changes
      if (stored.week !== week) return;  // no full set made yet for this week; nothing to compare against
      stored.print[onlyName] = print[onlyName];
    } else {
      stored = { week: week, print: print };
    }
    props.setProperty(key, JSON.stringify(stored));
  } catch (ignore) { /* a safeguard, never a reason for the step itself to fail */ }
}

// Names changed since the PDFs were made for this week; [] if nothing changed or nothing was recorded.
function changedSincePrint_(key, periodStart, results) {
  try {
    const stored = JSON.parse(PropertiesService.getDocumentProperties().getProperty(key) || "{}");
    if (stored.week !== fmtDate(periodStart) || !stored.print) return [];
    return fingerprintChanges_(stored.print, resultsFingerprint_(results));
  } catch (ignore) { return []; }
}

function testBookingCount_(ss) {
  const n = TXN_LAST_ROW - TXN_FIRST_ROW + 1;
  return ss.getSheetByName(TXN_SHEET).getRange(TXN_FIRST_ROW, 4, n, 1).getValues()
    .filter(function (r) { return String(r[0]).indexOf(TEST_CLIENT_PREFIX) === 0; }).length;
}

// Start next week: last week's checklist goes (it's already in the Archive), with a pointer to make the new one.
function resetETransferTab_(ss) {
  const sh = ss.getSheetByName(ETRANSFER_SHEET);
  if (!sh) return;
  sh.clear();
  sh.getRange(1, 1, Math.max(sh.getMaxRows(), 1), 1).removeCheckboxes();
  sh.setConditionalFormatRules([]);
  sh.getRange("A1").setValue("No checklist for this week yet.").setFontSize(16).setFontWeight("bold").setFontColor(COLOR_PRIMARY);
  sh.getRange("A2").setValue("When you're ready to pay, run 5 · E-Transfer notes and press Make checklist tab.").setFontSize(13);
}


// ---------------------------------------------------------------- more checks (audit 3)

// Bookings typed or pasted twice: same date, practitioner, service and client. Pure.
// rows: Transactions A:E values; firstRow: the sheet row of rows[0]. Returns [[rowA, rowB, ...], ...].
function findDuplicateBookings_(rows, firstRow) {
  const seen = {}, groups = {};
  rows.forEach(function (r, i) {
    const d = r[0] instanceof Date ? r[0].getTime() : String(r[0]).trim();
    if (!d || !r[1] || !r[2] || !String(r[3]).trim()) return;  // only full bookings with a client name
    const k = [d, String(r[1]).trim().toLowerCase(), String(r[2]).trim().toLowerCase(), String(r[3]).trim().toLowerCase()].join("|");
    if (k in seen) (groups[k] = groups[k] || [seen[k]]).push(firstRow + i);
    else seen[k] = firstRow + i;
  });
  return Object.keys(groups).map(function (k) { return groups[k]; });
}

// How many Archive rows are already filed under this pay week (0 if none, or no Archive yet).
function archivedRowsForWeek_(ss, periodStart) {
  const sh = ss.getSheetByName(ARCHIVE_SHEET);
  if (!sh || sh.getLastRow() <= LOG_HEADER_ROW) return 0;
  const key = fmtDate(periodStart);
  return sh.getRange(LOG_HEADER_ROW + 1, 1, sh.getLastRow() - LOG_HEADER_ROW, 1).getValues()
    .filter(function (r) { return r[0] instanceof Date && fmtDate(r[0]) === key; }).length;
}

// Names on this week's E-Transfers checklist not yet ticked Paid ([] if there's no checklist for this week).
function unpaidOnChecklist_(ss, periodStart) {
  const sh = ss.getSheetByName(ETRANSFER_SHEET);
  if (!sh || sh.getRange("A1").getNote() !== fmtDate(periodStart) || sh.getLastRow() <= ETRANSFER_HEADER_ROW) return [];
  return sh.getRange(ETRANSFER_HEADER_ROW + 1, 1, sh.getLastRow() - ETRANSFER_HEADER_ROW, 2).getValues()
    .filter(function (r) { return r[1] && r[0] !== true; }).map(function (r) { return String(r[1]); });
}

if (typeof module !== "undefined") module.exports = { resultsFingerprint_: resultsFingerprint_, fingerprintChanges_: fingerprintChanges_, findDuplicateBookings_: findDuplicateBookings_ };
