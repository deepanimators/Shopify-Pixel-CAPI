import { Router } from "express";

import type { AppContainer } from "../container.js";

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
      const url = new URL(request.originalUrl, "fb-pixel-capi.pthapp.co.in");
      const result = await container.shopifyAuthService.handleCallback(url.searchParams);

      response.status(200).send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Install Complete</title>
    <style>
      body { font-family: Georgia, serif; background: #f6f2ea; color: #241d17; margin: 0; padding: 32px; }
      .card { max-width: 720px; margin: 40px auto; background: white; padding: 28px; border-radius: 24px; box-shadow: 0 18px 45px rgba(44, 30, 13, 0.12); }
      h1 { margin-top: 0; }
      code { font-family: Menlo, monospace; }
    </style>
  </head>
  <body>
    <div class="card">
      <p>Shopify install flow completed.</p>
      <h1>${result.shop}</h1>
      <p>Status: <strong>${result.status}</strong></p>
      <p>Next: open <code>/app</code> to finish domain mapping, Meta credentials, billing, and diagnostics.</p>
    </div>
  </body>
</html>`);
    } catch (error) {
      response.status(401).json({
        error: error instanceof Error ? error.message : "OAuth callback failed"
      });
    }
  });

  return router;
}
