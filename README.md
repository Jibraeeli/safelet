# SafeLet

Compliance tracker for small UK landlords. You answer a few questions about your property, and SafeLet scores you against the 10 things you need to be able to prove under the Renters Rights Act 2026. Each item tells you what it is, the fine for getting it wrong and how to fix it. Upload a photo or PDF as proof and it gets marked as done.

## Tech stack

- React Native 0.81 + Expo SDK 54 (TypeScript)
- Expo Router for file-based navigation
- Expo camera, image picker and document picker for proof uploads
- AsyncStorage for local onboarding answers and proof records
- react-native-svg for the compliance gauge
- Supabase client (configured via environment variables)

## Running it

Requires Node.js 20+ and the Expo Go app (or an iOS/Android simulator).

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL and anon key
npx expo start
```

Press `a` for Android, `i` for iOS or `w` for web, or scan the QR code with Expo Go.

The app runs without Supabase configured; it falls back to placeholder values and keeps data on the device.

## Project layout

```
app/          Screens (Expo Router): onboarding, dashboard, fix/[id], upload/[id]
components/   Shared UI (ShieldLogo)
constants/    Colours and the compliance item definitions
lib/          Compliance scoring, onboarding storage, proof storage, Supabase client
assets/       Icons and splash images
```

## Disclaimer

SafeLet gives general guidance, not legal advice. Check current GOV.UK guidance before relying on it.
