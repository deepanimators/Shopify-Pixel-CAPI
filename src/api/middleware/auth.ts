import { Request, Response, NextFunction } from 'express';
import { getTenantById } from '../../services/tenantService';

/**
 * Middleware to validate that the request carries a known tenant API key.
 * The API key is expected in the Authorization header as Bearer <tenantId>.
 * In production, replace with a real token/secret verification.
 */
export function authenticateTenant(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const tenantId = authHeader.slice(7).trim();
  const tenant = getTenantById(tenantId);

  if (!tenant) {
    res.status(401).json({ error: 'Unknown tenant' });
    return;
  }

  if (!tenant.enabled) {
    res.status(403).json({ error: 'Tenant is disabled' });
    return;
  }

  // Attach tenant ID to request for downstream handlers
  (req as Request & { tenantId: string }).tenantId = tenantId;
  next();
}
