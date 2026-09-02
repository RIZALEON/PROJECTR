/* Engine RIZAL brain I/O — v0.45
   Paste over the ul-mind / dl-mind block in app.js (root + web).
   Upload works amber or green. Download is one full .txt ledger.
*/

function gofLofLines() {
  const lines = [];
  lines.push("=== GOFLOF (gain and loss of function) ===");
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
  return lines.join("\n");
}
