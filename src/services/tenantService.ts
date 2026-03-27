import { Tenant } from '../models/Tenant';
import { normalizeDomain } from '../utils/hash';

/**
 * In-memory tenant registry.
 * In production, load from a database.
 */
const tenantRegistry = new Map<string, Tenant>();
const domainIndex = new Map<string, string>(); // domain -> tenantId

/**
 * Register a tenant in the registry.
 */
export function registerTenant(tenant: Tenant): void {
  tenantRegistry.set(tenant.id, tenant);
  for (const domain of [tenant.shopDomain, ...tenant.domains]) {
    domainIndex.set(normalizeDomain(domain), tenant.id);
  }
}

/**
 * Look up a tenant by ID.
 */
export function getTenantById(tenantId: string): Tenant | undefined {
  return tenantRegistry.get(tenantId);
}

/**
 * Look up a tenant by domain.
 */
export function getTenantByDomain(domain: string): Tenant | undefined {
  const normalized = normalizeDomain(domain);
  const tenantId = domainIndex.get(normalized);
  if (!tenantId) return undefined;
  return tenantRegistry.get(tenantId);
}

/**
 * List all registered tenants.
 */
export function listTenants(): Tenant[] {
  return Array.from(tenantRegistry.values());
}

/**
 * Clear all tenants (used in tests).
 */
export function clearTenantRegistry(): void {
  tenantRegistry.clear();
  domainIndex.clear();
}
