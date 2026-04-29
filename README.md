# Simple Finance App

React Native (Expo) iOS app — a **private client portal** for existing Simple Finance clients. The app is invite-only; signup happens off-app on the website. The iOS app provides authenticated clients a way to view their balance, transaction history, and account growth projections.

## Tech Stack

- **React Native** with **Expo SDK 54**
- **React Navigation v6** (Native Stack)
- **AsyncStorage** for remembered credentials and the first-install invite-code-validated flag
- **Custom SVG charts** with `react-native-svg` — area chart, gradient fill, touch crosshair tooltip
- **react-native-toast-message** for notifications

## Features

- **Invite-code-gated login** on first install (current code: `SimpleInvest`); subsequent logins skip the field after one successful auth on the device
- Remember Me — pre-fills email and password on next open
- User dashboard with balance, cumulative earnings, and currency badge
- Interactive area chart with gradient fill and touch crosshair; future-value projection uses each user's per-user annual interest rate set by the admin
- Year selector for projection: 1 / 3 / 5 / 10 / 20 years
- Transaction records (deposits / withdrawals) with pagination
- Daily interest records with pagination
- Referral bonus earnings history (passive — no share/invite UI in the app)
- Admin panel: user search, edit assets, edit interest rate, edit referral bonus rate, manage transactions, view-as-user, delete user
- No persistent sessions — closing the app logs the user out

## What this app is not

- Not a public investment service. There is no in-app signup; new clients are onboarded via the website.
- Not authorized to solicit investment from the public. The app is positioned for App Store review under Apple's private-portal carve-out (Guideline 3.2.1).

## Getting Started

```bash
npm install --legacy-peer-deps
npx expo start --clear
```

Scan the QR code with Expo Go on your iPhone to preview.

## Build & Publish

```bash
# from Windows — EAS runs the iOS build in Apple's cloud workers
eas build --platform ios --profile production
eas submit --platform ios --profile production --latest
```

Requires an Apple Developer Account ($99/year). See `PROJECT_STRUCTURE.md` for the App Store submission checklist.

## Backend

Uses the same API as the website: `https://simplefinance-website.onrender.com`. Admin access is restricted to a single email (`simplefinance.com@gmail.com`).

## Project Structure

See `PROJECT_STRUCTURE.md` for the full architecture, navigation flow, screen-by-screen detail, theme tokens, and submission checklist.
