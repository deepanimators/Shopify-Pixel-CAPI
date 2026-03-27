import { EventPayload, EnrichedEvent } from '../models/Event';
import { resolveIdentity } from './identityService';
import { isDuplicate } from './deduplicationService';
import { getTenantById } from './tenantService';
import { sendToMetaCAPI } from './metaCapiService';
import { normalizeDomain } from '../utils/hash';

export interface ProcessEventResult {
  success: boolean;
  deduplicated: boolean;
  resolvedUserId?: string;
  error?: string;
}

/**
 * Process an incoming event:
 * 1. Validate tenant
 * 2. Check deduplication
 * 3. Resolve identity
 * 4. Enrich with market/domain context
 * 5. Forward to Meta CAPI
 */
export async function processEvent(
  payload: EventPayload
): Promise<ProcessEventResult> {
  const tenant = getTenantById(payload.tenantId);
  if (!tenant) {
    return { success: false, deduplicated: false, error: 'Unknown tenant' };
  }

  if (!tenant.enabled) {
    return { success: false, deduplicated: false, error: 'Tenant disabled' };
  }

  const duplicate = isDuplicate(
    payload.tenantId,
    payload.eventName,
    payload.eventId
  );

  if (duplicate) {
    return { success: true, deduplicated: true };
  }

  const normalizedDomain = normalizeDomain(payload.domain);
  const resolvedUserId = resolveIdentity(payload.userData, normalizedDomain);

  const enriched: EnrichedEvent = {
    ...payload,
    processedAt: new Date(),
    deduplicated: false,
    identityResolved: true,
    resolvedUserId,
  };

  if (tenant.metaPixelId && tenant.metaAccessToken) {
    await sendToMetaCAPI(
      enriched,
      tenant.metaPixelId,
      tenant.metaAccessToken,
      tenant.testEventCode
    );
  }

  return { success: true, deduplicated: false, resolvedUserId };
}
