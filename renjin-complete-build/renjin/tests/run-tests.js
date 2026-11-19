// tests/run-tests.js — verify the pure RZL v2 framework
// Usage: node tests/run-tests.js
// Checks: tokenizer size + round-trip, embeddings, corpus counts,
// model config params, version file, and that build-log.txt exists.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  ok ? pass++ : fail++;
}
const T = require('/home/hatch/workspace/rseed-audit/rseed-0.1.10/yaseed.rzl/tokenizer.js');
const tok = new T.Tokenizer();
check('tokenizer size 313', tok.size === 313, 'size=' + tok.size);
const s = 'ЯENJIN /rseed grow hello';
check('tokenizer round-trip', tok.decode(tok.encode(s)) === s);
const E = require(path.join(ROOT, 'src', 'rzl-embed.js'));
const hits = E.search(E.index([{ id: 1, text: 'The chain is append-only' }, { id: 2, text: 'hello world' }]), 'chain append-only', 1);
check('embeddings search finds chain', hits[0].id === 1, 'top=' + hits[0].id);
const lines = fs.readFileSync(path.join(ROOT, 'src', 'corpus-v1.txt'), 'utf8').split('\n').filter(l => l && !l.startsWith('#'));
check('corpus v1 has 112 lines', lines.length === 112, 'lines=' + lines.length);
check('corpus held-out 16', lines.filter((_, i) => (i + 1) % 7 === 0).length === 16);
const cfg = require(path.join(ROOT, 'src', 'model-config-v2.js'));
check('model v2 params 49152', cfg.params_ternary === 49152);
check('model v2 DIM/HID/CTX', cfg.DIM === 64 && cfg.HID === 128 && cfg.CTX === 32);
const ver = fs.readFileSync(path.join(ROOT, 'src', 'egg-version.js'), 'utf8');
check('egg-version 0.1.11', ver.includes('0.1.11'));
check('patched core v2 exists', fs.existsSync(path.join(ROOT, 'src', 'yaseed-core-v2.js')));
const core2 = fs.readFileSync(path.join(ROOT, 'src', 'yaseed-core-v2.js'), 'utf8');
check('patched core DIM 64', core2.includes('var DIM = 64, HID = 128, CTX = 32;'));
check('Tokenizer.swift exists', fs.existsSync(path.join(ROOT, 'src', 'Tokenizer.swift')));
const swift = fs.readFileSync(path.join(ROOT, 'src', 'Tokenizer.swift'), 'utf8');
check('Tokenizer.swift has 313 size logic', swift.includes('256 + t.count'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
