# Simple Finance App

React Native (Expo) mobile app for Simple Finance - professional quantitative investment technology services.

## Tech Stack

- **React Native** with **Expo SDK 54**
- **React Navigation v6** (Native Stack)
- **AsyncStorage** for remembered credentials
- **Custom SVG charts** with interactive crosshair tooltip
- **react-native-toast-message** for notifications

## Features

- Branded login screen with Remember Me
- User dashboard with asset overview and cumulative earnings
- Interactive area chart with gradient fill and touch crosshair
- Transaction records (deposits/withdrawals) with pagination
- Daily interest records with pagination
- Admin panel for user management
- No persistent sessions - app logout on close

## Getting Started

```bash
npm install --legacy-peer-deps
npx expo start --clear
```

Scan the QR code with Expo Go on your iPhone to preview.

## Build & Publish

```bash
eas build --platform ios
eas submit --platform ios
```

Requires an Apple Developer Account ($99/year).

## Backend

Uses the same API as the website: `https://simplefinance-website.onrender.com`
