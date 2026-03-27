# Shopify Tracking & Attribution Engine

A Shopify-first, multi-tenant tracking and attribution platform for stores that operate across multiple markets, currencies, and domains.

This project is being built as a Shopify app/plugin that acts as a data integrity layer between Shopify storefronts and ad platforms. Instead of depending only on fragile browser pixels, it captures storefront events, enriches them with identity and market context, deduplicates them, and forwards clean server-side conversions to platforms like Meta.

## What You Are Building

You are not building "just another Facebook Pixel app."

You are building:

- A multi-tenant Shopify tracking platform
- A multi-market attribution engine
- A multi-domain identity layer
- A server-side conversion delivery pipeline

Recommended positioning:

**Tracking & Attribution Engine for Multi-Market Shopify Stores**

## Core Product Goals

- Capture important storefront events reliably
- Support Shopify Markets from day one
- Track users across multiple storefront domains
- Resolve fragmented identifiers into a unified profile
- Deduplicate browser and server events
- Forward enriched events to Meta Conversion API first
- Provide a clean foundation for additional destinations later

## First-Class Requirements

This application should support both of these as core platform capabilities, not as future add-ons:

### Multi-Market Support

The platform must understand:

- Shopify market
- Country
- Currency
- Locale when available
- Market-specific domains and storefront context

### Multi-Domain Support

The platform must support tracking the same user across:

- Primary domains
- Regional domains
- Checkout/storefront handoffs
- Cross-session journeys

## Product Capabilities

### 1. Storefront Event Capture

Capture events such as:

- `page_view`
- `product_view`
- `add_to_cart`
- `begin_checkout`
- `purchase`

### 2. Identity Resolution

Unify a user across different identifiers:

- Anonymous browser ID
- Shopify customer ID
- Email
- Phone
- External user ID when available

### 3. Market Context Enrichment

Attach:

- Shop domain
- Current domain
- Country
- Currency
- Market ID / market handle

### 4. Deduplication

Ensure browser and server copies of the same event share:

- Stable event IDs
- Stable dedupe keys
- Consistent timestamps and event naming

### 5. Destination Delivery

Initial destination:

- Meta Conversion API

Planned later:

- Google Ads Enhanced Conversions
- TikTok Events API
- Snap / Pinterest / other destinations

## MVP Architecture

This repository starts with a single backend service so the event pipeline is defined clearly before adding more Shopify surfaces.

### Backend API

Responsibilities:

- Accept event ingestion requests
- Validate payloads
- Resolve identity
- Enrich with market/domain context
- Deduplicate events
- Persist normalized events
- Forward eligible events to Meta

### Shopify App Surfaces To Add Next

- Embedded admin app for onboarding and configuration
- Shopify Web Pixel / storefront tracking integration
- Webhook handlers for orders, app uninstall, and shop updates
- App settings for domains, markets, Meta credentials, and event rules

## Repository Layout

```text
.
├── .github/workflows/ci.yml
├── docs/
│   └── architecture.md
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── config/
│   │   └── env.ts
│   ├── lib/
│   │   └── logger.ts
│   ├── modules/
│   │   ├── events/
│   │   │   ├── repository.ts
│   │   │   ├── schema.ts
│   │   │   ├── service.ts
│   │   │   └── types.ts
│   │   ├── identity/
│   │   │   └── resolver.ts
│   │   ├── meta/
│   │   │   └── client.ts
│   │   └── tenants/
│   │       └── registry.ts
│   └── routes/
│       ├── events.ts
│       └── health.ts
├── tests/
│   ├── events.test.ts
│   └── health.test.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Local Development

```bash
npm install
npm run dev
```

Default API:

- `GET /health`
- `POST /api/events`

## Example Event Payload

```json
{
  "tenantId": "demo-store",
  "shopDomain": "store.example.com",
  "eventName": "purchase",
  "source": "browser",
  "occurredAt": "2026-03-27T10:30:00.000Z",
  "market": {
    "countryCode": "IN",
    "currencyCode": "INR",
    "marketId": "india",
    "domain": "example.in"
  },
  "user": {
    "anonymousId": "anon_123",
    "email": "buyer@example.com"
  },
  "commerce": {
    "orderId": "order_1001",
    "value": 2499,
    "currency": "INR"
  },
  "page": {
    "url": "https://example.in/checkout/thank_you"
  }
}
```

## Near-Term Roadmap

### Phase 1

- Backend ingestion API
- Identity resolution
- Deduplication
- Meta delivery adapter
- Health checks and CI

### Phase 2

- PostgreSQL persistence
- Tenant onboarding
- Shopify OAuth
- Webhooks
- Embedded admin UI

### Phase 3

- Shopify Web Pixel / storefront SDK
- Cross-domain identity sync
- Retry queues
- Observability dashboard
- Multi-destination delivery

## Summary

This repository now reflects the correct direction:

You are building a Shopify app/plugin that becomes the centralized tracking and attribution infrastructure for multi-domain, multi-market Shopify stores.
