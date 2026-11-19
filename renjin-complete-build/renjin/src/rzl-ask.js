/* rzl-ask.js · MIND v2 retrieval for /rseed ask — pure RZL, v3.1
 * No external model, no outside vectors, no other AI company's code.
 * Ask answers by QUOTING the best corpus line, never by free generation:
 * the byte model still cannot generate real words (v3: greedy = spaces,
 * sampled = gibberish), so retrieval-first is the honest askable path.
 *
 * Scoring (verified 2026-11-19 on the 10-question grounded test):
 *   score = 0.3 * embed-cosine (rzl-embed.js, normalised) +
 *           0.7 * BM25 (normalised)
 * Embed-only scored 4/10, BM25-only 5/10, combined 7/10, and BM25 with
 * stopwords + light stemming + number-word normalisation scores 8/10
 * (combined with embeddings: also 8/10, and more robust to paraphrase).
 * BM25 details: stopwords removed ("what/is/the/does/by/..."), light
 * stemming (recalls -> recall, weights -> weight), number words mapped
 * to digits ("zero" -> "0", so "rule zero" finds "rule 0").
 *
 * Two questions still fail and why (honest, not hidden):
 *  - "What is the order of the loop?" -> line 79, expected 20. The word
 *    "order" appears in NEITHER line; line 20 lists the loop order without
 *    saying "order". Fix is corpus growth: add a line that states the loop
 *    order using the word "order".
 *  - "What is the held-out set?" -> line 103, expected 102. Both lines are
 *    about the held-out set; 102 defines it, 103 is about its loss. The
 *    question gives no word that separates definition from loss.
 * Pure JS, no deps, no network, runs in Node and in WKWebView.
 */
(function (root, factory) {
  var m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m; else root.RzlAsk = m;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';
  var STOP = {};
  'what is are was were the a an does do did by and of to in on it its this that with for as from be been who whom whose when where how why can could should would'.split(' ').forEach(function (w) { STOP[w] = true; });
  var NUM = { zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10' };
  var EMBED_W = 0.3, BM25_W = 0.7;
  // Below this combined score the top hit is not trusted: the corpus has
  // no line about the question (e.g. "Who is ThundR?" — ThundR is not in
  // corpus-v1, best hit scored 0.3). Answer "Unknown" instead of quoting
  // a wrong line. Corpus law: "Unknown is an honest answer and never a guess."
  // All 8 passing answers in the 10-question test scored >= 0.886.
  var UNKNOWN_BELOW = 0.5;

  function stem(w) {
    if (w.length > 4 && w.slice(-3) === 'ing') w = w.slice(0, -3);
    else if (w.length > 3 && w.slice(-2) === 'ed') w = w.slice(0, -2);
    if (w.length > 3 && w.slice(-1) === 's' && w.slice(-2) !== 'ss') w = w.slice(0, -1);
    return w;
  }
  function tokens(text) {
    return String(text || '').toLowerCase().split(/[^a-z0-9я\-]+/).filter(Boolean)
      .map(function (w) { return NUM[w] || w; })
      .filter(function (w) { return !STOP[w]; })
      .map(stem).filter(Boolean);
  }
  function index(chunks, embed) {
    // chunks: [{id, text}] -> {chunks, df, avgdl, embedIdx}
    var docs = chunks.map(function (c) { return tokens(c.text); });
    var df = {}, i, j;
    docs.forEach(function (d) {
      var seen = {};
      d.forEach(function (w) { if (!seen[w]) { seen[w] = true; df[w] = (df[w] || 0) + 1; } });
    });
    var avgdl = docs.reduce(function (a, d) { return a + d.length; }, 0) / Math.max(1, docs.length);
    return {
      chunks: chunks, docs: docs, df: df, avgdl: avgdl, N: docs.length,
      embedIdx: embed ? embed.index(chunks) : null
    };
  }
  function bm25(idx, query) {
    var qs = tokens(query), N = idx.N, out = [], i;
    for (i = 0; i < N; i++) {
      var d = idx.docs[i], s = 0, dl = d.length;
      qs.forEach(function (w) {
        var f = 0, k;
        for (k = 0; k < d.length; k++) if (d[k] === w) f++;
        if (!f) return;
        var idf = Math.log(1 + (N - (idx.df[w] || 0) + 0.5) / ((idx.df[w] || 0) + 0.5));
        s += idf * (f * 2.2) / (f + 1.2 * (1 - 0.75 + 0.75 * dl / idx.avgdl));
      });
      out.push(s);
    }
    var mx = Math.max.apply(null, out.concat([1e-9]));
    return out.map(function (s) { return s / mx; });
  }
  function ask(idx, embed, query, k) {
    var b = bm25(idx, query);
    var e = null, emx = 1e-9, i;
    if (idx.embedIdx && embed) {
      var qv = embed.embed(query);
      e = idx.embedIdx.map(function (c) { return embed.cosine(qv, c.vec); });
      emx = Math.max.apply(null, e.concat([1e-9]));
    }
    var scored = idx.chunks.map(function (c, ci) {
      var s = BM25_W * b[ci] + (e ? EMBED_W * (e[ci] / emx) : 0);
      return { id: c.id, text: c.text, score: +s.toFixed(3), bm25: +b[ci].toFixed(3), embed: e ? +(e[ci] / emx).toFixed(3) : null };
    });
    scored.sort(function (a, b2) { return b2.score - a.score; });
    return scored.slice(0, k || 3);
  }
  function answer(idx, embed, query) {
    // The /rseed ask answer: quoted top line, or Unknown when nothing in
    // the corpus is close enough. Never free generation, never a guess.
    var top = ask(idx, embed, query, 1)[0];
    if (!top || top.score < UNKNOWN_BELOW) return { known: false, question: query, line: null, score: top ? top.score : 0, quote: 'Unknown.' };
    return { known: true, question: query, line: top.id, score: top.score, quote: top.text };
  }
  return { VERSION: 'rzl-ask.v3.1', EMBED_W: EMBED_W, BM25_W: BM25_W, UNKNOWN_BELOW: UNKNOWN_BELOW, tokens: tokens, index: index, bm25: bm25, ask: ask, answer: answer };
});
