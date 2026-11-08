/* Looscid, js/reportcenter.js: the Report Center. Plain script, loaded after js/core.js, js/net.js and js/issues.js.

   Nov 8 2026 (Carter, 12:46 to 12:52 PM: "one place for every kind of report", "I kinda like how X does reports, you can
   respond"). One page at /Report (core.js LC_ROUTES "report_center"), for every kind of report:
   - Dreams, people and Circles: a report thread on Rem (POST /reports, kind 21992). Reasons: Spam, Mean or bullying, Unsafe
     or harmful, Child safety, Something else (the 4 Dream reasons plus Child safety). A Dream report also counts like the
     old Report Dream did (Rem weighs it the same way and can hide the Dream while it's checked).
   - Child safety: its own kind, always the Child safety reason, straight to Looscid mods.
   - Bugs and ideas: that's Report a problem (js/issues.js), the public tracker. The Report Center links to it and lists
     your own bug reports in My reports, it doesn't rebuild it.
   - Prefill: /Report/?dream=<id>, ?profile=<key or handle>, ?circle=<id>, ?type=child|bug, and Looscid.lcOpenReport({...})
     from the Report buttons on Dreams and profiles (core.js, more.js).
   - After sending: "ur report's submitted. check it in the Report Center anytime", shown and said (the polite announcer).
   - My reports: every report you made, with its status. Each one is a thread: you can add more info, and the mods answer
     as "Looscid mods" (POST /reports/reply, kind 21994). Reading them is a signed read (POST /reports/read, kind 21993),
     so nobody else can ever read your reports.
   - Alerts: when a report of yours changes status or the mods reply, an Alert lands in the Alerts tab (From Looscid).
     Looscid checks a few seconds after it starts and every 5 minutes while it's open, only when you have reports.
   - Mods (Rem's MODS keys) also get Mod tools: every report, reply as Looscid mods, set the status.
   Private: reports are only between you and the mods. Nothing here is public and nothing says who reported what.
   Everything shown is put on screen as text, never as HTML. Every part is wrapped so a failure can't break any page. */
(function (Looscid) {
"use strict";
try {
const h = Looscid.lcEl;
const TYPES = [["dream", "A Dream"], ["profile", "A person"], ["circle", "A Circle"], ["bug", "A bug or an idea"], ["child", "Child safety"]];
const TYPE_WORDS = { dream: "Dream", profile: "person", circle: "Circle", child: "child safety", bug: "bug", idea: "idea" };
const REASONS = [["spam", "Spam"], ["mean", "Mean or bullying"], ["unsafe", "Unsafe or harmful"], ["child_safety", "Child safety"], ["other", "Something else"]];
const REASON_WORDS = { spam: "spam", mean: "mean or bullying", unsafe: "unsafe or harmful", child_safety: "child safety", other: "something else" };
const STATUS_WORDS = { new: "sent, waiting for the mods", looking: "the mods are looking at it", done: "done, the mods took care of it", closed: "closed",
  working: "working on it", fixed: "fixed" };
const DONE_LINE = "ur report's submitted. check it in the Report Center anytime";
const OFFLINE = "can't reach ur reports rn, try again in a bit";
const SEEN_KEY = "looscid_report_seen", MSG_MAX = 2000;
const isHex64 = function (s) { return /^[0-9a-f]{64}$/i.test(String(s == null ? "" : s)); };
const refOk = function (s) { return /^[A-Za-z0-9_.:@-]{1,128}$/.test(String(s || "")); };
function api() { return (Looscid.lcNet && Looscid.lcNet.API) || "https://rem.thebntlovver.workers.dev"; }
function say(t) { try { if (Looscid.announce) Looscid.announce(t); } catch (e) {} }
function st() { const N = Looscid.lcNostr; try { return N && N.state ? N.state() : {}; } catch (e) { return {}; } }
function keyMode() { const s = st(); return s.mode === "key" && isHex64(s.pubkey) ? "key" : s.mode === "locked" ? "locked" : "none"; }
function myPk() { const s = st(); return isHex64(s.pubkey) ? String(s.pubkey).toLowerCase() : null; }
function lsJson(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
async function call(method, path, body) {
  const r = await fetch(api() + path, { method: method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  let j = null; try { j = await r.json(); } catch (e) {}
  return { status: r.status, ok: r.ok && !!(j && j.ok), body: j };
}
async function sign(kind, tags, content) {
  const N = Looscid.lcNostr; if (!N || !N.sign || keyMode() !== "key") throw new Error("nokey");
  const ev = await N.sign({ kind: kind, created_at: Math.floor(Date.now() / 1000), content: content || "", tags: tags.concat([(Looscid.lcNet && Looscid.lcNet.PROTOCOL_TAG) || ["looscid", "1"]]) });
  if (!ev) throw new Error("nokey"); return ev;
}
function when(ms) { try { return new Date(+ms).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); } catch (e) { return ""; } }
function short(s) { s = String(s || ""); return s.length > 14 ? s.slice(0, 8) + "\u2026" : s; }

// Everything the page remembers while Looscid is open, so a typed report survives leaving the page.
const S = { draft: { type: "dream", reason: "", target: "", label: "", circle: "", body: "", fixed: false }, busy: false, msg: "", done: "",
  mine: null, issues: null, state: null, loading: false, open: {}, reply: {}, sending: {},
  mods: null, isMod: false, modItems: null, modState: null, modFilter: "open", modOpen: {}, modDraft: {} };
let redraw = function () {};

/* Prefill: from Looscid.lcOpenReport, or from the page's address (?dream=, ?profile=, ?circle=, ?type=). */
function prefill(o) {
  if (!o) return;
  const d = S.draft, t = String(o.type || "");
  if (t && TYPES.some(function (x) { return x[0] === t; })) d.type = t;
  if (t === "idea") d.type = "bug";
  d.target = o.target != null ? String(o.target).trim().slice(0, 128) : ""; if (isHex64(d.target)) d.target = d.target.toLowerCase();
  d.label = String(o.label || "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, 200);
  d.circle = o.circle != null && refOk(o.circle) ? String(o.circle) : "";
  d.fixed = !!d.target && d.type !== "bug" && d.type !== "child";
  if (d.type === "child") d.reason = "child_safety"; else if (d.reason === "child_safety" && !o.reason) d.reason = "";
  if (o.reason && REASONS.some(function (x) { return x[0] === o.reason; })) d.reason = o.reason;
  S.msg = ""; S.done = "";
}
function fromAddress() {
  try {
    const sp = new URLSearchParams(location.search), p = String(sp.get("p") || location.pathname || "");
    if (!/(^|\/)report\/?$/i.test(p.replace(/[?#].*$/, ""))) return;
    const dream = sp.get("dream"), prof = sp.get("profile"), circ = sp.get("circle"), type = sp.get("type");
    if (dream && refOk(dream)) prefill({ type: "dream", target: dream, label: "Dream " + short(dream) });
    else if (prof && refOk(prof)) prefill({ type: "profile", target: prof, label: /^@/.test(prof) ? prof : isHex64(prof) ? "the person with key " + short(prof) : "@" + prof });
    else if (circ && refOk(circ)) prefill({ type: "circle", target: circ, label: "Circle " + short(circ), circle: circ });
    else if (type) prefill({ type: type });
  } catch (e) {}
}
fromAddress();
function lcOpenReport(o) {
  try { if (o && Object.keys(o).length) prefill(o); if (Looscid.LC_NAV) Looscid.LC_NAV("report_center"); else location.href = (Looscid.LOOSCID_BASE || "/Looscid/") + "Report/"; }
  catch (e) { try { location.href = "/Looscid/Report/"; } catch (e2) {} }
}

/* What you've seen of each report (for Alerts): { <your key>: { <report id>: [status, mod replies] } }. */
function seenAll() { const v = lsJson(SEEN_KEY, {}); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
function seenMine() { const pk = myPk(), a = seenAll(); return pk && a[pk] && typeof a[pk] === "object" ? a[pk] : {}; }
function seenSave(m) { const pk = myPk(); if (!pk) return; const a = seenAll(); a[pk] = m; try { localStorage.setItem(SEEN_KEY, JSON.stringify(a)); } catch (e) {} }
function modCount(r) { return (r.messages || r.replies || []).filter(function (m) { return m.from === "Looscid mods" || m.by === "Looscid mods"; }).length; }
function nameOf(r) {
  if (r.title) return (r.type === "idea" ? "ur idea " : "ur bug report ") + "\u201c" + r.title + "\u201d";
  return "ur report about " + (r.label || (r.type === "child" ? "child safety" : "a " + (TYPE_WORDS[r.type] || "thing")));
}
// Compare what Rem says with what you saw last; a change is an Alert (From Looscid). First sight just remembers.
function notice(list, quiet) {
  const seen = seenMine(), next = {};
  list.forEach(function (r) {
    const now = [r.status, modCount(r)], was = seen[r.id];
    next[r.id] = now;
    if (quiet || !was || !Looscid.lcNotify) return;
    let text = null;
    if (now[1] > was[1]) text = "Looscid mods replied to " + nameOf(r) + ".";
    else if (now[0] !== was[0]) text = nameOf(r).replace(/^u/, "U") + " is now: " + (STATUS_WORDS[now[0]] || now[0]) + ".";
    if (text) { try { const ms = r.messages || r.replies || [], last = ms[ms.length - 1];
      Looscid.lcNotify("system", text.charAt(0).toUpperCase() + text.slice(1), null, last && last.text ? String(last.text).slice(0, 140) : "", { solo: true, report: r.id }); } catch (e) {} }
  });
  seenSave(Object.assign({}, seen, next));
}

async function loadMine(quietAlerts) {
  if (S.loading || keyMode() !== "key") return;
  S.loading = true; redraw();
  const pk = myPk();
  try {
    const r = await call("POST", "/reports/read", await sign(21993, [["action", "read-my-reports"]]));
    if (r.ok) { S.mine = r.body.reports || []; S.state = "ok"; } else S.state = "off";
  } catch (e) { S.state = "off"; }
  try { const r2 = await call("GET", "/issues?limit=100");
    if (r2.ok) S.issues = (r2.body.issues || []).filter(function (it) { return pk && it.by === pk; }); } catch (e) {}
  S.loading = false;
  try { notice((S.mine || []).concat(S.issues || []), quietAlerts); } catch (e) {}
  redraw();
}
async function loadMods() {
  if (S.mods) return;
  try { const r = await call("GET", "/moderators"); S.mods = r.ok ? (r.body.moderators || []) : []; } catch (e) { S.mods = []; }
  const pk = myPk(); S.isMod = !!pk && S.mods.indexOf(pk) >= 0; redraw();
}
async function loadModItems() {
  if (!S.isMod || keyMode() !== "key") return;
  S.modState = "loading"; redraw();
  try { const tags = [["action", "read-my-reports"], ["scope", "all"]]; if (S.modFilter !== "all") tags.push(["status", S.modFilter]);
    const r = await call("POST", "/reports/read", await sign(21993, tags));
    if (r.ok) { S.modItems = r.body.reports || []; S.modState = "ok"; } else S.modState = r.status === 403 ? "no" : "off";
  } catch (e) { S.modState = "off"; }
  redraw();
}

function targetOf() {
  const d = S.draft;
  if (d.type === "child") return d.target && refOk(d.target) ? d.target : "";
  let t = String(d.target || "").trim();
  if (d.fixed) return t;
  const hx = t.match(/[0-9a-f]{64}/i); if (hx && d.type !== "circle") return hx[0].toLowerCase();
  if (d.type === "profile") { const np = t.match(/npub1[02-9ac-hj-np-z]{20,90}/i); if (np) return np[0].toLowerCase(); t = t.replace(/^.*\/@/, "@").replace(/[\/?#].*$/, ""); }
  if (d.type === "circle") t = t.replace(/^.*\/circles?\//i, "").replace(/[\/?#].*$/, "");
  t = t.replace(/\s+/g, "");
  return refOk(t) ? t : "";
}
async function send() {
  const d = S.draft;
  if (S.busy) return;
  if (d.type === "bug") return;
  if (keyMode() !== "key") { say("u need a LooscidID key to report. make one in Settings, LooscidID"); return; }
  const reason = d.type === "child" ? "child_safety" : d.reason;
  if (!reason) { S.msg = "pick a reason first"; say(S.msg); redraw(); return; }
  const target = targetOf();
  if (d.type !== "child" && !target) { S.msg = d.type === "dream" ? "paste the Dream's link first" : d.type === "profile" ? "type their @username first" : "type the Circle's name or link first"; say(S.msg); redraw(); return; }
  const body = String(d.body || "").trim();
  if (Array.from(body).length > MSG_MAX) { S.msg = "more info is up to 2000 characters"; say(S.msg); redraw(); return; }
  S.busy = true; S.msg = "sending ur report\u2026"; S.done = ""; redraw();
  try {
    const tags = [["type", d.type], ["reason", reason]];
    if (target) tags.push(["target", target]);
    const label = d.label || (target ? (d.type === "profile" && !/^@/.test(target) && !isHex64(target) && !/^npub1/.test(target) ? "@" + target : short(target)) : "");
    if (label) tags.push(["label", label]);
    if (d.circle) tags.push(["circle", d.circle]);
    const r = await call("POST", "/reports", await sign(21992, tags, body));
    if (r.ok) {
      const rep = r.body.report;
      S.mine = [rep].concat((S.mine || []).filter(function (x) { return x.id !== rep.id; }));
      try { const m = seenMine(); m[rep.id] = [rep.status, 0]; seenSave(m); } catch (e) {}
      S.draft = { type: d.type, reason: "", target: "", label: "", circle: "", body: "", fixed: false };
      S.msg = ""; S.done = DONE_LINE; say(DONE_LINE);
    } else {
      const err = String((r.body && r.body.error) || "");
      S.msg = r.status === 429 ? (err || "slow down, try again in a bit") : /own Dream/.test(err) ? "u can't report ur own Dream" : /yourself/.test(err) ? "u can't report urself" : r.status >= 500 || !r.status ? "couldn't send it rn, try again in a bit. ur words are still here" : "that didn't go through: " + (err || "try again");
      say(S.msg);
    }
  } catch (e) { S.msg = e && e.message === "nokey" ? "u need a LooscidID key to report" : "couldn't send it rn, try again in a bit. ur words are still here"; say(S.msg); }
  S.busy = false; redraw();
  setTimeout(function () { try { const el = document.getElementById(S.done ? "lc-rc-done" : "lc-rc-send"); if (el && S.done) { el.setAttribute("tabindex", "-1"); el.focus(); } } catch (e) {} }, 60);
}
async function reply(rep, asMod) {
  const store = asMod ? S.modDraft : S.reply, dr = store[rep.id] || (store[rep.id] = {});
  const text = String(dr.text || "").trim(), status = asMod ? (dr.status || "") : "";
  if (!text && !status) { say(asMod ? "pick a status or write a reply first" : "write ur message first"); return; }
  if (Array.from(text).length > MSG_MAX) { say("a message is up to 2000 characters"); return; }
  if (S.sending[rep.id]) return; S.sending[rep.id] = true; redraw();
  try {
    const tags = [["e", rep.id]]; if (status) tags.push(["status", status]); if (asMod) tags.push(["as", "mod"]);
    const r = await call("POST", "/reports/reply", await sign(21994, tags, text));
    if (r.ok) {
      const nr = r.body.report;
      const put = function (list) { return (list || []).map(function (x) { return x.id === nr.id ? Object.assign({}, x, nr, asMod && x.by ? { by: x.by } : {}) : x; }); };
      if (asMod) S.modItems = put(S.modItems); else { S.mine = put(S.mine); try { const m = seenMine(); m[nr.id] = [nr.status, modCount(nr)]; seenSave(m); } catch (e) {} }
      store[rep.id] = {};
      say(asMod ? (status ? "sent as Looscid mods, status is " + (STATUS_WORDS[status] || status) : "sent as Looscid mods") : "reply sent to the mods");
    } else say(r.status === 403 ? "only u and the Looscid mods can reply here" : r.status === 429 ? String((r.body && r.body.error) || "slow down") : r.status >= 500 || !r.status ? "couldn't send it rn, try again in a bit" : "that didn't go through: " + String((r.body && r.body.error) || "try again"));
  } catch (e) { say("couldn't send it rn, try again in a bit"); }
  S.sending[rep.id] = false; redraw();
}

/* --- What's on screen --- */
function radios(name, legend, list, value, onPick) {
  return h('fieldset', { className: "lc-fs" },
    h('legend', { className: "lc-fs-l" }, legend),
    h('div', { className: "lc-radios lc-radios-col" }, list.map(function (r) {
      return h('label', { key: r[0], className: "lc-radio" + (value === r[0] ? " on" : "") },
        h('input', { type: "radio", name: name, value: r[0], checked: value === r[0], onChange: function () { onPick(r[0]); } }),
        h('span', null, r[1])); })));
}
function linkTo(page, text, id, title) {
  return h('a', { id: id, className: "lc-link", href: (Looscid.lcPathFor && Looscid.lcPathFor(page)) || "#", title: title || undefined,
    onClick: function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; e.preventDefault(); if (Looscid.LC_NAV) Looscid.LC_NAV(page); } }, text);
}
function openHelp(id) { Looscid.LC_HELP_NEXT = { kind: "art", id: id }; if (Looscid.LC_NAV) Looscid.LC_NAV("helpcenter"); }
function formEl() {
  const d = S.draft, m = keyMode();
  const kids = [radios("lc-rc-type", "What are u reporting?", TYPES, d.type, function (v) {
    const keep = d.type === v; d.type = v; if (!keep) { d.target = ""; d.label = ""; d.circle = ""; d.fixed = false; }
    if (v === "child") d.reason = "child_safety"; S.msg = ""; S.done = ""; redraw(); })];
  if (d.type === "bug") {
    kids.push(h('p', { className: "lc-desc" }, "bugs and ideas go in Report a problem, our public tracker, so people can agree or disagree. ur bug reports show up in My reports below too."),
      h('p', null, h('a', { id: "lc-rc-bug", className: "btn bp lc-big", href: (Looscid.LOOSCID_BASE || "/Looscid/") + "help/report-a-problem/", title: "Goes to Report a problem",
        onClick: function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; e.preventDefault(); openHelp("report-a-problem"); } }, "Open Report a problem")));
    return h('div', { className: "lc-issue-form" }, kids);
  }
  if (m !== "key") {
    kids.push(h('p', { className: "lc-desc" }, m === "locked" ? "ur key is locked rn, enter ur passcode in Settings, LooscidID to report. " : "u need a LooscidID key to report. ",
      linkTo("settings_account", m === "locked" ? "Open LooscidID" : "Create a LooscidID", "lc-rc-key", "Goes to LooscidID")));
    if (d.type === "child") kids.push(childNote());
    return h('div', { className: "lc-issue-form" }, kids);
  }
  if (d.type === "child") kids.push(childNote());
  if (d.type !== "child") {
    if (d.fixed) kids.push(h('p', { className: "lc-desc lc-rc-what", id: "lc-rc-what" }, "Reporting: " + (d.label || short(d.target))),
      h('p', null, h('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { d.fixed = false; d.target = ""; d.label = ""; redraw(); say("ok, type what u want to report"); } }, "Report something else")));
    else {
      const lab = d.type === "dream" ? "The Dream's link" : d.type === "profile" ? "Their @username, link or key" : "The Circle's name or link";
      kids.push(h('label', { htmlFor: "lc-rc-target", className: "lc-fs-l", style: { display: "block" } }, lab),
        h('input', { id: "lc-rc-target", type: "text", className: "inp lc-issue-in", maxLength: 300, autoComplete: "off", autoCapitalize: "off", spellCheck: false, value: d.target, onInput: function (e) { d.target = e.target.value; } }));
    }
    kids.push(radios("lc-rc-reason", "What's wrong?", REASONS, d.reason, function (v) { d.reason = v; S.msg = ""; redraw(); }));
  }
  kids.push(h('label', { htmlFor: "lc-rc-body", className: "lc-fs-l", style: { display: "block" } }, d.type === "child" ? "What happened? Who, where, when" : "More info (optional)"),
    h('textarea', { id: "lc-rc-body", className: "inp", rows: 4, maxLength: MSG_MAX, value: d.body, onInput: function (e) { d.body = e.target.value; } }),
    h('p', { className: "lc-desc" }, "only u and the Looscid mods see this report. the person or Circle u report never finds out who reported them."),
    h('button', { type: "button", id: "lc-rc-send", className: "btn bp lc-big", disabled: S.busy, onClick: send }, S.busy ? "Sending\u2026" : "Send report"),
    S.msg ? h('p', { className: "lc-desc lc-rc-msg" }, S.msg) : null);
  return h('div', { className: "lc-issue-form" }, kids);
}
function childNote() {
  return h('div', { className: "lc-rc-child" },
    h('p', { className: "lc-desc" }, "child safety reports go straight to the Looscid mods, never just a Circle's mods."),
    h('p', { className: "lc-desc" }, "if a kid is in danger rn, call ur local emergency number first. sexual abuse material of a child can also be reported to ",
      h('a', { className: "lc-link", href: "https://report.cybertip.org/", target: "_blank", rel: "noopener noreferrer", title: "Goes to the CyberTipline" }, "the CyberTipline"), "."),
    h('p', { className: "lc-desc" }, linkTo("child_safety", "Read Child Safety", "lc-rc-cs", "Goes to Child Safety")));
}
function msgLine(m, i, forMod) {
  const who = m.from === "Looscid mods" ? "Looscid mods" : forMod ? "Reporter" : "You";
  return h('li', { key: m.id || i, className: "lc-desc lc-rc-msgline" }, who + ", " + when(m.at) + ": " + (m.status ? "set it to " + (STATUS_WORDS[m.status] || m.status) + (m.text ? ". " : ".") : "") + (m.text || ""));
}
function reportItem(rep, forMod) {
  const hid = "lc-rc-" + (forMod ? "m-" : "") + rep.id.slice(0, 12), open = !!(forMod ? S.modOpen : S.open)[rep.id];
  const what = rep.type === "child" ? "Child safety report" : "Report about " + (rep.label || ("a " + (TYPE_WORDS[rep.type] || "thing")));
  const n = (rep.messages || []).length, dr = (forMod ? S.modDraft : S.reply)[rep.id] || ((forMod ? S.modDraft : S.reply)[rep.id] = {});
  return h('li', { key: rep.id, className: "lc-issue" },
    h('h3', { id: hid, className: "lc-issue-h" }, what + ". " + (STATUS_WORDS[rep.status] || rep.status) + "."),
    h('p', { className: "lc-desc lc-issue-meta" }, "Reason: " + (REASON_WORDS[rep.reason] || rep.reason) + ". Sent " + when(rep.created_at) + ". " + (n ? n + (n === 1 ? " message" : " messages") : "no messages yet") + "." + (forMod && rep.by ? " Reporter key " + short(rep.by) + "." : "") + (forMod && rep.target ? " Target " + rep.target + "." : "")),
    rep.body ? h('p', { className: "lc-desc lc-issue-body" }, (forMod ? "Reporter said: " : "U said: ") + rep.body) : null,
    h('p', null, h('button', { type: "button", className: "btn bgb lc-btn lc-issue-btn", "aria-expanded": open ? "true" : "false", onClick: function () { (forMod ? S.modOpen : S.open)[rep.id] = !open; redraw(); } }, forMod ? "Mod tools" : "Thread")),
    open ? h('div', { className: "lc-rc-thread" },
      n ? h('ul', { className: "lc-issue-replies" }, rep.messages.map(function (m, i) { return msgLine(m, i, forMod); })) : h('p', { className: "lc-desc" }, "no messages yet. the mods answer right here."),
      forMod ? [
        h('label', { key: "sl", htmlFor: hid + "-st", className: "lc-fs-l", style: { display: "block" } }, "Status"),
        h('select', { key: "st", id: hid + "-st", className: "inp lc-issue-sel", value: dr.status || "", onChange: function (e) { dr.status = e.target.value; } },
          h('option', { value: "" }, "Keep it: " + (STATUS_WORDS[rep.status] || rep.status)),
          ["new", "looking", "done", "closed"].map(function (s) { return h('option', { key: s, value: s }, STATUS_WORDS[s]); }))] : null,
      h('label', { htmlFor: hid + "-tx", className: "lc-fs-l", style: { display: "block" } }, forMod ? "Reply, shows as Looscid mods" : "Reply to the mods"),
      h('textarea', { id: hid + "-tx", className: "inp", rows: 3, maxLength: MSG_MAX, value: dr.text || "", onInput: function (e) { dr.text = e.target.value; } }),
      h('button', { type: "button", className: "btn bp lc-btn lc-issue-btn", disabled: !!S.sending[rep.id], onClick: function () { reply(rep, forMod); } }, S.sending[rep.id] ? "Sending\u2026" : forMod ? "Send as Looscid mods" : "Send reply")) : null);
}
function issueItem(it) {
  const hid = "lc-rc-i-" + it.id.slice(0, 12);
  return h('li', { key: it.id, className: "lc-issue" },
    h('h3', { id: hid, className: "lc-issue-h" }, (it.type === "idea" ? "Idea: " : "Bug: ") + it.title + ". " + (STATUS_WORDS[it.status] || it.status) + "."),
    h('p', { className: "lc-desc lc-issue-meta" }, "In Report a problem, public. Sent " + when(it.created_at) + ". " + ((it.replies || []).length ? (it.replies.length + " from Looscid mods") : "no replies yet") + "."),
    (it.replies || []).length ? h('ul', { className: "lc-issue-replies" }, it.replies.map(function (m, i) { return msgLine({ from: "Looscid mods", at: m.at, text: m.text, status: m.status }, i, false); })) : null);
}
function mineEl() {
  const m = keyMode();
  if (m !== "key") return h('p', { className: "lc-desc" }, "ur reports show up here once u have a LooscidID key on this device.");
  const list = S.mine || [], iss = S.issues || [];
  return h('div', null,
    h('p', null, h('button', { type: "button", id: "lc-rc-refresh", className: "btn bgb lc-btn", disabled: S.loading, onClick: function () { loadMine(false).then(function () { say(S.state === "off" ? OFFLINE : (S.mine || []).length + (S.issues || []).length + " reports"); }); } }, S.loading ? "Loading\u2026" : "Refresh")),
    S.state === "off" ? h('p', { className: "lc-desc" }, OFFLINE) : null,
    !S.state && S.loading ? h('p', { className: "lc-desc" }, "loading ur reports\u2026") : null,
    S.state === "ok" && !list.length && !iss.length ? h('p', { className: "lc-desc" }, "no reports yet. when u report something, it shows up here with its status.") : null,
    list.length || iss.length ? h('ol', { className: "lc-issue-list", id: "lc-rc-mine" }, list.map(function (r) { return reportItem(r, false); }).concat(iss.map(issueItem))) : null);
}
function modEl() {
  return h('section', { "aria-labelledby": "lc-rc-h-mod" },
    h('h2', { id: "lc-rc-h-mod", className: "lc-sub-h" }, "Mod tools"),
    h('p', { className: "lc-desc" }, "every report, only for Looscid mods. ur replies show as Looscid mods, never ur name."),
    h('label', { htmlFor: "lc-rc-modf", className: "lc-fs-l", style: { display: "block" } }, "Show"),
    h('select', { id: "lc-rc-modf", className: "inp lc-issue-sel", value: S.modFilter, onChange: function (e) { S.modFilter = e.target.value; loadModItems(); } },
      [["open", "Still open"], ["new", "New"], ["looking", "Looking at it"], ["done", "Done"], ["closed", "Closed"], ["all", "Everything"]].map(function (x) { return h('option', { key: x[0], value: x[0] }, x[1]); })),
    h('p', null, h('button', { type: "button", className: "btn bgb lc-btn", onClick: loadModItems }, S.modItems ? "Refresh" : "Load reports")),
    S.modState === "off" ? h('p', { className: "lc-desc" }, OFFLINE) : S.modState === "no" ? h('p', { className: "lc-desc" }, "this key isn't a Looscid mod key") : null,
    S.modItems && !S.modItems.length ? h('p', { className: "lc-desc" }, "nothing here rn") : null,
    S.modItems && S.modItems.length ? h('ol', { className: "lc-issue-list" }, S.modItems.map(function (r) { return reportItem(r, true); })) : null);
}
function view(p) {
  const base = Looscid.LOOSCID_BASE || "/Looscid/";
  return h('div', { className: "pg lc-rc" },
    Looscid.lcBackHeaderEl("Report Center", function () { if (p && p.onBack) p.onBack(); }),
    h('div', { className: "lc-issues", style: { padding: "0 16px 32px" } },
      h('p', { className: "lc-desc" }, "one place for every report: Dreams, people, Circles, bugs and ideas, and child safety. reports are private, only u and the Looscid mods see them."),
      S.done ? h('p', { id: "lc-rc-done", className: "lc-desc lc-rc-done" }, DONE_LINE) : null,
      h('section', { "aria-labelledby": "lc-rc-h-new" },
        h('h2', { id: "lc-rc-h-new", className: "lc-sub-h" }, "Make a report"),
        formEl()),
      h('section', { "aria-labelledby": "lc-rc-h-mine" },
        h('h2', { id: "lc-rc-h-mine", className: "lc-sub-h" }, "My reports"),
        mineEl()),
      S.isMod ? modEl() : null,
      h('section', { "aria-labelledby": "lc-rc-h-more" },
        h('h2', { id: "lc-rc-h-more", className: "lc-sub-h" }, "Other ways to reach us"),
        h('ul', { className: "lc-rc-links" },
          h('li', null, h('a', { className: "lc-link", href: base + "help/contact/", title: "Goes to Contact Us" }, "Contact Us, with GitHub and Discord")),
          h('li', null, linkTo("child_safety", "Child Safety", "lc-rc-cs2", "Goes to Child Safety")),
          h('li', null, h('a', { className: "lc-link", href: base + "help/mod-log/", title: "Goes to the Mod log",
            onClick: function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; e.preventDefault(); openHelp("mod-log"); } }, "Mod log"))))));
}
const ReportCenterPage = Looscid.lcPlainScreen("ReportCenterPage", function (host, props) {
  let p = props, alive = true;
  const draw = function () { if (!alive) return; try { Looscid.lcPatch(host, view(p)); } catch (e) { try { console.warn("Report Center", e); host.textContent = "the Report Center hit a snag, try again in a bit"; } catch (e2) {} } };
  redraw = draw;
  draw();
  if (!S.mine && keyMode() === "key") loadMine(!Object.keys(seenMine()).length).catch(function () {});
  loadMods().catch(function () {});
  setTimeout(function () { if (!alive) return; const hd = host.querySelector("h1"); if (hd && !host.contains(document.activeElement)) hd.focus(); }, 60);
  return { update: function (np) { p = np; draw(); }, stop: function () { alive = false; redraw = function () {}; } };
});

/* Alerts while Looscid is open: a few seconds after it starts, then every 5 minutes (only on screen, only with reports). */
let lastCheck = 0;
function background() {
  try {
    if (document.hidden || keyMode() !== "key" || S.loading) return;
    if (!Object.keys(seenMine()).length) return; // never reported anything from this key on this device
    if (Date.now() - lastCheck < 4 * 60000) return; lastCheck = Date.now();
    loadMine(false).catch(function () {});
  } catch (e) {}
}
setTimeout(background, 8000);
setInterval(background, 5 * 60000);
document.addEventListener("visibilitychange", function () { if (!document.hidden) setTimeout(background, 1500); });

Object.assign(Looscid, { ReportCenterPage: ReportCenterPage, lcOpenReport: lcOpenReport, lcReportCenter: { state: function () { return S; }, prefill: prefill, load: function () { return loadMine(false); } } });
} catch (e) { try { console.warn("Report Center didn't start", e); } catch (e2) {} }
})(window.Looscid = window.Looscid || {});
