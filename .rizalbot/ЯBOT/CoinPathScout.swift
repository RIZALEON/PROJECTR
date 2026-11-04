import Foundation
#if canImport(Network)
import Network
#endif
#if canImport(UIKit)
import UIKit
#endif

/// Path-scout mind of Я TOKEN / Я COIN.
/// Journey: detect → retain → report → resolve/clear.
/// Machine DNA: imprint EVERY machine touched — bio seats AND towers,
/// repeaters, hubs, storage, relays (incl. Bluetooth near-link), path-nodes.
/// Offline premier · NonNuclear · green hops optional · BT near-field OK.
enum CoinPathScout {
    struct Event: Codable {
        let pathId: String
        let kind: String
        let note: String
        let detail: String
        let device: String
        let ts: Int
        let clog: String?
        let severity: String
        let dnaImprintId: String?
    }

    struct MachineDNA: Codable {
        let imprintId: String
        let pathId: String
        let machineKind: String
        let identity: String
        let role: String
        let seat: String
        let model: String
        let osVersion: String
        let bundleId: String
        let hopKind: String
        let detail: String
        let ts: Int
    }

    static let machineKinds = [
        "seat", "tower", "repeater", "hub", "storage", "relay", "path-node", "unknown"
    ]

    private static var seatDevice: String {
        #if os(iOS)
        return "iphone"
        #elseif os(macOS)
        return "mac"
        #else
        return "device"
        #endif
    }

    static var seatDevicePublic: String { seatDevice }

    private static var seatModel: String {
        #if os(iOS)
        return UIDevice.current.model
        #else
        return "Mac"
        #endif
    }

    private static var rootDir: URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Documents")
        let dir = docs.appendingPathComponent("Я/gut/path-scout", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    static var journalURL: URL { rootDir.appendingPathComponent("path-journal.jsonl") }
    static var dnaURL: URL { rootDir.appendingPathComponent("machine-dna.jsonl") }

    private static let activePathKey = "ya.coin.activePathId"
    private static var activePathId: String? {
        get { UserDefaults.standard.string(forKey: activePathKey) }
        set { UserDefaults.standard.set(newValue, forKey: activePathKey) }
    }

    // MARK: Persist

    @discardableResult
    private static func append(_ e: Event) -> Bool { writeJSONL(e, to: journalURL) }

    @discardableResult
    private static func appendDNA(_ d: MachineDNA) -> Bool { writeJSONL(d, to: dnaURL) }

    private static func writeJSONL<T: Encodable>(_ value: T, to url: URL) -> Bool {
        guard let data = try? JSONEncoder().encode(value),
              var line = String(data: data, encoding: .utf8) else { return false }
        line += "\n"
        guard let bytes = line.data(using: .utf8) else { return false }
        if FileManager.default.fileExists(atPath: url.path),
           let h = try? FileHandle(forWritingTo: url) {
            defer { try? h.close() }
            h.seekToEndOfFile()
            h.write(bytes)
            return true
        }
        do { try bytes.write(to: url); return true } catch { return false }
    }

    private static func all() -> [Event] { decodeLines(Event.self, url: journalURL) }
    private static func allDNA() -> [MachineDNA] { decodeLines(MachineDNA.self, url: dnaURL) }

    private static func decodeLines<T: Decodable>(_ type: T.Type, url: URL) -> [T] {
        guard let text = try? String(contentsOf: url, encoding: .utf8) else { return [] }
        let dec = JSONDecoder()
        return text.split(whereSeparator: \.isNewline).compactMap {
            guard let d = $0.data(using: .utf8) else { return nil }
            return try? dec.decode(T.self, from: d)
        }
    }

    // MARK: DNA

    private static func normalizeMachineKind(_ raw: String) -> String {
        let t = raw.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        switch t {
        case "seat", "device", "phone", "mac", "iphone", "handset", "bio", "held": return "seat"
        case "tower", "cell", "cell-tower", "basestation", "base-station": return "tower"
        case "repeater", "booster", "amplifier": return "repeater"
        case "hub", "data-hub", "datahub", "switch", "router", "gateway": return "hub"
        case "storage", "store", "nas", "drive", "archive", "vault", "disk": return "storage"
        case "relay", "proxy", "edge", "bluetooth", "ble", "bt", "nearlink": return "relay"
        case "path-node", "node", "machine", "infra": return "path-node"
        default: return machineKinds.contains(t) ? t : "unknown"
        }
    }

    @discardableResult
    static func imprint(
        kind: String,
        identity: String,
        role: String,
        pathId: String,
        hopKind: String,
        detail: String = ""
    ) -> MachineDNA {
        let k = normalizeMachineKind(kind)
        let dna = MachineDNA(
            imprintId: UUID().uuidString,
            pathId: pathId,
            machineKind: k,
            identity: identity,
            role: role,
            seat: seatDevice,
            model: k == "seat" ? seatModel : k,
            osVersion: k == "seat" ? ProcessInfo.processInfo.operatingSystemVersionString : "n/a",
            bundleId: k == "seat" ? (Bundle.main.bundleIdentifier ?? "unknown") : "n/a",
            hopKind: hopKind,
            detail: detail,
            ts: Int(Date().timeIntervalSince1970)
        )
        _ = appendDNA(dna)
        let e = Event(
            pathId: pathId, kind: "dna", note: "machine-dna-\(k)",
            detail: "id=\(identity) role=\(role) \(detail)",
            device: seatDevice, ts: dna.ts, clog: nil, severity: "info",
            dnaImprintId: dna.imprintId
        )
        _ = append(e)
        return dna
    }

    @discardableResult
    static func imprintSeat(pathId: String, hopKind: String, role: String = "clay-seat") -> MachineDNA {
        imprint(
            kind: "seat",
            identity: ProcessInfo.processInfo.hostName,
            role: role,
            pathId: pathId,
            hopKind: hopKind,
            detail: "seat=\(seatDevice) model=\(seatModel)"
        )
    }

    private static func guessInfraKind(host: String, dest: String) -> String {
        let h = (host + " " + dest).lowercased()
        if h.contains("tower") || h.contains("cell") { return "tower" }
        if h.contains("repeat") || h.contains("boost") { return "repeater" }
        if h.contains("hub") || h.contains("router") || h.contains("gateway") || h.contains("switch") { return "hub" }
        if h.contains("nas") || h.contains("storage") || h.contains("s3") || h.contains("bucket") || h.contains("drive") { return "storage" }
        if h.contains("relay") || h.contains("proxy") || h.contains("cdn") || h.contains("edge") || h.contains("bluetooth") { return "relay" }
        return "path-node"
    }

    // MARK: Clay API

    static func begin(to: String, via: String = "local") -> String {
        let dest = to.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !dest.isEmpty else { return "coin path begin needs destination. HOW: coin path begin <to> [via]" }
        let pathId = UUID().uuidString
        activePathId = pathId
        let seatDNA = imprintSeat(pathId: pathId, hopKind: "begin", role: "origin-seat")
        let e = Event(
            pathId: pathId, kind: "begin", note: "journey-start", detail: "to=\(dest) via=\(via)",
            device: seatDevice, ts: Int(Date().timeIntervalSince1970), clog: nil, severity: "info",
            dnaImprintId: seatDNA.imprintId
        )
        _ = append(e)
        let hop = scoutHop(pathId: pathId, dest: dest, via: via)
        return "coin path begin ok pathId=\(pathId) to=\(dest) via=\(via) device=\(seatDevice) dna=\(seatDNA.imprintId.prefix(8))\n\(hop)"
    }

    static func noteStrange(_ text: String, pathId: String? = nil) -> String {
        guard let pid = pathId ?? activePathId else {
            return "coin path note needs an active path. HOW: coin path begin <to> then coin path note <strange>"
        }
        let body = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !body.isEmpty else { return "coin path note needs text" }
        let dna = imprintSeat(pathId: pid, hopKind: "strange", role: "witness-seat")
        let e = Event(
            pathId: pid, kind: "mystery", note: body, detail: "retained-by-scout",
            device: seatDevice, ts: Int(Date().timeIntervalSince1970), clog: nil, severity: "strange",
            dnaImprintId: dna.imprintId
        )
        _ = append(e)
        var clearLine = ""
        if let clog = guessClog(from: body) {
            clearLine = "\n" + clearObstruction(clog, pathId: pid)
        }
        return "coin path note retained pathId=\(pid) strange=\(body) dna=\(dna.imprintId.prefix(8))\(clearLine)"
    }

    static func report(pathId: String? = nil) -> String {
        let events = all()
        let pid = pathId ?? activePathId ?? events.last?.pathId
        guard let pid else { return "coin path report: no journeys yet. HOW: coin path begin <to>" }
        let hops = events.filter { $0.pathId == pid }
        let strange = hops.filter { ["anomaly", "mystery", "clear", "resolve"].contains($0.kind) }
        let open = strange.filter { $0.severity == "strange" || $0.severity == "block" }.count
        let cleared = strange.filter { $0.severity == "cleared" }.count
        let dnaN = allDNA().filter { $0.pathId == pid }.count
        let lines = hops.map {
            "\($0.kind)/\($0.severity) \($0.note) · \($0.detail)\($0.clog.map { " clog=\($0)" } ?? "")\($0.dnaImprintId.map { " dna=\($0.prefix(8))" } ?? "")"
        }
        return """
        coin path report pathId=\(pid) hops=\(hops.count) mysteries_open~\(open) cleared=\(cleared) dnaImprints=\(dnaN) device=\(seatDevice)
        journal: \(journalURL.path)
        \(lines.joined(separator: "\n"))
        """
    }

    static func clearObstruction(_ name: String, pathId: String? = nil) -> String {
        let pid = pathId ?? activePathId ?? all().last?.pathId
        guard let pid else { return "coin path clear needs a journey. HOW: coin path begin <to>" }
        let clog = PlumbingClear.canonical(name)
        let dna = imprintSeat(pathId: pid, hopKind: "clear", role: "clear-seat")
        let before = Event(
            pathId: pid, kind: "anomaly", note: "obstruction-seen", detail: "clog=\(clog)",
            device: seatDevice, ts: Int(Date().timeIntervalSince1970), clog: clog, severity: "block",
            dnaImprintId: dna.imprintId
        )
        _ = append(before)
        let recovery = PlumbingClear.recover(clog)
        let after = Event(
            pathId: pid, kind: "resolve", note: "obstruction-cleared",
            detail: recovery.text.replacingOccurrences(of: "\n", with: " | "),
            device: seatDevice, ts: Int(Date().timeIntervalSince1970), clog: clog, severity: "cleared",
            dnaImprintId: dna.imprintId
        )
        _ = append(after)
        _ = EssenceTrace.clearClog(name: clog)
        return "coin path clear ok pathId=\(pid) clog=\(clog) dna=\(dna.imprintId.prefix(8))\n\(recovery.text)"
    }

    static func send(to: String, via: String = "auto") -> String {
        let dest = to.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !dest.isEmpty else {
            return "coin send needs destination. HOW: coin send <to> [via bluetooth|lan|usb|qr|nfc|share|local|infra|internet]"
        }
        let route = via == "auto" ? chooseVia(dest) : via
        let start = begin(to: dest, via: route)
        guard let pid = activePathId else { return start }
        let hop2 = scoutHop(pathId: pid, dest: dest, via: route, hopIndex: 2)

        var carrierLine = ""
        if let kind = CoinCarrierHub.parse(route) {
            // Build envelope once for any offline carrier
            let envelope: [String: Any] = [
                "type": "ya.coin.path",
                "v": 1,
                "pathId": pid,
                "fromSeat": seatDevice,
                "to": dest,
                "via": route,
                "ts": Int(Date().timeIntervalSince1970),
                "events": Array(all().filter { $0.pathId == pid }.suffix(24).map { ev -> [String: Any] in
                    [
                        "pathId": ev.pathId, "kind": ev.kind, "note": ev.note,
                        "detail": ev.detail, "device": ev.device, "ts": ev.ts,
                        "clog": ev.clog as Any, "severity": ev.severity,
                        "dnaImprintId": ev.dnaImprintId as Any
                    ]
                }),
                "dna": Array(allDNA().filter { $0.pathId == pid }.suffix(24).map { d -> [String: Any] in
                    [
                        "imprintId": d.imprintId, "pathId": d.pathId,
                        "machineKind": d.machineKind, "identity": d.identity,
                        "role": d.role, "seat": d.seat, "model": d.model,
                        "osVersion": d.osVersion, "bundleId": d.bundleId,
                        "hopKind": d.hopKind, "detail": d.detail, "ts": d.ts
                    ]
                })
            ]
            let tx = CoinCarrierHub.transmit(kind: kind, envelope: envelope, dest: dest)
            carrierLine = "\n\(tx)"
        }

        let arriveDNA = imprintSeat(pathId: pid, hopKind: "arrive", role: "arrive-seat")
        let arrive = Event(
            pathId: pid, kind: "arrive", note: "journey-arrive", detail: "to=\(dest) via=\(route)",
            device: seatDevice, ts: Int(Date().timeIntervalSince1970), clog: nil, severity: "info",
            dnaImprintId: arriveDNA.imprintId
        )
        _ = append(arrive)
        return "\(start)\n\(hop2)\(carrierLine)\ncoin path arrive pathId=\(pid) to=\(dest) dna=\(arriveDNA.imprintId.prefix(8))\n\(report(pathId: pid))"
    }

    @discardableResult
    static func ingestRemoteEnvelope(_ obj: [String: Any], fromPeer: String) -> String {
        let pathId = (obj["pathId"] as? String) ?? UUID().uuidString
        let fromSeat = (obj["fromSeat"] as? String) ?? "peer"
        if activePathId == nil { activePathId = pathId }

        let relay = imprint(
            kind: "relay",
            identity: NearLinkBluetooth.relayIdentity,
            role: fromPeer.hasPrefix("lan") || fromPeer.contains("lan") ? "lan-bonjour-rx" : (fromPeer.hasPrefix("usb") || fromPeer.contains("usb") ? "usb-wire-rx" : (fromPeer.hasPrefix("qr") || fromPeer.contains("qr") ? "qr-optical-rx" : "bluetooth-nearlink-rx")),
            pathId: pathId,
            hopKind: "bt-rx",
            detail: "fromPeer=\(fromPeer) fromSeat=\(fromSeat)"
        )
        _ = imprint(
            kind: "seat",
            identity: fromPeer,
            role: "peer-seat",
            pathId: pathId,
            hopKind: "bt-rx",
            detail: "remote-seat=\(fromSeat)"
        )
        let here = imprintSeat(pathId: pathId, hopKind: "bt-rx", role: "receive-seat")

        var mergedEvents = 0
        if let events = obj["events"] as? [[String: Any]] {
            for ev in events {
                let e = Event(
                    pathId: (ev["pathId"] as? String) ?? pathId,
                    kind: (ev["kind"] as? String) ?? "hop",
                    note: (ev["note"] as? String) ?? "remote",
                    detail: "rx-from=\(fromPeer) · \((ev["detail"] as? String) ?? "")",
                    device: (ev["device"] as? String) ?? fromSeat,
                    ts: (ev["ts"] as? Int) ?? Int(Date().timeIntervalSince1970),
                    clog: ev["clog"] as? String,
                    severity: (ev["severity"] as? String) ?? "info",
                    dnaImprintId: ev["dnaImprintId"] as? String
                )
                _ = append(e)
                mergedEvents += 1
            }
        }
        var mergedDna = 0
        if let rows = obj["dna"] as? [[String: Any]] {
            for r in rows {
                let dna = MachineDNA(
                    imprintId: (r["imprintId"] as? String) ?? UUID().uuidString,
                    pathId: (r["pathId"] as? String) ?? pathId,
                    machineKind: (r["machineKind"] as? String) ?? "unknown",
                    identity: (r["identity"] as? String) ?? "unknown",
                    role: (r["role"] as? String) ?? "remote",
                    seat: (r["seat"] as? String) ?? fromSeat,
                    model: (r["model"] as? String) ?? "n/a",
                    osVersion: (r["osVersion"] as? String) ?? "n/a",
                    bundleId: (r["bundleId"] as? String) ?? "n/a",
                    hopKind: (r["hopKind"] as? String) ?? "bt-rx",
                    detail: "merged-from=\(fromPeer) · \((r["detail"] as? String) ?? "")",
                    ts: (r["ts"] as? Int) ?? Int(Date().timeIntervalSince1970)
                )
                _ = appendDNA(dna)
                mergedDna += 1
            }
        }

        let note = Event(
            pathId: pathId, kind: "mystery", note: "bt-hop-received",
            detail: "from=\(fromPeer) events=\(mergedEvents) dna=\(mergedDna) relay=\(relay.imprintId.prefix(8))",
            device: seatDevice, ts: Int(Date().timeIntervalSince1970), clog: nil, severity: "strange",
            dnaImprintId: here.imprintId
        )
        _ = append(note)
        return "rx pathId=\(pathId.prefix(8)) from=\(fromPeer) events=\(mergedEvents) dna=\(mergedDna) relay=\(relay.imprintId.prefix(8))"
    }

    static func status() -> String {
        let events = all()
        let paths = Set(events.map(\.pathId)).count
        let mysteries = events.filter { $0.kind == "mystery" || $0.kind == "anomaly" }.count
        let cleared = events.filter { $0.severity == "cleared" }.count
        let dna = allDNA()
        let byKind = Dictionary(grouping: dna, by: \.machineKind)
            .map { "\($0.key)=\($0.value.count)" }.sorted().joined(separator: " ")
        let bt: String
        if Thread.isMainThread {
            bt = NearLinkBluetooth.shared.statusLine
        } else {
            bt = DispatchQueue.main.sync { NearLinkBluetooth.shared.statusLine }
        }
        return "coin path-scout paths~\(paths) events=\(events.count) mysteries~\(mysteries) cleared=\(cleared) dna=\(dna.count) [\(byKind)] active=\(activePathId ?? "none")\njournal: \(journalURL.path)\ndna: \(dnaURL.path)\nbt: \(bt)\ncarriers: bluetooth|lan|usb|qr|nfc|share\nlaw: detect→retain→report→resolve→clear · machine-DNA (seat|tower|repeater|hub|storage|relay|…) · BT near-link · offline premier"

    }

    static func dnaReport(pathId: String? = nil, limit: Int = 40) -> String {
        var rows = allDNA()
        if let pathId { rows = rows.filter { $0.pathId == pathId } }
        if rows.isEmpty {
            return "coin dna: no imprints yet. HOW: coin send <to> or coin dna touch <kind> <identity> [role…]"
        }
        let shown = rows.suffix(limit)
        let byKind = Dictionary(grouping: rows, by: \.machineKind)
            .map { "\($0.key)=\($0.value.count)" }.sorted().joined(separator: " ")
        let body = shown.map { r in
            "• kind=\(r.machineKind) id=\(r.identity) role=\(r.role) hop=\(r.hopKind) seat=\(r.seat) path=\(r.pathId.prefix(8)) imprint=\(r.imprintId.prefix(8)) \(r.detail)"
        }.joined(separator: "\n")
        return "coin dna imprints=\(rows.count) [\(byKind)] showing=\(shown.count)\n\(body)"
    }

    static func dnaTouch(kind: String, identity: String, role: String?, pathId: String? = nil) -> String {
        guard let pid = pathId ?? activePathId else {
            return "coin dna touch needs an active path. HOW: coin path begin <to> then coin dna touch <kind> <identity> [role…]"
        }
        let id = identity.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !id.isEmpty else {
            return "coin dna touch needs identity. HOW: coin dna touch <kind> <identity> [role…] · kinds: seat tower repeater hub storage relay path-node"
        }
        let r = (role?.trimmingCharacters(in: .whitespacesAndNewlines)).flatMap { $0.isEmpty ? nil : $0 } ?? "path-machine"
        let dna = imprint(kind: kind, identity: id, role: r, pathId: pid, hopKind: "touch", detail: "decider-stamped")
        return "coin dna touch ok kind=\(dna.machineKind) id=\(dna.identity) role=\(dna.role) imprint=\(dna.imprintId.prefix(8)) pathId=\(pid)"
    }

    // MARK: Internals

    private static func chooseVia(_ dest: String) -> String {
        let d = dest.lowercased()
        if d.contains("bluetooth") || d.contains("ble") || d == "iphone" || d == "mac" || d.contains("near") {
            return "bluetooth"
        }
        if d.contains("lan") || d.contains("bonjour") { return "lan" }
        if d.contains("usb") || d.contains("wire") || d.contains("cable") { return "usb" }
        if d.contains("qr") || d.contains("optical") { return "qr" }
        if d.contains("nfc") || d.contains("tap") { return "nfc" }
        if d.contains("share") || d.contains("airdrop") { return "share" }
        if dest.contains("://") || dest.contains(".") { return "internet" }
        if ["tower", "repeater", "hub", "storage", "relay"].contains(where: { d.contains($0) }) {
            return "infra"
        }
        return "local"
    }

    private static func scoutHop(pathId: String, dest: String, via: String, hopIndex: Int = 1) -> String {
        var findings: [(String, String, String, String?)] = []
        let seatDNA = imprintSeat(pathId: pathId, hopKind: "hop-\(hopIndex)", role: "hop-seat")

        let inbox = ClayCommandInbox.url
        if let raw = try? String(contentsOf: inbox, encoding: .utf8),
           !raw.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            findings.append(("anomaly", "inbox-backlog-on-path", "block", "inbox-drain-stall"))
        }

        let docs = MindTranscript.documentsURL
        let app = MindTranscript.appSupportURL
        let feed = MachineMindVault.feeds.appendingPathComponent(MindTranscript.fileName)
        func sz(_ u: URL) -> Int { (try? Data(contentsOf: u))?.count ?? 0 }
        let d = sz(docs), a = sz(app), f = sz(feed)
        if d > 0 && (a > 0 || f > 0) {
            let maxv = max(d, max(a, f)), minv = min(d, min(a == 0 ? d : a, f == 0 ? d : f))
            if maxv > 0 && minv * 2 < maxv {
                findings.append(("anomaly", "mind-feed-drift-on-path", "block", "mind-feed-drift"))
            }
        }

        if via == "bluetooth" || via == "ble" || via == "near" {
            let relayDNA = imprint(
                kind: "relay",
                identity: NearLinkBluetooth.relayIdentity,
                role: "path-bluetooth-relay",
                pathId: pathId,
                hopKind: "hop-\(hopIndex)",
                detail: "via=\(via) dest=\(dest)"
            )
            findings.append(("hop", "bluetooth-hop dest=\(dest) dna=\(relayDNA.imprintId.prefix(8))", "info", nil))
        } else if via == "internet" || via == "infra" || dest.contains("://") || dest.contains(".")
                    || ["tower", "repeater", "hub", "storage", "relay"].contains(where: { dest.lowercased().contains($0) }) {
            let host = extractHost(dest)
            let infraKind = guessInfraKind(host: host, dest: dest)
            let infraDNA = imprint(
                kind: infraKind, identity: host, role: "path-\(infraKind)",
                pathId: pathId, hopKind: "hop-\(hopIndex)", detail: "via=\(via) dest=\(dest)"
            )
            let probe = (via == "internet" || dest.contains("://") || dest.contains("."))
                ? probeHost(host)
                : Probe(detail: "infra-touch kind=\(infraKind) id=\(host)", severity: "info", strange: false, clog: nil)
            findings.append(("hop", "\(infraKind)-hop host=\(host) \(probe.detail) dna=\(infraDNA.imprintId.prefix(8))", probe.severity, probe.clog))
            if probe.strange {
                findings.append(("mystery", "path-strangeness \(probe.detail)", "strange", probe.clog))
            }
        } else {
            findings.append(("hop", "local-hop dest=\(dest) seat=\(seatDevice) dna=\(seatDNA.imprintId.prefix(8))", "info", nil))
        }

        var out: [String] = []
        for (kind, note, sev, clog) in findings {
            let e = Event(
                pathId: pathId, kind: kind, note: note, detail: "hop=\(hopIndex) via=\(via)",
                device: seatDevice, ts: Int(Date().timeIntervalSince1970), clog: clog, severity: sev,
                dnaImprintId: seatDNA.imprintId
            )
            _ = append(e)
            out.append("\(kind)/\(sev): \(note)")
            if sev == "block", let clog {
                out.append(clearObstruction(clog, pathId: pathId))
            }
        }
        return "scout hop \(hopIndex):\n" + out.joined(separator: "\n")
    }

    private static func extractHost(_ dest: String) -> String {
        if let u = URL(string: dest), let h = u.host { return h }
        return dest
            .replacingOccurrences(of: "https://", with: "")
            .replacingOccurrences(of: "http://", with: "")
            .split(separator: "/").first.map(String.init) ?? dest
    }

    private struct Probe {
        let detail: String
        let severity: String
        let strange: Bool
        let clog: String?
    }

    private static func probeHost(_ host: String) -> Probe {
        var available = false
        let sem = DispatchSemaphore(value: 0)
        let monitor = NWPathMonitor()
        let q = DispatchQueue(label: "ya.coin.pathscout")
        monitor.pathUpdateHandler = { path in
            available = (path.status == .satisfied)
            sem.signal()
            monitor.cancel()
        }
        monitor.start(queue: q)
        _ = sem.wait(timeout: .now() + 0.8)
        if !available {
            return Probe(detail: "network-unsatisfied host=\(host)", severity: "strange", strange: true, clog: nil)
        }
        if host.count > 80 || host.contains(" ") {
            return Probe(detail: "malformed-host", severity: "block", strange: true, clog: nil)
        }
        return Probe(detail: "path-open host=\(host)", severity: "info", strange: false, clog: nil)
    }

    private static func guessClog(from text: String) -> String? {
        let t = text.lowercased()
        if t.contains("inbox") || t.contains("drain") || t.contains("stall") { return "inbox-drain-stall" }
        if t.contains("mind") || t.contains("transcript") || t.contains("feed") || t.contains("drift") { return "mind-feed-drift" }
        if t.contains("heart") || t.contains("spawn") || t.contains("generate") { return "heart-spawn-stall" }
        return nil
    }
}
