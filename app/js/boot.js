/* Looscid, js/boot.js: the first file the page loads (Security pass 5/6, moved out of inline scripts so the
   Content-Security-Policy can refuse inline script). Loaded right after the <base> is set, before React.
   - The error screen for an uncaught error.
   - The web fonts stylesheet switches on once the page is ready (it was an inline onload="" before).
   - Frame guard: when another website shows Looscid in a frame, the app doesn't start (js/mount.js checks
     LOOSCID_FRAMED) and this shows one plain message with a link that opens Looscid on its own. */
window.onerror = function(msg, src, line, col, err) {
  var d = document.createElement('div');
  d.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#1a0000;color:#ff6b6b;padding:24px;font-family:monospace;font-size:13px;z-index:999999;overflow:auto;word-break:break-word;white-space:pre-wrap;';
  d.innerHTML = '<b>Error:</b> ' + msg + '\nSource: ' + src + '\nLine: ' + line + ', Col: ' + col + (err ? '\n\n' + err.stack : '');
  document.body ? document.body.appendChild(d) : document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(d); });
  return false;
};
window.addEventListener('unhandledrejection', function(e) {
  window.onerror(String(e.reason), 'promise', 0, 0, e.reason instanceof Error ? e.reason : null);
});

document.addEventListener("DOMContentLoaded", function () {
  var f = document.getElementById("lc-fonts"); if (f) f.media = "all";
  if (!window.LOOSCID_FRAMED) return;
  var root = document.getElementById("root"); if (root) root.textContent = "";
  var box = document.createElement("main"); box.id = "lc-framed"; box.className = "lc-framed";
  var hd = document.createElement("h1"); hd.textContent = "Looscid opened inside another website";
  var tx = document.createElement("p"); tx.textContent = "To keep your account safe, Looscid only runs on its own page. Open it there to keep going.";
  var a = document.createElement("a"); a.href = location.href; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "Open Looscid on its own";
  box.appendChild(hd); box.appendChild(tx); box.appendChild(a);
  (root || document.body).appendChild(box);
});
