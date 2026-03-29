import type {
  DestinationConfigs,
  DestinationScope,
  MetaConnection,
  PlatformSeed,
  ShopInstallation,
  SupportRequest,
  Tenant,
  TenantTrackingConfig,
  WebhookReceipt
} from "./types.js";

export interface PlatformRepository {
  listTenants(): Promise<Tenant[]>;
  getTenant(tenantId: string): Promise<Tenant | null>;
  getTenantByShopDomain(shopDomain: string): Promise<Tenant | null>;
  listInstallations(): Promise<ShopInstallation[]>;
  getInstallation(shopDomain: string): Promise<ShopInstallation | null>;
  saveInstallation(installation: ShopInstallation): Promise<void>;
  markUninstalled(shopDomain: string): Promise<void>;
  upsertMetaConnection(tenantId: string, connection: MetaConnection): Promise<Tenant | null>;
  updateTrackingConfig(tenantId: string, tracking: TenantTrackingConfig): Promise<Tenant | null>;
  updateDestinationConfigs(
    tenantId: string,
    destinationConfigs: DestinationConfigs
  ): Promise<Tenant | null>;
  upsertDestinationScope(tenantId: string, scope: DestinationScope): Promise<Tenant | null>;
  deleteDestinationScope(
    tenantId: string,
    scopeType: DestinationScope["scopeType"],
    scopeId: string
  ): Promise<Tenant | null>;
  createSupportRequest(request: SupportRequest): Promise<SupportRequest>;
  listSupportRequests(limit: number): Promise<SupportRequest[]>;
  recordWebhook(receipt: WebhookReceipt): Promise<void>;
  listWebhooks(limit: number): Promise<WebhookReceipt[]>;
}

export class InMemoryPlatformRepository implements PlatformRepository {
  private readonly tenants = new Map<string, Tenant>();
  private readonly installations = new Map<string, ShopInstallation>();
  private readonly webhooks: WebhookReceipt[];
  private readonly supportRequests: SupportRequest[];

  constructor(seed: PlatformSeed) {
    for (const tenant of seed.tenants) {
      this.tenants.set(tenant.tenantId, tenant);
    }

    for (const installation of seed.installations) {
      this.installations.set(installation.shopDomain, installation);
    }

    this.webhooks = [...seed.webhooks];
    this.supportRequests = [...seed.supportRequests];
  }

  async listTenants(): Promise<Tenant[]> {
    return [...this.tenants.values()];
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    return this.tenants.get(tenantId) ?? null;
  }

  async getTenantByShopDomain(shopDomain: string): Promise<Tenant | null> {
    const direct = [...this.tenants.values()].find((tenant) => tenant.shopDomain === shopDomain);
    if (direct) {
      return direct;
    }

    const viaInstallation = this.installations.get(shopDomain);
    if (!viaInstallation) {
      return null;
    }

    return this.tenants.get(viaInstallation.tenantId) ?? null;
  }

  async listInstallations(): Promise<ShopInstallation[]> {
    return [...this.installations.values()];
  }

  async getInstallation(shopDomain: string): Promise<ShopInstallation | null> {
    return this.installations.get(shopDomain) ?? null;
  }

  async saveInstallation(installation: ShopInstallation): Promise<void> {
    if (!this.tenants.has(installation.tenantId)) {
      this.tenants.set(installation.tenantId, createTenantFromInstallation(installation));
    }

    this.installations.set(installation.shopDomain, installation);
  }

  async markUninstalled(shopDomain: string): Promise<void> {
    const installation = this.installations.get(shopDomain);
    if (!installation) {
      return;
    }

    this.installations.set(shopDomain, {
      ...installation,
      status: "uninstalled",
      uninstalledAt: new Date().toISOString()
    });
  }

  async upsertMetaConnection(tenantId: string, connection: MetaConnection): Promise<Tenant | null> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    const updated: Tenant = {
      ...tenant,
      destinations: {
        ...mergeDestinationConfigs(tenant.destinations, {
          meta: connection
        })
      },
      updatedAt: new Date().toISOString()
    };
    this.tenants.set(tenantId, updated);

    return updated;
  }

  async updateTrackingConfig(tenantId: string, tracking: TenantTrackingConfig): Promise<Tenant | null> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    const updated: Tenant = {
      ...tenant,
      tracking,
      updatedAt: new Date().toISOString()
    };
    this.tenants.set(tenantId, updated);

    return updated;
  }

  async updateDestinationConfigs(
    tenantId: string,
    destinationConfigs: DestinationConfigs
  ): Promise<Tenant | null> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    const updated: Tenant = {
      ...tenant,
      destinations: mergeDestinationConfigs(tenant.destinations, destinationConfigs),
      updatedAt: new Date().toISOString()
    };
    this.tenants.set(tenantId, updated);

    return updated;
  }

  async upsertDestinationScope(tenantId: string, scope: DestinationScope): Promise<Tenant | null> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    const nextScopes = [...tenant.destinationScopes];
    const index = nextScopes.findIndex(
      (entry) => entry.scopeType === scope.scopeType && entry.scopeId === scope.scopeId
    );
    const nextScope: DestinationScope = {
      ...scope,
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      nextScopes[index] = nextScope;
    } else {
      nextScopes.push(nextScope);
    }

    const updated: Tenant = {
      ...tenant,
      destinationScopes: nextScopes,
      updatedAt: new Date().toISOString()
    };
    this.tenants.set(tenantId, updated);

    return updated;
  }

  async deleteDestinationScope(
    tenantId: string,
    scopeType: DestinationScope["scopeType"],
    scopeId: string
  ): Promise<Tenant | null> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    const updated: Tenant = {
      ...tenant,
      destinationScopes: tenant.destinationScopes.filter(
        (entry) => !(entry.scopeType === scopeType && entry.scopeId === scopeId)
      ),
      updatedAt: new Date().toISOString()
    };
    this.tenants.set(tenantId, updated);

    return updated;
  }

  async createSupportRequest(request: SupportRequest): Promise<SupportRequest> {
    this.supportRequests.unshift(request);
    return request;
  }

  async listSupportRequests(limit: number): Promise<SupportRequest[]> {
    return this.supportRequests.slice(0, limit);
  }

  async recordWebhook(receipt: WebhookReceipt): Promise<void> {
    this.webhooks.unshift(receipt);
  }

  async listWebhooks(limit: number): Promise<WebhookReceipt[]> {
    return this.webhooks.slice(0, limit);
  }
}

function createTenantFromInstallation(installation: ShopInstallation): Tenant {
  const now = new Date().toISOString();

  return {
    tenantId: installation.tenantId,
    displayName: prettifyTenantName(installation.tenantId),
    shopDomain: installation.shopDomain,
    planId: "starter",
    status: installation.status === "installed" ? "active" : "trial",
    supportedDomains: [
      {
        host: installation.shopDomain,
        primary: true
      }
    ],
    supportedMarkets: [],
    destinations: {},
    destinationScopes: [],
    tracking: {
      enabledScenarioIds: [],
      customEventMappings: []
    },
    createdAt: now,
    updatedAt: now
  };
}

function prettifyTenantName(tenantId: string) {
  return tenantId
    .split(/[-_]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function mergeDestinationConfigs(
  current: DestinationConfigs,
  incoming: DestinationConfigs
): DestinationConfigs {
  return {
    ...current,
    ...incoming,
    meta: incoming.meta
      ? {
          ...current.meta,
          ...incoming.meta
        }
      : current.meta,
    ga4: incoming.ga4
      ? {
          ...current.ga4,
          ...incoming.ga4
        }
      : current.ga4,
    googleAds: incoming.googleAds
      ? {
          ...current.googleAds,
          ...incoming.googleAds
        }
      : current.googleAds,
    tiktok: incoming.tiktok
      ? {
          ...current.tiktok,
          ...incoming.tiktok
        }
      : current.tiktok
  };
}
