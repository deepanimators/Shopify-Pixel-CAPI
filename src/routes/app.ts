import { Router } from "express";

import type { AppContainer } from "../container.js";
import { renderDashboard } from "../admin/dashboard.js";

export function createAppRouter(_container: AppContainer) {
  const router = Router();

  router.get("/", (_request, response) => {
    response.type("html").send(renderDashboard());
  });

  return router;
}
