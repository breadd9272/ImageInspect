# Mobile App Setup Guide

## Converting Your Time Tracker to APK

This guide will help you convert your React web application into a mobile APK app.

### Prerequisites
- Node.js installed
- Android Studio (for Android APK)
- Java JDK 11+ 

### Step 1: Initialize Capacitor
```bash
npx cap init "Time Tracker" "com.timetracker.app"
```

### Step 2: Build the Web App
```bash
npm run build
```

### Step 3: Add Android Platform
```bash
npx cap add android
```

### Step 4: Sync Web Assets
```bash
npx cap sync android
```

### Step 5: Open in Android Studio
```bash
npx cap open android
```

### Step 6: Build APK
1. In Android Studio, go to Build → Generate Signed Bundle / APK
2. Choose APK
3. Create a keystore (first time) or use existing
4. Build release APK

### Alternative: Direct APK Build
```bash
# Build release APK directly
cd android
./gradlew assembleRelease
```

The APK will be generated in: `android/app/build/outputs/apk/release/`

### Features Added for Mobile:
- ✅ Touch-friendly interface
- ✅ Responsive design for mobile screens  
- ✅ Safe area support for notched devices
- ✅ PWA capabilities (installable on mobile)
- ✅ Mobile-optimized fonts and inputs
- ✅ Capacitor plugins for native features

### Available Mobile Scripts:
- `npx cap init` - Initialize Capacitor
- `npx cap add android` - Add Android platform
- `npx cap add ios` - Add iOS platform (macOS only)
- `npx cap sync` - Sync web assets to native projects
- `npx cap run android` - Run on Android device/emulator
- `npx cap open android` - Open in Android Studio

### Testing:
1. **Web Testing**: Regular browser testing
2. **Mobile Browser**: Test in Chrome mobile device mode
3. **Android Emulator**: Use Android Studio emulator
4. **Physical Device**: Enable USB debugging and run via ADB

### Production Deployment:
1. Build optimized web app
2. Sync to native project
3. Sign APK with release keystore
4. Upload to Google Play Store

### Troubleshooting:
- Ensure Android SDK is properly installed
- Check Java version compatibility
- Verify Capacitor config points to correct web directory
- Make sure all web assets are built before sync