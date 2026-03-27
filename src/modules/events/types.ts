export type EventName =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase";

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
}

export interface PageContext {
  url: string;
  referrer?: string;
}

export interface IncomingEvent {
  tenantId: string;
  shopDomain: string;
  eventName: EventName;
  source: EventSource;
  eventId?: string;
  browserEventId?: string;
  occurredAt?: string;
  market: MarketContext;
  user: UserContext;
  commerce?: CommerceContext;
  page: PageContext;
}

export interface ResolvedIdentity {
  identityKey: string;
  matchedOn: string[];
}

export interface NormalizedEvent extends IncomingEvent {
  eventId: string;
  occurredAt: string;
  dedupeKey: string;
  identity: ResolvedIdentity;
  deliveredToMeta: boolean;
}

export interface IngestResult {
  event: NormalizedEvent;
  duplicate: boolean;
}
