import { describe, expect, it } from "vitest";

import { ShopifyAuthService } from "../src/modules/shopify/auth.js";
import { isValidShopDomain, normalizeShopDomain } from "../src/modules/shopify/hmac.js";
import { InMemoryPlatformRepository } from "../src/modules/platform/repository.js";
import { createSeedPlatformData } from "../src/modules/platform/seed.js";

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
});
