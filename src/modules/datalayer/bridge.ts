import type { IncomingEvent } from "../events/types.js";

type DataLayerObject = Record<string, unknown>;
type DataLayerEntry = DataLayerObject | unknown[];

export interface DataLayerBridgeContext {
  anonymousId?: string;
  countryCode?: string;
  currencyCode?: string;
  pageUrl: string;
  referrer?: string;
  shopDomain?: string;
}

export interface NormalizedDataLayerEvent {
  event: IncomingEvent;
  rawEventName: string;
}

interface BridgeState {
  checkoutId?: string;
  checkoutInitiationPageHref?: string;
  sessionId?: string;
  shopDomain?: string;
}

const TRACKED_EVENT_MAP: Record<string, IncomingEvent["eventName"]> = {
  begin_checkout: "checkout_started",
  add_shipping_info: "checkout_shipping_info_submitted",
  add_payment_info: "payment_info_submitted",
  purchase: "checkout_completed",
  "remove-from-cart": "product_removed_from_cart",
  "product-impression": "custom:product-impression",
  "gtm.historyChange": "custom:gtm.historyChange",
  td_ssc_id_success: "custom:td_ssc_id_success",
  "privacy-mode-false": "custom:privacy-mode-false",
  FidesReady: "custom:FidesReady",
  FidesInitialized: "custom:FidesInitialized"
};

export class DataLayerBridge {
  private readonly state: BridgeState = {};

  normalize(entry: DataLayerEntry, context: DataLayerBridgeContext): NormalizedDataLayerEvent | null {
    const candidate = toNamedPayload(entry);
    if (!candidate) {
      return null;
    }

    const mappedEventName = TRACKED_EVENT_MAP[candidate.rawEventName];
    if (!mappedEventName) {
      return null;
    }

    if (candidate.rawEventName === "gtm.historyChange") {
      this.captureHistoryState(candidate.payload);
    }

    const atomsState = extractAtomsState(candidate.payload);
    if (atomsState) {
      this.captureAtomsState(atomsState);
    }

    const pageUrl = getString(candidate.payload, "gtm.newUrl") ?? context.pageUrl;
    const marketCountry =
      getString(candidate.payload, "user_data.address.country") ??
      getString(candidate.payload, "country") ??
      context.countryCode ??
      inferCountryCode(pageUrl) ??
      "US";
    const marketCurrency =
      getString(candidate.payload, "currency") ??
      getString(candidate.payload, "ecommerce.currencyCode") ??
      context.currencyCode ??
      "USD";
    const shopDomain =
      this.state.shopDomain ??
      extractShopDomain(getString(candidate.payload, "shopUrl")) ??
      context.shopDomain ??
      extractShopDomain(pageUrl) ??
      "";
    const lineItems = extractItems(candidate.rawEventName, candidate.payload, marketCurrency);
    const userData = getObject(candidate.payload, "user_data");
    const value = resolveValue(candidate.rawEventName, candidate.payload, lineItems);

    const event: IncomingEvent = {
      shopDomain,
      eventName: mappedEventName,
      source: "browser",
      occurredAt:
        getString(candidate.payload, "breeze_event_time") ??
        getString(candidate.payload, "event_time") ??
        new Date().toISOString(),
      market: {
        countryCode: marketCountry.toUpperCase(),
        currencyCode: marketCurrency.toUpperCase(),
        domain: extractShopDomain(pageUrl) ?? undefined
      },
      user: {
        anonymousId: context.anonymousId,
        email: getString(userData, "email"),
        phone: normalizePhone(getString(userData, "phone_number"))
      },
      commerce: {
        cartId:
          getString(candidate.payload, "cart_id") ??
          getString(candidate.payload, "ecommerce.cart.id"),
        checkoutId: this.state.checkoutId,
        orderId: getString(candidate.payload, "transaction_id"),
        value,
        currency: marketCurrency.toUpperCase(),
        shipping: getNumber(candidate.payload, "shipping"),
        tax: getNumber(candidate.payload, "tax")
      },
      lineItems,
      properties: {
        ...candidate.payload,
        rawEventName: candidate.rawEventName,
        breezeEventType: getString(candidate.payload, "breeze_event_type"),
        checkoutInitiationPageHref: this.state.checkoutInitiationPageHref,
        sessionId: this.state.sessionId,
        atomsState
      },
      page: {
        url: pageUrl,
        referrer: context.referrer
      }
    };

    return {
      event,
      rawEventName: candidate.rawEventName
    };
  }

  private captureHistoryState(payload: DataLayerObject) {
    const atomsState = extractAtomsState(payload);
    if (atomsState) {
      this.captureAtomsState(atomsState);
    }
  }

  private captureAtomsState(atomsState: DataLayerObject) {
    this.state.checkoutId = getString(atomsState, "checkoutId") ?? this.state.checkoutId;
    this.state.sessionId = getString(atomsState, "sessionId") ?? this.state.sessionId;
    this.state.checkoutInitiationPageHref =
      getString(atomsState, "checkoutInitiationPageHref") ?? this.state.checkoutInitiationPageHref;
    this.state.shopDomain =
      extractShopDomain(getString(atomsState, "shopUrl")) ?? this.state.shopDomain;
  }
}

function toNamedPayload(entry: DataLayerEntry): { rawEventName: string; payload: DataLayerObject } | null {
  if (Array.isArray(entry)) {
    if (entry[0] === "event" && typeof entry[1] === "string") {
      return {
        rawEventName: entry[1],
        payload: isRecord(entry[2]) ? entry[2] : {}
      };
    }

    return null;
  }

  if (!isRecord(entry) || typeof entry.event !== "string") {
    return null;
  }

  return {
    rawEventName: entry.event,
    payload: entry
  };
}

function extractItems(rawEventName: string, payload: DataLayerObject, currency: string) {
  const candidates =
    getArray(payload, "items") ??
    getArray(payload, "ecommerce.impressions") ??
    getArray(payload, "ecommerce.remove.products") ??
    [];

  const items = candidates
    .filter(isRecord)
    .map((item) => ({
      productId: getString(item, "id"),
      variantId: getString(item, "variant"),
      sku: getString(item, "sku"),
      title: getString(item, "name"),
      quantity: getNumber(item, "quantity"),
      price: getNumber(item, "price"),
      currency
    }));

  if (items.length > 0) {
    return items;
  }

  if (rawEventName === "product-impression") {
    return [];
  }

  return undefined;
}

function resolveValue(rawEventName: string, payload: DataLayerObject, items?: IncomingEvent["lineItems"]) {
  const directValue =
    getNumber(payload, "value") ??
    getNumber(payload, "total") ??
    getNumber(payload, "ecomm_totalvalue") ??
    getNumber(payload, "google_analysis_params.totalPriceValue") ??
    getNumber(payload, "google_analysis_params.lineItemValue");

  if (rawEventName === "purchase" && (directValue == null || directValue === 0)) {
    const itemsTotal = items?.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);
    return itemsTotal && itemsTotal > 0 ? itemsTotal : directValue;
  }

  return directValue;
}

export function extractAtomsState(payload: DataLayerObject) {
  const urlValue =
    getString(payload, "gtm.newUrl") ??
    getString(payload, "gtm.newHistoryState.path") ??
    getString(payload, "gtm.oldUrl");

  if (!urlValue) {
    return null;
  }

  try {
    const url = new URL(urlValue);
    const encoded = url.searchParams.get("atomsSt");
    if (!encoded) {
      return null;
    }

    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    const decoded = Buffer.from(normalized + padding, "base64").toString("utf8");

    return JSON.parse(decoded) as DataLayerObject;
  } catch {
    return null;
  }
}

function inferCountryCode(urlValue: string) {
  try {
    const host = new URL(urlValue).hostname.toLowerCase();
    if (host.endsWith(".in")) {
      return "IN";
    }
    if (host.endsWith(".uk") || host.endsWith(".co.uk")) {
      return "GB";
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function extractShopDomain(urlValue?: string | null) {
  if (!urlValue) {
    return undefined;
  }

  try {
    return new URL(urlValue).hostname.toLowerCase();
  } catch {
    return urlValue.toLowerCase();
  }
}

function normalizePhone(phone?: string) {
  if (!phone) {
    return undefined;
  }

  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized || undefined;
}

function getArray(source: unknown, path: string) {
  const value = getValue(source, path);
  return Array.isArray(value) ? value : undefined;
}

function getObject(source: unknown, path: string) {
  const value = getValue(source, path);
  return isRecord(value) ? value : undefined;
}

function getString(source: unknown, path: string) {
  const value = getValue(source, path);
  return typeof value === "string" ? value : undefined;
}

function getNumber(source: unknown, path: string) {
  const value = getValue(source, path);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").replace(/\.00$/, "").replace(/(?<=\d)\.(?=\d{3}\b)/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getValue(source: unknown, path: string): unknown {
  const segments = path.split(".");
  let current: unknown = source;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];

    if (Array.isArray(current) && /^\d+$/.test(segment)) {
      current = current[Number(segment)];
      continue;
    }

    if (!isRecord(current)) {
      return undefined;
    }

    const remainingPath = segments.slice(index).join(".");
    if (remainingPath in current) {
      return current[remainingPath];
    }

    current = current[segment];
  }

  return current;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
