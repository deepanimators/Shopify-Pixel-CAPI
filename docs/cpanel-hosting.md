# cPanel Hosting Guide

## What is happening right now

Your current command:

```bash
npm start
```

starts the Node server inside your SSH session only.

That proves the app can run, but it doesn't finish cPanel hosting setup by itself.

You still need:

- a real public app URL
- persistent environment variables
- a cPanel Node.js application registration
- a database connection for installs and tenant data

## Required cPanel feature

This app should be hosted with cPanel's Node.js application support or Application Manager.

Use:

- **Application root**: `public_html/fb-pixel-capi`
- **Startup file**: `app.js`
- **Node version**: `22.x`

The root `app.js` file exists only to boot the built server through cPanel/Passenger.

## Important app URL rule

Your Shopify app has **one hosted backend URL** for all merchants.

Example:

- `https://fb-pixel-capi.pthapp.co.in`

All Shopify stores install the same app.
What changes per merchant is:

- shop installation
- stored access token
- tracked domains
- tracked markets
- destination config

## Environment variables

Create a `.env` file in `public_html/fb-pixel-capi` or set the same values in cPanel's Node app environment editor:

```env
NODE_ENV=production
PORT=3000
STORAGE_DRIVER=postgres
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE
DATABASE_SSL=false
SHOPIFY_API_KEY=your_shopify_client_id
SHOPIFY_API_SECRET=your_shopify_client_secret
SHOPIFY_APP_URL=https://fb-pixel-capi.pthapp.co.in
SHOPIFY_SCOPES=read_orders,read_customers,read_markets,write_pixels,read_customer_events
META_GRAPH_API_VERSION=v22.0
```

If you don't set `SHOPIFY_APP_URL`, the server falls back to localhost and Shopify Admin will break.

## Database

Do not use memory storage in production.

Apply the schema first:

```bash
psql "$DATABASE_URL" -f docs/postgres-schema.sql
```

This stores:

- installed Shopify stores
- tenant workspaces
- domains
- markets
- destination scopes
- tracking config
- events and webhook receipts

## Build and start

Inside `public_html/fb-pixel-capi`:

```bash
npm install
npm run build
```

Then start or restart the app through cPanel Application Manager.

If you restart manually with Passenger-style hosting, touching the restart file is often required:

```bash
mkdir -p tmp
touch tmp/restart.txt
```

## Shopify config

Your Shopify app config must point to the hosted cPanel URL:

- `application_url = "https://fb-pixel-capi.pthapp.co.in"`
- `redirect_urls = ["https://fb-pixel-capi.pthapp.co.in/auth/callback"]`
- app proxy should point to `/apps/adtrace`

After updating the TOML, deploy it again:

```bash
shopify app deploy --config fb-pixel-capi
```

## Recommended cPanel flow

1. Create or confirm the subdomain `fb-pixel-capi.pthapp.co.in` in cPanel.
2. Point that subdomain's document/application root to `public_html/fb-pixel-capi`.
3. Register the Node app in cPanel Application Manager with startup file `app.js`.
4. Add the production environment variables.
5. Run `npm install` and `npm run build`.
6. Restart the Node app from cPanel.
7. Run `shopify app deploy --config fb-pixel-capi` from your local machine.
8. Reinstall the Shopify app so the install is stored in your database.

## If cPanel doesn't have Node/Application Manager

Then this hosting plan is the wrong fit for a public Shopify app.

In that case, move the backend to a real Node host such as:

- Render
- Railway
- Fly.io
- a VPS with systemd + Nginx

## What this fixes

Once configured correctly:

- your hosted app URL is stable
- installs are saved to your DB
- merchants stop disappearing after restarts
- the admin UI loads real tenants instead of showing `0 installed shops`
