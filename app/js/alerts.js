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
/* Nov 9 2026 (Carter, 5:43 PM: follow from anywhere, counts move right away): a "followed you" alert can follow them back.
   The same follow as their profile; once you follow, the item reads Unfollow. */
function alertFollowItem(n) {
  const u = n && n.type === "follow" ? n.user : null; if (!u || !Looscid.lcFollowToggle) return null;
  const id = u.id != null ? u.id : (u.pk ? "nostr:" + u.pk : null); if (id == null) return null;
  const who = Object.assign({}, u, { id: id }), nm = u.name || (u.handle ? "@" + String(u.handle).replace(/^@/, "") : "them"), on = Looscid.lcFollowingHas(id);
  return [on ? "Unfollow " + nm : "Follow back", function () { Looscid.lcFollowToggle(who); announce(on ? "Unfollowed " + nm + "." : "Following " + nm + "."); }];
}
function blockWho(user) {
  if (!user || !user.handle) return null;
  return ["Block " + user.name, function () { const l = Looscid.lcBlocked("dreamers"); Looscid.lcBlockedSet("dreamers", l.concat([user.handle])); announce("Blocked " + user.name + ". You won't see their Dreams, alerts or messages."); }];
}
function alertMuteItem(n) {
  const refs = [n.thread, n.root, n.ref].filter(function (x) { return x != null && x !== ""; }).map(String);
  if (!refs.length || !Looscid.lcThreadMuted || !Looscid.lcThreadMuteToggle) return null;
  const on = Looscid.lcThreadMuted(refs);
  return [on ? "Unmute this conversation" : "Mute this conversation", function () {
    if (on) { const l = Looscid.lcThreadMuted; refs.concat(n.nid ? [String(n.nid)] : []).forEach(function (r) { if (l(r)) Looscid.lcThreadMuteToggle({ id: r }); }); announce("Unmuted this conversation. Its alerts come back."); }
    else announce(Looscid.lcThreadMuteToggle({ _root: refs[0], nid: n.nid && n.nid !== refs[0] ? n.nid : undefined })); }];
}
/* Nov 9 2026 (Carter, 4:08 PM: "in the Alerts tab, when clicking on an item, I don't go to that item"). The bug: the row
   was a button that only marked the alert read, and most alerts didn't even keep what they were about. Now every alert
   keeps its target (lcAlertKeep in core.js) and each row is one real link:
   - Its words are one sentence, who, what and when ("Jeff liked your Dream “just dreaming”, 2 hours ago."). The same words
     are on screen and in VoiceOver, with no label on top of them, so nothing is read twice. Unread ones start with "New:".
   - Tapping it (VoiceOver double-tap, Enter or a click) marks it read and opens what it's about, with focus on that
     page's heading: a like, Redream, reply, quote or mention opens the Dream in Replies (a reply opens the reply itself,
     with Expand thread for the rest), a new Dreamor opens their profile, a Circle opens the Circle, a mod alert opens the
     Dream, a report opens the Report Center.
   - Back comes back to Alerts with focus on the same alert.
   An alert that isn't about anything you can open stays a button that marks it read, like before. */
const ALERT_HEX = /^[0-9a-f]{64}$/i;
function alertHex(k) { const s = String(k || "").replace(/^n:/, ""); return ALERT_HEX.test(s) ? s.toLowerCase() : ""; }
/* Nov 9 2026 (Carter: "it takes long for the Alert to load"): every alert used to read all your saved replies from storage
   and look through all your Dreams one by one, so a long Alerts list did that work hundreds of times on every redraw.
   Now the list of your Dreams and replies, and an index by id, is built once and reused for a second (or until your
   replies change). */
let alertPoolCache = null;
window.addEventListener("looscid-replies", function () { alertPoolCache = null; });
function alertPoolIndex() {
  const src = Looscid.LC_APP_DREAMS || [];
  if (alertPoolCache && alertPoolCache.src === src && Date.now() - alertPoolCache.at < 1000) return alertPoolCache;
  let reps = []; try { reps = Looscid.lcRepliesRaw && Looscid.lcReplyObj ? Looscid.lcRepliesRaw().map(Looscid.lcReplyObj) : []; } catch (e) {}
  const list = src.concat(reps), byId = {};
  list.forEach(function (x) { if (!x || x.id == null) return; const id = String(x.id), nid = alertHex(x.nid), h = alertHex(id);
    [id, h && "h:" + h, nid && "h:" + nid].forEach(function (k) { if (k && !byId[k]) byId[k] = x; }); });
  alertPoolCache = { src: src, at: Date.now(), list: list, byId: byId };
  return alertPoolCache;
}
function alertPool() { return alertPoolIndex().list; }
let alertPkCache = null;
function alertMyPk() { if (alertPkCache && Date.now() - alertPkCache.at < 1000) return alertPkCache.pk; const pk = Looscid.lcNostr && Looscid.lcNostr.state ? Looscid.lcNostr.state().pubkey : ""; alertPkCache = { at: Date.now(), pk: pk }; return pk; }
// A Dream on this device by its id, its Rem or Nostr id, or "n:" + that id.
function alertFindLocal(key) {
  if (key == null || key === "") return null;
  const k = String(key), hx = alertHex(k), ix = alertPoolIndex().byId;
  return ix[k] || (hx && ix["h:" + hx]) || null;
}
function alertGo(n) { return Object.assign({ pk: n.pk, ref: n.ref, nid: n.nid, thread: n.thread }, n.go || {}); }
// What tapping this alert opens, or null when it isn't about anything you can open.
function alertTarget(n) {
  const g = alertGo(n);
  if (n.report) return { kind: "report" };
  if (g.page) return { kind: "page", page: g.page, data: g.data || null };
  if (n.type === "follow") { const w = g.who || n.user; return w && (w.pk || w.id || g.pk) ? { kind: "person", who: w, pk: g.pk || w.pk || w.id } : null; }
  if (n.type === "deletedDream") return null; // that Dream is gone; there's nothing left to open
  let key = null, alt = null;
  const myPk = alertMyPk();
  if (n.type === "like" || n.type === "redream") { key = g.ref || g.dream || g.nid; if (key) return { kind: "dream", key: String(key), alt: null, pk: myPk || "", mine: true }; }
  else { key = g.dream || g.nid; alt = g.thread || g.ref; if (!key) { key = alt; alt = null; } }
  if (key) return { kind: "dream", key: String(key), alt: alt ? String(alt) : null, pk: g.pk || (g.who && (g.who.pk || g.who.id)) || "" };
  if (g.circle) return { kind: "circle", circle: g.circle };
  return null;
}
function alertWhen(t) {
  const s = Math.max(0, Math.round((Date.now() - t) / 1000)), many = function (n, w) { return n + " " + w + (n === 1 ? "" : "s") + " ago"; };
  if (s < 60) return "just now";
  if (s < 3600) return many(Math.floor(s / 60), "minute");
  if (s < 86400) return many(Math.floor(s / 3600), "hour");
  if (s < 2 * 86400) return "yesterday";
  if (s < 7 * 86400) return many(Math.floor(s / 86400), "day");
  const d = new Date(t), o = { month: "long", day: "numeric" }; if (d.getFullYear() !== new Date().getFullYear()) o.year = "numeric";
  try { return "on " + d.toLocaleDateString("en-US", o); } catch (e) { return "on " + d.toDateString(); }
}
function alertCut(t, n) { const s = String(t || "").replace(/\s+/g, " ").trim(); return Looscid.lcCutWords ? Looscid.lcCutWords(s, n) : s.slice(0, n); }
function alertQuote(t, n) { const s = alertCut(t, n || 80); return s ? "\u201c" + s + "\u201d" : ""; }
// The name of your Dream an alert is about, from this device: "your Dream “just dreaming”".
function alertYourDream(key) { const d = alertFindLocal(key), q = d && !d.cw ? alertQuote(d.text, 40) : ""; return "your Dream" + (q ? " " + q : ""); }
function alertSentence(n) {
  const T = alertType(n.type), c = n.count || 1, g = alertGo(n);
  const names = n.names && n.names.length ? n.names : n.user && n.user.name ? [n.user.name] : [];
  const who = (names[0] || (n.user && n.user.handle) || "Someone") + (c > 1 ? " and " + (c - 1) + (c - 1 === 1 ? " other" : " others") : "");
  const refs = Array.isArray(n.refs) ? n.refs.length : 1, one = c === 1, p = one ? alertQuote(n.preview) : "";
  const when = alertWhen(n.time);
  let s;
  if (n.type === "system" || n.type === "deletedDream" || !T.id) {
    let t = String(n.text || "").trim(); if (n.preview && n.type === "system") t = t.replace(/[.!?]$/, "") + ": " + alertQuote(n.preview);
    if (!/[.!?\u2026]$/.test(t)) t += ".";
    s = (n.type === "deletedDream" ? "" : "From Looscid, ") + (n.type === "deletedDream" ? t.replace(/[.]$/, "") + ", " + when + "." : when + ": " + t);
    return (n.unread ? "New: " : "") + s;
  }
  const yours = refs > 1 ? refs + " of your Dreams" : alertYourDream(n.type === "like" || n.type === "redream" ? (g.ref || g.dream || g.nid) : (g.ref || g.thread));
  if (n.type === "like") s = who + " liked " + yours;
  else if (n.type === "redream") s = who + " redreamed " + yours;
  else if (n.type === "quote") s = who + " quoted " + yours + (p ? " and said " + p : "");
  else if (n.type === "reply" && n.sub) s = who + " replied" + (p ? " " + p : "") + " in " + (one ? "a thread" : "threads") + " you follow";
  else if (n.type === "reply") s = who + " replied" + (p ? " " + p : "") + " to " + yours;
  else if (n.type === "mention") s = who + " mentioned you" + (p ? " in " + p : "");
  else if (n.type === "newDream") s = who + (p ? " dreamed " + p : " dreamed new Dreams");
  else if (n.type === "follow") s = who + " followed you";
  else s = who + " " + (T.one || n.text || "");
  return (n.unread ? "New: " : "") + s + ", " + when + ".";
}
// The person a follow alert is about, shaped like every other profile.
function alertPerson(t) {
  const w = t.who || {}, pk = alertHex(t.pk) || alertHex(w.pk) || alertHex(w.id), ME = Looscid.ME || {};
  if (pk && alertMyPk() === pk) return ME;
  const known = (Looscid.USERS || []).find(function (u) { return u && ((pk && (String(u.pk || "").toLowerCase() === pk || u.id === "npub:" + pk || u.id === "nostr:" + pk)) || (!pk && w.id && u.id === w.id)); });
  if (known) return known;
  let np = ""; try { np = Looscid.lcNpub && pk ? Looscid.lcNpub(pk) : ""; } catch (e) {}
  const short = String(np || pk || w.handle || "dreamor").slice(0, 14);
  return { id: pk ? "npub:" + pk : String(w.id || short), pk: pk || undefined, name: w.name || short, handle: "@" + short, net: "looscid" };
}
/* A Dream that isn't on this device. Nov 9 2026 (Carter: "it takes long for the Alert to load"): tapping one used to wait
   for Rem, then the Nostr relays, for up to 5 seconds before anything opened. Now the Dream opens right away with what
   the alert already knows (who and the words it showed), and the full Dream is looked up in the background: Rem first
   (the author's public Dreams), then Nostr. When it arrives it quietly replaces the quick copy in the open Dream (same
   place, same focus, nothing announced). A Dream found once is kept for the rest of the visit, so it opens complete next time. */
const alertDreamCache = {};
function alertMine(n, t, d) { if (!d) return d; if (t.mine) d.user = Looscid.ME; else if (d.user && n.user && n.user.name) d.user = Object.assign({}, d.user, { name: n.user.name }); return d; }
function alertQuickDream(n, t) {
  const hx = alertHex(t.key) || alertHex(t.alt), pk = alertHex(t.pk), PubD = Looscid.lcPubDream;
  const u = !t.mine && n.user ? alertPerson({ who: n.user, pk: t.pk }) : null;
  const base = PubD ? PubD({ id: hx || t.key, nid: hx || undefined, pk: pk || "", npub: "", text: n.preview || "", created: n.time }) : { id: t.key, text: n.preview || "", created: n.time, likes: 0, comments: 0, redreams: 0, quotes: 0 };
  if (!hx) base.id = t.key; if (u) base.user = u; base.sigOk = false; base.quick = true; return alertMine(n, t, base); // nothing was checked, so no Verified badge
}
function alertLookup(n, t) {
  const hx = alertHex(t.key) || alertHex(t.alt), pk = alertHex(t.pk), NetD = Looscid.lcNetDream, PubD = Looscid.lcPubDream;
  if (!hx) return Promise.resolve(null);
  if (alertDreamCache[hx]) return Promise.resolve(alertDreamCache[hx]);
  const viaRem = function () { if (!pk || !Looscid.lcNet || !Looscid.lcNet.userDreams || !NetD) return Promise.resolve(null);
    return Looscid.lcNet.userDreams(pk).then(function (l) { const r = (l || []).find(function (x) { return x && (String(x.id).toLowerCase() === hx || String(x.nid || "").toLowerCase() === hx); }); return r ? alertMine(n, t, NetD(r)) : null; }, function () { return null; }); };
  const viaNostr = function () { const N = Looscid.lcNostr; if (!N || !N.fetchByIds || !PubD) return Promise.resolve(null);
    return N.fetchByIds([hx]).then(function (m) { const ev = m && m[hx]; if (!ev) return null; let np = ""; try { np = Looscid.lcNpub ? Looscid.lcNpub(ev.pubkey) : ""; } catch (e) {}
      return alertMine(n, t, PubD({ id: ev.id, nid: ev.id, pk: ev.pubkey, npub: np, text: ev.content, created: ev.created_at * 1000, tags: ev.tags })); }, function () { return null; }); };
  const timeout = new Promise(function (ok) { setTimeout(function () { ok(null); }, 15000); }); // slow relays: give up quietly
  return Promise.race([viaRem().then(function (d) { return d || viaNostr(); }), timeout]).then(function (d) { if (d) alertDreamCache[hx] = d; return d || null; }, function () { return null; });
}
let alertOpenSeq = 0;
function alertOpen(n, t, elId) {
  const nav = Looscid.LC_NAV; if (!nav) return;
  const seq = ++alertOpenSeq; // the newest tap wins
  if (n.unread) lcAlertToggle(n.id);
  Looscid.LC_ALERTS_RETURN = { el: elId, at: Date.now() }; // Back lands on this alert again (AlertsPage)
  const back = function () { Looscid.LC_ALERTS_RETURN = { el: elId, at: Date.now() }; nav("alerts"); };
  if (t.kind === "report") { if (Looscid.lcOpenReport) Looscid.lcOpenReport({}); return; }
  // A page (About, your key): its Back works like a footer link's, back to the tab you were on (here, Alerts).
  if (t.kind === "page") { Looscid.lcFooterCv = null; Looscid.lcFooterHop = null; Looscid.lcFooterLink = null; Looscid.lcFooterFrom = t.page === "nostr_key" ? "settings_account" : t.page;
    if (t.page === "nostr_key" && Looscid.lcOpenNostrKey) Looscid.lcOpenNostrKey(nav); else nav(t.page, t.data || undefined); return; }
  if (t.kind === "circle") { nav("groups", { circle: t.circle }); return; }
  if (t.kind === "person") { const u = alertPerson(t); if (u === Looscid.ME) { nav("profile"); return; } Looscid.LC_DP_BACK_NEXT = { user: u, back: back }; nav("dp", u); return; }
  const go = function (d) { if (seq !== alertOpenSeq || !document.getElementById(elId)) return; // you tapped something else, or left Alerts
    Looscid.LC_FEED_OPEN = { dream: d, back: back }; nav("feed"); };
  const local = alertFindLocal(t.key), parent = t.alt ? alertFindLocal(t.alt) : null;
  if (local) { go(local); return; }
  // Not on this device (a reply, a quote or a mention from someone else). A reply keeps its thread, so Expand thread
  // shows the Dream it answers.
  if (!alertHex(t.key) && parent) { go(parent); return; }
  const thread = function (d) { if (d && parent && d.replyTo == null && String(d.id) !== String(parent.id)) d.replyTo = parent.id; return d; };
  const hx = alertHex(t.key) || alertHex(t.alt), have = hx && alertDreamCache[hx];
  const first = thread(Object.assign({}, have || alertQuickDream(n, t)));
  go(first);
  if (have || !hx) return;
  alertLookup(n, t).then(function (d) {
    if (!d) return; // not found anywhere: the quick copy stays
    const full = thread(Object.assign({}, d)); full.id = first.id; // same id, so the open Dream updates in place
    try { window.dispatchEvent(new CustomEvent("looscid:dreamfill", { detail: { id: first.id, dream: full } })); } catch (e) {}
  });
}
// The hint after the sentence (the app's tips, a title): where it goes, said in a few words.
function alertTip(t) { return t.kind === "person" ? "Opens their profile" : t.kind === "report" ? "Opens the Report Center" : t.kind === "circle" ? "Opens the Circle" : t.kind === "page" ? (t.page === "settings_about" ? "Opens About Looscid" : "Opens Settings") : "Opens the Dream"; }
function alertHref(t) {
  if (t && t.kind === "person" && Looscid.lcPathFor) { const p = Looscid.lcPathFor("dp", alertPerson(t)); if (p) return p; }
  if (t && t.kind === "report" && Looscid.lcPathFor) { const p = Looscid.lcPathFor("report_center"); if (p) return p; }
  return null;
}
function notifRow(st, draw, n) {
  const key = "n-" + String(n.id).replace(/[^a-z0-9-]/gi, ""), elId = "alert-" + key;
  const canReply = n.type === "reply" || n.type === "mention" || n.type === "quote";
  const t = alertTarget(n), words = alertSentence(n);
  const main = t
    ? h('a', { id: elId, className: "lc-ni-main", title: alertTip(t), href: alertHref(t) || ((Looscid.lcPathFor && Looscid.lcPathFor("alerts")) || "") + "#" + elId,
        onClick: function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return; e.preventDefault(); alertOpen(n, t, elId); } }, words)
    : h('button', { type: "button", id: elId, className: "lc-ni-main", title: n.unread ? "Marks it read" : "Already read", onClick: function () { if (n.unread) { lcAlertToggle(n.id); announce("Marked as read."); } } }, words);
  return h('li', { key: key, className: "ni" + (n.unread ? " unr" : "") },
    // The picture is for eyes only; a tap on it does what tapping the sentence does.
    h('div', { className: "lc-ni-av", "aria-hidden": "true", onClick: function () { const m = document.getElementById(elId); if (m) m.click(); } }, n.user ? lcAvEl(n.user, 40) : h('div', { className: "lc-ni-ic" }, "!")),
    main,
    n.unread && h('div', { className: "lc-ni-dot", "aria-hidden": "true" }),
    rowMore(st, draw, key, alertWhat(n), [
      canReply ? ["Reply", function () {
        if (n.nid && n.user) Looscid.lcCompose({ mode: "reply", parent: { id: n.nid, nid: n.nid, user: n.user, text: n.preview || "" }, root: n.ref ? { id: n.ref, nid: n.ref, user: Looscid.ME } : undefined });
        else Looscid.lcCompose({ mode: "new", text: n.user && n.user.handle ? "@" + String(n.user.handle).replace(/^@/, "") + " " : "" }); }] : null,
      // Nov 8 2026: an Alert about one of ur reports (js/reportcenter.js) opens the Report Center.
      n.report && Looscid.lcOpenReport ? ["Open Report Center", function () { if (n.unread) lcAlertToggle(n.id); Looscid.lcOpenReport({}); }] : null,
      [n.unread ? "Mark read" : "Mark unread", function () { lcAlertToggle(n.id); announce(n.unread ? "Marked as read." : "Marked as unread."); }],
      // Round 7.18 (#148): an alert from a followed thread can unfollow it right here.
      n.thread && Looscid.lcThreadSubbed && Looscid.lcThreadSubbed(n.thread) ? ["Unfollow Thread", function () { Looscid.lcThreadUnsub(n.thread); announce("Unfollowed this thread."); }] : null,
      // Oct 31 2026 (Carter): Mute this conversation is here too, the same switch as in a Dream's More menu (kept on this device).
      alertMuteItem(n),
      alertFollowItem(n),
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
      [Looscid.lcChatMuted && Looscid.lcChatMuted(ck) ? "Unmute this conversation" : "Mute this conversation", function () { const on = Looscid.lcChatMuteToggle(ck); announce(on ? "Muted the chat with " + c.name + ". New messages won't be said or make a sound." : "Unmuted the chat with " + c.name + "."); }],
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
  const evs = ["looscid:alerts", "looscid:cats", "looscid:pms", "looscid:blocked", "looscid:threadsubs", "looscid-nostr", "looscid:follow"]; // Nov 9 2026: + looscid:follow, so Follow back / Unfollow is never stale; // Oct 31 2026: looscid-nostr, so "Unlock your key" goes away the moment it's unlocked
  window.addEventListener("looscid:alertstab", onTab);
  evs.forEach(function (e) { window.addEventListener(e, draw); });
  // Nov 9 2026: coming back from something an alert opened, focus goes back to that same alert (not the heading).
  const ret = Looscid.LC_ALERTS_RETURN; Looscid.LC_ALERTS_RETURN = null;
  if (ret && ret.el && Date.now() - ret.at < 30 * 60000) { st.box = "alerts"; st.more = null; }
  draw();
  if (ret && ret.el && Date.now() - ret.at < 30 * 60000) { let k = 0; const back = function () {
    const el = document.getElementById(ret.el), ae = document.activeElement;
    if (el && el !== ae && (!ae || ae === document.body || !ae.isConnected || ae.tagName === "H1")) { el.focus(); try { el.scrollIntoView({ block: "center" }); } catch (e) {} }
    if (++k < 30) setTimeout(back, 50); }; setTimeout(back, 30); }
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
