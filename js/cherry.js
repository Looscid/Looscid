/* Looscid cherry.js: Cherry, the assistant, on its own page (Round 6.5.2).
   Plain script (not a module). Everything it shares goes on window.Looscid; see FILES.md for the load order.
   The Cherry page is plain JavaScript: it is built with Looscid.lcEl and redrawn in place with Looscid.lcPatch,
   so the message box keeps focus and its text while Cherry answers. The model picker below is still React. */
(function (Looscid) {
const { AlertDialog, Ic, LC_PLACES, LcMenu, LcSpeech, USERS, a11yEnterSends, announce, getAIPrefs, lcA11yIntent, lcApplyFeedIntent, lcCloseProps, lcExtraIntent, lcFeedIntent, lcFeedLabel, lh, setAIPrefs, useEffect, useRef, useState } = Looscid;
const { lcEl: h, lcPatch, lcPlainScreen, lcIconEl } = Looscid;

/* --- Your History: Cherry chats saved on this device --------------------------------------------
   localStorage dbm_cherry_chats holds a list of chats, newest first:
   { id, title, created, updated, pinned, msgs: [{ me, text, t }] }
   Nothing leaves the device. The key is in Settings backup (added to the list, so older backups still import).
   Pinned chats are never dropped; at most 50 unpinned chats and 200 messages per chat are kept. */
const LC_CHERRY_CHATS_KEY = "dbm_cherry_chats";
const LC_CHERRY_MAX_CHATS = 50, LC_CHERRY_MAX_MSGS = 200;
function lcCherryChats() {
  try {
    const a = JSON.parse(localStorage.getItem(LC_CHERRY_CHATS_KEY) || "[]");
    if (!Array.isArray(a)) return [];
    return a.filter(function (c) { return c && typeof c.id === "string" && Array.isArray(c.msgs); })
      .map(function (c) { return { id: c.id, title: String(c.title || "Chat"), created: +c.created || 0, updated: +c.updated || +c.created || 0, pinned: c.pinned === true,
        msgs: c.msgs.filter(function (m) { return m && typeof m.text === "string"; }).map(function (m) { return { me: m.me === true, text: m.text, t: +m.t || 0 }; }) }; });
  } catch (e) { return []; }
}
function lcCherrySaveChats(list) {
  let unpinned = 0;
  const keep = list.slice().sort(function (a, b) { return b.updated - a.updated; }).filter(function (c) {
    if (!c.msgs.length) return false;
    if (c.pinned) return true;
    unpinned++; return unpinned <= LC_CHERRY_MAX_CHATS;
  }).map(function (c) { return Object.assign({}, c, { msgs: c.msgs.slice(-LC_CHERRY_MAX_MSGS) }); });
  try { localStorage.setItem(LC_CHERRY_CHATS_KEY, JSON.stringify(keep)); } catch (e) {}
  return keep;
}
function lcCherryTitle(text) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  return t.length > 40 ? t.slice(0, 39).replace(/\s+\S*$/, "") + "\u2026" : (t || "Chat");
}
function lcCherryWhen(ms) {
  if (!ms) return "";
  const d = new Date(ms), now = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return "Today, " + time;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday, " + time;
  return d.toLocaleDateString([], { month: "long", day: "numeric", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}
const LC_CHERRY_CHIPS = ["Summarise my feed", "What's trending?", "Draft a Dream", "Who should I follow?", "Find Circles", "My notifications"];

/* The page's state lives here while the app runs, so leaving Cherry (to Settings, say) and coming back
   keeps the chat you were in. A reload starts a new chat; your earlier chats are in Your History. */
const LC_CHERRY = { cur: null, tab: "all", busy: false, undone: {}, askN: null };
function lcCherryNewChat() { return { id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title: "New chat", created: Date.now(), updated: Date.now(), pinned: false, msgs: [] }; }

function cherryView(st, p, act) {
  const chats = lcCherryChats();
  const cur = LC_CHERRY.cur;
  const pinned = chats.filter(function (c) { return c.pinned; });
  const tab = LC_CHERRY.tab === "pinned" ? "pinned" : "all";
  const shown = tab === "pinned" ? pinned : chats;
  const log = (p.cherryCtx && p.cherryCtx.cherryLog) || [];
  const TABS = [["all", "All", chats.length], ["pinned", "Pinned", pinned.length]];
  const onTabKey = function (e) {
    const i = TABS.findIndex(function (t) { return t[0] === tab; }); let n = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % TABS.length; else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") n = 0; else if (e.key === "End") n = TABS.length - 1;
    if (n < 0) return; e.preventDefault(); act.setTab(TABS[n][0]);
    setTimeout(function () { const b = document.getElementById("cherry-tab-" + TABS[n][0]); if (b) b.focus(); }, 0);
  };
  const curTitle = cur && cur.msgs.length ? cur.title : "New chat";

  return h('div', { className: "pg lc-cherry" },
    h('div', { className: "hdr" },
      h('div', { className: "hdr-row" },
        h('button', { type: "button", className: "bi", onClick: act.back, "aria-label": "Back" }, lcIconEl("Bck", { style: { width: 21, height: 21 } })),
        h('h1', { className: "hdr-title", tabIndex: -1 }, "Cherry"),
        h('button', Object.assign({ type: "button", className: "lc-close", onClick: act.back }, lcCloseProps("Cherry")), "Close")),
      h('div', { className: "lc-cherry-top" },
        h('button', { type: "button", id: "cherry-new", className: "btn bp lc-btn", onClick: act.newChat }, "New Chat"))),

    h('p', { className: "lc-desc lc-cherry-intro" }, "Cherry is your on-device assistant. Ask a question or give a command, like \u201cturn on high contrast\u201d. Cherry's answers are read out as they arrive. Your chats are saved on this device only."),

    /* The chat you're in */
    h('section', { className: "lc-cherry-chat", "aria-labelledby": "cherry-chat-h" },
      h('h2', { id: "cherry-chat-h", className: "lc-sub-h", tabIndex: -1 }, curTitle),
      // One wrapper that is always there, so the message box after it never moves (moving it would drop focus).
      h('div', { key: "log", className: "lc-cherry-log" },
      cur && cur.msgs.length
        ? h('ul', { key: "msgs", className: "lc-cherry-msgs", "aria-label": "Messages" },
            cur.msgs.map(function (m, i) {
              return h('li', { key: "m" + i, className: "lc-cherry-msg" + (m.me ? " me" : "") },
                h('p', { className: "lc-cherry-msg-t" }, h('strong', null, m.me ? "You: " : "Cherry: "), m.text),
                m.confirm && !m.done ? h('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { act.confirm(i); } }, m.confirm) : null);
            }))
        : h('p', { key: "empty", className: "lc-muted lc-cherry-empty" }, "No messages yet. Ask Cherry anything."),
      LC_CHERRY.busy ? h('p', { key: "busy", className: "lc-muted" }, "Cherry is thinking\u2026") : null),
      h('div', { key: "in", className: "lc-cherry-input" },
        h('input', { id: "cherry-input", className: "inp", type: "text", autoComplete: "off", placeholder: "Ask Cherry or give a command",
          value: st.inp, "aria-label": "Message Cherry",
          onChange: function (e) { st.inp = e.target.value; act.draw(); },
          onKeyDown: function (e) { if (e.key === "Enter" && !e.isComposing && a11yEnterSends()) { e.preventDefault(); act.send(); } },
          onBeforeinput: function (e) { if ((e.inputType === "insertParagraph" || e.inputType === "insertLineBreak") && a11yEnterSends()) { e.preventDefault(); act.send(); } } }),
        h('button', { type: "button", id: "cherry-send", className: "btn bp lc-btn", onClick: function () { act.send(); }, disabled: !String(st.inp || "").trim() }, "Send")),
      h('h3', { key: "h3", className: "lc-cherry-h3" }, "Try asking"),
      h('ul', { key: "chips", className: "lc-cherry-chips" },
        LC_CHERRY_CHIPS.map(function (s) {
          return h('li', { key: s }, h('button', { type: "button", className: "aisc", onClick: function () { act.send(s); } }, s));
        }))),

    /* Your History: All and Pinned */
    h('section', { className: "lc-cherry-hist", "aria-labelledby": "cherry-hist-h" },
      h('h2', { id: "cherry-hist-h", className: "lc-sub-h" }, "Your History"),
      h('p', { className: "lc-desc" }, "Your chats with Cherry, newest first. Pin a chat to keep it in Pinned."),
      h('div', { className: "ftabs lc-cherry-tabs", role: "tablist", "aria-label": "Your History", onKeyDown: onTabKey },
        TABS.map(function (t) {
          const on = tab === t[0];
          return h('button', { key: t[0], id: "cherry-tab-" + t[0], type: "button", role: "tab", className: "ftab" + (on ? " on" : ""), "aria-selected": on ? "true" : "false",
              "aria-controls": "cherry-panel", tabIndex: on ? 0 : -1, onClick: function () { act.setTab(t[0]); } },
            t[1], h('span', { className: "sr-only" }, ", "), h('span', { className: "lc-cherry-count" }, String(t[2])));
        })),
      h('div', { id: "cherry-panel", role: "tabpanel", "aria-labelledby": "cherry-tab-" + tab },
        shown.length
          ? h('ul', { className: "lc-cherry-list", "aria-label": tab === "pinned" ? "Pinned chats" : "All chats" },
              shown.map(function (c) {
                const n = c.msgs.length, open = cur && cur.id === c.id;
                return h('li', { key: c.id, className: "lc-cherry-item" },
                  h('button', { type: "button", className: "lc-cherry-open", "data-chat": c.id, onClick: function () { act.open(c.id); } },
                    c.title, open ? h('span', { className: "lc-cherry-now" }, ", open now") : null),
                  h('p', { className: "lc-muted" }, lcCherryWhen(c.updated) + ", " + n + (n === 1 ? " message" : " messages") + (c.pinned ? ", pinned" : "")),
                  h('button', { type: "button", className: "btn bgb lc-btn lc-cherry-pin", "data-chat": c.id, onClick: function () { act.pin(c.id); } }, (c.pinned ? "Unpin " : "Pin ") + c.title));
              }))
          : h('p', { className: "lc-muted" }, tab === "pinned" ? "No pinned chats yet. Pin a chat in All to keep it here." : "No chats yet. Your chats with Cherry will be listed here."))),

    /* What Cherry did, with Undo */
    h('section', { className: "lc-cherry-acts", "aria-labelledby": "cherry-acts-h" },
      h('h2', { id: "cherry-acts-h", className: "lc-sub-h" }, "What Cherry did"),
      log.length
        ? h('ul', { className: "lc-cherry-list" },
            log.map(function (entry) {
              const undone = entry.undone || LC_CHERRY.undone[entry.id];
              return h('li', { key: "a" + entry.id, className: "lc-cherry-item" },
                h('p', { className: "lc-cherry-msg-t" }, entry.text, ", ", new Date(entry.id).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), undone ? ", undone" : ""),
                entry.undoFn && !undone ? h('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { act.undo(entry); } }, "Undo " + entry.text) : null);
            }))
        : h('p', { className: "lc-muted" }, "Nothing yet. Everything Cherry does for you is listed here, and most of it can be undone.")));
}

/* The Cherry page. props: navigate, cherryCtx, data ({ ask, n } from "Ask Cherry about this"), onBack. */
const CherryPage = lcPlainScreen("CherryPage", function (host, props) {
  let p = props, alive = true;
  const st = { inp: "" };
  if (!LC_CHERRY.cur) LC_CHERRY.cur = lcCherryNewChat();
  const draw = function () { if (alive) lcPatch(host, cherryView(st, p, act)); };
  const saveCur = function () {
    const c = LC_CHERRY.cur; if (!c || !c.msgs.length) return;
    const list = lcCherryChats().filter(function (x) { return x.id !== c.id; });
    list.unshift({ id: c.id, title: c.title, created: c.created, updated: c.updated, pinned: c.pinned, msgs: c.msgs.map(function (m) { return { me: m.me, text: m.text, t: m.t }; }) });
    lcCherrySaveChats(list);
  };
  const addMsg = function (me, text, extra) {
    const c = LC_CHERRY.cur;
    if (me && !c.msgs.length) c.title = lcCherryTitle(text);
    c.msgs.push(Object.assign({ me: me, text: String(text), t: Date.now() }, extra || {})); c.updated = Date.now();
    saveCur();
  };
  // Cherry's answer: one announcement in the live region (and read aloud when that's on). Focus stays where it is.
  const reply = function (text, extra, said) {
    addMsg(false, text, extra); draw();
    if (!said) announce("Cherry: " + text);
    if (Looscid.A11Y_NOW && Looscid.A11Y_NOW.cherryAloud && LcSpeech && LcSpeech.speak) { try { LcSpeech.speak([{ text: text }]); } catch (e) {} }
  };
  const act = {
    draw: draw,
    back: function () { if (p.onBack) p.onBack(); else if (p.navigate) p.navigate("feed"); },
    send: function (t) {
      const msg = String(t != null ? t : st.inp);
      if (!msg.trim() || LC_CHERRY.busy) return;
      if (t == null) st.inp = "";
      addMsg(true, msg.trim());
      const ctx = p.cherryCtx;
      const resp = ctx ? cherryRespond(msg, ctx) : { result: "Cherry isn't ready yet. Try again in a moment." };
      // A chosen on-device model answers the open questions Cherry's own rules don't cover.
      const pm = lcLlmPrefs().model;
      if (resp.fallback && pm !== "builtin" && lcLlmGpu()) {
        LC_CHERRY.busy = true; draw();
        (LC_LLM.engine && LC_LLM.id === pm ? Promise.resolve() : lcLlmLoad(pm)).then(function () { return lcLlmAsk(msg); })
          .then(function (txt) { LC_CHERRY.busy = false; reply(txt); }, function () { LC_CHERRY.busy = false; reply(resp.result); });
        return;
      }
      if (resp.autoFn) {
        // Settings, feeds and other actions: the action itself says what changed, once.
        addMsg(false, resp.result); draw();
        resp.autoFn();
        if (Looscid.A11Y_NOW && Looscid.A11Y_NOW.cherryAloud && LcSpeech && LcSpeech.speak) { try { LcSpeech.speak([{ text: resp.result }]); } catch (e) {} }
        return;
      }
      draw();
      reply(resp.result, resp.confirm ? { confirm: resp.confirm.label, confirmFn: resp.confirm.fn } : null);
    },
    confirm: function (i) {
      const m = LC_CHERRY.cur.msgs[i]; if (!m || !m.confirmFn || m.done) return;
      m.done = true; try { m.confirmFn(); } catch (e) {}
      reply("Done: " + m.confirm + ".");
    },
    newChat: function () {
      saveCur();
      LC_CHERRY.cur = lcCherryNewChat(); st.inp = ""; draw();
      announce("New chat started.");
      setTimeout(function () { const i = document.getElementById("cherry-input"); if (i) i.focus(); }, 0);
    },
    open: function (id) {
      saveCur();
      const c = lcCherryChats().find(function (x) { return x.id === id; }); if (!c) return;
      LC_CHERRY.cur = c; draw();
      announce("Opened " + c.title + ", " + c.msgs.length + (c.msgs.length === 1 ? " message." : " messages."));
      setTimeout(function () { const hd = document.getElementById("cherry-chat-h"); if (hd) hd.focus(); }, 0);
    },
    pin: function (id) {
      const list = lcCherryChats(), c = list.find(function (x) { return x.id === id; }); if (!c) return;
      const wasTab = LC_CHERRY.tab, before = (wasTab === "pinned" ? list.filter(function (x) { return x.pinned; }) : list).map(function (x) { return x.id; });
      c.pinned = !c.pinned;
      lcCherrySaveChats(list);
      if (LC_CHERRY.cur && LC_CHERRY.cur.id === id) LC_CHERRY.cur.pinned = c.pinned;
      draw();
      announce((c.pinned ? "Pinned " : "Unpinned ") + c.title + ".");
      // In Pinned, an unpinned chat leaves the list: focus goes to the next chat's Pin button, or the Pinned tab.
      if (wasTab === "pinned" && !c.pinned) setTimeout(function () {
        const left = before.filter(function (x) { return x !== id; }), at = before.indexOf(id);
        const nextId = left[Math.min(at, left.length - 1)];
        const b = nextId ? host.querySelector('.lc-cherry-pin[data-chat="' + nextId + '"]') : null;
        (b || document.getElementById("cherry-tab-pinned") || host).focus();
      }, 0);
    },
    setTab: function (t) { LC_CHERRY.tab = t === "pinned" ? "pinned" : "all"; draw(); },
    undo: function (entry) {
      if (!entry.undoFn) return;
      try { entry.undoFn(); } catch (e) {}
      LC_CHERRY.undone[entry.id] = true; draw();
      announce("Undone: " + entry.text + ".");
    },
  };
  const takeAsk = function () {
    const d = p.data;
    if (d && d.ask && d.n !== LC_CHERRY.askN) {
      LC_CHERRY.askN = d.n;
      saveCur(); if (LC_CHERRY.cur.msgs.length) LC_CHERRY.cur = lcCherryNewChat();
      act.send(String(d.ask));
      return true;
    }
    return false;
  };
  draw();
  takeAsk();
  // You opened Cherry: focus goes to its heading, the same as every other page.
  setTimeout(function () { if (!alive) return; const hd = host.querySelector("h1"); if (hd && !host.contains(document.activeElement)) hd.focus(); }, 60);
  return { update: function (np) { p = np; if (!takeAsk()) draw(); }, stop: function () { alive = false; saveCur(); } };
});

Object.assign(Looscid, { CherryPage, LC_CHERRY, LC_CHERRY_CHATS_KEY, lcCherryChats, lcCherrySaveChats, lcLlmPrefs, lcLlmSetPrefs, lcLlmGpu, lcLlmLoad, lcLlmAsk, CherryModelPicker, SourcesPanel, cherryNorm, cherryRespond });

/* --- Cherry model picker (round-5 queue item 1) ----------------------------------
   One searchable, grouped pop-up menu (the shared mini pop-up). Cherry built-in needs
   nothing. On-device models run in this browser with WebLLM (WebGPU). A model is
   downloaded ONLY after you say yes in a dialog that shows its size; after that it is
   cached by the browser and Cherry works offline. Nothing you type leaves the device. */
const LC_LLM_MODELS = [
  { id: "builtin", name: "Cherry built-in", note: "instant, no download", group: "Built in", mb: 0 },
  { id: "Qwen3.5-0.8B-q4f16_1-MLC", name: "Qwen3.5 0.8B", note: "default for iPhone, about 1.6 GB", group: "Phones", mb: 1600, lic: "Apache-2.0", words: "qwen default" },
  { id: "gemma3-1b-it-q4f16_1-MLC", name: "Gemma 3 1B", note: "smallest, about 0.7 GB", group: "Phones", mb: 700, lic: "Gemma terms", words: "gemma google small" },
  { id: "Qwen3.5-2B-q4f16_1-MLC", name: "Qwen3.5 2B", note: "new iPhones and laptops, about 2.2 GB", group: "Laptops and new phones", mb: 2200, lic: "Apache-2.0", words: "qwen" },
  { id: "Phi-4-mini-instruct-q4f16_1-MLC", name: "Phi-4 mini", note: "laptops, about 3.4 GB", group: "Laptops and new phones", mb: 3400, lic: "MIT", words: "phi microsoft" },
];
Looscid.LC_LLM_MODELS = LC_LLM_MODELS;
const LC_LLM = { engine: null, id: null, loading: false, pct: 0 };
Looscid.LC_LLM = LC_LLM;
function lcLlmPrefs() { const p = getAIPrefs(); return { model: p.model || "builtin", downloaded: p.downloaded || {} }; }
function lcLlmSetPrefs(patch) { const p = getAIPrefs(); setAIPrefs(Object.assign({}, p, patch)); window.dispatchEvent(new CustomEvent("looscid:llm")); }
function lcLlmGpu() { try { return typeof navigator !== "undefined" && !!navigator.gpu; } catch (e) { return false; } }
async function lcLlmLoad(id, onPct) {
  if (!lcLlmGpu()) throw new Error("nogpu");
  LC_LLM.loading = true; LC_LLM.pct = 0; window.dispatchEvent(new CustomEvent("looscid:llm"));
  try {
    const mod = await import("https://esm.run/@mlc-ai/web-llm");
    const engine = await mod.CreateMLCEngine(id, { initProgressCallback: function (p) { const pct = Math.round((p.progress || 0) * 100); LC_LLM.pct = pct; if (onPct) onPct(pct, p.text || ""); window.dispatchEvent(new CustomEvent("looscid:llm")); } });
    LC_LLM.engine = engine; LC_LLM.id = id;
    const d = lcLlmPrefs().downloaded; d[id] = true; lcLlmSetPrefs({ model: id, downloaded: d });
    return engine;
  } finally { LC_LLM.loading = false; window.dispatchEvent(new CustomEvent("looscid:llm")); }
}
async function lcLlmAsk(text) {
  if (!LC_LLM.engine) throw new Error("noengine");
  const r = await LC_LLM.engine.chat.completions.create({ messages: [
    { role: "system", content: "You are Cherry, the assistant inside Looscid, an accessible social app. Answer briefly and kindly in plain text, no markdown." },
    { role: "user", content: String(text).slice(0, 2000) }], max_tokens: 300 });
  return (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content || "").trim() || "I don't have an answer for that.";
}
function CherryModelPicker() {
  const [, tick] = useState(0);
  useEffect(function () { const f = function () { tick(function (x) { return x + 1; }); }; window.addEventListener("looscid:llm", f); return function () { window.removeEventListener("looscid:llm", f); }; }, []);
  const pr = lcLlmPrefs();
  const [ask, setAsk] = useState(null);
  const [msg, setMsg] = useState("");
  const lastSaid = useRef(-10);
  const cur = LC_LLM_MODELS.find(function (m) { return m.id === pr.model; }) || LC_LLM_MODELS[0];
  const start = function (m) {
    setMsg("Getting " + m.name + " ready\u2026"); announce("Downloading " + m.name + ". This can take a while.");
    lcLlmLoad(m.id, function (pct) { if (pct - lastSaid.current >= 10) { lastSaid.current = pct; announce(m.name + ": " + pct + " percent."); } setMsg(m.name + ": " + pct + " percent."); })
      .then(function () { const t = m.name + " is ready. Cherry now runs on this device, offline."; setMsg(t); announce(t); },
        function (e) { const t = e && e.message === "nogpu" ? "This browser can't run on-device models: it has no WebGPU. Safari 26 or a recent Chrome can. Cherry built-in stays on." : "The download didn't finish, so Cherry built-in stays on. Try again on Wi-Fi."; setMsg(t); announce(t); lcLlmSetPrefs({ model: "builtin" }); });
  };
  return lh('div', { className: "lc-row", id: "cherry-model-row" },
    lh(LcMenu, { id: "cherry-model", label: "Cherry model", title: "Cherry models", value: cur.id, search: "Search models", items: LC_LLM_MODELS.map(function (m) { return Object.assign({}, m, { note: m.note + (pr.downloaded[m.id] ? ", downloaded" : "") }); }),
      onSelect: function (id) {
        const m = LC_LLM_MODELS.find(function (x) { return x.id === id; });
        if (id === "builtin") { lcLlmSetPrefs({ model: "builtin" }); LC_LLM.engine = null; LC_LLM.id = null; setMsg(""); announce("Cherry built-in selected."); return; }
        if (!lcLlmGpu()) { const t = "This browser can't run on-device models: it has no WebGPU. Safari 26 or a recent Chrome can."; setMsg(t); announce(t); return; }
        if (pr.downloaded[id]) { start(m); return; } // already in the browser's cache: loads offline, no new download
        setAsk(m);
      } }),
    lh('p', { className: "lc-desc" }, cur.id === "builtin" ? "Cherry built-in answers instantly with Looscid's own rules. On-device models give fuller answers, run in this browser and work offline after one download." : cur.name + (LC_LLM.engine && LC_LLM.id === cur.id ? " is running on this device." : " is downloaded. It loads from this device when Cherry needs it.")),
    msg ? lh('p', { className: "lc-desc", id: "cherry-model-msg" }, msg) : null,
    ask && lh(AlertDialog, { title: "Download " + ask.name + "?", message: "About " + (ask.mb >= 1000 ? (ask.mb / 1000).toFixed(1) + " GB" : ask.mb + " MB") + ", downloaded once from Hugging Face through WebLLM, then kept by your browser. After that Cherry runs on this device, offline. License: " + ask.lic + ". Wi-Fi is best.",
      confirmLabel: "Download", onCancel: function () { setAsk(null); announce("Not downloaded. Cherry built-in stays on."); setTimeout(function () { const b = document.getElementById("cherry-model"); if (b) b.focus(); }, 30); },
      onConfirm: function () { const m = ask; setAsk(null); start(m); setTimeout(function () { const b = document.getElementById("cherry-model"); if (b) b.focus(); }, 30); } }));
}
/* --- SOURCES PANEL ------------------------------------------------------- */
function SourcesPanel({ sources, onClose }) {
  if (!sources || !sources.length) return null;
  return React.createElement('div', {className:"sources-panel"},
    React.createElement('div', {style:{fontWeight:700,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}},
      "Sources",
      React.createElement('button', Object.assign({type:"button",className:"lc-close",onClick:onClose}, lcCloseProps("sources")), "Close")
    ),
    sources.map((s,i) => React.createElement('div', {key:i, style:{marginBottom:6,paddingBottom:6,borderBottom:i<sources.length-1?"1px solid var(--bd)":"none"}},
      React.createElement('div', {style:{fontWeight:600,fontSize:12}}, s.title),
      React.createElement('div', {style:{color:"var(--tx3)",fontSize:11}}, s.url)
    ))
  );
}
/* Cherry's answer engine, shared by the Cherry chat, Commandbar.
   Both sides are normalized: the input is lowercased and every phrase it is matched
   against is lowercase too ("what is Looscid" used to never match). */
function cherryNorm(s) { return String(s || "").toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, " ").trim(); }
function cherryRespond(text, cherryCtx) {
  const xi = lcExtraIntent(text);
  if (xi) return xi.err ? { action: null, result: xi.err } : { action: "Working on it\u2026", agentLabel: "Settings", result: xi.say, autoFn: function () { if (xi.fn) xi.fn(); if (xi.go && Looscid.LC_NAV) { const pl = LC_PLACES[xi.go]; if (pl.srTab) { try { sessionStorage.setItem("dbm_sr_tab", pl.srTab); } catch (e) {} } Looscid.LC_NAV(pl.page); } announce(xi.say); } };
  const fi = lcFeedIntent(text);
  if (fi && !fi.miss) { const say = fi.friends !== undefined ? (fi.friends ? "Showing friends only." : "Showing everyone you follow.") : fi.step ? "Switching feed." : "Feed: " + lcFeedLabel(fi.feed) + ".";
    return { action: "Switching your feed\u2026", agentLabel: "Feeds", result: say, autoFn: function () { const t = lcApplyFeedIntent(fi); announce(t); } }; }
  if (cherryCtx.setA11y) {
    const it = lcA11yIntent(text);
    if (it && it.patch) return { action: "Updating your accessibility settings\u2026", agentLabel: "Accessibility settings", result: it.say, autoFn: function () { cherryCtx.setA11y(it.patch); announce(it.say); } };
    if (it) return { action: null, result: it.report ? "Your accessibility settings: " + it.report.join(" ") : it.say };
  }
  const {dreams, following, groups, notifs, likeDream, saveDream, postDream, followUser, joinGroup, markNotifsRead} = cherryCtx;
  const appContext = () => {
    const likedDreams = dreams.filter(d=>d.liked).map(d=>d.user.name+"'s dream").join(", ") || "none yet";
    const savedDreams = dreams.filter(d=>d.bookmarked).map(d=>d.user.name+"'s dream").join(", ") || "none yet";
    const followingNames = USERS.filter(u=>following.has(u.id)).map(u=>u.name).join(", ") || "no one yet";
    const joinedGroups = groups.filter(g=>g.joined).map(g=>g.name).join(", ") || "none yet";
    const unread = notifs.filter(n=>n.unread).length;
    return {likedDreams, savedDreams, followingNames, joinedGroups, unread};
  };
  const getResponse = text => {
    const lo = cherryNorm(text);
    const ctx = appContext();

    // ── App knowledge / help ───────────────────────────────────────────────
    if (lo.includes("what is a circle") || lo.includes("what are circles") || (lo.includes("circle") && (lo.includes("what") || lo.includes("explain") || lo.includes("mean") || lo.includes("how"))))
      return {action:null, result:"Circles are what Looscid calls groups. Instead of joining a generic 'group', you join a Circle — a community of people sharing the same interests or vibe. You can share Dreams inside a Circle, chat with members, and follow what's happening there. Same idea as a group, just our name for it. You can find yours in the Discover tab."};

    if (lo.includes("what is a dream") || lo.includes("what are dreams") || (lo.includes("dream") && lo.includes("what does") && lo.includes("mean")))
      return {action:null, result:"On Looscid, a Dream is just what you share — anything at all. A thought, a take, a photo, a link, a question. The name comes from the idea that every idea starts somewhere. You can like Dreams, Redream them (share them with your followers), or Quote Dream them with your own words on top."};

    if (lo.includes("what is redream") || lo.includes("how does redream") || lo.includes("what is reboard") || lo.includes("reboard"))
      return {action:null, result:"Redreaming instantly shares someone else's Dream to your followers — like a repost or retweet. Quote Dreaming lets you add your own thoughts on top of it. You can undo either at any time from the Dream Options menu (the  button)."};

    if (lo.includes("what is looscid") || lo.includes("what is this app") || lo.includes("tell me about looscid") || lo.includes("how does this app work"))
      return {action:null, result:"Looscid is a social platform where you share what's on your mind — your thoughts, takes, moments, whatever. No ads, no algorithm deciding who sees your Dreams. You follow people, they follow you, and you see each other's Dreams in your feed. Circles let you find communities around topics you care about. I'm Cherry, the built-in AI — I can help you Dream, find people to follow, navigate the app or just answer questions."};

    if (lo.includes("what is cherry") || lo.includes("who is cherry") || lo.includes("what can you do") || lo.includes("what can cherry do"))
      return {action:null, result:"I'm Cherry — Looscid's AI assistant. I'm built into the app so I actually know what's happening here. I can: share Dreams for you, follow Dreamors, join Circles, read and clear your notifications, draft content, find trending topics, answer questions about the app, and generally help you get the most out of Looscid. Just ask and I'll do it — or try to."};

    if (lo.includes("help") && (lo.includes("how do i") || lo.includes("how to") || lo.includes("where is") || lo.includes("can't find") || lo.includes("cannot find")))
      return {action:null, result:"Happy to help. What are you trying to do? Just describe it and I'll walk you through it or do it for you. There's no separate help centre — I'm it. Some common things I can help with: sharing a Dream, finding someone to follow, joining a Circle, changing your settings, or understanding how something works."};

    if (lo.includes("how do i post") || lo.includes("how to post") || lo.includes("how do i dream") || lo.includes("create a dream"))
      return {action:null, result:"Tap the Menu button, then tap New Dream. Type what's on your mind — there's no topic requirement, just share what you feel like. You can attach photos, links, polls, a mood, or music. Hit Dream when you're ready. Want me to open the composer for you, or draft something?"};

    if (lo.includes("how do i follow") || lo.includes("find people") || lo.includes("find dreamers") || lo.includes("who to follow"))
      return {action:null, result:"Go to Discover (in the Menu or tap Discover from the main menu sheet) and you'll see suggested Dreamors and trending topics. You can also search by name or LooscidID. Or just tell me who you're looking for and I'll find them."};

    if (lo.includes("settings") && (lo.includes("where") || lo.includes("find") || lo.includes("how do i")))
      return {action:null, result:"Settings are in the Menu — tap the Menu button at the bottom (or top, depending on your preference) and you'll see Settings with all the sub-sections. Or I can take you straight to a specific one — just say which: LooscidID, Privacy, Notifications, Customizability, Accessibility, Cherry AI settings."};

    if (lo.includes("private") || lo.includes("who can see") || lo.includes("is my account private"))
      return {action:null, result:"By default your account is public — anyone on Looscid can see your Dreams. You can make it private in Settings > Privacy > Private Account. When it's private, only approved followers see your Dreams. Direct Messages (Private Dreams) are always end-to-end encrypted regardless of your account type."};

    if (lo.includes("delete") && lo.includes("account"))
      return {action:null, result:"You can delete your LooscidID in Settings > LooscidID. It's permanent — your Dreams, followers and profile will all be removed. You'll have 60 days to cancel if you change your mind. Want me to take you to that screen?"};

    if (lo.includes("report") || lo.includes("block") || lo.includes("mute"))
      return {action:null, result:"Report, Mute and Block aren't in Looscid yet. They're on the Coming soon list in Settings, Looscid Labs. For now, muted words in Settings, Privacy hide Dreams with words you choose."};

    if (lo.includes("what do i like") || lo.includes("my liked") || lo.includes("liked dreams"))
      return {action:null, result:`You've liked: ${ctx.likedDreams}. Want me to find more Dreams like those?`};

    if (lo.includes("saved") || lo.includes("bookmarked"))
      return {action:null, result:`Your saved Dreams: ${ctx.savedDreams}.`};

    if (lo.includes("who am i following") || lo.includes("following") && lo.includes("who"))
      return {action:null, result:`You're currently following: ${ctx.followingNames}. Want me to suggest more Dreamors?`};

    if (lo.includes("my circles") || lo.includes("joined groups"))
      return {action:null, result:`You're in: ${ctx.joinedGroups}. I can join more groups for you — just say which ones.`};

    if (lo.includes("notification") || lo.includes("alerts"))
      return {action:"Checking your notifications…", agentLabel:"Reading notifications",
        result:`You have ${ctx.unread} unread notification${ctx.unread!==1?"s":""}. ${ctx.unread>0?"Recent: "+notifs.filter(n=>n.unread).map(n=>(n.user?n.user.name+" ":"")+n.text).slice(0,2).join("; ") + ". Want me to mark them all read?" : "You are all caught up!"}`,
        confirm:{label:"Mark all read", fn:()=>markNotifsRead()}};

    if ((lo.includes("mark") && lo.includes("read")) || lo.includes("clear notif"))
      return {action:"Marking all notifications as read…", agentLabel:"Clearing notifications",
        result:"Done All notifications marked as read.",
        autoFn: markNotifsRead};



    if (lo.includes("join consciousness") || (lo.includes("join") && lo.includes("consciousness")))
      return {action:"Joining Consciousness Lab…", agentLabel:"Joining group",
        result:(groups.find(g=>g.id===1)||{}).joined ? "You're already in Consciousness Lab" : "Done You've joined Consciousness Lab! Check it out in your Groups tab.",
        autoFn: ()=>joinGroup(1)};

    if (lo.includes("join philosophy") || (lo.includes("join") && lo.includes("philosophy")))
      return {action:"Joining Philosophy Circle…", agentLabel:"Joining group",
        result:(groups.find(g=>g.id===3)||{}).joined ? "You're already in Philosophy Circle." : "Done You've joined Philosophy Circle!",
        autoFn: ()=>joinGroup(3)};

    if (lo.includes("join creative") || (lo.includes("join") && lo.includes("creative")))
      return {action:"Joining Creative Minds…", agentLabel:"Joining group",
        result:(groups.find(g=>g.id===2)||{}).joined ? "Already in Creative Minds." : "Done You've joined Creative Minds!",
        autoFn: ()=>joinGroup(2)};

    if (lo.includes("join mindful") || (lo.includes("join") && lo.includes("mindful")))
      return {action:"Joining Mindful Living…", agentLabel:"Joining group",
        result:(groups.find(g=>g.id===4)||{}).joined ? "Already in Mindful Living." : "Done You've joined Mindful Living!",
        autoFn: ()=>joinGroup(4)};

    if (lo.includes("post") && (lo.includes("dream") || lo.includes("it") || lo.includes("this")) && msgs.some(m=>m.draft)) {
      const draftMsg = [...msgs].reverse().find(m=>m.draft);
      const draftText = draftMsg ? draftMsg.draft : null;
      if (draftText) return {action:"Publishing your Dream to the feed…", agentLabel:"Publishing Dream",
        result:"Done Your Dream is live! Head to your feed to see it.",
        autoFn: ()=>postDream(draftText)};
    }

    if (lo.includes("draft") || lo.includes("write a dream") || lo.includes("compose") || lo.includes("help me write") || lo.includes("suggest a dream")) {
      const topics = ["#Consciousness","#Philosophy","#CreativeProcess","#Mindfulness","#NatureAndMind"];
      const topic = topics[Math.floor(Math.random()*topics.length)];
      const drafts = [
        `The mind doesn't just observe reality — it participates in creating it. Every perception is an act of imagination. ${topic}`,
        `There is a silence between thoughts that most of us never notice. That silence is where everything true begins. ${topic}`,
        `Creativity isn't about having ideas. It's about noticing what's already there, waiting to be seen. ${topic}`,
        `We spend so much energy building who we are, and so little time asking what we're building it for. ${topic}`,
      ];
      const draft = drafts[Math.floor(Math.random()*drafts.length)];
      return {action:"Drafting a Dream based on your interests…", agentLabel:"Drafting Dream",
        result:`Here's a draft:

"${draft}"

Want me to publish it, or would you like to tweak it first?`,
        draft, confirm:{label:"Publish this Dream", fn:()=>postDream(draft)}};
    }

    if (lo.includes("who should i follow") || lo.includes("suggest") && lo.includes("follow")) {
      const unfollowed = USERS.filter(u=>!following.has(u.id));
      if (!unfollowed.length) return {action:null, result:"You're already following everyone on Looscid!"};
      const picks = unfollowed.slice(0,2).map(u=>`${u.name} (${u.handle}) — ${u.bio.slice(0,40)}…`).join("\n");
      return {action:"Analysing your interests and engagement…", agentLabel:"Finding Dreamors",
        result:`Based on your activity, I suggest:

${picks}

Shall I follow them for you?`,
        confirm:{label:"Follow them", fn:()=>unfollowed.slice(0,2).forEach(u=>followUser(u.id))}};
    }

    if (lo.includes("find group") || lo.includes("suggest group") || lo.includes("recommend group") || lo.includes("find circle") || lo.includes("suggest circle") || lo.includes("recommend circle")) {
      const unjoined = groups.filter(g=>!g.joined);
      if (!unjoined.length) return {action:null, result:"You've joined all available Circles."};
      const picks = unjoined.slice(0,2).map(g=>`${g.emoji} ${g.name} — ${g.description.slice(0,50)}…`).join("\n");
      return {action:"Scanning Circles that match your interests…", agentLabel:"Finding Circles",
        result:`Circles I'd recommend for you:

${picks}

Want me to join any of these?`,
        confirm:{label:"Join these Circles", fn:()=>unjoined.slice(0,2).forEach(g=>joinGroup(g.id))}};
    }

    if (lo.includes("trending") || lo.includes("what's hot") || lo.includes("whats hot"))
      return {action:"Fetching live trending data…", agentLabel:"Fetching trends",
        result:"Right now on Looscid:\n\n #Consciousness — 48.2K Dreams (+340% this hour)\n #CreativeProcess — 22.1K Dreams\n #PhilosophyOfMind — 15.4K Dreams\n\nWant me to draft a Dream around one of these?"};

    if (lo.includes("summarize") || lo.includes("summary") || lo.includes("what's happening") || lo.includes("catch me up")) {
      const ctx2 = appContext();
      return {action:"Reading your feed and activity…", agentLabel:"Summarising feed",
        result:`Here's your Looscid summary: ${ctx2.unread} unread notification${ctx2.unread!==1?"s":""}
👥 Following: ${ctx2.followingNames}
🏘️ Groups: ${ctx2.joinedGroups}
❤️ Recently liked: ${ctx2.likedDreams}

Top trending: #Consciousness and #CreativeProcess. Luna Rivera just dreamed a new Dream about consciousness and creativity — you might love it.`};
    }

    if (lo.includes("redream") || lo.includes("how does redream") || lo.includes("what is redream"))
      return {action:null, result:"Redreaming instantly shares someone else's Dream to your followers — like a repost. Quote Dreaming lets you add your own words on top. You can undo either from Dream Options anytime."};

    if (lo.includes("like") && lo.includes("luna"))
      return {action:"Liking Luna's latest Dream…", agentLabel:"Liking Dream",
        result:"Done Liked Luna Rivera's Dream about consciousness and creativity.",
        autoFn: ()=>likeDream(1)};

    if (lo.includes("save") && (lo.includes("luna") || lo.includes("first") || lo.includes("top")))
      return {action:"Saving Dream…", agentLabel:"Saving Dream",
        result:"Done Dream saved to your profile.",
        autoFn: ()=>saveDream(1)};

    if (lo.includes("thank") || lo.includes("awesome") || lo.includes("great") || lo.includes("perfect"))
      return {action:null, result:"Happy to help! I'm always here — just tap the cherry button anywhere in the app."};

    if (lo.includes("hello") || lo.includes("hi cherry") || lo.includes("hey"))
      return {action:null, result:`Hey! I can see you're following ${appContext().followingNames || "no one yet"} and you're in ${appContext().joinedGroups || "no groups yet"}. I can share Dreams, follow people, join Groups, check notifications, and more. What would you like?`};

    return {action:null, fallback:true, result:"I can help you share Dreams, follow Dreamors, join Groups, check your notifications, summarise your feed, find trending topics, or draft content. Just ask — I have full access to your Looscid."};
  };
  return getResponse(text);
}
})(window.Looscid = window.Looscid || {});
