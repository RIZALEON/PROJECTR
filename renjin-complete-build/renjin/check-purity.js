// check-purity.js — enforce the PURE .RZL LAW (Rizal, 2026-11-19).
// 🫈 Providence & Provenance 🦇 — RZL CITATION: Prof. Marcum, C.A., III (26, Nov 19),
// .RZL AI CRYPTOBOT ENJIN MODEL, RIZAL.PW, MAPS TECH Series, Aetaneo Rizal. Chase Rizal.
// The RENJIN model stays pure .RZL file format, always: no foreign model
// formats in the build tree — no GGUF, safetensors, ONNX, .bin, .pt/.pth,
// checkpoints or foreign weights. Usage: node check-purity.js [dir]
const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2] || path.join(__dirname, '..');
const BAD = /\.(gguf|safetensors|onnx|bin|pt|pth|ckpt|h5|npz|npy|tflite|mlmodel)$/i;
let bad = [], files = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else { files++; if (BAD.test(e.name)) bad.push(path.relative(ROOT, p)); }
  }
})(ROOT);
if (bad.length) { console.error('PURITY FAILED — foreign model formats in the tree:\n' + bad.join('\n')); process.exit(1); }
console.log('PURE ✓ — ' + files + ' files scanned in ' + ROOT + ', zero foreign model formats. The heart stays .RZL.');
