export type EventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

export interface MarketContext {
  country?: string;
  currency?: string;
  marketId?: string;
  locale?: string;
}

export interface UserData {
  externalId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
}

export interface ProductData {
  id: string;
  title?: string;
  price?: number;
  currency?: string;
  quantity?: number;
  category?: string;
}

export interface EventPayload {
  eventName: EventName;
  eventId: string;
  eventSourceUrl: string;
  eventTime: number;
  tenantId: string;
  domain: string;
  userData: UserData;
  market?: MarketContext;
  products?: ProductData[];
  orderValue?: number;
  currency?: string;
  orderId?: string;
}

export interface EnrichedEvent extends EventPayload {
  processedAt: Date;
  deduplicated: boolean;
  identityResolved: boolean;
  resolvedUserId?: string;
}
