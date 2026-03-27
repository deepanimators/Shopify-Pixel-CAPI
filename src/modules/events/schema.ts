import { z } from "zod";

export const incomingEventSchema = z.object({
  tenantId: z.string().min(1),
  shopDomain: z.string().min(1),
  eventName: z.enum([
    "page_view",
    "product_view",
    "add_to_cart",
    "begin_checkout",
    "purchase"
  ]),
  source: z.enum(["browser", "server"]),
  eventId: z.string().optional(),
  browserEventId: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
  market: z.object({
    countryCode: z.string().length(2),
    currencyCode: z.string().length(3),
    marketId: z.string().optional(),
    domain: z.string().optional()
  }),
  user: z.object({
    anonymousId: z.string().optional(),
    customerId: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    externalId: z.string().optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional()
  }),
  commerce: z
    .object({
      cartId: z.string().optional(),
      checkoutId: z.string().optional(),
      orderId: z.string().optional(),
      value: z.number().nonnegative().optional(),
      currency: z.string().length(3).optional()
    })
    .optional(),
  page: z.object({
    url: z.string().url(),
    referrer: z.string().url().optional()
  })
});

export type IncomingEventInput = z.infer<typeof incomingEventSchema>;
