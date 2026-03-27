import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import type { NormalizedEvent } from "../events/types.js";
import type { MetaConnection } from "../platform/types.js";

export class MetaClient {
  async sendEvent(event: NormalizedEvent, connection?: MetaConnection): Promise<boolean> {
    const pixelId = connection?.pixelId ?? env.DEFAULT_META_PIXEL_ID;
    const accessToken = connection?.accessToken ?? env.DEFAULT_META_ACCESS_TOKEN;
    const enabled = connection?.enabled ?? Boolean(pixelId && accessToken);

    if (!enabled || !pixelId || !accessToken) {
      logger.info("Meta delivery skipped because tenant credentials are not configured", {
        eventId: event.eventId,
        tenantId: event.tenantId
      });
      return false;
    }

    const url = `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`;

    const payload = {
      data: [
        {
          event_name: this.toMetaEventName(event.canonicalEvent),
          event_time: Math.floor(new Date(event.occurredAt).getTime() / 1000),
          event_id: event.eventId,
          action_source: "website",
          event_source_url: event.page.url,
          user_data: {
            em: event.user.email,
            ph: event.user.phone,
            external_id: event.user.externalId,
            client_ip_address: event.user.ip,
            client_user_agent: event.user.userAgent
          },
          custom_data: {
            currency: event.commerce?.currency ?? event.market.currencyCode,
            value: event.commerce?.value,
            order_id: event.commerce?.orderId,
            market_id: event.market.marketId,
            domain: event.market.domain,
            canonical_event: event.canonicalEvent
          }
        }
      ],
      test_event_code: connection?.testEventCode
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error("Meta delivery failed", {
        status: response.status,
        body
      });
      return false;
    }

    logger.info("Meta delivery succeeded", { eventId: event.eventId });
    return true;
  }

  private toMetaEventName(eventName: string): string {
    switch (eventName) {
      case "page_view":
        return "PageView";
      case "collection_view":
        return "ViewCategory";
      case "product_view":
        return "ViewContent";
      case "search":
        return "Search";
      case "cart_view":
        return "ViewCart";
      case "add_to_cart":
        return "AddToCart";
      case "remove_from_cart":
        return "RemoveFromCart";
      case "add_payment_info":
        return "AddPaymentInfo";
      case "begin_checkout":
        return "InitiateCheckout";
      case "purchase":
        return "Purchase";
      case "custom_event":
        return "CustomEvent";
      default:
        return eventName;
    }
  }
}
