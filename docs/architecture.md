# Enterprise Architecture

## System Goal

AdTrace Enterprise is a Shopify app that creates a consistent tracking and attribution layer across:

- multiple Shopify stores
- multiple regional domains
- multiple Shopify Markets
- multiple currencies and customer journeys

## Primary Application Surfaces

### Embedded admin app

Merchant operators use the admin surface to:

- install and authorize the app
- review billing plans
- connect Meta credentials
- map domains and markets
- inspect diagnostics and webhook health

### Storefront collection layer

Storefront events are collected through:

- Shopify Web Pixel extension
- direct event ingestion endpoints
- future webhook reconciliation for server-confirmed commerce events

### Server-side processing layer

The backend is responsible for:

- resolving the tenant and shop installation
- normalizing events
- enriching with market and domain context
- resolving identity
- deduplicating events
- forwarding clean payloads to Meta

## Core Domain Model

### Tenant

Represents one merchant account in the AdTrace platform.

Important fields:

- `tenantId`
- `displayName`
- `shopDomain`
- `planId`
- `status`
- `supportedDomains[]`
- `supportedMarkets[]`
- `meta`

### Shop installation

Represents the Shopify app installation state.

Important fields:

- `shopDomain`
- `tenantId`
- `accessToken`
- `scopes[]`
- `status`
- `installedAt`

### Normalized event

Represents a clean tracking record after enrichment.

Important fields:

- `tenantId`
- `shopDomain`
- `eventName`
- `source`
- `eventId`
- `dedupeKey`
- `market`
- `identity`
- `commerce`
- `deliveredToMeta`

## Multi-Market Design

Every event includes market context:

- `countryCode`
- `currencyCode`
- `marketId`
- `domain`

This ensures the same platform can support:

- country-specific attribution
- market-specific domain routing
- currency-aware purchase events

## Multi-Domain Design

Multi-domain support is modeled at the tenant layer, not as a per-request afterthought.

Each tenant owns:

- a primary domain
- zero or more regional domains
- market-specific mappings

This makes it possible to associate one customer journey with one merchant even when a shopper crosses between regional storefronts.

## Shopify App Boundaries

### OAuth and install

The app uses a Shopify install flow and callback flow to create or refresh merchant installations.

### Webhooks

The app includes a single webhook endpoint that is responsible for:

- compliance webhooks
- app uninstall lifecycle
- future subscription and scope change handling

### Billing

The current codebase models a billing catalog and tenant plan assignment, with the next step being Shopify Billing API activation.

## Enterprise Production Steps

The repository now has the correct boundaries, but production hardening should still add:

1. PostgreSQL repositories using `docs/postgres-schema.sql`
2. queue-based delivery and retries
3. Admin GraphQL integration for billing and web pixel activation
4. persistent identity graph and reconciliation jobs
5. role-based access, audit logs, and operational alerting
