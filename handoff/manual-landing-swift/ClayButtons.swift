import SwiftUI

/// Seamless freeform claymation 3D control — art sits on the clay wall with no plate behind it.
struct ClayButton: View {
    let asset: String
    var systemFallback: String = "circle.fill"
    var width: CGFloat
    var height: CGFloat? = nil
    var help: String? = nil
    var action: () -> Void

    @State private var pressed = false

    private var h: CGFloat { height ?? width }

    var body: some View {
        Button(action: action) {
            Group {
                if ClayImage.exists(asset) {
                    Image(asset)
                        .resizable()
                        .interpolation(.high)
                        .aspectRatio(contentMode: .fit)
                } else {
                    Image(systemName: systemFallback)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .foregroundStyle(ClayTheme.offWhite)
                        .padding(10)
                }
            }
            .frame(width: width, height: h)
            .contentShape(Rectangle())
            .scaleEffect(pressed ? 0.92 : 1.0)
            .shadow(color: Color.black.opacity(pressed ? 0.22 : 0.55), radius: pressed ? 3 : 12, y: pressed ? 1 : 7)
            .shadow(color: ClayTheme.gold.opacity(pressed ? 0.04 : 0.16), radius: pressed ? 2 : 8, y: pressed ? 0 : 2)
            .offset(y: pressed ? 1.5 : 0)
            .animation(.spring(response: 0.22, dampingFraction: 0.72), value: pressed)
        }
        .buttonStyle(.plain)
        .focusEffectDisabled()
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in pressed = true }
                .onEnded { _ in pressed = false }
        )
        .help(help ?? "")
        .accessibilityLabel(help ?? asset)
    }
}

/// Online / Offline clay plate — swaps art by mode (green ONLINE vs red OFFLINE).
struct ClayModeButton: View {
    @Binding var isOnline: Bool
    var width: CGFloat = 118
    var height: CGFloat = 118
    var onToggle: () -> Void = {}

    var body: some View {
        ClayButton(
            asset: isOnline ? "BtnOnline" : "BtnOffline",
            systemFallback: isOnline ? "network" : "network.slash",
            width: width,
            height: height,
            help: isOnline ? "ONLINE — tap for offline" : "OFFLINE — tap for online"
        ) {
            isOnline.toggle()
            onToggle()
        }
    }
}
