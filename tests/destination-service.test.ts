import { describe, expect, it } from "vitest";

import { DestinationService } from "../src/modules/destinations/service.js";
import type { DestinationAdapter } from "../src/modules/destinations/types.js";
import type { NormalizedEvent } from "../src/modules/events/types.js";
import type { Tenant } from "../src/modules/platform/types.js";

function makeEvent(): NormalizedEvent {
  return {
    tenantId: "global-fashion",
    shopDomain: "global-fashion.myshopify.com",
    eventName: "checkout_completed",
    source: "browser",
    eventId: "evt_destination",
    occurredAt: "2026-03-29T12:00:00.000Z",
    market: {
      countryCode: "IN",
      currencyCode: "INR",
      marketId: "in",
      domain: "example.in"
    },
    user: {
      anonymousId: "anon_destination"
    },
    commerce: {
      orderId: "order_destination",
      value: 1449,
      currency: "INR"
    },
    page: {
      url: "https://example.in/checkout/complete"
    },
    dedupeKey: "dedupe_destination",
    scenarioEnabled: true,
    canonicalEvent: "purchase",
    category: "conversion",
    qualityScore: 100,
    qualityWarnings: [],
    identity: {
      identityKey: "identity_destination",
      matchedOn: ["anonymousId"]
    },
    deliveredToMeta: false,
    deliveries: {}
  };
}

function makeTenant(): Tenant {
  return {
    tenantId: "global-fashion",
    displayName: "Global Fashion Group",
    shopDomain: "global-fashion.myshopify.com",
    planId: "growth",
    status: "active",
    supportedDomains: [],
    supportedMarkets: [],
    destinations: {},
    destinationScopes: [],
    tracking: {
      enabledScenarioIds: [],
      customEventMappings: []
    },
    createdAt: "2026-03-29T12:00:00.000Z",
    updatedAt: "2026-03-29T12:00:00.000Z"
  };
}

describe("destination service", () => {
  it("isolates adapter failures and continues other deliveries", async () => {
    const adapters: DestinationAdapter[] = [
      {
        name: "meta",
        async sendEvent() {
          throw new Error("meta exploded");
        }
      },
      {
        name: "ga4",
        async sendEvent() {
          return {
            status: "delivered",
            detail: "ok"
          };
        }
      },
      {
        name: "googleAds",
        async sendEvent() {
          return {
            status: "preview",
            detail: "preview"
          };
        }
      },
      {
        name: "tiktok",
        async sendEvent() {
          return {
            status: "skipped",
            detail: "disabled"
          };
        }
      }
    ];

    const service = new DestinationService(adapters);
    const deliveries = await service.deliver(makeEvent(), makeTenant());

    expect(deliveries.meta.status).toBe("failed");
    expect(deliveries.meta.detail).toContain("meta exploded");
    expect(deliveries.ga4.status).toBe("delivered");
    expect(deliveries.googleAds.status).toBe("preview");
    expect(deliveries.tiktok.status).toBe("skipped");
  });

  it("resolves market and domain overrides before sending to adapters", async () => {
    const observed = [] as string[];
    const tenant = makeTenant();
    tenant.destinations = {
      meta: {
        enabled: true,
        pixelId: "tenant-default",
        accessToken: "tenant-token"
      }
    };
    tenant.destinationScopes = [
      {
        scopeType: "market",
        scopeId: "in",
        label: "India",
        marketId: "in",
        destinations: {
          meta: {
            enabled: true,
            pixelId: "market-in",
            accessToken: "market-token"
          }
        },
        updatedAt: "2026-03-29T12:00:00.000Z"
      },
      {
        scopeType: "domain",
        scopeId: "example.in",
        label: "example.in",
        domainHost: "example.in",
        destinations: {
          meta: {
            enabled: true,
            pixelId: "domain-example-in",
            accessToken: "domain-token"
          }
        },
        updatedAt: "2026-03-29T12:00:00.000Z"
      }
    ];

    const adapters: DestinationAdapter[] = [
      {
        name: "meta",
        async sendEvent(_event, scopedTenant) {
          observed.push(scopedTenant.destinations.meta?.pixelId ?? "missing");
          return {
            status: "delivered",
            detail: "ok"
          };
        }
      },
      {
        name: "ga4",
        async sendEvent() {
          return { status: "skipped", detail: "not configured" };
        }
      },
      {
        name: "googleAds",
        async sendEvent() {
          return { status: "skipped", detail: "not configured" };
        }
      },
      {
        name: "tiktok",
        async sendEvent() {
          return { status: "skipped", detail: "not configured" };
        }
      }
    ];

    const service = new DestinationService(adapters);
    await service.deliver(makeEvent(), tenant);

    expect(observed).toEqual(["domain-example-in"]);
  });
});
