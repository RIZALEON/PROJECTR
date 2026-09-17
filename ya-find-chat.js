/*! ya-find-chat.js — offline find-in-chat (header 🔍)
 * Tap 🔍 → search current #log; highlight; ↓/↑ next/prev (wrap);
 * Esc / clear closes; empty query clears highlights. No cloud.
 */
(function () {
  "use strict";

  var MARK = "ya-find-hit";
  var CUR = "ya-find-current";
  var hits = [];
  var idx = -1;
  var query = "";
  var open = false;
  var reapplyTimer = 0;
  var observing = false;

  function $(id) {
    return document.getElementById(id);
  }

  function logRoot() {
    return $("log");
  }

  function setOpen(v) {
    open = !!v;
    var bar = $("find-bar");
    var btn = $("find-open");
    if (bar) {
      if (open) bar.removeAttribute("hidden");
      else bar.setAttribute("hidden", "");
    }
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      var inp = $("find-input");
      if (inp) {
        try { inp.focus(); inp.select(); } catch (e) {}
      }
      ensureObserver();
    } else {
      clearAll();
    }
  }

  function clearMarks(root) {
    if (!root) return;
    var marks = root.querySelectorAll("mark." + MARK);
    var i, m, parent;
    for (i = 0; i < marks.length; i++) {
      m = marks[i];
      parent = m.parentNode;
      if (!parent) continue;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      try { parent.normalize(); } catch (e) {}
    }
  }

  function clearAll() {
    hits = [];
    idx = -1;
    query = "";
    clearMarks(logRoot());
    updateCount();
    var inp = $("find-input");
    if (inp && !open) inp.value = "";
  }

  function updateCount() {
    var el = $("find-count");
    var prev = $("find-prev");
    var next = $("find-next");
    if (el) {
      if (!query) el.textContent = "";
      else if (!hits.length) el.textContent = "0";
      else el.textContent = (idx + 1) + "/" + hits.length;
    }
    var dis = !hits.length;
    if (prev) prev.disabled = dis;
    if (next) next.disabled = dis;
  }

  function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function collectTextNodes(root) {
    var out = [];
    if (!root) return out;
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n || !n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p || p.nodeName === "SCRIPT" || p.nodeName === "STYLE") return NodeFilter.FILTER_REJECT;
        if (p.nodeName === "MARK" && p.classList && p.classList.contains(MARK)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = tw.nextNode())) out.push(n);
    return out;
  }

  function highlightQuery(q) {
    var root = logRoot();
    clearMarks(root);
    hits = [];
    idx = -1;
    query = String(q || "");
    if (!root || !query) {
      updateCount();
      return;
    }
    // Skip empty-state placeholder
    if (root.querySelector(".empty") && !root.querySelector("article.msg")) {
      updateCount();
      return;
    }
    var re;
    try {
      re = new RegExp(escapeRegExp(query), "gi");
    } catch (e) {
      updateCount();
      return;
    }
    var nodes = collectTextNodes(root);
    var i, node, text, match, frag, last, m, mark, after;
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      if (!node.parentNode) continue;
      text = node.nodeValue;
      re.lastIndex = 0;
      if (!re.test(text)) continue;
      re.lastIndex = 0;
      frag = document.createDocumentFragment();
      last = 0;
      while ((match = re.exec(text))) {
        if (match.index > last) {
          frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        }
        mark = document.createElement("mark");
        mark.className = MARK;
        mark.textContent = match[0];
        frag.appendChild(mark);
        hits.push(mark);
        last = match.index + match[0].length;
        // Avoid zero-length infinite loops
        if (match[0].length === 0) re.lastIndex++;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    }
    if (hits.length) {
      idx = 0;
      focusHit(0);
    }
    updateCount();
  }

  function focusHit(i) {
    if (!hits.length) return;
    var n = hits.length;
    idx = ((i % n) + n) % n;
    var j;
    for (j = 0; j < hits.length; j++) {
      hits[j].classList.toggle(CUR, j === idx);
    }
    try {
      hits[idx].scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    } catch (e) {
      try { hits[idx].scrollIntoView(true); } catch (e2) {}
    }
    updateCount();
  }

  function next() { if (hits.length) focusHit(idx + 1); }
  function prev() { if (hits.length) focusHit(idx - 1); }

  function scheduleReapply() {
    if (!open || !query) return;
    if (reapplyTimer) clearTimeout(reapplyTimer);
    reapplyTimer = setTimeout(function () {
      reapplyTimer = 0;
      var inp = $("find-input");
      var q = inp ? inp.value : query;
      highlightQuery(q);
    }, 40);
  }

  function ensureObserver() {
    if (observing) return;
    var root = logRoot();
    if (!root || typeof MutationObserver !== "function") return;
    observing = true;
    var mo = new MutationObserver(function () {
      if (open && query) scheduleReapply();
    });
    mo.observe(root, { childList: true, subtree: false });
  }

  function onInput() {
    var inp = $("find-input");
    var q = inp ? String(inp.value || "") : "";
    if (!q) {
      query = "";
      clearMarks(logRoot());
      hits = [];
      idx = -1;
      updateCount();
      return;
    }
    highlightQuery(q);
  }

  function closeFind() {
    var inp = $("find-input");
    if (inp) inp.value = "";
    setOpen(false);
  }

  function wire() {
    var openBtn = $("find-open");
    var bar = $("find-bar");
    var inp = $("find-input");
    var prevBtn = $("find-prev");
    var nextBtn = $("find-next");
    var clearBtn = $("find-clear");
    if (!openBtn || !bar || !inp) return;

    openBtn.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (open) {
        // second tap focuses field
        try { inp.focus(); } catch (e) {}
      } else {
        setOpen(true);
      }
    });

    inp.addEventListener("input", onInput);
    inp.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        ev.preventDefault();
        closeFind();
        return;
      }
      if (ev.key === "Enter") {
        ev.preventDefault();
        if (ev.shiftKey) prev();
        else next();
      }
    });

    if (prevBtn) prevBtn.addEventListener("click", function (ev) { ev.preventDefault(); prev(); });
    if (nextBtn) nextBtn.addEventListener("click", function (ev) { ev.preventDefault(); next(); });
    if (clearBtn) clearBtn.addEventListener("click", function (ev) { ev.preventDefault(); closeFind(); });

    document.addEventListener("keydown", function (ev) {
      if (!open) return;
      if (ev.key === "Escape") {
        ev.preventDefault();
        closeFind();
      }
    }, true);

    try {
      window.yaFindChat = {
        open: function () { setOpen(true); },
        close: closeFind,
        query: function () { return query; },
        hits: function () { return hits.length; }
      };
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
