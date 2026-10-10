/* Easyconvert, standalone (part of NexOS, ported into Looscid).
   The same converter as NexOS Web's Easyconvert window (script.js), with its own page so Looscid can open it directly.
   Files are read with the File API and never uploaded. JSZip (for DOCX and ZIP) is the local copy next to this file, loaded on first use. */
(function () {
"use strict";
const $id = (sel) => document.querySelector(sel);
const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
// Short NexOS-style tones, made only after you press something (browsers block sound before that).
let ac = null;
function gesture() { try { if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ac = new AC(); } if (ac && ac.state === "suspended") ac.resume(); } catch (e) {} }
function tone(notes, type, vol) {
  if (!ac) return;
  try {
    let t = ac.currentTime;
    notes.forEach((m) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "square"; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || 0.05, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.1); t += 0.07;
    });
  } catch (e) {}
}
const TONES = { page: [[72, 79], "triangle"], back: [[79, 72], "triangle"], confirm: [[76, 84], "sine"], files: [[67, 74], "square"], fill: [[72, 76], "triangle"], nav: [[74], "sine"], run: [[67, 74, 79], "square"] };
function play(k) { const x = TONES[k]; if (x) tone(x[0], x[1]); }
const SFX = { error: () => tone([60, 55], "square", 0.06), update: () => tone([72, 76, 79, 84], "triangle") };
if (window.parent === window) { const top = document.getElementById("ec-top"); if (top) top.hidden = false; }
window.EC = (() => {
  const ecIn = $id("#ec-input"), ecFmt = $id("#ec-format"), ecList = $id("#ec-list"), ecStatus = $id("#ec-status");
  let files = [], results = [], format = "txt", zipLoading = null;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function say(t) { ecStatus.textContent = ""; setTimeout(() => { ecStatus.textContent = t; }, 40); }
  function zip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    return zipLoading || (zipLoading = new Promise((ok, no) => { const s = document.createElement("script"); s.src = "jszip.min.js"; s.onload = () => ok(window.JSZip); s.onerror = () => { zipLoading = null; no(Error("the ZIP helper didn't load")); }; document.head.appendChild(s); }));
  }
  function save(n, d, t) { const a = document.createElement("a"), u = URL.createObjectURL(d instanceof Blob ? d : new Blob([d], { type: t })); a.href = u; a.download = n; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1e3); }
  async function docx(text) {
    const JSZip = await zip(), z = new JSZip(), body = text.split(/\r?\n/).map((x) => '<w:p><w:r><w:t xml:space="preserve">' + esc(x) + "</w:t></w:r></w:p>").join("");
    const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body + "<w:sectPr/></w:body></w:document>";
    if (!body || !xml.includes("<w:t")) throw Error("DOCX text generation failed");
    z.file("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
    z.file("_rels/.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    z.file("word/_rels/document.xml.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>');
    z.file("word/document.xml", xml);
    return z.generateAsync({ type: "blob" });
  }
  async function convert(f) {
    const raw = await f.text();
    if (format === "docx") return { data: await docx(raw), type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", preview: raw };
    return { data: format === "json" ? JSON.stringify({ filename: f.name, content: raw }, null, 2) : raw, type: "text/plain", preview: raw };
  }
  const outName = (f) => f.name.replace(/\.[^.]+$/, "") + "." + (format === "docx" ? "docx" : format === "json" ? "json" : "txt");
  function render() {
    if (!files.length) { ecList.replaceChildren(Object.assign(document.createElement("p"), { textContent: "No files selected." })); return; }
    const ul = document.createElement("ul"); ul.className = "ec-files";
    files.forEach((f, i) => {
      const li = document.createElement("li"), b = document.createElement("button"), c = document.createElement("button"), d = document.createElement("button"), p = document.createElement("pre");
      const pid = "ec-pre-" + i;
      b.type = c.type = d.type = "button"; b.className = "ec-name"; b.textContent = f.name;
      b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", pid);
      b.onclick = () => { gesture(); p.hidden = !p.hidden; b.setAttribute("aria-expanded", String(!p.hidden)); play(p.hidden ? "back" : "page"); };
      c.innerHTML = 'Copy<span class="sr-only"> ' + esc(f.name) + "</span>";
      c.onclick = () => { gesture(); play("confirm"); const t = results[i] ? results[i].preview : ""; const done = () => say(t ? "Copied " + f.name + "." : "Convert first, then copy."); try { navigator.clipboard.writeText(t).then(done, () => say("Copy didn't work in this browser.")); } catch (e) { say("Copy didn't work in this browser."); } };
      d.innerHTML = 'Download<span class="sr-only"> ' + esc(f.name) + "</span>";
      d.onclick = () => { gesture(); const x = results[i]; if (!x) { SFX.error(); say("Convert first, then download."); return; } play("files"); save(outName(f), x.data, x.type); say("Downloading " + outName(f) + "."); };
      p.id = pid; p.hidden = true; p.tabIndex = 0; p.setAttribute("aria-label", "Preview of " + f.name); p.textContent = results[i] ? results[i].preview : "Not converted yet.";
      const row = document.createElement("div"); row.className = "ec-actions"; row.append(b, c, d);
      li.append(row, p); ul.appendChild(li);
    });
    ecList.replaceChildren(ul);
  }
  ecIn.addEventListener("change", (e) => { gesture(); files.push(...e.target.files); play("fill"); render(); say(plural(files.length, "file") + " selected."); });
  ecFmt.addEventListener("change", () => play("nav"));
  $id("#ec-convert").addEventListener("click", async () => {
    gesture(); format = ecFmt.value; results = [];
    if (!files.length) { SFX.error(); say("Choose one or more files first."); return; }
    play("run");
    try { for (const f of files) results.push(await convert(f)); render(); SFX.update(); say("Conversion complete as " + format.toUpperCase()); }
    catch (e) { SFX.error(); say("Conversion failed: " + e.message); }
  });
  $id("#ec-download-all").addEventListener("click", async () => {
    gesture();
    if (!results.length) { SFX.error(); say("Convert first, then download."); return; }
    try { const JSZip = await zip(), z = new JSZip(); results.forEach((x, i) => z.file(files[i].name.replace(/\.[^.]+$/, "") + "." + format, x.data)); play("files"); save("Easyconvert-converted-files.zip", await z.generateAsync({ type: "blob" }), "application/zip"); say("Downloading Easyconvert-converted-files.zip."); }
    catch (e) { SFX.error(); say("Download failed: " + e.message); }
  });
  render();
  return { clear() { files = []; results = []; ecIn.value = ""; render(); say("Files cleared."); }, open() {}, get state() { return { files: files.length, results: results.length, format }; }, outputs: () => results.map((r, i) => ({ name: files[i] && outName(files[i]), type: r.type })) };
})();


document.getElementById("ec-clear").addEventListener("click", () => { gesture(); window.EC.clear(); play("back"); });
})();
