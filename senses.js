/* Function 2 senses — make offline. Spine-seated: SVG, Web Audio, SFX, MIDI.
   Voice ONNX is a part slot until a runtime is eaten. Not published. */
(function (w) {
  const UTAH = "America/Denver";
  const CLAY = "#141412";
  const CREAM = "#e8dcc8";

  function audioCtx() {
    if (!w._yaAudio) {
      const Ctx = w.AudioContext || w.webkitAudioContext;
      if (!Ctx) return null;
      w._yaAudio = new Ctx();
    }
    if (w._yaAudio.state === "suspended") w._yaAudio.resume();
    return w._yaAudio;
  }

  function svgSpecFromTalk(text) {
    const q = String(text || "").toLowerCase();
    const letter = /я|ya|mark|icon|tile/.test(q);
    const circle = /circle|dot|sun/.test(q);
    const square = /square|tile|icon/.test(q) || letter;
    return {
      kind: "svg",
      w: 512,
      h: 512,
      bg: CLAY,
      letter: letter ? "Я" : "",
      circle: circle,
      square: square,
      title: letter ? "mark" : circle ? "circle" : "form"
    };
  }

  function makeSvg(spec) {
    spec = spec || {};
    const wdt = spec.w || 512;
    const hgt = spec.h || 512;
    const bg = spec.bg || CLAY;
    const fg = spec.fg || CREAM;
    let inner = "";
    if (spec.circle) {
      inner += '<circle cx="' + wdt / 2 + '" cy="' + hgt / 2 + '" r="' + Math.min(wdt, hgt) * 0.28 + '" fill="none" stroke="' + fg + '" stroke-width="10"/>';
    }
    if (spec.letter) {
      inner += '<text x="50%" y="56%" text-anchor="middle" font-family="Georgia,serif" font-size="' + Math.round(wdt * 0.42) + '" fill="' + fg + '">' + String(spec.letter).slice(0, 2) + "</text>";
    }
    if (!inner) {
      inner = '<rect x="96" y="96" width="320" height="320" rx="36" fill="none" stroke="' + fg + '" stroke-width="8"/>';
    }
    const svg = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + wdt + " " + hgt + '" width="' + wdt + '" height="' + hgt + '"><rect width="100%" height="100%" rx="72" fill="' + bg + '"/>' + inner + "</svg>";
    const name = "ya-" + (spec.title || "form") + ".svg";
    return { name: name, svg: svg, mime: "image/svg+xml" };
  }

  function tone(freq, dur, type, gain, when) {
    const ctx = audioCtx();
    if (!ctx) return;
    const t0 = (when != null ? when : ctx.currentTime);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain == null ? 0.12 : gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function playSfx(kind) {
    const k = String(kind || "blip").toLowerCase();
    if (k === "thump" || k === "kick") {
      tone(80, 0.22, "sine", 0.28);
      tone(120, 0.12, "triangle", 0.1);
      return "thump";
    }
    if (k === "hat" || k === "hh") {
      tone(8000, 0.05, "square", 0.04);
      return "hat";
    }
    if (k === "coin" || k === "ding") {
      tone(988, 0.12, "square", 0.08);
      tone(1318, 0.18, "square", 0.06);
      return "coin";
    }
    if (k === "buzz") {
      tone(110, 0.35, "sawtooth", 0.08);
      return "buzz";
    }
    tone(660, 0.09, "square", 0.08);
    return "blip";
  }

  function playBeat() {
    const ctx = audioCtx();
    if (!ctx) return "no audio";
    const t = ctx.currentTime + 0.05;
    const step = 0.22;
    for (let i = 0; i < 8; i++) {
      const at = t + i * step;
      tone(80, 0.16, "sine", 0.26, at);
      if (i % 2 === 1) tone(7000, 0.04, "square", 0.035, at);
    }
    return "beat";
  }

  function midiVarLen(n) {
    const bytes = [];
    let v = n >>> 0;
    bytes.unshift(v & 0x7f);
    v >>= 7;
    while (v > 0) {
      bytes.unshift((v & 0x7f) | 0x80);
      v >>= 7;
    }
    return bytes;
  }

  function makeMidi(notes) {
    notes = notes || [
      { n: 60, t: 0, d: 240 },
      { n: 64, t: 240, d: 240 },
      { n: 67, t: 480, d: 480 }
    ];
    const events = [];
    notes.forEach(function (nt) {
      events.push({ t: nt.t, on: true, n: nt.n });
      events.push({ t: nt.t + nt.d, on: false, n: nt.n });
    });
    events.sort(function (a, b) { return a.t - b.t; });
    const track = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
    let last = 0;
    events.forEach(function (ev) {
      const dt = Math.max(0, ev.t - last);
      last = ev.t;
      track.push.apply(track, midiVarLen(dt));
      if (ev.on) track.push(0x90, ev.n & 127, 0x60);
      else track.push(0x80, ev.n & 127, 0x00);
    });
    track.push(0x00, 0xff, 0x2f, 0x00);
    const head = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0, 96];
    const th = [0x4d, 0x54, 0x72, 0x6b, (track.length >> 24) & 255, (track.length >> 16) & 255, (track.length >> 8) & 255, track.length & 255];
    const bytes = new Uint8Array(head.concat(th, track));
    notes.forEach(function (nt, i) {
      const f = 440 * Math.pow(2, (nt.n - 69) / 12);
      tone(f, Math.max(0.08, nt.d / 480), "triangle", 0.1, (audioCtx() ? audioCtx().currentTime : 0) + nt.t / 480);
    });
    return { name: "ya-phrase.mid", bytes: bytes, mime: "audio/midi" };
  }

  function recordWav(seconds) {
    const ctx = audioCtx();
    if (!ctx || !ctx.createMediaStreamDestination) return null;
    const dest = ctx.createMediaStreamDestination();
    return dest;
  }

  function sfxFromTalk(text) {
    const q = String(text || "").toLowerCase();
    if (/thump|kick|drum/.test(q)) return "thump";
    if (/hat|hi-?hat/.test(q)) return "hat";
    if (/coin|ding|chime/.test(q)) return "coin";
    if (/buzz/.test(q)) return "buzz";
    return "blip";
  }

  w.trySenseCommand = function (userText) {
    if (typeof fnEnabled === "function") {
      if (!fnEnabled("sense.svg") && !fnEnabled("sense.midi") && !fnEnabled("sense.sfx")) return null;
    }
    const q = String(userText || "").toLowerCase().trim();
    if (!q) return null;
    if (/^(draw|paint|make (an? )?(icon|image|picture|svg|mark|tile)|sketch)\b/.test(q) || /\bdraw (a |the |me )?(ya|я|circle|square|icon|mark)\b/.test(q)) {
      if (typeof fnEnabled === "function" && !fnEnabled("sense.svg")) return "SVG make is off.";
      const made = makeSvg(svgSpecFromTalk(userText));
      if (typeof saveFile === "function") saveFile(made.name, made.svg, made.mime);
      if (typeof remember === "function") remember("Made SVG " + made.name);
      return "Made " + made.name + " on the spine (SVG). Offline Function 2. The file is in your downloads.";
    }
    if (/^(make |play )?(a )?(beat|drum|groove)\b/.test(q) || /\bmake a beat\b/.test(q)) {
      if (typeof fnEnabled === "function" && !fnEnabled("sense.midi")) return "MIDI/synth is off.";
      playBeat();
      const mid = makeMidi();
      if (typeof saveFile === "function") saveFile(mid.name, mid.bytes, mid.mime);
      if (typeof remember === "function") remember("Made MIDI beat " + mid.name);
      return "Played a beat on Web Audio and wrote " + mid.name + ". Offline Function 2. No MusicGen in this body.";
    }
    if (/^(play |make )?(a )?(sfx|sound|beep|blip|thump|ding|coin)\b/.test(q) || /\b(sfx|sound effect)\b/.test(q)) {
      if (typeof fnEnabled === "function" && !fnEnabled("sense.sfx")) return "SFX is off.";
      const k = playSfx(sfxFromTalk(q));
      if (typeof remember === "function") remember("Played sfx " + k);
      return "Played sfx “" + k + "” from the spine (Web Audio). Part, not a seated MusicGen.";
    }
    if (/^(speak|say this|voice|sing|tts)\b/.test(q)) {
      const has = (typeof state !== "undefined" && state.senses && state.senses.voicePart);
      if (!has) return "Voice is a part slot. Feed a tiny Piper/Kokoro ONNX to seat speech. Until then I only write text.";
      return "A voice part is in the gut. Runtime not seated in this wrap yet — I will not pretend to sing.";
    }
    if (/\b(function 2|senses|media creation|make music|make (an? )?image)\b/.test(q) && /what|how|can you/.test(q)) {
      return "Function 2 make (amber): SVG, MIDI/synth, SFX on this spine. Voice/ONNX and diffusion hearts are parts until eaten and seated. Green nerves still fetch. They do not replace Function 0 or 1.";
    }
    return null;
  };

  w.yaSenses = { makeSvg: makeSvg, makeMidi: makeMidi, playSfx: playSfx, playBeat: playBeat, svgSpecFromTalk: svgSpecFromTalk };
})(window);
