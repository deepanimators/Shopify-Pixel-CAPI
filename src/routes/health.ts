import { Router } from "express";

export function createHealthRouter() {
  const router = Router();

  router.get("/", (_request, response) => {
    response.json({
      ok: true,
      service: "shopify-tracking-attribution-engine"
    });
  });

  return router;
}
