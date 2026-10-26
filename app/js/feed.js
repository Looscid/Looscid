/* Looscid feed.js: the Feed tab.
   Plain script (not a module). Everything it shares goes on window.Looscid; see docs/dev/FILES.md for the load order. */
(function (Looscid) {
const { CommentView, DREAMS_INIT, DreamCard, LC_FEEDS, LC_FED_SUBS, LC_FED_NETS, LC_FY_SOURCES, LcMenu, ME, SHOW_FRIENDS_KEY, USERS, announce, lcAiOn, lcAudienceOk, lcDreamWords, lcFeedMode, lcFiltered, lcHandle, lcNotify, lcQuietNow, lcSetFeed, lcSetShowFriends, lcStepFeed, lh, useDreams, useEffect, useRef, useState } = Looscid;
Object.assign(Looscid, { FeedPage, lcNotifyDreams, lcShowFriends, useFeedMode, FeedTabs, FeedMenuButton, ShowFriendsBox, useFeedState, FeedControls, lcFeedVisible, PinForm, FyFollowSettings, FedNetsSettings });

/* --- FEED PAGE --------------------------- */
function FeedPage({navigate, prefs, cherryCtx}) {
  const [tab, showFriends] = useFeedState();
  const {dreams: rawDreams, setDreams, tl, tr, tur, tq, tuq, tb, tc} = useDreams(cherryCtx ? cherryCtx.dreams : DREAMS_INIT);
  // Round 5 fixes: a Dream opened from Discover's results shows here; Back returns to Discover (Looscid.LC_FEED_OPEN, read once).
  const openFrom = useRef(null);
  const [activeComment, setActiveComment] = useState(function () { const o = Looscid.LC_FEED_OPEN; Looscid.LC_FEED_OPEN = null; if (!o || !o.dream) { const rb = Looscid.LC_CV_REOPEN && Looscid.LC_CV_REOPEN.back; const d = Looscid.lcCvTake ? Looscid.lcCvTake() : null; if (d && rb) openFrom.current = rb; return d; } openFrom.current = o.back || null; return o.dream; }); // round 10: reopened after a footer page, it still knows its Back
  const A = Looscid.A11Y_NOW;
  // New Dreams that reach the app (yours, or from the network) join the feed; others are announced.
  const known = useRef(null);
  const appDreams = cherryCtx ? cherryCtx.dreams : null;
  useEffect(function () {
    if (!appDreams) return;
    if (!known.current) { known.current = new Set(appDreams.map(function (d) { return d.id; })); return; }
    const fresh = appDreams.filter(function (d) { return !known.current.has(d.id); });
    if (!fresh.length) return;
    fresh.forEach(function (d) { known.current.add(d.id); });
    setDreams(function (ds) { const have = new Set(ds.map(function (d) { return d.id; })); return fresh.filter(function (d) { return !have.has(d.id); }).concat(ds); });
    const others = fresh.filter(function (d) { return d.user !== ME && !(lcFiltered(d) || {}).hide; });
    // Round 6: each incoming Dream goes through the Alerts door (its on/off, sound, who and quiet hours).
    if (others.length) lcNotifyDreams(others, new Set(appDreams.filter(function (d) { return d.user === ME; }).map(function (d) { return d.id; })));
    if (!others.length || lcQuietNow()) return;
    const mode = Looscid.A11Y_NOW.announceNew;
    if (mode === "count") announce(others.length + (others.length === 1 ? " new Dream" : " new Dreams"));
    else if (mode === "read") announce(others.length + (others.length === 1 ? " new Dream: " : " new Dreams: ") + others.slice(0, 3).map(function (d) { return (lcFiltered(d) || {}).bw ? "Hidden: contains a blocked word" : lcDreamWords(d, "speech"); }).join(". Next: "));
  }, [appDreams]);
  // Reading mode: one Dream at a time.
  const [rmIdx, setRmIdx] = useState(0);
  const rmTouch = useRef(null);
  // Focus memory: coming back to a feed returns to the same Dream.
  const listRef = useRef(null);
  useEffect(function () {
    if (!Looscid.LC_FEED_SEEN) { Looscid.LC_FEED_SEEN = true; return; }
    if (Looscid.LC_FEED_HEADING) { Looscid.LC_FEED_HEADING = false; return; } // round 12: the Home tab closed Replies; focus stays on the heading
    if (!Looscid.A11Y_NOW.focusMemory) return;
    let mem = {}; try { mem = JSON.parse(localStorage.getItem(LC_FOCUSMEM_KEY) || "{}") || {}; } catch (e) {}
    const id = mem[tab]; if (id == null) return;
    // Round 7 fixes (QA round 6): Back from a footer page puts focus on the footer link it came from; focus memory leaves it there.
    const t = setTimeout(function () { const ae = document.activeElement; if (ae && ae.closest && ae.closest("footer.lc-footer")) return;
      const el = document.querySelector('#feed-list [data-dream-id="' + String(id).replace(/"/g, "") + '"]'); if (el && !(el !== document.activeElement && el.contains(document.activeElement))) { el.focus(); } }, 260); // Round 5 fixes: already on that Dream's Replies button (Back from Replies): stay there
    return function () { clearTimeout(t); };
  }, [activeComment]);
  const rememberFocus = function (e) {
    const art = e.target && e.target.closest ? e.target.closest("[data-dream-id]") : null; if (!art) return;
    try { const mem = JSON.parse(localStorage.getItem(LC_FOCUSMEM_KEY) || "{}") || {}; mem[tab] = art.getAttribute("data-dream-id"); localStorage.setItem(LC_FOCUSMEM_KEY, JSON.stringify(mem)); } catch (er) {}
  };
  const FOLLOWING = (cherryCtx && cherryCtx.following) || new Set();
  const FRIENDS_IDS = new Set(USERS.filter(u=>u.followsYou && FOLLOWING.has(u.id)).map(u=>u.id)); // mutuals
  // Build 151 (#54): For You, Following, Federated (Latest or Popular; Local removed in Round 7.16) and pinned tabs. See lcFeedVisible below.
  useFeedTick();
  const [pub, setPub] = useState({ list: [], state: "idle" });
  // Round 7.16 (#216): Federated has no Local any more (it asked for your location and was empty most of the time).
  const nets = Looscid.lcFedNets();
  const wantPub = tab === "federated" && nets.indexOf("nostr") >= 0 && !!Looscid.lcNostr;
  const pubKey = wantPub ? "all" : "";
  useEffect(function () {
    if (!pubKey) return; let live = true;
    setPub(function (p) { return { list: p.key === pubKey ? p.list : [], state: "loading", key: pubKey }; });
    Looscid.lcNostr.fetchPublic({ g: pubKey.indexOf("g:") === 0 ? pubKey.slice(2) : undefined }).then(function (list) { if (live) setPub({ list: list.map(lcPubDream), state: "done", key: pubKey }); },
      function () { if (live) setPub({ list: [], state: "error", key: pubKey }); });
    return function () { live = false; };
  }, [pubKey]);
  Looscid.useIdListTick("looscid:notinterested"); // build 152 prep: Not interested hides a Dream from For You
  const notInt = tab === "for you" ? Looscid.lcNotInterested() : [];
  const visible = lcFeedVisible(tab, rawDreams, { following: FOLLOWING, friends: FRIENDS_IDS, showFriends: showFriends, groups: cherryCtx && cherryCtx.groups, pub: pubKey && pub.key === pubKey ? pub.list : [] }).filter(function (d) { return notInt.indexOf(String(d.id)) < 0; });


  if (activeComment) return (
    React.createElement(CommentView, { dream: (rawDreams.find(function (x) { return x.id === activeComment.id; }) || activeComment), backTo: openFrom.current, onBack: ()=>{ const b = openFrom.current; openFrom.current = null; if (b) { b(); return; } setActiveComment(null); },
      onLike: tl, onRedream: tr, onUndoRedream: tur,
      onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onCommentPosted: tc, navigate: navigate,})
  );

  const rmOn = !!A.readingMode && visible.length > 0;
  const rmI = Math.min(rmIdx, Math.max(0, visible.length - 1));
  const rmGo = function (i) { const j = Math.max(0, Math.min(visible.length - 1, i)); if (j === rmI) { announce(j === 0 ? "This is the first Dream." : "This is the last Dream."); return; } setRmIdx(j); setTimeout(function () { const h = document.getElementById("rm-pos"); if (h) h.focus(); }, 30); };

  const onFeedKey = e => {
    if ((e.key === "PageDown" || e.key === "PageUp") && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && !e.target.isContentEditable) { e.preventDefault(); lcStepFeed(e.key === "PageDown" ? 1 : -1); }
  };
  return (
    React.createElement('div', { className: "pg", onKeyDown: onFeedKey,}
      /* Build 152 prep: only the feed tabs stay pinned at the top while you scroll. The title, welcome line and feed
         options scroll away, so on small screens the header no longer covers the first Dream's buttons. */
      , React.createElement('div', { className: "hdr lc-hdr-static",}
        , React.createElement('div', { style: {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"48px 16px 0"},}
          , React.createElement('h1', { className: "htit", tabIndex:-1,}, "Home")
          /* Round 7.16 (#216, Carter said yes Oct 25 2026): no Cherry button and no "everything app" welcome line here, so the
             feed tabs come right after the heading. Cherry stays in Profile, More. */
        )
      )
      , lh('div', { className: "lc-feed-bar" }, lh(FeedTabs, null))
      , lh('div', { className: "lc-feed-ctl" }, lh(FeedControls, { tab: tab, cherryCtx: cherryCtx, dreams: rawDreams, pubState: pubKey && pub.key === pubKey ? pub.state : "idle" }))
      , visible.length===0 && lh('div', { className: "es" },
          lh('p', { className: "esl" }, tab==="following" && showFriends ? "No Dreams from friends yet" : "No Dreams yet"),
          lh('p', { style: {fontSize:14,color:"var(--tx2)",marginTop:6,lineHeight:1.6,maxWidth:260,textAlign:"center"} },
            (tab==="following" && showFriends) ? "Friends are Dreamors who follow each other." : tab==="following" ? "Follow people to fill this feed." : tab==="federated" && !nets.length ? "Choose at least one network above." : /^pin:/.test(tab) ? "Dreams for this tab will show up here." : "New Dreams will show up here."),
          // Round 7.16 (#216): Discover, not Cherry, is where you find people.
          tab==="following" && lh('button', { type: "button", id: "feed-find-people", className: "btn bgb lc-btn", style: {margin:"10px auto 0",display:"flex"}, onClick: ()=>navigate("discover") }, "Find people in Discover"))
      , rmOn && lh('div', { className: "lc-rm", onKeyDown: function (e) { if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return; if (e.key === "ArrowRight") { e.preventDefault(); rmGo(rmI + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); rmGo(rmI - 1); } },
          onTouchStart: function (e) { const t = e.touches[0]; rmTouch.current = { x: t.clientX, y: t.clientY }; },
          onTouchEnd: function (e) { const s0 = rmTouch.current; rmTouch.current = null; if (!s0) return; const t = e.changedTouches[0], dx = t.clientX - s0.x; if (Math.abs(dx) > 60 && Math.abs(t.clientY - s0.y) < 40) rmGo(rmI + (dx < 0 ? 1 : -1)); } },
          lh('h2', { id: "rm-pos", className: "lc-sub-h", tabIndex: -1, style: { padding: "0 16px" } }, "Reading mode (Dream " + (rmI + 1) + " of " + visible.length + ")"), // Round 7.20 (#150): positions in parens
          lh('div', { className: "lc-inrow", style: { padding: "0 16px" } },
            lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { rmGo(rmI - 1); }, "aria-label": "Previous Dream" }, "Previous"),
            lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { rmGo(rmI + 1); }, "aria-label": "Next Dream" }, "Next")))
      , lh('div', { id: "feed-list", role: "region", "aria-label": "Dreams", ref: listRef, onFocus: rememberFocus }, (rmOn ? [visible[rmI]] : visible).map((d,idx) => (
        React.createElement(React.Fragment, { key: d.id,}
          , React.createElement(DreamCard, { dream: d, forYou: tab === "for you", onLike: tl, onRedream: tr, onUndoRedream: tur,
            onQuote: tq, onUndoQuote: tuq, onBookmark: tb,
            onComment: d=>setActiveComment(d), navigate: navigate, cherryCtx: cherryCtx,})
          /* Round 7.16 (#216): no Cherry cards between Dreams (the list was always empty). */
        )
      )))
    )
  );
}
const LC_FOCUSMEM_KEY = "looscid_focus_memory";
Looscid.LC_FOCUSMEM_KEY = LC_FOCUSMEM_KEY;
Looscid.LC_FEED_SEEN = false; // the first Home visit never jumps to a remembered Dream // the Dream that last had focus (for "read this dream")
// Incoming Dreams from others: a mention of you, a reply to one of your Dreams, or a new Dream.
function lcNotifyDreams(others, mine) {
  const me = lcHandle((typeof ME !== "undefined" && ME && ME.handle) || "");
  others.forEach(function (d) {
    const u = d.user && typeof d.user === "object" ? d.user : null, txt = String(d.text || "");
    if (me && new RegExp("(^|\\W)@" + me.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(txt)) { if (lcAudienceOk((Looscid.A11Y_NOW || {}).whoMention || "everyone", u, "perm_whoMention")) lcNotify("mention", "mentioned you", u, txt.slice(0, 140), { thread: String(d._root || d.replyTo || d.id) }); }
    else if (d.replyTo && mine && mine.has(d.replyTo)) { if (lcAudienceOk((Looscid.A11Y_NOW || {}).whoReply || "everyone", u, "perm_whoReply")) lcNotify("reply", "replied to your Dream", u, txt.slice(0, 140), { thread: String(d.replyTo) }); }
    // Build 151 (#74): a Reply in a thread you follow.
    else if ((d.replyTo || d._root) && Looscid.lcThreadSubbed && Looscid.lcThreadSubbed(lcRootOf(d))) Looscid.lcThreadAlert(lcRootOf(d), u, txt);
    else lcNotify("newDream", "dreamed a new Dream", u, txt.slice(0, 140));
  });
}
function lcShowFriends() { try { return localStorage.getItem(SHOW_FRIENDS_KEY) === "1"; } catch (e) { return false; } }
function useFeedMode() {
  const [mode, setMode] = useState(lcFeedMode(Looscid.A11Y_NOW.feedSwitch));
  useEffect(function () { const f = function (e) { setMode(lcFeedMode(e.detail)); }; window.addEventListener("looscid:feedmode", f); return function () { window.removeEventListener("looscid:feedmode", f); }; }, []);
  return mode;
}
function FeedTabs() {
  const [feed, setFeed] = useState(Looscid.LC_FEED);
  const mode = useFeedMode();
  useFeedTick(); // pinned tabs come and go
  useEffect(function () { const f = function (e) { setFeed(e.detail); }; window.addEventListener("looscid:feed", f); return function () { window.removeEventListener("looscid:feed", f); }; }, []);
  const idx = Math.max(0, LC_FEEDS.findIndex(function (f) { return f.id === feed; }));
  const tabId = function (id) { return "feed-tab-" + id.replace(/ /g, "-"); };
  const go = function (i, focus) { const f = LC_FEEDS[(i + LC_FEEDS.length) % LC_FEEDS.length]; lcSetFeed(f.id); if (focus) setTimeout(function () { const b = document.getElementById(tabId(f.id)); if (b) b.focus(); }, 0); };
  const tabsMode = mode === "tabs";
  const onKey = function (e) {
    if (!tabsMode) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1, true); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1, true); }
    else if (e.key === "Home") { e.preventDefault(); go(0, true); }
    else if (e.key === "End") { e.preventDefault(); go(LC_FEEDS.length - 1, true); }
  };
  if (mode === "menu") return lh(React.Fragment, null, lh(FeedMenuButton, { feed: feed }), feed === "following" ? lh(ShowFriendsBox, null) : null);
  // Tabs mode: the tablist is the one feed control. Round 7.16 (#216): Swipe mode is gone (Tabs and Pop-up button cover
  // it); a saved Swipe choice reads as Tabs (lcFeedMode).
  const strip = lh('div', { className: "ftabs lc-feedtabs", role: "tablist", "aria-label": "Feeds", id: "feed-tablist", onKeyDown: onKey },
    LC_FEEDS.map(function (f, i) {
      const on = i === idx;
      return lh('button', { key: f.id, id: tabId(f.id), type: "button", className: "ftab" + (on ? " on" : ""), role: "tab", "aria-selected": on, "aria-setsize": LC_FEEDS.length, "aria-posinset": i + 1, tabIndex: on ? 0 : -1, "aria-controls": "feed-list", onClick: function () { go(i, false); } },
        f.label); // build 149: no "1/7" position in the name. Round 7.12: aria-setsize/aria-posinset carry it instead.
    }));
  return lh(React.Fragment, null,
    strip,
    feed === "following" ? lh(ShowFriendsBox, null) : null);
}
// Pop-up button mode ("Dropdown Mode"): one "Feed: Home" button. Round 7.36 (Carter, Oct 26 2026): it is a collapsible now
// (aria-expanded, never inside a heading) that shows the feeds as real radio buttons, built exactly like Privacy's audience
// radios (fieldset, legend, label.lc-radio around a native radio, one column). Same ids: #feed-menu-btn opens #feed-menu.
// Opening puts focus on the checked feed; the arrow keys pick a feed (it switches right away, as before); Enter or Escape
// closes and goes back to the button; tapping outside or tabbing away closes it.
function FeedMenuButton({ feed }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null), boxRef = useRef(null), wrapRef = useRef(null);
  const cur = LC_FEEDS.find(function (f) { return f.id === feed; }) || LC_FEEDS[0];
  useEffect(function () { if (!open) return; const r = boxRef.current && (boxRef.current.querySelector('input[type="radio"]:checked') || boxRef.current.querySelector('input[type="radio"]')); if (r) r.focus(); }, [open]);
  useEffect(function () {
    if (!open) return;
    const onDoc = function (e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", onDoc, true);
    return function () { document.removeEventListener("pointerdown", onDoc, true); };
  }, [open]);
  const close = function () { setOpen(false); if (btnRef.current) btnRef.current.focus(); };
  const onKey = function (e) { if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); close(); } };
  const onBlur = function (e) { const to = e.relatedTarget; if (to && wrapRef.current && !wrapRef.current.contains(to)) setOpen(false); };
  return lh('div', { className: "lc-feedmenu", ref: wrapRef, onBlur: onBlur },
    lh('button', { id: "feed-menu-btn", ref: btnRef, type: "button", className: "btn bgb lc-feedmenu-btn", "aria-expanded": open ? "true" : "false",
        "aria-controls": open ? "feed-menu" : undefined, onClick: function () { setOpen(!open); } },
      lh('span', null, "Feed: " + cur.label),
      lh('span', { className: "lmenu-caret", "aria-hidden": "true" }, open ? "\u25B4" : "\u25BE")),
    open ? lh('div', { id: "feed-menu", ref: boxRef, className: "lc-feedmenu-panel", onKeyDown: onKey },
      lh('fieldset', { className: "lc-fs lc-aud" },
        lh('legend', { className: "lc-fs-l" }, "Feeds"),
        lh('div', { className: "lc-radios lc-radios-col" }, LC_FEEDS.map(function (f) {
          const on = f.id === feed;
          return lh('label', { key: f.id, className: "lc-radio" + (on ? " on" : "") },
            lh('input', { type: "radio", name: "feed-menu-r", value: f.id, checked: on, onChange: function () { lcSetFeed(f.id); } }), lh('span', null, f.label));
        })))) : null);
}
function ShowFriendsBox() {
  const [on, setOn] = useState(lcShowFriends());
  useEffect(function () { const f = function (e) { setOn(e.detail); }; window.addEventListener("looscid:showfriends", f); return function () { window.removeEventListener("looscid:showfriends", f); }; }, []);
  return lh('div', { className: "lc-showfr-row" },
    lh('label', { className: "lc-showfr" },
      lh('input', { type: "checkbox", id: "show-friends", checked: on, onChange: function (e) { lcSetShowFriends(e.target.checked); } }),
      lh('span', null, "Show friends")),
    lh('span', { id: "show-friends-d", className: "lc-showfr-d" }, "Only show mutuals"));
}

/* --- Build 151 (#54): what each feed shows ------------------------------------------------------------
   For You: everything, with Dreams from what you follow mixed in while Show following is on (each kind has its own
   switch). Following: people you follow (Show friends: mutuals only). Federated: Dreams from the networks you choose
   (Looscid, and public Looscid Dreams from your Nostr relays), as Latest or Popular (Round 7.16: Local, Dreams from
   around you, is gone). Pinned tabs: one Circle, person, hashtag or thread. Sort on For You and Following: Latest or Popular. */
function lcAgeMin(d) {
  if (d && +d.created > 0) return Math.max(0, (Date.now() - d.created) / 60000);
  const t = String((d && d.time) || ""); if (/now/i.test(t)) return 0;
  const m = /^(\d+)\s*([smhdw])/.exec(t); if (!m) return 1e9; return (+m[1]) * ({ s: 1 / 60, m: 1, h: 60, d: 1440, w: 10080 }[m[2]]);
}
function lcScore(d) { return (d.likes || 0) + (d.redreams || 0) + (d.quotes || 0) + (d.comments || 0); }
function lcSortDreams(list, how) { return list.slice().sort(how === "popular" ? function (x, y) { return lcScore(y) - lcScore(x) || lcAgeMin(x) - lcAgeMin(y); } : function (x, y) { return lcAgeMin(x) - lcAgeMin(y); }); }
function lcTagsOf(d) { return (String(d.text || "").match(/#[\p{L}\p{N}_]+/gu) || []).map(function (t) { return t.toLowerCase(); }); }
function lcRootOf(d) { return String(d._root || d.replyTo || d.id); }
function lcAgo(ms) { const m = Math.max(0, (Date.now() - ms) / 60000); return m < 1 ? "just now" : m < 60 ? Math.floor(m) + "m" : m < 1440 ? Math.floor(m / 60) + "h" : m < 10080 ? Math.floor(m / 1440) + "d" : Math.floor(m / 10080) + "w"; }
function lcPubDream(r) {
  const short = String(r.npub || r.pk).slice(0, 14);
  return { id: "n:" + r.id, nid: r.nid, user: { id: "npub:" + r.pk, name: short, handle: "@" + short, net: "nostr" }, text: r.text, time: lcAgo(r.created), created: r.created,
    likes: 0, comments: 0, redreams: 0, quotes: 0, liked: false, redreamed: false, quoted: false, bookmarked: false, cw: r.cw, net: "nostr", g: r.g, tags: r.tags, edits: r.edits, editedAt: r.editedAt };
}
function lcFeedVisible(tab, raw, o) {
  const pins = Looscid.lcPins(), FOL = o.following || new Set();
  const joined = new Set((o.groups || []).filter(function (g) { return g.joined; }).map(function (g) { return String(g.id); }));
  const pinTags = new Set(pins.filter(function (p) { return p.kind === "tag"; }).map(function (p) { return String(p.ref).toLowerCase(); }));
  const pinThreads = new Set(pins.filter(function (p) { return p.kind === "thread"; }).map(function (p) { return String(p.ref); }));
  const src = {
    people: function (d) { return !!d.user && FOL.has(d.user.id); },
    circles: function (d) { return d.circleId != null && joined.has(String(d.circleId)); },
    tags: function (d) { return lcTagsOf(d).some(function (t) { return pinTags.has(t); }); },
    threads: function (d) { return pinThreads.has(lcRootOf(d)); },
  };
  let list;
  if (tab === "following") list = lcSortDreams(raw.filter(function (d) { return src.people(d) && (!o.showFriends || (o.friends && o.friends.has(d.user.id))); }), Looscid.lcFeedSort("following"));
  else if (tab === "federated") {
    const nets = Looscid.lcFedNets(), sub = Looscid.lcFedSub();
    const have = new Set(raw.map(function (d) { return d.nid; }).filter(Boolean));
    const base = (nets.indexOf("looscid") >= 0 ? raw : []).concat(nets.indexOf("nostr") >= 0 ? (o.pub || []).filter(function (d) { return !have.has(d.nid); }) : []);
    list = lcSortDreams(base, sub === "popular" ? "popular" : "latest");
  } else if (/^pin:/.test(tab)) {
    const f = LC_FEEDS.find(function (x) { return x.id === tab; }), p = f && f.pin;
    // Build 152 prep (#99, part 4c): a pinned List reads its Dreamors' Dreams, on Looscid and from Nostr.
    const pinList = p && p.kind === "list" ? Looscid.lcListGet(String(p.ref)) : null;
    const haveN = new Set(raw.map(function (d) { return d.nid; }).filter(Boolean));
    const pool = pinList ? raw.concat((o.pub || []).filter(function (d) { return !haveN.has(d.nid); })) : raw;
    list = !p || (p.kind === "list" && !pinList) ? [] : lcSortDreams(pool.filter(function (d) {
      if (p.kind === "circle") return d.circleId != null && String(d.circleId) === String(p.ref);
      if (p.kind === "person") return !!d.user && lcHandle(d.user.handle || "") === String(p.ref);
      if (p.kind === "tag") return lcTagsOf(d).indexOf(String(p.ref).toLowerCase()) >= 0;
      if (p.kind === "thread") return lcRootOf(d) === String(p.ref) || String(d.id) === String(p.ref);
      if (p.kind === "list") return !d.replyTo && Looscid.lcListHas(pinList, d.user);
      return false;
    }), "latest");
  } else {
    const fy = Looscid.lcFyFollow();
    const off = LC_FY_SOURCES.map(function (s) { return s[0]; }).filter(function (k) { return !fy.on || !fy[k]; });
    list = lcSortDreams(raw.filter(function (d) { return !off.some(function (k) { return src[k](d); }); }), Looscid.lcFeedSort("for you"));
  }
  return list.filter(function (d) { return !(lcFiltered(d) || {}).hide; });
}
function useFeedTick() {
  const [, setN] = useState(0);
  useEffect(function () {
    const f = function () { setN(function (n) { return n + 1; }); };
    const ev = ["looscid:pins", "looscid:fedsub", "looscid:fednets", "looscid:feedsort", "looscid:fyfollow", "looscid:fedlocal", "looscid:threadsubs"]; // + #74
    ev.forEach(function (e) { window.addEventListener(e, f); });
    return function () { ev.forEach(function (e) { window.removeEventListener(e, f); }); };
  }, []);
}
// Looscid's own switch (the same one as in Settings): a button with role=switch that says On or Off.
function lcSwitch(id, label, on, onChange) { return lh(Looscid.A11ySwitch, { key: id, id: id, label: label, on: !!on, onToggle: function () { onChange(!on); } }); }
// The controls under the feed tabs, for the feed that's open.
function FeedControls({ tab, cherryCtx, dreams, pubState }) {
  useFeedTick();
  // Round 7.16 (#216, Carter said yes Oct 25 2026): Sort is the only control above each feed. Show following and its four
  // switches, Federated's Networks and the Pin a tab form moved to Settings, Customizability, Feeds and home.
  const sortPick = function (feed) {
    const fed = feed === "federated";
    return lh('div', { key: "sort", className: "lc-feed-sort" }, lh(LcMenu, { id: "feed-sort-btn", menuId: "feed-sort", label: "Sort", hideLabel: true, title: "Sort", inline: true, prefix: "Sort: ", btnClass: "btn bgb lc-btn",
      value: fed ? Looscid.lcFedSub() : Looscid.lcFeedSort(feed), items: [{ id: "latest", name: "Latest" }, { id: "popular", name: "Popular" }],
      onSelect: function (id) { if (fed) Looscid.lcSetFedSub(id, true); else Looscid.lcSetFeedSort(feed, id); } }));
  };
  if (tab === "for you") return lh('div', { className: "lc-feed-ctl" }, sortPick("for you"));
  if (tab === "following") return lh('div', { className: "lc-feed-ctl" }, sortPick("following"));
  if (tab === "federated") return lh(FederatedControls, { pubState: pubState, sortPick: sortPick });
  const f = LC_FEEDS.find(function (x) { return x.id === tab; });
  if (f && f.pin) return lh('div', { className: "lc-feed-ctl" },
    lh('p', { className: "lc-muted" }, "A tab you pinned: " + (f.pin.kind === "tag" ? "the hashtag " : f.pin.kind === "circle" ? "the Circle " : f.pin.kind === "person" ? "Dreams from " : f.pin.kind === "list" ? "your list " : "") + (f.pin.kind === "thread" ? "a thread." : f.label + ".")),
    lh('button', { type: "button", id: "feed-unpin", className: "btn bgb lc-btn", onClick: function () { Looscid.lcPinRemove(tab); setTimeout(function () { const b = document.getElementById("feed-tab-following"); if (b) b.focus(); }, 0); } }, "Unpin this tab"));
  return null;
}
// Federated: the same Sort button as the other feeds (Latest or Popular; it was Popular, Latest and Local tabs), then the
// relay status lines. Round 7.16 (#216): Local is gone, and Networks is in Settings, Customizability, Feeds and home.
function FederatedControls({ pubState, sortPick }) {
  return lh('div', { className: "lc-feed-ctl lc-fed" },
    sortPick("federated"),
    pubState === "loading" ? lh('p', { className: "lc-muted" }, "Getting Dreams from your Nostr relays\u2026") :
    pubState === "error" ? lh('p', { className: "lc-muted" }, "Couldn't reach your Nostr relays just now. Showing what Looscid has.") : null);
}
/* Round 7.16 (#216): set once in Settings, Customizability, Feeds and home, not above the feed every visit. */
// For You: Show following, and which kinds of what you follow are mixed in.
function FyFollowSettings() {
  useFeedTick();
  const fy = Looscid.lcFyFollow();
  return lh('section', { className: "lc-grp", "aria-labelledby": "set-fy-h" },
    lh('h3', { id: "set-fy-h", className: "lc-sub-h" }, "For You"),
    lcSwitch("fy-show-following", "Show following", fy.on, function (v) { Looscid.lcSetFyFollow({ on: v }); }),
    fy.on ? lh('fieldset', { className: "lc-fy-src" }, lh('legend', null, "Following in For You"),
      LC_FY_SOURCES.map(function (s) { return lcSwitch("fy-src-" + s[0], s[1], fy[s[0]], function (v) { const pt = {}; pt[s[0]] = v; Looscid.lcSetFyFollow(pt); }); })) : null);
}
// Federated: which networks it reads. Only networks Looscid really reads are shown (no Coming soon items).
function FedNetsSettings() {
  useFeedTick();
  const nets = Looscid.lcFedNets();
  return lh('section', { className: "lc-grp", "aria-labelledby": "set-fed-h" },
    lh('h3', { id: "set-fed-h", className: "lc-sub-h" }, "Federated"),
    lh('fieldset', { className: "lc-fed-nets" }, lh('legend', null, "Networks"),
      LC_FED_NETS.filter(function (n) { return !n.soon; }).map(function (n) {
        return lh('div', { key: n.id, className: "lc-chk-row" },
          lh('input', { type: "checkbox", id: "fed-net-" + n.id, checked: nets.indexOf(n.id) >= 0, onChange: function (e) { Looscid.lcSetFedNet(n.id, e.target.checked); } }),
          lh('label', { htmlFor: "fed-net-" + n.id }, n.label));
      })));
}
// Pin a Circle, a person, a hashtag, a thread or one of your Lists (build 152) as its own feed tab. Round 7.16 (#216): in
// Settings, Customizability, Feeds and home, under Feed tabs (it sat on top of the Following feed).
function PinForm({ cherryCtx, dreams }) {
  const [kind, setKind] = useState("circle"), [val, setVal] = useState(""), [tag, setTag] = useState("");
  const groups = ((cherryCtx && cherryCtx.groups) || []).filter(function (g) { return g.joined; });
  const fol = (cherryCtx && cherryCtx.following) || new Set();
  const people = USERS.filter(function (u) { return fol.has(u.id); });
  const threads = (dreams || []).filter(function (d) { return !d.replyTo && (d.comments || 0) > 0; }).slice(0, 30);
  const opts = kind === "circle" ? groups.map(function (g) { return { id: String(g.id), name: g.name }; })
    : kind === "person" ? people.map(function (u) { return { id: lcHandle(u.handle), name: u.name }; })
    : kind === "thread" ? threads.map(function (d) { return { id: String(d.id), name: (d.user ? d.user.name + ": " : "") + String(d.text || "").replace(/\s+/g, " ").slice(0, 40).trim() }; }) 
    : kind === "list" ? Looscid.lcListsRead().map(function (l) { return { id: l.id, name: l.name }; }) : [];
  const cur = opts.find(function (o) { return o.id === val; }) || opts[0];
  const pin = function () {
    if (kind === "tag") { const t = "#" + tag.trim().replace(/^#+/, "").replace(/\s+/g, ""); if (t.length < 2) { announce("Type a hashtag first."); return; } Looscid.lcPinAdd("tag", t.toLowerCase(), t); setTag(""); return; }
    if (!cur) return;
    Looscid.lcPinAdd(kind, cur.id, kind === "thread" ? "Thread: " + Looscid.lcCutWords(cur.name, 30) : cur.name);
  };
  const none = kind === "circle" ? "Join a Circle first, then you can pin it." : kind === "person" ? "Follow someone first, then you can pin them." : kind === "list" ? "Make a list first: Profile, More, Lists. Then you can pin it." : "No threads with Replies yet.";
  return lh('fieldset', { className: "lc-pinform" }, lh('legend', null, "Pin a tab"),
    lh(LcMenu, { id: "pin-kind-btn", menuId: "pin-kind", label: "What to pin", hideLabel: true, title: "What to pin", inline: true, prefix: "Pin: ", btnClass: "btn bgb lc-btn",
      value: kind, items: [{ id: "circle", name: "A Circle" }, { id: "person", name: "A person" }, { id: "tag", name: "A hashtag" }, { id: "thread", name: "A thread" }, { id: "list", name: "A list" }], onSelect: function (id) { setKind(id); setVal(""); } }),
    kind === "tag" ? lh('div', { className: "lc-inrow" }, lh('label', { htmlFor: "pin-tag" }, "Hashtag"),
        lh('input', { id: "pin-tag", className: "inp", type: "text", autoComplete: "off", value: tag, onChange: function (e) { setTag(e.target.value); }, onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); pin(); } } }))
      : opts.length ? lh(LcMenu, { id: "pin-val-btn", menuId: "pin-val", label: "Which one", hideLabel: true, title: kind === "circle" ? "Circles" : kind === "person" ? "People" : kind === "list" ? "Lists" : "Threads", inline: true, btnClass: "btn bgb lc-btn",
          value: cur && cur.id, items: opts, onSelect: function (id) { setVal(id); } })
      : lh('p', { className: "lc-muted" }, none),
    lh('button', { type: "button", id: "pin-go", className: "btn bgb lc-btn", "aria-disabled": kind !== "tag" && !opts.length ? "true" : undefined, onClick: function () { if (kind !== "tag" && !opts.length) return; pin(); } }, "Pin as a tab"));
}
function useFeedState() {
  const [feed, setFeed] = useState(Looscid.LC_FEED), [fr, setFr] = useState(lcShowFriends());
  useEffect(function () {
    const a = function (e) { setFeed(e.detail); }, b = function (e) { setFr(e.detail); };
    window.addEventListener("looscid:feed", a); window.addEventListener("looscid:showfriends", b);
    return function () { window.removeEventListener("looscid:feed", a); window.removeEventListener("looscid:showfriends", b); };
  }, []);
  return [feed, fr];
}
})(window.Looscid = window.Looscid || {});
