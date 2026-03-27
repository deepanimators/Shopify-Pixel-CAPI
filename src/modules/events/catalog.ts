import type { CanonicalEventName, EventName } from "./types.js";

export const SHOPIFY_STANDARD_EVENTS = [
  "page_viewed",
  "collection_viewed",
  "product_viewed",
  "search_submitted",
  "cart_viewed",
  "product_added_to_cart",
  "product_removed_from_cart",
  "checkout_started",
  "checkout_contact_info_submitted",
  "checkout_address_info_submitted",
  "checkout_shipping_info_submitted",
  "payment_info_submitted",
  "checkout_completed",
  "alert_displayed",
  "ui_extension_errored"
] as const;

const CANONICAL_EVENT_MAP: Record<string, CanonicalEventName> = {
  page_viewed: "page_view",
  page_view: "page_view",
  collection_viewed: "collection_view",
  product_viewed: "product_view",
  product_view: "product_view",
  search_submitted: "search",
  cart_viewed: "cart_view",
  product_added_to_cart: "add_to_cart",
  add_to_cart: "add_to_cart",
  product_removed_from_cart: "remove_from_cart",
  remove_from_cart: "remove_from_cart",
  checkout_started: "begin_checkout",
  begin_checkout: "begin_checkout",
  checkout_contact_info_submitted: "add_contact_info",
  checkout_address_info_submitted: "add_address_info",
  checkout_shipping_info_submitted: "add_shipping_info",
  payment_info_submitted: "add_payment_info",
  checkout_completed: "purchase",
  purchase: "purchase",
  alert_displayed: "alert",
  ui_extension_errored: "ui_error"
};

export function toCanonicalEventName(eventName: EventName): CanonicalEventName {
  if (eventName.startsWith("custom:")) {
    return "custom_event";
  }

  return CANONICAL_EVENT_MAP[eventName] ?? "custom_event";
}

export function canonicalCategory(
  canonicalEvent: CanonicalEventName
): "commerce" | "checkout" | "engagement" | "quality" | "custom" {
  switch (canonicalEvent) {
    case "page_view":
    case "collection_view":
    case "product_view":
    case "search":
    case "cart_view":
      return "engagement";
    case "add_to_cart":
    case "remove_from_cart":
    case "purchase":
      return "commerce";
    case "begin_checkout":
    case "add_contact_info":
    case "add_address_info":
    case "add_shipping_info":
    case "add_payment_info":
      return "checkout";
    case "alert":
    case "ui_error":
      return "quality";
    default:
      return "custom";
  }
}
