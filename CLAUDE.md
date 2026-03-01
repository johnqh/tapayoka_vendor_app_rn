# tapayoka_vendor_app_rn

Vendor native app for iOS/Android. Device setup via BLE, device/order management.

**Package**: `tapayoka_vendor_app_rn` (private)

## Tech Stack

- **Language**: TypeScript (JSX)
- **Runtime**: React Native 0.81 + Expo ~54
- **Package Manager**: Bun (do not use npm/yarn/pnpm for installing dependencies)
- **Navigation**: React Navigation 7 (Bottom Tabs)
- **State**: Zustand 5
- **Data Fetching**: TanStack Query 5
- **Auth**: Firebase Auth with AsyncStorage persistence, Google Sign-In
- **i18n**: i18next
- **Test**: Jest
- **Bundler**: Metro (port 8085)

## Commands

```bash
bun install
bun run start             # Metro bundler (port 8085)
bun run android
bun run ios
bun run typecheck
bun run lint
bun test
bun run verify            # typecheck + lint + test
```

## Key Features

- BLE device setup (react-native-ble-plx) with WebSocket fallback for local dev
- Device management
- Order monitoring
- Firebase authentication (platform-specific)

## Project Structure

```
src/
├── polyfills/
│   └── localStorage.ts              # localStorage polyfill for Zustand persist
├── config/
│   ├── constants.ts                  # App name, languages, storage keys, tab names
│   ├── env.ts                        # Environment variable reader
│   └── theme.ts                      # Theme configuration
├── context/
│   ├── index.ts
│   ├── AuthContext.tsx                # Desktop: Firebase JS SDK
│   ├── AuthContext.ios.tsx            # iOS: @react-native-firebase/auth
│   ├── AuthContext.android.tsx        # Android: @react-native-firebase/auth
│   └── ApiContext.tsx                 # API client + QueryClient provider
├── stores/
│   ├── index.ts
│   └── settingsStore.ts              # Settings persisted via Zustand + AsyncStorage
├── hooks/
│   └── useAppColors.ts               # Theme-aware color hook
├── i18n/
│   └── index.ts                      # i18next setup with react-native-localize
├── navigation/
│   └── AppNavigator.tsx              # Bottom tab navigator (Devices, Orders, Settings)
├── screens/
│   ├── SplashScreen.tsx
│   ├── devices/DevicesScreen.tsx
│   ├── orders/OrdersScreen.tsx
│   └── settings/SettingsScreen.tsx
├── services/
│   ├── ble/
│   │   ├── index.ts                  # Transport-switching barrel (BLE or WS)
│   │   ├── BleManager.ts             # BLE scanning & device setup (react-native-ble-plx)
│   │   └── WsBleManager.ts           # WebSocket fallback for local dev
│   └── googleAuth.ts                 # PKCE OAuth flow for desktop
├── native/
│   └── WebAuth.ts                    # Native module bridge for desktop auth
└── di/
    ├── initializeServices.ts         # Desktop: no-op
    ├── initializeServices.ios.ts     # iOS: @sudobility/di_rn + auth_lib
    └── initializeServices.android.ts # Android: @sudobility/di_rn + auth_lib
```

## Path Alias

`@/*` resolves to `src/*` via both `tsconfig.json` and `babel-plugin-module-resolver`.

## Environment Variables

Via `react-native-config` (EXPO_PUBLIC_* prefix):

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_PUBLIC_TRANSPORT` | `ble` (default) or `ws` for local dev |
| `EXPO_PUBLIC_WS_DEVICE_URL` | WebSocket URL when TRANSPORT=ws (default `ws://localhost:8765`) |

## WebSocket Dev Mode

For local development without BLE hardware, set `EXPO_PUBLIC_TRANSPORT=ws` in `.env`. This swaps all BLE functions (`scanForDevices`, `readDeviceInfo`, `setupServerWallet`) to use WebSocket instead of react-native-ble-plx.

Requires tapayoka_pi running in WS mode (`TRANSPORT=ws python -m src.main`).

Import from `@/services/ble` (the barrel) to get automatic transport switching. Importing directly from `@/services/ble/BleManager` always uses BLE.

## Gotchas

- The prestart script merges `.env` files -- environment changes require restarting Metro (port 8085)
- The `localStorage` polyfill must be imported before any Zustand persist store is created
- Firebase Auth uses `AsyncStorage` for persistence
