import Foundation
import CoreLocation

/// Time + space seat. Offline premier: last known fix + Decider-set place survive.
/// GPS when allowed; never blocks Decider mouth.
final class PlaceSense: NSObject, CLLocationManagerDelegate {
    static let shared = PlaceSense()

    private let manager = CLLocationManager()
    private let lock = NSLock()
    private var lastFix: CLLocation?
    private var manualLabel: String?
    private var manualCoordinate: CLLocationCoordinate2D?

    private let udLat = "ya.place.manual.lat"
    private let udLon = "ya.place.manual.lon"
    private let udLabel = "ya.place.manual.label"

    private override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
        #if os(macOS)
        manager.distanceFilter = 100
        #endif
        loadManual()
    }

    /// Wall clock in Decider-local zone (device).
    static func nowLine() -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = .current
        f.dateFormat = "yyyy-MM-dd HH:mm:ss zzz (EEEE)"
        return f.string(from: Date())
    }

    var authorizationOK: Bool {
        let s = manager.authorizationStatus
        #if os(macOS)
        return s == .authorizedAlways || s == .authorized
        #else
        return s == .authorizedAlways || s == .authorizedWhenInUse
        #endif
    }

    func requestAccess() {
        let s = manager.authorizationStatus
        if s == .notDetermined {
            #if os(macOS)
            if #available(macOS 10.15, *) {
                manager.requestAlwaysAuthorization()
            }
            #else
            manager.requestWhenInUseAuthorization()
            #endif
        }
        if authorizationOK {
            manager.requestLocation()
        }
    }

    func refresh() {
        requestAccess()
        if authorizationOK { manager.requestLocation() }
    }

    private func loadManual() {
        let ud = UserDefaults.standard
        guard ud.object(forKey: udLat) != nil, ud.object(forKey: udLon) != nil else { return }
        let lat = ud.double(forKey: udLat)
        let lon = ud.double(forKey: udLon)
        guard lat != 0 || lon != 0 else { return }
        lock.lock()
        manualCoordinate = CLLocationCoordinate2D(latitude: lat, longitude: lon)
        manualLabel = ud.string(forKey: udLabel)
        lastFix = CLLocation(latitude: lat, longitude: lon)
        lock.unlock()
    }

    private func saveManual(lat: Double, lon: Double, label: String?) {
        let ud = UserDefaults.standard
        ud.set(lat, forKey: udLat)
        ud.set(lon, forKey: udLon)
        if let label, !label.isEmpty {
            ud.set(label, forKey: udLabel)
        } else {
            ud.removeObject(forKey: udLabel)
        }
    }

    /// Set Decider place when GPS dark: `place set 40.76,-111.89 Salt Lake City`
    @discardableResult
    func setManual(lat: Double, lon: Double, label: String?) -> String {
        let name = label?.trimmingCharacters(in: .whitespacesAndNewlines)
        lock.lock()
        manualCoordinate = CLLocationCoordinate2D(latitude: lat, longitude: lon)
        manualLabel = (name?.isEmpty == false) ? name : nil
        lastFix = CLLocation(latitude: lat, longitude: lon)
        let shown = manualLabel ?? String(format: "%.4f,%.4f", lat, lon)
        lock.unlock()
        saveManual(lat: lat, lon: lon, label: manualLabel)
        return "PLACE set · \(shown) · \(String(format: "%.5f", lat)),\(String(format: "%.5f", lon))"
    }

    func clearManual() -> String {
        lock.lock(); manualCoordinate = nil; manualLabel = nil; lock.unlock()
        let ud = UserDefaults.standard
        ud.removeObject(forKey: udLat)
        ud.removeObject(forKey: udLon)
        ud.removeObject(forKey: udLabel)
        return "PLACE manual cleared. GPS will speak when allowed."
    }

    /// Best available coordinate (manual > last GPS).
    func coordinate() -> (CLLocationCoordinate2D, String)? {
        lock.lock()
        defer { lock.unlock() }
        if let c = manualCoordinate {
            return (c, manualLabel ?? "manual seat")
        }
        if let fix = lastFix {
            return (fix.coordinate, "gps")
        }
        return nil
    }

    func statusLine() -> String {
        refresh()
        let time = PlaceSense.nowLine()
        lock.lock()
        let fix = lastFix
        let man = manualLabel
        let mc = manualCoordinate
        lock.unlock()
        var parts = ["TIME \(time)"]
        if let mc {
            let label = man ?? "manual seat"
            parts.append("PLACE manual · \(label) · \(String(format: "%.5f", mc.latitude)),\(String(format: "%.5f", mc.longitude))")
        } else if let fix {
            parts.append("PLACE gps · \(String(format: "%.5f", fix.coordinate.latitude)),\(String(format: "%.5f", fix.coordinate.longitude)) · ±\(Int(fix.horizontalAccuracy))m")
        } else {
            parts.append("PLACE unknown · say `place set <lat>,<lon> <label>` or allow Location")
        }
        parts.append("auth=\(authWord())")
        return parts.joined(separator: "\n")
    }

    private func authWord() -> String {
        switch manager.authorizationStatus {
        #if os(macOS)
        case .authorizedAlways, .authorized: return "allowed"
        #else
        case .authorizedAlways, .authorizedWhenInUse: return "allowed"
        #endif
        case .denied: return "denied"
        case .restricted: return "restricted"
        case .notDetermined: return "ask"
        @unknown default: return "unknown"
        }
    }

    // MARK: CLLocationManagerDelegate
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let loc = locations.last, loc.horizontalAccuracy >= 0 else { return }
        lock.lock(); lastFix = loc; lock.unlock()
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        _ = error
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        if authorizationOK { manager.requestLocation() }
    }
}
