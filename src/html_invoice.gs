// =====================================================================================
// INVOICE PDF FROM HTML  (matches the approved mockup)
//
// Google Docs can't reproduce the mockup exactly (one-piece header band, exact spacing, rule lines),
// so this builds the invoice as a web page with the mockup's own sizes and colors and has Google turn
// it into a PDF. Layout uses plain tables and inline styles, which Google's converter handles reliably
// (it doesn't do newer layout like flexbox).
//
// Layout, top to bottom:
//   1. Rose band: business name on one line (shrunk to fit), address under it on the left,
//      "PAYOUT INVOICE" small and letter-spaced at the bottom right.
//   2. Two columns: Practitioner / Pay period / Bookings stacked on the left; a blush box on the right
//      with NET PAYOUT, the amount, and "sent by e-transfer".
//   3. SERVICES (and one table per event): white header with small grey labels and a 2px rose rule,
//      faint lines between rows, fees grey "−$", gratuity green "+$", zero as "—", payout bold, and
//      "includes $x product fee" under a service that has one.
//   4. SUMMARY, full width: faint lines, gratuity and bonuses green, then a 2px rose rule and
//      "Net payout" in bold rose.
//   5. Footer: faint rule, the reply-to-email line on the left, the file name on the right.
//
// buildInvoiceHtml_ is pure (no Google calls) so it can be previewed and tested off the sheet.
// buildInvoicePdfHtml_ takes the same arguments as buildInvoicePdf (the Docs version) and saves the PDF.
// =====================================================================================

const INV_ = {
  rose: "#A13D63", heading: "#872D51", roseDark: "#86304F", blush: "#F7E4E9", text: "#2E2A2C",
  grey: "#6B6266", green: "#2F6B4F", line: "#EFE6EA"
};

function money_(n) { return "$" + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function esc_(v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// Business name size so it stays on one line in the band (about 500px of room; Fraunces ≈ 0.56em a letter).
function bandNameSize_(name) {
  const len = Math.max(1, String(name).length);
  return Math.max(16, Math.min(34, Math.floor(500 / (len * 0.56))));
}

/**
 * d: { businessName, businessAddress, practitioner, periodLong, bookingsLabel, net, fileName,
 *      regular: [row], events: [{ name, rows }], ledger: [[label, amount, "fee"|"plus"|""]] }
 * row: { date, service, productNote, price, facility, linen, serviceFee, gratuity, payout } as display strings.
 */
function buildInvoiceHtml_(d) {
  const C = INV_;
  const sectionHead = function (t) {
    return '<div style="font-size:11px;font-weight:700;letter-spacing:0.14em;color:' + C.heading + ';padding:0 0 8px">' + esc_(t) + '</div>';
  };
  const itemsTable = function (rows, withServiceFee) {
    const cols = [
      ["Date", "left"], ["Service", "left"], ["Price", "right"], ["Facility fee", "right"],
      ["Linen", "right"]
    ].concat(withServiceFee ? [["Service fee", "right"]] : []).concat([["Gratuity", "right"], ["Payout", "right"]]);
    const th = cols.map(function (c) {
      return '<th style="text-align:' + c[1] + ';padding:0 8px 7px;font-size:10px;font-weight:700;letter-spacing:0.06em;color:' + C.grey +
        ';background:#FFFFFF;border-bottom:2px solid ' + C.rose + '">' + c[0].toUpperCase() + '</th>';
    }).join("");
    const isNone = function (v) { return v === "—" || v === "" || v == null; };
    const body = rows.map(function (r) {
      const td = function (content, align, style) {
        return '<td style="padding:9px 8px;border-bottom:1px solid ' + C.line + ';text-align:' + align + ';vertical-align:top;' + (style || "") + '">' + content + '</td>';
      };
      const fee = function (v) { return td(esc_(v), "right", "color:" + C.grey + ";"); };
      return '<tr>' +
        td(esc_(r.date), "left", "color:" + C.grey + ";white-space:nowrap;") +
        td(esc_(r.service) + (r.productNote ? '<div style="font-size:10.5px;color:' + C.grey + ';margin-top:2px">' + esc_(r.productNote) + '</div>' : ""), "left") +
        td(esc_(r.price), "right") +
        fee(r.facility) +
        fee(r.linen) +
        (withServiceFee ? fee(r.serviceFee) : "") +
        td(esc_(r.gratuity), "right", isNone(r.gratuity) ? "color:" + C.grey + ";" : "color:" + C.green + ";") +
        td(esc_(r.payout), "right", "font-weight:700;") +
        '</tr>';
    }).join("");
    return '<table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr>' + th + '</tr></thead><tbody>' + body + '</tbody></table>';
  };

  const addressLines = String(d.businessAddress || "").split("\n").filter(String);
  const sections = [];
  if (d.regular.length) sections.push(sectionHead("SERVICES") + itemsTable(d.regular, false));
  d.events.forEach(function (ev) { sections.push(sectionHead("EVENT · " + String(ev.name).toUpperCase()) + itemsTable(ev.rows, true)); });

  const ledger = d.ledger.map(function (l) {
    const color = l[2] === "fee" ? C.grey : l[2] === "plus" ? C.green : C.text;
    const labelColor = l[2] === "plus" ? C.green : C.text;
    return '<tr><td style="padding:8px 0;border-bottom:1px solid ' + C.line + ';color:' + labelColor + '">' + esc_(l[0]) + '</td>' +
      '<td style="padding:8px 0;border-bottom:1px solid ' + C.line + ';text-align:right;color:' + color + '">' + esc_(l[1]) + '</td></tr>';
  }).join("") +
    '<tr><td style="padding:11px 0 0;border-top:2px solid ' + C.rose + ';font-size:15px;font-weight:700;color:' + C.rose + '">Net payout</td>' +
    '<td style="padding:11px 0 0;border-top:2px solid ' + C.rose + ';font-size:15px;font-weight:700;color:' + C.rose + ';text-align:right">' + esc_(d.net) + '</td></tr>';

  const fact = function (label, value, size) {
    return '<div style="font-size:10px;font-weight:700;letter-spacing:0.12em;color:' + C.grey + '">' + label + '</div>' +
      '<div style="font-size:' + size + 'px;font-weight:700;margin:3px 0 12px">' + esc_(value) + '</div>';
  };

  return '<!doctype html><html><head><meta charset="utf-8">' +
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:wght@600&display=swap" rel="stylesheet">' +
    '<style>@page{size:letter;margin:0}html,body{margin:0;padding:0}' +
    'body{font-family:"DM Sans","Helvetica Neue",Arial,sans-serif;color:' + C.text + ';-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    'table{border-collapse:collapse}</style></head><body>' +
    '<div style="width:816px;box-sizing:border-box;padding:48px 56px">' +

    // 1. Rose band
    '<table cellspacing="0" cellpadding="0" style="width:100%;background:' + C.rose + ';color:#FFFFFF"><tr>' +
    '<td style="padding:22px 26px;vertical-align:bottom">' +
    '<div style="font-family:Fraunces,Georgia,serif;font-weight:600;font-size:' + bandNameSize_(d.businessName) + 'px;line-height:1.05;white-space:nowrap">' + esc_(d.businessName) + '</div>' +
    (addressLines.length ? '<div style="font-size:11.5px;line-height:1.5;margin-top:8px">' + addressLines.map(esc_).join("<br>") + '</div>' : "") + '</td>' +
    '<td style="padding:22px 26px;vertical-align:bottom;text-align:right;white-space:nowrap;font-size:11px;font-weight:700;letter-spacing:0.16em">PAYOUT INVOICE</td>' +
    '</tr></table>' +

    // 2. Facts on the left, net payout box on the right
    '<table cellspacing="0" cellpadding="0" style="width:100%;margin-top:22px"><tr>' +
    '<td style="vertical-align:top;padding:2px 16px 0 4px">' +
    fact("PRACTITIONER", d.practitioner, 20) + fact("PAY PERIOD", d.periodLong, 13) + fact("BOOKINGS", d.bookingsLabel, 13) + '</td>' +
    '<td style="width:250px;vertical-align:middle;text-align:right;background:' + C.blush + ';padding:18px 22px">' +
    '<div style="font-size:11px;font-weight:700;letter-spacing:0.14em;color:' + C.roseDark + '">NET PAYOUT</div>' +
    '<div style="font-size:34px;font-weight:700;color:' + C.rose + ';line-height:1.15;margin:4px 0 2px">' + esc_(d.net) + '</div>' +
    '<div style="font-size:12px;color:' + C.grey + '">sent by e-transfer</div></td>' +
    '</tr></table>' +

    // 3. Services and events
    sections.map(function (sec) { return '<div style="margin-top:24px">' + sec + '</div>'; }).join("") +

    // 4. Summary, full width
    '<div style="margin-top:24px">' + sectionHead("SUMMARY") +
    '<table cellspacing="0" cellpadding="0" style="width:100%;font-size:12.5px">' + ledger + '</table></div>' +

    // 5. Footer
    '<table cellspacing="0" cellpadding="0" style="width:100%;margin-top:34px;border-top:1px solid ' + C.line + ';font-size:10.5px;color:' + C.grey + '"><tr>' +
    '<td style="padding-top:12px">Questions about this invoice? Reply to the email it came with.</td>' +
    '<td style="padding-top:12px;text-align:right">' + esc_(d.fileName || "") + '</td></tr></table>' +
    '</div></body></html>';
}

/**
 * Turns the numbers the Docs version receives into the display data above. Same arguments as buildInvoicePdf,
 * plus fmt: { dayShort(d) → "Fri Nov 20", long(d) → "Friday, Nov 20", year(d) → "2026" } and the file name.
 */
function invoiceHtmlData_(businessName, businessAddress, practitionerName, periodStart, periodEnd, lineItems,
  facilityFeePercent, grossTotal, facilityFeeTotal, productFeeTotal, productCount, productRate,
  linenTotal, linenCount, linenRate, eventTotals, gratuityTotal, netAmount, fmt, fileName) {
  const minus = function (n) { return n > 0 ? "−" + money_(n) : "—"; };
  const plus = function (n) { return n > 0 ? "+" + money_(n) : "—"; };
  const row = function (item) {
    return {
      date: fmt.dayShort(item.date), service: item.service,
      productNote: item.productFee > 0 ? "less " + money_(item.productFee) + " product fee" : "",
      price: money_(item.price), facility: minus(item.facilityFee), linen: minus(item.linenFee),
      serviceFee: plus(item.convenience), gratuity: plus(item.gratAmt), payout: money_(item.payout)
    };
  };
  const pct = Math.round(facilityFeePercent * 1000) / 10;
  const eventNames = Object.keys(eventTotals);
  const travel = eventNames.reduce(function (s, n) { return s + eventTotals[n].travel; }, 0);
  const svcBonus = eventNames.reduce(function (s, n) { return s + eventTotals[n].convenience; }, 0);
  const ledger = [["Services", money_(grossTotal), ""], ["Facility fee (" + pct + "%)", "−" + money_(facilityFeeTotal), "fee"]];
  if (linenCount > 0) ledger.push(["Linen fee, " + linenCount + " × " + money_(linenRate), "−" + money_(linenTotal), "fee"]);
  if (productCount > 0) ledger.push(["Product fee, " + productCount + " × " + money_(productRate), "−" + money_(productFeeTotal), "fee"]);
  if (travel > 0) ledger.push(["Travel bonus", "+" + money_(travel), "plus"]);
  if (svcBonus > 0) ledger.push(["Event service fee bonus", "+" + money_(svcBonus), "plus"]);
  if (gratuityTotal > 0) ledger.push(["Gratuity", "+" + money_(gratuityTotal), "plus"]);
  const n = lineItems.length;
  return {
    businessName: String(businessName), businessAddress: String(businessAddress || ""), practitioner: String(practitionerName),
    periodLong: fmt.long(periodStart) + " to " + fmt.long(periodEnd) + ", " + fmt.year(periodEnd),
    bookingsLabel: n + " service" + (n === 1 ? "" : "s"), net: money_(netAmount), fileName: fileName || "",
    regular: lineItems.filter(function (i) { return !i.eventName; }).map(row),
    // Each event ends with its Travel line, so the Payout column adds up to Net payout.
    events: eventNames.map(function (nm) {
      const rows = lineItems.filter(function (i) { return i.eventName === nm; }).map(row);
      const t = eventTotals[nm].travel;
      if (t > 0) rows.push({ date: "", service: "Travel (once for this event)", productNote: "", price: "", facility: "",
        linen: "", serviceFee: "", gratuity: "", payout: money_(t) });
      return { name: nm, rows: rows };
    }),
    ledger: ledger
  };
}

function buildInvoicePdfHtml_(folder, businessName, businessAddress, practitionerName, periodStart, periodEnd, lineItems,
  facilityFeePercent, grossTotal, facilityFeeTotal, productFeeTotal, productCount, productRate,
  linenTotal, linenCount, linenRate, eventTotals, gratuityTotal, netAmount, fileName) {
  const tz = Session.getScriptTimeZone();
  const name = fileName || (practitionerName + " - Invoice - " + fmtDate(periodStart, "-") + ".pdf");
  const data = invoiceHtmlData_(businessName, businessAddress, practitionerName, periodStart, periodEnd, lineItems,
    facilityFeePercent, grossTotal, facilityFeeTotal, productFeeTotal, productCount, productRate,
    linenTotal, linenCount, linenRate, eventTotals, gratuityTotal, netAmount,
    { dayShort: function (d) { return Utilities.formatDate(d, tz, "EEE MMM d"); },
      long: function (d) { return Utilities.formatDate(d, tz, "EEEE, MMM d"); },
      year: function (d) { return Utilities.formatDate(d, tz, "yyyy"); } }, name);
  const blob = HtmlService.createHtmlOutput(buildInvoiceHtml_(data)).getAs("application/pdf");
  blob.setName(name);
  trashFilesNamed_(folder, name);
  return folder.createFile(blob);
}

// Every invoice goes through here: the mockup version, or the Docs version if Google's HTML-to-PDF converter
// ever fails on one, so a run of invoices always finishes. The failure is kept for the Health Check.
function makeInvoicePdf_(folder, businessName, businessAddress, practitionerName, periodStart, periodEnd, lineItems,
  facilityFeePercent, grossTotal, facilityFeeTotal, productFeeTotal, productCount, productRate,
  linenTotal, linenCount, linenRate, eventTotals, gratuityTotal, netAmount) {
  const args = Array.prototype.slice.call(arguments);
  try {
    return buildInvoicePdfHtml_.apply(null, args);
  } catch (err) {
    recordError_("Invoice PDF (new look) for " + practitionerName + ", used the plain version instead", err);
    return buildInvoicePdf.apply(null, args);
  }
}

if (typeof module !== "undefined") module.exports = { buildInvoiceHtml_: buildInvoiceHtml_, invoiceHtmlData_: invoiceHtmlData_, money_: money_, bandNameSize_: bandNameSize_ };
