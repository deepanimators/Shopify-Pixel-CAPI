import {
  registerTenant,
  getTenantById,
  getTenantByDomain,
  listTenants,
  clearTenantRegistry,
} from '../tenantService';
import { Tenant } from '../../models/Tenant';

const sampleTenant: Tenant = {
  id: 'tenant-abc',
  shopDomain: 'mystore.myshopify.com',
  domains: ['mystore.com', 'mystore.co.uk'],
  metaPixelId: '123456789',
  metaAccessToken: 'secret-token',
  enabled: true,
  createdAt: new Date(),
};

describe('tenantService', () => {
  beforeEach(() => {
    clearTenantRegistry();
  });

  it('registers and retrieves a tenant by ID', () => {
    registerTenant(sampleTenant);
    const found = getTenantById('tenant-abc');
    expect(found).toBeDefined();
    expect(found!.shopDomain).toBe('mystore.myshopify.com');
  });

  it('retrieves a tenant by primary shopDomain', () => {
    registerTenant(sampleTenant);
    const found = getTenantByDomain('mystore.myshopify.com');
    expect(found).toBeDefined();
    expect(found!.id).toBe('tenant-abc');
  });

  it('retrieves a tenant by secondary domain', () => {
    registerTenant(sampleTenant);
    const found = getTenantByDomain('mystore.co.uk');
    expect(found).toBeDefined();
    expect(found!.id).toBe('tenant-abc');
  });

  it('normalizes www prefix when looking up by domain', () => {
    registerTenant(sampleTenant);
    const found = getTenantByDomain('www.mystore.com');
    expect(found).toBeDefined();
    expect(found!.id).toBe('tenant-abc');
  });

  it('returns undefined for unknown tenant ID', () => {
    expect(getTenantById('unknown')).toBeUndefined();
  });

  it('returns undefined for unknown domain', () => {
    registerTenant(sampleTenant);
    expect(getTenantByDomain('unknown.com')).toBeUndefined();
  });

  it('lists all registered tenants', () => {
    registerTenant(sampleTenant);
    const tenants = listTenants();
    expect(tenants).toHaveLength(1);
    expect(tenants[0].id).toBe('tenant-abc');
  });
});
