// =====================================================================================
// REPORT PDFS FROM HTML  (same style as the invoice)
//
// The manager's review summary and the business totals, built like the invoice: the rose band with the
// business name, key facts beside one big number in a blush box, rose section headings, white-header
// tables with a 2px rose rule and faint row lines, full-width ledgers, and a footer with the file name.
// Plain tables and inline styles only, for Google's HTML-to-PDF converter.
//
// The builders are pure (no Google calls). makeReviewSummaryPdf_ / makeBusinessTotalsPdf_ save the PDF,
// and fall back to the Docs versions if the converter ever fails, so a report is always produced.
// =====================================================================================

// ---------------------------------------------------------------- shared pieces (pure)

const RPT_ = {
  page: function (inner) {
    return '<!doctype html><html><head><meta charset="utf-8">' +
      '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:wght@600&display=swap" rel="stylesheet">' +
      '<style>@page{size:letter;margin:0}html,body{margin:0;padding:0}' +
      'body{font-family:"DM Sans","Helvetica Neue",Arial,sans-serif;color:' + INV_.text + ';-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
      'table{border-collapse:collapse}</style></head><body><div style="width:816px;box-sizing:border-box;padding:48px 56px">' +
      inner + '</div></body></html>';
  },
  band: function (name, address, rightLabel) {
    const lines = String(address || "").split("\n").filter(String);
    return '<table cellspacing="0" cellpadding="0" style="width:100%;background:' + INV_.rose + ';color:#FFFFFF"><tr>' +
      '<td style="padding:22px 26px;vertical-align:bottom">' +
      '<div style="font-family:Fraunces,Georgia,serif;font-weight:600;font-size:' + bandNameSize_(name) + 'px;line-height:1.05;white-space:nowrap">' + esc_(name) + '</div>' +
      (lines.length ? '<div style="font-size:11.5px;line-height:1.5;margin-top:8px">' + lines.map(esc_).join("<br>") + '</div>' : "") + '</td>' +
      '<td style="padding:22px 26px;vertical-align:bottom;text-align:right;white-space:nowrap;font-size:11px;font-weight:700;letter-spacing:0.16em">' + esc_(rightLabel) + '</td>' +
      '</tr></table>';
  },
  // facts: [[LABEL, value, size]]; box: { label, amount, sub }
  factsAndBox: function (facts, box) {
    return '<table cellspacing="0" cellpadding="0" style="width:100%;margin-top:22px"><tr>' +
      '<td style="vertical-align:top;padding:2px 16px 0 4px">' + facts.map(function (f) {
        return '<div style="font-size:10px;font-weight:700;letter-spacing:0.12em;color:' + INV_.grey + '">' + esc_(f[0]) + '</div>' +
          '<div style="font-size:' + (f[2] || 13) + 'px;font-weight:700;margin:3px 0 12px">' + esc_(f[1]) + '</div>';
      }).join("") + '</td>' +
      '<td style="width:250px;vertical-align:middle;text-align:right;background:' + INV_.blush + ';padding:18px 22px">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:0.14em;color:' + INV_.roseDark + '">' + esc_(box.label) + '</div>' +
      '<div style="font-size:34px;font-weight:700;color:' + INV_.rose + ';line-height:1.15;margin:4px 0 2px">' + esc_(box.amount) + '</div>' +
      '<div style="font-size:12px;color:' + INV_.grey + '">' + esc_(box.sub) + '</div></td></tr></table>';
  },
  section: function (label, inner, color) {
    return '<div style="margin-top:24px"><div style="font-size:11px;font-weight:700;letter-spacing:0.14em;color:' + (color || INV_.heading) +
      ';padding:0 0 8px">' + esc_(label) + '</div>' + inner + '</div>';
  },
  /**
   * cols: [[heading, "left"|"right"|"center"]]; rows: arrays of cell text.
   * o: { total: last row is a total (2px rose rule above, bold rose), boldCols: [i], greyCols: [i],
   *      rowStyle: function(rowIndex) → extra css, cellStyle: function(rowIndex, col) → extra css, fontSize }
   */
  table: function (cols, rows, o) {
    o = o || {};
    const th = cols.map(function (c) {
      return '<th style="text-align:' + c[1] + ';padding:0 8px 7px;font-size:10px;font-weight:700;letter-spacing:0.06em;color:' + INV_.grey +
        ';background:#FFFFFF;border-bottom:2px solid ' + INV_.rose + '">' + esc_(String(c[0]).toUpperCase()) + '</th>';
    }).join("");
    const body = rows.map(function (r, i) {
      const isTotal = o.total && i === rows.length - 1;
      return '<tr style="' + (o.rowStyle ? o.rowStyle(i) : "") + '">' + r.map(function (v, j) {
        let css = 'padding:' + (isTotal ? "10px" : "8px") + ' 8px;text-align:' + cols[j][1] + ';vertical-align:top;';
        css += isTotal ? 'border-top:2px solid ' + INV_.rose + ';font-weight:700;color:' + INV_.rose + ';'
          : 'border-bottom:1px solid ' + INV_.line + ';';
        if (!isTotal && (o.boldCols || []).indexOf(j) !== -1) css += 'font-weight:700;';
        if (!isTotal && (o.greyCols || []).indexOf(j) !== -1) css += 'color:' + INV_.grey + ';';
        if (o.cellStyle) css += o.cellStyle(i, j) || "";
        return '<td style="' + css + '">' + esc_(v) + '</td>';
      }).join("") + '</tr>';
    }).join("");
    return '<table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;font-size:' + (o.fontSize || 12) + 'px">' +
      '<thead><tr>' + th + '</tr></thead><tbody>' + body + '</tbody></table>';
  },
  // rows: [[label, amount, "fee"|"plus"|"bold"|""]]; total: [label, amount] or null
  ledger: function (rows, total) {
    return '<table cellspacing="0" cellpadding="0" style="width:100%;font-size:12.5px">' + rows.map(function (l) {
      const color = l[2] === "fee" ? INV_.grey : l[2] === "plus" ? INV_.green : INV_.text;
      const weight = l[2] === "bold" ? "font-weight:700;" : "";
      return '<tr><td style="padding:8px 0;border-bottom:1px solid ' + INV_.line + ';color:' + (l[2] === "plus" ? INV_.green : INV_.text) + ';' + weight + '">' + esc_(l[0]) + '</td>' +
        '<td style="padding:8px 0;border-bottom:1px solid ' + INV_.line + ';text-align:right;color:' + color + ';' + weight + '">' + esc_(l[1]) + '</td></tr>';
    }).join("") + (total ?
      '<tr><td style="padding:11px 0 0;border-top:2px solid ' + INV_.rose + ';font-size:15px;font-weight:700;color:' + INV_.rose + '">' + esc_(total[0]) + '</td>' +
      '<td style="padding:11px 0 0;border-top:2px solid ' + INV_.rose + ';font-size:15px;font-weight:700;color:' + INV_.rose + ';text-align:right">' + esc_(total[1]) + '</td></tr>' : "") +
      '</table>';
  },
  lines: function (items) {  // [[text, "good"|"bad"|"muted"|""]]
    return items.map(function (l) {
      const color = l[1] === "good" ? INV_.green : l[1] === "bad" ? "#9B2C22" : l[1] === "muted" ? INV_.grey : INV_.text;
      return '<div style="font-size:12.5px;padding:4px 0;color:' + color + ';' + (l[1] === "good" || l[1] === "bad" ? "font-weight:700;" : "") + '">' + esc_(l[0]) + '</div>';
    }).join("");
  },
  footer: function (left, right) {
    return '<table cellspacing="0" cellpadding="0" style="width:100%;margin-top:34px;border-top:1px solid ' + INV_.line + ';font-size:10.5px;color:' + INV_.grey + '"><tr>' +
      '<td style="padding-top:12px">' + esc_(left) + '</td><td style="padding-top:12px;text-align:right">' + esc_(right) + '</td></tr></table>';
  }
};

// ---------------------------------------------------------------- the two reports (pure)

/** r: { businessName, businessAddress, periodLong, prepared, fileName, computed, bookings, fmtDay } */
function buildReviewSummaryHtml_(r) {
  const c = r.computed;
  let tb = 0, tg = 0, tc = 0, tf = 0, tn = 0;
  const rows = c.results.map(function (x) {
    tb += x.txnCount; tg += x.grossTotal; tc += x.compedTotal; tf += x.facilityFeeTotal; tn += x.netAmount;
    return [x.name, String(x.txnCount), money_(x.grossTotal), money_(x.compedTotal), money_(x.facilityFeeTotal), money_(x.netAmount)];
  });
  if (rows.length) rows.push(["Total", String(tb), money_(tg), money_(tc), money_(tf), money_(tn)]);

  const noteRows = {};
  const brows = r.bookings.map(function (b, i) {
    if (b.notes.length) noteRows[i] = true;
    return [r.fmtDay(b.date), b.practitioner, b.client, b.service, money_(b.price), b.gratuity ? "+" + money_(b.gratuity) : "—", b.notes.join("; ")];
  });

  let inner = RPT_.band(r.businessName, r.businessAddress, "PAYROLL REVIEW SUMMARY") +
    RPT_.factsAndBox([["PAY PERIOD", r.periodLong, 13], ["BOOKINGS", tb + " booking" + (tb === 1 ? "" : "s"), 13],
      ["PRACTITIONERS", String(c.results.length), 13]], { label: "TO PAY OUT", amount: money_(tn), sub: "all practitioners, this week" });

  inner += RPT_.section("TOTALS BY PRACTITIONER", rows.length
    ? RPT_.table([["Practitioner", "left"], ["Bookings", "right"], ["Gross", "right"], ["Comped", "right"], ["Facility fee", "right"], ["Net payout", "right"]],
        rows, { total: true, boldCols: [5], greyCols: [4] })
    : RPT_.lines([["No invoiced bookings this week.", "muted"]]));

  inner += RPT_.section("ALL BOOKINGS THIS WEEK", brows.length
    ? RPT_.table([["Date", "left"], ["Practitioner", "left"], ["Client", "left"], ["Service", "left"], ["Price", "right"], ["Gratuity", "right"], ["Notes", "left"]],
        brows, { fontSize: 11, greyCols: [0],
          rowStyle: function (i) { return noteRows[i] ? "background:#FFF8E6;" : ""; },
          cellStyle: function (i, j) { return j === 5 && brows[i][5] !== "—" ? "color:" + INV_.green + ";" : (j === 6 && noteRows[i] ? "font-weight:700;color:#6A4A00;" : ""); } }) +
      (Object.keys(noteRows).length ? RPT_.lines([["Rows in yellow have notes: comped, custom price, linen fee removed, or an event.", "muted"]]) : "")
    : RPT_.lines([["No bookings dated this week.", "muted"]]));

  if (c.skipped.length) {
    inner += RPT_.section("ROWS LEFT OUT (NEED FIXING)", RPT_.lines(c.skipped.slice(0, 8).map(function (s) { return ["Row " + s.row + ": " + s.reason, ""]; })
      .concat(c.skipped.length > 8 ? [["…and " + (c.skipped.length - 8) + " more.", "muted"]] : [])), "#9B2C22");
  }
  if (c.outOfPeriod > 0) inner += RPT_.lines([[c.outOfPeriod + " row(s) dated outside this pay week are not included above.", "muted"]]);
  inner += RPT_.footer("Prepared " + r.prepared + ". Nothing in this summary has been emailed to practitioners.", r.fileName);
  return RPT_.page(inner);
}

/** r: { businessName, businessAddress, periodLong, prepared, fileName, computed, bookings } */
function buildBusinessTotalsHtml_(r) {
  const c = r.computed;
  const money = function (n) { return n < 0 ? "(" + money_(-n) + ")" : money_(n); };
  const t = { count: 0, gross: 0, comped: 0, facility: 0, linen: 0, product: 0, eventFees: 0, gratuity: 0, net: 0 };
  c.results.forEach(function (x) {
    t.count += x.txnCount; t.gross += x.grossTotal; t.comped += x.compedTotal; t.facility += x.facilityFeeTotal;
    t.linen += x.linenTotal; t.product += x.productFeeTotal; t.eventFees += x.eventFeesTotal;
    t.gratuity += x.gratuityTotal; t.net += x.netAmount;
  });
  const collected = t.gross - t.comped;
  const broughtIn = collected + t.gratuity + t.eventFees;
  const keeps = broughtIn - t.net;
  const feesLessComps = t.facility + t.linen + t.product - t.comped;
  const balanced = Math.abs(keeps - feesLessComps) < 0.01;
  const compedCount = r.bookings.filter(function (b) { return b.notes.some(function (n) { return n.indexOf("COMPED") === 0; }); }).length;

  let inner = RPT_.band(r.businessName, r.businessAddress, "BUSINESS TOTALS") +
    RPT_.factsAndBox([["PAY PERIOD", r.periodLong, 13], ["BOOKINGS", t.count + " booking" + (t.count === 1 ? "" : "s"), 13],
      ["PRACTITIONERS", String(c.results.length), 13]], { label: "BUSINESS KEEPS", amount: money(keeps), sub: "brought in, less paid out" });

  inner += RPT_.section("THE WEEK AT A GLANCE", RPT_.ledger([
    ["Gross service value (list price of every booking)", money(t.gross), ""],
    ["Comped (services given away)", "−" + money_(t.comped), "fee"],
    ["Collected for services", money(collected), "bold"],
    ["Gratuity (passed through to practitioners)", "+" + money_(t.gratuity), "plus"],
    ["Event fees (travel and event service fees)", "+" + money_(t.eventFees), "plus"],
    ["Total brought in", money(broughtIn), "bold"],
    ["Paid out to practitioners (net)", "−" + money_(t.net), "fee"]
  ], ["Business keeps", money(keeps)]));

  inner += RPT_.section("WHERE THE BUSINESS'S SHARE COMES FROM", RPT_.ledger([
    ["Facility fees", money(t.facility), ""],
    ["Linen fees", money(t.linen), ""],
    ["Product fees", money(t.product), ""],
    ["Comped (cost of services given away)", "−" + money_(t.comped), "fee"]
  ], ["Business keeps", money(feesLessComps)]));

  const rows = c.results.map(function (x) {
    return [x.name, String(x.txnCount), money_(x.grossTotal), money_(x.compedTotal), money_(x.facilityFeeTotal), money_(x.linenTotal),
      money_(x.productFeeTotal), money_(x.eventFeesTotal), money_(x.gratuityTotal), money_(x.netAmount)];
  });
  if (rows.length) rows.push(["Total", String(t.count), money_(t.gross), money_(t.comped), money_(t.facility), money_(t.linen),
    money_(t.product), money_(t.eventFees), money_(t.gratuity), money_(t.net)]);
  inner += RPT_.section("BY PRACTITIONER", rows.length
    ? RPT_.table([["Practitioner", "left"], ["Jobs", "right"], ["Gross", "right"], ["Comped", "right"], ["Facility", "right"], ["Linen", "right"],
        ["Product", "right"], ["Event", "right"], ["Gratuity", "right"], ["Net", "right"]], rows, { total: true, boldCols: [9], fontSize: 10.5 })
    : RPT_.lines([["No invoiced bookings this week.", "muted"]]));

  const checks = [[balanced ? "Balanced: brought in minus paid out equals fees minus comps."
    : "DOES NOT BALANCE: brought in minus paid out is " + money(keeps) + " but fees minus comps is " + money(feesLessComps) + ". Check Transactions before relying on these numbers.",
    balanced ? "good" : "bad"],
    [t.count + " booking(s) across " + c.results.length + " practitioner(s); " + compedCount + " comped.", ""]];
  if (c.skipped.length) checks.push([c.skipped.length + " row(s) on Transactions were left out of these totals (see the review summary or run 1 · Check this week's totals).", "bad"]);
  if ((c.mismatches || []).length) checks.push(["The Net on Transactions disagrees with this report for: " + c.mismatches.map(function (m) { return m.name; }).join(", ") + ".", "bad"]);
  if (c.outOfPeriod > 0) checks.push([c.outOfPeriod + " row(s) dated outside this pay week are not included.", "muted"]);
  inner += RPT_.section("CHECKS", RPT_.lines(checks));
  inner += RPT_.footer("Prepared " + r.prepared + ". For the business's own records; nothing here is emailed.", r.fileName);
  return RPT_.page(inner);
}

// ---------------------------------------------------------------- saving (Google calls)

function reportData_(fileName, businessName, periodStart, periodEnd, computed, bookings) {
  const tz = Session.getScriptTimeZone();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const addr = ss.getRangeByName("BusinessAddress");
  return {
    businessName: String(businessName), businessAddress: addr ? String(addr.getValue()) : "",
    periodLong: Utilities.formatDate(periodStart, tz, "EEEE, MMM d") + " to " + Utilities.formatDate(periodEnd, tz, "EEEE, MMM d, yyyy"),
    prepared: Utilities.formatDate(new Date(), tz, "MMMM d, yyyy"), fileName: fileName, computed: computed, bookings: bookings,
    fmtDay: function (d) { return d instanceof Date ? Utilities.formatDate(d, tz, "EEE MMM d") : String(d); }
  };
}

function saveHtmlPdf_(folder, fileName, html) {
  const blob = HtmlService.createHtmlOutput(html).getAs("application/pdf");
  blob.setName(fileName);
  return folder.createFile(blob);
}

// Same arguments and result (the saved file) as the Docs versions they replace.
function makeReviewSummaryPdf_(folder, fileName, businessName, periodStart, periodEnd, computed, bookings) {
  try {
    return saveHtmlPdf_(folder, fileName, buildReviewSummaryHtml_(reportData_(fileName, businessName, periodStart, periodEnd, computed, bookings)));
  } catch (err) {
    recordError_("Manager summary PDF (new look), used the plain version instead", err);
    return buildReviewSummaryPdf_(folder, fileName, businessName, periodStart, periodEnd, computed, bookings);
  }
}

function makeBusinessTotalsPdf_(folder, fileName, businessName, periodStart, periodEnd, computed, bookings) {
  try {
    return saveHtmlPdf_(folder, fileName, buildBusinessTotalsHtml_(reportData_(fileName, businessName, periodStart, periodEnd, computed, bookings)));
  } catch (err) {
    recordError_("Business totals PDF (new look), used the plain version instead", err);
    return buildBusinessTotalsPdf_(folder, fileName, businessName, periodStart, periodEnd, computed, bookings);
  }
}

if (typeof module !== "undefined") module.exports = { buildReviewSummaryHtml_: buildReviewSummaryHtml_, buildBusinessTotalsHtml_: buildBusinessTotalsHtml_ };
