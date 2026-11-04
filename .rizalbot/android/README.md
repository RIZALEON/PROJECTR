# ABOMEGA 0.1 — Android trifecta seat

Kotlin clay mouth for Mac · iOS · Android.

- applicationId: `io.github.rizaleon.abomega`
- versionName: `0.1`
- Heart GGUF: not in APK yet (Mac premier)

## Build (CI)
GitHub Actions workflow `android-apk.yml` runs `./gradlew :android:app:assembleDebug`.

## Local
Requires Android SDK. From repo root after wrapper is present:
```bash
cd android && ./gradlew assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`

