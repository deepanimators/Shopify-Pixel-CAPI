export interface Tenant {
  id: string;
  shopDomain: string;
  domains: string[];
  metaPixelId?: string;
  metaAccessToken?: string;
  testEventCode?: string;
  enabled: boolean;
  createdAt: Date;
}

export interface TenantConfig {
  tenants: Tenant[];
}
