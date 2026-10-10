/* Looscid cherry.js: Cherry, the assistant overlay.
   Plain script (not a module). Everything it shares goes on window.Looscid; see FILES.md for the load order. */
(function (Looscid) {
const { AlertDialog, Ic, LC_PLACES, LcMenu, LcSpeech, USERS, a11yEnterSends, announce, getAIPrefs, lcA11yIntent, lcApplyFeedIntent, lcCloseProps, lcExtraIntent, lcFeedIntent, lcFeedLabel, lh, setAIPrefs, useEffect, useRef, useState } = Looscid;
Object.assign(Looscid, { CherryPage, CherryOverlay, lcLlmPrefs, lcLlmSetPrefs, lcLlmGpu, lcLlmLoad, lcLlmAsk, CherryModelPicker, SourcesPanel, cherryNorm, cherryRespond });

function CherryPage({navigate, cherryCtx}) {
  // CherryPage is now a rich hub - shows live stats, action log preview, and opens the full overlay agent
  const log = cherryCtx ? (cherryCtx.cherryLog||[]) : [];
  const ctx = cherryCtx ? {
    likedCount: cherryCtx.dreams.filter(d=>d.liked).length,
    savedCount: cherryCtx.dreams.filter(d=>d.bookmarked).length,
    followingCount: cherryCtx.following.size,
    groupCount: cherryCtx.groups.filter(g=>g.joined).length,
    unread: cherryCtx.notifs.filter(n=>n.unread).length,
  } : {likedCount:0,savedCount:0,followingCount:0,groupCount:0,unread:0};

  const capabilities = [
    {ic:"Draft & share Dreams", label:"Draft & share Dreams", prompt:"Draft a Dream for me"},
    {ic:"Follow Dreamors", label:"Follow Dreamors", prompt:"Who should I follow?"},
    {ic:"Join Circles", label:"Join Circles", prompt:"Find groups for me"},
    {ic:"Read notifications", label:"Read notifications", prompt:"My notifications"},
    {ic:"Feed insights", label:"Feed insights", prompt:"Summarise my feed"},
    {ic:"Trending topics", label:"Trending topics", prompt:"What's trending?"},
  ];

  return (
    React.createElement('div', { className: "pg",}
      , React.createElement('div', { className: "hdr",}
        , React.createElement('div', { className: "hdr-row",}
          , React.createElement('button', { className: "bi", onClick: ()=>navigate("more"), 'aria-label': "Back",}, React.createElement(Ic.Bck, { style: {width:21,height:21},}))
          , React.createElement('span', { className: "hdr-title",}, "Cherry")
          , React.createElement('div', { style: {width:8,height:8,borderRadius:"50%",background:"var(--gr)",boxShadow:"0 0 8px var(--gr)"},})
        )
      )

      /* Hero */
      , React.createElement('div', { style: {textAlign:"center",padding:"24px 20px 20px",borderBottom:"1px solid var(--bd)"},}
        , React.createElement('div', { className: "aiorb", style: {width:64,height:64,fontSize:30,margin:"0 auto 12px"},}, "Cherry")
        , React.createElement('div', { style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:22,marginBottom:4},}, "Cherry AI Agent"  )
        , React.createElement('div', { style: {fontSize:12,color:"var(--gr)",display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:12},}
          , React.createElement('span', { style: {width:6,height:6,borderRadius:"50%",background:"var(--gr)",display:"inline-block"},}), "Connected, Real actions, Live app state"

        )
        , React.createElement('button', { className: "btn bp" , style: {padding:"11px 28px",fontSize:15}, onClick: ()=>cherryCtx&&cherryCtx.openCherry(), 'aria-label': "Open Cherry chat"  ,}, "Open Cherry"

        )
      )

      /* Live stats Cherry can see */
      , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "What Cherry can see"   )
      , React.createElement('div', { style: {display:"flex",flexWrap:"wrap",gap:10,padding:"0 14px 14px"},}
        , [
          {ic:"❤️", val:ctx.likedCount, label:"Liked Dreams"},
          {ic:"Save", val:ctx.savedCount, label:"Saved Dreams"},
          {ic:"👥", val:ctx.followingCount, label:"Following"},
          {ic:"Joined", val:ctx.groupCount, label:"Circles"},
          {ic:"🔔", val:ctx.unread, label:"Unread alerts"},
          {ic:"✏️", val:cherryCtx?cherryCtx.dreams.length:0, label:"Dreams in feed"},
        ].map(s=>(
          React.createElement('div', { key: s.label, style: {flex:"1 1 calc(33% - 10px)",background:"var(--sf2)",border:"1px solid var(--bd)",borderRadius:12,padding:"10px 12px",textAlign:"center"},}
            , React.createElement('div', { style: {fontSize:20,marginBottom:4},}, s.ic)
            , React.createElement('div', { style: {fontWeight:800,fontSize:18,color:"var(--tx)"},}, s.val)
            , React.createElement('div', { style: {fontSize:10,color:"var(--tx3)",marginTop:1},}, s.label)
          )
        ))
      )

      /* Capabilities */
      , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "What Cherry can do"   )
      , React.createElement('div', { style: {padding:"0 14px 14px",display:"flex",flexDirection:"column",gap:8},}
        , capabilities.map(cap=>(
          React.createElement('button', { key: cap.label, style: {display:"flex",alignItems:"center",gap:12,background:"var(--sf2)",border:"1px solid var(--bd)",borderRadius:12,padding:"11px 14px",cursor:"pointer",textAlign:"left",width:"100%",fontFamily:"inherit"},
            onClick: ()=>cherryCtx&&cherryCtx.openCherry(cap.prompt), 'aria-label': "Ask Cherry: "+cap.prompt,}
            , React.createElement('div', { style: {width:36,height:36,borderRadius:10,background:"rgba(168,85,247,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0},}, cap.ic)
            , React.createElement('div', { style: {flex:1},}
              , React.createElement('div', { style: {fontWeight:600,fontSize:14,color:"var(--tx)"},}, cap.label)
            )
            , React.createElement(Ic.Chv, { style: {width:14,height:14,color:"var(--tx3)"},})
          )
        ))
      )

      /* Recent actions */
      , log.length > 0 && React.createElement(React.Fragment, null
        , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "Recent actions" )
        , React.createElement('div', { className: "cherry-action-log",}
          , log.slice(0,5).map((entry,i)=>(
            React.createElement('div', { key: entry.id, className: "cherry-log-item",}
              , React.createElement('div', { className: "cherry-log-ic",}, entry.ic)
              , React.createElement('div', { style: {flex:1},}
                , React.createElement('div', { style: {fontWeight:600,color:"var(--tx)"},}, entry.text)
                , React.createElement('div', { style: {fontSize:10,color:"var(--tx3)"},}, new Date(entry.id).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}))
              )
            )
          ))
          , log.length > 5 && React.createElement('div', { style: {textAlign:"center",padding:"10px",fontSize:12,color:"var(--tx3)"},}, log.length-5, " more in Cherry agent view"     )
        )
      )

      /* CherrySettings shortcut */
      , React.createElement('div', { style: {padding:"14px 14px 8px"},}
        , React.createElement('button', { style: {display:"flex",alignItems:"center",gap:12,background:"none",border:"1px solid var(--bd2)",borderRadius:12,padding:"11px 14px",cursor:"pointer",width:"100%",fontFamily:"inherit"},
          onClick: ()=>navigate("settings_intelligence"), 'aria-label': "Intelligence settings" ,}
          , React.createElement('span', { style: {fontSize:18},}, "Settings")
          , React.createElement('div', { style: {flex:1,textAlign:"left"},}
            , React.createElement('div', { style: {fontWeight:600,fontSize:14,color:"var(--tx)"},}, "Cherry Settings" )
            , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",marginTop:1},}, "Agent permissions, memory, privacy"   )
          )
          , React.createElement(Ic.Chv, { style: {width:14,height:14,color:"var(--tx3)"},})
        )
      )
    )
  );
}
/* --- CHERRY OVERLAY ---------------------- */
function CherryOverlay({onClose, cherryCtx, initMsg, navigate}) {
  const INIT = {me:false, text:"Hey! I'm Cherry — your Looscid AI Agent. I can see your feed, your Groups, your notifications, and I can take actions for you. What would you like to do?"};
  const [msgs, setMsgs] = useState([INIT]);
  const [inp, setInp] = useState(initMsg||"");
  const [typing, setTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  // Speech > "Read Cherry's answers aloud"
  useEffect(function () { const m = msgs[msgs.length - 1]; if (msgs.length > 1 && m && !m.me && m.text && Looscid.A11Y_NOW.cherryAloud) LcSpeech.speak([{ text: m.text }]); }, [msgs.length]);
  const [agentTask, setAgentTask] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // {label, fn}
  const endRef = useRef(null);

  const {dreams, following, groups, notifs, likeDream, saveDream, postDream, followUser, joinGroup, markNotifsRead, openCherry} = cherryCtx;

  // Build real context string from live app state
  const appContext = () => {
    const likedDreams = dreams.filter(d=>d.liked).map(d=>d.user.name+"'s dream").join(", ") || "none yet";
    const savedDreams = dreams.filter(d=>d.bookmarked).map(d=>d.user.name+"'s dream").join(", ") || "none yet";
    const followingNames = USERS.filter(u=>following.has(u.id)).map(u=>u.name).join(", ") || "no one yet";
    const joinedGroups = groups.filter(g=>g.joined).map(g=>g.name).join(", ") || "none yet";
    const unread = notifs.filter(n=>n.unread).length;
    return {likedDreams, savedDreams, followingNames, joinedGroups, unread};
  };

  // Rich agentic response engine - reads real app state
  const getResponse = text => cherryRespond(text, cherryCtx);

  const send = t => {
    const msg = t||inp;
    if (!msg.trim()) return;
    setMsgs(m=>[...m,{me:true,text:msg}]);
    setInp("");
    const resp = getResponse(msg);
    // A chosen on-device model answers the open questions Cherry's own rules don't cover.
    const pm = lcLlmPrefs().model;
    if (resp.fallback && pm !== "builtin" && lcLlmGpu()) {
      setTyping(true);
      (LC_LLM.engine && LC_LLM.id === pm ? Promise.resolve() : lcLlmLoad(pm)).then(function () { return lcLlmAsk(msg); })
        .then(function (t) { setTyping(false); setMsgs(m=>[...m,{me:false,text:t}]); }, function () { setTyping(false); setMsgs(m=>[...m,{me:false,text:resp.result}]); });
      return;
    }
    if (resp.autoFn) {
      // Immediate action - no confirm needed
      setAgentTask(resp.agentLabel||"Working…");
      setAgentStatus("running");
      setTimeout(()=>{
        resp.autoFn();
        setAgentStatus("done");
        setTimeout(()=>{
          setAgentStatus(null); setAgentTask("");
          setMsgs(m=>[...m,{me:false,text:resp.result,agent:true,draft:resp.draft||null}]);
        },500);
      },1600);
    } else if (resp.action) {
      // Agentic with optional confirm button
      setAgentTask(resp.agentLabel||"Working…");
      setAgentStatus("running");
      setTimeout(()=>{
        setAgentStatus("done");
        setTimeout(()=>{
          setAgentStatus(null); setAgentTask("");
          setMsgs(m=>[...m,{me:false,text:resp.result,agent:true,confirm:resp.confirm||null,draft:resp.draft||null}]);
        },500);
      },1800);
    } else {
      setTyping(true);
      setTimeout(()=>{setTyping(false);setMsgs(m=>[...m,{me:false,text:resp.result}]);},900+Math.random()*600);
    }
  };

  useEffect(()=>{endRef.current && endRef.current.scrollIntoView({behavior:"smooth"});},[msgs,typing,agentStatus]);
  useEffect(()=>{ if(initMsg){send(initMsg);} },[]);

  const chips = ["Summarise my feed","What's trending?","Draft a Dream","Who should I follow?","Find groups","My notifications"];
  const [overlayTab, setOverlayTab] = useState("chat"); // "chat" | "actions"
  const actionLog = cherryCtx.cherryLog || [];

  const histSessions = [
    {id:1,title:"Feed Summary",preview:"You have 3 unread notifications…",date:"Today"},
    {id:2,title:"Group Recommendations",preview:"I'd recommend Consciousness Lab…",date:"Yesterday"},
    {id:3,title:"Dream Drafted",preview:"Here's a draft: The mind doesn't just…",date:"Feb 20"},
  ];

  if (showHistory) return (
    React.createElement('div', { className: "ov", style: {alignItems:"stretch"},}
      , React.createElement('div', { style: {flex:1,background:"var(--bg)",display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto",width:"100%"},}
        , React.createElement('div', { className: "hdr", style: {position:"sticky",top:0},}
          , React.createElement('div', { className: "hdr-row",}
            , React.createElement('button', { className: "bi", onClick: ()=>setShowHistory(false), 'aria-label': "Back",}, React.createElement(Ic.Bck, { style: {width:21,height:21},}))
            , React.createElement('span', { className: "hdr-title",}, "Chat History" )
            , React.createElement('button', { style: {background:"none",border:"none",cursor:"pointer",fontSize:12,color:"var(--rd)",padding:"4px 8px"}, 'aria-label': "Clear all" ,}, "Clear All" )
          )
        )
        , React.createElement('div', { style: {flex:1,overflowY:"auto"},}
          , histSessions.map(s=>(
            React.createElement('button', { key: s.id, onClick: ()=>setShowHistory(false), style: {display:"flex",gap:12,padding:"13px 16px",borderBottom:"1px solid var(--bd)",background:"none",border:"none",borderBottom:"1px solid var(--bd)",width:"100%",cursor:"pointer",textAlign:"left"},}
              , React.createElement('div', { className: "aiorb", style: {width:38,height:38,fontSize:17,flexShrink:0},}, "Cherry")
              , React.createElement('div', { style: {flex:1,minWidth:0},}
                , React.createElement('div', { style: {fontWeight:700,fontSize:14,marginBottom:3,color:"var(--tx)"},}, s.title)
                , React.createElement('div', { style: {fontSize:12,color:"var(--tx3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},}, s.preview)
                , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",marginTop:4},}, s.date)
              )
              , React.createElement(Ic.Chv, { style: {width:15,height:15,color:"var(--tx3)",flexShrink:0,alignSelf:"center"},})
            )
          ))
        )
      )
    )
  );

  return (
    React.createElement('div', { className: "ov", style: {alignItems:"stretch"},}
      , React.createElement('div', { style: {flex:1,background:"var(--bg)",display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto",width:"100%",paddingBottom:"env(safe-area-inset-bottom)"},}
        /* Header */
        , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,padding:"52px 14px 10px",borderBottom:"1px solid var(--bd)",background:"rgba(7,5,15,.95)"},}
          , React.createElement('button', { className: "bi", onClick: onClose, 'aria-label': "Back" ,}, React.createElement(Ic.Bck, { style: {width:21,height:21},}))
          , React.createElement('div', { className: "aiorb", style: {width:32,height:32,fontSize:15,flexShrink:0},}, "Cherry")
          , React.createElement('div', { style: {flex:1},}
            , React.createElement('div', { style: {fontWeight:700,fontSize:15,color:"var(--tx)"},}, "Cherry")
            , React.createElement('div', { style: {fontSize:10,color:"var(--gr)",display:"flex",alignItems:"center",gap:4},}
              , React.createElement('span', { style: {width:5,height:5,borderRadius:"50%",background:"var(--gr)",display:"inline-block"},}), "AI Agent, Connected to your Looscid"
            )
          )
          , React.createElement('button', { className: "bi", onClick: ()=>setShowHistoryDialog(true), 'aria-label': "History and new conversation", title: "History / New chat",}
            , React.createElement('svg', { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"},
              React.createElement('path', {d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"})
            )
          )
          , React.createElement('button', Object.assign({ type: "button", className: "lc-close", onClick: onClose }, lcCloseProps("Cherry")), "Close")
        )

        /* History / New conversation dialog at top */
        , showHistoryDialog && React.createElement('div', {
            style: {position:"absolute",top:80,left:12,right:12,zIndex:200,
              background:"var(--sf)",border:"1px solid var(--bd2)",borderRadius:14,
              boxShadow:"0 4px 24px rgba(0,0,0,.45)",padding:"6px 0 4px",
              animation:"fu .18s ease"},
            role: "dialog", 'aria-label': "Chat options",}
          , React.createElement('div', {style:{padding:"8px 16px 8px",fontSize:11,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".08em"}}, "Cherry Chat")
          , React.createElement('button', {
              onClick: ()=>{setShowHistoryDialog(false);setShowHistory(true);},
              style: {display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 16px",
                background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",borderTop:"1px solid var(--bd)"},
              'aria-label': "View chat history",}
            , React.createElement('span', {style:{fontSize:18},}, "🕐")
            , React.createElement('div', {style:{textAlign:"left"}},
              React.createElement('div', {style:{fontSize:14,fontWeight:600,color:"var(--tx)"}}, "Chat History"),
              React.createElement('div', {style:{fontSize:12,color:"var(--tx3)"}}, "View past conversations")
            )
          )
          , React.createElement('button', {
              onClick: ()=>{setShowHistoryDialog(false);setMsgs([{me:false,text:"Hey! I am Cherry — starting a new conversation. What would you like to do?"}]);},
              style: {display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 16px",
                background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",borderTop:"1px solid var(--bd)"},
              'aria-label': "Start a new conversation",}
            , React.createElement('span', {style:{fontSize:18},}, "✏️")
            , React.createElement('div', {style:{textAlign:"left"}},
              React.createElement('div', {style:{fontSize:14,fontWeight:600,color:"var(--tx)"}}, "New Conversation"),
              React.createElement('div', {style:{fontSize:12,color:"var(--tx3)"}}, "Clear history, start fresh")
            )
          )
          , React.createElement('button', {
              onClick: ()=>setShowHistoryDialog(false),
              style: {display:"block",width:"calc(100% - 28px)",margin:"8px 14px 6px",padding:"10px",
                background:"var(--sf2)",border:"none",borderRadius:10,fontSize:14,
                fontWeight:600,color:"var(--tx3)",cursor:"pointer",fontFamily:"inherit"},
              'aria-label': "Cancel",}, "Cancel")
        )

        /* Click outside to close history dialog */
        , showHistoryDialog && React.createElement('div', {
            onClick: ()=>setShowHistoryDialog(false),
            style: {position:"absolute",inset:0,zIndex:199},
            'aria-hidden': "true",})

        /* Quick status strip */
        , React.createElement('div', { style: {display:"flex",gap:7,padding:"8px 14px",overflowX:"auto",scrollbarWidth:"none",borderBottom:"1px solid var(--bd)",background:"var(--sf)"},}
          , [
            {label:`${appContext().unread}`, color:"var(--rd)", ic:"Alerts"},
            {label:`${groups.filter(g=>g.joined).length}`, color:"var(--ac3)", ic:"Groups"},
            {label:`${following.size}`, color:"var(--ac3)", ic:"Following"},
            {label:`${dreams.filter(d=>d.liked).length}`, color:"var(--rd)", ic:"Likes"},
          ].map(s=>(
            React.createElement('div', { key: s.label, style: {display:"flex",alignItems:"center",gap:4,background:"var(--sf2)",border:"1px solid var(--bd)",borderRadius:100,padding:"3px 9px",whiteSpace:"nowrap",flexShrink:0},}
              , React.createElement('span', { style: {fontSize:11},}, s.ic)
              , React.createElement('span', { style: {fontSize:11,color:s.color,fontWeight:600},}, s.label)
            )
          ))
        )

        /* Chat / Actions tabs */
        , React.createElement('div', { style: {display:"flex",borderBottom:"1px solid var(--bd)"},}
          , React.createElement('button', { onClick: ()=>setOverlayTab("chat"), style: {flex:1,background:"none",border:"none",padding:"9px 0",fontSize:13,fontWeight:600,color:overlayTab==="chat"?"var(--ac3)":"var(--tx3)",borderBottom:overlayTab==="chat"?"2px solid var(--ac2)":"2px solid transparent",marginBottom:-1,cursor:"pointer",fontFamily:"inherit"},}, "Chat" )
          , React.createElement('button', { onClick: ()=>setOverlayTab("actions"), style: {flex:1,background:"none",border:"none",padding:"9px 0",fontSize:13,fontWeight:600,color:overlayTab==="actions"?"var(--ac3)":"var(--tx3)",borderBottom:overlayTab==="actions"?"2px solid var(--ac2)":"2px solid transparent",marginBottom:-1,cursor:"pointer",fontFamily:"inherit"},}, "Actions "
              , actionLog.length>0&&React.createElement('span', { style: {background:"var(--gr)",color:"#000",borderRadius:100,fontSize:9,fontWeight:800,padding:"1px 5px",marginLeft:3},}, actionLog.length)
          )
        )
        /* Suggestion chips - only in chat tab */
        , overlayTab==="chat" && React.createElement('div', { style: {display:"flex",gap:6,padding:"8px 12px",overflowX:"auto",scrollbarWidth:"none",borderBottom:"1px solid var(--bd)"},}
          , chips.map(s=>React.createElement('button', { key: s, className: "aisc", onClick: ()=>send(s), style: {flexShrink:0}, 'aria-label': "Ask: "+s,}, s))
        )

        /* Agent status */
        , agentStatus && overlayTab==="chat" && (
          React.createElement('div', { style: {margin:"8px 12px 0",padding:"9px 12px",background:"rgba(168,85,247,.1)",border:"1px solid rgba(168,85,247,.22)",borderRadius:10,display:"flex",alignItems:"center",gap:8},}
            , React.createElement('div', { style: {display:"flex",gap:3},}
              , [0,1,2].map(i=>React.createElement('div', { key: i, className: "tdt", style: {animationDelay:i*.15+"s",background:"var(--ac)"},}))
            )
            , React.createElement('div', { style: {flex:1},}
              , React.createElement('div', { style: {fontSize:12,fontWeight:700,color:"var(--ac)"},}, agentStatus==="done"?"Done":"Cherry is acting…")
              , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)"},}, agentTask)
            )
          )
        )

        /* Action log tab */
        , overlayTab==="actions" && (
          React.createElement('div', { className: "msgs", style: {flex:1},}
            , actionLog.length===0 && (
              React.createElement('div', { className: "es", style: {paddingTop:32},}
                , React.createElement('div', { className: "esi",}, "No actions yet")
                , React.createElement('div', { className: "esl",}, "No actions yet"  )
                , React.createElement('p', { style: {fontSize:12,color:"var(--tx3)",marginTop:6},}, "Cherry will log every action it takes here. You can undo most actions."            )
                , React.createElement('button', { className: "cherry-card-act", style: {marginTop:12}, onClick: ()=>setOverlayTab("chat"),}, "Start chatting with Cherry"   )
              )
            )
            , actionLog.map((entry,i)=>(
              React.createElement('div', { key: entry.id, className: "cherry-log-item",}
                , React.createElement('div', { className: "cherry-log-ic",}, entry.ic)
                , React.createElement('div', { style: {flex:1},}
                  , React.createElement('div', { style: {fontWeight:600,color:"var(--tx)",marginBottom:1},}, entry.text)
                  , React.createElement('div', { style: {fontSize:10,color:"var(--tx3)"},}, new Date(entry.id).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}))
                )
                , entry.undoFn && !entry.undone && (
                  React.createElement('button', { className: "cherry-log-undo", onClick: ()=>{entry.undoFn();setCherryLog(l=>l.map((x,j)=>j===i?{...x,undone:true}:x));}, 'aria-label': "Undo "+entry.text,}, "Undo")
                )
                , entry.undone && React.createElement('span', { style: {fontSize:10,color:"var(--tx3)",marginLeft:"auto"},}, "Undone")
              )
            ))
          )
        )

        /* Messages */
        , overlayTab==="chat" && React.createElement('div', { className: "msgs", style: {flex:1},}
          , msgs.map((m,i)=>(
            React.createElement('div', { key: i, className: "mr"+(m.me?" me":""),}
              , !m.me && React.createElement('div', { className: "aiorb", style: {width:27,height:27,fontSize:13,flexShrink:0},}, "Cherry")
              , React.createElement('div', { style: {maxWidth:"82%"},}
                , React.createElement('div', { className: "bub"+(m.me?" me":" th"), style: m.agent?{border:"1px solid rgba(168,85,247,.28)",background:"rgba(109,40,217,.08)",whiteSpace:"pre-line"}:{whiteSpace:"pre-line"},}
                  , m.agent && React.createElement('div', { style: {fontSize:9,fontWeight:800,color:"var(--ac3)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:5},}, "Agent action"  )
                  , m.text
                )
                , m.confirm && (
                  React.createElement('button', { className: "agent-action-pill", onClick: ()=>{m.confirm.fn();setMsgs(ms=>ms.map((x,j)=>j===i?{...x,confirm:null}:x));setMsgs(ms=>[...ms,{me:false,text:"Done Action completed!",agent:true}]);}, 'aria-label': m.confirm.label,}, "⚡ "
                     , m.confirm.label
                  )
                )
              )
            )
          ))
          , typing && (
            React.createElement('div', { className: "mr",}
              , React.createElement('div', { className: "aiorb", style: {width:27,height:27,fontSize:13,flexShrink:0},}, "Cherry")
              , React.createElement('div', { className: "bub th" , style: {display:"flex",gap:4,alignItems:"center",padding:"11px 14px"},}
                , [0,1,2].map(i=>React.createElement('div', { key: i, className: "tdt", style: {animationDelay:i*.2+"s"},}))
              )
            )
          )
          , React.createElement('div', { ref: endRef,})
        )

        /* Input - only in chat tab */
        , overlayTab==="chat" && React.createElement('div', { className: "cir", style: {background:"var(--sf)",borderTop:"1px solid var(--bd2)"},}
          , React.createElement('input', { className: "inp", style: {borderRadius:100,flex:1,fontSize:14}, placeholder: "Ask Cherry or give a command…"     ,
            value: inp, onChange: e=>setInp(e.target.value), onKeyDown: e=>e.key==="Enter"&&a11yEnterSends()&&send(), 'aria-label': "Message Cherry" ,})
          , React.createElement('button', { className: "btn bp" , style: {padding:9,borderRadius:"50%",width:38,height:38,flexShrink:0}, onClick: ()=>send(), disabled: !inp.trim(), 'aria-label': "Send",}
            , React.createElement(Ic.Snd, { style: {width:15,height:15},})
          )
        )
      )
    )
  );
}
// "visible" | "private" | "hidden"


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

    if (lo.includes("find group") || lo.includes("suggest group") || lo.includes("recommend group")) {
      const unjoined = groups.filter(g=>!g.joined);
      if (!unjoined.length) return {action:null, result:"You've joined all available Circles."};
      const picks = unjoined.slice(0,2).map(g=>`${g.emoji} ${g.name} — ${g.description.slice(0,50)}…`).join("\n");
      return {action:"Scanning groups that match your interests…", agentLabel:"Finding groups",
        result:`Groups I'd recommend for you:

${picks}

Want me to join any of these?`,
        confirm:{label:"Join these groups", fn:()=>unjoined.slice(0,2).forEach(g=>joinGroup(g.id))}};
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
