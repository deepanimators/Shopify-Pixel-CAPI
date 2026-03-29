import type { CanonicalEventName } from "./types.js";

export interface EventScenario {
  id: string;
  label: string;
  category:
    | "discovery"
    | "engagement"
    | "merchandising"
    | "cart"
    | "checkout"
    | "conversion"
    | "identity"
    | "retention"
    | "subscription"
    | "support"
    | "privacy"
    | "operational";
  source: "shopify" | "ga4" | "datalayer" | "custom";
  recommendedEventName: string;
  canonicalEvent: CanonicalEventName;
  aliases: string[];
}

function makeScenario(
  id: string,
  label: string,
  category: EventScenario["category"],
  source: EventScenario["source"],
  recommendedEventName: string,
  canonicalEvent: CanonicalEventName,
  aliases: string[] = []
): EventScenario {
  return {
    id,
    label,
    category,
    source,
    recommendedEventName,
    canonicalEvent,
    aliases
  };
}

export const EVENT_SCENARIOS: EventScenario[] = [
  makeScenario("page_view", "Page viewed", "discovery", "shopify", "page_viewed", "page_view", [
    "page_view",
    "view_page",
    "gtm.pageView"
  ]),
  makeScenario(
    "landing_page_view",
    "Landing page viewed",
    "discovery",
    "custom",
    "custom:landing_page_view",
    "page_view",
    ["landing_page_view", "homepage_view"]
  ),
  makeScenario(
    "collection_view",
    "Collection viewed",
    "discovery",
    "shopify",
    "collection_viewed",
    "collection_view",
    ["view_collection", "category_view"]
  ),
  makeScenario("product_view", "Product viewed", "discovery", "shopify", "product_viewed", "product_view", [
    "product_view",
    "view_item",
    "view_content"
  ]),
  makeScenario(
    "product_impression",
    "Product list impression",
    "discovery",
    "ga4",
    "view_item_list",
    "view_item_list",
    ["product-impression", "product_impression", "view_item_list", "view_item_list_impression"]
  ),
  makeScenario("select_item", "Item selected from list", "discovery", "ga4", "select_item", "select_item", [
    "product_click",
    "select_item"
  ]),
  makeScenario("search", "Search submitted", "discovery", "shopify", "search_submitted", "search", [
    "search",
    "site_search",
    "search_results_view"
  ]),
  makeScenario(
    "search_no_results",
    "Search returned no results",
    "discovery",
    "custom",
    "custom:search_no_results",
    "search",
    ["search_no_results", "empty_search_result"]
  ),
  makeScenario(
    "filter_apply",
    "Filter applied on listing page",
    "discovery",
    "custom",
    "custom:filter_apply",
    "custom_event",
    ["filter_apply", "facet_apply"]
  ),
  makeScenario(
    "filter_remove",
    "Filter removed on listing page",
    "discovery",
    "custom",
    "custom:filter_remove",
    "custom_event",
    ["filter_remove", "facet_remove"]
  ),
  makeScenario(
    "sort_apply",
    "Sort option selected",
    "discovery",
    "custom",
    "custom:sort_apply",
    "custom_event",
    ["sort_apply", "sort_change"]
  ),
  makeScenario(
    "recommendation_view",
    "Recommendation slot viewed",
    "merchandising",
    "custom",
    "custom:recommendation_view",
    "view_item_list",
    ["recommendation_view", "recommended_products_view"]
  ),
  makeScenario(
    "recommendation_click",
    "Recommendation clicked",
    "merchandising",
    "custom",
    "custom:recommendation_click",
    "select_item",
    ["recommendation_click", "recommended_product_click"]
  ),
  makeScenario("view_promotion", "Promotion viewed", "merchandising", "ga4", "view_promotion", "view_promotion", [
    "promotion_impression",
    "view_promotion"
  ]),
  makeScenario(
    "select_promotion",
    "Promotion clicked",
    "merchandising",
    "ga4",
    "select_promotion",
    "select_promotion",
    ["promotion_click", "select_promotion"]
  ),
  makeScenario(
    "banner_dismiss",
    "Promotion banner dismissed",
    "merchandising",
    "custom",
    "custom:banner_dismiss",
    "custom_event",
    ["banner_dismiss", "promo_banner_close"]
  ),
  makeScenario(
    "content_share",
    "Content shared",
    "engagement",
    "ga4",
    "share",
    "share",
    ["share", "share_content", "social_share"]
  ),
  makeScenario(
    "select_content",
    "Content selected",
    "engagement",
    "ga4",
    "select_content",
    "custom_event",
    ["select_content", "content_click"]
  ),
  makeScenario(
    "product_video_start",
    "Product video started",
    "engagement",
    "custom",
    "custom:product_video_start",
    "custom_event",
    ["video_start", "product_video_start"]
  ),
  makeScenario(
    "product_video_complete",
    "Product video completed",
    "engagement",
    "custom",
    "custom:product_video_complete",
    "custom_event",
    ["video_complete", "product_video_complete"]
  ),
  makeScenario(
    "gallery_zoom",
    "Product gallery zoomed",
    "engagement",
    "custom",
    "custom:gallery_zoom",
    "custom_event",
    ["gallery_zoom", "image_zoom"]
  ),
  makeScenario(
    "size_guide_open",
    "Size guide opened",
    "engagement",
    "custom",
    "custom:size_guide_open",
    "custom_event",
    ["size_guide_open"]
  ),
  makeScenario(
    "size_guide_close",
    "Size guide closed",
    "engagement",
    "custom",
    "custom:size_guide_close",
    "custom_event",
    ["size_guide_close"]
  ),
  makeScenario(
    "review_expand",
    "Product reviews expanded",
    "engagement",
    "custom",
    "custom:review_expand",
    "custom_event",
    ["review_expand", "reviews_open"]
  ),
  makeScenario(
    "ugc_gallery_view",
    "UGC gallery viewed",
    "engagement",
    "custom",
    "custom:ugc_gallery_view",
    "custom_event",
    ["ugc_gallery_view"]
  ),
  makeScenario(
    "newsletter_signup",
    "Newsletter signup completed",
    "identity",
    "custom",
    "custom:newsletter_signup",
    "subscribe_newsletter",
    ["newsletter_signup", "email_signup", "subscribe_newsletter"]
  ),
  makeScenario(
    "newsletter_unsubscribe",
    "Newsletter unsubscribe completed",
    "identity",
    "custom",
    "custom:newsletter_unsubscribe",
    "custom_event",
    ["newsletter_unsubscribe", "email_unsubscribe"]
  ),
  makeScenario("login", "Customer logged in", "identity", "ga4", "login", "login", [
    "login",
    "customer_login"
  ]),
  makeScenario("logout", "Customer logged out", "identity", "custom", "custom:logout", "custom_event", [
    "logout",
    "customer_logout"
  ]),
  makeScenario("sign_up", "Customer signed up", "identity", "ga4", "sign_up", "sign_up", [
    "sign_up",
    "signup",
    "register"
  ]),
  makeScenario(
    "identify_customer",
    "Anonymous identity stitched to known profile",
    "identity",
    "custom",
    "custom:identify_customer",
    "identify_customer",
    ["identify_customer", "identify", "customer_identified"]
  ),
  makeScenario(
    "account_view",
    "Customer account viewed",
    "identity",
    "custom",
    "custom:account_view",
    "custom_event",
    ["account_view", "profile_view"]
  ),
  makeScenario(
    "address_add",
    "Address added",
    "identity",
    "custom",
    "custom:address_add",
    "custom_event",
    ["address_add"]
  ),
  makeScenario(
    "address_update",
    "Address updated",
    "identity",
    "custom",
    "custom:address_update",
    "custom_event",
    ["address_update"]
  ),
  makeScenario(
    "generate_lead",
    "Lead generated",
    "identity",
    "ga4",
    "generate_lead",
    "generate_lead",
    ["generate_lead", "lead_submit", "contact_form_submit"]
  ),
  makeScenario("cart_view", "Cart viewed", "cart", "shopify", "cart_viewed", "cart_view", [
    "view_cart",
    "cart_view"
  ]),
  makeScenario(
    "add_to_cart",
    "Product added to cart",
    "cart",
    "shopify",
    "product_added_to_cart",
    "add_to_cart",
    ["add_to_cart", "product_added_to_cart"]
  ),
  makeScenario(
    "remove_from_cart",
    "Product removed from cart",
    "cart",
    "shopify",
    "product_removed_from_cart",
    "remove_from_cart",
    ["remove_from_cart", "remove-from-cart", "product_removed_from_cart"]
  ),
  makeScenario(
    "update_cart_quantity",
    "Cart quantity updated",
    "cart",
    "custom",
    "custom:update_cart_quantity",
    "update_cart",
    ["update_cart_quantity", "cart_quantity_change", "update_cart"]
  ),
  makeScenario(
    "save_for_later",
    "Save for later selected",
    "cart",
    "custom",
    "custom:save_for_later",
    "custom_event",
    ["save_for_later"]
  ),
  makeScenario(
    "add_to_wishlist",
    "Wishlist item added",
    "cart",
    "ga4",
    "add_to_wishlist",
    "add_to_wishlist",
    ["add_to_wishlist", "wishlist_add"]
  ),
  makeScenario(
    "remove_from_wishlist",
    "Wishlist item removed",
    "cart",
    "custom",
    "custom:remove_from_wishlist",
    "remove_from_wishlist",
    ["remove_from_wishlist", "wishlist_remove"]
  ),
  makeScenario(
    "compare_add",
    "Product added to compare",
    "cart",
    "custom",
    "custom:compare_add",
    "compare_product",
    ["compare_add", "add_to_compare"]
  ),
  makeScenario(
    "compare_remove",
    "Product removed from compare",
    "cart",
    "custom",
    "custom:compare_remove",
    "remove_from_compare",
    ["compare_remove", "remove_from_compare"]
  ),
  makeScenario(
    "apply_coupon",
    "Coupon applied",
    "cart",
    "custom",
    "custom:apply_coupon",
    "apply_coupon",
    ["apply_coupon", "coupon_apply"]
  ),
  makeScenario(
    "remove_coupon",
    "Coupon removed",
    "cart",
    "custom",
    "custom:remove_coupon",
    "remove_coupon",
    ["remove_coupon", "coupon_remove"]
  ),
  makeScenario(
    "shipping_estimate_view",
    "Shipping estimator viewed",
    "cart",
    "custom",
    "custom:shipping_estimate_view",
    "custom_event",
    ["shipping_estimate_view"]
  ),
  makeScenario(
    "shipping_estimate_submit",
    "Shipping estimator submitted",
    "cart",
    "custom",
    "custom:shipping_estimate_submit",
    "custom_event",
    ["shipping_estimate_submit"]
  ),
  makeScenario(
    "bundle_add",
    "Bundle added to cart",
    "cart",
    "custom",
    "custom:bundle_add",
    "add_to_cart",
    ["bundle_add"]
  ),
  makeScenario(
    "bundle_remove",
    "Bundle removed from cart",
    "cart",
    "custom",
    "custom:bundle_remove",
    "remove_from_cart",
    ["bundle_remove"]
  ),
  makeScenario(
    "gift_wrap_select",
    "Gift wrap selected",
    "cart",
    "custom",
    "custom:gift_wrap_select",
    "custom_event",
    ["gift_wrap_select"]
  ),
  makeScenario(
    "gift_message_add",
    "Gift message added",
    "cart",
    "custom",
    "custom:gift_message_add",
    "custom_event",
    ["gift_message_add"]
  ),
  makeScenario(
    "begin_checkout",
    "Checkout started",
    "checkout",
    "shopify",
    "checkout_started",
    "begin_checkout",
    ["begin_checkout", "checkout_started"]
  ),
  makeScenario(
    "add_contact_info",
    "Checkout contact info submitted",
    "checkout",
    "shopify",
    "checkout_contact_info_submitted",
    "add_contact_info",
    ["checkout_contact_info_submitted", "add_contact_info"]
  ),
  makeScenario(
    "add_address_info",
    "Checkout address info submitted",
    "checkout",
    "shopify",
    "checkout_address_info_submitted",
    "add_address_info",
    ["checkout_address_info_submitted", "add_address_info"]
  ),
  makeScenario(
    "add_shipping_info",
    "Shipping info submitted",
    "checkout",
    "shopify",
    "checkout_shipping_info_submitted",
    "add_shipping_info",
    ["checkout_shipping_info_submitted", "add_shipping_info"]
  ),
  makeScenario(
    "shipping_method_select",
    "Shipping method selected",
    "checkout",
    "custom",
    "custom:shipping_method_select",
    "add_shipping_info",
    ["shipping_method_select"]
  ),
  makeScenario(
    "add_payment_info",
    "Payment info submitted",
    "checkout",
    "shopify",
    "payment_info_submitted",
    "add_payment_info",
    ["payment_info_submitted", "add_payment_info"]
  ),
  makeScenario(
    "payment_method_select",
    "Payment method selected",
    "checkout",
    "custom",
    "custom:payment_method_select",
    "add_payment_info",
    ["payment_method_select"]
  ),
  makeScenario(
    "payment_failure",
    "Payment failed",
    "checkout",
    "custom",
    "custom:payment_failure",
    "ui_error",
    ["payment_failure", "payment_failed"]
  ),
  makeScenario(
    "checkout_error",
    "Checkout error surfaced",
    "checkout",
    "custom",
    "custom:checkout_error",
    "ui_error",
    ["checkout_error"]
  ),
  makeScenario(
    "express_checkout_click",
    "Express checkout selected",
    "checkout",
    "custom",
    "custom:express_checkout_click",
    "begin_checkout",
    ["express_checkout_click", "shop_pay_click", "gpay_click", "apple_pay_click"]
  ),
  makeScenario(
    "emi_select",
    "EMI or financing option selected",
    "checkout",
    "datalayer",
    "custom:emi_select",
    "add_payment_info",
    ["emi_select", "financing_select"]
  ),
  makeScenario(
    "tax_id_submit",
    "Tax ID submitted",
    "checkout",
    "custom",
    "custom:tax_id_submit",
    "custom_event",
    ["tax_id_submit", "gstin_submit"]
  ),
  makeScenario("purchase", "Purchase completed", "conversion", "shopify", "checkout_completed", "purchase", [
    "purchase",
    "checkout_completed"
  ]),
  makeScenario("refund", "Refund issued", "conversion", "ga4", "refund", "refund", [
    "refund",
    "partial_refund"
  ]),
  makeScenario(
    "cancel_order",
    "Order cancelled",
    "conversion",
    "custom",
    "custom:cancel_order",
    "cancel_order",
    ["cancel_order", "order_cancelled"]
  ),
  makeScenario(
    "return_request",
    "Return requested",
    "conversion",
    "custom",
    "custom:return_request",
    "return_request",
    ["return_request", "return_start"]
  ),
  makeScenario(
    "exchange_request",
    "Exchange requested",
    "conversion",
    "custom",
    "custom:exchange_request",
    "return_request",
    ["exchange_request"]
  ),
  makeScenario(
    "thank_you_page_view",
    "Thank you page viewed",
    "conversion",
    "custom",
    "custom:thank_you_page_view",
    "purchase",
    ["thank_you_page_view", "order_confirmation_view"]
  ),
  makeScenario(
    "order_tracking_view",
    "Order tracking viewed",
    "retention",
    "custom",
    "custom:order_tracking_view",
    "custom_event",
    ["order_tracking_view"]
  ),
  makeScenario(
    "invoice_download",
    "Invoice downloaded",
    "retention",
    "custom",
    "custom:invoice_download",
    "custom_event",
    ["invoice_download"]
  ),
  makeScenario(
    "reorder_click",
    "Reorder initiated",
    "retention",
    "custom",
    "custom:reorder_click",
    "add_to_cart",
    ["reorder_click", "buy_again_click"]
  ),
  makeScenario(
    "review_request_click",
    "Review request engaged",
    "retention",
    "custom",
    "custom:review_request_click",
    "custom_event",
    ["review_request_click"]
  ),
  makeScenario(
    "back_in_stock_subscribe",
    "Back-in-stock notification subscribed",
    "retention",
    "custom",
    "custom:back_in_stock_subscribe",
    "generate_lead",
    ["back_in_stock_subscribe", "notify_me_submit"]
  ),
  makeScenario(
    "wishlist_return",
    "Wishlist revisit session",
    "retention",
    "custom",
    "custom:wishlist_return",
    "custom_event",
    ["wishlist_return"]
  ),
  makeScenario(
    "subscription_plan_view",
    "Subscription plan viewed",
    "subscription",
    "custom",
    "custom:subscription_plan_view",
    "custom_event",
    ["subscription_plan_view"]
  ),
  makeScenario(
    "subscription_plan_select",
    "Subscription plan selected",
    "subscription",
    "custom",
    "custom:subscription_plan_select",
    "custom_event",
    ["subscription_plan_select"]
  ),
  makeScenario(
    "subscription_start",
    "Subscription started",
    "subscription",
    "custom",
    "custom:subscription_start",
    "subscription_start",
    ["subscription_start", "subscribe"]
  ),
  makeScenario(
    "subscription_trial_start",
    "Subscription trial started",
    "subscription",
    "custom",
    "custom:subscription_trial_start",
    "subscription_start",
    ["subscription_trial_start", "trial_start"]
  ),
  makeScenario(
    "subscription_trial_convert",
    "Subscription trial converted",
    "subscription",
    "custom",
    "custom:subscription_trial_convert",
    "subscription_renew",
    ["subscription_trial_convert"]
  ),
  makeScenario(
    "subscription_renew",
    "Subscription renewed",
    "subscription",
    "custom",
    "custom:subscription_renew",
    "subscription_renew",
    ["subscription_renew", "subscription_renewed"]
  ),
  makeScenario(
    "subscription_payment_failed",
    "Subscription payment failed",
    "subscription",
    "custom",
    "custom:subscription_payment_failed",
    "ui_error",
    ["subscription_payment_failed"]
  ),
  makeScenario(
    "subscription_pause",
    "Subscription paused",
    "subscription",
    "custom",
    "custom:subscription_pause",
    "subscription_pause",
    ["subscription_pause", "pause_subscription"]
  ),
  makeScenario(
    "subscription_resume",
    "Subscription resumed",
    "subscription",
    "custom",
    "custom:subscription_resume",
    "subscription_resume",
    ["subscription_resume", "resume_subscription"]
  ),
  makeScenario(
    "subscription_cancel",
    "Subscription cancelled",
    "subscription",
    "custom",
    "custom:subscription_cancel",
    "subscription_cancel",
    ["subscription_cancel", "cancel_subscription"]
  ),
  makeScenario(
    "subscription_reactivate",
    "Subscription reactivated",
    "subscription",
    "custom",
    "custom:subscription_reactivate",
    "subscription_resume",
    ["subscription_reactivate"]
  ),
  makeScenario(
    "skip_delivery",
    "Subscription delivery skipped",
    "subscription",
    "custom",
    "custom:skip_delivery",
    "custom_event",
    ["skip_delivery"]
  ),
  makeScenario(
    "swap_item",
    "Subscription item swapped",
    "subscription",
    "custom",
    "custom:swap_item",
    "custom_event",
    ["swap_item"]
  ),
  makeScenario(
    "membership_upgrade",
    "Membership upgraded",
    "subscription",
    "custom",
    "custom:membership_upgrade",
    "subscription_renew",
    ["membership_upgrade"]
  ),
  makeScenario(
    "membership_downgrade",
    "Membership downgraded",
    "subscription",
    "custom",
    "custom:membership_downgrade",
    "custom_event",
    ["membership_downgrade"]
  ),
  makeScenario(
    "loyalty_join",
    "Loyalty program joined",
    "retention",
    "custom",
    "custom:loyalty_join",
    "generate_lead",
    ["loyalty_join"]
  ),
  makeScenario(
    "points_earned",
    "Loyalty points earned",
    "retention",
    "custom",
    "custom:points_earned",
    "custom_event",
    ["points_earned"]
  ),
  makeScenario(
    "points_redeemed",
    "Loyalty points redeemed",
    "retention",
    "custom",
    "custom:points_redeemed",
    "custom_event",
    ["points_redeemed"]
  ),
  makeScenario(
    "reward_view",
    "Reward viewed",
    "retention",
    "custom",
    "custom:reward_view",
    "custom_event",
    ["reward_view"]
  ),
  makeScenario(
    "reward_redeem",
    "Reward redeemed",
    "retention",
    "custom",
    "custom:reward_redeem",
    "custom_event",
    ["reward_redeem"]
  ),
  makeScenario(
    "referral_share",
    "Referral shared",
    "retention",
    "custom",
    "custom:referral_share",
    "share",
    ["referral_share"]
  ),
  makeScenario(
    "referral_complete",
    "Referral completed",
    "retention",
    "custom",
    "custom:referral_complete",
    "generate_lead",
    ["referral_complete"]
  ),
  makeScenario(
    "winback_offer_view",
    "Winback offer viewed",
    "retention",
    "custom",
    "custom:winback_offer_view",
    "view_promotion",
    ["winback_offer_view"]
  ),
  makeScenario(
    "winback_offer_accept",
    "Winback offer accepted",
    "retention",
    "custom",
    "custom:winback_offer_accept",
    "select_promotion",
    ["winback_offer_accept"]
  ),
  makeScenario(
    "store_locator_view",
    "Store locator viewed",
    "support",
    "custom",
    "custom:store_locator_view",
    "support_contact",
    ["store_locator_view"]
  ),
  makeScenario(
    "store_locator_search",
    "Store locator searched",
    "support",
    "custom",
    "custom:store_locator_search",
    "support_contact",
    ["store_locator_search"]
  ),
  makeScenario(
    "contact_support_click",
    "Support CTA clicked",
    "support",
    "custom",
    "custom:contact_support_click",
    "support_contact",
    ["contact_support_click", "help_contact_click"]
  ),
  makeScenario(
    "live_chat_open",
    "Live chat opened",
    "support",
    "custom",
    "custom:live_chat_open",
    "support_contact",
    ["live_chat_open"]
  ),
  makeScenario(
    "faq_view",
    "FAQ article viewed",
    "support",
    "custom",
    "custom:faq_view",
    "support_contact",
    ["faq_view"]
  ),
  makeScenario(
    "appointment_booking",
    "Appointment booked",
    "support",
    "custom",
    "custom:appointment_booking",
    "generate_lead",
    ["appointment_booking", "consultation_booking"]
  ),
  makeScenario(
    "consent_update",
    "Consent state updated",
    "privacy",
    "custom",
    "custom:consent_update",
    "consent_update",
    ["consent_update", "privacy_update"]
  ),
  makeScenario(
    "privacy_banner_view",
    "Privacy banner viewed",
    "privacy",
    "custom",
    "custom:privacy_banner_view",
    "consent_update",
    ["privacy_banner_view"]
  ),
  makeScenario(
    "privacy_mode_false",
    "Privacy mode disabled event observed",
    "privacy",
    "datalayer",
    "custom:privacy-mode-false",
    "consent_update",
    ["privacy-mode-false"]
  ),
  makeScenario(
    "fides_ready",
    "Fides ready",
    "privacy",
    "datalayer",
    "custom:FidesReady",
    "consent_update",
    ["FidesReady"]
  ),
  makeScenario(
    "fides_initialized",
    "Fides initialized",
    "privacy",
    "datalayer",
    "custom:FidesInitialized",
    "consent_update",
    ["FidesInitialized"]
  ),
  makeScenario(
    "marketing_opt_in",
    "Marketing opt in",
    "privacy",
    "custom",
    "custom:marketing_opt_in",
    "consent_update",
    ["marketing_opt_in"]
  ),
  makeScenario(
    "marketing_opt_out",
    "Marketing opt out",
    "privacy",
    "custom",
    "custom:marketing_opt_out",
    "consent_update",
    ["marketing_opt_out"]
  ),
  makeScenario(
    "td_ssc_id_success",
    "Session or identity stitch success",
    "operational",
    "datalayer",
    "custom:td_ssc_id_success",
    "identify_customer",
    ["td_ssc_id_success"]
  ),
  makeScenario(
    "gtm_history_change",
    "History state changed",
    "operational",
    "datalayer",
    "custom:gtm.historyChange",
    "custom_event",
    ["gtm.historyChange"]
  ),
  makeScenario(
    "checkout_iframe_loaded",
    "Custom checkout iframe loaded",
    "operational",
    "custom",
    "custom:checkout_iframe_loaded",
    "custom_event",
    ["checkout_iframe_loaded", "iframe_checkout_loaded"]
  ),
  makeScenario(
    "checkout_iframe_error",
    "Custom checkout iframe errored",
    "operational",
    "custom",
    "custom:checkout_iframe_error",
    "ui_error",
    ["checkout_iframe_error", "iframe_checkout_error"]
  ),
  makeScenario(
    "alert_displayed",
    "Alert displayed",
    "operational",
    "shopify",
    "alert_displayed",
    "alert",
    ["alert_displayed"]
  ),
  makeScenario(
    "ui_extension_errored",
    "UI extension errored",
    "operational",
    "shopify",
    "ui_extension_errored",
    "ui_error",
    ["ui_extension_errored"]
  ),
  ...Array.from({ length: 40 }, (_, index) =>
    makeScenario(
      `custom_funnel_step_${index + 1}`,
      `Custom funnel step ${index + 1}`,
      "operational",
      "custom",
      `custom:custom_funnel_step_${index + 1}`,
      "custom_event",
      [`custom_funnel_step_${index + 1}`]
    )
  )
];

const SCENARIO_BY_ID = new Map(EVENT_SCENARIOS.map((scenario) => [scenario.id, scenario]));

export function getScenarioById(id: string) {
  return SCENARIO_BY_ID.get(id) ?? null;
}

export function scenarioSummary() {
  const byCategory = Object.entries(
    EVENT_SCENARIOS.reduce<Record<string, number>>((accumulator, scenario) => {
      accumulator[scenario.category] = (accumulator[scenario.category] ?? 0) + 1;
      return accumulator;
    }, {})
  )
    .map(([category, count]) => ({ category, count }))
    .sort((left, right) => left.category.localeCompare(right.category));

  return {
    total: EVENT_SCENARIOS.length,
    byCategory
  };
}
