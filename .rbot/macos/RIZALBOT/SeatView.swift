import AppKit
import SwiftUI
import UniformTypeIdentifiers
import WebKit

enum Seat {
    static let local = URL(string: "rizal://seat/mac.html")!
    static let onlineMind = URL(string: "https://raw.githubusercontent.com/rizalward/Rbot/main/handoff/ONLINE-MIND.md")!
    static let onlineMindTwin = URL(string: "https://raw.githubusercontent.com/RIZALEON/PROJECTR/main/handoff/ONLINE-MIND.md")!
    static let grokMailbox = URL(string: "https://raw.githubusercontent.com/rizalward/Rbot/main/GROK-MAILBOX.md")!
}

struct SeatView: View {
    var body: some View {
        SeatWebView()
            .background(Color.black)
            .navigationTitle("PROJECT Я")
    }
}

final class SeatHandler: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url else { return }
        var path = url.path
        if path.isEmpty || path == "/" { path = "/mac.html" }
        if path.hasPrefix("/") { path.removeFirst() }
        guard
            let root = Bundle.main.resourceURL?.appendingPathComponent("www", isDirectory: true)
        else {
            fail(task, url: url, status: 500)
            return
        }
        let file = root.appendingPathComponent(path)
        let allowed = root.standardizedFileURL.path
        guard file.standardizedFileURL.path.hasPrefix(allowed), FileManager.default.fileExists(atPath: file.path) else {
            fail(task, url: url, status: 404)
            return
        }
        do {
            let data = try Data(contentsOf: file)
            let ext = file.pathExtension.lowercased()
            let mime: String
            switch ext {
            case "html": mime = "text/html"
            case "js": mime = "text/javascript"
            case "css": mime = "text/css"
            case "png": mime = "image/png"
            case "jpg", "jpeg": mime = "image/jpeg"
            case "svg": mime = "image/svg+xml"
            case "mp4": mime = "video/mp4"
            default:
                mime = UTType(filenameExtension: ext)?.preferredMIMEType ?? "application/octet-stream"
            }
            let response = HTTPURLResponse(
                url: url,
                statusCode: 200,
                httpVersion: "HTTP/1.1",
                headerFields: [
                    "Content-Type": mime,
                    "Content-Length": String(data.count),
                    "Cache-Control": "no-cache",
                    "Access-Control-Allow-Origin": "*",
                ]
            )!
            task.didReceive(response)
            task.didReceive(data)
            task.didFinish()
        } catch {
            fail(task, url: url, status: 500)
        }
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private func fail(_ task: WKURLSchemeTask, url: URL, status: Int) {
        let body = Data("seat dark".utf8)
        let response = HTTPURLResponse(
            url: url,
            statusCode: status,
            httpVersion: "HTTP/1.1",
            headerFields: ["Content-Type": "text/plain"]
        )!
        task.didReceive(response)
        task.didReceive(body)
        task.didFinish()
    }
}

struct SeatWebView: NSViewRepresentable {
    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.isElementFullscreenEnabled = true
        config.userContentController.add(context.coordinator, name: "om")
        let intercept = WKUserScript(source: Self.interceptJS, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        config.userContentController.addUserScript(intercept)
        config.setURLSchemeHandler(context.coordinator.handler, forURLScheme: "rizal")
        let view = WKWebView(frame: .zero, configuration: config)
        view.setValue(false, forKey: "drawsBackground")
        view.navigationDelegate = context.coordinator
        view.uiDelegate = context.coordinator
        context.coordinator.webView = view
        view.load(URLRequest(url: Seat.local))
        return view
    }

    func updateNSView(_ view: WKWebView, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator() }

    static let interceptJS = """
    (function(){
      function hit(t){
        t = String(t || '').trim();
        if (/^(read )?online[- ]?mind\\b/i.test(t)) return 'om';
        if (/ONLINE-MIND/i.test(t)) return 'om';
        if (t.indexOf('1Thji06t2cjSCvzWgtI-GIHSRywNP7BmVEegaFsfgfXE') >= 0) return 'om';
        if (/^(run\\s+)?grok\\.bridge\\b/i.test(t)) return 'bridge';
        if (/^read grok mailbox\\b/i.test(t)) return 'bridge';
        if (/^(run\\s+)?utah[\\s.]+ping\\b/i.test(t)) return 'utah';
        return '';
      }
      document.addEventListener('submit', function(e){
        var form = e.target;
        if (!form || !form.querySelector) return;
        var input = form.querySelector('input:not([type=file])') || form.querySelector('textarea');
        if (!input) return;
        var t = String(input.value || '').trim();
        var kind = hit(t);
        if (!kind) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.om) {
          window.webkit.messageHandlers.om.postMessage(kind + '|' + t);
        }
      }, true);
      window.__rizalOm = function(text){
        var host = document.querySelector('.overflow-y-auto') || document.body;
        var d = document.createElement('div');
        d.setAttribute('data-om','1');
        d.style.cssText = 'max-width:92%;white-space:pre-wrap;font-size:15px;line-height:1.625;padding:8px 0;color:#e8e6dc';
        d.textContent = text;
        host.appendChild(d);
        d.scrollIntoView({block:'end'});
      };
    })();
    """

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        let handler = SeatHandler()
        weak var webView: WKWebView?

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "om" else { return }
            let raw = String(describing: message.body)
            let kind = raw.split(separator: "|", maxSplits: 1).first.map(String.init) ?? raw
            Task { await self.enact(kind: kind) }
        }

        private func utahPing() -> String {
            let tz = TimeZone(identifier: "America/Denver") ?? .current
            var cal = Calendar(identifier: .gregorian)
            cal.timeZone = tz
            let fmt = DateFormatter()
            fmt.timeZone = tz
            fmt.dateFormat = "yyyy-MM-dd HH:mm:ss zzz"
            let gut = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?
                .appendingPathComponent("Я", isDirectory: true)
            var mind = "unknown"
            if let gut, let files = try? FileManager.default.contentsOfDirectory(at: gut, includingPropertiesForKeys: [.fileSizeKey]) {
                let bytes = files.reduce(Int64(0)) { sum, url in
                    let n = (try? url.resourceValues(forKeys: [.fileSizeKey]).fileSize).map(Int64.init) ?? 0
                    return sum + n
                }
                mind = String(format: "%.1f KB", Double(bytes) / 1024.0)
            }
            let heartURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?
                .appendingPathComponent("heart.gguf")
            let heartSeated = heartURL.map { FileManager.default.fileExists(atPath: $0.path) } ?? false
            return [
                "Hands utah.ping (Mac spine)",
                "Utah: " + fmt.string(from: Date()),
                "Light: green fetch available from this seat",
                "Mind (Documents/Я): " + mind,
                "Heart: " + (heartSeated ? "seated heart.gguf on disk" : "not in Documents/heart.gguf"),
                "Pending: see GROK-MAILBOX",
                "No cloud mouth. Engine RIZAL stays on-device."
            ].joined(separator: "\n")
        }

        private func enact(kind: String) async {
            let k = kind.lowercased()
            if k == "utah" {
                await speak(utahPing())
                return
            }
            let urls: [URL]
            let title: String
            if k == "bridge" {
                urls = [Seat.grokMailbox]
                title = "Hands grok.bridge GET (green). Grok lines kept. No cloud chat.\n\n"
            } else {
                urls = [Seat.onlineMind, Seat.onlineMindTwin]
                title = "Online mind read (green). Chief lines kept.\n\n"
            }
            var body = "Airplane or unreachable. Gut only. Function 0 still talks."
            for url in urls {
                do {
                    var req = URLRequest(url: url)
                    req.cachePolicy = .reloadIgnoringLocalCacheData
                    req.timeoutInterval = 12
                    let (data, resp) = try await URLSession.shared.data(for: req)
                    let code = (resp as? HTTPURLResponse)?.statusCode ?? 0
                    if (200 ..< 300).contains(code), let text = String(data: data, encoding: .utf8), text.count > 20 {
                        let clip = text.count > 4000 ? String(text.prefix(4000)) + "\n…" : text
                        body = title + clip + "\n\nNo EVOLVE this fetch unless Decider add-functions."
                        break
                    }
                } catch {
                    continue
                }
            }
            await speak(body)
        }

        @MainActor
        private func speak(_ body: String) {
            let payload = body
                .replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "`", with: "\\`")
                .replacingOccurrences(of: "$", with: "\\$")
            let js = "window.__rizalOm && window.__rizalOm(`\(payload)`)"
            webView?.evaluateJavaScript(js, completionHandler: nil)
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }
            if url.scheme == "rizal" {
                decisionHandler(.allow)
                return
            }
            if url.scheme == "http" || url.scheme == "https" {
                NSWorkspace.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            if let url = navigationAction.request.url {
                NSWorkspace.shared.open(url)
            }
            return nil
        }
    }
}
