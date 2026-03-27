import { Router } from "express";

import type { AppContainer } from "../container.js";

export function createWebhooksRouter(container: AppContainer) {
  const router = Router();

  router.post("/", async (request, response) => {
    const rawBody =
      Buffer.isBuffer(request.body) ? request.body : Buffer.from(JSON.stringify(request.body ?? {}));
    const result = await container.shopifyWebhookService.handle(request.headers, rawBody);

    return response.status(result.statusCode).json({
      ok: result.handled,
      verified: result.verified
    });
  });

  return router;
}
