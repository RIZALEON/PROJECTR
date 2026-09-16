import SwiftUI
import CoreText

@main
struct MyApp: App {
    init() {
        StormclayFont.register()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .defaultSize(width: 980, height: 720)
    }
}

/// Registers the bundled Stormclay TTF so Font.custom works on every platform.
enum StormclayFont {
    static func register() {
        let candidates: [URL?] = [
            Bundle.main.url(forResource: "Stormclay", withExtension: "ttf", subdirectory: "Fonts"),
            Bundle.main.url(forResource: "Stormclay", withExtension: "ttf")
        ]
        guard let url = candidates.compactMap({ $0 }).first else {
            print("Stormclay: font file not found in bundle")
            return
        }
        var error: Unmanaged<CFError>?
        if !CTFontManagerRegisterFontsForURL(url as CFURL, .process, &error) {
            print("Stormclay: register failed \(String(describing: error?.takeRetainedValue()))")
        }
    }
}
