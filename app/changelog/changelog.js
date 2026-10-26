/* Looscid changelog page (#161, Round 7.24). Reads CHANGELOG.md (the site's copy, put there when the site is published;
   GitHub's copy if that's missing) and shows one version at a time. The version is picked with one menu (pop-up) button
   that lists every version from the first to the newest. #looscid-live is the only announcer; focus stays on the button. */
(function () {
  "use strict";
  var live = document.getElementById("looscid-live"), picker = document.getElementById("picker"), notes = document.getElementById("notes");
  function say(t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 60); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag); attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (k) { e.appendChild(typeof k === "string" ? document.createTextNode(k) : k); });
    return e;
  }
  // Inline Markdown, written as text and elements (never as HTML): `code`, **bold**, [text](link).
  function inline(s) {
    var out = [], re = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g, last = 0, m;
    while ((m = re.exec(s))) {
      if (m.index > last) out.push(s.slice(last, m.index));
      var t = m[0];
      if (t.charAt(0) === "`") out.push(el("code", {}, [t.slice(1, -1)]));
      else if (t.charAt(0) === "*") out.push(el("strong", {}, [t.slice(2, -2)]));
      else {
        var mm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t), href = mm[2];
        if (/^https:\/\//i.test(href)) out.push(el("a", { href: href, target: "_blank", rel: "noopener noreferrer" }, [mm[1] + " (opens in a new tab)"]));
        else out.push(mm[1]);
      }
      last = m.index + t.length;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  }
  function parse(md) {
    var vs = [], cur = null;
    md.split(/\r?\n/).forEach(function (line) {
      /* Round 7.43 (Carter: "Never abandon the old version text"): headings are build 191's heading with the codename in front
         and no Round ("Forget the round text"): "## Midnight Snack: Looscid 2026.135.56 (191)". Build 191's own shape ('## Looscid 2026.135.56 (191): Round 7.41
         "Midnight Snack"') and build 192's ("## Midnight Snack (Build 191, Round 7.41)") still read, in case an old copy is served. */
      var o = /^## (?:(.+?): )?Looscid (\S+) \((\d+)\)(?::\s*(.*))?$/.exec(line), h = !o && /^## (.+?) \(Build (\d+)(?:, ([^)]+))?\)\s*$/.exec(line);
      if (h) { cur = { codename: h[1], version: "", build: +h[2], round: h[3] || "", blocks: [] }; vs.push(cur); return; }
      if (o) { var rr = o[4] || "", cn = o[1] || "", q = /\s*"([^"]*)"\s*$/.exec(rr); if (q) { cn = cn || q[1]; rr = rr.slice(0, q.index); }
        cur = { codename: cn, version: o[2], build: +o[3], round: rr, blocks: [] }; vs.push(cur); return; }
      if (!cur) return;
      if (/^#{1,2} /.test(line)) { cur = null; return; }
      if (/^\s*[-*] /.test(line)) { var b = cur.blocks[cur.blocks.length - 1]; if (!b || b.kind !== "ul") { b = { kind: "ul", items: [] }; cur.blocks.push(b); } b.items.push(line.replace(/^\s*[-*] /, "")); return; }
      if (/^\s+\S/.test(line)) { var lb = cur.blocks[cur.blocks.length - 1]; if (lb && lb.kind === "ul") { lb.items[lb.items.length - 1] += " " + line.trim(); return; } }
      var vl = /^Version (\S+), released /.exec(line); if (vl && !cur.version) cur.version = vl[1];
      if (line.trim()) { var pb = cur.blocks[cur.blocks.length - 1]; if (pb && pb.kind === "p" && !pb.done) pb.text += " " + line.trim(); else cur.blocks.push({ kind: "p", text: line.trim() }); }
      else { var e2 = cur.blocks[cur.blocks.length - 1]; if (e2) e2.done = true; }
    });
    return vs.sort(function (a, b) { return a.build - b.build; }); // first to newest
  }
  // The same shape as the app (lcCodenamed): the codename, a colon, then build 191's exact text, "Looscid 2026.135.56 (191)". No Round.
  function name(v) { var old = v.version ? "Looscid " + v.version + " (" + v.build + ")" : "Build " + v.build; return v.codename ? v.codename + ": " + old : old; }
  function show(vs, i) {
    var v = vs[i]; notes.textContent = "";
    notes.appendChild(el("h2", { id: "ver-h" }, [name(v) + (i === vs.length - 1 ? ", the newest" : "")]));
    v.blocks.forEach(function (b, k) {
      if (b.kind === "p") notes.appendChild(el("p", { "class": k === 0 && /^(Version \S+, r|R)eleased /.test(b.text) ? "when" : null }, inline(b.text)));
      else notes.appendChild(el("ul", {}, b.items.map(function (t) { return el("li", {}, inline(t)); })));
    });
    try { history.replaceState(null, "", "#" + v.build); } catch (e) {}
  }
  function build(vs) {
    var at = vs.length - 1, want = +(location.hash || "").slice(1);
    vs.forEach(function (v, i) { if (v.build === want) at = i; });
    picker.textContent = "";
    var wrap = el("div", { "class": "mb" }), open = false;
    var btn = el("button", { type: "button", id: "ver-btn", "class": "mb-btn", "aria-haspopup": "menu", "aria-expanded": "false" });
    var list = null;
    function label() { btn.textContent = "Version: " + name(vs[at]); }
    function items() { return list ? Array.prototype.slice.call(list.querySelectorAll("[role^=menuitem]")) : []; }
    function close(focusBtn) { if (list) { list.remove(); list = null; } open = false; btn.setAttribute("aria-expanded", "false"); btn.removeAttribute("aria-controls"); if (focusBtn) btn.focus(); }
    function pick(i) { at = i; label(); close(true); show(vs, at); say("Showing " + name(vs[at]) + "."); }
    function openMenu(focusAt) {
      list = el("ul", { id: "ver-menu", role: "menu", "class": "mb-list", "aria-label": "Versions", tabindex: "-1" });
      vs.forEach(function (v, i) {
        var li = el("li", { role: "menuitemradio", "class": "mb-item", "aria-checked": i === at ? "true" : "false", tabindex: "-1", id: "ver-" + v.build },
          [el("span", { "class": "mb-check", "aria-hidden": "true" }, [i === at ? "\u2713" : ""]), el("span", {}, [name(v)])]);
        li.addEventListener("click", function () { pick(i); });
        list.appendChild(li);
      });
      var cl = el("li", { role: "menuitem", "class": "mb-item", tabindex: "-1", "aria-label": "Close Versions" }, ["Close"]);
      cl.addEventListener("click", function () { close(true); });
      list.appendChild(cl);
      list.addEventListener("keydown", function (e) {
        var l = items(), i = l.indexOf(document.activeElement), n = -1;
        if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); close(true); return; }
        if (e.key === "ArrowDown") n = i < 0 ? 0 : (i + 1) % l.length; else if (e.key === "ArrowUp") n = i < 0 ? l.length - 1 : (i - 1 + l.length) % l.length;
        else if (e.key === "Home") n = 0; else if (e.key === "End") n = l.length - 1;
        else if ((e.key === "Enter" || e.key === " ") && i >= 0) { e.preventDefault(); l[i].click(); return; }
        if (n >= 0) { e.preventDefault(); l[n].focus(); }
      });
      wrap.appendChild(list); open = true; btn.setAttribute("aria-expanded", "true"); btn.setAttribute("aria-controls", "ver-menu");
      if (focusAt == null) list.focus(); else { var l2 = items(); (l2[focusAt] || l2[0]).focus(); }
      var cur = document.getElementById("ver-" + vs[at].build); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
    }
    btn.addEventListener("click", function () { if (open) close(true); else openMenu(null); });
    btn.addEventListener("keydown", function (e) { if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); openMenu(at); } });
    document.addEventListener("click", function (e) { if (open && !wrap.contains(e.target)) close(false); });
    label(); wrap.appendChild(btn); picker.appendChild(wrap);
    picker.appendChild(el("p", { "class": "sub", style: "margin-top:8px" }, [vs.length + " versions listed, from " + name(vs[0]) + " to " + name(vs[vs.length - 1]) + "."]));
    show(vs, at);
  }
  function get(url) { return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }); }
  get("../CHANGELOG.md").catch(function () { return get("https://raw.githubusercontent.com/Looscid/Looscid/main/CHANGELOG.md"); })
    .then(function (md) { var vs = parse(md); if (!vs.length) throw new Error("empty"); build(vs); })
    .catch(function () { picker.textContent = ""; picker.appendChild(el("p", {}, ["The changelog couldn't load. Check your connection, or read it on GitHub with the link above."])); });
})();
