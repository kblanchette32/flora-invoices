// =====================================================================================
// TAB ORGANIZING
//
// Flora · Tools > Organize tabs puts the tabs in three color-coded groups, left to right:
//   every week (rose)  ·  setup, now and then (blush)  ·  records, look but don't touch (grey)
// and hides the helper tabs nobody types in. It only moves, colors and hides tabs: nothing on
// them changes, and hidden tabs keep working. Any tab it doesn't know stays, in its own order,
// after the three groups. Safe to run again whenever tabs get dragged around.
// =====================================================================================

const TAB_GROUPS_ = [
  { label: "Every week", color: "#A13D63", names: ["Start here", "Transactions", "Invoices", "E-Transfers"] },
  { label: "Setup", color: "#E2A9BD", names: ["Practitioners", "Services", "Events", "Settings", "Full manual"] },
  { label: "Records", color: "#B5ADB1", names: ["Archive", "Payout History", "Send Log"] }
];
const TAB_HIDDEN_ = ["Calculations", "Square Import"];
// Records stay hidden day to day (the script still writes to them); Show / hide records tabs brings them back.
const TAB_RECORDS_ = ["Archive", "Payout History", "Send Log"];
// The old Instructions tab becomes "Full manual": Start here is the quick guide, this is the detail behind it.
const TAB_RENAMES_ = { "Instructions": "Full manual" };

// The tabs the panel's "Go to" buttons may open.
const PANEL_GOTO_TABS_ = ["Transactions", "Invoices", "E-Transfers"];

function menuOrganizeTabs() { runStep_("Organize tabs", organizeTabs); }

// confirmed: true after the Flora Yes button.
function organizeTabs(confirmed) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const present = {};
  ss.getSheets().forEach(function (sh) { present[sh.getName()] = sh; });
  const renames = Object.keys(TAB_RENAMES_).filter(function (from) { return present[from] && !present[TAB_RENAMES_[from]]; });

  // Plan as if the renames were already done.
  const names = ss.getSheets().map(function (sh) { const n = sh.getName(); return renames.indexOf(n) !== -1 ? TAB_RENAMES_[n] : n; });
  const order = planTabOrder_(names, TAB_GROUPS_, TAB_HIDDEN_);
  if (!confirmed) {
    floraConfirm_("Organize tabs", { tone: "info", headline: "Organize tabs?",
      body:
    (renames.length ? "Renames " + renames.map(function (f) { return "\"" + f + "\" to \"" + TAB_RENAMES_[f] + "\""; }).join(", ") +
      " (its contents stay exactly as they are).\n\n" : "") +
    "This puts the tabs in order and colors them:\n\n" +
    TAB_GROUPS_.map(function (g) {
      const here = g.names.filter(function (n) { return names.indexOf(n) !== -1; });
      return here.length ? g.label + ": " + here.join(", ") : "";
    }).filter(String).join("\n") +
    (order.extra.length ? "\nThen, as they are: " + order.extra.join(", ") : "") +
    (order.hide.length ? "\n\nHidden (still there, still used by the script): " + order.hide.join(", ") : "") +
    "\n\nRecords tabs (" + TAB_RECORDS_.join(", ") + ") are hidden too. Flora · Tools > Show / hide records tabs brings them back." +
    "\n\nNothing on any tab changes.",
      yes: "Organize the tabs", no: "Not now", action: "organizeTabs" });
    return;
  }

  renames.forEach(function (from) {
    present[TAB_RENAMES_[from]] = present[from].setName(TAB_RENAMES_[from]);
    delete present[from];
  });
  const wasActive = ss.getActiveSheet().getName();
  // Show everything that should be visible first, so moving never trips over a hidden tab.
  order.visible.forEach(function (name) { if (present[name].isSheetHidden()) present[name].showSheet(); });
  order.visible.forEach(function (name, i) {
    ss.setActiveSheet(present[name]);
    ss.moveActiveSheet(i + 1);
  });
  TAB_GROUPS_.forEach(function (g) {
    g.names.forEach(function (n) { if (present[n]) present[n].setTabColor(g.color); });
  });
  order.hide.forEach(function (name) { present[name].hideSheet(); });
  TAB_RECORDS_.forEach(function (name) { if (present[name] && !present[name].isSheetHidden()) present[name].hideSheet(); });

  const back = order.hide.indexOf(wasActive) === -1 ? present[wasActive] : present[order.visible[0]];
  ss.setActiveSheet(back);
  floraDialog_("Organize tabs", {
    tone: "good", headline: "Tabs organized",
    groups: TAB_GROUPS_.map(function (g) {
      return { label: g.label, tone: g.label === "Records" ? "muted" : g.label === "Setup" ? "info" : "good",
        items: g.names.filter(function (n) { return present[n]; }) };
    }).concat([{ label: "Hidden", tone: "muted", items: order.hide }]),
    body: "Records tabs are hidden to keep the row of tabs short. Flora · Tools > Show / hide records tabs brings them back. " +
      "Hidden tabs are still there, and the script still uses them."
  });
}

function menuToggleRecords() { runStep_("Show / hide records tabs", toggleRecordsTabs); }

// One button both ways: if any records tab is hidden, show them all (and open Archive); otherwise hide them.
function toggleRecordsTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabs = TAB_RECORDS_.map(function (n) { return ss.getSheetByName(n); }).filter(Boolean);
  if (!tabs.length) { floraAlert_("There are no records tabs in this sheet yet. They appear after the first Start next week.", "info"); return; }
  const show = tabs.some(function (sh) { return sh.isSheetHidden(); });
  if (show) {
    tabs.forEach(function (sh) { sh.showSheet(); });
    ss.setActiveSheet(tabs[0]);
    ss.toast("Records tabs are showing. Run Show / hide records tabs again to tuck them away.", "Records", 6);
  } else {
    // Never hide the tab the user is looking at without somewhere to land.
    if (tabs.some(function (sh) { return sh.getName() === ss.getActiveSheet().getName(); })) {
      const home = ss.getSheetByName("Start here") || ss.getSheetByName(TXN_SHEET);
      if (home) ss.setActiveSheet(home);
    }
    tabs.forEach(function (sh) { sh.hideSheet(); });
    ss.toast("Records tabs are hidden. They're still there, and the script still uses them.", "Records", 6);
  }
}

// Panel "Go to" buttons.
function panelGoTo(name) {
  if (PANEL_GOTO_TABS_.indexOf(name) === -1) throw new Error("Unknown tab: " + name);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error("There's no " + name + " tab yet.");
  if (sh.isSheetHidden()) sh.showSheet();
  ss.setActiveSheet(sh);
  return true;
}

function panelTabsPresent_(ss) {
  return PANEL_GOTO_TABS_.filter(function (n) { return !!ss.getSheetByName(n); });
}

// ---------------------------------------------------------------- pure helper (no Google calls)

// names: the tabs as they are now, in order. Returns { visible: final left-to-right order of the
// tabs that stay visible, hide: tabs to hide, extra: unknown tabs kept after the groups }.
function planTabOrder_(names, groups, hidden) {
  const known = {};
  const visible = [];
  groups.forEach(function (g) {
    g.names.forEach(function (n) { known[n] = true; if (names.indexOf(n) !== -1) visible.push(n); });
  });
  hidden.forEach(function (n) { known[n] = true; });
  const extra = names.filter(function (n) { return !known[n]; });
  return {
    visible: visible.concat(extra),
    hide: hidden.filter(function (n) { return names.indexOf(n) !== -1; }),
    extra: extra
  };
}

if (typeof module !== "undefined") module.exports = { planTabOrder_: planTabOrder_, TAB_GROUPS_: TAB_GROUPS_, TAB_HIDDEN_: TAB_HIDDEN_ };
