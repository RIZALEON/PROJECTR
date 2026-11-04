import Foundation

/// Ops stub ledger at Application Support/ЯBOT/ghost-chain.jsonl
enum GhostChainLedger {
    private static var directoryURL: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Application Support")
        return base.appendingPathComponent("ЯBOT", isDirectory: true)
    }

    static var path: URL {
        directoryURL.appendingPathComponent("ghost-chain.jsonl")
    }

    private static func ensureDir() {
        try? FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
    }

    /// Append one JSON line: establish / claim / cite / evolve / ping.
    @discardableResult
    static func append(
        op: String,
        bio: String = "",
        device: String = "mac",
        source: String = "clay",
        origin: String = "ЯBOT",
        extra: [String: Any] = [:]
    ) -> String {
        ensureDir()
        let traceId = UUID().uuidString
        let ts = ISO8601DateFormatter().string(from: Date())
        var row: [String: Any] = [
            "op": op,
            "bio": bio,
            "device": device,
            "source": source,
            "origin": origin,
            "traceId": traceId,
            "ts": ts
        ]
        for (k, v) in extra { row[k] = v }
        guard JSONSerialization.isValidJSONObject(row),
              let data = try? JSONSerialization.data(withJSONObject: row, options: []),
              var line = String(data: data, encoding: .utf8) else {
            return "ghost append failed"
        }
        line += "\n"
        if let handle = try? FileHandle(forWritingTo: path) {
            defer { try? handle.close() }
            handle.seekToEndOfFile()
            if let d = line.data(using: .utf8) { handle.write(d) }
        } else {
            try? line.data(using: .utf8)?.write(to: path)
        }
        return traceId
    }

    private static var seatDevice: String {
        #if os(iOS)
        return "iphone"
        #elseif os(macOS)
        return "mac"
        #else
        return "device"
        #endif
    }

    static func establish(bio: String = "") -> String { append(op: "establish", bio: bio, device: seatDevice) }
    static func claim(bio: String = "") -> String { append(op: "claim", bio: bio, device: seatDevice) }
    static func cite(bio: String = "") -> String { append(op: "cite", bio: bio, device: seatDevice) }
    static func evolve(bio: String = "") -> String { append(op: "evolve", bio: bio, device: seatDevice) }
    static func ping(bio: String = "") -> String { append(op: "ping", bio: bio, device: seatDevice) }

    /// Clay-facing write reply: op + trace + live status.
    static func clayWrite(op: String, bio: String = "") -> String {
        let trace: String
        switch op {
        case "establish": trace = establish(bio: bio)
        case "claim": trace = claim(bio: bio)
        case "cite": trace = cite(bio: bio)
        case "evolve": trace = evolve(bio: bio)
        case "ping": trace = ping(bio: bio)
        default: return "ghost unknown op=\(op). Use establish|claim|cite|evolve|ping."
        }
        if trace == "ghost append failed" { return trace }
        return "ghost \(op) ok trace=\(trace) device=\(seatDevice)\n\(status())"
    }

    static func lineCount() -> Int {
        guard let data = try? Data(contentsOf: path),
              let text = String(data: data, encoding: .utf8) else { return 0 }
        return text.split(separator: "\n", omittingEmptySubsequences: true).count
    }

    static func status() -> String {
        "ghost lines=\(lineCount()) path=\(path.path)"
    }

    static func statusDict() -> [String: Any] {
        ["lines": lineCount(), "path": path.path]
    }
}
