import Foundation
import Combine

/// Shared online/offline flag — UI button and chat commands stay in sync.
final class ModeStore: ObservableObject {
    static let shared = ModeStore()
    @Published var isOnline: Bool = false

    func goOnline() { isOnline = true }
    func goOffline() { isOnline = false }
    func toggle() { isOnline.toggle() }

    var label: String {
        isOnline
            ? "Mode: ONLINE link allowed as bonus. Offline seat still premier."
            : "Mode: OFFLINE. Premier path. Local mouth only."
    }
}
