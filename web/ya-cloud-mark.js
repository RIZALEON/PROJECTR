/*! ya-cloud-mark.js — upside-down offline CSS/SVG cloud workmark under Speak-to-Rizalbot
 * States while busy: spin · think · rain · thunder (loading/thinking/searching/buffering)
 * No network assets. Dark Я aesthetic. Does not block send.
 */
(function () {
  "use strict";

  var ROOT_ID = "ya-cloud-mark";
  var state = "idle"; // idle | spin | think | rain | thunder
  var timer = 0;

  function ensureDom() {
    var el = document.getElementById(ROOT_ID);
    if (el) return el;
    var host = document.querySelector("form.composer") || document.body;
    el = document.createElement("div");
    el.id = ROOT_ID;
    el.className = "ya-cloud-mark idle";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<svg class="ya-cloud-svg" viewBox="0 0 64 40" width="56" height="36" focusable="false">' +
      '<g class="ya-cloud-flip">' +
      '<path class="ya-cloud-body" d="M16 24c-6 0-10-4-10-9s5-9 11-8c2-5 7-8 12-8 7 0 12 5 13 11 5 1 9 5 9 10 0 6-5 10-11 10H16z"/>' +
      '<g class="ya-cloud-rain">' +
      '<line x1="22" y1="4" x2="20" y2="12"/><line x1="32" y1="2" x2="30" y2="12"/><line x1="42" y1="4" x2="40" y2="12"/>' +
      "</g>" +
      '<g class="ya-cloud-bolt"><polyline points="34,8 28,18 33,18 27,28"/></g>' +
      "</g></svg>";
    // Sit just above the composer (bottom chrome) — upside-down cloud = flip via CSS
    if (host && host.parentNode) {
      host.parentNode.insertBefore(el, host);
    } else {
      document.body.appendChild(el);
    }
    return el;
  }

  function setState(next) {
    var el = ensureDom();
    state = next || "idle";
    el.className = "ya-cloud-mark " + state;
    el.hidden = state === "idle";
    el.setAttribute("data-state", state);
  }

  function show(mode) {
    clearTimeout(timer);
    var m = mode || "spin";
    if (m === "loading") m = "spin";
    if (m === "thinking") m = "think";
    if (m === "searching") m = "rain";
    if (m === "buffering") m = "thunder";
    if (["spin", "think", "rain", "thunder"].indexOf(m) < 0) m = "spin";
    setState(m);
  }

  function hide() {
    clearTimeout(timer);
    timer = setTimeout(function () { setState("idle"); }, 120);
  }

  function cycleBusy(kind) {
    // Map app busy contexts → animation
    if (kind === "search" || kind === "lookup") show("rain");
    else if (kind === "compass" || kind === "race") show("thunder");
    else if (kind === "llama" || kind === "ensure") show("think");
    else show("spin");
  }

  // Wrap showThink / hideThink without breaking callers
  function hookThink() {
    try {
      if (typeof window.showThink === "function" && !window.showThink.__yaCloud) {
        var origShow = window.showThink;
        var wrappedShow = function () {
          try { show("think"); } catch (e) {}
          return origShow.apply(this, arguments);
        };
        wrappedShow.__yaCloud = true;
        window.showThink = wrappedShow;
      }
      if (typeof window.hideThink === "function" && !window.hideThink.__yaCloud) {
        var origHide = window.hideThink;
        var wrappedHide = function () {
          try { hide(); } catch (e) {}
          return origHide.apply(this, arguments);
        };
        wrappedHide.__yaCloud = true;
        window.hideThink = wrappedHide;
      }
    } catch (e) {}
  }

  // Patch answer busy / ensureLlama / search / compass if present later
  function hookAnswer() {
    try {
      if (typeof window.answer === "function" && !window.answer.__yaCloud) {
        var orig = window.answer;
        var wrapped = async function () {
          try { cycleBusy("spin"); } catch (e) {}
          try {
            return await orig.apply(this, arguments);
          } finally {
            try { hide(); } catch (e2) {}
          }
        };
        wrapped.__yaCloud = true;
        window.answer = wrapped;
      }
    } catch (e) {}
    try {
      if (typeof window.ensureLlama === "function" && !window.ensureLlama.__yaCloud) {
        var el0 = window.ensureLlama;
        var wel = function () {
          try { cycleBusy("llama"); } catch (e) {}
          try { return el0.apply(this, arguments); }
          finally { try { hide(); } catch (e2) {} }
        };
        wel.__yaCloud = true;
        window.ensureLlama = wel;
      }
    } catch (e3) {}
    try {
      if (typeof window.lookUpAndKeep === "function" && !window.lookUpAndKeep.__yaCloud) {
        var lu = window.lookUpAndKeep;
        var wlu = async function () {
          try { cycleBusy("search"); } catch (e) {}
          try { return await lu.apply(this, arguments); }
          finally { try { hide(); } catch (e2) {} }
        };
        wlu.__yaCloud = true;
        window.lookUpAndKeep = wlu;
      }
    } catch (e4) {}
    try {
      if (typeof window.yaRunCompassRace === "function" && !window.yaRunCompassRace.__yaCloud) {
        var rc = window.yaRunCompassRace;
        var wrc = function () {
          try { cycleBusy("compass"); } catch (e) {}
          var p = rc.apply(this, arguments);
          if (p && typeof p.then === "function") {
            return p.then(function (v) { try { hide(); } catch (e) {} return v; },
              function (err) { try { hide(); } catch (e) {} throw err; });
          }
          try { hide(); } catch (e2) {}
          return p;
        };
        wrc.__yaCloud = true;
        window.yaRunCompassRace = wrc;
      }
    } catch (e5) {}
  }

  if (typeof window !== "undefined") {
    window.yaCloudShow = show;
    window.yaCloudHide = hide;
    window.yaCloudCycle = cycleBusy;
    window.yaCloudState = function () { return state; };
  }

  function boot() {
    ensureDom();
    setState("idle");
    hookThink();
    hookAnswer();
    // Re-hook after late script seats (compass / llama)
    setTimeout(hookThink, 400);
    setTimeout(hookAnswer, 500);
    setTimeout(hookAnswer, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  try {
    if (typeof console !== "undefined") console.log("[ya-cloud-mark] upside-down cloud · spin/think/rain/thunder");
  } catch (e) {}
})();
