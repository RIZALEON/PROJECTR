# Parent must seat on Mac (executor lacks CopyFromBox / Shell.machineId)

machineId: 55d92eb0-0ce0-4959-b297-440d80e59e38

1. CopyFromBox box_path=/workspace/lab-scout-seat.tgz computer_path=/Users/rizal/Documents/ЯBOT/_staging/lab-scout-seat.tgz
2. Shell machineId:
   mkdir -p /Users/rizal/Documents/ЯBOT/_staging && cd /Users/rizal/Documents/ЯBOT/_staging && tar -xzf lab-scout-seat.tgz && bash lab-scout-seat/scripts/MAC-SEAT-LAB-SCOUT.sh /Users/rizal/Documents/ЯBOT/_staging/lab-scout-seat

What it does:
- Twins LabScoutView.swift + patched ContentView.swift → Documents/ЯBOT/ЯBOT/ and ~/Library/Developer/ЯBOT-localbuild/ЯBOT/
- Chrome order LIVE: Bolte → LabIcon → BtnSearch; Lab opens Mission 1 overlay (zIndex 65)
- Ghost append LAB_SCOUT_MISSION_1_OLDEST_AMERICAS_10x3 if missing
- xcodebuild Debug CODE_SIGNING_ALLOWED=NO → /Applications/ЯBOT.app → open

GitHub: push seat-wallet-landing (PR #1 DO NOT MERGE)
