import express from "express";

import { createContainer, type AppContainer } from "./container.js";
import { attachAuth, requireAppUser } from "./middleware/auth.js";
import { createAppRouter } from "./routes/app.js";
import { createAuthRouter } from "./routes/auth.js";
import { createAdminRouter } from "./routes/admin.js";
import { createEventsRouter } from "./routes/events.js";
import { createHealthRouter } from "./routes/health.js";
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
  app.use("/apps/adtrace", express.text({ type: "*/*", limit: "1mb" }));
  app.use("/apps/adtrace", createEventsRouter(container));
  app.use("/api/admin", requireAppUser, createAdminRouter(container));
  app.use("/app", requireAppUser, createAppRouter(container));
  app.get("/", (_request, response) => {
    response.redirect("/app");
  });

  return app;
}
