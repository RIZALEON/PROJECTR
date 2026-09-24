import SwiftUI
#if canImport(AppKit)
import AppKit
#endif
#if canImport(UIKit)
import UIKit
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
    /// Tabletas = rectangles with 4 rounded corners (never organic freeform blobs).
    static let bubbleRadius: CGFloat = 20
    /// 9-slice caps for clay bubble PNGs (keep corners; stretch middle).
    static let bubbleCapX: CGFloat = 36
    static let bubbleCapY: CGFloat = 28
    /// Clay tablet form: long rounded rectangles; height thins/fattens; width hugs text.
    /// Text must stay inside clay border (large safe insets). Never overlap.
    static var tabletUserMaxWidth: CGFloat {
        #if os(iOS)
        return min(340, slateInnerWidth - 8)
        #else
        return 420
        #endif
    }
    static var tabletAssistantMaxWidth: CGFloat {
        #if os(iOS)
        return min(360, slateInnerWidth - 8)
        #else
        return 560
        #endif
    }
    /// HARDCODE: clay chat bubbles never overlap or touch — clear air gap between every tablet.
    /// Includes room so drop-shadows cannot visually collide with the next bubble.
    static let bubbleClearGap: CGFloat = 36
    /// Clean clay aesthetic (Decider refs): stamped white type, soft lift shadow, clear air between tablets.
    static let stampedTextHighlight = Color.white.opacity(0.55)
    static let stampedTextShade = Color.black.opacity(0.70)
    static let bubbleShadowReserve: CGFloat = 10
    static var bubbleGap: CGFloat { bubbleClearGap + bubbleShadowReserve }
    /// Resizable slate plate — sits on chalkboard, centered, just wider than chat bar.
    /// iPhone: almost full screen width. Mac: fixed 580 bar.
    static var chatBarWidth: CGFloat {
        #if os(iOS)
        let screen = UIScreen.main.bounds.width
        return max(300, min(screen - 16, 580))
        #else
        return 580
        #endif
    }
    static var slateOverhang: CGFloat {
        #if os(iOS)
        return 12
        #else
        return 48
        #endif
    }
    static var slateWidth: CGFloat { chatBarWidth + slateOverhang }
    /// Chat column inside the slate (bubbles + composer stay within slate).
    static var slateContentInset: CGFloat {
        #if os(iOS)
        return 10
        #else
        return 16
        #endif
    }
    static var slateInnerWidth: CGFloat { slateWidth - (slateContentInset * 2) }
    static let tabletShadow = Color.black.opacity(0.55)

    /// Decider-posted shells (empty pebble clay from posted purple/gray/yellow refs).
    static let tabletUserPack: [String] = [
        "BubbleShellPurple", "BubbleShellPurpleBar", "TabletPurpleLine", "BubbleUser"
    ]
    /// Companion — Decider shells first, then legacy fallbacks.
    static let tabletGrayPack: [String] = [
        "BubbleShellGray", "BubbleShellGrayBar", "BubbleShellYellowBar", "BubbleShellPurpleBar",
        "TabletGraySlabText", "TabletGraySlab", "BubbleAssistant"
    ]
    /// Thin / single-line — Decider bar shells.
    static let tabletBarPack: [String] = [
        "BubbleShellPurpleBar", "BubbleShellYellowBar", "BubbleShellGrayBar",
        "TabletBarCharcoal", "TabletBarGold", "TabletBarMagenta"
    ]
    /// Multi-line slabs — Decider purple/gray plates.
    static let tabletSlabPack: [String] = [
        "BubbleShellPurple", "BubbleShellGray",
        "TabletGraySlabText", "TabletGraySlab", "TabletPurpleLine"
    ]
    static let chromeSize: CGFloat = 64

    /// Claymation upgrade — White for chat tabletas; Gold for system lines.
    static let stormclayFamily = "Stormclay White"
    static let stormclayPostScript = "StormclayWhite-Regular"
    static let stormclayGoldFamily = "Stormclay Gold"
    static let stormclayGoldPostScript = "StormclayGold-Regular"
    /// Legacy single-face name (kept as last-resort fallback).
    static let stormclayLegacyFamily = "Stormclay"

    static func clayFont(size: CGFloat, weight: Font.Weight = .semibold) -> Font {
        _ = weight
        return .custom(stormclayFamily, size: size)
    }

    static func clayGoldFont(size: CGFloat, weight: Font.Weight = .semibold) -> Font {
        _ = weight
        return .custom(stormclayGoldFamily, size: size)
    }
}


/// Bubble + font size law from Decider clay references (thin bar / padded line / multi slab).
enum ClayBubbleKind: Equatable {
    case bar   // thin single-line clay bar — larger type, tight vertical pad
    case line  // single line with more clay around the type
    case slab  // multi-line tablet — generous pad, slightly smaller type
}

enum ClayBubbleMetrics {
    // MARK: Font sizes (Stormclay) — HARDCODE: one size for every tablet (1 word or 20)
    static let fontChat: CGFloat = 16
    static let fontBar: CGFloat = fontChat
    static let fontLine: CGFloat = fontChat
    static let fontSlab: CGFloat = fontChat
    static let fontSystem: CGFloat = fontChat
    /// Extra tracking so chunky clay glyphs breathe (mock letters are puffy).
    static let tracking: CGFloat = 1.6
    static let lineSpacingBar: CGFloat = 2
    static let lineSpacingLine: CGFloat = 4
    static let lineSpacingSlab: CGFloat = 7

    // MARK: Bubble size (min frame + safe insets inside molded rim)
    static let minWidthBar: CGFloat = 120
    static let minWidthLine: CGFloat = 160
    static let minWidthSlab: CGFloat = 200
    static let minHeightBar: CGFloat = 44
    static let minHeightLine: CGFloat = 64
    static let minHeightSlab: CGFloat = 128

    static let insetXBar: CGFloat = 32
    static let insetYBar: CGFloat = 14
    static let insetXLine: CGFloat = 40
    static let insetYLine: CGFloat = 20
    static let insetXSlab: CGFloat = 44
    static let insetYSlab: CGFloat = 28

    static func kind(for text: String, isSystem: Bool) -> ClayBubbleKind {
        if isSystem { return .line }
        let lines = text.components(separatedBy: .newlines).filter { !$0.isEmpty }
        if lines.count >= 2 || text.count > 72 { return .slab }
        if text.count <= 48 { return .bar }
        return .line
    }

    static func fontSize(kind: ClayBubbleKind, isSystem: Bool) -> CGFloat {
        _ = kind
        _ = isSystem
        return fontChat
    }

    static func insetX(_ kind: ClayBubbleKind) -> CGFloat {
        switch kind {
        case .bar: return insetXBar
        case .line: return insetXLine
        case .slab: return insetXSlab
        }
    }

    static func insetY(_ kind: ClayBubbleKind) -> CGFloat {
        switch kind {
        case .bar: return insetYBar
        case .line: return insetYLine
        case .slab: return insetYSlab
        }
    }

    static func minWidth(_ kind: ClayBubbleKind) -> CGFloat {
        switch kind {
        case .bar: return minWidthBar
        case .line: return minWidthLine
        case .slab: return minWidthSlab
        }
    }

    static func minHeight(_ kind: ClayBubbleKind) -> CGFloat {
        switch kind {
        case .bar: return minHeightBar
        case .line: return minHeightLine
        case .slab: return minHeightSlab
        }
    }

    static func lineSpacing(_ kind: ClayBubbleKind) -> CGFloat {
        switch kind {
        case .bar: return lineSpacingBar
        case .line: return lineSpacingLine
        case .slab: return lineSpacingSlab
        }
    }
}

enum ClayImage {
    /// Documents override for live art without rebuild: ~/Documents/ЯBOT/hot-assets/<name>.png (+ @2x/@3x).
    static var hotAssetsDirectory: URL {
        FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Documents/ЯBOT/hot-assets", isDirectory: true)
    }

    static func hotAssetURL(named name: String) -> URL? {
        let dir = hotAssetsDirectory
        let scale: CGFloat = {
            #if canImport(AppKit)
            return NSScreen.main?.backingScaleFactor ?? 2
            #elseif canImport(UIKit)
            return UIScreen.main.scale
            #else
            return 2
            #endif
        }()
        let candidates: [String]
        if scale >= 2.5 {
            candidates = ["\(name)@3x.png", "\(name)@2x.png", "\(name).png"]
        } else if scale >= 1.5 {
            candidates = ["\(name)@2x.png", "\(name)@3x.png", "\(name).png"]
        } else {
            candidates = ["\(name).png", "\(name)@2x.png", "\(name)@3x.png"]
        }
        for c in candidates {
            let u = dir.appendingPathComponent(c)
            if FileManager.default.fileExists(atPath: u.path) { return u }
        }
        return nil
    }

    static func exists(_ name: String) -> Bool {
        if hotAssetURL(named: name) != nil { return true }
        #if canImport(AppKit)
        return NSImage(named: name) != nil
        #elseif canImport(UIKit)
        return UIImage(named: name) != nil
        #else
        return false
        #endif
    }

    #if canImport(AppKit)
    static func nsImage(named name: String) -> NSImage? {
        if let url = hotAssetURL(named: name), let img = NSImage(contentsOf: url) {
            return img
        }
        return NSImage(named: name)
    }
    #endif

    #if canImport(UIKit)
    static func uiImage(named name: String) -> UIImage? {
        if let url = hotAssetURL(named: name), let img = UIImage(contentsOfFile: url.path) {
            return img
        }
        return UIImage(named: name)
    }
    #endif
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
/// Dark clay slate — layer above chalkboard, below chat/chrome. Centered; width = bar + overhang.
struct ClaySlatePlate: View {
    var body: some View {
        GeometryReader { geo in
            let w = ClayTheme.slateWidth
            let h = max(geo.size.height, 1)
            HStack {
                Spacer(minLength: 0)
                Group {
                    if ClayImage.exists("ClaySlate") {
                        Image("ClaySlate")
                            .resizable()
                            .interpolation(.high)
                            .scaledToFill()
                            .frame(width: w, height: h)
                            .clipped()
                            .accessibilityHidden(true)
                    } else {
                        RoundedRectangle(cornerRadius: 28, style: .continuous)
                            .fill(ClayTheme.charcoalDeep)
                            .frame(width: w, height: h)
                    }
                }
                Spacer(minLength: 0)
            }
            .frame(width: geo.size.width, height: h)
        }
        .allowsHitTesting(false)
    }
}


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
