/* Looscid create.js: Create (New Dream), attachments, symbols and Drafts.
   Plain script (not a module). Everything it shares goes on window.Looscid; see FILES.md for the load order. */
(function (Looscid) {
const { AlertDialog, Av, BackHeader, CreateGroupFlow, DRAFTS_KEY, Earcon, LC_AUTOSAVE_KEY, LcMenu, ME, Modal, _optionalChain, announce, getDrafts, lcCloseProps, lcSpeechText, lh, recordHabit, useEffect, useEnterSubmit, useInertBehind, useRef, useState } = Looscid;
Object.assign(Looscid, { LcComposer, lcReplyDrafts, lcAltSuggest, deleteDraftItem, AttachPanel, CreateMenu, DraftsPage, evalInlineCalc, SymbolPicker, lcSendWithUndo, lcPrepImage });

function deleteDraftItem(id) {
  try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(getDrafts().filter(d => d.id !== id))); } catch (e7) {}
}
/* --- CREATE MENU ------------------------- */
function AttachPanel({onClose, onAttach, mode, start}) {
  // mode: "dream" or "reply"; start: open straight on one screen (Round 6.5: the Poll button opens Create Poll)
  const [screen, setScreen] = useState(start || "main"); // main | poll | gif | location | link
  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState(["","",""]);
  const [pollDur, setPollDur] = useState("24h");
  const [linkUrl, setLinkUrl] = useState("");
  const [locText, setLocText] = useState("");

  const attachItems = [
    {id:"photo",icon:"Photo / Video",label:"Photo / Video",sub:"Share an image or video clip"},
    {id:"gif",icon:"GIF",label:"GIF",sub:"Animated GIF from your library"},
    {id:"poll",icon:"Poll",label:"Poll",sub:"Let your audience vote"},
    {id:"link",icon:"Link",label:"Link",sub:"Attach a website, article or video"},
    {id:"location",icon:"Location",label:"Location",sub:"Tag a place to your Dream"},
    {id:"schedule",icon:"Schedule",label:"Schedule",sub:"Set a time to Publish this Dream"},
    {id:"mood",icon:"Mood",label:"Mood",sub:"Express how you're feeling"},
    {id:"music",icon:"Music",label:"Music",sub:"Attach a song you're listening to"},
  ].filter(i => mode==="reply" || mode==="comment" ? ["photo","gif","poll","link","mood"].includes(i.id) : true);

  if (screen==="poll") return (
    React.createElement(Modal, { onClose: ()=>{ if (start === "poll") onClose(); else setScreen("main"); }, title: "Create Poll" , subtitle: "Ask your followers a question"    ,}
      , React.createElement('div', { style: {marginBottom:12},}
        , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6},}, "Question")
        , React.createElement('input', { className: "inp", placeholder: "What do you want to ask?"     , value: pollQ, onChange: e=>setPollQ(e.target.value), 'aria-label': "Poll question" ,})
      )
      , React.createElement('div', { style: {marginBottom:12},}
        , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6},}, "Options")
        , pollOpts.map((opt,i)=>(
          React.createElement('div', { key: i, style: {display:"flex",gap:6,marginBottom:6,alignItems:"center"},}
            , React.createElement('div', { style: {width:20,height:20,borderRadius:"50%",border:"2px solid var(--bd2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"var(--tx3)",flexShrink:0},}, i+1)
            , React.createElement('input', { className: "inp", style: {flex:1,fontSize:13}, placeholder: "Option "+(i+1), value: opt, onChange: e=>setPollOpts(os=>os.map((o,j)=>j===i?e.target.value:o)), 'aria-label': "Poll option "+(i+1),})
            , pollOpts.length>2&&React.createElement('button', { className: "bi", style: {padding:3,flexShrink:0}, onClick: ()=>setPollOpts(os=>os.filter((_,j)=>j!==i)), 'aria-label': "Remove option" ,}, React.createElement('span', { style: {fontSize:14,color:"var(--tx3)"},}, "✕"))
          )
        ))
        , pollOpts.length<5&&React.createElement('button', { className: "btn bgb" , style: {width:"100%",padding:9,fontSize:12,marginTop:4}, onClick: ()=>setPollOpts(os=>[...os,""]), 'aria-label': "Add option" ,}, "+ Add Option"  )
      )
      , React.createElement('div', { style: {marginBottom:14},}
        , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6},}, "Poll Duration" )
        , React.createElement('div', { style: {display:"flex",gap:6,flexWrap:"wrap"},}
          , ["1h","6h","24h","3d","7d"].map(d=>(
            React.createElement('button', { key: d, className: "btn"+(pollDur===d?" bp":" bgb"), style: {padding:"6px 13px",fontSize:12}, onClick: ()=>setPollDur(d), 'aria-label': "Duration "+d,}, d)
          ))
        )
      )
      , React.createElement('button', { className: "btn bp" , style: {width:"100%",padding:12}, disabled: !pollQ.trim()||pollOpts.filter(o=>o.trim()).length<2, onClick: ()=>{onAttach({type:"poll",question:pollQ,options:pollOpts.filter(o=>o.trim()),duration:pollDur});onClose();}, 'aria-label': "Add poll to Dream"   ,}, "Attach Poll" )
    )
  );

  if (screen==="link") return (
    React.createElement(Modal, { onClose: ()=>setScreen("main"), title: "Attach Link" , subtitle: "Share an article, video or website"     ,}
      , React.createElement('input', { className: "inp", style: {marginBottom:12}, placeholder: "https://…", value: linkUrl, onChange: e=>setLinkUrl(e.target.value), type: "url", 'aria-label': "Link URL" ,})
      , React.createElement('button', { className: "btn bp" , style: {width:"100%",padding:12}, disabled: !linkUrl.trim(), onClick: ()=>{onAttach({type:"link",url:linkUrl});onClose();}, 'aria-label': "Attach link" ,}, "Attach Link" )
    )
  );

  if (screen==="location") return (
    React.createElement(Modal, { onClose: ()=>setScreen("main"), title: "Tag Location" , subtitle: "Add a place to your Dream"     ,}
      , React.createElement('input', { className: "inp", style: {marginBottom:12}, placeholder: "Search places…" , value: locText, onChange: e=>setLocText(e.target.value), 'aria-label': "Location search" ,})
      , ["San Francisco, CA","New York, NY","Los Angeles, CA","London, UK","Tokyo, Japan"].map(loc=>(
        React.createElement('button', { key: loc, className: "osb", onClick: ()=>{onAttach({type:"location",place:loc});onClose();}, 'aria-label': "Tag "+loc,}
          , React.createElement('span', { style: {fontSize:16},}, "📍"), loc
        )
      ))
    )
  );

  return (
    React.createElement(Modal, { onClose: onClose, title: "Add to Dream"  , subtitle: "Enrich your Dream with media and more"      ,}
      , lh('input', { id: "lc-photo-file", type: "file", accept: "image/*", hidden: true, tabIndex: -1, "aria-hidden": "true", onChange: function (e) {
          const file = e.target.files && e.target.files[0]; if (!file) return;
          lcPrepImage(file).then(function (att) { onAttach(att); announce(att.stripped ? "Photo added. Location and camera details removed." : "Photo added."); onClose(); }, function () { announce("That photo couldn't be read."); });
        } })
      , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},}
        , attachItems.map(item=>(
          React.createElement('button', { key: item.id, style: {background:"var(--sf2)",border:"1px solid var(--bd)",borderRadius:12,padding:"13px 10px",cursor:"pointer",textAlign:"center",transition:"all .15s",display:"flex",flexDirection:"column",alignItems:"center",gap:5}, onClick: ()=>{
            if(item.id==="poll") setScreen("poll");
            else if(item.id==="link") setScreen("link");
            else if(item.id==="location") setScreen("location");
            else if(item.id==="photo") { const f = document.getElementById("lc-photo-file"); if (f) f.click(); }
            else {onAttach({type:item.id});onClose();}
          }, 'aria-label': item.label+" — "+item.sub,}
            , React.createElement('span', { style: {fontSize:26},}, item.icon)
            , React.createElement('span', { style: {fontSize:12,fontWeight:700,color:"var(--tx)"},}, item.label)
            , React.createElement('span', { style: {fontSize:10,color:"var(--tx3)",lineHeight:1.3},}, item.sub)
          )
        ))
      )
    )
  );
}
/* Round 6.4: what the Nostr side can do right now (js/nostr.js), redrawn when it changes. */
function useNostrState() {
  const get = function () { return Looscid.lcNostr ? Looscid.lcNostr.state() : { mode: "none", canDream: false }; };
  const [st, setSt] = useState(get);
  useEffect(function () { const f = function () { setSt(get()); }; window.addEventListener("looscid-nostr", f); window.addEventListener("looscid-methods", f); return function () { window.removeEventListener("looscid-nostr", f); window.removeEventListener("looscid-methods", f); }; }, []);
  return st;
}
Looscid.useNostrState = useNostrState;
// Open Settings, LooscidID, Keys and IDs on its "Nostr key" heading (a person chose this, so focus moves there).
function lcOpenNostrKey(navigate) {
  navigate("settings_account", { tab: "keys" });
  let n = 0; const go = function () { const h = document.getElementById("nostr-key-h"); if (h) { h.focus(); return; } if (++n < 30) setTimeout(go, 50); }; setTimeout(go, 80);
}
Looscid.lcOpenNostrKey = lcOpenNostrKey;
function CreateMenu({onClose, prefs, navigate, cherryCtx}) {
  const [screen, setScreen] = useState("menu"); // menu | dream | group
  // Round 6.3: closing the composer without dreaming puts focus back on what opened Create.
  const openerRef = useRef(null);
  if (openerRef.current === null) openerRef.current = document.activeElement || false;
  if (screen==="group") return React.createElement(CreateGroupFlow, { onClose: onClose, navigate: navigate,});
  // Round 6.5: New Dream is the shared composer (js/create.js, LcComposer), the same one Reply and Quote use.
  if (screen==="dream") return lh(LcComposer, { mode: "new", prefs: prefs, navigate: navigate, cherryCtx: cherryCtx, opener: openerRef.current, onClose: onClose });

  // Main create menu
  return (
    React.createElement(Modal, { onClose: onClose, title: "Create", subtitle: "What would you like to share?"     ,}
      , React.createElement('button', { className: "osb", onClick: ()=>setScreen("dream"), 'aria-label': "New Dream — write and share a Dream"       ,}
        , React.createElement('span', { style: {fontSize:22,width:32,textAlign:"center"},}, "✏️")
        , React.createElement('div', { style: {flex:1},}, React.createElement('div', { style: {fontWeight:600,fontSize:14},}, "New Dream" ), React.createElement('div', { style: {fontSize:12,color:"var(--tx3)",marginTop:2},}, "Write, share and inspire"   ))
      )
      , React.createElement('button', { className: "osb", onClick: ()=>setScreen("group"), 'aria-label': "New Circle"     ,}
        , React.createElement('span', { style: {fontSize:22,width:32,textAlign:"center"},}, "👥")
        , React.createElement('div', { style: {flex:1},}, React.createElement('div', { style: {fontWeight:600,fontSize:14},}, "New Circle" ), React.createElement('div', { style: {fontSize:12,color:"var(--tx3)",marginTop:2},}, "Create a community around a shared interest"      ))
      )
    )
  );
}
// The first-run welcome is LooscidOnboarding (see the LooscidID block below App's helpers).

/* --- DRAFTS MANAGER ------------------------------------------------------- */
function DraftsPage({ navigate, onLoadDraft }) {
  const [items, setItems] = React.useState(getDrafts());
  const remove = id => { deleteDraftItem(id); setItems(getDrafts()); };
  return React.createElement('div', { className: "pg"},
    React.createElement(BackHeader, { title: "Drafts", onBack: ()=>navigate("feed") }),
    items.length === 0
      ? React.createElement('div', { className: "es"},
          React.createElement('div', { className: "esi"}, "📝"),
          React.createElement('div', { className: "est"}, "No drafts yet"),
          React.createElement('div', { className: "ess"}, "Start writing a Dream and save it for later.")
        )
      : React.createElement('div', { style: {padding:"0 16px 24px"}},
          items.map(draft => React.createElement('div', { key: draft.id, style: {background:"var(--sf2)",border:"1px solid var(--bd2)",borderRadius:14,padding:"14px 16px",marginBottom:10}},
            React.createElement('div', { style: {fontSize:14,color:"var(--tx)",lineHeight:1.55,marginBottom:8}}, draft.text.slice(0, 120) + (draft.text.length > 120 ? "…" : "")),
            React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",marginBottom:10}}, new Date(draft.savedAt).toLocaleDateString(undefined, {weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})),
            React.createElement('div', { style: {display:"flex",gap:8}},
              React.createElement('button', { className: "btn bp", style: {flex:1,padding:"8px 0",fontSize:12}, onClick: ()=>{ onLoadDraft(draft); navigate("feed"); }}, "Continue editing"),
              React.createElement('button', { className: "btn bgb", style: {flex:1,padding:"8px 0",fontSize:12,color:"var(--rd)",borderColor:"rgba(239,68,68,.3)"}, onClick: ()=>remove(draft.id)}, "Delete")
            )
          ))
        )
  );
}
/* --- INLINE CALCULATOR ---------------------------------------------------- */
function evalInlineCalc(text) {
  // Detect patterns like "5 + 3 =" or "$50 + $20 ="
  const calcPattern = /(\$?[\d,.]+\s*[\+\-\×\*\/÷x]\s*\$?[\d,.]+\s*(?:[\+\-\×\*\/÷x]\s*\$?[\d,.]+\s*)*)\s*=/g;
  return text.replace(calcPattern, (match, expr) => {
    try {
      const hasCurrency = match.includes("$") || match.includes("€") || match.includes("£");
      const symbol = match.includes("€")?"€":match.includes("£")?"£":hasCurrency?"$":"";
      const clean = expr.replace(/[$€£,]/g,"").replace(/×/g,"*").replace(/÷/g,"/").replace(/x/g,"*").trim();
      const result = Function('"use strict"; return (' + clean + ')')();
      if (!isFinite(result)) return match;
      const formatted = hasCurrency ? symbol + result.toFixed(2) : String(Math.round(result*100)/100);
      return match.trimEnd() + " " + formatted;
    } catch (e20) { return match; }
  });
}
/* --- SYMBOL PICKER DATA --------------------------------------------------- */
const SYMBOL_CATEGORIES = [
  {label:"Math", symbols:["±","×","÷","∞","∂","∫","∑","√","π","∆","≈","≠","≤","≥","∈","∉","⊂","⊃","∧","∨"]},
  {label:"Greek", symbols:["α","β","γ","δ","ε","θ","λ","μ","ξ","σ","φ","ψ","ω","Α","Β","Γ","Δ","Σ","Φ","Ω"]},
  {label:"Math ℝ", symbols:["ℕ","ℤ","ℚ","ℝ","ℂ","ℍ","𝔽","ℙ","𝔸","𝔹","𝔻","𝔼","𝔾","𝕀","𝕁","𝕂","𝕃","𝕄","𝕆","𝕊"]},
  {label:"Arrows", symbols:["→","←","↑","↓","↔","↕","⇒","⇐","⇔","↺","↻","⤴","⤵","➜","➡","⬅","⬆","⬇","↗","↙"]},
  {label:"Type", symbols:["·","—","–","…","«","»","„","“","”","‘","’","©","®","™","°","§","¶","†","‡","•"]},
  {label:"Currency", symbols:["$","€","£","¥","₹","₩","₿","¢","₽","₪","₫","฿","₦","₡","₲","₴","₵","₸","₺","₼"]},
];
Looscid.SYMBOL_CATEGORIES = SYMBOL_CATEGORIES;
const SYMBOL_SHORTCUTS = {
  "middledot":"·","infinity":"∞","plusminus":"±","arrow":"→","degree":"°",
  "copyright":"©","trademark":"™","registered":"®","ellipsis":"…","emdash":"—",
  "alpha":"α","beta":"β","gamma":"γ","delta":"δ","pi":"π","sigma":"σ","omega":"ω",
  "reals":"ℝ","naturals":"ℕ","integers":"ℤ","complex":"ℂ","rationals":"ℚ",
};
Looscid.SYMBOL_SHORTCUTS = SYMBOL_SHORTCUTS;
/* --- SYMBOL PICKER COMPONENT ---------------------------------------------- */
function SymbolPicker({ onInsert, onClose }) {
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [favs, setFavs] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("dbm_sym_favs")||"[]"); } catch (e21) { return []; }
  });
  const [recent, setRecent] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("dbm_sym_recent")||"[]"); } catch (e22) { return []; }
  });

  const addFav = s => {
    const f = favs.includes(s) ? favs.filter(x=>x!==s) : [s,...favs].slice(0,20);
    setFavs(f);
    try { localStorage.setItem("dbm_sym_favs", JSON.stringify(f)); } catch (e23) {}
  };
  const insertSym = s => {
    const r = [s,...recent.filter(x=>x!==s)].slice(0,20);
    setRecent(r);
    try { localStorage.setItem("dbm_sym_recent", JSON.stringify(r)); } catch (e24) {}
    onInsert(s);
  };

  const allSyms = SYMBOL_CATEGORIES.flatMap(c=>c.symbols);
  const filtered = search ? allSyms.filter(s => {
    const q = search.toLowerCase();
    return s.includes(q) || Object.entries(SYMBOL_SHORTCUTS).some(([k,v])=>v===s&&k.includes(q));
  }) : null;

  const cats = [{label:"⭐ Favs",symbols:favs},{label:"Recent",symbols:recent},...SYMBOL_CATEGORIES];

  return React.createElement('div', {className:"sym-picker", onClick:e=>{if(e.target===e.currentTarget)onClose();}},
    React.createElement('div', {className:"sym-panel"},
      React.createElement('div', {style:{display:"flex",gap:8,marginBottom:12}},
        React.createElement('input', {className:"inp",type:"text",placeholder:"Search symbols or type name (e.g. alpha)…",
          value:search, onChange:e=>{
            const v=e.target.value;
            setSearch(v);
            if(SYMBOL_SHORTCUTS[v.toLowerCase().trim()]){
              insertSym(SYMBOL_SHORTCUTS[v.toLowerCase().trim()]);
              onClose();
            }
          },
          style:{flex:1,fontSize:13}, autoFocus:true, 'aria-label':"Search symbols"}),
        React.createElement('button',{className:"btn bgb",style:{padding:"8px 14px",fontSize:13},onClick:onClose},"Done")
      ),
      !filtered && React.createElement('div',{style:{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:4}},
        cats.map((cat,i)=>React.createElement('button',{key:i,
          style:{flexShrink:0,padding:"4px 12px",borderRadius:20,border:"1.5px solid",
            borderColor:i===tab?"var(--ac2)":"var(--bd2)",
            background:i===tab?"rgba(109,40,217,.12)":"var(--sf2)",
            color:i===tab?"var(--ac3)":"var(--tx2)",fontSize:12,fontWeight:600,cursor:"pointer"},
          onClick:()=>setTab(i)}, cat.label+" ("+cat.symbols.length+")")
        )
      ),
      React.createElement('div',{className:"sym-grid"},
        (filtered||cats[tab].symbols).map((s,i)=>
          React.createElement('button',{key:i,className:"sym-btn",
            onClick:()=>insertSym(s),
            onDoubleClick:()=>addFav(s),
            style:{position:"relative"},
            'aria-label':"Insert "+s,
            title:_optionalChain([Object, 'access', _2 => _2.entries, 'call', _3 => _3(SYMBOL_SHORTCUTS), 'access', _4 => _4.find, 'call', _5 => _5(([k,v])=>v===s), 'optionalAccess', _6 => _6[0]])||s},
            s,
            favs.includes(s)&&React.createElement('span',{style:{position:"absolute",top:1,right:2,fontSize:7,color:"var(--ac3)"}},"★")
          )
        )
      ),
      React.createElement('div',{style:{fontSize:11,color:"var(--tx3)",textAlign:"center",marginTop:12}},
        "Tap to insert. Double-tap to favourite ★. Type a name like \"alpha\" to jump straight to it."
      )
    )
  );
}
// Undo send (Settings > Customizability > Posting): waits 5 or 10 seconds with an Undo button.
/* Round 6.3: the New Dream dialog. Everything behind it is inert while it's open (the live region
   sits outside the app, so announcements still speak). */
function LcComposerShell(props) {
  const ovRef = useRef(null);
  useInertBehind(ovRef);
  return lh('div', { ref: ovRef, className: "ov", onClick: function (e) { if (e.target === e.currentTarget) props.onClose(); } },
    lh('div', { ref: props.boxRef, className: "msh", role: "dialog", "aria-modal": "true", "aria-labelledby": "cr-dream-h", onKeyDown: props.onKeyDown, style: {borderRadius:"20px 20px 0 0",maxHeight:"95vh"} }, props.children),
    props.after);
}
function lcTrapComposer(e, box) {
  if (e.key !== "Tab" || !box) return;
  const f = Array.from(box.querySelectorAll('textarea:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')).filter(function (x) { return x.offsetParent !== null || x === document.activeElement; });
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
function lcRefocus(opener) {
  const el = opener && opener.isConnected && opener !== document.body && opener.focus ? opener : document.querySelector(".nb-create");
  if (el && el.focus) el.focus();
}
function lcFocusAfterPost(id, opener) {
  let n = 0;
  const go = function () {
    const sel = '[data-dream-id="' + String(id).replace(/"/g, "") + '"]';
    const el = id != null ? (document.querySelector("#feed-list " + sel) || document.querySelector(sel)) : null;
    if (el) { el.focus(); return; }
    if (++n < 20) { setTimeout(go, 50); return; }
    lcRefocus(opener);
  };
  setTimeout(go, 30);
}
function lcSendWithUndo(what, fn, text, draftKey) {
  const s = +Looscid.A11Y_NOW.undoSend || 0;
  const send = function () { fn(); Earcon.play("send"); announce(what + " dreamed."); };
  if (!s || !Looscid.LC_UNDO_SET) { send(); return; }
  const t = setTimeout(function () { if (Looscid.LC_UNDO_SET) Looscid.LC_UNDO_SET(null); send(); }, s * 1000);
  Looscid.LC_UNDO_SET({ id: Date.now(), what: what, secs: s, cancel: function () { clearTimeout(t); if (Looscid.LC_UNDO_SET) Looscid.LC_UNDO_SET(null); if (text) { if (draftKey) lcReplyDraftSet(draftKey, text); else try { localStorage.setItem(LC_AUTOSAVE_KEY, text); } catch (e) {} } announce(what + " not sent." + (text ? (draftKey ? " Open it again to recover it." : " Open New Dream to recover it.") : "")); } });
}
/* --- Round 6.5: THE COMPOSER ---------------------------------------------------------------
   One composer for New Dream, Reply and Quote. Its layout follows Feditext's composer (design
   inspiration only: no Feditext code or text is used). The Dream you answer sits right above your
   text, your text box comes first, then the toolbar in Feditext's order (attachments, poll,
   Audience, content warning, symbols, characters left, add another Dream), then Dream and Close.
   Looscid's rules on top: explanations are plain <p>, #looscid-live is the only announcement
   channel, and focus moves only when you act. */
const LC_AUD_NAMES = { everyone: "Everyone", followers: "Followers only", groups: "My Circles", device: "Only this device" };
const LC_REPLY_DRAFTS_KEY = "dbm_reply_drafts";
const LC_THREAD_MAX = 10;
function lcReplyDrafts() { try { const o = JSON.parse(localStorage.getItem(LC_REPLY_DRAFTS_KEY) || "{}"); return o && typeof o === "object" && !Array.isArray(o) ? o : {}; } catch (e) { return {}; } }
function lcReplyDraftSet(k, v) {
  const o = lcReplyDrafts(); if (v && String(v).trim()) o[k] = String(v); else delete o[k];
  const keys = Object.keys(o); while (keys.length > 50) delete o[keys.shift()];
  try { if (Object.keys(o).length) localStorage.setItem(LC_REPLY_DRAFTS_KEY, JSON.stringify(o)); else localStorage.removeItem(LC_REPLY_DRAFTS_KEY); } catch (e) {}
}
function lcWhoName(u) { return (u && (u.name || u.handle)) || "someone"; }
// Who a reply notifies: the author of what you answer, the Dream's author, and anyone it mentions. Never you, never twice.
function lcNotifyPeople(parent, root) {
  const out = [], me = ME || {};
  const add = function (u) { if (!u || !u.handle || u === ME || (me.handle && u.handle.toLowerCase() === me.handle.toLowerCase())) return; if (out.some(function (x) { return x.handle.toLowerCase() === u.handle.toLowerCase(); })) return; out.push({ handle: u.handle, name: u.name || u.handle, pk: u.pk || null, on: true }); };
  add(parent && parent.user); if (root && root !== parent) add(root.user);
  const users = Looscid.USERS || [];
  (String((parent && parent.text) || "").match(/(^|\s)@[\w.-]+/g) || []).forEach(function (m) { const h = m.trim(); const u = users.find(function (x) { return x.handle && x.handle.toLowerCase() === h.toLowerCase(); }); add(u || { handle: h, name: h }); });
  return out;
}
// One line VoiceOver reads in one swipe: who, when, what, and how many replies it has.
function lcParentLine(d) {
  const n = (d.isReply ? 0 : (d.comments || 0) + ((Looscid.lcRepliesFor && Looscid.lcRepliesFor(d.id).length) || 0));
  return lcWhoName(d.user) + (d.user && d.user.handle ? " (" + d.user.handle + ")" : "") + ", " + (d.time || "just now") + ": " + String(d.text || "") + (n ? " " + n + (n === 1 ? " reply." : " replies.") : "");
}
// Alt text helper: a starting point made on this device from the photo's shape, colours and file name.
// Cherry can't see what's in the photo, so the person checks and edits it. Nothing is sent anywhere.
function lcAltSuggest(att) {
  return new Promise(function (res) {
    const img = new Image();
    img.onload = function () {
      try {
        const c = document.createElement("canvas"); c.width = c.height = 16; const g = c.getContext("2d"); g.drawImage(img, 0, 0, 16, 16);
        const px = g.getImageData(0, 0, 16, 16).data; let r = 0, gr = 0, b = 0; const n = px.length / 4;
        for (let i = 0; i < px.length; i += 4) { r += px[i]; gr += px[i + 1]; b += px[i + 2]; }
        r /= n; gr /= n; b /= n;
        const mx = Math.max(r, gr, b), mn = Math.min(r, gr, b), l = (mx + mn) / 510, s = mx === mn ? 0 : (mx - mn) / (255 - Math.abs(mx + mn - 255));
        let hue = 0; if (mx !== mn) { hue = mx === r ? ((gr - b) / (mx - mn)) % 6 : mx === gr ? (b - r) / (mx - mn) + 2 : (r - gr) / (mx - mn) + 4; hue = (hue * 60 + 360) % 360; }
        const tone = l < 0.15 ? "dark" : l > 0.88 ? "white and light" : s < 0.15 ? (l < 0.5 ? "dark grey" : "light grey") : hue < 15 || hue >= 345 ? "red" : hue < 45 ? "orange and brown" : hue < 70 ? "yellow" : hue < 165 ? "green" : hue < 255 ? "blue" : hue < 300 ? "purple" : "pink";
        const w = img.naturalWidth || 1, h = img.naturalHeight || 1;
        const shape = w > h * 1.2 ? "Wide photo" : h > w * 1.2 ? "Tall photo" : "Square photo";
        const nm = String(att.name || "").replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[_-]+/g, " ").replace(/\b(img|dsc|pxl|image|photo|screenshot|screen shot)\b\s*[\d ]*/gi, "").replace(/\d{6,}/g, "").trim();
        res(shape + ", mostly " + tone + (nm ? ", named \u201c" + nm + "\u201d" : "") + ".");
      } catch (e) { res("Photo."); }
    };
    img.onerror = function () { res("Photo."); };
    img.src = att.src;
  });
}
async function lcPublishChain(items) {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    try { await Looscid.lcNostr.publishDream({ id: it.id, text: it.text, created: typeof it.id === "number" ? it.id : Date.now(), parentRef: it.parentRef, quoteRef: it.quoteRef, cw: it.cw || undefined, notifyPks: it.notifyPks }, { quiet: i < items.length - 1 }); } catch (e) {}
  }
}
function LcComposer(props) {
  const mode = props.mode === "reply" || props.mode === "quote" ? props.mode : "new";
  const parent = mode === "new" ? null : props.parent;
  const root = mode === "reply" ? (props.root || parent) : null;
  const isReply = mode === "reply", isQuote = mode === "quote";
  const who = parent ? lcWhoName(parent.user) : "";
  const noun = isReply ? "reply" : "Dream", Noun = isReply ? "Reply" : "Dream";
  const draftKey = parent ? (isReply ? "r:" : "q:") + String(parent.id) : null;
  const cherryCtx = props.cherryCtx, navigate = props.navigate;
  const pAud = parent && LC_AUD_NAMES[parent.aud] ? parent.aud : "everyone";
  const [parts, setParts] = useState([props.text || ""]);
  const [active, setActive] = useState(0);
  const [audience, setAudience] = useState(isReply ? pAud : "everyone");
  const [cwOn, setCwOn] = useState(!!(isReply && parent.cw));
  const [cw, setCw] = useState(isReply && parent.cw ? String(parent.cw) : "");
  const [people, setPeople] = useState(function () { return isReply ? lcNotifyPeople(parent, root) : []; });
  const [attachments, setAttachments] = useState([]);
  const [attach, setAttach] = useState(null); // null | "main" | "poll"
  const [altAsk, setAltAsk] = useState(false);
  const [nopv, setNopv] = useState(false);
  const [showPcw, setShowPcw] = useState(false);
  const [recover, setRecover] = useState(null);
  const nst = useNostrState();
  const [pass, setPass] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const boxRef = useRef(null), openerRef = useRef(props.opener || null), sentRef = useRef(false), saidRef = useRef({});
  if (openerRef.current === null) openerRef.current = document.activeElement || false;
  const focusBox = function (i) { setTimeout(function () { const t = document.querySelector('textarea[data-cr-box="' + (i || 0) + '"]'); if (t) t.focus(); }, 30); };
  const unlockKey = async function () {
    const r = await Looscid.lcNostr.unlock(pass);
    if (r.err) { setPassMsg(r.err); announce(r.err); return; }
    setPass(""); setPassMsg(""); announce(r.waiting ? "Unlocked. Sending " + r.waiting + (r.waiting === 1 ? " waiting Dream." : " waiting Dreams.") : "Unlocked.");
    focusBox(0);
  };
  const passRef = useEnterSubmit(unlockKey);
  const charLimit = (props.prefs && props.prefs.charLimitEnabled) ? props.prefs.charLimit : null;
  // Like Feditext: a link counts as 23 characters and the content warning counts too.
  const lenOf = function (t) { return String(t || "").replace(/https?:\/\/\S+/gi, "x".repeat(23)).length + (cwOn ? cw.length : 0); };
  const overAny = !!charLimit && parts.some(function (t) { return lenOf(t) > charLimit; });
  const canPost = parts[0].trim().length > 0 && !overAny;
  const left = charLimit ? charLimit - lenOf(parts[active] || "") : null;
  // Draft: recover on open, then autosave (a reply's draft is kept per Dream, apart from your New Dream draft).
  useEffect(function () {
    if (!Looscid.A11Y_NOW.draftAutosave || props.text) return;
    let s = null; try { s = draftKey ? lcReplyDrafts()[draftKey] : localStorage.getItem(LC_AUTOSAVE_KEY); } catch (e) {}
    if (s && s.trim()) { setRecover(s); setTimeout(function () { const h = document.getElementById("lc-recover-h"); if (h) h.focus(); }, 80); }
  }, []);
  useEffect(function () {
    if (!Looscid.A11Y_NOW.draftAutosave || recover) return;
    const all = parts.map(function (t) { return t.trim(); }).filter(Boolean).join("\n\n");
    const t = setTimeout(function () { if (sentRef.current) return; if (draftKey) lcReplyDraftSet(draftKey, all); else try { if (all) localStorage.setItem(LC_AUTOSAVE_KEY, all); else localStorage.removeItem(LC_AUTOSAVE_KEY); } catch (e) {} }, 300);
    return function () { clearTimeout(t); };
  }, [parts, recover]);
  // The characters-left count is never read on each key: once at 20 left, once when you go over.
  useEffect(function () {
    if (left == null) return; const s = saidRef.current;
    if (left < 0) { if (!s.over) { s.over = true; announce(-left + " over the limit."); } } else s.over = false;
    if (left >= 0 && left <= 20) { if (!s.near) { s.near = true; announce(left + " characters left."); } } else if (left > 20) s.near = false;
  }, [left]);
  const echo = function (prev, next) {
    const m = Looscid.A11Y_NOW.typingEcho; if (!m || m === "off" || next.length !== prev.length + 1) return;
    const ch = next.slice(-1), isBreak = /[\s.,!?;:]/.test(ch);
    if ((m === "words" || m === "both") && isBreak) { const w = (prev.match(/(\S+)$/) || [])[1]; if (w) { announce(lcSpeechText(w)); return; } }
    if ((m === "chars" || m === "both") && !isBreak) announce(ch);
  };
  const setPart = function (i, v) { setParts(function (ps) { return ps.map(function (x, j) { return j === i ? v : x; }); }); };
  const addPart = function () {
    if (parts.length >= LC_THREAD_MAX) { announce("A thread can have up to " + LC_THREAD_MAX + " " + (isReply ? "replies." : "Dreams.")); return; }
    const i = parts.length; setParts(parts.concat([""])); setActive(i); focusBox(i);
  };
  const removePart = function (i) { setParts(parts.filter(function (_, j) { return j !== i; })); setActive(Math.max(0, i - 1)); announce(Noun + " " + (i + 1) + " removed."); focusBox(i - 1); };
  // Nostr: only Everyone goes out; a reply goes out only when the Dream it answers is on Nostr.
  const parentNostr = !!(parent && (parent.nid || (Looscid.lcNostr && Looscid.lcNostr.nidOf && (Looscid.lcNostr.nidOf(parent.id) || Looscid.lcNostr.isPending(parent.id)))));
  const goesToNostr = audience === "everyone" && nst.canDream && (!isReply || parentNostr);
  const audNote = audience === "device" ? "Only this device: this " + noun + " stays here and is never sent."
    : !nst.canDream ? "For now, " + (isReply ? "replies are" : "Dreams are") + " saved only on this device."
    : audience === "everyone" ? (isReply && !parentNostr ? who + "\u2019s Dream isn\u2019t on Nostr, so this reply is saved on this device only." : "Everyone: your " + noun + " is public on Nostr and can't be fully deleted.")
    : "Followers and Circles aren't on Nostr yet, so this " + noun + " is saved only on this device.";
  const widenNote = isReply && audience !== pAud ? who + "\u2019s Dream is for " + LC_AUD_NAMES[pAud] + ". Your reply is for " + LC_AUD_NAMES[audience] + "." : "";
  const what = isReply ? "Reply" : isQuote ? "Quote" : "Dream";
  const doPost = function () {
    const texts = parts.map(function (t) { return t.trim(); }).filter(Boolean); if (!texts.length) return;
    recordHabit("postDream", texts[0].slice(0, 30));
    sentRef.current = true;
    if (draftKey) lcReplyDraftSet(draftKey, ""); else try { localStorage.removeItem(LC_AUTOSAVE_KEY); } catch (e) {}
    const opener = openerRef.current, cwText = cwOn ? cw.trim() : "", aud = audience, pub = goesToNostr, pv = nopv;
    const notify = people.filter(function (x) { return x.on; }).map(function (x) { return x.handle; });
    texts.forEach(function (t) { (t.match(/(^|\s)@[\w.-]+/g) || []).forEach(function (m) { const h = m.trim(); if (notify.indexOf(h) < 0 && !(ME && ME.handle && ME.handle.toLowerCase() === h.toLowerCase())) notify.push(h); }); });
    const notifyPks = people.filter(function (x) { return x.on && /^[0-9a-f]{64}$/i.test(x.pk || ""); }).map(function (x) { return x.pk; });
    const label = texts.length > 1 ? (isReply ? "Thread of " + texts.length + " replies" : "Thread of " + texts.length + " Dreams") : what;
    const onSent = props.onSent;
    props.onClose();
    lcSendWithUndo(label, function () {
      const items = []; let firstId = null, prevId = null, prevStore = null;
      texts.forEach(function (t, i) {
        const extra = { aud: aud }; if (cwText) extra.cw = cwText; if (pv) extra.nopv = true;
        let id, store;
        if (i === 0 && !isReply) {
          if (isQuote) Object.assign(extra, { quoteOf: parent.id, qWho: who, qText: String(parent.text || "").slice(0, 280) });
          id = cherryCtx && cherryCtx.postDream ? cherryCtx.postDream(t, extra) : null; store = "dreams";
        } else {
          const toReply = i === 0 ? (parent !== root ? parent.id : undefined) : (prevStore === "replies" ? prevId : undefined);
          id = Looscid.lcAddReply(Object.assign(extra, { replyTo: isReply ? root.id : firstId, replyToReply: toReply, text: t, notify: i === 0 ? notify : undefined }));
          store = "replies";
        }
        items.push({ id: id, text: t, parentRef: i === 0 ? (isReply ? parent.id : null) : prevId, quoteRef: i === 0 && isQuote ? parent.id : null, cw: cwText, notifyPks: i === 0 ? notifyPks : [] });
        if (i === 0) firstId = id; prevId = id; prevStore = store;
      });
      lcFocusAfterPost(firstId, opener);
      if (onSent) try { onSent(firstId); } catch (e) {}
      if (pub && firstId != null && Looscid.lcNostr) setTimeout(function () { lcPublishChain(items); }, 0);
    }, texts.join("\n\n"), draftKey);
  };
  const close = function () { const o = openerRef.current; try { if (Looscid.LcSpeech) Looscid.LcSpeech.stop(); } catch (e) {} props.onClose(); setTimeout(function () { lcRefocus(o); }, 0); };
  const tryPost = function () {
    if (!canPost) return;
    const noAlt = attachments.filter(function (x) { return x.type === "photo" && !String(x.alt || "").trim(); });
    if (noAlt.length && Looscid.A11Y_NOW.altReminder !== false) { setAltAsk(true); return; }
    doPost();
  };
  const onKey = function (e) {
    if (e.key === "Escape" && !e.defaultPrevented) { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !e.altKey && !e.isComposing) { e.preventDefault(); e.stopPropagation(); tryPost(); return; }
    lcTrapComposer(e, boxRef.current);
  };
  const setAlt = function (i, v) { setAttachments(function (as) { return as.map(function (x, j) { return j === i ? Object.assign({}, x, { alt: v }) : x; }); }); };
  const suggestAlt = function (i) {
    const att = attachments[i]; if (!att) return;
    lcAltSuggest(att).then(function (s) {
      const cur = String(att.alt || "").trim(); const v = cur ? cur + " " + s : s;
      setAlt(i, v); announce("Cherry suggested: " + s + " Edit it to say what's in the photo.");
      setTimeout(function () { const f = document.getElementById("lc-alt-" + i); if (f) f.focus(); }, 30);
    });
  };
  const aiOn = !!(Looscid.lcAiOn && Looscid.lcAiOn());
  const link = Looscid.lcLinkCard ? Looscid.lcLinkCard(parts.join(" ")) : null;
  const readBack = function () {
    const t = parts.map(function (x) { return x.trim(); }).filter(Boolean);
    if (!t.length) { announce("Nothing to read yet."); return; }
    const sp = []; if (cwOn && cw.trim()) sp.push({ text: "Content warning: " + cw.trim() + "." });
    t.forEach(function (x, i) { sp.push({ text: (t.length > 1 ? Noun + " " + (i + 1) + ". " : "") + x }); });
    Looscid.LcSpeech.speak(sp);
  };
  const hearParent = function () { Looscid.LcSpeech.speak(Looscid.lcDreamSpeechParts ? Looscid.lcDreamSpeechParts(parent) : [{ text: lcParentLine(parent) }]); };
  const head = isReply ? "Reply to " + who : isQuote ? "Quote " + who + "\u2019s Dream" : "New Dream";
  const firstLabel = isReply ? "Your reply" : "Dream content";
  const tb = { type: "button", className: "lc-cr-tool" };
  const box = function (i) {
    return lh('div', { key: "box-" + i, className: "lc-cr-box" + (i ? " lc-cr-more" : "") },
      i > 0 && lh('label', { htmlFor: "cr-text-" + i, className: "lc-fs-l" }, Noun + " " + (i + 1) + " of " + parts.length),
      lh('textarea', { id: i ? "cr-text-" + i : undefined, "data-cr-box": String(i), className: "inp", style: {border:"none",background:"none",fontSize:16,padding:0,minHeight:i ? 70 : 100,lineHeight:1.65,width:"100%",resize:"none"},
        placeholder: i ? "" : isReply ? "Write your reply" : "What's on your mind?", value: parts[i],
        onFocus: function () { setActive(i); },
        onChange: function (e) { const raw = charLimit ? e.target.value.slice(0, charLimit + 20) : e.target.value; echo(parts[i], raw); setPart(i, evalInlineCalc(raw)); },
        autoFocus: i === 0 && !recover ? true : undefined, "aria-label": i ? undefined : firstLabel }),
      i > 0 && lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { removePart(i); } }, "Remove " + Noun + " " + (i + 1)));
  };
  return lh(LcComposerShell, { onClose: close, onKeyDown: onKey, boxRef: boxRef, after: [
      attach && lh(AttachPanel, { key: "attach", onClose: function () { setAttach(null); }, onAttach: function (att) { setAttachments(function (as) { return as.concat([att]); }); }, mode: isReply ? "reply" : "dream", start: attach === "poll" ? "poll" : undefined }),
      altAsk && lh(AlertDialog, { key: "alt", title: "Add alt text?", message: "Your photo has no alt text, so people using a screen reader won't know what's in it. Cancel goes back so you can add it.", confirmLabel: isReply ? "Reply anyway" : "Dream anyway",
        onCancel: function () { setAltAsk(false); setTimeout(function () { const f = document.querySelector(".lc-photo-att input"); if (f) f.focus(); }, 40); }, onConfirm: function () { setAltAsk(false); doPost(); } })] },
    /* The dialog's heading names the mode */
    lh('div', { style: {display:"flex",alignItems:"center",gap:8,padding:"14px 16px 10px",borderBottom:"1px solid var(--bd)"} },
      lh('h2', { id: "cr-dream-h", style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:17,fontWeight:400,margin:0,flex:1} }, head)),
    recover && lh('section', { className: "lc-recover", "aria-labelledby": "lc-recover-h" },
      lh('h2', { id: "lc-recover-h", className: "lc-sub-h", tabIndex: -1 }, isReply ? "Recover your reply to " + who + "?" : "Recover draft?"),
      lh('p', { className: "lc-desc" }, (isReply ? "You started a reply earlier: \u201c" : "You started a Dream earlier: \u201c") + recover.slice(0, 120) + (recover.length > 120 ? "\u2026" : "") + "\u201d"),
      lh('div', { className: "lc-inrow" },
        lh('button', { type: "button", className: "btn bp lc-btn", onClick: function () { setParts([recover]); setRecover(null); announce("Draft recovered."); focusBox(0); } }, "Recover"),
        lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { if (draftKey) lcReplyDraftSet(draftKey, ""); else try { localStorage.removeItem(LC_AUTOSAVE_KEY); } catch (e) {} setRecover(null); announce("Draft discarded."); focusBox(0); } }, "Discard"))),
    /* Reply and Quote: the Dream you answer, as plain text right before your text box (one swipe left from the box) */
    parent && lh('section', { className: "lc-cr-ctx", "aria-labelledby": "cr-ctx-h" },
      lh('h3', { id: "cr-ctx-h", className: "lc-sub-h", style: {margin:"0 0 4px"} }, isReply ? "Replying to " + who : "Quoting " + who),
      parent.cw && lh('p', { className: "lc-cw-t" }, "Content warning: " + parent.cw),
      parent.cw && lh('button', { type: "button", className: "btn bgb lc-btn", "aria-expanded": showPcw, onClick: function () { setShowPcw(!showPcw); } }, showPcw ? "Hide Dream" : "Show Dream"),
      (!parent.cw || showPcw) && lh('p', { id: "cr-parent-text", className: "lc-cr-parent" }, lcParentLine(parent))),
    /* Your text: the first box, then any more Dreams in the thread */
    lh('div', { style: {padding:"12px 16px 6px",display:"flex",gap:11,alignItems:"flex-start"} },
      lh(Av, { user: ME, size: 40 }),
      lh('div', { style: {flex:1,display:"flex",flexDirection:"column",gap:10} }, parts.map(function (_, i) { return box(i); }))),
    /* Reply: who's notified, as a list you can change (not typed handles) */
    isReply && people.length > 0 && lh('fieldset', { id: "cr-notify", className: "lc-cr-notify" },
      lh('legend', { className: "lc-fs-l" }, "Notify"),
      people.map(function (x, i) { return lh('label', { key: x.handle, className: "lc-check" },
        lh('input', { type: "checkbox", checked: x.on, onChange: function (e) { const v = e.target.checked; setPeople(function (ps) { return ps.map(function (y, j) { return j === i ? Object.assign({}, y, { on: v }) : y; }); }); } }),
        " " + x.name + (x.name !== x.handle ? " (" + x.handle + ")" : "")); })),
    isReply && people.length === 0 && lh('p', { className: "lc-desc", id: "cr-notify-none", style: {padding:"0 16px"} }, "Nobody else is notified."),
    /* Content warning text, when it's on */
    cwOn && lh('div', { className: "lc-cr-cw", style: {padding:"0 16px 8px"} },
      lh('label', { htmlFor: "cr-cw", className: "lc-fs-l" }, "Content warning text"),
      lh('input', { id: "cr-cw", type: "text", className: "lc-text", value: cw, onChange: function (e) { setCw(e.target.value.slice(0, 200)); } })),
    /* Attachments, with the alt text helper */
    attachments.length > 0 && lh('ul', { role: "list", "aria-label": "Attachments", style: {listStyle:"none",margin:0,padding:"4px 16px 8px",display:"flex",gap:7,flexWrap:"wrap"} },
      attachments.map(function (att, i) {
        const nth = attachments.slice(0, i + 1).filter(function (x) { return x.type === att.type; }).length;
        if (att.type === "photo") return lh('li', { key: i, className: "lc-photo-att" },
          lh('label', { htmlFor: "lc-alt-" + i, className: "lc-fs-l" }, "Alt text for photo " + nth),
          lh('input', { id: "lc-alt-" + i, type: "text", className: "lc-text", value: att.alt || "", placeholder: "Describe the photo", onChange: function (e) { setAlt(i, e.target.value); } }),
          !String(att.alt || "").trim() && lh('p', { className: "lc-desc lc-alt-none" }, "No alt text yet."),
          aiOn && lh('button', { type: "button", className: "btn bgb lc-btn", "aria-label": "Suggest alt text, photo " + nth, onClick: function () { suggestAlt(i); } }, "Suggest alt text"),
          lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { setAttachments(function (as) { return as.filter(function (_, j) { return j !== i; }); }); }, "aria-label": "Remove photo " + nth }, "Remove"));
        const nm = { gif: "GIF", poll: "poll", link: "link", location: "place", mood: "mood", music: "music", schedule: "schedule" }[att.type] || "attachment";
        return lh('li', { key: i, style: {display:"flex",alignItems:"center",gap:5,background:"var(--sf2)",border:"1px solid var(--bd2)",borderRadius:100,padding:"4px 10px 4px 7px",fontSize:12} },
          lh('span', { style: {color:"var(--tx2)",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"} }, att.type === "poll" ? "Poll: " + att.question : att.type === "link" ? att.url : att.type === "location" ? att.place : att.type),
          lh('button', { type: "button", onClick: function () { setAttachments(function (as) { return as.filter(function (_, j) { return j !== i; }); }); }, style: {background:"none",border:"none",cursor:"pointer",color:"var(--tx3)",padding:0,fontSize:14,lineHeight:1,minWidth:24,minHeight:24}, "aria-label": "Remove " + nm + " " + nth }, "\u2715"));
      })),
    aiOn && attachments.some(function (a) { return a.type === "photo"; }) && lh('p', { className: "lc-desc", style: {padding:"0 16px 6px",fontSize:12} }, "Suggest alt text makes a start on this device from the photo's shape, colours and name. Cherry can't see what's in it, so check and edit it."),
    /* Link preview (Round 6.5, queue #37): a plain card, made on this device */
    link && lh('div', { className: "lc-cr-link", style: {padding:"0 16px 8px"} },
      lh('p', { id: "cr-link-p", className: "lc-desc", style: {margin:"0 0 4px"} }, nopv ? "Link preview removed." : "Link preview: " + link.label + ", " + link.domain + "."),
      lh('button', { type: "button", id: "cr-link-btn", className: "btn bgb lc-btn", onClick: function () { setNopv(!nopv); announce(nopv ? "Link preview shown." : "Link preview removed."); } }, nopv ? "Show preview" : "Remove preview")),
    /* Toolbar, in Feditext's order: attachments, poll, Audience, content warning, symbols, characters left, add another */
    lh('div', { className: "lc-cr-tools lc-cr-aud", style: {display:"flex",flexWrap:"wrap",gap:4,alignItems:"center",padding:"8px 12px 4px",borderTop:"1px solid var(--bd)"} },
      lh('button', Object.assign({}, tb, { onClick: function () { setAttach("main"); }, "aria-label": "Add Photo" }), "Photo"),
      lh('button', Object.assign({}, tb, { onClick: function () { setAttach("poll"); }, "aria-label": "Add Poll" }), "Poll"),
      lh(LcMenu, { id: "cr-audience", label: "Audience", hideLabel: true, title: "Who can see this?", prefix: "Audience: ", btnClass: "btn bgb lc-aud-btn", align: "left", up: true, value: audience,
        items: [
          { id: "everyone", name: "Everyone", note: "Visible to all Dreamers" },
          { id: "followers", name: "Followers only", note: "Only your followers see this" },
          { id: "groups", name: "My Circles", note: "Shared to your Circles" },
          { id: "device", name: "Only this device", note: "Never sent anywhere" }], onSelect: function (v) { setAudience(v); } }),
      lh('label', { className: "lc-check lc-cr-tool" }, lh('input', { type: "checkbox", id: "cr-cw-on", checked: cwOn, onChange: function (e) { const v = e.target.checked; setCwOn(v); if (v) setTimeout(function () { const f = document.getElementById("cr-cw"); if (f) f.focus(); }, 30); } }), " Content warning"),
      lh('button', Object.assign({}, tb, { onClick: function () { if (window._openSymPicker) window._openSymPicker(function (s) { setPart(active, (parts[active] || "") + s); }); }, "aria-label": "Insert symbol" }), "\u03a9"),
      charLimit && lh('span', { className: "lc-cr-count", style: {fontVariantNumeric:"tabular-nums",fontSize:12,color: left < 0 ? "var(--rd)" : "var(--tx3)",fontWeight: left < 0 ? 700 : 400,marginLeft:"auto"} }, left < 0 ? -left + " over" : left + " left"),
      lh('button', Object.assign({}, tb, { onClick: addPart, "aria-label": "Add another " + noun }), lh('span', { "aria-hidden": "true" }, "+ "), Noun),
      /* Where this goes, said plainly (6.4 notes kept) */
      lh('div', { style: {flexBasis:"100%",padding:"2px 4px 0"} },
        lh('p', { id: "cr-device-note", className: "lc-desc", style: {margin:"6px 0 0",fontSize:12,color:"var(--tx3)"} }, audNote),
        widenNote && lh('p', { id: "cr-widen-note", className: "lc-desc", style: {margin:"4px 0 0",fontSize:12} }, widenNote),
        !nst.canDream && audience !== "device" && lh('p', { className: "lc-desc", style: {margin:"4px 0 0",fontSize:12} },
          lh('a', { id: "cr-nostr-link", href: "#nostr-key", className: "lc-link", onClick: function (e) { e.preventDefault(); props.onClose(); if (props.onNostrLink) props.onNostrLink(); else lcOpenNostrKey(navigate); } }, "Set up a Nostr key to Dream to everyone")),
        nst.mode === "locked" && goesToNostr && lh('div', { className: "lc-cr-unlock", style: {margin:"8px 0 0"} },
          lh('p', { className: "lc-desc", style: {margin:"0 0 4px",fontSize:12} }, "Your Nostr key is locked. Enter your passcode so this " + noun + " goes to Nostr too, or " + (isReply ? "reply" : "Dream") + " now and it's sent after you unlock."),
          lh('label', { htmlFor: "cr-pass", className: "lc-fs-l" }, "Passcode"),
          lh('div', { className: "lc-inrow" },
            lh('input', { id: "cr-pass", ref: passRef, type: "password", className: "lc-text", autoComplete: "off", autoCapitalize: "off", spellCheck: false, value: pass, onChange: function (e) { setPass(e.target.value); } }),
            lh('button', { type: "button", className: "btn bgb lc-btn", onClick: unlockKey }, "Unlock")),
          passMsg && lh('p', { className: "lid-err" }, passMsg)))),
    /* Hear, read back, and Cherry */
    lh('div', { className: "lc-inrow", style: {padding:"6px 16px",flexWrap:"wrap"} },
      parent && lh('button', { type: "button", className: "btn bgb lc-btn", id: "cr-hear", onClick: hearParent }, "Hear Dream"),
      lh('button', { type: "button", className: "btn bgb lc-btn", id: "cr-readback", onClick: readBack }, isReply ? "Read back my reply" : "Read back my Dream"),
      cherryCtx && lh('button', { type: "button", className: "cherry-compose-btn", onClick: function () { sentRef.current = true; props.onClose(); cherryCtx.openCherry(isReply ? "Draft a reply to " + who + "'s Dream: \u201c" + String(parent.text || "").slice(0, 200) + "\u201d" : "Draft a Dream for me to share"); } }, isReply ? "Ask Cherry to write this reply" : "Ask Cherry to write this Dream")),
    /* Dream (Reply in Reply mode), then Close: right after the content, as in 6.3 */
    lh('div', { style: {display:"flex",justifyContent:"flex-end",gap:8,padding:"10px 16px 6px",borderTop:"1px solid var(--bd)"} },
      lh('button', { type: "button", id: "cr-dream-btn", className: "btn bp", style: {padding:"8px 18px",fontSize:14}, onClick: tryPost, disabled: !canPost }, isReply ? "Reply" : "Dream"),
      lh('button', Object.assign({ type: "button", className: "lc-close", onClick: close }, lcCloseProps(isReply ? "reply" : isQuote ? "Quote" : "new Dream")), "Close")),
    lh('div', { style: {height:"env(safe-area-inset-bottom,8px)"} }));
}
/* --- Round 6: Blocked and muted. Saved on this device: dbm_blocked_dreamers (handles),
   dbm_blocked_circles (Circle ids) and dbm_blocked_words. Blocked words apply everywhere:
   Dreams, replies, messages, alerts, Discover, search and Commandbar. Muted words (Settings,
   Privacy, Words) apply to feeds and alerts. */
/* Round 6: a photo you add is redrawn on a canvas when "Remove location and camera details" is on
   (the default). Redrawing keeps only the pixels, so EXIF (GPS, camera, time) is gone. */
function lcPrepImage(file) {
  return new Promise(function (res, rej) {
    const r = new FileReader();
    r.onerror = rej;
    r.onload = function () {
      const src = String(r.result || ""), name = file.name || "photo";
      if ((Looscid.A11Y_NOW || {}).stripExif === false) { res({ type: "photo", src: src, name: name, stripped: false }); return; }
      const img = new Image();
      img.onerror = rej;
      img.onload = function () {
        try {
          const max = 2048, sc = Math.min(1, max / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
          const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(img.naturalWidth * sc)); c.height = Math.max(1, Math.round(img.naturalHeight * sc));
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          const png = /png|gif|webp/i.test(file.type || "");
          res({ type: "photo", src: c.toDataURL(png ? "image/png" : "image/jpeg", 0.92), name: name, stripped: true, w: c.width, h: c.height });
        } catch (e) { rej(e); }
      };
      img.src = src;
    };
    r.readAsDataURL(file);
  });
}
})(window.Looscid = window.Looscid || {});
