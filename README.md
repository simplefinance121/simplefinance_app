# Simple Finance App

React Native (Expo) iOS app — a **private client portal** for existing Simple Finance clients. The app is invite-only; signup happens off-app on the website. The iOS app provides authenticated clients a way to view their balance, transaction history, interest records, and asset growth projections.

## Tech Stack

- **React Native** with **Expo SDK 54** / React 19
- **React Navigation v6** (Native Stack)
- **AsyncStorage** — remembered credentials and the first-install invite-code flag
- **Custom SVG charts** with `react-native-svg` — area chart, gradient fill, bezier curves, touch crosshair tooltip
- **react-native-toast-message** for notifications
- **EAS Build + EAS Submit** for App Store distribution from Windows

## Features

### Client App
- **Invite-code-gated login** on first install (code: `SimpleInvest`); subsequent logins skip the field after one successful auth on the device
- **Remember Me** — pre-fills email and password on next open
- **Server warmup ping** — fires a silent request on app launch so the Render backend is awake by the time the user taps Login; login timeout is 60s with a user-friendly cold-start message
- **Dashboard** — live balance, cumulative earnings, currency badge
- **Asset growth chart** — interactive SVG area chart; historical segment replays actual deposits and interest day-by-day; future projection compounds at the user's per-user annual rate (1 / 3 / 5 / 10 / 20 year selector); touch crosshair shows date + balance tooltip
- **Transaction records** (入金/出金) — paginated, 7 per page
- **Daily interest records** — paginated, 7 per page
- **Referral bonus earnings** — passive history of bonuses from referrals (no share/invite UI)
- No persistent sessions — closing the app logs the user out

### Admin Panel
- User list with search by name or email, sorted by assets descending
- Edit assets, currency, per-user annual interest rate, per-user referral bonus rate inline
- Add / delete transactions (deposit or withdrawal); assets in DB **auto-update** after every add/delete so the dashboard stays consistent without a page reload
- Expandable per-user transaction list with filter tabs (入金 / 出金 / 利息 / 推薦獎勵), paginated 10 per page
- View any user's dashboard ("查看") without logging in as them
- Referral modal — view who referred whom, set referral bonus rate
- Delete user — cascades to all related records

## App Store Positioning

Positioned under Apple Guideline 3.2.1 (private/internal portal carve-out). Not a public investment service — no in-app signup, invite-only access. This allows the app to display balances, interest, and projections without a financial-services license.

## Getting Started

```bash
npm install --legacy-peer-deps
npx expo start --clear
```

Scan the QR code with Expo Go on your iPhone to preview.

## Build & Submit

```bash
# iOS production build (runs on Expo's macOS cloud workers)
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios --profile production --latest
```

EAS is fully configured — Apple ID, ASC App ID (`6765585581`), and Team ID (`UFT8Q9TG3D`) are in `eas.json`. Build number auto-increments with each build (`appVersionSource: remote`). Requires Apple Developer Account ($99/year).

## Backend

Shared API with the website: `https://simplefinance-website.onrender.com` (Render free tier — first request after inactivity takes 30–60s; the app fires a silent warmup ping on launch and shows a friendly message if the user logs in before the server is ready). Admin access is restricted to `simplefinance.com@gmail.com`.

## Project Structure

See `PROJECT_STRUCTURE.md` for the full architecture, navigation flow, screen-by-screen detail, theme tokens, and submission checklist.
