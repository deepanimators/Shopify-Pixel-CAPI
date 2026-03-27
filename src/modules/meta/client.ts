import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import type { NormalizedEvent } from "../events/types.js";

export class MetaClient {
  async sendEvent(event: NormalizedEvent): Promise<boolean> {
    if (!env.META_PIXEL_ID || !env.META_ACCESS_TOKEN) {
      logger.info("Meta delivery skipped because credentials are not configured", {
        eventId: event.eventId
      });
      return false;
    }

    const url = `https://graph.facebook.com/v22.0/${env.META_PIXEL_ID}/events?access_token=${env.META_ACCESS_TOKEN}`;

    const payload = {
      data: [
        {
          event_name: this.toMetaEventName(event.eventName),
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
            order_id: event.commerce?.orderId
          }
        }
      ]
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
      case "product_view":
        return "ViewContent";
      case "add_to_cart":
        return "AddToCart";
      case "begin_checkout":
        return "InitiateCheckout";
      case "purchase":
        return "Purchase";
      default:
        return eventName;
    }
  }
}
