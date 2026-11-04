import Foundation
import AuthenticationServices
import UIKit
import Security
import CryptoKit

/// Native X (Twitter) write pipe — OAuth 2.0 PKCE + Keychain tokens.
/// Placeholders only for client id/secret; Decider pastes real Client ID at runtime or rebuild.
/// No Zernio / third-party social MCP. Usage-light. Offline core unbroken without tokens.
enum NativeXConfig {
    /// Paste Client ID from developer.x.com — never commit real secrets.
    static var clientIdPlaceholder = ""
    /// Confidential apps only; public PKCE clients leave empty.
    static var clientSecretPlaceholder = ""
    static let redirectURI = "yaaim://oauth/x"
    static let scopes = "tweet.read tweet.write users.read offline.access"
    static let authorizeURL = "https://twitter.com/i/oauth2/authorize"
    static let tokenURL = "https://api.twitter.com/2/oauth2/token"
    static let tweetsURL = "https://api.twitter.com/2/tweets"
    static let searchURL = "https://api.twitter.com/2/tweets/search/recent"
    static let meURL = "https://api.twitter.com/2/users/me"
    static let keychainService = "io.github.rizaleon.yaaim.x"
    static let pinConversationId = "2100475587387347030"
    static let smokeAskId = "2100476375895519660"
    static let handle = "RizaltheBot"
    static let tag = "RBOT"
}

struct NativeXTokens: Codable {
    var accessToken: String
    var refreshToken: String?
    var expiresAt: TimeInterval?
    var scope: String?
    var userId: String?
    var username: String?
}

final class NativeX: NSObject, ASWebAuthenticationPresentationContextProviding {
    static let shared = NativeX()

    private override init() {
        super.init()
        loadPersistedClientId()
    }

    private var authSession: ASWebAuthenticationSession?
    private weak var presentingWindow: UIWindow?

    func bindWindow(_ window: UIWindow?) {
        presentingWindow = window
    }

    // MARK: - Keychain

    private func saveTokens(_ tokens: NativeXTokens) -> Bool {
        guard let data = try? JSONEncoder().encode(tokens) else { return false }
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: NativeXConfig.keychainService,
            kSecAttrAccount as String: "oauth"
        ]
        SecItemDelete(query as CFDictionary)
        var add = query
        add[kSecValueData as String] = data
        add[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        return SecItemAdd(add as CFDictionary, nil) == errSecSuccess
    }

    func loadTokens() -> NativeXTokens? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: NativeXConfig.keychainService,
            kSecAttrAccount as String: "oauth",
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var out: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &out) == errSecSuccess,
              let data = out as? Data,
              let tokens = try? JSONDecoder().decode(NativeXTokens.self, from: data) else { return nil }
        return tokens
    }

    @discardableResult
    func clearTokens() -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: NativeXConfig.keychainService,
            kSecAttrAccount as String: "oauth"
        ]
        let st = SecItemDelete(query as CFDictionary)
        return st == errSecSuccess || st == errSecItemNotFound
    }

    func statusDict() -> [String: Any] {
        let t = loadTokens()
        return [
            "connected": t?.accessToken.isEmpty == false,
            "username": t?.username ?? "",
            "userId": t?.userId ?? "",
            "scope": t?.scope ?? "",
            "hasRefresh": (t?.refreshToken?.isEmpty == false),
            "clientIdSet": !resolvedClientId().isEmpty,
            "redirectURI": NativeXConfig.redirectURI,
            "pinId": NativeXConfig.pinConversationId,
            "smokeAskId": NativeXConfig.smokeAskId,
            "handle": NativeXConfig.handle,
            "tag": NativeXConfig.tag
        ]
    }

    private func resolvedClientId(_ override: String? = nil) -> String {
        let o = (override ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        if !o.isEmpty { return o }
        if let stored = UserDefaults.standard.string(forKey: "ya.x.clientId"), !stored.isEmpty {
            return stored.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return NativeXConfig.clientIdPlaceholder.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private func resolvedClientSecret(_ override: String? = nil) -> String {
        let o = (override ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        if !o.isEmpty { return o }
        return NativeXConfig.clientSecretPlaceholder.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    // MARK: - PKCE helpers

    private func randomB64url(_ n: Int) -> String {
        var bytes = [UInt8](repeating: 0, count: n)
        _ = SecRandomCopyBytes(kSecRandomDefault, n, &bytes)
        return Data(bytes).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    private func pkceChallenge(_ verifier: String) -> String {
        let digest = SHA256.hash(data: Data(verifier.utf8))
        return Data(digest).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    // MARK: - Connect

    func connect(clientId: String?, clientSecret: String?, completion: @escaping ([String: Any]) -> Void) {
        let cid = resolvedClientId(clientId)
        guard !cid.isEmpty else {
            completion(["ok": false, "reason": "no-client-id", "hint": "Paste X Client ID (developer.x.com) via chat: set x client <id>"])
            return
        }
        let verifier = randomB64url(32)
        let state = randomB64url(16)
        let challenge = pkceChallenge(verifier)
        var comps = URLComponents(string: NativeXConfig.authorizeURL)!
        comps.queryItems = [
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "client_id", value: cid),
            URLQueryItem(name: "redirect_uri", value: NativeXConfig.redirectURI),
            URLQueryItem(name: "scope", value: NativeXConfig.scopes),
            URLQueryItem(name: "state", value: state),
            URLQueryItem(name: "code_challenge", value: challenge),
            URLQueryItem(name: "code_challenge_method", value: "S256")
        ]
        guard let authURL = comps.url else {
            completion(["ok": false, "reason": "bad-auth-url"])
            return
        }
        let session = ASWebAuthenticationSession(url: authURL, callbackURLScheme: "yaaim") { [weak self] callbackURL, error in
            guard let self = self else { return }
            if let error = error {
                let ns = error as NSError
                if ns.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                    completion(["ok": false, "reason": "canceled"])
                } else {
                    completion(["ok": false, "reason": "auth-fail", "detail": error.localizedDescription])
                }
                return
            }
            guard let callbackURL = callbackURL,
                  let items = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false)?.queryItems else {
                completion(["ok": false, "reason": "no-callback"])
                return
            }
            let code = items.first(where: { $0.name == "code" })?.value
            let returnedState = items.first(where: { $0.name == "state" })?.value
            let err = items.first(where: { $0.name == "error" })?.value
            if let err = err {
                completion(["ok": false, "reason": err])
                return
            }
            guard let code = code, returnedState == state else {
                completion(["ok": false, "reason": "state-mismatch"])
                return
            }
            self.exchangeCode(code: code, verifier: verifier, clientId: cid, clientSecret: self.resolvedClientSecret(clientSecret), completion: completion)
        }
        session.presentationContextProvider = self
        session.prefersEphemeralWebBrowserSession = false
        authSession = session
        if !session.start() {
            completion(["ok": false, "reason": "session-start-failed"])
        }
    }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        if let w = presentingWindow { return w }
        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow } ?? UIWindow()
    }

    private func exchangeCode(code: String, verifier: String, clientId: String, clientSecret: String, completion: @escaping ([String: Any]) -> Void) {
        guard let url = URL(string: NativeXConfig.tokenURL) else {
            completion(["ok": false, "reason": "bad-token-url"]); return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        var body = [
            "code": code,
            "grant_type": "authorization_code",
            "client_id": clientId,
            "redirect_uri": NativeXConfig.redirectURI,
            "code_verifier": verifier
        ]
        if !clientSecret.isEmpty {
            let basic = Data("\(clientId):\(clientSecret)".utf8).base64EncodedString()
            req.setValue("Basic \(basic)", forHTTPHeaderField: "Authorization")
            body["client_secret"] = clientSecret
        }
        req.httpBody = body.map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.value)" }
            .joined(separator: "&").data(using: .utf8)
        URLSession.shared.dataTask(with: req) { [weak self] data, resp, err in
            DispatchQueue.main.async {
                guard let self = self else { return }
                if err != nil {
                    completion(["ok": false, "reason": "token-net"]); return
                }
                let codeHttp = (resp as? HTTPURLResponse)?.statusCode ?? 0
                guard let data = data, (200..<300).contains(codeHttp),
                      let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let access = json["access_token"] as? String, !access.isEmpty else {
                    let raw = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
                    completion(["ok": false, "reason": "token-http-\(codeHttp)", "detail": String(raw.prefix(200))])
                    return
                }
                let refresh = json["refresh_token"] as? String
                let scope = json["scope"] as? String
                let expiresIn = json["expires_in"] as? Double
                var tokens = NativeXTokens(
                    accessToken: access,
                    refreshToken: refresh,
                    expiresAt: expiresIn.map { Date().timeIntervalSince1970 + $0 },
                    scope: scope,
                    userId: nil,
                    username: nil
                )
                self.fetchMe(access: access) { me in
                    if let me = me {
                        tokens.userId = me["id"] as? String
                        tokens.username = me["username"] as? String
                    }
                    _ = self.saveTokens(tokens)
                    var out: [String: Any] = [
                        "ok": true,
                        "username": tokens.username ?? "",
                        "userId": tokens.userId ?? "",
                        "scope": scope ?? NativeXConfig.scopes
                    ]
                    completion(out)
                }
            }
        }.resume()
    }

    private func fetchMe(access: String, completion: @escaping ([String: Any]?) -> Void) {
        guard let url = URL(string: NativeXConfig.meURL) else { completion(nil); return }
        var req = URLRequest(url: url, timeoutInterval: 15)
        req.setValue("Bearer \(access)", forHTTPHeaderField: "Authorization")
        URLSession.shared.dataTask(with: req) { data, _, _ in
            DispatchQueue.main.async {
                guard let data = data,
                      let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let user = json["data"] as? [String: Any] else {
                    completion(nil); return
                }
                completion(user)
            }
        }.resume()
    }

    // MARK: - Token refresh

    private func validAccess(completion: @escaping (String?) -> Void) {
        guard var tokens = loadTokens(), !tokens.accessToken.isEmpty else {
            completion(nil); return
        }
        if let exp = tokens.expiresAt, exp > Date().timeIntervalSince1970 + 60 {
            completion(tokens.accessToken); return
        }
        guard let refresh = tokens.refreshToken, !refresh.isEmpty else {
            completion(tokens.accessToken); return
        }
        let cid = resolvedClientId(nil)
        guard !cid.isEmpty, let url = URL(string: NativeXConfig.tokenURL) else {
            completion(tokens.accessToken); return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        let secret = resolvedClientSecret(nil)
        var body = [
            "grant_type": "refresh_token",
            "refresh_token": refresh,
            "client_id": cid
        ]
        if !secret.isEmpty {
            let basic = Data("\(cid):\(secret)".utf8).base64EncodedString()
            req.setValue("Basic \(basic)", forHTTPHeaderField: "Authorization")
        }
        req.httpBody = body.map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.value)" }
            .joined(separator: "&").data(using: .utf8)
        URLSession.shared.dataTask(with: req) { [weak self] data, resp, _ in
            DispatchQueue.main.async {
                guard let self = self,
                      let data = data,
                      let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let access = json["access_token"] as? String else {
                    completion(tokens.accessToken); return
                }
                tokens.accessToken = access
                if let r = json["refresh_token"] as? String { tokens.refreshToken = r }
                if let e = json["expires_in"] as? Double {
                    tokens.expiresAt = Date().timeIntervalSince1970 + e
                }
                _ = self.saveTokens(tokens)
                completion(access)
            }
        }.resume()
    }

    // MARK: - Write

    func postTweet(text: String, inReplyToId: String?, completion: @escaping ([String: Any]) -> Void) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            completion(["ok": false, "reason": "empty"]); return
        }
        if trimmed.count > 280 {
            completion(["ok": false, "reason": "too-long", "chars": trimmed.count]); return
        }
        validAccess { [weak self] access in
            guard let self = self, let access = access else {
                completion(["ok": false, "reason": "not-connected"]); return
            }
            guard let url = URL(string: NativeXConfig.tweetsURL) else {
                completion(["ok": false, "reason": "bad-url"]); return
            }
            var body: [String: Any] = ["text": trimmed]
            if let replyId = inReplyToId?.trimmingCharacters(in: .whitespacesAndNewlines), !replyId.isEmpty {
                body["reply"] = ["in_reply_to_tweet_id": replyId]
            }
            guard let payload = try? JSONSerialization.data(withJSONObject: body) else {
                completion(["ok": false, "reason": "encode"]); return
            }
            var req = URLRequest(url: url, timeoutInterval: 20)
            req.httpMethod = "POST"
            req.setValue("Bearer \(access)", forHTTPHeaderField: "Authorization")
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = payload
            URLSession.shared.dataTask(with: req) { data, resp, err in
                DispatchQueue.main.async {
                    if err != nil {
                        completion(["ok": false, "reason": "net"]); return
                    }
                    let code = (resp as? HTTPURLResponse)?.statusCode ?? 0
                    let raw = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
                    guard (200..<300).contains(code),
                          let data = data,
                          let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                          let tw = json["data"] as? [String: Any],
                          let id = tw["id"] as? String else {
                        completion(["ok": false, "reason": "http-\(code)", "detail": String(raw.prefix(300))])
                        return
                    }
                    completion([
                        "ok": true,
                        "id": id,
                        "text": tw["text"] as? String ?? trimmed,
                        "url": "https://x.com/\(NativeXConfig.handle)/status/\(id)"
                    ])
                }
            }.resume()
        }
    }

    // MARK: - Optional green pull (usage-light)

    func pull(query: String?, completion: @escaping ([String: Any]) -> Void) {
        let q = (query ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let finalQ = q.isEmpty
            ? "conversation_id:\(NativeXConfig.pinConversationId) -is:retweet"
            : q
        validAccess { access in
            guard let access = access else {
                completion(["ok": false, "reason": "not-connected"]); return
            }
            var comps = URLComponents(string: NativeXConfig.searchURL)!
            comps.queryItems = [
                URLQueryItem(name: "query", value: finalQ),
                URLQueryItem(name: "max_results", value: "10"),
                URLQueryItem(name: "tweet.fields", value: "author_id,created_at,conversation_id,in_reply_to_user_id")
            ]
            guard let url = comps.url else {
                completion(["ok": false, "reason": "bad-url"]); return
            }
            var req = URLRequest(url: url, timeoutInterval: 18)
            req.setValue("Bearer \(access)", forHTTPHeaderField: "Authorization")
            URLSession.shared.dataTask(with: req) { data, resp, err in
                DispatchQueue.main.async {
                    if err != nil {
                        completion(["ok": false, "reason": "net"]); return
                    }
                    let code = (resp as? HTTPURLResponse)?.statusCode ?? 0
                    let raw = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
                    guard (200..<300).contains(code),
                          let data = data,
                          let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                        completion(["ok": false, "reason": "http-\(code)", "detail": String(raw.prefix(300))])
                        return
                    }
                    let tweets = (json["data"] as? [[String: Any]]) ?? []
                    let slim = tweets.prefix(10).map { tw -> [String: Any] in
                        [
                            "id": tw["id"] as? String ?? "",
                            "text": tw["text"] as? String ?? "",
                            "author_id": tw["author_id"] as? String ?? "",
                            "conversation_id": tw["conversation_id"] as? String ?? ""
                        ]
                    }
                    completion(["ok": true, "query": finalQ, "tweets": Array(slim), "count": slim.count])
                }
            }.resume()
        }
    }

    /// Store Client ID in UserDefaults (not a secret) so Decider can paste without rebuild.
    func setClientId(_ id: String) {
        let trimmed = id.trimmingCharacters(in: .whitespacesAndNewlines)
        UserDefaults.standard.set(trimmed, forKey: "ya.x.clientId")
        NativeXConfig.clientIdPlaceholder = trimmed
    }

    func loadPersistedClientId() {
        if let s = UserDefaults.standard.string(forKey: "ya.x.clientId"), !s.isEmpty {
            NativeXConfig.clientIdPlaceholder = s
        }
    }
}
