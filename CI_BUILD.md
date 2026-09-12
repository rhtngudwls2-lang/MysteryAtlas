# CI build

The source archive intentionally does not depend on a bundled Gradle Wrapper JAR.
GitHub Actions installs Gradle 8.13 with the official `gradle/actions/setup-gradle` action and builds with:

```bash
gradle --no-daemon --stacktrace :app:assembleDebug
```

The resulting artifact is uploaded as `MysteryAtlas-debug-apk` and contains `app-debug.apk`.

Local builds still require JDK 17, Android SDK 36, and Gradle 8.13 as documented by `build-local.sh`.
