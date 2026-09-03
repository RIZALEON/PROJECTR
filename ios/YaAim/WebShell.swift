import SwiftUI
import WebKit
import UniformTypeIdentifiers

struct WebShell: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        NativeVault.prepare()
        let cfg = WKWebViewConfiguration()
        cfg.allowsInlineMediaPlayback = true
        cfg.mediaTypesRequiringUserActionForPlayback = []
        cfg.preferences.javaScriptCanOpenWindowsAutomatically = false
        let uc = cfg.userContentController
        uc.add(context.coordinator, name: "ya")
        let boot = """
        window.YA_NATIVE = { spine: 'ios-native', vault: 'documents', maxBytes: 4294967296 };
        """
        uc.addUserScript(WKUserScript(source: boot, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        let web = WKWebView(frame: .zero, configuration: cfg)
        web.scrollView.keyboardDismissMode = .interactive
        web.isOpaque = false
        web.backgroundColor = UIColor(red: 0.043, green: 0.043, blue: 0.047, alpha: 1)
        context.coordinator.web = web
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            web.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else {
            let html = """
            <!doctype html><meta charset=utf-8>
            <body style="background:#0b0b0c;color:#e8e4d9;font:16px/1.4 -apple-system;padding:24px">
            Function 0 is here. Offline. www missing from this bundle — rebuild in Xcode.
            </body>
            """
            web.loadHTMLString(html, baseURL: nil)
        }
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKScriptMessageHandler, UIDocumentPickerDelegate {
        weak var web: WKWebView?
        var pickKind: String = "food"

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any], let op = body["op"] as? String else { return }
            switch op {
            case "pick":
                pickKind = (body["kind"] as? String) ?? "food"
                presentPicker()
            case "generate":
                let prompt = (body["prompt"] as? String) ?? ""
                let out = NativeHeart.generate(prompt: prompt)
                reply(["op": "generate", "text": out])
            case "status":
                reply([
                    "op": "status",
                    "heartBytes": NativeVault.heartBytes(),
                    "gutBytes": NativeVault.gutBytes(),
                    "seated": NativeHeart.seated
                ])
            default:
                break
            }
        }

        func presentPicker() {
            guard let root = web?.window?.rootViewController else { return }
            let types: [UTType] = [.item, .data, .content]
            let picker = UIDocumentPickerViewController(forOpeningContentTypes: types, asCopy: true)
            picker.delegate = self
            picker.allowsMultipleSelection = true
            root.present(picker, animated: true)
        }

        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            var notes: [[String: Any]] = []
            for url in urls {
                let _ = url.startAccessingSecurityScopedResource()
                defer { url.stopAccessingSecurityScopedResource() }
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
