// =====================================================================================
// FLORA PDF STYLE
//
// One look for every PDF the script makes (practitioner invoices, the manager's review summary,
// business totals), matching the approved invoice mockup: a rose header band, a row of key facts,
// one big highlighted number, then roomy tables with soft striped rows instead of grid lines.
// These helpers only draw; every number is worked out by the code that calls them.
// =====================================================================================

const PDF_ = {
  font: "DM Sans", serif: "Fraunces",
  rose: "#A13D63", roseDark: "#86304F", blush: "#F7E4E9", zebra: "#FBF8F9",
  text: "#2E2A2C", muted: "#6B6266", amber: "#FFF3D6", red: "#9B2C22", green: "#2F6B4F", white: "#FFFFFF",
  width: 516  // letter page (612pt) less 48pt margins each side; every table adds up to this
};

// "Nov 20 – Nov 26, 2026" (the year on both ends only when the week crosses New Year).
function fmtPeriod_(start, end) {
  const tz = Session.getScriptTimeZone();
  const y1 = Utilities.formatDate(start, tz, "yyyy"), y2 = Utilities.formatDate(end, tz, "yyyy");
  return fmtDateShort(start) + (y1 !== y2 ? ", " + y1 : "") + " – " + fmtDateShort(end) + ", " + y2;
}

function floraPdf_(body) {
  body.setMarginTop(40).setMarginBottom(40).setMarginLeft(48).setMarginRight(48);
  // body.clear() leaves one empty paragraph at the top; make it take no room.
  if (body.getNumChildren() && body.getChild(0).getType() === DocumentApp.ElementType.PARAGRAPH) {
    // Docs refuses to style an EMPTY paragraph ("Service error: Documents"), and an unstyled blank line is
    // a tall 11pt gap. So the leftover first line gets a single space, which can be shrunk to almost nothing.
    shrink(body.getChild(0).asParagraph().setText(" "), 0);
  }

  // Styling is cosmetic: if Docs ever refuses one step, keep going with that bit unstyled rather than
  // lose the whole PDF. The words and numbers are already on the page by the time this runs.
  function styleText(p, o) {
    try { return styleText_(p, o); } catch (err) { return p; }
  }
  function styleText_(p, o) {
    o = o || {};
    p.setSpacingBefore(o.before != null ? o.before : 0).setSpacingAfter(o.after != null ? o.after : 0).setLineSpacing(o.lineSpacing || 1.1);
    if (o.align) p.setAlignment(o.align);
    const t = p.editAsText();
    if (p.getText().length) {
      t.setFontSize(o.size || 9.5).setBold(!!o.bold).setItalic(!!o.italic).setForegroundColor(o.color || PDF_.text);
      // A font Docs doesn't offer must never stop the PDF: fall back to Arial.
      try { t.setFontFamily(o.serif ? PDF_.serif : PDF_.font); } catch (err) { t.setFontFamily("Arial"); }
    }
    return p;
  }
  function para(text, o) { return styleText(body.appendParagraph(text), o); }
  // A blank line between blocks, at the exact height wanted (see the note above about empty paragraphs).
  function shrink(p, after) {
    try { p.setSpacingBefore(0).setSpacingAfter(after).setLineSpacing(1); p.editAsText().setFontSize(2); } catch (err) { /* cosmetic */ }
    return p;
  }
  function gap(after) { return shrink(body.appendParagraph(" "), after); }
  // Sets a table cell to one or more lines, each styled. lines: [[text, opts], ...]
  function fillCell(cell, lines) {
    lines.forEach(function (l, i) {
      const p = i === 0 ? cell.getChild(0).asParagraph() : cell.appendParagraph("");
      p.setText(String(l[0]));
      styleText(p, l[1]);
    });
  }
  function bareTable(rows, widths) {
    const t = body.appendTable(rows);
    t.setBorderWidth(0);
    widths.forEach(function (w, i) { t.setColumnWidth(i, w); });
    return t;
  }
  function pad(cell, v, h) { try { cell.setPaddingTop(v).setPaddingBottom(v).setPaddingLeft(h).setPaddingRight(h); } catch (err) { /* cosmetic */ } }

  // Rose band: business name (serif), a small kicker line under it, and a right-hand note (address, date).
  function band(title, kicker, right) {
    const t = bareTable([["", ""]], [316, 200]);
    const left = t.getCell(0, 0), r = t.getCell(0, 1);
    [left, r].forEach(function (c) { c.setBackgroundColor(PDF_.rose).setVerticalAlignment(DocumentApp.VerticalAlignment.BOTTOM); pad(c, 16, 18); });
    fillCell(left, [[title, { serif: true, size: 24, bold: true, color: PDF_.white, after: 4 }],
                    [kicker, { size: 8, bold: true, color: PDF_.white }]]);
    const rightLines = String(right || "").split("\n").filter(String);
    fillCell(r, (rightLines.length ? rightLines : [" "]).map(function (l) {
      return [l, { size: 8.5, color: PDF_.white, align: DocumentApp.HorizontalAlignment.RIGHT, lineSpacing: 1.2 }];
    }));
    gap(14);
  }

  // A row of small labelled facts: [[label, value], ...] (2 to 4 of them).
  function info(pairs) {
    const w = Math.floor(PDF_.width / pairs.length);
    const t = bareTable([pairs.map(function () { return ""; })], pairs.map(function (_, i) { return i === pairs.length - 1 ? PDF_.width - w * (pairs.length - 1) : w; }));
    pairs.forEach(function (pr, i) {
      const c = t.getCell(0, i);
      pad(c, 4, 4);
      fillCell(c, [[pr[0], { size: 7.5, bold: true, color: PDF_.muted, after: 2 }], [pr[1], { size: 12.5, bold: true }]]);
    });
    gap(12);
  }

  // The one number that matters most, big, on a blush box.
  function hero(label, sub, amount) {
    const t = bareTable([["", ""]], [336, 180]);
    const left = t.getCell(0, 0), r = t.getCell(0, 1);
    [left, r].forEach(function (c) { c.setBackgroundColor(PDF_.blush).setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER); pad(c, 14, 18); });
    fillCell(left, [[label, { size: 8.5, bold: true, color: PDF_.roseDark, after: 2 }], [sub, { size: 9, color: PDF_.muted }]]);
    fillCell(r, [[amount, { size: 24, bold: true, color: PDF_.rose, align: DocumentApp.HorizontalAlignment.RIGHT }]]);
    gap(4);
  }

  function section(label, o) {
    o = o || {};
    para(label, { size: 8.5, bold: true, color: o.color || PDF_.muted, before: 12, after: 5 });
  }

  /**
   * rows: first row is the header unless o.noHeader. widths add up to PDF_.width.
   * o: { right: [cols], center: [cols], muted: [cols], boldCols: [cols], boldRows: [rows],
   *      totalRow: last row is a total (bold, blush), highlight: {rowIndex: color}, fontSize }
   */
  function table(rows, widths, o) {
    o = o || {};
    const t = bareTable(rows, widths);
    const n = t.getNumRows();
    const fs = o.fontSize || 9.5;
    for (let r = 0; r < n; r++) {
      const row = t.getRow(r);
      const isHead = r === 0 && !o.noHeader;
      const isTotal = o.totalRow && r === n - 1;
      const dataIndex = o.noHeader ? r : r - 1;
      let bg = isHead || isTotal ? PDF_.blush : (dataIndex % 2 === 1 ? PDF_.zebra : PDF_.white);
      if (o.highlight && o.highlight[r]) bg = o.highlight[r];
      for (let c = 0; c < row.getNumCells(); c++) {
        const cell = row.getCell(c);
        cell.setBackgroundColor(bg);
        pad(cell, isHead ? 6 : 5, 7);
        const p = cell.getChild(0).asParagraph();
        styleText(p, {
          size: isHead ? fs - 1 : fs,
          bold: isHead || isTotal || (o.boldRows || []).indexOf(r) !== -1 || (!isHead && (o.boldCols || []).indexOf(c) !== -1),
          color: isHead ? PDF_.roseDark : ((o.muted || []).indexOf(c) !== -1 && !isTotal ? PDF_.muted : PDF_.text),
          align: (o.right || []).indexOf(c) !== -1 ? DocumentApp.HorizontalAlignment.RIGHT
            : (o.center || []).indexOf(c) !== -1 ? DocumentApp.HorizontalAlignment.CENTER : null
        });
      }
    }
    return t;
  }

  // Summary ledger, set to the right: rows [[label, amount, "fee"|""]], then the net line in rose.
  function ledger(rows, netLabel, netAmount) {
    const all = rows.map(function (r) { return ["", r[0], r[1]]; }).concat([["", netLabel, netAmount]]);
    const t = bareTable(all, [196, 220, 100]);
    for (let r = 0; r < all.length; r++) {
      const isNet = r === all.length - 1;
      const fee = !isNet && rows[r][2] === "fee";
      for (let c = 0; c < 3; c++) {
        const cell = t.getCell(r, c);
        pad(cell, isNet ? 8 : 5, 7);
        if (c > 0) cell.setBackgroundColor(isNet ? PDF_.blush : (r % 2 ? PDF_.zebra : PDF_.white));
        styleText(cell.getChild(0).asParagraph(), {
          size: isNet ? 12 : 9.5, bold: isNet, color: isNet ? PDF_.rose : fee ? PDF_.muted : PDF_.text,
          align: c === 2 ? DocumentApp.HorizontalAlignment.RIGHT : null
        });
      }
    }
    return t;
  }

  function note(text, o) { return para(text, Object.assign({ size: 9, color: PDF_.muted, before: 4 }, o || {})); }
  function footer(text) { para(text, { size: 8, color: PDF_.muted, before: 22 }); }

  return { para: para, band: band, info: info, hero: hero, section: section, table: table, ledger: ledger, note: note, footer: footer };
}
