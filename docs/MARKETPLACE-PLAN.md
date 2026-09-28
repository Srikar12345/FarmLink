# FarmLink: marketplace experience and launch plan

## Product promise
Help a household find a grower it can return to, and help a farmer find predictable paying demand. Start in a small East Godavari service area. Measure farmer net earnings after packaging, transport, spoilage and platform costs, alongside the customer's complete delivered price. Zero commission alone does not establish better earnings.

## Implemented in this change
- Produce-first customer home with a recognisable FarmLink identity, existing produce imagery, persistent search and horizontally scrollable categories.
- Responsive two-, three- and four-column product grid. Search accepts produce, farmer and village, trims whitespace, and hides sold-out listings.
- Latest-harvest and alphabetical sorting; empty results offer reset and a produce-request path. Active orders link to order tracking.
- Farmer names, locations, available stock and price units on cards. The card arrow correctly signals navigation instead of implying an add-to-cart action.
- Image-error fallback and an unconfirmed label for invalid or future harvest dates.
- Removed the simulated live feed, fixed 35% savings calculation and promotion stack from the customer home.
- Replaced unsupported competitor-price comparisons with a clear explanation of produce price and separate fees.
- Farmer dashboard uses crop-request state instead of hard-coded AI recommendations. Removed speculative mandi/platform savings and fixed the monthly year filter. Ledger copy no longer claims verified bank settlement.
- Added the Babel preset explicitly required by the existing Expo configuration.

## What the code currently proves
The app is a pilot, with seeded data, local AsyncStorage and demo OTP. Listing and ordering actions are largely local to a device; listing a crop does not yet reliably expose it to a customer on another device. The API exposes basic user/listing/order routes, but it is not a production transaction service. The existing order POST trusts client data and the PATCH route accepts arbitrary updates. These are launch blockers, not problems a visual refresh solves.

Relevant files: `artifacts/mobile/context/AppContext.tsx`, `artifacts/mobile/utils/api.ts`, `artifacts/mobile/app/auth/otp.tsx`, `artifacts/api-server/src/routes/orders.ts`, and `artifacts/api-server/src/lib/store.ts`.

## Next implementation milestones, in order

### 1. One real farmer-to-customer transaction
- Server-verified OTP, sessions, role and ownership enforcement. A farmer cannot modify another farmer's listings; a customer cannot read another customer's address or order.
- Shared persistent listings, orders and buyer requests; visible sync/retry state. Separate demonstration accounts and records from live records.
- Server-calculated quotes with explicit produce amount, transport, deposit, platform fee and farmer net payout. Fix the existing FarmPass threshold mismatch between marketing and calculation.
- Reserve inventory atomically, enforce available quantity, use idempotent order creation and release stock on cancellation. Pickup must reserve an eligible, unexpired batch at the selected station.
- Verified payment-provider callbacks, reconciliation, refunds and auditable settlement states. Never treat a button press or screenshot as payment success.
- Acceptance gate: two separate devices can list, find, buy and fulfil the same stock; concurrent purchases cannot oversell; retries cannot duplicate charges or orders.

### 2. Trust through fulfilment
- Start with an explicit service area and achievable collection/delivery windows. Show serviceability and all fees before payment.
- Farmer acceptance, packing, rider assignment, pickup, delivery and cancellation states, with timestamps and proof appropriate to each step.
- A visible help/refund path for missing, damaged or wrong produce. Record reason, owner, response deadline and outcome.
- Farmer profiles with sourced verification status, harvest/batch records and purchase-linked reviews. Audit remaining seeded ratings, hygiene scores and safety/quality claims before launch.
- Assisted listing, Telugu/English copy, large touch targets, low-bandwidth images and accessible error states. Let people browse before requiring a phone number; authenticate before purchase.
- Acceptance gate: complete a supervised fulfilment pilot including late delivery, cancellation, out-of-stock, poor connectivity and refund scenarios.

### 3. Predictable demand and repeat purchases
- Reorder a previous basket with current prices and stock; favourites for growers; saved addresses and delivery preferences.
- Turn buyer requests into explicit offers with quantity, date, price and acceptance. A pledge is not a guaranteed purchase.
- Add recurring subscriptions only with pause, skip, substitution consent, cancellation and fulfilment capacity.
- Instrument discovery-to-order conversion, repeat purchase, order fill rate, on-time fulfilment, refunds, spoilage and farmer net proceeds. Establish the pilot baseline before promising improvement.
- Keep the farmer's primary actions simple: list a harvest, respond to demand, fulfil an order, see money due and settled.

### 4. SOP-based kitchen / QSR expansion
Treat this as a later operation with its own readiness gate. Ingredient quality alone cannot guarantee safe, consistent meals.
- Trace each purchased batch through receiving, storage, preparation and the meal served. Add supplier records and recall capability.
- Version recipes, portions, yields, approved substitutions, allergen information and cost per serving.
- Record receiving checks, storage and preparation controls, cleaning, staff training, opening/closing checks and exceptions with accountable sign-off.
- Obtain qualified food-safety and regulatory review for the actual location, menu and operating model; define validated controls and limits before service.
- Release only after a supervised kitchen pilot demonstrates consistent portions, traceability, safe handling, corrective actions and repeatable unit economics.

## Review checklist
- Check customer home at 360px, 390px, tablet and desktop widths; large text and screen-reader navigation.
- Search by grower and village, clear search, switch every category including meat, toggle sort and test an empty category.
- Check odd product counts, no listings, out-of-stock listings, broken images, invalid dates and long farmer/produce names.
- Tap cards, requests, orders, profile, stations and baskets; verify destinations.
- On the farmer dashboard, compare request cards with demand data and check that previous-year orders do not enter this month's total.
- Test native iOS/Android devices before merging; web typechecking alone does not verify native rendering.

This change is a reviewable first marketplace iteration. It does not enable real authentication, payments, inventory synchronisation or QSR operations.
