import Foundation

/// Я TOKEN · also Я COIN — currency + TOOL of great utility.
/// Every unit carries an RFID-class tag (tagId) for track · trace · understand · evolve.
/// Offline premier · NonNuclear · public twins are mirrors only (paste green addresses — never invent).
enum YaToken {
    static let name = "Я"
    static let alsoKnownAs = "Я · unit/coin roles (RFID tag vs fuel) — crown name stays Я"
    static let symbol = "Я"
    /// Only if mint/tracker cannot take Я — tell Decider, then use R on order. Never silent rename.
    static let asciiFallback = "R"
    static let decimals = 18
    static let genesisVideo = "https://youtu.be/rVNsEK4xino"
    static let law = "Currency + TOOL. RFID-class tag on every unit. Track · Trace · Understand · Evolve. Bio owns source. Pipes (explorer/Dex) mirror — they do not own."

    struct Unit: Codable, Equatable {
        let tagId: String
        let traceId: String
        let bio: String
        let amount: String
        let kind: String       // mint | transfer | settle | evolve | twin_prepare
        let ref: String
        let ts: TimeInterval
        var chainTwin: String? // green mint/address when Decider pastes
        var utility: String?   // cite | clear_clog | tip | seat | evolve
        var evolveStage: String?
    }

    private static let bio = "being:rizal"
    private static let biostatsTag = "H · Я AB · R-U152"

    static let genesis: Unit = {
        Unit(
            tagId: "RFID-YA-GENESIS-001",
            traceId: "ya-genesis-2026-09-16",
            bio: bio,
            amount: "1000000000000000000",
            kind: "mint",
            ref: "GENESIS · \(alsoKnownAs) · \(genesisVideo) · \(biostatsTag)",
            ts: Date().timeIntervalSince1970,
            chainTwin: nil,
            utility: "origin",
            evolveStage: "0-genesis"
        )
    }()

    static var ledgerURL: URL {
        let root = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("ЯBOT", isDirectory: true)
        let dir = root.appendingPathComponent("Я/gut/essence", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("ya-coin-ledger.jsonl")
    }

    static var twinDir: URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Documents")
        let dir = docs.appendingPathComponent("ЯBOT/courses/ROBOT-EVOLUTION-680/TWIN-SOLANA", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        try? FileManager.default.createDirectory(at: dir.appendingPathComponent("metadata"), withIntermediateDirectories: true)
        try? FileManager.default.createDirectory(at: dir.appendingPathComponent("units"), withIntermediateDirectories: true)
        return dir
    }

    private static var genesisCheckDone = false
    private static let genesisLock = NSLock()

    @discardableResult
    static func ensureGenesisMinted() -> String {
        genesisLock.lock()
        defer { genesisLock.unlock() }
        if genesisCheckDone {
            return "Я COIN genesis check skipped (already ran). tag=\(genesis.tagId)"
        }
        genesisCheckDone = true
        let url = ledgerURL
        if FileManager.default.fileExists(atPath: url.path),
           let fh = try? FileHandle(forReadingFrom: url) {
            defer { try? fh.close() }
            let data = fh.readDataToEndOfFile()
            if let text = String(data: data, encoding: .utf8), text.contains(genesis.traceId) {
                return "Я COIN genesis already seated. tag=\(genesis.tagId)"
            }
        }
        append(genesis)
        return "Minted Я TOKEN / Я COIN genesis offline. tag=\(genesis.tagId) · RFID-class · track/trace/understand/evolve · video \(genesisVideo)"
    }

    /// Mint a new RFID-class UNIT through clay (offline original).
    static func mintUnit(brief: String = "", utility: String = "cite") -> String {
        _ = ensureGenesisMinted()
        let n = allUnits().filter { $0.kind == "mint" }.count + 1
        let tag = String(format: "RFID-YA-UNIT-%03d", n)
        let trace = "ya-unit-\(Int(Date().timeIntervalSince1970))-\(n)"
        let note = brief.trimmingCharacters(in: .whitespacesAndNewlines)
        let unit = Unit(
            tagId: tag,
            traceId: trace,
            bio: bio,
            amount: "1",
            kind: "mint",
            ref: note.isEmpty ? "UNIT mint · utility=\(utility) · \(biostatsTag)" : "UNIT · \(note) · \(utility)",
            ts: Date().timeIntervalSince1970,
            chainTwin: nil,
            utility: utility,
            evolveStage: "1-unit"
        )
        append(unit)
        writeUnitSidecar(unit)
        return """
        UNIT minted through clay (offline original).
        tagId=\(tag)
        traceId=\(trace)
        utility=\(utility)
        evolve=\(unit.evolveStage ?? "1-unit")
        twin=pending (say: twin prepare solana)
        law=\(law)
        """
    }

    static func pasteTwin(tagId: String, address: String) -> String {
        let addr = address.trimmingCharacters(in: .whitespacesAndNewlines)
        let tag = tagId.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !addr.isEmpty, !tag.isEmpty else { return "HOW: twin paste <tagId> <address>" }
        guard addr.count >= 32, !addr.lowercased().hasPrefix("0xdead") else {
            return "Refuse: address looks invented or too short. Paste a real green mint/address only."
        }
        let stamp = Unit(
            tagId: tag,
            traceId: "twin-paste-\(Int(Date().timeIntervalSince1970))",
            bio: bio,
            amount: "0",
            kind: "twin_prepare",
            ref: "GREEN TWIN PASTE · \(addr)",
            ts: Date().timeIntervalSince1970,
            chainTwin: addr,
            utility: "mirror",
            evolveStage: "2-twin"
        )
        append(stamp)
        return "Green twin seated for \(tag) → \(addr)\nClay remains source. Pipe is citation only."
    }

    static func append(_ unit: Unit) {
        guard let line = try? JSONEncoder().encode(unit),
              var s = String(data: line, encoding: .utf8) else { return }
        s.append("\n")
        if let handle = try? FileHandle(forWritingTo: ledgerURL) {
            defer { try? handle.close() }
            handle.seekToEndOfFile()
            if let d = s.data(using: .utf8) { handle.write(d) }
        } else {
            try? s.data(using: .utf8)?.write(to: ledgerURL)
        }
    }

    static func allUnits() -> [Unit] {
        guard let text = try? String(contentsOf: ledgerURL, encoding: .utf8) else { return [] }
        let dec = JSONDecoder()
        return text.split(separator: "\n").compactMap { line in
            guard let d = line.data(using: .utf8) else { return nil }
            return try? dec.decode(Unit.self, from: d)
        }
    }

    private static func writeUnitSidecar(_ unit: Unit) {
        let meta: [String: Any] = [
            "name": "Я UNIT \(unit.tagId)",
            "symbol": "YAUNIT",
            "description": "RFID-class Я UNIT — currency+utility. \(unit.ref). Track·Trace·Understand·Evolve. Bio owns source.",
            "image": genesisVideo,
            "external_url": genesisVideo,
            "attributes": [
                ["trait_type": "tagId", "value": unit.tagId],
                ["trait_type": "traceId", "value": unit.traceId],
                ["trait_type": "utility", "value": unit.utility ?? "cite"],
                ["trait_type": "evolveStage", "value": unit.evolveStage ?? "1-unit"],
                ["trait_type": "bio", "value": unit.bio],
                ["trait_type": "rfid_class", "value": "true"],
                ["trait_type": "pipe", "value": "solana-mirror"]
            ]
        ]
        let url = twinDir.appendingPathComponent("units/\(unit.tagId).json")
        if let data = try? JSONSerialization.data(withJSONObject: meta, options: [.prettyPrinted, .sortedKeys]) {
            try? data.write(to: url)
        }
    }

    static func status() -> String {
        _ = ensureGenesisMinted()
        let units = allUnits()
        let mints = units.filter { $0.kind == "mint" }
        let twins = units.filter { $0.chainTwin != nil }
        var lines = [
            "\(name) (\(alsoKnownAs)) · symbol \(symbol)",
            law,
            "Genesis: tag \(genesis.tagId)",
            "Units minted: \(mints.count)",
            "Green twins pasted: \(twins.count)",
            "Ledger: \(ledgerURL.path)",
            "Twin pack: \(twinDir.path)",
            "Biostats: \(biostatsTag)",
            "App path: mint · unit mint · twin prepare solana · twin paste <tag> <addr> · twin status"
        ]
        for u in mints.suffix(5) {
            lines.append("· \(u.tagId) util=\(u.utility ?? "?") twin=\(u.chainTwin ?? "pending")")
        }
        return lines.joined(separator: "\n")
    }
}
