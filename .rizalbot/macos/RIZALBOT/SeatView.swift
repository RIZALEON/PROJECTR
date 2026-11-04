import AppKit
import SwiftUI
import WebKit

enum Seat {
    static let defaultURL = "https://grok.com/project/8545e1c4-63e4-435d-b00a-47803af62fb7"
    static let key = "seatURL"

    static var url: URL {
        let raw = UserDefaults.standard.string(forKey: key)?.trimmingCharacters(in: .whitespacesAndNewlines)
        return URL(string: (raw?.isEmpty == false ? raw! : defaultURL))!
    }
}

struct SeatView: View {
    @State private var address = Seat.url.absoluteString
    @State private var loading = true

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                TextField("Seat URL", text: $address)
                    .textFieldStyle(.roundedBorder)
                    .font(.system(size: 12, design: .monospaced))
                    .onSubmit { go() }
                Button("Go") { go() }
                Button("Chrome app") { chromeApp() }
            }
            .padding(8)
            Divider()
            SeatWebView(url: Seat.url, loading: $loading)
        }
        .background(Color(nsColor: .windowBackgroundColor))
        .navigationTitle("RIZALBOT Mac")
    }

    private func go() {
        UserDefaults.standard.set(address, forKey: Seat.key)
        NotificationCenter.default.post(name: .seatReload, object: Seat.url)
    }

    private func chromeApp() {
        UserDefaults.standard.set(address, forKey: Seat.key)
        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/open")
        if FileManager.default.fileExists(atPath: "/Applications/Google Chrome.app") {
            task.arguments = ["-na", "Google Chrome", "--args", "--app=\(address)", "--new-window"]
        } else {
            task.arguments = [address]
        }
        try? task.run()
    }
}

extension Notification.Name {
    static let seatReload = Notification.Name("rizalbot.seat.reload")
}

struct SeatWebView: NSViewRepresentable {
    let url: URL
    @Binding var loading: Bool

    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.isElementFullscreenEnabled = true
        let view = WKWebView(frame: .zero, configuration: config)
        view.navigationDelegate = context.coordinator
        view.allowsBackForwardNavigationGestures = true
        view.load(URLRequest(url: url))
        context.coordinator.observe(view)
        return view
    }

    func updateNSView(_ view: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(loading: $loading) }

    final class Coordinator: NSObject, WKNavigationDelegate {
        var loading: Binding<Bool>
        private var token: NSObjectProtocol?

        init(loading: Binding<Bool>) { self.loading = loading }

        func observe(_ view: WKWebView) {
            token = NotificationCenter.default.addObserver(forName: .seatReload, object: nil, queue: .main) { note in
                if let url = note.object as? URL {
                    view.load(URLRequest(url: url))
                }
            }
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            loading.wrappedValue = true
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            loading.wrappedValue = false
        }
    }
}
