/* Looscid completions.js: shared command and mention completion listbox. Plain script (not a module).
   Everything it shares goes on window.Looscid; see docs/dev/FILES.md for the load order. */
(function (Looscid) {
  "use strict";

  var instances = [];
  function text(value) { return String(value == null ? "" : value); }
  function announce(message) { if (typeof Looscid.announce === "function") Looscid.announce(message); }

  function mount(options) {
    options = options || {};
    var input = options.input;
    var host = options.host || (input && input.parentNode);
    var trigger = options.trigger || null;
    if (!input || !host) throw new Error("Looscid.CompletionListbox.mount needs an input and host.");
    var id = options.id || "lc-completion-" + (instances.length + 1);
    var list = document.createElement("div");
    list.id = id; list.className = "lc-completion-list"; list.setAttribute("role", "listbox");
    list.hidden = true;
    list.style.cssText = "position:absolute;z-index:1000;max-height:16rem;overflow:auto;min-width:12rem;padding:.25rem;border:1px solid CanvasText;border-radius:.5rem;background:Canvas;color:CanvasText;box-shadow:0 4px 16px #0003";
    host.appendChild(list);
    input.setAttribute("aria-controls", id); input.setAttribute("aria-autocomplete", "list"); input.setAttribute("aria-expanded", "false");
    if (!input.id) input.id = id + "-input";
    if (trigger) { trigger.setAttribute("aria-controls", id); trigger.setAttribute("aria-haspopup", "listbox"); trigger.setAttribute("aria-expanded", "false"); }
    var state = { source: "commands", items: [], filtered: [], active: -1, open: false, query: "", start: -1, end: -1, onSelect: options.onSelect || null };

    function label(item) { return text(typeof item === "string" ? item : item.label || item.name || item.value); }
    function value(item) { return text(typeof item === "string" ? item : item.value != null ? item.value : item.insert != null ? item.insert : item.label || item.name); }
    function setActive(index, shouldAnnounce) {
      var nodes = list.querySelectorAll('[role="option"]');
      if (!nodes.length) { state.active = -1; input.removeAttribute("aria-activedescendant"); return; }
      state.active = (index + nodes.length) % nodes.length;
      nodes.forEach(function (node, i) { node.setAttribute("aria-selected", i === state.active ? "true" : "false"); });
      var node = nodes[state.active]; input.setAttribute("aria-activedescendant", node.id); node.scrollIntoView({ block: "nearest" });
      if (shouldAnnounce) announce(label(state.filtered[state.active]) + ", " + (state.active + 1) + " of " + nodes.length + ".");
    }
    function close(silent) {
      if (!state.open) return;
      state.open = false; list.hidden = true; input.setAttribute("aria-expanded", "false");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant"); state.active = -1;
      if (!silent) announce("Completion list closed.");
    }
    function render(query) {
      state.query = text(query).toLowerCase();
      state.filtered = state.items.filter(function (item) { return !state.query || label(item).toLowerCase().indexOf(state.query) !== -1; });
      list.textContent = "";
      state.filtered.forEach(function (item, i) {
        var option = document.createElement("div"); option.id = id + "-option-" + i; option.setAttribute("role", "option"); option.setAttribute("aria-selected", "false");
        option.textContent = label(item); option.style.cssText = "padding:.45rem .65rem;border-radius:.3rem;cursor:pointer";
        option.addEventListener("mouseenter", function () { setActive(i, false); });
        option.addEventListener("mousedown", function (event) { event.preventDefault(); choose(i); });
        list.appendChild(option);
      });
      state.open = true; list.hidden = false; input.setAttribute("aria-expanded", "true");
      if (trigger) trigger.setAttribute("aria-expanded", "true");
      setActive(state.filtered.length ? 0 : -1, false);
      announce(state.filtered.length ? state.filtered.length + (state.source === "commands" ? " commands" : " people") + " available." : "I couldn't find a match.");
    }
    function open(source, query, range) {
      if (source) state.source = source;
      if (range) { state.start = range.start; state.end = range.end; }
      else { state.start = input.selectionStart == null ? input.value.length : input.selectionStart; state.end = state.start; }
      render(query || "");
    }
    function choose(index) {
      var item = state.filtered[index == null ? state.active : index]; if (!item) return;
      if (typeof state.onSelect === "function") state.onSelect(item, state.source, input);
      else {
        var start = state.start < 0 ? input.selectionStart : state.start, end = state.end < 0 ? input.selectionEnd : state.end;
        var insert = value(item), before = input.value.slice(0, start), after = input.value.slice(end);
        input.value = before + insert + after; var caret = before.length + insert.length;
        input.setSelectionRange(caret, caret); input.dispatchEvent(new Event("input", { bubbles: true })); input.focus();
      }
      close(true); announce("Added " + label(item) + ".");
    }
    function setSource(source, items) { state.source = source || "commands"; state.items = Array.isArray(items) ? items.slice() : []; if (state.open) render(state.query); }
    input.addEventListener("input", function () {
      var pos = input.selectionStart || 0, before = input.value.slice(0, pos), match = before.match(/(?:^|\s)([/@])([^\s]*)$/);
      if (match) {
        var triggerPos = pos - match[2].length - 1, source = match[1] === "/" ? "commands" : "people";
        state.source = source; state.start = triggerPos; state.end = pos; render(match[2]);
      } else if (state.open) close(true);
    });
    input.addEventListener("keydown", function (event) {
      if (!state.open) return;
      if (event.key === "ArrowDown" || event.key === "Tab" && !event.shiftKey) { event.preventDefault(); setActive(state.active + 1, true); }
      else if (event.key === "ArrowUp" || event.key === "Tab" && event.shiftKey) { event.preventDefault(); setActive(state.active - 1, true); }
      else if (event.key === "Enter" && state.active >= 0) { event.preventDefault(); choose(); }
      else if (event.key === "Escape") { event.preventDefault(); close(); }
    });
    if (trigger) trigger.addEventListener("click", function () { open("commands", ""); input.focus(); });
    var api = { mount: function () { return api; }, open: open, close: close, setSource: setSource, onSelect: function (fn) { state.onSelect = typeof fn === "function" ? fn : null; return api; }, element: list };
    instances.push(api); return api;
  }

  Looscid.CompletionListbox = { mount: mount, open: function (instance) { if (instance) instance.open.apply(null, Array.prototype.slice.call(arguments, 1)); }, close: function (instance) { if (instance) instance.close(); }, setSource: function (instance, source, items) { if (instance) instance.setSource(source, items); }, onSelect: function (instance, fn) { if (instance) instance.onSelect(fn); } };
})(window.Looscid = window.Looscid || {});
