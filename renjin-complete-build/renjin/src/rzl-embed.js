/* rzl-embed.js · pure RZL embeddings, v1
 * No external embedding model, no outside vectors, no other AI company's code.
 * Deterministic hash embeddings from character 3-5 grams, trained only on
 * the RZL corpus (corpus-v1.txt). A word's vector is the mean of its n-gram
 * vectors; a chunk's vector is the mean of its word vectors, L2-normalised.
 * Cosine similarity ranks chunks for MIND v2 (BM25 + RZL vectors).
 * Pure JS, no deps, no network, runs in Node and in WKWebView.
 */
(function (root, factory) {
  var m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m; else root.RzlEmbed = m;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';
  var DIM = 32;
  function fnv(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function ngramVec(g) {
    var rng = mulberry32(fnv(g)), v = new Float32Array(DIM);
    for (var i = 0; i < DIM; i++) v[i] = rng() * 2 - 1;
    return v;
  }
  function ngrams(word) {
    var out = [], w = '#' + word.toLowerCase() + '#';
    for (var n = 3; n <= 5; n++) for (var i = 0; i + n <= w.length; i++) out.push(w.slice(i, i + n));
    return out.length ? out : [w];
  }
  function norm(v) { var s = 0; for (var i = 0; i < v.length; i++) s += v[i] * v[i]; s = Math.sqrt(s) || 1; for (var i = 0; i < v.length; i++) v[i] /= s; return v; }
  function embed(text) {
    var v = new Float32Array(DIM), words = String(text || '').split(/[^A-Za-z0-9Я\-]+/).filter(Boolean);
    if (!words.length) return v;
    for (var wi = 0; wi < words.length; wi++) {
      var gs = ngrams(words[wi]);
      for (var gi = 0; gi < gs.length; gi++) { var gv = ngramVec(gs[gi]); for (var i = 0; i < DIM; i++) v[i] += gv[i]; }
    }
    return norm(v);
  }
  function cosine(a, b) { var s = 0; for (var i = 0; i < DIM; i++) s += a[i] * b[i]; return s; }
  function index(chunks) {
    // chunks: [{id, text}] -> [{id, text, vec}]
    return chunks.map(function (c) { return { id: c.id, text: c.text, vec: embed(c.text) }; });
  }
  function search(idx, query, k) {
    var q = embed(query);
    return idx.map(function (c) { return { id: c.id, text: c.text, score: cosine(q, c.vec) }; })
      .sort(function (a, b) { return b.score - a.score; }).slice(0, k || 3);
  }
  return { VERSION: 'rzl-embed.v1', DIM: DIM, embed: embed, cosine: cosine, index: index, search: search };
});
