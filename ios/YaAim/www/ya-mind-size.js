/* MIND SIZE = base .app (binary+www+frameworks+hardcoded Ya) + Documents (heart, gut, Ya folder). */
(function () {
  function nativeAppBytesCached() {
    try {
      if (window.YA_NATIVE && typeof window.YA_NATIVE.appBytes === "number") {
        return Number(window.YA_NATIVE.appBytes) || 0;
      }
      if (window.YA_NATIVE && typeof window.YA_NATIVE.bundleBytes === "number") {
        return Number(window.YA_NATIVE.bundleBytes) || 0;
      }
    } catch (e) {}
    return 0;
  }

  var prevApply = window.applyNativeVaultStatus;
  window.applyNativeVaultStatus = function (msg) {
    if (typeof prevApply === "function") prevApply(msg);
    try {
      window.YA_NATIVE = window.YA_NATIVE || {};
      if (msg && typeof msg.appBytes === "number") window.YA_NATIVE.appBytes = msg.appBytes;
      if (msg && typeof msg.bundleBytes === "number") window.YA_NATIVE.bundleBytes = msg.bundleBytes;
      if (msg && typeof msg.yaFolderBytes === "number") window.YA_NATIVE.yaFolderBytes = msg.yaFolderBytes;
    } catch (e) {}
  };

  var prevMind = window.mindBytes;
  window.mindBytes = function () {
    var ls = 0;
    try { if (typeof localStorageMindBytes === "function") ls = localStorageMindBytes() || 0; } catch (e) {}
    var docs = 0;
    try { if (typeof nativeVaultBytesCached === "function") docs = nativeVaultBytesCached() || 0; } catch (e) {}
    var app = nativeAppBytesCached();
    if (app > 0) return ls + app + docs;
    if (typeof prevMind === "function") return prevMind();
    return ls + docs;
  };
})();
