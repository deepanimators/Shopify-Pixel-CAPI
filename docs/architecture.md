# Architecture

## Product Definition

This system is a Shopify-first tracking and attribution engine that sits between storefront behavior and downstream advertising platforms.

Its job is to:

- capture events from Shopify storefronts
- normalize them
- enrich them with identity and market context
- deduplicate them
- forward them via server-side APIs

## Why This Exists

Modern Shopify brands often run:

- multiple regional domains
- multiple Shopify Markets
- multiple currencies
- fragmented checkout and customer journeys

That breaks attribution because event data becomes inconsistent, duplicated, or missing.

## High-Level Flow

1. A storefront tracker or Shopify pixel captures an event.
2. The event is sent to the ingestion API.
3. The tenant is resolved from the Shopify store context.
4. The system enriches the event with:
   - identity
   - market
   - domain
   - commerce metadata
5. The event is normalized and assigned stable IDs.
6. A dedupe key is computed.
7. If the event is new, it is stored and routed to destinations.
8. The Meta adapter sends the server-side conversion payload.

## Domain Model

### Tenant

Represents one Shopify merchant using the app.

Core fields:

- `tenantId`
- `shopDomain`
- `displayName`
- `markets[]`
- `domains[]`
- destination credentials

### Identity

Represents a unified user profile assembled from multiple identifiers.

Core fields:

- `identityKey`
- `anonymousId`
- `customerId`
- `email`
- `phone`
- `externalId`

### Event

Represents the normalized event used across the pipeline.

Core fields:

- `eventId`
- `eventName`
- `source`
- `occurredAt`
- `tenantId`
- `shopDomain`
- `domain`
- `market`
- `identity`
- `commerce`
- `dedupeKey`

## Multi-Market Design

Multi-market support should be part of the event model itself.

Every event should carry market-aware attributes:

- `countryCode`
- `currencyCode`
- `marketId`
- `domain`

This allows attribution analysis per region and ensures downstream conversions keep the right business context.

## Multi-Domain Design

Multi-domain support should be handled at the identity and tenant layers.

Key rules:

- one tenant can own multiple domains
- one user journey can span multiple domains
- the same user should map to one unified identity where possible
- dedupe keys must not break when domains change mid-journey

## MVP Service Boundaries

### Ingestion Service

Validates and normalizes incoming events.

### Identity Resolver

Builds a stable identity key from available user identifiers.

### Tenant Registry

Determines which tenant/store configuration applies to a given event.

### Deduplication Logic

Prevents browser and server duplicates from being counted twice.

### Destination Adapter

Transforms normalized events into Meta CAPI payloads and sends them.

## Recommended Next Infrastructure

- PostgreSQL for durable storage
- Redis or queueing for retries and async fanout
- Shopify OAuth for installation
- webhook ingestion for order reconciliation
- admin dashboard for per-tenant configuration
