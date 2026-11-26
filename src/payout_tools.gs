// =====================================================================================
// FLORA PAYOUTS  (Flora Invoices)
// Version:      2026-11-25a  (the menu shows this too, as "Script version ...")
//
// This script is several files (this one plus panel.gs, Panel.html, html_invoice.gs and others), sent to
// the sheet's bound Apps Script project with clasp. The Start here tab explains the weekly steps.
//
// Changes, newest first:
//   2026-11-25a Check totals and Make invoice PDFs now open the Invoices tab, so the table the pop-up
//               mentions is on screen. The Invoices table is about 925px wide, so Net Amount stays clear of the panel,
//               and the panel re-checks itself when the mouse comes back to it after a step run from the menu.
//               The Start here tab is narrower (about 920px), so it fits beside the Flora Payouts panel.
//   2026-11-24a Invoices add up line by line: each booking's Payout now takes off its product fee, and each
//               event table ends with a Travel line, so the Payout column sums exactly to Net payout.
//   2026-11-23i Every popup in the Flora look: Yes/No questions (send, summary, Start next week, backup, tabs,
//               test data, Start here) are Flora popups that carry on when Yes is pressed; Bring over has its own
//               popup with a link box and a preview. A non-Friday period start just explains how to fix it.
//               Yes buttons are red when it can't be undone (emails, Start next week, clearing), green otherwise.
//   2026-11-23h Start next week warns if the week is already in the Archive, or if payments on the E-Transfers
//               checklist aren't ticked Paid. Health Check flags bookings that look entered twice.
//   2026-11-23g Tidy-up: up-to-date wording (no "sage-tinted" cells, no older Instructions tab), unused
//               colours removed, Start here's What's new brought up to date.
//   2026-11-23f Records tabs (Archive, Payout History, Send Log): readable dates and money, Y/N centred, Net in
//               bold rose, Send Log shows Sent green and Failed red. Headings and filters are styled on the sheet.
//   2026-11-23e Room to grow: 500 bookings a week, 100 practitioners, 400 services, 60 service types, 100 events.
//               Older sheets grow once, automatically, formulas, Calculations, rules and locks included (capacity.js).
//   2026-11-23d The menu item and every mention now say "Open Flora Payouts panel".
//   2026-11-23c Manager summary and business totals PDFs in the invoice's style (html_reports.js), with the
//               Docs versions as a fallback. Start here title gets the rose underline.
//   2026-11-23b Invoice PDFs are built to the final mockup: one-line name band with address and PAYOUT INVOICE,
//               facts beside a net payout box, rose section headings, white-header tables with rose rule,
//               full-width summary, reply-to footer with the file name. Falls back to the Docs version if
//               Google's converter ever fails on one.
//   2026-11-23a Invoices can be built from the mockup's own design (html_invoice.js). TEST DATA > Sample invoice
//               in the new look makes one to compare before every invoice switches over.
//   2026-11-22z Bring over matches columns by heading (and Settings by label), so an older copy's
//               practitioners, emails, services and settings all come across, and says what it copied.
//               Sending invoices or the summary refuses if bookings changed since the PDFs were made.
//               Test bookings are flagged before sending and Start next week. Start next week empties the
//               E-Transfers checklist. Making PDFs also ticks step 1. Pasted dates on Transactions are read
//               and checked against the pay week. Health Check popup in the Flora look. Weekly steps popup
//               removed (the panel and the Start here tab cover it). Net column in the totals table in rose.
//   2026-11-22y The empty box left on Invoices where the manager email used to be is cleared (once, on open).
//   2026-11-22x Start here text is bigger (13pt and up, dark text), so it's easy to read.
//   2026-11-22w "Redo one practitioner's invoice" and "Summary for a past week" popups in the colored Flora look.
//   2026-11-22u Practitioners and Services dropdowns only on rows in use (plus 2 spare), so blank rows show
//               no arrows; a new row gets them as soon as a name is typed.
//   2026-11-22t Manager Email moves to Settings by itself the next time the sheet opens. Records tabs hidden with a Show/hide
//               toggle. Simpler panel: fewer extra buttons.
//   2026-11-22s Start here is always the first tab. Organize tabs renames the old Instructions tab to
//               "Full manual" (contents unchanged), which the Start here link opens.
//   2026-11-22r PDFs: the gaps between blocks match the mockup instead of a tall blank line.
//   2026-11-22q Start here links to the full manual (a manual tab, or a document link if one is set).
//   2026-11-22p E-Transfer notes say "No gratuity." when there is none.
//   2026-11-22o Help messages name the developer consistently.
//   2026-11-22n Fix "Service error: Documents" when making PDFs. Every message popup now uses the colored
//               Flora look (Yes/No questions stay as Google's box). Crash messages say where it happened.
//   2026-11-22m Start here tab, written by the script (FIX-IT > Rebuild Start here tab): the weekly steps, adding
//               bookings, good to know, what to do if something looks wrong, and what's new. (start_here.js)
//   2026-11-22l Make invoice PDFs removes this week's invoice for anyone who no longer has bookings, so a
//               stale PDF can't be emailed in step 4.
//   2026-11-22k New look for every PDF (invoices, manager summary, business totals): rose header band,
//               key facts, one big number, roomy striped tables. Same numbers as before. (pdf_style.js)
//   2026-11-22j Organize tabs (FIX-IT): every-week tabs first in rose, setup in blush, records in grey,
//               helper tabs hidden. Panel "Go to" buttons jump to the main tabs. (tabs.js)
//   2026-11-22i E-Transfer notes: "Make checklist tab" writes the payments to an E-Transfers tab with Paid
//               tick boxes, to work through in the bank app or on an iPad. Notes popup restyled. (etransfer.js)
//   2026-11-22h Result popups lead with a big colored headline ("3 invoices sent") and group the rest
//               (Sent / Not sent / Skipped) by name. Used for sending, totals, summary emailed and "saved". (dialogs.js)
//   2026-11-22g No envelope symbols in the menu (or the Weekly steps list); the item names already say "Email".
//   2026-11-22f Flora · Tools has no submenus: headings (REPORTS, FIX-IT, SETUP, TEST DATA) above their items.
//               Add / Clear test bookings (test_data.js). Roomier invoice totals table: taller rows, soft lines.
//   2026-11-22e Panel: the health pill opens the Health Check, "Refresh" is now "Re-check this week",
//               a Close panel button, and Weekly steps tips you to close the panel while typing bookings.
//   2026-11-22d Flora Payouts panel (Flora · This Week > Open Flora Payouts panel): this week at a glance, the steps with
//               ticks, and the tools, in a side panel. It flags a wrong or unknown Google account, and if
//               it can't load at all it explains the "signed in to several accounts" fix. Crash messages
//               give the same advice. (panel.js, Panel.html)
//   2026-11-22c Two menus: Flora · This Week (the weekly steps in order, ✉ on items that email) and
//               Flora · Tools (occasional items in Reports / Fix-it / Setup). Messages use the new names.
//   2026-11-22b Invoices C4 fixes itself: any date in the week snaps to its Friday, text and pasted
//               dates are read, and junk or a blank puts the last good Friday back, with a short
//               corner message. The C4 rule now warns instead of blocking. (period_guard.js)
//   2026-11-22  Weekly Steps (start here): a checklist dialog at the top of the menu that says which
//               buttons email people and which don't.
//               E-Transfer Notes: a ready-to-paste message for each payment.
//               Health Check menu item (also names the Google account you're signed in to).
//               Dialogs that send email or save files now name the signed-in Google account.
//               Any crash shows a plain-English message instead of a raw Google error.
//               Start New Week saves a safety copy of the sheet first, and now refuses to run
//               without a valid period start. Clear message when Invoices C4 isn't a real date,
//               and a confirm if it isn't a Friday. Text dates are read instead of dropped.
//               Entries typed below row 100 are reported instead of ignored. Stricter inputs
//               on Settings, Practitioners, Services and Invoices.
//   2026-11-06  Import from an old sheet, business totals report, manager review summary,
//               one-practitioner invoice, send log, strict inputs on Transactions.
// =====================================================================================

const TXN_SHEET = "Transactions";
const CALC_SHEET = "Calculations";
const SERVICES_SHEET = "Services";
const PRACTITIONERS_SHEET = "Practitioners";
const INVOICES_SHEET = "Invoices";
const ARCHIVE_SHEET = "Archive";
const SQUARE_SHEET = "Square Import";
const EVENTS_SHEET = "Events";

const TXN_FIRST_ROW = 5;
const TXN_LAST_ROW = 504;       // 500 bookings a week (rows 5 to 504); older sheets are grown by capacity.js
const TXN_INPUT_COLS = 5;  // A-E are typed inputs (Date, Practitioner, Service, Client Name, Gratuity $); F-N are calculated
const TXN_RARE_COL = 15;   // Remove Linen Fee?, Comped?, Event and Custom Price sit at the far right (O:R)
const TXN_RARE_COLS = 4;
const TXN_EVENT_COL = 17;  // Event column (Q)
const PRAC_FIRST_ROW = 5;
const PRAC_LAST_ROW = 104;      // 100 practitioners
const EVENTS_FIRST_ROW = 7;
const EVENTS_LAST_ROW = 106;    // 100 events
const SERVICES_FIRST_ROW = 5;
const SERVICES_LAST_ROW = 404;  // 400 services
const SVC_TYPES_COL = 7;   // Service Types list is Services!G:I
const SVC_TYPES_FIRST_ROW = 5;
const SVC_TYPES_LAST_ROW = 64;   // 60 service types

const PERIOD_START_CELL = "C4";
const SUMMARY_START_ROW = 9;

// Bump this whenever the script changes. The menu shows it, so you can see at a glance whether
// two copies of the sheet are running the same script.
const SCRIPT_VERSION = "2026-11-25a";
const SEND_LOG_SHEET = "Send Log";

// Start New Week saves a backup copy of the whole sheet here first, and keeps the newest few.
const SAFETY_FOLDER = "Flora Safety Copies";
const SAFETY_KEEP = 8;
// The business's own time zone (match appsscript.json). The Health Check flags a sheet set to a different one.
const EXPECTED_TIME_ZONE = "America/Winnipeg";
const LAST_ERROR_KEY = "LAST_ERROR";
// An e-Transfer message box holds about this many characters, so the notes are kept under it.
const ETRANSFER_NOTE_MAX = 400;

const CURRENCY_FMT = '$#,##0.00;($#,##0.00);"-"';

const COLOR_PRIMARY = "#A13D63";        // Flora's rose
const COLOR_PRIMARY_LIGHT = "#F7E4E9";  // blush
const COLOR_MUTED = "#5A5A5A";

// Every menu item runs through runStep_, so a crash shows a plain message instead of a raw Google error.
// Two menus: the weekly job in order, and everything occasional.
function onOpen() {
  moveManagerEmailOnOpen_();  // one-time, automatic: older sheets kept the manager email on Invoices
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Flora · This Week")
    .addItem("Open Flora Payouts panel", "openPanel")
    .addSeparator()
    .addItem("1 · Check this week's totals", "menuPreview")
    .addItem("2 · Make invoice PDFs", "menuGenerate")
    .addItem("3 · Make manager summary", "menuReviewSummary")
    .addItem("3b · Email summary to manager", "menuEmailSummary")
    .addItem("4 · Email invoices to practitioners", "menuSend")
    .addItem("5 · E-Transfer notes", "menuETransfer")
    .addSeparator()
    .addItem("Start next week (archive & clear)", "menuStartNewWeek")
    .addToUi();
  // No submenus: each group is a heading line followed by its items. Headings do nothing when clicked.
  ui.createMenu("Flora · Tools")
    .addItem("Health Check", "menuHealthCheck")
    .addItem("Redo one practitioner's invoice", "menuOneInvoice")
    .addSeparator()
    .addItem("REPORTS", "menuHeading")
    .addItem("Business totals", "menuBusinessTotals")
    .addItem("Summary for a past week", "menuPastSummary")
    .addSeparator()
    .addItem("FIX-IT", "menuHeading")
    .addItem("Refresh sheet logic", "menuRefresh")
    .addItem("Protect calculations", "menuProtect")
    .addItem("Organize tabs", "menuOrganizeTabs")
    .addItem("Rebuild Start here tab", "menuRebuildStartHere")
    .addItem("Show / hide records tabs", "menuToggleRecords")
    .addSeparator()
    .addItem("SETUP", "menuHeading")
    .addItem("Bring over data from old sheet", "menuBringOver")
    .addItem("Import from Square (not active yet)", "menuSquare")
    .addSeparator()
    .addItem("TEST DATA (remove before sharing)", "menuHeading")
    .addItem("Add test bookings", "menuAddTestBookings")
    .addItem("Clear test bookings", "menuClearTestBookings")
    .addSeparator()
    .addItem("Script version " + SCRIPT_VERSION, "showScriptVersion")
    .addToUi();
}

// The section headings in Flora · Tools are menu items too (Google has no plain-label kind), so clicking one just says so.
function menuHeading() {
  SpreadsheetApp.getActiveSpreadsheet().toast("That's a heading. Pick one of the items under it.", "Flora · Tools", 4);
}

function menuHealthCheck() { runStep_("Health Check", healthCheck); }
function menuRefresh() { runStep_("Refresh sheet logic", refreshSheetLogic); }
function menuPreview() { runStep_("1 · Check this week's totals", previewInvoiceTotals); }
function menuGenerate() { runStep_("2 · Make invoice PDFs", generateInvoices); }
function menuOneInvoice() { runStep_("Redo one practitioner's invoice", generateOneInvoice); }
function menuReviewSummary() { runStep_("3 · Make manager summary", generateReviewSummary); }
function menuEmailSummary() { runStep_("3b · Email summary to manager", emailReviewSummary); }
function menuSend() { runStep_("4 · Email invoices to practitioners", sendPractitionerInvoices); }
function menuETransfer() { runStep_("5 · E-Transfer notes", eTransferNotes); }
function menuStartNewWeek() { runStep_("Start next week", startNewWeek); }
function menuBusinessTotals() { runStep_("Business totals", generateBusinessTotals); }
function menuPastSummary() { runStep_("Summary for a past week", reviewSummaryForPastWeek); }
function menuBringOver() { runStep_("Bring over data from old sheet", bringOverFromOldSheet); }
function menuProtect() { runStep_("Protect calculations", protectCalculations); }
function menuSquare() { runStep_("Import from Square", importFromSquare); }

function runStep_(label, fn) {
  try {
    ensureCapacity_();  // one-time: grows older sheets to the current row limits before anything reads them
    ensureRecordsStyle_();  // one-time: the records tabs get the Flora look and filter buttons
    fn();
  } catch (e) {
    recordError_(label, e);
    const where = errorPlace_(e);
    floraDialog_("Something went wrong", {
      tone: "bad", headline: "Something went wrong in \"" + label + "\"",
      sub: "Please take a screenshot of this and send it to the developer.",
      body: friendlyError_(e) + (where ? " (" + where + ")" : "") +
        acct_(SpreadsheetApp.getActiveSpreadsheet(), "You're signed in as") +
        (label === "Start next week" ? "\n\nThis was Start next week: open the Archive tab and check what it saved before running it again." : "")
    });
  }
}

// The last error is kept (step, time, message only) so the Health Check can show it later.
function recordError_(label, e) {
  try {
    PropertiesService.getDocumentProperties().setProperty(LAST_ERROR_KEY,
      JSON.stringify({ at: new Date().toISOString(), step: label, message: (String(e && e.message || e) + " " + errorPlace_(e)).slice(0, 300) }));
  } catch (ignore) { /* recording the error must never hide the error */ }
}

function friendlyError_(e) {
  const msg = String(e && e.message || e);
  let plain = "";
  const oneAccount = "If you're signed in to more than one Google account, open the sheet in a window signed in only to the Flora account (a separate Chrome profile works best).";
  if (/ScriptError|PERMISSION_DENIED|multiple accounts|access denied/i.test(msg)) {
    plain = "Google stopped this because of which account you're signed in to. This almost always means you're signed in to more than one Google account in this browser. " + oneAccount;
  } else if (/authorization|permission|not allowed to call/i.test(msg)) {
    plain = "Google needs your permission again. Run the step once more, and when Google asks, click Advanced, then the \"Go to … (unsafe)\" link at the bottom, then Allow. " + oneAccount;
  } else if (/cannot read propert|is not a function|is null|is not defined|Range not found|sheet.*(not found|does not exist)/i.test(msg)) {
    plain = "A tab or setting this tool looks for is missing or was renamed. Run Flora · Tools > Health Check to see which one.";
  } else if (/too many times|quota|limit exceeded/i.test(msg)) {
    plain = "Google's daily limit was reached. Try again tomorrow.";
  } else if (/maximum execution time/i.test(msg)) {
    plain = "This took too long for Google. Run it again. Anything already finished is replaced, not doubled.";
  }
  return (plain ? plain + "\n\n" : "") + "Technical details: " + msg.slice(0, 200);
}

function onEdit(e) {
  if (!e || !e.range) return;
  // A name typed on a new Practitioners or Services row gets that row's dropdowns.
  try {
    const n = e.range.getSheet().getName();
    if ((n === PRACTITIONERS_SHEET || n === SERVICES_SHEET) && e.range.getColumn() <= 2) applySetupDropdowns_(e.source || SpreadsheetApp.getActiveSpreadsheet(), n);
  } catch (err) { recordError_("Setup dropdowns", err); }
  try { guardPeriodStart_(e); } catch (err) { recordError_("Period start guard", err); }
  try { guardTxnDates_(e); } catch (err) { recordError_("Transactions date guard", err); }
  const sheet = e.range.getSheet();
  if (sheet.getName() !== TXN_SHEET) return;
  const row = e.range.getRow();
  const col = e.range.getColumn();
  if (row < TXN_FIRST_ROW || col !== 2) return;
  setServiceDropdownForRow(sheet, row);
}

/**
 * Rebuilds every dropdown and validation rule in the workbook from scratch —
 * a failsafe for when one gets dragged onto another row or deleted by
 * accident. This only ever touches validation RULES, never a typed value, so
 * it's always safe to run: nothing already entered gets cleared or changed.
 */
// quiet: no closing message (used by the one-time capacity step, which shows its own).
function refreshSheetLogic(quiet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const txnSheet = ss.getSheetByName(TXN_SHEET);
  const pracSheet = ss.getSheetByName(PRACTITIONERS_SHEET);
  const svcSheet = ss.getSheetByName(SERVICES_SHEET);
  const eventsSheet = ss.getSheetByName(EVENTS_SHEET);

  const txnRows = TXN_LAST_ROW - TXN_FIRST_ROW + 1;
  const yn = SpreadsheetApp.newDataValidation().requireValueInList(["Y", "N"], true).setAllowInvalid(true).build();
  // Transactions rejects bad input outright, so every row can be calculated and every dropdown works.
  const strict = function (builder, help) { return builder.setAllowInvalid(false).setHelpText(help).build(); };

  // ---- Transactions ----
  txnSheet.getRange(TXN_FIRST_ROW, 1, txnRows, 1).setDataValidation(
    strict(SpreadsheetApp.newDataValidation().requireDate(),
      "Type month/day/year, like 10/17/2026, or double-click for the calendar. Day-first dates like 17/10/2026 are refused."));

  txnSheet.getRange(TXN_FIRST_ROW, 2, txnRows, 1).setDataValidation(
    strict(SpreadsheetApp.newDataValidation()
      .requireValueInRange(pracSheet.getRange(PRAC_FIRST_ROW, 1, PRAC_LAST_ROW - PRAC_FIRST_ROW + 1, 1), true),
      "Pick a name from the list. A new hire has to be added on the Practitioners tab first."));

  txnSheet.getRange(TXN_FIRST_ROW, TXN_INPUT_COLS, txnRows, 1).setDataValidation(
    strict(SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(0),
      "Type a dollar amount like 15, or a percent like 15%. Leave blank for none."));

  txnSheet.getRange(TXN_FIRST_ROW, TXN_EVENT_COL, txnRows, 1).setDataValidation(
    strict(SpreadsheetApp.newDataValidation()
      .requireValueInRange(eventsSheet.getRange(EVENTS_FIRST_ROW, 1, EVENTS_LAST_ROW - EVENTS_FIRST_ROW + 1, 1), true),
      "Pick an event from the list, or leave blank. New events are added on the Events tab first."));

  // Remove Linen Fee? and Comped? are the first two rare columns; Event (Q) has its own dropdown above.
  txnSheet.getRange(TXN_FIRST_ROW, TXN_RARE_COL, txnRows, 2).setDataValidation(
    strict(SpreadsheetApp.newDataValidation().requireValueInList(["Y", "N"], true), "Enter Y, or leave blank."));

  txnSheet.getRange(TXN_FIRST_ROW, TXN_RARE_COL + 3, txnRows, 1).setDataValidation(
    strict(SpreadsheetApp.newDataValidation().requireNumberGreaterThan(0),
      "Type a price above 0, or leave blank to use the price from the Services tab."));

  setAllServiceDropdowns_(txnSheet);

  // ---- Invoices: the period start every menu step depends on. A Friday; the onEdit guard fixes anything else. ----
  ss.getSheetByName(INVOICES_SHEET).getRange(PERIOD_START_CELL).setDataValidation(periodStartRule_());

  // ---- Settings: payout share must be a real percent (70, typed as a bare number, would be 7000%) ----
  ss.getRangeByName("PayoutPercent").setDataValidation(
    strict(SpreadsheetApp.newDataValidation().requireNumberBetween(0, 1),
      "Type a percent between 0% and 100%, like 60%. This is the share the practitioner keeps."));

  // ---- Practitioners ----
  const pracRows = PRAC_LAST_ROW - PRAC_FIRST_ROW + 1;
  pracSheet.getRange(PRAC_FIRST_ROW, 3, pracRows, 1).setDataValidation(
    strict(SpreadsheetApp.newDataValidation().requireNumberBetween(0, 1),
      "Type a percent between 0% and 100%, like 55%, or leave blank to use the Settings default."));
  // Active, Brings Own Linens and Type dropdowns: see applySetupDropdowns_ below (used rows only).

  // ---- Services: a price is a plain number; Category is a dropdown ----
  svcSheet.getRange(SERVICES_FIRST_ROW, 4, SERVICES_LAST_ROW - SERVICES_FIRST_ROW + 1, 1).setDataValidation(
    strict(SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(0),
      "Type the price as a number, like 120. Leave blank if the service isn't offered."));
  applySetupDropdowns_(ss);

  if (quiet === true) return;
  floraAlert_(
    "Every dropdown and input rule rebuilt: Transactions, Invoices period start, Settings payout %, Practitioners, and Services. " +
    "If one ever gets dragged onto the wrong row or deleted by accident, run this again; it only resets " +
    "the rules, never anything you've typed in.", "good");
}

// Dropdowns on the setup tabs go on the rows in use plus SETUP_SPARE_ROWS empty ones, not all the way
// down, so blank rows don't show dropdown arrows. onEdit adds them to a new row as soon as a name is typed.
const SETUP_SPARE_ROWS = 2;

function lastFilledRow_(sheet, firstRow, lastRow, cols) {
  const vals = sheet.getRange(firstRow, 1, lastRow - firstRow + 1, Math.max.apply(null, cols)).getValues();
  let last = firstRow - 1;
  vals.forEach(function (r, i) { if (cols.some(function (c) { return String(r[c - 1]).trim() !== ""; })) last = firstRow + i; });
  return last;
}

// only: a tab name to do just that tab (from onEdit); otherwise both.
function applySetupDropdowns_(ss, only) {
  const put = function (sheet, firstRow, lastRow, col, rule, upto) {
    if (upto >= firstRow) sheet.getRange(firstRow, col, upto - firstRow + 1, 1).setDataValidation(rule);
    if (upto < lastRow) sheet.getRange(Math.max(upto + 1, firstRow), col, lastRow - Math.max(upto + 1, firstRow) + 1, 1).clearDataValidations();
  };
  if (!only || only === PRACTITIONERS_SHEET) {
    const prac = ss.getSheetByName(PRACTITIONERS_SHEET);
    const upto = Math.min(PRAC_LAST_ROW, lastFilledRow_(prac, PRAC_FIRST_ROW, PRAC_LAST_ROW, [1]) + SETUP_SPARE_ROWS);
    const yn = SpreadsheetApp.newDataValidation().requireValueInList(["Y", "N"], true).setAllowInvalid(true).build();
    put(prac, PRAC_FIRST_ROW, PRAC_LAST_ROW, 2, yn, upto);   // Active
    put(prac, PRAC_FIRST_ROW, PRAC_LAST_ROW, 4, yn, upto);   // Brings Own Linens
    put(prac, PRAC_FIRST_ROW, PRAC_LAST_ROW, 6, SpreadsheetApp.newDataValidation()
      .requireValueInList(["Practitioner", "Contractor"], true).setAllowInvalid(true).build(), upto);  // Type
  }
  if (!only || only === SERVICES_SHEET) {
    const svc = ss.getSheetByName(SERVICES_SHEET);
    const upto = Math.min(SERVICES_LAST_ROW, lastFilledRow_(svc, SERVICES_FIRST_ROW, SERVICES_LAST_ROW, [1, 2]) + SETUP_SPARE_ROWS);
    put(svc, SERVICES_FIRST_ROW, SERVICES_LAST_ROW, 3, SpreadsheetApp.newDataValidation()
      .requireValueInRange(svc.getRange(SVC_TYPES_FIRST_ROW, SVC_TYPES_COL, SVC_TYPES_LAST_ROW - SVC_TYPES_FIRST_ROW + 1, 1), true)
      .setAllowInvalid(true).setHelpText("Pick a category from the Service Types box on the right. New category? Add it there first.").build(), upto);  // Category
  }
}

// All Transactions rows at once (500 of them): one read of Practitioners-to-Services, the Service column's
// rules cleared in one go, then a dropdown only on rows that have a practitioner.
function setAllServiceDropdowns_(txnSheet) {
  const n = TXN_LAST_ROW - TXN_FIRST_ROW + 1;
  const names = txnSheet.getRange(TXN_FIRST_ROW, 2, n, 1).getValues();
  const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SERVICES_SHEET).getDataRange().getValues();
  const byName = {};
  data.forEach(function (r) { if (r[0] && r[1]) (byName[r[0]] = byName[r[0]] || []).push(r[1]); });
  txnSheet.getRange(TXN_FIRST_ROW, 3, n, 1).clearDataValidations();
  names.forEach(function (r, i) {
    const list = byName[r[0]];
    if (!r[0] || !list) return;
    txnSheet.getRange(TXN_FIRST_ROW + i, 3).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(list, true).setAllowInvalid(false).build());
  });
}

function setServiceDropdownForRow(txnSheet, row) {
  const practitioner = txnSheet.getRange(row, 2).getValue();
  const serviceCell = txnSheet.getRange(row, 3);
  if (!practitioner) {
    serviceCell.clearDataValidations();
    return;
  }
  const svcSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SERVICES_SHEET);
  const data = svcSheet.getDataRange().getValues();
  const services = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === practitioner && data[i][1]) {
      services.push(data[i][1]);
    }
  }
  if (services.length === 0) {
    serviceCell.clearDataValidations();
    return;
  }
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(services, true)
    .setAllowInvalid(false)
    .build();
  serviceCell.setDataValidation(rule);
}


/**
 * Reads whatever was pasted onto the Square Import tab (header row at A4)
 * and appends matching bookings onto Transactions. Columns are matched by
 * HEADER NAME rather than position, so a Square format change doesn't
 * silently import the wrong field. Price is never taken from Square — it
 * always resolves from the Services tab, keeping your own rates canonical.
 */
function importFromSquare() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sq = ss.getSheetByName(SQUARE_SHEET);
  const txn = ss.getSheetByName(TXN_SHEET);
  const svc = ss.getSheetByName(SERVICES_SHEET);
  const ui = SpreadsheetApp.getUi();

  const data = sq.getRange(4, 1, Math.max(1, sq.getLastRow() - 3), 8).getValues();
  if (data.length < 2) {
    floraAlert_("Nothing to import. Paste a Square export onto the Square Import tab, header row starting at A4.", "warn");
    return;
  }

  const headers = data[0].map(function (h) { return String(h || "").trim().toLowerCase(); });
  const findCol = function (candidates) {
    for (let i = 0; i < headers.length; i++) {
      for (const cand of candidates) {
        if (headers[i] === cand || headers[i].indexOf(cand) !== -1) return i;
      }
    }
    return -1;
  };

  const dateCol = findCol(["date", "created at", "datetime", "time"]);
  const pracCol = findCol(["staff", "team member", "employee", "practitioner"]);
  const svcCol = findCol(["item", "service", "description"]);

  const missing = [];
  if (dateCol === -1) missing.push("Date");
  if (pracCol === -1) missing.push("Staff/Practitioner");
  if (svcCol === -1) missing.push("Item/Service");
  if (missing.length) {
    floraAlert_("Could not find these columns by header name: " + missing.join(", ") +
      ".\n\nHeaders found: " + headers.filter(String).join(", ") +
      "\n\nRename the header on the Square Import tab to match and run again.", "warn");
    return;
  }

  // Known (practitioner|service) pairs, so we only import what actually exists.
  const svcData = svc.getDataRange().getValues();
  const known = {};
  for (let i = 0; i < svcData.length; i++) {
    if (svcData[i][0] && svcData[i][1]) known[svcData[i][0] + "|" + svcData[i][1]] = true;
  }

  // First empty Transactions row.
  const txnData = txn.getRange(TXN_FIRST_ROW, 1, TXN_LAST_ROW - TXN_FIRST_ROW + 1, 2).getValues();
  let writeRow = TXN_FIRST_ROW;
  for (let i = 0; i < txnData.length; i++) {
    if (!txnData[i][1]) { writeRow = TXN_FIRST_ROW + i; break; }
    writeRow = TXN_FIRST_ROW + i + 1;
  }

  const toWrite = [];
  const unmatched = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[pracCol] && !row[svcCol]) continue;

    let d = row[dateCol];
    if (!(d instanceof Date)) {
      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) { unmatched.push("Row " + (i + 4) + ": unreadable date"); continue; }
      d = parsed;
    }
    d = startOfDay_(d);
    const prac = String(row[pracCol] || "").trim();
    const service = String(row[svcCol] || "").trim();

    if (!known[prac + "|" + service]) {
      unmatched.push("Row " + (i + 4) + ": \"" + prac + "\" / \"" + service + "\" not in Services");
      continue;
    }
    toWrite.push([d, prac, service, "", ""]);  // Client Name and Gratuity $ stay blank
  }

  if (writeRow + toWrite.length - 1 > TXN_LAST_ROW) {
    floraAlert_("Not enough room on Transactions (" + toWrite.length + " rows to add, " +
      (TXN_LAST_ROW - writeRow + 1) + " free). Run Flora · This Week > 2 · Make invoice PDFs and Start next week first.", "warn");
    return;
  }

  if (toWrite.length > 0) {
    txn.getRange(writeRow, 1, toWrite.length, TXN_INPUT_COLS).setValues(toWrite);
    txn.getRange(writeRow, 1, toWrite.length, 1).setNumberFormat("mm/dd/yyyy");
    for (let r = writeRow; r < writeRow + toWrite.length; r++) {
      setServiceDropdownForRow(txn, r);
    }
  }

  let msg = "Imported " + toWrite.length + " booking(s) onto Transactions.";
  if (unmatched.length) {
    msg += "\n\nSkipped " + unmatched.length + " row(s):\n" + unmatched.slice(0, 15).join("\n");
    if (unmatched.length > 15) msg += "\n…and " + (unmatched.length - 15) + " more.";
    msg += "\n\nAdd missing services to the Services tab (names must match Square exactly), then re-run.";
  }
  floraAlert_(msg, "info");
}

// confirmed: true after the Flora Yes button; "nobackup" if Yes was pressed to carry on without a backup.
function startNewWeek(confirmed) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const txnSheet = ss.getSheetByName(TXN_SHEET);
  const invoicesSheet = ss.getSheetByName(INVOICES_SHEET);
  const ui = SpreadsheetApp.getUi();

  const nRows = TXN_LAST_ROW - TXN_FIRST_ROW + 1;
  const data = txnSheet.getRange(TXN_FIRST_ROW, 1, nRows, TXN_INPUT_COLS).getValues();
  const rare = txnSheet.getRange(TXN_FIRST_ROW, TXN_RARE_COL, nRows, TXN_RARE_COLS).getValues();
  const calc = ss.getSheetByName(CALC_SHEET).getRange(TXN_FIRST_ROW, 1, nRows, 14).getValues();

  // Archiving under a blank or wrong period would file a whole week where it can't be found again.
  const range = getPeriodRange_(invoicesSheet, ui);
  if (!range) return;
  const periodStart = range.periodStart, periodEnd = range.periodEnd;
  const periodLabel = fmtDate(periodStart);
  const archivedOn = new Date();

  // One flat ledger row per booking. The calculated numbers are copied in as plain
  // values (frozen), so a later change to a price or fee never rewrites a past week.
  const ledgerRows = [];
  data.forEach(function (r, i) {
    if (!r[1]) return;
    const c = calc[i], q = rare[i];
    ledgerRows.push([
      periodStart, c[0] instanceof Date ? c[0] : r[0], r[1], r[2], r[3], q[2],
      c[3], c[4], c[5], c[9], c[10], c[6], c[7], c[11], c[13],
      q[0], q[1], q[3], archivedOn,
    ]);
  });

  if (ledgerRows.length === 0) {
    floraAlert_("Transactions is already empty — nothing to clear.", "warn");
    return;
  }

  // Not blockers, just things worth knowing before the sheet is cleared.
  const warnings = [];
  const folders = DriveApp.getFoldersByName("Invoices " + fmtDate(periodStart) + " to " + fmtDate(periodEnd));
  if (!folders.hasNext()) {
    warnings.push("- No invoice PDFs have been generated for this period.");
  } else if (!folders.next().getFilesByName("Review Summary - " + fmtDate(periodStart, "-") + ".pdf").hasNext()) {
    warnings.push("- No manager review summary has been generated.");
  }
  const logSheet = ss.getSheetByName(SEND_LOG_SHEET);
  const sentAny = logSheet && logSheet.getLastRow() > 1 && logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 5)
    .getValues().some(function (r) { return String(r[1]) === fmtDate(periodStart) && r[4] === "Sent"; });
  if (!sentAny) warnings.push("- Invoices haven't been emailed to practitioners from this sheet.");
  const tests = testBookingCount_(ss);
  if (tests) warnings.push("- " + tests + " TEST booking(s) would be archived with the real ones. Press No and run Clear test bookings to leave them out.");
  const already = archivedRowsForWeek_(ss, periodStart);
  if (already) warnings.push("- This week (" + periodLabel + ") is ALREADY in the Archive (" + already + " row(s)). Archiving it again would count it twice. " +
    "Press No and check the date in Invoices C4, unless you're sure.");
  const unpaid = unpaidOnChecklist_(ss, periodStart);
  if (unpaid.length) warnings.push("- " + unpaid.length + " payment(s) on the E-Transfers checklist aren't ticked Paid yet: " + unpaid.join(", ") + ".");
  const below = rowsBelowLimit_(txnSheet);
  if (below.length > 0) {
    warnings.push("- " + below.length + " entry(ies) are typed below row " + TXN_LAST_ROW +
      " on Transactions. They are not counted, and will NOT be archived or cleared.");
  }
  if (!confirmed) {
    floraConfirm_("Start next week", {
      tone: warnings.length ? "warn" : "info",
      headline: "Archive this week and start the next?",
      sub: ledgerRows.length + " booking(s) for the week starting " + periodLabel + " get filed in the Archive, and Transactions is cleared.",
      body: (warnings.length ? "Before you continue:\n" + warnings.join("\n") + "\n\n" : "Invoices, the manager summary and emails all look done for this week.\n\n") +
        "A backup copy of the whole sheet is saved first, in a Drive folder called \"" + SAFETY_FOLDER + "\"." +
        acct_(ss, "It goes in the Google Drive of"),
      yes: "Archive and start next week", no: "Not yet", action: "startNewWeek", danger: true
    });
    return;
  }

  // Per-practitioner totals for the period, computed the same way the invoices are.
  const historyRows = computePeriodResults_(ss, periodStart, periodEnd).results.map(function (res) {
    return [periodStart, periodEnd, res.name, res.txnCount, res.gratuityTotal,
      -res.facilityFeeTotal, -res.productFeeTotal, -res.linenTotal, res.eventFeesTotal,
      res.compedTotal, res.grossTotal, res.netAmount, archivedOn];
  });

  const ledger = getOrCreateArchiveSheet(ss);
  const history = getOrCreateHistorySheet(ss);
  // History pasted in from an older copy must line up with these columns, or new weeks would land in the wrong ones.
  const badTab = !logHeadersMatch_(ledger, ARCHIVE_HEADERS) ? ARCHIVE_SHEET
    : !logHeadersMatch_(history, HISTORY_HEADERS) ? HISTORY_SHEET : "";
  if (badTab) {
    floraAlert_("Nothing was archived or cleared.\n\nThe column headings in row " + LOG_HEADER_ROW + " of the " + badTab +
      " tab don't match what this version expects. Put the original headings back (or re-copy that tab from the latest version), then try again.", "warn");
    return;
  }
  // Last step before anything is written or cleared: save a backup, so a mistake can be undone.
  const backup = makeSafetyCopy_(ss, confirmed === "nobackup");
  if (!backup.proceed) return;

  const ledgerStart = nextLogRow_(ledger);
  const restyleRecords = function () { styleRecordsTabByName_(ledger); styleRecordsTabByName_(history); };
  ledger.getRange(ledgerStart, 1, ledgerRows.length, ARCHIVE_HEADERS.length).setValues(ledgerRows);
  ledger.getRange(ledgerStart, 1, ledgerRows.length, 2).setNumberFormat("mm/dd/yyyy");
  ledger.getRange(ledgerStart, 7, ledgerRows.length, 9).setNumberFormat(CURRENCY_FMT);
  ledger.getRange(ledgerStart, 19, ledgerRows.length, 1).setNumberFormat("mm/dd/yyyy hh:mm");

  if (historyRows.length > 0) {
    const histStart = nextLogRow_(history);
    history.getRange(histStart, 1, historyRows.length, HISTORY_HEADERS.length).setValues(historyRows);
    history.getRange(histStart, 1, historyRows.length, 2).setNumberFormat("mm/dd/yyyy");
    history.getRange(histStart, 5, historyRows.length, 8).setNumberFormat(CURRENCY_FMT);
    history.getRange(histStart, 13, historyRows.length, 1).setNumberFormat("mm/dd/yyyy hh:mm");
  }
  restyleRecords();  // the new rows get the records tabs' date and money formats

  txnSheet.getRange(TXN_FIRST_ROW, 1, nRows, TXN_INPUT_COLS).clearContent();
  txnSheet.getRange(TXN_FIRST_ROW, TXN_RARE_COL, nRows, TXN_RARE_COLS).clearContent();
  // Service dropdowns are per-row (each lists only that practitioner's services). Reset them
  // along with the contents so a cleared row doesn't keep last week's practitioner's list.
  txnSheet.getRange(TXN_FIRST_ROW, 3, nRows, 1).clearDataValidations();
  clearDateCheckNotes_(txnSheet.getRange(TXN_FIRST_ROW, 1, nRows, 1));
  resetETransferTab_(ss);

  // Clear the Square staging tab too, so last period's paste can't be re-imported.
  const sqSheet = ss.getSheetByName(SQUARE_SHEET);
  if (sqSheet && sqSheet.getLastRow() >= 4) {
    sqSheet.getRange(4, 1, sqSheet.getLastRow() - 3, 8).clearContent();
  }

  const nextStart = new Date(periodStart);
  nextStart.setDate(nextStart.getDate() + 7);
  invoicesSheet.getRange(PERIOD_START_CELL).setValue(nextStart);
  rememberPeriodStart_(nextStart);

  floraAlert_(
    "Archived " + ledgerRows.length + " row(s) to Archive and " + historyRows.length +
    " practitioner total(s) to Payout History, cleared Transactions. New period starts " + fmtDate(nextStart) + "." +
    (backup.name ? "\n\nBackup saved in Drive, folder \"" + SAFETY_FOLDER + "\": " + backup.name : "\n\nNo backup copy was made."), "good");
}

// Archive = flat ledger: one row per booking, a Period Start on every row, no divider rows,
// so it can be filtered, sorted and totalled. Calculated numbers are frozen values.
const ARCHIVE_HEADERS = [
  "Period Start", "Date of Service", "Practitioner", "Service", "Client Name", "Event",
  "Price", "Product Fee", "Linen Fee", "Gratuity", "Facility Fee", "Travel Fee", "Event Service Fee",
  "Net to Practitioner", "Comped Value", "Remove Linen Fee?", "Comped?", "Custom Price", "Archived On",
];
const HISTORY_SHEET = "Payout History";
const HISTORY_HEADERS = [
  "Period Start", "Period End", "Practitioner", "Transactions", "Gratuity", "Facility Fee",
  "Product Fees", "Linen Fees", "Event Fees", "Comped", "Gross Revenue", "Net Amount", "Archived On",
];

// Archive and Payout History keep their filter buttons and totals in rows 1-3, with the
// header on row 4 and data from row 5 down.
const LOG_HEADER_ROW = 4;

// First empty row below the data, judged by column A only.
function logHeadersMatch_(sheet, headers) {
  const found = sheet.getRange(LOG_HEADER_ROW, 1, 1, headers.length).getValues()[0];
  return headers.every(function (h, i) { return String(found[i]).trim() === h; });
}

function nextLogRow_(sheet) {
  const colA = sheet.getRange(1, 1, sheet.getMaxRows(), 1).getValues();
  let last = LOG_HEADER_ROW;
  for (let i = colA.length - 1; i >= LOG_HEADER_ROW; i--) {
    if (colA[i][0] !== "") { last = i + 1; break; }
  }
  return last + 1;
}

function getOrCreateArchiveSheet(ss) {
  return getOrCreateLogSheet_(ss, ARCHIVE_SHEET, ARCHIVE_HEADERS);
}

function getOrCreateHistorySheet(ss) {
  return getOrCreateLogSheet_(ss, HISTORY_SHEET, HISTORY_HEADERS);
}

function getOrCreateLogSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  sheet = createLogSheet_(ss, name, headers);
  styleRecordsTabByName_(sheet);
  return sheet;
}

function createLogSheet_(ss, name, headers) {
  let sheet;
  // Fallback only. The filter buttons (slicers) can't be created from a script, so a
  // re-created tab gets the header and a header-row filter but no buttons on top.
  sheet = ss.insertSheet(name);
  const header = sheet.getRange(LOG_HEADER_ROW, 1, 1, headers.length);
  header.setValues([headers]).setBackground(COLOR_PRIMARY).setFontColor("#ffffff")
    .setFontWeight("bold").setWrap(true).setVerticalAlignment("middle");
  sheet.setFrozenRows(LOG_HEADER_ROW);
  sheet.setRowHeight(LOG_HEADER_ROW, 34);
  sheet.setTabColor(COLOR_PRIMARY);
  sheet.setColumnWidths(1, headers.length, 105);
  sheet.getRange(LOG_HEADER_ROW, 1, sheet.getMaxRows() - LOG_HEADER_ROW + 1, headers.length).createFilter();
  return sheet;
}

// quiet: no closing message (used by the one-time capacity step).
function protectCalculations(quiet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tag = "Payout Tools - Calculations sheet";

  const calcSheet = ss.getSheetByName(CALC_SHEET);
  calcSheet.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function (p) {
    if (p.getDescription() === tag) p.remove();
  });
  const calcProtection = calcSheet.protect().setDescription(tag);
  calcProtection.setWarningOnly(false);
  if (calcProtection.canDomainEdit()) calcProtection.setDomainEdit(false);
  if (!calcSheet.isSheetHidden()) calcSheet.hideSheet();

  // The Calculations sheet being locked doesn't stop anyone from typing over the
  // grey mirror columns people actually look at day to day — protect those too,
  // leaving only the real input columns editable.
  protectRangeExcept(ss.getSheetByName(TXN_SHEET), "Payout Tools - Transactions formulas",
    ["A5:E" + TXN_LAST_ROW, "O5:R" + TXN_LAST_ROW]);
  protectRangeExcept(ss.getSheetByName(SERVICES_SHEET), "Payout Tools - Services auto fee",
    ["A5:D" + SERVICES_LAST_ROW]);
  // Events' Travel/Convenience/Gratuity cells are deliberately left unprotected — typing
  // over one is how you override a default for that event, not a mistake to prevent.

  if (quiet === true) return;
  floraAlert_(
    "Calculations sheet locked and hidden. Formula columns on Transactions and Services " +
    "are locked too, so only the cells you type in stay editable.", "good");
}

// Protects a whole sheet, then re-opens the given A1 ranges as editable. An empty
// exceptRanges list just protects the sheet's formula cells outright (e.g. Events,
// where the untouched columns are typed-in event rows, not a fixed input block).
function protectRangeExcept(sheet, tag, exceptRanges) {
  if (!sheet) return;
  sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function (p) {
    if (p.getDescription() === tag) p.remove();
  });
  const protection = sheet.protect().setDescription(tag);
  protection.setWarningOnly(false);
  if (protection.canDomainEdit()) protection.setDomainEdit(false);
  if (exceptRanges.length > 0) {
    const ranges = exceptRanges.map(function (a1) { return sheet.getRange(a1); });
    protection.setUnprotectedRanges(ranges);
  }
}

// ui.alert text can't be selected or clicked, so results that carry a link use this dialog instead.
function showResultDialog_(title, text, links) {
  // Same message as before, now with the Flora look: the title is the big green headline.
  return floraDialog_(title, { tone: "good", headline: title, body: text, links: links });
}

function htmlEsc_(v) {
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function showScriptVersion() {
  floraAlert_("Flora Payouts script version " + SCRIPT_VERSION +
    "\n\nIf this isn't the version listed under What's New on the Start here tab, " +
    "your copy is out of date. Let the developer know.", "info");
}

// Emails are sent from, and PDFs and backups are saved to, whichever Google account is signed in.
// Signing in to the wrong one is easy to do, so name the account wherever it changes the outcome.
function signedInAs_(ss) {
  let me = "", owner = "";
  try { me = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || ""; } catch (e) { me = ""; }
  try { const o = ss.getOwner(); owner = o ? o.getEmail() : ""; } catch (e) { owner = ""; }
  return { me: me, owner: owner };
}

function acct_(ss, lead) {
  const w = signedInAs_(ss);
  if (!w.me) return "";
  const notOwner = w.owner && w.owner.toLowerCase() !== w.me.toLowerCase();
  return "\n\n" + lead + " " + w.me + (notOwner ? " (not this sheet's owner, " + w.owner + ")" : "") +
    ". If that's the wrong Google account, stop and switch accounts first (click your picture at the top right of Google).";
}

// Saves a copy of the whole sheet (formulas, script and all) before Start New Week clears anything.
// Returns {proceed, name}. If the copy can't be made, asks whether to carry on without one.
// withoutOk: the Flora "carry on without a backup" button was already pressed for this run.
function makeSafetyCopy_(ss, withoutOk) {
  try {
    const folder = getOrCreateFolder(SAFETY_FOLDER);
    const name = ss.getName() + " - safety copy " + Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd HH.mm");
    DriveApp.getFileById(ss.getId()).makeCopy(name, folder);
    const copies = [];
    const it = folder.getFiles();
    while (it.hasNext()) {
      const f = it.next();
      if (f.getName().indexOf("safety copy") !== -1) copies.push(f);
    }
    copies.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
    copies.slice(SAFETY_KEEP).forEach(function (f) { f.setTrashed(true); });
    return { proceed: true, name: name };
  } catch (e) {
    if (withoutOk) return { proceed: true, name: "" };
    floraConfirm_("Start next week", {
      tone: "bad", headline: "Couldn't make a backup copy",
      sub: "Nothing has been archived or cleared yet.",
      body: "Google wouldn't let this sheet save a backup copy (" + String(e.message).slice(0, 150) + ").\n\nCarry on with Start next week WITHOUT a backup?",
      yes: "Carry on without a backup", no: "Stop here", action: "startNewWeekNoBackup", danger: true
    });
    return { proceed: false, name: "" };
  }
}

/**
 * One button that checks the whole workbook and says, in plain words, what looks right and what
 * doesn't. The report at the bottom holds counts, row numbers and setting checks only, so it can be
 * copied to the developer for help without sharing bookings or dollar amounts.
 */
function healthCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  showHealthDialog_(ss, collectHealthItems_(ss, {}));
}

// The checks behind the Health Check, as a list of {level: "fix"|"warn"|"ok", text}. The panel calls
// this too, with keepLastError so only the real Health Check clears the last-crash note, and with
// a stats object it fills with this week's booking and practitioner counts.
function collectHealthItems_(ss, opts) {
  opts = opts || {};
  const items = [];
  const add = function (level, text, topic) { items.push({ level: level, text: text, topic: topic || "" }); };
  const check = function (what, fn) {
    try { fn(); } catch (e) {
      add("fix", "Couldn't check " + what + " (" + String(e && e.message).slice(0, 120) + "). Something it depends on is probably missing or renamed.");
    }
  };
  const rowsText = function (rows) {
    return "row" + (rows.length === 1 ? " " : "s ") + rows.slice(0, 10).join(", ") + (rows.length > 10 ? ", ..." : "");
  };
  const norm = function (v) { return String(v).trim().toLowerCase(); };
  const n = TXN_LAST_ROW - TXN_FIRST_ROW + 1;

  add("ok", "Script version " + SCRIPT_VERSION + ".");

  check("which Google account you're signed in to", function () {
    const w = signedInAs_(ss);
    if (!w.me) {
      add("warn", "Couldn't tell which Google account you're signed in to. Emails and Drive files use that account, so check your picture at the top right of Google.", "account");
    } else if (w.owner && w.owner.toLowerCase() !== w.me.toLowerCase()) {
      add("warn", "You're signed in as " + w.me + ", but this sheet belongs to " + w.owner + ". Emails go out from, and PDFs are saved to, the account you're signed in as. If that's not the one you meant, click your picture at the top right of Google and switch.", "account");
    } else {
      add("ok", "Signed in as " + w.me + ", the owner of this sheet. Emails and Drive files will use this account.", "account");
    }
  });

  // Tabs and named settings: if these are gone, nothing else can be checked.
  const tabs = [TXN_SHEET, CALC_SHEET, SERVICES_SHEET, PRACTITIONERS_SHEET, INVOICES_SHEET, EVENTS_SHEET, "Settings"];
  const missingTabs = tabs.filter(function (t) { return !ss.getSheetByName(t); });
  const names = ["BusinessName", "BusinessAddress", "PayoutPercent", "LinenFee", "ManagerEmail"];
  const missingNames = names.filter(function (t) { return !ss.getRangeByName(t); });
  if (missingTabs.length) {
    add("fix", "Missing tab(s): " + missingTabs.join(", ") + ". A tab was renamed or deleted. Rename it back, or use File > Version history to restore an earlier version.");
  }
  if (missingNames.length) {
    add("fix", "These named settings are missing: " + missingNames.join(", ") + ". Their cell was probably deleted. Use Edit > Undo or File > Version history, or ask the developer.");
  }
  if (missingTabs.length || missingNames.length) return items;
  add("ok", "All tabs and named settings are present.");

  const txnSheet = ss.getSheetByName(TXN_SHEET), calcSheet = ss.getSheetByName(CALC_SHEET);
  const invSheet = ss.getSheetByName(INVOICES_SHEET), pracSheet = ss.getSheetByName(PRACTITIONERS_SHEET);
  const svcSheet = ss.getSheetByName(SERVICES_SHEET), evSheet = ss.getSheetByName(EVENTS_SHEET);
  const tz = ss.getSpreadsheetTimeZone();

  let periodStart = null;
  check("the invoice period start", function () {
    const v = invSheet.getRange(PERIOD_START_CELL).getValue();
    if (!(v instanceof Date)) {
      add("fix", "Invoices cell " + PERIOD_START_CELL + " (Invoice Period Start) isn't a valid date. Type a Friday as month/day/year, like 11/27/2026.");
    } else if (Utilities.formatDate(v, tz, "u") !== "5") {
      periodStart = v;
      add("warn", "Invoices cell " + PERIOD_START_CELL + " is a " + Utilities.formatDate(v, tz, "EEEE") + ", not a Friday. Every week would be shifted.");
    } else {
      periodStart = v;
      add("ok", "Period start (" + fmtDate(v) + ") is a Friday.");
    }
  });

  check("the manager email", function () {
    const e = String(ss.getRangeByName("ManagerEmail").getValue()).trim();
    const where = managerEmailWhere_(ss);
    if (!e) add("warn", "No Manager Email on " + where + ", so the review summary can't be emailed.");
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) add("warn", "The Manager Email on " + where + " doesn't look like an email address.");
    if (where !== "the Settings tab") add("warn", "The Manager Email is still on " + where + " because Settings had no empty row for it. Free up a row under the settings on the Settings tab and reload the sheet; it moves by itself.");
    else add("ok", "Manager email is set.");
  });

  check("Settings", function () {
    const p = ss.getRangeByName("PayoutPercent").getValue();
    if (typeof p !== "number" || p <= 0 || p > 1) add("fix", "Payout % on Settings isn't a percent between 0% and 100%. Type it like 60%.");
    else add("ok", "Payout % on Settings is a valid percent.");
    const lf = ss.getRangeByName("LinenFee").getValue();
    if (typeof lf !== "number" || lf < 0) add("fix", "Linen Fee on Settings isn't a dollar amount.");
    const bad = [];
    pracSheet.getRange(PRAC_FIRST_ROW, 3, PRAC_LAST_ROW - PRAC_FIRST_ROW + 1, 1).getValues().forEach(function (r, i) {
      if (r[0] !== "" && (typeof r[0] !== "number" || r[0] < 0 || r[0] > 1)) bad.push(PRAC_FIRST_ROW + i);
    });
    if (bad.length) add("fix", "Payout % Override on Practitioners isn't a percent between 0% and 100% (" + rowsText(bad) + ").");
  });

  check("time zones", function () {
    const scriptTz = Session.getScriptTimeZone();
    if (tz !== scriptTz) {
      add("fix", "The sheet's time zone (" + tz + ") and the script's (" + scriptTz + ") differ, so dates can land a day off. Ask the developer to fix this.");
    } else if (tz !== EXPECTED_TIME_ZONE) {
      add("warn", "The sheet's time zone is " + tz + ", not " + EXPECTED_TIME_ZONE + ". Booking dates stay correct, but the \"Archived On\" times will be off. Change it under File > Settings > Time zone.");
    } else {
      add("ok", "Time zone is " + tz + ".");
    }
  });

  check("for double entries", function () {
    const rows = txnSheet.getRange(TXN_FIRST_ROW, 1, n, TXN_INPUT_COLS).getValues();
    const dups = findDuplicateBookings_(rows, TXN_FIRST_ROW);
    if (dups.length) add("warn", dups.length + " booking(s) look entered twice on Transactions (same date, practitioner, service and client): " +
      dups.map(function (g) { return "rows " + g.join(" and "); }).join("; ") + ". If one is a mistake, delete it; if both are real, ignore this.");
  });

  check("this week's bookings", function () {
    const computed = periodStart ? computePeriodResults_(ss, periodStart, new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate() + 6)) : null;
    const used = calcSheet.getRange(TXN_FIRST_ROW, 2, n, 1).getValues().filter(function (r) { return r[0] !== ""; }).length;
    if (!computed) {
      add("ok", used + " of " + n + " rows on Transactions are in use.");
      return;
    }
    const total = computed.results.reduce(function (sum, r) { return sum + r.txnCount; }, 0);
    if (opts.stats) { opts.stats.bookings = total; opts.stats.practitioners = computed.results.length; }
    add("ok", total + " booking(s) across" + computed.results.length + " practitioner(s) fall in this pay period.");
    if (computed.skipped.length) add("fix", computed.skipped.length + " booking row(s) won't make it onto invoices (" + rowsText(computed.skipped.map(function (x) { return x.row; })) + "). Run Flora · This Week > 1 · Check this week's totals to see why each one is left out.");
    if (computed.overflow.length) add("fix", computed.overflow.length + " entry(ies) are typed below row " + TXN_LAST_ROW + " on Transactions (" + rowsText(computed.overflow) + "). Only rows " + TXN_FIRST_ROW + " to " + TXN_LAST_ROW + " are counted.");
    if (computed.mismatches.length) add("fix", "The Net on Transactions and the invoice math disagree for " + computed.mismatches.length + " practitioner(s). Look for a typed-over or error cell.");
    if (computed.outOfPeriod > 0) add("warn", computed.outOfPeriod + " row(s) are dated outside this pay period. Check the dates, or they belong to another week.");
    if (computed.noClient.length) add("warn", computed.noClient.length + " booking(s) have no Client Name (" + rowsText(computed.noClient) + "). The review summary needs one.");
    if (computed.txnRowsUsed >= n * 0.9) add("warn", "Transactions is nearly full (" + computed.txnRowsUsed + " of " + n + " rows).");
    else add("ok", computed.txnRowsUsed + " of " + n + " Transactions rows are in use.");
  });

  check("the calculations", function () {
    const vals = calcSheet.getRange(TXN_FIRST_ROW, 1, n, 14).getValues();
    const errRows = [], noPrice = [];
    vals.forEach(function (r, i) {
      if (r.some(function (v) { return typeof v === "string" && /^#(REF!|VALUE!|N\/A|NAME\?|DIV\/0!|NUM!|NULL!|ERROR!)/.test(v); })) errRows.push(TXN_FIRST_ROW + i);
      if (typeof r[12] === "string" && r[12].indexOf("No price") !== -1) noPrice.push(TXN_FIRST_ROW + i);
    });
    if (errRows.length) add("fix", "Error values on the hidden Calculations tab (" + rowsText(errRows) + "). A row or column was probably deleted. Use Edit > Undo, or ask the developer.");
    else add("ok", "No error values in the calculations.");
    if (noPrice.length) add("warn", noPrice.length + " booking(s) use a service with no price on the Services tab (" + rowsText(noPrice) + ").");

    const gone = function (range) {
      return range.getFormulas().reduce(function (sum, row) {
        return sum + row.filter(function (f) { return f === ""; }).length;
      }, 0);
    };
    const typedOver = gone(calcSheet.getRange(TXN_FIRST_ROW, 1, n, 14)) + gone(txnSheet.getRange(TXN_FIRST_ROW, 6, n, 9));
    if (typedOver) add("fix", typedOver + " formula cell(s) were typed over or deleted (Transactions columns F to N, or the Calculations tab). Use Edit > Undo, or ask the developer.");
    else add("ok", "All formula cells are intact.");
  });

  check("input rules", function () {
    const probes = [
      [txnSheet, "A5", "Transactions Date"], [txnSheet, "A" + TXN_LAST_ROW, "Transactions Date"],
      [txnSheet, "B5", "Transactions Practitioner"], [txnSheet, "B" + TXN_LAST_ROW, "Transactions Practitioner"],
      [txnSheet, "E5", "Transactions Gratuity"], [txnSheet, "O5", "Transactions Remove Linen"],
      [txnSheet, "P5", "Transactions Comped"], [txnSheet, "Q5", "Transactions Event"], [txnSheet, "R5", "Transactions Custom Price"],
      [invSheet, PERIOD_START_CELL, "Invoices Period Start"],
      [pracSheet, "C" + PRAC_FIRST_ROW, "Practitioners Payout % Override"],
      [svcSheet, "D" + SERVICES_FIRST_ROW, "Services Price"],
      [ss.getRangeByName("PayoutPercent").getSheet(), ss.getRangeByName("PayoutPercent").getA1Notation(), "Settings Payout %"],
    ];
    const missing = [];
    probes.forEach(function (p) {
      if (!p[0].getRange(p[1]).getDataValidation() && missing.indexOf(p[2]) === -1) missing.push(p[2]);
    });
    if (missing.length) add("fix", "Input rules are missing on: " + missing.join(", ") + ". Run Flora · Tools > Refresh sheet logic to put them back.");
    else add("ok", "Input rules (dropdowns and date/number checks) are in place.");
  });

  check("locks", function () {
    const tagged = function (sheet, tag) {
      return sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET).some(function (p) { return p.getDescription() === tag; });
    };
    const off = [];
    if (!tagged(calcSheet, "Payout Tools - Calculations sheet")) off.push("Calculations");
    if (!tagged(txnSheet, "Payout Tools - Transactions formulas")) off.push("Transactions formulas");
    if (!tagged(svcSheet, "Payout Tools - Services auto fee")) off.push("Services formulas");
    if (off.length) add("warn", "The formula locks are off for: " + off.join(", ") + ". Run Flora · Tools > Protect calculations so nobody types over a formula.");
    else add("ok", "Formula locks are on.");
    if (!calcSheet.isSheetHidden()) add("warn", "The Calculations tab is visible. It's meant to stay hidden (Flora · Tools > Protect calculations hides it).");
  });

  check("Archive and Payout History", function () {
    const bad = [];
    [[ARCHIVE_SHEET, ARCHIVE_HEADERS], [HISTORY_SHEET, HISTORY_HEADERS]].forEach(function (p) {
      const sh = ss.getSheetByName(p[0]);
      if (sh && !logHeadersMatch_(sh, p[1])) bad.push(p[0]);
    });
    if (bad.length) add("fix", "The column headings (row " + LOG_HEADER_ROW + ") on " + bad.join(" and ") + " were changed. Start next week will refuse to run until they match again.");
    else add("ok", "Archive and Payout History headings are correct.");
  });

  check("Practitioners, Services and Events", function () {
    const prac = pracSheet.getRange(PRAC_FIRST_ROW, 1, PRAC_LAST_ROW - PRAC_FIRST_ROW + 1, 5).getValues();
    const seen = {}, dupP = [], spaced = [], noEmail = [];
    prac.forEach(function (r, i) {
      if (!r[0]) return;
      const row = PRAC_FIRST_ROW + i, k = norm(r[0]);
      if (seen[k]) dupP.push(row); else seen[k] = true;
      if (String(r[0]) !== String(r[0]).trim()) spaced.push(row);
      if (isYes_(r[1]) && !String(r[4]).trim()) noEmail.push(row);
    });
    if (dupP.length) add("fix", "The same practitioner is listed twice on the Practitioners tab (" + rowsText(dupP) + ").");
    if (spaced.length) add("warn", "A practitioner name has a stray space at the start or end (" + rowsText(spaced) + "), which can stop bookings matching.");
    if (noEmail.length) add("warn", noEmail.length + " active practitioner(s) have no email (" + rowsText(noEmail) + "), so invoices can't be sent to them.");
    if (!dupP.length && !spaced.length) add("ok", "Practitioner names look clean.");

    const svc = svcSheet.getRange(SERVICES_FIRST_ROW, 1, SERVICES_LAST_ROW - SERVICES_FIRST_ROW + 1, 2).getValues();
    const seenS = {}, dupS = [], orphan = [];
    svc.forEach(function (r, i) {
      if (!r[0] || !r[1]) return;
      const row = SERVICES_FIRST_ROW + i, k = norm(r[0]) + "|" + norm(r[1]);
      if (seenS[k]) dupS.push(row); else seenS[k] = true;
      if (!seen[norm(r[0])]) orphan.push(row);
    });
    if (dupS.length) add("fix", "The same practitioner and service appear twice on the Services tab (" + rowsText(dupS) + "). The price would be added up twice.");
    else add("ok", "No duplicate services.");
    if (orphan.length) add("warn", orphan.length + " service row(s) belong to a name that isn't on the Practitioners tab (" + rowsText(orphan) + ").");

    const ev = evSheet.getRange(EVENTS_FIRST_ROW, 1, EVENTS_LAST_ROW - EVENTS_FIRST_ROW + 1, 1).getValues();
    const seenE = {}, dupE = [];
    ev.forEach(function (r, i) {
      if (!r[0]) return;
      const k = norm(r[0]);
      if (seenE[k]) dupE.push(EVENTS_FIRST_ROW + i); else seenE[k] = true;
    });
    if (dupE.length) add("warn", "The same event name appears twice on the Events tab (" + rowsText(dupE) + "). Only the first is used.");
  });

  check("email allowance", function () {
    const left = MailApp.getRemainingDailyQuota();
    add(left < 20 ? "warn" : "ok", "Google will let this account send " + left + " more email(s) today.");
  });

  check("the last recorded error", function () {
    const props = PropertiesService.getDocumentProperties();
    const raw = props.getProperty(LAST_ERROR_KEY);
    if (!raw) { add("ok", "No crashes recorded."); return; }
    const e = JSON.parse(raw);
    add("warn", "The last crash was in \"" + e.step + "\" on " + Utilities.formatDate(new Date(e.at), tz, "MMM d, h:mm a") + ": " + e.message +
      (opts.keepLastError ? "" : " (This note clears after this check.)"));
    if (!opts.keepLastError) props.deleteProperty(LAST_ERROR_KEY);
  });

  return items;
}

function showHealthDialog_(ss, items) {
  const fixes = items.filter(function (i) { return i.level === "fix"; });
  const warns = items.filter(function (i) { return i.level === "warn"; });
  const oks = items.filter(function (i) { return i.level === "ok"; });
  const summary = fixes.length ? fixes.length + " thing(s) need fixing" + (warns.length ? " and " + warns.length + " heads-up(s)" : "")
    : warns.length ? "Nothing is broken. " + warns.length + " heads-up(s) to read." : "Everything looks healthy.";
  const tone = fixes.length ? { bg: "#FBE3E1", fg: "#9B2C22" } : warns.length ? { bg: "#FFF3D6", fg: "#6A4A00" } : { bg: "#E7F2EC", fg: "#2F6B4F" };
  const tags = { fix: "FIX", warn: "HEADS UP", ok: "OK" };

  const stamp = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd HH:mm");
  const report = "Flora health check, " + stamp + "\n" + summary + "\n\n" +
    fixes.concat(warns, oks).map(function (i) { return "[" + tags[i.level] + "] " + i.text; }).join("\n");

  const card = function (i, bg, fg) {
    return '<div style="background:' + bg + ';border-radius:10px;padding:9px 12px;margin:0 0 6px;color:#2E2A2C">' +
      '<b style="color:' + fg + '">' + tags[i.level] + '</b>&nbsp; ' + htmlEsc_(i.text) + '</div>';
  };
  const section = function (label, list, bg, fg) {
    return list.length ? '<div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:' + fg + ';margin:12px 0 6px">' + label + ' (' + list.length + ')</div>' +
      list.map(function (i) { return card(i, bg, fg); }).join("") : "";
  };
  const html = HtmlService.createHtmlOutput(
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">' +
    '<style>body{margin:0;font:14px/1.5 "DM Sans",Arial,sans-serif;color:#2E2A2C}summary{cursor:pointer;font-weight:700;color:#2F6B4F;margin:12px 0 6px}' +
    'button{min-height:44px;padding:0 18px;border-radius:10px;font:inherit;font-weight:700;cursor:pointer}' +
    '.copy{border:none;background:#A13D63;color:#fff}.close{border:1px solid #D9CFC7;background:#fff}textarea{width:100%;box-sizing:border-box;height:90px;font:12px/1.4 "DM Sans",Arial,sans-serif;border:1px solid #EFE6EA;border-radius:8px;padding:6px}</style>' +
    '<div style="background:' + tone.bg + ';border-radius:14px;padding:14px 16px;margin-bottom:4px">' +
    '<div style="font-size:19px;font-weight:700;color:' + tone.fg + '">' + htmlEsc_(summary) + '</div>' +
    '<div style="font-size:12.5px;color:#5E565A">Checked ' + htmlEsc_(stamp) + '</div></div>' +
    section("TO FIX", fixes, "#FBE3E1", "#9B2C22") +
    section("HEADS-UP", warns, "#FFF3D6", "#6A4A00") +
    (oks.length ? '<details><summary>All good (' + oks.length + ')</summary>' + oks.map(function (i) { return card(i, "#E7F2EC", "#2F6B4F"); }).join("") + '</details>' : "") +
    '<p style="margin:14px 0 6px;font-size:13px">To ask the developer for help, copy this report and send it to them. It lists what looks right or wrong, not your bookings or dollar amounts.</p>' +
    '<textarea id="r" readonly>' + htmlEsc_(report) + '</textarea>' +
    '<p style="display:flex;gap:8px"><button class="copy" onclick="var t=document.getElementById(\'r\');t.select();document.execCommand(\'copy\');this.textContent=\'Copied\'">Copy report</button>' +
    '<button class="close" onclick="google.script.host.close()">Close</button></p>'
  ).setWidth(580).setHeight(Math.min(640, 300 + (fixes.length + warns.length) * 52));
  SpreadsheetApp.getUi().showModalDialog(html, "Health Check");
}

// Date-only comparisons: a booking stamped 2:30pm on the last day still belongs to the period.
function startOfDay_(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0); }
function endOfDay_(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999); }

// Matches the sheet formulas, which only treat a Y (any case) as yes.
function isYes_(v) { return String(v).trim().toUpperCase() === "Y"; }

// File names in a week's folder that are invoices for someone NOT in this run. Pure, so it can be tested.
// Returns [{ file, name }]. Only "<name> - Invoice - <MM-dd-yyyy>.pdf" for this week counts; summaries etc. are ignored.
function staleInvoiceFiles_(fileNames, currentNames, periodKey) {
  const suffix = " - Invoice - " + periodKey + ".pdf";
  const keep = {};
  currentNames.forEach(function (n) { keep[n + suffix] = true; });
  const seen = {};
  return fileNames.filter(function (f) {
    if (f.length <= suffix.length || f.slice(-suffix.length) !== suffix || keep[f] || seen[f]) return false;
    seen[f] = true;
    return true;
  }).map(function (f) { return { file: f, name: f.slice(0, -suffix.length) }; });
}

function trashFilesNamed_(folder, name) {
  const files = folder.getFilesByName(name);
  let found = false;
  while (files.hasNext()) { files.next().setTrashed(true); found = true; }
  return found;
}

// If an older duplicate is ever lying around, use the most recently saved one.
function newestFileNamed_(folder, name) {
  const files = folder.getFilesByName(name);
  let best = null;
  while (files.hasNext()) {
    const f = files.next();
    if (!best || f.getLastUpdated() > best.getLastUpdated()) best = f;
  }
  return best;
}

function getSendLog_(ss) {
  let sh = ss.getSheetByName(SEND_LOG_SHEET);
  if (sh) return sh;
  sh = createSendLog_(ss);
  styleRecordsTabByName_(sh);
  return sh;
}

function createSendLog_(ss) {
  let sh;
  sh = ss.insertSheet(SEND_LOG_SHEET);
  sh.getRange(1, 1, 1, 5).setValues([["Sent On", "Period Start", "Practitioner", "Email", "Status"]])
    .setFontWeight("bold").setFontSize(12).setBackground(COLOR_PRIMARY_LIGHT);
  sh.getRange("B:B").setNumberFormat("@");
  sh.getRange("A:A").setNumberFormat("mm/dd/yyyy hh:mm");
  sh.setFrozenRows(1);
  sh.setColumnWidths(1, 5, 170);
  sh.setColumnWidth(4, 260);
  return sh;
}

/**
 * Reads the invoice period start from Invoices!C4 and returns {periodStart, periodEnd}
 * (start + 6 days), or null (after alerting) if C4 isn't a valid date. Asks first if it isn't
 * a Friday, because every week would then be shifted.
 */
function getPeriodRange_(invoicesSheet, ui) {
  const periodStart = invoicesSheet.getRange(PERIOD_START_CELL).getValue();
  if (!(periodStart instanceof Date)) {
    floraAlert_("The Invoice Period Start isn't a valid date.\n\nGo to the INVOICES tab, click cell " + PERIOD_START_CELL +
      ", and type a Friday as month/day/year, like 11/27/2026. (Or double-click the cell and pick it from the calendar.)", "warn");
    return null;
  }
  const tz = invoicesSheet.getParent().getSpreadsheetTimeZone();
  if (Utilities.formatDate(periodStart, tz, "u") !== "5") {
    floraAlert_("The period start isn't a Friday.\n\nCell " + PERIOD_START_CELL + " on Invoices (" + fmtDate(periodStart) + ") is a " +
      Utilities.formatDate(periodStart, tz, "EEEE") + ". Pay weeks run Friday to Thursday. Type any date in the week into " +
      PERIOD_START_CELL + " and it moves to its Friday by itself, then run this again.", "warn");
    return null;
  }
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 6);
  return { periodStart: periodStart, periodEnd: periodEnd };
}

/**
 * Computes each active practitioner's totals and line items for a period.
 * Shared by Preview, Generate and the review summary so they always agree on the numbers.
 */
function computePeriodResults_(ss, periodStart, periodEnd) {
  periodStart = startOfDay_(periodStart);
  periodEnd = endOfDay_(periodEnd);
  const calcSheet = ss.getSheetByName(CALC_SHEET);
  const pracSheet = ss.getSheetByName(PRACTITIONERS_SHEET);
  const txnSheet = ss.getSheetByName(TXN_SHEET);

  const payoutPercentDefault = ss.getRangeByName("PayoutPercent").getValue();

  const pracData = pracSheet.getRange(PRAC_FIRST_ROW, 1, PRAC_LAST_ROW - PRAC_FIRST_ROW + 1, 5).getValues();
  const practitioners = pracData
    .filter(function (r) { return r[0] && String(r[1]).toUpperCase() === "Y"; })
    .map(function (r) { return { name: r[0], payoutOverride: r[2] }; });

  const calcData = calcSheet.getRange(TXN_FIRST_ROW, 1, TXN_LAST_ROW - TXN_FIRST_ROW + 1, 14).getValues();
  const eventCol = txnSheet.getRange(TXN_FIRST_ROW, TXN_EVENT_COL, TXN_LAST_ROW - TXN_FIRST_ROW + 1, 1).getValues();
  const clientCol = txnSheet.getRange(TXN_FIRST_ROW, 4, TXN_LAST_ROW - TXN_FIRST_ROW + 1, 1).getValues();
  // zip the event name onto each Calculations row by position — both ranges cover
  // the same TXN_FIRST_ROW..TXN_LAST_ROW rows, so index i means the same row in both.
  const combined = calcData.map(function (r, i) { return r.concat([eventCol[i][0]]); });

  const anyInRange = calcData.some(function (r) {
    return r[1] && r[0] instanceof Date && r[0] >= periodStart && r[0] <= periodEnd;
  });

  // Rows that will NOT make it onto an invoice, and why. Anything with a practitioner,
  // date or service typed in that fails one of these checks is reported back to the user
  // instead of being dropped silently.
  const allNames = pracData.filter(function (r) { return r[0]; }).map(function (r) { return String(r[0]); });
  const activeNames = practitioners.map(function (p) { return p.name; });
  const norm = function (v) { return String(v).trim().toLowerCase(); };
  const skipped = [];
  const noClient = [];  // included bookings with no Client Name; payroll's review summary needs one
  let outOfPeriod = 0;
  calcData.forEach(function (r, i) {
    const date = r[0], name = r[1], service = r[2];
    if (!name && !date && !service) return;  // blank row
    const rowNum = TXN_FIRST_ROW + i;
    if (!name) {
      skipped.push({ row: rowNum, reason: "no practitioner chosen" });
    } else if (!(date instanceof Date)) {
      skipped.push({ row: rowNum, reason: date === "" || date === 0
        ? "no date entered"
        : "the date \"" + date + "\" can't be read. Retype it as month/day/year, like 10/17/2026" });
    } else if (allNames.indexOf(String(name)) === -1) {
      const near = allNames.some(function (n) { return norm(n) === norm(name); });
      skipped.push({ row: rowNum, reason: near
        ? "\"" + name + "\" doesn't exactly match the Practitioners tab (extra space or capitals?)"
        : "\"" + name + "\" isn't on the Practitioners tab" });
    } else if (activeNames.indexOf(String(name)) === -1) {
      skipped.push({ row: rowNum, reason: name + " is marked inactive on the Practitioners tab" });
    } else if (date < periodStart || date > periodEnd) {
      outOfPeriod++;
    } else if (String(clientCol[i][0]).trim() === "") {
      noClient.push(rowNum);
    }
  });

  const results = [];
  const mismatches = [];
  const txnRowsUsed = calcData.filter(function (r) { return r[1] !== ""; }).length;
  practitioners.forEach(function (p) {
    const matches = combined
      .filter(function (r) {
        const date = r[0];
        return r[1] === p.name && date instanceof Date && date >= periodStart && date <= periodEnd;
      })
      .slice()
      .sort(function (a, b) { return a[0] - b[0]; });

    if (matches.length === 0) return; // no invoice for practitioners with nothing this period

    const payoutPercent = (p.payoutOverride === "" || p.payoutOverride == null) ? payoutPercentDefault : p.payoutOverride;
    const facilityFeePercent = 1 - (Number(payoutPercent) || 0);

    let grossTotal = 0, productFeeTotal = 0, linenTotal = 0, gratuityTotal = 0;
    let travelTotal = 0, convenienceTotal = 0, compedTotal = 0, facilityFeeTotal = 0, sheetNetTotal = 0;
    const eventTotals = {}; // eventName -> { travel, convenience, count }

    // Combined row: 0 Date, 1 Practitioner, 2 Service, 3 Price, 4 Product Fee,
    // 5 Linen Fee, 6 Travel Fee, 7 Convenience Fee, 8 Gratuity %, 9 Gratuity
    // Amount, 10 Facility Fee, 11 Net Amount, 12 Check, 13 Comped Value, 14 Event.
    const lineItems = matches.map(function (r) {
      const date = r[0], service = r[2], price = Number(r[3]) || 0, productFee = Number(r[4]) || 0,
        linenFee = Number(r[5]) || 0, travel = Number(r[6]) || 0, convenience = Number(r[7]) || 0,
        gratAmt = Number(r[9]) || 0, comped = Number(r[13]) || 0, eventName = r[14] || "";
      const facilityFee = price * facilityFeePercent;
      // Every amount that reaches Net payout is in a row: product fee comes off here, travel gets its own line.
      const payout = price - facilityFee - productFee - linenFee + convenience + gratAmt;

      compedTotal += comped;
      sheetNetTotal += Number(r[11]) || 0;
      grossTotal += price;
      productFeeTotal += productFee;
      linenTotal += linenFee;
      gratuityTotal += gratAmt;
      travelTotal += travel;
      convenienceTotal += convenience;
      facilityFeeTotal += facilityFee;

      if (eventName) {
        if (!eventTotals[eventName]) eventTotals[eventName] = { travel: 0, convenience: 0, count: 0, services: [] };
        eventTotals[eventName].travel += travel;
        eventTotals[eventName].convenience += convenience;
        eventTotals[eventName].count += 1;
        eventTotals[eventName].services.push(service);
      }

      return {
        date: date, service: service, price: price, facilityFee: facilityFee,
        linenFee: linenFee, productFee: productFee, convenience: convenience, gratAmt: gratAmt,
        payout: payout, eventName: eventName,
      };
    });

    const eventFeesTotal = travelTotal + convenienceTotal;
    const netAmount = grossTotal - facilityFeeTotal - productFeeTotal - linenTotal + eventFeesTotal + gratuityTotal;
    // Transactions' own Net column and this script do the math separately; they should agree.
    if (Math.abs(sheetNetTotal - netAmount) > 0.01 * matches.length + 0.01) {
      mismatches.push({ name: p.name, script: netAmount, sheet: sheetNetTotal });
    }
    const linenCount = lineItems.filter(function (it) { return it.linenFee > 0; }).length;
    const linenRate = linenCount > 0 ? linenTotal / linenCount : 0;
    const productCount = lineItems.filter(function (it) { return it.productFee > 0; }).length;
    const productRate = productCount > 0 ? productFeeTotal / productCount : 0;

    results.push({
      name: p.name, txnCount: matches.length, lineItems: lineItems, facilityFeePercent: facilityFeePercent,
      grossTotal: grossTotal, compedTotal: compedTotal, facilityFeeTotal: facilityFeeTotal,
      productFeeTotal: productFeeTotal, productCount: productCount, productRate: productRate,
      linenTotal: linenTotal, linenCount: linenCount, linenRate: linenRate,
      eventTotals: eventTotals, eventFeesTotal: eventFeesTotal, gratuityTotal: gratuityTotal, netAmount: netAmount,
    });
  });

  return { anyInRange: anyInRange, results: results, skipped: skipped, outOfPeriod: outOfPeriod,
    practitionerNames: activeNames, mismatches: mismatches, txnRowsUsed: txnRowsUsed, noClient: noClient,
    overflow: rowsBelowLimit_(txnSheet) };
}

// Entries typed below the last calculated row are never counted, so list them instead of ignoring them.
function rowsBelowLimit_(txnSheet) {
  const last = txnSheet.getLastRow();
  if (last <= TXN_LAST_ROW) return [];
  const rows = [];
  txnSheet.getRange(TXN_LAST_ROW + 1, 1, last - TXN_LAST_ROW, TXN_INPUT_COLS).getValues().forEach(function (r, i) {
    if (r.some(function (v) { return String(v).trim() !== ""; })) rows.push(TXN_LAST_ROW + 1 + i);
  });
  return rows;
}

/**
 * Writes the summary table onto Invoices and (re)applies its own formatting
 * every time — column widths, header wrap, row height, and shading — so they
 * can't drift out of sync with what the columns actually need.
 */
function writeSummaryTable_(invoicesSheet, results) {
  const lastRow = Math.max(invoicesSheet.getLastRow(), SUMMARY_START_ROW + results.length + 5);
  invoicesSheet.getRange(SUMMARY_START_ROW, 1, lastRow - SUMMARY_START_ROW + 1, 10).clearContent()
    .setBorder(false, false, false, false, false, false);  // old row lines go too, so a shorter table leaves none behind

  // A..J, in pixels. Column width is a whole-sheet property, not per-row, so
  // these also apply to the Period Start/End block above this table (same
  // columns). The manager email lives on Settings now, so C no longer needs
  // extra room for it.
  const widths = [120, 95, 110, 90, 85, 80, 80, 80, 90, 95];  // about 925px, so Net Amount stays clear of the panel
  widths.forEach(function (w, i) { invoicesSheet.setColumnWidth(i + 1, w); });

  const summaryHeaders = ["Practitioner", "Transactions", "Gratuity",
    "Facility Fee", "Product Fees", "Linen Fees", "Event Fees", "Comped", "Gross Revenue", "Net Amount"];
  const headerRange = invoicesSheet.getRange(SUMMARY_START_ROW, 1, 1, summaryHeaders.length);
  headerRange.setValues([summaryHeaders]);
  headerRange.setBackground(COLOR_PRIMARY).setFontColor("#ffffff").setFontWeight("bold")
    .setWrap(true).setVerticalAlignment("middle");
  invoicesSheet.setRowHeight(SUMMARY_START_ROW, 40);

  let summaryRow = SUMMARY_START_ROW + 1;
  let netGrandTotal = 0;
  results.forEach(function (res) {
    const row = [res.name, res.txnCount, res.gratuityTotal,
      -res.facilityFeeTotal, -res.productFeeTotal, -res.linenTotal, res.eventFeesTotal, res.compedTotal, res.grossTotal, res.netAmount];
    invoicesSheet.getRange(summaryRow, 1, 1, row.length).setValues([row])
      .setBackground(COLOR_PRIMARY_LIGHT).setVerticalAlignment("middle");
    for (const col of [3, 4, 5, 6, 7, 8, 9, 10]) {
      invoicesSheet.getRange(summaryRow, col).setNumberFormat(CURRENCY_FMT);
    }
    invoicesSheet.getRange(summaryRow, 10).setFontWeight("bold").setBackground("#EFD3DD").setFontColor(COLOR_PRIMARY);
    netGrandTotal += res.netAmount;
    summaryRow++;
  });
  // Breathing room: taller rows and a soft line between practitioners, so the table doesn't feel cramped.
  if (results.length) {
    invoicesSheet.setRowHeights(SUMMARY_START_ROW + 1, results.length, 32);
    invoicesSheet.getRange(SUMMARY_START_ROW + 1, 1, results.length, summaryHeaders.length)
      .setBorder(null, null, true, null, null, true, "#E6D3DA", SpreadsheetApp.BorderStyle.SOLID);
  }

  return netGrandTotal;
}

/**
 * Plain-language note about bookings that were left out, to append to an alert.
 * Empty string when nothing was skipped.
 */
function skippedNote_(computed) {
  let note = "";
  if (computed.skipped && computed.skipped.length > 0) {
    const shown = computed.skipped.slice(0, 10).map(function (x) { return "Row " + x.row + ": " + x.reason; });
    const more = computed.skipped.length - shown.length;
    note += "\n\n" + computed.skipped.length + " booking row(s) on Transactions were NOT included:\n" +
      shown.join("\n") + (more > 0 ? "\n...and " + more + " more." : "") +
      "\nFix those rows, then run this again.";
  }
  if (computed.overflow && computed.overflow.length > 0) {
    note += "\n\n" + computed.overflow.length + " entry(ies) are typed BELOW row " + TXN_LAST_ROW + " on Transactions (row " +
      computed.overflow.slice(0, 10).join(", ") + (computed.overflow.length > 10 ? ", ..." : "") +
      "). Only rows " + TXN_FIRST_ROW + " to " + TXN_LAST_ROW + " are counted, so these are NOT included.";
  }
  if (computed.outOfPeriod > 0) {
    note += "\n\n" + computed.outOfPeriod + " row(s) have dates outside this pay period and were left out.";
  }
  if (computed.noClient && computed.noClient.length > 0) {
    note += "\n\n" + computed.noClient.length + " booking(s) have no Client Name (row " +
      computed.noClient.slice(0, 10).join(", ") + (computed.noClient.length > 10 ? ", ..." : "") +
      "). They are still counted, but the review summary needs the name.";
  }
  if (computed.mismatches && computed.mismatches.length > 0) {
    note += "\n\nCHECK THESE TOTALS: the Net on the Transactions tab and this tool disagree for " +
      computed.mismatches.map(function (m) {
        return m.name + " (Transactions " + fmtCurrency(m.sheet) + " vs invoice " + fmtCurrency(m.script) + ")";
      }).join(", ") + ". Look for a typed-over pink cell or an error value before sending anything.";
  }
  const capacity = TXN_LAST_ROW - TXN_FIRST_ROW + 1;
  if (computed.txnRowsUsed >= capacity * 0.9) {
    note += "\n\nTransactions is nearly full (" + computed.txnRowsUsed + " of " + capacity + " rows used).";
  }
  return note;
}

/**
 * Fast: recomputes and rewrites the summary table only — no PDFs, no Drive, no
 * email, so it won't time out and there's nothing to review or undo. Use this
 * to sanity-check numbers before committing to a full run.
 */
function previewInvoiceTotals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invoicesSheet = ss.getSheetByName(INVOICES_SHEET);
  const ui = SpreadsheetApp.getUi();

  const range = getPeriodRange_(invoicesSheet, ui);
  if (!range) return;

  const computed = computePeriodResults_(ss, range.periodStart, range.periodEnd);
  if (!computed.anyInRange) {
    floraAlert_("No transactions fall between " + fmtDate(range.periodStart) + " and " +
      fmtDate(range.periodEnd) + ". Check the period start date on Invoices, or that dates were entered on Transactions." +
      skippedNote_(computed), "warn");
    return;
  }

  const netGrandTotal = writeSummaryTable_(invoicesSheet, computed.results);
  ss.setActiveSheet(invoicesSheet);  // show the table the pop-up talks about
  markStepDone_("1");
  const skipped = skippedNote_(computed).trim();
  floraDialog_("This week's totals", {
    tone: skipped ? "warn" : "good",
    headline: fmtCurrency(netGrandTotal) + " to pay out",
    sub: computed.results.length + " practitioner(s), " + fmtDate(range.periodStart) + " to " + fmtDate(range.periodEnd) + ". The table on Invoices is filled in. Nothing saved or sent yet.",
    body: skipped
  });
}

/**
 * Builds one PDF per active practitioner into a dated Drive folder and writes
 * the summary onto Invoices. Does NOT email anyone — that's the review summary
 * email and Send Practitioner Invoices, run separately once you're ready.
 */
function generateInvoices() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invoicesSheet = ss.getSheetByName(INVOICES_SHEET);
  const ui = SpreadsheetApp.getUi();

  const range = getPeriodRange_(invoicesSheet, ui);
  if (!range) return;
  const periodStart = range.periodStart, periodEnd = range.periodEnd;

  const businessName = ss.getRangeByName("BusinessName").getValue();
  const businessAddress = ss.getRangeByName("BusinessAddress").getValue();
  const computed = computePeriodResults_(ss, periodStart, periodEnd);
  if (!computed.anyInRange) {
    floraAlert_("No transactions fall between " + fmtDate(periodStart) + " and " +
      fmtDate(periodEnd) + ". Check the period start date on Invoices, or that dates were entered on Transactions." +
      skippedNote_(computed), "warn");
    return;
  }

  writeSummaryTable_(invoicesSheet, computed.results);
  ss.setActiveSheet(invoicesSheet);  // show the table the pop-up talks about

  const folderName = "Invoices " + fmtDate(periodStart) + " to " + fmtDate(periodEnd);
  const folder = getOrCreateFolder(folderName);

  let invoiceCount = 0;
  computed.results.forEach(function (res) {
    makeInvoicePdf_(folder, businessName, businessAddress, res.name, periodStart, periodEnd, res.lineItems,
      res.facilityFeePercent, res.grossTotal, res.facilityFeeTotal, res.productFeeTotal, res.productCount, res.productRate,
      res.linenTotal, res.linenCount, res.linenRate, res.eventTotals, res.gratuityTotal, res.netAmount);
    invoiceCount++;
  });
  // A practitioner who had an invoice from an earlier run but has no bookings now (a fixed mistake) must not
  // keep a stale PDF here, or step 4 would email it. Only this week's invoice PDFs are looked at.
  const folderNames = [];
  const all = folder.getFiles();
  const byName = {};
  while (all.hasNext()) { const f = all.next(); folderNames.push(f.getName()); (byName[f.getName()] = byName[f.getName()] || []).push(f); }
  const stale = staleInvoiceFiles_(folderNames, computed.results.map(function (r) { return String(r.name); }), fmtDate(periodStart, "-"));
  stale.forEach(function (st) { byName[st.file].forEach(function (f) { f.setTrashed(true); }); });
  rememberPrint_(INVOICE_PRINT_KEY, periodStart, computed.results);
  markStepDone_("1");  // making the PDFs also fills in the totals table
  markStepDone_("2");

  showResultDialog_("Invoices saved",
    invoiceCount + " invoice PDF(s) saved to Drive folder \"" + folderName + "\". " +
    "Run Flora · This Week > 3 · Make manager summary when you're ready." +
    (stale.length ? "\n\nRemoved old invoice(s) for " + stale.map(function (st) { return st.name; }).join(", ") +
      ", who no longer have bookings this week (moved to the Drive trash, so they can't be emailed)." : "") +
    acct_(ss, "Saved to the Google Drive of") + skippedNote_(computed),
    [{ label: "Open the invoice folder", url: folder.getUrl() }]);
}

/**
 * Test run for ONE practitioner: pick a name, get just that person's invoice PDF.
 * Saves into the same period folder as the full run (replacing an earlier copy of the
 * same invoice), doesn't touch the summary table, and emails nobody. Good for checking
 * a single person's numbers, or for ruling out a problem without waiting on everyone.
 */
function generateOneInvoice() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invoicesSheet = ss.getSheetByName(INVOICES_SHEET);
  const ui = SpreadsheetApp.getUi();

  const range = getPeriodRange_(invoicesSheet, ui);
  if (!range) return;

  const names = computePeriodResults_(ss, range.periodStart, range.periodEnd).practitionerNames;
  if (!names || names.length === 0) {
    floraAlert_("No active practitioners found on the Practitioners tab.", "warn");
    return;
  }

  floraPickerDialog_("Redo one practitioner's invoice", {
    introHtml: "<b>" + htmlEsc_(fmtPeriod_(range.periodStart, range.periodEnd)) + "</b><br>Makes just this person's invoice PDF again, " +
      "replacing their earlier copy. It doesn't touch the totals table and emails nobody.",
    label: "Which practitioner?", options: names, button: "Make this invoice",
    serverFn: "generateInvoiceForPractitioner", height: 440
  });
}

// Called by the dialog above. Public (no trailing underscore) so the dialog can call it.
function generateInvoiceForPractitioner(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invoicesSheet = ss.getSheetByName(INVOICES_SHEET);
  const periodStart = invoicesSheet.getRange(PERIOD_START_CELL).getValue();
  if (!(periodStart instanceof Date)) {
    return { text: "The Invoice Period Start isn't a valid date. Close this, go to the INVOICES tab, click cell " + PERIOD_START_CELL +
      ", and type a Friday as month/day/year, like 11/27/2026.", url: "" };
  }
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 6);

  const computed = computePeriodResults_(ss, periodStart, periodEnd);
  const res = computed.results.filter(function (r) { return r.name === name; })[0];
  if (!res) {
    return { text: "No bookings found for " + name + " between " + fmtDate(periodStart) + " and " + fmtDate(periodEnd) +
      ". Nothing was generated." + skippedNote_(computed), url: "" };
  }

  const businessName = ss.getRangeByName("BusinessName").getValue();
  const businessAddress = ss.getRangeByName("BusinessAddress").getValue();
  const folderName = "Invoices " + fmtDate(periodStart) + " to " + fmtDate(periodEnd);
  const folder = getOrCreateFolder(folderName);

  // Replace an earlier copy of this same invoice instead of leaving a duplicate beside it.
  const fileName = name + " - Invoice - " + fmtDate(periodStart, "-") + ".pdf";
  const replaced = trashFilesNamed_(folder, fileName);

  makeInvoicePdf_(folder, businessName, businessAddress, res.name, periodStart, periodEnd, res.lineItems,
    res.facilityFeePercent, res.grossTotal, res.facilityFeeTotal, res.productFeeTotal, res.productCount, res.productRate,
    res.linenTotal, res.linenCount, res.linenRate, res.eventTotals, res.gratuityTotal, res.netAmount);

  rememberPrint_(INVOICE_PRINT_KEY, periodStart, computed.results, String(res.name));
  const saved = newestFileNamed_(folder, fileName);
  return {
    text: "Saved " + name + "'s invoice: " + res.txnCount + " booking(s), net " + fmtCurrency(res.netAmount) +
      ". It's in the Drive folder \"" + folderName + "\"" + (replaced ? " (replaced the earlier copy)" : "") +
      ". The summary table and emails were not touched." + acct_(ss, "Saved to the Google Drive of") + skippedNote_(computed),
    url: saved ? saved.getUrl() : "",
  };
}

/**
 * Run only after the manager has approved. Emails each active
 * practitioner their own PDF from the current period's Drive folder — only
 * if they have an Email on the Practitioners tab. Anyone without one is
 * skipped and counted, never guessed at.
 */
// confirmed: true after the Flora Yes button.
function sendPractitionerInvoices(confirmed) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invoicesSheet = ss.getSheetByName(INVOICES_SHEET);
  const pracSheet = ss.getSheetByName(PRACTITIONERS_SHEET);
  const ui = SpreadsheetApp.getUi();

  const range = getPeriodRange_(invoicesSheet, ui);
  if (!range) return;
  const periodStart = range.periodStart, periodEnd = range.periodEnd;

  const businessName = ss.getRangeByName("BusinessName").getValue();
  const folderName = "Invoices " + fmtDate(periodStart) + " to " + fmtDate(periodEnd);
  const folders = DriveApp.getFoldersByName(folderName);
  if (!folders.hasNext()) {
    floraAlert_("No invoice folder found for this period (\"" + folderName + "\"). Run Flora · This Week > 2 · Make invoice PDFs first.", "warn");
    return;
  }
  const folder = folders.next();

  // Send Log remembers who already got this period's invoice, so a second run can't email anyone twice.
  const log = getSendLog_(ss);
  const periodKey = fmtDate(periodStart);
  const sentKeys = {};
  if (log.getLastRow() > 1) {
    log.getRange(2, 1, log.getLastRow() - 1, 5).getValues().forEach(function (r) {
      if (r[4] === "Sent") sentKeys[String(r[1]) + "|" + String(r[2]) + "|" + String(r[3]).toLowerCase()] = true;
    });
  }

  const pracData = pracSheet.getRange(PRAC_FIRST_ROW, 1, PRAC_LAST_ROW - PRAC_FIRST_ROW + 1, 5).getValues();
  const practitioners = pracData.filter(function (r) { return r[0] && String(r[1]).toUpperCase() === "Y"; });

  const todo = [];
  const noPdfNames = [], noEmailNames = [], alreadyNames = [];
  practitioners.forEach(function (r) {
    const name = r[0], email = String(r[4] || "").trim();
    const file = newestFileNamed_(folder, name + " - Invoice - " + fmtDate(periodStart, "-") + ".pdf");
    if (!file) { noPdfNames.push(String(name)); return; }
    if (!email) { noEmailNames.push(String(name)); return; }
    if (sentKeys[periodKey + "|" + name + "|" + email.toLowerCase()]) { alreadyNames.push(String(name)); return; }
    todo.push({ name: name, email: email, file: file });
  });
  const skippedNoPdf = noPdfNames.length, skippedNoEmail = noEmailNames.length, alreadySent = alreadyNames.length;
  const period = fmtDate(periodStart) + " to " + fmtDate(periodEnd);
  const skippedGroups = [
    { label: "Already had theirs", tone: "muted", items: alreadyNames },
    { label: "No email on file (add it on Practitioners)", tone: "warn", items: noEmailNames },
    { label: "No invoice PDF this week", tone: "warn", items: noPdfNames }
  ];

  const tail = alreadySent + " already sent, " + skippedNoEmail + " have no email on file, " +
    skippedNoPdf + " have no invoice PDF this period.";
  if (todo.length === 0) {
    if (alreadySent > 0) markStepDone_("4");  // everyone with a PDF and an email already has theirs
    floraDialog_("Practitioner invoices", {
      tone: alreadySent && !skippedNoEmail && !skippedNoPdf ? "good" : "info",
      headline: alreadySent && !skippedNoEmail && !skippedNoPdf ? "Everyone already has their invoice" : "Nothing new to send",
      sub: "For " + period + ".", groups: skippedGroups,
      body: "To send someone again, delete their row on the Send Log tab."
    });
    return;
  }
  const changedInv = changedSincePrint_(INVOICE_PRINT_KEY, periodStart, computePeriodResults_(ss, periodStart, periodEnd).results);
  if (changedInv.length) {
    floraDialog_("Practitioner invoices", { tone: "warn", headline: "Make the invoice PDFs again first",
      sub: "Bookings changed after the PDFs were made, so these would be out of date. Nothing was sent.",
      groups: [{ label: "Changed since the PDFs were made", tone: "warn", items: changedInv }],
      body: "Run 2 · Make invoice PDFs, then send." });
    return;
  }
  const tests = testBookingCount_(ss);
  const quota = MailApp.getRemainingDailyQuota();
  if (quota < todo.length) {
    floraAlert_("Google only allows " + quota + " more emails from this account today, and this batch is " + todo.length +
      ". Nothing was sent. Try again tomorrow.", "warn");
    return;
  }

  if (!confirmed) {
    floraConfirm_("Practitioner invoices", {
      tone: "warn", headline: "Email " + todo.length + " practitioner" + (todo.length === 1 ? "" : "s") + " their invoice?",
      sub: "For " + fmtDate(periodStart) + " to " + fmtDate(periodEnd) + ". Only after the manager has approved.",
      groups: [{ label: "Will get their invoice", tone: "good", items: todo.map(function (t) { return t.name + " (" + t.email + ")"; }) }]
        .concat(skippedGroups),
      body: (tests ? "Heads-up: " + tests + " TEST booking(s) are on Transactions and included in these invoices." : "") +
        acct_(ss, "The emails will come from"),
      yes: "Send " + todo.length + " email" + (todo.length === 1 ? "" : "s"), no: "Not yet", action: "send", danger: true
    });
    return;
  }

  let sent = 0;
  const failed = [], sentNames = [];
  todo.forEach(function (t) {
    try {
      MailApp.sendEmail({
        to: t.email,
        subject: businessName + " — Your invoice: " + fmtDate(periodStart) + " to " + fmtDate(periodEnd),
        body: "Hi " + t.name + ",\n\nAttached is your invoice for " + fmtDate(periodStart) + " to " +
          fmtDate(periodEnd) + ". This is for your own records — self-employment income and expenses.\n\n" + businessName,
        attachments: [t.file.getAs("application/pdf")],
      });
      sent++;
      sentNames.push(String(t.name));
      log.appendRow([new Date(), periodKey, t.name, t.email, "Sent"]);
    } catch (e) {
      failed.push(t.name);
      log.appendRow([new Date(), periodKey, t.name, t.email, "Failed: " + e.message]);
    }
  });
  if (sent > 0) markStepDone_("4");

  floraDialog_("Practitioner invoices", {
    tone: failed.length ? (sent ? "warn" : "bad") : "good",
    headline: sent + " invoice" + (sent === 1 ? "" : "s") + " sent" + (failed.length ? ", " + failed.length + " failed" : ""),
    sub: "For " + period + ".",
    groups: [{ label: "Sent", tone: "good", items: sentNames },
             { label: "Not sent: something went wrong (details on the Send Log tab)", tone: "bad", items: failed.map(String) }]
      .concat(skippedGroups)
  });
}

/**
 * For paying practitioners by e-Transfer: one short note per person, listing what the payment is for
 * (services, gratuity) so it matches the invoice. Shown in a dialog with a Copy button on each, next
 * to the amount and the email to send it to. Nothing is saved or sent.
 */
function eTransferNotes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const range = getPeriodRange_(ss.getSheetByName(INVOICES_SHEET), ui);
  if (!range) return;

  const computed = computePeriodResults_(ss, range.periodStart, range.periodEnd);
  if (computed.results.length === 0) {
    floraAlert_("No invoiced bookings between " + fmtDate(range.periodStart) + " and " + fmtDate(range.periodEnd) + "." + skippedNote_(computed), "warn");
    return;
  }

  const cards = eTransferCards_(ss, range, computed).map(function (c) {
    return { name: c.name, email: c.email, amount: c.amountText, note: c.note, shortened: c.shortened };
  });

  // Copy buttons for each note, plus a button that writes the same list to an E-Transfers tab the manager can
  // work through outside this popup (and in the Sheets app on an iPad). Data goes in as JSON and is
  // only ever placed with textContent / value.
  const json = JSON.stringify({ cards: cards, extra: skippedNote_(computed).trim() }).replace(/</g, "\\u003c");
  const html = HtmlService.createHtmlOutput(
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">' +
    '<style>body{margin:0;font:14px/1.5 "DM Sans",Arial,sans-serif;color:#2E2A2C}' +
    '.tab{display:flex;gap:12px;align-items:center;justify-content:space-between;background:#F7E4E9;border-radius:14px;padding:12px 14px;margin:0 0 12px}' +
    '.tab b{color:#86304F}.big{min-height:44px;padding:0 16px;border:none;border-radius:10px;background:#A13D63;color:#fff;font:inherit;font-weight:700;cursor:pointer;white-space:nowrap}' +
    '.big:disabled{opacity:.6;cursor:default}.card{border:1px solid #EFE6EA;border-radius:12px;padding:10px 12px;margin:8px 0}' +
    '.top{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.amt{font-weight:700;font-size:16px}' +
    '.muted{color:#5E565A;font-size:12.5px}textarea{width:100%;box-sizing:border-box;height:66px;font:13px/1.4 "DM Sans",Arial,sans-serif;margin-top:6px;border:1px solid #EFE6EA;border-radius:8px;padding:6px}' +
    '.copy{min-height:36px;padding:0 12px;border:1px solid #A13D63;border-radius:8px;background:#fff;color:#A13D63;font:inherit;font-weight:700;cursor:pointer;margin-top:4px}' +
    '.close{min-height:44px;padding:0 18px;border-radius:10px;border:1px solid #D9CFC7;background:#fff;font:inherit;font-weight:700;cursor:pointer}</style>' +
    '<p style="margin:0 0 10px">Pay <b>' + htmlEsc_(fmtDateLong(range.periodStart)) + ' to ' + htmlEsc_(fmtDateLong(range.periodEnd)) +
    '</b> by e-Transfer for the amount shown, and paste the note into the message box.</p>' +
    '<div class="tab"><span><b>Switching to your bank app?</b><br><span class="muted">Put this list on an E-Transfers tab with Paid tick boxes. It stays put and works on an iPad too.</span></span>' +
    '<button class="big" id="mk">Make checklist tab</button></div>' +
    '<div id="err" class="muted" style="color:#9B2C22"></div>' +
    '<div id="list"></div><div id="extra" style="white-space:pre-wrap;color:#9B2C22;margin:8px 0"></div>' +
    '<p><button class="close" onclick="google.script.host.close()">Close</button></p>' +
    '<script>var d=' + json + ';var list=document.getElementById("list");' +
    'd.cards.forEach(function(c){var box=document.createElement("div");box.className="card";' +
    'var top=document.createElement("div");top.className="top";var nm=document.createElement("b");nm.textContent=c.name;' +
    'var am=document.createElement("span");am.className="amt";am.textContent=c.amount;top.appendChild(nm);top.appendChild(am);' +
    'var em=document.createElement("div");em.className="muted";em.textContent=c.email?"to "+c.email:"(no email on file)";' +
    'var t=document.createElement("textarea");t.readOnly=true;t.value=c.note;' +
    'var n=document.createElement("div");n.className="muted";n.textContent=c.note.length+" characters"+(c.shortened?" (shortened to fit; the full list is on the invoice)":"");' +
    'var b=document.createElement("button");b.className="copy";b.textContent="Copy note";' +
    'b.onclick=function(){t.select();document.execCommand("copy");b.textContent="Copied";};' +
    '[top,em,t,n,b].forEach(function(x){box.appendChild(x);});list.appendChild(box);});' +
    'document.getElementById("extra").textContent=d.extra;' +
    'var mk=document.getElementById("mk");mk.onclick=function(){mk.disabled=true;mk.textContent="Making it\u2026";' +
    'google.script.run.withSuccessHandler(function(){google.script.host.close();})' +
    '.withFailureHandler(function(e){mk.disabled=false;mk.textContent="Make checklist tab";document.getElementById("err").textContent="Couldn\u2019t make the tab: "+((e&&e.message)||e);})' +
    '.makeETransferChecklist();};</script>'
  ).setWidth(560).setHeight(Math.min(640, 300 + cards.length * 175));
  markStepDone_("5");
  ui.showModalDialog(html, "E-Transfer notes");
}

// "Flora payout Nov 20 to Nov 26: 2 x 60 Minute Massage, 1 x Facial. Gratuity $45.00. Total $312.50."
// With no gratuity it says "No gratuity." instead.
// If that's too long for the message box, it falls back to a service count and points to the invoice.
function buildETransferNote_(res, periodStart, periodEnd, businessName) {
  const clean = function (v) {
    return String(v).replace(/&/g, "and").replace(/[^\p{L}\p{N} .,'()$%\/:+\-]/gu, " ").replace(/\s+/g, " ").trim();
  };
  const counts = {}, order = [];
  res.lineItems.forEach(function (it) {
    const name = clean(it.service);
    if (!counts[name]) { counts[name] = 0; order.push(name); }
    counts[name]++;
  });
  const head = clean(businessName).split(" ")[0] + " payout " + fmtDateShort(periodStart) + " to " + fmtDateShort(periodEnd) + ": ";
  // Gratuity is always mentioned, so "none" reads as deliberate rather than forgotten.
  const tail = (res.gratuityTotal > 0 ? " Gratuity " + fmtCurrency(res.gratuityTotal) + "." : " No gratuity.") +
    (res.eventFeesTotal > 0 ? " Event fees " + fmtCurrency(res.eventFeesTotal) + "." : "") +
    " Total " + fmtCurrency(res.netAmount) + ".";
  const full = head + order.map(function (n) { return counts[n] + " x " + n; }).join(", ") + "." + tail;
  if (full.length <= ETRANSFER_NOTE_MAX) return { text: full, shortened: false };
  const short = head + res.txnCount + " services." + tail + " See your emailed invoice for the list.";
  return { text: short.slice(0, ETRANSFER_NOTE_MAX), shortened: true };
}

/**
 * Summary for the manager/payroll: totals per practitioner, then every booking
 * in the period (date, practitioner, client, service, price, gratuity) with a note on
 * anything unusual (comped, custom price, linen fee removed, event), plus any rows that
 * were left out. Saved as a PDF in the period's invoice folder, replacing an earlier
 * copy. Sends nothing.
 */
function generateReviewSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invoicesSheet = ss.getSheetByName(INVOICES_SHEET);
  const ui = SpreadsheetApp.getUi();

  const range = getPeriodRange_(invoicesSheet, ui);
  if (!range) return;
  const periodStart = range.periodStart, periodEnd = range.periodEnd;

  const computed = computePeriodResults_(ss, periodStart, periodEnd);
  const bookings = collectReviewRows_(ss, periodStart, periodEnd);
  if (bookings.length === 0 && computed.skipped.length === 0) {
    floraAlert_("Nothing to summarize: no bookings dated " + fmtDate(periodStart) + " to " + fmtDate(periodEnd) + "." + skippedNote_(computed), "warn");
    return;
  }

  const saved = saveReviewSummary_(ss, periodStart, periodEnd, computed, bookings);
  const file = saved.file, replaced = saved.replaced;
  rememberPrint_(SUMMARY_PRINT_KEY, periodStart, computed.results);
  markStepDone_("3");

  showResultDialog_("Review summary saved",
    "Review summary saved" + (replaced ? " (replaced the earlier copy)" : "") + ".\n\n" +
    bookings.length + " booking(s), " + bookings.filter(function (b) { return b.notes.length > 0; }).length + " with notes.\n\n" +
    "Nothing has been emailed. When it looks right, run Flora · This Week > 3b · Email summary to manager." +
    acct_(ss, "Saved to the Google Drive of") + skippedNote_(computed),
    [{ label: "Open the review summary PDF", url: file.getUrl() }]);
}

/**
 * Emails the already-saved review summary (and only that file) to the Manager
 * Email, after a confirmation. Run Generate Manager Review Summary first.
 */
// confirmed: true after the Flora Yes button.
function emailReviewSummary(confirmed) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const range = getPeriodRange_(ss.getSheetByName(INVOICES_SHEET), ui);
  if (!range) return;
  const periodStart = range.periodStart, periodEnd = range.periodEnd;

  const managerEmail = ss.getRangeByName("ManagerEmail").getValue();
  if (!managerEmail) {
    floraAlert_("Set a Manager Email on " + managerEmailWhere_(ss) + " first.", "warn");
    return;
  }
  const businessName = ss.getRangeByName("BusinessName").getValue();
  const folderName = "Invoices " + fmtDate(periodStart) + " to " + fmtDate(periodEnd);
  const fileName = "Review Summary - " + fmtDate(periodStart, "-") + ".pdf";
  const folders = DriveApp.getFoldersByName(folderName);
  const file = folders.hasNext() ? newestFileNamed_(folders.next(), fileName) : null;
  if (!file) {
    floraAlert_("No review summary found for this period. Run Flora · This Week > 3 · Make manager summary first.", "warn");
    return;
  }

  const changedSum = changedSincePrint_(SUMMARY_PRINT_KEY, periodStart, computePeriodResults_(ss, periodStart, periodEnd).results);
  if (changedSum.length) {
    floraDialog_("Manager summary", { tone: "warn", headline: "Make the manager summary again first",
      sub: "Bookings changed after the summary was made, so it would be out of date. Nothing was emailed.",
      groups: [{ label: "Changed since the summary was made", tone: "warn", items: changedSum }],
      body: "Run 3 · Make manager summary, then email it." });
    return;
  }
  if (!confirmed) {
    floraConfirm_("Manager summary", {
      tone: "warn", headline: "Email the summary to the manager?",
      sub: "\"" + fileName + "\" (no invoices) to " + managerEmail + ".",
      body: acct_(ss, "It will come from").trim(), yes: "Send the summary", no: "Not yet", action: "emailSummary", danger: true
    });
    return;
  }

  MailApp.sendEmail({
    to: managerEmail,
    subject: businessName + " — Payroll review summary: " + fmtDate(periodStart) + " to " + fmtDate(periodEnd),
    body: "Attached is the review summary for " + fmtDate(periodStart) + " to " + fmtDate(periodEnd) +
      ": totals per practitioner and anything flagged for payroll (comped, custom price, linen waived, events).",
    attachments: [file.getAs("application/pdf")],
  });
  markStepDone_("3b");
  floraDialog_("Manager summary", { tone: "good", headline: "Summary emailed", sub: "Sent to " + managerEmail + ", for " + fmtDate(periodStart) + " to " + fmtDate(periodEnd) + "." });
}

// Builds the review PDF into the period's invoice folder, replacing any earlier copy.
function saveReviewSummary_(ss, periodStart, periodEnd, computed, bookings) {
  const folder = getOrCreateFolder("Invoices " + fmtDate(periodStart) + " to " + fmtDate(periodEnd));
  const fileName = "Review Summary - " + fmtDate(periodStart, "-") + ".pdf";
  const replaced = trashFilesNamed_(folder, fileName);
  const businessName = ss.getRangeByName("BusinessName").getValue();
  const file = makeReviewSummaryPdf_(folder, fileName, businessName, periodStart, periodEnd, computed, bookings);
  return { file: file, replaced: replaced };
}

/**
 * Rebuilds the review summary for an already-archived week from the Archive and
 * Payout History tabs, for when payroll asks about an old period.
 */
function reviewSummaryForPastWeek() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const history = ss.getSheetByName(HISTORY_SHEET);
  if (!history || history.getLastRow() <= LOG_HEADER_ROW) {
    floraAlert_("No archived weeks yet. Weeks appear here after you run Start next week.", "warn");
    return;
  }
  const seen = {}, periods = [];
  history.getRange(LOG_HEADER_ROW + 1, 1, history.getLastRow() - LOG_HEADER_ROW, 1).getValues().forEach(function (r) {
    if (r[0] instanceof Date) {
      const k = fmtDate(r[0]);
      if (!seen[k]) { seen[k] = true; periods.push({ k: k, t: r[0].getTime() }); }
    }
  });
  periods.sort(function (a, b) { return b.t - a.t; });
  floraPickerDialog_("Summary for a past week", {
    introHtml: "<b>Re-make the manager summary for a week that's already been archived.</b><br>" +
      "Handy if the manager asks for an old week again. It's saved to that week's folder and emails nobody.",
    label: "Which week? (the Friday it started)", options: periods.map(function (x) { return x.k; }),
    button: "Make the summary", serverFn: "generatePastReviewSummary", height: 420
  });
}

// Called by the dialog above. Public (no trailing underscore) so the dialog can call it.
function generatePastReviewSummary(label) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const archive = ss.getSheetByName(ARCHIVE_SHEET), history = ss.getSheetByName(HISTORY_SHEET);
  const first = LOG_HEADER_ROW + 1;
  const hv = history.getRange(first, 1, history.getLastRow() - LOG_HEADER_ROW, HISTORY_HEADERS.length).getValues();
  const av = archive.getRange(first, 1, archive.getLastRow() - LOG_HEADER_ROW, ARCHIVE_HEADERS.length).getValues();
  const inWeek = function (r) { return r[0] instanceof Date && fmtDate(r[0]) === label; };
  const arows = av.filter(function (r) { return inWeek(r) && r[2]; });
  if (arows.length === 0) return { text: "No archived bookings found for " + label + ".", url: "" };

  const periodStart = arows[0][0];
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 6);

  // Payout History stores fees as negatives; the PDF wants them positive.
  const results = hv.filter(inWeek).map(function (r) {
    return { name: String(r[2]), txnCount: r[3], grossTotal: r[10], compedTotal: r[9], facilityFeeTotal: -r[5], netAmount: r[11] };
  }).sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });

  const bookings = arows.map(function (r) {
    const notes = [];
    if (isYes_(r[16])) notes.push("COMPED" + (Number(r[14]) ? " (value " + fmtCurrency(r[14]) + ")" : ""));
    if (r[17] !== "" && r[17] != null && !isNaN(Number(r[17]))) notes.push("Custom price " + fmtCurrency(r[17]));
    if (isYes_(r[15])) notes.push("Linen fee removed");
    if (r[5]) notes.push("Event: " + r[5]);
    return { date: r[1], practitioner: String(r[2]), client: String(r[4] || ""), service: String(r[3] || ""),
      price: Number(r[6]) || 0, gratuity: Number(r[9]) || 0, notes: notes };
  }).sort(function (a, b) {
    return a.practitioner < b.practitioner ? -1 : a.practitioner > b.practitioner ? 1 : a.date - b.date;
  });

  const saved = saveReviewSummary_(ss, periodStart, periodEnd, { results: results, skipped: [], outOfPeriod: 0 }, bookings);
  return {
    text: "Saved the review summary for " + label + " (" + bookings.length + " bookings)" +
      (saved.replaced ? ", replacing the earlier copy" : "") + ". It's in the Drive folder \"Invoices " +
      fmtDate(periodStart) + " to " + fmtDate(periodEnd) + "\". Nothing was emailed.",
    url: saved.file.getUrl(),
  };
}

// Every booking in the period (any practitioner with a valid date), oldest first within
// each practitioner, with a plain-language note for anything out of the ordinary so a
// reader who wasn't there can see what happened.
function collectReviewRows_(ss, periodStart, periodEnd) {
  periodStart = startOfDay_(periodStart);
  periodEnd = endOfDay_(periodEnd);
  const txnSheet = ss.getSheetByName(TXN_SHEET);
  const calcSheet = ss.getSheetByName(CALC_SHEET);
  const n = TXN_LAST_ROW - TXN_FIRST_ROW + 1;
  const txn = txnSheet.getRange(TXN_FIRST_ROW, 1, n, TXN_RARE_COL + TXN_RARE_COLS - 1).getValues();
  const calc = calcSheet.getRange(TXN_FIRST_ROW, 1, n, 14).getValues();
  const rows = [];
  txn.forEach(function (r, i) {
    const date = calc[i][0];  // Calculations reads text dates too, so this agrees with the invoices
    if (!r[1] || !(date instanceof Date) || date < periodStart || date > periodEnd) return;
    const O = r[TXN_RARE_COL - 1], P = r[TXN_RARE_COL], Q = r[TXN_RARE_COL + 1], R = r[TXN_RARE_COL + 2];
    const notes = [];
    if (isYes_(P)) {
      const v = Number(calc[i][13]) || 0;
      notes.push("COMPED" + (v ? " (value " + fmtCurrency(v) + ")" : ""));
    }
    if (R !== "" && R != null && !isNaN(Number(R))) notes.push("Custom price " + fmtCurrency(R));
    if (isYes_(O)) notes.push("Linen fee removed");
    if (Q) notes.push("Event: " + Q);
    rows.push({
      row: TXN_FIRST_ROW + i, date: date, practitioner: String(r[1]), client: String(r[3] || ""),
      service: String(r[2] || ""), price: Number(calc[i][3]) || 0, gratuity: Number(calc[i][9]) || 0, notes: notes,
    });
  });
  rows.sort(function (a, b) {
    return a.practitioner < b.practitioner ? -1 : a.practitioner > b.practitioner ? 1 : a.date - b.date || a.row - b.row;
  });
  return rows;
}

function buildReviewSummaryPdf_(folder, fileName, businessName, periodStart, periodEnd, computed, bookings) {
  const doc = DocumentApp.create("TEMP - Review Summary");
  const body = doc.getBody();
  body.clear();
  const pdf = floraPdf_(body);

  // Totals per practitioner (worked out first, so the big number can sit at the top)
  const rows = [["Practitioner", "Bookings", "Gross", "Comped", "Facility fee", "Net payout"]];
  let tb = 0, tg = 0, tc = 0, tf = 0, tn = 0;
  computed.results.forEach(function (r) {
    rows.push([r.name, String(r.txnCount), fmtCurrency(r.grossTotal), fmtCurrency(r.compedTotal), fmtCurrency(r.facilityFeeTotal), fmtCurrency(r.netAmount)]);
    tb += r.txnCount; tg += r.grossTotal; tc += r.compedTotal; tf += r.facilityFeeTotal; tn += r.netAmount;
  });
  if (computed.results.length === 0) rows.push(["(no invoiced bookings)", "", "", "", "", ""]);
  else rows.push(["Total", String(tb), fmtCurrency(tg), fmtCurrency(tc), fmtCurrency(tf), fmtCurrency(tn)]);

  pdf.band(String(businessName), "PAYROLL REVIEW SUMMARY", "Prepared " + fmtDateLong(new Date()));
  pdf.info([["PAY PERIOD", fmtPeriod_(periodStart, periodEnd)], ["BOOKINGS", String(tb)], ["PRACTITIONERS", String(computed.results.length)]]);
  pdf.hero("TO PAY OUT THIS WEEK", "Net payout, all practitioners together", fmtCurrency(tn));

  // 1. Totals per practitioner
  pdf.section("TOTALS BY PRACTITIONER");
  pdf.table(rows, [146, 62, 72, 70, 78, 88], { right: [1, 2, 3, 4, 5], boldCols: [5], totalRow: computed.results.length > 0 });

  // 2. Every booking, with notes for anything unusual
  pdf.section("ALL BOOKINGS THIS PERIOD");
  if (bookings.length === 0) {
    pdf.note("No bookings dated in this period.", { italic: true, before: 0 });
  } else {
    const brows = [["Date", "Practitioner", "Client", "Service", "Price", "Gratuity", "Notes"]];
    const highlight = {};
    bookings.forEach(function (b, i) {
      brows.push([fmtDateShort(b.date), b.practitioner, b.client, b.service, fmtCurrency(b.price),
        b.gratuity ? fmtCurrency(b.gratuity) : "", b.notes.join("; ")]);
      if (b.notes.length) highlight[i + 1] = PDF_.amber;
    });
    const btable = pdf.table(brows, [44, 72, 80, 104, 52, 52, 112], { right: [4, 5], highlight: highlight, fontSize: 9 });
    bookings.forEach(function (b, i) { if (b.notes.length) btable.getRow(i + 1).getCell(6).editAsText().setBold(true); });
    pdf.note("Rows in yellow have notes: comped, custom price, linen fee removed, or an event.");
  }

  // 3. Rows left out
  if (computed.skipped.length > 0) {
    pdf.section("ROWS LEFT OUT (NEED FIXING)", { color: PDF_.red });
    computed.skipped.slice(0, 8).forEach(function (s) { pdf.para("Row " + s.row + ": " + s.reason, { size: 9.5, after: 2 }); });
    if (computed.skipped.length > 8) pdf.note("...and " + (computed.skipped.length - 8) + " more.", { italic: true });
  }
  if (computed.outOfPeriod > 0) {
    pdf.note(computed.outOfPeriod + " row(s) dated outside this pay period are not included above.", { italic: true, before: 8 });
  }

  doc.saveAndClose();
  const pdfBlob = DriveApp.getFileById(doc.getId()).getAs("application/pdf");
  pdfBlob.setName(fileName);
  const file = folder.createFile(pdfBlob);
  DriveApp.getFileById(doc.getId()).setTrashed(true);
  return file;
}

/**
 * Business-level totals for the period: what came in, what went out to practitioners, and
 * what the business keeps (facility, linen and product fees, less comps), plus a
 * per-practitioner breakdown and a few data checks. Saved as a PDF in the period's folder,
 * replacing an earlier copy. Sends nothing.
 */
function generateBusinessTotals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const range = getPeriodRange_(ss.getSheetByName(INVOICES_SHEET), ui);
  if (!range) return;
  const periodStart = range.periodStart, periodEnd = range.periodEnd;

  const computed = computePeriodResults_(ss, periodStart, periodEnd);
  if (computed.results.length === 0) {
    floraAlert_("No invoiced bookings between " + fmtDate(periodStart) + " and " + fmtDate(periodEnd) + "." + skippedNote_(computed), "warn");
    return;
  }
  const bookings = collectReviewRows_(ss, periodStart, periodEnd);

  const folder = getOrCreateFolder("Invoices " + fmtDate(periodStart) + " to " + fmtDate(periodEnd));
  const fileName = "Business Totals - " + fmtDate(periodStart, "-") + ".pdf";
  const replaced = trashFilesNamed_(folder, fileName);
  const file = makeBusinessTotalsPdf_(folder, fileName, ss.getRangeByName("BusinessName").getValue(),
    periodStart, periodEnd, computed, bookings);

  showResultDialog_("Business totals saved",
    "Business totals saved" + (replaced ? " (replaced the earlier copy)" : "") + ".\n\nNothing has been emailed." + acct_(ss, "Saved to the Google Drive of") + skippedNote_(computed),
    [{ label: "Open the business totals PDF", url: file.getUrl() }]);
}

function buildBusinessTotalsPdf_(folder, fileName, businessName, periodStart, periodEnd, computed, bookings) {
  const doc = DocumentApp.create("TEMP - Business Totals");
  const body = doc.getBody();
  body.clear();
  const pdf = floraPdf_(body);
  const money = function (n) { return n < 0 ? "(" + fmtCurrency(-n) + ")" : fmtCurrency(n); };

  const t = { count: 0, gross: 0, comped: 0, facility: 0, linen: 0, product: 0, eventFees: 0, gratuity: 0, net: 0 };
  computed.results.forEach(function (r) {
    t.count += r.txnCount; t.gross += r.grossTotal; t.comped += r.compedTotal; t.facility += r.facilityFeeTotal;
    t.linen += r.linenTotal; t.product += r.productFeeTotal; t.eventFees += r.eventFeesTotal;
    t.gratuity += r.gratuityTotal; t.net += r.netAmount;
  });
  const collected = t.gross - t.comped;
  const broughtIn = collected + t.gratuity + t.eventFees;
  const keeps = broughtIn - t.net;
  const feesLessComps = t.facility + t.linen + t.product - t.comped;

  pdf.band(String(businessName), "BUSINESS TOTALS", "Prepared " + fmtDateLong(new Date()));
  pdf.info([["PAY PERIOD", fmtPeriod_(periodStart, periodEnd)], ["BOOKINGS", String(t.count)], ["PRACTITIONERS", String(computed.results.length)]]);
  pdf.hero("BUSINESS KEEPS", "Brought in, minus what's paid out to practitioners", money(keeps));

  pdf.section("THE WEEK AT A GLANCE");
  pdf.table([
    ["Gross service value (list price of every booking)", money(t.gross)],
    ["less: Comped (services given away)", money(-t.comped)],
    ["Collected for services", money(collected)],
    ["plus: Gratuity (passed through to practitioners)", money(t.gratuity)],
    ["plus: Event fees (travel + event service fees)", money(t.eventFees)],
    ["Total brought in", money(broughtIn)],
    ["Paid out to practitioners (net)", money(t.net)],
    ["Business keeps (brought in minus paid out)", money(keeps)],
  ], [396, 120], { noHeader: true, right: [1], boldRows: [2, 5, 6], totalRow: true });

  pdf.section("WHERE THE BUSINESS'S SHARE COMES FROM");
  pdf.table([
    ["Facility fees", money(t.facility)],
    ["Linen fees", money(t.linen)],
    ["Product fees", money(t.product)],
    ["less: Comped (cost of services given away)", money(-t.comped)],
    ["Business keeps", money(feesLessComps)],
  ], [396, 120], { noHeader: true, right: [1], totalRow: true });

  pdf.section("BY PRACTITIONER");
  const rows = [["Practitioner", "Jobs", "Gross", "Comped", "Facility", "Linen", "Product", "Event", "Gratuity", "Net"]];
  computed.results.forEach(function (r) {
    rows.push([r.name, String(r.txnCount), fmtCurrency(r.grossTotal), fmtCurrency(r.compedTotal), fmtCurrency(r.facilityFeeTotal),
      fmtCurrency(r.linenTotal), fmtCurrency(r.productFeeTotal), fmtCurrency(r.eventFeesTotal), fmtCurrency(r.gratuityTotal), fmtCurrency(r.netAmount)]);
  });
  rows.push(["Total", String(t.count), fmtCurrency(t.gross), fmtCurrency(t.comped), fmtCurrency(t.facility),
    fmtCurrency(t.linen), fmtCurrency(t.product), fmtCurrency(t.eventFees), fmtCurrency(t.gratuity), fmtCurrency(t.net)]);
  pdf.table(rows, [78, 32, 54, 46, 52, 40, 46, 48, 54, 66], { right: [1, 2, 3, 4, 5, 6, 7, 8, 9], boldCols: [9], totalRow: true, fontSize: 8.5 });

  pdf.section("CHECKS");
  const compedCount = bookings.filter(function (b) {
    return b.notes.some(function (n) { return n.indexOf("COMPED") === 0; });
  }).length;
  const balanced = Math.abs(keeps - feesLessComps) < 0.01;
  pdf.para(balanced ? "Balanced: brought in minus paid out equals fees minus comps."
    : "DOES NOT BALANCE: brought in minus paid out is " + money(keeps) + " but fees minus comps is " + money(feesLessComps) + ". Check Transactions before relying on these numbers.",
    { size: 9.5, bold: true, color: balanced ? PDF_.green : PDF_.red, after: 3 });
  pdf.para(t.count + " booking(s) across " + computed.results.length + " practitioner(s); " + compedCount + " comped.", { size: 9.5, after: 3 });
  if (computed.skipped.length > 0) {
    pdf.para(computed.skipped.length + " row(s) on Transactions were left out of these totals (see the review summary or run 1 · Check this week's totals for details).", { size: 9.5, bold: true, color: PDF_.red, after: 3 });
  }
  if (computed.mismatches.length > 0) {
    pdf.para("The Net on Transactions disagrees with this report for: " + computed.mismatches.map(function (m) { return m.name; }).join(", ") + ".", { size: 9.5, bold: true, color: PDF_.red, after: 3 });
  }
  if (computed.outOfPeriod > 0) {
    pdf.note(computed.outOfPeriod + " row(s) dated outside this pay period are not included.", { italic: true });
  }

  doc.saveAndClose();
  const pdfBlob = DriveApp.getFileById(doc.getId()).getAs("application/pdf");
  pdfBlob.setName(fileName);
  const file = folder.createFile(pdfBlob);
  DriveApp.getFileById(doc.getId()).setTrashed(true);
  return file;
}

/**
 * Run once in a freshly made copy of a newer version. Reads an OLD sheet (never changes it) and brings
 * over the history (Archive, Payout History, Send Log) and the setup (Settings, Practitioners, Services,
 * Events, plus Period Start and Manager Email on Invoices). A tab whose headings differ from this version
 * is skipped and reported rather than pasted in misaligned. Weeks already present here are not added again.
 */
// A Flora popup with a link box: check the old sheet (shows what it found), then bring it over, then the result.
function bringOverFromOldSheet() {
  const html = HtmlService.createHtmlOutput(
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">' +
    '<style>body{margin:0;font:14px/1.5 "DM Sans",Arial,sans-serif;color:#2E2A2C}' +
    '.intro{background:#F7E4E9;border-radius:14px;padding:12px 14px;margin:0 0 14px}.intro b{color:#86304F}' +
    'label{display:block;font-weight:700;font-size:13px;margin:0 0 6px}' +
    'input{width:100%;box-sizing:border-box;min-height:44px;font:inherit;padding:0 12px;border:1px solid #D9CFC7;border-radius:10px}' +
    'button{min-height:44px;padding:0 18px;border-radius:10px;font:inherit;font-weight:700;cursor:pointer}' +
    '.go{border:none;background:#A13D63;color:#fff}.go:disabled{opacity:.6;cursor:default}.close{border:1px solid #D9CFC7;background:#fff}' +
    '.row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.box{display:none;border-radius:14px;padding:12px 14px;margin-top:14px}' +
    '.box .h{font-weight:700;font-size:16px;margin-bottom:6px}.box ul{margin:0;padding-left:18px}.box li{margin:3px 0;font-size:13px}' +
    '.info{background:#F4F0F2}.good{background:#E7F2EC}.good .h{color:#2F6B4F}.warn{background:#FFF3D6}.warn .h{color:#6A4A00}.bad{background:#FBE3E1}.bad .h{color:#9B2C22}</style>' +
    '<div class="intro"><b>Bring over data from an old sheet.</b><br>Paste the link to the OLD sheet (the one with the history). ' +
    'This sheet gets filled in from it; the old sheet is only read, never changed.</div>' +
    '<label for="u">Link to the old sheet</label><input id="u" placeholder="https://docs.google.com/spreadsheets/d/…">' +
    '<div class="row"><button class="go" id="check">Check this sheet</button><button class="go" id="bring" style="display:none">Bring it over</button>' +
    '<button class="close" onclick="google.script.host.close()">Close</button></div>' +
    '<div class="box" id="box" role="status" aria-live="polite"><div class="h" id="h"></div><ul id="list"></ul><div id="note" style="font-size:13px;margin-top:8px"></div></div>' +
    '<script>var u=document.getElementById("u"),c=document.getElementById("check"),b=document.getElementById("bring"),box=document.getElementById("box"),' +
    'h=document.getElementById("h"),list=document.getElementById("list"),note=document.getElementById("note");' +
    'function show(tone,head,lines,n){box.className="box "+tone;box.style.display="block";h.textContent=head;list.textContent="";' +
    '(lines||[]).forEach(function(l){var li=document.createElement("li");li.textContent=l;list.appendChild(li);});note.textContent=n||"";}' +
    'function fail(e){c.disabled=false;b.disabled=false;show("bad","Something went wrong",[],((e&&e.message)||e)+" Please screenshot this and send it to the developer.");}' +
    'c.onclick=function(){c.disabled=true;b.style.display="none";show("info","Checking…",[],"");' +
    'google.script.run.withSuccessHandler(function(r){c.disabled=false;if(!r.ok){show("warn",r.error,[],"");return;}' +
    'show("info","From “"+r.name+"”:",r.lines,"Settings, Practitioners, Services and Events in THIS sheet will be replaced by the old ones. Nothing in the old sheet changes.");' +
    'b.style.display="inline-block";}).withFailureHandler(fail).bringOverPreview(u.value);};' +
    'b.onclick=function(){b.disabled=true;c.disabled=true;b.textContent="Working…";' +
    'google.script.run.withSuccessHandler(function(r){b.style.display="none";c.disabled=false;if(!r.ok){show("warn",r.error,[],"");return;}' +
    'show("good","Done: brought over",r.lines,"Next: open Archive and Payout History and check the latest week looks right, then run Flora · Tools > Summary for a past week on it.");})' +
    '.withFailureHandler(fail).bringOverApply(u.value);};</script>'
  ).setWidth(540).setHeight(560);
  SpreadsheetApp.getUi().showModalDialog(html, "Bring over data from old sheet");
}

// Opens the old sheet from a pasted link. { old } or { error }.
function openOldSheet_(link) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const idMatch = String(link || "").match(/[-\w]{25,}/);
  if (!idMatch) return { error: "That doesn't look like a Google Sheets link. Copy the full address from the old sheet's browser tab." };
  if (idMatch[0] === ss.getId()) return { error: "That's this sheet. Paste the link to the OLD sheet." };
  try {
    return { old: SpreadsheetApp.openById(idMatch[0]) };
  } catch (e) {
    return { error: "Couldn't open that sheet. Make sure you're signed in to the Google account that can open it." };
  }
}

function bringOverPlans_(ss, old) {
  return {
    logPlans: [
      planLogImport_(ss, old, ARCHIVE_SHEET, ARCHIVE_HEADERS, getOrCreateArchiveSheet),
      planLogImport_(ss, old, HISTORY_SHEET, HISTORY_HEADERS, getOrCreateHistorySheet),
    ],
    sendPlan: planSendLogImport_(ss, old),
    setupPlans: SETUP_IMPORTS.map(function (spec) { return planSetupImport_(ss, old, spec); })
  };
}

// Called by the popup. Public (no trailing underscore) so it can be reached. Reads only.
function bringOverPreview(link) {
  ensureCapacity_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const o = openOldSheet_(link);
  if (o.error) return { ok: false, error: o.error };
  const p = bringOverPlans_(ss, o.old);
  const lines = [];
  p.logPlans.forEach(function (pl) { lines.push(pl.name + ": " + pl.summary); });
  lines.push(SEND_LOG_SHEET + ": " + p.sendPlan.summary);
  p.setupPlans.forEach(function (pl) { lines.push(pl.label + ": " + pl.summary); });
  return { ok: true, name: o.old.getName(), lines: lines };
}

// Called by the popup's "Bring it over" button. Plans again from scratch, then copies.
function bringOverApply(link) {
  ensureCapacity_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const o = openOldSheet_(link);
  if (o.error) return { ok: false, error: o.error };
  const p = bringOverPlans_(ss, o.old);
  const done = [];
  p.logPlans.forEach(function (pl) { done.push(pl.name + ": " + applyLogImport_(pl)); });
  done.push(SEND_LOG_SHEET + ": " + applySendLogImport_(ss, p.sendPlan));
  p.setupPlans.forEach(function (pl) { done.push(pl.label + ": " + applySetupImport_(pl)); });
  applySetupDropdowns_(ss);  // the brought-over rows get their dropdowns
  [ARCHIVE_SHEET, HISTORY_SHEET, SEND_LOG_SHEET].forEach(function (n) { const sh = ss.getSheetByName(n); if (sh) styleRecordsTabByName_(sh); });
  return { ok: true, lines: done };
}

// Typed-in setup that carries over. Blocks are [first row, first column, rows, columns]. Cells that hold
// a formula in this version (like Product Fee or an event's default fees) keep their formula unless the
// old sheet had a typed value there.
const SETUP_IMPORTS = [
  // Settings: matched row by row on the label in column A, so an added or reordered setting still lines up.
  { label: "Settings", sheet: "Settings", labelled: { labelCol: 1, valueCol: 2, firstRow: 4, numRows: 37 } },
  // Tables: matched column by column on their headings (see import_map.js).
  { label: "Practitioners", sheet: PRACTITIONERS_SHEET,
    table: { headerRow: 4, firstCol: 1, numCols: 6, firstRow: PRAC_FIRST_ROW, numRows: PRAC_LAST_ROW - PRAC_FIRST_ROW + 1 } },
  { label: "Services", sheet: SERVICES_SHEET,
    table: { headerRow: 4, firstCol: 1, numCols: 5, firstRow: SERVICES_FIRST_ROW, numRows: SERVICES_LAST_ROW - SERVICES_FIRST_ROW + 1 } },
  { label: "Service Types", sheet: SERVICES_SHEET,
    table: { headerRow: 4, firstCol: SVC_TYPES_COL, numCols: 3, firstRow: SVC_TYPES_FIRST_ROW, numRows: SVC_TYPES_LAST_ROW - SVC_TYPES_FIRST_ROW + 1 } },
  { label: "Events", sheet: EVENTS_SHEET,
    table: { headerRow: 6, firstCol: 1, numCols: 6, firstRow: EVENTS_FIRST_ROW, numRows: EVENTS_LAST_ROW - EVENTS_FIRST_ROW + 1 } },
  { label: "Event defaults", sheet: EVENTS_SHEET, headerRange: "A6:F6", blocks: [[4, 3, 1, 3]] },
  { label: "Invoices (Period Start)", sheet: INVOICES_SHEET, headerRange: "A4:A4", blocks: [[4, 3, 1, 1]] },
  // Found by name, so it copies across whether either sheet keeps it on Invoices (older) or on Settings (newer).
  { label: "Manager Email", namedRange: "ManagerEmail" },
];

function sameCells_(a, b) {
  return a.length === b.length && a.every(function (row, i) {
    return row.every(function (v, j) { return String(v).trim() === String(b[i][j]).trim(); });
  });
}

// The old sheet's heading row for a table: the row near the expected one whose headings match this
// version's best (an older copy may have an extra title row). Searched within a few columns either side.
function findOldTable_(src, t, newHeads) {
  const left = Math.max(1, t.firstCol - 2), width = t.numCols + 4;
  let best = { row: -1, score: 0, heads: [], left: left };
  for (let r = Math.max(1, t.headerRow - 3); r <= t.headerRow + 3; r++) {
    const heads = src.getRange(r, left, 1, width).getValues()[0];
    const score = mapColumns_(newHeads, heads).map.filter(function (i) { return i !== -1; }).length;
    if (score > best.score) best = { row: r, score: score, heads: heads, left: left };
  }
  return best;
}

function planSetupImport_(ss, old, spec) {
  if (spec.namedRange) {
    const o = old.getRangeByName(spec.namedRange), n = ss.getRangeByName(spec.namedRange);
    if (!o || !n) return { label: spec.label, summary: "not found in one of the sheets, skipped", skip: true };
    return { label: spec.label, summary: "will be copied", skip: false, srcCell: o, dstCell: n };
  }
  const src = old.getSheetByName(spec.sheet), dst = ss.getSheetByName(spec.sheet);
  if (!src || !dst) return { label: spec.label, summary: "not found in one of the sheets, skipped", skip: true };

  if (spec.labelled) {
    const L = spec.labelled;
    const newLabels = dst.getRange(L.firstRow, L.labelCol, L.numRows, 1).getValues().map(function (r) { return r[0]; });
    const oldBlock = src.getRange(L.firstRow, L.labelCol, L.numRows, L.valueCol - L.labelCol + 1).getValues();
    const oldByLabel = {};
    oldBlock.forEach(function (r) { const k = normHeading_(r[0]); if (k && !(k in oldByLabel)) oldByLabel[k] = r[L.valueCol - L.labelCol]; });
    const pairs = [], missing = [];
    newLabels.forEach(function (lab, i) {
      const k = normHeading_(lab);
      if (!k || k === "manageremail") return;  // the manager email is brought over by name, below
      if (k in oldByLabel) pairs.push({ row: L.firstRow + i, value: oldByLabel[k] });
      else missing.push(String(lab));
    });
    return { label: spec.label, skip: !pairs.length, dst: dst, labelledPairs: pairs, valueCol: L.valueCol,
      summary: pairs.length ? pairs.length + " setting(s) will be copied" + (missing.length ? "; not in the old sheet (left as is): " + missing.join(", ") : "")
        : "no matching settings found, skipped" };
  }

  if (spec.table) {
    const t = spec.table;
    const newHeads = dst.getRange(t.headerRow, t.firstCol, 1, t.numCols).getValues()[0];
    const found = findOldTable_(src, t, newHeads);
    if (found.row === -1) return { label: spec.label, summary: "SKIPPED: couldn't find matching column headings in the old sheet", skip: true };
    const m = mapColumns_(newHeads, found.heads);
    const plan = { label: spec.label, skip: false, src: src, dst: dst, table: t, oldHeaderRow: found.row, oldLeft: found.left, map: m.map };
    const oldRows = src.getRange(found.row + 1, found.left, t.numRows, found.heads.length).getValues();
    const rows = oldRows.filter(function (r) { return m.map.some(function (o) { return o !== -1 && String(r[o]).trim() !== ""; }); }).length;
    plan.summary = rows + " row(s) will be copied" +
      (m.missing.length ? "; not in the old sheet (left as is): " + m.missing.join(", ") : "") +
      (m.unused.length ? "; old columns with no place here: " + m.unused.join(", ") : "");
    return plan;
  }

  if (!sameCells_(src.getRange(spec.headerRange).getValues(), dst.getRange(spec.headerRange).getValues())) {
    return { label: spec.label, summary: "SKIPPED: its headings differ from this version's, so copy it by hand", skip: true };
  }
  return { label: spec.label, summary: "will be replaced with the old sheet's", skip: false, src: src, dst: dst, blocks: spec.blocks };
}

function applySetupImport_(plan) {
  if (plan.skip) return plan.summary;
  if (plan.srcCell) {
    const v = plan.srcCell.getValue();
    if (String(v).trim() === "") return "the old sheet had none, left as is";
    plan.dstCell.setValue(v);
    return "copied";
  }
  if (plan.labelledPairs) {
    plan.labelledPairs.forEach(function (p) { plan.dst.getRange(p.row, plan.valueCol).setValue(p.value); });
    return plan.labelledPairs.length + " setting(s) copied";
  }
  if (plan.table) {
    const t = plan.table;
    const n = plan.dst.getRange(t.firstRow, t.firstCol, t.numRows, t.numCols);
    const o = plan.src.getRange(plan.oldHeaderRow + 1, plan.oldLeft, t.numRows, t.numCols + 4);
    const merged = mergeTable_(n.getValues(), n.getFormulas(), o.getValues(), o.getFormulas(), plan.map);
    n.setValues(merged.values);
    return merged.rowsWithData + " row(s) copied";
  }
  plan.blocks.forEach(function (b) {
    const o = plan.src.getRange(b[0], b[1], b[2], b[3]), n = plan.dst.getRange(b[0], b[1], b[2], b[3]);
    const oldValues = o.getValues(), oldFormulas = o.getFormulas(), newFormulas = n.getFormulas();
    n.setValues(oldValues.map(function (row, i) {
      return row.map(function (v, j) {
        const keepFormula = newFormulas[i][j] !== "" && (oldFormulas[i][j] !== "" || v === "");
        return keepFormula ? newFormulas[i][j] : v;
      });
    }));
  });
  return "copied";
}

function readLogRows_(sheet, nCols) {
  const last = sheet.getLastRow();
  if (last <= LOG_HEADER_ROW) return [];
  return sheet.getRange(LOG_HEADER_ROW + 1, 1, last - LOG_HEADER_ROW, nCols).getValues()
    .filter(function (r) { return r[0] instanceof Date; });
}

// Archive and Payout History: add whole weeks that this sheet doesn't have yet.
function planLogImport_(ss, old, name, headers, getTarget) {
  const src = old.getSheetByName(name);
  if (!src) return { name: name, rows: [], summary: "not in the old sheet, nothing to bring over" };
  if (!logHeadersMatch_(src, headers)) {
    return { name: name, rows: [], summary: "SKIPPED: its column headings differ from this version's, so copy it by hand (values only, from row 5)" };
  }
  const target = getTarget(ss);
  const have = {};
  readLogRows_(target, headers.length).forEach(function (r) { have[fmtDate(r[0])] = true; });
  const rows = [], newWeeks = {}, skippedWeeks = {};
  readLogRows_(src, headers.length).forEach(function (r) {
    const week = fmtDate(r[0]);
    if (have[week]) { skippedWeeks[week] = true; } else { rows.push(r); newWeeks[week] = true; }
  });
  const nNew = Object.keys(newWeeks).length, nSkip = Object.keys(skippedWeeks).length;
  return { name: name, target: target, rows: rows, headers: headers,
    summary: rows.length + " row(s) from " + nNew + " week(s) will be added" + (nSkip ? " (" + nSkip + " week(s) already here, skipped)" : "") };
}

function applyLogImport_(plan) {
  if (plan.rows.length === 0) return "nothing added";
  const start = nextLogRow_(plan.target), n = plan.rows.length;
  plan.target.getRange(start, 1, n, plan.headers.length).setValues(plan.rows);
  plan.target.getRange(start, 1, n, 2).setNumberFormat("mm/dd/yyyy");
  if (plan.name === ARCHIVE_SHEET) {
    plan.target.getRange(start, 7, n, 9).setNumberFormat(CURRENCY_FMT);
    plan.target.getRange(start, 19, n, 1).setNumberFormat("mm/dd/yyyy hh:mm");
  } else {
    plan.target.getRange(start, 5, n, 8).setNumberFormat(CURRENCY_FMT);
    plan.target.getRange(start, 13, n, 1).setNumberFormat("mm/dd/yyyy hh:mm");
  }
  return n + " row(s) added";
}

// Send Log: carries over so a mid-period switch can't email anyone twice.
function planSendLogImport_(ss, old) {
  const header = ["Sent On", "Period Start", "Practitioner", "Email", "Status"];
  const src = old.getSheetByName(SEND_LOG_SHEET);
  if (!src || src.getLastRow() < 2) return { rows: [], summary: "none in the old sheet, nothing to bring over" };
  if (!sameCells_(src.getRange(1, 1, 1, 5).getValues(), [header])) {
    return { rows: [], summary: "SKIPPED: its headings differ from this version's" };
  }
  const key = function (r) { return [r[1], r[2], String(r[3]).toLowerCase(), r[4]].join("|"); };
  const here = ss.getSheetByName(SEND_LOG_SHEET);
  const have = {};
  if (here && here.getLastRow() > 1) here.getRange(2, 1, here.getLastRow() - 1, 5).getValues().forEach(function (r) { have[key(r)] = true; });
  const rows = src.getRange(2, 1, src.getLastRow() - 1, 5).getValues().filter(function (r) { return r[2] && !have[key(r)]; });
  return { rows: rows, summary: rows.length + " record(s) will be added" };
}

function applySendLogImport_(ss, plan) {
  if (plan.rows.length === 0) return "nothing added";
  const log = getSendLog_(ss);
  log.getRange(log.getLastRow() + 1, 1, plan.rows.length, 5).setValues(plan.rows);
  return plan.rows.length + " record(s) added";
}

function buildInvoicePdf(folder, businessName, businessAddress, practitionerName, periodStart, periodEnd, lineItems,
  facilityFeePercent, grossTotal, facilityFeeTotal, productFeeTotal, productCount, productRate,
  linenTotal, linenCount, linenRate, eventTotals, gratuityTotal, netAmount) {

  const doc = DocumentApp.create("TEMP - " + practitionerName + " Invoice");
  const body = doc.getBody();
  body.clear();
  const pdf = floraPdf_(body);

  const ITEM_COLS = ["Date", "Service", "Price", "Facility fee", "Linen", "Gratuity", "Payout"];
  const ITEM_WIDTHS = [50, 166, 58, 68, 52, 58, 64];            // adds up to 516
  // Event tables add a per-treatment Service Fee column.
  const EVENT_COLS = ["Date", "Service", "Price", "Facility fee", "Linen", "Service fee", "Gratuity", "Payout"];
  const EVENT_WIDTHS = [46, 132, 54, 62, 48, 58, 56, 60];      // adds up to 516

  // Builds the line-item table; used for regular bookings and again for each event.
  function appendItemsTable(items, withServiceFee, travel) {
    const rows = [withServiceFee ? EVENT_COLS : ITEM_COLS];
    items.forEach(function (item) {
      const row = [
        fmtDateShort(item.date),
        item.service + (item.productFee > 0 ? " (less " + fmtCurrency(item.productFee) + " product fee)" : ""),
        fmtCurrency(item.price),
        "−" + fmtCurrency(item.facilityFee),
        item.linenFee > 0 ? "−" + fmtCurrency(item.linenFee) : "—",
      ];
      if (withServiceFee) row.push(item.convenience > 0 ? "+" + fmtCurrency(item.convenience) : "—");
      row.push(item.gratAmt > 0 ? "+" + fmtCurrency(item.gratAmt) : "—");
      row.push(fmtCurrency(item.payout));
      rows.push(row);
    });
    if (travel > 0) rows.push(["", "Travel (once for this event)", "", "", "", "", "", fmtCurrency(travel)]);
    const last = rows[0].length - 1;
    const right = [];
    for (let c = 2; c <= last; c++) right.push(c);
    pdf.table(rows, withServiceFee ? EVENT_WIDTHS : ITEM_WIDTHS, { right: right, muted: [3, 4], boldCols: [last] });
  }

  // ---- header, key facts and the payout itself, up top ----
  pdf.band(String(businessName), "INVOICE OF SERVICES RENDERED", businessAddress ? String(businessAddress) : "");
  pdf.info([["PRACTITIONER", practitionerName], ["PAY PERIOD", fmtPeriod_(periodStart, periodEnd)], ["BOOKINGS", String(lineItems.length)]]);
  pdf.hero("NET PAYOUT", "Services, less fees, plus gratuity and bonuses", fmtCurrency(netAmount));

  // ---- regular (non-event) bookings ----
  const regularItems = lineItems.filter(function (item) { return !item.eventName; });
  if (regularItems.length > 0) {
    pdf.section("SERVICES");
    appendItemsTable(regularItems, false);
  }

  // ---- one heading and table per event, ending with a Travel line so the Payout column adds up to Net payout. ----
  const eventNames = Object.keys(eventTotals);
  eventNames.forEach(function (name) {
    pdf.section("EVENT · " + String(name).toUpperCase());
    appendItemsTable(lineItems.filter(function (item) { return item.eventName === name; }), true, eventTotals[name].travel);
  });

  // ---- summary ledger: fees shown as minus (muted); money added to the payout is labeled "Bonus", not "Fee" ----
  pdf.section("SUMMARY");
  const travelBonusTotal = eventNames.reduce(function (sum, name) { return sum + eventTotals[name].travel; }, 0);
  const serviceFeeBonusTotal = eventNames.reduce(function (sum, name) { return sum + eventTotals[name].convenience; }, 0);
  const ledgerRows = [["Gross service revenue", fmtCurrency(grossTotal), ""]];
  ledgerRows.push(["Facility fee (" + (facilityFeePercent * 100).toFixed(1) + "%)", "−" + fmtCurrency(facilityFeeTotal), "fee"]);
  if (linenCount > 0) ledgerRows.push(["Linen fee: " + linenCount + " × " + fmtCurrency(linenRate), "−" + fmtCurrency(linenTotal), "fee"]);
  if (productCount > 0) ledgerRows.push(["Product fee: " + productCount + " × " + fmtCurrency(productRate), "−" + fmtCurrency(productFeeTotal), "fee"]);
  if (travelBonusTotal > 0) ledgerRows.push(["Travel bonus", "+" + fmtCurrency(travelBonusTotal), ""]);
  if (serviceFeeBonusTotal > 0) ledgerRows.push(["Event service fee bonus", "+" + fmtCurrency(serviceFeeBonusTotal), ""]);
  if (gratuityTotal > 0) ledgerRows.push(["Gratuity", "+" + fmtCurrency(gratuityTotal), ""]);
  pdf.ledger(ledgerRows, "Net payout", fmtCurrency(netAmount));

  pdf.footer("For your own records: self-employment income and expenses.");

  doc.saveAndClose();

  const pdfBlob = DriveApp.getFileById(doc.getId()).getAs("application/pdf");
  pdfBlob.setName(practitionerName + " - Invoice - " + fmtDate(periodStart, "-") + ".pdf");
  trashFilesNamed_(folder, pdfBlob.getName());
  folder.createFile(pdfBlob);

  DriveApp.getFileById(doc.getId()).setTrashed(true);
  return pdfBlob;
}

function getOrCreateFolder(name) {
  const existing = DriveApp.getFoldersByName(name);
  if (existing.hasNext()) return existing.next();
  return DriveApp.createFolder(name);
}

function fmtDate(date, sep) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "MM" + (sep || "/") + "dd" + (sep || "/") + "yyyy");
}

// Display-only variants. fmtDate stays numeric because it also builds Drive folder and file names.
function fmtDateLong(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "MMMM d, yyyy");
}
function fmtDateShort(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "MMM d");
}

function fmtCurrency(n) {
  const v = Number(n) || 0;
  return "$" + v.toFixed(2);
}