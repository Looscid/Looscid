/* Looscid commands.js: the Commands page (Round 6.5.3). Every Commandbar command, grouped by area,
   each one a real button that runs it. Plain script (not a module), plain JavaScript (Looscid.lcEl and lcPatch).
   Everything it shares goes on window.Looscid; see FILES.md for the load order. */
(function (Looscid) {
const { LC_COMMANDS, LC_EXACT, announce, lcCloseProps, lcNorm } = Looscid;
const { lcEl: h, lcPatch, lcPlainScreen, lcIconEl } = Looscid;

/* Areas, in page order. A command not listed here still shows, under "More commands". */
const LC_CMD_GROUPS = [
  ["Go to a place", ["open feed", "open alerts", "open notifications", "open messages", "open circles", "open settings", "open accessibility", "open braille", "open verbosity", "open sounds", "open keyboard shortcuts", "open privacy", "open music", "open terminal", "about", "apps", "open insomnia", "coming soon", "import settings"]],
  ["Cherry", ["open cherry", "new cherry chat", "cherry pinned chats", "cherry history"]],
  ["Commandbar", ["help", "commands", "status", "version", "history", "clear", "output collapse", "output expand", "shortcuts"]],
  ["Feeds and Dreams", ["feed and a name", "feed switching", "show friends on", "calm feed", "announce new dreams", "read this dream"]],
  ["Screen reader and braille", ["verbosity", "read order", "speak timestamps", "speak emoji", "hashtags", "typing echo", "read aloud rate", "braille style", "braille emoji"]],
  ["Sounds and music", ["sound", "sound pack", "send sound", "earcon on swipe", "ducking", "music"]],
  ["Settings", ["settings", "set", "find setting and a word", "quiet hours", "mute word", "add content warning", "auto play media", "alt text reminder", "undo send", "draft autosave", "reading mode", "who can reply", "reset", "export settings"]],
];
/* Commands that need a word: the button opens Commandbar with the command typed in, ready for that word. */
const LC_CMD_FILL = { "feed and a name": "feed ", "find setting and a word": "find setting ", "set": "set ", "mute word": "mute word ", "add content warning": "add content warning ", "read aloud rate": "read aloud rate " };
/* Other ways to type a command, beyond the words in LC_EXACT. */
const LC_CMD_ALSO = {
  "help": ["?"], "status": ["health"], "open terminal": ["commandbar", "open commandbar"],
  "open cherry": ["opencherry"], "cherry history": ["Cherry: History", "cherrychats"], "cherry pinned chats": ["Cherry: Pinned chats", "pinnedchats", "fil > Cherry pinned"],
  "new cherry chat": ["Cherry: New chat", "newcherrychat"], "commands": ["open commands", "command list"],
};
function lcCommandAliases(cmd) {
  const n = lcNorm(cmd), id = LC_EXACT[n], out = (LC_CMD_ALSO[cmd] || []).slice();
  if (id) Object.keys(LC_EXACT).forEach(function (k) { if (LC_EXACT[k] === id && k !== n && out.indexOf(k) < 0) out.push(k); });
  return out.slice(0, 6);
}
/* The page's list: [{ title, items: [{ cmd, desc, also, fill }] }] built from LC_COMMANDS, so new commands appear here too. */
function lcCommandList() {
  const desc = {}; LC_COMMANDS.forEach(function (c) { if (!(c[0] in desc)) desc[c[0]] = c[1]; });
  const used = {};
  const mk = function (cmd) { used[cmd] = true; return { cmd: cmd, desc: desc[cmd], also: lcCommandAliases(cmd), fill: LC_CMD_FILL[cmd] || null }; };
  const groups = LC_CMD_GROUPS.map(function (g) { return { title: g[0], items: g[1].filter(function (c) { return c in desc; }).map(mk) }; });
  const rest = Object.keys(desc).filter(function (c) { return !used[c]; }).map(mk);
  if (rest.length) groups.push({ title: "More commands", items: rest });
  return groups.filter(function (g) { return g.items.length; });
}

function commandsView(p, act) {
  const groups = lcCommandList();
  const count = groups.reduce(function (n, g) { return n + g.items.length; }, 0);
  return h('div', { className: "pg lc-commands" },
    h('div', { className: "hdr" },
      h('div', { className: "hdr-row" },
        h('button', { type: "button", className: "bi", onClick: act.back, "aria-label": "Back" }, lcIconEl("Bck", { style: { width: 21, height: 21 } })),
        h('h1', { className: "hdr-title", tabIndex: -1 }, "Commands"),
        h('button', Object.assign({ type: "button", className: "lc-close", onClick: act.back }, lcCloseProps("Commands")), "Close"))),
    h('p', { className: "lc-desc", style: { padding: "12px 16px 0" } }, count + " commands. Press one to run it, the same as typing it in Commandbar (Control K or Command K). A command that needs a word, like a feed's name, opens Commandbar with the command typed in, so you can add the word."),
    h('p', { className: "lc-desc", style: { padding: "6px 16px 0" } }, "Capitals and spaces don't matter: opencherry works like open cherry. Path style works too: fil > Cherry pinned opens Cherry's Pinned chats."),
    groups.map(function (g, gi) {
      const hid = "lc-cmds-h-" + gi;
      return h('section', { key: g.title, className: "lc-cmds-group", "aria-labelledby": hid },
        h('h2', { id: hid, className: "lc-sub-h" }, g.title),
        h('ul', { className: "lc-cherry-list lc-cmds-list" },
          g.items.map(function (it) {
            return h('li', { key: it.cmd, className: "lc-cherry-item lc-cmds-item" },
              h('button', { type: "button", className: "btn bgb lc-btn lc-cmds-run", "data-cmd": it.cmd, onClick: function () { act.run(it); } }, it.cmd),
              h('p', { className: "lc-muted" }, it.fill ? it.desc + ". Opens Commandbar with \u201c" + it.fill.trim() + "\u201d typed in." : it.desc),
              it.also.length ? h('p', { className: "lc-muted" }, "Also: " + it.also.join(", ")) : null);
          })));
    }));
}

/* The Commands page. props: exec (Commandbar's own command runner), onBack. */
const CommandsPage = lcPlainScreen("CommandsPage", function (host, props) {
  let p = props, alive = true;
  const draw = function () { if (alive) lcPatch(host, commandsView(p, act)); };
  const act = {
    back: function () { if (p.onBack) p.onBack(); },
    // A command runs exactly as if typed: its result is said once in #looscid-live, and focus stays on the button
    // unless the command opens another page (then that page's heading gets focus, because you pressed it).
    run: function (it) {
      if (it.fill) { if (Looscid.LC_OPEN_CMD) Looscid.LC_OPEN_CMD(it.fill); return; }
      if (p.exec) p.exec(it.cmd, "page");
      draw();
    },
  };
  draw();
  setTimeout(function () { if (!alive) return; const hd = host.querySelector("h1"); if (hd && !host.contains(document.activeElement)) hd.focus(); }, 60);
  return { update: function (np) { p = np; draw(); }, stop: function () { alive = false; } };
});

Object.assign(Looscid, { CommandsPage, LC_CMD_GROUPS, LC_CMD_FILL, lcCommandList, lcCommandAliases });
})(window.Looscid = window.Looscid || {});
