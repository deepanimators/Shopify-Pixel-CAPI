import { MetaClient } from "../meta/client.js";
import type { NormalizedEvent, DeliveryStatus } from "../events/types.js";
import type { Tenant } from "../platform/types.js";
import type { DestinationAdapter } from "./types.js";

export class MetaAdapter implements DestinationAdapter {
  readonly name = "meta" as const;

  constructor(private readonly client = new MetaClient()) {}

  async sendEvent(event: NormalizedEvent, tenant: Tenant): Promise<DeliveryStatus> {
    const result = await this.client.sendEvent(event, tenant.destinations.meta);
    return {
      status: result ? "delivered" : "skipped",
      detail: result ? "Delivered to Meta Conversions API" : "Meta not configured or disabled"
    };
  }
}
