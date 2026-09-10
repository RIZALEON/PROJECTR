/*! ya-search-bots.js — green-web second public search (DuckDuckGo IA + HTML via jina)
 * Exposes window.yaPublicSearch(query) → { title, extract, extras, source } | null
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


  function searchStop() {
    return { the:1, a:1, an:1, is:1, are:1, do:1, you:1, what:1, how:1, can:1, to:1, of:1, and:1, or:1, in:1, on:1, it:1, i:1, me:1, my:1, we:1, that:1, this:1, for:1, please:1, with:1, from:1, about:1, search:1, online:1, look:1, keep:1, page:1, book:1, text:1, list:1, then:1, next:1, wave:1, after:1 };
  }

  function contentTerms(query) {
    var stop = searchStop();
    return String(query || "").toLowerCase().split(/\W+/).filter(function (w) {
      return w.length >= 3 && !stop[w];
    });
  }

  function isInfraJunk(title, body, url) {
    var hay = (String(title || "") + "\n" + String(body || "") + "\n" + String(url || "")).toLowerCase();
    if (/\bntfy\.sh\b/.test(hay)) return true;
    // Push-notification landing / infra — even without URL or explicit ntfy token
    if (/\bpush notifications?\b/.test(hay)) return true;
    if (/\bsend push notifications?\b/.test(hay)) return true;
    if (/\bntfy\b/.test(hay) && /\b(reconnect|interact)\b/.test(hay)) return true;
    if (/\bya-reconnect\b/.test(hay) || /\bya-rizalbot-p-\b/.test(hay)) return true;
    if (/\binteract (bind|channel|inbox)\b/.test(hay)) return true;
    try {
      if (url) {
        var u = new URL(String(url));
        var h = (u.hostname || "").replace(/^www\./, "").toLowerCase();
        if (h === "ntfy.sh" || h.endsWith(".ntfy.sh")) return true;
      }
    } catch (e) {}
    // Host-ish hay without a parseable URL
    if (/\bntfy\.sh\b/.test(hay) || /\bya-reconnect\b/.test(hay)) return true;
    return false;
  }

  function relevantToQuery(query, title, body) {
    if (isInfraJunk(title, body, "")) return false;
    var terms = contentTerms(query);
    if (!terms.length) return true;
    var hay = (String(title || "") + " " + String(body || "")).toLowerCase();
    if (!hay.trim()) return false;
    var hits = 0;
    for (var i = 0; i < terms.length; i++) {
      if (hay.indexOf(terms[i]) >= 0) hits++;
    }
    var strong = terms.filter(function (t) { return t.length >= 5; });
    for (var j = 0; j < strong.length; j++) {
      if (hay.indexOf(strong[j]) >= 0) return true;
    }
    if (hits >= 2) return true;
    if (terms.length === 1 && hits >= 1) return true;
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

  function rememberFact(title, extract) {
    if (typeof global.remember === "function") {
      try { global.remember(title + ": " + String(extract || "").slice(0, 500)); } catch (e) {}
    }
  }

  /** Parse jina-reader text of DDG HTML for first result titles/snippets. */
  function parseDdgHtmlText(text, term) {
    var raw = String(text || "");
    if (!raw || raw.length < 40) return null;
    var lines = raw.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var hits = [];
    var i;
    // Prefer markdown-ish links jina often emits: [Title](url)
    var mdRe = /\[([^\]]{4,120})\]\((https?:\/\/[^)]+)\)/g;
    var m;
    var seen = {};
    while ((m = mdRe.exec(raw)) && hits.length < 5) {
      var title = stripHtml(m[1]);
      if (!title || seen[title.toLowerCase()]) continue;
      if (/duckduckgo|javascript|privacy|settings|themes/i.test(title)) continue;
      seen[title.toLowerCase()] = true;
      hits.push({ title: title, snippet: "" });
    }
    // Fallback: lines that look like result titles near "http"
    if (!hits.length) {
      for (i = 0; i < lines.length && hits.length < 5; i++) {
        var line = lines[i];
        if (line.length < 8 || line.length > 140) continue;
        if (/^https?:\/\//i.test(line)) continue;
        if (/duckduckgo|instant answer|regions|safe search/i.test(line)) continue;
        if (/^[A-Z0-9 .,'&\-():]{8,120}$/i.test(line) || /\b(book|pattern|classification|machine learning|neural|statistical)\b/i.test(line)) {
          var t2 = stripHtml(line);
          if (t2 && !seen[t2.toLowerCase()]) {
            seen[t2.toLowerCase()] = true;
            var snip = "";
            if (i + 1 < lines.length && lines[i + 1].length > 20 && lines[i + 1].length < 280) {
              snip = stripHtml(lines[i + 1]);
            }
            hits.push({ title: t2, snippet: snip });
          }
        }
      }
    }
    // Attach nearby snippet lines for markdown hits
    for (i = 0; i < hits.length; i++) {
      if (hits[i].snippet) continue;
      var idx = raw.indexOf(hits[i].title);
      if (idx < 0) continue;
      var after = raw.slice(idx + hits[i].title.length, idx + hits[i].title.length + 400);
      var sn = after.replace(/https?:\/\/\S+/g, " ").replace(/\s+/g, " ").trim().slice(0, 220);
      if (sn.length >= 20) hits[i].snippet = sn;
    }
    if (!hits.length) return null;
    var extractParts = hits.map(function (h, n) {
      return (n + 1) + ". " + h.title + (h.snippet ? " — " + h.snippet : "");
    });
    var extract = extractParts.join("\n");
    var title = hits[0].title || term;
    var extras = hits.slice(0, 5).map(function (h) { return h.title; });
    return {
      title: title,
      extract: extract.slice(0, 900),
      extras: extras,
      source: "duckduckgo-html",
      hits: hits
    };
  }

  async function searchDdgHtml(term) {
    var urls = [
      "https://r.jina.ai/http://html.duckduckgo.com/html/?q=" + encodeURIComponent(term),
      "https://r.jina.ai/https://duckduckgo.com/html/?q=" + encodeURIComponent(term)
    ];
    for (var u = 0; u < urls.length; u++) {
      try {
        var res = await fetch(urls[u]);
        if (!res || !res.ok) continue;
        var text = await res.text();
        var parsed = parseDdgHtmlText(text, term);
        if (parsed && parsed.extract && parsed.extract.length >= 8) return parsed;
      } catch (e) {}
    }
    return null;
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

    // 1) DuckDuckGo Instant Answer JSON
    var url = "https://api.duckduckgo.com/?q=" + encodeURIComponent(term) +
      "&format=json&no_html=1&skip_disambig=1";
    var res;
    var data = null;
    try {
      res = await fetch(url);
      if (res && res.ok) data = await res.json();
    } catch (e) {
      data = null;
    }

    if (data && typeof data === "object") {
      var extract = stripHtml(data.AbstractText || "") ||
        stripHtml(data.Answer || "") ||
        firstRelatedText(data.RelatedTopics);
      var extras = extrasFromRelated(data.RelatedTopics);
      // Remember up to 5 related short facts
      if (Array.isArray(data.RelatedTopics)) {
        var remembered = 0;
        for (var i = 0; i < data.RelatedTopics.length && remembered < 5; i++) {
          var item = data.RelatedTopics[i];
          var texts = [];
          if (item && item.Text) texts.push(item.Text);
          if (item && Array.isArray(item.Topics)) {
            for (var j = 0; j < item.Topics.length && texts.length < 5; j++) {
              if (item.Topics[j] && item.Topics[j].Text) texts.push(item.Topics[j].Text);
            }
          }
          for (var k = 0; k < texts.length && remembered < 5; k++) {
            var fact = stripHtml(texts[k]);
            if (fact && fact.length >= 12) {
              rememberFact(fact.split(" - ")[0].slice(0, 80), fact);
              remembered++;
            }
          }
        }
      }
      if (extract && extract.length >= 8) {
        var title = stripHtml(data.Heading || "") || term;
        if (!nuclearish(title + " " + extract) && !junkish(title, extract) && !isInfraJunk(title, extract, "") && relevantToQuery(term, title, extract)) {
          rememberFact(title, extract);
          return {
            title: title,
            extract: extract.slice(0, 700),
            extras: extras,
            source: "duckduckgo"
          };
        }
      }
    }

    // 2) Empty Abstract → DDG HTML via jina reader (relevance-gated; never ntfy/infra)
    var htmlHit = await searchDdgHtml(term);
    if (!htmlHit) return null;
    if (nuclearish((htmlHit.title || "") + " " + (htmlHit.extract || ""))) return null;
    if (junkish(htmlHit.title, htmlHit.extract)) return null;
    if (isInfraJunk(htmlHit.title, htmlHit.extract, "")) return null;
    // Filter individual HTML hits for query overlap; drop infra hosts
    var keptHits = (htmlHit.hits || []).filter(function (h) {
      if (!h || !h.title) return false;
      if (isInfraJunk(h.title, h.snippet || "", "")) return false;
      return relevantToQuery(term, h.title, h.snippet || "");
    }).slice(0, 5);
    if (!keptHits.length) {
      // Whole-extract fallback only if relevant
      if (!relevantToQuery(term, htmlHit.title, htmlHit.extract)) return null;
      rememberFact(htmlHit.title, htmlHit.extract);
      return {
        title: htmlHit.title,
        extract: String(htmlHit.extract).slice(0, 900),
        extras: htmlHit.extras || [],
        source: "duckduckgo-html"
      };
    }
    keptHits.forEach(function (h) {
      rememberFact(h.title, h.snippet || h.title);
    });
    var extract2 = keptHits.map(function (h, n) {
      return (n + 1) + ". " + h.title + (h.snippet ? " — " + h.snippet : "");
    }).join("\n");
    return {
      title: keptHits[0].title,
      extract: extract2.slice(0, 900),
      extras: keptHits.map(function (h) { return h.title; }),
      source: "duckduckgo-html"
    };
  }

  global.yaPublicSearch = yaPublicSearch;
})(typeof window !== "undefined" ? window : globalThis);
