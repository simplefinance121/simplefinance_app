# Simple Finance App — Project Structure

## Overview

Progressive Web App (PWA) built with React Native + Expo SDK 54 and react-native-web. Single codebase targets web; installed on phones via "Add to Home Screen" (no App Store). Deployed at **https://simplefinance-app.vercel.app**.

**App flow:** Install screen (first visit) → Login → Dashboard (regular user) or Admin panel (admin email).

## Tech Stack

| Concern | Library |
|---|---|
| Framework | React Native + Expo SDK 54 / React 19 |
| Web target | react-native-web + react-dom |
| Navigation | React Navigation v6 (Native Stack) |
| Auth state | React Context (`AuthContext`) — in-memory, no persistence |
| Storage | AsyncStorage (→ localStorage on web) — remembered credentials |
| Charts | Custom SVG with `react-native-svg` |
| Notifications | react-native-toast-message |
| Bundler (web) | Expo Metro |
| Deployment | Vercel (static export from `dist/`) |
| Backend API | `https://simplefinance-website.onrender.com` |

## Key Dependencies

```
expo: ~54.0.0
react: 19.1.0
react-native: 0.81.5
react-native-web: ^0.21.0
react-dom: 19.1.0
@expo/metro-runtime: ~6.1.2
@react-navigation/native: 6.1.18
@react-navigation/native-stack: 6.9.26
@react-native-async-storage/async-storage: 2.2.0
react-native-svg: 15.12.1
react-native-safe-area-context: ~5.6.0
react-native-screens: ~4.16.0
react-native-toast-message: ^2.2.0
```

## File Structure

```
simplefinance_app/
├── App.js                          # Entry — service worker registration, install gate, Stack Navigator
├── app.json                        # Expo config — includes "web" section with PWA metadata
├── babel.config.js
├── package.json                    # scripts: web (dev), build:web (production export)
├── eas.json                        # EAS config (retained but not used for active distribution)
│
├── assets/
│   ├── icon.png                    # 1024×1024 RGB — blue circle on white (used as PWA icon)
│   ├── adaptive-icon.png           # RGBA — for Android adaptive icon
│   └── splash.png                  # Splash screen
│
├── public/                         # Copied verbatim into dist/ at build time
│   ├── manifest.json               # PWA manifest (name, icons, display: standalone, theme colour)
│   └── sw.js                       # Service worker — cache-first for assets, network-first for HTML
│
├── scripts/
│   └── postbuild-web.js            # Post-build: injects PWA + iOS meta tags into index.html,
│                                   # copies icon.png + public/ into dist/
│
├── web/
│   └── index.html                  # Reference HTML template (not used by Metro bundler directly)
│
└── src/
    ├── config.js                   # API base URL
    ├── theme.js                    # Color palette + font tokens
    ├── context/
    │   └── AuthContext.js          # login / logout / updateUser / remember-me helpers
    └── screens/
        ├── InstallScreen.js        # PWA install gate — Android prompt or iOS step guide
        ├── LoginScreen.js          # Email + password login; server warmup ping; Remember Me
        ├── ForgotPasswordScreen.js # Password reset request
        ├── ResetPasswordScreen.js  # Password reset with token
        ├── DashboardScreen.js      # Client portal — chart, transactions, interest, referral earnings
        ├── AdminScreen.js          # Admin panel — user management, transactions, modals
        └── ProfileScreen.js        # User profile — change name or email
```

## Navigation Flow

```
App.js
├── showInstall === true (browser, not yet installed)
│   └── InstallScreen  (fullscreen, before NavigationContainer)
│
└── NavigationContainer → Stack.Navigator
    ├── user === null (not logged in)
    │   ├── Login
    │   ├── ForgotPassword
    │   └── ResetPassword
    │
    ├── user.email === ADMIN_EMAIL
    │   ├── Admin
    │   └── UserDashboard  (admin viewing a user's dashboard via viewUserId param)
    │
    └── regular user
        ├── Dashboard
        └── Profile
```

## Authentication Design

- **No persistent sessions.** Token lives in React Context (in-memory). Closing the app/tab logs out.
- **Remember Me** stores email + password in AsyncStorage (localStorage on web) so the form pre-fills on next open. User must still tap Login.
- **No invite code.** Login is email + password only.
- **Admin access:** `simplefinance.com@gmail.com`.
- **Profile updates:** `PUT /api/auth/me` — changes name and/or email in the database and updates the in-memory auth context immediately.

## PWA Setup

### Install flow (`InstallScreen.js` + `App.js`)
- `App.js` checks `window.matchMedia('(display-mode: standalone)')` and `window.navigator.standalone` on web to detect if already installed
- If not installed and `sf_install_dismissed` is not set in localStorage, `InstallScreen` is shown
- Android / Chrome: captures `beforeinstallprompt` event; "立即安裝" triggers the native browser prompt
- iOS / Safari: shows three-step Add to Home Screen instructions
- "先在瀏覽器使用" sets `sf_install_dismissed = true` in localStorage permanently
- Successful install (Android): dismissal not stored — deleting and revisiting shows the prompt again

### Service Worker (`public/sw.js`)
- **Install:** pre-caches `/manifest.json`, `/icon.png`, `/favicon.ico`
- **HTML:** network-first (always fetches latest app shell)
- **All other same-origin assets (JS bundles, images):** cache-first, then network; response is cached for future use
- **Cross-origin requests (API calls):** never intercepted

### Build pipeline (`scripts/postbuild-web.js`)
Runs after `expo export --platform web`:
1. Injects into `dist/index.html`:
   - `<link rel="manifest">`
   - Apple PWA meta tags (`apple-mobile-web-app-capable`, status bar style, title, touch icon)
   - iOS auto-zoom fix: `@supports (-webkit-touch-callout:none){ input,textarea,select{ font-size:16px!important } }`
2. Copies `assets/icon.png` → `dist/icon.png`
3. Copies all files from `public/` → `dist/`

## Screens — Detail

### InstallScreen (`InstallScreen.js`)
- Shown before login when app is opened in browser and not yet installed
- Displays app icon, name, tagline
- Android / Chrome: "📲 立即安裝" button → triggers `beforeinstallprompt.prompt()`
- iOS / Safari: numbered step guide with highlighted action labels
- iOS / Chrome (`CriOS` in UA): "請使用 Safari 開啟" message — Chrome on iOS cannot install PWAs
- Desktop: message to open on a phone
- "先在瀏覽器使用 →" skips permanently (sets localStorage flag)

### LoginScreen (`LoginScreen.js`)
- Dark navy header with logo, brand name, tagline
- White rounded form card
- **Server warmup ping** — fires `GET /api/auth/me` on mount to wake the Render backend
- Email + password fields, Remember Me checkbox, Forgot Password link
- 60-second AbortController timeout; shows `伺服器啟動中，請稍候約 30 秒後再試。` on abort
- No invite code, no signup link

### DashboardScreen (`DashboardScreen.js`)
- Dark header: welcome message, balance, cumulative earnings, currency badge
- **⚙ 個人資料** button (top-right) — navigates to ProfileScreen (hidden in admin view)
- **← 返回管理後台** button (admin viewing a user via `viewUserId` param)
- **Projection chart** (custom SVG via `react-native-svg`):
  - Historical segment builds balance day-by-day from transactions + interest records
  - Future projection from `projectionBase` (last historical balance) using per-user `interestRate` (compound)
  - Year selector: 1, 3, 5, 10, 20 years
  - Interactive crosshair — touch/mouse: vertical + horizontal dashed lines, dot, tooltip (date + balance)
  - Scroll disabled while interacting with chart (native); mouse events on web
  - Y-axis nice-number scaling; X-axis ~5 date labels
- Transaction records (入金/出金), interest records (每日利息), referral bonus records — all paginated 7/page with 首頁/末頁 controls
- Logout button (hidden in admin view)

### AdminScreen (`AdminScreen.js`)
- User list: search by name/email, sorted by assets descending
- **重算利息** button — `POST /api/admin/recalculate-all-interest`, refreshes user list on success
- Per-user: edit assets, currency selector (USD/AUD/TWD/JPY), interest rate modal, referral modal, view dashboard, 出/入金 expand, delete user
- **Expanded section (出/入金):**
  - Add form supports 入金 / 出金 / 定期入金 / 定期出金; recurring types show day-of-month input (1–28) instead of date
  - Active recurring rules list with delete buttons
  - Summary totals: 總資金 / 總利息 / 總推薦獎勵
  - Filter tabs (入金/出金/利息/推薦獎勵), paginated 10/page with 首頁/末頁
  - Delete buttons for 入金/出金 records
- **Auto-asset sync:** after every transaction add/delete, assets are recalculated and PUT to `/api/admin/users/:id/assets`
- **Confirm modal** replaces native `Alert` (web compatible) for all delete confirmations
- Admin endpoints used:
  - `GET /api/admin/users`
  - `PUT /api/admin/users/:id/assets`, `/currency`, `/interest-rate`, `/referral-bonus-rate`
  - `GET /api/admin/users/:id/transactions`, `/interest`, `/referral-bonus`, `/referrals`, `/dashboard`
  - `POST /api/admin/users/:id/transactions`
  - `DELETE /api/admin/transactions/:txId`
  - `GET /api/admin/users/:id/recurring`
  - `POST /api/admin/users/:id/recurring`
  - `DELETE /api/admin/recurring/:ruleId`
  - `POST /api/admin/recalculate-all-interest`
  - `DELETE /api/admin/users/:id`

### ProfileScreen (`ProfileScreen.js`)
- Accessible via ⚙ 個人資料 from the Dashboard header
- **帳戶資訊 card** (read-only): currency, annual interest rate, referral code with copy-to-clipboard button, cumulative referral earnings (shown only if > 0)
- **修改資料 card** (editable): name and email fields; save button activates only when a field has changed
- `PUT /api/auth/me` — backend validates, checks email uniqueness, updates MongoDB record
- On success: updates in-memory auth context (`updateUser`) and navigates back

## Theme (`theme.js`)

| Token | Value |
|---|---|
| `primary` | `#4a6cf7` |
| `dark` | `#1a1a2e` |
| `darkNavy` | `#0f3460` |
| `darkNavy2` | `#16213e` |
| `text` | `#333` |
| `textSecondary` | `#555` |
| `textMuted` | `#999` |
| `backgroundGray` | `#f5f5f5` |
| `deposit` | `#166534` |
| `withdrawal` | `#991b1b` |
| `interest` | `#4a6cf7` |
| referral bonus | `#f59e0b` |

## Commands

```bash
# Install
npm install --legacy-peer-deps

# Development (opens browser at localhost:8081)
npm run web

# Production build → dist/
npm run build:web

# Deploy (from dist/ folder, or push to GitHub for auto-deploy)
vercel deploy
```

## Deployment

- **Platform:** Vercel (free tier, simplefinance121's account)
- **URL:** https://simplefinance-app.vercel.app
- **Build command:** `npm run build:web`
- **Output directory:** `dist`
- **Install command:** `npm install --legacy-peer-deps`
- **Auto-deploy:** every push to `main` branch triggers a Vercel redeploy
- **Backend CORS:** `simplefinance-app.vercel.app` is whitelisted in `server/index.js` on the website repo

## Backend Notes

- Render free tier sleeps after inactivity; first request takes 30–60s
- LoginScreen fires a silent warmup ping on mount to minimize wait
- All API calls use `Authorization: Bearer <token>` header
- Admin-only routes additionally check `req.user.email === 'simplefinance.com@gmail.com'`
- Interest is calculated as `balance * (annualRate / 100) / 365` (simple daily) by the backend
- New deposits are excluded from interest for 2 days; deposit dates are normalized to Taiwan midnight (UTC+8)
