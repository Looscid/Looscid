/* Looscid modreasons.js: moderation reasons. A mod who removes a Dream has to pick or type a reason, and the Dreamor who
   made it sees that reason (on the Dream itself and in Alerts, From Looscid). Nothing here makes a new page: the Remove
   item lives in the Dream's More menu, and the reason shows where the Dream was.

   Adapted from Communities (https://github.com/danielbingham/communities), Nov 8 2026 (Carter: "Use the code from repos
   we couldn't use before"). Taken from:
     packages/shared/schema/SiteModeration.js: the status and reason rules (statuses flagged, approved, rejected; a
       reason is a string shorter than 1024 characters; the ID of the moderated Dream is required).
     packages/backend/services/notification/definitions/SiteModeration/update/post/status/rejected/author.js: what the
       author is told when moderators remove their post.
   Their notice, kept as it is:

 ******************************************************************************
 *
 *  Communities -- Non-profit, cooperative social media
 *  Copyright (C) 2022 - 2024 Daniel Bingham
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 ******************************************************************************

   Changes for Looscid, Copyright (C) 2025-present Looscid, also under the GNU AGPL-3.0-or-later: plain browser code
   instead of Node classes; "post" is "Dream"; a reason is REQUIRED to remove a Dream (Communities lets it be empty);
   the record is kept on this device (localStorage looscid_moderations) and also sent to Rem (POST /moderate), and a
   Dreamor's own removed Dreams are read back from Rem (GET /moderation/<key>) when Rem has them. Rem answering 404
   just means Rem doesn't take moderation yet, and everything still works on this device.
   Nov 8 2026 (Carter: "my removal reasons are public with a public mod log, moderator or admin"): a removal is public. Its
   line ("Removed by the mods of Night Owls. Reason: ..." or "Removed by a Looscid admin. Reason: ...") shows to everyone,
   and it always says whether a Circle's moderators or a Looscid admin did it. The public mod log lists every removal: the
   date, the Dream (a short reference, never its words), moderator or admin, and the reason. Looscid admins' removals come
   from Rem (GET /modlog), so every device sees them; a Circle's removals go to Rem too (Nov 8 2026, signed by the mod; see lcModLoadLog). The log opens
   from a Circle's About tab (Mod log) and in the Help Center (the Mod log article). Nothing here makes a new page. */
(function (Looscid) {
"use strict";
const KEY = "looscid_moderations";
// Communities' SiteModeration statuses. "rejected" is a removed Dream; "approved" puts it back.
const STATUSES = ["flagged", "approved", "rejected"];
const MAX_REASON = 1024; // Communities: reason .mustBeShorterThan(1024)
// The reasons a mod can pick. A Circle's own rules are offered first (see reasonsFor), and a mod can always type one.
const MOD_REASONS = [["spam", "Spam"], ["mean", "Mean or bullying"], ["unsafe", "Unsafe or harmful"], ["offtopic", "Off topic here"], ["private", "Shares someone's private info"]];

// Communities' stringCleaner, for one line of text.
function clean(v) { return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : v; }
// Communities' SiteModerationSchema.validate and SiteModerationValidation, cut down to what a Dream needs. Each error has
// Communities' { type, message } shape.
function validate(m) {
  const errors = [];
  if (!m || (m.dreamId == null || m.dreamId === "")) errors.push({ type: "entityId:missing", message: "Pick the Dream to moderate first." });
  if (!m || typeof m.status !== "string" || !m.status) errors.push({ type: "status:missing", message: "Moderation needs a status." });
  else if (STATUSES.indexOf(m.status) < 0) errors.push({ type: "status:invalid-value", message: "Status must be one of " + STATUSES.join(", ") + "." });
  if (m && m.reason != null && typeof m.reason !== "string") errors.push({ type: "reason:invalid-type", message: "The reason has to be words." });
  else if (m && typeof m.reason === "string" && m.reason.length >= MAX_REASON) errors.push({ type: "reason:too-long", message: "The reason has to be shorter than " + MAX_REASON + " characters." });
  // Looscid's rule (Carter, Nov 7 2026): removing a Dream always says why.
  if (m && m.status === "rejected" && !(typeof m.reason === "string" && m.reason.trim())) errors.push({ type: "reason:missing", message: "Pick a reason or type one. The Dreamor sees it." });
  return errors;
}

function all() { try { const v = JSON.parse(localStorage.getItem(KEY) || "{}"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
function save(m) { try { const ks = Object.keys(m); if (ks.length > 500) ks.sort(function (a, b) { return (m[a].at || 0) - (m[b].at || 0); }).slice(0, ks.length - 500).forEach(function (k) { delete m[k]; }); localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent("looscid:moderations")); } catch (e) {} }
function keysOf(d) { return d ? [d.nid, d.id].filter(function (x) { return x != null && x !== ""; }).map(String) : []; }
// The removal record for a Dream, or null when it isn't removed.
function lcModFor(d) { const m = all(), ks = keysOf(d); for (let i = 0; i < ks.length; i++) { const r = m[ks[i]]; if (r && r.status === "rejected" && !r.logOnly) return r; } return null; }
function isMine(d) { const ME = Looscid.ME, u = d && d.user; if (!u) return false; if (u === ME) return true;
  const h = function (x) { return Looscid.lcHandle ? Looscid.lcHandle(String(x || "")) : String(x || "").replace(/^@/, "").toLowerCase(); };
  return !!(ME && ME.handle && typeof u === "object" && h(u.handle) === h(ME.handle)); }
// Who removed it: "moderator" (a Circle's mods) or "admin" (a Looscid admin, Rem's MODS list). Older records say it by
// having a Circle or not.
function roleOf(r) { return r && (r.role === "moderator" || r.role === "admin") ? r.role : (r && (r.circleName || r.circleId) ? "moderator" : "admin"); }
// Who removed it, in words: "the mods of Night Owls", or "a Looscid admin".
function byWords(r) { return roleOf(r) === "moderator" ? "the mods of " + ((r && r.circleName) || "this Circle") : "a Looscid admin"; }
// What a Dream shows in its place. The author reads "Your Dream was removed"; everyone else reads "Removed".
function lcModText(r, d) {
  if (!r) return "";
  return (isMine(d) ? "Your Dream was removed by " : "Removed by ") + byWords(r) + ". Reason: " + r.reason;
}
// Communities' author notification ("Communities moderators removed your post, "{{postIntro}}...""), in Looscid's words.
function authorAlert(r, d) {
  const intro = String((d && d.text) || "").replace(/\s+/g, " ").trim().slice(0, 40);
  return (roleOf(r) === "moderator" ? (r.circleName || "Circle") + " mods" : "A Looscid admin") + " removed your Dream" + (intro ? ", \u201c" + intro + "\u2026\u201d" : "") + ". Reason: " + r.reason;
}
// The reasons offered for a Dream: the Circle's own rules first, then Looscid's list.
function reasonsFor(circle) {
  const rules = circle && Array.isArray(circle.rules) ? circle.rules.map(function (x) { return clean(typeof x === "string" ? x : x && (x.title || x.t || x.text)); }).filter(Boolean) : [];
  return rules.map(function (t, i) { return ["rule" + i, "Breaks a rule: " + t]; }).concat(MOD_REASONS);
}
// Remove a Dream as a mod. reason is the words the Dreamor will see.
function lcModRemove(d, reason, circle) {
  const ks = keysOf(d);
  const rec = { dreamId: ks[0] || null, status: "rejected", reason: clean(reason), circleId: circle && circle.id != null ? String(circle.id) : null,
    circleName: circle && circle.name ? String(circle.name) : null, role: circle ? "moderator" : "admin", by: Looscid.ME && Looscid.ME.handle ? String(Looscid.ME.handle) : null, at: Date.now() };
  if (circle && myPk()) rec.mod = myPk();
  const errs = validate(rec); if (errs.length) return { ok: false, say: errs[0].message, errors: errs };
  const m = all(); ks.forEach(function (k) { m[k] = rec; }); save(m);
  if (isMine(d) && Looscid.lcNotify) { try { Looscid.lcNotify("system", authorAlert(rec, d), null); } catch (e) {} }
  // Nov 8 2026: a Circle removal goes to Rem too (signed with your key), so your other devices and the public log see it.
  // Without a key it stays on this device, like before. A Looscid admin's removal needs the Dream's Rem id.
  if (circle && rec.circleId && REF_OK.test(rec.circleId) && Looscid.lcNet && Looscid.lcNet.moderate) { const ref = /^[0-9a-f]{64}$/i.test(String(d.nid || "")) ? String(d.nid).toLowerCase() : String(d.id);
    if (REF_OK.test(ref)) { try { Looscid.lcNet.moderate(ref, "remove", rec.reason, { id: rec.circleId, name: rec.circleName || "Circle" }); } catch (e) {} } }
  else if (!circle && Looscid.lcNet && Looscid.lcNet.moderate && /^[0-9a-f]{64}$/i.test(String(d.nid || ""))) { try { Looscid.lcNet.moderate(d.nid, "remove", rec.reason); } catch (e) {} }
  return { ok: true, say: "Removed. " + (isMine(d) ? "You" : (d.user && d.user.name) || "The Dreamor") + " will see the reason: " + rec.reason };
}
// Put a removed Dream back (Communities: status approved).
function lcModRestore(d) {
  const m = all(); let had = false, crec = null; keysOf(d).forEach(function (k) { if (m[k]) { had = true; if (m[k].circleId) crec = m[k]; delete m[k]; } }); if (had) save(m);
  // Nov 8 2026: a Circle removal is taken off Rem too (only the key that made it can).
  if (crec && Looscid.lcNet && Looscid.lcNet.moderate) { const ref = String(crec.dreamId || d.id); if (REF_OK.test(ref) && REF_OK.test(String(crec.circleId))) { try { Looscid.lcNet.moderate(ref, "restore", "", { id: String(crec.circleId), name: crec.circleName || "Circle" }); } catch (e) {} } }
  else if (had && Looscid.lcNet && Looscid.lcNet.moderate && /^[0-9a-f]{64}$/i.test(String(d.nid || ""))) { try { Looscid.lcNet.moderate(d.nid, "restore", ""); } catch (e) {} }
  return had ? "Dream restored." : "This Dream wasn't removed.";
}
// Your own Dreams a Looscid moderator removed on Rem, with the reason, so you see why. Quiet when Rem doesn't have it yet.
let synced = false;
async function lcModSync() {
  if (synced || !Looscid.lcNet || !Looscid.lcNet.moderationFor) return; synced = true;
  let items = null; try { items = await Looscid.lcNet.moderationFor(); } catch (e) { return; }
  if (!Array.isArray(items) || !items.length) return;
  const m = all(); let changed = false;
  items.forEach(function (it) {
    const id = it && String(it.dream_id || ""); if (!/^[0-9a-f]{64}$/i.test(id)) return;
    if (it.status !== "removed") { if (m[id] && m[id].remote) { delete m[id]; changed = true; } return; }
    const reason = clean(String(it.reason || "")); if (!reason) return;
    if (m[id] && m[id].reason === reason) return;
    m[id] = { dreamId: id, status: "rejected", reason: reason.slice(0, MAX_REASON - 1), role: "admin", circleId: null, circleName: null, by: null, at: +it.at || Date.now(), remote: true }; changed = true;
    if (Looscid.lcNotify) { try { Looscid.lcNotify("system", authorAlert(m[id], { text: it.text || "" }), null); } catch (e) {} }
  });
  if (changed) save(m);
}
// Looscid moderators: Rem says which keys may remove Dreams on Rem (GET /moderators). Asked once, only with a key; a Rem
// without the list (404) means nobody sees "Remove from Looscid", and Circle mods still work.
let siteMods = [];
async function loadMods() {
  if (!Looscid.lcNet || !Looscid.lcNet.moderators) return;
  try { const l = await Looscid.lcNet.moderators(); if (Array.isArray(l)) { siteMods = l.map(function (x) { return String(x).toLowerCase(); }); try { window.dispatchEvent(new CustomEvent("looscid:moderations")); } catch (e) {} } } catch (e) {}
}
function lcModIsSiteMod() { const st = Looscid.lcNostr && Looscid.lcNostr.state ? Looscid.lcNostr.state() : null; return !!(st && st.pubkey && siteMods.indexOf(String(st.pubkey).toLowerCase()) >= 0); }
setTimeout(function () { lcModSync(); loadMods(); }, 6000);

/* Nov 8 2026: the public mod log. Rem's GET /modlog lists every Looscid admin's removal (the Dream's id, "admin", the
   reason, when), for everyone. Read at start and when a log is opened (at most once a minute). Each one is kept like a
   removal made here (remote, pub), so the Dream shows its public line on every device. A Dream an admin put back leaves
   Rem's log, and its line goes. A Rem without /modlog (404) changes nothing. Circle mods' removals come too (below). */
const LOG_LIMIT = 200;
let logAt = 0, logP = null;
/* Nov 8 2026 (Carter: "every single change should be everywhere"): Circle mods' removals go to Rem too (POST /moderate
   with ["scope","circle"], signed by the mod's key), and the log is read with ?scope=all, so they reach every device.
   Rem can't check who runs a Circle (Circles live on their owner's devices), so a Circle is its mod's key plus its id:
   - a Circle removal signed by your own key (made on your other phone or computer) is kept like one made here: the
     Dream shows its public line and the Circle's Mod log lists it;
   - one signed by the key that made a Circle you have (its ownerPk) counts the same way;
   - any other Circle removal is only listed in the Looscid-wide log in the Help Center (logOnly). It never changes how a
     Dream shows, so nobody can mark someone else's Dream "removed" with a key of their own. */
function myPk() { const st = Looscid.lcNostr && Looscid.lcNostr.state ? Looscid.lcNostr.state() : null; return st && st.pubkey ? String(st.pubkey).toLowerCase() : ""; }
function circleTrusted(it) {
  const mod = String(it.mod || "").toLowerCase(); if (!/^[0-9a-f]{64}$/.test(mod)) return false;
  if (mod === myPk()) return true;
  const G = Looscid.GROUPS || []; return G.some(function (g) { return g && String(g.id) === String(it.circle_id) && String(g.ownerPk || "").toLowerCase() === mod; });
}
const REF_OK = /^[A-Za-z0-9_.:-]{1,64}$/;
function lcModLoadLog(force) {
  if (!Looscid.lcNet || !Looscid.lcNet.modlog) return Promise.resolve(false);
  if (logP && !force && Date.now() - logAt < 60000) return logP;
  logAt = Date.now();
  logP = Promise.resolve().then(function () { return Looscid.lcNet.modlog(LOG_LIMIT, "all"); }).then(function (items) {
    if (!Array.isArray(items)) return false;
    const m = all(), seen = {}; let changed = false;
    const put = function (k, rec) { seen[k] = true; const cur = m[k];
      if (cur && !cur.remote && cur.status === "rejected") return; // made on this device: kept as it is
      if (cur && cur.pub && cur.reason === rec.reason && cur.role === rec.role && cur.at === rec.at && cur.circleId === rec.circleId && !!cur.logOnly === !!rec.logOnly) return;
      m[k] = rec; changed = true; };
    items.forEach(function (it) {
      const reason = clean(String((it && it.reason) || "")); if (!reason) return;
      const at = +it.at || 0;
      if (it.scope === "circle") {
        const ref = String(it.dream_id || ""), cid = String(it.circle_id || ""); if (!REF_OK.test(ref) || !REF_OK.test(cid)) return;
        const rec = { dreamId: ref, status: "rejected", reason: reason.slice(0, MAX_REASON - 1), role: "moderator", circleId: cid,
          circleName: clean(String(it.circle_name || "")).slice(0, 100) || null, by: null, mod: String(it.mod || "").toLowerCase(), at: at || Date.now(), remote: true, pub: true };
        if (circleTrusted(it)) put(ref, rec); else { rec.logOnly = true; put("log:" + rec.mod + ":" + cid + ":" + ref, rec); }
        return;
      }
      const id = String((it && it.dream_id) || "").toLowerCase(); if (!/^[0-9a-f]{64}$/.test(id)) return;
      const role = it.by === "moderator" ? "moderator" : "admin";
      put(id, { dreamId: id, status: "rejected", reason: reason.slice(0, MAX_REASON - 1), role: role, circleId: null, circleName: null, by: null, at: at || Date.now(), remote: true, pub: true });
    });
    if (items.length < LOG_LIMIT) Object.keys(m).forEach(function (k) { const r = m[k]; if (r && r.pub && !seen[k]) { delete m[k]; changed = true; } });
    if (changed) save(m);
    return true;
  }, function () { return false; });
  return logP;
}
// A short reference to a Dream, never its words: "Dream 3fa2b1c9".
function refOf(id) { const s = String(id == null ? "" : id); return "Dream " + (/^[0-9a-f]{64}$/i.test(s) ? s.slice(0, 8).toLowerCase() : s.slice(-8)); }
// The log, newest first. circleId: only that Circle's removals; none: every removal this device knows (Looscid-wide).
function lcModLog(circleId) {
  const m = all(), seen = {}, out = [];
  Object.keys(m).forEach(function (k) {
    const r = m[k]; if (!r || r.status !== "rejected") return;
    const id = String(r.dreamId != null ? r.dreamId : k), key = id + "|" + (r.at || 0); if (seen[key]) return; seen[key] = true;
    if (circleId != null && (r.logOnly || String(r.circleId) !== String(circleId))) return; // a Circle's log: only its own mods' removals
    out.push({ dreamId: id, ref: refOf(id), role: roleOf(r), circleName: r.circleName || null, reason: r.reason, at: +r.at || 0 });
  });
  return out.sort(function (a, b) { return b.at - a.at; });
}
// One log entry as one line, read in one swipe: "Nov 8, 2026: Dream 3fa2b1c9 was removed by a Looscid admin. Reason: Spam"
function lcModLogText(e) {
  let when = ""; try { when = e.at ? new Date(e.at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""; } catch (x) {}
  return (when ? when + ": " : "") + e.ref + " was removed by " + (e.role === "moderator" ? "a moderator of " + (e.circleName || "this Circle") : "a Looscid admin") + ". Reason: " + e.reason;
}
setTimeout(function () { lcModLoadLog(); }, 7000);

Object.assign(Looscid, { LC_MOD_KEY: KEY, LC_MOD_REASONS: MOD_REASONS, LC_MOD_MAX_REASON: MAX_REASON, lcModValidate: validate, lcModFor: lcModFor, lcModText: lcModText,
  lcModReasonsFor: reasonsFor, lcModRemove: lcModRemove, lcModRestore: lcModRestore, lcModSync: lcModSync, lcModIsMine: isMine, lcModIsSiteMod: lcModIsSiteMod, lcModLoadMods: loadMods,
  lcModRole: roleOf, lcModLog: lcModLog, lcModLogText: lcModLogText, lcModLoadLog: lcModLoadLog });
})(window.Looscid = window.Looscid || {});
