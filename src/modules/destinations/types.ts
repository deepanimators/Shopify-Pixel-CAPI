import type { NormalizedEvent, DeliveryStatus } from "../events/types.js";
import type { Tenant } from "../platform/types.js";

export type DestinationName = "meta" | "ga4" | "googleAds" | "tiktok";

export interface DestinationAdapter {
  name: DestinationName;
  sendEvent(event: NormalizedEvent, tenant: Tenant): Promise<DeliveryStatus>;
}
