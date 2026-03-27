import crypto from 'crypto';

/**
 * Hash a string value using SHA-256 (required by Meta CAPI for PII fields).
 */
export function hashValue(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex');
}

/**
 * Hash a value if it is not already hashed (64-char hex).
 */
export function hashIfNeeded(value: string): string {
  if (/^[a-f0-9]{64}$/i.test(value)) {
    return value;
  }
  return hashValue(value);
}

/**
 * Generate a SHA-256 based event deduplication key.
 */
export function generateDeduplicationKey(
  tenantId: string,
  eventName: string,
  eventId: string
): string {
  return crypto
    .createHash('sha256')
    .update(`${tenantId}:${eventName}:${eventId}`)
    .digest('hex');
}

/**
 * Normalize a domain string (strip protocol, www, trailing slash).
 */
export function normalizeDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

/**
 * Generate a UUID v4 using Node.js built-in crypto.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
