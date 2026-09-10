/*! ya-search-bots.js — green-web second public search (DuckDuckGo Instant Answer)
 * Exposes window.yaPublicSearch(query) → { title, extract, extras, source:'duckduckgo' } | null
 * Wikipedia stays primary in app.js webSearch(); this runs after wiki miss/junk.
 * No paywall/cred bypass. Nuclear + junk filters on extract.
 */
(function (global) {
  "use strict";

  function stripHtml(s) {
    return String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  function nuclearish(text) {
    if (typeof global.nuclearBlocked === "function") {
      try { return !!global.nuclearBlocked(text); } catch (e) {}
    }
    var q = String(text || "").toLowerCase();
    return /nuclear (weapon|warhead|bomb|missile|enrichment|implosion)|build a (nuke|warhead)|how to make (a )?nuclear/.test(q);
  }

  function junkish(title, extract) {
    if (typeof global.wikiJunk === "function") {
      try { return !!global.wikiJunk(title, extract); } catch (e) {}
    }
    var t = String(title || "").trim();
    var x = String(extract || "");
    if (/^(why|dating|what time is it)\??$/i.test(t)) return true;
    if (/may refer to/i.test(t) || /may refer to/i.test(x)) return true;
    if (/\bdisambiguation\b/i.test(t) || /\bdisambiguation\b/i.test(x)) return true;
    return false;
  }

  function firstRelatedText(topics) {
    if (!Array.isArray(topics)) return "";
    for (var i = 0; i < topics.length; i++) {
      var item = topics[i];
      if (!item) continue;
      if (item.Text) return stripHtml(item.Text);
      if (Array.isArray(item.Topics)) {
        var nested = firstRelatedText(item.Topics);
        if (nested) return nested;
      }
    }
    return "";
  }

  function extrasFromRelated(topics) {
    var out = [];
    if (!Array.isArray(topics)) return out;
    for (var i = 0; i < topics.length && out.length < 5; i++) {
      var item = topics[i];
      if (!item) continue;
      if (item.Text) {
        var label = stripHtml(item.Text).split(" - ")[0].slice(0, 80);
        if (label) out.push(label);
      } else if (Array.isArray(item.Topics)) {
        for (var j = 0; j < item.Topics.length && out.length < 5; j++) {
          var t = item.Topics[j];
          if (t && t.Text) {
            var lab = stripHtml(t.Text).split(" - ")[0].slice(0, 80);
            if (lab) out.push(lab);
          }
        }
      }
    }
    return out;
  }

  async function yaPublicSearch(query) {
    var term = String(query || "").trim();
    if (!term) return null;
    if (typeof global.signal === "function") {
      try { if (!global.signal()) return null; } catch (e) {}
    } else if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return null;
    }
    if (nuclearish(term)) return null;
    var url = "https://api.duckduckgo.com/?q=" + encodeURIComponent(term) +
      "&format=json&no_html=1&skip_disambig=1";
    var res;
    try {
      res = await fetch(url);
    } catch (e) {
      return null;
    }
    if (!res || !res.ok) return null;
    var data;
    try {
      data = await res.json();
    } catch (e) {
      return null;
    }
    if (!data || typeof data !== "object") return null;
    var extract = stripHtml(data.AbstractText || "") ||
      stripHtml(data.Answer || "") ||
      firstRelatedText(data.RelatedTopics);
    if (!extract || extract.length < 8) return null;
    var title = stripHtml(data.Heading || "") || term;
    if (nuclearish(title + " " + extract)) return null;
    if (junkish(title, extract)) return null;
    var extras = extrasFromRelated(data.RelatedTopics);
    if (typeof global.remember === "function") {
      try { global.remember(title + ": " + extract.slice(0, 500)); } catch (e) {}
    }
    return {
      title: title,
      extract: extract.slice(0, 700),
      extras: extras,
      source: "duckduckgo"
    };
  }

  global.yaPublicSearch = yaPublicSearch;
})(typeof window !== "undefined" ? window : globalThis);
