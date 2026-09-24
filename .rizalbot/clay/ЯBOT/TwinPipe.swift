import Foundation
#if os(macOS)
import AppKit
#endif

/// Public twin pipe — Solana first. Clay writes the pack; Decider pushes / pastes green.
/// Explorers & Dexscreener are mirrors. NonNuclear · no invented addresses · try Я first.
enum TwinPipe {
    static let chain = "solana"
    static let clusterDefault = "devnet"

    static var packDir: URL { YaToken.twinDir }

    static func status() -> String {
        let dir = packDir
        let units = (try? FileManager.default.contentsOfDirectory(atPath: dir.appendingPathComponent("units").path)) ?? []
        let ready = units.filter { $0.hasSuffix(".json") }
        let last = dir.appendingPathComponent("mint/last-mint.json")
        var lastLine = "last mint: none yet"
        if let data = try? Data(contentsOf: last),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            let ok = obj["ok"] as? Bool ?? false
            let mint = obj["mint"] as? String ?? obj["triedName"] as? String ?? "?"
            lastLine = ok ? "last mint OK · \(mint)" : "last mint FAIL · \(obj["error"] as? String ?? "see last-mint.json")"
        }
        return """
        TWIN PIPE · \(chain) · default \(clusterDefault)
        Purpose: public track/verify of RFID-class Я (utility+evolve) without selling the crown.
        Name law: try Я first; if mint rejects Я, STOP and tell Decider — R only by order.
        Pack: \(dir.path)
        Unit metadata files: \(ready.count)
        \(lastLine)
        Commands: twin prepare solana · twin push devnet · twin paste <tag> <mint> · twin status
        Dexscreener: only after a real tiny fungible pool later — not for UNIT tags.
        """
    }

    static func prepareSolana(cluster: String = "devnet") -> String {
        _ = YaToken.ensureGenesisMinted()
        let dir = packDir
        let units = YaToken.allUnits().filter { $0.kind == "mint" }
        guard !units.isEmpty else { return "No units yet. In clay say: unit mint" }

        let manifesto = """
        # Я TWIN · Solana (\(cluster))
        Crown name: Я (try first). Fallback R only by Decider order if mint tooling rejects Я.
        Original: clay RFID-class ledger. Pipe: Solana mirror.
        Utilities: cite · clear_clog · tip_settle · seat_twin · evolve (Decider-gated).
        Units:
        \(units.map { "- \($0.tagId) · \($0.traceId) · util=\($0.utility ?? "?")" }.joined(separator: "\n"))
        """
        try? manifesto.write(to: dir.appendingPathComponent("MANIFESTO.md"), atomically: true, encoding: .utf8)

        #if os(macOS)
        NSWorkspace.shared.open(dir)
        #endif

        return """
        TWIN PREPARE · Solana \(cluster) — through clay
        Units packed: \(units.count)
        Folder: \(dir.path)
        Name: Я first.
        Next: twin push devnet   (or fund minter then push)
        \(status())
        """
    }

    /// Shell Metaplex/umi mint on Mac — Decider-gated. Tries name Я.
    static func pushDevnet() -> String {
        #if os(macOS)
        let dir = packDir.appendingPathComponent("mint")
        let script = dir.appendingPathComponent("mint-ya-unit.mjs")
        guard FileManager.default.fileExists(atPath: script.path) else {
            return "Mint script missing at \(script.path). Run twin prepare first / reseat mint pack."
        }
        let node = "/opt/homebrew/bin/node"
        let proc = Process()
        proc.executableURL = URL(fileURLWithPath: node)
        proc.arguments = [script.path]
        proc.currentDirectoryURL = dir
        let out = Pipe()
        let err = Pipe()
        proc.standardOutput = out
        proc.standardError = err
        do {
            try proc.run()
            proc.waitUntilExit()
        } catch {
            return "twin push spawn failed: \(error.localizedDescription)"
        }
        let o = String(data: out.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        let e = String(data: err.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        let combined = (o + "\n" + e).trimmingCharacters(in: .whitespacesAndNewlines)

        if let data = try? Data(contentsOf: dir.appendingPathComponent("last-mint.json")),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            if obj["ok"] as? Bool == true, let mint = obj["mint"] as? String {
                let tag = YaToken.allUnits().last(where: { $0.kind == "mint" })?.tagId ?? "RFID-YA-UNIT"
                let paste = YaToken.pasteTwin(tagId: tag, address: mint)
                return """
                TWIN PUSH DEVNET · OK · name Я
                mint=\(mint)
                explorer=\(obj["explorer"] as? String ?? "")
                utilities=\(obj["utilities"] as? [String] ?? [])
                \(paste)
                """
            }
            if obj["unicodeSuspect"] as? Bool == true {
                return """
                TWIN PUSH DEVNET · STOPPED
                Mint tooling rejected Я (unicode).
                I will NOT rename to R unless you order it.
                Error: \(obj["error"] as? String ?? "")
                """
            }
            if let errMsg = obj["error"] as? String {
                return """
                TWIN PUSH DEVNET · FAILED (still name Я — not switching to R)
                \(errMsg)
                Tip: fund minter on devnet then retry twin push devnet
                pubkey file: \(packDir.appendingPathComponent("keys/devnet-minter.pubkey.txt").path)
                """
            }
        }
        return "TWIN PUSH finished · exit \(proc.terminationStatus)\n\(combined.prefix(1500))"
        #else
        return "twin push devnet is Mac-seat only for now."
        #endif
    }
}
