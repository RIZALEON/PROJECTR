import SwiftUI

@main
struct YaAimMacApp: App {
    var body: some Scene {
        WindowGroup("Я Mac") {
            WebShell()
                .frame(minWidth: 720, minHeight: 520)
                .background(Color(red: 0.043, green: 0.047, blue: 0.039))
        }
        .defaultSize(width: 980, height: 720)
        .commands {
            CommandGroup(replacing: .newItem) {}
        }
        .windowStyle(.titleBar)
        .windowToolbarStyle(.unified)
    }
}
