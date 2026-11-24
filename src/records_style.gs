// =====================================================================================
// RECORDS TABS: CLEAN STYLE AND FILTERS  (Archive, Payout History, Send Log)
//
// The titles, headings (rows 1 to 4) and filter buttons are styled on the sheet itself. This adds the
// data formatting: readable dates and times, money aligned right, Y/N columns centred, the Net columns
// in bold rose (like the invoices), and Send Log's Sent (green) and Failed (red) colours.
//
// What it never changes: anything in the heading rows, banding, frozen rows or columns, column widths,
// or any value. Applied once to existing tabs, automatically, and to any records tab the script creates later.
// =====================================================================================

const RECORDS_STYLE_KEY = "RECORDS_STYLE_V1";

// Which tabs, where their headings are, and which columns to freeze (dates and practitioner stay in view).
function recordsTabs_() {
  return [
    { name: ARCHIVE_SHEET, headerRow: LOG_HEADER_ROW, headers: ARCHIVE_HEADERS, freezeCols: 3 },
    { name: HISTORY_SHEET, headerRow: LOG_HEADER_ROW, headers: HISTORY_HEADERS, freezeCols: 3 },
    { name: SEND_LOG_SHEET, headerRow: 1, headers: ["Sent On", "Period Start", "Practitioner", "Email", "Status"], freezeCols: 0, sendLog: true }
  ];
}

// How each column is shown, decided by its heading. Pure, so it can be tested.
// Returns { format, width, align } (format may be "" for leave-as-is).
function recordsColumnStyle_(heading, isSendLog) {
  const h = String(heading);
  if (isSendLog && h === "Period Start") return { format: "", width: 120, align: "left" };   // stored as text on purpose
  if (/^(Archived On|Sent On)$/.test(h)) return { format: "mmm d, yyyy h:mm am/pm", width: 170, align: "left" };
  if (/^(Period Start|Period End|Date of Service)$/.test(h)) return { format: "ddd mmm d, yyyy", width: 130, align: "left" };
  if (/^(Transactions)$/.test(h)) return { format: "0", width: 100, align: "right" };
  if (/Fee|Price|Gratuity|Net|Comped Value|Revenue|^Comped$/.test(h) && !/\?$/.test(h)) return { format: CURRENCY_FMT, width: 110, align: "right" };
  if (/\?$/.test(h)) return { format: "", width: 90, align: "center" };
  if (/^(Practitioner)$/.test(h)) return { format: "", width: 150, align: "left" };
  if (/^(Service|Client Name|Event)$/.test(h)) return { format: "", width: 170, align: "left" };
  if (/^(Email)$/.test(h)) return { format: "", width: 240, align: "left" };
  if (/^(Status)$/.test(h)) return { format: "", width: 220, align: "left" };
  return { format: "", width: 120, align: "left" };
}

// One-time, automatic: style the records tabs that already exist. Safe to call before every step.
function ensureRecordsStyle_() {
  const props = PropertiesService.getDocumentProperties();
  if (props.getProperty(RECORDS_STYLE_KEY)) return false;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  recordsTabs_().forEach(function (t) {
    const sh = ss.getSheetByName(t.name);
    if (!sh) return;
    try { styleRecordsTab_(sh, t); } catch (err) { recordError_("Style the " + t.name + " tab", err); }
  });
  props.setProperty(RECORDS_STYLE_KEY, new Date().toISOString());
  return true;
}

function styleRecordsTabByName_(sheet) {
  const t = recordsTabs_().filter(function (x) { return x.name === sheet.getName(); })[0];
  if (!t) return;
  try { styleRecordsTab_(sheet, t); } catch (err) { recordError_("Style the " + t.name + " tab", err); }
}

// Rows 1 to 4 (titles, headings) and the filter buttons are styled on the sheet itself, so this only
// formats the data rows: dates, money and Y/N columns, the Net columns in bold rose, and Send Log's colours.
// No heading styling, no banding, no frozen columns (rows 1 to 3 are merged), no column widths.
function styleRecordsTab_(sh, t) {
  const width = Math.max(t.headers.length, sh.getLastColumn());
  const firstData = t.headerRow + 1;
  const dataRows = Math.max(1, sh.getMaxRows() - t.headerRow);

  const heads = sh.getRange(t.headerRow, 1, 1, width).getValues()[0];
  heads.forEach(function (h, i) {
    if (String(h).trim() === "") return;
    const st = recordsColumnStyle_(h, !!t.sendLog);
    const col = sh.getRange(firstData, i + 1, dataRows, 1);
    if (st.format) col.setNumberFormat(st.format);
    col.setHorizontalAlignment(st.align);
  });
  // The payout total stands out, like on the invoices.
  ["Net to Practitioner", "Net Amount"].forEach(function (name) {
    const i = heads.indexOf(name);
    if (i !== -1) sh.getRange(firstData, i + 1, dataRows, 1).setFontWeight("bold").setFontColor(COLOR_PRIMARY);
  });

  // Send Log: Sent in green, anything that failed in red, so problems jump out.
  if (t.sendLog) {
    const status = sh.getRange(firstData, 5, dataRows, 1);
    const keep = sh.getConditionalFormatRules().filter(function (r) {
      return !r.getRanges().some(function (x) { return x.getColumn() === 5 && x.getRow() === firstData; });
    });
    keep.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Sent").setFontColor("#2F6B4F").setBold(true).setRanges([status]).build());
    keep.push(SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith("Failed").setFontColor("#9B2C22").setBackground("#FBE3E1").setBold(true).setRanges([status]).build());
    sh.setConditionalFormatRules(keep);
  }
}

if (typeof module !== "undefined") module.exports = { recordsColumnStyle_: recordsColumnStyle_ };
