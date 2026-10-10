/* Looscid circles.js: Circles (create a Circle, a Circle's page, its admin settings, the Circles list).
   Still drawn with React, like the tabs not yet rewritten. Plain script (not a module); see FILES.md. */
(function (Looscid) {
const { Av, Cbx, CommentView, DreamCard, GROUPS, Ic, ME, Modal, fmt, lcCloseProps, useDreams, useState } = Looscid;
Object.assign(Looscid, { CreateGroupFlow, GroupDetailPage, GroupAdminModal, GroupsPage });

function CreateGroupFlow({onClose, navigate}) {
  const [step, setStep] = useState(1); // 1=basics, 2=settings, 3=rules
  const [form, setForm] = useState({name:"",description:"",category:"",emoji:"🌙",privacy:"public",joinApproval:false,postApproval:false,minAge:false,rules:["Be kind and respectful","Stay on topic","No spam or self-promotion"]});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const categories = ["Science","Creative","Philosophy","Wellness","Technology","Art","Music","Sports","Discussion","Other"];
  const emojis = ["🌙","🧠","🎨","🔭","🌿","💡","✨","🔥","💎","🌊","⚡","🎯"];
  const canNext1 = form.name.trim().length>2 && form.category;

  if (step===3) return (
    React.createElement('div', { className: "ov", onClick: e=>e.target===e.currentTarget&&onClose(),}
      , React.createElement('div', { className: "msh",}
        , React.createElement('div', { className: "mhd",})
        , React.createElement('div', { className: "min",}
          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:16},}
            , React.createElement('button', { className: "bi", onClick: ()=>setStep(2), 'aria-label': "Back",}, React.createElement(Ic.Bck, { style: {width:18,height:18},}))
            , React.createElement('div', { className: "mtt", style: {margin:0},}, "Circle Rules" )
            , React.createElement('span', { style: {marginLeft:"auto",fontSize:11,color:"var(--tx3)"},}, "Step 3/3" )
          )
          , React.createElement('p', { style: {fontSize:12,color:"var(--tx2)",lineHeight:1.6,marginBottom:14},}, "Rules help your community stay healthy. Dreamors agree to these when joining."           )
          , form.rules.map((rule,i)=>(
            React.createElement('div', { key: i, style: {display:"flex",gap:8,marginBottom:8,alignItems:"center"},}
              , React.createElement('div', { style: {width:22,height:22,borderRadius:"50%",background:"var(--ac)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700,flexShrink:0},}, i+1)
              , React.createElement('input', { className: "inp", style: {flex:1,fontSize:13}, value: rule, onChange: e=>set("rules",form.rules.map((r,j)=>j===i?e.target.value:r)), 'aria-label': "Rule "+(i+1),})
              , form.rules.length>1&&React.createElement('button', { className: "bi", style: {padding:2,flexShrink:0}, onClick: ()=>set("rules",form.rules.filter((_,j)=>j!==i)), 'aria-label': "Remove rule" ,}, React.createElement('span', { style: {color:"var(--tx3)",fontSize:14},}, "✕"))
            )
          ))
          , form.rules.length<8&&React.createElement('button', { className: "btn bgb" , style: {width:"100%",padding:9,fontSize:12,marginBottom:16}, onClick: ()=>set("rules",[...form.rules,""]),}, "+ Add Rule"  )
          , React.createElement('button', { className: "btn bp" , style: {width:"100%",padding:13,fontSize:14}, onClick: ()=>{onClose();}, 'aria-label': "Create Circle" ,}, "Create Circle"  )
        )
      )
    )
  );

  if (step===2) return (
    React.createElement('div', { className: "ov", onClick: e=>e.target===e.currentTarget&&onClose(),}
      , React.createElement('div', { className: "msh",}
        , React.createElement('div', { className: "mhd",})
        , React.createElement('div', { className: "min",}
          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:16},}
            , React.createElement('button', { className: "bi", onClick: ()=>setStep(1), 'aria-label': "Back",}, React.createElement(Ic.Bck, { style: {width:18,height:18},}))
            , React.createElement('div', { className: "mtt", style: {margin:0},}, "Circle Settings" )
            , React.createElement('span', { style: {marginLeft:"auto",fontSize:11,color:"var(--tx3)"},}, "Step 2/3" )
          )
          , React.createElement('h2', { className: "slbl", style: {padding:"0 0 8px"}, role: "heading", 'aria-level': "2",}, "Privacy")
          , [{id:"public",icon:"Public",l:"Public",sub:"Anyone can find and join"},{id:"private",icon:"Private",l:"Private",sub:"Invite-only, hidden from Discover"},{id:"restricted",icon:"Restricted",l:"Restricted",sub:"Visible but requires approval to join"}].map(p=>(
            React.createElement('button', { key: p.id, className: "osb", onClick: ()=>set("privacy",p.id), 'aria-label': p.l,}
              , React.createElement('span', { style: {fontSize:18},}, p.icon)
              , React.createElement('div', { style: {flex:1},}, React.createElement('div', { style: {fontWeight:form.privacy===p.id?700:400,color:form.privacy===p.id?"var(--tx)":"var(--tx2)"},}, p.l), React.createElement('div', { style: {fontSize:12,color:"var(--tx3)",marginTop:2},}, p.sub))
              , form.privacy===p.id&&React.createElement('span', { style: {color:"var(--ac3)",fontSize:16},}, "✓")
            )
          ))
          , React.createElement('h2', { className: "slbl", style: {padding:"12px 0 8px"}, role: "heading", 'aria-level': "2",}, "Moderation")
          , [{k:"joinApproval",l:"Approve new Dreamors",d:"Review and approve each join request"},{k:"postApproval",l:"Approve Dreams",d:"Dreams require admin approval before publishing"},{k:"minAge",l:"18+ only",d:"Restrict group to adult Dreamors"}].map(r=>(
            React.createElement('div', { key: r.k, className: "sr",}
              , React.createElement('div', null, React.createElement('div', { className: "sr-title",}, r.l), React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",marginTop:3},}, r.d))
              , React.createElement(Cbx, { on: form[r.k], onToggle: ()=>set(r.k,!form[r.k]), label: r.l,})
            )
          ))
          , React.createElement('button', { className: "btn bp" , style: {width:"100%",padding:12,marginTop:10,fontSize:14}, onClick: ()=>setStep(3),}, "Next: Circle Rules →"   )
        )
      )
    )
  );

  // Step 1
  return (
    React.createElement('div', { className: "ov", onClick: e=>e.target===e.currentTarget&&onClose(),}
      , React.createElement('div', { className: "msh",}
        , React.createElement('div', { className: "mhd",})
        , React.createElement('div', { className: "min",}
          , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:8,marginBottom:16},}
            , React.createElement('button', Object.assign({ type: "button", className: "lc-close", onClick: onClose }, lcCloseProps("new Circle")), "Close")
            , React.createElement('div', { className: "mtt", style: {margin:0},}, "New Circle" )
            , React.createElement('span', { style: {marginLeft:"auto",fontSize:11,color:"var(--tx3)"},}, "Step 1/3" )
          )
          , React.createElement('div', { style: {textAlign:"center",marginBottom:16},}
            , React.createElement('div', { style: {fontSize:48,marginBottom:8},}, form.emoji)
            , React.createElement('div', { style: {display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"},}
              , emojis.map(e=>(
                React.createElement('button', { key: e, style: {background:form.emoji===e?"var(--ac)":"var(--sf2)",border:"1px solid"+(form.emoji===e?"var(--ac)":"var(--bd)"),borderRadius:8,width:34,height:34,fontSize:18,cursor:"pointer"}, onClick: ()=>set("emoji",e), 'aria-label': "Choose "+e,}, e)
              ))
            )
          )
          , React.createElement('div', { style: {marginBottom:12},}
            , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6},}, "Circle Name *"  )
            , React.createElement('input', { className: "inp", placeholder: "e.g. Consciousness Lab"  , value: form.name, onChange: e=>set("name",e.target.value), maxLength: 40, 'aria-label': "Circle name" ,})
            , React.createElement('div', { style: {fontSize:10,color:"var(--tx3)",textAlign:"right",marginTop:3},}, form.name.length, "/40")
          )
          , React.createElement('div', { style: {marginBottom:12},}
            , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6},}, "Description")
            , React.createElement('textarea', { className: "inp", style: {minHeight:68,fontSize:13}, placeholder: "What is this group about?"    , value: form.description, onChange: e=>set("description",e.target.value), maxLength: 200, 'aria-label': "Circle description" ,})
          )
          , React.createElement('div', { style: {marginBottom:16},}
            , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6},}, "Category *" )
            , React.createElement('div', { style: {display:"flex",gap:6,flexWrap:"wrap"},}
              , categories.map(cat=>(
                React.createElement('button', { key: cat, className: "btn"+(form.category===cat?" bp":" bgb"), style: {padding:"6px 12px",fontSize:12}, onClick: ()=>set("category",cat), 'aria-label': "Category: "+cat,}, cat)
              ))
            )
          )
          , React.createElement('button', { className: "btn bp" , style: {width:"100%",padding:12,fontSize:14}, disabled: !canNext1, onClick: ()=>setStep(2),}, "Next: Settings →"  )
        )
      )
    )
  );
}
/* --- GROUPS PAGE ------------------------- */
function GroupDetailPage({group, navigate, onBack, cherryCtx}) {
  const [tab, setTab] = useState("feed");
  const [joined, setJoined] = useState(group.joined||false);
  const [isAdmin] = useState(group.id===1); // user is admin of group 1
  const [showAdmin, setShowAdmin] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const {dreams, tl, tr, tur, tq, tuq, tb, tc} = useDreams(DREAMS_INIT.slice(0,3).map(d=>({...d,id:d.id+200})));
  const [activeComment, setActiveComment] = useState(null);

  if (activeComment) return React.createElement(CommentView, { dream: activeComment, onBack: ()=>setActiveComment(null), onLike: tl, onRedream: tr, onUndoRedream: tur, onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onCommentPosted: tc, navigate: navigate,});

  const members = USERS.slice(0,group.id+1);
  const RULES = ["Be kind and respectful","Stay on topic","No spam or self-promotion","Use relevant hashtags"];

  return (
    React.createElement('div', { className: "pg",}
      /* Group hero */
      , React.createElement('div', { style: {height:110,background:`linear-gradient(135deg,hsl(${260+group.id*20},60%,14%),hsl(${280+group.id*15},70%,8%))`,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",paddingTop:44},}
        , React.createElement('button', { className: "bi", style: {position:"absolute",top:48,left:12,background:"rgba(0,0,0,.55)"}, onClick: onBack, 'aria-label': "Back",}, React.createElement(Ic.Bck, { style: {width:19,height:19},}))
        , isAdmin&&React.createElement('button', { className: "bi", style: {position:"absolute",top:48,right:12,background:"rgba(245,158,11,.2)",color:"#f59e0b"}, onClick: ()=>setShowAdmin(true), 'aria-label': "Circle admin settings"  ,}, React.createElement(Ic.Dots, { style: {width:19,height:19},}))
        , React.createElement('div', { style: {fontSize:38,marginBottom:4},}, group.emoji)
        , React.createElement('div', { style: {fontFamily:"'DM Serif Display',Georgia,serif",fontSize:18,color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.6)"},}, group.name)
      )

      /* Group meta */
      , React.createElement('div', { style: {padding:"12px 16px 0",background:"var(--sf2)",borderBottom:"1px solid var(--bd)"},}
        , React.createElement('div', { style: {display:"flex",gap:10,alignItems:"flex-start"},}
          , React.createElement('div', { style: {flex:1},}
            , React.createElement('div', { style: {fontSize:12,color:"var(--tx2)",lineHeight:1.55,marginBottom:8},}, group.description)
            , React.createElement('div', { style: {display:"flex",gap:12,flexWrap:"wrap",marginBottom:10},}
              , React.createElement('span', { style: {fontSize:11,color:"var(--tx3)",display:"flex",alignItems:"center",gap:4},}, React.createElement('span', null, "Members: "), group.members.toLocaleString() )
              , React.createElement('span', { style: {fontSize:11,color:"var(--tx3)",display:"flex",alignItems:"center",gap:4},}, React.createElement('span', null, "Category: "), group.category)
              , React.createElement('span', { style: {fontSize:11,color:"var(--tx3)",display:"flex",alignItems:"center",gap:4},}, React.createElement('span', null, "Visibility: "), group.id===1||group.id===4?"Public":"Private")
              , isAdmin&&React.createElement('span', { style: {fontSize:10,background:"rgba(245,158,11,.15)",color:"#f59e0b",padding:"1px 7px",borderRadius:100,fontWeight:700},}, "★ Admin" )
            )
          )
          , React.createElement('div', { style: {display:"flex",gap:7,alignItems:"center"},}
            , joined&&React.createElement('button', { className: "btn bgb" , style: {padding:"7px 11px",fontSize:12}, onClick: ()=>setShowInvite(true), 'aria-label': "Invite friends" ,}, "Invite")
            , React.createElement('button', { className: "btn"+(joined?" bgb":" bp"), style: {padding:"7px 14px",fontSize:12}, onClick: ()=>setJoined(j=>!j), 'aria-label': joined?"Leave group":"Join group",}, joined?"Joined ✓":"Join")
          )
        )

        /* Member avatars */
        , React.createElement('div', { style: {display:"flex",alignItems:"center",gap:4,paddingBottom:10},}
          , React.createElement('div', { style: {display:"flex"},}
            , members.slice(0,5).map((u,i)=>(React.createElement('div', { key: u.id, style: {marginLeft:i?-8:0,border:"2px solid var(--sf2)",borderRadius:"50%"},}, React.createElement(Av, { user: u, size: 22,}))))
          )
          , React.createElement('span', { style: {fontSize:11,color:"var(--tx3)",marginLeft:6},}, members.length, " members active recently"   )
        )
      )

      , React.createElement('div', {className:"ftabs",role:"tablist","aria-label":"Circle sections",style:{overflowX:"auto",scrollbarWidth:"none"}},
        ["feed","members","about","rules"].map(function(t,i){
          return React.createElement('button', {key:t,className:"ftab"+(tab===t?" on":""),onClick:function(){setTab(t);},role:"tab","aria-selected":tab===t,"aria-setsize":4,"aria-posinset":i+1,"aria-label":t.charAt(0).toUpperCase()+t.slice(1),style:{whiteSpace:"nowrap"}},
              t.charAt(0).toUpperCase()+t.slice(1),
              React.createElement('span',{className:"ftab-num","aria-hidden":"true"}, (i+1)+"/4")
            );
        })
      )

      , tab==="feed"&&React.createElement(React.Fragment, null
        , joined&&React.createElement('div', { style: {padding:"10px 14px",borderBottom:"1px solid var(--bd)",display:"flex",gap:9,alignItems:"center",cursor:"pointer"}, role: "button", tabIndex: 0,}
          , React.createElement(Av, { user: ME, size: 34,})
          , React.createElement('div', { style: {flex:1,background:"var(--sf2)",borderRadius:100,padding:"9px 14px",fontSize:13,color:"var(--tx3)"},}, "Dream something in "   , group.name, "…")
        )
        , dreams.map(d=>React.createElement(DreamCard, { key: d.id, dream: d, onLike: tl, onRedream: tr, onUndoRedream: tur, onQuote: tq, onUndoQuote: tuq, onBookmark: tb, onComment: d=>setActiveComment(d), navigate: navigate,}))
      )

      , tab==="members"&&React.createElement(React.Fragment, null
        , React.createElement('div', { style: {padding:"9px 14px 6px"},}, React.createElement('input', { className: "inp", style: {fontSize:13}, placeholder: "Search members…" , 'aria-label': "Search members" ,}))
        , isAdmin&&React.createElement('div', { style: {padding:"8px 14px",background:"rgba(245,158,11,.06)",borderBottom:"1px solid rgba(245,158,11,.1)",display:"flex",alignItems:"center",gap:8},}
          , React.createElement('span', { style: {fontSize:13,color:"#f59e0b"},}, "★")
          , React.createElement('span', { style: {fontSize:12,color:"#f59e0b",fontWeight:600},}, "You are an admin of this group"      )
        )
        , members.map(u=>(
          React.createElement('div', { key: u.id, style: {display:"flex",gap:10,padding:"11px 14px",borderBottom:"1px solid var(--bd)",alignItems:"center"},}
            , React.createElement(Av, { user: u, size: 40,})
            , React.createElement('div', { style: {flex:1},}
              , React.createElement('div', { style: {fontWeight:700,fontSize:13},}, u.name, u.verified&&React.createElement('span', { style: {color:"var(--ac2)",fontSize:10},}, " ✓" ))
              , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)"},}, u.handle, ", "  , u.dreamCount, " dreams" )
            )
            , isAdmin&&u.id!==ME.id&&React.createElement('button', { className: "btn bgb" , style: {fontSize:11,padding:"4px 10px"}, 'aria-label': "Member options for "+u.name,}, "")
          )
        ))
      )

      , tab==="about"&&React.createElement('div', { style: {padding:"16px"},}
        , React.createElement('div', { style: {background:"var(--sf2)",borderRadius:13,padding:16,marginBottom:12},}
          , React.createElement('div', { style: {fontSize:12,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8},}, "About")
          , React.createElement('p', { style: {fontSize:13,color:"var(--tx2)",lineHeight:1.7},}, group.description, " This is a space for deep conversations, shared research and creative exploration around "              , group.category.toLowerCase(), " topics." )
        )
        , React.createElement('div', { style: {background:"var(--sf2)",borderRadius:13,padding:16,marginBottom:12},}
          , React.createElement('div', { style: {fontSize:12,fontWeight:700,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10},}, "Stats")
          , React.createElement('div', { style: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},}
            , [{l:"Members",v:group.members.toLocaleString()},{l:"Dreams",v:"4,218"},{l:"Category",v:group.category},{l:"Created",v:"Jan 2024"}].map(s=>(
              React.createElement('div', { key: s.l, style: {background:"var(--sf3)",borderRadius:9,padding:"9px 11px"},}, React.createElement('div', { style: {fontSize:10,color:"var(--tx3)"},}, s.l), React.createElement('div', { style: {fontSize:14,fontWeight:700,marginTop:2},}, s.v))
            ))
          )
        )
        , isAdmin&&React.createElement('button', { className: "btn bp" , style: {width:"100%",padding:11,fontSize:13}, onClick: ()=>setShowAdmin(true), 'aria-label': "Circle settings" ,}, "Group Settings"  )
      )

      , tab==="rules"&&React.createElement('div', { style: {padding:16},}
        , React.createElement('p', { style: {fontSize:12,color:"var(--tx2)",lineHeight:1.6,marginBottom:14},}, "By participating in "   , group.name, ", you agree to follow these rules. Violations may result in removal."           )
        , RULES.map((rule,i)=>(
          React.createElement('div', { key: i, style: {display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid var(--bd)"},}
            , React.createElement('div', { style: {width:28,height:28,borderRadius:"50%",background:"var(--ac)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",fontWeight:800,flexShrink:0},}, i+1)
            , React.createElement('div', { style: {fontSize:13,color:"var(--tx)",lineHeight:1.6,paddingTop:4},}, rule)
          )
        ))
      )

      , showAdmin&&React.createElement(GroupAdminModal, { group: group, onClose: ()=>setShowAdmin(false),})
      , showInvite&&(
        React.createElement(Modal, { onClose: ()=>setShowInvite(false), title: "Invite to "+group.name, subtitle: "Share this group with your followers"     ,}
          , USERS.slice(0,4).map(u=>(
            React.createElement('div', { key: u.id, className: "osb", style: {justifyContent:"space-between"},}
              , React.createElement('div', { style: {display:"flex",gap:8,alignItems:"center"},}, React.createElement(Av, { user: u, size: 34,}), React.createElement('div', null, React.createElement('div', { style: {fontWeight:700,fontSize:13},}, u.name), React.createElement('div', { style: {fontSize:11,color:"var(--tx3)"},}, u.handle)))
              , React.createElement('button', { className: "btn bp" , style: {padding:"5px 12px",fontSize:11}, 'aria-label': "Invite "+u.name,}, "Invite")
            )
          ))
        )
      )
    )
  );
}
function GroupAdminModal({group, onClose}) {
  const [tab, setTab] = useState("general");
  const [settings, setSettings] = useState({postApproval:false,joinApproval:false,slowMode:false,slowModeDelay:30,pinned:"",welcome:"Welcome to "+group.name+"! Please read the rules before Dreaming.",restricted:false});
  const set = (k,v) => setSettings(s=>({...s,[k]:v}));
  const [pendingJoins] = useState([{id:99,name:"Jordan Myer",handle:"@jordanm",initials:"JM",color:"#7c3aed"}]);
  const [pendingPosts] = useState([]);

  return (
    React.createElement('div', { className: "ov", onClick: e=>e.target===e.currentTarget&&onClose(),}
      , React.createElement('div', { className: "msh", style: {maxHeight:"92vh"},}
        , React.createElement('div', { className: "mhd",})
        , React.createElement('div', { style: {padding:"12px 16px 8px",borderBottom:"1px solid var(--bd)",display:"flex",alignItems:"center",gap:8},}
          , React.createElement('span', { style: {fontSize:18},}, "Settings")
          , React.createElement('div', { className: "mtt", style: {margin:0,fontSize:17},}, group.name, ", Circle Admin" )
          , React.createElement('button', Object.assign({ type: "button", className: "lc-close", style: {marginLeft:"auto"}, onClick: onClose }, lcCloseProps("Circle settings")), "Close")
        )
        , React.createElement('div', {className:"ftabs",role:"tablist","aria-label":"Admin sections",style:{overflowX:"auto",scrollbarWidth:"none"}},
          ["general","members","posts","settings"].map(function(t,i){
            return React.createElement('button', {key:t,className:"ftab"+(tab===t?" on":""),onClick:function(){setTab(t);},role:"tab","aria-selected":tab===t,"aria-setsize":4,"aria-posinset":i+1,"aria-label":t==="posts"?"Dreams":t.charAt(0).toUpperCase()+t.slice(1),style:{whiteSpace:"nowrap"}},
              t==="posts"?"Dreams":t.charAt(0).toUpperCase()+t.slice(1),
              React.createElement('span',{className:"ftab-num","aria-hidden":"true"}, (i+1)+"/4")
            );
          })
        )
        , React.createElement('div', { style: {overflowY:"auto",maxHeight:"70vh",scrollbarWidth:"none"},}

          , tab==="general"&&React.createElement('div', { style: {padding:"8px 0 24px"},}
            , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "Pinned Dream" )
            , React.createElement('div', { style: {padding:"0 16px 12px"},}
              , React.createElement('input', { className: "inp", style: {fontSize:13}, placeholder: "Paste a Dream URL to pin at top…"       , value: settings.pinned, onChange: e=>set("pinned",e.target.value), 'aria-label': "Pinned dream URL"  ,})
            )
            , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "Welcome Message" )
            , React.createElement('div', { style: {padding:"0 16px 12px"},}
              , React.createElement('textarea', { className: "inp", style: {fontSize:13,minHeight:72}, value: settings.welcome, onChange: e=>set("welcome",e.target.value), 'aria-label': "Welcome message for new members"    ,})
            )
            , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "Slow Mode" )
            , React.createElement('div', { className: "sr",}
              , React.createElement('div', null, React.createElement('div', { className: "sr-title",}, "Enable Slow Mode"  ), React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",marginTop:3},}, "Limit how often members can Dream"     ))
              , React.createElement(Cbx, { on: settings.slowMode, onToggle: ()=>set("slowMode",!settings.slowMode), label: "Slow mode" ,})
            )
            , settings.slowMode&&React.createElement('div', { style: {padding:"0 16px 8px"},}
              , React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",marginBottom:6},}, "Cooldown between Dreams"  )
              , React.createElement('div', { style: {display:"flex",gap:6},}
                , [15,30,60,300].map(s=>React.createElement('button', { key: s, className: "btn"+(settings.slowModeDelay===s?" bp":" bgb"), style: {flex:1,padding:"6px 0",fontSize:11}, onClick: ()=>set("slowModeDelay",s), 'aria-label': s+"s",}, s<60?s+"s":s/60+"min"))
              )
            )
            , React.createElement('div', { style: {padding:"14px 16px 0"},}
              , React.createElement('button', { className: "btn bp" , style: {width:"100%",padding:11,fontSize:13}, onClick: onClose, 'aria-label': "Save group settings"  ,}, "Save Settings" )
            )
          )

          , tab==="members"&&React.createElement('div', { style: {padding:"8px 0 24px"},}
            , pendingJoins.length>0&&React.createElement(React.Fragment, null
              , React.createElement('h2', { className: "slbl", style: {display:"flex",alignItems:"center",gap:6}, role: "heading", 'aria-level': "2",}, "Pending Requests "  , React.createElement('span', { style: {background:"var(--rd)",color:"#fff",fontSize:9,padding:"1px 5px",borderRadius:4},}, pendingJoins.length))
              , pendingJoins.map(u=>(
                React.createElement('div', { key: u.id, style: {display:"flex",gap:10,padding:"10px 16px",borderBottom:"1px solid var(--bd)",alignItems:"center"},}
                  , React.createElement(Av, { user: u, size: 38,})
                  , React.createElement('div', { style: {flex:1},}, React.createElement('div', { style: {fontWeight:700,fontSize:13},}, u.name), React.createElement('div', { style: {fontSize:11,color:"var(--tx3)"},}, u.handle))
                  , React.createElement('div', { style: {display:"flex",gap:6},}
                    , React.createElement('button', { className: "btn bp" , style: {padding:"5px 10px",fontSize:11}, 'aria-label': "Approve "+u.name,}, "Approve")
                    , React.createElement('button', { className: "btn bgb" , style: {padding:"5px 10px",fontSize:11,color:"var(--rd)"}, 'aria-label': "Decline "+u.name,}, "Decline")
                  )
                )
              ))
            )
            , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "All Dreamors ("  , USERS.length, ")")
            , USERS.map(u=>(
              React.createElement('div', { key: u.id, style: {display:"flex",gap:10,padding:"10px 16px",borderBottom:"1px solid var(--bd)",alignItems:"center"},}
                , React.createElement(Av, { user: u, size: 36,})
                , React.createElement('div', { style: {flex:1},}, React.createElement('div', { style: {fontWeight:700,fontSize:13},}, u.name), React.createElement('div', { style: {fontSize:11,color:"var(--tx3)"},}, u.handle))
                , React.createElement('button', { className: "btn bgb" , style: {fontSize:10,padding:"4px 9px"}, 'aria-label': "Admin actions for "+u.name,}, "Actions")
              )
            ))
          )

          , tab==="posts"&&React.createElement('div', { style: {padding:"8px 0 24px"},}
            , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "Dream Approval" )
            , React.createElement('div', { className: "sr",}
              , React.createElement('div', null, React.createElement('div', { className: "sr-title",}, "Require Dream Approval"  ), React.createElement('div', { style: {fontSize:11,color:"var(--tx3)",marginTop:3},}, "Review Dreams before they appear in the group"       ))
              , React.createElement(Cbx, { on: settings.postApproval, onToggle: ()=>set("postApproval",!settings.postApproval), label: "Dream approval" ,})
            )
            , pendingPosts.length>0&&React.createElement(React.Fragment, null
              , React.createElement('h2', { className: "slbl", style: {display:"flex",alignItems:"center",gap:6}, role: "heading", 'aria-level': "2",}, "Pending Dreams "  , React.createElement('span', { style: {background:"var(--rd)",color:"#fff",fontSize:9,padding:"1px 5px",borderRadius:4},}, pendingPosts.length))
              , pendingPosts.map(p=>(
                React.createElement('div', { key: p.id, style: {padding:"12px 16px",borderBottom:"1px solid var(--bd)"},}
                  , React.createElement('div', { style: {display:"flex",gap:8,marginBottom:6,alignItems:"center"},}, React.createElement(Av, { user: p.user, size: 30,}), React.createElement('div', { style: {fontWeight:700,fontSize:13},}, p.user.name), React.createElement('span', { style: {fontSize:11,color:"var(--tx3)"},}, p.time))
                  , React.createElement('p', { style: {fontSize:12,color:"var(--tx2)",lineHeight:1.55,marginBottom:9},}, p.text)
                  , React.createElement('div', { style: {display:"flex",gap:7},}
                    , React.createElement('button', { className: "btn bp" , style: {padding:"5px 14px",fontSize:11}, 'aria-label': "Approve Dream" ,}, "Approve")
                    , React.createElement('button', { className: "btn bgb" , style: {padding:"5px 14px",fontSize:11,color:"var(--rd)"}, 'aria-label': "Reject Dream" ,}, "Reject")
                  )
                )
              ))
            )
          )

          , tab==="settings"&&React.createElement('div', { style: {padding:"8px 0 24px"},}
            , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "Circle Privacy" )
            , [{id:"public",icon:"Public",l:"Public"},{id:"private",icon:"Private",l:"Private"},{id:"restricted",icon:"Restricted",l:"Restricted"}].map(p=>(
              React.createElement('button', { key: p.id, className: "osb", 'aria-label': p.l,}
                , React.createElement('span', { style: {fontSize:18},}, p.icon)
                , React.createElement('span', { style: {fontWeight:600,color:"var(--tx2)"},}, p.l)
              )
            ))
            , React.createElement('h2', { className: "slbl", role: "heading", 'aria-level': "2",}, "Danger Zone" )
            , [{ic:"Archive Circle",l:"Archive Circle",d:"Freeze the Circle without deleting"},{ic:"Delete Circle",l:"Delete Circle",d:"Permanently remove this Circle",danger:true}].map(x=>(
              React.createElement('button', { key: x.l, className: "snav"+(x.danger?" osb-red":""), 'aria-label': x.l,}
                , React.createElement('div', { className: "snav-l",}, React.createElement('div', { style: {fontSize:17,width:36,textAlign:"center"},}, x.ic), React.createElement('div', null, React.createElement('div', { className: "snav-title"+(x.danger?" osb-red":""), style: {color:x.danger?"var(--rd)":""},}, x.l), React.createElement('div', { className: "snav-sub",}, x.d)))
              )
            ))
          )

        )
      )
    )
  );
}
function GroupsPage({navigate, cherryCtx}) {
  const [tab, setTab] = useState("discover");
  const [groups, setGroups] = useState(GROUPS);
  const [activeGroup, setActiveGroup] = useState(null);
  const tj = id => setGroups(gs=>gs.map(g=>g.id===id?{...g,joined:!g.joined}:g));
  const list = groups.filter(g=>tab==="discover"?!g.joined:g.joined);

  if (activeGroup) return React.createElement(GroupDetailPage, { group: activeGroup, navigate: navigate, onBack: ()=>setActiveGroup(null),});

  return (
    React.createElement('div', { className: "pg",}
      , React.createElement('div', { className: "hdr",}
        , React.createElement('div', { style: {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"48px 16px 0"},}
          , React.createElement('h1', { className: "htit", tabIndex:-1,}, "Circles")
        )
        , React.createElement('div', {className:"ftabs",role:"tablist","aria-label":"Circles sections",style:{overflowX:"auto",scrollbarWidth:"none"}},
          ["discover","my circles"].map(function(t,i){
            var lbl = t==="my circles"?"My Circles":"Discover";
            return React.createElement('button', {key:t,className:"ftab"+(tab===t?" on":""),onClick:function(){setTab(t);},role:"tab","aria-selected":tab===t,"aria-setsize":2,"aria-posinset":i+1,"aria-label":lbl,style:{whiteSpace:"nowrap"}}, lbl);
          })
        )
      )
      , list.length===0 && React.createElement('div', { className: "es",}, React.createElement('div', { className: "esi",}, "No Circles yet"), React.createElement('div', { className: "esl",}, "No Circles yet"  ), React.createElement('p', { style: {fontSize:12,color:"var(--tx3)",marginTop:6},}, "Tap Create to start one"        ))
      , list.map((g,i) => (
        React.createElement('div', { key: g.id, className: "card fu" , style: {margin:"11px 13px 0",animationDelay:i*.05+"s",cursor:"pointer"}, onClick: ()=>setActiveGroup(g), role: "button", tabIndex: 0, 'aria-label': "Open "+g.name,}
          , React.createElement('div', { className: "gbr", style: {background:`linear-gradient(135deg,hsl(${260+i*25},55%,18%),hsl(${280+i*20},65%,10%))`,height:72,fontSize:36},}, g.emoji)
          , React.createElement('div', { className: "gin",}
            , React.createElement('div', { style: {display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8},}
              , React.createElement('div', null
                , React.createElement('div', { className: "gnm",}, g.name, g.joined&&g.id===1&&React.createElement('span', { style: {marginLeft:6,fontSize:9,background:"rgba(245,158,11,.2)",color:"#f59e0b",padding:"1px 5px",borderRadius:4,fontWeight:700},}, "★ ADMIN" ))
                , React.createElement('div', { className: "gmt",}, g.members.toLocaleString(), " Dreamors, "   , g.category)
              )
              , g.joined&&React.createElement('button', { className: "btn bgb" , style: {fontSize:11,padding:"5px 10px",flexShrink:0}, onClick: e=>{e.stopPropagation();tj(g.id);}, 'aria-label': "Leave "+g.name,}, "Joined ✓" )
              , !g.joined&&React.createElement('button', { className: "btn bp" , style: {fontSize:11,padding:"5px 10px",flexShrink:0}, onClick: e=>{e.stopPropagation();tj(g.id);}, 'aria-label': "Join "+g.name,}, "Join")
            )
            , React.createElement('p', { style: {fontSize:12,color:"var(--tx2)",lineHeight:1.5,marginTop:5},}, g.description)
            , React.createElement('div', { style: {display:"flex",marginTop:8,gap:-6},}
              , USERS.slice(0,4).map((u,i)=>(React.createElement('div', { key: u.id, style: {marginLeft:i?-6:0,border:"2px solid var(--sf)",borderRadius:"50%"},}, React.createElement(Av, { user: u, size: 20,}))))
              , React.createElement('span', { style: {fontSize:10,color:"var(--tx3)",marginLeft:10,alignSelf:"center"},}, "+", g.members-4, " more" )
            )
          )
        )
      ))
    )
  );
}
})(window.Looscid = window.Looscid || {});
