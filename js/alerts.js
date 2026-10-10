/* Looscid alerts.js: the Alerts tab and messages, in plain JavaScript (no framework).
   Plain script (not a module). Everything it shares goes on window.Looscid; see FILES.md for the load order.
   The screen is built with Looscid.lcEl and redrawn in place with Looscid.lcPatch, so focus stays where it is. */
(function (Looscid) {
const { ALERTS_TAB_KEY, CONVOS, LC_MSG_CATS, a11yEnterSends, announce, lcAlertCats, lcAlerts, lcAlertsMarkAll, lcAlertsSave, lcCatState, lcSetAlertsTab, lcWordHit,
  lcEl: h, lcPatch, lcPlainScreen, lcAvEl, lcIconEl, lcBackHeaderEl, lcBlockedHiddenEl } = Looscid;
Object.assign(Looscid, { lcCatList, lcAlertTime, lcAlertToggle, lcAlertsTab });

/* One conversation. st holds { convo, msgs, inp, shown } and lives as long as the conversation is open. */
function convoView(st, draw, onBack) {
  const convo = st.convo;
  const send = function () { if (!st.inp.trim()) return; st.msgs = st.msgs.concat([{ id: Date.now(), me: true, text: st.inp }]); st.inp = ""; st.scroll = true; draw(); };
  return h('div', { style: { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" } },
    h('div', { className: "hdr" },
      lcBackHeaderEl(convo.user.name, onBack),
      h('div', { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "4px 0 8px", fontSize: 11, color: "var(--gr)", fontWeight: 600 } },
        "End-to-end encrypted, Private")),
    h('div', { className: "msgs", style: { flex: 1 } },
      st.msgs.map(function (m, i) {
        const k = m.id || i;
        return h('div', { key: k, className: "mr" + (m.me ? " me" : "") },
          !m.me && lcAvEl(convo.user, 26),
          (!m.me && lcWordHit(m.text)
            ? lcBlockedHiddenEl("message", st.shown.has(k), function () { st.shown.add(k); draw(); }, h('div', { className: "bub th" }, m.text))
            : h('div', { className: "bub" + (m.me ? " me" : " th") }, m.text)));
      }),
      h('div', { ref: function (el) { st.end = el; } })),
    h('div', { className: "cir" },
      h('input', { className: "inp", style: { borderRadius: 100, flex: 1, fontSize: 14 }, placeholder: "Message " + convo.user.name + "…",
        value: st.inp, onChange: function (e) { st.inp = e.target.value; draw(); }, onKeyDown: function (e) { if (e.key === "Enter" && a11yEnterSends()) send(); }, "aria-label": "Message " + convo.user.name }),
      h('button', { className: "btn bp", style: { padding: 9, borderRadius: "50%", width: 38, height: 38, flexShrink: 0 }, onClick: send, disabled: !st.inp.trim(), "aria-label": "Send" },
        lcIconEl("Snd", { style: { width: 15, height: 15 } }))),
    h('div', { style: { height: 72 } }));
}

/* Arrow keys, Home and End on a tablist: same keys and focus moves as before. */
function subTabKey(list, cur, set) {
  return function (e) {
    const i = list.findIndex(function (t) { return t.id === cur; }); let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % list.length; else if (e.key === "ArrowLeft") n = (i - 1 + list.length) % list.length;
    else if (e.key === "Home") n = 0; else if (e.key === "End") n = list.length - 1;
    if (n < 0) return; e.preventDefault(); set(list[n].id);
    const tl = e.currentTarget; setTimeout(function () { const b = tl.querySelectorAll('[role="tab"]')[n]; if (b) b.focus(); }, 0);
  };
}

function alertsView(st, draw) {
  const view = st.view;
  const msgSubTabs = lcCatList("msg", LC_MSG_CATS);
  const notifs = lcAlerts();
  const notifSubTabs = lcCatList("alert", lcAlertCats());
  const goSet = function (pg, focus) { Looscid.LC_SETTINGS_BACK = "alerts"; if (Looscid.LC_NAV) Looscid.LC_NAV(pg); if (focus) setTimeout(function () { const el = document.getElementById(focus); if (el) el.focus(); }, 300); };

  const msgBadge = CONVOS.reduce(function (a, c) { return a + c.unread; }, 0);
  const notifBadge = notifs.filter(function (n) { return n.unread; }).length;

  const curNotif = notifSubTabs.some(function (t) { return t.id === st.notifTab; }) ? st.notifTab : (notifSubTabs[0] || {}).id;
  const filteredNotifs = curNotif === "all" ? notifs : notifs.filter(function (n) { return n.type === curNotif; });
  const curMsg = msgSubTabs.some(function (t) { return t.id === st.msgTab; }) ? st.msgTab : (msgSubTabs[0] || {}).id;
  const filteredMsgs = curMsg === "all" ? CONVOS
    : curMsg === "requests" ? CONVOS.filter(function (c) { return c.unread > 0; })
    : curMsg === "starred" ? []
    : curMsg === "archived" ? []
    : CONVOS;

  if (st.convo) return h('div', { className: "pg", style: { display: "flex", flexDirection: "column", paddingBottom: 0 } },
    convoView(st.convo, draw, function () { st.convo = null; draw(); }));

  const setMsgTab = function (id) { st.msgTab = id; draw(); };
  const setNotifTab = function (id) { st.notifTab = id; draw(); };
  const ALERT_VIEWS = [["notifications", "Notifications", notifBadge], ["messages", "Messages", msgBadge]];
  const onViewKey = function (e) {
    const i = ALERT_VIEWS.findIndex(function (v) { return v[0] === view; }); let n = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % 2; else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i + 1) % 2;
    else if (e.key === "Home") n = 0; else if (e.key === "End") n = 1;
    if (n < 0) return; e.preventDefault(); lcSetAlertsTab(ALERT_VIEWS[n][0]);
    setTimeout(function () { const b = document.getElementById("alerts-tab-" + ALERT_VIEWS[n][0]); if (b) b.focus(); }, 0);
  };
  const catTabs = function (list, cur, set, idp) {
    return list.map(function (t) {
      return h('button', { key: t.id, id: idp + t.id, className: "ftab" + (cur === t.id ? " on" : ""), role: "tab", "aria-selected": cur === t.id, "aria-label": t.label,
        tabIndex: cur === t.id ? 0 : -1, onClick: function () { set(t.id); } }, t.label);
    });
  };

  return h('div', { className: "pg" },
    h('div', { className: "hdr" },
      h('div', { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "48px 16px 12px" } },
        h('h1', { className: "htit", tabIndex: -1 }, "Alerts"),
        h('button', { type: "button", id: "alerts-settings-link", className: "btn bgb", style: { fontSize: 12, padding: "6px 12px", marginLeft: "auto", marginRight: 8 }, onClick: function () { goSet("settings_notifications"); } }, "Alerts settings"),
        h('button', { className: "btn bgb", style: { fontSize: 12, padding: "6px 12px" },
          onClick: function () { const n = lcAlertsMarkAll(); announce(n ? "All alerts marked as read." : "No alerts to mark."); }, "aria-label": "Mark all read" }, "Mark all read"))),

    /* Notifications | Messages: one tablist */
    h('div', { className: "ftabs lc-alert-tabs", role: "tablist", "aria-label": "Alerts", onKeyDown: onViewKey },
      ALERT_VIEWS.map(function (v) {
        const on = view === v[0];
        return h('button', { key: v[0], id: "alerts-tab-" + v[0], type: "button", role: "tab", className: "ftab" + (on ? " on" : ""), "aria-selected": on ? "true" : "false",
            "aria-controls": "alerts-panel-" + v[0], tabIndex: on ? 0 : -1, onClick: function () { lcSetAlertsTab(v[0]); } },
          v[1], v[2] > 0 ? h('span', { className: "lc-alert-badge" }, h('span', { className: "sr-only" }, ", "), v[2], h('span', { className: "sr-only" }, " unread")) : null);
      })),

    view === "messages" && h('div', { id: "alerts-panel-messages", role: "tabpanel", "aria-labelledby": "alerts-tab-messages" },
      h('div', { className: "lc-tablinks" }, h('button', { type: "button", id: "msg-settings-link", className: "btn bgb lc-btn", onClick: function () { goSet("settings_messages"); } }, "Message settings")),
      h('div', { className: "ftabs", role: "tablist", "aria-label": "Message categories", onKeyDown: subTabKey(msgSubTabs, curMsg, setMsgTab),
          style: { overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid var(--bd)" } },
        catTabs(msgSubTabs, curMsg, setMsgTab, "msgcat-")),
      h('div', { style: { padding: "9px 14px 6px" } },
        h('input', { className: "inp", style: { fontSize: 14 }, placeholder: "Search conversations", "aria-label": "Search conversations" })),
      filteredMsgs.length === 0
        ? h('div', { className: "es", style: { paddingTop: 24, paddingBottom: 24 } }, h('div', { className: "esl" }, "No messages yet"))
        : filteredMsgs.map(function (c) {
            return h('div', { key: c.id, className: "ci", onClick: function () { st.convo = { convo: c, msgs: c.msgs || [], inp: "", shown: new Set(), scroll: true }; draw(); },
                role: "button", tabIndex: 0, "aria-label": c.user.name + (c.unread > 0 ? ", " + c.unread + " unread" : "") + ". " + c.preview },
              h('div', { style: { position: "relative" } },
                lcAvEl(c.user, 46),
                c.unread > 0 && h('div', { style: { position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: "var(--gr)", border: "2px solid var(--bg)" }, "aria-hidden": "true" })),
              h('div', { className: "cif" }, h('div', { className: "cnm" }, c.user.name), h('div', { className: "cpv" }, c.preview)),
              h('div', { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 } },
                h('span', { style: { fontSize: 11, color: "var(--tx3)" } }, c.time),
                c.unread > 0 && h('span', { className: "ucnt", "aria-hidden": "true" }, c.unread)));
          })),

    view === "notifications" && h('div', { id: "alerts-panel-notifications", role: "tabpanel", "aria-labelledby": "alerts-tab-notifications" },
      h('div', { className: "lc-tablinks" }, h('button', { type: "button", id: "notif-settings-link", className: "btn bgb lc-btn", onClick: function () { goSet("settings_notifications", "al-newDream-h"); } }, "Notification settings")),
      h('div', { className: "ftabs", role: "tablist", "aria-label": "Notification categories", onKeyDown: subTabKey(notifSubTabs, curNotif, setNotifTab),
          style: { overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid var(--bd)" } },
        catTabs(notifSubTabs, curNotif, setNotifTab, "notifcat-")),
      filteredNotifs.length === 0
        ? h('div', { className: "es", style: { paddingTop: 24, paddingBottom: 24 } }, h('div', { className: "esl" }, curNotif === "system" ? "Nothing from Looscid yet" : "No alerts yet"))
        : filteredNotifs.map(function (n) {
            return h('div', { key: n.id, className: "ni" + (n.unread ? " unr" : ""), onClick: function () { lcAlertToggle(n.id); }, role: "button", tabIndex: 0,
                "aria-label": (n.user ? n.user.name + " " : "") + n.text + (n.preview ? ". " + n.preview : "") + ". " + lcAlertTime(n.time) + (n.unread ? ". Unread." : "") },
              n.user
                ? lcAvEl(n.user, 40)
                : h('div', { style: { width: 40, height: 40, borderRadius: "50%", background: "rgba(251,191,36,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }, "aria-hidden": "true" }, "Notification"),
              h('div', { style: { flex: 1 } },
                h('div', { className: "ntx" }, n.user && h('strong', null, n.user.name + " "), n.text),
                n.preview && h('div', { className: "npv" }, n.preview),
                h('div', { className: "ntm" }, lcAlertTime(n.time))),
              n.unread && h('div', { style: { width: 8, height: 8, borderRadius: "50%", background: "var(--ac2)", flexShrink: 0, marginTop: 4 }, "aria-hidden": "true" }));
          })),

    h('div', { style: { height: 72 } }));
}

/* The Alerts tab. One tablist: Notifications | Messages. Exactly one is selected; the choice is saved on this device. */
const AlertsPage = lcPlainScreen("AlertsPage", function (host) {
  const st = { view: lcAlertsTab(), msgTab: "all", notifTab: "all", convo: null };
  const draw = function () {
    lcPatch(host, alertsView(st, draw));
    const c = st.convo; if (c && c.scroll && c.end) { c.scroll = false; c.end.scrollIntoView({ behavior: "smooth" }); }
  };
  const onTab = function (e) { st.view = e.detail; draw(); };
  window.addEventListener("looscid:alertstab", onTab);
  window.addEventListener("looscid:alerts", draw);   // round 6: the real alerts
  window.addEventListener("looscid:cats", draw);     // round 6: categories follow the saved order and Show/Hide
  draw();
  return {
    update: draw,
    stop: function () { window.removeEventListener("looscid:alertstab", onTab); window.removeEventListener("looscid:alerts", draw); window.removeEventListener("looscid:cats", draw); }
  };
});
Looscid.AlertsPage = AlertsPage;

function lcCatList(kind, defs) {
  const st = lcCatState(kind, defs);
  return st.order.map(function (id) { return defs.find(function (d) { return d.id === id; }); }).filter(function (d) { return d && (d.id === "all" || st.hidden.indexOf(d.id) < 0); });
}
function lcAlertTime(t) { const s = Math.round((Date.now() - t) / 1000); return s < 60 ? "just now" : s < 3600 ? Math.floor(s / 60) + " min ago" : s < 86400 ? Math.floor(s / 3600) + " h ago" : new Date(t).toLocaleDateString(); }
function lcAlertToggle(id) { lcAlertsSave(lcAlerts().map(function (x) { return x.id === id ? Object.assign({}, x, { unread: !x.unread }) : x; })); }
function lcAlertsTab() { try { return localStorage.getItem(ALERTS_TAB_KEY) === "messages" ? "messages" : "notifications"; } catch (e) { return "notifications"; } }
})(window.Looscid = window.Looscid || {});
