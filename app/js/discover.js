/* Looscid discover.js: the Discover tab, in plain JavaScript (no framework).
   Plain script (not a module). Everything it shares goes on window.Looscid; see docs/dev/FILES.md for the load order.
   The screen is built with Looscid.lcEl and redrawn in place with Looscid.lcPatch, so the search field keeps focus while you type. */
(function (Looscid) {
const { DREAMS_INIT, GROUPS, TRENDING, USERS, fmt, lcEl: h, lcPatch, lcPlainScreen, lcAvEl, lcIconEl, lcDreamTextEl } = Looscid;

const FILTER_OPTS = [
  { id: "dreams",   label: "Dreams",    icon: "Dreams",    group: "content" },
  { id: "replies",  label: "Replies",   icon: "Replies",   group: "content" },
  { id: "redreams", label: "Redreams",  icon: "Redreams",  group: "content" },
  { id: "media",    label: "Has Media", icon: "Has Media", group: "content" },
  { id: "verified", label: "Verified",  icon: "\u2713",    group: "dreamers" },
  { id: "today",    label: "Today",     icon: "Today",     group: "time", radio: "time" },
  { id: "week",     label: "This Week", icon: "This Week", group: "time", radio: "time" },
  { id: "alltime",  label: "All Time",  icon: "All Time",  group: "time", radio: "time" },
];
const tabLabel = function (t) { return ({ all: "All", dreamers: "Dreamors", dreams: "Dreams", circles: "Circles", trending: "Trending" })[t] || t; };

// Build 152 fix: switching All, Dreamors, Dreams or Circles during a search says the tab's count once through #looscid-live
// ("Dreamors, 0 results"). A count still waiting from typing is dropped, so it isn't said twice.
function lcTabCount(st) {
  if (!String(st.q || "").trim()) return;
  clearTimeout(Looscid.LC_COUNT_T);
  const n = st.count || 0;
  Looscid.announce(tabLabel(st.tab) + ", " + n + (n === 1 ? " result" : " results"));
}
/* st: { q, tab, filters, filtersOpen }; p: the frame's props (navigate, cherryCtx). */
function discoverView(st, p, draw) {
  const navigate = p.navigate, cherryCtx = p.cherryCtx, q = st.q, tab = st.tab, filters = st.filters, filtersOpen = st.filtersOpen;
  const activeTabs = q ? ["all", "dreamers", "dreams", "circles"] : ["trending", "dreamers", "circles"];
  const toggleFilter = function (id, radioGroup) {
    if (radioGroup) {
      const sameGroup = FILTER_OPTS.filter(function (f) { return f.radio === radioGroup; }).map(function (f) { return f.id; });
      const alreadyOn = filters.includes(id);
      st.filters = filters.filter(function (f) { return !sameGroup.includes(f); }).concat(alreadyOn ? [] : [id]);
    } else {
      st.filters = filters.includes(id) ? filters.filter(function (f) { return f !== id; }) : filters.concat([id]);
    }
    draw(); Looscid.lcAnnounceCount(st.q, st.count, "result", "results");
  };
  const activeLabels = filters.map(function (id) { return (FILTER_OPTS.find(function (f) { return f.id === id; }) || {}).label; }).filter(Boolean);
  const filterBtnText = filters.length === 0 ? "Filters" : "Filters \u00b7 " + activeLabels.join(", ");
  const ql = q.toLowerCase();
  const dreamResults = DREAMS_INIT.filter(function (d) { return !q || d.text.toLowerCase().includes(ql); });
  const dreamerResults = USERS.filter(function (u) { return !q || u.name.toLowerCase().includes(ql) || u.handle.includes(q); })
    .filter(function (u) { return !filters.includes("verified") || u.verified; });
  const circleResults = GROUPS.filter(function (g) { return !q || g.name.toLowerCase().includes(ql); });
  const filterGroups = [
    { label: "Content",  opts: FILTER_OPTS.filter(function (f) { return f.group === "content"; }) },
    { label: "Dreamors", opts: FILTER_OPTS.filter(function (f) { return f.group === "dreamers"; }) },
    { label: "Time",     opts: FILTER_OPTS.filter(function (f) { return f.group === "time"; }) },
  ];
  // Build 148: the search you're on, for Like Search (here and in the Commandbar).
  Looscid.LC_DISCOVER_Q = q; Looscid.LC_DISCOVER_FILTERS = activeLabels;
  const sKey = Looscid.lcSearchKey ? Looscid.lcSearchKey(q, activeLabels) : null;
  const sLiked = !!(q.trim() && sKey && Looscid.lcLikedHas("search", sKey));
  const likeSearch = function () {
    const qq = q.trim(); if (!qq) return;
    if (sLiked) { Looscid.lcLikedSet("search", sKey, false); Looscid.announce("Unliked Search \u201c" + qq + "\u201d. Its Alerts are off."); }
    else { Looscid.lcLikeSearch(qq, activeLabels, Looscid.LC_APP_DREAMS || DREAMS_INIT); Looscid.announce("Liked Search \u201c" + qq + "\u201d. It's in Liked, Searches, where you can turn on its Alerts."); }
    draw();
  };
  const noneAtAll = q && dreamResults.length === 0 && dreamerResults.length === 0 && circleResults.length === 0;
  st.count = (tab === "dreamers" || tab === "all" ? dreamerResults.length : 0) + (tab === "dreams" || tab === "all" ? dreamResults.length : 0) + (tab === "circles" || tab === "all" ? circleResults.length : 0);
  // Build 152 fix: "No results" goes by the tab you're on, so an empty Dreamors, Dreams or Circles tab says so too.
  const noResults = q && tab !== "trending" && st.count === 0;

  return h('div', { className: "pg" },
    h('div', { className: "hdr" },
      h('div', { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "48px 16px 0" } },
        h('h1', { className: "htit", tabIndex: -1 }, "Discover")),
      h('div', { style: { padding: "10px 16px 6px" } },
        h('input', { className: "inp", style: { fontSize: 14 }, placeholder: "Search Dreamors, Dreams, Circles, topics", value: q,
          onChange: function (e) { st.q = e.target.value; if (e.target.value && st.tab === "trending") st.tab = "all"; draw(); Looscid.lcAnnounceCount(st.q, st.count, "result", "results"); },
          "aria-label": "Search", role: "searchbox" })),
      q && h('div', { style: { padding: "0 16px 8px", display: "flex", gap: 8, alignItems: "center" } },
        h('button', { className: "sort-btn",
            style: { flexShrink: 0, background: filters.length ? "rgba(109,40,217,.15)" : "var(--sf2)", borderColor: filters.length ? "var(--ac)" : "var(--bd2)", color: filters.length ? "var(--ac3)" : "var(--tx2)" },
            onClick: function () { st.filtersOpen = !st.filtersOpen; draw(); }, "aria-expanded": filtersOpen, "aria-label": filterBtnText },
          h('span', { style: { fontSize: 12 } }, "Filters"),
          h('span', null, filterBtnText),
          h('span', { style: { fontSize: 9, opacity: .6, marginLeft: 2 } }, filtersOpen ? "\u25b2" : "\u25bc")),
        filters.length > 0 && h('button', { style: { background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--tx3)", padding: "4px 6px", fontFamily: "inherit" },
          onClick: function () { st.filters = []; draw(); }, "aria-label": "Clear all filters" }, "Clear"),
        q.trim() && Looscid.lcLikeSearch ? h('button', { type: "button", id: "discover-like-search", className: "btn bgb lc-btn", style: { marginLeft: "auto", fontSize: 12 }, onClick: likeSearch }, sLiked ? "Unlike Search" : "Like Search") : null),
      q && filtersOpen && h('div', { style: { margin: "0 16px 10px", background: "var(--sf2)", border: "1px solid var(--bd2)", borderRadius: 12, padding: "12px 14px" }, role: "group", "aria-label": "Search filters" },
        filterGroups.map(function (group) {
          return h('div', { key: group.label, style: { marginBottom: 10 } },
            h('div', { style: { fontSize: 10, fontWeight: 800, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 7 } }, group.label),
            h('div', { style: { display: "flex", gap: 7, flexWrap: "wrap" } },
              group.opts.map(function (opt) {
                const on = filters.includes(opt.id), isRadio = !!opt.radio;
                return h('button', { key: opt.id, role: isRadio ? "radio" : "checkbox", "aria-checked": on, "aria-label": opt.label + (on ? " selected" : ""),
                    onClick: function () { toggleFilter(opt.id, opt.radio || null); },
                    style: { display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 100, border: "1.5px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      background: on ? "rgba(109,40,217,.15)" : "transparent", borderColor: on ? "var(--ac)" : "var(--bd2)", color: on ? "var(--ac3)" : "var(--tx2)" } },
                  h('span', { "aria-hidden": "true", style: { width: 13, height: 13, borderRadius: isRadio ? "50%" : 3, border: "1.5px solid", borderColor: on ? "var(--ac)" : "var(--tx3)",
                      background: on ? "var(--ac)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } },
                    on && h('span', { style: { width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "block" } })),
                  opt.icon, " ", opt.label);
              })));
        })),
      h('div', { className: "ftabs", role: "tablist", "aria-label": "Discover sections", style: { overflowX: "auto", scrollbarWidth: "none" } },
        activeTabs.map(function (t, i) {
          return h('button', { key: t, className: "ftab" + (tab === t ? " on" : ""), onClick: function () { st.tab = t; draw(); lcTabCount(st); }, role: "tab", "aria-label": tabLabel(t), "aria-selected": tab === t, tabIndex: tab === t ? 0 : -1 },
            tabLabel(t)); // build 149: no "1/4" position (iOS says "tab, 1 of 4" itself)
        }))),

    // Build 152 fix: no second live region here; the result count is said once through #looscid-live (lcAnnounceCount).
    h('div', null,
      // Part 36 (2three1y, Oct 12 4:50 PM): no Ask Cherry on Discover. Discover is search and browsing only.
      // Round 5 fixes: an empty Trending says so instead of showing nothing.
      (tab === "trending" || (tab === "all" && !q)) && !TRENDING.length && h('div', { className: "es" }, h('div', { className: "esl" }, "Nothing is trending yet"),
        h('p', { style: { fontSize: 12, color: "var(--tx3)", marginTop: 6, lineHeight: 1.6 } }, "Search above to find Dreamors, Dreams and Circles.")),
      (tab === "trending" || (tab === "all" && !q)) && TRENDING.map(function (t) {
        return h('div', { key: t.tag, className: "trtg", role: "button", tabIndex: 0, onClick: function () { st.q = "#" + t.tag; st.tab = "dreams"; draw(); }, "aria-label": Looscid.lcNameJoin("#" + t.tag, t.cat, t.count) },
          h('div', null,
            h('div', { style: { fontSize: 11, color: "var(--tx3)" } }, t.cat, " \u00b7 Trending"),
            h('div', { style: { fontSize: 14, fontWeight: 700, margin: "2px 0" } }, "#", t.tag),
            h('div', { style: { fontSize: 11, color: "var(--tx3)" } }, t.count)),
          h('div', { style: { display: "flex", alignItems: "center", gap: 8 } },
            lcIconEl("Chv", { style: { width: 14, height: 14, color: "var(--tx3)" } })));
      }),

      // Round 5 fixes (QA "as 2three1y"): a Dreamor result was a button with the Follow button inside it, which iOS may not
      // reach. Now the result (opens the profile) and Follow are siblings, and Follow really follows (pressed state, said once).
      (tab === "dreamers" || tab === "all") && dreamerResults.map(function (u) {
        const fol = !!(cherryCtx && cherryCtx.following && cherryCtx.following.has(u.id));
        return h('div', { key: u.id, className: "ci" },
          h('button', { type: "button", className: "lc-disc-open", style: { display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, background: "none", border: "none", padding: 0, color: "inherit", font: "inherit", textAlign: "left", cursor: "pointer" },
              onClick: function () { const keep = { q: st.q, tab: st.tab, filters: st.filters.slice() }; Looscid.LC_DP_BACK = { user: u, back: function () { Looscid.LC_DISCOVER_NEXT_ST = keep; navigate("discover"); } }; navigate("dp", u); }, "aria-label": u.name + (u.verified ? ", verified" : "") + ", " + u.handle + ", " + fmt(u.followers) + " Dreamors following" },
            lcAvEl(u, 44),
            h('div', { className: "cif", "aria-hidden": "true" },
              h('div', { className: "cnm" }, u.name, u.verified && h('span', { style: { color: "var(--ac2)", fontSize: 11 } }, " \u2713")),
              h('div', { className: "cpv" }, u.handle, " \u00b7 ", fmt(u.followers), " Dreamors following"))),
          cherryCtx && cherryCtx.followUser
            ? h('button', { type: "button", className: "btn " + (fol ? "bgb" : "bp"), style: { padding: "7px 14px", fontSize: 12 }, "aria-pressed": fol ? "true" : "false", "aria-label": "Follow " + u.name,
                onClick: function () { cherryCtx.followUser(u.id); Looscid.announce((fol ? "Unfollowed " : "Following ") + u.name, "state"); } }, fol ? "Following" : "Follow")
            : h('button', { type: "button", className: "btn bp", style: { padding: "7px 14px", fontSize: 12 }, "aria-disabled": "true", "aria-label": "Follow " + u.name,
                onClick: function () { Looscid.announce("Not available yet: open " + u.name + "'s profile to follow."); } }, "Follow"));
      }),

      // Round 5 fixes: a Dream result is one button with one name that opens the Dream (it was four separate pieces with an
      // aria-label on a plain div, and couldn't be opened). Back from the Dream returns here.
      (tab === "dreams" || tab === "all") && dreamResults.map(function (d) {
        return h('button', { type: "button", key: d.id, className: "lc-disc-dream", style: { display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", borderBottom: "1px solid var(--bd)", padding: "11px 14px" },
            "aria-label": Looscid.lcNameJoin("Dream by " + d.user.name, Looscid.lcCutWords(String(d.text || ""), 80)) + ", " + fmt(d.likes) + (d.likes === 1 ? " like" : " likes"),
            onClick: function () { const keep = { q: st.q, tab: st.tab, filters: st.filters.slice() }; Looscid.LC_FEED_OPEN = { dream: d, back: function () { Looscid.LC_DISCOVER_NEXT_ST = keep; navigate("discover"); } }; navigate("feed"); } },
          h('span', { "aria-hidden": "true", style: { display: "block" } },
          h('span', { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 4 } },
            lcAvEl(d.user, 28),
            h('span', { style: { fontWeight: 700, fontSize: 13 } }, d.user.name),
            d.user.verified && h('span', { style: { color: "var(--ac2)", fontSize: 11 } }, "\u2713"),
            h('span', { style: { fontSize: 11, color: "var(--tx3)" } }, d.user.handle)),
          h('span', { style: { display: "block", fontSize: 13, color: "var(--tx2)", lineHeight: 1.6, margin: "0 0 5px" } },
            lcDreamTextEl(d.text.length > 140 ? d.text.slice(0, 140) + "\u2026" : d.text)),
          h('span', { style: { display: "flex", gap: 12, fontSize: 11, color: "var(--tx3)" } },
            h('span', null, "Likes: ", fmt(d.likes)),
            h('span', null, "Redreams: ", fmt(d.redreams)),
            h('span', null, "Replies: ", fmt(d.comments)))));
      }),

      (tab === "circles" || tab === "all") && circleResults.map(function (g) {
        return h('div', { key: g.id, className: "ci", "aria-label": g.name + " Circle, " + fmt(g.members) + " Dreamors" },
          h('div', { style: { width: 44, height: 44, borderRadius: 11, background: "var(--sf2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 } }, g.emoji),
          h('div', { className: "cif" },
            h('div', { className: "cnm" }, g.name),
            h('div', { className: "cpv" }, fmt(g.members), " Dreamors in this Circle")),
          // Round 5 fixes: Join did nothing and said nothing. Circles from Discover come in build 152, so it says so.
          h('button', { type: "button", className: "btn bgb", style: { fontSize: 12 }, "aria-label": "Join the " + g.name + " Circle", "aria-disabled": "true",
            onClick: function () { Looscid.announce("Not available yet: joining a Circle from Discover comes in a later build. Open Circles in More to join it."); } }, "Join"),
          Looscid.lcLikeBtnEl ? Looscid.lcLikeBtnEl("circle", g.id, g.name + " Circle", { name: g.name, emoji: g.emoji }, draw, { style: { fontSize: 12, marginLeft: 6 } }) : null);
      }),

      noResults && h('div', { className: "es" },
        h('div', { className: "esl" }, "No results"),
        h('p', { style: { fontSize: 12, color: "var(--tx3)", marginTop: 6, lineHeight: 1.6 } }, noneAtAll ? "No results for \u201c" : "No " + tabLabel(tab) + " for \u201c", q, noneAtAll ? "\u201d. Try different words." : "\u201d. Other tabs have results."))));
}

/* The Discover tab: search, filters, and Trending / Dreamors / Dreams / Circles. */
const DiscoverPage = lcPlainScreen("DiscoverPage", function (host, props) {
  // Build 149: a hashtag in a bio opens Discover searching for it (Looscid.LC_DISCOVER_NEXT_Q, read once).
  const nq = typeof Looscid.LC_DISCOVER_NEXT_Q === "string" ? Looscid.LC_DISCOVER_NEXT_Q : ""; Looscid.LC_DISCOVER_NEXT_Q = null;
  const st = { q: nq, tab: nq ? "all" : "trending", filters: [], filtersOpen: false };
  // Round 6 fixes: Back from a profile or Dream opened from the results brings back the same search, tab and filters.
  const keep = Looscid.LC_DISCOVER_NEXT_ST; Looscid.LC_DISCOVER_NEXT_ST = null;
  if (keep && typeof keep.q === "string") { st.q = keep.q; st.tab = keep.tab || (keep.q ? "all" : "trending"); st.filters = Array.isArray(keep.filters) ? keep.filters : []; }
  let p = props;
  const draw = function () { lcPatch(host, discoverView(st, p, draw)); };
  draw();
  return { update: function (np) { p = np; draw(); } };
});
Looscid.DiscoverPage = DiscoverPage;
})(window.Looscid = window.Looscid || {});
