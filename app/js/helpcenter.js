/* Looscid helpcenter.js: Help (Round 6.6). 2three1y, 5:11 PM Oct 10: "help" is a short list, "cherry help" reads one
   area, and a Help Center page in More. Plain script (not a module), plain JavaScript (Looscid.lcEl and lcPatch).
   Everything it shares goes on window.Looscid; see docs/dev/FILES.md for the load order (after js/projects.js).
   - lcHelpIntent(n): called first in lcRun (core.js) with the normalized text. help: the top commands. help list: every
     command, the old long list. <area> help, help <area> or <area>help (cherry help, cherryhelp, projects help,
     earcons help): that area's commands, the same areas as the Commands page. help center: the Help Center page.
     new dream: the Dream composer, empty (you press Dream yourself).
   - HelpCenterPage: Back, the heading, Close Help Center (braille: "Close"), then the collections, the course and Contact Us
     (build 195, words in js/helpdata.js). Opening it moves focus to its heading, because you asked for it. */
(function (Looscid) {
const { LC_COMMANDS, lcNorm, lcCloseProps, lcCompose } = Looscid;
const { lcEl: h, lcPatch, lcPlainScreen, lcIconEl } = Looscid;

/* The short list: the commands most people need first. */
const LC_HELP_TOP = [
  ["open cherry", "Cherry, the Looscid assistant"],
  ["new cherry chat", "a new, empty Cherry chat"],
  ["new dream", "the Dream composer"],
  ["feed and a name", "switch feeds, like feed following"],
  ["projects", "My projects, in More"],
  ["settings", "read out every setting"],
  ["status", "online, version and your main settings"],
  ["commands", "the Commands page, every command as a button"],
  ["help center", "the Help Center"],
  ["cherry help", "just the Cherry commands; any area works, like projects help or earcons help"],
];
/* Words for each Commands page area (js/commands.js LC_CMD_GROUPS titles). */
const LC_HELP_AREAS = [
  ["Cherry", ["cherry", "cherry ai", "assistant", "ai"]],
  ["Projects", ["projects", "project", "my projects"]],
  ["Earcons and music", ["earcons", "earcon", "sounds", "sound", "audio", "music", "earcons and music", "sounds and music"]],
  ["Go to a place", ["places", "place", "go", "go to", "go to a place", "navigation", "open", "navigate"]],
  ["Commandbar", ["commandbar", "command bar", "terminal", "commands"]],
  ["Feeds and Dreams", ["feeds", "feed", "dreams", "dream", "feeds and dreams"]],
  ["Sense", ["braille", "screen reader", "voiceover", "voice over", "speech", "screen reader and braille", "sense"]],
  ["Settings", ["settings", "setting"]],
];
function lcHelpArea(word) {
  const w = lcNorm(word || ""), sq = w.replace(/[^a-z0-9]/g, "");
  if (!w) return null;
  const a = LC_HELP_AREAS.find(function (x) { return x[1].some(function (k) { return k === w || k.replace(/ /g, "") === sq; }); });
  return a ? a[0] : null;
}
function lcHelpDesc() { const d = {}; (Looscid.LC_COMMANDS || LC_COMMANDS).forEach(function (c) { if (!(c[0] in d)) d[c[0]] = c[1]; }); return d; }
function lcHelpIntent(n) {
  n = lcNorm(n || "");
  if (n === "help" || n === "?") {
    const lines = [["Top commands:", "hi"]].concat(LC_HELP_TOP.map(function (c) { return [c[0] + ": " + c[1], ""]; }));
    lines.push(["Type commands for all of them.", "info"]);
    return { lines: lines, say: "Top commands: " + LC_HELP_TOP.map(function (c) { return c[0]; }).join(", ") + ". Type commands for all of them." };
  }
  if (/^(help list|help all|all help|full help|help full|help everything|read all commands)$/.test(n)) return { full: true };
  if (/^(legal|open legal|legal page|show legal|legal stuff|licenses?|terms and privacy)$/.test(n)) return { place: "legal" };
  if (/^(help ?center|open help ?center|go to help ?center|show help ?center|help ?centre|open help ?centre)$/.test(n)) return { place: "helpcenter" };
  if (/^(new dream|newdream|write a dream|compose a dream|compose|new dream composer|dream composer|open composer|open dream composer)$/.test(n))
    return { say: "Opened the Dream composer.", fn: function () { lcCompose({ mode: "new" }); } };
  let m = /^help (.+)$/.exec(n) || /^(.+?) ?help$/.exec(n);
  if (!m) return null;
  const area = lcHelpArea(m[1]);
  if (!area) return null;
  const g = (Looscid.LC_CMD_GROUPS || []).find(function (x) { return x[0] === area; });
  if (!g) return null;
  const d = lcHelpDesc(), cmds = g[1].filter(function (c) { return c in d; });
  const lines = [[area + " commands:", "hi"]].concat(cmds.map(function (c) { return [c + ": " + d[c], ""]; }));
  lines.push(["Type help for the top commands, or commands for all of them.", "info"]);
  return { lines: lines, say: area + " commands: " + cmds.join(", ") + ". Type help for the top commands." };
}

/* Commandbar and the Commands page know these. */
(function () {
  const C = Looscid.LC_COMMANDS; if (!C) return;
  const hl = C.find(function (c) { return c[0] === "help"; });
  if (hl) hl[1] = "the top commands. An area and help reads that area, like cherry help or cherryhelp; help list reads every command";
  C.push(["help list", "read every command, the long list"]);
  C.push(["cherry help", "just the Cherry commands; any area works: projects help, earcons help, braille help, settings help"]);
  C.push(["help center", "the Help Center: step-by-step articles in Getting Started; Dreams, replies and threads; Chats, Circles and Cherry; Settings, privacy and backup; the Looscid Basics course; and Contact Us"]);
  C.push(["new dream", "the Dream composer, empty; you press Dream yourself"]);
  C.push(["legal", "the Legal page: Terms, Privacy, Community rules, Looscid's license and open source credits"]);
  const G = Looscid.LC_CMD_GROUPS; if (!G) return;
  const cb = G.find(function (g) { return g[0] === "Commandbar"; });
  if (cb) { const i = cb[1].indexOf("help"); cb[1].splice(i < 0 ? 0 : i + 1, 0, "help list", "cherry help", "help center"); }
  const gp = G.find(function (g) { return g[0] === "Go to a place"; });
  if (gp) gp[1].push("legal");
  const fd = G.find(function (g) { return g[0] === "Feeds and Dreams"; });
  if (fd) fd[1].unshift("new dream");
})();

/* The Help Center page.
   Build 195 (Carter, Oct 28 2026, Dreamor Council): rebuilt for total beginners, for everyone, on any phone or computer.
   The words live in js/helpdata.js (LC_HELP), the same ones the Help Center website at /help/ shows. It has:
   - Collections (Getting Started; Dreams, replies and threads; Chats, Circles and Cherry; Settings, privacy and backup),
     each listing its step-by-step articles; articles link related articles.
   - Wherever an article says to go somewhere, a real link opens that screen, with the path after it, like
     "Open Backup (Profile, More, Settings, General)".
   - The Looscid Basics course: Lesson 1, 2, 3 with Next. Progress is saved only on this device (localStorage,
     looscid_help_progress, shared with the website).
   - Contact Us: Report a bug (a prefilled GitHub issue) and the Discord, whose #feedback turns into GitHub issues. No email.
   One h1, the screen you're on. Opening a part moves focus to its heading, because you asked for it. */
const LC_HELP_KEY = "looscid_help_progress";
const LC_HELP_LIST = { paddingLeft: "1.6em", margin: "4px 0 12px" };
function lcHelpData() { return Looscid.LC_HELP || { collections: [], articles: [], courses: [], contact: {} }; }
function lcHelpDone(course) { try { const o = JSON.parse(localStorage.getItem(LC_HELP_KEY) || "{}"); return Array.isArray(o[course]) ? o[course] : []; } catch (e) { return []; } }
function lcHelpMark(course, id, clear) {
  try { const o = JSON.parse(localStorage.getItem(LC_HELP_KEY) || "{}") || {};
    if (clear) delete o[course]; else { const d = Array.isArray(o[course]) ? o[course] : []; if (d.indexOf(id) < 0) d.push(id); o[course] = d; }
    localStorage.setItem(LC_HELP_KEY, JSON.stringify(o)); } catch (e) {}
}
// Turns [[Route|Label|Path]] and {{article}} into links. Screen links open that screen in Looscid; article links open the article here.
function lcHelpRich(text, act) {
  const out = [], re = /\[\[([^|\]]*)\|([^|\]]+)\|([^\]]+)\]\]|\{\{([a-z0-9-]+)(?:\|([^}]+))?\}\}/g, D = lcHelpData();
  let last = 0, m, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      const r = Looscid.lcRouteFor ? Looscid.lcRouteFor(m[1]) : null, page = r ? r.page : null;
      const href = page && Looscid.lcPathFor ? (Looscid.lcPathFor(page) || "#") : "#";
      out.push(h('a', { key: "g" + (k++), className: "lc-link lc-help-go", href: href, onClick: function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); if (page && Looscid.LC_NAV) Looscid.LC_NAV(page); } }, "Open " + m[2]));
      out.push(" (" + m[3] + ")");
    } else {
      const a = D.articles.find(function (x) { return x.id === m[4]; });
      out.push(h('a', { key: "a" + (k++), className: "lc-link", href: (D.home || "help/") + m[4] + "/", onClick: function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); act.open({ kind: "art", id: m[4] }); } }, m[5] || (a ? a.t : m[4])));
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
function lcHelpTitle(v) {
  const D = lcHelpData();
  if (v.kind === "col") { const c = D.collections.find(function (x) { return x.id === v.id; }); return c ? c.t : "Help Center"; }
  if (v.kind === "art") { const a = D.articles.find(function (x) { return x.id === v.id; }); return a ? a.t : "Help Center"; }
  if (v.kind === "course") { const c = D.courses.find(function (x) { return x.id === v.id; }); return c ? c.t : "Help Center"; }
  if (v.kind === "contact") return D.contact.t || "Contact Us";
  return "Help Center";
}
function lcHelpArtLink(a, act, extra) {
  return h('a', { className: "lc-link", href: (lcHelpData().home || "help/") + a.id + "/", onClick: function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); act.open(Object.assign({ kind: "art", id: a.id }, extra || {})); } }, a.t);
}
function helpBody(v, act) {
  const D = lcHelpData(), pad = { padding: "0 16px" }, web = D.home || "https://looscid.github.io/Looscid/help/";
  const P = function (t, k) { return h('p', { key: k, className: "lc-desc" }, t); };
  if (v.kind === "col") {
    const c = D.collections.find(function (x) { return x.id === v.id; }) || {}, arts = D.articles.filter(function (a) { return a.c === v.id; });
    return h('div', { className: "lc-grp lc-help-sec", style: pad },
      P(c.s, "s"),
      h('h2', { className: "lc-sub-h" }, "Articles in this collection"),
      h('ol', { className: "lc-help-list", style: LC_HELP_LIST }, arts.map(function (a) { return h('li', { key: a.id }, lcHelpArtLink(a, act), h('p', { className: "lc-muted" }, a.s)); })));
  }
  if (v.kind === "art") {
    const a = D.articles.find(function (x) { return x.id === v.id; });
    if (!a) return P("That article isn't here anymore.", "x");
    const co = v.course ? D.courses.find(function (x) { return x.id === v.course; }) : null, idx = co ? co.lessons.indexOf(a.id) : -1;
    const col = D.collections.find(function (x) { return x.id === a.c; });
    return h('div', { className: "lc-grp lc-help-sec", style: pad },
      co && idx >= 0 ? h('p', { className: "lc-desc lc-help-lesson" }, co.t + ": Lesson " + (idx + 1) + " of " + co.lessons.length) : null,
      h('p', { className: "lc-desc" }, lcHelpRich(a.s, act)),
      h('h2', { className: "lc-sub-h" }, "Steps"),
      h('ol', { className: "lc-help-steps", style: LC_HELP_LIST }, a.steps.map(function (t, i) { return h('li', { key: i, className: "lc-desc" }, lcHelpRich(t, act)); })),
      a.tips && a.tips.length ? h('h2', { className: "lc-sub-h" }, "Good to know") : null,
      a.tips && a.tips.length ? h('ul', { style: LC_HELP_LIST }, a.tips.map(function (t, i) { return h('li', { key: i, className: "lc-desc" }, lcHelpRich(t, act)); })) : null,
      a.sr && a.sr.length ? h('p', null, h('button', { type: "button", id: "lc-help-sr-btn", className: "btn bgb lc-btn", "aria-expanded": act.srOpen ? "true" : "false", "aria-controls": "lc-help-sr", onClick: act.toggleSr }, "Screen reader tips (optional)")) : null,
      a.sr && a.sr.length && act.srOpen ? h('ul', { id: "lc-help-sr", style: LC_HELP_LIST }, a.sr.map(function (t, i) { return h('li', { key: i, className: "lc-desc" }, lcHelpRich(t, act)); })) : null,
      a.rel && a.rel.length ? h('h2', { className: "lc-sub-h" }, "Related articles") : null,
      a.rel && a.rel.length ? h('ul', { style: LC_HELP_LIST }, a.rel.map(function (id) { const r = D.articles.find(function (x) { return x.id === id; }); return r ? h('li', { key: id }, lcHelpArtLink(r, act)) : null; })) : null,
      co && idx >= 0 ? h('div', { className: "lc-inrow lc-help-course-nav", style: { marginTop: 16 } },
        idx > 0 ? h('button', { type: "button", id: "lc-help-prev", className: "btn bgb lc-btn", onClick: function () { act.open({ kind: "art", id: co.lessons[idx - 1], course: co.id }); } }, "Previous lesson") : null,
        idx < co.lessons.length - 1
          ? h('button', { type: "button", id: "lc-help-next", className: "btn bp lc-btn", onClick: function () { lcHelpMark(co.id, a.id); act.open({ kind: "art", id: co.lessons[idx + 1], course: co.id }); } }, "Next lesson")
          : h('button', { type: "button", id: "lc-help-next", className: "btn bp lc-btn", onClick: function () { lcHelpMark(co.id, a.id); act.open({ kind: "course", id: co.id }); act.say("You finished " + co.t + "."); } }, "Finish the course"),
        h('button', { type: "button", className: "btn bgb lc-btn", onClick: function () { act.open({ kind: "course", id: co.id }); } }, "All lessons"))
        : (col ? h('p', { className: "lc-desc" }, h('a', { className: "lc-link", href: web + col.id + "/", onClick: function (e) { e.preventDefault(); act.open({ kind: "col", id: col.id }); } }, "More in " + col.t)) : null),
      h('p', { className: "lc-desc" }, h('a', { className: "lc-link", href: web + a.id + "/", target: "_blank", rel: "noopener noreferrer" }, "This article on the web")));
  }
  if (v.kind === "course") {
    const co = D.courses.find(function (x) { return x.id === v.id; }) || { lessons: [] }, d = lcHelpDone(co.id);
    const n = co.lessons.filter(function (id) { return d.indexOf(id) >= 0; }).length, next = co.lessons.find(function (id) { return d.indexOf(id) < 0; });
    return h('div', { className: "lc-grp lc-help-sec", style: pad },
      P(co.s, "s"),
      P(n === 0 ? co.lessons.length + " lessons." : n >= co.lessons.length ? "All " + co.lessons.length + " lessons done." : n + " of " + co.lessons.length + " lessons done.", "n"),
      h('button', { type: "button", id: "lc-help-course-go", className: "btn bp lc-big", onClick: function () { act.open({ kind: "art", id: next || co.lessons[0], course: co.id }); } },
        next ? (n ? "Continue with Lesson " : "Start Lesson ") + (co.lessons.indexOf(next) + 1) : "Go over Lesson 1 again"),
      h('h2', { className: "lc-sub-h" }, "Lessons"),
      h('ol', { className: "lc-help-list", style: LC_HELP_LIST }, co.lessons.map(function (id, i) { const a = D.articles.find(function (x) { return x.id === id; }); if (!a) return null;
        return h('li', { key: id }, h('a', { className: "lc-link", href: web + id + "/?course=" + co.id, onClick: function (e) { e.preventDefault(); act.open({ kind: "art", id: id, course: co.id }); } }, "Lesson " + (i + 1) + ": " + a.t + (d.indexOf(id) >= 0 ? ", done" : ""))); })),
      h('button', { type: "button", id: "lc-help-course-reset", className: "btn bgb lc-btn", onClick: function () { lcHelpMark(co.id, null, true); act.redraw(); act.say("Progress cleared. The course starts at Lesson 1 again."); } }, "Start the course over"),
      P("Your progress is saved only on this device. Nothing is sent anywhere.", "p"));
  }
  if (v.kind === "contact") {
    const k = D.contact || {};
    return h('div', { className: "lc-grp lc-help-sec", style: pad },
      P(k.s, "s"),
      h('h2', { className: "lc-sub-h" }, "Report a bug"),
      P("Found something broken? This opens a new GitHub issue with your build number and device already filled in, so you just say what happened. GitHub asks you to log in there.", "b"),
      h('p', { className: "lc-desc" }, h('a', { id: "lc-help-report-bug", className: "btn bgb lc-big lc-bug-link", href: Looscid.lcBugReportUrl ? Looscid.lcBugReportUrl() : "https://github.com/Looscid/Looscid/issues/new", target: "_blank", rel: "noopener noreferrer",
        onClick: function (e) { if (Looscid.lcBugReportUrl) e.currentTarget.href = Looscid.lcBugReportUrl(); } }, "Report a bug")),
      h('h2', { className: "lc-sub-h" }, "Send feedback or join the Discord"),
      P("Ideas, questions, or just want to say hi? Join the Looscid Discord. Anything you write in its #feedback channel turns into a GitHub issue by itself, and LooscidBOT answers you there with the link.", "d"),
      h('p', { className: "lc-desc" }, h('a', { id: "lc-help-discord", className: "lc-link", href: k.discord || Looscid.LC_DISCORD_URL || "https://discord.gg/M6xrD8EBXU", target: "_blank", rel: "noopener noreferrer" }, "Join the Looscid Discord")),
      P("Send Feedback writes a GitHub issue for you: pick a category, say what happened, and press Open it on GitHub.", "f"),
      h('button', { type: "button", id: "lc-help-feedback", className: "btn bgb lc-btn", onClick: act.feedback }, "Open Send Feedback"),
      h('h2', { className: "lc-sub-h" }, "See what others reported"),
      h('p', { className: "lc-desc" }, h('a', { id: "lc-help-issues", className: "lc-link", href: k.issues || "https://github.com/Looscid/Looscid/issues", target: "_blank", rel: "noopener noreferrer" }, "Looscid's GitHub issues")),
      h('p', { className: "lc-desc" }, h('a', { id: "lc-help-build", className: "lc-link", href: "https://github.com/Looscid/Looscid", target: "_blank", rel: "noopener noreferrer" }, "Help build Looscid on GitHub")));
  }
  // Home
  return h('div', null,
    h('p', { className: "lc-desc", style: { padding: "12px 16px 0" } }, "Step-by-step help for Looscid, for everyone, on any phone or computer. New here? Start with the Looscid Basics course. In these articles, press means tap, click, or Enter or Space on a keyboard."),
    h('section', { className: "lc-grp lc-help-sec", "aria-labelledby": "lc-help-h-courses", style: pad },
      h('h2', { id: "lc-help-h-courses", className: "lc-sub-h" }, "Courses"),
      D.courses.map(function (co) { const n = lcHelpDone(co.id).length;
        return h('div', { key: co.id },
          h('p', { className: "lc-desc" }, h('a', { id: "lc-help-course-" + co.id, className: "lc-link", href: web + co.id + "/", onClick: function (e) { e.preventDefault(); act.open({ kind: "course", id: co.id }); } }, co.t),
            ". " + co.s + (n ? " " + Math.min(n, co.lessons.length) + " of " + co.lessons.length + " lessons done." : ""))); })),
    D.collections.map(function (c) {
      const hid = "lc-help-h-" + c.id;
      return h('section', { key: c.id, className: "lc-grp lc-help-sec", "aria-labelledby": hid, style: pad },
        h('h2', { id: hid, className: "lc-sub-h" }, c.t),
        P(c.s, "s"),
        h('ul', { style: LC_HELP_LIST }, D.articles.filter(function (a) { return a.c === c.id; }).map(function (a) { return h('li', { key: a.id, className: "lc-desc" }, lcHelpArtLink(a, act)); })),
        h('button', { type: "button", id: "lc-help-col-" + c.id, className: "btn bgb lc-btn", onClick: function () { act.open({ kind: "col", id: c.id }); } }, "Open " + c.t));
    }),
    h('section', { className: "lc-grp lc-help-sec", "aria-labelledby": "lc-help-h-more", style: pad },
      h('h2', { id: "lc-help-h-more", className: "lc-sub-h" }, "Commands and the fine print"),
      P("Type help in Commandbar for the top commands, an area and help for one area, like cherry help, and commands for every command.", "c"),
      h('button', { type: "button", id: "lc-help-commands", className: "btn bgb lc-btn", onClick: act.commands }, "Open the Commands page"),
      P("Terms, Privacy, Community rules, Looscid's license and the open source credits are on the Legal page.", "l"),
      h('button', { type: "button", id: "lc-help-legal", className: "btn bgb lc-btn", onClick: function () { if (Looscid.LC_NAV) Looscid.LC_NAV("legal"); } }, "Open Legal")),
    h('section', { className: "lc-grp lc-help-sec", "aria-labelledby": "lc-help-h-gethelp", style: { padding: "0 16px 24px" } },
      h('h2', { id: "lc-help-h-gethelp", className: "lc-sub-h" }, "Contact Us"),
      P("Something broken, or an idea? Report a bug on GitHub, or tell us on the Looscid Discord. Looscid has no email.", "k"),
      h('button', { type: "button", id: "lc-help-contact", className: "btn bgb lc-btn", onClick: function () { act.open({ kind: "contact" }); } }, "Open Contact Us"),
      h('p', { className: "lc-desc" }, h('a', { id: "lc-help-web", className: "lc-link", href: web, target: "_blank", rel: "noopener noreferrer" }, "The Help Center on the web"))));
}
function helpView(p, act) {
  const v = act.view;
  return h('div', { className: "pg lc-helpcenter" },
    h('div', { className: "hdr" },
      h('div', { className: "hdr-row" },
        h('button', { type: "button", className: "bi", onClick: act.up, "aria-label": "Back" }, lcIconEl("Bck", { style: { width: 21, height: 21 } })),
        h('h1', { className: "hdr-title", tabIndex: -1 }, lcHelpTitle(v)),
        h('button', Object.assign({ type: "button", className: "lc-close", onClick: act.back }, lcCloseProps("Help Center")), "Close"))),
    helpBody(v, act));
}
const HelpCenterPage = lcPlainScreen("HelpCenterPage", function (host, props) {
  let p = props, alive = true;
  const act = {
    view: { kind: "home" }, srOpen: false, trail: [],
    back: function () { if (p.onBack) p.onBack(); },
    commands: function () { if (Looscid.LC_NAV) Looscid.LC_NAV("commands"); },
    feedback: function () { if (Looscid.LC_NAV) Looscid.LC_NAV("feedback"); },
    say: function (t) { if (Looscid.announce) Looscid.announce(t); },
    redraw: function () { draw(); },
    toggleSr: function () { act.srOpen = !act.srOpen; draw(); },
    open: function (v) { act.trail.push(act.view); act.view = v; act.srOpen = false; draw(); focusHead(); },
    // Back inside the Help Center goes to the part you came from; at the start, it leaves the Help Center.
    up: function () { if (act.trail.length) { act.view = act.trail.pop(); act.srOpen = false; draw(); focusHead(); } else act.back(); },
  };
  const focusHead = function () { setTimeout(function () { if (!alive) return; const hd = host.querySelector("h1"); if (hd) { hd.focus(); try { window.scrollTo(0, 0); } catch (e) {} } }, 40); };
  const draw = function () { if (alive) lcPatch(host, helpView(p, act)); };
  draw();
  setTimeout(function () { if (!alive) return; const hd = host.querySelector("h1"); if (hd && !host.contains(document.activeElement)) hd.focus(); }, 60);
  return { update: function (np) { p = np; draw(); }, stop: function () { alive = false; } };
});


const LC_MIT_NOTICES = [
  ["React and React DOM 18.2.0", "Copyright (c) Meta Platforms, Inc. and affiliates."],
  ["noble curves, noble hashes, noble ciphers and scure base (inside nostr-tools)", "Copyright (c) Paul Miller (https://paulmillr.com)."],
  ["NexOS, with its Insomnia app", "Copyright (c) 2026 Carter."],
  ["Memeprojects, Easyconvert, Lyric Finder, Soundvault, Reactor Toolbar and Code Translator", "Copyright (c) 2026 Carter."],
  ["Vibework", "Copyright (c) 2026 Vibework contributors."],
];
/* Round 6.6 (2three1y, 5:25 PM: "where is the legal button?"): the Legal page, from About Looscid's Legal button,
   the legal command, the Help Center and the Commands page. Back and Close Legal (braille: "Close"). */
function legalView(p, act) {
  const go = function (pg, label, id) { return h('li', { key: pg }, h('button', { type: "button", id: id, className: "btn bgb lc-big", style: { width: "100%", marginTop: 8 }, onClick: function () { act.go(pg); } }, label)); };
  const sec = function (id, title, kids) { return h('section', { key: id, className: "lc-grp", "aria-labelledby": id, style: { padding: "0 16px" } }, h('h2', { id: id, className: "lc-sub-h" }, title), kids); };
  return h('div', { className: "pg lc-legal" },
    h('div', { className: "hdr" },
      h('div', { className: "hdr-row" },
        h('button', { type: "button", className: "bi", onClick: act.back, "aria-label": "Back" }, lcIconEl("Bck", { style: { width: 21, height: 21 } })),
        h('h1', { className: "hdr-title", tabIndex: -1 }, "Legal"),
        h('button', Object.assign({ type: "button", className: "lc-close", onClick: act.back }, lcCloseProps("Legal")), "Close"))),
    h('p', { className: "lc-desc", style: { padding: "12px 16px 0" } }, "Looscid's terms, privacy, rules, license and open source credits, in plain words."),
    sec("lc-legal-h-terms", "Terms, privacy and rules", [
      h('p', { key: "p", className: "lc-desc" }, "Short and plain: what you agree to, what stays on your device, and how we treat each other."),
      h('ul', { key: "u", className: "mlist", "aria-label": "Terms, privacy and rules" }, go("terms", "Terms", "legal-terms"), go("privacy", "Privacy", "legal-privacy"), go("guidelines", "Community rules", "legal-rules"))]),
    sec("lc-legal-h-license", "Looscid's license", [
      h('p', { key: "p1", className: "lc-desc" }, "Looscid is open source under the Looscid Public License (LPL) v1.0. You can read, share and change the code. Two rules: no ads, and no commercial use."),
      h('p', { key: "p2", className: "lc-desc" }, h('a', { href: "https://github.com/Looscid/Looscid/blob/main/LICENSE", target: "_blank", rel: "noopener noreferrer" }, "The Looscid Public License, in full, on GitHub"))]),
    sec("lc-legal-h-oss", "Open source credits and licenses", [
      h('p', { key: "p1", className: "lc-desc" }, "Looscid uses and learns from other open source projects. Each one keeps its own license: most are MIT, and their notices stay with their code. My own projects keep their LICENSE files next to them."),
      h('p', { key: "p2", className: "lc-desc" }, "The FastSM-inspired Soundpack is inspired by FastSMRW by masonasons (no code or audio copied). The composer's layout is inspired by Feditext (GPL-3.0); no code was used. Profile design recreated from Feditext by Metabolist (GPL-3.0); no Feditext code is used. The Soundvault Soundpack plays sounds from where Soundvault links them, loaded when they play, under their own terms; nothing is copied into Looscid."),
      h('ul', { key: "u", className: "mlist", "aria-label": "Credits" }, go("credits", "Credits and open source", "legal-credits"))]),
    // Round 6.6: the MIT notices of the MIT code Looscid carries or loads. Each LICENSE file also stays next to its code.
    sec("lc-legal-h-mit", "MIT notices", [
      h('p', { key: "p1", className: "lc-desc" }, "These parts of Looscid are under the MIT License:"),
      h('ul', { key: "u", className: "lid-help lc-mit", style: { paddingLeft: 22, margin: "6px 0" } }, LC_MIT_NOTICES.map(function (n) { return h('li', { key: n[0] }, n[0] + ": " + n[1]); })),
      h('p', { key: "p2", className: "lc-desc" }, "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \u201cSoftware\u201d), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:"),
      h('p', { key: "p3", className: "lc-desc" }, "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software."),
      h('p', { key: "p4", className: "lc-desc" }, "THE SOFTWARE IS PROVIDED \u201cAS IS\u201d, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE."),
      h('p', { key: "p5", className: "lc-desc" }, "nostr-tools is under the Unlicense (public domain), v86 under the BSD 2-Clause License, SeaBIOS under the LGPL-3.0, and the DM fonts under the SIL Open Font License 1.1. Their license files and links are on the Credits page.")]),
    h('div', { style: { height: 24 } }));
}
const LegalPage = lcPlainScreen("LegalPage", function (host, props) {
  let p = props, alive = true;
  const act = { back: function () { if (p.onBack) p.onBack(); }, go: function (pg) { if (Looscid.LC_NAV) Looscid.LC_NAV(pg); } };
  const draw = function () { if (alive) lcPatch(host, legalView(p, act)); };
  draw();
  setTimeout(function () { if (!alive) return; const hd = host.querySelector("h1"); if (hd && !host.contains(document.activeElement)) hd.focus(); }, 60);
  return { update: function (np) { p = np; draw(); }, stop: function () { alive = false; } };
});

Object.assign(Looscid, { HelpCenterPage, LegalPage, LC_HELP_TOP, LC_HELP_AREAS, lcHelpIntent, lcHelpArea, lcHelpRich });
})(window.Looscid = window.Looscid || {});
