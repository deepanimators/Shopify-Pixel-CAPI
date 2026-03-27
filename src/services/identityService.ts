import { IdentityRecord } from '../models/Identity';
import { UserData } from '../models/Event';
import { generateUUID } from '../utils/hash';

/**
 * In-memory identity store for cross-domain user identity resolution.
 * In production, replace with a persistent store (Redis / database).
 */
const identityStore = new Map<string, IdentityRecord>();

/**
 * Index maps to find users by their known identifiers.
 */
const emailIndex = new Map<string, string>();
const phoneIndex = new Map<string, string>();
const externalIdIndex = new Map<string, string>();
const fbpIndex = new Map<string, string>();

function lookupUserId(userData: UserData): string | undefined {
  if (userData.externalId) {
    const id = externalIdIndex.get(userData.externalId);
    if (id) return id;
  }
  if (userData.email) {
    const id = emailIndex.get(userData.email.toLowerCase());
    if (id) return id;
  }
  if (userData.phone) {
    const id = phoneIndex.get(userData.phone);
    if (id) return id;
  }
  if (userData.fbp) {
    const id = fbpIndex.get(userData.fbp);
    if (id) return id;
  }
  return undefined;
}

function updateIndexes(userId: string, record: IdentityRecord): void {
  for (const email of record.emails) {
    emailIndex.set(email, userId);
  }
  for (const phone of record.phones) {
    phoneIndex.set(phone, userId);
  }
  for (const extId of record.externalIds) {
    externalIdIndex.set(extId, userId);
  }
  for (const fbp of record.fbps) {
    fbpIndex.set(fbp, userId);
  }
}

/**
 * Resolve a user identity from event user data.
 * Returns the resolved (existing or new) userId.
 */
export function resolveIdentity(userData: UserData, domain: string): string {
  const existingId = lookupUserId(userData);

  if (existingId) {
    const record = identityStore.get(existingId)!;
    mergeUserData(record, userData, domain);
    record.lastSeen = new Date();
    updateIndexes(existingId, record);
    return existingId;
  }

  const userId = generateUUID();
  const now = new Date();
  const record: IdentityRecord = {
    userId,
    emails: userData.email ? [userData.email.toLowerCase()] : [],
    phones: userData.phone ? [userData.phone] : [],
    externalIds: userData.externalId ? [userData.externalId] : [],
    domains: [domain],
    fbps: userData.fbp ? [userData.fbp] : [],
    fbcs: userData.fbc ? [userData.fbc] : [],
    lastSeen: now,
    createdAt: now,
  };

  identityStore.set(userId, record);
  updateIndexes(userId, record);
  return userId;
}

function mergeUserData(
  record: IdentityRecord,
  userData: UserData,
  domain: string
): void {
  if (userData.email) {
    const email = userData.email.toLowerCase();
    if (!record.emails.includes(email)) record.emails.push(email);
  }
  if (userData.phone && !record.phones.includes(userData.phone)) {
    record.phones.push(userData.phone);
  }
  if (
    userData.externalId &&
    !record.externalIds.includes(userData.externalId)
  ) {
    record.externalIds.push(userData.externalId);
  }
  if (!record.domains.includes(domain)) {
    record.domains.push(domain);
  }
  if (userData.fbp && !record.fbps.includes(userData.fbp)) {
    record.fbps.push(userData.fbp);
  }
  if (userData.fbc && !record.fbcs.includes(userData.fbc)) {
    record.fbcs.push(userData.fbc);
  }
}

/**
 * Retrieve a stored identity record by userId.
 */
export function getIdentityRecord(userId: string): IdentityRecord | undefined {
  return identityStore.get(userId);
}

/**
 * Clear all stored identity data (used in tests).
 */
export function clearIdentityStore(): void {
  identityStore.clear();
  emailIndex.clear();
  phoneIndex.clear();
  externalIdIndex.clear();
  fbpIndex.clear();
}
