import { register } from "@shopify/web-pixels-extension";

const EVENT_TO_MARKET = {
  page_viewed: "page_viewed",
  collection_viewed: "collection_viewed",
  product_viewed: "product_viewed",
  search_submitted: "search_submitted",
  cart_viewed: "cart_viewed",
  product_added_to_cart: "product_added_to_cart",
  product_removed_from_cart: "product_removed_from_cart",
  checkout_started: "checkout_started",
  checkout_contact_info_submitted: "checkout_contact_info_submitted",
  checkout_address_info_submitted: "checkout_address_info_submitted",
  checkout_shipping_info_submitted: "checkout_shipping_info_submitted",
  payment_info_submitted: "payment_info_submitted",
  checkout_completed: "checkout_completed",
  alert_displayed: "alert_displayed",
  ui_extension_errored: "ui_extension_errored"
};

register(({ analytics, browser, init, customerPrivacy, settings }) => {
  let privacy = init.customerPrivacy;

  customerPrivacy.subscribe("visitorConsentCollected", (event) => {
    privacy = event.customerPrivacy;
  });

  Object.keys(EVENT_TO_MARKET).forEach((eventName) => {
    analytics.subscribe(eventName, async (event) => {
      if (!privacy.analyticsProcessingAllowed) {
        return;
      }

      await browser.sendBeacon(
        "/apps/adtrace",
        JSON.stringify(buildPayload(eventName, event, init, privacy, settings))
      );
    });
  });

  analytics.subscribe("all_custom_events", async (event) => {
    if (!privacy.analyticsProcessingAllowed) {
      return;
    }

    const customEventName =
      event?.customData?.name || event?.name || event?.type || "custom:merchant_event";

    await browser.sendBeacon(
      "/apps/adtrace",
      JSON.stringify(buildPayload(`custom:${customEventName}`, event, init, privacy, settings))
    );
  });
});

function buildPayload(eventName, event, init, privacy, settings) {
  const payload = event?.data || event?.customData || {};
  const cart = payload.cart || payload.checkout?.cart || {};
  const checkout = payload.checkout || {};
  const order = payload.order || checkout.order || {};
  const moneyBag =
    payload.totalPrice ||
    order.totalPrice ||
    checkout.totalPrice ||
    payload.cartLine?.cost?.totalAmount ||
    {};
  const currency =
    moneyBag.currencyCode ||
    order.currencyCode ||
    checkout.currencyCode ||
    settings.currencyCode ||
    "USD";

  return {
    shopDomain: settings.shopDomain || init.shop?.myshopifyDomain || init.context.document.location.hostname,
    eventName,
    source: "browser",
    occurredAt: new Date().toISOString(),
    market: {
      countryCode: (settings.countryCode || init.context.navigator.language.slice(-2)).toUpperCase(),
      currencyCode: currency,
      marketId: settings.marketId,
      domain: init.context.document.location.hostname
    },
    user: {
      anonymousId: init.clientId
    },
    commerce: {
      cartId: cart.id || cart.token,
      checkoutId: checkout.id || checkout.token,
      orderId: order.id || order.name,
      value: numericAmount(moneyBag.amount),
      currency,
      subtotal: numericAmount(payload.subtotalPrice?.amount || checkout.subtotalPrice?.amount),
      discount: numericAmount(payload.totalDiscounts?.amount || checkout.totalDiscounts?.amount),
      shipping: numericAmount(checkout.shippingLine?.price?.amount),
      tax: numericAmount(checkout.totalTax?.amount)
    },
    lineItems: extractLineItems(payload, currency),
    consent: {
      analytics: privacy.analyticsProcessingAllowed,
      marketing: privacy.marketingAllowed,
      preferences: privacy.preferencesProcessingAllowed,
      saleOfData: privacy.saleOfDataAllowed
    },
    properties: payload,
    page: {
      url: init.context.document.location.href,
      referrer: init.context.document.referrer || undefined
    }
  };
}

function extractLineItems(payload, currency) {
  const candidates =
    payload.cart?.lines ||
    payload.checkout?.lineItems ||
    payload.items ||
    (payload.cartLine ? [payload.cartLine] : []) ||
    (payload.productVariant ? [{ merchandise: payload.productVariant, quantity: 1 }] : []);

  return (candidates || []).map((item) => {
    const merchandise = item.merchandise || item.productVariant || item.variant || {};
    const product = merchandise.product || item.product || {};

    return {
      productId: product.id || item.productId,
      variantId: merchandise.id || item.variantId,
      sku: merchandise.sku || item.sku,
      title: product.title || merchandise.title || item.title,
      quantity: item.quantity,
      price: numericAmount(item.cost?.totalAmount?.amount || merchandise.price?.amount || item.price),
      currency
    };
  });
}

function numericAmount(value) {
  if (value == null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
