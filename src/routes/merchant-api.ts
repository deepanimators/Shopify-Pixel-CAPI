import { Router } from "express";
import { z } from "zod";

import type { AppContainer } from "../container.js";
import { getScenarioById } from "../modules/events/scenarios.js";
import { isValidShopDomain, normalizeShopDomain } from "../modules/shopify/hmac.js";

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
  meta: z
    .object({
      pixelId: z.string().optional().default(""),
      accessToken: z.string().optional().default(""),
      enabled: z.boolean(),
      testEventCode: z.string().optional()
    })
    .optional(),
  ga4: z
    .object({
      measurementId: z.string().optional().default(""),
      apiSecret: z.string().optional().default(""),
      enabled: z.boolean(),
      debugMode: z.boolean().optional()
    })
    .optional(),
  googleAds: z
    .object({
      customerId: z.string().optional().default(""),
      conversionActionId: z.string().optional().default(""),
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
      pixelCode: z.string().optional().default(""),
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

export function createMerchantApiRouter(container: AppContainer) {
  const router = Router();

  router.get("/workspace", async (request, response) => {
    const tenant = await resolveTenantByRequestShop(container, String(request.query.shop ?? ""));
    if (!tenant) {
      return response.status(404).json({
        error: "Installed Shopify store not found for this workspace"
      });
    }

    response.json({
      ...tenant,
      scenarios: container.platformService.getScenarioRegistry().scenarios,
      commerceAnalytics: await container.platformService.getCommerceDashboard(tenant.tenantId)
    });
  });

  router.put("/tracking", async (request, response) => {
    const tenant = await resolveTenantByRequestShop(container, String(request.query.shop ?? ""));
    if (!tenant) {
      return response.status(404).json({ error: "Installed Shopify store not found" });
    }

    const parsed = trackingSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        error: "Invalid tracking configuration payload",
        issues: parsed.error.flatten()
      });
    }

    const updated = await container.platformService.updateTrackingConfig(tenant.tenantId, parsed.data);
    if (!updated) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    response.json({
      ...updated,
      scenarios: container.platformService.getScenarioRegistry().scenarios,
      commerceAnalytics: await container.platformService.getCommerceDashboard(updated.tenantId)
    });
  });

  router.put("/destinations", async (request, response) => {
    const tenant = await resolveTenantByRequestShop(container, String(request.query.shop ?? ""));
    if (!tenant) {
      return response.status(404).json({ error: "Installed Shopify store not found" });
    }

    const parsed = destinationConfigsSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        error: "Invalid destination configuration payload",
        issues: parsed.error.flatten()
      });
    }

    const updated = await container.platformService.updateDestinationConfigs(tenant.tenantId, parsed.data);
    if (!updated) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    response.json({
      ...updated,
      scenarios: container.platformService.getScenarioRegistry().scenarios,
      commerceAnalytics: await container.platformService.getCommerceDashboard(updated.tenantId)
    });
  });

  router.put("/destination-scopes", async (request, response) => {
    const tenant = await resolveTenantByRequestShop(container, String(request.query.shop ?? ""));
    if (!tenant) {
      return response.status(404).json({ error: "Installed Shopify store not found" });
    }

    const parsed = destinationScopeSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        error: "Invalid destination scope payload",
        issues: parsed.error.flatten()
      });
    }

    const updated = await container.platformService.upsertDestinationScope(tenant.tenantId, parsed.data);
    if (!updated) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    response.json({
      ...updated,
      scenarios: container.platformService.getScenarioRegistry().scenarios,
      commerceAnalytics: await container.platformService.getCommerceDashboard(updated.tenantId)
    });
  });

  router.delete("/destination-scopes", async (request, response) => {
    const tenant = await resolveTenantByRequestShop(container, String(request.query.shop ?? ""));
    if (!tenant) {
      return response.status(404).json({ error: "Installed Shopify store not found" });
    }

    const scopeType = String(request.query.scopeType ?? "");
    const scopeId = String(request.query.scopeId ?? "");

    if (!["domain", "market"].includes(scopeType) || !scopeId) {
      return response.status(400).json({
        error: "scopeType (domain|market) and scopeId are required"
      });
    }

    const updated = await container.platformService.deleteDestinationScope(
      tenant.tenantId,
      scopeType as "domain" | "market",
      scopeId
    );

    if (!updated) {
      return response.status(404).json({ error: "Tenant not found" });
    }

    response.json({
      ...updated,
      scenarios: container.platformService.getScenarioRegistry().scenarios,
      commerceAnalytics: await container.platformService.getCommerceDashboard(updated.tenantId)
    });
  });

  return router;
}

async function resolveTenantByRequestShop(container: AppContainer, rawShop: string) {
  const shop = normalizeShopDomain(rawShop);
  if (!isValidShopDomain(shop)) {
    return null;
  }

  const installation = await container.platformRepository.getInstallation(shop);
  if (!installation || installation.status !== "installed") {
    return null;
  }

  return container.platformService.getTenantDetail(installation.tenantId);
}
