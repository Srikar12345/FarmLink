# FarmLink (Farm-Fresh-Direct)

A mobile-first app connecting farmers, consumers, and delivery riders in East Godavari, Andhra Pradesh. Consumers buy directly from local farmers — no middlemen, same-day delivery with eco-friendly packaging.

## Transfer to a New Replit Account

1. Download this project via **Git** (not the zip button) — `node_modules` is excluded by `.gitignore` so the repo is ~10MB
2. In the new Replit, open the Shell and run: `pnpm install`
3. Start the workflows: API Server and expo
4. Set any required secrets (e.g. `SESSION_SECRET`) in the new account's Secrets tab

> The Replit zip-download button includes `node_modules` (~757MB). Always use git clone/export for a clean transfer.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app (port 18115)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (not yet used; app uses AsyncStorage)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (SDK 54) + Expo Router (file-based routing)
- API: Express 5 (minimal — app primarily uses AsyncStorage)
- DB: PostgreSQL + Drizzle ORM (schema stub, not yet wired up)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/mobile/` — Expo React Native mobile app (main product)
  - `app/` — Expo Router screens (auth flow, tabs, farmer/rider dashboards)
  - `components/` — Reusable UI components
  - `context/AppContext.tsx` — All shared state (users, listings, orders, crop requests)
  - `constants/colors.ts` — Design tokens (theme colors)
  - `hooks/useColors.ts` — Color scheme hook
- `artifacts/api-server/` — Express API server (health check only for now)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validators

## Architecture decisions

- App is fully offline-capable via AsyncStorage — no backend calls needed for core flows
- Three user roles: farmer (list produce), consumer (browse & order), rider (deliver)
- Seed data pre-populates East Godavari listings for demo purposes
- OTP auth is in demo mode — any 4 digits accepted (no SMS gateway configured)
- Eco-packaging system with deposits and return tracking is built into order model

## Product

- **Farmers**: List fresh produce with pricing, eco-packaging options, processing status
- **Consumers**: Browse listings by category, place orders, track deliveries, make crop requests
- **Riders**: Accept pending orders, track deliveries, manage ID verification
- **Crop Requests**: Consumers post demand; farmers pledge to grow
- **Eco Packaging**: Jute bags, glass jars, leaf baskets, cloth bags with deposit/return system

## User preferences

- Demo mode for OTP (any 4 digits accepted)
- East Godavari, Andhra Pradesh as the primary region

## Gotchas

- The `useRef` hooks in `otp.tsx` must be declared as individual named refs, not inside an array literal — violates React hooks rules
- NativeTabs (expo-router/unstable-native-tabs) only works on iOS 26+ with liquid glass; web falls back to ClassicTabLayout automatically
- Expo app runs at port 18115 via the `REPLIT_EXPO_DEV_DOMAIN` proxy, not the shared proxy
- Run `pnpm install` after adding new packages before restarting the mobile workflow
- Mobile dev script hardcodes port 18115 (PORT env var not available at pnpm script runtime)
- Route group paths like `/(farmer)/` cause TS errors with typed routes — use `as any` cast

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for mobile development guidelines
