import Foundation
import MultipeerConnectivity
#if canImport(UIKit)
import UIKit
#endif

/// Near-field LINK ↔ LINK carrier for Я COIN path-scout.
/// MultipeerConnectivity rides Bluetooth + peer Wi‑Fi. No internet required.
/// Law: airplane mode ≠ dead — near-field keeps coin hops alive.
@MainActor
final class NearLinkBluetooth: NSObject {
    static let shared = NearLinkBluetooth()
    /// Multipeer service type: 1…15 lowercase chars
    static let serviceType = "yabot-coin"
    static let relayIdentity = "bt-nearlink-multipeer"

    private let myPeer: MCPeerID
    private var session: MCSession!
    private var advertiser: MCNearbyServiceAdvertiser?
    private var browser: MCNearbyServiceBrowser?

    private(set) var running = false
    private(set) var lastError: String?
    /// Peers discovered nearby (may not be session-linked yet).
    private(set) var seenPeers: [String] = []
    /// Peers with an active Multipeer session.
    private(set) var connectedPeers: [String] = []
    private(set) var lastRxSummary: String = ""
    private(set) var rxCount = 0
    private(set) var txCount = 0

    var statusLine: String {
        let seen = seenPeers.isEmpty ? "none" : seenPeers.joined(separator: ",")
        let linked = connectedPeers.isEmpty ? "none" : connectedPeers.joined(separator: ",")
        return "coin bt \(running ? "ON" : "OFF") me=\(myPeer.displayName) seen=[\(seen)] linked=[\(linked)] tx=\(txCount) rx=\(rxCount) err=\(lastError ?? "none") lastRx=\(lastRxSummary.isEmpty ? "—" : lastRxSummary)"
    }

    private override init() {
        #if os(iOS)
        let raw = "iphone-\(UIDevice.current.name)"
        #elseif os(macOS)
        let raw = "mac-\(Host.current().localizedName ?? "seat")"
        #else
        let raw = "seat"
        #endif
        myPeer = MCPeerID(displayName: String(raw.prefix(60)))
        super.init()
        rebuildSession()
    }

    private func rebuildSession() {
        session?.disconnect()
        session = MCSession(peer: myPeer, securityIdentity: nil, encryptionPreference: .required)
        session.delegate = self
        connectedPeers = []
    }

    func start() -> String {
        if running {
            // Refresh discovery without wiping counters
            restartDiscovery()
            return "coin bt already on · discovery refreshed · \(statusLine)"
        }
        lastError = nil
        rebuildSession()
        restartDiscovery()
        running = true
        return "coin bt ON · service=\(Self.serviceType) · \(statusLine)\nHOW: other seat → `coin bt on`, then `coin send <label> via bluetooth`"
    }

    func stop() -> String {
        stopDiscovery()
        session.disconnect()
        running = false
        connectedPeers = []
        seenPeers = []
        return "coin bt OFF · \(statusLine)"
    }

    /// Clear the connected/seen line and hop counters, then rediscover peers.
    func clear() -> String {
        txCount = 0
        rxCount = 0
        lastRxSummary = ""
        lastError = nil
        seenPeers = []
        connectedPeers = []
        rebuildSession()
        if running {
            restartDiscovery()
            return "coin bt cleared · rediscovering · \(statusLine)"
        }
        return "coin bt cleared · BT off · \(statusLine)\nHOW: `coin bt on` on both seats to recognize again"
    }

    /// Full reset: clear + force stop/start cycle.
    func reset() -> String {
        _ = stop()
        txCount = 0
        rxCount = 0
        lastRxSummary = ""
        lastError = nil
        seenPeers = []
        let on = start()
        return "coin bt reset · \(on)"
    }

    private func stopDiscovery() {
        advertiser?.stopAdvertisingPeer()
        browser?.stopBrowsingForPeers()
        advertiser = nil
        browser = nil
    }

    private func restartDiscovery() {
        stopDiscovery()
        let info = [
            "seat": CoinPathScout.seatDevicePublic,
            "role": "ya-coin-path",
            "v": "2"
        ]
        advertiser = MCNearbyServiceAdvertiser(peer: myPeer, discoveryInfo: info, serviceType: Self.serviceType)
        advertiser?.delegate = self
        advertiser?.startAdvertisingPeer()
        browser = MCNearbyServiceBrowser(peer: myPeer, serviceType: Self.serviceType)
        browser?.delegate = self
        browser?.startBrowsingForPeers()
    }

    func sendPathEnvelope(_ envelope: [String: Any]) -> String {
        guard running else { return "coin bt tx blocked: BT off. HOW: coin bt on" }
        // Refresh peer list from live session
        connectedPeers = session.connectedPeers.map(\.displayName)
        guard !session.connectedPeers.isEmpty else {
            return "coin bt tx blocked: no linked peer yet. seen=[\(seenPeers.isEmpty ? "none" : seenPeers.joined(separator: ","))]. Both seats: `coin bt clear` then `coin bt on`."
        }
        do {
            let data = try JSONSerialization.data(withJSONObject: envelope, options: [])
            try session.send(data, toPeers: session.connectedPeers, with: .reliable)
            txCount += 1
            let names = session.connectedPeers.map(\.displayName).joined(separator: ",")
            return "coin bt tx ok bytes=\(data.count) peers=[\(names)] tx=\(txCount)"
        } catch {
            lastError = error.localizedDescription
            return "coin bt tx FAIL · \(error.localizedDescription)"
        }
    }

    fileprivate func handleInbound(_ data: Data, from peer: MCPeerID) {
        rxCount += 1
        if !seenPeers.contains(peer.displayName) {
            seenPeers.append(peer.displayName)
        }
        guard let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            lastRxSummary = "non-json from \(peer.displayName)"
            return
        }
        lastRxSummary = CoinPathScout.ingestRemoteEnvelope(obj, fromPeer: peer.displayName)
    }

    /// Only the lexicographically smaller displayName invites — avoids dual-invite races.
    private func shouldInvite(_ other: MCPeerID) -> Bool {
        myPeer.displayName < other.displayName
    }
}

extension NearLinkBluetooth: MCSessionDelegate {
    nonisolated func session(_ session: MCSession, peer peerID: MCPeerID, didChange state: MCSessionState) {
        Task { @MainActor in
            self.connectedPeers = session.connectedPeers.map(\.displayName)
            switch state {
            case .connected:
                self.lastError = nil
                if !self.seenPeers.contains(peerID.displayName) {
                    self.seenPeers.append(peerID.displayName)
                }
            case .notConnected:
                // Drop from linked; keep in seen so recognition line stays honest
                self.connectedPeers = session.connectedPeers.map(\.displayName)
            case .connecting:
                break
            @unknown default:
                break
            }
        }
    }
    nonisolated func session(_ session: MCSession, didReceive data: Data, fromPeer peerID: MCPeerID) {
        Task { @MainActor in self.handleInbound(data, from: peerID) }
    }
    nonisolated func session(_ session: MCSession, didReceive stream: InputStream, withName streamName: String, fromPeer peerID: MCPeerID) {}
    nonisolated func session(_ session: MCSession, didStartReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, with progress: Progress) {}
    nonisolated func session(_ session: MCSession, didFinishReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, at localURL: URL?, withError error: Error?) {}
}

extension NearLinkBluetooth: MCNearbyServiceAdvertiserDelegate {
    nonisolated func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didNotStartAdvertisingPeer error: Error) {
        Task { @MainActor in self.lastError = "advertise: \(error.localizedDescription)" }
    }
    nonisolated func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didReceiveInvitationFromPeer peerID: MCPeerID, withContext context: Data?, invitationHandler: @escaping (Bool, MCSession?) -> Void) {
        Task { @MainActor in
            if !self.seenPeers.contains(peerID.displayName) {
                self.seenPeers.append(peerID.displayName)
            }
            invitationHandler(true, self.session)
        }
    }
}

extension NearLinkBluetooth: MCNearbyServiceBrowserDelegate {
    nonisolated func browser(_ browser: MCNearbyServiceBrowser, didNotStartBrowsingForPeers error: Error) {
        Task { @MainActor in self.lastError = "browse: \(error.localizedDescription)" }
    }
    nonisolated func browser(_ browser: MCNearbyServiceBrowser, foundPeer peerID: MCPeerID, withDiscoveryInfo info: [String: String]?) {
        Task { @MainActor in
            if !self.seenPeers.contains(peerID.displayName) {
                self.seenPeers.append(peerID.displayName)
            }
            // Skip if already linked
            if self.session.connectedPeers.contains(where: { $0.displayName == peerID.displayName }) {
                return
            }
            // One-sided invite prevents connection flaps
            guard self.shouldInvite(peerID) else { return }
            browser.invitePeer(peerID, to: self.session, withContext: nil, timeout: 15)
        }
    }
    nonisolated func browser(_ browser: MCNearbyServiceBrowser, lostPeer peerID: MCPeerID) {
        Task { @MainActor in
            self.seenPeers.removeAll { $0 == peerID.displayName }
            self.connectedPeers = self.session.connectedPeers.map(\.displayName)
        }
    }
}
