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

export interface DestinationConnectionBase {
  enabled: boolean;
  lastValidatedAt?: string;
}

export interface MetaConnection extends DestinationConnectionBase {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
}

export interface Ga4Connection extends DestinationConnectionBase {
  measurementId: string;
  apiSecret: string;
  debugMode?: boolean;
}

export interface GoogleAdsConnection extends DestinationConnectionBase {
  customerId: string;
  conversionActionId: string;
  loginCustomerId?: string;
  developerToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  transport?: "preview" | "api";
}

export interface TikTokConnection extends DestinationConnectionBase {
  pixelCode: string;
  accessToken?: string;
  testEventCode?: string;
  endpoint?: string;
}

export interface DestinationConfigs {
  meta?: MetaConnection;
  ga4?: Ga4Connection;
  googleAds?: GoogleAdsConnection;
  tiktok?: TikTokConnection;
}

export type DestinationScopeType = "tenant" | "domain" | "market";

export interface DestinationScope {
  scopeType: Exclude<DestinationScopeType, "tenant">;
  scopeId: string;
  label: string;
  domainHost?: string;
  marketId?: string;
  destinations: DestinationConfigs;
  updatedAt?: string;
}

export interface CustomEventMapping {
  sourceName: string;
  scenarioId: string;
  enabled: boolean;
}

export interface TenantTrackingConfig {
  enabledScenarioIds: string[];
  customEventMappings: CustomEventMapping[];
}

export interface Tenant {
  tenantId: string;
  displayName: string;
  shopDomain: string;
  planId: string;
  status: "active" | "trial" | "disabled";
  supportedDomains: TenantDomain[];
  supportedMarkets: TenantMarket[];
  destinations: DestinationConfigs;
  destinationScopes: DestinationScope[];
  tracking: TenantTrackingConfig;
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
