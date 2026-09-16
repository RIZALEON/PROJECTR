import SwiftUI
#if canImport(AppKit)
import AppKit
#endif

/// System-wide claymation design tokens. Every surface + glyph should feel hand-molded.
enum ClayTheme {
    static let purple = Color(red: 0.42, green: 0.28, blue: 0.86)
    static let purpleDeep = Color(red: 0.30, green: 0.18, blue: 0.68)
    static let purpleClay = Color(red: 0.38, green: 0.24, blue: 0.72)
    static let gold = Color(red: 0.86, green: 0.68, blue: 0.28)
    static let charcoal = Color(red: 0.14, green: 0.14, blue: 0.15)
    static let charcoalDeep = Color(red: 0.06, green: 0.06, blue: 0.07)
    /// Chat slab clay (vision mock — medium gray molded panel)
    static let slab = Color(red: 0.34, green: 0.34, blue: 0.36)
    static let slabRaised = Color(red: 0.42, green: 0.42, blue: 0.44)
    static let slabRecess = Color(red: 0.22, green: 0.22, blue: 0.24)
    static let bubbleUser = Color(red: 0.82, green: 0.82, blue: 0.84)
    static let bubbleAssistant = Color(red: 0.40, green: 0.40, blue: 0.42)
    static let offWhite = Color(red: 0.96, green: 0.96, blue: 0.97)
    static let muted = Color(red: 0.70, green: 0.70, blue: 0.72)
    static let orangeBolt = Color(red: 0.98, green: 0.55, blue: 0.12)
    static let onlineGreen = Color(red: 0.22, green: 0.78, blue: 0.42)
    static let offlineRed = Color(red: 0.90, green: 0.32, blue: 0.22)

    static let panelRadius: CGFloat = 36
    static let bubbleRadius: CGFloat = 22
    static let chromeSize: CGFloat = 64

    /// Stormclay — bundled claymation face on every device (macOS / iOS / visionOS).
    static let stormclayFamily = "Stormclay"
    static let stormclayPostScript = "Stormclay-Regular"

    static func clayFont(size: CGFloat, weight: Font.Weight = .semibold) -> Font {
        // Single-weight display face; weight kept for call-site API compatibility.
        _ = weight
        return .custom(stormclayFamily, size: size)
    }
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
    /// Foundational clay screen — fills any window size; crops edges, never distorts.
    var body: some View {
        GeometryReader { geo in
            let w = max(geo.size.width, 1)
            let h = max(geo.size.height, 1)
            ZStack {
                if ClayImage.exists("ClayWall") {
                    Image("ClayWall")
                        .resizable()
                        .interpolation(.high)
                        .scaledToFill()
                        .frame(width: w, height: h)
                        .clipped()
                        .accessibilityHidden(true)
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
                    .frame(width: w, height: h)
                }
                LinearGradient(
                    colors: [Color.black.opacity(0.08), .clear, Color.black.opacity(0.18)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(width: w, height: h)
                .allowsHitTesting(false)
            }
            .frame(width: w, height: h)
        }
        .ignoresSafeArea()
    }
}

/// Soft mottling so flat fills read as molded clay.
struct ClayNoiseOverlay: View {
    var opacity: Double = 0.12
    var body: some View {
        Canvas { ctx, size in
            for _ in 0..<180 {
                let x = CGFloat.random(in: 0...size.width)
                let y = CGFloat.random(in: 0...size.height)
                let r = CGFloat.random(in: 4...28)
                let bright = Bool.random()
                ctx.fill(
                    Path(ellipseIn: CGRect(x: x, y: y, width: r, height: r * CGFloat.random(in: 0.6...1.2))),
                    with: .color(bright ? Color.white.opacity(0.035) : Color.black.opacity(0.06))
                )
            }
        }
        .opacity(opacity)
        .allowsHitTesting(false)
        .blendMode(.overlay)
    }
}

struct ClayEmboss: ViewModifier {
    var raised: Bool = true

    func body(content: Content) -> some View {
        content
            .shadow(
                color: raised ? Color.white.opacity(0.18) : Color.black.opacity(0.65),
                radius: raised ? 2.5 : 5,
                x: raised ? -2 : 2,
                y: raised ? -2 : 4
            )
            .shadow(
                color: raised ? Color.black.opacity(0.55) : Color.white.opacity(0.08),
                radius: raised ? 10 : 2,
                x: raised ? 4 : -1,
                y: raised ? 7 : -1
            )
    }
}

/// Type that looks pressed into / raised from clay.
struct ClayText: ViewModifier {
    var raised: Bool = true
    var size: CGFloat = 15
    var weight: Font.Weight = .semibold
    var color: Color = ClayTheme.offWhite

    func body(content: Content) -> some View {
        content
            .font(ClayTheme.clayFont(size: size, weight: weight))
            .foregroundStyle(color)
            .shadow(
                color: raised ? Color.black.opacity(0.45) : Color.white.opacity(0.12),
                radius: raised ? 0.8 : 0.5,
                x: 0,
                y: raised ? 1.2 : -0.6
            )
            .shadow(
                color: raised ? Color.white.opacity(0.12) : Color.black.opacity(0.35),
                radius: 0.4,
                x: 0,
                y: raised ? -0.4 : 0.6
            )
    }
}

extension View {
    func clayEmboss(raised: Bool = true) -> some View {
        modifier(ClayEmboss(raised: raised))
    }

    func clayText(
        size: CGFloat = 15,
        weight: Font.Weight = .semibold,
        color: Color = ClayTheme.offWhite,
        raised: Bool = true
    ) -> some View {
        modifier(ClayText(raised: raised, size: size, weight: weight, color: color))
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

/// Molded chat panel fill matching the vision slab.
struct ClaySlabFill: View {
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: ClayTheme.panelRadius, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            ClayTheme.slabRaised,
                            ClayTheme.slab,
                            ClayTheme.slabRecess
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            ClayNoiseOverlay(opacity: 0.55)
                .clipShape(RoundedRectangle(cornerRadius: ClayTheme.panelRadius, style: .continuous))
            RoundedRectangle(cornerRadius: ClayTheme.panelRadius, style: .continuous)
                .stroke(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.22),
                            ClayTheme.gold.opacity(0.12),
                            Color.black.opacity(0.45)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 2
                )
        }
        .clayEmboss(raised: true)
    }
}
