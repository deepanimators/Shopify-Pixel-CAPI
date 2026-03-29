import { randomUUID } from "node:crypto";

import { env } from "../../config/env.js";
import type { PlatformRepository } from "../platform/repository.js";
import type { AuthCallbackResult, InstallStart } from "./types.js";
import { isValidShopDomain, normalizeShopDomain, verifyOAuthHmac } from "./hmac.js";

export class ShopifyAuthService {
  private readonly stateStore = new Set<string>();

  constructor(private readonly platformRepository: PlatformRepository) {}

  createInstallStart(shop: string): InstallStart {
    const normalizedShop = normalizeShopDomain(shop);

    if (!isValidShopDomain(normalizedShop)) {
      throw new Error("Shop domain must be a valid *.myshopify.com domain");
    }

    const state = randomUUID();
    this.stateStore.add(state);

    const params = new URLSearchParams({
      client_id: env.SHOPIFY_API_KEY ?? "",
      scope: env.SHOPIFY_SCOPES,
      redirect_uri: `${env.SHOPIFY_APP_URL}/auth/callback`,
      state
    });

    return {
      shop: normalizedShop,
      state,
      installUrl: `https://${normalizedShop}/admin/oauth/authorize?${params.toString()}`
    };
  }

  async handleCallback(query: URLSearchParams): Promise<AuthCallbackResult> {
    const shop = normalizeShopDomain(query.get("shop") ?? "");
    const state = query.get("state") ?? "";
    const code = query.get("code") ?? "";

    if (!isValidShopDomain(shop)) {
      throw new Error("Missing or invalid shop parameter");
    }

    if (!verifyOAuthHmac(query)) {
      throw new Error("Invalid OAuth HMAC signature");
    }

    if (!this.stateStore.has(state)) {
      throw new Error("Invalid or expired OAuth state");
    }

    this.stateStore.delete(state);

    const accessToken = await this.exchangeAccessToken(shop, code);
    const installation = {
      shopDomain: shop,
      tenantId: shop.replace(".myshopify.com", ""),
      accessToken,
      scopes: env.SHOPIFY_SCOPES.split(","),
      status: accessToken ? "installed" : "pending",
      installedAt: new Date().toISOString()
    } as const;

    await this.platformRepository.saveInstallation(installation);

    return {
      shop,
      tenantId: installation.tenantId,
      state,
      accessToken,
      status: accessToken ? "installed" : "pending_configuration"
    };
  }

  private async exchangeAccessToken(shop: string, code: string) {
    if (!env.SHOPIFY_API_KEY || !env.SHOPIFY_API_SECRET || !code) {
      return undefined;
    }

    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: env.SHOPIFY_API_KEY,
        client_secret: env.SHOPIFY_API_SECRET,
        code
      })
    });

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as { access_token?: string };
    return payload.access_token;
  }
}
