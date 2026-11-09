/* Looscid, js/votes.js: Like on Cherry replies, the "Show my bug report votes publicly" switch, and LcSafe. Plain script,
   loaded after js/liked.js.

   Nov 9 2026 (Carter: "Dislikes should be removed", then yes to "Not interested" instead): Dislike is gone everywhere. This
   file was js/dislikes.js. What's left:
     - Like under each Cherry reply. This device only, because Cherry chats are local. It shows in Liked.
     - Settings, Privacy & Security: Show my bug report votes publicly (bug report Agree and Disagree stay; they're votes on a
       report, not dislikes).
     - LcSafe: a crash inside shows nothing instead of taking the feed down with it.
   Old dislikes quietly disappear: the first time this runs, it deletes looscid_disliked and the dislikes in
   looscid_cherry_votes from this device, and js/remlists.js takes the private "dislikes" list off Rem. Nothing shows them.
   Stored on this device:
     looscid_cherry_votes  { "<chat id>:<message time or number>": { v: "like", chat, title, text, at } } */
(function (Looscid) {
"use strict";
const CV_KEY = "looscid_cherry_votes", CV_EV = "looscid-cherry-votes";
const React = window.React;
function lsJson(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
function fire(ev) { try { window.dispatchEvent(new CustomEvent(ev)); } catch (e) {} }
function say(t) { try { if (Looscid.announce) Looscid.announce(t, "state"); } catch (e) {} }

/* ---- Cherry reply likes (this device only) ---- */
function cvAll() { const o = lsJson(CV_KEY, {}); return o && typeof o === "object" && !Array.isArray(o) ? o : {}; }
function cvWrite(o) { try { if (Object.keys(o).length) localStorage.setItem(CV_KEY, JSON.stringify(o)); else localStorage.removeItem(CV_KEY); } catch (e) {} fire(CV_EV); }
function cvKey(chat, m, i) { return String(chat && chat.id) + ":" + String(m && m.t ? m.t : "n" + i); }
function cvGet(key) { const x = cvAll()[key]; return x && x.v === "like" ? "like" : null; }
function cvSet(key, v, info) {
  try {
    const o = cvAll();
    if (v === "like") o[key] = Object.assign({}, o[key] || {}, info || {}, { v: "like", at: Date.now() }); else delete o[key];
    // 500 at most: the oldest go first.
    const ks = Object.keys(o); if (ks.length > 500) ks.sort(function (a, b) { return (o[a].at || 0) - (o[b].at || 0); }).slice(0, ks.length - 500).forEach(function (k) { delete o[k]; });
    cvWrite(o);
  } catch (e) {}
}
function cvList() { const o = cvAll(); return Object.keys(o).filter(function (k) { return o[k] && o[k].v === "like"; }).map(function (k) { return Object.assign({ key: k }, o[k]); })
  .sort(function (a, b) { return (b.at || 0) - (a.at || 0); }); }
function cvClear(keys) { const o = cvAll(); (keys || []).forEach(function (k) { delete o[k]; }); cvWrite(o); }

/* ---- Old dislikes quietly disappear (Nov 9 2026). Runs once per load; it's cheap and changes nothing when they're gone. ---- */
(function purgeDislikes() {
  try { localStorage.removeItem("looscid_disliked"); } catch (e) {}
  try { const o = cvAll(); let ch = false; Object.keys(o).forEach(function (k) { if (!o[k] || o[k].v !== "like") { delete o[k]; ch = true; } }); if (ch) cvWrite(o); } catch (e) {}
})();

// A crash inside shows nothing instead of taking the feed down with it.
class LcSafe extends React.Component {
  constructor(p) { super(p); this.state = { bad: false }; }
  static getDerivedStateFromError() { return { bad: true }; }
  componentDidCatch() {}
  render() { return this.state.bad ? null : this.props.children; }
}
// Like under each Cherry reply (plain-JavaScript screen). redraw: Cherry's own redraw. It says Like or Unlike (no toggle).
function lcCherryVoteEl(chat, m, i, redraw) {
  try {
    const h = Looscid.lcEl, key = cvKey(chat, m, i), on = cvGet(key) === "like";
    const info = { chat: String(chat.id), title: String(chat.title || "Cherry chat"), text: String(m.text || "").slice(0, 300) };
    return h('div', { className: "lc-inrow lc-cr-votes" },
      Looscid.lcCountBtn(h, { on: on, cls: "liked", label: on ? "Unlike reply" : "Like reply", text: on ? "Unlike" : "Like", onClick: function () {
        cvSet(key, on ? null : "like", info); say(on ? "Like removed" : "Liked"); if (redraw) redraw(); } }));
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

Looscid.lcCherryVotes = { KEY: CV_KEY, EV: CV_EV, list: cvList, set: cvSet, get: cvGet, clear: cvClear, key: cvKey };
Object.assign(Looscid, { LcSafe, lcCherryVoteEl, LcIssueVotesPublicBox, lcIssueVotesPublic: votesPublic });
})(window.Looscid = window.Looscid || {});
