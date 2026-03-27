# Shopify Pixel CAPI

A backend-driven tracking infrastructure that ensures accurate, unified, and reliable conversion data across multi-domain, multi-market Shopify stores.

## Overview

This platform sits between Shopify storefronts and ad platforms, acting as a data integrity layer. Instead of relying on fragile browser pixels, it:

- Captures events from storefronts (`PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`)
- Tracks users across multiple domains and markets
- Resolves identity into a single unified user profile
- Deduplicates browser and server events
- Sends clean, enriched data via Meta Conversions API (CAPI)

## Architecture

```
Shopify Storefront
      │  (browser pixel)
      ▼
POST /api/events
      │
      ├── Auth & tenant lookup
      ├── Deduplication check
      ├── Identity resolution (cross-domain)
      ├── Market/domain context enrichment
      └── Meta CAPI forwarding
```

## Key Features

| Feature | Description |
|---|---|
| **Multi-tenant** | Each Shopify store registers as a tenant with its own pixel/token config |
| **Multi-domain** | A single tenant can span multiple domains (e.g. `.com`, `.co.uk`, `.in`) |
| **Multi-market** | Events are enriched with country, currency, and market context |
| **Identity resolution** | Users are tracked across domains using email, phone, external ID, and fbp cookie |
| **Deduplication** | Events with the same `eventId` within 24h are silently dropped |
| **Meta CAPI** | Enriched events are forwarded to Meta Conversions API with hashed PII |

## Quick Start

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start the server

```bash
npm run dev          # development (ts-node)
npm run build && npm start  # production
```

## API Reference

### Health check

```
GET /health
```

### Register a tenant

```
POST /api/tenants
Content-Type: application/json

{
  "shopDomain": "mystore.myshopify.com",
  "domains": ["mystore.com", "mystore.co.uk"],
  "metaPixelId": "123456789",
  "metaAccessToken": "your-meta-access-token",
  "testEventCode": "TEST12345"   // optional, for Meta test events
}
```

The response includes the `id` to use as the Bearer token for event ingestion.

### Ingest an event

```
POST /api/events
Authorization: Bearer <tenant-id>
Content-Type: application/json

{
  "eventName": "Purchase",
  "eventId": "unique-event-id",
  "eventSourceUrl": "https://mystore.com/checkout/thank-you",
  "userData": {
    "email": "customer@example.com",
    "phone": "+12125551234",
    "externalId": "shopify-customer-123"
  },
  "market": {
    "country": "US",
    "currency": "USD",
    "locale": "en-US"
  },
  "products": [
    { "id": "prod-1", "title": "T-Shirt", "price": 29.99, "quantity": 2 }
  ],
  "orderValue": 59.98,
  "currency": "USD",
  "orderId": "order-456"
}
```

Supported `eventName` values: `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`.

## Browser Pixel

Include `pixel/shopify-pixel.js` as a Shopify Custom Pixel or via Script Tag. It auto-tracks `PageView` and exposes:

```js
ShopifyPixelCAPI.trackViewContent({ id, title, price, currency });
ShopifyPixelCAPI.trackAddToCart({ id, title, price, currency, quantity });
ShopifyPixelCAPI.trackInitiateCheckout({ products, orderValue, currency });
ShopifyPixelCAPI.trackPurchase({ orderId, products, orderValue, currency });
```

## Development

```bash
npm test              # run all tests
npm run test:coverage # with coverage report
npm run lint          # TypeScript type check
npm run build         # compile to dist/
```

## CI

GitHub Actions runs on every push and pull request:
- TypeScript type checking
- Build
- Unit + integration tests (Node 20 & 22)
