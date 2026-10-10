/* Looscid projects.js: Projects (Round 6.6). Alhasan's own projects, built into Looscid.
   Plain script (not a module), plain JavaScript (Looscid.lcEl and lcPatch). Everything it shares goes on window.Looscid;
   see FILES.md for the load order.
   - LC_PROJECTS: the list. An "app" opens its ported copy (projects/<id>/, or the Meme Projects copy in nexos/apps/) in a
     frame on the project page; an "info" project has nothing that runs in a browser yet, so its page says what it is and
     what is coming soon, in plain paragraphs. Nothing loads until you open a project.
   - ProjectPage: Back, the project's name, Close (aria-braillelabel "Close"), then the project.
   - The More menu's Projects section (core.js MainMenu) and the Commandbar words (projects, open <project>, lyrics <song>)
     read this list.
   - Dream Results: Meme Projects asks for the Dream composer ({nexos: "dream", text}); Looscid opens it with the text
     filled in and says "Dream composer filled." once. It never sends: you press Dream yourself. */
(function (Looscid) {
const { announce, lcCloseProps, lcCompose, lcNorm } = Looscid;
const { lcEl: h, lcPatch, lcPlainScreen, lcIconEl } = Looscid;

const GH = "https://github.com/2three1y/";
const LC_PROJECTS = [
  { id: "memeprojects", name: "Meme Projects", repo: "memeprojects", kind: "app", url: Looscid.NEXOS_BASE + "apps/memeprojects/",
    sub: "RU a Cheater and the Persona Evaluator, the unscientific chaos tools. After a result, Dream Results fills the Dream composer",
    words: ["meme projects", "memeprojects", "memes", "meme", "ru a cheater", "persona evaluator"] },
  { id: "lyricfinder", name: "Lyric Finder", repo: "lyricfinder", kind: "app", url: "projects/lyricfinder/",
    sub: "Find a song's lyrics by title and artist, from LRCLIB with lyrics.ovh as the backup. Also: lyrics and a song name in Commandbar",
    words: ["lyric finder", "lyricfinder", "lyrics finder", "lyrics"] },
  { id: "vibework", name: "Vibework", repo: "vibework", kind: "app", url: "projects/vibework/",
    sub: "A field guide to the social web: big platforms, small communities, federated networks and niche places",
    words: ["vibework", "vibe work"] },
  { id: "soundvault", name: "Soundvault", repo: "soundvault", kind: "app", url: "projects/soundvault/",
    sub: "A searchable catalog of Soundpacks and audio for screen reader users, linked from MG Storage",
    words: ["soundvault", "sound vault"] },
  { id: "reactortoolbar", name: "Reactor Toolbar", repo: "reactor-toolbar", kind: "app", url: "projects/reactor-toolbar/",
    sub: "The super-reaction concept: browse thousands of reactions and pick one",
    words: ["reactor toolbar", "reactortoolbar", "reactor-toolbar", "reactor"] },
  { id: "codetranslator", help: true, name: "Code Translator", repo: "codetranslator", kind: "app", url: "projects/codetranslator/", sandbox: true,
    sub: "Run JavaScript, HTML or SVG and read the output. Python is coming soon. Your code runs walled off from Looscid's data",
    words: ["code translator", "codetranslator", "code runner"] },
  { id: "chaoticmodel", help: true, name: "chaoticmodel", repo: "chaoticmodel", kind: "info",
    sub: "A chaotic little model with three voices: Static, Null and Seg. Coming soon",
    about: ["A language model with a real character, built to be fun first: it has opinions, it roasts you back, and it never sounds like a help desk. One model, three voices, Static, Null and Seg, and who answers depends on the vibe of your message, or you ask for one by name."],
    soon: ["Talking to chaoticmodel is coming soon. It needs the trained model running somewhere, and Looscid has no server of its own. When it can run on your device, it can come here, maybe as a voice for Cherry."],
    words: ["chaoticmodel", "chaotic model", "chaotic"] },
  { id: "yapper", help: true, lic: "Alhasan's own code", name: "Yapper", repo: "yapper-site", kind: "info",
    sub: "Yapper, the social app by MystyDev, and its website. Android download; more coming soon",
    about: ["Yapper is a social app made by MystyDev, a place to express yourself away from AI-generated, political and brainrot content. It's free. Right now it's on Android only, and it's not on the Google Play Store: you download it from its GitHub releases."],
    links: [["Download Yapper for Android (APK, from GitHub)", "https://github.com/MysteryNBS/mysty-social-public/releases/latest/download/Yapper.apk"]],
    soon: ["Yapper on iPhone and on the web is coming soon. The website itself is a Vite app, so Looscid shows its facts here instead of a copy of the page."],
    by: "The Yapper website, by Alhasan (2three1y) for Yapper. Yapper is made by MystyDev.",
    words: ["yapper", "yapper site", "yapperweb", "yapper-site"] },
  { id: "alexclassic", help: true, name: "Alex Classic", repo: "alexclassic", kind: "info",
    sub: "Bringing back Alex, the Mac OS X Leopard voice, as an offline voice engine. Coming soon",
    about: ["A preservation project for Alex, the voice that shipped with Mac OS X 10.5 Leopard. The plan: catalog its wavetables, study its formants, pitch, timing and breaths, and rebuild it as an offline voice engine that blind developers and listeners can inspect, so it can't change underneath you."],
    soon: ["There's no code to run yet: the repository is the plan. When the engine exists, Looscid could offer Alex for read aloud. Coming soon."],
    words: ["alex classic", "alexclassic", "alex"] },
  { id: "easyconvert", name: "Easyconvert", repo: "Easyconvert", kind: "app", url: "projects/easyconvert/",
    sub: "The newest Easyconvert: read your Claude export, and convert files to Word, PDF, HTML, Markdown, TXT, JSON or CSV. Nothing is uploaded",
    words: ["easyconvert latest", "latest easyconvert", "new easyconvert", "easyconvert", "easy convert", "claude export"] },
  { id: "myweb", help: true, lic: "Alhasan's own code", name: "MyWEB", repo: "MyWEB", kind: "app", url: "projects/myweb/",
    sub: "The privacy console: download a tunnel config and look up a domain over encrypted DNS. Nostr feedback is coming soon",
    words: ["myweb", "my web", "dns", "tunneling console"] },
  { id: "agentsync", help: true, lic: "Alhasan's own code", name: "Agentsync", repo: "Agentsync", kind: "info",
    sub: "A hub for local-first agent orchestration. Coming soon",
    about: ["Agentsync is a hub for running your own agents on your own machine: a messaging bus between them, a connector controller, memory, and a token vault that keeps keys encrypted on your device. No cloud in the middle."],
    soon: ["The hub runs next to your agents, and its page is a landing page for now, so there is nothing to run inside Looscid yet. Coming soon. Ideas from it may land in Cherry first."],
    words: ["agentsync", "agent sync", "agents"] },
];
LC_PROJECTS.forEach(function (p) { p.gh = GH + p.repo; });
// Round 6.6 (Alhasan, 5:02 PM): projects that are Coming soon, or partly, ask for help, with a real link to the repo.
const LC_LOOSCID_GH = "https://github.com/Looscid/Looscid";

const LC_PROJECTS_OPEN_KEY = "dbm_more_projects_open"; // the More menu's Projects section: "1" open, "0" closed (in the settings backup)
function lcProjectsOpen() { try { return localStorage.getItem(LC_PROJECTS_OPEN_KEY) === "1"; } catch (e) { return false; } }
function lcProjectsSetOpen(on) { try { localStorage.setItem(LC_PROJECTS_OPEN_KEY, on ? "1" : "0"); } catch (e) {} }
function lcFindProject(q) {
  const n = lcNorm(q || ""), sq = n.replace(/[^a-z0-9]/g, ""); if (!n) return null;
  return LC_PROJECTS.find(function (p) { return p.id === sq || lcNorm(p.name) === n || p.words.some(function (w) { return w === n || w.replace(/[^a-z0-9]/g, "") === sq; }); }) || null;
}
/* Open a project page. Focus goes to its heading, because you asked for it. */
function lcOpenProject(p, nav) { nav = nav || Looscid.LC_NAV; if (p && nav) nav("project", p); }

/* Commandbar: projects (More, Projects section open), open <project>, lyrics <song> [by <artist>].
   Called last in lcExtraIntent (core.js), so older words keep their meaning: open meme projects and open easyconvert
   still open the copies in Apps (Meme Projects there is the same app, with Dream Results too). */
function lcProjectIntent(raw) {
  const n = lcNorm(raw || ""); let m;
  if (/^(projects|my projects|open projects|show projects|project list|alhasan'?s projects|open my projects)$/.test(n))
    return { say: "Opened More, Projects: " + LC_PROJECTS.length + " projects.", fn: function () { if (Looscid.LC_OPEN_MENU) Looscid.LC_OPEN_MENU("projects", null); } };
  // Round 6.6 (Alhasan, 5:18 PM): soundvault switches to the Soundvault Soundpack (open soundvault opens the project).
  if (/^(soundvault|soundvault pack|soundvault soundpack|use soundvault|soundpack soundvault|sound pack soundvault)$/.test(n))
    return { say: "Soundpack: Soundvault. Its sounds load from Soundvault's catalog; anything it doesn't have plays Looscid's own.", fn: function () { Looscid.lcSet({ soundPack: "soundvault" }); } };
  const sq = n.replace(/[^a-z0-9]/g, "");
  const named = LC_PROJECTS.find(function (x) { return x.id === sq || lcNorm(x.name).replace(/[^a-z0-9]/g, "") === sq; });
  if (named) return { say: "Opened " + named.name + ".", fn: function () { lcOpenProject(named); } };
  // Terminal style, like Round 6.5.3's openfeed: openvibework, openlyricfinder.
  if ((m = /^(?:open|launch|start|run|go to|show) (?:the )?(?:project )?(.+)$/.exec(n)) || (m = /^project (.+)$/.exec(n)) || (m = /^open([a-z0-9].+)$/.exec(n))) {
    const p = lcFindProject(m[1]);
    if (p) return { say: "Opened " + p.name + ".", fn: function () { lcOpenProject(p); } };
  }
  if ((m = /^(?:lyrics|lyric|find lyrics|find the lyrics) (?:for |to |of )?(.+?)(?: by (.+))?$/.exec(n))) {
    const p = LC_PROJECTS.find(function (x) { return x.id === "lyricfinder"; }), song = m[1], artist = m[2] || "";
    const d = Object.assign({}, p, { url: p.url + "?q=" + encodeURIComponent(song) + (artist ? "&artist=" + encodeURIComponent(artist) : "") });
    return { say: "Opened Lyric Finder, searching for " + song + (artist ? " by " + artist : "") + ".", fn: function () { lcOpenProject(d); } };
  }
  return null;
}
/* The Commands page and help: one command per project, plus projects and lyrics. */
(function () {
  const C = Looscid.LC_COMMANDS; if (!C) return;
  C.push(["projects", "Alhasan's projects, in More: Meme Projects, Lyric Finder, Vibework, Soundvault and more"]);
  C.push(["open meme projects", "Meme Projects, a project (also in Apps): after a result, Dream Results fills the Dream composer"]);
  C.push(["soundvault", "switch to the Soundvault Soundpack (open soundvault opens the project)"]);
  C.push(["lyrics", "lyrics and a song, like lyrics imagine by john lennon: opens Lyric Finder and searches"]);
  LC_PROJECTS.forEach(function (p) { if (p.id !== "memeprojects" && p.id !== "easyconvert") C.push(["open " + lcNorm(p.name), p.name + ", a project: " + p.sub.split(". ")[0].toLowerCase()]); });
  C.push(["open easyconvert latest", "the newest Easyconvert, a project (open easyconvert opens the one in Apps)"]);
  // The Commands page (Round 6.5.3, js/commands.js): a Projects group, and lyrics opens Commandbar ready for the song.
  if (Looscid.LC_CMD_FILL) Looscid.LC_CMD_FILL["lyrics"] = "lyrics ";
  if (Looscid.LC_CMD_GROUPS) Looscid.LC_CMD_GROUPS.push(["Projects", ["projects", "open meme projects", "lyrics"].concat(LC_PROJECTS.filter(function (p) { return p.id !== "memeprojects" && p.id !== "easyconvert"; }).map(function (p) { return "open " + lcNorm(p.name); })).concat(["open easyconvert latest"])]);
})();
/* The project page. props: data (the project), onBack. */
function projectView(p, act) {
  const pr = p || LC_PROJECTS[0];
  const app = pr.kind === "app";
  return h('div', { className: "pg lc-project" + (app ? " lc-nx-frame" : ""), "data-project": pr.id },
    h('div', { className: "hdr" },
      h('div', { className: "hdr-row" },
        h('button', { type: "button", className: "bi", onClick: act.back, "aria-label": "Back" }, lcIconEl("Bck", { style: { width: 21, height: 21 } })),
        h('h1', { className: "hdr-title", tabIndex: -1 }, pr.name),
        h('button', Object.assign({ type: "button", className: "lc-close", onClick: act.back }, lcCloseProps(pr.name)), "Close"))),
    h('p', { className: "lc-desc", style: { padding: "12px 16px 0" } }, pr.sub + "."),
    app
      ? h('iframe', Object.assign({ id: "lc-project-frame", className: "lc-apps-frame", src: pr.url, title: pr.name + ", part of Looscid", allow: "autoplay; clipboard-write" },
          pr.sandbox ? { sandbox: "allow-scripts allow-modals" } : {}))
      : h('div', { style: { padding: "0 16px" } },
          h('h2', { className: "lc-sub-h" }, "About"),
          (pr.about || []).map(function (t, i) { return h('p', { key: "a" + i, className: "lc-desc" }, t); }),
          pr.links ? h('ul', { className: "lid-help" }, pr.links.map(function (l, i) { return h('li', { key: "l" + i }, h('a', { href: l[1], target: "_blank", rel: "noopener noreferrer" }, l[0])); })) : null,
          h('h2', { className: "lc-sub-h" }, "Coming soon"),
          (pr.soon || []).map(function (t, i) { return h('p', { key: "s" + i, className: "lc-desc" }, t); })),
    h('div', { style: { padding: "8px 16px 24px" } },
      pr.help ? [
        h('h2', { className: "lc-sub-h" }, "Help build it"),
        h('p', { className: "lc-desc" }, "Want to help build this? Contributions welcome."),
        h('p', { className: "lc-desc" }, h('a', { href: pr.gh, target: "_blank", rel: "noopener noreferrer", className: "lc-help-link" }, "Help build " + pr.name + " on GitHub"))] : null,
      h('h2', { className: "lc-sub-h" }, "Credits"),
      h('p', { className: "lc-desc" }, (pr.by || pr.name + ", by Alhasan (2three1y).") + " " + (pr.lic ? pr.lic + "." : "MIT License.") + " Full credits are in More, About, Credits and open source."),
      h('p', { className: "lc-desc" }, h('a', { href: pr.gh, target: "_blank", rel: "noopener noreferrer" }, pr.name + " on GitHub"))));
}
const ProjectPage = lcPlainScreen("ProjectPage", function (host, props) {
  let p = props, alive = true;
  const act = { back: function () { if (p.onBack) p.onBack(); } };
  const draw = function () { if (alive) lcPatch(host, projectView(p.data, act)); };
  // Escape inside a project (Looscid's bridge in the frame) goes Back, like the Apps.
  const onMsg = function (e) {
    const f = host.querySelector("#lc-project-frame");
    if (!f || e.source !== f.contentWindow || !e.data || e.origin !== location.origin) return;
    if (e.data.nexos === "back" || e.data.nexos === "escape") act.back();
    if (e.data.nexos === "hello" && Looscid.LC_NX_FRAMES) { try { Looscid.LC_NX_FRAMES.add(f.contentWindow); } catch (x) {} }
  };
  window.addEventListener("message", onMsg);
  draw();
  setTimeout(function () { if (!alive) return; const hd = host.querySelector("h1"); if (hd && !host.contains(document.activeElement)) hd.focus(); }, 60);
  return { update: function (np) { const same = np.data === p.data; p = np; if (!same) draw(); }, stop: function () { alive = false; window.removeEventListener("message", onMsg); } };
});

/* Dream Results: a project frame (same site) asks for the composer with its text. The composer opens with the text in it;
   nothing is sent. Said once in #looscid-live. */
window.addEventListener("message", function (e) {
  if (e.origin !== location.origin || !e.data || e.data.nexos !== "dream" || e.source === window) return;
  const fromFrame = Array.prototype.some.call(document.querySelectorAll("iframe"), function (f) { try { return f.contentWindow === e.source; } catch (x) { return false; } });
  if (!fromFrame) return;
  const t = String(e.data.text || "").trim().slice(0, 4000); if (!t) return;
  lcCompose({ mode: "new", text: t });
  window.__lcDreamResults = (window.__lcDreamResults || 0) + 1;
  setTimeout(function () { announce("Dream composer filled."); }, 250);
});

Object.assign(Looscid, { LC_PROJECTS, LC_LOOSCID_GH, LC_PROJECTS_OPEN_KEY, lcProjectsOpen, lcProjectsSetOpen, lcFindProject, lcOpenProject, lcProjectIntent, ProjectPage });
})(window.Looscid = window.Looscid || {});
