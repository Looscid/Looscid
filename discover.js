/* DiscoverPage extracted from preview/index.html. */
function DiscoverPage({navigate, cherryCtx}) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("trending");
  const [filters, setFilters] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeTabs = q ? ["all","dreamers","dreams","circles"] : ["trending","dreamers","circles"];
  const tabLabel = t => ({all:"All",dreamers:"Dreamors",dreams:"Dreams",circles:"Circles",trending:"Trending"}[t]||t);

  const FILTER_OPTS = [
    {id:"dreams",    label:"Dreams",     icon:"Dreams", group:"content"},
    {id:"replies",   label:"Replies",    icon:"Replies", group:"content"},
    {id:"redreams",  label:"ReDreams",   icon:"ReDreams", group:"content"},
    {id:"media",     label:"Has Media",  icon:"Has Media", group:"content"},
    {id:"verified",  label:"Verified",   icon:"\u2713",  group:"dreamers"},
    {id:"today",     label:"Today",      icon:"Today", group:"time", radio:"time"},
    {id:"week",      label:"This Week",  icon:"This Week", group:"time", radio:"time"},
    {id:"alltime",   label:"All Time",   icon:"All Time", group:"time", radio:"time"},
  ];

  const toggleFilter = (id, radioGroup) => {
    if (radioGroup) {
      const sameGroup = FILTER_OPTS.filter(f=>f.radio===radioGroup).map(f=>f.id);
      const alreadyOn = filters.includes(id);
      setFilters(fs => [...fs.filter(f=>!sameGroup.includes(f)), ...(alreadyOn?[]:[id])]);
    } else {
      setFilters(fs => fs.includes(id) ? fs.filter(f=>f!==id) : [...fs,id]);
    }
  };

  const activeLabels = filters.map(id=>(FILTER_OPTS.find(f=>f.id===id)||{}).label).filter(Boolean);
  const filterBtnText = filters.length===0 ? "Filters" : "Filters \u00b7 "+activeLabels.join(", ");

  const dreamResults = DREAMS_INIT.filter(d=>!q||d.text.toLowerCase().includes(q.toLowerCase()));
  const dreamerResults = USERS.filter(u=>!q||u.name.toLowerCase().includes(q.toLowerCase())||u.handle.includes(q))
    .filter(u=>!filters.includes("verified")||u.verified);
  const circleResults = GROUPS.filter(g=>!q||g.name.toLowerCase().includes(q.toLowerCase()));

  const filterGroups = [
    {label:"Content",  opts:FILTER_OPTS.filter(f=>f.group==="content")},
    {label:"Dreamors", opts:FILTER_OPTS.filter(f=>f.group==="dreamers")},
    {label:"Time",     opts:FILTER_OPTS.filter(f=>f.group==="time")},
  ];

  const noResults = q && dreamResults.length===0 && dreamerResults.length===0 && circleResults.length===0;

  return (
    React.createElement('div', {className:"pg"},
      React.createElement('div', {className:"hdr"},
        React.createElement('div', {style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"48px 16px 0"}},
          React.createElement('h1', {className:"htit", tabIndex:-1}, "Discover"),
          cherryCtx && React.createElement('button', {className:"cherry-ctx-btn",
            onClick:()=>cherryCtx.openCherry("What is trending right now?"),
            "aria-label":"Ask Cherry what is trending right now",
          }, "Trending")
        ),
        React.createElement('div', {style:{padding:"10px 16px 6px"}},
          React.createElement('input', {className:"inp", style:{fontSize:14},
            placeholder:"Search Dreamors, Dreams, Circles, topics",
            value:q,
            onChange:e=>{setQ(e.target.value);if(e.target.value&&tab==="trending")setTab("all");},
            "aria-label":"Search",
            role:"searchbox",
          })
        ),
        q && React.createElement('div', {style:{padding:"0 16px 8px",display:"flex",gap:8,alignItems:"center"}},
          React.createElement('button', {
            className:"sort-btn",
            style:{
              flexShrink:0,
              background:filters.length?"rgba(109,40,217,.15)":"var(--sf2)",
              borderColor:filters.length?"var(--ac)":"var(--bd2)",
              color:filters.length?"var(--ac3)":"var(--tx2)",
            },
            onClick:()=>setFiltersOpen(o=>!o),
            "aria-expanded":filtersOpen,
            "aria-label":filterBtnText,
          },
            React.createElement('span', {style:{fontSize:12}}, "Filters"),
            React.createElement('span', null, filterBtnText),
            React.createElement('span', {style:{fontSize:9,opacity:.6,marginLeft:2}}, filtersOpen?"\u25b2":"\u25bc")
          ),
          filters.length>0 && React.createElement('button', {
            style:{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"var(--tx3)",padding:"4px 6px",fontFamily:"inherit"},
            onClick:()=>setFilters([]),
            "aria-label":"Clear all filters",
          }, "Clear")
        ),
        q && filtersOpen && React.createElement('div', {
          style:{margin:"0 16px 10px",background:"var(--sf2)",border:"1px solid var(--bd2)",borderRadius:12,padding:"12px 14px"},
          role:"group", "aria-label":"Search filters",
        },
          filterGroups.map(group =>
            React.createElement('div', {key:group.label, style:{marginBottom:10}},
              React.createElement('div', {style:{fontSize:10,fontWeight:800,color:"var(--tx3)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:7}}, group.label),
              React.createElement('div', {style:{display:"flex",gap:7,flexWrap:"wrap"}},
                group.opts.map(opt => {
                  const on = filters.includes(opt.id);
                  const isRadio = !!opt.radio;
                  return React.createElement('button', {
                    key:opt.id,
                    role:isRadio?"radio":"checkbox",
                    "aria-checked":on,
                    "aria-label":opt.label+(on?" selected":""),
                    onClick:()=>toggleFilter(opt.id, opt.radio||null),
                    style:{
                      display:"flex",alignItems:"center",gap:6,
                      padding:"6px 11px",borderRadius:100,
                      border:"1.5px solid",fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"inherit",
                      background:on?"rgba(109,40,217,.15)":"transparent",
                      borderColor:on?"var(--ac)":"var(--bd2)",
                      color:on?"var(--ac3)":"var(--tx2)",
                    }
                  },
                    React.createElement('span', {
                      "aria-hidden":"true",
                      style:{
                        width:13,height:13,
                        borderRadius:isRadio?"50%":3,
                        border:"1.5px solid",
                        borderColor:on?"var(--ac)":"var(--tx3)",
                        background:on?"var(--ac)":"transparent",
                        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                      }
                    }, on && React.createElement('span', {style:{width:5,height:5,borderRadius:"50%",background:"#fff",display:"block"}})),
                    opt.icon, " ", opt.label
                  );
                })
              )
            )
          )
        ),
        React.createElement('div', {
            className:"ftabs",
            role:"tablist",
            "aria-label":"Discover sections",
            style:{overflowX:"auto",scrollbarWidth:"none"},
          },
          activeTabs.map(function(t, i){
            return React.createElement('button', {
              key:t,
              className:"ftab"+(tab===t?" on":""),
              onClick:function(){setTab(t);},
              role:"tab",
              "aria-label":tabLabel(t),
              "aria-selected":tab===t,
              tabIndex: tab===t ? 0 : -1,
            },
              tabLabel(t),
              React.createElement('span',{className:"ftab-num","aria-hidden":"true"}, (i+1)+"/"+activeTabs.length)
            );
          })
        )
      ),

      React.createElement('div', {"aria-live":"polite", "aria-label":"Search results"},

        q && cherryCtx && React.createElement('div', {
          style:{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid rgba(168,85,247,.2)",background:"rgba(109,40,217,.06)",cursor:"pointer"},
          onClick:()=>cherryCtx.openCherry(q),
          role:"button",tabIndex:0,
          "aria-label":"Ask Cherry: "+q,
          onKeyDown:e=>e.key==="Enter"&&cherryCtx.openCherry(q),
        },
          React.createElement('div', {className:"aiorb",style:{width:36,height:36,fontSize:17,flexShrink:0}}, "Cherry"),
          React.createElement('div', {style:{flex:1}},
            React.createElement('div', {style:{fontWeight:700,fontSize:13,color:"var(--tx)"}}, "Ask Cherry: \u201c", q, "\u201d"),
            React.createElement('div', {style:{fontSize:11,color:"var(--tx3)",marginTop:1}}, "Get an AI answer, not just search results")
          ),
          React.createElement(Ic.Chv, {style:{width:14,height:14,color:"var(--ac3)"}})
        ),

        (tab==="trending"||(tab==="all"&&!q)) && TRENDING.map(t =>
          React.createElement('div', {key:t.tag, className:"trtg", role:"button", tabIndex:0,
            onClick:()=>{setQ("#"+t.tag);setTab("dreams");},
            "aria-label":"#"+t.tag+", "+t.cat+", "+t.count,
          },
            React.createElement('div', null,
              React.createElement('div', {style:{fontSize:11,color:"var(--tx3)"}}, t.cat, " \u00b7 Trending"),
              React.createElement('div', {style:{fontSize:14,fontWeight:700,margin:"2px 0"}}, "#", t.tag),
              React.createElement('div', {style:{fontSize:11,color:"var(--tx3)"}}, t.count)
            ),
            React.createElement('div', {style:{display:"flex",alignItems:"center",gap:8}},
              cherryCtx && React.createElement('button', {
                className:"cherry-ctx-btn",
                onClick:e=>{e.stopPropagation();cherryCtx.openCherry("Draft a Dream about #"+t.tag+" that would perform well");},
                "aria-label":"Ask Cherry to draft a Dream about #"+t.tag,
              }, "Draft"),
              React.createElement(Ic.Chv, {style:{width:14,height:14,color:"var(--tx3)"}})
            )
          )
        ),

        (tab==="dreamers"||tab==="all") && dreamerResults.map(u =>
          React.createElement('div', {key:u.id, className:"ci", onClick:()=>navigate("dp",u), role:"button", tabIndex:0,
            "aria-label":u.name+(u.verified?" verified":"")+" · "+u.handle+" · "+fmt(u.followers)+" Dreamors following",
          },
            React.createElement(Av, {user:u, size:44}),
            React.createElement('div', {className:"cif"},
              React.createElement('div', {className:"cnm"}, u.name,
                u.verified&&React.createElement('span', {style:{color:"var(--ac2)",fontSize:11}}, " \u2713")
              ),
              React.createElement('div', {className:"cpv"}, u.handle, " \u00b7 ", fmt(u.followers), " Dreamors following")
            ),
            React.createElement('button', {className:"btn bp", style:{padding:"7px 14px",fontSize:12},
              onClick:e=>e.stopPropagation(), "aria-label":"Follow "+u.name,
            }, "Follow")
          )
        ),

        (tab==="dreams"||tab==="all") && dreamResults.map(d =>
          React.createElement('div', {key:d.id,
            style:{borderBottom:"1px solid var(--bd)",padding:"11px 14px"},
            "aria-label":"Dream by "+d.user.name+", "+d.text.replace(/\n/g," ").slice(0,80),
          },
            React.createElement('div', {style:{display:"flex",gap:8,alignItems:"center",marginBottom:4}},
              React.createElement(Av, {user:d.user, size:28}),
              React.createElement('span', {style:{fontWeight:700,fontSize:13}}, d.user.name),
              d.user.verified&&React.createElement('span', {style:{color:"var(--ac2)",fontSize:11}}, "\u2713"),
              React.createElement('span', {style:{fontSize:11,color:"var(--tx3)"}}, d.user.handle)
            ),
            React.createElement('p', {style:{fontSize:13,color:"var(--tx2)",lineHeight:1.6,margin:"0 0 5px"}},
              React.createElement(DreamText, {text:d.text.length>140?d.text.slice(0,140)+"\u2026":d.text})
            ),
            React.createElement('div', {style:{display:"flex",gap:12,fontSize:11,color:"var(--tx3)"}},
              React.createElement('span', null, "Likes: ", fmt(d.likes)),
              React.createElement('span', null, "ReDreams: ", fmt(d.redreams)),
              React.createElement('span', null, "Replies: ", fmt(d.comments))
            )
          )
        ),

        (tab==="circles"||tab==="all") && circleResults.map(g =>
          React.createElement('div', {key:g.id, className:"ci",
            "aria-label":g.name+" Circle, "+fmt(g.members)+" Dreamors",
          },
            React.createElement('div', {style:{width:44,height:44,borderRadius:11,background:"var(--sf2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}, g.emoji),
            React.createElement('div', {className:"cif"},
              React.createElement('div', {className:"cnm"}, g.name),
              React.createElement('div', {className:"cpv"}, fmt(g.members), " Dreamors in this Circle")
            ),
            React.createElement('button', {className:"btn bgb", style:{fontSize:12}, "aria-label":"Join the "+g.name+" Circle"}, "Join")
          )
        ),

        noResults && React.createElement('div', {className:"es"},
          React.createElement('div', {className:"esi"}, "No results"),
          React.createElement('div', {className:"esl"}, "Nothing found"),
          React.createElement('p', {style:{fontSize:12,color:"var(--tx3)",marginTop:6,lineHeight:1.6}},
            "No results for \u201c", q, "\u201d. Try different words, or ask Cherry."
          ),
          cherryCtx && React.createElement('button', {
            className:"cherry-ctx-btn", style:{margin:"10px auto 0",display:"flex"},
            onClick:()=>cherryCtx.openCherry("Help me find: "+q),
            "aria-label":"Ask Cherry to help find "+q,
          }, "Ask Cherry to find this")
        )
      )
    )
  );
}
window.LooscidDiscoverExtracted = DiscoverPage;
