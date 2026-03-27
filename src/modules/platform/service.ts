import type { EventRepository } from "../events/repository.js";
import type { BillingPlan } from "../billing/types.js";
import { BillingService } from "../billing/service.js";
import type { PlatformRepository } from "./repository.js";
import type { Tenant } from "./types.js";
import type { ShopifyAuthService } from "../shopify/auth.js";

export class PlatformService {
  constructor(
    private readonly platformRepository: PlatformRepository,
    private readonly eventRepository: EventRepository,
    private readonly billingService: BillingService,
    private readonly authService: ShopifyAuthService
  ) {}

  async getOverview() {
    const [tenants, installations, recentEvents, recentWebhooks] = await Promise.all([
      this.platformRepository.listTenants(),
      this.platformRepository.listInstallations(),
      this.eventRepository.listRecent(8),
      this.platformRepository.listWebhooks(8)
    ]);

    const totalDomains = tenants.reduce(
      (sum, tenant) => sum + tenant.supportedDomains.length,
      0
    );
    const totalMarkets = tenants.reduce(
      (sum, tenant) => sum + tenant.supportedMarkets.length,
      0
    );

    return {
      summary: {
        tenants: tenants.length,
        installedShops: installations.filter((installation) => installation.status === "installed")
          .length,
        domains: totalDomains,
        markets: totalMarkets,
        trackedEvents: await this.eventRepository.count()
      },
      tenants: await Promise.all(tenants.map((tenant) => this.toTenantCard(tenant))),
      plans: this.billingService.listPlans(),
      diagnostics: await this.getEventDiagnostics(),
      recentEvents,
      recentWebhooks
    };
  }

  async listTenants() {
    const tenants = await this.platformRepository.listTenants();

    return Promise.all(tenants.map((tenant) => this.toTenantCard(tenant)));
  }

  async getTenantDetail(tenantId: string) {
    const tenant = await this.platformRepository.getTenant(tenantId);
    if (!tenant) {
      return null;
    }

    const plan = this.billingService.getPlan(tenant.planId);
    const eventCount = await this.eventRepository.countByTenant(tenantId);

    return {
      ...tenant,
      plan,
      eventCount,
      recommendedPlan: this.billingService.recommendPlan(
        tenant.supportedDomains.length,
        tenant.supportedMarkets.length
      )
    };
  }

  async upsertMetaConnection(tenantId: string, payload: {
    pixelId: string;
    accessToken: string;
    enabled: boolean;
    testEventCode?: string;
  }) {
    return this.platformRepository.upsertMetaConnection(tenantId, {
      pixelId: payload.pixelId,
      accessToken: payload.accessToken,
      enabled: payload.enabled,
      testEventCode: payload.testEventCode,
      lastValidatedAt: new Date().toISOString()
    });
  }

  async listInstallations() {
    return this.platformRepository.listInstallations();
  }

  async getEventDiagnostics(tenantId?: string) {
    const events = (await this.eventRepository.listAll()).filter((event) =>
      tenantId ? event.tenantId === tenantId : true
    );

    const byCanonicalEvent = aggregate(events, (event) => event.canonicalEvent);
    const byShopifyEvent = aggregate(events, (event) => event.eventName);
    const warnings = aggregate(
      events.flatMap((event) => event.qualityWarnings),
      (warning) => warning
    );

    const averageQuality = events.length
      ? Math.round(
          events.reduce((sum, event) => sum + event.qualityScore, 0) / events.length
        )
      : 0;

    return {
      totalEvents: events.length,
      averageQuality,
      byCanonicalEvent,
      byShopifyEvent,
      warnings
    };
  }

  createInstallLink(shop: string) {
    return this.authService.createInstallStart(shop);
  }

  private async toTenantCard(tenant: Tenant) {
    const plan = this.billingService.getPlan(tenant.planId) ?? this.billingService.listPlans()[0];
    const eventCount = await this.eventRepository.countByTenant(tenant.tenantId);

    return {
      tenantId: tenant.tenantId,
      displayName: tenant.displayName,
      shopDomain: tenant.shopDomain,
      status: tenant.status,
      domains: tenant.supportedDomains.length,
      markets: tenant.supportedMarkets.length,
      metaEnabled: tenant.meta?.enabled ?? false,
      eventCount,
      plan
    };
  }
}

function aggregate<T>(items: T[], getKey: (item: T) => string) {
  return Object.entries(
    items.reduce<Record<string, number>>((accumulator, item) => {
      const key = getKey(item);
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count);
}
