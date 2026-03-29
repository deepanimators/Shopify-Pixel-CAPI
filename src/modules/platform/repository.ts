import type {
  DestinationConfigs,
  MetaConnection,
  PlatformSeed,
  ShopInstallation,
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
  recordWebhook(receipt: WebhookReceipt): Promise<void>;
  listWebhooks(limit: number): Promise<WebhookReceipt[]>;
}

export class InMemoryPlatformRepository implements PlatformRepository {
  private readonly tenants = new Map<string, Tenant>();
  private readonly installations = new Map<string, ShopInstallation>();
  private readonly webhooks: WebhookReceipt[];

  constructor(seed: PlatformSeed) {
    for (const tenant of seed.tenants) {
      this.tenants.set(tenant.tenantId, tenant);
    }

    for (const installation of seed.installations) {
      this.installations.set(installation.shopDomain, installation);
    }

    this.webhooks = [...seed.webhooks];
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
        ...tenant.destinations,
        meta: connection
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
      destinations: {
        ...tenant.destinations,
        ...destinationConfigs,
        meta: destinationConfigs.meta
          ? {
              ...tenant.destinations.meta,
              ...destinationConfigs.meta
            }
          : tenant.destinations.meta,
        ga4: destinationConfigs.ga4
          ? {
              ...tenant.destinations.ga4,
              ...destinationConfigs.ga4
            }
          : tenant.destinations.ga4,
        googleAds: destinationConfigs.googleAds
          ? {
              ...tenant.destinations.googleAds,
              ...destinationConfigs.googleAds
            }
          : tenant.destinations.googleAds,
        tiktok: destinationConfigs.tiktok
          ? {
              ...tenant.destinations.tiktok,
              ...destinationConfigs.tiktok
            }
          : tenant.destinations.tiktok
      },
      updatedAt: new Date().toISOString()
    };
    this.tenants.set(tenantId, updated);

    return updated;
  }

  async recordWebhook(receipt: WebhookReceipt): Promise<void> {
    this.webhooks.unshift(receipt);
  }

  async listWebhooks(limit: number): Promise<WebhookReceipt[]> {
    return this.webhooks.slice(0, limit);
  }
}
