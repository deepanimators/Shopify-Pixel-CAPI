import type { Pool, PoolClient } from "pg";

import type { PlatformRepository } from "./repository.js";
import type {
  DestinationConfigs,
  DestinationScope,
  MetaConnection,
  ShopInstallation,
  Tenant,
  TenantDomain,
  TenantMarket,
  TenantTrackingConfig,
  WebhookReceipt
} from "./types.js";

type TenantRow = {
  tenant_id: string;
  display_name: string;
  shop_domain: string;
  plan_id: string;
  status: Tenant["status"];
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresPlatformRepository implements PlatformRepository {
  constructor(private readonly pool: Pool) {}

  async listTenants(): Promise<Tenant[]> {
    const result = await this.pool.query<{ tenant_id: string }>(
      `select tenant_id from tenants order by created_at desc`
    );

    const tenants = await Promise.all(
      result.rows.map((row) => this.getTenant(row.tenant_id))
    );

    return tenants.filter((tenant): tenant is Tenant => tenant !== null);
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    const result = await this.pool.query<TenantRow>(
      `select tenant_id, display_name, shop_domain, plan_id, status, created_at, updated_at
       from tenants
       where tenant_id = $1
       limit 1`,
      [tenantId]
    );

    if (!result.rowCount) {
      return null;
    }

    return this.hydrateTenant(result.rows[0]);
  }

  async getTenantByShopDomain(shopDomain: string): Promise<Tenant | null> {
    const direct = await this.pool.query<{ tenant_id: string }>(
      `select tenant_id from tenants where shop_domain = $1 limit 1`,
      [shopDomain]
    );

    if (direct.rowCount) {
      return this.getTenant(direct.rows[0].tenant_id);
    }

    const installation = await this.pool.query<{ tenant_id: string }>(
      `select tenant_id from shop_installations where shop_domain = $1 limit 1`,
      [shopDomain]
    );

    if (!installation.rowCount) {
      return null;
    }

    return this.getTenant(installation.rows[0].tenant_id);
  }

  async listInstallations(): Promise<ShopInstallation[]> {
    const result = await this.pool.query<{
      shop_domain: string;
      tenant_id: string;
      access_token: string | null;
      scopes: string[];
      status: ShopInstallation["status"];
      installed_at: Date | string;
      uninstalled_at: Date | string | null;
    }>(
      `select shop_domain, tenant_id, access_token, scopes, status, installed_at, uninstalled_at
       from shop_installations
       order by installed_at desc`
    );

    return result.rows.map(mapInstallationRow);
  }

  async getInstallation(shopDomain: string): Promise<ShopInstallation | null> {
    const result = await this.pool.query<{
      shop_domain: string;
      tenant_id: string;
      access_token: string | null;
      scopes: string[];
      status: ShopInstallation["status"];
      installed_at: Date | string;
      uninstalled_at: Date | string | null;
    }>(
      `select shop_domain, tenant_id, access_token, scopes, status, installed_at, uninstalled_at
       from shop_installations
       where shop_domain = $1
       limit 1`,
      [shopDomain]
    );

    if (!result.rowCount) {
      return null;
    }

    return mapInstallationRow(result.rows[0]);
  }

  async saveInstallation(installation: ShopInstallation): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await ensureTenantExists(client, installation.tenantId, installation.shopDomain);
      await client.query(
        `insert into shop_installations (
          shop_domain,
          tenant_id,
          access_token,
          scopes,
          status,
          installed_at,
          uninstalled_at
        ) values (
          $1, $2, $3, $4::text[], $5, $6::timestamptz, $7::timestamptz
        )
        on conflict (shop_domain) do update set
          tenant_id = excluded.tenant_id,
          access_token = excluded.access_token,
          scopes = excluded.scopes,
          status = excluded.status,
          installed_at = excluded.installed_at,
          uninstalled_at = excluded.uninstalled_at`,
        [
          installation.shopDomain,
          installation.tenantId,
          installation.accessToken ?? null,
          installation.scopes,
          installation.status,
          installation.installedAt,
          installation.uninstalledAt ?? null
        ]
      );
      await touchTenant(client, installation.tenantId);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async markUninstalled(shopDomain: string): Promise<void> {
    const result = await this.pool.query<{ tenant_id: string }>(
      `update shop_installations
       set status = 'uninstalled',
           uninstalled_at = now()
       where shop_domain = $1
       returning tenant_id`,
      [shopDomain]
    );

    if (result.rowCount) {
      await this.pool.query(`update tenants set updated_at = now() where tenant_id = $1`, [
        result.rows[0].tenant_id
      ]);
    }
  }

  async upsertMetaConnection(tenantId: string, connection: MetaConnection): Promise<Tenant | null> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      return null;
    }

    await this.pool.query(
      `insert into meta_connections (
        tenant_id,
        pixel_id,
        access_token,
        test_event_code,
        enabled,
        last_validated_at
      ) values ($1, $2, $3, $4, $5, $6::timestamptz)
      on conflict (tenant_id) do update set
        pixel_id = excluded.pixel_id,
        access_token = excluded.access_token,
        test_event_code = excluded.test_event_code,
        enabled = excluded.enabled,
        last_validated_at = excluded.last_validated_at`,
      [
        tenantId,
        connection.pixelId,
        connection.accessToken,
        connection.testEventCode ?? null,
        connection.enabled,
        connection.lastValidatedAt ?? null
      ]
    );

    await this.pool.query(`update tenants set updated_at = now() where tenant_id = $1`, [tenantId]);

    return this.getTenant(tenantId);
  }

  async updateTrackingConfig(
    tenantId: string,
    tracking: TenantTrackingConfig
  ): Promise<Tenant | null> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      return null;
    }

    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await client.query(
        `insert into tenant_tracking_configs (tenant_id, created_at, updated_at)
         values ($1, now(), now())
         on conflict (tenant_id) do update set updated_at = now()`,
        [tenantId]
      );
      await client.query(`delete from tenant_enabled_scenarios where tenant_id = $1`, [tenantId]);
      await client.query(`delete from tenant_custom_event_mappings where tenant_id = $1`, [tenantId]);

      for (const scenarioId of tracking.enabledScenarioIds) {
        await client.query(
          `insert into tenant_enabled_scenarios (
             tenant_id,
             scenario_id,
             enabled,
             created_at,
             updated_at
           ) values ($1, $2, true, now(), now())`,
          [tenantId, scenarioId]
        );
      }

      for (const mapping of tracking.customEventMappings) {
        await client.query(
          `insert into tenant_custom_event_mappings (
            tenant_id,
            source_name,
            scenario_id,
            enabled,
            created_at,
            updated_at
          ) values ($1, $2, $3, $4, now(), now())`,
          [tenantId, mapping.sourceName, mapping.scenarioId, mapping.enabled]
        );
      }

      await touchTenant(client, tenantId);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    return this.getTenant(tenantId);
  }

  async updateDestinationConfigs(
    tenantId: string,
    destinationConfigs: DestinationConfigs
  ): Promise<Tenant | null> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      return null;
    }

    const merged: DestinationConfigs = {
      ...tenant.destinations,
      meta: destinationConfigs.meta
        ? {
            ...tenant.destinations.meta,
            ...destinationConfigs.meta
          }
        : tenant.destinations.meta,
      ga4: destinationConfigs.ga4
        ? {
            ...tenant.destinations.ga4,
            ...destinationConfigs.ga4
          }
        : tenant.destinations.ga4,
      googleAds: destinationConfigs.googleAds
        ? {
            ...tenant.destinations.googleAds,
            ...destinationConfigs.googleAds
          }
        : tenant.destinations.googleAds,
      tiktok: destinationConfigs.tiktok
        ? {
            ...tenant.destinations.tiktok,
            ...destinationConfigs.tiktok
          }
        : tenant.destinations.tiktok
    };

    const client = await this.pool.connect();

    try {
      await client.query("begin");

      if (destinationConfigs.meta && merged.meta) {
        await client.query(
          `insert into meta_connections (
            tenant_id,
            pixel_id,
            access_token,
            test_event_code,
            enabled,
            last_validated_at
          ) values ($1, $2, $3, $4, $5, $6::timestamptz)
          on conflict (tenant_id) do update set
            pixel_id = excluded.pixel_id,
            access_token = excluded.access_token,
            test_event_code = excluded.test_event_code,
            enabled = excluded.enabled,
            last_validated_at = excluded.last_validated_at`,
          [
            tenantId,
            merged.meta.pixelId,
            merged.meta.accessToken,
            merged.meta.testEventCode ?? null,
            merged.meta.enabled,
            merged.meta.lastValidatedAt ?? null
          ]
        );
      }

      if (destinationConfigs.ga4 && merged.ga4) {
        await client.query(
          `insert into ga4_connections (
            tenant_id,
            measurement_id,
            api_secret,
            debug_mode,
            enabled,
            last_validated_at
          ) values ($1, $2, $3, $4, $5, $6::timestamptz)
          on conflict (tenant_id) do update set
            measurement_id = excluded.measurement_id,
            api_secret = excluded.api_secret,
            debug_mode = excluded.debug_mode,
            enabled = excluded.enabled,
            last_validated_at = excluded.last_validated_at`,
          [
            tenantId,
            merged.ga4.measurementId,
            merged.ga4.apiSecret,
            merged.ga4.debugMode ?? false,
            merged.ga4.enabled,
            merged.ga4.lastValidatedAt ?? null
          ]
        );
      }

      if (destinationConfigs.googleAds && merged.googleAds) {
        await client.query(
          `insert into google_ads_connections (
            tenant_id,
            customer_id,
            conversion_action_id,
            login_customer_id,
            developer_token,
            refresh_token,
            client_id,
            client_secret,
            transport,
            enabled,
            last_validated_at
          ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::timestamptz)
          on conflict (tenant_id) do update set
            customer_id = excluded.customer_id,
            conversion_action_id = excluded.conversion_action_id,
            login_customer_id = excluded.login_customer_id,
            developer_token = excluded.developer_token,
            refresh_token = excluded.refresh_token,
            client_id = excluded.client_id,
            client_secret = excluded.client_secret,
            transport = excluded.transport,
            enabled = excluded.enabled,
            last_validated_at = excluded.last_validated_at`,
          [
            tenantId,
            merged.googleAds.customerId,
            merged.googleAds.conversionActionId,
            merged.googleAds.loginCustomerId ?? null,
            merged.googleAds.developerToken ?? null,
            merged.googleAds.refreshToken ?? null,
            merged.googleAds.clientId ?? null,
            merged.googleAds.clientSecret ?? null,
            merged.googleAds.transport ?? "preview",
            merged.googleAds.enabled,
            merged.googleAds.lastValidatedAt ?? null
          ]
        );
      }

      if (destinationConfigs.tiktok && merged.tiktok) {
        await client.query(
          `insert into tiktok_connections (
            tenant_id,
            pixel_code,
            access_token,
            test_event_code,
            endpoint,
            enabled,
            last_validated_at
          ) values ($1, $2, $3, $4, $5, $6, $7::timestamptz)
          on conflict (tenant_id) do update set
            pixel_code = excluded.pixel_code,
            access_token = excluded.access_token,
            test_event_code = excluded.test_event_code,
            endpoint = excluded.endpoint,
            enabled = excluded.enabled,
            last_validated_at = excluded.last_validated_at`,
          [
            tenantId,
            merged.tiktok.pixelCode,
            merged.tiktok.accessToken ?? null,
            merged.tiktok.testEventCode ?? null,
            merged.tiktok.endpoint ?? null,
            merged.tiktok.enabled,
            merged.tiktok.lastValidatedAt ?? null
          ]
        );
      }

      await touchTenant(client, tenantId);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    return this.getTenant(tenantId);
  }

  async upsertDestinationScope(tenantId: string, scope: DestinationScope): Promise<Tenant | null> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      return null;
    }

    await this.pool.query(
      `insert into tenant_destination_overrides (
        tenant_id,
        scope_type,
        scope_id,
        label,
        domain_host,
        market_id,
        destinations,
        created_at,
        updated_at
      ) values ($1, $2, $3, $4, $5, $6, $7::jsonb, now(), now())
      on conflict (tenant_id, scope_type, scope_id) do update set
        label = excluded.label,
        domain_host = excluded.domain_host,
        market_id = excluded.market_id,
        destinations = excluded.destinations,
        updated_at = now()`,
      [
        tenantId,
        scope.scopeType,
        scope.scopeId,
        scope.label,
        scope.domainHost ?? null,
        scope.marketId ?? null,
        JSON.stringify(scope.destinations ?? {})
      ]
    );

    await this.pool.query(`update tenants set updated_at = now() where tenant_id = $1`, [tenantId]);

    return this.getTenant(tenantId);
  }

  async deleteDestinationScope(
    tenantId: string,
    scopeType: DestinationScope["scopeType"],
    scopeId: string
  ): Promise<Tenant | null> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      return null;
    }

    await this.pool.query(
      `delete from tenant_destination_overrides
       where tenant_id = $1 and scope_type = $2 and scope_id = $3`,
      [tenantId, scopeType, scopeId]
    );
    await this.pool.query(`update tenants set updated_at = now() where tenant_id = $1`, [tenantId]);

    return this.getTenant(tenantId);
  }

  async recordWebhook(receipt: WebhookReceipt): Promise<void> {
    await this.pool.query(
      `insert into webhook_receipts (topic, shop_domain, verified, received_at, payload)
       values ($1, $2, $3, $4::timestamptz, null)`,
      [receipt.topic, receipt.shopDomain, receipt.verified, receipt.receivedAt]
    );
  }

  async listWebhooks(limit: number): Promise<WebhookReceipt[]> {
    const result = await this.pool.query<{
      topic: string;
      shop_domain: string;
      verified: boolean;
      received_at: Date | string;
    }>(
      `select topic, shop_domain, verified, received_at
       from webhook_receipts
       order by received_at desc
       limit $1`,
      [limit]
    );

    return result.rows.map((row) => ({
      topic: row.topic,
      shopDomain: row.shop_domain,
      verified: row.verified,
      receivedAt: toIso(row.received_at)
    }));
  }

  private async hydrateTenant(row: TenantRow): Promise<Tenant> {
    const [supportedDomains, supportedMarkets, destinations, destinationScopes, tracking] =
      await Promise.all([
      this.loadDomains(row.tenant_id),
      this.loadMarkets(row.tenant_id),
      this.loadDestinations(row.tenant_id),
      this.loadDestinationScopes(row.tenant_id),
      this.loadTracking(row.tenant_id)
      ]);

    return {
      tenantId: row.tenant_id,
      displayName: row.display_name,
      shopDomain: row.shop_domain,
      planId: row.plan_id,
      status: row.status,
      supportedDomains,
      supportedMarkets,
      destinations,
      destinationScopes,
      tracking,
      createdAt: toIso(row.created_at),
      updatedAt: toIso(row.updated_at)
    };
  }

  private async loadDomains(tenantId: string): Promise<TenantDomain[]> {
    const result = await this.pool.query<{
      host: string;
      primary: boolean;
      market_id: string | null;
    }>(
      `select host, primary_domain as primary, market_id
       from tenant_domains
       where tenant_id = $1
       order by primary_domain desc, host asc`,
      [tenantId]
    );

    return result.rows.map((row) => ({
      host: row.host,
      primary: row.primary,
      marketId: row.market_id ?? undefined
    }));
  }

  private async loadMarkets(tenantId: string): Promise<TenantMarket[]> {
    const result = await this.pool.query<{
      id: string;
      label: string;
      country_code: string;
      currency_code: string;
      locale: string;
      storefront_domain: string;
    }>(
      `select id, label, country_code, currency_code, locale, storefront_domain
       from tenant_markets
       where tenant_id = $1
       order by label asc`,
      [tenantId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      label: row.label,
      countryCode: row.country_code,
      currencyCode: row.currency_code,
      locale: row.locale,
      storefrontDomain: row.storefront_domain
    }));
  }

  private async loadDestinations(tenantId: string): Promise<DestinationConfigs> {
    const [meta, ga4, googleAds, tiktok] = await Promise.all([
      this.pool.query<{
        pixel_id: string;
        access_token: string;
        test_event_code: string | null;
        enabled: boolean;
        last_validated_at: Date | string | null;
      }>(
        `select pixel_id, access_token, test_event_code, enabled, last_validated_at
         from meta_connections
         where tenant_id = $1
         limit 1`,
        [tenantId]
      ),
      this.pool.query<{
        measurement_id: string;
        api_secret: string;
        debug_mode: boolean;
        enabled: boolean;
        last_validated_at: Date | string | null;
      }>(
        `select measurement_id, api_secret, debug_mode, enabled, last_validated_at
         from ga4_connections
         where tenant_id = $1
         limit 1`,
        [tenantId]
      ),
      this.pool.query<{
        customer_id: string;
        conversion_action_id: string;
        login_customer_id: string | null;
        developer_token: string | null;
        refresh_token: string | null;
        client_id: string | null;
        client_secret: string | null;
        transport: "preview" | "api";
        enabled: boolean;
        last_validated_at: Date | string | null;
      }>(
        `select customer_id, conversion_action_id, login_customer_id, developer_token,
                refresh_token, client_id, client_secret, transport, enabled, last_validated_at
         from google_ads_connections
         where tenant_id = $1
         limit 1`,
        [tenantId]
      ),
      this.pool.query<{
        pixel_code: string;
        access_token: string | null;
        test_event_code: string | null;
        endpoint: string | null;
        enabled: boolean;
        last_validated_at: Date | string | null;
      }>(
        `select pixel_code, access_token, test_event_code, endpoint, enabled, last_validated_at
         from tiktok_connections
         where tenant_id = $1
         limit 1`,
        [tenantId]
      )
    ]);

    return {
      meta: meta.rowCount
        ? {
            pixelId: meta.rows[0].pixel_id,
            accessToken: meta.rows[0].access_token,
            testEventCode: meta.rows[0].test_event_code ?? undefined,
            enabled: meta.rows[0].enabled,
            lastValidatedAt: toNullableIso(meta.rows[0].last_validated_at)
          }
        : undefined,
      ga4: ga4.rowCount
        ? {
            measurementId: ga4.rows[0].measurement_id,
            apiSecret: ga4.rows[0].api_secret,
            debugMode: ga4.rows[0].debug_mode,
            enabled: ga4.rows[0].enabled,
            lastValidatedAt: toNullableIso(ga4.rows[0].last_validated_at)
          }
        : undefined,
      googleAds: googleAds.rowCount
        ? {
            customerId: googleAds.rows[0].customer_id,
            conversionActionId: googleAds.rows[0].conversion_action_id,
            loginCustomerId: googleAds.rows[0].login_customer_id ?? undefined,
            developerToken: googleAds.rows[0].developer_token ?? undefined,
            refreshToken: googleAds.rows[0].refresh_token ?? undefined,
            clientId: googleAds.rows[0].client_id ?? undefined,
            clientSecret: googleAds.rows[0].client_secret ?? undefined,
            transport: googleAds.rows[0].transport,
            enabled: googleAds.rows[0].enabled,
            lastValidatedAt: toNullableIso(googleAds.rows[0].last_validated_at)
          }
        : undefined,
      tiktok: tiktok.rowCount
        ? {
            pixelCode: tiktok.rows[0].pixel_code,
            accessToken: tiktok.rows[0].access_token ?? undefined,
            testEventCode: tiktok.rows[0].test_event_code ?? undefined,
            endpoint: tiktok.rows[0].endpoint ?? undefined,
            enabled: tiktok.rows[0].enabled,
            lastValidatedAt: toNullableIso(tiktok.rows[0].last_validated_at)
          }
        : undefined
    };
  }

  private async loadTracking(tenantId: string): Promise<TenantTrackingConfig> {
    const [enabledScenarios, customMappings] = await Promise.all([
      this.pool.query<{ scenario_id: string }>(
        `select scenario_id
         from tenant_enabled_scenarios
         where tenant_id = $1 and enabled = true
         order by scenario_id asc`,
        [tenantId]
      ),
      this.pool.query<{ source_name: string; scenario_id: string; enabled: boolean }>(
        `select source_name, scenario_id, enabled
         from tenant_custom_event_mappings
         where tenant_id = $1
         order by source_name asc`,
        [tenantId]
      )
    ]);

    return {
      enabledScenarioIds: enabledScenarios.rows.map((row) => row.scenario_id),
      customEventMappings: customMappings.rows.map((row) => ({
        sourceName: row.source_name,
        scenarioId: row.scenario_id,
        enabled: row.enabled
      }))
    };
  }

  private async loadDestinationScopes(tenantId: string): Promise<DestinationScope[]> {
    const result = await this.pool.query<{
      scope_type: DestinationScope["scopeType"];
      scope_id: string;
      label: string;
      domain_host: string | null;
      market_id: string | null;
      destinations: unknown;
      updated_at: Date | string;
    }>(
      `select scope_type, scope_id, label, domain_host, market_id, destinations, updated_at
       from tenant_destination_overrides
       where tenant_id = $1
       order by scope_type asc, scope_id asc`,
      [tenantId]
    );

    return result.rows.map((row) => ({
      scopeType: row.scope_type,
      scopeId: row.scope_id,
      label: row.label,
      domainHost: row.domain_host ?? undefined,
      marketId: row.market_id ?? undefined,
      destinations: parseDestinationConfigs(row.destinations),
      updatedAt: toIso(row.updated_at)
    }));
  }
}

function mapInstallationRow(row: {
  shop_domain: string;
  tenant_id: string;
  access_token: string | null;
  scopes: string[];
  status: ShopInstallation["status"];
  installed_at: Date | string;
  uninstalled_at: Date | string | null;
}): ShopInstallation {
  return {
    shopDomain: row.shop_domain,
    tenantId: row.tenant_id,
    accessToken: row.access_token ?? undefined,
    scopes: row.scopes,
    status: row.status,
    installedAt: toIso(row.installed_at),
    uninstalledAt: toNullableIso(row.uninstalled_at)
  };
}

async function ensureTenantExists(client: PoolClient, tenantId: string, shopDomain?: string) {
  const resolvedShopDomain = shopDomain ?? `${tenantId}.myshopify.com`;

  await client.query(
    `insert into tenants (
      tenant_id,
      display_name,
      shop_domain,
      plan_id,
      status,
      created_at,
      updated_at
    ) values ($1, $2, $3, 'starter', 'trial', now(), now())
    on conflict (tenant_id) do update set
      shop_domain = excluded.shop_domain,
      updated_at = now()`,
    [tenantId, prettifyTenantName(tenantId), resolvedShopDomain]
  );

  await client.query(
    `insert into tenant_domains (
      tenant_id,
      host,
      primary_domain,
      market_id
    )
    select $1, $2, true, null
    where not exists (
      select 1 from tenant_domains where tenant_id = $1 and host = $2
    )`,
    [tenantId, resolvedShopDomain]
  );
}

async function touchTenant(client: PoolClient, tenantId: string) {
  await client.query(`update tenants set updated_at = now() where tenant_id = $1`, [tenantId]);
}

function prettifyTenantName(tenantId: string) {
  return tenantId
    .split(/[-_]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toNullableIso(value: Date | string | null) {
  return value ? toIso(value) : undefined;
}

function parseDestinationConfigs(value: unknown): DestinationConfigs {
  if (!value) {
    return {};
  }

  if (typeof value === "string") {
    return JSON.parse(value) as DestinationConfigs;
  }

  return value as DestinationConfigs;
}
