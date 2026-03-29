import { Router } from "express";

import type { AppContainer } from "../container.js";
import { renderMerchantDashboard } from "../admin/merchant-dashboard.js";

export function createMerchantAppRouter(_container: AppContainer) {
  const router = Router();

  router.get("/", (_request, response) => {
    response.type("html").send(renderMerchantDashboard());
  });

  return router;
}
