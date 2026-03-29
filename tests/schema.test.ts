import { describe, expect, it } from "vitest";

import { incomingEventSchema } from "../src/modules/events/schema.js";

describe("incoming event schema", () => {
  it("accepts a minimal valid browser event", () => {
    const result = incomingEventSchema.safeParse({
      shopDomain: "global-fashion.myshopify.com",
      eventName: "product_viewed",
      source: "browser",
      market: {
        countryCode: "US",
        currencyCode: "USD"
      },
      user: {
        anonymousId: "anon_123"
      },
      page: {
        url: "https://example.com/products/linen-shirt"
      }
    });

    expect(result.success).toBe(true);
  });

  it("rejects malformed identity and page fields", () => {
    const result = incomingEventSchema.safeParse({
      shopDomain: "global-fashion.myshopify.com",
      eventName: "product_viewed",
      source: "browser",
      market: {
        countryCode: "USA",
        currencyCode: "US"
      },
      user: {
        email: "not-an-email"
      },
      page: {
        url: "not-a-url"
      }
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative commerce and invalid line item quantities", () => {
    const result = incomingEventSchema.safeParse({
      shopDomain: "global-fashion.myshopify.com",
      eventName: "checkout_completed",
      source: "server",
      market: {
        countryCode: "IN",
        currencyCode: "INR"
      },
      user: {},
      commerce: {
        value: -1,
        currency: "INR"
      },
      lineItems: [
        {
          productId: "prod_1",
          quantity: 0,
          price: 100
        }
      ],
      page: {
        url: "https://example.in/checkout"
      }
    });

    expect(result.success).toBe(false);
  });
});
