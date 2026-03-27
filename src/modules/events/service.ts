import { createHash, randomUUID } from "node:crypto";

import { logger } from "../../lib/logger.js";
import { IdentityResolver } from "../identity/resolver.js";
import { MetaClient } from "../meta/client.js";
import type { PlatformRepository } from "../platform/repository.js";
import { canonicalCategory, toCanonicalEventName } from "./catalog.js";
import type { EventRepository } from "./repository.js";
import type { IncomingEvent, IngestResult, NormalizedEvent } from "./types.js";

export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly platformRepository: PlatformRepository,
    private readonly identityResolver = new IdentityResolver(),
    private readonly metaClient = new MetaClient()
  ) {}

  async ingest(input: IncomingEvent): Promise<IngestResult> {
    const tenant = input.tenantId
      ? await this.platformRepository.getTenant(input.tenantId)
      : await this.platformRepository.getTenantByShopDomain(input.shopDomain);

    if (!tenant) {
      throw new Error(`Unknown tenant for shop ${input.shopDomain}`);
    }

    const identity = this.identityResolver.resolve(input.user);
    const eventId = input.eventId ?? input.browserEventId ?? randomUUID();
    const occurredAt = input.occurredAt ?? new Date().toISOString();
    const dedupeKey = this.buildDedupeKey({
      tenantId: tenant.tenantId,
      eventName: input.eventName,
      eventId,
      shopDomain: input.shopDomain,
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
      tenantId: tenant.tenantId,
      eventId,
      occurredAt,
      dedupeKey,
      canonicalEvent: toCanonicalEventName(input.eventName),
      category: canonicalCategory(toCanonicalEventName(input.eventName)),
      ...this.scoreEvent(input),
      identity,
      deliveredToMeta: false
    };

    const deliveredToMeta = await this.metaClient.sendEvent(normalizedEvent, tenant.meta);
    normalizedEvent.deliveredToMeta = deliveredToMeta;

    await this.eventRepository.save(normalizedEvent);

    logger.info("Event ingested", {
      eventId: normalizedEvent.eventId,
      tenantId: normalizedEvent.tenantId,
      canonicalEvent: normalizedEvent.canonicalEvent,
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
    shopDomain: string;
    orderId?: string;
    checkoutId?: string;
    cartId?: string;
  }): string {
    const seed = [
      input.tenantId,
      input.shopDomain,
      input.eventName,
      input.eventId,
      input.orderId ?? "",
      input.checkoutId ?? "",
      input.cartId ?? ""
    ].join("|");

    return createHash("sha256").update(seed).digest("hex");
  }

  private scoreEvent(input: IncomingEvent) {
    const canonicalEvent = toCanonicalEventName(input.eventName);
    const warnings: string[] = [];

    if (!input.page.url) {
      warnings.push("missing_page_url");
    }

    if (!input.market.countryCode || !input.market.currencyCode) {
      warnings.push("missing_market_context");
    }

    if (
      ["product_view", "add_to_cart", "remove_from_cart"].includes(canonicalEvent) &&
      !this.hasMerchandiseContext(input)
    ) {
      warnings.push("missing_merchandise_context");
    }

    if (
      ["begin_checkout", "add_contact_info", "add_address_info", "add_shipping_info", "add_payment_info"].includes(
        canonicalEvent
      ) &&
      !input.commerce?.checkoutId
    ) {
      warnings.push("missing_checkout_id");
    }

    if (canonicalEvent === "purchase") {
      if (!input.commerce?.orderId) {
        warnings.push("missing_order_id");
      }
      if (input.commerce?.value == null) {
        warnings.push("missing_purchase_value");
      }
      if (!input.commerce?.currency) {
        warnings.push("missing_purchase_currency");
      }
    }

    if (!input.user.anonymousId && !input.user.customerId && !input.user.email && !input.user.phone) {
      warnings.push("missing_identity_signals");
    }

    const qualityScore = Math.max(40, 100 - warnings.length * 10);

    return {
      qualityScore,
      qualityWarnings: warnings
    };
  }

  private hasMerchandiseContext(input: IncomingEvent) {
    return Boolean(
      input.lineItems?.length ||
        input.properties?.productId ||
        input.properties?.variantId ||
        input.commerce?.cartId
    );
  }
}
