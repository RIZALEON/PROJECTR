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
                            .frame(width: 56, height: 56)
                            .shadow(color: .black.opacity(0.45), radius: 6, y: 3)
                    } else {
                        Image(systemName: "creditcard.fill")
                            .font(.system(size: 36))
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
                        row("Law", card.law)
                        if !card.utilities.isEmpty {
                            row("Utilities", card.utilities.joined(separator: " · "))
                        }
                        Text("Purpose: see twin mint + status without leaving clay.\nIntent: Decider-gated verify; explorers are mirrors only.")
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

                HStack(spacing: 12) {
                    ClayButton(
                        asset: "BtnWallet",
                        systemFallback: "doc.on.doc",
                        width: 44,
                        height: 44,
                        help: "Copy mint address"
                    ) {
                        copyMint()
                    }
                    if isOnline, let url = URL(string: card.explorer ?? "") {
                        ClayButton(
                            asset: "BtnSearch",
                            systemFallback: "safari",
                            width: 44,
                            height: 44,
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
    var utilities: [String] = []
    var law: String = "Crown Я. Try Я first; R only by Decider order."

    static func load() -> WalletCard {
        let urls: [URL] = [
            FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first?
                .appendingPathComponent("ЯBOT/twin/wallet-card.json"),
            FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first?
                .appendingPathComponent("ЯBOT/twin/mint/last-mint-mainnet.json"),
            Bundle.main.url(forResource: "WalletCard", withExtension: "json"),
        ].compactMap { $0 }

        for url in urls {
            if let data = try? Data(contentsOf: url),
               let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                return fromJSON(obj)
            }
        }
        // Fallback: TwinPipe / YaToken status text still reachable via chat.
        var c = WalletCard()
        c.mint = "(no mint seated yet — twin paste / last-mint-mainnet.json)"
        return c
    }

    private static func fromJSON(_ obj: [String: Any]) -> WalletCard {
        var c = WalletCard()
        c.title = obj["title"] as? String ?? "Я WALLET"
        c.subtitle = obj["subtitle"] as? String ?? c.subtitle
        c.name = obj["name"] as? String ?? obj["intendedName"] as? String ?? "Я"
        c.symbol = obj["symbol"] as? String ?? "Я"
        c.mint = obj["mint"] as? String ?? ""
        c.cluster = obj["cluster"] as? String ?? "mainnet-beta"
        c.supply_ui = obj["supply_ui"] as? String
        c.decimals = obj["decimals"] as? Int
        c.explorer = obj["explorer"] as? String
        c.tx = obj["tx"] as? String
        c.metadata_account = obj["metadata_account"] as? String
        c.utilities = obj["utilities"] as? [String] ?? []
        c.law = obj["law"] as? String ?? c.law
        if c.mint.isEmpty { c.mint = "(missing mint)" }
        return c
    }
}
