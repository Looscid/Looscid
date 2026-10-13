/* Looscid alerts.js: the Alerts tab and messages, in plain JavaScript (no framework).
   Plain script (not a module). Everything it shares goes on window.Looscid; see docs/dev/FILES.md for the load order.
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
        "End-to-end encrypted, Private"),
      // Build 148: like a chat and it's in Liked, Chats.
      Looscid.lcLikeBtnEl ? h('div', { style: { display: "flex", justifyContent: "center", paddingBottom: 6 } }, Looscid.lcLikeBtnEl("chat", convo.id, "chat with " + convo.user.name, { name: "Chat with " + convo.user.name }, draw)) : null),
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
      h('button', { className: "btn bp", style: { padding: 9, borderRadius: "50%", width: 38, height: 38, flexShrink: 0 }, onClick: function () { if (!st.inp.trim()) { announce("Type a message first."); return; } send(); }, "aria-disabled": st.inp.trim() ? undefined : "true", "aria-label": "Send" },
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

/* Build 151 (#72/#73, 2three1y Oct 11 4:47-4:58 PM): the Alerts tab is an Inbox, Reddit's web Inbox as a layout idea
   only. One tablist: All, Unread, Messages, Replies, Mentions, Likes, Redreams, Quotes, New Dreamor (Settings, Alerts
   can reorder or hide them). "Send a message" and "Mark all read" sit at the top. Each row says who, what and when;
   similar ones group ("Liked by Ava and 3 others"); its More button holds Reply, Mark read and Block. Messages are
   private messages on Nostr (NIP-17); new ones are said through #looscid-live and focus never moves. */
const ONLY_FOLLOWED_KEY = "looscid_inbox_only_followed";
function onlyFollowed() { try { return localStorage.getItem(ONLY_FOLLOWED_KEY) === "1"; } catch (e) { return false; } }
function alertType(id) { return (Looscid.LC_ALERT_TYPES || []).find(function (t) { return t.id === id; }) || {}; }
function alertWhat(n) {
  const T = alertType(n.type), c = n.count || 1;
  if (c > 1 && n.sub && n.names && n.names.length) return c + " new replies in threads you follow, from " + n.names[0] + (c > 1 ? " and " + (c - 1) + (c - 1 === 1 ? " other" : " others") : "");
  if (c > 1 && T.by && n.names && n.names.length) return T.by + " " + n.names[0] + (c > 1 ? " and " + (c - 1) + (c - 1 === 1 ? " other" : " others") : "");
  return (n.user ? n.user.name + " " : "") + n.text;
}
// Round 8 fixes (QA round 7): a preview that already ends in a period read ".." before the time.
function alertLabel(n) { const s = alertWhat(n) + (n.preview ? ". " + n.preview : ""); return s + (/[.!?\u2026]$/.test(s) ? " " : ". ") + lcAlertTime(n.time) + (n.unread ? ". Unread." : ""); }
function pmStateNote() {
  const N = Looscid.lcNostr, mode = N && N.pmMode ? N.pmMode() : "none";
  if (mode === "key" || mode === "signer") return null;
  return mode === "locked" ? "Unlock your Nostr key in LooscidID to read and send private messages."
    : mode === "nosigner44" ? "Your Nostr signer doesn't offer encryption (nip44), so private messages can't be read or sent with it here."
    : "Private messages use Nostr: end-to-end encrypted (NIP-17), and only you and the person you write to can read them. Add a Nostr key in LooscidID to start.";
}
function rowMore(st, draw, key, label, acts) {
  const open = st.more === key;
  return [
    h('button', { key: "mb", type: "button", id: "more-" + key, className: "btn bgb lc-btn lc-inbox-more", "aria-expanded": open ? "true" : "false", "aria-controls": "acts-" + key, "aria-label": "More, " + label,
      onClick: function () { st.more = open ? null : key; draw(); if (!open) setTimeout(function () { const b = document.querySelector("#acts-" + key + " button"); if (b) b.focus(); }, 0); } }, "More"),
    open ? h('ul', { key: "ma", id: "acts-" + key, className: "lc-inbox-acts", role: "list",
        onKeyDown: function (e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); st.more = null; draw(); setTimeout(function () { const b = document.getElementById("more-" + key); if (b) b.focus(); }, 0); } } },
      acts.filter(Boolean).map(function (a) { return h('li', { key: a[0] }, h('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { st.more = null; a[1](); draw(); } }, a[0])); })) : null];
}
function blockWho(user) {
  if (!user || !user.handle) return null;
  return ["Block " + user.name, function () { const l = Looscid.lcBlocked("dreamers"); Looscid.lcBlockedSet("dreamers", l.concat([user.handle])); announce("Blocked " + user.name + ". You won't see their Dreams, alerts or messages."); }];
}
function notifRow(st, draw, n) {
  const key = "n-" + String(n.id).replace(/[^a-z0-9-]/gi, "");
  const canReply = n.type === "reply" || n.type === "mention" || n.type === "quote";
  return h('li', { key: key, className: "ni" + (n.unread ? " unr" : "") },
    h('button', { type: "button", className: "lc-ni-main", "aria-label": alertLabel(n), onClick: function () { if (n.unread) { lcAlertToggle(n.id); announce("Marked as read."); } } },
      n.user ? lcAvEl(n.user, 40) : h('div', { className: "lc-ni-ic", "aria-hidden": "true" }, "!"),
      h('div', { style: { flex: 1 }, "aria-hidden": "true" },
        h('div', { className: "ntx" }, alertWhat(n)),
        n.preview && h('div', { className: "npv" }, n.preview),
        h('div', { className: "ntm" }, lcAlertTime(n.time))),
      n.unread && h('div', { className: "lc-ni-dot", "aria-hidden": "true" })),
    rowMore(st, draw, key, alertWhat(n), [
      canReply ? ["Reply", function () {
        if (n.nid && n.user) Looscid.lcCompose({ mode: "reply", parent: { id: n.nid, nid: n.nid, user: n.user, text: n.preview || "" }, root: n.ref ? { id: n.ref, nid: n.ref, user: Looscid.ME } : undefined });
        else Looscid.lcCompose({ mode: "new", text: n.user && n.user.handle ? "@" + String(n.user.handle).replace(/^@/, "") + " " : "" }); }] : null,
      [n.unread ? "Mark read" : "Mark unread", function () { lcAlertToggle(n.id); announce(n.unread ? "Marked as read." : "Marked as unread."); }],
      blockWho(n.user)]));
}
function convoRow(st, draw, c) {
  const key = "c-" + String(c.peer || c.id).slice(0, 24);
  const open = function () { if (c.pm) { Looscid.lcPmMarkRead(c.peer); st.pm = c.peer; } else st.convo = { convo: c.demo, msgs: c.demo.msgs || [], inp: "", shown: new Set(), scroll: true }; draw(); };
  return h('li', { key: key, className: "ci" },
    h('button', { type: "button", className: "lc-ci-main", onClick: open,
        "aria-label": Looscid.lcNameJoin(c.name, c.unread > 0 ? c.unread + " unread" : "") + (c.preview ? ". " + c.preview : "") + (c.when ? ". " + c.when : "") },
      lcAvEl({ name: c.name, initials: String(c.name || "?").slice(0, 1), color: "#6d28d9" }, 46),
      h('div', { className: "cif", "aria-hidden": "true" }, h('div', { className: "cnm" }, c.name), h('div', { className: "cpv" }, c.preview)),
      h('div', { "aria-hidden": "true", style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 } },
        h('span', { style: { fontSize: 11, color: "var(--tx3)" } }, c.when),
        c.unread > 0 && h('span', { className: "ucnt" }, String(c.unread)))),
    rowMore(st, draw, key, c.name, [
      ["Reply", open],
      c.unread > 0 ? ["Mark read", function () { if (c.pm) Looscid.lcPmMarkRead(c.peer); else c.demo.unread = 0; announce("Marked as read."); }] : null,
      c.pm ? ["Block " + c.name, function () { let np = ""; try { np = window.NostrTools.nip19.npubEncode(c.peer); } catch (e) { np = c.peer; } Looscid.lcBlockedSet("dreamers", Looscid.lcBlocked("dreamers").concat([np])); announce("Blocked " + c.name + ". Their messages are hidden."); }]
        : blockWho(c.demo && c.demo.user)]));
}
function allConvos() {
  const pm = (Looscid.lcPmConvos ? Looscid.lcPmConvos() : []).map(function (c) { return { pm: true, peer: c.peer, name: c.name, unread: c.unread, preview: (c.last.me ? "You: " : "") + c.last.text.slice(0, 80), when: lcAlertTime(c.time), t: c.time }; });
  const demo = CONVOS.map(function (c) { return { pm: false, id: c.id, demo: c, name: c.user.name, unread: c.unread, preview: c.preview, when: c.time, t: 0 }; });
  return pm.concat(demo);
}
function composeView(st, draw) {
  const cp = st.compose, note = pmStateNote();
  // Round 7 fixes (QA round 6): like the chat's Send, this Send is aria-disabled while there's no npub or no message (it
  // only said "Type a message first." when pressed). Pressing it still says why, once.
  const blocked = function () { return !!(note || !String(cp.to || "").trim() || !String(cp.text || "").trim()); };
  const syncSend = function () { const b = document.getElementById("pm-send"); if (b) b.setAttribute("aria-disabled", blocked() ? "true" : "false"); };
  const send = function () {
    const peer = Looscid.lcPmPeerFrom(cp.to);
    if (!peer) { cp.msg = "Type their npub (it starts with npub1) or their public key."; announce(cp.msg); draw(); setTimeout(function () { const t = document.getElementById("pm-to"); if (t) t.focus(); }, 0); return; }
    if (!cp.text.trim()) { cp.msg = "Type a message first."; announce(cp.msg); draw(); return; }
    // Round 5 fixes: a first message can take several seconds; "Sending…" is said once right away instead of silence.
    cp.msg = "Sending…"; announce("Sending…", "state"); draw();
    Looscid.lcPmSend(peer, cp.text).then(function (r) {
      // The chat opens in place of the form, so focus goes to its heading (it fell to <body>).
      if (r.ok) { Looscid.Earcon.play("send"); announce("Sent to " + Looscid.lcNostrName(peer) + "."); st.compose = null; st.pm = peer; st.pmBack = cp.back || null; draw(); setTimeout(Looscid.lcFocusHeading, 30); }
      else { cp.msg = r.err === "relays" ? "Couldn't reach any relay. Your message is kept in the conversation as not sent." : "Couldn't send: " + (pmStateNote() || "try again."); announce(cp.msg); draw(); }
    });
  };
  return h('div', { className: "pg lc-pm-new" },
    lcBackHeaderEl("Send a message", function () { if (cp.back) { st.compose = null; cp.back(); return; } st.compose = null; draw(); setTimeout(function () { const b = document.getElementById("inbox-send"); if (b) b.focus(); }, 0); }),
    note ? h('p', { className: "lc-desc", style: { padding: "8px 16px" } }, note) : null,
    note ? h('div', { style: { padding: "0 16px 12px" } }, h('button', { type: "button", id: "pm-compose-lid", className: "btn bgb lc-btn", onClick: function () { Looscid.LC_LID_RETURN = { compose: cp }; if (Looscid.LC_NAV) Looscid.LC_NAV("settings_account"); } }, "Open LooscidID")) : null,
    h('div', { className: "lc-pm-form", style: { padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 } },
      h('label', { htmlFor: "pm-to" }, "To"),
      h('input', { id: "pm-to", className: "inp", type: "text", autoComplete: "off", spellCheck: false, value: cp.to, placeholder: "npub1…", onChange: function (e) { cp.to = e.target.value; syncSend(); } }),
      h('label', { htmlFor: "pm-text" }, "Message"),
      h('textarea', { id: "pm-text", className: "inp", rows: 4, value: cp.text, onChange: function (e) { cp.text = e.target.value; syncSend(); },
        onKeyDown: function (e) { if (e.key === "Enter" && !e.shiftKey && a11yEnterSends()) { e.preventDefault(); send(); } } }),
      h('button', { type: "button", id: "pm-send", className: "btn bp lc-big", "aria-disabled": blocked() ? "true" : "false", onClick: function () { if (note) { announce(note); return; } send(); } }, "Send"),
      cp.msg ? h('p', { className: "lc-desc" }, cp.msg) : null));
}
function pmView(st, draw) {
  const peer = st.pm, name = Looscid.lcNostrName(peer), msgs = Looscid.lcPms().filter(function (m) { return m.peer === peer; });
  const note = pmStateNote();
  // Round 5 fixes: Send is aria-disabled while there's nothing to send (or no key), stays findable, and pressing it says
  // why once. It was silent. "Sending…" is said once as soon as a message goes.
  const why = function () { return note || ((st.pmInp || "").trim() ? "" : "Type a message first."); };
  const syncSend = function () { const b = document.getElementById("pm-chat-send"); if (b) b.setAttribute("aria-disabled", why() ? "true" : "false"); };
  const send = function () {
    const w = why(); if (w) { announce(w); return; }
    const t = (st.pmInp || "").trim();
    st.pmInp = ""; announce("Sending…", "state"); draw(); syncSend();
    Looscid.lcPmSend(peer, t).then(function (r) { if (r.ok) { Looscid.Earcon.play("send"); announce("Sent."); } else announce("Couldn't send. It's kept here as not sent."); draw(); });
  };
  return h('div', { className: "pg", style: { display: "flex", flexDirection: "column", paddingBottom: 0 } },
    h('div', { className: "hdr" }, lcBackHeaderEl(name, function () { const b = st.pmBack; st.pm = null; st.pmBack = null; if (b) { b(); return; } draw(); }),
      h('p', { className: "lc-desc", style: { textAlign: "center", margin: "0 0 8px" } }, "End-to-end encrypted on Nostr (NIP-17)")),
    note ? h('p', { className: "lc-desc", style: { padding: "0 16px" } }, note) : null,
    // Round 8 fixes (QA round 7): with no Nostr key, this chat (opened from a profile's Direct message) had lost the
    // "Open LooscidID" button the old compose view had, and still said "Say hello", which you couldn't.
    note ? h('div', { style: { padding: "8px 16px 12px" } }, h('button', { type: "button", id: "pm-open-lid", className: "btn bgb lc-btn", onClick: function () { Looscid.LC_LID_RETURN = { peer: peer, name: name, back: st.pmBack }; if (Looscid.LC_NAV) Looscid.LC_NAV("settings_account"); } }, "Open LooscidID")) : null,
    msgs.length || note ? null : h('p', { className: "lc-desc", style: { padding: "8px 16px" } }, "No messages yet. Say hello to " + name + "."),
    h('ul', { className: "msgs lc-pm-list", role: "list", style: { flex: 1, listStyle: "none", margin: 0 } }, msgs.map(function (m) {
      return h('li', { key: m.id, className: "mr" + (m.me ? " me" : "") },
        h('div', { className: "bub" + (m.me ? " me" : " th") },
          h('span', { className: "sr-only" }, (m.me ? "You" : name) + ": "), m.text,
          h('span', { className: "sr-only" }, ", " + lcAlertTime(m.created) + (m.state === "failed" ? ", not sent" : m.state === "sending" ? ", sending" : ""))),
        m.state === "failed" ? h('span', { className: "lc-desc", "aria-hidden": "true" }, "Not sent") : null);
    })),
    h('div', { className: "cir" },
      h('label', { htmlFor: "pm-inp", className: "sr-only" }, "Message " + name),
      h('input', { id: "pm-inp", className: "inp", style: { borderRadius: 100, flex: 1, fontSize: 14 }, placeholder: "Message " + name + "…", value: st.pmInp || "",
        onChange: function (e) { st.pmInp = e.target.value; syncSend(); }, onKeyDown: function (e) { if (e.key === "Enter" && a11yEnterSends()) { e.preventDefault(); send(); } } }),
      h('button', { type: "button", id: "pm-chat-send", className: "btn bp", style: { padding: 9, borderRadius: "50%", width: 38, height: 38, flexShrink: 0 }, onClick: send, "aria-label": "Send", "aria-disabled": why() ? "true" : "false" },
        lcIconEl("Snd", { style: { width: 15, height: 15 }, "aria-hidden": "true" }))),
    h('div', { style: { height: 72 } }));
}

function alertsView(st, draw) {
  if (st.compose) return composeView(st, draw);
  if (st.pm) return pmView(st, draw);
  if (st.convo) return h('div', { className: "pg", style: { display: "flex", flexDirection: "column", paddingBottom: 0 } },
    convoView(st.convo, draw, function () { st.convo = null; draw(); }));
  const tabs = lcCatList("alert", lcAlertCats());
  const cur = tabs.some(function (t) { return t.id === st.view; }) ? st.view : "all";
  const notifs = lcAlerts(), convos = allConvos(), only = onlyFollowed();
  const goSet = function (pg, focus) { Looscid.LC_SETTINGS_BACK = "alerts"; if (Looscid.LC_NAV) Looscid.LC_NAV(pg); if (focus) setTimeout(function () { const el = document.getElementById(focus); if (el) el.focus(); }, 300); };
  const unreadN = notifs.filter(function (n) { return n.unread; }).length, unreadC = convos.reduce(function (a, c) { return a + (c.unread || 0); }, 0);
  const count = function (id) { return id === "unread" ? unreadN + unreadC : id === "messages" ? unreadC : id === "all" ? 0 : notifs.filter(function (n) { return n.unread && n.type === id; }).length; };
  let rows = [];
  if (cur === "messages") rows = convos.map(function (c) { return { c: c }; });
  else {
    let ns = cur === "all" ? notifs : cur === "unread" ? notifs.filter(function (n) { return n.unread; }) : notifs.filter(function (n) { return n.type === cur; });
    if (cur === "reply" && only) ns = ns.filter(function (n) { return n.sub; });
    rows = ns.map(function (n) { return { n: n, t: n.time }; });
    if (cur === "all" || cur === "unread") {
      const cs = convos.filter(function (c) { return cur === "all" || c.unread > 0; });
      rows = rows.concat(cs.map(function (c) { return { c: c, t: c.t }; })).sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    }
  }
  const setTab = function (id) { st.view = id; st.more = null; lcSetAlertsTab(id, true); draw(); };
  const empty = { all: "Nothing here yet", unread: "You're all caught up", messages: "No messages yet", reply: only ? "No new replies in threads you follow" : "No replies yet", mention: "No mentions yet", like: "No Likes yet", redream: "No Redreams yet", quote: "No Quotes yet", follow: "No new Dreamors yet" }[cur] || "Nothing here yet";
  return h('div', { className: "pg lc-inbox" },
    h('div', { className: "hdr" },
      h('div', { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "48px 16px 12px" } },
        h('h1', { className: "htit", tabIndex: -1, style: { marginRight: "auto" } }, "Alerts"),
        h('button', { type: "button", id: "inbox-send", className: "btn bp", style: { fontSize: 12, padding: "6px 12px" }, onClick: function () { st.compose = { to: "", text: "", msg: "" }; draw(); setTimeout(function () { const t = document.getElementById("pm-to"); if (t) t.focus(); }, 0); } }, "Send a message"),
        h('button', { type: "button", id: "inbox-markall", className: "btn bgb", style: { fontSize: 12, padding: "6px 12px" },
          onClick: function () { const n = lcAlertsMarkAll(); const m = Looscid.lcPmMarkRead ? Looscid.lcPmMarkRead(null) : false; announce(n || m ? "All marked as read." : "Nothing to mark."); } }, "Mark all read"),
        h('button', { type: "button", id: "alerts-settings-link", className: "btn bgb", style: { fontSize: 12, padding: "6px 12px" }, onClick: function () { goSet("settings_notifications"); } }, "Alerts settings"))),
    h('div', { className: "ftabs lc-alert-tabs", role: "tablist", "aria-label": "Inbox", onKeyDown: subTabKey(tabs, cur, setTab), style: { overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid var(--bd)" } },
      tabs.map(function (t) {
        const on = cur === t.id, k = count(t.id);
        return h('button', { key: t.id, id: "inbox-tab-" + t.id, type: "button", role: "tab", className: "ftab" + (on ? " on" : ""), "aria-selected": on ? "true" : "false", "aria-controls": "inbox-panel",
            tabIndex: on ? 0 : -1, onClick: function () { setTab(t.id); }, "aria-label": k > 0 ? t.label + " (" + k + " unread)" : undefined },
          t.label, k > 0 ? [" ", h('span', { key: "b", className: "lc-alert-badge", "aria-hidden": "true" }, String(k))] : null);
      })),
    h('div', { id: "inbox-panel", role: "tabpanel", "aria-labelledby": "inbox-tab-" + cur },
      cur === "reply" ? h('fieldset', { className: "lc-inbox-only" }, h('legend', null, "Replies"),
        h('label', { className: "lc-cbx-row" }, h('input', { type: "checkbox", id: "inbox-only-followed", checked: only,
          onChange: function (e) { try { localStorage.setItem(ONLY_FOLLOWED_KEY, e.target.checked ? "1" : "0"); } catch (x) {} draw(); } }), " Only threads I follow")) : null,
      cur === "messages" && pmStateNote() ? h('p', { className: "lc-desc", style: { padding: "8px 16px" } }, pmStateNote()) : null,
      cur === "messages" && Looscid.lcPmHeld && Looscid.lcPmHeld() > 0 ? h('div', { className: "lc-pm-held", style: { padding: "8px 16px" } },
        h('p', { className: "lc-desc", id: "pm-held-note" }, (function (k) { return k === 1 ? "1 Dreamor who isn't allowed by Who can message me has messages waiting. They stay hidden and silent." : k + " Dreamors who aren't allowed by Who can message me have messages waiting. They stay hidden and silent."; })(Looscid.lcPmHeld())),
        h('button', { type: "button", id: "pm-held-settings", className: "btn bgb lc-btn", onClick: function () { goSet("settings_messages"); } }, "Message settings")) : null,
      rows.length === 0
        ? h('div', { className: "es", style: { paddingTop: 24, paddingBottom: 24 } }, h('p', { className: "esl" }, empty))
        : h('ul', { className: "lc-inbox-list", role: "list" }, rows.map(function (r) { return r.c ? convoRow(st, draw, r.c) : notifRow(st, draw, r.n); }))),
    h('div', { style: { height: 72 } }));
}

/* The Alerts tab (the Inbox). The chosen tab is saved on this device. */
const AlertsPage = lcPlainScreen("AlertsPage", function (host) {
  const saved = lcAlertsTab();
  const st = { view: saved, convo: null, pm: null, compose: null, more: null };
  // Round 5 fixes: Direct message on a Dreamor's profile opens their chat, or a new message to them; Back returns to the profile.
  const dm = Looscid.LC_PM_OPEN; Looscid.LC_PM_OPEN = null;
  /* Round 9 fixes (QA round 8): Open LooscidID from this chat (or from Send a message) set a Back target for Settings
     pages, which LooscidID's Back ignored: Back went to Settings, and the leftover target sent a later Settings > Alerts
     > Back into the Inbox. LooscidID's Back now hands the chat (or the form, with what you typed) back here instead. */
  if (dm && dm.compose) st.compose = dm.compose;
  else if (dm && dm.peer) {
    // Round 7 fixes (QA round 6): always the chat itself, titled with their name, even before the first message (a new chat
    // showed "Send a message" with their raw npub in the To box until something was sent).
    st.pm = dm.peer; st.pmBack = dm.back;
  }
  const draw = function () {
    const ae = document.activeElement, aid = ae && host.contains(ae) ? ae.id : null;
    lcPatch(host, alertsView(st, draw));
    const c = st.convo; if (c && c.scroll && c.end) { c.scroll = false; c.end.scrollIntoView({ behavior: "smooth" }); }
    if (aid && !host.contains(document.activeElement)) { const el = document.getElementById(aid); if (el) el.focus(); }
  };
  const onTab = function (e) { st.view = e.detail; draw(); };
  const evs = ["looscid:alerts", "looscid:cats", "looscid:pms", "looscid:blocked", "looscid:threadsubs"];
  window.addEventListener("looscid:alertstab", onTab);
  evs.forEach(function (e) { window.addEventListener(e, draw); });
  draw();
  if (Looscid.lcPmCheck) setTimeout(function () { Looscid.lcPmCheck(); if (Looscid.lcInboxCheck) Looscid.lcInboxCheck(); }, 400);
  return {
    update: draw,
    stop: function () { window.removeEventListener("looscid:alertstab", onTab); evs.forEach(function (e) { window.removeEventListener(e, draw); }); }
  };
});
Looscid.AlertsPage = AlertsPage;

function lcCatList(kind, defs) {
  const st = lcCatState(kind, defs);
  return st.order.map(function (id) { return defs.find(function (d) { return d.id === id; }); }).filter(function (d) { return d && (d.id === "all" || st.hidden.indexOf(d.id) < 0); });
}
function lcAlertTime(t) { const s = Math.round((Date.now() - t) / 1000); return s < 60 ? "just now" : s < 3600 ? Math.floor(s / 60) + " min ago" : s < 86400 ? Math.floor(s / 3600) + " h ago" : new Date(t).toLocaleDateString(); }
function lcAlertToggle(id) { lcAlertsSave(lcAlerts().map(function (x) { return x.id === id ? Object.assign({}, x, { unread: !x.unread }) : x; })); }
function lcAlertsTab() { let v = "all"; try { v = localStorage.getItem(ALERTS_TAB_KEY) || "all"; } catch (e) {} return v === "notifications" ? "all" : v; }
})(window.Looscid = window.Looscid || {});
