# LifeDash Development Setup

This document outlines the development environment setup for LifeDash to ensure consistent builds.

## Required Versions

### Node.js
- **Version**: LTS (currently v22.18.0)
- **Manager**: nvm
- **Command**: `nvm use --lts`

### Java
- **Version**: OpenJDK 21.0.8
- **Installation**: Homebrew
- **Path**: `/opt/homebrew/Cellar/openjdk@21/21.0.8/libexec/openjdk.jdk/Contents/Home`

### Android SDK
- **Minimum SDK**: 27
- **Target SDK**: 35
- **Compile SDK**: 35

### Capacitor
- **Version**: 7.4.2
- **Android Platform**: 7.4.2

## Environment Setup

### Quick Setup
Run the setup script to configure your environment:
```bash
source scripts/setup-env.sh
```

### Manual Setup
Add these lines to your `~/.zshrc`:
```bash
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.8/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

## Build Process

### Complete Build
Use the build script for the entire process:
```bash
./scripts/build-android.sh
```

### Manual Build Steps
1. **Build Vite project**:
   ```bash
   npm run build
   ```

2. **Sync with Capacitor**:
   ```bash
   npx cap sync
   ```

3. **Build Android**:
   ```bash
   cd android
   export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.8/libexec/openjdk.jdk/Contents/Home
   ./gradlew clean build
   ```

## Troubleshooting

### Java Version Issues
If you encounter Java version errors:
1. Ensure JAVA_HOME is set correctly
2. Verify Java 21 is installed: `java -version`
3. Check the path: `echo $JAVA_HOME`

### Node.js Version Issues
If Capacitor CLI fails:
1. Switch to LTS: `nvm use --lts`
2. Verify version: `node --version` (should be >= 20.0.0)

### Android Build Issues
If Android build fails:
1. Clean the project: `cd android && ./gradlew clean`
2. Sync Capacitor: `npx cap sync`
3. Rebuild: `./gradlew build`

## APK Locations
After successful build, APK files are located at:
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

## Notes
- Lint errors are currently disabled to allow successful builds
- The project uses Android SDK 35 for compatibility with latest Capacitor features
- Minimum SDK is set to 27 to support required features
