import { createHmac } from "node:crypto";

import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { env } from "../src/config/env.js";
import { createContainer } from "../src/container.js";

describe("events route", () => {
  it("accepts a valid event payload for a seeded tenant", async () => {
    const app = createApp(createContainer());

    const response = await request(app).post("/api/events").send({
      shopDomain: "global-fashion.myshopify.com",
      eventName: "checkout_completed",
      source: "browser",
      eventId: "evt_1",
      market: {
        countryCode: "IN",
        currencyCode: "INR",
        marketId: "in",
        domain: "example.in"
      },
      user: {
        anonymousId: "anon_1",
        email: "buyer@example.com"
      },
      commerce: {
        orderId: "order_1",
        value: 2499,
        currency: "INR"
      },
      page: {
        url: "https://example.in/products/shirt"
      }
    });

    expect(response.status).toBe(202);
    expect(response.body.duplicate).toBe(false);
    expect(response.body.event.tenantId).toBe("global-fashion");
    expect(response.body.event.canonicalEvent).toBe("purchase");
  });

  it("deduplicates repeated events", async () => {
    const app = createApp(createContainer());
    const payload = {
      shopDomain: "global-fashion.myshopify.com",
      eventName: "product_added_to_cart",
      source: "browser",
      eventId: "evt_2",
      market: {
        countryCode: "US",
        currencyCode: "USD",
        marketId: "us",
        domain: "example.com"
      },
      user: {
        anonymousId: "anon_2"
      },
      commerce: {
        cartId: "cart_2",
        value: 109,
        currency: "USD"
      },
      lineItems: [
        {
          productId: "prod_2",
          variantId: "var_2",
          quantity: 1,
          price: 109,
          currency: "USD"
        }
      ],
      page: {
        url: "https://example.com/checkout/thank_you"
      }
    };

    const first = await request(app).post("/api/events").send(payload);
    const second = await request(app).post("/api/events").send(payload);

    expect(first.status).toBe(202);
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);
  });

  it("accepts storefront app proxy payloads sent as text", async () => {
    const app = createApp(createContainer());

    const response = await request(app)
      .post("/apps/adtrace")
      .set("Content-Type", "text/plain")
      .send(
        JSON.stringify({
          shopDomain: "global-fashion.myshopify.com",
          eventName: "search_submitted",
          source: "browser",
          market: {
            countryCode: "US",
            currencyCode: "USD",
            marketId: "us",
            domain: "example.com"
          },
          user: {
            anonymousId: "anon_search"
          },
          properties: {
            query: "linen shirt"
          },
          page: {
            url: "https://example.com/search?q=linen+shirt"
          }
        })
      );

    expect(response.status).toBe(202);
    expect(response.body.event.canonicalEvent).toBe("search");
  });
});

describe("admin route", () => {
  it("returns overview data for the dashboard", async () => {
    const app = createApp(createContainer());

    const response = await request(app).get("/api/admin/overview");

    expect(response.status).toBe(200);
    expect(response.body.summary.tenants).toBeGreaterThan(0);
    expect(response.body.plans).toHaveLength(3);
    expect(response.body.diagnostics).toHaveProperty("averageQuality");
  });

  it("creates a shopify install link", async () => {
    const app = createApp(createContainer());

    const response = await request(app).get(
      "/api/admin/onboarding/install-link?shop=test-shop.myshopify.com"
    );

    expect(response.status).toBe(200);
    expect(response.body.installUrl).toContain("test-shop.myshopify.com/admin/oauth/authorize");
  });

  it("returns the ecommerce scenario registry", async () => {
    const app = createApp(createContainer());

    const response = await request(app).get("/api/admin/scenarios?category=checkout");

    expect(response.status).toBe(200);
    expect(response.body.summary.total).toBeGreaterThan(100);
    expect(response.body.scenarios.length).toBeGreaterThan(5);
  });

  it("returns diagnostics breakdowns", async () => {
    const container = createContainer();
    const app = createApp(container);

    await request(app).post("/api/events").send({
      shopDomain: "global-fashion.myshopify.com",
      eventName: "product_viewed",
      source: "browser",
      market: {
        countryCode: "US",
        currencyCode: "USD",
        marketId: "us",
        domain: "example.com"
      },
      user: {
        anonymousId: "anon_view"
      },
      lineItems: [
        {
          productId: "prod_123"
        }
      ],
      page: {
        url: "https://example.com/products/linen-shirt"
      }
    });

    const response = await request(app).get("/api/admin/diagnostics/events?tenantId=global-fashion");

    expect(response.status).toBe(200);
    expect(response.body.byCanonicalEvent[0].name).toBe("product_view");
  });
});

describe("webhook route", () => {
  it("rejects invalid HMAC signatures", async () => {
    const app = createApp(createContainer());

    const response = await request(app)
      .post("/webhooks/shopify")
      .set("X-Shopify-Topic", "customers/redact")
      .set("X-Shopify-Shop-Domain", "global-fashion.myshopify.com")
      .set("X-Shopify-Hmac-Sha256", "invalid")
      .send(JSON.stringify({ shop_id: 1 }));

    expect(response.status).toBe(401);
    expect(response.body.verified).toBe(false);
  });

  it("accepts a valid HMAC signature", async () => {
    const app = createApp(createContainer());
    const body = JSON.stringify({ shop_id: 1 });
    const hmac = env.SHOPIFY_API_SECRET
      ? createHmac("sha256", env.SHOPIFY_API_SECRET).update(Buffer.from(body)).digest("base64")
      : "invalid";

    const response = await request(app)
      .post("/webhooks/shopify")
      .set("Content-Type", "application/json")
      .set("X-Shopify-Topic", "customers/redact")
      .set("X-Shopify-Shop-Domain", "global-fashion.myshopify.com")
      .set("X-Shopify-Hmac-Sha256", hmac)
      .send(body);

    if (!env.SHOPIFY_API_SECRET) {
      expect(response.status).toBe(401);
      return;
    }

    expect(response.status).toBe(200);
    expect(response.body.verified).toBe(true);
  });
});
