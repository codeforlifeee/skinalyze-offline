# Build Instructions for SAGAlyze APK

## Issue Encountered
The direct Gradle build is failing due to a known issue with Expo 50's gradle plugin configuration. This is a common issue with Expo SDK 50.

## Solution: Use EAS Build (Recommended)

### Option 1: EAS Build (Cloud-based - Easiest)

1. **Install EAS CLI:**
```powershell
npm install -g eas-cli
```

2. **Login to Expo:**
```powershell
eas login
```

3. **Configure EAS Build:**
```powershell
eas build:configure
```

4. **Build APK:**
```powershell
eas build -p android --profile preview
```

This will build the APK in the cloud and provide a download link when complete.

---

## Option 2: Local Build with Expo Dev Client

If you want to build locally, use the development build:

```powershell
npx expo run:android --variant release
```

This bypasses the Gradle plugin issues.

---

## Option 3: Fix Gradle Issues Manually

### Step 1: Update package.json
Add this to `package.json` under `scripts`:
```json
"build:android": "cd android && ./gradlew clean && ./gradlew assembleRelease",
"prebuild": "expo prebuild --clean"
```

### Step 2: Downgrade to Expo SDK 49 (If needed)
```powershell
npm install expo@49 --save
npx expo install --fix
```

### Step 3: Clean and rebuild
```powershell
cd android
.\gradlew.bat clean
cd ..
npx expo prebuild --clean
cd android
.\gradlew.bat assembleRelease
```

---

## Option 4: Use Expo's build:android command

```powershell
npx expo build:android -t apk
```

---

## Quick Fix: Build APK Now

### Try This Command:
```powershell
npx expo run:android --variant release --no-bundler
```

Or use the development build:
```powershell
npx expo run:android
```

Then install it on your device for testing.

---

## Expected APK Location

If the build succeeds, the APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Why This Error Occurs

The error `Plugin [id: 'expo-module-gradle-plugin'] was not found` happens because:
1. Expo SDK 50 has changed how gradle plugins are loaded
2. Some Expo modules (like expo-camera) expect the plugin to be included differently
3. The `expo-modules-core` plugin needs to be in the build path

This is a known issue in Expo SDK 50 and is typically resolved by:
- Using EAS Build
- Using `expo run:android` instead of direct gradle commands
- Or waiting for Expo SDK 51 which has fixes

---

## Recommended Approach for Your Project

Since you need an APK quickly, I recommend:

### Use EAS Build:
```powershell
# Install
npm install -g eas-cli

# Login (create account if needed at expo.dev)
eas login

# Build
eas build -p android --profile preview
```

This will:
1. Upload your code
2. Build in the cloud (takes 10-15 minutes)
3. Give you a download link for the APK
4. No local Android/Gradle issues to deal with

### Or use Development Build:
```powershell
npx expo run:android
```

This creates a development APK that works for testing.

---

## Alternative: Use APK from Release

If you just need to test the app, you can also use:
```powershell
npx expo start --android
```

And scan the QR code with Expo Go app on your Android device.

---

## Summary

**Fastest way to get APK:**
```powershell
eas build -p android --profile preview
```

**For local testing:**
```powershell
npx expo run:android
```

The Gradle build issues with Expo 50 are known and these alternative methods are the official Expo recommendations.
