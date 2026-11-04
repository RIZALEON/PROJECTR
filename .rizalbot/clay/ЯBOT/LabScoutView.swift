import SwiftUI
#if canImport(AppKit)
import AppKit
#endif

/// Clay Lab Scout · Mission 1 landing — loads MISSION1-TARGETS.json from Documents seat.
/// ONLINE: Scout COMB HARD·CLOUD·WWW (no BAM download; Kennewick STOP_BAM).
/// OFFLINE: Reader/magnetize — exact letter only.
struct LabScoutView: View {
    @Binding var isPresented: Bool
    var isOnline: Bool = false

    @State private var pack: Mission1Pack = .load()
    @State private var note: String? = nil

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color.black,
                    Color(red: 0.08, green: 0.10, blue: 0.14),
                    Color.black
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            .allowsHitTesting(false)

            VStack(spacing: 14) {
                header
                modeBanner
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        metaCard
                        ForEach(Mission1Region.allCases) { region in
                            regionCard(region)
                        }
                    }
                    .padding(.horizontal, 18)
                    .padding(.bottom, 8)
                }
                exitRow
            }
        }
        .overlay(alignment: .bottom) {
            if let note {
                Text(note)
                    .font(ClayTheme.clayFont(size: 13, weight: .bold))
                    .foregroundStyle(ClayTheme.offWhite)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Capsule().fill(ClayTheme.charcoalDeep.opacity(0.94)))
                    .padding(.bottom, 72)
            }
        }
        .onAppear {
            pack = .load()
            // Optional ghost establish if ledger API present (idempotent at file layer).
            _ = GhostChainLedger.establish(bio: pack.bio.isEmpty
                ? "LAB_SCOUT_MISSION_1_OLDEST_AMERICAS_10x3"
                : pack.bio)
        }
    }

    private var header: some View {
        HStack(spacing: 12) {
            if ClayImage.exists("LabIcon") {
                Image("LabIcon")
                    .resizable()
                    .interpolation(.high)
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 52, height: 52)
                    .shadow(color: .black.opacity(0.45), radius: 6, y: 3)
            } else {
                Image(systemName: "flask.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(ClayTheme.offWhite)
                    .frame(width: 52, height: 52)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text("Lab Scout · Mission 1")
                    .font(ClayTheme.clayFont(size: 22, weight: .bold))
                    .foregroundStyle(ClayTheme.offWhite)
                Text(pack.bio.isEmpty ? "Oldest Americas 10×3" : pack.bio)
                    .font(ClayTheme.clayFont(size: 11, weight: .medium))
                    .foregroundStyle(ClayTheme.offWhite.opacity(0.72))
                    .lineLimit(2)
            }
            Spacer()
            Text(isOnline ? "ONLINE" : "OFFLINE")
                .font(ClayTheme.clayFont(size: 11, weight: .bold))
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Capsule().fill(isOnline ? Color.green.opacity(0.35) : Color.gray.opacity(0.35)))
                .foregroundStyle(ClayTheme.offWhite)
        }
        .padding(.horizontal, 20)
        .padding(.top, 18)
    }

    private var modeBanner: some View {
        Text(isOnline
             ? "Scout COMB HARD·CLOUD·WWW · do NOT download BAM · Kennewick STOP_BAM"
             : "Reader/magnetize — exact letter only")
            .font(ClayTheme.clayFont(size: 12, weight: .bold))
            .foregroundStyle(isOnline ? Color.orange.opacity(0.95) : ClayTheme.gold)
            .padding(.horizontal, 20)
            .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var metaCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            row("Build", pack.build.isEmpty ? "GRCh37" : pack.build)
            row("Pools", pack.poolSummary)
            row("Top ages (BP)", pack.topAgesSummary)
            row("Laws", "GRCh37 · no invented geno/ABO · Kennewick STOP_BAM · USR1/2 HAVE_LOCAL · never average MICRO/MACRO")
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(cardBackground(stroke: Color.cyan.opacity(0.35)))
    }

    private func regionCard(_ region: Mission1Region) -> some View {
        let rows = pack.targets(in: region)
        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(region.title)
                    .font(ClayTheme.clayFont(size: 14, weight: .bold))
                    .foregroundStyle(ClayTheme.offWhite)
                Spacer()
                Text("n=\(rows.count)")
                    .font(ClayTheme.clayFont(size: 11, weight: .bold))
                    .foregroundStyle(ClayTheme.offWhite.opacity(0.65))
            }
            ForEach(rows) { t in
                targetRow(t)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(cardBackground(stroke: Color.white.opacity(0.18)))
    }

    private func targetRow(_ t: Mission1Target) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Text(String(format: "%2d", t.rank))
                .font(ClayTheme.clayFont(size: 11, weight: .bold))
                .foregroundStyle(Color.cyan.opacity(0.9))
                .frame(width: 22, alignment: .trailing)
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 8) {
                    Text(t.genetic_id)
                        .font(ClayTheme.clayFont(size: 12, weight: .bold))
                        .foregroundStyle(ClayTheme.offWhite)
                        .textSelection(.enabled)
                    Text(bpLabel(t.date_mean_BP))
                        .font(ClayTheme.clayFont(size: 11, weight: .medium))
                        .foregroundStyle(ClayTheme.offWhite.opacity(0.75))
                    Spacer(minLength: 4)
                    statusBadge(t.obtain_status)
                }
                Text(t.locality.isEmpty ? "—" : t.locality)
                    .font(ClayTheme.clayFont(size: 11, weight: .medium))
                    .foregroundStyle(ClayTheme.offWhite.opacity(0.65))
                    .lineLimit(2)
            }
        }
        .padding(.vertical, 2)
    }

    private func statusBadge(_ status: String) -> some View {
        let s = status.uppercased()
        let color: Color = {
            switch s {
            case "HAVE_LOCAL": return Color.green.opacity(0.55)
            case "STOP_BAM": return Color.red.opacity(0.55)
            case "KNOWN": return Color.blue.opacity(0.45)
            default: return Color.gray.opacity(0.4)
            }
        }()
        return Text(s.isEmpty ? "?" : s)
            .font(ClayTheme.clayFont(size: 9, weight: .bold))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Capsule().fill(color))
            .foregroundStyle(ClayTheme.offWhite)
    }

    private var exitRow: some View {
        HStack {
            Spacer()
            ClayButton(
                asset: "BtnMind",
                systemFallback: "xmark.circle.fill",
                width: 44,
                height: 44,
                help: "Exit Lab Scout"
            ) {
                isPresented = false
            }
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 16)
    }

    private func row(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label.uppercased())
                .font(ClayTheme.clayFont(size: 10, weight: .bold))
                .foregroundStyle(Color.cyan.opacity(0.85))
            Text(value)
                .font(ClayTheme.clayFont(size: 12, weight: .medium))
                .foregroundStyle(ClayTheme.offWhite)
                .textSelection(.enabled)
        }
    }

    private func cardBackground(stroke: Color) -> some View {
        RoundedRectangle(cornerRadius: 18, style: .continuous)
            .fill(Color.white.opacity(0.07))
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(stroke, lineWidth: 1.2)
            )
    }

    private func bpLabel(_ bp: Double) -> String {
        if bp <= 0 { return "—" }
        if bp == floor(bp) { return "\(Int(bp)) BP" }
        return String(format: "%.0f BP", bp)
    }
}

// MARK: - Models

enum Mission1Region: String, CaseIterable, Identifiable {
    case north = "NORTH"
    case central = "CENTRAL"
    case south = "SOUTH"
    var id: String { rawValue }
    var title: String {
        switch self {
        case .north: return "TOP10 · North America"
        case .central: return "TOP10 · Central America"
        case .south: return "TOP10 · South America"
        }
    }
}

struct Mission1Target: Identifiable, Equatable {
    var id: String { "\(region)-\(rank)-\(genetic_id)" }
    var rank: Int = 0
    var genetic_id: String = ""
    var region: String = ""
    var locality: String = ""
    var date_mean_BP: Double = 0
    var obtain_status: String = "KNOWN"
}

struct Mission1Pack: Equatable {
    var bio: String = "LAB_SCOUT_MISSION_1_OLDEST_AMERICAS_10x3"
    var build: String = "GRCh37"
    var poolNorth: Int = 0
    var poolCentral: Int = 0
    var poolSouth: Int = 0
    var topNorth: [Double] = []
    var topCentral: [Double] = []
    var topSouth: [Double] = []
    var targets: [Mission1Target] = []

    var poolSummary: String {
        "N \(poolNorth) · C \(poolCentral) · S \(poolSouth)"
    }

    var topAgesSummary: String {
        func span(_ a: [Double]) -> String {
            guard let first = a.first, let last = a.last else { return "—" }
            return "\(Int(first))…\(Int(last))"
        }
        return "N \(span(topNorth)) · C \(span(topCentral)) · S \(span(topSouth))"
    }

    func targets(in region: Mission1Region) -> [Mission1Target] {
        targets
            .filter { $0.region.uppercased() == region.rawValue }
            .sorted { $0.rank < $1.rank }
    }

    static func load() -> Mission1Pack {
        let urls = seatURLs()
        for url in urls {
            if let data = try? Data(contentsOf: url),
               let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                return fromJSON(obj)
            }
        }
        // Fallback: parse TOP10 TSVs from same seat folder
        if let fromTSV = loadFromTSVs() {
            return fromTSV
        }
        var empty = Mission1Pack()
        empty.bio = "(MISSION1-TARGETS.json not seated)"
        return empty
    }

    private static func seatURLs() -> [URL] {
        var list: [URL] = []
        let home = URL(fileURLWithPath: NSHomeDirectory())
        list.append(home.appendingPathComponent("Documents/ЯBOT/lab/scaffolds/scout/mission-1/MISSION1-TARGETS.json"))
        list.append(URL(fileURLWithPath: "/Users/rizal/Documents/ЯBOT/lab/scaffolds/scout/mission-1/MISSION1-TARGETS.json"))
        if let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            list.append(support.appendingPathComponent("ЯBOT/lab/scaffolds/scout/mission-1/MISSION1-TARGETS.json"))
        }
        if let bundle = Bundle.main.url(forResource: "MISSION1-TARGETS", withExtension: "json") {
            list.append(bundle)
        }
        return list
    }

    private static func fromJSON(_ obj: [String: Any]) -> Mission1Pack {
        var p = Mission1Pack()
        p.bio = obj["bio"] as? String ?? p.bio
        p.build = obj["build"] as? String ?? "GRCh37"
        if let pools = obj["pool_counts_deduped_usable_geno"] as? [String: Any] {
            p.poolNorth = intVal(pools["NORTH"])
            p.poolCentral = intVal(pools["CENTRAL"])
            p.poolSouth = intVal(pools["SOUTH"])
        }
        if let tops = obj["top_ages_BP"] as? [String: Any] {
            p.topNorth = doubleArr(tops["NORTH"])
            p.topCentral = doubleArr(tops["CENTRAL"])
            p.topSouth = doubleArr(tops["SOUTH"])
        }
        if let arr = obj["targets"] as? [[String: Any]] {
            p.targets = arr.map { row in
                Mission1Target(
                    rank: intVal(row["rank"]),
                    genetic_id: row["genetic_id"] as? String ?? "",
                    region: (row["region"] as? String ?? "").uppercased(),
                    locality: row["locality"] as? String ?? "",
                    date_mean_BP: doubleVal(row["date_mean_BP"]),
                    obtain_status: (row["obtain_status"] as? String ?? "KNOWN").uppercased()
                )
            }
        }
        return p
    }

    private static func loadFromTSVs() -> Mission1Pack? {
        let baseCandidates = [
            URL(fileURLWithPath: NSHomeDirectory()).appendingPathComponent("Documents/ЯBOT/lab/scaffolds/scout/mission-1"),
            URL(fileURLWithPath: "/Users/rizal/Documents/ЯBOT/lab/scaffolds/scout/mission-1")
        ]
        guard let base = baseCandidates.first(where: {
            FileManager.default.fileExists(atPath: $0.appendingPathComponent("TOP10_NORTH_AMERICA.tsv").path)
        }) else { return nil }

        var p = Mission1Pack()
        p.build = "GRCh37"
        let files: [(Mission1Region, String)] = [
            (.north, "TOP10_NORTH_AMERICA.tsv"),
            (.central, "TOP10_CENTRAL_AMERICA.tsv"),
            (.south, "TOP10_SOUTH_AMERICA.tsv")
        ]
        for (region, name) in files {
            let url = base.appendingPathComponent(name)
            guard let text = try? String(contentsOf: url, encoding: .utf8) else { continue }
            let lines = text.split(separator: "\n", omittingEmptySubsequences: true).map(String.init)
            guard lines.count > 1 else { continue }
            let header = lines[0].split(separator: "\t").map(String.init)
            func idx(_ keys: [String]) -> Int? {
                for k in keys {
                    if let i = header.firstIndex(where: { $0.caseInsensitiveCompare(k) == .orderedSame }) {
                        return i
                    }
                }
                return nil
            }
            let iId = idx(["genetic_id", "Genetic_ID", "GeneticID"]) ?? 1
            let iBP = idx(["date_mean_BP", "Date_mean_BP", "BP"]) ?? 2
            let iLoc = idx(["locality", "Locality"]) ?? 3
            let iStat = idx(["obtain_status", "status", "Status"]) ?? header.count - 1
            for (n, line) in lines.dropFirst().enumerated() {
                let cols = line.split(separator: "\t", omittingEmptySubsequences: false).map(String.init)
                func col(_ i: Int) -> String { i < cols.count ? cols[i] : "" }
                let bp = Double(col(iBP)) ?? 0
                p.targets.append(Mission1Target(
                    rank: n + 1,
                    genetic_id: col(iId),
                    region: region.rawValue,
                    locality: col(iLoc),
                    date_mean_BP: bp,
                    obtain_status: col(iStat).uppercased().isEmpty ? "KNOWN" : col(iStat).uppercased()
                ))
                switch region {
                case .north: p.topNorth.append(bp)
                case .central: p.topCentral.append(bp)
                case .south: p.topSouth.append(bp)
                }
            }
        }
        return p.targets.isEmpty ? nil : p
    }

    private static func intVal(_ any: Any?) -> Int {
        if let i = any as? Int { return i }
        if let d = any as? Double { return Int(d) }
        if let s = any as? String, let i = Int(s) { return i }
        return 0
    }

    private static func doubleVal(_ any: Any?) -> Double {
        if let d = any as? Double { return d }
        if let i = any as? Int { return Double(i) }
        if let s = any as? String, let d = Double(s) { return d }
        return 0
    }

    private static func doubleArr(_ any: Any?) -> [Double] {
        if let a = any as? [Double] { return a }
        if let a = any as? [Int] { return a.map(Double.init) }
        if let a = any as? [Any] { return a.map { doubleVal($0) } }
        return []
    }
}
