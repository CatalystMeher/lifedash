#!/bin/bash

# Android Development Script for LifeDash
# This script helps streamline the development workflow

echo "🚀 LifeDash Android Development Script"
echo "======================================"

# Check if Android Studio is installed
if [ ! -d "/Applications/Android Studio.app" ]; then
    echo "❌ Android Studio not found!"
    echo "Please install Android Studio from: https://developer.android.com/studio"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to build and sync
build_and_sync() {
    echo "📦 Building web app..."
    npm run build
    
    echo "🔄 Syncing with Android..."
    npx cap sync android
    
    echo "✅ Build and sync complete!"
}

# Function to open in Android Studio
open_android_studio() {
    echo "🔧 Opening Android Studio..."
    npx cap open android
}

# Function to run on device
run_on_device() {
    echo "📱 Running on device/emulator..."
    npx cap run android
}

# Main menu
case "$1" in
    "build")
        build_and_sync
        ;;
    "open")
        open_android_studio
        ;;
    "run")
        run_on_device
        ;;
    "full")
        build_and_sync
        open_android_studio
        ;;
    *)
        echo "Usage: $0 {build|open|run|full}"
        echo ""
        echo "Commands:"
        echo "  build  - Build web app and sync with Android"
        echo "  open   - Open Android Studio"
        echo "  run    - Run app on device/emulator"
        echo "  full   - Build, sync, and open Android Studio"
        echo ""
        echo "Examples:"
        echo "  $0 build    # Build and sync"
        echo "  $0 full     # Complete workflow"
        ;;
esac
