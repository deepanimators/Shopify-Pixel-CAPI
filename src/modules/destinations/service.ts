import type { NormalizedEvent, DeliveryStatus } from "../events/types.js";
import type { Tenant } from "../platform/types.js";
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

    for (const adapter of this.adapters) {
      try {
        deliveries[adapter.name] = await adapter.sendEvent(event, tenant);
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
