// RCodeHostBridge.swift — the native half of the RCODE / Xcode adapter.
// 🫈 Providence & Provenance 🦇 — RZL CITATION: Prof. Marcum, C.A., III (26, Nov 19),
// .RZL AI CRYPTOBOT ENJIN MODEL, RIZAL.PW, MAPS TECH Series, Aetaneo Rizal. Chase Rizal.
//
// Drop into the RCODE app target in Xcode (Neo). It injects
// rcode-host-adapter.js into the shell webview at document start, then
// answers the adapter's bridge calls with WKScriptMessageHandlerWithReply,
// so the JS side's bridge.call(method, args) returns a promise that
// resolves with the native reply.
//
// LAW (standing): keys never cross this bridge. getYaId returns the
// PUBLIC ЯID string only. Signing stays in RCODE's own Face ID /
// ЯCASKET path — this bridge carries identifiers and messages, never
// key material, never signatures on the model's behalf.
//
// NOTE: written on the build VM, which has no Xcode toolchain — this
// file is source for Neo, static-checked only, not compiled here.

import WebKit

final class RCodeHostBridge: NSObject, WKScriptMessageHandlerWithReply {

    /// The public ЯID RCODE answers for this device/user (never a key).
    var publicYaId: String?

    /// Methods the native side agrees to serve. Anything else is refused.
    var allowedMethods: Set<String> = ["getYaId", "hostInfo"]

    /// Attach to a webview configuration BEFORE the webview is created:
    /// injects the adapter at document start and registers the handler.
    func attach(to config: WKWebViewConfiguration, adapterJS: String) {
        let userScript = WKUserScript(source: adapterJS + "\n;RCodeHostAdapter.install();",
                                      injectionTime: .atDocumentStart,
                                      forMainFrameOnly: true)
        config.userContentController.addUserScript(userScript)
        config.userContentController.addScriptMessageHandler(self, contentWorld: .page, name: "yaseedHost")
    }

    func userContentController(_ controller: WKUserContentController,
                               didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        guard let body = message.body as? [String: Any],
              let method = body["method"] as? String else {
            replyHandler(nil, "bad message: expected {method, args}")
            return
        }
        guard allowedMethods.contains(method) else {
            replyHandler(nil, "refused: method not allowed over the RCODE bridge: \(method)")
            return
        }
        switch method {
        case "getYaId":
            replyHandler(["yaId": publicYaId ?? ""], nil)
        case "hostInfo":
            replyHandler(["hostId": "rcode-native",
                          "platform": ProcessInfo.processInfo.operatingSystemVersionString], nil)
        default:
            replyHandler(nil, "unhandled method: \(method)")
        }
    }
}

// JS-side call shape this handler serves: WKScriptMessageHandlerWithReply
// makes messageHandlers.yaseedHost.postMessage({method, args}) return a
// Promise in JS — resolved by replyHandler(value, nil), rejected by
// replyHandler(nil, error). rcode-host-adapter.js wraps that postMessage
// as bridge.call(method, args); no extra proxy is needed.
