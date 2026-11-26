// =====================================================================================
// START HERE TAB
//
// A short, scannable guide written by the script itself (Flora · Tools > Rebuild Start here tab),
// so it always matches the menus and the panel, ships in every copy, and updates with the script.
// The words live in START_HERE_ below; writeStartHere_ only lays them out. Rebuilding replaces
// this tab only; any other tab, including the Full manual, is left alone.
// =====================================================================================

const START_HERE_SHEET = "Start here";

// The "full manual" link near the top of Start here. If MANUAL_URL_ is set (for example a Google Doc
// link), it wins. Otherwise it links to the first of these tabs that exists. No manual: no link row.
const MANUAL_URL_ = "";
const MANUAL_TABS_ = ["Full manual", "Manual", "Instructions"];

function manualLink_(ss) {
  if (MANUAL_URL_) return MANUAL_URL_;
  for (let i = 0; i < MANUAL_TABS_.length; i++) {
    const sh = ss.getSheetByName(MANUAL_TABS_[i]);
    if (sh) return "#gid=" + sh.getSheetId();
  }
  return "";
}

// Plain-language "what's new" for the person doing payouts. Newest first; keep it short.
const WHATS_NEW_ = [
  { when: "November 25, 2026", items: [
    "Check totals and Make invoice PDFs now open the Invoices tab, so the totals table is right in front of you.",
    "Start here and Invoices fit your screen: on a smaller laptop they switch to narrower columns so nothing hides behind the panel.",
    "The Flora Payouts panel opens faster: the week and steps show first, and the status label fills in a moment later."
  ] },
  { when: "November 23, 2026", items: [
    "Invoices, the manager summary and business totals in the new look: a clean header, the payout in a pink box, and an easy-to-read summary.",
    "Room to grow: up to 500 bookings a week, 100 practitioners and 400 services.",
    "Sending checks the invoices are up to date first: if a booking changed after the PDFs were made, it asks you to make them again.",
    "Dates pasted into Transactions are read and checked against the pay week.",
    "The records tabs (Archive, Payout History, Send Log) have filters and clearer dates and money."
  ] },
  { when: "November 22, 2026", items: [
    "The Flora Payouts panel: this week at a glance and every step in order. Flora · This Week > Open Flora Payouts panel.",
    "Two simpler menus: Flora · This Week for the weekly steps, Flora · Tools for everything else.",
    "New-look invoices, manager summary and business totals.",
    "E-Transfer checklist tab: tick people off as you pay them, even from an iPad.",
    "Messages after each step now lead with the result, like \"5 invoices sent\".",
    "The pay week date in Invoices C4 fixes itself if it's typed or pasted oddly."
  ] }
];

// tag: "none" (emails nobody), "manager", "practitioners", or "" for no tag.
const START_HERE_ = {
  title: "Start here",
  intro: "Everything for a pay week, in the order you do it. The Flora Payouts panel walks you through the same steps: Flora · This Week > Open Flora Payouts panel.",
  sections: [
    { label: "EVERY WEEK", steps: [
      { num: "", title: "Open the Flora Payouts panel", text: "Check the pay week at the top. Wrong week? Change the date in cell C4 on the Invoices tab.", tag: "" },
      { num: "1", title: "Check this week's totals", text: "See each practitioner's total, and anything that won't be counted.", tag: "none" },
      { num: "2", title: "Make invoice PDFs", text: "One invoice per practitioner, saved to Drive.", tag: "none" },
      { num: "3", title: "Make manager summary", text: "One PDF of the whole week for the manager to look over.", tag: "none" },
      { num: "3b", title: "Email summary to manager", text: "Optional. Sends that one PDF to the manager.", tag: "manager" },
      { num: "4", title: "Email invoices to practitioners", text: "Only after the manager approves. You'll be asked to confirm first.", tag: "practitioners" },
      { num: "5", title: "E-Transfer notes", text: "The amount and a message for each payment. Press Make checklist tab to work through it in your bank app or on an iPad.", tag: "none" },
      { num: "✓", title: "Start next week", text: "Last, after everyone is paid. Saves a backup, files the week in the Archive and clears Transactions.", tag: "none" }
    ] },
    { label: "ADDING BOOKINGS", tips: [
      "Type them on the Transactions tab: date, practitioner, service, client and any gratuity.",
      "Pick names and services from the dropdowns. Type dates as month/day/year, or double-click for a calendar.",
      "Close the Flora Payouts panel while you type, so you can see every column."
    ] },
    { label: "GOOD TO KNOW", tips: [
      "Use a laptop. Buttons and the panel don't work in the Sheets app on an iPad or phone (the E-Transfers tab does).",
      "Use a browser window signed in only to your Flora Google account. The panel warns you if you're on the wrong one.",
      "Nothing is emailed until you press a button that says it emails someone.",
      "Running a step twice is safe: it replaces what it made before, it never doubles up.",
      "Looking something up in the records (Archive, Payout History, Send Log)? Use the filter button on any heading to show one practitioner, one week, one service, only comped bookings or only failed emails. Flora · Tools > Show / hide records tabs brings them into view."
    ] },
    { label: "IF SOMETHING LOOKS WRONG", tips: [
      "Click the status label at the top of the Flora Payouts panel (or Flora · Tools > Health Check). It says what to fix, in plain words.",
      "Still stuck? Take a screenshot of the Health Check and send it to the developer."
    ] }
  ]
};

function menuRebuildStartHere() { runStep_("Rebuild Start here tab", rebuildStartHere); }

// confirmed: true after the Flora Yes button.
function rebuildStartHere(confirmed) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  if (!confirmed && ss.getSheetByName(START_HERE_SHEET)) {
    floraConfirm_("Start here", { tone: "info", headline: "Rebuild the Start here tab?",
      body: "This rewrites the Start here tab with the latest guide. Nothing else changes, including the Full manual tab.",
      yes: "Rebuild it", no: "Not now", action: "rebuildStartHere" });
    return;
  }
  const sh = writeStartHere_(ss);
  ss.setActiveSheet(sh);
  ss.moveActiveSheet(1);  // Start here is always the first tab
  ss.toast("The Start here tab is up to date.", "Start here", 5);
}

// Lays the guide out in columns B to E (compact or roomy widths from layout.gs, so nothing is cut off with the Flora Payouts panel open).
function writeStartHere_(ss) {
  let sh = ss.getSheetByName(START_HERE_SHEET);
  if (!sh) sh = ss.insertSheet(START_HERE_SHEET, 0);
  sh.clear();
  // An earlier rebuild trims the tab to fit, so make room again before writing.
  if (sh.getMaxRows() < 120) sh.insertRowsAfter(sh.getMaxRows(), 120 - sh.getMaxRows());
  if (sh.getMaxColumns() < 6) sh.insertColumnsAfter(sh.getMaxColumns(), 6 - sh.getMaxColumns());
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart().setFontFamily("DM Sans").setFontColor("#2E2A2C")
    .setVerticalAlignment("middle").setWrap(true);
  sh.setHiddenGridlines(true).setTabColor(COLOR_PRIMARY);
  widthsFor_("startHere", currentLayout_()).forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });  // see layout.gs

  const TAGS = {
    none: { text: "Emails nobody", bg: "#E7F2EC", fg: "#2F6B4F" },
    manager: { text: "Emails the manager", bg: "#F7E4E9", fg: "#86304F" },
    practitioners: { text: "Emails practitioners", bg: "#F7E4E9", fg: "#86304F" }
  };
  let row = 2;
  const wide = function (r, height) { const g = sh.getRange(r, 2, 1, 4).merge(); if (height) sh.setRowHeight(r, height); return g; };

  wide(row, 58).setValue(START_HERE_.title).setFontFamily("Fraunces").setFontSize(30).setFontWeight("bold").setFontColor(COLOR_PRIMARY)
    .setVerticalAlignment("bottom").setBorder(null, null, true, null, null, null, COLOR_PRIMARY, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // rose underline, like the PDFs
  row++;
  wide(row, 60).setValue(START_HERE_.intro).setFontSize(14).setFontColor("#2E2A2C");
  row++;
  const manual = manualLink_(ss);
  if (manual) {
    const text = "Want every detail? Open the full manual →";
    wide(row, 34).setRichTextValue(SpreadsheetApp.newRichTextValue().setText(text).setLinkUrl(manual).build())
      .setFontSize(13).setFontWeight("bold").setFontColor(COLOR_PRIMARY);
    row++;
  }
  row++;

  START_HERE_.sections.forEach(function (sec) {
    wide(row, 38).setValue(sec.label).setFontSize(12).setFontWeight("bold").setFontColor("#86304F").setBackground("#F7E4E9");
    row++;
    (sec.steps || []).forEach(function (st, i) {
      sh.setRowHeight(row, 72);
      sh.getRange(row, 2).setValue(st.num).setHorizontalAlignment("center").setFontWeight("bold").setFontSize(13)
        .setFontColor(st.num ? "#FFFFFF" : "#2E2A2C").setBackground(st.num ? COLOR_PRIMARY : null);
      sh.getRange(row, 3).setValue(st.title).setFontWeight("bold").setFontSize(14);
      sh.getRange(row, 4).setValue(st.text).setFontSize(13).setFontColor("#2E2A2C");
      const tag = TAGS[st.tag];
      if (tag) sh.getRange(row, 5).setValue(tag.text).setFontSize(11).setFontWeight("bold").setHorizontalAlignment("center")
        .setBackground(tag.bg).setFontColor(tag.fg);
      sh.getRange(row, 2, 1, 4).setBorder(null, null, true, null, null, null, "#EFE6EA", SpreadsheetApp.BorderStyle.SOLID);
      row++;
    });
    (sec.tips || []).forEach(function (tip) {
      sh.getRange(row, 2).setValue("•").setHorizontalAlignment("center").setFontColor(COLOR_PRIMARY).setFontWeight("bold");
      sh.getRange(row, 3, 1, 3).merge().setValue(tip).setFontSize(13);
      sh.setRowHeight(row, 42);
      row++;
    });
    row++;
  });

  wide(row, 38).setValue("WHAT'S NEW · script version " + SCRIPT_VERSION).setFontSize(12).setFontWeight("bold")
    .setFontColor("#86304F").setBackground("#F7E4E9");
  row++;
  WHATS_NEW_.forEach(function (w) {
    wide(row, 34).setValue(w.when).setFontWeight("bold").setFontSize(13);
    row++;
    w.items.forEach(function (it) {
      sh.getRange(row, 2).setValue("•").setHorizontalAlignment("center").setFontColor(COLOR_PRIMARY).setFontWeight("bold");
      sh.getRange(row, 3, 1, 3).merge().setValue(it).setFontSize(13);
      sh.setRowHeight(row, 38);
      row++;
    });
  });

  // Trim the sheet to what's used, so there's no endless empty grid below or to the right.
  if (sh.getMaxRows() > row + 2) sh.deleteRows(row + 3, sh.getMaxRows() - row - 2);
  if (sh.getMaxColumns() > 6) sh.deleteColumns(7, sh.getMaxColumns() - 6);
  sh.setFrozenRows(0);
  return sh;
}
