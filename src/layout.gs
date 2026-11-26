// =====================================================================================
// FIT THE TABS TO THE SCREEN
//
// Sheets column widths are fixed pixels, and a script can't see the screen. The Flora Payouts panel can:
// it measures the browser window each time it opens and sends that here. Below about 1600px wide, the
// roomy layout would slide under the 300px panel, so Invoices and Start here switch to compact widths.
// Same columns, same contents, just tighter. The choice is kept per person (User Properties).
// =====================================================================================

const LAYOUT_KEY = "FLORA_LAYOUT";
const WIDE_WINDOW_PX = 1600;  // roomy widths only on big screens; a 1512px laptop is too tight beside the panel

const LAYOUTS_ = {
  invoices:  { roomy: [130, 110, 180, 90, 85, 80, 80, 80, 90, 95], compact: [120, 95, 110, 90, 85, 80, 80, 80, 90, 95] },
  startHere: { roomy: [24, 60, 270, 540, 180],                      compact: [16, 52, 230, 460, 160] }
};

// "compact" for a narrow window, "roomy" otherwise (and when the width is unknown).
function layoutFor_(windowPx) {
  const px = Number(windowPx);
  return px > 0 && px < WIDE_WINDOW_PX ? "compact" : "roomy";
}

function widthsFor_(which, layout) {
  return LAYOUTS_[which][layout === "compact" ? "compact" : "roomy"];
}

function storedLayout_() {
  try { return PropertiesService.getUserProperties().getProperty(LAYOUT_KEY) || ""; } catch (e) { return ""; }
}

function currentLayout_() { return storedLayout_() || "roomy"; }

function applyLayout_(ss, layout) {
  const inv = ss.getSheetByName(INVOICES_SHEET);
  if (inv) widthsFor_("invoices", layout).forEach(function (w, i) { inv.setColumnWidth(i + 1, w); });
  const start = ss.getSheetByName(START_HERE_SHEET);
  if (start) widthsFor_("startHere", layout).forEach(function (w, i) { start.setColumnWidth(i + 1, w); });
}

// Called by the panel with the window width. Only touches the sheet when the layout actually changes.
function rememberWindowWidth_(ss, windowPx) {
  if (!(Number(windowPx) > 0)) return;
  const layout = layoutFor_(windowPx);
  if (layout === storedLayout_()) return;
  PropertiesService.getUserProperties().setProperty(LAYOUT_KEY, layout);
  applyLayout_(ss, layout);
}

if (typeof module !== "undefined") module.exports = { layoutFor_: layoutFor_, widthsFor_: widthsFor_, LAYOUTS_: LAYOUTS_, WIDE_WINDOW_PX: WIDE_WINDOW_PX };
