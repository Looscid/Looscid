/* Looscid helpcenter.js: Help (Round 6.6). 2three1y, 5:11 PM Oct 10: "help" is a short list, "cherry help" reads one
   area, and a Help Center page in More. Plain script (not a module), plain JavaScript (Looscid.lcEl and lcPatch).
   Everything it shares goes on window.Looscid; see docs/dev/FILES.md for the load order (after js/projects.js).
   - lcHelpIntent(n): called first in lcRun (core.js) with the normalized text. help: the top commands. help list: every
     command, the old long list. <area> help, help <area> or <area>help (cherry help, cherryhelp, projects help,
     earcons help): that area's commands, the same areas as the Commands page. help center: the Help Center page.
     new dream: the Dream composer, empty (you press Dream yourself).
   - HelpCenterPage: Back, the heading, Close Help Center (braille: "Close"), then short sections with plain headings
     and paragraphs. Opening it moves focus to its heading, because you asked for it. Nothing else moves focus. */
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
  C.push(["help center", "the Help Center: getting started, commands, Cherry, earcons, accessibility, projects, backup, and how to get help"]);
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

/* The Help Center page. */
const LC_HELP_SECTIONS = [
  ["Getting started", [
    "Looscid is a social app made for VoiceOver, braille and the keyboard. Home has your feed of Dreams. Below it are the tabs: Home, Discover, Create, Alerts and More.",
    "To write a Dream, open Create, or type new dream in Commandbar. You always press Dream yourself.",
    "Everything stays on this device unless you choose to share it.",
  ]],
  ["Commands", [
    "Commandbar opens from More, Open Commandbar, or with Control K or Command K, anywhere. Type a command and press Enter. Anything else goes to Cherry.",
    "Top commands: " + LC_HELP_TOP.slice(0, 9).map(function (c) { return c[0]; }).join(", ") + ".",
    "Type help for that short list, an area and help for one area (cherry help, projects help), and commands for the Commands page, where every command is a button.",
  ], "commands"],
  ["Cherry", [
    "Cherry is the Looscid assistant. Open it from More, or type open cherry. new cherry chat starts fresh; cherry history and cherry pinned chats open Your History.",
    "The Cherry page is called Cherry - DO IT YOUR WAY. New Chat is at the top, then Your History (All and Pinned), then the chat you're in. Each chat has Chat options: Pin, Edit name, Delete, New Chat and History.",
    "Turn Cherry on or off in Settings, Intelligence. Intelligence also has Memory (saving chats), Tools (what Cherry may do for you) and What Cherry did, with Undo.",
  ]],
  ["Earcons and sounds", [
    "Earcons are Looscid's short sounds. Settings, Earcons has the master volume, Soundpacks (Looscid, NexOS classic, Insomnia, Hyper Synth, FastSM-inspired, Soundvault, or your own imported pack), and switches for each sound.",
    "Command earcons give every command its own sound, and a failed command plays the error sound. Keyboard earcons click as you type, with their own sounds for Space, Delete and Enter. Both are on by default, and Calm mode never mutes them.",
  ]],
  ["Accessibility", [
    "VoiceOver: every control has a name, and Looscid speaks results once, politely. Focus only moves when you do something.",
    "Braille: Settings, Accessibility, Sense has braille output, short labels, and Enter to send. Close buttons show Close on a braille display.",
    "Keyboard: Tab and Shift Tab move, Enter and Space press, Escape closes. Settings, Keyboard shortcuts lists them all.",
    "Calm mode, Flash safety and Reduce Motion are in Settings, Accessibility, Motion and seizure.",
  ]],
  ["Projects", [
    "More, Projects has my own projects, built into Looscid: Memeprojects, Lyric Finder, Vibework, Soundvault and more. Each opens with Back and Close.",
    "Some say Coming soon, with a link to help me build them.",
  ]],
  ["Legal", [
    "About Looscid has a Legal button, and the legal command opens it too: Terms, Privacy, Community rules, Looscid's license (no ads, no commercial use) and the open source credits.",
  ], "legal"],
  ["Backup and data", [
    "Settings, Settings backup saves every setting as one file and brings it back. Backups never hold your keys or passwords.",
    "Settings, LooscidID shows what is stored on this device, and lets you export or delete it.",
  ]],
];
function helpView(p, act) {
  return h('div', { className: "pg lc-helpcenter" },
    h('div', { className: "hdr" },
      h('div', { className: "hdr-row" },
        h('button', { type: "button", className: "bi", onClick: act.back, "aria-label": "Back" }, lcIconEl("Bck", { style: { width: 21, height: 21 } })),
        h('h1', { className: "hdr-title", tabIndex: -1 }, "Help Center"),
        h('button', Object.assign({ type: "button", className: "lc-close", onClick: act.back }, lcCloseProps("Help Center")), "Close"))),
    h('p', { className: "lc-desc", style: { padding: "12px 16px 0" } }, "Short answers for using Looscid with VoiceOver, braille or a keyboard. Each part has its own heading."),
    LC_HELP_SECTIONS.map(function (s, i) {
      const hid = "lc-help-h-" + i;
      return h('section', { key: s[0], className: "lc-grp lc-help-sec", "aria-labelledby": hid, style: { padding: "0 16px" } },
        h('h2', { id: hid, className: "lc-sub-h" }, s[0]),
        s[1].map(function (t, k) { return h('p', { key: k, className: "lc-desc" }, t); }),
        s[2] === "commands" ? h('button', { type: "button", id: "lc-help-commands", className: "btn bgb lc-btn", onClick: act.commands }, "Open the Commands page") : null,
        s[2] === "legal" ? h('button', { type: "button", id: "lc-help-legal", className: "btn bgb lc-btn", onClick: function () { if (Looscid.LC_NAV) Looscid.LC_NAV("legal"); } }, "Open Legal") : null);
    }),
    // Round 6.6 (2three1y, 7:13 PM: yes to a Getting help section): the last section. Plain headings, paragraphs and links.
    h('section', { className: "lc-grp lc-help-sec", "aria-labelledby": "lc-help-h-gethelp", style: { padding: "0 16px 24px" } },
      h('h2', { id: "lc-help-h-gethelp", className: "lc-sub-h" }, "Getting help"),
      h('h3', { className: "lid-sub" }, "Send Feedback"),
      h('p', { className: "lc-desc" }, "Send Feedback is on the About Looscid page: open About Looscid from the footer at the end of any page, then Send Feedback. Choose a category, like Bug report, Feature request or Accessibility, write what happened, and press Open it on GitHub. That opens a new issue on Looscid's public GitHub page with your words filled in, so everyone can follow it. GitHub asks you to log in there."),
      h('button', { type: "button", id: "lc-help-feedback", className: "btn bgb lc-btn", onClick: act.feedback }, "Open Send Feedback"),
      h('h3', { className: "lid-sub" }, "Report a bug or ask for a feature"),
      h('p', { className: "lc-desc" }, "You can also go straight to GitHub issues. It opens in a new tab."),
      h('p', { className: "lc-desc" }, h('a', { id: "lc-help-issues", className: "lc-link", href: "https://github.com/Looscid/Looscid/issues", target: "_blank", rel: "noopener noreferrer" }, "Looscid's GitHub issues: https://github.com/Looscid/Looscid/issues")),
      h('h3', { className: "lid-sub" }, "Help build Looscid"),
      h('p', { className: "lc-desc" }, "Looscid is open source, and help is welcome. The Coming soon projects in More, Projects each have a link to help build them on GitHub too."),
      h('p', { className: "lc-desc" }, h('a', { id: "lc-help-build", className: "lc-link", href: "https://github.com/Looscid/Looscid", target: "_blank", rel: "noopener noreferrer" }, "Help build Looscid on GitHub")),
      h('h3', { className: "lid-sub" }, "Quick reminders"),
      h('p', { className: "lc-desc" }, "Type help for the top commands, an area and help for one area, like cherry help or projects help, and commands for every command.")));
}
const HelpCenterPage = lcPlainScreen("HelpCenterPage", function (host, props) {
  let p = props, alive = true;
  const act = {
    back: function () { if (p.onBack) p.onBack(); },
    commands: function () { if (Looscid.LC_NAV) Looscid.LC_NAV("commands"); },
    feedback: function () { if (Looscid.LC_NAV) Looscid.LC_NAV("feedback"); },
  };
  const draw = function () { if (alive) lcPatch(host, helpView(p, act)); };
  draw();
  setTimeout(function () { if (!alive) return; const hd = host.querySelector("h1"); if (hd && !host.contains(document.activeElement)) hd.focus(); }, 60);
  return { update: function (np) { p = np; draw(); }, stop: function () { alive = false; } };
});


const LC_MIT_NOTICES = [
  ["React and React DOM 18.2.0", "Copyright (c) Meta Platforms, Inc. and affiliates."],
  ["noble curves, noble hashes, noble ciphers and scure base (inside nostr-tools)", "Copyright (c) Paul Miller (https://paulmillr.com)."],
  ["NexOS, with its Insomnia app", "Copyright (c) 2026 Hasan (2three1y)."],
  ["Memeprojects, Easyconvert, Lyric Finder, Soundvault, Reactor Toolbar and Code Translator", "Copyright (c) 2026 Alhasan Altameemi."],
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
      h('p', { key: "p2", className: "lc-desc" }, h('a', { href: "https://github.com/Looscid/Looscid/blob/preview/LICENSE", target: "_blank", rel: "noopener noreferrer" }, "The Looscid Public License, in full, on GitHub"))]),
    sec("lc-legal-h-oss", "Open source credits and licenses", [
      h('p', { key: "p1", className: "lc-desc" }, "Looscid uses and learns from other open source projects. Each one keeps its own license: most are MIT, and their notices stay with their code. My own projects in More, Projects keep their LICENSE files next to them."),
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

Object.assign(Looscid, { HelpCenterPage, LegalPage, LC_HELP_TOP, LC_HELP_AREAS, LC_HELP_SECTIONS, lcHelpIntent, lcHelpArea });
})(window.Looscid = window.Looscid || {});
