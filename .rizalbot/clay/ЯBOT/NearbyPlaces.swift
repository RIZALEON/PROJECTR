import Foundation
import CoreLocation
import MapKit

/// WHERE you are + WHAT you named → CLOSEST + CLOSEST-BEST.
/// How to think (proximity), not what to taste (opinion).
enum NearbyPlaces {
    private static let gate = DispatchQueue(label: "ya.nearby.search")

    struct Spot {
        let name: String
        let locality: String
        let coordinate: CLLocationCoordinate2D
        let meters: CLLocationDistance
        let phone: String?
        let url: String?
        let category: String?
    }

    static func looksLikeProximitySearch(_ raw: String) -> Bool {
        let l = raw.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        // Never steal teach / lock / mind / code / essence / write routes
        let skipPrefixes = [
            "lock:", "lock ", "teach:", "teach ", "remember:", "remember ",
            "write code", "write:", "essence ", "mind ", "ghost ", "coin ",
            "place set", "place clear", "commands", "help", "ping",
        ]
        if skipPrefixes.contains(where: { l.hasPrefix($0) }) { return false }
        if l.hasPrefix("lock") || l.hasPrefix("teach") || l.hasPrefix("remember") { return false }
        if l == "place" || l == "time" || l == "online" || l == "offline" || l == "mode" { return false }

        if l.contains("near me") || l.contains("around me") || l.contains("nearby")
            || l.contains("nearest ") || l.hasPrefix("closest ") || l.contains(" closest ") {
            return true
        }
        if l.contains(" around") && (l.contains("best") || l.contains("food") || l.contains("restaurant")
            || l.contains("grocery") || l.contains("school") || l.contains("shop")) {
            return true
        }
        if l.hasPrefix("what's the best") || l.hasPrefix("whats the best") || l.hasPrefix("what is the best")
            || l.hasPrefix("where's the best") || l.hasPrefix("wheres the best") || l.hasPrefix("where is the best")
            || l.hasPrefix("best ") {
            return true
        }
        let starters = ["search ", "search:", "find ", "find me ", "look up ", "where is ", "where can i ", "where to "]
        let hints = [
            "restaurant", "food", "grocery", "market", "store", "shop", "mall", "cafe", "coffee",
            "school", "university", "college", "library", "hospital", "clinic", "pharmacy", "bank",
            "gym", "park", "hotel", "gas", "barber", "salon", "museum",
            "chinese", "filipino", "asian", "japanese", "thai", "mexican", "korean", "vietnamese",
            "indian", "italian", "ramen", "sushi", "pizza", "burger", "taco", "bakery",
            "computer", "electronics", "repair", "hardware", "bootcamp", "coding", "programming",
        ]
        if starters.contains(where: { l.hasPrefix($0) }) {
            return hints.contains { l.contains($0) }
        }
        // Bare place nouns / cuisine words (short asks)
        let bare = [
            "chinese restaurant", "filipino food", "filipino restaurant", "asian grocery",
            "asian market", "computer school", "computer store", "ramen", "sushi",
        ]
        if bare.contains(where: { l == $0 || l.hasPrefix($0 + " ") }) { return true }
        let nouns = ["restaurant", "grocery", "cafe", "pharmacy", "ramen", "sushi", "pizza", "bakery"]
        if nouns.contains(where: { l == $0 || l.hasSuffix(" " + $0) }) {
            return hints.contains { l.contains($0) }
        }
        // Single cuisine word → restaurant think
        let cuisine = ["chinese", "filipino", "asian", "japanese", "thai", "mexican", "korean", "vietnamese", "indian", "italian"]
        if cuisine.contains(l) { return true }
        if l.contains("restaurant") || l.contains("grocery") || l.contains("bootcamp") || l.contains("coding") || (l.contains("school") && (l.contains("computer") || l.contains("code"))) {
            return true
        }
        return false
    }

    static func normalizeQuery(_ raw: String) -> String {
        var t = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        let strips = [
            #"^(?i)search\s+(for\s+)?"#, #"^(?i)find\s+(me\s+)?"#, #"^(?i)nearby\s+"#,
            #"^(?i)near\s+me\s+"#, #"^(?i)look\s+up\s+"#, #"^(?i)where\s+(is|are|can\s+i\s+find)\s+"#,
            #"^(?i)where\s+to\s+(get|find|eat)\s+"#,
            #"^(?i)what'?s\s+the\s+best\s+"#, #"^(?i)whats\s+the\s+best\s+"#, #"^(?i)what\s+is\s+the\s+best\s+"#,
            #"^(?i)where'?s\s+the\s+best\s+"#, #"^(?i)wheres\s+the\s+best\s+"#, #"^(?i)where\s+is\s+the\s+best\s+"#,
            #"^(?i)best\s+"#, #"\s+near\s+me\s*$"#, #"\s+around\s*(me|here)?\s*$"#, #"\s+close\s+by\s*$"#,
            #"\s+nearby\s*$"#,
        ]
        for p in strips {
            if let r = try? NSRegularExpression(pattern: p) {
                t = r.stringByReplacingMatches(in: t, range: NSRange(t.startIndex..., in: t), withTemplate: "")
            }
        }
        t = t.trimmingCharacters(in: .whitespacesAndNewlines)
        if t.isEmpty { return "restaurant" }
        let lower = t.lowercased()
        let foodOnly = ["chinese", "japanese", "thai", "mexican", "italian", "korean", "vietnamese", "indian", "filipino", "asian"]
        if foodOnly.contains(lower) { return t + " restaurant" }
        if lower == "filipino food" { return "Filipino restaurant" }
        if lower == "computer" || lower == "computers" { return "computer store" }
        if lower == "computer school" || lower == "computer college" { return "coding bootcamp programming school" }
        return t
    }

    static func answer(query raw: String) -> String {
        // Never block the main thread waiting on MapKit (completions need the run loop).
        if Thread.isMainThread {
            var result = "PLACE search failed."
            let group = DispatchGroup()
            group.enter()
            DispatchQueue.global(qos: .userInitiated).async {
                result = gate.sync { answerUnlocked(raw: raw) }
                group.leave()
            }
            let deadline = Date().addingTimeInterval(28)
            while group.wait(timeout: .now() + 0.05) == .timedOut {
                RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.05))
                if Date() > deadline { break }
            }
            return result
        }
        return gate.sync { answerUnlocked(raw: raw) }
    }

    private static func answerUnlocked(raw: String) -> String {
        let asked = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        let q = normalizeQuery(asked)
        let time = PlaceSense.nowLine()
        PlaceSense.shared.refresh()

        guard let seat = PlaceSense.shared.coordinate() else {
            return """
            TIME \(time)
            PLACE needed.
            Allow Location, or: place set <lat>,<lon> <label>
            Example: place set 40.7608,-111.8910 Salt Lake City
            Then: what's the best Filipino food around
            """
        }
        let center = seat.0
        let originLabel = seat.1

        var spots = mapKitSearch(query: q, center: center)
        if spots.isEmpty && q.lowercased().contains("bootcamp") {
            for alt in ["coding bootcamp", "programming school", "software development school", "DevMountain", "computer training"] {
                spots = mapKitSearch(query: alt, center: center)
                if !spots.isEmpty { break }
            }
        }
        if spots.isEmpty {
            spots = mapKitSearch(query: q + " restaurant", center: center)
        }
        if ModeStore.shared.isOnline {
            let city = originLabel == "gps" ? "Salt Lake City" : originLabel
            if spots.isEmpty {
                spots = mapKitSearch(query: "\(q) \(city)", center: center)
            }
            spots = mergeUnique(spots + nominatim(query: q, center: center, nearLabel: city))
            if spots.isEmpty {
                spots = nominatim(query: q + " restaurant", center: center, nearLabel: city)
            }
        }

        let fitted = filterFit(spots, query: q)
        let lq = q.lowercased()
        let strict = (lq.contains("grocery") || lq.contains("market"))
            || (lq.contains("computer") && (lq.contains("school") || lq.contains("boot") || lq.contains("program")))
        let use = (strict && !fitted.isEmpty) ? fitted : (fitted.isEmpty ? spots : fitted)
        // Strict asks: never fall back to ballet/unrelated if a fit filter emptied the ring
        let useFinal: [Spot] = (strict && fitted.isEmpty) ? [] : use

        guard !useFinal.isEmpty else {
            var msg = """
            TIME \(time)
            PLACE \(originLabel) · \(fmt(center))
            ASK \(asked)
            QUERY \(q)
            No places in range yet.
            """
            if !ModeStore.shared.isOnline {
                msg += "\nTip: say `online` then ask again."
            } else {
                msg += "\nTip: allow Location for tighter GPS, or try a clearer name (Filipino restaurant, Asian market)."
            }
            return msg
        }

        let sorted = useFinal.sorted { $0.meters < $1.meters }
        let closest = sorted[0]
        let pool = Array(sorted.prefix(8))
        let best = pool.max(by: { score($0, query: q) < score($1, query: q) }) ?? closest

        var lines: [String] = [
            "TIME \(time)",
            "PLACE \(originLabel) · \(fmt(center))",
            "ASK \(asked)",
            "QUERY \(q)",
            "",
            "CLOSEST · \(closest.name)",
            detail(closest),
            "",
            "CLOSEST-BEST · \(best.name)",
            detail(best),
        ]
        if best.name != closest.name {
            lines.append("")
            lines.append("HOW: closest = least meters from your seat. closest-best = among the near ring, strongest local fit for what you named (method — not Decider taste).")
        } else {
            lines.append("")
            lines.append("HOW: same place wins both meters and seat signal in this ring.")
        }
        let alts = sorted.dropFirst().prefix(3).filter { $0.name != best.name }
        if !alts.isEmpty {
            lines.append("")
            lines.append("Also near:")
            for s in alts {
                lines.append("· \(s.name) · \(metersLabel(s.meters))")
            }
        }
        lines.append("")
        lines.append("THINK: where you are → what you named → closest + closest-best.")
        return lines.joined(separator: "\n")
    }

    private static func score(_ s: Spot, query: String) -> Double {
        var sc = 100.0 - (s.meters / 1000.0) * 12.0
        if s.url != nil { sc += 8 }
        if s.phone != nil { sc += 4 }
        let hay = (s.name + " " + (s.category ?? "") + " " + s.locality).lowercased()
        for w in query.lowercased().split(separator: " ") where w.count > 2 {
            if hay.contains(w) { sc += 6 }
        }
        return sc
    }

    private static func filterFit(_ spots: [Spot], query: String) -> [Spot] {
        let lq = query.lowercased()
        return spots.filter { s in
            let hay = (s.name + " " + (s.category ?? "") + " " + s.locality).lowercased()
            if lq.contains("grocery") || lq.contains("market") {
                return hay.contains("grocery") || hay.contains("market") || hay.contains("supermarket")
                    || hay.contains("foods") || hay.contains("asian") || hay.contains("oriental")
                    || hay.contains("filipino") || hay.contains("chinese")
            }
            if lq.contains("computer") && (lq.contains("school") || lq.contains("college") || lq.contains("boot") || lq.contains("academy") || lq.contains("program")) {
                let tech = ["computer", "coding", "code", "program", "software", "tech", "devops", "cyber", "data science", "information technology"]
                let schoolish = ["school", "college", "university", "academy", "institute", "boot", "campus", "training", "education"]
                return tech.contains(where: { hay.contains($0) }) && schoolish.contains(where: { hay.contains($0) })
            }
            if lq.contains("school") {
                return hay.contains("school") || hay.contains("college") || hay.contains("university")
                    || hay.contains("academy") || hay.contains("institute")
            }
            return true
        }
    }

    private static func detail(_ s: Spot) -> String {
        var bits = [metersLabel(s.meters)]
        if !s.locality.isEmpty { bits.append(s.locality) }
        if let p = s.phone, !p.isEmpty { bits.append(p) }
        if let u = s.url, !u.isEmpty { bits.append(u) }
        return bits.joined(separator: " · ")
    }

    private static func metersLabel(_ m: CLLocationDistance) -> String {
        if m < 1000 { return "\(Int(m)) m" }
        return String(format: "%.1f km", m / 1000)
    }

    private static func fmt(_ c: CLLocationCoordinate2D) -> String {
        String(format: "%.5f,%.5f", c.latitude, c.longitude)
    }

    private static func mapKitSearch(query: String, center: CLLocationCoordinate2D) -> [Spot] {
        let box = TimeoutBox<[Spot]>(defaultValue: [])
        let origin = CLLocation(latitude: center.latitude, longitude: center.longitude)
        let req = MKLocalSearch.Request()
        req.naturalLanguageQuery = query
        req.resultTypes = [.pointOfInterest, .address]
        req.region = MKCoordinateRegion(center: center, latitudinalMeters: 25_000, longitudinalMeters: 25_000)
        // Start from this thread — do NOT main.sync while a waiter may hold main.
        MKLocalSearch(request: req).start { response, _ in
            let items = response?.mapItems ?? []
            let spots: [Spot] = items.map { item in
                let coord = item.placemark.coordinate
                let loc = item.placemark.location ?? CLLocation(latitude: coord.latitude, longitude: coord.longitude)
                let locality = [item.placemark.thoroughfare, item.placemark.locality]
                    .compactMap { $0 }.joined(separator: ", ")
                return Spot(
                    name: item.name ?? "Place",
                    locality: locality,
                    coordinate: coord,
                    meters: origin.distance(from: loc),
                    phone: item.phoneNumber,
                    url: item.url?.absoluteString,
                    category: item.pointOfInterestCategory?.rawValue
                )
            }
            box.finish(spots)
        }
        return box.wait(seconds: 14)
    }

    /// OpenStreetMap Nominatim — no key; biased to Decider seat.
    private static func nominatim(query: String, center: CLLocationCoordinate2D, nearLabel: String) -> [Spot] {
        func fetch(_ q: String, bounded: Bool) -> [Spot] {
            var comps = URLComponents(string: "https://nominatim.openstreetmap.org/search")!
            var items = [
                URLQueryItem(name: "q", value: q),
                URLQueryItem(name: "format", value: "json"),
                URLQueryItem(name: "limit", value: "12"),
            ]
            if bounded {
                items.append(URLQueryItem(name: "viewbox", value: String(format: "%f,%f,%f,%f",
                    center.longitude - 0.25, center.latitude + 0.20,
                    center.longitude + 0.25, center.latitude - 0.20)))
                items.append(URLQueryItem(name: "bounded", value: "0"))
            }
            comps.queryItems = items
            guard let url = comps.url else { return [] }
            var req = URLRequest(url: url, timeoutInterval: 12)
            req.setValue("YABOT/0.1 (offline-premier clay; proximity; +https://github.com/RIZALEON/RIZALBOT)", forHTTPHeaderField: "User-Agent")
            let box = TimeoutBox<Data?>(defaultValue: nil)
            URLSession.shared.dataTask(with: req) { data, _, _ in box.finish(data) }.resume()
            guard let data = box.wait(seconds: 12),
                  let arr = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] else { return [] }
            let origin = CLLocation(latitude: center.latitude, longitude: center.longitude)
            return arr.compactMap { el -> Spot? in
                guard let name = el["display_name"] as? String,
                      let latS = el["lat"] as? String, let lonS = el["lon"] as? String,
                      let la = Double(latS), let lo = Double(lonS) else { return nil }
                let short = name.split(separator: ",").first.map(String.init) ?? name
                let loc = CLLocation(latitude: la, longitude: lo)
                return Spot(
                    name: short,
                    locality: name,
                    coordinate: loc.coordinate,
                    meters: origin.distance(from: loc),
                    phone: nil,
                    url: nil,
                    category: el["type"] as? String
                )
            }
        }
        var spots = fetch("\(query) \(nearLabel)", bounded: true)
        if spots.isEmpty {
            spots = fetch("\(query) restaurant \(nearLabel)", bounded: true)
        }
        if spots.isEmpty {
            spots = fetch("\(query) \(nearLabel) Utah", bounded: false)
        }
        // Keep only roughly local (120 km) so Honolulu Chinese restaurant noise dies
        return spots.filter { $0.meters < 120_000 }
    }

    private static func mergeUnique(_ spots: [Spot]) -> [Spot] {
        var seen = Set<String>()
        var out: [Spot] = []
        for s in spots {
            let k = s.name.lowercased()
            if seen.contains(k) { continue }
            seen.insert(k)
            out.append(s)
        }
        return out
    }
}

final class TimeoutBox<T> {
    private let lock = NSCondition()
    private var value: T
    private var done = false
    init(defaultValue: T) { value = defaultValue }
    func finish(_ v: T) {
        lock.lock(); value = v; done = true; lock.broadcast(); lock.unlock()
    }
    func wait(seconds: TimeInterval) -> T {
        lock.lock()
        let deadline = Date().addingTimeInterval(seconds)
        while !done {
            if !lock.wait(until: deadline) { break }
        }
        let v = value
        lock.unlock()
        return v
    }
}
