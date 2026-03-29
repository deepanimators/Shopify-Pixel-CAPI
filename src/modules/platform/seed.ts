import type { PlatformSeed } from "./types.js";

export function createSeedPlatformData(): PlatformSeed {
  const now = new Date().toISOString();

  return {
    tenants: [
      {
        tenantId: "global-fashion",
        displayName: "Global Fashion Group",
        shopDomain: "global-fashion.myshopify.com",
        planId: "growth",
        status: "active",
        supportedDomains: [
          { host: "example.com", primary: true, marketId: "us" },
          { host: "example.in", primary: false, marketId: "in" },
          { host: "example.co.uk", primary: false, marketId: "uk" }
        ],
        supportedMarkets: [
          {
            id: "us",
            label: "United States",
            countryCode: "US",
            currencyCode: "USD",
            locale: "en-US",
            storefrontDomain: "example.com"
          },
          {
            id: "in",
            label: "India",
            countryCode: "IN",
            currencyCode: "INR",
            locale: "en-IN",
            storefrontDomain: "example.in"
          },
          {
            id: "uk",
            label: "United Kingdom",
            countryCode: "GB",
            currencyCode: "GBP",
            locale: "en-GB",
            storefrontDomain: "example.co.uk"
          }
        ],
        destinations: {
          meta: {
            pixelId: "123456789012345",
            accessToken: "tenant-demo-token",
            enabled: false
          },
          ga4: {
            measurementId: "G-EXAMPLE123",
            apiSecret: "ga4-demo-secret",
            enabled: false
          },
          googleAds: {
            customerId: "1234567890",
            conversionActionId: "987654321",
            transport: "preview",
            enabled: false
          },
          tiktok: {
            pixelCode: "C1234567890",
            enabled: false
          }
        },
        tracking: {
          enabledScenarioIds: [
            "page_view",
            "product_view",
            "product_impression",
            "add_to_cart",
            "remove_from_cart",
            "begin_checkout",
            "add_shipping_info",
            "add_payment_info",
            "purchase",
            "td_ssc_id_success",
            "gtm_history_change"
          ],
          customEventMappings: [
            {
              sourceName: "remove-from-cart",
              scenarioId: "remove_from_cart",
              enabled: true
            },
            {
              sourceName: "td_ssc_id_success",
              scenarioId: "td_ssc_id_success",
              enabled: true
            }
          ]
        },
        createdAt: now,
        updatedAt: now
      },
      {
        tenantId: "luxury-home",
        displayName: "Luxury Home Collective",
        shopDomain: "luxury-home.myshopify.com",
        planId: "enterprise",
        status: "trial",
        supportedDomains: [
          { host: "luxuryhome.com", primary: true, marketId: "us" },
          { host: "eu.luxuryhome.com", primary: false, marketId: "eu" }
        ],
        supportedMarkets: [
          {
            id: "us",
            label: "United States",
            countryCode: "US",
            currencyCode: "USD",
            locale: "en-US",
            storefrontDomain: "luxuryhome.com"
          },
          {
            id: "eu",
            label: "Europe",
            countryCode: "DE",
            currencyCode: "EUR",
            locale: "en-DE",
            storefrontDomain: "eu.luxuryhome.com"
          }
        ],
        destinations: {
          meta: {
            pixelId: "223456789012345",
            accessToken: "luxury-demo-token",
            enabled: false
          }
        },
        tracking: {
          enabledScenarioIds: [
            "page_view",
            "product_view",
            "add_to_cart",
            "begin_checkout",
            "purchase"
          ],
          customEventMappings: []
        },
        createdAt: now,
        updatedAt: now
      }
    ],
    installations: [
      {
        shopDomain: "global-fashion.myshopify.com",
        tenantId: "global-fashion",
        accessToken: "offline-access-token-placeholder",
        scopes: [
          "read_orders",
          "read_customers",
          "read_markets",
          "write_pixels",
          "read_customer_events",
          "write_app_proxy"
        ],
        status: "installed",
        installedAt: now
      }
    ],
    webhooks: []
  };
}
