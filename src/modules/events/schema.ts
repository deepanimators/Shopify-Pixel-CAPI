import { z } from "zod";

import { SHOPIFY_STANDARD_EVENTS } from "./catalog.js";

const eventNameSchema = z.union([
  z.enum(SHOPIFY_STANDARD_EVENTS),
  z.enum([
    "page_view",
    "product_view",
    "add_to_cart",
    "remove_from_cart",
    "begin_checkout",
    "purchase"
  ]),
  z.string().regex(/^custom:/)
]);

export const incomingEventSchema = z.object({
  tenantId: z.string().min(1).optional(),
  shopDomain: z.string().min(1),
  eventName: eventNameSchema,
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
      currency: z.string().length(3).optional(),
      subtotal: z.number().nonnegative().optional(),
      discount: z.number().nonnegative().optional(),
      shipping: z.number().nonnegative().optional(),
      tax: z.number().nonnegative().optional()
    })
    .optional(),
  lineItems: z
    .array(
      z.object({
        productId: z.string().optional(),
        variantId: z.string().optional(),
        sku: z.string().optional(),
        title: z.string().optional(),
        quantity: z.number().positive().optional(),
        price: z.number().nonnegative().optional(),
        currency: z.string().length(3).optional()
      })
    )
    .optional(),
  consent: z
    .object({
      analytics: z.boolean().optional(),
      marketing: z.boolean().optional(),
      preferences: z.boolean().optional(),
      saleOfData: z.boolean().optional()
    })
    .optional(),
  properties: z.record(z.unknown()).optional(),
  page: z.object({
    url: z.string().url(),
    referrer: z.string().url().optional()
  })
});

export type IncomingEventInput = z.infer<typeof incomingEventSchema>;
