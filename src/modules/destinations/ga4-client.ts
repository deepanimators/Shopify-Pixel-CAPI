import { logger } from "../../lib/logger.js";
import type { NormalizedEvent, DeliveryStatus } from "../events/types.js";
import type { Ga4Connection, Tenant } from "../platform/types.js";
import type { DestinationAdapter } from "./types.js";

export class Ga4Adapter implements DestinationAdapter {
  readonly name = "ga4" as const;

  async sendEvent(event: NormalizedEvent, tenant: Tenant): Promise<DeliveryStatus> {
    const connection = tenant.destinations.ga4;
    if (!connection?.enabled || !connection.measurementId || !connection.apiSecret) {
      return {
        status: "skipped",
        detail: "GA4 Measurement Protocol credentials are not configured"
      };
    }

    const endpoint = connection.debugMode
      ? "https://www.google-analytics.com/debug/mp/collect"
      : "https://www.google-analytics.com/mp/collect";
    const url = `${endpoint}?measurement_id=${connection.measurementId}&api_secret=${connection.apiSecret}`;
    const payload = this.buildPayload(event, connection);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error("GA4 delivery failed", { status: response.status, body });
      return {
        status: "failed",
        detail: `GA4 responded with status ${response.status}`,
        payloadPreview: payload
      };
    }

    return {
      status: "delivered",
      detail: "Delivered to GA4 Measurement Protocol",
      payloadPreview: connection.debugMode ? payload : undefined
    };
  }

  private buildPayload(event: NormalizedEvent, connection: Ga4Connection) {
    return {
      client_id: event.user.anonymousId ?? event.identity.identityKey,
      user_id: event.user.customerId ?? event.user.externalId,
      timestamp_micros: String(new Date(event.occurredAt).getTime() * 1000),
      user_properties: {
        tenant_id: { value: event.tenantId },
        market_id: { value: event.market.marketId ?? "unknown" }
      },
      events: [
        {
          name: this.toGa4EventName(event.canonicalEvent),
          params: {
            currency: event.commerce?.currency ?? event.market.currencyCode,
            value: event.commerce?.value,
            transaction_id: event.commerce?.orderId,
            page_location: event.page.url,
            item_list_name: event.properties?.item_list_name,
            items: event.lineItems?.map((item) => ({
              item_id: item.productId,
              item_name: item.title,
              item_variant: item.variantId,
              price: item.price,
              quantity: item.quantity
            }))
          }
        }
      ]
    };
  }

  private toGa4EventName(canonicalEvent: string) {
    const map: Record<string, string> = {
      page_view: "page_view",
      collection_view: "view_item_list",
      product_view: "view_item",
      view_item_list: "view_item_list",
      select_item: "select_item",
      search: "search",
      view_promotion: "view_promotion",
      select_promotion: "select_promotion",
      cart_view: "view_cart",
      add_to_cart: "add_to_cart",
      remove_from_cart: "remove_from_cart",
      add_to_wishlist: "add_to_wishlist",
      begin_checkout: "begin_checkout",
      add_shipping_info: "add_shipping_info",
      add_payment_info: "add_payment_info",
      purchase: "purchase",
      refund: "refund",
      login: "login",
      sign_up: "sign_up",
      generate_lead: "generate_lead",
      share: "share"
    };

    return map[canonicalEvent] ?? "custom_event";
  }
}
