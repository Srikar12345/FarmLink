---
name: FarmLink app architecture
description: Key technical decisions and conventions in the FarmLink Expo app.
---

# FarmLink App Architecture

## Storage
AsyncStorage-first — no backend DB. All data lives on-device. Seed data always wins on reload.

**Why:** Demo/MVP stage. Avoids server infrastructure cost.

## UPI payments
`Linking.openURL('phonepe://pay?...')` triggers native OS UPI app-picker. No real payment gateway key needed. Deep-link pattern works for all UPI apps (PhonePe, GPay, Paytm).

## Event bus
`utils/events.ts` — lightweight pub/sub for order-status toasts. Avoids React Context overhead for ephemeral notifications. `ToastBanner` subscribes at root level in `app/_layout.tsx`.

## Image handling
`imageUri: number | string` on both `Listing` and `CropRequest`. `require()` returns a `number` in React Native; `string` reserved for future URL-based images. Always cast: `typeof imageUri === 'string' ? { uri: imageUri } : imageUri as number`.

## Roles
`UserRole = 'farmer' | 'consumer' | 'rider' | 'business'`. Business routes to `/(tabs)` same as consumer — B2B tab is the second tab in the consumer tab bar.

## Key screen files
- Consumer browse: `app/(tabs)/index.tsx` (Blinkit-style 2-col grid)
- B2B wholesale: `app/(tabs)/b2b.tsx`
- Vending machines: `app/machines.tsx`
- Farmer dashboard: `app/(farmer)/index.tsx` (zero-commission earnings banner + AI demand insights)
- Onboarding: `app/onboarding.tsx` (4 roles: Home Buyer, Business, Farmer, Delivery Partner)

## shortName field
Added to `Listing` interface for card display. Full `produceName` shown on detail screen.

**Why:** Short names fit 2-column grid cards. Full names preserved for detail and search.
