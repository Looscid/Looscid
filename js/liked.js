/* Looscid liked.js: Liked (build 147, Alhasan Oct 10 2026): liking is saving, so everything you like is in one place.
   One component (LikedView) and one store (dbm_liked, in js/core.js) for both doors: the private Liked tab on your
   own profile and the Liked page in More (build 148). Tabs, from Alhasan's spec sheet: Dreams, Circles, Apps,
   Marketplace, Chats and Searches. Images is a filter across them, not a tab. Wording is Like and Unlike, never
   Save or Bookmark. Still React, like the profile it sits in. Plain script (not a module); see FILES.md. */
(function (Looscid) {
const { CommentView, DreamCard, announce, lcAiOn, lcDreamSnap, lcLikedDreams, lcLikedItems, lcLikedSet, lcNameJoin, useLikedTick } = Looscid;
const { useState, useEffect, useRef } = React;
const lh = React.createElement;
// Cherry chats sit in Chats (Alhasan said yes, Oct 10), and a Marketplace like is a listing.
const LC_LIKED_TABS = [
  { id: "dreams", label: "Dreams", k: "dream", none: "No liked Dreams yet. Like a Dream and it shows up here." },
  { id: "circles", label: "Circles", k: "circle", none: "No liked Circles yet. Like a Circle and it shows up here." },
  { id: "apps", label: "Apps", k: "app", none: "No liked Apps yet. Like an App and it shows up here." },
  { id: "marketplace", label: "Marketplace", k: "listing", none: "No liked listings yet. Marketplace isn't open in Looscid yet, so there are no listings to like." },
  { id: "chats", label: "Chats", k: "chat", none: "No liked Chats yet. Like a chat, or a Cherry chat, and it shows up here." },
  { id: "searches", label: "Searches", k: "search", none: "No liked Searches yet. Use Like Search on a search in Discover and it shows up here." },
];
Looscid.LC_LIKED_TABS = LC_LIKED_TABS;
const lcLikedTabMem = {}; // which Liked tab you were on, per door, while Looscid is open
const IMG_RE = /\.(jpe?g|png|gif|webp|avif|heic)(\?|#|$)/i;
// Does a liked thing have an image? A Dream's media or an image link; anything else, its own image.
function lcLikedHasImage(x) {
  if (!x) return false;
  if (x.image || (Array.isArray(x.media) && x.media.length) || (Array.isArray(x.images) && x.images.length)) return true;
  return IMG_RE.test(String(x.text || "").split(/\s+/).filter(function (w) { return /^https?:\/\//i.test(w); }).join(" "));
}
Looscid.lcLikedHasImage = lcLikedHasImage;
function LikedRow({ item, label, onOpen, openLabel }) {
  return lh('li', { className: "lc-liked-row" },
    lh('span', { className: "lc-liked-name" }, label),
    lh('span', { className: "lc-liked-acts" },
      onOpen ? lh('button', { type: "button", className: "btn bgb lc-btn", onClick: onOpen }, openLabel || "Open") : null,
      lh('button', { type: "button", className: "btn bgb lc-btn", "aria-label": lcNameJoin("Unlike", label), onClick: function () { lcLikedSet(item.k, item.id, false); announce("Unliked " + label + ". Removed from Liked."); } }, "Unlike")));
}
function LikedView({ navigate, cherryCtx, idp, intro, onComment, extraPanels }) {
  idp = idp || "lk";
  useLikedTick();
  const [tab, setTabS] = useState(lcLikedTabMem[idp] || "dreams");
  const setTab = function (t) { lcLikedTabMem[idp] = t; setTabS(t); };
  const [imgs, setImgs] = useState(false);
  const [activeComment, setActiveComment] = useState(null);
  const [, bump] = useState(0);
  // A Dream you unlike here stays in the list (shown as not liked) until you leave, so focus never jumps.
  const keep = useRef(new Map());
  const live = lcLikedDreams((cherryCtx && cherryCtx.dreams) || []);
  const liveIds = new Set(live.map(function (d) { return String(d.id); }));
  live.forEach(function (d) { keep.current.set(String(d.id), d); });
  const dreams = Array.from(keep.current.values()).sort(function (a, b) { return (b.likedAt || 0) - (a.likedAt || 0); }).map(function (d) {
    const on = liveIds.has(String(d.id));
    return on ? (live.find(function (x) { return String(x.id) === String(d.id); }) || d) : Object.assign({}, d, { liked: false, bookmarked: false, likes: Math.max(0, (d.likes || 1) - 1) });
  });
  if (activeComment && !onComment) return lh(CommentView, { dream: activeComment, onBack: function () { setActiveComment(null); }, onLike: function (id) { toggleDream(id); }, onRedream: noop, onUndoRedream: noop, onQuote: noop, onUndoQuote: noop, onBookmark: function (id) { toggleDream(id); }, onCommentPosted: noop, navigate: navigate });
  function noop() { bump(function (n) { return n + 1; }); }
  function toggleDream(id) {
    const d = dreams.find(function (x) { return String(x.id) === String(id); }); if (!d) return;
    lcLikedSet("dream", d.id, !d.liked, lcDreamSnap(d));
  }
  const onKey = function (e) {
    const i = LC_LIKED_TABS.findIndex(function (t) { return t.id === tab; }); let n = null;
    if (e.key === "ArrowRight") n = (i + 1) % LC_LIKED_TABS.length; else if (e.key === "ArrowLeft") n = (i + LC_LIKED_TABS.length - 1) % LC_LIKED_TABS.length;
    else if (e.key === "Home") n = 0; else if (e.key === "End") n = LC_LIKED_TABS.length - 1;
    if (n === null) return; e.preventDefault(); setTab(LC_LIKED_TABS[n].id);
    setTimeout(function () { const b = document.getElementById(idp + "-tab-" + LC_LIKED_TABS[n].id); if (b) b.focus(); }, 0);
  };
  const ai = lcAiOn();
  const listFor = function (t) {
    if (t.k === "dream") return imgs ? dreams.filter(lcLikedHasImage) : dreams;
    let a = lcLikedItems(t.k);
    if (t.k === "chat" && !ai) a = a.filter(function (x) { return !x.cherry; }); // Cherry's chats show only while Cherry is on
    return imgs ? a.filter(lcLikedHasImage) : a;
  };
  const panel = function (t) {
    const list = listFor(t);
    const custom = (extraPanels && extraPanels[t.id]) || (t.k === "search" ? function (o) { return lh(LikedSearches, { list: o.list, cherryCtx: cherryCtx }); } : null);
    let body;
    if (custom) body = custom({ list: list, imgs: imgs });
    else if (!list.length) body = lh('p', { className: "lc-muted lc-liked-none" }, imgs ? "No liked " + t.label + " with images." : t.none);
    else if (t.k === "dream") body = list.map(function (d) {
      return lh(DreamCard, { key: d.id, dream: d, onLike: toggleDream, onBookmark: toggleDream, onRedream: noop, onUndoRedream: noop, onQuote: noop, onUndoQuote: noop,
        onComment: function (x) { if (onComment) onComment(x); else setActiveComment(x); }, navigate: navigate, cherryCtx: cherryCtx });
    });
    else body = lh('ul', { className: "lc-liked-list", role: "list" }, list.map(function (x) {
      const name = x.name || x.title || x.q || "Untitled";
      const label = x.cherry ? lcNameJoin(name, "Cherry chat") : name;
      const open = x.k === "circle" ? function () { navigate("groups"); } : x.k === "app" ? function () { Looscid.lcOpenLikedApp && Looscid.lcOpenLikedApp(x, navigate); } : x.k === "chat" ? function () { if (x.cherry && Looscid.lcCherryOpenChat) Looscid.lcCherryOpenChat(x.id); navigate(x.cherry ? "cherry" : "alerts"); } : null;
      return lh(LikedRow, { key: x.k + ":" + x.id, item: x, label: label, onOpen: open });
    }));
    return lh('div', { key: t.id, id: idp + "-panel-" + t.id, role: "tabpanel", "aria-labelledby": idp + "-tab-" + t.id, hidden: tab !== t.id, className: "lc-liked-panel" }, body);
  };
  return lh('div', { className: "lc-liked" },
    intro ? lh('p', { className: "lc-liked-intro" }, intro) : null,
    lh('div', { className: "ftabs lc-liked-tabs", role: "tablist", "aria-label": "Liked", onKeyDown: onKey },
      LC_LIKED_TABS.map(function (t) {
        const on = tab === t.id;
        return lh('button', { key: t.id, id: idp + "-tab-" + t.id, type: "button", role: "tab", className: "ftab" + (on ? " on" : ""), "aria-selected": on ? "true" : "false", "aria-controls": idp + "-panel-" + t.id, tabIndex: on ? 0 : -1, onClick: function () { setTab(t.id); } }, t.label);
      })),
    lh('label', { className: "lc-radio lc-liked-img", htmlFor: idp + "-images" },
      lh('input', { type: "checkbox", id: idp + "-images", checked: imgs, onChange: function (e) { setImgs(e.target.checked); announce(e.target.checked ? "Images only. Showing liked things with images." : "Showing everything you liked."); } }),
      " Images only"),
    LC_LIKED_TABS.map(panel));
}
Object.assign(Looscid, { LikedView });

/* ---- Build 148: Like buttons for the other kinds, Like Search with Alerts, the Liked page in More ---- */
// A Like / Unlike button for anything that isn't a Dream (Circles, Apps, Chats). React.
function LcLikeBtn({ k, id, name, snap, className }) {
  useLikedTick();
  const on = Looscid.lcLikedHas(k, id);
  return lh('button', { type: "button", className: className || "btn bgb lc-btn lc-like-btn", "aria-label": (on ? "Unlike " : "Like ") + String(name || "").trim(),
    onClick: function () { lcLikedSet(k, id, !on, Object.assign({ name: name }, snap || {})); announce(on ? "Unliked " + name + ". Removed from Liked." : "Liked " + name + ". It's in Liked."); } }, on ? "Unlike" : "Like");
}
// The same button for the plain-JavaScript screens (Messages, Cherry, Discover). redraw: the screen's own redraw.
function lcLikeBtnEl(k, id, name, snap, redraw, extra) {
  const h = Looscid.lcEl, on = Looscid.lcLikedHas(k, id);
  return h('button', Object.assign({ type: "button", className: "btn bgb lc-btn lc-like-btn", "aria-label": (on ? "Unlike " : "Like ") + String(name || "").trim(),
    onClick: function () { lcLikedSet(k, id, !on, Object.assign({ name: name }, snap || {})); announce(on ? "Unliked " + name + ". Removed from Liked." : "Liked " + name + ". It's in Liked."); if (redraw) redraw(); } }, extra || {}), on ? "Unlike" : "Like");
}
/* Like Search (Alhasan, 8:58 PM): a search you like goes to Liked, Searches. Each has an Alerts switch (off). With it on,
   Looscid checks the search whenever it's open and new Dreams arrive, across the networks you have connected (Alhasan,
   8:59 PM: "Powered by the Networks you have"). There's no server, so nothing is checked while Looscid is closed. New matches
   go to the Alerts tab under From Looscid, naming the network, and are announced politely. Focus never moves. */
const LC_NET_NAMES = { nostr: "Nostr", activitypub: "Mastodon & fediverse", atproto: "Bluesky", pubky: "Pubky", funkwhale: "Funkwhale", hubzilla: "Hubzilla" };
function lcSearchNetworks() {
  // Read the Logins without writing anything (getMethods would store an empty list on a first visit).
  let m = [];
  try { const raw = JSON.parse(localStorage.getItem("looscid_signin_methods") || "null"); if (Array.isArray(raw)) m = raw; else { const idn = Looscid.getIdentity && Looscid.getIdentity(); if (idn && idn.provider === "nostr") m = [{ provider: "nostr" }]; } } catch (e) {}
  const out = []; m.forEach(function (x) { const n = LC_NET_NAMES[x.provider]; if (n && out.indexOf(n) < 0) out.push(n); });
  return out;
}
function lcSearchKey(q, filters) { return String(q || "").trim().toLowerCase().replace(/\s+/g, " ") + ((filters && filters.length) ? "|" + filters.slice().sort().join(",") : ""); }
function lcSearchHits(q, dreams, filters) {
  const words = String(q || "").toLowerCase().split(/\s+/).filter(Boolean); if (!words.length) return [];
  const f = filters || [];
  return (dreams || []).filter(function (d) { if (!d || d.user === Looscid.ME || (d.user && d.user.id === Looscid.ME.id)) return false;
    if (f.indexOf("Has Media") >= 0 && !lcLikedHasImage(d)) return false;
    if (f.indexOf("Verified") >= 0 && !(d.user && d.user.verified)) return false; const t = String(d.text || "").toLowerCase() + " " + String((d.user && (d.user.name + " " + d.user.handle)) || "").toLowerCase(); return words.every(function (w) { return t.indexOf(w) >= 0; }); });
}
function lcDreamNetwork(d) { return d.network || (d.nid ? "Nostr" : "this device"); }
function lcLikeSearch(q, filters, dreams) {
  q = String(q || "").trim(); if (!q) return null;
  const key = lcSearchKey(q, filters);
  if (Looscid.lcLikedHas("search", key)) return { key: key, had: true };
  lcLikedSet("search", key, true, { q: q, name: q, filters: filters || [], alerts: false, seen: lcSearchHits(q, dreams || [], filters).map(function (d) { return String(d.id); }).slice(0, 500) });
  return { key: key, had: false };
}
// Run the Alerts check. Called by the app on open and whenever new Dreams arrive.
function lcLikedSearchCheck(dreams) {
  const on = lcLikedItems("search").filter(function (s) { return s.alerts; });
  if (!on.length) return;
  const nets = lcSearchNetworks();
  on.forEach(function (s) {
    const seen = new Set((s.seen || []).map(String));
    const fresh = lcSearchHits(s.q, dreams, s.filters).filter(function (d) { return !seen.has(String(d.id)); });
    if (!fresh.length) return;
    Looscid.lcLikedPatch("search", s.id, { seen: fresh.map(function (d) { return String(d.id); }).concat(s.seen || []).slice(0, 500), last: Date.now(), nets: nets });
    lcShowFromLooscid();
    let stored = 0;
    // One alert per new Dream, up to 3; more than that is one alert that counts them. Each names the network.
    if (fresh.length <= 3) fresh.forEach(function (d) {
      if (Looscid.lcNotify && Looscid.lcNotify("system", "New Dream for your Liked Search \u201c" + s.q + "\u201d, from " + lcDreamNetwork(d), d.user && typeof d.user === "object" ? d.user : null, String(d.text || "").slice(0, 140))) stored++;
    });
    else {
      const fromN = []; fresh.forEach(function (d) { const n = lcDreamNetwork(d); if (fromN.indexOf(n) < 0) fromN.push(n); });
      if (Looscid.lcNotify && Looscid.lcNotify("system", fresh.length + " new Dreams for your Liked Search \u201c" + s.q + "\u201d, from " + fromN.join(", "), null, String(fresh[0].text || "").slice(0, 140))) stored = fresh.length;
    }
    if (stored) announce("Liked Search \u201c" + s.q + "\u201d: " + fresh.length + (fresh.length === 1 ? " new Dream" : " new Dreams") + " in Alerts, From Looscid.");
  });
}
// The From Looscid filter in Alerts: if you hid it, a Liked Search alert brings it back (so the alert has somewhere to show).
function lcShowFromLooscid() {
  try {
    const k = "dbm_alert_cat_hidden", v = JSON.parse(localStorage.getItem(k) || "[]");
    if (Array.isArray(v) && v.indexOf("system") >= 0) { localStorage.setItem(k, JSON.stringify(v.filter(function (x) { return x !== "system"; }))); window.dispatchEvent(new CustomEvent("looscid:cats")); }
  } catch (e) {}
}
// Liked, Searches: each search with its networks, its Alerts switch and Unlike Search.
function LikedSearches({ list, cherryCtx }) {
  const nets = lcSearchNetworks();
  const netLine = nets.length ? "Searching: " + nets.join(", ") + ", and Dreams on this device." : "No networks connected, so it searches Dreams on this device only.";
  if (!list.length) return lh('p', { className: "lc-muted lc-liked-none" }, "No liked Searches yet. Use Like Search on a search in Discover and it shows up here.");
  return lh(React.Fragment, null,
    lh('p', { className: "lc-muted lc-liked-intro" }, "Alerts are checked when Looscid is open, not while it's closed: Looscid has no server. New matches go to Alerts, under From Looscid."),
    lh('ul', { className: "lc-liked-list", role: "list" }, list.map(function (s) {
      const sid = "lks-" + String(s.id).replace(/[^a-z0-9]+/gi, "-");
      return lh('li', { key: s.id, className: "lc-liked-search" },
        lh('h3', { className: "lc-sub-h", id: sid + "-h" }, s.q + (s.filters && s.filters.length ? " (" + s.filters.join(", ") + ")" : "")),
        lh('p', { className: "lc-muted" }, netLine),
        lh('label', { className: "lc-radio", htmlFor: sid + "-alerts" },
          lh('input', { type: "checkbox", role: "switch", id: sid + "-alerts", "aria-label": "Alerts for \u201c" + s.q + "\u201d", checked: !!s.alerts, onChange: function (e) {
            const on = e.target.checked;
            Looscid.lcLikedPatch("search", s.id, on ? { alerts: true, seen: lcSearchHits(s.q, (cherryCtx && cherryCtx.dreams) || Looscid.LC_APP_DREAMS || [], s.filters).map(function (d) { return String(d.id); }).concat(s.seen || []).slice(0, 500) } : { alerts: false });
            announce(on ? "Alerts on for \u201c" + s.q + "\u201d. Checked when Looscid is open." : "Alerts off for \u201c" + s.q + "\u201d."); } }),
          lh('span', null, " Alerts")),
        lh('button', { type: "button", className: "btn bgb lc-btn", "aria-label": "Unlike Search \u201c" + s.q + "\u201d", onClick: function () { lcLikedSet("search", s.id, false); announce("Unliked Search \u201c" + s.q + "\u201d. Its Alerts are off."); } }, "Unlike Search"));
    })));
}
Looscid.lcOpenLikedApp = function (x, navigate) { const a = (Looscid.lcAppItems ? Looscid.lcAppItems() : []).find(function (y) { return y.id === x.id; }); if (a) a.go(navigate); };
// The Liked page in More (build 148): the same LikedView as your profile's Liked tab.
function LikedPage({ navigate, cherryCtx }) {
  const head = useRef(null);
  useEffect(function () { if (head.current) head.current.focus(); }, []);
  return lh('div', { className: "pg lc-liked-page" },
    lh('div', { className: "hdr" }, lh('div', { className: "hdr-row" },
      lh('button', { type: "button", className: "bi", onClick: function () { navigate("feed"); }, "aria-label": "Back" }, lh(Looscid.Ic.Bck, { style: { width: 21, height: 21 } })),
      lh('h1', { className: "hdr-title", tabIndex: -1, ref: head }, "Liked"))),
    lh(LikedView, { navigate: navigate, cherryCtx: cherryCtx, idp: "lk", intro: "Everything you liked, in one place. Only you can see this page." }));
}
// Commandbar: liked, like search [words], unlike search <words>.
function lcLikedIntent(raw) {
  const n = String(raw || "").trim().toLowerCase().replace(/\s+/g, " "); let m;
  if (/^(liked|open liked|show liked|my likes|open my likes)$/.test(n)) return { say: "Opened Liked.", fn: function () { Looscid.LC_NAV && Looscid.LC_NAV("liked"); } };
  if ((m = /^like (?:this )?search(?: (?:for )?(.+))?$/.exec(n))) {
    const q = (m[1] || Looscid.LC_DISCOVER_Q || "").trim();
    if (!q) return { err: "Search for something in Discover first, or say like search and the words." };
    const r = lcLikeSearch(q, m[1] ? [] : (Looscid.LC_DISCOVER_FILTERS || []), Looscid.LC_APP_DREAMS || []);
    return { say: r.had ? "\u201c" + q + "\u201d is already in Liked, Searches." : "Liked Search \u201c" + q + "\u201d. It's in Liked, Searches, where you can turn on its Alerts.", fn: function () {} };
  }
  if ((m = /^unlike search (.+)$/.exec(n))) {
    const s = lcLikedItems("search").find(function (x) { return String(x.q || "").toLowerCase() === m[1]; });
    if (!s) return { err: "No Liked Search called \u201c" + m[1] + "\u201d." };
    return { say: "Unliked Search \u201c" + s.q + "\u201d.", fn: function () { lcLikedSet("search", s.id, false); } };
  }
  return null;
}
Object.assign(Looscid, { LcLikeBtn, lcLikeBtnEl, lcSearchNetworks, lcSearchKey, lcSearchHits, lcLikeSearch, lcLikedSearchCheck, LikedSearches, LikedPage, lcLikedIntent });
})(window.Looscid);
