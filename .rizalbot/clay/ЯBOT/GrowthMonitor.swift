import Foundation
import SwiftUI

/// Loads bundled growth/GROWTH-LEDGER.json and surfaces tree growth + seed freshness.
/// Mac build required to compile. Conservative clay seat — read-only.
struct GrowthLedger: Codable {
    var stamp: String?
    var stamp_iso: String?
    var timezone: String?
    var crown: String?
    var mint: String?
    var law: String?
    var trees: [GrowthTree]
}

struct GrowthTree: Codable, Identifiable {
    var id: String { key }
    var key: String
    var repo: String?
    var default_branch: String?
    var branches: Int?
    var commits_last_7_days: Int?
    var commits_last_14_days: Int?
    var commits_last_30_days: Int?
    var head_sha: String?
    var last_commit_denver: String?
    var lines_30d: GrowthLines?
    var seeds: [GrowthSeed]?
}

struct GrowthLines: Codable {
    var swift: GrowthLineDelta?
    var kt: GrowthLineDelta?
    var js: GrowthLineDelta?
    var md: GrowthLineDelta?
    var other: GrowthLineDelta?
}

struct GrowthLineDelta: Codable {
    var added: Int?
    var deleted: Int?
}

struct GrowthSeed: Codable, Identifiable {
    var id: String { (folder ?? "") + (source_repo ?? "") }
    var folder: String?
    var source_repo: String?
    var seed_sha: String?
    var upstream_sha: String?
    var status: String?
    var stale_commits: Int?
}

enum GrowthMonitor {
    static func loadBundled() -> GrowthLedger? {
        let names = ["GROWTH-LEDGER", "growth/GROWTH-LEDGER"]
        for name in names {
            if let url = Bundle.main.url(forResource: name, withExtension: "json"),
               let data = try? Data(contentsOf: url),
               let ledger = try? JSONDecoder().decode(GrowthLedger.self, from: data) {
                return ledger
            }
        }
        // Fallback: look beside the process CWD (dev / Mac seat)
        let candidates = [
            "growth/GROWTH-LEDGER.json",
            "../growth/GROWTH-LEDGER.json",
            "../../growth/GROWTH-LEDGER.json",
        ]
        for c in candidates {
            let url = URL(fileURLWithPath: c)
            if let data = try? Data(contentsOf: url),
               let ledger = try? JSONDecoder().decode(GrowthLedger.self, from: data) {
                return ledger
            }
        }
        return nil
    }

    static func reportText() -> String {
        guard let ledger = loadBundled() else {
            return "GROWTH: ledger missing. Run growth/growth-stamp.sh on the Mac seat, then rebuild."
        }
        var lines: [String] = []
        lines.append("GROWTH MONITOR — stamp \(ledger.stamp ?? "?")")
        lines.append(ledger.law ?? "Clay owns source; GitHub is a mirror.")
        lines.append("Crown: \(ledger.crown ?? "Я")")
        for t in ledger.trees {
            let c7 = t.commits_last_7_days ?? 0
            let c14 = t.commits_last_14_days ?? 0
            let c30 = t.commits_last_30_days ?? 0
            let head = String((t.head_sha ?? "—").prefix(7))
            lines.append("• \(t.key): commits 7/14/30d = \(c7)/\(c14)/\(c30) · head \(head)")
            for s in t.seeds ?? [] {
                let st = s.status ?? "?"
                lines.append("    seed \(s.folder ?? "?") ← \(s.source_repo ?? "?") · \(st)")
            }
        }
        return lines.joined(separator: "\n")
    }
}

struct GrowthMonitorView: View {
    @State private var ledger: GrowthLedger? = GrowthMonitor.loadBundled()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text("GROWTH MONITOR")
                    .font(.title2.bold())
                Text(ledger?.stamp ?? "no stamp")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(ledger?.law ?? "Clay (device) owns source; GitHub is a mirror.")
                    .font(.footnote)
                if let trees = ledger?.trees {
                    ForEach(trees) { t in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(t.key).font(.headline)
                            Text("commits 7/14/30d: \(t.commits_last_7_days ?? 0)/\(t.commits_last_14_days ?? 0)/\(t.commits_last_30_days ?? 0)")
                                .font(.caption.monospaced())
                            Text("head: \(String((t.head_sha ?? "—").prefix(7))) · last: \(t.last_commit_denver ?? "—")")
                                .font(.caption2)
                            ForEach(t.seeds ?? []) { s in
                                Text("\(s.folder ?? "?") ← \(s.source_repo ?? "?") · \(s.status ?? "?")")
                                    .font(.caption2)
                                    .foregroundStyle((s.status ?? "").hasPrefix("fresh") ? .green : .orange)
                            }
                        }
                        .padding(8)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 10))
                    }
                } else {
                    Text("Ledger not bundled. Stamp on Mac, add growth/GROWTH-LEDGER.json to the target.")
                        .foregroundStyle(.secondary)
                }
            }
            .padding()
        }
        .navigationTitle("Growth")
    }
}
