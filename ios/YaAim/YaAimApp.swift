import SwiftUI

@main
struct YaAimApp: App {
    var body: some Scene {
        WindowGroup {
            WebShell()
                .ignoresSafeArea()
                .statusBarHidden(false)
        }
    }
}
