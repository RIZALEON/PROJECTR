import Foundation
import Network
#if canImport(CoreImage)
import CoreImage
#endif
#if os(macOS)
import AppKit
#endif
#if canImport(CoreNFC) && os(iOS)
import CoreNFC
#endif

/// Multi-carrier spine for Я COIN path-scout.
/// Offline premier pipes: bluetooth · lan · usb · qr · nfc · share
/// Internet never required. Every hop imprints Machine DNA for that relay.
enum CoinCarrierHub {
    enum Kind: String, CaseIterable {
        case bluetooth, lan, usb, qr, nfc, share

        var dnaRelayId: String {
            switch self {
            case .bluetooth: return NearLinkBluetooth.relayIdentity
            case .lan: return "lan-bonjour-ya-coin"
            case .usb: return "usb-wire-drop"
            case .qr: return "qr-optical-handshake"
            case .nfc: return "nfc-tap-link"
            case .share: return "share-airdrop-package"
            }
        }

        var dnaRole: String {
            switch self {
            case .bluetooth: return "bluetooth-nearlink"
            case .lan: return "lan-bonjour-relay"
            case .usb: return "usb-wire-relay"
            case .qr: return "qr-optical-relay"
            case .nfc: return "nfc-tap-relay"
            case .share: return "share-package-relay"
            }
        }
    }

    static func parse(_ raw: String) -> Kind? {
        switch raw.lowercased().trimmingCharacters(in: .whitespacesAndNewlines) {
        case "bluetooth", "ble", "bt", "near": return .bluetooth
        case "lan", "bonjour", "wifi-local", "local-lan": return .lan
        case "usb", "wire", "cable": return .usb
        case "qr", "optical", "camera": return .qr
        case "nfc", "tap": return .nfc
        case "share", "airdrop", "files": return .share
        default: return nil
        }
    }

    static func status() -> String {
        let bt: String = {
            if Thread.isMainThread { return NearLinkBluetooth.shared.statusLine }
            return DispatchQueue.main.sync { NearLinkBluetooth.shared.statusLine }
        }()
        let lan: String = {
            if Thread.isMainThread { return CoinLANCarrier.shared.statusLine }
            return DispatchQueue.main.sync { CoinLANCarrier.shared.statusLine }
        }()
        return """
        coin carriers (offline premier · Machine DNA on every pipe):
        • bluetooth — \(bt)
        • lan — \(lan)
        • usb — \(CoinUSBCarrier.statusLine())
        • qr — \(CoinQRCarrier.statusLine())
        • nfc — \(CoinNFCCarrier.statusLine())
        • share — \(CoinShareCarrier.statusLine())
        HOW: coin send <to> via bluetooth|lan|usb|qr|nfc|share
             coin lan on|off|clear · coin usb drain · coin qr eat <json|path>
             coin nfc eat <json|path> · coin share eat <path>
        """
    }

    static func transmit(kind: Kind, envelope: [String: Any], dest: String) -> String {
        let pathId = (envelope["pathId"] as? String) ?? UUID().uuidString
        _ = CoinPathScout.imprint(
            kind: "relay",
            identity: kind.dnaRelayId,
            role: kind.dnaRole,
            pathId: pathId,
            hopKind: "carrier-\(kind.rawValue)",
            detail: "dest=\(dest) via=\(kind.rawValue)"
        )
        switch kind {
        case .bluetooth:
            if Thread.isMainThread { return NearLinkBluetooth.shared.sendPathEnvelope(envelope) }
            return DispatchQueue.main.sync { NearLinkBluetooth.shared.sendPathEnvelope(envelope) }
        case .lan:
            if Thread.isMainThread { return CoinLANCarrier.shared.send(envelope: envelope, dest: dest) }
            return DispatchQueue.main.sync { CoinLANCarrier.shared.send(envelope: envelope, dest: dest) }
        case .usb:
            return CoinUSBCarrier.send(envelope: envelope, dest: dest)
        case .qr:
            return CoinQRCarrier.present(envelope: envelope, dest: dest)
        case .nfc:
            return CoinNFCCarrier.present(envelope: envelope, dest: dest)
        case .share:
            return CoinShareCarrier.exportPackage(envelope: envelope, dest: dest)
        }
    }
}

// MARK: - LAN Bonjour

@MainActor
final class CoinLANCarrier {
    static let shared = CoinLANCarrier()
    /// Must match Info.plist NSBonjourServices exactly.
    static let serviceType = "_ya-coin-lan._tcp"
    static let serviceNamePrefix = "ya-coin"
    /// nil = system default (local.) — explicit "local." has failed to publish on some iOS seats.
    static let bonjourDomain: String? = nil

    private var listener: NWListener?
    private var browser: NWBrowser?
    private var connections: [NWConnection] = []
    private(set) var running = false
    private(set) var peers: [String] = []
    /// Remotes learned from inbound connections (fixes Mac browse-blind when iPhone publishes poorly).
    private var rememberedEndpoints: [String: NWEndpoint] = [:]
    /// Live inbound TCP sockets — true return path (hostPort from accept is an ephemeral client port; do not dial it).
    private var liveInbound: [String: NWConnection] = [:]
    private(set) var lastError: String?
    private(set) var tx = 0
    private(set) var rx = 0

    private var selfServiceName: String {
        "\(Self.serviceNamePrefix)-\(CoinPathScout.seatDevicePublic)"
    }

    var statusLine: String {
        let p = peers.isEmpty ? "none" : peers.joined(separator: ",")
        let mem = rememberedEndpoints.keys.sorted().joined(separator: ",")
        let live = liveInbound.keys.sorted().joined(separator: ",")
        let m = mem.isEmpty ? "none" : mem
        let l = live.isEmpty ? "none" : live
        return "\(running ? "ON" : "OFF") peers=[\(p)] remembered=[\(m)] live=[\(l)] tx=\(tx) rx=\(rx) err=\(lastError ?? "none")"
    }

    private static func makeTCPParams() -> NWParameters {
        let tcp = NWProtocolTCP.Options()
        tcp.enableKeepalive = true
        let params = NWParameters(tls: nil, tcp: tcp)
        params.includePeerToPeer = true
        params.allowLocalEndpointReuse = true
        return params
    }

    func start() -> String {
        if running { return "coin lan already on · \(statusLine)" }
        lastError = nil
        do {
            let listenParams = Self.makeTCPParams()
            let listener = try NWListener(using: listenParams)
            let name = selfServiceName
            let bonjour = NWListener.Service(name: name, type: Self.serviceType, domain: Self.bonjourDomain)
            listener.service = bonjour
            listener.serviceRegistrationUpdateHandler = { [weak self] change in
                Task { @MainActor in
                    switch change {
                    case .add(let ep):
                        self?.lastError = nil
                        #if DEBUG
                        print("coin lan registered \(ep)")
                        #endif
                    case .remove(let ep):
                        self?.lastError = "bonjour-removed:\(ep)"
                    @unknown default:
                        break
                    }
                }
            }
            listener.stateUpdateHandler = { [weak self] state in
                Task { @MainActor in
                    switch state {
                    case .failed(let e):
                        self?.lastError = "listen:\(e)"
                    case .ready:
                        // Re-assert service on ready so iOS actually publishes.
                        if self?.listener?.service == nil {
                            self?.listener?.service = bonjour
                        }
                    default:
                        break
                    }
                }
            }
            listener.newConnectionHandler = { [weak self] conn in
                Task { @MainActor in self?.accept(conn) }
            }
            listener.start(queue: DispatchQueue.global(qos: .userInitiated))
            self.listener = listener

            // Fresh params for browser — sharing listener params can starve browse on macOS.
            let browseParams = Self.makeTCPParams()
            let browser = NWBrowser(
                for: .bonjour(type: Self.serviceType, domain: Self.bonjourDomain),
                using: browseParams
            )
            browser.stateUpdateHandler = { [weak self] state in
                Task { @MainActor in
                    if case .failed(let e) = state {
                        self?.lastError = "browse:\(e)"
                    }
                }
            }
            browser.browseResultsChangedHandler = { [weak self] results, _ in
                Task { @MainActor in
                    let names = results.compactMap { r -> String? in
                        if case .service(let n, _, _, _) = r.endpoint { return n }
                        return nil
                    }.sorted()
                    self?.peers = names
                }
            }
            browser.start(queue: DispatchQueue.global(qos: .userInitiated))
            self.browser = browser
            running = true
            return "coin lan ON · service=\(Self.serviceType) name=\(name) · \(statusLine)\nHOW: other seat → `coin lan on`, then `coin send <to> via lan`"
        } catch {
            lastError = error.localizedDescription
            return "coin lan FAIL · \(error.localizedDescription)"
        }
    }

    func stop() -> String {
        listener?.cancel(); browser?.cancel()
        connections.forEach { $0.cancel() }
        connections = []; peers = []; rememberedEndpoints.removeAll(); liveInbound.removeAll()
        listener = nil; browser = nil; running = false
        return "coin lan OFF · \(statusLine)"
    }

    func clear() -> String {
        tx = 0; rx = 0; lastError = nil
        connections.forEach { $0.cancel() }; connections = []; peers = []
        if running {
            _ = stop()
            return start()
        }
        return "coin lan cleared · \(statusLine)"
    }

    /// Map clay dest label → Bonjour service name.
    private func expectedPeerName(for dest: String) -> String? {
        let d = dest.lowercased()
        if d.contains("iphone") || d == "ios" || d == "phone" {
            return "\(Self.serviceNamePrefix)-iphone"
        }
        if d == "mac" || d.contains("mac") {
            return "\(Self.serviceNamePrefix)-mac"
        }
        return nil
    }

    func send(envelope: [String: Any], dest: String) -> String {
        guard running else { return "coin lan tx blocked: LAN off. HOW: coin lan on" }
        guard let data = try? JSONSerialization.data(withJSONObject: envelope) else {
            return "coin lan tx FAIL · bad envelope"
        }
        let selfName = selfServiceName.lowercased()
        let d = dest.lowercased()
        let results = Array(browser?.browseResults ?? [])
        func peerName(_ r: NWBrowser.Result) -> String? {
            if case .service(let name, _, _, _) = r.endpoint { return name }
            return nil
        }
        let nonSelf = results.filter { peerName($0)?.lowercased() != selfName }
        let matched = nonSelf.first { r in
            guard let n = peerName(r)?.lowercased() else { return false }
            if d == "lan" || d == "all" || d == "*" { return true }
            if d.contains("iphone") || d == "ios" || d == "phone" {
                return n.contains("iphone") || n.contains("ios")
            }
            if d == "mac" || d.contains("mac") {
                return n.contains("mac")
            }
            return n.contains(d) || d.contains(n)
        }

        // 0) Prefer a live inbound TCP (return-path). Ephemeral client hostPort must not be dialed.
        let liveKeys: [String] = {
            var keys: [String] = [d, "lan-peer"]
            if let want = expectedPeerName(for: dest) { keys.insert(want.lowercased(), at: 0) }
            if d.contains("iphone") || d == "ios" || d == "phone" {
                keys.append(contentsOf: ["ya-coin-iphone", "iphone"])
            }
            if d == "mac" || d.contains("mac") {
                keys.append(contentsOf: ["ya-coin-mac", "mac"])
            }
            return keys
        }()
        for key in liveKeys {
            if let live = liveInbound[key.lowercased()], live.state == .ready {
                return sendFrame(data, on: live, dest: dest, via: "live-inbound", cancelWhenDone: false)
            }
        }

        let endpoint: NWEndpoint?
        // 1) Prefer live browse match; 2) Bonjour service name (never dial remembered hostPort).
        if let result = matched ?? nonSelf.first {
            endpoint = result.endpoint
        } else if let want = expectedPeerName(for: dest), want.lowercased() != selfName {
            endpoint = NWEndpoint.service(
                name: want,
                type: Self.serviceType,
                domain: Self.bonjourDomain ?? "local.",
                interface: nil
            )
        } else {
            endpoint = nil
        }

        guard let endpoint else {
            let seen = results.compactMap(peerName).joined(separator: ",")
            let mem = liveInbound.keys.sorted().joined(separator: ",")
            return "coin lan tx blocked: no remote LAN peers (seen=[\(seen)] live=[\(mem)] self=\(selfName)). Both seats: `coin lan on`. Seed return-path with a send from the other seat first."
        }

        let conn = NWConnection(to: endpoint, using: Self.makeTCPParams())
        connections.append(conn)
        let result = sendFrame(data, on: conn, dest: dest, via: "dial", cancelWhenDone: false, startIfNeeded: true)
        if result.contains("tx ok") {
            // Keep dial socket alive as return-path / multi-frame pipe.
            rememberRemote(from: conn)
            receiveFrame(on: conn)
        }
        return result
    }

    private func sendFrame(
        _ data: Data,
        on conn: NWConnection,
        dest: String,
        via: String,
        cancelWhenDone: Bool,
        startIfNeeded: Bool = false
    ) -> String {
        let box = SendBox()
        let sem = DispatchSemaphore(value: 0)
        let sendNow = {
            var frame = Data()
            var len = UInt32(data.count).bigEndian
            frame.append(Data(bytes: &len, count: 4))
            frame.append(data)
            conn.send(content: frame, completion: .contentProcessed { err in
                box.ok = (err == nil)
                box.err = err.map { "\($0)" } ?? ""
                if cancelWhenDone { conn.cancel() }
                sem.signal()
            })
        }
        if startIfNeeded {
            conn.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    sendNow()
                case .failed(let e):
                    box.err = "\(e)"
                    sem.signal()
                default:
                    break
                }
            }
            conn.start(queue: DispatchQueue.global(qos: .userInitiated))
        } else {
            sendNow()
        }
        _ = sem.wait(timeout: .now() + 10)
        if box.ok {
            tx += 1
            return "coin lan tx ok bytes=\(data.count) dest=\(dest) via=\(via) tx=\(tx)"
        }
        lastError = box.err.isEmpty ? "timeout" : box.err
        if via == "live-inbound" {
            // Drop dead return-path sockets so the next inbound can reseat them.
            liveInbound = liveInbound.filter { $0.value !== conn }
        }
        return "coin lan tx FAIL · \(lastError ?? "unknown") via=\(via)"
    }

    private func rememberRemote(from conn: NWConnection) {
        guard let ep = conn.currentPath?.remoteEndpoint else {
            // Still seat the live socket under lan-peer even before path is ready.
            liveInbound["lan-peer"] = conn
            return
        }
        let key: String
        switch ep {
        case .service(let n, _, _, _):
            key = n.lowercased()
        case .hostPort(let host, _):
            key = "host-\(host)"
        default:
            key = "lan-peer"
        }
        // Keep endpoint for status only — never dial hostPort (ephemeral client port).
        rememberedEndpoints[key] = ep
        rememberedEndpoints["lan-peer"] = ep
        liveInbound["lan-peer"] = conn
        // Seat aliases for clay dest labels.
        if key.contains("iphone") || key.contains("ios") {
            rememberedEndpoints["ya-coin-iphone"] = ep
            rememberedEndpoints["iphone"] = ep
            liveInbound["ya-coin-iphone"] = conn
            liveInbound["iphone"] = conn
        } else {
            // Inbound to Mac is almost always the iPhone seat.
            #if os(macOS)
            rememberedEndpoints["ya-coin-iphone"] = ep
            rememberedEndpoints["iphone"] = ep
            liveInbound["ya-coin-iphone"] = conn
            liveInbound["iphone"] = conn
            #endif
            #if os(iOS)
            rememberedEndpoints["ya-coin-mac"] = ep
            rememberedEndpoints["mac"] = ep
            liveInbound["ya-coin-mac"] = conn
            liveInbound["mac"] = conn
            #endif
        }
    }

    private func accept(_ conn: NWConnection) {
        connections.append(conn)
        conn.pathUpdateHandler = { [weak self] path in
            guard path.status == .satisfied else { return }
            Task { @MainActor in self?.rememberRemote(from: conn) }
        }
        conn.stateUpdateHandler = { [weak self] state in
            switch state {
            case .ready:
                Task { @MainActor in self?.rememberRemote(from: conn) }
            case .failed(let e):
                Task { @MainActor in self?.lastError = "rx-conn:\(e)" }
            default:
                break
            }
        }
        conn.start(queue: DispatchQueue.global(qos: .userInitiated))
        receiveFrame(on: conn)
    }

    private func receiveFrame(on conn: NWConnection) {
        conn.receive(minimumIncompleteLength: 4, maximumLength: 4) { [weak self] hdr, _, isComplete, err in
            guard let self else { return }
            if let err {
                Task { @MainActor in self.lastError = "rx-hdr:\(err)" }
                return
            }
            guard let hdr, hdr.count == 4 else { return }
            let len = Int(hdr.withUnsafeBytes { $0.load(as: UInt32.self).bigEndian })
            guard len > 0, len < 8_000_000 else {
                Task { @MainActor in self.lastError = "rx-bad-len:\(len)" }
                return
            }
            conn.receive(minimumIncompleteLength: len, maximumLength: len) { data, _, _, err in
                if let err {
                    Task { @MainActor in self.lastError = "rx-body:\(err)" }
                    return
                }
                guard let data,
                      let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                    Task { @MainActor in self.lastError = "rx-json" }
                    return
                }
                Task { @MainActor in
                    self.rx += 1
                    self.rememberRemote(from: conn)
                    _ = CoinPathScout.ingestRemoteEnvelope(obj, fromPeer: "lan-peer")
                }
                // Keep listening for return-path / multi-frame on this TCP.
                self.receiveFrame(on: conn)
            }
        }
    }
}

private final class SendBox: @unchecked Sendable {
    var ok = false
    var err = ""
}

// MARK: - USB wire drop

enum CoinUSBCarrier {
    static var dropDir: URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Documents")
        let dir = docs.appendingPathComponent("Я/gut/wire-drop", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    static func statusLine() -> String {
        let files = (try? FileManager.default.contentsOfDirectory(atPath: dropDir.path)) ?? []
        let pending = files.filter { $0.hasSuffix(".ya-path.json") }
        return "drop=\(dropDir.path) pending=\(pending.count)"
    }

    static func send(envelope: [String: Any], dest: String) -> String {
        var env = envelope
        env["carrier"] = "usb"
        env["wireDest"] = dest
        guard let data = try? JSONSerialization.data(withJSONObject: env, options: [.prettyPrinted]) else {
            return "coin usb tx FAIL · bad envelope"
        }
        let name = "path-\(Int(Date().timeIntervalSince1970))-\(UUID().uuidString.prefix(6)).ya-path.json"
        let url = dropDir.appendingPathComponent(name)
        do {
            try data.write(to: url)
            return "coin usb tx ok file=\(url.path) dest=\(dest)\nHOW: copy file to peer Documents/Я/gut/wire-drop then `coin usb drain`"
        } catch {
            return "coin usb tx FAIL · \(error.localizedDescription)"
        }
    }

    @discardableResult
    static func drain() -> String {
        let files = ((try? FileManager.default.contentsOfDirectory(at: dropDir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "json" && $0.lastPathComponent.contains(".ya-path") }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }
        // also accept *.ya-path.json via suffix check
        let pending = ((try? FileManager.default.contentsOfDirectory(at: dropDir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.lastPathComponent.hasSuffix(".ya-path.json") }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }
        let list = pending.isEmpty ? files : pending
        guard !list.isEmpty else {
            return "coin usb drain: no pending .ya-path.json in \(dropDir.path)"
        }
        var lines: [String] = []
        let archive = dropDir.appendingPathComponent("received", isDirectory: true)
        try? FileManager.default.createDirectory(at: archive, withIntermediateDirectories: true)
        for url in list {
            guard let data = try? Data(contentsOf: url),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                lines.append("skip corrupt \(url.lastPathComponent)")
                continue
            }
            let summary = CoinPathScout.ingestRemoteEnvelope(obj, fromPeer: "usb-wire")
            try? FileManager.default.removeItem(at: url)
            try? data.write(to: archive.appendingPathComponent(url.lastPathComponent))
            lines.append("drained \(url.lastPathComponent) · \(summary)")
        }
        return "coin usb drain ok count=\(lines.count)\n" + lines.joined(separator: "\n")
    }
}

// MARK: - QR optical

enum CoinQRCarrier {
    static func statusLine() -> String { "ready (QR encode + eat JSON/file)" }

    static func present(envelope: [String: Any], dest: String) -> String {
        var slim: [String: Any] = [
            "t": "ya.coin.path",
            "v": 1,
            "pathId": envelope["pathId"] as? String ?? "",
            "fromSeat": envelope["fromSeat"] as? String ?? CoinPathScout.seatDevicePublic,
            "to": dest,
            "via": "qr",
            "carrier": "qr"
        ]
        if let events = envelope["events"] as? [[String: Any]] {
            slim["events"] = Array(events.suffix(3))
        }
        guard let data = try? JSONSerialization.data(withJSONObject: slim),
              let json = String(data: data, encoding: .utf8) else {
            return "coin qr FAIL · encode"
        }
        let dir = CoinUSBCarrier.dropDir.appendingPathComponent("qr", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let stamp = Int(Date().timeIntervalSince1970)
        let txt = dir.appendingPathComponent("path-\(stamp).ya-qr.json")
        try? json.write(to: txt, atomically: true, encoding: .utf8)
        var pngNote = "png=skipped"
        #if os(macOS) && canImport(CoreImage)
        if let png = renderQRMac(json) {
            let img = dir.appendingPathComponent("path-\(stamp).ya-qr.png")
            try? png.write(to: img)
            pngNote = "png=\(img.path)"
            NSWorkspace.shared.activateFileViewerSelecting([img])
        }
        #endif
        return "coin qr ready payload=\(txt.path) \(pngNote)\nHOW: peer → `coin qr eat <json-or-path>`"
    }

    static func eat(_ raw: String) -> String {
        let body = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if body.hasPrefix("{"),
           let data = body.data(using: .utf8),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            return CoinPathScout.ingestRemoteEnvelope(obj, fromPeer: "qr-optical")
        }
        var candidates: [URL] = [URL(fileURLWithPath: body)]
        if !body.hasPrefix("/") {
            let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
            if let docs {
                candidates.append(docs.appendingPathComponent(body))
                // strip leading Documents/
                let stripped = body.replacingOccurrences(of: "Documents/", with: "")
                candidates.append(docs.appendingPathComponent(stripped))
            }
        }
        for url in candidates {
            if let data = try? Data(contentsOf: url),
               let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                return CoinPathScout.ingestRemoteEnvelope(obj, fromPeer: "qr-optical")
            }
        }
        return "coin qr eat needs JSON payload or file path"
    }

    #if os(macOS) && canImport(CoreImage)
    private static func renderQRMac(_ text: String) -> Data? {
        let filter = CIFilter(name: "CIQRCodeGenerator")
        filter?.setValue(text.data(using: .utf8), forKey: "inputMessage")
        filter?.setValue("M", forKey: "inputCorrectionLevel")
        guard let out = filter?.outputImage else { return nil }
        let scaled = out.transformed(by: CGAffineTransform(scaleX: 10, y: 10))
        let rep = NSCIImageRep(ciImage: scaled)
        let ns = NSImage(size: rep.size)
        ns.addRepresentation(rep)
        guard let tiff = ns.tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: tiff) else { return nil }
        return bitmap.representation(using: .png, properties: [:])
    }
    #endif
}

// MARK: - NFC

enum CoinNFCCarrier {
    static func statusLine() -> String {
        #if canImport(CoreNFC) && os(iOS)
        if NFCNDEFReaderSession.readingAvailable {
            return "ready (CoreNFC NDEF token)"
        }
        return "CoreNFC unavailable on this iPhone seat"
        #else
        return "stub on Mac (stage token → iPhone tap / eat)"
        #endif
    }

    static func present(envelope: [String: Any], dest: String) -> String {
        let token: [String: Any] = [
            "t": "ya.coin.nfc",
            "v": 1,
            "pathId": envelope["pathId"] as? String ?? "",
            "fromSeat": envelope["fromSeat"] as? String ?? CoinPathScout.seatDevicePublic,
            "to": dest,
            "via": "nfc",
            "carrier": "nfc"
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: token),
              let s = String(data: data, encoding: .utf8) else {
            return "coin nfc FAIL · encode"
        }
        let url = CoinUSBCarrier.dropDir.appendingPathComponent("nfc-token-\(Int(Date().timeIntervalSince1970)).json")
        try? s.write(to: url, atomically: true, encoding: .utf8)
        return "coin nfc token ready file=\(url.path) · \(statusLine())\nHOW: peer `coin nfc eat <json-or-path>` (iPhone can later write NDEF from token)"
    }

    static func eat(_ raw: String) -> String {
        let body = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if let data = body.data(using: .utf8),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            return CoinPathScout.ingestRemoteEnvelope(obj, fromPeer: "nfc-tap")
        }
        if let data = try? Data(contentsOf: URL(fileURLWithPath: body)),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            return CoinPathScout.ingestRemoteEnvelope(obj, fromPeer: "nfc-tap")
        }
        return "coin nfc eat needs JSON token or file path"
    }
}

// MARK: - Share / AirDrop-class

enum CoinShareCarrier {
    static func statusLine() -> String { "ready (.ya-path package → Finder/share)" }

    static func exportPackage(envelope: [String: Any], dest: String) -> String {
        var env = envelope
        env["carrier"] = "share"
        env["shareDest"] = dest
        guard let data = try? JSONSerialization.data(withJSONObject: env, options: [.prettyPrinted]) else {
            return "coin share FAIL · encode"
        }
        let dir = CoinUSBCarrier.dropDir.appendingPathComponent("share", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let url = dir.appendingPathComponent("path-\(Int(Date().timeIntervalSince1970)).ya-path.json")
        do {
            try data.write(to: url)
            #if os(macOS)
            NSWorkspace.shared.activateFileViewerSelecting([url])
            #endif
            return "coin share package ready \(url.path)\nHOW: AirDrop/share to peer; peer `coin usb drain` or `coin share eat \(url.path)`"
        } catch {
            return "coin share FAIL · \(error.localizedDescription)"
        }
    }

    static func eat(path: String) -> String {
        let url = path.hasPrefix("/")
            ? URL(fileURLWithPath: path)
            : CoinUSBCarrier.dropDir.appendingPathComponent("share").appendingPathComponent(path)
        guard let data = try? Data(contentsOf: url),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return "coin share eat needs package path · tried \(url.path)"
        }
        return CoinPathScout.ingestRemoteEnvelope(obj, fromPeer: "share-package")
    }
}
