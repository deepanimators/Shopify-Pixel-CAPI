# AdTrace Enterprise for Shopify

AdTrace Enterprise is a Shopify-first tracking and attribution platform for merchants that sell across multiple markets, multiple domains, and multiple storefront experiences.

This repository now models the app as a real Shopify product:

- an embedded admin surface for onboarding and diagnostics
- merchant-facing product, purchase, and order tracking dashboards
- a multi-tenant backend for shops, domains, markets, and identities
- server-side event ingestion and Meta Conversion API delivery
- Shopify OAuth, billing plan catalog, and compliance webhook handling
- a Web Pixel extension scaffold for storefront capture
- a deployable hosted backend runtime for one app serving many stores
- optional Postgres persistence for tenants, installations, tracking config, and events

## Product Positioning

This is not a generic "Facebook Pixel" plugin.

It is a:

- multi-market attribution engine
- multi-domain identity layer
- server-side conversion pipeline
- Shopify control plane for tracking integrity

## What The App Does

For each Shopify merchant, the platform can:

- capture storefront events
- enrich events with domain and market context
- unify shopper identity across sessions and domains
- deduplicate browser and server copies of the same event
- send clean conversion data to Meta, GA4, Google Ads, and TikTok
- expose diagnostics through an operator-friendly admin dashboard
- let merchants monitor tracked products, recent purchases, order status, and destination delivery health without leaving the app

## Enterprise App Scope

This repository is structured as an enterprise Shopify app, not a one-endpoint prototype.

### Merchant-facing surfaces

- Embedded admin dashboard at `GET /app`
- Admin APIs for tenants, plans, install links, and Meta settings
- OAuth install and callback routes
- Compliance and lifecycle webhook endpoint

### Hosted backend surface

- One deployable backend for all installed stores
- Public app URL used by Shopify OAuth, embedded admin, webhooks, and app proxy
- Merchant-specific configuration stored per tenant, not in `.env`

### Tracking surfaces

- Event ingestion API at `POST /api/events`
- Web Pixel extension scaffold in `extensions/adtrace-web-pixel`
- Theme app embed bridge in `extensions/adtrace-theme-bridge`
- Multi-market and multi-domain tenant modeling

### Commercial surfaces

- Billing plan catalog aligned to Starter, Growth, and Enterprise
- Tenant-level plan assignment and recommendation logic

## Repository Layout

```text
.
├── docs/
│   ├── architecture.md
│   └── postgres-schema.sql
├── extensions/
│   └── adtrace-web-pixel/
│       ├── shopify.extension.toml
│       └── src/index.ts
├── src/
│   ├── admin/
│   │   └── dashboard.ts
│   ├── config/
│   │   └── env.ts
│   ├── container.ts
│   ├── lib/
│   │   └── logger.ts
│   ├── modules/
│   │   ├── billing/
│   │   ├── events/
│   │   ├── identity/
│   │   ├── meta/
│   │   ├── platform/
│   │   └── shopify/
│   ├── routes/
│   │   ├── admin.ts
│   │   ├── app.ts
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   ├── health.ts
│   │   └── webhooks.ts
│   ├── app.ts
│   └── index.ts
├── tests/
├── shopify.app.toml
└── package.json
```

## Key Capabilities

### 1. Multi-Tenant Store Management

Each merchant installation is represented as a tenant profile containing:

- shop domain
- plan
- supported markets
- supported storefront domains
- destination adapter settings
- enabled scenario set
- custom event mappings

### 2. Multi-Market Awareness

Every normalized event carries:

- `countryCode`
- `currencyCode`
- `marketId`
- `domain`

This is essential for Shopify Markets and regional storefronts.

### 3. Multi-Domain Identity Tracking

The identity resolver supports:

- anonymous browser IDs
- customer IDs
- email
- phone
- external IDs

This is the base layer for cross-domain attribution.

### 4. Full Shopify Event Coverage

The event pipeline now supports the full Shopify standard ecommerce journey, including:

- `page_viewed`
- `collection_viewed`
- `product_viewed`
- `search_submitted`
- `cart_viewed`
- `product_added_to_cart`
- `product_removed_from_cart`
- `checkout_started`
- `checkout_contact_info_submitted`
- `checkout_address_info_submitted`
- `checkout_shipping_info_submitted`
- `payment_info_submitted`
- `checkout_completed`
- `alert_displayed`
- `ui_extension_errored`
- merchant-defined `custom:*` events

### 5. Shopify App Readiness

The app includes scaffolds for:

- OAuth install flow
- embedded admin experience
- mandatory compliance webhooks
- app uninstall handling
- billing plan catalog
- web pixel extension

### 5a. Hosted Backend Runtime

The repository now includes deployment-oriented backend assets:

- `.env.example`
- `Dockerfile`
- `render.yaml`
- `docs/backend-hosting.md`

This backend is meant to be hosted once and reused by all merchant installs.

### 6. Event Quality Diagnostics

Every normalized event is enriched with:

- a canonical event name
- an event category
- a quality score
- quality warnings for missing identity, market, checkout, or purchase fields

### 7. Juspay / dataLayer Bridge

The repository now includes a top-frame bridge for checkout implementations that emit GTM or `dataLayer` events outside Shopify's standard pixel bus.

It normalizes events such as:

- `begin_checkout`
- `add_shipping_info`
- `add_payment_info`
- `purchase`
- `remove-from-cart`
- `product-impression`
- `gtm.historyChange`
- `td_ssc_id_success`

### 8. Scenario Registry

The app now includes a broad ecommerce scenario registry and alias system so it can normalize a large set of Shopify, GA4-style, GTM, and merchant-defined event names into canonical platform events.

Use:

- `GET /api/admin/scenarios`

### 9. Merchant Mapping Workspace

The embedded dashboard now lets each merchant:

- enable only the scenarios they actually use
- map custom `dataLayer`, GTM, or iframe event names into canonical scenarios
- configure destination adapters for Meta, GA4, Google Ads, and TikTok
- inspect recent normalized delivery outcomes

### 10. Commerce Operations Dashboard

The admin now also includes merchant-facing tracking views for:

- top tracked products by views, carts, purchases, and revenue
- recent purchases with delivery health across connected destinations
- tracked orders with checkout timeline and delivery status
- purchase delivery breakdown by destination

## API Overview

### Health

```bash
GET /health
```

### Event ingestion

```bash
POST /api/events
```

### Admin overview

```bash
GET /api/admin/overview
```

### Tenant detail

```bash
GET /api/admin/tenants/:tenantId
PUT /api/admin/tenants/:tenantId/meta
PUT /api/admin/tenants/:tenantId/tracking
PUT /api/admin/tenants/:tenantId/destinations
```

### Shopify install

```bash
GET /auth/install?shop=merchant-store.myshopify.com
GET /auth/callback
POST /webhooks/shopify
```

## Local Development

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/app`

For hosting and deployment guidance, see:

- `docs/backend-hosting.md`

## Environment Variables

Copy `.env.example` and configure:

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SHOPIFY_SCOPES`
- `DEFAULT_META_PIXEL_ID`
- `DEFAULT_META_ACCESS_TOKEN`

## Production Roadmap

The codebase is now structured for enterprise implementation, but the next production milestones are still important:

1. Replace the in-memory repositories with PostgreSQL-backed repositories using the schema in `docs/postgres-schema.sql`.
2. Wire Shopify Admin GraphQL for billing activation, web pixel creation, and shop settings sync.
3. Add queueing and retries for destination delivery.
4. Add a persistent identity graph for cross-domain shopper resolution.
5. Add audit logs, role-based access, and merchant onboarding workflows.

## Bottom Line

You are building a premium Shopify app for merchants who need clean attribution across markets, currencies, and domains.

This repository is now much closer to that product shape.
