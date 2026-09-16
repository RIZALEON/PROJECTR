import SwiftUI

enum ClayTheme {
    static let purple = Color(red: 0.36, green: 0.25, blue: 0.83)
    static let purpleDeep = Color(red: 0.28, green: 0.18, blue: 0.68)
    static let charcoal = Color(red: 0.12, green: 0.12, blue: 0.14)
    static let charcoalDeep = Color(red: 0.07, green: 0.07, blue: 0.08)
    static let panel = Color(red: 0.22, green: 0.22, blue: 0.24)
    static let panelRaised = Color(red: 0.28, green: 0.28, blue: 0.30)
    static let bubbleUser = Color(red: 0.90, green: 0.90, blue: 0.92)
    static let bubbleAssistant = Color(red: 0.30, green: 0.30, blue: 0.33)
    static let offWhite = Color(red: 0.94, green: 0.94, blue: 0.96)
    static let muted = Color(red: 0.62, green: 0.62, blue: 0.66)
    static let orangeRim = Color(red: 0.92, green: 0.62, blue: 0.28)
    static let onlineGreen = Color(red: 0.25, green: 0.85, blue: 0.45)

    static let panelRadius: CGFloat = 28
    static let bubbleRadius: CGFloat = 18
    static let chromeSize: CGFloat = 56
}

struct ClayBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    ClayTheme.charcoalDeep,
                    ClayTheme.charcoal,
                    Color(red: 0.16, green: 0.15, blue: 0.18)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            // Soft clay mottling
            RadialGradient(
                colors: [
                    Color.white.opacity(0.05),
                    Color.clear
                ],
                center: .topLeading,
                startRadius: 20,
                endRadius: 420
            )
            RadialGradient(
                colors: [
                    Color.black.opacity(0.35),
                    Color.clear
                ],
                center: .bottomTrailing,
                startRadius: 40,
                endRadius: 520
            )
        }
        .ignoresSafeArea()
    }
}

struct ClayEmboss: ViewModifier {
    var radius: CGFloat = 18
    var raised: Bool = true

    func body(content: Content) -> some View {
        content
            .shadow(color: raised ? Color.white.opacity(0.12) : Color.black.opacity(0.55),
                    radius: raised ? 2 : 4,
                    x: raised ? -1.5 : 2,
                    y: raised ? -1.5 : 3)
            .shadow(color: raised ? Color.black.opacity(0.55) : Color.white.opacity(0.08),
                    radius: raised ? 6 : 2,
                    x: raised ? 3 : -1,
                    y: raised ? 5 : -1)
    }
}

extension View {
    func clayEmboss(radius: CGFloat = 18, raised: Bool = true) -> some View {
        modifier(ClayEmboss(radius: radius, raised: raised))
    }
}
