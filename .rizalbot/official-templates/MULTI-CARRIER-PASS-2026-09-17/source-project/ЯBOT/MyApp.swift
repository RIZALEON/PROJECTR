import SwiftUI
import CoreText

@main
struct MyApp: App {
    init() {
        StormclayFont.register()
        ClayCommandInbox.start()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        #if os(macOS)
        .defaultSize(width: 980, height: 720)
        #endif
    }
}

/// Registers bundled Stormclay claymation faces (White + Gold upgrade).
enum StormclayFont {
    static func register() {
        let names = ["StormclayWhite", "StormclayGold", "Stormclay"]
        for name in names {
            let candidates: [URL?] = [
                Bundle.main.url(forResource: name, withExtension: "ttf", subdirectory: "Fonts"),
                Bundle.main.url(forResource: name, withExtension: "ttf")
            ]
            guard let url = candidates.compactMap({ $0 }).first else {
                print("Stormclay: \(name).ttf not found in bundle")
                continue
            }
            var error: Unmanaged<CFError>?
            if !CTFontManagerRegisterFontsForURL(url as CFURL, .process, &error) {
                print("Stormclay: register \(name) failed \(String(describing: error?.takeRetainedValue()))")
            }
        }
    }
}
