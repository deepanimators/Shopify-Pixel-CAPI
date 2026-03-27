import axios from 'axios';
import { EnrichedEvent } from '../models/Event';
import { hashIfNeeded } from '../utils/hash';

const META_CAPI_VERSION =
  process.env.META_CAPI_VERSION ?? 'v19.0';
const META_CAPI_URL =
  `https://graph.facebook.com/${META_CAPI_VERSION}/{pixelId}/events`;

interface MetaUserData {
  em?: string[];
  ph?: string[];
  external_id?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;
  fbp?: string;
  ct?: string[];
  st?: string[];
  zp?: string[];
  country?: string[];
  fn?: string[];
  ln?: string[];
}

interface MetaCustomData {
  value?: number;
  currency?: string;
  order_id?: string;
  contents?: Array<{
    id: string;
    quantity?: number;
    item_price?: number;
    title?: string;
  }>;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
}

interface MetaEvent {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: 'website';
  user_data: MetaUserData;
  custom_data?: MetaCustomData;
}

interface MetaCAPIPayload {
  data: MetaEvent[];
  test_event_code?: string;
}

function buildMetaUserData(event: EnrichedEvent): MetaUserData {
  const ud = event.userData;
  const metaUserData: MetaUserData = {};

  if (ud.email) metaUserData.em = [hashIfNeeded(ud.email)];
  if (ud.phone) metaUserData.ph = [hashIfNeeded(ud.phone)];

  const externalIds: string[] = [];
  if (ud.externalId) externalIds.push(hashIfNeeded(ud.externalId));
  if (event.resolvedUserId) externalIds.push(hashIfNeeded(event.resolvedUserId));
  if (externalIds.length > 0) metaUserData.external_id = externalIds;

  if (ud.clientIpAddress) metaUserData.client_ip_address = ud.clientIpAddress;
  if (ud.clientUserAgent) metaUserData.client_user_agent = ud.clientUserAgent;
  if (ud.fbp) metaUserData.fbp = ud.fbp;
  if (ud.fbc) metaUserData.fbc = ud.fbc;
  if (ud.city) metaUserData.ct = [hashIfNeeded(ud.city)];
  if (ud.state) metaUserData.st = [hashIfNeeded(ud.state)];
  if (ud.zip) metaUserData.zp = [hashIfNeeded(ud.zip)];
  if (ud.country) metaUserData.country = [hashIfNeeded(ud.country)];
  if (ud.firstName) metaUserData.fn = [hashIfNeeded(ud.firstName)];
  if (ud.lastName) metaUserData.ln = [hashIfNeeded(ud.lastName)];

  return metaUserData;
}

function buildCustomData(event: EnrichedEvent): MetaCustomData | undefined {
  const custom: MetaCustomData = {};

  if (event.orderValue != null) custom.value = event.orderValue;
  if (event.currency) custom.currency = event.currency;
  if (event.orderId) custom.order_id = event.orderId;

  if (event.products && event.products.length > 0) {
    custom.contents = event.products.map((p) => ({
      id: p.id,
      quantity: p.quantity,
      item_price: p.price,
      title: p.title,
    }));
    custom.content_ids = event.products.map((p) => p.id);
    custom.content_type = 'product';
    custom.num_items = event.products.reduce(
      (sum, p) => sum + (p.quantity ?? 1),
      0
    );
  }

  return Object.keys(custom).length > 0 ? custom : undefined;
}

/**
 * Send a single enriched event to Meta Conversions API.
 */
export async function sendToMetaCAPI(
  event: EnrichedEvent,
  pixelId: string,
  accessToken: string,
  testEventCode?: string
): Promise<void> {
  const metaEvent: MetaEvent = {
    event_name: event.eventName,
    event_time: event.eventTime,
    event_id: event.eventId,
    event_source_url: event.eventSourceUrl,
    action_source: 'website',
    user_data: buildMetaUserData(event),
  };

  const customData = buildCustomData(event);
  if (customData) metaEvent.custom_data = customData;

  const payload: MetaCAPIPayload = { data: [metaEvent] };
  if (testEventCode) payload.test_event_code = testEventCode;

  const url = META_CAPI_URL.replace('{pixelId}', pixelId);

  await axios.post(url, payload, {
    params: { access_token: accessToken },
    headers: { 'Content-Type': 'application/json' },
    timeout: 10_000,
  });
}
