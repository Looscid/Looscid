/* Looscid Help Center website (build 195). Plain script, no packages, nothing sent anywhere (the Mod log page only reads
   Looscid's public mod log from Looscid's server, Rem).
   - Go to menu in the top bar: a button with aria-expanded showing Help Home and Looscid Home (plain links).
   - Collapsible extras (Screen reader tips): a button with aria-expanded, never inside a heading.
   - Courses: Lesson 1, 2, 3 with a Next button. Progress is saved only on this device (localStorage, looscid_help_progress),
     the same key the app's Help Center uses, so both show the same progress.
   - Report a bug: a new GitHub issue with the build and device filled in, like Report a bug in the app.
   The pages themselves are made by .github/scripts/build-help.mjs from app/js/helpdata.js. */
(function () {
  "use strict";
  var KEY = "looscid_help_progress";
  var ROOT = document.documentElement.getAttribute("data-help-root") || "";
  var live = document.getElementById("looscid-live");
  function say(t) { if (!live) return; live.textContent = ""; setTimeout(function () { live.textContent = t; }, 60); }
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function done(course) { var o = load(); return Array.isArray(o[course]) ? o[course] : []; }
  function mark(course, id) { var o = load(), d = Array.isArray(o[course]) ? o[course] : []; if (d.indexOf(id) < 0) d.push(id); o[course] = d; save(o); }

  // Go to menu (Nov 7 2026, Carter: "a Go To menu pop up button. Go to Help Home or Looscid Home"). The page has the two
  // links in the top bar; here they go behind one real button with aria-expanded. Plain links in a list (not role=menu),
  // so VoiceOver swipes to them. Escape closes it and puts focus back on the button; a tap or click outside closes it.
  (function () {
    var b = document.querySelector("button.goto-btn"), list = document.getElementById("goto-list"); if (!b || !list) return;
    var wrap = b.parentNode;
    function isOpen() { return b.getAttribute("aria-expanded") === "true"; }
    function set(open) { b.setAttribute("aria-expanded", open ? "true" : "false"); list.hidden = !open; }
    set(false); wrap.classList.add("ready"); if (wrap.parentNode.classList) wrap.parentNode.classList.add("has-goto"); b.hidden = false;
    b.addEventListener("click", function () { set(!isOpen()); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen()) { e.preventDefault(); set(false); b.focus(); } });
    document.addEventListener("click", function (e) { if (isOpen() && !wrap.contains(e.target)) set(false); });
  })();

  // Collapsibles
  Array.prototype.forEach.call(document.querySelectorAll("button.more[aria-controls]"), function (b) {
    var t = document.getElementById(b.getAttribute("aria-controls")); if (!t) return;
    t.hidden = true;
    b.addEventListener("click", function () { var open = b.getAttribute("aria-expanded") === "true"; b.setAttribute("aria-expanded", open ? "false" : "true"); t.hidden = open; });
  });

  var COURSES = null;
  function withCourses(fn) {
    if (window.LC_HELP_COURSES) { fn(window.LC_HELP_COURSES); return; }
    var s = document.createElement("script"); s.src = ROOT + "courses.js";
    s.onload = function () { if (window.LC_HELP_COURSES) fn(window.LC_HELP_COURSES); };
    document.head.appendChild(s);
  }

  // Progress lines on the home and course pages
  function progressText(course, total) {
    var n = done(course).length; if (n > total) n = total;
    return n === 0 ? total + " lessons" : n >= total ? "All " + total + " lessons done" : n + " of " + total + " lessons done";
  }
  function paint() {
    Array.prototype.forEach.call(document.querySelectorAll(".progress[data-course]"), function (p) { p.textContent = progressText(p.getAttribute("data-course"), +p.getAttribute("data-total")); });
    var list = document.querySelector("ol.lessons[data-course]"); if (!list) return;
    var course = list.getAttribute("data-course"), d = done(course), items = list.querySelectorAll("li[data-lesson]"), firstOpen = -1;
    Array.prototype.forEach.call(items, function (li, i) {
      var isDone = d.indexOf(li.getAttribute("data-lesson")) >= 0, tag = li.querySelector(".done-tag");
      if (tag) tag.hidden = !isDone;
      if (!isDone && firstOpen < 0) firstOpen = i;
    });
    var go = document.getElementById("course-go");
    if (go && items.length) {
      if (firstOpen < 0) { go.textContent = "Course finished. Go over Lesson 1 again"; go.href = items[0].querySelector("a").getAttribute("href"); go.title = "Opens Lesson 1"; }
      else { go.textContent = (firstOpen === 0 && !d.length ? "Start" : "Continue with") + " Lesson " + (firstOpen + 1); go.href = items[firstOpen].querySelector("a").getAttribute("href");
        go.title = firstOpen === 0 && !d.length ? "Starts the course" : "Opens the next lesson you haven't done"; }
    }
  }
  paint();
  var reset = document.getElementById("course-reset");
  if (reset) reset.addEventListener("click", function () {
    var list = document.querySelector("ol.lessons[data-course]"); if (!list) return;
    var o = load(); delete o[list.getAttribute("data-course")]; save(o); paint(); say("Progress cleared. The course starts at Lesson 1 again.");
  });

  // An article opened from a course: which lesson it is, and Previous and Next.
  var m = /[?&]course=([a-z0-9-]+)/.exec(location.search);
  var bar = document.getElementById("course-bar");
  if (m && bar) withCourses(function (all) {
    var co = all[m[1]]; if (!co) return;
    var here = (location.pathname.replace(/\/+$/, "").split("/").pop() || "");
    var idx = -1; co.lessons.forEach(function (l, i) { if (l[0] === here) idx = i; });
    if (idx < 0) return;
    var q = "?course=" + m[1], n = co.lessons.length, nav = document.createElement("nav");
    bar.textContent = co.t + ": Lesson " + (idx + 1) + " of " + n; bar.hidden = false;
    nav.className = "course-nav"; nav.setAttribute("aria-label", co.t + " lessons");
    // Each link has a title hint (Carter, Nov 1 2026: hints on links), never the same words as the link.
    function link(text, href, cls, onClick, tip) { var a = document.createElement("a"); a.textContent = text; a.href = href; a.className = cls || ""; if (tip) a.title = tip; if (onClick) a.addEventListener("click", onClick); nav.appendChild(a); return a; }
    if (idx > 0) link("Previous lesson", "../" + co.lessons[idx - 1][0] + "/" + q, "btn ghost", null, "Opens the lesson before this one");
    if (idx < n - 1) link("Next: Lesson " + (idx + 2) + ", " + co.lessons[idx + 1][1], "../" + co.lessons[idx + 1][0] + "/" + q, "btn", function () { mark(m[1], here); }, "Marks this lesson done and opens the next one");
    else link("Finish the course", "../" + m[1] + "/", "btn", function () { mark(m[1], here); }, "Marks this lesson done and goes back to the course");
    link("All lessons", "../" + m[1] + "/", "plain", null, "Goes back to the course");
    var main = document.getElementById("main"); if (main) main.appendChild(nav);
  });

  // Report a bug: the same layout as Report a bug in the app (helpcenter.js, more.js lcBugReportUrl).
  var bug = document.getElementById("help-report-bug");
  if (bug) {
    var ua = navigator.userAgent || "unknown", ver = "";
    var make = function () {
      var body = ["**What happened?**", "", "", "**What did you expect to happen?**", "", "", "**How can I make it happen again?**", "1. ", "",
        "**Screen reader or braille display (if any):**", "", "", "---", ver || "Looscid (build not known, from the Help Center website)", "Device: " + ua, "Sent from the Help Center website"].join("\n");
      bug.href = "https://github.com/Looscid/Looscid/issues/new?labels=bug&title=" + encodeURIComponent("Bug: ") + "&body=" + encodeURIComponent(body);
    };
    make();
    try { fetch(ROOT + "../version.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) { if (j && j.label) { ver = j.label; make(); } }).catch(function () {}); } catch (e) {}
  }
})();

/* Nov 1 2026: the home page's search. Type to see matching articles right away; Search (or Enter) moves VoiceOver to the
   results. Reads search.js (made from helpdata.js); nothing is sent anywhere. ?q= in the address searches on load. */
(function () {
  "use strict";
  var form = document.getElementById("help-search"), q = document.getElementById("help-q");
  var box = document.getElementById("results"), list = document.getElementById("results-list"), n = document.getElementById("results-n");
  if (!form || !q || !box || !list || !n) return;
  var IDX = null, timer = null, last = "";
  function load(fn) {
    if (IDX) { fn(); return; }
    if (window.LC_HELP_INDEX) { IDX = window.LC_HELP_INDEX; fn(); return; }
    var s = document.createElement("script"); s.src = "search.js?v=hc2";
    s.onload = function () { IDX = window.LC_HELP_INDEX || []; fn(); };
    document.head.appendChild(s);
  }
  function norm(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
  function score(e, words) {
    var t = norm(e.t), s = norm(e.s), k = norm(e.k), c = norm(e.c), total = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i], p = 0;
      if (t.indexOf(w) >= 0) p += (" " + t).indexOf(" " + w) >= 0 ? 10 : 6;
      if (s.indexOf(w) >= 0) p += 3;
      if (c.indexOf(w) >= 0) p += 2;
      if (k.indexOf(w) >= 0) p += 1;
      if (!p) return 0;
      total += p;
    }
    return total;
  }
  function show(text, moveFocus) {
    var words = norm(text).split(" ").filter(function (w) { return w.length > 1 || /\d/.test(w); });
    if (!words.length) { box.hidden = true; list.textContent = ""; n.textContent = ""; last = ""; return; }
    load(function () {
      var hits = IDX.map(function (e) { return { e: e, p: score(e, words) }; }).filter(function (x) { return x.p > 0; })
        .sort(function (a, b) { return b.p - a.p; }).slice(0, 12);
      list.textContent = "";
      hits.forEach(function (h) {
        var li = document.createElement("li"), a = document.createElement("a"), p = document.createElement("p");
        a.href = h.e.u; a.textContent = h.e.t;
        a.title = h.e.c === "Topic" ? "Opens this topic" : h.e.c === "Course" ? "Opens this course" : h.e.c === "Contact" ? "Goes to Contact Us" : "Opens this article";
        p.textContent = (h.e.c ? h.e.c + ". " : "") + h.e.s;
        li.appendChild(a); li.appendChild(p); list.appendChild(li);
      });
      box.hidden = false;
      var msg = hits.length ? hits.length + (hits.length === 1 ? " article" : " articles") + " found for \u201c" + text.trim() + "\u201d." :
        "Nothing found for \u201c" + text.trim() + "\u201d. Try other words, or Contact Us below.";
      if (msg !== last) { n.textContent = msg; last = msg; }
      if (moveFocus) { var h2 = document.getElementById("h-results"); if (h2) h2.focus(); }
    });
  }
  q.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(function () { show(q.value, false); }, 350); });
  form.addEventListener("submit", function (e) { e.preventDefault(); clearTimeout(timer); show(q.value, true);
    try { var u = new URL(location.href); if (q.value.trim()) u.searchParams.set("q", q.value.trim()); else u.searchParams.delete("q"); history.replaceState(null, "", u); } catch (x) {} });
  q.addEventListener("keydown", function (e) { if (e.key === "Escape" && q.value) { e.preventDefault(); q.value = ""; show("", false); } });
  try { var start = new URL(location.href).searchParams.get("q"); if (start) { q.value = start; show(start, true); } } catch (x) {}
})();

/* Nov 8 2026 (Carter: removal reasons are public, with a public mod log that says moderator or admin): the Mod log
   article. Reads Rem's public log (GET /modlog, no key, nothing sent) and writes one line per removal, newest first,
   the same words as the app: "Nov 8, 2026: Dream 3fa2b1c9 was removed by a Looscid admin. Reason: Spam". */
(function () {
  "use strict";
  var list = document.getElementById("modlog-list"), status = document.getElementById("modlog-status");
  if (!list || !status || !window.fetch) return;
  var rem = list.getAttribute("data-rem") || "";
  status.textContent = "Loading the mod log\u2026";
  fetch(rem + "/modlog?limit=200&scope=all", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
    var items = j && j.ok && Array.isArray(j.items) ? j.items : null;
    if (!items) throw new Error("no log");
    list.textContent = "";
    items.forEach(function (it) {
      var id = String(it.dream_id || ""), when = "";
      try { when = it.at ? new Date(+it.at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""; } catch (x) {}
      var li = document.createElement("li");
      // Nov 8 2026: Circle mods' removals come too (scope=all); they name their Circle. A Circle Dream's ref can be the app's own id.
      var ref = /^[0-9a-f]{64}$/i.test(id) ? id.slice(0, 8) : id.slice(-8);
      li.textContent = (when ? when + ": " : "") + "Dream " + ref + " was removed by " + (it.by === "moderator" ? "a moderator" + (it.circle_name ? " of " + String(it.circle_name) : "") : "a Looscid admin") + ". Reason: " + String(it.reason || "");
      list.appendChild(li);
    });
    list.hidden = !items.length;
    status.textContent = items.length ? items.length + (items.length === 1 ? " removal." : " removals.") : "No Dreams have been removed. Nice.";
  }).catch(function () { status.textContent = "The mod log couldn't load right now. Try again later, or open it in the app: Help Center, Mod log."; });
})();
