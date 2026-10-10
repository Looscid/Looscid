/* Looscid create.js: Create (New Dream), attachments, symbols and Drafts.
   Plain script (not a module). Everything it shares goes on window.Looscid; see FILES.md for the load order. */
(function (Looscid) {
const { AlertDialog, Av, BackHeader, CreateGroupFlow, DRAFTS_KEY, Earcon, LC_AUTOSAVE_KEY, LcMenu, ME, Modal, _optionalChain, announce, getDrafts, lcCloseProps, lcSpeechText, lh, recordHabit, useEffect, useInertBehind, useRef, useState } = Looscid;
Object.assign(Looscid, { deleteDraftItem, AttachPanel, CreateMenu, DraftsPage, evalInlineCalc, SymbolPicker, lcSendWithUndo, lcPrepImage });

function deleteDraftItem(id) {
  try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(getDrafts().filter(d => d.id !== id))); } catch (e7) {}
}
/* --- CREATE MENU ------------------------- */
function AttachPanel({onClose, onAttach, mode}) {
  // mode: "dream" or "comment"
  const [screen, setScreen] = useState("main"); // main | poll | gif | location | link
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
  ].filter(i => mode==="comment" ? ["photo","gif","link","mood"].includes(i.id) : true);

  if (screen==="poll") return (
    React.createElement(Modal, { onClose: ()=>setScreen("main"), title: "Create Poll" , subtitle: "Ask your followers a question"    ,}
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
function CreateMenu({onClose, prefs, navigate, cherryCtx}) {
  const [screen, setScreen] = useState("menu"); // menu | dream | group
  const [txt, setTxt] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [showAttach, setShowAttach] = useState(false);
  const [audience, setAudience] = useState("everyone");
  const charLimit = (prefs && prefs.charLimitEnabled) ? prefs.charLimit : null;
  const overLimit = charLimit && txt.length > charLimit;
  const canPost = txt.trim().length>0 && !overLimit;
  // Round 4: draft autosave + recover, typing echo, alt text reminder, undo send.
  const [recover, setRecover] = useState(null);
  const [altAsk, setAltAsk] = useState(false);
  useEffect(function () {
    if (screen !== "dream" || !Looscid.A11Y_NOW.draftAutosave) return;
    try { const s = localStorage.getItem(LC_AUTOSAVE_KEY); if (s && s.trim()) { setRecover(s); setTimeout(function () { const h = document.getElementById("lc-recover-h"); if (h) h.focus(); }, 80); } } catch (e) {}
  }, [screen]);
  useEffect(function () {
    if (screen !== "dream" || !Looscid.A11Y_NOW.draftAutosave || recover) return;
    const t = setTimeout(function () { try { if (txt.trim()) localStorage.setItem(LC_AUTOSAVE_KEY, txt); else localStorage.removeItem(LC_AUTOSAVE_KEY); } catch (e) {} }, 300);
    return function () { clearTimeout(t); };
  }, [txt, screen, recover]);
  const echo = function (prev, next) {
    const m = Looscid.A11Y_NOW.typingEcho; if (!m || m === "off" || next.length !== prev.length + 1) return;
    const ch = next.slice(-1), isBreak = /[\s.,!?;:]/.test(ch);
    if ((m === "words" || m === "both") && isBreak) { const w = (prev.match(/(\S+)$/) || [])[1]; if (w) { announce(lcSpeechText(w)); return; } }
    if ((m === "chars" || m === "both") && !isBreak) announce(ch);
  };
  const doPost = function () {
    const text = txt.trim(); if (!text) return;
    recordHabit("postDream", text.slice(0,30));
    try { localStorage.removeItem(LC_AUTOSAVE_KEY); } catch (e) {}
    const opener = openerRef.current;
    postedRef.current = true;
    setScreen("menu"); onClose();
    // Round 6.3: once it's dreamed, focus moves to the new Dream in the feed (or back to what opened the composer).
    lcSendWithUndo("Dream", function () { const id = cherryCtx && cherryCtx.postDream ? cherryCtx.postDream(text) : null; lcFocusAfterPost(id, opener); }, text);
  };
  // Round 6.3: the composer is a dialog. Esc closes it, Ctrl+Enter or Command+Enter dreams,
  // Tab stays inside, and closing without dreaming puts focus back on what opened it.
  const openerRef = useRef(null), postedRef = useRef(false), boxRef = useRef(null);
  if (openerRef.current === null) openerRef.current = document.activeElement || false;
  const closeDream = function () { const o = openerRef.current; onClose(); setTimeout(function () { lcRefocus(o); }, 0); };
  const onComposerKey = function (e) {
    if (e.key === "Escape" && !e.defaultPrevented) { e.preventDefault(); e.stopPropagation(); closeDream(); return; }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !e.altKey && !e.isComposing) { e.preventDefault(); e.stopPropagation(); tryPost(); return; }
    lcTrapComposer(e, boxRef.current);
  };
  const tryPost = function () {
    if (!canPost) return;
    const noAlt = attachments.filter(function (x) { return x.type === "photo" && !String(x.alt || "").trim(); });
    if (noAlt.length && Looscid.A11Y_NOW.altReminder !== false) { setAltAsk(true); return; }
    doPost();
  };

  const addAttachment = att => setAttachments(as=>[...as,att]);
  const removeAttachment = idx => setAttachments(as=>as.filter((_,i)=>i!==idx));

  const attIcon = {photo:"Photo",gif:"GIF",poll:"Poll",link:"Link",location:"Location",schedule:"Schedule",mood:"Mood",music:"Music"};
  const audiences = [
    {id:"everyone",icon:"Everyone",l:"Everyone",sub:"Visible to all Dreamors"},
    {id:"followers",icon:"Followers only",l:"Followers only",sub:"Only your followers see this"},
    {id:"groups",icon:"My Circles",l:"My Circles",sub:"Shared to your Circles"},
  ];

  if (screen==="group") return React.createElement(CreateGroupFlow, { onClose: onClose, navigate: navigate,});

  if (screen==="dream") return (
    lh(LcComposerShell, { onClose: closeDream, onKeyDown: onComposerKey, boxRef: boxRef, after: [
        showAttach&&React.createElement(AttachPanel, { key: "attach", onClose: ()=>setShowAttach(false), onAttach: addAttachment, mode: "dream",}),
        altAsk && lh(AlertDialog, { key: "alt", title: "Add alt text?", message: "Your photo has no alt text, so people using a screen reader won't know what's in it. Cancel goes back so you can add it.", confirmLabel: "Dream anyway",
          onCancel: function () { setAltAsk(false); setTimeout(function () { const f = document.querySelector(".lc-photo-att input"); if (f) f.focus(); }, 40); }, onConfirm: function () { setAltAsk(false); doPost(); } })] }
        /* Header: the dialog's heading */
        , lh('div', { style: {display:"flex",alignItems:"center",gap:8,padding:"14px 16px 10px",borderBottom:"1px solid var(--bd)"} },
            lh('h2', { id: "cr-dream-h", style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:17,fontWeight:400,margin:0,flex:1} }, "New Dream"))

        , recover && lh('section', { className: "lc-recover", "aria-labelledby": "lc-recover-h" },
            lh('h2', { id: "lc-recover-h", className: "lc-sub-h", tabIndex: -1 }, "Recover draft?"),
            lh('p', { className: "lc-desc" }, "You started a Dream earlier: “" + recover.slice(0, 120) + (recover.length > 120 ? "…" : "") + "”"),
            lh('div', { className: "lc-inrow" },
              lh('button', { type: "button", className: "btn bp lc-btn", onClick: function () { setTxt(recover); setRecover(null); announce("Draft recovered."); setTimeout(function () { const t = document.querySelector('textarea[aria-label="Dream content"]'); if (t) t.focus(); }, 30); } }, "Recover"),
              lh('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { try { localStorage.removeItem(LC_AUTOSAVE_KEY); } catch (e) {} setRecover(null); announce("Draft discarded."); setTimeout(function () { const t = document.querySelector('textarea[aria-label="Dream content"]'); if (t) t.focus(); }, 30); } }, "Discard")))
        /* Compose area */
        , React.createElement('div', { style: {padding:"12px 16px 6px",display:"flex",gap:11,alignItems:"flex-start"},}
          , React.createElement(Av, { user: ME, size: 40,})
          , React.createElement('div', { style: {flex:1},}
            , React.createElement('textarea', { className: "inp", style: {border:"none",background:"none",fontSize:16,padding:0,minHeight:100,lineHeight:1.65,width:"100%",resize:"none"},
              placeholder: "What's on your mind?"   , value: txt,
              onChange: e=>{ const raw=charLimit?e.target.value.slice(0,charLimit+20):e.target.value; echo(txt, raw); setTxt(evalInlineCalc(raw)); },
              autoFocus: true, 'aria-label': "Dream content" ,})
          )
        )

        /* Audience, with an honest note: nothing leaves this device yet (Round 6.3). */
        , lh('div', { className: "lc-cr-aud", style: {padding:"0 16px 6px"} },
            lh(LcMenu, { id: "cr-audience", label: "Audience", hideLabel: true, title: "Who can see this?", prefix: "Audience: ", btnClass: "btn bgb lc-aud-btn", align: "left", value: audience,
              items: audiences.map(function (a) { return { id: a.id, name: a.l, note: a.sub }; }), onSelect: function (v) { setAudience(v); } }),
            lh('p', { id: "cr-device-note", className: "lc-desc", style: {margin:"6px 0 0",fontSize:12,color:"var(--tx3)"} }, "For now, Dreams are saved only on this device."))

        /* Attachments preview */
        , attachments.length>0 && (
          React.createElement('ul', { role: "list", "aria-label": "Attachments", style: {listStyle:"none",margin:0,padding:"4px 16px 8px",display:"flex",gap:7,flexWrap:"wrap"},}
            , attachments.map((att,i)=>att.type==="photo" ? lh('li', { key: i, className: "lc-photo-att" },
                lh('label', { htmlFor: "lc-alt-" + i, className: "lc-fs-l" }, "Alt text for photo " + (i + 1)),
                lh('input', { id: "lc-alt-" + i, type: "text", className: "lc-text", value: att.alt || "", placeholder: "Describe the photo", onChange: function (e) { const v = e.target.value; setAttachments(function (as) { return as.map(function (x, j) { return j === i ? Object.assign({}, x, { alt: v }) : x; }); }); } }),
                lh('button', { type: "button", className: "btn bgb lc-btn", onClick: ()=>removeAttachment(i), 'aria-label': "Remove photo " + (i + 1) }, "Remove")) : (
              React.createElement('li', { key: i, style: {display:"flex",alignItems:"center",gap:5,background:"var(--sf2)",border:"1px solid var(--bd2)",borderRadius:100,padding:"4px 10px 4px 7px",fontSize:12},}
                , React.createElement('span', { "aria-hidden": "true" }, attIcon[att.type]||"📎")
                , React.createElement('span', { style: {color:"var(--tx2)",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},}
                  , att.type==="poll"?att.question:att.type==="link"?att.url:att.type==="location"?att.place:att.type
                )
                , React.createElement('button', { onClick: ()=>removeAttachment(i), style: {background:"none",border:"none",cursor:"pointer",color:"var(--tx3)",padding:0,fontSize:14,lineHeight:1}, 'aria-label': "Remove attachment" ,}, "✕")
              )
            ))
          )
        )

        /* Char count */
        , charLimit && (
          React.createElement('div', { style: {padding:"0 16px 4px",display:"flex",justifyContent:"flex-end",alignItems:"center",gap:8},}
            , React.createElement('div', { style: {position:"relative",width:22,height:22},}
              , React.createElement('svg', { viewBox: "0 0 22 22"   , width: "22", height: "22",}
                , React.createElement('circle', { cx: "11", cy: "11", r: "9", fill: "none", stroke: "var(--bd2)", strokeWidth: "2.5",})
                , React.createElement('circle', { cx: "11", cy: "11", r: "9", fill: "none", stroke: overLimit?"var(--rd)":txt.length>charLimit*.85?"#f59e0b":"var(--ac2)", strokeWidth: "2.5",
                  strokeDasharray: `${Math.min((txt.length/charLimit)*56.5,56.5)} 56.5`,
                  strokeDashoffset: "14.1", strokeLinecap: "round", transform: "rotate(-90 11 11)"  ,})
              )
            )
            , React.createElement('span', { style: {fontSize:11,color:overLimit?"var(--rd)":txt.length>charLimit*.85?"#f59e0b":"var(--tx3)",fontWeight:overLimit?700:400},}
              , overLimit?`${txt.length-charLimit} over`:`${charLimit-txt.length} left`
            )
          )
        )

        /* Toolbar */
        , React.createElement('div', { style: {display:"flex",gap:2,padding:"8px 12px 4px",borderTop:"1px solid var(--bd)"},}
          , [
            {ic:"Photo",l:"Photo"},
            {ic:"GIF",l:"GIF"},
            {ic:"Poll",l:"Poll"},
            {ic:"Link",l:"Link"},
            {ic:"Location",l:"Location"},
            {ic:"Mood",l:"Mood"},
            {ic:"Music",l:"Music"},
          ].map(t=>(
            React.createElement('button', { key: t.l, style: {background:"none",border:"none",cursor:"pointer",padding:"7px 6px",borderRadius:8,display:"flex",flexDirection:"column",alignItems:"center",gap:1,opacity:attachments.find(a=>a.type===t.l.toLowerCase())?1:.6,color:"var(--ac3)"},
              onClick: ()=>setShowAttach(true), 'aria-label': "Add "+t.l,}
              , React.createElement('span', { style: {fontSize:12},}, t.l)
            )
          ))
          , React.createElement('button', { type: "button", style: {background:"none",border:"none",cursor:"pointer",padding:"7px 6px",borderRadius:8,color:"var(--ac3)",fontSize:12}, onClick: ()=>{ if(window._openSymPicker) window._openSymPicker(s=>{setTxt(t=>t+s);}); }, 'aria-label': "Insert symbol",}, "Ω")
          , React.createElement('div', { style: {flex:1},})
        )
        /* Cherry AI writing assistant */
        , cherryCtx && (
          React.createElement('div', { style: {padding:"2px 16px 6px"},}
            , React.createElement('button', { className: "cherry-compose-btn", onClick: ()=>{postedRef.current=true;onClose();cherryCtx.openCherry("Draft a Dream for me to share");}, 'aria-label': "Ask Cherry to write a Dream"     ,}, "Ask Cherry to write this Dream"

            )
          )
        )
        /* Dream, then Close (Round 6.3: after the text box and attachments, in reading order). */
        , lh('div', { style: {display:"flex",justifyContent:"flex-end",gap:8,padding:"10px 16px 6px",borderTop:"1px solid var(--bd)"} },
            lh('button', { type: "button", id: "cr-dream-btn", className: "btn bp", style: {padding:"8px 18px",fontSize:14}, onClick: tryPost, disabled: !canPost, 'aria-label': "Dream" }, "Dream"),
            lh('button', Object.assign({ type: "button", className: "lc-close", onClick: closeDream }, lcCloseProps("new Dream")), "Close"))
        , React.createElement('div', { style: {height:"env(safe-area-inset-bottom,8px)"},})
    )
  );

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
function lcSendWithUndo(what, fn, text) {
  const s = +Looscid.A11Y_NOW.undoSend || 0;
  const send = function () { fn(); Earcon.play("send"); announce(what + " dreamed."); };
  if (!s || !Looscid.LC_UNDO_SET) { send(); return; }
  const t = setTimeout(function () { if (Looscid.LC_UNDO_SET) Looscid.LC_UNDO_SET(null); send(); }, s * 1000);
  Looscid.LC_UNDO_SET({ id: Date.now(), what: what, secs: s, cancel: function () { clearTimeout(t); if (Looscid.LC_UNDO_SET) Looscid.LC_UNDO_SET(null); if (text) { try { localStorage.setItem(LC_AUTOSAVE_KEY, text); } catch (e) {} } announce(what + " not sent." + (text ? " Open New Dream to recover it." : "")); } });
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
