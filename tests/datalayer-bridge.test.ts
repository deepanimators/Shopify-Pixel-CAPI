import { describe, expect, it } from "vitest";

import { DataLayerBridge, extractAtomsState } from "../src/modules/datalayer/bridge.js";

describe("dataLayer bridge", () => {
  it("normalizes gtag checkout events into canonical payloads", () => {
    const bridge = new DataLayerBridge();

    const result = bridge.normalize(
      [
        "event",
        "add_shipping_info",
        {
          breeze_event_time: "2026-03-29T13:26:48.873Z",
          breeze_event_type: "breeze_add_shipping_info",
          currency: "INR",
          value: 1449,
          items: [
            {
              id: "null_10062396883264_51585951891776",
              name: "AD Print 1 Year",
              brand: "AD",
              category: "Print",
              price: 1449,
              quantity: 1
            }
          ]
        }
      ],
      {
        anonymousId: "anon_1",
        countryCode: "IN",
        pageUrl: "https://subscription.architecturaldigest.in/"
      }
    );

    expect(result?.event.eventName).toBe("checkout_shipping_info_submitted");
    expect(result?.event.commerce?.value).toBe(1449);
    expect(result?.event.lineItems?.[0]?.productId).toBe("null_10062396883264_51585951891776");
  });

  it("hydrates checkout state from history change and reuses it for purchase", () => {
    const bridge = new DataLayerBridge();
    const atomsState = Buffer.from(
      JSON.stringify({
        checkoutId: "FeTGqEN4h7azAizTKzzwY",
        sessionId: "chqQBGXfB4NaBMhPEek1_",
        checkoutInitiationPageHref: "https://subscription.architecturaldigest.in",
        shopUrl: "https://pgm326-m0.myshopify.com"
      })
    ).toString("base64");

    bridge.normalize(
      {
        event: "gtm.historyChange",
        "gtm.newUrl": `https://subscription.architecturaldigest.in/?atomsSt=${encodeURIComponent(atomsState)}`
      },
      {
        pageUrl: "https://subscription.architecturaldigest.in/"
      }
    );

    const purchase = bridge.normalize(
      [
        "event",
        "purchase",
        {
          transaction_id: "1213",
          value: 0,
          currency: "INR",
          google_analysis_params: {
            lineItemValue: 1449
          },
          items: [
            {
              id: "null_10062396883264_51585951891776",
              name: "AD Print 1 Year",
              price: 1449,
              quantity: 1
            }
          ],
          user_data: {
            email: "deepanimators@gmail.com",
            phone_number: "7845345013"
          }
        }
      ],
      {
        pageUrl: "https://subscription.architecturaldigest.in/thank-you"
      }
    );

    expect(purchase?.event.shopDomain).toBe("pgm326-m0.myshopify.com");
    expect(purchase?.event.commerce?.checkoutId).toBe("FeTGqEN4h7azAizTKzzwY");
    expect(purchase?.event.commerce?.value).toBe(1449);
    expect(purchase?.event.user.email).toBe("deepanimators@gmail.com");
    expect(purchase?.event.eventName).toBe("checkout_completed");
  });

  it("captures remove-from-cart object pushes", () => {
    const bridge = new DataLayerBridge();

    const result = bridge.normalize(
      {
        event: "remove-from-cart",
        ecommerce: {
          remove: {
            products: [
              {
                id: "10062396883264",
                name: "AD Print 1 Year",
                price: "1,449.00",
                quantity: 1
              }
            ]
          }
        }
      },
      {
        pageUrl: "https://subscription.architecturaldigest.in/cart",
        countryCode: "IN",
        currencyCode: "INR"
      }
    );

    expect(result?.event.eventName).toBe("product_removed_from_cart");
    expect(result?.event.lineItems?.[0]?.price).toBe(1449);
  });

  it("parses atoms state from history URLs", () => {
    const encoded = Buffer.from(JSON.stringify({ checkoutId: "abc123" })).toString("base64");

    const result = extractAtomsState({
      "gtm.newUrl": `https://subscription.architecturaldigest.in/?atomsSt=${encodeURIComponent(encoded)}`
    });

    expect(result).toEqual({ checkoutId: "abc123" });
  });
});
