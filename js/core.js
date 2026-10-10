/* Looscid core.js: state, prefs, icons, nav, routing, sounds and shared helpers; App() is the frame.
   Plain script (not a module). Everything it shares goes on window.Looscid; see FILES.md for the load order. */
(function (Looscid) {
Object.assign(Looscid, { lcNewId, lcRepliesRaw, lcRepliesFor, lcAddReply, lcRepliesChanged, useRepliesTick, lcCompose, lcLinkCard, LinkCard, ReplyItem, lcLoadDreams, lcMergeDreams, lcSyncOwnDreams, useSavedDreams, _optionalChain, getDrafts, saveDraftItem, getSavedTheme, saveTheme, applyTheme, getOnboardingSeen, setOnboardingSeen, resetOnboarding, getLinkInfo, useDreams, Av, ChkMark, Cbx, Modal, lcThreadOf, lcHearThread, DreamExtra, lcTranslate, lcShareText, DreamOptionsMenu, BackHeader, DreamText, SiteEmbed, CommentItem, CommentView, DreamCard, lcCatState, useCats, lcAlertCats, lcResetKeyItems, lcLsDel, lcResetModel, lcOpenReset, LcResetHost, lcAiOn, lcSettingIndex, lcFindSettings, lcGoSetting, LcSettingFind, sanitizeInput, makeLocalProfile, saveLocalProfile, getLocalProfile, applyLocalProfileToMe, ensureLocalProfile, renameLocalProfile, resetLocalProfile, getAnalyticsConsent, setAnalyticsConsent, AnalyticsBanner, getWelcomeSeen, setWelcomeSeen, getAIPrefs, setAIPrefs, getActiveAI, getHabits, recordHabit, getPredictions, spellCheck, applySpellFix, detectAutoLinks, getAttribPref, HabitInsightCard, MainMenu, lcVerb, lcHints, announce, useEnterSubmit, updateLocalProfile, LcMenu, lcViewLimits, lcAnnounceCount, MenuPopupButton, getIdentity, setIdentity, getMethods, saveMethods, addMethod, getActivity, logActivity, getSessions, setSession, removeMethod, setStoredNostrSk, signOutIdentity, loadNostrTools, bytesToHex, hexToBytes, shortNpub, identityLabel, SecretField, NostrPanel, b64url, randomToken, pkceChallenge, appRedirectUri, normalizeHost, startMastodonLogin, startFunkwhaleLogin, startHubzillaLogin, lidOAuthIdentity, finishOAuthIfReturning, useOAuthReturn, MastodonPanel, LidOAuthPanel, FunkwhalePanel, HubzillaPanel, resolvePds, BlueskyPanel, AlertDialog, LooscidIDChooser, getTopics, TopicPicker, LooscidOnboarding, lcSectionKeys, lcSectionDefaults, lcSrName, lcSectionTitle, lcSet, lcValueText, lcTimeSpoken, lcWords, lcQuietNow, lcAutoplayAllowed, lcHapticsSupported, lcBuzz, lcEmojiName, lcSpeechText, lcBrailleText, lcTimeParts, lcDreamKind, lcDreamWords, lcFiltered, lcDreamSpeechParts, lcIdb, lcIdbDo, lcCurrentDream, lcLoadCustomPack, lcUpdateAuto, lcFetchVersion, lcCheckUpdate, lcApplyUpdate, LcUpdateBanner, lcVersionLabel, lcReleasedText, loadA11y, saveA11y, a11yAsked, setA11yAsked, systemReducedMotion, motionReduced, a11yEnterSends, lcCloseProps, lcPcOn, lcPackChime, lcPitchCue, lcPcKindOf, areaOfPage, musicFind, lcLev, lcSectionReport, lcFindSection, lcParseTime, lcRegistryIntent, lcTranslateOk, lcA11yReport, lcA11yIntent, lcFeedFind, lcFeedMode, lcFeedLabel, lcSetFeed, lcStepFeed, lcAudCustom, lcHandle, lcAudienceOk, lcBlocked, lcBlockedSet, lcBlockedUser, lcWordHit, LcBlockedHidden, lcAlertPrefs, lcAlerts, lcAlertsSave, lcNotify, lcAlertsMarkAll, useAlerts, lcVersionAlert, lcSetAlertsTab, lcSetShowFriends, lcFeedIntent, lcApplyFeedIntent, lcAppItems, lcNorm, lcClosestPlace, lcHistory, lcPushHistory, lcSpoken, lcExtraIntent, lcRun, lcTrapTab, useCmdHistory, useKeyboardInset, LcCmdLog, CommandBar, lcLogSave, lcLogAdd, lcLogClear, useCmdLog, lcBrowserName, lcStorageKB, lcNexosSettings, lcNexosSend, lcNexosBroadcast, lcBootLines, LcBoot, useInertBehind, DeviceQuestion, useA11yNow, lcResetSection, lcBrList, lcBrSave, lcBrWord, lcBrStyleLabel, lcBrDate, lcBrFind, lcBrCheck, lcBrNotice, lcBrSelect, lcBrCreate, lcBrRename, lcBrDelete, lcBrUndo, lcBrUsePast, lcBrForget, lcBrStamp, lcBrWatch, lcBrIntent, lcKeyName, lcExportSettings, lcDownloadSettings, LcFindMeSwitch, LcUndoBar, A11ySwitch, App });

 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
const {useState, useEffect, useRef, useCallback} = React;
Looscid.useState = useState; Looscid.useEffect = useEffect; Looscid.useRef = useRef; Looscid.useCallback = useCallback;
/* --- DATA -------------------------------- */
// No demo content: people, Dreams, Circles and Alerts come from real use only.
// Tests may pass fixtures through window.__LOOSCID_FIXTURE__ (never set by the app itself).
const LC_FIX = (typeof window !== "undefined" && window.__LOOSCID_FIXTURE__) || {};
Looscid.LC_FIX = LC_FIX;
const USERS = LC_FIX.users || [];
Looscid.USERS = USERS;
const ME = {id:0,name:"Dreamor",handle:"@dreamor",initials:"D",bio:"",color:"#6d28d9",verified:false,location:"",joined:new Date().toLocaleString("en-US",{month:"long",year:"numeric"}),dreamCount:0,followers:0,following:0};
Looscid.ME = ME;
const DREAMS_INIT = (LC_FIX.dreams || []).map(function (d) { return Object.assign({ likes: 0, comments: 0, redreams: 0, quotes: 0, liked: false, redreamed: false, quoted: false, bookmarked: false, time: "1m" }, d, { user: typeof d.user === "number" ? USERS[d.user] : d.user }); });
Looscid.DREAMS_INIT = DREAMS_INIT;
const MOCK_COMMENTS = {};
Looscid.MOCK_COMMENTS = MOCK_COMMENTS;
const CONVOS = [];
Looscid.CONVOS = CONVOS;
const NOTIFS_INIT = [];
Looscid.NOTIFS_INIT = NOTIFS_INIT;
const GROUPS = [];
Looscid.GROUPS = GROUPS;
const TRENDING = [];
Looscid.TRENDING = TRENDING;
const SORT_OPTIONS = [
  {id:"newest",label:"Newest First"},
  {id:"oldest",label:"Oldest First"},
  {id:"top",label:"Top Liked"},
  {id:"replies",label:"Most Replies"},
];
Looscid.SORT_OPTIONS = SORT_OPTIONS;
/* --- DRAFTS --------------------------------------------------------------- */
const DRAFTS_KEY = "dbm_drafts";
Looscid.DRAFTS_KEY = DRAFTS_KEY;
function getDrafts() { try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || "[]"); } catch (e5) { return []; } }
function saveDraftItem(draft) {
  try {
    const drafts = getDrafts().filter(d => d.id !== draft.id);
    drafts.unshift(draft);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0,20)));
  } catch (e6) {}
}
/* --- THEME ---------------------------------------------------------------- */
const THEME_KEY = "dbm_theme";
Looscid.THEME_KEY = THEME_KEY;
function getSavedTheme() { try { return localStorage.getItem(THEME_KEY); } catch (e8) { return null; } }
function saveTheme(t) { try { localStorage.setItem(THEME_KEY, t); } catch (e9) {} }
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light") {
    const vars = {"--bg":"#f5f5f7","--sf":"#ffffff","--sf2":"#f0f0f5","--sf3":"#e5e5ea",
      "--bd":"#d1d1d6","--bd2":"#c7c7cc","--tx":"#1c1c1e","--tx2":"#3a3a3c","--tx3":"#8e8e93"};
    Object.entries(vars).forEach(([k,v]) => root.style.setProperty(k, v));
  } else {
    ["--bg","--sf","--sf2","--sf3","--bd","--bd2","--tx","--tx2","--tx3"].forEach(k => root.style.removeProperty(k));
  }
}
/* --- ONBOARDING FLAG ------------------------------------------------------ */
const ONBOARDING_KEY = "dbm_onboarding_seen";
Looscid.ONBOARDING_KEY = ONBOARDING_KEY;
function getOnboardingSeen() { try { return localStorage.getItem(ONBOARDING_KEY) === "true"; } catch (e10) { return false; } }
function setOnboardingSeen() { try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch (e11) {} }
function resetOnboarding() { try { localStorage.removeItem(ONBOARDING_KEY); } catch (e12) {} }
/* --- HELPERS ----------------------------- */
const fmt = n => n == null ? "0" : Number(n).toLocaleString();
Looscid.fmt = fmt;
function getLinkInfo(text) {
  if (/youtube\.com/i.test(text)) return {type:"youtube",domain:"youtube.com"};
  const m = text.match(/([a-zA-Z0-9-]+\.(io|dream|com|org|net|app))/);
  if (m) return {type:"site",domain:m[0].replace(/^www\./,"")};
  return null;
}
/* Round 6.3: your own Dreams are saved on this device (localStorage dbm_dreams), so they're still
   there after a reload. Only Dreams you wrote are saved, and nothing leaves the device. Likes,
   Redreams, Quotes and bookmarks on them are saved too, and a Dream that's removed is removed here.
   Settings backup doesn't include them, so the backup format is unchanged. */
const LC_DREAMS_KEY = "dbm_dreams";
Looscid.LC_DREAMS_KEY = LC_DREAMS_KEY;
// Round 6.4: "nid" is the Nostr note id of a Dream that went to Nostr, so it is never fetched twice.
const LC_DREAM_SAVE = ["id", "text", "likes", "redreams", "quotes", "liked", "redreamed", "quoted", "bookmarked", "created", "nid",
  // Round 6.5: Audience, content warning, a Quote's source, link preview off, and for Nostr notes the author key and threading tags.
  "aud", "cw", "quoteOf", "qWho", "qText", "nopv", "pk", "tags"];
/* Round 6.5: Replies are saved on this device too (localStorage dbm_replies), so they're still there after a
   reload. Each one keeps the Dream it answers (replyTo), the reply it answers when it's a reply to a reply
   (replyToReply), its Audience and content warning, who was notified, and for Nostr its note id and tags.
   Like dbm_dreams, Settings backup doesn't include them, so the backup format is unchanged. */
const LC_REPLIES_KEY = "dbm_replies";
Looscid.LC_REPLIES_KEY = LC_REPLIES_KEY;
const LC_REPLY_SAVE = ["id", "replyTo", "replyToReply", "text", "created", "aud", "cw", "notify", "likes", "liked", "nid", "pk", "tags", "nopv"];
let lcLastId = 0;
// A new id for something you write: the time in milliseconds, never the same twice (a thread is written in one go).
function lcNewId() { let t = Date.now(); if (t <= lcLastId) t = lcLastId + 1; lcLastId = t; return t; }
function lcRepliesRaw() {
  try { const a = JSON.parse(localStorage.getItem(LC_REPLIES_KEY) || "[]"); return Array.isArray(a) ? a.filter(function (r) { return r && r.id != null && r.replyTo != null && typeof r.text === "string"; }) : []; } catch (e) { return []; }
}
function lcReplyObj(r) {
  const o = { likes: 0, liked: false, isReply: true };
  LC_REPLY_SAVE.forEach(function (k) { if (r[k] !== undefined) o[k] = r[k]; });
  o.user = ME; o.time = lcAgo(r.created);
  return o;
}
// Your saved replies to one Dream, newest first.
function lcRepliesFor(parentId) {
  const k = String(parentId);
  return lcRepliesRaw().filter(function (r) { return String(r.replyTo) === k; }).sort(function (a, b) { return (+b.created || 0) - (+a.created || 0); }).map(lcReplyObj);
}
function lcAddReply(r) {
  const id = r.id != null ? r.id : lcNewId();
  const o = { id: id, created: r.created || (typeof id === "number" ? id : Date.now()) };
  LC_REPLY_SAVE.forEach(function (k) { if (r[k] !== undefined && o[k] === undefined) o[k] = r[k]; });
  const all = lcRepliesRaw().filter(function (x) { return String(x.id) !== String(id); });
  all.unshift(o);
  try { localStorage.setItem(LC_REPLIES_KEY, JSON.stringify(all.slice(0, 2000))); } catch (e) {}
  lcRepliesChanged();
  return id;
}
// When something was written: its time, or its id when that is a time (Nostr ids are not).
function lcWhen(x) { return +x.created || (typeof x.id === "number" ? x.id : 0) || 0; }
// How many replies a Dream has: its count plus the replies saved on this device.
function lcReplyCount(d) { return (d.comments || 0) + (d.isReply ? 0 : lcRepliesFor(d.id).length); }
function lcRepliesChanged() { try { window.dispatchEvent(new Event("looscid-replies")); } catch (e) {} }
// Redraws a card when your replies change (a new reply, or replies read back from Nostr).
function useRepliesTick() {
  const [n, setN] = useState(0);
  useEffect(function () { const f = function () { setN(function (x) { return x + 1; }); }; window.addEventListener("looscid-replies", f); return function () { window.removeEventListener("looscid-replies", f); }; }, []);
  return n;
}
// Open the composer from anywhere: { mode: "new" | "reply" | "quote", parent, root, onSent }.
function lcCompose(req) { try { window.dispatchEvent(new CustomEvent("looscid-compose", { detail: req || {} })); } catch (e) {} }
function lcAgo(t) {
  const s = Math.max(0, (Date.now() - (+t || Date.now())) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  if (s < 604800) return Math.floor(s / 86400) + "d";
  return Math.floor(s / 604800) + "w";
}
function lcSavedDreamsRaw() {
  try { const a = JSON.parse(localStorage.getItem(LC_DREAMS_KEY) || "[]"); return Array.isArray(a) ? a.filter(function (d) { return d && d.id != null && typeof d.text === "string"; }) : []; } catch (e) { return []; }
}
function lcLoadDreams() {
  return lcSavedDreamsRaw().map(function (d) {
    const o = { likes: 0, comments: 0, redreams: 0, quotes: 0, liked: false, redreamed: false, quoted: false, bookmarked: false };
    LC_DREAM_SAVE.forEach(function (k) { if (d[k] !== undefined) o[k] = d[k]; });
    o.user = ME; o.time = lcAgo(d.created);
    return o;
  });
}
// Saved Dreams first (newest first), then the built-in ones, with no duplicates.
function lcMergeDreams(saved, init) {
  const have = new Set(saved.map(function (d) { return d.id; }));
  return saved.concat((init || []).filter(function (d) { return !have.has(d.id); }));
}
// Write only what changed between two lists: your Dreams that are new or edited, and your Dreams that are gone.
function lcSyncOwnDreams(prev, next) {
  if (!prev || prev === next || !next) return;
  const pm = new Map(prev.map(function (d) { return [d.id, d]; })), nm = new Set(next.map(function (d) { return d.id; }));
  const changed = next.filter(function (d) { return d.user === ME && pm.get(d.id) !== d; });
  const gone = new Set(prev.filter(function (d) { return d.user === ME && !nm.has(d.id); }).map(function (d) { return d.id; }));
  if (!changed.length && !gone.size) return;
  const all = lcSavedDreamsRaw();
  // A Dream from Nostr that you remove here stays removed: it isn't fetched again (Round 6.4).
  all.forEach(function (s) { if (gone.has(s.id) && s.nid && Looscid.lcNostr) Looscid.lcNostr.hide(s.nid); });
  let saved = all.filter(function (s) { return !gone.has(s.id); });
  changed.slice().reverse().forEach(function (d) {
    const o = {}; LC_DREAM_SAVE.forEach(function (k) { if (d[k] !== undefined) o[k] = d[k]; });
    const old = saved.find(function (s) { return s.id === d.id; });
    if (!o.created) o.created = (old && old.created) || (typeof d.id === "number" && d.id > 1e12 ? d.id : Date.now());
    if (!o.nid && old && old.nid) o.nid = old.nid;
    // Round 6.5: the note's author key and threading tags are learned after signing, so keep them too.
    if (old) ["pk", "tags"].forEach(function (k) { if (o[k] === undefined && old[k] !== undefined) o[k] = old[k]; });
    if (old) saved[saved.indexOf(old)] = o; else saved.unshift(o);
  });
  try { localStorage.setItem(LC_DREAMS_KEY, JSON.stringify(saved.slice(0, 1000))); } catch (e) {}
}
function useSavedDreams(dreams) {
  const prev = useRef(dreams);
  useEffect(function () { lcSyncOwnDreams(prev.current, dreams); prev.current = dreams; }, [dreams]);
}
function useDreams(init) {
  const [dreams, setDreams] = useState(init);
  useSavedDreams(dreams);
  const tl = id => setDreams(ds => ds.map(d => d.id===id ? {...d, liked:!d.liked, likes:d.liked?d.likes-1:d.likes+1} : d));
  const tr = id => setDreams(ds => ds.map(d => d.id===id ? {...d, redreamed:true, redreams:d.redreams+1} : d));
  const tur = id => setDreams(ds => ds.map(d => d.id===id ? {...d, redreamed:false, redreams:Math.max(0,d.redreams-1)} : d));
  const tq = id => setDreams(ds => ds.map(d => d.id===id ? {...d, quoted:true, quotes:(d.quotes||0)+1} : d));
  const tuq = id => setDreams(ds => ds.map(d => d.id===id ? {...d, quoted:false, quotes:Math.max(0,(d.quotes||1)-1)} : d));
  const tb = id => setDreams(ds => ds.map(d => d.id===id ? {...d, bookmarked:!d.bookmarked} : d));
  // Increment comment count when a comment is posted - keeps feed count in sync
  const tc = id => setDreams(ds => ds.map(d => d.id===id ? {...d, comments:d.comments+1} : d));
  return {dreams, setDreams, tl, tr, tur, tq, tuq, tb, tc};
}
/* --- ICONS ------------------------------- */
const Ic = {
  Home:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"          ,}), React.createElement('polyline', { points: "9 22 9 12 15 12 15 22"       ,})),
  Bell:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"        ,}), React.createElement('path', { d: "M13.73 21a2 2 0 01-3.46 0"     ,})),
  Srch:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('circle', { cx: "11", cy: "11", r: "8",}), React.createElement('line', { x1: "21", y1: "21", x2: "16.65", y2: "16.65",})),
  Pls:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('line', { x1: "12", y1: "5", x2: "12", y2: "19",}), React.createElement('line', { x1: "5", y1: "12", x2: "19", y2: "12",})),
  Dots:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('circle', { cx: "5", cy: "12", r: "1.2",}), React.createElement('circle', { cx: "12", cy: "12", r: "1.2",}), React.createElement('circle', { cx: "19", cy: "12", r: "1.2",})),
  Hrt:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"                ,})),
  HrtF:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "currentColor", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"                ,})),
  Cmt:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"             ,})),
  Rep:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('polyline', { points: "17 1 21 5 17 9"     ,}), React.createElement('path', { d: "M3 11V9a4 4 0 014-4h14"    ,}), React.createElement('polyline', { points: "7 23 3 19 7 15"     ,}), React.createElement('path', { d: "M21 13v2a4 4 0 01-4 4H3"     ,})),
  Quot:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"                           ,}), React.createElement('path', { d: "M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"                   ,})),
  Bkm:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"         ,})),
  BkmF:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "currentColor", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"         ,})),
  Img:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('rect', { x: "3", y: "3", width: "18", height: "18", rx: "2",}), React.createElement('circle', { cx: "8.5", cy: "8.5", r: "1.5",}), React.createElement('polyline', { points: "21 15 16 10 5 21"     ,})),
  Snd:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('line', { x1: "22", y1: "2", x2: "11", y2: "13",}), React.createElement('polygon', { points: "22 2 15 22 11 13 2 9 22 2"         ,})),
  Bck:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('polyline', { points: "15 18 9 12 15 6"     ,})),
  Chv:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('polyline', { points: "9 18 15 12 9 6"     ,})),
  Pin:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"        ,}), React.createElement('circle', { cx: "12", cy: "10", r: "3",})),
  Lnk:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"        ,}), React.createElement('path', { d: "M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"         ,})),
  Cal:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('rect', { x: "3", y: "4", width: "18", height: "18", rx: "2",}), React.createElement('line', { x1: "16", y1: "2", x2: "16", y2: "6",}), React.createElement('line', { x1: "8", y1: "2", x2: "8", y2: "6",}), React.createElement('line', { x1: "3", y1: "10", x2: "21", y2: "10",})),
  Usr:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"        ,}), React.createElement('circle', { cx: "9", cy: "7", r: "4",})),
  Flg:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"            ,}), React.createElement('line', { x1: "4", y1: "22", x2: "4", y2: "15",})),
  Blk:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('circle', { cx: "12", cy: "12", r: "10",}), React.createElement('line', { x1: "4.93", y1: "4.93", x2: "19.07", y2: "19.07",})),
  Mut:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('polygon', { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5"             ,}), React.createElement('line', { x1: "23", y1: "9", x2: "17", y2: "15",}), React.createElement('line', { x1: "17", y1: "9", x2: "23", y2: "15",})),
  Lock:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('rect', { x: "3", y: "11", width: "18", height: "11", rx: "2",}), React.createElement('path', { d: "M7 11V7a5 5 0 0110 0v4"     ,})),
  Eye:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"        ,}), React.createElement('circle', { cx: "12", cy: "12", r: "3",})),
  Play:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "currentColor",}, React.createElement('polygon', { points: "5 3 19 12 5 21 5 3"       ,})),
  Pause: p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "currentColor",}, React.createElement('rect', { x: "6", y: "4", width: "4", height: "16",}), React.createElement('rect', { x: "14", y: "4", width: "4", height: "16",})),
  Vol:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('polygon', { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5"             ,}), React.createElement('path', { d: "M15.54 8.46a5 5 0 010 7.07"     ,})),
  Full:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"                  ,})),
  Sml:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('circle', { cx: "12", cy: "12", r: "10",}), React.createElement('path', { d: "M8 14s1.5 2 4 2 4-2 4-2"      ,}), React.createElement('line', { x1: "9", y1: "9", x2: "9.01", y2: "9",}), React.createElement('line', { x1: "15", y1: "9", x2: "15.01", y2: "9",})),
  Font:  p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('polyline', { points: "4 7 4 4 20 4 20 7"       ,}), React.createElement('line', { x1: "9", y1: "20", x2: "15", y2: "20",}), React.createElement('line', { x1: "12", y1: "4", x2: "12", y2: "20",})),
  Mn:    p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"          ,})),
  Key:   p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "1.9",}, React.createElement('path', { d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"                  ,})),
  X:     p => React.createElement('svg', { ...p, viewBox: "0 0 24 24"   , fill: "currentColor",}, React.createElement('path', { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"          ,})),
};
Looscid.Ic = Ic;
/* --- SHARED COMPONENTS ------------------- */
function Av({user, size=40}) {
  return (
    React.createElement('div', {
      className: "av",
      role: "img",
      "aria-label": (user.name || user.initials) + "'s profile picture",
      style: {width:size, height:size, fontSize:size*0.35, background:`linear-gradient(135deg,${user.color||"#6d28d9"},#a855f7)`},
    },
      React.createElement('span', {"aria-hidden":"true"}, user.initials)
    )
  );
}
function ChkMark() {
  return (
    React.createElement('svg', { viewBox: "0 0 12 10"   , width: "9", height: "9",}
      , React.createElement('polyline', { points: "1,5 4.5,8.5 11,1"  , stroke: "#fff", strokeWidth: "2.5", fill: "none", strokeLinecap: "round", strokeLinejoin: "round",})
    )
  );
}
function Cbx({on, onToggle, label}) {
  return (
    React.createElement('button', { className: "cbx" + (on?" on":""), onClick: onToggle, 'aria-checked': on, role: "checkbox", 'aria-label': label,}
      , on && React.createElement(ChkMark, null)
    )
  );
}
function Modal({onClose, title, subtitle, children}) {
  return (
    React.createElement('div', { className: "ov", onClick: e => e.target===e.currentTarget && onClose(),}
      , React.createElement('div', { className: "msh", role: "dialog", 'aria-label': title||"Menu",}
        , React.createElement('div', { className: "mhd", "aria-hidden":"true",})
        , React.createElement('div', { className: "min",}
          , title && React.createElement('div', {
              style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:subtitle?4:12},
            },
            React.createElement('div', { className: "mtt", style:{margin:0,flex:1}}, title),
            React.createElement('button', Object.assign({
              type: "button", className: "lc-close", onClick: onClose,
            }, lcCloseProps(title)), "Close")
          )
          , subtitle && React.createElement('div', { className: "msb",}, subtitle)
          , children
        )
      )
    )
  );
}
/* Bottom-anchored pop-up menu — matches Base44 design */

/* --- Dream options: an inline disclosure under each Dream (no modal, no focus trap) --- */
function lcThreadOf(d) { const reps = lcRepliesFor(d.id).concat((typeof MOCK_COMMENTS !== "undefined" && MOCK_COMMENTS[d.id]) || []).slice().sort(function (x, y) { return lcWhen(x) - lcWhen(y); }); return [d].concat(reps.map(function (r) { return Object.assign({ isReply: true }, r); })); }
function lcHearThread(d) {
  const parts = []; lcThreadOf(d).forEach(function (x, i) { const p = lcDreamSpeechParts(x); if (i > 0) p.forEach(function (q) { q.secondary = true; }); parts.push.apply(parts, p); });
  return LcSpeech.speak(parts);
}
// The Dream above a Dream's actions: the thread as an ordered list, or a translation.
function DreamExtra({ extra, dream, onClose }) {
  const ref = useRef(null);
  useEffect(function () { if (ref.current) ref.current.focus(); }, [extra.kind]);
  const close = lh('button', Object.assign({ type: "button", className: "lc-close", onClick: onClose }, lcCloseProps(extra.kind === "thread" ? "thread" : "translation")), "Close");
  if (extra.kind === "thread") {
    const t = lcThreadOf(dream);
    return lh('section', { className: "lc-extra", "aria-labelledby": "thr-h-" + dream.id },
      lh('h3', { id: "thr-h-" + dream.id, className: "lc-sub-h", tabIndex: -1, ref: ref }, "Thread, " + t.length + (t.length === 1 ? " Dream" : " Dreams")),
      lh('ol', { className: "lc-thread" }, t.map(function (x, i) { return lh('li', { key: x.id || i }, lh('span', { className: "lc-thread-who" }, (i ? "Reply from " : "") + ((x.user && x.user.name) || "Someone") + ": "), lcSpeechText(x.text)); })),
      lh('div', { className: "lc-inrow" },
        lh('button', { type: "button", className: "btn bgb lc-btn", disabled: !LcSpeech.ok, onClick: function () { lcHearThread(dream); } }, "Hear thread"),
        lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { LcSpeech.stop(); } }, "Stop"), close));
  }
  return lh('section', { className: "lc-extra", "aria-labelledby": "tr-h-" + dream.id },
    lh('h3', { id: "tr-h-" + dream.id, className: "lc-sub-h", tabIndex: -1, ref: ref }, "Translation"),
    lh('p', { lang: extra.lang || undefined }, extra.text || "Translating…"), close);
}
async function lcTranslate(text, to) {
  if (!lcTranslateOk()) throw new Error("not available");
  let from = "en";
  try { if ("LanguageDetector" in self) { const det = await self.LanguageDetector.create(); const r = await det.detect(text); if (r && r[0] && r[0].detectedLanguage && r[0].detectedLanguage !== "und") from = r[0].detectedLanguage; } } catch (e) {}
  if (from === to) return { text: text, same: true };
  const tr = await self.Translator.create({ sourceLanguage: from, targetLanguage: to });
  return { text: await tr.translate(text) };
}
// Dream options: the shared mini pop-up menu, real actions only (Mute, Block and Report are on
// the Coming soon list in Looscid Labs until they work).
function lcShareText(text, what) {
  if (navigator.share) { navigator.share({ text: text }).catch(function () {}); return; }
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { announce(what + " copied, ready to share."); }, function () { announce("Copy is not available here."); });
  else announce("Sharing is not available in this browser.");
}
function DreamOptionsMenu({ id, dream, btnRef, onBookmark, navigate, cherryCtx, onExtra }) {
  const handle = (dream.user && dream.user.handle || "").replace("@", "");
  const lang = Looscid.A11Y_NOW.translateTo || "en", langName = (LC_LANGS.find(function (x) { return x[0] === lang; }) || [0, "English"])[1];
  const items = [
    LcSpeech.ok ? { id: "read", name: "Read this Dream", a: function () { LcSpeech.speak(lcDreamSpeechParts(dream)); } } : null,
    onExtra && LcSpeech.ok ? { id: "thread", name: "Hear thread", a: function () { onExtra({ kind: "thread" }); lcHearThread(dream); } } : null,
    onExtra && lcTranslateOk() ? { id: "translate", name: "Translate into " + langName, a: function () {
      onExtra({ kind: "translation", text: "", lang: lang });
      lcTranslate(dream.text || "", lang).then(function (r) { onExtra({ kind: "translation", text: r.same ? "This Dream is already in " + langName + "." : r.text, lang: lang }); announce("Translated."); },
        function () { onExtra({ kind: "translation", text: "This browser couldn't translate it on this device." }); });
    } } : null,
    { id: "save", name: dream.bookmarked ? "Unsave Dream" : "Save Dream", a: function () { onBookmark && onBookmark(dream.id); announce(dream.bookmarked ? "Dream removed from saved." : "Dream saved."); } },
    { id: "share", name: "Share Dream", a: function () { lcShareText((dream.user ? dream.user.name + ": " : "") + (dream.text || ""), "Dream"); } },
    handle ? { id: "profile", name: "View @" + handle + "'s profile", a: function () { navigate && navigate("dp", dream.user); } } : null,
    cherryCtx ? { id: "cherry", name: "Ask Cherry about this Dream", a: function () { cherryCtx.openCherry("Tell me about this Dream: " + String(dream.text || "").slice(0, 200)); } } : null,
  ].filter(Boolean);
  return lh(LcMenu, { id: id + "-btn", menuId: id, kind: "action", title: "Dream options", btnLabel: "Dream options", btnClass: "ixn-btn", btnRef: btnRef, noCaret: true, align: "right", up: true,
    className: "lc-dmenu", style: { flex: ".5", display: "flex" }, itemClass: "lc-dopt", btnText: lh(Ic.Dots, { style: { width: 15, height: 15 } }), items: items,
    onSelect: function (k, it) { if (it.a) it.a(); } });
}
function BackHeader({title, onBack, right}) {
  return (
    React.createElement('div', { className: "hdr",}
      , React.createElement('div', { className: "hdr-row",}
        , React.createElement('button', { className: "bi", onClick: onBack, 'aria-label': "Back" ,}
          , React.createElement(Ic.Bck, { style: {width:21,height:21},})
        )
        , React.createElement('h1', { className: "hdr-title", tabIndex:-1,}, title)
        , right
      )
    )
  );
}
/* --- DREAM TEXT RENDERER — handles newlines and hashtags ----------------- */
function DreamText({text, style}) {
  // Split on \n to get paragraphs, then within each line find hashtags
  const paras = (text || "").split("\n");
  const children = [];
  paras.forEach((para, pi) => {
    if (pi > 0) children.push(React.createElement('br', {key:"b"+pi}));
    // split on word boundaries around hashtags
    const parts = para.split(/(#\w+)/g);
    parts.forEach((part, i) => {
      if (!part) return;
      if (part.startsWith('#')) {
        children.push(React.createElement('span', {key:pi+"_"+i, className:"dc-tag"}, part));
      } else {
        children.push(part);
      }
    });
  });
  return React.createElement('span', {style: Object.assign({whiteSpace:"pre-wrap"}, style||{})}, children);
}
function SiteEmbed({domain}) {
  return (
    React.createElement('div', { className: "embed",}
      , React.createElement('div', { style: {width:"100%",height:80,background:"linear-gradient(135deg,#0a0820,#181030)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,opacity:.5},}, "Website")
      , React.createElement('div', { className: "embed-bot",}
        , React.createElement('div', { className: "embed-edom",}, domain)
        , React.createElement('div', { className: "embed-etit",}, "Visit " , domain)
        , React.createElement('div', { className: "embed-edesc",}, "External link — tap to open"     )
      )
    )
  );
}
/* Round 6.5: link previews with no server. YouTube, Vimeo and Spotify have their own players, which
   load only when you press Play (nothing from those sites loads before that). Any other link gets a
   plain card with its domain. Looscid never fetches the page itself, through any proxy or otherwise. */
const LC_EMBED_NAMES = { youtube: "YouTube", vimeo: "Vimeo", spotify: "Spotify" };
function lcLinkCard(text) {
  const m = String(text || "").match(/https?:\/\/[^\s<>"']+/i);
  if (!m) return null;
  let u; try { u = new URL(m[0].replace(/[.,!?;:)\]}]+$/, "")); } catch (e) { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, "");
  let kind = "site", id = null, sub = null;
  if (host === "youtube.com" || host === "music.youtube.com") { id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/) || [])[1]; }
  else if (host === "youtu.be") { id = (u.pathname.match(/^\/([\w-]{6,})/) || [])[1]; }
  if (id && /^[\w-]{6,20}$/.test(id)) kind = "youtube"; else id = null;
  if (host === "vimeo.com" || host === "player.vimeo.com") { const v = (u.pathname.match(/(?:^|\/)(\d{5,12})(?:\/|$)/) || [])[1]; if (v) { kind = "vimeo"; id = v; } }
  if (host === "open.spotify.com") { const s = u.pathname.match(/^\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]{10,40})/); if (s) { kind = "spotify"; sub = s[1]; id = s[2]; } }
  const what = kind === "youtube" ? "YouTube video" : kind === "vimeo" ? "Vimeo video" : kind === "spotify" ? "Spotify " + sub : "Link to " + host;
  const embed = kind === "youtube" ? "https://www.youtube-nocookie.com/embed/" + id : kind === "vimeo" ? "https://player.vimeo.com/video/" + id + "?dnt=1" : kind === "spotify" ? "https://open.spotify.com/embed/" + sub + "/" + id : null;
  return { url: u.href, kind: kind, id: id, sub: sub, domain: host, label: what, embed: embed, site: LC_EMBED_NAMES[kind] || host };
}
// The card under a Dream. Plain text says what it is; Play loads the player only when you ask; the link opens the page.
function LinkCard({ info }) {
  const [play, setPlay] = useState(false);
  if (!info) return null;
  const tall = info.kind === "spotify" ? (info.sub === "track" || info.sub === "episode" ? 152 : 352) : null;
  return lh('div', { className: "lc-link-card embed" },
    lh('p', { className: "lc-link-what" }, info.label + ", " + info.domain),
    info.embed && play && lh('iframe', { src: info.embed, "aria-label": info.label, className: "lc-link-frame", loading: "lazy", referrerPolicy: "strict-origin-when-cross-origin",
      allow: "encrypted-media; picture-in-picture; fullscreen", allowFullScreen: true, style: tall ? { height: tall, aspectRatio: "auto" } : undefined }),
    lh('div', { className: "lc-inrow" },
      info.embed && lh('button', { type: "button", className: "btn bgb lc-btn", "aria-pressed": play, onClick: function () { setPlay(!play); } }, play ? "Stop " + info.site + " player" : "Play " + info.label),
      lh('a', { href: info.url, target: "_blank", rel: "noopener noreferrer", className: "lc-link" }, "Open " + (info.embed ? "on " + info.site : info.domain))));
}
/* --- REPLIES PAGE (Round 6.5: one word for these everywhere, Replies) --- */
/* One reply in the list. It can take focus (after you reply, focus lands on it), and a reply with a
   content warning keeps its text behind "Show reply". */
function ReplyItem({cm, navigate, onReply}) {
  const [liked, setLiked] = useState(!!cm.liked);
  const [likes, setLikes] = useState(cm.likes || 0);
  const [open, setOpen] = useState(false);
  const toggle = () => { setLiked(l=>!l); setLikes(n=>liked?n-1:n+1); };
  const name = (cm.user && cm.user.name) || "Someone", handle = (cm.user && cm.user.handle) || "";
  const body = lcWordHit(cm.text) ? lh(LcBlockedHidden, { what: "reply" }, lh('p', { className: "cm-body" }, cm.text)) : lh('p', { className: "cm-body" }, cm.text);
  return lh('div', { className: "cm-item", "data-dream-id": String(cm.id), tabIndex: -1 },
    lh('div', { className: "cm-meta" },
      lh(Av, { user: cm.user, size: 30 }),
      lh('div', { style: {flex:1} },
        lh('span', { style: {fontWeight:700,fontSize:13} }, name),
        lh('span', { style: {fontSize:11,color:"var(--tx3)",marginLeft:6} }, handle, ", ", cm.time)),
      lh(LcMenu, { id: "cmo-" + cm.id, kind: "action", title: "Reply options", btnLabel: "Reply options", btnClass: "bi", noCaret: true, align: "right",
        btnText: lh(Ic.Dots, { style: {width:14,height:14} }), onSelect: function (k, it) { it.a(); }, items: [
          onReply ? { id: "reply", name: "Reply", a: function () { onReply(cm); } } : null,
          { id: "hear", name: "Hear reply", a: function () { LcSpeech.speak(lcDreamSpeechParts(cm)); } },
          { id: "copy", name: "Copy text", a: function () { if (navigator.clipboard) navigator.clipboard.writeText(cm.text || "").then(function () { announce("Reply copied."); }, function () { announce("Copy is not available here."); }); else announce("Copy is not available here."); } },
          { id: "share", name: "Share reply", a: function () { lcShareText(name + ": " + (cm.text || ""), "Reply"); } },
          navigate && handle ? { id: "profile", name: "View @" + handle.replace("@","") + "'s profile", a: function () { navigate("dp", cm.user); } } : null,
        ].filter(Boolean) })),
    cm.cw ? lh(React.Fragment, null,
      lh('p', { className: "lc-cw-t" }, "Content warning: " + cm.cw),
      lh('button', { type: "button", className: "btn bgb lc-btn", "aria-expanded": open, onClick: function () { setOpen(!open); } }, open ? "Hide reply" : "Show reply"),
      open && body) : body,
    lh('div', { className: "cm-actions" },
      lh('button', { type: "button", className: "cm-act" + (liked ? " liked" : ""), "aria-pressed": liked, onClick: toggle }, lh('span', { style: {fontSize:11} }, likes ? likes + " Likes" : "Like")),
      onReply ? lh('button', { className: "cm-act", type: "button", onClick: function (e) { onReply(cm, e.currentTarget); } }, lh('span', { style: {fontSize:11} }, "Reply to " + name)) : null));
}
function CommentItem(props) { return lh(ReplyItem, props); } // the old name, kept for anything that still uses it
/* The Replies page: the Dream, a Reply button that opens the composer in Reply mode, then the replies.
   Replies you write are saved on this device (dbm_replies) and come back after a reload. */
function CommentView({dream, onBack, onLike, onRedream, onUndoRedream, onQuote, onUndoQuote, onBookmark, onCommentPosted, navigate}) {
  const tick = useRepliesTick();
  const comments = React.useMemo(function () { return lcRepliesFor(dream.id).concat(MOCK_COMMENTS[dream.id] || []); }, [dream.id, tick]);
  const [sort, setSort] = useState("newest");
  const dreamOptsBtn = useRef(null);
  const endRef = useRef(null);
  const rdTotal = dream.redreams + (dream.quotes||0);
  const rdActive = dream.redreamed || dream.quoted;
  const reply = function (parent, opener) { lcCompose({ mode: "reply", parent: parent || dream, root: dream, opener: opener || document.activeElement }); };
  const sorted = [...comments].sort((a,b) => {
    if (sort==="oldest") return lcWhen(a)-lcWhen(b);
    if (sort==="top") return (b.likes||0)-(a.likes||0);
    return lcWhen(b)-lcWhen(a);
  });
  const linkInfo = lcLinkCard(dream.text);
  return (
    React.createElement('div', { className: "pg", style: {display:"flex",flexDirection:"column",paddingBottom:0},}
      , React.createElement('div', { className: "hdr",}
        , React.createElement('div', { className: "hdr-row",}
          , React.createElement('button', { className: "bi", onClick: onBack, 'aria-label': "Back",}, React.createElement(Ic.Bck, { style: {width:21,height:21},}))
          , React.createElement('span', { className: "hdr-title",}, "Replies")
          , React.createElement('span', { style: {fontSize:13,color:"var(--tx3)",fontWeight:600},}, comments.length)
        )
      )
      , React.createElement('div', { style: {flex:1,display:"flex",flexDirection:"column",overflow:"hidden"},}
        , React.createElement('div', { style: {overflowY:"auto",flex:1,scrollbarWidth:"none"},}
          /* Original Dream */
          , React.createElement('div', { style: {padding:"14px 16px",borderBottom:"1px solid var(--bd)",background:"var(--sf2)"},}
            , React.createElement('div', { className: "dc-meta", style: {marginBottom:6},}
              , React.createElement('button', { style: {background:"none",border:"none",cursor:"pointer",padding:0}, onClick: ()=>navigate("dp",dream.user), 'aria-label': "View " + dream.user.name + "'s profile",}
                , React.createElement('span', { className: "dc-name",}, dream.user.name)
              )
              , React.createElement('span', { className: "dc-dot", "aria-hidden": "true"}, "·")
              , React.createElement('span', { className: "dc-handle",}, dream.user.handle)
              , React.createElement('span', { className: "dc-dot", "aria-hidden": "true"}, "·")
              , React.createElement('span', { className: "dc-time",}, dream.time)
            )
            , React.createElement('p', { style: {fontSize:14,lineHeight:1.65,color:"var(--tx)",marginBottom:8},}
              , React.createElement(DreamText, {text: dream.text})
            )
            , linkInfo && !dream.nopv && lh(LinkCard, { info: linkInfo })
            /* Dream interaction row on the Replies page */
            , React.createElement('div', { className: "ixn-row", style: {margin:"0 -16px",borderTop:"1px solid var(--bd)"},}
              , React.createElement('button', { className: "cbx-wrap" + (dream.liked?" liked":""), onClick: ()=>onLike(dream.id), 'aria-label': fmt(dream.likes) + " likes",}
                , React.createElement('div', { className: "cbx-box",}, dream.liked && React.createElement(ChkMark, null))
                , React.createElement('span', null, fmt(dream.likes), " Likes" )
              )
              , lh(LcMenu, { id: "rd-cv-" + dream.id, kind: "action", title: "Redream or Quote", btnLabel: fmt(rdTotal) + " Redreams", btnClass: "cbx-wrap" + (rdActive?" redd":""), noCaret: true, up: true,
                  btnText: [lh('div', { key: "b", className: "cbx-box" }, rdActive && lh(ChkMark, null)), lh('span', { key: "s" }, fmt(rdTotal), " Redreams")],
                  items: [{ id: "rd", name: dream.redreamed ? "Undo Redream" : "Redream" }, { id: "q", name: dream.quoted ? "Undo Quote" : "Quote Dream" }],
                  onSelect: function (k) { if (k === "rd") { dream.redreamed ? onUndoRedream(dream.id) : onRedream(dream.id); } else if (dream.quoted) onUndoQuote(dream.id); else lcCompose({ mode: "quote", parent: dream, onSent: function () { onQuote(dream.id); } }); } })
              , React.createElement('button', { className: "cbx-wrap" + (dream.bookmarked?" bookd":""), onClick: ()=>onBookmark(dream.id), 'aria-label': dream.bookmarked?"Saved":"Save",}
                , React.createElement('div', { className: "cbx-box",}, dream.bookmarked && React.createElement(ChkMark, null))
                , React.createElement('span', null, dream.bookmarked?"Saved":"Save")
              )
              , lh(DreamOptionsMenu, { id: "dopts-cv-" + dream.id, dream: dream, btnRef: dreamOptsBtn, onBookmark: onBookmark, navigate: navigate })
            )
          )
          /* Reply: opens the composer in Reply mode (Round 6.5) */
          , lh('div', { style: {padding:"10px 14px",borderBottom:"1px solid var(--bd)",display:"flex",gap:9,alignItems:"center"} },
              lh(Av, { user: ME, size: 32 }),
              lh('button', { type: "button", id: "cv-reply-btn", className: "btn bp", style: {padding:"8px 16px",fontSize:13}, onClick: function (e) { reply(dream, e.currentTarget); } }, "Reply to " + dream.user.name))
          /* Sort bar */
          , React.createElement('div', { className: "sort-bar",}
            , React.createElement('span', { className: "sort-lbl",}, "Replies " , React.createElement('strong', { style: {color:"var(--tx)"},}, comments.length))
            , lh(LcMenu, { id: "cv-sort", label: "Sort replies", hideLabel: true, title: "Sort replies", btnClass: "sort-btn", prefix: "Sort: ", align: "right", value: sort,
                items: SORT_OPTIONS.map(function (o) { return { id: o.id, name: o.label }; }), onSelect: function (v) { setSort(v); announce("Sorted by " + (SORT_OPTIONS.find(o=>o.id===v)||{label:v}).label + "."); } })
          )
          /* Replies */
          , lh('div', { id: "cv-replies", role: "list", "aria-label": "Replies" }, sorted.map(cm => lh('div', { role: "listitem", key: cm.id }, lh(ReplyItem, { cm: cm, navigate: navigate, onReply: function (c, el) { reply(c, el); } }))))
          , comments.length===0 && React.createElement('div', { className: "es",}, React.createElement('div', { className: "esi",}, "No replies yet"), React.createElement('div', { className: "esl",}, "Be the first to reply."))
          , React.createElement('div', { ref: endRef, style: {height:16},})
        )
      )
      , React.createElement('div', { style: {height:72},})
    )
  );
}
/* --- DREAM CARD -------------------------- */
function DreamCard({dream, onLike, onRedream, onUndoRedream, onQuote, onUndoQuote, onBookmark, onComment, navigate, cherryCtx}) {
  const [showRD, setShowRD] = useState(false);
  const [showOpts, setShowOpts] = useState(false);
  const optsBtn = useRef(null);
  const [showInsights, setShowInsights] = useState(false);
  useRepliesTick(); // Round 6.5: the reply count includes your saved replies
  const nReplies = lcReplyCount(dream);
  const linkInfo = lcLinkCard(dream.text);
  const rdTotal = dream.redreams + (dream.quotes||0);
  const rdActive = dream.redreamed || dream.quoted;
  // Round 4: how the Dream is read (Verbosity, read order, timestamps, emoji, hashtags) and shown on braille.
  const A = Looscid.A11Y_NOW, calm = !!A.calmFeed, verb = A.verbosity || "normal";
  const [cwOpen, setCwOpen] = useState(false);
  const [extra, setExtra] = useState(null); // { kind: "thread" | "translation", ... }
  const flt = lcFiltered(dream);
  const tp = lcTimeParts(dream.time), kind = lcDreamKind(dream);
  const srTime = verb !== "short" && tp && A.speakTime !== "off" ? (A.speakTime === "short" ? tp.short : tp.full) : "";
  const srMeta = [verb === "detailed" && kind !== "Dream" ? kind : "", verb === "detailed" ? lcSpeechText(dream.user.handle || "") : "", srTime].filter(Boolean).join(", ");
  const srText = lcSpeechText(dream.text), textFirst = A.readOrder === "text";
  const rewrite = textFirst || A.speakEmoji === "skip" || A.speakEmoji === "word" || A.speakTags === "skip";
  const artProps = { className: "dc", role: "article", tabIndex: -1, "data-dream-id": dream.id, "aria-label": lcDreamWords(dream, "speech"), "aria-braillelabel": A.brailleOutput ? lcDreamWords(dream, "braille") : undefined,
    onFocus: function () { Looscid.LC_LAST_DREAM = dream; } };
  if (flt && flt.bw && !cwOpen) return lh('div', Object.assign({}, artProps, { "aria-label": "Hidden: contains a blocked word", "aria-braillelabel": A.brailleOutput ? "Hidden: blocked word" : undefined }),
    lh('div', { className: "dc-inner lc-cw lc-bw" },
      lh('p', { className: "lc-cw-t" }, "Hidden: contains a blocked word"),
      lh('button', { type: "button", className: "btn bgb lc-btn", "aria-expanded": false, onClick: function () { setCwOpen(true); } }, "Show Dream")));
  if (flt && flt.cw && !cwOpen) return lh('div', Object.assign({}, artProps, { "aria-label": "Content warning: " + flt.cw, "aria-braillelabel": A.brailleOutput ? "CW: " + flt.cw : undefined }),
    lh('div', { className: "dc-inner lc-cw" },
      lh('p', { className: "lc-cw-t" }, "Content warning: " + flt.cw),
      lh('button', { type: "button", className: "btn bgb lc-btn", "aria-expanded": false, onClick: function () { setCwOpen(true); } }, "Show Dream")));

  return (
    React.createElement(React.Fragment, null
      , dream.reddreamer && (
        React.createElement('div', { className: "rd-source",}, React.createElement(Ic.Rep, { style: {width:11,height:11},}), React.createElement('strong', { style: {fontWeight:600},}, dream.reddreamer.name), " Redreamed")
      )
      , React.createElement('div', artProps
        , React.createElement('div', { className: "dc-inner",}
          , textFirst && lh('p', { className: "sr-only" }, srText)
          , React.createElement('div', { className: "dc-meta",}
            , React.createElement('button', { style: {background:"none",border:"none",cursor:"pointer",padding:0}, onClick: ()=>navigate("dp",dream.user), 'aria-label': "View "+dream.user.name+"'s profile", "aria-braillelabel": A.brailleOutput ? dream.user.name : undefined,}
              , React.createElement('span', { className: "dc-name",}, dream.user.name, dream.user.verified && React.createElement('span', { style: {color:"var(--ac2)",marginLeft:3,fontSize:11},}, "✓"))
            )
            , srMeta && lh('span', { className: "sr-only" }, srMeta)
            , React.createElement('span', { className: "dc-dot", "aria-hidden": "true"}, "·")
            , React.createElement('span', { className: "dc-handle", "aria-hidden": "true"}, dream.user.handle)
            , React.createElement('span', { className: "dc-dot", "aria-hidden": "true"}, "·")
            , dream.user.isOriginals
              ? React.createElement('span', { style: {fontSize:10,background:"rgba(124,58,237,.15)",color:"var(--ac3)",padding:"1px 6px",borderRadius:4,fontWeight:700},}, "Founding Dream")
              : React.createElement('span', { className: "dc-time", "aria-hidden": "true"}, dream.time)
            , linkInfo && React.createElement(React.Fragment, null, React.createElement('span', { className: "dc-dot", "aria-hidden": "true"}, "·"), React.createElement('span', { className: "dc-domain",}, linkInfo.domain))
          )
          , React.createElement('div', { className: "dc-body", "aria-hidden": rewrite ? "true" : undefined}
            , React.createElement(DreamText, {text: dream.text})
          )
          , rewrite && !textFirst && lh('p', { className: "sr-only" }, srText)
          , extra && lh(DreamExtra, { extra: extra, dream: dream, onClose: function () { setExtra(null); setTimeout(function () { if (optsBtn.current) optsBtn.current.focus(); }, 0); } })
          , dream.quoteOf != null && dream.qText != null && lh('div', { className: "qbub lc-quoted" }, lh('p', { style: {fontSize:12,color:"var(--tx2)",lineHeight:1.5,margin:0} }, "Quoting " + (dream.qWho || "a Dream") + ": " + dream.qText))
          , linkInfo && !dream.nopv && lh(LinkCard, { info: linkInfo })
          /* Cherry Insights panel */
          , cherryCtx && showInsights && (()=>{
            const tags = dream.text.match(/#\w+/g)||[];
            const sentiment = dream.likes > 200 ? "High engagement" : dream.likes > 100 ? "Growing" : "Active discussion";
            const relTags = ["#Consciousness","#Philosophy","#CreativeProcess","#Mindfulness"].filter(t=>!tags.includes(t)).slice(0,2);
            return (
              React.createElement('div', { className: "cherry-insight-panel",}
                , React.createElement('div', { className: "cherry-insight-row",}
                  , React.createElement('div', { className: "aiorb", style: {width:22,height:22,fontSize:11,flexShrink:0},}, "Cherry")
                  , React.createElement('span', { style: {fontSize:11,fontWeight:700,color:"var(--ac3)"},}, "CHERRY INSIGHTS" )
                )
                , React.createElement('div', { style: {fontSize:12,color:"var(--tx2)",marginBottom:8,lineHeight:1.5},}
                  , sentiment, ", Dreamed by "    , dream.user.name, ", "  , dream.comments, " replies, "   , (dream.likes/10).toFixed(0), "% engagement rate"
                )
                , tags.length > 0 && React.createElement('div', { style: {marginBottom:6},}
                  , React.createElement('span', { style: {fontSize:10,color:"var(--tx3)",fontWeight:700,display:"block",marginBottom:4},}, "HASHTAGS")
                  , React.createElement('div', { style: {display:"flex",gap:5,flexWrap:"wrap"},}
                    , tags.map(t=>React.createElement('button', { key: t, className: "cherry-insight-tag", onClick: ()=>cherryCtx.openCherry("What dreams use "+t+" and should I Dream about it?"), 'aria-label': "Ask Cherry about "+t,}, t))
                  )
                )
                , relTags.length > 0 && React.createElement('div', { style: {marginBottom:8},}
                  , React.createElement('span', { style: {fontSize:10,color:"var(--tx3)",fontWeight:700,display:"block",marginBottom:4},}, "CHERRY SUGGESTS ADDING"  )
                  , React.createElement('div', { style: {display:"flex",gap:5,flexWrap:"wrap"},}
                    , relTags.map(t=>React.createElement('span', { key: t, style: {background:"rgba(52,211,153,.1)",color:"var(--gr)",borderRadius:100,padding:"2px 8px",fontSize:11,fontWeight:600},}, t))
                  )
                )
                , React.createElement('button', { className: "agent-action-pill", style: {width:"100%",justifyContent:"center"}, onClick: ()=>cherryCtx.openCherry("Tell me more about this Dream by "+dream.user.name+": "+dream.text.slice(0,80)), 'aria-label': "Deep dive with Cherry"   ,}, "Deep dive with Cherry"

                )
              )
            );
          })()
        )
        /* Interaction row - Save removed, lives in Dream Options menu */
        , React.createElement('div', { className: "ixn-row",}
          , React.createElement('button', { className: "ixn-btn", onClick: ()=>onComment && onComment(dream), 'aria-label': fmt(nReplies)+(nReplies === 1 ? " reply" : " replies"),}
            , React.createElement(Ic.Cmt, { style: {width:15,height:15},}), React.createElement('span', null, fmt(nReplies), nReplies === 1 ? " Reply" : " Replies" )
          )
          , lh(LcMenu, { id: "rd-" + dream.id, kind: "action", title: "Redream or Quote", btnLabel: calm ? "Redreams" + (rdActive ? ", Redreamed" : "") : fmt(rdTotal)+" Redreams", btnClass: "cbx-wrap"+(rdActive?" redd":""), noCaret: true, up: true, className: "lc-rdmenu",
              btnText: [lh('div', { key: "b", className: "cbx-box" }, rdActive && lh(ChkMark, null)), lh('span', { key: "s" }, calm ? "" : fmt(rdTotal), calm ? "Redreams" : " Redreams")],
              items: [{ id: "rd", name: dream.redreamed ? "Undo Redream" : "Redream" }, { id: "q", name: dream.quoted ? "Undo Quote" : "Quote Dream" }],
              onSelect: function (k) { if (k === "rd") { dream.redreamed ? onUndoRedream(dream.id) : onRedream(dream.id); } else if (dream.quoted) onUndoQuote(dream.id); else lcCompose({ mode: "quote", parent: dream, onSent: function () { onQuote(dream.id); } }); } })
          , React.createElement('button', { className: "cbx-wrap"+(dream.liked?" liked":""), onClick: ()=>{ if (!dream.liked) Earcon.play("like"); onLike(dream.id); }, 'aria-label': lcVerb() === "low" ? "Like" + (dream.liked ? ", liked" : "") : (calm ? "Likes" + (dream.liked ? ", liked" : "") : fmt(dream.likes)+" likes") + (lcVerb() === "high" ? ", double tap to " + (dream.liked ? "unlike" : "like") : ""),}
            , React.createElement('div', { className: "cbx-box",}, dream.liked && React.createElement(ChkMark, null))
            , React.createElement('span', null, calm ? "" : fmt(dream.likes), calm ? "Likes" : " Likes" )
          )
          , lh(DreamOptionsMenu, { id: "dopts-" + dream.id, dream: dream, btnRef: optsBtn, onBookmark: onBookmark, navigate: navigate, cherryCtx: cherryCtx, onExtra: setExtra })
        )
        )

    )
  );
}
/* --- Round 6: category order and visibility (Messages tab, and the Alerts tab's notification categories).
   dbm_msg_cat_order / dbm_msg_cat_hidden, dbm_alert_cat_order / dbm_alert_cat_hidden. */
function lcCatState(kind, defs) {
  const rd = function (k) { try { const v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const ids = defs.map(function (d) { return d.id; });
  const saved = rd("dbm_" + kind + "_cat_order").filter(function (x) { return ids.indexOf(x) >= 0; });
  const order = saved.concat(ids.filter(function (x) { return saved.indexOf(x) < 0; }));
  const hidden = rd("dbm_" + kind + "_cat_hidden").filter(function (x) { return ids.indexOf(x) >= 0; });
  return { order: order, hidden: hidden };
}
function useCats() { const [, t] = useState(0); useEffect(function () { const f = function () { t(function (x) { return x + 1; }); }; window.addEventListener("looscid:cats", f); return function () { window.removeEventListener("looscid:cats", f); }; }, []); }
const LC_MSG_CATS = [{ id: "all", label: "All" }, { id: "requests", label: "Requests" }, { id: "starred", label: "Starred" }, { id: "archived", label: "Archived" }];
Looscid.LC_MSG_CATS = LC_MSG_CATS;
function lcAlertCats() { return [{ id: "all", label: "All" }].concat(LC_ALERT_TYPES.map(function (t) { return { id: t.id, label: t.tab }; })); }
/* --- Round 6: Reset. The last item in every settings list opens one native <dialog>, scoped to
   where you are: collapsible groups (one open at a time), a checkbox per setting, "Reset all
   [Section] settings" and "Reset selected". On the main Settings list it covers the whole app.
   Keys and IDs need one more confirm. Focus goes back to the Reset button. */
Looscid.LC_SET_PREFS = null; Looscid.LC_SET_THEME = null;
const LC_RESET_LABELS = { textSize: "Text size", highContrast: "High contrast", boldText: "Bold text", dyslexiaFont: "Dyslexia-friendly spacing", captions: "Captions for audio", visualCue: "Visual cue instead of sounds",
  calmMode: "Calm mode", flashSafety: "Flash safety", reduceMotion: "Reduce Motion", termOutput: "Commandbar output", termHeadings: "Heading per command", largeBtns: "Larger buttons", switchAccess: "Strong focus outline",
  feedSwitch: "Feed switching", shortcuts: "Your shortcuts", earcons: "Earcons", earconVolume: "Volume", pitchCues: "Pitch cues" };
Looscid.LC_RESET_LABELS = LC_RESET_LABELS;
function lcResetKeyItems(sec, only, extra) {
  const defs = lcSectionDefaults(sec);
  return lcSectionKeys(sec).concat(extra || []).filter(function (k, i, a) { return a.indexOf(k) === i && k !== "srNames" && (!only || only.indexOf(k) >= 0); }).map(function (k) {
    const p = {}; p[k] = k === "shortcuts" ? [] : (k in defs ? defs[k] : A11Y_DEFAULTS[k]);
    return { id: k, l: (LC_SET_BY[k] && LC_SET_BY[k].l) || LC_RESET_LABELS[k] || k, patch: p };
  });
}
function lcLsDel(keys, ev) { return function () { keys.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); if (ev) try { window.dispatchEvent(new CustomEvent(ev)); } catch (e) {} }; }
const LC_RESET_G = {
  vision: { l: "Vision", items: function () { return lcResetKeyItems("vision"); } },
  sr_general: { l: "Screen reader, General", items: function () { return lcResetKeyItems("sr_general"); } },
  sr_speech: { l: "Screen reader, Speech", items: function () { return lcResetKeyItems("sr_speech"); } },
  verbosity: { l: "Verbosity and pitch cues", items: function () { return lcResetKeyItems("verbosity"); } },
  sr_braille: { l: "Braille", items: function () { return lcResetKeyItems("sr_braille"); } },
  hearing: { l: "Hearing", items: function () { return lcResetKeyItems("hearing"); } },
  motion: { l: "Motion and seizure", items: function () { return lcResetKeyItems("motion"); } },
  terminal: { l: "Commandbar output", items: function () { return lcResetKeyItems("terminal"); } },
  motor: { l: "Motor and switch", items: function () { return lcResetKeyItems("motor"); } },
  snd_volume: { l: "Volume, focus sounds and keyboard clicks", items: function () { return lcResetKeyItems("audio", LC_AUDIO_CATS[0].keys, LC_AUDIO_CATS[0].keys); } },
  snd_pack: { l: "Sound pack", items: function () { return lcResetKeyItems("audio", LC_AUDIO_CATS[1].keys, LC_AUDIO_CATS[1].keys); } },
  snd_events: { l: "Event sounds", items: function () { return lcResetKeyItems("audio", LC_AUDIO_CATS[2].keys, LC_AUDIO_CATS[2].keys); } },
  snd_haptics: { l: "Music and haptics", items: function () { return lcResetKeyItems("audio", LC_AUDIO_CATS[3].keys, LC_AUDIO_CATS[3].keys); } },
  theme: { l: "Theme and colors", items: function () { return [{ id: "theme", l: "Light or dark mode", run: function () { saveTheme("dark"); if (Looscid.LC_SET_THEME) Looscid.LC_SET_THEME("dark"); } }]; } },
  feeds: { l: "Feeds and home", items: function () { return lcResetKeyItems("feeds", null, ["feedSwitch"]); } },
  menu: { l: "Menu", items: function () { return [{ id: "menu", l: "Menu button position and Close buttons", run: function () { if (Looscid.LC_SET_PREFS) Looscid.LC_SET_PREFS(function (p) { return Object.assign({}, p, { menu: { pos: "bottom", hideTopClose: false, hideBotClose: false } }); }); } }]; } },
  posting: { l: "Dreaming", items: function () { return [{ id: "charLimit", l: "Character limit", run: function () { if (Looscid.LC_SET_PREFS) Looscid.LC_SET_PREFS(function (p) { return Object.assign({}, p, { charLimitEnabled: false, charLimit: 280 }); }); } }].concat(lcResetKeyItems("posting")); } },
  media: { l: "Media and translation", items: function () { return lcResetKeyItems("media"); } },
  alertTypes: { l: "Alert types", items: function () { return [{ id: "alertPrefs", l: "Each alert's on, sound and who, and Group similar alerts", run: lcLsDel([LC_ALERT_PREFS_KEY], "looscid:alerts") }]; } },
  quiet: { l: "Quiet hours", items: function () { return lcResetKeyItems("quiet"); } },
  cats: { l: "Category order", items: function () { return [{ id: "catOrder", l: "Category order and hidden categories on Messages and Alerts", run: lcLsDel(["dbm_msg_cat_order", "dbm_msg_cat_hidden", "dbm_alert_cat_order", "dbm_alert_cat_hidden"], "looscid:cats") }]; } },
  perm: { l: "Permissions", items: function () { return lcResetKeyItems("perm").concat([{ id: "audCustom", l: "Custom audience lists", run: function () { try { Object.keys(localStorage).filter(function (k) { return k.indexOf("dbm_aud_custom_perm_") === 0; }).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {} window.dispatchEvent(new CustomEvent("looscid:aud")); } }]); } },
  pmedia: { l: "Media and content", items: function () { return lcResetKeyItems("pmedia"); } },
  blocked: { l: "Blocked", items: function () { return [["dreamers", "Blocked Dreamers"], ["circles", "Blocked Circles"], ["words", "Blocked words"]].map(function (x) { return { id: "bl_" + x[0], l: x[1], run: function () { lcBlockedSet(x[0], []); } }; }); } },
  filters: { l: "Muted words and content warnings", items: function () { return lcResetKeyItems("filters"); } },
  ai: { l: "Cherry settings", items: function () { return lcResetKeyItems("ai").concat([{ id: "habits", l: "Learn from my habits, and what Cherry learned", run: function () { lcLsDel(["dbm_habits"])(); if (Looscid.LC_SET_PREFS) Looscid.LC_SET_PREFS(function (p) { return Object.assign({}, p, { cherry: {} }); }); } }]); } },
  cherry: { l: "Cherry on or off, model and Commandbar answers", items: function () { return [{ id: "aiPrefs", l: "Cherry on or off, model and Commandbar answers", run: lcLsDel([AI_PREFS_KEY], "looscid:llm") }]; } },
  apps: { l: "App settings", items: function () { return [["Insomnia", ["insomnia-os:volume", "insomnia-os:muted", "insomnia-os:mix"]], ["Desktop", ["looscid:volume", "looscid:muted", "looscid:key_sounds", "looscid:beat_genre"]], ["Kernel", ["nexos-real-sound"]]].map(function (x) { return { id: "app_" + x[0].toLowerCase(), l: x[0] + " settings", run: function () { lcLsDel(x[1])(); } }; }); } },
  keyboard: { l: "Keyboard shortcuts", items: function () { return lcResetKeyItems("keyboard"); } },
  drafts: { l: "Drafts and history", items: function () { return [{ id: "drafts", l: "Saved drafts", run: lcLsDel([DRAFTS_KEY]) }, { id: "autosave", l: "Autosaved text in New Dream", run: lcLsDel([LC_AUTOSAVE_KEY]) }, { id: "cmdlog", l: "Commandbar history", run: lcLsDel([LC_CMD_LOG_KEY], "looscid:cmdlog") }]; } },
  keys: { l: "Keys and IDs", danger: true, items: function () { return [{ id: "nostrKey", l: "Nostr key on this device", danger: true, run: function () { try { setStoredNostrSk(null); } catch (e) {} } }, { id: "identity", l: "LooscidID on this device", danger: true, run: lcLsDel([LID_IDENTITY_KEY]) }]; } },
};
Looscid.LC_RESET_G = LC_RESET_G;
const LC_RESET_SECTIONS = [
  ["accessibility", "Accessibility", ["vision", "sr_general", "sr_speech", "verbosity", "sr_braille", "hearing", "motion", "terminal", "motor"]],
  ["sounds", "Sounds", ["snd_volume", "snd_pack", "snd_events", "snd_haptics"]],
  ["customizability", "Customizability", ["theme", "feeds", "menu", "posting", "media"]],
  ["alerts", "Alerts", ["alertTypes", "quiet", "cats"]],
  ["privacy", "Privacy", ["perm", "pmedia", "blocked", "filters"]],
  ["intelligence", "Intelligence", ["ai", "cherry"]],
  ["apps", "Apps", ["apps"]],
  ["keyboard", "Keyboard shortcuts", ["keyboard"]],
  ["drafts", "Drafts and history", ["drafts"]],
  ["keys", "Keys and IDs", ["keys"]],
];
Looscid.LC_RESET_SECTIONS = LC_RESET_SECTIONS;
// scope: "all", a section id, or "g:" + group ids joined with commas (one page).
function lcResetModel(scope) {
  const G = LC_RESET_G;
  if (scope === "all") return { name: "Looscid", groups: LC_RESET_SECTIONS.map(function (s) {
    return { id: s[0], l: s[1], items: s[2].map(function (g) { return { id: g, l: G[g].l, parts: G[g].items(), danger: !!G[g].danger }; }) }; }) };
  const sec = LC_RESET_SECTIONS.find(function (s) { return s[0] === scope; });
  const ids = sec ? sec[2] : String(scope).replace(/^g:/, "").split(",").filter(function (g) { return G[g]; });
  return { name: sec ? sec[1] : (ids.length === 1 ? G[ids[0]].l : ids.map(function (g) { return G[g].l; }).join(" and ")), groups: ids.map(function (g) {
    return { id: g, l: G[g].l, items: G[g].items().map(function (it) { return { id: it.id, l: it.l, parts: [it], danger: !!it.danger }; }) }; }) };
}
function lcOpenReset(scope) { const from = document.activeElement; try { window.dispatchEvent(new CustomEvent("looscid:reset", { detail: { scope: scope, from: from } })); } catch (e) {} }
function LcResetHost() {
  const [st, setSt] = useState(null); // { scope, from }
  const [sel, setSel] = useState({});
  const [open, setOpen] = useState("");
  const [confirm, setConfirm] = useState(null); // the selection waiting for the keys confirm
  const ref = useRef(null), fromRef = useRef(null);
  useEffect(function () {
    const f = function (e) { fromRef.current = e.detail.from; const m = lcResetModel(e.detail.scope); setSel({}); setConfirm(null); setOpen(m.groups.length === 1 ? m.groups[0].id : ""); setSt({ scope: e.detail.scope }); };
    window.addEventListener("looscid:reset", f); return function () { window.removeEventListener("looscid:reset", f); };
  }, []);
  useEffect(function () {
    const d = ref.current; if (!st || !d) return;
    try { if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); } } catch (e) { d.setAttribute("open", ""); }
    setTimeout(function () { const h = document.getElementById("lc-reset-h"); if (h) h.focus(); }, 30);
  }, [st]);
  useEffect(function () { if (confirm) setTimeout(function () { const h = document.getElementById("lc-reset-confirm-h"); if (h) h.focus(); }, 30); }, [confirm]);
  const close = function (said) {
    const d = ref.current; try { if (d && d.open) { if (d.close) d.close(); else d.removeAttribute("open"); } } catch (e) {}
    setSt(null); setConfirm(null);
    const back = fromRef.current; fromRef.current = null;
    setTimeout(function () {
      if (back && back.isConnected && typeof back.focus === "function") back.focus();
      else { const h = document.querySelector("#main-content h1"); if (h) { h.setAttribute("tabindex", "-1"); h.focus(); } }
      if (said) announce(said);
    }, 40);
  };
  if (!st) return lh('dialog', { ref: ref, className: "lc-dialog", "aria-labelledby": "lc-reset-h" });
  const m = lcResetModel(st.scope);
  const key = function (g, it) { return g.id + ":" + it.id; };
  const all = []; m.groups.forEach(function (g) { g.items.forEach(function (it) { all.push([g, it]); }); });
  const doReset = function (list, keysOk) {
    if (!list.length) { announce("Nothing selected. Check the settings to reset first."); return; }
    if (!keysOk && list.some(function (x) { return x[1].danger; })) { setConfirm(list); return; }
    const patch = {}, runs = [], names = [];
    list.forEach(function (x) { x[1].parts.forEach(function (pt) { if (pt.patch) Object.assign(patch, pt.patch); if (pt.run) runs.push(pt.run); }); });
    m.groups.forEach(function (g) { const n = list.filter(function (x) { return x[0] === g; }); if (!n.length) return; if (n.length === g.items.length || m.groups.length > 1 && st.scope !== "all") names.push(g.l); else n.forEach(function (x) { names.push(x[1].l); }); });
    if (Object.keys(patch).length) lcSet(patch);
    runs.forEach(function (r) { try { r(); } catch (e) {} });
    close("Reset: " + (st.scope === "all" && list.length === all.length ? "all Looscid settings" : names.join(", ")) + ".");
  };
  const picked = all.filter(function (x) { return sel[key(x[0], x[1])]; });
  const sectionWord = m.name;
  return lh('dialog', { ref: ref, className: "lc-dialog", "aria-labelledby": "lc-reset-h", "aria-modal": "true",
      onCancel: function (e) { e.preventDefault(); close(); },
      onKeyDown: function (e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } } },
    lh('div', { className: "lc-dlg-top" },
      lh('h2', { id: "lc-reset-h", tabIndex: -1 }, "Reset " + sectionWord + " settings"),
      lh('button', Object.assign({ type: "button", className: "btn bgb lc-btn lc-dlg-x", id: "lc-reset-x", onClick: function () { close(); } }, lcCloseProps("Reset"), { "aria-braillelabel": "Close" }), "\u2715")),
    confirm ? lh('div', { className: "lc-dlg-body" },
      lh('h3', { id: "lc-reset-confirm-h", tabIndex: -1 }, "Remove your keys too?"),
      lh('p', null, "This removes your Nostr key and your LooscidID from this device. Without a backup they can't be recovered, and you'd start fresh as Dreamor."),
      lh('button', { type: "button", id: "lc-reset-keys-yes", className: "btn bp lc-big lc-danger", onClick: function () { doReset(confirm, true); } }, "Yes, remove my keys too"),
      lh('button', { type: "button", id: "lc-reset-keys-no", className: "btn bgb lc-big", onClick: function () { const rest = confirm.filter(function (x) { return !x[1].danger; }); if (rest.length) doReset(rest, true); else setConfirm(null); } }, "Keep my keys")) :
    lh('div', { className: "lc-dlg-body" },
      lh('p', null, st.scope === "all" ? "Choose what to reset, or reset the whole app. Settings come back to their defaults; Flash safety and Calm mode come back on." : "Choose what to reset. Each setting comes back to its default."),
      m.groups.map(function (g) {
        const on = open === g.id, n = g.items.filter(function (it) { return sel[key(g, it)]; }).length;
        const setAll = function (v) { setSel(function (s) { const o = Object.assign({}, s); g.items.forEach(function (it) { o[key(g, it)] = v; }); return o; }); };
        return lh('div', { key: g.id, className: "lc-acc-item" },
          lh('h3', { className: "lc-acc-h" }, lh('button', { type: "button", id: "lc-reset-g-" + g.id, className: "lc-acc-btn", "aria-expanded": on ? "true" : "false", "aria-controls": "lc-reset-p-" + g.id, onClick: function () { setOpen(on ? "" : g.id); } },
            lh('span', null, g.l + (n ? ", " + n + " selected" : "")), lh('span', { className: "msec-toggle-ic" + (on ? " open" : ""), "aria-hidden": "true" }, "\u203a"))),
          lh('div', { id: "lc-reset-p-" + g.id, className: "lc-acc-p", hidden: !on }, on ? lh('fieldset', { className: "lc-fs" },
            lh('legend', { className: "lc-fs-l" }, g.l),
            lh('div', { className: "lc-radios lc-radios-col" },
              g.items.length > 1 ? lh('label', { className: "lc-radio" }, lh('input', { type: "checkbox", id: "lc-reset-all-" + g.id, checked: n === g.items.length, onChange: function () { setAll(n !== g.items.length); } }), lh('span', null, "All of " + g.l)) : null,
              g.items.map(function (it) {
                const k = key(g, it);
                return lh('label', { key: k, className: "lc-radio" }, lh('input', { type: "checkbox", id: "lc-reset-c-" + g.id + "-" + it.id, checked: !!sel[k], onChange: function () { setSel(function (s) { const o = Object.assign({}, s); o[k] = !s[k]; return o; }); } }), lh('span', null, it.l + (it.danger ? ", asks again" : "")));
              }))) : null));
      }),
      lh('button', { type: "button", id: "lc-reset-sel", className: "btn bp lc-big", onClick: function () { doReset(picked, false); } }, "Reset selected" + (picked.length ? " (" + picked.length + ")" : "")),
      lh('button', { type: "button", id: "lc-reset-all", className: "btn bgb lc-big", onClick: function () { doReset(all, false); } }, "Reset all " + sectionWord + " settings")));
}
/* --- Settings > Intelligence (round 5): every Cherry and AI setting, and nowhere else. ----
   Cherry is OFF until you turn it on. Only real controls: the model picker downloads a
   real on-device model (WebLLM, needs WebGPU) after you say yes; nothing leaves the device. */
function lcAiOn() { return getAIPrefs().enabled === true; }
// Settings > Accessibility (round 5): a short menu of categories, Screen reader and braille first.
// Each category is its own page with a Back button (Hasan: "not all one gigantic list").
const LC_A11Y_CATS = [
  { id: "sr", page: "settings_a11y_sr", l: "Screen reader and braille", sub: "General, Speech and Braille tabs, button style on braille" },
  { id: "vision", page: "settings_a11y_vision", l: "Vision", sub: "Text size, high contrast, bold text, spacing" },
  { id: "hearing", page: "settings_a11y_hearing", l: "Hearing", sub: "Captions and visual cues for sounds" },
  { id: "motion", page: "settings_a11y_motion", l: "Motion and seizure", sub: "Calm mode, Flash safety, Reduce Motion" },
  { id: "motor", page: "settings_a11y_motor", l: "Motor and switch", sub: "Larger buttons, strong focus outline" },
  { id: "terminal", page: "settings_a11y_terminal", l: "Commandbar", sub: "How Commandbar output is laid out and read" },
  { id: "audio", page: "settings_audio", l: "Sounds and earcons", sub: "Opens Settings, Sounds: sound packs, volume, keyboard clicks, haptics" },
];
Looscid.LC_A11Y_CATS = LC_A11Y_CATS;
const LC_A11Y_PAGE = {};
Looscid.LC_A11Y_PAGE = LC_A11Y_PAGE;
 LC_A11Y_CATS.forEach(function (c) { if (c.id !== "audio") LC_A11Y_PAGE[c.page] = c; });
/* --- Find a setting (round 5): a native search field at the top of Settings. ---------
   Typing "label" or "braille" lists the matching settings; picking one opens its page
   (and tab) and puts focus on it. The result count goes to the one polite live region. */
const LC_FIND_STATIC = [
  { l: "Button style on braille", pri: true, w: "label labels labeling labelling button role roles edbt btn short role custom braille iphone android", page: "settings_a11y_sr", tab: "braille", focus: "lc-bs-h" },
  { l: "Custom braille label", w: "custom label new custom edbt2 rename delete name braille button labeling", page: "settings_a11y_sr", tab: "braille", focus: "lc-bs-r-new" },
  { l: "Past names for custom braille labels", w: "history past names old names label braille", page: "settings_a11y_sr", tab: "braille", focus: "lc-bs-h" },
  { l: "Text size", w: "font bigger larger", page: "settings_a11y_vision", focus: "a11y-textSize" },
  { l: "High contrast", w: "contrast", page: "settings_a11y_vision", focus: "a11y-highContrast" },
  { l: "Bold text", w: "bold", page: "settings_a11y_vision", focus: "a11y-boldText" },
  { l: "Dyslexia-friendly spacing", w: "dyslexia spacing", page: "settings_a11y_vision", focus: "a11y-dyslexiaFont" },
  { l: "Captions for audio", w: "captions deaf", page: "settings_a11y_hearing", focus: "a11y-captions" },
  { l: "Visual cue instead of sounds", w: "glow visual", page: "settings_a11y_hearing", focus: "a11y-visualCue" },
  { l: "Calm mode", w: "calm quiet", page: "settings_a11y_motion", focus: "a11y-calmMode" },
  { l: "Flash safety", w: "flash seizure epilepsy", page: "settings_a11y_motion", focus: "a11y-flashSafety" },
  { l: "Reduce Motion", w: "motion animation", page: "settings_a11y_motion", focus: "a11y-reduceMotion" },
  { l: "Larger buttons", w: "motor targets big", page: "settings_a11y_motor", focus: "a11y-largeBtns" },
  { l: "Strong focus outline", w: "switch keyboard focus outline", page: "settings_a11y_motor", focus: "a11y-switchAccess" },
  { l: "Commandbar", w: "commandbar command bar terminal console run commands output history", page: "terminal", where: "Apps" },
  { l: "Commandbar output", w: "terminal collapsible expanded latest", page: "settings_a11y_terminal", focus: "a11y-termOutput" },
  { l: "Heading per command", w: "terminal headings", page: "settings_a11y_terminal", focus: "a11y-termHeadings" },
  { l: "Rename screen reader sections", w: "rename tabs general speech braille names", page: "settings_a11y_sr", tab: "general", focus: "lc-rename-h" },
  { l: "Import a sound pack", w: "custom sounds zip import earcons", page: "settings_audio", focus: "lc-imp-h" },
  { l: "Accessibility", w: "a11y categories", page: "settings_accessibility", where: "Settings" },
  { l: "Screen reader and braille", w: "voiceover talkback nvda speech braille", page: "settings_a11y_sr", where: "Settings, Accessibility" },
  { l: "LooscidID", w: "account profile login methods security nostr mastodon bluesky funkwhale hubzilla friendica", page: "settings_account", where: "Settings" },
  { l: "Alerts settings", w: "notifications push quiet hours", page: "settings_notifications", where: "Settings" },
  { l: "Privacy", w: "permissions muted words blocked", page: "settings_privacy", where: "Settings" },
  { l: "Reset", pri: true, w: "reset defaults factory reset start over clear settings", reset: "all", where: "Settings" },
  { l: "Check for updates", w: "update updates new version upgrade refresh", page: "settings_about", focus: "about-check", where: "About Looscid" },
  { l: "Automatically check for updates", w: "auto update updates automatic", page: "settings_about", focus: "about-autoupdate", where: "About Looscid" },
  { l: "Version and version history", w: "version build history changelog release what's new", page: "settings_about", focus: "about-version", where: "About Looscid" },
  { l: "System info", w: "system info device browser storage", page: "settings_about", focus: "about-sys", where: "About Looscid" },
  { l: "Credits and open source", w: "credits open source licenses license thanks third party react nostr-tools noble nexos insomnia feditext v86 fonts repos", page: "credits", where: "Menu, About" },
  { l: "Blocked Dreamers", w: "block dreamer block user blocked list unblock", page: "settings_privacy", priv: "blocked", privTab: "dreamers", focus: "priv-bl-dreamers-in", where: "Settings, Privacy, Blocked and muted" },
  { l: "Blocked Circles", w: "block circle blocked circles", page: "settings_privacy", priv: "blocked", privTab: "circles", focus: "priv-bl-tab-circles", where: "Settings, Privacy, Blocked and muted" },
  { l: "Blocked words", w: "block word blocked words hide words everywhere", page: "settings_privacy", priv: "blocked", privTab: "words", focus: "priv-bl-words-in", where: "Settings, Privacy, Blocked and muted" },
  { l: "Forget what Cherry knows about my media", w: "cherry forget media", page: "settings_privacy", priv: "pmedia", focus: "priv-cherry-forget", where: "Settings, Privacy, Media and content" },
  { l: "Customizability", w: "themes feeds dreaming posting media", page: "settings_customizability", where: "Settings" },
  { l: "Sounds", w: "audio earcons sounds sound pack nexos volume haptics beeps keyboard clicks", page: "settings_audio", where: "Settings" },
  { l: "Keyboard shortcuts", w: "keys shortcuts", page: "settings_keyboard", where: "Settings" },
  { l: "Settings backup", w: "export import reset", page: "settings_backup", where: "Settings" },
  { l: "Intelligence", w: "ai cherry assistant artificial intelligence", page: "settings_intelligence", where: "Settings" },
  { l: "Cherry on or off", w: "ai cherry turn on off enable disable assistant opt in", page: "settings_ai_cherry", focus: "ai-on", where: "Settings, Intelligence, Cherry" },
  { l: "Learn from my habits", w: "ai cherry habits habit learning tips clear", page: "settings_ai_cherry", focus: "ai-habits", where: "Settings, Intelligence, Cherry" },
  { l: "Cherry model", w: "ai model on-device download qwen gemma phi webllm llm", page: "settings_ai_model", focus: "cherry-model", where: "Settings, Intelligence, Cherry model" },
  { l: "Cherry answers in Commandbar", w: "ai Commandbar terminal answers cherry", page: "settings_ai_cmd", focus: "ai-cmd", where: "Settings, Intelligence, Commandbar" },
  { l: "Light mode", w: "theme colors colours dark light appearance", page: "settings_cz_theme", focus: "cz-theme", where: "Settings, Customizability, Theme and colors" },
  { l: "Menu button position", w: "menu top bottom one handed position", page: "settings_cz_menu", focus: "cz-menupos", where: "Settings, Customizability, Menu" },
  { l: "Menu Close buttons", w: "menu close button top bottom", page: "settings_cz_menu", focus: "cz-topclose", where: "Settings, Customizability, Menu" },
  { l: "Character limit", w: "character limit length dream posting", page: "settings_cz_posting", focus: "cz-charlimit", where: "Settings, Customizability, Dreaming" },
  { l: "Keys and IDs", w: "nostr npub key fediverse mastodon bluesky handle link id keys login", page: "settings_account", data: { tab: "keys" }, focus: "lid-panel-h", where: "Settings, LooscidID" },
  { l: "Nostr key", w: "nostr key nsec npub passcode signer relays create key secret key dream on nostr", page: "settings_account", data: { tab: "keys" }, focus: "nostr-key-h", where: "Settings, LooscidID, Keys and IDs" },
  { l: "Looscid Labs and Coming soon", w: "labs planned coming soon roadmap", page: "settings_labs", where: "Settings" },
  { l: "Apps", w: "apps nexos insomnia meme projects easyconvert desktop kernel app store", page: "nexos_apps", where: "Menu, Apps" },
  { l: "Looscid App Store", w: "app store nexos app store store apps install", page: "nexos_apps", focus: "lc-nx-shell-store", where: "Apps, Desktop" },
  { l: "Insomnia sound pack", w: "insomnia sounds sound pack chimes", page: "settings_audio_pack", focus: "set-soundPack", where: "Settings, Sounds, Sound pack", pri: true },
  { l: "Hyper Synth sound pack", w: "synth hyper synth sounds sound pack", page: "settings_audio_pack", focus: "set-soundPack", where: "Settings, Sounds, Sound pack", pri: true },
  { l: "Alerts settings", w: "alerts settings notifications alert types sound who can trigger quiet hours", page: "settings_notifications", where: "Alerts tab, Alerts settings" },
  { l: "Notification settings", w: "notification settings notifications categories order", page: "settings_notifications", where: "Alerts tab, Notifications" },
  { l: "Message settings", w: "message settings messages who can message me categories order starred", page: "settings_messages", where: "Alerts tab, Messages" },
  { l: "App settings", w: "apps app settings insomnia soundscape desktop beat kernel volume", page: "settings_apps", where: "Settings, Apps" },
];
Looscid.LC_FIND_STATIC = LC_FIND_STATIC;
function lcSettingIndex() {
  const out = [];
  LC_SET.forEach(function (d) {
    if (d.k === "findPubky" || d.k === "brailleStyle") return;
    const sp = LC_AUDIO_KEYPAGE[d.k] ? [LC_AUDIO_KEYPAGE[d.k]] : LC_SECTION_PAGE[d.s]; if (!sp) return;
    const sec = LC_SECTIONS[d.s];
    const id = d.k === "earconVolume" ? "a11y-volume" : (d.old ? "a11y-" : "set-") + d.k;
    const ac = LC_AUDIO_KEYPAGE[d.k] ? LC_AUDIO_CATS.find(function (c) { return c.page === LC_AUDIO_KEYPAGE[d.k]; }) : null;
    if (ac) { out.push({ l: d.l, w: (d.al || []).join(" ") + " sound audio", where: "Settings, Sounds, " + ac.l, page: ac.page, focus: id }); return; }
    if (d.pc) { out.push({ l: d.l + " pitch cue", w: (d.al || []).join(" ") + " pitch cue cues", where: "Settings, Accessibility, Screen reader and braille, Verbosity", page: "settings_a11y_sr", tab: "verbosity", focus: id }); return; }
    out.push({ l: d.l, w: (d.al || []).join(" ") + " " + (d.g || ""), where: sec.where + (sp[1] ? ", " + lcSrName(sp[1]) : (sec.t && sec.where.indexOf(sec.t) < 0 ? ", " + sec.t : "")), page: sp[0], tab: sp[1], focus: id,
      priv: sp[0] === "settings_privacy" ? (d.s === "filters" ? "blocked" : d.s) : undefined, privTab: d.s === "filters" ? "words" : undefined });
  });
  // NexOS apps (round 5): each opens inside Looscid.
  LC_NEXOS_APPS.forEach(function (a) { out.push({ l: a.name, w: "app apps nexos " + a.id + " " + a.sub, where: "Apps", page: "nexos_app", data: a }); });
  LC_FIND_STATIC.forEach(function (x) {
    const c = LC_A11Y_PAGE[x.page];
    out.push(Object.assign({ where: x.where || (c ? "Settings, Accessibility, " + c.l + (x.tab ? ", " + lcSrName(x.tab) : "") : "Settings") }, x));
  });
  return out;
}
function lcFindSettings(q) {
  const words = lcNorm(q).split(" ").filter(Boolean); if (!words.length) return [];
  const scored = [];
  lcSettingIndex().forEach(function (e) {
    const lab = lcNorm(e.l), hay = lab + " " + lcNorm(e.w || "") + " " + lcNorm(e.where || "");
    if (!words.every(function (w) { return hay.indexOf(w) >= 0; })) return;
    const s = (e.pri ? -2 : 0) + (lab.indexOf(words[0]) === 0 ? 0 : lab.indexOf(words[0]) >= 0 ? 1 : 2);
    scored.push([s, e]);
  });
  scored.sort(function (a, b) { return a[0] - b[0]; });
  return scored.map(function (x) { return x[1]; });
}
function lcGoSetting(e, navigate) {
  if (e.reset) { setTimeout(function () { lcOpenReset(e.reset); }, 120); return; }
  if (e.tab) { try { sessionStorage.setItem("dbm_sr_tab", e.tab); } catch (x) {} }
  if (e.privTab) { try { sessionStorage.setItem("dbm_priv_tab", e.privTab); } catch (x) {} try { window.dispatchEvent(new CustomEvent("looscid:privtab", { detail: e.privTab })); } catch (x) {} }
  if (e.priv) { try { sessionStorage.setItem("dbm_priv_open", e.priv); } catch (x) {} try { window.dispatchEvent(new CustomEvent("looscid:privopen", { detail: e.priv })); } catch (x) {} }
  navigate(e.page, e.data || null);
  if (!e.focus) return;
  let tries = 0;
  const t = setInterval(function () {
    tries++;
    let el = document.getElementById(e.focus);
    if (el && el.tagName === "FIELDSET") el = el.querySelector("input:checked") || el.querySelector("input,button");
    if (el && el.offsetParent !== null) {
      clearInterval(t);
      if (el.tagName === "H2" || el.tagName === "H3" || el.tagName === "H4") el.setAttribute("tabindex", "-1");
      try { el.scrollIntoView({ block: "center" }); } catch (x) {}
      el.focus();
    } else if (tries > 30) clearInterval(t);
  }, 60);
}
function LcSettingFind({ navigate, onClose }) {
  const [q, setQ] = useState("");
  const res = q.trim() ? lcFindSettings(q) : [];
  return lh('div', { className: "lc-setfind", role: "search", "aria-label": "Settings" },
    lh('label', { htmlFor: "lc-setfind-q", className: "lmenu-label" }, "Find a setting"),
    lh('input', { id: "lc-setfind-q", type: "search", className: "lc-input", value: q, enterKeyHint: "search", autoComplete: "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: false,
      onChange: function (e) { const v = e.target.value; setQ(v); lcAnnounceCount(v, lcFindSettings(v).length, "setting found", "settings found"); },
      onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); if (res.length) { if (onClose) onClose(); lcGoSetting(res[0], navigate); } } else if (e.key === "ArrowDown" && res.length) { e.preventDefault(); const b = document.querySelector(".lc-setfind-res button"); if (b) b.focus(); } } }),
    q.trim() && !res.length ? lh('p', { className: "lc-desc" }, "No settings match \u201c" + q.trim() + "\u201d.") : null,
    res.length ? lh('ul', { className: "lc-setfind-res", role: "list", "aria-label": res.length + (res.length === 1 ? " result" : " results") }, res.slice(0, 25).map(function (e, i) {
      return lh('li', { key: e.l + i }, lh('button', { type: "button", onClick: function () { if (onClose) onClose(); lcGoSetting(e, navigate); } }, e.l, lh('small', null, e.where)));
    })) : null);
}
const TERMS_CONTENT = `<p><strong>Last updated: October 10, 2026</strong></p>
<p>These are the terms for using Looscid, in plain language. They are not legal advice.</p>
<h2>Who we are</h2>
<p>Looscid is a side project by Alhasan, a blind developer. It is not a company, and it has no investors, ads or paid plans.</p>
<h2>Using Looscid</h2>
<ul>
<li>You can use Looscid without a phone number or an email address. Your LooscidID is made on your own device.</li>
<li>You are responsible for the Dreams you share. Follow the <a href="#" data-policy-link="guidelines">Community rules</a>.</li>
<li>Don't use Looscid to break the law, to harass people, or to attack or overload the app or the networks it connects to.</li>
</ul>
<h2>Your content</h2>
<ul>
<li>What you write stays yours. When you Dream through a network you linked, like Mastodon, Bluesky or Nostr, that network's own rules apply there too.</li>
<li>Looscid stores your profile, settings and drafts on your device. You can export or delete them any time in Settings.</li>
</ul>
<h2>Our accessibility commitments</h2>
<ul>
<li>Every feature is built to work with screen readers, like VoiceOver, TalkBack and NVDA, and with braille displays.</li>
<li>Flash safety is on by default, and nothing in Looscid flashes more than three times a second.</li>
<li>If something doesn't work with your screen reader or braille display, that is a bug. Tell us in Send Feedback.</li>
</ul>
<h2>Open source</h2>
<p>Looscid's code is public on <a href="https://github.com/Looscid/Looscid" target="_blank" rel="noopener noreferrer">GitHub</a> under the Looscid Public License.</p>
<h2>No guarantees</h2>
<p>Looscid is a preview built by one person. It is offered as it is. Features can change, break or be removed, and we can't promise it will always be available.</p>
<h2>Changes</h2>
<p>If these terms change, the date at the top changes too, and the update is mentioned in About Looscid.</p>
<h2>Questions</h2>
<p>Use Send Feedback in the menu, or find us on <a href="https://x.com/Looscid" target="_blank" rel="noopener noreferrer">X as @Looscid</a>.</p>`;
Looscid.TERMS_CONTENT = TERMS_CONTENT;
const PRIVACY_CONTENT = `<p><strong>Last updated: October 10, 2026</strong></p>
<p>The short version: Looscid keeps your data on your device, and we don't sell it, track you or show ads.</p>
<h2>What Looscid stores, and where</h2>
<ul>
<li>Your profile, settings, drafts, Dreams and sound packs are saved on this device only, in your browser's storage (the keys start with <code>dbm_</code>).</li>
<li>Replies you write are saved on this device too, the same way. Like Dreams, they are not in Settings backup.</li>
<li>There are no Looscid sign-up servers. Supabase and Cloudflare are gone.</li>
<li>You never need a phone number or an email address, and Looscid never uses them to find you or to suggest you to others.</li>
</ul>
<h2>When Looscid talks to the network</h2>
<ul>
<li>When you link a login method (Nostr, Mastodon and the fediverse, Bluesky, Funkwhale or Hubzilla), Looscid talks straight to that network from your device. Your server may have your email; Looscid never asks for it.</li>
<li>Dreams on Nostr: when you set up a Nostr key in Settings, LooscidID, a Dream with Audience Everyone goes from your device straight to the Nostr relays in your list, and it's public there. Looscid also reads your own Dreams back from those relays, so they show on any device with your key. Your secret key never leaves this device, and it's never in Settings backup. With Audience "Only this device", or without a key, nothing is sent. A reply to a Dream that's on Nostr goes as a Nostr reply (threaded under it), and only with Audience Everyone; Followers only, My Circles and Only this device never leave your device.</li>
<li>Link previews are made on your device from the link alone. Looscid never fetches the linked page. A YouTube, Vimeo or Spotify player loads from that site only when you press Play.</li>
<li>Music and the apps load only when you open them.</li>
<li>Cherry is off until you turn it on. Its on-device model downloads only after you say yes. After that it runs on your device, offline.</li>
<li>When you link a Bluesky or fediverse handle in Keys and IDs, Looscid looks it up once on that network to check it exists. A Nostr public key is checked on your device.</li>
<li>The page itself loads React and a few libraries from a public code CDN (jsDelivr).</li>
</ul>
<h2>Cherry and AI</h2>
<p>Cherry works on your device. Nothing you write is sent to an outside AI service. Translation uses your browser's own on-device translator, when it has one.</p>
<h2>No ads, no tracking, no selling</h2>
<p>Looscid has no ads and no ad trackers, and we never sell or share your data. Looscid sends no crash reports or usage data, so it doesn't ask you about them either.</p>
<h2>Your choices</h2>
<ul>
<li>Export or import all your settings in Settings, Settings backup.</li>
<li>Delete everything Looscid saved on this device in Settings, LooscidID, Data.</li>
<li>Remove a linked login method, key or handle any time in Settings, LooscidID, Keys and IDs.</li>
</ul>
<h2>Accessibility</h2>
<p>Looscid is built for screen readers and braille displays, with captions for sounds, Flash safety on by default, and a hard limit of three flashes a second.</p>`;
Looscid.PRIVACY_CONTENT = PRIVACY_CONTENT;
const GUIDELINES_CONTENT = `<p><strong>Last updated: October 10, 2026</strong></p>
<p>Looscid is for everyone. These rules keep it that way.</p>
<h2>Be respectful</h2>
<ul>
<li>Treat people the way you want to be treated. Disagree with ideas, not with people.</li>
<li>No harassment, threats, hate speech or bullying, and no sharing someone's private information.</li>
</ul>
<h2>Keep it accessible</h2>
<ul>
<li>Add alt text to images and describe videos, so people using a screen reader know what's in them.</li>
<li>Never share flashing or strobing content without a clear warning first. Use a content warning.</li>
<li>Write hashtags in camel case, like #LooscidRocks, so screen readers read them clearly.</li>
</ul>
<h2>Be honest</h2>
<ul>
<li>Don't pretend to be someone else, and don't spam.</li>
<li>Label content made with AI. Cherry adds its own label when it helps you write.</li>
</ul>
<h2>Stay legal</h2>
<p>Don't share anything illegal, including content that exploits children.</p>
<h2>Humor is welcome</h2>
<p>Looscid likes a good joke. Keep it kind.</p>`;
Looscid.GUIDELINES_CONTENT = GUIDELINES_CONTENT;
/* --- APP --------------------------------- */
const NAV = [
  {id:"feed",    l:"Home",     icon:"Home",  badge:0},
  {id:"discover",l:"Discover", icon:"Srch",  badge:0},
  {id:"create",  l:"Create",   icon:"Pls",   isCreate:true},
  {id:"alerts",  l:"Alerts",   icon:"Bell",  badge:6},
  {id:"more",    l:"More",     icon:"Dots",  badge:0},
];
Looscid.NAV = NAV;
/* --- LOCAL PROFILE --------------------------------------------------------
   No accounts and no server: the profile lives only on this device, in
   localStorage. The app opens straight away with a default profile; the
   name can be changed in Settings > LooscidID.
   Login methods (Nostr, Mastodon, Bluesky) attach to it later (see NOSTR_ARCHITECTURE.md) and would
   replace this local profile with a key-based identity.
   ------------------------------------------------------------------------- */
const LOCAL_PROFILE_KEY = "looscid_local_profile";
Looscid.LOCAL_PROFILE_KEY = LOCAL_PROFILE_KEY;
// Sanitize input — strip dangerous characters
function sanitizeInput(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[<>]/g, "").trim();
}
function makeLocalProfile(name) {
  const display = (sanitizeInput(name || "") || "Dreamor").slice(0, 40);
  const slug = display.toLowerCase().replace(/[^a-z0-9_]+/g, "").slice(0, 30) || "dreamor";
  const initials = display.split(/\s+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "D";
  return {
    uid: "local-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    isLocal: true, isGuest: false,
    displayName: display, name: display, handle: "@" + slug, initials: initials,
    color: "#6d28d9", bio: "", email: "", emailVerified: false, photoURL: null,
    joined: new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    createdAt: Date.now(),
  };
}
function saveLocalProfile(p) { try { localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(p)); } catch (e) {} return p; }
function getLocalProfile() {
  try {
    const p = JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY) || "null");
    return p && p.uid && p.displayName ? p : null;
  } catch (e) { return null; }
}
// Mirror the local profile into ME so posts and the profile show the right name
function applyLocalProfileToMe(p) {
  if (!p) return p;
  ME.name = p.displayName; ME.handle = p.handle; ME.initials = p.initials;
  ME.bio = p.bio || ""; ME.website = p.website || ""; ME.links = p.links || [];
  return p;
}
// Your LooscidID is created the moment Looscid first opens (Hasan, Oct 8 2026): no gate,
// no login needed. Login methods attach to it later, and are always optional.
function ensureLocalProfile() {
  const have = getLocalProfile();
  if (have) return applyLocalProfileToMe(have);
  const fresh = saveLocalProfile(makeLocalProfile());
  try { const l = JSON.parse(localStorage.getItem("looscid_security_activity") || "[]"); l.unshift({ at: fresh.createdAt, what: "LooscidID created on this device" }); localStorage.setItem("looscid_security_activity", JSON.stringify(l.slice(0, 20))); } catch (e) {}
  return applyLocalProfileToMe(fresh);
}
function renameLocalProfile(current, name) {
  const fresh = makeLocalProfile(name);
  return applyLocalProfileToMe(saveLocalProfile({ ...(current || {}), displayName: fresh.displayName, name: fresh.name, handle: fresh.handle, initials: fresh.initials, uid: (current && current.uid) || fresh.uid, isLocal: true, isGuest: false }));
}
function resetLocalProfile() {
  try { localStorage.removeItem(LOCAL_PROFILE_KEY); } catch (e) {}
  return ensureLocalProfile();
}
/* --- ANALYTICS (anonymous, optional crash reporting) --------------------- */
const ANALYTICS_KEY = "dbm_analytics_consent";
Looscid.ANALYTICS_KEY = ANALYTICS_KEY;
function getAnalyticsConsent() { try { return localStorage.getItem(ANALYTICS_KEY); } catch (e2) { return null; } }
function setAnalyticsConsent(v) { try { localStorage.setItem(ANALYTICS_KEY, v); } catch (e3) {} }
function AnalyticsBanner({ onDone }) {
  return (
    React.createElement('div', { className: "analytics-banner", role: "dialog", "aria-modal": "true", 'aria-label': "Analytics consent" ,}
      , React.createElement('div', null
        , React.createElement('div', { style: {fontWeight:700,fontSize:15,marginBottom:6},}, "Help improve Looscid" )
        , React.createElement('div', { style: {fontSize:13,color:"var(--tx2)",marginBottom:16,lineHeight:1.6},}, "Can we collect "
             , React.createElement('strong', null, "anonymous crash reports"), "? No Dreams, no messages — only error types and which screen crashed."
        )
        , React.createElement('div', { style: {display:"flex",gap:10,marginBottom:10},}
          , React.createElement('button', { className:"btn bgb", style:{flex:1,padding:12,fontSize:14},
            onClick: ()=>{setAnalyticsConsent("no");onDone();},}, "No thanks" )
          , React.createElement('button', { className:"btn bp", style:{flex:1,padding:12,fontSize:14},
            onClick: ()=>{setAnalyticsConsent("yes");onDone();},}, "Yes, help improve" )
        )
        , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",textAlign:"center"},}, "Completely anonymous. No ads. Change anytime in Settings." )
      )
    )
  );
}
/* --- WELCOME SCREEN (first login) ---------------------------------------- */
const WELCOME_KEY = "dbm_welcome_seen";
Looscid.WELCOME_KEY = WELCOME_KEY;
function getWelcomeSeen() { try { return localStorage.getItem(WELCOME_KEY)==="true"; } catch (e) { return false; } }
function setWelcomeSeen() { try { localStorage.setItem(WELCOME_KEY,"true"); } catch (e) {} }
/* ==========================================================================
   Looscid - FEATURE PACK 2
   Features: Multi-AI, @Cherry tagging, grammar/spelling, symbol picker,
   inline calculations, auto-linking, AI attribution, habit prediction,
   learning system, source citations, accessibility enhancements
   ========================================================================== */

/* --- MULTI-AI CONFIG ------------------------------------------------------ */
const AI_PROVIDERS = [
  {id:"cherry",   name:"Cherry",   icon:"Cherry", desc:"Looscid's own AI — best for Dreams", default:true},
  {id:"claude",   name:"Claude",   icon:"🟠", desc:"Deep reasoning and writing"},
  {id:"chatgpt",  name:"ChatGPT",  icon:"🟢", desc:"Creative and conversational"},
  {id:"gemini",   name:"Gemini",   icon:"🔵", desc:"Search and real-time info"},
];
Looscid.AI_PROVIDERS = AI_PROVIDERS;
const AI_PREFS_KEY = "dbm_ai_prefs";
Looscid.AI_PREFS_KEY = AI_PREFS_KEY;
function getAIPrefs() { try { return JSON.parse(localStorage.getItem(AI_PREFS_KEY)||"{}"); } catch (e16) { return {}; } }
function setAIPrefs(p) { try { localStorage.setItem(AI_PREFS_KEY, JSON.stringify(p)); } catch (e17) {} }
function getActiveAI() { const p=getAIPrefs(); return p.active||"cherry"; }
/* --- HABIT & LEARNING ENGINE ---------------------------------------------- */
const HABITS_KEY = "dbm_habits";
Looscid.HABITS_KEY = HABITS_KEY;
function getHabits() { try { return JSON.parse(localStorage.getItem(HABITS_KEY)||"{}"); } catch (e18) { return {}; } }
function recordHabit(action, meta) {
  try {
    const h = getHabits();
    const key = action;
    if (!h[key]) h[key] = {count:0, times:[], meta:[]};
    h[key].count++;
    h[key].times.push(Date.now());
    if (meta) h[key].meta.push(meta);
    if (h[key].times.length > 50) h[key].times = h[key].times.slice(-50);
    if (h[key].meta.length > 20) h[key].meta = h[key].meta.slice(-20);
    localStorage.setItem(HABITS_KEY, JSON.stringify(h));
  } catch (e19) {}
}
function getPredictions() {
  const h = getHabits();
  const now = new Date();
  const hour = now.getHours();
  const preds = [];
  if (h.postDream && h.postDream.count >= 3) {
    const recentTimes = h.postDream.times.slice(-10).map(t => new Date(t).getHours());
    const avgHour = Math.round(recentTimes.reduce((a,b)=>a+b,0)/recentTimes.length);
    if (Math.abs(hour - avgHour) <= 2) preds.push("It looks like this is your usual Dream time Ready to share something?");
  }
  if (h.openCherry && h.openCherry.count >= 5) preds.push("Cherry is here whenever you need a thought partner");
  if (h.likeDream && h.likeDream.count >= 10) preds.push("You've been active today! Cherry noticed you love Dreams about " + (h.likeDream.meta.slice(-3).join(", ")||"consciousness") + ".");
  return preds;
}
/* --- SMART SPELLING & GRAMMAR -------------------------------------------- */
const COMMON_TYPOS = {
  "teh":"the","adn":"and","recieve":"receive","occured":"occurred",
  "seperately":"separately","definately":"definitely","existance":"existence",
  "relevent":"relevant","occurance":"occurrence","wierd":"weird",
  "freind":"friend","beleive":"believe","acheive":"achieve","accross":"across",
  "begining":"beginning","calender":"calendar","comming":"coming",
  "daed":"dead","dreamm":"dream","dreamms":"dreams",
};
Looscid.COMMON_TYPOS = COMMON_TYPOS;
function spellCheck(text) {
  const words = text.split(/(\s+|[.,!?])/);
  const fixes = [];
  words.forEach((word, i) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g,"");
    if (COMMON_TYPOS[clean]) {
      fixes.push({word, suggestion: COMMON_TYPOS[clean], index: i});
    }
  });
  return fixes;
}
function applySpellFix(text, original, replacement) {
  const re = new RegExp('\\b' + original + '\\b', 'gi');
  return text.replace(re, replacement);
}
/* --- AUTO-LINK DETECTOR --------------------------------------------------- */
function detectAutoLinks(text) {
  const links = [];
  // "Listen to: Song, Artist"
  const listenMatch = text.match(/listen to:\s*([^,\n]+?)(?:,\s*([^\n]+))?(?:\s+on\s+(\w+))?/i);
  if (listenMatch) links.push({type:"music", title:listenMatch[1].trim(), artist:listenMatch[2]?listenMatch[2].trim():undefined, platform:listenMatch[3]||"Spotify"});
  // "Watch: video description"
  const watchMatch = text.match(/watch:\s*([^\n]+)/i);
  if (watchMatch) links.push({type:"video", title:watchMatch[1].trim(), platform:"YouTube"});
  // "Download: app name"
  const dlMatch = text.match(/download:\s*([^\n]+)/i);
  if (dlMatch) links.push({type:"app", title:dlMatch[1].trim()});
  // "@Cherry mention"
  const cherryMatch = text.match(/@cherry\s+(.+)/i);
  if (cherryMatch) links.push({type:"cherry", query:cherryMatch[1].trim()});
  return links;
}
/* --- AI ATTRIBUTION ------------------------------------------------------- */
const ATTRIB_KEY = "dbm_cherry_attrib";
Looscid.ATTRIB_KEY = ATTRIB_KEY;
function getAttribPref() { try { return localStorage.getItem(ATTRIB_KEY)||"visible"; } catch (e25) { return "visible"; } }
/* --- HABIT INSIGHT CARD --------------------------------------------------- */
function HabitInsightCard({ onDismiss }) {
  const preds = getPredictions();
  if (!preds.length) return null;
  return React.createElement('div', {className:"insight-card"},
    React.createElement('div', {style:{display:"flex",alignItems:"flex-start",gap:10}},
      React.createElement('div', {style:{fontSize:22,flexShrink:0}}, "Cherry"),
      React.createElement('div', {style:{flex:1}},
        React.createElement('div', {style:{fontWeight:700,fontSize:13,marginBottom:4}}, "Cherry noticed"),
        React.createElement('div', {style:{fontSize:12,color:"var(--tx2)",lineHeight:1.55}}, preds[0])
      ),
      React.createElement('button', {style:{background:"none",border:"none",color:"var(--tx3)",cursor:"pointer",fontSize:16,padding:2}, onClick:onDismiss, 'aria-label':"Dismiss"}, "×")
    )
  );
}
/* --- ERROR BOUNDARY ------------------------------------------------------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  componentDidCatch(err, info) {
    this.setState({ error: err });
    console.error("Looscid Error:", err, info);
  }
  static getDerivedStateFromError(err) {
    return { error: err };
  }
  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: {padding:30,fontFamily:"monospace",background:"#1a0000",color:"#ff6b6b",
                minHeight:"100vh",wordBreak:"break-word",whiteSpace:"pre-wrap"}
      },
        React.createElement('div', {style:{fontSize:18,marginBottom:12}}, "Something went wrong"),
        React.createElement('div', {style:{background:"#2a0000",padding:16,borderRadius:8,
                                           marginBottom:12,fontSize:13}},
          this.state.error.message
        ),
        React.createElement('div', {style:{fontSize:11,color:"#ff9999"}},
          this.state.error.stack
        ),
        React.createElement('button', {
          style:{marginTop:16,padding:"10px 20px",background:"#ef4444",border:"none",
                 color:"#fff",borderRadius:8,cursor:"pointer",fontSize:14},
          onClick: () => window.location.reload()
        }, "Reload app")
      );
    }
    return this.props.children;
  }
}
Looscid.ErrorBoundary = ErrorBoundary;
/* --- MAIN MENU ------------------------------------------------------------ */
function MainMenu({ onClose, navigate, goRoot, prefs, unreadNotifs, unreadMsgs, appDreams, initOpen, initFocus }) {
  const pos = (prefs.menu || {}).pos || "bottom";
  const likedCount = appDreams ? appDreams.filter(d => d.liked).length : 0;
  const totalAlerts = unreadNotifs + unreadMsgs;
  const [open, setOpen] = useState(() => initOpen ? {[initOpen]: true} : {});
  // Back from a Settings screen reopens this menu on the item it came from.
  useEffect(() => {
    if (!initOpen) return;
    const t = setTimeout(() => {
      const body = document.getElementById("msec-" + initOpen);
      const item = body && initFocus ? Array.from(body.querySelectorAll(".mitem")).find(b => b.getAttribute("aria-label") === initFocus) : null;
      const el = item || document.querySelector('button.msec-toggle[aria-controls="msec-' + initOpen + '"]');
      if (el) el.focus();
    }, 30);
    return () => clearTimeout(t);
  }, []);
  const toggle = id => setOpen(o => ({...o, [id]: !o[id]}));
  const isOpen = id => !!open[id]; // default closed

  const SECTIONS = [
    { id:"cherry", emoji:"Cherry", label:"Cherry AI", items:[
      lcAiOn()
        ? { icon:"Cherry", label:"Open Cherry",     sub:"Your on-device assistant", special:"cherry", action(){onClose();goRoot("cherry");} }
        : { icon:"Cherry", label:"Turn on Cherry",  sub:"Cherry is off. Opens Settings, Intelligence", action(){onClose();navigate("settings_ai_cherry");} },
    ]},
    { id:"discover", emoji:"Discover", label:"Discover", items:[
      { icon:"Discover", label:"Discover", sub:"Dreamers, topics, trending", discoverLink:true, action(){onClose();goRoot("discover");} },
      { icon:"Circles", label:"Circles",  sub:"Your communities",                              action(){onClose();goRoot("circles");} },
    ]},
    { id:"apps", emoji:"Apps", label:"Apps", items: lcAppItems().map(function (it) { return { icon: it.l, label: it.l, sub: it.sub, action(){ onClose(); it.go(navigate); } }; }) },
    { id:"create", emoji:"Create", label:"Create", items:[
      { icon:"New Dream", label:"New Dream",   sub:"Write and share a Dream",   action(){onClose();goRoot("create");} },
      { icon:"New Circle", label:"New Circle",  sub:"Start a Circle",        action(){onClose();goRoot("create");} },
    ]},
    { id:"alerts", emoji:"Alerts", label:"Alerts", badge:totalAlerts, items:[
      { icon:"Messages", label:"Messages",      sub:"Private Dreams",           badge:unreadMsgs,   action(){onClose();goRoot("alerts");} },
      { icon:"Notifications", label:"Notifications", sub:"Likes, follows, mentions", badge:unreadNotifs, action(){onClose();goRoot("alerts");} },
    ]},

    { id:"settings", emoji:"Settings", label:"Settings", top: true, items:[
      { icon:"LooscidID", label:"LooscidID",       sub:"Profile, login methods and security",              action(){onClose();navigate("settings_account");} },
      { icon:"Alerts", label:"Alerts",          sub:"New Dreams, mentions, replies, quiet hours", action(){onClose();navigate("settings_notifications");} },
      { icon:"Privacy", label:"Privacy",         sub:"Visibility, blocked users",   action(){onClose();navigate("settings_privacy");} },
      { icon:"Customizability", label:"Customizability", sub:"Theme, feeds, menu, Dreaming, media",     action(){onClose();navigate("settings_customizability");} },
      { icon:"Accessibility", label:"Accessibility",  sub:"Screen reader and braille, vision, hearing, motion",  action(){onClose();navigate("settings_accessibility");} },
      { icon:"Audio", label:"Sounds",  sub:"Earcons, sound packs, keyboard clicks, your own sounds, haptics",  action(){onClose();navigate("settings_audio");} },
      { icon:"Apps", label:"Apps",  sub:"Insomnia, Meme Projects, Easyconvert, Desktop and Kernel",  action(){onClose();navigate("settings_apps");} },
      { icon:"Keyboard", label:"Keyboard shortcuts",  sub:"Built-in keys and your own shortcuts",  action(){onClose();navigate("settings_keyboard");} },
      { icon:"Backup", label:"Settings backup",  sub:"Export, import or reset all settings",  action(){onClose();navigate("settings_backup");} },
      { icon:"Intelligence", label:"Intelligence", sub:"Cherry, the on-device model, Commandbar answers",  action(){onClose();navigate("settings_intelligence");} },
      { icon:"Labs", label:"Looscid Labs", sub:"Early access to features we are still building", action(){onClose();navigate("settings_labs");} },
      { icon:"Reset", label:"Reset", sub:"Reset the whole app, or just some settings", action(){ lcOpenReset("all"); } },
    ]},
    { id:"about", emoji:"About", label:"About", items:[
      { icon:"About", label:"About Looscid", sub:"Our story, version, what's new and credits", action(){onClose();navigate("settings_about");} },
      { icon:"Credits", label:"Credits and open source", sub:"Projects Looscid uses and learned from, with their licenses", action(){onClose();navigate("credits");} },
      { icon:"Feedback", label:"Send Feedback", sub:"Tell us what works and what doesn't", action(){onClose();navigate("feedback");} },
      { icon:"Intro", label:"Welcome intro", sub:"The welcome intro and terminology guide", action(){onClose();navigate("intro");} },
      { icon:"Terms", label:"Terms",   sub:"Plain-language terms",  action(){onClose();navigate("terms");} },
      { icon:"Privacy", label:"Privacy", sub:"What stays on your device",       action(){onClose();navigate("privacy");} },
      { icon:"Rules", label:"Community rules", sub:"How we treat each other",       action(){onClose();navigate("guidelines");} },
        { icon:"License", label:"License", sub:"Looscid Public License", href:"LICENSE" },
        { icon:"Commitments", label:"Commitments", sub:"Accessibility, fairness, humor", href:"COMMITMENTS.md" },
    ]},
    { id:"findus", emoji:"Social", label:"Social", intro:"Find us on your favorite platforms", items:[

      { icon:"\ud835\udd4f", label:"Twitter",         sub:"@Looscid",                href:"https://x.com/Looscid" },

      { icon:"GitHub", label:"GitHub",            sub:"Looscid/Looscid",        href:"https://github.com/Looscid/Looscid" },
    ]},
  ];

  return React.createElement('div', {
    className:"menu-ov",
    onClick:e=>{if(e.target===e.currentTarget)onClose();},
    role:"dialog","aria-modal":"true","aria-label":"Main menu",
  },
    React.createElement('div', {className:"menu-sh "+(pos==="top"?"from-top":"from-bot")},

      React.createElement('button', Object.assign({type:"button",className:"mclose-btn mclose-top",onClick:onClose}, lcCloseProps("menu")), "Close"),

      SECTIONS.map(function(s) {
        var sOpen = isOpen(s.id);
        return React.createElement(React.Fragment, {key:s.id},

          React.createElement('h2', {className:"msec-hdr",style:{padding:0}},
            // Disclosure button pattern (round 5): a real button, aria-expanded, and a panel shown or
            // hidden with the hidden attribute. Nothing else hides it, so VoiceOver always agrees.
            React.createElement('button', {
              type:"button",
              id:"msec-btn-"+s.id,
              className:"msec-toggle",
              onClick:function(){ toggle(s.id); },
              "aria-expanded":sOpen ? "true" : "false",
              "aria-controls":"msec-"+s.id,
              "aria-braillelabel": Looscid.A11Y_NOW.brailleOutput ? s.label : undefined,
            },
              React.createElement('span', {style:{display:"flex",alignItems:"center",gap:7}},
                React.createElement('span', null, s.label),
                s.badge>0 ? React.createElement('span', {className:"mitem-badge",style:{marginLeft:4}}, React.createElement('span',{className:"sr-only"},", "), s.badge, React.createElement('span',{className:"sr-only"}," unread")) : null
              ),
              React.createElement('span', {className:"msec-toggle-ic"+(sOpen?" open":""),"aria-hidden":"true"}, "\u203a")
            )
          ),

          React.createElement('div', {
            id:"msec-"+s.id,
            className:"msec-body",
            hidden: !sOpen,
          },
            s.intro ? React.createElement('p', {style:{padding:"8px 16px",margin:0,fontSize:12,color:"var(--tx2)"}}, s.intro) : null,
            s.top && sOpen ? lh(LcSettingFind, { navigate: navigate, onClose: onClose }) : null,             React.createElement('ul', {className:"mlist", role:"list"}, s.items.map(function(item) {
              var subId = "msub-" + s.id + "-" + item.label.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
              var hasBadge = item.badge>0;
              var hasCount = item.count!=null;
              var badge = hasBadge ? React.createElement('span',{key:"b",style:{fontWeight:700,color:"var(--rd)"}},", "+item.badge) : null;
              var count = hasCount ? React.createElement('span',{key:"c",className:"mitem-count"}, item.count) : null;
              var ariaLabel = item.label+(hasBadge?", "+item.badge+" unread":"")+(hasCount?", "+item.count:"");
              var itemStyle = item.special==="cherry"
                ? {background:"linear-gradient(135deg,rgba(109,40,217,.1),rgba(147,51,234,.05))",borderBottom:"1px solid rgba(168,85,247,.2)"}
                : item.discoverLink
                  ? {borderLeft:"2px solid var(--ac2)",background:"rgba(109,40,217,.04)"}
                  : {};
              var iconEl = React.createElement('span',{key:"ic",className:"mitem-ic","aria-hidden":"true"}, item.icon);
              var lblEl  = React.createElement('span',{key:"lbl",className:"mitem-lbl"},
                item.label, badge
              );
              // Round 6: the sub line is its own paragraph after the control (see lcSubLine), never part of it.
              var subP = null, subCls = "";
              if (item.href) {
                return React.createElement('li', {key:item.label, className:"mli"}, React.createElement('a',{
                  className:"mitem" + subCls, href:item.href,
                  target:"_blank", rel:"noopener noreferrer",
                  style:Object.assign({},itemStyle,{textDecoration:"none",color:"inherit"}),
                  "aria-label":ariaLabel,
                }, iconEl, lblEl, React.createElement('span',{key:"ext",style:{fontSize:11,color:"var(--ac3)"},"aria-hidden":"true"}, "\u2197")), subP);
              }
              return React.createElement('li', {key:item.label, className:"mli"}, React.createElement('button',{
                className:"mitem" + subCls, disabled: !!item.soon, "aria-disabled": item.soon ? "true" : undefined,
                style:itemStyle, onClick:item.soon ? undefined : item.action, "aria-label":ariaLabel,
              }, iconEl, lblEl, count,
                React.createElement(Ic.Chv,{key:"chv",style:{width:13,height:13,color:"var(--tx3)",flexShrink:0},"aria-hidden":"true"})
              ), subP);
            }))
          )
        );
      }),

      React.createElement('button', Object.assign({type:"button",className:"mclose-btn mclose-bot",onClick:onClose}, lcCloseProps("menu")), "Close")
    )
  );
}
/* === LooscidID, "CHANGE YOUR INFO" AND FIRST-RUN ONBOARDING ===============
   Built from Hasan's design docs (Looscid Business, Halfview,
   ID Manager, Overview). Accessibility first: every control
   is a real link/button/field with its value in its name, each change screen
   focuses its heading, Escape/Close return focus, saves are announced in a
   polite live region, and braille-display Enter works in every edit box.
   ======================================================================== */
const lh = React.createElement;
Looscid.lh = lh;
// One polite live region for short confirmations ("Profile saved").
// Verbosity (Settings, Accessibility, Screen reader and braille, Verbosity): stored as short / normal / detailed.
function lcVerb() { const v = (typeof Looscid.A11Y_NOW !== "undefined" && Looscid.A11Y_NOW && Looscid.A11Y_NOW.verbosity) || "normal"; return v === "short" ? "low" : v === "detailed" ? "high" : "medium"; }
// Hints ("Press Control K for commands", "double tap to open"): High always, Medium with Screen reader hints on, Low never.
function lcHints() { const v = lcVerb(); return v === "high" || (v === "medium" && !!(Looscid.A11Y_NOW && Looscid.A11Y_NOW.screenReader)); }
const LC_ERR_RE = /\b(couldn't|can't|cannot|failed|error|isn't allowed|not allowed|went wrong)\b/i;
Looscid.LC_ERR_RE = LC_ERR_RE;
const LC_OK_RE = /(^saved\b|\b(saved|posted|dreamed|copied|sent|deleted|added|removed|imported|exported)\.?$)/i;
Looscid.LC_OK_RE = LC_OK_RE;
Looscid.LC_ANN_AT = 0;
// kind: "confirm" (Medium and High), "nav" or "hint" (High only); anything else is essential and always said.
// A message that reads like a confirmation ("Profile saved.") counts as one.
function announce(msg, kind) {
  const vb = lcVerb(), s = String(msg || "");
  const isErr = kind === "error" || (kind !== "success" && LC_ERR_RE.test(s));
  const isOk = !isErr && (kind === "success" || kind === "confirm" || LC_OK_RE.test(s.trim()));
  if (!isErr && (kind === "confirm" || (!kind && isOk)) && vb === "low") return;
  if ((kind === "nav" || kind === "hint") && vb !== "high") return;
  if (isErr) lcPitchCue("error"); else if (isOk && LC_OK_RE.test(s.trim())) lcPitchCue("success");
  const el = document.getElementById("looscid-live");
  if (!el) return;
  Looscid.LC_ANN_AT = Date.now();
  el.textContent = "";
  setTimeout(function () { el.textContent = msg; }, 80);
}
// Enter from a keyboard or a braille display (which can arrive as
// beforeinput insertParagraph/insertLineBreak instead of keydown Enter).
function useEnterSubmit(onEnter) {
  const cb = useRef(onEnter); cb.current = onEnter;
  const cleanup = useRef(null);
  // Callback ref: attaches when the edit box mounts (even if it appears later).
  return useCallback(function (el) {
    if (cleanup.current) { cleanup.current(); cleanup.current = null; }
    if (!el) return;
    let last = 0;
    const fire = function (e) {
      e.preventDefault();
      const now = Date.now(); if (now - last < 250) return; last = now;
      if (cb.current) cb.current();
    };
    const onKey = function (e) { if (e.key === "Enter" && !e.isComposing && !e.shiftKey) fire(e); };
    const onBefore = function (e) { if (e.inputType === "insertParagraph" || e.inputType === "insertLineBreak") fire(e); };
    el.addEventListener("keydown", onKey);
    el.addEventListener("beforeinput", onBefore);
    cleanup.current = function () { el.removeEventListener("keydown", onKey); el.removeEventListener("beforeinput", onBefore); };
  }, []);
}
/* --- Profile fields ------------------------------------------------------ */
function updateLocalProfile(current, patch) {
  const base = current || getLocalProfile() || makeLocalProfile();
  const next = Object.assign({}, base, patch, { isLocal: true, isGuest: false });
  if (patch.displayName !== undefined) {
    next.name = next.displayName;
    next.initials = next.displayName.split(/\s+/).filter(Boolean).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase() || "D";
  }
  return applyLocalProfileToMe(saveLocalProfile(next));
}
/* --- Menu pop-up button (borrowed from Hasan's iOS popover pattern) ------ */
// One pop-up menu for the whole app (round 5): the mini pop-up the Language menu uses.
// A real button (aria-haspopup="menu", aria-expanded) opens a small list right under it:
// menuitemradio with a check for choices, menuitem for actions. Up/Down, Home/End and
// type-ahead move, Enter, Space or braille Enter picks, Escape or Tab closes and focus goes back
// to the button. The last item is always Close (speech "Close <menu>", braille "Close").
// Optional: a search field on top (search: "Search models") and group headings (item.group).
function LcMenu(props) {
  const id = props.id, items = props.items || [], value = props.value, action = props.kind === "action";
  const menuId = props.menuId || id + "-menu", menuName = props.title || props.label || "menu";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [inList, setInList] = useState(true);
  const [q, setQ] = useState("");
  const [place, setPlace] = useState(null);
  const btnRefI = useRef(null), btnRef = props.btnRef || btnRefI, listRef = useRef(null), wrapRef = useRef(null), qRef = useRef(null), ta = useRef({ s: "", at: 0 });
  const ql = q.trim().toLowerCase();
  const shown = items.filter(function (it) { return !ql || (it.name + " " + (it.group || "") + " " + (it.note || "") + " " + (it.words || "")).toLowerCase().indexOf(ql) >= 0; });
  const all = shown.concat([{ id: "__close", name: "Close", close: true }]);
  const current = action ? null : items.find(function (it) { return it.id === value; });
  const openMenu = function (at) {
    const i = typeof at === "number" ? at : Math.max(0, items.findIndex(function (it) { return it.id === value; }));
    setQ(""); setActive(Math.min(i, items.length)); setInList(!props.search); setPlace(null); setOpen(true);
  };
  // Keep the whole menu on screen and above the tab bar. A menu that ran under the bar
  // sent VoiceOver's double-tap to the bar's button instead of the option.
  React.useLayoutEffect(function () {
    if (!open || place) return;
    const w = wrapRef.current, b = btnRef.current, L = w && w.querySelector(".lmenu-list");
    if (!L || !b) return;
    const lim = lcViewLimits(), br = b.getBoundingClientRect(), h = L.scrollHeight;
    const below = lim.bottom - br.bottom - 8, above = br.top - lim.top - 8;
    const up = props.up ? !(above < h && below > above) : (h > below && above > below);
    const room = Math.max(Math.floor(up ? above : below), 132);
    setPlace({ up: up, max: h > room ? room : null });
  }, [open, place]);
  useEffect(function () {
    if (!open || !place) return;
    const w = wrapRef.current, L = w && w.querySelector(".lmenu-list"); if (!L) return;
    const lim = lcViewLimits(), r = L.getBoundingClientRect();
    const d = r.bottom > lim.bottom ? r.bottom - lim.bottom + 8 : (r.top < lim.top ? r.top - lim.top - 8 : 0);
    if (!d) return;
    let sp = w.parentElement;
    while (sp && sp !== document.documentElement) { const s = getComputedStyle(sp); if (/(auto|scroll)/.test(s.overflowY) && sp.scrollHeight > sp.clientHeight) { sp.scrollTop += d; return; } sp = sp.parentElement; }
    window.scrollBy(0, d);
  }, [open, place]);
  useEffect(function () {
    if (!open) return;
    if (props.search && !inList) { if (qRef.current) qRef.current.focus(); return; }
    const el = listRef.current && listRef.current.querySelectorAll("[data-mi]")[active];
    if (el) el.focus();
  }, [open, active, inList]);
  useEffect(function () {
    if (!open) return;
    const onDoc = function (e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", onDoc, true);
    return function () { document.removeEventListener("pointerdown", onDoc, true); };
  }, [open]);
  const close = function () { if (btnRef.current) btnRef.current.focus(); setOpen(false); };
  const choose = function (it) {
    if (!it) return;
    if (it.close) { close(); return; }
    if (it.disabled) return;
    if (btnRef.current) btnRef.current.focus();
    setOpen(false);
    if (props.onSelect) props.onSelect(it.id, it);
  };
  const typeAhead = function (key) {
    const now = Date.now(); ta.current.s = (now - ta.current.at > 700 ? "" : ta.current.s) + key.toLowerCase(); ta.current.at = now;
    const s = ta.current.s, n = all.length, start = s.length === 1 ? active + 1 : active;
    for (let k = 0; k < n; k++) { const j = (start + k) % n; if (all[j].name.toLowerCase().indexOf(s) === 0) { setActive(j); return; } }
  };
  const onMenuKey = function (e) {
    const n = all.length, k = e.key;
    if (k === "ArrowDown") { e.preventDefault(); e.stopPropagation(); setActive((active + 1) % n); }
    else if (k === "ArrowUp") { e.preventDefault(); e.stopPropagation(); if (props.search && active === 0) setInList(false); else setActive((active - 1 + n) % n); }
    else if (k === "Home") { e.preventDefault(); e.stopPropagation(); setActive(0); }
    else if (k === "End") { e.preventDefault(); e.stopPropagation(); setActive(n - 1); }
    else if (k === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    else if (k === "Tab") { setOpen(false); }
    else if (k === "Enter" || k === " ") { e.preventDefault(); e.stopPropagation(); choose(all[active]); }
    else if (k.length === 1 && /\S/.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); e.stopPropagation(); typeAhead(k); }
  };
  const onSearchKey = function (e) {
    e.stopPropagation();
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(0); setInList(true); }
    else if (e.key === "Enter") { e.preventDefault(); if (shown.length) choose(shown[0]); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") { setOpen(false); }
  };
  const labelled = !props.hideLabel && props.label;
  const btnText = props.btnText != null ? props.btnText : (current ? (props.prefix || "") + current.name : (props.placeholder || "Choose"));
  const itemEl = function (it, i) {
    const radio = !action && !it.close;
    return lh('li', { key: it.id, "data-mi": "1", role: radio ? "menuitemradio" : "menuitem", "aria-checked": radio ? (it.id === value ? "true" : "false") : undefined,
        "aria-disabled": it.disabled ? "true" : undefined, tabIndex: i === active ? 0 : -1,
        "aria-label": it.close ? "Close " + menuName : (it.aria || undefined), "aria-braillelabel": it.close ? "Close" : undefined,
        className: "lmenu-item" + (i === active ? " act" : "") + (it.close ? " lmenu-close" : "") + (it.danger ? " lmenu-danger" : "") + (props.itemClass && !it.close ? " " + props.itemClass : ""),
        onClick: function () { choose(it); }, onMouseMove: function () { if (active !== i) setActive(i); } },
      radio ? lh('span', { className: "lmenu-check", "aria-hidden": "true" }, it.id === value ? "\u2713" : "") : null,
      lh('span', null, it.name, it.note ? lh('span', { className: "lmenu-note" }, ", " + it.note) : null,
        // High verbosity: position, like "2 of 5" (Close is not counted).
        !it.close && lcVerb() === "high" ? lh('span', { className: "sr-only" }, ", " + (all.filter(function (x) { return !x.close; }).indexOf(it) + 1) + " of " + all.filter(function (x) { return !x.close; }).length) : null));
  };
  // Group headings: each group is role=group, named by its heading.
  const body = [];
  let gi = 0;
  if (shown.some(function (it) { return it.group; })) {
    const order = []; const byG = {};
    shown.forEach(function (it) { const g = it.group || "Other"; if (!byG[g]) { byG[g] = []; order.push(g); } byG[g].push(it); });
    let idx = 0;
    order.forEach(function (g) {
      const gid = menuId + "-g" + (gi++);
      body.push(lh('li', { key: gid, role: "group", "aria-labelledby": gid + "-h", className: "lmenu-grp" },
        lh('div', { id: gid + "-h", className: "lmenu-grp-h", role: "presentation" }, g),
        lh('ul', { role: "none", className: "lmenu-ul" }, byG[g].map(function (it) { return itemEl(it, idx++); }))));
    });
    // flat order must match `all`: rebuild it group by group
    all.splice(0, all.length - 1);
    order.forEach(function (g) { byG[g].forEach(function (it) { all.splice(all.length - 1, 0, it); }); });
    body.push(itemEl(all[all.length - 1], all.length - 1));
  } else all.forEach(function (it, i) { body.push(itemEl(it, i)); });
  return lh('div', { className: "lmenu" + (props.inline ? " lmenu-inline" : "") + (props.align === "right" ? " lmenu-right" : "") + (props.className ? " " + props.className : ""), ref: wrapRef, style: props.style },
    labelled ? lh('span', { id: id + "-label", className: "lmenu-label" }, props.label) : null,
    lh('button', { id: id, ref: btnRef, type: "button", className: props.btnClass || "lmenu-btn", "aria-haspopup": "menu", "aria-expanded": open ? "true" : "false",
        "aria-controls": open ? menuId : undefined, "aria-labelledby": labelled ? id + "-label " + id : undefined, "aria-label": labelled ? undefined : props.btnLabel,
        "aria-braillelabel": props.btnBraille, disabled: props.disabled,
        onClick: function () { open ? setOpen(false) : openMenu(); },
        onKeyDown: function (e) { if (e.key === "ArrowDown") { e.preventDefault(); openMenu(props.search ? undefined : 0); } else if (e.key === "ArrowUp") { e.preventDefault(); openMenu(items.length - 1); } } },
      typeof btnText === "string" ? lh('span', null, btnText) : btnText,
      props.noCaret ? null : lh('span', { className: "lmenu-caret", "aria-hidden": "true" }, open ? "\u25B4" : "\u25BE")),
    open && lh('div', { className: "lmenu-list" + ((place ? place.up : props.up) ? " lmenu-up" : ""), style: place && place.max ? { maxHeight: place.max + "px" } : undefined },
      props.search ? lh('input', { ref: qRef, type: "search", className: "lmenu-search", "aria-label": props.search, placeholder: props.search, value: q, enterKeyHint: "go",
        "aria-controls": menuId, onChange: function (e) { const v = e.target.value; setQ(v); setActive(0); lcAnnounceCount(v, items.filter(function (it) { return (it.name + " " + (it.group || "") + " " + (it.note || "") + " " + (it.words || "")).toLowerCase().indexOf(v.trim().toLowerCase()) >= 0; }).length, "match", "matches"); }, onKeyDown: onSearchKey }) : null,
      lh('ul', { id: menuId, role: "menu", ref: listRef, className: "lmenu-ul", "aria-label": menuName, onKeyDown: onMenuKey }, body)));
}
// The part of the screen a pop-up can use: below any fixed header, above the bottom tab bar.
function lcViewLimits() {
  const vv = window.visualViewport, H = vv ? vv.height : window.innerHeight;
  let bottom = H;
  const nav = document.querySelector(".bnav");
  if (nav) { const r = nav.getBoundingClientRect(); if (r.height && r.top < bottom && !nav.closest("[inert]")) bottom = r.top; }
  return { top: 0, bottom: bottom };
}
// Result counts for search fields go through the one polite live region, after typing pauses.
Looscid.LC_COUNT_T = null;
function lcAnnounceCount(q, n, one, many) { clearTimeout(Looscid.LC_COUNT_T); if (!String(q || "").trim()) return; Looscid.LC_COUNT_T = setTimeout(function () { announce(n === 0 ? "No " + many : n + " " + (n === 1 ? one : many)); }, 450); }
// Kept for the older call sites (LooscidID): the same component.
function MenuPopupButton(props) { return lh(LcMenu, props); }
/* --- LooscidID: identity store and Nostr ------------------------------------
   Everything here stays on this device. Dreams on Nostr (Round 6.4) live in js/nostr.js:
   it talks only to the relays in your list, and only when you have a key or a public key set. */
const LID_IDENTITY_KEY = "looscid_identity";
Looscid.LID_IDENTITY_KEY = LID_IDENTITY_KEY;
const LID_NOSTR_SK_KEY = "dbm_nostr_sk"; // was looscid_nostr_sk; moved on first read
Looscid.LID_NOSTR_SK_KEY = LID_NOSTR_SK_KEY;
function getIdentity() { try { return JSON.parse(localStorage.getItem(LID_IDENTITY_KEY) || "null"); } catch (e) { return null; } }
function setIdentity(v) {
  try { if (v) localStorage.setItem(LID_IDENTITY_KEY, JSON.stringify(v)); else localStorage.removeItem(LID_IDENTITY_KEY); } catch (e) {}
  if (v && v.provider === "nostr") addMethod({ provider: "nostr", publicId: v.npub || v.pubkey, how: v.method === "nip07" ? "signer extension" : "key on this device", nostrMethod: v.method });
  return v;
}
/* Login methods linked to this LooscidID (public identifiers only; one ID, many logins).
   Secrets never live here: a Nostr key made on this device is kept under its own key,
   and network sessions/tokens under looscid_sessions, all on this device only. */
const LID_METHODS_KEY = "looscid_signin_methods";
Looscid.LID_METHODS_KEY = LID_METHODS_KEY;
const LID_SESSIONS_KEY = "looscid_sessions";
Looscid.LID_SESSIONS_KEY = LID_SESSIONS_KEY;
function getMethods() {
  try { const m = JSON.parse(localStorage.getItem(LID_METHODS_KEY) || "null"); if (Array.isArray(m)) return m; } catch (e) {}
  const idn = getIdentity(); const list = [];
  if (idn && idn.provider === "nostr") list.push({ id: "nostr:" + (idn.npub || idn.pubkey), provider: "nostr", publicId: idn.npub || idn.pubkey, how: idn.method === "nip07" ? "signer extension" : "key on this device", nostrMethod: idn.method, at: idn.at || Date.now() });
  try { localStorage.setItem(LID_METHODS_KEY, JSON.stringify(list)); } catch (e) {}
  return list;
}
function saveMethods(list) { try { localStorage.setItem(LID_METHODS_KEY, JSON.stringify(list)); } catch (e) {} window.dispatchEvent(new CustomEvent("looscid-methods")); return list; }
function addMethod(m) {
  const id = m.provider + ":" + m.publicId;
  const list = getMethods().filter(function (x) { return x.provider !== m.provider; }); // one login per network
  list.push(Object.assign({ id: id, at: Date.now() }, m));
  logActivity((PROVIDER_NAMES[m.provider] || m.provider) + " login added");
  return saveMethods(list);
}
// Recent security activity, kept only on this device (Account > Security).
const LID_ACTIVITY_KEY = "looscid_security_activity";
Looscid.LID_ACTIVITY_KEY = LID_ACTIVITY_KEY;
function getActivity() { try { return JSON.parse(localStorage.getItem("looscid_security_activity") || "[]"); } catch (e) { return []; } }
function logActivity(what) { try { const l = getActivity(); l.unshift({ at: Date.now(), what: what }); localStorage.setItem("looscid_security_activity", JSON.stringify(l.slice(0, 20))); } catch (e) {} }
function getSessions() { try { return JSON.parse(localStorage.getItem(LID_SESSIONS_KEY) || "{}"); } catch (e) { return {}; } }
function setSession(provider, data) { const s = getSessions(); if (data) s[provider] = data; else delete s[provider]; try { localStorage.setItem(LID_SESSIONS_KEY, JSON.stringify(s)); } catch (e) {} }
function removeMethod(id) {
  const m = getMethods().find(function (x) { return x.id === id; });
  if (m && m.provider === "nostr") { setStoredNostrSk(null); try { localStorage.removeItem(LID_IDENTITY_KEY); } catch (e) {} }
  if (m) { setSession(m.provider, null); logActivity((PROVIDER_NAMES[m.provider] || m.provider) + " login removed"); }
  return saveMethods(getMethods().filter(function (x) { return x.id !== id; }));
}
const PROVIDER_NAMES = { nostr: "Nostr", activitypub: "Mastodon & fediverse", atproto: "Bluesky", pubky: "Pubky", funkwhale: "Funkwhale", hubzilla: "Hubzilla" };
Looscid.PROVIDER_NAMES = PROVIDER_NAMES;
function setStoredNostrSk(hex) { try { if (hex) { localStorage.setItem(LID_NOSTR_SK_KEY, hex); localStorage.removeItem("dbm_nostr_ncryptsec"); } else { localStorage.removeItem(LID_NOSTR_SK_KEY); localStorage.removeItem("dbm_nostr_ncryptsec"); } } catch (e) {} try { window.dispatchEvent(new Event("looscid-nostr")); } catch (e) {} }
function signOutIdentity() { const m = getMethods().find(function (x) { return x.provider === "nostr"; }); if (m) removeMethod(m.id); else { setStoredNostrSk(null); setIdentity(null); } }
// Round 6.4: nostr-tools is vendored (js/vendor, see its README) and loaded by js/nostr.js only when
// a Nostr feature is used. No CDN.
function loadNostrTools() {
  if (window.NostrTools && window.NostrTools.nip49) return Promise.resolve(window.NostrTools);
  return Looscid.lcNostr ? Looscid.lcNostr.load() : Promise.reject(new Error("load"));
}
function bytesToHex(b) { return Array.from(b, function (x) { return x.toString(16).padStart(2, "0"); }).join(""); }
function hexToBytes(hex) { const out = new Uint8Array(hex.length / 2); for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16); return out; }
function shortNpub(npub) { return npub ? npub.slice(0, 12) + "\u2026" + npub.slice(-6) : ""; }
function identityLabel(idn) {
  if (!idn) return "Local profile on this device";
  if (idn.provider === "nostr") return "Nostr, " + (idn.method === "nip07" ? "signer extension" : "key on this device") + ", " + shortNpub(idn.npub || idn.pubkey);
  return idn.provider;
}
// Show-key secure field (password type, Show key toggle). Never logged.
function SecretField({ id, label, value, onChange, readOnly, describedBy, inputRef }) {
  const [shown, setShown] = useState(false);
  return lh(React.Fragment, null,
    lh('label', { htmlFor: id, className: "lid-label" }, label),
    lh('div', { className: "lid-secret" },
      lh('input', { id: id, ref: inputRef, className: "inp", type: shown ? "text" : "password", value: value, readOnly: !!readOnly, autoComplete: "off", spellCheck: false,
        autoCapitalize: "off", onChange: onChange ? function (e) { onChange(e.target.value); } : undefined }),
      lh('button', { type: "button", className: "btn bgb", 'aria-pressed': shown ? "true" : "false", 'aria-controls': id,
        onClick: function () { setShown(!shown); } }, "Show key")));
}
function NostrPanel({ onDone }) {
  const hasExt = typeof window !== "undefined" && !!window.nostr && typeof window.nostr.getPublicKey === "function";
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [created, setCreated] = useState(null);   // {nsec, npub}
  const [showPaste, setShowPaste] = useState(false);
  const [paste, setPaste] = useState("");
  const savedHead = useRef(null);
  const fail = function (t) { setMsg(t); announce(t); setBusy(false); };
  useEffect(function () { if (created && savedHead.current) savedHead.current.focus(); }, [created]);

  const useExtension = async function () {
    setBusy(true); setMsg("");
    try {
      const pk = await window.nostr.getPublicKey();
      if (typeof pk !== "string" || !/^[0-9a-f]{64}$/i.test(pk)) return fail("Your signer extension didn't share a valid public key.");
      let npub = null; try { const NT = await loadNostrTools(); npub = NT.nip19.npubEncode(pk.toLowerCase()); } catch (e) {}
      setStoredNostrSk(null);
      setIdentity({ provider: "nostr", method: "nip07", pubkey: pk.toLowerCase(), npub: npub, at: Date.now() });
      setBusy(false); announce("Logged in with your Nostr signer extension");
      onDone("Logged in with your Nostr signer extension.");
    } catch (e) { fail("Your signer extension said no, or was closed. Nothing was saved."); }
  };
  const createKey = async function () {
    setBusy(true); setMsg("");
    let NT; try { NT = await loadNostrTools(); } catch (e) { return fail("Couldn't load the Nostr tools. Check your connection and try again."); }
    const sk = NT.generateSecretKey(); const pk = NT.getPublicKey(sk);
    setStoredNostrSk(bytesToHex(sk));
    const npub = NT.nip19.npubEncode(pk);
    setIdentity({ provider: "nostr", method: "local", pubkey: pk, npub: npub, at: Date.now() });
    setCreated({ nsec: NT.nip19.nsecEncode(sk), npub: npub });
    setBusy(false);
  };
  const usePasted = async function () {
    const v = (paste || "").trim();
    if (!v) return fail("Paste your nsec key first.");
    setBusy(true);
    let NT; try { NT = await loadNostrTools(); } catch (e) { return fail("Couldn't load the Nostr tools. Check your connection and try again."); }
    let sk = null;
    try { const d = NT.nip19.decode(v); if (d.type === "nsec") sk = d.data; } catch (e) {}
    if (!sk && /^[0-9a-f]{64}$/i.test(v)) sk = hexToBytes(v.toLowerCase());
    if (!sk) return fail("That isn't a valid nsec key. Check it and try again.");
    const pk = NT.getPublicKey(sk);
    setStoredNostrSk(bytesToHex(sk));
    setIdentity({ provider: "nostr", method: "local", pubkey: pk, npub: NT.nip19.npubEncode(pk), at: Date.now(), imported: true });
    setPaste(""); setBusy(false);
    announce("Logged in with your Nostr key");
    onDone("Logged in with your Nostr key. It's saved only on this device.");
  };
  const pasteRef = useEnterSubmit(usePasted);

  if (created) return lh('div', { className: "lid-panel" },
    lh('h3', { className: "lid-sub", tabIndex: -1, ref: savedHead }, "Save your secret key now"),
    lh('p', { className: "lid-warn", id: "lid-nsec-warn" }, "This is the only key to your LooscidID. Anyone who has it can Dream as you, and if you lose it nobody can get it back. Save it in a password manager now. Looscid shows it only this once and keeps it only on this device."),
    lh(SecretField, { id: "lid-nsec-new", label: "Your secret key (nsec)", value: created.nsec, readOnly: true, describedBy: "lid-nsec-warn" }),
    lh('p', { className: "lid-help" }, "Your public key (npub), safe to share: ", lh('span', { className: "lid-mono" }, created.npub)),
    lh('div', { className: "lid-actions" },
      lh('button', { type: "button", className: "btn bgb", onClick: function () {
        if (navigator.clipboard) navigator.clipboard.writeText(created.nsec).then(function () { announce("Secret key copied"); }, function () { announce("Couldn't copy. Use Show key and copy it yourself."); });
      } }, "Copy key"),
      lh('button', { type: "button", className: "btn bp", onClick: function () { setCreated(null); announce("Your LooscidID is ready"); onDone("Your LooscidID is ready. Your key is saved only on this device."); } }, "I saved my key")));

  return lh('div', { className: "lid-panel" },
    lh('p', { className: "lid-help" }, "Nostr is a powerful way of communication, and your key works everywhere Nostr is supported."),
    hasExt
      ? lh('button', { type: "button", className: "btn bp lid-wide", disabled: busy, onClick: useExtension }, "Login with my Nostr signer extension")
      : lh('p', { className: "lid-help" }, "No Nostr signer extension was found in this browser. A signer extension, like Alby or nos2x, keeps your key safest. You can also create a key on this device."),
    lh('button', { type: "button", className: "btn " + (hasExt ? "bgb" : "bp") + " lid-wide", disabled: busy, onClick: createKey }, "Create a new key on this device"),
    lh('button', { type: "button", className: "lid-disclose", 'aria-expanded': showPaste ? "true" : "false", 'aria-controls': "lid-paste",
      onClick: function () { setShowPaste(!showPaste); } }, "I already have a key (last resort)"),
    lh('div', { id: "lid-paste", className: "lid-pastebox", hidden: !showPaste },
      lh('p', { className: "lid-warn", id: "lid-paste-warn" }, "Warning: pasting your secret key into any website is the most common way Nostr accounts get stolen. Use a signer extension if you can. If you continue, your key stays only on this device and is never sent anywhere."),
      lh(SecretField, { id: "lid-nsec-paste", label: "Enter nsec key", value: paste, onChange: setPaste, describedBy: "lid-paste-warn", inputRef: pasteRef }),
      lh('button', { type: "button", className: "btn bgb lid-wide", disabled: busy, onClick: usePasted }, "Continue to setup")),
    msg && lh('p', { className: "lid-err" }, msg));
}
/* --- Mastodon / fediverse: real OAuth 2 with PKCE, all in the browser ------- */
const LID_OAUTH_PENDING = "looscid_oauth_pending";
Looscid.LID_OAUTH_PENDING = LID_OAUTH_PENDING;
function b64url(bytes) { let s = ""; bytes.forEach(function (b) { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function randomToken(n) { const a = new Uint8Array(n || 32); crypto.getRandomValues(a); return b64url(a); }
async function pkceChallenge(verifier) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)); return b64url(new Uint8Array(d)); }
function appRedirectUri() { return location.origin + location.pathname; }
function normalizeHost(v) { v = (v || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^@?[^@]*@/, ""); return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(v) ? v : null; }
async function startMastodonLogin(hostInput, from) {
  const host = normalizeHost(hostInput);
  if (!host) throw new Error("Type your server, like mastodon.social.");
  const redirect = appRedirectUri();
  // Mastodon 4.3+ has a "profile" scope that only reads your public profile; older servers and
  // Friendica, GoToSocial, Akkoma and Pleroma get "read:accounts". Never any email scope.
  let scope = "read:accounts";
  try { const mr = await fetch("https://" + host + "/.well-known/oauth-authorization-server"); if (mr.ok) { const meta = await mr.json(); if (meta && Array.isArray(meta.scopes_supported) && meta.scopes_supported.indexOf("profile") >= 0) scope = "profile"; } } catch (e) {}
  const body = new URLSearchParams({ client_name: "Looscid", redirect_uris: redirect, scopes: scope, website: redirect });
  let app;
  try { const r = await fetch("https://" + host + "/api/v1/apps", { method: "POST", body: body }); if (!r.ok) throw new Error(); app = await r.json(); }
  catch (e) { throw new Error("Couldn't reach " + host + ", or it doesn't accept new apps. Check the server name."); }
  if (!app || !app.client_id) throw new Error(host + " didn't register Looscid. Try again.");
  const verifier = randomToken(48), state = randomToken(16);
  try { localStorage.setItem(LID_OAUTH_PENDING, JSON.stringify({ provider: "activitypub", host: host, client_id: app.client_id, client_secret: app.client_secret, verifier: verifier, state: state, redirect: redirect, scope: scope, from: from || "account", at: Date.now() })); } catch (e) {}
  const q = new URLSearchParams({ response_type: "code", client_id: app.client_id, redirect_uri: redirect, scope: scope, state: state, code_challenge: await pkceChallenge(verifier), code_challenge_method: "S256" });
  location.assign("https://" + host + "/oauth/authorize?" + q.toString());
}
// Funkwhale (music and podcasts): its own OAuth2 apps. Looscid asks only for "read:libraries" and
// never for the profile scope, because Funkwhale's read:profile includes your email address.
async function startFunkwhaleLogin(hostInput, from) {
  const host = normalizeHost(hostInput); if (!host) throw new Error("Type your Funkwhale server, like open.audio.");
  const redirect = appRedirectUri(), scope = "read:libraries";
  let app;
  try { const r = await fetch("https://" + host + "/api/v1/oauth/apps/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Looscid", redirect_uris: redirect, scopes: scope }) }); if (!r.ok) throw new Error(); app = await r.json(); }
  catch (e) { throw new Error("Couldn't reach " + host + ", or it doesn't accept new apps. Check the server name."); }
  if (!app || !app.client_id) throw new Error(host + " didn't register Looscid. Try again.");
  const verifier = randomToken(48), state = randomToken(16);
  try { localStorage.setItem(LID_OAUTH_PENDING, JSON.stringify({ provider: "funkwhale", host: host, client_id: app.client_id, client_secret: app.client_secret, verifier: verifier, state: state, redirect: redirect, scope: scope, from: from || "account", at: Date.now() })); } catch (e) {}
  const q = new URLSearchParams({ response_type: "code", client_id: app.client_id, redirect_uri: redirect, scope: scope, state: state, code_challenge: await pkceChallenge(verifier), code_challenge_method: "S256" });
  location.assign("https://" + host + "/authorize?" + q.toString());
}
// Hubzilla: OAuth2 with a client you add in your hub (Settings, OAuth2 apps). No email needed by Looscid.
async function startHubzillaLogin(hostInput, clientId, clientSecret, from) {
  const host = normalizeHost(hostInput); if (!host) throw new Error("Type your hub, like hub.example.org.");
  if (!String(clientId || "").trim()) throw new Error("Type the client ID from your hub's OAuth2 apps page.");
  const redirect = appRedirectUri(), state = randomToken(16), verifier = randomToken(48);
  try { localStorage.setItem(LID_OAUTH_PENDING, JSON.stringify({ provider: "hubzilla", host: host, client_id: clientId.trim(), client_secret: String(clientSecret || "").trim(), verifier: verifier, state: state, redirect: redirect, scope: "", from: from || "account", at: Date.now() })); } catch (e) {}
  const q = new URLSearchParams({ response_type: "code", client_id: clientId.trim(), redirect_uri: redirect, state: state, code_challenge: await pkceChallenge(verifier), code_challenge_method: "S256" });
  location.assign("https://" + host + "/authorize?" + q.toString());
}
const LID_OAUTH_NAMES = { activitypub: "Mastodon", funkwhale: "Funkwhale", hubzilla: "Hubzilla" };
Looscid.LID_OAUTH_NAMES = LID_OAUTH_NAMES;
async function lidOAuthIdentity(p, token) {
  const H = { Authorization: "Bearer " + token };
  if (p.provider === "activitypub") {
    const vr = await fetch("https://" + p.host + "/api/v1/accounts/verify_credentials", { headers: H });
    const acct = await vr.json(); if (!vr.ok || !acct.username) throw new Error("verify");
    return "@" + acct.username + "@" + p.host;
  }
  if (p.provider === "funkwhale") {
    // Without the profile scope there is no "who am I" call; your own libraries carry your handle when you have one.
    try { const r = await fetch("https://" + p.host + "/api/v1/libraries/?scope=me", { headers: H }); const j = await r.json(); const a = j && j.results && j.results[0] && j.results[0].actor; if (a && a.full_username) return "@" + a.full_username; } catch (e) {}
    return "Funkwhale account on " + p.host;
  }
  try { const r = await fetch("https://" + p.host + "/api/account/verify_credentials", { headers: H }); const j = await r.json(); if (r.ok && (j.screen_name || j.name)) return "@" + (j.screen_name || j.name) + "@" + p.host; } catch (e) {}
  return "Hubzilla channel on " + p.host;
}
// Runs once at startup: finishes a Mastodon login when we come back with ?code=&state=.
Looscid.oauthReturn = null;
async function finishOAuthIfReturning() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code"), state = params.get("state"), err = params.get("error");
  let pending = null; try { pending = JSON.parse(localStorage.getItem(LID_OAUTH_PENDING) || "null"); } catch (e) {}
  if (!pending || (!code && !err) || state !== pending.state) return null;
  try { localStorage.removeItem(LID_OAUTH_PENDING); } catch (e) {}
  history.replaceState(null, "", location.pathname + location.hash);
  const prov = pending.provider || "activitypub", pname = LID_OAUTH_NAMES[prov] || "Fediverse";
  if (err || !code) return { ok: false, from: pending.from, msg: pname + " login was cancelled. Nothing was linked." };
  try {
    const tokenUrl = prov === "funkwhale" ? "https://" + pending.host + "/api/v1/oauth/token/" : prov === "hubzilla" ? "https://" + pending.host + "/token" : "https://" + pending.host + "/oauth/token";
    const tr = await fetch(tokenUrl, { method: "POST", body: new URLSearchParams({ grant_type: "authorization_code", code: code, client_id: pending.client_id, client_secret: pending.client_secret || "", redirect_uri: pending.redirect, code_verifier: pending.verifier, scope: pending.scope || "read:accounts" }) });
    const tok = await tr.json(); if (!tr.ok || !tok.access_token) throw new Error("token");
    const handle = await lidOAuthIdentity(Object.assign({ provider: prov }, pending), tok.access_token);
    setSession(prov, { host: pending.host, handle: handle, token: tok.access_token });
    addMethod({ provider: prov, publicId: handle, how: "linked" });
    return { ok: true, from: pending.from, msg: pname + " linked as " + handle + "." };
  } catch (e) { return { ok: false, from: pending.from, msg: "Couldn't finish logging in with " + pending.host + ". Nothing was linked. Try again." }; }
}
// Start finishing a Mastodon login the moment the app loads (the URL carries ?code=).
Looscid.oauthReturn = finishOAuthIfReturning();
function useOAuthReturn(from, cb) {
  useEffect(function () {
    let alive = true;
    if (!Looscid.oauthReturn) Looscid.oauthReturn = finishOAuthIfReturning();
    Looscid.oauthReturn.then(function (r) { if (alive && r && (!from || r.from === from) && !r.used) { r.used = true; announce(r.ok ? "Login method added" : r.msg); cb(r); } });
    return function () { alive = false; };
  }, []);
}
function MastodonPanel({ onDone, from }) {
  const [host, setHost] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const go = async function () {
    setBusy(true); setMsg("");
    try { await startMastodonLogin(host, from); } catch (e) { setMsg(e.message); announce(e.message); setBusy(false); }
  };
  const ref = useEnterSubmit(go);
  return lh('div', { className: "lid-panel" },
    lh('p', { className: "lid-help" }, "Log in with Mastodon or another server that speaks the Mastodon API: Friendica, GoToSocial, Akkoma or Pleroma. You'll go to your server to approve Looscid, then come straight back. Looscid only asks to read your public profile. Your server may have your email; Looscid never sees it."),
    lh('label', { htmlFor: "lid-masto-host", className: "lid-label" }, "Your server"),
    lh('input', { id: "lid-masto-host", ref: ref, className: "inp", type: "text", inputMode: "url", autoCapitalize: "off", spellCheck: false, placeholder: "mastodon.social", value: host, onChange: function (e) { setHost(e.target.value); } }),
    lh('button', { type: "button", className: "btn bp lid-wide", disabled: busy, onClick: go }, busy ? "Opening your server\u2026" : "Continue to your server"),
    msg && lh('p', { className: "lid-err" }, msg));
}
function LidOAuthPanel({ kind, from }) {
  const [host, setHost] = useState(""), [cid, setCid] = useState(""), [sec, setSec] = useState("");
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState("");
  const go = async function () {
    setBusy(true); setMsg("");
    try { if (kind === "funkwhale") await startFunkwhaleLogin(host, from); else await startHubzillaLogin(host, cid, sec, from); }
    catch (e) { setMsg(e.message); announce(e.message); setBusy(false); }
  };
  const ref = useEnterSubmit(go);
  const fw = kind === "funkwhale";
  return lh('div', { className: "lid-panel" },
    lh('p', { className: "lid-help" }, fw
      ? "Log in with your Funkwhale server for music and podcasts. Looscid asks only to read your libraries, never your profile, because Funkwhale's profile permission includes your email."
      : "Log in with your Hubzilla hub. First add an app in your hub under Settings, OAuth2 apps, with this redirect address: " + appRedirectUri() + ". Then type the hub and the client ID it gives you. Looscid needs no email."),
    lh('label', { htmlFor: "lid-" + kind + "-host", className: "lid-label" }, fw ? "Your Funkwhale server" : "Your hub"),
    lh('input', { id: "lid-" + kind + "-host", ref: fw ? ref : undefined, className: "inp", type: "text", inputMode: "url", autoCapitalize: "off", spellCheck: false, placeholder: fw ? "open.audio" : "hub.example.org", value: host, onChange: function (e) { setHost(e.target.value); } }),
    fw ? null : lh(React.Fragment, null,
      lh('label', { htmlFor: "lid-hz-cid", className: "lid-label" }, "Client ID"),
      lh('input', { id: "lid-hz-cid", className: "inp", type: "text", autoCapitalize: "off", spellCheck: false, value: cid, onChange: function (e) { setCid(e.target.value); } }),
      lh('label', { htmlFor: "lid-hz-sec", className: "lid-label" }, "Client secret, if your hub shows one"),
      lh('input', { id: "lid-hz-sec", ref: ref, className: "inp", type: "password", autoCapitalize: "off", spellCheck: false, value: sec, onChange: function (e) { setSec(e.target.value); } })),
    lh('button', { type: "button", className: "btn bp lid-wide", disabled: busy, onClick: go }, busy ? "Opening your server\u2026" : "Continue to your server"),
    msg && lh('p', { className: "lid-err" }, msg));
}
function FunkwhalePanel(p) { return lh(LidOAuthPanel, Object.assign({ kind: "funkwhale" }, p)); }
function HubzillaPanel(p) { return lh(LidOAuthPanel, Object.assign({ kind: "hubzilla" }, p)); }
/* --- Bluesky / AT Protocol: handle + app password (createSession at your PDS) - */
async function resolvePds(handle) {
  const r = await fetch("https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=" + encodeURIComponent(handle));
  const j = await r.json(); if (!r.ok || !j.did) throw new Error("handle");
  const did = j.did;
  const docUrl = did.startsWith("did:plc:") ? "https://plc.directory/" + did : did.startsWith("did:web:") ? "https://" + did.slice(8) + "/.well-known/did.json" : null;
  if (!docUrl) throw new Error("did");
  const d = await (await fetch(docUrl)).json();
  const svc = (d.service || []).find(function (s) { return s.id === "#atproto_pds" || s.type === "AtprotoPersonalDataServer"; });
  if (!svc) throw new Error("pds");
  return { did: did, pds: svc.serviceEndpoint.replace(/\/$/, "") };
}
function BlueskyPanel({ onDone }) {
  const [handle, setHandle] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const go = async function () {
    const h = (handle || "").trim().replace(/^@/, "").toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(h)) { setMsg("Type your full handle, like name.bsky.social."); announce("Type your full handle, like name.bsky.social."); return; }
    if (!pw.trim()) { setMsg("Paste an app password."); announce("Paste an app password."); return; }
    setBusy(true); setMsg("");
    let where; try { where = await resolvePds(h); } catch (e) { setBusy(false); const t = "Couldn't find " + h + " on Bluesky. Check the handle."; setMsg(t); announce(t); return; }
    try {
      const r = await fetch(where.pds + "/xrpc/com.atproto.server.createSession", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: where.did, password: pw.trim() }) });
      const s = await r.json(); if (!r.ok || !s.accessJwt || s.did !== where.did) throw new Error();
      setSession("atproto", { did: s.did, handle: s.handle, pds: where.pds, accessJwt: s.accessJwt, refreshJwt: s.refreshJwt });
      setPw(""); setBusy(false);
      addMethod({ provider: "atproto", publicId: "@" + s.handle, how: "app password", did: s.did });
      onDone("Bluesky linked as @" + s.handle + ".");
    } catch (e) { setBusy(false); setPw(""); const t = "Bluesky didn't accept that app password. Nothing was linked."; setMsg(t); announce(t); }
  };
  const ref = useEnterSubmit(go);
  return lh('div', { className: "lid-panel" },
    lh('p', { className: "lid-warn", id: "lid-bsky-warn" }, "Use an app password, never your main password. Make one in Bluesky under Settings, Privacy and security, App passwords. Looscid keeps your session only on this device and never stores the password."),
    lh('label', { htmlFor: "lid-bsky-handle", className: "lid-label" }, "Bluesky handle"),
    lh('input', { id: "lid-bsky-handle", className: "inp", type: "text", autoCapitalize: "off", spellCheck: false, placeholder: "name.bsky.social", value: handle, onChange: function (e) { setHandle(e.target.value); } }),
    lh(SecretField, { id: "lid-bsky-pw", label: "App password", value: pw, onChange: setPw, describedBy: "lid-bsky-warn", inputRef: ref }),
    lh('button', { type: "button", className: "btn bp lid-wide", disabled: busy, onClick: go }, busy ? "Logging in\u2026" : "Link Bluesky"),
    msg && lh('p', { className: "lid-err" }, msg));
}
/* --- Alert dialog (role=alertdialog, focus trap, Escape cancels) ------------ */
function AlertDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  const boxRef = useRef(null); const cancelRef = useRef(null);
  useEffect(function () { const prev = document.activeElement; if (cancelRef.current) cancelRef.current.focus(); return function () { if (prev && prev.focus && document.contains(prev)) prev.focus(); }; }, []);
  const onKey = function (e) {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onCancel(); return; }
    if (e.key !== "Tab") return;
    const f = boxRef.current.querySelectorAll("button"); const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return lh('div', { className: "lid-alert-bg" },
    lh('div', { ref: boxRef, className: "lid-alert", role: "alertdialog", 'aria-modal': "true", 'aria-labelledby': "lid-alert-t", onKeyDown: onKey },
      lh('h2', { id: "lid-alert-t", className: "lid-sub" }, title),
      lh('p', { id: "lid-alert-m", className: "lid-help" }, message),
      lh('div', { className: "lid-actions" },
        lh('button', { type: "button", ref: cancelRef, className: "btn bgb", onClick: onCancel }, "Cancel"),
        lh('button', { type: "button", className: "btn bp", onClick: onConfirm }, confirmLabel))));
}
// Every decentralized network gets one entry here. Adding a network = one entry.
const ID_PROVIDERS = [
  { id: "nostr", name: "Nostr", status: "ready", Panel: NostrPanel },
  { id: "pubky", name: "Pubky", status: "soon", note: "coming soon",
    why: "Pubky login needs the Pubky Ring app and Pubky's WebAssembly SDK talking to a Pubky relay and homeserver. That isn't wired into Looscid yet." },
  { id: "activitypub", name: "Mastodon & fediverse", status: "ready", Panel: MastodonPanel,
    why: "Logging in with Mastodon or another fediverse server means registering Looscid with your server, which needs a small Looscid server that doesn't exist yet." },
  { id: "atproto", name: "Bluesky and AT Protocol", status: "ready", Panel: BlueskyPanel,
    why: "Bluesky login uses AT Protocol OAuth, which needs Looscid's app details published on its website and a connection to your Bluesky server." },
  { id: "funkwhale", name: "Funkwhale", status: "ready", Panel: FunkwhalePanel },
  { id: "hubzilla", name: "Hubzilla", status: "ready", Panel: HubzillaPanel },
  { id: "plume", name: "Plume", status: "soon", note: "coming soon", why: "Plume's login needs your password, so Looscid will follow Plume blogs over ActivityPub instead." },
  { id: "more", name: "And more", status: "soon", note: "coming soon",
    why: "More open, decentralized networks are on the way. Tell us which one you want in Send Feedback." },
];
Looscid.ID_PROVIDERS = ID_PROVIDERS;
function LooscidIDChooser({ onDone, onLocal, headingLevel, from, localLabel }) {
  const [pick, setPick] = useState("nostr");
  const prov = ID_PROVIDERS.find(function (p) { return p.id === pick; });
  return lh('div', { className: "lid-chooser" },
    lh(headingLevel === 1 ? 'h1' : 'h2', { className: "lid-sub" }, "Add a login method now, or later in Settings, LooscidID"),
    lh('p', { className: "lid-help" }, "Your LooscidID is ready. Link Nostr, Mastodon and the fediverse, Bluesky, Funkwhale or Hubzilla to log in with it. This is optional."),
    lh(MenuPopupButton, { id: "lid-provider", label: "Login method", value: pick, items: ID_PROVIDERS.filter(function (p) { return p.status === "ready"; }), prefix: "Login with ",
      onSelect: function (v) { setPick(v); const p = ID_PROVIDERS.find(function (x) { return x.id === v; }); announce(p.name + " selected"); } }),
    lh(LcFindMeSwitch, { provider: prov.id }),
    lh(prov.Panel, { onDone: onDone, from: from }),
    onLocal && lh('button', { type: "button", className: "btn bgb lid-wide", onClick: onLocal }, localLabel || "Skip for now, add one later in LooscidID"));
}
/* --- First-run onboarding (Hasan's intro copy) --------------------------- */
const LID_TOPICS = [
  { id: "tech", name: "Tech", subs: ["AI", "Apple", "Machine learning", "Anthropic", "OpenAI", "Open source", "Accessibility tech"] },
  { id: "sports", name: "Sports", subs: ["Basketball", "Soccer", "Football", "Baseball", "Esports"] },
  { id: "music", name: "Music", subs: ["Hip hop", "Hyperpop", "Electronic", "Pop", "Music production"] },
  { id: "gaming", name: "Gaming", subs: ["Nintendo", "PlayStation", "Xbox", "PC gaming", "Accessible games"] },
  { id: "accessibility", name: "Accessibility", subs: ["Blind and low vision", "Screen readers", "Braille", "Deaf and hard of hearing", "Disability community"] },
  { id: "decentralization", name: "Decentralization", subs: ["Nostr", "Pubky", "Fediverse", "Bluesky", "Privacy"] },
];
Looscid.LID_TOPICS = LID_TOPICS;
const LID_TOPICS_KEY = "looscid_topics";
Looscid.LID_TOPICS_KEY = LID_TOPICS_KEY;
function getTopics() { try { return JSON.parse(localStorage.getItem(LID_TOPICS_KEY) || "[]"); } catch (e) { return []; } }
function TopicPicker({ value, onChange }) {
  const [open, setOpen] = useState({});
  const toggle = function (t) { const has = value.indexOf(t) >= 0; onChange(has ? value.filter(function (x) { return x !== t; }) : value.concat([t])); };
  return lh('ul', { className: "lid-topics", 'aria-label': "Topics" }, LID_TOPICS.map(function (tp) {
    const isOpen = !!open[tp.id];
    const n = tp.subs.filter(function (s) { return value.indexOf(s) >= 0; }).length;
    return lh('li', { key: tp.id },
      lh('button', { type: "button", className: "lid-topic", 'aria-expanded': isOpen ? "true" : "false", 'aria-controls': "lid-sub-" + tp.id,
          onClick: function () { setOpen(Object.assign({}, open, { [tp.id]: !isOpen })); } },
        tp.name + (n ? ", " + n + " selected" : "")),
      lh('div', { id: "lid-sub-" + tp.id, role: "group", 'aria-label': tp.name + " topics", className: "lid-subs", hidden: !isOpen },
        tp.subs.map(function (s) {
          const on = value.indexOf(s) >= 0;
          return lh('button', { key: s, type: "button", className: "lid-chip" + (on ? " on" : ""), 'aria-pressed': on ? "true" : "false", onClick: function () { toggle(s); } }, on ? lh('span', { 'aria-hidden': "true" }, "\u2713 ") : null, s);
        })));
  }));
}
function LooscidOnboarding({ onDone }) {
  const idProfile = getLocalProfile() || {};
  const idName = idProfile.displayName || "Dreamor";
  const idHandle = idProfile.handle || "@dreamor";
  const returning = (function () { try { const p = JSON.parse(localStorage.getItem(LID_OAUTH_PENDING) || "null"); return !!(p && p.from === "onboarding" && /[?&](code|error)=/.test(location.search)); } catch (e) { return false; } })();
  const [step, setStep] = useState(returning ? 2 : 0);
  const [topics, setTopics] = useState(getTopics());
  const [idNote, setIdNote] = useState("");
  const headRef = useRef(null);
  useOAuthReturn("onboarding", function (r) { setStep(2); setIdNote(r.ok ? "Great! " + r.msg : r.msg); });
  useEffect(function () { if (headRef.current) headRef.current.focus(); const sc = document.getElementById("lid-onb"); if (sc) sc.scrollTop = 0; }, [step]);
  const finish = function () {
    try { localStorage.setItem(LID_TOPICS_KEY, JSON.stringify(topics)); } catch (e) {}
    setWelcomeSeen(); onDone();
  };
  const next = function () { setStep(step + 1); };
  const H = function (text) { return lh('h1', { id: "lid-onb-h", className: "lid-onb-h", tabIndex: -1, ref: headRef }, text); };
  const P = function (text) { return lh('p', { className: "lid-onb-p" }, text); };
  const H2 = function (text) { return lh('h2', { className: "lid-onb-h2" }, text); };
  const primary = function (label, fn) { return lh('button', { type: "button", className: "btn bp lid-wide", onClick: fn || next }, label); };
  const TOTAL = 6;
  let body;
  if (step === 0) body = lh(React.Fragment, null,
    H("Welcome to Looscid"),
    P("The first decentralized everything app that keeps your data private, and lets you control it."),
    P("Looscid is the first everything app to be accessible, private and open source. That means you can access your data from anywhere, keep it private and use it with no blocks."),
    H2("Powerful"), P("Looscid's decentralization means that no single service, company or provider can control Looscid."),
    H2("Your privacy. Our goal"), P("We love privacy. We know you do, too. That's why Looscid keeps your data yours."),
    H2("Have you heard of accessibility? We have. And we love it"),
    P("The way you use your devices should apply to Looscid. We work hard to make sure every accessibility feature and every Looscid element have a good time together. Because accessibility, your data and Looscid are all friends. Good friends. We love keeping your stress levels low."),
    H2("Why Looscid exists"), P("Looscid exists to be the first everything app powered by decentralization."),
    H2("Our code is open. You can read it. Right now"), P("Looscid is open source. That's not a problem. It's a choice. Looscid is decentralized, and it's already an everything app."),
    H2("The protocols that power Looscid"), P("Pubky, Nostr, AT Protocol, ActivityPub (the fediverse) and more open source protocols will power Looscid. That means you can use your Nostr key, your Bluesky account and more for Looscid."),
    P("Are you ready? Because we are ready to help you."),
    primary("Yes, I'm ready"));
  else if (step === 1) body = lh(React.Fragment, null,
    H("Getting started"),
    P("We're excited for you to unlock everything we have to offer, and Looscid's decentralization really helps with that."),
    P("Your LooscidID is ready. We made it on this device the moment you opened Looscid: " + idName + ", " + idHandle + ". You can change your name and @username any time in Settings, LooscidID."),
    P("Next, you can add a login method like your Nostr key or your Bluesky account. It's optional. Add one now, or later in Settings, LooscidID."),
    primary("Next"));
  else if (step === 2) body = lh(React.Fragment, null,
    H("Add a login method (optional)"),
    idNote ? lh(React.Fragment, null, lh('p', { className: "lid-saved" }, idNote), primary("Continue to setup"))
      : lh(LooscidIDChooser, { from: "onboarding", onDone: function (m) { setIdNote("Great! " + m); }, onLocal: function () { announce("Skipped. You can add a login method later in Settings, LooscidID"); next(); } }));
  else if (step === 3) body = lh(React.Fragment, null,
    H("First, a tour"),
    P("Now things get a lot easier. We'll show you how to use the app and what to keep in mind, and you'll get to make your own choices."),
    P("Looscid is built to be accessible, usable and private. Our app, features and goal reflect that, strongly. You have the right to make, and change, your choices."),
    H2("Feed"), P("The Home feed shows Dreams we think you'll like. You can change your preferences in Settings."),
    H2("A quick terminology guide"),
    lh('dl', { className: "lid-terms" },
      lh('dt', null, "Dreams"), lh('dd', null, "A Dream is what you share, like how Twitter used \u201Ctweet.\u201D"),
      lh('dt', null, "Redreams"), lh('dd', null, "A Redream shares someone else\u2019s Dream with your followers. It\u2019s always written Redream."),
      lh('dt', null, "Replies"), lh('dd', null, "Replies are what you write under a Dream, one or several in a row."),
      lh('dt', null, "Dreamor"), lh('dd', null, "That's you. Instead of \u201Cmember\u201D or \u201Cuser,\u201D you're a Dreamor, spelled D R E A M O R. It's time for a change, and we hope it inspires you to dream up something cool."),
      lh('dt', null, "Circles"), lh('dd', null, "Circles are communities. They should be created with care, so the conversations in them are valuable, memorable and special.")),
    P("You can reread this guide any time in Settings, About Looscid."),
    primary("Continue"));
  else if (step === 4) body = lh(React.Fragment, null,
    H("What do you want to see?"),
    P("Choose topics. Each topic opens to show more, like Basketball inside Sports. We'll remember what you like, on this device."),
    lh(TopicPicker, { value: topics, onChange: setTopics }),
    primary("Continue"));
  else body = lh(React.Fragment, null,
    H("Welcome Home"),
    P("It's time to experience what social media should've been."),
    primary("Let's go", finish));
  return lh('div', { id: "lid-onb", className: "lid-onb", role: "dialog", 'aria-modal': "true", 'aria-labelledby': "lid-onb-h",
      onKeyDown: function (e) { if (e.key === "Escape") { e.preventDefault(); finish(); } } },
    lh('div', { className: "lid-onb-in" },
      lh('p', { className: "lid-step" }, "Step " + (step + 1) + " of " + TOTAL),
      body,
      lh('div', { className: "lid-onb-nav" },
        step > 0 && lh('button', { type: "button", className: "btn bgb", onClick: function () { setStep(step - 1); } }, "Back"),
        step < TOTAL - 1 && lh('button', { type: "button", className: "lid-skip", onClick: finish }, "Skip intro"))));
}
/* =========================================================================
   COMMAND ENGINE, COMMAND BAR, TERMINAL, EARCONS, ACCESSIBILITY SETTINGS
   One command engine (lcRun) serves both the Ctrl/Cmd+K Commandbar and the
   Commandbar (ported from the NexOS Terminal). Results are spoken through the
   one polite live region (#looscid-live, see announce()).
   ========================================================================= */

/* --- Accessibility settings (saved on this device) ---------------------- */
const A11Y_KEY = "looscid_a11y";
Looscid.A11Y_KEY = A11Y_KEY;
const A11Y_ASKED_KEY = "looscid_a11y_asked";
Looscid.A11Y_ASKED_KEY = A11Y_ASKED_KEY;
const A11Y_DEFAULTS = {
  textSize: 0, highContrast: false, boldText: false, dyslexiaFont: false, screenReader: false,
  captions: false, visualCue: false,
  calmMode: true, reduceMotion: false,
  brailleOutput: false, enterSend: true,
  earcons: true, earconVolume: 50, pitchCues: true, closeLabels: true,
  feedSwitch: "tabs",
  largeBtns: false, switchAccess: false,
  termOutput: "collapsible", termHeadings: true,
  flashSafety: true,
};
Looscid.A11Y_DEFAULTS = A11Y_DEFAULTS;
/* --- Round 4: one settings registry ---------------------------------------
   Every round-4 setting is one row here: its section, label, kind, options and
   the words Commandbar and Cherry accept. The Settings screens, commands,
   Cherry, the "settings" read-out, per-section reset and export/import all read
   this list. Older settings keep their key in looscid_a11y; new ones are saved
   in dbm_settings (Hasan, Oct 9 2026). */
const LC_SETTINGS_KEY = "dbm_settings";
Looscid.LC_SETTINGS_KEY = LC_SETTINGS_KEY;
const LC_AUTOSAVE_KEY = "dbm_compose_autosave";
Looscid.LC_AUTOSAVE_KEY = LC_AUTOSAVE_KEY;
const LC_SR_NAMES_DEF = { general: "General", speech: "Speech", verbosity: "Verbosity", braille: "Braille" };
Looscid.LC_SR_NAMES_DEF = LC_SR_NAMES_DEF;
const LC_WHO3 = [["everyone", "Everyone", ["everyone", "anyone", "all"]], ["following", "People I follow", ["people i follow", "following", "follow"]], ["nobody", "Nobody", ["nobody", "no one", "none"]]];
Looscid.LC_WHO3 = LC_WHO3;
const LC_WHO4 = [["everyone", "Everyone", ["everyone", "anyone", "all"]], ["following", "People I follow", ["people i follow", "following", "follow"]], ["friends", "Friends", ["friends", "mutuals"]], ["nobody", "Nobody", ["nobody", "no one", "none"]]];
Looscid.LC_WHO4 = LC_WHO4;
// Round 6: the audience choices for Privacy (native radios, fieldset and legend). "friends" from older builds means mutuals.
const LC_AUD_O = [["everyone", "Everyone", ["everyone", "anyone", "all"]], ["following", "Dreamers I follow", ["dreamers i follow", "people i follow", "following", "follow"]], ["followers", "My followers", ["my followers", "followers"]], ["mutuals", "Mutuals", ["mutuals", "friends", "followers i follow back"]], ["circles", "My circles", ["my circles", "circles"]], ["nobody", "Only me", ["only me", "nobody", "no one", "none"]], ["custom", "Custom", ["custom", "chosen dreamers"]]];
Looscid.LC_AUD_O = LC_AUD_O;
const LC_LANGS = [["en", "English"], ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["it", "Italian"], ["pt", "Portuguese"], ["ar", "Arabic"], ["tr", "Turkish"], ["ur", "Urdu"], ["hi", "Hindi"], ["zh", "Chinese"], ["ja", "Japanese"], ["ko", "Korean"]];
Looscid.LC_LANGS = LC_LANGS;
const LC_SECTIONS = {
  vision: { t: "Vision", d: "Text size, contrast, bold text and spacing.", where: "Settings, Accessibility, Vision", al: ["vision"], keys: ["textSize", "highContrast", "boldText", "dyslexiaFont"] },
  sr_general: { t: "General", sr: "general", d: "How Looscid works with VoiceOver, TalkBack or NVDA.", where: "Settings, Accessibility, Screen reader and braille", al: ["general", "screen reader general"] },
  sr_speech: { t: "Speech", sr: "speech", d: "What Looscid reads aloud with its own voice, and how.", where: "Settings, Accessibility, Screen reader and braille", al: ["speech"] },
  sr_braille: { t: "Braille", sr: "braille", d: "How buttons and labels show on your braille display.", where: "Settings, Accessibility, Screen reader and braille", al: ["braille"] },
  hearing: { t: "Hearing", d: "Captions and a visual cue in place of sounds.", where: "Settings, Accessibility, Hearing", al: ["hearing"], keys: ["captions", "visualCue"] },
  motion: { t: "Motion and seizure", d: "Calmer movement and protection from flashing.", where: "Settings, Accessibility, Motion and seizure", al: ["motion", "seizure", "motion and seizure"], keys: ["calmMode", "flashSafety", "reduceMotion"] },
  terminal: { t: "Commandbar", d: "How Commandbar shows its output.", where: "Settings, Accessibility, Commandbar", al: ["commandbar", "command bar", "terminal"], keys: ["termOutput", "termHeadings"] },
  motor: { t: "Motor and switch", d: "Bigger buttons and switch access.", where: "Settings, Accessibility, Motor and switch", al: ["motor", "switch", "motor and switch"], keys: ["largeBtns", "switchAccess"] },
  audio: { t: "Sounds", d: "Looscid's sounds and how loud they are.", where: "Settings, Sounds", al: ["sounds", "sound", "audio", "earcons"] },
  verbosity: { t: "Verbosity", where: "Settings, Accessibility, Screen reader and braille, Verbosity", al: ["verbosity", "verbosity settings", "pitch cue settings"] },
  quiet: { t: "Quiet hours", d: "Times when Looscid stays silent.", where: "Settings, Alerts", al: ["quiet hours", "quiet"] },
  feeds: { t: "Feeds", d: "Which feeds you see and how you switch between them.", where: "Settings, Customizability, Feeds and home", al: ["feeds", "feed"] },
  posting: { t: "Dreaming", d: "How writing and sending a Dream works.", where: "Settings, Customizability, Dreaming", al: ["dreaming", "posting", "composer", "compose"] },
  media: { t: "Media and translation", d: "Images, video and translation.", where: "Settings, Customizability, Media and translation", al: ["media", "translation"] },
  filters: { t: "Muted words and content warnings", d: "Words you don't want to see, and content warnings.", where: "Settings, Privacy", al: ["muted words", "content warnings", "filters"] },
  perm: { t: "Permissions", d: "Who can see, reply to and message you.", where: "Settings, Privacy", al: ["permissions", "privacy"] },
  pmedia: { t: "Media and content", d: "Who can save and reshare your media, screenshots, blur, photo details and Cherry.", where: "Settings, Privacy", al: ["media and content", "media privacy", "exif", "screenshots"] },
  keyboard: { t: "Keyboard shortcuts", d: "Built-in keys and your own shortcuts.", where: "Settings, Keyboard shortcuts", al: ["keyboard", "shortcuts", "keyboard shortcuts"] },
  ai: { t: "Cherry", d: "Cherry, Looscid's on-device assistant.", where: "Settings, Intelligence, Cherry", al: ["cherry", "ai", "intelligence"] },
};
Looscid.LC_SECTIONS = LC_SECTIONS;
// [key, section, label, kind, default, options|range, aliases, description, extra]
// Where each section lives (Find a setting, commands): page, and the Screen reader tab when there is one.
const LC_SECTION_PAGE = { vision: ["settings_a11y_vision"], sr_general: ["settings_a11y_sr", "general"], sr_speech: ["settings_a11y_sr", "speech"], sr_braille: ["settings_a11y_sr", "braille"],
  hearing: ["settings_a11y_hearing"], motion: ["settings_a11y_motion"], terminal: ["settings_a11y_terminal"], motor: ["settings_a11y_motor"], audio: ["settings_audio"], verbosity: ["settings_a11y_sr", "verbosity"],
  quiet: ["settings_notifications"], feeds: ["settings_cz_feeds"], posting: ["settings_cz_posting"], media: ["settings_cz_media"],
  filters: ["settings_privacy"], perm: ["settings_privacy"], pmedia: ["settings_privacy"], keyboard: ["settings_keyboard"], ai: ["settings_ai_cherry"] };
Looscid.LC_SECTION_PAGE = LC_SECTION_PAGE;
const LC_SET = [
  // Screen reader and braille > General
  { k: "verbosity", s: "verbosity", l: "Verbosity", t: "choice", d: "normal", al: ["verbosity", "verbose", "verbosity level"], o: [["short", "Low", ["low", "short", "less"]], ["normal", "Medium", ["medium", "normal", "default"]], ["detailed", "High", ["high", "detailed", "more", "full"]]],
    desc: "How much Looscid says. Low: short labels, no hints or counts, only essential announcements. Medium: labels with state and counts, and confirmations like Saved. High: Medium plus short hints, position like 2 of 5, and the page name when you move." },
  { k: "readOrder", s: "sr_general", l: "Dream read order", t: "choice", d: "name", al: ["read order", "reading order", "dream read order"], o: [["name", "Name first", ["name first", "name"]], ["text", "Text first", ["text first", "text"]]],
    desc: "Whether you hear who dreamed a Dream before or after what it says." },
  { k: "announceNew", s: "sr_general", l: "Announce new Dreams", t: "choice", d: "count", al: ["announce new dreams", "announce new", "new dreams announcements", "announce dreams"], o: [["off", "Off", ["off", "never"]], ["count", "Count only", ["count only", "count"]], ["read", "Read them", ["read them", "read", "full"]]],
    desc: "When new Dreams arrive in the feed. Count only says \u201c3 new Dreams\u201d. Read them reads up to three. Polite: it never interrupts what you are hearing." },
  { k: "skipLinks", s: "sr_general", l: "Skip links and landmarks", t: "bool", d: true, al: ["skip links", "skip link", "landmarks"],
    desc: "On: a Skip to content link at the very top and named landmarks for the main area and the navigation bar." },
  { k: "focusMemory", s: "sr_general", l: "Focus memory", t: "bool", d: true, al: ["focus memory", "remember focus", "remember my place"],
    desc: "Coming back to a feed puts you back on the same Dream you were on." },
  { k: "screenReader", s: "sr_general", l: "Screen reader hints", t: "bool", d: false, old: true, al: ["screen reader hints", "hints"],
    desc: "Adds short how-to hints to what Looscid reads out, like which keys work in Commandbar. Works with VoiceOver, TalkBack, NVDA and JAWS." },
  { k: "readingMode", s: "sr_general", l: "Reading mode", t: "bool", d: false, al: ["reading mode", "one dream at a time"],
    desc: "Shows one Dream at a time, read top to bottom. Next and Previous buttons, the left and right arrow keys, a swipe or braille Enter move between Dreams." },
  // Speech
  { k: "pitchCues", s: "verbosity", l: "Pitch cues", t: "bool", d: true, old: true, al: ["pitch cues", "pitch cue", "pitch changes", "pitch"],
    desc: "On by default. A short tone at its own pitch when focus lands on a link, button, heading, text field or switch, when something opens or closes, on list position, and on success or error. Replies are read aloud a little lower. Never when you switch feeds, never while you type." },
  { k: "pcButtons", s: "verbosity", l: "Buttons", t: "bool", d: true, pc: true, al: ["button pitch", "button pitch cue", "buttons pitch"] },
  { k: "pcHeadings", s: "verbosity", l: "Headings, higher for bigger headings", t: "bool", d: true, pc: true, al: ["heading pitch", "heading pitch cue", "headings pitch"] },
  { k: "pcFields", s: "verbosity", l: "Text fields", t: "bool", d: true, pc: true, al: ["field pitch", "text field pitch", "form field pitch", "edit box pitch"] },
  { k: "pcOpenClose", s: "verbosity", l: "Open and close", t: "bool", d: true, pc: true, al: ["open close pitch", "open and close pitch", "back pitch"] },
  { k: "pcToggles", s: "verbosity", l: "Switches, on goes up and off goes down", t: "bool", d: true, pc: true, al: ["toggle pitch", "switch pitch", "checkbox pitch"] },
  { k: "pcPosition", s: "verbosity", l: "Position in lists and menus", t: "bool", d: true, pc: true, al: ["position pitch", "list position pitch", "menu position pitch"] },
  { k: "pcStatus", s: "verbosity", l: "Success and error", t: "bool", d: true, pc: true, al: ["success pitch", "error pitch", "success and error pitch"] },
  { k: "speakTime", s: "sr_speech", l: "Speak timestamps", t: "choice", d: "full", al: ["speak timestamps", "timestamps", "speak time"], o: [["off", "Off", ["off", "none"]], ["short", "Short, like 5m", ["short"]], ["full", "Full, like 5 minutes ago", ["full", "long"]]] },
  { k: "speakEmoji", s: "sr_speech", l: "Speak emoji", t: "choice", d: "name", al: ["speak emoji", "emoji speech", "emoji"], o: [["name", "Say its name", ["name", "names", "say name"]], ["skip", "Skip", ["skip", "off", "none"]], ["word", "Just say \u201cemoji\u201d", ["word", "just emoji", "say emoji"]]] },
  { k: "speakTags", s: "sr_speech", l: "Hashtags and mentions", t: "choice", d: "read", al: ["hashtags and mentions", "hashtags", "mentions", "speak hashtags"], o: [["read", "Read as is", ["read as is", "read", "as is"]], ["skip", "Skip the # and @", ["skip", "skip symbols", "no symbols"]]] },
  { k: "ttsVoice", s: "sr_speech", l: "Read-aloud voice", t: "voice", d: "", al: ["read aloud voice", "voice"] },
  { k: "ttsRate", s: "sr_speech", l: "Read-aloud rate", t: "range", d: 100, min: 50, max: 200, step: 10, unit: "percent", al: ["read aloud rate", "speech rate", "rate"] },
  { k: "ttsPitch", s: "sr_speech", l: "Read-aloud pitch", t: "range", d: 100, min: 50, max: 150, step: 10, unit: "percent", al: ["read aloud pitch", "voice pitch"] },
  { k: "cherryAloud", s: "ai", l: "Read Cherry's answers aloud", t: "bool", d: false, al: ["read cherry aloud", "cherry aloud", "cherry read aloud"],
    desc: "Cherry's answers are spoken with the read-aloud voice, as well as shown." },
  { k: "typingEcho", s: "sr_speech", l: "Typing echo in the composer", t: "choice", d: "off", al: ["typing echo", "echo"], o: [["chars", "Characters", ["characters", "chars", "letters"]], ["words", "Words", ["words"]], ["both", "Both", ["both"]], ["off", "Off", ["off", "none"]]],
    desc: "Looscid's own echo while you write a Dream, on top of your screen reader's. Off by default, so nothing is said twice." },
  // Braille
  { k: "brailleRoles", s: "sr_braille", hide: true, l: "Short roles on braille", t: "bool", d: true, al: ["short roles on braille", "short roles", "braille roles", "braille role"],
    desc: "Buttons show a short role on your braille display, like btn, while speech still says button. Pick the style under Button style on braille." },
  { k: "brailleStyle", s: "sr_braille", hide: true, l: "Button style on braille", t: "bstyle", d: "iphone", al: [] },
  { k: "brailleOutput", s: "sr_braille", l: "Braille display output", t: "bool", d: false, old: true, al: ["braille display output", "braille output", "braille display"],
    desc: "Sends short braille labels for Commandbar, Dreams and their results to a connected braille display, through your screen reader. Sighted people still see the normal text." },
  { k: "enterSend", s: "sr_braille", l: "Enter = Send", t: "bool", d: true, old: true, al: ["enter send", "enter to send", "enter sends"],
    desc: "On: Enter sends messages and Cherry questions, from a keyboard or a braille display. Off: Enter does not send there, so a stray Enter never sends; use the Send button. Commands always run on Enter." },
  { k: "closeLabels", s: "sr_braille", l: "Short labels on braille", t: "bool", d: true, old: true, al: ["short labels on braille", "braille short labels", "short braille labels", "short labels", "close labels"],
    desc: "On by default. Braille shows just \u201cClose\u201d while speech says what it closes, like \u201cClose menu\u201d. Off: braille shows the full name too." },
  { k: "brailleTime", s: "sr_braille", l: "Short timestamps on braille", t: "bool", d: true, al: ["short timestamps on braille", "braille timestamps", "braille time"],
    desc: "Braille shows 5m instead of 5 minutes ago." },
  { k: "brailleEmoji", s: "sr_braille", l: "Emoji on braille", t: "choice", d: "name", al: ["emoji on braille", "braille emoji"], o: [["name", "Show as :name:", ["name", "names", "colon"]], ["strip", "Strip them", ["strip", "remove", "off"]]] },
  { k: "braillePrefix", s: "sr_braille", l: "Type prefix on braille", t: "bool", d: true, al: ["type prefix", "braille prefix", "prefix"],
    desc: "Starts each Dream's braille label with D: for a Dream, R: for a reply or RD: for a Redream, so you know what you are on in a few cells." },
  // Audio
  { k: "earcons", s: "audio", l: "Earcons", t: "bool", d: true, old: true, al: ["earcons", "earcon", "sound effects"],
    desc: "Short sounds for moving around Looscid, sending, likes, new Dreams, errors and alerts." },
  { k: "earconVolume", s: "audio", l: "Master earcon volume", t: "range", d: 50, min: 0, max: 100, step: 10, unit: "percent", old: true, al: ["earcon volume", "master volume", "volume"] },
  { k: "earconFocus", s: "audio", l: "Play earcon on every swipe or focus move", t: "bool", d: false, al: ["earcon on every swipe", "earcon on swipe", "swipe earcon", "focus earcon", "earcon on focus"],
    desc: "A short beep each time focus moves. On by default when you choose \u201cWith a screen reader\u201d at setup." },
  { k: "linkPitch", s: "verbosity", l: "Links", t: "bool", d: true, pc: true, al: ["link pitch cue", "link pitch", "link cue", "link sound", "link earcon", "links pitch"] },
  { k: "keyClicks", s: "audio", l: "Keyboard clicks", t: "bool", d: true, al: ["keyboard clicks", "key clicks", "keyboard click", "typing sounds", "typing clicks", "key sounds"],
    desc: "On by default. A short click for each key you type in a text field. Follows the Earcons switch and the master volume, still plays in Calm mode, and never changes pitch." },
  { k: "nexosBoot", s: "audio", l: "NexOS boot text", t: "bool", d: true, al: ["nexos boot text", "boot text", "boot screen", "nexos boot", "startup text"],
    desc: "With the NexOS classic sound pack, Looscid starts with the NexOS boot text and its boot chime, once per visit. Text only, nothing flashes, and Skip or Escape ends it." },
  { k: "soundPack", s: "audio", l: "Sound pack", t: "choice", d: "looscid", al: ["sound pack", "soundpack", "sound theme", "insomnia sounds", "synth", "hyper synth", "nexos sounds", "good morning", "good night"], o: [["looscid", "Looscid", ["looscid", "default"]], ["nexos", "NexOS classic", ["nexos classic", "nexos"]], ["insomnia", "Insomnia", ["insomnia", "insomnia os", "insomnia sounds"]], ["synth", "Hyper Synth", ["hyper synth", "synth", "hyper", "synth pack"]], ["custom", "Your imported pack", ["custom", "imported", "my pack", "mine"]]] },
  { k: "ev_send", s: "audio", l: "Send sound", t: "bool", d: true, ev: "send", al: ["send sound", "sent sound"] },
  { k: "ev_like", s: "audio", l: "Like sound", t: "bool", d: true, ev: "like", al: ["like sound"] },
  { k: "ev_newDream", s: "audio", l: "New Dream sound", t: "bool", d: true, ev: "newDream", al: ["new dream sound"] },
  { k: "ev_error", s: "audio", l: "Error sound", t: "bool", d: true, ev: "error", al: ["error sound"] },
  { k: "ev_alert", s: "audio", l: "Alert sound", t: "bool", d: true, ev: "alerts", al: ["alert sound", "alerts sound"] },
  { k: "ev_feed", s: "audio", l: "Feed switch sound", t: "bool", d: false, ev: "feedSwitch", al: ["feed switch sound", "feed sound"],
    desc: "One steady sound when you switch feeds. It never changes pitch. Off by default." },
  { k: "ducking", s: "audio", l: "Ducking", t: "bool", d: true, al: ["ducking", "duck music"],
    desc: "Music gets quieter while Looscid's read-aloud voice is speaking. A website can't hear VoiceOver itself, so this follows Looscid's own voice." },
  { k: "haptics", s: "audio", l: "Haptics", t: "bool", d: false, al: ["haptics", "vibration", "vibrate"],
    desc: "A short vibration for send, like, errors and alerts, on phones that support it. Off by default. Never more than three pulses a second." },
  // Alerts > Quiet hours
  { k: "quietHours", s: "quiet", l: "Quiet hours", t: "bool", d: false, al: ["quiet hours", "do not disturb"],
    desc: "No sounds, vibrations or new-Dream announcements between the times below. Looscid still works normally." },
  { k: "quietFrom", s: "quiet", l: "Quiet from", t: "time", d: "22:00", al: ["quiet from", "quiet hours from", "quiet start"] },
  { k: "quietTo", s: "quiet", l: "Quiet until", t: "time", d: "07:00", al: ["quiet until", "quiet hours until", "quiet to", "quiet end"] },
  // Customizability > Feeds
  { k: "calmFeed", s: "feeds", l: "Calm feed", t: "bool", d: false, al: ["calm feed", "hide counts", "hide like counts"],
    desc: "Hides like and Redream counts on every Dream, for you only." },
  // Customizability > Posting
  { k: "undoSend", s: "posting", l: "Undo send", t: "choice", d: "0", al: ["undo send", "undo"], o: [["0", "Off", ["off", "none", "0"]], ["5", "5 seconds", ["5", "five", "5 seconds"]], ["10", "10 seconds", ["10", "ten", "10 seconds"]]],
    desc: "Waits before a Dream is sent, with an Undo button." },
  { k: "altReminder", s: "posting", l: "Alt text reminder", t: "bool", d: true, al: ["alt text reminder", "alt reminder", "alt text"],
    desc: "Before you Dream a photo with no alt text, Looscid asks if you want to add it." },
  { k: "draftAutosave", s: "posting", l: "Draft autosave", t: "bool", d: true, al: ["draft autosave", "autosave", "auto save"],
    desc: "Saves what you're writing on this device as you type. Next time you open New Dream, you can recover it or discard it." },
  // Customizability > Media and translation
  { k: "autoplay", s: "media", l: "Auto-play media", t: "choice", d: "wifi", al: ["auto play media", "autoplay", "auto play"], o: [["always", "Always", ["always", "on"]], ["wifi", "Wi-Fi only", ["wifi only", "wifi", "wi fi"]], ["never", "Never", ["never", "off"]]],
    desc: "Wi-Fi only uses your browser's connection type. When the browser doesn't say, like Safari on iPhone, Looscid plays it safe and doesn't auto-play." },
  { k: "translateTo", s: "media", l: "Translate Dreams into", t: "choice", d: "en", al: ["translate into", "translate to", "translation language"], o: LC_LANGS.map(function (x) { return [x[0], x[1], [x[1].toLowerCase()]]; }), menu: true },
  // Privacy > Muted words and content warnings
  { k: "mutedWords", s: "filters", l: "Muted words", t: "words", d: "", al: ["muted words", "mute words"],
    desc: "Dreams with any of these words are hidden from your feeds. Separate words with commas." },
  { k: "cwWords", s: "filters", l: "Content warnings", t: "words", d: "", al: ["content warnings", "content warning", "cw"],
    desc: "Dreams about these topics or words are folded under a warning, with a Show Dream button. Separate them with commas." },
  // Privacy > Permissions
  { k: "whoSee", s: "perm", g: "Your Dreams", l: "Who can see my Dreams", t: "choice", d: "everyone", al: ["who can see my dreams", "who can see"], o: LC_AUD_O, aud: true },
  { k: "whoReply", s: "perm", g: "Your Dreams", l: "Who can reply", t: "choice", d: "everyone", al: ["who can reply", "replies from"], o: LC_AUD_O, aud: true, live: true },
  { k: "whoFollow", s: "perm", g: "Interactions", l: "Who can follow me", t: "choice", d: "everyone", al: ["who can follow me", "who can follow"], o: [["everyone", "Everyone", ["everyone"]], ["approve", "Approve requests", ["approve requests", "approve", "requests"]]] },
  { k: "whoMention", s: "perm", g: "Interactions", l: "Who can mention me", t: "choice", d: "everyone", al: ["who can mention me", "who can mention"], o: LC_AUD_O, aud: true, live: true },
  { k: "whoTag", s: "perm", g: "Interactions", l: "Who can tag me in photos", t: "choice", d: "following", al: ["who can tag me", "who can tag"], o: LC_AUD_O, aud: true },
  { k: "whoCircles", s: "perm", g: "Interactions", l: "Who can add me to Circles", t: "choice", d: "following", al: ["who can add me to circles", "add me to circles"], o: LC_AUD_O, aud: true },
  { k: "whoLists", s: "perm", g: "Discoverability", l: "Who can see my followers and following", t: "choice", d: "everyone", al: ["who can see my followers", "followers list", "following list"], o: [["everyone", "Everyone", ["everyone"]], ["followers", "Followers", ["followers"]], ["me", "Only me", ["only me", "me", "just me"]]] },
  { k: "inSearch", s: "perm", g: "Discoverability", l: "Show my Dreams in search", t: "bool", d: true, al: ["show my dreams in search", "dreams in search", "search visibility"] },
  { k: "findHandle", s: "perm", g: "Discoverability", l: "Find me by my LooscidID handle", t: "bool", d: true, id: "local", al: ["find me by my handle", "find me by handle", "find me by looscidid"] },
  { k: "findNostr", s: "perm", g: "Discoverability", l: "Find me by my Nostr npub", t: "bool", d: false, id: "nostr", al: ["find me by my npub", "find me by nostr", "find me by npub"] },
  { k: "findMastodon", s: "perm", g: "Discoverability", l: "Find me by my Mastodon or fediverse username", t: "bool", d: false, id: "activitypub", al: ["find me by mastodon", "find me by fediverse"] },
  { k: "findBluesky", s: "perm", g: "Discoverability", l: "Find me by my Bluesky handle", t: "bool", d: false, id: "atproto", al: ["find me by bluesky"] },
  { k: "findPubky", s: "perm", g: "Discoverability", l: "Find me by my Pubky public key", t: "bool", d: false, id: "pubky", al: ["find me by pubky"] },
  { k: "cherryUse", s: "perm", g: "Discoverability", l: "Let Cherry use my Dreams for suggestions", t: "bool", d: false, al: ["cherry use my dreams", "cherry suggestions from my dreams"] },
  { k: "whoMessage", s: "perm", g: "Messages", l: "Who can message me", t: "choice", d: "following", al: ["who can message me", "who can message", "who can dm me"], o: LC_AUD_O, aud: true },
  { k: "showOnline", s: "perm", g: "Messages", l: "Show when I'm online", t: "bool", d: false, al: ["show when i'm online", "show online", "online status"] },
  { k: "readReceipts", s: "perm", g: "Messages", l: "Read receipts", t: "bool", d: false, al: ["read receipts"] },
  // Privacy > Media and content (round 6). Saved on this device; the photo details switch really strips them when you add a photo.
  { k: "mediaSave", s: "pmedia", g: "Saving and resharing", l: "Who can save or download my media", t: "choice", d: "nobody", o: LC_AUD_O, aud: true, al: ["who can save my media", "who can download my media", "download my media", "save my media", "media downloads"] },
  { k: "whoRedream", s: "pmedia", g: "Saving and resharing", l: "Who can Redream my Dreams", t: "choice", d: "everyone", al: ["who can redream", "redreams from"], o: LC_AUD_O, aud: true },
  { k: "whoQuote", s: "pmedia", g: "Saving and resharing", l: "Who can quote my Dreams", t: "choice", d: "everyone", al: ["who can quote", "quotes from"], o: LC_AUD_O, aud: true },
  { k: "screenshotAsk", s: "pmedia", g: "Screenshots and blur", l: "Ask people not to screenshot my media", t: "bool", d: false, al: ["screenshot request", "ask not to screenshot", "screenshots"] },
  { k: "blurOutside", s: "pmedia", g: "Screenshots and blur", l: "Blur my images for people outside the audience", t: "bool", d: false, al: ["blur images", "blur my images", "blur outside audience"] },
  { k: "stripExif", s: "pmedia", g: "Photo details", l: "Remove location and camera details from photos", t: "bool", d: true, al: ["strip exif", "exif", "photo location", "remove location from photos", "photo details", "metadata"] },
  { k: "cherryMediaLook", s: "pmedia", g: "Cherry and your media", l: "Let Cherry look at images in Dreams", t: "bool", d: false, cherry: true, al: ["cherry look at images", "cherry images"] },
  { k: "cherryMediaAlt", s: "pmedia", g: "Cherry and your media", l: "Let Cherry suggest alt text for my photos", t: "bool", d: false, cherry: true, al: ["cherry alt text", "cherry suggest alt text"] },
  { k: "cherryMediaRemember", s: "pmedia", g: "Cherry and your media", l: "Let Cherry remember media I've looked at", t: "bool", d: false, cherry: true, al: ["cherry remember media", "cherry media memory"] },
];
Looscid.LC_SET = LC_SET;
const LC_SET_BY = {};
Looscid.LC_SET_BY = LC_SET_BY;
 LC_SET.forEach(function (x) { LC_SET_BY[x.k] = x; });
const LC_NEW_DEFAULTS = { srNames: LC_SR_NAMES_DEF, shortcuts: [] };
Looscid.LC_NEW_DEFAULTS = LC_NEW_DEFAULTS;
LC_SET.forEach(function (x) { if (!x.old) LC_NEW_DEFAULTS[x.k] = x.d; });
Object.assign(A11Y_DEFAULTS, LC_NEW_DEFAULTS);
const LC_OLD_KEYS = ["textSize", "highContrast", "boldText", "dyslexiaFont", "screenReader", "captions", "visualCue", "calmMode", "reduceMotion", "brailleOutput", "enterSend", "earcons", "earconVolume", "pitchCues", "closeLabels", "feedSwitch", "largeBtns", "switchAccess", "termOutput", "termHeadings", "flashSafety"];
Looscid.LC_OLD_KEYS = LC_OLD_KEYS;
function lcSectionKeys(sec) { const s = LC_SECTIONS[sec]; return (s && s.keys ? s.keys.slice() : []).concat(LC_SET.filter(function (x) { return x.s === sec; }).map(function (x) { return x.k; })).concat(sec === "sr_general" ? ["srNames"] : []).concat(sec === "keyboard" ? ["shortcuts"] : []); }
function lcSectionDefaults(sec) { const o = {}; lcSectionKeys(sec).forEach(function (k) { o[k] = A11Y_DEFAULTS[k]; }); if (sec === "sr_general") delete o.srNames; return o; }
function lcSrName(id) { const n = (Looscid.A11Y_NOW && Looscid.A11Y_NOW.srNames) || {}; const v = String(n[id] || "").trim(); return v || LC_SR_NAMES_DEF[id]; }
function lcSectionTitle(sec) { const s = LC_SECTIONS[sec]; return s.sr ? lcSrName(s.sr) : s.t; }
// Lets screens outside the App props change a setting (App fills it in).
Looscid.LC_SET_A11Y = null;
function lcSet(patch) { if (Looscid.LC_SET_A11Y) Looscid.LC_SET_A11Y(patch); else { Looscid.A11Y_NOW = Object.assign({}, Looscid.A11Y_NOW, patch); saveA11y(Looscid.A11Y_NOW); } }
function lcValueText(def, v) {
  if (def.t === "bool") return v ? "on" : "off";
  if (def.t === "choice") { const o = def.o.find(function (x) { return String(x[0]) === String(v); }); return o ? o[1] : String(v); }
  if (def.t === "range") return v + (def.unit ? " " + def.unit : "");
  if (def.t === "voice") return v ? v : "your device's default voice";
  if (def.t === "words") return lcWords(v).length ? lcWords(v).join(", ") : "none";
  if (def.t === "time") return lcTimeSpoken(v);
  if (def.t === "bstyle") return lcBrStyleLabel(v);
  return String(v);
}
function lcTimeSpoken(v) { const m = /^(\d{1,2}):(\d{2})$/.exec(String(v || "")); if (!m) return String(v || ""); let h = +m[1]; const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return h + ":" + m[2] + " " + ap; }
function lcWords(v) { return String(v || "").split(/[,\n]/).map(function (w) { return w.trim().toLowerCase(); }).filter(Boolean).slice(0, 200); }
/* --- Quiet hours, haptics ------------------------------------------------ */
function lcQuietNow(d) {
  const a = Looscid.A11Y_NOW; if (!a || !a.quietHours) return false;
  const p = function (s) { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "")); return m ? (+m[1]) * 60 + (+m[2]) : null; };
  const f = p(a.quietFrom), t = p(a.quietTo); if (f === null || t === null || f === t) return false;
  const now = d || (window.__LC_NOW ? new Date(window.__LC_NOW) : new Date()), n = now.getHours() * 60 + now.getMinutes();
  return f < t ? (n >= f && n < t) : (n >= f || n < t);
}
// Auto-play media (Settings > Customizability > Media): the one check every media player uses.
function lcAutoplayAllowed() { const m = Looscid.A11Y_NOW.autoplay || "wifi"; if (m === "always") return true; if (m === "never") return false; try { const c = navigator.connection; return !!(c && (c.type === "wifi" || c.type === "ethernet")); } catch (e) { return false; } }
function lcHapticsSupported() { return typeof navigator !== "undefined" && typeof navigator.vibrate === "function"; }
Looscid.lcLastBuzz = 0;
function lcBuzz(kind) {
  const a = Looscid.A11Y_NOW; if (!a.haptics || !lcHapticsSupported() || lcQuietNow()) return;
  const now = Date.now(); if (now - Looscid.lcLastBuzz < 340) return; Looscid.lcLastBuzz = now; // three pulses a second at most
  const pat = kind === "error" ? [30, 80, 30] : kind === "alerts" ? [40] : [15];
  try { navigator.vibrate(a.calmMode ? pat.map(function (x, i) { return i % 2 ? x : Math.round(x * 0.7); }) : pat); } catch (e) {}
}
/* --- Emoji, timestamps and the words each Dream is read with ------------- */
const LC_EMOJI = { "😀": "grinning face", "😃": "grinning face with big eyes", "😄": "grinning face with smiling eyes", "😁": "beaming face", "😆": "grinning squinting face", "😅": "grinning face with sweat", "🤣": "rolling on the floor laughing", "😂": "face with tears of joy", "🙂": "slightly smiling face", "😉": "winking face", "😊": "smiling face with smiling eyes", "😇": "smiling face with halo", "🥰": "smiling face with hearts", "😍": "smiling face with heart eyes", "😘": "face blowing a kiss", "😋": "face savoring food", "😛": "face with tongue", "😜": "winking face with tongue", "🤪": "zany face", "🤔": "thinking face", "🤗": "hugging face", "🤫": "shushing face", "😐": "neutral face", "😑": "expressionless face", "😶": "face without mouth", "🙄": "face with rolling eyes", "😏": "smirking face", "😬": "grimacing face", "😌": "relieved face", "😔": "pensive face", "😪": "sleepy face", "😴": "sleeping face", "😷": "face with medical mask", "🤒": "face with thermometer", "🥵": "hot face", "🥶": "cold face", "🥴": "woozy face", "😵": "dizzy face", "🤯": "exploding head", "🤠": "cowboy hat face", "🥳": "partying face", "😎": "smiling face with sunglasses", "🤓": "nerd face", "😕": "confused face", "😟": "worried face", "🙁": "slightly frowning face", "😮": "face with open mouth", "😲": "astonished face", "😳": "flushed face", "🥺": "pleading face", "😢": "crying face", "😭": "loudly crying face", "😱": "face screaming in fear", "😤": "face with steam from nose", "😡": "pouting face", "😠": "angry face", "🤬": "face with symbols on mouth", "💀": "skull", "💩": "pile of poo", "🤡": "clown face", "👻": "ghost", "👽": "alien", "🤖": "robot", "😺": "grinning cat", "❤️": "red heart", "❤": "red heart", "🧡": "orange heart", "💛": "yellow heart", "💚": "green heart", "💙": "blue heart", "💜": "purple heart", "🖤": "black heart", "🤍": "white heart", "💔": "broken heart", "💕": "two hearts", "💖": "sparkling heart", "💯": "hundred points", "💤": "zzz", "💫": "dizzy", "💥": "collision", "👋": "waving hand", "👌": "OK hand", "✌️": "victory hand", "🤞": "crossed fingers", "🤟": "love-you gesture", "👍": "thumbs up", "👎": "thumbs down", "👏": "clapping hands", "🙌": "raising hands", "🙏": "folded hands", "💪": "flexed biceps", "👀": "eyes", "🧠": "brain", "🔥": "fire", "✨": "sparkles", "⭐": "star", "🌟": "glowing star", "🌙": "crescent moon", "☀️": "sun", "🌈": "rainbow", "⚡": "high voltage", "🎉": "party popper", "🎊": "confetti ball", "🎂": "birthday cake", "🎁": "wrapped gift", "🎵": "musical note", "🎶": "musical notes", "🎧": "headphone", "🎮": "video game", "📱": "mobile phone", "💻": "laptop", "⌨️": "keyboard", "📷": "camera", "📌": "pushpin", "📍": "round pushpin", "✅": "check mark button", "❌": "cross mark", "⚠️": "warning", "❓": "question mark", "❗": "exclamation mark", "➡️": "right arrow", "⬅️": "left arrow", "🚀": "rocket", "☕": "hot beverage", "🍕": "pizza", "🍔": "hamburger", "🍟": "french fries", "🍩": "doughnut", "🍪": "cookie", "🌸": "cherry blossom", "🍒": "cherries", "🌹": "rose", "🐶": "dog face", "🐱": "cat face", "🦄": "unicorn", "🐐": "goat", "🏆": "trophy", "⚽": "soccer ball", "🏀": "basketball", "👑": "crown", "💎": "gem stone", "💰": "money bag", "🙈": "see-no-evil monkey", "🤝": "handshake", "🫶": "heart hands", "🥲": "smiling face with tear", "🫠": "melting face", "🤌": "pinched fingers" };
Looscid.LC_EMOJI = LC_EMOJI;
const LC_EMOJI_RE = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier})*)/gu;
Looscid.LC_EMOJI_RE = LC_EMOJI_RE;
function lcEmojiName(e) { return LC_EMOJI[e] || LC_EMOJI[e.replace(/\uFE0F/g, "")] || LC_EMOJI[e + "\uFE0F"] || "emoji"; }
function lcSpeechText(t, a) {
  a = a || Looscid.A11Y_NOW; let s = String(t || "");
  if (a.speakEmoji === "skip") s = s.replace(LC_EMOJI_RE, "");
  else if (a.speakEmoji === "word") s = s.replace(LC_EMOJI_RE, " emoji ");
  else s = s.replace(LC_EMOJI_RE, function (m) { return " " + lcEmojiName(m) + " "; });
  if (a.speakTags === "skip") s = s.replace(/(^|\s)[#@](?=[\w])/g, "$1");
  return s.replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim();
}
function lcBrailleText(t, a) {
  a = a || Looscid.A11Y_NOW; let s = String(t || "");
  s = a.brailleEmoji === "strip" ? s.replace(LC_EMOJI_RE, "") : s.replace(LC_EMOJI_RE, function (m) { return ":" + lcEmojiName(m).replace(/\s+/g, "_") + ":"; });
  return s.replace(/\s+/g, " ").trim();
}
// "5m", "2h", "just now" -> short / full words
function lcTimeParts(time) {
  const s = String(time || "").trim(); let m;
  if (!s) return null;
  if (/^just now$|^now$/i.test(s)) return { short: "now", full: "just now" };
  if ((m = /^(\d+)\s*(s|m|h|d|w|y)$/i.exec(s))) { const n = +m[1], u = { s: "second", m: "minute", h: "hour", d: "day", w: "week", y: "year" }[m[2].toLowerCase()]; return { short: n + m[2].toLowerCase(), full: n + " " + u + (n === 1 ? "" : "s") + " ago" }; }
  return { short: s, full: s };
}
function lcDreamKind(d) { return d.redreamOf || d.isRedream ? "Redream" : d.replyTo || d.isReply ? "Reply" : "Dream"; }
// The words a Dream is announced with (speech) or shown with (braille), from the settings.
function lcDreamWords(d, mode, a) {
  a = a || Looscid.A11Y_NOW; const u = d.user || {}, kind = lcDreamKind(d), tp = lcTimeParts(d.time);
  if (mode === "braille") {
    const pre = a.braillePrefix !== false ? ({ Dream: "D:", Reply: "R:", Redream: "RD:" }[kind]) + " " : "";
    const tm = tp ? (a.brailleTime !== false ? tp.short : tp.full) : "";
    return (pre + (u.name || "") + (tm ? " " + tm : "") + ": " + lcBrailleText(d.text, a)).trim();
  }
  const v = a.verbosity || "normal", parts = [];
  const name = (v === "detailed" && kind !== "Dream" ? kind + " from " : "") + (u.name || "Someone") + (v === "detailed" && u.handle ? ", " + lcSpeechText(u.handle, a) : "");
  const text = lcSpeechText(d.text, a);
  const tm = v !== "short" && tp && a.speakTime !== "off" ? (a.speakTime === "short" ? tp.short : tp.full) : "";
  if (a.readOrder === "text") { parts.push(text); parts.push(name); } else { parts.push(name); parts.push(text); }
  if (tm) parts.push(tm);
  if (v === "detailed" && !a.calmFeed) parts.push((d.likes || 0) + ((d.likes || 0) === 1 ? " like" : " likes") + ", " + lcReplyCount(d) + (lcReplyCount(d) === 1 ? " reply" : " replies") + ", " + (d.redreams || 0) + ((d.redreams || 0) === 1 ? " Redream" : " Redreams"));
  return parts.filter(Boolean).join(". ").replace(/\.\./g, ".");
}
function lcFiltered(d, a) {
  a = a || Looscid.A11Y_NOW; const t = " " + lcNorm(d.text) + " ", hit = function (w) { const n = lcNorm(w); return n && t.indexOf(" " + n + " ") >= 0 || (n && n.indexOf(" ") > 0 && t.indexOf(n) >= 0); };
  if (d.user && typeof d.user === "object" && lcBlockedUser(d.user)) return { hide: true, blockedUser: true };
  if (d.circleId != null && lcBlocked("circles").indexOf(String(d.circleId)) >= 0) return { hide: true, blockedCircle: true };
  const bw = lcBlocked("words").find(hit); if (bw) return { bw: bw };
  const mute = lcWords(a.mutedWords).find(hit); if (mute) return { hide: true, word: mute };
  const cw = lcWords(a.cwWords).find(hit); if (cw) return { cw: cw };
  return null;
}
/* --- Read-aloud (speechSynthesis), with ducking and pitch cues ----------- */
const LcSpeech = (function () {
  const ok = typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
  let ducked = false;
  function voices() { try { return ok ? window.speechSynthesis.getVoices() : []; } catch (e) { return []; } }
  function duck(on) { if (on === ducked) return; ducked = on; try { if (Music.duck) Music.duck(on); } catch (e) {} }
  // parts: [{ text, secondary }]; secondary parts drop pitch when Pitch cues are on.
  function speak(parts, opts) {
    if (!ok) { announce("Read aloud isn't available in this browser."); return false; }
    const a = Looscid.A11Y_NOW, ss = window.speechSynthesis; try { ss.cancel(); } catch (e) {}
    if (typeof parts === "string") parts = [{ text: parts }];
    const vs = voices(), v = a.ttsVoice ? vs.find(function (x) { return x.voiceURI === a.ttsVoice || x.name === a.ttsVoice; }) : null;
    const list = parts.filter(function (p) { return p && String(p.text || "").trim(); });
    list.forEach(function (p, i) {
      const u = new SpeechSynthesisUtterance(lcSpeechText(p.text, a));
      if (v) u.voice = v;
      u.rate = Math.max(0.5, Math.min(2, (+a.ttsRate || 100) / 100));
      const base = Math.max(0.5, Math.min(1.5, (+a.ttsPitch || 100) / 100));
      u.pitch = p.secondary && a.pitchCues !== false ? Math.max(0.1, base * 0.8) : base;
      if (i === 0) u.onstart = function () { if (a.ducking !== false) duck(true); };
      if (i === list.length - 1) { u.onend = u.onerror = function () { duck(false); if (opts && opts.onEnd) opts.onEnd(); }; }
      try { ss.speak(u); } catch (e) {}
    });
    window.__lcSpoke = list.map(function (p) { return (p.secondary ? "~" : "") + lcSpeechText(p.text, a); });
    return true;
  }
  function stop() { try { if (ok) window.speechSynthesis.cancel(); } catch (e) {} duck(false); }
  return { ok: ok, speak: speak, stop: stop, voices: voices, duck: duck, ducked: function () { return ducked; } };
})();
Looscid.LcSpeech = LcSpeech;
function lcDreamSpeechParts(d) {
  const u = d.user || {}, kind = lcDreamKind(d), tp = lcTimeParts(d.time), a = Looscid.A11Y_NOW;
  const parts = [{ text: (kind !== "Dream" ? kind + " from " : "") + (u.name || "Someone") }, { text: d.text }];
  if (a.readOrder === "text") parts.reverse();
  if (tp && a.speakTime !== "off") parts.push({ text: a.speakTime === "short" ? tp.short : tp.full, secondary: true });
  if (kind !== "Dream") parts[0].secondary = true;
  return parts;
}
/* --- Sound packs: Looscid, NexOS classic, Insomnia, and your own ---------- */
// Notes: [frequency Hz, start s, length s, wave?, gain?, slide-to Hz?]
// NexOS classic: the square-wave system sounds from NexOS Web (script.js SFX: install,
// uninstall, error, update, blip, key) at NexOS's own levels. Insomnia: the soft sine
// chimes from Insomnia OS (click, tick, open, close, ding) through its echo.
// Earcon specs (round 5). Each sound is a list of ops played through one master -> limiter
// chain, the same way NexOS Web builds its sounds (script.js: tone(), click(), SFX, UI):
//   ["t", freq, at, dur, wave, gain, slideTo, attack, release]   a tone
//   ["c", freq, at, dur, gain, q, slideTo]                        a filtered-noise click
// Calm mode keeps every wave (beeps stay beeps); it only lowers the level a little and
// rounds off the top end. Pitch cues off: every tone plays at the first tone's pitch.
const LC_NOTE = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
Looscid.LC_NOTE = LC_NOTE;
const LcT = function (f, at, d, w, g, slide, att, rel) { return ["t", f, at || 0, d, w || "square", g == null ? 0.25 : g, slide || 0, att || 0, rel || 0]; };
Looscid.LcT = LcT;
// Round 6 synth voice: [ "s", f, at, d, wave, g, voices, detune cents, filter from, filter to, FM index ].
const LcS = function (f, at, d, w, g, n, det, fA, fB, fm) { return ["s", f, at || 0, d, w || "sawtooth", g == null ? 0.12 : g, n || 1, det || 0, fA || 6000, fB || 1200, fm || 0]; };
Looscid.LcS = LcS;
const LcC = function (f, at, d, g, q, slide) { return ["c", f, at || 0, d, g == null ? 0.3 : g, q || 1, slide || 0]; };
Looscid.LcC = LcC;
const N_ = LC_NOTE;
Looscid.N_ = N_;
const LC_PACKS = {
  // NexOS classic: ported from NexOS Web (github.com/2three1y/nexos, gh-pages, script.js SFX and UI).
  nexos: {
    label: "NexOS classic", echo: false, gain: 1, chimes: true,
    sounds: {
      boot:     { label: "Boot chime", ops: [60, 64, 67, 72].map(function (m, i) { return LcT(N_(m), i * 0.09, 0.22, "triangle", 0.4); }).concat([LcT(N_(84), 0.36, 0.5, "sine", 0.25)]) },          // SFX.boot
      send:     { label: "Send", ops: [LcC(1800, 0, 0.11, 0.28, 0.9, 500), LcC(140, 0.1, 0.03, 0.4, 0.8), LcT(2637, 0.14, 0.7, "sine", 0.22, 0, 0.003)] }, // UI.enter: carriage return and bell
      like:     { label: "Like", ops: [LcT(700, 0, 0.07, "triangle", 0.24), LcT(1050, 0.07, 0.1, "triangle", 0.24)] },        // UI.on
      newDream: { label: "New Dream", ops: [74, 79, 86].map(function (m, i) { return LcT(N_(m), i * 0.08, 0.12, "square", 0.22); }) }, // SFX.update
      error:    { label: "Error", ops: [LcT(140, 0, 0.12, "square", 0.32), LcT(140, 0.16, 0.18, "square", 0.32)] },          // SFX.error: low double buzz
      alerts:   { label: "Alert", ops: [84, 88, 91].map(function (m, k) { return LcT(N_(m), k * 0.12, 0.1, "square", 0.26); }) }, // one round of the Clock alarm
      feedSwitch: { label: "Feed switch", ops: [LcC(2600, 0, 0.012, 0.25, 1.2), LcT(1200, 0.006, 0.025, "triangle", 0.12)] }, // UI.nav (steady)
      focus:    { label: "Focus move", ops: [LcT(880, 0, 0.045, "square", 0.11)] },                                          // SFX.blip, a short beep
      // Round 6 (Alhasan): open = Insomnia's Good Morning bloom (Db Ab C F C, its boot chime), 2.5x faster; close and Back =
      // its Good Night chime (G E C G C), 3x faster. Same notes, same octave shimmer; they also play on every page, menu or dialog open/close.
      open:     { label: "Good Morning", ops: [[277.2, 0], [415.3, .072], [523.3, .144], [698.5, .216], [1046.5, .312]].reduce(function (a, n) { return a.concat([LcT(n[0], n[1], 0.3, "sine", 0.26, 0, 0.012, 0.2), LcT(n[0] * 2.001, n[1], 0.18, "sine", 0.05, 0, 0.012)]); }, []) },
      close:    { label: "Good Night", ops: [[784, 0], [659.3, .117], [523.3, .233], [392, .35], [261.6, .5]].reduce(function (a, n) { return a.concat([LcT(n[0], n[1], 0.28, "sine", 0.26, 0, 0.01, 0.2), LcT(n[0] * 2.001, n[1], 0.16, "sine", 0.045, 0, 0.01)]); }, []).concat([LcT(130.8, 0.5, 0.42, "triangle", 0.16, 0, 0.05)]) },
      run:      { label: "Done", ops: [LcT(N_(76), 0, 0.05, "square", 0.13), LcT(N_(84), 0.06, 0.12, "triangle", 0.28)] },    // UI.equals
      settings: { label: "Settings", ops: [LcC(1600, 0, 0.012, 0.3, 2), LcC(3200, 0.03, 0.01, 0.22, 2), LcT(N_(79), 0.06, 0.1, "triangle", 0.2)] }, // UI.settings
      feed:     { label: "Feed", ops: [LcT(N_(67), 0, 0.08, "triangle", 0.28), LcT(N_(72), 0.07, 0.09, "triangle", 0.28), LcT(N_(79), 0.14, 0.18, "triangle", 0.28)] }, // UI.home
      circles:  { label: "Circles", ops: [72, 76, 79, 83].map(function (m, i) { return LcT(N_(m), i * 0.045, 0.07, "triangle", 0.22); }) }, // UI.apps
      help:     { label: "Help", ops: [LcT(N_(81), 0, 0.12, "sine", 0.3, N_(84)), LcT(N_(88), 0.12, 0.25, "sine", 0.3, N_(91))] },    // UI.help
      clear:    { label: "Clear", ops: [LcC(900, 0, 0.18, 0.3, 0.8, 4500), LcT(N_(69), 0.16, 0.07, "triangle", 0.22)] },       // UI.clear
      on:       { label: "Sound on", ops: [LcT(700, 0, 0.07, "triangle", 0.24), LcT(1050, 0.07, 0.1, "triangle", 0.24)] },     // UI.on
      off:      { label: "Sound off", ops: [LcT(1050, 0, 0.07, "triangle", 0.24), LcT(700, 0.07, 0.11, "triangle", 0.24)] },   // UI.off
      link:     { label: "Link", ops: [LcT(1500, 0, 0.05, "sine", 0.22, 2300)] },                                           // UI.fill: a rising chirp
      install:  { label: "Install", ops: [60, 64, 67, 72].map(function (m, i) { return LcT(N_(m), i * 0.075, 0.13, "square", 0.24); }) }, // SFX.install
      uninstall:{ label: "Uninstall", ops: [LcT(N_(67), 0, 0.12, "square", 0.24), LcT(N_(60), 0.13, 0.2, "square", 0.24)] },   // SFX.uninstall
    },
  },
  // Looscid: its own loud, classic beeps and boops (round 5), one distinct shape per event.
  looscid: {
    label: "Looscid", echo: false, gain: 1,
    sounds: {
      boot:     { label: "Boot chime", ops: [72, 76, 79, 84].map(function (m, i) { return LcT(N_(m), i * 0.08, 0.16, "square", 0.18); }).concat([LcT(N_(91), 0.34, 0.45, "triangle", 0.3)]) },
      send:     { label: "Send", ops: [LcT(N_(76), 0, 0.06, "square", 0.17), LcT(N_(83), 0.06, 0.1, "square", 0.17), LcT(N_(95), 0.14, 0.12, "sine", 0.16)] },
      like:     { label: "Like", ops: [LcT(N_(88), 0, 0.05, "triangle", 0.32), LcT(N_(93), 0.05, 0.09, "triangle", 0.3)] },
      newDream: { label: "New Dream", ops: [LcT(N_(72), 0, 0.06, "square", 0.15), LcT(N_(79), 0.06, 0.06, "square", 0.15), LcT(N_(84), 0.12, 0.14, "triangle", 0.3)] },
      error:    { label: "Error", ops: [LcT(196, 0, 0.12, "square", 0.26, 147), LcT(147, 0.15, 0.17, "square", 0.26)] },
      alerts:   { label: "Alerts", ops: [LcT(N_(91), 0, 0.06, "square", 0.17), LcT(N_(91), 0.1, 0.06, "square", 0.17), LcT(N_(96), 0.2, 0.12, "triangle", 0.28)] },
      feedSwitch: { label: "Feed switch", ops: [LcT(660, 0, 0.05, "triangle", 0.26), LcC(2400, 0, 0.01, 0.12, 1.5)] },
      focus:    { label: "Focus move", ops: [LcT(1320, 0, 0.032, "square", 0.08)] },
      open:     { label: "Open", ops: [LcT(440, 0, 0.07, "square", 0.15, 880), LcT(880, 0.07, 0.06, "square", 0.12)] },
      close:    { label: "Close", ops: [LcT(330, 0, 0.1, "triangle", 0.34, 150)] },
      run:      { label: "Done", ops: [LcT(N_(84), 0, 0.05, "square", 0.13), LcT(N_(88), 0.05, 0.1, "triangle", 0.28)] },
      settings: { label: "Settings", ops: [LcC(2000, 0, 0.012, 0.22, 2), LcT(N_(76), 0.03, 0.06, "square", 0.13), LcT(N_(71), 0.09, 0.09, "square", 0.13)] },
      feed:     { label: "Feed", ops: [LcT(N_(72), 0, 0.06, "triangle", 0.28), LcT(N_(79), 0.06, 0.1, "triangle", 0.28)] },
      circles:  { label: "Circles", ops: [LcT(N_(67), 0, 0.05, "square", 0.13), LcT(N_(71), 0.05, 0.05, "square", 0.13), LcT(N_(74), 0.1, 0.09, "square", 0.13)] },
      help:     { label: "Help", ops: [LcT(N_(76), 0, 0.07, "sine", 0.3), LcT(N_(81), 0.07, 0.11, "sine", 0.3)] },
      clear:    { label: "Clear", ops: [LcC(800, 0, 0.15, 0.26, 0.8, 4000)] },
      on:       { label: "Sound on", ops: [LcT(N_(72), 0, 0.06, "square", 0.15), LcT(N_(79), 0.06, 0.1, "square", 0.15)] },
      off:      { label: "Sound off", ops: [LcT(N_(79), 0, 0.06, "square", 0.15), LcT(N_(72), 0.06, 0.1, "square", 0.15)] },
      link:     { label: "Link", ops: [LcT(1760, 0, 0.045, "sine", 0.22, 2093)] },
      install:  { label: "Saved", ops: [LcT(N_(79), 0, 0.06, "square", 0.14), LcT(N_(84), 0.06, 0.1, "triangle", 0.26)] },
      uninstall:{ label: "Deleted", ops: [LcT(N_(76), 0, 0.07, "square", 0.14), LcT(N_(67), 0.08, 0.14, "triangle", 0.26)] },
    },
  },
  // Insomnia OS (nexos/apps/insomnia/script.js A.play): its own click, tick, open, close, ding, boot and goodnight,
  // through a soft echo like its chime bus. Round 6 maps each Looscid event to the closest one (see the round 6 report).
  insomnia: {
    label: "Insomnia", echo: true, gain: 2.2,
    sounds: {
      boot:     { label: "Good Morning", ops: [[277.2, 0], [415.3, .18], [523.3, .36], [698.5, .54], [1046.5, .78]].reduce(function (a, n) { return a.concat([LcT(n[0], n[1], 1.2, "sine", 0.2, 0, 0.04, 0.8), LcT(n[0] * 2.001, n[1], 0.8, "sine", 0.04, 0, 0.04)]); }, []) }, // A.play("boot")
      send:     { label: "Ding", ops: [LcT(1318, 0, 0.35, "sine", 0.18, 0, 0.005, 0.25), LcT(1976, 0, 0.25, "sine", 0.06, 0, 0.005)] },          // "ding"
      like:     { label: "Ding", ops: [LcT(1318, 0, 0.3, "sine", 0.16, 0, 0.005, 0.2)] },                                                       // "ding", short
      newDream: { label: "Ding", ops: [LcT(1318, 0, 0.5, "sine", 0.18, 0, 0.005, 0.35), LcT(1976, 0, 0.35, "sine", 0.06, 0, 0.005)] },          // "ding"
      error:    { label: "Error", ops: [LcT(220, 0, 0.18, "triangle", 0.2), LcT(196, 0.16, 0.22, "triangle", 0.2)] },                         // derived: a low falling pair in Insomnia's triangle voice
      alerts:   { label: "Double ding", ops: [LcT(1318, 0, 0.3, "sine", 0.18, 0, 0.005, 0.2), LcT(1760, 0.14, 0.4, "sine", 0.16, 0, 0.005, 0.28)] }, // "ding", then a fourth up
      feedSwitch: { label: "Tick", ops: [LcT(900, 0, 0.02, "square", 0.05)] },                                                                  // "tick"
      focus:    { label: "Tick", ops: [LcT(900, 0, 0.02, "square", 0.05)] },                                                                     // "tick"
      key:      { label: "Click", ops: [LcT(1400, 0, 0.03, "square", 0.08)] },                                                                   // "click"
      open:     { label: "Open", ops: [LcT(660, 0, 0.09, "triangle", 0.2), LcT(990, 0.06, 0.12, "triangle", 0.17)] },                          // "open"
      close:    { label: "Close", ops: [LcT(880, 0, 0.08, "triangle", 0.17), LcT(587, 0.05, 0.12, "triangle", 0.14)] },                        // "close"
      run:      { label: "Ding", ops: [LcT(1318, 0, 0.3, "sine", 0.18, 0, 0.005, 0.2), LcT(1976, 0, 0.2, "sine", 0.06, 0, 0.005)] },           // "ding": success
      settings: { label: "Open", ops: [LcT(660, 0, 0.09, "triangle", 0.2), LcT(990, 0.06, 0.12, "triangle", 0.17)] },
      feed:     { label: "Open", ops: [LcT(660, 0, 0.09, "triangle", 0.2), LcT(990, 0.06, 0.12, "triangle", 0.17)] },
      circles:  { label: "Open", ops: [LcT(660, 0, 0.09, "triangle", 0.2), LcT(990, 0.06, 0.12, "triangle", 0.17)] },
      help:     { label: "Ding", ops: [LcT(1318, 0, 0.3, "sine", 0.16, 0, 0.005, 0.2)] },
      clear:    { label: "Close", ops: [LcT(880, 0, 0.08, "triangle", 0.17), LcT(587, 0.05, 0.12, "triangle", 0.14)] },
      on:       { label: "Toggle on", ops: [LcT(660, 0, 0.06, "triangle", 0.18), LcT(990, 0.04, 0.08, "triangle", 0.16)] },                    // "open", shorter
      off:      { label: "Toggle off", ops: [LcT(880, 0, 0.06, "triangle", 0.16), LcT(587, 0.04, 0.08, "triangle", 0.14)] },                  // "close", shorter
      link:     { label: "Click", ops: [LcT(1400, 0, 0.03, "square", 0.08)] },
      install:  { label: "Ding", ops: [LcT(1318, 0, 0.3, "sine", 0.18, 0, 0.005, 0.2), LcT(1976, 0, 0.2, "sine", 0.06, 0, 0.005)] },
      uninstall:{ label: "Good Night", ops: [[784, 0], [659.3, .117], [523.3, .233]].map(function (n) { return LcT(n[0], n[1], 0.25, "sine", 0.2, 0, 0.01, 0.18); }) },
    },
  },
  // Hyper Synth (round 6): bright detuned supersaw stabs and plucky square/saw leads with a fast filter sweep and a
  // little FM sparkle, after the synths in the Looscid beats. Every sound is under 250 ms. LcS = a synth voice.
  synth: {
    label: "Hyper Synth", echo: false, gain: 1,
    sounds: {
      boot:     { label: "Arp up", ops: [72, 76, 79, 84].map(function (m, i) { return LcS(N_(m), i * 0.05, 0.08, "sawtooth", 0.13, 3, 18, 8000, 1500, 0.3); }) },
      open:     { label: "Rising arp", ops: [72, 76, 79].map(function (m, i) { return LcS(N_(m), i * 0.05, 0.08, "sawtooth", 0.14, 3, 18, 7000, 1500); }) },
      close:    { label: "Falling arp", ops: [79, 76, 72].map(function (m, i) { return LcS(N_(m), i * 0.05, 0.08, "sawtooth", 0.14, 3, 18, 7000, 1200); }) },
      error:    { label: "Low buzz", ops: [LcS(110, 0, 0.2, "square", 0.18, 3, 35, 1800, 400)] },
      run:      { label: "Chord stab", ops: [72, 76, 79].map(function (m, i) { return LcS(N_(m), 0, 0.18, "sawtooth", 0.1, 3, 14, 9000, 1800, i === 2 ? 0.5 : 0); }) },
      send:     { label: "Chord stab", ops: [72, 76, 79].map(function (m, i) { return LcS(N_(m), 0, 0.18, "sawtooth", 0.1, 3, 14, 9000, 1800, i === 2 ? 0.5 : 0); }) },
      on:       { label: "Up blip", ops: [LcT(880, 0, 0.07, "square", 0.14, 1320)] },
      off:      { label: "Down blip", ops: [LcT(1320, 0, 0.07, "square", 0.14, 880)] },
      like:     { label: "Up blip", ops: [LcT(880, 0, 0.07, "square", 0.14, 1320)] },
      alerts:   { label: "Hook", ops: [LcS(N_(81), 0, 0.09, "sawtooth", 0.15, 2, 12, 8000, 2000, 0.6), LcS(N_(88), 0.11, 0.11, "sawtooth", 0.15, 2, 12, 8000, 2000, 0.6)] },
      newDream: { label: "Hook", ops: [LcS(N_(79), 0, 0.08, "sawtooth", 0.14, 2, 12, 8000, 2000, 0.6), LcS(N_(86), 0.1, 0.1, "sawtooth", 0.14, 2, 12, 8000, 2000, 0.6)] },
      focus:    { label: "Pluck", ops: [LcS(1760, 0, 0.04, "square", 0.09, 1, 0, 6000, 900)] },
      feedSwitch: { label: "Pluck", ops: [LcS(1320, 0, 0.04, "square", 0.09, 1, 0, 6000, 900)] },
      key:      { label: "Tick", ops: [LcC(4200, 0, 0.015, 0.32, 3)] },
      link:     { label: "Chirp", ops: [LcS(1500, 0, 0.06, "square", 0.1, 1, 0, 9000, 2500, 0.8)] },
      settings: { label: "Rising arp", ops: [67, 72, 79].map(function (m, i) { return LcS(N_(m), i * 0.045, 0.07, "sawtooth", 0.13, 3, 16, 7000, 1500); }) },
      feed:     { label: "Rising arp", ops: [72, 79, 84].map(function (m, i) { return LcS(N_(m), i * 0.045, 0.07, "sawtooth", 0.13, 3, 16, 7000, 1500); }) },
      circles:  { label: "Rising arp", ops: [72, 76, 79, 83].map(function (m, i) { return LcS(N_(m), i * 0.04, 0.06, "square", 0.12, 2, 12, 7000, 1500); }) },
      help:     { label: "Hook", ops: [LcS(N_(76), 0, 0.08, "square", 0.13, 2, 10, 7000, 1800), LcS(N_(83), 0.1, 0.1, "square", 0.13, 2, 10, 7000, 1800)] },
      clear:    { label: "Falling arp", ops: [84, 79, 72].map(function (m, i) { return LcS(N_(m), i * 0.045, 0.07, "sawtooth", 0.13, 3, 16, 7000, 1200); }) },
      install:  { label: "Chord stab", ops: [72, 76, 79].map(function (m) { return LcS(N_(m), 0, 0.18, "sawtooth", 0.1, 3, 14, 9000, 1800); }) },
      uninstall:{ label: "Falling arp", ops: [79, 76, 72].map(function (m, i) { return LcS(N_(m), i * 0.05, 0.08, "sawtooth", 0.14, 3, 18, 7000, 1200); }) },
    },
  },
};
Looscid.LC_PACKS = LC_PACKS;
const LC_EVENT_SWITCH = { send: "ev_send", like: "ev_like", newDream: "ev_newDream", error: "ev_error", alerts: "ev_alert", feedSwitch: "ev_feed", focus: "earconFocus", link: "linkPitch" };
Looscid.LC_EVENT_SWITCH = LC_EVENT_SWITCH;
/* --- Custom sound packs: a .zip or files, checked, saved in IndexedDB ------- */
const LC_PACK_DB = "dbm_soundpacks";
Looscid.LC_PACK_DB = LC_PACK_DB;
function lcIdb() {
  return new Promise(function (res, rej) {
    if (!window.indexedDB) { rej(new Error("This browser can't store sound packs.")); return; }
    const r = indexedDB.open(LC_PACK_DB, 1);
    r.onupgradeneeded = function () { r.result.createObjectStore("packs"); };
    r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error || new Error("Storage error")); };
  });
}
function lcIdbDo(mode, fn) { return lcIdb().then(function (db) { return new Promise(function (res, rej) { const tx = db.transaction("packs", mode), st = tx.objectStore("packs"); const r = fn(st); tx.oncomplete = function () { res(r && r.result); db.close(); }; tx.onerror = function () { rej(tx.error); db.close(); }; }); }); }
const lcPackGet = function () { return lcIdbDo("readonly", function (s) { return s.get("custom"); }); };
Looscid.lcPackGet = lcPackGet;
const LC_REPLIES = {}; // replies written this session, by Dream id (for Hear thread)
Looscid.LC_REPLIES = LC_REPLIES;
Looscid.LC_LAST_DREAM = null;
function lcCurrentDream() { return Looscid.LC_LAST_DREAM; }
Looscid.LC_UNDO_SET = null;
Looscid.LC_CUSTOM_PACK = null; // { files: [...], map: { event: fileName } } loaded from IndexedDB
function lcLoadCustomPack() { return lcPackGet().then(function (v) { Looscid.LC_CUSTOM_PACK = v || null; return Looscid.LC_CUSTOM_PACK; }, function () { return null; }); }
try { if (typeof window !== "undefined") setTimeout(lcLoadCustomPack, 0); } catch (e) {}
const LOOSCID_SLOGAN = "Accessibility first, always"; // Home page title: "Looscid - " + slogan (a placeholder Hasan may change)
Looscid.LOOSCID_SLOGAN = LOOSCID_SLOGAN;
/* Round 6 versioning (Alhasan, Oct 10 2026): YEAR.FEATURES.FIXES (BUILD), counted on the preview branch.
   A commit is a fix when its subject matches (?i)^\s*(fix|hotfix|bugfix|chore|typo|revert|patch|docs?|style|refactor|cleanup|tweak|ci)\b
   or has fix, fixes or fixed anywhere; anything else is a feature update. Builds = commits.
   Builds 1 to 135 are counted privately and never listed (27 fixes + 108 features); Round 6 is build 136 (a feature update)
   Round 6.1, the split into files, is build 137 (a fix update), and Round 6.2, the app icon, is build 138 (a fix update), and Round 6.3, saved Dreams and composer focus, is build 139 (a fix update), and Round 6.4, Dreams on Nostr, is build 140 (a feature update), and Round 6.5, the new composer and Replies, is build 141 (a feature update).
   version.json at the site root carries the same numbers; the update check compares its build. */
const LOOSCID_VERSION = "2026.111.30";
Looscid.LOOSCID_VERSION = LOOSCID_VERSION;
const LOOSCID_BUILD = 141;
Looscid.LOOSCID_BUILD = LOOSCID_BUILD;
const LOOSCID_RELEASED = "2026-10-10T17:50:27Z"; // the Round 6.5 commit time (version.json "released" matches)
Looscid.LOOSCID_RELEASED = LOOSCID_RELEASED;
/* --- Round 6: in-app update check. version.json (no-store) on load, every 10 minutes and when
   Looscid comes back to the front. A newer build shows one banner: Update now or Later. Never
   reloads by itself. Later hides that version until a newer one. Drafts autosave on this device. */
const LC_UPDATE_AUTO_KEY = "dbm_update_auto", LC_UPDATE_LATER_KEY = "dbm_update_later";
Looscid.LC_UPDATE_AUTO_KEY = LC_UPDATE_AUTO_KEY; Looscid.LC_UPDATE_LATER_KEY = LC_UPDATE_LATER_KEY;
Looscid.LC_UPDATE_SEEN = 0;
function lcUpdateAuto() { try { return localStorage.getItem(LC_UPDATE_AUTO_KEY) !== "off"; } catch (e) { return true; } }
function lcFetchVersion() {
  return fetch("version.json?t=" + Date.now(), { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
}
function lcCheckUpdate(manual) {
  if (!manual && !lcUpdateAuto()) return Promise.resolve(null);
  return lcFetchVersion().then(function (v) {
    const b = +(v && v.build) || 0;
    if (b > LOOSCID_BUILD) {
      let later = 0; try { later = +localStorage.getItem(LC_UPDATE_LATER_KEY) || 0; } catch (e) {}
      if (manual || later < b) { try { window.dispatchEvent(new CustomEvent("looscid:update", { detail: v })); } catch (e) {} }
      return v;
    }
    if (manual) announce("Looscid is up to date: " + lcVersionLabel() + ".");
    return null;
  }, function () { if (manual) announce("Couldn't check for updates. Check your connection and try again."); return null; });
}
function lcApplyUpdate() {
  // Keep what's being written, then load the new version.
  try { const t = document.querySelector("textarea"); if (t && t.value && t.value.trim() && Looscid.A11Y_NOW.draftAutosave) localStorage.setItem(LC_AUTOSAVE_KEY, t.value); } catch (e) {}
  const go = function () { try { location.reload(); } catch (e) {} };
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
      navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.update().catch(function () {}); })); }).then(go, go);
      return;
    }
  } catch (e) {}
  go();
}
function LcUpdateBanner() {
  const [v, setV] = useState(null);
  useEffect(function () {
    const on = function (e) {
      const d = e.detail || {}; setV(d);
      if (Looscid.LC_UPDATE_SEEN !== +d.build) { Looscid.LC_UPDATE_SEEN = +d.build; announce("A new update is available for Looscid: " + d.version + " (" + d.build + ")."); try { Earcon.play("alerts"); } catch (x) {} }
    };
    window.addEventListener("looscid:update", on);
    const first = setTimeout(function () { lcCheckUpdate(false); }, 1500);
    const iv = setInterval(function () { lcCheckUpdate(false); }, 10 * 60 * 1000);
    const vis = function () { if (document.visibilityState === "visible") lcCheckUpdate(false); };
    document.addEventListener("visibilitychange", vis);
    return function () { window.removeEventListener("looscid:update", on); clearTimeout(first); clearInterval(iv); document.removeEventListener("visibilitychange", vis); };
  }, []);
  if (!v) return null;
  return lh('div', { className: "lc-update", role: "region", "aria-label": "Update" },
    lh('p', { id: "lc-update-t" }, "A new update is available for Looscid: " + v.version + " (" + v.build + ")."),
    lh('div', { className: "lc-update-btns" },
      lh('button', { type: "button", id: "lc-update-now", className: "btn bp lc-btn", onClick: lcApplyUpdate }, "Update now"),
      lh('button', { type: "button", id: "lc-update-later", className: "btn bgb lc-btn", onClick: function () { try { localStorage.setItem(LC_UPDATE_LATER_KEY, String(v.build)); } catch (e) {} setV(null); announce("OK, later. Check for updates is in About."); } }, "Later")));
}
function lcVersionLabel() { return "Looscid " + LOOSCID_VERSION + " (" + LOOSCID_BUILD + ")"; }
// "October 10, 2026 at 1:09 PM" in this device's time zone.
function lcReleasedText(iso) {
  const d = new Date(iso); if (isNaN(d)) return "";
  try { return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(d) + " at " + new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(d); }
  catch (e) { return d.toLocaleString(); }
}
function loadA11y() {
  const rd = function (k) { try { const s = JSON.parse(localStorage.getItem(k) || "null"); return s && typeof s === "object" && !Array.isArray(s) ? s : {}; } catch (e) { return {}; } };
  const o = Object.assign({}, A11Y_DEFAULTS, rd(A11Y_KEY), rd(LC_SETTINGS_KEY));
  o.srNames = Object.assign({}, LC_SR_NAMES_DEF, o.srNames && typeof o.srNames === "object" ? o.srNames : {});
  if (!Array.isArray(o.shortcuts)) o.shortcuts = [];
  // Round 6, once per device: anyone still on the old default volume (40) moves to the new, louder default.
  try {
    if (!localStorage.getItem("dbm_r6_migrated")) {
      localStorage.setItem("dbm_r6_migrated", "1");
      if (localStorage.getItem(A11Y_KEY) || localStorage.getItem(LC_SETTINGS_KEY)) {
        if (+o.earconVolume === 40) o.earconVolume = A11Y_DEFAULTS.earconVolume;
        saveA11y(o);
      }
    }
  } catch (e) {}
  return o;
}
// Older settings stay in looscid_a11y; round-4 settings go to dbm_settings.
function saveA11y(a) {
  try {
    const o = {}, n = {};
    LC_OLD_KEYS.forEach(function (k) { if (k in a) o[k] = a[k]; });
    Object.keys(LC_NEW_DEFAULTS).forEach(function (k) { if (k in a) n[k] = a[k]; });
    localStorage.setItem(A11Y_KEY, JSON.stringify(o)); localStorage.setItem(LC_SETTINGS_KEY, JSON.stringify(n));
  } catch (e) {}
}
function a11yAsked() { try { return localStorage.getItem(A11Y_ASKED_KEY) === "1"; } catch (e) { return true; } }
function setA11yAsked() { try { localStorage.setItem(A11Y_ASKED_KEY, "1"); } catch (e) {} }
Looscid.A11Y_NOW = loadA11y(); // read outside React by earcons and Enter = Send
function systemReducedMotion() { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
function motionReduced() { return !!Looscid.A11Y_NOW.reduceMotion || systemReducedMotion(); }
function a11yEnterSends() { return Looscid.A11Y_NOW.enterSend !== false; }
// Close buttons: visible text says "Close"; speech says what closes ("Close menu"); braille shows "Close".
// aria-label carries the full name, aria-braillelabel the short one, so a braille display shows "Close".
// Settings > Accessibility > Screen reader and braille > Braille > "Short labels on braille" (closeLabels, default on).
function lcCloseProps(target) {
  return { "aria-label": target ? "Close " + target : "Close", "aria-braillelabel": Looscid.A11Y_NOW.closeLabels !== false ? "Close" : undefined };
}
const LC_INTRO = [
  "Somewhere between your midnight thoughts and your wildest ideas, there’s a place made for you. Welcome to Looscid: a decentralized, open source everything app where your data stays yours.",
  "Looscid works the way you do, with a screen reader, a braille display, a keyboard, a switch or just your thumbs.",
];
Looscid.LC_INTRO = LC_INTRO;
const DEVICE_PRESETS = [
  { id: "screenreader", label: "With a screen reader", sub: "VoiceOver, TalkBack, NVDA or JAWS", set: { screenReader: true, earcons: true, calmMode: true, earconFocus: true } },
  { id: "braille", label: "With a braille display", sub: "Braille output, and Enter sends", set: { screenReader: true, brailleOutput: true, enterSend: true } },
  { id: "lowvision", label: "With low vision", sub: "Larger text, high contrast and bold text", set: { textSize: 2, highContrast: true, boldText: true } },
  { id: "hearing", label: "Deaf or hard of hearing", sub: "Captions, and a gentle visual cue instead of sounds", set: { captions: true, visualCue: true } },
  { id: "motion", label: "Sensitive to motion or flashing", sub: "Reduce Motion, Calm mode and quieter sounds", set: { reduceMotion: true, calmMode: true, earconVolume: 25 } },
];
Looscid.DEVICE_PRESETS = DEVICE_PRESETS;
/* --- Earcons: short (150 ms or less), quiet Web Audio sounds ------------- */
// [frequency Hz, start s, length s]; every earcon ends by 0.15 s.
const Earcon = (function () {
  let ac = null, idle = null, cueAt = 0, capT = null, noise = null;
  const GESTURES = ["pointerdown", "touchend", "keydown", "click"];
  // No audio context until the person presses something (and only if sounds are on).
  // iOS Safari: the context is created and a silent buffer played inside the first tap.
  function unlock() {
    try {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        ac = new AC();
        const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0);
      }
      if (ac.state === "suspended") ac.resume();
    } catch (e) {}
  }
  function onGesture() {
    if (!Looscid.A11Y_NOW.earcons || Looscid.A11Y_NOW.visualCue) return;
    unlock();
    if (ac) GESTURES.forEach(function (t) { window.removeEventListener(t, onGesture, true); });
  }
  GESTURES.forEach(function (t) { window.addEventListener(t, onGesture, true); });
  // Battery: the context sleeps between sounds.
  function sleepSoon() { clearTimeout(idle); idle = setTimeout(function () { try { if (ac && ac.state === "running") ac.suspend(); } catch (e) {} }, 1500); }
  // master -> limiter -> out, like NexOS Web's makeChain (script.js). Built once.
  let chain = null, lpNode = null;
  // Round 6 (louder): master gain x2 (+6 dB) into a brick-wall limiter (-1 dBFS ceiling, fast attack),
  // then a soft clipper as the last safety so nothing ever goes past full scale.
  const LC_MASTER_GAIN = 2;
  function bus() {
    if (chain) return chain;
    const master = ac.createGain(); master.gain.value = LC_MASTER_GAIN;
    const lim = ac.createDynamicsCompressor();
    lim.threshold.value = -1; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.08;
    const clip = ac.createWaveShaper(); const cv = new Float32Array(1025); for (let i = 0; i < 1025; i++) { const x = i / 512 - 1; cv[i] = Math.tanh(1.6 * x) / Math.tanh(1.6); } clip.curve = cv;
    lpNode = ac.createBiquadFilter(); lpNode.type = "lowpass"; lpNode.frequency.value = 20000; lpNode.Q.value = 0.5;
    lpNode.connect(master); master.connect(lim); lim.connect(clip); clip.connect(ac.destination); chain = lpNode; return chain;
  }
  function noiseBuf() {
    if (!noise) { noise = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.4), ac.sampleRate); const ch = noise.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    return noise;
  }
  function tone(e, vol, opts) {
    const t0 = ac.currentTime + 0.005, out = ac.createGain(); out.gain.value = vol;
    const calm = !!Looscid.A11Y_NOW.calmMode;
    const dest = bus();
    // Calm mode: same beeps, just rounded off at the top (no harsh highs). Never turns waves into sines.
    lpNode.frequency.setValueAtTime(calm ? 5200 : 20000, ac.currentTime);
    if (opts && opts.echo) {
      // Insomnia OS: a soft echo (delay with low-passed feedback), as in its chime bus.
      const d = ac.createDelay(0.5), fb = ac.createGain(), lp = ac.createBiquadFilter(), wet = ac.createGain();
      d.delayTime.value = 0.22; fb.gain.value = 0.3; lp.type = "lowpass"; lp.frequency.value = 2400; wet.gain.value = 0.35;
      out.connect(dest); out.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(dest);
    } else out.connect(dest);
    // Pitch cues off: every tone plays at the first tone's pitch (same rhythm, no rise or fall).
    // The feed switch sound is always steady: feed switching never changes pitch.
    const steady = !(opts && opts.free) && (Looscid.A11Y_NOW.pitchCues === false || (opts && opts.steady));
    if (e.ops) {
      const firstT = e.ops.find(function (o) { return o[0] === "t" || o[0] === "s"; });
      e.ops.forEach(function (o) {
        if (o[0] === "t") {
          const f = steady && firstT ? firstT[1] : o[1], st = t0 + o[2], d = o[3], g = o[5], att = o[7] || 0.004, rel = o[8] || Math.max(0.03, d * 0.6);
          const osc = ac.createOscillator(), env = ac.createGain();
          osc.type = o[4]; osc.frequency.value = f; osc.frequency.setValueAtTime(f, st);
          if (o[6] && !steady) osc.frequency.exponentialRampToValueAtTime(o[6], st + d);
          env.gain.setValueAtTime(0.0001, st); env.gain.exponentialRampToValueAtTime(g, st + att);
          env.gain.setValueAtTime(g, st + Math.max(att, d - rel)); env.gain.exponentialRampToValueAtTime(0.0001, st + d + rel * 0.5);
          osc.connect(env); env.connect(out); osc.start(st); osc.stop(st + d + rel + 0.02);
        } else if (o[0] === "s") {
          // Synth voice (round 6): a detuned stack through a fast lowpass sweep, with optional FM sparkle.
          const f = steady && firstT ? firstT[1] : o[1], st = t0 + o[2], d = o[3], g = o[5], vN = Math.max(1, o[6] || 1), det = o[7] || 0;
          const flt = ac.createBiquadFilter(), env = ac.createGain();
          flt.type = "lowpass"; flt.Q.value = 5; flt.frequency.setValueAtTime(o[8], st); flt.frequency.exponentialRampToValueAtTime(Math.max(80, o[9]), st + d);
          env.gain.setValueAtTime(0.0001, st); env.gain.exponentialRampToValueAtTime(g, st + 0.004); env.gain.setValueAtTime(g, st + d * 0.35); env.gain.exponentialRampToValueAtTime(0.0001, st + d);
          for (let k = 0; k < vN; k++) {
            const osc = ac.createOscillator(); osc.type = o[4]; osc.frequency.value = f; osc.frequency.setValueAtTime(f, st);
            osc.detune.value = vN > 1 ? (k / (vN - 1) * 2 - 1) * det : 0;
            if (o[10] && !steady) { const m = ac.createOscillator(), mg = ac.createGain(); m.type = "sine"; m.frequency.value = f * 2.01; mg.gain.setValueAtTime(f * o[10], st); mg.gain.exponentialRampToValueAtTime(1, st + d); m.connect(mg); mg.connect(osc.frequency); m.start(st); m.stop(st + d + 0.02); }
            osc.connect(flt); osc.start(st); osc.stop(st + d + 0.02);
          }
          flt.connect(env); env.connect(out);
        } else {
          const st = t0 + o[2], d = o[3], src = ac.createBufferSource(), bp = ac.createBiquadFilter(), env = ac.createGain();
          src.buffer = noiseBuf(); bp.type = "bandpass"; bp.Q.value = o[5]; bp.frequency.setValueAtTime(o[1], st);
          if (o[6] && !steady) bp.frequency.exponentialRampToValueAtTime(o[6], st + d);
          env.gain.setValueAtTime(o[4], st); env.gain.exponentialRampToValueAtTime(0.0001, st + d);
          src.connect(bp); bp.connect(env); env.connect(out); src.start(st); src.stop(st + d + 0.02);
        }
      });
      return;
    }
    e.notes.forEach(function (n) {
      const f = steady ? e.notes[0][0] : n[0], st = n[1], d = n[2], env = ac.createGain();
      const peak = (n[4] != null ? n[4] : 1) * 0.3;
      let src;
      if (e.wave === "noise") {
        src = ac.createBufferSource(); src.buffer = noiseBuf();
        const bp = ac.createBiquadFilter(); bp.type = "bandpass"; if (steady) bp.frequency.setValueAtTime(f, t0 + st); else { bp.frequency.setValueAtTime(f / 3, t0 + st); bp.frequency.exponentialRampToValueAtTime(f, t0 + st + d); } bp.Q.value = 1.2;
        src.connect(bp); bp.connect(env);
      } else {
        src = ac.createOscillator(); src.type = n[3] || e.wave; src.frequency.value = f;
        if (n[5] && !steady) src.frequency.exponentialRampToValueAtTime(n[5], t0 + st + d);
        src.connect(env);
      }
      env.gain.setValueAtTime(0.0001, t0 + st);
      env.gain.exponentialRampToValueAtTime(peak, t0 + st + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + st + d);
      env.connect(out); src.start(t0 + st); src.stop(t0 + st + d + 0.01);
    });
  }
  // Imported sounds: decoded once, played through one gain, cut at 3 seconds.
  const bufs = {};
  function customBuffer(name) {
    const P = Looscid.LC_CUSTOM_PACK; if (!P || !P.map || !P.map[name]) return null;
    const fn = P.map[name], f = (P.files || []).find(function (x) { return x.name === fn; }); if (!f) return null;
    const key = fn + ":" + f.size;
    if (bufs[key] && bufs[key] !== "loading") return bufs[key];
    if (!bufs[key]) { bufs[key] = "loading"; ac.decodeAudioData(f.data.slice(0)).then(function (b) { bufs[key] = b; playBuf(b, lastVol); }, function () { delete bufs[key]; }); }
    return "loading";
  }
  let lastVol = 0.1;
  // Imported sounds go through the same master bus and limiter (round 6).
  // One level for earcons, pitch cues and key clicks: the volume slider (0 to 100) and Calm mode.
  function lcLevel(a) { return 1.6 * (Math.max(0, Math.min(100, +a.earconVolume || 0)) / 100) * (a.calmMode ? 0.75 : 1); }
  function playBuf(b, vol) { const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = b; g.gain.value = Math.min(1, vol * 0.6); s.connect(g); g.connect(bus()); s.start(); s.stop(ac.currentTime + Math.min(b.duration, 3)); }
  // Gentle visual cue: one soft fade at the screen edge, at most once a second
  // (well under the three-flashes-a-second limit). Reduce Motion makes it a still outline.
  function cue() {
    const now = Date.now(); if (now - cueAt < 1000) return false; cueAt = now;
    const el = document.getElementById("lc-cue"); if (!el) return false;
    el.classList.add("on"); setTimeout(function () { el.classList.remove("on"); }, 700);
    return true;
  }
  function caption(text) {
    const el = document.getElementById("lc-caption"); if (!el) return;
    el.textContent = text; el.classList.add("on");
    clearTimeout(capT); capT = setTimeout(function () { el.classList.remove("on"); el.textContent = ""; }, 1800);
  }
  function soundFor(name, pack) {
    const p = pack || Looscid.A11Y_NOW.soundPack || "looscid";
    if (p !== "custom" && LC_PACKS[p] && LC_PACKS[p].sounds[name]) return { e: LC_PACKS[p].sounds[name], echo: LC_PACKS[p].echo, gain: LC_PACKS[p].gain };
    const e = LC_PACKS.looscid.sounds[name]; return e ? { e: e, gain: 1 } : null;
  }
  // opts: { test: play even when sounds are off; pack: preview another pack }
  function play(name, opts) {
    const s = soundFor(name, opts && opts.pack); if (!s) return;
    const e = s.e, a = Looscid.A11Y_NOW, test = opts && opts.test;
    const sw = LC_EVENT_SWITCH[name];
    if (!test && sw && a[sw] === false) return;          // that event's switch is off
    if (!test && lcQuietNow()) return;                     // quiet hours: no sounds at all
    window.__lcSounds = (window.__lcSounds || []).concat([name + ":" + ((opts && opts.pack) || a.soundPack || "looscid")]).slice(-60);
    if (!test && (name === "send" || name === "like" || name === "error" || name === "alerts")) lcBuzz(name);
    if (a.visualCue) { if (name === "focus" || name === "link") return; if (a.flashSafety) caption("[" + e.label + "]"); else { cue(); if (a.captions) caption("[" + e.label + "]"); } return; }
    if (!a.earcons && !test) return;
    if (test) unlock();
    if (!ac) return; // nothing pressed yet: stay silent
    // Loud and classic: NexOS Web's level curve (volume / 100 x 1.6) into the limiter. Calm mode is a bit softer.
    const vol = lcLevel(a) * (s.gain || 1);
    if (vol <= 0) return; lastVol = vol;
    const usePack = (opts && opts.pack) || a.soundPack;
    const go = function () {
      try {
        if (usePack === "custom") { const b = customBuffer(name); if (b && b !== "loading") playBuf(b, vol); else if (!b) tone(e, vol, { steady: name === "feedSwitch", free: name === "link" }); }
        else tone(e, vol, { echo: s.echo, steady: name === "feedSwitch", free: name === "link" });
      } catch (er) {}
      sleepSoon();
    };
    if (ac.state === "suspended") ac.resume().then(go, function () {}); else go();
    if (a.captions && name !== "focus" && name !== "link") caption("[" + e.label + " sound]");
  }
  // Keyboard clicks (Settings, Sounds): one short noise tick, same pitch every time. Master Earcons switch,
  // master volume and quiet hours apply; Calm mode only rounds it off. No pitch, ever.
  let keyAt = 0;
  function key(opts) {
    const a = Looscid.A11Y_NOW, test = opts && opts.test;
    if (!test && (a.keyClicks === false || !a.earcons || lcQuietNow() || a.visualCue)) return;
    const now = Date.now(); if (!test && now - keyAt < 25) return; keyAt = now;
    window.__lcKeys = (window.__lcKeys || 0) + 1;
    if (test) unlock();
    if (!ac) return;
    const vol = lcLevel(a);
    if (vol <= 0) return;
    // Round 6: a pack can bring its own key click (Insomnia's click, Hyper Synth's filtered tick).
    const pk = LC_PACKS[a.soundPack] && LC_PACKS[a.soundPack].sounds.key;
    const go = function () { try { if (pk) tone(pk, vol * 0.5 * (LC_PACKS[a.soundPack].gain || 1), { steady: true, echo: false }); else tone({ label: "Key", ops: [["n", 3200, 0, 0.012, 0.5, 1.4, 0]] }, vol * 0.5, { steady: true }); } catch (e) {} sleepSoon(); };
    if (ac.state === "suspended") ac.resume().then(go, function () {}); else go();
  }
  // Pitch cues (Settings, Accessibility, Screen reader and braille, Verbosity): one very short tone whose
  // pitch says what kind of thing this is. f2 slides (open rises, close falls, on up, off down).
  let pcAt = 0;
  function pcue(kind, f, f2, opts) {
    const a = Looscid.A11Y_NOW, test = opts && opts.test;
    if (!test && (!a.earcons || a.pitchCues === false || lcQuietNow() || a.visualCue)) return false;
    const now = Date.now(); if (!test && !(opts && opts.force) && now - pcAt < 110) return false; pcAt = now; // fast swiping never stacks cues
    window.__lcCues = (window.__lcCues || []).concat([kind + ":" + Math.round(f) + (f2 ? ">" + Math.round(f2) : "")]).slice(-80);
    if (test) unlock();
    if (!ac) return true;
    const vol = lcLevel(a);
    if (vol <= 0) return true;
    const wave = kind === "heading" ? "triangle" : kind === "field" ? "square" : "sine";
    const go = function () { try { tone({ label: "Pitch cue", ops: [LcT(f, 0, f2 ? 0.07 : 0.04, wave, 0.16, f2 || 0)] }, vol * 0.6, { free: true }); } catch (e) {} sleepSoon(); };
    if (ac.state === "suspended") ac.resume().then(go, function () {}); else go();
    return true;
  }

  // Round 6 measurement hook (tests only): renders one sound offline through the same chain.
  function _render(kind, name) {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC) return null;
    const saved = [ac, chain, lpNode, noise], off = new OAC(1, 44100 * 1.5, 44100);
    ac = off; chain = null; lpNode = null; noise = null;
    try {
      const a = Looscid.A11Y_NOW;
      const vol = lcLevel(a);
      if (kind === "earcon") { const s = soundFor(name); tone(s.e, vol * (s.gain || 1), { echo: s.echo, steady: name === "feedSwitch", free: name === "link" }); }
      else if (kind === "key") tone({ label: "Key", ops: [["n", 3200, 0, 0.012, 0.5, 1.4, 0]] }, vol * 0.5, { steady: true });
      else tone({ label: "Pitch cue", ops: [LcT(+name || 880, 0, 0.04, "sine", 0.16, 0)] }, vol * 0.6, { free: true });
    } finally { ac = saved[0]; chain = saved[1]; lpNode = saved[2]; noise = saved[3]; }
    return off.startRendering().then(function (buf) { const d = buf.getChannelData(0); let pk = 0, ss = 0, n = 0; for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; if (v > 1e-4) { ss += d[i] * d[i]; n++; } } return { peak: pk, rms: n ? Math.sqrt(ss / n) : 0 }; });
  }
  return { play: play, unlock: unlock, key: key, cue: pcue, _render: _render, _ctx: function () { return ac; }, soundFor: soundFor };
})();
Looscid.Earcon = Earcon;
/* Pitch cues: which kind of thing got focus, and its pitch. Each kind has its own switch in Verbosity. */
const LC_PC = {
  link: ["linkPitch", 1568], button: ["pcButtons", 523], field: ["pcFields", 392], toggle: ["pcToggles", 988],
  position: ["pcPosition", 0], open: ["pcOpenClose", 659], close: ["pcOpenClose", 988], success: ["pcStatus", 1760], error: ["pcStatus", 220],
  heading: ["pcHeadings", 0],
};
Looscid.LC_PC = LC_PC;
const LC_PC_HEAD = [0, 1397, 1245, 1109, 932, 831, 740]; // h1 highest
Looscid.LC_PC_HEAD = LC_PC_HEAD;
Looscid.LC_PC_QUIET_UNTIL = 0; // set by feed switching and typing: no pitch cues then
Looscid.LC_PC_BACK_AT = 0; // a Back or Close press: the page change then plays the falling cue, not the rising one
function lcPcOn(kind) { const a = Looscid.A11Y_NOW, p = LC_PC[kind]; return !!p && a.earcons && a.pitchCues !== false && a[p[0]] !== false; }
// Round 6: a pack with chimes (NexOS classic) plays its open chime (Good Morning) whenever anything opens and its
// close chime (Good Night) on Back or Close, alongside the pitch cue (which is unchanged).
Looscid.LC_CHIME_AT = 0;
function lcPackChime(kind) {
  const P = LC_PACKS[Looscid.A11Y_NOW.soundPack]; if (!P || !P.chimes) return;
  const now = Date.now();
  if (kind === "open" && now - Looscid.LC_PC_BACK_AT < 600) return; // the page that Back lands on doesn't say Good Morning
  if (now - Looscid.LC_CHIME_AT < 300) return; Looscid.LC_CHIME_AT = now;
  Earcon.play(kind);
}
function lcPitchCue(kind, detail, opts) {
  if ((kind === "open" || kind === "close") && !(opts && opts.test)) lcPackChime(kind);
  if (!(opts && opts.test) && (!lcPcOn(kind) || Date.now() < Looscid.LC_PC_QUIET_UNTIL)) return false;
  let f = LC_PC[kind][1], f2 = 0;
  if (kind === "heading") f = LC_PC_HEAD[Math.max(1, Math.min(6, +detail || 2))];
  else if (kind === "position") { const i = detail ? detail[0] : 0, n = detail ? Math.max(1, detail[1]) : 1; f = Math.round(1320 - 660 * (n > 1 ? i / (n - 1) : 0)); }
  else if (kind === "open") f2 = 988;
  else if (kind === "close") f2 = 659;
  else if (kind === "toggle") { if (detail === "on") { f = 784; f2 = 1175; } else if (detail === "off") { f = 1175; f2 = 784; } }
  return Earcon.cue(kind, f, f2, opts);
}
function lcPcKindOf(el) {
  if (!el || !el.closest) return null;
  if (el.closest("#feed-tablist, #feed-menu, #feed-menu-btn, .lc-feedslider, [role=slider]")) return null; // feed switching: never
  if (el.closest('a[href], [role="link"]')) return ["link"];
  const role = el.getAttribute("role") || "", tag = el.tagName;
  if (/^H[1-6]$/.test(tag) || role === "heading") return ["heading", role === "heading" ? +(el.getAttribute("aria-level") || 2) : +tag[1]];
  const it = el.closest('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"], ul.mlist > li > button, ul.mlist > li > a');
  if (it) {
    const box = it.closest('[role="menu"], [role="listbox"], ul.mlist');
    if (box) { const all = Array.from(box.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"], :scope > li > button, :scope > li > a')); const i = all.indexOf(it); if (i >= 0 && all.length > 1) return ["position", [i, all.length]]; }
  }
  if (role === "switch" || (tag === "INPUT" && (el.type === "checkbox" || el.type === "radio"))) return ["toggle", (el.getAttribute("aria-checked") === "true" || el.checked) ? "on" : "off"];
  if (tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable || (tag === "INPUT" && !/^(button|submit|reset|range|color|file|hidden|image)$/.test(el.type)) || /^(textbox|searchbox|combobox)$/.test(role)) return ["field"];
  if (tag === "BUTTON" || role === "button" || role === "tab" || (tag === "INPUT" && /^(button|submit|reset)$/.test(el.type))) return ["button"];
  return null;
}
function areaOfPage(p) {
  if (p === "feed") return "feed";
  if (p === "alerts") return "alerts";
  if (p === "groups") return "circles";
  if (p && p.indexOf("settings") === 0) return "settings";
  return null;
}
/* --- Music: the NexOS beats ------------------------------------------------ */
// Streamed on demand from NexOS Web (the same files NexOS plays); nothing loads until Play.
const MUSIC_BASE = "nexos/";
Looscid.MUSIC_BASE = MUSIC_BASE;
const MUSIC_KEY = "looscid_music";
Looscid.MUSIC_KEY = MUSIC_KEY;
const MUSIC_GENRES = [
  { id: "original", label: "Morning to Night", sub: "the original NexOS beat, 96 BPM", file: "beat/nexos-beat.m4a", alias: ["original", "morning to night", "nexos", "default", "morning"] },
  { id: "hyperpop", label: "Hyperpop", sub: "160 BPM", file: "beat/nexos-beat-hyperpop.m4a", alias: ["hyperpop", "hyper pop", "hyper"] },
  { id: "lofi", label: "Lo-fi chill", sub: "80 BPM", file: "beat/nexos-beat-lofi.m4a", alias: ["lofi", "lo fi", "lofi chill", "chill"] },
  { id: "dnb", label: "Drum and bass", sub: "172 BPM", file: "beat/nexos-beat-dnb.m4a", alias: ["dnb", "drum and bass", "drum n bass", "drum & bass", "d&b", "d and b", "jungle"] },
  { id: "chiptune", label: "Chiptune (8-bit)", sub: "140 BPM", file: "beat/nexos-beat-chiptune.m4a", alias: ["chiptune", "chip tune", "8 bit", "8bit", "chip"] },
];
Looscid.MUSIC_GENRES = MUSIC_GENRES;
const musicKey = function (s) { return String(s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, ""); };
Looscid.musicKey = musicKey;
function musicFind(q) {
  const k = musicKey(q); if (!k) return null;
  return MUSIC_GENRES.find(function (g) { return g.alias.concat([g.label]).some(function (a) { return musicKey(a) === k; }); })
    || MUSIC_GENRES.find(function (g) { return g.alias.some(function (a) { const b = musicKey(a); return b.length > 2 && k.length > 2 && (b.indexOf(k) === 0 || k.indexOf(b) === 0); }); }) || null;
}
const Music = (function () {
  let el = null, ac = null, gain = null, routed = false, want = false;
  const subs = new Set();
  let st = { genre: "original", volume: 60 };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(MUSIC_KEY) || "{}")); } catch (e) {}
  const save = function () { try { localStorage.setItem(MUSIC_KEY, JSON.stringify(st)); } catch (e) {} };
  const emit = function () { subs.forEach(function (f) { try { f(); } catch (e) {} }); };
  const cur = function () { return MUSIC_GENRES.find(function (g) { return g.id === st.genre; }) || MUSIC_GENRES[0]; };
  function ensure() {
    if (el) return el;
    el = new Audio(); el.preload = "none"; el.crossOrigin = "anonymous"; el.loop = true;
    ["playing", "pause", "ended"].forEach(function (t) { el.addEventListener(t, emit); });
    el.addEventListener("error", function () { if (want) { want = false; announce("That beat couldn't load. Check your connection and try again."); } emit(); });
    return el;
  }
  // Volume through Web Audio, so it also works on iPhone (where audio.volume is fixed). Created on the first Play press.
  function route() {
    if (routed) return; routed = true;
    try { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ac = new AC(); const src = ac.createMediaElementSource(el); gain = ac.createGain(); src.connect(gain); gain.connect(ac.destination); } catch (e) { ac = null; gain = null; }
  }
  let ducked = false;
  function applyVol() { const v = Math.max(0, Math.min(100, st.volume)) / 100 * (ducked ? 0.3 : 1); if (gain) { gain.gain.value = v; if (el) el.volume = 1; } else if (el) el.volume = v; }
  function play(id) {
    const g = (id && MUSIC_GENRES.find(function (x) { return x.id === id; })) || cur();
    st.genre = g.id; save(); ensure();
    if (el.getAttribute("data-genre") !== g.id) { el.src = MUSIC_BASE + g.file; el.setAttribute("data-genre", g.id); }
    route(); applyVol();
    try { if (ac && ac.state === "suspended") ac.resume(); } catch (e) {}
    want = true;
    const p = el.play(); if (p && p.catch) p.catch(function (e) { if (want && e && e.name === "NotAllowedError") announce("Press Play to start the beat."); });
    emit(); return g;
  }
  function pause() { want = false; if (el) el.pause(); try { if (ac && ac.state === "running") ac.suspend(); } catch (e) {} emit(); } // battery: audio sleeps while paused
  function stop() { pause(); if (el) { try { el.currentTime = 0; } catch (e) {} } emit(); }
  return {
    play: play, pause: pause, stop: stop, current: cur,
    playing: function () { return !!el && want && !el.paused; },
    select: function (id) { const was = this.playing(); st.genre = id; save(); if (was) play(id); else emit(); },
    volume: function () { return st.volume; },
    setVolume: function (v) { st.volume = Math.max(0, Math.min(100, Math.round(v))); save(); applyVol(); emit(); },
    subscribe: function (f) { subs.add(f); return function () { subs.delete(f); }; },
    // Ducking (Settings > Sounds): music drops to 30 percent while Looscid's read-aloud voice speaks.
    duck: function (on) { ducked = !!on; applyVol(); },
    ducked: function () { return ducked; },
    _el: function () { return el; },
  };
})();
Looscid.Music = Music;
/* --- Accessibility settings in plain words (Cherry, Commandbar) ------ */
const A11Y_NAMES = [
  ["flashSafety", "Flash safety", ["flash safety", "flash safe", "no flashing", "flashing"]],
  ["calmMode", "Calm mode", ["calm mode", "calm"]],
  ["reduceMotion", "Reduce Motion", ["reduce motion", "reduced motion", "motion"]],
  ["highContrast", "High contrast", ["high contrast", "contrast"]],
  ["boldText", "Bold text", ["bold text", "bold"]],
  ["dyslexiaFont", "Dyslexia-friendly spacing", ["dyslexia friendly spacing", "dyslexia spacing", "dyslexia", "dyslexic"]],
  ["screenReader", "Screen reader hints", ["screen reader hints", "screen reader", "hints"]],
  ["captions", "Captions for audio", ["captions", "caption", "subtitles"]],
  ["visualCue", "Visual cue instead of sounds", ["visual cue", "visual flash", "visual alerts"]],
  ["closeLabels", "Short labels on braille", ["short labels on braille", "braille short labels", "short braille labels", "short labels", "close labels", "close label", "close button labels"]],
  ["brailleOutput", "Braille display output", ["braille display output", "braille output", "braille display", "braille"]],
  ["enterSend", "Enter = Send", ["enter send", "enter to send", "enter sends", "enter key"]],
  ["earcons", "Sounds (earcons)", ["earcons", "earcon", "sound effects", "sounds", "sound"]],
  ["pitchCues", "Pitch cues", ["pitch cues", "pitch cue", "pitch changes", "pitch"]],
  ["largeBtns", "Larger buttons", ["larger buttons", "large buttons", "bigger buttons", "big buttons"]],
  ["switchAccess", "Strong focus outline", ["strong focus outline", "focus outline", "switch access"]],
  ["termHeadings", "Heading per command", ["heading per command", "command headings"]],
];
Looscid.A11Y_NAMES = A11Y_NAMES;
// Round-4 on/off settings first, so "send sound off" never matches plain "sound".
LC_SET.filter(function (d) { return d.t === "bool" && !d.old; }).reverse().forEach(function (d) { A11Y_NAMES.unshift([d.k, d.l, d.al.concat([lcNorm(d.l)])]); });
const TEXT_SIZES = ["Default", "Large", "Larger"];
Looscid.TEXT_SIZES = TEXT_SIZES;
const TERM_MODES = { collapsible: "Collapsible section", expanded: "Always expanded", latest: "Latest only" };
Looscid.TERM_MODES = TERM_MODES;
function lcLev(a, b) { const m = a.length, n = b.length; if (!m) return n; if (!n) return m; let p = []; for (let j = 0; j <= n; j++) p[j] = j; for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; }
// Round 4: settings from the registry, by name, in Commandbar and in Cherry.
function lcSectionReport(sec) {
  const a = Looscid.A11Y_NOW, defs = LC_SET.filter(function (x) { return x.s === sec; });
  if (!defs.length) return null;
  return lcSectionTitle(sec) + " (" + LC_SECTIONS[sec].where + "): " + defs.map(function (d) { return d.l + ": " + lcValueText(d, a[d.k]); }).join(". ") + ".";
}
function lcFindSection(t) {
  let best = null, bl = 0;
  Object.keys(LC_SECTIONS).forEach(function (id) { const s = LC_SECTIONS[id]; const names = s.al.concat([lcNorm(lcSectionTitle(id))]); names.forEach(function (al) { if ((" " + t + " ").indexOf(" " + al + " ") >= 0 && al.length > bl) { best = id; bl = al.length; } }); });
  return best;
}
function lcParseTime(t) {
  let m = /\b(\d{1,2})(?::| )?(\d{2})?\s*(am|pm|a m|p m)?\b/.exec(t); if (!m) return null;
  let h = +m[1]; const mi = m[2] ? +m[2] : 0, ap = m[3] ? m[3].replace(" ", "") : "";
  if (h > 23 || mi > 59) return null; if (ap === "pm" && h < 12) h += 12; if (ap === "am" && h === 12) h = 0;
  return (h < 10 ? "0" : "") + h + ":" + (mi < 10 ? "0" : "") + mi;
}
function lcRegistryIntent(n, isOn, isOff) {
  const a = Looscid.A11Y_NOW, t = " " + n + " "; let m;
  // reset
  if ((m = /^(reset|restore)( all)? (.+?)( settings| section)?( to defaults?| defaults?)?$/.exec(n)) || /^reset( all)?( settings)?$/.test(n)) {
    if (/^reset( all)?( settings)?$/.test(n) || (m && /^(all|everything|all settings)$/.test(m[3]))) return { say: "To reset every setting, open Settings, Settings backup, and choose Reset all settings. To reset one section, say reset and its name, like reset audio or reset speech." };
    const sec = lcFindSection(m[3]); if (!sec) return null;
    return { patch: lcSectionDefaults(sec), say: lcSectionTitle(sec) + " is back to its defaults." };
  }
  // muted words and content warnings
  if ((m = /^(?:mute word|mute the word|add muted word|muted words add|mute words?) (.+)$/.exec(n))) {
    const w = m[1].trim(), cur = lcWords(a.mutedWords); if (cur.indexOf(w) >= 0) return { say: "\u201c" + w + "\u201d is already muted." };
    return { patch: { mutedWords: cur.concat([w]).join(", ") }, say: "Muted \u201c" + w + "\u201d. Dreams with it are hidden. Muted words: " + cur.concat([w]).join(", ") + "." };
  }
  if ((m = /^(?:unmute word|remove muted word|muted words remove|unmute) (.+)$/.exec(n)) && lcWords(a.mutedWords).indexOf(m[1].trim()) >= 0) {
    const w = m[1].trim(), rest = lcWords(a.mutedWords).filter(function (x) { return x !== w; });
    return { patch: { mutedWords: rest.join(", ") }, say: "\u201c" + w + "\u201d is no longer muted." };
  }
  if ((m = /^(?:add content warning|content warning add|content warnings add|warn me about|add cw) (.+)$/.exec(n))) {
    const w = m[1].trim(), cur = lcWords(a.cwWords); if (cur.indexOf(w) >= 0) return { say: "There's already a content warning for \u201c" + w + "\u201d." };
    return { patch: { cwWords: cur.concat([w]).join(", ") }, say: "Dreams about \u201c" + w + "\u201d now fold under a content warning." };
  }
  if ((m = /^(?:remove content warning|content warning remove|content warnings remove|remove cw) (.+)$/.exec(n))) {
    const w = m[1].trim(), rest = lcWords(a.cwWords).filter(function (x) { return x !== w; });
    return { patch: { cwWords: rest.join(", ") }, say: "Removed the content warning for \u201c" + w + "\u201d." };
  }
  // find the setting with the longest name in the sentence
  let def = null, al = "";
  LC_SET.forEach(function (d) { if (d.t === "bool") return; d.al.concat([lcNorm(d.l)]).forEach(function (x) { if (t.indexOf(" " + x + " ") >= 0 && x.length > al.length) { def = d; al = x; } }); });
  if (!def) return null;
  const rest = (" " + t.replace(" " + al + " ", " ") + " ").replace(/\s+/g, " ");
  const cur = lcValueText(def, a[def.k]), soon = def.k === "translateTo" && !lcTranslateOk();
  if (def.t === "choice") {
    let pick = null, pl = 0;
    def.o.forEach(function (o) { o[2].concat([lcNorm(o[1])]).forEach(function (x) { if (rest.indexOf(" " + x + " ") >= 0 && x.length > pl) { pick = o; pl = x.length; } }); });
    if (!pick && isOff) pick = def.o.find(function (o) { return o[0] === "off" || o[0] === "never" || o[0] === "0"; });
    if (!pick) return n.split(" ").length > 5 ? null : { say: def.l + " is " + cur + ". Choices: " + def.o.map(function (o) { return o[1]; }).join(", ") + ". It's in " + LC_SECTIONS[def.s].where + "." };
    if (def.k === "soundPack" && pick[0] === "custom" && !(Looscid.LC_CUSTOM_PACK && Looscid.LC_CUSTOM_PACK.files && Looscid.LC_CUSTOM_PACK.files.length)) return { say: "You haven't imported a sound pack yet. Open Settings, Sounds, and choose Import a sound pack." };
    const patch = {}; patch[def.k] = pick[0];
    return { patch: patch, say: def.l + " is now " + pick[1] + "." + (soon ? " This browser has no on-device translator, so Translate stays hidden here." : "") };
  }
  if (def.t === "range") {
    m = /\b(\d{1,3})\b/.exec(rest); if (!m) return n.split(" ").length > 5 ? null : { say: def.l + " is " + cur + ". Say " + def.al[0] + " and a number from " + def.min + " to " + def.max + "." };
    const v = Math.max(def.min, Math.min(def.max, Math.round(+m[1] / def.step) * def.step)), patch = {}; patch[def.k] = v;
    return { patch: patch, say: def.l + " is now " + lcValueText(def, v) + "." };
  }
  if (def.t === "time") {
    const v = lcParseTime(rest); if (!v) return { say: def.l + " is " + cur + ". Say " + def.al[0] + " and a time, like " + def.al[0] + " 10 pm." };
    const patch = {}; patch[def.k] = v; return { patch: patch, say: def.l + " is now " + lcTimeSpoken(v) + "." };
  }
  if (def.t === "voice") {
    const want = rest.trim(); if (!want) return { say: "The read-aloud voice is " + cur + ". Pick one in Settings, Accessibility, Screen reader and braille, " + lcSrName("speech") + "." };
    if (/^(default|device default)$/.test(want)) return { patch: { ttsVoice: "" }, say: "The read-aloud voice is now your device's default." };
    const v = LcSpeech.voices().find(function (x) { return lcNorm(x.name).indexOf(want) >= 0; });
    return v ? { patch: { ttsVoice: v.voiceURI }, say: "The read-aloud voice is now " + v.name + "." } : { say: "No voice called \u201c" + want + "\u201d on this device." };
  }
  if (def.t === "words") return { say: def.l + ": " + cur + ". Say mute word and a word, or add content warning and a word." };
  return null;
}
function lcTranslateOk() { try { return typeof self !== "undefined" && "Translator" in self; } catch (e) { return false; } }
function lcA11yReport() {
  const a = Looscid.A11Y_NOW, o = function (v) { return v ? "on" : "off"; };
  return [
    "Text size: " + TEXT_SIZES[a.textSize || 0] + ". High contrast: " + o(a.highContrast) + ". Bold text: " + o(a.boldText) + ". Dyslexia-friendly spacing: " + o(a.dyslexiaFont) + ".",
    "Captions: " + o(a.captions) + ". Visual cue instead of sounds: " + o(a.visualCue) + ".",
    "Calm mode: " + o(a.calmMode) + ". Flash safety: " + o(a.flashSafety) + ". Reduce Motion: " + o(motionReduced()) + (systemReducedMotion() ? ", set by your device" : "") + ". Three-flash limit: always enforced.",
    "Commandbar output: " + TERM_MODES[a.termOutput || "collapsible"] + ". Heading per command: " + o(a.termHeadings !== false) + ".",
    "Customizability: Feed switching: " + LC_FEED_MODES.find(function (x) { return x[0] === lcFeedMode(a.feedSwitch); })[1] + ".",
  ].concat(["sr_general", "verbosity", "sr_speech", "sr_braille", "audio", "quiet", "feeds", "posting", "media", "filters", "perm"].map(lcSectionReport).filter(Boolean))
   .concat([(a.shortcuts || []).length ? "Your shortcuts: " + a.shortcuts.map(function (s) { return s.keys + " runs " + s.cmd; }).join("; ") + "." : "Your shortcuts: none yet. Add them in Settings, Keyboard shortcuts."]);
}
// Returns null (not a settings request), or { patch, say } / { say } / { report: lines }.
function lcA11yIntent(raw) {
  let n = lcNorm(raw).replace(/\b(please|can you|could you|would you|i want|i'd like|i would like|for me|my|the|a)\b/g, " ").replace(/\s+/g, " ").trim();
  if (!n) return null;
  const a = Looscid.A11Y_NOW, words = n.split(" ");
  if (words.length > 9) return null; // long sentences go to Cherry, not to settings
  const verb = /^(set|turn|switch|toggle|make|enable|disable|change|put)\b/.test(n);
  if (/\b(what|show|list|tell|read|which)\b.*\b(accessibility|settings|options)\b/.test(n) || /^(accessibility )?settings( status)?$/.test(n) || n === "accessibility") {
    if (!/\bopen\b|\bgo\b/.test(n)) return { report: lcA11yReport() };
  }
  const OFF = /\b(off|disable|disabled|deactivate|stop|no more|mute|kill)\b/, ON = /\b(on|enable|enabled|activate|start|unmute)\b/;
  const isOff = OFF.test(n), isOn = !isOff && ON.test(n);
  if (/\b(three|3) flash|flash limit|flash rule|wcag\b/.test(n)) return { say: "The three-flash limit is a hard rule, not a setting, so it can't be turned off: nothing in Looscid flashes more than three times a second. Flash safety is a separate setting: say turn off flash safety to change it." };
  let m;
  if (/\bfeed (switching|switcher|switch mode|mode|control)\b/.test(n)) {
    const v = /\b(menu|pop ?up|popup|button)\b/.test(n) ? "menu" : /\bswipe\b/.test(n) ? "swipe" : /\btabs?\b/.test(n) ? "tabs" : null;
    const nm = function (k) { return LC_FEED_MODES.find(function (x) { return x[0] === k; })[1]; };
    if (!v) return { say: "Feed switching is " + nm(lcFeedMode(a.feedSwitch)) + ". Say feed switching tabs, feed switching swipe or feed switching button." };
    return { patch: { feedSwitch: v }, say: "Feed switching is now " + nm(v) + ". It lives in Settings, Customizability." };
  }
  if ((m = /\b(earcon |sound |sounds )?volume( to)? (\d{1,3})( percent)?$/.exec(n))) {
    const v = Math.max(0, Math.min(100, Math.round(+m[3] / 10) * 10)); return { patch: { earconVolume: v }, say: "Earcon volume is now " + v + " percent." };
  }
  if (/\b(text|font|letters|words)\b/.test(n) && /\b(bigger|larger|large|increase|grow|biggest|largest|huge|smaller|decrease|shrink|default|normal|reset|size)\b/.test(n)) {
    const cur = a.textSize || 0;
    let v = /\b(biggest|largest|huge|max|maximum)\b/.test(n) ? 2 : /\b(bigger|larger|increase|grow|up)\b/.test(n) ? Math.min(2, cur + 1) : /\blarge\b/.test(n) ? Math.max(1, cur) : /\b(smaller|decrease|shrink|down)\b/.test(n) ? Math.max(0, cur - 1) : /\b(default|normal|reset|regular)\b/.test(n) ? 0 : null;
    if (v === null) return { say: "Text size is " + TEXT_SIZES[cur] + ". Say make text bigger, make text smaller, or text size default." };
    if (v === cur) return { say: "Text size is already " + TEXT_SIZES[cur] + (v === 2 ? ", the largest." : v === 0 ? ", the default." : ".") };
    return { patch: { textSize: v }, say: "Text size is now " + TEXT_SIZES[v] + "." };
  }
  if (/\bterminal\b/.test(n) && /\b(latest|collapsible|collapse|collapsed|expanded|expand|always)\b/.test(n)) {
    const v = /\blatest\b/.test(n) ? "latest" : /\b(expanded|always|expand)\b/.test(n) ? "expanded" : "collapsible";
    return { patch: { termOutput: v }, say: "Commandbar output is now " + TERM_MODES[v] + "." };
  }
  const ri = lcRegistryIntent(n, isOn, isOff);
  if (ri) return ri;
  // On / off settings, matched loosely
  let rest = " " + n + " "; const hits = [];
  A11Y_NAMES.forEach(function (row) { for (const ph of row[2]) { if (rest.indexOf(" " + ph + " ") >= 0) { hits.push(row); rest = rest.replace(" " + ph + " ", " "); break; } } });
  if (hits.length && (isOn || isOff)) {
    const patch = {}, says = [];
    hits.forEach(function (row) {
      const k = row[0], v = isOn;
      if (k === "reduceMotion" && !v && systemReducedMotion()) { says.push("Reduce Motion stays on, because your device asks for reduced motion."); return; }
      patch[k] = v; says.push(row[1] + (k === "earcons" ? " are" : " is") + " now " + (v ? "on" : "off") + "." + (k === "flashSafety" && !v ? " The three-flash limit still applies." : ""));
    });
    return Object.keys(patch).length ? { patch: patch, say: says.join(" ") } : { say: says.join(" ") };
  }
  if (hits.length && (verb || words.length <= 3)) {
    const row = hits[0], v = row[0] === "reduceMotion" ? motionReduced() : !!a[row[0]];
    return { say: row[1] + " is " + (v ? "on" : "off") + ". Say turn " + row[2][0] + " " + (v ? "off" : "on") + " to change it." };
  }
  if ((verb || isOn || isOff) && (isOn || isOff || verb) && words.length <= 6) {
    // nothing matched exactly: offer the closest settings
    const toks = words.filter(function (w) { return w.length > 3 && !/^(turn|switch|toggle|make|enable|disable|change|set|off|on)$/.test(w); });
    if (!toks.length) return null;
    const scored = A11Y_NAMES.map(function (row) { let best = 99; row[2].forEach(function (ph) { ph.split(" ").forEach(function (pw) { toks.forEach(function (t) { best = Math.min(best, lcLev(t, pw)); }); }); }); return [best, row]; })
      .filter(function (x) { return x[0] <= 2; }).sort(function (x, y) { return x[0] - y[0]; }).slice(0, 2);
    if (!scored.length) return null;
    return { say: "Did you mean " + scored.map(function (x) { return x[1][1]; }).join(" or ") + "? Try: turn " + (isOff ? "off " : "on ") + scored[0][1][2][0] + "." };
  }
  return null;
}
/* --- Feeds: one tablist; swipe, adjustable control, PageUp/PageDown, commands ---- */
const LC_FEEDS = [
  { id: "home", label: "Home", alias: ["home"] },
  { id: "for you", label: "For You", alias: ["for you", "foryou", "for u"] },
  { id: "following", label: "Following", alias: ["following", "followed"] },
  { id: "local", label: "Local", alias: ["local", "nearby"] },
  { id: "circles", label: "Circles", alias: ["circles", "circle", "groups"] },
  { id: "popular", label: "Popular", alias: ["popular", "top", "trending"] },
  { id: "latest", label: "Latest", alias: ["latest", "newest", "recent", "new"] },
];
Looscid.LC_FEEDS = LC_FEEDS;
const lcFeedKey = function (s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); };
Looscid.lcFeedKey = lcFeedKey;
function lcFeedFind(q) { const k = lcFeedKey(String(q || "").replace(/\b(the|feed|tab)\b/gi, "")); if (!k) return null; return LC_FEEDS.find(function (f) { return f.alias.concat([f.label]).some(function (a) { return lcFeedKey(a) === k; }); }) || null; }
// Settings > Accessibility > Navigation > Feed switching. Each mode exposes exactly one feed control to screen readers.
const LC_FEED_MODES = [
  ["tabs", "Tabs", "Default. A row of feed tabs: arrow keys, Home and End move between them, and PageUp or PageDown work anywhere in the feed."],
  ["swipe", "Swipe", "One Feed switcher control: with VoiceOver, swipe up or down on it to change feed. Without a screen reader, swipe up or down on the feed strip."],
  ["menu", "Pop-up button", "One Feed button that opens a menu of all feeds. Arrow keys or the first letter move through it, Enter picks one."],
];
Looscid.LC_FEED_MODES = LC_FEED_MODES;
function lcFeedMode(v) { return v === "swipe" || v === "menu" ? v : "tabs"; }
Looscid.LC_FEED = (function () { try { return sessionStorage.getItem("looscid_feed") || "for you"; } catch (e) { return "for you"; } })();
// Round 5: the separate Friends tab is gone; Following + "Show friends" is the one way to see mutuals.
if (Looscid.LC_FEED === "friends") { Looscid.LC_FEED = "following"; try { localStorage.setItem("looscid_show_friends", "1"); sessionStorage.setItem("looscid_feed", "following"); } catch (e) {} }
if (!LC_FEEDS.some(function (f) { return f.id === Looscid.LC_FEED; })) Looscid.LC_FEED = "for you";
const LC_FRIENDS_WORDS = ["friends", "friend", "mutuals", "mutual", "friends feed", "mutuals feed"];
Looscid.LC_FRIENDS_WORDS = LC_FRIENDS_WORDS;
Looscid.LC_GO_FEED = null; // set by App: opens the Feed page
function lcFeedLabel(id) { const f = LC_FEEDS.find(function (x) { return x.id === id; }); return f ? f.label : id; }
function lcSetFeed(id, quiet) {
  Looscid.LC_FEED = id; try { sessionStorage.setItem("looscid_feed", id); } catch (e) {}
  window.dispatchEvent(new CustomEvent("looscid:feed", { detail: id }));
  if (Looscid.LC_GO_FEED) Looscid.LC_GO_FEED();
  Looscid.LC_PC_QUIET_UNTIL = Date.now() + 700; // pitch cues never play on feed switching
  Earcon.play("feedSwitch"); // off by default (Settings > Sounds); one steady note, never a pitch change
  if (!quiet) announce("Feed: " + lcFeedLabel(id) + ".");
}
function lcStepFeed(d, quiet) { const i = LC_FEEDS.findIndex(function (f) { return f.id === Looscid.LC_FEED; }); const n = LC_FEEDS[(i + d + LC_FEEDS.length) % LC_FEEDS.length]; lcSetFeed(n.id, quiet); return n; }
Looscid.LC_SETTINGS_BACK = null; // round 6: a settings page opened from a tab goes Back to that tab
Looscid.LC_FOLLOWING_NOW = new Set(); Looscid.LC_GROUPS_NOW = []; // mirrored by App each render
function lcAudCustom(key) { try { const v = JSON.parse(localStorage.getItem("dbm_aud_custom_" + key) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function lcHandle(h) { return String(h || "").trim().replace(/^@/, "").toLowerCase(); }
// Is this person inside the audience? user = a USERS entry (or null for Looscid itself).
function lcAudienceOk(who, user, key) {
  if (!user) return who !== "nobody";
  const id = user.id, fol = Looscid.LC_FOLLOWING_NOW.has(id), fby = !!user.followsYou;
  switch (who || "everyone") {
    case "everyone": return true;
    case "following": return fol;
    case "followers": return fby;
    case "mutuals": case "friends": return fol && fby;
    case "circles": return Looscid.LC_GROUPS_NOW.some(function (g) { return g.joined && (g.members || []).indexOf(id) >= 0; });
    case "nobody": return false;
    case "custom": return lcAudCustom(key).indexOf(lcHandle(user.handle)) >= 0;
    default: return true;
  }
}
const LC_BLOCK_KEYS = { dreamers: "dbm_blocked_dreamers", circles: "dbm_blocked_circles", words: "dbm_blocked_words" };
Looscid.LC_BLOCK_KEYS = LC_BLOCK_KEYS;
function lcBlocked(kind) { try { const v = JSON.parse(localStorage.getItem(LC_BLOCK_KEYS[kind]) || "[]"); return Array.isArray(v) ? v.map(String) : []; } catch (e) { return []; } }
function lcBlockedSet(kind, list) {
  const clean = []; list.forEach(function (x) { const v = kind === "words" ? String(x).trim().toLowerCase() : kind === "dreamers" ? lcHandle(x) : String(x); if (v && clean.indexOf(v) < 0) clean.push(v); });
  try { if (clean.length) localStorage.setItem(LC_BLOCK_KEYS[kind], JSON.stringify(clean.slice(0, 500))); else localStorage.removeItem(LC_BLOCK_KEYS[kind]); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent("looscid:blocked")); } catch (e) {}
  return clean;
}
function lcBlockedUser(user) { if (!user || typeof user !== "object") return false; const h = lcHandle(user.handle); return !!h && lcBlocked("dreamers").indexOf(h) >= 0; }
// The first blocked (or, for feeds and alerts, muted) word in a piece of text, or "".
function lcWordHit(text, where) {
  const t = " " + lcNorm(text) + " "; if (!t.trim()) return "";
  const hit = function (w) { const n = lcNorm(w); return !!n && (t.indexOf(" " + n + " ") >= 0 || (n.indexOf(" ") > 0 && t.indexOf(n) >= 0)); };
  const b = lcBlocked("words").find(hit); if (b) return b;
  if (where === "feed" || where === "alerts") { const m = lcWords((Looscid.A11Y_NOW || {}).mutedWords).find(hit); if (m) return m; }
  return "";
}
// A blocked-word placeholder: "Hidden: contains a blocked word", with Show.
function LcBlockedHidden({ what, children }) {
  const [open, setOpen] = useState(false);
  if (open) return children;
  return lh('div', { className: "lc-cw lc-bw", role: "group", "aria-label": "Hidden: contains a blocked word" },
    lh('p', { className: "lc-cw-t" }, "Hidden: contains a blocked word"),
    lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { setOpen(true); } }, "Show " + (what || "it")));
}
/* --- Round 6: Alerts. Only alert types that really fire in this local-only build. ------------
   Stored on this device: the alerts (dbm_alerts, newest first, 100 at most) and their settings
   (dbm_alert_prefs: per type on, sound and who; plus group similar). */
const LC_ALERTS_KEY = "dbm_alerts", LC_ALERT_PREFS_KEY = "dbm_alert_prefs";
Looscid.LC_ALERTS_KEY = LC_ALERTS_KEY; Looscid.LC_ALERT_PREFS_KEY = LC_ALERT_PREFS_KEY;
const LC_ALERT_TYPES = [
  { id: "newDream", l: "New Dreams", tab: "New Dreams", one: "new Dream", many: "new Dreams", earcon: "newDream", aud: true },
  { id: "mention", l: "Mentions", tab: "Mentions", one: "mentioned you", many: "mentions", earcon: "alerts", aud: true },
  { id: "reply", l: "Replies", tab: "Replies", one: "replied to your Dream", many: "replies", earcon: "alerts", aud: true },
  { id: "system", l: "From Looscid", tab: "From Looscid", one: "", many: "updates", earcon: "alerts", aud: false },
];
Looscid.LC_ALERT_TYPES = LC_ALERT_TYPES;
const LC_ALERT_PREF_DEF = { group: true, types: { newDream: { on: true, sound: true, who: "following" }, mention: { on: true, sound: true, who: "everyone" }, reply: { on: true, sound: true, who: "everyone" }, system: { on: true, sound: false, who: "everyone" } } };
Looscid.LC_ALERT_PREF_DEF = LC_ALERT_PREF_DEF;
function lcAlertPrefs() {
  let s = {}; try { s = JSON.parse(localStorage.getItem(LC_ALERT_PREFS_KEY) || "{}") || {}; } catch (e) {}
  const o = { group: s.group !== undefined ? !!s.group : LC_ALERT_PREF_DEF.group, types: {} };
  LC_ALERT_TYPES.forEach(function (t) { o.types[t.id] = Object.assign({}, LC_ALERT_PREF_DEF.types[t.id], (s.types || {})[t.id] || {}); });
  return o;
}
function lcAlerts() { try { const v = JSON.parse(localStorage.getItem(LC_ALERTS_KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function lcAlertsSave(list) { try { localStorage.setItem(LC_ALERTS_KEY, JSON.stringify(list.slice(0, 100))); } catch (e) {} window.dispatchEvent(new CustomEvent("looscid:alerts")); }
// The one door every alert goes through. Returns the stored alert, or null when settings say no.
function lcNotify(type, text, user, preview) {
  const T = LC_ALERT_TYPES.find(function (x) { return x.id === type; }); if (!T) return null;
  const P = lcAlertPrefs(), tp = P.types[type];
  if (!tp.on) return null;
  if (T.aud && !lcAudienceOk(tp.who, user, "alert_" + type)) return null;
  if (user && typeof lcBlockedUser === "function" && lcBlockedUser(user)) return null;
  if (preview && typeof lcWordHit === "function" && lcWordHit(preview, "alerts")) return null;
  const list = lcAlerts(), now = Date.now();
  let a = null;
  if (P.group) {
    const g = list.find(function (x) { return x.type === type && x.unread && now - x.time < 30 * 60000; });
    if (g) { g.count = (g.count || 1) + 1; g.time = now; g.user = null; g.text = g.count + " " + T.many; g.preview = preview || g.preview; a = g; list.splice(list.indexOf(g), 1); list.unshift(g); }
  }
  if (!a) { a = { id: now + "-" + Math.random().toString(36).slice(2, 7), type: type, text: text, user: user ? { id: user.id, name: user.name, handle: user.handle, initials: user.initials, color: user.color } : null, preview: preview || "", time: now, unread: true, count: 1 }; list.unshift(a); }
  lcAlertsSave(list);
  if (tp.sound && !lcQuietNow()) Earcon.play(T.earcon);
  return a;
}
function lcAlertsMarkAll() { const l = lcAlerts().map(function (x) { return Object.assign({}, x, { unread: false }); }); lcAlertsSave(l); return l.length; }
function useAlerts() {
  const [l, setL] = useState(lcAlerts());
  useEffect(function () { const f = function () { setL(lcAlerts()); }; window.addEventListener("looscid:alerts", f); return function () { window.removeEventListener("looscid:alerts", f); }; }, []);
  return l;
}
// From Looscid: one alert when this device first runs a new version.
function lcVersionAlert() {
  try {
    const k = "dbm_seen_version", was = localStorage.getItem(k);
    if (was !== LOOSCID_VERSION) { localStorage.setItem(k, LOOSCID_VERSION); if (was) lcNotify("system", "Looscid updated to " + LOOSCID_VERSION + ". What's new is in About.", null); }
  } catch (e) {}
}
const ALERTS_TAB_KEY = "looscid_alerts_tab";
Looscid.ALERTS_TAB_KEY = ALERTS_TAB_KEY;
function lcSetAlertsTab(v, quiet) {
  v = v === "messages" ? "messages" : "notifications";
  try { localStorage.setItem(ALERTS_TAB_KEY, v); } catch (e) {}
  window.dispatchEvent(new CustomEvent("looscid:alertstab", { detail: v }));
  if (!quiet) announce("Alerts: " + (v === "messages" ? "Messages" : "Notifications") + ".");
}
const SHOW_FRIENDS_KEY = "looscid_show_friends";
Looscid.SHOW_FRIENDS_KEY = SHOW_FRIENDS_KEY;
function lcSetShowFriends(v, quiet) {
  try { localStorage.setItem(SHOW_FRIENDS_KEY, v ? "1" : "0"); } catch (e) {}
  window.dispatchEvent(new CustomEvent("looscid:showfriends", { detail: !!v }));
  const say = v ? "Showing friends only." : "Showing everyone you follow.";
  if (!quiet) announce(say); return say;
}
// "feed following", "next feed", "switch to following", "show friends on" ...
function lcFeedIntent(raw) {
  const n = lcNorm(raw); let m;
  if (/\bfeed (switching|switcher|switch mode|mode|control)\b/.test(n)) return null; // a setting: lcA11yIntent
  if (/\b(sound|sounds|earcon|reset|calm feed)\b/.test(n)) return null; // round-4 settings like "feed switch sound on", "reset feeds"

  if (/^(next feed|feed next|next tab)$/.test(n)) return { step: 1 };
  if (/^(previous feed|prev feed|feed previous|feed prev|last feed|previous tab)$/.test(n)) return { step: -1 };
  if ((m = /^show (friends|mutuals)( only)?( (on|off))?$/.exec(n))) return { friends: m[4] !== "off" };
  if (/^(show everyone|show all following|show everyone i follow)$/.test(n)) return { friends: false };
  if ((m = /^(?:feed (friends|mutuals?|friend)|(friends|mutuals?|friend) feed|(?:open|show|go to|switch to)( the| my)? (friends|mutuals?)( feed| tab)?)$/.exec(n))) return { friends: true };
  if ((m = /^feed (.+)$/.exec(n))) { const f = lcFeedFind(m[1]); return f ? { feed: f.id } : { miss: m[1] }; }
  if ((m = /^(switch|change)( over)?( to)?( the| my)? (.+?)( feed| tab)?$/.exec(n))) { const f = lcFeedFind(m[5]); if (f) return { feed: f.id }; }
  if ((m = /^(go|take me|jump)( over)?( to)?( the| my)? (.+?) (feed|tab)$/.exec(n))) { const f = lcFeedFind(m[5]); if (f) return { feed: f.id }; }
  if ((m = /^(show me|open|show)( the| my)? (.+?) (feed|tab)$/.exec(n))) { const f = lcFeedFind(m[3]); if (f) return { feed: f.id }; }
  return null;
}
function lcApplyFeedIntent(it) {
  if (it.step) { const f = lcStepFeed(it.step, true); return "Feed: " + f.label + "."; }
  if (it.feed) { lcSetFeed(it.feed, true); return "Feed: " + lcFeedLabel(it.feed) + "."; }
  if (it.friends !== undefined) { if (Looscid.LC_FEED !== "following") lcSetFeed("following", true); return lcSetShowFriends(it.friends, true); }
  return null;
}
/* --- The one command engine ---------------------------------------------- */
const LC_PLACES = {
  feed: { label: "Feed", root: "feed" },
  alerts: { label: "Alerts", root: "alerts" },
  notifications: { label: "Alerts, Notifications", root: "alerts", alertsTab: "notifications" },
  messages: { label: "Alerts, Messages", root: "alerts", alertsTab: "messages" },
  circles: { label: "Circles", root: "circles" },
  discover: { label: "Discover", root: "discover" },
  settings: { label: "Settings", page: "settings" },
  accessibility: { label: "Accessibility settings", page: "settings_accessibility" },
  screenreader: { label: "Screen reader and braille settings", page: "settings_a11y_sr" },
  braille: { label: "Screen reader and braille settings, Braille", page: "settings_a11y_sr", srTab: "braille" },
  vision: { label: "Vision settings", page: "settings_a11y_vision" },
  hearing: { label: "Hearing settings", page: "settings_a11y_hearing" },
  motion: { label: "Motion and seizure settings", page: "settings_a11y_motion" },
  motor: { label: "Motor and switch settings", page: "settings_a11y_motor" },
  terminalsettings: { label: "Commandbar settings", page: "settings_a11y_terminal" },
  nexosapps: { label: "Apps", page: "nexos_apps" },
  credits: { label: "Credits and open source", page: "credits" },
  appsettings: { label: "App settings", page: "settings_apps" },
  comingsoon: { label: "Looscid Labs, Coming soon", page: "settings_labs" },
  customizability: { label: "Customizability settings", page: "settings_customizability" },
  account: { label: "LooscidID", page: "settings_account" },
  privacy: { label: "Privacy settings", page: "settings_privacy" },
  profile: { label: "your profile", page: "profile" },
  terminal: { label: "Commandbar", page: "terminal" },
  about: { label: "About Looscid", page: "settings_about" },
  labs: { label: "Looscid Labs", page: "settings_labs" },
  music: { label: "Music", page: "music" },
  audio: { label: "Sounds settings", page: "settings_audio" },
  verbosity: { label: "Verbosity settings", page: "settings_a11y_sr", srTab: "verbosity" },
  keyboard: { label: "Keyboard shortcuts", page: "settings_keyboard" },
  backup: { label: "Settings backup", page: "settings_backup" },
  alertsettings: { label: "Alerts settings", page: "settings_notifications" },
  intelligence: { label: "Intelligence settings", page: "settings_intelligence" },
  cherrysettings: { label: "Intelligence, Cherry", page: "settings_ai_cherry" },
  keys: { label: "LooscidID, Keys and IDs", page: "settings_account", data: { tab: "keys" } },
};
Looscid.LC_PLACES = LC_PLACES;
// NexOS features: the same labels and descriptions on the More screen and in the main menu.
Looscid.LC_OPEN_CMD = null; // set by App: opens Commandbar
// Round 6: one "Apps" group (More screen and main menu): each app opens inside Looscid, plus Commandbar and Music.
function lcAppItems() {
  return LC_NEXOS_APPS.map(function (x) { return { id: x.id, l: x.name, sub: x.sub, go: function (nav) { Looscid.LC_NEXOS_OPEN = x; nav("nexos_app", x); } }; }).concat([
    { id: "commandbar", l: "Commandbar", sub: "Run commands and see their output. Ctrl+K or Cmd+K opens it anywhere", go: function (nav) { nav("terminal"); } },
    { id: "music", l: "Music", sub: "The Looscid beats", go: function (nav) { nav("music"); } },
    { id: "appsettings", l: "App settings", sub: "Settings, Apps", go: function (nav) { nav("settings_apps"); } },
  ]);
}
const LC_EXACT = { "open commandbar": "terminal", "commandbar": "terminal", "open command bar": "terminal", "open commandbar full screen": "terminal", "open apps": "nexosapps", "apps": "nexosapps", "open app settings": "appsettings", "app settings": "appsettings", "open apps settings": "appsettings", "open feed": "feed", "open alerts": "alerts", "open notifications": "notifications", "open messages": "messages", "open circles": "circles", "open settings": "settings", "open accessibility": "accessibility", "open customizability": "customizability", "open terminal": "terminal", "open music": "music", "open about": "about", "open account": "account", "open labs": "labs", "open looscid labs": "labs", "open looscidid": "account", "open looscid id": "account", "open audio": "audio", "open sounds": "audio", "open verbosity": "verbosity", "open pitch cues": "verbosity", "open keyboard shortcuts": "keyboard", "open shortcuts": "keyboard", "open settings backup": "backup", "open backup": "backup", "open privacy": "privacy", "open permissions": "privacy", "open quiet hours": "alertsettings", "open alerts settings": "alertsettings", "import settings": "backup",
  "open braille": "braille", "open braille settings": "braille", "open screen reader": "screenreader", "open screen reader settings": "screenreader", "open screen reader and braille": "screenreader",
  "open credits": "credits", "credits": "credits", "open source": "credits", "licenses": "credits",
  "open vision": "vision", "open hearing": "hearing", "open motion": "motion", "open motion and seizure": "motion", "open motor": "motor", "open motor and switch": "motor", "open terminal settings": "terminalsettings",
  "open nexos apps": "nexosapps", "nexos apps": "nexosapps", "apps": "nexosapps", "open apps": "nexosapps", "coming soon": "comingsoon", "open coming soon": "comingsoon",
  "open intelligence": "intelligence", "open cherry settings": "cherrysettings", "open keys": "keys", "open keys and ids": "keys" };
Looscid.LC_EXACT = LC_EXACT;
const LC_PLACE_WORDS = [
  ["braille", ["braille", "braille settings", "button style", "button labels", "button labeling", "braille labels", "custom label"]],
  ["verbosity", ["verbosity", "verbosity settings", "pitch cues", "pitch cue settings"]],
  ["screenreader", ["screen reader", "screen reader settings", "voiceover", "speech settings"]],
  ["vision", ["vision", "text size", "contrast", "high contrast", "bold text"]],
  ["hearing", ["hearing", "captions", "visual cue"]],
  ["motion", ["motion", "seizure", "calm mode", "reduce motion", "flash safety"]],
  ["motor", ["motor", "switch access", "larger buttons", "focus outline"]],
  ["terminalsettings", ["terminal settings", "terminal output"]],
  ["nexosapps", ["nexos apps", "nexos", "apps", "looscid app store", "app store", "nexos app store", "insomnia", "insomnia os", "meme projects", "easyconvert"]],
  ["comingsoon", ["coming soon", "planned", "roadmap"]],
  ["accessibility", ["accessibility", "a11y", "voiceover", "screen reader", "braille", "contrast", "captions", "text size", "calm mode", "reduce motion", "speech"]],
  ["audio", ["sounds", "audio", "earcons", "sound pack", "haptics", "keyboard clicks"]],
  ["keyboard", ["keyboard", "shortcuts", "keyboard shortcuts"]],
  ["backup", ["backup", "export settings", "import settings"]],
  ["privacy", ["privacy", "blocked", "permissions", "muted words", "content warnings"]],
  ["customizability", ["customizability", "customize", "customise", "theme", "themes"]],
  ["account", ["account", "looscidid", "looscid id", "login", "security"]],
  ["alerts", ["alerts", "alert"]],
  ["notifications", ["notifications", "notification"]],
  ["messages", ["messages", "message", "inbox", "dms"]],
  ["circles", ["circles", "circle", "groups", "group", "communities", "community"]],
  ["feed", ["feed", "home", "timeline"]],
  ["discover", ["discover", "explore", "trending"]],
  ["terminal", ["terminal", "command line", "shell", "console"]],
  ["music", ["music", "beats", "songs"]],
  ["labs", ["labs", "looscid labs", "early access"]],
  ["profile", ["profile", "my profile"]],
  ["settings", ["settings", "setting", "preferences", "options"]],
];
Looscid.LC_PLACE_WORDS = LC_PLACE_WORDS;
const LC_COMMANDS = [
  ["open feed", "your Home feed"], ["open alerts", "Alerts"], ["open notifications", "Alerts, Notifications"], ["open messages", "Alerts, Messages"], ["open circles", "your Circles"],
  ["open settings", "Settings"], ["open accessibility", "Settings, Accessibility"], ["open terminal", "Commandbar"], ["open music", "Music"],
  ["help", "this list"], ["status", "what is on, and what is saved on this device"],
  ["open braille", "Settings, Accessibility, Screen reader and braille, Braille"], ["find setting and a word", "jump to a setting, like find setting label or find setting braille"],
  ["braille style", "the button style on braille: braille style iphone, braille style android, braille style and a custom name; new braille style, rename braille style old to new, delete braille style, edit braille style, past names, use past name, remove past name, undo"],
  ["apps", "Looscid's apps, like open insomnia; boot shows the boot text"], ["coming soon", "what is planned, in Looscid Labs"],
  ["sound", "earcons: sound on, sound off, sound test, or sound and a volume from 0 to 100"],
  ["feed and a name", "switch feeds, like feed following; next feed and previous feed too"], ["feed switching", "how you change feeds: feed switching tabs, feed switching swipe or feed switching button"], ["show friends on", "in Following, only show mutuals; show friends off shows everyone"],
  ["history", "your last commands"], ["clear", "clear the output"],
  ["output collapse", "fold Commandbar output"], ["output expand", "unfold Commandbar output"],
  ["music", "the beat styles; music and a style plays one, like music hyperpop; music pause, music stop. beat works too"],
  ["set", "change an accessibility setting, like set calm on, set sounds off, set volume 50, braille output on, braille short labels off or pitch cues off"],
  ["about", "About Looscid: version, what's new and system info"], ["version", "the Looscid version"],
  ["settings", "read out every setting"], ["open sounds", "Settings, Sounds"], ["open insomnia", "an app, inside Looscid: insomnia, memes, easyconvert, desktop or kernel"], ["open verbosity", "Verbosity and pitch cues"], ["open keyboard shortcuts", "Settings, Keyboard shortcuts"], ["open privacy", "Settings, Privacy, with Permissions"],
  ["verbosity", "verbosity low, medium or high"], ["read order", "read order name first or text first"], ["announce new dreams", "off, count or read"],
  ["speak timestamps", "off, short or full"], ["speak emoji", "name, skip or word"], ["hashtags", "hashtags read or skip"], ["typing echo", "characters, words, both or off"], ["read aloud rate", "read aloud rate and a number from 50 to 200; read aloud pitch 50 to 150; voice and a name"],
  ["braille emoji", "braille emoji name or strip; braille timestamps on or off; braille prefix on or off"],
  ["sound pack", "sound pack looscid, nexos, insomnia or custom"], ["send sound", "send sound, like sound, new dream sound, error sound, alert sound or feed switch sound, on or off"], ["earcon on swipe", "earcon on swipe on or off"], ["ducking", "ducking on or off; haptics on or off"],
  ["quiet hours", "quiet hours on or off; quiet from 10 pm; quiet until 7 am"], ["calm feed", "calm feed on or off, hides like and Redream counts"],
  ["mute word", "mute word and a word; unmute word and a word"], ["add content warning", "add content warning and a topic; remove content warning and a topic"],
  ["auto play media", "always, wifi only or never"], ["alt text reminder", "on or off"], ["undo send", "off, 5 or 10 seconds"], ["draft autosave", "on or off"], ["reading mode", "reading mode on or off"],
  ["who can reply", "everyone, people I follow, friends or nobody; also who can mention me, who can message me, who can redream, who can quote, who can tag me, who can follow me, who can see my dreams"],
  ["reset", "reset and a section, like reset audio, reset speech or reset permissions"], ["export settings", "download all settings as one file"], ["import settings", "open Settings backup to import a file"],
  ["shortcuts", "your own keyboard shortcuts"], ["read this dream", "read the Dream you're on aloud"],
];
Looscid.LC_COMMANDS = LC_COMMANDS;
function lcNorm(s) { return String(s || "").toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim(); }
function lcClosestPlace(n) {
  const t = " " + n + " "; let best = null, score = 0;
  LC_PLACE_WORDS.forEach(function (pw) { let s = 0; pw[1].forEach(function (w) { if (t.indexOf(" " + w + " ") >= 0) s += w.length; }); if (s > score) { score = s; best = pw[0]; } });
  return best;
}
const LC_HISTORY_KEY = "looscid_cmd_history";
Looscid.LC_HISTORY_KEY = LC_HISTORY_KEY;
function lcHistory() { try { const h = JSON.parse(localStorage.getItem(LC_HISTORY_KEY) || "[]"); return Array.isArray(h) ? h : []; } catch (e) { return []; } }
function lcPushHistory(cmd) { try { const h = lcHistory().filter(function (x) { return x !== cmd; }); h.push(cmd); localStorage.setItem(LC_HISTORY_KEY, JSON.stringify(h.slice(-50))); } catch (e) {} }
const LC_BOOT = Date.now();
Looscid.LC_BOOT = LC_BOOT;
function lcSpoken(ms) { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return m ? m + (m === 1 ? " minute" : " minutes") : s + (s === 1 ? " second" : " seconds"); }
// lcRun(raw, api) -> { lines:[{text,kind}], say, earcon, go, cherry, clear, output }
// api: { cherryCtx, setA11y(patch), profile }
// Round-5 commands, shared by Commandbar and Cherry: braille styles,
// Find a setting, the NexOS boot text and NexOS apps.
function lcExtraIntent(raw) {
  const n = lcNorm(raw); let m;
  const br = lcBrIntent(raw); if (br) return br;
  if ((m = /^(?:find|search)(?: a| the)? settings? (?:for )?(.+)$|^(?:where is|where's) the (.+?) setting$/.exec(n))) {
    const q = m[1] || m[2], r = lcFindSettings(q);
    if (!r.length) return { err: "No settings match \u201c" + q + "\u201d." };
    return { say: r.length + (r.length === 1 ? " setting" : " settings") + " found. Opened " + r[0].l + ", in " + r[0].where + "." + (r.length > 1 ? " Also: " + r.slice(1, 5).map(function (x) { return x.l; }).join(", ") + "." : ""), fn: function () { if (Looscid.LC_NAV) lcGoSetting(r[0], Looscid.LC_NAV); } };
  }
  if (/^(boot|nexos boot|show boot text|boot text|reboot)$/.test(n)) return { say: "Showing the NexOS boot text.", fn: function () { if (Looscid.LC_BOOT_SET) Looscid.LC_BOOT_SET(true); } };
  if ((m = /^(?:open|launch|start|run|boot) (nexos web|nexos desktop|the nexos desktop|desktop|insomnia os|insomnia|meme projects|memes|memeprojects|easyconvert|easy convert|real kernel|the real kernel|nexos kernel|kernel|nexos)$/.exec(n))) {
    const id = /insomnia/.test(m[1]) ? "insomnia" : /meme/.test(m[1]) ? "memes" : /^easy/.test(m[1]) ? "easyconvert" : /kernel/.test(m[1]) || (m[0].indexOf("boot ") === 0 && m[1] === "nexos") ? "real" : "web", app = LC_NEXOS_APPS.find(function (x) { return x.id === id; });
    return { say: "Opened " + app.name + ".", fn: function () { Looscid.LC_NEXOS_OPEN = app; if (Looscid.LC_NAV) Looscid.LC_NAV("nexos_app", app); } };
  }
  return null;
}
Looscid.LC_NAV = null; // set by App: navigate
function lcRun(raw, api) {
  const text = String(raw || "").trim();
  const out = { lines: [], earcon: "run" };
  const L = function (t, kind) { out.lines.push({ text: t, kind: kind || "" }); };
  const err = function (t) { L(t, "err"); out.earcon = "error"; return out; };
  if (!text) return err("Type a command or a question. Type help for the list.");
  const n = text === "?" ? "help" : lcNorm(text);
  const w = n.split(" ")[0], arg = n.split(" ").slice(1).join(" ");
  const a = Looscid.A11Y_NOW;
  const goTo = function (id, prefix) { out.go = id; L((prefix || "") + "Opened " + LC_PLACES[id].label + ".", "ok"); out.earcon = null; return out; };

  if (LC_EXACT[n]) return goTo(LC_EXACT[n]);
  switch (n) {
    case "help": case "commands":
      L("Commands:", "hi"); LC_COMMANDS.forEach(function (c) { L(c[0] + ": " + c[1]); });
      L("Anything else goes to Cherry, the Looscid assistant. Ctrl+K or Cmd+K opens Commandbar anywhere.", "info");
      out.say = "Commands: " + LC_COMMANDS.map(function (c) { return c[0]; }).join(", ") + ". Anything else goes to Cherry.";
      out.earcon = "help"; return out;
    case "terminal": return goTo("terminal");
    case "status": case "health": {
      const p = api.profile || {};
      L((navigator.onLine === false ? "Offline" : "Online") + ". Looscid " + LOOSCID_VERSION + " is local-first, so your data stays on this device." + (Looscid.lcNostr && Looscid.lcNostr.state().canDream ? " Your Dreams with Audience Everyone also go to your Nostr relays." : ""), "ok");
      L("LooscidID: " + (p.displayName || "Dreamor") + (p.handle ? " (" + p.handle + ")" : "") + ", saved on this device.");
      L("Sounds: " + (a.visualCue ? "replaced by the visual cue" : a.earcons ? "on, volume " + a.earconVolume + " percent" : "off") + ". Captions: " + (a.captions ? "on" : "off") + ".");
      L("Calm mode: " + (a.calmMode ? "on" : "off") + ". Flash safety: " + (a.flashSafety ? "on" : "off") + ". Reduce Motion: " + (motionReduced() ? "on" + (systemReducedMotion() ? ", set by your device" : "") : "off") + ". Three-flash limit: always enforced.");
      if (Music.playing()) L("Music: " + Music.current().label + ", playing.");
      L("Screen reader and braille: Screen reader hints " + (a.screenReader ? "on" : "off") + ", Braille output " + (a.brailleOutput ? "on" : "off") + ", Enter = Send " + (a.enterSend ? "on" : "off") + ", Short labels on braille " + (a.closeLabels !== false ? "on" : "off") + ".");
      L("Feed switching: " + LC_FEED_MODES.find(function (x) { return x[0] === lcFeedMode(a.feedSwitch); })[1] + ", in Settings, Customizability.");
      return out;
    }
    case "about": case "sysinfo": case "open about":
      return goTo("about");
    case "version": case "ver":
      L(lcVersionLabel() + ". Released " + lcReleasedText(LOOSCID_RELEASED) + ".", "hi"); return out;
    case "history": {
      const h = lcHistory().slice(-10);
      if (!h.length) { L("No commands yet."); return out; }
      L("Last " + h.length + (h.length === 1 ? " command" : " commands") + ", oldest first: " + h.join(", ") + ".");
      return out;
    }
    case "clear": case "cls": out.clear = true; out.earcon = "clear"; out.say = "Output cleared."; return out;
    case "output collapse": case "collapse output": case "output fold": out.output = "collapse"; L("Commandbar output collapsed. Results are still read out.", "ok"); return out;
    case "output expand": case "expand output": case "output unfold": out.output = "expand"; L("Commandbar output expanded.", "ok"); return out;
    case "uptime": L("Looscid has been open for " + lcSpoken(Date.now() - LC_BOOT) + "."); return out;
    case "hi": case "hello": L("Hi" + (api.profile && api.profile.displayName ? ", " + api.profile.displayName : "") + "! Type help to see what I can do."); return out;
    case "exit": case "quit": case "q": out.close = true; L("Closing.", "dimt"); out.earcon = "close"; return out;
  }
  if (w === "echo") { L(text.replace(/^\s*echo\s*/i, "")); return out; }
  if (n === "export settings" || n === "export all settings" || n === "backup settings") { try { lcDownloadSettings(); L("Exported all your settings as looscid-settings.json.", "ok"); } catch (e) { return err("Couldn't export settings here."); } return out; }
  if (n === "shortcuts" || n === "my shortcuts" || n === "keyboard shortcuts" || n === "list shortcuts") {
    L("Built-in: " + LC_BUILTIN_KEYS.map(function (k) { return k[0] + ": " + k[1]; }).join(". ") + ".", "hi");
    const sc = a.shortcuts || []; L(sc.length ? "Yours: " + sc.map(function (s) { return s.keys + " runs " + s.cmd; }).join(". ") + "." : "You have no shortcuts of your own yet. Add them in Settings, Keyboard shortcuts.");
    return out;
  }
  if (n === "read this dream" || n === "read dream" || n === "read aloud" || n === "stop reading" || n === "stop reading aloud") {
    if (/^stop/.test(n)) { LcSpeech.stop(); L("Stopped reading aloud.", "ok"); return out; }
    const d = lcCurrentDream(); if (!d) return err("Move to a Dream in the feed first, then say read this dream.");
    LcSpeech.speak(lcDreamSpeechParts(d)); L("Reading " + ((d.user && d.user.name) || "this") + "'s Dream aloud.", "ok"); out.earcon = null; return out;
  }
  if ((w === "sound" || w === "mute" || w === "unmute" || w === "volume" || w === "beep") && !(w === "sound" && /^(pack|packs)\b/.test(arg)) && !(w === "mute" && /^words?\b/.test(arg)) && !(w === "unmute" && /^words?\b/.test(arg))) {
    const s = w === "mute" ? "off" : w === "unmute" ? "on" : w === "beep" ? "test" : w === "volume" ? arg : arg;
    if (s === "on") { api.setA11y({ earcons: true }); L("Sounds (earcons) are now on.", "ok"); out.earcon = "on"; return out; }
    if (s === "off") { api.setA11y({ earcons: false }); L("Sounds (earcons) are now off.", "ok"); out.earcon = "off"; out.earconForce = true; return out; }
    if (s === "test") { if (!a.earcons && !a.visualCue) return err("Sound is off. Type sound on first."); L("Test sound played at volume " + a.earconVolume + " percent.", "ok"); out.earcon = "run"; return out; }
    const v = parseInt(s, 10);
    if (!isNaN(v)) { const vol = Math.max(0, Math.min(100, Math.round(v / 10) * 10)); api.setA11y({ earconVolume: vol }); L("Earcon volume is now " + vol + " percent.", "ok"); return out; }
    L("Sound is " + (a.earcons ? "on" : "off") + ", volume " + a.earconVolume + " percent. Use sound on, sound off, sound test, or sound 0 to 100.");
    return out;
  }
  if (w === "music" || w === "beat" || w === "beats") {
    if (!arg || arg === "list" || arg === "styles" || arg === "genres") {
      L("Beat styles: " + MUSIC_GENRES.map(function (g) { return g.label; }).join(", ") + ".", "hi");
      L("Type music and a style to play it, like music hyperpop. music pause and music stop stop it." + (Music.playing() ? " Now playing: " + Music.current().label + "." : ""));
      return out;
    }
    if (arg === "stop" || arg === "off") { Music.stop(); L("Music stopped.", "ok"); out.earcon = null; return out; }
    if (arg === "pause") { Music.pause(); L("Music paused.", "ok"); out.earcon = null; return out; }
    if (arg === "play" || arg === "resume" || arg === "on" || arg === "start") { const g0 = Music.play(); L("Now playing: " + g0.label + ".", "ok"); out.earcon = null; return out; }
    const g = musicFind(arg);
    if (!g) return err("No beat style called \u201c" + arg + "\u201d. Type music to hear the list.");
    Music.play(g.id); L("Now playing: " + g.label + ".", "ok"); out.earcon = null; return out;
  }
  const xi = lcExtraIntent(text);
  if (xi) { if (xi.err) return err(xi.err); if (xi.fn) { setTimeout(xi.fn, 0); out.leave = true; } if (xi.go) { out.go = xi.go; out.keepLines = true; } L(xi.say, "ok"); out.earcon = null; return out; }
  const fi = lcFeedIntent(text);
  if (fi) {
    if (fi.miss) return err("No feed called \u201c" + fi.miss + "\u201d. Feeds: " + LC_FEEDS.map(function (f) { return f.label; }).join(", ") + ".");
    L(lcApplyFeedIntent(fi), "ok"); out.earcon = null; return out;
  }
  const it = lcA11yIntent(text);
  if (it) {
    if (it.report) { L("Your accessibility settings:", "hi"); it.report.forEach(function (t) { L(t); }); return out; }
    if (it.patch) { api.setA11y(it.patch); L(it.say, "ok"); return out; }
    L(it.say, "info"); return out;
  }
  // Not an exact command: Cherry answers, or opens the closest match.
  const verb = /^(open|go to|goto|go|show me|show|take me to|switch to|navigate to)\s+(.+)$/.exec(n);
  if (verb) { const p = lcClosestPlace(verb[2]); if (p) return goTo(p, "Closest match: " + LC_PLACES[p].label + ". "); }
  const r = api.cherryCtx && getAIPrefs().cmdAnswers !== false ? Looscid.cherryRespond(text, api.cherryCtx) : null;
  if (r && r.autoFn) { try { r.autoFn(); } catch (e) {} L("Cherry: " + r.result, "info"); return out; }
  if (r && !r.fallback) { L("Cherry: " + r.result, "info"); return out; }
  const p = lcClosestPlace(n);
  if (p) return goTo(p, "Closest match: " + LC_PLACES[p].label + ". ");
  return err("No command or Cherry answer for \u201c" + text + "\u201d. Type help to hear the commands.");
}
/* --- Small shared pieces ------------------------------------------------- */
function lcTrapTab(e, box) {
  if (e.key !== "Tab" || !box) return;
  const f = Array.from(box.querySelectorAll('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')).filter(function (x) { return x.offsetParent !== null || x === document.activeElement; });
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
// Up and Down arrows recall earlier commands (shared history).
function useCmdHistory(setVal) {
  const idx = useRef(-1);
  return function (e) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    const h = lcHistory(); if (!h.length) return;
    e.preventDefault();
    if (e.key === "ArrowUp") idx.current = idx.current < 0 ? h.length - 1 : Math.max(0, idx.current - 1);
    else idx.current = idx.current < 0 ? -1 : idx.current + 1;
    if (idx.current >= h.length || idx.current < 0) { idx.current = -1; setVal(""); return; }
    setVal(h[idx.current]);
  };
}
// Keeps a bottom sheet or full-height view above the on-screen keyboard.
function useKeyboardInset(ref, mode) {
  useEffect(function () {
    const vv = window.visualViewport, el = ref.current; if (!vv || !el) return;
    const fit = function () {
      if (mode === "height") { el.style.height = vv.height + "px"; el.style.top = vv.offsetTop + "px"; }
      else { const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); el.style.marginBottom = kb ? kb + "px" : ""; }
    };
    vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); fit();
    return function () { vv.removeEventListener("resize", fit); vv.removeEventListener("scroll", fit); };
  }, []);
}
/* --- Commandbar, the bar (Ctrl/Cmd+K) ------------------------------------ */
// Round 6: the bar shows the same output log as the full-screen Commandbar (newest last).
function LcCmdLog({ entries, headings, idp }) {
  return entries.map(function (en) {
    return lh('div', { key: en.id, className: "lc-entry" },
      headings
        ? lh('h3', { className: "lc-entry-h" }, lh('span', { className: "lc-prompt", "aria-hidden": "true" }, "looscid> "), en.cmd)
        : lh('p', { className: "lc-entry-h lc-entry-cmd" }, lh('span', { className: "lc-prompt", "aria-hidden": "true" }, "looscid> "), en.cmd),
      en.lines.map(function (l, i) { const p = lh('p', { key: i, className: "lc-l lc-l-" + l.kind }, l.text); const bw = lcWordHit(l.text); return bw && (" " + lcNorm(en.cmd) + " ").indexOf(" " + lcNorm(bw) + " ") < 0 ? lh(LcBlockedHidden, { key: i, what: "line" }, p) : p; }));
  });
}
function CommandBar({ onClose, exec, onFull }) {
  const [val, setVal] = useState("");
  const log = useCmdLog();
  const inRef = useRef(null), boxRef = useRef(null), outRef = useRef(null);
  const hist = useCmdHistory(setVal);
  const a = Looscid.A11Y_NOW, brl = !!a.brailleOutput;
  useKeyboardInset(boxRef, "sheet");
  useEffect(function () { if (inRef.current) inRef.current.focus(); Earcon.play("open"); }, []);
  useEffect(function () { const o = outRef.current; if (o) o.scrollTop = o.scrollHeight; }, [log]);
  const submit = function (e) {
    e.preventDefault();
    const r = exec(val, "bar"); if (!r || r.closed) return;
    setVal("");
  };
  const onKey = function (e) {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(true); return; }
    lcTrapTab(e, boxRef.current);
  };
  const recent = log.slice(-8);
  return lh('div', { className: "lc-cmd-ov", onMouseDown: function (e) { if (e.target === e.currentTarget) onClose(true); } },
    lh('div', { className: "lc-cmd", role: "dialog", "aria-modal": "true", "aria-labelledby": "lc-cmd-title", ref: boxRef, onKeyDown: onKey },
      lh('div', { className: "lc-cmd-top" },
        lh('h2', { id: "lc-cmd-title", className: "lc-cmd-title" }, "Commandbar"),
        lh('button', { type: "button", id: "lc-cmd-full", className: "btn bgb lc-btn", onClick: function () { if (onFull) onFull(); } }, "Full screen"),
        lh('button', Object.assign({ type: "button", className: "lc-icon-btn", onClick: function () { onClose(true); } }, lcCloseProps("Commandbar")), "Close")),
      lh('form', { className: "lc-cmd-form", onSubmit: submit, autoComplete: "off" },
        lh('label', { htmlFor: "lc-cmd-input", className: "lc-cmd-label" }, "Command or question"),
        lh('div', { className: "lc-cmd-row" },
          lh('input', { id: "lc-cmd-input", ref: inRef, type: "text", value: val, onChange: function (e) { setVal(e.target.value); }, onKeyDown: hist,
            autoComplete: "off", autoCapitalize: "none", spellCheck: false, enterKeyHint: "go",
            "aria-braillelabel": brl ? "cmd" : undefined }),
          lh('button', { type: "submit", className: "btn bp lc-run", "aria-braillelabel": brl ? "run" : undefined }, "Run")),
        lh('p', { id: "lc-cmd-hint", className: "lc-desc" }, lcHints()
          ? "Type a command like open alerts, or ask Cherry anything. Type help for the list. Enter runs, Up and Down arrows recall earlier commands, Escape closes."
          : "Try open alerts, or ask Cherry anything. Type help for the list.")),
      recent.length ? lh('div', { className: "lc-cmd-out", ref: outRef, tabIndex: 0, role: "region", "aria-labelledby": "lc-cmd-out-h" },
        lh('h3', { className: "lc-cmd-out-h", id: "lc-cmd-out-h" }, "Output" + (log.length > recent.length ? ", latest " + recent.length + " of " + log.length : "")),
        lh('div', { id: "lc-cmd-log", role: "log", "aria-live": "off", "aria-labelledby": "lc-cmd-out-h" }, lh(LcCmdLog, { entries: recent, headings: false }))) : null));
}
/* Round 6: Commandbar is ONE thing. The bar (Ctrl/Cmd+K) and the full-screen view share one output log
   (dbm_cmd_log, newest last, 60 entries, on this device) and one command history (Up and Down arrows).
   The log is never a live region; execCommand announces each result once through #looscid-live. */
const LC_CMD_LOG_KEY = "dbm_cmd_log";
Looscid.LC_CMD_LOG_KEY = LC_CMD_LOG_KEY;
Looscid.LC_TERM_LOG = (function () { try { const v = JSON.parse(localStorage.getItem(LC_CMD_LOG_KEY) || "[]"); return Array.isArray(v) ? v.filter(function (e) { return e && e.cmd && Array.isArray(e.lines); }).slice(-60) : []; } catch (e) { return []; } })();
function lcLogSave() { try { localStorage.setItem(LC_CMD_LOG_KEY, JSON.stringify(Looscid.LC_TERM_LOG)); } catch (e) {} window.dispatchEvent(new CustomEvent("looscid:cmdlog")); }
function lcLogAdd(cmd, lines) {
  const ls = (lines || []).map(function (l) { return { text: String(l.text), kind: l.kind || "out" }; });
  Looscid.LC_TERM_LOG = Looscid.LC_TERM_LOG.concat([{ id: Date.now() + Math.random(), cmd: String(cmd).trim() || "(empty)", lines: ls }]).slice(-60); lcLogSave();
}
function lcLogClear() { Looscid.LC_TERM_LOG = []; lcLogSave(); }
function useCmdLog() {
  const [log, setLog] = useState(Looscid.LC_TERM_LOG);
  useEffect(function () { const f = function () { setLog(Looscid.LC_TERM_LOG); }; window.addEventListener("looscid:cmdlog", f); return function () { window.removeEventListener("looscid:cmdlog", f); }; }, []);
  return log;
}
/* --- About Looscid (ported from NexOS Web's "About this NexOS") ---------------- */
function lcBrowserName() {
  const u = navigator.userAgent || "";
  const plat = /iPhone/.test(u) ? "iPhone" : /iPad/.test(u) ? "iPad" : /Android/.test(u) ? "Android" : /Mac OS X|Macintosh/.test(u) ? "Mac" : /Windows/.test(u) ? "Windows" : /CrOS/.test(u) ? "ChromeOS" : /Linux/.test(u) ? "Linux" : "an unknown system";
  const v = function (re) { const m = u.match(re); return m ? " " + m[1] : ""; };
  const b = /Edg\//.test(u) ? "Edge" + v(/Edg\/(\d+)/) : /OPR\//.test(u) ? "Opera" + v(/OPR\/(\d+)/) : /FxiOS/.test(u) ? "Firefox" + v(/FxiOS\/(\d+)/)
    : /Firefox\//.test(u) ? "Firefox" + v(/Firefox\/(\d+)/) : /CriOS/.test(u) ? "Chrome" + v(/CriOS\/(\d+)/) : /Chrome\//.test(u) ? "Chrome" + v(/Chrome\/(\d+)/)
    : /Safari\//.test(u) ? "Safari" + v(/Version\/(\d+(?:\.\d+)?)/) : "an unknown browser";
  return b + " on " + plat;
}
function lcStorageKB(prefix) { let n = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (prefix && k.indexOf(prefix) !== 0) continue; n += k.length + (localStorage.getItem(k) || "").length; } } catch (e) {} return Math.max(prefix ? 0 : 1, Math.round(n * 2 / 1024)); }
/* --- NexOS apps (round 5): the ported copies in nexos/ (same site, /Looscid/nexos/). ----
   Every app opens inside Looscid, in the same tab, with a Back button. The apps that only
   live inside the NexOS Web shell open the desktop here; then you type the app's name. */
const NEXOS_BASE = "nexos/"; // the ported copy, same site: /Looscid/nexos/
Looscid.NEXOS_BASE = NEXOS_BASE;
const LC_NEXOS_APPS = [
  // Round 6: Looscid's own apps (they came from NexOS; About credits it). Ids and files unchanged.
  { id: "insomnia", name: "Insomnia", sub: "Soundscape mixer, Sheep.exe, the 4am notepad and more", url: NEXOS_BASE + "apps/insomnia/", embed: true },
  { id: "memes", name: "Meme Projects", sub: "The Meme Projects chaos tool suite", url: NEXOS_BASE + "apps/memeprojects/", embed: true },
  { id: "easyconvert", name: "Easyconvert", sub: "Convert text files to TXT, DOCX, JSON and more. Nothing is uploaded", url: NEXOS_BASE + "apps/easyconvert/", embed: true },
  { id: "web", name: "Desktop", sub: "The full desktop: Looscid App Store, Files, Notes, Piano and more", url: NEXOS_BASE + "web/", embed: true },
  { id: "real", name: "Kernel", sub: "The real kernel in an emulated PC, right here. A big download, about 3.5 MB", url: NEXOS_BASE + "real/", embed: true },
];
Looscid.LC_NEXOS_APPS = LC_NEXOS_APPS;
const LC_NEXOS_SHELL = [["store", "Looscid App Store"], ["notes", "Notes"], ["calc", "Calculator"], ["clock", "Clock"], ["sysinfo", "System info"], ["piano", "Piano"], ["guess", "Guess the Number"], ["morse", "Morse Code"], ["hello", "Hello"]];
Looscid.LC_NEXOS_SHELL = LC_NEXOS_SHELL;
Looscid.LC_NEXOS_OPEN = null;
/* Deep integration (round 5): the NexOS pages load nexos/looscid-bridge.js. Looscid sends them its
   settings on load and on every change; they send back focus, typing and interface sounds, which
   Looscid plays with its own earcons, pitch cues and keyboard clicks. Same site only. */
const LC_NX_FRAMES = new Set();
Looscid.LC_NX_FRAMES = LC_NX_FRAMES;
function lcNexosSettings() {
  const a = Looscid.A11Y_NOW;
  return { sound: !!a.earcons && !a.visualCue && !lcQuietNow(), volume: +a.earconVolume || 0, calm: !!a.calmMode, reduceMotion: motionReduced(), flashSafety: a.flashSafety !== false,
    theme: getSavedTheme() || "dark", highContrast: !!a.highContrast, textSize: +a.textSize || 0, keyClicks: a.keyClicks !== false };
}
function lcNexosSend(w) {
  const win = w && w.contentWindow ? w.contentWindow : w; if (!win) return;
  LC_NX_FRAMES.add(win);
  try { win.postMessage({ looscid: "settings", settings: lcNexosSettings() }, location.origin); } catch (e) {}
}
function lcNexosBroadcast() { LC_NX_FRAMES.forEach(function (w) { if (!w || w.closed) { LC_NX_FRAMES.delete(w); return; } lcNexosSend(w); }); }
window.addEventListener("looscid:a11y", function () { setTimeout(lcNexosBroadcast, 0); });
window.addEventListener("looscid:theme", lcNexosBroadcast);
window.addEventListener("message", function (e) {
  if (e.origin !== location.origin || !e.data || typeof e.data.nexos !== "string" || e.source === window) return;
  const t = e.data.nexos;
  if (t === "hello") { lcNexosSend(e.source); return; }
  if (t === "earcon") { const n = String(e.data.name || ""); if (/^(focus|open|close|send|error|run|like|alerts|link)$/.test(n)) { window.__lcNxEarcons = (window.__lcNxEarcons || []).concat([n]).slice(-40); Earcon.play(n); } return; }
  if (t === "key") { Looscid.LC_PC_QUIET_UNTIL = Date.now() + 450; Earcon.key(); return; }
  if (t === "cue") { if (LC_PC[e.data.kind]) lcPitchCue(e.data.kind, e.data.detail, e.data.force ? { force: true } : null); return; }
});
Looscid.LC_BOOT_SET = null; // set by App: shows the NexOS boot text
const LC_APP_KEYS = ["insomnia-os:volume", "insomnia-os:muted", "insomnia-os:mix", "looscid:volume", "looscid:muted", "looscid:key_sounds", "looscid:beat_genre", "nexos-real-sound"];
Looscid.LC_APP_KEYS = LC_APP_KEYS;
// The NexOS boot text: the real kernel's "[ ok ]" boot lines (kernel/src/main.rs), told about
// this Looscid instead of a PC. Text only: no flashing; Reduce Motion or Calm mode shows it all at once.
function lcBootLines() {
  let mem = null; try { mem = navigator.deviceMemory ? navigator.deviceMemory + " GB" : null; } catch (e) {}
  return [
    ["cy", "NexOS boot, Looscid OS edition, Looscid " + LOOSCID_VERSION],
    ["ok", "boot loader: Looscid in " + lcBrowserName()],
    ["ok", "console: this screen, mirrored to your screen reader"],
    mem ? ["ok", "memory: about " + mem + " on this device"] : ["ok", "memory: managed by your browser"],
    ["ok", "storage: " + lcStorageKB() + " KB of Looscid data, on this device only"],
    ["ok", "input: keyboard, touch and braille display"],
    ["ok", "sound: NexOS classic earcons, boot chime ready"],
    ["ok", "Looscid App Store: " + (LC_NEXOS_APPS.length + LC_NEXOS_SHELL.length) + " apps built in"],
    ["cy", "Welcome to Looscid OS."],
  ];
}
function LcBoot({ onDone }) {
  const lines = useRef(lcBootLines()).current;
  const still = motionReduced() || !!Looscid.A11Y_NOW.calmMode;
  const [n, setN] = useState(still ? lines.length : 1);
  const skipRef = useRef(null), bootRef = useRef(null);
  useInertBehind(bootRef);
  useEffect(function () {
    Earcon.play("boot", { pack: "nexos" });
    announce("NexOS boot. " + lines.map(function (l) { return l[1]; }).join(". "));
    if (skipRef.current) skipRef.current.focus();
  }, []);
  useEffect(function () {
    if (n < lines.length) { const t = setTimeout(function () { setN(n + 1); }, 260); return function () { clearTimeout(t); }; }
    const t = setTimeout(onDone, 2600); return function () { clearTimeout(t); };
  }, [n]);
  return lh('div', { className: "lc-boot", ref: bootRef, role: "dialog", "aria-modal": "true", "aria-labelledby": "lc-boot-h",
      onKeyDown: function (e) { if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); onDone(); } } },
    lh('h1', { id: "lc-boot-h" }, "NexOS boot"),
    lh('ol', { "aria-hidden": "true" }, lines.slice(0, n).map(function (l, i) {
      return lh('li', { key: i, className: l[0] }, l[0] === "ok" ? lh(React.Fragment, null, lh('span', { className: "ok" }, "[ ok ] "), lh('span', { style: { color: "#dde" } }, l[1])) : l[1]);
    })),
    lh('button', { type: "button", ref: skipRef, className: "lc-boot-skip", onClick: onDone }, "Skip"));
}
// While a full-screen step is open, everything behind it is inert, so VoiceOver can't swipe out of it.
function useInertBehind(ref) {
  React.useLayoutEffect(function () {
    const me = ref.current; if (!me || !me.parentElement) return;
    const sibs = Array.prototype.filter.call(me.parentElement.children, function (el) { return el !== me && !el.inert; });
    sibs.forEach(function (el) { el.inert = true; el.setAttribute("data-lc-inert", "1"); });
    return function () { sibs.forEach(function (el) { el.inert = false; el.removeAttribute("data-lc-inert"); }); };
  }, []);
}
function DeviceQuestion({ onDone }) {
  const [sel, setSel] = useState({});
  const hRef = useRef(null), boxRef = useRef(null), ovRef = useRef(null);
  useInertBehind(ovRef);
  useEffect(function () { if (hRef.current) hRef.current.focus(); }, []);
  const apply = function () {
    const picked = DEVICE_PRESETS.filter(function (p) { return sel[p.id]; });
    const patch = {}; picked.forEach(function (p) { Object.assign(patch, p.set); });
    onDone(picked.length ? patch : null, picked.map(function (p) { return p.label.toLowerCase(); }));
  };
  const onKey = function (e) { if (e.key === "Escape") { e.preventDefault(); onDone(null, []); return; } lcTrapTab(e, boxRef.current); };
  return lh('div', { className: "lc-q-ov", ref: ovRef },
    // The intro is ordinary content, read once: focus lands on the heading, the intro follows it.
    // No aria-describedby here: VoiceOver read it as "description" and repeated it on every move.
    lh('div', { className: "lc-q", role: "dialog", "aria-modal": "true", "aria-labelledby": "lc-q-t", ref: boxRef, onKeyDown: onKey },
      lh('h2', { id: "lc-q-t", tabIndex: -1, ref: hRef, className: "lc-q-h lc-q-t" }, "Setting up Looscid"),
      lh('div', { id: "lc-q-intro", className: "lc-q-intro" }, LC_INTRO.map(function (t, i) { return lh('p', { key: i }, t); }), lh('p', null, "First, one quick question.")),
      lh('h3', { id: "lc-q-h", className: "lc-q-h" }, "How do you use your device?"),
      lh('p', { id: "lc-q-d", className: "lc-desc" }, "Pick any that fit and Looscid sets up your accessibility options to match. You can change each one later in Settings, Accessibility."),
      lh('fieldset', { className: "lc-q-set" },
        lh('legend', { className: "sr-pause" }, "I use my device"),
        DEVICE_PRESETS.map(function (p) {
          return lh('label', { key: p.id, className: "lc-q-opt" + (sel[p.id] ? " on" : "") },
            lh('input', { type: "checkbox", checked: !!sel[p.id], onChange: function (e) { const v = e.target.checked; setSel(function (s) { return Object.assign({}, s, { [p.id]: v }); }); } }),
            lh('span', { className: "lc-q-txt" }, lh('span', { className: "lc-q-l" }, p.label), lh('span', { className: "lc-q-s" }, p.sub)));
        })),
      lh('div', { className: "lc-q-btns" },
        lh('button', { type: "button", className: "btn bp lc-big", onClick: apply }, "Set up Looscid"),
        lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { onDone(null, []); } }, "Skip, I'm just browsing"))));
}
/* --- Settings > Accessibility ---------------------------------------------- */

/* --- Round 4 settings screens -------------------------------------------- */
// Re-render on any settings change made outside React state (lcSet from a deep component).
function useA11yNow() { const [, f] = useState(0); useEffect(function () { const h = function () { f(function (x) { return x + 1; }); }; window.addEventListener("looscid:a11y", h); return function () { window.removeEventListener("looscid:a11y", h); }; }, []); return Looscid.A11Y_NOW; }
function lcResetSection(sec) { lcSet(lcSectionDefaults(sec)); announce(lcSectionTitle(sec) + " is back to its defaults."); }
/* --- Button style on braille (round 5, queue 4 to 4g) -----------------------
   Buttons get aria-roledescription="button" (speech keeps the full role) plus
   aria-brailleroledescription with a short word: iPhone (btn), Android (edbt)
   or a custom word the person saves. Custom entries keep a history of past
   names. Stored in dbm_braille_styles (in the settings export). Untested on a
   real iPhone with a braille display: WebKit decides whether it uses the word. */
const LC_BR_KEY = "dbm_braille_styles";
Looscid.LC_BR_KEY = LC_BR_KEY;
const LC_BR_BUILTIN = [["iphone", "iPhone", "btn"], ["android", "Android", "edbt"]];
Looscid.LC_BR_BUILTIN = LC_BR_BUILTIN;
const LC_BR_MAX = 10, LC_BR_LEN = 8;
Looscid.LC_BR_MAX = LC_BR_MAX; Looscid.LC_BR_LEN = LC_BR_LEN;
function lcBrList() { try { const v = JSON.parse(localStorage.getItem(LC_BR_KEY) || "[]"); return Array.isArray(v) ? v.filter(function (x) { return x && x.id && x.name; }) : []; } catch (e) { return []; } }
function lcBrSave(list) { try { localStorage.setItem(LC_BR_KEY, JSON.stringify(list)); } catch (e) {} window.dispatchEvent(new CustomEvent("looscid:braillestyles")); lcBrStamp(); }
function lcBrWord(style) {
  const s = style || Looscid.A11Y_NOW.brailleStyle || "iphone";
  const b = LC_BR_BUILTIN.find(function (x) { return x[0] === s; }); if (b) return b[2];
  const c = lcBrList().find(function (x) { return "c:" + x.id === s; }); return c ? c.name : "btn";
}
function lcBrStyleLabel(s) {
  const b = LC_BR_BUILTIN.find(function (x) { return x[0] === s; }); if (b) return b[1] + " (" + b[2] + ")";
  const c = lcBrList().find(function (x) { return "c:" + x.id === s; }); return c ? "Custom (" + c.name + ")" : "iPhone (btn)";
}
function lcBrDate(t) { try { return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch (e) { return ""; } }
function lcBrFind(name) { const n = String(name || "").trim().toLowerCase(); return lcBrList().find(function (x) { return x.name.toLowerCase() === n; }) || null; }
// The checks every save goes through: trimmed, 1 to 8 characters, no duplicates, at most 10.
function lcBrCheck(name, exceptId) {
  const n = String(name || "").trim();
  if (!n) return "Type a label first.";
  if (n.length > LC_BR_LEN) return "Labels can be up to " + LC_BR_LEN + " characters. \u201c" + n + "\u201d has " + n.length + ".";
  if (/\s/.test(n)) return "Labels can't have spaces, so they fit on one braille cell group.";
  if (LC_BR_BUILTIN.some(function (b) { return b[2] === n.toLowerCase(); })) return "\u201c" + n + "\u201d is already a built-in style. Pick iPhone or Android instead.";
  const dup = lcBrList().find(function (x) { return x.name.toLowerCase() === n.toLowerCase() && x.id !== exceptId; });
  if (dup) return "You already have \u201c" + n + "\u201d.";
  return null;
}
Looscid.LC_BR_NOTICE = null; // { kind: "saved"|"deleted"|"restored"|"error", text, undo }
function lcBrNotice(n) { Looscid.LC_BR_NOTICE = n; window.dispatchEvent(new CustomEvent("looscid:brnotice")); }
function lcBrSelect(style, quiet) {
  lcSet({ brailleStyle: style });
  const say = "Button style on braille: " + lcBrStyleLabel(style) + ".";
  if (!quiet) announce(say);
  lcBrStamp();
  return say;
}
function lcBrCreate(name) {
  const err = lcBrCheck(name); if (err) return { err: err };
  const list = lcBrList(); if (list.length >= LC_BR_MAX) return { err: "You can save up to " + LC_BR_MAX + " custom styles. Delete one first." };
  const e = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: String(name).trim(), at: Date.now(), history: [] };
  list.push(e); lcBrSave(list); lcSet({ brailleStyle: "c:" + e.id }); lcBrStamp();
  lcBrNotice({ kind: "saved", text: "Saved " + e.name });
  return { ok: "Saved " + e.name, entry: e };
}
function lcBrRename(id, name) {
  const list = lcBrList(), e = list.find(function (x) { return x.id === id; }); if (!e) return { err: "That custom style is gone." };
  const n = String(name || "").trim();
  if (n === e.name) { lcBrNotice({ kind: "saved", text: "Saved " + e.name }); return { ok: "Saved " + e.name, entry: e }; }
  const err = lcBrCheck(n, id); if (err) return { err: err };
  e.history = (e.history || []).concat([{ name: e.name, at: e.at || Date.now() }]); e.name = n; e.at = Date.now();
  lcBrSave(list); lcSet({ brailleStyle: "c:" + id });
  lcBrNotice({ kind: "saved", text: "Saved " + n });
  return { ok: "Saved " + n, entry: e };
}
function lcBrDelete(id) {
  const list = lcBrList(), i = list.findIndex(function (x) { return x.id === id; }); if (i < 0) return { err: "That custom style is gone." };
  const e = list[i], wasSel = Looscid.A11Y_NOW.brailleStyle === "c:" + id;
  list.splice(i, 1); lcBrSave(list);
  if (wasSel) lcSet({ brailleStyle: "iphone" });
  lcBrStamp();
  lcBrNotice({ kind: "deleted", text: "Deleted " + e.name, undo: { entry: e, index: i, wasSel: wasSel } });
  return { ok: "Deleted " + e.name + ". Undo is available.", entry: e };
}
function lcBrUndo() {
  const n = Looscid.LC_BR_NOTICE; if (!n || !n.undo) return { err: "Nothing to undo." };
  const list = lcBrList(); const u = n.undo; list.splice(Math.min(u.index, list.length), 0, u.entry); lcBrSave(list);
  lcSet({ brailleStyle: "c:" + u.entry.id }); lcBrStamp();
  lcBrNotice({ kind: "restored", text: "Restored " + u.entry.name });
  return { ok: "Restored " + u.entry.name, entry: u.entry };
}
function lcBrUsePast(id, idx) {
  const list = lcBrList(), e = list.find(function (x) { return x.id === id; }); if (!e || !e.history || !e.history[idx]) return { err: "That past name is gone." };
  const past = e.history[idx];
  const dup = list.find(function (x) { return x.id !== id && x.name.toLowerCase() === past.name.toLowerCase(); });
  if (dup) return { err: "Another custom style is already called \u201c" + past.name + "\u201d." };
  e.history.splice(idx, 1); e.history.push({ name: e.name, at: e.at || Date.now() }); e.name = past.name; e.at = past.at;
  lcBrSave(list); lcSet({ brailleStyle: "c:" + id });
  lcBrNotice({ kind: "saved", text: "Now using " + e.name });
  return { ok: "Now using " + e.name, entry: e };
}
function lcBrForget(id, idx) {
  const list = lcBrList(), e = list.find(function (x) { return x.id === id; }); if (!e || !e.history || !e.history[idx]) return { err: "That past name is gone." };
  const past = e.history.splice(idx, 1)[0]; lcBrSave(list);
  return { ok: "Removed " + past.name + " from history." };
}
// Stamps every button with the two attributes (and takes them off when the switch is off).
Looscid.LC_BR_MO = null; Looscid.LC_BR_RAF = 0;
function lcBrStamp() {
  if (typeof document === "undefined") return;
  const on = Looscid.A11Y_NOW.brailleRoles !== false, w = on ? lcBrWord() : null;
  document.querySelectorAll('button, [role="button"]').forEach(function (b) {
    const r = b.getAttribute("role"); if (r && r !== "button") return;
    if (!w) { if (b.hasAttribute("data-lcbr")) { b.removeAttribute("aria-roledescription"); b.removeAttribute("aria-brailleroledescription"); b.removeAttribute("data-lcbr"); } return; }
    if (b.getAttribute("aria-brailleroledescription") !== w) { b.setAttribute("aria-roledescription", "button"); b.setAttribute("aria-brailleroledescription", w); b.setAttribute("data-lcbr", "1"); }
  });
}
function lcBrWatch() {
  if (Looscid.LC_BR_MO || typeof MutationObserver === "undefined") return;
  Looscid.LC_BR_MO = new MutationObserver(function () { if (Looscid.LC_BR_RAF) return; Looscid.LC_BR_RAF = requestAnimationFrame(function () { Looscid.LC_BR_RAF = 0; lcBrStamp(); }); });
  Looscid.LC_BR_MO.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("looscid:a11y", lcBrStamp);
  lcBrStamp();
}
// Commands and Cherry: every braille-style action (queue 4g).
function lcBrIntent(raw) {
  const n = lcNorm(raw); let m;
  const T = "(?:braille style|button style|button style on braille|braille button style|braille label|custom braille label|custom label)";
  const sel = function (style) { return { say: lcBrSelect(style, true), go: "braille" }; };
  const res = function (r, go) { return r.err ? { err: r.err } : { say: r.ok + ".", go: go || "braille" }; };
  if (n === "undo") { if (!Looscid.LC_BR_NOTICE || !Looscid.LC_BR_NOTICE.undo) return null; return res(lcBrUndo()); }
  if (new RegExp("^(?:list )?" + T + "s?$|^braille styles$|^button styles$").test(n)) {
    const list = lcBrList();
    return { say: "Button style on braille: " + lcBrStyleLabel(Looscid.A11Y_NOW.brailleStyle) + ". Styles: iPhone (btn), Android (edbt)" + list.map(function (x) { return ", Custom (" + x.name + ")"; }).join("") + ". Short roles on braille is " + (Looscid.A11Y_NOW.brailleRoles !== false ? "on" : "off") + "." };
  }
  if ((m = new RegExp("^(?:new|add|create|save) " + T + " (.+)$").exec(n))) return res(lcBrCreate(m[1]));
  if ((m = new RegExp("^rename " + T + " (.+?) to (.+)$").exec(n)) || (m = /^rename (\S+) to (\S+)$/.exec(n))) { const e = lcBrFind(m[1]); if (!e) return { err: "No custom style called \u201c" + m[1] + "\u201d." }; return res(lcBrRename(e.id, m[2])); }
  if ((m = new RegExp("^(?:delete|remove) " + T + " (.+)$").exec(n))) { const e = lcBrFind(m[1]); if (!e) return { err: "No custom style called \u201c" + m[1] + "\u201d." }; const r = lcBrDelete(e.id); return r.err ? { err: r.err } : { say: "Deleted " + e.name + ". Say undo to bring it back.", go: "braille" }; }
  if ((m = new RegExp("^edit " + T + "(?: (.+))?$").exec(n))) {
    const e = m[1] ? lcBrFind(m[1]) : lcBrList().find(function (x) { return "c:" + x.id === Looscid.A11Y_NOW.brailleStyle; });
    if (!e) return { err: m[1] ? "No custom style called \u201c" + m[1] + "\u201d." : "Pick a custom style first." };
    lcSet({ brailleStyle: "c:" + e.id }); try { sessionStorage.setItem("dbm_br_focus", "field"); } catch (x) {}
    return { say: "Editing " + e.name + ". Type the new name and press Enter to save, or clear it to delete.", go: "braille" };
  }
  if ((m = /^(?:view |show |list )?past names(?: (?:for|of))?(?: (.+))?$/.exec(n))) {
    const e = m[1] ? lcBrFind(m[1]) : lcBrList().find(function (x) { return "c:" + x.id === Looscid.A11Y_NOW.brailleStyle; });
    if (!e) return { err: m[1] ? "No custom style called \u201c" + m[1] + "\u201d." : "Pick a custom style first, or say past names and its name." };
    try { sessionStorage.setItem("dbm_br_past", e.id); } catch (x) {}
    const h = e.history || [];
    return { say: h.length ? "Past names for " + e.name + ": " + h.map(function (p) { return p.name + ", added on " + lcBrDate(p.at); }).join("; ") + "." : e.name + " has no past names yet.", go: "braille" };
  }
  if ((m = /^use past name (.+?) (?:for|on) (.+)$/.exec(n))) { const e = lcBrFind(m[2]); if (!e) return { err: "No custom style called \u201c" + m[2] + "\u201d." }; const i = (e.history || []).findIndex(function (p) { return p.name.toLowerCase() === m[1].trim(); }); if (i < 0) return { err: e.name + " has no past name \u201c" + m[1] + "\u201d." }; return res(lcBrUsePast(e.id, i)); }
  if ((m = /^(?:remove|forget|permanently remove) past name (.+?) (?:from|for) (.+?)(?: history)?$/.exec(n))) { const e = lcBrFind(m[2]); if (!e) return { err: "No custom style called \u201c" + m[2] + "\u201d." }; const i = (e.history || []).findIndex(function (p) { return p.name.toLowerCase() === m[1].trim(); }); if (i < 0) return { err: e.name + " has no past name \u201c" + m[1] + "\u201d." }; return res(lcBrForget(e.id, i)); }
  if ((m = new RegExp("^(?:set |use |select |choose |pick )?" + T + "(?: to)? (.+)$").exec(n))) {
    const v = m[1].trim();
    if (/^(iphone|ios|btn|apple)$/.test(v)) return sel("iphone");
    if (/^(android|edbt|talkback)$/.test(v)) return sel("android");
    const e = lcBrFind(v.replace(/^custom /, "")); if (e) return sel("c:" + e.id);
    return { err: "No style called \u201c" + v + "\u201d. Say new braille style " + v + " to save it." };
  }
  return null;
}
// Settings > Sounds (was Audio; storage keys and page ids unchanged). Pitch cues live in Verbosity.
const LC_AUDIO_CATS = [
  { id: "volume", page: "settings_audio_volume", l: "Volume, focus sounds and keyboard clicks", sub: "Earcons on or off, master volume, a sound on every swipe, a click per key", keys: ["earcons", "earconVolume", "earconFocus", "keyClicks"] },
  { id: "pack", page: "settings_audio_pack", l: "Sound pack", sub: "Looscid, NexOS classic, Insomnia, Hyper Synth or your own pack", keys: ["soundPack", "nexosBoot"] },
  { id: "events", page: "settings_audio_events", l: "Event sounds", sub: "Send, like, new Dream, error, alert, feed switch, with previews", keys: ["ev_send", "ev_like", "ev_newDream", "ev_error", "ev_alert", "ev_feed"] },
  { id: "haptics", page: "settings_audio_haptics", l: "Music and haptics", sub: "Ducking, haptics", keys: ["ducking", "haptics"] },
];
Looscid.LC_AUDIO_CATS = LC_AUDIO_CATS;
const LC_AUDIO_KEYPAGE = {};
Looscid.LC_AUDIO_KEYPAGE = LC_AUDIO_KEYPAGE;
 LC_AUDIO_CATS.forEach(function (c) { c.keys.forEach(function (k) { LC_AUDIO_KEYPAGE[k] = c.page; }); });
// Settings > Keyboard shortcuts: the built-in list, plus your own.
const LC_BUILTIN_KEYS = [
  ["Control+K or Command+K", "Open Commandbar, anywhere"], ["Escape", "Close Commandbar, a menu or a dialog"],
  ["Left and Right arrows, Home, End", "Move between tabs, like feeds, Alerts tabs and Screen reader sections"], ["Page Up and Page Down", "Previous and next feed"],
  ["Up and Down arrows in Commandbar", "Your earlier commands"], ["Enter", "Run a command, or send when Enter = Send is on"],
  ["Left and Right arrows in Reading mode", "Previous and next Dream"],
];
Looscid.LC_BUILTIN_KEYS = LC_BUILTIN_KEYS;
function lcKeyName(e) {
  const k = e.key; if (!k || /^(Control|Shift|Alt|Meta|Dead|Unidentified)$/.test(k)) return null;
  const parts = []; if (e.ctrlKey) parts.push("Control"); if (e.altKey) parts.push("Alt"); if (e.shiftKey) parts.push("Shift"); if (e.metaKey) parts.push("Command");
  const key = k.length === 1 ? k.toUpperCase() : k; parts.push(key === " " ? "Space" : key); return parts.join("+");
}
// Settings > Settings backup: export and import every setting as one JSON file; reset all.
const LC_EXPORT_KEYS = [A11Y_KEY, LC_SETTINGS_KEY, "dbm_braille_styles", "dbm_theme", "dbm_ai_prefs", "dbm_cherry_attrib", "looscid_music", "looscid_alerts_tab", "looscid_show_friends", "looscid_term_output_open", "looscid_topics"];
Looscid.LC_EXPORT_KEYS = LC_EXPORT_KEYS;
function lcExportSettings() {
  const o = { app: "Looscid", kind: "settings", version: LOOSCID_VERSION, exported: new Date().toISOString(), settings: {} };
  LC_EXPORT_KEYS.forEach(function (k) { try { const v = localStorage.getItem(k); if (v !== null) o.settings[k] = v; } catch (e) {} });
  return o;
}
function lcDownloadSettings() {
  const o = lcExportSettings(), blob = new Blob([JSON.stringify(o, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob), el = document.createElement("a"); el.href = url; el.download = "looscid-settings.json"; document.body.appendChild(el); el.click(); el.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  window.__lcLastExport = o; return o;
}
// LooscidID link flow + Privacy > Permissions share this switch ("Let people find me by this").
const LC_FIND_KEY = { nostr: "findNostr", activitypub: "findMastodon", atproto: "findBluesky", pubky: "findPubky" };
Looscid.LC_FIND_KEY = LC_FIND_KEY;
function LcFindMeSwitch({ provider }) {
  useA11yNow();
  const k = LC_FIND_KEY[provider]; if (!k) return null;
  const what = { nostr: "this npub", activitypub: "this fediverse username", atproto: "this Bluesky handle", pubky: "this Pubky key" }[provider];
  return lh('div', { className: "lc-findme" },
    lh(A11ySwitch, { id: "findme-" + provider, label: "Let people find me by this", on: !!Looscid.A11Y_NOW[k], onToggle: function () { const p = {}; p[k] = !Looscid.A11Y_NOW[k]; lcSet(p); announce("Find me by " + what + ": " + (p[k] ? "on" : "off") + "."); },
      desc: "People can find your Looscid profile by searching " + what + ". Off by default. You can change this anytime in Settings, Privacy, Permissions." }));
}
function LcUndoBar({ undo }) {
  const ref = useRef(null);
  useEffect(function () { if (ref.current) ref.current.focus(); }, [undo.id]);
  return lh('div', { className: "lc-undo", role: "region", "aria-label": "Undo send" },
    lh('p', { className: "lc-undo-t" }, undo.what + " sends in " + undo.secs + " seconds."),
    lh('button', { ref: ref, type: "button", className: "btn bp lc-btn", onClick: function () { undo.cancel(); } }, "Undo"));
}
function A11ySwitch({ id, label, desc, on, onToggle, soon, locked }) {
  const off = soon || locked;
  return lh('div', { className: "lc-row" + (soon ? " lc-soon" : "") },
    lh('button', { id: id, type: "button", role: "switch", className: "lc-sw", "aria-checked": !!on, "aria-disabled": off ? "true" : undefined,
      onClick: function () { if (!off && onToggle) onToggle(); } },
      lh('span', { className: "lc-sw-l" }, label),
      lh('span', { className: "lc-sw-v", "aria-hidden": "true" }, soon ? "Soon" : on ? "On" : "Off", lh('span', { className: "lc-knob" }))),
    // Round 6 (Alhasan): no line after each switch. Only a switch that can't be used says why, as plain text.
    desc && off ? lh('p', { id: id + "-d", className: "lc-desc" }, desc) : null);
}
// Which More-menu item each Settings screen belongs to (Back returns there, focus on that item).
const SETTINGS_MENU_ITEM = {
  settings_account: ["settings", "LooscidID"], settings_notifications: ["settings", "Alerts"], settings_privacy: ["settings", "Privacy"],
  settings_customizability: ["settings", "Customizability"], settings_accessibility: ["settings", "Accessibility"], settings_intelligence: ["settings", "Intelligence"], settings_labs: ["settings", "Looscid Labs"], settings_about: ["about", "About Looscid"],
  settings_audio: ["settings", "Sounds"], settings_keyboard: ["settings", "Keyboard shortcuts"], settings_apps: ["settings", "Apps"], settings_messages: ["settings", "Alerts"], settings_backup: ["settings", "Settings backup"],
  settings_a11y_sr: ["settings", "Accessibility"], settings_a11y_vision: ["settings", "Accessibility"], settings_a11y_hearing: ["settings", "Accessibility"],
  settings_a11y_motion: ["settings", "Accessibility"], settings_a11y_motor: ["settings", "Accessibility"], settings_a11y_terminal: ["settings", "Accessibility"],
  terms: ["about", "Terms"], privacy: ["about", "Privacy"], guidelines: ["about", "Community rules"], feedback: ["about", "Send Feedback"],
};
Looscid.SETTINGS_MENU_ITEM = SETTINGS_MENU_ITEM;
function App() {
  // Local profile — no login gate. The profile is stored on this device only.
  // Login methods attach to it later and are optional; see the LOCAL PROFILE block.
  const [authStage, setAuthStage] = useState("app");
  const [authUser, setAuthUser]   = useState(() => ensureLocalProfile());
  const [showAnalytics, setShowAnalytics] = useState(false);

  // App state
  const [page, setPage]   = useState("feed");
  const [pdata, setPdata] = useState(null);
  const [prefs, setPrefs] = useState({charLimitEnabled:false,charLimit:280,accessibility:loadA11y(),menu:{pos:"bottom",hideTopClose:false,hideBotClose:false}});
  const [showCreate, setShowCreate] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const showMenuRef = useRef(false); showMenuRef.current = showMenu;
  const [theme, setTheme] = useState(getSavedTheme() || "dark");
  const [activeAI, setActiveAI] = useState(getActiveAI());
  const [showSymPicker, setShowSymPicker] = useState(false);
  const [symTarget, setSymTarget] = useState(null); // callback fn to insert symbol
  const [showHabitCard, setShowHabitCard] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  // Commandbar (Ctrl/Cmd+K), Commandbar, first-visit question and earcons
  const [cmdOpen, setCmdOpen] = useState(false);
  const [menuInit, setMenuInit] = useState(null); // { open, focus, n } when Back reopens the More menu
  const pageRef = useRef("feed"); pageRef.current = page;
  const mainBack = useRef("feed");   // last page that is not a Settings screen
  const subFrom = useRef({});        // Settings screen -> the Settings screen it was opened from
  const cmdReturn = useRef(null);
  const openCmdRef = useRef(null);
  const termBack = useRef("feed");
  const [askDevice, setAskDevice] = useState(() => !a11yAsked());
  // NexOS boot text: with the NexOS classic pack, once per visit (Settings, Sounds, NexOS boot text).
  const [showBoot, setShowBoot] = useState(() => { try { return Looscid.A11Y_NOW.soundPack === "nexos" && Looscid.A11Y_NOW.nexosBoot !== false && !sessionStorage.getItem("dbm_booted") && a11yAsked(); } catch (e) { return false; } });
  Looscid.LC_BOOT_SET = setShowBoot;
  const [sysRM, setSysRM] = useState(systemReducedMotion());
  useEffect(() => {
    try { performance.mark("looscid-interactive"); } catch (e) {}
    if (!window.__lcLoadedSaid) { window.__lcLoadedSaid = true; announce("Looscid loaded"); }
    lcBrWatch();
  }, []);
  useEffect(() => {
    let mq; try { mq = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (e) { return; }
    const f = () => setSysRM(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", f); else if (mq.addListener) mq.addListener(f);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", f); else if (mq.removeListener) mq.removeListener(f); };
  }, []);
  useEffect(() => {
    const onKey = e => { if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === "k" || e.key === "K")) { e.preventDefault(); if (openCmdRef.current) openCmdRef.current(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    // No consent pop-up: Looscid collects nothing, so there is nothing to ask.
    // (It used to open on top of the setup question and swallowed its taps.)
  }, [authStage]);

  // Show habit insight card occasionally
  useEffect(() => {
    if (authStage === "app") {
      const cs = (prefs && prefs.cherry) || {};
      const preds = getPredictions();
      if (lcAiOn() && preds.length > 0 && cs.habitLearning !== false) {
        const t = setTimeout(() => setShowHabitCard(true), 8000);
        return () => clearTimeout(t);
      }
    }
  }, [authStage]);

useEffect(() => {
    window._openSymPicker = (cb) => { setSymTarget(()=>cb); setShowSymPicker(true); };
    return () => { window._openSymPicker = null; };
  }, []);

    // Apply theme on change
  useEffect(() => { applyTheme(theme); saveTheme(theme); window.dispatchEvent(new CustomEvent("looscid:theme")); }, [theme]);

  // Load drafts from localStorage
  useEffect(() => { setDrafts(getDrafts()); }, []);

  // Show welcome for first-time users; onboarding is now retired (welcome replaced it)
  useEffect(() => {
    if (authStage === "app") {
      const isGuest = !authUser || authUser.isGuest || authUser.uid==="guest";
      if (!isGuest && !getWelcomeSeen()) {
        const t = setTimeout(() => setShowWelcome(true), 400);
        return () => clearTimeout(t);
      }
    }
  }, [authStage]);

  // "Sign out" now resets the local profile on this device and starts fresh
  const handleSignOut = useCallback(() => {
    setAuthUser(resetLocalProfile()); setAuthStage("app"); setPage("feed"); setPdata(null);
  }, []);
  const handleRenameProfile = useCallback(name => {
    setAuthUser(cur => updateLocalProfile(cur, { displayName: (sanitizeInput(name) || "Dreamor").slice(0, 40) }));
  }, []);
  // Coming back from a Mastodon login started in Settings > Account: open Security.
  useEffect(() => { if (Looscid.oauthReturn) Looscid.oauthReturn.then(r => { if (r && r.from === "account") { setPage("settings_account"); setPdata({ tab: "security" }); } }); }, []);
  const handleUpdateProfile = useCallback(patch => {
    setAuthUser(cur => updateLocalProfile(cur, patch));
  }, []);


  // -- Global app state Cherry can read & mutate ------------------------------
  const [appDreams, setAppDreams] = useState(() => lcMergeDreams(lcLoadDreams(), DREAMS_INIT));
  useSavedDreams(appDreams);
  // Round 6.4: your Dreams read back from Nostr relays (js/nostr.js) join the app quietly: no announcement, no focus move.
  useEffect(() => {
    const f = function (e) {
      const ids = new Set(((e && e.detail && e.detail.ids) || []).map(String));
      const add = lcLoadDreams().filter(function (d) { return ids.has(String(d.id)); });
      if (!add.length) return;
      setAppDreams(function (ds) { const have = new Set(ds.map(function (d) { return String(d.id); })); const nids = new Set(ds.map(function (d) { return d.nid; }).filter(Boolean)); return add.filter(function (d) { return !have.has(String(d.id)) && !nids.has(d.nid); }).concat(ds); });
    };
    window.addEventListener("looscid-dreams-fetched", f);
    return function () { window.removeEventListener("looscid-dreams-fetched", f); };
  }, []);
  const [appFollowing, setAppFollowing] = useState(new Set(LC_FIX.following || [])); // IDs we follow
  const [appGroups, setAppGroups] = useState(GROUPS);                                     // joined state
  const [appNotifs, setAppNotifs] = useState(NOTIFS_INIT);
  const [cherryOpen, setCherryOpen] = useState(false);          // overlay chat from anywhere
  // Round 6.5: the composer in Reply or Quote mode, opened from anywhere with lcCompose().
  const [composeReq, setComposeReq] = useState(null);
  useEffect(function () { const f = function (e) { setComposeReq(Object.assign({ n: Date.now() }, (e && e.detail) || {})); }; window.addEventListener("looscid-compose", f); return function () { window.removeEventListener("looscid-compose", f); }; }, []);
  const [cherryInitMsg, setCherryInitMsg] = useState(null);     // pre-fill a message into Cherry

  // Cherry context object passed everywhere Cherry is accessible
  const [cherryLog, setCherryLog] = useState([]); // action log
  const [cherryOnboarded, setCherryOnboarded] = useState(false);

  const addLog = (ic, text, undoFn=null) => setCherryLog(l => [{id:Date.now(),ic,text,undoFn,...(undoFn?{undone:false}:{})}, ...l].slice(0,20));

  Looscid.LC_FOLLOWING_NOW = appFollowing; Looscid.LC_GROUPS_NOW = appGroups; // round 6: audiences read these
  useEffect(function () { lcVersionAlert(); }, []);
  const cherryCtx = {
    dreams: appDreams,
    following: appFollowing,
    groups: appGroups,
    notifs: lcAlerts(),
    cherryLog,
    cherryOnboarded,
    setCherryOnboarded,
    // Actions Cherry agent can perform - all log their actions
    likeDream:   id => { recordHabit("likeDream", (appDreams.find(x=>x.id===id)||{}).text?(appDreams.find(x=>x.id===id).text.split(" ").slice(0,3).join(" ")):null); setAppDreams(ds => ds.map(d => d.id===id ? {...d,liked:!d.liked,likes:d.liked?d.likes-1:d.likes+1} : d)); const d=appDreams.find(x=>x.id===id); if(d) addLog("❤️","Liked "+d.user.name+"'s Dream", ()=>setAppDreams(ds=>ds.map(x=>x.id===id?{...x,liked:!x.liked,likes:x.liked?x.likes-1:x.likes+1}:x))); },
    saveDream:   id => { setAppDreams(ds => ds.map(d => d.id===id ? {...d,bookmarked:!d.bookmarked} : d)); const d=appDreams.find(x=>x.id===id); if(d) addLog("Save","Saved "+d.user.name+"'s Dream"); },
    postDream:   (text, extra) => { const id=lcNewId(); setAppDreams(ds => [Object.assign({id,user:ME,time:"just now",text,likes:0,comments:0,redreams:0,quotes:0,liked:false,redreamed:false,quoted:false,bookmarked:false}, extra || {}),...ds]); addLog("✏️","Dreamed: "+text.slice(0,40)+"…", ()=>setAppDreams(ds=>ds.filter(d=>d.id!==id))); return id; },
    followUser:  id => { setAppFollowing(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; }); const u=USERS.find(x=>x.id===id); if(u) addLog("👥","Followed "+u.name, ()=>setAppFollowing(s=>{const n=new Set(s);n.delete(id);return n;})); },
    joinGroup:   id => { setAppGroups(gs => gs.map(g => g.id===id ? {...g,joined:!g.joined} : g)); const g=GROUPS.find(x=>x.id===id); if(g) addLog("🏘️","Joined "+g.name, ()=>setAppGroups(gs=>gs.map(x=>x.id===id?{...x,joined:false}:x))); },
    markNotifsRead: () => { lcAlertsMarkAll(); addLog("🔔","Marked all notifications read"); },
    fillCompose: null, // set by CreateMenu when compose is open
    openCherry:  msg => { if (!lcAiOn()) { navigate("cherry"); return; } setCherryInitMsg(msg||null); setCherryOpen(true); },
    setA11y:     patch => { Looscid.A11Y_NOW = Object.assign({}, Looscid.A11Y_NOW, patch); setPrefs(p => Object.assign({}, p, { accessibility: Object.assign({}, A11Y_DEFAULTS, p.accessibility || {}, patch) })); },
  };

  const navigate = useCallback((target, data=null) => {
    if (target === "about") target = "settings_about"; // the old separate About page is gone: one About Looscid
    if (target === "settings_a11y_verbosity") { try { sessionStorage.setItem("dbm_sr_tab", "verbosity"); } catch (e) {} target = "settings_a11y_sr"; } // round 6: Verbosity is a tab
    if (target === "settings_cherry") target = "settings_ai_cherry"; // round 5: Cherry lives in Settings, Intelligence
    if (target === "settings_cherry_algo") target = "settings_labs";
    if (target === "cherry" && !lcAiOn()) { target = "settings_ai_cherry"; setTimeout(function () { announce("Cherry is off. Turn it on here, in Intelligence."); }, 400); }
    const cur = pageRef.current;
    // "settings" means Back to the Settings menu: the screen it came from, or the More menu on that item.
    if (target === "settings") {
      const from = subFrom.current[cur];
      if (from) { delete subFrom.current[cur]; setPage(from); setPdata(null); setTimeout(() => { const h = document.querySelector("#main-content h1"); if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1"); h.focus(); } }, 60); return; }
      const m = SETTINGS_MENU_ITEM[cur] || ["settings", null];
      setPage(mainBack.current || "feed"); setPdata(null);
      setMenuInit({ open: m[0], focus: m[1], n: Date.now() }); setShowMenu(true); Earcon.play("settings");
      return;
    }
    if (showMenuRef.current) delete subFrom.current[target]; // opened from the Settings menu: Back returns to the menu
    else if (/^settings_/.test(target) && /^settings_/.test(cur) && target !== cur) {
      if (subFrom.current[cur] === target) delete subFrom.current[cur]; else subFrom.current[target] = cur;
    } else if (/^settings_/.test(target) && !/^settings_/.test(cur)) delete subFrom.current[target];
    // About Looscid's own buttons (Terms, Privacy, Community rules, Send Feedback): Back returns to About.
    if (!showMenuRef.current && cur === "settings_about" && /^(terms|privacy|guidelines|feedback|credits)$/.test(target)) subFrom.current[target] = cur;
    // No accounts: old login/signup links open the local profile settings
    if (target === "login" || target === "signup") { setPage("settings_account"); setPdata(null); return; }
    if (target === "cherry") { setCherryOpen(true); return; }
    if (target === "intro") { setShowWelcome(true); return; }
    setPage(target); setPdata(data);
  }, []);
  const goRoot = id => {
    if(id==="create"){setShowCreate(true);return;}
    if(id==="cherry"){setCherryOpen(true);return;}
    if(id==="circles"){setPage("groups");setPdata(null);return;}
    setPage(id); setPdata(null);
  };
  const focusMainHeading = () => setTimeout(() => { const h = document.querySelector("#main-content h1"); if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1"); h.focus(); } }, 60);
  const setA11yPatch = patch => { Looscid.A11Y_NOW = Object.assign({}, Looscid.A11Y_NOW, patch); setPrefs(p => Object.assign({}, p, { accessibility: Object.assign({}, A11Y_DEFAULTS, p.accessibility || {}, patch) })); };
  const openCmd = () => {
    if (showWelcome) return;
    const inp = document.getElementById("lc-cmd-input"); if (inp) { inp.focus(); return; }
    cmdReturn.current = document.activeElement; setCmdOpen(true);
  };
  openCmdRef.current = openCmd; Looscid.LC_OPEN_CMD = openCmd; Looscid.LC_SET_A11Y = setA11yPatch; Looscid.LC_NAV = navigate; Looscid.LC_SET_PREFS = setPrefs; Looscid.LC_SET_THEME = setTheme;
  // The one door for Dreams arriving from outside this device (the network layer, later); also used by tests.
  window.lcReceiveDreams = function (list) { const arr = (Array.isArray(list) ? list : [list]).map(function (d) { return Object.assign({ likes: 0, comments: 0, redreams: 0, quotes: 0, liked: false, redreamed: false, quoted: false, bookmarked: false, time: "now" }, d, { id: d.id || Date.now() + Math.random(), user: typeof d.user === "number" ? USERS[d.user] : (d.user || { name: "Someone", handle: "" }) }); }); setAppDreams(function (ds) { return arr.concat(ds); }); };
  // Undo send bar
  const [undo, setUndo] = useState(null); Looscid.LC_UNDO_SET = setUndo;
  const runRef = useRef(null);
  Looscid.LC_GO_FEED = () => { if (pageRef.current !== "feed") { setPage("feed"); setPdata(null); } };
  const closeCmd = restore => {
    setCmdOpen(false); const el = cmdReturn.current; cmdReturn.current = null;
    if (restore) setTimeout(() => { if (el && el !== document.body && document.contains(el)) el.focus(); else focusMainHeading(); }, 0);
  };
  const closeTerminal = () => { Earcon.play("close"); const back = termBack.current || "feed"; setPage(back === "terminal" ? "feed" : back); setPdata(null); focusMainHeading(); };
  // One command engine for Commandbar; results go to the one live region.
  // Round 6: every command, from the bar or full screen, lands in the one shared Commandbar log.
  const execCommand = (raw, where) => {
    const r = execCommandRun(raw, where), t = String(raw || "").trim();
    if (r && r.clear) lcLogClear();
    else if (r && t && !r.close) lcLogAdd(t, r.lines && r.lines.length ? r.lines : (r.say ? [{ text: r.say, kind: "ok" }] : []));
    return r;
  };
  const execCommandRun = (raw, where) => {
    const t = String(raw || "").trim();
    if (t) lcPushHistory(t);
    const r = lcRun(t, { cherryCtx: cherryCtx, setA11y: setA11yPatch, profile: authUser });
    const say0 = r.say || r.lines.map(l => l.text).join(" ");
    // Round 6: blocked words stay hidden in Commandbar too, unless you typed them yourself.
    const bwHit = lcWordHit(say0), say = bwHit && (" " + lcNorm(t) + " ").indexOf(" " + lcNorm(bwHit) + " ") < 0 ? "Hidden: contains a blocked word." : say0;
    if (r.go) {
      if (LC_PLACES[r.go].alertsTab) lcSetAlertsTab(LC_PLACES[r.go].alertsTab, true);
      if (LC_PLACES[r.go].srTab) { try { sessionStorage.setItem("dbm_sr_tab", LC_PLACES[r.go].srTab); } catch (e) {} }
      const pl = LC_PLACES[r.go], target = pl.root ? (pl.root === "circles" ? "groups" : pl.root) : pl.page;
      if (target !== page || pl.data) {
        const ta = areaOfPage(target);
        if (!ta || ta === areaOfPage(page)) Earcon.play("run");
        if (where === "bar") { setCmdOpen(false); cmdReturn.current = null; }
        if (target === "terminal") termBack.current = page;
        if (pl.root) goRoot(pl.root); else navigate(pl.page, pl.data || null);
        if (target !== "terminal" && target !== "settings") focusMainHeading();
        announce(say + (lcHints() && target !== "terminal" ? " Press Control K or Command K for commands." : ""));
        return Object.assign({}, r, { closed: true });
      }
      Earcon.play("run");
      if (r.keepLines) { announce(say); return r; }
      if (where === "bar") { closeCmd(true); announce("Already on " + pl.label + "."); return Object.assign({}, r, { closed: true }); }
      r.lines = [{ text: "Already on " + pl.label + ".", kind: "ok" }];
      announce(r.lines[0].text); return r;
    }
    if (r.close) {
      if (where === "terminal") closeTerminal(); else { Earcon.play("close"); closeCmd(true); }
      return Object.assign({}, r, { closed: true });
    }
    if (r.leave) {
      // The command opens another screen itself (Find a setting, a NexOS app, the boot text).
      if (where === "bar") { setCmdOpen(false); cmdReturn.current = null; }
      announce(say);
      return Object.assign({}, r, { closed: where === "bar" });
    }
    if (r.earcon) Earcon.play(r.earcon, r.earconForce ? { test: true } : undefined);
    announce(say);
    return r;
  };
  const onDeviceDone = (patch, picked) => {
    setA11yAsked(); setAskDevice(false);
    if (patch) { setA11yPatch(patch); announce("Set up for: " + picked.join(", ") + ". You can change each option in Settings, Accessibility."); }
    else announce("Skipped. Looscid keeps its defaults, with Calm mode on. You can set this up any time in Settings, Accessibility.");
    focusMainHeading();
  };

  runRef.current = execCommand;
  // Custom keyboard shortcuts (Settings > Keyboard shortcuts) and the focus-move earcon.
  useEffect(() => {
    const onKey = e => {
      const sc = Looscid.A11Y_NOW.shortcuts || []; if (!sc.length || e.defaultPrevented) return;
      const t = e.target; if (t && t.id === "kb-keys") return;
      const k = lcKeyName(e); if (!k) return;
      const hit = sc.find(s => s.keys === k); if (!hit) return;
      e.preventDefault(); if (runRef.current) runRef.current(hit.cmd, "shortcut");
    };
    let last = 0;
    const isLink = el => !!(el && el.closest && el.closest('a[href], [role="link"]'));
    let lastLink = null;
    const onOver = e => { if (!lcPcOn("link") || Date.now() < Looscid.LC_PC_QUIET_UNTIL) return; const l = e.target && e.target.closest && e.target.closest('a[href], [role="link"]'); if (!l || l === lastLink) return; lastLink = l; Earcon.play("link"); };
    const onOut = e => { if (lastLink && !(e.relatedTarget && lastLink.contains(e.relatedTarget))) lastLink = null; };
    document.addEventListener("mouseover", onOver); document.addEventListener("mouseout", onOut);
    const onFocus = e => {
      const a = Looscid.A11Y_NOW;
      // Pitch cues (Verbosity): links, buttons, headings, fields, switches, list position, each at its own pitch.
      // Never on feed switching (lcPcKindOf skips the feed controls; lcSetFeed quiets cues) and never while typing.
      const k = lcPcKindOf(e.target);
      if (k && Date.now() >= Looscid.LC_PC_QUIET_UNTIL) {
        if (k[0] === "link") { if (lcPcOn("link")) { const now = Date.now(); if (now - last < 90) return; last = now; window.__lcCues = (window.__lcCues || []).concat(["link:pack"]).slice(-80); Earcon.play("link"); return; } }
        else if (lcPitchCue(k[0], k[1])) { last = Date.now(); return; }
      }
      if (isLink(e.target) && lcPcOn("link")) return;
      if (!a.earconFocus || !a.earcons) return;
      const now = Date.now(); if (now - last < 90) return; last = now; // battery: at most about 11 ticks a second
      Earcon.play("focus");
    };
    // Keyboard clicks (Sounds) and no pitch cues while typing.
    const isEdit = el => !!(el && (el.tagName === "TEXTAREA" || el.isContentEditable || (el.tagName === "INPUT" && !/^(button|submit|reset|range|color|file|hidden|image|checkbox|radio)$/.test(el.type))));
    const onType = e => {
      if (!isEdit(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1 && !/^(Backspace|Delete|Enter)$/.test(e.key)) return;
      Looscid.LC_PC_QUIET_UNTIL = Date.now() + 450;
      Earcon.key();
    };
    // Open and close, switches: cues on the change itself (Back and Close fall, opening rises, on up, off down).
    const onTap = e => {
      const t = e.target && e.target.closest && e.target.closest('button, [role="button"], [role="switch"], [role="menuitem"], input[type="checkbox"], input[type="radio"]');
      if (!t || t.closest("#feed-tablist, #feed-menu, #feed-menu-btn")) return;
      const before = t.getAttribute("aria-expanded"), sw = t.getAttribute("role") === "switch" || t.type === "checkbox";
      const lab = (t.getAttribute("aria-label") || t.textContent || "").trim();
      if (t.classList.contains("bi") || /^(Back|Close)\b/.test(lab)) { Looscid.LC_PC_BACK_AT = Date.now(); Looscid.LC_CHIME_AT = 0; lcPackChime("close"); }
      setTimeout(() => {
        if (Date.now() < Looscid.LC_PC_QUIET_UNTIL) return;
        if (sw) { lcPitchCue("toggle", (t.getAttribute("aria-checked") === "true" || t.checked) ? "on" : "off", { force: true }); return; }
        const after = t.getAttribute("aria-expanded");
        if (before !== null && after !== null && before !== after) { lcPitchCue(after === "true" ? "open" : "close", null, { force: true }); return; }
        if (t.classList.contains("bi") || /^(Back|Close)\b/.test(lab)) lcPitchCue("close", null, { force: true });
      }, 30);
    };
    window.addEventListener("keydown", onKey); document.addEventListener("focusin", onFocus);
    document.addEventListener("keydown", onType, true); document.addEventListener("click", onTap);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("focusin", onFocus); document.removeEventListener("mouseover", onOver); document.removeEventListener("mouseout", onOut); document.removeEventListener("keydown", onType, true); document.removeEventListener("click", onTap); };
  }, []);
  useEffect(() => {
    const acc = Object.assign({}, A11Y_DEFAULTS, prefs.accessibility || {});
    Looscid.A11Y_NOW = acc; saveA11y(acc);
    window.dispatchEvent(new CustomEvent("looscid:a11y"));
    window.dispatchEvent(new CustomEvent("looscid:feedmode", { detail: lcFeedMode(acc.feedSwitch) }));
    const b = document.body.classList;
    b.toggle("acc-text-1", acc.textSize === 1);
    b.toggle("acc-text-2", acc.textSize === 2);
    b.toggle("acc-high-contrast", !!acc.highContrast);
    b.toggle("acc-bold-text", !!acc.boldText);
    b.toggle("acc-dyslexia", !!acc.dyslexiaFont);
    b.toggle("acc-calm", !!acc.calmMode);
    b.toggle("acc-flash-safe", !!acc.flashSafety);
    b.toggle("acc-reduced-motion", !!acc.reduceMotion || sysRM); // Reduce Motion always wins
    b.toggle("acc-large-btn", !!acc.largeBtns);
    b.toggle("acc-switch", !!acc.switchAccess);
    b.add("lc-has-cmd");
    if (acc.brailleOutput) document.documentElement.setAttribute("data-braille-output", "1"); else document.documentElement.removeAttribute("data-braille-output");
  }, [prefs.accessibility, sysRM]);
  // Earcon when the area changes (Feed, Alerts, Circles, Settings)
  const lastArea = useRef("feed");
  useEffect(() => { if (page !== "terminal" && page !== "music") termBack.current = page; if (!/^settings|^terms$|^privacy$|^guidelines$|^hour_story$|^feedback$/.test(page)) mainBack.current = page; const ar = areaOfPage(page); const prev = lastArea.current; lastArea.current = ar; if (ar && ar !== prev) Earcon.play(ar); }, [page]);

  const showFab = ["feed","discover","groups","alerts"].includes(page);

  // Session timeout — warn after 25 min idle, sign out at 30 min
  React.useEffect(() => {
    if (!authUser || authUser.isGuest || authUser.uid==="guest") return;
    var warned = false;
    var timer;
    var reset = function() {
      warned = false;
      clearTimeout(timer);
      timer = setTimeout(function() {
        if (!warned) {
          warned = true;
          // Show warning toast — implement later with toast system
        }
      }, 25*60*1000);
    };
    ["click","keydown","touchstart"].forEach(function(e) { document.addEventListener(e, reset); });
    reset();
    return function() {
      clearTimeout(timer);
      ["click","keydown","touchstart"].forEach(function(e) { document.removeEventListener(e, reset); });
    };
  }, [authUser]);

  // Dynamic page title
  React.useEffect(() => {
    var titles = {
      feed:     "Home",
      discover: "Discover",
      alerts:   "Alerts",
      profile:  (authUser && authUser.displayName) ? authUser.displayName : "Profile",
      dp:       pdata ? (pdata.name || "Profile") : "Profile",
      settings: "Settings",
      settings_account: "LooscidID",
      settings_labs: "Looscid Labs",
      settings_notifications: "Alerts Settings",
      settings_privacy: "Privacy",
      settings_customizability: "Customizability",
      settings_cz_theme: "Theme and colors", settings_cz_feeds: "Feeds and home", settings_cz_menu: "Menu", settings_cz_posting: "Dreaming", settings_cz_media: "Media and translation",
      settings_audio_volume: "Volume and focus sounds", settings_audio_pack: "Sound pack", settings_audio_events: "Event sounds", settings_audio_haptics: "Music and haptics",
      settings_intelligence: "Intelligence", settings_ai_model: "Cherry model", settings_ai_cmd: "Commandbar",
      settings_accessibility: "Accessibility",
      settings_a11y_sr: "Screen reader and braille",
      settings_a11y_vision: "Vision",
      settings_a11y_hearing: "Hearing",
      settings_a11y_motion: "Motion and seizure",
      settings_a11y_motor: "Motor and switch",
      settings_a11y_terminal: "Commandbar settings",
      nexos_app: "App",
      nexos_apps: "Apps",
      credits: "Credits and open source",
      settings_audio: "Sounds",
      settings_keyboard: "Keyboard shortcuts",
      settings_apps: "Apps",
      settings_messages: "Message settings",
      settings_backup: "Settings backup",
      settings_cherry: "Intelligence",
      settings_about: "About",
      settings_social: "Social",
      admin: "Admin Panel",
      feedback: "Send Feedback",
      drafts: "Drafts",
      more: "More",
      about: "About",
      terms: "Terms",
      privacy: "Privacy",
      guidelines: "Community rules",
      cherry: "Cherry",
      groups: "Circles",
      music: "Music",
      terminal: "Commandbar",
      hour_story: "Our Story",
    };
    // Home: "Looscid - <slogan>"; every other page: just its name (no suffix, no middle dot).
    document.title = page === "feed" ? "Looscid - " + LOOSCID_SLOGAN : (titles[page] || (function () { const h = document.querySelector("#main-content h1"); return h && h.textContent.trim() ? h.textContent.trim() : "Looscid"; })());
  }, [page, pdata, authUser]);
  // Page changes: the open cue rises (the close cue already fell on Back), and High verbosity says the page name.
  const pcPrev = useRef(null);
  React.useEffect(() => {
    const prev = pcPrev.current; pcPrev.current = page;
    if (prev === null || prev === page) return;
    if (Date.now() - Looscid.LC_PC_BACK_AT > 600) lcPitchCue("open", null, { force: true });
    if (lcVerb() === "high") setTimeout(() => { if (Date.now() - Looscid.LC_ANN_AT > 300) { const h = document.querySelector("#main-content h1"); announce((h && h.textContent.trim() ? h.textContent.trim() : document.title) + ", page", "nav"); } }, 350);
  }, [page]);

  const renderPage = () => {
    switch(page) {
      case "feed":          return React.createElement(Looscid.FeedPage, { navigate: navigate, prefs: prefs, cherryCtx: cherryCtx,});
      case "discover":      return React.createElement(Looscid.DiscoverPage, { navigate: navigate, cherryCtx: cherryCtx,});
      case "alerts":        return React.createElement(Looscid.AlertsPage, { cherryCtx: cherryCtx,});
      case "groups":        return React.createElement(Looscid.GroupsPage, { navigate: navigate, cherryCtx: cherryCtx,});
      case "profile":       return React.createElement(Looscid.ProfilePage, { key: "me-" + (authUser && authUser.displayName), navigate: navigate, cherryCtx: cherryCtx, authUser: authUser, onUpdateProfile: handleUpdateProfile,});
      case "dp":            return pdata ? React.createElement(Looscid.DreamerProfilePage, { user: pdata, navigate: navigate, cherryCtx: cherryCtx,}) : React.createElement(Looscid.FeedPage, { navigate: navigate, prefs: prefs, cherryCtx: cherryCtx,});
      case "settings_account":        return React.createElement(Looscid.AccountSettings, { key: "acct-" + ((pdata && pdata.tab) || "home"), navigate: navigate, authUser: authUser, onSignOut: handleSignOut, onRenameProfile: handleRenameProfile, onUpdateProfile: handleUpdateProfile, initialTab: pdata && pdata.tab,});
      case "settings_notifications":  return React.createElement(Looscid.NotificationsSettings, { navigate: navigate, prefs: prefs, setPrefs: setPrefs,});
      case "settings_privacy":        return React.createElement(Looscid.PrivacySettings, { navigate: navigate, authUser: authUser, onUpdateProfile: handleUpdateProfile,});
      case "settings_audio": case "settings_audio_volume": case "settings_audio_pack": case "settings_audio_events": case "settings_audio_haptics":
                                      return React.createElement(Looscid.AudioSettings, { key: page, page: page, navigate: navigate,});
      case "settings_keyboard":       return React.createElement(Looscid.KeyboardSettings, { navigate: navigate,});
      case "settings_apps":           return React.createElement(Looscid.AppsSettings, { navigate: navigate,});
      case "settings_messages":       return React.createElement(Looscid.MessageSettings, { navigate: navigate,});
      case "settings_backup":         return React.createElement(Looscid.BackupSettings, { navigate: navigate, onImported: function () { const acc = loadA11y(); Looscid.A11Y_NOW = acc; setPrefs(function (p) { return Object.assign({}, p, { accessibility: acc }); }); try { setTheme(getSavedTheme() || "dark"); } catch (e) {} },});
      case "settings_customizability": case "settings_cz_theme": case "settings_cz_feeds": case "settings_cz_menu": case "settings_cz_posting": case "settings_cz_media":
                                      return React.createElement(Looscid.CustomizabilitySettings, { key: page, page: page, navigate: navigate, prefs: prefs, setPrefs: setPrefs, theme: theme, setTheme: setTheme,});
      case "settings_accessibility":  return React.createElement(Looscid.AccessibilitySettings, { navigate: navigate, onAskDevice: ()=>setAskDevice(true),});
      case "settings_a11y_sr": case "settings_a11y_vision": case "settings_a11y_hearing": case "settings_a11y_motion": case "settings_a11y_motor": case "settings_a11y_terminal":
                                      return React.createElement(Looscid.A11yCategory, { key: page, page: page, navigate: navigate, prefs: prefs, setPrefs: setPrefs,});
      case "music":         return React.createElement(Looscid.MusicPage, { onBack: ()=>{ setPage(termBack.current && termBack.current !== "music" ? termBack.current : "feed"); setPdata(null); },});
      case "terminal":      return React.createElement(Looscid.TerminalPage, { exec: execCommand, onClose: closeTerminal, a11y: prefs.accessibility,});
      case "settings_about":          return React.createElement(Looscid.AboutSettings, { navigate: navigate,});
      case "settings_labs":           return React.createElement(Looscid.LabsSettings, { navigate: navigate,});
      case "nexos_apps":              return React.createElement(Looscid.NexosAppsPage, { navigate: navigate,});
      case "credits":                 return React.createElement(Looscid.CreditsPage, { navigate: navigate,});
      case "nexos_app":               return React.createElement(Looscid.NexosAppFrame, { key: (pdata && pdata.id) || "app", app: pdata, navigate: navigate,});
      case "settings_intelligence": case "settings_ai_cherry": case "settings_ai_model": case "settings_ai_cmd":
                                      return React.createElement(Looscid.IntelligenceSettings, { key: page, page: page, navigate: navigate, prefs: prefs, setPrefs: setPrefs,});
      case "admin":                   return React.createElement(Looscid.AdminPanel, { navigate: navigate,});
      case "feedback":                return React.createElement(Looscid.FeedbackPage, { navigate: navigate,});
      case "drafts":        return React.createElement(Looscid.DraftsPage, { navigate: navigate, onLoadDraft: d=>{ setShowCreate(true); },});
      case "more":          return React.createElement(Looscid.MorePage, { navigate: navigate, cherryCtx: cherryCtx, authUser: authUser,});
      case "hour_story":    return React.createElement(Looscid.HourStoryPage, { navigate: navigate, back: pdata||"more",});
      case "terms":         return React.createElement(Looscid.PolicyPage, { title: "Terms", content: TERMS_CONTENT, navigate: navigate, back: "settings",});
      case "privacy":       return React.createElement(Looscid.PolicyPage, { title: "Privacy", content: PRIVACY_CONTENT, navigate: navigate, back: "settings",});
      case "guidelines":    return React.createElement(Looscid.PolicyPage, { title: "Community rules", content: GUIDELINES_CONTENT, navigate: navigate, back: "settings",});
      default:              return React.createElement(Looscid.FeedPage, { navigate: navigate, prefs: prefs, cherryCtx: cherryCtx,});
    }
  };

  const activeId = ["feed","discover","alerts","more"].includes(page) ? page : null;
  const unreadNotifs = useAlerts().filter(n=>n.unread).length; // round 6: the real alerts
  const unreadMsgs = CONVOS.reduce((a,c)=>a+c.unread, 0);


  // Bottom tab bar: roving tabindex (one Tab stop), arrows/Home/End move, Enter/Space activate,
  // and switching tabs moves focus to the new screen's heading.
  const NAV_PAGES = ["feed","discover",null,"alerts",null];
  const selIdx = Math.max(0, NAV_PAGES.indexOf(page));
  const [navFocus, setNavFocus] = useState(selIdx);
  useEffect(() => { setNavFocus(selIdx); }, [selIdx]);
  const headingFocusNext = useRef(false);
  useEffect(() => {
    if (!headingFocusNext.current) return;
    headingFocusNext.current = false;
    setTimeout(() => { const h = document.querySelector("#main-content h1"); if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex","-1"); h.focus(); } }, 0);
  }, [page]);
  const onTabBarKey = e => {
    const tabs = Array.from(e.currentTarget.querySelectorAll('[role="tab"]'));
    const cur = tabs.indexOf(document.activeElement); if (cur < 0) return;
    let n = null;
    if (e.key === "ArrowRight") n = (cur + 1) % tabs.length; else if (e.key === "ArrowLeft") n = (cur - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0; else if (e.key === "End") n = tabs.length - 1;
    if (n === null) return;
    e.preventDefault(); setNavFocus(n); tabs[n].focus();
  };

  // First run: the onboarding is the whole screen, so nothing behind it is reachable.
  if (showWelcome) return React.createElement(LooscidOnboarding, { onDone: ()=>setShowWelcome(false),});

  return (
    React.createElement('div', { className: "app",}
      , lh(LcUpdateBanner, null)
      , lh('button', { type: "button", className: "lc-cmd-btn", onClick: () => openCmd(), "aria-label": "Commandbar", "aria-haspopup": "dialog", "aria-expanded": cmdOpen,
          "aria-keyshortcuts": "Control+K Meta+K", "aria-braillelabel": Looscid.A11Y_NOW.brailleOutput ? "cmd" : undefined }, lh('span', { "aria-hidden": "true" }, ">_"))
      , Looscid.A11Y_NOW.skipLinks !== false && lh('a', { href: "#main-content", className: "skip-link", onClick: e => { e.preventDefault(); const h = document.querySelector("#main-content h1"); if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1"); h.focus(); } } }, "Skip to content")
      , React.createElement('main', {id:"main-content", style:{display:"contents"}}, renderPage())
      , undo && lh(LcUndoBar, { undo: undo })
      , lh(LcResetHost, null)
      /* 5-tab nav: Home | Discover | Create | Alerts | More */
      , React.createElement('div', { role: Looscid.A11Y_NOW.skipLinks !== false ? "navigation" : undefined, 'aria-label': Looscid.A11Y_NOW.skipLinks !== false ? "Main" : undefined, className: "bnav-wrap",}, React.createElement('nav', {
          className: "bnav",
          role: "tablist",
          "aria-label": "Main navigation",
          onKeyDown: onTabBarKey,
        }
        , React.createElement('button', {
            className: "nb" + (page==="feed" ? " on" : ""),
            onClick: () => { headingFocusNext.current = page!=="feed"; goRoot("feed"); },
            role: "tab",
            "aria-selected": page==="feed",
            "aria-label": "Home",
            "aria-controls": "main-content",
            tabIndex: navFocus===0 ? 0 : -1,
          },
          React.createElement('div', {"aria-hidden":"true", className:"nb-check"}),
          React.createElement('span', {"aria-hidden":"true"}, "Home")
        )
        , React.createElement('button', {
            className: "nb" + (page==="discover" ? " on" : ""),
            onClick: () => { headingFocusNext.current = page!=="discover"; goRoot("discover"); },
            role: "tab",
            "aria-selected": page==="discover",
            "aria-label": "Discover",
            "aria-controls": "main-content",
            tabIndex: navFocus===1 ? 0 : -1,
          },
          React.createElement('div', {"aria-hidden":"true", className:"nb-check"}),
          React.createElement('span', {"aria-hidden":"true"}, "Discover")
        )
        , React.createElement('button', {
            className: "nb nb-create",
            onClick: () => setShowCreate(true),
            role: "tab",
            "aria-selected": false,
            "aria-label": "Create",
            "aria-haspopup": "dialog",
            tabIndex: navFocus===2 ? 0 : -1,
          },
          React.createElement(Ic.Pls, {"aria-hidden":"true", style:{width:22,height:22}}),
          React.createElement('span', {"aria-hidden":"true"}, "Create")
        )
        , React.createElement('button', {
            className: "nb" + (page==="alerts" ? " on" : ""),
            onClick: () => { headingFocusNext.current = page!=="alerts"; goRoot("alerts"); },
            role: "tab",
            "aria-selected": page==="alerts",
            "aria-label": "Alerts" + ((unreadNotifs+unreadMsgs)>0 ? ", " + (unreadNotifs+unreadMsgs) + " unread" : ""),
            "aria-controls": "main-content",
            tabIndex: navFocus===3 ? 0 : -1,
          },
          React.createElement('div', {style:{position:"relative"}},
            React.createElement(Ic.Bell, {"aria-hidden":"true", style:{width:22,height:22}}),
            (unreadNotifs+unreadMsgs) > 0 && React.createElement('span', {
              className: "nbdg",
              "aria-hidden": "true",
            }, unreadNotifs+unreadMsgs)
          ),
          React.createElement('span', {"aria-hidden":"true"}, "Alerts")
        )
        , React.createElement('button', {
            className: "nb-menu",
            onClick: () => setShowMenu(true),
            role: "tab",
            "aria-selected": false,
            "aria-label": "More",
            "aria-haspopup": "dialog",
            tabIndex: navFocus===4 ? 0 : -1,
          },
          React.createElement('div', {"aria-hidden":"true", className:"nb-menu-ic"},
            React.createElement(Ic.Dots, {style:{width:16,height:16}}),
            React.createElement('span', {style:{fontSize:8,opacity:.7,marginLeft:1}}, "▾")
          ),
          React.createElement('span', {"aria-hidden":"true"}, "More")
        )
      ))
      , composeReq && Looscid.LcComposer && React.createElement(Looscid.LcComposer, Object.assign({ key: "cmp-" + composeReq.n }, composeReq, { prefs: prefs, navigate: navigate, cherryCtx: cherryCtx, onClose: function () { setComposeReq(null); } }))
      , showCreate && React.createElement(Looscid.CreateMenu, { onClose: ()=>setShowCreate(false), prefs: prefs, navigate: navigate, cherryCtx: cherryCtx, drafts: drafts, onDraftSave: ()=>setDrafts(getDrafts()),})
      , showMenu && React.createElement(MainMenu, { key: menuInit ? "m-" + menuInit.n : "m", initOpen: menuInit && menuInit.open, initFocus: menuInit && menuInit.focus, onClose: ()=>{ setShowMenu(false); setMenuInit(null); }, navigate: navigate, goRoot: goRoot, prefs: prefs, unreadNotifs: unreadNotifs, unreadMsgs: unreadMsgs, appDreams: appDreams,})
      /* Cherry onboarding - shown on first open */
      , !cherryOnboarded && cherryOpen && (
        React.createElement('div', { className: "cherry-onboard", onClick: e=>{if(e.target===e.currentTarget)setCherryOnboarded(true);},}
          , React.createElement('div', { className: "cherry-onboard-card",}
            , React.createElement('div', { style: {textAlign:"center",marginBottom:20},}
              , React.createElement('div', { className: "aiorb", style: {width:60,height:60,fontSize:28,margin:"0 auto 12px"},}, "Cherry")
              , React.createElement('div', { style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:22,marginBottom:6},}, "Meet Cherry" )
              , React.createElement('div', { style: {fontSize:13,color:"var(--tx2)",lineHeight:1.6},}, "Your AI Agent for Looscid. Cherry isn't just a chatbot — it can take real actions across the entire app."                     )
            )
            , [
              {ic:"Write & share Dreams", title:"Write & share Dreams", desc:"Ask Cherry to draft a Dream and share it to your feed instantly"},
              {ic:"Follow & connect", title:"Follow & connect", desc:"Cherry can follow Dreamers that match your interests"},
              {ic:"Join Circles", title:"Join Circles", desc:"Cherry finds and joins communities you'll love"},
              {ic:"Manage notifications", title:"Manage notifications", desc:"Cherry summarises and clears your alerts"},
              {ic:"Analyse your feed", title:"Analyse your feed", desc:"Get real-time insights on trending content and your activity"},
            ].map(f=>(
              React.createElement('div', { key: f.title, style: {display:"flex",gap:12,marginBottom:13,alignItems:"flex-start"},}
                , React.createElement('div', { style: {width:34,height:34,borderRadius:10,background:"rgba(168,85,247,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0},}, f.ic)
                , React.createElement('div', null, React.createElement('div', { style: {fontWeight:700,fontSize:13,marginBottom:2},}, f.title), React.createElement('div', { style: {fontSize:12,color:"var(--tx3)",lineHeight:1.4},}, f.desc))
              )
            ))
            , React.createElement('button', { className: "btn bp" , style: {width:"100%",padding:13,marginTop:6,fontSize:15}, onClick: ()=>{setCherryOnboarded(true);}, 'aria-label': "Get started with Cherry"   ,}, "Let Cherry in"

            )
            , React.createElement('button', { style: {width:"100%",marginTop:8,background:"none",border:"none",cursor:"pointer",fontSize:12,color:"var(--tx3)",padding:6,fontFamily:"inherit"}, onClick: ()=>{setCherryOnboarded(true);setCherryOpen(false);},}, "Maybe later" )
          )
        )
      )
      /* Cherry overlay - slides up from anywhere in the app */
      , cherryOpen && cherryOnboarded && React.createElement(Looscid.CherryOverlay, { onClose: ()=>{setCherryOpen(false);setCherryInitMsg(null);}, cherryCtx: cherryCtx, initMsg: cherryInitMsg, navigate: navigate,})
      , showAnalytics && React.createElement(AnalyticsBanner, { onDone: () => setShowAnalytics(false),})
      , showHabitCard && React.createElement(HabitInsightCard, { onDismiss: ()=>setShowHabitCard(false),})
      , cmdOpen && lh(CommandBar, { onClose: closeCmd, exec: execCommand, onFull: function () { setCmdOpen(false); cmdReturn.current = null; if (page !== "terminal") termBack.current = page; navigate("terminal"); } })
      , askDevice && !showWelcome && getWelcomeSeen() && lh(DeviceQuestion, { onDone: onDeviceDone })
      , showBoot && !showWelcome && !askDevice && lh(LcBoot, { onDone: function () { try { sessionStorage.setItem("dbm_booted", "1"); } catch (e) {} setShowBoot(false); focusMainHeading(); } })
      , showSymPicker && React.createElement(Looscid.SymbolPicker, { onInsert: s=>{ if(symTarget)symTarget(s); setShowSymPicker(false); setSymTarget(null); }, onClose:()=>setShowSymPicker(false),})
    )
  );
}

/* --- Plain DOM helpers (no framework) ------------------------------------
   Tabs written in plain JavaScript build their screens with lcEl(tag, props, ...children),
   which returns real DOM nodes, and redraw with lcPatch(), which updates the screen in place:
   nodes that stay keep their focus, their caret and what a screen reader is on.
   Props follow the HTML/ARIA names (className, htmlFor and tabIndex are accepted, as in the
   React code these tabs came from), style takes an object, and onX names a listener. */
const LC_SVG_TAGS = new Set(["svg", "path", "line", "polyline", "polygon", "circle", "rect", "g", "ellipse", "defs", "use"]);
const LC_UNITLESS = new Set(["flex", "flexGrow", "flexShrink", "fontWeight", "lineHeight", "opacity", "order", "zIndex", "zoom", "gridRow", "gridColumn", "aspectRatio"]);
const LC_ATTR_NAMES = { className: "class", htmlFor: "for", tabIndex: "tabindex", strokeWidth: "stroke-width", strokeLinecap: "stroke-linecap", strokeLinejoin: "stroke-linejoin", viewBox: "viewBox", readOnly: "readonly", maxLength: "maxlength", autoComplete: "autocomplete", spellCheck: "spellcheck", autoFocus: "autofocus", colSpan: "colspan" };
const LC_BOOL_ATTRS = new Set(["disabled", "checked", "readonly", "required", "hidden", "multiple", "selected", "open", "autofocus"]);
function lcListen(e) { const f = this.__lcOn && this.__lcOn[e.type]; if (f) return f.call(this, e); }
function lcEventName(el, k) {
  const n = k.slice(2).toLowerCase();
  if (n === "change" && /^(INPUT|TEXTAREA)$/.test(el.tagName) && !/^(checkbox|radio|file)$/.test(el.type)) return "input"; // as React's onChange: every keystroke
  if (n === "focus") return "focusin"; if (n === "blur") return "focusout"; // as React: they bubble
  if (n === "doubleclick") return "dblclick";
  return n;
}
/* Styles are set one property at a time, in order, as React did (a CSS text would drop some var() longhands). */
function lcApplyStyle(el, st) {
  Object.keys(st).forEach(function (k) {
    const v = st[k]; if (v == null || typeof v === "boolean" || v === "") return;
    const val = typeof v === "number" && v !== 0 && !LC_UNITLESS.has(k) ? v + "px" : String(v).trim();
    if (k.indexOf("--") === 0) el.style.setProperty(k, val); else el.style[k] = val;
  });
}
function lcAppend(el, kids) {
  kids.forEach(function (c) {
    if (c == null || c === false || c === true || c === "") return;
    if (Array.isArray(c)) return lcAppend(el, c);
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  });
}
function lcEl(tag, props) {
  const kids = Array.prototype.slice.call(arguments, 2);
  const el = LC_SVG_TAGS.has(tag) ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag);
  const p = props || {};
  Object.keys(p).forEach(function (k) {
    const v = p[k];
    if (k === "key") { el.__lcKey = v; return; }
    if (k === "ref") { el.__lcRef = v; return; }
    if (k === "style") { if (v && typeof v === "object") { el.__lcStyle = v; lcApplyStyle(el, v); } else if (v) el.setAttribute("style", v); return; }
    if (/^on[A-Z]/.test(k)) { if (typeof v === "function") { el.__lcOn = el.__lcOn || {}; el.__lcOn[lcEventName(el, k)] = v; } return; }
    if (k === "value" && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) { el.__lcValue = v == null ? "" : String(v); return; }
    if (k === "checked" && el.tagName === "INPUT") { el.__lcChecked = !!v; if (v) el.setAttribute("checked", ""); return; }
    if (k === "defaultValue") { el.__lcValue0 = v == null ? "" : String(v); return; }
    const a = LC_ATTR_NAMES[k] || k;
    if (v == null || v === false && !/^aria-/.test(a)) return;
    if (LC_BOOL_ATTRS.has(a)) { if (v) el.setAttribute(a, ""); return; }
    el.setAttribute(a, v === true ? "true" : String(v));
  });
  el.__lcAttrs = Array.prototype.map.call(el.attributes, function (a) { return a.name; });
  lcAppend(el, kids);
  return el;
}
/* Finish a node that is new on screen: listeners, input values, refs. */
function lcWire(el) {
  if (el.nodeType !== 1) return;
  if (el.__lcOn) Object.keys(el.__lcOn).forEach(function (t) { if (!el.__lcBound) el.__lcBound = {}; if (!el.__lcBound[t]) { el.addEventListener(t, lcListen); el.__lcBound[t] = true; } });
  if (el.__lcValue != null) { if (el.value !== el.__lcValue) el.value = el.__lcValue; el.setAttribute("value", el.__lcValue); }
  else if (el.__lcValue0 != null && !el.__lcValueSet) { el.value = el.__lcValue0; el.__lcValueSet = true; }
  if (el.__lcChecked != null) el.checked = el.__lcChecked;
  if (el.__lcRef) { if (typeof el.__lcRef === "function") el.__lcRef(el); else el.__lcRef.current = el; }
  for (let c = el.firstChild; c; c = c.nextSibling) lcWire(c);
}
function lcSame(a, b) { return a.nodeType === b.nodeType && (a.nodeType !== 1 || (a.tagName === b.tagName && (a.id || "") === (b.id || "") && a.__lcKey === b.__lcKey && (a.tagName !== "INPUT" || a.type === b.type))); }
/* Make node a look like node b, keeping a (and its focus). */
function lcMorph(a, b) {
  if (a.nodeType === 3 || a.nodeType === 8) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
  // Only attributes this code set are removed; ones added by others (the braille labels) stay, as with React.
  (a.__lcAttrs || []).forEach(function (n) { if (!b.hasAttribute(n)) a.removeAttribute(n); });
  for (let i = 0; i < b.attributes.length; i++) { const at = b.attributes[i]; if (a.getAttribute(at.name) === at.value) continue;
    if (at.name === "style" && b.__lcStyle) { a.removeAttribute("style"); lcApplyStyle(a, b.__lcStyle); } else a.setAttribute(at.name, at.value); }
  a.__lcAttrs = b.__lcAttrs; a.__lcStyle = b.__lcStyle;
  a.__lcOn = b.__lcOn; a.__lcRef = b.__lcRef; a.__lcValue = b.__lcValue; a.__lcChecked = b.__lcChecked; if (a.__lcValue0 == null) a.__lcValue0 = b.__lcValue0;
  if (a.__lcOn) Object.keys(a.__lcOn).forEach(function (t) { if (!a.__lcBound) a.__lcBound = {}; if (!a.__lcBound[t]) { a.addEventListener(t, lcListen); a.__lcBound[t] = true; } });
  if (a.__lcValue != null) { if (a.value !== a.__lcValue) a.value = a.__lcValue; if (a.getAttribute("value") !== a.__lcValue) a.setAttribute("value", a.__lcValue); }
  if (a.__lcChecked != null && a.checked !== a.__lcChecked) a.checked = a.__lcChecked;
  if ("disabled" in a && a.disabled !== b.hasAttribute("disabled")) a.disabled = b.hasAttribute("disabled");
  if (a.__lcRef) { if (typeof a.__lcRef === "function") a.__lcRef(a); else a.__lcRef.current = a; }
  lcMorphKids(a, Array.prototype.slice.call(b.childNodes));
}
function lcMorphKids(a, want) {
  const old = Array.prototype.slice.call(a.childNodes), used = new Set(), keyed = new Map();
  old.forEach(function (o) { if (o.__lcKey != null) keyed.set(o.__lcKey, o); });
  let oi = 0;
  want.forEach(function (w, i) {
    let m = null;
    if (w.__lcKey != null) { m = keyed.get(w.__lcKey) || null; if (m && (used.has(m) || !lcSame(m, w))) m = null; }
    else { while (oi < old.length && (old[oi].__lcKey != null || used.has(old[oi]))) oi++; if (oi < old.length && lcSame(old[oi], w)) { m = old[oi]; oi++; } }
    const at = a.childNodes[i] || null;
    if (m) { used.add(m); lcMorph(m, w); if (m !== at) a.insertBefore(m, at); }
    else { a.insertBefore(w, at); used.add(w); lcWire(w); }
  });
  Array.prototype.slice.call(a.childNodes).forEach(function (c) { if (!used.has(c)) a.removeChild(c); });
}
/* Draw view() into host: the first time it builds, later it patches. view returns one element;
   its attributes go on host itself, so the screen has no extra wrapper element. */
function lcPatch(host, node) {
  if (!host.__lcDrawn) { for (let i = 0; i < node.attributes.length; i++) host.setAttribute(node.attributes[i].name, node.attributes[i].value); if (node.__lcStyle) { host.removeAttribute("style"); lcApplyStyle(host, node.__lcStyle); } host.__lcStyle = node.__lcStyle; host.__lcAttrs = node.__lcAttrs; host.__lcOn = node.__lcOn; lcMorphKids(host, Array.prototype.slice.call(node.childNodes)); lcWire(host); host.__lcDrawn = true; return; }
  lcMorph(host, node);
}
/* A screen written in plain JavaScript, shown inside the frame. start(host, props) draws it and
   returns { update(props), stop() }. The frame gives it one element and never touches it again. */
function lcPlainScreen(name, start) {
  const C = function (props) {
    const ref = useRef(null), it = useRef(null);
    React.useLayoutEffect(function () { it.current = start(ref.current, props); return function () { if (it.current && it.current.stop) it.current.stop(); it.current = null; }; }, []);
    React.useLayoutEffect(function () { if (it.current && it.current.update) it.current.update(props); });
    return lh('div', { ref: ref });
  };
  C.displayName = name;
  return C;
}
/* Plain versions of the shared pieces the plain tabs use (same markup as the React ones). */
function lcAvEl(user, size) {
  size = size || 40;
  return lcEl('div', { className: "av", role: "img", "aria-label": (user.name || user.initials) + "'s profile picture",
    style: { width: size, height: size, fontSize: size * 0.35, background: "linear-gradient(135deg," + (user.color || "#6d28d9") + ",#a855f7)" } },
    lcEl('span', { "aria-hidden": "true" }, user.initials));
}
const LC_ICON_PATHS = {
  Snd: [["line", { x1: "22", y1: "2", x2: "11", y2: "13" }], ["polygon", { points: "22 2 15 22 11 13 2 9 22 2" }]],
  Bck: [["polyline", { points: "15 18 9 12 15 6" }]],
  Chv: [["polyline", { points: "9 18 15 12 9 6" }]],
};
function lcIconEl(name, props) {
  const parts = LC_ICON_PATHS[name] || [];
  return lcEl.apply(null, ['svg', Object.assign({}, props || {}, { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.9" })].concat(parts.map(function (p) { return lcEl(p[0], p[1]); })));
}
function lcBackHeaderEl(title, onBack, right) {
  return lcEl('div', { className: "hdr" },
    lcEl('div', { className: "hdr-row" },
      lcEl('button', { className: "bi", onClick: onBack, "aria-label": "Back" }, lcIconEl("Bck", { style: { width: 21, height: 21 } })),
      lcEl('h1', { className: "hdr-title", tabIndex: -1 }, title),
      right));
}
function lcBlockedHiddenEl(what, shown, onShow, child) {
  if (shown) return child;
  return lcEl('div', { className: "lc-cw lc-bw", role: "group", "aria-label": "Hidden: contains a blocked word" },
    lcEl('p', { className: "lc-cw-t" }, "Hidden: contains a blocked word"),
    lcEl('button', { type: "button", className: "btn bgb lc-btn", onClick: onShow }, "Show " + (what || "it")));
}
Object.assign(Looscid, { lcEl, lcPatch, lcMorph, lcPlainScreen, lcAvEl, lcIconEl, lcBackHeaderEl, lcBlockedHiddenEl, LC_ICON_PATHS });

/* DreamText as plain DOM: paragraphs with <br>, hashtags in <span class="dc-tag">. */
function lcDreamTextEl(text, style) {
  const kids = [];
  (text || "").split("\n").forEach(function (para, pi) {
    if (pi > 0) kids.push(lcEl('br', { key: "b" + pi }));
    para.split(/(#\w+)/g).forEach(function (part, i) {
      if (!part) return;
      kids.push(part.startsWith('#') ? lcEl('span', { key: pi + "_" + i, className: "dc-tag" }, part) : part);
    });
  });
  return lcEl('span', { style: Object.assign({ whiteSpace: "pre-wrap" }, style || {}) }, kids);
}
Looscid.lcDreamTextEl = lcDreamTextEl;
})(window.Looscid = window.Looscid || {});
