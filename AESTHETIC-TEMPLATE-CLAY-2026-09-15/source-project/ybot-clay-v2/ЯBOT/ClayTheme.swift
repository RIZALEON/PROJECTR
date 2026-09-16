import SwiftUI
#if canImport(AppKit)
import AppKit
#endif

/// System-wide claymation design tokens. Every surface should feel hand-molded.
enum ClayTheme {
    static let purple = Color(red: 0.36, green: 0.25, blue: 0.83)
    static let purpleDeep = Color(red: 0.28, green: 0.18, blue: 0.68)
    static let purpleClay = Color(red: 0.42, green: 0.28, blue: 0.72)
    static let gold = Color(red: 0.82, green: 0.68, blue: 0.28)
    static let charcoal = Color(red: 0.12, green: 0.12, blue: 0.14)
    static let charcoalDeep = Color(red: 0.06, green: 0.06, blue: 0.07)
    static let panel = Color(red: 0.20, green: 0.20, blue: 0.22)
    static let panelRaised = Color(red: 0.27, green: 0.27, blue: 0.29)
    static let bubbleUser = Color(red: 0.90, green: 0.90, blue: 0.92)
    static let bubbleAssistant = Color(red: 0.28, green: 0.28, blue: 0.31)
    static let offWhite = Color(red: 0.94, green: 0.94, blue: 0.96)
    static let muted = Color(red: 0.62, green: 0.62, blue: 0.66)
    static let orangeBolt = Color(red: 0.98, green: 0.55, blue: 0.12)
    static let onlineGreen = Color(red: 0.22, green: 0.78, blue: 0.42)
    static let offlineRed = Color(red: 0.90, green: 0.32, blue: 0.22)

    static let panelRadius: CGFloat = 32
    static let bubbleRadius: CGFloat = 20
    static let chromeSize: CGFloat = 64
}

enum ClayImage {
    static func exists(_ name: String) -> Bool {
        #if canImport(AppKit)
        return NSImage(named: name) != nil
        #else
        return false
        #endif
    }
}

struct ClayBackground: View {
    var body: some View {
        ZStack {
            if ClayImage.exists("ClayWall") {
                Image("ClayWall")
                    .resizable()
                    .scaledToFill()
                    .clipped()
            } else {
                LinearGradient(
                    colors: [
                        ClayTheme.charcoalDeep,
                        ClayTheme.charcoal,
                        Color(red: 0.14, green: 0.13, blue: 0.15)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                RadialGradient(
                    colors: [Color.white.opacity(0.04), .clear],
                    center: .topLeading,
                    startRadius: 10,
                    endRadius: 500
                )
                RadialGradient(
                    colors: [Color.black.opacity(0.45), .clear],
                    center: .bottomTrailing,
                    startRadius: 40,
                    endRadius: 620
                )
            }
            LinearGradient(
                colors: [Color.black.opacity(0.15), .clear, Color.black.opacity(0.32)],
                startPoint: .top,
                endPoint: .bottom
            )
        }
        .ignoresSafeArea()
    }
}

struct ClayEmboss: ViewModifier {
    var raised: Bool = true

    func body(content: Content) -> some View {
        content
            .shadow(
                color: raised ? Color.white.opacity(0.14) : Color.black.opacity(0.6),
                radius: raised ? 2 : 5,
                x: raised ? -1.5 : 2,
                y: raised ? -1.5 : 4
            )
            .shadow(
                color: raised ? Color.black.opacity(0.55) : Color.white.opacity(0.08),
                radius: raised ? 8 : 2,
                x: raised ? 3 : -1,
                y: raised ? 6 : -1
            )
    }
}

extension View {
    func clayEmboss(raised: Bool = true) -> some View {
        modifier(ClayEmboss(raised: raised))
    }
}

struct ClayAssetImage: View {
    let name: String
    let system: String
    var size: CGFloat = 28

    init(_ name: String, system: String, size: CGFloat = 28) {
        self.name = name
        self.system = system
        self.size = size
    }

    var body: some View {
        Group {
            if ClayImage.exists(name) {
                Image(name)
                    .resizable()
                    .interpolation(.high)
                    .aspectRatio(contentMode: .fit)
            } else {
                Image(systemName: system)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .foregroundStyle(ClayTheme.offWhite)
            }
        }
        .frame(width: size, height: size)
    }
}
