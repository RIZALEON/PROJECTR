const STORE_KEY = "ya-aim-v0";
const CREATOR_KEY = "ya-aim-creator";
const VAULT_KEY = "ya-aim-vault";

const defaultState = () => ({
  profile: { name: "You", yaName: "Я" },
  mindOnline: false,
  model: {
    id: null,
    name: "Я local-memory",
    engine: "local-memory-v0",
    createdAt: Date.now()
  },
  memories: [],
  messages: [],
  functions: [
    { id: "chat.send", name: "Send message", enabled: true, version: "0.0.1" },
    { id: "memory.remember", name: "Remember facts", enabled: true, version: "0.0.1" },
    { id: "memory.recall", name: "Recall facts", enabled: true, version: "0.0.1" },
    { id: "log.download", name: "Download chat log", enabled: true, version: "0.0.1" },
    { id: "essence.mint", name: "Mint Essence", enabled: true, version: "0.1.0" },
    { id: "essence.download", name: "Download minted Essence", enabled: true, version: "0.1.0" },
    { id: "model.local", name: "On-device model", enabled: false, version: "stub" },
    { id: "web.search", name: "Web search (mind online)", enabled: true, version: "0.2.0" },
    { id: "model.remote", name: "Remote model", enabled: false, version: "stub" },
    { id: "voice.listen", name: "Voice in", enabled: false, version: "stub" },
    { id: "voice.speak", name: "Voice out", enabled: false, version: "stub" }
  ]
});

let state = load();
let creator = null;
let vault = loadVault();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      mindOnline: !!parsed.mindOnline,
      model: { ...base.model, ...(parsed.model || {}) },
      functions: mergeFunctions(base.functions, parsed.functions || [])
    };
  } catch {
    return defaultState();
  }
}

function mergeFunctions(base, saved) {
  const map = new Map(saved.map((f) => [f.id, f]));
  return base.map((f) => ({ ...f, ...map.get(f.id) }));
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function loadVault() {
  try {
    return JSON.parse(localStorage.getItem(VAULT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveVault() {
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
}

function signal() {
  return navigator.onLine;
}

function mindWantsWeb() {
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
  const saved = localStorage.getItem(CREATOR_KEY);
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
  localStorage.setItem(CREATOR_KEY, JSON.stringify(record));
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

function remember(text) {
  if (!fnEnabled("memory.remember")) return;
  const clean = text.trim();
  if (clean.length < 2) return;
  const fact = { id: crypto.randomUUID(), text: clean, at: Date.now() };
  state.memories.unshift(fact);
  state.memories = state.memories.slice(0, 200);
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
  const q = query.toLowerCase();
  const scored = state.memories.map((m) => {
    const hay = m.text.toLowerCase();
    let score = 0;
    q.split(/\W+/).filter(Boolean).forEach((w) => {
      if (hay.includes(w)) score += 1;
    });
    return { m, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map((s) => s.m);
}

function localEngine(userText) {
  extractMemories(userText);
  const q = userText.toLowerCase();
  const hits = recall(userText);

  if (/non[- ]?nuclear|anti[- ]?nuclear/.test(q)) {
    return "Yes. I am an anti-nuclear engine. I run on this device. I will not help with nuclear weapons.";
  }
  if (/^(hi|hello|hey|yo|good (morning|evening|afternoon))\b/.test(q)) {
    return `Hello${state.profile.name !== "You" ? ", " + state.profile.name : ""}. I am Я. Anti-nuclear. I run on this device. Network is optional.`;
  }
  if (/who are you|what are you|your name/.test(q)) {
    return "I am Я AI\u1d50. Offline first. The Essence of this model is minted by you, the creator, and can be downloaded again at any time.";
  }
  if (/what can you do|help|commands/.test(q)) {
    return "Say mint to seal this model's Essence.\nSay vault to list minted Essences.\nSay remember this: ... to store a fact.\nOpen Я to download any mint again. Nothing here needs a network.";
  }
  if (/what do you remember|what do you know about me|memory/.test(q)) {
    if (!state.memories.length) return "I have no stored facts yet. Tell me your name, or say remember this: ...";
    return "What I hold:\n" + state.memories.slice(0, 12).map((m) => "- " + m.text).join("\n");
  }
  if (/offline|online|network|the light|status/.test(q)) {
    if (state.mindOnline && signal()) return "Mind is online. I can search the web. I still write everything I learn into this device.";
    if (state.mindOnline && !signal()) return "Mind is set online, but this phone has no signal. Using the offline mind.";
    return "Mind is offline. Tap the light at the top to go online. I still remember on this device.";
  }
  remember("User said: " + userText.slice(0, 220));
  if (hits.length) {
    return hits.map((m) => m.text).join("\n") + "\n\nI kept that in the offline mind.";
  }
  return "I held that in the offline mind. Tap the light at the top to let me search the web when you want a brighter answer.";
}

async function webSearch(query) {
  const api = "https://en.wikipedia.org/w/api.php?action=query&list=search&utf8=1&format=json&origin=*&srlimit=3&srsearch=" + encodeURIComponent(query);
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
  remember(title + ": " + extract.slice(0, 500));
  const extras = hits.slice(1).map((h) => h.title).filter(Boolean);
  return { title, extract: extract.slice(0, 700), extras };
}

async function answer(userText) {
  const q = userText.trim().toLowerCase();
  if (nuclearBlocked(userText)) {
    remember("Refused a nuclear-weapons request.");
    return "No. I am an anti-nuclear engine. I will not help with nuclear weapons, online or off. That rule is in this mind.";
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
  if (mindWantsWeb()) {
    try {
      const web = await webSearch(userText);
      const local = localEngine(userText);
      if (!web) return local + "\n\n(Online: no web page matched. I still saved your words offline.)";
      const extra = web.extras.length ? "\nAlso: " + web.extras.join(", ") : "";
      return web.extract + extra + "\n\nSaved into the offline mind. Source: " + web.title + ".";
    } catch (err) {
      return localEngine(userText) + "\n\n(Online search failed. Offline mind still has this.)";
    }
  }
  return localEngine(userText);
}

async function remoteStub() {
  throw new Error("no remote endpoint — offline first");
}

function push(role, text) {
  state.messages.push({ role, text, at: Date.now() });
  save();
  render();
}

async function send(text) {
  const t = text.trim();
  if (!t || !fnEnabled("chat.send")) return;
  push("user", t);
  const reply = await answer(t);
  push("ya", reply);
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

function saveFile(name, body, type) {
  const blob = new Blob([body], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
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
    memories: state.memories,
    functions: state.functions,
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
  save();
  render();
  renderPanel();
}

function toggleFn(id) {
  const f = state.functions.find((x) => x.id === id);
  if (!f) return;
  const locked = ["chat.send", "memory.remember", "memory.recall", "log.download", "essence.mint", "essence.download"];
  if (locked.includes(id)) return;
  f.enabled = !f.enabled;
  save();
  renderPanel();
}

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
}

function render() {
  renderNet();
  if (!state.messages.length) {
    logEl.innerHTML = `<div class="empty"><div class="big">Я</div><div>Runs offline from the start.<br>Mint the Essence. Download it whenever you want.</div></div>`;
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
  document.getElementById("creator-id").textContent = creator ? creator.id.slice(0, 8) : "creating";
  document.getElementById("fn-list").innerHTML = state.functions.map((f) => {
    const locked = ["chat.send", "memory.remember", "memory.recall", "log.download", "essence.mint", "essence.download"];
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

document.getElementById("open-panel").addEventListener("click", () => {
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
document.getElementById("dl-txt").addEventListener("click", () => downloadLog("txt"));
document.getElementById("dl-md").addEventListener("click", () => downloadLog("md"));
document.getElementById("dl-json").addEventListener("click", () => downloadLog("json"));
document.getElementById("mint-now").addEventListener("click", () => mintAndDownload());
document.getElementById("clear-chat").addEventListener("click", clearChat);
document.getElementById("reset-all").addEventListener("click", resetWorkingCopy);

const statusEl = document.querySelector(".status");
if (statusEl) {
  statusEl.setAttribute("role", "button");
  statusEl.title = "Tap to take the mind online or offline";
  statusEl.addEventListener("click", toggleMind);
}
window.addEventListener("online", renderNet);
window.addEventListener("offline", renderNet);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

ensureCreator().then(() => {
  render();
  renderPanel();
});
render();
