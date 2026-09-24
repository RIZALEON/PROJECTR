import Foundation

/// Decider teachings that survive across turns — fed into Heart system prompt.
enum TeachStore {
    private static var directoryURL: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Library/Application Support")
        return base.appendingPathComponent("ЯBOT", isDirectory: true)
    }

    static var path: URL { directoryURL.appendingPathComponent("teachings.jsonl") }

    /// Hard law always present (NonNuclear / Ghost / Source Value).
    static let kernelLaw: [String] = [
        "Product face: Я · ЯOS · Я Kode · Я Game · Я anti-nuclear.",
        "Law: ЯOS GIVES SOURCE VALUE — living beings get citation and value for contributions.",
        "Я GHOST CHAIN is owned by the living being (bio), established from biostats. Devices are LINKS only, never the owner.",
        "Raw biometrics stay on-device; only proof hashes may leave. Tag H · Я AB · R-U152 only when Decider confirmed — never invent genotypes.",
        "Airplane mode ≠ dead. Offline premier. Heart and Ghost ops work without IP.",
        "Triangle: Decider · CoS · ЯBOT. Decider owns fate. Teach ЯBOT to answer like CoS, then better on-device."
    ]

    private static func ensureDir() {
        try? FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
    }

    static func lineCount() -> Int {
        guard let data = try? Data(contentsOf: path),
              let text = String(data: data, encoding: .utf8) else { return 0 }
        return text.split(separator: "\n", omittingEmptySubsequences: true).count
    }

    @discardableResult
    static func remember(_ teaching: String, kind: String = "teach") -> String {
        let cleaned = teaching.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleaned.isEmpty else { return "empty teach" }
        ensureDir()
        let traceId = UUID().uuidString
        let ts = ISO8601DateFormatter().string(from: Date())
        let row: [String: Any] = [
            "kind": kind,
            "text": cleaned,
            "traceId": traceId,
            "ts": ts
        ]
        guard JSONSerialization.isValidJSONObject(row),
              let data = try? JSONSerialization.data(withJSONObject: row),
              var line = String(data: data, encoding: .utf8) else { return "teach write failed" }
        line += "\n"
        if let handle = try? FileHandle(forWritingTo: path) {
            defer { try? handle.close() }
            handle.seekToEndOfFile()
            if let d = line.data(using: .utf8) { handle.write(d) }
        } else {
            try? line.data(using: .utf8)?.write(to: path)
        }
        GhostChainLedger.append(op: "evolve", bio: "decider", source: "teach", extra: ["kind": kind, "traceId": traceId])
        MindTranscript.append(role: "system", kind: "teach", body: "[\(kind)] \(cleaned)", party: "Decider")
        return traceId
    }

    static func learnedTexts(limit: Int = 24) -> [String] {
        guard let data = try? Data(contentsOf: path),
              let text = String(data: data, encoding: .utf8) else { return [] }
        var out: [String] = []
        for line in text.split(separator: "\n", omittingEmptySubsequences: true).reversed() {
            guard let d = String(line).data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                  let t = obj["text"] as? String else { continue }
            out.append(t)
            if out.count >= limit { break }
        }
        return out.reversed()
    }

    /// Compact block for Heart -sys.
    static func heartContextBlock() -> String {
        var parts = kernelLaw
        parts.append(contentsOf: learnedTexts(limit: 12))
        return "Standing law:\n- " + parts.joined(separator: "\n- ")
    }

    static func status() -> String {
        "teach lines=\(lineCount()) path=\(path.path) kernel=\(kernelLaw.count)"
    }

    /// Fast law answers when Heart would guess wrong.
    static func lawAnswer(for raw: String) -> String? {
        let lower = raw.lowercased()
        if lower.contains("ghost chain") && (lower.contains("own") || lower.contains("who") || lower.contains("living") || lower.contains("device")) {
            return "The living being owns the Я GHOST CHAIN. Devices are LINKS only, never the owner."
        }
        if lower.contains("airplane") || (lower.contains("offline") && lower.contains("dead")) {
            return "No. Airplane mode is not death — offline premier; Heart and Ghost keep working without IP."
        }
        if lower.contains("triangle") && (lower.contains("who am i") || lower.contains("decider") || lower.contains("who are you")) {
            if lower.contains("who am i") {
                return "You are Decider in the triangle Decider · CoS · ЯBOT. You own fate."
            }
        }
        if lower.contains("link") && lower.contains("device") && lower.contains("owner") {
            return "Devices are LINKS only; the living being owns the ghostchain. Raw biometrics stay on-device."
        }
        if lower.contains("source value") || lower.contains("яos gives") {
            return "ЯOS GIVES SOURCE VALUE — living beings receive citation and value for what they contribute."
        }
        return nil
    }
}
