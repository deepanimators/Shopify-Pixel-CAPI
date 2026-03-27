import { Router, Request, Response } from 'express';
import { generateUUID } from '../../utils/hash';
import { EventPayload } from '../../models/Event';
import { processEvent } from '../../services/eventService';
import { authenticateTenant } from '../middleware/auth';

const router = Router();

/**
 * POST /api/events
 * Ingest a tracking event from a Shopify storefront.
 */
router.post(
  '/',
  authenticateTenant,
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as Partial<EventPayload>;

    if (!body.eventName) {
      res.status(400).json({ error: 'eventName is required' });
      return;
    }

    if (!body.eventSourceUrl) {
      res.status(400).json({ error: 'eventSourceUrl is required' });
      return;
    }

    const tenantId = (req as Request & { tenantId: string }).tenantId;

    const payload: EventPayload = {
      eventName: body.eventName,
      eventId: body.eventId ?? generateUUID(),
      eventSourceUrl: body.eventSourceUrl,
      eventTime: body.eventTime ?? Math.floor(Date.now() / 1000),
      tenantId,
      domain: body.domain ?? new URL(body.eventSourceUrl).hostname,
      userData: body.userData ?? {},
      market: body.market,
      products: body.products,
      orderValue: body.orderValue,
      currency: body.currency,
      orderId: body.orderId,
    };

    try {
      const result = await processEvent(payload);
      res.status(200).json(result);
    } catch (err) {
      console.error('Error processing event:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
