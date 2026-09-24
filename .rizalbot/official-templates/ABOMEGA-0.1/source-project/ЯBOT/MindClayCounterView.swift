import SwiftUI

/// Custom 3D claymation MIND size counter — blue plasticine glyphs.
/// Base size = app bundle; grows with fed files. Tap cycles MB → GB → TB.
struct MindClayCounterView: View {
    let number: String
    let unit: String
    var height: CGFloat = 52
    var onTap: () -> Void = {}

    private var glyphs: [(id: String, ch: Character)] {
        var out: [(id: String, ch: Character)] = []
        for (i, ch) in number.enumerated() {
            out.append((id: "n\(i)-\(ch)", ch: ch))
        }
        out.append((id: "gap", ch: " "))
        for (i, ch) in unit.enumerated() {
            out.append((id: "u\(i)-\(ch)", ch: ch))
        }
        return out
    }

    var body: some View {
        HStack(alignment: .center, spacing: height * 0.04) {
            ForEach(glyphs, id: \.id) { item in
                if item.ch == " " {
                    Color.clear.frame(width: height * 0.14)
                } else {
                    glyph(for: item.ch)
                }
            }
        }
        .frame(height: height)
        .contentShape(Rectangle())
        .highPriorityGesture(
            DragGesture(minimumDistance: 0)
                .onEnded { value in
                    if abs(value.translation.width) < 24 && abs(value.translation.height) < 24 {
                        onTap()
                    }
                }
        )
        .accessibilityAddTraits(.isButton)
        .accessibilityLabel("Mind size \(number) \(unit)")
        .help("Tap to switch MB / GB / TB")
    }

    @ViewBuilder
    private func glyph(for ch: Character) -> some View {
        let name = assetName(for: ch)
        if ClayImage.exists(name) {
            Image(name)
                .renderingMode(.original)
                .resizable()
                .interpolation(.high)
                .scaledToFit()
                .frame(height: ch == "." ? height * 0.28 : height)
                // Soft depth only — no plate; glyphs are transparent PNGs
                .shadow(color: .black.opacity(0.35), radius: 4, y: 3)
        } else {
            Text(String(ch))
                .font(ClayTheme.clayFont(size: height * 0.7, weight: .bold))
                .foregroundStyle(Color(red: 0.25, green: 0.45, blue: 0.95))
        }
    }

    private func assetName(for ch: Character) -> String {
        if ch == "." { return "ClayGlyph_dot" }
        return "ClayGlyph_\(ch)"
    }
}
