#!/bin/bash

# iOS Build Script for LifeDash
echo "🚀 Building LifeDash for iOS..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the web app
echo "📦 Building web assets..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

# Sync with iOS
echo "🔄 Syncing with iOS..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ iOS sync failed"
    exit 1
fi

# Install pods
echo "📱 Installing iOS dependencies..."
cd ios/App
/opt/homebrew/bin/pod install

if [ $? -ne 0 ]; then
    echo "❌ Pod install failed"
    exit 1
fi

cd ../..

echo "✅ iOS build completed successfully!"
echo "📱 You can now open the project in Xcode with: npm run cap:open:ios"
echo "🏃 Or run it on simulator with: npm run cap:run:ios"
