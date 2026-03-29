import type { NormalizedEvent, DeliveryStatus } from "../events/types.js";
import type { DestinationConfigs, DestinationScope, Tenant } from "../platform/types.js";
import { Ga4Adapter } from "./ga4-client.js";
import { GoogleAdsAdapter } from "./google-ads-client.js";
import { MetaAdapter } from "./meta-adapter.js";
import { TikTokAdapter } from "./tiktok-client.js";
import type { DestinationAdapter, DestinationName } from "./types.js";

export class DestinationService {
  private readonly adapters: DestinationAdapter[];

  constructor(adapters?: DestinationAdapter[]) {
    this.adapters =
      adapters ??
      [new MetaAdapter(), new Ga4Adapter(), new GoogleAdsAdapter(), new TikTokAdapter()];
  }

  async deliver(event: NormalizedEvent, tenant: Tenant): Promise<Record<DestinationName, DeliveryStatus>> {
    const deliveries = {} as Record<DestinationName, DeliveryStatus>;
    const resolvedTenant = resolveTenantDestinations(tenant, event);

    for (const adapter of this.adapters) {
      try {
        deliveries[adapter.name] = await adapter.sendEvent(event, resolvedTenant);
      } catch (error) {
        deliveries[adapter.name] = {
          status: "failed",
          detail: error instanceof Error ? error.message : `Delivery failed for ${adapter.name}`
        };
      }
    }

    return deliveries;
  }
}

function resolveTenantDestinations(tenant: Tenant, event: NormalizedEvent): Tenant {
  const eventDomain = event.market.domain ?? safeUrlHost(event.page.url);
  const marketScope = tenant.destinationScopes.find(
    (scope) => scope.scopeType === "market" && scope.scopeId === event.market.marketId
  );
  const domainScope = tenant.destinationScopes.find(
    (scope) =>
      scope.scopeType === "domain" &&
      (scope.scopeId === eventDomain || scope.domainHost === eventDomain)
  );

  let destinations = mergeDestinationConfigs({}, tenant.destinations);

  if (marketScope) {
    destinations = mergeDestinationConfigs(destinations, marketScope.destinations);
  }

  if (domainScope) {
    destinations = mergeDestinationConfigs(destinations, domainScope.destinations);
  }

  return {
    ...tenant,
    destinations
  };
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

function safeUrlHost(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).hostname;
  } catch (_error) {
    return undefined;
  }
}
