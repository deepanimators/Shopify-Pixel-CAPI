import { Router } from "express";
import { z } from "zod";

import type { AppContainer } from "../container.js";
import { EVENT_SCENARIOS, getScenarioById, scenarioSummary } from "../modules/events/scenarios.js";

const metaSchema = z.object({
  pixelId: z.string(),
  accessToken: z.string(),
  enabled: z.boolean(),
  testEventCode: z.string().optional()
});

const customMappingSchema = z.object({
  sourceName: z.string().min(1),
  scenarioId: z.string().min(1),
  enabled: z.boolean()
}).superRefine((mapping, context) => {
  if (!getScenarioById(mapping.scenarioId)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Unknown scenarioId ${mapping.scenarioId}`,
      path: ["scenarioId"]
    });
  }
});

const trackingSchema = z.object({
  enabledScenarioIds: z.array(z.string().min(1)),
  customEventMappings: z.array(customMappingSchema)
});

const destinationConfigsSchema = z.object({
  meta: metaSchema.optional(),
  ga4: z
    .object({
      measurementId: z.string(),
      apiSecret: z.string(),
      enabled: z.boolean(),
      debugMode: z.boolean().optional()
    })
    .optional(),
  googleAds: z
    .object({
      customerId: z.string(),
      conversionActionId: z.string(),
      enabled: z.boolean(),
      transport: z.enum(["preview", "api"]).optional(),
      loginCustomerId: z.string().optional(),
      developerToken: z.string().optional(),
      refreshToken: z.string().optional(),
      clientId: z.string().optional(),
      clientSecret: z.string().optional()
    })
    .optional(),
  tiktok: z
    .object({
      pixelCode: z.string(),
      enabled: z.boolean(),
      accessToken: z.string().optional(),
      testEventCode: z.string().optional(),
      endpoint: z.string().url().optional()
    })
    .optional()
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

  router.put("/tenants/:tenantId/tracking", async (request, response) => {
    const parsed = trackingSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        error: "Invalid tracking configuration payload",
        issues: parsed.error.flatten()
      });
    }

    const tenant = await container.platformService.updateTrackingConfig(
      request.params.tenantId,
      parsed.data
    );

    if (!tenant) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    return response.json(tenant);
  });

  router.put("/tenants/:tenantId/destinations", async (request, response) => {
    const parsed = destinationConfigsSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        error: "Invalid destination configuration payload",
        issues: parsed.error.flatten()
      });
    }

    const tenant = await container.platformService.updateDestinationConfigs(
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

  router.get("/analytics/commerce", async (request, response) => {
    const tenantId = request.query.tenantId ? String(request.query.tenantId) : "";
    if (!tenantId) {
      return response.status(400).json({ error: "tenantId is required" });
    }

    const tenant = await container.platformService.getTenantDetail(tenantId);
    if (!tenant) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    response.json(await container.platformService.getCommerceDashboard(tenantId));
  });

  router.get("/plans", (_request, response) => {
    response.json(container.billingService.listPlans());
  });

  router.get("/scenarios", (request, response) => {
    const category = request.query.category ? String(request.query.category) : null;
    const source = request.query.source ? String(request.query.source) : null;
    const registry = container.platformService.getScenarioRegistry();
    const scenarios = registry.scenarios.filter((scenario) => {
      if (category && scenario.category !== category) {
        return false;
      }
      if (source && scenario.source !== source) {
        return false;
      }
      return true;
    });

    response.json({
      summary: registry.summary,
      scenarios
    });
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
