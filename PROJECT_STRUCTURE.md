# Simple Finance App - Project Structure

## Overview
React Native (Expo) mobile app for Simple Finance, designed for iOS App Store publication.
Ported from the React web version at `~/Desktop/website/`.

**App flow:** Login -> Dashboard (user) / Admin (admin). No public pages in the app — those stay on the website.

## Tech Stack
- **Framework:** React Native with Expo SDK 54
- **Navigation:** React Navigation v6 (Native Stack)
- **State:** React Context (AuthContext)
- **Storage:** AsyncStorage (remembered credentials only, no persistent sessions)
- **Charts:** Custom SVG chart using react-native-svg (AreaChart with gradient fill, crosshair tooltip)
- **Notifications:** react-native-toast-message
- **Backend API:** https://simplefinance-website.onrender.com (same as website)

## Key Dependencies
```
expo: ~54.0.0
react: 19.1.0
react-native: 0.81.4
@react-navigation/native: 6.1.18
@react-navigation/native-stack: 6.9.26
@react-native-async-storage/async-storage: 2.1.2
react-native-svg: 15.11.2
react-native-safe-area-context: 5.4.0
react-native-screens: ~4.10.0
react-native-toast-message: ^2.2.0
babel-preset-expo: ^55.0.12 (devDependency)
```

## File Structure
```
simplefinance_app/
├── App.js                          # Main entry - navigation setup (Stack Navigator)
├── app.json                        # Expo config (bundle ID: com.simplefinance.app)
├── babel.config.js                 # Babel config (babel-preset-expo)
├── eas.json                        # EAS Build & Submit config
├── package.json                    # Dependencies
├── .gitignore
├── assets/
│   ├── icon.png                    # App icon (copied from website logo.png)
│   ├── adaptive-icon.png           # Android adaptive icon
│   └── splash.png                  # Splash screen image
└── src/
    ├── config.js                   # API base URL (https://simplefinance-website.onrender.com)
    ├── theme.js                    # Color palette & design tokens
    ├── context/
    │   └── AuthContext.js          # Auth state management (login/logout/remember me)
    └── screens/
        ├── LoginScreen.js          # Login with remember me, branded dark header + white card
        ├── SignupScreen.js         # Registration with validation
        ├── ForgotPasswordScreen.js # Password reset request
        ├── ResetPasswordScreen.js  # Password reset with token
        ├── DashboardScreen.js      # User portfolio (chart, transactions, interest, logout)
        ├── AdminScreen.js          # Admin panel (user management, transactions, currency)
        ├── HomeScreen.js           # (unused in app, kept for reference)
        ├── AboutScreen.js          # (unused in app, kept for reference)
        ├── FAQScreen.js            # (unused in app, kept for reference)
        ├── ContactScreen.js        # (unused in app, kept for reference)
        ├── ReferralScreen.js       # (unused in app, kept for reference)
        ├── DataScreen.js           # (unused in app, kept for reference)
        ├── TermsScreen.js          # (unused in app, kept for reference)
        └── PrivacyScreen.js        # (unused in app, kept for reference)
```

## Navigation Flow
```
AppNavigator (Stack)
├── user === null (not logged in)
│   ├── Login          (headerShown: false, branded design)
│   ├── Signup         (header: 註冊)
│   ├── ForgotPassword (header: 忘記密碼)
│   └── ResetPassword  (header: 重設密碼)
│
├── user.email === ADMIN_EMAIL (admin logged in)
│   └── Admin          (headerShown: false)
│
└── user (regular user logged in)
    └── Dashboard      (headerShown: false)
```

## Authentication Design
- **No persistent login sessions** — closing the app logs the user out
- **Remember Me** — saves email/password to AsyncStorage so form is pre-filled on next open
- User must always press the Login button to authenticate
- Auth state is in-memory only (React Context), not persisted to storage
- Admin access: `simplefinance.com@gmail.com`

## Key Features

### Login Screen
- Dark navy header with logo, brand name, tagline
- White rounded card with form
- Email/password inputs with icons
- Remember Me checkbox + Forgot Password link on same row
- "Or" divider with "建立新帳戶" (Create Account) button
- Footer with copyright and disclaimer
- Safe area insets for iPhone notch
- 15-second fetch timeout with AbortController

### Dashboard Screen
- Dark header with welcome message, asset value, cumulative earnings
- Custom SVG area chart with:
  - Gradient fill under the line (matches website Recharts style)
  - Smooth bezier curves
  - Nice round Y-axis scale starting from $0
  - Year/month X-axis labels
  - Touch crosshair: hold to see vertical + horizontal dashed lines, dot, tooltip with date and asset value
  - Scroll lock while touching chart
  - Year selector: 1, 2, 3, 4, 5 years
- Transaction records (入金/出金) with pagination (首頁, ‹, page numbers, ›, 末頁)
- Interest records (每日利息) with pagination
- 10 rows per page
- Logout button

### Admin Screen
- User list with search
- Edit user assets inline
- Currency selector (USD/AUD/TWD)
- Expandable transaction management per user (add/delete deposits/withdrawals)
- Paginated transaction history
- Delete confirmation via Alert dialog

## Colors (from theme.js)
- Primary: #4a6cf7
- Dark background: #1a1a2e
- Dark navy: #0f3460, #16213e
- Text: #333, #555, #666
- Background gray: #f5f5f5
- Success/deposit: #166534
- Error/withdrawal: #991b1b
- Interest: #4a6cf7

## Commands
```bash
# Development
cd ~/Desktop/simplefinance_app
npm install --legacy-peer-deps
npx expo start --clear

# Build for iOS App Store
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

## App Store Requirements
1. Apple Developer Account ($99/year) at developer.apple.com
2. Update `eas.json` with Apple ID, App Store Connect App ID, Team ID
3. Update `app.json` with EAS project ID (run `eas init`)
4. Prepare in App Store Connect:
   - App description (Traditional Chinese)
   - Screenshots (iPhone 6.7" and 6.1")
   - Privacy policy URL (website /privacy page)
   - Age rating
   - Category: Finance
5. Submit for Apple review (typically 1-3 days)

## Notes
- Backend is on Render free tier — first request after inactivity takes 30-60s to wake up
- All UI text is in Traditional Chinese (繁體中文)
- Investment disclaimers are included where required
- The unused screen files (Home, About, FAQ, etc.) are kept for potential future use but are not wired into navigation
