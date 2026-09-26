(function (w) {
  'use strict';

  const STORAGE_KEY = 'ya-runtime-core-v0.1';
  const EVENT_NAME = 'ya:runtime';

  const STATES = Object.freeze({
    IDLE: 'idle', LISTENING: 'listening', THINKING: 'thinking', SEARCHING: 'searching', RESPONDING: 'responding',
    WORKING: 'working', EVOLVING: 'evolving', BUSY: 'busy', WARNING: 'warning', OFFLINE: 'offline', ERROR: 'error'
  });

  const VISUALS = Object.freeze({
    idle: 'ya-avatar--calm', listening: 'ya-avatar--calm', thinking: 'ya-avatar--thinking ya-avatar--ping-pong',
    searching: 'ya-avatar--searching ya-avatar--eyes-lit', responding: 'ya-avatar--responding ya-avatar--happy',
    working: 'ya-avatar--working ya-avatar--electric', evolving: 'ya-avatar--evolving ya-avatar--wings-energized',
    busy: 'ya-avatar--busy ya-avatar--vortex', warning: 'ya-avatar--warning ya-avatar--angry',
    offline: 'ya-avatar--offline ya-avatar--blank-eyes', error: 'ya-avatar--error ya-avatar--storm'
  });

  const PROTECTED = Object.freeze(['perception', 'memory', 'planner', 'actions', 'avatar', 'offline-storage']);
  const LOCAL_ACTIONS = Object.freeze(['remember', 'reply', 'save', 'open-local', 'summarize', 'label']);
  const MEDIA_KINDS = Object.freeze({ image: /^image\//i, video: /^video\//i, audio: /^audio\//i, document: /^(application\/(pdf|json|xml|rtf|msword|vnd\.)|text\/)/i });

  function now() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function initialState() {
    const components = {};
    PROTECTED.forEach(function (id) { components[id] = { id: id, version: 'core', protected: true, registeredAt: now() }; });
    return { schema: 1, runtimeVersion: '0.1', state: STATES.IDLE, detail: '', updatedAt: now(), components: components, media: [], actions: [], evolutions: [] };
  }
  function load() {
    try {
      const raw = w.localStorage && w.localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState();
      const parsed = JSON.parse(raw); const base = initialState(); const merged = Object.assign(base, parsed || {});
      merged.components = Object.assign(base.components, (parsed && parsed.components) || {});
      PROTECTED.forEach(function (id) { merged.components[id] = Object.assign({}, merged.components[id] || {}, { id: id, protected: true }); });
      return merged;
    } catch (e) { return initialState(); }
  }
  let data = load();
  const listeners = new Set();
  function persist() { try { if (w.localStorage) w.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {} }
  function applyVisualState() {
    if (!w.document || !w.document.documentElement) return;
    const root = w.document.documentElement;
    root.setAttribute('data-ya-runtime-state', data.state);
    root.setAttribute('data-ya-runtime-visual', VISUALS[data.state] || VISUALS.idle);
    if (w.document.body) {
      Object.keys(VISUALS).forEach(function (state) { String(VISUALS[state]).split(/\s+/).filter(Boolean).forEach(function (klass) { w.document.body.classList.remove(klass); }); });
      String(VISUALS[data.state] || VISUALS.idle).split(/\s+/).filter(Boolean).forEach(function (klass) { w.document.body.classList.add(klass); });
      w.document.body.setAttribute('data-ya-runtime-state', data.state);
    }
  }
  function snapshot() { return clone(data); }
  function emit(kind, payload) {
    const packet = { kind: kind, at: now(), payload: payload == null ? null : clone(payload), snapshot: snapshot() };
    listeners.forEach(function (listener) { try { listener(packet); } catch (e) {} });
    if (w.dispatchEvent && typeof w.CustomEvent === 'function') { try { w.dispatchEvent(new w.CustomEvent(EVENT_NAME, { detail: packet })); } catch (e) {} }
    return packet;
  }
  function validState(state) { return Object.keys(STATES).some(function (key) { return STATES[key] === state; }); }
  function setState(state, detail) {
    if (!validState(state)) throw new Error('Unknown runtime state: ' + state);
    data.state = state; data.detail = detail == null ? '' : String(detail); data.updatedAt = now(); persist(); applyVisualState();
    emit('state', { state: state, detail: data.detail, visual: VISUALS[state] }); return snapshot();
  }
  function on(listener) { if (typeof listener !== 'function') throw new TypeError('listener must be a function'); listeners.add(listener); return function () { listeners.delete(listener); }; }
  function register(id, version) {
    const cleanId = String(id || '').trim(); if (!cleanId) throw new Error('component id required');
    const existing = data.components[cleanId];
    if (existing && existing.protected && existing.version !== 'core' && String(version) !== existing.version) throw new Error('protected core component cannot be replaced: ' + cleanId);
    const record = { id: cleanId, version: String(version || '0'), protected: PROTECTED.indexOf(cleanId) >= 0, registeredAt: existing && existing.registeredAt ? existing.registeredAt : now(), updatedAt: now() };
    data.components[cleanId] = Object.assign({}, existing || {}, record); persist(); emit('component', record); return clone(record);
  }
  function mediaKind(file) {
    const type = String((file && file.type) || '').toLowerCase(); const name = String((file && file.name) || '').toLowerCase();
    if (MEDIA_KINDS.image.test(type) || /\.(png|jpe?g|gif|webp|heic|bmp|tiff?)$/.test(name)) return 'image';
    if (MEDIA_KINDS.video.test(type) || /\.(mp4|mov|m4v|webm|avi|mkv)$/.test(name)) return 'video';
    if (MEDIA_KINDS.audio.test(type) || /\.(mp3|m4a|wav|aac|flac|ogg)$/.test(name)) return 'audio';
    if (MEDIA_KINDS.document.test(type) || /\.(pdf|txt|md|json|csv|rtf|docx?|pptx?|xlsx?|html?)$/.test(name)) return 'document';
    return 'document';
  }
  function ingest(file) {
    if (!file || typeof file !== 'object') throw new TypeError('file required');
    const job = { id: 'media-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), kind: mediaKind(file), name: String(file.name || 'untitled'), type: String(file.type || 'application/octet-stream'), size: Number(file.size || 0), lastModified: Number(file.lastModified || 0), status: 'queued-local', engine: 'unassigned', createdAt: now() };
    data.media.push(job); if (data.media.length > 200) data.media = data.media.slice(-200); data.updatedAt = now(); persist(); emit('media', job); return clone(job);
  }
  function act(name, payload) {
    const action = String(name || '').trim(); if (LOCAL_ACTIONS.indexOf(action) < 0) throw new Error('action not allowed by local runtime: ' + action);
    const record = { id: 'action-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), name: action, payload: payload == null ? null : clone(payload), status: 'allowed-local', createdAt: now() };
    data.actions.push(record); if (data.actions.length > 200) data.actions = data.actions.slice(-200); data.updatedAt = now(); persist(); emit('action', record); return clone(record);
  }
  function evolve(spec) {
    spec = spec || {}; const id = String(spec.id || '').trim(); const version = String(spec.version || '').trim(); const capability = String(spec.capability || '').trim(); const trigger = String(spec.trigger || '').trim(); const action = String(spec.action || '').trim();
    if (!id || !version || !capability) throw new Error('evolution requires id, version, and capability');
    if (PROTECTED.indexOf(id) >= 0) throw new Error('protected core component cannot be replaced: ' + id);
    if (LOCAL_ACTIONS.indexOf(action) < 0) throw new Error('evolution action must be local and allowlisted: ' + action);
    const record = { id: id, version: version, capability: capability, trigger: trigger, action: action, bounded: true, createdAt: now() };
    const prior = data.evolutions.findIndex(function (item) { return item && item.id === id; }); if (prior >= 0) data.evolutions[prior] = record; else data.evolutions.push(record);
    data.updatedAt = now(); persist(); emit('evolution', record); return clone(record);
  }
  function bridgeThinkingIndicator() {
    if (!w.document || !w.MutationObserver) return;
    const attach = function () {
      const el = w.document.getElementById('think'); if (!el || el.__yaRuntimeObserved) return; el.__yaRuntimeObserved = true;
      const sync = function () { const busy = !el.hidden; if (busy && data.state === STATES.IDLE) setState(STATES.THINKING, 'existing thinking indicator active'); if (!busy && data.state === STATES.THINKING) setState(STATES.IDLE, 'existing thinking indicator idle'); };
      new w.MutationObserver(sync).observe(el, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] }); sync();
    };
    if (w.document.readyState === 'loading') w.document.addEventListener('DOMContentLoaded', attach, { once: true }); else attach();
  }
  w.YaRuntime = Object.freeze({ STATES: STATES, VISUALS: VISUALS, PROTECTED: PROTECTED, LOCAL_ACTIONS: LOCAL_ACTIONS, snapshot: snapshot, on: on, setState: setState, register: register, ingest: ingest, act: act, evolve: evolve });
  persist(); applyVisualState(); bridgeThinkingIndicator(); emit('ready', { version: data.runtimeVersion });
})(typeof window !== 'undefined' ? window : globalThis);
