import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";

describe("events route", () => {
  it("accepts a valid event payload", async () => {
    const app = createApp();

    const response = await request(app).post("/api/events").send({
      tenantId: "demo-store",
      shopDomain: "store.example.com",
      eventName: "purchase",
      source: "browser",
      eventId: "evt_1",
      market: {
        countryCode: "IN",
        currencyCode: "INR",
        marketId: "india",
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
    expect(response.body.event.identity.identityKey).toBeTypeOf("string");
  });

  it("deduplicates repeated events", async () => {
    const app = createApp();
    const payload = {
      tenantId: "demo-store",
      shopDomain: "store.example.com",
      eventName: "purchase",
      source: "browser",
      eventId: "evt_2",
      market: {
        countryCode: "US",
        currencyCode: "USD",
        marketId: "united-states",
        domain: "example.com"
      },
      user: {
        anonymousId: "anon_2"
      },
      commerce: {
        orderId: "order_2",
        value: 109,
        currency: "USD"
      },
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
});
