export type StandardEventName =
  | "page_viewed"
  | "collection_viewed"
  | "product_viewed"
  | "search_submitted"
  | "cart_viewed"
  | "product_added_to_cart"
  | "product_removed_from_cart"
  | "checkout_started"
  | "checkout_contact_info_submitted"
  | "checkout_address_info_submitted"
  | "checkout_shipping_info_submitted"
  | "payment_info_submitted"
  | "checkout_completed"
  | "alert_displayed"
  | "ui_extension_errored";

export type LegacyEventName =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "begin_checkout"
  | "purchase";

export type EventName = StandardEventName | LegacyEventName | string;

export type CanonicalEventName =
  | "page_view"
  | "collection_view"
  | "product_view"
  | "view_item_list"
  | "select_item"
  | "search"
  | "view_promotion"
  | "select_promotion"
  | "cart_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "update_cart"
  | "apply_coupon"
  | "remove_coupon"
  | "add_to_wishlist"
  | "remove_from_wishlist"
  | "compare_product"
  | "remove_from_compare"
  | "begin_checkout"
  | "add_contact_info"
  | "add_address_info"
  | "add_shipping_info"
  | "add_payment_info"
  | "purchase"
  | "refund"
  | "cancel_order"
  | "return_request"
  | "login"
  | "sign_up"
  | "identify_customer"
  | "generate_lead"
  | "subscribe_newsletter"
  | "share"
  | "support_contact"
  | "consent_update"
  | "subscription_start"
  | "subscription_renew"
  | "subscription_cancel"
  | "subscription_pause"
  | "subscription_resume"
  | "alert"
  | "ui_error"
  | "custom_event";

export type EventSource = "browser" | "server";

export interface MarketContext {
  countryCode: string;
  currencyCode: string;
  marketId?: string;
  domain?: string;
}

export interface UserContext {
  anonymousId?: string;
  customerId?: string;
  email?: string;
  phone?: string;
  externalId?: string;
  ip?: string;
  userAgent?: string;
}

export interface CommerceContext {
  cartId?: string;
  checkoutId?: string;
  orderId?: string;
  value?: number;
  currency?: string;
  subtotal?: number;
  discount?: number;
  shipping?: number;
  tax?: number;
}

export interface PageContext {
  url: string;
  referrer?: string;
}

export interface ConsentContext {
  analytics?: boolean;
  marketing?: boolean;
  preferences?: boolean;
  saleOfData?: boolean;
}

export interface CommerceLineItem {
  productId?: string;
  variantId?: string;
  sku?: string;
  title?: string;
  quantity?: number;
  price?: number;
  currency?: string;
}

export interface IncomingEvent {
  tenantId?: string;
  shopDomain: string;
  eventName: EventName;
  source: EventSource;
  eventId?: string;
  browserEventId?: string;
  occurredAt?: string;
  market: MarketContext;
  user: UserContext;
  commerce?: CommerceContext;
  lineItems?: CommerceLineItem[];
  consent?: ConsentContext;
  properties?: Record<string, unknown>;
  page: PageContext;
}

export interface ResolvedIdentity {
  identityKey: string;
  matchedOn: string[];
}

export interface NormalizedEvent extends IncomingEvent {
  tenantId: string;
  eventId: string;
  occurredAt: string;
  dedupeKey: string;
  scenarioId?: string;
  scenarioEnabled: boolean;
  canonicalEvent: CanonicalEventName;
  category:
    | "commerce"
    | "checkout"
    | "engagement"
    | "merchandising"
    | "conversion"
    | "identity"
    | "retention"
    | "support"
    | "consent"
    | "quality"
    | "custom";
  qualityScore: number;
  qualityWarnings: string[];
  identity: ResolvedIdentity;
  deliveredToMeta: boolean;
  deliveries: Record<string, DeliveryStatus>;
}

export interface IngestResult {
  event: NormalizedEvent;
  duplicate: boolean;
}

export interface DeliveryStatus {
  status: "delivered" | "failed" | "skipped" | "preview";
  detail?: string;
  payloadPreview?: unknown;
}
