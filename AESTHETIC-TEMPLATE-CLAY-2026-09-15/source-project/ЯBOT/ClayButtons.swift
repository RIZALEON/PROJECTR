import SwiftUI

/// Freeform clay control — Image + tap only. Never use Button (macOS paints plates).
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
        art
            .frame(width: width, height: h)
            .contentShape(Rectangle())
            .scaleEffect(pressed ? 0.94 : 1.0)
            .shadow(color: Color.black.opacity(pressed ? 0.18 : 0.32), radius: pressed ? 2 : 5, y: pressed ? 1 : 2)
            .offset(y: pressed ? 1 : 0)
            .animation(.spring(response: 0.2, dampingFraction: 0.75), value: pressed)
            // Keep glow/rim outside neighbors from being clipped by chrome row.
            .compositingGroup()
            .onTapGesture(perform: action)
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in pressed = true }
                    .onEnded { _ in pressed = false }
            )
            .help(help ?? "")
            .accessibilityAddTraits(.isButton)
            .accessibilityLabel(help ?? asset)
            .accessibilityAction { action() }
    }

    @ViewBuilder
    private var art: some View {
        if ClayImage.exists(asset) {
            Image(asset)
                .renderingMode(.original)
                .resizable()
                .interpolation(.high)
                .aspectRatio(contentMode: .fit)
                .frame(width: width, height: h, alignment: .center)
        } else {
            Image(systemName: systemFallback)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .foregroundStyle(ClayTheme.offWhite)
                .padding(6)
        }
    }
}

struct ClayModeButton: View {
    @Binding var isOnline: Bool
    var width: CGFloat = 52
    var height: CGFloat = 52
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
        // Extra layout slack so gold rim isn’t eaten by the chrome strip.
        .padding(.leading, 2)
        .padding(.top, 2)
    }
}
