# CLAUDE.md — Simple Finance App

Developer context for Claude Code sessions on this project.

## Scope

**This repo only.** Do not modify the website repo (`C:\Users\User\Desktop\simplefinance_website`). All feature work belongs here in the app.

## What This App Is

Private client portal iOS app (React Native / Expo SDK 54). Invite-only — no public signup. Clients log in to view their balance, interest, transactions, and growth projections. Admin logs in to manage users and transactions.

Positioned under Apple Guideline 3.2.1 (private-portal carve-out) for App Store submission. This is intentional and load-bearing — do not add public-facing investment solicitation language, public signup flows, or ROI guarantees.

## Key Credentials / IDs

- Bundle ID: `com.simplefinance.app`
- EAS Project ID: `4f45bf89-a088-41dd-ad89-b5ce4061a846`
- Apple Team ID: `UFT8Q9TG3D`
- ASC App ID: `6765585581`
- Apple ID: `kasper900322@gmail.com`
- Admin email: `simplefinance.com@gmail.com`
- Invite code: `SimpleInvest`
- Backend: `https://simplefinance-website.onrender.com`

## Architecture in One Paragraph

`App.js` wraps everything in `AuthProvider` + `NavigationContainer`. An in-memory auth context (no persisted token) gates the stack: unauthenticated → Login/ForgotPassword/ResetPassword; admin email → Admin + UserDashboard; regular user → Dashboard. `AsyncStorage` is used only for remembered credentials and the one-time invite-code-validated flag. No tab navigation — it's a single native stack.

## Commands

```bash
npm install --legacy-peer-deps
npx expo start --clear              # dev (Expo Go)
eas build --platform ios --profile production
eas submit --platform ios --profile production --latest
```

## Known Behaviours / Gotchas

**Backend cold start:** Render free tier sleeps after inactivity. `LoginScreen` fires a silent `fetch(${API}/api/auth/me).catch(()=>{})` on mount. Login timeout is 60s with the message '伺服器啟動中，請稍候約 30 秒後再試。'. Don't shorten this timeout.

**Asset sync after transactions:** After `AdminScreen` adds or deletes a transaction, the code immediately recalculates `newAssets` (using `data.updatedAssets` if the backend returns it, otherwise computing it locally), calls `updateUserAssets`, then PUTs to `/api/admin/users/:id/assets`. This keeps `user.assets` in the DB correct without needing a page reload. Don't remove this PUT.

**Chart projection base:** `DashboardScreen` builds the historical balance day-by-day from transaction + interest records. The projection starts from `projectionBase = allValues[allValues.length - 1]` (last historical computed balance), not from `user.assets`. This is intentional — on the day of first deposit, `user.assets` may not reflect the deposit yet, but the computed balance will. `hDays` is wrapped in `Math.max(0, ...)` to guard against timezone edge cases. Note: the app chart uses the old compound daily formula for projection; the backend uses simple daily (`balance * rate/365`). The difference is negligible at typical rates.

**Interest formula:** The backend calculates interest as `balance * (annualRate / 100) / 365` (simple daily), stored with full precision (8 decimal places). The website displays interest floored to 2 decimal places in the 每日利息紀錄 section. The app's `fmt()` function rounds to nearest dollar for values >= $1.

**Deposit pending period:** New deposits are excluded from interest for 2 days. Deposit dates are stored normalized to Taiwan midnight (UTC+8) via `getTaiwanDayStart()` so the pending cutoff comparison is timezone-consistent.

**Build number:** Managed by EAS (`appVersionSource: remote`, `autoIncrement: true`). Do not manually bump `buildNumber` in `app.json`.

**Icon files:**
- `assets/icon.png` — 1024×1024 RGB, white background, blue circle 880px diameter centred
- `assets/adaptive-icon.png` — 1024×1024 RGBA, transparent background (Android uses `backgroundColor: #1a1a2e` from `app.json`)
- `assets/splash.png` — leave this alone; it's the loading screen, not an icon

## What Not To Do

- Don't add a signup screen or link to it from the navigator
- Don't add public-investment-solicitation copy ("guaranteed returns", "open to all investors", etc.)
- Don't add a referral share/invite flow to the user dashboard (referral bonus records are display-only)
- Don't shorten the 60s login timeout
- Don't remove the admin asset-sync PUT after transactions
- Don't use `user.assets` as the chart projection base
- Don't change the interest formula in the app — it's controlled by the backend; the app just displays what the API returns
