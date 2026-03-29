import express from "express";

import { createContainer, type AppContainer } from "./container.js";
import { attachAuth, requireAppUser } from "./middleware/auth.js";
import { createAuthRouter } from "./routes/auth.js";
import { createAdminRouter } from "./routes/admin.js";
import { createEventsRouter } from "./routes/events.js";
import { createHealthRouter } from "./routes/health.js";
import { createMerchantApiRouter } from "./routes/merchant-api.js";
import { createMerchantAppRouter } from "./routes/merchant-app.js";
import { createPortalRouter } from "./routes/portal.js";
import { createPublicRouter } from "./routes/public.js";
import { createWebhooksRouter } from "./routes/webhooks.js";

export function createApp(container: AppContainer = createContainer()) {
  const app = express();

  app.disable("x-powered-by");

  app.use("/webhooks/shopify", express.raw({ type: "*/*", limit: "2mb" }));
  app.use("/webhooks/shopify", createWebhooksRouter(container));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(attachAuth(container));

  app.use(createPublicRouter(container));
  app.use("/health", createHealthRouter());
  app.use("/auth", createAuthRouter(container));
  app.use("/api/events", createEventsRouter(container));
  app.use("/api/app", createMerchantApiRouter(container));
  app.use("/apps/adtrace", express.text({ type: "*/*", limit: "1mb" }));
  app.use("/apps/adtrace", createEventsRouter(container));
  app.use("/api/admin", requireAppUser, createAdminRouter(container));
  app.use("/portal", requireAppUser, createPortalRouter(container));
  app.use("/app", createMerchantAppRouter(container));
  app.get("/", (request, response) => {
    if (request.query.shop || request.query.host || request.query.embedded) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(request.query)) {
        if (typeof value === "string") {
          params.set(key, value);
        }
      }

      const suffix = params.size ? `?${params.toString()}` : "";
      return response.redirect(`/app${suffix}`);
    }

    response.redirect("/portal");
  });

  return app;
}
