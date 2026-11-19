// model-config-v2.js — pure RZL scaled founding model, v2
// v1 (ЯSEED 0.1.7): DIM 16, HID 32, CTX 6, loops 1, ~9,216 ternary weights
// v2 (this build): DIM 64, HID 128, CTX 32, loops 2
// Params: emb 256x64=16,384 + w1 128x64=8,192 + w2 64x128=8,192 + out 256x64=16,384 = 49,152 ternary weights + 256 biases + per-row scales
// Still ternary, still SeedGenerator-grown, still deterministic, still pure RZL.
// No external weights, no transformer, no other AI company's model.
// Apply with build-model-v2.js, which patches a copy of yaseed-core.js
// (replacing only the DIM/HID/CTX line) and then grows + trains it.
module.exports = {
  version: 'rzl-model.v2',
  base: 'yaseed-core.js (ЯSEED 0.1.7, DIM 16 HID 32 CTX 6)',
  DIM: 64, HID: 128, CTX: 32, LOOPS: 2,
  sparsity: { emb: 0.5, w1: 0.6, w2: 0.6, out: 0.5 },
  scale: { emb: 0.5, w1: 0.35, w2: 0.25, out: 0.15 },
  train: { lrLat: 0.012, lrScale: 0.01, batch: 16, sliceMs: 12, seconds: 5 },
  params_ternary: 49152,
  corpus: 'corpus-v1.txt (112 RZL lines, held-out every 7th line)'
};
