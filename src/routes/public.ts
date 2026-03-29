import { randomUUID } from "node:crypto";

import { Router } from "express";
import { z } from "zod";

import type { AppContainer } from "../container.js";
import { renderPrivacyPage, renderSupportPage } from "../modules/public/pages.js";
import type { SupportRequest } from "../modules/platform/types.js";

const supportRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  shopDomain: z.string().trim().max(255).optional().or(z.literal("")),
  category: z.enum([
    "installation",
    "markets_and_domains",
    "event_mapping",
    "destination_delivery",
    "billing",
    "privacy",
    "other"
  ]),
  subject: z.string().trim().min(6).max(180),
  description: z.string().trim().min(20).max(5000)
});

export function createPublicRouter(container: AppContainer) {
  const router = Router();

  router.get("/privacy", (_request, response) => {
    response.type("html").send(renderPrivacyPage());
  });

  router.get("/support", (request, response) => {
    response.type("html").send(
      renderSupportPage({
        success: request.query.success === "1",
        requestId: typeof request.query.requestId === "string" ? request.query.requestId : undefined,
        error: typeof request.query.error === "string" ? request.query.error : undefined
      })
    );
  });

  router.post("/support", async (request, response) => {
    const parsed = supportRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).type("html").send(
        renderSupportPage({
          error:
            "Please provide your name, email, a subject, and enough detail for us to investigate the issue."
        })
      );
    }

    const supportRequest: SupportRequest = {
      requestId: `sr_${randomUUID().replaceAll("-", "").slice(0, 16)}`,
      name: parsed.data.name,
      email: parsed.data.email,
      shopDomain: parsed.data.shopDomain || undefined,
      category: parsed.data.category,
      subject: parsed.data.subject,
      description: parsed.data.description,
      status: "open",
      createdAt: new Date().toISOString()
    };

    await container.platformService.createSupportRequest(supportRequest);
    response.redirect(
      `/support?success=1&requestId=${encodeURIComponent(supportRequest.requestId)}`
    );
  });

  return router;
}
