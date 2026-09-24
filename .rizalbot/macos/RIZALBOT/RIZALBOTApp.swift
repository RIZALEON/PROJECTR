import SwiftUI

@main
struct RIZALBOTApp: App {
    var body: some Scene {
        WindowGroup {
            SeatView()
        }
        .defaultSize(width: 1280, height: 800)
        .commands {
            CommandGroup(replacing: .newItem) {}
        }
    }
}
