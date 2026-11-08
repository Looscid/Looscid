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
   just means Rem doesn't take moderation yet, and everything still works on this device. */
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
function lcModFor(d) { const m = all(), ks = keysOf(d); for (let i = 0; i < ks.length; i++) { const r = m[ks[i]]; if (r && r.status === "rejected") return r; } return null; }
function isMine(d) { const ME = Looscid.ME, u = d && d.user; if (!u) return false; if (u === ME) return true;
  const h = function (x) { return Looscid.lcHandle ? Looscid.lcHandle(String(x || "")) : String(x || "").replace(/^@/, "").toLowerCase(); };
  return !!(ME && ME.handle && typeof u === "object" && h(u.handle) === h(ME.handle)); }
// Who removed it, in words: "the mods of Night Owls", or "a Looscid moderator".
function byWords(r) { return r && r.circleName ? "the mods of " + r.circleName : "a Looscid moderator"; }
// What a Dream shows in its place. The author reads "Your Dream was removed"; everyone else reads "Removed".
function lcModText(r, d) {
  if (!r) return "";
  return (isMine(d) ? "Your Dream was removed by " : "Removed by ") + byWords(r) + ". Reason: " + r.reason;
}
// Communities' author notification ("Communities moderators removed your post, "{{postIntro}}...""), in Looscid's words.
function authorAlert(r, d) {
  const intro = String((d && d.text) || "").replace(/\s+/g, " ").trim().slice(0, 40);
  return (r.circleName ? r.circleName + " mods" : "A Looscid moderator") + " removed your Dream" + (intro ? ", \u201c" + intro + "\u2026\u201d" : "") + ". Reason: " + r.reason;
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
    circleName: circle && circle.name ? String(circle.name) : null, by: Looscid.ME && Looscid.ME.handle ? String(Looscid.ME.handle) : null, at: Date.now() };
  const errs = validate(rec); if (errs.length) return { ok: false, say: errs[0].message, errors: errs };
  const m = all(); ks.forEach(function (k) { m[k] = rec; }); save(m);
  if (isMine(d) && Looscid.lcNotify) { try { Looscid.lcNotify("system", authorAlert(rec, d), null); } catch (e) {} }
  if (Looscid.lcNet && Looscid.lcNet.moderate && /^[0-9a-f]{64}$/i.test(String(d.nid || ""))) { try { Looscid.lcNet.moderate(d.nid, "remove", rec.reason); } catch (e) {} }
  return { ok: true, say: "Removed. " + (isMine(d) ? "You" : (d.user && d.user.name) || "The Dreamor") + " will see the reason: " + rec.reason };
}
// Put a removed Dream back (Communities: status approved).
function lcModRestore(d) {
  const m = all(); let had = false; keysOf(d).forEach(function (k) { if (m[k]) { had = true; delete m[k]; } }); if (had) save(m);
  if (had && Looscid.lcNet && Looscid.lcNet.moderate && /^[0-9a-f]{64}$/i.test(String(d.nid || ""))) { try { Looscid.lcNet.moderate(d.nid, "restore", ""); } catch (e) {} }
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
    m[id] = { dreamId: id, status: "rejected", reason: reason.slice(0, MAX_REASON - 1), circleId: null, circleName: null, by: null, at: +it.at || Date.now(), remote: true }; changed = true;
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

Object.assign(Looscid, { LC_MOD_KEY: KEY, LC_MOD_REASONS: MOD_REASONS, LC_MOD_MAX_REASON: MAX_REASON, lcModValidate: validate, lcModFor: lcModFor, lcModText: lcModText,
  lcModReasonsFor: reasonsFor, lcModRemove: lcModRemove, lcModRestore: lcModRestore, lcModSync: lcModSync, lcModIsMine: isMine, lcModIsSiteMod: lcModIsSiteMod, lcModLoadMods: loadMods });
})(window.Looscid = window.Looscid || {});
