# CLAUDE.md — Simple Finance App

Developer context for Claude Code sessions on this project.

## Scope

**This repo only.** Do not modify the website repo (`simplefinance_website`) unless a backend change is strictly required to support an app feature (e.g. a new API endpoint or a CORS entry). All feature work belongs here in the app.

## What This App Is

Private client portal PWA (Progressive Web App) built with React Native + Expo SDK 54 + react-native-web. Invite-only — clients log in to view their balance, interest, transactions, and growth projections. Admin logs in to manage users and transactions.

Deployed at **https://simplefinance-app.vercel.app** — no App Store involved. Users install it via "Add to Home Screen" in their browser.

## Key Credentials / IDs

- Bundle ID: `com.simplefinance.app` (retained in app.json, not actively used)
- EAS Project ID: `4f45bf89-a088-41dd-ad89-b5ce4061a846` (retained, not actively used)
- Apple Team ID: `UFT8Q9TG3D` (retained, not actively used)
- Admin email: `simplefinance.com@gmail.com`
- Backend: `https://simplefinance-website.onrender.com`
- PWA live URL: `https://simplefinance-app.vercel.app`

## Architecture in One Paragraph

`App.js` checks on web whether the app is running in standalone mode; if not, `InstallScreen` is shown first (Android: native install prompt, iOS: manual steps). After install/skip, `AuthProvider` + `NavigationContainer` gate the stack: unauthenticated → Login/ForgotPassword/ResetPassword; admin email → Admin + UserDashboard; regular user → Dashboard + Profile. `AsyncStorage` (backed by localStorage on web) stores remembered credentials. No tab navigation — single native stack.

## Commands

```bash
npm install --legacy-peer-deps
npm run web                   # dev server (browser)
npm run build:web             # production export → dist/
```

Vercel auto-deploys on every push to `main`. Manual deploy: `cd dist && vercel deploy`.

## Web / PWA Architecture

**Service worker** (`public/sw.js`): cache-first for static assets, network-first for HTML, never intercepts cross-origin API calls. Registered in `App.js` on web only.

**Post-build script** (`scripts/postbuild-web.js`): runs after `expo export --platform web` to inject PWA meta tags (manifest link, Apple tags, iOS auto-zoom fix CSS) into `dist/index.html` and copy `icon.png` + `public/` into `dist/`.

**Install screen** (`InstallScreen.js`): shown when `display-mode !== standalone`. Sets `sf_install_dismissed` in localStorage only when user explicitly skips — successful install or deletion/reinstall does not set this flag, so the prompt reappears naturally.

## Known Behaviours / Gotchas

**Backend cold start:** Render free tier sleeps after inactivity. `LoginScreen` fires a silent `fetch(${API}/api/auth/me).catch(()=>{})` on mount. Login timeout is 60s with the message `伺服器啟動中，請稍候約 30 秒後再試。`. Don't shorten this timeout.

**Asset sync after transactions:** After `AdminScreen` adds or deletes a transaction, the code immediately recalculates `newAssets` (using `data.updatedAssets` if the backend returns it, otherwise computing it locally), calls `updateUserAssets`, then PUTs to `/api/admin/users/:id/assets`. This keeps `user.assets` in the DB correct without needing a page reload. Don't remove this PUT.

**Chart projection base:** `DashboardScreen` builds the historical balance day-by-day from transaction + interest records. The projection starts from `projectionBase = allValues[allValues.length - 1]` (last historical computed balance), not from `user.assets`. This is intentional — on the day of first deposit, `user.assets` may not reflect the deposit yet, but the computed balance will. `hDays` is wrapped in `Math.max(0, ...)` to guard against timezone edge cases.

**Interest formula:** The backend calculates interest as `balance * (annualRate / 100) / 365` (simple daily). New deposits are excluded from interest for 2 days. The app's chart projection uses compound formula — the difference is negligible at typical rates.

**PanResponder on web:** `DashboardScreen`'s chart uses `PanResponder` on native and mouse events (`onMouseMove`, `onMouseLeave`) on web. The `panResponder` object is conditionally created — `Platform.OS === 'web'` returns `{ panHandlers: {} }`. Don't collapse this back into a single `PanResponder.create()` call.

**Alert on web:** `AdminScreen` uses a custom confirm `Modal` instead of `Alert.alert()` because `Alert` doesn't exist on web. Don't replace this modal with `Alert`.

**iOS auto-zoom:** Input fields get font-size forced to 16px on iOS via a CSS rule injected by `scripts/postbuild-web.js`. This prevents Safari's auto-zoom on focus. Don't remove this from the post-build script.

**Build number:** Managed by EAS (`appVersionSource: remote`, `autoIncrement: true`). Retained in config but not used for active distribution.

**Icon files:**
- `assets/icon.png` — 1024×1024 RGB, white background, blue circle 880px diameter centred (also used as PWA icon at `/icon.png`)
- `assets/adaptive-icon.png` — 1024×1024 RGBA, transparent background
- `assets/splash.png` — loading screen, leave alone

## What Not To Do

- Don't add a signup screen or link to it from the navigator
- Don't add public-investment-solicitation copy ("guaranteed returns", "open to all investors", etc.)
- Don't add a referral share/invite flow to the user dashboard (referral bonus records are display-only)
- Don't shorten the 60s login timeout
- Don't remove the admin asset-sync PUT after transactions
- Don't use `user.assets` as the chart projection base
- Don't replace the custom confirm modal in AdminScreen with `Alert.alert()`
- Don't collapse `PanResponder` in DashboardScreen — it must stay platform-conditional
- Don't set `sf_install_dismissed` on successful install — only on explicit skip
