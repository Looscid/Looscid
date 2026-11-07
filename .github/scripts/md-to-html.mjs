/* Nov 7 2026 (Carter: "Docs" in the Help Center, with Using Looscid and Building Looscid sections): turns the repo's own
   Markdown docs into plain HTML for build-help.mjs. No packages. Everything is written as text first (escaped), so
   nothing in a doc can add markup of its own. Handles what the docs use: headings, paragraphs, lists (nested, numbered,
   checklists), tables, code blocks, quotes, rules, `code`, **bold**, *italic*, links and bare https links.
   linkFor(href) turns a link in a doc into its address on the site (another doc's page, or the file on GitHub). */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const slugify = t => String(t).toLowerCase().replace(/<[^>]*>/g, "").replace(/[`*]/g, "").replace(/&[a-z]+;/g, "").replace(/[^\p{L}\p{N}_]+/gu, "-").replace(/^-+|-+$/g, "") || "part";
const plainText = s => String(s).replace(/`([^`]*)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

function inline(s, linkFor) {
  const parts = String(s).split(/(`[^`]+`)/);
  return parts.map(p => {
    if (/^`[^`]+`$/.test(p)) return "<code>" + esc(p.slice(1, -1)) + "</code>";
    let out = "", last = 0, m;
    const re = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|(https:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;
    while ((m = re.exec(p))) {
      out += emph(esc(p.slice(last, m.index)));
      if (m[3]) { const u = m[3]; out += '<a href="' + esc(u) + '"' + (/^https:\/\/looscid\.github\.io\//i.test(u) ? "" : ' target="_blank" rel="noopener noreferrer"') + ">" + esc(u.replace(/^https:\/\//, "")) + "</a>"; }
      else {
        const href = linkFor(m[2]), ext = /^https?:\/\//i.test(href) && !/^https:\/\/looscid\.github\.io\//i.test(href);
        // The link's words may hold `code`.
        const words = m[1].split(/(`[^`]+`)/).map(w => /^`[^`]+`$/.test(w) ? "<code>" + esc(w.slice(1, -1)) + "</code>" : emph(esc(w))).join("");
        out += '<a href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + words + "</a>";
      }
      last = re.lastIndex;
    }
    return out + emph(esc(p.slice(last)));
  }).join("");
}
const emph = h => h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<em>$2</em>");

export function mdToHtml(md, { linkFor = h => h, dropTitle = true } = {}) {
  const lines = String(md).replace(/\r\n?/g, "\n").split("\n");
  let title = "", out = [], i = 0;
  const ids = new Set();
  const uid = t => { let b = slugify(t), k = b, n = 2; while (ids.has(k)) k = b + "-" + n++; ids.add(k); return k; };
  const isBlank = l => !l.trim();
  const isList = l => /^\s*([-*+]|\d+[.)])\s+/.test(l);
  const startsBlock = l => /^\s{0,3}(#{1,6}\s|```|~~~|>|\|)/.test(l) || /^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(l) || isList(l) || /^\s*<details>|^\s*<\/details>|^\s*<summary>/i.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (isBlank(l)) { i++; continue; }
    let m;
    if ((m = /^\s{0,3}(```|~~~)\s*([\w+-]*)/.exec(l))) {
      const fence = m[1], buf = []; i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) buf.push(lines[i++]);
      i++;
      out.push("<pre><code>" + esc(buf.join("\n")) + "</code></pre>");
      continue;
    }
    if ((m = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(l))) {
      let lv = m[1].length; const text = m[2];
      if (lv === 1 && !title && dropTitle) { title = plainText(text); i++; continue; }
      if (lv === 1) lv = 2; // one h1 per page
      out.push("<h" + lv + ' id="' + uid(plainText(text)) + '">' + inline(text, linkFor) + "</h" + lv + ">");
      i++; continue;
    }
    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(l)) { out.push("<hr>"); i++; continue; }
    if (/^\s*<\/?(details|summary)>/i.test(l)) { // a GitHub fold: shown open, its summary as plain bold text
      const sm = /<summary>(.*?)<\/summary>/i.exec(l); if (sm) out.push("<p><strong>" + inline(sm[1], linkFor) + "</strong></p>");
      const rest = l.replace(/<\/?details>|<summary>.*?<\/summary>/gi, "").trim(); if (rest) out.push("<p>" + inline(rest, linkFor) + "</p>");
      i++; continue;
    }
    if (/^\s{0,3}>/.test(l)) {
      const buf = []; while (i < lines.length && /^\s{0,3}>/.test(lines[i])) buf.push(lines[i++].replace(/^\s{0,3}>\s?/, ""));
      out.push("<blockquote>" + mdToHtml(buf.join("\n"), { linkFor, dropTitle: false }).html + "</blockquote>");
      continue;
    }
    if (/^\s{0,3}\|/.test(l) && i + 1 < lines.length && /^\s{0,3}\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const cells = r => r.trim().replace(/^\|/, "").replace(/\|\s*$/, "").split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, "|"));
      const head = cells(l); i += 2; const rows = [];
      while (i < lines.length && /^\s{0,3}\|/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push('<div class="table"><table><thead><tr>' + head.map(c => '<th scope="col">' + inline(c, linkFor) + "</th>").join("") + "</tr></thead><tbody>" +
        rows.map(r => "<tr>" + head.map((_, k) => "<td>" + inline(r[k] || "", linkFor) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>");
      continue;
    }
    if (isList(l)) {
      // Gather the whole list (and anything indented under it), then build it by indentation.
      const buf = [];
      while (i < lines.length) {
        const x = lines[i];
        if (isBlank(x)) { let j = i + 1; while (j < lines.length && isBlank(lines[j])) j++; if (j < lines.length && (isList(lines[j]) || /^\s{2,}\S/.test(lines[j]))) { i = j; continue; } break; }
        if (isList(x) || /^\s+\S/.test(x) || (buf.length && !startsBlock(x))) { buf.push(x); i++; continue; }
        break;
      }
      out.push(list(buf, linkFor));
      continue;
    }
    const buf = [];
    while (i < lines.length && !isBlank(lines[i]) && !(buf.length && startsBlock(lines[i])) && !(startsBlock(lines[i]) && !buf.length)) buf.push(lines[i++].trim());
    if (!buf.length) { buf.push(lines[i++].trim()); }
    out.push("<p>" + buf.map(b => inline(b, linkFor)).join("\n") + "</p>");
  }
  return { title, html: out.join("\n") };
}

function list(buf, linkFor) {
  // Items: { indent, ordered, text[] }
  const items = [];
  for (const x of buf) {
    const m = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(x);
    if (m) items.push({ indent: m[1].replace(/\t/g, "    ").length, ordered: /\d/.test(m[2]), start: parseInt(m[2], 10), text: [m[3]] });
    else if (items.length) items[items.length - 1].text.push(x.trim());
  }
  let k = 0;
  function level(min) {
    const first = items[k], ordered = first.ordered, start = first.start;
    let h = ordered ? "<ol" + (start && start !== 1 ? ' start="' + start + '"' : "") + ">" : "<ul>";
    while (k < items.length && items[k].indent >= min) {
      const it = items[k++];
      let t = it.text.join(" "), lead = "";
      const c = /^\[( |x|X)\]\s+(.*)$/.exec(t);
      if (c) { lead = c[1] === " " ? "To do: " : "Done: "; t = c[2]; }
      h += "<li>" + lead + inline(t, linkFor);
      if (k < items.length && items[k].indent > it.indent) h += level(items[k].indent);
      h += "</li>";
    }
    return h + (ordered ? "</ol>" : "</ul>");
  }
  let html = "";
  while (k < items.length) html += level(items[k].indent);
  return html;
}
