/* growth.js — fetch growth/GROWTH-LEDGER.json and render a panel. */
(function (global) {
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "className") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function renderLedger(ledger, host) {
    host.innerHTML = "";
    host.appendChild(el("h2", { text: "GROWTH MONITOR" }));
    host.appendChild(el("p", { className: "growth-stamp", text: "Stamped: " + (ledger.stamp || "?") }));
    host.appendChild(el("p", { className: "growth-law", text: ledger.law || "Clay owns source; GitHub is a mirror." }));
    (ledger.trees || []).forEach(function (t) {
      var card = el("div", { className: "growth-card" });
      card.appendChild(el("h3", { text: t.key + (t.repo ? " (" + t.repo + ")" : "") }));
      card.appendChild(el("p", {
        text: "commits 7/14/30d: " +
          (t.commits_last_7_days || 0) + "/" +
          (t.commits_last_14_days || 0) + "/" +
          (t.commits_last_30_days || 0) +
          " · head " + String(t.head_sha || "—").slice(0, 7)
      }));
      (t.seeds || []).forEach(function (s) {
        card.appendChild(el("p", {
          className: "growth-seed",
          text: (s.folder || "?") + " ← " + (s.source_repo || "?") + " · " + (s.status || "?")
        }));
      });
      host.appendChild(card);
    });
  }

  function mount(selector, url) {
    var host = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!host) return Promise.reject(new Error("growth mount: host missing"));
    host.textContent = "Loading growth ledger…";
    return fetch(url || "growth/GROWTH-LEDGER.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (ledger) { renderLedger(ledger, host); return ledger; })
      .catch(function (err) {
        host.textContent = "GROWTH ledger unavailable: " + err.message;
      });
  }

  global.GrowthMonitor = { mount: mount, renderLedger: renderLedger };
})(typeof window !== "undefined" ? window : globalThis);
