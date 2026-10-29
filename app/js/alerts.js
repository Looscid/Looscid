/* Looscid alerts.js: the Alerts tab and messages, in plain JavaScript (no framework).
   Plain script (not a module). Everything it shares goes on window.Looscid; see docs/dev/FILES.md for the load order.
   The screen is built with Looscid.lcEl and redrawn in place with Looscid.lcPatch, so focus stays where it is. */
(function (Looscid) {
const { ALERTS_TAB_KEY, CONVOS, LC_MSG_CATS, a11yEnterSends, announce, lcAlertCats, lcAlerts, lcAlertsMarkAll, lcAlertsSave, lcCatState, lcSetAlertsTab, lcWordHit,
  lcEl: h, lcPatch, lcPlainScreen, lcAvEl, lcIconEl, lcBackHeaderEl, lcBlockedHiddenEl } = Looscid;
Object.assign(Looscid, { lcCatList, lcAlertTime, lcAlertToggle, lcAlertsTab, lcOpenNewChat });
/* Round 7.30 (Carter, Oct 26 2026): Create, New Chat opens Inbox on Chats with the Send a message form, focus in To.
   The Inbox reads LC_PM_OPEN when it opens; when it is already open, the looscid:newchat event hands the form over. */
function lcOpenNewChat(navigate) {
  if (Looscid.lcSetInboxView) Looscid.lcSetInboxView("chats", true);
  Looscid.LC_PM_OPEN = { compose: { to: "", text: "", msg: "" } };
  const nav = navigate || Looscid.LC_NAV; if (nav) nav("alerts");
  window.dispatchEvent(new CustomEvent("looscid:newchat"));
  let n = 0; const go = function () { const t = document.getElementById("pm-to"); if (t) { if (document.activeElement !== t) t.focus(); return; } if (++n < 40) setTimeout(go, 50); };
  setTimeout(go, 60);
}

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
  if (n.type === "deletedDream") return n.text;
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
    h('button', { key: "mb", type: "button", id: "more-" + key, className: "btn bgb lc-btn lc-inbox-more", "aria-expanded": open ? "true" : "false", "aria-controls": "acts-" + key, "aria-label": key.indexOf("n-") === 0 ? "Alert Options" : "More, " + label,
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
      // Round 7.18 (#148): an alert from a followed thread can unfollow it right here.
      n.thread && Looscid.lcThreadSubbed && Looscid.lcThreadSubbed(n.thread) ? ["Unfollow Thread", function () { Looscid.lcThreadUnsub(n.thread); announce("Unfollowed this thread."); }] : null,
      blockWho(n.user)]));
}
/* Round 7.19 (#149 Chats, Carter Oct 25 2026): Chats filters are DMs, Requests, Pinned and Deleted (last). No All and no
   Circles in Chats. Unread is not a filter: "Show unread only" is a switch inside DMs and Pinned. Each chat's More has
   Pin or Unpin, Mark read or Mark unread, and Delete (Deleted holds it, with Restore). Kept on this device. */
const CHAT_PINNED_KEY = "looscid_chat_pinned", CHAT_DELETED_KEY = "looscid_chat_deleted", CHAT_FILTER_KEY = "looscid_chats_filter", CHAT_UNREAD_ONLY_KEY = "looscid_chats_unread_only";
const CHAT_FILTERS = [{ id: "dms", label: "DMs" }, { id: "requests", label: "Requests" }, { id: "pinned", label: "Pinned" }, { id: "deleted", label: "Deleted" }];
function chatJson(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
function chatSave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} window.dispatchEvent(new CustomEvent("looscid:pms")); }
function chatKey(c) { return c.pm ? "pm:" + c.peer : "demo:" + c.id; }
function chatPinned() { const v = chatJson(CHAT_PINNED_KEY, []); return Array.isArray(v) ? v : []; }
function chatDeleted() { const v = chatJson(CHAT_DELETED_KEY, {}); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
// A chat deleted on this device comes back by itself when a newer message arrives.
function chatIsDeleted(c) { const at = chatDeleted()[chatKey(c)]; return !!at && !(c.t && c.t > at); }
function chatFilter() { let v = "dms"; try { v = localStorage.getItem(CHAT_FILTER_KEY) || "dms"; } catch (e) {} return CHAT_FILTERS.some(function (f) { return f.id === v; }) ? v : "dms"; }
function chatUnreadOnly() { try { return localStorage.getItem(CHAT_UNREAD_ONLY_KEY) === "1"; } catch (e) { return false; } }
function chatMarkUnread(c) {
  if (!c.pm) { c.demo.unread = Math.max(1, c.demo.unread || 0); return; }
  const l = Looscid.lcPms(); let at = -1; l.forEach(function (m, i) { if (m.peer === c.peer && !m.me) at = i; });
  if (at >= 0) { l[at] = Object.assign({}, l[at], { read: false }); Looscid.lcPmsSave(l); }
}
// Requests: people who wrote to you but aren't allowed by Who can message me. Accept moves them to DMs.
function requestConvos() {
  if (!Looscid.lcPms || !Looscid.lcPmAllowed) return [];
  const all = Looscid.lcPms(), by = {};
  all.forEach(function (m) { if (m.me || (Looscid.lcPmBlocked && Looscid.lcPmBlocked(m.peer)) || Looscid.lcPmAllowed(m.peer, all)) return; (by[m.peer] = by[m.peer] || []).push(m); });
  return Object.keys(by).map(function (p) { const ms = by[p], last = ms[ms.length - 1]; return { pm: true, request: true, peer: p, name: Looscid.lcNostrName(p), unread: ms.filter(function (m) { return !m.read; }).length, preview: String(last.text || "").slice(0, 80), when: lcAlertTime(last.created), t: last.created }; })
    .sort(function (a, b) { return b.t - a.t; });
}
function convoRow(st, draw, c) {
  const key = "c-" + String(c.peer || c.id).slice(0, 24);
  const open = function () { if (c.pm) { Looscid.lcPmMarkRead(c.peer); st.pm = c.peer; } else st.convo = { convo: c.demo, msgs: c.demo.msgs || [], inp: "", shown: new Set(), scroll: true }; draw(); };
  const ck = chatKey(c), pinned = chatPinned().indexOf(ck) >= 0, deleted = chatIsDeleted(c);
  const block = c.pm ? ["Block " + c.name, function () { let np = ""; try { np = window.NostrTools.nip19.npubEncode(c.peer); } catch (e) { np = c.peer; } Looscid.lcBlockedSet("dreamers", Looscid.lcBlocked("dreamers").concat([np])); announce("Blocked " + c.name + ". Their messages are hidden."); }]
    : blockWho(c.demo && c.demo.user);
  const acts = deleted ? [
      ["Restore", function () { const d = chatDeleted(); delete d[ck]; chatSave(CHAT_DELETED_KEY, d); announce("Restored the chat with " + c.name + "."); }],
      block]
    : c.request ? [
      ["Accept", function () { Looscid.lcPmAccept(c.peer); announce("Accepted. " + c.name + " is in DMs now."); }],
      ["Open", open],
      ["Delete", function () { const d = chatDeleted(); d[ck] = Date.now(); chatSave(CHAT_DELETED_KEY, d); Looscid.lcPmMarkRead(c.peer); announce("Deleted the request from " + c.name + ". It's in Deleted."); }],
      block]
    : [
      ["Reply", open],
      [pinned ? "Unpin" : "Pin", function () { chatSave(CHAT_PINNED_KEY, pinned ? chatPinned().filter(function (x) { return x !== ck; }) : chatPinned().concat([ck])); announce(pinned ? "Unpinned the chat with " + c.name + "." : "Pinned the chat with " + c.name + ". It's in Pinned."); }],
      // Round 7.26 (#155): Mute or Unmute: a muted chat's new messages are never said or sounded (still counted unread).
      [Looscid.lcChatMuted && Looscid.lcChatMuted(ck) ? "Unmute" : "Mute", function () { const on = Looscid.lcChatMuteToggle(ck); announce(on ? "Muted the chat with " + c.name + ". New messages won't be said or make a sound." : "Unmuted the chat with " + c.name + "."); }],
      c.unread > 0 ? ["Mark read", function () { if (c.pm) Looscid.lcPmMarkRead(c.peer); else c.demo.unread = 0; announce("Marked as read."); }]
        : ["Mark unread", function () { chatMarkUnread(c); announce("Marked as unread."); }],
      ["Delete", function () { const d = chatDeleted(); d[ck] = Date.now(); chatSave(CHAT_DELETED_KEY, d); if (c.pm) Looscid.lcPmMarkRead(c.peer); else c.demo.unread = 0; announce("Deleted the chat with " + c.name + ". It's in Deleted until a new message comes."); }],
      block];
  return h('li', { key: key, className: "ci" },
    h('button', { type: "button", className: "lc-ci-main", onClick: open,
        "aria-label": Looscid.lcNameJoin(c.name + (c.unread > 0 ? " (" + c.unread + " unread)" : ""), pinned && !deleted ? "pinned" : "", Looscid.lcChatMuted && Looscid.lcChatMuted(ck) ? "muted" : "") /* #150, #155 */ + (c.preview ? ". " + c.preview : "") + (c.when ? ". " + c.when : "") },
      lcAvEl({ name: c.name, initials: String(c.name || "?").slice(0, 1), color: "#6d28d9" }, 46),
      h('div', { className: "cif", "aria-hidden": "true" }, h('div', { className: "cnm" }, c.name), h('div', { className: "cpv" }, c.preview)),
      h('div', { "aria-hidden": "true", style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 } },
        h('span', { style: { fontSize: 11, color: "var(--tx3)" } }, c.when),
        c.unread > 0 && h('span', { className: "ucnt" }, String(c.unread)))),
    rowMore(st, draw, key, c.name, acts));
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
    // Round 9 fixes (QA round 8): "Sending…" is plain progress, not a button's state word, so it is not carried to the next page.
    cp.msg = "Sending…"; announce("Sending…"); draw();
    Looscid.lcPmSend(peer, cp.text).then(function (r) {
      // The chat opens in place of the form, so focus goes to its heading (it fell to <body>).
      if (r.ok) { Looscid.Earcon.play("send"); announce("Sent to " + Looscid.lcNostrName(peer) + "."); st.compose = null; st.pm = peer; st.pmBack = cp.back || null; draw(); setTimeout(Looscid.lcFocusHeading, 30); }
      else { cp.msg = r.err === "relays" ? "Couldn't reach any relay. Your message is kept in the conversation as not sent." : "Couldn't send: " + (pmStateNote() || "try again."); announce(cp.msg); draw(); }
    });
  };
  return h('div', { className: "pg lc-pm-new" },
    lcBackHeaderEl("Send a message", function () { if (cp.back) { st.compose = null; cp.back(); return; } st.compose = null; draw(); setTimeout(function () { const b = document.getElementById("inbox-send"); if (b) b.focus(); else if (Looscid.lcFocusHeading) Looscid.lcFocusHeading(); }, 0); }),
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
    st.pmInp = ""; announce("Sending…"); draw(); syncSend();
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

/* Round 7.17 (#149, Carter Oct 25 2026, "NAMING FINAL"): the bottom tab is Inbox. Inbox has two views, Alerts (what was
   Notifications: likes, replies, mentions, follows, Circles) and Chats (what was Messages). One menu (pop-up) button picks
   the view, "Showing Alerts, 12", with "Alerts (12)" and "Chats (3)" in its menu; it is a button, not a tab. Under it is one
   filter row, the only group with a selected state (a real tablist). Counts are in parens. The Inbox tab's badge is both. */
function viewMenu(st, draw, counts) {
  const items = [{ id: "alerts", name: "Alerts" }, { id: "chats", name: "Chats" }];
  const cur = items.find(function (it) { return it.id === st.box; }) || items[0], k = counts[cur.id] || 0;
  const focusBtn = function () { setTimeout(function () { const b = document.getElementById("inbox-view-btn"); if (b) b.focus(); }, 0); };
  const focusItem = function (i) { setTimeout(function () { const l = document.querySelectorAll("#inbox-view-menu [data-mi]"); const el = l[Math.max(0, Math.min(l.length - 1, i))]; if (el) el.focus(); }, 0); };
  const close = function () { st.menu = false; draw(); focusBtn(); };
  const pick = function (id) {
    st.menu = false; st.more = null;
    if (id !== st.box) { st.box = id; Looscid.lcSetInboxView(id, true); }
    draw(); focusBtn(); announce("Showing " + (id === "chats" ? "Chats" : "Alerts") + ".");
  };
  const curIdx = Math.max(0, items.indexOf(cur));
  const onMenuKey = function (e) {
    const l = Array.prototype.slice.call(document.querySelectorAll("#inbox-view-menu [data-mi]")), i = l.indexOf(document.activeElement);
    if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); close(); return; }
    let n = -1;
    if (e.key === "ArrowDown") n = i < 0 ? 0 : (i + 1) % l.length; else if (e.key === "ArrowUp") n = i < 0 ? l.length - 1 : (i - 1 + l.length) % l.length;
    else if (e.key === "Home") n = 0; else if (e.key === "End") n = l.length - 1;
    else if ((e.key === "Enter" || e.key === " ") && i >= 0) { e.preventDefault(); l[i].click(); return; }
    if (n >= 0) { e.preventDefault(); l[n].focus(); }
  };
  return h('div', { className: "lmenu lc-inbox-view", style: { padding: "0 16px 8px" } },
    // The button's name is its visible words: "Showing Alerts, 12" (#149 approved label), or "Showing Alerts" with nothing new.
    h('button', { id: "inbox-view-btn", type: "button", className: "lmenu-btn", "aria-haspopup": "menu", "aria-expanded": st.menu ? "true" : "false", "aria-controls": st.menu ? "inbox-view-menu" : undefined,
        onClick: function () { st.menu = !st.menu; draw(); if (st.menu) setTimeout(function () { const m = document.getElementById("inbox-view-menu"); if (m) m.focus(); }, 0); },
        onKeyDown: function (e) { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); st.menu = true; draw(); focusItem(e.key === "ArrowUp" ? items.length : curIdx); } } },
      "Showing " + cur.name + (k > 0 ? ", " + k : ""), h('span', { className: "lmenu-caret", "aria-hidden": "true" }, st.menu ? "\u25B4" : "\u25BE")),
    st.menu ? h('div', { className: "lmenu-list" },
      // Opened by a tap or click, focus goes to the menu itself (#76), so VoiceOver says only "Inbox, menu"; Down moves in.
      h('ul', { id: "inbox-view-menu", role: "menu", className: "lmenu-ul", "aria-label": "Inbox", tabIndex: -1, onKeyDown: onMenuKey },
        items.map(function (it, i) {
          const on = it.id === cur.id, c = counts[it.id] || 0;
          return h('li', { key: it.id, id: "inbox-view-" + it.id, "data-mi": "1", role: "menuitemradio", "aria-checked": on ? "true" : "false", tabIndex: -1, className: "lmenu-item",
              onClick: function () { pick(it.id); } },
            h('span', { className: "lmenu-check", "aria-hidden": "true" }, on ? "\u2713" : ""),
            h('span', null, it.name + (c > 0 ? " (" + c + ")" : "")));
        }),
        h('li', { key: "__close", id: "inbox-view-close", "data-mi": "1", role: "menuitem", tabIndex: -1, className: "lmenu-item lmenu-close", "aria-label": "Close Inbox menu", "aria-braillelabel": "Close", onClick: close }, "Close"))) : null);
}
/* One filter row (a real tablist). Each filter with something unread says it in parens: "Replies (3)". */
function filterRow(id, label, tabs, cur, count, setTab) {
  return h('div', { key: id, className: "ftabs lc-alert-tabs", role: "tablist", "aria-label": label, onKeyDown: subTabKey(tabs, cur, setTab), style: { overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid var(--bd)" } },
    tabs.map(function (t, i) {
      const on = cur === t.id, k = count(t.id);
      return h('button', { key: t.id, id: "inbox-tab-" + t.id, type: "button", role: "tab", className: "ftab" + (on ? " on" : ""), "aria-selected": on ? "true" : "false", "aria-controls": "inbox-panel",
          "aria-setsize": tabs.length, "aria-posinset": i + 1, tabIndex: on ? 0 : -1, onClick: function () { setTab(t.id); }, "aria-label": k > 0 ? t.label + " (" + k + ")" : undefined },
        t.label, k > 0 ? [" ", h('span', { key: "b", className: "lc-alert-badge", "aria-hidden": "true" }, String(k))] : null);
    }));
}
/* Round 7.18 (#148): Manage Followed Threads. Every thread you follow, newest first, each with Unfollow Thread. */
function manageThreadsView(st, draw) {
  const subs = (Looscid.lcThreadSubs ? Looscid.lcThreadSubs() : []).slice().reverse();
  const back = function () { st.manage = false; draw(); setTimeout(function () { const b = document.getElementById("inbox-manage-threads"); if (b) b.focus(); }, 0); };
  return h('div', { className: "pg lc-inbox" },
    lcBackHeaderEl("Followed Threads", back),
    h('p', { className: "lc-desc", style: { padding: "0 16px 8px" } }, "New replies in these threads show up in Inbox, Alerts, Followed Threads. A Like never follows a thread."),
    subs.length === 0 ? h('div', { className: "es", style: { paddingTop: 24, paddingBottom: 24 } }, h('p', { className: "esl" }, "You're not following any threads"))
      : h('ul', { className: "lc-inbox-list", role: "list" }, subs.map(function (sb, i) {
          const name = sb.label ? sb.label.charAt(0).toUpperCase() + sb.label.slice(1) : "A thread", since = sb.since ? lcAlertTime(sb.since * 1000) : "";
          const key = "ft-" + String(sb.root).replace(/[^a-z0-9-]/gi, "").slice(0, 40);
          return h('li', { key: key, className: "ni" },
            h('p', { className: "ntx", style: { flex: 1, margin: 0 } }, name + (since ? ", followed " + since : "")),
            h('button', { type: "button", id: key + "-unf", className: "btn bgb lc-btn", "aria-label": "Unfollow Thread, " + name,
              onClick: function () {
                Looscid.lcThreadUnsub(sb.root); announce("Unfollowed " + name + ".");
                // Focus goes to the next thread's button, or the previous one, or Back.
                setTimeout(function () { const l = document.querySelectorAll('.lc-inbox-list button[id^="ft-"]'); const el = l[Math.min(i, l.length - 1)] || document.querySelector(".lc-inbox .lc-back, .lc-inbox button"); if (el) el.focus(); }, 30);
              } }, "Unfollow Thread"));
        })),
    h('div', { style: { height: 72 } }));
}
function alertsView(st, draw) {
  if (st.compose) return composeView(st, draw);
  if (st.pm) return pmView(st, draw);
  if (st.convo) return h('div', { className: "pg", style: { display: "flex", flexDirection: "column", paddingBottom: 0 } },
    convoView(st.convo, draw, function () { st.convo = null; draw(); }));
  const chats = st.box === "chats";
  const tabs = lcCatList("alert", lcAlertCats());
  const cur = tabs.some(function (t) { return t.id === st.view; }) ? st.view : "all";
  if (st.manage) return manageThreadsView(st, draw);
  const notifs = lcAlerts(), convos = allConvos();
  const goSet = function (pg, focus) { Looscid.LC_SETTINGS_BACK = "alerts"; if (Looscid.LC_NAV) Looscid.LC_NAV(pg); if (focus) setTimeout(function () { const el = document.getElementById(focus); if (el) el.focus(); }, 300); };
  const unreadN = notifs.filter(function (n) { return n.unread; }).length, unreadC = convos.reduce(function (a, c) { return a + (c.unread || 0); }, 0);
  const isCircle = function (n) { return n.type === "circle" || !!n.circle; };
  // Round 7.18 (#148): alerts from threads you follow (new replies, and a deleted Dream there) are Followed Threads, not Replies.
  const isThread = function (n) { return !!n.sub || n.type === "deletedDream"; };
  const inTab = function (id, n) { return id === "all" ? true : id === "unread" ? n.unread : id === "circle" ? isCircle(n) : id === "thread" ? isThread(n) : id === "reply" ? n.type === "reply" && !n.sub : n.type === id; };
  const count = function (id) { return id === "all" ? 0 : notifs.filter(function (n) { return n.unread && inTab(id, n); }).length; };
  // Round 7.19: the Chats filters.
  const cf = st.chatF, uOnly = chatUnreadOnly(), reqs = requestConvos(), pins = chatPinned();
  const live = convos.filter(function (c) { return !chatIsDeleted(c); });
  const chatList = function (id) {
    if (id === "requests") return reqs.filter(function (c) { return !chatIsDeleted(c); });
    if (id === "deleted") return convos.concat(reqs).filter(chatIsDeleted);
    let l = id === "pinned" ? live.filter(function (c) { return pins.indexOf(chatKey(c)) >= 0; }) : live.slice();
    if (id === "dms") l.sort(function (a, b) { return (pins.indexOf(chatKey(b)) >= 0) - (pins.indexOf(chatKey(a)) >= 0); }); // pinned first in DMs
    return uOnly ? l.filter(function (c) { return c.unread > 0; }) : l;
  };
  const chatCount = function (id) { return id === "deleted" ? 0 : id === "requests" ? chatList("requests").length : (id === "pinned" ? live.filter(function (c) { return pins.indexOf(chatKey(c)) >= 0; }) : live).reduce(function (a, c) { return a + (c.unread > 0 ? 1 : 0); }, 0); };
  const setChatF = function (id) { st.chatF = id; st.more = null; try { localStorage.setItem(CHAT_FILTER_KEY, id); } catch (e) {} draw(); };
  let rows = [];
  if (chats) rows = chatList(cf).map(function (c) { return { c: c }; });
  else rows = notifs.filter(function (n) { return inTab(cur, n); }).map(function (n) { return { n: n, t: n.time }; });
  const setTab = function (id) { st.view = id; st.more = null; lcSetAlertsTab(id, true); draw(); };
  // Round 7.41 (Carter: side project vibe): the empty Inbox is a little playful and still says what to do.
  const empty = chats ? ({ dms: uOnly ? "No unread chats. You're on top of it." : "No chats yet. Say hi to someone with New Chat in Create.", requests: "No requests. Nobody's knocking.", pinned: uOnly ? "No unread pinned chats" : "No pinned chats. Pin a chat from its More button.", deleted: "Nothing deleted" }[cf] || "No chats yet. Say hi to someone with New Chat in Create.") : ({ all: "Your Inbox is empty. Enjoy the silence.", unread: "You're all caught up. Go touch grass.", circle: "No Circles alerts yet", thread: "No new replies in threads you follow", reply: "No replies yet", mention: "No mentions yet", like: "No Likes yet", redream: "No Redreams yet", quote: "No Quotes yet", follow: "No new Dreamors yet", deletedDream: "No deleted Dreams" }[cur] || "Nothing here yet");
  return h('div', { className: "pg lc-inbox" },
    h('div', { className: "hdr" },
      h('div', { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "48px 16px 12px" } },
        h('h1', { className: "htit", tabIndex: -1, style: { marginRight: "auto" } }, "Inbox"),
        // Round 7.32 (Carter, Oct 26 2026): Send a message shows only when Chats is selected, not on Alerts.
        chats ? h('button', { type: "button", id: "inbox-send", className: "btn bp", style: { fontSize: 12, padding: "6px 12px" }, onClick: function () { st.compose = { to: "", text: "", msg: "" }; draw(); setTimeout(function () { const t = document.getElementById("pm-to"); if (t) t.focus(); }, 0); } }, "Send a message") : null,
        h('button', { type: "button", id: "inbox-markall", className: "btn bgb", style: { fontSize: 12, padding: "6px 12px" },
          onClick: function () { const n = lcAlertsMarkAll(); const m = Looscid.lcPmMarkRead ? Looscid.lcPmMarkRead(null) : false; announce(n || m ? "All marked as read." : "Nothing to mark."); } }, "Mark all read"),
        h('button', { type: "button", id: "alerts-settings-link", className: "btn bgb", style: { fontSize: 12, padding: "6px 12px" }, onClick: function () { goSet(chats ? "settings_messages" : "settings_notifications"); } }, chats ? "Chats settings" : "Alerts settings"))),
    viewMenu(st, draw, { alerts: unreadN, chats: unreadC }),
    chats ? filterRow("chat-filters", "Chats filters", CHAT_FILTERS, cf, chatCount, setChatF) : filterRow("inbox-filters", "Alerts filters", tabs, cur, count, setTab),
    h('div', { id: "inbox-panel", role: "tabpanel", "aria-labelledby": "inbox-tab-" + (chats ? cf : cur) },
      // Unread is a switch inside DMs and Pinned, not a filter (Carter, Oct 25 2026 4:57 PM).
      chats && (cf === "dms" || cf === "pinned") ? h('div', { className: "lc-row", style: { padding: "8px 16px 0" } },
        h('button', { id: "chats-unread-only", type: "button", role: "switch", className: "lc-sw", "aria-checked": uOnly ? "true" : "false",
            onClick: function () { try { localStorage.setItem(CHAT_UNREAD_ONLY_KEY, uOnly ? "0" : "1"); } catch (e) {} draw(); announce(uOnly ? "Showing all chats." : "Showing unread chats only."); } },
          h('span', { className: "lc-sw-l" }, "Show unread only"),
          h('span', { className: "lc-sw-v", "aria-hidden": "true" }, uOnly ? "On" : "Off", h('span', { className: "lc-knob" })))) : null,
      // Round 7.18 (#148): Manage Followed Threads is the first thing in Followed Threads (it replaces Replies' "Only threads I follow").
      !chats && cur === "thread" ? h('div', { style: { padding: "10px 16px 4px" } }, h('button', { type: "button", id: "inbox-manage-threads", className: "btn bgb lc-btn",
        onClick: function () { st.manage = true; st.more = null; draw(); setTimeout(Looscid.lcFocusHeading, 30); } }, "Manage Followed Threads")) : null,
      chats && pmStateNote() ? h('p', { className: "lc-desc", style: { padding: "8px 16px" } }, pmStateNote()) : null,
      chats && cf === "requests" ? h('div', { className: "lc-pm-held", style: { padding: "8px 16px" } },
        h('p', { className: "lc-desc", id: "pm-held-note" }, "Messages from people Who can message me doesn't allow wait here, silent, until you accept them."),
        h('button', { type: "button", id: "pm-held-settings", className: "btn bgb lc-btn", onClick: function () { goSet("settings_messages"); } }, "Message settings")) : null,
      rows.length === 0
        ? h('div', { className: "es", style: { paddingTop: 24, paddingBottom: 24 } }, h('p', { className: "esl" }, empty))
        : h('ul', { className: "lc-inbox-list", role: "list" }, rows.map(function (r) { return r.c ? convoRow(st, draw, r.c) : notifRow(st, draw, r.n); }))),
    h('div', { style: { height: 72 } }));
}

/* The Alerts tab (the Inbox). The chosen tab is saved on this device. */
const AlertsPage = lcPlainScreen("AlertsPage", function (host) {
  const saved = lcAlertsTab();
  // Round 7.17 (#149): box is the Inbox view (Alerts or Chats), saved on this device; view is the Alerts filter.
  const st = { box: Looscid.lcInboxView ? Looscid.lcInboxView() : "alerts", chatF: chatFilter(), view: saved, convo: null, pm: null, compose: null, more: null, menu: false };
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
  const onBox = function (e) { if (st.box !== e.detail) { st.box = e.detail; st.more = null; st.menu = false; draw(); } };
  window.addEventListener("looscid:inboxview", onBox);
  // Round 7.30: Create, New Chat while the Inbox is already open.
  const onNew = function () { const d = Looscid.LC_PM_OPEN; if (!d || !d.compose) return; Looscid.LC_PM_OPEN = null;
    st.box = "chats"; st.pm = null; st.pmBack = null; st.convo = null; st.manage = false; st.more = null; st.menu = false; st.compose = d.compose; draw(); };
  window.addEventListener("looscid:newchat", onNew);
  const evs = ["looscid:alerts", "looscid:cats", "looscid:pms", "looscid:blocked", "looscid:threadsubs"];
  window.addEventListener("looscid:alertstab", onTab);
  evs.forEach(function (e) { window.addEventListener(e, draw); });
  draw();
  if (Looscid.lcPmCheck) setTimeout(function () { Looscid.lcPmCheck(); if (Looscid.lcInboxCheck) Looscid.lcInboxCheck(); }, 400);
  return {
    update: draw,
    stop: function () { window.removeEventListener("looscid:alertstab", onTab); window.removeEventListener("looscid:inboxview", onBox); window.removeEventListener("looscid:newchat", onNew); evs.forEach(function (e) { window.removeEventListener(e, draw); }); }
  };
});
Looscid.AlertsPage = AlertsPage;

function lcCatList(kind, defs) {
  const st = lcCatState(kind, defs);
  return st.order.map(function (id) { return defs.find(function (d) { return d.id === id; }); }).filter(function (d) { return d && (d.id === "all" || st.hidden.indexOf(d.id) < 0); });
}
function lcAlertTime(t) { const s = Math.round((Date.now() - t) / 1000); return s < 60 ? "just now" : s < 3600 ? Math.floor(s / 60) + " min ago" : s < 86400 ? Math.floor(s / 3600) + " h ago" : new Date(t).toLocaleDateString(); }
function lcAlertToggle(id) { lcAlertsSave(lcAlerts().map(function (x) { return x.id === id ? Object.assign({}, x, { unread: !x.unread }) : x; })); }
function lcAlertsTab() { let v = "all"; try { v = localStorage.getItem(ALERTS_TAB_KEY) || "all"; } catch (e) {} return v === "notifications" || v === "messages" ? "all" : v; }
})(window.Looscid = window.Looscid || {});
