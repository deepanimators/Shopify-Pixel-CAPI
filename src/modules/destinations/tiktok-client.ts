import { logger } from "../../lib/logger.js";
import type { NormalizedEvent, DeliveryStatus } from "../events/types.js";
import type { Tenant } from "../platform/types.js";
import type { DestinationAdapter } from "./types.js";

export class TikTokAdapter implements DestinationAdapter {
  readonly name = "tiktok" as const;

  async sendEvent(event: NormalizedEvent, tenant: Tenant): Promise<DeliveryStatus> {
    const connection = tenant.destinations.tiktok;
    if (!connection?.enabled || !connection.pixelCode) {
      return {
        status: "skipped",
        detail: "TikTok Events API settings are not configured"
      };
    }

    const payload = this.buildPayload(event, connection.pixelCode);
    if (!connection.accessToken) {
      return {
        status: "preview",
        detail: "TikTok payload mapped, awaiting access token for live delivery",
        payloadPreview: payload
      };
    }

    const endpoint =
      connection.endpoint ?? "https://business-api.tiktok.com/open_api/v1.3/event/track/";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": connection.accessToken
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error("TikTok delivery failed", { status: response.status, body });
      return {
        status: "failed",
        detail: `TikTok responded with status ${response.status}`,
        payloadPreview: payload
      };
    }

    return {
      status: "delivered",
      detail: "Delivered to TikTok Events API"
    };
  }

  private buildPayload(event: NormalizedEvent, pixelCode: string) {
    return {
      event_source: "web",
      event_source_id: pixelCode,
      data: [
        {
          event: this.toTikTokEventName(event.canonicalEvent),
          event_time: Math.floor(new Date(event.occurredAt).getTime() / 1000),
          event_id: event.eventId,
          context: {
            page: {
              url: event.page.url
            },
            user: {
              external_id: event.user.externalId,
              email: event.user.email,
              phone_number: event.user.phone
            }
          },
          properties: {
            currency: event.commerce?.currency ?? event.market.currencyCode,
            value: event.commerce?.value,
            contents: event.lineItems?.map((item) => ({
              content_id: item.productId,
              content_name: item.title,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      ]
    };
  }

  private toTikTokEventName(canonicalEvent: string) {
    const map: Record<string, string> = {
      page_view: "ViewContent",
      product_view: "ViewContent",
      add_to_cart: "AddToCart",
      begin_checkout: "InitiateCheckout",
      add_payment_info: "AddPaymentInfo",
      purchase: "CompletePayment",
      search: "Search",
      sign_up: "CompleteRegistration",
      subscribe_newsletter: "Subscribe",
      generate_lead: "SubmitForm"
    };

    return map[canonicalEvent] ?? "CustomEvent";
  }
}
