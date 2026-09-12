import SwiftUI
import UIKit
import WebKit
import UniformTypeIdentifiers
import SafariServices
import CoreLocation

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
        window.YA_NATIVE = { spine: 'ios-native', vault: 'documents', maxBytes: 4294967296, geo: true };
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
            <body style=\"background:#0b0b0c;color:#e8e4d9;font:16px/1.4 -apple-system;padding:24px\">
            Function 0 is here. Offline. www missing from this bundle — rebuild in Xcode.
            </body>
            """
            web.loadHTMLString(html, baseURL: nil)
        }
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKScriptMessageHandler, UIDocumentPickerDelegate, CLLocationManagerDelegate {
        weak var web: WKWebView?
        var pickKind: String = "food"
        private let locationManager = CLLocationManager()
        private var pendingGeoId: String?
        private var geoReplied = false

        override init() {
            super.init()
            locationManager.delegate = self
            locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any], let op = body["op"] as? String else { return }
            switch op {
            case "pick":
                pickKind = (body["kind"] as? String) ?? "food"
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
                st["heartBytes"] = NativeVault.heartBytes()
                st["booksBytes"] = NativeVault.booksBytes()
                st["documentsBytes"] = NativeVault.documentsBytes()
                st["vaultBytes"] = NativeVault.documentsBytes()
                st["wwwBytes"] = NativeVault.wwwBundleBytes()
                st["seatedEmbedBytes"] = NativeVault.wwwBundleBytes()
                st["appBytes"] = NativeVault.appBundleBytes()
                st["bundleBytes"] = NativeVault.appBundleBytes()
                st["yaFolderBytes"] = NativeVault.yaFolderBytes()
                let files = ModelManager.status()
                if let list = files["files"] { st["files"] = list }
                if let id = body["id"] as? String { st["id"] = id }
                reply(st)
            case "browse", "openUrl":
                let raw = (body["url"] as? String) ?? ""
                presentSafari(urlString: raw, id: body["id"] as? String)
            case "geolocate":
                requestGeolocate(id: body["id"] as? String)
            case "fetch":
                nativeFetch(urlString: (body["url"] as? String) ?? "", id: body["id"] as? String)
            default:
                break
            }
        }

        func requestGeolocate(id: String?) {
            pendingGeoId = id
            geoReplied = false
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                let status = self.locationManager.authorizationStatus
                switch status {
                case .notDetermined:
                    self.locationManager.requestWhenInUseAuthorization()
                case .authorizedWhenInUse, .authorizedAlways:
                    self.locationManager.requestLocation()
                case .denied, .restricted:
                    self.replyGeo(ok: false, reason: "denied", lat: nil, lon: nil, accuracy: nil)
                @unknown default:
                    self.replyGeo(ok: false, reason: "unknown-auth", lat: nil, lon: nil, accuracy: nil)
                }
            }
        }

        func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
            let status = manager.authorizationStatus
            guard pendingGeoId != nil, !geoReplied else { return }
            switch status {
            case .authorizedWhenInUse, .authorizedAlways:
                manager.requestLocation()
            case .denied, .restricted:
                replyGeo(ok: false, reason: "denied", lat: nil, lon: nil, accuracy: nil)
            case .notDetermined:
                break
            @unknown default:
                break
            }
        }

        func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
            guard let loc = locations.last else {
                replyGeo(ok: false, reason: "no-fix", lat: nil, lon: nil, accuracy: nil)
                return
            }
            replyGeo(
                ok: true,
                reason: nil,
                lat: loc.coordinate.latitude,
                lon: loc.coordinate.longitude,
                accuracy: loc.horizontalAccuracy
            )
        }

        func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
            let ns = error as NSError
            let reason: String
            if ns.domain == kCLErrorDomain, ns.code == CLError.denied.rawValue {
                reason = "denied"
            } else if ns.domain == kCLErrorDomain, ns.code == CLError.locationUnknown.rawValue {
                reason = "unavailable"
            } else {
                reason = "fail"
            }
            replyGeo(ok: false, reason: reason, lat: nil, lon: nil, accuracy: nil)
        }

        func replyGeo(ok: Bool, reason: String?, lat: Double?, lon: Double?, accuracy: Double?) {
            guard !geoReplied else { return }
            geoReplied = true
            var payload: [String: Any] = ["op": "geolocate", "ok": ok]
            if let reason = reason { payload["reason"] = reason }
            if let lat = lat { payload["lat"] = lat }
            if let lon = lon { payload["lon"] = lon }
            if let accuracy = accuracy { payload["accuracy"] = accuracy }
            if let id = pendingGeoId { payload["id"] = id }
            pendingGeoId = nil
            reply(payload)
        }

        func nativeFetch(urlString: String, id: String?) {
            let trimmed = urlString.trimmingCharacters(in: .whitespacesAndNewlines)
            func fail(_ reason: String) {
                var payload: [String: Any] = ["op": "fetch", "ok": false, "reason": reason]
                if let id = id { payload["id"] = id }
                reply(payload)
            }
            guard let url = URL(string: trimmed),
                  let scheme = url.scheme?.lowercased(),
                  scheme == "http" || scheme == "https" else {
                fail("bad-url"); return
            }
            let host = (url.host ?? "").lowercased()
            if host == "ntfy.sh" || host.hasSuffix(".ntfy.sh") {
                fail("infra"); return
            }
            let stripped = trimmed.replacingOccurrences(of: "https://", with: "").replacingOccurrences(of: "http://", with: "")
            let candidates = [
                URL(string: "https://r.jina.ai/http://" + stripped),
                URL(string: "https://r.jina.ai/" + trimmed),
                url
            ].compactMap { $0 }
            func tryNext(_ i: Int) {
                guard i < candidates.count else { fail("fetch"); return }
                var req = URLRequest(url: candidates[i], timeoutInterval: 18)
                req.setValue("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1", forHTTPHeaderField: "User-Agent")
                req.setValue("text/plain, text/html, */*", forHTTPHeaderField: "Accept")
                URLSession.shared.dataTask(with: req) { data, resp, err in
                    DispatchQueue.main.async {
                        if err != nil {
                            tryNext(i + 1)
                            return
                        }
                        let http = resp as? HTTPURLResponse
                        let code = http?.statusCode ?? 0
                        guard let data = data, (200..<400).contains(code) else {
                            tryNext(i + 1)
                            return
                        }
                        var text = String(data: data, encoding: .utf8) ?? String(decoding: data, as: UTF8.self)
                        if text.trimmingCharacters(in: .whitespacesAndNewlines).count < 40 {
                            tryNext(i + 1)
                            return
                        }
                        if text.count > 80000 { text = String(text.prefix(80000)) }
                        var payload: [String: Any] = [
                            "op": "fetch",
                            "ok": true,
                            "status": code,
                            "text": text,
                            "url": trimmed,
                            "via": candidates[i].absoluteString
                        ]
                        if let id = id { payload["id"] = id }
                        self.reply(payload)
                    }
                }.resume()
            }
            tryNext(0)
        }

        func presentSafari(urlString: String, id: String?) {
            let trimmed = urlString.trimmingCharacters(in: .whitespacesAndNewlines)
            guard let url = URL(string: trimmed),
                  let scheme = url.scheme?.lowercased(),
                  scheme == "http" || scheme == "https" else {
                var payload: [String: Any] = ["op": "browse", "ok": false, "reason": "bad-url"]
                if let id = id { payload["id"] = id }
                reply(payload)
                return
            }
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                guard let root = self.web?.window?.rootViewController else {
                    var payload: [String: Any] = ["op": "browse", "ok": false, "reason": "no-root"]
                    if let id = id { payload["id"] = id }
                    self.reply(payload)
                    return
                }
                var presenter = root
                while let shown = presenter.presentedViewController {
                    presenter = shown
                }
                let host = (url.host ?? "").lowercased()
                if host == "maps.apple.com" || (host.hasSuffix(".apple.com") && host.contains("maps")) {
                    UIApplication.shared.open(url, options: [:]) { ok in
                        var payload: [String: Any] = ["op": "browse", "ok": ok, "url": url.absoluteString, "maps": true]
                        if let id = id { payload["id"] = id }
                        self.reply(payload)
                    }
                    return
                }
                let safari = SFSafariViewController(url: url)
                presenter.present(safari, animated: true)
                var payload: [String: Any] = ["op": "browse", "ok": true, "url": url.absoluteString]
                if let id = id { payload["id"] = id }
                self.reply(payload)
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

        func presentShare(name: String, text: String) {
            guard let root = web?.window?.rootViewController else { return }
            NativeVault.prepare()
            let safe = name.replacingOccurrences(of: "/", with: "-")
            let url = NativeVault.root.appendingPathComponent(safe)
            do {
                try text.write(to: url, atomically: true, encoding: .utf8)
            } catch {
                return
            }
            let ac = UIActivityViewController(activityItems: [url], applicationActivities: nil)
            ac.excludedActivityTypes = [.addToReadingList, .assignToContact]
            if let pop = ac.popoverPresentationController {
                pop.sourceView = web
                pop.sourceRect = CGRect(x: web?.bounds.midX ?? 0, y: (web?.bounds.maxY ?? 0) - 8, width: 8, height: 8)
            }
            root.present(ac, animated: true)
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
