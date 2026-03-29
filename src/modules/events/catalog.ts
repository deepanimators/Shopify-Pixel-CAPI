import { EVENT_SCENARIOS, getScenarioById } from "./scenarios.js";
import type { CanonicalEventName, EventName } from "./types.js";
import type { CustomEventMapping, TenantTrackingConfig } from "../platform/types.js";

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
  view_item: "product_view",
  view_item_list: "view_item_list",
  select_item: "select_item",
  search_submitted: "search",
  search: "search",
  cart_viewed: "cart_view",
  view_cart: "cart_view",
  product_added_to_cart: "add_to_cart",
  add_to_cart: "add_to_cart",
  product_removed_from_cart: "remove_from_cart",
  remove_from_cart: "remove_from_cart",
  checkout_started: "begin_checkout",
  begin_checkout: "begin_checkout",
  checkout_contact_info_submitted: "add_contact_info",
  checkout_address_info_submitted: "add_address_info",
  checkout_shipping_info_submitted: "add_shipping_info",
  add_shipping_info: "add_shipping_info",
  payment_info_submitted: "add_payment_info",
  add_payment_info: "add_payment_info",
  checkout_completed: "purchase",
  purchase: "purchase",
  refund: "refund",
  login: "login",
  sign_up: "sign_up",
  signup: "sign_up",
  register: "sign_up",
  generate_lead: "generate_lead",
  share: "share",
  view_promotion: "view_promotion",
  select_promotion: "select_promotion",
  add_to_wishlist: "add_to_wishlist",
  alert_displayed: "alert",
  ui_extension_errored: "ui_error"
};

const SCENARIO_ALIAS_MAP = new Map<string, CanonicalEventName>();

for (const scenario of EVENT_SCENARIOS) {
  for (const candidate of [scenario.recommendedEventName, ...scenario.aliases]) {
    SCENARIO_ALIAS_MAP.set(normalizeEventKey(candidate), scenario.canonicalEvent);
  }
}

export function toCanonicalEventName(eventName: EventName): CanonicalEventName {
  if (eventName.startsWith("custom:")) {
    return "custom_event";
  }

  const direct = CANONICAL_EVENT_MAP[eventName];
  if (direct) {
    return direct;
  }

  return SCENARIO_ALIAS_MAP.get(normalizeEventKey(eventName)) ?? "custom_event";
}

export function resolveScenario(eventName: string, tracking?: TenantTrackingConfig, rawEventName?: string) {
  const customMatch = resolveCustomMapping(eventName, tracking?.customEventMappings, rawEventName);
  if (customMatch) {
    return customMatch;
  }

  const normalizedKey = normalizeEventKey(eventName);
  const scenario = EVENT_SCENARIOS.find((candidate) =>
    [candidate.recommendedEventName, ...candidate.aliases].some(
      (alias) => normalizeEventKey(alias) === normalizedKey
    )
  );

  return scenario ?? null;
}

function resolveCustomMapping(
  eventName: string,
  mappings?: CustomEventMapping[],
  rawEventName?: string
) {
  if (!mappings?.length) {
    return null;
  }

  const candidates = [eventName, rawEventName].filter(Boolean).map((value) => normalizeEventKey(String(value)));
  const match = mappings.find(
    (mapping) =>
      mapping.enabled &&
      candidates.includes(normalizeEventKey(mapping.sourceName))
  );

  return match ? getScenarioById(match.scenarioId) : null;
}

export function canonicalCategory(
  canonicalEvent: CanonicalEventName
):
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
  | "custom" {
  switch (canonicalEvent) {
    case "page_view":
    case "collection_view":
    case "product_view":
    case "view_item_list":
    case "select_item":
    case "search":
    case "cart_view":
      return "engagement";
    case "view_promotion":
    case "select_promotion":
    case "add_to_wishlist":
    case "remove_from_wishlist":
    case "compare_product":
    case "remove_from_compare":
      return "merchandising";
    case "add_to_cart":
    case "remove_from_cart":
    case "update_cart":
    case "apply_coupon":
    case "remove_coupon":
      return "commerce";
    case "purchase":
    case "refund":
    case "cancel_order":
    case "return_request":
      return "conversion";
    case "login":
    case "sign_up":
    case "identify_customer":
    case "generate_lead":
    case "subscribe_newsletter":
      return "identity";
    case "subscription_start":
    case "subscription_renew":
    case "subscription_cancel":
    case "subscription_pause":
    case "subscription_resume":
      return "retention";
    case "support_contact":
    case "share":
      return "support";
    case "consent_update":
      return "consent";
    case "alert":
    case "ui_error":
      return "quality";
    case "begin_checkout":
    case "add_contact_info":
    case "add_address_info":
    case "add_shipping_info":
    case "add_payment_info":
      return "checkout";
    default:
      return "custom";
  }
}

function normalizeEventKey(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
