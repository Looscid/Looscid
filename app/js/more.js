/* Looscid more.js: the More tab: Settings, LooscidID pages, About, Apps, Admin and the other pages it opens.
   Plain script (not a module). Everything it shares goes on window.Looscid; see docs/dev/FILES.md for the load order. */
(function (Looscid) {
const { A11Y_DEFAULTS, A11Y_KEY, A11ySwitch, AlertDialog, Av, BackHeader, Cbx, CommentView, DREAMS_INIT, DreamCard, Earcon, GROUPS, ID_PROVIDERS, Ic, LC_A11Y_CATS, LC_A11Y_PAGE, LC_ALERT_PREFS_KEY, LC_ALERT_TYPES, LC_AUDIO_CATS, LC_BOOT, LC_BR_BUILTIN, LC_BR_MAX, LC_BUILTIN_KEYS, LC_EXPORT_KEYS, LC_FEED_MODES, LC_FIND_KEY, LC_MSG_CATS, LC_NEXOS_APPS, LC_NEXOS_SHELL, LC_SECTIONS, LC_SET, LC_SETTINGS_KEY, LC_SET_BY, LC_SR_NAMES_DEF, LC_UPDATE_AUTO_KEY, LID_NOSTR_SK_KEY, LOOSCID_BUILD, LOOSCID_RELEASED, LOOSCID_SLOGAN, LOOSCID_VERSION, LcCmdLog, LcFindMeSwitch, LcMenu, LcSpeech, ME, MUSIC_GENRES, MenuPopupButton, Music, PROVIDER_NAMES, SecretField, TRENDING, USERS, announce, getAIPrefs, getActivity, getDrafts, getIdentity, getLocalProfile, getMethods, getTopics, hexToBytes, lcAiOn, lcAlertCats, lcAlertPrefs, lcAlerts, lcAlertsMarkAll, lcAppItems, lcAudCustom, lcBlocked, lcBlockedSet, lcBrCreate, lcBrDate, lcBrDelete, lcBrForget, lcBrList, lcBrNotice, lcBrRename, lcBrSelect, lcBrStamp, lcBrUndo, lcBrUsePast, lcBrowserName, lcCatState, lcCheckUpdate, lcCloseProps, lcDownloadSettings, lcFeedMode, lcHandle, lcHapticsSupported, lcHints, lcIdbDo, lcKeyName, lcLoadCustomPack, lcNexosSend, lcOpenReset, lcPitchCue, lcQuietNow, lcReleasedText, lcSectionTitle, lcSet, lcSpoken, lcSrName, lcStorageKB, lcTranslateOk, lcUpdateAuto, lcValueText, lcVerb, lcVersionLabel, lcWords, lh, logActivity, removeMethod, sanitizeInput, setAIPrefs, shortNpub, systemReducedMotion, updateLocalProfile, useA11yNow, useCats, useCmdHistory, useCmdLog, useDreams, useEffect, useEnterSubmit, useKeyboardInset, useOAuthReturn, useRef, useState } = Looscid;
Object.assign(Looscid, { ListsPage, ProfileLists, ProfileTabsSettings, CreditsPage, ProfileView, ProfilePage, DreamorProfilePage, AccountSettings, LcAudience, lcCatSave, LcCatCustomize, MessageSettings, NotificationsSettings, PrivacySettings, LcResetLast, LcTabs, LcBlockedPanel, LcPrivacyMedia, FeedSwitchSetting, LcCatMenu, LcCatPage, CustomizabilitySettings, lcSetAiPref, IntelligenceSettings, lcMenuList, lcSubLine, AccessibilitySettings, A11yCategory, AboutSettings, MorePage, MoreAppsGroup, FeedbackPage, AdminPanel, AdminUsers, AdminContent, AdminReports, AdminAnalytics, AdminPlatform, AdminAnnouncements, PolicyPage, HourStoryPage, normalizeUrl, fieldValueText, ProfileInfoList, ChangeInfoScreen, useProfileEditor, lcJoin, methodLabel, getStoredNostrSk, ComingSoonPanel, LoginMethods, lcGetIds, lcSaveIds, lcBech32Polymod, lcDecodeBech32Key, lcCheckId, lcVerifyId, LcKeysPanel, lcIdLabel, lidWhen, thisDeviceLabel, localDataSummary, exportLocalData, deleteLocalData, LooscidIDManager, lcUnzip, lcCheckPackFiles, lcAutoMap, lcUpdateAutoSet, lcPitchPreview, MusicPage, lcAudCustomSet, useBlocked, lcAlertPrefsSet, termOutputOpen, setTermOutputOpen, lcOsName, lcAboutInfo, AboutLooscidMore, TerminalPage, LabsSettings, lcAppGet, lcAppPut, LcAppRange, AppsSettings, NexosAppsPage, NexosAppFrame, lcLinkedProviders, LcSetRow, LcWordsRow, LcVoiceRow, LcResetBtn, LcSection, BrailleStyle, LcVerbosityPanel, SrTabs, LcSpeechTest, LcSrRename, AudioSettings, LcPackImport, lcShortcutOk, KeyboardSettings, TabBarSettings, lcImportSettings, BackupSettings });

/* --- PROFILE (OWN) ----------------------- */

/* --- Profile (one view for you and for other Dreamors) ----------------------
   Build 147 (2three1y, Oct 10 2026): the profile is recreated from Feditext's profile (Feditext by Metabolist,
   GPL-3.0; no Feditext code is used, only its layout, order and controls), written fresh for Looscid.
   Feditext's order: avatar, the relationship buttons (Direct message, Follow / Following), the name, @handle with
   "Follows you" / "Muted" / "Blocked", "N Dreams • Joined", a private note, fields, bio, the Following and
   Followers count buttons (each opens its own list page) and the tab row (Dreams, Replies, Redreams,
   Media). Its top menu (Share, Hide/Show Redreams, Add/Edit note, Mute, Block, Report) is a More button that
   expands inline. 2three1y's own asks sit where Feditext's closest part is: Edit profile (the same LooscidID editor
   as Settings), a private Liked tab on your own profile, an About tab, and Mutual likes on other people's. */
const LC_PROFILE_MORE_KEY = "looscid_profile_more_open", LC_PROFILE_RD_KEY = "looscid_profile_rd_show", LC_LIKED_PUBLIC_KEY = "looscid_liked_public";
// Build 150, part 16: Dreamor options is a real pop-up menu that never remembers being open. The old open state is cleared once.
try { localStorage.removeItem(LC_PROFILE_MORE_KEY); } catch (e) {}
function lcRdShow() { try { const v = localStorage.getItem(LC_PROFILE_RD_KEY); return v === "quotes" || v === "redreams" ? v : "both"; } catch (e) { return "both"; } }
// Settings > Privacy: which Liked tabs are public on your profile. All off (private) by default.
function lcLikedPublic() { try { const a = JSON.parse(localStorage.getItem(LC_LIKED_PUBLIC_KEY) || "[]"); return Array.isArray(a) ? a.filter(function (x) { return typeof x === "string"; }) : []; } catch (e) { return []; } }
function lcSetLikedPublic(list) { try { if (list.length) localStorage.setItem(LC_LIKED_PUBLIC_KEY, JSON.stringify(list)); else localStorage.removeItem(LC_LIKED_PUBLIC_KEY); } catch (e) {} }
const LC_LIKED_KIND_TAB = { dream: "dreams", circle: "circles", app: "apps", listing: "marketplace", chat: "chats", search: "searches" };
/* What a visitor sees on someone's Liked tab (2three1y, 9:46 and 9:48 PM): everything in the tabs made public, plus,
   even with every switch off, each liked Dream the visitor wrote or liked too. Anyone else sees none of those. */
function lcLikedVisibleTo(items, publicTabs, visitorHandle, visitorLikedIds) {
  const v = Looscid.lcHandle(visitorHandle || ""), pub = publicTabs || [], vl = new Set((visitorLikedIds || []).map(String));
  return (items || []).filter(function (x) {
    if (!x) return false;
    if (pub.indexOf(LC_LIKED_KIND_TAB[x.k] || "") >= 0) return true;
    if (x.k !== "dream") return false;
    // With the switches off: the visitor wrote it, or the visitor liked it too.
    return (!!v && !!x.user && Looscid.lcHandle(x.user.handle || "") === v) || vl.has(String(x.id));
  });
}
function lcFmtJoined(t) { try { return new Date(+t).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }); } catch (e) { return ""; } }
/* Build 149 (2three1y, Oct 11 3:21 AM): "Joined" shows the full date and the time the LooscidID was made, in the
   viewer's own time zone, e.g. "Thursday, October 2, 2024 at 5:01 PM (Eastern Time)". A date stored without a time
   is shown as a date only (no time is made up); any other stored text is shown as it was stored. */
function lcTzName(d) {
  const pick = function (style) { try { const p = new Intl.DateTimeFormat(undefined, { timeZoneName: style }).formatToParts(d || new Date()).find(function (x) { return x.type === "timeZoneName"; }); return p && p.value && !/^(GMT|UTC)[+-]?/.test(p.value) ? p.value : ""; } catch (e) { return ""; } };
  return pick("longGeneric") || pick("long") || "your time zone";
}
function lcOwnCreatedAt(lp) {
  if (!lp) return "";
  if (lp.createdAt) return lp.createdAt;
  try { const a = (Looscid.getActivity ? Looscid.getActivity() : JSON.parse(localStorage.getItem("looscid_security_activity") || "[]")).filter(function (x) { return /LooscidID created/i.test(x.what || ""); }).pop(); if (a && a.at) return a.at; } catch (e) {}
  const m = /^local-([0-9a-z]{8})/.exec(lp.uid || ""); if (m) { const t = parseInt(m[1], 36); if (t > 1.6e12 && t <= Date.now()) return t; }
  return lp.joined || "";
}
function lcJoinedText(v) {
  if (v == null || v === "") return "";
  let ts = null;
  if (typeof v === "number" || /^\d{9,}$/.test(String(v))) ts = +v;
  else if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) {
    const m = String(v).split("-"); const d = new Date(+m[0], +m[1] - 1, +m[2]);
    try { return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }); } catch (e) { return String(v); }
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(v))) ts = Date.parse(String(v));
  if (ts == null || !isFinite(ts)) return String(v);
  if (ts < 1e11) ts = ts * 1000; // seconds (Nostr created_at)
  const d = new Date(ts);
  try {
    const day = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return day + " at " + time + " (" + lcTzName(d) + ")";
  } catch (e) { return d.toString(); }
}
// Media tab "Show" radios (build 149): does a Dream carry images, videos, or both?
const LC_IMG_RE = /\.(jpe?g|png|gif|webp|avif|heic)(\?|#|\s|$)/i, LC_VID_RE = /\.(mp4|mov|webm|m4v)(\?|#|\s|$)/i;
function lcDreamMediaKinds(d) {
  const r = { img: false, vid: false, any: false };
  if (!d) return r;
  (Array.isArray(d.media) ? d.media : []).forEach(function (m) {
    const t = typeof m === "string" ? m : String((m && (m.type || m.mime || m.kind)) || "") + " " + String((m && (m.url || m.src)) || "");
    if (/video|^vid/i.test(t) || LC_VID_RE.test(t)) r.vid = true; else if (/image|^img|photo|gif/i.test(t) || LC_IMG_RE.test(t)) r.img = true;
    r.any = true;
  });
  if (Array.isArray(d.images) && d.images.length) r.img = r.any = true;
  if (Array.isArray(d.videos) && d.videos.length) r.vid = r.any = true;
  const tx = String(d.text || "");
  if (LC_IMG_RE.test(tx)) r.img = r.any = true;
  if (LC_VID_RE.test(tx)) r.vid = r.any = true;
  return r;
}
const LC_PROFILE_MEDIA_KEY = "looscid_profile_media_show";
function lcMediaShow() { try { const v = localStorage.getItem(LC_PROFILE_MEDIA_KEY); return v === "images" || v === "videos" ? v : "both"; } catch (e) { return "both"; } }
/* The bio, shown the way Feditext shows an account's bio (its "note"): rich text in paragraphs, line breaks kept,
   and links, mentions and hashtags as real links. A bio that arrives as HTML (Mastodon) keeps only its paragraphs,
   line breaks and links; a plain-text bio (Looscid, Nostr) is split into paragraphs on blank lines. A mention of a
   Dreamor Looscid knows opens their profile; @name@server opens it on that server; a hashtag opens Discover. */
function lcBioLinkify(text, key, navigate) {
  const out = [];
  const re = /(https?:\/\/[^\s<>"']+)|(^|[^\w@])(@[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*(?:@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})?)|(^|[^\w&#])(#[A-Za-z0-9_\u00C0-\uFFFF]+)/g;
  let last = 0, m, i = 0;
  const str = String(text || "");
  while ((m = re.exec(str))) {
    let start = m.index, lead = "";
    if (m[3]) { lead = m[2] || ""; } else if (m[5]) { lead = m[4] || ""; }
    start += lead.length;
    if (start > last) out.push(str.slice(last, start));
    const k = key + "-" + (i++);
    if (m[1]) {
      let url = m[1], trail = "";
      const t = url.match(/[.,!?;:)\]}'"]+$/); if (t) { trail = t[0]; url = url.slice(0, -trail.length); }
      out.push(lh('a', { key: k, href: url, target: "_blank", rel: "noopener noreferrer me" }, url.replace(/^https?:\/\//, "").replace(/\/$/, "")));
      if (trail) out.push(trail);
      last = m.index + m[0].length; continue;
    }
    if (m[3]) {
      const mention = m[3], parts = mention.slice(1).split("@");
      const known = parts.length === 1 ? (Looscid.lcHandle(ME.handle || "") === Looscid.lcHandle(mention) ? ME : (USERS || []).find(function (u) { return u && Looscid.lcHandle(u.handle || "") === Looscid.lcHandle(mention); })) : null;
      if (known) out.push(lh('a', { key: k, href: "#dreamor-" + parts[0], onClick: function (e) { e.preventDefault(); if (navigate) navigate(known === ME ? "profile" : "dp", known); } }, mention));
      else if (parts.length === 2) out.push(lh('a', { key: k, href: "https://" + parts[1] + "/@" + parts[0], target: "_blank", rel: "noopener noreferrer" }, mention));
      else out.push(mention);
      last = m.index + m[0].length; continue;
    }
    const tag = m[5];
    out.push(lh('a', { key: k, href: "#discover-" + encodeURIComponent(tag.slice(1)), onClick: function (e) { e.preventDefault(); Looscid.LC_DISCOVER_NEXT_Q = tag; if (navigate) navigate("discover"); } }, tag));
    last = m.index + m[0].length;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}
function lcBioLines(text, key, navigate) {
  const kids = [];
  String(text).split("\n").forEach(function (line, j) { if (j) kids.push(lh('br', { key: key + "-br" + j })); kids.push.apply(kids, lcBioLinkify(line, key + "-" + j, navigate)); });
  return kids;
}
// A field's value: HTML (Mastodon) is read as its text, then links, mentions and hashtags become real links.
function lcFieldValue(v, key, navigate) {
  let t = String(v == null ? "" : v);
  if (/<[a-z][^>]*>/i.test(t) && typeof DOMParser !== "undefined") { try { t = new DOMParser().parseFromString("<div>" + t + "</div>", "text/html").body.textContent || ""; } catch (e) {} }
  return lcBioLinkify(t.replace(/\s+/g, " ").trim(), key, navigate);
}
/* Part 35 (2three1y, Oct 12 4:43 PM): bios and Circle descriptions can hold Markdown and code, with no length limit.
   This turns Markdown into real elements, never HTML: headings, lists, quotes, links, bold, italic, inline code and
   fenced code blocks. Raw HTML is shown as text, scripts never run, and links only open http, https or mailto.
   A code block is a <pre> you can reach (Tab or VoiceOver) named "Code" plus its language, so a screen reader and a
   braille display read it line by line. Plain text keeps working as before: links, @mentions and #hashtags. */
function lcMdSafeHref(u) { u = String(u || "").trim(); return /^(https?:\/\/|mailto:)/i.test(u) ? u : null; }
function lcMdInline(text, key, navigate) {
  const out = []; let last = 0, n = 0, m;
  const re = /`([^`\n]+)`|\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|(^|[\s(])_([^_\n]+)_(?=$|[\s).,!?;:])/g;
  const plain = function (s, k) { return lcBioLinkify(s, k, navigate); };
  while ((m = re.exec(text))) {
    const k = key + "-m" + (n++);
    let start = m.index;
    if (m[8] !== undefined) start += m[7].length; // the space before _italic_ stays plain text
    if (start > last) out.push.apply(out, plain(text.slice(last, start), k + "t"));
    if (m[1] !== undefined) out.push(lh('code', { key: k, className: "lc-md-code" }, m[1]));
    else if (m[2] !== undefined) { const href = lcMdSafeHref(m[3]);
      out.push(href ? lh('a', { key: k, href: href, target: "_blank", rel: "noopener noreferrer" }, lcMdInline(m[2], k + "i", navigate)) : m[0]); }
    else if (m[4] !== undefined || m[5] !== undefined) out.push(lh('strong', { key: k }, lcMdInline(m[4] !== undefined ? m[4] : m[5], k + "i", navigate)));
    else if (m[6] !== undefined || m[8] !== undefined) out.push(lh('em', { key: k }, lcMdInline(m[6] !== undefined ? m[6] : m[8], k + "i", navigate)));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push.apply(out, plain(text.slice(last), key + "-end"));
  return out;
}
function lcMarkdown(src, navigate, key, opts) {
  const hBase = (opts && opts.hBase) || 3; key = key || "md";
  const lines = String(src || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = []; let para = [], list = null, quote = [];
  const inl = function (t, k) { return lcMdInline(t, k, navigate); };
  const flushPara = function () { if (!para.length) return; const k = key + "-p" + blocks.length; const kids = [];
    para.forEach(function (l, j) { if (j) kids.push(lh('br', { key: k + "br" + j })); kids.push.apply(kids, inl(l, k + "l" + j)); });
    blocks.push(lh('p', { key: k }, kids)); para = []; };
  const flushList = function () { if (!list) return; const k = key + "-list" + blocks.length;
    blocks.push(lh(list.type, { key: k, className: "lc-md-list" }, list.items.map(function (t, j) { return lh('li', { key: k + "i" + j }, inl(t, k + "i" + j)); }))); list = null; };
  const flushQuote = function () { if (!quote.length) return; const k = key + "-q" + blocks.length;
    blocks.push(lh('blockquote', { key: k, className: "lc-md-quote" }, lcMarkdown(quote.join("\n"), navigate, k, opts))); quote = []; };
  const flush = function () { flushPara(); flushList(); flushQuote(); };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]; let mm;
    if ((mm = /^\s*(```|~~~)\s*([\w+#.\-]*)\s*$/.exec(line))) {
      flush(); const fence = mm[1], lang = mm[2], code = [];
      for (i++; i < lines.length && !new RegExp("^\\s*" + fence.replace(/(.)/g, "\\$1") + "\\s*$").test(lines[i]); i++) code.push(lines[i]);
      const k = key + "-code" + blocks.length;
      blocks.push(lh('pre', { key: k, className: "lc-md-pre", tabIndex: 0, role: "region", "aria-label": lang ? "Code, " + lang : "Code" }, lh('code', null, code.join("\n"))));
      continue;
    }
    if ((mm = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line))) { flush(); const lvl = Math.min(6, hBase + mm[1].length - 1);
      blocks.push(lh('h' + lvl, { key: key + "-h" + blocks.length, className: "lc-md-h" }, inl(mm[2], key + "-h" + blocks.length))); continue; }
    if ((mm = /^\s*>\s?(.*)$/.exec(line))) { flushPara(); flushList(); quote.push(mm[1]); continue; } else flushQuote();
    if ((mm = /^\s*[-*+]\s+(.*)$/.exec(line)) || (mm = /^\s*\d{1,9}[.)]\s+(.*)$/.exec(line))) {
      const type = /^\s*\d/.test(line) ? "ol" : "ul"; flushPara();
      if (list && list.type !== type) flushList(); if (!list) list = { type: type, items: [] }; list.items.push(mm[1]); continue; }
    if (!line.trim()) { flush(); continue; }
    flushList(); para.push(line.trim());
  }
  flush();
  return blocks;
}
Object.assign(Looscid, { lcMarkdown, lcMdInline, lcMdSafeHref });
function lcBioParas(bio, navigate) {
  const raw = String(bio || "").trim();
  if (!raw) return [];
  if (!/```|~~~/.test(raw) && /<(p|br|a|span)\b[^>]*>/i.test(raw) && typeof DOMParser !== "undefined") {
    // HTML bio: read it as text with paragraph and line-break structure; links come back through the linkifier,
    // and an <a> keeps its own address when its text isn't one.
    let doc; try { doc = new DOMParser().parseFromString("<div>" + raw + "</div>", "text/html"); } catch (e) { doc = null; }
    if (doc) {
      const paras = [];
      const root = doc.body.firstChild;
      const blocks = root.querySelectorAll("p").length ? Array.from(root.querySelectorAll("p")) : [root];
      blocks.forEach(function (b, bi) {
        const kids = [];
        const walk = function (n, pre) {
          n.childNodes.forEach(function (c, ci) {
            const k = pre + "-" + ci;
            if (c.nodeType === 3) kids.push.apply(kids, lcBioLinkify(c.nodeValue, k, navigate));
            else if (c.nodeName === "BR") kids.push(lh('br', { key: k }));
            else if (c.nodeName === "A") {
              const href = c.getAttribute("href") || "", txt = (c.textContent || "").replace(/\s+/g, " ").trim();
              if (/^https?:\/\//i.test(href)) {
                const cls = c.getAttribute("class") || "";
                if (/hashtag/.test(cls) || /^#/.test(txt)) kids.push.apply(kids, lcBioLinkify(txt, k, navigate));
                else kids.push(lh('a', { key: k, href: href, target: "_blank", rel: "noopener noreferrer me" }, txt || href.replace(/^https?:\/\//, "")));
              } else kids.push(txt);
            } else if (c.nodeName !== "SCRIPT" && c.nodeName !== "STYLE") walk(c, k);
          });
        };
        walk(b, "h" + bi);
        if (kids.some(function (x) { return typeof x !== "string" || x.trim(); })) paras.push(lh('p', { key: "p" + bi }, kids));
      });
      return paras;
    }
  }
  // Part 35: a plain or Markdown bio becomes real paragraphs, headings, lists and code blocks (lcMarkdown).
  return lcMarkdown(raw, navigate, "b", { hBase: 3 });
}
function lcCopy(text, what) {
  const done = function () { announce(what + " copied."); };
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () { announce("Couldn't copy. " + what + ": " + text); }); return; } } catch (e) {}
  announce("Couldn't copy. " + what + ": " + text);
}
function lcDreamHasMedia(d) { return !!(d && ((Array.isArray(d.media) && d.media.length) || (Array.isArray(d.images) && d.images.length) || /\.(jpe?g|png|gif|webp|avif|mp4|mov)(\?|#|\s|$)/i.test(String(d.text || "")))); }
// The Following / Followers page Feditext opens from its count buttons.
function ProfilePeoplePage({ kind, user, isMe, people, onBack, navigate, followingSet }) {
  const head = useRef(null);
  useEffect(function () { if (head.current) head.current.focus(); }, []);
  const title = kind === "following" ? "Following" : "Followers";
  return lh('div', { className: "pg lc-prof lc-prof-people", onKeyDown: function (e) { if (e.key === "Escape") { e.preventDefault(); onBack(); } } },
    lh('div', { className: "hdr" }, lh('div', { className: "hdr-row" },
      lh('button', { type: "button", className: "bi", onClick: onBack, 'aria-label': "Back" }, lh(Ic.Bck, { style: { width: 21, height: 21 } })),
      lh('h1', { className: "hdr-title", tabIndex: -1, ref: head }, title))),
    people === null
      ? lh('p', { className: "lc-muted lc-prof-none" }, kind === "following" ? "Looscid can't see who " + user.name + " follows yet. Only the count comes with their profile." : "Looscid can't see who follows " + user.name + " yet. Only the count comes with their profile.")
      : people.length === 0
        ? lh('p', { className: "lc-muted lc-prof-none" }, kind === "following" ? (isMe ? "You don't follow anyone yet." : user.name + " doesn't follow anyone yet.") : (isMe ? "No followers yet." : "No followers yet."))
        : lh('ul', { className: "lc-people", role: "list" }, people.map(function (u) {
            return lh('li', { key: u.id },
              lh('button', { type: "button", className: "lc-person", onClick: function () { navigate("dp", u); } },
                lh('span', { "aria-hidden": "true" }, lh(Av, { user: u, size: 36 })),
                lh('span', { className: "lc-person-t" },
                  lh('span', { className: "lc-person-n" }, u.name || "Dreamor"), " ",
                  u.handle ? lh('span', { className: "lc-person-h" }, "@" + String(u.handle).replace(/^@/, "")) : null,
                  (function () {
                    // Feditext's account row: "Mutuals" when you both follow, "Following", or "Follows you".
                    const fo = !!(followingSet && followingSet.has(u.id)), fb = !!u.followsYou;
                    const rel = fo && fb ? "Mutuals" : fo ? "Following" : fb ? "Follows you" : "";
                    // One element per row; its words change in place (hidden when there is no relationship).
                    return lh('span', { className: "lc-person-rel", hidden: !rel }, rel ? " " + rel : "");
                  })())));
          })));
}
/* Build 152 prep (#99, part 4): a profile's QR code, under Dreamor options. The QR code is drawn from the profile's
   LooscidID link with qrcode-generator 1.4.4 (Kazuhiko Arase, MIT), served from this site (js/vendor) and loaded only
   when a QR code is shown. Its text alternative is the link itself, written out, and a plain description of what
   scanning it does. Black on white whatever the theme, with the quiet border scanners need. */
const LC_QR_SRC = (function () {
  try { const s = document.currentScript && document.currentScript.src; if (s) return new URL("vendor/qrcode-generator-1.4.4.js", s).href; } catch (e) {}
  return (Looscid.LOOSCID_BASE || "/") + "js/vendor/qrcode-generator-1.4.4.js";
})();
const LC_QR_SRI = "sha384-8FWZA6BGMXhsfO+BLtrJK0We6gg5o1JyO8xQm6peWDEUs17ACA5ziE/NIAkl9z2k"; // js/vendor/README.md
let lcQrP = null;
function lcQrLoad() {
  if (typeof window.qrcode === "function") return Promise.resolve(window.qrcode);
  if (lcQrP) return lcQrP;
  lcQrP = new Promise(function (ok, no) {
    const s = document.createElement("script"); s.src = LC_QR_SRC; s.integrity = LC_QR_SRI; s.async = true;
    s.onload = function () { if (typeof window.qrcode === "function") ok(window.qrcode); else { lcQrP = null; no(new Error("qr")); } };
    s.onerror = function () { lcQrP = null; s.remove(); no(new Error("qr")); };
    document.head.appendChild(s);
  });
  return lcQrP;
}
function lcQrModules(qr, text) {
  if (qr.stringToBytesFuncs && qr.stringToBytesFuncs["UTF-8"]) qr.stringToBytes = qr.stringToBytesFuncs["UTF-8"];
  const q = qr(0, "M"); q.addData(text); q.make();
  const n = q.getModuleCount(); let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += "M" + (c + 4) + " " + (r + 4) + "h1v1h-1z";
  return { n: n, d: d };
}
function ProfileQr({ name, link, onClose }) {
  const [qr, setQr] = useState(null), [err, setErr] = useState(false);
  const hRef = useRef(null);
  // After the menu hands focus back to its button, focus moves to the heading (like Edit profile from the menu).
  useEffect(function () { const t = setTimeout(function () { if (hRef.current) hRef.current.focus(); }, 40); return function () { clearTimeout(t); }; }, []);
  useEffect(function () {
    let live = true; setQr(null); setErr(false);
    lcQrLoad().then(function (f) { const v = lcQrModules(f, link); if (live) setQr(v); }, function () { if (live) setErr(true); });
    return function () { live = false; };
  }, [link]);
  const who = name || "this Dreamor";
  return lh('section', { id: "pf-qr", className: "lc-extra lc-prof-qr", "aria-labelledby": "pf-qr-h",
      onKeyDown: function (e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); } } },
    lh('h2', { id: "pf-qr-h", className: "lc-sub-h", tabIndex: -1, ref: hRef }, "QR code"),
    qr ? lh('svg', { className: "lc-qr", role: "img", "aria-label": "QR code for " + who + "'s profile", viewBox: "0 0 " + (qr.n + 8) + " " + (qr.n + 8), width: 220, height: 220, shapeRendering: "crispEdges", xmlns: "http://www.w3.org/2000/svg" },
        lh('rect', { width: qr.n + 8, height: qr.n + 8, fill: "#fff" }), lh('path', { d: qr.d, fill: "#000" }))
      : lh('p', { className: "lc-muted" }, err ? "Couldn't make the QR code here. The link below opens the same profile." : "Making the QR code…"),
    lh('p', null, "Scanning this code with a phone camera opens " + who + "'s profile on Looscid. It holds this link:"),
    lh('p', { className: "lc-break lc-qr-link" }, link),
    lh('div', { className: "lc-inrow" },
      lh('button', { type: "button", id: "pf-qr-copy", className: "btn bgb lc-btn", onClick: function () { lcCopy(link, "LooscidID link"); } }, "Copy link"),
      lh('button', Object.assign({ type: "button", id: "pf-qr-close", className: "btn bgb lc-btn", onClick: onClose }, lcCloseProps("QR code")), "Close")));
}
/* Build 152 prep (#99, part 4b): Lists, laid out like Feditext's (layout only; the store is in core.js, looscid_lists).
   Add to list: a section under Dreamor options with one checkbox per list (checked when the Dreamor is in it), and a
   New list box that makes a list with them in it. More, Lists: your lists, New list, and each list's page (its
   Dreamors' Dreams, its Dreamors with Remove, Rename list and Delete list). Private to you, saved on this device and
   in your settings backup. */
function ProfileLists({ user, navigate, onClose }) {
  Looscid.useListsTick();
  const [name, setName] = useState(""), [msg, setMsg] = useState("");
  const hRef = useRef(null);
  useEffect(function () { const t = setTimeout(function () { if (hRef.current) hRef.current.focus(); }, 40); return function () { clearTimeout(t); }; }, []);
  const lists = Looscid.lcListsRead(), who = user.name || user.displayName || "this Dreamor";
  const toggle = function (l, on) {
    if (!Looscid.lcListSetMember(l.id, user, on)) { announce(l.name + " is full. A list holds " + Looscid.LC_LIST_MEMBERS_MAX + " Dreamors at most."); return; }
    announce((on ? "Added to " : "Removed from ") + l.name + ".");
  };
  const make = function (e) {
    e.preventDefault();
    const r = Looscid.lcListCreate(name);
    if (r.error) { setMsg(r.error); announce(r.error); return; }
    Looscid.lcListSetMember(r.id, user, true); setName(""); setMsg("");
    announce("Made the list " + r.name + " and added " + who + ".");
  };
  return lh('section', { id: "pf-lists", className: "lc-extra lc-prof-lists", "aria-labelledby": "pf-lists-h",
      onKeyDown: function (e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); } } },
    lh('h2', { id: "pf-lists-h", className: "lc-sub-h", tabIndex: -1, ref: hRef }, "Add to list"),
    lists.length ? lh('fieldset', { className: "lc-fs", id: "pf-lists-fs" },
        lh('legend', { className: "lc-fs-l" }, "Lists with " + who),
        lh('div', { className: "lc-radios lc-radios-col" }, lists.map(function (l) {
          const on = Looscid.lcListHas(l, user);
          return lh('label', { key: l.id, className: "lc-radio" + (on ? " on" : "") },
            lh('input', { type: "checkbox", checked: on, onChange: function () { toggle(l, !on); } }),
            lh('span', null, l.name));
        })))
      : lh('p', { className: "lc-muted" }, "You don't have any lists yet. Make one here and " + who + " goes in it."),
    lh('form', { className: "lc-list-new", onSubmit: make },
      lh('label', { htmlFor: "pf-list-new" }, "New list name"),
      lh('input', { id: "pf-list-new", className: "inp", type: "text", maxLength: 60, autoComplete: "off", value: name, "aria-invalid": msg ? "true" : undefined, onChange: function (e) { setName(e.target.value); if (msg) setMsg(""); } }),
      msg ? lh('p', { className: "lc-muted lc-list-err" }, msg) : null,
      lh('button', { type: "submit", id: "pf-list-make", className: "btn bgb lc-btn" }, "Make list")),
    lh('div', { className: "lc-inrow" },
      lh('button', { type: "button", id: "pf-lists-manage", className: "btn bgb lc-btn", onClick: function () { navigate("lists"); } }, "Manage lists"),
      lh('button', Object.assign({ type: "button", id: "pf-lists-close", className: "btn bgb lc-btn", onClick: onClose }, lcCloseProps("Add to list")), "Close")));
}
function lcListCount(n) { return n.toLocaleString() + (n === 1 ? " Dreamor" : " Dreamors"); }
function ListsPage({ navigate, cherryCtx, data }) {
  Looscid.useListsTick();
  const id = data && data.list;
  const list = id ? Looscid.lcListGet(id) : null;
  if (id && list) return lh(ListView, { list: list, navigate: navigate, cherryCtx: cherryCtx });
  return lh(ListsIndex, { navigate: navigate, gone: !!id });
}
function ListsIndex({ navigate, gone }) {
  Looscid.useIdListTick("looscid:pins");
  const head = useRef(null);
  const [name, setName] = useState(""), [msg, setMsg] = useState("");
  useEffect(function () { if (head.current) head.current.focus(); }, []);
  const lists = Looscid.lcListsRead();
  const make = function (e) {
    e.preventDefault();
    const r = Looscid.lcListCreate(name);
    if (r.error) { setMsg(r.error); announce(r.error); return; }
    setName(""); setMsg(""); announce("Made the list " + r.name + ".");
  };
  return lh('div', { className: "pg lc-lists-page" },
    lh('div', { className: "hdr" }, lh('div', { className: "hdr-row" },
      lh('button', { type: "button", className: "bi", onClick: function () { navigate("settings"); }, "aria-label": "Back" }, lh(Ic.Bck, { style: { width: 21, height: 21 }, "aria-hidden": "true" })),
      lh('h1', { className: "hdr-title", tabIndex: -1, ref: head, id: "lists-h" }, "Lists"))),
    lh('div', { className: "lc-pad" },
      gone ? lh('p', { className: "lc-muted" }, "That list isn't on this device any more.") : null,
      lh('p', { className: "lc-muted" }, "Your own lists of Dreamors, to read their Dreams together. Only you can see them. Add someone from their profile: Dreamor options, Add to list."),
      lh('form', { className: "lc-list-new", onSubmit: make },
        lh('label', { htmlFor: "lists-new" }, "New list name"),
        lh('input', { id: "lists-new", className: "inp", type: "text", maxLength: 60, autoComplete: "off", value: name, "aria-invalid": msg ? "true" : undefined, onChange: function (e) { setName(e.target.value); if (msg) setMsg(""); } }),
        msg ? lh('p', { className: "lc-muted lc-list-err" }, msg) : null,
        lh('button', { type: "submit", id: "lists-make", className: "btn bp lc-big" }, "Make list")),
      lh('h2', { className: "lc-sub-h", id: "lists-yours-h" }, "Your lists (" + lists.length.toLocaleString() + ")"),
      lists.length ? lh('ul', { className: "lc-people lc-lists", role: "list", "aria-labelledby": "lists-yours-h" }, lists.slice().reverse().map(function (l) {
          return lh('li', { key: l.id },
            lh('button', { type: "button", className: "lc-person lc-list-row", id: "lists-open-" + l.id, onClick: function () { navigate("lists", { list: l.id }); } },
              lh('span', { className: "lc-person-t" }, lh('span', { className: "lc-person-n" }, l.name), lh('span', { className: "lc-person-h" }, ", " + lcListCount(l.members.length) + (Looscid.lcPinHas("list", l.id) ? ", pinned to Home" : "")))));
        }))
        : lh('p', { className: "lc-muted" }, "No lists yet.")));
}
function ListView({ list, navigate, cherryCtx }) {
  Looscid.useIdListTick("looscid:pins");
  const head = useRef(null), renRef = useRef(null);
  const [mode, setMode] = useState(null); // "rename" | "delete"
  const [name, setName] = useState(list.name), [msg, setMsg] = useState("");
  const [activeComment, setActiveComment] = useState(null);
  useEffect(function () { if (head.current) head.current.focus(); }, [list.id]);
  useEffect(function () { if (mode === "rename" && renRef.current) renRef.current.focus(); if (mode === "delete") { const b = document.getElementById("list-del-no"); if (b) b.focus(); } }, [mode]);
  const all = (cherryCtx && cherryCtx.dreams) || [];
  const { dreams, tl, tr, tur, tq, tuq, tb, tc } = useDreams(Looscid.lcListDreams(list, all));
  if (activeComment) return lh(CommentView, { dream: activeComment, onBack: function () { setActiveComment(null); }, onLike: tl, onRedream: tr, onUndoRedream: tur, onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onCommentPosted: tc, navigate: navigate });
  const focusId = function (i) { setTimeout(function () { const b = document.getElementById(i); if (b) b.focus(); }, 30); };
  const rename = function (e) {
    e.preventDefault();
    const r = Looscid.lcListRename(list.id, name);
    if (r.error) { setMsg(r.error); announce(r.error); return; }
    setMsg(""); setMode(null); announce("Renamed to " + r.name + "."); focusId("list-rename");
  };
  const del = function () { const l = Looscid.lcListDelete(list.id); navigate("lists"); setTimeout(function () { announce("Deleted the list " + (l ? l.name : "") + "."); }, 60); };
  const members = list.members;
  // Build 152 prep (#99, part 4c): Pin to Home makes this list a feed tab on Home, after the others (unpin and reorder
  // it there like any pinned tab). The button's words change in place; focus stays on it.
  const pinned = Looscid.lcPinHas("list", list.id);
  const togglePin = function () {
    if (pinned) { Looscid.lcPinRemove(Looscid.lcPinId({ kind: "list", ref: list.id }), true); announce("Unpinned " + list.name + " from Home."); }
    else { Looscid.lcPinAdd("list", list.id, list.name, true); announce(Looscid.lcPinHas("list", list.id) ? "Pinned " + list.name + " to Home. It's a feed tab there now." : "Couldn't pin " + list.name + ". Home has the most pinned tabs it keeps."); }
  };
  return lh('div', { className: "pg lc-lists-page lc-list-page" },
    lh('div', { className: "hdr" }, lh('div', { className: "hdr-row" },
      lh('button', { type: "button", className: "bi", onClick: function () { navigate("lists"); }, "aria-label": "Back" }, lh(Ic.Bck, { style: { width: 21, height: 21 }, "aria-hidden": "true" })),
      lh('h1', { className: "hdr-title", tabIndex: -1, ref: head, id: "list-h" }, list.name))),
    lh('div', { className: "lc-pad" },
      lh('div', { className: "lc-inrow" },
        lh('button', { type: "button", id: "list-pin", className: "btn bgb lc-btn", onClick: togglePin }, pinned ? "Unpin from Home" : "Pin to Home"),
        lh('button', { type: "button", id: "list-rename", className: "btn bgb lc-btn", "aria-expanded": mode === "rename" ? "true" : "false", onClick: function () { setName(list.name); setMsg(""); setMode(mode === "rename" ? null : "rename"); } }, "Rename list"),
        lh('button', { type: "button", id: "list-delete", className: "btn bgb lc-btn", "aria-expanded": mode === "delete" ? "true" : "false", onClick: function () { setMode(mode === "delete" ? null : "delete"); } }, "Delete list")),
      // Part 4d: shown on your profile's Lists tab, or only yours (the default), like a Circle's privacy.
      lh('div', { className: "lc-chk-row" },
        lh('input', { type: "checkbox", id: "list-shown", checked: !!list.shown, onChange: function (e) { const on = e.target.checked; Looscid.lcListSetShown(list.id, on); announce(on ? list.name + " is shown on your profile now." : list.name + " is only yours now."); } }),
        lh('label', { htmlFor: "list-shown" }, "Show on my profile")),
      mode === "rename" ? lh('form', { className: "lc-list-new", onSubmit: rename, onKeyDown: function (e) { if (e.key === "Escape") { e.preventDefault(); setMode(null); focusId("list-rename"); } } },
          lh('label', { htmlFor: "list-name" }, "List name"),
          lh('input', { id: "list-name", ref: renRef, className: "inp", type: "text", maxLength: 60, autoComplete: "off", value: name, "aria-invalid": msg ? "true" : undefined, onChange: function (e) { setName(e.target.value); if (msg) setMsg(""); } }),
          msg ? lh('p', { className: "lc-muted lc-list-err" }, msg) : null,
          lh('div', { className: "lc-q-btns" },
            lh('button', { type: "submit", className: "btn bp lc-big" }, "Save"),
            lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { setMode(null); focusId("list-rename"); } }, "Cancel"))) : null,
      mode === "delete" ? lh('div', { className: "lc-extra", id: "list-del" },
          lh('p', null, "Delete " + list.name + "? Its Dreamors aren't told and you keep following them."),
          lh('div', { className: "lc-q-btns" },
            lh('button', { type: "button", id: "list-del-yes", className: "btn bp lc-big lc-danger", onClick: del }, "Delete list"),
            lh('button', { type: "button", id: "list-del-no", className: "btn bgb lc-big", onClick: function () { setMode(null); focusId("list-delete"); } }, "Keep list"))) : null,
      lh('h2', { className: "lc-sub-h", id: "list-dreams-h" }, "Dreams (" + dreams.length.toLocaleString() + ")"),
      dreams.length ? lh('div', { className: "lc-list-dreams" }, dreams.map(function (d) {
          return lh(DreamCard, { key: d.id, dream: d, onLike: tl, onRedream: tr, onUndoRedream: tur, onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onComment: function (x) { setActiveComment(x); }, navigate: navigate, cherryCtx: cherryCtx });
        }))
        : lh('p', { className: "lc-muted" }, members.length ? "No Dreams from this list on your device yet." : "No Dreamors in this list yet. Add someone from their profile: Dreamor options, Add to list."),
      lh('h2', { className: "lc-sub-h", id: "list-members-h" }, "Dreamors (" + members.length.toLocaleString() + ")"),
      members.length ? lh('ul', { className: "lc-people lc-list-members", role: "list", "aria-labelledby": "list-members-h" }, members.map(function (m, i) {
          const nm = m.name || (m.handle ? "@" + String(m.handle).replace(/^@/, "") : "Dreamor");
          return lh('li', { key: Looscid.lcListMemberKey(m) || i, className: "lc-list-member" },
            lh('button', { type: "button", className: "lc-person", onClick: function () { navigate("dp", Object.assign({}, m, { name: nm })); } },
              lh('span', { className: "lc-person-t" }, lh('span', { className: "lc-person-n" }, nm), " ", m.handle ? lh('span', { className: "lc-person-h" }, "@" + String(m.handle).replace(/^@/, "")) : null)),
            lh('button', { type: "button", className: "btn bgb lc-btn", "aria-label": "Remove " + nm + " from " + list.name, onClick: function () {
              Looscid.lcListSetMember(list.id, m, false); announce("Removed " + nm + " from " + list.name + ".");
              const next = members[i + 1] || members[i - 1]; focusId(next ? "" : "list-members-h");
              setTimeout(function () { const rows = document.querySelectorAll(".lc-list-member .lc-person"); const t = rows[Math.min(i, rows.length - 1)]; if (t) t.focus(); else if (head.current) head.current.focus(); }, 40);
            } }, "Remove"));
        }))
        : lh('p', { className: "lc-muted" }, "None yet.")));
}
function ProfileView({ user, isMe, navigate, cherryCtx, onUpdateProfile, authUser, preview, onExitPreview }) {
  const [tab, setTab] = useState("dreams");
  const [viewAs, setViewAs] = useState(false); // your own profile, shown the way others see it
  const [editOpen, setEditOpen] = useState(false);
  const [people, setPeople] = useState(null); // "following" | "followers"
  const [noteEdit, setNoteEdit] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [rdShow, setRdShowS] = useState(lcRdShow);
  const [mediaShow, setMediaShowS] = useState(lcMediaShow);
  const [, bump] = useState(0);
  const [activeComment, setActiveComment] = useState(null);
  const [qrOpen, setQrOpen] = useState(false); // build 152 prep (#99, part 4): the QR code under Dreamor options
  const [listsOpen, setListsOpen] = useState(false); // part 4b: Add to list, under Dreamor options
  Looscid.useLikedTick();
  const moreBtn = useRef(null), editBtn = useRef(null), noteRef = useRef(null), headRef = useRef(null);
  // preview: your own profile as others see it. Your own data, nobody else's controls.
  const self = isMe || !!preview;
  const all = (cherryCtx && cherryCtx.dreams) || [];
  const lp = self ? (Looscid.getLocalProfile() || authUser || {}) : null;
  const upd = onUpdateProfile || Looscid.LC_UPDATE_PROFILE || function (patch) { Looscid.updateLocalProfile(null, patch); bump(function (n) { return n + 1; }); };
  const ed = useProfileEditor(lp || {}, upd, navigate);
  const handle = (user.handle || "").replace(/^@/, "");
  const mineOf = function (d) { return d.user && (d.user === user || d.user.id === user.id); };
  const ownDreams = all.filter(function (d) { return mineOf(d) && !d.replyTo; });
  // Build 150 (#48, 2three1y 4:21 AM Oct 11): Dreams this Dreamor publishes while their profile is open (your own too)
  // make #looscid-live say "<display name> just published". Part 16: the header count is gone (the Dreams tab has it),
  // and only a Dream with a real time from the last 5 minutes counts, so an old Dream that syncs in late is never news.
  const seenRef = useRef(null);
  if (!seenRef.current || seenRef.current.u !== (user.id || user.handle)) seenRef.current = { u: user.id || user.handle, ids: new Set(ownDreams.map(function (d) { return String(d.id); })) };
  const freshDreams = ownDreams.filter(function (d) { return !seenRef.current.ids.has(String(d.id)); });
  const saidRef = useRef(null);
  useEffect(function () {
    const key = String(user.id || user.handle);
    if (!saidRef.current || saidRef.current.u !== key) { saidRef.current = { u: key, said: new Set() }; return; }
    const now = Date.now();
    const news = freshDreams.filter(function (d) { return !saidRef.current.said.has(String(d.id)) && (+d.created > 0 && now - +d.created >= -60 * 1000 && now - +d.created < 5 * 60 * 1000); });
    if (!news.length) return;
    news.forEach(function (d) { saidRef.current.said.add(String(d.id)); });
    announce((user.name || user.displayName || "Dreamor") + " just published"); // never moves focus
  }, [freshDreams.length, user.id, user.handle]);
  const myReplies = self ? Looscid.lcRepliesRaw().map(Looscid.lcReplyObj).map(function (r) { return Object.assign({ redreams: 0, quotes: 0, comments: 0, redreamed: false, quoted: false, bookmarked: false }, r); }) : all.filter(function (d) { return mineOf(d) && d.replyTo; });
  const plainRd = self ? all.filter(function (d) { return d.redreamed && !mineOf(d); }) : all.filter(function (d) { return d.reddreamer && (d.reddreamer.id === user.id || d.reddreamer.handle === user.handle); });
  const quotes = ownDreams.filter(function (d) { return d.quoteOf != null; });
  const pool = ownDreams.concat(myReplies, plainRd.filter(function (d) { return ownDreams.indexOf(d) < 0; }));
  const {dreams, tl, tr, tur, tq, tuq, tb, tc} = useDreams(pool);
  const byId = function (list) { const ids = new Set(list.map(function (d) { return String(d.id); })); return dreams.filter(function (d) { return ids.has(String(d.id)); }); };
  const following = !!(cherryCtx && cherryCtx.following && cherryCtx.following.has(user.id));
  const blocked = !self && Looscid.lcBlockedUser(user), muted = !self && Looscid.lcIsMuted(user);
  const hidesRd = !self && Looscid.lcPeopleHas("looscid_hide_redreams", user.handle);
  const note = self ? "" : Looscid.lcNoteFor(user.handle);
  const theirLikes = !isMe && Array.isArray(user.likes) ? user.likes : null;
  const myLikedIds = Looscid.lcLikedItems("dream").map(function (x) { return x.id; });
  const theirVisible = theirLikes ? lcLikedVisibleTo(theirLikes, user.likesPublic || [], ME.handle, myLikedIds) : [];
  // Build 152 prep (#99, part 4d; 2three1y 7:29 PM Oct 12: "lists should be added to profiles as well"): the Lists tab.
  // Yours shows every list (each says whether it's shown or only yours); View as others and other Dreamors' profiles
  // show only lists their owner chose to show (user.lists on a profile that carries them).
  Looscid.useListsTick();
  const myLists = self ? Looscid.lcListsRead() : [];
  const visLists = isMe ? myLists : preview ? myLists.filter(function (l) { return l.shown; })
    : (Array.isArray(user.lists) ? user.lists.filter(function (l) { return l && typeof l.name === "string" && l.name.trim() && l.shown !== false; }) : []);
  // Tabs: Feditext's four, then 2three1y's: Liked (your own, private; on others only what they made visible to you),
  // Mutual likes (others), About.
  const TABS0 = [["dreams", "Dreams"], ["replies", "Replies"], ["redreams", "Redreams"], ["media", "Media"]]
    .concat(isMe ? [["liked", "Liked"]] : theirVisible.length ? [["liked", "Liked"]] : [])
    .concat(self ? [] : [["mutual", "Mutual likes"]])
    .concat(isMe || visLists.length ? [["lists", "Lists"]] : [])
    .concat([["about", "About"]]);
  Looscid.useProfileTabsTick(); Looscid.useIdListTick("looscid:pinned");
  const TABS = Looscid.lcProfileTabsSort(TABS0); // build 152 prep (#98): in your order (Settings, Profile Tabs)
  const cur = TABS.some(function (t) { return t[0] === tab; }) ? tab : "dreams";
  useEffect(function () { if (noteEdit && noteRef.current) noteRef.current.focus(); }, [noteEdit]);
  useEffect(function () { if (preview && headRef.current) headRef.current.focus(); }, [preview]);
  if (ed.editing) return ed.screen;
  if (viewAs) return lh(ProfileView, { user: user, isMe: false, preview: true, navigate: navigate, cherryCtx: cherryCtx,
    onExitPreview: function () { setViewAs(false); announce("Back to your profile."); setTimeout(function () { const b = document.getElementById("pf-more-btn"); if (b) b.focus(); }, 30); } });
  if (people) {
    const fol = people === "following";
    const list = self ? (fol ? USERS.filter(function (u) { return cherryCtx && cherryCtx.following.has(u.id); }) : USERS.filter(function (u) { return u.followsYou; }))
      : (fol ? (Array.isArray(user.followingList) ? user.followingList : null) : (Array.isArray(user.followersList) ? user.followersList : null));
    return lh(ProfilePeoplePage, { kind: people, user: user, isMe: self, people: list, navigate: navigate, followingSet: cherryCtx && cherryCtx.following,
      onBack: function () { const k = people; setPeople(null); setTimeout(function () { const b = document.getElementById("pf-count-" + k); if (b) b.focus(); }, 0); } });
  }
  if (activeComment) return lh(CommentView, { dream: activeComment, onBack: function () { setActiveComment(null); }, onLike: tl, onRedream: tr, onUndoRedream: tur, onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onCommentPosted: tc, navigate: navigate });
  const say = function (m) { announce(m); bump(function (n) { return n + 1; }); };
  // Build 152 prep (#99, part 4): Share profile hands the share sheet the profile's LooscidID link too (it used to
  // share the name only). Without a share sheet the link is copied.
  const profLink = Looscid.lcProfileLink(handle);
  const share = function () {
    const text = (user.name || "Dreamor") + " (@" + handle + ") on Looscid";
    if (navigator.share) { navigator.share({ title: text, text: text, url: profLink }).catch(function () {}); return; }
    lcCopy(profLink, "Profile link");
  };
  const backToMore = function () { setTimeout(function () { const b = document.getElementById("pf-more-btn"); if (b) b.focus(); }, 30); };
  const originals = Looscid.lcProfileOriginals(user, self ? Looscid.getMethods() : user.logins);
  const openOriginal = function (o) { const w = window.open(o.url, "_blank", "noopener,noreferrer"); if (w) w.opener = null; };
  const extraItems = [{ id: "qr", name: "QR code", a: function () { setListsOpen(false); setQrOpen(true); } },
    { id: "copyuser", name: "Copy username", a: function () { lcCopy("@" + handle, "Username"); } }]
    .concat(originals.map(function (o) { return { id: "orig-" + o.net, name: "Open original profile on " + o.label, a: function () { openOriginal(o); } }; }));
  const openEdit = function (fromMore) { setEditOpen(true); if (fromMore) setTimeout(function () { const a = document.getElementById("pf-link-name") || editBtn.current; if (a) a.focus(); }, 30); };
  const follow = function () { cherryCtx && cherryCtx.followUser(user.id); announce(following ? "Unfollowed " + user.name + "." : "Following " + user.name + "."); };
  // A LooscidID link opens this profile (#@handle, see lcOpenProfileLink in core.js).
  const copyLink = function () { lcCopy(profLink, "LooscidID link"); };
  const cherryOn = !!cherryCtx && lcAiOn();
  const askCherry = function () { cherryCtx.openCherry("Give me a short summary of " + (user.name || "this Dreamor") + " (@" + handle + "): who they are and what they Dream about."); };
  // Build 150, part 16 (2three1y, Oct 11): Dreamor options is a real pop-up menu, like the other action menus. It opens
  // with focus on the first item, Escape (or a two-finger scrub) closes it, choosing closes it, focus goes back to the
  // button, and it never remembers being open. Unfinished items stay in the list, unavailable, with the reason.
  const moreItems = isMe
    ? [{ id: "edit", name: "Edit profile", a: function () { openEdit(true); } },
       { id: "share", name: "Share profile", a: share },
       { id: "copylink", name: "Copy LooscidID link", a: copyLink }].concat(extraItems, [
       { id: "viewas", name: "View as others see it", a: function () { setViewAs(true); announce("Viewing your profile as others see it."); } },
       { id: "reorder", name: "Reorder tabs", a: function () { Looscid.LC_SETTINGS_BACK = "profile"; navigate("settings_profiletabs"); } },
       { id: "settings", name: "Settings", a: function () { navigate("settings"); } }])
    : [following ? { id: "unfollow", name: "Unfollow", a: follow } : { id: "follow", name: "Follow", a: follow },
       { id: "message", name: "Message", note: "unavailable: direct messages aren't ready yet", disabled: true },
       cherryOn ? { id: "cherry", name: "Ask Cherry for a summary", a: askCherry } : { id: "cherry", name: "Ask Cherry for a summary", note: "unavailable: Cherry is off", hint: "Not available while Cherry is off. Turn it on in Settings, Intelligence.", disabled: true },
       { id: "share", name: "Share profile", a: share },
       { id: "copylink", name: "Copy LooscidID link", a: copyLink }].concat(extraItems, [
       { id: "addlist", name: "Add to list", a: function () { setQrOpen(false); setListsOpen(true); } },
       { id: "reorder", name: "Reorder tabs", a: function () { Looscid.LC_SETTINGS_BACK = null; navigate("settings_profiletabs"); } },
       hidesRd ? { id: "showrd", name: "Show Redreams", a: function () { Looscid.lcPeopleSet("looscid_hide_redreams", user.handle, false); say("Showing Redreams from " + user.name + "."); } }
               : { id: "hiderd", name: "Hide Redreams", a: function () { Looscid.lcPeopleSet("looscid_hide_redreams", user.handle, true); say("Hiding Redreams from " + user.name + "."); } },
       { id: "note", name: note ? "Edit note" : "Add note", a: function () { setNoteText(note); setNoteEdit(true); } },
       muted ? { id: "unmute", name: "Unmute", a: function () { Looscid.lcPeopleSet("looscid_muted_dreamors", user.handle, false); say("Unmuted " + user.name + "."); } }
             : { id: "mute", name: "Mute", a: function () { Looscid.lcPeopleSet("looscid_muted_dreamors", user.handle, true); say("Muted " + user.name + ". Their Dreams are hidden from your feed."); } },
       blocked ? { id: "unblock", name: "Unblock", a: function () { Looscid.lcBlockedSet("dreamers", Looscid.lcBlocked("dreamers").filter(function (h) { return h !== Looscid.lcHandle(user.handle); })); say("Unblocked " + user.name + "."); } }
               : { id: "block", name: "Block", a: function () { Looscid.lcBlockedSet("dreamers", Looscid.lcBlocked("dreamers").concat([user.handle])); say("Blocked " + user.name + ". Unblock here or in Settings, Privacy."); } },
       { id: "report", name: "Report", note: "unavailable: Looscid has nowhere to send reports yet", disabled: true }]);
  const moreMenu = preview ? null : lh(LcMenu, { id: "pf-more-btn", menuId: "pf-more", kind: "action", title: "Dreamor options", btnLabel: "Dreamor options", btnRef: moreBtn,
    btnClass: "btn bgb lc-big lc-prof-morebtn", className: "lc-prof-more", itemClass: "lc-dopt",
    btnText: lh('span', null, lh(Ic.Dots, { style: { width: 18, height: 18 }, "aria-hidden": "true" }), " Dreamor options"), items: moreItems,
    onSelect: function (k, it) { if (it.a) it.a(); } });
  const onTabKey = function (e) {
    const i = TABS.findIndex(function (t) { return t[0] === cur; }); let n = null;
    if (e.key === "ArrowRight") n = (i + 1) % TABS.length; else if (e.key === "ArrowLeft") n = (i + TABS.length - 1) % TABS.length; else if (e.key === "Home") n = 0; else if (e.key === "End") n = TABS.length - 1;
    if (n === null) return; e.preventDefault(); setTab(TABS[n][0]); setTimeout(function () { const b = document.getElementById("pf-tab-" + TABS[n][0]); if (b) b.focus(); }, 0);
  };
  const card = function (d, ctx) { return lh(DreamCard, { key: d.id, dream: d, replyCtx: ctx || null, onLike: tl, onRedream: tr, onUndoRedream: tur, onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onComment: function (x) { setActiveComment(x); }, navigate: navigate, cherryCtx: cherryCtx }); };
  const empty = function (title, sub) { return lh('div', { className: "es" }, lh('p', { className: "esl" }, title), sub ? lh('p', { className: "lc-muted", style: { textAlign: "center", marginTop: 6 } }, sub) : null); };
  const nFollowing = self ? USERS.filter(function (u) { return cherryCtx && cherryCtx.following.has(u.id); }).length : (user.following || 0);
  const nFollowers = self ? USERS.filter(function (u) { return u.followsYou; }).length : (user.followers || 0);
  // Build 150 (#53): your own Joined is the exact moment your LooscidID was made. Older profiles only kept "October 2026",
  // so the moment comes from the "LooscidID created" activity line, or from the time stamped into the LooscidID's own id.
  const joined = lcJoinedText(self ? lcOwnCreatedAt(lp) : (user.createdAt || user.joined || ""));
  const locked = self ? !!(lp && lp.private) : !!(user.locked || user.private);
  const fields = [];
  const site = self ? lp && lp.website : user.website;
  if (site) fields.push({ name: "Website", value: site });
  ((self ? lp && lp.links : user.links) || []).forEach(function (l) { if (l && l.name && l.url) fields.push({ name: l.name, value: l.url }); });
  (user.fields || []).forEach(function (f) { if (f && f.name && f.value) fields.push({ name: f.name, value: f.value, verified: f.verified, verifiedAt: f.verifiedAt || f.verified_at || null }); });
  const rdList = (function () {
    const r = byId(plainRd), q = byId(quotes);
    return rdShow === "quotes" ? q : rdShow === "redreams" ? r : r.concat(q);
  })();
  const setRdShow = function (v) {
    try { localStorage.setItem(LC_PROFILE_RD_KEY, v); } catch (e) {}
    setRdShowS(v);
    const r = byId(plainRd).length, q = byId(quotes).length, n = v === "quotes" ? q : v === "redreams" ? r : r + q;
    const what = v === "quotes" ? (n === 1 ? "Quote" : "Quotes") : v === "redreams" ? (n === 1 ? "Redream" : "Redreams") : (n === 1 ? "Redream or Quote" : "Redreams and Quotes");
    announce(n + " " + what + ".");
  };
  const mediaAll = byId(ownDreams).filter(function (d) { return lcDreamMediaKinds(d).any; });
  const mediaList = function (v) { return v === "images" ? mediaAll.filter(function (d) { return lcDreamMediaKinds(d).img; }) : v === "videos" ? mediaAll.filter(function (d) { return lcDreamMediaKinds(d).vid; }) : mediaAll; };
  const setMediaShow = function (v) {
    try { if (v === "both") localStorage.removeItem(LC_PROFILE_MEDIA_KEY); else localStorage.setItem(LC_PROFILE_MEDIA_KEY, v); } catch (e) {}
    setMediaShowS(v);
    const n = mediaList(v).length;
    announce(n + " " + (n === 1 ? "Dream" : "Dreams") + (v === "images" ? " with images." : v === "videos" ? " with videos." : " with media."));
  };
  const tabCount = function (id) {
    switch (id) {
      case "dreams": return byId(ownDreams).length;
      case "replies": return byId(myReplies).length;
      case "redreams": return byId(plainRd).length + byId(quotes).length;
      case "media": return mediaAll.length;
      case "lists": return visLists.length;
      case "liked": return isMe ? Looscid.lcLikedItems().filter(function (x) { return x.k !== "chat" || !x.cherry || Looscid.lcAiOn(); }).length : theirVisible.length;
      case "mutual": { if (!theirLikes) return 0; const mine = new Set(Looscid.lcLikedItems("dream").map(function (x) { return String(x.id); })); return theirVisible.filter(function (x) { return x.k === "dream" && mine.has(String(x.id)); }).length; }
    }
    return null;
  };
  const pubTabs = lcLikedPublic();
  const likedIntro = isMe ? (pubTabs.length
      ? "Public on your profile: " + LC_LIKED_TABS_LABELS(pubTabs) + ". The rest only you can see, and people can see your likes on their own Dreams."
      : "Only you can see your Liked tab. People can see your likes on their own Dreams.") : "";
  const panel = function () {
    switch (cur) {
      case "dreams": { const l = byId(ownDreams);
        // Build 152 prep (#99): your pinned Dreams come first, marked "Pinned".
        const pins = self ? Looscid.lcPinnedIds() : [], pinL = pins.map(function (id) { return l.find(function (d) { return String(d.id) === id; }); }).filter(Boolean), rest = l.filter(function (d) { return pinL.indexOf(d) < 0; });
        return l.length ? pinL.map(function (d) { return lh(DreamCard, { key: "pin-" + d.id, dream: d, pinned: true, onLike: tl, onRedream: tr, onUndoRedream: tur, onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onComment: function (x) { setActiveComment(x); }, navigate: navigate, cherryCtx: cherryCtx }); }).concat(rest.map(function (d) { return card(d); })) : empty("No Dreams yet", isMe ? "Your Dreams will show up here." : "Nothing to show yet."); }
      case "replies": { const l = byId(myReplies); return l.length ? l.map(function (d) { return card(d, Looscid.lcReplyContext(d, dreams.concat(all))); }) : empty("No Replies yet", isMe ? "Your Replies will show up here." : "Nothing to show yet."); }
      case "redreams":
        return lh(React.Fragment, null,
          lh('fieldset', { className: "lc-fs lc-rd-show" },
            lh('legend', null, "Show"),
            [["quotes", "Quotes only"], ["redreams", "Redreams only"], ["both", "Both"]].map(function (o) {
              return lh('label', { key: o[0], className: "lc-radio", htmlFor: "pf-rd-" + o[0] },
                lh('input', { type: "radio", id: "pf-rd-" + o[0], name: "pf-rd-show", value: o[0], checked: rdShow === o[0], onChange: function () { setRdShow(o[0]); } }), " " + o[1]);
            })),
          rdList.length ? rdList.map(card) : empty(rdShow === "quotes" ? "No Quotes yet" : rdShow === "redreams" ? "No Redreams yet" : "No Redreams or Quotes yet",
            isMe ? "Dreams you redream or quote will show up here." : "Nothing to show yet."));
      case "media": {
        // Build 149: Show radios, the same pattern as the Redreams ones (filters in place, focus stays on the radio).
        const l = mediaList(mediaShow);
        return lh(React.Fragment, null,
          lh('fieldset', { className: "lc-fs lc-rd-show lc-media-show" },
            lh('legend', null, "Show"),
            [["images", "Images"], ["videos", "Videos"], ["both", "Both"]].map(function (o) {
              return lh('label', { key: o[0], className: "lc-radio", htmlFor: "pf-media-" + o[0] },
                lh('input', { type: "radio", id: "pf-media-" + o[0], name: "pf-media-show", value: o[0], checked: mediaShow === o[0], onChange: function () { setMediaShow(o[0]); } }), " " + o[1]);
            })),
          l.length ? l.map(card) : empty(mediaShow === "images" ? "No images yet" : mediaShow === "videos" ? "No videos yet" : "No media yet",
            isMe ? (mediaShow === "images" ? "Dreams with images will show up here." : mediaShow === "videos" ? "Dreams with videos will show up here." : "Dreams with images or videos will show up here.") : "Nothing to show yet."));
      }
      case "liked":
        if (isMe) return lh(Looscid.LikedView, { navigate: navigate, cherryCtx: cherryCtx, idp: "pfl", intro: likedIntro, onComment: function (x) { setActiveComment(x); } });
        return theirVisible.length ? lh(React.Fragment, null,
          theirVisible.filter(function (x) { return x.k === "dream"; }).map(function (x) {
            const live = all.find(function (d) { return String(d.id) === String(x.id); });
            return card(live || Object.assign({ likes: x.likes || 0, comments: 0, redreams: 0, quotes: 0, liked: false, redreamed: false, quoted: false, bookmarked: false, time: "" }, x, { user: x.user && Looscid.lcHandle(x.user.handle) === Looscid.lcHandle(ME.handle) ? ME : x.user }));
          }),
          lh('ul', { className: "lc-liked-list", role: "list" }, theirVisible.filter(function (x) { return x.k !== "dream"; }).map(function (x) { return lh('li', { key: x.k + x.id, className: "lc-liked-row" }, x.name || x.q || "Untitled"); })))
          : empty("Nothing liked to show", null);
      case "mutual": {
        if (!theirLikes) return empty("No mutual likes", user.name + "'s likes aren't public, so there are no mutual likes to show.");
        const mine = new Set(Looscid.lcLikedItems("dream").map(function (x) { return String(x.id); }));
        const both = theirVisible.filter(function (x) { return x.k === "dream" && mine.has(String(x.id)); });
        return both.length ? both.map(function (x) { const live = all.find(function (d) { return String(d.id) === String(x.id); }); return card(live || Object.assign({ likes: 1, comments: 0, redreams: 0, quotes: 0, liked: true, redreamed: false, quoted: false, bookmarked: true, time: "" }, x)); })
          : empty("No mutual likes", "No Dreams you both liked yet.");
      }
      case "lists": {
        if (!visLists.length) return empty(isMe ? "No Lists yet" : "No Lists", isMe ? "Make one in More, Lists, or with Add to list in someone's profile options." : null);
        const cnt = function (l) { const n = Array.isArray(l.members) ? l.members.length : (+l.count || 0); return n.toLocaleString() + (n === 1 ? " Dreamor" : " Dreamors"); };
        return lh('section', { className: "lc-prof-lists", "aria-labelledby": "pf-lists-tab-h" },
          lh('h2', { id: "pf-lists-tab-h", className: "lc-sub-h" }, isMe ? "Your Lists" : (user.name || "Dreamor") + "'s Lists"),
          lh('ul', { className: "lc-people", role: "list" }, visLists.map(function (l, i) {
            return lh('li', { key: l.id || i }, isMe
              ? lh('button', { type: "button", className: "lc-person lc-list-row", id: "pf-list-" + l.id, onClick: function () { navigate("lists", { list: l.id }); } },
                  lh('span', { className: "lc-person-t" }, lh('span', { className: "lc-person-n" }, l.name), lh('span', { className: "lc-person-h" }, ", " + cnt(l) + (l.shown ? ", shown on your profile" : ", only you"))))
              : lh('p', { className: "lc-person lc-list-row" }, lh('span', { className: "lc-person-t" }, lh('span', { className: "lc-person-n" }, l.name), lh('span', { className: "lc-person-h" }, ", " + cnt(l)))));
          })),
          isMe ? lh('p', { className: "lc-muted" }, "Others see only the lists you show. Choose on each list's page with Show on my profile.") : null);
      }
      case "about": {
        const rows = [];
        rows.push(["LooscidID", "@" + handle, lh('button', { key: "c", type: "button", className: "btn bgb lc-btn", onClick: function () { lcCopy("@" + handle, "LooscidID"); } }, "Copy LooscidID")]);
        if (joined) rows.push(["Date joined", joined]);
        const based = self ? lp && lp.location : user.location; if (based) rows.push(["Account based in", based]);
        const logins = self ? Looscid.getMethods() : (user.logins || []);
        if (logins.length) rows.push(["Connected Logins", lh('ul', { key: "l", className: "lc-about-logins", role: "list" }, logins.map(function (m) { return lh('li', { key: m.id || m.provider }, Looscid.lcNameJoin(Looscid.PROVIDER_NAMES && Looscid.PROVIDER_NAMES[m.provider] || m.provider, m.provider === "nostr" && Looscid.shortNpub ? Looscid.shortNpub(m.publicId) : m.publicId)); }))]);
        const npubM = logins.find(function (m) { return m.provider === "nostr" && /^npub1/.test(m.publicId || ""); });
        const npub = npubM ? npubM.publicId : user.npub;
        if (npub) rows.push(["Nostr public key", lh('span', { key: "n", className: "lc-break" }, npub), lh('button', { key: "c", type: "button", className: "btn bgb lc-btn", onClick: function () { lcCopy(npub, "Nostr public key"); } }, "Copy Nostr public key")]);
        if (user.verified) rows.push(["Verified", "Yes"]);
        return lh('section', { className: "lc-prof-about", "aria-labelledby": "pf-about-h" },
          lh('h2', { id: "pf-about-h", className: "lc-sub-h" }, (user.name || user.displayName) ? "About " + (user.name || user.displayName) : "About this LooscidID"),
          // Build 150, part 15: plain rows, not a dl. WebKit calls a <dd> "description", so VoiceOver said it after every value.
          lh('ul', { className: "lc-dl lc-rows", role: "list" }, rows.map(function (r) { return lh('li', { key: r[0] }, lh('span', { className: "lc-dt" }, r[0], lh('span', { className: "sr-only" }, ":")), " ", lh('span', { className: "lc-dd" }, r[1], r[2] ? " " : null, r[2] || null)); })));
      }
    }
    return null;
  };
  return lh('div', { className: "pg lc-prof" },
    lh('div', { className: "hdr" }, lh('div', { className: "hdr-row" },
      // Build 150 (#60): your own profile lives in More (View your profile), so Back returns there with the Back sound.
      lh('button', { type: "button", className: "bi", onClick: function () { if (preview) { if (onExitPreview) onExitPreview(); return; } navigate(isMe ? "settings" : "feed"); }, 'aria-label': "Back" }, lh(Ic.Bck, { style: { width: 21, height: 21 } })),
      lh('span', { className: "hdr-title", "aria-hidden": "true" }, "Profile"))),
      // build 150 (#49): "Dreamor options", not "More". Part 16: it is a pop-up menu button after the name and @handle.
    preview ? lh('div', { className: "lc-prof-preview" },
      lh('p', { className: "lc-muted" }, "This is how other Dreamors see your profile."),
      lh('button', { type: "button", id: "pf-preview-done", className: "btn bp lc-big", onClick: function () { if (onExitPreview) onExitPreview(); } }, "Done viewing as others")) : null,
    lh('div', { className: "lc-prof-head" },
      lh('div', { "aria-hidden": "true" }, lh(Av, { user: user, size: 72 })),
      preview ? null : isMe
        ? lh('div', { className: "lc-prof-acts" },
            lh('button', { type: "button", ref: editBtn, id: "pf-edit-btn", className: "btn bgb lc-big", "aria-expanded": editOpen ? "true" : "false", "aria-controls": "pf-edit", onClick: function () { setEditOpen(!editOpen); } }, "Edit profile"))
        : lh('div', { className: "lc-prof-acts" },
            lh('button', { type: "button", className: "btn bgb lc-big", disabled: true, "aria-describedby": Looscid.lcHint("Not available yet: direct messages aren't ready yet.") }, "Direct message", lh('span', { className: "lc-muted", "aria-hidden": "true" }, " (unavailable)")),
            lh('button', { type: "button", className: "btn " + (following ? "bgb" : "bp") + " lc-big", "aria-pressed": following ? "true" : "false", onClick: follow }, following ? "Following" : "Follow")),
      isMe && lh('div', { id: "pf-edit", className: "lc-prof-edit", hidden: !editOpen }, editOpen ? ed.list : null),
      lh('h1', { className: "lc-prof-name", tabIndex: -1, ref: headRef }, user.name || "Dreamor"),
      // Feditext's account line: @handle, the lock for a private (locked) account, then the "Follows you", "Muted" and
      // "Blocked" capsules. Build 149: each is its own piece with a plain space between, no hidden commas.
      lh('p', { className: "lc-prof-handle" }, lh('span', { className: "sr-only" }, "LooscidID"), " ", lh('span', { className: "lc-prof-acct" }, "@" + handle),
        locked ? lh('span', { className: "lc-prof-lock" }, " ", lh(Ic.Lock, { style: { width: 13, height: 13 }, "aria-hidden": "true" }), lh('span', { className: "sr-only" }, "Locked account")) : null,
        // 2three1y 3:23/3:30 AM: "Follows you" becomes "Mutuals" once you follow back. It is one element whose words change
        // in place: nothing new appears, nothing is announced, focus stays where it is.
        !self && user.followsYou ? [" ", lh('span', { key: "fy", id: "pf-rel", className: "lc-cap" }, following ? "Mutuals" : "Follows you")] : null,
        muted ? [" ", lh('span', { key: "mu", className: "lc-cap" }, "Muted")] : null,
        blocked ? [" ", lh('span', { key: "bl", className: "lc-cap" }, "Blocked")] : null),
      moreMenu,
      listsOpen && !self ? lh(ProfileLists, { user: user, navigate: navigate, onClose: function () { setListsOpen(false); backToMore(); } }) : null,
      qrOpen && !preview ? lh(ProfileQr, { name: user.name || user.displayName, link: profLink, onClose: function () { setQrOpen(false); backToMore(); } }) : null,
      user.isOriginals ? lh('p', { className: "lc-muted" }, "Founding account") : null,
      // Build 150, part 16: no "Dreams (N) • Joined" line here any more. The Dreams tab already says how many, and the
      // About tab has Date joined, so VoiceOver no longer reads both twice.
      note && !noteEdit ? lh('div', { className: "lc-prof-note" }, lh('span', { className: "lc-prof-note-l" }, "Note"), " ", lh('span', { className: "lc-prof-note-t" }, note)) : null,
      noteEdit && lh('form', { className: "lc-prof-noteform", onSubmit: function (e) { e.preventDefault(); Looscid.lcSetNote(user.handle, noteText); setNoteEdit(false); announce(noteText.trim() ? "Note saved." : "Note removed."); setTimeout(function () { const b = document.getElementById("pf-more-btn"); if (b) b.focus(); }, 30); },
          onKeyDown: function (e) { if (e.key === "Escape") { e.preventDefault(); setNoteEdit(false); setTimeout(function () { const b = document.getElementById("pf-more-btn"); if (b) b.focus(); }, 30); } } },
        lh('label', { htmlFor: "pf-note" }, "Note for " + user.name + ", only you can see it"),
        lh('textarea', { id: "pf-note", ref: noteRef, className: "inp", rows: 3, maxLength: 500, value: noteText, onChange: function (e) { setNoteText(e.target.value); } }),
        lh('div', { className: "lc-q-btns" }, lh('button', { type: "submit", className: "btn bp lc-big" }, "Save"),
          lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { setNoteEdit(false); setTimeout(function () { const b = document.getElementById("pf-more-btn"); if (b) b.focus(); }, 30); } }, "Cancel"))),
      // Feditext's fields: a bordered table of rows, the label on the left third, the value (its links live) on the right;
      // a verified value gets a green row and a checkmark, read as "Verified" and the date when there is one.
      fields.length ? lh('ul', { className: "lc-prof-fields lc-rows", role: "list" }, fields.map(function (f, i) {
        const vAt = f.verifiedAt ? lcJoinedText(f.verifiedAt).replace(/ at .*$/, "") : "";
        return lh('li', { key: i, className: "lc-prof-field" + (f.verified || f.verifiedAt ? " lc-verified" : "") },
          lh('span', { className: "lc-dt" }, f.name, lh('span', { className: "sr-only" }, ":")), " ",
          lh('span', { className: "lc-dd" },
            f.verified || f.verifiedAt ? lh('span', { className: "lc-prof-check", "aria-hidden": "true" }, "\u2713 ") : null,
            lh('span', { className: "lc-prof-fv" }, lcFieldValue(f.value, "f" + i, navigate)),
            f.verified || f.verifiedAt ? lh('span', { className: "sr-only" }, " Verified" + (vAt ? " " + vAt : "")) : null));
      })) : null,
      // Feditext's bio: rich text, its paragraphs and line breaks kept, links, mentions and hashtags as real links.
      user.bio ? lh('div', { className: "lc-prof-bio" }, lcBioParas(user.bio, navigate)) : (isMe ? lh('p', { className: "lc-prof-bio lc-muted" }, "No bio yet.") : null),
      lh('div', { className: "lc-prof-counts" },
        lh('button', { type: "button", id: "pf-count-following", className: "btn bgb lc-big", "aria-describedby": Looscid.lcHint("Opens the list."), onClick: function () { setPeople("following"); } }, nFollowing.toLocaleString() + " Following"),
        lh('button', { type: "button", id: "pf-count-followers", className: "btn bgb lc-big", "aria-describedby": Looscid.lcHint("Opens the list."), onClick: function () { setPeople("followers"); } }, nFollowers.toLocaleString() + " " + (nFollowers === 1 ? "Follower" : "Followers")))),
    lh('div', { className: "ftabs lc-prof-tabs", role: "tablist", "aria-label": "Profile sections", onKeyDown: onTabKey },
      // Build 149 (2three1y: iOS already says "tab, 1 of 4"): no position in the names, ever. Each tab's name is its
      // visible text, with how many it holds in parentheses, like "Dreams (106)".
      TABS.map(function (t) { const on = cur === t[0]; const n = tabCount(t[0]);
        return lh('button', { key: t[0], id: "pf-tab-" + t[0], type: "button", role: "tab", className: "ftab" + (on ? " on" : ""), "aria-selected": on ? "true" : "false", tabIndex: on ? 0 : -1, "aria-controls": "pf-panel", onClick: function () { setTab(t[0]); } }, n == null ? t[1] : t[1] + " (" + n.toLocaleString() + ")"); })),
    lh('div', { id: "pf-panel", role: "tabpanel", "aria-labelledby": "pf-tab-" + cur }, panel()));
}
function LC_LIKED_TABS_LABELS(ids) { return (Looscid.LC_LIKED_TABS || []).filter(function (t) { return ids.indexOf(t.id) >= 0; }).map(function (t) { return t.label; }).join(", "); }
function ProfilePage({navigate, authUser, cherryCtx, onUpdateProfile}) {
  return lh(ProfileView, { user: ME, isMe: true, navigate: navigate, cherryCtx: cherryCtx, onUpdateProfile: onUpdateProfile, authUser: authUser });
}
function DreamorProfilePage({user, navigate, cherryCtx}) {
  return lh(ProfileView, { key: user.id, user: user, isMe: user.id === ME.id, navigate: navigate, cherryCtx: cherryCtx });
}
Object.assign(Looscid, { lcLikedPublic, lcSetLikedPublic, lcLikedVisibleTo, LC_LIKED_PUBLIC_KEY });
/* --- SETTINGS ---------------------------- */
/* --- ACCOUNT SETTINGS ---------------------------------------------------- */
function AccountSettings({navigate, authUser, onSignOut, onRenameProfile, onUpdateProfile, initialTab}) {
  // Settings > Account IS LooscidID management (2three1y, Oct 8 2026), laid out like the
  // Google Account page. Alerts live only in Settings > Alerts, never here.
  const securityExtra = React.createElement(React.Fragment, null
    , React.createElement('h3', { className: "lid-label",}, "Local profile")
    , React.createElement('p', { className: "lid-help",}, "Your LooscidID is saved only on this device. Resetting it starts fresh with the name Dreamor.")
    , React.createElement('button', { className: "btn bgb lid-wide", onClick: ()=>{ if (window.confirm("Reset your local profile on this device?")) onSignOut(); },}, "Reset local profile")
  );
  return React.createElement(LooscidIDManager, { navigate: navigate, authUser: authUser, onUpdateProfile: onUpdateProfile || (()=>{}), initialTab: initialTab,
    title: "LooscidID", onBack: ()=>navigate("settings"), securityExtra: securityExtra,});
}
// Round 6: one audience radio set (fieldset + legend, native radios) with the Custom picker.
function LcAudience({ id, legend, value, onChange, customKey, options, note }) {
  const [, tick] = useState(0);
  const [h, setH] = useState("");
  useEffect(function () { const f = function () { tick(function (x) { return x + 1; }); }; window.addEventListener("looscid:aud", f); return function () { window.removeEventListener("looscid:aud", f); }; }, []);
  const opts = options || LC_AUD;
  const list = lcAudCustom(customKey);
  const add = function () {
    const v = lcHandle(h); if (!v) { announce("Type a handle first."); return; }
    if (list.indexOf(v) >= 0) { announce("@" + v + " is already on the list."); return; }
    lcAudCustomSet(customKey, list.concat([v])); setH(""); announce("Added @" + v + ".");
  };
  return lh('fieldset', { className: "lc-fs lc-aud", id: id },
    lh('legend', { className: "lc-fs-l" }, legend),
    lh('div', { className: "lc-radios lc-radios-col" }, opts.map(function (o) {
      const on = (value || "everyone") === o[0];
      return lh('label', { key: o[0], className: "lc-radio" + (on ? " on" : "") },
        lh('input', { type: "radio", name: id + "-r", value: o[0], checked: on, onChange: function () { onChange(o[0]); announce(legend + ": " + o[1] + "."); } }), lh('span', null, o[1]));
    })),
    value === "custom" ? lh('div', { className: "lc-aud-custom" },
      lh('label', { htmlFor: id + "-h", className: "lc-fs-l", style: { display: "block" } }, "Add a Dreamor by handle"),
      lh('div', { className: "lc-inrow" },
        lh('input', { id: id + "-h", type: "text", className: "lc-text", value: h, placeholder: "@handle", autoCapitalize: "off", autoCorrect: "off", spellCheck: false,
          onChange: function (e) { setH(e.target.value); }, onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); add(); } } }),
        lh('button', { type: "button", className: "btn bp lc-btn", id: id + "-add", onClick: add }, "Add")),
      list.length ? lh('ul', { className: "lc-aud-list", "aria-label": "Chosen Dreamors" }, list.map(function (x) {
        return lh('li', { key: x }, lh('span', null, "@" + x), lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { lcAudCustomSet(customKey, list.filter(function (y) { return y !== x; })); announce("Removed @" + x + "."); } }, "Remove @" + x));
      })) : lh('p', { className: "lc-desc" }, "No one chosen yet.")) : null,
    note ? lh('p', { className: "lc-desc" }, note) : null);
}
function lcCatSave(kind, st) {
  try { localStorage.setItem("looscid_" + kind + "_cat_order", JSON.stringify(st.order)); localStorage.setItem("looscid_" + kind + "_cat_hidden", JSON.stringify(st.hidden)); } catch (e) {}
  window.dispatchEvent(new CustomEvent("looscid:cats"));
}
function LcCatCustomize({ kind, defs, title }) {
  useCats();
  const st = lcCatState(kind, defs);
  const name = function (id) { return defs.find(function (d) { return d.id === id; }).label; };
  const move = function (id, to) {
    const o = st.order.filter(function (x) { return x !== id; }); o.splice(Math.max(0, Math.min(o.length, to)), 0, id);
    lcCatSave(kind, { order: o, hidden: st.hidden });
    announce(name(id) + " moved to position " + (o.indexOf(id) + 1) + ".");
    setTimeout(function () { const b = document.getElementById("cat-" + kind + "-" + id + "-" + (o.indexOf(id) === 0 ? "down" : "up")); if (b && !b.disabled) b.focus(); else { const c = document.getElementById("cat-" + kind + "-" + id + "-show"); if (c) c.focus(); } }, 30);
  };
  const toggle = function (id) {
    const h = st.hidden.indexOf(id) >= 0 ? st.hidden.filter(function (x) { return x !== id; }) : st.hidden.concat([id]);
    lcCatSave(kind, { order: st.order, hidden: h }); announce(name(id) + (h.indexOf(id) >= 0 ? " hidden." : " shown."));
  };
  return lh('section', { className: "lc-grp lc-cats", "aria-labelledby": "cat-" + kind + "-h", id: "cat-" + kind },
    lh('h2', { id: "cat-" + kind + "-h", className: "lc-grp-h", tabIndex: -1 }, title || "Customize categories"),
    lh('p', { className: "lc-desc" }, "Change the order of the category tabs, or hide the ones you don't use."),
    lh('ol', { className: "lc-cat-ol" }, st.order.map(function (id, i) {
      const n = name(id), last = i === st.order.length - 1;
      return lh('li', { key: id, className: "lc-cat-li" },
        lh('h3', { className: "lc-cat-n" }, n),
        lh('div', { className: "lc-cat-acts" },
          lh('button', { type: "button", id: "cat-" + kind + "-" + id + "-top", className: "btn bgb lc-btn", disabled: i === 0, onClick: function () { move(id, 0); } }, "Move " + n + " to top"),
          lh('button', { type: "button", id: "cat-" + kind + "-" + id + "-up", className: "btn bgb lc-btn", disabled: i === 0, onClick: function () { move(id, i - 1); } }, "Move " + n + " up"),
          lh('button', { type: "button", id: "cat-" + kind + "-" + id + "-down", className: "btn bgb lc-btn", disabled: last, onClick: function () { move(id, i + 1); } }, "Move " + n + " down"),
          id === "all" ? null : lh('label', { className: "lc-radio" + (st.hidden.indexOf(id) < 0 ? " on" : "") },
            lh('input', { type: "checkbox", id: "cat-" + kind + "-" + id + "-show", checked: st.hidden.indexOf(id) < 0, onChange: function () { toggle(id); } }), lh('span', null, "Show " + n))));
    })));
}
function MessageSettings({ navigate }) {
  useA11yNow();
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: "Message settings", onBack: function () { const b = Looscid.LC_SETTINGS_BACK; Looscid.LC_SETTINGS_BACK = null; navigate(b || "settings"); } }),
    lh('p', { className: "lc-desc", style: { padding: "0 16px" } }, "Who can message you. Private messages use Nostr (NIP-17): end-to-end encrypted, and only you and the person you write to can read them."),
    lh('section', { className: "lc-grp", "aria-labelledby": "ms-who-h" },
      lh('h2', { id: "ms-who-h", className: "lc-grp-h" }, "Who can message me"),
      lh(LcSetRow, { def: LC_SET_BY.whoMessage })),
    lh(LcResetLast, { scope: "g:cats" }));
}
function NotificationsSettings({navigate}) {
  // Round 6: only alert types that really fire, each with on/off, sound and who can trigger it.
  // Stored in looscid_alert_prefs. Quiet hours are the real ones (Sounds and announcements obey them).
  useA11yNow();
  const [P, setP] = useState(lcAlertPrefs());
  useEffect(function () { const f = function () { setP(lcAlertPrefs()); }; window.addEventListener("looscid:alerts", f); return function () { window.removeEventListener("looscid:alerts", f); }; }, []);
  const setT = function (type, set) { setP(lcAlertPrefsSet({ type: type, set: set })); };
  const unread = lcAlerts().filter(function (x) { return x.unread; }).length;
  return (
    React.createElement('div', { className: "pg lc-a11y", "aria-live": "off" }
      , React.createElement(BackHeader, { title: "Alerts", onBack: ()=>{ const b = Looscid.LC_SETTINGS_BACK; Looscid.LC_SETTINGS_BACK = null; navigate(b || "settings"); },})
      , lh('p', { className: "lc-desc", style: { padding: "0 16px" } }, "Which alerts you get, whether they make a sound, and who can trigger them. Saved on this device.")
      , LC_ALERT_TYPES.map(function (t) {
          const tp = P.types[t.id];
          return lh('section', { key: t.id, className: "lc-grp", "aria-labelledby": "al-" + t.id + "-h", id: "al-" + t.id },
            lh('h2', { id: "al-" + t.id + "-h", className: "lc-grp-h", tabIndex: -1 }, t.l),
            lh(A11ySwitch, { id: "al-" + t.id + "-on", label: t.l + " alerts", on: !!tp.on, onToggle: function () { setT(t.id, { on: !tp.on }); announce(t.l + " alerts " + (!tp.on ? "on" : "off") + "."); } }),
            lh(A11ySwitch, { id: "al-" + t.id + "-sound", label: "Sound for " + t.l, on: !!tp.sound, locked: !tp.on, onToggle: function () { setT(t.id, { sound: !tp.sound }); announce("Sound for " + t.l + " " + (!tp.sound ? "on" : "off") + "."); } }),
            t.aud ? lh(LcAudience, { id: "al-" + t.id + "-who", legend: "Who can trigger " + t.l + " alerts", value: tp.who, customKey: "alert_" + t.id, onChange: function (v) { setT(t.id, { who: v }); } }) : null);
        })
      , lh('section', { className: "lc-grp", "aria-labelledby": "al-more-h" },
          lh('h2', { id: "al-more-h", className: "lc-grp-h" }, "All alerts"),
          lh(A11ySwitch, { id: "al-group", label: "Group similar alerts", on: !!P.group, onToggle: function () { setP(lcAlertPrefsSet({ group: !P.group })); announce("Group similar alerts " + (!P.group ? "on" : "off") + "."); } }),
          lh('div', { className: "lc-row" }, lh('button', { type: "button", id: "al-markall", className: "btn bgb lc-big", onClick: function () { const n = lcAlertsMarkAll(); announce(n ? "All alerts marked as read." : "No alerts to mark."); setP(lcAlertPrefs()); } }, "Mark all as read" + (unread ? ", " + unread + " unread" : ""))))
      , lh(LcSection, { sec: "quiet", intro: lcQuietNow() ? "Quiet hours are on right now." : null, noReset: true })
      , lh(LcCatCustomize, { kind: "alert", defs: lcAlertCats(), title: "Customize Inbox tabs" })
      , lh(LcResetLast, { scope: "alerts" })
    )
  );
}
// Build 147 (2three1y, 9:44-9:48 PM): who sees your Liked tab. One "Show on my profile" box per Liked tab, all off.
function LcLikedPrivacy() {
  const [pub, setPub] = useState(lcLikedPublic);
  const tabs = (Looscid.LC_LIKED_TABS || []).filter(function (t) { return t.k !== "media"; }); // build 150: Media is a view of Dreams, not its own kind
  const flip = function (id, on) {
    const next = tabs.map(function (t) { return t.id; }).filter(function (x) { return x === id ? on : pub.indexOf(x) >= 0; });
    lcSetLikedPublic(next); setPub(next);
    const t = tabs.find(function (x) { return x.id === id; });
    announce("Liked " + (t ? t.label : id) + (on ? ": shown on your profile." : ": only you."));
  };
  return lh('div', { className: "lc-liked-priv" },
    lh('p', { className: "lc-intro" }, "Choose which parts of your Liked tab show on your profile. All of them are off, so only you can see them, until you turn one on."),
    lh('p', { className: "lc-intro" }, "Even when off, people can see your likes on their own Dreams."),
    lh('fieldset', { className: "lc-fs" },
      lh('legend', null, "Liked tab"),
      tabs.map(function (t) {
        return lh('div', { key: t.id, className: "lc-liked-priv-row" },
          lh('h3', { className: "lc-sub-h", id: "priv-liked-h-" + t.id }, t.label),
          lh('label', { className: "lc-radio", htmlFor: "priv-liked-" + t.id },
            lh('input', { type: "checkbox", id: "priv-liked-" + t.id, checked: pub.indexOf(t.id) >= 0, "aria-labelledby": "priv-liked-l-" + t.id + " priv-liked-h-" + t.id, onChange: function (e) { flip(t.id, e.target.checked); } }),
            lh('span', { id: "priv-liked-l-" + t.id }, " Show on my profile")));
      })));
}
function PrivacySettings({navigate, authUser, onUpdateProfile}) {
  useA11yNow(); useBlocked();
  const priv = !!(authUser && authUser.private);
  Looscid.LC_FORCED = priv ? { whoSee: "followers", whoFollow: "approve" } : {};
  // Round 6: an accordion. Disclosure buttons (aria-expanded); one section open at a time.
  const rd = function (k, d) { try { return sessionStorage.getItem(k) || d; } catch (e) { return d; } };
  const [open, setOpen] = useState(function () { const v = rd("looscid_priv_open", "perm"); return v === "none" ? "" : v; });
  useEffect(function () {
    const f = function (e) { setOpen(e.detail); };
    window.addEventListener("looscid:privopen", f); return function () { window.removeEventListener("looscid:privopen", f); };
  }, []);
  const toggle = function (id) { const v = open === id ? "" : id; setOpen(v); try { sessionStorage.setItem("looscid_priv_open", v || "none"); } catch (e) {} };
  // Private account forces "Who can see my Dreams" to Followers and "Who can follow me" to Approve requests.
  const privSwitch = lh('div', { style: { padding: "0 0 6px" } }, lh(A11ySwitch, { id: "set-privateAccount", label: "Private account", on: priv,
    onToggle: function () { if (onUpdateProfile) onUpdateProfile({ private: !priv }); announce(priv ? "Private account off." : "Private account on."); } }));
  const SECS = [
    ["perm", "Permissions", function () { return lh(LcSection, { sec: "perm", bare: true, labelledBy: "priv-acc-perm", noReset: true, before: privSwitch,
      intro: priv ? "Private account is on, so Who can see my Dreams counts as Followers and Who can follow me as Approve requests." : "Who can see, reply to and message you. Saved on this device and sent with your Dreams as your preferences. Looscid is decentralized, so other apps on the same networks decide whether they follow them." }); }],
    ["blocked", "Blocked and muted", function () { return lh(LcBlockedPanel, null); }],
    ["pmedia", "Media and content", function () { return lh(LcPrivacyMedia, { navigate: navigate }); }],
    ["pliked", "Liked tab", function () { return lh(LcLikedPrivacy, null); }],
  ];
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: "Privacy", onBack: function () { navigate("settings"); } }),
    lh('p', { className: "lc-intro" }, "Choose a section. Everything here is saved on this device."),
    lh('div', { className: "lc-acc" }, SECS.map(function (s) {
      const on = open === s[0];
      return lh('div', { key: s[0], className: "lc-acc-item" },
        lh('h2', { className: "lc-acc-h" },
          lh('button', { type: "button", id: "priv-acc-" + s[0], className: "lc-acc-btn", "aria-expanded": on ? "true" : "false", "aria-controls": "priv-acc-p-" + s[0], onClick: function () { toggle(s[0]); } },
            lh('span', null, s[1]), lh('span', { className: "msec-toggle-ic" + (on ? " open" : ""), "aria-hidden": "true" }, "\u203a"))),
        lh('div', { id: "priv-acc-p-" + s[0], className: "lc-acc-p", hidden: !on }, on ? s[2]() : null));
    })),
    lh(LcResetLast, { scope: "privacy" }));
}
// The one Reset button at the end of a settings page.
function LcResetLast({ scope }) {
  return lh('div', { className: "lc-grp lc-reset-last" }, lh('button', { type: "button", id: "lc-reset-btn", className: "btn bgb lc-big lc-reset", onClick: function () { lcOpenReset(scope); } }, "Reset"));
}
// A small native tablist (arrow keys, Home and End move between tabs).
function LcTabs({ id, label, tabs, cur, onPick }) {
  const keys = function (e, i) {
    let j = null; if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % tabs.length; else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + tabs.length) % tabs.length; else if (e.key === "Home") j = 0; else if (e.key === "End") j = tabs.length - 1;
    if (j === null) return; e.preventDefault(); onPick(tabs[j][0]); setTimeout(function () { const b = document.getElementById(id + "-tab-" + tabs[j][0]); if (b) b.focus(); }, 0);
  };
  return lh(React.Fragment, null,
    lh('div', { role: "tablist", "aria-label": label, className: "lc-stabs" }, tabs.map(function (t, i) {
      const on = cur === t[0];
      return lh('button', { key: t[0], type: "button", role: "tab", id: id + "-tab-" + t[0], className: "lc-stab" + (on ? " on" : ""), "aria-selected": on ? "true" : "false", "aria-controls": id + "-panel-" + t[0], tabIndex: on ? 0 : -1,
        onClick: function () { onPick(t[0]); }, onKeyDown: function (e) { keys(e, i); } }, t[1]);
    })),
    tabs.map(function (t) { return cur === t[0] ? lh('div', { key: t[0], role: "tabpanel", id: id + "-panel-" + t[0], "aria-labelledby": id + "-tab-" + t[0], className: "lc-tabpanel" }, t[2]()) : null; }));
}
// Privacy > Blocked and muted: Dreamors / Circles / Words.
function LcBlockedPanel() {
  useBlocked();
  const [tab, setTab] = useState(function () { try { return sessionStorage.getItem("looscid_priv_tab") || "dreamers"; } catch (e) { return "dreamers"; } });
  useEffect(function () { const f = function (e) { setTab(e.detail); }; window.addEventListener("looscid:privtab", f); return function () { window.removeEventListener("looscid:privtab", f); }; }, []);
  const pick = function (t) { setTab(t); try { sessionStorage.setItem("looscid_priv_tab", t); } catch (e) {} };
  const [hIn, setHIn] = useState(""), [wIn, setWIn] = useState("");
  const addList = function (kind, raw, clear, say) {
    const v = kind === "dreamers" ? lcHandle(raw) : String(raw || "").trim().toLowerCase();
    if (!v) { announce(kind === "dreamers" ? "Type a handle first." : "Type a word first."); return; }
    const cur = lcBlocked(kind); if (cur.indexOf(v) >= 0) { announce(say(v) + " is already blocked."); return; }
    lcBlockedSet(kind, cur.concat([v])); clear(""); announce("Blocked " + say(v) + ".");
  };
  const listOf = function (kind, label, say) {
    const l = lcBlocked(kind);
    return l.length ? lh('ul', { className: "lc-aud-list", "aria-label": label }, l.map(function (x) {
      return lh('li', { key: x }, lh('span', null, say(x)), lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { lcBlockedSet(kind, lcBlocked(kind).filter(function (y) { return y !== x; })); announce("Unblocked " + say(x) + "."); } }, "Unblock " + say(x)));
    })) : lh('p', { className: "lc-desc" }, "Nothing blocked yet.");
  };
  const at = function (x) { return "@" + x; }, qt = function (x) { return "\u201c" + x + "\u201d"; };
  const circles = (Looscid.LC_GROUPS_NOW && Looscid.LC_GROUPS_NOW.length ? Looscid.LC_GROUPS_NOW : (typeof GROUPS !== "undefined" ? GROUPS : [])) || [];
  const bc = lcBlocked("circles");
  return lh('div', { className: "lc-grp" },
    lh('p', { className: "lc-desc lc-sec-d" }, "Blocked Dreamors and Circles disappear from your feeds, replies, messages and alerts. Blocked words hide anything that contains them, everywhere in Looscid."),
    lh(LcTabs, { id: "priv-bl", label: "Blocked and muted", cur: tab, onPick: pick, tabs: [
      ["dreamers", "Dreamors", function () { return lh(React.Fragment, null,
        lh('label', { htmlFor: "priv-bl-dreamers-in", className: "lc-fs-l", style: { display: "block" } }, "Block a Dreamor by handle"),
        lh('div', { className: "lc-inrow" },
          lh('input', { id: "priv-bl-dreamers-in", type: "text", className: "lc-text", value: hIn, placeholder: "@handle", autoCapitalize: "off", autoCorrect: "off", spellCheck: false,
            onChange: function (e) { setHIn(e.target.value); }, onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); addList("dreamers", hIn, setHIn, at); } } }),
          lh('button', { type: "button", className: "btn bp lc-btn", id: "priv-bl-dreamers-add", onClick: function () { addList("dreamers", hIn, setHIn, at); } }, "Block")),
        listOf("dreamers", "Blocked Dreamors", at)); }],
      ["circles", "Circles", function () { return circles.length ? lh('fieldset', { className: "lc-fs", id: "priv-bl-circles" },
        lh('legend', { className: "lc-fs-l" }, "Blocked Circles"),
        lh('div', { className: "lc-radios lc-radios-col" }, circles.map(function (g) {
          const on = bc.indexOf(String(g.id)) >= 0;
          return lh('label', { key: g.id, className: "lc-radio" + (on ? " on" : "") },
            lh('input', { type: "checkbox", checked: on, onChange: function () { lcBlockedSet("circles", on ? bc.filter(function (y) { return y !== String(g.id); }) : bc.concat([String(g.id)])); announce((on ? "Unblocked " : "Blocked ") + g.name + "."); } }),
            lh('span', null, g.name));
        }))) : lh('p', { className: "lc-desc" }, "You have no Circles yet."); }],
      ["words", "Words", function () { return lh(React.Fragment, null,
        lh('h3', { className: "lc-sub-h" }, "Blocked words"),
        lh('p', { className: "lc-desc" }, "Hidden everywhere: Dreams, replies, messages, alerts, Discover, search and Commandbar. Each hidden item says Hidden: contains a blocked word, with a Show button."),
        lh('label', { htmlFor: "priv-bl-words-in", className: "lc-fs-l", style: { display: "block" } }, "Block a word"),
        lh('div', { className: "lc-inrow" },
          lh('input', { id: "priv-bl-words-in", type: "text", className: "lc-text", value: wIn, autoCapitalize: "off", spellCheck: false,
            onChange: function (e) { setWIn(e.target.value); }, onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); addList("words", wIn, setWIn, qt); } } }),
          lh('button', { type: "button", className: "btn bp lc-btn", id: "priv-bl-words-add", onClick: function () { addList("words", wIn, setWIn, qt); } }, "Block")),
        listOf("words", "Blocked words", qt),
        lh(LcSection, { sec: "filters", level: 3, noReset: true, intro: "Muted words hide Dreams from your feeds and alerts. Content warnings fold a Dream behind a Show button." })); }],
    ] }));
}
// Privacy > Media and content.
function LcPrivacyMedia({ navigate }) {
  const row = function (k) { return lh(LcSetRow, { key: k, def: LC_SET_BY[k] }); };
  return lh('section', { className: "lc-grp", id: "lcs-pmedia", "aria-labelledby": "priv-acc-pmedia" },
    lh('h3', { className: "lc-sub-h" }, "Saving and resharing"),
    row("mediaSave"), row("whoRedream"), row("whoQuote"),
    lh('h3', { className: "lc-sub-h" }, "Screenshots and blur"),
    lh('p', { className: "lc-desc" }, "The web can't block screenshots. This only asks people not to take them, and apps that respect the request show it next to your media."),
    row("screenshotAsk"),
    lh('p', { className: "lc-desc" }, "Blur is saved now and applies when sharing is live: people outside the audience you chose see your images blurred."),
    row("blurOutside"),
    lh('h3', { className: "lc-sub-h" }, "Photo details"),
    lh('p', { className: "lc-desc" }, "Photos can carry where they were taken and which camera took them. On by default: when you add a photo, Looscid redraws it without those details before it is attached."),
    row("stripExif"),
    lh('h3', { className: "lc-sub-h" }, "Cherry and your media"),
    lcAiOn() ? lh('p', { className: "lc-desc" }, "All off until you turn them on. Cherry runs on this device and never sends your media anywhere.")
      : lh(React.Fragment, null, lh('p', { className: "lc-desc" }, "Cherry is off, so these stay off."),
        lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { navigate("settings_ai_cherry"); } }, "Turn on Cherry in Intelligence")),
    row("cherryMediaLook"), row("cherryMediaAlt"), row("cherryMediaRemember"),
    lh('button', { type: "button", id: "priv-cherry-forget", className: "btn bgb lc-big", onClick: function () {
      try { localStorage.removeItem("looscid_cherry_media"); } catch (e) {}
      lcSet({ cherryMediaLook: false, cherryMediaAlt: false, cherryMediaRemember: false });
      announce("Cherry forgot your media, and its media permissions are off."); } }, "Forget what Cherry knows about my media"));
}
// Settings > Customizability > Feeds > Feed switching (Tabs / Swipe / Pop-up button). Stored with the accessibility prefs.
function FeedSwitchSetting({ prefs, setPrefs }) {
  const cur = lcFeedMode(((prefs && prefs.accessibility) || {}).feedSwitch);
  const set = function (v) { setPrefs(function (p) { const acc = Object.assign({}, A11Y_DEFAULTS, p.accessibility || {}, { feedSwitch: v }); Looscid.A11Y_NOW = acc; return Object.assign({}, p, { accessibility: acc }); }); announce("Feed switching: " + LC_FEED_MODES.find(function (x) { return x[0] === v; })[1] + "."); };
  return lh('fieldset', { className: "lc-fs" },
    lh('legend', { className: "lc-fs-l" }, "Feed switching"),
    lh('div', { className: "lc-radios lc-radios-col" }, LC_FEED_MODES.map(function (o) {
      const on = cur === o[0];
      return lh('label', { key: o[0], className: "lc-radio" + (on ? " on" : "") },
        lh('input', { type: "radio", name: "lc-feedswitch", value: o[0], checked: on, onChange: function () { set(o[0]); } }),
        lh('span', { className: "lc-q-txt" }, lh('span', { className: "lc-q-l" }, o[1]), lh('span', { className: "lc-q-s" }, o[2])));
    })));
}
/* --- Category menus (round 5) ------------------------------------------------
   Big settings screens are a short list of categories; each opens its own page with
   Back and an h1. Back returns to the list, on the category it came from. */
const LC_CATMENU_RESET = { "lc-cz-cats": "customizability", "lc-ai-cats": "intelligence", "lc-audio-cats": "sounds" };
Looscid.LC_CATMENU_RESET = LC_CATMENU_RESET;
function LcCatMenu({ id, title, intro, cats, navigate, after, reset }) {
  useEffect(function () {
    let from = null; try { from = sessionStorage.getItem("looscid_cat_from_" + id); sessionStorage.removeItem("looscid_cat_from_" + id); } catch (e) {}
    if (from) setTimeout(function () { const b = document.getElementById(id + "-" + from); if (b) b.focus(); }, 90);
  }, []);
  return lh('div', { className: "pg lc-a11y" },
    lh(BackHeader, { title: title, onBack: function () { navigate("settings"); } }),
    intro ? lh('p', { className: "lc-intro" }, intro) : null,
    lcMenuList(id, title + " categories", cats.map(function (c) {
      return { id: c.id, l: c.l, sub: c.sub, a: function () { try { sessionStorage.setItem("looscid_cat_from_" + id, c.id); } catch (e) {} navigate(c.page); } };
    }).concat(reset !== false && (reset || LC_CATMENU_RESET[id]) ? [{ id: "reset", l: "Reset", a: function () { lcOpenReset(reset || LC_CATMENU_RESET[id]); } }] : [])),
    after || null);
}
function LcCatPage({ title, intro, navigate, children, reset }) {
  return lh('div', { className: "pg lc-a11y" },
    lh(BackHeader, { title: title, onBack: function () { navigate("settings"); } }),
    intro ? lh('p', { className: "lc-intro" }, intro) : null,
    lh('div', { className: "lc-catbody" }, children),
    reset ? lh(LcResetLast, { scope: reset }) : null);
}
const LC_CZ_CATS = [
  { id: "theme", page: "settings_cz_theme", l: "Theme and colors", sub: "Light or dark mode" },
  { id: "feeds", page: "settings_cz_feeds", l: "Feeds and home", sub: "How you switch feeds, calm feed" },
  { id: "menu", page: "settings_cz_menu", l: "Menu", sub: "Where the menu button sits, its Close buttons" },
  { id: "posting", page: "settings_cz_posting", l: "Dreaming", sub: "Character limit, undo send, alt text reminder, drafts" },
  { id: "media", page: "settings_cz_media", l: "Media and translation", sub: "Auto-play, translate Dreams" },
];
Looscid.LC_CZ_CATS = LC_CZ_CATS;
function CustomizabilitySettings({navigate, prefs, setPrefs, theme, setTheme, page}) {
  const limits = [140,280,500,1000];
  const mp = prefs.menu || {};
  const menuPos = mp.pos || "bottom";
  const hideTopClose = !!mp.hideTopClose;
  const hideBotClose = !!mp.hideBotClose;
  const setMenu = (k,v) => setPrefs(p=>({...p,menu:{...(p.menu||{}),pos:mp.pos||"bottom",hideTopClose:!!mp.hideTopClose,hideBotClose:!!mp.hideBotClose,[k]:v}}));
  const cat = LC_CZ_CATS.find(function (c) { return c.page === page; });
  if (!cat) return lh(LcCatMenu, { id: "lc-cz-cats", title: "Customizability", intro: "Choose a category. Earcons are in Settings, Earcons. Cherry and AI are in Settings, Intelligence.", cats: LC_CZ_CATS, navigate: navigate });
  const radios = function (name, legend, opts, cur, onPick, fid) {
    return lh('fieldset', { className: "lc-fs", id: fid },
      lh('legend', { className: "lc-fs-l" }, legend),
      lh('div', { className: "lc-radios" }, opts.map(function (o) {
        return lh('label', { key: o[0], className: "lc-radio" + (cur === o[0] ? " on" : "") },
          lh('input', { type: "radio", name: name, checked: cur === o[0], onChange: function () { onPick(o[0]); announce(legend + ": " + o[1] + "."); } }), lh('span', null, o[1]));
      })));
  };
  let body;
  if (cat.id === "theme") body = lh(A11ySwitch, { id: "cz-theme", label: "Light mode", desc: "Off: dark mode. Saved on this device.", on: theme === "light", onToggle: () => setTheme && setTheme(theme === "light" ? "dark" : "light") });
  else if (cat.id === "feeds") body = lh(React.Fragment, null, lh(FeedSwitchSetting, { prefs: prefs, setPrefs: setPrefs }), lh(LcSetRow, { def: LC_SET_BY.calmFeed }), lh(LcResetBtn, { sec: "feeds" }));
  else if (cat.id === "menu") body = lh(React.Fragment, null,
    radios("cz-menupos", "Menu button position", [["bottom", "Bottom (default)"], ["top", "Top, for one-handed use"]], menuPos, function (v) { setMenu("pos", v); }, "cz-menupos"),
    lh(A11ySwitch, { id: "cz-topclose", label: "Close button at the top of the menu", desc: hideBotClose ? "Stays on: the bottom Close button is off, and one must stay." : "Shown at the top of the menu sheet.", on: !hideTopClose, locked: hideBotClose && !hideTopClose,
      onToggle: function () { if (!hideTopClose && hideBotClose) return; setMenu("hideTopClose", !hideTopClose); } }),
    lh(A11ySwitch, { id: "cz-botclose", label: "Close button at the bottom of the menu", desc: hideTopClose ? "Stays on: the top Close button is off, and one must stay." : "Shown at the bottom of the menu sheet.", on: !hideBotClose, locked: hideTopClose && !hideBotClose,
      onToggle: function () { if (!hideBotClose && hideTopClose) return; setMenu("hideBotClose", !hideBotClose); } }));
  else if (cat.id === "posting") body = lh(React.Fragment, null,
    lh(A11ySwitch, { id: "cz-charlimit", label: "Character limit", desc: "Limits how long your Dreams can be while you write.", on: !!prefs.charLimitEnabled, onToggle: function () { setPrefs(function (p) { return Object.assign({}, p, { charLimitEnabled: !p.charLimitEnabled }); }); } }),
    prefs.charLimitEnabled ? radios("cz-limit", "Limit", limits.map(function (n) { return [n, n + " characters"]; }), prefs.charLimit, function (n) { setPrefs(function (p) { return Object.assign({}, p, { charLimit: n }); }); }, "cz-limit") : null,
    lh(LcSection, { sec: "posting", title: "Composer" }));
  else body = lh(LcSection, { sec: "media", title: "Media and translation" });
  return lh(LcCatPage, { title: cat.l, navigate: navigate, reset: "g:" + cat.id }, body);
}
function lcSetAiPref(patch) { setAIPrefs(Object.assign({}, getAIPrefs(), patch)); try { window.dispatchEvent(new CustomEvent("looscid:llm")); } catch (e) {} }
const LC_AI_CATS = [
  { id: "cherry", page: "settings_ai_cherry", l: "Cherry", sub: "Turn Cherry on or off, learning from your habits, privacy" },
  { id: "model", page: "settings_ai_model", l: "Cherry model", sub: "Built-in, or an on-device model you download once" },
  { id: "cmd", page: "settings_ai_cmd", l: "Commandbar", sub: "Cherry's answers when a command doesn't match" },
  // Build 150 (#66): Cherry's memory, tools and audit. Feed algorithm settings are not here: they are in Feeds.
  { id: "memory", page: "settings_ai_memory", l: "Memory", sub: "Saving chats in Your History, deleting them" },
  { id: "tools", page: "settings_ai_tools", l: "Tools", sub: "What Cherry is allowed to do for you" },
  { id: "audit", page: "settings_ai_audit", l: "What Cherry did", sub: "Everything Cherry did for you, with Undo" },
];
Looscid.LC_AI_CATS = LC_AI_CATS;
function IntelligenceSettings({ navigate, page, prefs, setPrefs, cherryCtx }) {
  const [, tick] = useState(0);
  const [askDel, setAskDel] = useState(false);
  useEffect(function () { const f = function () { tick(function (x) { return x + 1; }); }; window.addEventListener("looscid:llm", f); return function () { window.removeEventListener("looscid:llm", f); }; }, []);
  const ap = getAIPrefs();
  const cat = LC_AI_CATS.find(function (c) { return c.page === page; });
  if (!cat) return lh(LcCatMenu, { id: "lc-ai-cats", title: "Intelligence", navigate: navigate, cats: LC_AI_CATS,
    intro: "Cherry is Looscid's assistant. It is off until you turn it on, and it runs on this device: nothing you type is sent anywhere. Cherry is " + (lcAiOn() ? "on." : "off.") });
  let body;
  if (cat.id === "cherry") {
    const cs = prefs.cherry || {};
    body = lh(React.Fragment, null,
      lh(A11ySwitch, { id: "ai-on", label: "Cherry", desc: "Off by default. On: the Cherry button appears on Home and in the menu, and Cherry chat opens. Off: Cherry chat is hidden.", on: lcAiOn(),
        onToggle: function () { const v = !lcAiOn(); lcSetAiPref({ enabled: v }); announce("Cherry is now " + (v ? "on" : "off") + "."); } }),
      lh(A11ySwitch, { id: "ai-habits", label: "Learn from my habits", desc: "Cherry notices when you usually Dream or read and offers a tip now and then. Kept only on this device.", on: cs.habitLearning !== false,
        onToggle: function () { setPrefs(function (p) { const c = Object.assign({}, p.cherry || {}); c.habitLearning = !(c.habitLearning !== false); return Object.assign({}, p, { cherry: c }); }); } }),
      lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { try { localStorage.removeItem("looscid_habits"); } catch (e) {} announce("Learned habits cleared."); } }, "Clear learned habits"),
      lh(LcSetRow, { def: LC_SET_BY.cherryAloud }),
      lh('h2', { className: "lc-grp-h" }, "Privacy"),
      lh('ul', { className: "lc-desc", role: "list" },
        lh('li', null, "Cherry runs in this browser. Your Dreams, messages and questions are never sent to an AI company or a Looscid server."),
        lh('li', null, "An on-device model is downloaded only after you say yes, once, from Hugging Face. After that Cherry works offline."),
        lh('li', null, "Turning Cherry off hides it everywhere. Your downloaded model stays in the browser until you clear site data.")));
  } else if (cat.id === "model") {
    body = lh(React.Fragment, null,
      lh(Looscid.CherryModelPicker, null),
      lh('p', { className: "lc-desc" }, "On-device models need WebGPU: Safari 26 on iPhone, or a recent Chrome or Edge. Sizes are the download size. Cherry built-in needs no download."),
      lcAiOn() ? null : lh('p', { className: "lc-desc" }, "Cherry is off, so the model is only used after you turn Cherry on in Intelligence, Cherry."));
  } else if (cat.id === "memory") {
    const chats = Looscid.lcCherryChats(), pins = chats.filter(function (c) { return c.pinned; }).length;
    const keep = getAIPrefs().keepChats !== false;
    body = lh(React.Fragment, null,
      lh(A11ySwitch, { id: "ai-keep", label: "Save chats in Your History", desc: "On: your chats with Cherry are kept on this device, in Your History and in Settings backup. Off: new chats are not kept after you leave them.", on: keep,
        onToggle: function () { const v = !(getAIPrefs().keepChats !== false); lcSetAiPref({ keepChats: v }); announce("Save chats in Your History: " + (v ? "on" : "off") + "."); } }),
      lh('p', { className: "lc-desc", id: "ai-mem-count" }, chats.length ? chats.length + (chats.length === 1 ? " chat" : " chats") + " saved on this device" + (pins ? ", " + pins + " pinned." : ".") : "No chats saved on this device."),
      lh('button', { type: "button", id: "ai-mem-del", className: "btn bgb lc-big", disabled: !chats.length, onClick: function () { setAskDel(true); } }, "Delete all chats"),
      lh('p', { className: "lc-desc" }, "Cherry keeps nothing else about you. Learned habits are in Intelligence, Cherry, and media memory is in Privacy, Media and content."),
      askDel ? lh(AlertDialog, { title: "Delete all chats?", message: "This deletes all " + chats.length + (chats.length === 1 ? " chat" : " chats") + " with Cherry from this device, pinned ones too. It can't be undone.", confirmLabel: "Delete all",
        onCancel: function () { setAskDel(false); },
        onConfirm: function () {
          const n = chats.length;
          try { localStorage.removeItem(Looscid.LC_CHERRY_CHATS_KEY); } catch (e) {}
          if (Looscid.lcCherryStartNew) Looscid.lcCherryStartNew();
          setAskDel(false); tick(function (x) { return x + 1; });
          announce("Deleted " + n + (n === 1 ? " chat." : " chats."));
          setTimeout(function () { const b = document.getElementById("ai-keep"); if (b) b.focus(); }, 0);
        } }) : null);
  } else if (cat.id === "tools") {
    const tools = Looscid.LC_CHERRY_TOOLS || [];
    body = lh(React.Fragment, null,
      lh('fieldset', { className: "lc-fs lc-ai-tools", id: "ai-tools" },
        lh('legend', { className: "lc-fs-l" }, "Cherry can"),
        lh('div', { className: "lc-radios" }, tools.map(function (t) {
          const on = Looscid.lcCherryToolOn(t[0]);
          return lh('label', { key: t[0], className: "lc-radio" + (on ? " on" : ""), htmlFor: "ai-tool-" + t[0] },
            lh('input', { type: "checkbox", id: "ai-tool-" + t[0], checked: on, onChange: function (e) {
              const next = Object.assign({}, getAIPrefs().tools || {}); next[t[0]] = e.target.checked; lcSetAiPref({ tools: next });
              announce(t[1] + (e.target.checked ? ": on." : ": off."));
            } }), lh('span', null, t[1]));
        }))),
      lh('p', { className: "lc-desc" }, "When a tool is off and you ask for it, Cherry tells you and changes nothing. Publishing a Dream always waits for you to press Publish this Dream, unless you asked Cherry to publish it."));
  } else if (cat.id === "audit") {
    const log = (cherryCtx && cherryCtx.cherryLog) || [];
    const undone = (Looscid.LC_CHERRY && Looscid.LC_CHERRY.undone) || {};
    body = lh(React.Fragment, null,
      lh('p', { className: "lc-desc" }, "Everything Cherry did for you since you opened Looscid, newest first. Most of it can be undone."),
      log.length
        ? lh('ul', { className: "lc-cherry-list lc-ai-audit", "aria-label": "What Cherry did" },
            log.map(function (entry) {
              const was = entry.undone || undone[entry.id];
              return lh('li', { key: "a" + entry.id, className: "lc-cherry-item" },
                lh('p', { className: "lc-cherry-msg-t" }, Looscid.lcNameJoin(entry.text, new Date(entry.id).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), was ? "undone" : "")),
                entry.undoFn && !was ? lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () {
                  try { entry.undoFn(); } catch (e) {}
                  undone[entry.id] = true; tick(function (x) { return x + 1; });
                  announce("Undone: " + entry.text + ".");
                } }, "Undo " + entry.text) : null);
            }))
        : lh('p', { className: "lc-muted" }, "Nothing yet. Everything Cherry does for you is listed here."));
  } else {
    body = lh(React.Fragment, null,
      lh(A11ySwitch, { id: "ai-cmd", label: "Cherry answers in Commandbar", desc: "When what you type isn't a command, Cherry answers from Looscid's own built-in rules, in Commandbar. No model, nothing sent anywhere.", on: ap.cmdAnswers !== false,
        onToggle: function () { const v = !(getAIPrefs().cmdAnswers !== false); lcSetAiPref({ cmdAnswers: v }); announce("Cherry answers in Commandbar: " + (v ? "on" : "off") + "."); } }));
  }
  return lh(LcCatPage, { title: cat.l, navigate: navigate, reset: cat.id === "cherry" ? "g:ai,cherry" : "g:cherry" }, body);
}
// Round 6: Verbosity is a tab on Sense (General / Speech / Verbosity / Braille), not a page.
function lcMenuList(id, label, items) {
  // ul role=list > li > button first: VoiceOver says "button, 1 of 7" (round-5 queue item 3).
  const vb = lcVerb();
  return lh('ul', { className: "mlist lc-catlist", role: "list", "aria-label": label, id: id },
    items.map(function (it) {
      const sid = id + "-" + it.id + "-d";
      return lh('li', { key: it.id, className: "mli" },
        lh('button', { type: "button", id: id + "-" + it.id, className: "mitem lc-cat", onClick: it.a },
          // Round 6 (2three1y): VoiceOver says just "Privacy, button": the label only. Explanations live as
          // plain text under section headings, not on or after each button.
          lh('span', { className: "mitem-lbl" }, it.l),
          lh(Ic.Chv, { style: { width: 13, height: 13, color: "var(--tx3)", flexShrink: 0 }, "aria-hidden": "true" })));
    }));
}
// Round 6 (2three1y, 7:14 AM): no per-control explanation lines. Kept as a no-op so callers stay simple.
function lcSubLine() { return null; }
function AccessibilitySettings({ navigate, onAskDevice }) {
  useEffect(function () {
    let from = null; try { from = sessionStorage.getItem("looscid_a11y_from"); sessionStorage.removeItem("looscid_a11y_from"); } catch (e) {}
    if (from) setTimeout(function () { const b = document.getElementById("lc-a11y-cats-" + from); if (b) b.focus(); }, 90);
  }, []);
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: "Accessibility", onBack: function () { navigate("settings"); } }),
    lh('p', { className: "lc-intro" }, "Choose a category. Everything is saved on this device."),
    lcMenuList("lc-a11y-cats", "Accessibility categories", LC_A11Y_CATS.map(function (c) {
      return { id: c.id, l: c.l, sub: c.sub, a: function () { try { sessionStorage.setItem("looscid_a11y_from", c.id); } catch (e) {} navigate(c.page); } };
    }).concat([{ id: "reset", l: "Reset", a: function () { lcOpenReset("accessibility"); } }])),
    lh('div', { className: "lc-grp" },
      lh('button', { type: "button", className: "btn bgb lc-big", onClick: onAskDevice }, "Ask me again: How do you use your device?"),
      lh('p', { className: "lc-desc" }, "Tip: Find a setting, at the top of Settings, jumps straight to any option. Ctrl+K or Cmd+K opens Commandbar.")));
}
function A11yCategory({ page, navigate, prefs, setPrefs }) {
  const cat = LC_A11Y_PAGE[page];
  const a = Object.assign({}, A11Y_DEFAULTS, prefs.accessibility || {});
  const set = function (k, v) { setPrefs(function (p) { const acc = Object.assign({}, A11Y_DEFAULTS, p.accessibility || {}); acc[k] = v; Looscid.A11Y_NOW = acc; return Object.assign({}, p, { accessibility: acc }); }); };
  const sysRM = systemReducedMotion();
  const sw = function (k, label, desc) { return lh(A11ySwitch, { key: k, id: "a11y-" + k, label: label, desc: desc, on: !!a[k], onToggle: function () { set(k, !a[k]); } }); };
  const reset = function (sec) { return LC_SECTIONS[sec] ? lh(LcResetBtn, { key: "reset", sec: sec, label: LC_SECTIONS[sec].t }) : null; };
  const SIZES = ["Default", "Large", "Larger"];
  let body = null;
  if (cat.id === "sr") body = [lh(SrTabs, { key: "tabs" })];
  else if (cat.id === "vision") body = [
    lh('fieldset', { key: "ts", className: "lc-fs", id: "a11y-textSize" },
      lh('legend', { className: "lc-fs-l" }, "Text size"),
      lh('div', { className: "lc-radios" }, SIZES.map(function (s, i) {
        return lh('label', { key: s, className: "lc-radio" + (a.textSize === i ? " on" : "") },
          lh('input', { type: "radio", name: "lc-textsize", checked: a.textSize === i, onChange: function () { set("textSize", i); } }), lh('span', null, s));
      }))),
    sw("highContrast", "High contrast", "Brighter text and stronger borders."),
    sw("boldText", "Bold text", "Makes all text bold."),
    sw("dyslexiaFont", "Dyslexia-friendly spacing", "Wider letter and word spacing and taller lines."),
    reset("vision")];
  else if (cat.id === "hearing") body = [
    sw("captions", "Captions for audio", "Shows a short text caption, like [Alerts sound], at the top of the screen whenever Looscid plays a sound."),
    sw("visualCue", "Visual cue instead of sounds", "Swaps sounds for a soft glow around the edge of the screen, one gentle fade at most once a second. While Flash safety is on, a text caption is shown instead of the glow."),
    reset("hearing")];
  else if (cat.id === "motion") body = [
    sw("calmMode", "Calm mode", "On by default. Stops looping animations, makes sounds a little softer, and keeps visual cues gentle. Earcons keep their beeps and boops."),
    sw("flashSafety", "Flash safety", "On by default. Nothing on Looscid flashes, blinks or pulses: no glow cue (a text caption is shown instead) and no looping effects."),
    lh(A11ySwitch, { key: "reduceMotion", id: "a11y-reduceMotion", label: "Reduce Motion", on: !!a.reduceMotion || sysRM, locked: sysRM,
      onToggle: function () { set("reduceMotion", !a.reduceMotion); },
      desc: sysRM ? "Your device asks for reduced motion, so this stays on. Reduce Motion always wins." : "Turns off animations and transitions everywhere. Reduce Motion always wins over every other setting, Calm mode included." }),
    lh('p', { key: "flash", className: "lc-rule" }, lh('strong', null, "Three-flash limit: a hard rule, not a setting. "), "Even with Flash safety off, nothing in Looscid flashes more than three times in any one second (WCAG 2.3.1)."),
    reset("motion")];
  else if (cat.id === "motor") body = [
    sw("largeBtns", "Larger buttons", "Bigger tap targets across the app."),
    sw("switchAccess", "Strong focus outline", "A thick outline on whatever has focus, for keyboard and switch users."),
    reset("motor")];
  else if (cat.id === "terminal") body = [
    lh('fieldset', { key: "to", className: "lc-fs", id: "a11y-termOutput" },
      lh('legend', { className: "lc-fs-l" }, "Commandbar output"),
      lh('div', { className: "lc-radios lc-radios-col" }, [
        ["collapsible", "Collapsible section", "Past output sits under one heading with a button to fold it away."],
        ["expanded", "Always expanded", "No fold button. Every command keeps its own heading."],
        ["latest", "Latest only", "Shows only the newest result. Type output expand to see the history."],
      ].map(function (o) {
        return lh('label', { key: o[0], className: "lc-radio" + (a.termOutput === o[0] ? " on" : "") },
          lh('input', { type: "radio", name: "lc-termoutput", value: o[0], checked: a.termOutput === o[0], onChange: function () { set("termOutput", o[0]); } }),
          lh('span', { className: "lc-q-txt" }, lh('span', { className: "lc-q-l" }, o[1]), lh('span', { id: "lc-to-" + o[0], className: "lc-q-s" }, o[2])));
      }))),
    sw("termHeadings", "Heading per command", "Each command in Commandbar gets its own heading, so heading navigation jumps from one result to the next."),
    reset("terminal")];
  useEffect(function () {
    if (cat.id !== "sr") return;
    let from = null; try { from = sessionStorage.getItem("looscid_cat_from_lc-sr-more"); sessionStorage.removeItem("looscid_cat_from_lc-sr-more"); } catch (e) {}
    if (from) setTimeout(function () { const b = document.getElementById("lc-sr-more-" + from); if (b) b.focus(); }, 90);
  }, []);
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: cat.l, onBack: function () { if (cat.parent) { try { sessionStorage.setItem("looscid_cat_from_lc-sr-more", cat.id); } catch (e) {} } navigate(cat.parent || "settings_accessibility"); } }),
    // Round 6: one line of plain text under the page heading (Sense has one per tab instead).
    cat.id !== "sr" && LC_SECTIONS[cat.id] && LC_SECTIONS[cat.id].d ? lh('p', { className: "lc-desc lc-sec-d", style: { padding: "0 16px" } }, LC_SECTIONS[cat.id].d) : null,
    lh('div', { className: "lc-grp lc-catpage" }, body),
    lh(LcResetLast, { scope: cat.id === "sr" ? "g:sr_general,sr_speech,verbosity,sr_braille" : "g:" + cat.id }));
}
function AboutSettings({navigate}) {
  const link = function (href, text) { return lh('li', { key: href }, lh('a', { href: href, target: "_blank", rel: "noopener noreferrer" }, text)); };
  const [vOpen, setVOpen] = useState(false);
  const [, tick] = useState(0);
  const auto = lcUpdateAuto();
  const rel = lcReleasedText(LOOSCID_RELEASED);
  return lh('div', { className: "pg lc-about" },
    lh(BackHeader, { title: "About Looscid", onBack: function () { navigate("settings"); } }),
    // Round 6: one About page. The version is itself the disclosure button.
    lh('div', { className: "lc-about-top", style: { padding: "12px 16px 4px" } },
      lh('button', { type: "button", id: "about-version", className: "lc-acc-btn", "aria-expanded": vOpen ? "true" : "false", "aria-controls": "about-version-p", onClick: function () { setVOpen(!vOpen); } },
        lh('span', null, lcVersionLabel()), lh('span', { className: "msec-toggle-ic" + (vOpen ? " open" : ""), "aria-hidden": "true" }, "\u203a")),
      lh('div', { id: "about-version-p", hidden: !vOpen, className: "lc-acc-p" }, vOpen ? lh(React.Fragment, null,
        lh('p', { className: "lid-help" }, LOOSCID_FEATURE_BUILDS + " feature updates"),
        lh('p', { className: "lid-help" }, LOOSCID_FIXES + " fixes"),
        lh('p', { className: "lid-help" }, LOOSCID_BUILD + " builds, " + LOOSCID_FEATURE_BUILDS + " without fix updates"),
        rel ? lh('p', { className: "lid-help" }, "Released " + rel) : null,
        lh('h3', { id: "about-history-h", className: "lid-sub" }, "Version history"),
        lh('ul', { className: "lid-help lc-history", "aria-labelledby": "about-history-h", style: { paddingLeft: 22, margin: "6px 0" } }, LC_VERSION_HISTORY.map(function (v) {
          return lh('li', { key: v.build }, lh('p', { style: { margin: "4px 0", fontWeight: 700 } }, "Looscid " + v.version + " (" + v.build + "), " + v.title),
            lh('p', { style: { margin: "2px 0" } }, "Released " + lcReleasedText(v.released)),
            lh('ul', { style: { paddingLeft: 18 } }, v.notes.map(function (n, i) { return lh('li', { key: i }, n); })));
        }))) : null),
      lh('p', { className: "lid-help" }, LOOSCID_SLOGAN + "."),
      lh('button', { type: "button", id: "about-check", className: "btn bgb lc-big", style: { width: "100%", marginTop: 8 }, onClick: function () { lcCheckUpdate(true); } }, "Check for updates"),
      lh(A11ySwitch, { id: "about-autoupdate", label: "Automatically check for updates", on: auto, onToggle: function () { lcUpdateAutoSet(!auto); tick(function (x) { return x + 1; }); announce("Automatically check for updates: " + (!auto ? "on" : "off") + "."); } })),
    lh('section', { "aria-labelledby": "about-lead", style: { padding: "8px 16px 12px" } },
      lh('h2', { id: "about-lead", className: "lid-sub" }, "Looscid in short"),
      lh('p', { className: "lid-help" }, "Looscid is a decentralized, free and open source social app that works the way you do: with a screen reader, a braille display, a keyboard, a switch or just your thumbs. Your data stays on your device, and your LooscidID is yours."),
      // Round 6.6 (2three1y 5:24 and 5:25 PM): everything that was in More's About submenu is on this one page.
      // Terms, Privacy, Community rules and the license are under Legal.
      lh('ul', { className: "mlist", "aria-label": "Feedback, legal and the welcome intro" },
        [["feedback", "Send Feedback"], ["legal", "Legal"], ["intro", "Welcome intro"]].map(function (x) {
          return lh('li', { key: x[0], className: "mli" }, lh('button', { type: "button", id: "about-btn-" + x[0], className: "btn bgb lc-big", style: { width: "100%", marginTop: 8 }, onClick: function () { navigate(x[0]); } }, x[1]));
        }))),
    lh('section', { "aria-labelledby": "about-story", style: { padding: "8px 16px 12px" } },
      lh('h2', { id: "about-story", className: "lid-sub" }, "Our story"),
      lh('p', { className: "lid-help" }, "Looscid is my side project, not a company. I'm 2three1y, a blind developer, and I wanted a social app that works as well with a screen reader and a braille display as it does with eyes."),
      lh('p', { className: "lid-help" }, "So I build Looscid accessibility first: VoiceOver, TalkBack and NVDA, braille displays, keyboards and switches are tested from the start, sounds have captions, and nothing flashes."),
      lh('p', { className: "lid-help" }, "I paused development for a while. It's back on now, and I build in public, with Tab, my digital assistant, helping write and test the code.")),
    lh('section', { "aria-labelledby": "about-purpose", style: { padding: "0 16px 12px" } },
      lh('h2', { id: "about-purpose", className: "lid-sub" }, "What Looscid is"),
      lh('p', { className: "lid-help" }, "A decentralized, free, open source and accessible everything app. I made it to:"),
      lh('ol', { className: "lid-help", style: { paddingLeft: 22, margin: "6px 0" } },
        lh('li', null, "Give people a more decentralized experience, away from Big Tech."),
        lh('li', null, "Show that everything can be accessible for anyone."),
        lh('li', null, "Give you control and privacy.")),
      lh('p', { className: "lid-help" }, "Your LooscidID is made on this device the first time you open Looscid, with no phone number or email. Add login methods any time: Nostr, Mastodon and the fediverse, Bluesky, Funkwhale or Hubzilla. What I plan next is listed in Settings, Looscid Labs.")),
    lh(AboutLooscidMore, null),
    lh('section', { "aria-labelledby": "about-nexos", style: { padding: "0 16px 12px" } },
      lh('h2', { id: "about-nexos", className: "lid-sub" }, "Looscid OS"),
      lh('p', { className: "lid-help" }, "Looscid OS is the operating system side of Looscid: Insomnia, Memeprojects, Easyconvert, Desktop, Kernel, the Looscid terminal and the Looscid App Store. It started as NexOS, my operating system project, which keeps its own repository."),
      lh('ul', { className: "lid-help", style: { paddingLeft: 22, margin: "6px 0" } }, link("https://github.com/2three1y/nexos", "NexOS on GitHub")),
      lh('button', { type: "button", className: "btn bgb lc-big", style: { width: "100%", marginTop: 8 }, onClick: function () { navigate("nexos_apps"); } }, "Apps")),
    lh('section', { "aria-labelledby": "about-links", style: { padding: "0 16px 24px" } },
      lh('h2', { id: "about-links", className: "lid-sub" }, "Find Looscid"),
      lh('ul', { className: "lid-help", style: { paddingLeft: 22, margin: "6px 0" } },
        link("https://github.com/Looscid/Looscid", "Looscid on GitHub, the source code"),
        link("https://x.com/Looscid", "@Looscid on X"),
        link("https://github.com/Looscid/Looscid/blob/preview/docs/guides/ACCESSIBILITY.md", "Looscid's commitments: accessibility, fairness, humor")),
      lh('p', { className: "lid-help" }, "The welcome intro and terminology guide is the Welcome intro button above.")));
}
function MorePage({navigate, cherryCtx, authUser}) {
  const IS_ADMIN = true;
  const isGuest = !authUser || authUser.isGuest || authUser.uid==="guest";

  if (isGuest) return (
    React.createElement('div', {className:"pg"},
      React.createElement('div', {className:"hdr"},
        React.createElement('div', {style:{padding:"48px 16px 16px"}},
          React.createElement('h1', {className:"htit", tabIndex:-1}, "More")
        )
      ),
      React.createElement('div', {style:{padding:"24px 16px",display:"flex",flexDirection:"column",gap:12}},
        React.createElement('div', {style:{padding:"20px",background:"linear-gradient(135deg,rgba(109,40,217,.1),rgba(147,51,234,.05))",border:"1px solid rgba(168,85,247,.2)",borderRadius:16,textAlign:"center"}},
          React.createElement('div', {style:{fontSize:44,marginBottom:12}}, "Guest Mode"),
          React.createElement('div', {style:{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:20,marginBottom:8}}, "You are in Guest Mode"),
          React.createElement('p', {style:{fontSize:13,color:"var(--tx2)",lineHeight:1.7,marginBottom:20}}, "Create a free LooscidID to share Dreams, follow Dreamors, get notifications and make the app yours."),
          React.createElement('button', {className:"btn bp",style:{width:"100%",padding:13,fontSize:14,marginBottom:10},onClick:()=>navigate("login"),"aria-label":"Create a LooscidID"}, "Create a LooscidID"),
          React.createElement('button', {className:"btn bgb",style:{width:"100%",padding:11,fontSize:13},onClick:()=>navigate("login"),"aria-label":"Login to your LooscidID"}, "Login")
        ),
        React.createElement('button', {className:"snav",onClick:()=>navigate("settings_accessibility"),"aria-label":"Accessibility settings"},
          React.createElement('div', {className:"snav-l"},
            React.createElement('div', {className:"snav-ic",style:{background:"rgba(180,83,9,.15)",fontSize:17}}, "Accessibility"),
            React.createElement('div', null,
              React.createElement('div', {className:"snav-title"}, "Accessibility"),
              React.createElement('div', {className:"snav-sub"}, "Font size, contrast, motion")
            )
          ),
          React.createElement(Ic.Chv, {style:{width:16,height:16,color:"var(--tx3)"}})
        ),
        React.createElement('button', {className:"snav",onClick:()=>navigate("terms"),"aria-label":"Terms"},
          React.createElement('div', {className:"snav-l"},
            React.createElement('div', {className:"snav-ic",style:{background:"rgba(55,65,81,.15)",fontSize:17}}, "Terms"),
            React.createElement('div', null,
              React.createElement('div', {className:"snav-title"}, "Terms"),
              React.createElement('div', {className:"snav-sub"}, "Terms and privacy policy")
            )
          ),
          React.createElement(Ic.Chv, {style:{width:16,height:16,color:"var(--tx3)"}})
        )
      )
    )
  );

  return (
    React.createElement('div', { className: "pg",}
      , React.createElement('div', { className: "hdr",}
        , React.createElement('div', { style: {padding:"48px 16px 12px"},}, React.createElement('h1', { className: "htit", tabIndex:-1,}, "More"))
      )
      , React.createElement('div', { style: {padding:"12px 16px 0"},}
        , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:"1px solid var(--bd)",cursor:"pointer"}, role: "button", tabIndex: 0, onClick: ()=>navigate("profile"), 'aria-label': "View your profile"  ,}
          , React.createElement('div', { style: {position:"relative"},}
            , React.createElement(Av, { user: ME, size: 48,})
            , IS_ADMIN && React.createElement('div', { style: {position:"absolute",bottom:-2,right:-2,background:"linear-gradient(135deg,#f59e0b,#d97706)",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,border:"2px solid var(--bg)"},}, "★")
          )
          , React.createElement('div', { style: {flex:1},}
            , React.createElement('div', { style: {fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:6},}, ME.name, IS_ADMIN&&React.createElement('span', { style: {background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:100},}, "ADMIN"))
            , React.createElement('div', { style: {fontSize:12,color:"var(--tx3)"},}, ME.handle)
            , (!authUser || authUser.uid === "guest" || authUser.isGuest) && (
              React.createElement('div', { style: {fontSize:10,fontWeight:700,color:"var(--ac3)",background:"rgba(109,40,217,.15)",borderRadius:20,padding:"2px 8px",marginTop:3,display:"inline-block"},}, "GUEST MODE"

              )
            )
          )
          , React.createElement(Ic.Chv, { style: {width:16,height:16,color:"var(--tx3)"},})
        )
      )
      , React.createElement('div', { style: {marginTop:8},}
        , lh('ul', { className: "mlist more-items", role: "list", style: { listStyle: "none", margin: 0, padding: 0 } }, [
          {icon:"Cherry",l:"Cherry",sub:"Cherry - DO IT YOUR WAY",a:()=>navigate("cherry"),color:"#6d28d9"},
          {icon:"Drafts",l:"Drafts",sub:"Your saved Dream drafts",a:()=>navigate("drafts"),color:"#374151"},
          authUser && (authUser.isGuest || authUser.uid==="guest")
            ? {icon:"Login",l:"Login or create a LooscidID",sub:"Get a LooscidID",a:()=>navigate("login"),color:"#6d28d9"}
            : {icon:"LooscidID",l:"LooscidID",sub:"Profile, login methods and security",a:()=>navigate("settings_account"),color:"#6d28d9"},
          {icon:"Settings",l:"Settings",sub:"LooscidID, privacy, accessibility",a:()=>navigate("settings"),color:"#374151"},
          {icon:"Send Feedback",l:"Send Feedback",sub:"Help us improve Looscid",a:()=>navigate("feedback"),color:"#0e7490"},
        ].map(item => (
          // Part 32: each More item is one plain button in a list item; no heading role anywhere inside it.
          lh('li', { key: item.l },
          React.createElement('button', { className: "snav", type: "button", onClick: item.a, 'aria-label': item.l,}
            , React.createElement('div', { className: "snav-l",}
              , React.createElement('div', { className: "snav-ic", style: {background:item.color+"22",fontSize:17}, "aria-hidden": "true"}, item.icon)
              , React.createElement('div', null, React.createElement('div', { className: "snav-title",}, item.l), React.createElement('div', { className: "snav-sub",}, item.sub))
            )
            , React.createElement(Ic.Chv, { style: {width:16,height:16,color:"var(--tx3)"}, "aria-hidden": "true"})
          ))
        )))
        , lh(MoreAppsGroup, { navigate: navigate })
        , IS_ADMIN && React.createElement(React.Fragment, null
          , React.createElement('div', { style: {margin:"12px 16px 0",padding:"10px 14px",background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10},}
            , React.createElement('div', { style: {fontSize:10,fontWeight:800,color:"#f59e0b",textTransform:"uppercase",letterSpacing:".1em",marginBottom:2},}, "Admin Access" )
            , React.createElement('div', { style: {fontSize:12,color:"var(--tx3)"},}, "You have platform administrator privileges"    )
          )
          , React.createElement('button', { className: "snav", onClick: ()=>navigate("admin"), 'aria-label': "Admin Panel" , style: {borderTop:"1px solid rgba(245,158,11,.2)"},}
            , React.createElement('div', { className: "snav-l",}
              , React.createElement('div', { className: "snav-ic", style: {background:"rgba(245,158,11,.15)",fontSize:17},}, "Admin Panel")
              , React.createElement('div', null, React.createElement('div', { className: "snav-title", style: {color:"#f59e0b"},}, "Admin Panel" ), React.createElement('div', { className: "snav-sub",}, "Platform management & controls"   ))
            )
            , React.createElement(Ic.Chv, { style: {width:16,height:16,color:"#f59e0b"},})
          )
        )
      )
    )
  );
}
// More screen: Apps, in the same collapsible group as the main menu (msec-toggle disclosure). Round 6: was "NexOS features".
function MoreAppsGroup({ navigate }) {
  const [open, setOpen] = useState(false);
  const tRef = useRef(null);
  const onKey = function (e) { if (e.key === "Escape" && open) { e.preventDefault(); e.stopPropagation(); setOpen(false); if (tRef.current) tRef.current.focus(); } };
  return lh('div', { className: "more-apps", onKeyDown: onKey, style: { marginTop: 8 } },
    // Part 32 (2three1y, Oct 12: "Remove the headings on every button in the More tab"): the Apps toggle is a plain
    // button now, not a button inside a heading, so VoiceOver reads just "Apps, button, collapsed".
    lh('div', { className: "msec-hdr", style: { padding: 0 } },
      lh('button', { id: "more-apps-toggle", ref: tRef, type: "button", className: "msec-toggle", "aria-expanded": open ? "true" : "false", "aria-controls": "more-apps-body",
          onClick: function () { setOpen(!open); } },
        lh('span', { style: { display: "flex", alignItems: "center", gap: 7 } }, lh('span', null, "Apps")),
        lh('span', { className: "msec-toggle-ic" + (open ? " open" : ""), "aria-hidden": "true" }, "\u203a"))),
    lh('div', { id: "more-apps-body", className: "msec-body", hidden: !open },
      lh('ul', { className: "mlist", role: "list" }, lcAppItems().map(function (it) {
        return lh('li', { key: it.id, className: "mli" },
          lh('button', { id: "more-apps-" + it.id, type: "button", className: "mitem", onClick: function () { it.go(navigate); } },
            lh('span', { className: "mitem-lbl" }, it.l),
            lh(Ic.Chv, { style: { width: 13, height: 13, color: "var(--tx3)", flexShrink: 0 }, "aria-hidden": "true" })),
          lcSubLine("more-apps-" + it.id + "-d", it.sub),
          Looscid.LcLikeBtn ? lh(Looscid.LcLikeBtn, { k: "app", id: it.id, name: it.l, className: "btn bgb lc-btn lc-like-btn lc-mli-like" }) : null);
      }))));
}
function FeedbackPage({navigate}) {
  const [category, setCategory] = useState("general");
  const [txt, setTxt] = useState("");
  const cats = [
    {id:"general",name:"General feedback"},
    {id:"bug",name:"Bug report"},
    {id:"feature",name:"Feature request"},
    {id:"access",name:"Accessibility"},
  ];
  // Real, not a fake "received" screen: it opens a new GitHub issue on Looscid/Looscid with your words filled in.
  const url = function () { const c = cats.find(function (x) { return x.id === category; }).name; return "https://github.com/Looscid/Looscid/issues/new?title=" + encodeURIComponent(c + ": " + txt.trim().split("\n")[0].slice(0, 70)) + "&body=" + encodeURIComponent(txt.trim() + "\n\nLooscid " + LOOSCID_VERSION + ", " + lcBrowserName()); };
  return lh('div', { className: "pg" },
    lh(BackHeader, { title: "Send Feedback", onBack: function () { navigate("settings"); } }),
    lh('div', { style: { padding: "16px 16px 32px", display: "flex", flexDirection: "column", gap: 14 } },
      lh('p', { className: "lc-desc", style: { margin: 0 } }, "Feedback goes to Looscid's public GitHub page as a new issue, so everyone can follow it. GitHub asks you to log in there. You can also mention @Looscid on X."),
      lh(LcMenu, { id: "fb-cat", label: "Category", value: category, items: cats, onSelect: setCategory }),
      lh('label', { htmlFor: "fb-txt", className: "lmenu-label" }, "Your feedback"),
      lh('textarea', { id: "fb-txt", className: "inp", style: { minHeight: 140, lineHeight: 1.6, fontSize: 16 }, value: txt, onChange: function (e) { setTxt(e.target.value); } }),
      lh('button', { type: "button", className: "btn bp", style: { width: "100%", padding: 13, fontSize: 16 }, disabled: txt.trim().length < 5,
        onClick: function () { window.open(url(), "_blank", "noopener"); announce("Opened GitHub in a new tab with your feedback filled in."); } }, "Open it on GitHub")));
}
function AdminPanel({navigate}) {
  const [subpage, setSubpage] = useState(null);
  const [stats] = useState({users:24817,dreams:193442,groups:1204,reports:37,flagged:12,dau:8341,mau:19200,uptime:"99.97%"});

  if (subpage==="users") return React.createElement(AdminUsers, { onBack: ()=>setSubpage(null),});
  if (subpage==="content") return React.createElement(AdminContent, { onBack: ()=>setSubpage(null),});
  if (subpage==="reports") return React.createElement(AdminReports, { onBack: ()=>setSubpage(null),});
  if (subpage==="platform") return React.createElement(AdminPlatform, { onBack: ()=>setSubpage(null),});
  if (subpage==="analytics") return React.createElement(AdminAnalytics, { onBack: ()=>setSubpage(null), stats: stats,});
  if (subpage==="announcements") return React.createElement(AdminAnnouncements, { onBack: ()=>setSubpage(null),});

  return (
    React.createElement('div', { className: "pg",}
      , React.createElement('div', { className: "hdr",}
        , React.createElement('div', { className: "hdr-row",}
          , React.createElement('button', { className: "bi", onClick: ()=>navigate("more"), 'aria-label': "Back",}, React.createElement(Ic.Bck, { style: {width:21,height:21},}))
          , React.createElement('span', { className: "hdr-title", style: {color:"#f59e0b"},}, "Admin Panel"  )
          , React.createElement('div', { style: {fontSize:10,fontWeight:800,background:"rgba(245,158,11,.2)",color:"#f59e0b",padding:"3px 8px",borderRadius:100},}, "ADMIN")
        )
      )

      /* Platform health bar */
      , React.createElement('div', { style: {margin:"12px 14px",background:"var(--sf2)",border:"1px solid rgba(245,158,11,.2)",borderRadius:12,padding:14},}
        , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:"#f59e0b",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10},}, "Platform Health" )
        , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},}
          , [
            {l:"Total Dreamors",v:stats.users.toLocaleString()},
            {l:"Total Dreams",v:stats.dreams.toLocaleString()},
            {l:"Daily Active",v:stats.dau.toLocaleString()},
            {l:"Monthly Active",v:stats.mau.toLocaleString()},
            {l:"Groups",v:stats.groups.toLocaleString()},
            {l:"Uptime",v:stats.uptime,good:true},
          ].map(s => (
            React.createElement('div', { key: s.l, style: {background:"var(--sf3)",borderRadius:9,padding:"9px 11px"},}
              , React.createElement('div', { style: {fontSize:10,color:"var(--tx3)",marginBottom:3},}, s.l)
              , React.createElement('div', { style: {fontSize:16,fontWeight:800,color:s.good?"var(--gr)":"var(--tx)"},}, s.v)
            )
          ))
        )
        , (stats.reports>0||stats.flagged>0) && (
          React.createElement('div', { style: {marginTop:10,padding:"8px 10px",background:"rgba(248,113,113,.1)",borderRadius:8,display:"flex",gap:12,alignItems:"center"},}
            , React.createElement('span', { style: {fontSize:15},}, "⚠️")
            , React.createElement('div', { style: {fontSize:12,color:"var(--rd)"},}, React.createElement('strong', null, stats.reports), " pending reports, "    , React.createElement('strong', null, stats.flagged), " flagged items need review"    )
          )
        )
      )

      /* Admin nav sections */
      , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "Management")
      , [
        {id:"users",icon:"Dreamor Management",title:"Dreamor Management",sub:"Search, ban, verify, manage accounts",color:"#6d28d9",badge:0},
        {id:"content",icon:"Content Moderation",title:"Content Moderation",sub:"Review Dreams, replies, Groups",color:"#be185d",badge:stats.flagged},
        {id:"reports",icon:"Reports Queue",title:"Reports Queue",sub:"Handle reported content and users",color:"#dc2626",badge:stats.reports},
        {id:"announcements",icon:"Announcements",title:"Announcements",sub:"Share platform-wide announcements",color:"#0e7490",badge:0},
        {id:"analytics",icon:"Analytics",title:"Analytics",sub:"Deep platform metrics and trends",color:"#15803d",badge:0},
        {id:"platform",icon:"Platform Settings",title:"Platform Settings",sub:"Feature flags, limits, maintenance",color:"#374151",badge:0},
      ].map(item => (
        React.createElement('button', { key: item.id, className: "snav", onClick: ()=>setSubpage(item.id), 'aria-label': item.title,}
          , React.createElement('div', { className: "snav-l",}
            , React.createElement('div', { className: "snav-ic", style: {background:item.color+"22",fontSize:17,position:"relative"},}
              , item.icon
              , item.badge>0 && React.createElement('div', { style: {position:"absolute",top:-4,right:-4,background:"var(--rd)",color:"#fff",fontSize:8,fontWeight:800,borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid var(--bg)"},}, item.badge)
            )
            , React.createElement('div', null, React.createElement('div', { className: "snav-title",}, item.title), React.createElement('div', { className: "snav-sub",}, item.sub))
          )
          , React.createElement(Ic.Chv, { style: {width:16,height:16,color:"var(--tx3)"},})
        )
      ))
    )
  );
}
function AdminUsers({onBack}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [showBanModal, setShowBanModal] = useState(null);
  const [users, setUsers] = useState(USERS.map(u=>({...u,status:"active",verified:u.verified||false})));
  const filtered = users.filter(u=>(!q||(u.name+u.handle).toLowerCase().includes(q.toLowerCase()))&&(filter==="all"||filter===u.status));
  const banUser = id => setUsers(us=>us.map(u=>u.id===id?{...u,status:u.status==="banned"?"active":"banned"}:u));
  const verifyUser = id => setUsers(us=>us.map(u=>u.id===id?{...u,verified:!u.verified}:u));
  return (
    React.createElement('div', { className: "pg",}
      , React.createElement(BackHeader, { title: "Dreamor Management" , onBack: onBack,})
      , React.createElement('div', { style: {padding:"10px 14px 6px"},}
        , React.createElement('input', { className: "inp", style: {fontSize:14,marginBottom:8}, placeholder: "Search by name or LooscidID…"    , value: q, onChange: e=>setQ(e.target.value), 'aria-label': "Search users" ,})
        , React.createElement('div', { style: {display:"flex",gap:6,flexWrap:"wrap"},}
          , ["all","active","banned"].map(f=>(
            React.createElement('button', { key: f, className: "btn"+(filter===f?" bp":" bgb"), style: {padding:"5px 12px",fontSize:11,textTransform:"capitalize"}, onClick: ()=>setFilter(f), 'aria-label': "Filter "+f,}, f)
          ))
        )
      )
      , filtered.map(u=>(
        React.createElement('div', { key: u.id, style: {padding:"11px 14px",borderBottom:"1px solid var(--bd)",display:"flex",gap:10,alignItems:"center"},}
          , React.createElement('div', { style: {position:"relative",flexShrink:0},}
            , React.createElement(Av, { user: u, size: 40,})
            , u.verified&&React.createElement('div', { style: {position:"absolute",bottom:-2,right:-2,background:"var(--ac2)",borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,border:"2px solid var(--bg)"},}, "✓")
          )
          , React.createElement('div', { style: {flex:1,minWidth:0},}
            , React.createElement('div', { style: {fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6},}
              , u.name
              , u.status==="banned"&&React.createElement('span', { style: {background:"rgba(248,113,113,.2)",color:"var(--rd)",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:4},}, "BANNED")
            )
            , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)"},}, u.handle, ", "  , Looscid.fmt(u.dreamCount), " Dreams, "   , Looscid.fmt(u.followers), " followers" )
          )
          , React.createElement('div', { style: {display:"flex",gap:5},}
            , React.createElement('button', { className: "btn bgb" , style: {padding:"5px 9px",fontSize:11}, onClick: ()=>verifyUser(u.id), 'aria-label': u.verified?"Remove verification":"Verify user",}, u.verified?"Unverify":"Verify")
            , React.createElement('button', { className: "btn"+(u.status==="banned"?" bp":" bgb"), style: {padding:"5px 9px",fontSize:11,background:u.status==="banned"?"var(--gr)":""}, onClick: ()=>banUser(u.id), 'aria-label': u.status==="banned"?"Unban user":"Ban user",}, u.status==="banned"?"Unban":"Ban")
          )
        )
      ))
      , filtered.length===0&&React.createElement('div', { className: "es",}, React.createElement('div', { className: "esi",}, "No users found"), React.createElement('div', { className: "esl",}, "No users found"  ))
    )
  );
}
function AdminContent({onBack}) {
  const [tab, setTab] = useState("flagged");
  const [items, setItems] = useState(DREAMS_INIT.map(d=>({...d,flagReason:"Reported by 3 users",reviewed:false})));
  const dismiss = id => setItems(is=>is.filter(i=>i.id!==id));
  return (
    React.createElement('div', { className: "pg",}
      , React.createElement(BackHeader, { title: "Content Moderation" , onBack: onBack,})
      , React.createElement('div', {className:"ftabs",role:"tablist","aria-label":"Content sections",style:{overflowX:"auto",scrollbarWidth:"none"}},
        ["flagged","all"].map(function(t,i){
          var lbl = t==="flagged"?"Flagged ("+items.filter(function(x){return !x.reviewed;}).length+")":"All";
          return React.createElement('button', {key:t,className:"ftab"+(tab===t?" on":""),onClick:function(){setTab(t);},role:"tab","aria-selected":tab===t,"aria-setsize":2,"aria-posinset":i+1,"aria-label":lbl,style:{whiteSpace:"nowrap"}}, lbl);
        })
      )
      , items.filter(i=>tab==="all"||!i.reviewed).map(item=>(
        React.createElement('div', { key: item.id, style: {padding:"12px 14px",borderBottom:"1px solid var(--bd)"},}
          , React.createElement('div', { style: {display:"flex",gap:9,alignItems:"center",marginBottom:7},}
            , React.createElement(Av, { user: item.user, size: 32,})
            , React.createElement('div', { style: {flex:1},}
              , React.createElement('div', { style: {fontWeight:700,fontSize:13},}, item.user.name)
              , React.createElement('div', { style: {fontSize:11,color:"var(--rd)"},}, item.flagReason)
            )
            , React.createElement('span', { style: {fontSize:11,color:"var(--tx3)"},}, item.time)
          )
          , React.createElement('p', { style: {fontSize:12,color:"var(--tx2)",lineHeight:1.55,marginBottom:9,paddingLeft:41},}, item.text.slice(0,120), "…")
          , React.createElement('div', { style: {display:"flex",gap:6,paddingLeft:41},}
            , React.createElement('button', { className: "btn bp" , style: {padding:"5px 12px",fontSize:11}, onClick: ()=>dismiss(item.id), 'aria-label': "Dismiss report" ,}, "Dismiss")
            , React.createElement('button', { className: "btn bgb" , style: {padding:"5px 12px",fontSize:11,color:"var(--rd)",borderColor:"rgba(248,113,113,.3)"}, onClick: ()=>dismiss(item.id), 'aria-label': "Remove dream" ,}, "Remove Dream" )
            , React.createElement('button', { className: "btn bgb" , style: {padding:"5px 12px",fontSize:11}, onClick: ()=>dismiss(item.id), 'aria-label': "Warn user" ,}, "Warn Dreamor" )
          )
        )
      ))
      , items.filter(i=>tab==="all"||!i.reviewed).length===0&&React.createElement('div', { className: "es",}, React.createElement('div', { className: "esi",}, "All clear!"), React.createElement('div', { className: "esl",}, "All clear!" ), React.createElement('p', { style: {fontSize:12,color:"var(--tx3)",marginTop:4},}, "No flagged content right now"    ))
    )
  );
}
function AdminReports({onBack}) {
  const [reports] = useState([
    /* reports appear here when Dreamors file them */
  ]);
  const [filter, setFilter] = useState("pending");
  const visible = reports.filter(r=>filter==="all"||r.status===filter);
  return (
    React.createElement('div', { className: "pg",}
      , React.createElement(BackHeader, { title: "Reports Queue" , onBack: onBack,})
      , React.createElement('div', { style: {padding:"8px 14px"},}
        , React.createElement('div', { style: {display:"flex",gap:6},}
          , ["pending","reviewed","all"].map(f=>(
            React.createElement('button', { key: f, className: "btn"+(filter===f?" bp":" bgb"), style: {padding:"5px 12px",fontSize:11,textTransform:"capitalize"}, onClick: ()=>setFilter(f), 'aria-label': "Filter "+f,}, f, " (" , reports.filter(r=>f==="all"||r.status===f).length, ")")
          ))
        )
      )
      , visible.map(r=>(
        React.createElement('div', { key: r.id, style: {padding:"12px 14px",borderBottom:"1px solid var(--bd)"},}
          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:6},}
            , React.createElement('span', { style: {background:r.status==="pending"?"rgba(248,113,113,.15)":"rgba(52,211,153,.15)",color:r.status==="pending"?"var(--rd)":"var(--gr)",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,textTransform:"uppercase"},}, r.status)
            , React.createElement('span', { style: {fontSize:11,color:"var(--tx3)"},}, r.type, ", "  , r.time)
          )
          , React.createElement('div', { style: {fontSize:13,fontWeight:600,marginBottom:3},}, "Reason: " , r.reason)
          , React.createElement('div', { style: {fontSize:12,color:"var(--tx3)",marginBottom:4},}, "Reported by "  , r.reporter.name, ", Target: "   , r.target.name)
          , React.createElement('p', { style: {fontSize:12,color:"var(--tx2)",lineHeight:1.5,marginBottom:8},}, r.preview)
          , r.status==="pending"&&(
            React.createElement('div', { style: {display:"flex",gap:6},}
              , React.createElement('button', { className: "btn bp" , style: {padding:"5px 12px",fontSize:11},}, "Dismiss")
              , React.createElement('button', { className: "btn bgb" , style: {padding:"5px 12px",fontSize:11,color:"var(--rd)"},}, "Take Action" )
            )
          )
        )
      ))
      , visible.length===0&&React.createElement('div', { className: "es",}, React.createElement('div', { className: "esi",}, "No reports here"), React.createElement('div', { className: "esl",}, "No reports here"  ))
    )
  );
}
function AdminAnalytics({onBack, stats}) {
  const metrics = [
    {label:"Daily Active Dreamors",value:stats.dau.toLocaleString(),change:"+4.2%",up:true},
    {label:"Monthly Active Dreamors",value:stats.mau.toLocaleString(),change:"+12.1%",up:true},
    {label:"Dreams Today",value:"4,218",change:"+7.8%",up:true},
    {label:"New Signups Today",value:"312",change:"-2.1%",up:false},
    {label:"Avg. Session Length",value:"8m 42s",change:"+0.9%",up:true},
    {label:"Platform Uptime",value:stats.uptime,change:"30 days",up:true},
    {label:"Total Groups",value:stats.groups.toLocaleString(),change:"+18 this week",up:true},
    {label:"API Response Avg",value:"142ms",change:"-8ms",up:true},
  ];
  return (
    React.createElement('div', { className: "pg",}
      , React.createElement(BackHeader, { title: "Analytics", onBack: onBack,})
      , React.createElement('div', { style: {padding:"12px 14px 24px"},}
        , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",marginBottom:12},}, "Last updated: just now, All metrics are real-time"        )
        , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20},}
          , metrics.map(m=>(
            React.createElement('div', { key: m.label, style: {background:"var(--sf2)",borderRadius:11,padding:"11px 13px",border:"1px solid var(--bd)"},}
              , React.createElement('div', { style: {fontSize:10,color:"var(--tx3)",marginBottom:5,lineHeight:1.3},}, m.label)
              , React.createElement('div', { style: {fontSize:18,fontWeight:800,marginBottom:3},}, m.value)
              , React.createElement('div', { style: {fontSize:10,color:m.up?"var(--gr)":"var(--rd)",fontWeight:600},}, m.up?"↑":"↓", " " , m.change)
            )
          ))
        )
        , React.createElement('div', { style: {background:"var(--sf2)",borderRadius:11,padding:14,border:"1px solid var(--bd)"},}
          , React.createElement('div', { style: {fontSize:12,fontWeight:700,marginBottom:10},}, "Top Trending Tags Today"   )
          , TRENDING.map((t,i)=>(
            React.createElement('div', { key: t.tag, style: {display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<TRENDING.length-1?"1px solid var(--bd)":"none"},}
              , React.createElement('span', { style: {fontSize:14,fontWeight:800,color:"var(--tx3)",minWidth:18},}, "#", i+1)
              , React.createElement('div', { style: {flex:1},}
                , React.createElement('div', { style: {fontWeight:600,fontSize:13},}, "#", t.tag)
                , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)"},}, t.count)
              )
              , React.createElement('span', { style: {fontSize:11,color:"var(--ac3)",background:"var(--sf3)",padding:"2px 8px",borderRadius:100},}, t.cat)
            )
          ))
        )
      )
    )
  );
}
function AdminPlatform({onBack}) {
  const [flags, setFlags] = useState({maintenance:false,newSignups:true,publicFeed:true,groups:true,cherry:true,polls:true,dm:true,apiAccess:true,betaFeatures:false});
  const [limits, setLimits] = useState({maxDreams:500,maxGroups:50,reportThreshold:5,maxDreamLen:1000});
  const toggle = k => setFlags(f=>({...f,[k]:!f[k]}));
  return (
    React.createElement('div', { className: "pg",}
      , React.createElement(BackHeader, { title: "Platform Settings" , onBack: onBack,})
      , React.createElement('div', { style: {padding:"0 0 24px"},}

        , flags.maintenance && (
          React.createElement('div', { style: {margin:"10px 14px",padding:"10px 14px",background:"rgba(248,113,113,.12)",border:"1px solid rgba(248,113,113,.3)",borderRadius:10,display:"flex",gap:8,alignItems:"center"},}
            , React.createElement('span', { style: {fontSize:18},}, "🚧")
            , React.createElement('div', { style: {fontSize:12,color:"var(--rd)",fontWeight:600},}, "Maintenance mode is ACTIVE — users cannot access the platform"         )
          )
        )

        , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "Feature Flags" )
        , [
          {k:"maintenance",l:"Maintenance Mode",d:"Locks the platform for all non-admin users",danger:true},
          {k:"newSignups",l:"New Signups",d:"Allow new users to register accounts"},
          {k:"publicFeed",l:"Public Feed",d:"Show Dreams to logged-out visitors"},
          {k:"groups",l:"Groups",d:"Enable Groups feature platform-wide"},
          {k:"cherry",l:"Cherry AI",d:"Enable Cherry AI assistant for all users"},
          {k:"polls",l:"Polls",d:"Allow users to create poll Dreams"},
          {k:"dm",l:"Direct Messages",d:"Enable private messaging between Dreamors"},
          {k:"apiAccess",l:"API Access",d:"Allow third-party API integrations"},
          {k:"betaFeatures",l:"Beta Features",d:"Enable unreleased beta features for all users"},
        ].map(r=>(
          React.createElement('div', { key: r.k, className: "sr", style: {background:r.danger&&flags[r.k]?"rgba(248,113,113,.06)":""},}
            , React.createElement('div', null, React.createElement('div', { className: "sr-title", style: {color:r.danger&&flags[r.k]?"var(--rd)":""},}, r.l), React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",marginTop:3,maxWidth:230},}, r.d))
            , React.createElement(Cbx, { on: flags[r.k], onToggle: ()=>toggle(r.k), label: r.l,})
          )
        ))

        , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "Platform Limits" )
        , [
          {k:"maxDreams",l:"Max Dreams / Dreamor",d:"Maximum Dreams a single user can share"},
          {k:"maxGroups",l:"Max Groups / User",d:"Maximum Groups a user can create"},
          {k:"reportThreshold",l:"Auto-flag Threshold",d:"Number of reports before content is auto-flagged"},
          {k:"maxDreamLen",l:"Global Max Dream Length",d:"Maximum characters allowed in any Dream"},
        ].map(r=>(
          React.createElement('div', { key: r.k, className: "sr",}
            , React.createElement('div', { style: {flex:1},}, React.createElement('div', { className: "sr-title",}, r.l), React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",marginTop:3},}, r.d))
            , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:6},}
              , React.createElement('button', { className: "bi", style: {width:26,height:26,background:"var(--sf2)",borderRadius:6,fontSize:14}, onClick: ()=>setLimits(l=>({...l,[r.k]:Math.max(1,l[r.k]-1)})), 'aria-label': "Decrease "+r.l,}, "−")
              , React.createElement('span', { style: {fontSize:13,fontWeight:700,minWidth:36,textAlign:"center"},}, limits[r.k])
              , React.createElement('button', { className: "bi", style: {width:26,height:26,background:"var(--sf2)",borderRadius:6,fontSize:14}, onClick: ()=>setLimits(l=>({...l,[r.k]:l[r.k]+1})), 'aria-label': "Increase "+r.l,}, "+")
            )
          )
        ))

        , React.createElement('div', { style: {padding:"16px 16px 0"},}
          , React.createElement('button', { className: "btn bp" , style: {width:"100%",padding:12,fontSize:13,marginBottom:8}, 'aria-label': "Save platform settings"  ,}, "Save Platform Settings"  )
          , React.createElement('button', { className: "btn bgb" , style: {width:"100%",padding:11,fontSize:13,color:"var(--rd)"}, 'aria-label': "Emergency shutdown" ,}, "Emergency Shutdown"  )
        )
      )
    )
  );
}
function AdminAnnouncements({onBack}) {
  const [txt, setTxt] = useState("");
  const [target, setTarget] = useState("all");
  const [sent, setSent] = useState(false);
  const [history] = useState([
    {id:1,text:"Welcome to Looscid Beta! We are so excited to have you here. Share your first Dream today",target:"all",time:"3 days ago",reach:"24,817"},
    {id:2,text:"New feature: Groups are now live! Create or join a Group to connect with Dreamors who share your interests.",target:"all",time:"1 week ago",reach:"21,400"},
  ]);
  return (
    React.createElement('div', { className: "pg",}
      , React.createElement(BackHeader, { title: "Announcements", onBack: onBack,})
      , React.createElement('div', { style: {padding:"14px 16px 24px"},}
        , React.createElement('div', { style: {marginBottom:20},}
          , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8},}, "New Announcement" )
          , React.createElement('textarea', { className: "inp", style: {minHeight:100,lineHeight:1.6,fontSize:14,marginBottom:10}, placeholder: "Write your announcement to all Dreamors…", value: txt, onChange: e=>setTxt(e.target.value), 'aria-label': "Announcement text" ,})
          , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:6},}, "Send To" )
          , React.createElement('div', { style: {display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"},}
            , [{id:"all",l:"All Dreamors"},{id:"verified",l:"Verified Only"},{id:"admins",l:"Admins Only"},{id:"beta",l:"Beta Testers"}].map(t=>(
              React.createElement('button', { key: t.id, className: "btn"+(target===t.id?" bp":" bgb"), style: {padding:"5px 12px",fontSize:11}, onClick: ()=>setTarget(t.id), 'aria-label': "Send to "+t.l,}, t.l)
            ))
          )
          , sent&&React.createElement('div', { style: {padding:"8px 12px",background:"rgba(52,211,153,.12)",border:"1px solid rgba(52,211,153,.3)",borderRadius:8,fontSize:12,color:"var(--gr)",marginBottom:10},}, "✓ Announcement sent successfully"   )
          , React.createElement('button', { className: "btn bp" , style: {width:"100%",padding:12}, disabled: txt.trim().length<5, onClick: ()=>{setSent(true);setTxt("");}, 'aria-label': "Send announcement" ,}, "Send Announcement" )
        )
        , React.createElement('div', { style: {fontSize:11,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10},}, "Previous Announcements" )
        , history.map(h=>(
          React.createElement('div', { key: h.id, style: {background:"var(--sf2)",borderRadius:11,padding:13,marginBottom:10,border:"1px solid var(--bd)"},}
            , React.createElement('p', { style: {fontSize:13,color:"var(--tx)",lineHeight:1.55,marginBottom:7},}, h.text)
            , React.createElement('div', { style: {display:"flex",gap:10,fontSize:11,color:"var(--tx3)"},}
              , React.createElement('span', null, "To: " , h.target==="all"?"All Dreamors":h.target)
              , React.createElement('span', null, "Audience: " , h.reach, " reached" )
              , React.createElement('span', null, "Sent: " , h.time)
            )
          )
        ))
      )
    )
  );
}
function PolicyPage({title, content, navigate, back}) {
  return (
    React.createElement('div', { className: "pg",}
      , React.createElement(BackHeader, { title: title, onBack: ()=>navigate(back||"settings"),})
      , React.createElement('div', { className: "policy-body", onClick:e=>{const a=e.target.closest('a[data-policy-link]');if(a){e.preventDefault();navigate(a.dataset.policyLink);}}, dangerouslySetInnerHTML: {__html:content},})
    )
  );
}
/* --- HOUR STORY PAGE ----------------------------------------------------- */
function HourStoryPage({ navigate, back }) {
  return (
    React.createElement('div', { className: "pg",}
      , React.createElement(BackHeader, { title: "Our Story", onBack: ()=>navigate(back||"more"),})
      , React.createElement('div', { style: {padding:"24px 20px 48px"},}

        // Hero
        , React.createElement('div', { style: {textAlign:"center",marginBottom:32,padding:"0 8px"},}
          , React.createElement('div', { style: {fontSize:56,marginBottom:12,'aria-hidden':"true"},}, "🌙")
          , React.createElement('h1', { style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:26,lineHeight:1.3,
              background:"linear-gradient(135deg,var(--ac4),var(--ac3))",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
              marginBottom:12},}, "Looscid")
          , React.createElement('p', { style: {fontSize:15,color:"var(--tx2)",lineHeight:1.75},},
            "A social platform built by one person, with one goal: to give you a space that actually belongs to you."
          )
        )

        // Story sections
        , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:28},}

          , React.createElement('section', { 'aria-label': "How it started",}
            , React.createElement('h2', { style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:20,color:"var(--tx)",marginBottom:10},}, "How it started")
            , React.createElement('p', { style: {fontSize:14,color:"var(--tx2)",lineHeight:1.8},},
              "Looscid started as my late-night idea. Not a business plan. Not a pitch deck. Just a feeling that the internet needed a place that was quieter, kinder, and more yours."
            )
            , React.createElement('p', { style: {fontSize:14,color:"var(--tx2)",lineHeight:1.8,marginTop:10},},
              "I built it from scratch, one screen at a time, one feature at a time, because I wanted something that did not exist yet. A place where accessibility was not an afterthought. Where you were not the product. Where there were no ads telling you what to want."
            )
          )

          , React.createElement('div', { style: {height:1,background:"var(--bd)",'aria-hidden':"true"},})

          , React.createElement('section', { 'aria-label': "What we believe",}
            , React.createElement('h2', { style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:20,color:"var(--tx)",marginBottom:10},}, "What we believe")
            , React.createElement('p', { style: {fontSize:14,color:"var(--tx2)",lineHeight:1.8},},
              "We believe the best social platforms feel like journals, not stadiums. We believe people deserve tools that work for them — not against them. We believe accessibility is not a feature, it is a right."
            )
            , React.createElement('p', { style: {fontSize:14,color:"var(--tx2)",lineHeight:1.8,marginTop:10},},
              "Looscid is free. It will stay free. Not free-with-ads free. Actually free. Because we think that is just how it should be."
            )
          )

          , React.createElement('div', { style: {height:1,background:"var(--bd)",'aria-hidden':"true"},})

          , React.createElement('section', { 'aria-label': "Built with Claude",}
            , React.createElement('h2', { style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:20,color:"var(--tx)",marginBottom:10},}, "Built in the open")
            , React.createElement('p', { style: {fontSize:14,color:"var(--tx2)",lineHeight:1.8},},
              "This app was built transparently — with Claude as a development partner, documented in the open, and released as open source. Anyone can read the code, fork it, build on top of it. That is intentional. We want this to belong to everyone."
            )
            , React.createElement('p', { style: {fontSize:14,color:"var(--tx2)",lineHeight:1.8,marginTop:10},},
              "You can find the source code at github.com/Looscid/Looscid. If you want to contribute, improve it, or just see how it was made, it is all there."
            )
          )

          , React.createElement('div', { style: {height:1,background:"var(--bd)",'aria-hidden':"true"},})

          , React.createElement('section', { 'aria-label': "To you",}
            , React.createElement('h2', { style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:20,color:"var(--tx)",marginBottom:10},}, "To you")
            , React.createElement('p', { style: {fontSize:14,color:"var(--tx2)",lineHeight:1.8},},
              "If you are reading this, you are part of it. You are not a user number in a database. You are a Dreamor — and this place is yours as much as it is anyone's."
            )
            , React.createElement('p', { style: {fontSize:14,color:"var(--tx2)",lineHeight:1.8,marginTop:10},},
              "Dream something. Follow someone interesting. Come back tomorrow. Bring a friend. That is all we ask."
            )
            , React.createElement('p', { style: {fontSize:15,color:"var(--ac3)",fontStyle:"italic",lineHeight:1.8,marginTop:14},},
              "Thank you for being here. Seriously."
            )
          )

          // Mission statement
          , React.createElement('div', { style: {background:"linear-gradient(135deg,rgba(109,40,217,.1),rgba(147,51,234,.05))",border:"1px solid rgba(168,85,247,.2)",borderRadius:16,padding:"20px 18px",textAlign:"center"},}
            , React.createElement('div', { style: {fontSize:28,marginBottom:10,'aria-hidden':"true"},}, "🌙")
            , React.createElement('p', { style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:17,color:"var(--tx)",lineHeight:1.6,fontStyle:"italic"},},
              "'A platform that puts the Dreamor first. Free, accessible, and always yours.'"
            )
            , React.createElement('p', { style: {fontSize:11,color:"var(--tx3)",marginTop:8},}, "Looscid mission statement")
          )

          // Social links
          , React.createElement('div', { style: {display:"flex",flexDirection:"column",gap:10},}
            , React.createElement('div', { style: {fontSize:13,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em"},}, "Find us")
            , [
              {icon:"Looscid on X",label:"Looscid on X",sub:"@Looscid",a:()=>window.open("https://x.com/Looscid","_blank","noopener")},
              {icon:"Source code on GitHub",label:"Source code on GitHub",sub:"Looscid/Looscid",a:()=>window.open("https://github.com/Looscid/Looscid","_blank","noopener")},
            ].map(item =>
              React.createElement('button', { key: item.label, className: "snav", onClick: item.a, 'aria-label': item.label,}
                , React.createElement('div', { className: "snav-l",}
                  , React.createElement('div', { className: "snav-ic", style: {background:"var(--sf2)",fontSize:17},}, item.icon)
                  , React.createElement('div', null,
                    React.createElement('div', { className: "snav-title",}, item.label),
                    React.createElement('div', { className: "snav-sub",}, item.sub)
                  )
                )
                , React.createElement(Ic.Chv, {style:{width:16,height:16,color:"var(--tx3)"}})
              )
            )
          )
        )
      )
    )
  );
}
function normalizeUrl(v) {
  v = (v || "").trim();
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  try { const u = new URL(v); if (u.protocol !== "https:" && u.protocol !== "http:") return null; if (!u.hostname.includes(".")) return null; return u.href; } catch (e) { return null; }
}
const PROFILE_FIELDS = [
  { key: "name", label: "Name", heading: "Change name", help: "Change the name that shows on your profile.",
    get: function (p) { return p.displayName || ""; }, max: 40, autoComplete: "name",
    toPatch: function (v) { v = sanitizeInput(v); if (!v) return { error: "Your name can't be empty." }; return { patch: { displayName: v.slice(0, 40) } }; } },
  { key: "username", label: "Username", heading: "Change username", help: "Change the username connected with your LooscidID. This also changes how Dreamors @mention you.",
    get: function (p) { return (p.handle || "").replace(/^@/, ""); }, show: function (p) { return p.handle || ""; }, max: 30, prefix: "@", autoComplete: "username",
    toPatch: function (v) { v = (v || "").trim().replace(/^@+/, "").toLowerCase(); if (!/^[a-z0-9_]{3,30}$/.test(v)) return { error: "Use 3 to 30 letters, numbers or underscores." }; return { patch: { handle: "@" + v } }; } },
  // Part 35 (2three1y, Oct 12 4:43 PM): no length limit on the bio, because it can hold Markdown and code. Its text is
  // kept as you wrote it (only trimmed); it is shown through lcMarkdown, which never treats it as HTML.
  { key: "bio", label: "Bio", heading: "Change bio", help: "About you, as long as you like. Markdown works: # headings, - lists, [links](https://example.com), **bold**, *italic*, `code` and ``` code blocks.",
    get: function (p) { return p.bio || ""; }, multiline: true,
    toPatch: function (v) { return { patch: { bio: String(v || "").trim() } }; } },
  { key: "website", label: "Website", heading: "Change website", help: "Add your website. Leave the box empty to remove it.",
    get: function (p) { return p.website || ""; }, max: 200, type: "url", autoComplete: "url",
    toPatch: function (v) { const u = normalizeUrl(v); if (u === null) return { error: "That doesn't look like a web address. Try something like example.com." }; return { patch: { website: u } }; } },
  { key: "links", label: "Social links", heading: "Change social links", help: "Add your Mastodon, Bluesky, Nostr, GitHub, YouTube or any other profile.",
    get: function (p) { return p.links || []; }, show: function (p) { const n = (p.links || []).length; return n ? n + (n === 1 ? " link" : " links") : ""; } },
];
Looscid.PROFILE_FIELDS = PROFILE_FIELDS;
function fieldValueText(f, p) { const v = f.show ? f.show(p) : f.get(p); return v ? String(v) : "Not set"; }
function ProfileInfoList({ profile, onOpen, saved, onView }) {
  return lh(React.Fragment, null,
    saved && lh('p', { className: "lid-saved" }, "Profile saved. ",
      lh('a', { href: "#profile", onClick: function (e) { e.preventDefault(); onView(); } }, "View")),
    lh('ul', { className: "lid-list", 'aria-label': "Your info" },
      PROFILE_FIELDS.map(function (f) {
        return lh('li', { key: f.key },
          lh('a', { href: "#change-" + f.key, id: "pf-link-" + f.key, className: "lid-field", 'aria-label': Looscid.lcNameJoin(f.label, fieldValueText(f, profile)),
              onClick: function (e) { e.preventDefault(); onOpen(f.key); } },
            lh('span', { className: "lid-field-l" }, f.label), " ",
            lh('span', { className: "lid-field-v" }, fieldValueText(f, profile)),
            lh(Ic.Chv, { style: { width: 16, height: 16, color: "var(--tx2)", flexShrink: 0 }, 'aria-hidden': "true" })));
      }))
  );
}
function ChangeInfoScreen({ field, profile, onSave, onClose }) {
  const isLinks = field.key === "links";
  const [val, setVal] = useState(isLinks ? "" : field.get(profile));
  const [links, setLinks] = useState(isLinks ? (profile.links || []).slice() : []);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [err, setErr] = useState("");
  const headRef = useRef(null);
  useEffect(function () { if (headRef.current) headRef.current.focus(); }, []);
  // Part 35 (2three1y, Oct 12 4:43 PM): Save stays dimmed (aria-disabled, so VoiceOver still finds it) until something
  // really changed, and dims again if the change is undone. Enter and Save both check it.
  const sameLinks = function (a, b) { return JSON.stringify(a || []) === JSON.stringify(b || []); };
  const changed = isLinks ? (!sameLinks(links, profile.links) || !!linkName.trim() || !!linkUrl.trim()) : String(val) !== String(field.get(profile));
  const save = function () {
    if (!changed) { announce("Nothing to save yet. Change something first."); return; }
    if (isLinks) {
      let list = links;
      if (linkName.trim() || linkUrl.trim()) { const added = addLink(true); if (!added) return; list = added; }
      onSave({ links: list });
      return;
    }
    const r = field.toPatch(val);
    if (r.error) { setErr(r.error); announce(r.error); return; }
    onSave(r.patch);
  };
  const addLink = function (quiet) {
    const n = sanitizeInput(linkName || ""); const u = normalizeUrl(linkUrl);
    if (!n) { setErr("Give the link a name, like Mastodon."); announce("Give the link a name, like Mastodon."); return null; }
    if (!u) { setErr("Add a web address for " + n + "."); announce("Add a web address for " + n + "."); return null; }
    if (links.length >= 10) { setErr("You can add up to 10 links."); announce("You can add up to 10 links."); return null; }
    const next = links.concat([{ name: n.slice(0, 40), url: u }]);
    setLinks(next); setLinkName(""); setLinkUrl(""); setErr("");
    if (!quiet) announce(n + " link added. Press Save to keep it.");
    return next;
  };
  const enterRef = useEnterSubmit(save);
  const nameRef = useEnterSubmit(function () { addLink(false); });
  const urlRef = useEnterSubmit(function () { addLink(false); });
  const inputId = "lid-edit-" + field.key;
  return lh('div', { className: "pg lid-screen", role: "region", 'aria-labelledby': "lid-h-" + field.key,
      onKeyDown: function (e) { if (e.key === "Escape") { e.preventDefault(); onClose(); } } },
    lh('div', { className: "hdr" }, lh('div', { className: "hdr-row" },
      lh('h1', { className: "hdr-title", id: "lid-h-" + field.key, tabIndex: -1, ref: headRef }, field.heading))),
    lh('form', { className: "lid-form", noValidate: true, onSubmit: function (e) { e.preventDefault(); save(); } },
      lh('p', { className: "lid-help", id: inputId + "-help" }, field.help),
      !isLinks && lh('label', { htmlFor: inputId, className: "lid-label" }, field.label),
      !isLinks && lh('div', { className: "lid-inwrap" },
        field.prefix && lh('span', { className: "lid-prefix", 'aria-hidden': "true" }, field.prefix),
        field.multiline
          ? lh('textarea', { id: inputId, className: "inp lid-textarea", rows: 8, value: val, autoComplete: "off", spellCheck: true, 'aria-invalid': err ? "true" : undefined,
              onChange: function (e) { setVal(e.target.value); if (err) setErr(""); } })
          : lh('input', { id: inputId, ref: enterRef, className: "inp", type: field.type === "url" ? "url" : "text", value: val, maxLength: field.max,
          autoComplete: field.autoComplete || "off", 'aria-invalid': err ? "true" : undefined,
          enterKeyHint: "done", onChange: function (e) { setVal(e.target.value); if (err) setErr(""); } })),
      isLinks && lh(React.Fragment, null,
        lh('h2', { className: "lid-sub" }, "Your links"),
        links.length === 0 ? lh('p', { className: "lid-help" }, "No links yet.") :
          lh('ul', { className: "lid-links", 'aria-label': "Your links" }, links.map(function (l, i) {
            return lh('li', { key: i },
              lh('span', null, l.name, " ", lh('span', { className: "lid-field-v" }, l.url)),
              lh('button', { type: "button", className: "btn bgb", 'aria-label': "Remove " + l.name + " link",
                onClick: function () { setLinks(links.filter(function (_, j) { return j !== i; })); announce(l.name + " link removed. Press Save to keep this change."); } }, "Remove"));
          })),
        lh('h2', { className: "lid-sub" }, "Add a link"),
        lh('label', { htmlFor: "lid-link-name", className: "lid-label" }, "Link name"),
        lh('input', { id: "lid-link-name", ref: nameRef, className: "inp", type: "text", value: linkName, maxLength: 40, placeholder: "Mastodon", enterKeyHint: "next",
          onChange: function (e) { setLinkName(e.target.value); if (err) setErr(""); } }),
        lh('label', { htmlFor: "lid-link-url", className: "lid-label" }, "URL"),
        lh('input', { id: "lid-link-url", ref: urlRef, className: "inp", type: "url", value: linkUrl, maxLength: 200, placeholder: "https://", enterKeyHint: "done",
          onChange: function (e) { setLinkUrl(e.target.value); if (err) setErr(""); } }),
        lh('button', { type: "button", className: "btn bgb lid-addlink", onClick: function () { addLink(false); } }, "Add link")),
      err && lh('p', { className: "lid-err", id: inputId + "-err" }, err),
      lh('div', { className: "lid-actions" },
        lh('button', { type: "submit", className: "btn bp" + (changed ? "" : " lc-dim"), "aria-disabled": changed ? undefined : "true" }, "Save"),
        lh('button', Object.assign({ type: "button", className: "btn bgb", onClick: onClose }, lcCloseProps(field.label ? field.label + " editor" : "editor")), "Close")))
  );
}
// Holds which change screen is open and puts focus back where it belongs.
function useProfileEditor(authUser, onUpdateProfile, navigate) {
  const [editing, setEditing] = useState(null);
  const [saved, setSaved] = useState(false);
  const returnTo = useRef(null);
  useEffect(function () {
    if (!editing && returnTo.current) {
      const el = document.getElementById("pf-link-" + returnTo.current);
      returnTo.current = null;
      if (el) el.focus();
    }
  }, [editing]);
  const field = PROFILE_FIELDS.find(function (f) { return f.key === editing; });
  const close = function () { returnTo.current = editing; setEditing(null); };
  const save = function (patch) { onUpdateProfile(patch); returnTo.current = editing; setSaved(true); setEditing(null); announce("Profile saved"); };
  return {
    editing: !!field,
    screen: field ? lh(ChangeInfoScreen, { key: field.key, field: field, profile: authUser || {}, onSave: save, onClose: close }) : null,
    list: lh(ProfileInfoList, { profile: authUser || {}, saved: saved, onOpen: function (k) { setSaved(false); setEditing(k); }, onView: function () { navigate("profile"); } }),
  };
}
// Accessible names: join only the parts that have words, so a missing value never leaves "Profile , " behind.
function lcJoin() { return Array.prototype.slice.call(arguments).map(function (x) { return x == null ? "" : String(x).replace(/\s+/g, " ").trim().replace(/^[,.;:]\s*|\s*[,;:]$/g, ""); }).filter(Boolean).join(", "); }
function methodLabel(m) { const pid = m.provider === "nostr" ? shortNpub(m.publicId) : m.publicId; return PROVIDER_NAMES[m.provider] + ", " + pid + (m.how ? ", " + m.how : ""); }
function getStoredNostrSk() { try { return localStorage.getItem(LID_NOSTR_SK_KEY); } catch (e) { return null; } }
function ComingSoonPanel({ provider }) {
  return lh('div', { className: "lid-panel" },
    lh('p', { className: "lid-soon" }, provider.name + " login is coming soon."),
    lh('p', { className: "lid-help" }, provider.why),
    lh('p', { className: "lid-help" }, "For now, choose Nostr or continue with your local profile."));
}
/* --- Login methods (Settings > Account > Security) ----------------------- */
function LoginMethods() {
  const [methods, setMethods] = useState(getMethods());
  const [adding, setAdding] = useState(null);
  const [confirmRm, setConfirmRm] = useState(null);
  const [note, setNote] = useState("");
  useEffect(function () { const f = function () { setMethods(getMethods()); }; window.addEventListener("looscid-methods", f); return function () { window.removeEventListener("looscid-methods", f); }; }, []);
  useOAuthReturn("account", function (r) { setMethods(getMethods()); setNote(r.msg); });
  const linked = {}; methods.forEach(function (m) { linked[m.provider] = true; });
  // Only working login methods are offered; planned ones are on Looscid Labs, Coming soon.
  const items = ID_PROVIDERS.filter(function (p) { return p.status === "ready"; }).map(function (p) {
    return Object.assign({}, p, { note: linked[p.id] ? "linked, replace" : null });
  });
  const prov = adding && ID_PROVIDERS.find(function (p) { return p.id === adding; });
  const done = function (m) { setAdding(null); setMethods(getMethods()); setNote(m); announce("Login method added"); };
  return lh('section', { 'aria-labelledby': "lid-methods-h", className: "lid-panel" },
    lh('h3', { id: "lid-methods-h", className: "lid-label", tabIndex: -1 }, "Linked to your LooscidID"),
    lh('p', { className: "lid-help" }, "Your LooscidID already exists on this device. Login methods are optional: add any network to log in with it, and add as many as you like."),
    note && lh('p', { className: "lid-saved" }, note),
    lh('ul', { className: "lid-links", 'aria-label': "Login methods" },
      methods.map(function (m) {
        return lh('li', { key: m.id }, lh('span', null, methodLabel(m) + ", linked"),
          lh('button', { type: "button", className: "btn bgb", 'aria-label': "Remove " + PROVIDER_NAMES[m.provider] + " login", onClick: function () { setConfirmRm(m); } }, "Remove"));
      }),
      lh('li', { key: "local" }, lh('span', null, "Local profile, this device"), lh('span', { className: "lid-field-v", style: { flex: "none" } }, "always on"))),
    lh(MenuPopupButton, { id: "lid-add-method", label: "Add login method", value: adding || "", items: items, placeholder: "Choose a network",
      onSelect: function (v) { setNote(""); setAdding(v); } }),
    prov && prov.status === "ready" ? lh(LcFindMeSwitch, { provider: prov.id }) : null,
    prov && prov.status === "ready" ? lh(prov.Panel, { onDone: done, from: "account" }) : null,
    confirmRm && lh(AlertDialog, { title: "Remove " + PROVIDER_NAMES[confirmRm.provider] + " login?",
      message: confirmRm.provider === "nostr" && confirmRm.nostrMethod === "local" ? "This deletes the Nostr key stored on this device. If you haven't saved it, it's gone for good. Your local profile stays." : "You won't be able to log in with " + PROVIDER_NAMES[confirmRm.provider] + " until you add it again. Your local profile stays.",
      confirmLabel: "Remove", onCancel: function () { setConfirmRm(null); },
      onConfirm: function () { const m = confirmRm; setConfirmRm(null); removeMethod(m.id); setMethods(getMethods()); setNote(PROVIDER_NAMES[m.provider] + " login removed."); announce("Login method removed");
        setTimeout(function () { const b = document.getElementById("lid-add-method"); if (b) b.focus(); }, 0); } }));
}
/* --- Keys and IDs (round 5): link the public side of your decentralized IDs ----
   No login needed: paste your Nostr npub, your Mastodon / fediverse handle or your Bluesky handle.
   Checks are real (npub bech32 checksum, handle formats). If the network can confirm it
   (Bluesky handle lookup, fediverse WebFinger) it says "verified"; if not, "saved, not verified yet". */
const LC_IDS_KEY = "looscid_linked_ids";
Looscid.LC_IDS_KEY = LC_IDS_KEY;
function lcGetIds() { try { const v = JSON.parse(localStorage.getItem(LC_IDS_KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function lcSaveIds(list) { try { localStorage.setItem(LC_IDS_KEY, JSON.stringify(list)); } catch (e) {} try { window.dispatchEvent(new Event("looscid-methods")); } catch (e) {} return list; }
const LC_B32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
Looscid.LC_B32 = LC_B32;
function lcBech32Polymod(values) { const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]; let chk = 1; values.forEach(function (v) { const b = chk >> 25; chk = ((chk & 0x1ffffff) << 5) ^ v; for (let i = 0; i < 5; i++) if ((b >> i) & 1) chk ^= G[i]; }); return chk; }
// Returns the 32-byte key as hex for a valid npub (or nsec with want="nsec"), else null.
function lcDecodeBech32Key(str, want) {
  const s = String(str || "").trim().toLowerCase();
  const pos = s.lastIndexOf("1"); if (pos < 1 || pos + 7 > s.length || s.length > 120) return null;
  const hrp = s.slice(0, pos); if (hrp !== (want || "npub")) return null;
  const data = []; for (let i = pos + 1; i < s.length; i++) { const d = LC_B32.indexOf(s[i]); if (d < 0) return null; data.push(d); }
  const exp = []; for (let i = 0; i < hrp.length; i++) exp.push(hrp.charCodeAt(i) >> 5); exp.push(0); for (let i = 0; i < hrp.length; i++) exp.push(hrp.charCodeAt(i) & 31);
  if (lcBech32Polymod(exp.concat(data)) !== 1) return null;
  let acc = 0, bits = 0; const out = [];
  data.slice(0, -6).forEach(function (v) { acc = (acc << 5) | v; bits += 5; while (bits >= 8) { bits -= 8; out.push((acc >> bits) & 255); } });
  if (out.length !== 32) return null;
  return out.map(function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
}
const LC_ID_KINDS = [
  { id: "nostr", name: "Nostr public key (npub)", short: "Nostr", ph: "npub1\u2026", help: "Your public key starts with npub1. Never paste your nsec here: that is your secret key." },
  { id: "fedi", name: "Mastodon or fediverse handle", short: "Fediverse", ph: "name@mastodon.social", help: "Your full handle, with your server: name@server. Works for Mastodon, Friendica, GoToSocial, Akkoma, Pleroma and Hubzilla." },
  { id: "bsky", name: "Bluesky handle", short: "Bluesky", ph: "name.bsky.social", help: "Your handle, like name.bsky.social, or your own domain." },
];
Looscid.LC_ID_KINDS = LC_ID_KINDS;
function lcCheckId(kind, raw) {
  const v = String(raw || "").trim();
  if (!v) return { err: "Type or paste it first." };
  if (kind === "nostr") {
    if (/^nsec1/i.test(v)) return { err: "That's a secret key (nsec). Paste your public key, which starts with npub1. Keep your nsec private." };
    const hex = lcDecodeBech32Key(v, "npub");
    return hex ? { id: v.toLowerCase(), hex: hex } : { err: "That isn't a valid npub. It should start with npub1 and be copied in full." };
  }
  if (kind === "fedi") {
    const m = v.replace(/^@/, "").toLowerCase().match(/^([a-z0-9_.-]{1,64})@([a-z0-9-]+(\.[a-z0-9-]+)+)$/);
    return m ? { id: "@" + m[1] + "@" + m[2], user: m[1], host: m[2] } : { err: "Use the full handle with your server, like name@mastodon.social." };
  }
  if (kind === "bsky") {
    const h = v.replace(/^@/, "").toLowerCase();
    return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(h) ? { id: "@" + h, handle: h } : { err: "Use the full handle, like name.bsky.social." };
  }
  return { err: "Pick what you are linking first." };
}
async function lcVerifyId(kind, c) {
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const t = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
  try {
    if (kind === "bsky") { const r = await fetch("https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=" + encodeURIComponent(c.handle), { signal: ctl && ctl.signal }); const j = await r.json(); return r.ok && j.did ? { ok: true, did: j.did } : { ok: false, notFound: r.status === 400 }; }
    if (kind === "fedi") { const r = await fetch("https://" + c.host + "/.well-known/webfinger?resource=" + encodeURIComponent("acct:" + c.user + "@" + c.host), { signal: ctl && ctl.signal }); return { ok: r.ok, notFound: r.status === 404 }; }
    return { ok: true }; // a valid npub checksum is the whole check: it is a public key
  } catch (e) { return { ok: false, offline: true }; } finally { clearTimeout(t); }
}
/* --- Round 6.4: Nostr key (Settings > LooscidID > Keys and IDs) ----------------------------
   Three ways in: a signer (NIP-07, the key never touches Looscid), entering your key in a secure
   field, or creating a new key here. An optional passcode saves the key locked (NIP-49 ncryptsec).
   The key is never in Settings backup. js/nostr.js does the work; this is only the screen. */
function lcCopyText(text, ok) {
  const fail = function () { announce("Couldn't copy. Use Show key and copy it yourself."); };
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { announce(ok); }, fail); else fail(); } catch (e) { fail(); }
}
function lcFocusId(id) { setTimeout(function () { const el = document.getElementById(id); if (el) el.focus(); }, 40); }
function NostrPassFields({ pass, setPass, pass2, setPass2, noPass, setNoPass, label, existing }) {
  // Security pass (Oct 2026): a passcode is the default now (Looscid.LcPassFields in core.js, with its strength check).
  return lh(Looscid.LcPassFields, { id: "nostr", pass: pass, setPass: setPass, pass2: pass2, setPass2: setPass2, noPass: noPass, setNoPass: setNoPass, label: label, existing: existing });
}
function NostrKeySection() {
  const N = Looscid.lcNostr;
  const st = Looscid.useNostrState();
  const hasExt = typeof window !== "undefined" && !!window.nostr && typeof window.nostr.getPublicKey === "function";
  const [how, setHow] = useState(hasExt ? "signer" : "enter");
  const [nsec, setNsec] = useState("");
  const [pass, setPass] = useState(""); const [pass2, setPass2] = useState(""); const [noPass, setNoPass] = useState(false);
  const [unl, setUnl] = useState("");
  const [weak, setWeak] = useState(false); // unlocked with a passcode from before the minimum: offer a change
  useEffect(function () { if (st.mode === "key" && !st.encrypted && N) N.load().catch(function () {}); }, [st.mode, st.encrypted]); // so Copy key works at once
  const [msg, setMsg] = useState(null); // {t, err}
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null); // {nsec, npub}
  const [confirmRm, setConfirmRm] = useState(false);
  const [relayIn, setRelayIn] = useState("");
  const [relayList, setRelayList] = useState(N ? N.relays() : []);
  useEffect(function () { const f = function () { if (N) setRelayList(N.relays()); }; window.addEventListener("looscid-nostr", f); return function () { window.removeEventListener("looscid-nostr", f); }; }, []);
  const say = function (t, err) { setMsg({ t: t, err: !!err }); announce(t, err ? "error" : undefined); };
  const passOk = function (allowNone) {
    const bad = Looscid.lcPassCheck(pass, pass2, allowNone && noPass);
    if (bad) { say(bad.t, true); lcFocusId("nostr-" + bad.field); return false; }
    return true;
  };
  const saveKey = async function () {
    if (busy) return;
    if (!nsec.trim()) { say("Type or paste your nsec key first.", true); lcFocusId("nostr-nsec"); return; }
    const enc = /^ncryptsec1/i.test(nsec.trim()); // already locked: the field is its own passcode
    if (enc ? !pass && (say("That key is locked with a passcode. Type its passcode in the Passcode field.", true), lcFocusId("nostr-pass"), true) : !passOk(true)) return;
    const none = noPass && !enc;
    setBusy(true); const r = await N.importKey(nsec, none ? "" : pass, { noPasscode: none }); setBusy(false);
    if (r.err) { say(r.err, true); lcFocusId(r.field ? "nostr-pass" : "nostr-nsec"); return; }
    setNsec(""); setPass(""); setPass2(""); setNoPass(false);
    say(none ? "Key saved on this device, without a passcode." : "Key saved on this device, locked with your passcode.");
    lcFocusId("nostr-key-h");
    // Read your Dreams back from Nostr now; say so only if some came back.
    N.fetchOwn().then(function (f) { if (f && f.added) setTimeout(function () { announce(f.added === 1 ? "Found 1 of your Dreams on Nostr." : "Found " + f.added + " of your Dreams on Nostr."); }, 1600); }, function () {});
  };
  const nsecRef = useEnterSubmit(saveKey);
  const create = async function () {
    if (busy || !passOk(true)) return;
    setBusy(true); const r = await N.createKey(noPass ? "" : pass, { noPasscode: noPass }); setBusy(false);
    if (r.err) { say(r.err, true); if (r.field) lcFocusId("nostr-pass"); return; }
    setPass(""); setPass2(""); setNoPass(false); setMsg(null);
    setCreated({ nsec: r.nsec, npub: r.npub });
    lcFocusId("nostr-new-h");
  };
  const signer = async function () {
    if (busy) return;
    setBusy(true); const r = await N.useSigner(); setBusy(false);
    if (r.err) { say(r.err, true); return; }
    say("Using your signer. Your key stays in your signer.");
    lcFocusId("nostr-key-h");
    N.fetchOwn().catch(function () {});
  };
  const unlock = async function () {
    if (busy) return;
    setBusy(true); const r = await N.unlock(unl); setBusy(false);
    if (r.err) { say(r.err, true); lcFocusId("nostr-unlock"); return; }
    setUnl(""); setWeak(!!r.weak);
    say((r.waiting ? "Unlocked. Sending " + r.waiting + (r.waiting === 1 ? " waiting Dream." : " waiting Dreams.") : "Unlocked until you close Looscid.") + (r.weak ? " Your passcode is short and easy to guess. You can change it below." : ""));
    lcFocusId("nostr-key-h");
  };
  const unlockRef = useEnterSubmit(unlock);
  const lock = async function () {
    if (busy) return;
    if (!passOk(false)) return;
    const was = st.encrypted;
    setBusy(true); const r = await N.setPasscode(pass); setBusy(false);
    if (r.err) { say(r.err, true); lcFocusId("nostr-pass"); return; }
    setPass(""); setPass2(""); setWeak(false); say(was ? "Your passcode is changed." : "Your key is now locked with your passcode."); lcFocusId("nostr-key-h");
  };
  const unlockPass = function () { const r = N.removePasscode(); if (r.err) { say(r.err, true); return; } say("Passcode removed. Your key is saved unlocked on this device, where anything on this site could copy it. You can lock it again anytime."); lcFocusId("nostr-key-h"); };
  const addRelay = function () {
    const u = N.cleanRelay(relayIn);
    if (!u) { say("That isn't a relay address. It starts with wss://", true); lcFocusId("nostr-relay-in"); return; }
    if (relayList.indexOf(u) >= 0) { say(u + " is already in your list.", true); return; }
    setRelayList(N.setRelays(relayList.concat([u]))); setRelayIn(""); say("Added " + u + ".");
  };
  const relayRef = useEnterSubmit(addRelay);
  const rmRelay = function (u) {
    if (relayList.length <= 1) { say("Keep at least one relay, or use the default relays.", true); return; }
    setRelayList(N.setRelays(relayList.filter(function (x) { return x !== u; }))); say("Removed " + u + "."); lcFocusId("nostr-relays-h");
  };
  if (!N) return null;
  const status = st.mode === "signer" ? "Your signer holds your key. Looscid asks it to sign each Dream."
    : st.mode === "locked" ? "Your key is saved on this device, locked with a passcode. Enter it to Dream to Nostr."
    : st.mode === "key" && st.encrypted ? "Your key is saved on this device, locked with a passcode, and unlocked until you close Looscid."
    : st.mode === "key" ? "Your key is saved on this device without a passcode."
    : st.mode === "view" ? "No key yet. Your Dreams from your linked public key load here, but this device can't Dream to Nostr until you add your key."
    : "No key yet. Dreams are saved only on this device.";
  const has = st.mode === "signer" || st.mode === "key" || st.mode === "locked";
  let body;
  if (created) body = lh('div', null,
    lh('h4', { id: "nostr-new-h", className: "lid-label", tabIndex: -1 }, "Save your new key"),
    lh('p', { className: "lid-warn" }, "Save this key somewhere safe. It's the only way to get your Dreams on another device. Looscid can't recover it."),
    lh(SecretField, { id: "nostr-nsec-new", label: "Your new Nostr secret key (nsec)", value: created.nsec, readOnly: true }),
    lh('div', { className: "lid-actions" },
      lh('button', { type: "button", className: "btn bgb", onClick: function () { lcCopyText(created.nsec, "Key copied."); } }, "Copy key"),
      lh('button', { type: "button", className: "btn bp", onClick: function () { setCreated(null); say("Your Nostr key is ready."); lcFocusId("nostr-key-h"); } }, "I saved my key")));
  else if (has) body = lh('div', null,
    st.npub && lh('p', { className: "lid-help" }, "Your public key (npub), safe to share: ", lh('span', { className: "lid-mono", id: "nostr-npub" }, st.npub)),
    st.npub && lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bgb", onClick: function () { lcCopyText(st.npub, "npub copied."); } }, "Copy npub")),
    st.mode === "locked" && lh(React.Fragment, null,
      lh('label', { htmlFor: "nostr-unlock", className: "lid-label" }, "Passcode"),
      lh('input', { id: "nostr-unlock", ref: unlockRef, className: "inp", type: "password", autoComplete: "off", autoCapitalize: "off", spellCheck: false, value: unl, onChange: function (e) { setUnl(e.target.value); } }),
      lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bp", disabled: busy, onClick: unlock }, "Unlock"))),
    // Security pass: a key saved without a passcode (from before) gets a clear, gentle prompt to lock it. Nothing is forced:
    // the key keeps working, and "Copy key" first means a forgotten passcode never costs the key.
    st.mode === "key" && !st.encrypted && lh('div', { className: "lid-lockbox", role: "group", "aria-labelledby": "nostr-lock-h" },
      lh('h4', { id: "nostr-lock-h", className: "lid-label" }, "Lock your key with a passcode"),
      lh('p', { className: "lid-warn" }, "Your key is saved without a passcode, so anything that runs on this site could copy it. Lock it now. If you haven't saved your key somewhere safe yet, copy it first: if you ever forget the passcode, your key gets you back in."),
      lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bgb", onClick: function () { const k = N.nsecNow && N.nsecNow(); if (k) lcCopyText(k, "Key copied. Save it in your password manager."); else { say("One moment, then press Copy key again.", true); N.load().catch(function () {}); } } }, "Copy key")),
      lh(NostrPassFields, { pass: pass, setPass: setPass, pass2: pass2, setPass2: setPass2 }),
      lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bp", disabled: busy, onClick: lock }, "Lock with passcode"))),
    st.mode === "key" && st.encrypted && lh('details', { className: "lid-details", open: weak || undefined },
      lh('summary', null, "Change passcode"),
      lh(NostrPassFields, { pass: pass, setPass: setPass, pass2: pass2, setPass2: setPass2, label: "New passcode" }),
      lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bp", disabled: busy, onClick: lock }, "Change passcode"))),
    st.mode === "key" && st.encrypted && lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bgb", onClick: unlockPass }, "Remove passcode")),
    st.queued > 0 && lh(React.Fragment, null,
      lh('p', { className: "lid-help" }, st.queued === 1 ? "1 Dream is waiting to reach relays." : st.queued + " Dreams are waiting to reach relays."),
      lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bgb", onClick: function () { N.processQueue().then(function () { const q = N.queue().length; say(q ? "Still couldn't reach relays. Looscid will try again." : "All waiting Dreams reached relays."); }); } }, "Try again now"))),
    lh('div', { className: "lid-actions" }, lh('button', { type: "button", id: "nostr-remove", className: "btn bgb", onClick: function () { setConfirmRm(true); } }, "Remove key from this device")));
  else body = lh('div', null,
    lh('fieldset', { className: "lc-fs" },
      lh('legend', { className: "lc-fs-l" }, "How do you want to add your key?"),
      lh('div', { className: "lc-radios lc-radios-col" }, [hasExt ? ["signer", "Use a signer"] : null, ["enter", "Enter my key"], ["create", "Create a new key"]].filter(Boolean).map(function (x) {
        return lh('label', { key: x[0], className: "lc-radio" + (how === x[0] ? " on" : "") },
          lh('input', { type: "radio", name: "nostr-how", value: x[0], checked: how === x[0], onChange: function () { setHow(x[0]); setMsg(null); } }), lh('span', null, x[1]));
      }))),
    how === "signer" && hasExt && lh(React.Fragment, null,
      lh('p', { className: "lid-help" }, "Your signer keeps your key. Looscid only asks it for your public key and to sign each Dream."),
      lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bp", disabled: busy, onClick: signer }, "Use my signer"))),
    how === "enter" && lh(React.Fragment, null,
      lh(SecretField, { id: "nostr-nsec", label: "Your Nostr secret key (nsec)", value: nsec, onChange: setNsec, inputRef: nsecRef }),
      lh('p', { className: "lid-help" }, "It starts with nsec1. It's saved only on this device and never sent anywhere. Never share it with anyone."),
      lh(NostrPassFields, { pass: pass, setPass: setPass, pass2: pass2, setPass2: setPass2, noPass: noPass, setNoPass: setNoPass, existing: /^\s*ncryptsec1/i.test(nsec) }),
      lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bp", disabled: busy, onClick: saveKey }, "Save key"))),
    how === "create" && lh(React.Fragment, null,
      lh('p', { className: "lid-help" }, "Looscid makes a new key on this device. Nothing is sent anywhere until you Dream."),
      lh(NostrPassFields, { pass: pass, setPass: setPass, pass2: pass2, setPass2: setPass2, noPass: noPass, setNoPass: setNoPass }),
      lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bp", disabled: busy, onClick: create }, "Create key"))));
  return lh('section', { className: "lid-panel", 'aria-labelledby': "nostr-key-h" },
    lh('h3', { id: "nostr-key-h", className: "lid-label", tabIndex: -1 }, "Nostr key"),
    lh('p', { className: "lid-help" }, "With a Nostr key, your Dreams with Audience Everyone also go to Nostr relays, so you and anyone can see them anytime, from any device. Looscid has no server."),
    lh('p', { className: "lid-help", id: "nostr-status" }, status),
    msg && lh('p', { className: msg.err ? "lid-err" : "lid-help" }, msg.t),
    body,
    lh('h4', { id: "nostr-relays-h", className: "lid-label", tabIndex: -1 }, "Relays"),
    lh('p', { className: "lid-help" }, "Your Dreams go to these relays and are read back from them."),
    lh('ul', { className: "lid-links", role: "list", 'aria-labelledby': "nostr-relays-h" }, relayList.map(function (u) {
      return lh('li', { key: u }, lh('span', { className: "lid-mono" }, u),
        lh('button', { type: "button", className: "btn bgb", 'aria-label': "Remove relay " + u, onClick: function () { rmRelay(u); } }, "Remove"));
    })),
    lh('label', { htmlFor: "nostr-relay-in", className: "lid-label" }, "Add a relay"),
    lh('input', { id: "nostr-relay-in", ref: relayRef, className: "inp", type: "url", inputMode: "url", autoComplete: "off", autoCapitalize: "off", spellCheck: false, placeholder: "wss://", value: relayIn, onChange: function (e) { setRelayIn(e.target.value); } }),
    lh('div', { className: "lid-actions" },
      lh('button', { type: "button", className: "btn bgb", onClick: addRelay }, "Add relay"),
      !N.usingDefaultRelays() && lh('button', { type: "button", className: "btn bgb", onClick: function () { setRelayList(N.resetRelays()); say("Using the default relays."); } }, "Use default relays")),
    confirmRm && lh(AlertDialog, { title: "Remove your Nostr key from this device?",
      message: "Your Dreams stay on this device and on Nostr. This device can't Dream to Nostr until you add your key again. Make sure you saved your key first: Looscid can't recover it.",
      confirmLabel: "Remove", onCancel: function () { setConfirmRm(false); lcFocusId("nostr-remove"); },
      onConfirm: function () { setConfirmRm(false); N.forget(); say("Your Nostr key was removed from this device."); lcFocusId("nostr-key-h"); } }));
}
function LcKeysPanel({ goMethods }) {
  const [kind, setKind] = useState("nostr");
  const [val, setVal] = useState("");
  const [msg, setMsg] = useState(null); // {t, err}
  const [busy, setBusy] = useState(false);
  const [ids, setIds] = useState(lcGetIds());
  const [, bump] = useState(0);
  const methods = getMethods();
  const k = LC_ID_KINDS.find(function (x) { return x.id === kind; });
  const hasExt = typeof window !== "undefined" && !!window.nostr && typeof window.nostr.getPublicKey === "function";
  const say = function (t, err) { setMsg({ t: t, err: !!err }); announce(t); };
  const add = async function () {
    const c = lcCheckId(kind, val);
    if (c.err) { say(c.err, true); const f = document.getElementById("lc-id-input"); if (f) f.focus(); return; }
    if (ids.some(function (x) { return x.kind === kind && x.id === c.id; })) { say(c.id + " is already linked.", true); return; }
    setBusy(true);
    const v = await lcVerifyId(kind, c);
    setBusy(false);
    if (v.notFound) { say("Couldn't find " + c.id + ". Check it and try again. Nothing was saved.", true); return; }
    const entry = { kind: kind, id: c.id, at: Date.now(), verified: !!v.ok, did: v.did || undefined };
    const next = lcSaveIds(ids.concat([entry])); setIds(next); setVal("");
    logActivity(k.short + " ID linked");
    say(kind === "nostr" ? "Saved your Nostr public key." : v.ok ? "Saved and verified " + c.id + "." : "Saved " + c.id + ", not verified yet. Looscid couldn't reach the server.");
  };
  const fromExt = async function () {
    try { const pk = await window.nostr.getPublicKey(); if (!/^[0-9a-f]{64}$/i.test(pk || "")) throw new Error();
      setKind("nostr"); setVal(""); 
      const entry = { kind: "nostr", id: "hex:" + pk.toLowerCase(), hex: pk.toLowerCase(), at: Date.now(), verified: true, via: "signer extension" };
      if (!ids.some(function (x) { return x.hex === entry.hex; })) setIds(lcSaveIds(ids.concat([entry])));
      say("Linked the public key from your Nostr signer extension.");
    } catch (e) { say("Your signer extension said no, or was closed. Nothing was saved.", true); }
  };
  const remove = function (x) {
    const next = lcSaveIds(ids.filter(function (y) { return !(y.kind === x.kind && y.id === x.id); })); setIds(next);
    logActivity((LC_ID_KINDS.find(function (q) { return q.id === x.kind; }) || {}).short + " ID removed");
    say("Removed " + lcIdLabel(x) + ".");
    setTimeout(function () { const h = document.getElementById("lc-keys-list-h"); if (h) h.focus(); }, 0);
  };
  const ref = useEnterSubmit(add);
  return lh('div', { className: "lid-panel" },
    lh('h3', { id: "lc-keys-list-h", className: "lid-label", tabIndex: -1 }, "Linked to your LooscidID"),
    (ids.length || methods.length) ? lh('ul', { className: "lid-links", role: "list", "aria-labelledby": "lc-keys-list-h" },
      ids.map(function (x) {
        return lh('li', { key: x.kind + x.id }, lh('span', null, lcIdLabel(x) + ", " + (x.verified ? "verified" : "not verified yet")),
          lh('button', { type: "button", className: "btn bgb", "aria-label": "Remove " + lcIdLabel(x), onClick: function () { remove(x); } }, "Remove"));
      }),
      methods.map(function (m) {
        return lh('li', { key: "m" + m.id }, lh('span', null, lcJoin(methodLabel(m), "login method")),
          lh('button', { type: "button", className: "btn bgb", "aria-label": "Remove " + lcJoin(PROVIDER_NAMES[m.provider], "login"), onClick: function () { removeMethod(m.id); bump(function (n) { return n + 1; }); say(PROVIDER_NAMES[m.provider] + " login removed."); } }, "Remove"));
      }))
      : lh('p', { className: "lid-help" }, "Nothing linked yet."),
    lh('h3', { className: "lid-label" }, "Link an ID"),
    lh('fieldset', { className: "lc-fs", id: "lc-id-kind" },
      lh('legend', { className: "lc-fs-l" }, "What are you linking?"),
      lh('div', { className: "lc-radios lc-radios-col" }, LC_ID_KINDS.map(function (x) {
        return lh('label', { key: x.id, className: "lc-radio" + (kind === x.id ? " on" : "") },
          lh('input', { type: "radio", name: "lc-id-kind", value: x.id, checked: kind === x.id, onChange: function () { setKind(x.id); setMsg(null); } }), lh('span', null, x.name));
      }))),
    lh('label', { htmlFor: "lc-id-input", className: "lid-label" }, k.name),
    lh('p', { className: "lid-help", id: "lc-id-help" }, k.help),
    lh('input', { id: "lc-id-input", ref: ref, className: "inp", type: "text", autoCapitalize: "off", autoCorrect: "off", spellCheck: false, placeholder: k.ph, value: val,
      "aria-invalid": msg && msg.err ? "true" : undefined, onChange: function (e) { setVal(e.target.value); } }),
    lh('button', { type: "button", className: "btn bp lid-wide", disabled: busy, onClick: add }, busy ? "Checking\u2026" : "Link " + k.short + " ID"),
    kind === "nostr" && hasExt ? lh('button', { type: "button", className: "btn bgb lid-wide", onClick: fromExt }, "Use my Nostr signer extension") : null,
    msg && lh('p', { className: msg.err ? "lid-err" : "lid-saved" }, msg.t),
    lh('p', { className: "lid-help" }, "Linking shows these IDs on your LooscidID. To log in or Dream with a network, add it in Login methods."),
    lh('button', { type: "button", className: "btn bgb lid-wide", onClick: goMethods }, "Open Login methods"));
}
function lcIdLabel(x) {
  const k = LC_ID_KINDS.find(function (q) { return q.id === x.kind; }) || { short: x.kind };
  const id = x.kind === "nostr" ? (x.id.indexOf("hex:") === 0 ? x.hex.slice(0, 8) + "\u2026" + x.hex.slice(-4) : x.id.slice(0, 12) + "\u2026" + x.id.slice(-4)) : x.id;
  return k.short + ", " + id;
}
/* --- LooscidID Manager (Settings > Account) -------------------------------
   Modelled on the Google Account page (2three1y, Oct 8 2026: "Make it like How Google
   Makes it"): a header with your avatar, name and @username, then real tabs:
   Home, Personal info, Data & privacy, Security, People & sharing. No payments.
   Alerts are not here; they have their own section. */
const LID_TABS = [["home", "Home"], ["info", "Profile"], ["methods", "Login methods"], ["keys", "Keys and IDs"], ["security", "Security"], ["devices", "Devices"], ["data", "Data"], ["apps", "Connected apps"]];
Looscid.LID_TABS = LID_TABS;
function lidWhen(t) { try { return new Date(t).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); } catch (e) { return ""; } }
function thisDeviceLabel() {
  const ua = navigator.userAgent || "";
  const br = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Web browser";
  const os = /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  return br + (os ? " on " + os : "");
}
function localDataSummary() {
  const p = getLocalProfile() || {};
  const methods = getMethods();
  let drafts = []; try { drafts = getDrafts() || []; } catch (e) {}
  const topics = getTopics();
  return [
    { k: "Profile", v: "Name, @username" + (p.bio ? ", bio" : "") + (p.website ? ", website" : "") + ((p.links || []).length ? ", " + p.links.length + " social links" : "") },
    { k: "Login methods", v: methods.length ? methods.length + " linked, public identifiers only" : "None yet" },
    { k: "Nostr secret key", v: getStoredNostrSk() ? "Saved on this device" : "Not saved here" },
    { k: "Topics", v: topics.length ? topics.length + " chosen" : "None chosen" },
    { k: "Drafts", v: drafts.length ? drafts.length + " saved" : "None" },
    { k: "Circles you made", v: (function () { const n = Looscid.lcCirclesRead ? Looscid.lcCirclesRead().length : 0; return n ? n + " saved" : "None"; })() },
    { k: "Settings", v: "Theme, accessibility and app preferences" },
    { k: "Security activity", v: getActivity().length + " recent events" },
  ];
}
function exportLocalData() {
  // Secret keys and login tokens are left out on purpose.
  let drafts = []; try { drafts = getDrafts() || []; } catch (e) {}
  const data = { app: "Looscid", exportedAt: new Date().toISOString(), note: "Secret keys and login tokens are not included.",
    profile: getLocalProfile(), loginMethods: getMethods().map(function (m) { return { provider: m.provider, publicId: m.publicId, linkedAt: m.at }; }),
    topics: getTopics(), drafts: drafts, circles: Looscid.lcCirclesRead ? Looscid.lcCirclesRead() : [], securityActivity: getActivity() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "looscid-my-data.json"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  logActivity("Data exported");
}
function deleteLocalData() {
  try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf("looscid_") === 0 || k.indexOf(Looscid.LC_OLD_PREFIX) === 0) localStorage.removeItem(k); /* and any old-prefix key left from before build 150 */ }); } catch (e) {}
}
function LooscidIDManager({ navigate, authUser, onUpdateProfile, initialTab, onBack, title, securityExtra }) {
  const [tab, setTab] = useState(initialTab || "home");
  const [idn, setIdn] = useState(getIdentity());
  const [, bump] = useState(0);
  useEffect(function () { const f = function () { setIdn(getIdentity()); bump(function (n) { return n + 1; }); }; window.addEventListener("looscid-methods", f); return function () { window.removeEventListener("looscid-methods", f); }; }, []);
  const [note, setNote] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const ed = useProfileEditor(authUser, onUpdateProfile, navigate);
  const wrapRef = useRef(null);
  useEffect(function () { const h1 = wrapRef.current && wrapRef.current.querySelector("h1"); if (h1) h1.focus(); }, []);
  if (ed.editing) return ed.screen;
  const u = authUser || {};
  const name = u.displayName || "Dreamor";
  const handle = u.handle || "@dreamor";
  const N = LID_TABS.length;
  const idx = LID_TABS.findIndex(function (t) { return t[0] === tab; });
  const onTabKey = function (e) {
    let n = null;
    if (e.key === "ArrowRight") n = (idx + 1) % N; else if (e.key === "ArrowLeft") n = (idx + N - 1) % N; else if (e.key === "Home") n = 0; else if (e.key === "End") n = N - 1;
    if (n === null) return; e.preventDefault(); setTab(LID_TABS[n][0]);
    setTimeout(function () { const b = document.getElementById("lid-tab-" + LID_TABS[n][0]); if (b) { b.focus(); b.scrollIntoView({ block: "nearest", inline: "nearest" }); } }, 0);
  };
  // Cards on Home jump to a section and land on its heading.
  const go = function (t, focusId) {
    setNote(""); setTab(t);
    setTimeout(function () { const el = document.getElementById(focusId || "lid-panel-h"); if (el) { el.focus(); } }, 0);
  };
  const methods = getMethods();
  const sk = getStoredNostrSk();
  const suggestions = [];
  if (!methods.length) suggestions.push("Add a login method so you can log in on other devices");
  if (idn && idn.method === "local" && sk) suggestions.push("Keep a copy of your Nostr secret key somewhere safe");
  if (idn && idn.method === "local" && sk) suggestions.push("Lock your Nostr key with a passcode, in Keys and IDs, so nothing else on this site can copy it");
  const checkup = suggestions.length ? suggestions.length + (suggestions.length === 1 ? " suggestion" : " suggestions") + ": " + suggestions[0] : "No issues found";
  const methodsText = methods.length ? methods.map(function (m) { return PROVIDER_NAMES[m.provider]; }).join(", ") : "None yet. Add one any time";
  const summary = localDataSummary();
  const PH = function (text, help) { return lh(React.Fragment, null,
    lh('h2', { id: "lid-panel-h", className: "lid-sub", tabIndex: -1 }, text),
    help ? lh('p', { className: "lid-help" }, help) : null); };
  const Card = function (k, t, sub, onClick) {
    return lh('li', { key: k }, lh('button', { type: "button", className: "lid-gcard", id: "lid-card-" + k, onClick: onClick, "aria-label": lcJoin(t, sub) },
      lh('span', { className: "lid-gcard-t", "aria-hidden": "true" }, t), lh('span', { className: "lid-gcard-s", "aria-hidden": "true" }, sub)));
  };
  let panel;
  if (tab === "home") panel = lh(React.Fragment, null,
    PH("Welcome, " + name, "Manage your info, privacy and security to make Looscid work better for you."),
    lh('ul', { className: "lid-gcards", 'aria-label': "Your LooscidID at a glance" },
      Card("info", "Profile", "Name " + name + ", username " + handle, function () { go("info"); }),
      Card("methods", "Login methods", methodsText, function () { go("methods", "lid-methods-h"); }),
      Card("keys", "Keys and IDs", (function () { const n = lcGetIds().length; return n ? n + " linked " + (n === 1 ? "ID" : "IDs") : "Link your Nostr, fediverse or Bluesky ID"; })(), function () { go("keys"); }),
      Card("checkup", "Security checkup", checkup, function () { go("security", "lid-checkup-h"); }),
      Card("devices", "Devices", "This device, " + thisDeviceLabel(), function () { go("devices"); }),
      Card("data", "Data", summary.length + " kinds of data, stored only on this device", function () { go("data"); }),
      Card("apps", "Connected apps", methods.length ? methods.length + " linked " + (methods.length === 1 ? "identity" : "identities") : "None yet", function () { go("apps"); })));
  else if (tab === "info") panel = lh(React.Fragment, null,
    PH("Profile", "Your name, username, avatar and bio. Choose a field to change it."),
    ed.list);
  else if (tab === "data") panel = lh(React.Fragment, null,
    PH("Data", "Your data stays on this device. Nothing is sent to a Looscid server."),
    lh('h3', { className: "lid-label" }, "What's stored on this device"),
    lh('ul', { className: "lid-dl lc-rows", role: "list" }, summary.map(function (r) { return lh('li', { key: r.k }, lh('span', { className: "lc-dt" }, r.k, lh('span', { className: "sr-only" }, ":")), " ", lh('span', { className: "lc-dd" }, r.v)); })),
    lh('h3', { className: "lid-label" }, "Download your data"),
    lh('p', { className: "lid-help", id: "lid-export-help" }, "Get a copy of your profile, login methods, topics, drafts and security activity as a JSON file. Secret keys and login tokens are left out."),
    lh('button', { type: "button", className: "btn bgb lid-wide", onClick: function () { exportLocalData(); setNote("Your data was downloaded as looscid-my-data.json."); announce("Data downloaded"); } }, "Export my data"),
    note && lh('p', { className: "lid-saved" }, note),
    lh('h3', { className: "lid-label" }, "Delete your data"),
    lh('p', { className: "lid-help", id: "lid-delete-help" }, "Erase your LooscidID, logins, keys, drafts and settings from this device. Looscid then starts fresh with a new LooscidID."),
    lh('button', { type: "button", id: "lid-delete-data", className: "btn bgb lid-wide", onClick: function () { setConfirmDel(true); } }, "Delete local data"),
    lh('h3', { className: "lid-label" }, "Settings and privacy"),
    lh('p', { className: "lid-help" }, "Who can see and reply to your Dreams, and how people find you, are in Settings, Privacy, Permissions. A file with just your settings is in Settings backup."),
    lh('button', { type: "button", className: "btn bgb lid-wide", onClick: function () { navigate("settings_privacy"); } }, "Open Privacy and permissions"),
    lh('button', { type: "button", className: "btn bgb lid-wide", onClick: function () { navigate("settings_backup"); } }, "Open Settings backup"),
    confirmDel && lh(AlertDialog, { title: "Delete all Looscid data on this device?",
      message: "This erases your LooscidID, login methods, any Nostr key saved here, drafts and settings. It can't be undone. Export your data first if you want a copy.",
      confirmLabel: "Delete", onCancel: function () { setConfirmDel(false); setTimeout(function () { const b = document.getElementById("lid-delete-data"); if (b) b.focus(); }, 0); },
      onConfirm: function () { setConfirmDel(false); deleteLocalData(); location.reload(); } }));
  else if (tab === "security") panel = lh(React.Fragment, null,
      PH("Security", "Settings and suggestions to keep your LooscidID safe."),
      lh('section', { 'aria-labelledby': "lid-checkup-h", className: "lid-panel" },
        lh('h3', { id: "lid-checkup-h", className: "lid-label", tabIndex: -1 }, "Security checkup"),
        suggestions.length ? lh('ul', { className: "lid-help", style: { paddingLeft: 20, margin: 0 } }, suggestions.map(function (s2) { return lh('li', { key: s2 }, s2); }))
          : lh('p', { className: "lid-help" }, "No issues found.")),
      idn && idn.method === "nip07" && lh('p', { className: "lid-help" }, "Your Nostr key stays in your signer extension. Looscid never sees it."),
      idn && idn.method === "local" && sk && lh(React.Fragment, null,
        lh('h3', { className: "lid-label" }, "Your Nostr key"),
        lh('p', { className: "lid-warn", id: "lid-sec-warn" }, "Your secret key is saved only in this browser on this device. Anyone with it can Dream as you."),
        lh(SecretField, { id: "lid-nsec-view", label: "Your secret key (nsec)", value: (window.NostrTools ? window.NostrTools.nip19.nsecEncode(hexToBytes(sk)) : sk), readOnly: true, describedBy: "lid-sec-warn" })),
      lh('h3', { className: "lid-label" }, "Recent security activity"),
      (function () { const acts = getActivity().slice(0, 8); return acts.length
        ? lh('ul', { className: "lid-links", 'aria-label': "Recent security activity" }, acts.map(function (a2, i2) { return lh('li', { key: i2 }, lh('span', null, a2.what + ", " + lidWhen(a2.at))); }))
        : lh('p', { className: "lid-help" }, "No security activity yet."); })(),
      securityExtra || null);
  else if (tab === "methods") panel = lh(React.Fragment, null,
    PH("Login methods", "Optional ways to log in with your LooscidID. When you link one, you choose whether people can find you by it."),
    lh(LoginMethods, null));
  else if (tab === "keys") panel = lh(React.Fragment, null,
    PH("Keys and IDs", "Your Nostr key and your fediverse and Bluesky handles. Link one by pasting it: no password, nothing shared."),
    lh(NostrKeySection, null),
    lh(LcKeysPanel, { goMethods: function () { go("methods", "lid-methods-h"); } }));
  else if (tab === "devices") panel = lh(React.Fragment, null,
    PH("Devices", "Where your LooscidID is signed in."),
    lh('h3', { className: "lid-label" }, "This device"),
    lh('ul', { className: "lid-links", 'aria-label': "Your devices" }, lh('li', null, lh('span', null, "This device, " + thisDeviceLabel() + ", active now"))),
    lh('h3', { className: "lid-label" }, "Other devices"),
    lh('p', { className: "lid-help" }, "None. Your LooscidID lives only on this device for now."));
  else panel = lh(React.Fragment, null,
    PH("Connected apps", "Networks and apps linked to your LooscidID."),
    lh('h3', { className: "lid-label" }, "Linked identities"),
    methods.length ? lh('ul', { className: "lid-links", 'aria-label': "Linked identities" }, methods.map(function (m) {
      const fk = LC_FIND_KEY[m.provider];
      return lh('li', { key: m.id }, lh('span', null, methodLabel(m) + (fk ? (Looscid.A11Y_NOW[fk] ? ", people can find you by it" : ", hidden from search") : "")));
    })) : lh('p', { className: "lid-help" }, "None yet. Link Nostr, Mastodon, Bluesky or Pubky in Login methods."),
    lh('button', { type: "button", className: "btn bgb lid-wide", onClick: function () { go("methods", "lid-methods-h"); } }, "Open Login methods"),
    lh('h3', { className: "lid-label" }, "Apps using your LooscidID"),
    lh('p', { className: "lid-help" }, "No apps use your LooscidID yet."));
  return lh('div', { className: "pg", ref: wrapRef },
    lh(BackHeader, { title: title || "LooscidID", onBack: onBack || function () { navigate("settings"); } }),
    lh('div', { className: "lid-ghead" },
      lh('div', { className: "lid-gavatar", 'aria-hidden': "true" }, u.initials || "D"),
      lh('p', { className: "lid-gname" }, name),
      lh('p', { className: "lid-ghandle" }, handle + ", LooscidID"),
      lh('p', { className: "lid-help" }, "Manage your LooscidID")),
    lh('div', { role: "tablist", 'aria-label': "LooscidID",  className: "ftabs lid-tabs", onKeyDown: onTabKey },
      LID_TABS.map(function (t, i) {
        const on = t[0] === tab;
        return lh('button', { key: t[0], id: "lid-tab-" + t[0], role: "tab", className: "ftab" + (on ? " on" : ""), 'aria-selected': on ? "true" : "false",
          'aria-controls': "lid-panel", tabIndex: on ? 0 : -1, onClick: function () { setNote(""); setTab(t[0]); } }, t[1]);
      })),
    lh('div', { id: "lid-panel", role: "tabpanel", 'aria-labelledby': "lid-tab-" + tab, className: "lid-body" }, panel));
}
Looscid.LC_FORCED = {}; // Private account forces two Permissions
// What each event is called, for previews, mapping and captions.
const LC_EVENTS = [["send", "Send"], ["like", "Like"], ["newDream", "New Dream"], ["error", "Error"], ["alerts", "Alert"], ["feedSwitch", "Feed switch"], ["focus", "Focus move"], ["open", "Open"], ["close", "Close"], ["run", "Done"], ["link", "Link"], ["boot", "Boot chime"]];
Looscid.LC_EVENTS = LC_EVENTS;
const LC_AUDIO_EXT = { wav: "audio/wav", mp3: "audio/mpeg", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg", m4a: "audio/mp4", aac: "audio/aac", webm: "audio/webm", flac: "audio/flac" };
Looscid.LC_AUDIO_EXT = LC_AUDIO_EXT;
const LC_PACK_LIMITS = { fileBytes: 1024 * 1024, totalBytes: 8 * 1024 * 1024, files: 24, seconds: 3 };
Looscid.LC_PACK_LIMITS = LC_PACK_LIMITS;
const lcPackPut = function (v) { return lcIdbDo("readwrite", function (s) { return s.put(v, "custom"); }); };
Looscid.lcPackPut = lcPackPut;
const lcPackDel = function () { return lcIdbDo("readwrite", function (s) { return s.delete("custom"); }); };
Looscid.lcPackDel = lcPackDel;
// A small zip reader: stored and deflated entries (DecompressionStream "deflate-raw").
async function lcUnzip(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf); let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error("That file isn't a zip.");
  const count = dv.getUint16(eocd + 10, true); let p = dv.getUint32(eocd + 16, true); const out = [];
  for (let n = 0; n < count && n < 200; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), loc = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nlen)); p += 46 + nlen + xlen + clen;
    if (/\/$/.test(name) || /(^|\/)(__MACOSX|\.)/.test(name)) continue;
    const ds = loc + 30 + dv.getUint16(loc + 26, true) + dv.getUint16(loc + 28, true), raw = u8.slice(ds, ds + csize);
    let data;
    if (method === 0) data = raw.buffer;
    else if (method === 8) {
      if (typeof DecompressionStream === "undefined") throw new Error("This browser can't open compressed zips. Add the files one by one instead.");
      data = await new Response(new Response(new Blob([raw])).body.pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer();
    }
    else { out.push({ name: name.split("/").pop(), size: usize, bad: "uses a zip method Looscid can't open" }); continue; }
    out.push({ name: name.split("/").pop(), size: data.byteLength, data: data });
  }
  return out;
}
// Check files: audio type by extension and header, size, and that it decodes and is short.
async function lcCheckPackFiles(entries) {
  const ok = [], bad = []; let total = 0;
  const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  for (const f of entries) {
    if (f.bad) { bad.push(f.name + ": " + f.bad); continue; }
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!LC_AUDIO_EXT[ext]) { bad.push(f.name + ": not an audio file"); continue; }
    if (f.size > LC_PACK_LIMITS.fileBytes) { bad.push(f.name + ": bigger than 1 MB"); continue; }
    if (ok.length >= LC_PACK_LIMITS.files) { bad.push(f.name + ": more than " + LC_PACK_LIMITS.files + " files"); continue; }
    if (total + f.size > LC_PACK_LIMITS.totalBytes) { bad.push(f.name + ": the pack would pass 8 MB"); continue; }
    let dur = null;
    try { if (AC) { const ctx = new AC(1, 44100, 44100); const b = await ctx.decodeAudioData(f.data.slice(0)); dur = b.duration; } }
    catch (e) { bad.push(f.name + ": couldn't be played as audio"); continue; }
    if (dur !== null && dur > LC_PACK_LIMITS.seconds) { bad.push(f.name + ": longer than 3 seconds"); continue; }
    total += f.size; ok.push({ name: f.name, type: LC_AUDIO_EXT[ext], size: f.size, data: f.data, dur: dur });
  }
  return { ok: ok, bad: bad };
}
function lcAutoMap(files) {
  const map = {}, words = { send: ["send", "sent", "post"], like: ["like", "heart", "fav"], newDream: ["new", "dream", "incoming", "notify"], error: ["error", "fail", "bad", "wrong"], alerts: ["alert", "notification", "ding", "bell"], feedSwitch: ["feed", "switch", "tab"], focus: ["focus", "tick", "swipe", "move"], open: ["open"], close: ["close"], run: ["done", "run", "ok", "success"], link: ["link", "chirp"], boot: ["boot", "startup", "chime"] };
  LC_EVENTS.forEach(function (ev) { const f = files.find(function (x) { const n = x.name.toLowerCase(); return (words[ev[0]] || []).some(function (w) { return n.indexOf(w) >= 0; }); }); if (f) map[ev[0]] = f.name; });
  return map;
}
const LOOSCID_FEATURE_BUILDS = 117; // builds without the fix updates
Looscid.LOOSCID_FEATURE_BUILDS = LOOSCID_FEATURE_BUILDS;
const LOOSCID_FIXES = 33;
Looscid.LOOSCID_FIXES = LOOSCID_FIXES;
const LC_VERSION_HISTORY = [
  { version: "2026.117.33", build: 150, released: LOOSCID_RELEASED, title: "Round 7", notes: [
    "Round 7: a feature update, asked for by 2three1y. Built in steps, one commit each.",
    "Every menu, sheet, dialog and pop-up is truly modal (2three1y: after the last item in Create, VoiceOver read Home and the status page behind it). While one is open, everything outside it is hidden from VoiceOver, braille and the keyboard; Tab and Shift+Tab stay inside a dialog; when it closes, focus goes back to the button that opened it. The live announcer still speaks. Covers Create, More, the Commandbar, pop-up menus, Dream options, alerts, Circle sheets and Reset. Escape now closes More too.",
    "Fix (2three1y, testing on iPhone): VoiceOver read a whole menu's contents as its hint. Every menu, sheet and dialog now has one short hint of its own: menus say Swipe to choose. Escape or a two-finger scrub closes; sheets and dialogs say Swipe to move through it. Escape or a two-finger scrub closes. Only the menu or dialog itself has a hint, never a button or other control.",
    "Braille roles like a BrailleNote (KeySoft): every button shows edbt instead of btn, a radio button shows ⠺⠿⠗ when it's on and ⠺⠤⠗ when it's off, and a checkbox shows ⠸⠿⠇ when it's on and ⠸⠤⠇ when it's off. BrailleNote is the new Button style on braille and the default (iPhone btn moves to it once). Braille only: nothing changes on screen, and speech still says button, radio button and checkbox with their state. Still to be checked on a real iPhone with a braille display.",
    "The settings page for screen readers and braille is called Sense now, everywhere: Settings, Accessibility, Find a setting, the Commandbar (open sense works, and the old words still work), Help Center and status. The tabs inside are the same.",
    "Pitch cues moved from the Verbosity tab to the Speech tab: the switch, the Pitch cue for checkboxes and Preview every pitch cue. Moved only: the cues, the settings and what they sound like are exactly the same.",
    "Settings are laid out like Feditext's Preferences: rows that follow each other join into one rounded group with thin lines between them, the value (On, Off) sits on the right in grey, and section headings are small and grey above their group. Only the look changed.",
    "Profiles: the header count is in parentheses, like Dreams (400), and it updates live. If the Dreamor publishes while you're on their profile (your own too), Looscid says “<their name> just published”. Focus never moves.",
    "Profiles: the header shows the exact moment you joined, like Joined Sunday, October 11, 2026 at 3:12 PM (Eastern Time), in your own time zone, the same as About. Older LooscidIDs that only kept the month now show the full date and time too.",
    "Profiles: the top button is called Dreamor options instead of More. Same list, same behavior.",
    "The Home tab before the feed tabs is gone: the feed tabs start at For You. If you were on Home, you land on For You.",
    "Thread view, like 2three1y's Feditext idea: opening a Dream's replies shows just that Dream. Expand thread shows the whole thread, the Dreams above it and every reply; the same button then says Collapse thread. The words change in place and focus stays on the button.",
    "Each Dream's options button is Feditext's More button now. Its pop-up starts with Feditext's items in Feditext's order: Like (Feditext's Bookmark), Mute, Block, and Report (coming soon) for someone else's Dream, then Looscid's own (Read, Hear thread, Translate, Share, profile, Ask Cherry). Closing it says Close More.",
    "Help in More is a real pop-up menu button now (2three1y, 4:36 PM): it opens a menu with Help Center and Commands. Up and Down move, Enter opens, Escape closes it and puts you back on Help. Commands isn't its own section in More anymore. Back from Commands puts you on Help.",
    "Liked: the Images only checkbox is gone. Liked has a Media tab (after Dreams) that starts with Show: Photos, GIFs and Videos, three checkboxes, all on; turn any off and Looscid says how many liked Dreams are left.",
    "Back sounds (2three1y: Liked's Back played no sound): every Back was checked. Liked, your own profile and Apps now go Back the same way Settings screens do: More opens again on the button you came from, with the same Back sound.",
    "Undo words: Unredream, Unquote Dream, and Unlike / Unliked, everywhere they appear (the old two-word Undo labels are gone).",
    "Memeprojects is one word everywhere now (2three1y: it is Memeprojects, not Meme Projects): Apps, Projects, the Commandbar (open memeprojects; the old words still work), Find a setting, Help Center, Credits and Looscid OS.",
    "Cherry has its own page called Cherry - DO IT YOUR WAY (More just links to it). The Try asking suggestions and the canned answer are gone: when Cherry doesn't understand, it says so and changes nothing. New Chat is at the top, then Your History with All and Pinned, then the chat you're in. Each chat has a Chat options pop-up menu: Pin or Unpin, Edit name, Project and Share access (both coming soon), Delete (asks first), New Chat, History and Close Menu. Capitals never matter to Cherry.",
    "Settings, Intelligence has three new pages for Cherry, kept apart from the feed settings: Memory (save chats in Your History on or off, Delete all chats), Tools (what Cherry may do for you, all on to start; a tool that's off is never run) and What Cherry did (everything Cherry did, with Undo; it used to be on the Cherry page).",
    "Credits and open source is rewritten in my own words: it starts with \"This page is where I say thanks\", my own projects have their own section, every license is a link to that project's real license, and every project has a link like \"NexOS on GitHub\" instead of a raw web address.",
    "Create Circle makes a real Circle now (2three1y: it just closed the sheet). It opens your new Circle with focus on its name and says \"Circle created\" once. Circles you make stay after a reload: they're kept on this device as looscid_circles, and Settings backup exports and imports them (older backups still import).",
    "The old Dream Board name is gone, even under the hood (2three1y): everything Looscid saves on your device is named looscid_ now. The first time you open this build, it moves your Dreams, Liked, Cherry chats, settings, Nostr key and Soundpacks over by itself and deletes the old copies. Nothing is lost, and older settings backups still import.",
    "Fix (2three1y: VoiceOver kept saying description on every item): the short hints on every menu, sheet and dialog are gone. VoiceOver read each one as \"description\" and repeated it on every move inside More, Create, menus, sheets and Circle steps. Menus and dialogs say only their name now; Escape or a two-finger scrub still closes them.",
    "Fix (2three1y: VoiceOver said description after every value): profile About and fields, Built-in shortcuts, the LooscidID data summary and the welcome glossary are plain list rows now, read as \"Label: value\". They looked like definition lists, which VoiceOver on iPhone calls \"description\". They look the same as before.",
    "Fix (2three1y): Dreamor options is a real pop-up menu now, after the name and @handle. It opens on the first item, closes with Escape or a two-finger scrub, closes after you choose, and never stays open from one profile to the next. Someone else's profile: Follow, Message, Ask Cherry for a summary, Share, Copy LooscidID link, Hide Redreams, Add note, Mute, Block, Report. Yours: Edit profile, Share, Copy LooscidID link, View as others see it, Settings. The header no longer repeats \"Dreams (N)\" and Joined, About says \"About\" and the name, and \"just published\" no longer fires for old Dreams.",
    "Fix (2three1y): Create Circle reads properly now. Each step's heading says \"Step 1 of 3\" and gets focus when you go to the next or previous step. Icon, Category and Privacy are radio buttons that say when they're checked, and Privacy reads its explanation as part of each choice. No more \"star\", \"slash\" or \"right arrow\", and Escape closes the sheet.",
    "Real hints, like a Swift app's (2three1y): only controls whose action isn't obvious get one, and VoiceOver reads it after a short pause, following your Hints setting. A Dream's replies count says \"Opens the thread.\", Redreams \"Opens Redream and Quote.\", More \"Opens actions for this Dream.\", Expand thread and Collapse thread say what they show, and the Following and Followers counts say \"Opens the list.\" Unavailable items say just their name, with the reason as the hint. No hints on menus, dialogs, lists, tabs or obvious buttons like Like.",
    "Words, per 2three1y's rule: the status page now says \"Publishing, viewing and interacting with Dreams\", and the community rules say \"Share authentic Dreams\" and \"Do not publish\". Every word you read in Looscid uses publish or Dream, and so do the new hints.",
    "Restored the terminology guide and added the post rule.",
    "Cleaner repository: docs that covered the same subject are merged, docs live in docs/guides and docs/dev, and the app's files are in an app folder. Looscid's address and every page in it stay the same.",
    "Looscid says 2three1y everywhere now: About Looscid (\"I'm 2three1y, a blind developer\"), the project pages, the Commandbar and the docs. License copyright lines are unchanged for now.",
    "Credits looks like a normal credits page now: a centered roll grouped by role (Created by, Design references, Open-source libraries and licenses, Voices and sounds, Special thanks) with plain headings and lists. Every credit and license link is still there, and nothing scrolls by itself.",
    "More reads cleaner with VoiceOver: no item in More is a heading anymore. Each section and each item is one plain button or link in a list, so VoiceOver reads just its name and \"button\".",
    "The site footer is back, at the end of every page: Social (GitHub, X and YouTube), Legal (Terms, Privacy, Rules and a new Child Safety page), Values (our accessibility commitment) and Download. It is a real footer landmark with a heading per group, and it never covers anything.",
    "Edit profile opens again: when VoiceOver brings a control into view, it now lands below the page header instead of under it, so a double tap on Edit profile can no longer land on the Commandbar button.",
    "Commandbar lives in More now: \"Open Commandbar\" is a plain button there, and Control K or Command K still open it anywhere. The floating Commandbar button at the top is gone, so it can't catch taps meant for Edit profile or anything else.",
    "Discover is search and browsing only: Ask Cherry is gone from it (the Trending button, the Ask Cherry row above results, Draft on trending tags and Ask Cherry when nothing is found).",
    "Numbers are never shortened: Looscid and Cherry always show the whole number, like 19,637, never 19.6K. Cherry only reports trending tags that really exist.",
    "Save in Edit profile and in the Circle forms stays dimmed until you actually change something, and dims again if you undo it. VoiceOver still finds it and tells you why it's dimmed.",
    "Bios and Circle descriptions have no length limit and support Markdown: headings, lists, quotes, links, bold, italic, inline code and code blocks. Code blocks are their own readable block for VoiceOver and braille, and raw HTML never runs.",
    "More holds only Looscid features now. About Looscid, Credits, Legal and the social links live in the site footer at the end of every page, and their pages work as before.",
    "Every page has its own address now, like looscid.github.io/Looscid/Settings/Sense, and letter case doesn't matter (/settings/sense works too, and so does /@avatest for a profile). Every More item opens its own page: Settings is \"Settings - Adjust your life\", and Discover, Apps, Create, Alerts and Projects each have one. Help is still its pop-up menu.",
    "NexOS inside Looscid is Looscid OS now: the desktop, the Looscid terminal with its looscid> prompt, the boot text, the beats and the Looscid OS classic Soundpack (same sounds). Its pages moved to looscid.github.io/Looscid/os/, and old nexos addresses still open the same page there. Your saved settings and backups don't change.",
    "Shared Looscid links show a preview card now, with the Looscid logo and a short line about Looscid, on X, iMessage, Discord and other apps.",
    "Cherry says what she did, once (\"Cherry followed Ava\"), and shows it in the chat as a row like \"Followed 1 Dreamor, Expand\" that opens to the details. When there's nothing to act on, she says so instead of saying Done.",
    "Menus and sheets say only their name when they open, like Spring: More says \"More\", Create says \"Create\", and a pop-up menu says its name. Swipe or press Down to reach the items.",
    "The feed has For You, Following and Federated tabs now. Federated has Popular, Latest and Local, and you choose which networks it reads (Looscid and Nostr today). Local is Dreams from around you, and it stays off until you turn it on. For You has Show following with its own switches, For You and Following have a Sort (Latest or Popular), and you can pin a Circle, a person, a hashtag or a thread as its own tab.",
    "The tab bar comes before the footer now: swipe from the content to the tab bar, ending with More, and the footer is the very last thing on every page. And no more stray \"Looscid, page\" at the very end: what Looscid says no longer stays behind as text after it's spoken.",
    "Rotor Actions on Dreams and Cherry chats are gone: VoiceOver on iPhone doesn't offer them from web pages, so they only added noise. Like, Redream (with Quote inside), Reply and More stay as the buttons on every Dream, and Chat options still has Pin and Delete.",
    "No more Image Recognition offers from VoiceOver: every icon inside a button or row is hidden from screen readers now, since its button already says what it is. Avatars keep their names.",
    "Settings looks like Spring now: Sense is pinned alone at the top, every row says its current value after its name (like \"Customizability, Dark theme\" or \"Intelligence, Cherry off\"), and the new Settings, Tab Bar page lets you show or hide each tab and move it up or down with plain buttons. Tabs you pinned on the feed can be added as custom tabs. More is always last.",
    "Subscribe to thread: a Dream's More menu has Subscribe to thread (and Unsubscribe from thread). New replies in a thread you follow show up in Alerts as \"New reply in a thread you follow\", whether they reach Looscid directly or come from Nostr relays that tag the thread. On the web it's in the app only; the native apps can make it a push notification.",
    "Profiles: the second tab is just \"Replies\" now, and it shows only your replies, no top-level Dreams (those stay in the Dreams tab). When there are none it says \"No Replies yet\" and \"Your Replies will show up here.\"",
    "Replies tab: each reply now says what it answers, first thing inside it, like \"Replying to Tomo: \" and the start of Tomo's Dream (or the reply it answers). When that Dream isn't on your device it says \"Replying to @tomo\". A hidden or blocked Dream shows no text, and one with a content warning shows the warning.",
    "Alerts is an Inbox now, laid out like Reddit's: one row of tabs (All, Unread, Messages, Replies, Mentions, Likes, Redreams, Quotes, New Dreamor), Send a message and Mark all read at the top, similar alerts grouped (\"Liked by Ava and 3 others\"), and a More button on every row with Reply, Mark read and Block. Replies has an \"Only threads I follow\" checkbox. Messages are real private messages on Nostr (NIP-17), end-to-end encrypted: write to anyone by their npub, and a new message is read out once without moving your focus. Likes, Redreams, Quotes, mentions, replies and new Dreamors come from Nostr too, with no server.",
    "Who can message me now really applies to private messages: a message from someone the setting doesn't allow stays hidden and silent on your device (the Messages tab says how many Dreamors are waiting, with a Message settings button), and changing the setting shows them. A conversation you started always shows.",
    "Home on small screens: only the feed tabs stay pinned at the top while you scroll. The title, welcome line and feed options scroll away, so they no longer cover the first Dream's buttons.",
    "Profile Tabs: put the tabs on profiles in your own order (Dreams, Replies, Redreams, Media, Liked, Mutual likes, About) in Settings, Profile Tabs, with plain Move up and Move down buttons like the Tab Bar. Also in a profile's options as Reorder tabs. Saved in your settings backup.",
    "Security: React now loads from Looscid itself, not from an outside code site, and the browser checks it wasn't changed.",
    "Dream options: Copy link, Open original on Nostr or Mastodon, Liked by and Redreamed by (who, from Nostr, each signature checked), and Dream info (when it was published, its network and the app it came from).",
    "Dream options: Pin to profile (up to 5 of your Dreams, shown first on your Dreams tab and read as \"Pinned\"), Mute this conversation (no more alerts from that thread) and, on For You, Not interested in this Dream (hides it there and moves you to the next Dream).",
    "Fixed: on Home, Federated, a Networks checkbox could open Create instead. The page used to scroll underneath the tab bar, so a control VoiceOver moved to could sit behind it, and a double tap landed on the tab bar's middle button, Create. Now every page ends at the top of the tab bar, so nothing is ever behind it.",
    "Edit Dream: change the text of your own Dream or reply from its options. It shows \"Edited\" everywhere, Edit history keeps every earlier version readable, and a Dream on Nostr gets its edit published there too (kind 1010, so apps that support edits show it). Edited Federated Dreams from Nostr show their author's edit as well.",
    "Inbox earcons: Messages, Replies, Mentions, Likes, Redreams, Quotes and New Dreamor each have their own new, gentle earcon instead of the plain Alert earcon. They follow the Alert switch, volume, Calm mode and quiet hours, and you can preview each one in Settings, Earcons, Event earcons, under Inbox earcons. No existing earcon changed.",
    "Security: Looscid OS apps and Projects now run in a locked-down sandbox, so none of them can reach your Nostr key. Their saved settings come along.",
    "Profile options: Share profile now shares the profile's LooscidID link, and there's a QR code (with the link written out and what scanning does, for anyone who can't see it), Copy username, and Open original profile on Nostr, Mastodon or Bluesky when the Dreamor is there.",
    "Lists: make your own lists of Dreamors in More, Lists, and each one is its own feed of their Dreams. Add someone from their profile's options with Add to list (a checkbox for each list, or make a new one right there). Rename, delete and remove people anytime. Only you see them, and they're in your settings backup.",
    "Lists are custom feeds you can pin: on a list's page, Pin to Home makes it a feed tab on Home, right after your other tabs, showing that list's Dreams. Unpin and reorder it like any pinned tab. You can also pin a list from Following, Pin a tab.",
    "Profiles have a Lists tab: yours shows all your lists and whether each is shown or only yours, and others see only the lists you choose with Show on my profile on each list's page. Move the tab in Settings, Profile Tabs.",
    "Security: your Nostr key is now locked with a passcode by default, and easy passcodes like 1234 aren't accepted. A key you saved before without one keeps working, and Looscid offers to lock it.",
    "Security: when your Nostr key has a passcode, your Mastodon and Bluesky sign-ins are locked with it too.",
    "Security: Looscid now refuses scripts that aren't its own files, and it won't run if another website tries to show it inside a hidden frame. You'll get a link to open it on its own instead.",
  ] },
  { version: "2026.116.33", build: 149, released: "2026-10-11T08:18:22Z", title: "Round 6.8.1", notes: [
    "Round 6.8.1: a fix update, asked for by 2three1y. The stray comma on profiles is gone, the bio and fields look like Feditext's, and tab names have no position numbers.",
    "The stray comma: hidden commas stood in for the bullet between N Dreams and Joined, and before Follows you, Muted and Blocked. VoiceOver read each one on its own as comma. They're gone; each part is its own piece with a plain space.",
    "The bio is shown like Feditext's: paragraphs and line breaks kept, links, mentions and hashtags as real links. A mention opens that Dreamor's profile, a hashtag opens Discover.",
    "Fields are shown like Feditext's: a table of label and value, a verified value in green with a checkmark, read as Verified and the date.",
    "Your LooscidID line is like Feditext's: @handle, a lock for a private account (read Locked account), then Follows you, which turns into Mutuals in place when you follow back.",
    "Joined shows the full date and time, in your own time zone, named, like Joined Wednesday, October 2, 2024 at 5:01 PM (Eastern Time). Same in About.",
    "Tab names have no position numbers anymore (iPhone already says tab, 1 of 4). Profile tabs show their count in parentheses, like Dreams (106).",
    "The profile Media tab has Show: Images, Videos or Both, Both to start, remembered on this device.",
    "Following and Followers lists say Mutuals, Following or Follows you, like Feditext.",
  ] },
  { version: "2026.116.32", build: 148, released: "2026-10-11T03:45:29Z", title: "Round 6.8", notes: [
    "Round 6.8: a feature update. Liked in More, Like Search, and Create with nine options.",
    "More has Liked: the same Liked as your profile's Liked tab, with Dreams, Circles, Apps, Marketplace, Chats and Searches, and an Images only filter. Only you can see it.",
    "Like and Unlike on Circles, Apps and Cherry chats too. Cherry chats are in Chats.",
    "Like Search: on a search in Discover, or say like search in the Commandbar. Each Liked Search has an Alerts switch, off to start. With it on, Looscid checks the search when it's open, across the networks you have, and new Dreams show in Alerts under From Looscid, naming the network.",
    "Create has nine options, the same in the Create tab and in More: Dream, Circle, Custom Feed, App or Game (for developers), New Call, New Chat, New Chat with Cherry, Go Live and GIF. The ones Looscid can't do yet say Unavailable.",
  ] },
  { version: "2026.115.32", build: 147, released: "2026-10-11T02:44:37Z", title: "Round 6.7", notes: [
    "Round 6.7: a feature update. Your profile, rebuilt, and Liked.",
    "Profiles are recreated from Feditext's profile layout (no Feditext code is used): the buttons, your name, your LooscidID with Follows you, your Dreams count and Joined date, fields, bio, then Following and Followers buttons that open their own pages, then the tabs Dreams, Replies, Redreams and Media.",
    "Liking is saving: one store, one name, Liked. Your own profile has a private Liked tab with Dreams, Circles, Apps, Marketplace, Chats and Searches, and an Images only filter. Anything you saved before is in Liked.",
    "Settings, Privacy, Liked tab: a Show on my profile box for each part, all off. Even when off, people can see your likes on their own Dreams, and Dreams you both liked.",
    "Other people's profiles: Mutual likes, and their Liked tab when they made part of it public or liked your Dreams.",
    "More at the top of a profile expands in place: Share, Hide Redreams, Add note, Mute, Block. Yours: Share and Edit profile, which is the same editor as Settings, LooscidID.",
    "About tab: About this account, with your LooscidID, the date it was made and your connected Logins. Only what's really there.",
    "The Redreams tab has Show: Quotes only, Redreams only or Both.",
    "A Dream that tags you has Remove me from this Dream in its options. More has View your profile near the top.",
  ] },
  { version: "2026.114.32", build: 146, released: "2026-10-11T01:25:26Z", title: "Round 6.6.1", notes: [
    "Round 6.6.1: a fix update for Earcons on iPhone, and names that ended in a comma.",
    "Earcons no longer break up or go quiet on iPhone. The sound engine stays awake while Looscid is on screen, and every tap or key press wakes it if iPhone put it to sleep (after a lock, a call or Siri). Earcons, pitch cues and Soundpacks sound exactly the same.",
    "Many earcons at once (fast swiping, a double-tap that opens something) no longer pile up and crackle.",
    "Soundvault: if a sound can't load, or is slow, Looscid's own sound plays instead, never silence.",
    "Settings, Earcons: a Test earcons button plays a short sequence and says Earcons playing. New switch: Earcons when iPhone is on silent.",
    "Menu items no longer read with a stray comma when Verbosity is High. The position is now part of one name: Redream, 1 of 2. Tab badges and a few labels too.",
  ] },
  { version: "2026.114.31", build: 145, released: "2026-10-10T23:28:24Z", title: "Round 6.6", notes: [
    "Round 6.6: Projects. 2three1y's own projects are built into Looscid.",
    "More has a new Projects section, near the end: Memeprojects, Lyric Finder, Vibework, Soundvault, Reactor Toolbar, Code Translator, chaoticmodel, Yapper, Alex Classic, Easyconvert, MyWEB and Agentsync. It remembers whether you left it open.",
    "Each project opens right here, with Back and Close. Projects that need a server say Coming soon instead of showing a fake control.",
    "Memeprojects: after a result, Dream Results opens the Dream composer with the result filled in. You still press Dream yourself.",
    "Commandbar: projects, open and a project's name, and lyrics and a song (lyrics imagine by john lennon). Settings, Earcons has Open Soundvault to find more Soundpacks.",
    "Projects that are Coming soon, or partly, ask for help, with a link to their GitHub repo. The Projects section ends with Help build Looscid on GitHub.",
    "Music has a Lyrics section with Open Lyric Finder.",
    "Sounds are now called Earcons: Settings, Earcons. Storage and backups are unchanged.",
    "Command earcons, on by default: every Commandbar command plays its own short sound, and commands in the same area sound related. A command that fails plays the error sound, the same one as before.",
    "Keyboard earcons, on by default: a click for each key you type in a text field, with their own sounds for Space, Delete and Enter. Throttled, so typing and braille input never lag.",
    "New opt-in Soundpack, FastSM-inspired: soft, round blips and airy swooshes, inspired by FastSMRW by masonasons (no code or audio copied). Looscid's own earcons stay the default.",
    "Both earcon switches follow the Earcons switch and the master volume, and still play in Calm mode. No existing earcon or pitch cue changed.",
    "Soundpacks (one word now) work everywhere: before, a Soundpack other than Looscid only played on the tab bar and a few events. Now it plays on menus (opening, choosing, Escape), Redream or Quote, Replies and other pages, switches and checkboxes, and Back and Close, and keyboard and command earcons use it too. The Looscid pack and pitch cues are unchanged.",
    "Choosing a Soundpack switches everything to it right away and says \u201cSoundpack: Insomnia.\u201d once. Moving to a choice plays a short preview of it. It stays after a restart.",
    "New Soundpack, Soundvault: sounds from the Soundvault catalog, loaded from there when they play; anything it doesn't have plays Looscid's own. The soundvault command switches to it.",
    "help is now a short list of the top commands. An area and help reads just that area: cherry help (or cherryhelp), projects help, earcons help, braille help. help list reads every command. new dream opens the Dream composer.",
    "Help Center, in More and with the help center command: getting started, commands, Cherry, earcons, accessibility, projects, legal, backup, and Getting help: Send Feedback, GitHub issues, helping build Looscid and quick reminders.",
    "One About Looscid page: More's About is now one button that opens it, with no submenu. Send Feedback, Legal and the Welcome intro are on the page.",
    "Legal, from About Looscid and the legal command: Terms, Privacy, Community rules, Looscid's license (LPL v1.0: no ads, no commercial use), the open source credits and the MIT notices.",
  ] },
  { version: "2026.113.31", build: 144, released: "2026-10-10T21:10:00Z", title: "Round 6.5.3", notes: [
    "Round 6.5.3: Cherry in Commandbar, and a Commands page.",
    "New Commandbar commands: open cherry, new cherry chat, cherry pinned chats and cherry history. Capitals and colons don't matter, so Cherry: Pinned chats works too. New cherry chat puts focus in the message box; the Pinned and All commands put focus on that tab and say how many chats are there.",
    "Spaces are optional: opencherry, cherrychats and pinnedchats work. Path style too: fil > Cherry pinned.",
    "The Commands page lists every command by area, each a button that runs it. Open it with commands, or from More, Commands, the new last section.",
  ] },
  { version: "2026.112.31", build: 143, released: "2026-10-10T20:15:00Z", title: "Round 6.5.2", notes: [
    "Round 6.5.2: Cherry gets its own page.",
    "Cherry is a page now, not a pop-up: open it from More, the Home button or Ask Cherry, and Back takes you to where you were. New Chat is at the top.",
    "Your History lists your chats with Cherry, with All and Pinned tabs. Pin a chat to keep it handy. Chats are saved on this device and are in Settings backup.",
    "Cherry's answers are read out as they arrive, and focus stays in the message box.",
  ] },
  { version: "2026.111.31", build: 142, released: "2026-10-10T18:42:07Z", title: "Round 6.5.1", notes: [
    "Round 6.5.1: Dreamor everywhere.",
    "A fix update: Dreamor and Dreamors are the words for you and everyone on Looscid again, in the app, the docs and the LICENSE. Redream keeps its one spelling.",
  ] },
  { version: "2026.111.30", build: 141, released: "2026-10-10T17:50:27Z", title: "Round 6.5", notes: [
    "Round 6.5: the new composer, Replies that stay, and Nostr threads.",
    "One composer for New Dream, Reply and Quote, laid out like Feditext's: the Dream you answer sits right before your text box, so one swipe left reads it. Hear Dream reads it aloud, and Read back my reply reads yours.",
    "Who gets notified is a list of checkboxes, not typed handles. A reply starts with the Dream's Audience and content warning, and you can change both. Write a whole thread in one go with Add another Dream.",
    "Replies are saved on your device and stay after a reload. With a Nostr key, a reply to a Dream on Nostr goes out as a real Nostr reply, and a Quote links the Dream it quotes.",
    "Alt text helper for photos, link previews (YouTube, Vimeo and Spotify players load only when you press Play), and a Credits and open source page in the menu.",
    "One word everywhere: Replies. Redream is spelled one way too.",
  ] },
  { version: "2026.110.30", build: 140, released: "2026-10-10T16:52:30Z", title: "Round 6.4", notes: [
    "Round 6.4: Dreams on Nostr, your key in a secure field with an optional passcode.",
    "Set up a Nostr key in Settings, LooscidID, Keys and IDs: use a signer, enter your key in a secure field with a Show key button, or create a new key. An optional passcode keeps it locked on this device.",
    "With Audience Everyone, a new Dream also goes to Nostr relays, so you and anyone can see it from any device. Your own Dreams load back from the relays when you open Looscid with your key. Audience has a new choice: Only this device.",
  ] },
  { version: "2026.109.30", build: 139, released: "2026-10-10T15:40:22Z", title: "Round 6.3", notes: [
    "Round 6.3: Dreams are saved on your device, composer order and focus fixes.",
    "Your Dreams stay after a reload. They're saved only on this device for now, and the composer says so.",
    "New Dream is a dialog: the text box comes first, then attachments, then Dream and Close. Control+Enter or Command+Enter dreams it, Escape closes, and then focus moves to your new Dream.",
  ] },
  { version: "2026.109.29", build: 138, released: "2026-10-10T14:33:35Z", title: "Round 6.2", notes: [
    "A fix update: Looscid has its icon.",
    "Add to Home Screen on iPhone and Android shows the Looscid logo, named Looscid, and the browser tab shows it too.",
  ] },
  { version: "2026.109.28", build: 137, released: "2026-10-10T14:08:08Z", title: "Round 6.1", notes: [
    "A fix update: nothing you see or hear changes.",
    "Looscid is split into files: styles in css/, code in js/, one file per tab.",
    "Alerts and Discover are plain JavaScript with native HTML elements. The other tabs follow one at a time.",
    "Settings backups from Round 6 still import, and new ones import into Round 6.",
  ] },
  { version: "2026.109.27", build: 136, released: "2026-10-10T12:41:40Z", title: "Round 6", notes: [
    "No extra descriptions: VoiceOver reads each control's name, role and state, and explanations are plain text under headings.",
    "Verbosity is a tab on Sense.",
    "Apps are Looscid's own: Settings, Apps, and the Looscid App Store.",
    "Commandbar: the bar and full screen share one history.",
    "Alerts only for things that really happen, with settings for each.",
    "Louder sounds with a limiter, plus the Insomnia, Looscid OS classic and Hyper Synth packs.",
    "Privacy: sections that open one at a time, who can do what, Blocked and muted, Media and content.",
    "Reset: the last item in every settings list.",
    "Looscid checks for updates by itself and tells you when one is ready.",
  ] },
];
Looscid.LC_VERSION_HISTORY = LC_VERSION_HISTORY;
function lcUpdateAutoSet(v) { try { localStorage.setItem(LC_UPDATE_AUTO_KEY, v ? "on" : "off"); } catch (e) {} }
function lcPitchPreview() {
  const seq = [["link"], ["button"], ["heading", 1], ["heading", 3], ["field"], ["open"], ["close"], ["toggle", "on"], ["toggle", "off"], ["position", [0, 5]], ["position", [4, 5]], ["success"], ["error"]];
  seq.forEach(function (s, i) { setTimeout(function () { lcPitchCue(s[0], s[1], { test: true }); }, i * 260); });
  announce("Playing every pitch cue: link, button, headings, text field, open, close, on, off, top and bottom of a list, success, error.");
}
function MusicPage({ onBack }) {
  const [, tick] = useState(0);
  useEffect(function () { return Music.subscribe(function () { tick(function (n) { return n + 1; }); }); }, []);
  const g = Music.current(), on = Music.playing(), vol = Music.volume();
  const toggle = function () { if (on) { Music.pause(); announce("Paused."); } else { const x = Music.play(); announce("Now playing: " + x.label + "."); } };
  return lh('div', { className: "pg lc-music", "aria-live": "off" },
    lh(BackHeader, { title: "Music", onBack: onBack }),
    lh('p', { className: "lc-intro" }, "The beats made for Looscid OS. Nothing loads until you press Play. Try music hyperpop in Commandbar."),
    lh('section', { className: "lc-grp", "aria-labelledby": "mu-now" },
      lh('h2', { id: "mu-now", className: "lc-grp-h" }, "Now playing"),
      lh('p', { className: "lc-now" }, g.label + ", " + (on ? "playing" : "paused")),
      lh('button', { type: "button", id: "mu-play", className: "btn bp lc-big", onClick: toggle, "aria-braillelabel": Looscid.A11Y_NOW.brailleOutput ? (on ? "pause" : "play") : undefined }, (on ? "Pause " : "Play ") + g.label)),
    lh('section', { className: "lc-grp", "aria-labelledby": "mu-style" },
      lh('h2', { id: "mu-style", className: "lc-grp-h" }, "Beat style"),
      lh('fieldset', { className: "lc-fs" },
        lh('legend', { className: "sr-pause" }, "Beat style"),
        lh('div', { className: "lc-radios lc-radios-col" }, MUSIC_GENRES.map(function (x) {
          return lh('label', { key: x.id, className: "lc-radio" + (g.id === x.id ? " on" : "") },
            lh('input', { type: "radio", name: "lc-genre", value: x.id, checked: g.id === x.id, onChange: function () { Music.select(x.id); if (Music.playing()) announce("Now playing: " + x.label + "."); } }),
            lh('span', { className: "lc-q-txt" }, lh('span', { className: "lc-q-l" }, x.label), lh('span', { className: "lc-q-s" }, x.sub)));
        })))),
    lh('section', { className: "lc-grp", "aria-labelledby": "mu-vol-h" },
      lh('h2', { id: "mu-vol-h", className: "lc-grp-h" }, "Volume"),
      lh('div', { className: "lc-row lc-vol" },
        lh('label', { htmlFor: "mu-volume", className: "lc-fs-l" }, "Music volume"),
        lh('div', { className: "lc-vol-row" },
          lh('input', { id: "mu-volume", type: "range", min: 0, max: 100, step: 10, value: vol, className: "lc-range", "aria-valuetext": vol + " percent", onChange: function (e) { Music.setVolume(+e.target.value); } }),
          lh('span', { className: "lc-vol-n", "aria-hidden": "true" }, vol + "%")))),
    // Round 6.6 (2three1y): Lyric Finder, one of his projects, right next to the music.
    Looscid.lcFindProject && Looscid.lcFindProject("lyricfinder") ? lh('section', { className: "lc-grp", "aria-labelledby": "mu-lyr-h" },
      lh('h2', { id: "mu-lyr-h", className: "lc-grp-h" }, "Lyrics"),
      lh('p', { className: "lc-desc" }, "Lyric Finder finds a song's lyrics by title and artist. In Commandbar, type lyrics and a song, like lyrics imagine by john lennon."),
      lh('button', { type: "button", id: "mu-lyrics", className: "btn bgb lc-btn", onClick: function () { Looscid.lcOpenProject(Looscid.lcFindProject("lyricfinder")); } }, "Open Lyric Finder")) : null);
}
/* --- Round 6: audiences (who can do something), shared by Alerts and Privacy ----------------
   Everyone / Dreamors I follow / My followers / Followers I follow back / My circles / Only me / Custom.
   Custom is a list of handles saved under looscid_aud_custom_<key>. */
const LC_AUD = [["everyone", "Everyone"], ["following", "Dreamors I follow"], ["followers", "My followers"], ["mutuals", "Followers I follow back (mutuals)"], ["circles", "My circles"], ["nobody", "Only me / Nobody"], ["custom", "Custom"]];
Looscid.LC_AUD = LC_AUD;
function lcAudCustomSet(key, list) { try { localStorage.setItem("looscid_aud_custom_" + key, JSON.stringify(list.slice(0, 200))); } catch (e) {} window.dispatchEvent(new CustomEvent("looscid:aud")); }
function useBlocked() {
  const [, tick] = useState(0);
  useEffect(function () { const f = function () { tick(function (x) { return x + 1; }); }; window.addEventListener("looscid:blocked", f); return function () { window.removeEventListener("looscid:blocked", f); }; }, []);
}
function lcAlertPrefsSet(patch) {
  const o = lcAlertPrefs();
  if (patch.group !== undefined) o.group = !!patch.group;
  if (patch.type) o.types[patch.type] = Object.assign({}, o.types[patch.type], patch.set || {});
  try { localStorage.setItem(LC_ALERT_PREFS_KEY, JSON.stringify(o)); } catch (e) {}
  window.dispatchEvent(new CustomEvent("looscid:alerts"));
  return o;
}
/* --- Commandbar, full screen (ported from the Looscid OS terminal, which started in NexOS) --------------- */
const LC_TERM_OPEN_KEY = "looscid_term_output_open";
Looscid.LC_TERM_OPEN_KEY = LC_TERM_OPEN_KEY;
function termOutputOpen() { try { return localStorage.getItem(LC_TERM_OPEN_KEY) !== "0"; } catch (e) { return true; } }
function setTermOutputOpen(v) { try { localStorage.setItem(LC_TERM_OPEN_KEY, v ? "1" : "0"); } catch (e) {} }
const TERM_CHIPS = [["Help", "help"], ["Open feed", "open feed"], ["Open alerts", "open alerts"], ["Open circles", "open circles"], ["Settings", "open settings"], ["Accessibility", "open accessibility"], ["Status", "status"], ["Clear screen", "clear"]];
Looscid.TERM_CHIPS = TERM_CHIPS;
function lcOsName() {
  const d = navigator.userAgentData; if (d && d.platform) return d.platform + (d.mobile ? ", mobile" : "");
  const u = navigator.userAgent || "";
  const m = /iPhone OS ([\d_]+)/.exec(u) || /iPad.*OS ([\d_]+)/.exec(u); if (m) return (/iPad/.test(u) ? "iPadOS " : "iOS ") + m[1].replace(/_/g, ".");
  if (/Android ([\d.]+)/.test(u)) return "Android " + /Android ([\d.]+)/.exec(u)[1];
  if (/Mac OS X ([\d_]+)/.test(u)) return "macOS"; if (/Windows/.test(u)) return "Windows"; if (/CrOS/.test(u)) return "ChromeOS"; if (/Linux/.test(u)) return "Linux";
  return "not reported by this browser";
}
function lcAboutInfo() {
  const a = Looscid.A11Y_NOW, dpr = window.devicePixelRatio || 1;
  return {
    whatsNew: [
      "Replies: one composer for New Dream, Reply and Quote. The Dream you answer sits right before your text box, replies stay after a reload, and they reach Nostr as real replies.",
      "Commandbar: press Ctrl+K or Cmd+K anywhere, or the command button at the top. Exact commands run at once; anything else goes to Cherry, which answers or opens the closest match.",
      "Commandbar: one place for commands. Ctrl+K or Cmd+K opens the bar anywhere; Full screen (or Apps, Commandbar) shows the same output and history, with quick commands and output you can fold away.",
      "Earcons: a short, quiet sound for Feed, Alerts, Circles, Settings and Commandbar, made live with Web Audio.",
      "Music: the Looscid OS beats (Morning to Night, Hyperpop, Lo-fi chill, Drum and bass, Chiptune) in the More tab, or type music hyperpop.",
      "Change accessibility settings in plain words, with Cherry, Commandbar: turn on calm mode, make text bigger, volume 50, set sounds off.",
      "Faster start: a startup screen paints at once while Looscid loads, and screen readers hear Looscid loaded.",
      "Settings, Accessibility, grouped by need: Vision, Hearing, Motion & Seizure, Braille, Sounds and Commandbar, with one first-visit question that sets them up.",
      "Cherry now understands \u201cWhat is Looscid?\u201d and \u201cTell me about Looscid\u201d.",
    ],
    features: [
      "LooscidID, made on this device the first time you open Looscid. Add login methods any time: Nostr, Mastodon and the fediverse, or Bluesky.",
      "Feed, Discover, Circles and Alerts, with Cherry, the built-in assistant.",
      "No ads and no algorithm hiding your Dreams. Your data stays yours.",
      "Built for VoiceOver, TalkBack, keyboards, switches and braille displays.",
    ],
    facts: [
      ["Version", lcVersionLabel()],
      ["Browser", lcBrowserName()],
      ["Operating system", lcOsName()],
      ["Language", (navigator.languages && navigator.languages.length ? navigator.languages.slice(0, 3).join(", ") : navigator.language) || "not reported by this browser"],
      ["Time zone", (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "not reported"; } catch (e) { return "not reported"; } })()],
      ["Screen", screen.width + " by " + screen.height + " pixels, window " + window.innerWidth + " by " + window.innerHeight + (dpr > 1 ? ", " + Math.round(dpr * 10) / 10 + " times density" : "")],
      ["Memory", navigator.deviceMemory ? "about " + navigator.deviceMemory + " GB, as reported by the browser" : "not reported by this browser"],
      ["Processor cores", navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : "not reported by this browser"],
      ["Uptime", lcSpoken(Date.now() - LC_BOOT)],
      ["Stored on this device", lcStorageKB() + " KB in all, " + lcStorageKB("looscid_") + " KB of it in Looscid settings and lists"],
      ["Sound", (window.AudioContext || window.webkitAudioContext ? "Web Audio available. " : "Web Audio not available. ") + (a.visualCue ? "Visual cue instead of sounds" : a.earcons ? "Earcons on, volume " + a.earconVolume + " percent" : "Earcons off")],
      ["Speech", "speechSynthesis" in window ? "Read aloud available" + (function () { try { const n = window.speechSynthesis.getVoices().length; return n ? ", " + n + " voices" : ""; } catch (e) { return ""; } })() : "Read aloud not available in this browser"],
      ["Braille", a.brailleOutput ? "Braille output on: short labels go to your braille display through your screen reader" : "Braille output off"],
      ["Network", navigator.onLine === false ? "offline" : "online"],
    ],
    access: [
      "Calm mode is on by default. Reduce Motion always wins, and it follows your device's setting.",
      "Flash safety is on by default: nothing flashes, blinks or pulses. The three-flash limit is a hard rule on top: even with Flash safety off, nothing flashes more than three times in any one second.",
      "Results from Commandbar are read out through one polite live region.",
      "Braille output sends short labels to a connected braille display through your screen reader.",
    ],
    credits: [
      "Looscid is open source under the Looscid Public License.",
      "Commandbar's full-screen view is ported from the Looscid terminal in Looscid OS, which started as the Terminal in NexOS Web.",
      "The composer's layout is inspired by Feditext's composer (GPL-3.0); no code was used.",
      "Every sound is synthesized live with Web Audio. There are no recorded samples.",
      "Source code: github.com/Looscid/Looscid",
    ],
  };
}
/* Round 6.5 (2three1y): Credits and open source. Build 150 part 11: rewritten in 2three1y's own voice.
   Every project keeps its credit and license. Each license is a real link to that project's own license text,
   and each project's home is a link named "<project> on GitHub" (or on its own site), so no raw URLs on the page.
   Fields: n name, s short name for link names, u home, site link site name (default GitHub), l license,
   lu license link (none = plain text), w what it is. Planned items are plain text (each repo is linked above). */
const LC_CREDITS = {
  intro: ["This page is where I say thanks. Looscid is open source under the ", "Looscid Public License", ". Below is every project Looscid uses and every one I learned from, and each of them keeps its own license. Oh, and every sound you hear is made live with Web Audio. No recorded samples, at all."],
  licenseUrl: "https://github.com/Looscid/Looscid/blob/preview/LICENSE",
  uses: [
    { n: "React and React DOM 18.2.0", s: "React", u: "https://github.com/react/react", l: "MIT", lu: "https://github.com/react/react/blob/main/LICENSE", w: "This draws every single screen of Looscid. Loaded from jsDelivr." },
    { n: "nostr-tools 2.25.2", s: "nostr-tools", u: "https://github.com/nbd-wtf/nostr-tools", l: "Unlicense", lu: "https://github.com/nbd-wtf/nostr-tools/blob/master/LICENSE", w: "Nostr keys, signing and checking notes, npub and nsec, and passcode-locked keys. It lives in js/vendor with its license right next to it." },
    { n: "qrcode-generator 1.4.4, by Kazuhiko Arase", s: "qrcode-generator", u: "https://github.com/kazuhikoarase/qrcode-generator", l: "MIT", lu: "https://github.com/kazuhikoarase/qrcode-generator/blob/master/LICENSE", w: "Draws the QR code for a profile's LooscidID link, under Dreamor options. Served from Looscid itself." },
    { n: "noble curves, hashes and ciphers, and scure base, by Paul Miller", s: "noble curves", u: "https://github.com/paulmillr/noble-curves", l: "MIT", lu: "https://github.com/paulmillr/noble-curves/blob/main/LICENSE", w: "The audited cryptography inside nostr-tools. The math that keeps your keys safe." },
    { n: "v86", s: "v86", u: "https://github.com/copy/v86", l: "BSD 2-Clause", lu: "https://github.com/copy/v86/blob/master/LICENSE", w: "This is what runs the real Looscid OS kernel in Apps, right in your browser. Still blows my mind." },
    { n: "SeaBIOS and SeaVGABIOS", s: "SeaBIOS", u: "https://www.seabios.org/", site: "seabios.org", l: "LGPL-3.0", lu: "https://github.com/coreboot/seabios/blob/master/COPYING.LESSER", w: "The start-up firmware v86 uses. I didn't change it." },
    { n: "DM Sans and DM Serif Display", s: "DM Sans", u: "https://fonts.google.com/specimen/DM+Sans", site: "Google Fonts", l: "SIL Open Font License 1.1", lu: "https://openfontlicense.org/open-font-license-official-text/", w: "Looscid's fonts, from Google Fonts." },
  ],
  // Round 6.6: Projects in More. Each project's own LICENSE file is kept next to its copy in projects/ or os/.
  mine: [
    { n: "NexOS", u: "https://github.com/2three1y/nexos", l: "MIT", lu: "https://github.com/2three1y/nexos/blob/main/LICENSE", w: "My operating system project. Commandbar's full-screen view is ported from the Terminal in NexOS Web, plus the Apps, the Desktop and the Looscid OS classic Soundpack. Inside Looscid it is Looscid OS now." },
    { n: "Insomnia OS", u: "https://github.com/2three1y/insomnia-os", l: "MIT", lu: "https://github.com/2three1y/insomnia-os/blob/main/LICENSE", w: "The Insomnia app in Apps, and the Insomnia Soundpack." },
    { n: "Memeprojects", u: "https://github.com/2three1y/memeprojects", l: "MIT", lu: "https://github.com/2three1y/memeprojects/blob/main/LICENSE", w: "The Memeprojects app in Apps. Pure chaos, you're welcome." },
    { n: "Easyconvert", u: "https://github.com/2three1y/Easyconvert", l: "MIT", lu: "https://github.com/2three1y/Easyconvert/blob/main/LICENSE", w: "The Easyconvert app in Apps, and the newest Easyconvert (with the Claude export reader) in More, Projects." },
    { n: "Lyric Finder", u: "https://github.com/2three1y/lyricfinder", l: "MIT", lu: "https://github.com/2three1y/lyricfinder/blob/main/LICENSE", w: "Lyric Finder in More, Projects, and the lyrics command. The lyrics themselves come from LRCLIB and lyrics.ovh, under their own terms." },
    { n: "Vibework, by me and the Vibework contributors", s: "Vibework", u: "https://github.com/2three1y/vibework", l: "MIT", lu: "https://github.com/2three1y/vibework/blob/main/LICENSE", w: "Vibework in More, Projects." },
    { n: "Soundvault", u: "https://github.com/2three1y/soundvault", l: "MIT", lu: "https://github.com/2three1y/soundvault/blob/main/LICENSE", w: "Soundvault in More, Projects, and its button in Settings, Earcons. The Soundpacks it links to stay at MG Storage, under their own terms." },
    { n: "Reactor Toolbar", u: "https://github.com/2three1y/reactor-toolbar", l: "MIT", lu: "https://github.com/2three1y/reactor-toolbar/blob/main/LICENSE", w: "Reactor Toolbar in More, Projects." },
    { n: "Code Translator", u: "https://github.com/2three1y/codetranslator", l: "MIT", lu: "https://github.com/2three1y/codetranslator/blob/main/LICENSE", w: "Code Translator in More, Projects." },
    { n: "chaoticmodel", u: "https://github.com/2three1y/chaoticmodel", l: "MIT", lu: "https://github.com/2three1y/chaoticmodel/blob/main/LICENSE", w: "Its page in More, Projects." },
    { n: "Alex Classic", u: "https://github.com/2three1y/alexclassic", l: "MIT", lu: "https://github.com/2three1y/alexclassic/blob/main/LICENSE", w: "Its page in More, Projects." },
    // These three repos have no LICENSE file, so their license stays plain text.
    { n: "MyWEB", u: "https://github.com/2three1y/MyWEB", l: "my own code", w: "MyWEB in More, Projects. Its Nostr feedback is coming soon." },
    { n: "Agentsync", u: "https://github.com/2three1y/Agentsync", l: "my own code", w: "Its page in More, Projects." },
    { n: "Yapper website", u: "https://github.com/2three1y/yapper-site", l: "my own code", w: "The Yapper page in More, Projects. I made the website; Yapper itself is MystyDev's app, so the credit for the app goes to them." },
  ],
  ideas: [
    { n: "Feditext, by Metabolist", s: "Feditext", u: "https://github.com/feditext/feditext", l: "GPL-3.0", lu: "https://github.com/feditext/feditext/blob/develop/LICENSE", w: "Design inspiration only, no Feditext code is used anywhere in Looscid. The composer follows Feditext's layout: the Dream you're answering above your text, the toolbar order, and writing a whole thread in one go. The profile design, the More button and the Preferences-style settings are recreated from Feditext by Metabolist, again with zero code copied. Feditext is honestly one of the best accessible apps out there, go check it out." },
    // Round 6.6: FastSMRW has no license, so only the idea is borrowed.
    { n: "FastSMRW, by masonasons", s: "FastSMRW", u: "https://github.com/masonasons/FastSMRW", lead: "No license, so I only borrowed the idea.", w: "The FastSM-inspired earcon pack in Settings, Earcons, Soundpack is inspired by FastSMRW. No code or audio was copied: every sound in that pack is made fresh with Web Audio." },
  ],
  planned: [
    { n: "MyWEB", w: "feedback sent to me as an encrypted Nostr message, signed with your own key." },
    { n: "AgentSync", w: "slash commands for Cherry, handled on your device, with its step-by-step Allow dialog." },
    { n: "Soundvault", w: "installing a pack from Soundvault straight into Settings, Earcons, and new earcons where the license allows." },
    { n: "Vibework", w: "other places to hang out, in Discover." },
    { n: "Codetranslator", w: "a Commandbar tool." },
  ],
};
Looscid.LC_CREDITS = LC_CREDITS;
function CreditsPage({ navigate }) {
  // Build 150 part 31 (2three1y, Oct 12: "our Credits page should look like any normal Credits page"): a centered
  // credits roll grouped by role, like a film's end credits, but it never moves on its own (no auto-scroll at all).
  // Plain h2 headings per role and plain lists; every credit, license link and home link from part 11 is kept.
  // No raw URLs: the home link reads "<project> on GitHub"; the license link names whose license it is.
  const ext = function (href, text, label, key) { return lh('a', { key: key, href: href, target: "_blank", rel: "noopener noreferrer", className: "lc-link", "aria-label": label || undefined }, text); };
  const entry = function (c) { const s = c.s || c.n;
    return lh('li', { key: c.n, className: "lc-roll-item" },
      lh('p', { className: "lc-roll-name" }, c.n),
      lh('p', { className: "lc-roll-what" }, c.lead ? c.lead + " " : null, c.w),
      lh('p', { className: "lc-roll-links" }, ext(c.u, s + " on " + (c.site || "GitHub"), null, "u"),
        c.l ? [lh('span', { key: "sep", "aria-hidden": "true" }, " \u00b7 "), lh('span', { key: "lic" }, " License: ", c.lu ? ext(c.lu, c.l, c.l + ", " + s + " license", "l") : c.l)] : null)); };
  const plain = function (key, name, what) { return lh('li', { key: key, className: "lc-roll-item" }, lh('p', { className: "lc-roll-name" }, name), what ? lh('p', { className: "lc-roll-what" }, what) : null); };
  const ul = function (kids) { return lh('ul', { className: "lc-roll-list" }, kids); };
  const sec = function (id, title, kids) { return lh('section', { "aria-labelledby": id, className: "lc-roll-sec" }, lh('h2', { id: id, className: "lc-roll-role" }, title), kids); };
  const sub = function (id, title, kids) { return lh('section', { "aria-labelledby": id, className: "lc-roll-subsec" }, lh('h3', { id: id, className: "lc-roll-subrole" }, title), kids); };
  const lic = LC_CREDITS.licenseUrl;
  return lh('div', { className: "pg lc-credits" },
    lh(BackHeader, { title: "Credits and open source", onBack: function () { navigate("settings"); } }),
    lh('div', { className: "lc-roll" },
      lh('p', { className: "lc-roll-lead" }, "This page is where I say thanks."),
      sec("credits-by", "Created by", [
        lh('p', { key: "me", className: "lc-roll-star" }, ext("https://github.com/2three1y", "2three1y", "2three1y on GitHub", "me")),
        lh('p', { key: "t", className: "lc-roll-what" }, "Design, code, sounds and words."),
        sub("credits-mine", "2three1y's projects inside Looscid", [
          lh('p', { key: "p", className: "lc-roll-what" }, "These are mine. They're MIT unless it says otherwise, and each one keeps its own LICENSE file next to its copy in Looscid."),
          ul(LC_CREDITS.mine.map(entry))]),
        sub("credits-planned", "Coming from my repos", [
          lh('p', { key: "p", className: "lc-roll-what" }, "Planned, not in Looscid yet. They'll move up to the list above when they land."),
          ul(LC_CREDITS.planned.map(function (c) { return plain(c.n, c.n, c.w); }))])]),
      sec("credits-ideas", "Design references", [
        lh('p', { key: "p", className: "lc-roll-what" }, "These projects inspired how parts of Looscid look and work. I didn't copy any of their code, I just learned from them."),
        ul(LC_CREDITS.ideas.map(entry))]),
      sec("credits-uses", "Open-source libraries and licenses", [
        lh('p', { key: "p", className: "lc-roll-what" }, "Looscid is open source under the ", ext(lic, "Looscid Public License", null, "i"), ". Every project below keeps its own license."),
        ul(LC_CREDITS.uses.map(entry)),
        lh('p', { key: "src", className: "lc-roll-what" }, "Looscid's own source code is all on GitHub: ", ext("https://github.com/Looscid/Looscid", "Looscid on GitHub", null, "g"), ". The full license is in the ", ext(lic, "LICENSE file", "LICENSE file, Looscid's license", "l"), " there.")]),
      sec("credits-sounds", "Voices and sounds", ul([
        plain("wa", "Every earcon", "Made live with Web Audio. No recorded samples, at all."),
        plain("sp", "Soundpacks", "The Looscid OS classic and Insomnia Soundpacks come from my own projects above. The FastSM-inspired pack is inspired by FastSMRW, with every sound made fresh."),
        plain("vo", "Spoken feedback", "Uses the voices already on your device, through your browser's speech.")])),
      sec("credits-thanks", "Special thanks", [
        ul([
          plain("my", "MystyDev", "For Yapper, the app behind the Yapper website."),
          plain("vw", "The Vibework contributors", "For building Vibework with me."),
          plain("ly", "LRCLIB and lyrics.ovh", "For the lyrics in Lyric Finder, under their own terms."),
          plain("mg", "MG Storage", "For hosting the Soundpacks Soundvault links to, under their own terms."),
          plain("fe", "Metabolist", "For Feditext, one of the best accessible apps out there.")]),
        lh('p', { key: "t", className: "lc-roll-lead" }, "Thanks to everyone who made these. Looscid wouldn't exist without you."),
        lh('p', { key: "s", className: "lc-roll-what" }, "- 2three1y")])));
}
function AboutLooscidMore() {
  const [info, setInfo] = useState(lcAboutInfo());
  const list = function (items) { return lh('ul', { className: "lid-help", style: { paddingLeft: 22, margin: "6px 0" } }, items.map(function (t, i) { return lh('li', { key: i }, t); })); };
  const sec = function (id, title, kids) { return lh('section', { "aria-labelledby": id, style: { padding: "0 16px 12px" } }, lh('h2', { id: id, className: "lid-sub" }, title), kids); };
  return lh(React.Fragment, null,
    sec("about-new", "What's new", list(info.whatsNew)),
    sec("about-features", "Features", list(info.features)),
    sec("about-sys", "System info", [
      lh('div', { key: "dl", className: "lc-sysinfo" }, info.facts.map(function (f) { return lh('p', { key: f[0], className: "lid-help" }, f[0] + ": " + f[1]); })),
      lh('button', { key: "rf", type: "button", className: "btn bgb lc-big", onClick: function () { setInfo(lcAboutInfo()); announce("System info refreshed."); } }, "Refresh system info")]),
    sec("about-access", "Accessibility notes", list(info.access)),
    sec("about-credits", "Credits", [list(info.credits),
      lh('button', { key: "cr", type: "button", id: "about-credits-btn", className: "btn bgb lc-big", onClick: function () { if (Looscid.LC_NAV) Looscid.LC_NAV("credits"); } }, "Credits and open source")]));
}
function TerminalPage({ exec, onClose, a11y }) {
  const entries = useCmdLog(); // round 6: the same log the bar shows
  const [open, setOpen] = useState(termOutputOpen());
  const [sess, setSess] = useState(null); // "expand" / "collapse" for this visit, in Always expanded and Latest only
  const mode = (a11y && a11y.termOutput) || "collapsible", headings = !a11y || a11y.termHeadings !== false;
  const [val, setVal] = useState("");
  const inRef = useRef(null), boxRef = useRef(null), bodyRef = useRef(null);
  const hist = useCmdHistory(setVal);
  const brl = !!Looscid.A11Y_NOW.brailleOutput;
  useKeyboardInset(boxRef, "height");
  useEffect(function () { const b = bodyRef.current; if (b) b.scrollTop = b.scrollHeight; }, [entries]);
  useEffect(function () {
    if (inRef.current) inRef.current.focus();
    announce("Commandbar. Type help and press Enter." + (lcHints() ? " Output is under the heading Commandbar output. Escape closes." : ""));
  }, []);
  const setOutput = function (v) { setOpen(v); setTermOutputOpen(v); };
  const run = function (cmd) {
    const r = exec(cmd, "terminal"); if (!r || r.closed) return;
    if (r.clear) return;
    if (r.output) { if (mode === "collapsible") setOutput(r.output === "expand"); else setSess(r.output); }
  };
  const submit = function (e) { e.preventDefault(); run(val); setVal(""); };
  const lineCount = entries.reduce(function (n, e) { return n + e.lines.length; }, 0);
  const shown = mode === "collapsible" ? (open ? entries : []) : mode === "expanded" ? (sess === "collapse" ? [] : entries) : (sess === "expand" ? entries : entries.slice(-1));
  const hiddenNote = mode === "expanded" && sess === "collapse" ? "Output hidden for now. Type output expand to show it." : null;
  const countText = "Commandbar output, " + lineCount + (lineCount === 1 ? " line" : " lines");
  const onKey = function (e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); } };
  return lh('div', { className: "lc-term", ref: boxRef, onKeyDown: onKey, role: "region", "aria-labelledby": "lc-term-h", "aria-live": "off" },
    lh('div', { className: "lc-term-hd" },
      lh('h1', { id: "lc-term-h", className: "lc-term-title", tabIndex: -1 }, "Commandbar"),
      lh('button', Object.assign({ type: "button", className: "lc-icon-btn lc-term-close", onClick: onClose }, lcCloseProps("Commandbar")), "Close")),
    lh('div', { className: "lc-term-body", ref: bodyRef, tabIndex: 0, role: "region", "aria-label": "Commandbar scrollback" },
      lh('p', { className: "lc-term-hi" }, "Welcome to Commandbar. Type help and press Enter. Commands you run in the bar show here too."),
      mode === "collapsible"
        ? lh('h2', { className: "lc-out-h" },
          lh('button', { type: "button", id: "lc-out-toggle", className: "lc-out-tg", "aria-expanded": open, "aria-controls": "lc-out",
            onClick: function () { setOutput(!open); } },
            lh('span', { className: "lc-out-ic", "aria-hidden": "true" }, open ? "\u25be" : "\u25b8"), countText))
        : lh('h2', { className: "lc-out-h lc-out-plain", id: "lc-out-h" }, mode === "latest" && sess !== "expand" ? "Latest output" + (entries.length > 1 ? ", " + entries.length + " commands in history" : "") : countText),
      lh('div', { id: "lc-out", className: "lc-out", role: "log", "aria-live": "off", "aria-label": "Commandbar output", hidden: mode === "collapsible" ? !open : false },
        hiddenNote ? lh('p', { className: "lc-l lc-l-dimt" }, hiddenNote)
        : shown.length ? lh(LcCmdLog, { entries: shown, headings: headings }) : lh('p', { className: "lc-l lc-l-dimt" }, "No output yet."))),
    lh('div', { className: "lc-term-foot" },
      lh('h2', { id: "lc-chips-h", className: "lc-chips-h" }, "Quick commands"),
      lh('ul', { className: "lc-chips", "aria-labelledby": "lc-chips-h" },
        TERM_CHIPS.map(function (c) { return lh('li', { key: c[1] }, lh('button', { type: "button", className: "lc-chip", onClick: function () { run(c[1]); } }, c[0])); })),
      lh('form', { className: "lc-term-form", onSubmit: submit, autoComplete: "off" },
        lh('label', { htmlFor: "lc-term-input", className: "lc-term-label" }, lh('span', { className: "lc-prompt", "aria-hidden": "true" }, "looscid>"), lh('span', { className: "sr-pause" }, "Command")),
        lh('input', { id: "lc-term-input", ref: inRef, type: "text", value: val, onChange: function (e) { setVal(e.target.value); }, onKeyDown: hist,
          autoComplete: "off", autoCapitalize: "none", spellCheck: false, enterKeyHint: "send",
          "aria-braillelabel": brl ? "cmd" : undefined }),
        lh('button', { type: "submit", className: "btn bp lc-run" }, "Run")),
      lh('p', { id: "lc-term-hint", className: "lc-desc" }, "Enter runs. Up and Down arrows recall earlier commands. Escape closes.")));
}
/* --- First visit: one question ------------------------------------------- */

/* --- Settings > Looscid Labs (merged into the one Settings menu) --- */
// Everything planned lives here, in ONE place (round 5): no "coming soon" controls anywhere else.
const LC_COMING_SOON = [
  { name: "Cherry personality and tone", where: "Intelligence", desc: "Friendly or concise answers, and how often Cherry offers suggestions." },
  { name: "Cherry algorithm controls", where: "Feeds", desc: "Tune what Cherry puts in your For You feed. Kept with the feed settings, not in Intelligence." },
  { name: "Spelling, grammar and inline math", where: "Intelligence", desc: "Cherry fixes typos and solves sums as you write, on this device." },
  { name: "AI image descriptions", where: "Accessibility, Vision", desc: "Cherry describes images in Dreams, on this device." },
  { name: "RTT and TTY", where: "Accessibility, Hearing", desc: "Real-time text for calls." },
  { name: "Native braille drivers", where: "Sense", desc: "Direct USB and Bluetooth braille display support, without a screen reader." },
  { name: "Mute and Block", where: "Dream and reply options", desc: "Stop seeing a Dreamor's Dreams and replies." },
  { name: "Report", where: "Dream and reply options", desc: "Flag a Dream or reply for review." },
  { name: "Custom feeds", where: "Feeds and Create", desc: "Build your own feed, as its own tab." },
  { name: "Pubky login", where: "LooscidID", desc: "Log in with the Pubky Ring app. No email or phone number." },
  { name: "Plume", where: "LooscidID", desc: "Its login needs your password, so Looscid will follow Plume blogs over ActivityPub instead." },
  { name: "Other devices", where: "LooscidID, Devices", desc: "See and sign out other devices that use your LooscidID." },
  { name: "Log in with LooscidID", where: "LooscidID, Connected apps", desc: "Let other apps log in with your LooscidID." },
  { name: "Joining Looscid Labs", where: "Looscid Labs", desc: "Sign up for early access." },
  { name: "Marketplace", where: "Labs, beta", desc: "Buy and sell inside Looscid. Early testers shape how it works before launch." },
  { name: "Store", where: "Labs, alpha", desc: "Apps, tools and add-ons for Dreamors." },
  { name: "Mini Apps", where: "Labs, alpha", desc: "Tiny utilities that live inside Looscid." },
  { name: "Advanced Analytics", where: "Labs, beta", desc: "Deeper stats: reach, engagement and best times to Dream." },
  { name: "Collaborative Dreams", where: "Labs, concept", desc: "Write a Dream together with another Dreamor. Two voices, one Dream." },
];
Looscid.LC_COMING_SOON = LC_COMING_SOON;
function LabsSettings({ navigate }) {
  return lh('div', { className: "pg" },
    lh(BackHeader, { title: "Looscid Labs", onBack: function () { navigate("settings"); } }),
    lh('div', { style: { padding: "0 16px 24px" } },
      lh('p', { className: "lc-desc", style: { fontSize: 15 } }, "Looscid Labs is where we build in public. Nothing on this page is a control: it is a plain list of what we plan, so every other screen shows only things that work today."),
      lh('h2', { className: "slbl", id: "lc-soon-h" }, "Coming soon"),
      lh('ul', { className: "lc-labs", "aria-labelledby": "lc-soon-h" }, LC_COMING_SOON.map(function (f) {
        return lh('li', { key: f.name, className: "lc-labs-i" },
          lh('h3', { className: "lc-labs-n" }, f.name),
          lh('p', { className: "lc-labs-s" }, "Will live in: " + f.where),
          lh('p', { className: "lc-desc" }, f.desc));
      }))));
}
/* --- Settings > Apps (round 6): real per-app settings, written to each app's own saved settings
   (same site, so the apps read them the next time they open). Looscid's Sounds switch and master
   volume still apply on top inside Looscid. Memeprojects and Easyconvert have no settings of their own. */
const LC_APP_GENRES = [["original", "Original"], ["hyperpop", "Hyperpop"], ["lofi", "Lo-fi chill"], ["dnb", "Drum and bass"], ["chiptune", "Chiptune (8-bit)"]];
Looscid.LC_APP_GENRES = LC_APP_GENRES;
const LC_INS_CH = [["rain", "Rain"], ["fan", "Fan hum"], ["whir", "Old computer whir"], ["crick", "Crickets"]];
Looscid.LC_INS_CH = LC_INS_CH;
function lcAppGet(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
function lcAppPut(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
const LC_APP_SET = {
  // Insomnia (apps/insomnia/script.js: store "insomnia-os:*")
  insVolume: { get: function () { return Math.min(150, Math.max(0, +lcAppGet("insomnia-os:volume", 100) || 0)); }, put: function (v) { lcAppPut("insomnia-os:volume", v); } },
  insSound: { get: function () { return !lcAppGet("insomnia-os:muted", false); }, put: function (v) { lcAppPut("insomnia-os:muted", !v); } },
  insMix: { get: function () { const m = lcAppGet("insomnia-os:mix", {}); return m && typeof m === "object" ? m : {}; }, put: function (m) { lcAppPut("insomnia-os:mix", m); } },
  // Desktop (web/script.js: "looscid:*")
  deskVolume: { get: function () { return Math.min(150, Math.max(0, +lcAppGet("looscid:volume", 100) || 0)); }, put: function (v) { lcAppPut("looscid:volume", Math.round(v / 5) * 5); } },
  deskSound: { get: function () { return !lcAppGet("looscid:muted", false); }, put: function (v) { lcAppPut("looscid:muted", !v); } },
  deskKeys: { get: function () { return lcAppGet("looscid:key_sounds", true) !== false; }, put: function (v) { lcAppPut("looscid:key_sounds", !!v); } },
  deskBeat: { get: function () { return lcAppGet("looscid:beat_genre", "original"); }, put: function (v) { lcAppPut("looscid:beat_genre", v); } },
  // Kernel (real/real.js: "nexos-real-sound" = { on, vol })
  kerSound: { get: function () { const s = lcAppGet("nexos-real-sound", {}) || {}; return s.on !== false; }, put: function (v) { const s = lcAppGet("nexos-real-sound", {}) || {}; s.on = !!v; if (typeof s.vol !== "number") s.vol = 100; lcAppPut("nexos-real-sound", s); } },
  kerVolume: { get: function () { const s = lcAppGet("nexos-real-sound", {}) || {}; return typeof s.vol === "number" ? s.vol : 100; }, put: function (v) { const s = lcAppGet("nexos-real-sound", {}) || {}; s.vol = v; if (typeof s.on !== "boolean") s.on = true; lcAppPut("nexos-real-sound", s); } },
};
Looscid.LC_APP_SET = LC_APP_SET;
function LcAppRange({ id, label, value, max, onSet }) {
  return lh('div', { className: "lc-row lc-vol" },
    lh('label', { htmlFor: id, className: "lc-fs-l" }, label),
    lh('div', { className: "lc-vol-row" },
      lh('input', { id: id, type: "range", min: 0, max: max || 150, step: 5, value: value, className: "lc-range", "aria-valuetext": value ? value + " percent" : "off",
        onChange: function (e) { onSet(+e.target.value); } }),
      lh('span', { className: "lc-vol-n", "aria-hidden": "true" }, value + "%")));
}
function AppsSettings({ navigate }) {
  const [, tick] = useState(0);
  const re = function () { tick(function (x) { return x + 1; }); };
  const put = function (k, v, say) { LC_APP_SET[k].put(v); re(); if (say) announce(say); };
  const open = function (id) { const a = LC_NEXOS_APPS.find(function (x) { return x.id === id; }); Looscid.LC_NEXOS_OPEN = a; navigate("nexos_app", a); };
  const sw = function (id, k, label, desc) { const on = LC_APP_SET[k].get(); return lh(A11ySwitch, { key: id, id: id, label: label, desc: desc, on: on, onToggle: function () { put(k, !on, label + ": " + (!on ? "on" : "off") + "."); } }); };
  const openBtn = function (id, name) { return lh('button', { type: "button", id: "lc-app-open-" + id, className: "btn bp lc-big", onClick: function () { open(id); } }, "Open " + name); };
  const mix = LC_APP_SET.insMix.get();
  const beat = LC_APP_SET.deskBeat.get();
  const sec = function (id, title, kids) { return lh('section', { key: id, className: "lc-grp", "aria-labelledby": "lc-app-" + id + "-h", id: "lc-app-" + id }, lh('h2', { id: "lc-app-" + id + "-h", className: "lc-grp-h", tabIndex: -1 }, title), kids); };
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: "Apps", onBack: function () { navigate("settings"); } }),
    lh('p', { className: "lc-desc", style: { padding: "0 16px" } }, "Each app's own settings, saved on this device. Looscid's Sounds switch and volume also apply when an app is open in Looscid."),
    sec("insomnia", "Insomnia", [
      sw("set-app-insSound", "insSound", "Insomnia sound", "Off mutes the soundscape and Insomnia's chimes."),
      lh(LcAppRange, { key: "v", id: "set-app-insVolume", label: "Insomnia volume", value: LC_APP_SET.insVolume.get(), onSet: function (v) { put("insVolume", v); } }),
      lh('fieldset', { key: "mix", className: "lc-fs", id: "set-app-insMix" },
        lh('legend', { className: "lc-fs-l" }, "Soundscape"),
        LC_INS_CH.map(function (c) { const v = Math.max(0, Math.min(100, +mix[c[0]] || 0)); return lh(LcAppRange, { key: c[0], id: "set-app-ins-" + c[0], label: c[1], value: v, max: 100, onSet: function (n) { const m = Object.assign({}, LC_APP_SET.insMix.get()); m[c[0]] = n; put("insMix", m); } }); })),
      lh('div', { key: "o", className: "lc-row" }, openBtn("insomnia", "Insomnia"))]),
    sec("web", "Desktop", [
      sw("set-app-deskSound", "deskSound", "Desktop sound", "Off mutes Desktop's chimes, beeps and the beat."),
      lh(LcAppRange, { key: "v", id: "set-app-deskVolume", label: "Desktop volume", value: LC_APP_SET.deskVolume.get(), onSet: function (v) { put("deskVolume", v); } }),
      sw("set-app-deskKeys", "deskKeys", "Desktop typing clicks"),
      lh('fieldset', { key: "beat", className: "lc-fs", id: "set-app-deskBeat" },
        lh('legend', { className: "lc-fs-l" }, "Beat style"),
        lh('div', { className: "lc-radios lc-radios-col" }, LC_APP_GENRES.map(function (g) {
          return lh('label', { key: g[0], className: "lc-radio" + (beat === g[0] ? " on" : "") },
            lh('input', { type: "radio", name: "lc-app-beat", value: g[0], checked: beat === g[0], onChange: function () { put("deskBeat", g[0], "Beat style: " + g[1] + "."); } }), lh('span', null, g[1]));
        }))),
      lh('div', { key: "o", className: "lc-row" }, openBtn("web", "Desktop"))]),
    sec("real", "Kernel", [
      sw("set-app-kerSound", "kerSound", "Kernel sound", "The emulated PC speaker's beeps."),
      lh(LcAppRange, { key: "v", id: "set-app-kerVolume", label: "Kernel volume", value: LC_APP_SET.kerVolume.get(), onSet: function (v) { put("kerVolume", v); } }),
      lh('div', { key: "o", className: "lc-row" }, openBtn("real", "Kernel"))]),
    sec("memes", "Memeprojects", [
      lh('p', { key: "n", className: "lc-desc" }, "Memeprojects has no settings of its own yet."),
      lh('div', { key: "o", className: "lc-row" }, openBtn("memes", "Memeprojects"))]),
    sec("easyconvert", "Easyconvert", [
      lh('p', { key: "n", className: "lc-desc" }, "Easyconvert has no settings of its own yet."),
      lh('div', { key: "o", className: "lc-row" }, openBtn("easyconvert", "Easyconvert"))]),
    lh(LcResetLast, { scope: "apps" }));
}
function NexosAppsPage({ navigate }) {
  // Round 6: Looscid's Apps page (page id kept as nexos_apps so old links still land here).
  return lh('div', { className: "pg" },
    lh(BackHeader, { title: "Apps", onBack: function () { navigate("settings"); } }), // build 150 (#60): Back returns where Apps was opened, with the Back sound
    lh('div', { style: { padding: "0 16px 24px" } },
      lh('p', { className: "lc-desc", style: { fontSize: 15 } }, "Looscid's own apps. Each opens right here, with Back. Nothing loads until you open one."),
      lh('h2', { className: "slbl", id: "lc-nx-h" }, "Apps"),
      lcMenuList("lc-nx-apps", "Apps", lcAppItems().map(function (x) { return { id: x.id, l: x.l, sub: x.sub, a: function () { x.go(navigate); } }; })),
      lh('h2', { className: "slbl", id: "lc-nx-sh" }, "Inside Desktop"),
      lh('p', { className: "lc-desc" }, "These open inside Desktop. Each opens Desktop here in Looscid; then type the word in brackets."),
      lcMenuList("lc-nx-shell", "Inside Desktop", LC_NEXOS_SHELL.map(function (x) {
        return { id: x[0], l: x[1] + " (" + x[0] + ")", a: function () { const w = LC_NEXOS_APPS.find(function (a) { return a.id === "web"; }); Looscid.LC_NEXOS_OPEN = w; navigate("nexos_app", w); } };
      }))));
}
function NexosAppFrame({ app, navigate }) {
  const a = app || Looscid.LC_NEXOS_OPEN || LC_NEXOS_APPS[0];
  const frameRef = useRef(null);
  const [storeName] = useState(Looscid.lcAppStoreName); // the apps' saved data, once, as the frame's name (js/appguard.js)
  // The real kernel's own Back button (and Escape in the apps) post to Looscid: back to Looscid OS apps.
  // Leaving this page unmounts the frame, which stops the emulator and its sound.
  useEffect(function () {
    function onMsg(e) {
      if ((e.origin !== location.origin && e.origin !== "null") || !e.data || !frameRef.current || e.source !== frameRef.current.contentWindow) return;
      if (e.data.nexos === "back" || e.data.nexos === "escape") navigate("nexos_apps");
    }
    window.addEventListener("message", onMsg);
    return function () { window.removeEventListener("message", onMsg); };
  }, []);
  return lh('div', { className: "pg lc-nx-frame" },
    lh(BackHeader, { title: a.name, onBack: function () { navigate("nexos_apps"); } }),
    lh('p', { className: "lc-desc", style: { padding: "0 16px" } }, a.sub + "."),
    lh('iframe', { ref: frameRef, id: "lc-nx-iframe", className: "lc-apps-frame" + (a.id === "real" ? " lc-apps-frame-real" : ""), src: a.url, title: a.name + ", part of Looscid", allow: "autoplay; clipboard-write",
      // Security pass: sandboxed, with no allow-same-origin, so the app can't reach Looscid's storage or your Nostr key (js/apphost.js).
      sandbox: Looscid.LC_APP_SANDBOX, name: storeName,
      onLoad: function () { lcNexosSend(frameRef.current); } }));
}
function lcLinkedProviders() { const o = { local: true }; try { getMethods().forEach(function (m) { o[m.provider] = true; }); } catch (e) {} return o; }
function LcSetRow({ def, onChange }) {
  if (def.k === "findPubky") return null; // Pubky login is on the Coming soon list, so there is nothing to find yet
  const a = Looscid.A11Y_NOW, v = a[def.k], id = def.k === "earconVolume" ? "a11y-volume" : (def.old ? "a11y-" : "set-") + def.k; // older settings keep their round-1 ids
  const put = function (val, say) { const p = {}; p[def.k] = val; lcSet(p); if (onChange) onChange(val); if (say !== false) announce(def.l + ": " + lcValueText(def, val) + ".", "confirm"); };
  if (def.t === "bool" && def.pc) {
    // Pitch cue types (Verbosity page): native checkboxes inside the "Pitch cue for" fieldset.
    return lh('label', { className: "lc-radio" + (v ? " on" : "") },
      lh('input', { type: "checkbox", id: id, checked: v !== false, onChange: function () { put(v === false); } }), lh('span', null, def.l));
  }
  if (def.t === "bool") {
    if (def.k === "haptics" && !lcHapticsSupported()) return lh(A11ySwitch, { id: id, label: def.l + ", not supported on this device", desc: "This device or browser has no vibration support, so Haptics stays off. " + (def.desc || ""), on: false, locked: true });
    if (def.cherry && !lcAiOn()) return lh(A11ySwitch, { id: id, label: def.l + ", turn on Cherry first", desc: "Cherry is off. Turn it on in Settings, Intelligence, Cherry.", on: false, locked: true });
    if (def.id && def.id !== "local" && !lcLinkedProviders()[def.id]) return lh(A11ySwitch, { id: id, label: def.l + ", link it in LooscidID first", desc: "Link this identity in Settings, LooscidID, Login methods. Then you can turn this on.", on: false, locked: true });
    return lh(A11ySwitch, { id: id, label: def.l, desc: def.desc, on: !!v, onToggle: function () { put(!v, false); } });
  }
  if (def.t === "choice" && def.menu) {
    const soon = def.k === "translateTo" && !lcTranslateOk();
    return lh('div', { className: "lc-row" },
      lh(LcMenu, { id: id, label: def.l, value: v, items: def.o.map(function (o) { return { id: o[0], name: o[1] }; }), onSelect: function (val) { put(val); } }),
      soon ? lh('p', { id: id + "-d", className: "lc-desc" }, "This browser has no on-device translator, so the Translate action stays hidden in Dream options here. Looscid never sends your Dreams to an outside service to translate them.") : lh('p', { className: "lc-desc" }, "Translate uses your browser's own on-device translator. Nothing leaves your device."));
  }
  if (def.t === "choice" && def.aud && !Looscid.LC_FORCED[def.k]) {
    // Round 6: audience radios. Values from older builds: "friends" is Mutuals.
    return lh(LcAudience, { id: id, legend: def.l, value: v === "friends" ? "mutuals" : v, options: def.o, customKey: "perm_" + def.k,
      onChange: function (val) { put(val, false); },
      note: def.live ? "Applies now to alerts on this device. Other apps on the same networks decide whether they follow it." : "Saved, applies when sharing is live." });
  }
  if (def.t === "choice") {
    const forced = Looscid.LC_FORCED[def.k];
    if (forced) return lh('fieldset', { className: "lc-fs", id: id, disabled: true },
      lh('legend', { className: "lc-fs-l" }, def.l + ", set by Private account"),
      lh('div', { className: "lc-radios lc-radios-col" }, def.o.map(function (o) {
        const on = forced === o[0];
        return lh('label', { key: o[0], className: "lc-radio" + (on ? " on" : "") }, lh('input', { type: "radio", name: "lcs-" + def.k, value: o[0], checked: on, readOnly: true }), lh('span', null, o[1]));
      })));
    return lh('fieldset', { className: "lc-fs", id: id },
      lh('legend', { className: "lc-fs-l" }, def.l),
      
      lh('div', { className: "lc-radios lc-radios-col" }, def.o.map(function (o) {
        const on = String(v) === String(o[0]);
        return lh('label', { key: o[0], className: "lc-radio" + (on ? " on" : "") },
          lh('input', { type: "radio", name: "lcs-" + def.k, value: o[0], checked: on,
            // Round 6.6 (2three1y, 5:19 PM): Soundpacks. Moving to a pack plays a short preview of it; choosing it (Space,
            // arrows, a tap, VoiceOver double-tap, braille Enter) switches every earcon to it right away and says so once.
            onFocus: def.k === "soundPack" ? function () { if (o[0] === "custom") return; Looscid.LC_PACK_PREV_AT = Date.now(); Earcon.play(o[0] === "soundvault" ? "open" : "send", { test: true, pack: o[0] }); } : undefined,
            onChange: function () { if (def.k === "soundPack") { put(o[0], false); announce("Soundpack: " + o[1] + ".", "essential"); } else put(o[0]); if (def.k === "soundPack") { window.__lcPackSwitch = (window.__lcPackSwitch || 0) + 1; if (Date.now() - (Looscid.LC_PACK_PREV_AT || 0) > 200) setTimeout(function () { Earcon.play(o[0] === "soundvault" ? "open" : "send", { test: true }); }, 40); } } }), lh('span', null, o[1]));
      })));
  }
  if (def.t === "range") {
    return lh('div', { className: "lc-row lc-vol" },
      lh('label', { htmlFor: id, className: "lc-fs-l" }, def.l),
      lh('div', { className: "lc-vol-row" },
        lh('input', { id: id, type: "range", min: def.min, max: def.max, step: def.step, value: v, className: "lc-range", "aria-valuetext": lcValueText(def, v),
          onChange: function (e) { put(+e.target.value, false); } }),
        lh('span', { className: "lc-vol-n", "aria-hidden": "true" }, v + (def.unit === "percent" ? "%" : ""))));
  }
  if (def.t === "time") {
    return lh('div', { className: "lc-row" },
      lh('label', { htmlFor: id, className: "lc-fs-l", style: { display: "block" } }, def.l),
      lh('input', { id: id, type: "time", className: "lc-text", value: v || "", onChange: function (e) { if (e.target.value) put(e.target.value, false); } }));
  }
  if (def.t === "words") return lh(LcWordsRow, { def: def });
  if (def.t === "voice") return lh(LcVoiceRow, { def: def });
  return null;
}
function LcWordsRow({ def }) {
  const [txt, setTxt] = useState(String(Looscid.A11Y_NOW[def.k] || ""));
  const [msg, setMsg] = useState("");
  const id = "set-" + def.k;
  useEffect(function () { setTxt(String(Looscid.A11Y_NOW[def.k] || "")); }, [Looscid.A11Y_NOW[def.k]]);
  const save = function () { const w = lcWords(txt); const p = {}; p[def.k] = w.join(", "); lcSet(p); const m = def.l + " saved: " + (w.length ? w.join(", ") : "none") + "."; setMsg(m); announce(m); };
  return lh('div', { className: "lc-row" },
    lh('label', { htmlFor: id, className: "lc-fs-l", style: { display: "block" } }, def.l),
    lh('p', { id: id + "-d", className: "lc-desc" }, def.desc),
    lh('div', { className: "lc-inrow" },
      lh('input', { id: id, type: "text", className: "lc-text", value: txt, autoComplete: "off", onChange: function (e) { setTxt(e.target.value); }, onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); save(); } } }),
      lh('button', { type: "button", className: "btn bgb lc-btn", onClick: save, "aria-label": "Save " + def.l.toLowerCase() }, "Save")),
    msg ? lh('p', { className: "lc-desc", role: "status" }, msg) : null);
}
function LcVoiceRow({ def }) {
  const [voices, setVoices] = useState(LcSpeech.voices());
  useEffect(function () { if (!LcSpeech.ok) return; const f = function () { setVoices(LcSpeech.voices()); }; try { window.speechSynthesis.addEventListener("voiceschanged", f); } catch (e) {} const t = setTimeout(f, 400); return function () { clearTimeout(t); try { window.speechSynthesis.removeEventListener("voiceschanged", f); } catch (e) {} }; }, []);
  const id = "set-" + def.k, v = Looscid.A11Y_NOW[def.k] || "";
  if (!LcSpeech.ok) return lh('p', { className: "lc-desc" }, "Read aloud isn't available in this browser, so the voice, rate and pitch below have no effect here.");
  return lh('div', { className: "lc-row" },
    lh(LcMenu, { id: id, label: def.l, value: v, title: def.l, search: voices.length > 12 ? "Search voices" : undefined,
      items: [{ id: "", name: "Device default" }].concat(voices.map(function (x) { return { id: x.voiceURI, name: x.name + (x.lang ? " (" + x.lang + ")" : "") }; })),
      onSelect: function (val) { lcSet({ ttsVoice: val }); const vv = voices.find(function (x) { return x.voiceURI === val; }); announce("Voice: " + (vv ? vv.name : "device default") + "."); } }));
}
// Round 6: no per-section Reset buttons. Each settings page has one Reset, its last item (LcResetLast).
function LcResetBtn() { return null; }
// A settings section: heading, its rows (optionally grouped by g with h3 subheadings), extras, Reset.
function LcSection({ sec, level, title, intro, before, after, noReset, only, bare, labelledBy }) {
  const defs = LC_SET.filter(function (d) { return d.s === sec && !d.hide && (!only || only.indexOf(d.k) >= 0); });
  const sfx = title && title !== LC_SECTIONS[sec].t ? "-" + String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-") : "";
  const H = level === 3 ? 'h3' : 'h2', SubH = level === 3 ? 'h4' : 'h3', hid = "lcs-h-" + sec + sfx;
  const groups = []; defs.forEach(function (d) { const g = d.g || ""; let x = groups.find(function (y) { return y[0] === g; }); if (!x) { x = [g, []]; groups.push(x); } x[1].push(d); });
  return lh('section', { className: "lc-grp", "aria-labelledby": labelledBy || hid, id: "lcs-" + sec + sfx },
    bare ? null : lh(H, { id: hid, className: level === 3 ? "lc-sub-h" : "lc-grp-h", tabIndex: -1 }, title || lcSectionTitle(sec)),
    // Round 6: one short line of plain text under the section heading (never linked to a control).
    (intro || LC_SECTIONS[sec].d) ? lh('p', { className: "lc-desc lc-sec-d" }, intro || LC_SECTIONS[sec].d) : null,
    before || null,
    groups.map(function (g) { return lh(React.Fragment, { key: g[0] || "x" }, g[0] ? lh(SubH, { className: "lc-sub-h" }, g[0]) : null, g[1].map(function (d) { return lh(LcSetRow, { key: d.k, def: d }); })); }),
    after || null,
    noReset ? null : lh(LcResetBtn, { sec: sec, label: title }));
}
function BrailleStyle() {
  const a = useA11yNow();
  const [, tick] = useState(0);
  useEffect(function () {
    const f = function () { tick(function (x) { return x + 1; }); };
    window.addEventListener("looscid:braillestyles", f); window.addEventListener("looscid:brnotice", f);
    return function () { window.removeEventListener("looscid:braillestyles", f); window.removeEventListener("looscid:brnotice", f); Looscid.LC_BR_NOTICE = null; }; // leaving the page ends the notice
  }, []);
  const list = lcBrList();
  const style = a.brailleStyle || "braillenote";
  const selCustom = list.find(function (x) { return "c:" + x.id === style; });
  const [isNew, setIsNew] = useState(false);
  const [txt, setTxt] = useState(selCustom ? selCustom.name : "");
  const [err, setErr] = useState("");
  const [past, setPast] = useState(function () { try { const p = sessionStorage.getItem("looscid_br_past"); sessionStorage.removeItem("looscid_br_past"); return p; } catch (e) { return null; } });
  const fieldRef = useRef(null);
  const editing = isNew || !!selCustom;
  // the field always shows the selected custom entry's text
  const lastSel = useRef(style);
  useEffect(function () { if (lastSel.current !== style) { lastSel.current = style; setTxt(selCustom ? selCustom.name : ""); setErr(""); if (selCustom) setIsNew(false); } });
  useEffect(function () { let f = null; try { f = sessionStorage.getItem("looscid_br_focus"); sessionStorage.removeItem("looscid_br_focus"); } catch (e) {} if (f === "field") setTimeout(function () { if (fieldRef.current) fieldRef.current.focus(); }, 120); }, []);
  const radioId = function (s) { return "lc-bs-r-" + s.replace(/[^a-z0-9]/gi, "-"); };
  const focusRadio = function (s) { setTimeout(function () { const r = document.getElementById(radioId(s)); if (r) r.focus(); }, 30); };
  const save = function () {
    setErr("");
    let r;
    if (isNew) r = lcBrCreate(txt);
    else if (selCustom) r = String(txt).trim() === "" ? lcBrDelete(selCustom.id) : lcBrRename(selCustom.id, txt);
    else return;
    if (r.err) { setErr(r.err); announce(r.err); if (fieldRef.current) fieldRef.current.focus(); return; }
    setIsNew(false);
    const now = Looscid.A11Y_NOW.brailleStyle || "braillenote";
    setTxt(r.entry && now === "c:" + r.entry.id ? r.entry.name : "");
    announce(r.ok.replace(/\. Undo is available\.$/, ", Undo"));
    focusRadio(now);
  };
  const cancel = function () { setErr(""); setIsNew(false); setTxt(selCustom ? selCustom.name : ""); announce("Canceled."); focusRadio(style); };
  const enter = useEnterSubmit(save);
  const n = Looscid.LC_BR_NOTICE;
  const pastE = past && list.find(function (x) { return x.id === past; });
  if (pastE) {
    const h = pastE.history || [];
    return lh('section', { className: "lc-bs", "aria-labelledby": "lc-bs-ph" },
      lh('button', { type: "button", className: "btn bgb lc-btn", id: "lc-bs-past-back", onClick: function () { setPast(null); focusRadio("c:" + pastE.id); } }, "Back"),
      lh('h3', { id: "lc-bs-ph", className: "lc-sub-h", tabIndex: -1 }, "Past names for " + pastE.name),
      h.length ? lh('ul', { className: "lc-bs-past", role: "list", "aria-label": "Past names" }, h.map(function (p, i) {
        return lh('li', { key: p.name + i, className: "lc-bs-pi" },
          lh('p', { className: "lc-bs-pn" }, p.name + ", added on " + lcBrDate(p.at)),
          lh('div', { className: "lc-bs-pa" },
            lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { const r = lcBrUsePast(pastE.id, i); announce(r.err || r.ok); if (!r.err) { setPast(null); focusRadio("c:" + pastE.id); } } }, "Use " + p.name),
            lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { const r = lcBrForget(pastE.id, i); announce(r.err || r.ok); setTimeout(function () { const hh = document.getElementById("lc-bs-ph"); if (hh) hh.focus(); }, 30); } }, "Permanently remove " + p.name + " from history")));
      })) : lh('p', { className: "lc-desc" }, pastE.name + " has no past names yet. Renaming it keeps the old name here."));
  }
  return lh('section', { className: "lc-bs", "aria-labelledby": "lc-bs-h", id: "lc-bs" },
    lh('h3', { id: "lc-bs-h", className: "lc-sub-h", tabIndex: -1 }, "Button style on braille"),
    lh(A11ySwitch, { id: "set-brailleRoles", label: "Short roles on braille", on: a.brailleRoles !== false, onToggle: function () { const v = !(a.brailleRoles !== false); lcSet({ brailleRoles: v }); announce("Short roles on braille: " + (v ? "on" : "off") + "."); setTimeout(lcBrStamp, 0); },
      desc: "Buttons show a short role on your braille display, like edbt, while speech still says button. With BrailleNote, radio buttons and checkboxes show their state the BrailleNote way too." }),
    lh('fieldset', { className: "lc-fs", id: "set-brailleStyle", disabled: a.brailleRoles === false },
      lh('legend', { className: "lc-fs-l" }, "Button style on braille"),
      lh('div', { className: "lc-radios lc-radios-col" },
        LC_BR_BUILTIN.map(function (b) { return lh('label', { key: b[0], className: "lc-radio" + (style === b[0] && !isNew ? " on" : "") },
          lh('input', { type: "radio", name: "lc-bstyle", id: radioId(b[0]), checked: style === b[0] && !isNew, onChange: function () { setIsNew(false); lcBrSelect(b[0]); } }), lh('span', null, b[1] + " (" + b[2] + ")")); }),
        list.map(function (x) { const s = "c:" + x.id; return lh('label', { key: x.id, className: "lc-radio" + (style === s && !isNew ? " on" : "") },
          lh('input', { type: "radio", name: "lc-bstyle", id: radioId(s), checked: style === s && !isNew, onChange: function () { setIsNew(false); lcBrSelect(s); } }), lh('span', null, "Custom (" + x.name + ")")); }),
        list.length < LC_BR_MAX ? lh('label', { key: "new", className: "lc-radio" + (isNew ? " on" : "") },
          lh('input', { type: "radio", name: "lc-bstyle", id: "lc-bs-r-new", checked: isNew, onChange: function () { setIsNew(true); setTxt(""); setErr(""); } }), lh('span', null, "New custom")) : null)),
    // One Custom field. On iPhone it opens full screen, so Save and Cancel sit right with it,
    // and Enter or braille Enter saves. Changes apply on Save, never on each keystroke.
    editing && a.brailleRoles !== false ? lh('div', { className: "lc-bs-edit" },
      lh('label', { htmlFor: "lc-bs-field", className: "lc-fs-l" }, isNew ? "New custom braille label" : "Custom braille label"),
      lh('input', Object.assign({ id: "lc-bs-field", ref: function (el) { fieldRef.current = el; enter(el); }, type: "text", className: "lc-input", value: txt, maxLength: 12, autoComplete: "off", autoCapitalize: "off", spellCheck: false, enterKeyHint: "done",
        "aria-invalid": err ? "true" : undefined, "aria-errormessage": err ? "lc-bs-err" : undefined,
        onChange: function (e) { setTxt(e.target.value); } })),
      lh('div', { className: "lc-bs-btns" },
        lh('button', { type: "button", id: "lc-bs-save", className: "btn bp lc-btn", onClick: save }, "Save"),
        lh('button', { type: "button", id: "lc-bs-cancel", className: "btn bgb lc-btn", onClick: cancel }, "Cancel"),
        selCustom && !isNew ? lh(LcMenu, { id: "lc-bs-editmenu", kind: "action", title: "Edit " + selCustom.name, btnText: "Edit", btnLabel: "Edit " + selCustom.name, btnClass: "btn bgb lc-btn",
          items: [{ id: "name", name: "Edit current name" }, { id: "past", name: "View past names (" + (selCustom.history || []).length + ")" }],
          onSelect: function (k) { if (k === "name") setTimeout(function () { if (fieldRef.current) { fieldRef.current.focus(); fieldRef.current.select(); } }, 30); else { setPast(selCustom.id); setTimeout(function () { const hh = document.getElementById("lc-bs-ph"); if (hh) hh.focus(); }, 60); } } }) : null),
      lh('p', { className: "lc-desc", id: "lc-bs-help" }, isNew ? "Up to 8 characters, like edbt2. Save adds it as its own style." : "Edit and Save renames it. Clear the field and Save deletes it."),
      err ? lh('p', { className: "lc-err", id: "lc-bs-err" }, err) : null) : null,
    // The notice stays until Dismiss or until you leave this page (2three1y, 5:55 PM).
    n ? lh('div', { className: "lc-bs-notice", id: "lc-bs-notice" },
      lh('p', { className: "lc-bs-nt" }, n.text + "."),
      n.undo ? lh('button', { type: "button", className: "btn bp lc-btn", id: "lc-bs-undo", onClick: function () { const r = lcBrUndo(); announce(r.err || r.ok); if (!r.err) focusRadio("c:" + r.entry.id); } }, "Undo") : null,
      lh('button', { type: "button", className: "btn bgb lc-btn", id: "lc-bs-dismiss", "aria-label": "Dismiss notice", "aria-braillelabel": "Dismiss", onClick: function () { lcBrNotice(null); focusRadio(Looscid.A11Y_NOW.brailleStyle || "braillenote"); } }, "Dismiss")) : null);
}
// Settings > Accessibility > Sense: General | Speech | Braille as real tabs.
const LC_SR_TABS = [["general", "sr_general"], ["speech", "sr_speech"], ["verbosity", "verbosity"], ["braille", "sr_braille"]];
Looscid.LC_SR_TABS = LC_SR_TABS;
// Round 6: the Verbosity tab panel (was its own page). Same settings and storage keys.
function LcVerbosityPanel() {
  return lh('section', { className: "lc-grp", "aria-labelledby": "lcs-h-verbosity", id: "lcs-verbosity" },
    lh('h2', { id: "lcs-h-verbosity", className: "lc-grp-h", tabIndex: -1 }, lcSrName("verbosity")),
    lh('p', { className: "lc-desc" }, "What Looscid itself says and plays. Your screen reader's own verbosity is set in VoiceOver, TalkBack or NVDA."),
    lh(LcSetRow, { def: LC_SET_BY.verbosity }),
    lh(LcResetBtn, { sec: "verbosity", label: "Verbosity" }));
}
// Build 150 (#56, 2three1y 5:15 AM Oct 11): Pitch cues live on the Speech tab now. Moved only: the same switch,
// the same "Pitch cue for" checkboxes and Preview, the same settings and storage (still reset with Verbosity's defaults).
function LcPitchCuesPanel() {
  return lh(React.Fragment, null,
    lh('section', { className: "lc-grp", "aria-labelledby": "lc-pc-h" },
      lh('h3', { id: "lc-pc-h", className: "lc-grp-h" }, "Pitch cues"),
      lh(LcSetRow, { def: LC_SET_BY.pitchCues }),
      lh('p', { className: "lc-desc", id: "lc-pc-what" }, "Each kind of thing gets its own short tone: links, buttons, headings, text fields, open and close, switches, list position, success and error. Never on feed switching, never while you type."),
      lh('fieldset', { className: "lc-fs", id: "lc-pc-types" },
        lh('legend', { className: "lc-fs-l" }, "Pitch cue for"),
        lh('div', { className: "lc-radios lc-radios-col" }, LC_SET.filter(function (d) { return d.pc; }).map(function (d) { return lh(LcSetRow, { key: d.k, def: d }); }))),
      lh('button', { type: "button", className: "btn bgb lc-btn", id: "lc-pc-preview", onClick: function () { lcPitchPreview(); } }, "Preview every pitch cue")));
}
function SrTabs() {
  useA11yNow();
  const [cur, setCur] = useState(function () { let t = "general"; try { t = sessionStorage.getItem("looscid_sr_tab") || "general"; } catch (e) {} return LC_SR_TABS.some(function (x) { return x[0] === t; }) ? t : "general"; });
  const pick = function (id, focus) { setCur(id); try { sessionStorage.setItem("looscid_sr_tab", id); } catch (e) {} if (focus) setTimeout(function () { const b = document.getElementById("srtab-" + id); if (b) b.focus(); }, 0); };
  const idx = LC_SR_TABS.findIndex(function (t) { return t[0] === cur; });
  const onKey = function (e) {
    const n = LC_SR_TABS.length; let i = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") i = (idx + 1) % n; else if (e.key === "ArrowLeft" || e.key === "ArrowUp") i = (idx - 1 + n) % n; else if (e.key === "Home") i = 0; else if (e.key === "End") i = n - 1;
    if (i !== null) { e.preventDefault(); pick(LC_SR_TABS[i][0], true); }
  };
  return lh('div', { className: "lc-srtabs" },
    lh('div', { role: "tablist", "aria-label": "Sense sections", className: "lc-stabs", onKeyDown: onKey },
      LC_SR_TABS.map(function (t, i) {
        const on = t[0] === cur;
        return lh('button', { key: t[0], id: "srtab-" + t[0], type: "button", role: "tab", "aria-selected": on, "aria-controls": "srpanel-" + t[0], tabIndex: on ? 0 : -1, className: "lc-stab" + (on ? " on" : ""), onClick: function () { pick(t[0], false); } }, lcSrName(t[0]));
      })),
    // All three panels stay in the page; only the selected one is shown (hidden ones are out of the a11y tree).
    LC_SR_TABS.map(function (t) {
      const sec = t[1];
      return lh('div', { key: t[0], role: "tabpanel", id: "srpanel-" + t[0], "aria-labelledby": "srtab-" + t[0], className: "lc-stpanel", hidden: t[0] !== cur },
        t[0] === "verbosity" ? lh(LcVerbosityPanel, null) : lh(LcSection, { sec: sec,
          before: sec === "sr_braille" ? lh(React.Fragment, null, lh(BrailleStyle, null), lh('p', { className: "lc-desc" }, "Your display\u2019s own settings, like contracted braille, cells and cursor, are set in VoiceOver, TalkBack or NVDA on your device.")) : null,
          after: lh(React.Fragment, null,
            sec === "sr_speech" ? lh(LcSpeechTest, null) : null,
            sec === "sr_speech" ? lh(LcPitchCuesPanel, null) : null,
            sec === "sr_general" ? lh(LcSrRename, null) : null) }));
    }));
}
function LcSpeechTest() {
  return lh('div', { className: "lc-row" },
    lh('button', { type: "button", className: "btn bgb lc-big", disabled: !LcSpeech.ok, onClick: function () { LcSpeech.speak([{ text: "This is how Looscid reads Dreams aloud." }, { text: "And this is a reply, read at a lower pitch.", secondary: true }]); } }, LcSpeech.ok ? "Test the read-aloud voice" : "Test the read-aloud voice, not available in this browser"),
    lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { LcSpeech.stop(); } }, "Stop reading aloud"));
}
// Rename the three sections (text field + Save, Reset to default), saved on this device.
function LcSrRename() {
  const [vals, setVals] = useState(function () { return { general: lcSrName("general"), speech: lcSrName("speech"), verbosity: lcSrName("verbosity"), braille: lcSrName("braille") }; });
  const [msg, setMsg] = useState("");
  const save = function (id) { const v = String(vals[id] || "").trim().slice(0, 30); const n = Object.assign({}, Looscid.A11Y_NOW.srNames || {}); n[id] = v || LC_SR_NAMES_DEF[id]; lcSet({ srNames: n }); const m = "Renamed " + LC_SR_NAMES_DEF[id] + " to " + n[id] + "."; setMsg(m); announce(m); };
  const reset = function () { lcSet({ srNames: Object.assign({}, LC_SR_NAMES_DEF) }); setVals(Object.assign({}, LC_SR_NAMES_DEF)); setMsg("Section names are back to General, Speech, Verbosity and Braille."); announce("Section names are back to General, Speech, Verbosity and Braille."); };
  return lh('section', { className: "lc-rename", "aria-labelledby": "lc-rename-h" },
    lh('h3', { id: "lc-rename-h", className: "lc-sub-h" }, "Rename sections"),
    lh('p', { className: "lc-desc" }, "Give General, Speech, Verbosity and Braille your own names. The tabs, headings and Commandbar use them."),
    LC_SR_TABS.map(function (t) {
      const id = "lc-rn-" + t[0];
      return lh('div', { key: t[0], className: "lc-row" },
        lh('label', { htmlFor: id, className: "lc-fs-l", style: { display: "block" } }, "Name for " + LC_SR_NAMES_DEF[t[0]]),
        lh('div', { className: "lc-inrow" },
          lh('input', { id: id, type: "text", className: "lc-text", maxLength: 30, value: vals[t[0]], onChange: function (e) { const v = e.target.value; setVals(function (o) { const x = Object.assign({}, o); x[t[0]] = v; return x; }); }, onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); save(t[0]); } } }),
          lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { save(t[0]); }, "aria-label": "Save name for " + LC_SR_NAMES_DEF[t[0]] }, "Save")));
    }),
    lh('button', { type: "button", className: "btn bgb lc-big", onClick: reset }, "Reset names to default"),
    msg ? lh('p', { className: "lc-desc", role: "status" }, msg) : null);
}
function AudioSettings({ navigate, page }) {
  useA11yNow();
  const cat = LC_AUDIO_CATS.find(function (c) { return c.page === page; });
  if (!cat) return lh(LcCatMenu, { id: "lc-audio-cats", title: "Earcons", navigate: navigate, cats: LC_AUDIO_CATS,
    intro: "Looscid's sounds live here. Pitch cues are in Accessibility, Sense, Speech. Sounds are short and battery-friendly: the audio engine sleeps while Looscid is in the background.",
    after: lh('div', { className: "lc-grp" },
      lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { Earcon.play("run", { test: true }); } }, "Play a test sound"),
      // Build 146: Test earcons plays a short sequence and says whether the sound engine started.
      lh('button', { type: "button", id: "lc-test-earcons", className: "btn bgb lc-big", onClick: function () {
        Earcon.selfTest(); announce("Earcons playing.", "essential");
        setTimeout(function () { const st = Earcon.state(); if (st !== "running") announce("Earcons couldn't start, the sound engine is " + st + ". Check the volume, and Earcons when iPhone is on silent, then try Test earcons again.", "essential"); }, 1500);
      } }, "Test earcons"),
      lh(LcResetBtn, { sec: "audio" }),
      lh('p', { className: "lc-desc" }, "Quiet hours are in Settings, Alerts. Captions and the visual cue for sounds are in Accessibility, Hearing.")) });
  const evDefs = LC_SET.filter(function (d) { return d.s === "audio" && d.ev; });
  let body;
  if (cat.id === "volume") body = lh(LcSection, { sec: "audio", title: "Earcons", only: cat.keys, noReset: true,
      intro: "Command earcons: every Commandbar command plays its own short sound, and commands in the same area sound related. A command that fails plays the error sound. Keyboard earcons: a click for each key you type in a text field, with their own sounds for Space, Delete and Enter. Both are on by default, follow the Earcons switch and the master volume, and still play in Calm mode.",
      after: lh('div', { className: "lc-packprev" },
        lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { Earcon.key({ test: true }); } }, "Preview a keyboard click"),
        lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { Earcon.key({ test: true, kind: "space" }); } }, "Preview the Space key"),
        lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { Earcon.key({ test: true, kind: "delete" }); } }, "Preview the Delete key"),
        lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { Earcon.key({ test: true, kind: "enter" }); } }, "Preview the Enter key"),
        lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { Earcon.cmd("help", "Commandbar", { test: true }); } }, "Preview a command earcon")) });
  else if (cat.id === "pack") body = lh(LcSection, { sec: "audio", title: "Soundpacks", only: cat.keys, noReset: true,
      intro: "Choose a Soundpack and every earcon switches to it right away, all over Looscid, and stays after a restart. Moving to a choice plays a short preview of it. Looscid has its own loud, classic beeps and boops. Looscid OS classic is the original NexOS sound set, with the Good Morning chime when something opens and Good Night on Back. Insomnia is Insomnia's own clicks, chimes and dings. Hyper Synth is bright synth arps and stabs. FastSM-inspired is soft, round blips and airy swooshes, inspired by FastSMRW by masonasons (no code or audio copied). Soundvault plays sounds from the Soundvault catalog, loaded from there when they play, and anything it doesn't have plays Looscid's own.",
      after: lh(React.Fragment, null,
        lh('div', { className: "lc-packprev" }, ["looscid", "nexos", "insomnia", "synth", "fastsm", "soundvault"].map(function (p) {
          const lab = { looscid: "Looscid", nexos: "Looscid OS classic", insomnia: "Insomnia", synth: "Hyper Synth", fastsm: "FastSM-inspired", soundvault: "Soundvault" }[p];
          return lh('button', { key: p, type: "button", className: "btn bgb lc-btn", onClick: function () { Earcon.play("send", { test: true, pack: p }); }, "aria-label": "Preview the " + lab + " pack" }, "Preview " + lab);
        })),
        lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { Earcon.play("boot", { test: true }); } }, "Preview boot chime"),
        lh(LcPackImport, null),
        // Round 6.6: Soundvault (a project in More) lists sound packs. Opt-in: nothing changes until you import and choose a pack.
        lh('h3', { className: "lc-sub-h" }, "Find more sounds"),
        lh('p', { className: "lc-desc" }, "Soundvault, one of my projects, lists Soundpacks and audio made for screen reader users. Download a pack there, then import its sounds above as your own pack. Looscid's earcons and pitch cues stay the same unless you choose that pack."),
        lh('button', { type: "button", id: "lc-open-soundvault", className: "btn bgb lc-btn", onClick: function () { const p = Looscid.lcFindProject && Looscid.lcFindProject("soundvault"); if (p) Looscid.lcOpenProject(p, navigate); } }, "Open Soundvault")) });
  else if (cat.id === "events") body = lh('section', { className: "lc-grp", "aria-labelledby": "lca-ev-h" },
      lh('h2', { id: "lca-ev-h", className: "lc-grp-h" }, "Earcons for each event"),
      lh('p', { className: "lc-desc" }, "Turn each sound on or off, and preview it in the Soundpack you're using."),
      evDefs.map(function (d) {
        return lh('div', { key: d.k, className: "lc-evrow" }, lh(LcSetRow, { def: d }),
          lh('button', { type: "button", className: "btn bgb lc-btn lc-prev", onClick: function () { Earcon.play(d.ev, { test: true }); }, "aria-label": "Preview " + d.l.toLowerCase() }, "Preview"));
      }),
      // Build 152: each Inbox type's own earcon (they follow the Alert switch above).
      lh('h3', { className: "lc-sub-h", id: "lca-inbox-h" }, "Inbox earcons"),
      lh('p', { className: "lc-desc" }, "Each kind of Inbox alert has its own earcon. They play when Alert is on, and each type can be silenced in Alerts settings."),
      lh('ul', { className: "lc-plain", role: "list", "aria-labelledby": "lca-inbox-h" }, [["inboxMessage", "message earcon"], ["inboxReply", "reply earcon"], ["inboxMention", "mention earcon"], ["inboxLike", "Like earcon"], ["inboxRedream", "Redream earcon"], ["inboxQuote", "Quote earcon"], ["inboxFollow", "New Dreamor earcon"]].map(function (x) {
        return lh('li', { key: x[0] }, lh('button', { type: "button", id: "lc-prev-" + x[0], className: "btn bgb lc-btn lc-prev", onClick: function () { Earcon.play(x[0], { test: true }); } }, "Preview " + x[1]));
      })),
      lh('h3', { className: "lc-sub-h" }, "Other sounds"),
      lh('ul', { className: "lc-plain", role: "list" }, [["focus", "Focus move sound"], ["open", "Open sound"], ["close", "Close sound"]].map(function (x) {
        return lh('li', { key: x[0] }, lh('button', { type: "button", className: "btn bgb lc-btn lc-prev", onClick: function () { Earcon.play(x[0], { test: true }); } }, "Preview " + x[1].toLowerCase()));
      })));
  else body = lh(LcSection, { sec: "audio", title: "Music and haptics", only: cat.keys, noReset: true });
  return lh(LcCatPage, { title: cat.l, navigate: navigate, reset: "g:snd_" + cat.id }, body);
}
// Import your own pack: a .zip or audio files, checked, mapped to events, previewed, stored in IndexedDB.
function LcPackImport() {
  const [pack, setPack] = useState(Looscid.LC_CUSTOM_PACK);
  const [msg, setMsg] = useState("");
  const [bad, setBad] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(function () { lcLoadCustomPack().then(function (p) { setPack(p); }); }, []);
  const say = function (m) { setMsg(m); announce(m); };
  const onFiles = async function (e) {
    const list = Array.prototype.slice.call(e.target.files || []); e.target.value = "";
    if (!list.length) return;
    setBusy(true); setBad([]);
    try {
      let entries = [];
      for (const f of list) {
        if (/\.zip$/i.test(f.name) || f.type === "application/zip") {
          if (f.size > 12 * 1024 * 1024) { entries.push({ name: f.name, size: f.size, bad: "the zip is bigger than 12 MB" }); continue; }
          entries = entries.concat(await lcUnzip(await f.arrayBuffer()));
        } else entries.push({ name: f.name, size: f.size, data: await f.arrayBuffer() });
      }
      const r = await lcCheckPackFiles(entries);
      setBad(r.bad);
      if (!r.ok.length) { say("No sounds were added. " + (r.bad.length ? r.bad.length + " file" + (r.bad.length === 1 ? " was" : "s were") + " left out." : "")); setBusy(false); return; }
      const prev = pack && pack.files ? pack.files.filter(function (x) { return !r.ok.find(function (y) { return y.name === x.name; }); }) : [];
      const files = prev.concat(r.ok).slice(0, LC_PACK_LIMITS.files);
      const map = Object.assign({}, lcAutoMap(files), (pack && pack.map) || {});
      Object.keys(map).forEach(function (k) { if (!files.find(function (f) { return f.name === map[k]; })) delete map[k]; });
      const np = { files: files, map: map, at: Date.now() };
      await lcPackPut(np); Looscid.LC_CUSTOM_PACK = np; setPack(np);
      say("Added " + r.ok.length + " sound" + (r.ok.length === 1 ? "" : "s") + ". " + Object.keys(map).length + " event" + (Object.keys(map).length === 1 ? " has" : "s have") + " a sound." + (r.bad.length ? " " + r.bad.length + " file" + (r.bad.length === 1 ? " was" : "s were") + " left out, listed below." : ""));
    } catch (er) { say("Couldn't import that: " + (er && er.message ? er.message : "unknown error") + "."); }
    setBusy(false);
  };
  const setMap = function (ev, name) { const np = Object.assign({}, pack, { map: Object.assign({}, pack.map) }); if (name) np.map[ev] = name; else delete np.map[ev]; lcPackPut(np).then(function () { Looscid.LC_CUSTOM_PACK = np; setPack(np); }); };
  const remove = async function () { try { await lcPackDel(); } catch (e) {} Looscid.LC_CUSTOM_PACK = null; setPack(null); if (Looscid.A11Y_NOW.soundPack === "custom") lcSet({ soundPack: "looscid" }); say("Your imported Soundpack was removed." + (Looscid.A11Y_NOW.soundPack === "looscid" ? " The Looscid pack is back on." : "")); };
  const n = pack && pack.files ? pack.files.length : 0;
  return lh('section', { className: "lc-import", "aria-labelledby": "lc-imp-h" },
    lh('h3', { id: "lc-imp-h", className: "lc-sub-h" }, "Import a Soundpack"),
    lh('p', { id: "lc-imp-d", className: "lc-desc" }, "Choose a .zip of sounds, or audio files. WAV, MP3, OGG, M4A, AAC, WebM or FLAC, up to 1 MB and 3 seconds each, 24 files and 8 MB in all. Files named like send, like, error or alert are matched to events for you. Saved only on this device."),
    lh('label', { htmlFor: "lc-imp-file", className: "btn bgb lc-big lc-filebtn" }, busy ? "Checking sounds\u2026" : "Choose a .zip or audio files"),
    lh('input', { id: "lc-imp-file", type: "file", className: "lc-file", multiple: true, accept: ".zip,application/zip,audio/*,.wav,.mp3,.ogg,.oga,.opus,.m4a,.aac,.webm,.flac", onChange: onFiles }),
    msg ? lh('p', { className: "lc-desc", role: "status" }, msg) : null,
    bad.length ? lh('ul', { className: "lc-badlist", "aria-label": "Files left out" }, bad.map(function (b, i) { return lh('li', { key: i }, b); })) : null,
    n ? lh('div', { className: "lc-pack" },
      lh('h4', { className: "lc-sub-h" }, "Your pack: " + n + " sound" + (n === 1 ? "" : "s")),
      lh('ul', { className: "lc-maplist", "aria-label": "Earcons for each event" }, LC_EVENTS.map(function (ev) {
        const sid = "lc-map-" + ev[0], cur = (pack.map || {})[ev[0]] || "";
        return lh('li', { key: ev[0], className: "lc-maprow" },
          lh(LcMenu, { id: sid, label: ev[1], value: cur, items: [{ id: "", name: "Looscid's sound" }].concat(pack.files.map(function (f) { return { id: f.name, name: f.name }; })), onSelect: function (val) { setMap(ev[0], val); } }),
          lh('button', { type: "button", className: "btn bgb lc-btn", "aria-label": "Preview " + ev[1].toLowerCase() + " from your pack", onClick: function () { Earcon.play(ev[0], { test: true, pack: "custom" }); } }, "Preview"));
      })),
      lh('button', { type: "button", className: "btn bp lc-big", disabled: Looscid.A11Y_NOW.soundPack === "custom", onClick: function () { lcSet({ soundPack: "custom" }); announce("Soundpack: your imported pack."); } }, Looscid.A11Y_NOW.soundPack === "custom" ? "Using your pack" : "Use this pack"),
      lh('button', { type: "button", className: "btn bgb lc-big", onClick: remove }, "Remove your Soundpack")) : null);
}
function lcShortcutOk(keys) { const p = keys.split("+"); return p.length > 1 && /Control|Alt|Command/.test(keys) && !/^(Control|Command)\+K$/.test(keys) || /^F\d{1,2}$/.test(keys); }
/* Build 151 (#75, 2three1y Oct 11 5:16 PM "Yes"): Settings > Tab Bar, Spring's Tab Bar page as a layout idea only.
   One row per tab: a switch to show or hide it, then Move up and Move down buttons (plain buttons, so VoiceOver, a
   keyboard and a braille display all reach them; no drag needed). Tabs pinned on the feed are listed as custom tabs,
   off until switched on. More is always last. */
function TabBarSettings({ navigate }) {
  Looscid.useTabBarTick();
  const list = Looscid.lcTabBarAll();
  const sid = function (id) { return String(id).replace(/[^a-z0-9]+/gi, "-").toLowerCase(); };
  const keep = function (elId) { setTimeout(function () { const el = document.getElementById(elId); if (el) el.focus(); }, 0); };
  const move = function (t, d) {
    const n = Looscid.lcTabBarMove(t.id, d);
    if (!n) { announce(d < 0 ? t.l + " is already first." : t.l + " is already last before More."); return; }
    keep("tb-" + (d < 0 ? "up-" : "down-") + sid(t.id)); announce("Moved " + t.l + (d < 0 ? " up" : " down") + ", now position " + n + ".");
  };
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: "Tab Bar", onBack: function () { navigate("settings"); } }),
    lh('p', { className: "lc-desc", style: { padding: "8px 16px", margin: 0 } }, "Choose which tabs show at the bottom, and their order. More is always last."),
    lh('ul', { className: "lc-tb-list", role: "list" }, list.map(function (t, i) {
      return lh('li', { key: t.id, className: "lc-tb-row" },
        lh(A11ySwitch, { id: "tb-sw-" + sid(t.id), label: t.l, on: t.on, onToggle: function () { announce(Looscid.lcTabBarToggle(t.id)); keep("tb-sw-" + sid(t.id)); } }),
        t.custom ? lh('p', { className: "lc-tb-sub" }, "Custom Tab") : null,
        lh('div', { className: "lc-tb-moves" },
          lh('button', { type: "button", id: "tb-up-" + sid(t.id), className: "btn bgb lc-btn", "aria-label": "Move " + t.l + " up", "aria-disabled": i === 0 ? "true" : undefined, onClick: function () { move(t, -1); } }, "Move up"),
          lh('button', { type: "button", id: "tb-down-" + sid(t.id), className: "btn bgb lc-btn", "aria-label": "Move " + t.l + " down", "aria-disabled": i === list.length - 1 ? "true" : undefined, onClick: function () { move(t, 1); } }, "Move down")));
    })),
    lh('p', { className: "lc-desc", style: { padding: "10px 16px", margin: 0 } }, "More is always last, so Settings is always one tap away."),
    list.some(function (t) { return t.custom; }) ? null : lh('p', { className: "lc-desc", style: { padding: "0 16px 12px", margin: 0 } }, "To add a custom tab, pin a Circle, a person, a hashtag or a thread on the Following feed. It shows up here."));
}
/* Build 152 prep (#98): Settings, Profile Tabs. The same plain pattern as the Tab Bar: one row per tab with Move up and
   Move down buttons (no drag, no rotor actions). Focus stays on the button you pressed; the new position is said once. */
function ProfileTabsSettings({ navigate }) {
  Looscid.useProfileTabsTick();
  const list = Looscid.lcProfileTabsAll();
  const keep = function (elId) { setTimeout(function () { const el = document.getElementById(elId); if (el) el.focus(); }, 0); };
  const move = function (t, d) {
    const n = Looscid.lcProfileTabsMove(t.id, d);
    if (!n) { announce(d < 0 ? t.l + " is already first." : t.l + " is already last."); return; }
    keep("ptab-" + (d < 0 ? "up-" : "down-") + t.id); announce("Moved " + t.l + (d < 0 ? " up" : " down") + ", now position " + n + ".");
  };
  const back = function () { const b = Looscid.LC_SETTINGS_BACK; Looscid.LC_SETTINGS_BACK = null; navigate(b || "settings"); };
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: "Profile Tabs", onBack: back }),
    lh('p', { className: "lc-desc", style: { padding: "8px 16px", margin: 0 } }, "The order of the tabs on profiles, yours and everyone's. Saved on this device and in your settings backup."),
    lh('ul', { className: "lc-tb-list", role: "list" }, list.map(function (t, i) {
      return lh('li', { key: t.id, className: "lc-tb-row" },
        lh('p', { className: "lc-ptab-name", id: "ptab-name-" + t.id }, t.l),
        t.sub ? lh('p', { className: "lc-tb-sub" }, t.sub) : null,
        lh('div', { className: "lc-tb-moves" },
          lh('button', { type: "button", id: "ptab-up-" + t.id, className: "btn bgb lc-btn", "aria-label": "Move " + t.l + " up", "aria-disabled": i === 0 ? "true" : undefined, onClick: function () { move(t, -1); } }, "Move up"),
          lh('button', { type: "button", id: "ptab-down-" + t.id, className: "btn bgb lc-btn", "aria-label": "Move " + t.l + " down", "aria-disabled": i === list.length - 1 ? "true" : undefined, onClick: function () { move(t, 1); } }, "Move down")));
    })),
    lh('div', { style: { padding: "12px 16px" } },
      lh('button', { type: "button", id: "ptab-reset", className: "btn bgb lc-btn", onClick: function () { Looscid.lcProfileTabsReset(); announce("Profile tabs are back in the usual order: Dreams, Replies, Redreams, Media, Liked, Mutual likes, About."); keep("ptab-reset"); } }, "Back to the usual order")));
}
function KeyboardSettings({ navigate }) {
  useA11yNow();
  const list = Looscid.A11Y_NOW.shortcuts || [];
  const [keys, setKeys] = useState("");
  const [cmd, setCmd] = useState("");
  const [msg, setMsg] = useState("");
  const say = function (m) { setMsg(m); announce(m); };
  const add = function () {
    const c = cmd.trim(); if (!keys) return say("Press the keys for the shortcut in the Keys field first.");
    if (!lcShortcutOk(keys)) return say(keys + " can't be a shortcut. Use Control, Alt or Command with a key, or a function key. Control+K is Commandbar.");
    if (!c) return say("Type the command it runs, like open music or feed following.");
    if (list.find(function (s) { return s.keys === keys; })) return say(keys + " is already a shortcut. Remove it first.");
    lcSet({ shortcuts: list.concat([{ keys: keys, cmd: c }]).slice(0, 30) }); setKeys(""); setCmd(""); say("Added: " + keys + " runs " + c + ".");
  };
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: "Keyboard shortcuts", onBack: function () { navigate("settings"); } }),
    lh('section', { className: "lc-grp", "aria-labelledby": "kb-b-h" },
      lh('h2', { id: "kb-b-h", className: "lc-grp-h" }, "Built-in shortcuts"),
      lh('ul', { className: "lc-keys lc-rows", role: "list", "aria-label": "Built-in shortcuts" }, LC_BUILTIN_KEYS.map(function (k) { return lh('li', { key: k[0] }, lh('span', { className: "lc-dt" }, k[0], lh('span', { className: "sr-only" }, ":")), " ", lh('span', { className: "lc-dd" }, k[1])); }))),
    lh('section', { className: "lc-grp", "aria-labelledby": "kb-c-h" },
      lh('h2', { id: "kb-c-h", className: "lc-grp-h" }, "Your shortcuts"),
      list.length ? lh('ul', { className: "lc-maplist", "aria-label": "Your shortcuts" }, list.map(function (s) {
        return lh('li', { key: s.keys, className: "lc-maprow" }, lh('span', null, s.keys + " runs " + s.cmd),
          lh('button', { type: "button", className: "btn bgb lc-btn", "aria-label": "Remove shortcut " + s.keys, onClick: function () { lcSet({ shortcuts: list.filter(function (x) { return x.keys !== s.keys; }) }); say("Removed " + s.keys + "."); } }, "Remove"));
      })) : lh('p', { className: "lc-desc" }, "None yet."),
      lh('h3', { className: "lc-sub-h" }, "Add a shortcut"),
      lh('div', { className: "lc-row" },
        lh('label', { htmlFor: "kb-keys", className: "lc-fs-l", style: { display: "block" } }, "Keys"),
        lh('p', { id: "kb-keys-d", className: "lc-desc" }, "Focus this field and press the keys, like Alt+M. Tab and Escape still move on."),
        lh('input', { id: "kb-keys", type: "text", readOnly: true, className: "lc-text", value: keys, placeholder: "Press keys",
          onKeyDown: function (e) { if (e.key === "Tab" || e.key === "Escape" || (e.key === "Enter" && !e.ctrlKey && !e.altKey && !e.metaKey)) return; const k = lcKeyName(e); if (!k) return; e.preventDefault(); e.stopPropagation(); setKeys(k); announce(k); } })),
      lh('div', { className: "lc-row" },
        lh('label', { htmlFor: "kb-cmd", className: "lc-fs-l", style: { display: "block" } }, "Command it runs"),
        lh('input', { id: "kb-cmd", type: "text", className: "lc-text", value: cmd, placeholder: "open music", autoComplete: "off", onChange: function (e) { setCmd(e.target.value); }, onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); add(); } } })),
      lh('button', { type: "button", className: "btn bp lc-big", onClick: add }, "Add shortcut"),
      msg ? lh('p', { className: "lc-desc", role: "status" }, msg) : null,
      lh(LcResetBtn, { sec: "keyboard", label: "Your shortcuts" })),
    lh(LcResetLast, { scope: "keyboard" }));
}
function lcImportSettings(text) {
  let o; try { o = JSON.parse(text); } catch (e) { return { err: "That file isn't a Looscid settings file." }; }
  if (!o || o.app !== "Looscid" || o.kind !== "settings" || !o.settings || typeof o.settings !== "object") return { err: "That file isn't a Looscid settings file." };
  // Build 150: backups made before the rename use the old prefix; each key is read as its looscid_ name (a looscid_ value wins).
  const set = {}; Object.keys(o.settings).forEach(function (k) { const nk = Looscid.lcNewKey(k); if (typeof o.settings[k] === "string" && (nk === k || !(nk in o.settings))) set[nk] = o.settings[k]; });
  o = Object.assign({}, o, { settings: set });
  let n = 0; LC_EXPORT_KEYS.forEach(function (k) { if (typeof o.settings[k] === "string") { try {
    // Build 150: Circles you made join the ones on this device (nothing of yours is replaced). A backup without them changes none.
    if (k === Looscid.LC_CIRCLES_KEY) { if (Looscid.lcCirclesMerge(o.settings[k])) n++; return; }
    // Build 152 prep (#99, part 4b): Lists join yours the same way (a list you both have gets the backup's Dreamors too).
    if (k === Looscid.LC_LISTS_KEY) { if (Looscid.lcListsMerge(o.settings[k])) n++; return; }
    if (k === A11Y_KEY || k === LC_SETTINGS_KEY) JSON.parse(o.settings[k]); localStorage.setItem(k, o.settings[k]); n++; } catch (e) {} } });
  return { n: n };
}
function BackupSettings({ navigate, onImported }) {
  const [msg, setMsg] = useState("");
  const say = function (m) { setMsg(m); announce(m); };
  const onFile = function (e) {
    const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    if (f.size > 512 * 1024) return say("That file is too big to be a settings file.");
    f.text().then(function (t) { const r = lcImportSettings(t); if (r.err) return say(r.err); if (onImported) onImported(); say("Settings imported: " + r.n + " groups of settings restored."); });
  };
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: "Settings backup", onBack: function () { navigate("settings"); } }),
    lh('section', { className: "lc-grp", "aria-labelledby": "bk-e-h" },
      lh('h2', { id: "bk-e-h", className: "lc-grp-h" }, "Export and import"),
      lh('p', { className: "lc-desc" }, "One JSON file with all your settings: accessibility, audio, Sense, permissions, muted words, shortcuts, theme, music and Cherry. Your Cherry chats and the Circles you made are in it too. No keys, passwords or Dreams are in it. Imported Soundpacks stay on this device."),
      lh('button', { type: "button", className: "btn bp lc-big", onClick: function () { lcDownloadSettings(); say("Exported looscid-settings.json."); } }, "Export all settings"),
      lh('label', { htmlFor: "bk-file", className: "btn bgb lc-big lc-filebtn" }, "Import settings from a file"),
      lh('input', { id: "bk-file", type: "file", className: "lc-file", accept: ".json,application/json", onChange: onFile })),
    lh('section', { className: "lc-grp", "aria-labelledby": "bk-r-h" },
      lh('h2', { id: "bk-r-h", className: "lc-grp-h" }, "Reset"),
      lh('p', { className: "lc-desc" }, "Reset is the last item in every Settings list. This one opens the whole-app Reset, where you can also pick just some settings."),
      lh('button', { type: "button", id: "lc-reset-btn", className: "btn bgb lc-big lc-reset", onClick: function () { lcOpenReset("all"); } }, "Reset")),
    msg ? lh('p', { className: "lc-desc lc-grp", role: "status" }, msg) : null);
}
})(window.Looscid = window.Looscid || {});
