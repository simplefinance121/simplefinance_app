# Simple Finance App - Project Structure

## Overview
React Native (Expo) iOS app for Simple Finance — a **private client portal**, not a public investment service. The app is invite-only: signup happens off-app (via the website), and the iOS app itself only allows existing clients to log in.

**App flow:** Login (invite-code-gated on first install) → Dashboard (regular user) or Admin panel (admin email). The website hosts public marketing pages and the signup flow; this app is the authenticated client experience.

This positioning (sometimes called "Path B" in App Review terms) is what allows the app to display balances, interest, and projections without requiring a financial-services license — Apple's Guideline 3.2.1 carve-out for private/internal portals.

## Tech Stack
- **Framework:** React Native with Expo SDK 54 / React 19
- **Navigation:** React Navigation v6 (Native Stack)
- **State:** React Context (`AuthContext`)
- **Storage:** AsyncStorage — remembered credentials and the first-install invite-code-validated flag
- **Charts:** Custom SVG chart with `react-native-svg` (area chart with gradient fill, smooth bezier curves, touch crosshair tooltip)
- **Notifications:** `react-native-toast-message`
- **Backend API:** `https://simplefinance-website.onrender.com` (shared with the website)
- **Distribution:** EAS Build + EAS Submit (configured for iOS App Store)

## Key Dependencies (from package.json)
```
expo: ~54.0.0
react: 19.1.0
react-native: 0.81.5
@react-navigation/native: 6.1.18
@react-navigation/native-stack: 6.9.26
@react-native-async-storage/async-storage: 2.2.0
react-native-svg: 15.12.1
react-native-safe-area-context: ~5.6.0
react-native-screens: ~4.16.0
react-native-toast-message: ^2.2.0
expo-status-bar: ~3.0.9
expo-web-browser: ~15.0.10
```

## File Structure
```
simplefinance_app/
├── App.js                          # Entry — Stack Navigator (login-gate, no signup route)
├── app.json                        # Expo config (bundle ID: com.simplefinance.app, EAS project ID wired)
├── babel.config.js                 # Babel config (babel-preset-expo)
├── eas.json                        # EAS Build & Submit config (Apple credentials configured)
├── package.json                    # Dependencies
├── .gitignore
├── assets/
│   ├── icon.png                    # 1024×1024 RGB — blue gradient circle (880px) on white canvas
│   ├── adaptive-icon.png           # 1024×1024 RGBA — same circle, transparent background for Android
│   └── splash.png                  # Splash screen image
└── src/
    ├── config.js                   # API base URL
    ├── theme.js                    # Color palette
    ├── context/
    │   └── AuthContext.js          # Auth state — login/logout, remember-me credentials
    └── screens/
        ├── LoginScreen.js          # Invite-code-gated login (first install only); server warmup ping on mount
        ├── ForgotPasswordScreen.js # Password reset request
        ├── ResetPasswordScreen.js  # Password reset with token
        ├── DashboardScreen.js      # Client portal — balance, projection chart, transactions, interest, referral earnings
        ├── AdminScreen.js          # Admin panel — full user management with auto-asset sync
        ├── SignupScreen.js         # On disk but unused (signup happens on website only)
        ├── HomeScreen.js           # Marketing page kept for reference; not in navigation
        ├── AboutScreen.js          # Marketing page kept for reference; not in navigation
        ├── FAQScreen.js            # Marketing page kept for reference; not in navigation
        ├── ContactScreen.js        # Marketing page kept for reference; not in navigation
        ├── ReferralScreen.js       # Marketing page kept for reference; not in navigation
        ├── DataScreen.js           # Marketing page kept for reference; not in navigation
        ├── TermsScreen.js          # Marketing page kept for reference; not in navigation
        └── PrivacyScreen.js        # Marketing page kept for reference; not in navigation
```

## Navigation Flow
```
AppNavigator (Stack)
├── user === null (not logged in)
│   ├── Login          (headerShown: false; invite-code-gated on first install)
│   ├── ForgotPassword (header: 忘記密碼)
│   └── ResetPassword  (header: 重設密碼)
│
├── user.email === ADMIN_EMAIL (admin logged in)
│   ├── Admin          (headerShown: false)
│   └── UserDashboard  (headerShown: false; admin views any user's dashboard)
│
└── user (regular user logged in)
    └── Dashboard      (headerShown: false)
```

## Authentication Design
- **No persistent sessions.** Auth state lives in React Context (in-memory). Closing the app logs the user out.
- **Remember Me** stores email + password in AsyncStorage so the form is pre-filled on next open. User must still tap Login.
- **Invite code gate:** on first install, the login screen requires an invite code (currently `SimpleInvest`) in addition to email/password. After one successful login, AsyncStorage flag `invite_validated: true` is set and the invite code field is hidden on subsequent app opens. Reinstall = invite code required again.
- **No in-app signup.** The Signup route is intentionally removed from the navigator so reviewers and users see only an invite-code-required login wall.
- **Admin access:** `simplefinance.com@gmail.com`.

## Screens — Detail

### Login Screen (`LoginScreen.js`)
- Dark navy header with logo, brand name, tagline
- White rounded form card
- **Server warmup ping** — fires `GET /api/auth/me` on mount (`.catch(() => {})`) so the Render backend wakes before the user taps Login
- **Invite code field** rendered conditionally — only on first install (when `invite_validated` flag is absent from AsyncStorage)
- Email + password fields with icons
- Remember Me checkbox + Forgot Password link
- Login button only — no signup button, no "or" divider
- Footer with copyright and disclaimer
- Safe-area insets, 60-second AbortController timeout; shows '伺服器啟動中，請稍候約 30 秒後再試。' on abort

### Dashboard Screen (`DashboardScreen.js`)
- Dark header with welcome message, balance, cumulative earnings, currency badge
- "Back to Admin" button visible when admin is viewing another user's dashboard via the `viewUserId` route param
- **Projection chart:**
  - Custom SVG area chart with gradient fill and smooth bezier curves
  - Historical segment replays actual transactions + interest records day-by-day to build the balance line; `hDays` is clamped with `Math.max(0, ...)` to prevent timezone edge-case negatives
  - Future projection uses `projectionBase` = last historical computed balance (not `user.assets`), compounded at the user's per-user `interestRate`
  - Year selector: 1, 3, 5, 10, 20 years
  - Touch crosshair: hold to see vertical + horizontal dashed lines, dot, and tooltip with date + balance
  - Scroll lock while touching the chart
  - Y-axis uses nice round numbers; X-axis shows ~5 month labels
  - Title shows the user's actual rate, e.g. "資產成長趨勢 (年化 7% 複利)"
- **Transaction records** (入金/出金) — paginated, 7 per page
- **Interest records** (每日利息) — paginated, 7 per page
- **Referral bonus earnings** (推薦獎勵利息) — passive history of bonuses earned from referrals; no share/copy controls
- Logout button (hidden when admin is viewing as another user)

### Admin Screen (`AdminScreen.js`)
- User list with search by name or email, sorted by assets desc
- **Per-user actions:**
  - Edit assets inline
  - Currency selector (USD / AUD / TWD)
  - 詳細資料 (Details) — expandable section with transaction add/list, filter tabs for 入金/出金/利息/推薦獎勵, paginated 10 per page
  - **Auto-asset sync** — after every transaction add or delete, the screen immediately recalculates the user's assets and PUTs to `/api/admin/users/:id/assets`, keeping the DB in sync without requiring a page reload
  - 查看 (View) — navigates to that user's dashboard via `UserDashboard` route
  - 推薦制度 (Referral) — modal showing referees + referrer; admin can edit per-user referral bonus rate
  - 利率 — modal to set per-user annual interest rate
  - 刪除用戶 (Delete user) — confirmation alert, cascades to transactions/interest/referral bonus records
- Admin endpoints used:
  - `GET /api/admin/users`
  - `PUT /api/admin/users/:id/assets`
  - `PUT /api/admin/users/:id/currency`
  - `PUT /api/admin/users/:id/interest-rate`
  - `PUT /api/admin/users/:id/referral-bonus-rate`
  - `GET /api/admin/users/:id/transactions`, `/interest`, `/referral-bonus`, `/referrals`, `/dashboard`
  - `POST /api/admin/users/:id/transactions`
  - `DELETE /api/admin/transactions/:txId`
  - `DELETE /api/admin/users/:id`

## Theme (`theme.js`)
- Primary: `#4a6cf7`
- Dark background: `#1a1a2e`
- Dark navies: `#0f3460`, `#16213e`
- Text: `#333` / `#555` / `#666`
- Background gray: `#f5f5f5`
- Deposit / success: `#166534`
- Withdrawal / error: `#991b1b`
- Interest highlight: `#4a6cf7`
- Referral bonus highlight: `#f59e0b`

## Commands
```bash
# Development
npm install --legacy-peer-deps
npx expo start --clear

# Build for iOS App Store (runs on Expo's macOS cloud workers)
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios --profile production --latest
```

## EAS Configuration (`eas.json`)
```json
{
  "cli": { "version": ">= 12.0.0", "appVersionSource": "remote" },
  "build": {
    "production": {
      "ios": { "buildConfiguration": "Release", "autoIncrement": true }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "kasper900322@gmail.com",
        "ascAppId": "6765585581",
        "appleTeamId": "UFT8Q9TG3D"
      }
    }
  }
}
```
- `appVersionSource: remote` — build number managed by EAS, not local `app.json`
- `autoIncrement: true` — build number increments automatically on each production build

## App Store Submission Status

**Positioning:** Path B — private client portal (Apple Guideline 3.2.1 carve-out, no financial-services license required because the app is invite-only and not a public investment service).

**Checklist:**
- [x] Invite-code login gate
- [x] In-app signup removed
- [x] Marketing screens reframed as private-portal language
- [x] Referral share UI removed from user dashboard (bonus history retained as account record)
- [x] App icon — 1024×1024 RGB, Telegram-style padding (880px circle on white canvas)
- [x] Apple Developer Program enrolled
- [x] App Store Connect app record created (bundle ID: `com.simplefinance.app`)
- [x] `eas.json` configured with real Apple ID, ASC App ID, Team ID
- [x] EAS project ID written into `app.json` (`4f45bf89-a088-41dd-ad89-b5ce4061a846`)
- [x] First build submitted to App Store Connect (version 1.0.0)
- [ ] App Store listing metadata (description in zh-Hant, screenshots, privacy URL)
- [ ] Reviewer notes with demo credentials and private-portal explanation

**Reviewer demo credentials must include:**
- Demo email + password for a regular user account
- Sample invite code: `SimpleInvest`

## Notes
- Backend on Render free tier — cold start takes 30–60s. The login screen fires a silent warmup ping on mount to minimize the wait.
- All UI text is in Traditional Chinese (繁體中文).
- Unused screens (Home, About, FAQ, Contact, Referral, Data, Terms, Privacy, Signup) are kept on disk but not wired into navigation.
- The dashboard chart uses each user's individual `interestRate` (set per-user by admin), not a hardcoded global rate.
- `adaptive-icon.png` is RGBA with transparent corners so Android's `backgroundColor: #1a1a2e` shows through correctly. `icon.png` is RGB with white corners (iOS clips to squircle itself).
