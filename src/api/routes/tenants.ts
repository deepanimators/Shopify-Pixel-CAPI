import { Router, Request, Response } from 'express';
import { authenticateTenant } from '../middleware/auth';
import {
  registerTenant,
  getTenantById,
  listTenants,
} from '../../services/tenantService';
import { Tenant } from '../../models/Tenant';
import { generateUUID } from '../../utils/hash';

const router = Router();

/**
 * POST /api/tenants
 * Register a new tenant.
 */
router.post('/', (req: Request, res: Response): void => {
  const body = req.body as Partial<Tenant>;

  if (!body.shopDomain) {
    res.status(400).json({ error: 'shopDomain is required' });
    return;
  }

  const tenant: Tenant = {
    id: body.id ?? generateUUID(),
    shopDomain: body.shopDomain,
    domains: body.domains ?? [],
    metaPixelId: body.metaPixelId,
    metaAccessToken: body.metaAccessToken,
    testEventCode: body.testEventCode,
    enabled: body.enabled ?? true,
    createdAt: new Date(),
  };

  registerTenant(tenant);
  res.status(201).json({ id: tenant.id, shopDomain: tenant.shopDomain });
});

/**
 * GET /api/tenants
 * List all registered tenants (sanitized - no tokens).
 */
router.get('/', authenticateTenant, (_req: Request, res: Response): void => {
  const tenants = listTenants().map(({ metaAccessToken: _, ...t }) => t);
  res.status(200).json(tenants);
});

/**
 * GET /api/tenants/:id
 * Get a specific tenant by ID (sanitized).
 */
router.get(
  '/:id',
  authenticateTenant,
  (req: Request, res: Response): void => {
    const tenant = getTenantById(req.params['id'] as string);
    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }
    const { metaAccessToken: _, ...safe } = tenant;
    res.status(200).json(safe);
  }
);

export default router;
