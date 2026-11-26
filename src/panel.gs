// =====================================================================================
// FLORA PAYOUTS SIDE PANEL
//
// An extra front door to the same menu items: Flora · This Week > Open Flora Payouts panel shows it.
// Every button runs the existing menu wrapper (so the same confirmations, alerts and error
// messages appear), then the panel redraws from getPanelState().
//
// Steps are ticked off per pay week in Document Properties, only at each step's real success
// point (see markStepDone_ calls in payout_tools.js). Panel.html is the page itself.
// =====================================================================================

const STEPS_DONE_KEY = "STEPS_DONE";
const STEPS_KEEP_PERIODS = 8;
const STEP_KEYS = ["1", "2", "3", "3b", "4", "5"];

function openPanel() {
  try { ensureCapacity_(); } catch (err) { recordError_("Room to grow", err); }
  SpreadsheetApp.getUi().showSidebar(
    HtmlService.createHtmlOutputFromFile("Panel").setTitle("Flora Payouts"));
}

// Only these names can be run from the panel; each maps to an existing menu wrapper.
const PANEL_ACTIONS_ = {
  preview: "menuPreview",
  generate: "menuGenerate",
  reviewSummary: "menuReviewSummary",
  emailSummary: "menuEmailSummary",
  send: "menuSend",
  etransfer: "menuETransfer",
  startNewWeek: "menuStartNewWeek",
  businessTotals: "menuBusinessTotals",
  pastSummary: "menuPastSummary",
  oneInvoice: "menuOneInvoice",
  records: "menuToggleRecords",
  healthCheck: "menuHealthCheck",
  refresh: "menuRefresh",
  protect: "menuProtect"
};

function panelRun(name) {
  if (!Object.prototype.hasOwnProperty.call(PANEL_ACTIONS_, name)) throw new Error("Unknown panel action: " + name);
  const fn = globalThis[PANEL_ACTIONS_[name]];
  if (typeof fn !== "function") throw new Error("Missing menu function for: " + name);
  fn();
  return getPanelState();
}

// opts.quick: skip the Health Check (it reads every booking), so the panel can draw the week and steps
// right away and ask again for the full state a moment later. opts.windowPx: the browser window width.
function getPanelState(opts) {
  opts = opts || {};
  ensureCapacity_();  // one-time; the panel reads every row, so the sheet must be the right size first
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (opts.windowPx) { try { rememberWindowWidth_(ss, opts.windowPx); } catch (err) { recordError_("Fit the tabs to the screen", err); } }
  if (!opts.quick) { try { ensureRecordsStyle_(); } catch (err) { recordError_("Style the records tabs", err); } }
  const tz = ss.getSpreadsheetTimeZone();
  const stats = {};
  const items = opts.quick ? [] : collectHealthItems_(ss, { keepLastError: true, stats: stats });
  const fixes = items.filter(function (i) { return i.level === "fix"; });
  const warns = items.filter(function (i) { return i.level === "warn"; });
  // The account has its own strip in the panel, so the amber box shows the first OTHER problem.
  const notAccount = function (i) { return i.topic !== "account"; };
  const first = fixes.filter(notAccount)[0] || warns.filter(notAccount)[0] || null;

  const inv = ss.getSheetByName(INVOICES_SHEET);
  const v = inv ? inv.getRange(PERIOD_START_CELL).getValue() : null;
  const label = function (d) { return Utilities.formatDate(d, tz, "EEE MMM d"); };
  const w = signedInAs_(ss);

  const state = {
    version: SCRIPT_VERSION,
    periodOk: v instanceof Date,
    periodStart: "", periodEnd: "", nextStart: "",
    bookings: opts.quick ? null : (stats.bookings || 0),
    practitioners: opts.quick ? null : (stats.practitioners || 0),
    health: { pending: !!opts.quick, fixes: fixes.length, warns: warns.length, first: first ? first.text : "", firstLevel: first ? first.level : "" },
    account: { me: w.me, owner: w.owner, mismatch: !!(w.me && w.owner && w.me.toLowerCase() !== w.owner.toLowerCase()) },
    done: {},
    tabs: panelTabsPresent_(ss)
  };
  if (state.periodOk) {
    const start = startOfDay_(v);
    state.periodStart = label(start);
    state.periodEnd = label(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6));
    state.nextStart = label(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7));
    state.done = getStepsDone_(start);
  } else if (!state.health.first && !opts.quick) {
    state.health.first = "Invoices cell " + PERIOD_START_CELL + " isn't a valid date. Type this week's Friday, like 11/20/2026.";
    state.health.firstLevel = "fix";
  }
  return state;
}

// The "How to switch" help from the panel's account strip: the same three steps as the panel's
// can't-load card, in a small dialog styled like the panel.
function showSwitchHelp() {
  const html = HtmlService.createHtmlOutput(
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">' +
    '<div style="font-family:\'DM Sans\',Arial,sans-serif;color:#2E2A2C;font-size:14px;line-height:1.5;padding:4px 6px">' +
    '<p style="margin:0 0 12px">Emails are sent from, and PDFs are saved to, whichever Google account Flora runs as. ' +
    'When a browser is signed in to several Google accounts, Google can pick the wrong one.</p>' +
    '<ol style="margin:0 0 14px;padding-left:20px">' +
    '<li style="margin-bottom:8px">Click your picture at the top right of Google and note which accounts are listed.</li>' +
    '<li style="margin-bottom:8px">Easiest fix: open this sheet in a Chrome profile (or an Incognito window) signed in <b>only</b> to the Flora account.</li>' +
    '<li>Reload the sheet.</li></ol>' +
    '<button onclick="google.script.host.close()" style="font:inherit;font-weight:700;min-height:44px;padding:0 22px;border:none;border-radius:10px;background:#A13D63;color:#fff;cursor:pointer">Got it</button>' +
    '</div>'
  ).setWidth(420).setHeight(330);
  SpreadsheetApp.getUi().showModalDialog(html, "Switching Google accounts");
}

// Ticks a step for the pay week currently in Invoices C4. Never lets a failure here break the step itself.
function markStepDone_(stepKey) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const v = ss.getSheetByName(INVOICES_SHEET).getRange(PERIOD_START_CELL).getValue();
    if (!(v instanceof Date)) return;
    const props = PropertiesService.getDocumentProperties();
    const all = parseStepsDone_(props.getProperty(STEPS_DONE_KEY));
    props.setProperty(STEPS_DONE_KEY, JSON.stringify(recordStep_(all, fmtDate(startOfDay_(v)), stepKey, STEPS_KEEP_PERIODS)));
  } catch (ignore) { /* the tick is a convenience; the step already happened */ }
}

function getStepsDone_(periodStart) {
  try {
    const all = parseStepsDone_(PropertiesService.getDocumentProperties().getProperty(STEPS_DONE_KEY));
    return stepsFor_(all, fmtDate(startOfDay_(periodStart)));
  } catch (ignore) {
    return stepsFor_({}, "");
  }
}

// ---------------------------------------------------------------- pure helpers (no Google calls)

function parseStepsDone_(raw) {
  try {
    const o = JSON.parse(raw || "{}");
    return o && typeof o === "object" && !Array.isArray(o) ? o : {};
  } catch (ignore) {
    return {};
  }
}

// periodKey is "MM/dd/yyyy". Returns a new object with the step ticked, keeping only the newest `keep` weeks.
function recordStep_(all, periodKey, stepKey, keep) {
  const out = {};
  Object.keys(all).forEach(function (k) { out[k] = Object.assign({}, all[k]); });
  out[periodKey] = Object.assign({}, out[periodKey]);
  out[periodKey][stepKey] = true;
  const when = function (k) {
    const p = String(k).split("/");
    return p.length === 3 ? Date.UTC(+p[2], +p[0] - 1, +p[1]) : 0;
  };
  Object.keys(out).sort(function (a, b) { return when(b) - when(a); }).slice(keep).forEach(function (k) { delete out[k]; });
  return out;
}

function stepsFor_(all, periodKey) {
  const week = all[periodKey] || {};
  const done = {};
  STEP_KEYS.forEach(function (k) { done[k] = week[k] === true; });
  return done;
}

if (typeof module !== "undefined") module.exports = { parseStepsDone_: parseStepsDone_, recordStep_: recordStep_, stepsFor_: stepsFor_ };
