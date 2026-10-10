/* Looscid more.js: the More tab: Settings, LooscidID pages, About, Apps, Admin and the other pages it opens.
   Plain script (not a module). Everything it shares goes on window.Looscid; see FILES.md for the load order. */
(function (Looscid) {
const { A11Y_DEFAULTS, A11Y_KEY, A11ySwitch, AlertDialog, Av, BackHeader, Cbx, CommentView, DREAMS_INIT, DreamCard, Earcon, GROUPS, ID_PROVIDERS, Ic, LC_A11Y_CATS, LC_A11Y_PAGE, LC_ALERT_PREFS_KEY, LC_ALERT_TYPES, LC_AUDIO_CATS, LC_BOOT, LC_BR_BUILTIN, LC_BR_MAX, LC_BUILTIN_KEYS, LC_EXPORT_KEYS, LC_FEED_MODES, LC_FIND_KEY, LC_MSG_CATS, LC_NEXOS_APPS, LC_NEXOS_SHELL, LC_SECTIONS, LC_SET, LC_SETTINGS_KEY, LC_SET_BY, LC_SR_NAMES_DEF, LC_UPDATE_AUTO_KEY, LID_NOSTR_SK_KEY, LOOSCID_BUILD, LOOSCID_RELEASED, LOOSCID_SLOGAN, LOOSCID_VERSION, LcCmdLog, LcFindMeSwitch, LcMenu, LcSpeech, ME, MUSIC_GENRES, MenuPopupButton, Music, PROVIDER_NAMES, SecretField, TRENDING, USERS, announce, getAIPrefs, getActivity, getDrafts, getIdentity, getLocalProfile, getMethods, getTopics, hexToBytes, lcAiOn, lcAlertCats, lcAlertPrefs, lcAlerts, lcAlertsMarkAll, lcAppItems, lcAudCustom, lcBlocked, lcBlockedSet, lcBrCreate, lcBrDate, lcBrDelete, lcBrForget, lcBrList, lcBrNotice, lcBrRename, lcBrSelect, lcBrStamp, lcBrUndo, lcBrUsePast, lcBrowserName, lcCatState, lcCheckUpdate, lcCloseProps, lcDownloadSettings, lcFeedMode, lcHandle, lcHapticsSupported, lcHints, lcIdbDo, lcKeyName, lcLoadCustomPack, lcNexosSend, lcOpenReset, lcPitchCue, lcQuietNow, lcReleasedText, lcSectionTitle, lcSet, lcSpoken, lcSrName, lcStorageKB, lcTranslateOk, lcUpdateAuto, lcValueText, lcVerb, lcVersionLabel, lcWords, lh, logActivity, removeMethod, sanitizeInput, setAIPrefs, shortNpub, systemReducedMotion, updateLocalProfile, useA11yNow, useCats, useCmdHistory, useCmdLog, useDreams, useEffect, useEnterSubmit, useKeyboardInset, useOAuthReturn, useRef, useState } = Looscid;
Object.assign(Looscid, { CreditsPage, ProfileView, ProfilePage, DreamorProfilePage, AccountSettings, LcAudience, lcCatSave, LcCatCustomize, MessageSettings, NotificationsSettings, PrivacySettings, LcResetLast, LcTabs, LcBlockedPanel, LcPrivacyMedia, FeedSwitchSetting, LcCatMenu, LcCatPage, CustomizabilitySettings, lcSetAiPref, IntelligenceSettings, lcMenuList, lcSubLine, AccessibilitySettings, A11yCategory, AboutSettings, MorePage, MoreAppsGroup, FeedbackPage, AdminPanel, AdminUsers, AdminContent, AdminReports, AdminAnalytics, AdminPlatform, AdminAnnouncements, PolicyPage, HourStoryPage, normalizeUrl, fieldValueText, ProfileInfoList, ChangeInfoScreen, useProfileEditor, lcJoin, methodLabel, getStoredNostrSk, ComingSoonPanel, LoginMethods, lcGetIds, lcSaveIds, lcBech32Polymod, lcDecodeBech32Key, lcCheckId, lcVerifyId, LcKeysPanel, lcIdLabel, lidWhen, thisDeviceLabel, localDataSummary, exportLocalData, deleteLocalData, LooscidIDManager, lcUnzip, lcCheckPackFiles, lcAutoMap, lcUpdateAutoSet, lcPitchPreview, MusicPage, lcAudCustomSet, useBlocked, lcAlertPrefsSet, termOutputOpen, setTermOutputOpen, lcOsName, lcAboutInfo, AboutLooscidMore, TerminalPage, LabsSettings, lcAppGet, lcAppPut, LcAppRange, AppsSettings, NexosAppsPage, NexosAppFrame, lcLinkedProviders, LcSetRow, LcWordsRow, LcVoiceRow, LcResetBtn, LcSection, BrailleStyle, LcVerbosityPanel, SrTabs, LcSpeechTest, LcSrRename, AudioSettings, LcPackImport, lcShortcutOk, KeyboardSettings, lcImportSettings, BackupSettings });

/* --- PROFILE (OWN) ----------------------- */

/* --- Profile (one view for you and for other Dreamors) ---------------------- */
function ProfileView({ user, isMe, navigate, cherryCtx, onUpdateProfile }) {
  const [tab, setTab] = useState("dreams");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name || "", bio: user.bio || "" });
  const [, bump] = useState(0);
  const [activeComment, setActiveComment] = useState(null);
  const editBtn = useRef(null), nameRef = useRef(null);
  const all = (cherryCtx && cherryCtx.dreams) || [];
  const mine = all.filter(function (d) { return d.user && d.user.id === user.id; });
  const redreams = isMe ? all.filter(function (d) { return d.redreamed; }) : [];
  const {dreams, tl, tr, tur, tq, tuq, tb, tc} = useDreams(mine);
  const following = !!(cherryCtx && cherryCtx.following && cherryCtx.following.has(user.id));
  const mutual = following && !!user.followsYou;
  const handle = (user.handle || "").replace(/^@/, "");
  const TABS = [["dreams", "Dreams"], ["redreams", "Redreams"], ["about", "About"]];
  useEffect(function () { if (editing && nameRef.current) nameRef.current.focus(); }, [editing]);
  if (activeComment) return lh(CommentView, { dream: activeComment, onBack: function () { setActiveComment(null); }, onLike: tl, onRedream: tr, onUndoRedream: tur, onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onCommentPosted: tc, navigate: navigate });
  const save = function (e) {
    e.preventDefault();
    const name = form.name.trim(); if (!name) { announce("Name can't be empty."); return; }
    const p = updateLocalProfile(null, { displayName: name, bio: form.bio.trim() });
    if (onUpdateProfile) onUpdateProfile(p);
    setEditing(false); bump(function (n) { return n + 1; }); announce("Profile saved.");
    setTimeout(function () { if (editBtn.current) editBtn.current.focus(); }, 0);
  };
  const cancel = function () { setEditing(false); setForm({ name: user.name || "", bio: user.bio || "" }); setTimeout(function () { if (editBtn.current) editBtn.current.focus(); }, 0); };
  const onTabKey = function (e) {
    const i = TABS.findIndex(function (t) { return t[0] === tab; }); let n = null;
    if (e.key === "ArrowRight") n = (i + 1) % TABS.length; else if (e.key === "ArrowLeft") n = (i + TABS.length - 1) % TABS.length; else if (e.key === "Home") n = 0; else if (e.key === "End") n = TABS.length - 1;
    if (n === null) return; e.preventDefault(); setTab(TABS[n][0]); setTimeout(function () { const b = document.getElementById("pf-tab-" + TABS[n][0]); if (b) b.focus(); }, 0);
  };
  const n = function (v, one, many) { v = v || 0; return v.toLocaleString() + " " + (v === 1 ? one : many); };
  const list = tab === "about" ? null : tab === "redreams" ? redreams : dreams;
  return lh('div', { className: "pg lc-prof" },
    lh('div', { className: "hdr" }, lh('div', { className: "hdr-row" },
      lh('button', { className: "bi", onClick: function () { navigate("feed"); }, 'aria-label': "Back" }, lh(Ic.Bck, { style: { width: 21, height: 21 } })),
      lh('span', { className: "hdr-title", "aria-hidden": "true" }, "Profile"))),
    lh('div', { className: "lc-prof-head" },
      lh('div', { "aria-hidden": "true" }, lh(Av, { user: user, size: 72 })),
      lh('h1', { className: "lc-prof-name", tabIndex: -1 }, user.name || "Dreamor"),
      lh('p', { className: "lc-prof-handle" }, lh('span', { className: "sr-only" }, "LooscidID "), "@" + handle),
      user.bio ? lh('p', { className: "lc-prof-bio" }, user.bio) : (isMe ? lh('p', { className: "lc-prof-bio lc-muted" }, "No bio yet.") : null),
      lh('p', { className: "lc-prof-stats" }, n(isMe ? mine.length : (user.dreamCount || mine.length), "Dream", "Dreams") + ", " + n(user.followers, "follower", "followers") + ", " + n(user.following, "following", "following")),
      isMe
        ? lh('button', { type: "button", ref: editBtn, className: "btn bgb lc-big", "aria-expanded": editing, "aria-controls": "pf-edit", onClick: function () { setEditing(function (v) { return !v; }); } }, "Edit profile")
        : lh('div', { className: "lc-prof-acts" },
            lh('button', { type: "button", className: "btn " + (following ? "bgb" : "bp") + " lc-big", "aria-pressed": following, onClick: function () { cherryCtx && cherryCtx.followUser(user.id); announce(following ? "Unfollowed " + user.name + "." : "Following " + user.name + "."); } }, mutual ? "Friends" : following ? "Following" : "Follow"),
            mutual ? lh('p', { className: "lc-muted" }, "You follow each other.") : user.followsYou ? lh('p', { className: "lc-muted" }, "Follows you.") : null),
      isMe && editing && lh('form', { id: "pf-edit", className: "lc-prof-edit", onSubmit: save, "aria-label": "Edit profile" },
        lh('label', { htmlFor: "pf-name" }, "Display name"),
        lh('input', { id: "pf-name", ref: nameRef, className: "inp", value: form.name, maxLength: 50, autoComplete: "name", onChange: function (e) { setForm(Object.assign({}, form, { name: e.target.value })); } }),
        lh('label', { htmlFor: "pf-bio" }, "Bio"),
        lh('textarea', { id: "pf-bio", className: "inp", rows: 3, maxLength: 160, value: form.bio, onChange: function (e) { setForm(Object.assign({}, form, { bio: e.target.value })); } }),
        lh('div', { className: "lc-q-btns" }, lh('button', { type: "submit", className: "btn bp lc-big" }, "Save"), lh('button', { type: "button", className: "btn bgb lc-big", onClick: cancel }, "Cancel")))),
    lh('div', { className: "ftabs lc-prof-tabs", role: "tablist", "aria-label": "Profile sections", onKeyDown: onTabKey },
      TABS.map(function (t) { const on = tab === t[0]; return lh('button', { key: t[0], id: "pf-tab-" + t[0], type: "button", role: "tab", className: "ftab" + (on ? " on" : ""), "aria-selected": on, tabIndex: on ? 0 : -1, "aria-controls": "pf-panel", onClick: function () { setTab(t[0]); } }, t[1]); })),
    lh('div', { id: "pf-panel", role: "tabpanel", "aria-labelledby": "pf-tab-" + tab },
      tab === "about"
        ? lh('dl', { className: "lc-dl lc-prof-about" },
            lh('dt', null, "LooscidID"), lh('dd', null, "@" + handle),
            lh('dt', null, "Joined"), lh('dd', null, user.joined || "Recently"),
            user.location ? [lh('dt', { key: "lt" }, "Location"), lh('dd', { key: "ld" }, user.location)] : null,
            user.website ? [lh('dt', { key: "wt" }, "Website"), lh('dd', { key: "wd" }, lh('a', { href: user.website, target: "_blank", rel: "noopener noreferrer me" }, user.website.replace(/^https?:\/\//, "")))] : null)
        : list.length === 0
          ? lh('div', { className: "es" }, lh('p', { className: "esl" }, tab === "dreams" ? "No Dreams yet" : "No Redreams yet"),
              lh('p', { className: "lc-muted", style: { textAlign: "center", marginTop: 6 } }, isMe ? (tab === "dreams" ? "Your Dreams will show up here." : "Dreams you redream will show up here.") : "Nothing to show yet."))
          : list.map(function (d) { return lh(DreamCard, { key: d.id, dream: d, onLike: tl, onRedream: tr, onUndoRedream: tur, onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onComment: function (x) { setActiveComment(x); }, navigate: navigate, cherryCtx: cherryCtx }); })));
}
function ProfilePage({navigate, authUser, cherryCtx, onUpdateProfile}) {
  return lh(ProfileView, { user: ME, isMe: true, navigate: navigate, cherryCtx: cherryCtx, onUpdateProfile: onUpdateProfile });
}
function DreamorProfilePage({user, navigate, cherryCtx}) {
  return lh(ProfileView, { key: user.id, user: user, isMe: user.id === ME.id, navigate: navigate, cherryCtx: cherryCtx });
}
/* --- SETTINGS ---------------------------- */
/* --- ACCOUNT SETTINGS ---------------------------------------------------- */
function AccountSettings({navigate, authUser, onSignOut, onRenameProfile, onUpdateProfile, initialTab}) {
  // Settings > Account IS LooscidID management (Hasan, Oct 8 2026), laid out like the
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
  try { localStorage.setItem("dbm_" + kind + "_cat_order", JSON.stringify(st.order)); localStorage.setItem("dbm_" + kind + "_cat_hidden", JSON.stringify(st.hidden)); } catch (e) {}
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
    lh('p', { className: "lc-desc", style: { padding: "0 16px" } }, "Who can message you, and how the Messages tab is laid out."),
    lh('section', { className: "lc-grp", "aria-labelledby": "ms-who-h" },
      lh('h2', { id: "ms-who-h", className: "lc-grp-h" }, "Who can message me"),
      lh(LcSetRow, { def: LC_SET_BY.whoMessage })),
    lh(LcCatCustomize, { kind: "msg", defs: LC_MSG_CATS }),
    lh(LcResetLast, { scope: "g:cats" }));
}
function NotificationsSettings({navigate}) {
  // Round 6: only alert types that really fire, each with on/off, sound and who can trigger it.
  // Stored in dbm_alert_prefs. Quiet hours are the real ones (Sounds and announcements obey them).
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
      , lh(LcCatCustomize, { kind: "alert", defs: lcAlertCats(), title: "Customize notification categories" })
      , lh(LcResetLast, { scope: "alerts" })
    )
  );
}
function PrivacySettings({navigate, authUser, onUpdateProfile}) {
  useA11yNow(); useBlocked();
  const priv = !!(authUser && authUser.private);
  Looscid.LC_FORCED = priv ? { whoSee: "followers", whoFollow: "approve" } : {};
  // Round 6: an accordion. Disclosure buttons (aria-expanded); one section open at a time.
  const rd = function (k, d) { try { return sessionStorage.getItem(k) || d; } catch (e) { return d; } };
  const [open, setOpen] = useState(function () { const v = rd("dbm_priv_open", "perm"); return v === "none" ? "" : v; });
  useEffect(function () {
    const f = function (e) { setOpen(e.detail); };
    window.addEventListener("looscid:privopen", f); return function () { window.removeEventListener("looscid:privopen", f); };
  }, []);
  const toggle = function (id) { const v = open === id ? "" : id; setOpen(v); try { sessionStorage.setItem("dbm_priv_open", v || "none"); } catch (e) {} };
  // Private account forces "Who can see my Dreams" to Followers and "Who can follow me" to Approve requests.
  const privSwitch = lh('div', { style: { padding: "0 0 6px" } }, lh(A11ySwitch, { id: "set-privateAccount", label: "Private account", on: priv,
    onToggle: function () { if (onUpdateProfile) onUpdateProfile({ private: !priv }); announce(priv ? "Private account off." : "Private account on."); } }));
  const SECS = [
    ["perm", "Permissions", function () { return lh(LcSection, { sec: "perm", bare: true, labelledBy: "priv-acc-perm", noReset: true, before: privSwitch,
      intro: priv ? "Private account is on, so Who can see my Dreams counts as Followers and Who can follow me as Approve requests." : "Who can see, reply to and message you. Saved on this device and sent with your Dreams as your preferences. Looscid is decentralized, so other apps on the same networks decide whether they follow them." }); }],
    ["blocked", "Blocked and muted", function () { return lh(LcBlockedPanel, null); }],
    ["pmedia", "Media and content", function () { return lh(LcPrivacyMedia, { navigate: navigate }); }],
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
  const [tab, setTab] = useState(function () { try { return sessionStorage.getItem("dbm_priv_tab") || "dreamers"; } catch (e) { return "dreamers"; } });
  useEffect(function () { const f = function (e) { setTab(e.detail); }; window.addEventListener("looscid:privtab", f); return function () { window.removeEventListener("looscid:privtab", f); }; }, []);
  const pick = function (t) { setTab(t); try { sessionStorage.setItem("dbm_priv_tab", t); } catch (e) {} };
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
      try { localStorage.removeItem("dbm_cherry_media"); } catch (e) {}
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
    let from = null; try { from = sessionStorage.getItem("dbm_cat_from_" + id); sessionStorage.removeItem("dbm_cat_from_" + id); } catch (e) {}
    if (from) setTimeout(function () { const b = document.getElementById(id + "-" + from); if (b) b.focus(); }, 90);
  }, []);
  return lh('div', { className: "pg lc-a11y" },
    lh(BackHeader, { title: title, onBack: function () { navigate("settings"); } }),
    intro ? lh('p', { className: "lc-intro" }, intro) : null,
    lcMenuList(id, title + " categories", cats.map(function (c) {
      return { id: c.id, l: c.l, sub: c.sub, a: function () { try { sessionStorage.setItem("dbm_cat_from_" + id, c.id); } catch (e) {} navigate(c.page); } };
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
  if (!cat) return lh(LcCatMenu, { id: "lc-cz-cats", title: "Customizability", intro: "Choose a category. Sounds are in Settings, Sounds. Cherry and AI are in Settings, Intelligence.", cats: LC_CZ_CATS, navigate: navigate });
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
];
Looscid.LC_AI_CATS = LC_AI_CATS;
function IntelligenceSettings({ navigate, page, prefs, setPrefs }) {
  const [, tick] = useState(0);
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
      lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { try { localStorage.removeItem("dbm_habits"); } catch (e) {} announce("Learned habits cleared."); } }, "Clear learned habits"),
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
  } else {
    body = lh(React.Fragment, null,
      lh(A11ySwitch, { id: "ai-cmd", label: "Cherry answers in Commandbar", desc: "When what you type isn't a command, Cherry answers from Looscid's own built-in rules, in Commandbar. No model, nothing sent anywhere.", on: ap.cmdAnswers !== false,
        onToggle: function () { const v = !(getAIPrefs().cmdAnswers !== false); lcSetAiPref({ cmdAnswers: v }); announce("Cherry answers in Commandbar: " + (v ? "on" : "off") + "."); } }));
  }
  return lh(LcCatPage, { title: cat.l, navigate: navigate, reset: cat.id === "cherry" ? "g:ai,cherry" : "g:cherry" }, body);
}
// Round 6: Verbosity is a tab on Screen reader and braille (General / Speech / Verbosity / Braille), not a page.
function lcMenuList(id, label, items) {
  // ul role=list > li > button first: VoiceOver says "button, 1 of 7" (round-5 queue item 3).
  const vb = lcVerb();
  return lh('ul', { className: "mlist lc-catlist", role: "list", "aria-label": label, id: id },
    items.map(function (it) {
      const sid = id + "-" + it.id + "-d";
      return lh('li', { key: it.id, className: "mli" },
        lh('button', { type: "button", id: id + "-" + it.id, className: "mitem lc-cat", onClick: it.a },
          // Round 6 (Alhasan): VoiceOver says just "Privacy, button": the label only. Explanations live as
          // plain text under section headings, not on or after each button.
          lh('span', { className: "mitem-lbl" }, it.l),
          lh(Ic.Chv, { style: { width: 13, height: 13, color: "var(--tx3)", flexShrink: 0 }, "aria-hidden": "true" })));
    }));
}
// Round 6 (Alhasan, 7:14 AM): no per-control explanation lines. Kept as a no-op so callers stay simple.
function lcSubLine() { return null; }
function AccessibilitySettings({ navigate, onAskDevice }) {
  useEffect(function () {
    let from = null; try { from = sessionStorage.getItem("dbm_a11y_from"); sessionStorage.removeItem("dbm_a11y_from"); } catch (e) {}
    if (from) setTimeout(function () { const b = document.getElementById("lc-a11y-cats-" + from); if (b) b.focus(); }, 90);
  }, []);
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: "Accessibility", onBack: function () { navigate("settings"); } }),
    lh('p', { className: "lc-intro" }, "Choose a category. Everything is saved on this device."),
    lcMenuList("lc-a11y-cats", "Accessibility categories", LC_A11Y_CATS.map(function (c) {
      return { id: c.id, l: c.l, sub: c.sub, a: function () { try { sessionStorage.setItem("dbm_a11y_from", c.id); } catch (e) {} navigate(c.page); } };
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
    let from = null; try { from = sessionStorage.getItem("dbm_cat_from_lc-sr-more"); sessionStorage.removeItem("dbm_cat_from_lc-sr-more"); } catch (e) {}
    if (from) setTimeout(function () { const b = document.getElementById("lc-sr-more-" + from); if (b) b.focus(); }, 90);
  }, []);
  return lh('div', { className: "pg lc-a11y", "aria-live": "off" },
    lh(BackHeader, { title: cat.l, onBack: function () { if (cat.parent) { try { sessionStorage.setItem("dbm_cat_from_lc-sr-more", cat.id); } catch (e) {} } navigate(cat.parent || "settings_accessibility"); } }),
    // Round 6: one line of plain text under the page heading (Screen reader and braille has one per tab instead).
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
      lh('h2', { id: "about-lead", className: "lid-sub" }, "About Looscid"),
      lh('p', { className: "lid-help" }, "Looscid is a decentralized, free and open source social app that works the way you do: with a screen reader, a braille display, a keyboard, a switch or just your thumbs. Your data stays on your device, and your LooscidID is yours."),
      lh('ul', { className: "mlist", "aria-label": "Terms, rules and feedback" },
        [["terms", "Terms"], ["privacy", "Privacy"], ["guidelines", "Community rules"], ["feedback", "Send Feedback"]].map(function (x) {
          return lh('li', { key: x[0], className: "mli" }, lh('button', { type: "button", id: "about-btn-" + x[0], className: "btn bgb lc-big", style: { width: "100%", marginTop: 8 }, onClick: function () { navigate(x[0]); } }, x[1]));
        }))),
    lh('section', { "aria-labelledby": "about-story", style: { padding: "8px 16px 12px" } },
      lh('h2', { id: "about-story", className: "lid-sub" }, "Our story"),
      lh('p', { className: "lid-help" }, "Looscid is a side project, not a company. It is made by Alhasan, a blind developer, who wanted a social app that works as well with a screen reader and a braille display as it does with eyes."),
      lh('p', { className: "lid-help" }, "So Looscid is built accessibility first: VoiceOver, TalkBack and NVDA, braille displays, keyboards and switches are tested from the start, sounds have captions, and nothing flashes."),
      lh('p', { className: "lid-help" }, "Development was paused for a while. It is back on now, and we build in public, with Tab, Alhasan's digital assistant, helping write and test the code.")),
    lh('section', { "aria-labelledby": "about-purpose", style: { padding: "0 16px 12px" } },
      lh('h2', { id: "about-purpose", className: "lid-sub" }, "What Looscid is"),
      lh('p', { className: "lid-help" }, "A decentralized, free, open source and accessible everything app. It was created to:"),
      lh('ol', { className: "lid-help", style: { paddingLeft: 22, margin: "6px 0" } },
        lh('li', null, "Give people a more decentralized experience, away from Big Tech."),
        lh('li', null, "Show that everything can be accessible for anyone."),
        lh('li', null, "Give you control and privacy.")),
      lh('p', { className: "lid-help" }, "Your LooscidID is made on this device the first time you open Looscid, with no phone number or email. Add login methods any time: Nostr, Mastodon and the fediverse, Bluesky, Funkwhale or Hubzilla. What we plan next is listed in Settings, Looscid Labs.")),
    lh(AboutLooscidMore, null),
    lh('section', { "aria-labelledby": "about-nexos", style: { padding: "0 16px 12px" } },
      lh('h2', { id: "about-nexos", className: "lid-sub" }, "NexOS"),
      lh('p', { className: "lid-help" }, "Looscid's apps came from NexOS, Alhasan's operating system project: Insomnia, Meme Projects, Easyconvert, Desktop, Kernel and the Looscid App Store. They are now built into Looscid, and NexOS keeps its own repository."),
      lh('ul', { className: "lid-help", style: { paddingLeft: 22, margin: "6px 0" } }, link("https://github.com/2three1y/nexos", "NexOS on GitHub")),
      lh('button', { type: "button", className: "btn bgb lc-big", style: { width: "100%", marginTop: 8 }, onClick: function () { navigate("nexos_apps"); } }, "Apps")),
    lh('section', { "aria-labelledby": "about-links", style: { padding: "0 16px 24px" } },
      lh('h2', { id: "about-links", className: "lid-sub" }, "Find Looscid"),
      lh('ul', { className: "lid-help", style: { paddingLeft: 22, margin: "6px 0" } },
        link("https://github.com/Looscid/Looscid", "Looscid on GitHub, the source code"),
        link("https://x.com/Looscid", "@Looscid on X")),
      lh('p', { className: "lid-help" }, "The welcome intro is in the menu, under About.")));
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
        , [
          {icon:"Cherry",l:"Cherry AI",sub:"Your Looscid companion",a:()=>navigate("cherry"),color:"#6d28d9"},
          {icon:"Drafts",l:"Drafts",sub:"Your saved Dream drafts",a:()=>navigate("drafts"),color:"#374151"},
          authUser && (authUser.isGuest || authUser.uid==="guest")
            ? {icon:"Login",l:"Login or create a LooscidID",sub:"Get a LooscidID",a:()=>navigate("login"),color:"#6d28d9"}
            : {icon:"LooscidID",l:"LooscidID",sub:"Profile, login methods and security",a:()=>navigate("settings_account"),color:"#6d28d9"},
          {icon:"Settings",l:"Settings",sub:"LooscidID, privacy, accessibility",a:()=>navigate("settings"),color:"#374151"},
          {icon:"Send Feedback",l:"Send Feedback",sub:"Help us improve Looscid",a:()=>navigate("feedback"),color:"#0e7490"},
        ].map(item => (
          React.createElement('button', { key: item.l, className: "snav", onClick: item.a, 'aria-label': item.l,}
            , React.createElement('div', { className: "snav-l",}
              , React.createElement('div', { className: "snav-ic", style: {background:item.color+"22",fontSize:17},}, item.icon)
              , React.createElement('div', null, React.createElement('div', { className: "snav-title",}, item.l), React.createElement('div', { className: "snav-sub",}, item.sub))
            )
            , React.createElement(Ic.Chv, { style: {width:16,height:16,color:"var(--tx3)"},})
          )
        ))
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
    lh('h2', { className: "msec-hdr", style: { padding: 0 } },
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
          lcSubLine("more-apps-" + it.id + "-d", it.sub));
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
            , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)"},}, u.handle, ", "  , u.dreamCount, " dreams, "   , (u.followers/1000).toFixed(1), "K followers" )
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
              "Looscid started as a late-night idea. Not a business plan. Not a pitch deck. Just a feeling that the internet needed a place that was quieter, kinder, and more yours."
            )
            , React.createElement('p', { style: {fontSize:14,color:"var(--tx2)",lineHeight:1.8,marginTop:10},},
              "It was built from scratch — one screen at a time, one feature at a time — by Alhasan, a developer who wanted something that did not exist yet. A place where accessibility was not an afterthought. Where you were not the product. Where there were no ads telling you what to want."
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
  { key: "bio", label: "Bio", heading: "Change bio", help: "A short line about you, up to 160 characters.",
    get: function (p) { return p.bio || ""; }, max: 160,
    toPatch: function (v) { return { patch: { bio: sanitizeInput(v || "").slice(0, 160) } }; } },
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
          lh('a', { href: "#change-" + f.key, id: "pf-link-" + f.key, className: "lid-field", 'aria-label': f.label + ", " + fieldValueText(f, profile),
              onClick: function (e) { e.preventDefault(); onOpen(f.key); } },
            lh('span', { className: "lid-field-l" }, f.label),
            lh('span', { className: "sr-pause" }, ", "),
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
  const save = function () {
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
        lh('input', { id: inputId, ref: enterRef, className: "inp", type: field.type === "url" ? "url" : "text", value: val, maxLength: field.max,
          autoComplete: field.autoComplete || "off", 'aria-invalid': err ? "true" : undefined,
          enterKeyHint: "done", onChange: function (e) { setVal(e.target.value); if (err) setErr(""); } })),
      isLinks && lh(React.Fragment, null,
        lh('h2', { className: "lid-sub" }, "Your links"),
        links.length === 0 ? lh('p', { className: "lid-help" }, "No links yet.") :
          lh('ul', { className: "lid-links", 'aria-label': "Your links" }, links.map(function (l, i) {
            return lh('li', { key: i },
              lh('span', null, l.name, lh('span', { className: "sr-pause" }, ", "), lh('span', { className: "lid-field-v" }, " " + l.url)),
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
        lh('button', { type: "submit", className: "btn bp" }, "Save"),
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
function getStoredNostrSk() { try { const old = localStorage.getItem("looscid_nostr_sk"); if (old) { if (!localStorage.getItem(LID_NOSTR_SK_KEY)) localStorage.setItem(LID_NOSTR_SK_KEY, old); localStorage.removeItem("looscid_nostr_sk"); } return localStorage.getItem(LID_NOSTR_SK_KEY); } catch (e) { return null; } }
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
const LC_IDS_KEY = "dbm_linked_ids";
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
function NostrPassFields({ pass, setPass, pass2, setPass2 }) {
  return lh(React.Fragment, null,
    lh('label', { htmlFor: "nostr-pass", className: "lid-label" }, "Passcode (optional)"),
    lh('input', { id: "nostr-pass", className: "inp", type: "password", autoComplete: "off", autoCapitalize: "off", spellCheck: false, value: pass, onChange: function (e) { setPass(e.target.value); } }),
    lh('label', { htmlFor: "nostr-pass2", className: "lid-label" }, "Type the passcode again"),
    lh('input', { id: "nostr-pass2", className: "inp", type: "password", autoComplete: "off", autoCapitalize: "off", spellCheck: false, value: pass2, onChange: function (e) { setPass2(e.target.value); } }),
    lh('p', { className: "lid-help" }, "With a passcode, your key is saved locked (encrypted with NIP-49), and Looscid asks for the passcode once each time you open it, before you Dream. Without a passcode, your key is saved unlocked in this browser's storage on this device, so anyone who can open this browser could read it."));
}
function NostrKeySection() {
  const N = Looscid.lcNostr;
  const st = Looscid.useNostrState();
  const hasExt = typeof window !== "undefined" && !!window.nostr && typeof window.nostr.getPublicKey === "function";
  const [how, setHow] = useState(hasExt ? "signer" : "enter");
  const [nsec, setNsec] = useState("");
  const [pass, setPass] = useState(""); const [pass2, setPass2] = useState("");
  const [unl, setUnl] = useState("");
  const [msg, setMsg] = useState(null); // {t, err}
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null); // {nsec, npub}
  const [confirmRm, setConfirmRm] = useState(false);
  const [relayIn, setRelayIn] = useState("");
  const [relayList, setRelayList] = useState(N ? N.relays() : []);
  useEffect(function () { const f = function () { if (N) setRelayList(N.relays()); }; window.addEventListener("looscid-nostr", f); return function () { window.removeEventListener("looscid-nostr", f); }; }, []);
  const say = function (t, err) { setMsg({ t: t, err: !!err }); announce(t, err ? "error" : undefined); };
  const passOk = function () {
    if (pass !== pass2) { say("The two passcodes don't match. Type them again.", true); lcFocusId("nostr-pass"); return false; }
    return true;
  };
  const saveKey = async function () {
    if (busy) return;
    if (!nsec.trim()) { say("Type or paste your nsec key first.", true); lcFocusId("nostr-nsec"); return; }
    if (!passOk()) return;
    setBusy(true); const r = await N.importKey(nsec, pass); setBusy(false);
    if (r.err) { say(r.err, true); lcFocusId("nostr-nsec"); return; }
    setNsec(""); setPass(""); setPass2("");
    say(pass ? "Key saved on this device, locked with your passcode." : "Key saved on this device.");
    lcFocusId("nostr-key-h");
    // Read your Dreams back from Nostr now; say so only if some came back.
    N.fetchOwn().then(function (f) { if (f && f.added) setTimeout(function () { announce(f.added === 1 ? "Found 1 of your Dreams on Nostr." : "Found " + f.added + " of your Dreams on Nostr."); }, 1600); }, function () {});
  };
  const nsecRef = useEnterSubmit(saveKey);
  const create = async function () {
    if (busy || !passOk()) return;
    setBusy(true); const r = await N.createKey(pass); setBusy(false);
    if (r.err) { say(r.err, true); return; }
    setPass(""); setPass2(""); setMsg(null);
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
    setUnl(""); say(r.waiting ? "Unlocked. Sending " + r.waiting + (r.waiting === 1 ? " waiting Dream." : " waiting Dreams.") : "Unlocked until you close Looscid.");
    lcFocusId("nostr-key-h");
  };
  const unlockRef = useEnterSubmit(unlock);
  const lock = async function () {
    if (busy) return;
    if (!pass) { say("Type a passcode first.", true); lcFocusId("nostr-pass"); return; }
    if (!passOk()) return;
    setBusy(true); const r = await N.setPasscode(pass); setBusy(false);
    if (r.err) { say(r.err, true); return; }
    setPass(""); setPass2(""); say("Your key is now locked with your passcode."); lcFocusId("nostr-key-h");
  };
  const unlockPass = function () { const r = N.removePasscode(); if (r.err) { say(r.err, true); return; } say("Passcode removed. Your key is saved unlocked on this device."); lcFocusId("nostr-key-h"); };
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
    st.mode === "key" && !st.encrypted && lh('details', { className: "lid-details" },
      lh('summary', null, "Lock your key with a passcode"),
      lh(NostrPassFields, { pass: pass, setPass: setPass, pass2: pass2, setPass2: setPass2 }),
      lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bp", disabled: busy, onClick: lock }, "Lock with passcode"))),
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
      lh(NostrPassFields, { pass: pass, setPass: setPass, pass2: pass2, setPass2: setPass2 }),
      lh('div', { className: "lid-actions" }, lh('button', { type: "button", className: "btn bp", disabled: busy, onClick: saveKey }, "Save key"))),
    how === "create" && lh(React.Fragment, null,
      lh('p', { className: "lid-help" }, "Looscid makes a new key on this device. Nothing is sent anywhere until you Dream."),
      lh(NostrPassFields, { pass: pass, setPass: setPass, pass2: pass2, setPass2: setPass2 }),
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
   Modelled on the Google Account page (Hasan, Oct 8 2026: "Make it like How Google
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
    { k: "Settings", v: "Theme, accessibility and app preferences" },
    { k: "Security activity", v: getActivity().length + " recent events" },
  ];
}
function exportLocalData() {
  // Secret keys and login tokens are left out on purpose.
  let drafts = []; try { drafts = getDrafts() || []; } catch (e) {}
  const data = { app: "Looscid", exportedAt: new Date().toISOString(), note: "Secret keys and login tokens are not included.",
    profile: getLocalProfile(), loginMethods: getMethods().map(function (m) { return { provider: m.provider, publicId: m.publicId, linkedAt: m.at }; }),
    topics: getTopics(), drafts: drafts, securityActivity: getActivity() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "looscid-my-data.json"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  logActivity("Data exported");
}
function deleteLocalData() {
  try { Object.keys(localStorage).forEach(function (k) { if (/^(looscid_|dbm_)/.test(k)) localStorage.removeItem(k); }); } catch (e) {}
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
    lh('dl', { className: "lid-dl" }, summary.map(function (r) { return lh(React.Fragment, { key: r.k }, lh('dt', null, r.k), lh('dd', null, r.v)); })),
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
const LOOSCID_FEATURE_BUILDS = 113; // builds without the fix updates
Looscid.LOOSCID_FEATURE_BUILDS = LOOSCID_FEATURE_BUILDS;
const LOOSCID_FIXES = 31;
Looscid.LOOSCID_FIXES = LOOSCID_FIXES;
const LC_VERSION_HISTORY = [
  { version: "2026.113.31", build: 144, released: LOOSCID_RELEASED, title: "Round 6.5.3", notes: [
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
    "Verbosity is a tab on Screen reader and braille.",
    "Apps are Looscid's own: Settings, Apps, and the Looscid App Store.",
    "Commandbar: the bar and full screen share one history.",
    "Alerts only for things that really happen, with settings for each.",
    "Louder sounds with a limiter, plus the Insomnia, NexOS and Hyper Synth packs.",
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
    lh('p', { className: "lc-intro" }, "The beats made for NexOS. Nothing loads until you press Play. Try music hyperpop in Commandbar."),
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
          lh('span', { className: "lc-vol-n", "aria-hidden": "true" }, vol + "%")))));
}
/* --- Round 6: audiences (who can do something), shared by Alerts and Privacy ----------------
   Everyone / Dreamors I follow / My followers / Followers I follow back / My circles / Only me / Custom.
   Custom is a list of handles saved under dbm_aud_custom_<key>. */
const LC_AUD = [["everyone", "Everyone"], ["following", "Dreamors I follow"], ["followers", "My followers"], ["mutuals", "Followers I follow back (mutuals)"], ["circles", "My circles"], ["nobody", "Only me / Nobody"], ["custom", "Custom"]];
Looscid.LC_AUD = LC_AUD;
function lcAudCustomSet(key, list) { try { localStorage.setItem("dbm_aud_custom_" + key, JSON.stringify(list.slice(0, 200))); } catch (e) {} window.dispatchEvent(new CustomEvent("looscid:aud")); }
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
/* --- Commandbar, full screen (ported from the NexOS Terminal) --------------- */
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
      "Music: the NexOS beats (Morning to Night, Hyperpop, Lo-fi chill, Drum and bass, Chiptune) in the More tab, or type music hyperpop.",
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
      ["Stored on this device", lcStorageKB() + " KB in all, " + lcStorageKB("dbm_") + " KB of it in Looscid settings and lists"],
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
      "Commandbar's full-screen view is ported from the Terminal in NexOS Web, by the NexOS project.",
      "The composer's layout is inspired by Feditext's composer (GPL-3.0); no code was used.",
      "Every sound is synthesized live with Web Audio. There are no recorded samples.",
      "Source code: github.com/Looscid/Looscid",
    ],
  };
}
/* Round 6.5 (Alhasan): Credits and open source. Every outside or open-source project Looscid uses or
   learned from, with its link, license and what Looscid took from it. Plain headings, lists and links. */
const LC_CREDITS = {
  uses: [
    { n: "React and React DOM 18.2.0", u: "https://github.com/facebook/react", l: "MIT", w: "Draws every screen of Looscid. Loaded from jsDelivr." },
    { n: "nostr-tools 2.25.2", u: "https://github.com/nbd-wtf/nostr-tools", l: "Unlicense", w: "Nostr keys, signing and checking notes, npub and nsec, and passcode-locked keys. Kept in js/vendor with its license." },
    { n: "noble curves, hashes and ciphers, and scure base, by Paul Miller", u: "https://github.com/paulmillr/noble-curves", l: "MIT", w: "The audited cryptography inside nostr-tools." },
    { n: "NexOS, by Alhasan (2three1y)", u: "https://github.com/2three1y/nexos", l: "MIT", w: "Commandbar's full-screen view, the Apps, the Desktop and the NexOS sound pack." },
    { n: "Insomnia OS, by Alhasan (2three1y)", u: "https://github.com/2three1y/insomnia-os", l: "MIT", w: "The Insomnia app in Apps, and the Insomnia sound pack." },
    { n: "Meme Projects, by Alhasan (2three1y)", u: "https://github.com/2three1y/memeprojects", l: "MIT", w: "The Meme Projects app in Apps." },
    { n: "Easyconvert, by Alhasan (2three1y)", u: "https://github.com/2three1y/Easyconvert", l: "MIT", w: "The Easyconvert app in Apps." },
    { n: "v86", u: "https://github.com/copy/v86", l: "BSD 2-Clause", w: "Runs the real NexOS kernel in Apps, right in the browser." },
    { n: "SeaBIOS and SeaVGABIOS", u: "https://www.seabios.org", l: "LGPL-3.0", w: "The start-up firmware v86 uses, unchanged." },
    { n: "DM Sans and DM Serif Display", u: "https://fonts.google.com/specimen/DM+Sans", l: "SIL Open Font License 1.1", w: "Looscid's fonts, from Google Fonts." },
  ],
  ideas: [
    { n: "Feditext", u: "https://github.com/feditext/feditext", l: "GPL-3.0", w: "Composer design inspiration (GPL-3.0); no code used. The Round 6.5 composer follows its layout: the Dream you answer above your text, the toolbar order and writing a thread in one go." },
  ],
  planned: [
    { n: "MyWEB", u: "https://github.com/Looscid/MyWEB", w: "Feedback sent to Alhasan as an encrypted Nostr message." },
    { n: "AgentSync", u: "https://github.com/Looscid/Agentsync", w: "Slash commands for Cherry, handled on your device, and its step-by-step Allow dialog." },
    { n: "Soundvault", u: "https://github.com/2three1y/soundvault", w: "A sound pack browser in Settings, Sounds, and new earcons where the license allows." },
    { n: "Lyricfinder", u: "https://github.com/2three1y/lyricfinder", w: "A small app next to Insomnia." },
    { n: "Vibework", u: "https://github.com/2three1y/vibework", w: "Other places to hang out, in Discover." },
    { n: "Codetranslator", u: "https://github.com/2three1y/codetranslator", w: "A Commandbar tool." },
  ],
};
Looscid.LC_CREDITS = LC_CREDITS;
function CreditsPage({ navigate }) {
  const item = function (c) { return lh('li', { key: c.n, style: { marginBottom: 10 } },
    lh('a', { href: c.u, target: "_blank", rel: "noopener noreferrer", className: "lc-link" }, c.n),
    lh('p', { className: "lid-help", style: { margin: "2px 0 0" } }, (c.l ? "License: " + c.l + ". " : "") + c.w)); };
  const sec = function (id, title, intro, list) { return lh('section', { "aria-labelledby": id, style: { padding: "0 16px 12px" } },
    lh('h2', { id: id, className: "lid-sub" }, title), intro && lh('p', { className: "lid-help" }, intro),
    lh('ul', { className: "lid-help", style: { paddingLeft: 22, margin: "6px 0" } }, list.map(item))); };
  return lh('div', { className: "pg lc-credits" },
    lh(BackHeader, { title: "Credits and open source", onBack: function () { navigate("settings"); } }),
    lh('p', { className: "lid-help", style: { padding: "8px 16px 0" } }, "Looscid is open source under the Looscid Public License. These are the projects it uses and the ones it learned from. Each keeps its own license. Every sound is made live with Web Audio, with no recorded samples."),
    sec("credits-uses", "Code Looscid uses", null, LC_CREDITS.uses),
    sec("credits-ideas", "Design ideas", null, LC_CREDITS.ideas),
    sec("credits-planned", "Coming from Alhasan's repos", "Planned, not in Looscid yet. They'll move up to Code Looscid uses when they arrive.", LC_CREDITS.planned),
    lh('section', { "aria-labelledby": "credits-src", style: { padding: "0 16px 24px" } },
      lh('h2', { id: "credits-src", className: "lid-sub" }, "Looscid's own source code"),
      lh('p', { className: "lid-help" }, lh('a', { href: "https://github.com/Looscid/Looscid", target: "_blank", rel: "noopener noreferrer", className: "lc-link" }, "Looscid on GitHub"), ". The full license is in the LICENSE file there.")));
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
  { name: "Cherry algorithm controls", where: "Intelligence", desc: "Tune what Cherry puts in your For You feed." },
  { name: "Spelling, grammar and inline math", where: "Intelligence", desc: "Cherry fixes typos and solves sums as you write, on this device." },
  { name: "AI image descriptions", where: "Accessibility, Vision", desc: "Cherry describes images in Dreams, on this device." },
  { name: "RTT and TTY", where: "Accessibility, Hearing", desc: "Real-time text for calls." },
  { name: "Native braille drivers", where: "Screen reader and braille", desc: "Direct USB and Bluetooth braille display support, without a screen reader." },
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
   volume still apply on top inside Looscid. Meme Projects and Easyconvert have no settings of their own. */
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
    sec("memes", "Meme Projects", [
      lh('p', { key: "n", className: "lc-desc" }, "Meme Projects has no settings of its own yet."),
      lh('div', { key: "o", className: "lc-row" }, openBtn("memes", "Meme Projects"))]),
    sec("easyconvert", "Easyconvert", [
      lh('p', { key: "n", className: "lc-desc" }, "Easyconvert has no settings of its own yet."),
      lh('div', { key: "o", className: "lc-row" }, openBtn("easyconvert", "Easyconvert"))]),
    lh(LcResetLast, { scope: "apps" }));
}
function NexosAppsPage({ navigate }) {
  // Round 6: Looscid's Apps page (page id kept as nexos_apps so old links still land here).
  return lh('div', { className: "pg" },
    lh(BackHeader, { title: "Apps", onBack: function () { navigate("feed"); } }),
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
  // The real kernel's own Back button (and Escape in the apps) post to Looscid: back to NexOS apps.
  // Leaving this page unmounts the frame, which stops the emulator and its sound.
  useEffect(function () {
    function onMsg(e) {
      if (e.origin !== location.origin || !e.data || !frameRef.current || e.source !== frameRef.current.contentWindow) return;
      if (e.data.nexos === "back" || e.data.nexos === "escape") navigate("nexos_apps");
    }
    window.addEventListener("message", onMsg);
    return function () { window.removeEventListener("message", onMsg); };
  }, []);
  return lh('div', { className: "pg lc-nx-frame" },
    lh(BackHeader, { title: a.name, onBack: function () { navigate("nexos_apps"); } }),
    lh('p', { className: "lc-desc", style: { padding: "0 16px" } }, a.sub + "."),
    lh('iframe', { ref: frameRef, id: "lc-nx-iframe", className: "lc-apps-frame" + (a.id === "real" ? " lc-apps-frame-real" : ""), src: a.url, title: a.name + ", part of Looscid", allow: "autoplay; clipboard-write",
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
          lh('input', { type: "radio", name: "lcs-" + def.k, value: o[0], checked: on, onChange: function () { put(o[0]); } }), lh('span', null, o[1]));
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
  const style = a.brailleStyle || "iphone";
  const selCustom = list.find(function (x) { return "c:" + x.id === style; });
  const [isNew, setIsNew] = useState(false);
  const [txt, setTxt] = useState(selCustom ? selCustom.name : "");
  const [err, setErr] = useState("");
  const [past, setPast] = useState(function () { try { const p = sessionStorage.getItem("dbm_br_past"); sessionStorage.removeItem("dbm_br_past"); return p; } catch (e) { return null; } });
  const fieldRef = useRef(null);
  const editing = isNew || !!selCustom;
  // the field always shows the selected custom entry's text
  const lastSel = useRef(style);
  useEffect(function () { if (lastSel.current !== style) { lastSel.current = style; setTxt(selCustom ? selCustom.name : ""); setErr(""); if (selCustom) setIsNew(false); } });
  useEffect(function () { let f = null; try { f = sessionStorage.getItem("dbm_br_focus"); sessionStorage.removeItem("dbm_br_focus"); } catch (e) {} if (f === "field") setTimeout(function () { if (fieldRef.current) fieldRef.current.focus(); }, 120); }, []);
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
    const now = Looscid.A11Y_NOW.brailleStyle || "iphone";
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
      desc: "Buttons show a short role on your braille display, like btn, while speech still says button." }),
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
    // The notice stays until Dismiss or until you leave this page (Hasan, 5:55 PM).
    n ? lh('div', { className: "lc-bs-notice", id: "lc-bs-notice" },
      lh('p', { className: "lc-bs-nt" }, n.text + "."),
      n.undo ? lh('button', { type: "button", className: "btn bp lc-btn", id: "lc-bs-undo", onClick: function () { const r = lcBrUndo(); announce(r.err || r.ok); if (!r.err) focusRadio("c:" + r.entry.id); } }, "Undo") : null,
      lh('button', { type: "button", className: "btn bgb lc-btn", id: "lc-bs-dismiss", "aria-label": "Dismiss notice", "aria-braillelabel": "Dismiss", onClick: function () { lcBrNotice(null); focusRadio(Looscid.A11Y_NOW.brailleStyle || "iphone"); } }, "Dismiss")) : null);
}
// Settings > Accessibility > Screen reader and braille: General | Speech | Braille as real tabs.
const LC_SR_TABS = [["general", "sr_general"], ["speech", "sr_speech"], ["verbosity", "verbosity"], ["braille", "sr_braille"]];
Looscid.LC_SR_TABS = LC_SR_TABS;
// Round 6: the Verbosity tab panel (was its own page). Same settings and storage keys.
function LcVerbosityPanel() {
  return lh('section', { className: "lc-grp", "aria-labelledby": "lcs-h-verbosity", id: "lcs-verbosity" },
    lh('h2', { id: "lcs-h-verbosity", className: "lc-grp-h", tabIndex: -1 }, lcSrName("verbosity")),
    lh('p', { className: "lc-desc" }, "What Looscid itself says and plays. Your screen reader's own verbosity is set in VoiceOver, TalkBack or NVDA."),
    lh(LcSetRow, { def: LC_SET_BY.verbosity }),
    lh('section', { className: "lc-grp", "aria-labelledby": "lc-pc-h" },
      lh('h3', { id: "lc-pc-h", className: "lc-grp-h" }, "Pitch cues"),
      lh(LcSetRow, { def: LC_SET_BY.pitchCues }),
      lh('p', { className: "lc-desc", id: "lc-pc-what" }, "Each kind of thing gets its own short tone: links, buttons, headings, text fields, open and close, switches, list position, success and error. Never on feed switching, never while you type."),
      lh('fieldset', { className: "lc-fs", id: "lc-pc-types" },
        lh('legend', { className: "lc-fs-l" }, "Pitch cue for"),
        lh('div', { className: "lc-radios lc-radios-col" }, LC_SET.filter(function (d) { return d.pc; }).map(function (d) { return lh(LcSetRow, { key: d.k, def: d }); }))),
      lh('button', { type: "button", className: "btn bgb lc-btn", id: "lc-pc-preview", onClick: function () { lcPitchPreview(); } }, "Preview every pitch cue")),
    lh(LcResetBtn, { sec: "verbosity", label: "Verbosity" }));
}
function SrTabs() {
  useA11yNow();
  const [cur, setCur] = useState(function () { let t = "general"; try { t = sessionStorage.getItem("dbm_sr_tab") || "general"; } catch (e) {} return LC_SR_TABS.some(function (x) { return x[0] === t; }) ? t : "general"; });
  const pick = function (id, focus) { setCur(id); try { sessionStorage.setItem("dbm_sr_tab", id); } catch (e) {} if (focus) setTimeout(function () { const b = document.getElementById("srtab-" + id); if (b) b.focus(); }, 0); };
  const idx = LC_SR_TABS.findIndex(function (t) { return t[0] === cur; });
  const onKey = function (e) {
    const n = LC_SR_TABS.length; let i = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") i = (idx + 1) % n; else if (e.key === "ArrowLeft" || e.key === "ArrowUp") i = (idx - 1 + n) % n; else if (e.key === "Home") i = 0; else if (e.key === "End") i = n - 1;
    if (i !== null) { e.preventDefault(); pick(LC_SR_TABS[i][0], true); }
  };
  return lh('div', { className: "lc-srtabs" },
    lh('div', { role: "tablist", "aria-label": "Screen reader and braille sections", className: "lc-stabs", onKeyDown: onKey },
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
  if (!cat) return lh(LcCatMenu, { id: "lc-audio-cats", title: "Sounds", navigate: navigate, cats: LC_AUDIO_CATS,
    intro: "Looscid's sounds live here. Pitch cues are in Accessibility, Screen reader and braille, Verbosity. Sounds are short and battery-friendly: the audio engine sleeps between sounds.",
    after: lh('div', { className: "lc-grp" },
      lh('button', { type: "button", className: "btn bgb lc-big", onClick: function () { Earcon.play("run", { test: true }); } }, "Play a test sound"),
      lh(LcResetBtn, { sec: "audio" }),
      lh('p', { className: "lc-desc" }, "Quiet hours are in Settings, Alerts. Captions and the visual cue for sounds are in Accessibility, Hearing.")) });
  const evDefs = LC_SET.filter(function (d) { return d.s === "audio" && d.ev; });
  let body;
  if (cat.id === "volume") body = lh(LcSection, { sec: "audio", title: "Earcons", only: cat.keys, noReset: true,
      after: lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { Earcon.key({ test: true }); } }, "Preview a keyboard click") });
  else if (cat.id === "pack") body = lh(LcSection, { sec: "audio", title: "Sound pack", only: cat.keys, noReset: true,
      intro: "Looscid has its own loud, classic beeps and boops. NexOS classic is the NexOS sound set, with the Good Morning chime when something opens and Good Night on Back. Insomnia is Insomnia's own clicks, chimes and dings. Hyper Synth is bright synth arps and stabs.",
      after: lh(React.Fragment, null,
        lh('div', { className: "lc-packprev" }, ["looscid", "nexos", "insomnia", "synth"].map(function (p) {
          const lab = { looscid: "Looscid", nexos: "NexOS classic", insomnia: "Insomnia", synth: "Hyper Synth" }[p];
          return lh('button', { key: p, type: "button", className: "btn bgb lc-btn", onClick: function () { Earcon.play("send", { test: true, pack: p }); }, "aria-label": "Preview the " + lab + " pack" }, "Preview " + lab);
        })),
        lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { Earcon.play("boot", { test: true }); } }, "Preview boot chime"),
        lh(LcPackImport, null)) });
  else if (cat.id === "events") body = lh('section', { className: "lc-grp", "aria-labelledby": "lca-ev-h" },
      lh('h2', { id: "lca-ev-h", className: "lc-grp-h" }, "Sounds for each event"),
      lh('p', { className: "lc-desc" }, "Turn each sound on or off, and preview it in the sound pack you're using."),
      evDefs.map(function (d) {
        return lh('div', { key: d.k, className: "lc-evrow" }, lh(LcSetRow, { def: d }),
          lh('button', { type: "button", className: "btn bgb lc-btn lc-prev", onClick: function () { Earcon.play(d.ev, { test: true }); }, "aria-label": "Preview " + d.l.toLowerCase() }, "Preview"));
      }),
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
  const remove = async function () { try { await lcPackDel(); } catch (e) {} Looscid.LC_CUSTOM_PACK = null; setPack(null); if (Looscid.A11Y_NOW.soundPack === "custom") lcSet({ soundPack: "looscid" }); say("Your imported sound pack was removed." + (Looscid.A11Y_NOW.soundPack === "looscid" ? " The Looscid pack is back on." : "")); };
  const n = pack && pack.files ? pack.files.length : 0;
  return lh('section', { className: "lc-import", "aria-labelledby": "lc-imp-h" },
    lh('h3', { id: "lc-imp-h", className: "lc-sub-h" }, "Import a sound pack"),
    lh('p', { id: "lc-imp-d", className: "lc-desc" }, "Choose a .zip of sounds, or audio files. WAV, MP3, OGG, M4A, AAC, WebM or FLAC, up to 1 MB and 3 seconds each, 24 files and 8 MB in all. Files named like send, like, error or alert are matched to events for you. Saved only on this device."),
    lh('label', { htmlFor: "lc-imp-file", className: "btn bgb lc-big lc-filebtn" }, busy ? "Checking sounds\u2026" : "Choose a .zip or audio files"),
    lh('input', { id: "lc-imp-file", type: "file", className: "lc-file", multiple: true, accept: ".zip,application/zip,audio/*,.wav,.mp3,.ogg,.oga,.opus,.m4a,.aac,.webm,.flac", onChange: onFiles }),
    msg ? lh('p', { className: "lc-desc", role: "status" }, msg) : null,
    bad.length ? lh('ul', { className: "lc-badlist", "aria-label": "Files left out" }, bad.map(function (b, i) { return lh('li', { key: i }, b); })) : null,
    n ? lh('div', { className: "lc-pack" },
      lh('h4', { className: "lc-sub-h" }, "Your pack: " + n + " sound" + (n === 1 ? "" : "s")),
      lh('ul', { className: "lc-maplist", "aria-label": "Sounds for each event" }, LC_EVENTS.map(function (ev) {
        const sid = "lc-map-" + ev[0], cur = (pack.map || {})[ev[0]] || "";
        return lh('li', { key: ev[0], className: "lc-maprow" },
          lh(LcMenu, { id: sid, label: ev[1], value: cur, items: [{ id: "", name: "Looscid's sound" }].concat(pack.files.map(function (f) { return { id: f.name, name: f.name }; })), onSelect: function (val) { setMap(ev[0], val); } }),
          lh('button', { type: "button", className: "btn bgb lc-btn", "aria-label": "Preview " + ev[1].toLowerCase() + " from your pack", onClick: function () { Earcon.play(ev[0], { test: true, pack: "custom" }); } }, "Preview"));
      })),
      lh('button', { type: "button", className: "btn bp lc-big", disabled: Looscid.A11Y_NOW.soundPack === "custom", onClick: function () { lcSet({ soundPack: "custom" }); announce("Sound pack: your imported pack."); } }, Looscid.A11Y_NOW.soundPack === "custom" ? "Using your pack" : "Use this pack"),
      lh('button', { type: "button", className: "btn bgb lc-big", onClick: remove }, "Remove your sound pack")) : null);
}
function lcShortcutOk(keys) { const p = keys.split("+"); return p.length > 1 && /Control|Alt|Command/.test(keys) && !/^(Control|Command)\+K$/.test(keys) || /^F\d{1,2}$/.test(keys); }
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
      lh('dl', { className: "lc-keys" }, LC_BUILTIN_KEYS.map(function (k) { return lh(React.Fragment, { key: k[0] }, lh('dt', null, k[0]), lh('dd', null, k[1])); }))),
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
  let n = 0; LC_EXPORT_KEYS.forEach(function (k) { if (typeof o.settings[k] === "string") { try { if (k === A11Y_KEY || k === LC_SETTINGS_KEY) JSON.parse(o.settings[k]); localStorage.setItem(k, o.settings[k]); n++; } catch (e) {} } });
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
      lh('p', { className: "lc-desc" }, "One JSON file with all your settings: accessibility, audio, screen reader and braille, permissions, muted words, shortcuts, theme, music and Cherry. Your Cherry chats are in it too. No keys, passwords or Dreams are in it. Imported sound packs stay on this device."),
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
