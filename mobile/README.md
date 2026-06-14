# Habitualize Mobile

## Quick Start (Laptop)

### 1. Start the backend
```powershell
cd mobile/backend
npm install
npm run dev
```
You should see: `Backend listening on port 3000` and `SQLite DB opened at .../data.db`

Leave this terminal running — the backend must stay on for the app to work.

### 2. Start the Expo frontend (in a second terminal)
```powershell
cd mobile
npx expo start
```
- Press `w` to open in your browser (web mode for laptop testing).
- Or scan the QR code with the **Expo Go** app on your phone.

### 3. Verify it works
- The browser should load the app at `http://localhost:19006` (or wherever Expo says).
- Open DevTools → Network tab — API calls should hit `http://localhost:3000`.

---

## Building for your Phone

### Android
```powershell
cd mobile
npm install
npx expo login        # only once
npx eas build -p android --profile production
```
Download the `.apk` from the Expo dashboard and install it on your device.

### iOS (macOS only, requires Apple Developer account)
```powershell
cd mobile
npm install
npx expo login        # only once
npx eas build -p ios --profile production
```

---
