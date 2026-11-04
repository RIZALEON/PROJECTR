import Foundation

/// Я TOKEN · also Я COIN — currency + TOOL of great utility.
/// Every unit carries an RFID-class tag (traceId) for track · trace · understand
/// as it evolves through and beyond the world and the WWW.
/// Offline premier · NonNuclear · no usage limits.
enum YaToken {
    static let name = "Я TOKEN"
    static let alsoKnownAs = "Я COIN"
    static let symbol = "Я"
    static let decimals = 18
    static let genesisVideo = "https://youtu.be/rVNsEK4xino"
    static let law = "Currency + TOOL. RFID-class tag on every unit. Track · Trace · Understand · Evolve. Bio owns source."

    /// Hardcoded genesis mint (offline seat). Green 0x filled when Decider pastes — never invent.
    struct Unit: Codable, Equatable {
        let tagId: String       // RFID-class
        let traceId: String
        let bio: String
        let amount: String
        let kind: String        // mint | transfer | settle | evolve
        let ref: String
        let ts: TimeInterval
        var chainTwin: String?  // optional 0x later
    }

    private static let bio = "being:rizal"
    private static let biostatsTag = "H · Я AB · R-U152"

    /// First forge — hardcoded into the app at seat time.
    static let genesis: Unit = {
        let tag = "RFID-YA-GENESIS-001"
        let trace = "ya-genesis-2026-09-16"
        return Unit(
            tagId: tag,
            traceId: trace,
            bio: bio,
            amount: "1000000000000000000",
            kind: "mint",
            ref: "GENESIS · \(alsoKnownAs) · \(genesisVideo) · \(biostatsTag)",
            ts: Date().timeIntervalSince1970,
            chainTwin: nil
        )
    }()

    static var ledgerURL: URL {
        // Application Support — avoid iCloud Documents coordination hangs on macOS.
        let root = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("ЯBOT", isDirectory: true)
        let dir = root.appendingPathComponent("Я/gut/essence", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("ya-coin-ledger.jsonl")
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
        // Prefer FileHandle over Data(contentsOf:) — avoids iCloud FileCoordinator stalls.
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

    static func status() -> String {
        let seated = (try? String(contentsOf: ledgerURL, encoding: .utf8))?.contains(genesis.traceId) == true
        return """
        \(name) (\(alsoKnownAs)) · symbol \(symbol)
        \(law)
        Genesis: \(seated ? "SEATED" : "NOT YET") · tag \(genesis.tagId)
        Ledger: \(ledgerURL.path)
        Biostats seal: \(biostatsTag)
        """
    }
}
