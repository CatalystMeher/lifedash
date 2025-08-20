#!/bin/bash

# LifeDash Android Build Script
# This script handles the complete build process from Vite to Android APK

set -e  # Exit on any error

echo "🚀 Starting LifeDash Android build process..."

# Setup environment
echo "📋 Setting up environment..."
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.8/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# Build Vite project
echo "🔨 Building Vite project..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

# Build Android project
echo "🤖 Building Android project..."
cd android
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.8/libexec/openjdk.jdk/Contents/Home
./gradlew clean build

echo "✅ Build completed successfully!"
echo "📱 APK files are located in:"
echo "   - Debug: android/app/build/outputs/apk/debug/app-debug.apk"
echo "   - Release: android/app/build/outputs/apk/release/app-release.apk"

cd ..
