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

  it("persists per-tenant tracking config and custom mappings", async () => {
    const app = createApp(createContainer());

    const response = await request(app).put("/api/admin/tenants/global-fashion/tracking").send({
      enabledScenarioIds: ["page_view", "purchase", "remove_from_cart"],
      customEventMappings: [
        {
          sourceName: "breeze_purchase",
          scenarioId: "purchase",
          enabled: true
        }
      ]
    });

    expect(response.status).toBe(200);
    expect(response.body.tracking.enabledScenarioIds).toEqual([
      "page_view",
      "purchase",
      "remove_from_cart"
    ]);
    expect(response.body.tracking.customEventMappings).toHaveLength(1);
  });

  it("rejects unknown scenario ids in custom mappings", async () => {
    const app = createApp(createContainer());

    const response = await request(app).put("/api/admin/tenants/global-fashion/tracking").send({
      enabledScenarioIds: ["page_view"],
      customEventMappings: [
        {
          sourceName: "weird_event_name",
          scenarioId: "not_real",
          enabled: true
        }
      ]
    });

    expect(response.status).toBe(400);
    expect(JSON.stringify(response.body.issues)).toContain("Unknown scenarioId");
  });

  it("updates destination config without replacing other destinations", async () => {
    const app = createApp(createContainer());

    const response = await request(app)
      .put("/api/admin/tenants/global-fashion/destinations")
      .send({
        ga4: {
          enabled: true,
          measurementId: "G-UPDATED123",
          apiSecret: "updated-secret"
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.destinations.ga4.enabled).toBe(true);
    expect(response.body.destinations.ga4.measurementId).toBe("G-UPDATED123");
    expect(response.body.destinations.meta).toBeDefined();
    expect(response.body.destinations.tiktok).toBeDefined();
  });

  it("allows merchants to disable destinations without placeholder credentials", async () => {
    const app = createApp(createContainer());

    const response = await request(app)
      .put("/api/admin/tenants/global-fashion/destinations")
      .send({
        meta: {
          enabled: false,
          pixelId: "",
          accessToken: ""
        },
        tiktok: {
          enabled: false,
          pixelCode: ""
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.destinations.meta.enabled).toBe(false);
    expect(response.body.destinations.meta.pixelId).toBe("");
    expect(response.body.destinations.tiktok.enabled).toBe(false);
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

  it("uses tenant custom mappings to normalize merchant event names", async () => {
    const container = createContainer();
    const app = createApp(container);

    await request(app).put("/api/admin/tenants/global-fashion/tracking").send({
      enabledScenarioIds: ["page_view", "purchase"],
      customEventMappings: [
        {
          sourceName: "breeze_purchase",
          scenarioId: "purchase",
          enabled: true
        }
      ]
    });

    const response = await request(app).post("/api/events").send({
      shopDomain: "global-fashion.myshopify.com",
      eventName: "custom:merchant_event",
      source: "browser",
      eventId: "evt_custom_purchase",
      market: {
        countryCode: "IN",
        currencyCode: "INR",
        marketId: "in",
        domain: "example.in"
      },
      user: {
        anonymousId: "anon_custom"
      },
      commerce: {
        orderId: "order_custom",
        value: 1449,
        currency: "INR"
      },
      properties: {
        rawEventName: "breeze_purchase"
      },
      page: {
        url: "https://example.in/checkout/complete"
      }
    });

    expect(response.status).toBe(202);
    expect(response.body.event.scenarioId).toBe("purchase");
    expect(response.body.event.canonicalEvent).toBe("purchase");
  });

  it("returns commerce analytics for products, purchases, and tracked orders", async () => {
    const app = createApp(createContainer());

    await request(app).post("/api/events").send({
      shopDomain: "global-fashion.myshopify.com",
      eventName: "product_viewed",
      source: "browser",
      eventId: "analytics_view_1",
      market: {
        countryCode: "IN",
        currencyCode: "INR",
        marketId: "in",
        domain: "example.in"
      },
      user: {
        anonymousId: "anon_analytics"
      },
      lineItems: [
        {
          productId: "prod_dashboard_1",
          title: "AD Print 1 Year",
          price: 1449,
          quantity: 1,
          currency: "INR"
        }
      ],
      page: {
        url: "https://example.in/products/ad-print"
      }
    });

    await request(app).post("/api/events").send({
      shopDomain: "global-fashion.myshopify.com",
      eventName: "product_added_to_cart",
      source: "browser",
      eventId: "analytics_cart_1",
      market: {
        countryCode: "IN",
        currencyCode: "INR",
        marketId: "in",
        domain: "example.in"
      },
      user: {
        anonymousId: "anon_analytics"
      },
      commerce: {
        cartId: "cart_dashboard_1",
        value: 1449,
        currency: "INR"
      },
      lineItems: [
        {
          productId: "prod_dashboard_1",
          title: "AD Print 1 Year",
          price: 1449,
          quantity: 1,
          currency: "INR"
        }
      ],
      page: {
        url: "https://example.in/cart"
      }
    });

    await request(app).post("/api/events").send({
      shopDomain: "global-fashion.myshopify.com",
      eventName: "checkout_completed",
      source: "browser",
      eventId: "analytics_purchase_1",
      market: {
        countryCode: "IN",
        currencyCode: "INR",
        marketId: "in",
        domain: "example.in"
      },
      user: {
        anonymousId: "anon_analytics",
        email: "buyer@example.com"
      },
      commerce: {
        orderId: "order_dashboard_1",
        value: 1449,
        currency: "INR"
      },
      lineItems: [
        {
          productId: "prod_dashboard_1",
          title: "AD Print 1 Year",
          price: 1449,
          quantity: 1,
          currency: "INR"
        }
      ],
      page: {
        url: "https://example.in/checkout/complete"
      }
    });

    const response = await request(app).get("/api/admin/analytics/commerce?tenantId=global-fashion");

    expect(response.status).toBe(200);
    expect(response.body.summary.purchases).toBeGreaterThanOrEqual(1);
    expect(response.body.summary.revenue).toBeGreaterThanOrEqual(1449);
    expect(response.body.topProducts[0].productId).toBe("prod_dashboard_1");
    expect(response.body.recentPurchases[0].orderId).toBe("order_dashboard_1");
    expect(response.body.orderStatuses[0].orderId).toBe("order_dashboard_1");
  });

  it("requires tenantId for commerce analytics", async () => {
    const app = createApp(createContainer());

    const response = await request(app).get("/api/admin/analytics/commerce");

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("tenantId");
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
