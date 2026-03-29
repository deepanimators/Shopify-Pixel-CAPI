(function () {
  if (typeof window === "undefined") {
    return;
  }

  var config = window.AdTraceThemeBridgeConfig || {};
  var state = {
    checkoutId: null,
    checkoutInitiationPageHref: null,
    sessionId: null,
    shopDomain: config.shopDomain || null
  };
  var trackedEvents = {
    "begin_checkout": "checkout_started",
    "add_shipping_info": "checkout_shipping_info_submitted",
    "add_payment_info": "payment_info_submitted",
    "purchase": "checkout_completed",
    "remove-from-cart": "product_removed_from_cart",
    "product-impression": "custom:product-impression",
    "gtm.historyChange": "custom:gtm.historyChange",
    "td_ssc_id_success": "custom:td_ssc_id_success",
    "privacy-mode-false": "custom:privacy-mode-false",
    "FidesReady": "custom:FidesReady",
    "FidesInitialized": "custom:FidesInitialized"
  };
  var appProxyPath = config.appProxyPath || "/apps/adtrace";

  function send(normalized) {
    if (!normalized || !normalized.shopDomain) {
      return;
    }

    var payload = JSON.stringify(normalized);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(appProxyPath, payload);
      return;
    }

    fetch(appProxyPath, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: payload,
      keepalive: true
    }).catch(function () {});
  }

  function normalize(entry) {
    var named = toNamedPayload(entry);
    if (!named || !trackedEvents[named.rawEventName]) {
      return null;
    }

    if (named.rawEventName === "gtm.historyChange") {
      captureAtomsState(extractAtomsState(named.payload));
    }

    var atomsState = extractAtomsState(named.payload);
    captureAtomsState(atomsState);

    var pageUrl = getString(named.payload, "gtm.newUrl") || window.location.href;
    var userData = getObject(named.payload, "user_data") || {};
    var currency =
      getString(named.payload, "currency") ||
      getString(named.payload, "ecommerce.currencyCode") ||
      config.currencyCode ||
      "USD";
    var items = extractItems(named.payload, currency);
    var normalized = {
      shopDomain: state.shopDomain || config.shopDomain || window.location.hostname,
      eventName: trackedEvents[named.rawEventName],
      source: "browser",
      occurredAt: getString(named.payload, "breeze_event_time") || new Date().toISOString(),
      market: {
        countryCode: (
          getString(userData, "address.country") ||
          config.countryCode ||
          inferCountryCode(window.location.hostname) ||
          "US"
        ).toUpperCase(),
        currencyCode: currency.toUpperCase(),
        domain: window.location.hostname
      },
      user: {
        anonymousId: config.anonymousId || undefined,
        email: getString(userData, "email"),
        phone: normalizePhone(getString(userData, "phone_number"))
      },
      commerce: {
        checkoutId: state.checkoutId || undefined,
        orderId: getString(named.payload, "transaction_id"),
        value: resolveValue(named.rawEventName, named.payload, items),
        currency: currency.toUpperCase(),
        shipping: getNumber(named.payload, "shipping"),
        tax: getNumber(named.payload, "tax")
      },
      lineItems: items,
      properties: Object.assign({}, named.payload, {
        rawEventName: named.rawEventName,
        sessionId: state.sessionId,
        checkoutInitiationPageHref: state.checkoutInitiationPageHref
      }),
      page: {
        url: pageUrl,
        referrer: document.referrer || undefined
      }
    };

    return normalized;
  }

  function handleEntry(entry) {
    send(normalize(entry));
  }

  function patchDataLayer() {
    var dataLayer = window.dataLayer = window.dataLayer || [];
    var originalPush = dataLayer.push.bind(dataLayer);

    dataLayer.forEach(handleEntry);

    dataLayer.push = function () {
      for (var index = 0; index < arguments.length; index += 1) {
        handleEntry(arguments[index]);
      }
      return originalPush.apply(dataLayer, arguments);
    };
  }

  function patchGtag() {
    var originalGtag = typeof window.gtag === "function" ? window.gtag : null;
    window.gtag = function () {
      var args = Array.prototype.slice.call(arguments);
      handleEntry(args);
      if (originalGtag) {
        return originalGtag.apply(window, args);
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    };
  }

  function toNamedPayload(entry) {
    if (Array.isArray(entry) && entry[0] === "event" && typeof entry[1] === "string") {
      return {
        rawEventName: entry[1],
        payload: isRecord(entry[2]) ? entry[2] : {}
      };
    }

    if (isRecord(entry) && typeof entry.event === "string") {
      return {
        rawEventName: entry.event,
        payload: entry
      };
    }

    return null;
  }

  function extractAtomsState(payload) {
    var urlValue =
      getString(payload, "gtm.newUrl") ||
      getString(payload, "gtm.newHistoryState.path") ||
      getString(payload, "gtm.oldUrl");

    if (!urlValue) {
      return null;
    }

    try {
      var url = new URL(urlValue);
      var encoded = url.searchParams.get("atomsSt");
      if (!encoded) {
        return null;
      }

      var normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
      var padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
      return JSON.parse(atob(normalized + padding));
    } catch (_error) {
      return null;
    }
  }

  function captureAtomsState(atomsState) {
    if (!atomsState || !isRecord(atomsState)) {
      return;
    }

    state.checkoutId = getString(atomsState, "checkoutId") || state.checkoutId;
    state.sessionId = getString(atomsState, "sessionId") || state.sessionId;
    state.checkoutInitiationPageHref =
      getString(atomsState, "checkoutInitiationPageHref") || state.checkoutInitiationPageHref;
    state.shopDomain = extractHost(getString(atomsState, "shopUrl")) || state.shopDomain;
  }

  function extractItems(payload, currency) {
    var items =
      getArray(payload, "items") ||
      getArray(payload, "ecommerce.impressions") ||
      getArray(payload, "ecommerce.remove.products") ||
      [];

    return items.filter(isRecord).map(function (item) {
      return {
        productId: getString(item, "id"),
        variantId: getString(item, "variant"),
        sku: getString(item, "sku"),
        title: getString(item, "name"),
        quantity: getNumber(item, "quantity"),
        price: getNumber(item, "price"),
        currency: currency
      };
    });
  }

  function resolveValue(rawEventName, payload, items) {
    var directValue =
      getNumber(payload, "value") ||
      getNumber(payload, "total") ||
      getNumber(payload, "ecomm_totalvalue") ||
      getNumber(payload, "google_analysis_params.totalPriceValue") ||
      getNumber(payload, "google_analysis_params.lineItemValue");

    if (rawEventName === "purchase" && (!directValue || directValue === 0) && Array.isArray(items)) {
      return items.reduce(function (sum, item) {
        return sum + ((item.price || 0) * (item.quantity || 1));
      }, 0);
    }

    return directValue;
  }

  function inferCountryCode(host) {
    if (host.indexOf(".in") !== -1) {
      return "IN";
    }
    if (host.indexOf(".uk") !== -1) {
      return "GB";
    }
    return null;
  }

  function normalizePhone(value) {
    if (!value) {
      return undefined;
    }
    return value.replace(/[^\d+]/g, "") || undefined;
  }

  function extractHost(urlValue) {
    if (!urlValue) {
      return null;
    }
    try {
      return new URL(urlValue).hostname.toLowerCase();
    } catch (_error) {
      return String(urlValue).toLowerCase();
    }
  }

  function getValue(source, path) {
    var segments = path.split(".");
    var current = source;

    for (var index = 0; index < segments.length; index += 1) {
      var segment = segments[index];
      if (Array.isArray(current) && /^\d+$/.test(segment)) {
        current = current[Number(segment)];
        continue;
      }
      if (!isRecord(current)) {
        return undefined;
      }
      var remainingPath = segments.slice(index).join(".");
      if (Object.prototype.hasOwnProperty.call(current, remainingPath)) {
        return current[remainingPath];
      }
      current = current[segment];
    }

    return current;
  }

  function getArray(source, path) {
    var value = getValue(source, path);
    return Array.isArray(value) ? value : undefined;
  }

  function getObject(source, path) {
    var value = getValue(source, path);
    return isRecord(value) ? value : undefined;
  }

  function getString(source, path) {
    var value = getValue(source, path);
    return typeof value === "string" ? value : undefined;
  }

  function getNumber(source, path) {
    var value = getValue(source, path);
    if (typeof value === "number" && isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      var cleaned = value.replace(/,/g, "").replace(/(?<=\d)\.(?=\d{3}\b)/g, "");
      var parsed = Number(cleaned);
      return isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  patchDataLayer();
  patchGtag();
})();
