/* Looscid feed.js: the Feed tab.
   Plain script (not a module). Everything it shares goes on window.Looscid; see FILES.md for the load order. */
(function (Looscid) {
const { CommentView, DREAMS_INIT, DreamCard, LC_FEEDS, LcMenu, ME, SHOW_FRIENDS_KEY, USERS, announce, lcAiOn, lcAudienceOk, lcDreamWords, lcFeedMode, lcFiltered, lcHandle, lcNotify, lcQuietNow, lcSetFeed, lcSetShowFriends, lcStepFeed, lh, useDreams, useEffect, useRef, useState } = Looscid;
Object.assign(Looscid, { FeedPage, lcNotifyDreams, lcShowFriends, useFeedMode, FeedTabs, FeedMenuButton, ShowFriendsBox, useFeedState });

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
  // Feeds (one tablist): Home, For You, Following (with Show friends), Local, Circles, Popular, Latest
  const ageMin = t => { const m = /^(\d+)\s*([smhdw])/.exec(t||""); if (!m) return 1e9; return (+m[1]) * ({s:1/60,m:1,h:60,d:1440,w:10080}[m[2]]); };
  const dreams = tab==="popular" ? rawDreams.slice().sort((x,y)=>(y.likes||0)-(x.likes||0))
    : tab==="latest" ? rawDreams.slice().sort((x,y)=>ageMin(x.time)-ageMin(y.time))
    : rawDreams;

  // Cherry in-feed cards - contextual AI nudges
  const cherryCards = []; // Cherry nudges appear here once there is real activity to talk about

  if (activeComment) return (
    React.createElement(CommentView, { dream: activeComment, onBack: ()=>setActiveComment(null),
      onLike: tl, onRedream: tr, onUndoRedream: tur,
      onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onCommentPosted: tc, navigate: navigate,})
  );

  // Friends = mutuals: people you follow who follow you back.
  const visible = (tab==="following" ? dreams.filter(d=>FOLLOWING.has(d.user.id)).filter(d=>!showFriends || FRIENDS_IDS.has(d.user.id))
    : tab==="local"     ? dreams.filter(d=>d.local)
    : tab==="circles"   ? dreams.filter(d=>d.circleId!=null)
    : dreams).filter(d => !(lcFiltered(d) || {}).hide);
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
      )
      , visible.length===0 && lh('div', { className: "es" },
          lh('p', { className: "esl" }, tab==="following" && showFriends ? "No Dreams from friends yet" : "No Dreams yet"),
          lh('p', { style: {fontSize:14,color:"var(--tx2)",marginTop:6,lineHeight:1.6,maxWidth:260,textAlign:"center"} },
            (tab==="following" && showFriends) ? "Friends are Dreamors who follow each other." : tab==="following" ? "Follow people to fill this feed." : "New Dreams will show up here."),
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
const LC_FOCUSMEM_KEY = "dbm_focus_memory";
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
        f.label, lh('span', { className: "ftab-num", "aria-hidden": "true" }, (i + 1) + "/" + LC_FEEDS.length));
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
