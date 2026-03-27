import { Router } from "express";
import { z } from "zod";

import type { AppContainer } from "../container.js";

const metaSchema = z.object({
  pixelId: z.string().min(1),
  accessToken: z.string().min(1),
  enabled: z.boolean(),
  testEventCode: z.string().optional()
});

export function createAdminRouter(container: AppContainer) {
  const router = Router();

  router.get("/overview", async (_request, response) => {
    response.json(await container.platformService.getOverview());
  });

  router.get("/tenants", async (_request, response) => {
    response.json(await container.platformService.listTenants());
  });

  router.get("/tenants/:tenantId", async (request, response) => {
    const detail = await container.platformService.getTenantDetail(request.params.tenantId);

    if (!detail) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    return response.json(detail);
  });

  router.put("/tenants/:tenantId/meta", async (request, response) => {
    const parsed = metaSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        error: "Invalid Meta configuration payload",
        issues: parsed.error.flatten()
      });
    }

    const tenant = await container.platformService.upsertMetaConnection(
      request.params.tenantId,
      parsed.data
    );

    if (!tenant) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    return response.json(tenant);
  });

  router.get("/installations", async (_request, response) => {
    response.json(await container.platformService.listInstallations());
  });

  router.get("/diagnostics/events", async (request, response) => {
    const tenantId = request.query.tenantId ? String(request.query.tenantId) : undefined;
    response.json(await container.platformService.getEventDiagnostics(tenantId));
  });

  router.get("/plans", (_request, response) => {
    response.json(container.billingService.listPlans());
  });

  router.get("/onboarding/install-link", (request, response) => {
    const shop = String(request.query.shop ?? "");

    try {
      response.json(container.platformService.createInstallLink(shop));
    } catch (error) {
      response.status(400).json({
        error: error instanceof Error ? error.message : "Unable to generate install link"
      });
    }
  });

  return router;
}
