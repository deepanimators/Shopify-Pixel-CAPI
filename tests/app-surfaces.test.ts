import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { createContainer } from "../src/container.js";

describe("application surfaces", () => {
  it("routes storefront or shopify context traffic to the embedded merchant app", async () => {
    const app = createApp(createContainer());

    const response = await request(app).get("/?shop=global-fashion.myshopify.com&host=test-host");

    expect(response.status).toBe(302);
    expect(response.header.location).toBe("/app?shop=global-fashion.myshopify.com&host=test-host");
  });

  it("routes operator traffic to the standalone portal", async () => {
    const app = createApp(createContainer());

    const response = await request(app).get("/");

    expect(response.status).toBe(302);
    expect(response.header.location).toBe("/portal");
  });

  it("renders the merchant app shell", async () => {
    const app = createApp(createContainer());

    const response = await request(app).get("/app");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Merchant Workspace");
  });

  it("loads a merchant workspace for an installed shop", async () => {
    const app = createApp(createContainer());

    const response = await request(app).get("/api/app/workspace?shop=global-fashion.myshopify.com");

    expect(response.status).toBe(200);
    expect(response.body.shopDomain).toBe("global-fashion.myshopify.com");
    expect(response.body).toHaveProperty("commerceAnalytics");
    expect(response.body).toHaveProperty("scenarios");
  });
});
