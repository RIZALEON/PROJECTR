import SwiftUI
import UniformTypeIdentifiers
#if canImport(AppKit)
import AppKit
#endif
#if canImport(UIKit)
import UIKit
#endif

/// Claymation landings.
/// Bolte / USER MANUAL: Manual cover → download PDF; EXIT → home.
/// Mind / MACHINE MIND: scene + size counter (MB/GB/TB) + ↑ feed + ↓ offload + EXIT.
struct ClayLandingView: View {
    @Binding var isPresented: Bool
    var title: String = ""

    @State private var exportNote: String? = nil
    @State private var pressedExit = false
    @State private var showFeedPicker = false
    @State private var sizeUnit: MachineMindVault.Unit = .mb
    @State private var sizeNumber: String = "0"
    @State private var sizeUnitLetters: String = "MB"
    @State private var unitLocked = false
    #if canImport(UIKit)
    @State private var sharePDFURL: URL? = nil
    #endif

    private var showsManualCover: Bool {
        title.localizedCaseInsensitiveContains("MANUAL")
    }

    private var backdropAsset: String {
        showsManualCover ? "ClayLandingBackdrop" : "MindLandingBackdrop"
    }

    var body: some View {
        ZStack {
            ZStack {
                Color.black
                if ClayImage.exists(backdropAsset) {
                    Image(backdropAsset)
                        .resizable()
                        .interpolation(.high)
                        .aspectRatio(contentMode: .fill)
                        .scaleEffect(showsManualCover ? 1.0 : 1.08)
                } else if ClayImage.exists("ClayLandingBackdrop") {
                    Image("ClayLandingBackdrop")
                        .resizable()
                        .interpolation(.high)
                        .scaledToFill()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .clipped()
            .ignoresSafeArea()
            .allowsHitTesting(false)

            VStack(spacing: 0) {
                if showsManualCover {
                    Spacer(minLength: 24)
                    GeometryReader { geo in
                        #if os(iOS)
                        let maxW = min(geo.size.width * 0.62, 320)
                        #else
                        let maxW = min(geo.size.width * 0.72, 420)
                        #endif
                        let maxH = geo.size.height * 0.88
                        ClayButton(
                            asset: "ManualCover",
                            systemFallback: "book.closed.fill",
                            width: maxW,
                            height: maxH,
                            help: "Download USER MANUAL"
                        ) {
                            downloadManual()
                        }
                        .frame(width: geo.size.width, height: geo.size.height, alignment: .center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    mindControls
                }

                exitControl
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .overlay(alignment: .bottom) {
            if let exportNote {
                Text(exportNote)
                    .font(ClayTheme.clayFont(size: 13, weight: .bold))
                    .foregroundStyle(ClayTheme.offWhite)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Capsule().fill(ClayTheme.charcoalDeep.opacity(0.94)))
                    .padding(.bottom, 72)
                    .transition(.opacity)
                    .allowsHitTesting(false)
            }
        }
        .onAppear {
            refreshSize()
            if !showsManualCover {
                flash(MachineMindVault.breakdownLabel())
            }
        }
        .fileImporter(
            isPresented: $showFeedPicker,
            allowedContentTypes: [.item, .data, .image, .pdf, .text, .audio, .movie, .directory],
            allowsMultipleSelection: true
        ) { result in
            switch result {
            case .success(let urls):
                var last = "Fed \(urls.count) item(s)"
                for u in urls {
                    let ok = u.startAccessingSecurityScopedResource()
                    defer { if ok { u.stopAccessingSecurityScopedResource() } }
                    // Last resort TOTAL RECALL: Mind .txt / CHAT-THREAD via ↑ feed reseats the face thread.
                    if MindReseat.looksLikeMindFile(u) {
                        last = MindReseat.reseat(from: u)
                        NotificationCenter.default.post(name: Notification.Name("ЯBOT.MindReseatDidFinish"), object: nil)
                        continue
                    }
                    do {
                        last = try MachineMindVault.feed(from: u)
                    } catch {
                        last = "Feed failed: \(error.localizedDescription)"
                    }
                }
                refreshSize()
                flash(last)
            case .failure(let err):
                flash("Feed cancelled: \(err.localizedDescription)")
            }
        }
        .modifier(ClayLandingFocusOff())
        #if canImport(UIKit)
        .sheet(isPresented: Binding(
            get: { sharePDFURL != nil },
            set: { if !$0 { sharePDFURL = nil } }
        )) {
            if let sharePDFURL {
                YaActivityView(items: [sharePDFURL])
            }
        }
        #endif
    }

    // MARK: - Mind controls

    private var mindArrowW: CGFloat {
        #if os(iOS)
        52
        #else
        64
        #endif
    }

    private var mindArrowH: CGFloat {
        #if os(iOS)
        80
        #else
        98
        #endif
    }

    private var mindArrowSpacing: CGFloat {
        #if os(iOS)
        12
        #else
        18
        #endif
    }

    private var mindArrowPadH: CGFloat {
        #if os(iOS)
        16
        #else
        28
        #endif
    }

    private var sizeCounterHeight: CGFloat {
        #if os(iOS)
        28
        #else
        48
        #endif
    }

    private var sizeCounterTopPad: CGFloat {
        #if os(iOS)
        56
        #else
        18
        #endif
    }

    private var exitFontSize: CGFloat {
        #if os(iOS)
        22
        #else
        26
        #endif
    }

    private var exitBottomPad: CGFloat {
        #if os(iOS)
        20
        #else
        28
        #endif
    }

    private var mindControls: some View {
        VStack(spacing: 10) {
            // Size counter sits in top chrome (safe area), clear of the clay face art.
            sizeCounter
                .padding(.top, sizeCounterTopPad)
                .zIndex(2)

            // Brain/mascot scene breathes in the middle; ↑↓ flank mid-height
            ZStack {
                Color.clear
                HStack(alignment: .center, spacing: mindArrowSpacing) {
                    ClayButton(
                        asset: "MindArrowUp",
                        systemFallback: "arrow.up.circle.fill",
                        width: mindArrowW,
                        height: mindArrowH,
                        help: "Feed MACHINE MIND — files, devices, components"
                    ) {
                        showFeedPicker = true
                    }

                    Spacer(minLength: 12)

                    ClayButton(
                        asset: "MindArrowDown",
                        systemFallback: "arrow.down.circle.fill",
                        width: mindArrowW,
                        height: mindArrowH,
                        help: "Offload MACHINE MIND for storage / transport"
                    ) {
                        offloadMind()
                    }
                }
                .padding(.horizontal, mindArrowPadH)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var sizeCounter: some View {
        // Chrome bar ABOVE the clay face — never float glyphs on the gargoyle head.
        MindClayCounterView(
            number: sizeNumber,
            unit: sizeUnitLetters,
            height: sizeCounterHeight
        ) {
            unitLocked = true
            sizeUnit = sizeUnit.next
            refreshSize()
            flash("Size unit · \(sizeUnit.rawValue)")
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 6)
        .background(
            Capsule(style: .continuous)
                .fill(Color.black.opacity(0.55))
                .overlay(
                    Capsule(style: .continuous)
                        .strokeBorder(Color.white.opacity(0.18), lineWidth: 1)
                )
        )
        .padding(.horizontal, 20)
    }

    private var exitControl: some View {
        Text("EXIT")
            .font(ClayTheme.clayFont(size: exitFontSize, weight: .bold))
            .tracking(4)
            .foregroundStyle(ClayTheme.offWhite)
            .shadow(color: Color.white.opacity(0.35), radius: 0, x: -1, y: -1)
            .shadow(color: Color.black.opacity(0.55), radius: 1.6, x: 1.5, y: 2)
            .scaleEffect(pressedExit ? 0.96 : 1.0)
            .padding(.vertical, 10)
            .padding(.horizontal, 20)
            .contentShape(Rectangle())
            .highPriorityGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in pressedExit = true }
                    .onEnded { value in
                        pressedExit = false
                        let dx = abs(value.translation.width)
                        let dy = abs(value.translation.height)
                        if dx < 24 && dy < 24 {
                            withAnimation(.easeInOut(duration: 0.18)) {
                                isPresented = false
                            }
                        }
                    }
            )
            .help("Return home")
            .accessibilityAddTraits(.isButton)
            .accessibilityLabel("EXIT")
            .padding(.bottom, exitBottomPad)
    }

    // MARK: - Actions

    private func refreshSize() {
        if !unitLocked {
            sizeUnit = MachineMindVault.preferredUnit(forBytes: MachineMindVault.mindBytes())
        }
        let parts = MachineMindVault.clayDisplayParts(unit: sizeUnit)
        sizeNumber = parts.number
        sizeUnitLetters = parts.unit
    }

    private func offloadMind() {
        flash("Packing MACHINE MIND…")
        do {
            let url = try MachineMindVault.offload()
            #if canImport(AppKit)
            NSWorkspace.shared.activateFileViewerSelecting([url])
            #endif
            flash("Offloaded · \(url.lastPathComponent)")
        } catch {
            flash("Offload failed: \(error.localizedDescription)")
        }
    }

    private func downloadManual() {
        flash("Starting download…")
        guard let src = ManualPDFLocator.resolveSeatedPDF() else {
            flash("USER-MANUAL.pdf not seated")
            return
        }
        ManualPDFLocator.seedMachineMind(from: src)

        #if canImport(AppKit)
        if let downloads = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first {
            let dest = downloads.appendingPathComponent("USER-MANUAL.pdf")
            do {
                if FileManager.default.fileExists(atPath: dest.path) {
                    try FileManager.default.removeItem(at: dest)
                }
                try FileManager.default.copyItem(at: src, to: dest)
                NSWorkspace.shared.activateFileViewerSelecting([dest])
                flash("Saved to Downloads")
                return
            } catch {
                flash("Downloads blocked — pick a folder…")
            }
        }

        let panel = NSSavePanel()
        panel.canCreateDirectories = true
        panel.nameFieldStringValue = "USER-MANUAL.pdf"
        panel.allowedContentTypes = [.pdf]
        panel.title = "Download USER MANUAL"
        panel.message = "Works offline from seated MACHINE MIND / ЯBOT"
        if let downloads = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first {
            panel.directoryURL = downloads
        }
        panel.begin { response in
            guard response == .OK, let dest = panel.url else {
                flash("Download cancelled")
                return
            }
            do {
                if FileManager.default.fileExists(atPath: dest.path) {
                    try FileManager.default.removeItem(at: dest)
                }
                try FileManager.default.copyItem(at: src, to: dest)
                NSWorkspace.shared.activateFileViewerSelecting([dest])
                flash("Downloaded")
            } catch {
                flash("Download failed: \(error.localizedDescription)")
            }
        }
        #else
        #if canImport(UIKit)
        do {
            let fm = FileManager.default
            // Prefer app Documents so Save to Files / share has a stable file
            let destDir = fm.urls(for: .documentDirectory, in: .userDomainMask).first
                ?? fm.temporaryDirectory
            let dest = destDir.appendingPathComponent("USER-MANUAL.pdf")
            if fm.fileExists(atPath: dest.path) {
                try fm.removeItem(at: dest)
            }
            try fm.copyItem(at: src, to: dest)
            sharePDFURL = dest
            flash("Download · pick Save to Files or share")
        } catch {
            flash("Download failed: \(error.localizedDescription)")
        }
        #else
        flash("Manual seated · open from Files")
        #endif
        #endif
    }

    private func flash(_ s: String) {
        exportNote = s
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.4) {
            if exportNote == s { exportNote = nil }
        }
    }
}

private struct ClayLandingFocusOff: ViewModifier {
    func body(content: Content) -> some View {
        #if os(macOS)
        if #available(macOS 14.0, *) {
            content.focusEffectDisabled()
        } else {
            content
        }
        #else
        content
        #endif
    }
}
