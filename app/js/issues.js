/* Looscid, js/issues.js: Report a problem, Looscid's own issue tracker. Plain script, loaded after js/net.js and
   js/core.js. It lives inside the Help Center (the "Report a problem" article, live: "issues" in js/helpdata.js), the way
   the Mod log does, so there's no new tab.

   Nov 8 2026 (Carter: "public ... so people can agree or disagree", "it's all based on our own thing cause I don't wanna be
   depended on other companies"). Everything is on Looscid and Rem, nobody else:
   - Report: Bug or Idea, a title and What happened. Looscid adds the app and its version by itself (from version.json).
     It's signed with your own LooscidID key, like every other Rem write (kind 21989, POST /issues). Guests and signer
     extensions get one sentence that says a key is needed, with a link to make one.
   - The public list: anyone can read it, no key needed (GET /issues). Each report is one heading, so it reads in one swipe:
     title, Bug or Idea, status, and the agree and disagree counts. Mod replies are under it, as "Looscid mods".
   - Agree and Disagree: one vote per key, you can change it or take it back (kind 21990, POST /issues/vote). Votes are
     private, only the counts come out. After you vote it says "you + 3 others agree" (Carter, 12:10 PM).
   - Mods (Rem's MODS keys) also get Mod tools on each report: set the status, reply, or close it with a reason
     (kind 21991, POST /issues/moderate). It's all public, like the mod log.
   - Offline or Rem down: "can't reach the report list rn, try again in a bit". A typed report is never lost: the draft
     stays in memory until Rem says it's in.
   Stored on this device: looscid_issue_votes { <your key>: { <report id>: "agree" | "disagree" } } (which button is yours).
   Everything shown is put on screen as text, never as HTML. */
(function (Looscid) {
"use strict";
const h = Looscid.lcEl;
const VOTES_KEY = "looscid_issue_votes", VINFO_KEY = "looscid_issue_vote_info";
const STATUS = [["all", "Everything"], ["open", "Still open"], ["new", "New"], ["working", "Working on it"], ["fixed", "Fixed"], ["closed", "Closed"]];
const STATUS_WORDS = { new: "new", working: "working on it", fixed: "fixed", closed: "closed" };
const TITLE_MAX = 120, BODY_MAX = 4000;
const OFFLINE = "can't reach the report list rn, try again in a bit";
const isHex64 = function (s) { return /^[0-9a-f]{64}$/i.test(String(s == null ? "" : s)); };
function lsJson(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
function api() { return (Looscid.lcNet && Looscid.lcNet.API) || "https://rem.thebntlovver.workers.dev"; }
function say(t) { if (Looscid.announce) Looscid.announce(t, "state"); }
function st() { const N = Looscid.lcNostr; try { return N && N.state ? N.state() : {}; } catch (e) { return {}; } }
// "key": your own key on this device, ready. "locked": it needs your passcode first. "none": guest or a signer extension.
function keyMode() { const s = st(); return s.mode === "key" && isHex64(s.pubkey) ? "key" : s.mode === "locked" ? "locked" : "none"; }
function myPk() { const s = st(); return isHex64(s.pubkey) ? String(s.pubkey).toLowerCase() : null; }

// Everything this screen remembers while Looscid is open (so a typed report survives leaving the article).
const S = { draft: { type: "bug", title: "", body: "" }, filter: "all", items: null, state: null, busy: false, msg: "",
  loading: false, loadedAt: 0, mods: null, modOpen: {}, modDraft: {}, voting: {} };
let redraw = function () {};

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

// The app and version that go with each report, from version.json (the web app). The Android shell sets
// Looscid.LC_APP_NAME / LC_APP_VERSION itself when it exists.
let ver = null;
function appInfo() {
  if (Looscid.LC_APP_NAME && Looscid.LC_APP_VERSION) return Promise.resolve([String(Looscid.LC_APP_NAME), String(Looscid.LC_APP_VERSION)]);
  if (ver) return Promise.resolve(ver);
  const fall = ["Looscid web", (Looscid.LOOSCID_VERSION || "") + (Looscid.LOOSCID_BUILD ? " (" + Looscid.LOOSCID_BUILD + ")" : "")];
  return fetch("version.json?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (v) {
    ver = v && v.version ? ["Looscid web", v.version + (v.build ? " (" + v.build + ")" : "")] : fall; return ver;
  }).catch(function () { return fall; });
}

function votes() { const pk = myPk(), all = lsJson(VOTES_KEY, {}); return pk && all && typeof all === "object" && all[pk] && typeof all[pk] === "object" ? all[pk] : {}; }
function setVote(id, v, it) { const pk = myPk(); if (!pk) return; const all = lsJson(VOTES_KEY, {}) || {}; const mine = all[pk] && typeof all[pk] === "object" ? all[pk] : {};
  if (v && v !== "none") mine[id] = v; else delete mine[id]; all[pk] = mine; try { localStorage.setItem(VOTES_KEY, JSON.stringify(all)); } catch (e) {}
  // Nov 8 2026: the report's title too, so the Liked manager (js/liked.js) can name it without loading the list.
  try { const vi = lsJson(VINFO_KEY, {}) || {}; const m = vi[pk] && typeof vi[pk] === "object" ? vi[pk] : {};
    if (v && v !== "none" && it) m[id] = { title: String(it.title || "").slice(0, 120), type: it.type === "idea" ? "idea" : "bug", at: Date.now() }; else if (!v || v === "none") delete m[id];
    vi[pk] = m; localStorage.setItem(VINFO_KEY, JSON.stringify(vi)); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent("looscid-issue-votes")); } catch (e) {} }
function voteInfo() { const pk = myPk(), all = lsJson(VINFO_KEY, {}); return pk && all && typeof all === "object" && all[pk] && typeof all[pk] === "object" ? all[pk] : {}; }
// Settings, Privacy: "Show my bug report votes publicly" (js/votes.js). Off: private, like before.
function visibility() { try { return Looscid.lcIssueVotesPublic && Looscid.lcIssueVotesPublic() ? "public" : "private"; } catch (e) { return "private"; } }

function load(force) {
  if (S.loading || (!force && S.items && Date.now() - S.loadedAt < 60000)) return;
  S.loading = true;
  call("GET", "/issues?limit=100" + (S.filter !== "all" ? "&status=" + S.filter : "")).then(function (r) {
    S.loading = false;
    if (!r.ok || !Array.isArray(r.body.issues)) throw new Error("x");
    S.items = r.body.issues; S.state = "ok"; S.loadedAt = Date.now(); redraw();
  }).catch(function () { S.loading = false; S.state = "off"; redraw(); });
  if (S.mods === null && myPk()) call("GET", "/moderators").then(function (r) { S.mods = r.ok && Array.isArray(r.body.moderators) ? r.body.moderators : []; redraw(); }).catch(function () {});
}
const isMod = function () { const pk = myPk(); return !!(pk && S.mods && S.mods.indexOf(pk) >= 0 && keyMode() === "key"); };
function put(it) { if (!it) return; const a = S.items || []; const i = a.findIndex(function (x) { return x.id === it.id; }); if (i >= 0) a[i] = it; else a.unshift(it); S.items = a; }

async function send() {
  const d = S.draft, title = d.title.trim(), body = d.body.trim();
  if (!title) { S.msg = "add a title first"; say(S.msg); redraw(); setTimeout(function () { const t = document.getElementById("lc-issue-title"); if (t) t.focus(); }, 30); return; }
  if (Array.from(title).length > TITLE_MAX) { S.msg = "the title's too long, keep it under " + TITLE_MAX + " characters"; say(S.msg); redraw(); return; }
  if (Array.from(body).length > BODY_MAX) { S.msg = "What happened is too long, keep it under " + BODY_MAX + " characters"; say(S.msg); redraw(); return; }
  if (S.busy) return; S.busy = true; S.msg = "sending\u2026"; redraw();
  try {
    const info = await appInfo();
    const ev = await sign(21989, [["type", d.type === "idea" ? "idea" : "bug"], ["title", title], ["app", info[0]], ["version", info[1]]], body);
    const r = await call("POST", "/issues", ev);
    if (r.ok) { put(r.body.issue); S.draft = { type: d.type, title: "", body: "" }; S.msg = "Report sent"; }
    else S.msg = r.status === 429 ? "that's a lot of reports today, try again tomorrow" : r.status >= 500 || !r.status ? OFFLINE : "Rem didn't take it: " + String((r.body && r.body.error) || "try again");
  } catch (e) { S.msg = e && e.message === "nokey" ? "you need a Looscid key to report" : OFFLINE; }
  S.busy = false; say(S.msg); redraw();
}

function countLine(it, mine) {
  const a = +it.agree || 0, d = +it.disagree || 0;
  if (mine === "agree") return a > 1 ? "you + " + (a - 1) + (a - 1 === 1 ? " other agrees" : " others agree") : "just you so far";
  if (mine === "disagree") return d > 1 ? "you + " + (d - 1) + (d - 1 === 1 ? " other disagrees" : " others disagree") : "just you so far";
  return a + " agree, " + d + " disagree";
}
async function vote(it, v) {
  if (S.voting[it.id]) return;
  if (keyMode() !== "key") { say("you need a Looscid key to vote"); return; }
  const was = votes()[it.id] || "none", want = was === v ? "none" : v;
  S.voting[it.id] = true; redraw();
  try {
    const ev = await sign(21990, [["e", it.id], ["vote", want], ["visibility", visibility()]]);
    const r = await call("POST", "/issues/vote", ev);
    if (r.ok) { it.agree = r.body.agree; it.disagree = r.body.disagree; setVote(it.id, want, it);
      say(want === "agree" ? "Agreed. " + countLine(it, "agree") : want === "disagree" ? "Disagreed. " + countLine(it, "disagree") : "Vote taken back. " + countLine(it, "none")); }
    else say(r.status >= 500 || !r.status ? OFFLINE : "that vote didn't go through, try again");
  } catch (e) { say(OFFLINE); }
  S.voting[it.id] = false; redraw();
}
async function moderate(it) {
  const md = S.modDraft[it.id] || {}, status = md.status || "", text = String(md.text || "").trim();
  if (!status && !text) { say("pick a status or write a reply first"); return; }
  if (status === "closed" && !text) { say("closing needs a reason, write it in the reply box"); return; }
  if (S.voting[it.id]) return; S.voting[it.id] = true; redraw();
  try {
    const tags = [["e", it.id]]; if (status) tags.push(["status", status]);
    const r = await call("POST", "/issues/moderate", await sign(21991, tags, text));
    if (r.ok) { put(r.body.issue); S.modDraft[it.id] = {}; say(status === "closed" ? "Report closed" : status ? "Status is " + STATUS_WORDS[status] + " now" : "Reply sent"); }
    else say(r.status === 403 ? "only Looscid mods can do that" : r.status >= 500 || !r.status ? OFFLINE : "that didn't go through: " + String((r.body && r.body.error) || "try again"));
  } catch (e) { say(OFFLINE); }
  S.voting[it.id] = false; redraw();
}

// One Agree or Disagree counter. Yours: "you + 3 others agree" (or "agree, just you so far"). Not yours: "3 agree".
function voteText(it, v, mine) {
  const n = +(v === "agree" ? it.agree : it.disagree) || 0;
  if (mine === v) { const c = countLine(it, v); return c === "just you so far" ? v + ", just you so far" : c; }
  return n + " " + (v === "agree" ? (n === 1 ? "agrees" : "agree") : (n === 1 ? "disagrees" : "disagree"));
}
function voteBtn(it, v, mine, vb) {
  const t = voteText(it, v, mine);
  if (!Looscid.lcCountBtn) return h('button', { type: "button", className: "btn bgb lc-btn lc-issue-btn", disabled: !!vb, onClick: function () { vote(it, v); } }, t);
  return Looscid.lcCountBtn(h, { on: mine === v, cls: v === "agree" ? "liked" : "disagreed", label: t, text: t, disabled: !!vb, className: "lc-issue-btn", onClick: function () { vote(it, v); } });
}
function when(ms) { try { return new Date(+ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch (e) { return ""; } }
function reportEl(it, mine) {
  const type = it.type === "idea" ? "Idea" : "Bug", status = STATUS_WORDS[it.status] || it.status;
  const vb = S.voting[it.id], mod = isMod(), open = !!S.modOpen[it.id], md = S.modDraft[it.id] || (S.modDraft[it.id] = {});
  const hid = "lc-issue-" + it.id.slice(0, 12);
  return h('li', { key: it.id, className: "lc-issue" },
    // One swipe: everything you need to know about the report, in its heading.
    h('h3', { id: hid, className: "lc-issue-h" }, it.title + ". " + type + ", " + status + ". " + countLine(it, "none") + "."),
    it.body ? h('p', { className: "lc-desc lc-issue-body" }, it.body) : null,
    h('p', { className: "lc-desc lc-issue-meta" }, "Reported " + when(it.created_at) + (it.app ? " on " + it.app + (it.version ? " " + it.version : "") : "") + (it.status === "closed" && it.close_reason ? ". Closed because: " + it.close_reason : "")),
    (it.replies || []).length ? h('ul', { className: "lc-issue-replies" }, it.replies.map(function (rp, i) {
      return h('li', { key: i, className: "lc-desc" }, "Looscid mods, " + when(rp.at) + ": " + (rp.status ? "set it to " + (STATUS_WORDS[rp.status] || rp.status) + (rp.text ? ". " : ".") : "") + (rp.text || "")); })) : null,
    /* The buttons say how your vote stands (Carter, 12:10 PM): "you + 3 others agree", or "just you so far".
       Nov 8 2026 (Carter, 12:51 PM): they're the same counter as Like on a Dream (Looscid.lcCountBtn in js/core.js): a tick
       box, the count in the words, and pressed when it's your vote. Pressing your vote again takes it back. */
    h('div', { className: "lc-inrow lc-issue-votes" },
      voteBtn(it, "agree", mine, vb), voteBtn(it, "disagree", mine, vb)),
    mod ? h('p', null, h('button', { type: "button", className: "btn bgb lc-btn lc-issue-btn", "aria-expanded": open ? "true" : "false", onClick: function () { S.modOpen[it.id] = !open; redraw(); } }, "Mod tools")) : null,
    mod && open ? h('div', { className: "lc-issue-mod" },
      h('label', { htmlFor: hid + "-st", className: "lc-fs-l", style: { display: "block" } }, "Status"),
      h('select', { id: hid + "-st", className: "inp lc-issue-sel", value: md.status || "", onChange: function (e) { md.status = e.target.value; } },
        h('option', { value: "" }, "Keep it " + status),
        ["new", "working", "fixed", "closed"].map(function (s) { return h('option', { key: s, value: s }, STATUS_WORDS[s]); })),
      h('label', { htmlFor: hid + "-tx", className: "lc-fs-l", style: { display: "block" } }, "Reply or reason, shows as Looscid mods"),
      h('textarea', { id: hid + "-tx", className: "inp", rows: 3, value: md.text || "", onInput: function (e) { md.text = e.target.value; } }),
      h('button', { type: "button", className: "btn bp lc-btn lc-issue-btn", disabled: !!vb, onClick: function () { moderate(it); } }, "Send as Looscid mods")) : null);
}

function formEl(goCreate) {
  const m = keyMode(), d = S.draft;
  if (m !== "key") return h('p', { className: "lc-desc" },
    m === "locked" ? "your key is locked rn, enter your passcode in Settings, LooscidID to report. " : "you need a Looscid key to report. ",
    h('a', { className: "lc-link", href: (Looscid.lcPathFor && Looscid.lcPathFor("settings_account")) || "#", onClick: function (e) { e.preventDefault(); goCreate(); } }, m === "locked" ? "Open LooscidID" : "Create a LooscidID"));
  return h('div', { className: "lc-issue-form" },
    h('fieldset', { className: "lc-fs" },
      h('legend', { className: "lc-fs-l" }, "What kind?"),
      h('div', { className: "lc-radios lc-radios-col" }, [["bug", "Bug, something's broken"], ["idea", "Idea, something new"]].map(function (r) {
        return h('label', { key: r[0], className: "lc-radio" + (d.type === r[0] ? " on" : "") },
          h('input', { type: "radio", name: "lc-issue-type", value: r[0], checked: d.type === r[0], onChange: function () { d.type = r[0]; redraw(); } }),
          h('span', null, r[1])); }))),
    h('label', { htmlFor: "lc-issue-title", className: "lc-fs-l", style: { display: "block" } }, "Title"),
    h('input', { id: "lc-issue-title", type: "text", className: "inp lc-issue-in", maxLength: TITLE_MAX, autoComplete: "off", value: d.title, onInput: function (e) { d.title = e.target.value; } }),
    h('label', { htmlFor: "lc-issue-body", className: "lc-fs-l", style: { display: "block" } }, "What happened?"),
    h('textarea', { id: "lc-issue-body", className: "inp", rows: 5, maxLength: BODY_MAX, value: d.body, onInput: function (e) { d.body = e.target.value; } }),
    h('p', { className: "lc-desc" }, "Looscid adds the app and its version by itself. Your report, its title and your key are public."),
    h('button', { type: "button", id: "lc-issue-send", className: "btn bp lc-big", disabled: S.busy, onClick: send }, S.busy ? "Sending\u2026" : "Send report"),
    S.msg ? h('p', { className: "lc-desc" }, S.msg) : null);
}

/* The Help Center article's live part. act is the Help Center's (redraw, and LC_NAV for the Create link). */
function lcIssuesSection(act) {
  redraw = function () { if (act && act.redraw) act.redraw(); };
  load(false);
  const mine = votes(), list = S.items || [];
  const goCreate = function () { if (Looscid.LC_NAV) Looscid.LC_NAV("settings_account"); };
  return h('div', { className: "lc-issues" },
    h('section', { "aria-labelledby": "lc-help-h-report" },
      h('h2', { id: "lc-help-h-report", className: "lc-sub-h" }, "Report a problem"),
      formEl(goCreate)),
    h('section', { "aria-labelledby": "lc-help-h-reports" },
      h('h2', { id: "lc-help-h-reports", className: "lc-sub-h" }, "Reports"),
      h('label', { htmlFor: "lc-issue-filter", className: "lc-fs-l", style: { display: "block" } }, "Show"),
      h('select', { id: "lc-issue-filter", className: "inp lc-issue-sel", value: S.filter, onChange: function (e) { S.filter = e.target.value; S.items = null; S.state = null; load(true); redraw(); } },
        STATUS.map(function (s) { return h('option', { key: s[0], value: s[0] }, s[1]); })),
      S.state === "off" ? h('p', { className: "lc-desc" }, OFFLINE, " ", h('button', { type: "button", className: "btn bgb lc-btn lc-issue-btn", onClick: function () { load(true); say("trying again"); } }, "Try again")) : null,
      !S.state && !list.length ? h('p', { className: "lc-desc" }, "Loading reports\u2026") : null,
      S.state === "ok" && !list.length ? h('p', { className: "lc-desc" }, S.filter === "all" ? "no reports yet. be the first" : "nothing here with that status") : null,
      list.length ? h('ol', { className: "lc-issue-list" }, list.filter(function (it) { return S.filter === "all" || (S.filter === "open" ? it.status !== "closed" : it.status === S.filter); })
        .map(function (it) { return reportEl(it, mine[it.id]); })) : null));
}
window.addEventListener("online", function () { if (S.state === "off") load(true); });
Looscid.lcIssuesSection = lcIssuesSection;
// Nov 8 2026: for the Liked manager (js/liked.js): your votes, their titles, and taking one back from there.
async function unvote(id) {
  if (keyMode() !== "key" || !isHex64(id)) return false;
  try { const r = await call("POST", "/issues/vote", await sign(21990, [["e", id], ["vote", "none"], ["visibility", visibility()]]));
    if (r.ok) { setVote(id, "none"); const it = (S.items || []).find(function (x) { return x.id === id; }); if (it) { it.agree = r.body.agree; it.disagree = r.body.disagree; } redraw(); return true; } } catch (e) {}
  return false;
}
Looscid.lcIssues = { load: function () { load(true); }, state: function () { return S; }, votes: votes, info: voteInfo, unvote: unvote, canVote: function () { return keyMode() === "key"; } };
})(window.Looscid = window.Looscid || {});
