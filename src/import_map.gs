// =====================================================================================
// BRING OVER: MATCH BY HEADING, NOT BY POSITION
//
// "Bring over data from old sheet" must carry across everything the manager has added in their old copy
// (practitioners, emails, services, categories, events, settings), even when that copy is an older
// version whose columns are named or ordered a little differently. So tables are matched column by
// column on their heading text, and Settings row by row on its label. Anything that can't be matched
// is named in the preview and the result, never dropped silently.
// =====================================================================================

// Lowercase letters and digits only, and anything in brackets dropped: "Product Fee (automatic)" = "productfee".
function normHeading_(v) {
  return String(v == null ? "" : v).replace(/\([^)]*\)/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * newHeaders, oldHeaders: arrays of heading text. Returns { map: [old index or -1 for each new column],
 * missing: new headings with no old match, unused: old headings nothing took }. Blank headings are ignored.
 */
function mapColumns_(newHeaders, oldHeaders) {
  const oldIdx = {};
  oldHeaders.forEach(function (h, i) { const k = normHeading_(h); if (k && !(k in oldIdx)) oldIdx[k] = i; });
  const used = {};
  const map = newHeaders.map(function (h) {
    const k = normHeading_(h);
    if (!k || !(k in oldIdx)) return -1;
    used[oldIdx[k]] = true;
    return oldIdx[k];
  });
  return {
    map: map,
    missing: newHeaders.filter(function (h, i) { return normHeading_(h) && map[i] === -1; }).map(String),
    unused: oldHeaders.filter(function (h, i) { return normHeading_(h) && !used[i]; }).map(String)
  };
}

/**
 * Merges one table. newRows/newFormulas: this sheet's block; oldRows/oldFormulas: the old sheet's block
 * (same number of rows), map from mapColumns_. A column this version calculates keeps its formula unless
 * the old sheet had a typed value there. Columns with no old match keep what they have.
 * Returns { values, rowsWithData }.
 */
function mergeTable_(newRows, newFormulas, oldRows, oldFormulas, map) {
  let rowsWithData = 0;
  const values = newRows.map(function (row, r) {
    const old = oldRows[r] || [], oldF = oldFormulas[r] || [];
    let any = false;
    const out = row.map(function (v, c) {
      const o = map[c];
      if (o === -1) return newFormulas[r][c] !== "" ? newFormulas[r][c] : v;
      const ov = old[o] === undefined ? "" : old[o];
      if (ov !== "" && oldF[o] === "") any = true;
      const keepFormula = newFormulas[r][c] !== "" && (oldF[o] !== "" || ov === "");
      return keepFormula ? newFormulas[r][c] : ov;
    });
    if (any) rowsWithData++;
    return out;
  });
  return { values: values, rowsWithData: rowsWithData };
}

if (typeof module !== "undefined") module.exports = { normHeading_: normHeading_, mapColumns_: mapColumns_, mergeTable_: mergeTable_ };
