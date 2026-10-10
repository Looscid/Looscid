/* Looscid discover.js: the Discover tab, in plain JavaScript (no framework).
   Plain script (not a module). Everything it shares goes on window.Looscid; see FILES.md for the load order.
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
    draw();
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
  const noResults = q && dreamResults.length === 0 && dreamerResults.length === 0 && circleResults.length === 0;

  return h('div', { className: "pg" },
    h('div', { className: "hdr" },
      h('div', { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "48px 16px 0" } },
        h('h1', { className: "htit", tabIndex: -1 }, "Discover"),
        cherryCtx && h('button', { className: "cherry-ctx-btn", onClick: function () { cherryCtx.openCherry("What is trending right now?"); }, "aria-label": "Ask Cherry what is trending right now" }, "Trending")),
      h('div', { style: { padding: "10px 16px 6px" } },
        h('input', { className: "inp", style: { fontSize: 14 }, placeholder: "Search Dreamors, Dreams, Circles, topics", value: q,
          onChange: function (e) { st.q = e.target.value; if (e.target.value && st.tab === "trending") st.tab = "all"; draw(); },
          "aria-label": "Search", role: "searchbox" })),
      q && h('div', { style: { padding: "0 16px 8px", display: "flex", gap: 8, alignItems: "center" } },
        h('button', { className: "sort-btn",
            style: { flexShrink: 0, background: filters.length ? "rgba(109,40,217,.15)" : "var(--sf2)", borderColor: filters.length ? "var(--ac)" : "var(--bd2)", color: filters.length ? "var(--ac3)" : "var(--tx2)" },
            onClick: function () { st.filtersOpen = !st.filtersOpen; draw(); }, "aria-expanded": filtersOpen, "aria-label": filterBtnText },
          h('span', { style: { fontSize: 12 } }, "Filters"),
          h('span', null, filterBtnText),
          h('span', { style: { fontSize: 9, opacity: .6, marginLeft: 2 } }, filtersOpen ? "\u25b2" : "\u25bc")),
        filters.length > 0 && h('button', { style: { background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--tx3)", padding: "4px 6px", fontFamily: "inherit" },
          onClick: function () { st.filters = []; draw(); }, "aria-label": "Clear all filters" }, "Clear")),
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
          return h('button', { key: t, className: "ftab" + (tab === t ? " on" : ""), onClick: function () { st.tab = t; draw(); }, role: "tab", "aria-label": tabLabel(t), "aria-selected": tab === t, tabIndex: tab === t ? 0 : -1 },
            tabLabel(t),
            h('span', { className: "ftab-num", "aria-hidden": "true" }, (i + 1) + "/" + activeTabs.length));
        }))),

    h('div', { "aria-live": "polite", "aria-label": "Search results" },
      q && cherryCtx && h('div', { style: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid rgba(168,85,247,.2)", background: "rgba(109,40,217,.06)", cursor: "pointer" },
          onClick: function () { cherryCtx.openCherry(q); }, role: "button", tabIndex: 0, "aria-label": "Ask Cherry: " + q,
          onKeyDown: function (e) { if (e.key === "Enter") cherryCtx.openCherry(q); } },
        h('div', { className: "aiorb", style: { width: 36, height: 36, fontSize: 17, flexShrink: 0 } }, "Cherry"),
        h('div', { style: { flex: 1 } },
          h('div', { style: { fontWeight: 700, fontSize: 13, color: "var(--tx)" } }, "Ask Cherry: \u201c", q, "\u201d"),
          h('div', { style: { fontSize: 11, color: "var(--tx3)", marginTop: 1 } }, "Get an AI answer, not just search results")),
        lcIconEl("Chv", { style: { width: 14, height: 14, color: "var(--ac3)" } })),

      (tab === "trending" || (tab === "all" && !q)) && TRENDING.map(function (t) {
        return h('div', { key: t.tag, className: "trtg", role: "button", tabIndex: 0, onClick: function () { st.q = "#" + t.tag; st.tab = "dreams"; draw(); }, "aria-label": "#" + t.tag + ", " + t.cat + ", " + t.count },
          h('div', null,
            h('div', { style: { fontSize: 11, color: "var(--tx3)" } }, t.cat, " \u00b7 Trending"),
            h('div', { style: { fontSize: 14, fontWeight: 700, margin: "2px 0" } }, "#", t.tag),
            h('div', { style: { fontSize: 11, color: "var(--tx3)" } }, t.count)),
          h('div', { style: { display: "flex", alignItems: "center", gap: 8 } },
            cherryCtx && h('button', { className: "cherry-ctx-btn", onClick: function (e) { e.stopPropagation(); cherryCtx.openCherry("Draft a Dream about #" + t.tag + " that would perform well"); }, "aria-label": "Ask Cherry to draft a Dream about #" + t.tag }, "Draft"),
            lcIconEl("Chv", { style: { width: 14, height: 14, color: "var(--tx3)" } })));
      }),

      (tab === "dreamers" || tab === "all") && dreamerResults.map(function (u) {
        return h('div', { key: u.id, className: "ci", onClick: function () { navigate("dp", u); }, role: "button", tabIndex: 0,
            "aria-label": u.name + (u.verified ? " verified" : "") + " · " + u.handle + " · " + fmt(u.followers) + " Dreamors following" },
          lcAvEl(u, 44),
          h('div', { className: "cif" },
            h('div', { className: "cnm" }, u.name, u.verified && h('span', { style: { color: "var(--ac2)", fontSize: 11 } }, " \u2713")),
            h('div', { className: "cpv" }, u.handle, " \u00b7 ", fmt(u.followers), " Dreamors following")),
          h('button', { className: "btn bp", style: { padding: "7px 14px", fontSize: 12 }, onClick: function (e) { e.stopPropagation(); }, "aria-label": "Follow " + u.name }, "Follow"));
      }),

      (tab === "dreams" || tab === "all") && dreamResults.map(function (d) {
        return h('div', { key: d.id, style: { borderBottom: "1px solid var(--bd)", padding: "11px 14px" }, "aria-label": "Dream by " + d.user.name + ", " + d.text.replace(/\n/g, " ").slice(0, 80) },
          h('div', { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 4 } },
            lcAvEl(d.user, 28),
            h('span', { style: { fontWeight: 700, fontSize: 13 } }, d.user.name),
            d.user.verified && h('span', { style: { color: "var(--ac2)", fontSize: 11 } }, "\u2713"),
            h('span', { style: { fontSize: 11, color: "var(--tx3)" } }, d.user.handle)),
          h('p', { style: { fontSize: 13, color: "var(--tx2)", lineHeight: 1.6, margin: "0 0 5px" } },
            lcDreamTextEl(d.text.length > 140 ? d.text.slice(0, 140) + "\u2026" : d.text)),
          h('div', { style: { display: "flex", gap: 12, fontSize: 11, color: "var(--tx3)" } },
            h('span', null, "Likes: ", fmt(d.likes)),
            h('span', null, "Redreams: ", fmt(d.redreams)),
            h('span', null, "Replies: ", fmt(d.comments))));
      }),

      (tab === "circles" || tab === "all") && circleResults.map(function (g) {
        return h('div', { key: g.id, className: "ci", "aria-label": g.name + " Circle, " + fmt(g.members) + " Dreamors" },
          h('div', { style: { width: 44, height: 44, borderRadius: 11, background: "var(--sf2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 } }, g.emoji),
          h('div', { className: "cif" },
            h('div', { className: "cnm" }, g.name),
            h('div', { className: "cpv" }, fmt(g.members), " Dreamors in this Circle")),
          h('button', { className: "btn bgb", style: { fontSize: 12 }, "aria-label": "Join the " + g.name + " Circle" }, "Join"));
      }),

      noResults && h('div', { className: "es" },
        h('div', { className: "esi" }, "No results"),
        h('div', { className: "esl" }, "Nothing found"),
        h('p', { style: { fontSize: 12, color: "var(--tx3)", marginTop: 6, lineHeight: 1.6 } }, "No results for \u201c", q, "\u201d. Try different words, or ask Cherry."),
        cherryCtx && h('button', { className: "cherry-ctx-btn", style: { margin: "10px auto 0", display: "flex" }, onClick: function () { cherryCtx.openCherry("Help me find: " + q); }, "aria-label": "Ask Cherry to help find " + q }, "Ask Cherry to find this"))));
}

/* The Discover tab: search, filters, and Trending / Dreamors / Dreams / Circles. */
const DiscoverPage = lcPlainScreen("DiscoverPage", function (host, props) {
  const st = { q: "", tab: "trending", filters: [], filtersOpen: false };
  let p = props;
  const draw = function () { lcPatch(host, discoverView(st, p, draw)); };
  draw();
  return { update: function (np) { p = np; draw(); } };
});
Looscid.DiscoverPage = DiscoverPage;
})(window.Looscid = window.Looscid || {});
