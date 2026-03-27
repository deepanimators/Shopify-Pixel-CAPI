import { generateDeduplicationKey } from '../utils/hash';

/**
 * In-memory deduplication store.
 * In production replace with Redis with TTL.
 */
const seen = new Map<string, number>();
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Returns true if the event has already been seen (duplicate).
 * Records the event if it is new.
 */
export function isDuplicate(
  tenantId: string,
  eventName: string,
  eventId: string
): boolean {
  const key = generateDeduplicationKey(tenantId, eventName, eventId);
  const now = Date.now();

  // Purge expired entries periodically
  if (seen.size > 10_000) {
    for (const [k, ts] of seen.entries()) {
      if (now - ts > TTL_MS) seen.delete(k);
    }
  }

  if (seen.has(key)) {
    const ts = seen.get(key)!;
    if (now - ts < TTL_MS) {
      return true;
    }
  }

  seen.set(key, now);
  return false;
}

/**
 * Clear the deduplication store (used in tests).
 */
export function clearDeduplicationStore(): void {
  seen.clear();
}
