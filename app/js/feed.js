/* Looscid feed.js: the Feed tab.
   Plain script (not a module). Everything it shares goes on window.Looscid; see docs/dev/FILES.md for the load order. */
(function (Looscid) {
const { CommentView, DREAMS_INIT, DreamCard, LC_FEEDS, LC_FED_SUBS, LC_FED_NETS, LC_FY_SOURCES, LcMenu, ME, SHOW_FRIENDS_KEY, USERS, announce, lcAiOn, lcAudienceOk, lcDreamWords, lcFeedMode, lcFiltered, lcHandle, lcNotify, lcQuietNow, lcSetFeed, lcSetShowFriends, lcStepFeed, lh, useDreams, useEffect, useRef, useState } = Looscid;
Object.assign(Looscid, { FeedPage, lcNotifyDreams, lcShowFriends, useFeedMode, FeedTabs, FeedMenuButton, ShowFriendsBox, useFeedState, FeedControls, lcFeedVisible });

/* --- FEED PAGE --------------------------- */
function FeedPage({navigate, prefs, cherryCtx}) {
  const [tab, showFriends] = useFeedState();
  const {dreams: rawDreams, setDreams, tl, tr, tur, tq, tuq, tb, tc} = useDreams(cherryCtx ? cherryCtx.dreams : DREAMS_INIT);
  const [activeComment, setActiveComment] = useState(null);
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
    if (!Looscid.A11Y_NOW.focusMemory) return;
    let mem = {}; try { mem = JSON.parse(localStorage.getItem(LC_FOCUSMEM_KEY) || "{}") || {}; } catch (e) {}
    const id = mem[tab]; if (id == null) return;
    const t = setTimeout(function () { const el = document.querySelector('#feed-list [data-dream-id="' + String(id).replace(/"/g, "") + '"]'); if (el) { el.focus(); } }, 260);
    return function () { clearTimeout(t); };
  }, [activeComment]);
  const rememberFocus = function (e) {
    const art = e.target && e.target.closest ? e.target.closest("[data-dream-id]") : null; if (!art) return;
    try { const mem = JSON.parse(localStorage.getItem(LC_FOCUSMEM_KEY) || "{}") || {}; mem[tab] = art.getAttribute("data-dream-id"); localStorage.setItem(LC_FOCUSMEM_KEY, JSON.stringify(mem)); } catch (er) {}
  };
  const FOLLOWING = (cherryCtx && cherryCtx.following) || new Set();
  const FRIENDS_IDS = new Set(USERS.filter(u=>u.followsYou && FOLLOWING.has(u.id)).map(u=>u.id)); // mutuals
  // Build 151 (#54): For You, Following, Federated (Popular, Latest, Local) and pinned tabs. See lcFeedVisible below.
  useFeedTick();
  const [pub, setPub] = useState({ list: [], state: "idle" });
  const fedSub = Looscid.lcFedSub(), nets = Looscid.lcFedNets(), loc = Looscid.lcFedLocal();
  const wantPub = tab === "federated" && nets.indexOf("nostr") >= 0 && !!Looscid.lcNostr && (fedSub !== "local" || !!loc);
  const pubKey = wantPub ? (fedSub === "local" && loc ? "g:" + loc.g : "all") : "";
  useEffect(function () {
    if (!pubKey) return; let live = true;
    setPub(function (p) { return { list: p.key === pubKey ? p.list : [], state: "loading", key: pubKey }; });
    Looscid.lcNostr.fetchPublic({ g: pubKey.indexOf("g:") === 0 ? pubKey.slice(2) : undefined }).then(function (list) { if (live) setPub({ list: list.map(lcPubDream), state: "done", key: pubKey }); },
      function () { if (live) setPub({ list: [], state: "error", key: pubKey }); });
    return function () { live = false; };
  }, [pubKey]);
  const visible = lcFeedVisible(tab, rawDreams, { following: FOLLOWING, friends: FRIENDS_IDS, showFriends: showFriends, groups: cherryCtx && cherryCtx.groups, pub: pubKey && pub.key === pubKey ? pub.list : [] });

  // Cherry in-feed cards - contextual AI nudges
  const cherryCards = []; // Cherry nudges appear here once there is real activity to talk about

  if (activeComment) return (
    React.createElement(CommentView, { dream: activeComment, onBack: ()=>setActiveComment(null),
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
      , React.createElement('div', { className: "hdr",}
        , React.createElement('div', { style: {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"48px 16px 0"},}
          , React.createElement('h1', { className: "htit", tabIndex:-1,}, "Home")
          , lcAiOn() && React.createElement('button', {
              className: "cherry-feed-pill",
              onClick: () => cherryCtx && cherryCtx.openCherry(),
              'aria-label': "Open Cherry AI",
            },
            "Cherry",
            React.createElement('span', null, "Cherry")
          )
        )
        , React.createElement('p', { className: "lid-home-intro",}, "Welcome to Looscid, the decentralized, open source and accessible everything app. Your data stays yours. Dreams from you and the people you follow show up here.")
        , lh(FeedTabs, null)
        , lh(FeedControls, { tab: tab, cherryCtx: cherryCtx, dreams: rawDreams, pubState: pubKey && pub.key === pubKey ? pub.state : "idle" })
      )
      , visible.length===0 && lh('div', { className: "es" },
          lh('p', { className: "esl" }, tab==="following" && showFriends ? "No Dreams from friends yet" : "No Dreams yet"),
          lh('p', { style: {fontSize:14,color:"var(--tx2)",marginTop:6,lineHeight:1.6,maxWidth:260,textAlign:"center"} },
            (tab==="following" && showFriends) ? "Friends are Dreamors who follow each other." : tab==="following" ? "Follow people to fill this feed." : tab==="federated" && fedSub==="local" && !loc ? "Turn on Dreams from around you above to see Dreams near you." : tab==="federated" && !nets.length ? "Choose at least one network above." : /^pin:/.test(tab) ? "Dreams for this tab will show up here." : "New Dreams will show up here."),
          tab==="following" && cherryCtx && lh('button', { className: "cherry-ctx-btn", style: {margin:"10px auto 0",display:"flex"}, onClick: ()=>cherryCtx.openCherry("Who should I follow?") }, "Ask Cherry to find Dreamors"))
      , rmOn && lh('div', { className: "lc-rm", onKeyDown: function (e) { if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return; if (e.key === "ArrowRight") { e.preventDefault(); rmGo(rmI + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); rmGo(rmI - 1); } },
          onTouchStart: function (e) { const t = e.touches[0]; rmTouch.current = { x: t.clientX, y: t.clientY }; },
          onTouchEnd: function (e) { const s0 = rmTouch.current; rmTouch.current = null; if (!s0) return; const t = e.changedTouches[0], dx = t.clientX - s0.x; if (Math.abs(dx) > 60 && Math.abs(t.clientY - s0.y) < 40) rmGo(rmI + (dx < 0 ? 1 : -1)); } },
          lh('h2', { id: "rm-pos", className: "lc-sub-h", tabIndex: -1, style: { padding: "0 16px" } }, "Reading mode, Dream " + (rmI + 1) + " of " + visible.length),
          lh('div', { className: "lc-inrow", style: { padding: "0 16px" } },
            lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { rmGo(rmI - 1); }, "aria-label": "Previous Dream" }, "Previous"),
            lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { rmGo(rmI + 1); }, "aria-label": "Next Dream" }, "Next")))
      , lh('div', { id: "feed-list", role: "region", "aria-label": "Dreams", ref: listRef, onFocus: rememberFocus }, (rmOn ? [visible[rmI]] : visible).map((d,idx) => (
        React.createElement(React.Fragment, { key: d.id,}
          , React.createElement(DreamCard, { dream: d, onLike: tl, onRedream: tr, onUndoRedream: tur,
            onQuote: tq, onUndoQuote: tuq, onBookmark: tb,
            onComment: d=>setActiveComment(d), navigate: navigate, cherryCtx: cherryCtx,})
          /* Cherry AI cards injected between dreams on For You tab */
          , tab==="for you" && cherryCtx && cherryCards.find(cc=>cc.after===idx+1) && (()=>{
            const cc = cherryCards.find(c=>c.after===idx+1);
            return (
              React.createElement('div', { className: "cherry-card",}
                , React.createElement('div', { className: "aiorb", style: {width:32,height:32,fontSize:15,flexShrink:0},}, "Cherry")
                , React.createElement('div', { style: {flex:1},}
                  , React.createElement('span', { className: "cherry-card-chip",}, cc.ic, " " , cc.chip)
                  , React.createElement('div', { className: "cherry-card-txt",}, cc.msg)
                  , React.createElement('button', { className: "cherry-card-act", onClick: ()=>cherryCtx.openCherry(cc.prompt), 'aria-label': cc.action,}, cc.action)
                )
              )
            );
          })()
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
    if (me && new RegExp("(^|\\W)@" + me.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(txt)) { if (lcAudienceOk((Looscid.A11Y_NOW || {}).whoMention || "everyone", u, "perm_whoMention")) lcNotify("mention", "mentioned you", u, txt.slice(0, 140)); }
    else if (d.replyTo && mine && mine.has(d.replyTo)) { if (lcAudienceOk((Looscid.A11Y_NOW || {}).whoReply || "everyone", u, "perm_whoReply")) lcNotify("reply", "replied to your Dream", u, txt.slice(0, 140)); }
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
  // Swipe mode only: a clear vertical swipe on the tab strip changes feed (touch, no screen reader).
  const t0 = useRef(null);
  const onTS = function (e) { const t = e.touches[0]; t0.current = { x: t.clientX, y: t.clientY, at: Date.now() }; };
  const onTE = function (e) {
    const s0 = t0.current; t0.current = null; if (!s0) return; const t = e.changedTouches[0];
    const dy = t.clientY - s0.y, dx = t.clientX - s0.x;
    if (Math.abs(dy) >= 48 && Math.abs(dx) < 36 && Date.now() - s0.at < 700) go(idx + (dy < 0 ? 1 : -1), false);
  };
  if (mode === "menu") return lh(React.Fragment, null, lh(FeedMenuButton, { feed: feed }), feed === "following" ? lh(ShowFriendsBox, null) : null);
  // Tabs mode: the tablist is the one feed control. Swipe mode: the strip stays visible for sighted
  // people but leaves the accessibility tree; the adjustable "Feed switcher" is the one control.
  const strip = lh('div', tabsMode
      ? { className: "ftabs lc-feedtabs", role: "tablist", "aria-label": "Feeds", id: "feed-tablist", onKeyDown: onKey }
      : { className: "ftabs lc-feedtabs lc-feedtabs-swipe", id: "feed-tablist", "aria-hidden": "true", onTouchStart: onTS, onTouchEnd: onTE },
    LC_FEEDS.map(function (f, i) {
      const on = i === idx;
      return lh('button', tabsMode
          ? { key: f.id, id: tabId(f.id), type: "button", className: "ftab" + (on ? " on" : ""), role: "tab", "aria-selected": on, tabIndex: on ? 0 : -1, "aria-controls": "feed-list", onClick: function () { go(i, false); } }
          : { key: f.id, id: tabId(f.id), type: "button", className: "ftab" + (on ? " on" : ""), tabIndex: -1, onClick: function () { go(i, false); } },
        f.label); // build 149: no "1/7" position (iOS says "tab, 1 of 7" itself)
    }));
  return lh(React.Fragment, null,
    mode === "swipe" && lh('div', { className: "lc-feed-adj" },
      lh('label', { htmlFor: "feed-adjust" }, "Feed switcher"),
      lh('input', { id: "feed-adjust", type: "range", min: 0, max: LC_FEEDS.length - 1, step: 1, value: idx,
        "aria-valuetext": LC_FEEDS[idx].label,
        onChange: function (e) { go(+e.target.value, false); } })),
    strip,
    feed === "following" ? lh(ShowFriendsBox, null) : null);
}
// Pop-up button mode: one "Feed: Home" button opens the shared mini pop-up menu of every feed
// (menuitemradio). Picking a feed puts focus back on the button, whose name is the announcement.
function FeedMenuButton({ feed }) {
  return lh('div', { className: "lc-feedmenu" },
    lh(LcMenu, { id: "feed-menu-btn", menuId: "feed-menu", label: "Feeds", hideLabel: true, title: "Feeds", inline: true, prefix: "Feed: ", btnClass: "btn bgb lc-feedmenu-btn",
      value: feed, items: LC_FEEDS.map(function (f) { return { id: f.id, name: f.label }; }), onSelect: function (id) { lcSetFeed(id, true); } }));
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
   (Looscid, and public Looscid Dreams from your Nostr relays), as Popular, Latest or Local (Dreams from around you,
   opt-in). Pinned tabs: one Circle, person, hashtag or thread. Sort on For You and Following: Latest or Popular. */
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
    likes: 0, comments: 0, redreams: 0, quotes: 0, liked: false, redreamed: false, quoted: false, bookmarked: false, cw: r.cw, net: "nostr", g: r.g };
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
    const nets = Looscid.lcFedNets(), sub = Looscid.lcFedSub(), loc = Looscid.lcFedLocal();
    const have = new Set(raw.map(function (d) { return d.nid; }).filter(Boolean));
    let base = (nets.indexOf("looscid") >= 0 ? raw : []).concat(nets.indexOf("nostr") >= 0 ? (o.pub || []).filter(function (d) { return !have.has(d.nid); }) : []);
    if (sub === "local") base = loc ? base.filter(function (d) { return d.local || (d.g && String(d.g).indexOf(loc.g.slice(0, 4)) === 0); }) : [];
    list = lcSortDreams(base, sub === "popular" ? "popular" : "latest");
  } else if (/^pin:/.test(tab)) {
    const f = LC_FEEDS.find(function (x) { return x.id === tab; }), p = f && f.pin;
    list = !p ? [] : lcSortDreams(raw.filter(function (d) {
      if (p.kind === "circle") return d.circleId != null && String(d.circleId) === String(p.ref);
      if (p.kind === "person") return !!d.user && lcHandle(d.user.handle || "") === String(p.ref);
      if (p.kind === "tag") return lcTagsOf(d).indexOf(String(p.ref).toLowerCase()) >= 0;
      if (p.kind === "thread") return lcRootOf(d) === String(p.ref) || String(d.id) === String(p.ref);
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
    const ev = ["looscid:pins", "looscid:fedsub", "looscid:fednets", "looscid:feedsort", "looscid:fyfollow", "looscid:fedlocal"];
    ev.forEach(function (e) { window.addEventListener(e, f); });
    return function () { ev.forEach(function (e) { window.removeEventListener(e, f); }); };
  }, []);
}
// Looscid's own switch (the same one as in Settings): a button with role=switch that says On or Off.
function lcSwitch(id, label, on, onChange) { return lh(Looscid.A11ySwitch, { key: id, id: id, label: label, on: !!on, onToggle: function () { onChange(!on); } }); }
// The controls under the feed tabs, for the feed that's open.
function FeedControls({ tab, cherryCtx, dreams, pubState }) {
  useFeedTick();
  const sortPick = function (feed) {
    return lh('div', { key: "sort", className: "lc-feed-sort" }, lh(LcMenu, { id: "feed-sort-btn", menuId: "feed-sort", label: "Sort", hideLabel: true, title: "Sort", inline: true, prefix: "Sort: ", btnClass: "btn bgb lc-btn",
      value: Looscid.lcFeedSort(feed), items: [{ id: "latest", name: "Latest" }, { id: "popular", name: "Popular" }], onSelect: function (id) { Looscid.lcSetFeedSort(feed, id); } }));
  };
  if (tab === "for you") {
    const fy = Looscid.lcFyFollow();
    return lh('div', { className: "lc-feed-ctl" }, sortPick("for you"),
      lcSwitch("fy-show-following", "Show following", fy.on, function (v) { Looscid.lcSetFyFollow({ on: v }); }),
      fy.on ? lh('fieldset', { className: "lc-fy-src" }, lh('legend', null, "Following in For You"),
        LC_FY_SOURCES.map(function (s) { return lcSwitch("fy-src-" + s[0], s[1], fy[s[0]], function (v) { const pt = {}; pt[s[0]] = v; Looscid.lcSetFyFollow(pt); }); })) : null);
  }
  if (tab === "following") return lh('div', { className: "lc-feed-ctl" }, sortPick("following"), lh(PinForm, { cherryCtx: cherryCtx, dreams: dreams }));
  if (tab === "federated") return lh(FederatedControls, { pubState: pubState });
  const f = LC_FEEDS.find(function (x) { return x.id === tab; });
  if (f && f.pin) return lh('div', { className: "lc-feed-ctl" },
    lh('p', { className: "lc-muted" }, "A tab you pinned: " + (f.pin.kind === "tag" ? "the hashtag " : f.pin.kind === "circle" ? "the Circle " : f.pin.kind === "person" ? "Dreams from " : "") + (f.pin.kind === "thread" ? "a thread." : f.label + ".")),
    lh('button', { type: "button", id: "feed-unpin", className: "btn bgb lc-btn", onClick: function () { Looscid.lcPinRemove(tab); setTimeout(function () { const b = document.getElementById("feed-tab-following"); if (b) b.focus(); }, 0); } }, "Unpin this tab"));
  return null;
}
function FederatedControls({ pubState }) {
  const sub = Looscid.lcFedSub(), nets = Looscid.lcFedNets(), loc = Looscid.lcFedLocal();
  const [asking, setAsking] = useState(false);
  const idx = Math.max(0, LC_FED_SUBS.findIndex(function (s) { return s.id === sub; }));
  const go = function (i) { const s = LC_FED_SUBS[(i + LC_FED_SUBS.length) % LC_FED_SUBS.length]; Looscid.lcSetFedSub(s.id); setTimeout(function () { const b = document.getElementById("fed-tab-" + s.id); if (b) b.focus(); }, 0); };
  const onKey = function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); } else if (e.key === "End") { e.preventDefault(); go(LC_FED_SUBS.length - 1); }
  };
  const turnOn = function () {
    if (!navigator.geolocation) { announce("This browser can't share a location, so Dreams from around you stays off."); return; }
    setAsking(true);
    navigator.geolocation.getCurrentPosition(function (p) { setAsking(false); Looscid.lcSetFedLocal({ on: true, g: Looscid.lcGeohash(p.coords.latitude, p.coords.longitude, 5) }); announce("Dreams from around you is on."); },
      function () { setAsking(false); announce("Location wasn't shared, so Dreams from around you stays off."); }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
  };
  return lh('div', { className: "lc-feed-ctl lc-fed" },
    lh('div', { className: "ftabs lc-fedtabs", role: "tablist", "aria-label": "Federated", onKeyDown: onKey },
      LC_FED_SUBS.map(function (s, i) { const on = i === idx;
        return lh('button', { key: s.id, id: "fed-tab-" + s.id, type: "button", role: "tab", className: "ftab" + (on ? " on" : ""), "aria-selected": on, tabIndex: on ? 0 : -1, "aria-controls": "feed-list", onClick: function () { Looscid.lcSetFedSub(s.id); } }, s.label); })),
    sub === "local" ? lh('div', { className: "lc-fed-local" },
      lh('p', null, "Dreams from around you shows Dreams tagged with a place near you. It stays off until you turn it on. Looscid asks your device for your location once, keeps only a rough area of about 5 km on this device, and uses it only to ask relays for Dreams tagged with that area. Your own Dreams never carry your location."),
      loc ? lh('button', { type: "button", id: "fed-local-off", className: "btn bgb lc-btn", onClick: function () { Looscid.lcSetFedLocal(null); announce("Dreams from around you is off. Your area was removed from this device."); } }, "Turn off Dreams from around you")
          : lh('button', { type: "button", id: "fed-local-on", className: "btn bgb lc-btn", disabled: asking, onClick: turnOn }, asking ? "Asking for your location\u2026" : "Turn on Dreams from around you")) : null,
    lh('fieldset', { className: "lc-fed-nets" }, lh('legend', null, "Networks"),
      LC_FED_NETS.map(function (n) {
        return lh('div', { key: n.id, className: "lc-chk-row" },
          lh('input', { type: "checkbox", id: "fed-net-" + n.id, checked: !n.soon && nets.indexOf(n.id) >= 0, disabled: !!n.soon, onChange: function (e) { Looscid.lcSetFedNet(n.id, e.target.checked); } }),
          lh('label', { htmlFor: "fed-net-" + n.id }, n.label + (n.soon ? ", coming soon" : "")));
      })),
    pubState === "loading" ? lh('p', { className: "lc-muted" }, "Getting Dreams from your Nostr relays\u2026") :
    pubState === "error" ? lh('p', { className: "lc-muted" }, "Couldn't reach your Nostr relays just now. Showing what Looscid has.") : null);
}
// Following: pin a Circle, a person, a hashtag or a thread as its own feed tab.
function PinForm({ cherryCtx, dreams }) {
  const [kind, setKind] = useState("circle"), [val, setVal] = useState(""), [tag, setTag] = useState("");
  const groups = ((cherryCtx && cherryCtx.groups) || []).filter(function (g) { return g.joined; });
  const fol = (cherryCtx && cherryCtx.following) || new Set();
  const people = USERS.filter(function (u) { return fol.has(u.id); });
  const threads = (dreams || []).filter(function (d) { return !d.replyTo && (d.comments || 0) > 0; }).slice(0, 30);
  const opts = kind === "circle" ? groups.map(function (g) { return { id: String(g.id), name: g.name }; })
    : kind === "person" ? people.map(function (u) { return { id: lcHandle(u.handle), name: u.name }; })
    : kind === "thread" ? threads.map(function (d) { return { id: String(d.id), name: (d.user ? d.user.name + ": " : "") + String(d.text || "").replace(/\s+/g, " ").slice(0, 40).trim() }; }) : [];
  const cur = opts.find(function (o) { return o.id === val; }) || opts[0];
  const pin = function () {
    if (kind === "tag") { const t = "#" + tag.trim().replace(/^#+/, "").replace(/\s+/g, ""); if (t.length < 2) { announce("Type a hashtag first."); return; } Looscid.lcPinAdd("tag", t.toLowerCase(), t); setTag(""); return; }
    if (!cur) return;
    Looscid.lcPinAdd(kind, cur.id, kind === "thread" ? "Thread: " + cur.name.slice(0, 30) : cur.name);
  };
  const none = kind === "circle" ? "Join a Circle first, then you can pin it." : kind === "person" ? "Follow someone first, then you can pin them." : "No threads with Replies yet.";
  return lh('fieldset', { className: "lc-pinform" }, lh('legend', null, "Pin a tab"),
    lh(LcMenu, { id: "pin-kind-btn", menuId: "pin-kind", label: "What to pin", hideLabel: true, title: "What to pin", inline: true, prefix: "Pin: ", btnClass: "btn bgb lc-btn",
      value: kind, items: [{ id: "circle", name: "A Circle" }, { id: "person", name: "A person" }, { id: "tag", name: "A hashtag" }, { id: "thread", name: "A thread" }], onSelect: function (id) { setKind(id); setVal(""); } }),
    kind === "tag" ? lh('div', { className: "lc-inrow" }, lh('label', { htmlFor: "pin-tag" }, "Hashtag"),
        lh('input', { id: "pin-tag", className: "inp", type: "text", autoComplete: "off", value: tag, onChange: function (e) { setTag(e.target.value); }, onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); pin(); } } }))
      : opts.length ? lh(LcMenu, { id: "pin-val-btn", menuId: "pin-val", label: "Which one", hideLabel: true, title: kind === "circle" ? "Circles" : kind === "person" ? "People" : "Threads", inline: true, btnClass: "btn bgb lc-btn",
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
