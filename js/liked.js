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
    const custom = extraPanels && extraPanels[t.id];
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
      const open = x.k === "circle" ? function () { navigate("circles"); } : x.k === "app" && x.go ? function () { Looscid.lcOpenLikedApp && Looscid.lcOpenLikedApp(x, navigate); } : x.k === "chat" ? function () { navigate(x.cherry ? "cherry" : "alerts"); } : null;
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
})(window.Looscid);
