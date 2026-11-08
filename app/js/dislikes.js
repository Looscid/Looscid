/* Looscid, js/dislikes.js: Dislike, and the store behind the Liked manager. Plain script, loaded after js/liked.js.

   Nov 8 2026 (Carter, 12:08-12:10 PM): Dreams get Dislike next to Like, Cherry replies get Like and Dislike too, and the
   Liked tab is the one place to see and manage all of it (js/liked.js). Bug report Agree / Disagree (js/issues.js) show up
   there as likes and dislikes.
   Who sees what:
     - Your dislikes are private, always. Only you see them. Rem keeps disliked Dreams in your private "dislikes" list
       (POST /list, kind 21987), which only a read signed by your own key gives back (POST /mine, kind 21988), the same
       way pins and mutes work. Rem shows no dislike count anywhere, so nobody can tell who disliked or how many.
     - Cherry reply likes and dislikes never leave this device, because Cherry chats are local.
   Stored on this device:
     looscid_disliked      [{ k: "dream", id, nid, at, text, user }] newest first (1000 at most), synced by js/remlists.js
     looscid_cherry_votes  { "<chat id>:<message time or number>": { v: "like" | "dislike", chat, title, text, at } }
   Everything here is wrapped (try/catch, and LcSafe around the buttons), so a problem shows nothing instead of breaking the
   feed. */
(function (Looscid) {
"use strict";
const DIS_KEY = "looscid_disliked", CV_KEY = "looscid_cherry_votes", DIS_EV = "looscid-disliked", CV_EV = "looscid-cherry-votes";
const React = window.React;
function lsJson(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
function fire(ev) { try { window.dispatchEvent(new CustomEvent(ev)); } catch (e) {} }
function say(t) { try { if (Looscid.announce) Looscid.announce(t, "state"); } catch (e) {} }

/* ---- Disliked Dreams ---- */
function disRaw() { const a = lsJson(DIS_KEY, []); return Array.isArray(a) ? a.filter(function (x) { return x && typeof x === "object" && x.id != null; }) : []; }
function disWrite(list) {
  try { if (list.length) localStorage.setItem(DIS_KEY, JSON.stringify(list.slice(0, 1000))); else localStorage.removeItem(DIS_KEY); } catch (e) {}
  fire(DIS_EV);
}
function disHas(id) { const s = String(id); return disRaw().some(function (x) { return String(x.id) === s; }); }
// Dislike or take it back. d: the Dream (or { id }). quiet: no announcement (Like does its own).
function disSet(d, on, quiet) {
  try {
    if (!d || d.id == null) return false;
    const s = String(d.id), had = disHas(s), list = disRaw().filter(function (x) { return String(x.id) !== s; });
    if (on) { const snap = Looscid.lcDreamSnap ? Looscid.lcDreamSnap(d) : {}; list.unshift(Object.assign({}, snap, { k: "dream", id: s, at: Date.now() })); }
    if (on === had) return on;
    disWrite(list);
    if (!quiet) say(on ? "Disliked" : "Dislike removed");
    return on;
  } catch (e) { return false; }
}
function disClear(ids) { const set = new Set((ids || []).map(String)); disWrite(disRaw().filter(function (x) { return !set.has(String(x.id)); })); }

/* ---- Cherry reply likes and dislikes (this device only) ---- */
function cvAll() { const o = lsJson(CV_KEY, {}); return o && typeof o === "object" && !Array.isArray(o) ? o : {}; }
function cvWrite(o) { try { if (Object.keys(o).length) localStorage.setItem(CV_KEY, JSON.stringify(o)); else localStorage.removeItem(CV_KEY); } catch (e) {} fire(CV_EV); }
function cvKey(chat, m, i) { return String(chat && chat.id) + ":" + String(m && m.t ? m.t : "n" + i); }
function cvGet(key) { const x = cvAll()[key]; return x && (x.v === "like" || x.v === "dislike") ? x.v : null; }
function cvSet(key, v, info) {
  try {
    const o = cvAll();
    if (v === "like" || v === "dislike") o[key] = Object.assign({}, o[key] || {}, info || {}, { v: v, at: Date.now() }); else delete o[key];
    // 500 at most: the oldest go first.
    const ks = Object.keys(o); if (ks.length > 500) ks.sort(function (a, b) { return (o[a].at || 0) - (o[b].at || 0); }).slice(0, ks.length - 500).forEach(function (k) { delete o[k]; });
    cvWrite(o);
  } catch (e) {}
}
function cvList(v) { const o = cvAll(); return Object.keys(o).filter(function (k) { return o[k] && o[k].v === v; }).map(function (k) { return Object.assign({ key: k }, o[k]); })
  .sort(function (a, b) { return (b.at || 0) - (a.at || 0); }); }
function cvClear(keys) { const o = cvAll(); (keys || []).forEach(function (k) { delete o[k]; }); cvWrite(o); }

/* ---- Liking a Dream you disliked takes the dislike off (and the other way round, in the Dislike button) ---- */
window.addEventListener("looscid-liked", function () {
  try { const d = disRaw(); if (!d.length || !Looscid.lcLikedHas) return; const keep = d.filter(function (x) { return !Looscid.lcLikedHas("dream", x.id); }); if (keep.length !== d.length) disWrite(keep); } catch (e) {}
});

/* ---- Buttons ---- */
// A crash inside shows nothing instead of taking the feed down with it.
class LcSafe extends React.Component {
  constructor(p) { super(p); this.state = { bad: false }; }
  static getDerivedStateFromError() { return { bad: true }; }
  componentDidCatch() {}
  render() { return this.state.bad ? null : this.props.children; }
}
function useTick(ev) { const [, t] = React.useState(0); React.useEffect(function () { const f = function () { t(function (x) { return x + 1; }); }; window.addEventListener(ev, f); return function () { window.removeEventListener(ev, f); }; }, []); }
// Dislike under a Dream, next to Like. The shared counter, with no number: dislikes are private.
function LcDislikeBtn({ dream, onLike }) {
  useTick(DIS_EV);
  const on = disHas(dream.id);
  return Looscid.lcCountBtn(React.createElement, { on: on, cls: "disliked", label: "Dislike", text: "Dislike", className: "lc-dislike",
    onClick: function () {
      const next = !on;
      if (next && dream.liked && onLike) { try { onLike(dream.id); } catch (e) {} } // disliking takes your like off
      disSet(dream, next);
    } });
}
// Like and Dislike under each Cherry reply (plain-JavaScript screen). redraw: Cherry's own redraw.
function lcCherryVoteEl(chat, m, i, redraw) {
  try {
    const h = Looscid.lcEl, key = cvKey(chat, m, i), v = cvGet(key);
    const info = { chat: String(chat.id), title: String(chat.title || "Cherry chat"), text: String(m.text || "").slice(0, 300) };
    const pick = function (want) { const next = v === want ? null : want; cvSet(key, next, info);
      say(next === "like" ? "Liked" : next === "dislike" ? "Disliked" : want === "like" ? "Like removed" : "Dislike removed"); if (redraw) redraw(); };
    return h('div', { className: "lc-inrow lc-cr-votes" },
      Looscid.lcCountBtn(h, { on: v === "like", cls: "liked", label: "Like reply", text: "Like", onClick: function () { pick("like"); } }),
      Looscid.lcCountBtn(h, { on: v === "dislike", cls: "disliked", label: "Dislike reply", text: "Dislike", onClick: function () { pick("dislike"); } }));
  } catch (e) { return null; }
}
/* Settings, Privacy: Show my bug report votes publicly. A native checkbox, off by default. When it's on, your Agree and
   Disagree votes are sent to Rem marked public (POST /issues/vote, ["visibility", "public"]). Rem keeps the mark, but
   today it only ever shows counts, so nothing lists names yet. */
const VOTE_PUB_KEY = "looscid_issue_votes_public";
function votesPublic() { try { return localStorage.getItem(VOTE_PUB_KEY) === "1"; } catch (e) { return false; } }
function LcIssueVotesPublicBox() {
  const [on, setOn] = React.useState(votesPublic);
  const lh = React.createElement;
  return lh('div', { style: { padding: "0 0 6px" } },
    lh('label', { className: "lc-radio" + (on ? " on" : ""), htmlFor: "set-issueVotesPublic" },
      lh('input', { type: "checkbox", id: "set-issueVotesPublic", checked: on, onChange: function (e) {
        const v = e.target.checked; try { localStorage.setItem(VOTE_PUB_KEY, v ? "1" : "0"); } catch (x) {} setOn(v);
        say(v ? "Your bug report votes are public from your next vote." : "Your bug report votes are private from your next vote."); } }),
      lh('span', null, "Show my bug report votes publicly")),
    lh('p', { className: "lc-desc" }, "Off by default. It counts from ur next Agree or Disagree. Right now Looscid only ever shows the counts, so ur name isn't listed anywhere yet."));
}

Looscid.lcDislikes = { KEY: DIS_KEY, EV: DIS_EV, raw: disRaw, has: disHas, set: disSet, clear: disClear };
Looscid.lcCherryVotes = { KEY: CV_KEY, EV: CV_EV, list: cvList, set: cvSet, get: cvGet, clear: cvClear, key: cvKey };
Object.assign(Looscid, { LcSafe, LcDislikeBtn, lcCherryVoteEl, LcIssueVotesPublicBox, lcIssueVotesPublic: votesPublic });
})(window.Looscid = window.Looscid || {});
