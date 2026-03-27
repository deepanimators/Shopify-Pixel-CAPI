import { createHash, randomUUID } from "node:crypto";

import { logger } from "../../lib/logger.js";
import { IdentityResolver } from "../identity/resolver.js";
import { MetaClient } from "../meta/client.js";
import { TenantRegistry } from "../tenants/registry.js";
import type { EventRepository } from "./repository.js";
import type { IncomingEvent, IngestResult, NormalizedEvent } from "./types.js";

export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly tenantRegistry = new TenantRegistry(),
    private readonly identityResolver = new IdentityResolver(),
    private readonly metaClient = new MetaClient()
  ) {}

  async ingest(input: IncomingEvent): Promise<IngestResult> {
    const tenant = this.tenantRegistry.resolve(input.tenantId, input.shopDomain);
    const identity = this.identityResolver.resolve(input.user);
    const eventId = input.eventId ?? input.browserEventId ?? randomUUID();
    const occurredAt = input.occurredAt ?? new Date().toISOString();
    const dedupeKey = this.buildDedupeKey({
      tenantId: tenant.tenantId,
      eventName: input.eventName,
      eventId,
      orderId: input.commerce?.orderId,
      checkoutId: input.commerce?.checkoutId,
      cartId: input.commerce?.cartId
    });

    const existing = await this.eventRepository.findByDedupeKey(dedupeKey);
    if (existing) {
      return {
        event: existing,
        duplicate: true
      };
    }

    const normalizedEvent: NormalizedEvent = {
      ...input,
      eventId,
      occurredAt,
      dedupeKey,
      identity,
      deliveredToMeta: false
    };

    const deliveredToMeta = await this.metaClient.sendEvent(normalizedEvent);
    normalizedEvent.deliveredToMeta = deliveredToMeta;

    await this.eventRepository.save(normalizedEvent);

    logger.info("Event ingested", {
      eventId: normalizedEvent.eventId,
      tenantId: normalizedEvent.tenantId,
      duplicate: false
    });

    return {
      event: normalizedEvent,
      duplicate: false
    };
  }

  private buildDedupeKey(input: {
    tenantId: string;
    eventName: string;
    eventId: string;
    orderId?: string;
    checkoutId?: string;
    cartId?: string;
  }): string {
    const seed = [
      input.tenantId,
      input.eventName,
      input.eventId,
      input.orderId ?? "",
      input.checkoutId ?? "",
      input.cartId ?? ""
    ].join("|");

    return createHash("sha256").update(seed).digest("hex");
  }
}
