import type { NormalizedEvent, DeliveryStatus } from "../events/types.js";
import type { GoogleAdsConnection, Tenant } from "../platform/types.js";
import type { DestinationAdapter } from "./types.js";

export class GoogleAdsAdapter implements DestinationAdapter {
  readonly name = "googleAds" as const;

  async sendEvent(event: NormalizedEvent, tenant: Tenant): Promise<DeliveryStatus> {
    const connection = tenant.destinations.googleAds;
    if (!connection?.enabled || !connection.customerId || !connection.conversionActionId) {
      return {
        status: "skipped",
        detail: "Google Ads conversion settings are not configured"
      };
    }

    const payload = this.buildPayload(event, connection);
    if (connection.transport !== "api") {
      return {
        status: "preview",
        detail: "Google Ads adapter is running in preview mode",
        payloadPreview: payload
      };
    }

    return {
      status: "failed",
      detail: "Google Ads API transport requires OAuth implementation before live delivery",
      payloadPreview: payload
    };
  }

  private buildPayload(event: NormalizedEvent, connection: GoogleAdsConnection) {
    return {
      customer_id: connection.customerId,
      conversion_action: connection.conversionActionId,
      conversion_date_time: event.occurredAt,
      conversion_value: event.commerce?.value,
      currency_code: event.commerce?.currency ?? event.market.currencyCode,
      order_id: event.commerce?.orderId,
      user_identifiers: {
        email: event.user.email,
        phone_number: event.user.phone
      },
      cart_data: event.lineItems?.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price
      }))
    };
  }
}
