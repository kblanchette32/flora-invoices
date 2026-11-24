// =====================================================================================
// PERIOD START GUARD  (the "bouncer" for Invoices C4)
//
// Every menu step depends on Invoices C4 holding a real date that is a Friday. Validation
// only guards typing: a paste skips it, and can even wipe the rule. So instead of turning a
// bad entry away, this fixes it on the spot:
//   - a real date            -> snapped back to the Friday that starts its pay week
//   - text that reads as one -> turned into a real date, then snapped
//   - gibberish or deleted   -> the last good Friday is put back
// and it always re-applies the cell's rule and format, then says what happened in a small
// corner message (a toast) that doesn't block anything.
//
// Called from onEdit in payout_tools.js. Start New Week calls rememberPeriodStart_ too.
// The pure date helpers at the bottom have no Google calls, so they can be tested in Node.
// =====================================================================================

const LAST_GOOD_PERIOD_KEY = "LAST_GOOD_PERIOD_START";
const PERIOD_FAR_DAYS = 21;  // more than this from today gets a "double-check" note

function guardPeriodStart_(e) {
  const range = e.range;
  const sheet = range.getSheet();
  if (sheet.getName() !== INVOICES_SHEET) return;
  const cell = sheet.getRange(PERIOD_START_CELL);
  // A paste over a bigger block can include C4 without starting at it.
  if (range.getRow() > cell.getRow() || range.getLastRow() < cell.getRow() ||
      range.getColumn() > cell.getColumn() || range.getLastColumn() < cell.getColumn()) return;

  const ss = sheet.getParent();
  const value = cell.getValue();
  const today = new Date();
  const parsed = parsePeriodInput_(value, today);

  let friday, msg;
  if (parsed) {
    friday = fridayOnOrBefore_(parsed.date);
    const moved = friday.getTime() !== startOfDay_(parsed.date).getTime();
    msg = "Period start set to " + fmtDateLong_(friday) + "." +
      (moved ? " (Pay weeks start on a Friday, so " + fmtDateLong_(parsed.date) + " was moved back to it.)" : "") +
      (parsed.swapped ? " That date was read day-first." : "");
  } else {
    friday = lastGoodPeriodStart_(today);
    msg = (value === "" ? "The period start can't be left empty" : "\"" + String(value).slice(0, 30) + "\" isn't a date") +
      ", so it was put back to " + fmtDateLong_(friday) + ". Type a date like 11/20/2026, or double-click the cell for a calendar.";
  }
  if (Math.abs(friday - startOfDay_(today)) > PERIOD_FAR_DAYS * 86400000) {
    msg += " That's more than 3 weeks from today, so double-check it's the week you meant.";
  }

  cell.setValue(friday);
  cell.setNumberFormat("mm/dd/yyyy");
  cell.setDataValidation(periodStartRule_());
  rememberPeriodStart_(friday);
  ss.toast(msg, "Invoice Period Start", 10);
}

// The Friday-only rule for C4. Warn-only (not "reject"): a typed Thursday is let in and the
// guard above corrects it, instead of a blocking popup turning the user away.
function periodStartRule_() {
  const rule = '=AND(ISNUMBER(' + PERIOD_START_CELL + '),WEEKDAY(' + PERIOD_START_CELL + ')=6)';
  return SpreadsheetApp.newDataValidation().requireFormulaSatisfied(rule).setAllowInvalid(true)
    .setHelpText("The Friday a pay week starts on. Type any date in that week, like 11/20/2026, and it moves to the Friday by itself. " +
      "Double-click for the calendar. After Start next week this moves forward by itself.")
    .build();
}

function rememberPeriodStart_(date) {
  try {
    PropertiesService.getDocumentProperties().setProperty(LAST_GOOD_PERIOD_KEY, String(startOfDay_(date).getTime()));
  } catch (ignore) { /* remembering is a nice-to-have; never block the edit */ }
}

// The last Friday the guard or Start New Week saw; failing that, this week's Friday.
function lastGoodPeriodStart_(today) {
  try {
    const raw = PropertiesService.getDocumentProperties().getProperty(LAST_GOOD_PERIOD_KEY);
    if (raw && !isNaN(Number(raw))) return fridayOnOrBefore_(new Date(Number(raw)));
  } catch (ignore) { /* fall through */ }
  return fridayOnOrBefore_(today);
}

function fmtDateLong_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "EEEE, MMM d, yyyy");
}

// ---------------------------------------------------------------- pure helpers (no Google calls)

// Friday = 5. Pay weeks run Friday to Thursday, so any day maps back to its week's Friday.
function fridayOnOrBefore_(d) {
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  day.setDate(day.getDate() - ((day.getDay() - 5 + 7) % 7));
  return day;
}

const MONTHS_ = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/**
 * Reads whatever ended up in the cell. Returns {date, swapped} or null when it can't be a date.
 * Accepts: a real Date; a bare date serial number (a paste that lost its format); text like
 * 11/20/2026, 11-20-26, 2026-11-20, Nov 20, November 20 2026, 20 Nov 2026, Fri Nov 20.
 * Month-first like the rest of the sheet; 20/11/2026 can only be day-first, so it's read that
 * way and flagged. A missing year means the one that puts the date closest to today.
 */
function parsePeriodInput_(v, today) {
  if (v instanceof Date && !isNaN(v.getTime())) return { date: v, swapped: false };
  if (typeof v === "number" && v > 30000 && v < 80000) {   // Sheets day count from 12/30/1899
    const d = new Date(1899, 11, 30);
    d.setDate(d.getDate() + Math.floor(v));
    return { date: d, swapped: false };
  }
  const s = String(v == null ? "" : v).trim().toLowerCase()
    .replace(/(\d)(st|nd|rd|th)\b/g, "$1").replace(/[,.]/g, " ").replace(/\s+/g, " ");
  if (!s) return null;

  let m, y, mo, d, swapped = false;
  if ((m = s.match(/^(\d{4})[-\/ ](\d{1,2})[-\/ ](\d{1,2})$/))) {          // 2026-11-20
    y = +m[1]; mo = +m[2]; d = +m[3];
  } else if ((m = s.match(/^(\d{1,2})[-\/ ](\d{1,2})(?:[-\/ ](\d{2,4}))?$/))) {  // 11/20/2026, 11/20
    mo = +m[1]; d = +m[2]; y = m[3] ? +m[3] : null;
    if (mo > 12 && d <= 12) { const t = mo; mo = d; d = t; swapped = true; }
  } else {
    const words = s.replace(/^(mon|tue|wed|thu|fri|sat|sun)[a-z]* /, "");
    if ((m = words.match(/^([a-z]{3,})\s(\d{1,2})(?:\s(\d{2,4}))?$/))) {    // nov 20 2026
      mo = MONTHS_.indexOf(m[1].slice(0, 3)) + 1; d = +m[2]; y = m[3] ? +m[3] : null;
    } else if ((m = words.match(/^(\d{1,2})\s([a-z]{3,})(?:\s(\d{2,4}))?$/))) { // 20 nov 2026
      d = +m[1]; mo = MONTHS_.indexOf(m[2].slice(0, 3)) + 1; y = m[3] ? +m[3] : null;
    } else {
      return null;
    }
  }
  if (!(mo >= 1 && mo <= 12 && d >= 1 && d <= 31)) return null;
  if (y != null && y < 100) y += 2000;
  if (y == null) {
    // Closest to today: Dec 30 typed in early January means last year.
    y = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1]
      .map(function (yr) { return { yr: yr, gap: Math.abs(new Date(yr, mo - 1, d) - today) }; })
      .sort(function (a, b) { return a.gap - b.gap; })[0].yr;
  }
  const date = new Date(y, mo - 1, d);
  if (date.getMonth() !== mo - 1 || date.getDate() !== d) return null;  // e.g. Feb 31
  return { date: date, swapped: swapped };
}

// Lets the Node checks load the pure helpers; Apps Script has no `module`, so this is skipped there.
if (typeof module !== "undefined") module.exports = { parsePeriodInput_: parsePeriodInput_, fridayOnOrBefore_: fridayOnOrBefore_ };
