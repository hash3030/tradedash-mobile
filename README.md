# Tradedash Mobile App

React Native + Expo app for Android (and iOS).

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo`
- EAS CLI (for builds): `npm install -g eas-cli`
- Expo Go app on your Android phone (for testing)

### Setup
```bash
npm install
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_URL to your server IP
```

### Run on your phone (instant, no build needed)
```bash
npx expo start
# Scan the QR code with Expo Go app on your Android phone
```

### Build APK for testing (sideload)
```bash
eas login   # create account at expo.dev first
eas build --platform android --profile preview
# Downloads an .apk file you can install directly
```

### Build for Google Play Store
```bash
eas build --platform android --profile production
# Produces an .aab file to upload to Google Play Console
```

## Folder Structure
```
src/
  screens/      — all app screens
    auth/       — login, register, verify, forgot password
    jobs/       — browse, job detail, post job
    forum/      — categories, posts, post detail
    dashboard/  — home, messages, applications
    onboarding/ — type selection, worker/hirer profile
    profile/    — edit profile, avatar
  components/   — reusable UI components
  navigation/   — tab and stack navigators
  lib/          — api client, auth helpers, utils
  hooks/        — useAuth, useJobs etc
```

## Environment Variables
| Variable | Description |
|---|---|
| EXPO_PUBLIC_API_URL | Your backend server URL |
| EXPO_PUBLIC_SITE_URL | Your website URL (for WhatsApp links) |
