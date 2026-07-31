---
name: FarmLink business model pivot
description: Core positioning and model decisions for FarmLink — Namma Yatri for farm produce.
---

# FarmLink Business Model

## The model
Zero-commission farmer-to-consumer network. Inspired by Namma Yatri (auto-rickshaw app with 0% platform fee). Farmer receives 100% of every sale. No middleman.

**Why:** Cannot compete with Zepto/Blinkit/Swiggy on 10-minute delivery (Amazon/Flipkart cash reserves). Differentiation is zero-commission + vending machine network.

## Vending machines (micro dark stores)
- Solar-powered, temperature-controlled units installed at apartment parking lots and lift lobbies.
- No rent / no lease — value proposition to apartment society is free fresh produce access.
- Farmers restock directly overnight.
- Acts as micro dark store; consumers walk down and scan QR to purchase.
- Machines depreciated on CapEx — no fixed operating cost vs. traditional dark store lease.

## Freshness, hygiene, and inventory intelligence
Machines are operated as hygienic fresh-produce micro dark stores, not passive vending cabinets. Every SKU/batch needs harvest date, packing date, expiry/freshness window, temperature history, and a sanitation/restock check.

Inventory should replenish from predicted local demand every 6–12 hours, with the interval chosen per machine and product velocity — not on a fixed blanket schedule. Forecasts use apartment purchases, B2B commitments, seasonality, weather, nearby machine demand, stock age, and perishability.

**Why:** High inventory turnover keeps produce genuinely fresh, reduces spoilage, and avoids the fixed-rent dark-store model. The system should make proactive decisions: restock fast sellers, reduce or bundle slow/near-expiry stock, route excess to nearby machines/B2B, and guide farmers on crops to plant.

**How to apply:** Prioritize real batch inventory, FEFO (first-expiring-first-out) allocation, temperature and cleaning logs, low-stock/expiry alerts, and stock-routing decisions before advanced marketing features.

## Delivery model
- Home delivery kept as optional extra.
- Human vs. robot delivery chosen by cost-benefit analysis at runtime.
- Riders earn based on daily earning goal (not idle waiting) — similar to Namma Yatri driver model.

## B2B
- Restaurants, canteens, hotels, kiranas, cloud kitchens, catering.
- Wholesale farm-gate pricing (25–40% below MRP).
- Direct WhatsApp enquiry to farmer for bulk negotiation.
- B2B tab in consumer app: `app/(tabs)/b2b.tsx`.

## Tagline
"Farm Fresh. Zero Commission. Farmer First."

## Investor context
- Applied to IIT Delhi Navachar Mantra incubation program.
- Working with Ratan Tata Innovation Hub (RTIH) AP.
- Founder: Doddi Sampath Srikar, MBA Finance & Marketing, Vignan University.

**Why durable:** This is the founding thesis. All product decisions should align with zero-commission, direct-farmer-payment, and vending-machine-as-infrastructure.
