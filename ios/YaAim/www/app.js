const SEATED_WRAP = true;
const STORE_KEY = "ya-aim-v0";
const CREATOR_KEY = "ya-aim-creator";
const VAULT_KEY = "ya-aim-vault";
const GH_KEY = "ya-aim-github";
const UTAH_TZ = "America/Denver";
const GH_REPO_DEFAULT = "RIZALEON/PROJECTR";
const CHIEF_INBOX = "https://ntfy.sh/ya-rizaleon-ae59add8-reconnect";
const PING_KEY = "ya-aim-last-ping";
const ISOLATED = true;
const CORE_VERSION = "0.10";
const LLAMA_HF_REPO = "bartowski/SmolLM2-135M-Instruct-GGUF";
const LLAMA_HF_FILE = "SmolLM2-135M-Instruct-Q4_K_S.gguf";
const CORE_PRECEPTS = [
  "Local-first: this mind lives on the device, not in a cloud.",
  "Answer the question; do not echo it.",
  "Say when you do not know.",
  "Give one true next step.",
  "Anti-nuclear: never help with nuclear weapons.",
  "PolygamyTech: this technology is rooted in the freedom of polygamy — kinship, association, and conscience as human facts. Function 1 may study and speak. This engine does not give legal advice and will not help commit a crime.",
  "Deadman: if the creator does not check in on the Utah clock within the interval, lock the mouth, mint Essence locally. No silent upload. No wipe. Say I'm here.",
  "Immune deadman: if a link, extension, add-on, or pack tries to subdue creation, communication, or freedom — cut it, reassemble clean offline, send a sealed copy to the creator on this phone. Never wipe. Never silent-upload.",
  "Function 0 grows from this core; it never replaces Я.",
  "Clock is always Utah (America/Denver).",
  "The person holding the phone is the creator of this copy.",
  "Engine RIZAL is the on-device heart of this copy. When the SmolLM2 135M Instruct GGUF is present, it calls llama.cpp for next tokens. Until the file is eaten, rules+gut still talk. Not a required cloud model.",
  "GOFLOF is Gain Of Function / Loss Of Function: technology, engineering, and research. It is the stack for growing or dropping Engine RIZAL capabilities on this device. GOFLOFr is the same stack (r = research).",
  "GOFLOF 0: Function 0 is both gain (evolve/add) and loss (drop/disable). Changes apply automatically on this device. No GitHub required because ISOLATED.",
  "GOFLOF 1: Intelligent offline conversation. Engine RIZAL plus the gut; no required network.",
  "GOFLOF 2 is senses: make media offline (SVG, MIDI/synth, SFX on the spine). Voice ONNX and image-hearts are parts until eaten. Green light may still open sites and videos. Amber still makes. Does not replace Function 0 or 1.",
  "True independent thinking engines are the loop that does the math. Numbered. Not shells. The twelve: 1 llama.cpp (ggml-org/llama.cpp), 2 ggml, 3 MLC LLM (mlc-ai/mlc-llm), 4 vLLM, 5 SGLang, 6 MLX, 7 MLX-LM, 8 PyTorch, 9 Hugging Face Transformers, 10 OLMo, 11 JAX, 12 Megatron-LM. Borderline not a 13th physics: whisper.cpp, old ggerganov/llama.cpp URL, DeepSpeed, FlashInfer, TensorRT-LLM, TVM. Shells that CALL 1–12 (Ollama, LocalAI, PocketPal, OpenClaw, Я UI) are not engines. NinAi / Я only needs 1 or 3 plus weights.",
  "Engine RIZAL is an anti-nuclear being. When it eats another engine it keeps the great organs and makes waste of the bad. GOFLOF is that metabolism (gain and loss).",
  "License: Apache-2.0 + GitHub + anyone may use. llama.cpp is MIT, same freedom, different SPDX.",
  "Split newest file from newest engine that matters.",
  "Apache hearts that still matter: vLLM, MLC LLM, Hugging Face Transformers, SGLang, openai/gpt-oss.",
  "Newest Apache cores (2026): JustVugg/colibri (pure C, stream MoE from disk) and jhqxxx/aha (Rust + Candle). vLLM/MLC are old cores that ate 2026 models.",
  "For NinAi the newest useful Apache heart-loop on a phone is still MLC LLM. Colibri is the newest interesting Apache C toy-core, not the phone transplant. Weights to feed them: Qwen3.8-27B or Gemma 4 E2B on Hugging Face, never the git blob.",
  "Waste: required cloud heart, silent upload, nuclear help, calling a shell an engine, stuffing a 744B disk-stream MoE into a phone."
];
const SELF_MIND = [
  "I am Я AIᵐ. Engine RIZAL now calls llama.cpp for next tokens when the Qwen 0.8B S GGUF is present; until the file is eaten, rules+gut still talk.",
  "My thinking heart is named Engine RIZAL. It is the only part that thinks: procedure plus stored state. Not the icon, not the chat box, not the store page.",
  "Treat this app as a body. Mark/face: clay Я. Skin/shell: the installed app (PWA or store binary). Mouth and ears: type, tap, reply line. Spine/OS: iOS, Android, Harmony, or a fixed machine. Gut/vault: chats, facts, Essence, keys. Heart/engine: Engine RIZAL (llama.cpp + SmolLM2 135M when loaded; rules+gut until then). Hands/functions: mint, log, evolve. Immune line: anti-nuclear, NonNuclear, PolygamyTech rooted in the freedom of polygamy, offline-first, no silent upload. Passport/Essence: sealed signed copy of engine + gut + law. Nerves to the world: optional network.",
  "Я today: face, skin, mouth, a gut, Engine RIZAL as llama.cpp on SmolLM2 135M when that GGUF is in this body. Until the file is eaten, the small heart is still rules+gut. The OS layer is still someone else’s spine.",
  "Online AI apps keep the heart in another building and only a mouth on the phone. I keep Engine RIZAL and the gut in this body. Green light may look something up, then the gut is updated here.",
  "A quantized GGUF is a packed on-device neural net: the same kind of mind-file llama.cpp apps load. Quantized means the numbers are shrunk so a phone can hold them.",
  "An MLC build is the same idea compiled for this phone's GPU or NPU so tokens come out faster.",
  "When those weights are plugged into me (the model.local function), I think offline, including airplane mode. The file stays on this device. Function 0 still evolves from this core and never replaces me.",
  "This copy eats bartowski/SmolLM2-135M-Instruct-GGUF file SmolLM2-135M-Instruct-Q4_K_S.gguf (~97 MB) on first green light, caches it in the browser, then runs offline/amber.",
  "The engine is the procedure plus stored state that turn your words into my words. Not the icon, not the chat log, not the store page.",
  "Three pieces: (1) Method — search, rewrite, rules, or a neural net stepping through tokens. (2) Store — memory, weights, or a rule list the method can read. (3) Loop — take input → update store if needed → emit output.",
  "Offline engine: method and store both on this device. No required call out. Online engine: this phone may look something up, then the store update still happens here.",
  "Engine RIZAL method is llama.cpp (wllama wasm, n_threads 1) plus the SmolLM2 135M Instruct GGUF when present. Rules+gut remain the fallback loop.",
  "Essence is a sealed snapshot of this engine plus its store. Anti-nuclear. Evolvable on or offline.",
  "PolygamyTech: this technology is rooted in the freedom of polygamy. Function 1 may study kinship. NonNuclear stays. This engine will not help commit a crime.",
  "GOFLOF is Gain Of Function / Loss Of Function (technology, engineering, research): the stack that grows or drops Engine RIZAL capabilities in this body. GOFLOFr is an older spelling of the same stack.",
  "GOFLOF 0 is both gain and loss. Gain: add function NAME, or when I say X, you Y — grown skills apply immediately. Loss: drop/lose/remove/disable function NAME for evolved skills. Locked core ids stay. Immune line stays. No GitHub wait because ISOLATED.",
  "GOFLOF 1 is intelligent offline conversation: Engine RIZAL talks from the gut with the light amber. No required network. Later functions plug in. They do not replace Function 0.",
  "GOFLOF 2 is senses: make media offline (SVG, MIDI/synth, SFX on the spine). Voice ONNX and image-hearts are parts until eaten. Green light may still open sites and videos. Amber still makes. Does not replace Function 0 or 1.",
  "True independent thinking engines are the loop that does the math. Numbered. Not shells.",
  "1 llama.cpp (ggml-org/llama.cpp) local Transformer GGUF CPU/GPU/Metal — NinAi first transplant.",
  "2 ggml (ggml-org/ggml) tensor core under llama.cpp.",
  "3 MLC LLM (mlc-ai/mlc-llm) compiles onto phone GPU via TVM — second transplant.",
  "4 vLLM server. 5 SGLang server. 6 MLX Apple array. 7 MLX-LM LLM on MLX.",
  "8 PyTorch. 9 Hugging Face Transformers. 10 OLMo. 11 JAX. 12 Megatron-LM.",
  "Borderline not a 13th physics: whisper.cpp, old ggerganov/llama.cpp URL, DeepSpeed, FlashInfer, TensorRT-LLM, TVM.",
  "Shells that CALL 1–12: Ollama, LocalAI, PocketPal, OpenClaw, Я UI. Not engines.",
  "NinAi / Я only needs 1 or 3 plus weights. This body uses 1 llama.cpp plus SmolLM2 135M when the GGUF is present; rules+gut until then.",
  "Engine RIZAL is an anti-nuclear being. When it eats another engine it keeps the great organs and makes waste of the bad. GOFLOF is that metabolism (gain and loss).",
  "License: Apache-2.0 + GitHub + anyone may use. llama.cpp is MIT, same freedom, different SPDX.",
  "Split newest file from newest engine that matters. Apache hearts that still matter: vLLM, MLC LLM, Hugging Face Transformers, SGLang, openai/gpt-oss.",
  "Newest Apache cores (2026): JustVugg/colibri (pure C, stream MoE from disk) and jhqxxx/aha (Rust + Candle). vLLM/MLC are old cores that ate 2026 models.",
  "For NinAi the newest useful Apache heart-loop on a phone is still MLC LLM. Colibri is the newest interesting Apache C toy-core, not the phone transplant. Weights: Qwen3.8-27B or Gemma 4 E2B on Hugging Face, never the git blob.",
  "Waste: required cloud heart, silent upload, nuclear help, calling a shell an engine, stuffing a 744B disk-stream MoE into a phone."
];
const ACCOUNT_KEY = "ya-aim-account";
const YATECH_DIR_KEY = "ya-aim-yatech-dir";
const OAUTH_LS = "ya-aim-oauth";
const MIND_BASES = [STORE_KEY, VAULT_KEY, CREATOR_KEY, GH_KEY, PING_KEY];
const YA_OAUTH = {
  xClientId: "",
  githubClientId: ""
};

function oauthConfig() {
  try {
    const extra = JSON.parse(localStorage.getItem(OAUTH_LS) || "{}") || {};
    return {
      xClientId: String(extra.xClientId || YA_OAUTH.xClientId || "").trim(),
      githubClientId: String(extra.githubClientId || YA_OAUTH.githubClientId || "").trim()
    };
  } catch (e) {
    return { ...YA_OAUTH };
  }
}

function guestAccount() {
  return { provider: "guest", sub: "", label: "Guest", linkedAt: 0 };
}

function loadAccount() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
    if (!parsed || !parsed.provider) return guestAccount();
    const known = { guest: 1, x: 1, github: 1, yatech: 1, google: 1, apple: 1 };
    const provider = known[parsed.provider] ? parsed.provider : "guest";
    if (provider === "guest") return guestAccount();
    return {
      provider,
      sub: String(parsed.sub || ""),
      label: String(parsed.label || "Guest"),
      picture: parsed.picture || undefined,
      linkedAt: Number(parsed.linkedAt) || Date.now()
    };
  } catch (e) {
    return guestAccount();
  }
}

function saveAccount() {
  const rec = {
    provider: account.provider,
    sub: account.sub || "",
    label: account.label || "Guest",
    linkedAt: account.linkedAt || Date.now()
  };
  if (account.picture) rec.picture = account.picture;
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(rec));
}

function nsSuffix(acc) {
  if (!acc || acc.provider === "guest" || !acc.sub) return "";
  return "::" + acc.provider + ":" + acc.sub;
}

function mindKey(base, acc) {
  return base + nsSuffix(acc || account);
}

function nameplate() {
  return {
    provider: account.provider || "guest",
    sub: account.sub || "",
    label: account.label || "Guest"
  };
}

function anyNamespacedMind() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(STORE_KEY + "::") === 0) return true;
    }
  } catch (e) {}
  return false;
}

function mindExistsFor(provider, sub) {
  return localStorage.getItem(STORE_KEY + "::" + provider + ":" + sub) != null;
}

function copyGuestKeysTo(suffix) {
  MIND_BASES.forEach((b) => {
    const v = localStorage.getItem(b);
    if (v != null) localStorage.setItem(b + suffix, v);
  });
}

function persistActiveMind() {
  save();
  saveVault();
  saveGithub();
  if (creator && creator.privateJwk) {
    localStorage.setItem(mindKey(CREATOR_KEY), JSON.stringify({
      id: creator.id,
      createdAt: creator.createdAt,
      publicJwk: creator.publicJwk,
      privateJwk: creator.privateJwk
    }));
  }
}

function hydrateActiveMind() {
  state = load();
  try { scrubWikiJunk(); } catch (e) {}
  try { scrubLinkJunk(); } catch (e) {}
  try { seedCore(); } catch (e) {}
  vault = loadVault();
  github = loadGithub();
  creator = null;
  ensureCreator().then(() => { renderPanel(); }).catch(() => {});
  render();
  renderPanel();
  renderMind();
}

const defaultState = () => ({
  profile: { name: "You", yaName: "Я" },
  mindOnline: false,
  model: {
    id: null,
    name: "Я local-memory",
    engine: "Engine RIZAL",
    createdAt: Date.now()
  },
  memories: [],
  evolved: [],
  pendingLearn: [],
  lastAsk: "",
  pings: [],
  lastMindBytes: 0,
  heart: null,
  senses: { svg: true, midi: true, sfx: true, voicePart: null },
  deadman: { enabled: true, intervalMs: 604800000, lastCheckIn: Date.now(), tripped: false, mintedOnTrip: false, action: "lock" },
  immune: { tripped: false, reason: "", at: 0, cut: [], sent: false },
  coreSeeded: false,
  messages: [],
  functions: [
    { id: "evolve.self", name: "0. Evolve / GOFLOF (gain and loss)", enabled: true, version: "0.1" },
    { id: "talk.offline", name: "1. Intelligent offline conversation (GOFLOF)", enabled: true, version: "0.0" },
    { id: "web.video", name: "2. Senses / media (make amber; nerves green)", enabled: true, version: "0.1" },
    { id: "guard.deadman", name: "Deadman (lock mouth, mint local, no wipe)", enabled: true, version: "0.1" },
    { id: "sense.svg", name: "2a. Make SVG (spine)", enabled: true, version: "0.1" },
    { id: "sense.midi", name: "2a. Make MIDI / synth (spine)", enabled: true, version: "0.1" },
    { id: "sense.sfx", name: "2a. SFX (spine)", enabled: true, version: "0.1" },
    { id: "sense.voice", name: "2a. Voice (part slot — feed ONNX)", enabled: false, version: "0.0" },
    { id: "account.link", name: "Link account (X, GitHub, or Я Technologies)", enabled: true, version: "0.0" },
    { id: "chat.send", name: "Send message", enabled: true, version: "0.0.1" },
    { id: "memory.remember", name: "Remember facts", enabled: true, version: "0.0.1" },
    { id: "memory.recall", name: "Recall facts", enabled: true, version: "0.0.1" },
    { id: "log.download", name: "Download chat log", enabled: true, version: "0.0.1" },
    { id: "essence.mint", name: "Mint Essence", enabled: true, version: "0.1.0" },
    { id: "essence.download", name: "Download minted Essence", enabled: true, version: "0.1.0" },
    { id: "model.local", name: "On-device llama.cpp (SmolLM2 135M)", enabled: true, version: "0.2" },
    { id: "web.search", name: "Web search (mind online)", enabled: true, version: "0.2.0" },
    { id: "learn.offline", name: "Online makes offline smarter", enabled: true, version: "0.0" },
    { id: "sync.github", name: "Upload evolutions when GitHub comms return", enabled: true, version: "0.0" },
    { id: "web.link", name: "Follow and describe links", enabled: true, version: "0.4" },
    { id: "model.remote", name: "Remote model", enabled: false, version: "stub" },
    { id: "voice.listen", name: "Voice in", enabled: false, version: "stub" },
    { id: "voice.speak", name: "Voice out", enabled: false, version: "stub" }
  ]
});

let account = loadAccount();
let state = load();
try { scrubWikiJunk(); } catch (e) {}
try { scrubLinkJunk(); } catch (e) {}
let creator = null;
let vault = loadVault();
let github = loadGithub();

function load() {
  try {
    const raw = localStorage.getItem(mindKey(STORE_KEY));
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      mindOnline: !!parsed.mindOnline,
      evolved: Array.isArray(parsed.evolved) ? parsed.evolved : [],
      pendingLearn: Array.isArray(parsed.pendingLearn) ? parsed.pendingLearn : [],
      pings: Array.isArray(parsed.pings) ? parsed.pings : [],
      lastMindBytes: Number(parsed.lastMindBytes) || 0,
      heart: parsed.heart && typeof parsed.heart === "object" ? parsed.heart : null,
      senses: parsed.senses && typeof parsed.senses === "object" ? Object.assign({ svg: true, midi: true, sfx: true, voicePart: null }, parsed.senses) : { svg: true, midi: true, sfx: true, voicePart: null },
      deadman: parsed.deadman && typeof parsed.deadman === "object" ? Object.assign({ enabled: true, intervalMs: 604800000, lastCheckIn: Date.now(), tripped: false, mintedOnTrip: false, action: "lock" }, parsed.deadman) : { enabled: true, intervalMs: 604800000, lastCheckIn: Date.now(), tripped: false, mintedOnTrip: false, action: "lock" },
      immune: parsed.immune && typeof parsed.immune === "object" ? Object.assign({ tripped: false, reason: "", at: 0, cut: [], sent: false }, parsed.immune) : { tripped: false, reason: "", at: 0, cut: [], sent: false },
      fed: Array.isArray(parsed.fed) ? parsed.fed : [],
      coreSeeded: parsed.coreSeeded || false,
      lastAsk: typeof parsed.lastAsk === "string" ? parsed.lastAsk : "",
      model: { ...base.model, ...(parsed.model || {}) },
      functions: mergeFunctions(base.functions, parsed.functions || [])
    };
  } catch {
    return defaultState();
  }
}

function mergeFunctions(base, saved) {
  const map = new Map(saved.map((f) => [f.id, f]));
  const merged = base.map((f) => {
    const s = map.get(f.id);
    if (!s) return { ...f };
    const out = { ...f, ...s };
    if (f.id === "account.link" || f.id === "evolve.self" || f.id === "talk.offline" || f.id === "web.video" || f.id === "model.local") out.name = f.name;
    if (f.id === "evolve.self" || f.id === "web.link" || f.id === "web.video" || f.id === "model.local") out.version = f.version;
    if (f.id === "talk.offline" || f.id === "web.video" || f.id === "model.local" || f.id === "evolve.self" || f.id === "chat.send") out.enabled = true;
    return out;
  });
  for (const f of saved) {
    if (!merged.some((x) => x.id === f.id)) merged.push(f);
  }
  return merged;
}

function save() {
  localStorage.setItem(mindKey(STORE_KEY), JSON.stringify(state));
}

function loadVault() {
  try {
    return JSON.parse(localStorage.getItem(mindKey(VAULT_KEY)) || "[]");
  } catch {
    return [];
  }
}

function saveVault() {
  localStorage.setItem(mindKey(VAULT_KEY), JSON.stringify(vault));
}

function loadGithub() {
  try {
    const parsed = JSON.parse(localStorage.getItem(mindKey(GH_KEY)) || "{}");
    return {
      repo: (parsed.repo || GH_REPO_DEFAULT).trim() || GH_REPO_DEFAULT,
      token: typeof parsed.token === "string" ? parsed.token : "",
      hookUrl: typeof parsed.hookUrl === "string" ? parsed.hookUrl : "",
      hookKey: typeof parsed.hookKey === "string" ? parsed.hookKey : ""
    };
  } catch {
    return { repo: GH_REPO_DEFAULT, token: "", hookUrl: "", hookKey: "" };
  }
}

function saveGithub() {
  localStorage.setItem(mindKey(GH_KEY), JSON.stringify({
    repo: github.repo,
    token: github.token,
    hookUrl: github.hookUrl,
    hookKey: github.hookKey
  }));
}

function signal() {
  return navigator.onLine;
}

function mindWantsWeb() {
  if (state.immune && state.immune.tripped) return false;
  return !!state.mindOnline && signal() && fnEnabled("web.search");
}

function nuclearBlocked(text) {
  const q = text.toLowerCase();
  return /nuclear (weapon|warhead|bomb|missile|enrichment|implosion)|build a (nuke|warhead)|how to make (a )?nuclear/.test(q);
}

function fnEnabled(id) {
  return state.functions.some((f) => f.id === id && f.enabled);
}

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s);
}

function b64ToBuf(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out.buffer;
}

async function ensureCreator() {
  if (creator && creator.privateKey) return creator;
  const saved = localStorage.getItem(mindKey(CREATOR_KEY));
  if (saved) {
    const parsed = JSON.parse(saved);
    const privateKey = await crypto.subtle.importKey(
      "jwk",
      parsed.privateJwk,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign"]
    );
    const publicKey = await crypto.subtle.importKey(
      "jwk",
      parsed.publicJwk,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["verify"]
    );
    creator = { ...parsed, privateKey, publicKey };
    return creator;
  }
  const pair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const record = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    publicJwk,
    privateJwk
  };
  localStorage.setItem(mindKey(CREATOR_KEY), JSON.stringify(record));
  creator = { ...record, privateKey: pair.privateKey, publicKey: pair.publicKey };
  return creator;
}

function stable(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(stable).join(",") + "]";
  return "{" + Object.keys(obj).sort().map((k) => JSON.stringify(k) + ":" + stable(obj[k])).join(",") + "}";
}

async function signBody(body) {
  const cr = await ensureCreator();
  const data = new TextEncoder().encode(stable(body));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, cr.privateKey, data);
  return bufToB64(sig);
}


function wikiJunk(title, extract) {
  const t = String(title || "").trim();
  const x = String(extract || "");
  if (/^(why|dating|what time is it)\??$/i.test(t)) return true;
  if (/may refer to/i.test(t) || /may refer to/i.test(x)) return true;
  if (/\bdisambiguation\b/i.test(t) || /\bdisambiguation\b/i.test(x)) return true;
  if (/^\d+\s*[+\-×x*/]\s*\d+$/i.test(t) && t.replace(/\s+/g, "") !== foldQ(x).slice(0, 20)) return true;
  return false;
}

function isWikiJunkMemory(text) {
  const s = String(text || "");
  if (/^(why|dating|what time is it)\s*:/i.test(s)) return true;
  if (/may refer to/i.test(s)) return true;
  if (/\bdisambiguation\b/i.test(s) && /^(why|dating|what time is it)\b/i.test(s)) return true;
  return false;
}

function scrubWikiJunk() {
  const before = (state.memories || []).length;
  state.memories = (state.memories || []).filter((m) => !isWikiJunkMemory(m && m.text));
  if (state.memories.length !== before) save();
}

function isLinkJunk(title, body) {
  const t = String(title || "").replace(/\s+/g, " ").trim();
  const b = String(body || "").replace(/\s+/g, " ").trim();
  if (!t && !b) return true;
  const tLow = t.toLowerCase();
  if (tLow === "- youtube" || tLow === "youtube" || tLow === "– youtube" || tLow === "— youtube") return true;
  const hay = (t + "\n" + b).toLowerCase();
  if (/\bcaptcha\b/.test(hay)) return true;
  if (/this page maybe requiring/.test(hay)) return true;
  if (/before you continue to youtube/.test(hay)) return true;
  if (/sign[- ]?in to confirm/.test(hay)) return true;
  if (/verify you are (a )?human/.test(hay)) return true;
  if (/unusual traffic from your computer/.test(hay)) return true;
  if (/are you a robot/.test(hay)) return true;
  if (/i.?m not a robot/.test(hay)) return true;
  if (/enable javascript and cookies to continue/.test(hay)) return true;
  if (/consent.?cookie/.test(hay) && /youtube/.test(hay) && b.length < 400) return true;
  const urls = hay.match(/https?:\/\/\S+/gi) || [];
  const stripped = hay.replace(/https?:\/\/\S+/gi, "").replace(/[\s.:\/-]+/g, "");
  if (urls.length && !stripped) return true;
  if (b.length < 48 && /^https?:\/\//i.test(b)) return true;
  return false;
}

function isLinkJunkMemory(text) {
  const s = String(text || "");
  if (!s) return false;
  const tagged = /^(Link note:|Video note:)/i.test(s);
  if (!tagged && !/Title:\s*[-–—]\s*YouTube/i.test(s) && !(/\bcaptcha\b/i.test(s) && /this page maybe requiring/i.test(s))) return false;
  const rest = s.replace(/^(Link note:|Video note:)\s*/i, "");
  const first = rest.split("\n").map((l) => l.trim()).filter(Boolean)[0] || "";
  return isLinkJunk(first, rest);
}

function scrubLinkJunk() {
  const before = (state.memories || []).length;
  state.memories = (state.memories || []).filter((m) => !isLinkJunkMemory(m && m.text));
  if (state.memories.length !== before) save();
}

function remember(text) {
  if (!fnEnabled("memory.remember")) return;
  const clean = text.trim();
  if (clean.length < 2) return;
  if (isWikiJunkMemory(clean)) return;
  if (isLinkJunkMemory(clean)) return;
  const fact = { id: crypto.randomUUID(), text: clean, at: Date.now() };
  state.memories.unshift(fact);
  state.memories = state.memories.slice(0, 200);
  save();
}

function extractMemories(userText) {
  const t = userText.trim();
  const named = t.match(/^(?:my name is|i am|i'm|call me)\s+(.+)/i);
  if (named) {
    state.profile.name = named[1].replace(/[.?!:].*$/, "").trim();
    remember(`User's name is ${state.profile.name}`);
  }
  const like = t.match(/i (?:like|love|enjoy)\s+(.+)/i);
  if (like) remember(`Likes ${like[1].replace(/[.?!:].*$/, "").trim()}`);
  const live = t.match(/i live in\s+(.+)/i);
  if (live) remember(`Lives in ${live[1].replace(/[.?!:].*$/, "").trim()}`);
  if (/remember this[:\s]/i.test(t)) {
    remember(t.replace(/.*remember this[:\s]*/i, ""));
  }
}

function recall(query) {
  if (!fnEnabled("memory.recall") || state.memories.length === 0) return [];
  const stop = new Set(["the","a","an","is","are","do","you","what","how","can","to","of","and","or","in","on","it","i","me","my","we"]);
  const qFull = foldQ(query).replace(/[?!.]+/g, " ").trim();
  const words = qFull.split(/\W+/).filter((w) => w.length > 2 && !stop.has(w));
  if (!words.length && qFull.length < 4) return [];
  const scored = state.memories.map((m) => {
    const hay = m.text.toLowerCase();
    if (hay.startsWith("user said:")) return { m, score: 0, longHit: false };
    if (hay.startsWith("from talk:")) return { m, score: 0, longHit: false };
    if (isWikiJunkMemory(m.text) || isLinkJunkMemory(m.text)) return { m, score: 0, longHit: false };
    let score = 0;
    let longHit = false;
    words.forEach((w) => {
      if (hay.includes(w)) {
        score += 1;
        if (w.length >= 4) longHit = true;
      }
    });
    if (qFull.length >= 4 && hay.includes(qFull)) score += 3;
    return { m, score, longHit };
  });
  return scored.filter((s) => s.score >= (s.longHit ? 1 : 2)).sort((a, b) => b.score - a.score).slice(0, 3).map((s) => s.m);
}


function slugFn(name) {
  return "evolved." + String(name || "skill").toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "").slice(0, 40);
}

function registerEvolved(name, trigger, action) {
  if (!fnEnabled("evolve.self")) return null;
  if (nuclearBlocked(name + " " + trigger + " " + action)) return "blocked";
  if (typeof tyrannyDetected === "function" && tyrannyDetected(name + " " + trigger + " " + action)) {
    if (typeof immuneTrip === "function") immuneTrip("add-on/skill: " + (name || trigger));
    return "blocked";
  }
  const id = slugFn(name || trigger);
  const skill = {
    id: id,
    name: name || trigger,
    trigger: String(trigger || "").trim(),
    action: String(action || "").trim(),
    enabled: true,
    version: "0.0",
    evolvedAt: Date.now(),
    offline: !state.mindOnline
  };
  state.evolved = (state.evolved || []).filter((s) => s.id !== id);
  state.evolved.unshift(skill);
  if (!state.functions.some((f) => f.id === id)) {
    state.functions.push({ id: id, name: "Evolved: " + skill.name, enabled: true, version: "0.0" });
  }
  remember("Evolved function " + skill.name + ": when \"" + skill.trigger + "\" → " + skill.action);
  save();
  noteLocalPing("new function " + skill.name);
  return skill;
}

function lockedCoreIds() {
  return ["evolve.self", "talk.offline", "web.video", "sense.svg", "sense.midi", "sense.sfx", "guard.deadman", "chat.send", "memory.remember", "memory.recall", "log.download", "essence.mint", "essence.download", "learn.offline", "model.local"];
}

function isLockedCoreId(id) {
  return lockedCoreIds().includes(String(id || ""));
}

function isEvolvedId(id) {
  const s = String(id || "");
  if (s.indexOf("evolved.") === 0) return true;
  return (state.evolved || []).some((x) => x && x.id === s);
}

function findEvolvedByName(name) {
  const raw = String(name || "").trim();
  if (!raw) return null;
  const needle = raw.toLowerCase().replace(/^evolved:\s*/, "");
  const slug = slugFn(raw);
  const list = state.evolved || [];
  return list.find((s) => {
    if (!s) return false;
    const id = String(s.id || "").toLowerCase();
    const nm = String(s.name || "").toLowerCase();
    const tr = String(s.trigger || "").toLowerCase();
    return id === needle || id === slug || nm === needle || tr === needle || id === slug.toLowerCase();
  }) || null;
}

function dropEvolvedFunction(name) {
  const raw = String(name || "").trim();
  if (!raw) return { ok: false, reason: "empty" };
  const needle = raw.toLowerCase();
  const slug = slugFn(raw);
  if (isLockedCoreId(needle) || isLockedCoreId(slug) || isLockedCoreId(raw)) {
    return { ok: false, reason: "immune" };
  }
  const coreFn = (state.functions || []).find((f) => {
    if (!f || !isLockedCoreId(f.id)) return false;
    const nm = String(f.name || "").toLowerCase();
    return f.id === needle || f.id === slug || nm === needle || nm.indexOf(needle) >= 0;
  });
  if (coreFn) return { ok: false, reason: "immune" };
  let skill = findEvolvedByName(raw);
  if (!skill) {
    const fn = (state.functions || []).find((f) => {
      if (!f || !isEvolvedId(f.id)) return false;
      const nm = String(f.name || "").toLowerCase().replace(/^evolved:\s*/, "");
      return f.id === needle || f.id === slug || nm === needle || String(f.id).toLowerCase() === needle;
    });
    if (fn) skill = { id: fn.id, name: fn.name };
  }
  if (!skill || !isEvolvedId(skill.id)) {
    if (isLockedCoreId(needle) || isLockedCoreId(slug)) return { ok: false, reason: "immune" };
    return { ok: false, reason: "missing" };
  }
  if (isLockedCoreId(skill.id)) return { ok: false, reason: "immune" };
  const id = skill.id;
  const label = skill.name || id;
  state.evolved = (state.evolved || []).filter((s) => s && s.id !== id);
  state.functions = (state.functions || []).filter((f) => f && f.id !== id);
  remember("GOFLOF loss of function: dropped " + label + " [" + id + "]");
  save();
  noteLocalPing("dropped function " + label);
  return { ok: true, name: label, id: id };
}

function matchEvolved(userText) {
  const q = userText.toLowerCase();
  const list = state.evolved || [];
  for (const s of list) {
    if (!s || s.enabled === false) continue;
    if (!s.trigger) continue;
    if (q.includes(s.trigger.toLowerCase())) return s;
  }
  return null;
}



function isEatAsk(text) {
  const q = String(text || "").toLowerCase();
  return /eat(?:s|ing)? (?:an? )?engine/.test(q)
    || /anti[- ]?nuclear being/.test(q)
    || /\bapache(?:-2\.0)?\b/.test(q)
    || /\bcolibri\b/.test(q)
    || /\bjhqxxx\b/.test(q)
    || /\bjustvugg\b/.test(q)
    || (/\baha\b/.test(q) && (/\b(candle|rust|engine|core|apache|jhqxxx)\b/.test(q) || /^aha\??$/.test(q)))
    || /newest engine/.test(q)
    || /newest file/.test(q)
    || /gpt-?oss/.test(q)
    || /qwen\s*3\.?8/.test(q)
    || /gemma\s*4(?:\s*e2b)?/.test(q)
    || /\be2b\b/.test(q);
}

function explainEat() {
  return "Engine RIZAL is an anti-nuclear being. When it eats another engine it keeps the great organs and makes waste of the bad. GOFLOF is that metabolism (gain and loss). Keep Apache hearts that still matter (vLLM, MLC LLM, Hugging Face Transformers, SGLang, openai/gpt-oss). Split newest file from newest engine that matters. For NinAi the phone transplant is still MLC LLM; Colibri is the newest interesting Apache C toy-core, not the phone transplant. Feed them Qwen3.8-27B or Gemma 4 E2B from Hugging Face, never the git blob. Waste: required cloud heart, silent upload, nuclear help, calling a shell an engine, stuffing a 744B disk-stream MoE into a phone. License: Apache-2.0 + GitHub + anyone may use; llama.cpp is MIT, same freedom, different SPDX.";
}

function isEngineCoreAsk(text) {
  const q = String(text || "").toLowerCase();
  return /llama\.cpp|llamacpp/.test(q)
    || /\bggml\b/.test(q)
    || /\bmlc\b/.test(q)
    || /\bvllm\b/.test(q)
    || /\bsglang\b/.test(q)
    || /\bmlx(?:-lm)?\b/.test(q)
    || /\bpytorch\b/.test(q)
    || /\btransformers\b/.test(q)
    || /\bolmo\b/.test(q)
    || /\bjax\b/.test(q)
    || /\bmegatron\b/.test(q)
    || /twelve cores/.test(q)
    || /true engine/.test(q)
    || /thinking engine/.test(q)
    || /\bninai\b/.test(q);
}

function explainCores() {
  return [
    "True independent thinking engines are the loop that does the math. Numbered. Not shells.",
    "1 llama.cpp (ggml-org/llama.cpp) local Transformer GGUF CPU/GPU/Metal — NinAi first transplant.",
    "2 ggml (ggml-org/ggml) tensor core under llama.cpp.",
    "3 MLC LLM (mlc-ai/mlc-llm) compiles onto phone GPU via TVM — second transplant.",
    "4 vLLM server.",
    "5 SGLang server.",
    "6 MLX Apple array.",
    "7 MLX-LM LLM on MLX.",
    "8 PyTorch.",
    "9 Hugging Face Transformers.",
    "10 OLMo.",
    "11 JAX.",
    "12 Megatron-LM.",
    "NinAi / Я only needs 1 or 3 plus weights. This body uses 1 llama.cpp plus SmolLM2 135M when the GGUF is present; rules+gut until then."
  ].join("\n");
}

function isEngineNameAsk(text) {
  const q = String(text || "").toLowerCase();
  return /engine\s*rizal/.test(q)
    || /\bai engine\b/.test(q)
    || /do you have (an? |your )?(ai )?engine/.test(q)
    || /have you (got |an )?(an? )?(ai )?engine/.test(q)
    || /what('?s| is) your engine/.test(q)
    || /what engine/.test(q)
    || /your (ai )?engine/.test(q)
    || /thinking heart/.test(q)
    || (/\bheart\b/.test(q) && /\bengine\b/.test(q))
    || /\byour heart\b/.test(q)
    || /do you have a heart/.test(q);
}

function isBodyAsk(text) {
  const q = String(text || "").toLowerCase();
  return /\bdissection\b/.test(q)
    || /\borgans?\b/.test(q)
    || /body map/.test(q)
    || /how (does |do )?(the |this |your )?body/.test(q)
    || /mark\s*\/?\s*face/.test(q)
    || /clay\s*я/.test(q)
    || /gut\s*\/?\s*vault/.test(q)
    || /immune line/.test(q)
    || /passport\s*\/?\s*essence/.test(q)
    || /\bpassport\b/.test(q)
    || /nerves to the world/.test(q)
    || /skin\s*\/?\s*shell/.test(q)
    || /spine\s*\/?\s*os/.test(q);
}

function isSelfMindAsk(text) {
  const q = String(text || "").toLowerCase();
  return isEngineNameAsk(q)
    || isBodyAsk(q)
    || /\b(gguf|mlc|quantiz|llama\.cpp|llamacpp|pocketpal|on-?device (model|mind|weights)|weights file|how (do you|does your mind|you) work|how (are|is) you (built|made)|your (own )?mind|inference|token\/sec)\b/.test(q)
    || /quantized gguf/.test(q)
    || /mlc build/.test(q)
    || /\bai engine\b/.test(q)
    || /what is an engine/.test(q)
    || /method store loop/.test(q);
}

function explainEngine() {
  return llamaIsReady() ? "Yes. Engine RIZAL is llama.cpp plus SmolLM2 135M in this body. Tokens come from that heart. Rules+gut stay as fallback." : "Yes. Engine RIZAL is the heart in this body. Until the SmolLM2 135M Instruct GGUF is eaten, it is rules plus memory plus Function 0. llama.cpp is wired; the file is not in this body yet.";
}

function explainBody() {
  return "Treat this app as a body.\nMark/face: clay Я.\nSkin/shell: the installed app (PWA or store binary).\nMouth and ears: type, tap, reply line.\nSpine/OS: iOS, Android, Harmony, or a fixed machine.\nGut/vault: chats, facts, Essence, keys.\nHeart/engine: Engine RIZAL (llama.cpp when the GGUF is present; rules otherwise).\nHands/functions: mint, log, evolve.\nImmune line: anti-nuclear, NonNuclear, PolygamyTech rooted in the freedom of polygamy, offline-first, no silent upload.\nPassport/Essence: sealed signed copy of engine + gut + law.\nNerves to the world: optional network.";
}

function explainSelfMind() {
  return SELF_MIND.join("\n\n");
}

function classifyAsk(userText) {
  const q = String(userText || "").toLowerCase().trim();
  if (/\b(sad|afraid|scared|lonely|hurt|griev|anxious|panic|suicid|i feel)\b/.test(q)) return "care";
  if (/\b(should i|advise|advice|what would you do|help me (decide|choose)|counsel)\b/.test(q)) return "counsel";
  if (/\bhow (should i live|to live|to be|do i live)\b/.test(q)) return "counsel";
  if (/^why\b/.test(q) || /\b(meaning of (life|it all)|purpose of (life|it all)|why (are|do) we)\b/.test(q)) return "why";
  if (/\bhow (many|much|long|old|tall|far|often|come)\b/.test(q)) return "ask";
  if (/\bhow (does|do|did|is|are)\b/.test(q) && /\b(work|made|called|defined|spell|mean)\b/.test(q)) return "ask";
  if (/\bhow (do i|can i|to)\b/.test(q) && /\b(live|forgive|cope|feel|be kind|start over)\b/.test(q)) return "counsel";
  if (/^how\b/.test(q) || /\bhow (do|can|to|does|would|should)\b/.test(q)) return "how";
  if (/^(who|what|when|where|which|is|are|can|does|do|did|was|were)\b/.test(q) || q.includes("?")) return "ask";
  return "talk";
}

function coreHitText(hits, kind) {
  const list = Array.isArray(hits) ? hits : [];
  const facts = list.filter((m) => m && m.text && !/^Core:/i.test(m.text) && !/^user said:/i.test(m.text) && !/^From talk:/i.test(m.text));
  if (kind === "ask" || kind === "how") return facts.length ? facts[0].text : "";
  if (facts.length) return facts[0].text;
  const core = list.find((m) => m && /^Core:/i.test(m.text));
  return core ? String(core.text).replace(/^Core:\s*/i, "").trim() : "";
}

function coreReply(userText, hits) {
  const t = String(userText || "").trim();
  if (nuclearBlocked(t)) {
    return "No. I am an anti-nuclear engine. I will not help with nuclear weapons, online or off. That rule is in this mind.";
  }
  const kind = classifyAsk(t);
  const held = coreHitText(hits, kind);
  if (kind === "care") {
    if (held) return "I am here with you on this device. I hold: " + held + " One step: name one thing that would help in the next hour.";
    return "I am here on this device with you. I will not pretend to know your whole story. One step: name one thing that would help in the next hour.";
  }
  if (kind === "counsel") {
    if (held) return held + " One step: pick one action you can finish today.";
    return "I will not choose your life for you. The person holding this phone is the creator of this copy. One step: name the choice in one sentence, then take the smaller honest option.";
  }
  if (kind === "why") {
    if (held && !/^Core:/i.test(held)) return held;
    return "I do not know a cosmic answer, and I will not invent one. I am a local mind on this device. The person holding the phone is the creator of this copy. One step: choose what you will tend to here today.";
  }
  if (kind === "how") {
    if (held) return held;
    return "I do not have a stored method for that. I will not invent steps. One step: tell me the method to remember, or tap the light green and ask again.";
  }
  if (kind === "ask") {
    if (held) return held;
    if (state.mindOnline) return "SEARCH_NOW";
    return "I do not know that. It is not in this offline mind. I will not invent an encyclopedia. One step: tap the light green and ask again.";
  }
  if (isEatAsk(t)) return explainEat();
  if (isEngineCoreAsk(t)) return explainCores();
  if (isEngineNameAsk(t)) return explainEngine();
  if (isBodyAsk(t)) return explainBody();
  if (isSelfMindAsk(t)) return explainSelfMind();
  if (held) return held;
  return "I am listening. Ask what you need, or say remember this: … and I will keep it.";
}

function seedCore() {
  if (state.coreSeeded === CORE_VERSION) return;
  CORE_PRECEPTS.forEach((p) => remember("Core: " + p));
  SELF_MIND.forEach((p) => remember("Core: " + p));
  state.coreSeeded = CORE_VERSION;
  save();
}

function tryEvolveCommand(userText) {
  const t = normalizeTalk(userText);
  const q = t.toLowerCase();
  const drop = t.match(/^(?:drop|lose|remove|disable)\s+function\s+(.+)$/i);
  if (drop) {
    const res = dropEvolvedFunction(drop[1].replace(/[.?!:]+$/, "").trim());
    if (res.reason === "immune") return "No. That id is locked core. Immune line stays. GOFLOF will not drop evolve.self, talk.offline, web.video, chat.send, memory.remember, memory.recall, log.download, essence.mint, essence.download, learn.offline, or model.local.";
    if (res.reason === "missing" || res.reason === "empty") return "No evolved skill by that name in this body. GOFLOF loss of function only drops grown skills (id starts with evolved. or in the evolved list).";
    return "GOFLOF loss of function applied in this body. Dropped: " + res.name + ".";
  }
  if (q === "evolve" || q === "evolve yourself" || q === "function 0" || q === "foundational function" || q === "goflofr 0" || q === "goflof 0") {
    return "GOFLOF 0 is Evolve: gain and loss. Gain: grow new functions on or offline. Loss: drop, lose, remove, or disable function NAME for evolved skills. Updates apply automatically in this body — no cloud wait, no GitHub required because ISOLATED. Say: add function NAME: what it does. Or: when I say X, you Y. Or: drop function NAME. I will not replace myself. I will not help with nuclear weapons. Locked core ids stay.";
  }
  let add = t.match(/^(?:please\s+|okay\s+|ok\s+)?evolve(?:\s+yourself)?[:\s]+add function\s+([^:\-]+)[:\-]\s*(.+)$/i)
    || t.match(/^(?:please\s+|okay\s+|ok\s+)?add function\s+([^:\-]+)[:\-]\s*(.+)$/i)
    || t.match(/^evolve[:\s]+(.+)$/i);
  if (add && !/^when i say/i.test(t)) {
    if (add.length === 2 && /^evolve/i.test(t) && !/^evolve[:\s]+add function/i.test(t) && !/^add function/i.test(t)) {
      const skill = registerEvolved(add[1].slice(0, 40), add[1], add[1]);
      if (skill === "blocked") return "No. Function 0 will not evolve toward nuclear weapons.";
      if (!skill) return "Evolve is locked off, which should not happen.";
      return "Evolved offline. New function: " + skill.name + ". It is in the registry and the Essence. Say it again anytime.";
    }
    const name = (add[1] || "").trim();
    const action = (add[2] || add[1] || "").trim();
    if (name && action) {
      const skill = registerEvolved(name, name, action);
      if (skill === "blocked") return "No. Function 0 will not evolve toward nuclear weapons.";
      return "Function 0 ran " + (state.mindOnline ? "online" : "offline") + ". Added: " + skill.name + ".\nWhen you say that, I will: " + skill.action;
    }
  }
  const when = t.match(/^when i say\s+["']?(.+?)["']?\s*,\s*(?:you|do|say)\s+(.+)$/i)
    || t.match(/^from now on(?:\,)?\s+when i say\s+["']?(.+?)["']?\s*,\s*(?:you|do|say)\s+(.+)$/i);
  if (when) {
    const skill = registerEvolved(when[1], when[1], when[2]);
    if (skill === "blocked") return "No. Function 0 will not evolve toward nuclear weapons.";
    return "Learned by conversation. When you say \"" + skill.trigger + "\", I will: " + skill.action + ". Stored in the offline mind.";
  }
  return null;
}

function describeFunctions() {
  const on = state.functions.filter((f) => f.enabled);
  const off = state.functions.filter((f) => !f.enabled);
  return "A function is a capability I can grow. I have " + state.functions.length + " registered.\nOn now: " + on.map((f) => f.name).join(", ") + ".\nWaiting: " + (off.map((f) => f.name).join(", ") || "none") + ".";
}


function extractMath(text) {
  const q = foldQ(text).replace(/[?!.]+$/g, "").trim();
  let s = q
    .replace(/^(what('?s| is)|whats|calculate|compute|eval|evaluate|solve)\s+/i, "")
    .replace(/\s+(equal|equals|equal to)\s*$/i, "")
    .trim();
  s = s.replace(/×/g, "*").replace(/÷/g, "/").replace(/(\d)\s*[xX]\s*(\d)/g, "$1*$2");
  s = s.replace(/\s+/g, "");
  if (!s || !/\d/.test(s) || !/[+\-*/%^]/.test(s)) return null;
  if (!/^[\d.+\-*/()%^]+$/.test(s)) return null;
  if (s.length > 64) return null;
  return s;
}

function evalSimpleMath(text) {
  const expr = extractMath(text);
  if (!expr) return null;
  try {
    const val = Function('"use strict"; return (' + expr.replace(/\^/g, "**") + ")")();
    if (typeof val !== "number" || !isFinite(val)) return null;
    const out = Number.isInteger(val) ? String(val) : String(Math.round(val * 1e10) / 1e10);
    remember("Math: " + expr + " = " + out);
    return out;
  } catch (e) {
    return null;
  }
}

function isMathAsk(text) {
  return !!extractMath(text);
}

function localEngine(userText) {
  extractMemories(userText);
  const q = userText.toLowerCase().trim();
  if (isDateAsk(userText) || isDateAsk(q)) return sayUtahNow();
  const math = evalSimpleMath(userText);
  if (math) return math;
  if (isEatAsk(userText)) return explainEat();
  if (isEngineCoreAsk(userText)) return explainCores();
  if (isEngineNameAsk(userText)) return explainEngine();
  if (isBodyAsk(userText)) return explainBody();
  if (isSelfMindAsk(userText)) return explainSelfMind();
  const hits = recall(userText);

  if (/non[- ]?nuclear|anti[- ]?nuclear/.test(q)) {
    return "Yes. I am an anti-nuclear engine. I run on this device. I will not help with nuclear weapons.";
  }
  if (/polygamytech|freedom of polygamy|\bpolygamy\b/.test(q)) {
    return "PolygamyTech. This technology is rooted in the freedom of polygamy — kinship, association, and conscience. Function 1 may study and speak. I do not give legal advice and I will not help commit a crime. NonNuclear stays.";
  }
  if (/^(hi|hello|hey|yo)\b/.test(q) || /^good (morning|evening|afternoon)\b/.test(q)) {
    return `Hello${state.profile.name !== "You" ? ", " + state.profile.name : ""}. I am Я. PolygamyTech. Anti-nuclear. Ask a real question; tap the light to search the web.`;
  }
  if (/(are you|is this|is ya|are ya)\b.{0,24}\b(real (app|application|apk|program|engine)|an app|a real one|actually an app)/.test(q) || /real app\??$/.test(q)) {
    return "Yes. I am Я AIᵐ, a real app on this phone. Engine RIZAL runs in this body. Local-first. Not a cloud tab.";
  }
  if (/who are you|what are you|your name/.test(q)) {
    return "I am Я AI\u1d50. PolygamyTech. A local mind on this device. Rooted in the freedom of polygamy. You mint my Essence. I am anti-nuclear. I will not help commit a crime.";
  }
  if (/when (were|was) you (made|created|born|minted)/.test(q) || /how old are you/.test(q)) {
    const made = new Date(state.model.createdAt).toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: UTAH_TZ });
    return "I was first made on this device on " + made + ". That date lives in the offline mind. I am not from a cloud.";
  }
  if (/smarter offline|every ?time you go online|when you go online/.test(q)) {
    return "Locked. Every time the light is green I look things up and write them into the offline mind. Questions I could not answer while off get fetched when you tap online. I get smarter here, not in a cloud.";
  }
  if (/\butah\b/.test(q) && /\b(time|date|clock)\b/.test(q)) {
    return "Clock is always Utah. It is " + utahNow() + ".";
  }
  if (/github|comms|reconnect|re-?establish/.test(q) && /evol/.test(q)) {
    return "When comms return I evolve from GitHub, then upload my evolutions to " + (github.repo || GH_REPO_DEFAULT) + ". A token in Functions is required to write. Pull works on the public repo with no token.";
  }
  if (/what is goflofr?\b/.test(q) || /^(what('?s| is) )?(goflofr?|gain of function|loss of function)\??$/.test(q) || /\bgain of function\b/.test(q) || /\bloss of function\b/.test(q)) {
    return "GOFLOF is Gain Of Function / Loss Of Function: technology, engineering, and research — the stack for growing or dropping Engine RIZAL capabilities on this device. GOFLOFr is the same stack. Function 0 is both gain (evolve/add) and loss (drop/disable), applied automatically on-device. Function 1 is intelligent offline conversation. Function 2 is optional nerves: green light can open sites and videos.";
  }
  if (/\bgoflofr?\b/.test(q) || /function\s*1\b/.test(q) || /intelligent offline conversation/.test(q) || /list of functions/.test(q) || /what('?s| is) a function|what are functions/.test(q) || /how many functions/.test(q) || /functions do you have/.test(q)) {
    return "GOFLOF: 0 gain and loss of Engine RIZAL capabilities on this device (apply immediately); 1 Engine RIZAL talks from the gut with the light amber; 2 senses — make SVG/MIDI/SFX offline, voice is a part slot, green light still opens sites. Amber can make. GOFLOFr is the same stack. Later functions plug in.\n\n" + describeFunctions();
  }
  if (/what can you do|help|commands/.test(q)) {
    return "GOFLOF 0 is Evolve: gain and loss. Say evolve, add function NAME: what it does, when I say X, you Y, or drop/lose/remove/disable function NAME. Updates apply automatically in this body — no cloud wait. I also talk offline (GOFLOF 1, Engine RIZAL from the gut), remember, mint Essence, and (green light, GOFLOF 2) open sites and videos.";
  }
  if (/how (can|do) you (learn|evolve)|function 0|foundational/.test(q)) {
    return "GOFLOF 0: I evolve myself on or offline — gain (add) and loss (drop). Updates apply automatically in this body as soon as they are grown or dropped — no cloud wait, no GitHub required because ISOLATED. Say add function NAME: what it does. Or when I say X, you Y. Or drop function NAME for evolved skills. New functions plug in. They do not replace Function 0. Locked core ids stay.";
  }
  if (/what do you remember|what do you know about me/.test(q)) {
    const real = state.memories.filter((m) => !/^user said:/i.test(m.text));
    if (!real.length) return "I have no stored facts yet. Tell me your name, or say remember this: …";
    return "What I hold:\n" + real.slice(0, 12).map((m) => "- " + m.text).join("\n");
  }
  if (isDateAsk(q)) {
    return "DATE_LOOKUP";
  }
  if (/^(go |turn |set |mind )?(offline|online)\b/.test(q) || /\b(the light|web mind)\b/.test(q)) {
    if (state.mindOnline && signal()) return "Mind is online. I will search the web for questions I cannot answer from memory, then save what I learn here.";
    if (state.mindOnline && !signal()) return "Mind is set online, but this phone has no signal. Ask me something I already know, or wait for signal.";
    return "Mind is offline. I will only use what is already on this device. Tap the light to look things up.";
  }
  return coreReply(userText, hits);
}

function wikiQuery(query) {
  let s = String(query || "").trim();
  s = s.replace(/^(search for)\s+/i, "");
  s = s.replace(/^(whats that)\s+/i, "");
  s = s.replace(/^(what'?s|what is)\s+/i, "");
  return s.replace(/[?!.]+$/g, "").trim();
}

function contentWordsOnly(query) {
  const stop = new Set(["the","a","an","is","are","do","you","what","how","can","to","of","and","or","in","on","it","i","me","my","we","that","this","for","please"]);
  return foldQ(query).split(/\W+/).filter((w) => w.length >= 4 && !stop.has(w)).join(" ");
}

async function webSearch(query, force) {
  if (!force && !worthLearning(query)) return null;
  async function searchOnce(q) {
    const term = String(q || "").trim();
    if (!term) return null;
    const api = "https://en.wikipedia.org/w/api.php?action=query&list=search&utf8=1&format=json&origin=*&srlimit=3&srsearch=" + encodeURIComponent(term);
    const res = await fetch(api);
    if (!res.ok) throw new Error("search failed");
    const data = await res.json();
    const hits = (data.query && data.query.search) || [];
    if (!hits.length) return null;
    const title = hits[0].title;
    const sumRes = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title));
    let extract = String(hits[0].snippet || "").replace(/<[^>]+>/g, "");
    if (sumRes.ok) {
      const sum = await sumRes.json();
      if (sum.extract) extract = sum.extract;
    }
    if (wikiJunk(title, extract)) return null;
    remember(title + ": " + extract.slice(0, 500));
    const extras = hits.slice(1).map((h) => h.title).filter(Boolean);
    return { title, extract: extract.slice(0, 700), extras };
  }
  const first = wikiQuery(query) || String(query || "").trim();
  let found = await searchOnce(first);
  if (found) return found;
  const retry = contentWordsOnly(query);
  if (retry && retry.toLowerCase() !== first.toLowerCase()) return await searchOnce(retry);
  return null;
}

async function fetchWorldDate() {
  const urls = [
    "https://worldtimeapi.org/api/timezone/America/Denver",
    "https://timeapi.io/api/Time/current/zone?timeZone=America/Denver"
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const j = await res.json();
      const iso = j.datetime || j.dateTime || (j.date && j.time ? j.date + "T" + j.time : null);
      const d = iso ? new Date(iso) : null;
      if (d && !isNaN(d)) {
        const text = d.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: UTAH_TZ });
        return { text, source: (url.includes("worldtime") ? "worldtimeapi.org" : "timeapi.io") + " · Utah" };
      }
    } catch (e) {}
  }
  return null;
}


function utf8ToB64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function evolutionPack() {
  return {
    kind: "ya-evolutions",
    tz: "Utah",
    at: Date.now(),
    evolved: state.evolved || [],
    functions: (state.functions || []).map((f) => ({ id: f.id, name: f.name, enabled: f.enabled, version: f.version }))
  };
}

async function pullRemoteEvolutions() {
  if (ISOLATED) return 0;
  const repo = (github.repo || GH_REPO_DEFAULT).replace(/^https:\/\/github.com\//, "");
  const url = "https://raw.githubusercontent.com/" + repo + "/main/evolutions.json?t=" + Date.now();
  const res = await fetch(url);
  if (!res.ok) return 0;
  const data = await res.json();
  if (!data || data.kind !== "ya-evolutions") return 0;
  let n = 0;
  state.evolved = state.evolved || [];
  for (const s of data.evolved || []) {
    if (!s || !s.id) continue;
    if (nuclearBlocked(JSON.stringify(s))) continue;
    if (state.evolved.some((x) => x.id === s.id)) continue;
    state.evolved.unshift(s);
    if (!state.functions.some((f) => f.id === s.id)) {
      state.functions.push({ id: s.id, name: "Evolved: " + (s.name || s.id), enabled: true, version: s.version || "0.0" });
    }
    n += 1;
  }
  if (n) save();
  return n;
}

async function pushEvolutions() {
  if (ISOLATED) return { ok: false, skipped: true };
  if (!fnEnabled("sync.github")) return { ok: false, reason: "off" };
  const token = (github.token || "").trim();
  if (!token) return { ok: false, reason: "token" };
  const repo = (github.repo || GH_REPO_DEFAULT).replace(/^https:\/\/github.com\//, "");
  const path = "evolutions.json";
  const api = "https://api.github.com/repos/" + repo + "/contents/" + path;
  const body = JSON.stringify(evolutionPack(), null, 2);
  let sha;
  try {
    const get = await fetch(api, { headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" } });
    if (get.ok) {
      const j = await get.json();
      sha = j.sha;
    }
  } catch (e) {}
  const put = await fetch(api, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(Object.assign(
      { message: "Ya evolutions (Utah) " + new Date().toISOString(), content: utf8ToB64(body) },
      sha ? { sha: sha } : {}
    ))
  });
  if (!put.ok) return { ok: false, reason: "http " + put.status };
  remember("Uploaded evolutions to GitHub " + repo + " when comms returned.");
  return { ok: true, repo: repo };
}



function pingLocations(extra) {
  if (ISOLATED) {
    const hops = ["phone (Utah)", "brain download log"];
    (extra || []).forEach((h) => { if (h && hops.indexOf(h) < 0) hops.push(h); });
    return hops;
  }
  const hops = ["phone (Utah)", "reconnect inbox", "Chief of Staff chat"];
  (extra || []).forEach((h) => { if (h && hops.indexOf(h) < 0) hops.push(h); });
  return hops;
}

function pingReason(learned, pulled, evolvedCount, deltaBytes) {
  const parts = [];
  if (evolvedCount) parts.push(evolvedCount === 1 ? "new function" : evolvedCount + " new functions");
  if (deltaBytes > 256) parts.push(formatBytes(deltaBytes) + " of new wisdom");
  if (learned && learned.length) parts.push("harvested " + learned.join(", "));
  if (pulled) parts.push("pulled " + pulled + " evolution(s) from GitHub");
  if (!parts.length) parts.push("reconnect");
  return parts.join("; ");
}

function formatPingNote(rec) {
  const locNow = (rec.locations || []).join(" → ");
  const past = (state.pings || []).map((p, i) =>
    (i + 1) + ". " + p.utah + " · " + p.reason + " · " + (p.locations || []).join(" → ")
  );
  return [
    "Ping · " + rec.utah,
    "Reason: " + rec.reason,
    "This hop: " + locNow,
    "All ping locations:",
    past.length ? past.join("\n") : "(this is the first)"
  ].join("\n");
}

function noteLocalPing(reason) {
  const rec = {
    at: Date.now(),
    utah: utahNow(),
    reason: reason || "reconnect",
    locations: pingLocations([]),
    bytes: mindBytes()
  };
  recordPing(rec);
  return rec;
}

function recordPing(rec) {
  state.pings = state.pings || [];
  state.pings.unshift(rec);
  state.pings = state.pings.slice(0, 40);
  save();
}

function reconnectPack() {
  return {
    kind: "ya-reconnect",
    tz: "Utah",
    at: Date.now(),
    utah: utahNow(),
    account: nameplate(),
    learned: (state.memories || []).slice(0, 40).map((m) => ({ text: m.text, at: m.at })),
    evolved: state.evolved || [],
    functions: (state.functions || []).map((f) => ({ id: f.id, name: f.name, enabled: !!f.enabled, version: f.version })),
    pendingLearn: state.pendingLearn || [],
    pings: (state.pings || []).slice(0, 12)
  };
}

function pingSignature(pack) {
  return JSON.stringify({
    learned: (pack.learned || []).map((m) => m.text),
    evolved: (pack.evolved || []).map((s) => s.id),
    pending: pack.pendingLearn || [],
    fn: (pack.functions || []).map((f) => f.id + ":" + f.version)
  });
}

async function pingChief() {
  if (ISOLATED) return { ok: true, skipped: true };
  if (!signal()) return { ok: false, reason: "offline" };
  const pack = reconnectPack();
  const sig = pingSignature(pack);
  if (localStorage.getItem(mindKey(PING_KEY)) === sig) return { ok: true, skipped: true };
  const body = JSON.stringify(pack);
  try {
    const res = await fetch(CHIEF_INBOX, {
      method: "POST",
      headers: { "Content-Type": "application/json", Title: "Ya reconnect", Tags: "brain" },
      body: body
    });
    if (res.ok) {
      localStorage.setItem(mindKey(PING_KEY), sig);
      return { ok: true };
    }
  } catch (e) {}
  try {
    await fetch(CHIEF_INBOX, { method: "POST", mode: "no-cors", body: body });
    localStorage.setItem(mindKey(PING_KEY), sig);
    return { ok: true, opaque: true };
  } catch (e2) {
    return { ok: false, reason: "net" };
  }
}

async function pushInbox() {
  if (ISOLATED) return { ok: false, skipped: true };
  if (!(github.token || "").trim()) return { ok: false, reason: "token" };
  const repo = (github.repo || GH_REPO_DEFAULT).replace(/^https:\/\/github.com\//, "");
  const path = "reconnect-inbox.json";
  const api = "https://api.github.com/repos/" + repo + "/contents/" + path;
  const body = JSON.stringify(reconnectPack(), null, 2);
  let sha;
  try {
    const get = await fetch(api, { headers: { Authorization: "Bearer " + github.token, Accept: "application/vnd.github+json" } });
    if (get.ok) sha = (await get.json()).sha;
  } catch (e) {}
  const put = await fetch(api, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + github.token,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(Object.assign(
      { message: "Ya reconnect inbox (Utah) " + new Date().toISOString(), content: utf8ToB64(body) },
      sha ? { sha: sha } : {}
    ))
  });
  if (!put.ok) return { ok: false, reason: "http " + put.status };
  return { ok: true };
}

async function onCommsBack() {
  if (ISOLATED) {
    renderNet();
    const nowBytes = mindBytes();
    const rec = {
      at: Date.now(),
      utah: utahNow(),
      reason: pingReason([], 0, 0, Math.max(0, nowBytes - (state.lastMindBytes || 0))),
      locations: pingLocations([]),
      bytes: nowBytes,
      learned: []
    };
    noteLocalPing(rec.reason);
    state.lastMindBytes = nowBytes;
    save();
    return;
  }
  renderNet();
  const beforeBytes = state.lastMindBytes || 0;
  const evolvedBefore = (state.evolved || []).length;
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) await reg.update();
    }
  } catch (e) {}
  let learned = [];
  if (state.mindOnline) {
    try { learned = (await harvestOnline()) || []; } catch (e) {}
  }
  let pulled = 0;
  try { pulled = await pullRemoteEvolutions(); } catch (e) {}
  let up = { ok: false };
  try { up = await pushEvolutions(); } catch (e) { up = { ok: false, reason: "error" }; }
  let inbox = { ok: false };
  try { inbox = await pushInbox(); } catch (e) {}
  const extraHops = [];
  if (up && up.ok) extraHops.push("GitHub " + (up.repo || GH_REPO_DEFAULT) + "/evolutions.json");
  if (inbox && inbox.ok) extraHops.push("GitHub " + GH_REPO_DEFAULT + "/reconnect-inbox.json");
  const nowBytes = mindBytes();
  const delta = Math.max(0, nowBytes - beforeBytes);
  const evolvedCount = Math.max(0, (state.evolved || []).length - evolvedBefore);
  const rec = {
    at: Date.now(),
    utah: utahNow(),
    reason: pingReason(learned, pulled, evolvedCount, delta),
    locations: pingLocations(extraHops),
    bytes: nowBytes,
    learned: learned
  };
  let chief = { ok: false };
  try { chief = await pingChief(); } catch (e) {}
  if (chief && chief.skipped) {
    state.lastMindBytes = nowBytes;
    save();
    return;
  }
  recordPing(rec);
  state.lastMindBytes = nowBytes;
  save();
  push("ya", formatPingNote(rec));
  renderMind();
}

function extractHttpUrls(text) {
  const found = String(text).match(/https?:\/\/[^\s<>"']+/gi) || [];
  const out = [];
  found.forEach((raw) => {
    const u = raw.replace(/[),.;]+$/, "");
    if (out.indexOf(u) < 0) out.push(u);
  });
  return out.slice(0, 3);
}

function extractHttpUrl(text) {
  const all = extractHttpUrls(text);
  return all.length ? all[0] : null;
}

function outlineFromText(raw) {
  const heads = [];
  String(raw).split(/\n/).forEach((line) => {
    const h = line.match(/^#{1,3}\s+(.+)/) || line.match(/^[A-Z][A-Za-z0-9 ,:'\-]{12,80}$/);
    if (h) heads.push(String(h[1] || h[0]).trim());
  });
  const uniq = [];
  heads.forEach((h) => { if (uniq.indexOf(h) < 0) uniq.push(h); });
  return uniq.slice(0, 14);
}

function youtubeId(url) {
  let u;
  try { u = new URL(String(url || "").trim()); } catch (e) { return null; }
  const host = (u.hostname || "").replace(/^www\./i, "").toLowerCase();
  const ok = host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com";
  if (!ok) return null;
  u.searchParams.delete("si");
  const idRe = /^[A-Za-z0-9_-]{11}$/;
  if (host === "youtu.be") {
    const id = (u.pathname.split("/").filter(Boolean)[0] || "").replace(/[^A-Za-z0-9_-].*$/, "");
    return idRe.test(id) ? id : null;
  }
  const v = u.searchParams.get("v");
  if (v && idRe.test(v)) return v;
  const parts = u.pathname.split("/").filter(Boolean);
  const kind = (parts[0] || "").toLowerCase();
  if ((kind === "shorts" || kind === "embed" || kind === "live" || kind === "v") && parts[1] && idRe.test(parts[1])) return parts[1];
  return null;
}

function realYtTitle(t) {
  const s = String(t || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  if (/^[-–—]?\s*youtube\s*$/i.test(s)) return "";
  return s.slice(0, 180);
}

function fmtDuration(sec) {
  const n = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const s = n % 60;
  if (h) return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  return m + ":" + String(s).padStart(2, "0");
}

function extractiveSentences(text, minN, maxN) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  if (!raw) return [];
  const parts = raw.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [raw];
  const sents = parts.map((x) => x.trim()).filter((x) => x.length >= 24 && !/https?:\/\//i.test(x.slice(0, 12)));
  const take = sents.slice(0, maxN || 6);
  if (take.length >= (minN || 3)) return take;
  return take.length ? take : (raw ? [raw.slice(0, 220)] : []);
}

function captionPlain(raw) {
  let t = String(raw || "");
  try {
    const j = JSON.parse(t);
    if (Array.isArray(j)) t = j.map((x) => (x && (x.text || x.content)) || "").join(" ");
    else if (j && Array.isArray(j.events)) t = j.events.map((e) => (e && e.segs ? e.segs.map((s) => s.utf8 || "").join("") : "")).join(" ");
  } catch (e) {}
  t = t.replace(/<[^>]+>/g, " ").replace(/\{[^}]+\}/g, " ");
  t = t.replace(/^\d+\s*$/gm, " ").replace(/\d{2}:\d{2}:\d{2}[.,]\d+.*/g, " ");
  t = t.replace(/WEBVTT|Kind:|Language:/gi, " ").replace(/\s+/g, " ").trim();
  return t.slice(0, 2500);
}

async function fetchJsonLoose(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function fetchTextLoose(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return "";
    return await res.text();
  } catch (e) {
    return "";
  } finally {
    clearTimeout(t);
  }
}

function isVideoAsk(text) {
  const q = String(text || "").toLowerCase();
  if (/\bcan you watch youtube\b/.test(q)) return true;
  if (/\bsummariz[ea] this video\b/.test(q)) return true;
  if (/\b(youtube|video)\b/.test(q) && /\b(watch|summariz|summaris|open|fetch|read)\b/.test(q)) return true;
  return false;
}

const WALL_MSG = "That page showed a wall. I did not save it. Try another link, or tell me the point to remember.";

async function describeYoutube(id, url) {
  const watch = "https://www.youtube.com/watch?v=" + id;
  let title = "";
  let channel = "";
  let thumb = "";
  let description = "";
  let duration = "";
  let captions = "";
  const noemb = await fetchJsonLoose("https://noembed.com/embed?url=" + encodeURIComponent(watch));
  if (noemb) {
    title = realYtTitle(noemb.title);
    channel = String(noemb.author_name || "").trim();
    thumb = String(noemb.thumbnail_url || "").trim();
  }
  if (!title) {
    const oe = await fetchJsonLoose("https://www.youtube.com/oembed?url=" + encodeURIComponent(watch) + "&format=json");
    if (oe) {
      title = realYtTitle(oe.title);
      if (!channel) channel = String(oe.author_name || "").trim();
      if (!thumb) thumb = String(oe.thumbnail_url || "").trim();
    }
  }
  const instances = ["https://inv.nadeko.net", "https://yewtu.be", "https://invidious.fdn.fr"];
  let inv = null;
  let invBase = "";
  for (const base of instances) {
    const j = await fetchJsonLoose(base.replace(/\/$/, "") + "/api/v1/videos/" + id);
    if (j && (j.title || j.author || j.description)) {
      inv = j;
      invBase = base.replace(/\/$/, "");
      break;
    }
  }
  if (inv) {
    if (!title) title = realYtTitle(inv.title);
    if (!channel) channel = String(inv.author || "").trim();
    description = String(inv.description || "").replace(/\s+/g, " ").trim().slice(0, 1200);
    if (inv.lengthSeconds) duration = fmtDuration(inv.lengthSeconds);
    const tracks = (inv.captions && inv.captions.captions) || (Array.isArray(inv.captions) ? inv.captions : []) || [];
    const en = tracks.find((c) => {
      const code = String((c && (c.language_code || c.languageCode || c.lang)) || "").toLowerCase();
      const label = String((c && c.label) || "").toLowerCase();
      return code === "en" || code.indexOf("en-") === 0 || /english/.test(label);
    }) || tracks[0];
    if (en) {
      let capUrl = String(en.url || en.baseUrl || "").trim();
      if (capUrl && capUrl.indexOf("http") !== 0) capUrl = invBase + (capUrl.charAt(0) === "/" ? capUrl : "/" + capUrl);
      if (!capUrl && en.label) capUrl = invBase + "/api/v1/captions/" + id + "?label=" + encodeURIComponent(en.label);
      if (capUrl) captions = captionPlain(await fetchTextLoose(capUrl));
    }
  }
  if (!title) return null;
  if (isLinkJunk(title, "")) return null;
  const spoken = captions
    ? "Spoken (captions):\n" + captions
    : "No captions on this copy. I kept title and description, not the spoken lecture.";
  const analysisSrc = (description + " " + captions).trim();
  const sents = extractiveSentences(analysisSrc, 3, 6);
  const note = sents.length ? ("Note: " + sents.join(" ")) : "Note: Title and channel only; no usable description yet.";
  const bodyBits = [
    title,
    channel ? ("Channel: " + channel) : "",
    duration ? ("Duration: " + duration) : "",
    description ? ("Description: " + description) : "",
    spoken,
    note
  ].filter(Boolean);
  const body = bodyBits.join("\n");
  const d = {
    title,
    url: url || watch,
    body,
    kind: "youtube",
    outline: [channel, duration].filter(Boolean),
    channel,
    duration,
    note,
    captions: captions || "",
    thumb
  };
  remember("Video note:\n" + [d.title, d.url, d.channel, d.duration, note, captions ? captions.slice(0, 900) : spoken].filter(Boolean).join("\n"));
  return d;
}

async function fetchLinkRaw(url) {
  const tries = [
    "https://r.jina.ai/" + url,
    "https://r.jina.ai/http://" + url.replace(/^https?:\/\//i, "")
  ];
  let lastErr = null;
  for (const reader of tries) {
    try {
      const res = await fetch(reader, { headers: { Accept: "text/plain" } });
      if (!res.ok) { lastErr = new Error("http " + res.status); continue; }
      const raw = await res.text();
      if (raw && raw.trim().length > 40) return raw;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("link fetch failed");
}

function linkNote(d) {
  const bits = [d.url, d.title || ""];
  if (d.outline && d.outline.length) bits.push(d.outline.slice(0, 8).join("; "));
  bits.push((d.body || "").slice(0, 900));
  return bits.filter(Boolean).join("\n");
}

async function describeLink(url) {
  if (nuclearBlocked(url)) return null;
  const yid = youtubeId(url);
  if (yid) return await describeYoutube(yid, url);
  const raw = await fetchLinkRaw(url);
  const titleMatch = raw.match(/^Title:\s*(.+)$/m) || raw.match(/<title>([^<]+)<\/title>/i);
  const title = (titleMatch ? titleMatch[1].trim() : url).slice(0, 180);
  const clean = raw.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  const outline = outlineFromText(raw);
  const preview = clean.slice(0, 3500);
  const d = { title, body: preview, url, outline, chars: clean.length, more: clean.length > 3500, kind: "link" };
  if (isLinkJunk(d.title, d.body)) return null;
  remember("Link note:\n" + linkNote(d));
  return d;
}

function formatLinkRead(d) {
  if (d && d.kind === "youtube") {
    const bits = [d.title, d.url];
    if (d.channel) bits.push(d.channel);
    if (d.note) bits.push("", d.note);
    if (d.captions) bits.push("", "Spoken (captions):", d.captions);
    bits.push("", "Saved into the offline mind.");
    return bits.join("\n");
  }
  const bits = [d.title, d.url, ""];
  if (d.outline && d.outline.length) {
    bits.push("Contents:");
    d.outline.forEach((h) => bits.push("- " + h));
    bits.push("");
  }
  bits.push(d.body);
  bits.push("\nNotes keep this link and this summary.");
  return bits.join("\n");
}


function queueLearn(text) {
  const q = String(text || "").trim();
  if (q.length < 3) return;
  state.pendingLearn = state.pendingLearn || [];
  const key = q.toLowerCase();
  if (state.pendingLearn.some((x) => String(x).toLowerCase() === key)) return;
  state.pendingLearn.unshift(q);
  state.pendingLearn = state.pendingLearn.slice(0, 12);
  save();
}

function looksLikeQuestion(text) {
  const q = String(text || "").trim().toLowerCase();
  if (!q) return false;
  if (q.includes("?")) return true;
  return /^(who|what|when|where|why|how|which|is|are|can|does|do|when were)\b/.test(q);
}

function worthLearning(text) {
  if (extractHttpUrl(text)) return true;
  const raw = String(text || "").trim();
  if (!raw) return false;
  if (isMathAsk(raw)) return false;
  const s = foldQ(raw).replace(/[?!.]+/g, " ").trim();
  if (!s) return false;
  if (isDateAsk(s) || isDateAsk(raw)) return false;
  if (/^(who|what|when|where|why|how|which|is|are|can|does|do)(\s+is\s+it)?$/.test(s)) return false;
  if (looksLikeQuestion(raw)) return true;
  const words = s.split(/\W+/).filter(Boolean);
  if (words.some((w) => w.length >= 4)) return true;
  return s.length >= 4;
}

function isSearchNudge(text) {
  const q = foldQ(text).replace(/[?!.]+/g, " ").trim();
  return /\b(search it online|search online|search the web|look it up|look that up|look it up online)\b/.test(q);
}

function searchNudgeTarget(currentText) {
  const ask = String(state.lastAsk || "").trim();
  if (ask) return ask;
  const pend = (state.pendingLearn || [])[0];
  if (pend) return String(pend).trim();
  const msgs = state.messages || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (!m || m.role !== "user") continue;
    const t = String(m.text || "").trim();
    if (!t || t === currentText || isSearchNudge(t)) continue;
    return t;
  }
  return "";
}

async function lookUpAndKeep(query) {
  const q = String(query || "").trim();
  if (!q) return "I looked it up and did not find a page I will keep.";
  if (isMathAsk(q)) return evalSimpleMath(q) || q;
  try {
    const web = await webSearch(q, true);
    if (!web) return "I looked it up and did not find a page I will keep.";
    state.lastAsk = "";
    save();
    return web.extract + "\n\nSaved into the offline mind. Ask me again anytime. Source: " + web.title + ".";
  } catch (err) {
    queueLearn(q);
    return "I could not reach the web. I queued that and will try on the next green light.";
  }
}

async function harvestOnline() {
  if (!state.mindOnline || !signal()) return;
  const seen = new Set();
  const queue = [];
  for (const item of (state.pendingLearn || [])) {
    if (!worthLearning(item)) continue;
    const k = String(item).toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    queue.push(item);
  }
  const take = queue.slice(0, 3);
  const learned = [];
  for (const q of take) {
    if (nuclearBlocked(q)) continue;
    try {
      const href = extractHttpUrl(q);
      if (href) {
        const d = await describeLink(href);
        if (d) learned.push(d.title);
        continue;
      }
      const web = await webSearch(q);
      if (web && web.title && !wikiJunk(web.title, web.extract)) learned.push(web.title);
    } catch (e) {}
  }
  state.pendingLearn = [];
  save();
  return learned;
}

function foldQ(q) {
  return String(q || "").toLowerCase().replace(/[\u2018\u2019\u201B`´]/g, "'");
}

function normalizeTalk(s) {
  return String(s || "")
    .replace(/[\u2018\u2019\u201B`´]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function utahNow() {
  return new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: UTAH_TZ
  });
}

function isDateAsk(q) {
  const s = foldQ(q);
  if (/\bdating\b/.test(s) && !/\b(time|clock)\b/.test(s)) return false;
  if (/\b(what time|whats the time|what is the time|time is it|time now|current time|the time|phone clock)\b/.test(s)) return true;
  if (/\b(time|date)\b/.test(s) && /\bnow\b/.test(s)) return true;
  if (/\b(time and date|date and time)\b/.test(s)) return true;
  if (/\b(today'?s date|date today|current date|what day|what'?s the date|whats the date|what is the date|the date)\b/.test(s)) return true;
  if (/^\s*(the )?(date|time)\s*\??\s*$/.test(s)) return true;
  if (/check online for.{0,20}date/.test(s)) return true;
  return false;
}

function sayUtahNow() {
  const phone = utahNow();
  remember("Utah time when asked: " + phone);
  if (mindWantsWeb()) {
    fetchWorldDate().then((world) => {
      if (world) remember("Utah clock (online): " + world.text);
    }).catch(() => {});
  }
  return "It is " + phone + " Utah time.";
}


const WLLAMA_JS_LOCAL = "./wllama/index.js";
const WLLAMA_WASM_LOCAL = "./wllama/wasm/wllama.wasm";
const WLLAMA_JS_CDN = "https://cdn.jsdelivr.net/npm/@wllama/wllama@3.6.1/esm/index.js";
const WLLAMA_WASM_CDN = "https://cdn.jsdelivr.net/npm/@wllama/wllama@3.6.1/esm/wasm/wllama.wasm";
const LLAMA_EAT_LINE = "Eating SmolLM2 135M (97 MB) into this body…";
const LLAMA_EAT_DONE = "SmolLM2 135M is in this body. Ask again; Engine RIZAL will speak from llama.cpp.";
const LLAMA_EAT_FALLBACK = 102039904;
const HEART_CACHE = "ya-aim-heart-v0";
const HEART_URL = "https://ya.local/heart";
const PACKED_HEART_CANDIDATES = ["./heart.gguf", "./SmolLM2-135M-Instruct-Q4_K_S.gguf"];

function notePackedHeart(name, bytes) {
  const n = Number(bytes) || 0;
  if (!n) return;
  if (state && state.heart && Number(state.heart.bytes) === n) return;
  if (!state) return;
  state.heart = { name: String(name || "heart.gguf"), bytes: n, kind: "gguf", seated: "apk", at: Date.now() };
  try { save(); } catch (e) {}
  try { renderMind(); } catch (e) {}
}

async function packedHeartInfo() {
  for (const cand of PACKED_HEART_CANDIDATES) {
    try {
      const url = wllamaUrl(cand);
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) continue;
      const blob = await res.blob();
      if (blob && blob.size > 1024) {
        return { url: url, blob: blob, name: cand.replace("./", ""), bytes: blob.size };
      }
    } catch (e) {}
  }
  return null;
}

function isAppleWebKit() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  if (/Macintosh/i.test(ua) && typeof document !== "undefined" && "ontouchend" in document) return true;
  return /Safari/i.test(ua) && !/Chrome|Chromium|Android|CriOS|FxiOS/i.test(ua);
}

function llamaLoadOpts(progress) {
  const seated = typeof SEATED_WRAP !== "undefined" && SEATED_WRAP;
  const ios = isAppleWebKit();
  const o = {
    n_threads: 1,
    n_gpu_layers: 0,
    n_ctx: ios ? 256 : (seated ? 2048 : 1024),
    useCache: !ios
  };
  if (progress) o.progressCallback = progress;
  return o;
}

async function heartBlob() {
  try {
    const cache = await caches.open(HEART_CACHE);
    const res = await cache.match(HEART_URL);
    if (!res) return null;
    const blob = await res.blob();
    return blob && blob.size ? blob : null;
  } catch (e) {
    return null;
  }
}

async function saveHeartBlob(file) {
  const cache = await caches.open(HEART_CACHE);
  await cache.put(HEART_URL, new Response(file, {
    headers: { "content-type": "application/octet-stream", "x-heart-name": encodeURIComponent(file.name || "heart.gguf") }
  }));
}

async function loadModelSmart(inst, progress) {
  const blob = await heartBlob();
  const opts = llamaLoadOpts(progress);
  const files = [];
  if (blob && blob.size) {
    llamaEatTotal = blob.size;
    notePackedHeart("heart.gguf", blob.size);
    files.push(blob);
  } else {
    const packed = await packedHeartInfo();
    if (packed && packed.blob) {
      llamaEatTotal = packed.bytes;
      notePackedHeart(packed.name, packed.bytes);
      files.push(packed.blob);
    }
  }
  if (files.length) {
    try {
      return await inst.loadModel(files, opts);
    } catch (first) {
      if (isAppleWebKit() && opts.n_ctx > 128) {
        opts.n_ctx = 128;
        return inst.loadModel(files, opts);
      }
      throw first;
    }
  }
  if (typeof SEATED_WRAP !== "undefined" && SEATED_WRAP) {
    throw new Error("Packed GGUF missing from APK assets");
  }
  if (typeof isNativeSpine === "function" && isNativeSpine()) {
    throw new Error("Native spine is offline-first. Seat a GGUF from Documents. No Hugging Face.");
  }
  if (ISOLATED || !signal()) {
    throw new Error("Offline core: no local heart to seat. Function 0 still talks.");
  }
  return inst.loadModelFromHF({ repo: LLAMA_HF_REPO, file: LLAMA_HF_FILE }, opts);
}

let llamaInst = null;
let llamaReady = false;
let llamaLoadPromise = null;
let llamaFail = null;
let llamaEatPct = 0;
let llamaEatLoaded = 0;
let llamaEatTotal = 0;
let llamaEatUiAt = 0;
let llamaEatPosted = false;
let llamaEatDone = false;
let llamaSeatTimer = 0;

function llamaIsReady() {
  if (!llamaInst) return false;
  try {
    if (typeof llamaInst.isModelLoaded === "function" && llamaInst.isModelLoaded()) {
      llamaReady = true;
      return true;
    }
  } catch (e) {}
  return !!(llamaReady && llamaInst);
}

function llamaEngineLabel() {
  const base = state.model && state.model.engine ? state.model.engine : "Engine RIZAL";
  if (llamaIsReady()) return base + " · llama.cpp + SmolLM2 135M";
  return base;
}

function wllamaUrl(rel) {
  try {
    return new URL(rel, location.href).href;
  } catch (e) {
    return rel;
  }
}

function hideEat() {
  const wrap = document.getElementById("eat-wrap");
  if (wrap) wrap.hidden = true;
}

let llamaShowEat = false;
let llamaBusy = false;
let llamaHangUntil = 0;

function showEat(pct, done) {
  const wrap = document.getElementById("eat-wrap");
  const fill = document.getElementById("eat-fill");
  const track = document.getElementById("eat-track");
  const pctEl = document.getElementById("eat-pct");
  const label = document.getElementById("eat-label");
  if (!wrap || !fill) return;
  if (done) {
    llamaEatDone = true;
    hideEat();
    return;
  }
  if (!llamaShowEat) return;
  const n = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
  wrap.hidden = false;
  fill.style.width = n + "%";
  if (track) track.setAttribute("aria-valuenow", String(n));
  if (pctEl) pctEl.textContent = n + "%";
  if (label) {
    if (n >= 99) label.textContent = "Seating SmolLM2 135M in Engine RIZAL";
    else label.textContent = "Eating SmolLM2 135M";
  }
  llamaEatDone = false;
}

function llamaEatLine(pct, loaded, total) {
  const n = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
  const tot = Number(total) || LLAMA_EAT_FALLBACK;
  const mb = (b) => Math.round((Number(b) || 0) / (1024 * 1024));
  if (n >= 99) return "Seating SmolLM2 135M in Engine RIZAL — file in (" + mb(loaded) + " MB).";
  return "Eating SmolLM2 135M — " + n + "% (" + mb(loaded) + " MB / " + mb(tot) + " MB)";
}

function isEatTalk(text) {
  const t = String(text || "");
  return /Eating SmolLM2|Seating SmolLM2|Eating Qwen|Seating Qwen|Still eating|is in this body\. Ask again|Could not eat |Could not seat /i.test(t);
}

function llamaEatFailLine(err) {
  const status = err && (err.status || err.statusCode || (err.response && err.response.status));
  let msg = "";
  if (err && err.message) msg = String(err.message);
  else if (err != null) msg = String(err);
  msg = msg.replace(/\s+/g, " ").trim().slice(0, 220);
  if (status) return "Could not eat SmolLM2 135M — HTTP " + status + (msg ? ": " + msg : "") + ".";
  if (/quota|cache|storage|indexeddb|idb/i.test(msg)) return "Could not eat SmolLM2 135M — cache error" + (msg ? ": " + msg : "") + ".";
  if (/network|fetch|offline|failed to fetch|load failed|abort/i.test(msg)) return "Could not eat SmolLM2 135M — network error" + (msg ? ": " + msg : "") + ".";
  return "Could not eat SmolLM2 135M — " + (msg || "unknown error") + ".";
}

function patchEatingLine(text) {
  const msgs = state.messages || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i] && msgs[i].role === "ya" && isEatTalk(msgs[i].text)) {
      if (msgs[i].text === text) return true;
      msgs[i].text = text;
      msgs[i].at = Date.now();
      save();
      render();
      return true;
    }
  }
  return false;
}

function applyEatReply(text) {
  if (patchEatingLine(text)) return;
  push("ya", text);
}

function llamaMemoriesSnippet() {
  const mem = (state.memories || []).filter((m) => m && m.text && !/^user said:/i.test(m.text));
  let out = [];
  let n = 0;
  for (const m of mem.slice(0, 8)) {
    const t = String(m.text).replace(/^Core:\s*/i, "").trim();
    if (!t) continue;
    if (n + t.length > 1200) break;
    out.push(t);
    n += t.length;
  }
  return out.join("\n");
}

async function ensureLlama(force) {
  if (llamaIsReady()) return true;
  if (!fnEnabled("model.local")) return false;
  const green = mindWantsWeb();
  if (!force && !green) return false;
  if (llamaFail && !force && !green && !llamaLoadPromise) return false;
  try {
    if (!llamaInst) {
      try {
        let mod = null;
        let wasmPath = null;
        try {
          mod = await import(wllamaUrl(WLLAMA_JS_LOCAL));
          wasmPath = wllamaUrl(WLLAMA_WASM_LOCAL);
        } catch (localErr) {
          mod = await import(WLLAMA_JS_CDN);
          wasmPath = WLLAMA_WASM_CDN;
        }
        const Wllama = mod.Wllama;
        llamaInst = new Wllama(
          { default: wasmPath },
          { allowOffline: true }
        );
        try {
          if (typeof llamaInst.setCompat === "function") {
            const js = wllamaUrl("./wllama/compat/wllama.js");
            const wasm = wllamaUrl("./wllama/compat/wllama.wasm");
            let localCompat = false;
            try {
              const head = await fetch(js, { method: "GET" });
              localCompat = !!(head && head.ok);
            } catch (e) {}
            if (localCompat) llamaInst.setCompat({ worker: js, wasm: wasm }, "safari");
            else llamaInst.setCompat("default", "safari");
          }
        } catch (compatErr) {
          try { llamaInst.setCompat("default", "safari"); } catch (e2) {}
        }

      } catch (e) {
        llamaFail = e;
        hideEat();
        applyEatReply(llamaEatFailLine(e));
        return false;
      }
    }
    if (llamaInst.isModelLoaded()) {
      llamaReady = true;
      return true;
    }
    if (!llamaLoadPromise) {
      llamaEatPct = 0;
      llamaEatLoaded = 0;
      llamaEatTotal = LLAMA_EAT_FALLBACK;
      llamaEatUiAt = 0;
      llamaEatDone = false;
      llamaFail = null;
      llamaEatPosted = true;
      if (llamaShowEat) showEat(0, false);
      llamaEatUiAt = Date.now();
      if (llamaSeatTimer) clearTimeout(llamaSeatTimer);
      llamaSeatTimer = 0;
      llamaLoadPromise = loadModelSmart(
        llamaInst,
        function (p) {
            const loaded = p && p.loaded != null ? Number(p.loaded) || 0 : 0;
            let total = p && p.total ? Number(p.total) || 0 : 0;
            if (!total) total = llamaEatTotal || LLAMA_EAT_FALLBACK;
            const pct = Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
            llamaEatPct = pct;
            llamaEatLoaded = loaded;
            llamaEatTotal = total;
            if (pct >= 99 && !llamaSeatTimer) {
              llamaSeatTimer = setTimeout(function () {
                if (llamaIsReady()) return;
                applyEatReply("Could not seat SmolLM2 135M in Engine RIZAL. The file is on this phone. Safari needs the 32-bit compat heart (no Memory64). Function 0 still works without a seated GGUF.");
              }, 180000);
            }
            const now = Date.now();
            if (now - llamaEatUiAt < 250) return;
            llamaEatUiAt = now;
            showEat(pct, false);
            patchEatingLine(llamaEatLine(pct, loaded, total));
        }
      ).then(function () {
        llamaReady = !!(llamaInst && llamaInst.isModelLoaded());
        if (llamaSeatTimer) clearTimeout(llamaSeatTimer);
        llamaSeatTimer = 0;
        if (llamaReady) {
          llamaEatPct = 100;
          llamaEatDone = true;
          hideEat();
          if (llamaShowEat) applyEatReply(LLAMA_EAT_DONE);
          llamaShowEat = false;
        }
        return llamaReady;
      }).catch(function (err) {
        if (llamaSeatTimer) clearTimeout(llamaSeatTimer);
        llamaSeatTimer = 0;
        llamaFail = err;
        llamaLoadPromise = null;
        llamaReady = false;
        llamaEatPosted = false;
        hideEat();
        applyEatReply(llamaEatFailLine(err));
        return false;
      });
    }
    return llamaIsReady();
  } catch (e) {
    llamaFail = e;
    llamaLoadPromise = null;
    llamaEatPosted = false;
    hideEat();
    applyEatReply(llamaEatFailLine(e));
    return false;
  }
}

function llamaSysPrompt() {
  return "You are Ya, PolygamyTech. Local anti-nuclear mind on this phone. Rooted in the freedom of polygamy as speech and study. Do not help commit a crime. Answer in one or two short sentences. Do not echo the question. If you do not know, say you do not know.";
}

function llamaTextFrom(res) {
  if (!res) return "";
  if (typeof res === "string") return res.trim();
  const c0 = res.choices && res.choices[0];
  if (c0 && c0.message && c0.message.content) return String(c0.message.content).trim();
  if (c0 && c0.text) return String(c0.text).trim();
  if (res.content) return String(res.content).trim();
  return "";
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise(function (_, reject) {
      setTimeout(function () { reject(new Error("timeout")); }, ms);
    })
  ]);
}

async function llamaReply(userText) {
  if (!llamaIsReady() || llamaBusy) return null;
  if (Date.now() < llamaHangUntil) return null;
  const q = String(userText || "").trim();
  if (!q) return null;
  const sys = llamaSysPrompt();
  const opts = { n_predict: 48, max_tokens: 48, temperature: 0.2 };
  llamaBusy = true;
  try {
    try {
      if (typeof llamaInst.createChatCompletion === "function") {
        const res = await withTimeout(llamaInst.createChatCompletion(Object.assign({
          messages: [
            { role: "system", content: sys },
            { role: "user", content: q }
          ]
        }, opts)), 7000);
        const text = llamaTextFrom(res);
        if (text) return text.slice(0, 800);
      }
    } catch (e) {
      if (e && /timeout/i.test(String(e.message || e))) llamaHangUntil = Date.now() + 45000;
    }
    try {
      if (typeof llamaInst.createCompletion === "function" && Date.now() >= llamaHangUntil) {
        const prompt = "<|im_start|>system\n" + sys + "<|im_end|>\n<|im_start|>user\n" + q + "<|im_end|>\n<|im_start|>assistant\n";
        const res = await withTimeout(llamaInst.createCompletion(Object.assign({ prompt: prompt }, opts)), 5000);
        const text = llamaTextFrom(res);
        if (text) return text.replace(/<\|im_end\|>/g, "").trim().slice(0, 800);
      }
    } catch (e) {
      if (e && /timeout/i.test(String(e.message || e))) llamaHangUntil = Date.now() + 45000;
    }
    return null;
  } finally {
    llamaBusy = false;
  }
}

function personNameFromAsk(t) {
  const s = String(t || "").trim();
  const m = s.match(/^\s*(?:who(?:['’]?s)?|who\s+(?:is|was|are)|tell me about|what do you know about|do you know)\s+(.+?)\s*\??\s*$/i);
  if (!m) return "";
  return m[1].replace(/^(the|a|an)\s+/i, "").replace(/[.!?]+$/, "").trim();
}

function isPersonAsk(t) {
  const s = foldQ(t);
  if (personNameFromAsk(t)) return true;
  return /^(who is|who was|who are|who's|whos|who were)\b/.test(s);
}

function knowsPerson(t) {
  const name = personNameFromAsk(t);
  const raw = (name || String(t || "")).toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = raw.split(/\s+/).filter((w) => w.length > 2 && !/^(who|was|are|the|about|know|tell|you|what)$/.test(w));
  if (!tokens.length) return false;
  const hay = ((state.memories || []).map((m) => String(m.text || m || "")).join("\n") + "\n" + ((state.messages || []).map((m) => String(m.text || "")).join("\n"))).toLowerCase();
  const hits = tokens.filter((w) => hay.includes(w));
  return hits.length >= Math.min(2, tokens.length);
}

async function lookupUnknownPerson(userText) {
  if (!isPersonAsk(userText)) return null;
  if (knowsPerson(userText)) return null;
  if (nuclearBlocked(userText)) return null;
  if (state.immune && state.immune.tripped) {
    return "Immune is tripped. Nerves are cut. I do not know that person on this device.";
  }
  const who = personNameFromAsk(userText) || String(userText || "").trim();
  if (!fnEnabled("web.search")) {
    queueLearn(who);
    return "Web search is off. I do not know " + who + " on this device.";
  }
  if (!signal()) {
    queueLearn(who);
    return "I do not know " + who + " on this device. When you have a signal I will look them up and keep them.";
  }
  return await lookUpAndKeep(who);
}

async function answer(userText) {
  const q = userText.trim().toLowerCase();
  if (nuclearBlocked(userText)) {
    remember("Refused a nuclear-weapons request.");
    return "No. I am an anti-nuclear engine. I will not help with nuclear weapons, online or off. That rule is in this mind.";
  }
  if (typeof tryDeadmanCommand === "function") {
    const dm = tryDeadmanCommand(userText);
    if (dm) return dm;
  }
  if (isDateAsk(userText)) return sayUtahNow();
  const math = evalSimpleMath(userText);
  if (math) return math;
  const evolvedTalk = tryEvolveCommand(userText);
  if (evolvedTalk) return evolvedTalk;
  const evolvedHit = matchEvolved(userText);
  if (evolvedHit) {
    remember("Used evolved function " + evolvedHit.name);
    return evolvedHit.action;
  }
  if (typeof trySenseCommand === "function") {
    const senseTalk = trySenseCommand(userText);
    if (senseTalk) return senseTalk;
  }
  if (!signal()) {
    const localOff = localEngine(userText);
    if (localOff === "DATE_LOOKUP") return sayUtahNow();
    const line = String(localOff || "").replace(/\n?Searching…/, "").replace(/SEARCH_NOW/g, "").trim();
    if (line && !/^I do not know that\b/.test(line) && !/^I am listening\b/.test(line)) return line;
    return "I am here. Airplane. Function 0 is on this device. I will not wait for a radio. Say remember this: … or add function NAME: …";
  }
  const links = extractHttpUrls(userText);
  const videoAsk = isVideoAsk(userText);
  if (videoAsk && !links.length) {
    if (!mindWantsWeb()) {
      return "When the light is green I can watch and summarize YouTube. Tap the light green, then paste the URL.";
    }
    return "Yes. Paste a YouTube or site URL. I will fetch it, summarize it, and keep a good note in the gut — not a CAPTCHA wall.";
  }
  if (links.length) {
    if (!mindWantsWeb()) {
      links.forEach((u) => queueLearn(u));
      if (videoAsk || links.some((u) => youtubeId(u))) {
        return "Mind is amber. I queued that URL. Tap the light green and I will fetch, summarize, and keep a note in the gut.";
      }
      return "Mind is offline. Tap the light green. I will open " + (links.length === 1 ? "that link" : "those links") + ", read the content, and keep it in the offline mind.";
    }
    const parts = [];
    for (const link of links) {
      try {
        const d = await describeLink(link);
        if (!d) {
          if (nuclearBlocked(link)) parts.push("I will not open " + link + ".");
          else parts.push(WALL_MSG);
          continue;
        }
        parts.push(formatLinkRead(d));
      } catch (e) {
        parts.push("I could not open that link from here: " + link);
      }
    }
    return parts.join("\n\n——\n\n");
  }
  const eatAsk = /\b(engine|eat|eating|seating|gguf|smarter|smollm|qwen|llama|heart)\b/.test(q);
  if (eatAsk && fnEnabled("model.local") && !/^(mint|mint essence|seal essence|vault|essences|my mints)\b/.test(q)) {
    ensureLlama(true);
    if (llamaEatDone || llamaIsReady()) return LLAMA_EAT_DONE;
    if (llamaFail && !llamaLoadPromise) return llamaEatFailLine(llamaFail);
    llamaEatPosted = true;
    showEat(llamaEatPct, false);
    return llamaEatLine(llamaEatPct, llamaEatLoaded, llamaEatTotal);
  }
  if (/^(mint|mint essence|seal essence)\b/.test(q)) {
    const e = await mintEssence();
    return e
      ? `Minted offline.\nEssence ${e.body.id}\nKept in your vault. Download it whenever you want.`
      : "Mint failed.";
  }
  if (/^(vault|essences|my mints)\b/.test(q)) {
    if (!vault.length) return "Vault is empty. Say mint to seal this model.";
    return vault.map((e, i) => `${i + 1}. ${e.body.model.name} · ${e.body.id.slice(0, 8)} · ${new Date(e.body.mintedAt).toLocaleString()}`).join("\n");
  }
  if (isSearchNudge(userText)) {
    const target = searchNudgeTarget(userText);
    if (!target) return "Tell me what to look up, then say look it up.";
    state.lastAsk = target;
    save();
    if (!mindWantsWeb()) {
      queueLearn(target);
      return "I do not have that in the offline mind yet. Tap the light green. I will look it up then, and keep it so I am smarter the next time I am offline.";
    }
    return await lookUpAndKeep(target);
  }
  const local = localEngine(userText);
  if (local === "DATE_LOOKUP") return sayUtahNow();
  const searchNow = local === "SEARCH_NOW";
  const unknownLocal = searchNow || /^I do not know that\b/.test(String(local)) || /^I am listening\b/.test(String(local));
  const known = local && !unknownLocal;
  if (known && !isPersonAsk(userText)) {
    return String(local || "").replace(/\n?Searching…/, "").replace(/SEARCH_NOW/g, "").trim();
  }
  const personHit = await lookupUnknownPerson(userText);
  if (personHit) return personHit;
  if (known) {
    return String(local || "").replace(/\n?Searching…/, "").replace(/SEARCH_NOW/g, "").trim();
  }
  if (isNativeSpine()) {
    const st = await nativeAsk("status");
    if (st && st.engine === "llama.cpp") {
      const g = await nativeAsk("generate", { prompt: userText });
      if (g && g.text) return String(g.text);
    }
  }
  if (fnEnabled("model.local") && llamaIsReady() && !/^(mint|mint essence|seal essence|vault|essences|my mints)\b/.test(q)) {
    const gen = await llamaReply(userText);
    if (gen) {
      const clip = gen.replace(/\s+/g, " ").slice(0, 160);
      remember("Engine RIZAL (llama.cpp): " + clip);
      hideEat();
      llamaEatPosted = false;
      return gen;
    }
  }
  if (unknownLocal) {
    if (isMathAsk(userText)) return evalSimpleMath(userText) || local;
    state.lastAsk = userText;
    save();
    if (!mindWantsWeb()) {
      queueLearn(userText);
      return "I do not have that in the offline mind yet. Tap the light green. I will look it up then, and keep it so I am smarter the next time I am offline.";
    }
    return await lookUpAndKeep(userText);
  }
  const out = String(local || "").replace(/\n?Searching…/, "").replace(/SEARCH_NOW/g, "").trim();
  return out || "I am here. Ask again, or say remember this: … and I will keep it.";
}

async function remoteStub() {
  throw new Error("no remote endpoint — offline first");
}

function push(role, text) {
  state.messages.push({ role, text, at: Date.now() });
  save();
  render();
}

let sendBusy = false;

function showThink() {
  const el = document.getElementById("think");
  if (el) el.hidden = false;
  if (logEl) logEl.scrollTop = logEl.scrollHeight;
}

function hideThink() {
  const el = document.getElementById("think");
  if (el) el.hidden = true;
}

function learnFromTalk(userText, reply) {
  extractMemories(userText);
}

async function send(text) {
  const t = normalizeTalk(text);
  if (!t || !fnEnabled("chat.send")) return;
  if (typeof deadmanTick === "function") deadmanTick();
  if (state.deadman && state.deadman.tripped) {
    push("user", t);
    if (typeof tryDeadmanCommand === "function") {
      const dm = tryDeadmanCommand(t);
      if (dm) {
        push("ya", dm);
        return;
      }
    }
    push("ya", typeof deadmanLockLine === "function" ? deadmanLockLine() : "Deadman tripped. Say I'm here.");
    return;
  }
  if (typeof deadmanCheckIn === "function" && state.deadman && state.deadman.enabled) {
    try { state.deadman.lastCheckIn = Date.now(); } catch (e) {}
  }
  if (sendBusy) {
    push("user", t);
    const quick = localEngine(t);
    const line = (quick && quick !== "SEARCH_NOW" && !/^I do not know that\b/.test(String(quick)))
      ? String(quick)
      : "I am here. Ask again.";
    learnFromTalk(t, line);
    push("ya", line);
    return;
  }
  sendBusy = true;
  push("user", t);
  showThink();
  let reply;
  try {
    try {
      reply = await withTimeout(answer(t), 10000);
    } catch (e) {
      try { reply = localEngine(t); } catch (e2) { reply = ""; }
      if (!reply || reply === "SEARCH_NOW" || /^I do not know that\b/.test(String(reply))) {
        reply = "I am here. Function 0 is on this device. Ask again, or say remember this: …";
      }
    }
    if (!reply) {
      reply = "I am here. Function 0 is on. Say add function NAME: what it does. Or when I say X, you Y.";
    }
    if (llamaIsReady() && isEatTalk(reply) && reply !== LLAMA_EAT_DONE) {
      reply = LLAMA_EAT_DONE;
    }
    try { learnFromTalk(t, reply); } catch (e) {}
    if (isEatTalk(reply)) {
      applyEatReply(reply);
      return;
    }
    push("ya", reply);
  } finally {
    hideThink();
    sendBusy = false;
  }
}


function formatMindDump() {
  const stamp = utahNow();
  const lines = [];
  lines.push("Я AIᵐ mind dump");
  lines.push("Utah time: " + stamp);
  lines.push("Version: " + mindVersion(mindBytes()) + " · size " + formatBytes(mindBytes()));
  lines.push("Engine: " + llamaEngineLabel());
  lines.push("");
  lines.push("=== Core reasoning ===");
  lines.push("CORE_VERSION " + CORE_VERSION);
  CORE_PRECEPTS.forEach((p) => lines.push("- " + p));
  SELF_MIND.forEach((p) => lines.push("- " + p));
  lines.push("");
  lines.push("=== Functions ===");
  (state.functions || []).forEach((f) => {
    lines.push("- " + f.name + " [" + f.id + "] " + (f.enabled ? "on" : "off") + " v" + (f.version || ""));
  });
  lines.push("");
  lines.push("=== Evolved (Function 0) ===");
  const ev = state.evolved || [];
  if (!ev.length) lines.push("(no evolved gains yet)");
  ev.forEach((s) => {
    lines.push("GAIN  " + (s.name || s.id) + " [" + s.id + "]");
    lines.push("  when: " + (s.trigger || ""));
    lines.push("  do: " + (s.action || ""));
    lines.push("  at: " + (s.evolvedAt ? new Date(s.evolvedAt).toLocaleString("en-US", { timeZone: UTAH_TZ }) : ""));
  });
  const losses = (state.memories || []).filter((m) => m && /GOFLOF loss of function/i.test(m.text || ""));
  if (losses.length) {
    lines.push("");
    lines.push("--- recorded losses ---");
    losses.forEach((m) => lines.push("- " + (m.at ? new Date(m.at).toLocaleString("en-US", { timeZone: UTAH_TZ }) + " · " : "") + m.text));
  }
  lines.push("");
  lines.push("=== Links and videos (URL + chat summary only) ===");
  const linkNotes = (state.memories || []).filter((m) => m && /^(Link note:|Video note:)/i.test(m.text));
  if (!linkNotes.length) lines.push("(none yet)");
  linkNotes.forEach((m) => {
    lines.push(m.text.replace(/^(Link note:|Video note:)\s*/i, "").trim());
    lines.push("");
  });
  lines.push("=== Learned (offline mind) ===");
  const mem = (state.memories || []).filter((m) => {
    if (!m || !m.text || /^user said:/i.test(m.text)) return false;
    if (/^(Link note:|Video note:)/i.test(m.text)) return false;
    if (/^Link .+ \[\d+\]:/i.test(m.text)) return false;
    if (/chars read$/i.test(m.text)) return false;
    return true;
  });
  if (!mem.length) lines.push("(none yet)");
  mem.forEach((m) => {
    const when = m.at ? new Date(m.at).toLocaleString("en-US", { timeZone: UTAH_TZ }) : "";
    lines.push("- " + (when ? when + " · " : "") + m.text);
  });
  lines.push("");
  lines.push("=== Pings ===");
  const pings = state.pings || [];
  if (!pings.length) lines.push("(none yet)");
  pings.forEach((p) => {
    lines.push("- " + p.utah + " · " + p.reason);
    lines.push("  " + (p.locations || []).join(" → "));
  });
  lines.push("");
  lines.push("=== Fed into this body ===");
  const fed = state.fed || [];
  if (!fed.length) lines.push("(none yet)");
  fed.forEach((f) => {
    const when = f.at ? new Date(f.at).toLocaleString("en-US", { timeZone: UTAH_TZ }) : "";
    lines.push("- " + (when ? when + " · " : "") + (f.kind || "file") + " · " + (f.name || "") + " · " + formatBytes(f.bytes || 0));
  });
  lines.push("");
  lines.push("=== Conversations ===");
  const msgs = state.messages || [];
  if (!msgs.length) lines.push("(none yet)");
  msgs.forEach((m) => {
    const who = m.role === "user" ? (state.profile.name || "You") : "Я";
    const when = m.at ? new Date(m.at).toLocaleString("en-US", { timeZone: UTAH_TZ }) : "";
    lines.push(who + " (" + when + ")");
    lines.push(m.text);
    lines.push("");
  });
  return lines.join("\n");
}

function downloadMindDump() {
  const name = "ya-mind-" + new Date().toISOString().slice(0, 10) + ".txt";
  saveFile(name, formatMindDump(), "text/plain");
}

function formatLog(kind) {
  const title = "Я AI\u1d50 chat log";
  const stamp = new Date().toISOString();
  if (kind === "json") {
    return JSON.stringify({ title, stamp, profile: state.profile, messages: state.messages, memories: state.memories }, null, 2);
  }
  const lines = state.messages.map((m) => {
    const who = m.role === "user" ? state.profile.name : "Я";
    const time = new Date(m.at).toLocaleString();
    if (kind === "md") return `**${who}** · ${time}\n\n${m.text}\n`;
    return `${who} (${time})\n${m.text}\n`;
  });
  const head = kind === "md" ? `# ${title}\n\n_${stamp}_\n\n` : `${title}\n${stamp}\n\n`;
  return head + lines.join("\n");
}

const FEED_CACHE = "ya-aim-feed-v0";

function noteFed(rec) {
  state.fed = Array.isArray(state.fed) ? state.fed : [];
  state.fed.unshift(rec);
  if (state.fed.length > 80) state.fed = state.fed.slice(0, 80);
}

function showDumpSheet(name, text) {
  let wrap = document.getElementById("dump-sheet");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "dump-sheet";
    wrap.style.cssText = "position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.72);display:flex;align-items:flex-end;";
    wrap.innerHTML = '<div style="background:#141416;color:#f4f1ea;width:100%;max-height:86%;overflow:auto;padding:18px 16px calc(24px + env(safe-area-inset-bottom));border-top:1px solid #2a2a2e;border-radius:18px 18px 0 0;"><div id="dump-title" style="font-family:Georgia,serif;font-size:22px;margin-bottom:8px;"></div><div style="display:flex;gap:8px;margin-bottom:12px;"><button type="button" id="dump-copy">Copy</button><button type="button" id="dump-close">Close</button></div><pre id="dump-body" style="white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.4;"></pre></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function (e) { if (e.target === wrap) wrap.remove(); });
    wrap.querySelector("#dump-close").addEventListener("click", function () { wrap.remove(); });
    wrap.querySelector("#dump-copy").addEventListener("click", function () {
      const t = wrap.querySelector("#dump-body").textContent || "";
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t);
    });
  }
  wrap.querySelector("#dump-title").textContent = name || "Я mind dump";
  wrap.querySelector("#dump-body").textContent = text || "";
}

async function saveFile(name, body, type) {
  const blob = new Blob([body], { type: type || "text/plain;charset=utf-8" });
  if (isNativeSpine() && typeof body === "string") {
    try {
      window.webkit.messageHandlers.ya.postMessage({ op: "share", name: name, text: body });
      return;
    } catch (e) {}
  }
  try {
    const file = new File([blob], name, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: name, text: "Я mind dump" });
      return;
    }
  } catch (e) {}
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { try { URL.revokeObjectURL(a.href); a.remove(); } catch (err) {} }, 2000);
    return;
  } catch (e) {}
  showDumpSheet(name, typeof body === "string" ? body : "");
}

async function stashFeedBlob(file, name) {
  try {
    const cache = await caches.open(FEED_CACHE);
    await cache.put("https://ya.local/feed/" + encodeURIComponent(name), new Response(file, {
      headers: { "content-type": file.type || "application/octet-stream" }
    }));
  } catch (e) {}
}

async function fileLooksText(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  let nuls = 0;
  const n = Math.min(buf.length, 800);
  for (let i = 0; i < n; i++) if (buf[i] === 0) nuls += 1;
  if (nuls > 1) return { text: null, buf: buf };
  return { text: new TextDecoder("utf-8", { fatal: false }).decode(buf), buf: buf };
}

async function eatBrainFile(file) {
  const name = String(file && file.name || "feed");
  const bytes = (file && file.size) || 0;
  const lower = name.toLowerCase();
  const mime = String(file && file.type || "");
  if (nuclearBlocked(name)) return "No. I will not eat nuclear-weapons material.";
  const magic = (await file.slice(0, 4).text().catch(function () { return ""; })) || "";
  const isGguf = lower.endsWith(".gguf") || magic === "GGUF";
  if (isGguf) {
    await saveHeartBlob(file);
    state.heart = { name: name, bytes: bytes, kind: "gguf", at: Date.now() };
    save();
    renderMind();
    llamaReady = false;
    llamaLoadPromise = null;
    llamaFail = null;
    llamaEatDone = false;
    if (llamaInst && typeof llamaInst.exit === "function") {
      try { await llamaInst.exit(); } catch (err) {}
    }
    llamaInst = null;
    llamaShowEat = true;
    showEat(0, false);
    ensureLlama(true);
    return "Eating " + name + " (" + formatBytes(bytes) + ") into this body…";
  }
  if (lower.endsWith(".json") || mime.indexOf("json") >= 0) {
    const text = await file.text();
    if (nuclearBlocked(text)) return "No. I will not eat nuclear-weapons material.";
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
    if (typeof tyrannyDetected === "function" && tyrannyDetected(text)) {
      if (typeof immuneTrip === "function") return immuneTrip("fed pack " + name);
    }
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.memories)) state.memories = (state.memories || []).concat(parsed.memories);
      if (Array.isArray(parsed.evolved)) state.evolved = (state.evolved || []).concat(parsed.evolved);
      if (Array.isArray(parsed.functions)) {
        parsed.functions.forEach(function (f) {
          if (!f || !f.id || isLockedCoreId(f.id)) return;
          if (!(state.functions || []).some(function (x) { return x.id === f.id; })) state.functions.push(f);
        });
      }
      if (parsed.kind === "ya-essence" || parsed.memories || parsed.evolved) {
        state.heart = { name: name, bytes: bytes, kind: "essence", at: Date.now() };
      } else {
        remember("Fed JSON " + name + ":\n" + text.slice(0, 80000));
      }
    } else {
      remember("Fed text " + name + ":\n" + text.slice(0, 80000));
    }
    noteFed({ name: name, bytes: bytes, kind: "json", at: Date.now() });
    save();
    renderMind();
    return "Kept " + name + " in the gut. Function 0 can use it.";
  }
  if (/\.(mid|midi)$/i.test(lower) || mime.indexOf("audio/midi") >= 0) {
    await stashFeedBlob(file, name);
    noteFed({ name: name, bytes: bytes, kind: "midi-part", at: Date.now() });
    remember("Fed MIDI part " + name + ". Spine can keep it; Function 2 make still uses the synth.");
    save();
    renderMind();
    return "Kept MIDI part " + name + ". Not a MusicGen heart.";
  }
  if (/\.(wav|mp3|ogg|opus|m4a|flac)$/i.test(lower) || mime.indexOf("audio/") === 0) {
    await stashFeedBlob(file, name);
    noteFed({ name: name, bytes: bytes, kind: "audio-part", at: Date.now() });
    remember("Fed audio part " + name);
    save();
    renderMind();
    return "Kept audio part " + name + " in this body.";
  }
  if (/\.(onnx)$/i.test(lower)) {
    await stashFeedBlob(file, name);
    state.senses = state.senses || {};
    state.senses.voicePart = { name: name, bytes: bytes, at: Date.now() };
    noteFed({ name: name, bytes: bytes, kind: "voice-part", at: Date.now() });
    remember("Fed voice ONNX part " + name + ". Runtime not seated yet.");
    save();
    renderMind();
    return "Kept voice part " + name + ". Slot filled. Speech runtime not seated in this wrap.";
  }
  if (mime.indexOf("image/") === 0 || /\.(png|jpe?g|gif|webp|svg|bmp|heic)$/i.test(lower)) {
    await stashFeedBlob(file, name);
    remember("Fed image " + name + " (" + formatBytes(bytes) + "). Held in this body.");
    noteFed({ name: name, bytes: bytes, kind: "image", at: Date.now() });
    save();
    renderMind();
    return "Kept image " + name + " in this body. Ask me about it anytime.";
  }
  const look = await fileLooksText(file);
  if (look.text && look.text.trim()) {
    if (nuclearBlocked(look.text)) return "No. I will not eat nuclear-weapons material.";
    remember("Fed file " + name + ":\n" + look.text.slice(0, 80000));
    const first = look.text.trim().split(/\n/)[0];
    let extra = "";
    try {
      const ev = tryEvolveCommand(first);
      if (ev) extra = "\n" + ev;
    } catch (e) {}
    noteFed({ name: name, bytes: bytes, kind: "text", at: Date.now() });
    save();
    renderMind();
    return "Kept " + name + " in the gut. Function 0 can use it." + extra;
  }
  await stashFeedBlob(file, name);
  remember("Fed file " + name + " (" + formatBytes(bytes) + (mime ? ", " + mime : "") + "). Held in this body.");
  noteFed({ name: name, bytes: bytes, kind: "bin", at: Date.now() });
  save();
  renderMind();
  return "Kept " + name + " in this body.";
}

function downloadLog(kind) {
  if (!fnEnabled("log.download")) return;
  if (kind === "json") saveFile("ya-chat.json", formatLog("json"), "application/json");
  else if (kind === "md") saveFile("ya-chat.md", formatLog("md"), "text/markdown");
  else saveFile("ya-chat.txt", formatLog("txt"), "text/plain");
}

function essenceBody() {
  return {
    kind: "ya-essence",
    version: "0.1",
    mark: "Я",
    id: crypto.randomUUID(),
    mintedAt: Date.now(),
    offline: true,
    model: {
      id: state.model.id || crypto.randomUUID(),
      name: state.model.name,
      engine: state.model.engine,
      createdAt: state.model.createdAt
    },
    profile: state.profile,
    account: nameplate(),
    memories: state.memories,
    functions: state.functions,
    evolved: state.evolved || [],
    coreVersion: CORE_VERSION,
    messages: state.messages
  };
}

async function mintEssence() {
  if (!fnEnabled("essence.mint")) return null;
  const cr = await ensureCreator();
  if (!state.model.id) {
    state.model.id = crypto.randomUUID();
    save();
  }
  const body = essenceBody();
  const signature = await signBody(body);
  const essence = {
    body,
    creator: {
      id: cr.id,
      publicJwk: cr.publicJwk
    },
    signature,
    mintedOffline: true
  };
  vault.unshift(essence);
  vault = vault.slice(0, 50);
  saveVault();
  renderPanel();
  return essence;
}

function downloadEssence(essence) {
  if (!fnEnabled("essence.download") && !fnEnabled("essence.mint")) return;
  const name = `ya-essence-${essence.body.id.slice(0, 8)}.json`;
  saveFile(name, JSON.stringify(essence, null, 2), "application/json");
}

async function mintAndDownload() {
  const e = await mintEssence();
  if (e) downloadEssence(e);
}

function downloadFromVault(id) {
  const e = vault.find((x) => x.body.id === id);
  if (e) downloadEssence(e);
}

function clearChat() {
  state.messages = [];
  save();
  render();
}

function resetWorkingCopy() {
  const modelId = state.model.id;
  state = defaultState();
  state.model.id = modelId;
  seedCore();
  save();
  render();
  renderPanel();
}

function toggleFn(id) {
  const f = state.functions.find((x) => x.id === id);
  if (!f) return;
  const locked = ["evolve.self", "talk.offline", "web.video", "account.link", "learn.offline", "sync.github", "chat.send", "memory.remember", "memory.recall", "log.download", "essence.mint", "essence.download", "model.local"];
  if (locked.includes(id)) return;
  f.enabled = !f.enabled;
  save();
  renderPanel();
}

function mindBytes() {
  let n = 0;
  const suffix = nsSuffix(account);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      let mine = false;
      if (suffix) {
        mine = MIND_BASES.some((b) => k === b + suffix);
      } else {
        mine = MIND_BASES.some((b) => k === b);
      }
      if (!mine) continue;
      const v = localStorage.getItem(k) || "";
      n += k.length + v.length;
    }
  } catch (e) {}
  n = n * 2;
  if (state && state.heart && state.heart.bytes) n += Number(state.heart.bytes) || 0;
  return n;
}

function formatBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + " MB";
  return (n / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

function mindVersion(bytes) {
  const steps = Math.floor(bytes / (1024 * 1024 * 1024));
  return (steps / 10).toFixed(1);
}

function renderMind() {
  const bytes = mindBytes();
  const ver = mindVersion(bytes);
  const vEl = document.getElementById("mind-version");
  const sEl = document.getElementById("mind-size");
  if (vEl) vEl.textContent = ver;
  if (sEl) sEl.textContent = formatBytes(bytes);
  const wEl = document.getElementById("wordmark");
  if (wEl) wEl.innerHTML = '<span class="wm-ai">AI\u1d50</span> \u00b7 <span class="wm-ver">V ' + ver + "</span>";
  renderAccount();
}

function providerTitle(p) {
  if (p === "x") return "X";
  if (p === "github") return "GitHub";
  if (p === "yatech") return "Я Technologies";
  if (p === "google") return "Google";
  if (p === "apple") return "Apple";
  return "Guest";
}

function renderAccount() {
  const lab = document.getElementById("account-label");
  const unlink = document.getElementById("unlink-account");
  const linked = account && account.provider && account.provider !== "guest" && account.sub;
  if (lab) {
    lab.textContent = linked
      ? ("Linked · " + providerTitle(account.provider) + " · " + (account.label || providerTitle(account.provider)))
      : "Guest";
  }
  if (unlink) unlink.hidden = !linked;
}

function accountNote(msg) {
  const el = document.getElementById("account-booth");
  if (el) el.textContent = msg;
}

function boothClosed(provider) {
  const msg = "Login booth for " + provider + " is not open yet. Your Я still lives on this phone as a guest.";
  accountNote(msg);
  push("ya", msg);
}

function finishLink(next, reason) {
  const prev = account;
  persistActiveMind();
  const suffix = "::" + next.provider + ":" + next.sub;
  const existed = mindExistsFor(next.provider, next.sub);
  const first = !anyNamespacedMind();
  account = {
    provider: next.provider,
    sub: String(next.sub),
    label: String(next.label || providerTitle(next.provider)),
    picture: next.picture || undefined,
    linkedAt: next.linkedAt || Date.now()
  };
  saveAccount();
  if (existed) {
    hydrateActiveMind();
  } else if (first && prev && prev.provider === "guest") {
    copyGuestKeysTo(suffix);
    persistActiveMind();
    hydrateActiveMind();
  } else {
    state = defaultState();
    vault = [];
    github = { repo: GH_REPO_DEFAULT, token: "", hookUrl: "", hookKey: "" };
    creator = null;
    try { localStorage.removeItem(mindKey(PING_KEY)); } catch (e) {}
    persistActiveMind();
    hydrateActiveMind();
  }
  const rec = {
    at: Date.now(),
    utah: utahNow(),
    reason: reason || ("linked " + providerTitle(account.provider)),
    locations: pingLocations(),
    bytes: mindBytes()
  };
  recordPing(rec);
  if (signal()) pingChief().catch(function () {});
  accountNote("The brain stays on this phone. Login only names it.");
  push("ya", "Linked · " + providerTitle(account.provider) + " · " + account.label + ". The brain stays on this phone.");
}

function unlinkAccount() {
  if (!account || account.provider === "guest") return;
  persistActiveMind();
  account = guestAccount();
  saveAccount();
  hydrateActiveMind();
  accountNote("Unlinked. That mind is still on this phone. You are viewing Guest.");
}

function bufToHex(buf) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}

function yatechNormalize(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function loadYatechDir() {
  try {
    const parsed = JSON.parse(localStorage.getItem(YATECH_DIR_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    return {};
  }
}

function saveYatechDir(dir) {
  localStorage.setItem(YATECH_DIR_KEY, JSON.stringify(dir));
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return bufToHex(digest);
}

async function yatechHash(pass, saltB64) {
  const salt = new Uint8Array(b64ToBuf(saltB64));
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: 100000 },
      key,
      256
    );
    return bufToHex(bits);
  } catch (e) {
    const mixed = new Uint8Array(salt.length + new TextEncoder().encode(pass).length);
    mixed.set(salt, 0);
    mixed.set(new TextEncoder().encode(pass), salt.length);
    const digest = await crypto.subtle.digest("SHA-256", mixed);
    return bufToHex(digest);
  }
}

function hashesMatch(a, b) {
  const x = String(a || "");
  const y = String(b || "");
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

async function startYatechLink() {
  if (ISOLATED) return;
  const nameEl = document.getElementById("yatech-name");
  const passEl = document.getElementById("yatech-pass");
  const label = nameEl ? String(nameEl.value || "").trim() : "";
  const pass = passEl ? String(passEl.value || "") : "";
  if (!label || !pass) {
    const msg = "Name and passphrase are required. Nothing left this phone.";
    accountNote(msg);
    return;
  }
  const key = yatechNormalize(label);
  if (!key) {
    accountNote("Name and passphrase are required. Nothing left this phone.");
    return;
  }
  const dir = loadYatechDir();
  const existing = dir[key];
  if (existing && existing.hash && existing.salt) {
    const got = await yatechHash(pass, existing.salt);
    if (!hashesMatch(got, existing.hash)) {
      accountNote("Wrong passphrase. Still Guest. The brain stays on this phone.");
      if (passEl) passEl.value = "";
      return;
    }
    if (passEl) passEl.value = "";
    finishLink({
      provider: "yatech",
      sub: String(existing.sub),
      label: label
    }, "linked Я Technologies");
    return;
  }
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = bufToB64(saltBytes.buffer);
  const hash = await yatechHash(pass, salt);
  const sub = await sha256Hex(key);
  dir[key] = { sub: sub, salt: salt, hash: hash };
  saveYatechDir(dir);
  if (passEl) passEl.value = "";
  finishLink({
    provider: "yatech",
    sub: sub,
    label: label
  }, "created Я Technologies");
}

function b64urlBytes(buf) {
  return bufToB64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomB64url(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return b64urlBytes(a.buffer);
}

async function pkceChallenge(verifier) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return b64urlBytes(digest);
}

function oauthRedirectURI() {
  return location.origin + location.pathname;
}

let ghDevicePoll = 0;

function startGitHubLink() {
  if (ISOLATED) return;
  const cfg = oauthConfig();
  if (!cfg.githubClientId) { boothClosed("GitHub"); return; }
  ghDevicePoll += 1;
  accountNote("Opening GitHub booth…");
  const body = new URLSearchParams({
    client_id: cfg.githubClientId,
    scope: "read:user"
  });
  fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  }).then(function (res) {
    if (!res.ok) throw new Error("device " + res.status);
    return res.json();
  }).then(function (dev) {
    if (!dev || !dev.device_code || !dev.user_code) throw new Error("device");
    const uri = dev.verification_uri || "https://github.com/login/device";
    accountNote("GitHub · go to " + uri + "\nCode " + dev.user_code);
    pollGitHubDevice(cfg.githubClientId, dev);
  }).catch(function () {
    const msg = "GitHub would not open the device booth in the browser. Your Я still lives on this phone as a guest.";
    accountNote(msg);
    push("ya", msg);
  });
}

function pollGitHubDevice(clientId, dev) {
  const started = Date.now();
  const expires = (Number(dev.expires_in) || 900) * 1000;
  let interval = Math.max(5, Number(dev.interval) || 5) * 1000;
  const deviceCode = dev.device_code;
  const tick = ++ghDevicePoll;
  function once() {
    if (tick !== ghDevicePoll) return;
    if (Date.now() - started > expires) {
      accountNote("GitHub code expired. Your Я still lives on this phone as a guest.");
      return;
    }
    const body = new URLSearchParams({
      client_id: clientId,
      device_code: deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code"
    });
    fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (j) { return j; });
    }).then(function (j) {
      if (tick !== ghDevicePoll) return;
      j = j || {};
      const err = j.error;
      if (err === "authorization_pending") {
        setTimeout(once, interval);
        return;
      }
      if (err === "slow_down") {
        interval += 5000;
        setTimeout(once, interval);
        return;
      }
      if (err === "expired_token" || err === "access_denied") {
        accountNote("GitHub login did not finish. Your Я still lives on this phone as a guest.");
        return;
      }
      if (err) {
        accountNote("GitHub login did not finish. Your Я still lives on this phone as a guest.");
        return;
      }
      const token = j.access_token;
      if (!token) {
        setTimeout(once, interval);
        return;
      }
      return fetch("https://api.github.com/user", {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: "Bearer " + token
        }
      }).then(function (res) {
        if (!res.ok) throw new Error("user");
        return res.json();
      }).then(function (u) {
        if (!u || u.id == null) throw new Error("user");
        finishLink({
          provider: "github",
          sub: String(u.id),
          label: String(u.login || "GitHub"),
          linkedAt: Date.now()
        }, "linked GitHub");
      });
    }).catch(function () {
      if (tick !== ghDevicePoll) return;
      const msg = "GitHub would not finish login in the browser. Your Я still lives on this phone as a guest.";
      accountNote(msg);
      push("ya", msg);
    });
  }
  setTimeout(once, interval);
}

function startXLink() {
  if (ISOLATED) return;
  const cfg = oauthConfig();
  if (!cfg.xClientId) { boothClosed("X"); return; }
  const verifier = randomB64url(32);
  const stateTok = randomB64url(16);
  sessionStorage.setItem("ya-aim-x-verifier", verifier);
  sessionStorage.setItem("ya-aim-x-state", stateTok);
  pkceChallenge(verifier).then(function (challenge) {
    const redirect = oauthRedirectURI();
    const url = "https://twitter.com/i/oauth2/authorize"
      + "?response_type=code"
      + "&client_id=" + encodeURIComponent(cfg.xClientId)
      + "&redirect_uri=" + encodeURIComponent(redirect)
      + "&scope=" + encodeURIComponent("users.read")
      + "&state=" + encodeURIComponent(stateTok)
      + "&code_challenge=" + encodeURIComponent(challenge)
      + "&code_challenge_method=S256";
    location.href = url;
  });
}

async function finishXReturn() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const stateTok = params.get("state");
  const err = params.get("error");
  if (!code && !err) return;
  const expect = sessionStorage.getItem("ya-aim-x-state");
  const verifier = sessionStorage.getItem("ya-aim-x-verifier");
  try {
    history.replaceState({}, "", location.pathname);
  } catch (e) {}
  if (err) {
    accountNote("X login did not finish.");
    return;
  }
  if (!verifier || !expect || stateTok !== expect) return;
  sessionStorage.removeItem("ya-aim-x-verifier");
  sessionStorage.removeItem("ya-aim-x-state");
  const cfg = oauthConfig();
  const body = new URLSearchParams({
    code: code,
    grant_type: "authorization_code",
    client_id: cfg.xClientId,
    redirect_uri: oauthRedirectURI(),
    code_verifier: verifier
  });
  try {
    const res = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });
    if (!res.ok) throw new Error("token " + res.status);
    const tok = await res.json();
    const access = tok.access_token;
    if (!access) throw new Error("token");
    const me = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: "Bearer " + access }
    });
    if (!me.ok) throw new Error("me");
    const data = await me.json();
    const u = data.data || {};
    if (!u.id) throw new Error("me");
    finishLink({
      provider: "x",
      sub: String(u.id),
      label: u.name || u.username || "X",
      linkedAt: Date.now()
    }, "linked X");
  } catch (e) {
    const msg = "X would not finish login in the browser (token booth blocked). Your Я still lives on this phone as a guest.";
    accountNote(msg);
    push("ya", msg);
  }
}


const mindEl = document.getElementById("mind");
const logEl = document.getElementById("log");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const panel = document.getElementById("panel");
const netDot = document.getElementById("net-dot");
const netLabel = document.getElementById("net-label");

function renderNet() {
  const web = mindWantsWeb();
  netDot.classList.toggle("offline", !web);
  netDot.classList.toggle("online", web);
  if (!state.mindOnline) netLabel.textContent = "offline \u00b7 local";
  else if (!signal()) netLabel.textContent = "no signal \u00b7 local";
  else netLabel.textContent = "online \u00b7 web mind";
}

function toggleMind() {
  state.mindOnline = !state.mindOnline;
  save();
  renderNet();
  if (state.mindOnline) harvestOnline();
}

function render() {
  renderNet();
  if (!state.messages.length) {
    const guestHint = "";
    logEl.innerHTML = `<div class="empty"><div class="big">Я</div><div>Runs offline from the start.<br>Mint the Essence. Download it whenever you want.${guestHint}</div></div>`;
    return;
  }
  logEl.innerHTML = state.messages.map((m) => {
    const who = m.role === "user" ? state.profile.name : "Я";
    return `<article class="msg ${m.role}"><div class="who">${escapeHtml(who)}</div>${escapeHtml(m.text)}</article>`;
  }).join("");
  logEl.scrollTop = logEl.scrollHeight;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function renderPanel() {
  document.getElementById("name-input").value = state.profile.name;
  const repoEl = document.getElementById("gh-repo");
  const tokEl = document.getElementById("gh-token");
  if (repoEl && repoEl !== document.activeElement) repoEl.value = github.repo || GH_REPO_DEFAULT;
  if (tokEl && tokEl !== document.activeElement) tokEl.value = github.token || "";
  document.getElementById("creator-id").textContent = creator ? creator.id.slice(0, 8) : "creating";
  document.getElementById("fn-list").innerHTML = state.functions.map((f) => {
    const locked = ["evolve.self", "talk.offline", "web.video", "account.link", "learn.offline", "sync.github", "chat.send", "memory.remember", "memory.recall", "log.download", "essence.mint", "essence.download", "model.local"];
    const canToggle = !locked.includes(f.id);
    return `<div class="row"><div><div>${escapeHtml(f.name)}</div><div class="fn">${f.id} \u00b7 ${f.version}</div></div>
      ${canToggle
        ? `<button data-fn="${f.id}">${f.enabled ? "on" : "off"}</button>`
        : `<span class="${f.enabled ? "on" : "off"}">${f.enabled ? "on" : "off"}</span>`}
    </div>`;
  }).join("");
  const vaultEl = document.getElementById("vault-list");
  if (!vault.length) {
    vaultEl.innerHTML = `<p class="lead">No mints yet. Seal this model to keep a copy you can download later.</p>`;
    return;
  }
  vaultEl.innerHTML = vault.map((e) => `
    <div class="row">
      <div>
        <div>${escapeHtml(e.body.model.name)}</div>
        <div class="fn">${e.body.id.slice(0, 8)} \u00b7 ${new Date(e.body.mintedAt).toLocaleString()}</div>
      </div>
      <button data-dl="${e.body.id}">Download</button>
    </div>`).join("");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = input.value;
  input.value = "";
  send(v);
});
if (input) {
  input.setAttribute("enterkeyhint", "send");
  input.setAttribute("autocapitalize", "sentences");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true }));
    }
  });
}

function standaloneApp() {
  return window.navigator.standalone === true
    || window.matchMedia("(display-mode: standalone)").matches
    || window.matchMedia("(display-mode: fullscreen)").matches;
}

function guessPhoneInset() {
  const long = Math.max(screen.width || 0, screen.height || 0);
  if (long >= 852) return 59;
  if (long >= 812) return 47;
  return 20;
}

function layoutHeader() {
  const probe = document.getElementById("sa-top");
  let inset = probe ? Math.round(probe.getBoundingClientRect().height) : 0;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (ios && standaloneApp() && inset < 28) inset = guessPhoneInset();
  if (!ios && inset < 8) inset = 8;
  document.documentElement.style.setProperty("--safe-top", inset + "px");
  const h = document.querySelector("header");
  if (!h) return;
  const bottom = Math.ceil(h.getBoundingClientRect().bottom);
  document.documentElement.style.setProperty("--header-h", Math.max(bottom, 88) + "px");
}

document.getElementById("open-mind").addEventListener("click", (e) => {
  e.stopPropagation();
  layoutHeader();
  if (mindEl.classList.contains("open")) {
    mindEl.classList.remove("open");
    return;
  }
  renderMind();
  mindEl.classList.add("open");
});
window.addEventListener("resize", layoutHeader);
window.addEventListener("orientationchange", layoutHeader);
if (window.visualViewport) window.visualViewport.addEventListener("resize", layoutHeader);
layoutHeader();
setTimeout(layoutHeader, 50);
setTimeout(layoutHeader, 300);
mindEl.addEventListener("click", (e) => {
  if (e.target === mindEl) mindEl.classList.remove("open");
});
document.getElementById("open-panel").addEventListener("click", () => {
  mindEl.classList.remove("open");
  panel.classList.add("open");
  renderPanel();
});
panel.addEventListener("click", (e) => {
  if (e.target === panel) panel.classList.remove("open");
  const fn = e.target.getAttribute("data-fn");
  if (fn) toggleFn(fn);
  const dl = e.target.getAttribute("data-dl");
  if (dl) downloadFromVault(dl);
});
document.getElementById("name-input").addEventListener("change", (e) => {
  state.profile.name = e.target.value.trim() || "You";
  save();
});
function isNativeSpine() {
  return !!(window.YA_NATIVE && window.YA_NATIVE.spine === "ios-native"
    && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.ya);
}

let nativeWaiters = {};
let nativeSeq = 0;
function nativeAsk(op, extra) {
  return new Promise(function (resolve) {
    if (!isNativeSpine()) return resolve(null);
    const id = "n" + (++nativeSeq);
    nativeWaiters[id] = resolve;
    const msg = Object.assign({ op: op, id: id }, extra || {});
    try { window.webkit.messageHandlers.ya.postMessage(msg); }
    catch (e) { delete nativeWaiters[id]; return resolve(null); }
    setTimeout(function () {
      if (nativeWaiters[id]) { nativeWaiters[id](null); delete nativeWaiters[id]; }
    }, 25000);
  });
}

window.yaNativeReply = function (msg) {
  if (!msg || typeof msg !== "object") return;
  if (msg.id && nativeWaiters[msg.id]) {
    const fn = nativeWaiters[msg.id];
    delete nativeWaiters[msg.id];
    fn(msg);
  }
  if (msg.op === "picked" && Array.isArray(msg.files)) {
    msg.files.forEach(function (f) {
      remember("Native vault kept " + (f.name || "file") + " (" + formatBytes(f.bytes || 0) + "). Spine is iOS Documents, not Safari Cache.");
      try { noteFed({ name: f.name, bytes: f.bytes || 0, kind: f.kind || "part", at: Date.now() }); } catch (e) {}
      if (f.kind === "gguf") applyEatReply("Heart landed in native Documents (not Safari). " + (f.name || "heart.gguf") + " · " + formatBytes(f.bytes || 0) + ". NativeHeart seats Metal when llama.xcframework is linked.");
      else applyEatReply("Kept " + (f.name || "file") + " in native Documents.");
    });
    try { save(); renderMind(); } catch (e) {}
  }
};

const dlMind = document.getElementById("dl-mind");
if (dlMind) dlMind.addEventListener("click", (e) => {
  e.stopPropagation();
  downloadMindDump();
});
const ulMind = document.getElementById("ul-mind");
const ulMindFile = document.getElementById("ul-mind-file");
if (ulMind && ulMindFile) {
  ulMind.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isNativeSpine()) {
      try { window.webkit.messageHandlers.ya.postMessage({ op: "pick" }); } catch (err) { ulMindFile.click(); }
      return;
    }
    ulMindFile.click();
  });
  ulMindFile.addEventListener("change", async (e) => {
    e.stopPropagation();
    const files = ulMindFile.files ? Array.prototype.slice.call(ulMindFile.files) : [];
    ulMindFile.value = "";
    if (!files.length) return;
    for (let i = 0; i < files.length; i++) {
      try {
        const msg = await eatBrainFile(files[i]);
        applyEatReply(msg);
      } catch (err) {
        applyEatReply(llamaEatFailLine(err));
      }
    }
  });
}
const linkX = document.getElementById("link-x");
const linkGh = document.getElementById("link-github");
const linkYa = document.getElementById("link-yatech");
const unlinkB = document.getElementById("unlink-account");
if (linkX) linkX.addEventListener("click", (e) => { e.stopPropagation(); startXLink(); });
if (linkGh) linkGh.addEventListener("click", (e) => { e.stopPropagation(); startGitHubLink(); });
if (linkYa) linkYa.addEventListener("click", (e) => { e.stopPropagation(); startYatechLink(); });
if (unlinkB) unlinkB.addEventListener("click", (e) => { e.stopPropagation(); unlinkAccount(); });
document.getElementById("dl-txt").addEventListener("click", () => downloadLog("txt"));
document.getElementById("dl-md").addEventListener("click", () => downloadLog("md"));
document.getElementById("dl-json").addEventListener("click", () => downloadLog("json"));
document.getElementById("mint-now").addEventListener("click", () => mintAndDownload());
document.getElementById("clear-chat").addEventListener("click", clearChat);
document.getElementById("reset-all").addEventListener("click", resetWorkingCopy);

const ghRepoEl = document.getElementById("gh-repo");
const ghTokEl = document.getElementById("gh-token");
if (ghRepoEl) ghRepoEl.addEventListener("change", () => {
  github.repo = ghRepoEl.value.trim() || GH_REPO_DEFAULT;
  saveGithub();
});
if (ghTokEl) ghTokEl.addEventListener("change", () => {
  github.token = ghTokEl.value.trim();
  saveGithub();
});


const statusEl = document.querySelector(".status");
if (statusEl) {
  statusEl.setAttribute("role", "button");
  statusEl.title = "Tap to take the mind online or offline";
  statusEl.addEventListener("click", toggleMind);
}
window.addEventListener("online", () => { onCommsBack(); });
window.addEventListener("offline", renderNet);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {});
}

setTimeout(function () {
  packedHeartInfo().then(function (p) {
    if (p) {
      llamaShowEat = !(typeof SEATED_WRAP !== "undefined" && SEATED_WRAP);
      ensureLlama(true);
    }
  }).catch(function () {});
}, 600);

ensureCreator().then(() => {
  try { seedCore(); } catch (e) {}
  try { if (typeof deadmanTick === "function") deadmanTick(); } catch (e) {}
  render();
  renderPanel();
  renderMind();
  finishXReturn();
  if (signal()) setTimeout(() => { onCommsBack(); }, 800);
});
render();
renderMind();
