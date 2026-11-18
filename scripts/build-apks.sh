#!/usr/bin/env bash
# Builds the three release APKs and verifies they use the release keystore.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "JAVA_HOME is not set. Point it at a JDK 21 installation." >&2
  exit 1
fi

SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ -z "$SDK" ]]; then
  echo "ANDROID_HOME (or ANDROID_SDK_ROOT) is not set." >&2
  exit 1
fi

VERSION=$(node -p "require('./package.json').version")
APK_DIR=android/app/build/outputs/apk/release
DEST=releases
LOG="$PWD/.expo/build-apks.log"
mkdir -p "$DEST" .expo

build_variant() {
  local arch="$1" label="$2"
  echo "==> Building $label"
  if ! (cd android && ./gradlew assembleRelease -PreactNativeArchitectures="$arch") >>"$LOG" 2>&1; then
    echo "Build failed. Last lines of $LOG:" >&2
    tail -30 "$LOG" >&2
    exit 1
  fi
  cp "$APK_DIR/app-release.apk" "$DEST/capital-quiz-v${VERSION}-${label}.apk"
}

build_variant arm64-v8a arm64-v8a
build_variant armeabi-v7a armeabi-v7a
build_variant "armeabi-v7a,arm64-v8a,x86,x86_64" universal

BUILD_TOOLS=$(ls -d "$SDK"/build-tools/* 2>/dev/null | sort -V | tail -1)
if [[ -z "${BUILD_TOOLS:-}" ]]; then
  echo "No Android build-tools found under $SDK." >&2
  exit 1
fi
APKSIGNER="$BUILD_TOOLS/apksigner"
[[ -f "$APKSIGNER.bat" ]] && APKSIGNER="$APKSIGNER.bat"

for apk in "$DEST"/capital-quiz-v"$VERSION"-*.apk; do
  cert=$("$APKSIGNER" verify --print-certs "$apk" 2>/dev/null | grep "Signer #1 certificate DN" || true)
  if [[ "$cert" != *"CN=Capital Quiz"* ]]; then
    echo "ERROR: $apk is not signed with the release key." >&2
    echo "       Check ~/.capital-quiz/keystore.properties." >&2
    exit 1
  fi
done

echo
ls -lh "$DEST"/capital-quiz-v"$VERSION"-*.apk
