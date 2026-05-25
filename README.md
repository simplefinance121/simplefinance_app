# Simple Finance App

A **Progressive Web App (PWA)** — private client portal for Simple Finance clients. Users log in to view their balance, transaction history, interest records, and asset growth projections. Installable on iPhone and Android directly from the browser with no App Store required.

Live: **https://simplefinance-app.vercel.app**

## Tech Stack

- **React Native + Expo SDK 54** with **react-native-web** — single codebase runs on web
- **React Navigation v6** (Native Stack)
- **AsyncStorage** — remembered credentials, backed by `localStorage` on web
- **Custom SVG charts** with `react-native-svg` — area chart, gradient fill, bezier curves, interactive crosshair tooltip (touch on mobile, hover on desktop)
- **react-native-toast-message** for notifications
- **Service worker** (`public/sw.js`) — caches the app bundle on first load; subsequent loads are near-instant
- **Deployed on Vercel** — static export via `expo export --platform web`

## Features

### Install Flow
- **Install screen** shown on first browser visit (before login)
- Android / Chrome: one-tap native install prompt (`beforeinstallprompt`)
- iOS / Safari: step-by-step Add to Home Screen instructions
- iOS / Chrome: message directing the user to open in Safari instead (Chrome on iOS cannot install PWAs)
- Skipped automatically if app is already running in standalone mode
- "先在瀏覽器使用" permanently dismisses; deleting the app from home screen will show the prompt again on next visit

### Client Portal
- **Login** — email + password; Remember Me pre-fills credentials on next open; 60s server warmup timeout
- **Dashboard** — live balance, cumulative earnings, currency badge (USD / AUD / TWD / JPY)
- **Asset growth chart** — historical + projected area chart; year selector (1/3/5/10/20); crosshair tooltip shows date + balance
- **Transaction records** (入金/出金) — paginated, 7 per page
- **Daily interest records** — paginated, 7 per page
- **Referral bonus earnings** — passive history of bonuses from referrals
- **Referral code card** — shows the user's referral code with a one-tap copy button and cumulative referral earnings; visible to all users on the Dashboard
- **Profile page** — read-only account info (currency, interest rate, referral code with copy button, referral earnings); editable name and email saved to backend immediately
- No persistent sessions — closing the app logs out; Remember Me only pre-fills the form

### Admin Panel
- User list with search (by name or email), sorted by assets descending
- Edit assets, currency (USD/AUD/TWD/JPY), per-user annual interest rate, per-user referral bonus rate inline
- **重算利息** button — recalculates interest for all users at once
- Add / delete transactions; assets in DB **auto-sync** after every add/delete
- **Recurring transactions** (定期入金/出金) — set a day-of-month (1–28); active rules displayed with delete buttons
- Expandable per-user section (出/入金) with transaction summary totals (總資金/總利息/總推薦獎勵), filter tabs, paginated list (首頁/末頁), delete buttons
- View any user's dashboard without logging in as them
- Referral modal — view who referred whom, set referral bonus rate
- Delete user — cascades to all related records

## Getting Started

```bash
npm install --legacy-peer-deps
npm run web           # dev server at localhost:8081
```

## Build & Deploy

```bash
npm run build:web     # exports to dist/ with PWA manifest + service worker injected
```

Upload `dist/` to Vercel (or any static host). The project is connected to GitHub — every push to `main` triggers an automatic Vercel redeploy.

## Backend

Shared API at `https://simplefinance-website.onrender.com` (Render free tier — first request after inactivity takes 30–60s). The login screen fires a silent warmup ping on mount and shows a friendly message if the server isn't ready yet. Admin access is restricted to `simplefinance.com@gmail.com`.

## Project Structure

See `PROJECT_STRUCTURE.md` for full architecture, screen-by-screen detail, navigation flow, and theme tokens.
