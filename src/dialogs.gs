// =====================================================================================
// FLORA RESULT POPUPS
//
// Plain Google alerts give every line the same weight, so good news got skimmed past. These
// popups lead with one big, colored headline ("3 invoices sent"), then group the details
// underneath (Sent / Not sent / Skipped), styled like the Flora Payouts panel.
// Confirmations that need Yes/No still use ui.alert, because only that one waits for an answer.
// =====================================================================================

const DIALOG_TONES_ = {
  good: { bg: "#E7F2EC", fg: "#2F6B4F", icon: '<polyline points="20 6 9 17 4 12"></polyline>' },
  warn: { bg: "#FFF3D6", fg: "#6A4A00", icon: '<line x1="12" y1="7" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>' },
  bad:  { bg: "#FBE3E1", fg: "#9B2C22", icon: '<line x1="7" y1="7" x2="17" y2="17"></line><line x1="17" y1="7" x2="7" y2="17"></line>' },
  info: { bg: "#F7E4E9", fg: "#86304F", icon: '<line x1="12" y1="11" x2="12" y2="17"></line><line x1="12" y1="7" x2="12.01" y2="7"></line>' },
  muted: { bg: "#F4F0F2", fg: "#5E565A", icon: "" }
};

/**
 * o: { tone: "good"|"warn"|"bad"|"info", headline, sub, body,
 *      groups: [{ label, tone, items: [text] }]   (empty groups are left out)
 *      links: [{ label, url }] }
 */
function floraDialog_(title, o) {
  o = o || {};
  const tone = DIALOG_TONES_[o.tone] || DIALOG_TONES_.info;
  const groups = (o.groups || []).filter(function (g) { return g.items && g.items.length; });
  const body = String(o.body || "").trim();
  const links = o.links || [];

  const groupHtml = groups.map(function (g) {
    const t = DIALOG_TONES_[g.tone] || DIALOG_TONES_.muted;
    return '<section class="grp" style="border-left-color:' + t.fg + '">' +
      '<div class="glabel" style="color:' + t.fg + '">' + htmlEsc_(g.label) + ' <span class="count">' + g.items.length + '</span></div>' +
      '<div class="items">' + g.items.map(function (i) { return '<span class="item">' + htmlEsc_(i) + '</span>'; }).join("") + '</div></section>';
  }).join("");
  const linkHtml = links.map(function (l) {
    return '<a class="btn" href="' + htmlEsc_(l.url) + '" target="_blank" rel="noopener">' + htmlEsc_(l.label) + '</a>';
  }).join("");

  const html = HtmlService.createHtmlOutput(
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">' +
    '<style>' +
    'body{margin:0;font:14px/1.5 "DM Sans",Arial,sans-serif;color:#2E2A2C}' +
    '.hero{display:flex;gap:12px;align-items:center;background:' + tone.bg + ';border-radius:14px;padding:14px 16px;margin-bottom:14px}' +
    '.ic{flex-shrink:0;width:36px;height:36px;border-radius:18px;background:' + tone.fg + ';color:#fff;display:flex;align-items:center;justify-content:center}' +
    '.headline{font-size:20px;font-weight:700;color:' + tone.fg + ';line-height:1.25}' +
    '.sub{color:#5E565A;font-size:13px;margin-top:2px}' +
    '.grp{border-left:4px solid;padding:2px 0 2px 12px;margin:0 0 12px}' +
    '.glabel{font-weight:700;font-size:13px;margin-bottom:6px}' +
    '.count{display:inline-block;min-width:20px;text-align:center;border-radius:10px;background:#F4F0F2;color:#2E2A2C;font-size:11.5px;padding:0 6px;margin-left:4px}' +
    '.items{display:flex;flex-wrap:wrap;gap:6px}' +
    '.item{background:#fff;border:1px solid #EFE6EA;border-radius:999px;padding:3px 10px;font-size:13px}' +
    '.body{white-space:pre-wrap;color:#2E2A2C;margin:0 0 14px}' +
    '.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:6px}' +
    '.btn{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:10px;background:#A13D63;color:#fff;font-weight:700;text-decoration:none}' +
    '.close{min-height:44px;padding:0 18px;border-radius:10px;border:1px solid #D9CFC7;background:#fff;font:inherit;font-weight:700;cursor:pointer}' +
    '</style>' +
    '<div class="hero" role="status"><span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    tone.icon + '</svg></span><div><div class="headline">' + htmlEsc_(o.headline || title) + '</div>' +
    (o.sub ? '<div class="sub">' + htmlEsc_(o.sub) + '</div>' : '') + '</div></div>' +
    groupHtml +
    (body ? '<p class="body">' + htmlEsc_(body) + '</p>' : '') +
    '<div class="row">' + linkHtml + '<button class="close" onclick="google.script.host.close()">Close</button></div>'
  );
  const itemCount = groups.reduce(function (n, g) { return n + g.items.length; }, 0);
  const height = 150 + groups.length * 48 + Math.ceil(itemCount / 3) * 30 + Math.ceil(body.length / 60) * 21 + (links.length ? 10 : 0);
  html.setWidth(480).setHeight(Math.min(600, Math.max(200, height)));
  SpreadsheetApp.getUi().showModalDialog(html, title);
}

/**
 * A one-message popup in the Flora look, for the messages that used to be plain Google alerts.
 * The first line (up to a blank line, or the first sentence) becomes the big headline.
 * Only used where nothing else happens after the message, because unlike ui.alert it doesn't wait.
 */
function floraAlert_(text, tone) {
  const t = String(text || "").trim();
  let headline = t, body = "";
  const gap = t.indexOf("\n\n");
  if (gap !== -1) { headline = t.slice(0, gap); body = t.slice(gap + 2); }
  if (headline.length > 90) {
    const dot = headline.search(/[.!?](\s|$)/);
    if (dot !== -1 && dot < headline.length - 1) { body = headline.slice(dot + 1).trim() + (body ? "\n\n" + body : ""); headline = headline.slice(0, dot + 1); }
  }
  floraDialog_("Flora", { tone: tone || "warn", headline: headline, body: body });
}

// "in buildInvoicePdf (pdf_style line 42)": where an error happened, from its stack, for the crash popup.
function errorPlace_(e) {
  const m = String(e && e.stack || "").match(/at (\S+) \(([^:()]+):(\d+)(?::\d+)?\)/);
  return m ? "in " + m[1] + " (" + m[2] + " line " + m[3] + ")" : "";
}

/**
 * "Pick one, then press the button" popups (one practitioner's invoice, a past week's summary) in the
 * Flora look. The chosen value goes to serverFn (a public function name in this script), which returns
 * { text, url }. With a url it's shown as a green success with an "Open the PDF" button; without one,
 * as an amber "nothing made" note; a crash shows red. The first sentence of text is the headline.
 */
function floraPickerDialog_(title, o) {
  const data = JSON.stringify({ options: o.options, fn: o.serverFn, button: o.button }).replace(/</g, "\\u003c");
  const html = HtmlService.createHtmlOutput(
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">' +
    '<style>body{margin:0;font:14px/1.5 "DM Sans",Arial,sans-serif;color:#2E2A2C}' +
    '.intro{background:#F7E4E9;border-radius:14px;padding:12px 14px;margin:0 0 14px}.intro b{color:#86304F}' +
    'label{display:block;font-weight:700;font-size:13px;margin:0 0 6px}' +
    'select{width:100%;min-height:44px;font:inherit;font-size:15px;padding:0 10px;border:1px solid #D9CFC7;border-radius:10px;background:#fff}' +
    '.row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}' +
    '.go{min-height:44px;padding:0 18px;border:none;border-radius:10px;background:#A13D63;color:#fff;font:inherit;font-weight:700;cursor:pointer}' +
    '.go:disabled{opacity:.6;cursor:default}.close{min-height:44px;padding:0 18px;border-radius:10px;border:1px solid #D9CFC7;background:#fff;font:inherit;font-weight:700;cursor:pointer}' +
    '.res{display:none;border-radius:14px;padding:12px 14px;margin-top:14px}.res .h{font-weight:700;font-size:16px;margin-bottom:4px}' +
    '.res .b{white-space:pre-wrap;font-size:13px}.res a{display:inline-flex;align-items:center;min-height:40px;margin-top:8px;padding:0 14px;border-radius:10px;background:#A13D63;color:#fff;font-weight:700;text-decoration:none}' +
    '.good{background:#E7F2EC}.good .h{color:#2F6B4F}.warn{background:#FFF3D6}.warn .h{color:#6A4A00}.bad{background:#FBE3E1}.bad .h{color:#9B2C22}.work{display:block;background:#F4F0F2}' +
    '</style>' +
    '<div class="intro">' + o.introHtml + '</div>' +
    '<label for="p">' + htmlEsc_(o.label) + '</label><select id="p"></select>' +
    '<div class="row"><button class="go" id="go"></button><button class="close" onclick="google.script.host.close()">Close</button></div>' +
    '<div class="res" id="res" role="status" aria-live="polite"><div class="h" id="h"></div><div class="b" id="b"></div></div>' +
    '<script>var d=' + data + ';var sel=document.getElementById("p"),go=document.getElementById("go"),res=document.getElementById("res"),h=document.getElementById("h"),b=document.getElementById("b");' +
    'go.textContent=d.button;d.options.forEach(function(n){var x=document.createElement("option");x.value=n;x.textContent=n;sel.appendChild(x);});' +
    'function show(tone,text,url){res.className="res "+tone;res.style.display="block";var t=String(text||"");var i=t.search(/[.!?](\\s|$)/);' +
    'h.textContent=i>-1?t.slice(0,i+1):t;b.textContent=i>-1?t.slice(i+1).trim():"";' +
    'var old=res.querySelector("a");if(old)old.remove();if(url){var a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener";a.textContent="Open the PDF";res.appendChild(a);}}' +
    'go.onclick=function(){go.disabled=true;res.className="res work";res.style.display="block";h.textContent="Working\\u2026";b.textContent="This can take a few seconds.";' +
    'var r=google.script.run.withSuccessHandler(function(x){go.disabled=false;show(x&&x.url?"good":"warn",x&&x.text,x&&x.url);})' +
    '.withFailureHandler(function(e){go.disabled=false;show("bad","Something went wrong. "+((e&&e.message)||e)+" Please screenshot this and send it to the developer.");});' +
    'r[d.fn](sel.value);};</script>'
  ).setWidth(480).setHeight(o.height || 420);
  SpreadsheetApp.getUi().showModalDialog(html, title);
}

// ---------------------------------------------------------------- Flora Yes/No questions

/**
 * A Yes/No question in the Flora look, instead of Google's grey box. Google's box can pause the script;
 * an HTML popup can't, so the step stops here and pressing Yes runs it again through floraConfirmed()
 * with confirmed = true (each step re-checks everything before doing anything).
 * o: { tone, headline, sub, body, groups, yes, no, action, danger }  (action must be in floraConfirmActions_)
 * danger: true gives a red Yes button (it can't be undone: emails go out, data is cleared); otherwise it's green.
 */
function floraConfirm_(title, o) {
  const tone = DIALOG_TONES_[o.tone] || DIALOG_TONES_.warn;
  const groups = (o.groups || []).filter(function (g) { return g.items && g.items.length; });
  const groupHtml = groups.map(function (g) {
    const t = DIALOG_TONES_[g.tone] || DIALOG_TONES_.muted;
    return '<section style="border-left:4px solid ' + t.fg + ';padding:2px 0 2px 12px;margin:0 0 12px">' +
      '<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:' + t.fg + '">' + htmlEsc_(g.label) + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px">' + g.items.map(function (i) {
        return '<span style="background:#fff;border:1px solid #EFE6EA;border-radius:999px;padding:3px 10px;font-size:13px">' + htmlEsc_(i) + '</span>';
      }).join("") + '</div></section>';
  }).join("");
  const body = String(o.body || "").trim();
  const html = HtmlService.createHtmlOutput(
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">' +
    '<style>body{margin:0;font:14px/1.5 "DM Sans",Arial,sans-serif;color:#2E2A2C}' +
    'button{min-height:44px;padding:0 20px;border-radius:10px;font:inherit;font-weight:700;cursor:pointer}' +
    '.yes{border:none;background:' + (o.danger ? "#B3261E" : "#2F6B4F") + ';color:#fff}.yes:disabled{opacity:.6;cursor:default}.no{border:1px solid #D9CFC7;background:#fff}</style>' +
    '<div style="background:' + tone.bg + ';border-radius:14px;padding:14px 16px;margin-bottom:14px">' +
    '<div style="font-size:19px;font-weight:700;color:' + tone.fg + '">' + htmlEsc_(o.headline || title) + '</div>' +
    (o.sub ? '<div style="font-size:13px;color:#5E565A;margin-top:2px">' + htmlEsc_(o.sub) + '</div>' : '') + '</div>' +
    groupHtml + (body ? '<p style="white-space:pre-wrap;margin:0 0 14px">' + htmlEsc_(body) + '</p>' : '') +
    '<div id="err" style="color:#9B2C22;font-size:13px;margin-bottom:8px"></div>' +
    '<div style="display:flex;gap:8px"><button class="yes" id="yes">' + htmlEsc_(o.yes || "Yes, go ahead") + '</button>' +
    '<button class="no" onclick="google.script.host.close()">' + htmlEsc_(o.no || "Not now") + '</button></div>' +
    '<script>var y=document.getElementById("yes");y.onclick=function(){y.disabled=true;y.textContent="Working\\u2026";' +
    'google.script.run.withSuccessHandler(function(){google.script.host.close();})' +
    '.withFailureHandler(function(e){y.disabled=false;y.textContent=' + JSON.stringify(o.yes || "Yes, go ahead") + ';' +
    'document.getElementById("err").textContent="That didn\\u2019t go through: "+((e&&e.message)||e);})' +
    '.floraConfirmed(' + JSON.stringify(o.action) + ');};</script>'
  );
  const lines = Math.ceil(body.length / 60) + groups.reduce(function (n, g) { return n + 2 + Math.ceil(g.items.length / 3); }, 0);
  html.setWidth(500).setHeight(Math.min(620, 200 + lines * 22));
  SpreadsheetApp.getUi().showModalDialog(html, title);
}

// The only steps a Yes button may carry on with. Each runs through runStep_ like a menu item.
function floraConfirmActions_() {
  return {
    send: ["4 · Email invoices to practitioners", function () { sendPractitionerInvoices(true); }],
    emailSummary: ["3b · Email summary to manager", function () { emailReviewSummary(true); }],
    startNewWeek: ["Start next week", function () { startNewWeek(true); }],
    startNewWeekNoBackup: ["Start next week", function () { startNewWeek("nobackup"); }],
    organizeTabs: ["Organize tabs", function () { organizeTabs(true); }],
    addTests: ["Add test bookings", function () { addTestBookings(true); }],
    clearTests: ["Clear test bookings", function () { clearTestBookings(true); }],
    rebuildStartHere: ["Rebuild Start here tab", function () { rebuildStartHere(true); }]
  };
}

// Called by the Yes button above. Public (no trailing underscore) so the popup can reach it.
function floraConfirmed(action) {
  const a = floraConfirmActions_()[action];
  if (!a) throw new Error("Unknown step: " + action);
  runStep_(a[0], a[1]);
  return true;
}
