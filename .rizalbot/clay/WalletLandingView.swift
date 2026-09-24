import SwiftUI
#if canImport(AppKit)
import AppKit
#endif
#if canImport(UIKit)
import UIKit
#endif

/// In-app Я crypto wallet landing — works offline from WalletCard.json / App Support twin seat.
/// Online: optional explorer open. NonNuclear — no silent chain sends from this face.
struct WalletLandingView: View {
    @Binding var isPresented: Bool
    var isOnline: Bool = false

    @State private var card: WalletCard = .load()
    @State private var note: String? = nil
    @State private var pressedExit = false

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.black, Color(red: 0.12, green: 0.08, blue: 0.04), Color.black],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            .allowsHitTesting(false)

            VStack(spacing: 16) {
                HStack {
                    if ClayImage.exists("BtnWallet") {
                        Image("BtnWallet")
                            .resizable()
                            .interpolation(.high)
                            .aspectRatio(contentMode: .fit)
                            // Match ClayModeButton / on-off switch (32×32)
                            .frame(width: 32, height: 32)
                            .shadow(color: .black.opacity(0.45), radius: 4, y: 2)
                    } else {
                        Image(systemName: "creditcard.fill")
                            .font(.system(size: 22))
                            .foregroundStyle(ClayTheme.offWhite)
                    }
                    VStack(alignment: .leading, spacing: 4) {
                        Text(card.title)
                            .font(ClayTheme.clayFont(size: 22, weight: .bold))
                            .foregroundStyle(ClayTheme.offWhite)
                        Text(card.subtitle)
                            .font(ClayTheme.clayFont(size: 12, weight: .medium))
                            .foregroundStyle(ClayTheme.offWhite.opacity(0.75))
                    }
                    Spacer()
                    Text(isOnline ? "ONLINE" : "OFFLINE")
                        .font(ClayTheme.clayFont(size: 11, weight: .bold))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Capsule().fill(isOnline ? Color.green.opacity(0.35) : Color.gray.opacity(0.35)))
                        .foregroundStyle(ClayTheme.offWhite)
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)

                ScrollView {
                    VStack(alignment: .leading, spacing: 12) {
                        row("Name", "\(card.name)  ·  symbol \(card.symbol)")
                        row("Mint", card.mint)
                        row("Cluster", card.cluster)
                        if let s = card.supply_ui { row("Supply", "\(s) (decimals \(card.decimals.map(String.init) ?? "?"))") }
                        if let ata = card.owner_ata { row("ATA", ata) }
                        if let a = card.mint_authority { row("Mint authority", a) }
                        if let a = card.freeze_authority { row("Freeze authority", a) }
                        if let sig = card.signature { row("Mint tx", sig) }
                        if let slot = card.slot { row("Slot", "\(slot)") }
                        if let st = card.status { row("Status", st) }
                        if let meta = card.metadata_account { row("Metadata", meta) }
                        row("Law", card.law)
                        if !card.utilities.isEmpty {
                            row("Utilities", card.utilities.joined(separator: " · "))
                        }
                        Text("Purpose: hardcode explorer-verified twin so clay shows mint/ATA/tx offline.\nIntent: Decider-gated verify; explorers are mirrors only — clay owns source.")
                            .font(ClayTheme.clayFont(size: 12, weight: .medium))
                            .foregroundStyle(ClayTheme.offWhite.opacity(0.8))
                            .padding(.top, 4)
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(Color.white.opacity(0.07))
                            .overlay(
                                RoundedRectangle(cornerRadius: 18, style: .continuous)
                                    .stroke(Color.orange.opacity(0.35), lineWidth: 1.2)
                            )
                    )
                    .padding(.horizontal, 18)
                }

                ZStack {
                    HStack(spacing: 12) {
                        ClayButton(
                            asset: "BtnWallet",
                            systemFallback: "doc.on.doc",
                            width: 32,
                            height: 32,
                            help: "Copy mint address"
                        ) {
                            copyMint()
                        }
                        if isOnline, let url = URL(string: card.explorer ?? "") {
                            ClayButton(
                                asset: "BtnSearch",
                                systemFallback: "safari",
                                width: 32,
                                height: 32,
                                help: "Open explorer (online)"
                            ) {
                                openURL(url)
                            }
                        }
                        Spacer()
                        ClayButton(
                            asset: "BtnMind",
                            systemFallback: "xmark.circle.fill",
                            width: 44,
                            height: 44,
                            help: "Exit wallet"
                        ) {
                            pressedExit = true
                            isPresented = false
                        }
                    }

                    // Center home — Decider house as 3D clay button → chat home
                    ClayButton(
                        asset: "BtnHomeHouse",
                        systemFallback: "house.fill",
                        width: 52,
                        height: 52,
                        help: "Home — back to chat"
                    ) {
                        pressedExit = true
                        withAnimation(.easeInOut(duration: 0.18)) {
                            isPresented = false
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 18)
            }
        }
        .overlay(alignment: .bottom) {
            if let note {
                Text(note)
                    .font(ClayTheme.clayFont(size: 13, weight: .bold))
                    .foregroundStyle(ClayTheme.offWhite)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Capsule().fill(ClayTheme.charcoalDeep.opacity(0.94)))
                    .padding(.bottom, 72)
            }
        }
        .onAppear { card = .load() }
    }

    private func row(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label.uppercased())
                .font(ClayTheme.clayFont(size: 10, weight: .bold))
                .foregroundStyle(Color.orange.opacity(0.85))
            Text(value)
                .font(ClayTheme.clayFont(size: 13, weight: .medium))
                .foregroundStyle(ClayTheme.offWhite)
                .textSelection(.enabled)
        }
    }

    private func copyMint() {
        #if canImport(AppKit)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(card.mint, forType: .string)
        #elseif canImport(UIKit)
        UIPasteboard.general.string = card.mint
        #endif
        flash("Mint copied")
    }

    private func openURL(_ url: URL) {
        #if canImport(AppKit)
        NSWorkspace.shared.open(url)
        #elseif canImport(UIKit)
        UIApplication.shared.open(url)
        #endif
        flash("Opened explorer")
    }

    private func flash(_ s: String) {
        withAnimation { note = s }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) {
            withAnimation { if note == s { note = nil } }
        }
    }
}

struct WalletCard: Equatable {
    var title: String = "Я WALLET"
    var subtitle: String = "Offline-premier twin · public Solana mirror"
    var name: String = "Я"
    var symbol: String = "Я"
    var mint: String = ""
    var cluster: String = "mainnet-beta"
    var supply_ui: String? = nil
    var decimals: Int? = nil
    var explorer: String? = nil
    var tx: String? = nil
    var metadata_account: String? = nil
    var owner_ata: String? = nil
    var mint_authority: String? = nil
    var freeze_authority: String? = nil
    var signature: String? = nil
    var slot: Int? = nil
    var status: String? = nil
    var utilities: [String] = []
    var law: String = "Crown Я. Try Я first; R only by Decider order."

    static func load() -> WalletCard {
        // Prefer hardcoded twin constants, then disk seats, then bundle.
        var c = fromTwinChain()
        let urls: [URL] = [
            FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first?
                .appendingPathComponent("ЯBOT/twin/wallet-card.json"),
            FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first?
                .appendingPathComponent("ЯBOT/twin/mint/last-mint-mainnet.json"),
            Bundle.main.url(forResource: "WalletCard", withExtension: "json"),
            Bundle.main.url(forResource: "ChainSource", withExtension: "json"),
        ].compactMap { $0 }

        for url in urls {
            if let data = try? Data(contentsOf: url),
               let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                let twin = (obj["twin"] as? [String: Any]) ?? obj
                let parsed = fromJSON(twin)
                if !parsed.mint.isEmpty && !parsed.mint.hasPrefix("(") {
                    return parsed
                }
            }
        }
        if !c.mint.isEmpty { return c }
        c.mint = "(no mint seated yet — twin paste / last-mint-mainnet.json)"
        return c
    }

    /// Always-available hardcoded explorer-verified twin (compiled into binary).
    static func fromTwinChain() -> WalletCard {
        var c = WalletCard()
        c.title = "Я WALLET"
        c.subtitle = "Offline-premier twin · public Solana mirror · hardcoded"
        c.name = YaTwinChain.crownName
        c.symbol = YaTwinChain.crownSymbol
        c.mint = YaTwinChain.mint
        c.cluster = YaTwinChain.cluster
        c.supply_ui = YaTwinChain.supplyUI
        c.decimals = YaTwinChain.decimals
        c.owner_ata = YaTwinChain.ownerATA
        c.mint_authority = YaTwinChain.mintAuthority
        c.freeze_authority = YaTwinChain.freezeAuthority
        c.signature = YaTwinChain.mintSignature
        c.slot = Int(YaTwinChain.slot)
        c.status = YaTwinChain.status
        c.metadata_account = YaTwinChain.metadataAccount
        c.explorer = YaTwinChain.solscanToken
        c.tx = YaTwinChain.solscanTx
        c.utilities = YaTwinChain.utilities
        c.law = YaTwinChain.law
        return c
    }

    private static func fromJSON(_ obj: [String: Any]) -> WalletCard {
        var c = WalletCard()
        c.title = obj["title"] as? String ?? "Я WALLET"
        c.subtitle = obj["subtitle"] as? String ?? c.subtitle
        c.name = obj["name"] as? String ?? obj["intendedName"] as? String ?? "Я"
        c.symbol = obj["symbol"] as? String ?? "Я"
        c.mint = obj["mint"] as? String ?? ""
        c.cluster = obj["cluster"] as? String ?? obj["cluster"] as? String ?? "mainnet-beta"
        if let cluster = obj["cluster"] as? String { c.cluster = cluster }
        c.supply_ui = obj["supply_ui"] as? String
        c.decimals = obj["decimals"] as? Int
        if let exp = obj["explorer"] as? String {
            c.explorer = exp
        } else if let exp = obj["explorer"] as? [String: Any] {
            c.explorer = exp["solscan_token"] as? String
        }
        c.tx = obj["tx"] as? String
        if c.tx == nil, let exp = obj["explorer"] as? [String: Any] {
            c.tx = exp["solscan_tx"] as? String
        }
        c.metadata_account = obj["metadata_account"] as? String
        c.owner_ata = obj["owner_ata"] as? String
        c.mint_authority = obj["mint_authority"] as? String
        c.freeze_authority = obj["freeze_authority"] as? String
        c.signature = obj["signature"] as? String
        if let slot = obj["slot"] as? Int { c.slot = slot }
        else if let slot = obj["slot"] as? NSNumber { c.slot = slot.intValue }
        c.status = obj["status"] as? String
        c.utilities = obj["utilities"] as? [String] ?? []
        c.law = obj["law"] as? String ?? c.law
        if c.mint.isEmpty { c.mint = "(missing mint)" }
        return c
    }
}
