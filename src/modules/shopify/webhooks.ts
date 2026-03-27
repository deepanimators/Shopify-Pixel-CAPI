import type { IncomingHttpHeaders } from "node:http";

import type { PlatformRepository } from "../platform/repository.js";
import { verifyWebhookHmac } from "./hmac.js";

export class ShopifyWebhookService {
  constructor(private readonly platformRepository: PlatformRepository) {}

  async handle(headers: IncomingHttpHeaders, rawBody: Buffer) {
    const topic = String(headers["x-shopify-topic"] ?? "");
    const shopDomain = String(headers["x-shopify-shop-domain"] ?? "");
    const verified = verifyWebhookHmac(rawBody, headers["x-shopify-hmac-sha256"]);

    await this.platformRepository.recordWebhook({
      topic,
      shopDomain,
      receivedAt: new Date().toISOString(),
      verified
    });

    if (!verified) {
      return {
        verified: false,
        handled: false,
        statusCode: 401
      };
    }

    if (topic === "app/uninstalled") {
      await this.platformRepository.markUninstalled(shopDomain);
    }

    return {
      verified: true,
      handled: true,
      statusCode: 200
    };
  }
}
