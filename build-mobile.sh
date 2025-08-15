#!/bin/bash

# Time Tracker Mobile App Builder
echo "🚀 Building Time Tracker Mobile App..."

# Step 1: Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules/@capacitor/core" ]; then
    echo "Installing Capacitor..."
    npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
fi

# Step 2: Initialize Capacitor (only if not already done)
if [ ! -f "capacitor.config.ts" ]; then
    echo "🔧 Initializing Capacitor..."
    npx cap init "Time Tracker" "com.timetracker.app"
fi

# Step 3: Build the web app
echo "🏗️  Building web application..."
npm run build

# Step 4: Add platforms if not already added
echo "📱 Setting up mobile platforms..."
if [ ! -d "android" ]; then
    npx cap add android
fi

# For iOS (only on macOS)
if [[ "$OSTYPE" == "darwin"* ]] && [ ! -d "ios" ]; then
    npx cap add ios
fi

# Step 5: Sync web assets to native projects
echo "🔄 Syncing assets..."
npx cap sync

# Step 6: Instructions for building APK
echo "✅ Mobile setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. For Android APK:"
echo "   - Run: npx cap open android"
echo "   - In Android Studio: Build → Generate Signed Bundle/APK"
echo "   - Or run: cd android && ./gradlew assembleRelease"
echo ""
echo "2. For iOS (macOS only):"
echo "   - Run: npx cap open ios" 
echo "   - Build in Xcode"
echo ""
echo "3. For development testing:"
echo "   - Android: npx cap run android"
echo "   - iOS: npx cap run ios"
echo ""
echo "📁 APK will be generated in: android/app/build/outputs/apk/release/"