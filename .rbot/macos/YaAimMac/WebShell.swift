import SwiftUI
import WebKit
import UniformTypeIdentifiers
import AppKit

struct WebShell: NSViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeNSView(context: Context) -> WKWebView {
        NativeVault.prepare()
        let cfg = WKWebViewConfiguration()
        cfg.preferences.javaScriptCanOpenWindowsAutomatically = false
        let uc = cfg.userContentController
        uc.add(context.coordinator, name: "ya")
        let boot = """
        window.YA_NATIVE = { spine: 'macos-native', vault: 'application-support', maxBytes: 4294967296 };
        """
        uc.addUserScript(WKUserScript(source: boot, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        let web = WKWebView(frame: .zero, configuration: cfg)
        web.setValue(false, forKey: "drawsBackground")
        context.coordinator.web = web
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            web.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else {
            let html = """
            <!doctype html><meta charset=utf-8>
            <body style="background:#0b0c0a;color:#e8e6dc;font:16px/1.4 -apple-system;padding:24px">
            Function 0 is here. Offline. www missing from this bundle.
            </body>
            """
            web.loadHTMLString(html, baseURL: nil)
        }
        return web
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKScriptMessageHandler {
        weak var web: WKWebView?

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any], let op = body["op"] as? String else { return }
            switch op {
            case "pick":
                presentPicker()
            case "share":
                let name = (body["name"] as? String) ?? "ya-mind.json"
                let text = (body["text"] as? String) ?? ""
                presentShare(name: name, text: text)
            case "generate":
                let prompt = (body["prompt"] as? String) ?? ""
                let out = NativeHeart.shared.generate(prompt: prompt)
                var payload: [String: Any] = ["op": "generate", "text": out, "engine": NativeHeart.shared.engine.rawValue]
                if let id = body["id"] as? String { payload["id"] = id }
                reply(payload)
            case "status":
                var st = NativeHeart.shared.status()
                st["op"] = "status"
                st["gutBytes"] = NativeVault.gutBytes()
                let files = ModelManager.status()
                if let list = files["files"] { st["files"] = list }
                if let id = body["id"] as? String { st["id"] = id }
                reply(st)
            default:
                break
            }
        }

        func presentPicker() {
            let panel = NSOpenPanel()
            panel.allowsMultipleSelection = true
            panel.canChooseDirectories = false
            panel.allowedContentTypes = [.item, .data]
            panel.begin { [weak self] result in
                guard result == .OK else { return }
                self?.ingest(panel.urls)
            }
        }

        func presentShare(name: String, text: String) {
            NativeVault.prepare()
            let safe = name.replacingOccurrences(of: "/", with: "-")
            let url = NativeVault.root.appendingPathComponent(safe)
            do {
                try text.write(to: url, atomically: true, encoding: .utf8)
            } catch {
                return
            }
            NSWorkspace.shared.activateFileViewerSelecting([url])
        }

        func ingest(_ urls: [URL]) {
            var notes: [[String: Any]] = []
            for url in urls {
                let accessed = url.startAccessingSecurityScopedResource()
                defer { if accessed { url.stopAccessingSecurityScopedResource() } }
                do {
                    let name = url.lastPathComponent.lowercased()
                    if name.hasSuffix(".gguf") {
                        let dest = try NativeVault.seatHeart(from: url)
                        notes.append(["name": dest.lastPathComponent, "bytes": NativeVault.heartBytes(), "kind": "gguf"])
                    } else {
                        let dest = try NativeVault.copyIntoGut(from: url)
                        let n = (try? dest.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0
                        notes.append(["name": dest.lastPathComponent, "bytes": n, "kind": "part"])
                    }
                } catch {
                    notes.append(["name": url.lastPathComponent, "error": error.localizedDescription])
                }
            }
            reply(["op": "picked", "files": notes])
        }

        func reply(_ obj: [String: Any]) {
            guard let data = try? JSONSerialization.data(withJSONObject: obj),
                  let json = String(data: data, encoding: .utf8) else { return }
            web?.evaluateJavaScript("window.yaNativeReply && window.yaNativeReply(\(json))")
        }
    }
}
