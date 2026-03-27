import request from 'supertest';
import app from '../../app';
import { registerTenant, clearTenantRegistry } from '../../services/tenantService';
import { clearDeduplicationStore } from '../../services/deduplicationService';
import { clearIdentityStore } from '../../services/identityService';
import * as metaCapiService from '../../services/metaCapiService';
import { Tenant } from '../../models/Tenant';

jest.mock('../../services/metaCapiService');

const mockSendToMetaCAPI = metaCapiService.sendToMetaCAPI as jest.MockedFunction<
  typeof metaCapiService.sendToMetaCAPI
>;

const testTenant: Tenant = {
  id: 'test-tenant-id',
  shopDomain: 'teststore.myshopify.com',
  domains: ['teststore.com'],
  metaPixelId: 'pixel-123',
  metaAccessToken: 'access-token-abc',
  enabled: true,
  createdAt: new Date(),
};

describe('Events API', () => {
  beforeEach(() => {
    clearTenantRegistry();
    clearDeduplicationStore();
    clearIdentityStore();
    registerTenant(testTenant);
    mockSendToMetaCAPI.mockClear();
    mockSendToMetaCAPI.mockResolvedValue(undefined);
  });

  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/events with valid payload returns 200', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', 'Bearer test-tenant-id')
      .send({
        eventName: 'Purchase',
        eventId: 'evt-001',
        eventSourceUrl: 'https://teststore.com/checkout',
        userData: { email: 'customer@example.com' },
        orderValue: 99.99,
        currency: 'USD',
        orderId: 'order-123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deduplicated).toBe(false);
    expect(mockSendToMetaCAPI).toHaveBeenCalledTimes(1);
  });

  it('POST /api/events deduplicates repeated events', async () => {
    const payload = {
      eventName: 'Purchase',
      eventId: 'evt-dup-001',
      eventSourceUrl: 'https://teststore.com/checkout',
      userData: { email: 'dup@example.com' },
    };

    await request(app)
      .post('/api/events')
      .set('Authorization', 'Bearer test-tenant-id')
      .send(payload);

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', 'Bearer test-tenant-id')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.deduplicated).toBe(true);
    expect(mockSendToMetaCAPI).toHaveBeenCalledTimes(1);
  });

  it('POST /api/events returns 401 without Authorization header', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ eventName: 'PageView', eventSourceUrl: 'https://teststore.com' });
    expect(res.status).toBe(401);
  });

  it('POST /api/events returns 400 if eventName is missing', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', 'Bearer test-tenant-id')
      .send({ eventSourceUrl: 'https://teststore.com' });
    expect(res.status).toBe(400);
  });

  it('POST /api/events returns 400 if eventSourceUrl is missing', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', 'Bearer test-tenant-id')
      .send({ eventName: 'PageView' });
    expect(res.status).toBe(400);
  });
});

describe('Tenants API', () => {
  beforeEach(() => {
    clearTenantRegistry();
  });

  it('POST /api/tenants creates a new tenant', async () => {
    const res = await request(app)
      .post('/api/tenants')
      .send({ shopDomain: 'newstore.myshopify.com' });
    expect(res.status).toBe(201);
    expect(res.body.shopDomain).toBe('newstore.myshopify.com');
    expect(res.body.id).toBeTruthy();
  });

  it('POST /api/tenants returns 400 if shopDomain is missing', async () => {
    const res = await request(app).post('/api/tenants').send({});
    expect(res.status).toBe(400);
  });
});
