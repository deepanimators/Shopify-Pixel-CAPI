# AdTrace Enterprise for Shopify

AdTrace Enterprise is a Shopify-first tracking and attribution platform for merchants that sell across multiple markets, multiple domains, and multiple storefront experiences.

This repository now models the app as a real Shopify product:

- an embedded admin surface for onboarding and diagnostics
- a multi-tenant backend for shops, domains, markets, and identities
- server-side event ingestion and Meta Conversion API delivery
- Shopify OAuth, billing plan catalog, and compliance webhook handling
- a Web Pixel extension scaffold for storefront capture

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
- send clean conversion data to Meta first
- expose diagnostics through an operator-friendly admin dashboard

## Enterprise App Scope

This repository is structured as an enterprise Shopify app, not a one-endpoint prototype.

### Merchant-facing surfaces

- Embedded admin dashboard at `GET /app`
- Admin APIs for tenants, plans, install links, and Meta settings
- OAuth install and callback routes
- Compliance and lifecycle webhook endpoint

### Tracking surfaces

- Event ingestion API at `POST /api/events`
- Web Pixel extension scaffold in `extensions/adtrace-web-pixel`
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
- Meta connection details

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

### 6. Event Quality Diagnostics

Every normalized event is enriched with:

- a canonical event name
- an event category
- a quality score
- quality warnings for missing identity, market, checkout, or purchase fields

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
