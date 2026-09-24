import Foundation

/// ESSENCE TRACE — offline mint → transfer → settle ledger (contract ESSENCE-TRACE-0.1).
/// Also seats Я TOKEN plumbing utility: clear / resolve digital data clogs on-device.
/// Offline premier · NonNuclear · no cloud gate on core.
enum EssenceTrace {
    struct Event: Codable {
        let traceId: String
        let kind: String       // mint | transfer | settle | burn | clear_clog
        let from: String
        let to: String
        let amount: String
        let ref: String
        let ts: Int
        let device: String
        let party: String
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

    static var ledgerURL: URL {
        let root = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Documents")
        let dir = root.appendingPathComponent("Я/gut/essence", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("ledger.jsonl")
    }

    private static func append(_ e: Event) -> Bool {
        guard let data = try? JSONEncoder().encode(e),
              var line = String(data: data, encoding: .utf8) else { return false }
        line += "\n"
        guard let bytes = line.data(using: .utf8) else { return false }
        if FileManager.default.fileExists(atPath: ledgerURL.path),
           let h = try? FileHandle(forWritingTo: ledgerURL) {
            defer { try? h.close() }
            h.seekToEndOfFile()
            h.write(bytes)
            return true
        }
        do { try bytes.write(to: ledgerURL); return true } catch { return false }
    }

    private static func allEvents() -> [Event] {
        guard let text = try? String(contentsOf: ledgerURL, encoding: .utf8) else { return [] }
        let dec = JSONDecoder()
        return text.split(whereSeparator: \.isNewline).compactMap { line in
            guard let d = line.data(using: .utf8) else { return nil }
            return try? dec.decode(Event.self, from: d)
        }
    }

    private static func lineCount() -> Int { allEvents().count }

    static func status(traceId: String? = nil) -> String {
        let events = allEvents()
        if let tid = traceId?.trimmingCharacters(in: .whitespacesAndNewlines), !tid.isEmpty {
            let hops = events.filter { $0.traceId == tid }
            if hops.isEmpty { return "essence traceId=\(tid) hops=0 (unknown)\nledger: \(ledgerURL.path)" }
            let body = hops.map { "\($0.kind) \($0.from)→\($0.to) amt=\($0.amount) ref=\($0.ref) ts=\($0.ts) device=\($0.device)" }
                .joined(separator: "\n")
            return "essence traceId=\(tid) hops=\(hops.count)\n\(body)\nledger: \(ledgerURL.path)"
        }
        return "essence lines=\(events.count) device=\(seatDevice)\nledger: \(ledgerURL.path)\nlaw: mint→transfer→settle offline; clear_clog unblocks digital plumbing"
    }

    /// mint [amount] [ref...]
    static func mint(amount: String = "1", ref: String = "essence.mint") -> String {
        let tid = UUID().uuidString
        let e = Event(
            traceId: tid, kind: "mint", from: "0x0", to: seatDevice,
            amount: amount, ref: ref.isEmpty ? "essence.mint" : ref,
            ts: Int(Date().timeIntervalSince1970), device: seatDevice, party: "clay"
        )
        guard append(e) else { return "essence mint FAILED" }
        return "essence mint ok traceId=\(tid) amount=\(amount) device=\(seatDevice)\n\(status())"
    }

    /// transfer <to> [amount] [ref...] — continues latest open mint if no traceId given
    static func transfer(to: String, amount: String = "1", traceId: String? = nil, ref: String = "essence.transfer") -> String {
        let dest = to.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !dest.isEmpty else { return "essence transfer needs destination. HOW: essence transfer <to>" }
        let tid = (traceId?.isEmpty == false ? traceId! : (allEvents().last(where: { $0.kind == "mint" || $0.kind == "transfer" })?.traceId))
        guard let tid, !tid.isEmpty else { return "essence transfer needs a prior mint. HOW: essence mint then essence transfer <to>" }
        let e = Event(
            traceId: tid, kind: "transfer", from: seatDevice, to: dest,
            amount: amount, ref: ref, ts: Int(Date().timeIntervalSince1970),
            device: seatDevice, party: "clay"
        )
        guard append(e) else { return "essence transfer FAILED" }
        return "essence transfer ok traceId=\(tid) to=\(dest)\n\(status(traceId: tid))"
    }

    static func settle(traceId: String? = nil, ref: String = "essence.settle") -> String {
        let tid = (traceId?.isEmpty == false ? traceId! : allEvents().last?.traceId)
        guard let tid, !tid.isEmpty else { return "essence settle needs traceId. HOW: essence settle <traceId>" }
        let e = Event(
            traceId: tid, kind: "settle", from: seatDevice, to: "settled",
            amount: "0", ref: ref, ts: Int(Date().timeIntervalSince1970),
            device: seatDevice, party: "clay"
        )
        guard append(e) else { return "essence settle FAILED" }
        return "essence settle ok traceId=\(tid)\n\(status(traceId: tid))"
    }

    /// TOKEN utility: clear a named digital plumbing clog (mint+clear_clog+settle on one trace).
    static func clearClog(name: String) -> String {
        let clog = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clog.isEmpty else { return "essence clear clog needs a name. HOW: essence clear clog <name>" }
        let tid = UUID().uuidString
        let ts = Int(Date().timeIntervalSince1970)
        let mint = Event(traceId: tid, kind: "mint", from: "0x0", to: seatDevice, amount: "1",
                         ref: "clog:\(clog)", ts: ts, device: seatDevice, party: "clay")
        let clear = Event(traceId: tid, kind: "clear_clog", from: seatDevice, to: "plumbing", amount: "1",
                          ref: "clog:\(clog)", ts: ts, device: seatDevice, party: "clay")
        let settle = Event(traceId: tid, kind: "settle", from: seatDevice, to: "settled", amount: "0",
                           ref: "clog-cleared:\(clog)", ts: ts, device: seatDevice, party: "clay")
        guard append(mint), append(clear), append(settle) else { return "essence clear clog FAILED for \(clog)" }
        let recovery = PlumbingClear.recover(clog)
        return "essence clear clog ok name=\(PlumbingClear.canonical(clog)) traceId=\(tid) device=\(seatDevice)\n\(recovery.text)\n\(status(traceId: tid))"
    }
}
