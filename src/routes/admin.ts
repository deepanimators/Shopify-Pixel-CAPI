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

const destinationScopeSchema = z.object({
  scopeType: z.enum(["domain", "market"]),
  scopeId: z.string().min(1),
  label: z.string().min(1),
  domainHost: z.string().min(1).optional(),
  marketId: z.string().min(1).optional(),
  destinations: destinationConfigsSchema
}).superRefine((value, context) => {
  if (value.scopeType === "domain" && !value.domainHost) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "domainHost is required for domain scope",
      path: ["domainHost"]
    });
  }

  if (value.scopeType === "market" && !value.marketId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "marketId is required for market scope",
      path: ["marketId"]
    });
  }
});

export function createAdminRouter(container: AppContainer) {
  const router = Router();

  router.get("/overview", async (_request, response) => {
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }

    response.json(
      await container.platformService.getOverview(
        auth.canManageAllTenants ? undefined : auth.accessibleTenantIds
      )
    );
  });

  router.get("/tenants", async (_request, response) => {
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }

    response.json(
      await container.platformService.listTenants(
        auth.canManageAllTenants ? undefined : auth.accessibleTenantIds
      )
    );
  });

  router.get("/tenants/:tenantId", async (request, response) => {
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }
    if (!container.userAuthService.canViewTenant(auth, request.params.tenantId)) {
      return response.status(403).json({ error: "You do not have access to this tenant" });
    }

    const detail = await container.platformService.getTenantDetail(request.params.tenantId);

    if (!detail) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    return response.json(detail);
  });

  router.put("/tenants/:tenantId/meta", async (request, response) => {
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }
    if (!container.userAuthService.canEditTenant(auth, request.params.tenantId)) {
      return response.status(403).json({ error: "You do not have permission to edit this tenant" });
    }

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
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }
    if (!container.userAuthService.canEditTenant(auth, request.params.tenantId)) {
      return response.status(403).json({ error: "You do not have permission to edit this tenant" });
    }

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
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }
    if (!container.userAuthService.canEditTenant(auth, request.params.tenantId)) {
      return response.status(403).json({ error: "You do not have permission to edit this tenant" });
    }

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

  router.put("/tenants/:tenantId/destination-scopes", async (request, response) => {
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }
    if (!container.userAuthService.canEditTenant(auth, request.params.tenantId)) {
      return response.status(403).json({ error: "You do not have permission to edit this tenant" });
    }

    const parsed = destinationScopeSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        error: "Invalid destination scope payload",
        issues: parsed.error.flatten()
      });
    }

    const tenant = await container.platformService.upsertDestinationScope(
      request.params.tenantId,
      parsed.data
    );

    if (!tenant) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    return response.json(tenant);
  });

  router.delete("/tenants/:tenantId/destination-scopes", async (request, response) => {
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }
    if (!container.userAuthService.canEditTenant(auth, request.params.tenantId)) {
      return response.status(403).json({ error: "You do not have permission to edit this tenant" });
    }

    const scopeType = String(request.query.scopeType ?? "");
    const scopeId = String(request.query.scopeId ?? "");

    if (!["domain", "market"].includes(scopeType) || !scopeId) {
      return response.status(400).json({
        error: "scopeType (domain|market) and scopeId are required"
      });
    }

    const tenant = await container.platformService.deleteDestinationScope(
      request.params.tenantId,
      scopeType as "domain" | "market",
      scopeId
    );

    if (!tenant) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    return response.json(tenant);
  });

  router.get("/installations", async (_request, response) => {
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }

    response.json(
      await container.platformService.listInstallations(
        auth.canManageAllTenants ? undefined : auth.accessibleTenantIds
      )
    );
  });

  router.get("/diagnostics/events", async (request, response) => {
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }
    const tenantId = request.query.tenantId ? String(request.query.tenantId) : undefined;
    if (tenantId && !container.userAuthService.canViewTenant(auth, tenantId)) {
      return response.status(403).json({ error: "You do not have access to this tenant" });
    }
    response.json(await container.platformService.getEventDiagnostics(tenantId));
  });

  router.get("/analytics/commerce", async (request, response) => {
    const auth = response.locals.auth;
    if (!auth) {
      return response.status(401).json({ error: "Authentication required" });
    }
    const tenantId = request.query.tenantId ? String(request.query.tenantId) : "";
    if (!tenantId) {
      return response.status(400).json({ error: "tenantId is required" });
    }
    if (!container.userAuthService.canViewTenant(auth, tenantId)) {
      return response.status(403).json({ error: "You do not have access to this tenant" });
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
