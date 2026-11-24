// =====================================================================================
// MANAGER EMAIL LIVES ON SETTINGS  (moves itself, once)
//
// The manager email is set once, so it belongs on Settings with the business name, address, payout %
// and linen fee, not on Invoices beside this week's date. Older sheets kept it on Invoices. When such a
// sheet is opened, onOpen quietly moves it: the email goes to the next free row under Settings (label in
// A, email in B), the "ManagerEmail" name is pointed at the new cell (everything in the script finds the
// email by that name), and the old cells are cleared. There is no button: it happens once, by itself.
// It never overwrites anything; if Settings has no free row it leaves things as they are and the
// Health Check says so.
// =====================================================================================

const SETTINGS_SHEET = "Settings";

// "the Settings tab" / "the Invoices tab": wherever the ManagerEmail cell is right now.
function managerEmailWhere_(ss) {
  const r = ss.getRangeByName("ManagerEmail");
  return r ? "the " + r.getSheet().getName() + " tab" : "the Settings tab";
}

// Returns "moved", "already", or a short reason it couldn't. Safe to call on every open.
function moveManagerEmailToSettings_(ss) {
  const oldCell = ss.getRangeByName("ManagerEmail");
  const settings = ss.getSheetByName(SETTINGS_SHEET);
  if (!oldCell || !settings) return "no Manager Email cell or no Settings tab";
  if (oldCell.getSheet().getName() === SETTINGS_SHEET) return "already";

  // The settings list is labels in A, values in B, from row 4. Use the first row after it that's empty in both.
  const block = settings.getRange(4, 1, 40, 2).getValues();
  let free = -1;
  for (let i = 0; i < block.length; i++) {
    if (String(block[i][0]).trim() === "" && String(block[i][1]).trim() === "") { free = 4 + i; break; }
  }
  if (free === -1) return "Settings has no empty row in columns A and B";

  const email = oldCell.getValue();
  const oldSheet = oldCell.getSheet();
  const oldLabel = oldSheet.getRange(oldCell.getRow(), 1);
  const label = settings.getRange(free, 1), value = settings.getRange(free, 2);
  if (free > 4) {  // look like the row above
    settings.getRange(free - 1, 1).copyTo(label, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    settings.getRange(free - 1, 2).copyTo(value, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  }
  label.setValue("Manager Email");
  value.setNumberFormat("@").setValue(email);
  ss.setNamedRange("ManagerEmail", value);

  oldCell.clearContent().clearDataValidations();
  if (/manager/i.test(String(oldLabel.getValue()))) oldLabel.clearContent();
  tidyOldManagerEmailRow_(oldSheet, oldCell.getRow(), oldCell.getColumn());
  return "moved";
}

// The emptied label and email cells keep their box (borders, fill) unless the formatting goes too.
// Only cells that are completely empty are touched, so nothing typed or calculated is ever lost.
function tidyOldManagerEmailRow_(sheet, row, lastCol) {
  // A merged box can reach past the email cell; take in the whole merge, or Sheets refuses to break it apart.
  sheet.getRange(row, 1, 1, lastCol).getMergedRanges().forEach(function (m) {
    if (m.getRow() === row && m.getNumRows() === 1) lastCol = Math.max(lastCol, m.getLastColumn());
  });
  const r = sheet.getRange(row, 1, 1, lastCol);
  const empty = r.getValues()[0].every(function (v) { return v === ""; }) &&
    r.getFormulas()[0].every(function (f) { return f === ""; });
  if (!empty) return false;
  r.breakApart().clearFormat().clearDataValidations().clearNote();
  return true;
}

const OLD_EMAIL_ROW_TIDIED_KEY = "OLD_MANAGER_EMAIL_ROW_TIDIED";

// From onOpen: move it if needed, and say so in a small corner note. Never blocks opening the sheet.
function moveManagerEmailOnOpen_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const result = moveManagerEmailToSettings_(ss);
    if (result === "moved") {
      ss.toast("The manager email now lives on the Settings tab with your other settings. Nothing else changed.", "Settings", 8);
    }
    // Sheets moved by version 2026-11-22v-x kept an empty box where the email used to be (Invoices row 6). Once only.
    const props = PropertiesService.getDocumentProperties();
    if (result !== "moved" && !props.getProperty(OLD_EMAIL_ROW_TIDIED_KEY)) {
      const r = ss.getRangeByName("ManagerEmail");
      const inv = ss.getSheetByName(INVOICES_SHEET);
      if (r && inv && r.getSheet().getName() === SETTINGS_SHEET) tidyOldManagerEmailRow_(inv, 6, 3);
      props.setProperty(OLD_EMAIL_ROW_TIDIED_KEY, "1");
    } else if (result === "moved") {
      props.setProperty(OLD_EMAIL_ROW_TIDIED_KEY, "1");
    }
  } catch (err) { recordError_("Move manager email to Settings", err); }
}
