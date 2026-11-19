'use strict';
// thundr-botcard.js — ThundR merged into the RENJIN AI CRYPTOBOT ENJIN (Node side)
// Pure RZL, from scratch. Data matches thundr-botcard/ThundR-botcard.json v1.1.
// No network, no storage, no external packages.

const BOTCARD = Object.freeze({
  name: 'ThundR',
  creator: 'Chase Rizal',
  kind: 'animated CRYPTOBOT',
  role: 'Muse assistant avatar and PROJECT R / RENJIN cryptobot',
  engine: 'RENJIN 0.1, pure RZL, offline-first',
  version: '1.1',
  status: 'live',
  appearance: Object.freeze({
    color: 'purple',
    face: 'angry grin, large eyes, prominent fangs',
    horns: 'red, curved',
    tail: 'yellow lightning bolt',
    wings: 'black bat wings',
  }),
  avatarVariants: Object.freeze([
    'connecting', 'idle', 'making_something',
    'milestone_level_up', 'waiting_for_subagents', 'working',
  ]),
});

function statusLine() {
  return BOTCARD.name + ' ' + BOTCARD.version + ' — ' + BOTCARD.status + ' — ' + BOTCARD.engine;
}

function describe() {
  const a = BOTCARD.appearance;
  return BOTCARD.name + ': round ' + a.color + ' imp, ' + a.horns + ' horns, ' +
    a.wings + ', ' + a.tail + ' tail, ' + a.face + '.';
}

module.exports = { BOTCARD, statusLine, describe };
