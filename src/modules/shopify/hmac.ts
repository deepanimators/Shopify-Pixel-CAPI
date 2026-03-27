import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "../../config/env.js";

export function normalizeShopDomain(shop: string) {
  return shop.trim().toLowerCase();
}

export function isValidShopDomain(shop: string) {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(normalizeShopDomain(shop));
}

export function verifyWebhookHmac(rawBody: Buffer, hmacHeader?: string | string[]) {
  if (!env.SHOPIFY_API_SECRET || !hmacHeader || Array.isArray(hmacHeader)) {
    return false;
  }

  const digest = createHmac("sha256", env.SHOPIFY_API_SECRET).update(rawBody).digest("base64");
  return safeCompare(digest, hmacHeader);
}

export function verifyOAuthHmac(params: URLSearchParams) {
  if (!env.SHOPIFY_API_SECRET) {
    return false;
  }

  const hmac = params.get("hmac");
  if (!hmac) {
    return false;
  }

  const message = [...params.entries()]
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const digest = createHmac("sha256", env.SHOPIFY_API_SECRET).update(message).digest("hex");

  return safeCompare(digest, hmac);
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
