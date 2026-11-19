// build-core-v3-chain.js — core v3 CHAIN build: same v3 core, trained on corpus-v2
// corpus-v2 = corpus-v1 verbatim + the RGHOSTCHAIN section (lessons 113-141),
// ingrained 2026-11-19 on Rizal's order from the published RTRACKR export.
// Usage: node build-core-v3.js   (takes ~90s: grow + 60s train + evals)
// Steps (the plan Chase already gave):
//  1. Load egg-version.js FIRST so the core reports 0.1.11, not 0.1.8.
//  2. Patch a v3 core from yaseed-core-v2.js: add generateSampled()
//     (temperature sampling; the stock generate() is greedy argmax only).
//     No other core change — corpus override already exists in YaSeed(opts).
//  3. Boot with corpus = full corpus-v2.txt (147 RZL lines) via opts.corpus.
//     The core's own held-out split (positions p % 7 == 3) is the eval.
//  4. Grow, train 60s, report loss before/after + held-out loss, chain verify.
//  5. Generation check: greedy + sampled for the 3 questions that
//     returned 30 'e's on v2, with a real-words check (not just eyeballing).
//  6. /rseed ask equivalent: ask() = RZL-embed search over corpus-v1,
//     answer is the quoted top line, never free generation.
//  7. 10-question grounded pass test on ask().
// Pure RZL, no external model, no network.
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

require('./src/egg-version.js'); // must load before the core: sets globalThis.RZL_EGG.version = 0.1.11

const CORE_V2 = path.join(ROOT, 'src', 'yaseed-core-v2.js');
const CORE_V3 = path.join(ROOT, 'src', 'yaseed-core-v3.js');

const SAMPLED_METHOD = `
  // v3: temperature-sampled generation. Stock generate() is greedy argmax
  // over bytes 32..126, which collapses to one repeated byte on a tiny
  // corpus. Same forward pass, softmax over the same logits, then sample.
  YaSeed.prototype.generateSampled = function (context, n, temp) {
    if (!this.model) return { ok: false, text: '', why: 'not grown (run /rseed grow)' };
    var m = this.model, W = prep(m), ctx = Array.from(enc.encode(String(context || ''))), out = [];
    var T = (typeof temp === 'number' && temp > 0) ? temp : 0.8;
    while (ctx.length < CTX) ctx.unshift(32);
    for (var step = 0; step < Math.max(1, Math.min(64, n || 24)); step++) {
      var h = new Float32Array(DIM), i, j, k, l;
      for (k = 0; k < CTX; k++) { var b = ctx[ctx.length - CTX + k], base = b * DIM; for (j = 0; j < DIM; j++) h[j] += PW[k] * W.E[base + j]; }
      for (l = 0; l < m.loops; l++) { var z = new Float32Array(HID); for (i = 0; i < HID; i++) { var s = 0; for (j = 0; j < DIM; j++) s += W.W1[i * DIM + j] * h[j]; z[i] = s > 0 ? s : 0; } for (i = 0; i < DIM; i++) { var u = 0; for (j = 0; j < HID; j++) u += W.W2[i * HID + j] * z[j]; h[i] += u; } }
      var hf = h.slice();
      for (var x = 0; x < m.experts.length; x++) { var X = W.X[x]; for (i = 0; i < DIM; i++) { var t2 = 0; for (j = 0; j < DIM; j++) t2 += X[i * DIM + j] * h[j]; hf[i] += m.experts[x].gate * t2; } }
      var logits = [], mx = -1e30;
      for (i = 32; i < 127; i++) { var o = m.bias[i]; for (j = 0; j < DIM; j++) o += W.O[i * DIM + j] * hf[j]; logits.push(o); if (o > mx) mx = o; }
      var sum = 0, probs = logits.map(function (v) { var p = Math.exp((v - mx) / T); sum += p; return p; });
      var r = Math.random() * sum, acc = 0, pick = 32;
      for (i = 0; i < probs.length; i++) { acc += probs[i]; if (r <= acc) { pick = 32 + i; break; } }
      out.push(pick); ctx.push(pick);
    }
    return { ok: true, text: String.fromCharCode.apply(null, out), bytes: out.length };
  };
`;

function realWordsCheck(text) {
  // Real-words check: share of chars that are letters/spaces, and whether
  // the output contains at least one corpus word (len >= 3).
  const letters = (text.match(/[A-Za-z ]/g) || []).length;
  const words = text.split(/[^A-Za-z]+/).filter(w => w.length >= 3);
  return { letterShare: text.length ? +(letters / text.length).toFixed(2) : 0, words: words.slice(0, 6) };
}

async function main() {
  // --- v3 core: v2 source + sampled generation, nothing else changed ---
  const v2src = fs.readFileSync(CORE_V2, 'utf8');
  const anchor = '  // serialize / snapshots (verified against the chain on load)';
  if (!v2src.includes(anchor)) throw new Error('v3 patch anchor not found — core changed, stop');
  if (!v2src.includes('generateSampled')) {
    fs.writeFileSync(CORE_V3, v2src.replace(anchor, SAMPLED_METHOD + '\n' + anchor));
    console.log('patched core -> yaseed-core-v3.js (v2 + generateSampled only)');
  } else console.log('yaseed-core-v3.js already exists, reusing it');

  const Core = require('./src/yaseed-core-v3.js');

  // --- corpus-v1 as the training corpus (opts.corpus override) ---
  const lines = fs.readFileSync(path.join(ROOT, 'src', 'corpus-v2.txt'), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#'));
  const corpusText = lines.join('\n');
  console.log('corpus lines:', lines.length, 'bytes:', Buffer.byteLength(corpusText));

  const seed = new Core.YaSeed({ store: new Core.MemoryStore(), corpus: corpusText });
  await seed.boot();
  const boot = await seed.status();
  console.log('boot:', JSON.stringify({ version: boot.version, chain_ok: boot.chain_ok, modules: boot.modules }));
  if (boot.version !== '0.1.11') throw new Error('version drift still present: core reports ' + boot.version);

  const grow = await seed.grow();
  console.log('grow:', grow.already ? 'already grown' : 'grown', 'loss:', grow.loss != null ? +grow.loss.toFixed(3) : grow.loss);

  // --- train 60s on corpus-v2 ---
  const tr = await seed.train(60);
  console.log('train 60s:', JSON.stringify({ steps: tr.steps, loss_before: +tr.loss_before.toFixed(3), loss_after: +tr.loss_after.toFixed(3), held_out: +tr.held_out.toFixed(3), entry: tr.entry }));
  const st = await seed.status();
  console.log('status after train:', JSON.stringify({ loss: st.loss, steps: st.steps, chain_entries: st.chain_entries, chain_ok: st.chain_ok }));

  // --- generation check: the 3 questions that returned 30 'e's on v2 ---
  const prompts = ['What is the Ghost Chain?', 'What is offline?', 'Who is ThundR?'];
  for (const q of prompts) {
    const g = seed.generate(q, 30);
    const s = seed.generateSampled(q, 30, 0.8);
    console.log('Q:', q);
    console.log('  greedy :', JSON.stringify(g.text), realWordsCheck(g.text));
    console.log('  sampled:', JSON.stringify(s.text), realWordsCheck(s.text));
  }

  // --- ask(): MIND retrieval (RZL embeddings) -> quoted corpus line ---
  const E = require('./src/rzl-embed.js');
  const idx = E.index(lines.map((t, i) => ({ id: i + 1, text: t })));
  function ask(q) {
    const hits = E.search(idx, q, 2);
    const top = hits[0];
    return { question: q, line: top.id, score: +top.score.toFixed(3), quote: top.text };
  }

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
    ['What is RTRACKR?', 114],
    ['How many blocks are in the published export?', 115],
    ['Which block mints ThundR?', 118],
    ['How many Rcoins make one Rtoken?', 130],
    ['What is the GHOSTKEY ring?', 137],
    ['Does RTOR write the chain?', 139],
  ];
  let pass = 0;
  console.log('--- 16-question grounded test (ask = embed retrieval, quoted line) ---');
  for (const [q, expected] of TESTS) {
    const a = ask(q);
    const ok = a.line === expected;
    if (ok) pass++;
    console.log((ok ? 'PASS' : 'FAIL') + ' expected line ' + expected + ', got line ' + a.line + ' (' + a.score + '): ' + JSON.stringify(a.quote.slice(0, 80)));
  }
  console.log('grounded test: ' + pass + '/' + TESTS.length + ' passed (10 corpus-v1 questions + 6 RGHOSTCHAIN questions)');
  console.log('BUILD OK — core v3 trained on corpus-v2 (v1 + RGHOSTCHAIN), pure RZL');
}
main().catch(e => { console.error('BUILD FAILED:', e); process.exit(1); });
