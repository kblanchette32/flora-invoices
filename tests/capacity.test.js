// Checks for stretching formula ranges to the new row limits. Run from the project folder: node --test
const test = require("node:test");
const assert = require("node:assert");
const { stretchRefs_, matchTable_, colNum_ } = require("../src/capacity.gs");

const bySheet = {
  Transactions: [{ sheet: "Transactions", first: 5, oldLast: 100, newLast: 504 }],
  Calculations: [{ sheet: "Calculations", first: 5, oldLast: 100, newLast: 504 }],
  Practitioners: [{ sheet: "Practitioners", first: 5, oldLast: 54, newLast: 104 }],
  Services: [{ sheet: "Services", first: 5, oldLast: 120, newLast: 404, cols: [1, 5] },
             { sheet: "Services", first: 5, oldLast: 30, newLast: 64, cols: [7, 9] }]
};

test("column letters", () => { assert.strictEqual(colNum_("A"), 1); assert.strictEqual(colNum_("I"), 9); assert.strictEqual(colNum_("AA"), 27); });

test("ranges ending at a table's old last row are stretched, on this sheet and others", () => {
  assert.strictEqual(stretchRefs_("=SUM(F5:F100)", "Transactions", bySheet), "=SUM(F5:F504)");
  assert.strictEqual(stretchRefs_("=SUMIFS(Calculations!$N$5:$N$100,Calculations!$B$5:$B$100,A10)", "Invoices", bySheet),
    "=SUMIFS(Calculations!$N$5:$N$504,Calculations!$B$5:$B$504,A10)");
  assert.strictEqual(stretchRefs_("=COUNTA(Practitioners!A4:A54)", "Invoices", bySheet), "=COUNTA(Practitioners!A4:A104)");
  assert.strictEqual(stretchRefs_("=VLOOKUP(C5,'Services'!$A$5:$E$120,4,FALSE)", "Calculations", bySheet), "=VLOOKUP(C5,'Services'!$A$5:$E$404,4,FALSE)");
});

test("Service Types and Services on the same tab are told apart by column", () => {
  assert.strictEqual(stretchRefs_("=VLOOKUP(C5,Services!$G$5:$H$30,2,FALSE)", "Services", bySheet), "=VLOOKUP(C5,Services!$G$5:$H$64,2,FALSE)");
});

test("everything else is left exactly as it was", () => {
  for (const f of ["=SUM(F5:F99)", "=SUM(A1:A100)", "=A100*2", "=SUM(Archive!A5:A100)", "=SUM(F5:F1000)", "=SUM(A:A)", "=Services!$G$5:$H$120"])
    assert.strictEqual(stretchRefs_(f, "Transactions", bySheet), f, f);
});

test("a heading row just above the table still counts; far above doesn't", () => {
  assert.ok(matchTable_(bySheet.Transactions, 4, 100, 1, 3));
  assert.strictEqual(matchTable_(bySheet.Transactions, 1, 100, 1, 3), null);
});
