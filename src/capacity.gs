// =====================================================================================
// ROOM TO GROW  (one-time, automatic)
//
// Older sheets were built for 96 bookings a week, 50 practitioners, 116 services, 26 service types
// and 36 events. The script now allows 500 / 100 / 396 / 56 / 94 rows (see the *_LAST_ROW constants).
// The first time any Flora step or the panel runs after the update, ensureCapacity_ grows the sheet
// to match, once:
//   1. makes room below each table (inserting rows if anything sits below it, so nothing is overwritten)
//   2. copies the table's last row of formulas, formatting and input rules down to the new last row
//      (including the hidden Calculations tab)
//   3. stretches every formula, conditional format and named range that stopped at the old last row
//   4. re-applies the script's dropdowns and, if they were on, the formula locks, at the new size
// Each table is marked done as it finishes, so an interrupted run carries on where it stopped, and the
// whole step is marked done at the end so it never runs again.
// =====================================================================================

const CAPACITY_KEY = "ROW_CAPACITY_V1";

// Built on demand (not at load) because it uses constants from other files.
function capacityPlan_() {
  return [
    { sheet: TXN_SHEET, first: TXN_FIRST_ROW, oldLast: 100, newLast: TXN_LAST_ROW },
    { sheet: CALC_SHEET, first: TXN_FIRST_ROW, oldLast: 100, newLast: TXN_LAST_ROW },
    { sheet: PRACTITIONERS_SHEET, first: PRAC_FIRST_ROW, oldLast: 54, newLast: PRAC_LAST_ROW },
    { sheet: SERVICES_SHEET, first: SERVICES_FIRST_ROW, oldLast: 120, newLast: SERVICES_LAST_ROW, cols: [1, 5] },
    // Service Types sits beside Services (columns G to I); rows can't be inserted for it without splitting the
    // services list, so it only grows into empty space.
    { sheet: SERVICES_SHEET, first: SVC_TYPES_FIRST_ROW, oldLast: 30, newLast: SVC_TYPES_LAST_ROW,
      cols: [SVC_TYPES_COL, SVC_TYPES_COL + 2], noInsert: true },
    { sheet: EVENTS_SHEET, first: EVENTS_FIRST_ROW, oldLast: 42, newLast: EVENTS_LAST_ROW }
  ];
}

// Returns true if it did the work this time. Safe to call before every step.
function ensureCapacity_() {
  const props = PropertiesService.getDocumentProperties();
  if (props.getProperty(CAPACITY_KEY)) return false;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast("Making room for more bookings, practitioners and services. This happens once and takes a moment.", "Flora", 30);

  const plan = capacityPlan_();
  const skipped = [];
  plan.forEach(function (t) {
    const key = CAPACITY_KEY + ":" + t.sheet + ":" + t.first + ":" + (t.cols ? t.cols[0] : 1);
    if (props.getProperty(key)) return;
    const result = extendTable_(ss, t);
    if (result !== "ok") skipped.push(t.sheet + " (" + result + ")");
    props.setProperty(key, result);
  });
  stretchReferences_(ss, plan);

  // The script's own rules and locks, at the new size.
  refreshSheetLogic(true);
  const locked = [[CALC_SHEET, "Payout Tools - Calculations sheet"], [TXN_SHEET, "Payout Tools - Transactions formulas"]].some(function (p) {
    const sh = ss.getSheetByName(p[0]);
    return sh && sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).some(function (x) { return x.getDescription() === p[1]; });
  });
  if (locked) protectCalculations(true);

  props.setProperty(CAPACITY_KEY, new Date().toISOString() + (skipped.length ? " skipped: " + skipped.join("; ") : ""));
  ss.toast("Done: room for " + (TXN_LAST_ROW - TXN_FIRST_ROW + 1) + " bookings a week, " + (PRAC_LAST_ROW - PRAC_FIRST_ROW + 1) +
    " practitioners and " + (SERVICES_LAST_ROW - SERVICES_FIRST_ROW + 1) + " services." +
    (skipped.length ? " Not grown (something sits below it): " + skipped.join(", ") + "." : ""), "Flora", 10);
  return true;
}

// "ok", or why it left the table as it was.
function extendTable_(ss, t) {
  const sh = ss.getSheetByName(t.sheet);
  if (!sh) return "tab missing";
  const extra = t.newLast - t.oldLast;
  if (extra <= 0) return "ok";
  const c1 = t.cols ? t.cols[0] : 1;
  const nc = t.cols ? t.cols[1] - t.cols[0] + 1 : sh.getMaxColumns();
  const blank = function (range) {
    return range.getValues().every(function (r) { return r.every(function (v) { return v === ""; }); }) &&
      range.getFormulas().every(function (r) { return r.every(function (f) { return f === ""; }); });
  };

  // 1. Room below the table.
  const avail = sh.getMaxRows() - t.oldLast;
  const below = avail > 0 ? sh.getRange(t.oldLast + 1, c1, Math.min(avail, extra), nc) : null;
  const free = !below || blank(below);
  if (t.noInsert) {
    if (!free) return "something below it";
    if (avail < extra) sh.insertRowsAfter(sh.getMaxRows(), extra - avail);
  } else if (!free) {
    sh.insertRowsAfter(t.oldLast, extra);           // pushes whatever is below down, untouched
  } else if (avail < extra) {
    sh.insertRowsAfter(sh.getMaxRows(), extra - avail);
  }

  // 2. The last row's formulas (relative, so each new row points at its own row), formatting and input rules.
  const src = sh.getRange(t.oldLast, c1, 1, nc);
  const target = sh.getRange(t.oldLast + 1, c1, extra, nc);
  src.copyTo(target, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  src.copyTo(target, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
  src.getFormulasR1C1()[0].forEach(function (f, j) {
    if (f) sh.getRange(t.oldLast + 1, c1 + j, extra, 1).setFormulaR1C1(f);
  });
  return "ok";
}

// Every formula, conditional format and named range in the workbook that ended at a table's old last row.
function stretchReferences_(ss, plan) {
  const bySheet = {};
  plan.forEach(function (t) { (bySheet[t.sheet] = bySheet[t.sheet] || []).push(t); });

  ss.getSheets().forEach(function (sh) {
    const name = sh.getName();
    const lr = sh.getLastRow(), lc = sh.getLastColumn();
    if (lr > 0 && lc > 0) {
      const range = sh.getRange(1, 1, lr, lc);
      const formulas = range.getFormulas();
      formulas.forEach(function (row, i) {
        row.forEach(function (f, j) {
          if (!f) return;
          const g = stretchRefs_(f, name, bySheet);
          if (g !== f) sh.getRange(i + 1, j + 1).setFormula(g);
        });
      });
    }
    // Conditional formats: their ranges, and any custom formula inside them.
    let changed = false;
    const rules = sh.getConditionalFormatRules().map(function (rule) {
      const ranges = rule.getRanges().map(function (r) {
        const t = matchTable_(bySheet[name], r.getRow(), r.getLastRow(), r.getColumn(), r.getLastColumn());
        if (!t) return r;
        changed = true;
        return sh.getRange(r.getRow(), r.getColumn(), t.newLast - r.getRow() + 1, r.getNumColumns());
      });
      const b = rule.copy().setRanges(ranges);
      const cond = rule.getBooleanCondition();
      if (cond && cond.getCriteriaType() === SpreadsheetApp.BooleanCriteria.CUSTOM_FORMULA) {
        const f = cond.getCriteriaValues()[0], g = stretchRefs_(String(f), name, bySheet);
        if (g !== f) { b.whenFormulaSatisfied(g); changed = true; }
      }
      return b.build();
    });
    if (changed) sh.setConditionalFormatRules(rules);
  });

  ss.getNamedRanges().forEach(function (nr) {
    const r = nr.getRange(), sh = r.getSheet();
    const t = matchTable_(bySheet[sh.getName()], r.getRow(), r.getLastRow(), r.getColumn(), r.getLastColumn());
    if (t) nr.setRange(sh.getRange(r.getRow(), r.getColumn(), t.newLast - r.getRow() + 1, r.getNumColumns()));
  });
}

// ---------------------------------------------------------------- pure helpers (no Google calls)

function colNum_(letters) {
  return String(letters).toUpperCase().split("").reduce(function (n, ch) { return n * 26 + ch.charCodeAt(0) - 64; }, 0);
}

// The table a range belongs to: it ends exactly at the table's old last row, starts at the table's first row
// or up to 3 rows above it (a heading row), and overlaps the table's columns.
function matchTable_(tables, r1, r2, c1, c2) {
  return (tables || []).filter(function (t) {
    const tc1 = t.cols ? t.cols[0] : 1, tc2 = t.cols ? t.cols[1] : 10000;
    return r2 === t.oldLast && r1 <= t.first && r1 >= t.first - 3 && c1 <= tc2 && c2 >= tc1;
  })[0] || null;
}

// Rewrites A1 ranges like A5:A100 or Transactions!$F$5:$N$100 that end at a table's old last row.
function stretchRefs_(formula, currentSheet, bySheet) {
  return String(formula).replace(/((?:'(?:[^']|'')+'|[A-Za-z_][A-Za-z0-9_.]*)!)?(\$?)([A-Z]{1,3})(\$?)(\d+):(\$?)([A-Z]{1,3})(\$?)(\d+)(?![\d(])/g,
    function (m, q, d1, col1, d2, row1, d3, col2, d4, row2) {
      const sheet = q ? q.slice(0, -1).replace(/^'|'$/g, "").replace(/''/g, "'") : currentSheet;
      const t = matchTable_(bySheet[sheet], +row1, +row2, colNum_(col1), colNum_(col2));
      if (!t) return m;
      return (q || "") + d1 + col1 + d2 + row1 + ":" + d3 + col2 + d4 + t.newLast;
    });
}

if (typeof module !== "undefined") module.exports = { stretchRefs_: stretchRefs_, matchTable_: matchTable_, colNum_: colNum_ };
