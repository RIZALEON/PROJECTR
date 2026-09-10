# llama.xcframework (local only — do not commit binary)

Build on Mac (Metal ios-arm64), then place here as `ios/llama.xcframework`:

```bash
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp && ./build-xcframework.sh
# → build-apple/llama.xcframework
cp -R build-apple/llama.xcframework /path/to/PROJECTR/ios/
```

YaAim.xcodeproj embeds this path (Embed & Sign, CodeSignOnCopy).
Team **88HACKXHZL** · bundle `io.github.rizaleon.yaaim.cam`.
See `docs/SEAT-LLAMA-XCFRAMEWORK.md`.
