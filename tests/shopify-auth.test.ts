import { describe, expect, it } from "vitest";

import { ShopifyAuthService } from "../src/modules/shopify/auth.js";
import { isValidShopDomain, normalizeShopDomain } from "../src/modules/shopify/hmac.js";
import { InMemoryPlatformRepository } from "../src/modules/platform/repository.js";
import { createEmptyPlatformData, createSeedPlatformData } from "../src/modules/platform/seed.js";

describe("shopify auth helpers", () => {
  it("normalizes and validates shop domains", () => {
    expect(normalizeShopDomain(" Demo-Store.MyShopify.com ")).toBe("demo-store.myshopify.com");
    expect(isValidShopDomain("demo-store.myshopify.com")).toBe(true);
    expect(isValidShopDomain("demo-store.example.com")).toBe(false);
  });

  it("creates a normalized install start url", () => {
    const repository = new InMemoryPlatformRepository(createSeedPlatformData());
    const service = new ShopifyAuthService(repository);

    const result = service.createInstallStart("Demo-Store.MyShopify.com");

    expect(result.shop).toBe("demo-store.myshopify.com");
    expect(result.state).toBeTruthy();
    expect(result.installUrl).toContain("https://demo-store.myshopify.com/admin/oauth/authorize?");
    expect(result.installUrl).toContain("redirect_uri=");
  });

  it("rejects invalid install domains", () => {
    const repository = new InMemoryPlatformRepository(createSeedPlatformData());
    const service = new ShopifyAuthService(repository);

    expect(() => service.createInstallStart("not-a-shop-domain")).toThrow(
      "Shop domain must be a valid *.myshopify.com domain"
    );
  });

  it("creates a tenant workspace when a new install is saved", async () => {
    const repository = new InMemoryPlatformRepository(createEmptyPlatformData());

    await repository.saveInstallation({
      shopDomain: "fresh-store.myshopify.com",
      tenantId: "fresh-store",
      accessToken: "offline-token",
      scopes: ["read_orders", "read_markets"],
      status: "installed",
      installedAt: "2026-03-29T12:00:00.000Z"
    });

    const tenant = await repository.getTenant("fresh-store");

    expect(tenant?.shopDomain).toBe("fresh-store.myshopify.com");
    expect(tenant?.supportedDomains).toEqual([
      {
        host: "fresh-store.myshopify.com",
        primary: true
      }
    ]);
    expect(tenant?.destinationScopes).toEqual([]);
  });
});
