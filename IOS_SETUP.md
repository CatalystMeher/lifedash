# iOS Setup Guide for LifeDash

This guide will help you set up and build LifeDash for iOS.

## Prerequisites

1. **macOS**: iOS development requires macOS
2. **Xcode**: Install the latest version from the Mac App Store
3. **Node.js**: Version 18+ (we're using 18.20.8)
4. **CocoaPods**: For managing iOS dependencies
5. **Homebrew**: For package management

## Installation Steps

### 1. Install Dependencies

```bash
# Install CocoaPods via Homebrew (recommended)
brew install cocoapods

# Install project dependencies
npm install
```

### 2. Add iOS Platform

The iOS platform has already been added to this project. If you need to add it again:

```bash
npx cap add ios
```

### 3. Build and Sync

```bash
# Build the web app
npm run build

# Sync with iOS
npm run cap:sync:ios
```

## Available Scripts

### Build Scripts
- `npm run cap:build:ios` - Build web assets and sync with iOS
- `npm run cap:sync:ios` - Sync web assets with iOS project
- `./scripts/build-ios.sh` - Complete iOS build process

### Development Scripts
- `npm run cap:open:ios` - Open project in Xcode
- `npm run cap:run:ios` - Run on iOS simulator

## Project Structure

```
ios/
├── App/
│   ├── App/
│   │   ├── App.xcodeproj/     # Xcode project
│   │   ├── App/               # iOS app source
│   │   └── public/            # Web assets
│   ├── Podfile               # CocoaPods dependencies
│   └── Podfile.lock          # Locked pod versions
```

## Configuration

### Capacitor Config
The iOS configuration is in `capacitor.config.json`:

```json
{
  "ios": {
    "backgroundColor": "#ffffff",
    "webContentsDebuggingEnabled": true,
    "allowMixedContent": true,
    "captureInput": true,
    "webViewPresentationStyle": "fullscreen"
  }
}
```

### Deployment Target
- Minimum iOS version: 14.0
- Configured in `ios/App/Podfile` and `ios/App/App.xcodeproj/project.pbxproj`

## Development Workflow

1. **Make changes** to your React app
2. **Build** the web assets: `npm run build`
3. **Sync** with iOS: `npm run cap:sync:ios`
4. **Open** in Xcode: `npm run cap:open:ios`
5. **Run** on simulator or device

## Troubleshooting

### CocoaPods Issues
If you encounter CocoaPods issues:

```bash
# Use Homebrew-installed pod
/opt/homebrew/bin/pod install

# Or reinstall CocoaPods
brew uninstall cocoapods
brew install cocoapods
```

### Node.js Version Issues
The project uses Capacitor CLI v6.0.0 for compatibility with Node.js 18.

### Xcode Issues
- Make sure Xcode is up to date
- Accept Xcode license: `sudo xcodebuild -license accept`
- Install iOS Simulator if needed

### Deployment Target Issues
If you encounter deployment target errors:
- The project is configured for iOS 14.0 minimum
- Both `ios/App/Podfile` and `ios/App/App.xcodeproj/project.pbxproj` are updated
- Run `npx cap sync ios` to ensure all settings are synchronized

## Building for Distribution

### Archive for App Store
1. Open project in Xcode: `npm run cap:open:ios`
2. Select "Any iOS Device" as target
3. Product → Archive
4. Follow App Store Connect instructions

### Development Build
1. Connect iOS device
2. Trust developer certificate in Settings
3. Run: `npm run cap:run:ios`

## Plugins

The following Capacitor plugins are configured:
- `@capacitor/app` - App lifecycle events
- `@capacitor/haptics` - Haptic feedback
- `@capacitor/keyboard` - Keyboard handling
- `@capacitor/status-bar` - Status bar customization
- `@capacitor-community/safe-area` - Safe area handling

## Notes

- The iOS project uses iOS 14.0 as minimum deployment target
- Web assets are automatically synced to `ios/App/App/public/`
- CocoaPods manages native dependencies
- Xcode project is located at `ios/App/App.xcodeproj`
