import { Router } from "express";

import type { AppContainer } from "../container.js";
import { env } from "../config/env.js";

export function createAuthRouter(container: AppContainer) {
  const router = Router();

  router.get("/install", (request, response) => {
    const shop = String(request.query.shop ?? "");

    try {
      const result = container.shopifyAuthService.createInstallStart(shop);
      response.redirect(result.installUrl);
    } catch (error) {
      response.status(400).json({
        error: error instanceof Error ? error.message : "Unable to start install"
      });
    }
  });

  router.get("/callback", async (request, response) => {
    try {
      const url = new URL(request.originalUrl, env.SHOPIFY_APP_URL);
      const result = await container.shopifyAuthService.handleCallback(url.searchParams);
      response.redirect(`/app?tenant=${encodeURIComponent(result.tenantId)}&shop=${encodeURIComponent(result.shop)}`);
    } catch (error) {
      response.status(401).json({
        error: error instanceof Error ? error.message : "OAuth callback failed"
      });
    }
  });

  return router;
}
