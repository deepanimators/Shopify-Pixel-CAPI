import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { IdentityResolver } from "../src/modules/identity/resolver.js";

describe("identity resolver", () => {
  const resolver = new IdentityResolver();

  it("prefers durable identifiers and normalizes email", () => {
    const result = resolver.resolve({
      customerId: "gid://shopify/Customer/1",
      email: " Buyer@Example.com ",
      phone: "+91 9876543210"
    });

    const expectedSeed = "customer:gid://shopify/Customer/1|email:buyer@example.com|phone:+91 9876543210";
    const expectedKey = createHash("sha256").update(expectedSeed).digest("hex");

    expect(result.matchedOn).toEqual(["customerId", "email", "phone"]);
    expect(result.identityKey).toBe(expectedKey);
  });

  it("falls back to anonymous id when no stronger identity exists", () => {
    const result = resolver.resolve({
      anonymousId: "anon_only"
    });

    const expectedKey = createHash("sha256").update("anon:anon_only").digest("hex");
    expect(result.matchedOn).toEqual(["anonymousId"]);
    expect(result.identityKey).toBe(expectedKey);
  });

  it("returns unresolved hash when no identity signals exist", () => {
    const result = resolver.resolve({});

    const expectedKey = createHash("sha256").update("unresolved").digest("hex");
    expect(result.matchedOn).toEqual([]);
    expect(result.identityKey).toBe(expectedKey);
  });
});
