export interface TenantConfig {
  tenantId: string;
  shopDomain: string;
  displayName: string;
  supportedDomains: string[];
  supportedMarkets: string[];
}

export class TenantRegistry {
  resolve(tenantId: string, shopDomain: string): TenantConfig {
    return {
      tenantId,
      shopDomain,
      displayName: tenantId,
      supportedDomains: [shopDomain],
      supportedMarkets: []
    };
  }
}
