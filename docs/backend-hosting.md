# Hosted Backend Guide

## Core idea

This project is one hosted multi-tenant backend for many Shopify stores.

- You host one backend at one public HTTPS domain.
- Every merchant installs the same Shopify app.
- Merchant-specific settings live in your database, not in `.env`.

For this project, the intended backend host is:

- `https://fb-pixel-capi.pthapp.co.in`

## App-owner config vs merchant config

### App-owner config

These values belong to you and stay fixed per deployed app:

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `application_url`
- OAuth callback URL
- app proxy base

### Merchant config

These values belong to each installed store and should be stored per tenant:

- `shopDomain`
- offline access token
- selected markets
- selected storefront domains
- destination settings
- scenario settings
- custom event mappings

## Local development

1. Copy `.env.example` to `.env`
2. Fill in your Shopify API key and secret
3. Run:

```bash
npm install
npm run dev
```

The runtime normalizes `SHOPIFY_APP_URL` if you omit the scheme:

- `fb-pixel-capi.pthapp.co.in` becomes `https://fb-pixel-capi.pthapp.co.in`
- `localhost:3000` becomes `http://localhost:3000`

## Production deployment

This repo includes two deployment entrypoints:

- `Dockerfile`
- `render.yaml`

Minimum production environment variables:

```env
NODE_ENV=production
PORT=3000
STORAGE_DRIVER=postgres
DATABASE_URL=postgres://...
DATABASE_SSL=true
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SHOPIFY_APP_URL=https://fb-pixel-capi.pthapp.co.in
SHOPIFY_SCOPES=read_orders,read_customers,read_markets,write_pixels,read_customer_events
```

Apply the schema before starting the app:

```bash
psql "$DATABASE_URL" -f docs/postgres-schema.sql
```

## Shopify app config

Your Shopify app should point to the hosted backend:

- `application_url = "https://fb-pixel-capi.pthapp.co.in"`
- `redirect_urls = ["https://fb-pixel-capi.pthapp.co.in/auth/callback"]`
- app proxy target should resolve to `https://fb-pixel-capi.pthapp.co.in/apps/adtrace`

## Recommended next production step

The codebase now supports:

- `STORAGE_DRIVER=memory` for local/demo mode
- `STORAGE_DRIVER=postgres` for persisted server-side storage
