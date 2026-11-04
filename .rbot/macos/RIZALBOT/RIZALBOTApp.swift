import SwiftUI

@main
struct RIZALBOTApp: App {
    var body: some Scene {
        WindowGroup {
            SeatView()
        }
        .defaultSize(width: 920, height: 640)
        .commands {
            CommandGroup(replacing: .newItem) {}
        }
    }
}
