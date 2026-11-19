// build-ask-v3.js — v3.1: MIND v2 retrieval (rzl-ask.js) + 10-question test
// Usage: node build-ask-v3.js   (fast: no retraining, retrieval only)
// Ask answers by quoting the best corpus line, never by free generation.
// Same 10 questions + expected lines as build-core-v3.js, so the scores
// compare directly: embed-only ask() scored 4/10 there.
// Pure RZL, no external model, no network.
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const E = require('./src/rzl-embed.js');
const Ask = require('./src/rzl-ask.js');

const lines = fs.readFileSync(path.join(ROOT, 'src', 'corpus-v1.txt'), 'utf8')
  .split('\n').filter(l => l && !l.startsWith('#'));
const chunks = lines.map((t, i) => ({ id: i + 1, text: t }));
const idx = Ask.index(chunks, E);
console.log('rzl-ask', Ask.VERSION, 'corpus lines:', lines.length, 'weights: embed', Ask.EMBED_W, '+ BM25', Ask.BM25_W);

const TESTS = [
  ['What is rule zero?', 1],
  ['What does function zero track?', 2],
  ['Is the transcript erased or rewritten?', 3],
  ['What values can ternary weights take?', 9],
  ['What is the order of the loop?', 20],
  ['What does Mind recall by?', 24],
  ['What signs the chain and never leaves the device?', 33],
  ['What is R Token?', 38],
  ['What is the held-out set?', 102],
  ['What comes before live trading?', 95],
];
let pass = 0;
console.log('--- 10-question grounded test (ask = BM25 + RZL embeddings, quoted line) ---');
for (const [q, expected] of TESTS) {
  const a = Ask.ask(idx, E, q, 1)[0];
  const ok = a.id === expected;
  if (ok) pass++;
  console.log((ok ? 'PASS' : 'FAIL') + ' expected line ' + expected + ', got line ' + a.id + ' (score ' + a.score + ', bm25 ' + a.bm25 + ', embed ' + a.embed + '): ' + JSON.stringify(a.text.slice(0, 80)));
}
console.log('10-question test: ' + pass + '/10 passed (was 4/10 with embed-only ask in v3)');
console.log('BUILD OK — rzl-ask v3.1 retrieval, pure RZL');
fs.writeFileSync(path.join(ROOT, 'build-log-ask-v3.txt'),
  'rzl-ask v3.1 — ' + new Date().toISOString() + '\n' +
  '10-question grounded test: ' + pass + '/10 passed (embed-only v3: 4/10)\n' +
  'weights: embed 0.3 + BM25 0.7; BM25 stopwords + light stemming + number-word normalisation\n');
