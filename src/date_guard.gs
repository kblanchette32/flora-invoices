// =====================================================================================
// TRANSACTIONS DATE GUARD
//
// Typing is checked by the Date column's rule, but a paste skips it. So on every edit of the Date
// column (Transactions A, rows TXN_FIRST_ROW to TXN_LAST_ROW):
//   - text that reads as a date ("Nov 21", "11-21-26", "21/11/2026") becomes a real date
//   - text that can't be read gets a note saying so
//   - a date outside this pay week gets a note; if swapping day and month would put it inside the
//     week, the note says that too (the usual sign of a day-first date). The date itself isn't changed.
// Notes this guard writes start with DATE_NOTE_PREFIX, and only those are ever cleared.
// =====================================================================================

const DATE_NOTE_PREFIX = "Date check: ";

function guardTxnDates_(e) {
  const range = e.range, sheet = range.getSheet();
  if (sheet.getName() !== TXN_SHEET || range.getColumn() > 1) return;
  const first = Math.max(range.getRow(), TXN_FIRST_ROW), last = Math.min(range.getLastRow(), TXN_LAST_ROW);
  if (first > last) return;

  const ss = sheet.getParent();
  const startCell = ss.getSheetByName(INVOICES_SHEET).getRange(PERIOD_START_CELL).getValue();
  const weekStart = startCell instanceof Date ? startOfDay_(startCell) : null;
  const cells = sheet.getRange(first, 1, last - first + 1, 1);
  const values = cells.getValues(), notes = cells.getNotes();
  const toasts = [];
  let changed = false;

  values.forEach(function (row, i) {
    const v = row[0];
    let note = "";
    if (v === "" || v === null) {
      note = "";
    } else {
      const parsed = parsePeriodInput_(v, weekStart || new Date());
      if (!parsed) {
        note = "\"" + String(v).slice(0, 30) + "\" can't be read as a date. Type it as month/day/year, like 11/20/2026, or double-click for a calendar.";
        toasts.push("Row " + (first + i) + ": can't read \"" + String(v).slice(0, 20) + "\" as a date.");
      } else {
        const d = startOfDay_(parsed.date);
        if (!(v instanceof Date) || d.getTime() !== v.getTime()) { row[0] = d; changed = true; }
        note = dateWeekNote_(d, weekStart);
        if (note) toasts.push("Row " + (first + i) + ": " + note);
      }
    }
    const mine = String(notes[i][0]).indexOf(DATE_NOTE_PREFIX) === 0;
    if (note) notes[i][0] = DATE_NOTE_PREFIX + note;
    else if (mine) notes[i][0] = "";
  });

  if (changed) { cells.setValues(values); cells.setNumberFormat("mm/dd/yyyy"); }
  cells.setNotes(notes);
  if (toasts.length) {
    ss.toast(toasts.slice(0, 3).join("\n") + (toasts.length > 3 ? "\n…and " + (toasts.length - 3) + " more (see the notes in the Date column)." : ""),
      "Check the date", 12);
  }
}

// "" when the date is inside the pay week (or there's no valid week to compare with), otherwise a short note.
function dateWeekNote_(d, weekStart) {
  if (!weekStart) return "";
  const end = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  if (d >= weekStart && d <= end) return "";
  const label = function (x) { return fmtDateShort(x) + ", " + x.getFullYear(); };
  const day = d.getDate(), month = d.getMonth() + 1;
  if (day <= 12 && day !== month) {
    const swapped = new Date(d.getFullYear(), day - 1, month);
    if (swapped >= weekStart && swapped <= end) {
      return "This reads as " + label(d) + ", outside this pay week. Did you mean " + label(swapped) + "? Dates are month/day/year.";
    }
  }
  return "This is " + label(d) + ", outside this pay week (" + fmtDateShort(weekStart) + " to " + fmtDateShort(end) + "). Fine if it belongs to another week.";
}

// Start next week clears the bookings; this clears the guard's own notes with them (other notes stay).
function clearDateCheckNotes_(range) {
  const notes = range.getNotes();
  let any = false;
  notes.forEach(function (r) { if (String(r[0]).indexOf(DATE_NOTE_PREFIX) === 0) { r[0] = ""; any = true; } });
  if (any) range.setNotes(notes);
}
