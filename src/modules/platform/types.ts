export interface TenantMarket {
  id: string;
  label: string;
  countryCode: string;
  currencyCode: string;
  locale: string;
  storefrontDomain: string;
}

export interface TenantDomain {
  host: string;
  primary: boolean;
  marketId?: string;
}

export interface MetaConnection {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
  enabled: boolean;
  lastValidatedAt?: string;
}

export interface Tenant {
  tenantId: string;
  displayName: string;
  shopDomain: string;
  planId: string;
  status: "active" | "trial" | "disabled";
  supportedDomains: TenantDomain[];
  supportedMarkets: TenantMarket[];
  meta?: MetaConnection;
  createdAt: string;
  updatedAt: string;
}

export interface ShopInstallation {
  shopDomain: string;
  tenantId: string;
  accessToken?: string;
  scopes: string[];
  status: "pending" | "installed" | "uninstalled";
  installedAt: string;
  uninstalledAt?: string;
}

export interface WebhookReceipt {
  topic: string;
  shopDomain: string;
  receivedAt: string;
  verified: boolean;
}

export interface PlatformSeed {
  tenants: Tenant[];
  installations: ShopInstallation[];
  webhooks: WebhookReceipt[];
}
