import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { createContainer } from "../src/container.js";

describe("public routes", () => {
  it("renders the privacy policy page", async () => {
    const app = createApp(createContainer());

    const response = await request(app).get("/privacy");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Privacy Policy");
    expect(response.text).toContain("How FB Pixel CAPI handles merchant, customer, and event data.");
  });

  it("renders the support portal page", async () => {
    const app = createApp(createContainer());

    const response = await request(app).get("/support");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Support Portal");
    expect(response.text).toContain("Submit a support request");
  });

  it("accepts a support request and redirects with a reference id", async () => {
    const container = createContainer();
    const app = createApp(container);

    const response = await request(app).post("/support").type("form").send({
      name: "Deepak Mohan",
      email: "deepak@example.com",
      shopDomain: "merchant-store.myshopify.com",
      category: "event_mapping",
      subject: "Breeze purchase events need mapping review",
      description:
        "Purchase and add payment info events are mirrored through the parent dataLayer, but we need help validating the canonical scenario mapping."
    });

    expect(response.status).toBe(302);
    expect(response.header.location).toContain("/support?success=1&requestId=sr_");

    const requests = await container.platformService.listSupportRequests(10);
    expect(requests).toHaveLength(1);
    expect(requests[0].shopDomain).toBe("merchant-store.myshopify.com");
    expect(requests[0].category).toBe("event_mapping");
  });
});
