# Releasing

## Signing

Release APKs are signed with the key at `~/.capital-quiz/release.keystore`.

The matching credentials live in `~/.capital-quiz/keystore.properties`:

```properties
storeFile=/absolute/path/to/release.keystore
storePassword=…
keyAlias=capital-quiz
keyPassword=…
```

Both files are **outside the repository and are not backed up by git**. Keep a
safe copy: without them you cannot ship an update that installs over the
current app.

`plugins/with-release-signing.js` injects this config into the generated
`android/app/build.gradle` during `expo prebuild`. If the properties file is
missing, release builds fall back to the debug keystore so local builds still
work — that fallback must never be used for a published APK.

## Build

With JDK 21 active and `ANDROID_HOME` set, one command builds and verifies all
three APKs:

```bash
pnpm build:apks
```

It builds arm64, armeabi-v7a, and the universal APK into `releases/`, then
checks that each one is signed by the release key (a debug-signed build makes
the script fail).

The equivalent manual commands are:

```bash
cd android
JAVA_HOME=/path/to/jdk-21 ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
JAVA_HOME=/path/to/jdk-21 ./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a
JAVA_HOME=/path/to/jdk-21 ./gradlew assembleRelease
```

The universal build includes x86/x86_64 for emulators; the two ARM builds are
the ones attached to a GitHub release.

## Versioning

Before a release, bump `expo.version` in `app.json` and `package.json`, and
increase `expo.android.versionCode` in `app.json`.
