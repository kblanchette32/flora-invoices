// =====================================================================================
// E-TRANSFER CHECKLIST TAB
//
// The E-Transfer notes popup disappears as soon as the manager switches to a banking app, and popups
// don't exist in the Sheets app on an iPad or phone. So the popup can also write the same list to
// an "E-Transfers" tab: one row per payment with a Paid tick box, the email, the amount and the
// message. A tab stays put, works in the Sheets app, and any cell can be tapped and copied.
// Making it again for the same week keeps the Paid ticks already there.
// =====================================================================================

const ETRANSFER_SHEET = "E-Transfers";
const ETRANSFER_HEADER_ROW = 4;

// One entry per practitioner being paid: { name, email, amount (number), amountText, note, shortened }.
function eTransferCards_(ss, range, computed) {
  const emails = {};
  ss.getSheetByName(PRACTITIONERS_SHEET).getRange(PRAC_FIRST_ROW, 1, PRAC_LAST_ROW - PRAC_FIRST_ROW + 1, 5).getValues()
    .forEach(function (r) { if (r[0]) emails[String(r[0])] = String(r[4] || "").trim(); });
  const businessName = String(ss.getRangeByName("BusinessName").getValue());
  return computed.results.map(function (res) {
    const note = buildETransferNote_(res, range.periodStart, range.periodEnd, businessName);
    return { name: String(res.name), email: emails[res.name] || "", amount: res.netAmount, amountText: fmtCurrency(res.netAmount),
      note: note.text, shortened: note.shortened };
  });
}

// Called from the button in the E-Transfer notes popup.
function makeETransferChecklist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const range = getPeriodRange_(ss.getSheetByName(INVOICES_SHEET), ui);
  if (!range) return;
  const computed = computePeriodResults_(ss, range.periodStart, range.periodEnd);
  if (!computed.results.length) {
    floraAlert_("No invoiced bookings between " + fmtDate(range.periodStart) + " and " + fmtDate(range.periodEnd) + ", so there's nothing to pay.", "warn");
    return;
  }
  const cards = eTransferCards_(ss, range, computed);
  const sh = writeETransferTab_(ss, range, cards);
  markStepDone_("5");
  ss.setActiveSheet(sh);
  ss.toast("Tick Paid as you go. Tap a cell to copy it into your banking app. This tab also works in the Sheets app on an iPad or phone.",
    "E-Transfers checklist ready", 10);
}

function writeETransferTab_(ss, range, cards) {
  const weekKey = fmtDate(range.periodStart);
  let sh = ss.getSheetByName(ETRANSFER_SHEET);

  // Same week again: keep the Paid ticks already made (matched by practitioner and amount).
  const paid = {};
  if (sh && sh.getRange("A1").getNote() === weekKey && sh.getLastRow() > ETRANSFER_HEADER_ROW) {
    sh.getRange(ETRANSFER_HEADER_ROW + 1, 1, sh.getLastRow() - ETRANSFER_HEADER_ROW, 4).getValues().forEach(function (r) {
      if (r[0] === true) paid[String(r[1]) + "|" + Number(r[3]).toFixed(2)] = true;
    });
  }
  if (!sh) {
    sh = ss.insertSheet(ETRANSFER_SHEET, Math.min(ss.getSheets().length, ss.getSheetByName(INVOICES_SHEET).getIndex()));
  }
  sh.clear();
  sh.getRange(1, 1, Math.max(sh.getMaxRows(), 1), 1).removeCheckboxes();
  sh.setHiddenGridlines(true).setTabColor(COLOR_PRIMARY);

  sh.getRange("A1").setValue("E-Transfers · " + fmtDateLong(range.periodStart) + " to " + fmtDateLong(range.periodEnd))
    .setNote(weekKey).setFontSize(16).setFontWeight("bold").setFontColor(COLOR_PRIMARY);
  sh.getRange("A2").setValue("Tick Paid as you go. Tap a cell and copy it into your banking app. " +
    "This list stays here until you make next week's, and works in the Sheets app on an iPad too.")
    .setFontColor(COLOR_MUTED).setFontSize(10);

  const head = ["Paid", "Practitioner", "Send to (email)", "Amount", "Message (copy into the e-Transfer)"];
  sh.getRange(ETRANSFER_HEADER_ROW, 1, 1, head.length).setValues([head])
    .setBackground(COLOR_PRIMARY).setFontColor("#FFFFFF").setFontWeight("bold").setVerticalAlignment("middle");
  sh.setRowHeight(ETRANSFER_HEADER_ROW, 34);

  const rows = cards.map(function (c) {
    return [!!paid[c.name + "|" + Number(c.amount).toFixed(2)], c.name, c.email || "(no email on file)", c.amount, c.note];
  });
  const body = sh.getRange(ETRANSFER_HEADER_ROW + 1, 1, rows.length, head.length);
  body.setValues(rows).setVerticalAlignment("middle").setFontSize(11)
    .setBorder(null, null, true, null, null, true, "#E6D3DA", SpreadsheetApp.BorderStyle.SOLID);
  sh.getRange(ETRANSFER_HEADER_ROW + 1, 1, rows.length, 1).insertCheckboxes().setHorizontalAlignment("center");
  sh.getRange(ETRANSFER_HEADER_ROW + 1, 4, rows.length, 1).setNumberFormat(CURRENCY_FMT).setFontWeight("bold")
    .setHorizontalAlignment("center");  // centred, so it doesn't butt up against the message
  sh.getRange(ETRANSFER_HEADER_ROW + 1, 5, rows.length, 1).setWrap(true);
  sh.setRowHeights(ETRANSFER_HEADER_ROW + 1, rows.length, 56);
  cards.forEach(function (c, i) {
    if (!c.email) sh.getRange(ETRANSFER_HEADER_ROW + 1 + i, 3).setFontColor("#9B2C22");
  });

  // A paid row turns soft green, so what's left stands out.
  const ruleRange = sh.getRange(ETRANSFER_HEADER_ROW + 1, 1, rows.length, head.length);
  sh.setConditionalFormatRules([SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=$A" + (ETRANSFER_HEADER_ROW + 1) + "=TRUE")
    .setBackground("#E7F2EC").setFontColor("#2F6B4F").setRanges([ruleRange]).build()]);

  [64, 150, 220, 100, 420].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  sh.setFrozenRows(ETRANSFER_HEADER_ROW);
  return sh;
}
