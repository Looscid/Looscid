/* Looscid component library data. See buildComponents below. */
export const COMPONENTS = [
  {
    slug: "bottom-tab-bar",
    t: "Bottom tab bar",
    s: "the 5 tabs at the bottom of every screen: Home, Discover, Create, Inbox and Profile.",
    where: [
      "it's the bar glued to the bottom of the app. 5 tabs: Home, Discover, Create, Inbox and Profile. it's how u get around looscid, on every screen.",
      `Create isn't a real page, it opens the <a href="../create-dialog/">Create dialog</a>. Profile has a little dot when something new is waiting for u.`
    ],
    states: [
      { id: "normal", n: "normal", say: "Home is the screen ur on, so it's ticked.", html: `<nav class="bnav" role="tablist" aria-label="Main navigation">
<button class="nb on" role="tab" aria-selected="true" aria-current="page" aria-label="Home" aria-controls="main-content" aria-setsize="5" aria-posinset="1" tabindex="0"><div aria-hidden="true" class="nb-check"></div><span aria-hidden="true">Home</span></button>
<button class="nb" role="tab" aria-selected="false" aria-label="Discover" aria-controls="main-content" aria-setsize="5" aria-posinset="2" tabindex="-1"><div aria-hidden="true" class="nb-check"></div><span aria-hidden="true">Discover</span></button>
<button class="nb nb-create" role="tab" aria-selected="false" aria-label="Create" aria-haspopup="dialog" aria-setsize="5" aria-posinset="3" tabindex="-1"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span aria-hidden="true">Create</span></button>
<button class="nb" role="tab" aria-selected="false" aria-label="Inbox" aria-controls="main-content" aria-setsize="5" aria-posinset="4" tabindex="-1"><div style="position: relative;"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 01-3.46 0"></path></svg></div><span aria-hidden="true">Inbox</span></button>
<button class="nb-menu" role="tab" aria-selected="false" aria-label="Profile" aria-controls="main-content" aria-setsize="5" aria-posinset="5" tabindex="-1"><div aria-hidden="true" class="nb-menu-ic"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div><span aria-hidden="true">Profile</span></button>
</nav>`, h: 90 },
      { id: "other-tab", n: "another tab picked", say: "Discover is picked now. only one tab is ever ticked.", html: `<nav class="bnav" role="tablist" aria-label="Main navigation">
<button class="nb" role="tab" aria-selected="false" aria-label="Home" aria-controls="main-content" aria-setsize="5" aria-posinset="1" tabindex="-1"><div aria-hidden="true" class="nb-check"></div><span aria-hidden="true">Home</span></button>
<button class="nb on" role="tab" aria-selected="true" aria-current="page" aria-label="Discover" aria-controls="main-content" aria-setsize="5" aria-posinset="2" tabindex="0"><div aria-hidden="true" class="nb-check"></div><span aria-hidden="true">Discover</span></button>
<button class="nb nb-create" role="tab" aria-selected="false" aria-label="Create" aria-haspopup="dialog" aria-setsize="5" aria-posinset="3" tabindex="-1"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span aria-hidden="true">Create</span></button>
<button class="nb" role="tab" aria-selected="false" aria-label="Inbox" aria-controls="main-content" aria-setsize="5" aria-posinset="4" tabindex="-1"><div style="position: relative;"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 01-3.46 0"></path></svg></div><span aria-hidden="true">Inbox</span></button>
<button class="nb-menu" role="tab" aria-selected="false" aria-label="Profile" aria-controls="main-content" aria-setsize="5" aria-posinset="5" tabindex="-1"><div aria-hidden="true" class="nb-menu-ic"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div><span aria-hidden="true">Profile</span></button>
</nav>`, h: 90 },
      { id: "focused", n: "focused", say: "the focus ring on Inbox, like when u tab or swipe to it.", html: `<nav class="bnav" role="tablist" aria-label="Main navigation">
<button class="nb on" role="tab" aria-selected="true" aria-current="page" aria-label="Home" aria-controls="main-content" aria-setsize="5" aria-posinset="1" tabindex="0"><div aria-hidden="true" class="nb-check"></div><span aria-hidden="true">Home</span></button>
<button class="nb" role="tab" aria-selected="false" aria-label="Discover" aria-controls="main-content" aria-setsize="5" aria-posinset="2" tabindex="-1"><div aria-hidden="true" class="nb-check"></div><span aria-hidden="true">Discover</span></button>
<button class="nb nb-create" role="tab" aria-selected="false" aria-label="Create" aria-haspopup="dialog" aria-setsize="5" aria-posinset="3" tabindex="-1"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span aria-hidden="true">Create</span></button>
<button class="nb demo-focus" role="tab" aria-selected="false" aria-label="Inbox" aria-controls="main-content" aria-setsize="5" aria-posinset="4" tabindex="-1"><div style="position: relative;"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 01-3.46 0"></path></svg></div><span aria-hidden="true">Inbox</span></button>
<button class="nb-menu" role="tab" aria-selected="false" aria-label="Profile" aria-controls="main-content" aria-setsize="5" aria-posinset="5" tabindex="-1"><div aria-hidden="true" class="nb-menu-ic"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div><span aria-hidden="true">Profile</span></button>
</nav>`, h: 90 },
      { id: "new-stuff", n: "something new", say: "Profile gets a dot when there's something new.", html: `<nav class="bnav" role="tablist" aria-label="Main navigation">
<button class="nb on" role="tab" aria-selected="true" aria-current="page" aria-label="Home" aria-controls="main-content" aria-setsize="5" aria-posinset="1" tabindex="0"><div aria-hidden="true" class="nb-check"></div><span aria-hidden="true">Home</span></button>
<button class="nb" role="tab" aria-selected="false" aria-label="Discover" aria-controls="main-content" aria-setsize="5" aria-posinset="2" tabindex="-1"><div aria-hidden="true" class="nb-check"></div><span aria-hidden="true">Discover</span></button>
<button class="nb nb-create" role="tab" aria-selected="false" aria-label="Create" aria-haspopup="dialog" aria-setsize="5" aria-posinset="3" tabindex="-1"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span aria-hidden="true">Create</span></button>
<button class="nb" role="tab" aria-selected="false" aria-label="Inbox" aria-controls="main-content" aria-setsize="5" aria-posinset="4" tabindex="-1"><div style="position: relative;"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 01-3.46 0"></path></svg></div><span aria-hidden="true">Inbox</span></button>
<button class="nb-menu has-notif" role="tab" aria-selected="false" aria-label="Profile" aria-controls="main-content" aria-setsize="5" aria-posinset="5" tabindex="-1"><div aria-hidden="true" class="nb-menu-ic"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div><span aria-hidden="true">Profile</span></button>
</nav>`, h: 90 }
    ],
    code: `<nav class="bnav" role="tablist" aria-label="Main navigation">
<button class="nb on" role="tab" aria-selected="true" aria-current="page" aria-label="Home" aria-controls="main-content" aria-setsize="5" aria-posinset="1" tabindex="0"><div aria-hidden="true" class="nb-check"></div><span aria-hidden="true">Home</span></button>
<button class="nb" role="tab" aria-selected="false" aria-label="Discover" aria-controls="main-content" aria-setsize="5" aria-posinset="2" tabindex="-1"><div aria-hidden="true" class="nb-check"></div><span aria-hidden="true">Discover</span></button>
<button class="nb nb-create" role="tab" aria-selected="false" aria-label="Create" aria-haspopup="dialog" aria-setsize="5" aria-posinset="3" tabindex="-1"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span aria-hidden="true">Create</span></button>
<button class="nb" role="tab" aria-selected="false" aria-label="Inbox" aria-controls="main-content" aria-setsize="5" aria-posinset="4" tabindex="-1"><div style="position: relative;"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="22" height="22"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 01-3.46 0"></path></svg></div><span aria-hidden="true">Inbox</span></button>
<button class="nb-menu" role="tab" aria-selected="false" aria-label="Profile" aria-controls="main-content" aria-setsize="5" aria-posinset="5" tabindex="-1"><div aria-hidden="true" class="nb-menu-ic"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div><span aria-hidden="true">Profile</span></button>
</nav>`,
    js: null,
    vo: [
      `each tab is one swipe. VoiceOver says "Home, selected, tab, 1 of 5", then "Discover, tab, 2 of 5" and so on.`,
      "double tap a tab to go there. the screen's h1 gets focus after, so u always know where u landed.",
      `Create says "Create, tab, 3 of 5" and opens a dialog instead of a page.`,
      "keyboard and braille display: Tab lands on the picked tab, Left and Right arrows move between tabs, Enter or Space opens one. on a braille display, Enter (or a routing key) opens the tab ur on.",
      "the icons are hidden from VoiceOver, so u only hear the name once."
    ],
    rel: ["create-dialog", "back-header", "tabs"],
  },
  {
    slug: "create-dialog",
    t: "Create dialog",
    s: "the sheet that pops up from the Create tab: Dream, Circle, List, New Chat or a chat with Cherry.",
    where: [
      `tap Create in the <a href="../bottom-tab-bar/">bottom tab bar</a> and this sheet slides up from the bottom. it's a list of everything u can make: a Dream, a Circle, a List, a new chat or a chat with Cherry.`,
      "it's a real dialog, so the rest of the app is hidden from VoiceOver while it's open."
    ],
    states: [
      { id: "normal", n: "normal (open)", say: "the sheet is open and the Create heading has focus.", html: `<div class="ov">
<div class="msh" role="dialog" aria-modal="true" aria-labelledby="create-h">
<div class="mhd" aria-hidden="true"></div>
<div class="min">
<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"><h2 id="create-h" class="mtt" tabindex="-1" style="margin: 0; flex: 1 1 0%;">Create</h2><button type="button" class="lc-close" aria-label="Close Creation Options">Close</button></div>
<div class="lc-create">
<p class="lc-create-desc">Choose what you want to create.</p>
<ul class="mlist lc-create-list" role="list" aria-label="Create Options"><li class="mli"><button type="button" id="create-dream" class="mitem lc-create-opt" data-create="dream"><span class="mitem-lbl">Dream</span></button></li><li class="mli"><button type="button" id="create-circle" class="mitem lc-create-opt" data-create="circle"><span class="mitem-lbl">Circle</span></button></li><li class="mli"><button type="button" id="create-feed" class="mitem lc-create-opt" data-create="feed"><span class="mitem-lbl">List</span></button></li><li class="mli"><button type="button" id="create-chat" class="mitem lc-create-opt" data-create="chat"><span class="mitem-lbl">New Chat</span></button></li><li class="mli"><button type="button" id="create-cherry" class="mitem lc-create-opt" data-create="cherry"><span class="mitem-lbl">New Chat with Cherry</span></button></li></ul>
</div>
</div>
</div>
</div>`, h: 470 },
      { id: "focused", n: "focused", say: "focus on Close, the first thing after the heading.", html: `<div class="ov">
<div class="msh" role="dialog" aria-modal="true" aria-labelledby="create-h">
<div class="mhd" aria-hidden="true"></div>
<div class="min">
<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"><h2 id="create-h" class="mtt" tabindex="-1" style="margin: 0; flex: 1 1 0%;">Create</h2><button type="button" class="lc-close demo-focus" aria-label="Close Creation Options">Close</button></div>
<div class="lc-create">
<p class="lc-create-desc">Choose what you want to create.</p>
<ul class="mlist lc-create-list" role="list" aria-label="Create Options"><li class="mli"><button type="button" id="create-dream" class="mitem lc-create-opt" data-create="dream"><span class="mitem-lbl">Dream</span></button></li><li class="mli"><button type="button" id="create-circle" class="mitem lc-create-opt" data-create="circle"><span class="mitem-lbl">Circle</span></button></li><li class="mli"><button type="button" id="create-feed" class="mitem lc-create-opt" data-create="feed"><span class="mitem-lbl">List</span></button></li><li class="mli"><button type="button" id="create-chat" class="mitem lc-create-opt" data-create="chat"><span class="mitem-lbl">New Chat</span></button></li><li class="mli"><button type="button" id="create-cherry" class="mitem lc-create-opt" data-create="cherry"><span class="mitem-lbl">New Chat with Cherry</span></button></li></ul>
</div>
</div>
</div>
</div>`, h: 470 }
    ],
    code: `<div class="ov">
<div class="msh" role="dialog" aria-modal="true" aria-labelledby="create-h">
<div class="mhd" aria-hidden="true"></div>
<div class="min">
<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"><h2 id="create-h" class="mtt" tabindex="-1" style="margin: 0; flex: 1 1 0%;">Create</h2><button type="button" class="lc-close" aria-label="Close Creation Options">Close</button></div>
<div class="lc-create">
<p class="lc-create-desc">Choose what you want to create.</p>
<ul class="mlist lc-create-list" role="list" aria-label="Create Options"><li class="mli"><button type="button" id="create-dream" class="mitem lc-create-opt" data-create="dream"><span class="mitem-lbl">Dream</span></button></li><li class="mli"><button type="button" id="create-circle" class="mitem lc-create-opt" data-create="circle"><span class="mitem-lbl">Circle</span></button></li><li class="mli"><button type="button" id="create-feed" class="mitem lc-create-opt" data-create="feed"><span class="mitem-lbl">List</span></button></li><li class="mli"><button type="button" id="create-chat" class="mitem lc-create-opt" data-create="chat"><span class="mitem-lbl">New Chat</span></button></li><li class="mli"><button type="button" id="create-cherry" class="mitem lc-create-opt" data-create="cherry"><span class="mitem-lbl">New Chat with Cherry</span></button></li></ul>
</div>
</div>
</div>
</div>`,
    js: `// what the app does when Create opens (from js/core.js, cut down):
// 1. focus goes to the "Create" heading, so VoiceOver says it first
// 2. Escape or Close closes it and focus goes back to the Create tab
document.getElementById("create-h").focus();
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") { /* close the sheet, then focus the Create tab again */ }
});`,
    vo: [
      `when it opens VoiceOver says "Create, heading". swipe right for Close, then each choice: "Dream, button", "Circle, button" and so on, in one list.`,
      "it's a modal dialog, so swiping never wanders into the page behind it.",
      "two finger scrub (the Z gesture) or Escape closes it, and focus lands back on the Create tab.",
      "braille display: pan to a choice and press Enter (or a routing key) to pick it."
    ],
    rel: ["bottom-tab-bar", "popup-menu", "buttons"],
  },
  {
    slug: "dream-card",
    t: "Dream card",
    s: "one Dream in a feed: who made it, the words, and the Reply, Redream, Like and More buttons.",
    where: [
      "every Dream in Home, Discover, Circles and profiles is one of these. name and time up top, the Dream in the middle, then a row of buttons: Replies, Redreams, Likes and More.",
      "the whole card is one article, so VoiceOver reads the Dream in one swipe, then the buttons one by one."
    ],
    states: [
      { id: "normal", n: "normal", say: "a fresh Dream, nothing liked yet.", html: `<div class="dc" role="article" tabindex="-1" data-dream-id="d1" aria-label="Ava. 3 AM thought: what if clouds are just the sky's drafts. 2 hours ago">
<div class="dc-inner">
<div class="dc-meta"><button style="background: none; border: none; cursor: pointer; padding: 0;" aria-label="View Ava's profile"><span class="dc-name">Ava</span></button><span class="dc-dot" aria-hidden="true">·</span><span class="dc-handle" aria-hidden="true">@ava</span><span class="dc-dot" aria-hidden="true">·</span><span class="dc-time" aria-hidden="true">2h</span></div>
<div class="dc-body">3 AM thought: what if clouds are just the sky's drafts</div>
</div>
<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap" aria-haspopup="menu" aria-expanded="false" aria-label="3 Redreams"><div class="cbx-box"></div><span>3 Redreams</span></button></div>
<button class="cbx-wrap" aria-pressed="false" aria-label="12 likes"><div class="cbx-box"></div><span>12 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>
</div>`, h: 230 },
      { id: "liked", n: "liked and Redreamed", say: "the boxes are ticked when u liked and Redreamed it.", html: `<div class="dc" role="article" tabindex="-1" data-dream-id="d1" aria-label="Ava. 3 AM thought: what if clouds are just the sky's drafts. 2 hours ago">
<div class="dc-inner">
<div class="dc-meta"><button style="background: none; border: none; cursor: pointer; padding: 0;" aria-label="View Ava's profile"><span class="dc-name">Ava</span></button><span class="dc-dot" aria-hidden="true">·</span><span class="dc-handle" aria-hidden="true">@ava</span><span class="dc-dot" aria-hidden="true">·</span><span class="dc-time" aria-hidden="true">2h</span></div>
<div class="dc-body">3 AM thought: what if clouds are just the sky's drafts</div>
</div>
<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap redd" aria-haspopup="menu" aria-expanded="false" aria-label="3 Redreams, Redreamed"><div class="cbx-box"><svg viewBox="0 0 12 10" width="9" height="9" aria-hidden="true" focusable="false"><polyline points="1,5 4.5,8.5 11,1" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></polyline></svg></div><span>3 Redreams</span></button></div>
<button class="cbx-wrap liked" aria-pressed="true" aria-label="12 likes"><div class="cbx-box"><svg viewBox="0 0 12 10" width="9" height="9" aria-hidden="true" focusable="false"><polyline points="1,5 4.5,8.5 11,1" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></polyline></svg></div><span>12 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>
</div>`, h: 230 },
      { id: "redreamed-by", n: "Redreamed by someone", say: "a line on top says who Redreamed it into ur feed.", html: `<div class="rd-source"><strong style="font-weight: 600;">Milo</strong> Redreamed</div>
<div class="dc" role="article" tabindex="-1" data-dream-id="d1" aria-label="Ava. 3 AM thought: what if clouds are just the sky's drafts. 2 hours ago">
<div class="dc-inner">
<div class="dc-meta"><button style="background: none; border: none; cursor: pointer; padding: 0;" aria-label="View Ava's profile"><span class="dc-name">Ava</span></button><span class="dc-dot" aria-hidden="true">·</span><span class="dc-handle" aria-hidden="true">@ava</span><span class="dc-dot" aria-hidden="true">·</span><span class="dc-time" aria-hidden="true">2h</span></div>
<div class="dc-body">3 AM thought: what if clouds are just the sky's drafts</div>
</div>
<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap" aria-haspopup="menu" aria-expanded="false" aria-label="3 Redreams"><div class="cbx-box"></div><span>3 Redreams</span></button></div>
<button class="cbx-wrap" aria-pressed="false" aria-label="12 likes"><div class="cbx-box"></div><span>12 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>
</div>`, h: 260 },
      { id: "verified-edited", n: "verified and edited", say: `"Verified" when the Dream's key checks out, "Edited" after a change.`, html: `<div class="dc" role="article" tabindex="-1" data-dream-id="d1" aria-label="Ava. 3 AM thought: what if clouds are just the sky's drafts. 2 hours ago. Verified. Edited">
<div class="dc-inner">
<div class="dc-meta"><button style="background: none; border: none; cursor: pointer; padding: 0;" aria-label="View Ava's profile"><span class="dc-name">Ava</span></button><span class="dc-verified" style="color: var(--ac2); font-size: 12px; font-weight: 600; margin-left: 4px;">Verified</span><span class="dc-dot" aria-hidden="true">·</span><span class="dc-handle" aria-hidden="true">@ava</span><span class="dc-dot" aria-hidden="true">·</span><span class="dc-time" aria-hidden="true">2h</span><span class="dc-dot" aria-hidden="true">·</span><span class="dc-edited">Edited</span></div>
<div class="dc-body">3 AM thought: what if clouds are just the sky's drafts</div>
</div>
<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap" aria-haspopup="menu" aria-expanded="false" aria-label="3 Redreams"><div class="cbx-box"></div><span>3 Redreams</span></button></div>
<button class="cbx-wrap" aria-pressed="false" aria-label="12 likes"><div class="cbx-box"></div><span>12 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>
</div>`, h: 230 },
      { id: "content-warning", n: "content warning", say: "hidden behind a warning until u press Show Dream.", html: `<div class="dc" role="article" tabindex="-1" aria-label="Content warning: spoilers"><div class="dc-inner lc-cw"><p class="lc-cw-t">Content warning: spoilers</p><button type="button" class="btn bgb lc-btn" aria-expanded="false">Show Dream</button></div></div>`, h: 150 },
      { id: "focused", n: "focused", say: "the focus ring on the card itself, like after VoiceOver lands on it.", html: `<div class="dc demo-focus" role="article" tabindex="-1" data-dream-id="d1" aria-label="Ava. 3 AM thought: what if clouds are just the sky's drafts. 2 hours ago">
<div class="dc-inner">
<div class="dc-meta"><button style="background: none; border: none; cursor: pointer; padding: 0;" aria-label="View Ava's profile"><span class="dc-name">Ava</span></button><span class="dc-dot" aria-hidden="true">·</span><span class="dc-handle" aria-hidden="true">@ava</span><span class="dc-dot" aria-hidden="true">·</span><span class="dc-time" aria-hidden="true">2h</span></div>
<div class="dc-body">3 AM thought: what if clouds are just the sky's drafts</div>
</div>
<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap" aria-haspopup="menu" aria-expanded="false" aria-label="3 Redreams"><div class="cbx-box"></div><span>3 Redreams</span></button></div>
<button class="cbx-wrap" aria-pressed="false" aria-label="12 likes"><div class="cbx-box"></div><span>12 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>
</div>`, h: 230 }
    ],
    code: `<div class="dc" role="article" tabindex="-1" data-dream-id="d1" aria-label="Ava. 3 AM thought: what if clouds are just the sky's drafts. 2 hours ago">
<div class="dc-inner">
<div class="dc-meta"><button style="background: none; border: none; cursor: pointer; padding: 0;" aria-label="View Ava's profile"><span class="dc-name">Ava</span></button><span class="dc-dot" aria-hidden="true">·</span><span class="dc-handle" aria-hidden="true">@ava</span><span class="dc-dot" aria-hidden="true">·</span><span class="dc-time" aria-hidden="true">2h</span></div>
<div class="dc-body">3 AM thought: what if clouds are just the sky's drafts</div>
</div>
<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap" aria-haspopup="menu" aria-expanded="false" aria-label="3 Redreams"><div class="cbx-box"></div><span>3 Redreams</span></button></div>
<button class="cbx-wrap" aria-pressed="false" aria-label="12 likes"><div class="cbx-box"></div><span>12 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>
</div>`,
    js: `// liking is one press, and the app says the new state out loud (js/core.js, cut down)
likeBtn.addEventListener("click", function () {
  const liked = likeBtn.getAttribute("aria-pressed") === "true";
  likeBtn.setAttribute("aria-pressed", liked ? "false" : "true");
  likeBtn.classList.toggle("liked", !liked);
  announce(liked ? "Like removed" : "Liked"); // see the live region page
});`,
    vo: [
      `swipe to the card and VoiceOver reads it all in one go: "Ava. 3 AM thought: what if clouds are just the sky's drafts. 2 hours ago". the dots and the handle are hidden so it doesn't read junk.`,
      `keep swiping for the buttons: "4 replies, button", "3 Redreams, pop up button", "12 likes, toggle button", then "More, Dream by Ava, pop up button".`,
      `every More button says whose Dream it is, so the rotor list isn't just a row of "More".`,
      `"Verified" and "Edited" are added at the end of the card's label.`,
      `braille display: the card shows as a short line ("D: Ava 2h: the words") when braille output is on in Settings, Accessibility, Sense. Enter on a button presses it.`
    ],
    rel: ["like-redream-buttons", "popup-menu", "live-region", "mod-reason-picker"],
  },
  {
    slug: "like-redream-buttons",
    t: "Like and ReDream buttons",
    s: "the two tick-box buttons under every Dream: Like, and ReDream or Quote.",
    where: [
      `they live in the button row under every <a href="../dream-card/">Dream card</a> and on a Dream's Replies page. Like is one press. ReDream opens a tiny menu: Redream or Quote Dream.`,
      "they look like checkboxes on purpose: a ticked box means u did it. calm mode hides the numbers so u don't stare at counts."
    ],
    states: [
      { id: "normal", n: "normal", say: "not liked, not Redreamed.", html: `<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap" aria-haspopup="menu" aria-expanded="false" aria-label="3 Redreams"><div class="cbx-box"></div><span>3 Redreams</span></button></div>
<button class="cbx-wrap" aria-pressed="false" aria-label="12 likes"><div class="cbx-box"></div><span>12 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>`, h: 80 },
      { id: "liked", n: "liked", say: "Like is ticked.", html: `<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap" aria-haspopup="menu" aria-expanded="false" aria-label="3 Redreams"><div class="cbx-box"></div><span>3 Redreams</span></button></div>
<button class="cbx-wrap liked" aria-pressed="true" aria-label="13 likes"><div class="cbx-box"><svg viewBox="0 0 12 10" width="9" height="9" aria-hidden="true" focusable="false"><polyline points="1,5 4.5,8.5 11,1" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></polyline></svg></div><span>13 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>`, h: 80 },
      { id: "redreamed", n: "Redreamed", say: "Redream is ticked too.", html: `<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap redd" aria-haspopup="menu" aria-expanded="false" aria-label="4 Redreams, Redreamed"><div class="cbx-box"><svg viewBox="0 0 12 10" width="9" height="9" aria-hidden="true" focusable="false"><polyline points="1,5 4.5,8.5 11,1" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></polyline></svg></div><span>4 Redreams</span></button></div>
<button class="cbx-wrap liked" aria-pressed="true" aria-label="13 likes"><div class="cbx-box"><svg viewBox="0 0 12 10" width="9" height="9" aria-hidden="true" focusable="false"><polyline points="1,5 4.5,8.5 11,1" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></polyline></svg></div><span>13 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>`, h: 80 },
      { id: "calm", n: "calm mode", say: "no numbers, just the words.", html: `<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap" aria-haspopup="menu" aria-expanded="false" aria-label="Redreams"><div class="cbx-box"></div><span>Redreams</span></button></div>
<button class="cbx-wrap" aria-pressed="false" aria-label="Likes"><div class="cbx-box"></div><span>Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>`, h: 80 },
      { id: "focused", n: "focused", say: "focus ring on Like.", html: `<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap" aria-haspopup="menu" aria-expanded="false" aria-label="3 Redreams"><div class="cbx-box"></div><span>3 Redreams</span></button></div>
<button class="cbx-wrap demo-focus" aria-pressed="false" aria-label="12 likes"><div class="cbx-box"></div><span>12 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>`, h: 80 }
    ],
    code: `<div class="ixn-row">
<button class="ixn-btn" aria-label="4 replies"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg><span>4 Replies</span></button>
<div class="lmenu lc-rdmenu"><button id="rd-d1-btn" type="button" class="cbx-wrap" aria-haspopup="menu" aria-expanded="false" aria-label="3 Redreams"><div class="cbx-box"></div><span>3 Redreams</span></button></div>
<button class="cbx-wrap" aria-pressed="false" aria-label="12 likes"><div class="cbx-box"></div><span>12 Likes</span></button>
<div class="lmenu lc-dmenu" style="flex: .5; display: flex;"><button id="dopts-d1-btn" type="button" class="ixn-btn" aria-haspopup="menu" aria-expanded="false" aria-label="More, Dream by Ava"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button></div>
</div>`,
    js: `// Like (js/core.js, cut down). ReDream opens the pop-up menu instead, see the pop-up menu page.
likeBtn.addEventListener("click", function () {
  const on = likeBtn.getAttribute("aria-pressed") !== "true";
  likeBtn.setAttribute("aria-pressed", on ? "true" : "false");
  likeBtn.classList.toggle("liked", on);
  likeBtn.querySelector(".cbx-box").innerHTML = on ? CHECK_SVG : "";
  announce(on ? "Liked" : "Like removed");
});`,
    vo: [
      `Like says the count first: "12 likes, toggle button". after u double tap it, the live region says "Liked" and the button reads as selected.`,
      `ReDream says "3 Redreams, pop up button", and ", Redreamed" when u already did. double tap opens Redream and Quote Dream.`,
      "the tick box picture is hidden. the state comes from the button itself, so VoiceOver never says it twice.",
      "braille display: Enter on Like likes it. Enter on ReDream opens the menu, then Enter on Redream."
    ],
    rel: ["dream-card", "popup-menu", "live-region", "checkboxes"],
  },
  {
    slug: "more-menu-list",
    t: "More menu list",
    s: "the list of big rows on the More screen, plus the Apps group that opens and closes.",
    where: [
      "the More screen is a list of big rows: Cherry, Drafts, LooscidID, Settings and Send Feedback. each row is one button with a name and a short line under it.",
      "under it there's an Apps group that opens and closes (it's a disclosure button). no headings inside the rows, on purpose, so VoiceOver reads each row as one thing."
    ],
    states: [
      { id: "normal", n: "normal", say: "Apps is closed.", html: `<div style="margin-top: 8px;"><ul class="mlist more-items" role="list" style="list-style: none; margin: 0; padding: 0;">
<li><button class="snav" type="button" aria-label="Cherry"><div class="snav-l"><div class="snav-ic" style="background: #6d28d922; font-size: 17px;" aria-hidden="true">Cherry</div><div><div class="snav-title">Cherry</div><div class="snav-sub">Cherry - DO IT YOUR WAY</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Drafts"><div class="snav-l"><div class="snav-ic" style="background: #37415122; font-size: 17px;" aria-hidden="true">Drafts</div><div><div class="snav-title">Drafts</div><div class="snav-sub">Your saved Dream drafts</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="LooscidID"><div class="snav-l"><div class="snav-ic" style="background: #6d28d922; font-size: 17px;" aria-hidden="true">LooscidID</div><div><div class="snav-title">LooscidID</div><div class="snav-sub">Profile, login methods and security</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Settings"><div class="snav-l"><div class="snav-ic" style="background: #37415122; font-size: 17px;" aria-hidden="true">Settings</div><div><div class="snav-title">Settings</div><div class="snav-sub">LooscidID, privacy, accessibility</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Send Feedback"><div class="snav-l"><div class="snav-ic" style="background: #0e749022; font-size: 17px;" aria-hidden="true">Send Feedback</div><div><div class="snav-title">Send Feedback</div><div class="snav-sub">Help us improve Looscid</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
</ul>
<div class="more-apps" style="margin-top: 8px;"><div class="msec-hdr" style="padding: 0;"><button id="more-apps-toggle" type="button" class="msec-toggle" aria-expanded="false" aria-controls="more-apps-body"><span style="display: flex; align-items: center; gap: 7px;"><span>Apps</span></span><span class="msec-toggle-ic" aria-hidden="true">›</span></button></div><div id="more-apps-body" class="msec-body" hidden><ul class="mlist" role="list">
<li class="mli"><button id="more-apps-projects" type="button" class="mitem"><span class="mitem-lbl">Projects</span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li class="mli"><button id="more-apps-music" type="button" class="mitem"><span class="mitem-lbl">Music</span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
</ul></div></div>
</div>`, h: 470 },
      { id: "apps-open", n: "Apps open", say: "the Apps group is open and its arrow turned.", html: `<div style="margin-top: 8px;"><ul class="mlist more-items" role="list" style="list-style: none; margin: 0; padding: 0;">
<li><button class="snav" type="button" aria-label="Cherry"><div class="snav-l"><div class="snav-ic" style="background: #6d28d922; font-size: 17px;" aria-hidden="true">Cherry</div><div><div class="snav-title">Cherry</div><div class="snav-sub">Cherry - DO IT YOUR WAY</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Drafts"><div class="snav-l"><div class="snav-ic" style="background: #37415122; font-size: 17px;" aria-hidden="true">Drafts</div><div><div class="snav-title">Drafts</div><div class="snav-sub">Your saved Dream drafts</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="LooscidID"><div class="snav-l"><div class="snav-ic" style="background: #6d28d922; font-size: 17px;" aria-hidden="true">LooscidID</div><div><div class="snav-title">LooscidID</div><div class="snav-sub">Profile, login methods and security</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Settings"><div class="snav-l"><div class="snav-ic" style="background: #37415122; font-size: 17px;" aria-hidden="true">Settings</div><div><div class="snav-title">Settings</div><div class="snav-sub">LooscidID, privacy, accessibility</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Send Feedback"><div class="snav-l"><div class="snav-ic" style="background: #0e749022; font-size: 17px;" aria-hidden="true">Send Feedback</div><div><div class="snav-title">Send Feedback</div><div class="snav-sub">Help us improve Looscid</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
</ul>
<div class="more-apps" style="margin-top: 8px;"><div class="msec-hdr" style="padding: 0;"><button id="more-apps-toggle" type="button" class="msec-toggle" aria-expanded="true" aria-controls="more-apps-body"><span style="display: flex; align-items: center; gap: 7px;"><span>Apps</span></span><span class="msec-toggle-ic open" aria-hidden="true">›</span></button></div><div id="more-apps-body" class="msec-body"><ul class="mlist" role="list">
<li class="mli"><button id="more-apps-projects" type="button" class="mitem"><span class="mitem-lbl">Projects</span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li class="mli"><button id="more-apps-music" type="button" class="mitem"><span class="mitem-lbl">Music</span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
</ul></div></div>
</div>`, h: 590 },
      { id: "focused", n: "focused", say: "focus ring on Settings.", html: `<div style="margin-top: 8px;"><ul class="mlist more-items" role="list" style="list-style: none; margin: 0; padding: 0;">
<li><button class="snav" type="button" aria-label="Cherry"><div class="snav-l"><div class="snav-ic" style="background: #6d28d922; font-size: 17px;" aria-hidden="true">Cherry</div><div><div class="snav-title">Cherry</div><div class="snav-sub">Cherry - DO IT YOUR WAY</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Drafts"><div class="snav-l"><div class="snav-ic" style="background: #37415122; font-size: 17px;" aria-hidden="true">Drafts</div><div><div class="snav-title">Drafts</div><div class="snav-sub">Your saved Dream drafts</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="LooscidID"><div class="snav-l"><div class="snav-ic" style="background: #6d28d922; font-size: 17px;" aria-hidden="true">LooscidID</div><div><div class="snav-title">LooscidID</div><div class="snav-sub">Profile, login methods and security</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav demo-focus" type="button" aria-label="Settings"><div class="snav-l"><div class="snav-ic" style="background: #37415122; font-size: 17px;" aria-hidden="true">Settings</div><div><div class="snav-title">Settings</div><div class="snav-sub">LooscidID, privacy, accessibility</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Send Feedback"><div class="snav-l"><div class="snav-ic" style="background: #0e749022; font-size: 17px;" aria-hidden="true">Send Feedback</div><div><div class="snav-title">Send Feedback</div><div class="snav-sub">Help us improve Looscid</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
</ul>
<div class="more-apps" style="margin-top: 8px;"><div class="msec-hdr" style="padding: 0;"><button id="more-apps-toggle" type="button" class="msec-toggle" aria-expanded="false" aria-controls="more-apps-body"><span style="display: flex; align-items: center; gap: 7px;"><span>Apps</span></span><span class="msec-toggle-ic" aria-hidden="true">›</span></button></div><div id="more-apps-body" class="msec-body" hidden><ul class="mlist" role="list">
<li class="mli"><button id="more-apps-projects" type="button" class="mitem"><span class="mitem-lbl">Projects</span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li class="mli"><button id="more-apps-music" type="button" class="mitem"><span class="mitem-lbl">Music</span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
</ul></div></div>
</div>`, h: 470 }
    ],
    code: `<div style="margin-top: 8px;"><ul class="mlist more-items" role="list" style="list-style: none; margin: 0; padding: 0;">
<li><button class="snav" type="button" aria-label="Cherry"><div class="snav-l"><div class="snav-ic" style="background: #6d28d922; font-size: 17px;" aria-hidden="true">Cherry</div><div><div class="snav-title">Cherry</div><div class="snav-sub">Cherry - DO IT YOUR WAY</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Drafts"><div class="snav-l"><div class="snav-ic" style="background: #37415122; font-size: 17px;" aria-hidden="true">Drafts</div><div><div class="snav-title">Drafts</div><div class="snav-sub">Your saved Dream drafts</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="LooscidID"><div class="snav-l"><div class="snav-ic" style="background: #6d28d922; font-size: 17px;" aria-hidden="true">LooscidID</div><div><div class="snav-title">LooscidID</div><div class="snav-sub">Profile, login methods and security</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Settings"><div class="snav-l"><div class="snav-ic" style="background: #37415122; font-size: 17px;" aria-hidden="true">Settings</div><div><div class="snav-title">Settings</div><div class="snav-sub">LooscidID, privacy, accessibility</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li><button class="snav" type="button" aria-label="Send Feedback"><div class="snav-l"><div class="snav-ic" style="background: #0e749022; font-size: 17px;" aria-hidden="true">Send Feedback</div><div><div class="snav-title">Send Feedback</div><div class="snav-sub">Help us improve Looscid</div></div></div><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
</ul>
<div class="more-apps" style="margin-top: 8px;"><div class="msec-hdr" style="padding: 0;"><button id="more-apps-toggle" type="button" class="msec-toggle" aria-expanded="false" aria-controls="more-apps-body"><span style="display: flex; align-items: center; gap: 7px;"><span>Apps</span></span><span class="msec-toggle-ic" aria-hidden="true">›</span></button></div><div id="more-apps-body" class="msec-body" hidden><ul class="mlist" role="list">
<li class="mli"><button id="more-apps-projects" type="button" class="mitem"><span class="mitem-lbl">Projects</span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
<li class="mli"><button id="more-apps-music" type="button" class="mitem"><span class="mitem-lbl">Music</span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="13" height="13"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>
</ul></div></div>
</div>`,
    js: `// the Apps group (js/more.js, cut down): a plain disclosure button
const t = document.getElementById("more-apps-toggle"), body = document.getElementById("more-apps-body");
t.addEventListener("click", function () {
  const open = t.getAttribute("aria-expanded") !== "true";
  t.setAttribute("aria-expanded", open ? "true" : "false");
  body.hidden = !open;
  t.querySelector(".msec-toggle-ic").classList.toggle("open", open);
});
body.addEventListener("keydown", function (e) { if (e.key === "Escape") { t.click(); t.focus(); } });`,
    vo: [
      `each row is one swipe: "Settings, button". the line under it is for eyes, VoiceOver keeps it short.`,
      `VoiceOver says "list, 5 items" when u enter, so u know how long it is.`,
      `the Apps group says "Apps, button, collapsed". double tap and it says "expanded", then swipe right into the apps. Escape closes it and puts u back on Apps.`,
      "braille display: Enter on a row opens it, Enter on Apps opens or closes the group."
    ],
    rel: ["back-header", "bottom-tab-bar", "buttons"],
  },
  {
    slug: "popup-menu",
    t: "Pop-up menu",
    s: "a button that opens a short menu, like Sort, a Dream's More menu and ReDream.",
    where: [
      "it's the button + little menu combo. Sort on Home uses it, so does a Dream's More menu, ReDream, and More on a profile.",
      "the menu always ends with a Close item, so u never get stuck in it."
    ],
    states: [
      { id: "closed", n: "closed", say: "just the button.", html: `<div class="lmenu lmenu-inline"><button id="feed-sort-btn" type="button" class="btn bgb lc-btn" aria-haspopup="menu" aria-expanded="false"><span>Sort: Latest</span><span class="lmenu-caret" aria-hidden="true">▾</span></button></div>`, h: 90 },
      { id: "open", n: "open", say: "the menu is open and Latest is ticked.", html: `<div class="lmenu lmenu-inline"><button id="feed-sort-btn" type="button" class="btn bgb lc-btn" aria-haspopup="menu" aria-expanded="true" aria-controls="feed-sort"><span>Sort: Latest</span><span class="lmenu-caret" aria-hidden="true">▴</span></button><div class="lmenu-list"><ul id="feed-sort" role="menu" class="lmenu-ul" aria-label="Sort" tabindex="-1"><li role="menuitemradio" aria-checked="true" tabindex="0" class="lmenu-item act"><span class="lmenu-check" aria-hidden="true">✓</span><span>Latest</span></li><li role="menuitemradio" aria-checked="false" tabindex="-1" class="lmenu-item"><span class="lmenu-check" aria-hidden="true"></span><span>Popular</span></li><li role="menuitem" tabindex="-1" aria-label="Close Sort" class="lmenu-item lmenu-close"><span>Close</span></li></ul></div></div>`, h: 250 },
      { id: "focused", n: "focused item", say: "focus on Latest inside the open menu.", html: `<div class="lmenu lmenu-inline"><button id="feed-sort-btn" type="button" class="btn bgb lc-btn" aria-haspopup="menu" aria-expanded="true" aria-controls="feed-sort"><span>Sort: Latest</span><span class="lmenu-caret" aria-hidden="true">▴</span></button><div class="lmenu-list"><ul id="feed-sort" role="menu" class="lmenu-ul" aria-label="Sort" tabindex="-1"><li role="menuitemradio" aria-checked="true" tabindex="0" class="lmenu-item act demo-focus"><span class="lmenu-check" aria-hidden="true">✓</span><span>Latest</span></li><li role="menuitemradio" aria-checked="false" tabindex="-1" class="lmenu-item"><span class="lmenu-check" aria-hidden="true"></span><span>Popular</span></li><li role="menuitem" tabindex="-1" aria-label="Close Sort" class="lmenu-item lmenu-close"><span>Close</span></li></ul></div></div>`, h: 250 }
    ],
    code: `<div class="lmenu lmenu-inline"><button id="feed-sort-btn" type="button" class="btn bgb lc-btn" aria-haspopup="menu" aria-expanded="true" aria-controls="feed-sort"><span>Sort: Latest</span><span class="lmenu-caret" aria-hidden="true">▴</span></button><div class="lmenu-list"><ul id="feed-sort" role="menu" class="lmenu-ul" aria-label="Sort" tabindex="-1"><li role="menuitemradio" aria-checked="true" tabindex="0" class="lmenu-item act"><span class="lmenu-check" aria-hidden="true">✓</span><span>Latest</span></li><li role="menuitemradio" aria-checked="false" tabindex="-1" class="lmenu-item"><span class="lmenu-check" aria-hidden="true"></span><span>Popular</span></li><li role="menuitem" tabindex="-1" aria-label="Close Sort" class="lmenu-item lmenu-close"><span>Close</span></li></ul></div></div>`,
    js: `// how the menu moves focus (js/core.js LcMenu, cut down)
btn.addEventListener("click", function () { open(); list.querySelector("[tabindex='0']").focus(); });
list.addEventListener("keydown", function (e) {
  const items = Array.from(list.querySelectorAll("[role^='menuitem']"));
  const i = items.indexOf(document.activeElement);
  if (e.key === "ArrowDown") items[(i + 1) % items.length].focus();
  if (e.key === "ArrowUp") items[(i - 1 + items.length) % items.length].focus();
  if (e.key === "Enter" || e.key === " ") pick(items[i]);
  if (e.key === "Escape") { close(); btn.focus(); }
});`,
    vo: [
      `the button says "Sort: Latest, pop up button". double tap opens it.`,
      `inside, each item is one swipe: "Latest, checked", "Popular", then "Close Sort".`,
      "picking an item closes the menu and puts focus back on the button, which now says the new choice.",
      "two finger scrub or Escape closes it. braille display: Enter picks the item ur on."
    ],
    rel: ["like-redream-buttons", "dream-card", "native-select"],
  },
  {
    slug: "tabs",
    t: "Tabs",
    s: "the row of tabs at the top of a screen, like For You, Following and Federated.",
    where: [
      "Home has For You, Following and Federated. Discover, Circles, profiles and the Liked tab use the same row. one tab is picked, the list under it changes."
    ],
    states: [
      { id: "normal", n: "normal", say: "For You is picked.", html: `<div class="ftabs lc-feedtabs" role="tablist" aria-label="Feeds" id="feed-tablist"><button id="feed-tab-for-you" type="button" class="ftab on" role="tab" aria-selected="true" aria-setsize="3" aria-posinset="1" tabindex="0" aria-controls="feed-list">For You</button><button id="feed-tab-following" type="button" class="ftab" role="tab" aria-selected="false" aria-setsize="3" aria-posinset="2" tabindex="-1" aria-controls="feed-list">Following</button><button id="feed-tab-federated" type="button" class="ftab" role="tab" aria-selected="false" aria-setsize="3" aria-posinset="3" tabindex="-1" aria-controls="feed-list">Federated</button></div>`, h: 80 },
      { id: "other-tab", n: "another tab picked", say: "Following is picked.", html: `<div class="ftabs lc-feedtabs" role="tablist" aria-label="Feeds" id="feed-tablist"><button id="feed-tab-for-you" type="button" class="ftab" role="tab" aria-selected="false" aria-setsize="3" aria-posinset="1" tabindex="-1" aria-controls="feed-list">For You</button><button id="feed-tab-following" type="button" class="ftab on" role="tab" aria-selected="true" aria-setsize="3" aria-posinset="2" tabindex="0" aria-controls="feed-list">Following</button><button id="feed-tab-federated" type="button" class="ftab" role="tab" aria-selected="false" aria-setsize="3" aria-posinset="3" tabindex="-1" aria-controls="feed-list">Federated</button></div>`, h: 80 },
      { id: "focused", n: "focused", say: "focus ring on Federated.", html: `<div class="ftabs lc-feedtabs" role="tablist" aria-label="Feeds" id="feed-tablist"><button id="feed-tab-for-you" type="button" class="ftab on" role="tab" aria-selected="true" aria-setsize="3" aria-posinset="1" tabindex="0" aria-controls="feed-list">For You</button><button id="feed-tab-following" type="button" class="ftab" role="tab" aria-selected="false" aria-setsize="3" aria-posinset="2" tabindex="-1" aria-controls="feed-list">Following</button><button id="feed-tab-federated" type="button" class="ftab demo-focus" role="tab" aria-selected="false" aria-setsize="3" aria-posinset="3" tabindex="-1" aria-controls="feed-list">Federated</button></div>`, h: 80 }
    ],
    code: `<div class="ftabs lc-feedtabs" role="tablist" aria-label="Feeds" id="feed-tablist"><button id="feed-tab-for-you" type="button" class="ftab on" role="tab" aria-selected="true" aria-setsize="3" aria-posinset="1" tabindex="0" aria-controls="feed-list">For You</button><button id="feed-tab-following" type="button" class="ftab" role="tab" aria-selected="false" aria-setsize="3" aria-posinset="2" tabindex="-1" aria-controls="feed-list">Following</button><button id="feed-tab-federated" type="button" class="ftab" role="tab" aria-selected="false" aria-setsize="3" aria-posinset="3" tabindex="-1" aria-controls="feed-list">Federated</button></div>`,
    js: `// arrow keys move between tabs (js/core.js, cut down)
tablist.addEventListener("keydown", function (e) {
  const tabs = Array.from(tablist.querySelectorAll("[role=tab]"));
  let i = tabs.indexOf(document.activeElement);
  if (e.key === "ArrowRight") i = (i + 1) % tabs.length;
  else if (e.key === "ArrowLeft") i = (i - 1 + tabs.length) % tabs.length;
  else return;
  e.preventDefault(); tabs[i].focus(); tabs[i].click();
});`,
    vo: [
      `VoiceOver says "For You, selected, tab, 1 of 3". swipe right for the next tab.`,
      "double tap a tab to pick it. the list under it changes.",
      "keyboard: Left and Right arrows move between tabs. braille display: Enter picks the tab ur on."
    ],
    rel: ["bottom-tab-bar", "search-field", "profile-header"],
  },
  {
    slug: "checkboxes",
    t: "Checkboxes",
    s: "real checkboxes for every on/off setting. never toggles.",
    where: [
      "every on/off thing in Settings is a real checkbox in a big row, like High contrast and Bold text in Settings, Accessibility, Vision. the whole row is the label, so tapping anywhere on it works.",
      `the first-time setup question ("How do you use your device?") uses a checkbox list too, with a short line under each choice.`,
      `we use checkboxes, not toggle switches, because every screen reader says "checked" and "unchecked" the same way.`
    ],
    states: [
      { id: "unchecked", n: "unchecked", say: "all off.", html: `<div class="lc-grp lc-catpage">
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-highContrast"><span class="lc-sw-l">High contrast</span><input id="a11y-highContrast" type="checkbox" class="lc-cb-in"></label></div>
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-boldText"><span class="lc-sw-l">Bold text</span><input id="a11y-boldText" type="checkbox" class="lc-cb-in"></label></div>
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-dyslexiaFont"><span class="lc-sw-l">Dyslexia-friendly spacing</span><input id="a11y-dyslexiaFont" type="checkbox" class="lc-cb-in"></label></div>
</div>`, h: 230 },
      { id: "checked", n: "checked", say: "High contrast and Bold text are on.", html: `<div class="lc-grp lc-catpage">
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-highContrast"><span class="lc-sw-l">High contrast</span><input id="a11y-highContrast" type="checkbox" class="lc-cb-in" checked></label></div>
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-boldText"><span class="lc-sw-l">Bold text</span><input id="a11y-boldText" type="checkbox" class="lc-cb-in" checked></label></div>
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-dyslexiaFont"><span class="lc-sw-l">Dyslexia-friendly spacing</span><input id="a11y-dyslexiaFont" type="checkbox" class="lc-cb-in"></label></div>
</div>`, h: 230 },
      { id: "focused", n: "focused", say: "focus ring on Bold text.", html: `<div class="lc-grp lc-catpage">
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-highContrast"><span class="lc-sw-l">High contrast</span><input id="a11y-highContrast" type="checkbox" class="lc-cb-in"></label></div>
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb demo-focus" for="a11y-boldText"><span class="lc-sw-l">Bold text</span><input id="a11y-boldText" type="checkbox" class="lc-cb-in"></label></div>
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-dyslexiaFont"><span class="lc-sw-l">Dyslexia-friendly spacing</span><input id="a11y-dyslexiaFont" type="checkbox" class="lc-cb-in"></label></div>
</div>`, h: 230 },
      { id: "disabled", n: "disabled", say: "the last one can't be changed rn.", html: `<div class="lc-grp lc-catpage">
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-highContrast"><span class="lc-sw-l">High contrast</span><input id="a11y-highContrast" type="checkbox" class="lc-cb-in"></label></div>
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-boldText"><span class="lc-sw-l">Bold text</span><input id="a11y-boldText" type="checkbox" class="lc-cb-in"></label></div>
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-dyslexiaFont"><span class="lc-sw-l">Dyslexia-friendly spacing</span><input id="a11y-dyslexiaFont" type="checkbox" class="lc-cb-in" disabled></label></div>
</div>`, h: 230 },
      { id: "setup-list", n: "setup question list", say: "the checkbox list from the first-time setup, one choice picked.", html: `<fieldset class="lc-q-set"><legend class="sr-pause">I use my device</legend>
<label class="lc-q-opt"><input type="checkbox" checked><span class="lc-q-txt"><span class="lc-q-l">With a screen reader</span><span class="lc-q-s">VoiceOver, TalkBack, NVDA or JAWS</span></span></label>
<label class="lc-q-opt"><input type="checkbox"><span class="lc-q-txt"><span class="lc-q-l">With a braille display</span><span class="lc-q-s">Braille output, and Enter sends</span></span></label>
<label class="lc-q-opt"><input type="checkbox"><span class="lc-q-txt"><span class="lc-q-l">With low vision</span><span class="lc-q-s">Larger text, high contrast and bold text</span></span></label>
</fieldset>`, h: 270 }
    ],
    code: `<div class="lc-grp lc-catpage">
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-highContrast"><span class="lc-sw-l">High contrast</span><input id="a11y-highContrast" type="checkbox" class="lc-cb-in"></label></div>
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-boldText"><span class="lc-sw-l">Bold text</span><input id="a11y-boldText" type="checkbox" class="lc-cb-in"></label></div>
<div class="lc-row lc-cbrow"><label class="lc-sw lc-cb" for="a11y-dyslexiaFont"><span class="lc-sw-l">Dyslexia-friendly spacing</span><input id="a11y-dyslexiaFont" type="checkbox" class="lc-cb-in"></label></div>
</div>`,
    js: `// a setting saves the moment it changes (js/more.js, cut down)
document.getElementById("a11y-boldText").addEventListener("change", function (e) {
  saveSetting("boldText", e.target.checked); // stays on this device
});`,
    vo: [
      `VoiceOver says "Bold text, checkbox, unchecked". double tap and it says "checked". that's it, no extra "Bold text on" after, so u don't hear it twice.`,
      "the label is the whole row, so the 44px+ tap target is way bigger than the box.",
      `a disabled one says "dimmed" and double tap does nothing.`,
      `in the setup list, VoiceOver says the group name ("I use my device") when u enter it, then each choice with its short line.`,
      "braille display: Space or Enter ticks the box ur on. the setup checkboxes show as a short braille role so the line stays short."
    ],
    rel: ["radio-group", "native-select", "buttons"],
  },
  {
    slug: "radio-group",
    t: "Radio group",
    s: "pick exactly one: a fieldset with a legend and real radio buttons, like Text size.",
    where: [
      `when u can only pick one thing, it's a radio group. Text size in Settings, Accessibility, Vision is one, and so is Feed mode on Home and the reason list in the <a href="../mod-reason-picker/">mod reason picker</a>.`,
      "always a real fieldset with a legend, so the question gets said once when u enter the group."
    ],
    states: [
      { id: "normal", n: "normal", say: "Default is picked.", html: `<fieldset class="lc-fs" id="a11y-textSize"><legend class="lc-fs-l">Text size</legend><div class="lc-radios"><label class="lc-radio on"><input type="radio" name="lc-textsize" checked><span>Default</span></label><label class="lc-radio"><input type="radio" name="lc-textsize"><span>Large</span></label><label class="lc-radio"><input type="radio" name="lc-textsize"><span>Larger</span></label></div></fieldset>`, h: 130 },
      { id: "other", n: "another one picked", say: "Larger is picked.", html: `<fieldset class="lc-fs" id="a11y-textSize"><legend class="lc-fs-l">Text size</legend><div class="lc-radios"><label class="lc-radio"><input type="radio" name="lc-textsize"><span>Default</span></label><label class="lc-radio"><input type="radio" name="lc-textsize"><span>Large</span></label><label class="lc-radio on"><input type="radio" name="lc-textsize" checked><span>Larger</span></label></div></fieldset>`, h: 130 },
      { id: "focused", n: "focused", say: "focus ring on Large.", html: `<fieldset class="lc-fs" id="a11y-textSize"><legend class="lc-fs-l">Text size</legend><div class="lc-radios"><label class="lc-radio on"><input type="radio" name="lc-textsize" checked><span>Default</span></label><label class="lc-radio demo-focus"><input type="radio" name="lc-textsize"><span>Large</span></label><label class="lc-radio"><input type="radio" name="lc-textsize"><span>Larger</span></label></div></fieldset>`, h: 130 }
    ],
    code: `<fieldset class="lc-fs" id="a11y-textSize"><legend class="lc-fs-l">Text size</legend><div class="lc-radios"><label class="lc-radio on"><input type="radio" name="lc-textsize" checked><span>Default</span></label><label class="lc-radio"><input type="radio" name="lc-textsize"><span>Large</span></label><label class="lc-radio"><input type="radio" name="lc-textsize"><span>Larger</span></label></div></fieldset>`,
    js: null,
    vo: [
      `entering the group VoiceOver says "Text size", then "Default, radio button, checked, 1 of 3".`,
      "swipe right for the next choice, double tap to pick it.",
      "keyboard: arrow keys move and pick in one go, the way radio buttons always work. braille display: Space or Enter picks the one ur on."
    ],
    rel: ["checkboxes", "native-select", "mod-reason-picker"],
  },
  {
    slug: "native-select",
    t: "Native select picker",
    s: "a plain select with a visible label above it, Fork Lab style. the phone's own picker opens.",
    where: [
      "when there's a list to pick from, we use the browser's own select, with a real label above it, the same way our Fork Lab demo picker works. the phone opens its own picker wheel or list, which every screen reader already knows.",
      `the first one in looscid is the Show filter on the <a href="../report-a-problem/">Report a problem</a> list (everything, still open, new, working on it, fixed, closed). mods get one for a report's status too. no custom dropdowns, ever.`
    ],
    states: [
      { id: "normal", n: "normal", say: "showing everything.", html: `<label for="lc-issue-filter" class="lc-fs-l" style="display: block;">Show</label>
<select id="lc-issue-filter" class="inp lc-issue-sel">
<option value="all" selected>Everything</option>
<option value="open">Still open</option>
<option value="new">New</option>
<option value="working">Working on it</option>
<option value="fixed">Fixed</option>
<option value="closed">Closed</option>
</select>`, h: 110 },
      { id: "picked", n: "something picked", say: "Working on it is picked.", html: `<label for="lc-issue-filter" class="lc-fs-l" style="display: block;">Show</label>
<select id="lc-issue-filter" class="inp lc-issue-sel">
<option value="all">Everything</option>
<option value="open">Still open</option>
<option value="new">New</option>
<option value="working" selected>Working on it</option>
<option value="fixed">Fixed</option>
<option value="closed">Closed</option>
</select>`, h: 110 },
      { id: "focused", n: "focused", say: "focus ring on the picker.", html: `<label for="lc-issue-filter" class="lc-fs-l" style="display: block;">Show</label>
<select id="lc-issue-filter" class="inp lc-issue-sel demo-focus">
<option value="all" selected>Everything</option>
<option value="open">Still open</option>
<option value="new">New</option>
<option value="working">Working on it</option>
<option value="fixed">Fixed</option>
<option value="closed">Closed</option>
</select>`, h: 110 },
      { id: "disabled", n: "disabled", say: "can't change it rn.", html: `<label for="lc-issue-filter" class="lc-fs-l" style="display: block;">Show</label>
<select id="lc-issue-filter" class="inp lc-issue-sel" disabled>
<option value="all" selected>Everything</option>
<option value="open">Still open</option>
<option value="new">New</option>
<option value="working">Working on it</option>
<option value="fixed">Fixed</option>
<option value="closed">Closed</option>
</select>`, h: 110 },
      { id: "error", n: "list can't load", say: "the plain offline line and a Try again button under it.", html: `<label for="lc-issue-filter" class="lc-fs-l" style="display: block;">Show</label>
<select id="lc-issue-filter" class="inp lc-issue-sel">
<option value="all" selected>Everything</option>
<option value="open">Still open</option>
<option value="new">New</option>
<option value="working">Working on it</option>
<option value="fixed">Fixed</option>
<option value="closed">Closed</option>
</select>
<p class="lc-desc">can't reach the report list rn, try again in a bit <button type="button" class="btn bgb lc-btn lc-issue-btn">Try again</button></p>`, h: 170 }
    ],
    code: `<label for="lc-issue-filter" class="lc-fs-l" style="display: block;">Show</label>
<select id="lc-issue-filter" class="inp lc-issue-sel">
<option value="all" selected>Everything</option>
<option value="open">Still open</option>
<option value="new">New</option>
<option value="working">Working on it</option>
<option value="fixed">Fixed</option>
<option value="closed">Closed</option>
</select>`,
    js: `// filter as soon as the pick changes, no Apply button (js/issues.js, cut down)
document.getElementById("lc-issue-filter").addEventListener("change", function (e) {
  filter = e.target.value;   // "all", "open", "new", "working", "fixed" or "closed"
  loadReports();             // reads the public list, then says what it found once
});`,
    vo: [
      `VoiceOver says "Show, Everything, pop up button".`,
      "double tap opens the phone's own picker. swipe up or down (or flick) to change it, then double tap Done.",
      "the label is a real label tag, so tapping the word Show focuses the picker too.",
      "braille display: Enter opens it, arrow keys or panning move through the list, Enter picks."
    ],
    rel: ["report-a-problem", "radio-group", "popup-menu"],
  },
  {
    slug: "back-header",
    t: "BackHeader",
    s: "the top bar on inner screens: a Back button and the screen's h1.",
    where: [
      "every screen u reach from somewhere else (Settings pages, Replies, a Circle) starts with this bar: a Back button, then the screen's name as its one h1. some screens add a button on the right."
    ],
    states: [
      { id: "normal", n: "normal", say: "Back and the title.", html: `<div class="hdr">
<div class="hdr-row">
<button class="bi" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
<h1 class="hdr-title" tabindex="-1">Accessibility</h1>
</div>
</div>`, h: 80 },
      { id: "with-right", n: "with a right button", say: "an extra button on the right.", html: `<div class="hdr">
<div class="hdr-row">
<button class="bi" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
<h1 class="hdr-title" tabindex="-1">Settings</h1><button class="bi" aria-label="Search settings"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
</div>
</div>`, h: 80 },
      { id: "focused", n: "focused", say: "focus ring on Back.", html: `<div class="hdr">
<div class="hdr-row">
<button class="bi demo-focus" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
<h1 class="hdr-title" tabindex="-1">Accessibility</h1>
</div>
</div>`, h: 80 }
    ],
    code: `<div class="hdr">
<div class="hdr-row">
<button class="bi" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
<h1 class="hdr-title" tabindex="-1">Accessibility</h1>
</div>
</div>`,
    js: `// BackHeader (js/core.js, the real one is React; this is the same thing in plain JS)
function backHeader(title, onBack) {
  const hdr = document.createElement("div"); hdr.className = "hdr";
  hdr.innerHTML = '<div class="hdr-row"><button class="bi" aria-label="Back">' + BACK_SVG + '</button>' +
    '<h1 class="hdr-title" tabindex="-1"></h1></div>';
  hdr.querySelector("h1").textContent = title;
  hdr.querySelector("button").addEventListener("click", onBack);
  return hdr;
}
// on a new screen, focus goes to its h1 so VoiceOver says where u are
document.querySelector(".hdr-title").focus();`,
    vo: [
      `when the screen opens focus lands on the h1, so VoiceOver says "Accessibility, heading level 1".`,
      `swipe left once for "Back, button". the arrow picture is hidden.`,
      "the two finger scrub (Z gesture) goes back too, same as the Back button.",
      "braille display: Enter on Back goes back. the h1 gets a short braille line too."
    ],
    rel: ["bottom-tab-bar", "more-menu-list", "circle-header"],
  },
  {
    slug: "buttons",
    t: "Buttons",
    s: "the main button, the outline button and the round icon button.",
    where: [
      "3 kinds: the purple main button (btn bp) for the one big thing on a screen, the outline button (btn bgb) for everything else, and the round icon button (bi) for Back and friends.",
      "every button is a real button tag and at least 44px tall. icon buttons always have a name."
    ],
    states: [
      { id: "normal", n: "normal", say: "main, outline and icon.", html: `<div class="lc-grp" style="display: flex; flex-direction: column; gap: 10px;">
<button type="button" class="btn bp lc-big">Create a LooscidID</button>
<button type="button" class="btn bgb lc-big">Login</button>
<button class="bi" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
</div>`, h: 220 },
      { id: "focused", n: "focused", say: "focus ring on the main button.", html: `<div class="lc-grp" style="display: flex; flex-direction: column; gap: 10px;">
<button type="button" class="btn bp lc-big demo-focus">Create a LooscidID</button>
<button type="button" class="btn bgb lc-big">Login</button>
<button class="bi" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
</div>`, h: 220 },
      { id: "disabled", n: "disabled", say: "one dimmed but still focusable (it says why when pressed), one fully off.", html: `<div class="lc-grp" style="display: flex; flex-direction: column; gap: 10px;">
<button type="button" class="btn bp lc-big" aria-disabled="true" style="opacity: .5;">Remove Dream</button>
<button type="button" class="btn bgb lc-big" disabled>Reset</button>
</div>`, h: 150 }
    ],
    code: `<div class="lc-grp" style="display: flex; flex-direction: column; gap: 10px;">
<button type="button" class="btn bp lc-big">Create a LooscidID</button>
<button type="button" class="btn bgb lc-big">Login</button>
<button class="bi" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
</div>`,
    js: null,
    vo: [
      `VoiceOver says "Create a LooscidID, button". icon buttons say their name, like "Back, button".`,
      `when a button can't do its thing yet, we keep it focusable and say "dimmed" (aria-disabled), and pressing it tells u why. a fully disabled one gets skipped by Tab but VoiceOver still reads it as "dimmed".`,
      "braille display: Enter (or a routing key) presses the button ur on."
    ],
    rel: ["checkboxes", "popup-menu", "back-header"],
  },
  {
    slug: "text-field",
    t: "Text field",
    s: "a text box with a real label above it, and a short message under it when something's off.",
    where: [
      "names, bios, reasons, the Commandbar: anywhere u type, it's a real input (or textarea) with a real label, never just a placeholder.",
      "if something's wrong, a short line shows right under it and gets said once. we never use the required attribute, the app checks it and tells u in words."
    ],
    states: [
      { id: "empty", n: "empty", say: "nothing typed yet.", html: `<div class="lc-grp">
<label for="circle-name" class="lc-fs-l" style="display: block;">Circle name</label>
<input id="circle-name" type="text" class="inp" autocomplete="off">
</div>`, h: 120 },
      { id: "typed", n: "typed", say: "some words in it.", html: `<div class="lc-grp">
<label for="circle-name" class="lc-fs-l" style="display: block;">Circle name</label>
<input id="circle-name" type="text" class="inp" autocomplete="off" value="night owls">
</div>`, h: 120 },
      { id: "focused", n: "focused", say: "focus ring, ready to type.", html: `<div class="lc-grp">
<label for="circle-name" class="lc-fs-l" style="display: block;">Circle name</label>
<input id="circle-name" type="text" class="inp demo-focus" autocomplete="off">
</div>`, h: 120 },
      { id: "error", n: "error", say: "a short message under it.", html: `<div class="lc-grp">
<label for="circle-name" class="lc-fs-l" style="display: block;">Circle name</label>
<input id="circle-name" type="text" class="inp" autocomplete="off">
<p class="lc-desc" role="status">Type at least 2 letters.</p>
</div>`, h: 150 }
    ],
    code: `<div class="lc-grp">
<label for="circle-name" class="lc-fs-l" style="display: block;">Circle name</label>
<input id="circle-name" type="text" class="inp" autocomplete="off">
</div>`,
    js: `// check on submit, tell them in words (no required attribute)
form.addEventListener("submit", function (e) {
  const v = document.getElementById("circle-name").value.trim();
  if (v.length < 2) { e.preventDefault(); showMsg("Type at least 2 letters."); document.getElementById("circle-name").focus(); }
});`,
    vo: [
      `VoiceOver says "Circle name, text field", then "double tap to edit".`,
      "the message under it is a status, so it's said once when it shows up, without moving ur focus.",
      "braille display: type right into it. Enter sends the form where that makes sense (like the Commandbar)."
    ],
    rel: ["search-field", "commandbar", "mod-reason-picker"],
  },
  {
    slug: "search-field",
    t: "Search field and results",
    s: "the search box on Discover and the Dreamor rows it finds.",
    where: [
      "top of Discover. type and the results show right under it, no Search button needed. each Dreamor is one row with a Follow button next to it.",
      "the number of results is said out loud a moment after u stop typing, so VoiceOver doesn't spam u on every letter."
    ],
    states: [
      { id: "empty", n: "empty", say: "nothing typed, nothing trending.", html: `<div style="padding: 10px 16px 6px;"><input class="inp" placeholder="Search Dreamors, Dreams, Circles, topics" aria-label="Search" role="searchbox" style="font-size: 14px;"></div>
<div id="disc-panel" role="tabpanel" aria-label="Trending"><div class="es"><div class="esl">Nothing is trending yet</div><p style="font-size: 12px; color: var(--tx3); margin-top: 6px; line-height: 1.6;">Search above to find Dreamors, Dreams and Circles.</p></div></div>`, h: 210 },
      { id: "results", n: "results", say: `2 Dreamors found for "ava".`, html: `<div style="padding: 10px 16px 6px;"><input class="inp" placeholder="Search Dreamors, Dreams, Circles, topics" aria-label="Search" role="searchbox" style="font-size: 14px;" value="ava"></div>
<div id="disc-panel" role="tabpanel" aria-label="All">
<div class="ci"><button type="button" class="lc-disc-open" style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; background: none; border: none; padding: 0; color: inherit; font: inherit; text-align: left; cursor: pointer;" aria-label="Ava, verified, @ava, 120 followers"><div class="av" aria-hidden="true" style="width: 44px; height: 44px; font-size: 15px; background: linear-gradient(135deg, #6d28d9, #9333ea);"><span>A</span></div><div class="cif" aria-hidden="true"><div class="cnm">Ava<span style="color: var(--ac2); font-size: 11px;"> ✓</span></div><div class="cpv">@ava <span aria-hidden="true">·</span> 120 followers</div></div></button><button type="button" class="btn bp" style="padding: 7px 14px; font-size: 12px;" aria-pressed="false">Follow</button></div>
<div class="ci"><button type="button" class="lc-disc-open" style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; background: none; border: none; padding: 0; color: inherit; font: inherit; text-align: left; cursor: pointer;" aria-label="Avery, @avery, 8 followers"><div class="av" aria-hidden="true" style="width: 44px; height: 44px; font-size: 15px; background: linear-gradient(135deg, #0e7490, #34d399);"><span>A</span></div><div class="cif" aria-hidden="true"><div class="cnm">Avery</div><div class="cpv">@avery <span aria-hidden="true">·</span> 8 followers</div></div></button><button type="button" class="btn bgb" style="padding: 7px 14px; font-size: 12px;" aria-pressed="true">Following</button></div>
</div>`, h: 220 },
      { id: "no-results", n: "no results", say: "nothing matched.", html: `<div style="padding: 10px 16px 6px;"><input class="inp" placeholder="Search Dreamors, Dreams, Circles, topics" aria-label="Search" role="searchbox" style="font-size: 14px;" value="zzz"></div>
<div id="disc-panel" role="tabpanel" aria-label="All"><div class="es"><div class="esl">No results</div><p style="font-size: 12px; color: var(--tx3); margin-top: 6px; line-height: 1.6;">No results for “zzz”. Try different words.</p></div></div>`, h: 210 },
      { id: "focused", n: "focused", say: "focus ring on the search box.", html: `<div style="padding: 10px 16px 6px;"><input class="inp demo-focus" placeholder="Search Dreamors, Dreams, Circles, topics" aria-label="Search" role="searchbox" style="font-size: 14px;"></div>
<div id="disc-panel" role="tabpanel" aria-label="Trending"><div class="es"><div class="esl">Nothing is trending yet</div><p style="font-size: 12px; color: var(--tx3); margin-top: 6px; line-height: 1.6;">Search above to find Dreamors, Dreams and Circles.</p></div></div>`, h: 210 }
    ],
    code: `<div style="padding: 10px 16px 6px;"><input class="inp" placeholder="Search Dreamors, Dreams, Circles, topics" aria-label="Search" role="searchbox" style="font-size: 14px;" value="ava"></div>
<div id="disc-panel" role="tabpanel" aria-label="All">
<div class="ci"><button type="button" class="lc-disc-open" style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; background: none; border: none; padding: 0; color: inherit; font: inherit; text-align: left; cursor: pointer;" aria-label="Ava, verified, @ava, 120 followers"><div class="av" aria-hidden="true" style="width: 44px; height: 44px; font-size: 15px; background: linear-gradient(135deg, #6d28d9, #9333ea);"><span>A</span></div><div class="cif" aria-hidden="true"><div class="cnm">Ava<span style="color: var(--ac2); font-size: 11px;"> ✓</span></div><div class="cpv">@ava <span aria-hidden="true">·</span> 120 followers</div></div></button><button type="button" class="btn bp" style="padding: 7px 14px; font-size: 12px;" aria-pressed="false">Follow</button></div>
<div class="ci"><button type="button" class="lc-disc-open" style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; background: none; border: none; padding: 0; color: inherit; font: inherit; text-align: left; cursor: pointer;" aria-label="Avery, @avery, 8 followers"><div class="av" aria-hidden="true" style="width: 44px; height: 44px; font-size: 15px; background: linear-gradient(135deg, #0e7490, #34d399);"><span>A</span></div><div class="cif" aria-hidden="true"><div class="cnm">Avery</div><div class="cpv">@avery <span aria-hidden="true">·</span> 8 followers</div></div></button><button type="button" class="btn bgb" style="padding: 7px 14px; font-size: 12px;" aria-pressed="true">Following</button></div>
</div>`,
    js: `// say the count once, 450 ms after typing stops (js/core.js lcAnnounceCount)
let countTimer;
function announceCount(q, n) {
  clearTimeout(countTimer);
  if (!q.trim()) return;
  countTimer = setTimeout(function () { announce(n === 0 ? "No results" : n + (n === 1 ? " result" : " results")); }, 450);
}`,
    vo: [
      `VoiceOver says "Search, search field". type, pause, and it says "2 results".`,
      `each Dreamor row is one swipe: "Ava, verified, @ava, 120 followers, button", then "Follow, toggle button".`,
      "the picture and the dot are hidden so the row reads clean.",
      "braille display: type in the field, then pan down to the rows. Enter opens a profile or follows."
    ],
    rel: ["tabs", "empty-state", "live-region"],
  },
  {
    slug: "commandbar",
    t: "Commandbar",
    s: "type a command, press Enter, get the answer. the fastest way around looscid w a keyboard or braille display.",
    where: [
      "press Ctrl+K (or Cmd+K) anywhere, or open it from Settings. type things like help, status or open feed. answers show in the output above the box.",
      "it has its own screen with quick command buttons for the common stuff, so u don't have to type."
    ],
    states: [
      { id: "empty", n: "empty", say: "just opened, no output yet.", html: `<div class="lc-term" role="region" aria-labelledby="lc-term-h">
<div class="lc-term-hd"><h1 id="lc-term-h" class="lc-term-title" tabindex="-1">Commandbar</h1><button type="button" class="lc-icon-btn lc-term-close" aria-label="Close Commandbar">Close</button></div>
<div class="lc-term-body" tabindex="0" role="region" aria-label="Commandbar scrollback">
<p class="lc-term-hi">Welcome to Commandbar. Type help and press Enter. Commands you run in the bar show here too.</p>
<div class="lc-out-h"><button type="button" id="lc-out-toggle" class="lc-out-tg" aria-expanded="true" aria-controls="lc-out"><span class="lc-out-ic" aria-hidden="true">▾</span>Commandbar output, 0 lines</button></div>
<div id="lc-out" class="lc-out" role="log" aria-live="off" aria-label="Commandbar output"><p class="lc-l lc-l-dimt">No output yet.</p></div>
</div>
<div class="lc-term-foot">
<h2 id="lc-chips-h" class="lc-chips-h">Quick commands</h2>
<ul class="lc-chips" aria-labelledby="lc-chips-h"><li><button type="button" class="lc-chip">Help</button></li><li><button type="button" class="lc-chip">Open feed</button></li><li><button type="button" class="lc-chip">Settings</button></li><li><button type="button" class="lc-chip">Status</button></li></ul>
<form class="lc-term-form" autocomplete="off"><label for="lc-term-input" class="lc-term-label"><span class="lc-prompt" aria-hidden="true">looscid&gt;</span><span class="sr-pause">Command</span></label><input id="lc-term-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="send"><button type="submit" class="btn bp lc-run">Run</button></form>
<p id="lc-term-hint" class="lc-desc">Enter runs. Up and Down arrows recall earlier commands. Escape closes.</p>
</div>
</div>`, h: 520 },
      { id: "output", n: "with output", say: "after running status.", html: `<div class="lc-term" role="region" aria-labelledby="lc-term-h">
<div class="lc-term-hd"><h1 id="lc-term-h" class="lc-term-title" tabindex="-1">Commandbar</h1><button type="button" class="lc-icon-btn lc-term-close" aria-label="Close Commandbar">Close</button></div>
<div class="lc-term-body" tabindex="0" role="region" aria-label="Commandbar scrollback">
<p class="lc-term-hi">Welcome to Commandbar. Type help and press Enter. Commands you run in the bar show here too.</p>
<div class="lc-out-h"><button type="button" id="lc-out-toggle" class="lc-out-tg" aria-expanded="true" aria-controls="lc-out"><span class="lc-out-ic" aria-hidden="true">▾</span>Commandbar output, 2 lines</button></div>
<div id="lc-out" class="lc-out" role="log" aria-live="off" aria-label="Commandbar output"><p class="lc-l">looscid&gt; status</p><p class="lc-l">Looscid is online. (example answer)</p></div>
</div>
<div class="lc-term-foot">
<h2 id="lc-chips-h" class="lc-chips-h">Quick commands</h2>
<ul class="lc-chips" aria-labelledby="lc-chips-h"><li><button type="button" class="lc-chip">Help</button></li><li><button type="button" class="lc-chip">Open feed</button></li><li><button type="button" class="lc-chip">Settings</button></li><li><button type="button" class="lc-chip">Status</button></li></ul>
<form class="lc-term-form" autocomplete="off"><label for="lc-term-input" class="lc-term-label"><span class="lc-prompt" aria-hidden="true">looscid&gt;</span><span class="sr-pause">Command</span></label><input id="lc-term-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="send"><button type="submit" class="btn bp lc-run">Run</button></form>
<p id="lc-term-hint" class="lc-desc">Enter runs. Up and Down arrows recall earlier commands. Escape closes.</p>
</div>
</div>`, h: 550 },
      { id: "focused", n: "focused", say: "focus ring on the command box.", html: `<div class="lc-term" role="region" aria-labelledby="lc-term-h">
<div class="lc-term-hd"><h1 id="lc-term-h" class="lc-term-title" tabindex="-1">Commandbar</h1><button type="button" class="lc-icon-btn lc-term-close" aria-label="Close Commandbar">Close</button></div>
<div class="lc-term-body" tabindex="0" role="region" aria-label="Commandbar scrollback">
<p class="lc-term-hi">Welcome to Commandbar. Type help and press Enter. Commands you run in the bar show here too.</p>
<div class="lc-out-h"><button type="button" id="lc-out-toggle" class="lc-out-tg" aria-expanded="true" aria-controls="lc-out"><span class="lc-out-ic" aria-hidden="true">▾</span>Commandbar output, 0 lines</button></div>
<div id="lc-out" class="lc-out" role="log" aria-live="off" aria-label="Commandbar output"><p class="lc-l lc-l-dimt">No output yet.</p></div>
</div>
<div class="lc-term-foot">
<h2 id="lc-chips-h" class="lc-chips-h">Quick commands</h2>
<ul class="lc-chips" aria-labelledby="lc-chips-h"><li><button type="button" class="lc-chip">Help</button></li><li><button type="button" class="lc-chip">Open feed</button></li><li><button type="button" class="lc-chip">Settings</button></li><li><button type="button" class="lc-chip">Status</button></li></ul>
<form class="lc-term-form" autocomplete="off"><label for="lc-term-input" class="lc-term-label"><span class="lc-prompt" aria-hidden="true">looscid&gt;</span><span class="sr-pause">Command</span></label><input id="lc-term-input" class="demo-focus" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="send"><button type="submit" class="btn bp lc-run">Run</button></form>
<p id="lc-term-hint" class="lc-desc">Enter runs. Up and Down arrows recall earlier commands. Escape closes.</p>
</div>
</div>`, h: 520 }
    ],
    code: `<div class="lc-term" role="region" aria-labelledby="lc-term-h">
<div class="lc-term-hd"><h1 id="lc-term-h" class="lc-term-title" tabindex="-1">Commandbar</h1><button type="button" class="lc-icon-btn lc-term-close" aria-label="Close Commandbar">Close</button></div>
<div class="lc-term-body" tabindex="0" role="region" aria-label="Commandbar scrollback">
<p class="lc-term-hi">Welcome to Commandbar. Type help and press Enter. Commands you run in the bar show here too.</p>
<div class="lc-out-h"><button type="button" id="lc-out-toggle" class="lc-out-tg" aria-expanded="true" aria-controls="lc-out"><span class="lc-out-ic" aria-hidden="true">▾</span>Commandbar output, 0 lines</button></div>
<div id="lc-out" class="lc-out" role="log" aria-live="off" aria-label="Commandbar output"><p class="lc-l lc-l-dimt">No output yet.</p></div>
</div>
<div class="lc-term-foot">
<h2 id="lc-chips-h" class="lc-chips-h">Quick commands</h2>
<ul class="lc-chips" aria-labelledby="lc-chips-h"><li><button type="button" class="lc-chip">Help</button></li><li><button type="button" class="lc-chip">Open feed</button></li><li><button type="button" class="lc-chip">Settings</button></li><li><button type="button" class="lc-chip">Status</button></li></ul>
<form class="lc-term-form" autocomplete="off"><label for="lc-term-input" class="lc-term-label"><span class="lc-prompt" aria-hidden="true">looscid&gt;</span><span class="sr-pause">Command</span></label><input id="lc-term-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="send"><button type="submit" class="btn bp lc-run">Run</button></form>
<p id="lc-term-hint" class="lc-desc">Enter runs. Up and Down arrows recall earlier commands. Escape closes.</p>
</div>
</div>`,
    js: `// Enter runs, Up and Down recall (js/core.js, cut down)
const input = document.getElementById("lc-term-input"), past = []; let at = 0;
input.form.addEventListener("submit", function (e) {
  e.preventDefault(); const cmd = input.value.trim(); if (!cmd) return;
  past.push(cmd); at = past.length; input.value = "";
  print(run(cmd)); // the answer is said once through the live region
});
input.addEventListener("keydown", function (e) {
  if (e.key === "ArrowUp" && at > 0) { at--; input.value = past[at]; e.preventDefault(); }
  if (e.key === "ArrowDown" && at < past.length) { at++; input.value = past[at] || ""; e.preventDefault(); }
});`,
    vo: [
      `it opens on its h1, "Commandbar, heading level 1".`,
      `the command box says "Command, text field". type and press Enter (or double tap Run). the answer is spoken once.`,
      `the output log is quiet on purpose (aria-live off) so old lines aren't re-read. swipe into "Commandbar output" to read them again.`,
      "braille display: this is where it shines. type the command and press Enter on the display to run it. Up and Down arrows bring back old commands. Escape closes."
    ],
    rel: ["text-field", "live-region", "back-header"],
  },
  {
    slug: "circle-header",
    t: "Circle header",
    s: "the top of a Circle: its name, what it's about, member count and the Join button.",
    where: [
      "open any Circle and this is the top part: a colored banner w the Circle's emoji and name (its h1), then what it's about, members, category, visibility and Join.",
      `once u join, Join turns into "Joined" and an Invite button shows up. admins get an extra settings button.`
    ],
    states: [
      { id: "normal", n: "not joined", say: "Join is the main button.", html: `<div style="height: 110px; background: linear-gradient(135deg,hsl(280,60%,14%),hsl(295,70%,8%)); position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; padding-top: 44px;">
<button class="bi" style="position: absolute; top: 48px; left: 12px; background: rgba(0,0,0,.55);" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
<div style="font-size: 38px; margin-bottom: 4px;" aria-hidden="true">🌙</div>
<h1 tabindex="-1" style="margin: 0; font-weight: 400; font-family: 'Looscid Unspeakable','DM Serif Display',Georgia,serif; font-size: 18px; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.6);">Night Owls</h1>
</div>
<div style="padding: 12px 16px 0; background: var(--sf2); border-bottom: 1px solid var(--bd);">
<div style="display: flex; gap: 10px; align-items: flex-start;">
<div style="flex: 1;">
<div class="lc-md" style="font-size: 12px; color: var(--tx2); line-height: 1.55; margin-bottom: 8px;">for people who Dream best after midnight.</div>
<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 10px;"><span style="font-size: 11px; color: var(--tx3);"><span>Members: </span>42</span><span style="font-size: 11px; color: var(--tx3);"><span>Category: </span>Chill</span><span style="font-size: 11px; color: var(--tx3);"><span>Visibility: </span>Public</span></div>
</div>
<div style="display: flex; gap: 7px; align-items: center;"><button class="btn bp" style="padding: 7px 14px; font-size: 12px;" aria-label="Join group">Join</button></div>
</div>
</div>`, h: 250 },
      { id: "joined", n: "joined", say: "Joined, plus Invite.", html: `<div style="height: 110px; background: linear-gradient(135deg,hsl(280,60%,14%),hsl(295,70%,8%)); position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; padding-top: 44px;">
<button class="bi" style="position: absolute; top: 48px; left: 12px; background: rgba(0,0,0,.55);" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
<div style="font-size: 38px; margin-bottom: 4px;" aria-hidden="true">🌙</div>
<h1 tabindex="-1" style="margin: 0; font-weight: 400; font-family: 'Looscid Unspeakable','DM Serif Display',Georgia,serif; font-size: 18px; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.6);">Night Owls</h1>
</div>
<div style="padding: 12px 16px 0; background: var(--sf2); border-bottom: 1px solid var(--bd);">
<div style="display: flex; gap: 10px; align-items: flex-start;">
<div style="flex: 1;">
<div class="lc-md" style="font-size: 12px; color: var(--tx2); line-height: 1.55; margin-bottom: 8px;">for people who Dream best after midnight.</div>
<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 10px;"><span style="font-size: 11px; color: var(--tx3);"><span>Members: </span>42</span><span style="font-size: 11px; color: var(--tx3);"><span>Category: </span>Chill</span><span style="font-size: 11px; color: var(--tx3);"><span>Visibility: </span>Public</span></div>
</div>
<div style="display: flex; gap: 7px; align-items: center;"><button class="btn bgb" style="padding: 7px 11px; font-size: 12px;" aria-label="Invite friends">Invite</button><button class="btn bgb" style="padding: 7px 14px; font-size: 12px;" aria-label="Leave group">Joined ✓</button></div>
</div>
</div>`, h: 250 },
      { id: "admin", n: "admin", say: "admin badge and the admin settings button.", html: `<div style="height: 110px; background: linear-gradient(135deg,hsl(280,60%,14%),hsl(295,70%,8%)); position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; padding-top: 44px;">
<button class="bi" style="position: absolute; top: 48px; left: 12px; background: rgba(0,0,0,.55);" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button><button class="bi" style="position: absolute; top: 48px; right: 12px; background: rgba(245,158,11,.2); color: #f59e0b;" aria-label="Circle admin settings"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg></button>
<div style="font-size: 38px; margin-bottom: 4px;" aria-hidden="true">🌙</div>
<h1 tabindex="-1" style="margin: 0; font-weight: 400; font-family: 'Looscid Unspeakable','DM Serif Display',Georgia,serif; font-size: 18px; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.6);">Night Owls</h1>
</div>
<div style="padding: 12px 16px 0; background: var(--sf2); border-bottom: 1px solid var(--bd);">
<div style="display: flex; gap: 10px; align-items: flex-start;">
<div style="flex: 1;">
<div class="lc-md" style="font-size: 12px; color: var(--tx2); line-height: 1.55; margin-bottom: 8px;">for people who Dream best after midnight.</div>
<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 10px;"><span style="font-size: 11px; color: var(--tx3);"><span>Members: </span>42</span><span style="font-size: 11px; color: var(--tx3);"><span>Category: </span>Chill</span><span style="font-size: 11px; color: var(--tx3);"><span>Visibility: </span>Public</span><span style="font-size: 10px; background: rgba(245,158,11,.15); color: #f59e0b; padding: 1px 7px; border-radius: 100px; font-weight: 700;">★ Admin</span></div>
</div>
<div style="display: flex; gap: 7px; align-items: center;"><button class="btn bgb" style="padding: 7px 11px; font-size: 12px;" aria-label="Invite friends">Invite</button><button class="btn bgb" style="padding: 7px 14px; font-size: 12px;" aria-label="Leave group">Joined ✓</button></div>
</div>
</div>`, h: 250 },
      { id: "focused", n: "focused", say: "focus ring on Join.", html: `<div style="height: 110px; background: linear-gradient(135deg,hsl(280,60%,14%),hsl(295,70%,8%)); position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; padding-top: 44px;">
<button class="bi" style="position: absolute; top: 48px; left: 12px; background: rgba(0,0,0,.55);" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
<div style="font-size: 38px; margin-bottom: 4px;" aria-hidden="true">🌙</div>
<h1 tabindex="-1" style="margin: 0; font-weight: 400; font-family: 'Looscid Unspeakable','DM Serif Display',Georgia,serif; font-size: 18px; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.6);">Night Owls</h1>
</div>
<div style="padding: 12px 16px 0; background: var(--sf2); border-bottom: 1px solid var(--bd);">
<div style="display: flex; gap: 10px; align-items: flex-start;">
<div style="flex: 1;">
<div class="lc-md" style="font-size: 12px; color: var(--tx2); line-height: 1.55; margin-bottom: 8px;">for people who Dream best after midnight.</div>
<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 10px;"><span style="font-size: 11px; color: var(--tx3);"><span>Members: </span>42</span><span style="font-size: 11px; color: var(--tx3);"><span>Category: </span>Chill</span><span style="font-size: 11px; color: var(--tx3);"><span>Visibility: </span>Public</span></div>
</div>
<div style="display: flex; gap: 7px; align-items: center;"><button class="btn bp demo-focus" style="padding: 7px 14px; font-size: 12px;" aria-label="Join group">Join</button></div>
</div>
</div>`, h: 250 }
    ],
    code: `<div style="height: 110px; background: linear-gradient(135deg,hsl(280,60%,14%),hsl(295,70%,8%)); position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; padding-top: 44px;">
<button class="bi" style="position: absolute; top: 48px; left: 12px; background: rgba(0,0,0,.55);" aria-label="Back"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="21" height="21"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
<div style="font-size: 38px; margin-bottom: 4px;" aria-hidden="true">🌙</div>
<h1 tabindex="-1" style="margin: 0; font-weight: 400; font-family: 'Looscid Unspeakable','DM Serif Display',Georgia,serif; font-size: 18px; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.6);">Night Owls</h1>
</div>
<div style="padding: 12px 16px 0; background: var(--sf2); border-bottom: 1px solid var(--bd);">
<div style="display: flex; gap: 10px; align-items: flex-start;">
<div style="flex: 1;">
<div class="lc-md" style="font-size: 12px; color: var(--tx2); line-height: 1.55; margin-bottom: 8px;">for people who Dream best after midnight.</div>
<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 10px;"><span style="font-size: 11px; color: var(--tx3);"><span>Members: </span>42</span><span style="font-size: 11px; color: var(--tx3);"><span>Category: </span>Chill</span><span style="font-size: 11px; color: var(--tx3);"><span>Visibility: </span>Public</span></div>
</div>
<div style="display: flex; gap: 7px; align-items: center;"><button class="btn bp" style="padding: 7px 14px; font-size: 12px;" aria-label="Join group">Join</button></div>
</div>
</div>`,
    js: null,
    vo: [
      `opening a Circle puts focus on its name, "Night Owls, heading level 1". the emoji is hidden.`,
      `swipe on: what it's about, then "Members: 42", "Category: Chill", "Visibility: Public".`,
      `Join says "Join group, button". after joining it says "Leave group", so u always hear what pressing it will do.`,
      "braille display: Enter on Join joins. Back is the first button, swipe left from the name to reach it."
    ],
    rel: ["back-header", "profile-header", "tabs"],
  },
  {
    slug: "profile-header",
    t: "Profile header",
    s: "the top of a profile: name, handle, bio, Edit profile, More and the follow counts.",
    where: [
      "the top of ur Profile tab (and anyone else's profile). the name is the screen's h1, then the handle, the buttons, the bio and the Following and Followers counts, which are buttons that open the lists.",
      `under it sits the profile's <a href="../tabs/">tabs</a>: Dreams, Replies, Circles, Redreams, Media, Liked and more.`
    ],
    states: [
      { id: "normal", n: "normal", say: "a filled-in profile.", html: `<div class="lc-prof-head">
<div class="lc-prof-banner" aria-hidden="true" style="background: linear-gradient(135deg, rgb(109, 40, 217), rgb(168, 85, 247));"></div>
<div class="lc-prof-avwrap" aria-hidden="true"><div class="av" style="width: 72px; height: 72px; font-size: 25px; background: linear-gradient(135deg, rgb(109, 40, 217), rgb(168, 85, 247));"><span aria-hidden="true">A</span></div></div>
<h1 class="lc-prof-name" tabindex="-1">Ava</h1>
<p class="lc-prof-handle"><span class="lc-prof-acct">@ava</span></p>
<div class="lc-prof-acts"><button type="button" id="pf-edit-btn" class="btn bgb lc-big">Edit profile</button></div>
<div class="lmenu lc-prof-more"><button id="pf-more-btn" type="button" class="btn bgb lc-big lc-prof-morebtn" aria-haspopup="menu" aria-expanded="false" aria-label="Dreamor Options"><span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg> More</span><span class="lmenu-caret" aria-hidden="true">▾</span></button></div>
<p class="lc-prof-bio">making Dreams at 3 AM, mostly about clouds.</p>
<div class="lc-prof-counts"><button type="button" id="pf-count-following" class="btn bgb lc-big">12 Following</button><button type="button" id="pf-count-followers" class="btn bgb lc-big">120 Followers</button></div>
</div>`, h: 420 },
      { id: "empty", n: "empty (guest)", say: "no bio yet, zero counts.", html: `<div class="lc-prof-head">
<div class="lc-prof-banner" aria-hidden="true" style="background: linear-gradient(135deg, rgb(109, 40, 217), rgb(168, 85, 247));"></div>
<div class="lc-prof-avwrap" aria-hidden="true"><div class="av" style="width: 72px; height: 72px; font-size: 25px; background: linear-gradient(135deg, rgb(109, 40, 217), rgb(168, 85, 247));"><span aria-hidden="true">G</span></div></div>
<h1 class="lc-prof-name" tabindex="-1">Guest</h1>
<p class="lc-prof-handle"><span class="lc-prof-acct">@guest</span></p>
<div class="lc-prof-acts"><button type="button" id="pf-edit-btn" class="btn bgb lc-big">Edit profile</button></div>
<div class="lmenu lc-prof-more"><button id="pf-more-btn" type="button" class="btn bgb lc-big lc-prof-morebtn" aria-haspopup="menu" aria-expanded="false" aria-label="Dreamor Options"><span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg> More</span><span class="lmenu-caret" aria-hidden="true">▾</span></button></div>
<p class="lc-prof-bio lc-muted">No bio yet.</p>
<div class="lc-prof-counts"><button type="button" id="pf-count-following" class="btn bgb lc-big">0 Following</button><button type="button" id="pf-count-followers" class="btn bgb lc-big">0 Followers</button></div>
</div>`, h: 420 },
      { id: "focused", n: "focused", say: "focus ring on Edit profile.", html: `<div class="lc-prof-head">
<div class="lc-prof-banner" aria-hidden="true" style="background: linear-gradient(135deg, rgb(109, 40, 217), rgb(168, 85, 247));"></div>
<div class="lc-prof-avwrap" aria-hidden="true"><div class="av" style="width: 72px; height: 72px; font-size: 25px; background: linear-gradient(135deg, rgb(109, 40, 217), rgb(168, 85, 247));"><span aria-hidden="true">A</span></div></div>
<h1 class="lc-prof-name" tabindex="-1">Ava</h1>
<p class="lc-prof-handle"><span class="lc-prof-acct">@ava</span></p>
<div class="lc-prof-acts"><button type="button" id="pf-edit-btn" class="btn bgb lc-big demo-focus">Edit profile</button></div>
<div class="lmenu lc-prof-more"><button id="pf-more-btn" type="button" class="btn bgb lc-big lc-prof-morebtn" aria-haspopup="menu" aria-expanded="false" aria-label="Dreamor Options"><span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg> More</span><span class="lmenu-caret" aria-hidden="true">▾</span></button></div>
<p class="lc-prof-bio">making Dreams at 3 AM, mostly about clouds.</p>
<div class="lc-prof-counts"><button type="button" id="pf-count-following" class="btn bgb lc-big">12 Following</button><button type="button" id="pf-count-followers" class="btn bgb lc-big">120 Followers</button></div>
</div>`, h: 420 }
    ],
    code: `<div class="lc-prof-head">
<div class="lc-prof-banner" aria-hidden="true" style="background: linear-gradient(135deg, rgb(109, 40, 217), rgb(168, 85, 247));"></div>
<div class="lc-prof-avwrap" aria-hidden="true"><div class="av" style="width: 72px; height: 72px; font-size: 25px; background: linear-gradient(135deg, rgb(109, 40, 217), rgb(168, 85, 247));"><span aria-hidden="true">A</span></div></div>
<h1 class="lc-prof-name" tabindex="-1">Ava</h1>
<p class="lc-prof-handle"><span class="lc-prof-acct">@ava</span></p>
<div class="lc-prof-acts"><button type="button" id="pf-edit-btn" class="btn bgb lc-big">Edit profile</button></div>
<div class="lmenu lc-prof-more"><button id="pf-more-btn" type="button" class="btn bgb lc-big lc-prof-morebtn" aria-haspopup="menu" aria-expanded="false" aria-label="Dreamor Options"><span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="15" height="15"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg> More</span><span class="lmenu-caret" aria-hidden="true">▾</span></button></div>
<p class="lc-prof-bio">making Dreams at 3 AM, mostly about clouds.</p>
<div class="lc-prof-counts"><button type="button" id="pf-count-following" class="btn bgb lc-big">12 Following</button><button type="button" id="pf-count-followers" class="btn bgb lc-big">120 Followers</button></div>
</div>`,
    js: null,
    vo: [
      `focus lands on the name: "Ava, heading level 1". the banner and profile picture are hidden, so u don't hear "image" twice.`,
      `swipe on: "@ava", "Edit profile, button", "Dreamor Options, pop up button", the bio, then "12 Following, button" and "120 Followers, button".`,
      "braille display: Enter on Following or Followers opens that list."
    ],
    rel: ["tabs", "circle-header", "popup-menu"],
  },
  {
    slug: "live-region",
    t: "Live region announcements",
    s: `how looscid says things out loud, like "Liked" or "2 results". we don't do pop-up toasts.`,
    where: [
      "looscid doesn't have pop-up toasts. instead there's one hidden live region at the top of the app (id looscid-live). when something changes, like u liked a Dream, a setting saved or a search found stuff, the app puts a short sentence in it and the screen reader says it.",
      "it's polite, so it waits until VoiceOver finishes talking instead of cutting u off. two messages in a row are queued so the first one isn't lost. errors also play a little sound cue."
    ],
    states: [
      { id: "quiet", n: "quiet", say: "nothing to say.", html: `<p class="lc-desc" style="padding: 0 16px;">what's inside it right now (shown here only for the demo, in the app it's invisible):</p>
<p class="lc-desc" style="padding: 0 16px; color: var(--tx);">(empty)</p>
<div id="looscid-live" class="sr-pause" aria-live="polite" aria-atomic="true"></div>`, h: 110 },
      { id: "saying", n: "saying something", say: `it just said "Liked".`, html: `<p class="lc-desc" style="padding: 0 16px;">what's inside it right now (shown here only for the demo, in the app it's invisible):</p>
<p class="lc-desc" style="padding: 0 16px; color: var(--tx);">Liked</p>
<div id="looscid-live" class="sr-pause" aria-live="polite" aria-atomic="true">Liked</div>`, h: 110 },
      { id: "error", n: "an error", say: "it says what went wrong in plain words.", html: `<p class="lc-desc" style="padding: 0 16px;">what's inside it right now (shown here only for the demo, in the app it's invisible):</p>
<p class="lc-desc" style="padding: 0 16px; color: var(--tx);">can't reach Rem rn, try again in a bit</p>
<div id="looscid-live" class="sr-pause" aria-live="polite" aria-atomic="true">can't reach Rem rn, try again in a bit</div>`, h: 110 }
    ],
    code: `<div id="looscid-live" class="sr-pause" aria-live="polite" aria-atomic="true"></div>`,
    js: `// announce (js/core.js, cut way down). one live region for the whole app.
function announce(msg) {
  const el = document.getElementById("looscid-live");
  if (!el) return;
  el.textContent = "";                       // clear first so the same words are said again
  setTimeout(function () { el.textContent = msg; }, 50);
}
announce("Liked");`,
    vo: [
      `u don't swipe to it, it just talks. like "Liked" after the Like button, or "No results" after a search.`,
      `a checkbox that changed doesn't also announce, bc VoiceOver already says "checked".`,
      "it's hidden from eyes (sr-pause), so nothing pops up on screen.",
      "braille display: the message flashes on the display too, then goes back to where u were."
    ],
    rel: ["like-redream-buttons", "search-field", "commandbar"],
  },
  {
    slug: "empty-state",
    t: "Empty state",
    s: "what a list says when there's nothing in it yet.",
    where: [
      `when a feed, a search or a list has nothing, we don't leave it blank. a short line says what's up and what u can do, like "No Dreams yet. Kinda peaceful, honestly."`
    ],
    states: [
      { id: "feed", n: "empty feed", say: "Home with no Dreams.", html: `<div class="es"><div class="esl">No Dreams yet. Kinda peaceful, honestly.</div><p style="font-size: 12px; color: var(--tx3); margin-top: 6px; line-height: 1.6;">When someone Dreams, it lands here. Or you could go first.</p></div>`, h: 180 },
      { id: "circles", n: "no Circles", say: "the Circles list with nothing joined.", html: `<div class="es"><div class="esi">No Circles yet</div><div class="esl">No Circles yet</div><p style="font-size: 12px; color: var(--tx3); margin-top: 6px;">Tap Create to start one</p></div>`, h: 200 }
    ],
    code: `<div class="es"><div class="esl">No Dreams yet. Kinda peaceful, honestly.</div><p style="font-size: 12px; color: var(--tx3); margin-top: 6px; line-height: 1.6;">When someone Dreams, it lands here. Or you could go first.</p></div>`,
    js: null,
    vo: [
      `it's just text, so VoiceOver reads it as u swipe: "No Dreams yet. Kinda peaceful, honestly."`,
      "no fake buttons inside. if there's something to do, it points at the real button (like Create).",
      "braille display: pan through it like any text."
    ],
    rel: ["search-field", "dream-card", "tabs"],
  },
  {
    slug: "mod-reason-picker",
    t: "Mod reason picker",
    s: "what a mod sees when removing a Dream: pick a reason or type one. the reason is always public.",
    where: [
      "mods open it from a Dream's More menu (Remove from Night Owls, or Remove from Looscid for admins). a reason is a must: pick one (the Circle's own rules come first) or type ur own.",
      "the Dreamor sees the reason where their Dream was, and it goes in the public mod log. Remove Dream stays dimmed until there's a reason, and says why if u press it early."
    ],
    states: [
      { id: "nothing-picked", n: "nothing picked", say: "Remove Dream is dimmed.", html: `<div class="lid-alert-bg">
<div class="lid-alert" role="alertdialog" aria-modal="true" aria-labelledby="m1-title">
<h2 tabindex="-1" id="m1-title" class="lid-sub">Remove this Dream from Night Owls?</h2>
<p class="lid-help">Pick a reason or type your own. Ava sees the reason where the Dream was.</p>
<fieldset class="lc-fs"><legend class="lc-fs-l">Reason</legend><div class="lc-radios lc-radios-col">
<label class="lc-radio"><input type="radio" name="m1-reason" value="rule0"><span>Breaks a rule: Be kind and respectful</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="spam"><span>Spam</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="mean"><span>Mean or bullying</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="unsafe"><span>Unsafe or harmful</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="own"><span>Type a reason</span></label>
</div></fieldset>
<button type="button" class="btn bp lid-wide" id="m1-go" aria-disabled="true">Remove Dream</button>
<button type="button" class="btn bgb lid-wide">Cancel</button>
</div>
</div>`, h: 560 },
      { id: "picked", n: "reason picked", say: "Spam is picked, Remove Dream works now.", html: `<div class="lid-alert-bg">
<div class="lid-alert" role="alertdialog" aria-modal="true" aria-labelledby="m1-title">
<h2 tabindex="-1" id="m1-title" class="lid-sub">Remove this Dream from Night Owls?</h2>
<p class="lid-help">Pick a reason or type your own. Ava sees the reason where the Dream was.</p>
<fieldset class="lc-fs"><legend class="lc-fs-l">Reason</legend><div class="lc-radios lc-radios-col">
<label class="lc-radio"><input type="radio" name="m1-reason" value="rule0"><span>Breaks a rule: Be kind and respectful</span></label>
<label class="lc-radio on"><input type="radio" name="m1-reason" value="spam" checked><span>Spam</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="mean"><span>Mean or bullying</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="unsafe"><span>Unsafe or harmful</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="own"><span>Type a reason</span></label>
</div></fieldset>
<button type="button" class="btn bp lid-wide" id="m1-go" aria-disabled="false">Remove Dream</button>
<button type="button" class="btn bgb lid-wide">Cancel</button>
</div>
</div>`, h: 560 },
      { id: "own-reason", n: "own reason", say: "Type a reason is picked and a text box shows up.", html: `<div class="lid-alert-bg">
<div class="lid-alert" role="alertdialog" aria-modal="true" aria-labelledby="m1-title">
<h2 tabindex="-1" id="m1-title" class="lid-sub">Remove this Dream from Night Owls?</h2>
<p class="lid-help">Pick a reason or type your own. Ava sees the reason where the Dream was.</p>
<fieldset class="lc-fs"><legend class="lc-fs-l">Reason</legend><div class="lc-radios lc-radios-col">
<label class="lc-radio"><input type="radio" name="m1-reason" value="rule0"><span>Breaks a rule: Be kind and respectful</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="spam"><span>Spam</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="mean"><span>Mean or bullying</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="unsafe"><span>Unsafe or harmful</span></label>
<label class="lc-radio on"><input type="radio" name="m1-reason" value="own" checked><span>Type a reason</span></label>
</div></fieldset>
<label for="m1-own" class="lc-fs-l" style="display: block;">Reason in your words</label>
<input id="m1-own" type="text" class="lc-text" maxlength="1023" value="off topic for this Circle">
<button type="button" class="btn bp lid-wide" id="m1-go" aria-disabled="false">Remove Dream</button>
<button type="button" class="btn bgb lid-wide">Cancel</button>
</div>
</div>`, h: 640 },
      { id: "error", n: "pressed too early", say: "it says what's missing.", html: `<div class="lid-alert-bg">
<div class="lid-alert" role="alertdialog" aria-modal="true" aria-labelledby="m1-title">
<h2 tabindex="-1" id="m1-title" class="lid-sub">Remove this Dream from Night Owls?</h2>
<p class="lid-help">Pick a reason or type your own. Ava sees the reason where the Dream was.</p>
<p class="lid-help" role="status">Pick a reason or type one first. Ava sees it.</p>
<fieldset class="lc-fs"><legend class="lc-fs-l">Reason</legend><div class="lc-radios lc-radios-col">
<label class="lc-radio"><input type="radio" name="m1-reason" value="rule0"><span>Breaks a rule: Be kind and respectful</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="spam"><span>Spam</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="mean"><span>Mean or bullying</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="unsafe"><span>Unsafe or harmful</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="own"><span>Type a reason</span></label>
</div></fieldset>
<button type="button" class="btn bp lid-wide" id="m1-go" aria-disabled="true">Remove Dream</button>
<button type="button" class="btn bgb lid-wide">Cancel</button>
</div>
</div>`, h: 600 },
      { id: "focused", n: "focused", say: "focus ring on Spam.", html: `<div class="lid-alert-bg">
<div class="lid-alert" role="alertdialog" aria-modal="true" aria-labelledby="m1-title">
<h2 tabindex="-1" id="m1-title" class="lid-sub">Remove this Dream from Night Owls?</h2>
<p class="lid-help">Pick a reason or type your own. Ava sees the reason where the Dream was.</p>
<fieldset class="lc-fs"><legend class="lc-fs-l">Reason</legend><div class="lc-radios lc-radios-col">
<label class="lc-radio"><input type="radio" name="m1-reason" value="rule0"><span>Breaks a rule: Be kind and respectful</span></label>
<label class="lc-radio demo-focus"><input type="radio" name="m1-reason" value="spam"><span>Spam</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="mean"><span>Mean or bullying</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="unsafe"><span>Unsafe or harmful</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="own"><span>Type a reason</span></label>
</div></fieldset>
<button type="button" class="btn bp lid-wide" id="m1-go" aria-disabled="true">Remove Dream</button>
<button type="button" class="btn bgb lid-wide">Cancel</button>
</div>
</div>`, h: 560 }
    ],
    code: `<div class="lid-alert-bg">
<div class="lid-alert" role="alertdialog" aria-modal="true" aria-labelledby="m1-title">
<h2 tabindex="-1" id="m1-title" class="lid-sub">Remove this Dream from Night Owls?</h2>
<p class="lid-help">Pick a reason or type your own. Ava sees the reason where the Dream was.</p>
<fieldset class="lc-fs"><legend class="lc-fs-l">Reason</legend><div class="lc-radios lc-radios-col">
<label class="lc-radio"><input type="radio" name="m1-reason" value="rule0"><span>Breaks a rule: Be kind and respectful</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="spam"><span>Spam</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="mean"><span>Mean or bullying</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="unsafe"><span>Unsafe or harmful</span></label>
<label class="lc-radio"><input type="radio" name="m1-reason" value="own"><span>Type a reason</span></label>
</div></fieldset>
<button type="button" class="btn bp lid-wide" id="m1-go" aria-disabled="true">Remove Dream</button>
<button type="button" class="btn bgb lid-wide">Cancel</button>
</div>
</div>`,
    js: `// a reason is a must (js/core.js DreamModDialog, cut down)
goBtn.addEventListener("click", function () {
  const picked = dialog.querySelector("input[name=m1-reason]:checked");
  const reason = !picked ? "" : picked.value === "own" ? ownInput.value.trim() : picked.nextElementSibling.textContent;
  if (!reason) { showMsg("Pick a reason or type one first. Ava sees it."); return; }
  removeDream(reason);           // public: shows on the Dream and in the mod log
  announce("Dream removed");
});`,
    vo: [
      `it opens on the question, "Remove this Dream from Night Owls?, heading level 2".`,
      `then "Reason" and each choice as a radio button: "Spam, radio button, 2 of 5". one swipe per reason.`,
      `"Remove Dream, button, dimmed" until u pick one. pressing it early says "Pick a reason or type one first. Ava sees it."`,
      `picking Type a reason adds "Reason in your words, text field". braille display: type the reason and press Enter to remove.`,
      "Escape or two finger scrub cancels and puts u back on the Dream's More button."
    ],
    rel: ["radio-group", "report-dialog", "dream-card"],
  },
  {
    slug: "report-dialog",
    t: "Report a Dream dialog",
    s: "report a Dream in 2 taps: pick what's wrong, done. the person never finds out who reported.",
    where: [
      "it's in every Dream's More menu (Report). each reason is one big button, so it's one tap (or one double tap) to report. there's always Cancel.",
      "the report is signed w ur LooscidID and goes to Rem. when 3 different people report the same Dream, Rem hides it from the feed until a mod looks."
    ],
    states: [
      { id: "normal", n: "normal", say: "pick a reason.", html: `<div class="lid-alert-bg">
<div class="lid-alert" role="alertdialog" aria-modal="true" aria-labelledby="r1-title">
<h2 tabindex="-1" id="r1-title" class="lid-sub">Report this Dream?</h2>
<p class="lid-help">Pick what's wrong. Your report goes to Rem with your LooscidID. The person you report isn't told who reported them.</p>
<button type="button" class="btn bgb lid-wide">Spam</button>
<button type="button" class="btn bgb lid-wide">Mean or bullying</button>
<button type="button" class="btn bgb lid-wide">Unsafe or harmful</button>
<button type="button" class="btn bgb lid-wide">Something else</button>
<button type="button" class="btn bgb lid-wide">Cancel</button>
</div>
</div>`, h: 470 },
      { id: "sending", n: "sending", say: "the buttons are off while it sends.", html: `<div class="lid-alert-bg">
<div class="lid-alert" role="alertdialog" aria-modal="true" aria-labelledby="r1-title">
<h2 tabindex="-1" id="r1-title" class="lid-sub">Report this Dream?</h2>
<p class="lid-help">Pick what's wrong. Your report goes to Rem with your LooscidID. The person you report isn't told who reported them.</p>
<p class="lid-help" role="status">Sending the report.</p>
<button type="button" class="btn bgb lid-wide" disabled>Spam</button>
<button type="button" class="btn bgb lid-wide" disabled>Mean or bullying</button>
<button type="button" class="btn bgb lid-wide" disabled>Unsafe or harmful</button>
<button type="button" class="btn bgb lid-wide" disabled>Something else</button>
<button type="button" class="btn bgb lid-wide">Cancel</button>
</div>
</div>`, h: 500 },
      { id: "focused", n: "focused", say: "focus ring on Spam.", html: `<div class="lid-alert-bg">
<div class="lid-alert" role="alertdialog" aria-modal="true" aria-labelledby="r1-title">
<h2 tabindex="-1" id="r1-title" class="lid-sub">Report this Dream?</h2>
<p class="lid-help">Pick what's wrong. Your report goes to Rem with your LooscidID. The person you report isn't told who reported them.</p>
<button type="button" class="btn bgb lid-wide demo-focus">Spam</button>
<button type="button" class="btn bgb lid-wide">Mean or bullying</button>
<button type="button" class="btn bgb lid-wide">Unsafe or harmful</button>
<button type="button" class="btn bgb lid-wide">Something else</button>
<button type="button" class="btn bgb lid-wide">Cancel</button>
</div>
</div>`, h: 470 }
    ],
    code: `<div class="lid-alert-bg">
<div class="lid-alert" role="alertdialog" aria-modal="true" aria-labelledby="r1-title">
<h2 tabindex="-1" id="r1-title" class="lid-sub">Report this Dream?</h2>
<p class="lid-help">Pick what's wrong. Your report goes to Rem with your LooscidID. The person you report isn't told who reported them.</p>
<button type="button" class="btn bgb lid-wide">Spam</button>
<button type="button" class="btn bgb lid-wide">Mean or bullying</button>
<button type="button" class="btn bgb lid-wide">Unsafe or harmful</button>
<button type="button" class="btn bgb lid-wide">Something else</button>
<button type="button" class="btn bgb lid-wide">Cancel</button>
</div>
</div>`,
    js: `// one tap sends it (js/core.js DreamReportDialog, cut down). the demo above never sends anything.
dialog.querySelectorAll(".lid-wide").forEach(function (b) {
  b.addEventListener("click", function () {
    if (b.textContent === "Cancel") return close();
    setBusy(true); showMsg("Sending the report.");
    sendReport(dreamId, b.textContent).then(function (r) { setBusy(false); announce(r.say); if (r.ok) close(); });
  });
});`,
    vo: [
      `it opens on "Report this Dream?, heading level 2". swipe right to hear the line about privacy, then each reason: "Spam, button".`,
      `while sending, the buttons say "dimmed" and the status line says "Sending the report." once.`,
      "when it's done the live region says it was sent and focus goes back to the Dream's More button.",
      "Escape or two finger scrub cancels. braille display: Enter on a reason sends it."
    ],
    rel: ["mod-reason-picker", "dream-card", "live-region"],
  },
  {
    slug: "report-a-problem",
    t: "Report a problem and report rows",
    s: "our own issue tracker: the report form and the public list of reports w Agree and Disagree.",
    where: [
      "it lives in the Help Center's Report a problem article, so there's no new tab. the form up top: Bug or Idea, a title and what happened. looscid adds the app and its version by itself, and ur report is signed w ur own Looscid key.",
      `under it is the public list. each report is one row: the title, bug or idea, its status and the agree and disagree counts all in one heading. mod replies show under it as "Looscid mods". anyone can read it, no key needed.`
    ],
    states: [
      { id: "form-empty", n: "form, empty", say: "nothing typed yet.", html: `<div class="lc-issue-form">
<fieldset class="lc-fs"><legend class="lc-fs-l">What kind?</legend><div class="lc-radios lc-radios-col"><label class="lc-radio"><input type="radio" name="lc-issue-type" value="bug"><span>Bug, something's broken</span></label><label class="lc-radio"><input type="radio" name="lc-issue-type" value="idea"><span>Idea, something new</span></label></div></fieldset>
<label for="lc-issue-title" class="lc-fs-l" style="display: block;">Title</label>
<input id="lc-issue-title" type="text" class="inp lc-issue-in" maxlength="120" autocomplete="off">
<label for="lc-issue-body" class="lc-fs-l" style="display: block;">What happened?</label>
<textarea id="lc-issue-body" class="inp" rows="5" maxlength="4000"></textarea>
<p class="lc-desc">Looscid adds the app and its version by itself. Your report, its title and your key are public.</p>
<button type="button" id="lc-issue-send" class="btn bp lc-big">Send report</button>
</div>`, h: 520 },
      { id: "form-filled", n: "form, filled in", say: "a bug, w a title and what happened.", html: `<div class="lc-issue-form">
<fieldset class="lc-fs"><legend class="lc-fs-l">What kind?</legend><div class="lc-radios lc-radios-col"><label class="lc-radio on"><input type="radio" name="lc-issue-type" value="bug" checked><span>Bug, something's broken</span></label><label class="lc-radio"><input type="radio" name="lc-issue-type" value="idea"><span>Idea, something new</span></label></div></fieldset>
<label for="lc-issue-title" class="lc-fs-l" style="display: block;">Title</label>
<input id="lc-issue-title" type="text" class="inp lc-issue-in" maxlength="120" autocomplete="off" value="the Like button double-announces">
<label for="lc-issue-body" class="lc-fs-l" style="display: block;">What happened?</label>
<textarea id="lc-issue-body" class="inp" rows="5" maxlength="4000">when i like a Dream VoiceOver says Liked twice.</textarea>
<p class="lc-desc">Looscid adds the app and its version by itself. Your report, its title and your key are public.</p>
<button type="button" id="lc-issue-send" class="btn bp lc-big">Send report</button>
</div>`, h: 520 },
      { id: "form-error", n: "form, title missing", say: "pressing Send early says what's missing in words.", html: `<div class="lc-issue-form">
<fieldset class="lc-fs"><legend class="lc-fs-l">What kind?</legend><div class="lc-radios lc-radios-col"><label class="lc-radio"><input type="radio" name="lc-issue-type" value="bug"><span>Bug, something's broken</span></label><label class="lc-radio"><input type="radio" name="lc-issue-type" value="idea"><span>Idea, something new</span></label></div></fieldset>
<label for="lc-issue-title" class="lc-fs-l" style="display: block;">Title</label>
<input id="lc-issue-title" type="text" class="inp lc-issue-in" maxlength="120" autocomplete="off">
<label for="lc-issue-body" class="lc-fs-l" style="display: block;">What happened?</label>
<textarea id="lc-issue-body" class="inp" rows="5" maxlength="4000"></textarea>
<p class="lc-desc">Looscid adds the app and its version by itself. Your report, its title and your key are public.</p>
<button type="button" id="lc-issue-send" class="btn bp lc-big">Send report</button>
<p class="lc-desc">type a title first</p>
</div>`, h: 560 },
      { id: "form-guest", n: "no key", say: "guests get one plain sentence and a link to make a key.", html: `<div class="lc-issue-form"><p class="lc-desc">you need a Looscid key to report. <a href="#">Create a LooscidID</a></p></div>`, h: 90 },
      { id: "row", n: "report row", say: "a new bug w its counts.", html: `<ul class="lc-issue-list">
<li class="lc-issue">
<h3 id="lc-issue-a1b2c3" class="lc-issue-h">The Like button double-announces. Bug, new. 4 agree, 1 disagree.</h3>
<p class="lc-desc lc-issue-body">when i like a Dream VoiceOver says Liked twice.</p>
<p class="lc-desc lc-issue-meta">Reported 2 hours ago on web 2026.138.57</p>
<div class="lc-inrow lc-issue-votes"><button type="button" class="btn bgb lc-btn lc-issue-btn">Agree</button><button type="button" class="btn bgb lc-btn lc-issue-btn">Disagree</button></div>
</li>
</ul>`, h: 260 },
      { id: "row-voted", n: "report row, u agreed", say: `the count line says "you + 3 others agree".`, html: `<ul class="lc-issue-list">
<li class="lc-issue">
<h3 id="lc-issue-a1b2c3" class="lc-issue-h">The Like button double-announces. Bug, working on it. 4 agree, 1 disagree.</h3>
<p class="lc-desc lc-issue-body">when i like a Dream VoiceOver says Liked twice.</p>
<p class="lc-desc lc-issue-meta">Reported 2 hours ago on web 2026.138.57</p>
<p class="lc-desc lc-issue-count">you + 3 others agree</p>
<div class="lc-inrow lc-issue-votes"><button type="button" class="btn bgb lc-btn lc-issue-btn">Take back agree</button><button type="button" class="btn bgb lc-btn lc-issue-btn">Disagree instead</button></div>
</li>
</ul>`, h: 290 },
      { id: "row-reply", n: "report row w a mod reply", say: "the mods' reply sits under the report.", html: `<ul class="lc-issue-list">
<li class="lc-issue">
<h3 id="lc-issue-a1b2c3" class="lc-issue-h">The Like button double-announces. Bug, working on it. 4 agree, 1 disagree.</h3>
<p class="lc-desc lc-issue-body">when i like a Dream VoiceOver says Liked twice.</p>
<p class="lc-desc lc-issue-meta">Reported 2 hours ago on web 2026.138.57</p>
<ul class="lc-issue-replies"><li class="lc-desc">Looscid mods, 1 hour ago: set it to working on it. on it, thx for the report</li></ul>
<div class="lc-inrow lc-issue-votes"><button type="button" class="btn bgb lc-btn lc-issue-btn">Agree</button><button type="button" class="btn bgb lc-btn lc-issue-btn">Disagree</button></div>
</li>
</ul>`, h: 300 },
      { id: "row-closed", n: "report row, closed", say: "closed, w the reason.", html: `<ul class="lc-issue-list">
<li class="lc-issue">
<h3 id="lc-issue-a1b2c3" class="lc-issue-h">The Like button double-announces. Bug, closed. 4 agree, 1 disagree.</h3>
<p class="lc-desc lc-issue-body">when i like a Dream VoiceOver says Liked twice.</p>
<p class="lc-desc lc-issue-meta">Reported 2 hours ago on web 2026.138.57. Closed because: fixed in the next build</p>
<ul class="lc-issue-replies"><li class="lc-desc">Looscid mods, 1 hour ago: set it to working on it. on it, thx for the report</li></ul>
<div class="lc-inrow lc-issue-votes"><button type="button" class="btn bgb lc-btn lc-issue-btn">Agree</button><button type="button" class="btn bgb lc-btn lc-issue-btn">Disagree</button></div>
</li>
</ul>`, h: 320 },
      { id: "form-focused", n: "focused", say: "focus ring on the Title box.", html: `<div class="lc-issue-form">
<fieldset class="lc-fs"><legend class="lc-fs-l">What kind?</legend><div class="lc-radios lc-radios-col"><label class="lc-radio"><input type="radio" name="lc-issue-type" value="bug"><span>Bug, something's broken</span></label><label class="lc-radio"><input type="radio" name="lc-issue-type" value="idea"><span>Idea, something new</span></label></div></fieldset>
<label for="lc-issue-title" class="lc-fs-l" style="display: block;">Title</label>
<input id="lc-issue-title" type="text" class="inp lc-issue-in demo-focus" maxlength="120" autocomplete="off">
<label for="lc-issue-body" class="lc-fs-l" style="display: block;">What happened?</label>
<textarea id="lc-issue-body" class="inp" rows="5" maxlength="4000"></textarea>
<p class="lc-desc">Looscid adds the app and its version by itself. Your report, its title and your key are public.</p>
<button type="button" id="lc-issue-send" class="btn bp lc-big">Send report</button>
</div>`, h: 520 }
    ],
    code: `<div class="lc-issue-form">
<fieldset class="lc-fs"><legend class="lc-fs-l">What kind?</legend><div class="lc-radios lc-radios-col"><label class="lc-radio"><input type="radio" name="lc-issue-type" value="bug"><span>Bug, something's broken</span></label><label class="lc-radio"><input type="radio" name="lc-issue-type" value="idea"><span>Idea, something new</span></label></div></fieldset>
<label for="lc-issue-title" class="lc-fs-l" style="display: block;">Title</label>
<input id="lc-issue-title" type="text" class="inp lc-issue-in" maxlength="120" autocomplete="off">
<label for="lc-issue-body" class="lc-fs-l" style="display: block;">What happened?</label>
<textarea id="lc-issue-body" class="inp" rows="5" maxlength="4000"></textarea>
<p class="lc-desc">Looscid adds the app and its version by itself. Your report, its title and your key are public.</p>
<button type="button" id="lc-issue-send" class="btn bp lc-big">Send report</button>
</div>

<ul class="lc-issue-list">
<li class="lc-issue">
<h3 id="lc-issue-a1b2c3" class="lc-issue-h">The Like button double-announces. Bug, new. 4 agree, 1 disagree.</h3>
<p class="lc-desc lc-issue-body">when i like a Dream VoiceOver says Liked twice.</p>
<p class="lc-desc lc-issue-meta">Reported 2 hours ago on web 2026.138.57</p>
<div class="lc-inrow lc-issue-votes"><button type="button" class="btn bgb lc-btn lc-issue-btn">Agree</button><button type="button" class="btn bgb lc-btn lc-issue-btn">Disagree</button></div>
</li>
</ul>`,
    js: `// a report never gets lost (js/issues.js, cut down): the draft stays until Rem says it's in
async function send() {
  if (!draft.title.trim()) { showMsg("type a title first"); return; }
  busy = true;
  const r = await postSignedReport(draft);   // signed w ur own key
  busy = false;
  if (r.ok) { draft = { type: "bug", title: "", body: "" }; say("Report sent"); }
  else say("can't reach the report list rn, try again in a bit"); // draft is still there
}`,
    vo: [
      `the form is a radio group ("What kind?"), then "Title, text field", "What happened?, text field" and "Send report, button". no required attribute: if the title is empty, it tells u in words.`,
      `each report is one heading, so the headings rotor is a list of reports and one swipe reads the whole thing: "The Like button double-announces. Bug, new. 4 agree, 1 disagree. heading level 3".`,
      `Agree and Disagree are plain buttons that say what they'll do ("Take back agree", "Disagree instead"), and after u vote the live region says "Agreed. you + 3 others agree".`,
      "braille display: type the report, Enter on Send report sends it. Enter on Agree votes."
    ],
    rel: ["native-select", "radio-group", "live-region"],
  },
  {
    slug: "skip-link",
    t: "Skip to content link",
    s: "the first link on every screen. jumps past the top bar straight to the content.",
    where: [
      "it's the very first thing in the app. hidden until it gets focus, then it slides in at the top. press it and focus jumps to the main content.",
      "mostly for keyboard, switch and braille display folks, but VoiceOver can use it too."
    ],
    states: [
      { id: "hidden", n: "hidden", say: "it's there but off screen until focused.", html: `<a href="#main-content" class="skip-link" style="">Skip to content</a>
<p class="lc-desc" style="padding: 56px 16px 0;">(the rest of the screen would be here)</p>`, h: 110 },
      { id: "focused", n: "focused", say: "it slides in when it gets focus.", html: `<a href="#main-content" class="skip-link demo-focus" style="top: 0;">Skip to content</a>
<p class="lc-desc" style="padding: 56px 16px 0;">(the rest of the screen would be here)</p>`, h: 110 }
    ],
    code: `<a href="#main-content" class="skip-link">Skip to content</a>`,
    js: null,
    vo: [
      `it's the first swipe on the screen: "Skip to content, link".`,
      "double tap and focus moves to the content. the demo link above only moves inside the demo box.",
      "braille display: Enter on it jumps. keyboard: it's the first Tab stop."
    ],
    rel: ["back-header", "bottom-tab-bar", "buttons"],
  }
];

/* Nov 8 2026 (Carter: "a components library that lists all the components", "include the storybook one"): Looscid's own
   component library, in the Help Center's developer part at /help/dev/components/. Every piece of the app gets its own page:
   what it is, a live demo of each state, the code to copy (copy it into ur part of Looscid and own it, no package), and how it
   works with VoiceOver. Our own code, no outside tools.
   The demos are plain HTML pages shown in a frame, drawn with the app's real css/app.css and css/a11y.css. They have no
   scripts at all (their Content-Security-Policy says script-src 'none', connect-src 'none' and form-action 'none'), so a demo
   can't run the app's real actions or reach the network. Headings inside a demo are shown as plain text, so each page keeps
   one h1 and its heading order; the code to copy keeps the real headings.
   Change the words or the markup here, then run: node .github/scripts/build-help.mjs */
export const COMPONENTS_INTRO = "every piece of looscid, one page each: a live demo of every state, the code to copy and own, and how it works w VoiceOver.";

export function buildComponents({ page, put, esc }) {
  const bySlug = Object.fromEntries(COMPONENTS.map(c => [c.slug, c]));
  const crumbsUp = [["Help Center", "../../../"], ["Building Looscid", "../../../#h-building"], ["Components", "../"]];
  // The index: one h1, then a plain list of real links, each with one line.
  {
    let b = "<h1>Components</h1>\n<p class=\"lead\">" + esc(COMPONENTS_INTRO) + "</p>\n";
    b += "<p>the idea: u don't install anything. find the piece u need, look at its states, copy the code into ur part of looscid and it's yours. the demos are look-only, pressing stuff in them does nothing.</p>\n";
    b += "<ul class=\"list\">" + COMPONENTS.map(c => '<li><a href="' + c.slug + '/">' + esc(c.t) + "</a><p>" + esc(c.s) + "</p></li>").join("") + "</ul>\n";
    b += '<p class="next"><a href="../../#h-building">More in Building Looscid</a></p>';
    put("dev/components/index.html", page({ slug: "dev/components", title: "Components", desc: "Looscid's own component library: " + COMPONENTS_INTRO, body: b, depth: 2,
      crumbs: [["Help Center", "../../"], ["Building Looscid", "../../#h-building"], ["Components", null]] }));
  }
  for (const c of COMPONENTS) {
    let b = '<link rel="stylesheet" href="../components.css?v=1">\n';
    b += "<h1>" + esc(c.t) + '</h1>\n<p class="lead">' + esc(c.s) + "</p>\n";
    b += '<h2 id="what">what it is</h2>\n' + c.where.map(p => "<p>" + p + "</p>").join("\n") + "\n";
    b += '<h2 id="states">states</h2>\n<p>live demos, drawn w looscid\'s real styles. look-only: nothing in them does anything.</p>\n';
    for (const st of c.states) {
      b += '<h3 id="state-' + st.id + '">' + esc(st.n) + "</h3>\n<p>" + esc(st.say) + "</p>\n";
      b += '<iframe class="cl-frame" src="' + st.id + '.html" title="' + esc(c.t + " demo, " + st.n) + '" loading="lazy" style="height:' + (st.h || 160) + 'px"></iframe>\n';
      put("dev/components/" + c.slug + "/" + st.id + ".html", demo(c, st));
    }
    b += '<h2 id="code">copy the code</h2>\n<h3 id="code-html">html</h3>\n<pre class="cl-code"><code id="code-' + c.slug + '-html">' + esc(c.code) + "</code></pre>\n";
    b += '<p><button type="button" class="btn cl-copy" data-copy="code-' + c.slug + '-html" hidden>Copy code</button></p>\n';
    if (c.js) {
      b += '<h3 id="code-js">js</h3>\n<pre class="cl-code"><code id="code-' + c.slug + '-js">' + esc(c.js) + "</code></pre>\n";
      b += '<p><button type="button" class="btn cl-copy" data-copy="code-' + c.slug + '-js" hidden>Copy JS code</button></p>\n';
    }
    b += '<p>it uses the classes from css/app.css and css/a11y.css, so it looks right anywhere in looscid.</p>\n';
    b += '<h2 id="voiceover">how it works w voiceover</h2>\n<ul>' + c.vo.map(v => "<li>" + esc(v) + "</li>").join("") + "</ul>\n";
    b += '<h2 id="related">related</h2>\n<ul>' + c.rel.filter(r => bySlug[r]).map(r => '<li><a href="../' + r + '/">' + esc(bySlug[r].t) + "</a></li>").join("") + "</ul>\n";
    b += '<p class="next"><a href="../">All components</a></p>\n<script src="../components.js?v=1"></script>';
    put("dev/components/" + c.slug + "/index.html", page({ slug: "dev/components/" + c.slug, title: c.t + " component", desc: c.s, body: b, depth: 3, crumbs: crumbsUp.concat([[c.t, null]]) }));
  }
  function demo(c, st) {
    const shown = st.html.replace(/<(\/?)h[1-6]\b/g, "<$1p");
    return '<!DOCTYPE html>\n<html lang="en-US">\n<head>\n<meta charset="UTF-8"/>\n<title>' + esc(c.t + " demo, " + st.n) + " - Looscid components</title>\n" +
      "<!-- Made by .github/scripts/build-help.mjs from .github/scripts/components.mjs. A look-only demo: no scripts, no network. -->\n" +
      '<meta name="robots" content="noindex">\n' +
      "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'self'\"/>\n" +
      '<meta name="viewport" content="width=device-width,initial-scale=1"/>\n' +
      '<link rel="stylesheet" href="../../../../css/app.css?v=cl1">\n<link rel="stylesheet" href="../../../../css/a11y.css?v=cl1">\n<link rel="stylesheet" href="../demo.css?v=1">\n' +
      '</head>\n<body class="lc-demo">\n' + shown + "\n</body>\n</html>\n";
  }
}
