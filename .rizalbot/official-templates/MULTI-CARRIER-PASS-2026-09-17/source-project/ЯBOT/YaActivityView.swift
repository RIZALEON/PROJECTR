import SwiftUI
#if canImport(UIKit)
import UIKit

/// iOS share / Save to Files sheet for USER-MANUAL.pdf and other exports.
struct YaActivityView: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
#endif
