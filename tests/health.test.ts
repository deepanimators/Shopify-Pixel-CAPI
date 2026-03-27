import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { createContainer } from "../src/container.js";

describe("health route", () => {
  it("returns service health", async () => {
    const response = await request(createApp(createContainer())).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.service).toBe("shopify-tracking-attribution-engine");
  });
});
